import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { FaClock, FaCalendarAlt, FaTag, FaImage, FaEdit, FaTrash, FaPlay, FaStop, FaHistory, FaRocket } from 'react-icons/fa';

const COLORS = {
  background: "#FFFFFF",
  primary: "#000000",
  secondary: "#333333",
  accent: "#666666",
  border: "#E0E0E0",
  card: "#F8F8F8"
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

  // Form state (UPDATED - removed durationInHours, added endTime)
  const [formData, setFormData] = useState({
    name: '',
    bannerImage: '',
    bannerType: 'url',
    extraDiscount: 0,
    startTime: new Date().toISOString().slice(0, 16),
    endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    status: 'draft',
    products: []
  });

  const [uploading, setUploading] = useState(false);

  // Fetch campaigns based on active tab
  useEffect(() => {
    fetchCampaigns();
  }, [activeTab]);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      let endpoint = '';
      
      switch (activeTab) {
        case 'active':
          endpoint = '/api/campaigns/home/active';
          break;
        case 'draft':
          endpoint = '/api/campaigns/history/all?status=draft&page=1&limit=50';
          break;
        case 'completed':
          endpoint = '/api/campaigns/history/all?status=completed&page=1&limit=50';
          break;
        default:
          endpoint = '/api/campaigns';
      }

      const response = await axios.get(`http://localhost:5000${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (activeTab === 'draft' || activeTab === 'completed') {
        setCampaigns(response.data.campaigns || []);
      } else {
        setCampaigns(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast.error('Failed to fetch campaigns');
    } finally {
      setLoading(false);
    }
  };

  // Fetch products for selection
  const fetchProducts = async (search = '') => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`https://prexo.onrender.com/api/campaigns/products/available?search=${search}&page=1&limit=50`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(response.data.products || []);
      setFilteredProducts(response.data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle banner upload
  const handleBannerUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('bannerImage', file);
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`https://prexo.onrender.com/api/campaigns/create`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setFormData(prev => ({
        ...prev,
        bannerImage: response.data.campaign?.bannerImage || '',
        bannerType: 'upload'
      }));
      toast.success('Banner uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload banner');
    } finally {
      setUploading(false);
    }
  };

  // Toggle product selection
  const toggleProductSelection = (product) => {
    const isSelected = selectedProducts.some(p => p._id === product._id);
    
    if (isSelected) {
      setSelectedProducts(prev => prev.filter(p => p._id !== product._id));
    } else {
      setSelectedProducts(prev => [...prev, product]);
    }
  };

  // Calculate final price with discounts (FIXED)
  const calculateFinalPrice = (product) => {
    const originalPrice = product.price;
    const originalDiscount = product.discount || 0;
    const campaignDiscount = formData.extraDiscount || 0;
    
    // First apply original discount
    let priceAfterOriginalDiscount = originalPrice;
    if (originalDiscount > 0) {
      priceAfterOriginalDiscount = originalPrice - (originalPrice * originalDiscount / 100);
    }
    
    // Then apply campaign discount on the discounted price
    let finalPrice = priceAfterOriginalDiscount;
    if (campaignDiscount > 0) {
      finalPrice = priceAfterOriginalDiscount - (priceAfterOriginalDiscount * campaignDiscount / 100);
    }
    
    return Math.round(finalPrice);
  };

  // Create campaign
  const handleCreateCampaign = async () => {
    if (!formData.name || !formData.bannerImage || selectedProducts.length === 0) {
      toast.error('Please fill all required fields and select products');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const campaignData = {
        ...formData,
        products: selectedProducts.map(p => p._id),
        extraDiscount: parseInt(formData.extraDiscount) || 0
      };

      console.log('Creating campaign with:', campaignData);

      const response = await axios.post('https://prexo.onrender.com/api/campaigns/create', campaignData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      toast.success('Campaign created successfully');
      setShowCreateModal(false);
      resetForm();
      fetchCampaigns();
    } catch (error) {
      console.error('Error creating campaign:', error.response?.data || error);
      toast.error(error.response?.data?.message || 'Failed to create campaign');
    }
  };

  // Launch campaign
  const handleLaunchCampaign = async (campaignId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`https://prexo.onrender.com/api/campaigns/launch/${campaignId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

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
      const token = localStorage.getItem('token');
      await axios.put(`https://prexo.onrender.com/api/campaigns/stop/${campaignId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Campaign stopped successfully');
      fetchCampaigns();
    } catch (error) {
      console.error('Error stopping campaign:', error);
      toast.error('Failed to stop campaign');
    }
  };

  // Delete campaign
  const handleDeleteCampaign = async (campaignId) => {
    if (!window.confirm('Are you sure you want to delete this campaign?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`https://prexo.onrender.com/api/campaigns/delete/${campaignId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Campaign deleted successfully');
      fetchCampaigns();
    } catch (error) {
      console.error('Error deleting campaign:', error);
      toast.error('Failed to delete campaign');
    }
  };

  // Edit campaign
  const handleEditCampaign = (campaign) => {
    setSelectedCampaign(campaign);
    setFormData({
      name: campaign.name,
      bannerImage: campaign.bannerImage,
      bannerType: campaign.bannerType || 'url',
      extraDiscount: campaign.extraDiscount,
      startTime: new Date(campaign.startTime).toISOString().slice(0, 16),
      endTime: new Date(campaign.endTime).toISOString().slice(0, 16),
      status: campaign.status,
      products: campaign.products.map(p => p.productId._id)
    });
    
    // Set selected products
    setSelectedProducts(campaign.products.map(p => ({
      _id: p.productId._id,
      ...p.productId
    })));
    
    fetchProducts();
    setShowEditModal(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      bannerImage: '',
      bannerType: 'url',
      extraDiscount: 0,
      startTime: new Date().toISOString().slice(0, 16),
      endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      status: 'draft',
      products: []
    });
    setSelectedProducts([]);
    setSelectedCampaign(null);
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate time left
  const calculateTimeLeft = (endTime) => {
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

  // Open create modal
  const openCreateModal = () => {
    resetForm();
    fetchProducts();
    setShowCreateModal(true);
  };

  return (
    <div className="p-6 min-h-screen" style={{ backgroundColor: COLORS.background }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: COLORS.primary }}>Campaign Manager</h1>
            <p className="mt-2" style={{ color: COLORS.secondary }}>Manage your promotional campaigns</p>
          </div>
          
          <motion.button
            onClick={openCreateModal}
            className="px-6 py-3 rounded-lg flex items-center gap-2"
            style={{ backgroundColor: COLORS.primary, color: 'white' }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaTag className="w-5 h-5" />
            Create New Campaign
          </motion.button>
        </div>

        {/* Tabs */}
        <div className="flex border-b mb-6" style={{ borderColor: COLORS.border }}>
          {['active', 'draft', 'completed'].map((tab) => (
            <button
              key={tab}
              className={`px-6 py-3 font-medium capitalize ${activeTab === tab ? 'border-b-2 border-black' : 'text-gray-500'}`}
              onClick={() => {
                setActiveTab(tab);
              }}
              style={{ color: activeTab === tab ? COLORS.primary : COLORS.secondary }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Campaigns Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: COLORS.primary }}></div>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="text-center py-12">
            <FaTag className="w-16 h-16 mx-auto mb-4" style={{ color: COLORS.border }} />
            <h3 className="text-xl font-medium mb-2" style={{ color: COLORS.primary }}>No campaigns found</h3>
            <p style={{ color: COLORS.secondary }}>Create your first campaign to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
              <motion.div
                key={campaign._id}
                className="rounded-xl overflow-hidden border"
                style={{ backgroundColor: COLORS.card, borderColor: COLORS.border }}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -5 }}
              >
                {/* Banner */}
                <div className="h-48 overflow-hidden">
                  <img
                    src={campaign.bannerImage}
                    alt={campaign.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/400x200?text=Campaign+Banner';
                    }}
                  />
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold" style={{ color: COLORS.primary }}>
                      {campaign.name}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                      campaign.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {campaign.status === 'active' ? 'Running' : campaign.status}
                    </span>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <FaTag className="w-4 h-4" style={{ color: COLORS.secondary }} />
                      <span style={{ color: COLORS.secondary }}>
                        Extra Discount: <strong>{campaign.extraDiscount}%</strong>
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <FaCalendarAlt className="w-4 h-4" style={{ color: COLORS.secondary }} />
                      <span style={{ color: COLORS.secondary }}>
                        Starts: {formatDate(campaign.startTime)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <FaClock className="w-4 h-4" style={{ color: COLORS.secondary }} />
                      <span style={{ color: COLORS.secondary }}>
                        Ends: {formatDate(campaign.endTime)}
                      </span>
                    </div>

                    {campaign.status === 'active' && campaign.endTime && (
                      <div className="text-sm font-medium" style={{ color: '#10B981' }}>
                        {calculateTimeLeft(campaign.endTime)}
                      </div>
                    )}

                    <div className="text-sm" style={{ color: COLORS.secondary }}>
                      Products: <strong>{campaign.products?.length || 0}</strong>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {campaign.status === 'draft' && (
                      <motion.button
                        onClick={() => handleLaunchCampaign(campaign._id)}
                        className="px-3 py-1.5 rounded-lg text-sm flex-1 flex items-center justify-center gap-1"
                        style={{ backgroundColor: '#10B981', color: 'white' }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <FaRocket className="w-3 h-3" />
                        Launch
                      </motion.button>
                    )}
                    
                    {campaign.status === 'active' && (
                      <motion.button
                        onClick={() => handleStopCampaign(campaign._id)}
                        className="px-3 py-1.5 rounded-lg text-sm flex-1 flex items-center justify-center gap-1"
                        style={{ backgroundColor: '#EF4444', color: 'white' }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <FaStop className="w-3 h-3" />
                        Stop
                      </motion.button>
                    )}

                    <motion.button
                      onClick={() => handleEditCampaign(campaign)}
                      className="px-3 py-1.5 rounded-lg text-sm border"
                      style={{ borderColor: COLORS.border, color: COLORS.primary }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FaEdit className="w-4 h-4" />
                    </motion.button>

                    <motion.button
                      onClick={() => handleDeleteCampaign(campaign._id)}
                      className="px-3 py-1.5 rounded-lg text-sm border"
                      style={{ borderColor: COLORS.border, color: '#EF4444' }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FaTrash className="w-4 h-4" />
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
                  <h2 className="text-2xl font-bold" style={{ color: COLORS.primary }}>Create New Campaign</h2>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="p-2 rounded-full hover:bg-gray-100"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column - Campaign Details */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: COLORS.primary }}>
                        Campaign Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full p-3 rounded-lg border"
                        style={{ borderColor: COLORS.border }}
                        placeholder="Eid Festival Sale"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: COLORS.primary }}>
                        Banner Image *
                      </label>
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <input
                            type="text"
                            name="bannerImage"
                            value={formData.bannerImage}
                            onChange={handleChange}
                            className="w-full p-3 rounded-lg border"
                            style={{ borderColor: COLORS.border }}
                            placeholder="Enter banner URL"
                          />
                        </div>
                        <div className="relative">
                          <input
                            type="file"
                            id="bannerUpload"
                            className="hidden"
                            accept="image/*"
                            onChange={handleBannerUpload}
                          />
                          <label
                            htmlFor="bannerUpload"
                            className="px-4 py-3 border rounded-lg cursor-pointer flex items-center gap-2"
                            style={{ borderColor: COLORS.border }}
                          >
                            <FaImage className="w-4 h-4" />
                            {uploading ? 'Uploading...' : 'Upload'}
                          </label>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: COLORS.primary }}>
                        Extra Discount (%) *
                      </label>
                      <input
                        type="number"
                        name="extraDiscount"
                        value={formData.extraDiscount}
                        onChange={handleChange}
                        min="0"
                        max="100"
                        className="w-full p-3 rounded-lg border"
                        style={{ borderColor: COLORS.border }}
                        placeholder="10"
                      />
                      <p className="text-sm mt-1" style={{ color: COLORS.secondary }}>
                        This discount will be added on top of existing product discounts
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: COLORS.primary }}>
                        Start Time *
                      </label>
                      <input
                        type="datetime-local"
                        name="startTime"
                        value={formData.startTime}
                        onChange={handleChange}
                        className="w-full p-3 rounded-lg border"
                        style={{ borderColor: COLORS.border }}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: COLORS.primary }}>
                        End Time *
                      </label>
                      <input
                        type="datetime-local"
                        name="endTime"
                        value={formData.endTime}
                        onChange={handleChange}
                        className="w-full p-3 rounded-lg border"
                        style={{ borderColor: COLORS.border }}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: COLORS.primary }}>
                        Status
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="w-full p-3 rounded-lg border"
                        style={{ borderColor: COLORS.border }}
                      >
                        <option value="draft">Draft</option>
                        <option value="active">Start Immediately</option>
                      </select>
                    </div>
                  </div>

                  {/* Right Column - Product Selection */}
                  <div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-1" style={{ color: COLORS.primary }}>
                        Select Products *
                      </label>
                      <input
                        type="text"
                        placeholder="Search products..."
                        className="w-full p-3 rounded-lg border mb-3"
                        style={{ borderColor: COLORS.border }}
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          fetchProducts(e.target.value);
                        }}
                      />
                      
                      <div className="h-64 overflow-y-auto border rounded-lg" style={{ borderColor: COLORS.border }}>
                        {filteredProducts.length === 0 ? (
                          <div className="p-4 text-center" style={{ color: COLORS.secondary }}>
                            No products found
                          </div>
                        ) : (
                          filteredProducts.map((product) => {
                            const isSelected = selectedProducts.some(p => p._id === product._id);
                            const finalPrice = calculateFinalPrice(product);
                            
                            return (
                              <div
                                key={product._id}
                                className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}
                                style={{ borderColor: COLORS.border }}
                                onClick={() => toggleProductSelection(product)}
                              >
                                <div className="flex items-center gap-3">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => {}}
                                    className="h-4 w-4"
                                  />
                                  <div className="flex-1">
                                    <div className="flex justify-between">
                                      <span className="font-medium" style={{ color: COLORS.primary }}>
                                        {product.productName}
                                      </span>
                                      <span className="text-sm" style={{ color: COLORS.secondary }}>
                                        #{product.productCode}
                                      </span>
                                    </div>
                                    <div className="flex justify-between text-sm mt-1">
                                      <div>
                                        <span className="line-through mr-2" style={{ color: COLORS.secondary }}>
                                          ৳{product.price}
                                        </span>
                                        <span className="font-bold" style={{ color: COLORS.primary }}>
                                          ৳{finalPrice}
                                        </span>
                                      </div>
                                      <div>
                                        {product.discount > 0 && (
                                          <span className="mr-2" style={{ color: COLORS.secondary }}>
                                            Original: {product.discount}%
                                          </span>
                                        )}
                                        <span className="font-bold text-green-600">
                                          +{formData.extraDiscount}% = {Math.min(100, (product.discount || 0) + (formData.extraDiscount || 0))}%
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
                      <div className="border rounded-lg p-3" style={{ borderColor: COLORS.border }}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium" style={{ color: COLORS.primary }}>
                            Selected Products ({selectedProducts.length})
                          </span>
                          <button
                            onClick={() => setSelectedProducts([])}
                            className="text-sm text-red-600"
                          >
                            Clear All
                          </button>
                        </div>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {selectedProducts.map((product) => (
                            <div key={product._id} className="flex justify-between text-sm">
                              <span style={{ color: COLORS.primary }}>{product.productName}</span>
                              <span style={{ color: COLORS.secondary }}>
                                ৳{product.price} → ৳{calculateFinalPrice(product)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="flex justify-end gap-3 mt-6 pt-6 border-t" style={{ borderColor: COLORS.border }}>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="px-6 py-2 rounded-lg border"
                    style={{ borderColor: COLORS.border, color: COLORS.primary }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateCampaign}
                    className="px-6 py-2 rounded-lg"
                    style={{ backgroundColor: COLORS.primary, color: 'white' }}
                    disabled={selectedProducts.length === 0}
                  >
                    Create Campaign
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CampaignManager;