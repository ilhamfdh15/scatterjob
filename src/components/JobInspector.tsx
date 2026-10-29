import React, { useState } from 'react';
import {
  Building2,
  ExternalLink,
  MapPin,
  Sparkles,
  CheckCircle2,
  XCircle,
  FileText,
  Clock,
  Briefcase,
  BookmarkPlus,
  Send,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { JobOpening, CandidateProfile, ApplicationStatus, ApplicationTrackerEntry } from '../types';
import { CoverLetterStudio } from './CoverLetterStudio';

interface JobInspectorProps {
  job: JobOpening | null;
  candidateProfile: CandidateProfile;
  trackedEntry?: ApplicationTrackerEntry;
  onApplyAndTrack: (job: JobOpening, letter: string, status: ApplicationStatus) => void;
  onUpdateStatus: (jobId: string, status: ApplicationStatus, notes?: string) => void;
  onShowToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  onCloseMobile?: () => void;
}

export const JobInspector: React.FC<JobInspectorProps> = ({
  job,
  candidateProfile,
  trackedEntry,
  onApplyAndTrack,
  onUpdateStatus,
  onShowToast,
  onCloseMobile,
}) => {
  const [activeTab, setActiveTab] = useState<'letter' | 'overview' | 'status'>('letter');
  const [notes, setNotes] = useState(trackedEntry?.notes || '');
  const [currentLetter, setCurrentLetter] = useState(trackedEntry?.coverLetter || '');

  if (!job) {
    return (
      <div className="h-full flex items-center justify-center p-8 bg-slate-900/40 border border-slate-800 rounded-2xl text-center">
        <div className="max-w-xs">
          <Briefcase className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h4 className="text-sm font-semibold text-slate-200 mb-1">
            No Job Selected
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Select a job from the scan list to review requirements, view match analysis, and auto-draft tailored cover letters.
          </p>
        </div>
      </div>
    );
  }

  const matchScore = job.matchScore ?? 80;
  const statusList: ApplicationStatus[] = [
    'Drafted',
    'Applied',
    'Reviewing',
    'Interview',
    'Offer',
    'Archived',
  ];

  const handleStatusChange = (newStatus: ApplicationStatus) => {
    onUpdateStatus(job.id, newStatus, notes);
    onShowToast(`Updated status to "${newStatus}"`, 'success');
  };

  const handleSaveNotes = () => {
    const status = trackedEntry?.status || 'Drafted';
    onUpdateStatus(job.id, status, notes);
    onShowToast('Notes updated successfully.', 'info');
  };

  return (
    <div className="h-full flex flex-col bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Inspector Header */}
      <div className="p-5 border-b border-slate-800 bg-slate-900/95">
        <div className="flex items-start justify-between gap-4 mb-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1 text-xs">
              <span className="font-semibold text-emerald-400 uppercase tracking-wider">
                {job.company}
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400 font-mono">{job.jobBoard}</span>
              {job.department && (
                <>
                  <span className="text-slate-600">·</span>
                  <span className="text-slate-400">{job.department}</span>
                </>
              )}
            </div>
            <h2 className="text-lg font-bold text-slate-100 truncate">
              {job.title}
            </h2>
          </div>

          {/* Match Score Badge */}
          <div className="flex flex-col items-end shrink-0">
            <div
              className={`px-3 py-1 rounded-lg border font-mono text-xs font-semibold tabular-nums flex items-center gap-1.5 ${
                matchScore >= 85
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                  : matchScore >= 70
                  ? 'border-teal-500/30 bg-teal-500/10 text-teal-400'
                  : matchScore >= 50
                  ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                  : 'border-rose-500/20 bg-rose-500/10 text-rose-400'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{matchScore}% Match</span>
            </div>
            {trackedEntry && (
              <span className="text-[11px] text-emerald-300 font-medium mt-1">
                Status: {trackedEntry.status}
              </span>
            )}
          </div>
        </div>

        {/* Unboxed Metadata Line */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400 mb-4">
          <span className="flex items-center gap-1 text-slate-300">
            <MapPin className="w-3 h-3 text-slate-500" />
            {job.location}
          </span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-300">{job.workMode}</span>
          <span className="text-slate-600">·</span>
          <span className="font-mono text-slate-200 tabular-nums">{job.salaryRange}</span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-500">{job.experienceLevel} Level</span>
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 -mb-5 pt-1">
          <button
            onClick={() => setActiveTab('letter')}
            className={`pb-2.5 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'letter'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Cover Letter</span>
          </button>

          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-2.5 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Job Description & Match</span>
          </button>

          <button
            onClick={() => setActiveTab('status')}
            className={`pb-2.5 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'status'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Application Status</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto p-5">
        {activeTab === 'letter' && (
          <CoverLetterStudio
            job={job}
            candidateProfile={candidateProfile}
            initialLetter={trackedEntry?.coverLetter || currentLetter}
            onLetterChange={(letter) => setCurrentLetter(letter)}
            onApplyAndTrack={onApplyAndTrack}
            onShowToast={onShowToast}
          />
        )}

        {activeTab === 'overview' && (
          <div className="space-y-6 text-left">
            {/* Match Analysis Breakdown */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/70">
              <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Match Intelligence</span>
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                {job.matchRationale ||
                  `Strong technical alignment with ${job.company}'s requirements based on your verified resume skills and background.`}
              </p>

              {/* Matched vs Missing Skills */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-800/80">
                <div>
                  <span className="text-xs font-medium text-emerald-400 flex items-center gap-1 mb-2">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Matched Competencies ({job.matchedSkills?.length || 0})</span>
                  </span>
                  <div className="text-xs text-slate-300 leading-relaxed font-mono">
                    {job.matchedSkills && job.matchedSkills.length > 0
                      ? job.matchedSkills.join(' · ')
                      : 'None directly matched from CV'}
                  </div>
                </div>

                <div>
                  <span className="text-xs font-medium text-amber-400 flex items-center gap-1 mb-2">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Skill Gaps / Missing ({job.missingSkills?.length || 0})</span>
                  </span>
                  <div className="text-xs text-slate-400 leading-relaxed font-mono">
                    {job.missingSkills && job.missingSkills.length > 0
                      ? job.missingSkills.join(' · ')
                      : 'None - you meet all primary requirements!'}
                  </div>
                </div>
              </div>
            </div>

            {/* Full Job Description */}
            <div>
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Role Overview
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line bg-slate-950/40 p-4 rounded-xl border border-slate-800/80">
                {job.description}
              </p>
            </div>

            {/* Technical Requirements */}
            <div>
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Required Technical Qualifications
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {job.requiredSkills.map((skill) => (
                  <li key={skill} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>{skill}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Nice to Haves */}
            {job.niceToHaveSkills?.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Preferred / Nice-to-Have
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-400">
                  {job.niceToHaveSkills.map((skill) => (
                    <li key={skill} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                      <span>{skill}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* External Link */}
            <div className="pt-2">
              <a
                href={job.applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs text-emerald-400 hover:text-emerald-300 font-medium"
              >
                <span>View original posting on {job.jobBoard}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}

        {activeTab === 'status' && (
          <div className="space-y-5 text-left">
            {/* Status Pipeline Step */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/70">
              <label className="text-xs font-semibold text-slate-200 block mb-2 uppercase tracking-wider">
                Application Pipeline Stage
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {statusList.map((st) => (
                  <button
                    key={st}
                    onClick={() => handleStatusChange(st)}
                    className={`px-3 py-2 text-xs rounded-lg border text-left transition-colors flex items-center justify-between ${
                      (trackedEntry?.status || 'Drafted') === st
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 font-semibold'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <span>{st}</span>
                    {(trackedEntry?.status || 'Drafted') === st && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Application Notes */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/70">
              <label className="text-xs font-semibold text-slate-200 block mb-2 uppercase tracking-wider">
                Application Notes & Interview Details
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Log recruiter contacts, interview questions, salary discussion, or follow-up schedule..."
                rows={4}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 mb-3"
              />
              <button
                onClick={handleSaveNotes}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors border border-slate-700"
              >
                Save Notes
              </button>
            </div>

            {/* Submission Metadata */}
            {trackedEntry && (
              <div className="text-xs text-slate-500 flex flex-col gap-1 p-3 bg-slate-950/40 rounded-lg border border-slate-800/80">
                <div>
                  <span className="text-slate-400">First recorded:</span>{' '}
                  <span className="font-mono tabular-nums">{trackedEntry.appliedDate}</span>
                </div>
                <div>
                  <span className="text-slate-400">Last updated:</span>{' '}
                  <span className="font-mono tabular-nums">{trackedEntry.updatedDate}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
