# Auto-Apply Job Scanner & Application Tracker (ApplyPulse)

An intelligent career automation platform that matches job openings against your uploaded resume, automatically crafts high-converting tailored cover letters using Gemini AI, and provides a 1-click assisted application workflow with complete pipeline status tracking.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The following key product decisions have been confirmed and incorporated into the design:

- **Assisted Auto-Apply Workflow**: The application runs an assisted workflow where jobs matching your preference settings are flagged, custom cover letters are automatically drafted and paired with candidate highlights, and users can copy the tailored letter in 1 click and jump directly to the verified employer application URL.
- **Resume Upload & AI Extraction**: Accepts PDF and document uploads (or text dossiers) and automatically extracts key skills, past experiences, career trajectory, and achievements using Gemini 3.8 Flash via a dedicated server-side endpoint.
- **Split-View Visual Experience**: Built in a compact high-density split view: the left pane hosts live job feeds, preference filters, and pipeline trackers; the right pane displays the active application inspector, skill match breakdown, and editable live cover letter preview.

---

### 1. Overview & Core Concept

**ApplyPulse** solves the grueling manual grind of job hunting by combining automated job opening discovery, resume-aligned algorithmic matching, AI-powered custom cover letter generation, and lifecycle application tracking in one unified interface.

- **Target Persona**: Job seekers and professionals seeking efficient, high-volume, yet high-quality applications tailored specifically to their verified experience.
- **Key Value Proposition**: Reduces application time from 45 minutes to under 30 seconds per role while increasing callback potential through role-specific, company-grounded cover letter personalization.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                            APPLYPULSE WORKSPACE                              │
├─────────────────────┬────────────────────────────────────────────────────────┤
│  Top Navigation Bar │ Brand "ApplyPulse" · Scanner · Tracker · Profile · Run │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ LEFT VIEWPORT (60%) │ RIGHT PREVIEW PANE (40%)                               │
│                     │                                                        │
│ [Preferences Bar]   │ [Job Details & Company Profile]                       │
│ - Titles, Locations │ - Match Score breakdown (Matched vs Missing Skills)    │
│ - Min Salary, Modes │                                                        │
│                     │ [Tailored Cover Letter Generator]                      │
│ [Job Openings List] │ - AI-generated role-specific cover letter              │
│ - Match % Badges    │ - Tone selector (Confident, Direct, Technical)         │
│ - Role & Company    │ - Live editor with auto-save                           │
│ - Salary & Board    │                                                        │
│                     │ [1-Click Action Bar]                                   │
│ [Application Board] │ - "Copy Cover Letter" (instant clipboard)              │
│ - Status Kanban     │ - "Open Application Link" (external portal)           │
│ - Applied / Offers  │ - "Update Application Status" (Applied, Interviewing)  │
└─────────────────────┴────────────────────────────────────────────────────────┘
```

---

### 2. User Experience & Visual Design

#### A. Key User Flows
1. **Resume Ingestion & Profile Setup**:
   - User uploads a resume (PDF/DOC/TXT) or loads a pre-configured template.
   - The server parses text and invokes Gemini 3.8 Flash to extract candidate details: Full Name, Contact Info, Headline, Core Competencies, Work History with quantified metrics, and Education.
   - User reviews and can tweak extracted attributes in the Profile Drawer.
2. **Preference Settings Configuration**:
   - Filter criteria: Target Job Titles (e.g., Full Stack Engineer, Frontend Architect, Product Engineer), Work Mode (Remote, Hybrid, On-site), Location, Minimum Salary ($120k+), Match Threshold (e.g., >75%), and Excluded Keywords.
3. **Job Scanning & Match Engine**:
   - Scanner scans live and curated job board listings (Greenhouse, Lever, LinkedIn, Workday, tech boards).
   - Match engine scores each job against the candidate's extracted profile, highlighting "Skills Matched", "Experience Overlap", and "Gaps to Address".
4. **Automated Cover Letter Generation & 1-Click Launch**:
   - Selecting any job triggers instant AI cover letter generation (or loads pre-drafted versions).
   - Gemini writes an executive 3-paragraph letter: compelling intro with company hook, concrete career proof tailored to job requirements, and an actionable closing.
   - User clicks **"Copy Cover Letter & Open Link"**; clipboard copies text while external job application link launches in a new tab.
5. **Lifecycle Application Status Tracking**:
   - Automatically moves the job into the **Applied** status column.
   - Track statuses across Kanban columns or compact table rows: *Drafted*, *Applied*, *Reviewing*, *Interview Scheduled*, *Offer Received*, and *Declined/Archived*.
   - Add custom notes, application dates, salary offered, and interview rounds.

#### B. Visual Identity & Theme (SaaS Dashboard Guidelines)
- **Aesthetic Direction**: Compact, dark executive suite (`#0F172A` deep canvas, `#1E293B` elevated cards, `#334155` subtle hairline dividers).
- **Zero-Pill Restraint**: Metadata (e.g., salary, location, post date) is displayed as clean unboxed text separated by typographic middots (`·`) rather than garish capsule pills.
- **Color Accent Discipline (60-30-10)**:
  - 60% Dark Slate background (`#0F172A`, `#1E293B`).
  - 30% Structural borders, subtle dividers, and muted text (`#94A3B8`).
  - 10% High-intent emerald & teal actions (`#10B981` for high matches/primary CTAs, `#38BDF8` for secondary actions).
- **Typography**: Clean, readable sans (`Plus Jakarta Sans` / modern system neo-grotesque) for headings and UI controls, paired with `font-mono tabular-nums` for salary numbers, dates, match percentages, and stats.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Assisted 1-Click Apply vs Full Bot Auto-Submit**
  - *Chosen Approach*: Assisted 1-click apply with automated cover letter copying and external portal routing.
  - *Why*: Major job platforms (Workday, Greenhouse, Taleo) employ aggressive bot detection, CAPTCHAs, and multi-factor auth that break headless crawlers and cause account bans. Assisted mode ensures 100% compliance, zero bot bans, and empowers candidates to review AI-generated letters before submission.
  - *Alternatives Considered*: Background headless puppeteer submissions (frequently fail, cause profile blacklists, and misrepresent applicants).
- **Decision 2: Server-Side Gemini API Integration**
  - *Chosen Approach*: Full-stack Express server (`server.ts`) hosting secure `/api/resume/parse` and `/api/cover-letter/generate` endpoints using `@google/genai` with `gemini-3.8-flash`.
  - *Why*: Strictly complies with security standards by never exposing `GEMINI_API_KEY` to client browser bundles.
- **Decision 3: Local Storage Persistence with Seeded Datasets**
  - *Chosen Approach*: Instant responsive client-side persistence in `localStorage` seeded with realistic tech openings across diverse levels (Frontend, Full Stack, AI Engineer, Product Design) and demo resume profiles for out-of-the-box readiness without requiring external database setups.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                          SYSTEM ARCHITECTURE                           │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   [ React 19 Frontend Client (Vite / Tailwind CSS 4) ]                 │
│      │                                                                 │
│      ├── JobScannerView (Search, Filters, Job Cards with Match %)       │
│      ├── ApplicationInspector (Live Match, Job Desc, Cover Letter)     │
│      ├── ApplicationTracker (Kanban & Table Status Pipeline)           │
│      ├── ResumeProfileManager (File Dropzone, Profile Editor)          │
│      └── PreferenceDrawer (Criteria, Thresholds, Exclusions)           │
│                                                                        │
│                     │  HTTP / JSON Requests                            │
│                     ▼                                                  │
│   [ Express Backend Server (server.ts / tsx) ]                         │
│      │                                                                 │
│      ├── POST /api/resume/parse                                        │
│      │     └── Uses Gemini 3.8 Flash to extract structured JSON profile│
│      │                                                                 │
│      ├── POST /api/cover-letter/generate                               │
│      │     └── Uses Gemini 3.8 Flash to generate targeted cover letter │
│      │                                                                 │
│      └── GET /api/jobs/feed                                            │
│            └── Returns rich curated tech job openings with apply URLs  │
│                                                                        │
│                     │                                                  │
│                     ▼                                                  │
│   [ Google GenAI SDK (@google/genai) ]                                 │
│      └── Model: "gemini-3.8-flash" (with User-Agent: 'aistudio-build') │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

#### Core Data Entities:
```typescript
interface JobOpening {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  workMode: 'Remote' | 'Hybrid' | 'On-site';
  salaryRange: string;
  minSalary: number;
  experienceLevel: 'Entry' | 'Mid' | 'Senior' | 'Lead';
  jobBoard: 'Greenhouse' | 'Lever' | 'LinkedIn' | 'Workday' | 'Direct';
  applyUrl: string;
  postedDate: string;
  description: string;
  requiredSkills: string[];
  niceToHaveSkills: string[];
  matchScore?: number;
  matchedSkills?: string[];
  missingSkills?: string[];
}

interface CandidateProfile {
  fullName: string;
  email: string;
  phone: string;
  headline: string;
  location: string;
  summary: string;
  skills: string[];
  experience: {
    role: string;
    company: string;
    period: string;
    highlights: string[];
  }[];
  education: string[];
}

interface ApplicationTrackerEntry {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  location: string;
  salary: string;
  applyUrl: string;
  status: 'Drafted' | 'Applied' | 'Reviewing' | 'Interview' | 'Offer' | 'Archived';
  appliedDate: string;
  coverLetter: string;
  notes: string;
  nextFollowUpDate?: string;
}
```

---

### Step-by-Step Implementation Sequence

1. **Full-Stack Server Setup (`server.ts`)**:
   - Configure Express with json parsing and serve static Vite production bundle in production.
   - Implement `/api/resume/parse` with Gemini 3.8 Flash and JSON response schema.
   - Implement `/api/cover-letter/generate` with customizable tone and emphasis.
   - Update `package.json` scripts to run `server.ts` with `tsx` and configure dev proxy in `vite.config.ts`.
2. **Resume & Preference Engines**:
   - Build file upload dropzone supporting PDF, Word, and text files.
   - Extract text content client-side or forward buffer to server for structured extraction.
   - Build settings drawer for role preferences, location, minimum salary, and keywords.
3. **Job Scanner & Algorithmic Matcher**:
   - Provide rich database of tech jobs with authentic application links.
   - Calculate match percentage dynamically against candidate profile skills and experience.
4. **Split-View Workspace & Cover Letter Studio**:
   - Left side: High-density search, filters, job list with match indicator.
   - Right side: Inspector tab, live cover letter generator with tone switchers, copy to clipboard, and external link launcher.
5. **Application Status Pipeline (Kanban & Table Views)**:
   - Status movement buttons (Drafted -> Applied -> Interview -> Offer).
   - Editable application notes, dates, and status badges.
6. **Polishing & Verification**:
   - Test end-to-end flow with simulated resume files and Gemini cover letter generation.
   - Verify layout responsiveness, WCAG AA contrast, and zero-pill typographic standards.
   - Run compilation and verify build stability.
