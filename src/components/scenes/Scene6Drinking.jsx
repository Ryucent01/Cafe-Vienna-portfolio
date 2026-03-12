import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';

const Scene6Drinking = ({ progress }) => {
  const containerRef = useRef(null);
  const breathRef = useRef(null);
  const sipRef = useRef(null);
  const stayRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (progress < 0) {
      gsap.set(container, { opacity: 0 });
      [breathRef, sipRef, stayRef].forEach(r => {
        if (r.current) gsap.set(r.current, { opacity: 0, scale: 0.95 });
      });
      return;
    }

    const p = progress;

    // Container fades in fast, never fades out (final scene)
    const containerOpacity = p < 0.05 ? p / 0.05 : 1;
    gsap.set(container, { opacity: Math.max(0, Math.min(1, containerOpacity)) });

    // Words reveal quickly one after another, then STAY visible permanently
    const wordReveal = (start, ref) => {
      if (!ref.current) return;
      const revealDuration = 0.10;
      let op = p < start ? 0 : p < start + revealDuration ? (p - start) / revealDuration : 1;
      
      // Fade out at the very end (0.85 -> 1.0)
      if (p > 0.85) {
        op = 1 - ((p - 0.85) / 0.15);
      }

      const scale = p < start + revealDuration ? 0.95 + 0.05 * (Math.max(0, p - start) / revealDuration) : (p > 0.85 ? 1 + 0.02 * ((p - 0.85) / 0.15) : 1);
      
      // Dynamic styling based on background fade (starts heavily after 0.5)
      const fadeProgress = Math.max(0, (p - 0.4) / 0.6); // 0 at p=0.4, 1 at p=1.0
      const shadowOpacity = 0.6 * (1 - fadeProgress);
      const colorVal = fadeProgress > 0.5 ? '#4A3B32' : (ref.current.id === 'stay' ? '#E8DCC4' : '#F5EFE6');

      gsap.set(ref.current, { 
        opacity: Math.max(0, Math.min(1, op)), 
        scale,
        color: colorVal,
        textShadow: `0 0 50px rgba(0,0,0,${shadowOpacity})`,
        filter: `drop-shadow(0 10px 40px rgba(0,0,0,${shadowOpacity}))`,
        transition: 'color 0.8s ease, text-shadow 0.8s ease'
      });
    };

    wordReveal(0.00, breathRef);
    wordReveal(0.08, sipRef);
    wordReveal(0.16, stayRef);

  }, [progress]);

  return (
    <div ref={containerRef} className="w-full h-full flex flex-col items-center justify-center p-12 sm:p-32" style={{ opacity: 0 }}>
      <div className="text-center space-y-16">
        <p ref={breathRef} className="text-5xl sm:text-7xl font-serif italic" style={{ opacity: 0 }}>Take a breath.</p>
        <p ref={sipRef} className="text-5xl sm:text-7xl font-serif italic" style={{ opacity: 0 }}>Take a sip.</p>
        <h2 id="stay" ref={stayRef} className="text-6xl sm:text-9xl font-black uppercase tracking-tighter" style={{ 
          fontFamily: 'Cinzel, serif',
          opacity: 0
        }}>
          Stay a while.
        </h2>
      </div>
    </div>
  );
};

export default Scene6Drinking;
