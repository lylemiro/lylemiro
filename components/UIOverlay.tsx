import React from 'react';
import { ColorScheme } from '../types';

interface UIOverlayProps {
  minimalMode: boolean;
  toggleMinimalMode: () => void;
  cycleColor: () => void;
  currentColor: ColorScheme;
}

const UIOverlay: React.FC<UIOverlayProps> = ({
  minimalMode,
  toggleMinimalMode,
  cycleColor,
  currentColor
}) => {
  return (
    <>
      {/* Decorative HUD Lines */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-30 p-4 box-border hidden md:block opacity-50">
        <div className="w-full h-full border border-white/10 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[1px] bg-white/50"></div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-[1px] bg-white/50"></div>
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-32 w-[1px] bg-white/50"></div>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 h-32 w-[1px] bg-white/50"></div>
        </div>
      </div>

      {/* Top Bar */}
      <header className="fixed top-0 left-0 w-full z-40 p-4 md:p-6 flex flex-col items-center md:flex-row md:justify-between md:items-start pointer-events-none mix-blend-difference">
        <div className="pointer-events-auto text-center md:text-left mb-2 md:mb-0">
          <h1 className="text-xl md:text-xl font-bold tracking-tighter leading-none text-neo-white">
            LYLE CHRISTIAN MIRO<br />
            <span className="hidden md:inline text-xs font-mono font-normal opacity-70 text-neo-yellow">// CREATIVE_DEV_UNIT_01</span>
          </h1>
        </div>

        <div className="pointer-events-auto flex flex-col items-center md:items-end gap-1 md:gap-2 text-center md:text-right">
          <a href="mailto:lylemirounabia@gmail.com" className="text-xs md:text-sm font-mono hover:bg-neo-yellow hover:text-black px-2 transition-colors border border-transparent hover:border-neo-yellow">
            [ INITIATE_COMMS ]
          </a>
          <div className="hidden md:block text-[10px] font-mono text-gray-400">
            SYS.VER.2025.1.0<br />
            STATUS: <span className="text-green-500 animate-pulse">ONLINE</span>
          </div>
        </div>
      </header>

      {/* Control Panel (Bottom Right) */}
      <div className="fixed bottom-8 right-8 z-40 flex flex-col gap-4 items-end">
        {/* Color Cycle Button */}
        <button
          onClick={cycleColor}
          className="pointer-events-auto group flex items-center gap-3"
          aria-label="Change Accent Color"
        >
          <span className="text-[10px] uppercase bg-black text-white px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/50 font-mono">
            THEME :: {currentColor.name}
          </span>
          <div
            className="w-8 h-8 md:w-10 md:h-10 border-2 border-white transition-all active:scale-95 hover:rotate-45"
            style={{ backgroundColor: currentColor.hex, boxShadow: `0 0 10px ${currentColor.hex}` }}
          >
          </div>
        </button>

        {/* Minimal Mode Toggle */}
        <button
          onClick={toggleMinimalMode}
          className="pointer-events-auto flex items-center justify-center px-4 py-2 border border-white/50 bg-black/80 backdrop-blur-sm text-[10px] uppercase font-mono tracking-widest hover:bg-neo-yellow hover:text-black transition-colors min-w-[140px]"
        >
          {minimalMode ? "[ RENDER_3D ]" : "[ TERMINAL_MODE ]"}
        </button>
      </div>

      {/* Scroll Indicator */}
      <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-40 pointer-events-none mix-blend-difference hidden md:flex flex-col items-center">
        <div className="w-[1px] h-20 bg-neo-yellow/20 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-neo-yellow animate-scroll-line"></div>
        </div>
      </div>
    </>
  );
};

export default UIOverlay;