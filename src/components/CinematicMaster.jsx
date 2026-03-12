import React, { useRef, useEffect, useState, useContext } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { MusicContext } from '../MusicProvider';

// Import Scene Content Layers
import Scene1Exterior from './scenes/Scene1Exterior';
import Scene2Entering from './scenes/Scene2Entering';
import Scene3CoffeeBlending from './scenes/Scene3CoffeeBlending';
import Scene4EspressoPour from './scenes/Scene4EspressoPour';
import Scene5MixingSugar from './scenes/Scene5MixingSugar';
import Scene6Drinking from './scenes/Scene6Drinking';

gsap.registerPlugin(ScrollTrigger);

const SCENES_CONFIG = [
  { id: 1, path: '/assets/frames/scene1', mobilePath: '/assets/frames/scene1/mobile', count: 120, Component: Scene1Exterior },
  { id: 2, path: '/assets/frames/scene2', mobilePath: '/assets/frames/scene2/mobile', count: 120, Component: Scene2Entering },
  { id: 3, path: '/assets/frames/scene3', mobilePath: '/assets/frames/scene3/mobile', count: 120, Component: Scene3CoffeeBlending },
  { id: 4, path: '/assets/frames/scene4', mobilePath: '/assets/frames/scene4/mobile', count: 120, Component: Scene4EspressoPour },
  { id: 5, path: '/assets/frames/scene5', mobilePath: '/assets/frames/scene5/mobile', count: 120, Component: Scene5MixingSugar },
  { id: 6, path: '/assets/frames/scene6', mobilePath: '/assets/frames/scene6/mobile', count: 120, Component: Scene6Drinking },
];

const CinematicMaster = ({ onLoadComplete, onJourneyStart }) => {
  const masterRef = useRef(null);
  const canvasRef = useRef(null);
  
  // Determine architecture once on mount
  const [isMobile] = useState(() => window.innerWidth < 768);
  
  const [allImages, setAllImages] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeScene, setActiveScene] = useState(0);
  const [sceneProgress, setSceneProgress] = useState(0);
  const { unlockAudio, isUnlocked } = useContext(MusicContext);


  useEffect(() => {
    if (isUnlocked && onJourneyStart) {
      onJourneyStart();
    }
  }, [isUnlocked, onJourneyStart]);

  // Compute cinematic blur: only kicks in during Scene 6 (index 5)
  const backdropBlur = activeScene === 5 ? Math.round(sceneProgress * 30) : 0;
  const bgOverlayAlpha = activeScene === 5 ? sceneProgress : 0;

  const [loadProgress, setLoadProgress] = useState(0);

  // --- STRICT PRELOADER ---
  useEffect(() => {
    let totallyLoaded = 0;
    const loadedManifest = {};
    const frameStep = isMobile ? 3 : 1;
    
    // Calculate total frames to wait for
    const totalFramesAcrossAllScenes = SCENES_CONFIG.reduce((acc, scene) => {
      return acc + Math.ceil(scene.count / frameStep);
    }, 0);

    // Initial load progress
    setLoadProgress(1);

    const incrementLoad = () => {
      totallyLoaded++;
      const progress = Math.min(Math.round((totallyLoaded / totalFramesAcrossAllScenes) * 100), 100);
      setLoadProgress(progress);
      
      if (totallyLoaded >= totalFramesAcrossAllScenes) {
        setAllImages(loadedManifest);
        // Add a slight delay for state settling
        setTimeout(() => setIsLoaded(true), 100);
      }
    };

    SCENES_CONFIG.forEach((scene, sIdx) => {
      const sceneImages = [];
      const basePath = isMobile ? scene.mobilePath : scene.path;
      const extension = isMobile ? 'webp' : 'jpg';

      for (let i = 1; i <= scene.count; i += frameStep) {
        const img = new Image();
        const frameNumber = i.toString().padStart(4, '0');
        
        img.onload = incrementLoad;
        img.onerror = incrementLoad; // Skip missing frames to prevent preloader stall
        img.src = `${basePath}/frame_${frameNumber}.${extension}`;
        
        sceneImages.push(img);
      }
      loadedManifest[sIdx] = sceneImages;
    });

  }, [isMobile]);

  useEffect(() => {
    if (isLoaded && onLoadComplete) {
      onLoadComplete();
    }
  }, [isLoaded, onLoadComplete]);

  // GSAP Orchestration
  useEffect(() => {
    if (!isLoaded || !isUnlocked) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    const pixelRatio = isMobile ? 1.0 : window.devicePixelRatio;

    const drawFrame = (sceneIdx, frameIdx, alpha = 1) => {
      const img = allImages[sceneIdx]?.[frameIdx];
      if (!img) return;

      const canvasRatio = canvas.width / canvas.height;
      const imgRatio = img.width / img.height;
      let drawW, drawH, offX, offY;

      if (canvasRatio > imgRatio) {
        drawW = canvas.width;
        drawH = canvas.width / imgRatio;
        offX = 0;
        offY = (canvas.height - drawH) / 2;
      } else {
        drawW = canvas.height * imgRatio;
        drawH = canvas.height;
        offX = (canvas.width - drawW) / 2;
        offY = 0;
      }

      ctx.globalAlpha = alpha;
      ctx.drawImage(img, offX, offY, drawW, drawH);
    };

    const updateCinematic = (totalProgress) => {
      const firstScenesWeight = 15/24;
      let currentSceneIdx, internalProgress;

      if (totalProgress <= firstScenesWeight) {
        const p = totalProgress / firstScenesWeight;
        const rawIdx = p * 5;
        currentSceneIdx = Math.min(Math.floor(rawIdx), 4);
        internalProgress = rawIdx - currentSceneIdx;
      } else {
        currentSceneIdx = 5;
        internalProgress = (totalProgress - firstScenesWeight) / (1 - firstScenesWeight);
      }

      const frameStep = isMobile ? 3 : 1;
      const sceneFramesCount = Math.ceil(SCENES_CONFIG[currentSceneIdx].count / frameStep);
      const frameIdx = Math.round(internalProgress * (sceneFramesCount - 1));

      // Clear and Draw
      ctx.globalAlpha = 1;
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      drawFrame(currentSceneIdx, frameIdx);

      // Handle Crossfade logic
      if (internalProgress > 0.9 && currentSceneIdx < SCENES_CONFIG.length - 1) {
         const fade = (internalProgress - 0.9) * 10;
         drawFrame(currentSceneIdx + 1, 0, fade);
      }

      setActiveScene(currentSceneIdx);
      setSceneProgress(internalProgress);
    };

    const resize = () => {
      canvas.width = window.innerWidth * pixelRatio;
      canvas.height = window.innerHeight * pixelRatio;
      const p = ScrollTrigger.getById('master-cinematic')?.progress || 0;
      updateCinematic(p);
    };

    resize();
    window.addEventListener('resize', resize);

    const masterTl = gsap.timeline({
      scrollTrigger: {
        id: 'master-cinematic',
        trigger: masterRef.current,
        start: 'top top',
        end: '+=2400%', 
        pin: true,
        scrub: 0.2, // Slightly smoother scrub for premium feel
        onUpdate: (self) => updateCinematic(self.progress)
      }
    });

    return () => {
      window.removeEventListener('resize', resize);
      masterTl.kill();
      const st = ScrollTrigger.getById('master-cinematic');
      if (st) st.kill();
    };
  }, [isLoaded, allImages, isUnlocked, isMobile]);

  return (
    <div ref={masterRef} className="relative w-full h-screen bg-black overflow-hidden cinematic-master-container">
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full block" 
        style={{ width: '100%', height: '100%' }}
      />
      
      {/* Global Cinematic Filter */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none z-10" />

      {/* Scene 6: Progressive Cinematic Blur Overlay — blurs the background, text layers above stay sharp */}
      <div 
        className="absolute inset-0 pointer-events-none z-15 transition-none"
        style={{ 
          backdropFilter: backdropBlur > 0 ? `blur(${backdropBlur}px)` : 'none',
          WebkitBackdropFilter: backdropBlur > 0 ? `blur(${backdropBlur}px)` : 'none',
          backgroundColor: `rgba(255,255,255,${bgOverlayAlpha.toFixed(3)})`,
        }}
      />

      {/* Content Layers - Each scene receives the current progress */}
      <div className="relative z-20 w-full h-full pointer-events-none">
        {SCENES_CONFIG.map((scene, idx) => {
          // Only render scenes that are active or immediately adjacent (for transitions)
          const isRelevant = Math.abs(activeScene - idx) <= 1;
          const sceneProgressValue = activeScene === idx ? sceneProgress : (activeScene > idx ? 1 : -1);

          return (
            <div 
              key={scene.id}
              className="absolute inset-0 scene-layer"
              style={{ 
                display: isRelevant ? 'block' : 'none',
                opacity: (sceneProgressValue < 0 || sceneProgressValue >= 1) ? 0 : 1,
              }}
            >
              <scene.Component 
                index={idx} 
                parentRef={masterRef} 
                isLoaded={isLoaded}
                progress={sceneProgressValue}
              />
            </div>
          );
        })}
      </div>


      {!isLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-50">
           {/* Progress Ring */}
           <div className="relative w-24 h-24 mb-12 flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle 
                  cx="50%" cy="50%" r="45%" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="1" 
                  className="text-vienna-beige/10"
                />
                <circle 
                  cx="50%" cy="50%" r="45%" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeDasharray={`${loadProgress * 2.83} 283`}
                  className="text-vienna-beige/60 transition-all duration-300 ease-out"
                />
              </svg>
              <div className="text-[12px] font-sans font-light tracking-[0.2em] text-vienna-beige/80">
                {loadProgress}%
              </div>
           </div>

           <div className="text-vienna-beige/40 font-sans tracking-[0.8em] uppercase text-[9px] animate-pulse">
             Constructing the Void
           </div>
        </div>
      )}

      {/* "Begin the Journey" Button works globally for both architectures */}
      {isLoaded && !isUnlocked && (
        <div className={`fixed inset-0 flex flex-col items-center justify-center bg-black z-[100] animate-[fadeIn_2s_ease_forwards] ${isMobile ? 'h-screen' : ''}`}>
           <button 
             onClick={unlockAudio}
             className="group relative flex flex-col items-center justify-center cursor-pointer transition-all duration-1000"
           >
              {/* Minimalist Action */}
              <div className="relative flex flex-col items-center space-y-12">
                 <h3 className="text-vienna-cream font-serif italic text-4xl sm:text-6xl tracking-[0.1em] opacity-80 group-hover:opacity-100 group-hover:tracking-[0.2em] transition-all duration-1000">
                   Begin the Journey
                 </h3>
                 
                 <div className="relative w-16 h-[1px] bg-vienna-cream/20 overflow-hidden">
                    <div className="absolute inset-0 bg-vienna-cream transform -translate-x-full group-hover:translate-x-0 transition-transform duration-[1.5s] ease-in-out" />
                 </div>

                 <span className="text-[9px] uppercase tracking-[0.8em] text-vienna-cream/30 group-hover:text-vienna-cream/60 transition-colors duration-1000">
                   Click to Enter
                 </span>
              </div>

              {/* Subtle Ambient Glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-vienna-green/[0.03] rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
           </button>
        </div>
      )}
    </div>
  );
};

<style dangerouslySetInnerHTML={{ __html: `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`}} />

export default CinematicMaster;
