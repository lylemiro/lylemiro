import React, { useRef, useEffect, useState } from 'react';

interface AudioPlayerProps {
    autoStart?: boolean;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ autoStart }) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        if (autoStart && audioRef.current) {
            audioRef.current.play()
                .then(() => setIsPlaying(true))
                .catch(err => console.log('Autoplay blocked:', err));
        }
    }, [autoStart]);

    useEffect(() => {
        // Attempt autoplay on mount (fallback)
        if (audioRef.current && !isPlaying) {
            audioRef.current.play()
                .then(() => setIsPlaying(true))
                .catch(err => {
                    console.log('Autoplay prevented:', err);
                    setIsPlaying(false);
                });
        }
    }, []);

    const togglePlay = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent click from bubbling if needed
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    return (
        <div
            className="fixed bottom-8 left-8 z-40 mb-safe flex items-end group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Container */}
            <div className={`
        flex items-center bg-black/90 backdrop-blur-sm border border-neo-yellow/50 transition-all duration-300 ease-out overflow-hidden
        ${isHovered ? 'w-80 p-3 pr-4' : 'w-10 h-10 p-0 justify-center cursor-pointer hover:border-neo-yellow'}
      `}>

                {/* Toggle Button (Always Visible Logic) */}
                <button
                    onClick={togglePlay}
                    className={`
            flex-shrink-0 flex items-center justify-center text-neo-yellow hover:text-white transition-colors
            ${isHovered ? 'w-8 h-8 border border-white/20 mr-3' : 'w-full h-full'}
          `}
                >
                    {isPlaying ? (
                        // Pause Icon
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                            <rect x="6" y="4" width="4" height="16" />
                            <rect x="14" y="4" width="4" height="16" />
                        </svg>
                    ) : (
                        // Play Icon
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="ml-0.5">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    )}
                </button>

                {/* Track Info (Revealed on Hover) */}
                <div className={`
          flex flex-col whitespace-nowrap transition-opacity duration-200
          ${isHovered ? 'opacity-100' : 'opacity-0 w-0'}
        `}>
                    <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-mono font-bold text-neo-yellow animate-pulse">
                            {isPlaying ? 'NOW PLAYING' : 'PAUSED'}
                        </span>
                        <div className="h-[1px] flex-1 bg-white/20"></div>
                    </div>
                    <div className="text-xs font-mono text-white font-bold truncate">Oressa</div>
                    <a
                        href="https://youtu.be/OflhtmpNg-Y"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-mono text-gray-400 hover:text-neo-yellow transition-colors truncate"
                    >
                        How To Disappear Completely ↗
                    </a>
                </div>
            </div>

            {/* Hidden Audio Element */}
            <audio
                ref={audioRef}
                src="/How To Disappear Completely - Oressa.mp3"
                loop
            />
        </div>
    );
};

export default AudioPlayer;
