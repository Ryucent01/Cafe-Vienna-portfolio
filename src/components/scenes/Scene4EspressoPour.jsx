import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';

const Scene4EspressoPour = ({ progress }) => {
  const containerRef = useRef(null);
  const richRef = useRef(null);
  const smoothRef = useRef(null);
  const aliveRef = useRef(null);
  const phraseRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (progress < 0) {
      gsap.set(container, { opacity: 0 });
      [richRef, smoothRef, aliveRef, phraseRef].forEach(r => {
        if (r.current) gsap.set(r.current, { opacity: 0, y: 15 });
      });
      return;
    }

    const p = progress;

    const containerOpacity = p < 0.05 ? p / 0.05 : p > 0.92 ? 1 - (p - 0.92) / 0.08 : 1;
    gsap.set(container, { opacity: Math.max(0, Math.min(1, containerOpacity)) });

    // Staggered word reveals: Rich at 0–0.10, Smooth at 0.05–0.15, Alive at 0.10–0.20
    const wordReveal = (start, ref) => {
      if (!ref.current) return;
      const op = p < start ? 0 : p < start + 0.12 ? (p - start) / 0.12 : p > 0.88 ? 1 - (p - 0.88) / 0.12 : 1;
      const y = p < start + 0.12 ? 15 * (1 - Math.max(0, p - start) / 0.12) : 0;
      gsap.set(ref.current, { opacity: Math.max(0, Math.min(1, op)), y });
    };

    wordReveal(0.00, richRef);
    wordReveal(0.05, smoothRef);
    wordReveal(0.10, aliveRef);

    if (phraseRef.current) {
      const phraseOp = p < 0.22 ? p / 0.22 : p > 0.88 ? 1 - (p - 0.88) / 0.12 : 1;
      gsap.set(phraseRef.current, { opacity: Math.max(0, Math.min(1, phraseOp)) });
    }

  }, [progress]);

  return (
    <div ref={containerRef} className="w-full h-full flex flex-col items-center justify-center p-12 sm:p-32" style={{ opacity: 0 }}>
      <div className="text-center w-full max-w-5xl">
        <div className="flex flex-col items-center mb-16 space-y-4">
          <span ref={richRef} className="text-6xl sm:text-8xl md:text-9xl text-vienna-cream font-bold drop-shadow-[0_15px_40px_rgba(0,0,0,0.8)]" style={{ 
            fontFamily: 'Cinzel, serif',
            textShadow: '0 0 40px rgba(0,0,0,0.3)',
            opacity: 0
          }}>Rich.</span>
          <span ref={smoothRef} className="text-6xl sm:text-8xl md:text-9xl text-vienna-beige italic font-black drop-shadow-[0_15px_40px_rgba(0,0,0,0.8)]" style={{ 
            fontFamily: 'Cinzel, serif',
            textShadow: '0 0 40px rgba(0,0,0,0.3)',
            opacity: 0
          }}>Smooth.</span>
          <span ref={aliveRef} className="text-6xl sm:text-8xl md:text-9xl text-vienna-cream font-bold drop-shadow-[0_15px_40px_rgba(0,0,0,0.8)]" style={{ 
            fontFamily: 'Cinzel, serif',
            textShadow: '0 0 40px rgba(0,0,0,0.3)',
            opacity: 0
          }}>Alive.</span>
        </div>
        
        <div ref={phraseRef} className="relative mt-12 overflow-hidden py-4" style={{ opacity: 0 }}>
          <p className="text-2xl sm:text-4xl font-serif italic text-vienna-beige/90 tracking-widest drop-shadow-[0_4px_25px_rgba(0,0,0,0.9)] leading-relaxed px-12 border-x border-vienna-beige/10">
            This is the moment <span className="text-vienna-cream font-black not-italic lowercase">coffee becomes art.</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Scene4EspressoPour;
