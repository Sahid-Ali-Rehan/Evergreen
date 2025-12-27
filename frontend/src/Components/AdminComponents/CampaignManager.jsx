import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaClock, FaCalendarAlt, FaTag, FaImage, FaEdit, FaTrash,
  FaPlay, FaStop, FaHistory, FaRocket, FaSave, FaTimes,
  FaRedo, FaChevronDown, FaChevronUp, FaSearch, FaFilter,
  FaCopy, FaShoppingBag, FaPlus, FaMinus, FaCheck, FaSpinner
} from 'react-icons/fa';

const COLORS = {
  background: "#FFFFFF",
  primary: "#000000",
  secondary: "#333333",
  accent: "#666666",
  border: "#E0E0E0",
  card: "#F8F8F8",
  success: "#10B981",
  error: "#EF4444",
  warning: "#F59E0B",
  info: "#3B82F6"
};

const CampaignManager = () => {
  const [activeTab, setActiveTab] = useState('active');
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [campaignFilter, setCampaignFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [expandedCampaigns, setExpandedCampaigns] = useState({});
  const [processing, setProcessing] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Auto-detect API base URL
  const API_BASE = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000' 
    : 'https://prexo.onrender.com';

  // Form state with multiple banner URLs
  const [formData, setFormData] = useState({
    name: '',
    bannerImages: [''],
    extraDiscount: 0,
    startTime: new Date().toISOString().slice(0, 16),
    endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    status: 'draft'
  });

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Get token helper
  const getToken = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login first');
      return null;
    }
    return token;
  }, []);

  // Enhanced fetch campaigns with caching
  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const token = getToken();
      if (!token) return;

      let endpoint = '';
      
      switch (activeTab) {
        case 'active':
          endpoint = `${API_BASE}/api/campaigns/home/active`;
          break;
        case 'draft':
          endpoint = `${API_BASE}/api/campaigns?status=draft`;
          break;
        case 'completed':
          endpoint = `${API_BASE}/api/campaigns?status=completed`;
          break;
        default:
          endpoint = `${API_BASE}/api/campaigns`;
      }

      const response = await axios.get(endpoint, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Cache-Control': 'no-cache'
        },
        timeout: 10000
      });

      // Handle different response structures
      let data = response.data;
      if (data && !Array.isArray(data) && data.campaigns) {
        data = data.campaigns;
      }
      if (Array.isArray(data)) {
        // Sort by status for better visibility
        data.sort((a, b) => {
          const statusOrder = { active: 0, draft: 1, completed: 2 };
          return statusOrder[a.status] - statusOrder[b.status];
        });
        setCampaigns(data);
      } else {
        setCampaigns([data] || []);
      }
      
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        window.location.reload();
      } else if (error.code === 'ECONNABORTED') {
        toast.error('Request timeout. Please check your connection.');
      } else {
        toast.error('Failed to fetch campaigns');
      }
    } finally {
      setLoading(false);
    }
  }, [activeTab, API_BASE, getToken]);

  // Fetch products with retry logic
  const fetchProducts = useCallback(async (search = '') => {
    try {
      const token = getToken();
      if (!token) return;

      const response = await axios.get(
        `${API_BASE}/api/campaigns/products/available?search=${search}&limit=50`,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Cache-Control': 'no-cache'
          },
          timeout: 8000
        }
      );
      
      let productsData = [];
      if (Array.isArray(response.data)) {
        productsData = response.data;
      } else if (response.data.products) {
        productsData = response.data.products;
      } else if (response.data.data) {
        productsData = response.data.data;
      }
      
      setProducts(productsData);
      setFilteredProducts(productsData.slice(0, 20));
      
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Could not load products');
    }
  }, [API_BASE, getToken]);

  // Filter products based on search
  useEffect(() => {
    if (debouncedSearch) {
      const filtered = products.filter(product =>
        product.productName?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        product.productCode?.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
      setFilteredProducts(filtered.slice(0, 20));
    } else {
      setFilteredProducts(products.slice(0, 20));
    }
  }, [debouncedSearch, products]);

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'extraDiscount' 
        ? Math.min(100, Math.max(0, parseInt(value) || 0)) 
        : value
    }));
  };

  // Handle banner URL changes
  const handleBannerUrlChange = (index, value) => {
    const newBannerImages = [...formData.bannerImages];
    newBannerImages[index] = value;
    setFormData(prev => ({
      ...prev,
      bannerImages: newBannerImages
    }));
  };

  // Add more banner URL field
  const addBannerUrlField = () => {
    if (formData.bannerImages.length < 5) {
      setFormData(prev => ({
        ...prev,
        bannerImages: [...prev.bannerImages, '']
      }));
    } else {
      toast.warning('Maximum 5 banner images allowed');
    }
  };

  // Remove banner URL field
  const removeBannerUrlField = (index) => {
    if (formData.bannerImages.length > 1) {
      const newBannerImages = formData.bannerImages.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        bannerImages: newBannerImages
      }));
    }
  };

  // Toggle campaign expansion
  const toggleCampaignExpansion = (campaignId) => {
    setExpandedCampaigns(prev => ({
      ...prev,
      [campaignId]: !prev[campaignId]
    }));
  };

  // Toggle product selection
  const toggleProductSelection = (product) => {
    const isSelected = selectedProducts.some(p => p._id === product._id);
    
    if (isSelected) {
      setSelectedProducts(prev => prev.filter(p => p._id !== product._id));
    } else {
      setSelectedProducts(prev => [...prev, {
        _id: product._id,
        productName: product.productName,
        price: product.price || 0,
        discount: product.discount || 0,
        productCode: product.productCode
      }]);
    }
  };

  // Calculate final price with discounts
  const calculateFinalPrice = (product) => {
    const originalPrice = product.price || 0;
    const originalDiscount = product.discount || 0;
    const campaignDiscount = parseInt(formData.extraDiscount) || 0;
    
    let priceAfterOriginalDiscount = originalPrice;
    if (originalDiscount > 0) {
      priceAfterOriginalDiscount = originalPrice - (originalPrice * originalDiscount / 100);
    }
    
    let finalPrice = priceAfterOriginalDiscount;
    if (campaignDiscount > 0) {
      finalPrice = priceAfterOriginalDiscount - (priceAfterOriginalDiscount * campaignDiscount / 100);
    }
    
    return Math.round(finalPrice);
  };

  // Validate form data
  const validateForm = () => {
    const validBannerImages = formData.bannerImages.filter(url => url.trim() !== '');
    
    if (!formData.name.trim()) {
      toast.error('Campaign name is required');
      return false;
    }
    
    if (validBannerImages.length === 0) {
      toast.error('At least one banner image URL is required');
      return false;
    }
    
    if (selectedProducts.length === 0) {
      toast.error('Please select at least one product');
      return false;
    }
    
    const start = new Date(formData.startTime);
    const end = new Date(formData.endTime);
    if (end <= start) {
      toast.error('End time must be after start time');
      return false;
    }
    
    return true;
  };

  // Create campaign
  const handleCreateCampaign = async () => {
    if (!validateForm()) return;
    
    setProcessing(true);
    const token = getToken();
    if (!token) return;

    try {
      const validBannerImages = formData.bannerImages.filter(url => url.trim() !== '');
      
      const campaignData = {
        name: formData.name,
        bannerImage: validBannerImages[0],
        bannerImages: validBannerImages,
        products: selectedProducts.map(p => p._id),
        extraDiscount: parseInt(formData.extraDiscount) || 0,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
        status: formData.status
      };

      const response = await axios.post(
        `${API_BASE}/api/campaigns/create`, 
        campaignData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 15000
        }
      );

      toast.success('Campaign created successfully!');
      setShowCreateModal(false);
      resetForm();
      fetchCampaigns();
    } catch (error) {
      console.error('Error creating campaign:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to create campaign';
      toast.error(errorMsg);
    } finally {
      setProcessing(false);
    }
  };

  // Update campaign
  const handleUpdateCampaign = async () => {
    if (!selectedCampaign) return;
    if (!validateForm()) return;
    
    setProcessing(true);
    const token = getToken();
    if (!token) return;

    try {
      const validBannerImages = formData.bannerImages.filter(url => url.trim() !== '');
      
      const campaignData = {
        name: formData.name,
        bannerImage: validBannerImages[0],
        bannerImages: validBannerImages,
        products: selectedProducts.map(p => p._id),
        extraDiscount: parseInt(formData.extraDiscount) || 0,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
        status: formData.status
      };

      // Try update endpoint
      const response = await axios.put(
        `${API_BASE}/api/campaigns/${selectedCampaign._id}`,
        campaignData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 15000
        }
      );
      
      toast.success('Campaign updated successfully!');
      setShowEditModal(false);
      resetForm();
      fetchCampaigns();
    } catch (error) {
      console.error('Error updating campaign:', error);
      
      // If update fails, try using create endpoint with duplicate
      if (error.response?.status === 404) {
        try {
          const duplicateData = {
            name: formData.name + ' (Updated)',
            bannerImage: formData.bannerImages[0],
            bannerImages: formData.bannerImages,
            products: selectedProducts.map(p => p._id),
            extraDiscount: parseInt(formData.extraDiscount) || 0,
            startTime: new Date(formData.startTime).toISOString(),
            endTime: new Date(formData.endTime).toISOString(),
            status: formData.status
          };
          
          await axios.post(`${API_BASE}/api/campaigns/create`, duplicateData, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          toast.success('Campaign updated via duplication');
          setShowEditModal(false);
          resetForm();
          fetchCampaigns();
        } catch (duplicateError) {
          toast.error('Failed to update campaign');
        }
      } else {
        toast.error(error.response?.data?.message || 'Failed to update campaign');
      }
    } finally {
      setProcessing(false);
    }
  };

  // Launch campaign
  const handleLaunchCampaign = async (campaignId) => {
    try {
      const token = getToken();
      if (!token) return;

      await axios.put(
        `${API_BASE}/api/campaigns/launch/${campaignId}`, 
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000
        }
      );

      toast.success('Campaign launched successfully!');
      fetchCampaigns();
    } catch (error) {
      console.error('Error launching campaign:', error);
      toast.error(error.response?.data?.message || 'Failed to launch campaign');
    }
  };

  // Stop campaign
  const handleStopCampaign = async (campaignId) => {
    try {
      const token = getToken();
      if (!token) return;

      await axios.put(
        `${API_BASE}/api/campaigns/stop/${campaignId}`, 
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000
        }
      );

      toast.success('Campaign stopped successfully');
      fetchCampaigns();
    } catch (error) {
      console.error('Error stopping campaign:', error);
      toast.error('Failed to stop campaign');
    }
  };

  // Delete campaign
  const handleDeleteCampaign = async (campaignId) => {
    if (!window.confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) return;

    try {
      const token = getToken();
      if (!token) return;

      await axios.delete(
        `${API_BASE}/api/campaigns/delete/${campaignId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000
        }
      );

      toast.success('Campaign deleted successfully');
      fetchCampaigns();
    } catch (error) {
      console.error('Error deleting campaign:', error);
      if (error.response?.status === 404) {
        toast.error('Delete endpoint not found. Please check backend configuration.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to delete campaign');
      }
    }
  };

  // Duplicate campaign
  const handleDuplicateCampaign = async (campaign) => {
    try {
      const token = getToken();
      if (!token) return;

      const duplicateData = {
        name: `${campaign.name} (Copy)`,
        bannerImage: campaign.bannerImage,
        bannerImages: campaign.bannerImages || [campaign.bannerImage],
        products: campaign.products?.map(p => p.productId?._id || p.productId).filter(id => id) || [],
        extraDiscount: campaign.extraDiscount || 0,
        startTime: new Date(campaign.startTime).toISOString(),
        endTime: new Date(campaign.endTime).toISOString(),
        status: 'draft'
      };

      await axios.post(
        `${API_BASE}/api/campaigns/create`, 
        duplicateData,
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 15000
        }
      );

      toast.success('Campaign duplicated successfully');
      fetchCampaigns();
    } catch (error) {
      console.error('Error duplicating campaign:', error);
      toast.error('Failed to duplicate campaign');
    }
  };

  // Edit campaign
  const handleEditCampaign = (campaign) => {
    setSelectedCampaign(campaign);
    
    const bannerImages = campaign.bannerImages || [campaign.bannerImage];
    
    setFormData({
      name: campaign.name || '',
      bannerImages: bannerImages.length > 0 ? bannerImages : [''],
      extraDiscount: campaign.extraDiscount || 0,
      startTime: new Date(campaign.startTime).toISOString().slice(0, 16),
      endTime: new Date(campaign.endTime).toISOString().slice(0, 16),
      status: campaign.status || 'draft'
    });
    
    if (campaign.products && campaign.products.length > 0) {
      const productDetails = campaign.products.map(p => ({
        _id: p.productId?._id || p.productId,
        productName: p.productId?.productName || 'Product',
        price: p.productId?.price || p.originalPrice || 0,
        discount: p.productId?.discount || 0,
        productCode: p.productId?.productCode || ''
      }));
      setSelectedProducts(productDetails);
    } else {
      setSelectedProducts([]);
    }
    
    fetchProducts();
    setShowEditModal(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      bannerImages: [''],
      extraDiscount: 0,
      startTime: new Date().toISOString().slice(0, 16),
      endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      status: 'draft'
    });
    setSelectedProducts([]);
    setSelectedCampaign(null);
    setSearchTerm('');
    setProcessing(false);
  };

  // Format date
  const formatDate = useCallback((dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Invalid Date';
    }
  }, []);

  // Calculate time left
  const calculateTimeLeft = useCallback((endTime) => {
    if (!endTime) return 'No end time';
    
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
  }, []);

  // Open create modal
  const openCreateModal = () => {
    resetForm();
    fetchProducts();
    setShowCreateModal(true);
  };

  // Filter and sort campaigns (memoized)
  const filteredCampaigns = useMemo(() => {
    let filtered = [...campaigns];
    
    if (campaignFilter !== 'all') {
      filtered = filtered.filter(campaign => campaign.status === campaignFilter);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(campaign =>
        campaign.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case 'oldest':
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'endDate':
          return new Date(a.endTime) - new Date(b.endTime);
        default:
          return 0;
      }
    });
    
    return filtered;
  }, [campaigns, campaignFilter, searchTerm, sortBy]);

  // Fetch campaigns on tab change
  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  // Styles
  const styles = {
    header: "text-4xl md:text-5xl font-thin tracking-widest uppercase mb-2",
    subheader: "text-sm font-thin tracking-widest uppercase opacity-75",
    button: "px-6 py-3 rounded-lg font-thin tracking-widest uppercase transition-all duration-300 hover:scale-105 active:scale-95",
    card: "rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-lg transition-all duration-300",
    input: "w-full p-4 rounded-lg border border-gray-300 font-thin tracking-wide bg-white focus:border-black focus:ring-1 focus:ring-black",
    label: "block text-sm font-thin tracking-widest uppercase mb-2",
    status: {
      active: "px-4 py-1.5 rounded-full bg-green-100 text-green-800 text-xs font-thin tracking-widest uppercase",
      draft: "px-4 py-1.5 rounded-full bg-gray-100 text-gray-800 text-xs font-thin tracking-widest uppercase",
      completed: "px-4 py-1.5 rounded-full bg-blue-100 text-blue-800 text-xs font-thin tracking-widest uppercase"
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className={styles.header}>
              Campaign Manager
            </h1>
            <p className={styles.subheader}>
              Manage promotional campaigns & exclusive offers
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <motion.button
              onClick={fetchCampaigns}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`${styles.button} bg-gray-100 text-black border border-gray-300`}
              disabled={loading}
            >
              {loading ? (
                <FaSpinner className="w-5 h-5 animate-spin mx-auto" />
              ) : (
                <>
                  <FaRedo className="w-4 h-4 inline mr-2" />
                  Refresh
                </>
              )}
            </motion.button>
            
            <motion.button
              onClick={openCreateModal}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`${styles.button} bg-black text-white`}
            >
              <FaPlus className="w-4 h-4 inline mr-2" />
              New Campaign
            </motion.button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-gray-200 mb-6">
          {['active', 'draft', 'completed', 'all'].map((tab) => (
            <button
              key={tab}
              className={`px-6 py-3 font-thin tracking-widest uppercase transition-all ${activeTab === tab 
                ? 'border-b-2 border-black text-black' 
                : 'text-gray-500 hover:text-black'}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab} ({campaigns.filter(c => tab === 'all' || c.status === tab).length})
            </button>
          ))}
        </div>

        {/* Filters and Sort */}
        <div className="flex flex-wrap gap-4 mb-6 p-4 bg-white rounded-xl shadow-sm">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <FaSearch className="w-4 h-4 text-gray-600" />
            <input
              type="text"
              placeholder="Search Campaigns..."
              className="flex-1 p-3 border border-gray-300 rounded-lg font-thin tracking-wide"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <FaFilter className="w-4 h-4 text-gray-600" />
            <select
              value={campaignFilter}
              onChange={(e) => setCampaignFilter(e.target.value)}
              className="p-3 border border-gray-300 rounded-lg bg-white font-thin tracking-wide"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="p-3 border border-gray-300 rounded-lg bg-white font-thin tracking-wide"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Name A-Z</option>
              <option value="endDate">End Date</option>
            </select>
          </div>
        </div>

        {/* Campaigns Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center gap-4">
              <FaSpinner className="w-12 h-12 animate-spin text-black" />
              <p className="font-thin tracking-widest uppercase text-gray-600">
                Loading Campaigns...
              </p>
            </div>
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <FaTag className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-thin tracking-widest uppercase mb-2 text-black">
              No Campaigns Found
            </h3>
            <p className="text-gray-600 font-thin tracking-wide">
              Create your first campaign to get started
            </p>
            <button
              onClick={openCreateModal}
              className="mt-6 px-6 py-3 bg-black text-white rounded-lg font-thin tracking-widest uppercase hover:bg-gray-800"
            >
              Create Campaign
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredCampaigns.map((campaign) => (
              <motion.div
                key={campaign._id}
                className={styles.card}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -4 }}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={campaign.bannerImage}
                          alt={campaign.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/100x100?text=Campaign';
                          }}
                        />
                      </div>
                      <div>
                        <h3 className="text-xl font-thin tracking-widest uppercase text-black mb-1">
                          {campaign.name}
                        </h3>
                        <p className="text-xs text-gray-600 font-thin tracking-wide">
                          ID: {campaign._id?.substring(0, 8)} • {formatDate(campaign.createdAt)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={styles.status[campaign.status]}>
                        {campaign.status}
                      </span>
                      <button
                        onClick={() => toggleCampaignExpansion(campaign._id)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                      >
                        {expandedCampaigns[campaign._id] ? (
                          <FaChevronUp className="w-4 h-4" />
                        ) : (
                          <FaChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    <div className="text-center p-3 rounded-lg border border-gray-100 bg-gray-50">
                      <p className="text-xs font-thin tracking-widest uppercase text-gray-600">
                        Products
                      </p>
                      <p className="text-xl font-thin text-black">
                        {campaign.products?.length || 0}
                      </p>
                    </div>
                    
                    <div className="text-center p-3 rounded-lg border border-gray-100 bg-gray-50">
                      <p className="text-xs font-thin tracking-widest uppercase text-gray-600">
                        Discount
                      </p>
                      <p className="text-xl font-thin text-green-600">
                        {campaign.extraDiscount || 0}%
                      </p>
                    </div>
                    
                    <div className="text-center p-3 rounded-lg border border-gray-100 bg-gray-50">
                      <p className="text-xs font-thin tracking-widest uppercase text-gray-600">
                        Start
                      </p>
                      <p className="text-sm font-thin text-black">
                        {formatDate(campaign.startTime).split(',')[0]}
                      </p>
                    </div>
                    
                    <div className="text-center p-3 rounded-lg border border-gray-100 bg-gray-50">
                      <p className="text-xs font-thin tracking-widest uppercase text-gray-600">
                        End
                      </p>
                      <p className="text-sm font-thin text-black">
                        {formatDate(campaign.endTime).split(',')[0]}
                      </p>
                    </div>
                  </div>

                  {campaign.status === 'active' && campaign.endTime && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FaClock className="w-4 h-4 text-yellow-600" />
                        <span className="font-thin tracking-widest uppercase text-yellow-700">
                          {calculateTimeLeft(campaign.endTime)}
                        </span>
                      </div>
                    </div>
                  )}

                  <AnimatePresence>
                    {expandedCampaigns[campaign._id] && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-gray-100 pt-4 mt-4">
                          <div className="mb-4">
                            <h4 className="font-thin tracking-widest uppercase text-black mb-2">
                              Banner Images
                            </h4>
                            <div className="flex gap-2 overflow-x-auto pb-2">
                              {(campaign.bannerImages || [campaign.bannerImage]).map((img, idx) => (
                                <div key={idx} className="flex-shrink-0">
                                  <div className="h-24 w-32 rounded-lg overflow-hidden border border-gray-200">
                                    <img
                                      src={img}
                                      alt={`Banner ${idx + 1}`}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div className="mb-4">
                            <h4 className="font-thin tracking-widest uppercase text-black mb-2">
                              Products ({campaign.products?.length || 0})
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {campaign.products?.slice(0, 4).map((productItem, idx) => (
                                <div key={idx} className="flex items-center gap-2 p-2 border border-gray-100 rounded">
                                  <div className="h-8 w-8 rounded overflow-hidden bg-gray-100">
                                    {productItem.productId?.images?.[0] ? (
                                      <img
                                        src={productItem.productId.images[0]}
                                        alt={productItem.productId?.productName}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                        <FaShoppingBag className="w-3 h-3 text-gray-400" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-xs font-thin truncate text-black">
                                      {productItem.productId?.productName || `Product ${idx + 1}`}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                      ৳{productItem.finalPrice || productItem.productId?.price || 'N/A'}
                                    </p>
                                  </div>
                                </div>
                              ))}
                              {campaign.products?.length > 4 && (
                                <div className="p-2 text-center border border-gray-100 rounded">
                                  <p className="text-sm text-gray-600">
                                    +{campaign.products.length - 4} more products
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                    {campaign.status === 'draft' && (
                      <motion.button
                        onClick={() => handleLaunchCampaign(campaign._id)}
                        className="px-4 py-2 rounded-lg text-sm font-thin tracking-widest uppercase bg-green-600 text-white hover:bg-green-700"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <FaRocket className="w-3 h-3 inline mr-2" />
                        Launch
                      </motion.button>
                    )}
                    
                    {campaign.status === 'active' && (
                      <motion.button
                        onClick={() => handleStopCampaign(campaign._id)}
                        className="px-4 py-2 rounded-lg text-sm font-thin tracking-widest uppercase bg-red-600 text-white hover:bg-red-700"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <FaStop className="w-3 h-3 inline mr-2" />
                        Stop
                      </motion.button>
                    )}

                    <motion.button
                      onClick={() => handleEditCampaign(campaign)}
                      className="px-4 py-2 rounded-lg text-sm font-thin tracking-widest uppercase border border-gray-300 text-black hover:bg-gray-100"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FaEdit className="w-3 h-3 inline mr-2" />
                      Edit
                    </motion.button>

                    <motion.button
                      onClick={() => handleDuplicateCampaign(campaign)}
                      className="px-4 py-2 rounded-lg text-sm font-thin tracking-widest uppercase border border-gray-300 text-yellow-600 hover:bg-yellow-50"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FaCopy className="w-3 h-3 inline mr-2" />
                      Duplicate
                    </motion.button>

                    <motion.button
                      onClick={() => handleDeleteCampaign(campaign._id)}
                      className="px-4 py-2 rounded-lg text-sm font-thin tracking-widest uppercase border border-gray-300 text-red-600 hover:bg-red-50"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FaTrash className="w-3 h-3 inline mr-2" />
                      Delete
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Create Campaign Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-thin tracking-widest uppercase text-black">
                    Create New Campaign
                  </h2>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="p-2 rounded-full hover:bg-gray-100"
                    disabled={processing}
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column - Campaign Details */}
                  <div className="space-y-4">
                    <div>
                      <label className={styles.label}>
                        Campaign Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={styles.input}
                        placeholder="Eid Festival Sale"
                        disabled={processing}
                      />
                    </div>

                    <div>
                      <label className={styles.label}>
                        Banner Images (URLs) *
                      </label>
                      {formData.bannerImages.map((url, index) => (
                        <div key={index} className="flex gap-2 mb-2">
                          <input
                            type="text"
                            value={url}
                            onChange={(e) => handleBannerUrlChange(index, e.target.value)}
                            className={styles.input}
                            placeholder={`https://example.com/banner${index + 1}.jpg`}
                            disabled={processing}
                          />
                          {formData.bannerImages.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeBannerUrlField(index)}
                              className="p-3 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 disabled:opacity-50"
                              disabled={processing}
                            >
                              <FaMinus className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addBannerUrlField}
                        className="mt-2 px-4 py-2 bg-gray-100 text-black rounded-lg hover:bg-gray-200 flex items-center gap-2 disabled:opacity-50"
                        disabled={formData.bannerImages.length >= 5 || processing}
                      >
                        <FaPlus className="w-4 h-4" />
                        Add More URL
                      </button>
                      <p className="text-xs mt-1 text-gray-600 font-thin">
                        Enter image URLs (max 5). First URL is main banner.
                      </p>
                    </div>

                    <div>
                      <label className={styles.label}>
                        Extra Discount (%) *
                      </label>
                      <input
                        type="range"
                        name="extraDiscount"
                        value={formData.extraDiscount}
                        onChange={handleChange}
                        min="0"
                        max="100"
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        disabled={processing}
                      />
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-sm text-gray-600">0%</span>
                        <span className="text-xl font-thin text-black">
                          {formData.extraDiscount}%
                        </span>
                        <span className="text-sm text-gray-600">100%</span>
                      </div>
                    </div>

                    <div>
                      <label className={styles.label}>
                        Start Time *
                      </label>
                      <input
                        type="datetime-local"
                        name="startTime"
                        value={formData.startTime}
                        onChange={handleChange}
                        className={styles.input}
                        disabled={processing}
                      />
                    </div>

                    <div>
                      <label className={styles.label}>
                        End Time *
                      </label>
                      <input
                        type="datetime-local"
                        name="endTime"
                        value={formData.endTime}
                        onChange={handleChange}
                        className={styles.input}
                        disabled={processing}
                      />
                    </div>

                    <div>
                      <label className={styles.label}>
                        Status
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className={styles.input}
                        disabled={processing}
                      >
                        <option value="draft">Draft</option>
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  </div>

                  {/* Right Column - Product Selection */}
                  <div>
                    <div className="mb-4">
                      <label className={styles.label}>
                        Select Products *
                      </label>
                      <input
                        type="text"
                        placeholder="Search products by name or code..."
                        className={styles.input + " mb-3"}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        disabled={processing}
                      />
                      
                      <div className="h-64 overflow-y-auto border border-gray-300 rounded-lg">
                        {filteredProducts.length === 0 ? (
                          <div className="p-4 text-center text-gray-600 font-thin">
                            {debouncedSearch ? 'No matching products found' : 'Search for products...'}
                          </div>
                        ) : (
                          filteredProducts.map((product) => {
                            const isSelected = selectedProducts.some(p => p._id === product._id);
                            const finalPrice = calculateFinalPrice(product);
                            
                            return (
                              <div
                                key={product._id}
                                className={`p-3 border-b border-gray-300 cursor-pointer transition-all ${isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'hover:bg-gray-50'}`}
                                onClick={() => !processing && toggleProductSelection(product)}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`h-5 w-5 rounded border flex items-center justify-center ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}`}>
                                    {isSelected && <FaCheck className="w-3 h-3 text-white" />}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex justify-between">
                                      <span className="font-thin text-black truncate">
                                        {product.productName}
                                      </span>
                                      <span className="text-xs text-gray-600 font-thin">
                                        #{product.productCode}
                                      </span>
                                    </div>
                                    <div className="flex justify-between text-sm mt-1">
                                      <div>
                                        <span className="line-through mr-2 text-gray-500">
                                          ৳{product.price}
                                        </span>
                                        <span className="font-thin text-black">
                                          ৳{finalPrice}
                                        </span>
                                      </div>
                                      <div className="flex gap-2">
                                        {product.discount > 0 && (
                                          <span className="text-xs text-gray-600 font-thin">
                                            -{product.discount}%
                                          </span>
                                        )}
                                        <span className="text-xs font-thin text-green-600">
                                          +{formData.extraDiscount}%
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* Selected Products Summary */}
                    {selectedProducts.length > 0 && (
                      <div className="border border-gray-300 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-thin tracking-widest uppercase text-black">
                            Selected Products ({selectedProducts.length})
                          </span>
                          <button
                            onClick={() => !processing && setSelectedProducts([])}
                            className="text-sm text-red-600 hover:text-red-800 font-thin"
                            disabled={processing}
                          >
                            Clear All
                          </button>
                        </div>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {selectedProducts.map((product) => (
                            <div key={product._id} className="flex justify-between text-sm items-center">
                              <span className="font-thin text-black truncate">
                                {product.productName}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-gray-400 line-through text-xs">
                                  ৳{product.price}
                                </span>
                                <span className="font-thin text-green-600">
                                  ৳{calculateFinalPrice(product)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-300">
                  <button
                    onClick={() => !processing && setShowCreateModal(false)}
                    className="px-6 py-3 rounded-lg border border-gray-300 text-black hover:bg-gray-50 font-thin tracking-widest uppercase disabled:opacity-50"
                    disabled={processing}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateCampaign}
                    className="px-6 py-3 rounded-lg bg-black text-white hover:bg-gray-800 font-thin tracking-widest uppercase flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={selectedProducts.length === 0 || !formData.name.trim() || formData.bannerImages[0] === '' || processing}
                  >
                    {processing ? (
                      <>
                        <FaSpinner className="w-4 h-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <FaSave className="w-4 h-4" />
                        Create Campaign
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Campaign Modal */}
      <AnimatePresence>
        {showEditModal && selectedCampaign && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-thin tracking-widest uppercase text-black">
                    Edit Campaign
                  </h2>
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      resetForm();
                    }}
                    className="p-2 rounded-full hover:bg-gray-100"
                    disabled={processing}
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column - Campaign Details */}
                  <div className="space-y-4">
                    <div>
                      <label className={styles.label}>
                        Campaign Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={styles.input}
                        disabled={processing}
                      />
                    </div>

                    <div>
                      <label className={styles.label}>
                        Banner Images (URLs) *
                      </label>
                      {formData.bannerImages.map((url, index) => (
                        <div key={index} className="flex gap-2 mb-2">
                          <input
                            type="text"
                            value={url}
                            onChange={(e) => handleBannerUrlChange(index, e.target.value)}
                            className={styles.input}
                            disabled={processing}
                          />
                          {formData.bannerImages.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeBannerUrlField(index)}
                              className="p-3 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 disabled:opacity-50"
                              disabled={processing}
                            >
                              <FaMinus className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addBannerUrlField}
                        className="mt-2 px-4 py-2 bg-gray-100 text-black rounded-lg hover:bg-gray-200 flex items-center gap-2 disabled:opacity-50"
                        disabled={formData.bannerImages.length >= 5 || processing}
                      >
                        <FaPlus className="w-4 h-4" />
                        Add More URL
                      </button>
                    </div>

                    <div>
                      <label className={styles.label}>
                        Extra Discount (%) *
                      </label>
                      <input
                        type="range"
                        name="extraDiscount"
                        value={formData.extraDiscount}
                        onChange={handleChange}
                        min="0"
                        max="100"
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        disabled={processing}
                      />
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-sm text-gray-600">0%</span>
                        <span className="text-xl font-thin text-black">
                          {formData.extraDiscount}%
                        </span>
                        <span className="text-sm text-gray-600">100%</span>
                      </div>
                    </div>

                    <div>
                      <label className={styles.label}>
                        Start Time *
                      </label>
                      <input
                        type="datetime-local"
                        name="startTime"
                        value={formData.startTime}
                        onChange={handleChange}
                        className={styles.input}
                        disabled={processing}
                      />
                    </div>

                    <div>
                      <label className={styles.label}>
                        End Time *
                      </label>
                      <input
                        type="datetime-local"
                        name="endTime"
                        value={formData.endTime}
                        onChange={handleChange}
                        className={styles.input}
                        disabled={processing}
                      />
                    </div>

                    <div>
                      <label className={styles.label}>
                        Status
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className={styles.input}
                        disabled={processing}
                      >
                        <option value="draft">Draft</option>
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  </div>

                  {/* Right Column - Product Selection */}
                  <div>
                    <div className="mb-4">
                      <label className={styles.label}>
                        Select Products *
                      </label>
                      <input
                        type="text"
                        placeholder="Search products..."
                        className={styles.input + " mb-3"}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        disabled={processing}
                      />
                      
                      <div className="h-64 overflow-y-auto border border-gray-300 rounded-lg">
                        {filteredProducts.length === 0 ? (
                          <div className="p-4 text-center text-gray-600 font-thin">
                            {debouncedSearch ? 'No matching products found' : 'Search for products...'}
                          </div>
                        ) : (
                          filteredProducts.map((product) => {
                            const isSelected = selectedProducts.some(p => p._id === product._id);
                            const finalPrice = calculateFinalPrice(product);
                            
                            return (
                              <div
                                key={product._id}
                                className={`p-3 border-b border-gray-300 cursor-pointer transition-all ${isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'hover:bg-gray-50'}`}
                                onClick={() => !processing && toggleProductSelection(product)}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`h-5 w-5 rounded border flex items-center justify-center ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}`}>
                                    {isSelected && <FaCheck className="w-3 h-3 text-white" />}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex justify-between">
                                      <span className="font-thin text-black truncate">
                                        {product.productName}
                                      </span>
                                      <span className="text-xs text-gray-600 font-thin">
                                        #{product.productCode}
                                      </span>
                                    </div>
                                    <div className="flex justify-between text-sm mt-1">
                                      <div>
                                        <span className="line-through mr-2 text-gray-500">
                                          ৳{product.price}
                                        </span>
                                        <span className="font-thin text-black">
                                          ৳{finalPrice}
                                        </span>
                                      </div>
                                      <div className="flex gap-2">
                                        {product.discount > 0 && (
                                          <span className="text-xs text-gray-600 font-thin">
                                            -{product.discount}%
                                          </span>
                                        )}
                                        <span className="text-xs font-thin text-green-600">
                                          +{formData.extraDiscount}%
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* Selected Products Summary */}
                    {selectedProducts.length > 0 && (
                      <div className="border border-gray-300 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-thin tracking-widest uppercase text-black">
                            Selected Products ({selectedProducts.length})
                          </span>
                          <button
                            onClick={() => !processing && setSelectedProducts([])}
                            className="text-sm text-red-600 hover:text-red-800 font-thin"
                            disabled={processing}
                          >
                            Clear All
                          </button>
                        </div>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {selectedProducts.map((product) => (
                            <div key={product._id} className="flex justify-between text-sm items-center">
                              <span className="font-thin text-black truncate">
                                {product.productName}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-gray-400 line-through text-xs">
                                  ৳{product.price}
                                </span>
                                <span className="font-thin text-green-600">
                                  ৳{calculateFinalPrice(product)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-300">
                  <button
                    onClick={() => !processing && setShowEditModal(false)}
                    className="px-6 py-3 rounded-lg border border-gray-300 text-black hover:bg-gray-50 font-thin tracking-widest uppercase disabled:opacity-50"
                    disabled={processing}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateCampaign}
                    className="px-6 py-3 rounded-lg bg-black text-white hover:bg-gray-800 font-thin tracking-widest uppercase flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={selectedProducts.length === 0 || processing}
                  >
                    {processing ? (
                      <>
                        <FaSpinner className="w-4 h-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <FaSave className="w-4 h-4" />
                        Update Campaign
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Container for react-toastify v9+ */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

export default CampaignManager;