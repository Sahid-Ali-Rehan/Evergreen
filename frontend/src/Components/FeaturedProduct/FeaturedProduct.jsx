import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronRight, Zap, Battery, Camera, Cpu, Sparkles, Shield, Heart, Check, Clock, Wifi, Volume2 } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const FeaturedProduct = () => {
  const [activePhone, setActivePhone] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isSticky, setIsSticky] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const sectionRef = useRef(null);
  const stickyRef = useRef(null);
  const phoneContainerRef = useRef(null);
  const autoPlayRef = useRef(null);
  
  const phones = [
    {
      id: "iphone",
      name: "iPhone 15 Pro",
      tagline: "Titanium. So strong. So light. So Pro.",
      images: [
        "https://images.unsplash.com/photo-1695048133142-1a20484d2569?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
        "https://images.unsplash.com/photo-1695048133085-5a5f5b5d5b1a?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
        "https://images.unsplash.com/photo-1695048133126-1a20484d2569?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
        "https://images.unsplash.com/photo-1695048133111-1a20484d2569?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
        "https://images.unsplash.com/photo-1695048133099-1a20484d2569?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
      ],
      color: "Natural Titanium",
      price: "$999",
      features: [
        {
          icon: <Cpu className="w-6 h-6" />,
          title: "A17 Pro Chip",
          description: "The most powerful chip in a smartphone",
          stats: "6-core CPU • 16-core Neural Engine"
        },
        {
          icon: <Camera className="w-6 h-6" />,
          title: "Pro Camera System",
          description: "48MP Main | 12MP Ultra Wide | 12MP Telephoto",
          stats: "5x Optical Zoom • Photonic Engine"
        },
        {
          icon: <Battery className="w-6 h-6" />,
          title: "All-Day Battery",
          description: "Up to 29 hours video playback",
          stats: "Fast Charging • MagSafe Compatible"
        },
        {
          icon: <Shield className="w-6 h-6" />,
          title: "Titanium Design",
          description: "Aerospace-grade titanium enclosure",
          stats: "Lightest Pro model ever"
        }
      ],
      gradient: "from-gray-900 via-blue-900/30 to-black"
    },
    {
      id: "samsung",
      name: "Galaxy S24 Ultra",
      tagline: "The Ultimate Smartphone Experience",
      images: [
        "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
        "https://images.unsplash.com/photo-1610945264816-4c8f2bb49d23?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
        "https://images.unsplash.com/photo-1610945264816-4c8f2bb49d23?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
        "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
        "https://images.unsplash.com/photo-1610945264816-4c8f2bb49d23?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
      ],
      color: "Titanium Black",
      price: "$1,299",
      features: [
        {
          icon: <Zap className="w-6 h-6" />,
          title: "Snapdragon 8 Gen 3",
          description: "Most advanced mobile processor",
          stats: "30% faster CPU • 25% faster GPU"
        },
        {
          icon: <Camera className="w-6 h-6" />,
          title: "200MP Camera",
          description: "Professional-grade photography",
          stats: "10x Optical Zoom • 100x Space Zoom"
        },
        {
          icon: <Sparkles className="w-6 h-6" />,
          title: "Galaxy AI",
          description: "Intelligence reimagined",
          stats: "Live Translate • Circle to Search"
        },
        {
          icon: <Shield className="w-6 h-6" />,
          title: "Titanium Frame",
          description: "Military-grade durability",
          stats: "Corning® Gorilla® Armor"
        }
      ],
      gradient: "from-gray-900 via-violet-900/30 to-black"
    },
    {
      id: "oneplus",
      name: "OnePlus 12",
      tagline: "Beyond Speed. Beyond Power.",
      images: [
        "https://images.unsplash.com/photo-1598327105666-5b89351aff97?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
        "https://images.unsplash.com/photo-1598327105666-5b89351aff97?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
        "https://images.unsplash.com/photo-1598327105666-5b89351aff97?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
        "https://images.unsplash.com/photo-1598327105666-5b89351aff97?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
        "https://images.unsplash.com/photo-1598327105666-5b89351aff97?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
      ],
      color: "Flowy Emerald",
      price: "$799",
      features: [
        {
          icon: <Zap className="w-6 h-6" />,
          title: "Snapdragon 8 Gen 3",
          description: "Never settle performance",
          stats: "24GB RAM • 1TB Storage"
        },
        {
          icon: <Camera className="w-6 h-6" />,
          title: "Hasselblad Camera",
          description: "Master photography in any light",
          stats: "50MP Main • 64MP Periscope"
        },
        {
          icon: <Battery className="w-6 h-6" />,
          title: "SUPERVOOC Charge",
          description: "100W wired charging",
          stats: "0-100% in 26 minutes"
        },
        {
          icon: <Sparkles className="w-6 h-6" />,
          title: "Aqua Touch",
          description: "Use in rain with wet hands",
          stats: "IP65 Water Resistance"
        }
      ],
      gradient: "from-gray-900 via-emerald-900/30 to-black"
    },
    {
      id: "nothing",
      name: "Phone (2)",
      tagline: "A New Perspective.",
      images: [
        "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
        "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
        "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
        "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
        "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
      ],
      color: "White",
      price: "$699",
      features: [
        {
          icon: <Cpu className="w-6 h-6" />,
          title: "Snapdragon 8+ Gen 1",
          description: "Flagship performance",
          stats: "Up to 512GB Storage"
        },
        {
          icon: <Sparkles className="w-6 h-6" />,
          title: "Glyph Interface",
          description: "Unique light patterns",
          stats: "LED notifications • Custom rhythms"
        },
        {
          icon: <Camera className="w-6 h-6" />,
          title: "Dual 50MP Cameras",
          description: "Advanced imaging system",
          stats: "32MP Selfie • Advanced Algorithms"
        },
        {
          icon: <Battery className="w-6 h-6" />,
          title: "4700mAh Battery",
          description: "Power that lasts",
          stats: "45W Fast Charging"
        }
      ],
      gradient: "from-gray-900 via-white/10 to-black"
    },
    {
      id: "vivo",
      name: "Vivo X100 Pro",
      tagline: "Master of Photography",
      images: [
        "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
        "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
        "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
        "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
        "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
      ],
      color: "Starry Black",
      price: "$899",
      features: [
        {
          icon: <Camera className="w-6 h-6" />,
          title: "ZEISS Optics",
          description: "Professional photography system",
          stats: "50MP Main • 50MP Ultra Wide"
        },
        {
          icon: <Cpu className="w-6 h-6" />,
          title: "MediaTek Dimensity 9300",
          description: "Flagship performance",
          stats: "All Big Core Architecture"
        },
        {
          icon: <Battery className="w-6 h-6" />,
          title: "120W FlashCharge",
          description: "Ultra-fast charging",
          stats: "0-100% in 25 minutes"
        },
        {
          icon: <Sparkles className="w-6 h-6" />,
          title: "Astrophotography",
          description: "Stunning night sky photos",
          stats: "Advanced Night Mode"
        }
      ],
      gradient: "from-gray-900 via-cyan-900/30 to-black"
    },
    {
      id: "oppo",
      name: "Find X7 Ultra",
      tagline: "Beyond Imagination",
      images: [
        "https://images.unsplash.com/photo-1598327105666-5b89351aff97?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
        "https://images.unsplash.com/photo-1598327105666-5b89351aff97?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
        "https://images.unsplash.com/photo-1598327105666-5b89351aff97?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
        "https://images.unsplash.com/photo-1598327105666-5b89351aff97?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
        "https://images.unsplash.com/photo-1598327105666-5b89351aff97?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
      ],
      color: "Ocean Blue",
      price: "$849",
      features: [
        {
          icon: <Camera className="w-6 h-6" />,
          title: "Quad Main Camera",
          description: "Hasselblad partnership",
          stats: "50MP each • Periscope Telephoto"
        },
        {
          icon: <Cpu className="w-6 h-6" />,
          title: "Snapdragon 8 Gen 3",
          description: "Top-tier performance",
          stats: "LPDDR5X RAM • UFS 4.0 Storage"
        },
        {
          icon: <Battery className="w-6 h-6" />,
          title: "100W SUPERVOOC",
          description: "Ultra-fast charging",
          stats: "50W Wireless • 5000mAh Battery"
        },
        {
          icon: <Sparkles className="w-6 h-6" />,
          title: "Pantone Display",
          description: "True-to-life colors",
          stats: "2K LTPO • 120Hz Refresh"
        }
      ],
      gradient: "from-gray-900 via-blue-900/30 to-black"
    }
  ];

  // Auto-play phones
  useEffect(() => {
    if (isAutoPlaying) {
      autoPlayRef.current = setInterval(() => {
        setActivePhone((prev) => (prev + 1) % phones.length);
      }, 5000);
    }
    
    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isAutoPlaying, phones.length]);

  useEffect(() => {
    // Clean up function
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  const currentPhone = phones[activePhone];

  return (
    <div 
      ref={sectionRef}
      className="relative min-h-screen bg-black overflow-x-hidden"
    >
      {/* Apple-like ultra-thin borders */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent z-50" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent z-50" />
      
      {/* Main container */}
      <div className="container mx-auto px-4 pt-20 pb-32">
        {/* Premium header */}
        <div className="text-center mb-20 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-3 mb-8"
          >
            <Sparkles className="w-5 h-5 text-white/60" />
            <span className="text-white/60 text-sm tracking-[0.3em] uppercase">Flagship Collection</span>
            <Sparkles className="w-5 h-5 text-white/60" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-6xl md:text-8xl font-light tracking-tight mb-6"
          >
            <span className="text-white">Premium</span>
            <span className="text-white/40">&nbsp;Mobile</span>
            <br />
            <span className="text-white/60">Experience</span>
          </motion.h1>
          
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "120px" }}
            transition={{ delay: 0.3, duration: 1 }}
            className="h-px bg-gradient-to-r from-transparent via-white/40 to-transparent mx-auto mb-8"
          />
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-white/60 text-lg max-w-2xl mx-auto font-light tracking-wider leading-relaxed"
          >
            Discover the pinnacle of mobile technology. Each device crafted with precision, engineered for excellence.
          </motion.p>
        </div>

        {/* Phone showcase grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-32">
          {/* Left side - Phone showcase */}
          <div className="relative">
            {/* Dynamic gradient background */}
            <div className={`absolute -inset-8 rounded-3xl bg-gradient-to-br ${currentPhone.gradient} opacity-30 blur-3xl`} />
            
            {/* Phone container */}
            <div className="relative bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl p-8">
              {/* Phone mockup */}
              <div className="relative w-full max-w-md mx-auto">
                {/* Phone frame */}
                <div className="relative w-[280px] h-[580px] mx-auto rounded-[2.5rem] overflow-hidden border-[14px] border-gray-900 bg-black shadow-2xl">
                  {/* Dynamic screen */}
                  <div className="absolute inset-0 overflow-hidden">
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={currentPhone.id}
                        src={currentPhone.images[0]}
                        alt={currentPhone.name}
                        className="absolute inset-0 w-full h-full object-cover"
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.5 }}
                      />
                    </AnimatePresence>
                    
                    {/* Screen overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40" />
                    
                    {/* Screen content */}
                    <div className="absolute inset-0 p-8">
                      <div className="h-full flex flex-col">
                        {/* Status bar */}
                        <div className="flex justify-between items-center px-2 py-1">
                          <div className="text-white text-sm font-medium">9:41</div>
                          <div className="flex items-center gap-1">
                            <Wifi className="w-4 h-4 text-white/80" />
                            <Battery className="w-6 h-4 text-white/80" />
                          </div>
                        </div>
                        
                        {/* Home screen */}
                        <div className="flex-1 flex flex-col items-center justify-center">
                          <div className="text-center mb-8">
                            <div className="text-white text-2xl font-light mb-2">
                              {currentPhone.name}
                            </div>
                            <div className="text-white/60 text-sm">
                              {currentPhone.tagline}
                            </div>
                          </div>
                          
                          {/* App grid */}
                          <div className="grid grid-cols-4 gap-4">
                            {[...Array(8)].map((_, i) => (
                              <div
                                key={i}
                                className="w-12 h-12 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm"
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Dynamic Island */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-10" />
                </div>
                
                {/* Floating price tag */}
                <motion.div
                  className="absolute -top-6 -right-6 bg-white/10 backdrop-blur-xl rounded-full px-6 py-3 border border-white/20"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <span className="text-white font-medium text-lg">
                    {currentPhone.price}
                  </span>
                </motion.div>
              </div>
              
              {/* Color indicator */}
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-xl rounded-full px-6 py-2 border border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-white/60" />
                  <span className="text-white/80 text-sm">
                    {currentPhone.color}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Phone details */}
          <div className="space-y-8">
            {/* Phone selector */}
            <div>
              <div className="flex flex-wrap gap-3 mb-8">
                {phones.map((phone, index) => (
                  <motion.button
                    key={phone.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setActivePhone(index);
                      if (autoPlayRef.current) {
                        clearInterval(autoPlayRef.current);
                        setIsAutoPlaying(false);
                      }
                    }}
                    className={`px-5 py-2.5 rounded-full border transition-all duration-300 text-sm font-medium tracking-wide ${
                      activePhone === index
                        ? "bg-white text-black border-white"
                        : "bg-white/5 text-white/60 border-white/10 hover:border-white/30"
                    }`}
                  >
                    {phone.name.split(' ')[0]}
                  </motion.button>
                ))}
              </div>
              
              {/* Auto-play toggle */}
              <div className="flex items-center gap-3 mb-8">
                <button
                  onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                  className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
                >
                  <div className={`w-8 h-5 rounded-full flex items-center p-0.5 ${
                    isAutoPlaying ? 'bg-blue-500 justify-end' : 'bg-white/10 justify-start'
                  }`}>
                    <div className="w-4 h-4 rounded-full bg-white" />
                  </div>
                  <span className="text-sm">Auto-play showcase</span>
                </button>
              </div>
            </div>

            {/* Phone details */}
            <div className="space-y-6">
              <div>
                <h2 className="text-5xl font-light text-white mb-4">
                  {currentPhone.name}
                </h2>
                <p className="text-xl text-white/60 mb-6">
                  {currentPhone.tagline}
                </p>
              </div>

              {/* Quick specs */}
              <div className="grid grid-cols-2 gap-4">
                {currentPhone.features.slice(0, 4).map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
                    onClick={() => setActiveFeature(index)}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="text-white/80">
                        {feature.icon}
                      </div>
                      <span className="text-white text-sm font-medium">
                        {feature.title}
                      </span>
                    </div>
                    <p className="text-white/60 text-xs">
                      {feature.description}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* Feature details */}
              <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-white">
                    {currentPhone.features[activeFeature].icon}
                  </div>
                  <div>
                    <h4 className="text-white text-lg font-medium">
                      {currentPhone.features[activeFeature].title}
                    </h4>
                    <p className="text-white/60 text-sm">
                      {currentPhone.features[activeFeature].description}
                    </p>
                  </div>
                </div>
                <div className="text-white/40 text-sm">
                  {currentPhone.features[activeFeature].stats}
                </div>
                
                {/* Feature indicator */}
                <div className="flex gap-2 mt-6">
                  {currentPhone.features.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveFeature(index)}
                      className={`h-1 rounded-full transition-all duration-300 ${
                        activeFeature === index
                          ? "w-8 bg-white"
                          : "w-4 bg-white/30 hover:bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-8">
                <Link to={`/products/${currentPhone.id}`} className="flex-1">
                  <motion.button
                    className="w-full group relative overflow-hidden rounded-xl bg-gradient-to-r from-white to-white/90 p-px"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    <div className="relative rounded-xl bg-black p-4">
                      <div className="flex items-center justify-between">
                        <div className="text-left">
                          <div className="text-white text-lg font-medium">
                            Buy Now
                          </div>
                          <div className="text-white/60 text-sm">
                            Available in all colors
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-white transform group-hover:translate-x-2 transition-transform" />
                      </div>
                    </div>
                  </motion.button>
                </Link>
                
                <Link to="/compare" className="flex-1">
                  <motion.button
                    className="w-full rounded-xl border border-white/20 text-white hover:bg-white/10 transition-all duration-300 p-4"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Compare Models
                  </motion.button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Featured specifications section */}
        <div className="mt-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light text-white mb-4">
              Premium Specifications
            </h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              Engineered for excellence, designed for perfection
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Display Technology",
                icon: <Sparkles className="w-6 h-6" />,
                features: [
                  "Dynamic Island/ Punch-hole",
                  "120Hz ProMotion/ LTPO",
                  "Always-On Display",
                  "HDR10+ Support"
                ]
              },
              {
                title: "Performance",
                icon: <Zap className="w-6 h-6" />,
                features: [
                  "Flagship Processors",
                  "5G Connectivity",
                  "Wi-Fi 6E/ 7",
                  "Advanced Cooling"
                ]
              },
              {
                title: "Camera System",
                icon: <Camera className="w-6 h-6" />,
                features: [
                  "Pro-Grade Lenses",
                  "Night Mode",
                  "Portrait Video",
                  "AI Enhancement"
                ]
              }
            ].map((spec, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-8 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 hover:border-white/20 transition-all duration-300"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="text-white">
                    {spec.icon}
                  </div>
                  <h3 className="text-xl font-medium text-white">
                    {spec.title}
                  </h3>
                </div>
                
                <ul className="space-y-3">
                  {spec.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-white/70">
                      <Check className="w-4 h-4 text-white/40" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="mt-32 text-center">
          <div className="inline-flex items-center gap-3 mb-8">
            <Sparkles className="w-5 h-5 text-white/60" />
            <span className="text-white/60 text-sm tracking-[0.3em] uppercase">Ready to Upgrade</span>
            <Sparkles className="w-5 h-5 text-white/60" />
          </div>
          
          <h2 className="text-5xl font-light text-white mb-8">
            Find Your Perfect <span className="text-white/60">Match</span>
          </h2>
          
          <p className="text-xl text-white/60 mb-12 max-w-2xl mx-auto">
            Experience the future of mobile technology. Each device crafted to deliver unparalleled performance and style.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/store">
              <motion.button
                className="px-12 py-4 rounded-full bg-white text-black hover:bg-white/90 transition-all duration-300 flex items-center gap-3 text-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Visit Store
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </Link>
            
            <Link to="/compare">
              <motion.button
                className="px-12 py-4 rounded-full border border-white/20 text-white hover:bg-white/10 transition-all duration-300 flex items-center gap-3"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Compare All
                <Heart className="w-5 h-5" />
              </motion.button>
            </Link>
          </div>
        </div>
      </div>

      {/* Floating indicators */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-4">
        <motion.div
          className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center"
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        >
          <div className="w-2 h-2 rounded-full bg-white/60" />
        </motion.div>
        
        <div className="flex flex-col items-center gap-2">
          {phones.map((_, index) => (
            <button
              key={index}
              onClick={() => setActivePhone(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                activePhone === index ? "bg-white scale-125" : "bg-white/30"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturedProduct;