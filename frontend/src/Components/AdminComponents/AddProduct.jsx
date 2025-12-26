import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

// Modern Black and White Premium Color Palette
const COLORS = {
  background: "#FFFFFF",
  primary: "#000000",
  accent: "#333333",
  text: "#222222",
  subtle: "#E0E0E0",
  highlight: "#F5F5F5",
  border: "#D1D1D1",
  buttonHover: "#1A1A1A"
};

// Mobile Phone Categories
const initialCategories = {
  'apple-iphone': [
    { name: "iPhone 15 Series", link: "/category/apple-iphone/15-series" },
    { name: "iPhone 14 Series", link: "/category/apple-iphone/14-series" },
    { name: "iPhone 13 Series", link: "/category/apple-iphone/13-series" },
    { name: "iPhone 12 Series", link: "/category/apple-iphone/12-series" },
    { name: "iPhone SE Series", link: "/category/apple-iphone/se-series" },
  ],
  'samsung': [
    { name: "Galaxy S Series", link: "/category/samsung/galaxy-s" },
    { name: "Galaxy A Series", link: "/category/samsung/galaxy-a" },
    { name: "Galaxy Z Series", link: "/category/samsung/galaxy-z" },
    { name: "Galaxy M Series", link: "/category/samsung/galaxy-m" },
    { name: "Galaxy Note Series", link: "/category/samsung/galaxy-note" },
  ],
  'xiaomi': [
    { name: "Redmi Series", link: "/category/xiaomi/redmi" },
    { name: "Mi Series", link: "/category/xiaomi/mi" },
    { name: "Poco Series", link: "/category/xiaomi/poco" },
    { name: "Black Shark", link: "/category/xiaomi/black-shark" },
  ],
  'oneplus': [
    { name: "OnePlus 11 Series", link: "/category/oneplus/11-series" },
    { name: "OnePlus 10 Series", link: "/category/oneplus/10-series" },
    { name: "OnePlus Nord Series", link: "/category/oneplus/nord" },
    { name: "OnePlus R Series", link: "/category/oneplus/r-series" },
  ],
  'google': [
    { name: "Pixel 8 Series", link: "/category/google/pixel-8" },
    { name: "Pixel 7 Series", link: "/category/google/pixel-7" },
    { name: "Pixel 6 Series", link: "/category/google/pixel-6" },
    { name: "Pixel A Series", link: "/category/google/pixel-a" },
  ],
  'oppo': [
    { name: "Find X Series", link: "/category/oppo/find-x" },
    { name: "Reno Series", link: "/category/oppo/reno" },
    { name: "F Series", link: "/category/oppo/f-series" },
    { name: "A Series", link: "/category/oppo/a-series" },
  ],
  'vivo': [
    { name: "X Series", link: "/category/vivo/x-series" },
    { name: "V Series", link: "/category/vivo/v-series" },
    { name: "Y Series", link: "/category/vivo/y-series" },
    { name: "T Series", link: "/category/vivo/t-series" },
  ],
  'realme': [
    { name: "GT Series", link: "/category/realme/gt" },
    { name: "Number Series", link: "/category/realme/number" },
    { name: "C Series", link: "/category/realme/c" },
    { name: "Narzo Series", link: "/category/realme/narzo" },
  ],
  'other-brands': [
    { name: "Nokia", link: "/category/other-brands/nokia" },
    { name: "Motorola", link: "/category/other-brands/motorola" },
    { name: "Sony Xperia", link: "/category/other-brands/sony" },
    { name: "Asus ROG", link: "/category/other-brands/asus" },
  ],
  'refurbished': [
    { name: "Apple Refurbished", link: "/category/refurbished/apple" },
    { name: "Samsung Refurbished", link: "/category/refurbished/samsung" },
    { name: "Premium Refurbished", link: "/category/refurbished/premium" },
    { name: "Budget Refurbished", link: "/category/refurbished/budget" },
  ],
};

const initialCategoryLabels = {
  'apple-iphone': "Apple iPhone",
  'samsung': "Samsung",
  'xiaomi': "Xiaomi",
  'oneplus': "OnePlus",
  'google': "Google Pixel",
  'oppo': "Oppo",
  'vivo': "Vivo",
  'realme': "Realme",
  'other-brands': "Other Brands",
  'refurbished': "Refurbished Phones"
};

const AddProduct = () => {
  const [sizes, setSizes] = useState([{ size: '', sizePrice: 0 }]);
  const [formData, setFormData] = useState({
    productName: '',
    description: '',
    images: [''],
    sizeChart: '',
    availableColors: [],  // This should be an array
    availableSizes: [],
    stock: 0,
    price: 0,
    discount: 0,
    productCode: '',
    category: '',
    subCategory: '',
    isBestSeller: false,
    videoUrl: '',
  });
  
  // State for category management
  const [categories, setCategories] = useState({});
  const [categoryLabels, setCategoryLabels] = useState({});
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [newSubcategoryName, setNewSubcategoryName] = useState('');
  const [activeTab, setActiveTab] = useState('product');
  const [loadingCategories, setLoadingCategories] = useState(true);
  
  // Image upload states
  const [uploadMethod, setUploadMethod] = useState('url');
  const [previewImages, setPreviewImages] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [fileInputs, setFileInputs] = useState([null]);
  const [discountedPrice, setDiscountedPrice] = useState(0);

  // NEW: State for color input
  const [colorInput, setColorInput] = useState('');

  // Initialize with mobile categories
  useEffect(() => {
    setCategories(initialCategories);
    setCategoryLabels(initialCategoryLabels);
    setLoadingCategories(false);
  }, []);

  // Fetch categories from backend API (optional)
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('https://prexo.onrender.com/api/categories', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data && response.data.categories && response.data.labels) {
          setCategories(response.data.categories);
          setCategoryLabels(response.data.labels);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Keep using initial mobile categories
      } finally {
        setLoadingCategories(false);
      }
    };
    
    fetchCategories();
  }, []);

  // Calculate discounted price
  useEffect(() => {
    const calculatedDiscountedPrice = formData.price - (formData.price * formData.discount) / 100;
    setDiscountedPrice(calculatedDiscountedPrice);
  }, [formData.price, formData.discount]);

  // Handle file uploads
  const handleFileUpload = async (files) => {
    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('images', file);
    });

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'https://prexo.onrender.com/api/products/upload',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: progressEvent => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(prev => ({
              ...prev,
              [files[0].name]: percentCompleted
            }));
          }
        }
      );

      setPreviewImages(prev => [...prev, ...response.data.urls]);
      setFileInputs(prev => [...prev, null]);
      toast.success('Images uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Image upload failed');
    }
  };

  // Handle file change
  const handleFileChange = async (index, e) => {
    const files = e.target.files;
    if (files.length > 0) {
      try {
        const newFile = files[0];
        const newFileInputs = [...fileInputs];
        newFileInputs[index] = newFile;
        setFileInputs(newFileInputs);
        
        const formData = new FormData();
        formData.append('images', newFile);
        
        const token = localStorage.getItem('token');
        const response = await axios.post(
          'https://prexo.onrender.com/api/products/upload',
          formData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        
        setPreviewImages(prev => [...prev, ...response.data.urls]);
        
      } catch (error) {
        toast.error('File upload failed');
      }
    }
  };

  // Handle URL image
  const handleUrlImage = () => {
    const urlInput = document.getElementById('image-url-input');
    if (urlInput && urlInput.value) {
      const url = urlInput.value;
      setPreviewImages(prev => [...prev, url]);
      urlInput.value = '';
      toast.success('Image URL added!');
    }
  };

  // Get subcategories
  const getSubCategories = () => {
    if (!formData.category) return [];
    return categories[formData.category] || [];
  };

  // NEW: Handle adding colors
  const addColor = () => {
    const color = colorInput.trim();
    if (!color) return;
    
    if (!formData.availableColors.includes(color)) {
      const newColors = [...formData.availableColors, color];
      setFormData({
        ...formData,
        availableColors: newColors
      });
      setColorInput('');
      toast.success(`Color "${color}" added!`);
    } else {
      toast.warning(`Color "${color}" already exists!`);
    }
  };

  // NEW: Handle removing colors
  const removeColor = (index) => {
    const newColors = [...formData.availableColors];
    const removedColor = newColors[index];
    newColors.splice(index, 1);
    setFormData({
      ...formData,
      availableColors: newColors
    });
    toast.info(`Color "${removedColor}" removed!`);
  };

  // NEW: Handle comma input for colors
  const handleColorInputChange = (e) => {
    const value = e.target.value;
    setColorInput(value);
    
    // Auto-add when comma is pressed
    if (value.endsWith(',')) {
      const color = value.slice(0, -1).trim();
      if (color && !formData.availableColors.includes(color)) {
        const newColors = [...formData.availableColors, color];
        setFormData({
          ...formData,
          availableColors: newColors
        });
        setColorInput('');
      }
    }
  };

  // NEW: Handle Enter key for colors
  const handleColorKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addColor();
    }
  };

  // Handle form changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'category') {
      setFormData({
        ...formData,
        [name]: value,
        subCategory: ''
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value,
      });
    }
  };

  // Handle size changes
  const handleSizeChange = (index, field, value) => {
    const updatedSizes = [...sizes];
    updatedSizes[index][field] = field === 'sizePrice' ? Number(value) : value;
    setSizes(updatedSizes);
  };

  // Add size field
  const addSizeField = () => {
    setSizes([...sizes, { size: '', sizePrice: 0 }]);
  };

  // Remove size field
  const removeSizeField = (index) => {
    const updatedSizes = sizes.filter((_, i) => i !== index);
    setSizes(updatedSizes);
  };

  // Handle discounted price change
  const handleDiscountedPriceChange = (e) => {
    const newDiscountedPrice = parseFloat(e.target.value);

    if (!isNaN(newDiscountedPrice) && formData.price > 0) {
      setDiscountedPrice(newDiscountedPrice);
      const newDiscount = 100 - (newDiscountedPrice / formData.price) * 100;
      setFormData({
        ...formData,
        discount: Math.max(0, Math.min(100, parseFloat(newDiscount.toFixed(2))))
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prepare data
    const payload = {
      ...formData,
      images: previewImages,
      stock: Number(formData.stock),
      price: Number(formData.price),
      discount: Number(formData.discount),
      availableSizes: sizes,
      isBestSeller: formData.isBestSeller,
    };

    console.log('Submitting data:', payload); // For debugging

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'https://prexo.onrender.com/api/products/add',
        payload,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json' 
          }
        }
      );
      
      toast.success(response.data.message);
      
      // Reset form
      setFormData({
        productName: '',
        description: '',
        images: [''],
        sizeChart: '',
        availableColors: [],
        availableSizes: [],
        stock: 0,
        price: 0,
        discount: 0,
        productCode: '',
        category: '',
        subCategory: '',
        isBestSeller: false,
        videoUrl: '',
      });
      setPreviewImages([]);
      setFileInputs([null]);
      setSizes([{ size: '', sizePrice: 0 }]);
      setDiscountedPrice(0);
      setColorInput('');
      
    } catch (error) {
      console.error('Submission error:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Product submission failed');
    }
  };

  // Category management functions
  const addNewCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error('Category name cannot be empty');
      return;
    }
    
    const key = newCategoryName.toLowerCase().replace(/\s+/g, '-');
    
    if (categories[key]) {
      toast.error('Category already exists');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'https://prexo.onrender.com/api/categories/add',
        { key, name: newCategoryName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setCategories(prev => ({ ...prev, [key]: [] }));
      setCategoryLabels(prev => ({ ...prev, [key]: newCategoryName }));
      setNewCategoryName('');
      toast.success(`Category "${newCategoryName}" added successfully`);
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error('Failed to add category');
    }
  };

  const deleteCategory = async (categoryKey) => {
    if (!window.confirm(`Are you sure you want to delete the "${categoryLabels[categoryKey]}" category?`)) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`https://prexo.onrender.com/api/categories/${categoryKey}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const newCategories = { ...categories };
      delete newCategories[categoryKey];
      
      const newLabels = { ...categoryLabels };
      delete newLabels[categoryKey];
      
      setCategories(newCategories);
      setCategoryLabels(newLabels);
      toast.success('Category deleted successfully');
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    }
  };

  const addSubcategory = async () => {
    if (!selectedCategory) {
      toast.error('Please select a category');
      return;
    }
    
    if (!newSubcategoryName.trim()) {
      toast.error('Subcategory name cannot be empty');
      return;
    }
    
    const existingSubcategories = categories[selectedCategory] || [];
    if (existingSubcategories.some(sc => sc.name === newSubcategoryName)) {
      toast.error('Subcategory already exists in this category');
      return;
    }
    
    const newSubcategory = {
      name: newSubcategoryName,
      link: `/category/${selectedCategory}/${newSubcategoryName.toLowerCase().replace(/\s+/g, '-')}`
    };
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `https://prexo.onrender.com/api/categories/${selectedCategory}/subcategories`,
        newSubcategory,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setCategories(prev => ({
        ...prev,
        [selectedCategory]: [...prev[selectedCategory], newSubcategory]
      }));
      
      setNewSubcategoryName('');
      toast.success(`Subcategory "${newSubcategoryName}" added to "${categoryLabels[selectedCategory]}"`);
    } catch (error) {
      console.error('Error adding subcategory:', error);
      toast.error('Failed to add subcategory');
    }
  };

  const deleteSubcategory = async (categoryKey, subcategoryIndex) => {
    const categoryName = categoryLabels[categoryKey];
    const subcategoryName = categories[categoryKey][subcategoryIndex].name;
    
    if (!window.confirm(`Are you sure you want to delete "${subcategoryName}" from "${categoryName}"?`)) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `https://prexo.onrender.com/api/categories/${categoryKey}/subcategories/${subcategoryIndex}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const updatedSubcategories = categories[categoryKey].filter((_, i) => i !== subcategoryIndex);
      
      setCategories(prev => ({
        ...prev,
        [categoryKey]: updatedSubcategories
      }));
      
      toast.success('Subcategory deleted successfully');
    } catch (error) {
      console.error('Error deleting subcategory:', error);
      toast.error('Failed to delete subcategory');
    }
  };

  return (
    <div className="p-4 min-h-screen" style={{ backgroundColor: COLORS.background }}>
      <motion.div 
        className="max-w-6xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2" style={{ color: COLORS.primary }}>
            📱 Mobile Phone Management
          </h1>
          <p className="text-gray-600">Add new smartphones & manage inventory</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b mb-6">
          <button
            className={`py-3 px-6 font-medium text-sm ${activeTab === 'product' ? 'border-b-2 border-black' : 'text-gray-500'}`}
            onClick={() => setActiveTab('product')}
          >
            Add Mobile Phone
          </button>
          <button
            className={`py-3 px-6 font-medium text-sm ${activeTab === 'categories' ? 'border-b-2 border-black' : 'text-gray-500'}`}
            onClick={() => setActiveTab('categories')}
          >
            Manage Brands & Categories
          </button>
        </div>

        {/* Product Form Tab */}
        <AnimatePresence>
          {activeTab === 'product' && (
            <motion.div
              key="product-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Mobile Description Guidelines */}
              <div className="border rounded-xl p-6 mb-6" style={{ borderColor: COLORS.border, backgroundColor: COLORS.highlight }}>
                <h3 className="text-xl font-bold mb-4" style={{ color: COLORS.text }}>
                  📝 Mobile Description Guidelines
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Formatting Tips */}
                  <div>
                    <h4 className="font-medium mb-2">✅ Formatting Tips:</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Start with emojis for visual appeal 🎯✨</li>
                      <li>• Use bullet points for key features</li>
                      <li>• Highlight specifications with **bold text**</li>
                      <li>• Include technical details clearly</li>
                      <li>• Add warranty and condition information</li>
                    </ul>
                  </div>
                  
                  {/* Example Template */}
                  <div>
                    <h4 className="font-medium mb-2">📋 Example Format:</h4>
                    <div className="text-xs bg-white p-3 rounded border">
                      <p>📱 <strong>Display:</strong> 6.7-inch Super AMOLED, 120Hz</p>
                      <p>⚡ <strong>Processor:</strong> Snapdragon 8 Gen 2</p>
                      <p>📸 <strong>Camera:</strong> 50MP + 12MP + 10MP</p>
                      <p>🔋 <strong>Battery:</strong> 5000mAh with 67W fast charging</p>
                      <p>✅ <strong>Features:</strong> 5G, IP68, Wireless Charging</p>
                    </div>
                  </div>
                </div>
                
                {/* Quick Buttons */}
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const exampleDescription = `🎯 Brand New | Official Warranty | Latest Model

📱 **Display:** 6.7-inch Super AMOLED, 120Hz refresh rate, HDR10+ support
⚡ **Performance:** Snapdragon 8 Gen 2 processor, 12GB RAM, 256GB storage
📸 **Camera:** Triple camera system - 50MP main + 12MP ultrawide + 10MP telephoto
🔋 **Battery:** 5000mAh with 67W fast charging
📡 **Connectivity:** 5G, Wi-Fi 6, Bluetooth 5.3, NFC

✅ **Key Features:**
• IP68 Water & Dust Resistance
• Stereo Speakers with Dolby Atmos
• Under-display Fingerprint Scanner
• Wireless Charging & Reverse Charging

🔒 **Security:** Face Unlock, Fingerprint
🎁 **Warranty:** 2 Years Manufacturer Warranty
📦 **In the Box:** Phone, Charger, USB Cable, Case, Screen Protector`;
                      
                      setFormData({
                        ...formData,
                        description: formData.description ? formData.description + "\n\n" + exampleDescription : exampleDescription
                      });
                      toast.success('Example template added!');
                    }}
                    className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm hover:bg-blue-200 transition-colors"
                  >
                    Add Example Template
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        description: ''
                      });
                      toast.info('Description cleared!');
                    }}
                    className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                  >
                    Clear Description
                  </button>
                </div>
              </div>

              <motion.form 
                onSubmit={handleSubmit} 
                className="p-6 rounded-xl shadow-lg"
                style={{ 
                  backgroundColor: COLORS.background,
                  border: `1px solid ${COLORS.border}`,
                }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Product Name */}
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: COLORS.text }}>
                      Phone Model Name
                    </label>
                    <input
                      type="text"
                      name="productName"
                      placeholder="e.g., iPhone 15 Pro Max 256GB"
                      value={formData.productName}
                      onChange={handleChange}
                      className="w-full p-3 rounded-lg border bg-white placeholder-gray-400 focus:outline-none focus:ring-1"
                      style={{ 
                        borderColor: COLORS.border, 
                        color: COLORS.text,
                      }}
                      required
                    />
                  </div>
                  
                  {/* Product Code (IMEI/SKU) */}
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: COLORS.text }}>
                      Product Code / SKU
                    </label>
                    <input
                      type="text"
                      name="productCode"
                      placeholder="e.g., IP15PM-256-BLK"
                      value={formData.productCode}
                      onChange={handleChange}
                      className="w-full p-3 rounded-lg border bg-white placeholder-gray-400 focus:outline-none focus:ring-1"
                      style={{ 
                        borderColor: COLORS.border, 
                        color: COLORS.text,
                      }}
                      required
                    />
                  </div>
                  
                  {/* Description */}
                  <div className="md:col-span-2">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium" style={{ color: COLORS.text }}>
                        Detailed Description
                      </label>
                      <span className="text-xs text-gray-500">
                        {formData.description.length} characters
                      </span>
                    </div>
                    <textarea
                      name="description"
                      placeholder={`Enter detailed phone description...
                      
Example format:
📱 Display: 6.7-inch Super AMOLED, 120Hz
⚡ Processor: Snapdragon 8 Gen 2
📸 Camera: 50MP + 12MP + 10MP
🔋 Battery: 5000mAh with 67W fast charging
✅ Features: 5G, IP68, Wireless Charging
🎁 Warranty: 2 Years`}
                      value={formData.description}
                      onChange={handleChange}
                      className="w-full p-3 rounded-lg border bg-white placeholder-gray-400 focus:outline-none focus:ring-1"
                      style={{ 
                        borderColor: COLORS.border, 
                        color: COLORS.text,
                        minHeight: '250px',
                        fontFamily: 'monospace',
                        fontSize: '14px'
                      }}
                      required
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      Use emojis and bullet points for better presentation. See guidelines above.
                    </div>
                  </div>
                  
                  {/* Price and Discount */}
                  <div className="grid grid-cols-2 gap-6 md:col-span-2">
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: COLORS.text }}>
                        Original Price (৳)
                      </label>
                      <input
                        type="number"
                        name="price"
                        placeholder="e.g., 150000"
                        value={formData.price}
                        onChange={handleChange}
                        className="w-full p-3 rounded-lg border bg-white placeholder-gray-400 focus:outline-none focus:ring-1"
                        style={{ 
                          borderColor: COLORS.border, 
                          color: COLORS.text,
                        }}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: COLORS.text }}>
                        Discount (%)
                      </label>
                      <input
                        type="number"
                        name="discount"
                        placeholder="e.g., 10"
                        value={formData.discount}
                        onChange={handleChange}
                        className="w-full p-3 rounded-lg border bg-white placeholder-gray-400 focus:outline-none focus:ring-1"
                        style={{ 
                          borderColor: COLORS.border, 
                          color: COLORS.text,
                        }}
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium mb-1" style={{ color: COLORS.text }}>
                        Selling Price (৳)
                      </label>
                      <input
                        type="number"
                        value={Math.round(discountedPrice)}
                        onChange={handleDiscountedPriceChange}
                        className="w-full p-3 rounded-lg border bg-white placeholder-gray-400 focus:outline-none focus:ring-1"
                        style={{ 
                          borderColor: COLORS.border, 
                          color: COLORS.text,
                        }}
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        Final price after discount: ৳{Math.round(discountedPrice).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  
                  {/* Stock */}
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: COLORS.text }}>
                      Available Stock
                    </label>
                    <input
                      type="number"
                      name="stock"
                      placeholder="e.g., 50"
                      value={formData.stock}
                      onChange={handleChange}
                      className="w-full p-3 rounded-lg border bg-white placeholder-gray-400 focus:outline-none focus:ring-1"
                      style={{ 
                        borderColor: COLORS.border, 
                        color: COLORS.text,
                      }}
                      required
                    />
                  </div>
                  
                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: COLORS.text }}>
                      Brand / Category
                    </label>
                    <div className="relative">
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full p-3 rounded-lg border bg-white appearance-none focus:outline-none focus:ring-1"
                        style={{ 
                          borderColor: COLORS.border, 
                          color: COLORS.text,
                        }}
                        required
                        disabled={loadingCategories}
                      >
                        <option value="">Select Brand</option>
                        {Object.keys(categories).map((key) => (
                          <option key={key} value={key}>
                            {categoryLabels[key]}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                        <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  {/* Subcategory (Model Series) */}
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: COLORS.text }}>
                      Model Series
                    </label>
                    <div className="relative">
                      <select
                        name="subCategory"
                        value={formData.subCategory}
                        onChange={handleChange}
                        className="w-full p-3 rounded-lg border bg-white appearance-none focus:outline-none focus:ring-1"
                        style={{ 
                          borderColor: COLORS.border, 
                          color: COLORS.text,
                        }}
                        disabled={!formData.category || loadingCategories}
                      >
                        <option value="">Select Series</option>
                        {getSubCategories().map((subCat, index) => (
                          <option key={index} value={subCat.name}>
                            {subCat.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  {/* FIXED: Color Input Section - Now works with comma separation */}
                  <div className="md:col-span-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-sm font-medium" style={{ color: COLORS.text }}>
                        Available Colors
                      </label>
                      <span className="text-xs text-gray-500">
                        {formData.availableColors.length} colors added
                      </span>
                    </div>
                    
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={colorInput}
                        onChange={handleColorInputChange}
                        onKeyDown={handleColorKeyDown}
                        placeholder="Type color and press comma (,) or Enter to add"
                        className="flex-1 p-3 rounded-lg border bg-white placeholder-gray-400 focus:outline-none focus:ring-1"
                        style={{ 
                          borderColor: COLORS.border, 
                          color: COLORS.text,
                        }}
                      />
                      <button
                        type="button"
                        onClick={addColor}
                        className="px-4 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                    
                    <div className="text-xs text-gray-500 mb-3">
                      💡 Tip: Type a color and press comma (,) or Enter to add. Example: Type "Black" then press comma or Enter.
                    </div>
                    
                    {/* Color Preview */}
                    {formData.availableColors.length > 0 && (
                      <div className="mt-3">
                        <div className="text-xs font-medium mb-2">Color Preview:</div>
                        <div className="flex flex-wrap gap-2">
                          {formData.availableColors.map((color, index) => (
                            <div 
                              key={index}
                              className="px-3 py-1 rounded-full text-xs border flex items-center gap-2"
                              style={{ 
                                borderColor: COLORS.border,
                                backgroundColor: color.toLowerCase() === 'black' ? '#000' : 
                                               color.toLowerCase() === 'white' ? '#fff' : 
                                               color.toLowerCase() === 'blue' ? '#3b82f6' :
                                               color.toLowerCase() === 'red' ? '#ef4444' :
                                               color.toLowerCase() === 'green' ? '#10b981' :
                                               color.toLowerCase() === 'purple' ? '#8b5cf6' :
                                               color.toLowerCase() === 'gold' ? '#fbbf24' :
                                               color.toLowerCase() === 'silver' ? '#d1d5db' : 
                                               color.toLowerCase() === 'gray' ? '#6b7280' :
                                               color.toLowerCase() === 'pink' ? '#ec4899' :
                                               color.toLowerCase() === 'yellow' ? '#fde047' :
                                               color.toLowerCase() === 'orange' ? '#f97316' : 
                                               color.toLowerCase() === 'brown' ? '#92400e' : '#f3f4f6'
                              }}
                            >
                              <span className={
                                color.toLowerCase() === 'white' || 
                                color.toLowerCase() === 'yellow' || 
                                color.toLowerCase() === 'gold' ||
                                color.toLowerCase() === 'silver' ||
                                color.toLowerCase() === 'gray'
                                  ? 'text-black' 
                                  : 'text-white'
                              }>
                                {color}
                              </span>
                              <button
                                type="button"
                                onClick={() => removeColor(index)}
                                className="text-xs opacity-70 hover:opacity-100 ml-1"
                                style={{
                                  color: color.toLowerCase() === 'white' || 
                                         color.toLowerCase() === 'yellow' || 
                                         color.toLowerCase() === 'gold' ||
                                         color.toLowerCase() === 'silver' ||
                                         color.toLowerCase() === 'gray'
                                    ? '#000' 
                                    : '#fff'
                                }}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Size Variants (For price differences) */}
                  <div className="md:col-span-2">
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-medium" style={{ color: COLORS.text }}>
                        RAM/Storage Variants with Prices
                      </label>
                      <button
                        type="button"
                        onClick={addSizeField}
                        className="flex items-center text-sm px-3 py-1 rounded-lg border border-black"
                        style={{ 
                          backgroundColor: COLORS.background,
                          color: COLORS.text
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Variant
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {sizes.map((sizeEntry, index) => (
                        <div key={index} className="flex gap-3 items-center">
                          <div className="flex-1">
                            <label className="block text-xs mb-1 opacity-70" style={{ color: COLORS.text }}>
                              Variant Name
                            </label>
                            <input
                              type="text"
                              placeholder="e.g., 8GB/128GB"
                              value={sizeEntry.size}
                              onChange={(e) => handleSizeChange(index, 'size', e.target.value)}
                              className="w-full p-3 rounded-lg border bg-white placeholder-gray-400 focus:outline-none focus:ring-1"
                              style={{ 
                                borderColor: COLORS.border, 
                                color: COLORS.text,
                              }}
                            />
                          </div>
                          
                          <div className="flex-1">
                            <label className="block text-xs mb-1 opacity-70" style={{ color: COLORS.text }}>
                              Price (৳)
                            </label>
                            <input
                              type="number"
                              placeholder="Price for this variant"
                              value={sizeEntry.sizePrice}
                              onChange={(e) => handleSizeChange(index, 'sizePrice', e.target.value)}
                              className="w-full p-3 rounded-lg border bg-white placeholder-gray-400 focus:outline-none focus:ring-1"
                              style={{ 
                                borderColor: COLORS.border, 
                                color: COLORS.text,
                              }}
                            />
                          </div>
                          
                          {sizes.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeSizeField(index)}
                              className="p-2 rounded-lg self-end border border-black"
                              style={{ backgroundColor: COLORS.background }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Image Upload Section */}
                  <div className="md:col-span-2">
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-medium" style={{ color: COLORS.text }}>
                        Phone Images (Max 5)
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className={`px-3 py-1 rounded-lg border ${
                            uploadMethod === 'url' ? 'bg-black text-white' : 'border-black'
                          }`}
                          onClick={() => setUploadMethod('url')}
                        >
                          Add URL
                        </button>
                        <button
                          type="button"
                          className={`px-3 py-1 rounded-lg border ${
                            uploadMethod === 'upload' ? 'bg-black text-white' : 'border-black'
                          }`}
                          onClick={() => setUploadMethod('upload')}
                        >
                          Upload File
                        </button>
                      </div>
                    </div>

                    {uploadMethod === 'url' && (
                      <div className="flex gap-2 mb-4">
                        <input
                          id="image-url-input"
                          type="url"
                          placeholder="Enter image URL"
                          className="flex-1 p-3 rounded-lg border bg-white"
                          style={{ borderColor: COLORS.border }}
                        />
                        <button
                          type="button"
                          className="px-4 py-3 bg-black text-white rounded-lg"
                          onClick={handleUrlImage}
                        >
                          Add
                        </button>
                      </div>
                    )}

                    {uploadMethod === 'upload' && (
                      <div className="space-y-3 mb-4">
                        {fileInputs.map((_, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileChange(index, e)}
                              className="flex-1 p-3 rounded-lg border bg-white"
                              style={{ borderColor: COLORS.border }}
                            />
                            {fileInputs.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const newInputs = [...fileInputs];
                                  newInputs.splice(index, 1);
                                  setFileInputs(newInputs);
                                  
                                  const newPreviews = [...previewImages];
                                  newPreviews.splice(index, 1);
                                  setPreviewImages(newPreviews);
                                }}
                                className="p-2 rounded-lg border border-black"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        ))}
                        {fileInputs.length < 5 && (
                          <button
                            type="button"
                            onClick={() => setFileInputs([...fileInputs, null])}
                            className="flex items-center text-sm px-3 py-1 rounded-lg border border-black"
                          >
                            Add Another Image
                          </button>
                        )}
                      </div>
                    )}

                    {/* Image Previews */}
                    {previewImages.length > 0 && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium mb-2">Preview Images</label>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                          {previewImages.map((img, index) => (
                            <div key={index} className="relative group">
                              <img 
                                src={img} 
                                alt={`Preview ${index}`}
                                className="w-full h-32 object-contain border rounded-lg"
                                style={{ borderColor: COLORS.border }}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const newPreviews = [...previewImages];
                                  newPreviews.splice(index, 1);
                                  setPreviewImages(newPreviews);
                                }}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Additional Fields */}
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: COLORS.text }}>
                      YouTube Review URL (Optional)
                    </label>
                    <input
                      type="text"
                      name="videoUrl"
                      placeholder="https://youtube.com/..."
                      value={formData.videoUrl || ''}
                      onChange={handleChange}
                      className="w-full p-3 rounded-lg border bg-white placeholder-gray-400 focus:outline-none focus:ring-1"
                      style={{ 
                        borderColor: COLORS.border, 
                        color: COLORS.text,
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: COLORS.text }}>
                      Size Chart URL (Optional)
                    </label>
                    <input
                      type="text"
                      name="sizeChart"
                      placeholder="Comparison chart URL"
                      value={formData.sizeChart}
                      onChange={handleChange}
                      className="w-full p-3 rounded-lg border bg-white placeholder-gray-400 focus:outline-none focus:ring-1"
                      style={{ 
                        borderColor: COLORS.border, 
                        color: COLORS.text,
                      }}
                    />
                  </div>

                  {/* Best Seller */}
                  <div className="md:col-span-2">
                    <div className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: COLORS.highlight }}>
                      <input
                        type="checkbox"
                        name="isBestSeller"
                        checked={formData.isBestSeller}
                        onChange={handleChange}
                        className="h-5 w-5"
                        style={{ accentColor: COLORS.primary }}
                      />
                      <label htmlFor="isBestSeller" className="font-medium" style={{ color: COLORS.text }}>
                        Mark as Featured Phone
                      </label>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="mt-8 text-center">
                  <button 
                    type="submit" 
                    className="px-8 py-4 rounded-xl bg-black text-white font-medium text-lg hover:bg-gray-800 transition-colors"
                  >
                    Add Mobile Phone to Inventory
                  </button>
                </div>
              </motion.form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category Management Tab */}
        <AnimatePresence>
          {activeTab === 'categories' && (
            <motion.div
              key="category-management"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className="p-6 rounded-xl shadow-lg"
              style={{ 
                backgroundColor: COLORS.background,
                border: `1px solid ${COLORS.border}`,
              }}
            >
              <h2 className="text-3xl font-bold mb-6 text-center" style={{ color: COLORS.text }}>
                Manage Mobile Brands & Categories
              </h2>

              {/* Add New Brand */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">Add New Brand</h3>
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Enter new brand name"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="flex-1 p-3 rounded-lg border bg-white"
                    style={{ borderColor: COLORS.border }}
                  />
                  <button
                    onClick={addNewCategory}
                    className="px-4 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800"
                  >
                    Add Brand
                  </button>
                </div>
              </div>

              {/* Add New Series */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">Add New Model Series</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full p-3 rounded-lg border bg-white"
                      style={{ borderColor: COLORS.border }}
                    >
                      <option value="">Select Brand</option>
                      {Object.keys(categories).map((key) => (
                        <option key={key} value={key}>
                          {categoryLabels[key]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Enter series name"
                      value={newSubcategoryName}
                      onChange={(e) => setNewSubcategoryName(e.target.value)}
                      className="w-full p-3 rounded-lg border bg-white"
                      style={{ borderColor: COLORS.border }}
                    />
                  </div>
                  <div>
                    <button
                      onClick={addSubcategory}
                      className="w-full px-4 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800"
                    >
                      Add Series
                    </button>
                  </div>
                </div>
              </div>

              {/* Existing Categories */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Existing Brands & Series</h3>
                
                {Object.keys(categories).length === 0 ? (
                  <div className="text-center py-8 border rounded-lg">
                    <p>No brands found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Object.keys(categories).map((key) => (
                      <div key={key} className="border rounded-lg overflow-hidden">
                        <div className="flex justify-between items-center p-4 bg-gray-100">
                          <span className="font-medium">{categoryLabels[key]}</span>
                          <button
                            onClick={() => deleteCategory(key)}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm"
                          >
                            Delete Brand
                          </button>
                        </div>
                        
                        <div className="p-4 bg-white">
                          <h4 className="font-medium mb-3">Model Series:</h4>
                          <div className="space-y-2">
                            {categories[key].map((subcat, index) => (
                              <div key={index} className="flex justify-between items-center py-2 border-b">
                                <span>{subcat.name}</span>
                                <button
                                  onClick={() => deleteSubcategory(key, index)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  Remove
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default AddProduct;