import React, { createContext, useState, useEffect, useRef } from 'react';

export const MusicContext = createContext();

const PLAYLIST = [
  { id: 1, name: 'Brushed Window', src: '/assets/music/Brushed Window.mp3' },
  { id: 2, name: 'Rainy Window Café', src: '/assets/music/Rainy Window Café.mp3' },
  { id: 3, name: 'Steam & Sunlight', src: '/assets/music/Steam & Sunlight.mp3' },
  { id: 4, name: 'Warm Little Cafe', src: '/assets/music/Warm Little Cafe.mp3' },
];

export const MusicProvider = ({ children }) => {
  const [currentTrackIdx, setCurrentTrackIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const audioRef = useRef(new Audio());

  useEffect(() => {
    const audio = audioRef.current;
    audio.src = PLAYLIST[currentTrackIdx].src;
    audio.loop = false;
    audio.volume = 0.5;

    const handleEnded = () => {
      nextTrack();
    };

    audio.addEventListener('ended', handleEnded);

    if (isPlaying && isUnlocked) {
      audio.play().catch(err => console.error("Audio playback failed:", err));
    }

    return () => {
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrackIdx, isUnlocked]);

  useEffect(() => {
    const audio = audioRef.current;
    if (isPlaying && isUnlocked) {
      audio.play().catch(err => console.error("Audio playback failed:", err));
    } else {
      audio.pause();
    }
  }, [isPlaying, isUnlocked]);

  // Page Visibility API: Pause music when tab is hidden (minimized)
  useEffect(() => {
    const handleVisibilityChange = () => {
      const audio = audioRef.current;
      if (document.hidden) {
        audio.pause();
      } else if (isPlaying && isUnlocked) {
        // Only resume if it was actually playing and unlocked before
        audio.play().catch(err => console.error("Audio resume failed:", err));
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isPlaying, isUnlocked]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  
  const nextTrack = () => {
    setCurrentTrackIdx((prev) => (prev + 1) % PLAYLIST.length);
    setIsPlaying(true);
  };

  const prevTrack = () => {
    setCurrentTrackIdx((prev) => (prev - 1 + PLAYLIST.length) % PLAYLIST.length);
    setIsPlaying(true);
  };

  const unlockAudio = () => {
    setIsUnlocked(true);
    setIsPlaying(true);
  };

  return (
    <MusicContext.Provider value={{ 
      isPlaying, 
      togglePlay, 
      nextTrack, 
      prevTrack, 
      currentTrack: PLAYLIST[currentTrackIdx],
      isUnlocked,
      unlockAudio
    }}>
      {children}
    </MusicContext.Provider>
  );
};
