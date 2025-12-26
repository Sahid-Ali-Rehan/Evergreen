import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { FaFilter, FaTimes, FaSearch, FaArrowDown, FaFire, FaClock, FaTag, FaBolt } from 'react-icons/fa';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart as solidHeart } from "@fortawesome/free-solid-svg-icons";
import { faHeart as regularHeart } from "@fortawesome/free-regular-svg-icons";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loading from "../../Components/Loading/Loading";
import Navbar from "../../Components/Navigations/Navbar";
import Footer from "../../Components/Footer/Footer";
import { motion, AnimatePresence } from 'framer-motion';

// Campaign Countdown Component
const CampaignCountdown = ({ endTime, compact = false }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const calculateTimeLeft = useCallback(() => {
    if (!endTime) return { days: 0, hours: 0, minutes: 0, seconds: 0, ended: true };
    
    const end = new Date(endTime);
    const now = new Date();
    const diff = end - now;
    
    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, ended: true };
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return { days, hours, minutes, seconds, ended: false };
  }, [endTime]);

  useEffect(() => {
    // Calculate immediately
    setTimeLeft(calculateTimeLeft());
    
    // Set up interval for updates
    const intervalId = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, [endTime, calculateTimeLeft]);

  if (timeLeft.ended) {
    return (
      <div className="flex items-center gap-1 px-2 py-1 bg-gray-800 text-white text-xs tracking-wider rounded">
        <FaClock className="w-3 h-3" />
        <span>ENDED</span>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-red-600 to-pink-600 text-white text-xs tracking-widest rounded-lg animate-pulse">
        <FaClock className="w-3 h-3 animate-pulse" />
        <span className="font-mono">
          {timeLeft.days > 0 ? `${timeLeft.days}d ` : ''}
          {timeLeft.hours.toString().padStart(2, '0')}:
          {timeLeft.minutes.toString().padStart(2, '0')}:
          {timeLeft.seconds.toString().padStart(2, '0')}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg">
      <FaClock className="w-4 h-4 animate-pulse" />
      <div className="flex gap-1">
        {timeLeft.days > 0 && (
          <div className="text-center">
            <div className="text-xl font-bold">{timeLeft.days}</div>
            <div className="text-xs opacity-80">DAYS</div>
          </div>
        )}
        <div className="text-center">
          <div className="text-xl font-bold">{timeLeft.hours.toString().padStart(2, '0')}</div>
          <div className="text-xs opacity-80">HOURS</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold">{timeLeft.minutes.toString().padStart(2, '0')}</div>
          <div className="text-xs opacity-80">MIN</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold">{timeLeft.seconds.toString().padStart(2, '0')}</div>
          <div className="text-xs opacity-80">SEC</div>
        </div>
      </div>
    </div>
  );
};

// Campaign Badge Component
const CampaignBadge = ({ campaignName, discount }) => {
  return (
    <div className="absolute top-3 left-3 z-20">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-black to-gray-900 text-white text-xs tracking-widest rounded-lg shadow-xl">
          <FaFire className="w-3 h-3 text-red-400" />
          <span className="font-bold">{campaignName}</span>
        </div>
        {discount > 0 && (
          <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-red-600 to-orange-600 text-white text-xs font-bold rounded">
            <FaTag className="w-2 h-2" />
            <span>EXTRA {discount}% OFF</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Skeleton loading component
const SkeletonProduct = () => (
  <div className="relative flex flex-col h-full border border-gray-200 rounded-lg overflow-hidden animate-pulse">
    <div className="relative overflow-hidden aspect-square bg-gray-200"></div>
    <div className="flex flex-col flex-grow p-4 bg-white">
      <div className="flex justify-between items-start mb-2">
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      </div>
      <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-1/3 mb-4"></div>
      <div className="h-10 bg-gray-200 rounded mt-auto"></div>
    </div>
  </div>
);

// Image component with error handling
const ProductImage = ({ src, alt, className, onLoad, onError }) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [loading, setLoading] = useState(true);

  const handleLoad = () => {
    setLoading(false);
    onLoad && onLoad();
  };

  const handleError = () => {
    setImgSrc('https://via.placeholder.com/300x300?text=Image+Not+Available');
    setLoading(false);
    onError && onError();
  };

  return (
    <div className={`relative ${className}`}>
      {loading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
      )}
      <img
        src={imgSrc}
        alt={alt}
        className={`w-full h-full object-contain transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'}`}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
};

const AllProductsClient = () => {
  const [products, setProducts] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [campaignMap, setCampaignMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    subCategory: '',
    color: '',
    size: '',
    sort: 'newest',
    minPrice: 0,
    maxPrice: 10000,
    priceRange: [0, 10000],
    campaign: '', // 'all', 'campaign', or specific campaign name
    campaignName: '' // specific campaign name filter
  });
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreProducts, setHasMoreProducts] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(12);
  const [totalProducts, setTotalProducts] = useState(0);
  const [displayedProducts, setDisplayedProducts] = useState(0);
  const [availableCampaigns, setAvailableCampaigns] = useState([]);

  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const maxPriceRef = useRef(10000);

  // Initialize wishlist
  useEffect(() => {
    try {
      const storedWishlist = JSON.parse(localStorage.getItem('wishlist'));
      if (Array.isArray(storedWishlist)) {
        setWishlist(storedWishlist);
      } else {
        setWishlist([]);
      }
    } catch (e) {
      setWishlist([]);
    }
  }, []);

  // Fetch campaigns
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/campaigns/home/active');
        if (response.data) {
          setCampaigns(response.data);
          
          // Extract unique campaign names for filter
          const campaignNames = [...new Set(response.data.map(c => c.name))];
          setAvailableCampaigns(campaignNames);
          
          // Create campaign map
          const map = {};
          response.data.forEach(campaign => {
            campaign.products.forEach(cp => {
              if (cp.productId && cp.productId._id) {
                map[cp.productId._id] = {
                  campaignId: campaign._id,
                  campaignName: campaign.name,
                  campaignDiscount: campaign.extraDiscount,
                  campaignEndTime: campaign.endTime,
                  finalPrice: cp.finalPrice || cp.productId.price
                };
              }
            });
          });
          setCampaignMap(map);
        }
      } catch (error) {
        console.error('Error fetching campaigns:', error);
      }
    };
    
    fetchCampaigns();
  }, []);

  // Get initial category and subcategory from URL params
  useEffect(() => {
    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory');
    
    if (category) {
      setFilters(prev => ({
        ...prev,
        category: category
      }));
    }
    
    if (subcategory) {
      setFilters(prev => ({
        ...prev,
        subCategory: subcategory
      }));
    }
  }, [searchParams]);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        if (currentPage === 1) {
          setLoading(true);
        } else {
          setIsLoadingMore(true);
        }

        const params = {
          page: currentPage,
          limit: productsPerPage,
          sort: filters.sort === 'newest' ? '-createdAt' : 
                filters.sort === 'low-to-high' ? 'price' : '-price',
          search: filters.search || undefined,
          category: filters.category || undefined,
          subCategory: filters.subCategory || undefined,
          color: filters.color || undefined,
          size: filters.size || undefined,
          minPrice: filters.priceRange[0] || undefined,
          maxPrice: filters.priceRange[1] || undefined
        };

        console.log('Fetching products with params:', params);
        
        const { data } = await axios.get('http://localhost:5000/api/products/fetch-products', { params });
        
        console.log('Products data received:', data);
        
        let productsData = data.products || data.data || data;
        let totalCount = data.total || data.totalCount || (Array.isArray(data) ? data.length : 0);
        
        // Find max price for price range
        if (productsData.length > 0) {
          const prices = productsData.map(p => p.price || 0);
          const maxPrice = Math.max(...prices, 10000);
          maxPriceRef.current = maxPrice;
          
          if (filters.priceRange[1] > maxPrice) {
            setFilters(prev => ({
              ...prev,
              priceRange: [prev.priceRange[0], maxPrice],
              maxPrice: maxPrice
            }));
          }
        }
        
        // Apply campaign filter if needed
        let filteredProducts = productsData;
        if (filters.campaign === 'campaign') {
          filteredProducts = productsData.filter(product => campaignMap[product._id]);
          if (filters.campaignName) {
            filteredProducts = filteredProducts.filter(product => {
              const campaign = campaignMap[product._id];
              return campaign && campaign.campaignName === filters.campaignName;
            });
          }
        }
        
        if (currentPage === 1) {
          setProducts(filteredProducts);
        } else {
          setProducts(prev => [...prev, ...filteredProducts]);
        }
        
        setTotalProducts(totalCount);
        setDisplayedProducts(currentPage === 1 ? filteredProducts.length : products.length + filteredProducts.length);
        setHasMoreProducts(productsData.length === productsPerPage);
        setLoading(false);
        setIsLoadingMore(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setLoading(false);
        setIsLoadingMore(false);
        toast.error('Failed to load products. Please try again later.', {
          position: 'bottom-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    };
    
    fetchProducts();
  }, [currentPage, filters, campaignMap]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    
    setFilters(prev => {
      const newFilters = { ...prev, [name]: value };
      
      // If selecting a specific campaign, also set campaign filter to 'campaign'
      if (name === 'campaignName' && value) {
        newFilters.campaign = 'campaign';
      }
      
      return newFilters;
    });
    
    setCurrentPage(1);
  };

  const handlePriceChange = (e, index) => {
    const newPriceRange = [...filters.priceRange];
    newPriceRange[index] = parseInt(e.target.value) || 0;
    
    setFilters(prev => ({
      ...prev,
      priceRange: newPriceRange,
      minPrice: newPriceRange[0],
      maxPrice: newPriceRange[1]
    }));
    
    setCurrentPage(1);
  };

  // Get unique values for filters
  const getUniqueValues = (field) => {
    const values = products.flatMap(product => 
      Array.isArray(product[field]) ? product[field] : [product[field]]
    );
    return [...new Set(values)].filter(val => val !== null && val !== undefined && val !== '');
  };

  const calculateDiscountedPrice = (price, discount, campaignDiscount, campaignFinalPrice) => {
    if (campaignFinalPrice) {
      return campaignFinalPrice;
    }
    
    let finalPrice = price;
    
    if (discount > 0) {
      finalPrice = price - (price * (discount / 100));
    }
    
    if (campaignDiscount > 0) {
      finalPrice = finalPrice - (finalPrice * (campaignDiscount / 100));
    }
    
    return Math.round(finalPrice);
  };

  const handleViewDetails = (productId) => {
    navigate(`/products/single/${productId}`);
  };

  const handleWishlist = (product) => {
    const storedWishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const exists = storedWishlist.some(item => item._id === product._id);
    const updatedWishlist = exists
      ? storedWishlist.filter(item => item._id !== product._id)
      : [...storedWishlist, product];
  
    localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
    setWishlist(updatedWishlist);
  
    toast[exists ? 'error' : 'success'](
      `${product.productName} ${exists ? 'removed from' : 'added to'} wishlist`,
      { 
        position: 'bottom-right',
        theme: 'colored',
        style: { backgroundColor: exists ? '#9E5F57' : '#567A4B', color: '#EFE2B2' }
      }
    );
  };
  
  // Reset all filters
  const resetFilters = () => {
    setFilters({
      search: '',
      category: '',
      subCategory: '',
      color: '',
      size: '',
      sort: 'newest',
      minPrice: 0,
      maxPrice: maxPriceRef.current,
      priceRange: [0, maxPriceRef.current],
      campaign: '',
      campaignName: ''
    });
    
    setCurrentPage(1);
  };

  // Format price
  const formatPrice = (price) => {
    if (!price) return '৳0';
    return `৳${price.toLocaleString()}`;
  };

  // Handle image hover
  const handleMouseEnter = (productId) => {
    setHoveredProduct(productId);
  };

  const handleMouseLeave = () => {
    setHoveredProduct(null);
  };

  // Load more products
  const loadMoreProducts = () => {
    setIsLoadingMore(true);
    setCurrentPage(prev => prev + 1);
  };

  if (loading && currentPage === 1) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Navbar />
        <div className="flex-grow pt-24 pb-16">
          <Loading />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      
      <div className="flex-grow pt-24 pb-16">
        {/* Header Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <div className="text-center mb-8">
            <h1 className="text-5xl md:text-6xl font-light tracking-widest uppercase mb-4 text-black">
              PREMIUM COLLECTION
            </h1>
            <div className="w-24 h-px bg-black mx-auto mb-6"></div>
            <p className="text-lg font-light tracking-widest uppercase text-gray-600">
              DISCOVER EXCLUSIVE PRODUCTS & CAMPAIGNS
            </p>
          </div>

          {/* Campaign Banner */}
          {campaigns.length > 0 && (
            <div className="mb-8 p-6 bg-gradient-to-r from-gray-900 to-black rounded-xl text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <FaBolt className="w-8 h-8 text-yellow-400 animate-pulse" />
                  <div>
                    <h3 className="text-xl font-bold tracking-widest uppercase">
                      ACTIVE CAMPAIGNS
                    </h3>
                    <p className="text-gray-300 text-sm">
                      {campaigns.length} campaign{campaigns.length > 1 ? 's' : ''} running
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {campaigns.slice(0, 2).map(campaign => (
                    <div key={campaign._id} className="flex items-center gap-2">
                      <FaFire className="w-4 h-4 text-red-400" />
                      <span className="font-bold">{campaign.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Filters Top Bar */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
            {/* Search Bar */}
            <div className="relative w-full md:w-96">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FaSearch className="text-gray-500 w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="SEARCH PRODUCTS..."
                className="pl-12 pr-4 py-3 w-full border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm tracking-wider transition-all duration-300"
                value={filters.search}
                onChange={handleFilterChange}
                name="search"
              />
            </div>
            
            {/* Filter Controls */}
            <div className="flex items-center gap-4">
              <button
                className="flex items-center gap-2 text-sm tracking-widest uppercase px-6 py-3 border-2 border-black rounded-lg hover:bg-black hover:text-white transition-all duration-300"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                <FaFilter className="w-4 h-4" />
                <span>{isFilterOpen ? "HIDE FILTERS" : "SHOW FILTERS"}</span>
              </button>
              
              <button
                className="text-sm tracking-widest uppercase border-b-2 border-black pb-1 transition-all duration-300 hover:text-gray-600"
                onClick={resetFilters}
              >
                RESET ALL
              </button>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {isFilterOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 overflow-hidden"
            >
              <div className="bg-white border-2 border-gray-200 rounded-xl p-8 grid grid-cols-1 md:grid-cols-4 gap-8 shadow-lg">
                {/* Category Filter */}
                <div>
                  <h3 className="font-bold text-sm tracking-widest uppercase mb-4">CATEGORY</h3>
                  <select
                    name="category"
                    value={filters.category}
                    onChange={handleFilterChange}
                    className="w-full p-3 border-2 border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm tracking-wider transition-all duration-300"
                  >
                    <option value="">ALL CATEGORIES</option>
                    {getUniqueValues('category').map((category) => (
                      <option key={category} value={category}>
                        {category.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Subcategory Filter */}
                <div>
                  <h3 className="font-bold text-sm tracking-widest uppercase mb-4">SUBCATEGORY</h3>
                  <select
                    name="subCategory"
                    value={filters.subCategory}
                    onChange={handleFilterChange}
                    className="w-full p-3 border-2 border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm tracking-wider transition-all duration-300"
                  >
                    <option value="">ALL SUBCATEGORIES</option>
                    {getUniqueValues('subCategory').map((subCategory) => (
                      <option key={subCategory} value={subCategory}>
                        {subCategory.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Campaign Filter */}
                <div>
                  <h3 className="font-bold text-sm tracking-widest uppercase mb-4">CAMPAIGN</h3>
                  <div className="space-y-4">
                    <select
                      name="campaign"
                      value={filters.campaign}
                      onChange={handleFilterChange}
                      className="w-full p-3 border-2 border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm tracking-wider transition-all duration-300"
                    >
                      <option value="">ALL PRODUCTS</option>
                      <option value="campaign">IN CAMPAIGN ONLY</option>
                    </select>
                    
                    {filters.campaign === 'campaign' && availableCampaigns.length > 0 && (
                      <select
                        name="campaignName"
                        value={filters.campaignName}
                        onChange={handleFilterChange}
                        className="w-full p-3 border-2 border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm tracking-wider transition-all duration-300"
                      >
                        <option value="">ALL CAMPAIGNS</option>
                        {availableCampaigns.map((campaignName) => (
                          <option key={campaignName} value={campaignName}>
                            {campaignName.toUpperCase()}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
                
                {/* Sort Options */}
                <div>
                  <h3 className="font-bold text-sm tracking-widest uppercase mb-4">SORT BY</h3>
                  <select
                    name="sort"
                    value={filters.sort}
                    onChange={handleFilterChange}
                    className="w-full p-3 border-2 border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm tracking-wider transition-all duration-300"
                  >
                    <option value="newest">NEWEST FIRST</option>
                    <option value="low-to-high">PRICE: LOW TO HIGH</option>
                    <option value="high-to-low">PRICE: HIGH TO LOW</option>
                  </select>
                </div>
                
                {/* Price Filter */}
                <div className="md:col-span-2">
                  <h3 className="font-bold text-sm tracking-widest uppercase mb-4">PRICE RANGE</h3>
                  <div className="mb-4 text-sm tracking-widest text-gray-600">
                    <span>{formatPrice(filters.priceRange[0])} - {formatPrice(filters.priceRange[1])}</span>
                  </div>
                  <div className="relative py-6">
                    <div className="relative h-2 bg-gray-300 rounded-full">
                      <div 
                        className="absolute h-2 bg-black rounded-full transition-all duration-300"
                        style={{
                          left: `${(filters.priceRange[0] / maxPriceRef.current) * 100}%`,
                          width: `${((filters.priceRange[1] - filters.priceRange[0]) / maxPriceRef.current) * 100}%`
                        }}
                      ></div>
                      
                      <input
                        type="range"
                        min="0"
                        max={maxPriceRef.current}
                        value={filters.priceRange[0]}
                        onChange={(e) => handlePriceChange(e, 0)}
                        className="absolute top-0 w-full h-2 opacity-0 cursor-pointer"
                      />
                      <input
                        type="range"
                        min="0"
                        max={maxPriceRef.current}
                        value={filters.priceRange[1]}
                        onChange={(e) => handlePriceChange(e, 1)}
                        className="absolute top-0 w-full h-2 opacity-0 cursor-pointer"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6 mt-8">
                      <div>
                        <label className="block text-xs tracking-widest uppercase mb-2 text-gray-600">MIN PRICE</label>
                        <input
                          type="number"
                          min="0"
                          max={filters.priceRange[1]}
                          value={filters.priceRange[0]}
                          onChange={(e) => handlePriceChange(e, 0)}
                          className="w-full p-3 border-2 border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm tracking-wider transition-all duration-300"
                        />
                      </div>
                      <div>
                        <label className="block text-xs tracking-widest uppercase mb-2 text-gray-600">MAX PRICE</label>
                        <input
                          type="number"
                          min={filters.priceRange[0]}
                          max={maxPriceRef.current}
                          value={filters.priceRange[1]}
                          onChange={(e) => handlePriceChange(e, 1)}
                          className="w-full p-3 border-2 border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm tracking-wider transition-all duration-300"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Results Summary */}
          <div className="flex justify-between items-center mb-12 pb-6 border-b-2 border-gray-200">
            <p className="text-sm tracking-widest uppercase text-gray-600">
              SHOWING <span className="font-bold text-black">{displayedProducts}</span> PRODUCTS
              {hasMoreProducts && (
                <button 
                  onClick={loadMoreProducts}
                  className="ml-4 text-sm tracking-widest uppercase text-gray-500 hover:text-black transition-colors"
                >
                  LOAD MORE
                </button>
              )}
            </p>
            
            {/* Mobile Filter Toggle */}
            <button
              className="md:hidden flex items-center gap-2 text-sm tracking-widest uppercase px-4 py-2 border-2 border-black rounded-lg transition-all duration-300"
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            >
              <FaFilter className="w-4 h-4" />
              <span>FILTERS</span>
            </button>
          </div>
          
          {/* Mobile Filters Panel */}
          <AnimatePresence>
            {mobileFiltersOpen && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="md:hidden bg-white border-2 border-gray-200 p-6 mb-8 rounded-xl shadow-lg overflow-hidden"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold tracking-widest uppercase">FILTERS</h2>
                  <button onClick={() => setMobileFiltersOpen(false)}>
                    <FaTimes className="text-gray-600 w-5 h-5" />
                  </button>
                </div>
                
                {/* Mobile filter content */}
                <div className="space-y-6">
                  <div>
                    <h3 className="font-bold text-sm tracking-widest uppercase mb-3">CAMPAIGN</h3>
                    <select
                      name="campaign"
                      value={filters.campaign}
                      onChange={handleFilterChange}
                      className="w-full p-3 border-2 border-gray-300 rounded-lg bg-white text-sm tracking-wider"
                    >
                      <option value="">ALL PRODUCTS</option>
                      <option value="campaign">IN CAMPAIGN ONLY</option>
                    </select>
                  </div>
                  
                  <div>
                    <h3 className="font-bold text-sm tracking-widest uppercase mb-3">SORT BY</h3>
                    <select
                      name="sort"
                      value={filters.sort}
                      onChange={handleFilterChange}
                      className="w-full p-3 border-2 border-gray-300 rounded-lg bg-white text-sm tracking-wider"
                    >
                      <option value="newest">NEWEST FIRST</option>
                      <option value="low-to-high">PRICE: LOW TO HIGH</option>
                      <option value="high-to-low">PRICE: HIGH TO LOW</option>
                    </select>
                  </div>
                  
                  <div className="pt-4">
                    <button
                      onClick={resetFilters}
                      className="w-full py-3 bg-black text-white text-sm tracking-widest uppercase rounded-lg transition-all duration-300 hover:bg-gray-900"
                    >
                      RESET FILTERS
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Products Grid */}
          {products.length > 0 ? (
            <div>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product, index) => {
                  const campaignData = campaignMap[product._id];
                  const isInCampaign = !!campaignData;
                  const campaignDiscount = campaignData?.campaignDiscount || 0;
                  const campaignFinalPrice = campaignData?.finalPrice;
                  
                  const discountedPrice = calculateDiscountedPrice(
                    product.price, 
                    product.discount || 0,
                    campaignDiscount,
                    campaignFinalPrice
                  );
                  
                  const isInWishlist = wishlist.some(item => item._id === product._id);
                  
                  const imageToShow = 
                    hoveredProduct === product._id && product.images?.[1] 
                      ? product.images[1] 
                      : product.images?.[0] || "https://via.placeholder.com/300x300?text=No+Image";
                  
                  return (
                    <motion.div 
                      key={product._id} 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      whileHover={{ y: -8 }}
                      className={`relative flex flex-col h-full ${isInCampaign ? 'border-2 border-transparent bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 p-1 rounded-2xl' : 'border border-gray-200 rounded-xl'} transition-all duration-500 hover:shadow-2xl overflow-hidden group cursor-pointer`}
                      onMouseEnter={() => handleMouseEnter(product._id)}
                      onMouseLeave={handleMouseLeave}
                      onClick={() => handleViewDetails(product._id)}
                    >
                      <div className={`relative flex flex-col h-full ${isInCampaign ? 'bg-white rounded-xl' : 'bg-white'} overflow-hidden`}>
                        {/* Campaign Badge & Countdown */}
                        {isInCampaign && (
                          <>
                            <CampaignBadge 
                              campaignName={campaignData.campaignName} 
                              discount={campaignDiscount}
                            />
                            <div className="absolute top-3 right-3 z-20">
                              <CampaignCountdown 
                                endTime={campaignData.campaignEndTime} 
                                compact={true}
                              />
                            </div>
                          </>
                        )}
                        
                        {/* Regular Discount Badge */}
                        {!isInCampaign && product.discount > 0 && (
                          <div className="absolute top-3 left-3 z-20 bg-black text-white font-bold py-1.5 px-3 text-xs tracking-widest uppercase rounded-lg">
                            {product.discount}% OFF
                          </div>
                        )}
                        
                        {/* Product Image */}
                        <div className={`relative overflow-hidden aspect-square ${isInCampaign ? 'bg-gradient-to-br from-gray-50 to-white' : 'bg-white'} flex items-center justify-center`}>
                          <ProductImage
                            src={imageToShow}
                            alt={product.productName}
                            className="w-full h-full object-contain p-6 transition-all duration-700 group-hover:scale-105"
                          />
                          
                          {/* Wishlist Button */}
                          <div className="absolute top-3 right-3 z-20">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleWishlist(product);
                              }}
                              className="p-2.5 rounded-full bg-white/90 backdrop-blur-sm border border-gray-300 hover:bg-gray-100 transition-all duration-300 transform hover:scale-110"
                            >
                              <FontAwesomeIcon
                                icon={isInWishlist ? solidHeart : regularHeart}
                                className={`text-lg ${isInWishlist ? 'text-red-500' : 'text-gray-600'}`}
                              />
                            </button>
                          </div>
                          
                          {/* Out of Stock Overlay */}
                          {product.stock === 0 && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-white text-sm font-bold tracking-widest uppercase z-30">
                              OUT OF STOCK
                            </div>
                          )}
                          
                          {/* Campaign Glow Effect */}
                          {isInCampaign && (
                            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                              <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-purple-500/10 to-blue-500/10"></div>
                            </div>
                          )}
                        </div>
                        
                        {/* Product Info */}
                        <div className="flex flex-col flex-grow p-5 bg-white">
                          <div className="flex justify-between items-start mb-3 min-h-[50px]">
                            <h3 className="font-bold uppercase tracking-wider text-sm overflow-hidden line-clamp-2 group-hover:underline">
                              {product.productName}
                            </h3>
                            <div className="flex flex-col items-end min-w-[80px]">
                              <div className="flex flex-col items-end">
                                <p className="font-bold text-lg tracking-wider whitespace-nowrap">
                                  {formatPrice(discountedPrice)}
                                </p>
                                {(product.discount > 0 || isInCampaign) && (
                                  <span className="text-xs line-through text-gray-500 whitespace-nowrap">
                                    {formatPrice(product.price)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <p className="text-xs tracking-wider text-gray-600 mb-3 truncate uppercase">
                            CODE: {product.productCode}
                          </p>
                          
                          <div className="text-xs mb-4 flex flex-wrap items-center min-h-[28px] gap-2">
                            <span className="px-3 py-1.5 bg-gray-100 border border-gray-300 rounded-lg mb-1 transition-all duration-300 hover:border-black uppercase tracking-wider">
                              {product.category}
                            </span>
                            <span className="px-3 py-1.5 bg-gray-100 border border-gray-300 rounded-lg mb-1 transition-all duration-300 hover:border-black uppercase tracking-wider">
                              {product.subCategory}
                            </span>
                          </div>
                          
                          {/* Campaign Savings */}
                          {isInCampaign && (
                            <div className="mb-4">
                              <div className="text-xs font-bold tracking-wider uppercase text-red-600 animate-pulse">
                                SAVE {formatPrice(product.price - discountedPrice)}
                              </div>
                            </div>
                          )}
                          
                          <button 
                            className={`mt-auto w-full py-3 flex items-center justify-center gap-2 uppercase text-sm font-bold tracking-wider transition-all duration-300 transform hover:scale-[1.02] ${
                              product.stock === 0 
                                ? 'bg-gray-300 cursor-not-allowed text-gray-500' 
                                : isInCampaign
                                ? 'bg-gradient-to-r from-red-600 to-blue-600 text-white hover:from-red-700 hover:to-blue-700'
                                : 'bg-black text-white hover:bg-gray-900'
                            } rounded-lg`}
                            disabled={product.stock === 0}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDetails(product._id);
                            }}
                          >
                            {product.stock === 0 ? 'OUT OF STOCK' : 'VIEW DETAILS'}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
              
              {/* Load More Button */}
              {hasMoreProducts && (
                <div className="flex justify-center mt-16">
                  <button
                    onClick={loadMoreProducts}
                    disabled={isLoadingMore}
                    className={`px-12 py-4 border-2 border-black text-sm font-bold tracking-widest uppercase rounded-lg transition-all duration-500 hover:bg-black hover:text-white ${
                      isLoadingMore 
                        ? 'bg-gray-100 cursor-not-allowed border-gray-300' 
                        : ''
                    }`}
                  >
                    {isLoadingMore ? (
                      <span className="flex items-center gap-3">
                        <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        LOADING...
                      </span>
                    ) : (
                      <span className="flex items-center gap-3">
                        LOAD MORE <FaArrowDown className="animate-bounce" />
                      </span>
                    )}
                  </button>
                </div>
              )}

              {/* Skeleton Loading for More Products */}
              {isLoadingMore && (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <SkeletonProduct key={index} />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-24 animate-fade-in">
              <p className="text-lg tracking-widest uppercase mb-6 text-gray-600">NO PRODUCTS FOUND</p>
              <button
                onClick={resetFilters}
                className="px-8 py-3 bg-black text-white font-bold tracking-widest text-sm uppercase rounded-lg transition-all duration-300 hover:bg-gray-900"
              >
                RESET FILTERS
              </button>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AllProductsClient;