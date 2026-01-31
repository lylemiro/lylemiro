import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

interface BackgroundMusicProps {
  isPlaying: boolean;
}

const BackgroundMusic: React.FC<BackgroundMusicProps> = ({ isPlaying }) => {
  const playerRef = useRef<any>(null);
  const containerId = 'youtube-audio-player';

  useEffect(() => {
    // 1. Function to initialize player
    const initPlayer = () => {
      if (playerRef.current) return; // Already initialized

      playerRef.current = new window.YT.Player(containerId, {
        height: '0',
        width: '0',
        videoId: 'n-iS-jo_uv8', // Video ID provided
        playerVars: {
          'playsinline': 1,
          'controls': 0,
          'disablekb': 1,
          'fs': 0,
          'loop': 1,
          'playlist': 'n-iS-jo_uv8', // Required for loop to work on single video
          'modestbranding': 1,
        },
        events: {
          'onReady': (event: any) => {
            event.target.setVolume(25); // Set volume to 25% for background ambience
            if (isPlaying) {
              event.target.playVideo();
            }
          }
        }
      });
    };

    // 2. Load API if not available
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = initPlayer;
    } else {
      // API already loaded, just init
      initPlayer();
    }
  }, []); // Run once on mount

  // 3. Sync React state with Player
  useEffect(() => {
    if (playerRef.current && typeof playerRef.current.playVideo === 'function') {
      if (isPlaying) {
        playerRef.current.playVideo();
      } else {
        playerRef.current.pauseVideo();
      }
    }
  }, [isPlaying]);

  return (
    <div 
      id={containerId} 
      className="fixed bottom-0 left-0 w-0 h-0 opacity-0 pointer-events-none overflow-hidden" 
      aria-hidden="true"
    />
  );
};

export default BackgroundMusic;