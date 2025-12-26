import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

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

const AllProducts = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('https://prexo.onrender.com/api/products/fetch-products', {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            perPage: 1000,  // Request all products
            page: 1
          }
        });
        
        // Handle different possible response structures
        let productsData = response.data;
        if (response.data && response.data.products) {
          productsData = response.data.products;
        } else if (response.data && Array.isArray(response.data.data)) {
          productsData = response.data.data;
        }
        
        // Sort products by creation date (newest first)
        const sortedProducts = productsData.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        setProducts(sortedProducts);
        setFilteredProducts(sortedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error('Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Search/filter functionality
  useEffect(() => {
    const results = products.filter(product => 
      product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.productCode.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(results);
  }, [searchTerm, products]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`https://prexo.onrender.com/api/products/${id}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      
      toast.success('Product deleted successfully');
      setProducts(products.filter(product => product._id !== id));
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete product');
    }
  };

  const handleEdit = (productId) => {
    navigate(`/edit-product/${productId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen" style={{ backgroundColor: COLORS.background }}>
        <div className="animate-spin rounded-full h-16 w-16 border-t-4" style={{ borderColor: COLORS.primary }}></div>
      </div>
    );
  }

  return (
    <div className="p-8 min-h-screen" style={{ backgroundColor: COLORS.background }}>
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <motion.h2 
          className="text-3xl font-bold"
          style={{ color: COLORS.text }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          All Products ({filteredProducts.length})
        </motion.h2>
        
        <div className="w-full md:w-1/3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 rounded-lg border focus:outline-none focus:ring-2"
              style={{ 
                borderColor: COLORS.border,
                backgroundColor: COLORS.background,
                color: COLORS.text,
                focusRingColor: COLORS.primary
              }}
            />
            <svg 
              className="absolute left-3 top-2.5 h-5 w-5" 
              fill="none" 
              stroke={COLORS.text} 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Link to="/admin/add-products">
            <motion.button
              className="px-6 py-3 rounded-lg flex items-center gap-2"
              style={{ 
                backgroundColor: COLORS.primary,
                color: "#FFFFFF"
              }}
              whileHover={{ 
                scale: 1.05, 
                backgroundColor: COLORS.accent 
              }}
              whileTap={{ scale: 0.95 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Product
            </motion.button>
          </Link>
        </motion.div>
      </div>
      
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-16 w-16" fill="none" stroke={COLORS.text} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="mt-4 text-lg" style={{ color: COLORS.text }}>
            {searchTerm ? 'No products match your search' : 'No products found'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product, index) => {
            const discount = product.discount || 0;
            const originalPrice = product.price;
            const discountedPrice = discount > 0 ? 
              originalPrice - (originalPrice * discount) / 100 : 
              originalPrice;

            return (
              <motion.div 
                key={product._id}
                className="p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 flex flex-col"
                style={{ backgroundColor: COLORS.background }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="h-72 w-full overflow-hidden rounded-lg mb-4 flex-shrink-0 relative">
                  {product.images && product.images[0] ? (
                    <motion.img
                      src={product.images[0]}
                      alt={product.productName}
                      className="w-full h-full object-cover"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                      whileHover={{ scale: 1.05 }}
                    />
                  ) : (
                    <div className="bg-gray-100 border border-gray-200 rounded-xl w-full h-full flex items-center justify-center">
                      <span style={{ color: COLORS.text }}>No Image</span>
                    </div>
                  )}
                  
                  {discount > 0 && (
                    <div className="absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-bold" 
                      style={{ backgroundColor: COLORS.primary, color: 'white' }}>
                      {discount}% OFF
                    </div>
                  )}
                </div>
                
                <div className="flex-grow flex flex-col">
                  <div className="flex justify-between items-start mb-1">
                    <motion.h3 
                      className="text-xl font-semibold line-clamp-2 flex-grow"
                      style={{ color: COLORS.text }}
                      whileHover={{ color: COLORS.accent }}
                    >
                      {product.productName}
                    </motion.h3>
                    
                    <span className="text-xs px-2 py-1 rounded ml-2" 
                      style={{ 
                        backgroundColor: `${COLORS.subtle}`, 
                        color: COLORS.background 
                      }}>
                      #{product.productCode}
                    </span>
                  </div>
                  
                  <p className="text-sm mb-4 line-clamp-2 text-gray-500 flex-grow">
                    {product.description}
                  </p>

                  <div className="flex justify-between items-center mb-4">
                    <div className="flex flex-col">
                      {discount > 0 && (
                        <p className="text-sm font-medium line-through text-gray-500">
                          BDT: {Math.floor(originalPrice)}
                        </p>
                      )}
                      <p className="text-lg font-bold" style={{ color: COLORS.text }}>
                        BDT: {Math.floor(discountedPrice)}
                      </p>
                    </div>
                    {product.stock > 0 ? (
                      <span className="text-sm font-semibold text-gray-600">In Stock</span>
                    ) : (
                      <span className="text-sm font-semibold text-gray-500">Out of Stock</span>
                    )}
                  </div>

                  <div className="flex justify-between mt-auto">
                    <motion.button
                      onClick={() => handleEdit(product._id)}
                      className="px-4 py-2 rounded-lg border border-black"
                      style={{ backgroundColor: COLORS.background, color: COLORS.text }}
                      whileHover={{ 
                        backgroundColor: COLORS.buttonHover,
                        color: "#FFFFFF"
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Edit
                    </motion.button>
                    <motion.button
                      onClick={() => handleDelete(product._id)}
                      className="px-4 py-2 rounded-lg"
                      style={{ backgroundColor: COLORS.primary, color: "#FFFFFF" }}
                      whileHover={{ 
                        scale: 1.05, 
                        backgroundColor: COLORS.accent 
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Delete
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AllProducts;