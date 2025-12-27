const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Campaign = require('../models/Campaign');
const Product = require('../models/Product');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/campaign-banners/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Admin middleware
const isAdmin = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'Authorization token is required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// CORRECTED PRICE CALCULATION FUNCTION
const calculateCampaignPrice = (originalPrice, originalDiscount, campaignDiscount) => {
  // Calculate price after original discount
  let priceAfterOriginalDiscount = originalPrice;
  if (originalDiscount > 0) {
    priceAfterOriginalDiscount = originalPrice - (originalPrice * originalDiscount / 100);
  }
  
  // Calculate final price after campaign discount
  let finalPrice = priceAfterOriginalDiscount;
  if (campaignDiscount > 0) {
    finalPrice = priceAfterOriginalDiscount - (priceAfterOriginalDiscount * campaignDiscount / 100);
  }
  
  return Math.round(finalPrice);
};

// Get all campaigns (admin only)
router.get('/', isAdmin, async (req, res) => {
  try {
    const campaigns = await Campaign.find()
      .populate('products.productId', 'productName price discount images')
      .sort({ createdAt: -1 });
    
    res.status(200).json(campaigns);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get active campaigns for homepage
router.get('/home/active', async (req, res) => {
  try {
    const now = new Date();
    const campaigns = await Campaign.find({
      status: 'active',
      isLaunched: true,
      startTime: { $lte: now },
      endTime: { $gte: now }
    })
    .populate('products.productId', 'productName price discount images availableSizes availableColors stock category description productCode isBestSeller videoUrl sizeChart')
    .sort({ createdAt: -1 })
    .limit(3);
    
    // Calculate final prices
    const campaignsWithPrices = campaigns.map(campaign => {
      const productsWithPrices = campaign.products.map(product => {
        const originalPrice = product.productId.price;
        const originalDiscount = product.productId.discount || 0;
        const campaignDiscount = campaign.extraDiscount;
        
        const finalPrice = calculateCampaignPrice(originalPrice, originalDiscount, campaignDiscount);
        
        return {
          ...product.toObject(),
          productId: {
            ...product.productId.toObject(),
            campaignPrice: finalPrice,
            campaignDiscount: campaignDiscount,
            totalDiscount: Math.min(100, originalDiscount + campaignDiscount),
            isInCampaign: true
          }
        };
      });
      
      return {
        ...campaign.toObject(),
        products: productsWithPrices,
        isActive: campaign.isActive()
      };
    });
    
    res.status(200).json(campaignsWithPrices);
  } catch (error) {
    console.error('Error fetching active campaigns:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new campaign (FIXED)
router.post('/create', isAdmin, upload.single('bannerImage'), async (req, res) => {
  try {
    const {
      name,
      bannerImage,
      bannerType,
      products,
      extraDiscount,
      startTime,
      endTime,
      status
    } = req.body;

    console.log('Received data:', { name, products, extraDiscount, startTime, endTime, status });

    // Parse products
    let productsArray = [];
    try {
      productsArray = Array.isArray(products) ? products : JSON.parse(products || '[]');
    } catch (e) {
      console.error('Error parsing products:', e);
      return res.status(400).json({ message: 'Invalid products format' });
    }

    if (productsArray.length === 0) {
      return res.status(400).json({ message: 'Please select at least one product' });
    }

    // Validate and get product details
    const productDetails = [];
    for (const productId of productsArray) {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: `Product ${productId} not found` });
      }
      
      const originalPrice = product.price;
      const originalDiscount = product.discount || 0;
      const campaignDiscount = parseInt(extraDiscount) || 0;
      const finalPrice = calculateCampaignPrice(originalPrice, originalDiscount, campaignDiscount);
      
      productDetails.push({
        productId,
        originalPrice,
        originalDiscount,
        campaignDiscount,
        finalPrice,
        isActiveInCampaign: true
      });
    }

    // Handle banner image
    let finalBannerImage = bannerImage;
    if (req.file && bannerType === 'upload') {
      finalBannerImage = `/uploads/campaign-banners/${req.file.filename}`;
    }

    if (!finalBannerImage) {
      return res.status(400).json({ message: 'Banner image is required' });
    }

    // Parse dates
    let parsedStartTime = startTime ? new Date(startTime) : new Date();
    let parsedEndTime = endTime ? new Date(endTime) : new Date(parsedStartTime.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Ensure endTime is after startTime
    if (parsedEndTime <= parsedStartTime) {
      parsedEndTime = new Date(parsedStartTime.getTime() + 24 * 60 * 60 * 1000); // Add 1 day
    }

    const campaign = new Campaign({
      name,
      bannerImage: finalBannerImage,
      bannerType: bannerType || 'url',
      products: productDetails,
      extraDiscount: parseInt(extraDiscount) || 0,
      startTime: parsedStartTime,
      endTime: parsedEndTime,
      status: status || 'draft',
      isLaunched: status === 'active'
    });

    await campaign.save();
    
    res.status(201).json({ 
      message: 'Campaign created successfully', 
      campaign 
    });
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).json({ 
      message: 'Error creating campaign', 
      error: error.message,
      stack: error.stack
    });
  }
});

// Add this route to check if a product is in active campaign
router.get('/check-product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const now = new Date();
    
    // Find active campaign containing this product
    const campaign = await Campaign.findOne({
      status: 'active',
      isLaunched: true,
      startTime: { $lte: now },
      endTime: { $gte: now },
      'products.productId': productId,
      'products.isActiveInCampaign': true
    });

    if (campaign) {
      const campaignProduct = campaign.products.find(p => 
        p.productId.toString() === productId
      );
      
      // Calculate the final price with campaign discount
      const originalPrice = campaignProduct.originalPrice;
      const originalDiscount = campaignProduct.originalDiscount || 0;
      const campaignDiscount = campaign.extraDiscount;
      
      let priceAfterOriginalDiscount = originalPrice;
      if (originalDiscount > 0) {
        priceAfterOriginalDiscount = originalPrice - (originalPrice * originalDiscount / 100);
      }
      
      let finalPrice = priceAfterOriginalDiscount;
      if (campaignDiscount > 0) {
        finalPrice = priceAfterOriginalDiscount - (priceAfterOriginalDiscount * campaignDiscount / 100);
      }
      
      return res.status(200).json({
        isInCampaign: true,
        campaignDiscount: campaignDiscount,
        finalPrice: Math.round(finalPrice),
        campaignId: campaign._id,
        campaignName: campaign.name,
        campaignEndTime: campaign.endTime
      });
    }
    
    res.status(200).json({ 
      isInCampaign: false,
      campaignDiscount: 0,
      finalPrice: null,
      campaignId: null,
      campaignName: null,
      campaignEndTime: null
    });
  } catch (error) {
    console.error('Error checking campaign for product:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Launch campaign
router.put('/launch/:id', isAdmin, async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    
    if (campaign.status === 'completed') {
      return res.status(400).json({ message: 'Cannot launch a completed campaign' });
    }
    
    campaign.status = 'active';
    campaign.isLaunched = true;
    campaign.startTime = new Date();
    
    await campaign.save();
    
    res.status(200).json({ 
      message: 'Campaign launched successfully', 
      campaign 
    });
  } catch (error) {
    console.error('Error launching campaign:', error);
    res.status(500).json({ 
      message: 'Error launching campaign', 
      error: error.message 
    });
  }
});

// Get campaign history
router.get('/history/all', isAdmin, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }

    const campaigns = await Campaign.find(query)
      .populate('products.productId', 'productName price discount')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Campaign.countDocuments(query);
    
    res.status(200).json({
      campaigns,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      totalCampaigns: total
    });
  } catch (error) {
    console.error('Error fetching campaign history:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Get products for campaign selection
router.get('/products/available', isAdmin, async (req, res) => {
  try {
    const { search, category, page = 1, limit = 20 } = req.query;
    let query = {};

    if (search) {
      query.productName = { $regex: search, $options: 'i' };
    }
    if (category) {
      query.category = category;
    }

    const products = await Product.find(query)
      .select('productName price discount images category stock productCode')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(query);
    
    res.status(200).json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      totalProducts: total
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// =============== ADD THESE MISSING ROUTES ===============

// UPDATE Campaign (Missing in your code)
router.put('/:id', isAdmin, async (req, res) => {
  try {
    const {
      name,
      bannerImage,
      bannerImages,
      products,
      extraDiscount,
      startTime,
      endTime,
      status
    } = req.body;

    console.log('Updating campaign:', req.params.id);

    // Parse products
    let productsArray = [];
    try {
      productsArray = Array.isArray(products) ? products : JSON.parse(products || '[]');
    } catch (e) {
      console.error('Error parsing products:', e);
      return res.status(400).json({ message: 'Invalid products format' });
    }

    // Find existing campaign
    let campaign = await Campaign.findById(req.params.id);
    
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Validate products
    if (productsArray.length === 0) {
      return res.status(400).json({ message: 'Please select at least one product' });
    }

    // Get product details
    const productDetails = [];
    for (const productId of productsArray) {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: `Product ${productId} not found` });
      }
      
      const originalPrice = product.price;
      const originalDiscount = product.discount || 0;
      const campaignDiscount = parseInt(extraDiscount) || 0;
      const finalPrice = calculateCampaignPrice(originalPrice, originalDiscount, campaignDiscount);
      
      productDetails.push({
        productId,
        originalPrice,
        originalDiscount,
        campaignDiscount,
        finalPrice,
        isActiveInCampaign: true
      });
    }

    // Handle banner images
    const validBannerImages = bannerImages?.filter(url => url && url.trim() !== '') || [];
    let finalBannerImage = bannerImage;
    
    if (!finalBannerImage && validBannerImages.length > 0) {
      finalBannerImage = validBannerImages[0];
    }

    if (!finalBannerImage) {
      return res.status(400).json({ message: 'Banner image is required' });
    }

    // Update campaign
    campaign.name = name;
    campaign.bannerImage = finalBannerImage;
    campaign.bannerImages = validBannerImages;
    campaign.products = productDetails;
    campaign.extraDiscount = parseInt(extraDiscount) || 0;
    campaign.startTime = new Date(startTime);
    campaign.endTime = new Date(endTime);
    campaign.status = status || 'draft';
    campaign.isLaunched = status === 'active';

    await campaign.save();
    
    res.status(200).json({ 
      message: 'Campaign updated successfully', 
      campaign 
    });
    
  } catch (error) {
    console.error('Error updating campaign:', error);
    res.status(500).json({ 
      message: 'Error updating campaign', 
      error: error.message 
    });
  }
});

// STOP Campaign (Missing in your code but frontend calls it)
router.put('/stop/:id', isAdmin, async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    
    campaign.status = 'completed';
    campaign.isLaunched = false;
    
    await campaign.save();
    
    res.status(200).json({ 
      message: 'Campaign stopped successfully', 
      campaign 
    });
  } catch (error) {
    console.error('Error stopping campaign:', error);
    res.status(500).json({ 
      message: 'Error stopping campaign', 
      error: error.message 
    });
  }
});

// DELETE Campaign (MISSING - This is why delete doesn't work!)
router.delete('/delete/:id', isAdmin, async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Delete the campaign
    await Campaign.findByIdAndDelete(req.params.id);
    
    res.status(200).json({ 
      message: 'Campaign deleted successfully' 
    });
    
  } catch (error) {
    console.error('Error deleting campaign:', error);
    res.status(500).json({ 
      message: 'Error deleting campaign', 
      error: error.message 
    });
  }
});

// Alternative DELETE route (just in case)
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const campaign = await Campaign.findByIdAndDelete(req.params.id);
    
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    
    res.status(200).json({ 
      message: 'Campaign deleted successfully' 
    });
    
  } catch (error) {
    console.error('Error deleting campaign:', error);
    res.status(500).json({ 
      message: 'Error deleting campaign', 
      error: error.message 
    });
  }
});

module.exports = router;