import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { 
  ChevronRight, 
  Zap, 
  Battery, 
  Camera, 
  Cpu, 
  Sparkles, 
  Shield, 
  Check, 
  Award,
  Radio,
  Eye,
  ShoppingBag,
  Layers,
  Globe,
  Settings,
  Clock,
  Scissors,
  Droplets,
  Thermometer,
  ShieldCheck
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const FeaturedProduct = () => {
  const [activeView, setActiveView] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const sectionRef = useRef(null);
  const displayRef = useRef(null);
  const titleRef = useRef(null);
  
  // High-quality premium blazer images
  const productImages = [
    "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=2036&auto=format&fit=crop", // Main shot
    "https://images.unsplash.com/photo-1593032465171-6a7025c5f120?q=80&w=2070&auto=format&fit=crop", // Detail
    "https://images.unsplash.com/photo-1621072156002-e2fccdc0b176?q=80&w=2087&auto=format&fit=crop", // Wearing
    "https://images.unsplash.com/photo-1505022610485-0249ba5b3675?q=80&w=2070&auto=format&fit=crop", // Back
    "https://images.unsplash.com/photo-1520006403909-838d6b92c22e?q=80&w=2070&auto=format&fit=crop"  // Studio
  ];
  
  const product = {
    name: "NEXUS PRIME BLAZER",
    tagline: "The Pinnacle of Menswear Excellence",
    subtitle: "Redefining luxury tailoring.",
    price: "From ৳1,49,999",
    color: "Midnight Obsidian",
    status: "Limited Edition",
    
    highlightFeatures: [
      {
        icon: <Scissors className="w-6 h-6" />,
        title: "Bespoke Tailoring",
        subtitle: "Handcrafted Perfection",
        description: "Every stitch meticulously placed by master artisans",
        color: "from-blue-500/20 to-blue-700/10"
      },
      {
        icon: <Droplets className="w-6 h-6" />,
        title: "Water-Resistant",
        subtitle: "Nano Technology",
        description: "Advanced fabric treatment repels water and stains",
        color: "from-purple-500/20 to-purple-700/10"
      },
      {
        icon: <Thermometer className="w-6 h-6" />,
        title: "Temperature Regulating",
        subtitle: "All-Season Comfort",
        description: "Breathable fabric adapts to your body temperature",
        color: "from-emerald-500/20 to-emerald-700/10"
      },
      {
        icon: <ShieldCheck className="w-6 h-6" />,
        title: "Lifetime Guarantee",
        subtitle: "Unmatched Quality",
        description: "Crafted to last with premium materials and construction",
        color: "from-cyan-500/20 to-cyan-700/10"
      }
    ],
    
    specifications: [
      { label: "Fabric", value: "Super 180s Wool", detail: "Italian Merino" },
      { label: "Tailoring", value: "Full Canvas", detail: "Hand-Sewn" },
      { label: "Construction", value: "120+ Hours", detail: "Master Craftsmanship" },
      { label: "Buttons", value: "Mother of Pearl", detail: "Hand-Polished" },
      { label: "Lining", value: "Bemberg Silk", detail: "Breathable" },
      { label: "Stitches", value: "8,500+", detail: "Silk Thread" }
    ]
  };

  // Auto rotate images
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isHovering) {
        setActiveView((prev) => (prev + 1) % productImages.length);
      }
    }, 4000);
    
    return () => clearInterval(interval);
  }, [isHovering, productImages.length]);

  // Animations
  useEffect(() => {
    // Title animation
    gsap.from(titleRef.current, {
      y: 100,
      opacity: 0,
      duration: 1.5,
      ease: "power3.out",
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 80%",
        toggleActions: "play none none none"
      }
    });

    // Floating display animation
    if (displayRef.current) {
      gsap.to(displayRef.current, {
        y: -10,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
    }

    // Feature cards animation
    gsap.from(".feature-card", {
      y: 40,
      opacity: 0,
      stagger: 0.1,
      duration: 0.8,
      scrollTrigger: {
        trigger: ".features-section",
        start: "top 80%",
        toggleActions: "play none none none"
      }
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <div 
      ref={sectionRef}
      className="relative min-h-screen bg-gradient-to-b from-black via-gray-900 to-black overflow-hidden"
    >
      {/* Premium background effects */}
      <div className="absolute inset-0">
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_49.9%,white_50%,transparent_50.1%)] bg-[size:100px_100px]" />
          <div className="absolute inset-0 bg-[linear-gradient(0deg,transparent_49.9%,white_50%,transparent_50.1%)] bg-[size:100px_100px]" />
        </div>
        
        {/* Animated glows */}
        <div className="absolute top-20 left-10 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-blue-900/20 via-transparent to-transparent blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-[500px] h-[500px] rounded-full bg-gradient-to-tl from-purple-900/20 via-transparent to-transparent blur-3xl animate-pulse" />
        
        {/* Thin accent lines */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>

      <div className="container mx-auto px-4 pt-20 pb-32 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-3 mb-8 px-6 py-2.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/20"
          >
            <Sparkles className="w-4 h-4 text-white" />
            <span className="text-white text-sm tracking-[0.3em] font-medium">LIMITED EDITION</span>
            <Sparkles className="w-4 h-4 text-white" />
          </motion.div>

          <div className="overflow-hidden mb-6">
            <h1 
              ref={titleRef}
              className="text-7xl md:text-8xl font-thin tracking-[-0.05em] mb-4 bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent"
            >
              NEXUS PRIME BLAZER
            </h1>
          </div>
          
          <p className="text-2xl text-white/70 max-w-2xl mx-auto font-light tracking-wide leading-relaxed mb-8">
            The future of luxury menswear, reimagined.
          </p>
          
          {/* Price and color badges */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <div className="px-5 py-2 rounded-full bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl border border-white/20">
              <span className="text-white text-sm font-light">{product.price}</span>
            </div>
            <div className="px-5 py-2 rounded-full bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl border border-white/20">
              <span className="text-white text-sm font-light">{product.color}</span>
            </div>
          </div>
        </div>

        {/* Main Product Display */}
        <div className="relative mb-32">
          {/* Abstract display container */}
          <div 
            ref={displayRef}
            className="relative w-full max-w-5xl mx-auto"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            {/* Floating display with glass effect */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 p-1">
              {/* Main image display */}
              <div className="relative h-[500px] md:h-[600px] overflow-hidden rounded-2xl">
                <motion.img
                  key={activeView}
                  src={productImages[activeView]}
                  alt={`${product.name} - View ${activeView + 1}`}
                  className="absolute inset-0 w-full h-full object-cover"
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                />
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20" />
                
                {/* Floating product info */}
                <div className="absolute bottom-8 left-8 right-8">
                  <motion.div
                    animate={{ y: isHovering ? -10 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-black/60 backdrop-blur-xl rounded-2xl p-6 border border-white/20 max-w-md"
                  >
                    <h2 className="text-3xl font-light text-white mb-2">{product.name}</h2>
                    <p className="text-white/70 text-lg mb-4">{product.tagline}</p>
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-light text-white">{product.price.split('From ')[1]}</div>
                      <div className="h-4 w-px bg-white/30" />
                      <div className="text-white/60 text-sm">{product.color}</div>
                    </div>
                  </motion.div>
                </div>
              </div>
              
              {/* Image navigation dots */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {productImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveView(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      activeView === index 
                        ? "w-8 bg-white" 
                        : "bg-white/40 hover:bg-white/60"
                    }`}
                  />
                ))}
              </div>
            </div>
            
            {/* Floating feature indicators */}
            <div className="absolute -top-6 -right-6">
              <motion.div
                className="bg-gradient-to-r from-black to-black/90 backdrop-blur-xl rounded-2xl p-5 border border-white/20 shadow-2xl"
                animate={{ rotate: [0, 5, 0, -5, 0] }}
                transition={{ duration: 8, repeat: Infinity }}
              >
                <div className="text-white text-xl font-light">Premium</div>
                <div className="text-white/40 text-xs">Bespoke Edition</div>
              </motion.div>
            </div>
            
            <div className="absolute -bottom-6 -left-6">
              <motion.div
                className="bg-gradient-to-r from-black to-black/90 backdrop-blur-xl rounded-2xl p-5 border border-white/20 shadow-2xl"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-400" />
                  <div className="text-white text-sm font-light">Master Crafted</div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="features-section mb-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light text-white mb-4 tracking-tight">
              Exceptional <span className="text-white/60">Features</span>
            </h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto font-light">
              Experience groundbreaking craftsmanship designed for ultimate comfort and style.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {product.highlightFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="feature-card group relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 p-8 hover:border-white/30 transition-all duration-300 cursor-pointer"
                whileHover={{ y: -5 }}
              >
                {/* Background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                
                <div className="relative z-10">
                  <div className="flex items-start gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-white/20 to-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <div className="text-white">
                        {feature.icon}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-2xl font-light text-white mb-2">{feature.title}</h3>
                      <div className="text-white/70 text-sm mb-3">{feature.subtitle}</div>
                      <p className="text-white/50 text-sm font-light">{feature.description}</p>
                      
                      <div className="flex items-center gap-2 mt-4">
                        <div className="flex-1 h-px bg-white/20" />
                        <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-white/60 transition-colors" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Specifications */}
        <div className="mb-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light text-white mb-4 tracking-tight">
              Technical <span className="text-white/60">Specifications</span>
            </h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto font-light">
              Engineered for excellence in every detail.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {product.specifications.map((spec, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="group p-6 rounded-2xl bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-xl border border-white/20 hover:border-white/30 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-xs text-white/40 uppercase tracking-wider mb-2">
                  {spec.label}
                </div>
                <div className="text-xl font-light text-white mb-1">
                  {spec.value}
                </div>
                <div className="text-xs text-white/30">
                  {spec.detail}
                </div>
                
                {/* Hover line */}
                <div className="w-0 group-hover:w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent transition-all duration-300 mt-4" />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light text-white mb-4 tracking-tight">
              Be the First to <span className="text-white/60">Experience</span>
            </h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto font-light">
              Join the exclusive list for early access and special offers.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Notify CTA */}
            <Link to="/notify">
              <motion.button
                className="w-full group relative overflow-hidden rounded-2xl bg-gradient-to-r from-white to-white/90 p-px"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                <div className="relative rounded-2xl bg-black p-6">
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <div className="text-white text-xl font-light mb-1">
                        Book Appointment
                      </div>
                      <div className="text-white/60 text-sm">
                        Personal fitting with our master tailor
                      </div>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                      <ChevronRight className="w-6 h-6 text-white transform group-hover:translate-x-2 transition-transform" />
                    </div>
                  </div>
                </div>
              </motion.button>
            </Link>
            
            {/* Compare CTA */}
            <Link to="/compare">
              <motion.button
                className="w-full group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 p-6 hover:border-white/30 transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <div className="text-white text-xl font-light mb-1">
                      Fabric Selection
                    </div>
                    <div className="text-white/60 text-sm">
                      Choose from premium materials
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                    <Layers className="w-6 h-6 text-white/80 group-hover:text-white transition-colors" />
                  </div>
                </div>
              </motion.button>
            </Link>
          </div>
          
          {/* Secondary actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Link to="/store">
              <button className="w-full rounded-xl border border-white/20 text-white hover:bg-white/10 transition-all duration-300 p-4 flex items-center justify-center gap-3 group">
                <ShoppingBag className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" />
                <span className="font-light text-sm">Visit Store</span>
              </button>
            </Link>
            
            <Link to="/learn">
              <button className="w-full rounded-xl border border-white/20 text-white hover:bg-white/10 transition-all duration-300 p-4 flex items-center justify-center gap-3 group">
                <Eye className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" />
                <span className="font-light text-sm">Learn More</span>
              </button>
            </Link>
            
            <Link to="/tailoring">
              <button className="w-full rounded-xl border border-white/20 text-white hover:bg-white/10 transition-all duration-300 p-4 flex items-center justify-center gap-3 group">
                <Settings className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" />
                <span className="font-light text-sm">Tailoring Process</span>
              </button>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-32 pt-20 border-t border-white/10"
        >
          <div className="inline-flex items-center gap-3 text-white/30 text-xs tracking-[0.3em] uppercase mb-6">
            <div className="w-20 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            THE PINNACLE OF CRAFTSMANSHIP
            <div className="w-20 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>
          
          <h3 className="text-3xl font-light text-white mb-4 tracking-tight">
            Experience Bespoke Excellence
          </h3>
          
          <p className="text-white/40 text-sm max-w-md mx-auto mb-8 font-light tracking-wide">
            The next generation of luxury tailoring is here. Reserve your masterpiece.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/pre-order">
              <button className="px-12 py-4 bg-gradient-to-r from-white to-white/90 text-black text-sm font-light rounded-xl hover:opacity-90 transition-all duration-300 flex items-center gap-2">
                <Award className="w-5 h-5" />
                Reserve Now
              </button>
            </Link>
            
            <Link to="/contact">
              <button className="px-12 py-4 border border-white/20 text-white text-sm font-light rounded-xl hover:bg-white/10 transition-all duration-300">
                Contact Tailor
              </button>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Floating indicator */}
      <div className="fixed bottom-8 right-8 z-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center"
        >
          <Scissors className="w-6 h-6 text-white/60" />
        </motion.div>
      </div>
    </div>
  );
};

export default FeaturedProduct;