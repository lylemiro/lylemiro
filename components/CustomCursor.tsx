import React, { useEffect, useState, useRef } from 'react';
import { CursorState } from '../types';

const CustomCursor: React.FC = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [cursorState, setCursorState] = useState<CursorState>(CursorState.DEFAULT);
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const onMouseDown = () => setCursorState(CursorState.CLICK);
    const onMouseUp = () => setCursorState(CursorState.DEFAULT);

    // Global listener for hoverable elements
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive = target.matches('a, button, input, [role="button"]') || target.closest('a, button, [role="button"]');
      if (isInteractive) {
        setCursorState(CursorState.HOVER);
      } else {
        setCursorState(CursorState.DEFAULT);
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  const getCursorStyles = () => {
    switch (cursorState) {
      case CursorState.HOVER:
        // Scale up and use difference mode
        return 'scale-125 bg-neo-yellow mix-blend-difference';
      case CursorState.CLICK:
        // White flash
        return 'scale-90 bg-white';
      default:
        // Default Plasma Orange (mapped to neo-yellow)
        return 'bg-neo-yellow mix-blend-difference';
    }
  };

  return (
    <div
      ref={cursorRef}
      className={`fixed top-0 left-0 w-7 h-7 pointer-events-none z-[9999] transition-transform duration-100 ease-out flex items-start justify-start origin-top-left`}
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
      }}
    >
      {/* 
          Intermediate Triangle Shape 
          polygon(0 0, 100% 30%, 30% 100%) - Balanced width
      */}
      <div
        className={`w-full h-full transition-all duration-200 origin-top-left ${getCursorStyles()}`}
        style={{ clipPath: 'polygon(0 0, 100% 30%, 30% 100%)' }}
      />

      {/* Label - Positioned relative to new size */}
      {cursorState === CursorState.HOVER && (
        <div className="absolute top-7 left-7 bg-black text-[8px] text-white px-2 py-1 font-mono border border-white/20 whitespace-nowrap z-[10000]">
          SELECT
        </div>
      )}
    </div>
  );
};

export default CustomCursor;