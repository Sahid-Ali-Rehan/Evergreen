import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownHovered, setIsDropdownHovered] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);

  // Premium Apple-style categories with beautiful landscape images
  const categories = {
    iphone: {
      label: "IPHONE",
      items: [
        { name: "IPHONE 15 PRO", link: "/category/iphone/15-pro", image: "https://adminapi.applegadgetsbd.com/storage/media/large/iPhone-15-Plus-(2)-(6)-5363.jpg", landscape: "https://images.macrumors.com/t/SuHt0iQuSjaO-ExOZzJieONGf_I=/2500x/article-new/2023/09/iPhone-15-Pro-Lineup-Feature.jpg" },
        { name: "IPHONE 15", link: "/category/iphone/15", image: "https://adminapi.applegadgetsbd.com/storage/media/large/iPhone-15-Plus-(2)-(6)-5363.jpg", landscape: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-finish-select-202309-6-1inch?wid=5120&hei=2880&fmt=webp&qlt=70&.v=1692923777972" },
        { name: "IPHONE 14", link: "/category/iphone/14", image: "https://adminapi.applegadgetsbd.com/storage/media/large/iPhone-15-Plus-(2)-(6)-5363.jpg", landscape: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-14-finish-select-202209-6-1inch?wid=5120&hei=2880&fmt=webp&qlt=70&.v=1660676485882" },
        { name: "IPHONE 13", link: "/category/iphone/13", image: "https://adminapi.applegadgetsbd.com/storage/media/large/iPhone-15-Plus-(2)-(6)-5363.jpg", landscape: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-13-finish-select-202207-6-1inch?wid=5120&hei=2880&fmt=webp&qlt=70&.v=1657641864458" },
        { name: "IPHONE SE", link: "/category/iphone/se", image: "https://adminapi.applegadgetsbd.com/storage/media/large/iPhone-15-Plus-(2)-(6)-5363.jpg", landscape: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-se-finish-select-202207-starlight?wid=5120&hei=2880&fmt=webp&qlt=70&.v=1657641867321" },
      ]
    },
    samsung: {
      label: "SAMSUNG",
      items: [
        { name: "GALAXY S24 ULTRA", link: "/category/samsung/s24-ultra", image: "https://images.samsung.com/is/image/samsung/p6pim/in/2401/gallery/in-galaxy-s24-s928-sm-s928bzvcins-thumb-539489855?$650_519_PNG$", landscape: "https://www.sammobile.com/wp-content/uploads/2023/01/galaxy-s23-promo-images-1.jpg" },
        { name: "GALAXY Z FOLD5", link: "/category/samsung/z-fold5", image: "https://images.samsung.com/is/image/samsung/p6pim/in/2307/gallery/in-galaxy-z-fold5-f946-sm-f946bzkains-thumb-536782070?$650_519_PNG$", landscape: "https://images.samsung.com/is/image/samsung/p6pim/in/2307/gallery/in-galaxy-z-fold5-f946-sm-f946bzkains-536782070?$2160_1728_PNG$" },
        { name: "GALAXY Z FLIP5", link: "/category/samsung/z-flip5", image: "https://images.samsung.com/is/image/samsung/p6pim/in/2307/gallery/in-galaxy-z-flip5-f731-sm-f731blbgins-thumb-536782049?$650_519_PNG$", landscape: "https://images.samsung.com/is/image/samsung/p6pim/in/2307/gallery/in-galaxy-z-flip5-f731-sm-f731blbgins-536782049?$2160_1728_PNG$" },
        { name: "GALAXY A SERIES", link: "/category/samsung/a-series", image: "https://images.samsung.com/is/image/samsung/p6pim/in/2401/gallery/in-galaxy-a55-5g-a556-sm-a556ezkhins-thumb-539489865?$650_519_PNG$", landscape: "https://images.samsung.com/is/image/samsung/p6pim/in/2401/gallery/in-galaxy-a55-5g-a556-sm-a556ezkhins-539489865?$2160_1728_PNG$" },
        { name: "GALAXY TABLETS", link: "/category/samsung/tablets", image: "https://images.samsung.com/is/image/samsung/p6pim/in/2307/gallery/in-galaxy-tab-s9-fe-x616-sm-x616nzaeinu-thumb-535354095?$650_519_PNG$", landscape: "https://images.samsung.com/is/image/samsung/p6pim/in/2307/gallery/in-galaxy-tab-s9-fe-x616-sm-x616nzaeinu-535354095?$2160_1728_PNG$" },
      ]
    },
    vivo: {
      label: "VIVO",
      items: [
        { name: "X100 PRO", link: "/category/vivo/x100-pro", image: "https://www.vivo.com/content/dam/vivo/in/vivo-new-home-page/phones/x100pro/x100-pro-kv.png", landscape: "https://vivonewsroom.b-cdn.net/wp-content/uploads/2024/09/vivo-V40E-Press-Release-Banner.jpg" },
        { name: "X90 PRO", link: "/category/vivo/x90-pro", image: "https://www.vivo.com/content/dam/vivo/in/vivo-new-home-page/phones/x90pro/x90-pro-kv.png", landscape: "https://www.vivo.com/content/dam/vivo/in/vivo-new-home-page/phones/x90pro/x90-pro-landscape.jpg" },
        { name: "V29 SERIES", link: "/category/vivo/v29-series", image: "https://www.vivo.com/content/dam/vivo/in/vivo-new-home-page/phones/v29/v29-kv.png", landscape: "https://www.vivo.com/content/dam/vivo/in/vivo-new-home-page/phones/v29/v29-landscape.jpg" },
        { name: "T2 SERIES", link: "/category/vivo/t2-series", image: "https://www.vivo.com/content/dam/vivo/in/vivo-new-home-page/phones/t2/t2-kv.png", landscape: "https://www.vivo.com/content/dam/vivo/in/vivo-new-home-page/phones/t2/t2-landscape.jpg" },
        { name: "Y SERIES", link: "/category/vivo/y-series", image: "https://www.vivo.com/content/dam/vivo/in/vivo-new-home-page/phones/y36/y36-kv.png", landscape: "https://www.vivo.com/content/dam/vivo/in/vivo-new-home-page/phones/y36/y36-landscape.jpg" },
      ]
    },
    oppo: {
      label: "OPPO",
      items: [
        { name: "FIND N3", link: "/category/oppo/find-n3", image: "https://image.oppo.com/content/dam/oppo/in/mkt/homepage/new-products/find-n3/kv/oppo-find-n3-kv-en.png", landscape: "https://image.oppo.com/content/dam/oppo-campaign-site/in/events/store-opening/f21/launch/banner03-pc-v2.jpg.thumb.webp" },
        { name: "RENO11 PRO", link: "/category/oppo/reno11-pro", image: "https://image.oppo.com/content/dam/oppo/in/mkt/homepage/new-products/reno11-pro/kv/reno11-pro-kv.png", landscape: "https://image.oppo.com/content/dam/oppo/in/mkt/homepage/new-products/reno11-pro/kv/reno11-pro-landscape.jpg" },
        { name: "F25 PRO", link: "/category/oppo/f25-pro", image: "https://image.oppo.com/content/dam/oppo/in/mkt/homepage/new-products/f25-pro/kv/f25-pro-kv.png", landscape: "https://image.oppo.com/content/dam/oppo/in/mkt/homepage/new-products/f25-pro/kv/f25-pro-landscape.jpg" },
        { name: "A SERIES", link: "/category/oppo/a-series", image: "https://image.oppo.com/content/dam/oppo/in/mkt/homepage/phones/a18/kv/oppo-a18-kv-en.png", landscape: "https://image.oppo.com/content/dam/oppo/in/mkt/homepage/phones/a18/kv/oppo-a18-landscape.jpg" },
        { name: "ENCO BUDS", link: "/category/oppo/earbuds", image: "https://image.oppo.com/content/dam/oppo/in/mkt/homepage/accessories/enco-buds2/kv/oppo-enco-buds2-kv-en.png", landscape: "https://image.oppo.com/content/dam/oppo/in/mkt/homepage/accessories/enco-buds2/kv/oppo-enco-buds2-landscape.jpg" },
      ]
    },
    oneplus: {
      label: "ONEPLUS",
      items: [
        { name: "ONEPLUS 12", link: "/category/oneplus/12", image: "https://oasis.opstatics.com/content/dam/oasis/page/oneplus-12/spec-image/OnePlus-12-green.png", landscape: "https://oasis.opstatics.com/content/dam/oasis/page/2021/lemonade/news/oneplus-launches-oneplus-9-series-flagship-smartphones-and-first-ever-oneplus-watch/9%20PRO%20FAMILY.jpg" },
        { name: "ONEPLUS 12R", link: "/category/oneplus/12r", image: "https://oasis.opstatics.com/content/dam/oasis/page/oneplus-12r/spec-image/OnePlus-12R-iron-gray.png", landscape: "https://oasis.opstatics.com/content/dam/oasis/page/oneplus-12r/kv/OnePlus-12R-landscape.jpg" },
        { name: "ONEPLUS OPEN", link: "/category/oneplus/open", image: "https://oasis.opstatics.com/content/dam/oasis/page/oneplus-open/spec-image/OnePlus-Open-emerald-dusk.png", landscape: "https://oasis.opstatics.com/content/dam/oasis/page/oneplus-open/kv/OnePlus-Open-landscape.jpg" },
        { name: "NORD CE3", link: "/category/oneplus/nord-ce3", image: "https://oasis.opstatics.com/content/dam/oasis/page/nord-ce-3/spec-image/Nord-CE-3-aqua.png", landscape: "https://oasis.opstatics.com/content/dam/oasis/page/nord-ce-3/kv/Nord-CE-3-landscape.jpg" },
        { name: "BUDS PRO 2", link: "/category/oneplus/buds-pro2", image: "https://oasis.opstatics.com/content/dam/oasis/page/oneplus-buds-pro-2/spec-image/OnePlus-Buds-Pro-2-obsidian-black.png", landscape: "https://oasis.opstatics.com/content/dam/oasis/page/oneplus-buds-pro-2/kv/OnePlus-Buds-Pro-2-landscape.jpg" },
      ]
    },
    nothing: {
      label: "NOTHING",
      items: [
        { name: "PHONE (2)", link: "/category/nothing/phone2", image: "https://akm-img-a-in.tosshub.com/businesstoday/images/story/202503/67c6d78b2b856-nothing-phone-3a-and-phone-3a-pro-043549569-16x9.jpg", landscape: "https://akm-img-a-in.tosshub.com/businesstoday/images/story/202503/67c6d78b2b856-nothing-phone-3a-and-phone-3a-pro-043549569-16x9.jpg" },
        { name: "PHONE (1)", link: "/category/nothing/phone1", image: "https://akm-img-a-in.tosshub.com/businesstoday/images/story/202503/67c6d78b2b856-nothing-phone-3a-and-phone-3a-pro-043549569-16x9.jpg", landscape: "https://akm-img-a-in.tosshub.com/businesstoday/images/story/202503/67c6d78b2b856-nothing-phone-3a-and-phone-3a-pro-043549569-16x9.jpg" },
        { name: "EAR (2)", link: "/category/nothing/ear2", image: "https://akm-img-a-in.tosshub.com/businesstoday/images/story/202503/67c6d78b2b856-nothing-phone-3a-and-phone-3a-pro-043549569-16x9.jpg", landscape: "https://akm-img-a-in.tosshub.com/businesstoday/images/story/202503/67c6d78b2b856-nothing-phone-3a-and-phone-3a-pro-043549569-16x9.jpg" },
        { name: "EAR (A)", link: "/category/nothing/ear-a", image: "https://akm-img-a-in.tosshub.com/businesstoday/images/story/202503/67c6d78b2b856-nothing-phone-3a-and-phone-3a-pro-043549569-16x9.jpg", landscape: "https://akm-img-a-in.tosshub.com/businesstoday/images/story/202503/67c6d78b2b856-nothing-phone-3a-and-phone-3a-pro-043549569-16x9.jpg" },
        { name: "ACCESSORIES", link: "/category/nothing/accessories", image: "https://akm-img-a-in.tosshub.com/businesstoday/images/story/202503/67c6d78b2b856-nothing-phone-3a-and-phone-3a-pro-043549569-16x9.jpg", landscape: "https://akm-img-a-in.tosshub.com/businesstoday/images/story/202503/67c6d78b2b856-nothing-phone-3a-and-phone-3a-pro-043549569-16x9.jpg" },
      ]
    },
  };

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Check active route on location change
  useEffect(() => {
    const path = location.pathname;
    
    // Check if we're in a category
    const categoryMatch = path.match(/^\/category\/([^/]+)/);
    if (categoryMatch) {
      const categoryName = categoryMatch[1];
      // Find the matching category
      const foundCategory = Object.keys(categories).find(key => 
        key.toLowerCase() === categoryName.toLowerCase()
      );
      if (foundCategory) {
        setActiveCategory(foundCategory);
      } else {
        setActiveCategory(null);
      }
    } else {
      setActiveCategory(null);
    }
  }, [location.pathname]);

  // Update cart and wishlist counts
  const updateCounts = useCallback(() => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart_guest')) || [];
      const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
      
      const totalCartItems = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);
      setCartCount(totalCartItems);
      setWishlistCount(wishlist.length);
    } catch (error) {
      console.error('Error reading cart/wishlist:', error);
    }
  }, []);

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        const userId = decodedToken?.id;
        if (!userId) return;

        const response = await axios.get(`https://prexo.onrender.com/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.user) {
          setUser(response.data.user);
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setIsLoggedIn(false);
      }
    };

    fetchUser();
    updateCounts();
    
    const handleStorageChange = () => updateCounts();
    window.addEventListener('storage', handleStorageChange);
    
    const handleCustomUpdate = () => updateCounts();
    window.addEventListener('cartWishlistUpdate', handleCustomUpdate);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartWishlistUpdate', handleCustomUpdate);
    };
  }, [updateCounts]);

  // Navigation handlers
  const navigateToProducts = () => navigate('/products');
  const navigateToProfile = () => navigate('/my-profile');

  // Close all dropdowns
  const closeAllDropdowns = () => {
    setActiveDropdown(null);
    setIsMenuOpen(false);
    setIsDropdownHovered(false);
  };

  // Toggle mobile menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Toggle mobile dropdown
  const toggleMobileDropdown = (dropdown) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  // Check if current path matches a category item
  const isActiveItem = (link) => {
    return location.pathname === link;
  };

  return (
    <>
      {/* Premium Apple-style Navbar */}
      <nav 
        className={`fixed w-full z-50 transition-all duration-500 ${
          isScrolled 
            ? "bg-black/95 backdrop-blur-xl shadow-lg" 
            : "bg-black"
        }`}
        style={{
          fontFamily: '"SF Pro Display", "SF Pro Text", -apple-system, BlinkMacSystemFont, sans-serif'
        }}
      >
        <div className="max-w-screen-2xl mx-auto">
          <div className="flex justify-between items-center h-[52px] px-4 sm:px-6 lg:px-8">
            {/* Logo - Original Logos */}
            <motion.div 
              className="flex items-center"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Link to="/" onClick={closeAllDropdowns}>
                <div className="flex items-center space-x-2">
                  {/* Original logo.png */}
                  <motion.div 
                    className="relative"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <img 
                      src="/Images/logo.png"
                      alt="Mobile Store"
                      className="h-8 w-8 object-contain"
                    />
                  </motion.div>
                  
                  {/* Original J.gif with premium glow effect */}
                  <motion.div
                    className="relative"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.img 
                      src="/Images/J.gif"
                      alt="J Logo"
                      className="h-7 w-auto object-contain"
                      animate={{
                        filter: [
                          "drop-shadow(0 0 0px rgba(255, 255, 255, 0))",
                          "drop-shadow(0 0 8px rgba(255, 255, 255, 0.6))",
                          "drop-shadow(0 0 0px rgba(255, 255, 255, 0))"
                        ]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                    {/* Premium glow effect */}
                    <motion.div 
                      className="absolute inset-0 bg-white/20 blur-xl rounded-full"
                      animate={{
                        opacity: [0.3, 0.6, 0.3]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  </motion.div>
                </div>
              </Link>
            </motion.div>

            {/* Desktop Navigation - Apple Style */}
            <div className="hidden lg:flex items-center h-full">
              <div className="flex items-center h-full space-x-0">
                {Object.entries(categories).map(([key, category]) => {
                  const isActive = activeCategory === key;
                  return (
                    <div
                      key={key}
                      className="relative h-full flex items-center"
                      onMouseEnter={() => {
                        setActiveDropdown(key);
                        setIsDropdownHovered(true);
                      }}
                      onMouseLeave={() => {
                        if (!isDropdownHovered) {
                          setActiveDropdown(null);
                        }
                      }}
                    >
                      <motion.button 
                        className={`px-4 h-full flex items-center text-[12px] font-light tracking-[0.01em] relative transition-all duration-300 uppercase ${
                          isActive 
                            ? "text-white opacity-100" 
                            : activeDropdown === key
                            ? "text-white opacity-100"
                            : "text-white/70 hover:text-white hover:opacity-100"
                        }`}
                        style={{
                          letterSpacing: '0.05em',
                          fontWeight: 300
                        }}
                      >
                        {category.label}
                        {/* Smooth underline indicator */}
                        <motion.div 
                          className={`absolute bottom-0 left-4 right-4 h-[1px] bg-white ${
                            isActive || activeDropdown === key ? 'opacity-100' : 'opacity-0'
                          }`}
                          initial={false}
                          animate={{
                            scaleX: isActive || activeDropdown === key ? 1 : 0
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 35,
                            duration: 0.2
                          }}
                        />
                      </motion.button>
                    </div>
                  );
                })}
                
                <motion.button 
                  onClick={navigateToProducts}
                  className={`px-4 h-full flex items-center text-[12px] font-light tracking-[0.01em] relative transition-all duration-300 uppercase ${
                    location.pathname === '/products' 
                      ? "text-white opacity-100" 
                      : "text-white/70 hover:text-white hover:opacity-100"
                  }`}
                  style={{
                    letterSpacing: '0.05em',
                    fontWeight: 300
                  }}
                >
                  ALL PRODUCTS
                  {/* Smooth underline indicator */}
                  <motion.div 
                    className={`absolute bottom-0 left-4 right-4 h-[1px] bg-white ${
                      location.pathname === '/products' ? 'opacity-100' : 'opacity-0'
                    }`}
                    initial={false}
                    animate={{
                      scaleX: location.pathname === '/products' ? 1 : 0
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 35,
                      duration: 0.2
                    }}
                  />
                </motion.button>
              </div>
            </div>

            {/* Right Section - Apple Style */}
            <div className="flex items-center space-x-4 sm:space-x-6">
              <div className="hidden lg:flex items-center space-x-6">
                {/* Cart */}
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link 
                    to="/cart" 
                    className={`relative transition-all duration-300 ${
                      location.pathname === '/cart' 
                        ? "text-white" 
                        : "text-white/70 hover:text-white"
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="9" cy="21" r="1"></circle>
                      <circle cx="20" cy="21" r="1"></circle>
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                    </svg>
                    {cartCount > 0 && (
                      <motion.span 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-2 -right-2 bg-white text-black text-[10px] rounded-full h-5 w-5 flex items-center justify-center font-medium"
                      >
                        {cartCount > 9 ? '9+' : cartCount}
                      </motion.span>
                    )}
                  </Link>
                </motion.div>
                
                {isLoggedIn ? (
                  <motion.button 
                    onClick={navigateToProfile}
                    className="flex items-center space-x-3 group"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br from-gray-800 to-black flex items-center justify-center border transition-all duration-300 ${
                      location.pathname === '/my-profile' 
                        ? "border-white" 
                        : "border-white/20 group-hover:border-white/40"
                    }`}>
                      <span className="text-[12px] font-medium text-white">
                        {user?.fullname?.[0]?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  </motion.button>
                ) : (
                  <div className="flex items-center space-x-4">
                    <motion.div
                      whileHover={{ y: -1 }}
                      whileTap={{ y: 1 }}
                    >
                      <Link
                        to="/login"
                        className={`text-[13px] transition-all duration-300 px-3 py-1.5 rounded-full ${
                          location.pathname === '/login'
                            ? "text-white bg-white/10"
                            : "text-white/70 hover:text-white hover:bg-white/10"
                        }`}
                        style={{ fontWeight: 300 }}
                      >
                        SIGN IN
                      </Link>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link
                        to="/signup"
                        className={`px-5 py-1.5 text-[13px] rounded-full tracking-wide transition-all duration-300 font-medium ${
                          location.pathname === '/signup'
                            ? "bg-white/20 text-white"
                            : "bg-white text-black hover:bg-white/90"
                        }`}
                        style={{ fontWeight: 400 }}
                      >
                        JOIN
                      </Link>
                    </motion.div>
                  </div>
                )}
              </div>

              {/* Mobile menu button */}
              <motion.button
                className="lg:hidden text-white focus:outline-none"
                onClick={toggleMenu}
                whileTap={{ scale: 0.95 }}
              >
                {isMenuOpen ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Premium Desktop Dropdown - Apple Style */}
        <AnimatePresence>
          {activeDropdown && categories[activeDropdown] && (
            <motion.div
              key={activeDropdown}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="hidden lg:block absolute left-0 right-0 top-[52px] z-40 bg-black/95 backdrop-blur-2xl border-t border-white/10"
              onMouseEnter={() => setIsDropdownHovered(true)}
              onMouseLeave={() => {
                setIsDropdownHovered(false);
                setActiveDropdown(null);
              }}
            >
              <div className="max-w-screen-2xl mx-auto px-12 py-20">
                <div className="grid grid-cols-3 gap-32">
                  {/* Left side - Menu items */}
                  <div className="col-span-2">
                    <div className="grid grid-cols-3 gap-20">
                      {categories[activeDropdown].items.map((item, index) => (
                        <motion.div
                          key={item.name}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.03, duration: 0.15 }}
                          className="group"
                        >
                          <Link
                            to={item.link}
                            onClick={closeAllDropdowns}
                            className="block"
                          >
                            <div className="mb-8">
                              <h3 className="text-[10px] font-medium tracking-[0.1em] text-white/50 uppercase mb-4">
                                {activeDropdown.toUpperCase()}
                              </h3>
                              <p className={`text-[32px] font-light tracking-tight leading-tight mb-4 transition-all duration-300 group-hover:opacity-60 ${
                                isActiveItem(item.link) ? 'text-white' : 'text-white/90'
                              }`}>
                                {item.name}
                              </p>
                              <div className="h-[0.5px] w-10 bg-gradient-to-r from-white/30 to-transparent mt-6"></div>
                            </div>
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                    
                    {/* View All link */}
                    <div className="mt-20">
                      <Link
                        to={`/category/${activeDropdown}`}
                        onClick={closeAllDropdowns}
                        className="inline-flex items-center text-[15px] font-light text-white/70 hover:text-white transition-all duration-300 group"
                      >
                        EXPLORE ALL {activeDropdown.toUpperCase()} DEVICES
                        <svg 
                          className="ml-4 w-5 h-5 transform group-hover:translate-x-2 transition-all duration-300"
                          viewBox="0 0 20 20" 
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M4 10H16M16 10L12 14M16 10L12 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </Link>
                    </div>
                  </div>
                  
                  {/* Right side - Large Premium Landscape Image */}
                  <div className="relative">
                    <div className="sticky top-24">
                      <div className="aspect-[16/9] bg-gradient-to-br from-gray-900 via-black to-black rounded-2xl overflow-hidden shadow-2xl group">
                        <motion.img 
                          src={categories[activeDropdown].items[0].landscape || categories[activeDropdown].items[0].image}
                          alt={categories[activeDropdown].items[0].name}
                          className="w-full h-full object-cover"
                          initial={{ scale: 1 }}
                          whileHover={{ scale: 1.03 }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                          onError={(e) => {
                            e.target.src = categories[activeDropdown].items[0].image;
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                        <div className="absolute bottom-0 left-0 right-0 p-8">
                          <p className="text-[10px] font-medium tracking-[0.1em] text-white/50 uppercase mb-3">FEATURED</p>
                          <p className="text-[24px] font-light text-white leading-tight">{categories[activeDropdown].items[0].name}</p>
                          <div className="h-[0.5px] w-16 bg-white mt-6"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Premium Mobile Menu - Apple Style */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 top-[52px] z-40 lg:hidden bg-black/70 backdrop-blur-sm"
              onClick={toggleMenu}
            />
            
            {/* Menu Content */}
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
              className="fixed top-[52px] right-0 bottom-0 w-full max-w-sm z-50 bg-black/95 backdrop-blur-2xl border-l border-white/10 overflow-y-auto"
            >
              <div className="px-6 py-8">
                {/* User info */}
                {isLoggedIn && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 p-5 bg-white/5 rounded-2xl border border-white/10"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-14 h-14 rounded-full bg-gradient-to-r from-gray-900 to-black flex items-center justify-center border ${
                        location.pathname === '/my-profile' ? 'border-white' : 'border-white/20'
                      }`}>
                        <span className="text-white font-bold text-xl">
                          {user?.fullname?.[0]?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-light text-white text-lg tracking-wide">{user?.fullname || 'USER'}</h3>
                        <p className="text-sm text-white/50 tracking-wider">WELCOME BACK</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Categories List */}
                <div className="space-y-1 mb-8">
                  <h3 className="text-[11px] font-medium text-white/30 uppercase tracking-wider px-2 mb-6">CATEGORIES</h3>
                  {Object.entries(categories).map(([key, category]) => (
                    <div key={key} className="border-b border-white/10">
                      <motion.button
                        onClick={() => toggleMobileDropdown(key)}
                        className={`w-full flex justify-between items-center py-5 transition-all ${
                          activeCategory === key ? 'text-white' : 'text-white/80 hover:text-white'
                        }`}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
                            activeCategory === key 
                              ? 'bg-white/10 border-white/30' 
                              : 'bg-white/5 border-white/10'
                          }`}>
                            <span className="text-sm font-medium text-white">{category.label.charAt(0)}</span>
                          </div>
                          <span className="text-[17px] font-light tracking-wide">{category.label}</span>
                        </div>
                        <motion.svg 
                          className={`w-5 h-5 ${
                            activeCategory === key ? 'text-white' : 'text-white/50'
                          }`}
                          animate={{ rotate: activeDropdown === key ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 9l-7 7-7-7" />
                        </motion.svg>
                      </motion.button>
                      
                      {/* Mobile Dropdown Items */}
                      <AnimatePresence>
                        {activeDropdown === key && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="pl-14 pb-5 space-y-3">
                              {category.items.map((item) => (
                                <motion.div
                                  key={item.name}
                                  initial={{ opacity: 0, x: -5 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ duration: 0.15 }}
                                >
                                  <Link
                                    to={item.link}
                                    onClick={toggleMenu}
                                    className={`block py-3 transition-all ${
                                      isActiveItem(item.link) 
                                        ? 'text-white' 
                                        : 'text-white/70 hover:text-white'
                                    }`}
                                  >
                                    <div className="flex items-center">
                                      <div className={`w-1 h-1 rounded-full mr-4 ${
                                        isActiveItem(item.link) 
                                          ? 'bg-white' 
                                          : 'bg-white/30'
                                      }`}></div>
                                      <span className="text-[15px] font-light tracking-wide">{item.name}</span>
                                    </div>
                                  </Link>
                                </motion.div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>

                {/* All Products */}
                <motion.button 
                  onClick={() => {
                    navigateToProducts();
                    toggleMenu();
                  }}
                  className={`w-full flex items-center justify-between text-left py-5 text-[17px] font-light tracking-wide border-b border-white/10 transition-all ${
                    location.pathname === '/products' 
                      ? 'text-white' 
                      : 'text-white/80 hover:text-white'
                  }`}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
                      location.pathname === '/products' 
                        ? 'bg-white/10 border-white/30' 
                        : 'bg-white/5 border-white/10'
                    }`}>
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <span>ALL PRODUCTS</span>
                  </div>
                  <svg className={`w-5 h-5 ${
                    location.pathname === '/products' ? 'text-white' : 'text-white/50'
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5l7 7-7 7" />
                  </svg>
                </motion.button>

                {/* Bottom Section */}
                <div className="pt-10 space-y-8">
                  {/* Cart and Wishlist */}
                  <div className="flex space-x-10 pt-8 border-t border-white/10">
                    {isLoggedIn && (
                      <Link 
                        to="/wish-list" 
                        onClick={toggleMenu}
                        className={`flex flex-col items-center space-y-2 group relative transition-all ${
                          location.pathname === '/wish-list' 
                            ? 'text-white' 
                            : 'text-white/70 hover:text-white'
                        }`}
                      >
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center border transition-all group-hover:bg-white/10 ${
                          location.pathname === '/wish-list' 
                            ? 'bg-white/10 border-white/30' 
                            : 'bg-white/5 border-white/10'
                        }`}>
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </div>
                        <span className="text-[13px] font-light tracking-wide">WISHLIST</span>
                        {wishlistCount > 0 && (
                          <motion.span 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-1 -right-1 bg-white text-black text-xs rounded-full h-6 w-6 flex items-center justify-center font-medium"
                          >
                            {wishlistCount > 9 ? '9+' : wishlistCount}
                          </motion.span>
                        )}
                      </Link>
                    )}
                    
                    <Link 
                      to="/cart" 
                      onClick={toggleMenu}
                      className={`flex flex-col items-center space-y-2 group relative transition-all ${
                        location.pathname === '/cart' 
                          ? 'text-white' 
                          : 'text-white/70 hover:text-white'
                      }`}
                    >
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center border transition-all group-hover:bg-white/10 ${
                        location.pathname === '/cart' 
                          ? 'bg-white/10 border-white/30' 
                          : 'bg-white/5 border-white/10'
                      }`}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                      </div>
                      <span className="text-[13px] font-light tracking-wide">CART</span>
                      {cartCount > 0 && (
                        <motion.span 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1 -right-1 bg-white text-black text-xs rounded-full h-6 w-6 flex items-center justify-center font-medium"
                        >
                          {cartCount > 9 ? '9+' : cartCount}
                        </motion.span>
                      )}
                    </Link>
                  </div>

                  {/* Auth buttons */}
                  <div className="pt-10 border-t border-white/10">
                    {isLoggedIn ? (
                      <motion.button 
                        onClick={() => {
                          navigateToProfile();
                          toggleMenu();
                        }}
                        className={`w-full flex items-center justify-between p-5 rounded-2xl border transition-all hover:bg-white/10 ${
                          location.pathname === '/my-profile'
                            ? 'bg-white/10 border-white/30'
                            : 'bg-white/5 border-white/10'
                        }`}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-gray-900 to-black flex items-center justify-center border border-white/20">
                            <span className="text-white font-bold text-lg">
                              {user?.fullname?.[0]?.toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div className="text-left">
                            <p className="text-white font-light text-lg tracking-wide">{user?.fullname || 'USER'}</p>
                            <p className="text-white/50 text-sm tracking-wider">VIEW PROFILE</p>
                          </div>
                        </div>
                        <svg className="w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5l7 7-7 7" />
                        </svg>
                      </motion.button>
                    ) : (
                      <div className="flex flex-col space-y-4">
                        <motion.div whileTap={{ scale: 0.98 }}>
                          <Link
                            to="/login"
                            onClick={toggleMenu}
                            className={`block py-5 text-center border rounded-2xl font-light text-white tracking-wide transition-all ${
                              location.pathname === '/login'
                                ? 'border-white/30 bg-white/10'
                                : 'border-white/20 hover:bg-white/10'
                            }`}
                          >
                            SIGN IN
                          </Link>
                        </motion.div>
                        <motion.div whileTap={{ scale: 0.98 }}>
                          <Link
                            to="/signup"
                            onClick={toggleMenu}
                            className={`block py-5 text-center rounded-2xl font-medium tracking-wide transition-all ${
                              location.pathname === '/signup'
                                ? 'bg-white/20 text-white'
                                : 'bg-white text-black hover:bg-white/90'
                            }`}
                          >
                            CREATE ACCOUNT
                          </Link>
                        </motion.div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer for fixed navbar */}
      <div className="h-[52px]"></div>
    </>
  );
};

export default Navbar;