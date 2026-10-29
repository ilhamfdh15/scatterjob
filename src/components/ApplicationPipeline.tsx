import React, { useState } from 'react';
import {
  ExternalLink,
  Calendar,
  CheckCircle2,
  Clock,
  Trash2,
  FileText,
  Search,
  SlidersHorizontal,
  ChevronDown,
  Building2,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { ApplicationTrackerEntry, ApplicationStatus } from '../types';

interface ApplicationPipelineProps {
  applications: ApplicationTrackerEntry[];
  onUpdateStatus: (id: string, status: ApplicationStatus, notes?: string) => void;
  onDeleteApplication: (id: string) => void;
  onInspectJob: (jobId: string) => void;
  onShowToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export const ApplicationPipeline: React.FC<ApplicationPipelineProps> = ({
  applications,
  onUpdateStatus,
  onDeleteApplication,
  onInspectJob,
  onShowToast,
}) => {
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [activeLetterModal, setActiveLetterModal] = useState<ApplicationTrackerEntry | null>(null);

  const statuses: ApplicationStatus[] = [
    'Drafted',
    'Applied',
    'Reviewing',
    'Interview',
    'Offer',
    'Archived',
  ];

  const filtered = applications.filter((app) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!app.company.toLowerCase().includes(q) && !app.jobTitle.toLowerCase().includes(q)) {
        return false;
      }
    }
    if (statusFilter !== 'All' && app.status !== statusFilter) {
      return false;
    }
    return true;
  });

  const getStatusBadgeStyle = (status: ApplicationStatus) => {
    switch (status) {
      case 'Offer':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'Interview':
        return 'text-sky-400 bg-sky-500/10 border-sky-500/30';
      case 'Reviewing':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'Applied':
        return 'text-teal-400 bg-teal-500/10 border-teal-500/30';
      case 'Drafted':
        return 'text-slate-400 bg-slate-800 border-slate-700';
      case 'Archived':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
    }
  };

  const counts = {
    total: applications.length,
    applied: applications.filter((a) => a.status === 'Applied').length,
    interviews: applications.filter((a) => a.status === 'Interview').length,
    offers: applications.filter((a) => a.status === 'Offer').length,
  };

  return (
    <div className="space-y-6 text-left">
      {/* Metric Counters Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400">Total Tracked</div>
          <div className="text-2xl font-bold font-mono text-slate-100 tabular-nums mt-1">
            {counts.total}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400">Submitted Applications</div>
          <div className="text-2xl font-bold font-mono text-teal-400 tabular-nums mt-1">
            {counts.applied}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400">Active Interviews</div>
          <div className="text-2xl font-bold font-mono text-sky-400 tabular-nums mt-1">
            {counts.interviews}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400">Offers Received</div>
          <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums mt-1">
            {counts.offers}
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search applications by company or role..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none"
          >
            <option value="All">All Stages ({applications.length})</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s} ({applications.filter((a) => a.status === s).length})
              </option>
            ))}
          </select>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setViewMode('kanban')}
            className={`px-3 py-1 rounded transition-colors ${
              viewMode === 'kanban'
                ? 'bg-slate-800 text-emerald-400 font-medium'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Kanban Board
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1 rounded transition-colors ${
              viewMode === 'table'
                ? 'bg-slate-800 text-emerald-400 font-medium'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Dense Table
          </button>
        </div>
      </div>

      {/* Main View Area */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 items-start">
          {statuses.map((colStatus) => {
            const colApps = filtered.filter((a) => a.status === colStatus);
            return (
              <div
                key={colStatus}
                className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex flex-col gap-2 min-h-[350px]"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-semibold text-slate-200">{colStatus}</span>
                  <span className="text-xs font-mono text-slate-500 tabular-nums">
                    {colApps.length}
                  </span>
                </div>

                <div className="space-y-2 flex-1">
                  {colApps.map((app) => (
                    <div
                      key={app.id}
                      className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition-all text-xs space-y-2 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-1">
                        <span className="font-semibold text-emerald-400 truncate">
                          {app.company}
                        </span>
                        <span className="font-mono text-slate-400 text-[11px] tabular-nums shrink-0">
                          {app.matchScore}%
                        </span>
                      </div>

                      <div className="text-slate-200 font-medium truncate">{app.jobTitle}</div>

                      <div className="text-[11px] text-slate-500 flex items-center justify-between">
                        <span>{app.salary}</span>
                        <span className="font-mono tabular-nums">{app.appliedDate}</span>
                      </div>

                      {app.notes && (
                        <p className="text-[11px] text-slate-400 line-clamp-2 bg-slate-900/70 p-1.5 rounded border border-slate-800/50">
                          {app.notes}
                        </p>
                      )}

                      {/* Card Actions */}
                      <div className="pt-2 border-t border-slate-900 flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setActiveLetterModal(app)}
                            title="View Cover Letter"
                            className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                          <a
                            href={app.applyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Open Application Link"
                            className="p-1 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>

                        {/* Status Switcher Dropdown */}
                        <select
                          value={app.status}
                          onChange={(e) =>
                            onUpdateStatus(app.id, e.target.value as ApplicationStatus)
                          }
                          className="bg-slate-900 border border-slate-800 text-[11px] text-slate-300 rounded px-1.5 py-0.5 focus:outline-none"
                        >
                          {statuses.map((s) => (
                            <option key={s} value={s}>
                              Move: {s}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}

                  {colApps.length === 0 && (
                    <div className="h-24 flex items-center justify-center text-xs text-slate-600 border border-dashed border-slate-800/60 rounded-lg">
                      No applications
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* High-Density Tabular View */
        <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-lg">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Company & Role</th>
                <th className="px-4 py-3">Compensation</th>
                <th className="px-4 py-3">Applied Date</th>
                <th className="px-4 py-3">Match</th>
                <th className="px-4 py-3">Stage Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filtered.map((app) => (
                <tr key={app.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-100">{app.jobTitle}</div>
                    <div className="text-slate-400 flex items-center gap-2 mt-0.5">
                      <span className="text-emerald-400">{app.company}</span>
                      <span className="text-slate-600">·</span>
                      <span className="text-slate-500">{app.location}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono tabular-nums text-slate-300">
                    {app.salary}
                  </td>
                  <td className="px-4 py-3 font-mono tabular-nums text-slate-400">
                    {app.appliedDate}
                  </td>
                  <td className="px-4 py-3 font-mono tabular-nums text-emerald-400 font-medium">
                    {app.matchScore}%
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={app.status}
                      onChange={(e) =>
                        onUpdateStatus(app.id, e.target.value as ApplicationStatus)
                      }
                      className={`px-2.5 py-1 rounded-md text-xs font-medium border focus:outline-none ${getStatusBadgeStyle(
                        app.status
                      )}`}
                    >
                      {statuses.map((s) => (
                        <option key={s} value={s} className="bg-slate-900 text-slate-200">
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setActiveLetterModal(app)}
                        className="px-2 py-1 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors text-[11px]"
                      >
                        Letter
                      </button>
                      <a
                        href={app.applyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-slate-400 hover:text-emerald-400 transition-colors"
                        title="Open external job link"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => onDeleteApplication(app.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                        title="Delete from tracker"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                    No applications match the active filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Cover Letter Modal View */}
      {activeLetterModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-100">
                  {activeLetterModal.company} - Cover Letter
                </h3>
                <p className="text-xs text-slate-400">{activeLetterModal.jobTitle}</p>
              </div>
              <button
                onClick={() => setActiveLetterModal(null)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 bg-slate-800 rounded-lg"
              >
                Close
              </button>
            </div>

            <textarea
              readOnly
              value={activeLetterModal.coverLetter}
              rows={12}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs leading-relaxed text-slate-200 focus:outline-none"
            />

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500">
                Applied on {activeLetterModal.appliedDate}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(activeLetterModal.coverLetter);
                    onShowToast('Copied cover letter to clipboard!', 'success');
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg"
                >
                  Copy to Clipboard
                </button>
                <a
                  href={activeLetterModal.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-emerald-400 text-slate-950 text-xs font-semibold rounded-lg flex items-center gap-1.5"
                >
                  <span>Open Job Link</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
