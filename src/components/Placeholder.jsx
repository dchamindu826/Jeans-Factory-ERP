import React from 'react';

export default function Placeholder({ title }) {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">{title}</h1>
        <p className="text-slate-400 mt-2 text-lg">This section is currently under development.</p>
      </header>
      
      <div className="glass-card p-12 flex flex-col items-center justify-center min-h-[500px] border-dashed border-2 border-slate-700/50 bg-slate-800/10 relative overflow-hidden group">
        <div className="absolute inset-0 bg-brand-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
        
        <div className="relative z-10 text-center">
          <div className="text-brand-500/40 mb-6 bg-brand-500/10 w-24 h-24 mx-auto rounded-3xl flex items-center justify-center border border-brand-500/20 group-hover:scale-110 group-hover:text-brand-400 group-hover:border-brand-500/40 transition-all duration-500">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">{title} Module</h2>
          <p className="text-slate-400 text-center max-w-md mx-auto text-lg">
            The beautiful glassmorphism features for the {title.toLowerCase()} module will be implemented here.
          </p>
        </div>
      </div>
    </div>
  );
}
