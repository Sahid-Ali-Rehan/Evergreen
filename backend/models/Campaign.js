const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    bannerImage: {
      type: String,
      required: true
    },

    bannerType: {
      type: String,
      enum: ['upload', 'url'],
      default: 'url'
    },

    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true
        },
        originalPrice: {
          type: Number,
          required: true
        },
        originalDiscount: {
          type: Number,
          default: 0
        },
        campaignDiscount: {
          type: Number,
          default: 0
        },
        finalPrice: {
          type: Number,
          default: 0
        },
        isActiveInCampaign: {
          type: Boolean,
          default: true
        }
      }
    ],

    extraDiscount: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },

    status: {
      type: String,
      enum: ['draft', 'active', 'completed'],
      default: 'draft'
    },

    startTime: {
      type: Date,
      required: true,
      default: Date.now
    },

    endTime: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Default 7 days
    },

    isLaunched: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

/* ----------------------------------------
   PRE-SAVE: PRICE CALCULATION (FIXED BUG)
----------------------------------------- */
campaignSchema.pre('save', function (next) {
  // First set endTime if not set
  if (!this.endTime && this.startTime) {
    this.endTime = new Date(this.startTime.getTime() + 24 * 60 * 60 * 1000); // Default 1 day
  }

  // Update product prices with CORRECT calculation
  if (this.products && this.products.length > 0) {
    this.products = this.products.map((product) => {
      const originalPrice = product.originalPrice || 0;
      const originalDiscount = product.originalDiscount || 0;
      const campaignDiscount = this.extraDiscount || 0;
      
      let priceAfterOriginalDiscount = originalPrice;
      
      // Apply original discount if exists
      if (originalDiscount > 0) {
        priceAfterOriginalDiscount = originalPrice - (originalPrice * originalDiscount / 100);
      }
      
      // Apply campaign discount on the discounted price
      let finalPrice = priceAfterOriginalDiscount;
      if (campaignDiscount > 0) {
        finalPrice = priceAfterOriginalDiscount - (priceAfterOriginalDiscount * campaignDiscount / 100);
      }
      
      return {
        ...product._doc ? product._doc : product,
        campaignDiscount: campaignDiscount,
        finalPrice: Math.round(finalPrice)
      };
    });
  }

  next();
});

/* ----------------------------------------
   METHOD: CHECK IF CAMPAIGN IS ACTIVE
----------------------------------------- */
campaignSchema.methods.isActive = function () {
  const now = new Date();
  return (
    this.status === 'active' &&
    this.isLaunched === true &&
    this.startTime <= now &&
    this.endTime >= now
  );
};

module.exports = mongoose.model('Campaign', campaignSchema);