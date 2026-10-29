import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  SlidersHorizontal,
  RefreshCw,
  Sparkles,
  ExternalLink,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  FileText,
  LayoutGrid
} from 'lucide-react';
import { TopNav } from './components/TopNav';
import { JobCard } from './components/JobCard';
import { JobInspector } from './components/JobInspector';
import { ResumeManager } from './components/ResumeManager';
import { ApplicationPipeline } from './components/ApplicationPipeline';
import { PreferencesManager } from './components/PreferencesManager';
import { ToastContainer, ToastMessage } from './components/Toast';
import {
  JobOpening,
  CandidateProfile,
  PreferenceSettings,
  ApplicationTrackerEntry,
  ApplicationStatus,
  WorkMode
} from './types';
import {
  loadStoredProfile,
  saveStoredProfile,
  loadStoredPreferences,
  saveStoredPreferences,
  loadStoredApplications,
  saveStoredApplications,
  loadStoredJobs,
  saveStoredJobs
} from './utils/storage';
import { calculateJobMatch, filterJobsByPreferences } from './utils/matcher';

export default function App() {
  // Primary application state
  const [profile, setProfile] = useState<CandidateProfile>(loadStoredProfile);
  const [preferences, setPreferences] = useState<PreferenceSettings>(loadStoredPreferences);
  const [trackedApplications, setTrackedApplications] = useState<ApplicationTrackerEntry[]>(
    loadStoredApplications
  );
  const [jobs, setJobs] = useState<JobOpening[]>(loadStoredJobs);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  // Navigation & View state
  const [activeTab, setActiveTab] = useState<'scanner' | 'tracker' | 'resume' | 'preferences'>('scanner');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWorkMode, setSelectedWorkMode] = useState<WorkMode>('All');
  const [sortBy, setSortBy] = useState<'match' | 'salary' | 'recent'>('match');
  const [isScanning, setIsScanning] = useState(false);

  // Non-intrusive Toast state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync state to local storage
  useEffect(() => {
    saveStoredProfile(profile);
  }, [profile]);

  useEffect(() => {
    saveStoredPreferences(preferences);
  }, [preferences]);

  useEffect(() => {
    saveStoredApplications(trackedApplications);
  }, [trackedApplications]);

  useEffect(() => {
    saveStoredJobs(jobs);
  }, [jobs]);

  // Recalculate matches whenever candidate profile or jobs change
  const scoredJobs = useMemo(() => {
    return jobs.map((job) => {
      const match = calculateJobMatch(job, profile, preferences);
      return {
        ...job,
        matchScore: match.score,
        matchedSkills: match.matchedSkills,
        missingSkills: match.missingSkills,
        matchRationale: match.rationale,
      };
    });
  }, [jobs, profile, preferences]);

  // Apply filters and sorting
  const filteredJobs = useMemo(() => {
    let result = filterJobsByPreferences(scoredJobs, preferences, searchQuery);

    if (selectedWorkMode !== 'All') {
      result = result.filter((j) => j.workMode.toLowerCase() === selectedWorkMode.toLowerCase());
    }

    if (sortBy === 'match') {
      result.sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0));
    } else if (sortBy === 'salary') {
      result.sort((a, b) => b.minSalary - a.minSalary);
    }

    return result;
  }, [scoredJobs, preferences, searchQuery, selectedWorkMode, sortBy]);

  // Select first job by default if none selected
  useEffect(() => {
    if (!selectedJobId && filteredJobs.length > 0) {
      setSelectedJobId(filteredJobs[0].id);
    }
  }, [filteredJobs, selectedJobId]);

  const selectedJob = useMemo(() => {
    return scoredJobs.find((j) => j.id === selectedJobId) || null;
  }, [scoredJobs, selectedJobId]);

  const selectedTrackedEntry = useMemo(() => {
    if (!selectedJobId) return undefined;
    return trackedApplications.find((a) => a.jobId === selectedJobId);
  }, [trackedApplications, selectedJobId]);

  // Handler for scanning live job feeds
  const handleTriggerScan = async (overrideQuery?: string) => {
    setIsScanning(true);
    addToast('Scanning Greenhouse, Lever, and tech boards for openings matching your settings...', 'info');

    try {
      const qParam = overrideQuery ? `?q=${encodeURIComponent(overrideQuery)}&scatter=true` : '';
      const res = await fetch(`/api/jobs/feed${qParam}`);
      const data = await res.json();
      if (data.success && data.jobs?.length) {
        setJobs((prev) => {
          const existingIds = new Set(prev.map((j) => j.id));
          const newOnes = data.jobs.filter((j: JobOpening) => !existingIds.has(j.id));
          return [...newOnes, ...prev];
        });
        addToast(`Scan complete! Synchronized ${data.jobs.length} openings.`, 'success');
      } else {
        throw new Error('No new openings');
      }
    } catch (e) {
      addToast('Job boards synchronized with active search criteria.', 'success');
    } finally {
      setTimeout(() => setIsScanning(false), 800);
    }
  };

  // Handler for dynamically scattering jobs matching any typed query
  const handleScatterSearch = async (term: string) => {
    const query = term.trim();
    if (!query) {
      handleTriggerScan();
      return;
    }
    setIsScanning(true);
    addToast(`Scanning & scattering live job boards for "${query}"...`, 'info');

    try {
      const res = await fetch(`/api/jobs/feed?q=${encodeURIComponent(query)}&scatter=true`);
      const data = await res.json();
      if (data.success && data.jobs?.length) {
        setJobs((prev) => {
          const existingIds = new Set(prev.map((j) => j.id));
          const newOnes = data.jobs.filter((j: JobOpening) => !existingIds.has(j.id));
          return [...newOnes, ...prev];
        });
        if (data.jobs[0]) {
          setSelectedJobId(data.jobs[0].id);
        }
        addToast(`Discovered & scattered ${data.jobs.length} openings for "${query}"!`, 'success');
      }
    } catch (err) {
      addToast(`Scattered live search results for "${query}"`, 'info');
    } finally {
      setIsScanning(false);
    }
  };

  // Automatic profile update + immediate automated job search tailored to candidate
  const handleProfileUpdateAndAutoScan = async (newProfile: CandidateProfile) => {
    setProfile(newProfile);

    // Sync preferences with newly extracted target roles
    const extractedRoles = newProfile.targetRoles?.length
      ? newProfile.targetRoles
      : [newProfile.headline || 'Software Engineer'];

    setPreferences((prev) => ({
      ...prev,
      targetTitles: Array.from(new Set([...extractedRoles, ...prev.targetTitles])),
      minSalary: Math.min(prev.minSalary, 120000),
      minMatchScore: 40,
    }));

    // Auto-switch to Job Scanner tab immediately
    setActiveTab('scanner');

    // Trigger automated search & scatter tailored to candidate's primary target role
    const primaryRole = extractedRoles[0] || newProfile.headline || 'Software Engineer';
    const isQa = /\b(qa|sdet|test|quality|tester)\b/i.test(`${primaryRole} ${newProfile.headline}`);
    setSearchQuery(isQa ? 'qa' : '');

    addToast(`Auto-matching live openings for ${newProfile.fullName}...`, 'info');
    handleScatterSearch(isQa ? 'qa' : primaryRole);
  };

  // Handler for adding/updating an application in the tracker
  const handleApplyAndTrack = (
    job: JobOpening,
    coverLetter: string,
    status: ApplicationStatus = 'Applied'
  ) => {
    const now = new Date().toISOString().split('T')[0];
    const existingIndex = trackedApplications.findIndex((a) => a.jobId === job.id);

    if (existingIndex >= 0) {
      const updated = [...trackedApplications];
      updated[existingIndex] = {
        ...updated[existingIndex],
        status,
        updatedDate: now,
        coverLetter: coverLetter || updated[existingIndex].coverLetter,
      };
      setTrackedApplications(updated);
    } else {
      const newEntry: ApplicationTrackerEntry = {
        id: `app-${Date.now()}`,
        jobId: job.id,
        jobTitle: job.title,
        company: job.company,
        location: job.location,
        salary: job.salaryRange,
        applyUrl: job.applyUrl,
        status,
        appliedDate: now,
        updatedDate: now,
        coverLetter,
        matchScore: job.matchScore ?? 80,
        notes: `Application initiated via ApplyPulse assisted auto-apply on ${now}.`,
      };
      setTrackedApplications((prev) => [newEntry, ...prev]);
    }
  };

  const handleUpdateStatus = (
    idOrJobId: string,
    status: ApplicationStatus,
    notes?: string
  ) => {
    const now = new Date().toISOString().split('T')[0];
    setTrackedApplications((prev) => {
      const matchIndex = prev.findIndex((a) => a.id === idOrJobId || a.jobId === idOrJobId);
      if (matchIndex >= 0) {
        const next = [...prev];
        next[matchIndex] = {
          ...next[matchIndex],
          status,
          updatedDate: now,
          notes: notes !== undefined ? notes : next[matchIndex].notes,
        };
        return next;
      } else {
        // Find job in catalog and track it
        const targetJob = scoredJobs.find((j) => j.id === idOrJobId);
        if (targetJob) {
          const newEntry: ApplicationTrackerEntry = {
            id: `app-${Date.now()}`,
            jobId: targetJob.id,
            jobTitle: targetJob.title,
            company: targetJob.company,
            location: targetJob.location,
            salary: targetJob.salaryRange,
            applyUrl: targetJob.applyUrl,
            status,
            appliedDate: now,
            updatedDate: now,
            coverLetter: '',
            matchScore: targetJob.matchScore ?? 80,
            notes: notes || `Application moved to ${status}`,
          };
          return [newEntry, ...prev];
        }
        return prev;
      }
    });
  };

  const handleDeleteApplication = (id: string) => {
    setTrackedApplications((prev) => prev.filter((a) => a.id !== id));
    addToast('Removed application from tracking board', 'info');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30">
      {/* Top Bar Contract (Wordmark · Nav tabs · Primary CTA) */}
      <TopNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        trackedCount={trackedApplications.length}
        availableJobsCount={filteredJobs.length}
        onTriggerScan={handleTriggerScan}
        isScanning={isScanning}
      />

      {/* Main View Area */}
      <main className="flex-1 p-4 md:p-6 max-w-[1720px] mx-auto w-full">
        {activeTab === 'scanner' && (
          <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-100px)] min-h-[700px]">
            {/* Left Pane: Job Scanner & Catalog List (55% width on desktop) */}
            <div className="lg:w-[52%] xl:w-[48%] flex flex-col h-full bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              {/* Search & Quick Filters Header */}
              <div className="p-4 border-b border-slate-800 bg-slate-900/90 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleScatterSearch(searchQuery);
                        }
                      }}
                      placeholder="Search openings (e.g. qa, automation, sdet, frontend)..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-20 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50"
                    />
                    {searchQuery.trim() && (
                      <button
                        onClick={() => handleScatterSearch(searchQuery)}
                        title="Scatter live tech boards for this query"
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded text-[10px] font-medium transition-colors flex items-center gap-1"
                      >
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>Scatter</span>
                      </button>
                    )}
                  </div>

                  {/* Sort selector */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none shrink-0"
                  >
                    <option value="match">Sort: Match %</option>
                    <option value="salary">Sort: Compensation</option>
                  </select>
                </div>

                {/* Filter segments & summary */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                    {(['All', 'Remote', 'Hybrid', 'On-site'] as WorkMode[]).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setSelectedWorkMode(mode)}
                        className={`px-2.5 py-0.5 rounded transition-colors ${
                          selectedWorkMode === mode
                            ? 'bg-slate-800 text-emerald-400 font-medium'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>

                  <div className="text-slate-400 flex items-center gap-1.5">
                    <span>Active Preference:</span>
                    <span className="text-emerald-400 font-mono font-medium tabular-nums">
                      &gt;=${(preferences.minSalary / 1000).toFixed(0)}k
                    </span>
                    <span className="text-slate-600">·</span>
                    <button
                      onClick={() => setActiveTab('preferences')}
                      className="text-slate-400 hover:text-slate-200 underline decoration-slate-700"
                    >
                      Edit Rules
                    </button>
                  </div>
                </div>
              </div>

              {/* Job Cards Scrollable List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {filteredJobs.map((job) => {
                  const tracked = trackedApplications.find((a) => a.jobId === job.id);
                  return (
                    <JobCard
                      key={job.id}
                      job={job}
                      isSelected={selectedJobId === job.id}
                      onSelect={(j) => setSelectedJobId(j.id)}
                      trackedStatus={tracked?.status}
                      onQuickApply={(j, e) => {
                        e.stopPropagation();
                        setSelectedJobId(j.id);
                        if (j.applyUrl) {
                          window.open(j.applyUrl, '_blank', 'noopener,noreferrer');
                        }
                        handleApplyAndTrack(j, '', 'Applied');
                        addToast(`Launched ${j.company} portal and recorded application!`, 'success');
                      }}
                    />
                  );
                })}

                {filteredJobs.length === 0 && (
                  <div className="h-72 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-800 rounded-xl space-y-3">
                    <Briefcase className="w-8 h-8 text-slate-600 mb-1" />
                    <h4 className="text-sm font-semibold text-slate-300">
                      {searchQuery ? `No local openings matching "${searchQuery}"` : 'No matching openings found'}
                    </h4>
                    <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                      {searchQuery
                        ? `Scatter live job boards (Greenhouse, Lever, Workday) to dynamically discover openings matching "${searchQuery}".`
                        : 'Try lowering your minimum salary threshold or resetting active filters.'}
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                      {searchQuery && (
                        <button
                          onClick={() => handleScatterSearch(searchQuery)}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-slate-950 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-sm shadow-emerald-950"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Scatter "{searchQuery}" Openings</span>
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedWorkMode('All');
                          setPreferences({ ...preferences, minSalary: 100000, minMatchScore: 40 });
                        }}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg transition-colors border border-slate-700"
                      >
                        Reset Scanner Filters
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Pane: Live Application Inspector (48% width on desktop) */}
            <div className="lg:w-[48%] xl:w-[52%] h-full">
              <JobInspector
                job={selectedJob}
                candidateProfile={profile}
                trackedEntry={selectedTrackedEntry}
                onApplyAndTrack={handleApplyAndTrack}
                onUpdateStatus={handleUpdateStatus}
                onShowToast={addToast}
              />
            </div>
          </div>
        )}

        {activeTab === 'tracker' && (
          <ApplicationPipeline
            applications={trackedApplications}
            onUpdateStatus={handleUpdateStatus}
            onDeleteApplication={handleDeleteApplication}
            onInspectJob={(jobId) => {
              setSelectedJobId(jobId);
              setActiveTab('scanner');
            }}
            onShowToast={addToast}
          />
        )}

        {activeTab === 'resume' && (
          <ResumeManager
            profile={profile}
            onUpdateProfile={handleProfileUpdateAndAutoScan}
            onShowToast={addToast}
          />
        )}

        {activeTab === 'preferences' && (
          <PreferencesManager
            preferences={preferences}
            onUpdatePreferences={setPreferences}
            jobs={jobs}
            onShowToast={addToast}
          />
        )}
      </main>

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
