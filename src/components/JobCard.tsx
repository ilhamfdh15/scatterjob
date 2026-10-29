import React from 'react';
import { ExternalLink, CheckCircle2, Sparkles, Building2, MapPin } from 'lucide-react';
import { JobOpening, ApplicationStatus } from '../types';

interface JobCardProps {
  job: JobOpening;
  isSelected: boolean;
  onSelect: (job: JobOpening) => void;
  trackedStatus?: ApplicationStatus;
  onQuickApply: (job: JobOpening, e: React.MouseEvent) => void;
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  isSelected,
  onSelect,
  trackedStatus,
  onQuickApply,
}) => {
  const matchScore = job.matchScore ?? 80;

  // Semantic status color for dynamic match score
  const matchColor =
    matchScore >= 85
      ? 'text-emerald-400'
      : matchScore >= 70
      ? 'text-teal-400'
      : matchScore >= 50
      ? 'text-amber-400'
      : 'text-rose-400';

  const matchBg =
    matchScore >= 85
      ? 'bg-emerald-500/10 border-emerald-500/30'
      : matchScore >= 70
      ? 'bg-teal-500/10 border-teal-500/30'
      : matchScore >= 50
      ? 'bg-amber-500/10 border-amber-500/30'
      : 'bg-rose-500/10 border-rose-500/20';

  return (
    <div
      onClick={() => onSelect(job)}
      className={`p-4 rounded-xl border transition-all cursor-pointer text-left ${
        isSelected
          ? 'bg-slate-800/90 border-emerald-500/50 shadow-md shadow-emerald-950/30'
          : 'bg-slate-900/60 hover:bg-slate-800/50 border-slate-800 hover:border-slate-700'
      }`}
    >
      {/* Header: Company & Title + Match Score */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              {job.company}
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-400 font-mono">{job.jobBoard}</span>
            {trackedStatus && (
              <>
                <span className="text-slate-600">·</span>
                <span className="text-xs font-medium text-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {trackedStatus}
                </span>
              </>
            )}
          </div>
          <h3 className="text-base font-semibold text-slate-100 truncate hover:text-white">
            {job.title}
          </h3>
        </div>

        {/* Match Score Indicator */}
        <div
          className={`px-2.5 py-1 rounded-lg border text-xs font-mono tabular-nums font-semibold shrink-0 flex items-center gap-1.5 ${matchBg} ${matchColor}`}
        >
          <Sparkles className="w-3 h-3" />
          <span>{matchScore}% Match</span>
        </div>
      </div>

      {/* Unboxed Metadata Line with typographic separators (Zero-Pill discipline) */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400 mb-3">
        <span className="flex items-center gap-1 text-slate-300">
          <MapPin className="w-3 h-3 text-slate-500" />
          {job.location}
        </span>
        <span className="text-slate-600">·</span>
        <span className="text-slate-300">{job.workMode}</span>
        <span className="text-slate-600">·</span>
        <span className="font-mono text-slate-200 tabular-nums">{job.salaryRange}</span>
        <span className="text-slate-600">·</span>
        <span className="text-slate-500">{job.postedDate}</span>
      </div>

      {/* Description Snippet */}
      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
        {job.description}
      </p>

      {/* Skills & Action Footnote */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
        <div className="flex items-center gap-1.5 overflow-hidden text-xs text-slate-400">
          <span className="text-slate-500 shrink-0">Required:</span>
          <span className="truncate">
            {job.requiredSkills.slice(0, 4).join(' · ')}
            {job.requiredSkills.length > 4 ? ` · +${job.requiredSkills.length - 4}` : ''}
          </span>
        </div>

        <button
          onClick={(e) => onQuickApply(job, e)}
          className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 shrink-0 px-2 py-1 rounded hover:bg-emerald-500/10 transition-colors font-medium"
        >
          <span>Auto-Apply</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
