import { CandidateProfile, JobOpening, PreferenceSettings } from '../types';

// Semantic synonym clusters for tech skill cross-matching
const SYNONYM_CLUSTERS: Record<string, string[]> = {
  // Test Automation & QA
  playwright: ['playwright', 'cypress', 'selenium', 'e2e', 'test automation', 'testing (jest/playwright)', 'browser automation'],
  cypress: ['cypress', 'playwright', 'selenium', 'e2e', 'test automation', 'regression testing'],
  selenium: ['selenium', 'selenium webdriver', 'webdriver', 'playwright', 'cypress', 'appium'],
  'api testing': ['api testing', 'postman', 'rest apis', 'restful', 'newman', 'endpoint testing', 'integration testing'],
  postman: ['postman', 'newman', 'api testing', 'rest apis', 'insomnia'],
  'test automation frameworks': ['test automation frameworks', 'test automation', 'automation frameworks', 'e2e testing', 'automated testing', 'qa automation', 'quality assurance'],
  'mobile testing': ['mobile testing', 'appium', 'xcuitest', 'espresso', 'ios testing', 'android testing'],
  appium: ['appium', 'mobile testing', 'xcuitest', 'espresso'],
  xcuitest: ['xcuitest', 'appium', 'mobile testing', 'ios testing'],
  espresso: ['espresso', 'appium', 'mobile testing', 'android testing'],
  'performance testing (k6)': ['performance testing (k6)', 'k6', 'jmeter', 'load testing', 'stress testing', 'performance benchmarking'],
  jmeter: ['jmeter', 'k6', 'performance testing', 'load testing'],
  
  // Languages & Core Runtimes
  typescript: ['typescript', 'javascript', 'ts', 'js', 'node.js'],
  javascript: ['javascript', 'typescript', 'js', 'node.js', 'es6'],
  python: ['python', 'py', 'fastapi', 'flask', 'django'],
  go: ['go', 'golang'],
  sql: ['sql', 'postgresql', 'postgres', 'mysql', 'sqlite', 'database', 'relational databases'],
  postgresql: ['postgresql', 'postgres', 'sql', 'relational database'],
  
  // Frontend
  react: ['react', 'react.js', 'next.js', 'frontend', 'ui'],
  'next.js': ['next.js', 'react', 'react server components', 'ssr'],
  'tailwind css': ['tailwind css', 'tailwind', 'css', 'css architecture'],
  'state management': ['state management', 'redux', 'zustand', 'context api', 'state architectures'],
  'web performance': ['web performance', 'web vitals', 'lighthouse', 'optimization', 'bundle size'],
  'design systems': ['design systems', 'component libraries', 'storybook', 'ui/ux', 'design tokens', 'css/design tokens'],
  
  // Infrastructure & DevOps
  'ci/cd pipelines': ['ci/cd pipelines', 'ci/cd', 'github actions', 'jenkins', 'gitlab ci', 'pipelines', 'devops'],
  docker: ['docker', 'containers', 'containerization', 'kubernetes'],
  kubernetes: ['kubernetes', 'k8s', 'docker', 'cloud infrastructure'],
  'rest apis': ['rest apis', 'restful', 'api testing', 'endpoints', 'graphql', 'http'],
  'system architecture': ['system architecture', 'distributed systems', 'cloud infrastructure', 'software architecture']
};

// Check semantic or practical match score between candidate proof points and a target skill
function evaluateSkillMatch(
  targetSkill: string,
  candidateSkills: string[],
  experienceText: string,
  profileSummary: string
): { matched: boolean; weight: number; matchSource: string } {
  const targetLower = targetSkill.toLowerCase().trim();

  // 1. Exact string match with candidate skills
  for (const s of candidateSkills) {
    const sLower = s.toLowerCase().trim();
    if (sLower === targetLower) {
      return { matched: true, weight: 1.0, matchSource: s };
    }
  }

  // 2. Direct synonym cluster match
  const clusterKey = Object.keys(SYNONYM_CLUSTERS).find(
    (key) => key === targetLower || targetLower.includes(key) || key.includes(targetLower)
  );

  if (clusterKey) {
    const synonyms = SYNONYM_CLUSTERS[clusterKey];
    for (const s of candidateSkills) {
      const sLower = s.toLowerCase().trim();
      if (synonyms.some((syn) => syn === sLower || sLower.includes(syn) || syn.includes(sLower))) {
        return { matched: true, weight: 0.95, matchSource: s };
      }
    }
  }

  // 3. Substring inclusion
  for (const s of candidateSkills) {
    const sLower = s.toLowerCase().trim();
    if (sLower.includes(targetLower) || targetLower.includes(sLower)) {
      return { matched: true, weight: 0.88, matchSource: s };
    }
  }

  // 4. Mentioned in candidate experience highlights or career summary
  const combinedContext = `${experienceText} ${profileSummary}`.toLowerCase();
  if (combinedContext.includes(targetLower)) {
    return { matched: true, weight: 0.82, matchSource: 'Experience Dossier' };
  }

  // Check cluster terms in experience context
  if (clusterKey) {
    const synonyms = SYNONYM_CLUSTERS[clusterKey];
    for (const syn of synonyms) {
      if (combinedContext.includes(syn)) {
        return { matched: true, weight: 0.75, matchSource: 'Experience History' };
      }
    }
  }

  // 5. Transferable tech domain overlap
  const isTargetTesting = /test|qa|sdet|cypress|playwright|selenium|k6|jmeter|automation/i.test(targetLower);
  const isCandidateTesting = candidateSkills.some((s) => /test|qa|sdet|cypress|playwright|selenium/i.test(s));
  if (isTargetTesting && isCandidateTesting) {
    return { matched: true, weight: 0.65, matchSource: 'QA Automation Domain' };
  }

  return { matched: false, weight: 0, matchSource: '' };
}

// Generate deterministic micro-variance (e.g. -2 to +3) based on string hash so scores don't tie
function getDeterministicOffset(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return (Math.abs(hash) % 5) - 2;
}

export function calculateJobMatch(
  job: JobOpening,
  profile: CandidateProfile,
  preferences?: PreferenceSettings
): {
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
  rationale: string;
} {
  const candidateSkills = profile.skills || [];

  // Extract all text evidence from experience highlights
  const experienceText = (profile.experience || [])
    .map((exp) => `${exp.role} ${exp.company} ${(exp.highlights || []).join(' ')}`)
    .join(' ');
  const profileSummary = `${profile.headline || ''} ${profile.summary || ''}`;

  // Evaluate Required Skills (55% weight)
  const matchedRequired: string[] = [];
  const missingRequired: string[] = [];
  let reqWeightSum = 0;

  const reqSkills = job.requiredSkills || [];
  reqSkills.forEach((skill) => {
    const match = evaluateSkillMatch(skill, candidateSkills, experienceText, profileSummary);
    if (match.matched && match.weight >= 0.65) {
      matchedRequired.push(skill);
      reqWeightSum += match.weight;
    } else {
      missingRequired.push(skill);
    }
  });

  const reqTotal = reqSkills.length || 1;
  const reqScore = (reqWeightSum / reqTotal) * 55;

  // Evaluate Nice to Have Skills (15% weight)
  const matchedNice: string[] = [];
  let niceWeightSum = 0;
  const niceSkills = job.niceToHaveSkills || [];
  niceSkills.forEach((skill) => {
    const match = evaluateSkillMatch(skill, candidateSkills, experienceText, profileSummary);
    if (match.matched && match.weight >= 0.65) {
      matchedNice.push(skill);
      niceWeightSum += match.weight;
    }
  });

  const niceTotal = niceSkills.length || 1;
  const niceScore = (niceWeightSum / niceTotal) * 15;

  // Evaluate Role & Career Trajectory Alignment (20% weight)
  const titleLower = job.title.toLowerCase();
  const headlineLower = (profile.headline || '').toLowerCase();
  const targetRoles = (profile.targetRoles || []).map((r) => r.toLowerCase());
  const expRoles = (profile.experience || []).map((e) => e.role.toLowerCase());

  let roleScore = 6; // baseline software overlap

  const isQaJob = /\b(qa|sdet|test|quality|tester|automation)\b/i.test(titleLower);
  const isFrontendJob = /\b(frontend|front-end|ui|react|design systems)\b/i.test(titleLower);
  const isFullstackJob = /\b(full stack|fullstack|software engineer|systems architect)\b/i.test(titleLower);
  const isAiJob = /\b(ai|machine learning|llm)\b/i.test(titleLower);

  const candidateIsQa =
    /\b(qa|sdet|test|quality|tester|automation)\b/i.test(headlineLower) ||
    targetRoles.some((r) => /\b(qa|sdet|test|quality)\b/i.test(r)) ||
    expRoles.some((r) => /\b(qa|sdet|test)\b/i.test(r));

  const candidateIsFrontend =
    /\b(frontend|front-end|ui|react)\b/i.test(headlineLower) ||
    targetRoles.some((r) => /\b(frontend|ui)\b/i.test(r));

  const candidateIsAi =
    /\b(ai|machine learning|llm)\b/i.test(headlineLower) ||
    targetRoles.some((r) => /\b(ai|llm)\b/i.test(r));

  if (isQaJob) {
    if (candidateIsQa) {
      roleScore = 20; // Exact functional domain match
    } else if (candidateIsFrontend || isFullstackJob) {
      roleScore = 8; // Partial transferability
    } else {
      roleScore = 5;
    }
  } else if (isFrontendJob) {
    if (candidateIsFrontend) {
      roleScore = 20;
    } else if (candidateIsQa) {
      roleScore = 7;
    } else {
      roleScore = 10;
    }
  } else if (isAiJob) {
    if (candidateIsAi) {
      roleScore = 20;
    } else {
      roleScore = 10;
    }
  } else {
    // General engineering role
    const hasDirectTitleMatch = targetRoles.some(
      (r) => titleLower.includes(r) || r.includes(titleLower)
    );
    roleScore = hasDirectTitleMatch ? 18 : 12;
  }

  // Seniority & Experience Depth Alignment (10% weight)
  const jobSeniority = job.experienceLevel; // Entry, Mid, Senior, Lead
  const candidateSeniority =
    /\b(lead|staff|principal|director)\b/i.test(headlineLower)
      ? 'Lead'
      : /\b(senior|sr)\b/i.test(headlineLower)
      ? 'Senior'
      : 'Mid';

  let seniorityScore = 7;
  if (jobSeniority === candidateSeniority) {
    seniorityScore = 10;
  } else if (jobSeniority === 'Senior' && candidateSeniority === 'Lead') {
    seniorityScore = 10;
  } else if (jobSeniority === 'Mid' && (candidateSeniority === 'Senior' || candidateSeniority === 'Lead')) {
    seniorityScore = 9;
  } else if (jobSeniority === 'Lead' && candidateSeniority === 'Mid') {
    seniorityScore = 5;
  }

  // Compute Raw Composite Score without artificial floor
  let rawScore = Math.round(reqScore + niceScore + roleScore + seniorityScore);

  // Apply deterministic micro-variance (+- 2%) so identical skill counts don't display identical percentages
  const variance = getDeterministicOffset(`${job.id}-${profile.fullName}-${job.title}`);
  rawScore = rawScore + variance;

  // Real dynamic range: from 22% (poor fit) up to 98% (exceptional match)
  const score = Math.max(22, Math.min(98, rawScore));

  // Dynamic, context-specific rationale tailored to this candidate and this opening
  let rationale = '';
  if (score >= 88) {
    rationale = `Exceptional fit (${score}%): Direct alignment with ${matchedRequired.length}/${reqSkills.length} required competencies (${matchedRequired.slice(0, 3).join(', ')}) and targeted career trajectory for ${job.title}.`;
  } else if (score >= 72) {
    const gaps = missingRequired.slice(0, 2).join(' and ');
    rationale = `Competitive match (${score}%): Solid core strengths in ${matchedRequired.slice(0, 3).join(', ')}${gaps ? `, with minor growth areas in ${gaps}` : ''}.`;
  } else if (score >= 50) {
    const gaps = missingRequired.slice(0, 2).join(' and ');
    rationale = `Moderate fit (${score}%): Foundational overlap in ${matchedRequired.slice(0, 2).join(', ') || 'software fundamentals'}, but primary requirements call for deeper ${gaps || 'specialized experience'}.`;
  } else {
    rationale = `Low match (${score}%): Significant skill gap. The role demands specialized expertise in ${missingRequired.slice(0, 3).join(', ')} which are not prominent in your active profile.`;
  }

  return {
    score,
    matchedSkills: Array.from(new Set([...matchedRequired, ...matchedNice])),
    missingSkills: missingRequired,
    rationale,
  };
}

export function filterJobsByPreferences(
  jobs: JobOpening[],
  preferences: PreferenceSettings,
  searchQuery: string = ''
): JobOpening[] {
  const isDirectSearch = Boolean(searchQuery && searchQuery.trim());
  const q = isDirectSearch ? searchQuery.toLowerCase().trim() : '';

  return jobs.filter((job) => {
    // Search query filter
    if (isDirectSearch) {
      const text = `${job.title} ${job.company} ${job.description} ${job.location} ${job.department || ''} ${job.requiredSkills.join(' ')} ${job.niceToHaveSkills?.join(' ') || ''}`.toLowerCase();

      let matchesQuery = text.includes(q);

      // Intelligent synonym expansion
      if (!matchesQuery) {
        // QA / Testing synonyms
        if (q === 'qa' || q === 'tester' || q === 'testing' || q === 'sdet') {
          matchesQuery =
            text.includes('qa') ||
            text.includes('quality') ||
            text.includes('test') ||
            text.includes('sdet') ||
            text.includes('playwright') ||
            text.includes('cypress') ||
            text.includes('selenium') ||
            text.includes('automation');
        }
        // Frontend synonyms
        else if (q === 'fe' || q === 'frontend' || q === 'front-end' || q === 'ui') {
          matchesQuery =
            text.includes('frontend') ||
            text.includes('front-end') ||
            text.includes('react') ||
            text.includes('ui/ux') ||
            text.includes('css');
        }
        // Backend synonyms
        else if (q === 'be' || q === 'backend' || q === 'back-end') {
          matchesQuery =
            text.includes('backend') ||
            text.includes('back-end') ||
            text.includes('node') ||
            text.includes('api') ||
            text.includes('python') ||
            text.includes('cloud') ||
            text.includes('distributed');
        }
      }

      if (!matchesQuery) return false;
    }

    // Work Mode filter
    if (preferences.workMode && preferences.workMode !== 'All') {
      if (job.workMode.toLowerCase() !== preferences.workMode.toLowerCase()) {
        return false;
      }
    }

    // Excluded keywords (always apply)
    if (preferences.excludedKeywords?.length) {
      const jobFull = `${job.title} ${job.description}`.toLowerCase();
      const hasExcluded = preferences.excludedKeywords.some(
        (kw) => kw.trim() && jobFull.includes(kw.trim().toLowerCase())
      );
      if (hasExcluded) return false;
    }

    // When user types a specific search keyword, DO NOT hide search results due to profile match score
    // or minimum salary. When not searching, apply user's preference thresholds.
    if (!isDirectSearch) {
      if (preferences.minSalary && job.minSalary < preferences.minSalary) {
        return false;
      }
      if (job.matchScore !== undefined && preferences.minMatchScore && job.matchScore < preferences.minMatchScore) {
        return false;
      }
    }

    return true;
  });
}
