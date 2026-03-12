import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';

const Scene5MixingSugar = ({ progress }) => {
  const containerRef = useRef(null);
  const line1Ref = useRef(null);
  const line2Ref = useRef(null);
  const taglineRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (progress < 0) {
      gsap.set(container, { opacity: 0 });
      [line1Ref, line2Ref, taglineRef].forEach(r => {
        if (r.current) gsap.set(r.current, { opacity: 0, x: -20 });
      });
      return;
    }

    const p = progress;

    const containerOpacity = p < 0.05 ? p / 0.05 : p > 0.92 ? 1 - (p - 0.92) / 0.08 : 1;
    gsap.set(container, { opacity: Math.max(0, Math.min(1, containerOpacity)) });

    const lineReveal = (start, ref, axis = 'x') => {
      if (!ref.current) return;
      const op = p < start ? 0 : p < start + 0.12 ? (p - start) / 0.12 : p > 0.88 ? 1 - (p - 0.88) / 0.12 : 1;
      const offset = p < start + 0.12 ? -20 * (1 - Math.max(0, p - start) / 0.12) : 0;
      gsap.set(ref.current, { opacity: Math.max(0, Math.min(1, op)), [axis]: offset });
    };

    lineReveal(0.00, line1Ref);
    lineReveal(0.08, line2Ref);
    lineReveal(0.18, taglineRef, 'y');

  }, [progress]);

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-start p-12 sm:p-32" style={{ opacity: 0 }}>
      <div className="max-w-4xl">
        <div className="space-y-4 mb-20 flex flex-col items-start">
          <h2 ref={line1Ref} className="text-6xl sm:text-8xl md:text-9xl text-vienna-cream font-bold leading-none tracking-tighter drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)]" style={{ 
            fontFamily: 'Cinzel, serif',
            textShadow: '0 0 30px rgba(0,0,0,0.4)',
            opacity: 0
          }}>
            Simple rituals.
          </h2>
          <h2 ref={line2Ref} className="text-6xl sm:text-8xl md:text-9xl text-vienna-beige italic font-black leading-none tracking-tighter drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)]" style={{ 
            fontFamily: 'Cinzel, serif',
            textShadow: '0 0 30px rgba(0,0,0,0.4)',
            opacity: 0
          }}>
            Quiet moments.
          </h2>
        </div>
        
        <div ref={taglineRef} className="flex flex-col items-start border-l border-vienna-beige/30 pl-10" style={{ opacity: 0 }}>
          <p className="text-2xl sm:text-4xl font-serif italic text-vienna-beige/80 tracking-wide drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)] max-w-lg leading-relaxed">
            Slowing the entire world down, one stir at a time.
          </p>
          <p className="text-[10px] sm:text-xs font-sans uppercase tracking-[0.8em] text-vienna-beige/30 mt-8 font-black">
            in every sip
          </p>
        </div>
      </div>
    </div>
  );
};

export default Scene5MixingSugar;
