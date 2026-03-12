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
  { id: 1, path: '/assets/frames/scene1', videoPath: '/assets/videos/1-Exterior.mp4', count: 120, Component: Scene1Exterior },
  { id: 2, path: '/assets/frames/scene2', videoPath: '/assets/videos/2-Entering.mp4', count: 120, Component: Scene2Entering },
  { id: 3, path: '/assets/frames/scene3', videoPath: '/assets/videos/3-Coffee_blending.mp4', count: 120, Component: Scene3CoffeeBlending },
  { id: 4, path: '/assets/frames/scene4', videoPath: '/assets/videos/4-Espresso_pour.mp4', count: 120, Component: Scene4EspressoPour },
  { id: 5, path: '/assets/frames/scene5', videoPath: '/assets/videos/5-Mixing_sugar.mp4', count: 120, Component: Scene5MixingSugar },
  { id: 6, path: '/assets/frames/scene6', videoPath: '/assets/videos/6-Drinking.mp4', count: 120, Component: Scene6Drinking },
];

const MobileScene = ({ scene, index, isLoaded, isUnlocked }) => {
  const sectionRef = useRef(null);
  const videoRef = useRef(null);
  const [progress, setProgress] = useState(index === 0 ? 0 : -1);

  // Unlock AutoPlay strictly on user interaction (Apple Low Power Mode bypass)
  useEffect(() => {
    if (isUnlocked && index === 0 && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [isUnlocked, index]);

  // Give each segment a 100vh scroll pin to let text animate perfectly
  useEffect(() => {
    if (!isUnlocked) return;
    const st = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top top',
      end: '+=100%', 
      pin: true,
      scrub: true,
      onUpdate: (self) => {
        setProgress(self.progress);
        if (self.isActive && videoRef.current && videoRef.current.paused) {
           videoRef.current.play().catch(() => {});
        } else if (!self.isActive && videoRef.current && !videoRef.current.paused) {
           videoRef.current.pause();
        }
      }
    });

    return () => st.kill();
  }, [isUnlocked]);

  return (
    <div ref={sectionRef} className="relative w-full h-[100vh] overflow-hidden bg-black top-0">
      <video
        ref={videoRef}
        src={scene.videoPath}
        className="absolute inset-0 w-full h-full object-cover opacity-60"
        loop muted playsInline
      />
      <div className="absolute inset-0 z-20 pointer-events-none">
        <scene.Component index={index} parentRef={sectionRef} isLoaded={isLoaded} progress={progress} />
      </div>
    </div>
  );
};


const CinematicMaster = ({ onLoadComplete, onJourneyStart }) => {
  const masterRef = useRef(null);
  const canvasRef = useRef(null);
  const videoRefs = useRef([]);
  // Determine architecture once on mount
  const [isMobile] = useState(() => window.innerWidth < 768);
  
  const [allImages, setAllImages] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);
  // Track scene index and per-scene progress (0→1) to pass to scene components
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

  // Preload frames or videos based on architecture
  useEffect(() => {
    let totallyLoaded = 0;
    const loadedManifest = {};
    
    if (isMobile) {
       // --- MOBILE INSTANT LOAD ---
       // Mobile browsers heavily throttle video metadata/preloads to save cellular data,
       // causing our preloader to stall. We bypass the preloader screen on mobile instantly.
       setLoadProgress(100);
       setIsLoaded(true);
       return;
    }
    
    // Safety Timeout: Force load after 12 seconds
    const safetyTimeout = setTimeout(() => {
       // --- DESKTOP IMAGE PRELOAD ---
       const frameStep = 1;
       const primaryScene = SCENES_CONFIG[0];
       const totalPrimaryFrames = Math.ceil(primaryScene.count / frameStep);

       const incrementPrimaryLoad = () => {
         totallyLoaded++;
         setLoadProgress(Math.min(Math.round((totallyLoaded / totalPrimaryFrames) * 100), 100));
         if (totallyLoaded >= totalPrimaryFrames && !isLoaded) {
           clearTimeout(safetyTimeout);
           setIsLoaded(true);
         }
       };

       SCENES_CONFIG.forEach((scene, sIdx) => {
         const sceneImages = [];
         const isPrimary = sIdx === 0;

         for (let i = 1; i <= scene.count; i += frameStep) {
           const img = new Image();
           const frameNumber = i.toString().padStart(4, '0');
           
           if (isPrimary) {
             img.onload = incrementPrimaryLoad;
             img.onerror = incrementPrimaryLoad; 
           }
           
           img.src = `${scene.path}/frame_${frameNumber}.jpg`;
           sceneImages.push(img);
         }
         loadedManifest[sIdx] = sceneImages;
       });

       setAllImages(loadedManifest);
       return () => clearTimeout(safetyTimeout);
    }
  }, [isMobile]);

  useEffect(() => {
    if (isLoaded && onLoadComplete) {
      onLoadComplete();
    }
  }, [isLoaded, onLoadComplete]);

  // GSAP Orchestration
  useEffect(() => {
    if (isMobile || !isLoaded || !isUnlocked) return;

    let canvas, ctx, pixelRatio;
    
    canvas = canvasRef.current;
    ctx = canvas.getContext('2d', { alpha: false });
    pixelRatio = window.devicePixelRatio;

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

    const resize = () => {
      if (canvas) {
        canvas.width = window.innerWidth * pixelRatio;
        canvas.height = window.innerHeight * pixelRatio;
        drawFrame(0, 0);
      }
    };

    resize();
    window.addEventListener('resize', resize);

    let lastSceneIdx = -1;
    let lastFrameIdx = -1;

    // Master Timeline for Canvas + Progress Tracking
    const masterTl = gsap.timeline({
      scrollTrigger: {
        trigger: masterRef.current,
        start: 'top top',
        end: '+=2400%', // Weighted: first 5 scenes * 300% + last scene * 900%
        pin: true,
        scrub: 0.5,
        onUpdate: (self) => {
          const totalProgress = self.progress;
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

          // Execute Scrubbing based on Architecture
          // ---> DESKTOP CANVAS SCENE DRAW
          const frameStep = 1;
          const sparseLength = Math.ceil(SCENES_CONFIG[currentSceneIdx].count / frameStep);
          const frameIdx = Math.round(internalProgress * (sparseLength - 1));

          // Only Redraw if something changed
          if (currentSceneIdx !== lastSceneIdx || frameIdx !== lastFrameIdx) {
            ctx.globalAlpha = 1;
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            drawFrame(currentSceneIdx, frameIdx);

            // Crossfade at transition
            if (internalProgress > 0.9 && currentSceneIdx < SCENES_CONFIG.length - 1) {
               const fade = (internalProgress - 0.9) * 10;
               drawFrame(currentSceneIdx + 1, 0, fade);
            }

            lastSceneIdx = currentSceneIdx;
            lastFrameIdx = frameIdx;
          }

          // Update scene progress state (drives text animations in scene components)
          setActiveScene(currentSceneIdx);
          setSceneProgress(internalProgress);
        }
      }
    });

    return () => {
      window.removeEventListener('resize', resize);
      masterTl.kill();
    };
  }, [isLoaded, allImages, isUnlocked]);

  return (
    <div ref={isMobile ? null : masterRef} className={`relative w-full bg-black overflow-hidden cinematic-master-container ${isMobile ? 'h-auto pb-32' : 'h-screen'}`}>
      {!isMobile && (
        <canvas 
          ref={canvasRef} 
          className="absolute inset-0 w-full h-full block" 
          style={{ width: '100%', height: '100%' }}
        />
      )}
      
      {isMobile && (
        <div className="relative w-full z-0 bg-black flex flex-col">
           {SCENES_CONFIG.map((scene, idx) => (
              <MobileScene 
                 key={scene.id} 
                 scene={scene} 
                 index={idx}
                 isLoaded={isLoaded}
                 isUnlocked={isUnlocked}
              />
           ))}
        </div>
      )}
      
      {/* Global Cinematic Filter */}
      {!isMobile && <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none z-10" />}

      {/* Scene 6: Progressive Cinematic Blur Overlay — blurs the canvas, text layers above stay sharp */}
      {!isMobile && (
        <div 
          className="absolute inset-0 pointer-events-none z-15 transition-none"
          style={{ 
            backdropFilter: backdropBlur > 0 ? `blur(${backdropBlur}px)` : 'none',
            WebkitBackdropFilter: backdropBlur > 0 ? `blur(${backdropBlur}px)` : 'none',
            backgroundColor: `rgba(255,255,255,${bgOverlayAlpha.toFixed(3)})`,
          }}
        />
      )}

      {/* Content Layers - Each scene receives the current progress (Desktop Only, mobile receives it inside MobileScene) */}
      {!isMobile && (
        <div className="relative z-20 w-full h-full pointer-events-none">
          {SCENES_CONFIG.map((scene, idx) => {
            // Only render scenes that are active or immediately adjacent (for transitions)
            // All other scenes are completely hidden to prevent text bleed-through
            const isRelevant = Math.abs(activeScene - idx) <= 1;
            const sceneProgressValue = activeScene === idx ? sceneProgress : (activeScene > idx ? 1 : -1);

            return (
              <div 
                key={scene.id}
                className="absolute inset-0 scene-layer"
                style={{ 
                  display: isRelevant ? 'block' : 'none',
                  // Hide when not yet reached (-1) OR when fully passed (>=1)
                  // Only show while the scene is actively progressing (0 to <1)
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
      )}

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
