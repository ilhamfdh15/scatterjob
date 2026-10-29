import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  Sparkles,
  Check,
  RefreshCw,
  Plus,
  Trash2,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  AlertTriangle,
  RotateCcw,
  FileWarning
} from 'lucide-react';
import { CandidateProfile } from '../types';
import { DEFAULT_CANDIDATE, QA_CANDIDATE } from '../data/mockData';

interface ResumeManagerProps {
  profile: CandidateProfile;
  onUpdateProfile: (profile: CandidateProfile) => void;
  onShowToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export const ResumeManager: React.FC<ResumeManagerProps> = ({
  profile,
  onUpdateProfile,
  onShowToast,
}) => {
  const [isParsing, setIsParsing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [failedFileName, setFailedFileName] = useState<string | null>(null);
  const [newSkill, setNewSkill] = useState('');
  const [rawTextPaste, setRawTextPaste] = useState('');
  const [showPasteArea, setShowPasteArea] = useState(false);

  const [cachedPayload, setCachedPayload] = useState<any | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Timer for active elapsed parsing duration
  React.useEffect(() => {
    let interval: any;
    if (isParsing) {
      setElapsedSeconds(0);
      interval = setInterval(() => {
        setElapsedSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isParsing]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Cancel any previous in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Reset error on new attempt
    setUploadError(null);
    setFailedFileName(file.name);

    // Validate file size
    if (file.size === 0) {
      setIsParsing(false);
      setUploadError(`The file "${file.name}" is empty (0 bytes). Please select a valid document.`);
      onShowToast('Resume upload failed: File is empty. Please re-upload.', 'error');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setIsParsing(false);
      setUploadError(`The file "${file.name}" exceeds the 10MB limit. Please re-upload a smaller file.`);
      onShowToast('Resume upload failed: File exceeds 10MB limit.', 'error');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsParsing(true);
    onShowToast(`Parsing ${file.name} with AI...`, 'info');

    try {
      const reader = new FileReader();

      reader.onerror = () => {
        setIsParsing(false);
        setUploadError(`Failed to read "${file.name}" from your device. Please try re-uploading.`);
        onShowToast('Error reading file. Please re-upload.', 'error');
        if (fileInputRef.current) fileInputRef.current.value = '';
      };

      reader.onabort = () => {
        setIsParsing(false);
        setUploadError('File reading was cancelled. Please re-upload.');
        if (fileInputRef.current) fileInputRef.current.value = '';
      };

      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        reader.readAsDataURL(file);
        reader.onload = async () => {
          try {
            const resultStr = reader.result as string;
            if (!resultStr || !resultStr.includes(',')) {
              setIsParsing(false);
              setUploadError('Invalid PDF file content. Please re-upload a readable PDF.');
              onShowToast('Invalid PDF file. Please re-upload.', 'error');
              return;
            }
            const base64Data = resultStr.split(',')[1];
            const payload = {
              fileBase64: base64Data,
              mimeType: 'application/pdf',
              fileName: file.name,
            };
            setCachedPayload(payload);
            await submitResumeToBackend(payload);
          } catch (err: any) {
            setIsParsing(false);
            setUploadError(err.message || 'Error processing PDF document. Please re-upload.');
            onShowToast('Upload error. Please re-upload.', 'error');
          }
        };
      } else {
        // Plain text or doc text
        reader.readAsText(file);
        reader.onload = async () => {
          try {
            const text = reader.result as string;
            if (!text || text.trim().length < 15) {
              setIsParsing(false);
              setUploadError(`The file "${file.name}" contains insufficient text to extract resume data. Please re-upload a complete resume.`);
              onShowToast('Resume file text too short. Please re-upload.', 'error');
              if (fileInputRef.current) fileInputRef.current.value = '';
              return;
            }
            const payload = {
              rawText: text,
              fileName: file.name,
            };
            setCachedPayload(payload);
            await submitResumeToBackend(payload);
          } catch (err: any) {
            setIsParsing(false);
            setUploadError(err.message || 'Error processing resume file. Please re-upload.');
            onShowToast('Upload error. Please re-upload.', 'error');
          }
        };
      }
    } catch (err: any) {
      console.error('File read error', err);
      setIsParsing(false);
      setUploadError(err.message || 'Error processing file. Please re-upload.');
      onShowToast('Resume upload failed. Please try re-uploading.', 'error');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCancelParsing = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsParsing(false);
    setUploadError('Parsing was cancelled. You can retry with the same file or select another CV.');
    onShowToast('Parsing cancelled.', 'info');
  };

  // Reupload WITHOUT uploading file again (uses cached file in memory)
  const handleRetrySameFile = async () => {
    if (!cachedPayload) {
      // If no cached payload, trigger file dialog
      handleUploadAnotherCV();
      return;
    }
    setUploadError(null);
    setIsParsing(true);
    onShowToast(`Retrying parsing for ${cachedPayload.fileName || 'your CV'}...`, 'info');
    await submitResumeToBackend(cachedPayload);
  };

  // Upload another CV (in case customer wrongly added the CV)
  const handleUploadAnotherCV = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsParsing(false);
    setUploadError(null);
    setFailedFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const submitResumeToBackend = async (payload: any) => {
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 38000);

    try {
      const response = await fetch('/api/resume/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success || !data.profile) {
        const errorMsg =
          data.error ||
          `Failed to parse resume document (Status ${response.status}). Please verify the file and re-upload.`;
        throw new Error(errorMsg);
      }

      // Successful extraction
      setIsParsing(false);
      setUploadError(null);
      setFailedFileName(null);
      onUpdateProfile(data.profile);
      onShowToast(
        `Resume parsed successfully for ${data.profile.fullName || 'candidate'}!`,
        'success'
      );
    } catch (error: any) {
      console.error('Resume upload error:', error);
      setIsParsing(false);
      const message =
        error.name === 'AbortError'
          ? 'Upload timed out. The server took too long to process this document. You can retry or upload another CV.'
          : error.message || 'Failed to extract candidate data from document. Please re-upload.';
      setUploadError(message);
      onShowToast('Resume upload failed. You can retry without re-uploading or choose another CV.', 'error');
    } finally {
      setIsParsing(false);
      abortControllerRef.current = null;
    }
  };

  const handlePasteSubmit = () => {
    if (!rawTextPaste.trim()) {
      setUploadError('Pasted text cannot be empty. Please paste your resume text and re-submit.');
      return;
    }
    if (rawTextPaste.trim().length < 25) {
      setUploadError('Pasted text is too brief to extract experience and skills. Please paste a full resume.');
      onShowToast('Text too short. Please paste full resume.', 'error');
      return;
    }
    setUploadError(null);
    setIsParsing(true);
    const payload = { rawText: rawTextPaste, fileName: 'Pasted_Resume_Text.txt' };
    setCachedPayload(payload);
    setFailedFileName('Pasted_Resume_Text.txt');
    submitResumeToBackend(payload);
    setShowPasteArea(false);
  };

  const handleTriggerReupload = () => {
    handleUploadAnotherCV();
  };

  // Quick action to simulate a failed upload for verification
  const handleSimulateFailedUpload = () => {
    setUploadError(
      'Document parsing failed: Corrupted PDF stream or unreadable character encoding detected. Please re-upload a clean PDF or text version.'
    );
    setFailedFileName('corrupted_resume_sample.pdf');
    onShowToast('Simulated resume upload failure: Error state active.', 'error');
  };

  const handleAddSkill = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    if (!newSkill.trim()) return;
    if (!profile.skills.includes(newSkill.trim())) {
      onUpdateProfile({
        ...profile,
        skills: [...profile.skills, newSkill.trim()],
      });
      onShowToast(`Added skill: ${newSkill.trim()}`, 'success');
    }
    setNewSkill('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    onUpdateProfile({
      ...profile,
      skills: profile.skills.filter((s) => s !== skillToRemove),
    });
  };

  const handleLoadDemoProfile = (type: 'frontend' | 'qa' | 'ai' | 'fullstack') => {
    setUploadError(null);
    if (type === 'frontend') {
      onUpdateProfile(DEFAULT_CANDIDATE);
      onShowToast('Loaded Senior Frontend Engineer profile', 'success');
    } else if (type === 'qa') {
      onUpdateProfile(QA_CANDIDATE);
      onShowToast('Loaded Senior QA Automation Engineer profile', 'success');
    } else if (type === 'ai') {
      onUpdateProfile({
        ...DEFAULT_CANDIDATE,
        fullName: 'Elena Rostova',
        headline: 'AI Solutions & Full Stack Engineer',
        summary:
          'Full stack AI engineer specializing in building low-latency LLM agent pipelines, real-time streaming interfaces, and fine-tuned application workflows.',
        skills: [
          'Python',
          'TypeScript',
          'React',
          'FastAPI',
          'LLM APIs',
          'PyTorch',
          'Vector DBs',
          'PostgreSQL',
          'Docker',
          'WebSockets',
          'Tailwind CSS',
        ],
        targetRoles: [
          'AI Solutions Engineer',
          'Full Stack Engineer - AI',
          'Machine Learning Engineer',
        ],
      });
      onShowToast('Loaded Full Stack AI Engineer profile', 'success');
    } else {
      onUpdateProfile({
        ...DEFAULT_CANDIDATE,
        fullName: 'Marcus Vance',
        headline: 'Staff Full Stack Systems Architect',
        summary:
          '10+ years engineering high-scale distributed platforms, edge infrastructure, and real-time developer observability tooling.',
        skills: [
          'TypeScript',
          'Go',
          'Next.js',
          'React',
          'Node.js',
          'Distributed Systems',
          'Kubernetes',
          'REST/gRPC',
          'PostgreSQL',
          'Redis',
        ],
        targetRoles: ['Staff Full Stack Architect', 'Principal Engineer', 'Lead Systems Engineer'],
      });
      onShowToast('Loaded Staff Full Stack Architect profile', 'success');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-left">
      {/* Upload Zone Card */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-400" />
              <span>Resume Ingestion & AI Profile Parser</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Upload your PDF or Word resume to automatically extract your skills, experience metrics,
              and career trajectory using Gemini 3.8 Flash.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Presets:</span>
            <button
              onClick={() => handleLoadDemoProfile('frontend')}
              className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700"
            >
              Frontend Senior
            </button>
            <button
              onClick={() => handleLoadDemoProfile('qa')}
              className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-emerald-400 font-medium rounded-lg transition-colors border border-emerald-500/30"
            >
              Senior QA
            </button>
            <button
              onClick={() => handleLoadDemoProfile('ai')}
              className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700"
            >
              AI Engineer
            </button>
            <button
              onClick={() => handleLoadDemoProfile('fullstack')}
              className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700"
            >
              Staff Architect
            </button>
          </div>
        </div>

        {/* Hidden File Input for Clean Programmatic Triggering */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.txt"
          onChange={handleFileUpload}
          disabled={isParsing}
          className="hidden"
        />

        {/* Dynamic Dropzone Area: Normal vs Parsing vs Upload Error State */}
        {uploadError ? (
          /* Error State Box */
          <div className="border-2 border-rose-500/50 bg-rose-950/20 rounded-xl p-6 transition-all text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-rose-400 flex items-center justify-center gap-2">
                <span>Resume Upload Failed</span>
              </h3>
              {failedFileName && (
                <div className="text-xs font-mono text-slate-300 mt-1">
                  File: <span className="text-rose-300 font-semibold">{failedFileName}</span>
                </div>
              )}
              <p className="text-xs text-slate-300 max-w-lg mx-auto mt-2 leading-relaxed bg-slate-950/70 p-3 rounded-lg border border-rose-500/20">
                {uploadError}
              </p>
            </div>

            {/* Action buttons: Retry same file without re-uploading vs Pick another CV */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              {/* Option 1: Re-upload WITHOUT uploading file again */}
              <button
                onClick={handleRetrySameFile}
                className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-slate-950 bg-rose-400 hover:bg-rose-300 active:bg-rose-500 rounded-lg transition-colors shadow-sm shadow-rose-950"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry Parsing ({failedFileName ? `"${failedFileName}"` : 'Same File'})</span>
              </button>

              {/* Option 2: Upload another CV if wrongly added */}
              <button
                onClick={handleUploadAnotherCV}
                className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-200 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors"
              >
                <UploadCloud className="w-3.5 h-3.5 text-emerald-400" />
                <span>Upload Another CV</span>
              </button>

              {/* Option 3: Paste text manually */}
              <button
                onClick={() => {
                  setUploadError(null);
                  setShowPasteArea(true);
                }}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-900/60 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors"
              >
                Paste Text Manually
              </button>
            </div>
          </div>
        ) : (
          /* Standard Upload Dropzone */
          <div
            onClick={() => {
              if (!isParsing) fileInputRef.current?.click();
            }}
            className="border-2 border-dashed border-slate-700/80 hover:border-emerald-500/50 rounded-xl p-8 text-center transition-colors bg-slate-950/40 relative cursor-pointer"
          >
            <div className="flex flex-col items-center justify-center">
              {isParsing ? (
                <div className="flex flex-col items-center gap-2">
                  <RefreshCw className="w-8 h-8 animate-spin text-emerald-400" />
                  <span className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                    <span>AI is analyzing and extracting your resume...</span>
                    <span className="font-mono text-emerald-400 tabular-nums">({elapsedSeconds}s)</span>
                  </span>
                  <span className="text-xs text-slate-400">
                    {elapsedSeconds < 6
                      ? 'Decoding document structure and formatting...'
                      : elapsedSeconds < 16
                      ? 'Extracting technical competencies, roles, and quantified metrics...'
                      : 'Synthesizing career dossier and validating fields...'}
                  </span>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCancelParsing();
                      }}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg border border-slate-700 transition-colors pointer-events-auto"
                    >
                      Cancel Parsing
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUploadAnotherCV();
                      }}
                      className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs rounded-lg border border-slate-700 transition-colors pointer-events-auto flex items-center gap-1.5"
                    >
                      <UploadCloud className="w-3 h-3 text-emerald-400" />
                      <span>Choose Different CV</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="pointer-events-none">
                  <UploadCloud className="w-8 h-8 text-slate-400 mb-2 mx-auto" />
                  <p className="text-sm font-semibold text-slate-200 mb-1">
                    Click to select or drag and drop your resume
                  </p>
                  <p className="text-xs text-slate-500">
                    Supports PDF, DOCX, or plain text (Max 10MB)
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Alternative Paste & Test Triggers */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs">
          <button
            onClick={() => setShowPasteArea(!showPasteArea)}
            className="text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
          >
            {showPasteArea ? 'Hide text paste box' : 'Or paste resume text manually'}
          </button>

          <button
            onClick={handleSimulateFailedUpload}
            className="text-slate-500 hover:text-rose-400 transition-colors text-[11px] flex items-center gap-1"
            title="Simulate what happens when an unreadable or corrupt file is uploaded"
          >
            <FileWarning className="w-3 h-3" />
            <span>Test Upload Failure State</span>
          </button>
        </div>

        {showPasteArea && (
          <div className="mt-3 space-y-2">
            <textarea
              value={rawTextPaste}
              onChange={(e) => setRawTextPaste(e.target.value)}
              placeholder="Paste your raw resume text or LinkedIn profile summary here..."
              rows={5}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50"
            />
            <div className="flex items-center gap-2">
              <button
                onClick={handlePasteSubmit}
                disabled={isParsing || !rawTextPaste.trim()}
                className="px-4 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors disabled:opacity-50"
              >
                Parse Pasted Text
              </button>
              <button
                onClick={() => setShowPasteArea(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Extracted Profile Editor */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-100">
              Verified Candidate Dossier
            </h3>
            <p className="text-xs text-slate-400">
              This information is used by the matcher to score jobs and personalize auto-drafted cover
              letters.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleUploadAnotherCV}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors border border-slate-700"
              title="Upload another CV file to replace active profile"
            >
              <UploadCloud className="w-3.5 h-3.5 text-emerald-400" />
              <span>Upload Another CV</span>
            </button>
            <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-2.5 py-1.5 rounded-lg border border-emerald-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              Active Profile
            </span>
          </div>
        </div>

        {/* Personal Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="text-slate-400 block mb-1">Full Name</label>
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2">
              <User className="w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                value={profile.fullName}
                onChange={(e) => onUpdateProfile({ ...profile, fullName: e.target.value })}
                className="bg-transparent w-full text-slate-200 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Email</label>
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2">
              <Mail className="w-3.5 h-3.5 text-slate-500" />
              <input
                type="email"
                value={profile.email}
                onChange={(e) => onUpdateProfile({ ...profile, email: e.target.value })}
                className="bg-transparent w-full text-slate-200 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Phone</label>
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2">
              <Phone className="w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                value={profile.phone}
                onChange={(e) => onUpdateProfile({ ...profile, phone: e.target.value })}
                className="bg-transparent w-full text-slate-200 focus:outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Location</label>
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                value={profile.location}
                onChange={(e) => onUpdateProfile({ ...profile, location: e.target.value })}
                className="bg-transparent w-full text-slate-200 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Professional Headline */}
        <div>
          <label className="text-xs text-slate-400 block mb-1">Professional Headline</label>
          <input
            type="text"
            value={profile.headline}
            onChange={(e) => onUpdateProfile({ ...profile, headline: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
          />
        </div>

        {/* Executive Summary */}
        <div>
          <label className="text-xs text-slate-400 block mb-1">Executive Summary</label>
          <textarea
            value={profile.summary}
            onChange={(e) => onUpdateProfile({ ...profile, summary: e.target.value })}
            rows={3}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs leading-relaxed text-slate-200 focus:outline-none focus:border-emerald-500/50"
          />
        </div>

        {/* Technical Skills Tag Editor */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-300">
              Verified Technical Competencies ({profile.skills.length})
            </label>
            <span className="text-xs text-slate-500">Press enter to add skill</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-3">
            {profile.skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono"
              >
                <span>{skill}</span>
                <button
                  onClick={() => handleRemoveSkill(skill)}
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
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={handleAddSkill}
              placeholder="e.g. Next.js, Docker, Kubernetes"
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50 flex-1"
            />
            <button
              onClick={handleAddSkill}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors border border-slate-700 flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Work Experience */}
        <div>
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-emerald-400" />
            <span>Extracted Career History</span>
          </h4>

          <div className="space-y-4">
            {profile.experience.map((exp, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2 text-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-semibold text-slate-100">
                    <span>{exp.role}</span>
                    <span className="text-slate-500 mx-1.5">·</span>
                    <span className="text-emerald-400">{exp.company}</span>
                  </div>
                  <span className="text-slate-400 font-mono tabular-nums">{exp.period}</span>
                </div>
                <ul className="space-y-1 text-slate-300 pl-4 list-disc marker:text-emerald-500/60 leading-relaxed">
                  {exp.highlights.map((h, hIdx) => (
                    <li key={hIdx}>{h}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
