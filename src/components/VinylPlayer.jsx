import React, { useContext, useState } from 'react';
import { MusicContext } from '../MusicProvider';
import { Pause, Play, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';

const VinylPlayer = () => {
  const { isPlaying, togglePlay, nextTrack, prevTrack, currentTrack, isUnlocked } = useContext(MusicContext);
  const [isHovered, setIsHovered] = useState(false);

  if (!isUnlocked) return null;

  return (
    <div 
      className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-[100] flex items-center gap-2 sm:gap-4 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => {
        // Toggle on click for mobile devices (non-touch devices usually trigger mouseEnter first)
        if (window.matchMedia('(max-width: 640px)').matches) {
          setIsHovered(!isHovered);
        }
      }}
      style={{
        transform: isHovered ? 'translateY(-10px)' : 'translateY(0)',
        pointerEvents: 'auto'
      }}
    >
      {/* Track Info (Revealed on Hover) */}
      <div 
        className={`flex flex-col items-end transition-all duration-500 delay-100 ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'}`}
      >
        <span className="text-[8px] sm:text-[10px] uppercase tracking-[0.3em] text-vienna-beige/40 mb-1">Now Brewing</span>
        <span className="text-[10px] sm:text-xs font-serif italic text-vienna-cream whitespace-nowrap">{currentTrack.name}</span>
      </div>

      {/* Control Module (Revealed on Hover) */}
      <div 
        className={`flex items-center gap-2 sm:gap-3 bg-black/40 backdrop-blur-xl border border-white/5 rounded-full px-3 py-1.5 sm:px-4 sm:py-2 transition-all duration-500 ${isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}`}
      >
        <button onClick={prevTrack} className="hover:text-vienna-green transition-colors">
          <SkipBack size={12} fill="currentColor" className="sm:w-[14px] sm:h-[14px]" />
        </button>
        <button onClick={togglePlay} className="hover:text-vienna-green transition-colors flex items-center justify-center w-5 sm:w-6">
          {isPlaying ? <Pause size={12} fill="currentColor" className="sm:w-[14px] sm:h-[14px]" /> : <Play size={12} fill="currentColor" className="sm:w-[14px] sm:h-[14px]" />}
        </button>
        <button onClick={nextTrack} className="hover:text-vienna-green transition-colors">
          <SkipForward size={12} fill="currentColor" className="sm:w-[14px] sm:h-[14px]" />
        </button>
      </div>

      {/* The Vinyl Disk */}
      <div 
        className="relative w-12 h-12 sm:w-16 sm:h-16 cursor-pointer group"
        onClick={togglePlay}
      >
        {/* Revolving Disk */}
        <div 
          className={`absolute inset-0 rounded-full border border-white/10 shadow-2xl transition-transform duration-[2000ms] ease-in-out ${isPlaying ? 'animate-[spin_4s_linear_infinite]' : ''}`}
          style={{
            background: 'radial-gradient(circle, #0a0a0a 0%, #1a1a1a 40%, #000 70%, #151515 100%)',
            boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8), 0 5px 15px rgba(0,0,0,0.5)'
          }}
        >
          {/* Vinyl Grooves Effect */}
          <div className="absolute inset-0 rounded-full opacity-30" style={{
            backgroundImage: 'repeating-radial-gradient(circle, transparent 0, transparent 2px, #fff 3px, transparent 4px)',
            backgroundSize: '100% 100%'
          }} />
          
          {/* Center Label */}
          <div className="absolute inset-[35%] rounded-full bg-vienna-green flex items-center justify-center border border-black/20 shadow-inner">
             <div className="w-0.5 h-0.5 sm:w-1 sm:h-1 bg-black rounded-full" />
          </div>
        </div>

        {/* Hover Shadow Ring */}
        <div className={`absolute inset-0 rounded-full border-2 border-vienna-green/40 scale-110 transition-all duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}} />
    </div>
  );
};

export default VinylPlayer;
