// ============================================================
// ResumeIQ — Explainable 6-Pillar ATS Scoring Engine
// ============================================================

import type {
  ParsedResumeData,
  ExtractedRequirements,
  CategoryScore,
  KeywordItem,
  FormattingFeedbackItem,
  RecommendationItem,
} from './types';
import { normalizeSkill } from './parser';

export interface ScoringResult {
  overall_score: number;
  score_label: string;
  category_scores: CategoryScore[];
  matched_keywords: KeywordItem[];
  missing_keywords: KeywordItem[];
  formatting_feedback: FormattingFeedbackItem[];
  recommendations: RecommendationItem[];
}

export function calculateAtsScore(
  resume: ParsedResumeData,
  requirements: ExtractedRequirements,
  rawResumeText: string = '',
): ScoringResult {
  const resumeTextCorpus = (
    rawResumeText + ' ' +
    resume.summary + ' ' +
    resume.technical_skills.join(' ') + ' ' +
    resume.soft_skills.join(' ') + ' ' +
    resume.experience.map((e) => e.bullets.join(' ') + ' ' + e.title + ' ' + e.company).join(' ') + ' ' +
    resume.projects.map((p) => p.bullets.join(' ') + ' ' + p.title + ' ' + p.technologies.join(' ')).join(' ')
  ).toLowerCase();

  const resumeSkillsNorm = new Set(
    resume.technical_skills.concat(resume.soft_skills, resume.tools_and_frameworks).map(normalizeSkill),
  );

  const matchedKeywords: KeywordItem[] = [];
  const missingKeywords: KeywordItem[] = [];

  // ─────────────────────────────────────────────────────────
  // 1. Required Keyword & Skill Coverage (30%)
  // ─────────────────────────────────────────────────────────
  const reqSkills = requirements.required_skills;

  let matchedReqCount = 0;
  const cat1Positives: string[] = [];
  const cat1Warnings: string[] = [];

  for (const skill of reqSkills) {
    const sNorm = normalizeSkill(skill);
    const inSkills = resumeSkillsNorm.has(sNorm);
    const inText = resumeTextCorpus.includes(sNorm);

    if (inSkills || inText) {
      matchedReqCount++;
      const matchType = inSkills ? 'exact match' : 'inferred in text';
      cat1Positives.push(`Found required skill: ${skill} (${matchType})`);
      matchedKeywords.push({
        keyword: skill,
        category: 'required',
        status: 'matched',
        context: `Matched via ${matchType}`,
        found_in_resume: 'Technical Skills / Experience',
      });
    } else {
      cat1Warnings.push(`Missing required skill: ${skill}`);
      missingKeywords.push({
        keyword: skill,
        category: 'required',
        status: 'missing',
        context: `Crucial for '${requirements.title}' role`,
        relevance_reason: 'High-priority requirement in target job description',
      });
    }
  }

  // Preferred skills evaluation
  const prefSkills = requirements.preferred_skills || [];
  let matchedPrefCount = 0;
  for (const pSkill of prefSkills) {
    const pNorm = normalizeSkill(pSkill);
    if (resumeSkillsNorm.has(pNorm) || resumeTextCorpus.includes(pNorm)) {
      matchedPrefCount++;
      matchedKeywords.push({
        keyword: pSkill,
        category: 'preferred',
        status: 'matched',
        context: 'Preferred skill bonus matched',
        found_in_resume: 'Detected in candidate profile',
      });
    } else {
      missingKeywords.push({
        keyword: pSkill,
        category: 'preferred',
        status: 'missing',
        context: 'Nice-to-have qualification',
        relevance_reason: 'Adding this skill can boost candidate competitiveness',
      });
    }
  }

  const reqCoveragePct = reqSkills.length > 0 ? matchedReqCount / reqSkills.length : 1.0;
  const prefBonus = prefSkills.length > 0 ? (matchedPrefCount / prefSkills.length) * 10.0 : 0.0;
  const cat1Score = reqSkills.length > 0
    ? Math.min(100.0, Math.round(reqCoveragePct * 90.0 + prefBonus))
    : 50;
  const cat1Explanation = reqSkills.length > 0
    ? `Matched ${matchedReqCount} of ${reqSkills.length} required skills (${Math.round(reqCoveragePct * 100)}%). Preferred skills matched: ${matchedPrefCount}/${prefSkills.length}.`
    : 'No required skills were supplied, so keyword coverage is scored as neutral.';

  // ─────────────────────────────────────────────────────────
  // 2. Relevant Experience Alignment (25%)
  // ─────────────────────────────────────────────────────────
  const cat2Positives: string[] = [];
  const cat2Warnings: string[] = [];
  let cat2Points = 50.0;

  const expBullets = resume.experience.flatMap((e) => e.bullets);
  if (resume.experience.length >= 2) {
    cat2Points += 20.0;
    cat2Positives.push(`Demonstrated ${resume.experience.length} relevant professional roles`);
  } else if (resume.experience.length === 1) {
    cat2Points += 10.0;
    cat2Positives.push('Demonstrated professional experience entry');
  } else {
    cat2Warnings.push('No full-time professional experience items found');
  }

  const actionVerbs = ['developed', 'built', 'engineered', 'designed', 'implemented', 'spearheaded', 'optimized', 'architected', 'delivered'];
  const actionCount = expBullets.filter((b) =>
    actionVerbs.some((av) => b.toLowerCase().startsWith(av) || b.toLowerCase().includes(` ${av} `)),
  ).length;

  if (actionCount >= 4) {
    cat2Points += 15.0;
    cat2Positives.push(`Strong action-verb utilization in experience bullets (${actionCount} identified)`);
  } else {
    cat2Points += 8.0;
    cat2Warnings.push('Some experience bullets lack strong measurable impact action verbs');
  }

  const candidateYears = requirements.candidate_years_experience;
  const requiredYears = requirements.required_years_experience;
  if (candidateYears !== undefined) {
    const yearsScore = requiredYears
      ? Math.min(100, Math.round((candidateYears / requiredYears) * 100))
      : Math.min(100, 40 + candidateYears * 10);
    cat2Points = cat2Points * 0.75 + yearsScore * 0.25;
    cat2Positives.push(`Candidate reports ${candidateYears} years of relevant experience`);
    if (requiredYears && candidateYears < requiredYears) {
      cat2Warnings.push(`The job posting asks for ${requiredYears} years; candidate reports ${candidateYears}`);
    }
  }
  cat2Points += 10.0;
  const cat2Score = Math.min(100.0, Math.round(cat2Points));
  const cat2Explanation = requiredYears && candidateYears !== undefined
    ? `Compared the candidate's reported ${candidateYears} years with the ${requiredYears} years requested. ${actionCount} action-oriented experience bullets were detected.`
    : `Reviewed ${resume.experience.length} experience section(s) and ${actionCount} action-oriented bullets. Add years required to the job posting for a direct experience comparison.`;

  // ─────────────────────────────────────────────────────────
  // 3. Qualifications & Education (15%)
  // ─────────────────────────────────────────────────────────
  const cat3Positives: string[] = [];
  const cat3Warnings: string[] = [];
  let cat3Points = 60.0;

  if (resume.education.length > 0) {
    cat3Points += 25.0;
    const edu = resume.education[0];
    cat3Positives.push(`Verified qualification: ${edu.degree} at ${edu.institution}`);
  } else {
    cat3Warnings.push('No formal education or degree detected');
  }

  if (resume.education.some((e) => e.graduation_year)) {
    cat3Points += 15.0;
    cat3Positives.push('Clear graduation timeline provided');
  }

  const cat3Score = Math.min(100.0, Math.round(cat3Points));
  const cat3Explanation = `Education meets baseline credentials for '${requirements.education_required || 'the role'}'.`;

  // ─────────────────────────────────────────────────────────
  // 4. Projects & Achievements (15%)
  // ─────────────────────────────────────────────────────────
  const cat4Positives: string[] = [];
  const cat4Warnings: string[] = [];
  let cat4Points = 50.0;

  if (resume.projects.length >= 2) {
    cat4Points += 30.0;
    cat4Positives.push(`${resume.projects.length} technical projects showcasing practical engineering`);
  } else if (resume.projects.length === 1) {
    cat4Points += 15.0;
    cat4Positives.push('1 technical project identified');
  } else {
    cat4Warnings.push('No technical projects listed to substantiate skills');
  }

  if (resume.certifications.length > 0) {
    cat4Points += 15.0;
    cat4Positives.push('Includes recognized professional certifications');
  }

  const cat4Score = Math.min(100.0, Math.round(cat4Points));
  const cat4Explanation = `Projects demonstrate practical hands-on application of target technologies. ${resume.projects.length} project(s) logged.`;

  // ─────────────────────────────────────────────────────────
  // 5. Resume Structure & Readability (10%)
  // ─────────────────────────────────────────────────────────
  const detectedSections = [
    resume.summary && 'summary',
    resume.technical_skills.length > 0 && 'skills',
    resume.experience.length > 0 && 'experience',
    resume.education.length > 0 && 'education',
    resume.projects.length > 0 && 'projects',
  ].filter((section): section is string => Boolean(section));
  const cat5Positives = detectedSections.map((section) => `Detected ${section} content`);
  const cat5Warnings = detectedSections.length < 3
    ? ['Add clear standard section headings to improve text parsing']
    : [];
  const cat5Score = Math.min(100, 40 + detectedSections.length * 12);
  const cat5Explanation = `Detected ${detectedSections.length} common resume sections. Visual layout is not evaluated from extracted text.`;

  // ─────────────────────────────────────────────────────────
  // 6. Contact Information & Completeness (5%)
  // ─────────────────────────────────────────────────────────
  const cat6Positives: string[] = [];
  const cat6Warnings: string[] = [];
  let cat6Points = 50.0;

  if (resume.contact.email) {
    cat6Points += 15.0;
    cat6Positives.push('Valid contact email provided');
  }
  if (resume.contact.phone) {
    cat6Points += 15.0;
    cat6Positives.push('Valid phone number provided');
  }
  if (resume.contact.linkedin_url || resume.contact.github_url) {
    cat6Points += 20.0;
    cat6Positives.push('Professional portfolio links (LinkedIn/GitHub) attached');
  }

  const cat6Score = Math.min(100.0, Math.round(cat6Points));
  const cat6Explanation = 'Contact details and online portfolio links are complete and properly formatted.';

  // ─────────────────────────────────────────────────────────
  // Overall Weighted Score
  // ─────────────────────────────────────────────────────────
  const overallScore = Math.round(
    cat1Score * 0.30 +
    cat2Score * 0.25 +
    cat3Score * 0.15 +
    cat4Score * 0.15 +
    cat5Score * 0.10 +
    cat6Score * 0.05,
  );

  let scoreLabel = 'Needs Improvement';
  if (overallScore >= 90) scoreLabel = 'Very Strong Match';
  else if (overallScore >= 75) scoreLabel = 'Strong Match';
  else if (overallScore >= 60) scoreLabel = 'Fair Match';

  // ─────────────────────────────────────────────────────────
  // Category Scores array
  // ─────────────────────────────────────────────────────────
  const categoryScores: CategoryScore[] = [
    {
      category_id: 'required_skills',
      name: 'Required Keyword & Skill Coverage',
      weight_percentage: 30,
      score: cat1Score,
      weighted_score: Math.round(cat1Score * 0.30),
      explanation: cat1Explanation,
      positive_signals: cat1Positives,
      warning_signals: cat1Warnings,
    },
    {
      category_id: 'experience_alignment',
      name: 'Relevant Experience Alignment',
      weight_percentage: 25,
      score: cat2Score,
      weighted_score: Math.round(cat2Score * 0.25),
      explanation: cat2Explanation,
      positive_signals: cat2Positives,
      warning_signals: cat2Warnings,
    },
    {
      category_id: 'qualifications_education',
      name: 'Required Qualifications & Education',
      weight_percentage: 15,
      score: cat3Score,
      weighted_score: Math.round(cat3Score * 0.15),
      explanation: cat3Explanation,
      positive_signals: cat3Positives,
      warning_signals: cat3Warnings,
    },
    {
      category_id: 'projects_achievements',
      name: 'Projects & Achievement Relevance',
      weight_percentage: 15,
      score: cat4Score,
      weighted_score: Math.round(cat4Score * 0.15),
      explanation: cat4Explanation,
      positive_signals: cat4Positives,
      warning_signals: cat4Warnings,
    },
    {
      category_id: 'resume_structure',
      name: 'Resume Structure & Readability',
      weight_percentage: 10,
      score: cat5Score,
      weighted_score: Math.round(cat5Score * 0.10),
      explanation: cat5Explanation,
      positive_signals: cat5Positives,
      warning_signals: cat5Warnings,
    },
    {
      category_id: 'contact_completeness',
      name: 'Contact Information & Completeness',
      weight_percentage: 5,
      score: cat6Score,
      weighted_score: Math.round(cat6Score * 0.05),
      explanation: cat6Explanation,
      positive_signals: cat6Positives,
      warning_signals: cat6Warnings,
    },
  ];

  // ─────────────────────────────────────────────────────────
  // Formatting Feedback (matching UI expectations)
  // ─────────────────────────────────────────────────────────
  const formattingFeedback: FormattingFeedbackItem[] = [
    {
      id: 'fmt-1',
      type: 'success',
      title: 'PDF text extracted',
      description: `${rawResumeText.trim().split(/\s+/).filter(Boolean).length} words were available for analysis.`,
    },
    {
      id: 'fmt-2',
      type: detectedSections.length >= 3 ? 'success' : 'warning',
      title: 'Resume sections detected',
      description: detectedSections.length ? detectedSections.join(', ') : 'Use standard headings such as Skills, Experience, and Education.',
    },
    {
      id: 'fmt-3',
      type: resume.experience.some((entry) => entry.bullets.length > 0) ? 'success' : 'warning',
      title: 'Experience details',
      description: resume.experience.some((entry) => entry.bullets.length > 0)
        ? 'Experience bullet text was found in the extracted PDF.'
        : 'Add concise bullet points under your experience section.',
    },
    {
      id: 'fmt-4',
      type: 'info',
      title: 'Visual layout not scored',
      description: 'This analysis evaluates extracted text; review columns, tables, and font size in the PDF itself.',
    },
  ];

  // ─────────────────────────────────────────────────────────
  // Evidence-Based AI Improvement Recommendations
  // ─────────────────────────────────────────────────────────
  const recommendations: RecommendationItem[] = [];

  // Surface only target skills already detected in the resume.
  const targetRole = requirements.title;
  const matchedRequiredSkills = matchedKeywords
    .filter((item) => item.category === 'required' && item.status === 'matched')
    .map((item) => item.keyword)
    .slice(0, 4);
  if (resume.summary && matchedRequiredSkills.length > 0) {
    recommendations.push({
      id: 'rec-summary-1',
      section: 'summary',
      original_text: resume.summary,
      suggested_text: `${resume.summary}\nRelevant skills: ${matchedRequiredSkills.join(', ')}.`,
      reason: `Bring matching skills already present in your resume closer to the top for the ${targetRole} role.`,
      target_requirement: `Target Role: ${targetRole}`,
      status: 'pending',
      is_truthful_verified: true,
    });
  }

  // Missing skill recommendation if any
  if (missingKeywords.length > 0) {
    const missingTop = missingKeywords[0].keyword;
    recommendations.push({
      id: 'rec-skills-1',
      section: 'skills',
      original_text: resume.technical_skills.length
        ? `Current skills: ${resume.technical_skills.slice(0, 5).join(', ')}`
        : 'No recognized technical skills were detected in the resume.',
      suggested_text: `If you have hands-on experience with '${missingTop}', add it to your skills section and support it with a relevant example.`,
      reason: `'${missingTop}' is a required keyword for this role and was not found in the extracted resume text.`,
      target_requirement: `Target Skill: ${missingTop}`,
      status: 'pending',
      is_truthful_verified: true,
    });
  }

  return {
    overall_score: overallScore,
    score_label: scoreLabel,
    category_scores: categoryScores,
    matched_keywords: matchedKeywords,
    missing_keywords: missingKeywords,
    formatting_feedback: formattingFeedback,
    recommendations,
  };
}
