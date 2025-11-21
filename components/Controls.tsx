
import React, { useState } from 'react';

interface ControlsProps {
  mass: number;
  setMass: (val: number) => void;
  bgUrl: string;
  setBgUrl: (val: string) => void;
  isAutoMode: boolean;
  setIsAutoMode: (val: boolean) => void;
}

const IMAGE_OPTIONS = [
  { name: 'Galaxy Cluster', url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80' },
  { name: 'Nebula', url: 'https://images.unsplash.com/photo-1543722530-d2c3201371e7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80' },
  { name: 'Milky Way', url: 'https://images.unsplash.com/photo-1538370965046-79c0d6907d47?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80' },
];

const Controls: React.FC<ControlsProps> = ({
  mass,
  setMass,
  bgUrl,
  setBgUrl,
  isAutoMode,
  setIsAutoMode
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Toggle Button (Visible when closed) */}
      <button 
        onClick={() => setIsOpen(true)}
        className={`absolute top-6 left-6 z-20 flex items-center gap-3 bg-black/30 hover:bg-black/50 backdrop-blur-xl border border-white/10 px-5 py-3 rounded-full text-white transition-all duration-500 group ${isOpen ? 'opacity-0 -translate-x-full pointer-events-none' : 'opacity-100 translate-x-0'}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-90 transition-transform duration-500 text-purple-400">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
        <span className="text-sm font-bold tracking-widest uppercase bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Settings</span>
      </button>

      {/* Backdrop for mobile */}
      <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-20 transition-opacity duration-500 md:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      />

      {/* Main Controls Panel */}
      <div className={`absolute z-30 flex flex-col bg-[#050505]/90 backdrop-blur-2xl border border-white/10 shadow-2xl transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1)
          /* Mobile: Bottom Sheet */
          bottom-0 left-0 right-0 w-full rounded-t-[2rem] border-b-0
          ${isOpen ? 'translate-y-0' : 'translate-y-full'}

          /* Desktop: Floating Sidebar */
          md:top-6 md:left-6 md:bottom-auto md:right-auto md:w-[340px] md:rounded-[2rem] md:border-b
          md:${isOpen ? 'translate-x-0 opacity-100' : '-translate-x-[120%] opacity-0'}
      `}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-white/5">
          <div>
            <h2 className="text-xl font-black text-white tracking-tighter">
              EVENT <span className="text-purple-500">HORIZON</span>
            </h2>
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em] mt-0.5">Simulation Engine</p>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/20 text-gray-400 hover:text-white transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-8 max-h-[70vh] overflow-y-auto md:max-h-none">
            
            {/* Control Mode */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Input Mode</label>
                </div>
                <div className="grid grid-cols-2 gap-1.5 bg-white/5 p-1.5 rounded-xl">
                    <button
                        onClick={() => setIsAutoMode(false)}
                        className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all duration-300 ${!isAutoMode ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3h18v18H3zM12 8v8M8 12h8"/></svg>
                        MANUAL
                    </button>
                    <button
                        onClick={() => setIsAutoMode(true)}
                        className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all duration-300 ${isAutoMode ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                        ORBIT
                    </button>
                </div>
            </div>

            {/* Mass Control */}
            <div className="space-y-4">
                <div className="flex justify-between items-end">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Singularity Mass</label>
                    <div className="text-purple-400 font-mono text-sm bg-purple-500/10 px-2 py-0.5 rounded">{mass.toFixed(0)}</div>
                </div>
                <div className="relative h-6 flex items-center group">
                    <div className="absolute w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-gradient-to-r from-purple-600 to-blue-500 transition-all duration-100" 
                            style={{ width: `${(mass / 5000) * 100}%` }}
                        />
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="5000"
                        step="50"
                        value={mass}
                        onChange={(e) => setMass(Number(e.target.value))}
                        className="w-full h-1.5 absolute opacity-0 cursor-pointer z-10"
                    />
                    <div 
                        className="w-4 h-4 bg-white rounded-full shadow-lg shadow-purple-500/50 absolute pointer-events-none transition-all duration-100 group-hover:scale-125"
                        style={{ left: `calc(${(mass / 5000) * 100}% - 8px)` }}
                    />
                </div>
            </div>

            {/* Background Selection */}
            <div className="space-y-3">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Environment</label>
                <div className="grid grid-cols-2 gap-3">
                    {IMAGE_OPTIONS.map((opt) => (
                        <button
                            key={opt.name}
                            onClick={() => setBgUrl(opt.url)}
                            className={`relative group overflow-hidden rounded-xl border transition-all duration-300 ${
                                bgUrl === opt.url 
                                ? 'border-purple-500 ring-1 ring-purple-500/50 opacity-100' 
                                : 'border-white/5 opacity-50 hover:opacity-100 hover:border-white/20'
                            }`}
                        >
                            <div className="aspect-[16/9]">
                                <img src={opt.url} alt={opt.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2">
                                <span className="text-[10px] font-bold text-white uppercase tracking-wide">{opt.name}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5 bg-white/[0.02]">
             <p className="text-[10px] text-center text-gray-500 leading-relaxed">
                Adjust mass to bend light. Use mouse to drag the event horizon.
             </p>
        </div>

      </div>
    </>
  );
};

export default Controls;
