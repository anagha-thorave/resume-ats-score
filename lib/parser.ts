// ============================================================
// ResumeIQ — NLP & Pattern-Matching Parser Engine
// ============================================================

import type {
  ParsedResumeData,
  ContactInfo,
  WorkExperienceItem,
  EducationItem,
  ProjectItem,
  CertificationItem,
  AchievementItem,
  ExtractedRequirements,
} from './types';

export const COMMON_TECH_SKILLS = [
  'Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'C#', 'Go', 'Golang', 'Rust',
  'Ruby', 'PHP', 'Swift', 'Kotlin', 'SQL', 'NoSQL', 'HTML', 'CSS', 'HTML5', 'CSS3',
  'React', 'Next.js', 'Vue.js', 'Angular', 'Node.js', 'Express', 'FastAPI', 'Django',
  'Flask', 'Spring Boot', 'GraphQL', 'REST APIs', 'PostgreSQL', 'MySQL', 'MongoDB',
  'Redis', 'Elasticsearch', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Git',
  'GitHub Actions', 'CI/CD', 'Jenkins', 'Terraform', 'Linux', 'Bash', 'PyTorch',
  'TensorFlow', 'Tailwind CSS', 'Microservices', 'Kafka', 'RabbitMQ', 'Jest', 'Mocha',
  'Figma', 'Sketch', 'Adobe XD', 'UX Research', 'User Research', 'Prototyping',
  'Wireframing', 'User Testing', 'Usability Testing', 'Design Systems', 'Accessibility',
];

export const COMMON_SOFT_SKILLS = [
  'Leadership', 'Teamwork', 'Collaboration', 'Communication', 'Problem Solving',
  'Critical Thinking', 'Adaptability', 'Time Management', 'Agile', 'Scrum',
  'System Design', 'Mentoring', 'Decision Making',
];

const SYNONYM_MAP: Record<string, string[]> = {
  react: ['react.js', 'reactjs'],
  'node.js': ['nodejs', 'node'],
  aws: ['amazon web services', 'ec2', 's3', 'lambda'],
  gcp: ['google cloud', 'google cloud platform'],
  'ci/cd': ['continuous integration', 'continuous deployment', 'github actions', 'jenkins'],
  'rest apis': ['rest api', 'restful', 'restful api', 'rest'],
  postgresql: ['postgres'],
  mongodb: ['mongo'],
  typescript: ['ts'],
  javascript: ['js'],
  kubernetes: ['k8s'],
  golang: ['go'],
};

export function normalizeSkill(skill: string): string {
  const s = skill.toLowerCase().trim();
  for (const [canonical, syns] of Object.entries(SYNONYM_MAP)) {
    if (s === canonical || syns.includes(s)) {
      return canonical;
    }
  }
  return s;
}

const RESUME_SECTION_HEADINGS = new Set([
  'summary', 'professional summary', 'profile', 'about', 'skills', 'technical skills',
  'experience', 'work experience', 'professional experience', 'employment history',
  'work history', 'education', 'projects', 'certifications', 'awards', 'achievements',
  'languages',
]);

function getResumeSection(lines: string[], labels: string[]): string[] {
  const start = lines.findIndex((line) => labels.includes(line.replace(/:$/, '').toLowerCase()));
  if (start < 0) return [];
  let end = start + 1;
  while (end < lines.length && !RESUME_SECTION_HEADINGS.has(lines[end].replace(/:$/, '').toLowerCase())) {
    end++;
  }
  return lines.slice(start + 1, end);
}

function stripBullet(line: string): string {
  return line.replace(/^\s*[•●▪*-]+\s*/, '').trim();
}

export function parseResumeText(rawText: string, originalFilename: string = 'Resume.pdf'): ParsedResumeData {
  const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);

  const contact: ContactInfo = {
    full_name: '',
    email: '',
    phone: '',
    location: '',
  };

  // Extract email
  const emailMatch = rawText.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,7}\b/);
  if (emailMatch) contact.email = emailMatch[0];

  // Extract phone
  const phoneMatch = rawText.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  if (phoneMatch) contact.phone = phoneMatch[0];

  // Extract LinkedIn
  const linkedinMatch = rawText.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/(?:in|pub)\/([a-zA-Z0-9_-]+)/i);
  if (linkedinMatch) contact.linkedin_url = linkedinMatch[0];

  // Extract GitHub
  const githubMatch = rawText.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_-]+)/i);
  if (githubMatch) contact.github_url = githubMatch[0];

  // Extract Name from header
  for (const line of lines.slice(0, 6)) {
    if (line.length >= 3 && line.length <= 40 && !line.includes('@') && !line.toLowerCase().includes('resume')) {
      const words = line.split(/\s+/).filter((w) => /^[a-zA-Z]+$/.test(w));
      if (words.length >= 2 && words.length <= 4) {
        contact.full_name = words.join(' ');
        break;
      }
    }
  }

  // 2. Technical & Soft Skills detection
  const detectedTechSkills: string[] = [];
  const textLower = rawText.toLowerCase();

  for (const skill of COMMON_TECH_SKILLS) {
    const escaped = skill.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    if (regex.test(textLower)) {
      detectedTechSkills.push(skill);
    }
  }

  const detectedSoftSkills: string[] = [];
  for (const skill of COMMON_SOFT_SKILLS) {
    const escaped = skill.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    if (regex.test(textLower)) {
      detectedSoftSkills.push(skill);
    }
  }

  const technicalSkills = detectedTechSkills;
  const softSkills = detectedSoftSkills;

  const summary = getResumeSection(lines, ['summary', 'professional summary', 'profile', 'about'])
    .join(' ').replace(/\s+/g, ' ');

  const experienceLines = getResumeSection(lines, [
    'experience', 'work experience', 'professional experience', 'employment history', 'work history',
  ]);
  const experienceTitle = experienceLines.find((line) => !/^[•●▪*-]/.test(line));
  const dateLine = experienceLines.find((line) => line !== experienceTitle &&
    /^(?:(?:19|20)\d{2}|[A-Za-z]{3,9}\s+(?:19|20)\d{2}|\d{1,2}[/-](?:19|20)\d{2})\s*(?:-|–|to|through)\s*(?:present|current|(?:19|20)\d{2})$/i.test(line));
  const explicitExperienceBullets = experienceLines.filter((line) => /^[•●▪*-]/.test(line));
  const experienceBullets = (explicitExperienceBullets.length
    ? explicitExperienceBullets
    : experienceLines.filter((line) => line !== experienceTitle && line !== dateLine && line.length > 30)
  ).map(stripBullet);
  const experience: WorkExperienceItem[] = experienceLines.length ? [{
    id: 'exp-1',
    title: experienceTitle || 'Experience',
    company: '',
    start_date: dateLine,
    is_current: dateLine ? /present|current/i.test(dateLine) : false,
    bullets: experienceBullets,
  }] : [];

  const educationLines = getResumeSection(lines, ['education']);
  const education: EducationItem[] = educationLines.length ? [{
    id: 'edu-1',
    institution: educationLines[0],
    degree: educationLines[1] || '',
    graduation_year: educationLines.join(' ').match(/(?:19|20)\d{2}/)?.[0],
  }] : [];

  const projectLines = getResumeSection(lines, ['projects']);
  const projectTitle = projectLines.find((line) => !/^[•●▪*-]/.test(line));
  const explicitProjectBullets = projectLines.filter((line) => /^[•●▪*-]/.test(line));
  const projectBullets = (explicitProjectBullets.length
    ? explicitProjectBullets
    : projectLines.filter((line) => line !== projectTitle && line.length > 30)
  ).map(stripBullet);
  const projects: ProjectItem[] = projectLines.length ? [{
    id: 'proj-1',
    title: projectTitle || 'Project',
    technologies: technicalSkills.filter((skill) => projectLines.join(' ').toLowerCase().includes(skill.toLowerCase())),
    bullets: projectBullets,
  }] : [];

  const certificationLines = getResumeSection(lines, ['certifications']);
  const certifications: CertificationItem[] = certificationLines.map((name) => ({ name: stripBullet(name) }));

  const achievements: AchievementItem[] = getResumeSection(lines, ['awards', 'achievements'])
    .map((line) => ({ title: stripBullet(line) }));

  const completenessFields = [
    contact.full_name,
    contact.email,
    contact.phone,
    summary,
    technicalSkills.length > 0,
    experience.length > 0,
    education.length > 0,
    projects.length > 0,
    certifications.length > 0,
  ];

  return {
    contact,
    summary,
    technical_skills: technicalSkills,
    soft_skills: softSkills,
    tools_and_frameworks: [],
    experience,
    internships: [],
    education,
    projects,
    certifications,
    achievements,
    languages: getResumeSection(lines, ['languages']).map(stripBullet),
    extraction_warnings: [
      ...(contact.email ? [] : ['No email address detected']),
      ...(technicalSkills.length ? [] : ['No recognized technical skills detected']),
      ...(experience.length ? [] : ['No experience section detected']),
      ...(education.length ? [] : ['No education section detected']),
    ],
    completeness_score: Math.round((completenessFields.filter(Boolean).length / completenessFields.length) * 100),
  };
}

export function extractJobRequirements(
  title: string,
  text: string,
  suppliedRequiredSkills: string[] = [],
  candidateYearsExperience?: number,
): ExtractedRequirements {
  const textLower = text.toLowerCase();
  const requiredSkills = new Set<string>();
  const preferredSkills = new Set<string>();
  const responsibilities: string[] = [];
  const qualifications: string[] = [];

  // Parse lines
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  let mode: 'general' | 'required' | 'preferred' | 'responsibilities' = 'general';

  for (const line of lines) {
    const l = line.toLowerCase();
    if (l.includes('required') || l.includes('requirements') || l.includes('minimum qualifications') || l.includes('must have')) {
      mode = 'required';
      continue;
    } else if (l.includes('preferred') || l.includes('nice to have') || l.includes('bonus') || l.includes('desired')) {
      mode = 'preferred';
      continue;
    } else if (l.includes('responsibilities') || l.includes('what you') || l.includes('duties') || l.includes('the role')) {
      mode = 'responsibilities';
      continue;
    }

    const isBullet = /^[•\-*–—>0-9.]/.test(line);
    const bulletText = line.replace(/^[•\-*–—>\d.\s]+/, '').trim();

    if (isBullet && bulletText) {
      if (mode === 'responsibilities') responsibilities.push(bulletText);
      else if (mode === 'required') qualifications.push(bulletText);
      else if (mode === 'preferred') qualifications.push(`[Preferred] ${bulletText}`);
    }

    // Detect skills
    for (const skill of COMMON_TECH_SKILLS) {
      const escaped = skill.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (new RegExp(`\\b${escaped}\\b`, 'i').test(l)) {
        if (mode === 'preferred') preferredSkills.add(skill);
        else requiredSkills.add(skill);
      }
    }
  }

  suppliedRequiredSkills.forEach((skill) => {
    const value = skill.trim();
    if (value) requiredSkills.add(value);
  });
  const requiredYears = text.match(/\b(\d{1,2})\+?\s+years?\b/i);

  return {
    title,
    required_skills: Array.from(requiredSkills),
    preferred_skills: Array.from(preferredSkills),
    candidate_years_experience: candidateYearsExperience,
    required_years_experience: requiredYears ? Number(requiredYears[1]) : undefined,
    responsibilities: responsibilities.slice(0, 6),
    qualifications: qualifications.slice(0, 6),
    tools_and_tech: Array.from(requiredSkills).concat(Array.from(preferredSkills)),
    experience_level: requiredYears?.[0],
    education_required: undefined,
  };
}
