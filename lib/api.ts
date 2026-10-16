// ============================================================
// ResumeIQ — API Client
// Proxy routes through Next.js /api/* → FastAPI backend
// ============================================================

import type {
  ResumeResponse,
  ParsedResumeData,
  JobDescriptionResponse,
  AnalysisResponse,
  ResumeVersionResponse,
  ExportResponse,
  ComparisonResponse,
  DashboardSummary,
} from './types';

const API_BASE = '/api';

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public detail?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const errBody = await res.json();
      detail = errBody.detail || errBody.message || detail;
    } catch {
      // ignore JSON parse error
    }
    throw new ApiError(detail, res.status, detail);
  }
  return res.json() as Promise<T>;
}

export const api = {
  // ─────────────────────────────────────────────────────────
  // RESUMES
  // ─────────────────────────────────────────────────────────
  async uploadResume(file: File): Promise<ResumeResponse> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/resumes/upload`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse<ResumeResponse>(res);
  },

  async loadSampleResume(): Promise<ResumeResponse> {
    const res = await fetch(`${API_BASE}/resumes/sample`, { method: 'POST' });
    return handleResponse<ResumeResponse>(res);
  },

  async getResume(id: string): Promise<ResumeResponse> {
    const res = await fetch(`${API_BASE}/resumes/${encodeURIComponent(id)}`);
    return handleResponse<ResumeResponse>(res);
  },

  async updateResume(id: string, data: ParsedResumeData): Promise<ResumeResponse> {
    const res = await fetch(`${API_BASE}/resumes/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ parsed_data: data }),
    });
    return handleResponse<ResumeResponse>(res);
  },

  // ─────────────────────────────────────────────────────────
  // JOB DESCRIPTIONS
  // ─────────────────────────────────────────────────────────
  async createJobDescription(
    title: string,
    company_name: string,
    description_text: string,
    intake?: { required_skills: string[]; candidate_years_experience: number },
  ): Promise<JobDescriptionResponse> {
    const res = await fetch(`${API_BASE}/job-descriptions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, company_name, description_text, ...intake }),
    });
    return handleResponse<JobDescriptionResponse>(res);
  },

  async importJobFromUrl(
    url: string,
    titleFallback?: string,
    companyFallback?: string,
  ): Promise<JobDescriptionResponse> {
    const res = await fetch(`${API_BASE}/job-descriptions/import-url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url,
        job_title_fallback: titleFallback || 'Imported Job Role',
        company_fallback: companyFallback || '',
      }),
    });
    return handleResponse<JobDescriptionResponse>(res);
  },

  async loadSampleJobDescription(): Promise<JobDescriptionResponse> {
    const res = await fetch(`${API_BASE}/job-descriptions/sample`, {
      method: 'POST',
    });
    return handleResponse<JobDescriptionResponse>(res);
  },

  async listJobDescriptions(): Promise<JobDescriptionResponse[]> {
    const res = await fetch(`${API_BASE}/job-descriptions`);
    return handleResponse<JobDescriptionResponse[]>(res);
  },

  // ─────────────────────────────────────────────────────────
  // ANALYSES
  // ─────────────────────────────────────────────────────────
  async runAnalysis(
    resume: ResumeResponse,
    job: JobDescriptionResponse,
  ): Promise<AnalysisResponse> {
    const res = await fetch(`${API_BASE}/analyses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resume_id: resume.id,
        job_description_id: job.id,
        resume,
        job,
      }),
    });
    return handleResponse<AnalysisResponse>(res);
  },

  async getAnalysis(id: string): Promise<AnalysisResponse> {
    const res = await fetch(`${API_BASE}/analyses/${encodeURIComponent(id)}`);
    return handleResponse<AnalysisResponse>(res);
  },

  async listAnalyses(): Promise<AnalysisResponse[]> {
    const res = await fetch(`${API_BASE}/analyses`);
    return handleResponse<AnalysisResponse[]>(res);
  },

  async applyRecommendation(
    analysis_id: string,
    recommendation_id: string,
    action: string,
    custom_text?: string,
  ): Promise<unknown> {
    const res = await fetch(
      `${API_BASE}/analyses/${encodeURIComponent(analysis_id)}/apply-recommendation`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recommendation_id, action, custom_text }),
      },
    );
    return handleResponse<unknown>(res);
  },

  async getAnalysisComparison(analysis_id: string): Promise<ComparisonResponse> {
    const res = await fetch(
      `${API_BASE}/analyses/${encodeURIComponent(analysis_id)}/comparison`,
    );
    return handleResponse<ComparisonResponse>(res);
  },

  // ─────────────────────────────────────────────────────────
  // PDF / DOCX EXPORT
  // ─────────────────────────────────────────────────────────
  async exportPDF(
    resume_id: string,
    template_name: string = 'classic_professional',
    version_id?: string,
  ): Promise<ExportResponse> {
    const res = await fetch(
      `${API_BASE}/resumes/${encodeURIComponent(resume_id)}/export/pdf`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template_name, version_id }),
      },
    );
    return handleResponse<ExportResponse>(res);
  },

  getPDFDownloadUrl(resume_id: string, export_id?: string): string {
    const base = `${API_BASE}/resumes/${encodeURIComponent(resume_id)}/download/pdf`;
    return export_id ? `${base}?export_id=${encodeURIComponent(export_id)}` : base;
  },

  async exportDOCX(
    resume_id: string,
    template_name: string = 'classic_professional',
    version_id?: string,
  ): Promise<ExportResponse> {
    const res = await fetch(
      `${API_BASE}/resumes/${encodeURIComponent(resume_id)}/export/docx`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template_name, version_id }),
      },
    );
    return handleResponse<ExportResponse>(res);
  },

  getDOCXDownloadUrl(resume_id: string, export_id?: string): string {
    const base = `${API_BASE}/resumes/${encodeURIComponent(resume_id)}/download/docx`;
    return export_id ? `${base}?export_id=${encodeURIComponent(export_id)}` : base;
  },

  // ─────────────────────────────────────────────────────────
  // VERSION MANAGEMENT
  // ─────────────────────────────────────────────────────────
  async saveVersion(
    resume_id: string,
    version_name: string,
    template_name: string,
    resume_content: ParsedResumeData,
  ): Promise<ResumeVersionResponse> {
    const res = await fetch(
      `${API_BASE}/resumes/${encodeURIComponent(resume_id)}/versions`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ version_name, template_name, resume_content }),
      },
    );
    return handleResponse<ResumeVersionResponse>(res);
  },

  async listVersions(resume_id: string): Promise<ResumeVersionResponse[]> {
    const res = await fetch(
      `${API_BASE}/resumes/${encodeURIComponent(resume_id)}/versions`,
    );
    return handleResponse<ResumeVersionResponse[]>(res);
  },

  async restoreVersion(
    resume_id: string,
    version_id: string,
  ): Promise<ResumeResponse> {
    const res = await fetch(
      `${API_BASE}/resumes/${encodeURIComponent(resume_id)}/versions/${encodeURIComponent(version_id)}/restore`,
      { method: 'POST' },
    );
    return handleResponse<ResumeResponse>(res);
  },

  // ─────────────────────────────────────────────────────────
  // DASHBOARD & HISTORY
  // ─────────────────────────────────────────────────────────
  async getDashboardSummary(): Promise<DashboardSummary> {
    const res = await fetch(`${API_BASE}/history/dashboard`);
    return handleResponse<DashboardSummary>(res);
  },

  async deleteAllUserData(): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/history/delete-all`, {
      method: 'POST',
    });
    return handleResponse<{ message: string }>(res);
  },

  // ─────────────────────────────────────────────────────────
  // AUTHENTICATION
  // ─────────────────────────────────────────────────────────
  async register(
    email: string,
    password: string,
    fullName?: string,
  ): Promise<{ access_token: string; user: unknown }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, full_name: fullName || '' }),
    });
    return handleResponse<{ access_token: string; user: unknown }>(res);
  },

  async login(
    email: string,
    password: string,
  ): Promise<{ access_token: string; user: unknown }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse<{ access_token: string; user: unknown }>(res);
  },

  async demoLogin(): Promise<{ access_token: string; user: unknown }> {
    const res = await fetch(`${API_BASE}/auth/demo`, { method: 'POST' });
    return handleResponse<{ access_token: string; user: unknown }>(res);
  },

  async getMe(token: string): Promise<unknown> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleResponse<unknown>(res);
  },
};

export { ApiError };
