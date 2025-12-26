import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { faHeart as solidHeart } from "@fortawesome/free-solid-svg-icons";
import { faHeart as regularHeart } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  Sparkles, 
  Award, 
  Star, 
  TrendingUp, 
  Shield,
  Zap,
  Camera,
  Battery,
  ChevronRight,
  Eye,
  ShoppingBag,
  ArrowRight,
  Check,
  Clock,
  BatteryCharging,
  Cpu,
  Radio,
  Smartphone
} from "lucide-react";

// Register plugins
gsap.registerPlugin(ScrollTrigger);

const BestSellers = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState([]);
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const cardsRef = useRef([]);
  const navigate = useNavigate();

  const categories = [
    { id: "all", label: "All", icon: <Smartphone className="w-4 h-4" /> },
    { id: "iphone", label: "iPhone", gradient: "from-gray-900 via-blue-500/10 to-black" },
    { id: "samsung", label: "Samsung", gradient: "from-gray-900 via-purple-500/10 to-black" },
    { id: "google", label: "Pixel", gradient: "from-gray-900 via-green-500/10 to-black" },
    { id: "oneplus", label: "OnePlus", gradient: "from-gray-900 via-red-500/10 to-black" },
    { id: "premium", label: "Premium", icon: <Award className="w-4 h-4" /> }
  ];

  // Helper function to get gradient based on brand
  const getBrandGradient = (productName) => {
    const name = productName.toLowerCase();
    if (name.includes('iphone') || name.includes('apple')) {
      return "from-gray-900/0 via-blue-500/5 to-gray-900/0";
    } else if (name.includes('samsung') || name.includes('galaxy')) {
      return "from-gray-900/0 via-purple-500/5 to-gray-900/0";
    } else if (name.includes('oneplus')) {
      return "from-gray-900/0 via-red-500/5 to-gray-900/0";
    } else if (name.includes('nothing')) {
      return "from-gray-900/0 via-white/5 to-gray-900/0";
    } else if (name.includes('vivo')) {
      return "from-gray-900/0 via-cyan-500/5 to-gray-900/0";
    } else if (name.includes('oppo')) {
      return "from-gray-900/0 via-blue-500/5 to-gray-900/0";
    } else if (name.includes('xiaomi') || name.includes('redmi')) {
      return "from-gray-900/0 via-orange-500/5 to-gray-900/0";
    } else if (name.includes('google') || name.includes('pixel')) {
      return "from-gray-900/0 via-green-500/5 to-gray-900/0";
    }
    return "from-gray-900/0 via-gray-500/5 to-gray-900/0";
  };

  // Get brand color for accents
  const getBrandColor = (productName) => {
    const name = productName.toLowerCase();
    if (name.includes('iphone') || name.includes('apple')) return '#007AFF';
    if (name.includes('samsung') || name.includes('galaxy')) return '#8B5CF6';
    if (name.includes('oneplus')) return '#F43F5E';
    if (name.includes('google') || name.includes('pixel')) return '#10B981';
    if (name.includes('nothing')) return '#FFFFFF';
    return '#6B7280';
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/products/fetch-products");
        const data = await response.json();
        const bestSellers = data
          .filter(product => product.isBestSeller === true)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 20);
        setProducts(bestSellers);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const storedWishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    setWishlist(storedWishlist);
  }, []);

  useEffect(() => {
    if (!products.length) return;

    ScrollTrigger.getAll().forEach(trigger => trigger.kill());

    // Title reveal with Apple-style animation
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

    // Staggered card animations
    cardsRef.current.forEach((card, index) => {
      if (card) {
        gsap.from(card, {
          y: 80,
          opacity: 0,
          scale: 0.95,
          duration: 1,
          delay: index * 0.05,
          ease: "power3.out",
          scrollTrigger: {
            trigger: card,
            start: "top 95%",
            toggleActions: "play none none none"
          }
        });

        // Enhanced hover animations
        card.addEventListener('mouseenter', () => {
          gsap.to(card, {
            y: -12,
            duration: 0.4,
            ease: "power2.out",
            boxShadow: '0 45px 100px -20px rgba(0, 0, 0, 0.3)'
          });
        });

        card.addEventListener('mouseleave', () => {
          gsap.to(card, {
            y: 0,
            duration: 0.4,
            ease: "power2.out",
            boxShadow: '0 20px 60px -30px rgba(0, 0, 0, 0.2)'
          });
        });
      }
    });

    // Floating elements animation
    gsap.to(".floating-glow", {
      y: -30,
      duration: 4,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      stagger: {
        each: 0.3,
        from: "random"
      }
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [products]);

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

    toast.success(`${product.productName} ${exists ? 'removed from' : 'added to'} wishlist`, {
      position: 'bottom-right',
      theme: 'dark',
      autoClose: 1500,
      hideProgressBar: true,
      style: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        backdropFilter: 'blur(20px)',
        color: '#fff',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px'
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 to-black flex items-center justify-center">
        <div className="relative">
          <div className="w-20 h-20 border-[1.5px] border-white/10 border-t-white rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <section 
      ref={sectionRef}
      className="relative min-h-screen bg-gradient-to-b from-gray-950 to-black overflow-hidden"
    >
      {/* Premium ambient lights */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-500/5 via-transparent to-transparent pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-t from-purple-500/3 via-transparent to-transparent pointer-events-none" />
      
      {/* Dynamic floating glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="floating-glow absolute w-96 h-96 rounded-full blur-3xl opacity-[0.02]"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `radial-gradient(circle, ${i % 2 === 0 ? '#3B82F6' : '#8B5CF6'} 0%, transparent 70%)`,
            }}
          />
        ))}
      </div>

      {/* Ultra-thin decorative lines */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[95%] h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[95%] h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />

      <div className="container mx-auto px-4 py-24 relative z-10">
        {/* Apple-style minimalist header */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-3 mb-8 px-6 py-2.5 rounded-full bg-white/5 backdrop-blur-xl border border-white/10"
          >
            <Award className="w-4 h-4 text-blue-400" />
            <span className="text-blue-400 text-sm tracking-[0.3em] font-medium">BESTSELLERS</span>
          </motion.div>

          <div className="overflow-hidden mb-6">
            <h2 
              ref={titleRef}
              className="text-7xl md:text-8xl font-thin tracking-tight mb-6 bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent"
            >
              The Best. <span className="text-white/40">Perfected.</span>
            </h2>
          </div>
          
          <p className="text-xl text-white/60 max-w-2xl mx-auto font-light tracking-wide leading-relaxed mb-12">
            Experience innovation at its finest. Our curated selection represents the pinnacle of mobile technology.
          </p>

          {/* Category filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-16">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                  activeCategory === category.id
                    ? 'bg-white text-black'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                {category.icon}
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats bar - Apple style */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20 px-8">
          {[
            { label: "Performance", value: "A16 Bionic", icon: <Cpu className="w-5 h-5" />, desc: "Fastest Chip" },
            { label: "Camera", value: "48MP Pro", icon: <Camera className="w-5 h-5" />, desc: "Pro System" },
            { label: "Battery", value: "All Day", icon: <BatteryCharging className="w-5 h-5" />, desc: "Long Lasting" },
            { label: "Connectivity", value: "5G Ready", icon: <Radio className="w-5 h-5" />, desc: "Ultra Fast" }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="text-center p-6 rounded-2xl bg-white/2.5 backdrop-blur-xl border border-white/5 hover:border-white/10 transition-colors"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-white/10 to-white/5 mb-4">
                <div className="text-white/80">
                  {stat.icon}
                </div>
              </div>
              <div className="text-2xl font-medium text-white mb-1">{stat.value}</div>
              <div className="text-white/60 text-sm mb-1">{stat.label}</div>
              <div className="text-white/40 text-xs">{stat.desc}</div>
            </motion.div>
          ))}
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-2">
            {products.map((product, index) => {
              const discountedPrice = product.discount 
                ? product.price - (product.price * product.discount) / 100 
                : product.price;
              
              const isInWishlist = wishlist.some(item => item._id === product._id);
              const brandGradient = getBrandGradient(product.productName);
              const brandColor = getBrandColor(product.productName);

              return (
                <div
                  key={product._id}
                  ref={el => cardsRef.current[index] = el}
                  className="product-card group relative"
                  onMouseEnter={() => setHoveredProduct(product._id)}
                  onMouseLeave={() => setHoveredProduct(null)}
                >
                  {/* Premium card with glass morphism */}
                  <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-white/5 to-white/2.5 backdrop-blur-xl border border-white/10 transition-all duration-500 group-hover:border-white/20 group-hover:shadow-2xl">
                    {/* Dynamic brand glow */}
                    <div 
                      className={`absolute inset-0 bg-gradient-to-br ${brandGradient} opacity-0 group-hover:opacity-30 transition-opacity duration-700`}
                      style={{ background: `radial-gradient(circle at 50% 0%, ${brandColor}20 0%, transparent 70%)` }}
                    />
                    
                    {/* Card glow effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    </div>

                    {/* Image container with parallax effect */}
                    <div className="relative h-72 overflow-hidden bg-gradient-to-b from-gray-900 to-black">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
                      
                      {/* Main product image */}
                      <div className="relative h-full w-full">
                        <img
                          src={product.images[0] || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
                          alt={product.productName}
                          className="product-image w-full h-full object-contain scale-90 group-hover:scale-95 transition-transform duration-700 ease-out"
                          style={{ transformOrigin: 'center center' }}
                        />
                      </div>
                      
                      {/* Floating badges */}
                      <div className="absolute top-4 left-4 z-20 space-y-2">
                        <div className="px-4 py-1.5 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 backdrop-blur-xl rounded-full text-xs font-medium text-amber-300 tracking-wider border border-amber-500/30">
                          <span className="flex items-center gap-1.5">
                            <Star className="w-3 h-3" />
                            BESTSELLER
                          </span>
                        </div>
                        
                        {product.discount > 0 && (
                          <div className="px-3 py-1 bg-gradient-to-r from-red-500/20 to-pink-500/20 backdrop-blur-xl rounded-full text-xs font-medium text-red-400 border border-red-500/30">
                            SAVE {product.discount}%
                          </div>
                        )}
                      </div>
                      
                      {/* Premium wishlist button */}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleWishlist(product);
                        }}
                        className="absolute top-4 right-4 z-20 w-11 h-11 rounded-full bg-black/40 backdrop-blur-xl flex items-center justify-center hover:bg-white/20 transition-all duration-300 border border-white/10 hover:border-white/30 hover:scale-110"
                      >
                        <FontAwesomeIcon
                          icon={isInWishlist ? solidHeart : regularHeart}
                          className={`text-base ${isInWishlist ? 'text-red-400' : 'text-white/70 group-hover:text-white'}`}
                        />
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-500/0 to-rose-500/0 group-hover:from-pink-500/10 group-hover:to-rose-500/10 transition-all duration-300" />
                      </button>
                      
                      {/* Hover overlay with quick actions */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 flex items-end pb-8">
                        <div className="w-full px-6">
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleViewDetails(product._id)}
                              className="flex-1 py-3 px-4 bg-white text-black text-sm font-medium rounded-xl hover:bg-white/90 transition-all duration-300 flex items-center justify-center gap-2 group/btn"
                            >
                              <Eye className="w-4 h-4" />
                              Quick View
                              <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all" />
                            </button>
                            
                            <button
                              onClick={() => handleViewDetails(product._id)}
                              className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all duration-300"
                            >
                              <ShoppingBag className="w-5 h-5 text-white" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Content section */}
                    <div className="p-6 relative z-20">
                      {/* Product title with gradient */}
                      <h3 className="text-2xl font-medium text-white mb-2 tracking-tight">
                        {product.productName}
                      </h3>
                      
                      {/* Subtle description */}
                      <p className="text-white/50 text-sm font-light mb-5 line-clamp-2">
                        {product.description || "Premium smartphone with cutting-edge technology and superior performance."}
                      </p>
                      
                      {/* Price and stock */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="space-y-1">
                          <div className="text-3xl font-light text-white">
                            ৳{discountedPrice.toFixed(0)}
                          </div>
                          {product.discount > 0 && (
                            <div className="flex items-center gap-3">
                              <span className="text-white/40 line-through text-sm">
                                ৳{product.price.toFixed(0)}
                              </span>
                              <span className="text-xs px-2 py-1 bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-400 rounded-lg border border-red-500/20">
                                Save ৳{(product.price - discountedPrice).toFixed(0)}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {/* Stock status */}
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${product.stock > 10 ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`} />
                          <span className={`text-sm ${product.stock > 10 ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {product.stock > 10 ? 'In Stock' : 'Low Stock'}
                          </span>
                        </div>
                      </div>
                      
                      {/* Key features */}
                      <div className="grid grid-cols-3 gap-2 mb-6">
                        <div className="text-center p-3 rounded-lg bg-white/5">
                          <Camera className="w-4 h-4 text-white/60 mx-auto mb-1" />
                          <div className="text-xs text-white/60">Pro Camera</div>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-white/5">
                          <Battery className="w-4 h-4 text-white/60 mx-auto mb-1" />
                          <div className="text-xs text-white/60">Long Battery</div>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-white/5">
                          <Zap className="w-4 h-4 text-white/60 mx-auto mb-1" />
                          <div className="text-xs text-white/60">Fast Charge</div>
                        </div>
                      </div>
                      
                      {/* Primary CTA */}
                      <button
                        onClick={() => handleViewDetails(product._id)}
                        disabled={product.stock === 0}
                        className={`w-full py-4 px-6 rounded-xl text-sm font-medium transition-all duration-300 flex items-center justify-center gap-3 group/cta ${
                          product.stock === 0
                            ? 'bg-white/5 text-white/30 cursor-not-allowed'
                            : 'bg-white text-black hover:bg-white/90 hover:shadow-xl'
                        }`}
                      >
                        {product.stock === 0 ? (
                          <>
                            <Clock className="w-4 h-4" />
                            Out of Stock
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-4 h-4" />
                            Add to Bag
                            <div className="w-5 h-5 rounded-full bg-black/10 flex items-center justify-center opacity-0 group-hover/cta:opacity-100 transition-opacity">
                              <ArrowRight className="w-3 h-3" />
                            </div>
                          </>
                        )}
                      </button>
                      
                      {/* Express delivery badge */}
                      <div className="mt-4 text-center">
                        <div className="inline-flex items-center gap-2 text-xs text-white/40">
                          <Check className="w-3 h-3" />
                          Free shipping • 2-day delivery
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Outer glow effect */}
                  <div 
                    className="absolute -inset-4 opacity-0 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none blur-xl"
                    style={{
                      background: `radial-gradient(circle at center, ${brandColor}20 0%, transparent 70%)`
                    }}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-32">
            <div className="w-40 h-40 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-white/5 to-white/2.5 backdrop-blur-xl border border-white/10 flex items-center justify-center">
              <div className="relative">
                <Sparkles className="w-16 h-16 text-white/40" />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl" />
              </div>
            </div>
            <h3 className="text-3xl font-light text-white mb-4 tracking-tight">
              Curating Excellence
            </h3>
            <p className="text-white/50 max-w-md mx-auto text-lg font-light">
              Our premium selection is being prepared. Experience unparalleled innovation soon.
            </p>
          </div>
        )}

        {/* Call to action */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-32"
        >
          <div className="inline-flex items-center gap-2 text-white/60 text-sm tracking-wider uppercase mb-8">
            <div className="w-20 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            DISCOVER MORE
            <div className="w-20 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </div>
          <h3 className="text-4xl font-light text-white mb-6 tracking-tight">
            Experience Innovation
          </h3>
          <p className="text-white/50 text-lg max-w-xl mx-auto mb-10 font-light">
            Explore our complete collection of cutting-edge technology designed for tomorrow.
          </p>
          <button className="px-12 py-4 bg-white text-black text-sm font-medium rounded-2xl hover:bg-white/90 transition-all duration-300 flex items-center gap-3 mx-auto group/explore">
            View All Products
            <ArrowRight className="w-4 h-4 group-hover/explore:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>

      {/* Apple-style bottom gradient */}
      <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-black via-black/95 to-transparent pointer-events-none" />
    </section>
  );
};

export default BestSellers;