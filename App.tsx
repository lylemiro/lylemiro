import React, { useState, useEffect } from 'react';
import ThreeScene from './components/ThreeScene';
import ProjectCard from './components/ProjectCard';
import CustomCursor from './components/CustomCursor';
import UIOverlay from './components/UIOverlay';
import LoadingScreen from './components/LoadingScreen';
import AudioPlayer from './components/AudioPlayer';
import { PROJECTS, ACCENT_COLORS } from './constants';
import { ColorScheme } from './types';

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [minimalMode, setMinimalMode] = useState(false);
  const [colorIndex, setColorIndex] = useState(0);
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);

  // Stabilize viewport height for mobile browsers
  useEffect(() => {
    let lastWidth = window.innerWidth;
    const updateHeight = () => {
      const vh = window.innerHeight;
      const vw = window.innerWidth;

      // If width changed significantly (orientation change), reset height lock
      if (Math.abs(vw - lastWidth) > 50) {
        document.documentElement.style.setProperty('--app-height', `${vh}px`);
        lastWidth = vw;
        return;
      }

      // Lock to the LARGEST height seen (prevents nav bar squashing)
      const currentHeight = parseFloat(document.documentElement.style.getPropertyValue('--app-height') || '0');
      if (vh > currentHeight) {
        document.documentElement.style.setProperty('--app-height', `${vh}px`);
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  // Initialize CSS variables for accent color
  useEffect(() => {
    const color = ACCENT_COLORS[colorIndex];
    document.documentElement.style.setProperty('--accent-color', color.hex);
  }, [colorIndex]);

  // Handle Scroll Indicator Visibility
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      // Hide if within 100px of bottom
      setShowScrollIndicator(scrollPosition < documentHeight - 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const cycleColor = () => {
    setColorIndex((prev) => (prev + 1) % ACCENT_COLORS.length);
  };


  const handleLoadingComplete = () => {
    setLoading(false);
  };

  return (
    <div className={`relative min-h-screen w-full selection:bg-neo-yellow selection:text-black cursor-none ${minimalMode ? 'minimal-mode' : ''}`}>

      {loading && <LoadingScreen onComplete={handleLoadingComplete} />}

      {/* Custom Cursor */}
      {!minimalMode && !loading && <CustomCursor />}

      {/* Audio Player */}
      <AudioPlayer />

      {/* Background 3D Scene */}
      <ThreeScene minimalMode={minimalMode} />

      {/* Main Content - Only visible after loading */}
      <div className={`transition-opacity duration-1000 ${loading ? 'opacity-0' : 'opacity-100'}`}>
        {/* UI Overlay (Fixed) */}
        <UIOverlay
          minimalMode={minimalMode}
          toggleMinimalMode={() => setMinimalMode(!minimalMode)}
          cycleColor={cycleColor}
          currentColor={ACCENT_COLORS[colorIndex]}
          showScrollIndicator={showScrollIndicator}
        />

        {/* Main Scroll Content */}
        <main className="relative z-10 w-full pt-[100vh]">

          {/* Intro Text Section */}
          <section className="min-h-[60vh] flex flex-col justify-center items-start px-6 md:px-20 max-w-5xl mx-auto mb-32">
            <div className="bg-black/80 backdrop-blur-md border border-white/10 p-8 md:p-12 shadow-[8px_8px_0px_0px_var(--accent-color)] border-l-4 border-l-neo-yellow">
              <h2 className="text-2xl md:text-4xl font-mono mb-8 uppercase leading-tight">
                Multidisciplinary <span className="text-neo-yellow glitch-hover">Virtual Assistant</span>
              </h2>
              <p className="font-mono text-sm md:text-base text-gray-300 max-w-2xl leading-relaxed">
                Highly adaptable IT graduate with 10+ years of graphic design expertise and 5+ years in eCommerce and Shopify management. Combines technical proficiency with creative execution to streamline administrative and digital operations.
                <br /><br />
                Trained in the Google AI Ecosystem to enhance workflow efficiency and content generation in fast-paced environments.
              </p>
            </div>
          </section>

          {/* Projects Grid */}
          <section className="px-6 md:px-20 pb-32 max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-16">
              <div className="h-[2px] w-12 bg-neo-yellow"></div>
              <h3 className="text-xl font-mono uppercase tracking-widest">Portfolio & Projects</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
              {PROJECTS.map((project, index) => (
                <div key={project.id} className={index % 2 !== 0 ? 'md:mt-24' : ''}>
                  <ProjectCard project={project} index={index} />
                </div>
              ))}
            </div>
          </section>

          {/* Hobbies & Interests Section */}
          <section className="w-full pb-8 overflow-hidden relative z-10">
            <div className="flex items-center gap-4 mb-8 px-6 md:px-20 max-w-7xl mx-auto">
              <div className="h-[2px] w-12 bg-neo-yellow"></div>
              <h3 className="text-xl font-mono uppercase tracking-widest text-neo-white">Hobbies & Interests</h3>
            </div>

            <div className="flex overflow-x-auto md:flex-nowrap items-center md:justify-center gap-12 md:gap-24 bg-black/40 backdrop-blur-sm border-y border-white/10 p-8 md:p-12 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] no-scrollbar">
              {/* BIBLE */}
              <div className="flex flex-col items-center gap-4 group flex-shrink-0">
                <lord-icon
                  src="https://cdn.lordicon.com/lqwwyuxv.json"
                  trigger="hover"
                  colors="primary:#ffffff,secondary:#FF5F1F"
                  className="w-[50px] h-[50px] md:w-[100px] md:h-[100px]"
                  style={{ width: 'var(--icon-size, 50px)', height: 'var(--icon-size, 50px)' }}>
                </lord-icon>
                <span className="font-mono text-[10px] uppercase tracking-widest text-gray-400 group-hover:text-neo-yellow transition-colors">Religion</span>
              </div>

              {/* MUSIC */}
              <div className="flex flex-col items-center gap-4 group flex-shrink-0">
                <lord-icon
                  src="https://cdn.lordicon.com/gcupmfyg.json"
                  trigger="hover"
                  colors="primary:#ffffff,secondary:#FF5F1F"
                  className="w-[50px] h-[50px] md:w-[100px] md:h-[100px]"
                  style={{ width: 'var(--icon-size, 50px)', height: 'var(--icon-size, 50px)' }}>
                </lord-icon>
                <span className="font-mono text-[10px] uppercase tracking-widest text-gray-400 group-hover:text-neo-yellow transition-colors">Music</span>
              </div>

              {/* PHILOSOPHY */}
              <div className="flex flex-col items-center gap-4 group flex-shrink-0">
                <lord-icon
                  src="https://cdn.lordicon.com/ypnsnhgh.json"
                  trigger="hover"
                  colors="primary:#ffffff,secondary:#FF5F1F"
                  className="w-[50px] h-[50px] md:w-[100px] md:h-[100px]"
                  style={{ width: 'var(--icon-size, 50px)', height: 'var(--icon-size, 50px)' }}>
                </lord-icon>
                <span className="font-mono text-[10px] uppercase tracking-widest text-gray-400 group-hover:text-neo-yellow transition-colors">Philosophy</span>
              </div>

              {/* TECHNOLOGY */}
              <div className="flex flex-col items-center gap-4 group flex-shrink-0">
                <lord-icon
                  src="https://cdn.lordicon.com/nfuackpv.json"
                  trigger="hover"
                  colors="primary:#ffffff,secondary:#FF5F1F"
                  className="w-[50px] h-[50px] md:w-[100px] md:h-[100px]"
                  style={{ width: 'var(--icon-size, 50px)', height: 'var(--icon-size, 50px)' }}>
                </lord-icon>
                <span className="font-mono text-[10px] uppercase tracking-widest text-gray-400 group-hover:text-neo-yellow transition-colors">Tech</span>
              </div>

              {/* CREATIVE */}
              <div className="flex flex-col items-center gap-4 group flex-shrink-0">
                <lord-icon
                  src="https://cdn.lordicon.com/jectmwqf.json"
                  trigger="hover"
                  colors="primary:#ffffff,secondary:#FF5F1F"
                  className="w-[50px] h-[50px] md:w-[100px] md:h-[100px]"
                  style={{ width: 'var(--icon-size, 50px)', height: 'var(--icon-size, 50px)' }}>
                </lord-icon>
                <span className="font-mono text-[10px] uppercase tracking-widest text-gray-400 group-hover:text-neo-yellow transition-colors">Creative</span>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="w-full bg-neo-black border-t border-white/20 py-20 px-6 md:px-20 mt-0 relative z-[9999]">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <h2 className="text-5xl md:text-7xl font-black text-transparent stroke-white text-outline mb-8 hover:text-neo-yellow hover:stroke-neo-yellow transition-all cursor-pointer">
                  LET'S TALK
                </h2>
                <div className="flex flex-col gap-2 font-mono text-sm text-gray-400">
                  <a href="mailto:lylemirounabia@gmail.com" className="hover:text-neo-yellow hover:translate-x-2 transition-transform uppercase">LYLEMIROUNABIA@GMAIL.COM</a>
                  <a href="https://behance.net/lylemiro" target="_blank" rel="noopener noreferrer" className="hover:text-neo-yellow hover:translate-x-2 transition-transform uppercase">BEHANCE.NET/LYLEMIRO</a>
                  <a href="https://linkedin.com/in/lylemiro" target="_blank" rel="noopener noreferrer" className="hover:text-neo-yellow hover:translate-x-2 transition-transform uppercase">LINKEDIN.COM/IN/LYLEMIRO</a>
                </div>
              </div>
              <div className="flex flex-col justify-end items-start md:items-end">
                <p className="font-mono text-xs text-gray-500 uppercase max-w-2xl text-left md:text-right leading-relaxed">
                  Designed by Lyle Christian Miro.<br />
                  Powered by React, Three.js & GSAP. © 2025
                </p>
              </div>
            </div>
          </footer>

        </main>
      </div>
    </div>
  );
};

export default App;