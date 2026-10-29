import { CandidateProfile, PreferenceSettings, JobOpening, ApplicationTrackerEntry } from '../types';

export const DEFAULT_CANDIDATE: CandidateProfile = {
  fullName: 'Alex Chen',
  email: 'alex.chen.engineer@gmail.com',
  phone: '+1 (415) 890-4321',
  location: 'San Francisco, CA (Open to Remote)',
  headline: 'Senior Full Stack & Frontend Engineer',
  summary: 'Product-focused software engineer with 5+ years of experience building resilient web applications, developer tools, and high-performance user interfaces. Proven track record leading design system adoption and optimizing high-traffic React applications.',
  skills: [
    'React',
    'TypeScript',
    'Node.js',
    'Tailwind CSS',
    'Next.js',
    'GraphQL',
    'REST APIs',
    'PostgreSQL',
    'State Management',
    'Web Performance',
    'WebSockets',
    'Git',
    'System Architecture',
    'Design Systems'
  ],
  targetRoles: ['Senior Frontend Engineer', 'Full Stack Engineer', 'Lead UI Engineer', 'Software Engineer'],
  experience: [
    {
      role: 'Senior Software Engineer',
      company: 'Veloce Labs',
      period: '2022 - Present',
      highlights: [
        'Architected modular React/TypeScript dashboard serving 80,000+ active enterprise users with 99.98% uptime.',
        'Reduced client-side bundle size by 38% and improved Core Web Vitals (LCP < 1.2s) across core revenue funnels.',
        'Mentored 4 junior engineers and spearheaded cross-functional design system rollout.'
      ]
    },
    {
      role: 'Full Stack Developer',
      company: 'Cascade Digital',
      period: '2020 - 2022',
      highlights: [
        'Built scalable Node.js microservices and RESTful endpoints handling 12M+ monthly API requests.',
        'Implemented real-time WebSocket notifications and collaborative state synchronization.',
        'Collaborated closely with product designers to ship 14 major customer-facing features.'
      ]
    }
  ],
  education: ['B.S. in Computer Science - University of California, Berkeley']
};

export const QA_CANDIDATE: CandidateProfile = {
  fullName: 'Sarah Jenkins',
  email: 'sarah.jenkins.qa@gmail.com',
  phone: '+1 (415) 782-9912',
  location: 'Austin, TX (Open to Remote)',
  headline: 'Senior QA Automation Engineer & SDET Lead',
  summary: 'Senior QA Automation Engineer with 6+ years specializing in building resilient end-to-end testing frameworks (Playwright, Cypress), distributed API test suites (Postman, REST Assured), and automated CI/CD quality gates. Passionate about defect prevention, flaky test elimination, and performance benchmarking.',
  skills: [
    'Playwright',
    'Cypress',
    'TypeScript',
    'Python',
    'Selenium WebDriver',
    'API Testing',
    'Postman',
    'Jest',
    'CI/CD Pipelines',
    'Docker',
    'Performance Testing (k6)',
    'Test Automation Frameworks',
    'JIRA',
    'Git',
    'SQL'
  ],
  targetRoles: [
    'Senior QA Automation Engineer',
    'SDET',
    'Lead QA Engineer',
    'Quality Assurance Engineer',
    'Automation Test Engineer'
  ],
  experience: [
    {
      role: 'Senior QA Automation Engineer',
      company: 'CloudScale Technologies',
      period: '2022 - Present',
      highlights: [
        'Architected greenfield Playwright & TypeScript test framework covering 450+ core E2E user journeys, cutting regression testing cycle from 3 days to 45 minutes.',
        'Engineered distributed API automation suite with Postman and Newman integrated into GitHub Actions CI/CD.',
        'Reduced test suite flakiness by 82% via custom deterministic waiting mechanisms and isolated test data generation.'
      ]
    },
    {
      role: 'QA Engineer / SDET',
      company: 'Apex Financial Systems',
      period: '2019 - 2022',
      highlights: [
        'Designed Cypress E2E automation for high-volume payments ledger processing $40M+ daily transactions.',
        'Constructed load and stress testing scripts using k6 and JMeter, diagnosing 12 critical concurrency bottlenecks before production releases.',
        'Partnered closely with developers and product managers to champion TDD/BDD practices and zero-defect release criteria.'
      ]
    }
  ],
  education: ['B.S. in Software Engineering - University of Texas at Austin']
};

export const DEFAULT_PREFERENCES: PreferenceSettings = {
  targetTitles: [
    'Senior QA Automation Engineer',
    'SDET',
    'Senior Frontend Engineer',
    'Full Stack Engineer',
    'Quality Assurance Engineer',
    'Software Engineer'
  ],
  workMode: 'All',
  locations: ['Remote', 'San Francisco, CA', 'New York, NY', 'Austin, TX'],
  minSalary: 100000,
  minMatchScore: 40,
  excludedKeywords: ['Legacy PHP', 'Cold Calling'],
  preferredJobBoards: ['Greenhouse', 'Lever', 'LinkedIn', 'Workday', 'Direct'],
  autoDraftCoverLetter: true
};

export const INITIAL_JOBS: JobOpening[] = [
  // --- QA & SDET ROLES ---
  {
    id: 'job-qa-1',
    title: 'Senior QA Automation Engineer',
    company: 'Datadog',
    location: 'San Francisco, CA',
    workMode: 'Remote',
    salaryRange: '$150,000 - $190,000',
    minSalary: 150000,
    experienceLevel: 'Senior',
    jobBoard: 'Greenhouse',
    applyUrl: 'https://careers.datadoghq.com/',
    postedDate: '1 hour ago',
    description: 'We are looking for a Senior QA Automation Engineer to design, scale, and maintain automated test infrastructure for our cloud monitoring dashboards. You will build comprehensive E2E automation with Playwright and TypeScript, integrate quality gates into CI/CD, and establish zero-tolerance reliability benchmarks.',
    requiredSkills: ['Playwright', 'TypeScript', 'Cypress', 'CI/CD Pipelines', 'API Testing', 'Test Automation Frameworks'],
    niceToHaveSkills: ['Python', 'Docker', 'k6', 'Observability'],
    department: 'Quality & Observability'
  },
  {
    id: 'job-qa-2',
    title: 'Lead SDET (Software Development Engineer in Test)',
    company: 'Netflix',
    location: 'Los Gatos, CA',
    workMode: 'Hybrid',
    salaryRange: '$195,000 - $255,000',
    minSalary: 195000,
    experienceLevel: 'Lead',
    jobBoard: 'Lever',
    applyUrl: 'https://jobs.netflix.com/',
    postedDate: '3 hours ago',
    description: 'Netflix is seeking a Lead SDET to pioneer resilient testing architectures across our streaming media engines and developer platforms. You will engineer distributed test harnesses, automate chaos and resilience scenarios, and mentor cross-functional quality engineers.',
    requiredSkills: ['Python', 'Selenium WebDriver', 'Playwright', 'Distributed Systems', 'REST APIs', 'Test Automation Frameworks'],
    niceToHaveSkills: ['Chaos Engineering', 'Kubernetes', 'Performance Benchmarking'],
    department: 'Streaming Infrastructure Quality'
  },
  {
    id: 'job-qa-3',
    title: 'Quality Assurance Engineer - Web & API',
    company: 'Spotify',
    location: 'New York, NY',
    workMode: 'Remote',
    salaryRange: '$135,000 - $175,000',
    minSalary: 135000,
    experienceLevel: 'Mid',
    jobBoard: 'Workday',
    applyUrl: 'https://www.lifeatspotify.com/jobs',
    postedDate: '5 hours ago',
    description: 'Join the Player Platform team at Spotify to ensure millions of listeners experience flawless audio playback and responsive web apps. You will build regression suites using Cypress and Postman, conduct exploratory testing on new features, and drive release qualification.',
    requiredSkills: ['Cypress', 'API Testing', 'Postman', 'JavaScript', 'SQL', 'JIRA'],
    niceToHaveSkills: ['TypeScript', 'Jest', 'Audio Streaming Protocols'],
    department: 'Player Experience'
  },
  {
    id: 'job-qa-4',
    title: 'Senior Mobile QA Automation Engineer',
    company: 'Uber',
    location: 'San Francisco, CA',
    workMode: 'Hybrid',
    salaryRange: '$160,000 - $205,000',
    minSalary: 160000,
    experienceLevel: 'Senior',
    jobBoard: 'Greenhouse',
    applyUrl: 'https://www.uber.com/careers/',
    postedDate: '1 day ago',
    description: 'Ensure rock-solid safety and trip-matching stability across Rider and Driver apps. You will construct automated UI tests with Appium, XCUITest, and Espresso, monitor release crash rates, and build synthetic test device labs.',
    requiredSkills: ['Appium', 'XCUITest', 'Espresso', 'Mobile Testing', 'Python', 'CI/CD Pipelines'],
    niceToHaveSkills: ['Kotlin', 'Swift', 'Device Farm Automation'],
    department: 'Rider Core QA'
  },
  {
    id: 'job-qa-5',
    title: 'Performance & Reliability QA Engineer',
    company: 'Cloudflare',
    location: 'Austin, TX',
    workMode: 'Remote',
    salaryRange: '$155,000 - $195,000',
    minSalary: 155000,
    experienceLevel: 'Senior',
    jobBoard: 'Direct',
    applyUrl: 'https://www.cloudflare.com/careers/jobs/',
    postedDate: '2 days ago',
    description: 'Stress-test our global edge network handling over 55 million HTTP requests per second. You will author high-throughput load tests using k6 and Go, uncover memory leaks and socket starvation, and guarantee sub-millisecond edge SLAs.',
    requiredSkills: ['Performance Testing (k6)', 'JMeter', 'Go', 'Linux', 'REST APIs', 'Prometheus'],
    niceToHaveSkills: ['Rust', 'Grafana', 'Network Protocols (QUIC/HTTP3)'],
    department: 'Edge Reliability'
  },
  {
    id: 'job-qa-6',
    title: 'Senior QA Engineer - Design & Automation',
    company: 'Figma',
    location: 'San Francisco, CA',
    workMode: 'Hybrid',
    salaryRange: '$145,000 - $185,000',
    minSalary: 145000,
    experienceLevel: 'Mid',
    jobBoard: 'Greenhouse',
    applyUrl: 'https://www.figma.com/careers/',
    postedDate: '2 days ago',
    description: 'Help Figma maintain impeccable visual and interaction fidelity. You will build visual regression testing harnesses, automate canvas interaction workflows with Playwright, and validate real-time multi-player synchronization.',
    requiredSkills: ['Playwright', 'TypeScript', 'API Testing', 'Jest', 'Git'],
    niceToHaveSkills: ['WebGL', 'Storybook Interaction Testing', 'CRDTs'],
    department: 'Product Quality'
  },

  // --- FRONTEND, FULLSTACK & PLATFORM OPENINGS ---
  {
    id: 'job-1',
    title: 'Senior Frontend Engineer',
    company: 'Stripe',
    location: 'San Francisco, CA',
    workMode: 'Remote',
    salaryRange: '$165,000 - $210,000',
    minSalary: 165000,
    experienceLevel: 'Senior',
    jobBoard: 'Greenhouse',
    applyUrl: 'https://stripe.com/jobs/search?q=Senior+Frontend+Engineer',
    postedDate: '2 hours ago',
    description: 'We are looking for a Senior Frontend Engineer to build intuitive, high-performance dashboards for millions of businesses worldwide. You will craft scalable design systems, engineer robust financial data tables, and optimize client-side bundle sizes using modern React, TypeScript, and state architectures.',
    requiredSkills: ['React', 'TypeScript', 'Tailwind CSS', 'State Management', 'Web Performance', 'GraphQL'],
    niceToHaveSkills: ['Next.js', 'Design Systems', 'Microfrontends', 'Financial Tech APIs'],
    department: 'Payments Core'
  },
  {
    id: 'job-2',
    title: 'Full Stack Engineer - AI Products',
    company: 'Anthropic',
    location: 'San Francisco, CA',
    workMode: 'Hybrid',
    salaryRange: '$180,000 - $240,000',
    minSalary: 180000,
    experienceLevel: 'Senior',
    jobBoard: 'Lever',
    applyUrl: 'https://boards.greenhouse.io/anthropic',
    postedDate: '4 hours ago',
    description: 'Join our Product Engineering group to build delightful interfaces and reliable APIs powering next-generation model interactions. You will design real-time streaming interfaces, manage agentic workflows, and collaborate with research scientists to deploy safe, steerable AI tooling.',
    requiredSkills: ['TypeScript', 'Node.js', 'React', 'Python', 'LLM APIs', 'WebSockets', 'PostgreSQL'],
    niceToHaveSkills: ['Vector Databases', 'Docker', 'Async Workflows', 'Redis'],
    department: 'Applied AI'
  },
  {
    id: 'job-3',
    title: 'Lead UI/UX Engineer',
    company: 'Linear',
    location: 'New York, NY',
    workMode: 'Remote',
    salaryRange: '$170,000 - $225,000',
    minSalary: 170000,
    experienceLevel: 'Lead',
    jobBoard: 'Direct',
    applyUrl: 'https://linear.app/careers',
    postedDate: '1 day ago',
    description: 'Linear is crafting the standard in modern software project management. We are seeking a Lead UI/UX Engineer obsessed with sub-100ms micro-interactions, keyboard accessibility, local-first syncing, and flawless typography. You will lead frontend architecture and establish pristine interaction standards.',
    requiredSkills: ['React', 'TypeScript', 'State Management', 'Git', 'Design Systems'],
    niceToHaveSkills: ['Wasm', 'Canvas Rendering', 'IndexedDB', 'CRDTs'],
    department: 'Product Systems'
  },
  {
    id: 'job-4',
    title: 'Software Engineer - Cloud Platform',
    company: 'Cloudflare',
    location: 'Austin, TX',
    workMode: 'Remote',
    salaryRange: '$150,000 - $190,000',
    minSalary: 150000,
    experienceLevel: 'Mid',
    jobBoard: 'Workday',
    applyUrl: 'https://www.cloudflare.com/careers/jobs/',
    postedDate: '2 days ago',
    description: 'Help build the next generation of Workers and serverless developer platforms. You will work on distributed edge systems, developer CLI tools, and web dashboards handling billions of daily requests.',
    requiredSkills: ['TypeScript', 'Node.js', 'REST APIs', 'System Architecture', 'Git'],
    niceToHaveSkills: ['Rust', 'Go', 'Edge Computing', 'Kubernetes'],
    department: 'Edge Developer Platform'
  },
  {
    id: 'job-5',
    title: 'Frontend Developer - Growth',
    company: 'Figma',
    location: 'San Francisco, CA',
    workMode: 'Hybrid',
    salaryRange: '$140,000 - $185,000',
    minSalary: 140000,
    experienceLevel: 'Mid',
    jobBoard: 'Greenhouse',
    applyUrl: 'https://www.figma.com/careers/',
    postedDate: '1 day ago',
    description: 'We are seeking a Frontend Developer to accelerate user onboarding, viral collaboration loops, and enterprise workspace discovery. You will run rigorous A/B experiments and engineer buttery smooth web surfaces seen by millions of designers and product managers.',
    requiredSkills: ['React', 'TypeScript', 'Tailwind CSS', 'Web Performance', 'GraphQL'],
    niceToHaveSkills: ['WebGL', 'Product Led Growth', 'Storybook'],
    department: 'Growth Engineering'
  },
  {
    id: 'job-6',
    title: 'Staff Full Stack Architect',
    company: 'Vercel',
    location: 'Remote (Global)',
    workMode: 'Remote',
    salaryRange: '$210,000 - $275,000',
    minSalary: 210000,
    experienceLevel: 'Lead',
    jobBoard: 'Lever',
    applyUrl: 'https://vercel.com/careers',
    postedDate: '3 days ago',
    description: 'Lead the architectural evolution of frontend cloud infrastructure. You will bridge complex backend deployments with seamless developer preview workflows, edge routing, and real-time observability consoles.',
    requiredSkills: ['TypeScript', 'Next.js', 'React', 'Node.js', 'System Architecture'],
    niceToHaveSkills: ['Rust', 'Observability', 'Turborepo'],
    department: 'Infrastructure'
  },
  {
    id: 'job-7',
    title: 'AI Solutions Engineer',
    company: 'Scale AI',
    location: 'New York, NY',
    workMode: 'Hybrid',
    salaryRange: '$160,000 - $205,000',
    minSalary: 160000,
    experienceLevel: 'Mid',
    jobBoard: 'Greenhouse',
    applyUrl: 'https://scale.com/careers',
    postedDate: 'Just now',
    description: 'Partner with engineering teams to implement LLM evaluation, fine-tuning pipelines, and data curation workflows. Write custom connectors, build client-facing evaluation dashboards, and optimize latency.',
    requiredSkills: ['TypeScript', 'REST APIs', 'PostgreSQL', 'Node.js', 'Git'],
    niceToHaveSkills: ['Python', 'Docker', 'AWS/GCP'],
    department: 'Enterprise Engineering'
  },
  {
    id: 'job-8',
    title: 'Senior Software Engineer - Design Systems',
    company: 'Airbnb',
    location: 'San Francisco, CA',
    workMode: 'Remote',
    salaryRange: '$175,000 - $220,000',
    minSalary: 175000,
    experienceLevel: 'Senior',
    jobBoard: 'Workday',
    applyUrl: 'https://careers.airbnb.com/',
    postedDate: '2 days ago',
    description: 'Empower hundreds of engineers and designers to build cohesive, accessible experiences across mobile and web. You will define the token architecture, build headless component primitives, and enforce WCAG AAA accessibility.',
    requiredSkills: ['React', 'TypeScript', 'Design Systems', 'Web Performance', 'Tailwind CSS'],
    niceToHaveSkills: ['React Native', 'Figma Plugin API', 'Monorepo Tooling'],
    department: 'Core Experience'
  }
];

export const INITIAL_TRACKED_APPLICATIONS: ApplicationTrackerEntry[] = [
  {
    id: 'app-sample-1',
    jobId: 'job-qa-1',
    jobTitle: 'Senior QA Automation Engineer',
    company: 'Datadog',
    location: 'San Francisco, CA (Remote)',
    salary: '$150,000 - $190,000',
    applyUrl: 'https://careers.datadoghq.com/',
    status: 'Applied',
    appliedDate: '2026-10-28',
    updatedDate: '2026-10-28',
    coverLetter: 'Dear Datadog Engineering Team,\n\nI am writing to express my strong enthusiasm for the Senior QA Automation Engineer position. Having designed scalable E2E automation frameworks using Playwright and TypeScript across large-scale distributed architectures, I am eager to help Datadog strengthen its release quality gates.\n\nSincerely,\nCandidate',
    matchScore: 94,
    notes: 'Submitted via Greenhouse assisted apply. Cover letter emphasized Playwright test harness and CI/CD quality gates.'
  },
  {
    id: 'app-stripe',
    jobId: 'job-1',
    jobTitle: 'Senior Frontend Engineer',
    company: 'Stripe',
    location: 'San Francisco, CA (Remote)',
    salary: '$165,000 - $210,000',
    applyUrl: 'https://stripe.com/jobs/search?q=Senior+Frontend+Engineer',
    status: 'Interview',
    appliedDate: '2026-10-24',
    updatedDate: '2026-10-28',
    matchScore: 94,
    notes: 'Recruiter screen passed. Technical architecture interview scheduled for Friday 2 PM PT.',
    coverLetter: `Dear Hiring Team at Stripe,

I am writing to express my strong interest in the Senior Frontend Engineer position at Stripe. Having spent the last 5+ years architecting enterprise-grade React and TypeScript applications, including reducing bundle sizes by 38% and optimizing Core Web Vitals to sub-second thresholds at Veloce Labs, I am eager to contribute to Stripe's payment interfaces.

My background closely aligns with your technical requirements: extensive experience building scalable component libraries, managing complex global state, and optimizing high-frequency transactional data grids. I admire Stripe's meticulous attention to developer experience and API design, and I would love to bring my frontend rigor to your Payments Core team.

Thank you for your time and consideration.

Sincerely,
Alex Chen`,
    interviewDate: '2026-10-31'
  },
  {
    id: 'app-anthropic',
    jobId: 'job-2',
    jobTitle: 'Full Stack Engineer - AI Products',
    company: 'Anthropic',
    location: 'San Francisco, CA (Hybrid)',
    salary: '$180,000 - $240,000',
    applyUrl: 'https://boards.greenhouse.io/anthropic',
    status: 'Applied',
    appliedDate: '2026-10-27',
    updatedDate: '2026-10-27',
    matchScore: 89,
    notes: 'Submitted via Greenhouse assisted apply. Cover letter highlighted WebSocket streaming and TypeScript backend design.',
    coverLetter: `Dear Hiring Team at Anthropic,

I am thrilled to apply for the Full Stack Engineer role on your AI Products team. With deep hands-on expertise in TypeScript, React, and real-time streaming architectures, I am passionate about crafting reliable and intuitive user-facing systems for state-of-the-art AI.

At Cascade Digital, I engineered Node.js microservices handling 12M+ monthly queries alongside real-time WebSocket pipelines for seamless collaboration. Anthropic's mission around safe, steering-aligned AI models is the defining frontier in technology today, and I am excited about the opportunity to build the next wave of interfaces for your model capabilities.

Sincerely,
Alex Chen`
  }
];
