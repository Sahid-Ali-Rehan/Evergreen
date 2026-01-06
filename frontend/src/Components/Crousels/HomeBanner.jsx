import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const HomeBanner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const containerRef = useRef(null);
  const sliderRef = useRef(null);

  // Minimum swipe distance
  const minSwipeDistance = 50;

  // Premium high-quality slides
  const slides = [
    {
      image: "/Banner/1.jpg",
      // title: "Jonab's",
      // subtitle: "ELEGANCE"
    },
    {
      image: "/Banner/2.jpg", 
      // title: "Premium",
      // subtitle: "QUALITY"
    },
    {
      image: "/Banner/3.jpg",
      // title: "Luxury",
      // subtitle: "DESIGN"
    },
    {
      image: "/Banner/4.jpg",
      // title: "Exclusive",
      // subtitle: "STYLE"
    },
    {
      image: "/Banner/5.jpg",
      // title: "Premium",
      // subtitle: "FASHION"
    }
  ];

  // Touch handlers for mobile swipe
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextSlide();
    }
    if (isRightSwipe) {
      prevSlide();
    }
  };

  // Mouse drag handlers
  const onMouseDown = (e) => {
    setTouchEnd(null);
    setTouchStart(e.clientX);
  };

  const onMouseMove = (e) => {
    if (touchStart !== null) {
      setTouchEnd(e.clientX);
    }
  };

  const onMouseUp = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextSlide();
    }
    if (isRightSwipe) {
      prevSlide();
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  // Auto-advance slides
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isAnimating) {
        nextSlide();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isAnimating, currentSlide]);

  // GSAP Animations
  useEffect(() => {
    // Main banner entrance animation
    const tl = gsap.timeline({
      defaults: { duration: 1.8, ease: "power3.out" }
    });

    tl.fromTo(
      containerRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 1.2 }
    )
    .fromTo(
      ".slide-image",
      { 
        scale: 1.3, 
        opacity: 0,
        filter: "blur(20px)"
      },
      { 
        scale: 1, 
        opacity: 1, 
        filter: "blur(0px)",
        stagger: 0.2, 
        duration: 2.5 
      },
      "-=1"
    );

    // Premium scroll effect
    gsap.to(containerRef.current, {
      scale: 0.92,
      borderRadius: "40px",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "bottom 30%",
        scrub: 1.8,
        pin: true,
        anticipatePin: 1,
        markers: false
      }
    });

    // Floating elements animation
    gsap.to(".floating-element", {
      y: -15,
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      stagger: 0.5
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  const nextSlide = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    const next = (currentSlide + 1) % slides.length;
    
    // Premium slide transition
    gsap.to(`.slide-${currentSlide}`, {
      opacity: 0,
      scale: 1.1,
      duration: 1.2,
      ease: "power2.inOut",
      filter: "blur(8px)"
    });

    gsap.fromTo(`.slide-${next}`, 
      { 
        opacity: 0, 
        scale: 0.95,
        filter: "blur(15px)"
      },
      { 
        opacity: 1, 
        scale: 1, 
        filter: "blur(0px)",
        duration: 1.8, 
        ease: "power2.out",
        onComplete: () => setIsAnimating(false)
      }
    );

    setCurrentSlide(next);
  };

  const prevSlide = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    const prev = currentSlide === 0 ? slides.length - 1 : currentSlide - 1;
    
    gsap.to(`.slide-${currentSlide}`, {
      opacity: 0,
      scale: 1.1,
      duration: 1.2,
      ease: "power2.inOut",
      filter: "blur(8px)"
    });

    gsap.fromTo(`.slide-${prev}`, 
      { 
        opacity: 0, 
        scale: 0.95,
        filter: "blur(15px)"
      },
      { 
        opacity: 1, 
        scale: 1, 
        filter: "blur(0px)",
        duration: 1.8, 
        ease: "power2.out",
        onComplete: () => setIsAnimating(false)
      }
    );

    setCurrentSlide(prev);
  };

  const goToSlide = (index) => {
    if (isAnimating || index === currentSlide) return;
    
    setIsAnimating(true);
    
    gsap.to(`.slide-${currentSlide}`, {
      opacity: 0,
      scale: 1.1,
      duration: 1.2,
      ease: "power2.inOut"
    });

    gsap.fromTo(`.slide-${index}`, 
      { 
        opacity: 0, 
        scale: 0.95 
      },
      { 
        opacity: 1, 
        scale: 1, 
        duration: 1.8, 
        ease: "power2.out",
        onComplete: () => setIsAnimating(false)
      }
    );

    setCurrentSlide(index);
  };

  return (
    <div 
      ref={containerRef} 
      className="relative w-full min-h-screen overflow-hidden bg-black"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      {/* Main Slider Container */}
      <div 
        ref={sliderRef}
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
      >
        {/* Slides */}
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`slide-${index} absolute inset-0 w-full h-full transition-all duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* High-quality background image */}
            <div
              className="slide-image absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
              style={{ 
                backgroundImage: `url(${slide.image})`,
                imageRendering: 'crisp-edges'
              }}
            >
              {/* Premium gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-transparent to-black/40" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/20" />
              
              {/* Subtle vignette effect */}
              <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]" />
            </div>
          </div>
        ))}

        {/* Premium Navigation Arrows */}
        <div className="absolute inset-0 flex items-center justify-between px-4 md:px-8 lg:px-12 z-30 pointer-events-none">
          <button
            onClick={prevSlide}
            className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all duration-500 group transform hover:scale-110 pointer-events-auto"
            aria-label="Previous slide"
          >
            <svg className="w-5 h-5 md:w-6 md:h-6 text-white transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={nextSlide}
            className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all duration-500 group transform hover:scale-110 pointer-events-auto"
            aria-label="Next slide"
          >
            <svg className="w-5 h-5 md:w-6 md:h-6 text-white transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Premium Slide Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30">
          <div className="flex items-center space-x-6">
            {/* Slide numbers */}
            <div className="flex items-center space-x-2">
              <span className="text-white font-light text-sm tracking-widest opacity-80">
                <span className="text-white font-medium">{String(currentSlide + 1).padStart(2, '0')}</span>
                <span className="opacity-50"> / {String(slides.length).padStart(2, '0')}</span>
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-20 h-px bg-white/30 overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-500 ease-out"
                style={{ 
                  width: `${((currentSlide + 1) / slides.length) * 100}%` 
                }}
              />
            </div>

            {/* Slide dots */}
            <div className="flex space-x-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${
                    index === currentSlide 
                      ? 'bg-white scale-150' 
                      : 'bg-white/40 hover:bg-white/60'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>


      {/* Premium Scroll Indicator */}
      <div className="absolute bottom-8 right-8 z-30 hidden lg:flex flex-col items-center">
        <span className="text-white/60 text-xs mb-3 font-light tracking-widest uppercase">
          Scroll
        </span>
        <div className="w-px h-16 bg-gradient-to-b from-white/80 via-white/40 to-transparent" />
      </div>

      {/* Premium Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated gradient orbs */}
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-gradient-to-r from-emerald-400/5 to-teal-400/3 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-gradient-to-l from-green-400/4 to-cyan-400/2 rounded-full blur-3xl animate-pulse-slow" />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div 
            className="w-full h-full"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: '50px 50px'
            }}
          />
        </div>

        {/* Subtle noise texture */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
          }}
        />
      </div>

      {/* Loading optimization for images */}
      <div className="hidden">
        {slides.map((slide, index) => (
          <img 
            key={index}
            src={slide.image} 
            alt="" 
            loading="eager"
            onError={(e) => {
              console.warn(`Failed to load slide ${index} image: ${slide.image}`);
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default HomeBanner;