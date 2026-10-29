import React, { useState } from 'react';
import {
  SlidersHorizontal,
  Check,
  Plus,
  Trash2,
  DollarSign,
  Building,
  Target,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { PreferenceSettings, WorkMode, JobBoardType, JobOpening } from '../types';
import { DEFAULT_PREFERENCES } from '../data/mockData';

interface PreferencesManagerProps {
  preferences: PreferenceSettings;
  onUpdatePreferences: (preferences: PreferenceSettings) => void;
  jobs: JobOpening[];
  onShowToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export const PreferencesManager: React.FC<PreferencesManagerProps> = ({
  preferences,
  onUpdatePreferences,
  jobs,
  onShowToast,
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [newExcluded, setNewExcluded] = useState('');

  const handleAddTitle = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    if (!newTitle.trim()) return;
    if (!preferences.targetTitles.includes(newTitle.trim())) {
      onUpdatePreferences({
        ...preferences,
        targetTitles: [...preferences.targetTitles, newTitle.trim()],
      });
      onShowToast(`Added target role: ${newTitle.trim()}`, 'success');
    }
    setNewTitle('');
  };

  const handleRemoveTitle = (title: string) => {
    onUpdatePreferences({
      ...preferences,
      targetTitles: preferences.targetTitles.filter((t) => t !== title),
    });
  };

  const handleAddExcluded = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    if (!newExcluded.trim()) return;
    if (!preferences.excludedKeywords.includes(newExcluded.trim())) {
      onUpdatePreferences({
        ...preferences,
        excludedKeywords: [...preferences.excludedKeywords, newExcluded.trim()],
      });
      onShowToast(`Added excluded keyword: ${newExcluded.trim()}`, 'info');
    }
    setNewExcluded('');
  };

  const handleRemoveExcluded = (kw: string) => {
    onUpdatePreferences({
      ...preferences,
      excludedKeywords: preferences.excludedKeywords.filter((k) => k !== kw),
    });
  };

  const handleToggleBoard = (board: JobBoardType) => {
    const exists = preferences.preferredJobBoards.includes(board);
    const updated = exists
      ? preferences.preferredJobBoards.filter((b) => b !== board)
      : [...preferences.preferredJobBoards, board];
    onUpdatePreferences({
      ...preferences,
      preferredJobBoards: updated,
    });
  };

  // Calculate jobs matching currently configured criteria
  const matchingJobsCount = jobs.filter((job) => {
    if (preferences.workMode !== 'All' && job.workMode !== preferences.workMode) return false;
    if (preferences.minSalary && job.minSalary < preferences.minSalary) return false;
    if (preferences.excludedKeywords?.length) {
      const fullText = `${job.title} ${job.description}`.toLowerCase();
      if (preferences.excludedKeywords.some((kw) => fullText.includes(kw.toLowerCase()))) {
        return false;
      }
    }
    return true;
  }).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-emerald-400" />
            <span>Auto-Apply & Scanning Preference Rules</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            ApplyPulse scans job boards continuously and automatically flags openings meeting your exact target parameters.
          </p>
        </div>

        <div className="px-4 py-2 bg-slate-950 rounded-xl border border-slate-800 text-right">
          <div className="text-xs text-slate-400">Current Catalog Matches</div>
          <div className="text-lg font-bold font-mono text-emerald-400 tabular-nums">
            {matchingJobsCount} / {jobs.length} roles
          </div>
        </div>
      </div>

      {/* Main Settings Card */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
        {/* Target Job Titles */}
        <div>
          <label className="text-xs font-semibold text-slate-200 block mb-1">
            Target Job Roles & Titles
          </label>
          <p className="text-xs text-slate-500 mb-3">
            Jobs containing these titles receive priority match scoring and automated cover letter drafting.
          </p>

          <div className="flex flex-wrap items-center gap-2 mb-3">
            {preferences.targetTitles.map((title) => (
              <span
                key={title}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200"
              >
                <span>{title}</span>
                <button
                  onClick={() => handleRemoveTitle(title)}
                  className="text-slate-500 hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2 max-w-sm">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={handleAddTitle}
              placeholder="e.g. Lead Architect, Engineering Manager"
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50 flex-1"
            />
            <button
              onClick={handleAddTitle}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors border border-slate-700 flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Work Mode & Compensation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
          <div>
            <label className="text-xs font-semibold text-slate-200 block mb-1">
              Work Arrangement Preference
            </label>
            <p className="text-xs text-slate-500 mb-3">Filter by geographical flexibility.</p>
            <div className="grid grid-cols-4 gap-2">
              {(['All', 'Remote', 'Hybrid', 'On-site'] as WorkMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => onUpdatePreferences({ ...preferences, workMode: mode })}
                  className={`py-2 px-3 text-xs rounded-lg border text-center transition-colors ${
                    preferences.workMode === mode
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 font-semibold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-200 block mb-1">
              Minimum Base Compensation
            </label>
            <p className="text-xs text-slate-500 mb-2">
              Exclude listings below this annual salary threshold:
            </p>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="100000"
                max="250000"
                step="5000"
                value={preferences.minSalary}
                onChange={(e) =>
                  onUpdatePreferences({
                    ...preferences,
                    minSalary: parseInt(e.target.value, 10),
                  })
                }
                className="flex-1 accent-emerald-400 cursor-pointer"
              />
              <span className="font-mono text-xs font-bold text-emerald-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 tabular-nums">
                ${preferences.minSalary.toLocaleString()} / yr
              </span>
            </div>
          </div>
        </div>

        {/* Minimum Match Score Threshold */}
        <div className="pt-4 border-t border-slate-800">
          <label className="text-xs font-semibold text-slate-200 block mb-1">
            Automated Match Threshold
          </label>
          <p className="text-xs text-slate-500 mb-3">
            Jobs with a match score above this percentage automatically get custom cover letters pre-drafted.
          </p>
          <div className="flex items-center gap-3 max-w-md">
            <input
              type="range"
              min="50"
              max="95"
              step="5"
              value={preferences.minMatchScore}
              onChange={(e) =>
                onUpdatePreferences({
                  ...preferences,
                  minMatchScore: parseInt(e.target.value, 10),
                })
              }
              className="flex-1 accent-emerald-400 cursor-pointer"
            />
            <span className="font-mono text-xs font-bold text-slate-200 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 tabular-nums">
              &ge; {preferences.minMatchScore}% Match
            </span>
          </div>
        </div>

        {/* Excluded Keywords */}
        <div className="pt-4 border-t border-slate-800">
          <label className="text-xs font-semibold text-slate-200 block mb-1">
            Negative Keywords (Instant Exclusion)
          </label>
          <p className="text-xs text-slate-500 mb-3">
            Exclude any openings containing these buzzwords, technologies, or restrictions.
          </p>

          <div className="flex flex-wrap items-center gap-2 mb-3">
            {preferences.excludedKeywords.map((kw) => (
              <span
                key={kw}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs text-rose-300"
              >
                <span>{kw}</span>
                <button
                  onClick={() => handleRemoveExcluded(kw)}
                  className="text-slate-500 hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2 max-w-sm">
            <input
              type="text"
              value={newExcluded}
              onChange={(e) => setNewExcluded(e.target.value)}
              onKeyDown={handleAddExcluded}
              placeholder="e.g. Clearance Required, PHP 5, Sales"
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500/50 flex-1"
            />
            <button
              onClick={handleAddExcluded}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors border border-slate-700 flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>Exclude</span>
            </button>
          </div>
        </div>

        {/* Preferred Job Boards */}
        <div className="pt-4 border-t border-slate-800">
          <label className="text-xs font-semibold text-slate-200 block mb-1">
            Scanned Application Portals
          </label>
          <p className="text-xs text-slate-500 mb-3">
            Toggle which platforms ApplyPulse scans for matching openings.
          </p>

          <div className="flex flex-wrap items-center gap-2">
            {(['Greenhouse', 'Lever', 'LinkedIn', 'Workday', 'Direct'] as JobBoardType[]).map(
              (board) => {
                const isSelected = preferences.preferredJobBoards.includes(board);
                return (
                  <button
                    key={board}
                    onClick={() => handleToggleBoard(board)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                    <span>{board}</span>
                  </button>
                );
              }
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
