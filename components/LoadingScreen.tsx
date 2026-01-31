import React, { useEffect, useState } from 'react';

const LoadingScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [text, setText] = useState("INITIALIZING...");

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + Math.random() * 5;
        if (next >= 100) {
          clearInterval(interval);
          return 100;
        }
        return next;
      });
    }, 40);

    // Glitch text changes
    const textInterval = setInterval(() => {
      const phrases = [
        "LOADING ASSETS...",
        "DECRYPTING DATA...",
        "ESTABLISHING LINK...",
        "LOADING LYLEMIRO...",
        "RENDERING WORLD...",
        "SYSTEM CHECK..."
      ];
      setText(phrases[Math.floor(Math.random() * phrases.length)]);
    }, 400);

    return () => {
      clearInterval(interval);
      clearInterval(textInterval);
    };
  }, []);



  return (
    <div className="fixed inset-0 z-[10000] bg-neo-black flex flex-col items-center justify-center font-mono select-none cursor-wait">
      <div className="relative mb-8 text-center">
        {/* Dynamic Glitched Title */}
        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter relative inline-block whitespace-nowrap">
          <span className="absolute top-0 left-0 -ml-[2px] text-neo-yellow opacity-70"
            style={{
              clipPath: 'polygon(0 0, 100% 0, 100% 45%, 0 45%)',
              animation: 'glitch 0.3s infinite linear alternate-reverse'
            }}>
            {text}
          </span>
          <span className="absolute top-0 left-0 ml-[2px] text-cyan-400 opacity-70"
            style={{
              clipPath: 'polygon(0 60%, 100% 60%, 100% 100%, 0 100%)',
              animation: 'glitch 0.3s infinite linear alternate'
            }}>
            {text}
          </span>
          {text}
        </h1>
      </div>

      {/* Progress Bar */}
      <div className="w-64 md:w-96 h-4 border-2 border-white p-1 mb-4 relative overflow-hidden bg-black/50">
        <div
          className="h-full bg-neo-yellow transition-all duration-75 ease-out relative"
          style={{ width: `${Math.min(progress, 100)}%` }}
        >
          {/* Striped pattern for bar */}
          <div className="absolute inset-0 w-full h-full"
            style={{ backgroundImage: 'linear-gradient(45deg,rgba(0,0,0,0.2) 25%,transparent 25%,transparent 50%,rgba(0,0,0,0.2) 50%,rgba(0,0,0,0.2) 75%,transparent 75%,transparent)', backgroundSize: '10px 10px' }}
          />
        </div>
      </div>

      {/* Status & Action */}
      <div className="flex flex-col items-center w-64 md:w-96">
        {progress < 100 ? (
          <div className="flex justify-between w-full text-xs md:text-sm font-bold text-gray-400">
            <span className="animate-pulse">SYSTEM_LOADING</span>
            <span className="text-neo-yellow">{Math.floor(progress)}%</span>
          </div>
        ) : (
          <button
            onClick={onComplete}
            className="w-full bg-neo-yellow text-black py-4 font-black uppercase tracking-widest hover:bg-white transition-all transform hover:scale-105 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)] animate-bounce"
          >
            [ INITIATE_SYSTEM ]
          </button>
        )}
      </div>

      {/* Decorative corners */}
      <div className="absolute top-8 left-8 w-16 h-16 border-t-4 border-l-4 border-white opacity-50"></div>
      <div className="absolute bottom-8 right-8 w-16 h-16 border-b-4 border-r-4 border-white opacity-50"></div>
    </div>
  );
};

export default LoadingScreen;