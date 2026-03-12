import React, { useState, useEffect, useContext } from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';
import { SmoothScrollContext } from '../SmoothScrollProvider';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { lenis } = useContext(SmoothScrollContext);

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      setIsScrolled(currentScroll > 50);
      
      // Target: Heritage section starts after storyboard. 
      // The storyboard pins for 2400% of viewport height.
      // We use a safe margin that accounts for potential scroll variances.
      if (currentScroll > window.innerHeight * 23.2) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!lenis) return;
    if (isMobileMenuOpen) {
      lenis.stop();
    } else {
      lenis.start();
    }
  }, [isMobileMenuOpen, lenis]);

  const navLinks = [
    { name: 'Heritage', href: '#heritage' },
    { name: 'Rituals', href: '#rituals' },
    { name: 'Gallery', href: '#gallery' },
    { name: 'Visit', href: '#visit' }
  ];

  const handleLinkClick = (e, href) => {
    e.preventDefault();
    
    // Close menu first to prevent z-index issues during scroll
    setIsMobileMenuOpen(false);
    
    if (lenis) {
      lenis.start();
      const target = document.querySelector(href);
      if (target) {
        // More generous timeout for mobile menu closure animation
        setTimeout(() => {
          lenis.scrollTo(target, {
            offset: -80,
            duration: 1.8,
            easing: (t) => 1 - Math.pow(1 - t, 4),
            immediate: false,
          });
        }, 300);
      }
    }
  };

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 w-full p-4 sm:p-6 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${
          (isVisible || isMobileMenuOpen) ? 'translate-y-0 opacity-100 pointer-events-auto' : '-translate-y-full opacity-0 pointer-events-none'
        }`}
        style={{ zIndex: isMobileMenuOpen ? 110 : 90 }}
      >
        <div className={`max-w-7xl mx-auto flex items-center justify-between px-6 sm:px-8 py-3 sm:py-4 rounded-full border border-white/10 transition-all duration-300 ${
          isScrolled || isMobileMenuOpen ? 'bg-black/60 backdrop-blur-2xl shadow-2xl scale-[0.98]' : 'bg-transparent'
        }`}>
          {/* Brand Logo: V/R */}
          <div className="flex items-center group cursor-pointer" onClick={() => {
            if (lenis) lenis.scrollTo(0, { duration: 2 });
            setIsMobileMenuOpen(false);
          }}>
            <div className="relative flex items-center justify-center p-2">
               <span className="text-xl sm:text-2xl font-serif tracking-tighter text-vienna-cream group-hover:text-vienna-green transition-colors duration-500">V/R</span>
               <div className="absolute inset-0 rounded-full border border-vienna-green/0 group-hover:border-vienna-green/20 group-hover:scale-125 transition-all duration-700" />
            </div>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((item) => (
              <a 
                key={item.name} 
                href={item.href}
                onClick={(e) => handleLinkClick(e, item.href)}
                className="text-[10px] uppercase tracking-[0.4em] text-vienna-beige/60 hover:text-vienna-cream transition-colors duration-500 relative group"
              >
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-vienna-green transition-all duration-500 group-hover:w-full" />
              </a>
            ))}
          </div>

          {/* Action Button */}
          <button className="hidden md:block px-8 py-2.5 rounded-full bg-vienna-cream text-vienna-brown text-[10px] uppercase tracking-[0.3em] hover:bg-vienna-green hover:text-white transition-all duration-500 transform hover:scale-105 active:scale-95">
            Reservations
          </button>

          {/* Mobile Menu Trigger */}
          <button 
            className="md:hidden text-vienna-cream p-2 hover:text-vienna-green transition-colors touch-manipulation"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </nav>

      {/* Mobile Fullscreen Menu */}
      <div className={`fixed inset-0 z-[100] md:hidden transition-all duration-400 ease-[cubic-bezier(0.23,1,0.32,1)] ${
        isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}>
        {/* Glass Overlay - Optimized for mobile performance */}
        <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" />
        
        {/* Content */}
        <div className="relative h-full flex flex-col justify-center px-12 space-y-8">
           <div className="absolute top-10 right-10 opacity-20 hidden sm:block">
              <span className="text-[10px] uppercase tracking-[1em] rotate-90 block origin-right">Discovery Tray</span>
           </div>

           <span className="text-[10px] uppercase tracking-[0.8em] text-vienna-green mb-4 block translate-y-4 opacity-0 animate-[fadeUp_0.4s_ease_forwards]">Discovery</span>
           
            {navLinks.map((item, i) => (
             <a 
               key={item.name}
               href={item.href}
               onClick={(e) => handleLinkClick(e, item.href)}
               className={`text-5xl font-serif italic text-vienna-cream flex items-center justify-between group translate-y-8 opacity-0 animate-[fadeUp_0.4s_ease_forwards] cursor-pointer active:scale-95 transition-transform`}
               style={{ animationDelay: `${0.1 + i * 0.08}s` }}
             >
               {item.name}
               <ArrowRight className="text-vienna-green opacity-40 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500" />
             </a>
           ))}

           <div className="pt-12 translate-y-8 opacity-0 animate-[fadeUp_0.4s_ease_forwards]" style={{ animationDelay: '0.5s' }}>
              <button className="w-full py-6 rounded-full border border-vienna-beige/20 text-vienna-beige text-xs uppercase tracking-[0.4em] hover:bg-vienna-cream hover:text-vienna-brown transition-all duration-500">
                Order Online
              </button>
           </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeUp {
          to { transform: translateY(0); opacity: 1; }
        }
      `}} />
    </>
  );
};

export default Navbar;
