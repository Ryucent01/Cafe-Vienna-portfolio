import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Scene1Exterior = ({ index, parentRef, isLoaded, progress }) => {
  const containerRef = useRef(null);
  const introPlayed = useRef(false);

  // Progress-driven exit: fade text out as scene 1 approaches its end
  useEffect(() => {
    const q = gsap.utils.selector(containerRef);
    const container = containerRef.current;
    if (!container) return;

    if (progress < 0 || progress === undefined) return;

    const p = progress;

    // Text holds until 65% through scene 1's scroll, then exits cleanly
    if (p > 0.65) {
      const exitP = (p - 0.65) / 0.35; // 0→1 over last 35% of scroll window
      gsap.set(q('.text-content'), {
        opacity: Math.max(0, 1 - exitP),
        y: -exitP * 80,
        filter: `blur(${exitP * 20}px)`,
      });
    } else {
      // Ensure text is shown when early in scene (intro animation handles the reveal)
      gsap.set(q('.text-content'), { opacity: 1, y: 0 });
    }

  }, [progress]);

  // One-time Intro Animation (triggered after preloader finishes)
  useEffect(() => {
    if (isLoaded && !introPlayed.current) {
      introPlayed.current = true;
      const q = gsap.utils.selector(containerRef);

      // Setup Initial Blur/Opacity
      gsap.set(q('.animate-intro'), { opacity: 0, filter: 'blur(40px)' });
      gsap.set(q('.title'), { scale: 0.8 });

      const introTl = gsap.timeline();

      introTl.to(q('.animate-intro'), {
        opacity: 1,
        filter: 'blur(0px)',
        stagger: 0.15,
        duration: 1.2,
        ease: 'power2.out'
      })
        .to(q('.title'), {
          scale: 1,
          duration: 1.5,
          ease: 'expo.out'
        }, 0);
    }
  }, [isLoaded]);

  return (
    <div ref={containerRef} className="w-full h-full flex flex-col items-center justify-center text-center p-6 sm:p-12 relative">
      {/* Top Left Logo Tag */}
      <div className="animate-intro absolute top-8 left-8 sm:top-12 sm:left-12 flex flex-col items-start" style={{ opacity: 0 }}>
        <span className="text-3xl sm:text-4xl font-serif text-vienna-beige/60 font-black tracking-tighter">V/R</span>
      </div>

      <div className="text-content w-full max-w-7xl mx-auto flex flex-col items-center -mt-32 sm:mt-0">
        <p className="animate-intro brand-tag top text-lg sm:text-2xl font-sans text-vienna-beige/90 uppercase font-black mb-0 sm:mb-4 tracking-[1.2em] drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]" style={{ opacity: 0 }}>
          café
        </p>

        <div className="animate-intro py-4 sm:py-12 border-y border-vienna-beige/10 w-full max-w-4xl sm:max-w-7xl flex flex-col items-center" style={{ opacity: 0 }}>
          <h1 className="title text-8xl sm:text-[12rem] md:text-[16rem] lg:text-[20rem] xl:text-[24rem] leading-[0.8] text-vienna-cream drop-shadow-[0_10px_60px_rgba(0,0,0,0.5)] font-bold tracking-[-0.05em] select-none" style={{ fontFamily: 'Cinzel, serif' }}>
            VIENNA
          </h1>
        </div>

        <div className="animate-intro mt-2 sm:mt-6 flex items-center justify-center" style={{ opacity: 0 }}>
          <p className="brand-tag bottom text-sm sm:text-lg font-sans text-vienna-beige/80 uppercase font-bold tracking-[0.6em] drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
            By Ryucent
          </p>
          <span className="ml-3 text-2xl sm:text-4xl text-vienna-beige/95 font-sans font-black align-super drop-shadow-2xl">™</span>
        </div>
      </div>
    </div>
  );
};

export default Scene1Exterior;
