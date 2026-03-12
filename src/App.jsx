import React, { useState, useEffect, useContext } from 'react';
import { SmoothScrollProvider, SmoothScrollContext } from './SmoothScrollProvider';

// Core Engine
import CinematicMaster from './components/CinematicMaster';

// Static Sections
import StaticContent from './components/StaticContent';
import VinylPlayer from './components/VinylPlayer';
import Navbar from './components/Navbar';

function AppContent() {
  const [isCinematicLoaded, setIsCinematicLoaded] = useState(false);
  const [isJourneyStarted, setIsJourneyStarted] = useState(false);
  const { lenis } = useContext(SmoothScrollContext);

  useEffect(() => {
    if (!isJourneyStarted && lenis) {
      lenis.stop();
    } else if (isJourneyStarted && lenis) {
      lenis.start();
      // Force a refresh of ScrollTrigger when content appears
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
        ScrollTrigger.refresh();
      }, 100);
    }
  }, [isJourneyStarted, lenis]);

  return (
    <div className={`relative w-full bg-black text-vienna-cream selection:bg-vienna-green selection:text-white ${!isJourneyStarted ? 'h-screen overflow-hidden' : ''}`}>
      <main className="relative z-10 w-full">
          {/* UNIFIED CINEMATIC EXPERIENCE */}
          <CinematicMaster 
            onLoadComplete={() => setIsCinematicLoaded(true)} 
            onJourneyStart={() => setIsJourneyStarted(true)}
          />

          {/* STATIC EDITORIAL CONTENT - ONLY VISIBLE AFTER CINEMATIC LOADS & JOURNEY STARTS */}
          {isJourneyStarted && isCinematicLoaded && <StaticContent />}
      </main>

      {/* PERSISTENT AUDIO UI - OUTSIDE main to avoid z-index/transform issues */}
      <VinylPlayer />

      {/* GLOBAL NAVIGATION */}
      <Navbar />
    </div>
  );
}

function App() {
  return (
    <SmoothScrollProvider>
      <AppContent />
    </SmoothScrollProvider>
  );
}

export default App;
