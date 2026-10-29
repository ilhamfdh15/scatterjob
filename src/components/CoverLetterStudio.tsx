import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  Sliders,
  Send,
  FileCheck,
  Edit3
} from 'lucide-react';
import { JobOpening, CandidateProfile, CoverLetterTone, ApplicationStatus } from '../types';

interface CoverLetterStudioProps {
  job: JobOpening;
  candidateProfile: CandidateProfile;
  initialLetter?: string;
  onLetterChange?: (letter: string) => void;
  onApplyAndTrack: (job: JobOpening, letter: string, status: ApplicationStatus) => void;
  onShowToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export const CoverLetterStudio: React.FC<CoverLetterStudioProps> = ({
  job,
  candidateProfile,
  initialLetter,
  onLetterChange,
  onApplyAndTrack,
  onShowToast,
}) => {
  const [tone, setTone] = useState<CoverLetterTone>('confident');
  const [customEmphasis, setCustomEmphasis] = useState('');
  const [coverLetter, setCoverLetter] = useState(initialLetter || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Sync letter when job changes
  useEffect(() => {
    if (initialLetter) {
      setCoverLetter(initialLetter);
    } else {
      // Auto draft default letter
      handleGenerateLetter(false);
    }
  }, [job.id]);

  const handleGenerateLetter = async (showToastNotice = true) => {
    setIsGenerating(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9000);

    try {
      const response = await fetch('/api/cover-letter/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateProfile,
          job,
          tone,
          customNotes: customEmphasis,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await response.json().catch(() => ({}));
      if (data.success && data.coverLetter) {
        setCoverLetter(data.coverLetter);
        onLetterChange?.(data.coverLetter);
        if (showToastNotice) {
          onShowToast(`Drafted tailored cover letter for ${job.company} with Gemini AI!`, 'success');
        }
      } else {
        throw new Error(data.error || 'Failed to generate');
      }
    } catch (err: any) {
      console.warn('Direct API generation notice:', err);
      // Dynamic fallback generator grounded in candidate profile
      const expHighlight =
        candidateProfile.experience?.[0]?.highlights?.[0] ||
        `spearheaded engineering initiatives improving system reliability and execution quality`;
      const fallback = `Dear Hiring Team at ${job.company},

I am writing to express my strong interest in the ${job.title} role. With my verified background as a ${candidateProfile.headline || 'Engineer'} and hands-on expertise with ${(job.requiredSkills || []).slice(0, 3).join(', ')}, I am excited by ${job.company}'s engineering standards and mission.

In my recent work at ${candidateProfile.experience?.[0]?.company || 'my recent company'}, I ${expHighlight}. My practical experience with ${(candidateProfile.skills || []).slice(0, 4).join(', ')} directly aligns with your requirements for ${job.title}.

I welcome the opportunity to discuss how my skill set and background can support your roadmap at ${job.company}. Thank you for your consideration.

Sincerely,
${candidateProfile.fullName || 'Candidate'}`;

      setCoverLetter(fallback);
      onLetterChange?.(fallback);
      if (showToastNotice) {
        onShowToast(`Cover letter created using local tailored template.`, 'info');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!coverLetter) return;
    navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    onShowToast('Cover letter copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyAndLaunch = () => {
    if (!coverLetter) {
      handleCopy();
    } else {
      navigator.clipboard.writeText(coverLetter);
    }
    // Launch job application portal in new tab
    if (job.applyUrl) {
      window.open(job.applyUrl, '_blank', 'noopener,noreferrer');
    }
    // Register as Applied in pipeline
    onApplyAndTrack(job, coverLetter, 'Applied');
    onShowToast(`Copied cover letter and launched ${job.company} portal! Marked as Applied.`, 'success');
  };

  const wordCount = coverLetter.trim() ? coverLetter.trim().split(/\s+/).length : 0;
  const readTimeSeconds = Math.max(15, Math.round((wordCount / 200) * 60));

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      {/* Studio Header & Tone Selector */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/80">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <h4 className="text-sm font-semibold text-slate-100">
              AI Tailored Cover Letter
            </h4>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-400 font-mono tabular-nums">
              {wordCount} words (~{readTimeSeconds}s read)
            </span>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            {(['confident', 'technical', 'direct', 'collaborative'] as CoverLetterTone[]).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTone(t);
                }}
                className={`px-2.5 py-1 rounded capitalize transition-colors ${
                  tone === t
                    ? 'bg-slate-800 text-emerald-400 font-medium'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Emphasis Input */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={customEmphasis}
            onChange={(e) => setCustomEmphasis(e.target.value)}
            placeholder="Add custom angle (e.g. emphasize React performance, scaling to 1M users...)"
            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50"
          />
          <button
            onClick={() => handleGenerateLetter(true)}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors border border-slate-700 disabled:opacity-50 shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin text-emerald-400' : ''}`} />
            <span>{isGenerating ? 'Drafting...' : 'Regenerate'}</span>
          </button>
        </div>
      </div>

      {/* Live Cover Letter Editor / Preview Body */}
      <div className="flex-1 p-4 flex flex-col relative min-h-[280px]">
        <textarea
          value={coverLetter}
          onChange={(e) => {
            setCoverLetter(e.target.value);
            onLetterChange?.(e.target.value);
          }}
          disabled={isGenerating}
          placeholder="Drafting your personalized cover letter..."
          className="w-full flex-1 bg-slate-950/60 border border-slate-800/80 rounded-lg p-3 text-xs leading-relaxed text-slate-200 font-sans focus:outline-none focus:border-slate-700 resize-none overflow-y-auto selection:bg-emerald-500/30"
        />

        {isGenerating && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs rounded-lg flex items-center justify-center flex-col gap-2 z-10 m-4">
            <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
            <span className="text-xs text-slate-300 font-medium">
              Gemini 3.8 Flash is drafting your tailored cover letter...
            </span>
            <span className="text-xs text-slate-500">
              Aligning candidate proof points with {job.company}'s requirements
            </span>
          </div>
        )}
      </div>

      {/* Action Footer Bar */}
      <div className="p-3 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied to Clipboard' : 'Copy Letter'}</span>
        </button>

        <div className="flex items-center gap-2">
          <a
            href={job.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 rounded-lg transition-colors"
          >
            <span>Visit {job.jobBoard}</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          {/* Primary Assisted Auto-Apply Button */}
          <button
            onClick={handleApplyAndLaunch}
            className="flex items-center gap-2 px-4 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 active:bg-emerald-500 rounded-lg transition-colors shadow-sm shadow-emerald-500/20"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Copy & Open Apply Link</span>
          </button>
        </div>
      </div>
    </div>
  );
};
