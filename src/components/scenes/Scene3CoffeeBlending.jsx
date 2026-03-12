import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';

const Scene3CoffeeBlending = ({ progress }) => {
  const containerRef = useRef(null);
  const headlineRef = useRef(null);
  const supportRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const headline = headlineRef.current;
    const support = supportRef.current;
    if (!container || !headline || !support) return;

    if (progress < 0) {
      gsap.set(container, { opacity: 0 });
      gsap.set(headline, { opacity: 0, y: 20 });
      gsap.set(support, { opacity: 0, y: 20 });
      return;
    }

    const p = progress;

    const containerOpacity = p < 0.05 ? p / 0.05 : p > 0.92 ? 1 - (p - 0.92) / 0.08 : 1;
    const headlineOpacity = p < 0.12 ? p / 0.12 : p > 0.88 ? 1 - (p - 0.88) / 0.12 : 1;
    const supportOpacity = p < 0.20 ? p / 0.20 : p > 0.88 ? 1 - (p - 0.88) / 0.12 : 1;
    const headlineY = p < 0.12 ? 20 * (1 - p / 0.12) : 0;
    const supportY = p < 0.20 ? 20 * (1 - p / 0.20) : 0;

    gsap.set(container, { opacity: Math.max(0, Math.min(1, containerOpacity)) });
    gsap.set(headline, { opacity: Math.max(0, Math.min(1, headlineOpacity)), y: headlineY });
    gsap.set(support, { opacity: Math.max(0, Math.min(1, supportOpacity)), y: supportY });

  }, [progress]);

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-end p-12 sm:p-32" style={{ opacity: 0 }}>
      <div className="max-w-2xl text-right">
        <h2 ref={headlineRef} className="text-5xl sm:text-7xl md:text-8xl text-vienna-cream mb-16 font-bold leading-[0.9] tracking-tighter select-none drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)]" style={{ 
          fontFamily: 'Cinzel, serif',
          textShadow: '0 0 40px rgba(0,0,0,0.4)',
          opacity: 0
        }}>
          Every cup begins<br/>
          <span className="text-vienna-beige italic font-black">with patience.</span>
        </h2>
        
        <div ref={supportRef} className="space-y-6 flex flex-col items-end" style={{ opacity: 0 }}>
          <p className="text-xl sm:text-2xl font-serif italic text-vienna-beige/90 tracking-wide drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)]">
            Freshly prepared with intention.
          </p>
          <div className="h-[1px] w-24 bg-vienna-beige/30" />
          <p className="text-[10px] sm:text-xs font-sans uppercase tracking-[0.8em] text-vienna-beige/40 font-black">
            crafted in time
          </p>
        </div>
      </div>
    </div>
  );
};

export default Scene3CoffeeBlending;
