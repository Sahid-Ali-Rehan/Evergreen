import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Helmet } from "react-helmet-async";
import Navbar from "../Navigations/Navbar";
import Footer from "../Footer/Footer";
import { motion, AnimatePresence } from "framer-motion";
import RelatedProduct from "../RelatedProduct/RelatedProduct";
import ReactStars from 'react-rating-stars-component';
import ReactPlayer from 'react-player'; 
import Loading from '../Loading/Loading';
import { 
  FaStar, 
  FaStarHalfAlt, 
  FaRegStar, 
  FaWhatsapp, 
  FaShoppingCart, 
  FaShippingFast, 
  FaExchangeAlt, 
  FaLock, 
  FaExpand, 
  FaHeart, 
  FaShare, 
  FaMinus, 
  FaPlus,
  FaMobileAlt,
  FaCamera,
  FaBatteryFull,
  FaMemory,
  FaSimCard,
  FaWeight,
  FaCheck,
  FaBolt,
  FaTag,
  FaClock,
  FaFire,
  FaPercent
} from 'react-icons/fa';

const SingleProductList = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [campaignData, setCampaignData] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [activeTab, setActiveTab] = useState("description");
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ name: "", rating: 0, comment: "" });
  const [isReviewModalOpen, setReviewModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isImageModalOpen, setImageModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  
  const [showZoom, setShowZoom] = useState(false);
  const [lensPosition, setLensPosition] = useState({ x: 0, y: 0 });
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });

  const topRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [id]);

  // Function to check if product is in campaign
  const checkProductInCampaign = async (productId) => {
    try {
      const response = await fetch(`https://prexo.onrender.com/api/campaigns/check-product/${productId}`);
      if (!response.ok) throw new Error('Failed to check campaign');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error checking campaign:', error);
      return null;
    }
  };

  // Function to calculate price with campaign discount
  // Function to calculate price with campaign discount - FIXED
const calculateCampaignPrice = (basePrice, productDiscount, campaignDiscount) => {
  // If no discount at all
  if (productDiscount <= 0 && campaignDiscount <= 0) {
    return {
      finalPrice: basePrice,
      productDiscountPrice: basePrice,
      campaignDiscountAmount: 0,
      totalDiscountAmount: 0
    };
  }
  
  // First apply product discount
  let priceAfterProductDiscount = basePrice;
  if (productDiscount > 0) {
    const productDiscountAmount = (basePrice * productDiscount) / 100;
    priceAfterProductDiscount = basePrice - productDiscountAmount;
  }
  
  // Then apply campaign discount on the product-discounted price
  let finalPrice = priceAfterProductDiscount;
  let campaignDiscountAmount = 0;
  
  if (campaignDiscount > 0) {
    campaignDiscountAmount = (priceAfterProductDiscount * campaignDiscount) / 100;
    finalPrice = priceAfterProductDiscount - campaignDiscountAmount;
  }
  
  const totalDiscountAmount = (basePrice - finalPrice);
  
  return {
    finalPrice: Math.round(finalPrice),
    productDiscountPrice: Math.round(priceAfterProductDiscount),
    campaignDiscountAmount: Math.round(campaignDiscountAmount),
    totalDiscountAmount: Math.round(totalDiscountAmount)
  };
};

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const apiUrl = `https://prexo.onrender.com/api/products/single/${id}`;

        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error("Failed to fetch product");
        const productData = await response.json();
        
        // Check if product is in any active campaign
        const campaignInfo = await checkProductInCampaign(productData._id);
        
        if (campaignInfo && campaignInfo.isInCampaign) {
          // Product is in campaign, calculate the price with campaign discount
          const priceCalculation = calculateCampaignPrice(
            productData.price,
            productData.discount || 0,
            campaignInfo.campaignDiscount
          );
          
          // Merge campaign data with product data
          setProduct({
            ...productData,
            originalPrice: productData.price,
            productDiscount: productData.discount || 0,
            campaignDiscount: campaignInfo.campaignDiscount,
            campaignFinalPrice: priceCalculation.finalPrice,
            campaignProductDiscountPrice: priceCalculation.productDiscountPrice,
            campaignDiscountAmount: priceCalculation.campaignDiscountAmount,
            totalDiscountAmount: priceCalculation.totalDiscountAmount,
            isInCampaign: true,
            campaignId: campaignInfo.campaignId,
            campaignName: campaignInfo.campaignName,
            campaignEndTime: campaignInfo.campaignEndTime
          });
          
          setCampaignData(campaignInfo);
        } else {
          // Product not in campaign, use regular pricing
          const regularPrice = productData.discount > 0 
            ? productData.price - (productData.price * (productData.discount || 0) / 100)
            : productData.price;
          
          setProduct({
            ...productData,
            originalPrice: productData.price,
            productDiscount: productData.discount || 0,
            campaignDiscount: 0,
            campaignFinalPrice: regularPrice,
            campaignProductDiscountPrice: regularPrice,
            campaignDiscountAmount: 0,
            totalDiscountAmount: productData.discount > 0 ? productData.price - regularPrice : 0,
            isInCampaign: false
          });
        }
        
        setMainImage(productData.images?.[0] || '');
        
        if (productData.availableSizes?.length === 1) {
          setSelectedSize(productData.availableSizes[0].size);
        }
        if (productData.availableColors?.length === 1) {
          setSelectedColor(productData.availableColors[0]);
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error(err.message);
        setIsLoading(false);
        toast.error("Failed to load product details");
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(`https://prexo.onrender.com/api/reviews/${id}`);
        const data = await response.json();
        setReviews(data);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };

    if (product) {
      fetchReviews();
    }
  }, [id, product]);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setContainerDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    
    return () => window.removeEventListener("resize", updateDimensions);
  }, [product]);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const { left, top } = container.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;
    
    const lensWidth = 150;
    const lensHeight = 150;
    let lensX = x - lensWidth / 2;
    let lensY = y - lensHeight / 2;
    
    if (lensX < 0) lensX = 0;
    if (lensY < 0) lensY = 0;
    if (lensX + lensWidth > containerDimensions.width) lensX = containerDimensions.width - lensWidth;
    if (lensY + lensHeight > containerDimensions.height) lensY = containerDimensions.height - lensHeight;
    
    setLensPosition({ x: lensX, y: lensY });
  };

  const handleRatingChange = (newRating) => {
    setNewReview((prev) => ({ ...prev, rating: newRating }));
  };

  const handleAddReview = async () => {
    if (!newReview.name || !newReview.rating || !newReview.comment) {
      toast.error("All fields are required.");
      return;
    }

    try {
      const response = await fetch(`https://prexo.onrender.com/api/reviews/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newReview, productId: id }),
      });

      if (!response.ok) throw new Error("Error adding review");

      const data = await response.json();
      setReviews((prev) => [...prev, data.review]);
      setNewReview({ name: "", rating: 0, comment: "" });
      toast.success("Review added successfully!");
      setReviewModalOpen(false);
    } catch (error) {
      toast.error("Failed to add review.");
    }
  };

  const toggleReviewModal = () => setReviewModalOpen((prev) => !prev);
  
  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast.success(isFavorite ? "Removed from favorites" : "Added to favorites!");
  };

  const openImageModal = (index) => {
    setCurrentImageIndex(index);
    setImageModalOpen(true);
  };

  const navigateImages = (direction) => {
    if (direction === 'next') {
      setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
    } else {
      setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
    }
  };

  const shareProduct = () => {
    const shareUrl = product ? `https://jonabbd.com/product/${id}` : window.location.href;
    
    if (navigator.share) {
      navigator.share({
        title: product.productName,
        text: 'Check out this amazing smartphone!',
        url: shareUrl,
      })
      .then(() => toast.success('Product shared successfully!'))
      .catch((error) => toast.error('Error sharing product'));
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied to clipboard!');
    }
  };

  // Calculate price with size variation
  const calculatePrice = () => {
    if (!product) return {
      currentPrice: 0,
      originalPrice: 0,
      productDiscountAmount: 0,
      campaignDiscountAmount: 0,
      totalSavings: 0
    };

    // Get base price for selected size
    const sizeObject = product.availableSizes?.find(sizeObj => sizeObj.size === selectedSize);
    const basePrice = sizeObject?.sizePrice || product.originalPrice || product.price || 0;
    
    // If product is in campaign, use campaign calculation
    if (product.isInCampaign && product.campaignDiscount > 0) {
      const priceCalculation = calculateCampaignPrice(
        basePrice,
        product.productDiscount || 0,
        product.campaignDiscount
      );
      
      return {
        currentPrice: priceCalculation.finalPrice,
        originalPrice: basePrice,
        productDiscountPrice: priceCalculation.productDiscountPrice,
        productDiscountAmount: basePrice - priceCalculation.productDiscountPrice,
        campaignDiscountAmount: priceCalculation.campaignDiscountAmount,
        totalSavings: priceCalculation.totalDiscountAmount,
        isInCampaign: true
      };
    } else {
      // Regular price calculation
      const productDiscount = product.productDiscount || 0;
      const discountedPrice = productDiscount > 0 
        ? basePrice - (basePrice * productDiscount / 100)
        : basePrice;
      
      return {
        currentPrice: Math.round(discountedPrice),
        originalPrice: basePrice,
        productDiscountPrice: discountedPrice,
        productDiscountAmount: productDiscount > 0 ? basePrice - discountedPrice : 0,
        campaignDiscountAmount: 0,
        totalSavings: productDiscount > 0 ? basePrice - discountedPrice : 0,
        isInCampaign: false
      };
    }
  };

  const priceData = calculatePrice();

  const handleSizeSelection = (size) => {
    setSelectedSize(size);
  };

  const handleColorSelection = (color) => {
    setSelectedColor(color);
  };

  const handleQuantityChange = (amount) => {
    if (amount > (product?.stock || 0)) {
      toast.error("Not enough stock available");
    } else {
      setQuantity(amount);
    }
  };

  const addToCart = () => {
  const sizeToUse = product.availableSizes?.length === 1 ? product.availableSizes[0].size : selectedSize;
  const colorToUse = product.availableColors?.length === 1 ? product.availableColors[0] : selectedColor;
  
  if (!sizeToUse || !colorToUse) {
    toast.error("Please select both size and color.");
    return;
  }

  const existingCartItems = JSON.parse(localStorage.getItem('cart_guest')) || [];
  
  // DEBUG LOG - Check what price we're using
  console.log('Adding to cart with price:', {
    currentPrice: priceData.currentPrice,
    originalPrice: priceData.originalPrice,
    productDiscount: product.productDiscount,
    campaignDiscount: product.campaignDiscount,
    isInCampaign: product.isInCampaign
  });
  
  // Use the CORRECT calculated price - this is the actual priceData.currentPrice
  const finalPrice = priceData.currentPrice;
  
  const existingItem = existingCartItems.find(
    (item) =>
      item._id === product._id &&
      item.selectedSize === sizeToUse &&
      item.selectedColor === colorToUse
  );

  if (existingItem) {
    const updatedQuantity = existingItem.quantity + quantity;
    if (updatedQuantity > product.stock) {
      toast.error(`Cannot add more than ${product.stock} items to the cart.`);
      return;
    }
    existingItem.quantity = updatedQuantity;
    localStorage.setItem('cart_guest', JSON.stringify(existingCartItems));
    toast.info("Product quantity increased in the cart!");
  } else {
    if (product.stock < quantity) {
      toast.error("Not enough stock available!");
      return;
    }
    // Create cart item with ALL necessary price information
    const cartItem = {
      ...product,
      // PRICE FIX: Store the original base price and discount separately
      originalPrice: priceData.originalPrice,
      productDiscount: product.productDiscount || 0,
      campaignDiscount: product.campaignDiscount || 0,
      isInCampaign: product.isInCampaign || false,
      // Store the final calculated price
      price: finalPrice,  // This is what shows in cart
      quantity,
      selectedSize: sizeToUse,
      selectedColor: colorToUse,
      campaignId: product.campaignId || null,
      campaignName: product.campaignName || null,
      // Add these for debugging
      _calculatedFinalPrice: finalPrice,
      _calculatedProductDiscount: product.productDiscount,
      _calculatedCampaignDiscount: product.campaignDiscount
    };
    
    // Remove duplicate properties
    delete cartItem.campaignFinalPrice;
    delete cartItem.campaignProductDiscountPrice;
    delete cartItem.campaignDiscountAmount;
    delete cartItem.totalDiscountAmount;
    
    existingCartItems.push(cartItem);
    localStorage.setItem('cart_guest', JSON.stringify(existingCartItems));
    toast.success("Product added to the cart!");
    
    // DEBUG: Log what was stored
    console.log('Stored in cart:', cartItem);
  }
};
  const handleOrderNow = () => {
    const sizeToUse = product.availableSizes?.length === 1 ? product.availableSizes[0].size : selectedSize;
    const colorToUse = product.availableColors?.length === 1 ? product.availableColors[0] : selectedColor;
    
    if (!sizeToUse || !colorToUse) {
      toast.error("Please select both size and color before proceeding.");
      return;
    }
  
    addToCart();
    window.location.href = "/checkout";
  };
  
  const handleOrderOnWhatsApp = () => {
    const phoneNumber = "+8801994830798";
    const productName = product.productName;
    const currentURL = product ? `https://jonabbd.com/product/${id}` : window.location.href;
    const message = `Hello, I am interested in purchasing: *${productName}*. Here is the link: ${currentURL}`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
  
    window.open(whatsappURL, "_blank");
  };

  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? (reviews.reduce((acc, review) => acc + review.rating, 0) / totalReviews).toFixed(1)
    : 4.5;

  const currentUrl = product 
    ? `https://jonabbd.com/product/${id}`
    : window.location.href;

  // Function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Calculate time left for campaign
  const calculateTimeLeft = (endTime) => {
    if (!endTime) return '';
    const end = new Date(endTime);
    const now = new Date();
    const diff = end - now;
    
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
  };

  if (isLoading || !product) {
    return (
      <div className="min-h-screen bg-white text-black">
        <Navbar />
        <div className="pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Loading />
        </div>
        <Footer />
      </div>
    );
  }

  // Extract mobile specifications from description
  const extractMobileSpecs = () => {
    const specs = {
      display: '',
      camera: '',
      battery: '',
      processor: '',
      storage: '',
      ram: '',
      os: ''
    };

    if (product.description) {
      const desc = product.description.toLowerCase();
      
      // Extract display
      const displayMatch = product.description.match(/(\d+\.?\d*\s*["']?[a-zA-Z]*\s*[a-zA-Z]+\s*[a-zA-Z]*)/);
      if (displayMatch) specs.display = displayMatch[0];
      
      // Extract camera
      const cameraMatch = product.description.match(/\d+MP/g);
      if (cameraMatch) specs.camera = cameraMatch.join(' + ');
      
      // Extract battery
      const batteryMatch = product.description.match(/\d+mAh/i);
      if (batteryMatch) specs.battery = batteryMatch[0];
      
      // Extract processor
      if (desc.includes('snapdragon')) specs.processor = 'Snapdragon';
      else if (desc.includes('mediatek')) specs.processor = 'MediaTek';
      else if (desc.includes('exynos')) specs.processor = 'Exynos';
      
      // Extract storage
      const storageMatch = product.description.match(/\d+GB/i);
      if (storageMatch) specs.storage = storageMatch[0];
      
      // Extract RAM
      const ramMatch = product.description.match(/\d+GB RAM/i);
      if (ramMatch) specs.ram = ramMatch[0];
      
      // Extract OS
      if (desc.includes('android')) specs.os = 'Android';
      else if (desc.includes('ios')) specs.os = 'iOS';
    }

    return specs;
  };

  const mobileSpecs = extractMobileSpecs();

  return (
    <div className="min-h-screen bg-white text-black" ref={topRef}>
      <Helmet>
        <title>{`${product.productName} - Buy at ${priceData.currentPrice.toFixed(0)}৳ | Jonab BD`}</title>
        <meta name="description" content={`${product.description.substring(0, 155)}... Buy ${product.productName} online in Bangladesh. Available in ${product.availableColors?.join(', ') || 'various'} colors. Product Code: ${product.productCode}. Free delivery.`} />
        <meta name="keywords" content={`${product.productName}, ${product.category}, ${product.subCategory}, smartphone, mobile, bangladesh, jonab bd`} />
        
        <meta property="og:type" content="product" />
        <meta property="og:url" content={currentUrl} />
        <meta property="og:title" content={`${product.productName} - ${priceData.currentPrice.toFixed(0)}৳ | Jonab BD`} />
        <meta property="og:description" content={`${product.description.substring(0, 155)}... Available in ${product.availableColors?.join(', ') || 'various'} colors.`} />
        <meta property="og:image" content={product.images[0]} />
        <meta property="og:site_name" content="Jonab BD" />
        <meta property="product:price:amount" content={priceData.currentPrice.toString()} />
        <meta property="product:price:currency" content="BDT" />
        <meta property="product:brand" content="Jonab BD" />
        <meta property="product:availability" content={product.stock > 0 ? "in stock" : "out of stock"} />
        <meta property="product:condition" content="new" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={currentUrl} />
        <meta name="twitter:title" content={`${product.productName} - ${priceData.currentPrice.toFixed(0)}৳ | Jonab BD`} />
        <meta name="twitter:description" content={`${product.description.substring(0, 155)}...`} />
        <meta name="twitter:image" content={product.images[0]} />
        
        <link rel="canonical" href={currentUrl} />
        
        <meta name="robots" content="index, follow" />
        <meta name="author" content="Jonab BD" />
      </Helmet>

      <Navbar />
      
      <motion.div 
        className="fixed right-4 top-1/3 z-30 flex flex-col space-y-3"
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.5, type: "spring" }}
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="w-10 h-10 md:w-12 md:h-12 rounded-full shadow-lg flex items-center justify-center bg-white border border-gray-200"
          onClick={toggleFavorite}
        >
          <FaHeart className={isFavorite ? "text-red-500 text-lg" : "text-gray-400 text-lg"} />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="w-10 h-10 md:w-12 md:h-12 rounded-full shadow-lg flex items-center justify-center bg-white border border-gray-200"
          onClick={shareProduct}
        >
          <FaShare className="text-black text-lg" />
        </motion.button>
      </motion.div>
      
      <div className="pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="rounded-xl overflow-hidden border border-gray-200 bg-white"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-4 sm:p-6 md:p-8">
            <motion.div 
              className="space-y-6"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              {/* Campaign Badge */}
              {product.isInCampaign && (
                <div className="relative z-20">
                  <div className="px-4 py-2 bg-red-600 text-white rounded-full text-xs font-light tracking-widest uppercase flex items-center gap-2 mb-4 w-fit">
                    <FaFire className="w-3 h-3" />
                    <span>CAMPAIGN DEAL - EXTRA {product.campaignDiscount}% OFF</span>
                  </div>
                  
                  {/* Campaign Timer */}
                  <div className="mb-4 p-4 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FaClock className="w-4 h-4 text-red-600" />
                        <span className="text-sm font-light text-red-700">
                          {calculateTimeLeft(product.campaignEndTime)}
                        </span>
                      </div>
                      <span className="text-xs text-red-600 font-light">
                        {product.campaignName}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div 
                className="relative overflow-hidden rounded-xl border border-gray-200 group aspect-square"
                ref={containerRef}
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setShowZoom(true)}
                onMouseLeave={() => setShowZoom(false)}
              >
                <motion.img
                  src={mainImage}
                  alt={product.productName}
                  className="w-full h-full object-contain transition-all duration-300 cursor-zoom-in relative z-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                />
                
                {showZoom && (
                  <>
                    <motion.div 
                      className="hidden lg:block absolute z-20 border border-gray-300 bg-white bg-opacity-30 pointer-events-none"
                      style={{
                        width: '150px',
                        height: '150px',
                        left: `${lensPosition.x}px`,
                        top: `${lensPosition.y}px`,
                      }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                    />
                    
                    <motion.div 
                      className="hidden lg:block absolute inset-0 z-10 pointer-events-none bg-no-repeat"
                      style={{
                        backgroundImage: `url(${mainImage})`,
                        backgroundSize: `${containerDimensions.width * 2}px ${containerDimensions.height * 2}px`,
                        backgroundPosition: `${-lensPosition.x * 2 + 75}px ${-lensPosition.y * 2 + 75}px`,
                      }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    />
                  </>
                )}
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm z-30 border border-gray-200"
                  onClick={() => openImageModal(product.images.indexOf(mainImage))}
                >
                  <FaExpand className="text-black" />
                </motion.button>
              </div>
              
              <div className="flex space-x-3 overflow-x-auto py-2 custom-scrollbar">
                {product.images.map((img, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-shrink-0 relative"
                  >
                    <img
                      src={img}
                      alt={`${product.productName} - View ${idx + 1}`}
                      className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-lg cursor-pointer border-2 transition-all"
                      style={{ 
                        borderColor: idx === product.images.indexOf(mainImage) ? "#000" : "transparent",
                      }}
                      onClick={() => setMainImage(img)}
                    />
                  </motion.div>
                ))}
              </div>
              
              {product.videoUrl && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-6"
                >
                  <h3 className="text-lg font-light tracking-widest uppercase mb-3 text-black">PRODUCT VIDEO</h3>
                  <div className="rounded-xl overflow-hidden border border-gray-200 bg-black">
                    <div className="aspect-w-16 aspect-h-9">
                      <ReactPlayer
                        url={product.videoUrl}
                        controls
                        width="100%"
                        height="100%"
                        light={product.images[0]}
                        playing={false}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Mobile Specifications */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-6"
              >
                <h3 className="text-lg font-light tracking-widest uppercase mb-4 text-black">KEY SPECIFICATIONS</h3>
                <div className="grid grid-cols-2 gap-4">
                  {mobileSpecs.display && (
                    <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <FaMobileAlt className="w-4 h-4 text-black" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-widest">Display</p>
                        <p className="text-sm font-light">{mobileSpecs.display}</p>
                      </div>
                    </div>
                  )}
                  
                  {mobileSpecs.camera && (
                    <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <FaCamera className="w-4 h-4 text-black" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-widest">Camera</p>
                        <p className="text-sm font-light">{mobileSpecs.camera}</p>
                      </div>
                    </div>
                  )}
                  
                  {mobileSpecs.battery && (
                    <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <FaBatteryFull className="w-4 h-4 text-black" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-widest">Battery</p>
                        <p className="text-sm font-light">{mobileSpecs.battery}</p>
                      </div>
                    </div>
                  )}
                  
                  {mobileSpecs.processor && (
                    <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <FaBolt className="w-4 h-4 text-black" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-widest">Processor</p>
                        <p className="text-sm font-light">{mobileSpecs.processor}</p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>

            <motion.div 
              className="space-y-6"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-thin tracking-widest uppercase text-black">{product.productName}</h1>
                <p className="text-base md:text-lg mt-1 text-gray-600 font-light">Product Code: {product.productCode}</p>
                <div className="flex items-center space-x-2 text-sm text-gray-500 mt-2 font-light tracking-wide">
                  <span>HOME</span>
                  <span>›</span>
                  <span>{product.category}</span>
                  <span>›</span>
                  <span className="text-black">{product.productName}</span>
                </div>
              </div>
              
              <motion.div 
                className="flex items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex space-x-1 text-yellow-400">
                  {Array.from({ length: 5 }).map((_, index) => {
                    const ratingValue = index + 1;
                    return (
                      <span key={index}>
                        {averageRating >= ratingValue ? (
                          <FaStar className="text-lg md:text-xl" />
                        ) : averageRating >= ratingValue - 0.5 ? (
                          <FaStarHalfAlt className="text-lg md:text-xl" />
                        ) : (
                          <FaRegStar className="text-lg md:text-xl" />
                        )}
                      </span>
                    );
                  })}
                </div>
                <p className="ml-2 text-base md:text-lg font-light text-black">
                  {averageRating} <span className="text-gray-500">({totalReviews} REVIEWS)</span>
                </p>
              </motion.div>
              
              {/* PRICE SECTION - FIXED WITH CAMPAIGN DISCOUNT */}
              <motion.div 
                className="p-4 rounded-xl border border-gray-200 bg-white"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {/* Original Price */}
                <div className="mb-2">
                  <p className="text-sm text-gray-500 font-light">REGULAR PRICE</p>
                  <p className="text-lg text-gray-400 line-through">৳ {priceData.originalPrice.toLocaleString()}</p>
                </div>

                {/* Discount Breakdown */}
                <div className="space-y-2 mb-4">
                  {priceData.productDiscountAmount > 0 && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FaPercent className="w-3 h-3 text-blue-600" />
                        <span className="text-sm font-light">Product Discount ({product.productDiscount}%)</span>
                      </div>
                      <span className="text-sm font-light text-blue-600">-৳ {priceData.productDiscountAmount.toFixed(0)}</span>
                    </div>
                  )}
                  
                  {priceData.campaignDiscountAmount > 0 && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FaFire className="w-3 h-3 text-red-600" />
                        <span className="text-sm font-light">Campaign Discount ({product.campaignDiscount}%)</span>
                      </div>
                      <span className="text-sm font-light text-red-600">-৳ {priceData.campaignDiscountAmount.toFixed(0)}</span>
                    </div>
                  )}
                </div>

                {/* Final Price */}
                <div className="border-t border-gray-200 pt-4">
                  <p className="text-sm text-gray-500 font-light mb-1">FINAL PRICE</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl md:text-4xl font-thin tracking-widest text-black">
                      ৳ {priceData.currentPrice.toLocaleString()}
                    </p>
                    {priceData.totalSavings > 0 && (
                      <span className="text-sm text-green-600 font-light">
                        (Save ৳{priceData.totalSavings.toFixed(0)})
                      </span>
                    )}
                  </div>
                </div>

                {/* Discount Badges */}
                <div className="flex items-center gap-2 mt-4">
                  {product.productDiscount > 0 && (
                    <span className="px-3 py-1 rounded-full text-xs font-light bg-blue-100 text-blue-600 border border-blue-200">
                      {product.productDiscount}% OFF
                    </span>
                  )}
                  {product.isInCampaign && product.campaignDiscount > 0 && (
                    <span className="px-3 py-1 rounded-full text-xs font-light bg-red-100 text-red-600 border border-red-200">
                      EXTRA {product.campaignDiscount}% OFF
                    </span>
                  )}
                </div>
              </motion.div>
              
              {/* Stock Status */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${product.stock > 10 ? 'bg-green-500' : 'bg-yellow-500'}`} />
                    <span className={`text-sm font-light ${product.stock > 10 ? 'text-green-600' : 'text-yellow-600'}`}>
                      {product.stock > 10 ? 'IN STOCK' : 'LOW STOCK'}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500 font-light">
                    {product.stock} UNITS AVAILABLE
                  </span>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h3 className="text-lg font-light tracking-widest uppercase mb-3 text-black">SELECT COLOR</h3>
                <div className="flex flex-wrap gap-3">
                  {product.availableColors?.map((color) => (
                    <motion.button
                      key={color}
                      className={`w-8 h-8 md:w-10 md:h-10 rounded-full border-2 transition-all ${
                        selectedColor === color ? "scale-110 ring-2 ring-offset-2 ring-black shadow-md" : ""
                      }`}
                      style={{ 
                        backgroundColor: color,
                        borderColor: selectedColor === color ? "#000" : "#e5e7eb"
                      }}
                      onClick={() => setSelectedColor(color)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    ></motion.button>
                  ))}
                </div>
              </motion.div>
              
              {product.availableSizes?.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-light tracking-widest uppercase text-black">SELECT VARIANT</h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {product.availableSizes.map((sizeObj) => {
                      // Calculate price for this specific size
                      const sizeBasePrice = sizeObj.sizePrice;
                      const sizePriceData = product.isInCampaign && product.campaignDiscount > 0
                        ? calculateCampaignPrice(sizeBasePrice, product.productDiscount || 0, product.campaignDiscount)
                        : {
                            finalPrice: product.productDiscount > 0 
                              ? sizeBasePrice - (sizeBasePrice * product.productDiscount / 100)
                              : sizeBasePrice
                          };
                      
                      return (
                        <motion.button
                          key={sizeObj.size}
                          className={`px-3 py-3 md:px-4 rounded-lg text-center transition-all font-light border-2 ${
                            selectedSize === sizeObj.size
                              ? "border-black bg-black text-white"
                              : "bg-transparent border-gray-300 text-black hover:border-gray-500"
                          }`}
                          onClick={() => handleSizeSelection(sizeObj.size)}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <span className="block font-light tracking-wide">{sizeObj.size}</span>
                          <span className="text-sm">
                            ৳ {Math.round(sizePriceData.finalPrice).toLocaleString()}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <h3 className="text-lg font-light tracking-widest uppercase mb-3 text-black">QUANTITY</h3>
                <div className="flex items-center space-x-4">
                  <motion.button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                    className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center border border-gray-300 bg-white disabled:opacity-50"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaMinus className="text-black" />
                  </motion.button>
                  <span className="text-xl md:text-2xl font-thin tracking-widest w-12 text-center text-black">{quantity}</span>
                  <motion.button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center border border-gray-300 bg-white"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaPlus className="text-black" />
                  </motion.button>
                </div>
              </motion.div>
              
              <motion.div 
                className="space-y-4 pt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <motion.button
                    onClick={addToCart}
                    className="py-3 md:py-4 text-base md:text-lg font-light tracking-widest uppercase rounded-lg flex items-center justify-center space-x-2 bg-white border-2 border-black text-black hover:bg-black hover:text-white transition-colors"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <FaShoppingCart className="text-lg" />
                    <span>ADD TO CART</span>
                  </motion.button>
                  
                  <motion.button
                    onClick={handleOrderNow}
                    className="py-3 md:py-4 text-base md:text-lg font-light tracking-widest uppercase rounded-lg bg-black text-white hover:bg-gray-900"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    ORDER NOW
                  </motion.button>
                </div>
                
                <motion.button
                  onClick={handleOrderOnWhatsApp}
                  className="w-full py-3 md:py-4 text-base md:text-lg font-light tracking-widest uppercase rounded-lg flex items-center justify-center space-x-2 bg-green-600 text-white hover:bg-green-700"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FaWhatsapp className="text-xl" />
                  <span>ORDER ON WHATSAPP</span>
                </motion.button>
              </motion.div>
              
              <motion.div 
                className="grid grid-cols-2 gap-3 mt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
              >
                <motion.div 
                  className="flex items-center space-x-2 p-3 rounded-lg border border-gray-200 bg-white"
                  whileHover={{ y: -5 }}
                >
                  <FaShippingFast className="text-lg md:text-xl text-black" />
                  <span className="text-xs md:text-sm text-black font-light">FREE SHIPPING</span>
                </motion.div>
                <motion.div 
                  className="flex items-center space-x-2 p-3 rounded-lg border border-gray-200 bg-white"
                  whileHover={{ y: -5 }}
                >
                  <FaExchangeAlt className="text-lg md:text-xl text-black" />
                  <span className="text-xs md:text-sm text-black font-light">7 DAYS RETURN</span>
                </motion.div>
                <motion.div 
                  className="flex items-center space-x-2 p-3 rounded-lg border border-gray-200 bg-white"
                  whileHover={{ y: -5 }}
                >
                  <FaLock className="text-lg md:text-xl text-black" />
                  <span className="text-xs md:text-sm text-black font-light">SECURE PAYMENT</span>
                </motion.div>
                <motion.div 
                  className="flex items-center space-x-2 p-3 rounded-lg border border-gray-200 bg-white"
                  whileHover={{ y: -5 }}
                >
                  <FaCheck className="text-lg md:text-xl text-black" />
                  <span className="text-xs md:text-sm text-black font-light">AUTHENTIC PRODUCT</span>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
          
          <motion.div 
            className="px-4 sm:px-6 py-6 border-t border-gray-200 bg-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            <div className="flex space-x-4 border-b border-gray-200 overflow-x-auto custom-scrollbar">
              <button
                onClick={() => setActiveTab("description")}
                className={`px-3 py-2 md:px-4 md:py-3 text-base md:text-lg font-light tracking-widest uppercase whitespace-nowrap ${activeTab === "description" ? "border-b-2 text-black" : "text-gray-500 hover:text-gray-700"}`}
                style={{ borderColor: activeTab === "description" ? "#000" : "transparent" }}
              >
                DESCRIPTION
              </button>
              <button
                onClick={() => setActiveTab("specifications")}
                className={`px-3 py-2 md:px-4 md:py-3 text-base md:text-lg font-light tracking-widest uppercase whitespace-nowrap ${activeTab === "specifications" ? "border-b-2 text-black" : "text-gray-500 hover:text-gray-700"}`}
                style={{ borderColor: activeTab === "specifications" ? "#000" : "transparent" }}
              >
                SPECIFICATIONS
              </button>
              <button
                onClick={() => setActiveTab("reviews")}
                className={`px-3 py-2 md:px-4 md:py-3 text-base md:text-lg font-light tracking-widest uppercase whitespace-nowrap ${activeTab === "reviews" ? "border-b-2 text-black" : "text-gray-500 hover:text-gray-700"}`}
                style={{ borderColor: activeTab === "reviews" ? "#000" : "transparent" }}
              >
                REVIEWS ({totalReviews})
              </button>
            </div>

            <div className="py-6">
              <AnimatePresence mode="wait">
                {activeTab === "description" && (
                  <motion.div
                    key="description"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="leading-relaxed text-black space-y-4"
                  >
                    {product.description.split('\n').map((paragraph, index) => (
                      <p key={index} className="text-base md:text-lg font-light">
                        {paragraph}
                      </p>
                    ))}
                  </motion.div>
                )}
                
                {activeTab === "specifications" && (
                  <motion.div
                    key="specifications"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="text-lg font-light tracking-widest uppercase text-black">GENERAL</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between border-b border-gray-100 py-2">
                            <span className="text-gray-600 font-light">Brand</span>
                            <span className="text-black font-light">Jonab BD</span>
                          </div>
                          <div className="flex justify-between border-b border-gray-100 py-2">
                            <span className="text-gray-600 font-light">Model</span>
                            <span className="text-black font-light">{product.productName}</span>
                          </div>
                          <div className="flex justify-between border-b border-gray-100 py-2">
                            <span className="text-gray-600 font-light">Product Code</span>
                            <span className="text-black font-light">{product.productCode}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h4 className="text-lg font-light tracking-widest uppercase text-black">AVAILABILITY</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between border-b border-gray-100 py-2">
                            <span className="text-gray-600 font-light">Stock Status</span>
                            <span className={`font-light ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                            </span>
                          </div>
                          <div className="flex justify-between border-b border-gray-100 py-2">
                            <span className="text-gray-600 font-light">Available Colors</span>
                            <span className="text-black font-light">{product.availableColors?.join(', ')}</span>
                          </div>
                          <div className="flex justify-between border-b border-gray-100 py-2">
                            <span className="text-gray-600 font-light">Available Variants</span>
                            <span className="text-black font-light">{product.availableSizes?.map(s => s.size).join(', ')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                {activeTab === "reviews" && (
                  <motion.div
                    key="reviews"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                      <div>
                        <h2 className="text-xl md:text-2xl font-thin tracking-widest uppercase text-black">CUSTOMER REVIEWS</h2>
                        <p className="text-gray-600 font-light mt-1">Average Rating: {averageRating} out of 5</p>
                      </div>
                      <motion.button
                        onClick={toggleReviewModal}
                        className="px-4 py-2 md:px-6 md:py-3 rounded-lg font-light tracking-widest uppercase bg-black text-white hover:bg-gray-900 text-sm md:text-base"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        WRITE A REVIEW
                      </motion.button>
                    </div>
                    
                    {reviews.length > 0 ? (
                      <div className="space-y-6">
                        {reviews.map((review, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="p-4 md:p-6 rounded-lg border border-gray-200 bg-white"
                          >
                            <div className="flex flex-col md:flex-row justify-between gap-2">
                              <p className="font-light text-base md:text-lg text-black">{review.name}</p>
                              <div className="flex space-x-1 text-yellow-400">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <span key={i}>
                                    {review.rating > i ? (
                                      <FaStar className="text-base md:text-lg" />
                                    ) : (
                                      <FaRegStar className="text-base md:text-lg" />
                                    )}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <p className="mt-3 text-gray-600 text-sm md:text-base font-light">{review.comment}</p>
                            <p className="mt-3 text-xs md:text-sm text-gray-500 font-light">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10">
                        <p className="text-base md:text-lg text-gray-500 font-light">No reviews yet. Be the first to review!</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
        
        <motion.div 
          className="mt-12 md:mt-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <h2 className="text-2xl md:text-3xl font-thin tracking-widest uppercase text-center mb-8 md:mb-10 text-black">RELATED PRODUCTS</h2>
          <RelatedProduct category={product.category} currentProductId={product._id} />
        </motion.div>
      </div>
      
      <AnimatePresence>
        {isReviewModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4"
            onClick={() => setReviewModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="rounded-xl shadow-xl w-full max-w-md p-6 bg-white border border-gray-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-light tracking-widest uppercase text-black">WRITE A REVIEW</h3>
                <button 
                  onClick={() => setReviewModalOpen(false)}
                  className="text-gray-500 hover:text-black text-xl"
                >
                  &times;
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-gray-700 font-light">YOUR NAME</label>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={newReview.name}
                    onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                    className="w-full p-3 rounded-lg bg-gray-50 border border-gray-300 text-black focus:outline-none focus:border-black font-light"
                  />
                </div>
                
                <div>
                  <label className="block mb-2 text-gray-700 font-light">YOUR RATING</label>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleRatingChange(star)}
                        className="text-2xl mr-1 focus:outline-none text-yellow-400"
                      >
                        {star <= newReview.rating ? (
                          <FaStar />
                        ) : (
                          <FaRegStar />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block mb-2 text-gray-700 font-light">YOUR REVIEW</label>
                  <textarea
                    placeholder="Share your experience with this product"
                    value={newReview.comment}
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                    className="w-full p-3 rounded-lg bg-gray-50 border border-gray-300 text-black focus:outline-none focus:border-black font-light h-32"
                  ></textarea>
                </div>
                
                <div className="flex space-x-3 pt-2">
                  <motion.button
                    onClick={handleAddReview}
                    className="flex-1 py-3 rounded-lg font-light tracking-widest uppercase bg-black text-white hover:bg-gray-900"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    SUBMIT REVIEW
                  </motion.button>
                  
                  <motion.button
                    onClick={() => setReviewModalOpen(false)}
                    className="flex-1 py-3 rounded-lg font-light tracking-widest uppercase bg-gray-200 text-black hover:bg-gray-300"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    CANCEL
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {isImageModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
            onClick={() => setImageModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-5xl w-full max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                className="absolute top-4 right-4 text-white text-3xl z-30 hover:text-gray-300 bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center"
                onClick={() => setImageModalOpen(false)}
              >
                &times;
              </button>
              
              <motion.img
                key={currentImageIndex}
                src={product.images[currentImageIndex]}
                alt={`${product.productName} - View ${currentImageIndex + 1}`}
                className="w-full h-full object-contain max-h-[80vh]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              />
              
              <button 
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white bg-black bg-opacity-50 w-10 h-10 rounded-full flex items-center justify-center hover:bg-opacity-70 z-30 text-xl"
                onClick={(e) => { e.stopPropagation(); navigateImages('prev'); }}
              >
                &lt;
              </button>
              
              <button 
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white bg-black bg-opacity-50 w-10 h-10 rounded-full flex items-center justify-center hover:bg-opacity-70 z-30 text-xl"
                onClick={(e) => { e.stopPropagation(); navigateImages('next'); }}
              >
                &gt;
              </button>
              
              <div className="absolute bottom-4 left-0 right-0 flex justify-center z-30">
                <div className="flex space-x-2">
                  {product.images.map((_, idx) => (
                    <button
                      key={idx}
                      className={`w-3 h-3 rounded-full ${idx === currentImageIndex ? 'bg-white' : 'bg-gray-300'}`}
                      onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(idx); }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <Footer />
      <ToastContainer 
        position="bottom-right" 
        toastStyle={{ backgroundColor: "white", color: "#000", border: "1px solid #e5e7eb" }} 
      />
    </div>
  );
};

export default SingleProductList;