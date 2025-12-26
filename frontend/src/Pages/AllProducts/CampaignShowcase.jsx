import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  FaFire,
  FaShoppingCart,
  FaEye,
  FaChevronLeft,
  FaChevronRight,
  FaHeart,
  FaTag,
  FaClock,
  FaBolt
} from "react-icons/fa";

gsap.registerPlugin(ScrollTrigger);

// Countdown Component
const CountdownTimer = ({ endTime }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    ended: false
  });

  const calculateTimeLeft = () => {
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
  };

  useEffect(() => {
    // Initial calculation
    setTimeLeft(calculateTimeLeft());
    
    // Update every second
    const intervalId = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, [endTime]);

  if (timeLeft.ended) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-full">
        <FaClock className="w-4 h-4" />
        <span className="text-sm font-light tracking-widest">ENDED</span>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      {timeLeft.days > 0 && (
        <div className="text-center">
          <div className="w-16 h-16 rounded-lg bg-gray-900 flex flex-col items-center justify-center">
            <span className="text-2xl font-thin tracking-widest">
              {timeLeft.days.toString().padStart(2, '0')}
            </span>
            <span className="text-xs text-gray-300 mt-1 tracking-widest">DAYS</span>
          </div>
        </div>
      )}
      <div className="text-center">
        <div className="w-16 h-16 rounded-lg bg-gray-900 flex flex-col items-center justify-center">
          <span className="text-2xl font-thin tracking-widest">
            {timeLeft.hours.toString().padStart(2, '0')}
          </span>
          <span className="text-xs text-gray-300 mt-1 tracking-widest">HOURS</span>
        </div>
      </div>
      <div className="text-center">
        <div className="w-16 h-16 rounded-lg bg-gray-900 flex flex-col items-center justify-center">
          <span className="text-2xl font-thin tracking-widest">
            {timeLeft.minutes.toString().padStart(2, '0')}
          </span>
          <span className="text-xs text-gray-300 mt-1 tracking-widest">MIN</span>
        </div>
      </div>
      <div className="text-center">
        <div className="w-16 h-16 rounded-lg bg-gray-900 flex flex-col items-center justify-center">
          <span className="text-2xl font-thin tracking-widest">
            {timeLeft.seconds.toString().padStart(2, '0')}
          </span>
          <span className="text-xs text-gray-300 mt-1 tracking-widest">SEC</span>
        </div>
      </div>
    </div>
  );
};

const CampaignShowcase = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState([]);
  const [currentCampaignIndex, setCurrentCampaignIndex] = useState(0);
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCampaigns();
    const storedWishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    setWishlist(storedWishlist);
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/campaigns/home/active');
      const data = await response.json();
      setCampaigns(data);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!campaigns.length) return;

    ScrollTrigger.getAll().forEach(trigger => trigger.kill());

    gsap.fromTo(
      titleRef.current,
      { y: 60, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1.2,
        ease: "power4.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 85%",
          toggleActions: "play none none none"
        }
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [campaigns]);

  const handleViewProduct = (productId) => {
    navigate(`/products/single/${productId}`);
  };

  const handleWishlist = (product, e) => {
    e.stopPropagation();
    const storedWishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const exists = storedWishlist.some(item => item._id === product._id);
    const updatedWishlist = exists
      ? storedWishlist.filter(item => item._id !== product._id)
      : [...storedWishlist, product];

    localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
    setWishlist(updatedWishlist);

    toast.success(`${product.productName} ${exists ? 'removed from' : 'added to'} wishlist`, {
      position: 'bottom-right',
      theme: 'dark',
      autoClose: 1500
    });
  };

  const handleNextCampaign = () => {
    setCurrentCampaignIndex((prev) => (prev + 1) % campaigns.length);
  };

  const handlePrevCampaign = () => {
    setCurrentCampaignIndex((prev) => (prev - 1 + campaigns.length) % campaigns.length);
  };

  const addToCart = (product, campaignId, campaignDiscount, finalPrice) => {
    const cartItem = {
      ...product,
      price: finalPrice,
      campaignDiscount: campaignDiscount,
      isFromCampaign: true,
      campaignId: campaignId,
      quantity: 1
    };
    
    const existingCart = JSON.parse(localStorage.getItem('cart_guest')) || [];
    const existingIndex = existingCart.findIndex(item => 
      item._id === product._id && 
      item.campaignId === campaignId
    );
    
    if (existingIndex > -1) {
      existingCart[existingIndex].quantity += 1;
    } else {
      existingCart.push(cartItem);
    }
    
    localStorage.setItem('cart_guest', JSON.stringify(existingCart));
    toast.success("Added to cart!", {
      position: 'bottom-right',
      autoClose: 1500
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="relative">
          <div className="w-20 h-20 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (campaigns.length === 0) {
    return null;
  }

  const currentCampaign = campaigns[currentCampaignIndex];

  return (
    <section 
      ref={sectionRef}
      className="relative min-h-screen bg-white overflow-hidden py-16"
    >
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 mb-6 px-6 py-2.5 rounded-full bg-gradient-to-r from-red-600 to-pink-600 text-white uppercase tracking-widest text-sm font-bold"
          >
            <FaBolt className="w-4 h-4 text-yellow-400 animate-pulse" />
            <span>FLASH DEALS</span>
          </motion.div>

          <div className="overflow-hidden mb-4">
            <h2 
              ref={titleRef}
              className="text-5xl md:text-6xl font-bold tracking-widest uppercase mb-4 text-black"
            >
              LIMITED TIME OFFERS
            </h2>
          </div>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto font-light tracking-wider uppercase">
            Exclusive campaign deals on premium products. Limited stock available!
          </p>
        </div>

        {campaigns.length > 1 && (
          <div className="flex justify-center gap-4 mb-8">
            {campaigns.map((campaign, index) => (
              <button
                key={campaign._id}
                onClick={() => setCurrentCampaignIndex(index)}
                className={`px-6 py-2 rounded-full text-sm font-bold tracking-widest uppercase transition-all duration-300 ${
                  currentCampaignIndex === index
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {campaign.name}
              </button>
            ))}
          </div>
        )}

        <div className="relative mb-12 rounded-3xl overflow-hidden border-2 border-gray-200">
          <div className="relative h-[400px] md:h-[500px]">
            <img
              src={currentCampaign.bannerImage}
              alt={currentCampaign.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80';
              }}
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
            
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                  <h3 className="text-4xl md:text-5xl font-bold tracking-widest uppercase text-white mb-3">
                    {currentCampaign.name}
                  </h3>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-xl px-4 py-2 rounded-full">
                      <FaTag className="w-4 h-4 text-yellow-400" />
                      <span className="text-yellow-400 font-bold tracking-widest uppercase">
                        Extra {currentCampaign.extraDiscount}% OFF
                      </span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-xl px-4 py-2 rounded-full">
                      <FaClock className="w-4 h-4 text-white" />
                      <span className="text-white font-bold tracking-widest uppercase">
                        <CountdownTimer endTime={currentCampaign.endTime} />
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={handlePrevCampaign}
                    className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-xl border border-white/20 flex items-center justify-center hover:bg-white/30 transition-all"
                  >
                    <FaChevronLeft className="w-5 h-5 text-white" />
                  </button>
                  <button
                    onClick={handleNextCampaign}
                    className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-xl border border-white/20 flex items-center justify-center hover:bg-white/30 transition-all"
                  >
                    <FaChevronRight className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentCampaign.products.slice(0, 8).map((campaignProduct, index) => {
              const product = campaignProduct.productId;
              const isInWishlist = wishlist.some(item => item._id === product._id);
              
              const originalPrice = product.price;
              const originalDiscount = product.discount || 0;
              const campaignDiscount = currentCampaign.extraDiscount;
              const finalPrice = campaignProduct.finalPrice;
              
              return (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative"
                >
                  <div className="relative overflow-hidden rounded-2xl bg-white border-2 border-transparent bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 p-1 transition-all duration-500 group-hover:shadow-2xl">
                    <div className="relative bg-white rounded-xl overflow-hidden h-full">
                      <div className="absolute top-4 left-4 z-20">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-black to-gray-900 text-white rounded-full text-xs font-bold tracking-widest uppercase">
                          <FaFire className="w-3 h-3 text-red-400" />
                          <span>CAMPAIGN DEAL</span>
                        </div>
                      </div>
                      
                      <div className="absolute top-4 right-4 z-20">
                        <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-red-600 to-pink-600 text-white text-xs font-bold tracking-widest uppercase rounded animate-pulse">
                          <FaClock className="w-3 h-3" />
                          <span className="font-mono">
                            <CountdownTimer endTime={currentCampaign.endTime} />
                          </span>
                        </div>
                      </div>
                      
                      <button 
                        onClick={(e) => handleWishlist(product, e)}
                        className="absolute top-4 right-4 z-20 w-11 h-11 rounded-full bg-white/90 flex items-center justify-center hover:bg-gray-100 transition-all duration-300 border border-gray-200 hover:border-gray-300 hover:scale-110"
                      >
                        <FaHeart className={`text-base ${isInWishlist ? 'text-red-500' : 'text-gray-400 group-hover:text-gray-600'}`} />
                      </button>

                      <div 
                        className="relative h-64 overflow-hidden bg-gradient-to-b from-gray-50 to-white cursor-pointer"
                        onClick={() => handleViewProduct(product._id)}
                      >
                        {product.images && product.images[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.productName}
                            className="w-full h-full object-contain scale-90 group-hover:scale-95 transition-transform duration-700 ease-out"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="w-16 h-16 text-gray-300" />
                          </div>
                        )}
                      </div>

                      <div className="p-6">
                        <h3 
                          className="text-lg font-bold tracking-widest uppercase text-black mb-2 cursor-pointer hover:text-gray-700 transition-colors"
                          onClick={() => handleViewProduct(product._id)}
                        >
                          {product.productName}
                        </h3>
                        
                        <p className="text-gray-500 text-xs mb-4 line-clamp-2 tracking-wide">
                          {product.description?.substring(0, 100) || "Premium product with exclusive campaign discount"}
                        </p>

                        <div className="space-y-3 mb-6">
                          <div className="flex items-baseline gap-3">
                            <span className="text-2xl font-bold tracking-widest text-black">
                              ৳{finalPrice?.toLocaleString() || '0'}
                            </span>
                            
                            <div className="flex flex-col">
                              <span className="text-gray-400 line-through text-sm">
                                ৳{originalPrice.toLocaleString()}
                              </span>
                              <div className="flex items-center gap-2">
                                {originalDiscount > 0 && (
                                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded border border-gray-200">
                                    {originalDiscount}% OFF
                                  </span>
                                )}
                                <span className="text-xs px-2 py-1 bg-black text-white rounded font-bold">
                                  +{campaignDiscount}% OFF
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-sm text-green-600 font-bold tracking-wide">
                            SAVE: ৳{(originalPrice - (finalPrice || originalPrice)).toLocaleString()}
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={() => handleViewProduct(product._id)}
                            className="flex-1 py-3 px-4 bg-gray-100 text-black text-sm font-bold tracking-widest uppercase rounded-lg hover:bg-gray-200 transition-all duration-300 flex items-center justify-center gap-2"
                          >
                            <FaEye className="w-4 h-4" />
                            VIEW
                          </button>
                          
                          <button
                            onClick={() => addToCart(product, currentCampaign._id, campaignDiscount, finalPrice)}
                            className="w-12 h-12 rounded-lg bg-black text-white flex items-center justify-center hover:bg-gray-900 transition-all duration-300"
                          >
                            <FaShoppingCart className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {currentCampaign.products.length > 8 && (
          <div className="text-center">
            <button
              onClick={() => navigate(`/campaign/${currentCampaign._id}`)}
              className="px-8 py-3 rounded-full bg-black text-white font-bold tracking-widest uppercase hover:bg-gray-900 transition-all duration-300 flex items-center gap-2 mx-auto border-2 border-black"
            >
              VIEW ALL {currentCampaign.products.length} PRODUCTS
              <FaChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="mt-12">
          <div className="max-w-4xl mx-auto bg-black text-white rounded-2xl p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h4 className="text-2xl font-bold tracking-widest uppercase mb-2">
                  HURRY UP! DEAL ENDS SOON
                </h4>
                <p className="text-gray-300 font-light tracking-wide uppercase">
                  This exclusive offer ends in:
                </p>
              </div>
              
              <CountdownTimer endTime={currentCampaign.endTime} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CampaignShowcase;