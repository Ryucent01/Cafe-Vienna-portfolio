import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const SceneSection = ({
  videoId,
  framePath,
  frameCount = 120,
  children,
  scrubSpeed = 0.4,
  pinDuration = '300%',
}) => {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const [images, setImages] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);

  // Lazy load images only when section is near
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(section);
        }
      },
      { rootMargin: '1000px' } // Load well ahead
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  // Preload images
  useEffect(() => {
    if (!isInView) return;

    let loadedCount = 0;
    const preloadedImages = [];

    // Local function to handle image load
    const checkAllLoaded = () => {
      loadedCount++;
      if (loadedCount === frameCount) {
        setImages(preloadedImages);
        setIsLoaded(true);
      }
    };

    for (let i = 1; i <= frameCount; i++) {
      const img = new Image();
      const frameNumber = i.toString().padStart(4, '0');
      img.src = `${framePath}/frame_${frameNumber}.jpg`;
      img.onload = checkAllLoaded;
      img.onerror = checkAllLoaded; // simple error handling to prevent blocking
      preloadedImages.push(img);
    }
  }, [isInView, framePath, frameCount]);

  // Handle Canvas Drawing & ScrollTrigger
  useEffect(() => {
    if (!isLoaded || !images.length) return;

    const section = sectionRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d', { alpha: false }); // optimized for opaque background

    const renderFrame = (index) => {
      const img = images[index];
      if (!img) return;

      // Draw image with cover logic
      const canvasRatio = canvas.width / canvas.height;
      const imgRatio = img.width / img.height;
      let drawWidth, drawHeight, offsetX, offsetY;

      if (canvasRatio > imgRatio) {
        drawWidth = canvas.width;
        drawHeight = canvas.width / imgRatio;
        offsetX = 0;
        offsetY = (canvas.height - drawHeight) / 2;
      } else {
        drawWidth = canvas.height * imgRatio;
        drawHeight = canvas.height;
        offsetX = (canvas.width - drawWidth) / 2;
        offsetY = 0;
      }

      context.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    };

    // Resize canvas to cover
    const resizeCanvas = () => {
      canvas.width = window.innerWidth * window.devicePixelRatio;
      canvas.height = window.innerHeight * window.devicePixelRatio;
      renderFrame(0);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const sequenceObj = { frame: 0 };
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: `+=${pinDuration}`,
        pin: true,
        scrub: scrubSpeed,
      }
    });

    tl.to(sequenceObj, {
      frame: frameCount - 1,
      ease: 'none',
      onUpdate: () => renderFrame(Math.round(sequenceObj.frame)),
    });

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      tl.kill();
      ScrollTrigger.getAll().forEach(t => {
        if (t.trigger === section) t.kill();
      });
    };
  }, [isLoaded, images, pinDuration, scrubSpeed, frameCount]);

  return (
    <section ref={sectionRef} className="relative w-full h-screen overflow-hidden bg-black">
      <canvas 
        ref={canvasRef} 
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
      
      {/* Soft dark gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent mix-blend-multiply pointer-events-none" />

      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-50">
           <div className="text-vienna-beige/40 font-sans tracking-[0.3em] uppercase text-[10px] animate-pulse">
             Developing Sequence...
           </div>
        </div>
      )}

      {/* Content wrapper passed as children */}
      <div className="relative z-10 w-full h-full">
         {children}
      </div>
    </section>
  );
};

export default SceneSection;
