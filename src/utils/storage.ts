import { CandidateProfile, PreferenceSettings, ApplicationTrackerEntry, JobOpening } from '../types';
import { DEFAULT_CANDIDATE, DEFAULT_PREFERENCES, INITIAL_JOBS, INITIAL_TRACKED_APPLICATIONS } from '../data/mockData';

const STORAGE_KEYS = {
  PROFILE: 'applypulse_candidate_profile_v1',
  PREFERENCES: 'applypulse_preferences_v1',
  TRACKED_APPS: 'applypulse_tracked_applications_v1',
  CUSTOM_JOBS: 'applypulse_custom_jobs_v1',
};

export function loadStoredProfile(): CandidateProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading profile from storage', e);
  }
  return DEFAULT_CANDIDATE;
}

export function saveStoredProfile(profile: CandidateProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Error saving profile to storage', e);
  }
}

export function loadStoredPreferences(): PreferenceSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading preferences from storage', e);
  }
  return DEFAULT_PREFERENCES;
}

export function saveStoredPreferences(prefs: PreferenceSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(prefs));
  } catch (e) {
    console.error('Error saving preferences to storage', e);
  }
}

export function loadStoredApplications(): ApplicationTrackerEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRACKED_APPS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading tracked apps from storage', e);
  }
  return INITIAL_TRACKED_APPLICATIONS;
}

export function saveStoredApplications(apps: ApplicationTrackerEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TRACKED_APPS, JSON.stringify(apps));
  } catch (e) {
    console.error('Error saving applications to storage', e);
  }
}

export function loadStoredJobs(): JobOpening[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_JOBS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Merge any new initial jobs (like QA/SDET) that may not exist in the user's stored list
        const existingIds = new Set(parsed.map((j: JobOpening) => j.id));
        const missingInitial = INITIAL_JOBS.filter((j) => !existingIds.has(j.id));
        if (missingInitial.length > 0) {
          const merged = [...missingInitial, ...parsed];
          localStorage.setItem(STORAGE_KEYS.CUSTOM_JOBS, JSON.stringify(merged));
          return merged;
        }
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading jobs from storage', e);
  }
  return INITIAL_JOBS;
}

export function saveStoredJobs(jobs: JobOpening[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_JOBS, JSON.stringify(jobs));
  } catch (e) {
    console.error('Error saving jobs to storage', e);
  }
}

export function resetAllToDefaults(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
    localStorage.removeItem(STORAGE_KEYS.PREFERENCES);
    localStorage.removeItem(STORAGE_KEYS.TRACKED_APPS);
    localStorage.removeItem(STORAGE_KEYS.CUSTOM_JOBS);
  } catch (e) {
    console.error('Error resetting storage', e);
  }
}
