import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { 
  MapPin,
  Phone,
  Mail,
  ChevronRight,
  ArrowUpRight,
  Shield,
  Lock,
  Sparkles
} from "lucide-react";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

const Footer = () => {
  const footerRef = useRef(null);
  const columnsRef = useRef([]);
  const mapRef = useRef(null);
  const paymentRef = useRef(null);
  const logoRef = useRef(null);

  useEffect(() => {
    // Clean up function
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <footer 
      ref={footerRef}
      className="relative bg-black"
    >
      {/* Ultra-thin top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      
      <div className="container mx-auto px-4">
        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 py-32">
          {/* Brand Section */}
          <div 
            className="relative" 
            ref={el => columnsRef.current[0] = el}
          >
            <div className="mb-10" ref={logoRef}>
              <img 
                src="/Images/logo.png" 
                alt="Jonab's Fashion" 
                className="w-40 h-40 object-contain"
              />
            </div>
            
            <div className="w-20 h-px bg-white/20 mb-10" />
            
            <p className="text-lg text-white/60 leading-relaxed mb-10 tracking-wide">
              Premium fashion with timeless elegance and uncompromised quality.
            </p>
            
            <div className="flex gap-4">
              <a
                href="https://www.facebook.com/thejonabbd/"
                className="p-3 border border-white/20 hover:border-white/40 transition-colors duration-300"
                aria-label="Facebook"
              >
                <span className="text-white text-sm">FB</span>
              </a>
              <a
                href="https://wa.me/8801994830798"
                className="p-3 border border-white/20 hover:border-white/40 transition-colors duration-300"
                aria-label="WhatsApp"
              >
                <span className="text-white text-sm">WA</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div 
            ref={el => columnsRef.current[1] = el}
          >
            <h3 className="text-xl font-light tracking-wider text-white mb-8">
              NAVIGATION
            </h3>
            
            <div className="w-16 h-px bg-white/20 mb-10" />
            
            <ul className="space-y-4">
              {[
                { name: "Home", href: "/" },
                { name: "Terms & Conditions", href: "/Policy/TC.pdf" },
                { name: "Privacy Policy", href: "/Policy/TC.pdf" },
                { name: "All Products", href: "/products" },
                { name: "Custom Orders", href: "/custom" },
                { name: "Exclusive Collection", href: "/exclusive" }
              ].map((item, index) => (
                <li key={index}>
                  <a 
                    href={item.href} 
                    target={item.name.includes("Terms") || item.name.includes("Privacy") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className="flex items-center text-white/70 hover:text-white transition-colors duration-300 text-lg"
                  >
                    <ChevronRight className="w-4 h-4 mr-3 opacity-0 group-hover:opacity-100" />
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Location & Contact */}
          <div 
            ref={el => columnsRef.current[2] = el}
          >
            <h3 className="text-xl font-light tracking-wider text-white mb-8">
              CONTACT
            </h3>
            
            <div className="w-16 h-px bg-white/20 mb-10" />
            
            <div className="space-y-8">
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-white/60 mr-4 mt-1" />
                <p className="text-white/80 leading-relaxed tracking-wide">
                  Aziz Supermarket, Shop 78, Ground Floor, Shahabag Dhaka.
                </p>
              </div>
              
              <div className="space-y-4">
                <a 
                  href="https://wa.me/8801994830798" 
                  className="flex items-center text-white/70 hover:text-white transition-colors duration-300"
                >
                  <Phone className="w-5 h-5 mr-4 text-white/60" />
                  <span className="tracking-wide">+880 1994-830798</span>
                </a>
                
                <a 
                  href="mailto:jonabbd04@gmail.com" 
                  className="flex items-center text-white/70 hover:text-white transition-colors duration-300"
                >
                  <Mail className="w-5 h-5 mr-4 text-white/60" />
                  <span className="tracking-wide">jonabbd04@gmail.com</span>
                </a>
              </div>
            </div>
          </div>

          {/* Social & Legal */}
          <div 
            ref={el => columnsRef.current[3] = el}
          >
            <h3 className="text-xl font-light tracking-wider text-white mb-8">
              CONNECT
            </h3>
            
            <div className="w-16 h-px bg-white/20 mb-10" />
            
            <div className="grid grid-cols-2 gap-4 mb-12">
              {[
                { label: "YouTube", href: "https://www.youtube.com/@JonabBd-v5q" },
                { label: "Instagram", href: "https://www.instagram.com/jonab._.bd/" },
                { label: "TikTok", href: "https://www.tiktok.com/@jonabbd" },
                { label: "Twitter", href: "https://x.com/JonabBd" }
              ].map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="p-3 border border-white/20 hover:border-white/40 transition-colors duration-300 text-center"
                >
                  <span className="text-white text-sm">{social.label}</span>
                </a>
              ))}
            </div>
            
            <div className="p-4 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-white/60" />
                <span className="text-white/80 text-sm">Secure Payments</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-white/60" />
                <span className="text-white/60 text-sm">SSL Encrypted</span>
              </div>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div 
          className="relative w-full h-[400px] mb-24 overflow-hidden"
          ref={mapRef}
        >
          <iframe
            className="w-full h-full"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1263.0195838516104!2d90.39240927183072!3d23.738685696661257!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755b9a704d3d7e5%3A0x781623f8127962bf!2sAziz%20Super%20Market!5e1!3m2!1sen!2sbd!4v1753612543895!5m2!1sen!2sbd"
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        {/* Payment Methods */}
        <div 
          className="py-12 border-t border-white/10"
          ref={paymentRef}
        >
          <div className="flex flex-col items-center mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="w-5 h-5 text-white/60" />
              <h4 className="text-lg font-light tracking-wider text-white">
                ACCEPTED PAYMENT METHODS
              </h4>
            </div>
            
            <div className="flex flex-wrap justify-center gap-8">
              <img src="/Images/payments/bkash.png" alt="bKash" className="h-10" />
              <img src="/Images/payments/nagad.png" alt="Nagad" className="h-10" />
              <img src="/Images/payments/rocket.png" alt="Rocket" className="h-10" />
              <img src="/Images/payments/upay.png" alt="Upay" className="h-10" />
              <div className="flex items-center gap-4">
                <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-sm">VISA</span>
                </div>
                <div className="w-12 h-8 bg-red-600 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-sm">MC</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="py-12 border-t border-white/10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            {/* Copyright */}
            <div className="text-center lg:text-left">
              <div className="flex items-center gap-3 mb-4">
                <p className="text-xl font-light tracking-widest text-white">
                  <span className="text-white/60">&copy; {new Date().getFullYear()}</span> PREXO GADGETS
                </p>
              </div>
              <p className="text-white/40 text-lg tracking-wide">
                Premium Electronics
              </p>
            </div>
            
            {/* Developer Credit */}
            <div className="flex flex-col items-center lg:items-end">
              <div className="flex items-center gap-3 text-white/60 mb-2">
                <span className="tracking-widest text-sm">Crafted by</span>
              </div>
              <a
                href="https://www.instagram.com/saastudio.dev/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-white/70 hover:text-white transition-colors duration-300"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="text-center">
                  <div className="text-white text-sm font-medium tracking-wider">@SaaStudio</div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom border */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </footer>
  );
};

export default Footer;