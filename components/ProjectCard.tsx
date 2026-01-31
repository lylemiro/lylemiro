import React from 'react';
import { Project } from '../types';

interface ProjectCardProps {
  project: Project;
  index: number;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, index }) => {
  return (
    <div className="group relative bg-neo-black border border-white/20 hover:border-neo-yellow transition-all duration-300 p-6 md:p-8 flex flex-col h-full overflow-hidden shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] hover:shadow-[8px_8px_0px_0px_var(--accent-color)]">

      {/* Retro Diagonal Stripe Background */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none"
        style={{
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, var(--accent-color) 10px, var(--accent-color) 11px)'
        }}
      />

      {/* Glitch Overlay (Active on Hover) */}
      <div className="absolute inset-0 bg-neo-yellow opacity-0 mix-blend-overlay group-hover:animate-pulse pointer-events-none" />

      {/* Header: ID and Number */}
      <div className="flex justify-between items-start mb-8 relative z-10">
        <span className="text-4xl md:text-6xl font-black text-transparent stroke-white text-outline font-mono opacity-50 group-hover:opacity-100 group-hover:text-neo-yellow group-hover:stroke-neo-yellow transition-all duration-300 group-hover:skew-x-6">
          {project.number}
        </span>
        <div className="text-[10px] border border-white px-2 py-1 uppercase tracking-widest bg-black text-white group-hover:bg-neo-yellow group-hover:text-black transition-colors">
          {project.role}
        </div>
      </div>

      {/* Content */}
      <div className="flex-grow relative z-10">
        <h3 className="text-2xl md:text-3xl font-bold mb-4 uppercase text-neo-white group-hover:text-neo-yellow transition-colors group-hover:translate-x-2 duration-300">
          {project.title}
          {project.subtitle && (
            <span className="block text-xs md:text-sm font-mono opacity-50 font-normal mt-1 normal-case">
              {project.subtitle}
            </span>
          )}
        </h3>
        <p className="text-sm md:text-base text-gray-400 font-mono leading-relaxed mb-6 border-l-2 border-white/20 pl-4 group-hover:border-neo-yellow">
          {project.description}
        </p>
      </div>

      {/* Tech Stack */}
      <div className="relative z-10 mt-auto">
        <div className="flex flex-wrap gap-2 mb-6">
          {project.tech.map((t) => (
            <span key={t} className="text-[10px] bg-white/5 border border-white/10 px-2 py-1 text-gray-300 font-mono uppercase group-hover:border-neo-yellow/50 group-hover:text-neo-yellow">
              {t}
            </span>
          ))}
        </div>

        {/* Action Button */}
        <a
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full border-2 border-white py-3 uppercase font-bold text-sm tracking-wider hover:bg-neo-yellow hover:text-black hover:border-neo-yellow transition-all flex items-center justify-center gap-2 group-hover:translate-x-1 group-hover:-translate-y-1 block decoration-none text-center"
        >
          <span>Initialize</span>
          <span className="text-lg">→</span>
        </a>
      </div>

      {/* Corner Accents - HUD Style */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-white group-hover:border-neo-yellow transition-colors" />
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-white group-hover:border-neo-yellow transition-colors" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-white group-hover:border-neo-yellow transition-colors" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-white group-hover:border-neo-yellow transition-colors" />
    </div>
  );
};

export default ProjectCard;