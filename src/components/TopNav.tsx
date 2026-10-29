import React from 'react';
import { Briefcase, LayoutGrid, FileText, SlidersHorizontal, RefreshCw, Sparkles } from 'lucide-react';

interface TopNavProps {
  activeTab: 'scanner' | 'tracker' | 'resume' | 'preferences';
  onSelectTab: (tab: 'scanner' | 'tracker' | 'resume' | 'preferences') => void;
  trackedCount: number;
  availableJobsCount: number;
  onTriggerScan: () => void;
  isScanning: boolean;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  onSelectTab,
  trackedCount,
  availableJobsCount,
  onTriggerScan,
  isScanning,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-30">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-semibold text-sm">
          AP
        </div>
        <button
          onClick={() => onSelectTab('scanner')}
          className="text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 hover:text-slate-200 transition-colors flex items-center gap-2 text-left"
        >
          <span>ApplyPulse</span>
          <span className="text-xs font-normal text-slate-400 tracking-normal hidden sm:inline">
            Auto-Apply Suite
          </span>
        </button>
      </div>

      {/* Zone 2: 4 concise single-line text navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
        <button
          onClick={() => onSelectTab('scanner')}
          className={`flex items-center gap-2 whitespace-nowrap shrink-0 transition-colors py-1 ${
            activeTab === 'scanner'
              ? 'text-emerald-400 font-semibold'
              : 'hover:text-slate-200'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Job Scanner</span>
          <span className="text-xs text-slate-500 tabular-nums">({availableJobsCount})</span>
        </button>

        <button
          onClick={() => onSelectTab('tracker')}
          className={`flex items-center gap-2 whitespace-nowrap shrink-0 transition-colors py-1 ${
            activeTab === 'tracker'
              ? 'text-emerald-400 font-semibold'
              : 'hover:text-slate-200'
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          <span>Application Pipeline</span>
          <span className="text-xs text-slate-500 tabular-nums">({trackedCount})</span>
        </button>

        <button
          onClick={() => onSelectTab('resume')}
          className={`flex items-center gap-2 whitespace-nowrap shrink-0 transition-colors py-1 ${
            activeTab === 'resume'
              ? 'text-emerald-400 font-semibold'
              : 'hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>My Resume & Skills</span>
        </button>

        <button
          onClick={() => onSelectTab('preferences')}
          className={`flex items-center gap-2 whitespace-nowrap shrink-0 transition-colors py-1 ${
            activeTab === 'preferences'
              ? 'text-emerald-400 font-semibold'
              : 'hover:text-slate-200'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Auto-Apply Rules</span>
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onTriggerScan}
          disabled={isScanning}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 rounded-lg hover:bg-emerald-300 active:bg-emerald-500 transition-colors whitespace-nowrap shrink-0 disabled:opacity-60 shadow-sm shadow-emerald-500/20"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
          <span>{isScanning ? 'Scanning Boards...' : 'Run Scanner'}</span>
        </button>
      </div>
    </header>
  );
};
