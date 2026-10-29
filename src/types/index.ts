export type WorkMode = 'Remote' | 'Hybrid' | 'On-site' | 'All';
export type JobBoardType = 'Greenhouse' | 'Lever' | 'LinkedIn' | 'Workday' | 'Direct';
export type ApplicationStatus = 'Drafted' | 'Applied' | 'Reviewing' | 'Interview' | 'Offer' | 'Archived';
export type CoverLetterTone = 'confident' | 'technical' | 'direct' | 'collaborative';

export interface JobOpening {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  workMode: 'Remote' | 'Hybrid' | 'On-site';
  salaryRange: string;
  minSalary: number;
  experienceLevel: 'Entry' | 'Mid' | 'Senior' | 'Lead';
  jobBoard: JobBoardType;
  applyUrl: string;
  postedDate: string;
  description: string;
  requiredSkills: string[];
  niceToHaveSkills: string[];
  department?: string;
  matchScore?: number;
  matchedSkills?: string[];
  missingSkills?: string[];
  matchRationale?: string;
}

export interface CandidateExperience {
  role: string;
  company: string;
  period: string;
  highlights: string[];
}

export interface CandidateProfile {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  headline: string;
  summary: string;
  skills: string[];
  targetRoles: string[];
  experience: CandidateExperience[];
  education: string[];
}

export interface PreferenceSettings {
  targetTitles: string[];
  workMode: WorkMode;
  locations: string[];
  minSalary: number;
  minMatchScore: number;
  excludedKeywords: string[];
  preferredJobBoards: JobBoardType[];
  autoDraftCoverLetter: boolean;
}

export interface ApplicationTrackerEntry {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  location: string;
  salary: string;
  applyUrl: string;
  status: ApplicationStatus;
  appliedDate: string;
  updatedDate: string;
  coverLetter: string;
  matchScore: number;
  notes: string;
  interviewDate?: string;
}
