import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';

const Scene2Entering = ({ progress }) => {
  const containerRef = useRef(null);
  const headingRef = useRef(null);
  const bodyRef = useRef(null);

  // progress: -1 = not yet, 0→1 = active scene, 1 = passed
  useEffect(() => {
    const container = containerRef.current;
    const heading = headingRef.current;
    const body = bodyRef.current;
    if (!container || !heading || !body) return;

    if (progress < 0) {
      // Scene not reached yet — hide everything
      gsap.set(container, { opacity: 0 });
      gsap.set(heading, { opacity: 0, y: 20 });
      gsap.set(body, { opacity: 0, y: 20 });
      return;
    }

    const p = progress; // 0 → 1

    // Phase 1 (0–0.15): Fast fade in
    // Phase 2 (0.15–0.85): Fully visible / hold
    // Phase 3 (0.85–1.0): Fade out only at the very end

    const containerOpacity = p < 0.05 ? p / 0.05 : p > 0.92 ? 1 - (p - 0.92) / 0.08 : 1;
    const textOpacity = p < 0.12 ? p / 0.12 : p > 0.88 ? 1 - (p - 0.88) / 0.12 : 1;
    const bodyOpacity = p < 0.18 ? p / 0.18 : p > 0.88 ? 1 - (p - 0.88) / 0.12 : 1;
    const headingY = p < 0.12 ? 20 * (1 - p / 0.12) : 0;
    const bodyY = p < 0.18 ? 20 * (1 - p / 0.18) : 0;

    gsap.set(container, { opacity: Math.max(0, Math.min(1, containerOpacity)) });
    gsap.set(heading, { opacity: Math.max(0, Math.min(1, textOpacity)), y: headingY });
    gsap.set(body, { opacity: Math.max(0, Math.min(1, bodyOpacity)), y: bodyY });

  }, [progress]);

  return (
    <div ref={containerRef} className="w-full h-full flex flex-col items-start justify-center p-12 sm:p-32" style={{ opacity: 0 }}>
      <div className="max-w-4xl">
        <h2 ref={headingRef} className="text-7xl sm:text-9xl text-vienna-cream mb-6 font-bold tracking-tight select-none drop-shadow-[0_10px_40px_rgba(0,0,0,0.8)]" style={{ 
          fontFamily: 'Cinzel, serif',
          textShadow: '0 0 30px rgba(0,0,0,0.5)',
          opacity: 0
        }}>
          Step inside.
        </h2>
        
        <div ref={bodyRef} className="flex flex-col items-start border-l-2 border-vienna-beige/20 pl-8 mt-12" style={{ opacity: 0 }}>
          <p className="text-2xl sm:text-4xl font-serif italic font-light tracking-wide text-vienna-beige drop-shadow-[0_4px_25px_rgba(0,0,0,0.9)] leading-relaxed">
            Leave the noise behind.
          </p>
          <p className="text-xs sm:text-sm font-sans uppercase tracking-[0.6em] text-vienna-beige/40 mt-6 font-bold drop-shadow-md">
            unwind in silence
          </p>
        </div>
      </div>
    </div>
  );
};

export default Scene2Entering;
