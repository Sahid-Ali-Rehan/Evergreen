import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Sparkle } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const AllCategories = () => {
  const navigate = useNavigate();
  const sectionRef = useRef(null);
  const containerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  const categories = [
    { 
      name: "Panjabi", 
      items: 42, 
      image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=2088&auto=format&fit=crop",
      gradient: "from-blue-500/20 via-purple-500/10 to-transparent",
      description: "Elegant traditional wear for men with intricate embroidery and premium fabrics"
    },
    { 
      name: "Kurti", 
      items: 56, 
      image: "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?q=80&w=2087&auto=format&fit=crop",
      gradient: "from-emerald-500/20 via-blue-500/10 to-transparent",
      description: "Stylish and comfortable women's kurtis with modern designs and patterns"
    },
    { 
      name: "Men's Fashion", 
      items: 85, 
      image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=2070&auto=format&fit=crop",
      gradient: "from-rose-500/20 via-pink-500/10 to-transparent",
      description: "Contemporary men's clothing including shirts, trousers, and formal wear"
    },
    { 
      name: "Ladies' Collection", 
      items: 72, 
      image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop",
      gradient: "from-green-500/20 via-emerald-500/10 to-transparent",
      description: "Exclusive women's ethnic and western wear for every occasion"
    },
    { 
      name: "Traditional Wear", 
      items: 64, 
      image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=2069&auto=format&fit=crop",
      gradient: "from-red-500/20 via-rose-500/10 to-transparent",
      description: "Rich heritage clothing including sarees, lehengas, and sherwanis"
    },
    { 
      name: "Casual Wear", 
      items: 48, 
      image: "https://cdn.shopify.com/s/files/1/0601/1476/4025/files/linen-shirt_2bad4843-8ebf-48bd-8440-353660501674.jpg?v=1720585304",
      gradient: "from-gray-400/20 via-white/10 to-transparent",
      description: "Everyday comfortable clothing for men and women with modern styles"
    },
  ];

  const handleCategoryClick = (categoryName) => {
    // Navigate to products page with category filter
    navigate(`/products?category=${categoryName.toLowerCase()}`);
  };

  useEffect(() => {
    setIsVisible(true);
    
    // Apple-like reveal animation
    gsap.from(".section-title", {
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 80%",
      },
      y: 80,
      opacity: 0,
      duration: 1.4,
      ease: "power3.out",
    });

    // Staggered item animation
    gsap.from(".category-card", {
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 85%",
      },
      y: 100,
      opacity: 0,
      stagger: 0.12,
      duration: 1.2,
      ease: "power3.out",
    });

    // Floating particles animation
    gsap.to(".floating-particle", {
      y: -20,
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      stagger: 0.2,
    });
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <section 
      ref={sectionRef}
      className="min-h-screen relative overflow-hidden bg-black"
      style={{
        background: `
          radial-gradient(ellipse at 20% 20%, rgba(120, 119, 198, 0.1) 0%, transparent 60%),
          radial-gradient(ellipse at 80% 80%, rgba(255, 119, 198, 0.1) 0%, transparent 60%),
          radial-gradient(ellipse at 40% 50%, rgba(120, 119, 255, 0.05) 0%, transparent 60%),
          #000
        `
      }}
    >
      {/* Premium glass effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black/80 z-0" />
      
      {/* Floating particles for luxury feel */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="floating-particle absolute w-[1px] h-[1px] bg-white/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}
      </div>

      {/* Ultra-thin border effect */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="container mx-auto px-4 pt-24 pb-32 relative z-10">
        {/* Premium header with Apple-like typography */}
        <div className="text-center mb-20 px-4">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="inline-flex items-center gap-3 mb-8"
          >
            <Sparkle className="w-5 h-5 text-white/60" />
            <span className="text-white/60 text-sm tracking-[0.3em] uppercase">CURATED COLLECTION</span>
            <Sparkle className="w-5 h-5 text-white/60" />
          </motion.div>

          <h1 className="section-title text-7xl md:text-8xl font-light tracking-tight mb-6">
            <span className="text-white">Premium</span>
            <span className="text-white/40">&nbsp;Fashion</span>
          </h1>
          
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "120px" }}
            transition={{ delay: 0.5, duration: 1 }}
            className="h-px bg-gradient-to-r from-transparent via-white/40 to-transparent mx-auto mb-8"
          />
          
          <p className="text-white/60 text-lg max-w-md mx-auto font-light tracking-wider leading-relaxed">
            Experience elegance redefined. Each garment is a masterpiece of traditional craftsmanship and modern design.
          </p>
        </div>

        {/* Main grid with premium layout */}
        <div 
          ref={containerRef}
          className="grid grid-cols-1 gap-8 max-w-5xl mx-auto"
        >
          <AnimatePresence>
            {categories.map((category, index) => (
              <motion.div
                key={index}
                className="category-card group relative"
                variants={itemVariants}
                initial="hidden"
                animate={isVisible ? "visible" : "hidden"}
                custom={index}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                onClick={() => handleCategoryClick(category.name)}
              >
                {/* Card with glass effect */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 transition-all duration-500 group-hover:border-white/20 cursor-pointer">
                  {/* Dynamic gradient overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
                  
                  {/* Content container */}
                  <div className="relative z-20 flex flex-col lg:flex-row items-center justify-between p-8">
                    {/* Text content */}
                    <div className="lg:w-2/5 mb-8 lg:mb-0">
                      <div className="flex items-center gap-4 mb-6">
                        <motion.div
                          className="w-2 h-12 bg-gradient-to-b from-white to-white/40 rounded-full"
                          animate={{
                            scale: activeIndex === index ? [1, 1.2, 1] : 1,
                          }}
                          transition={{ duration: 0.3 }}
                        />
                        <div>
                          <h3 className="text-4xl font-light tracking-tight text-white mb-2">
                            {category.name}
                          </h3>
                          <p className="text-white/40 text-sm tracking-wider">
                            {category.items} exclusive items
                          </p>
                        </div>
                      </div>
                      
                      <motion.p
                        className="text-white/60 text-base font-light leading-relaxed"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{
                          opacity: activeIndex === index ? 1 : 0,
                          y: activeIndex === index ? 0 : 10,
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        {category.description}
                      </motion.p>
                      
                      {/* Category Filter Info */}
                      <motion.div
                        className="mt-4"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{
                          opacity: activeIndex === index ? 1 : 0,
                          y: activeIndex === index ? 0 : 5,
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
                          <span className="text-xs text-white/60">Click to view all</span>
                          <span className="text-xs font-medium text-white/80">{category.name} collection</span>
                        </div>
                      </motion.div>
                    </div>

                    {/* Image container */}
                    <div className="lg:w-3/5 relative">
                      <div className="relative h-64 lg:h-80 overflow-hidden rounded-xl">
                        {/* Background shine effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                        
                        <motion.img
                          src={category.image}
                          alt={category.name}
                          className="w-full h-full object-cover scale-95 group-hover:scale-100 transition-transform duration-700"
                          animate={{
                            y: activeIndex === index ? [-5, 5, -5] : 0,
                          }}
                          transition={{
                            repeat: activeIndex === index ? Infinity : 0,
                            duration: 4,
                            ease: "easeInOut",
                          }}
                        />
                      </div>

                      {/* Floating action button */}
                      <motion.button
                        className="absolute -bottom-4 -right-4 w-14 h-14 rounded-full bg-gradient-to-br from-white to-white/90 flex items-center justify-center shadow-2xl group/btn"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCategoryClick(category.name);
                        }}
                      >
                        <ChevronRight className="w-6 h-6 text-black transform group-hover/btn:translate-x-1 transition-transform" />
                      </motion.button>
                    </div>
                  </div>

                  {/* Subtle hover glow */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/10 to-purple-500/10 blur-xl" />
                  </div>

                  {/* Click hint animation */}
                  <motion.div
                    className="absolute bottom-4 left-8"
                    animate={{
                      opacity: activeIndex === index ? [0.3, 0.7, 0.3] : 0,
                    }}
                    transition={{
                      repeat: activeIndex === index ? Infinity : 0,
                      duration: 1.5,
                    }}
                  >
                    <span className="text-xs text-white/60 tracking-wider uppercase">
                      Click to explore →
                    </span>
                  </motion.div>
                </div>

                {/* Connection line (Apple-like detail) */}
                <div className="absolute top-1/2 left-8 right-8 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Browse All Products Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="text-center mt-16"
        >
          <button
            onClick={() => navigate('/products')}
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-xl border border-white/10 rounded-2xl text-white/80 hover:text-white hover:border-white/30 transition-all duration-300 group"
          >
            <span className="text-lg font-light tracking-widest uppercase">Browse All Collections</span>
            <ChevronRight className="w-5 h-5 transform group-hover:translate-x-2 transition-transform" />
          </button>
        </motion.div>

        {/* Premium footer text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="text-center mt-20"
        >
          <p className="text-white/30 text-sm tracking-[0.3em] uppercase">
            Elevate Your Style
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="w-8 h-px bg-gradient-to-r from-transparent to-white/20" />
            <span className="text-white/20 text-xs">●</span>
            <div className="w-8 h-px bg-gradient-to-r from-white/20 to-transparent" />
          </div>
        </motion.div>
      </div>

      {/* Ultra-smooth scroll indicator */}
      <motion.div
        className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-20"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <div className="w-6 h-10 rounded-full border border-white/20 flex items-start justify-center p-1">
          <div className="w-1 h-3 bg-white/40 rounded-full" />
        </div>
      </motion.div>
    </section>
  );
};

export default AllCategories;