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
  { id: 1, path: '/assets/frames/scene1', videoPath: '/assets/videos/1-Exterior.mp4', mobileVideoPath: '/assets/videos/mobile/1-Exterior.mp4', count: 120, Component: Scene1Exterior },
  { id: 2, path: '/assets/frames/scene2', videoPath: '/assets/videos/2-Entering.mp4', mobileVideoPath: '/assets/videos/mobile/2-Entering.mp4', count: 120, Component: Scene2Entering },
  { id: 3, path: '/assets/frames/scene3', videoPath: '/assets/videos/3-Coffee_blending.mp4', mobileVideoPath: '/assets/videos/mobile/3-Coffee_blending.mp4', count: 120, Component: Scene3CoffeeBlending },
  { id: 4, path: '/assets/frames/scene4', videoPath: '/assets/videos/4-Espresso_pour.mp4', mobileVideoPath: '/assets/videos/mobile/4-Espresso_pour.mp4', count: 120, Component: Scene4EspressoPour },
  { id: 5, path: '/assets/frames/scene5', videoPath: '/assets/videos/5-Mixing_sugar.mp4', mobileVideoPath: '/assets/videos/mobile/5-Mixing_sugar.mp4', count: 120, Component: Scene5MixingSugar },
  { id: 6, path: '/assets/frames/scene6', videoPath: '/assets/videos/6-Drinking.mp4', mobileVideoPath: '/assets/videos/mobile/6-Drinking.mp4', count: 120, Component: Scene6Drinking },
];

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
    
    // Safety Timeout: Force load after 12 seconds to prevent permanent black screen
    const safetyTimeout = setTimeout(() => {
      console.warn("Loading timed out, forcing display.");
      setIsLoaded(true);
    }, 12000);

    if (isMobile) {
       // --- MOBILE VIDEO PRELOAD ---
       // Instead of a fragile probe, we use a simple timer-based progression
       // to ensure the UI unlocks. Videos will stream naturally as the user scrolls.
       let prog = 0;
       const interval = setInterval(() => {
          prog += 10;
          setLoadProgress(prog);
          if (prog >= 100) {
             clearInterval(interval);
             clearTimeout(safetyTimeout);
             setIsLoaded(true);
          }
       }, 150);

       return () => {
          clearInterval(interval);
          clearTimeout(safetyTimeout);
       };
    }
    

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
  }, [isMobile]);

  useEffect(() => {
    if (isLoaded && onLoadComplete) {
      onLoadComplete();
    }
  }, [isLoaded, onLoadComplete]);

  // Unlock Video Decoders on Mobile (Play/Pause hack to allow scrubbing)
  useEffect(() => {
    if (isMobile && isUnlocked && videoRefs.current.length > 0) {
      videoRefs.current.forEach(vid => {
        if (vid) {
          vid.play().then(() => vid.pause()).catch(() => {});
        }
      });
    }
  }, [isMobile, isUnlocked]);

  // GSAP Orchestration
  useEffect(() => {
    if (!isLoaded || !isUnlocked) return;
    
    // Force a ScrollTrigger refresh for mobile pinning
    if (isMobile) {
      setTimeout(() => ScrollTrigger.refresh(), 100);
    }

    let canvas, ctx, pixelRatio;
    
    if (!isMobile) {
      canvas = canvasRef.current;
      if (!canvas) return; // Desktop safety
      ctx = canvas.getContext('2d', { alpha: false });
      pixelRatio = window.devicePixelRatio;
    }

    const drawFrame = (sceneIdx, frameIdx, alpha = 1) => {
      if (isMobile) return; // Safety
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
          if (isMobile) {
             // ---> MOBILE VIDEO STACK SCRUB
             const currentVideo = videoRefs.current[currentSceneIdx];
             if (currentVideo && !isNaN(currentVideo.duration) && currentVideo.duration > 0) {
                // Manual Scrubbing: Map 0-1 progress to video duration
                // We use All-Intra videos for buttery smooth seeking
                try {
                   currentVideo.currentTime = internalProgress * currentVideo.duration;
                } catch (e) {
                   // Fallback for strict mobile browsers
                }
             }

             // Handle visibility and crossfades exactly like desktop
             videoRefs.current.forEach((vid, idx) => {
                if (!vid) return;
                if (idx === currentSceneIdx) {
                   vid.style.opacity = idx === 5 ? (1 - backdropBlur/30) : 1;
                   vid.style.visibility = 'visible';
                   vid.style.zIndex = '5';
                } else if (internalProgress > 0.9 && idx === currentSceneIdx + 1) {
                   // Transition fade
                   vid.style.opacity = (internalProgress - 0.9) * 10;
                   vid.style.visibility = 'visible';
                   vid.style.zIndex = '4';
                } else {
                   vid.style.opacity = 0;
                   vid.style.visibility = 'hidden';
                   vid.style.zIndex = '1';
                }
             });
             
             lastSceneIdx = currentSceneIdx;

          } else {
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
    <div ref={masterRef} className="relative w-full h-screen bg-black overflow-hidden cinematic-master-container">
      {!isMobile && (
        <canvas 
          ref={canvasRef} 
          className="absolute inset-0 w-full h-full block" 
          style={{ width: '100%', height: '100%' }}
        />
      )}
      
      {isMobile && (
        <div className="absolute inset-0 w-full h-full z-0 overflow-hidden bg-black">
           {SCENES_CONFIG.map((scene, idx) => (
              <video
                key={`vid-${scene.id}`}
                ref={el => videoRefs.current[idx] = el}
                src={scene.mobileVideoPath}
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
                style={{ 
                   opacity: idx === 0 ? 1 : 0, 
                   visibility: idx === 0 ? 'visible' : 'hidden',
                }}
                muted
                playsInline
                preload="auto"
                onLoadedMetadata={(e) => {
                   // Priming: Jump slightly off 0 to force first frame paint on mobile
                   e.target.currentTime = 0.01;
                }}
              />
           ))}
        </div>
      )}
      
      {/* Global Cinematic Filter */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none z-10" />

      {/* Scene 6: Progressive Cinematic Blur Overlay — blurs the background, text layers above stay sharp */}
      <div 
        className="absolute inset-0 pointer-events-none z-15 transition-none"
        style={{ 
          backdropFilter: backdropBlur > 0 ? `blur(${backdropBlur}px)` : 'none',
          WebkitBackdropFilter: backdropBlur > 0 ? `blur(${backdropBlur}px)` : 'none',
          backgroundColor: isMobile ? `rgba(255,255,255,${bgOverlayAlpha * 0.8})` : `rgba(255,255,255,${bgOverlayAlpha.toFixed(3)})`,
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
