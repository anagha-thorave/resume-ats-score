// ============================================================
// ResumeIQ — TypeScript Type Definitions
// ============================================================

export interface ContactInfo {
  full_name: string;
  email: string;
  phone: string;
  location: string;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
}

export interface WorkExperienceItem {
  id?: string;
  title: string;
  company: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  is_current?: boolean;
  bullets: string[];
}

export interface EducationItem {
  id?: string;
  institution: string;
  degree: string;
  field_of_study?: string;
  graduation_year?: string;
  gpa?: string;
}

export interface ProjectItem {
  id?: string;
  title: string;
  technologies: string[];
  link?: string;
  bullets: string[];
}

export interface CertificationItem {
  id?: string;
  name: string;
  issuer?: string;
  issue_date?: string;
}

export interface AchievementItem {
  id?: string;
  title: string;
  description?: string;
}

export interface ParsedResumeData {
  contact: ContactInfo;
  summary: string;
  technical_skills: string[];
  soft_skills: string[];
  tools_and_frameworks: string[];
  experience: WorkExperienceItem[];
  internships: WorkExperienceItem[];
  education: EducationItem[];
  projects: ProjectItem[];
  certifications: CertificationItem[];
  achievements: AchievementItem[];
  languages: string[];
  extraction_warnings: string[];
  completeness_score: number;
}

export interface ResumeResponse {
  id: string;
  original_filename: string;
  file_type: string;
  file_size?: number;
  extracted_text?: string;
  parsed_data: ParsedResumeData;
  created_at: string;
  updated_at: string;
}

export interface ExtractedRequirements {
  title: string;
  required_skills: string[];
  preferred_skills: string[];
  candidate_years_experience?: number;
  required_years_experience?: number;
  responsibilities: string[];
  qualifications: string[];
  tools_and_tech: string[];
  experience_level?: string;
  education_required?: string;
}

export interface JobDescriptionResponse {
  id: string;
  title: string;
  company_name?: string;
  description_text: string;
  extracted_requirements: ExtractedRequirements;
  created_at: string;
}

export interface CategoryScore {
  category_id: string;
  name: string;
  weight_percentage: number;
  score: number;
  weighted_score: number;
  explanation: string;
  positive_signals: string[];
  warning_signals: string[];
}

export interface KeywordItem {
  keyword: string;
  category: 'required' | 'preferred';
  status: 'matched' | 'missing' | 'inferred';
  context?: string;
  found_in_resume?: string;
  relevance_reason?: string;
}

export interface FormattingFeedbackItem {
  id: string;
  type: 'success' | 'warning' | 'info';
  title: string;
  description: string;
}

export interface RecommendationItem {
  id: string;
  section: string;
  item_id?: string;
  bullet_index?: number;
  original_text: string;
  suggested_text: string;
  reason: string;
  target_requirement: string;
  status: 'pending' | 'accepted' | 'rejected';
  is_truthful_verified: boolean;
}

export interface AnalysisResponse {
  id: string;
  resume_id: string;
  job_description_id: string;
  job_title: string;
  company_name?: string;
  resume_filename: string;
  overall_score: number;
  score_label: string;
  category_scores: CategoryScore[];
  matched_keywords: KeywordItem[];
  missing_keywords: KeywordItem[];
  formatting_feedback: FormattingFeedbackItem[];
  recommendations: RecommendationItem[];
  created_at: string;
}

export interface ResumeVersionResponse {
  id: string;
  resume_id: string;
  version_number: number;
  version_name: string;
  template_name: string;
  resume_content: ParsedResumeData;
  created_at: string;
}

export interface ExportResponse {
  export_id: string;
  filename: string;
  download_url: string;
  file_type: string;
  created_at: string;
}

export interface ComparisonResponse {
  original_score: number;
  original_score_label: string;
  updated_score: number;
  updated_score_label: string;
  score_delta: number;
  newly_matched_keywords: string[];
  remaining_missing_keywords: string[];
  category_comparisons: unknown[];
  resolved_formatting_issues: string[];
}

export interface DashboardSummary {
  total_resumes: number;
  total_analyses: number;
  average_ats_score: number;
  saved_versions_count: number;
  recent_analyses: {
    id: string;
    resume_id: string;
    resume_filename: string;
    job_title: string;
    company_name: string;
    overall_score: number;
    created_at: string;
  }[];
}

// App State Types
export type AppTab = 'dashboard' | 'analyzer' | 'job' | 'editor' | 'history';

export interface AppState {
  activeResume: ResumeResponse | null;
  activeJob: JobDescriptionResponse | null;
  activeAnalysis: AnalysisResponse | null;
  comparisonData: ComparisonResponse | null;
  loading: boolean;
  statusMessage: string | null;
}
