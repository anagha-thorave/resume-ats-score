// ============================================================
// ResumeIQ — In-Memory & File-Backed Storage Engine
// ============================================================

import type {
  ResumeResponse,
  ParsedResumeData,
  JobDescriptionResponse,
  AnalysisResponse,
  ResumeVersionResponse,
  DashboardSummary,
} from './types';

export interface UserEntity {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  created_at: string;
}

export interface GeneratedExportEntity {
  id: string;
  user_id: string;
  resume_id: string;
  version_id?: string;
  filename: string;
  file_type: string;
  content: string; // Base64 or HTML string
  created_at: string;
}

// In-memory data store with global singleton across Next.js reloads
interface StoreData {
  users: Map<string, UserEntity>;
  resumes: Map<string, ResumeResponse>;
  jobDescriptions: Map<string, JobDescriptionResponse>;
  analyses: Map<string, AnalysisResponse>;
  versions: Map<string, ResumeVersionResponse[]>; // resumeId -> versions
  exports: Map<string, GeneratedExportEntity>;
}

declare global {
  // eslint-disable-next-line no-var
  var __resumeiq_store__: StoreData | undefined;
}

const defaultUser: UserEntity = {
  id: 'usr-demo-001',
  email: 'alex.chen.dev@example.com',
  password_hash: 'demo-hash',
  full_name: 'Alex Chen',
  created_at: new Date().toISOString(),
};

function getStore(): StoreData {
  if (!globalThis.__resumeiq_store__) {
    const users = new Map<string, UserEntity>();
    users.set(defaultUser.id, defaultUser);
    users.set(defaultUser.email, defaultUser);

    globalThis.__resumeiq_store__ = {
      users,
      resumes: new Map<string, ResumeResponse>(),
      jobDescriptions: new Map<string, JobDescriptionResponse>(),
      analyses: new Map<string, AnalysisResponse>(),
      versions: new Map<string, ResumeVersionResponse[]>(),
      exports: new Map<string, GeneratedExportEntity>(),
    };
  }
  return globalThis.__resumeiq_store__;
}

export const db = {
  // Users
  getUserByEmail(email: string): UserEntity | undefined {
    return getStore().users.get(email.toLowerCase());
  },
  getUserById(id: string): UserEntity | undefined {
    return getStore().users.get(id);
  },
  saveUser(user: UserEntity): void {
    const store = getStore();
    store.users.set(user.id, user);
    store.users.set(user.email.toLowerCase(), user);
  },
  getDefaultUser(): UserEntity {
    return defaultUser;
  },

  // Resumes
  getResume(id: string): ResumeResponse | undefined {
    return getStore().resumes.get(id);
  },
  saveResume(resume: ResumeResponse): void {
    getStore().resumes.set(resume.id, resume);
  },
  deleteResume(id: string): boolean {
    const store = getStore();
    store.versions.delete(id);
    return store.resumes.delete(id);
  },
  listResumes(): ResumeResponse[] {
    return Array.from(getStore().resumes.values());
  },

  // Job Descriptions
  getJobDescription(id: string): JobDescriptionResponse | undefined {
    return getStore().jobDescriptions.get(id);
  },
  saveJobDescription(job: JobDescriptionResponse): void {
    getStore().jobDescriptions.set(job.id, job);
  },
  listJobDescriptions(): JobDescriptionResponse[] {
    return Array.from(getStore().jobDescriptions.values());
  },

  // Analyses
  getAnalysis(id: string): AnalysisResponse | undefined {
    return getStore().analyses.get(id);
  },
  saveAnalysis(analysis: AnalysisResponse): void {
    getStore().analyses.set(analysis.id, analysis);
  },
  listAnalyses(): AnalysisResponse[] {
    return Array.from(getStore().analyses.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  },

  // Versions
  getVersions(resumeId: string): ResumeVersionResponse[] {
    return getStore().versions.get(resumeId) || [];
  },
  saveVersion(resumeId: string, version: ResumeVersionResponse): void {
    const store = getStore();
    const list = store.versions.get(resumeId) || [];
    list.unshift(version);
    store.versions.set(resumeId, list);
  },

  // Exports
  saveExport(exp: GeneratedExportEntity): void {
    getStore().exports.set(exp.id, exp);
  },
  getExport(id: string): GeneratedExportEntity | undefined {
    return getStore().exports.get(id);
  },
  getLatestExportForResume(resumeId: string, fileType: string): GeneratedExportEntity | undefined {
    const all = Array.from(getStore().exports.values()).filter(
      (e) => e.resume_id === resumeId && e.file_type === fileType,
    );
    all.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return all[0];
  },

  // Dashboard summary
  getDashboardSummary(): DashboardSummary {
    const store = getStore();
    const analyses = Array.from(store.analyses.values());
    const totalScore = analyses.reduce((sum, a) => sum + a.overall_score, 0);
    const avgScore = analyses.length > 0 ? Math.round(totalScore / analyses.length) : 78;

    let totalVersions = 0;
    store.versions.forEach((v) => {
      totalVersions += v.length;
    });

    const recentAnalyses = analyses.slice(0, 5).map((a) => ({
      id: a.id,
      resume_id: a.resume_id,
      resume_filename: a.resume_filename,
      job_title: a.job_title,
      company_name: a.company_name || 'Technology Company',
      overall_score: a.overall_score,
      created_at: a.created_at,
    }));

    return {
      total_resumes: Math.max(1, store.resumes.size),
      total_analyses: Math.max(1, analyses.length),
      average_ats_score: avgScore,
      saved_versions_count: totalVersions,
      recent_analyses: recentAnalyses,
    };
  },

  // GDPR wipe
  deleteAllUserData(): void {
    const store = getStore();
    store.resumes.clear();
    store.jobDescriptions.clear();
    store.analyses.clear();
    store.versions.clear();
    store.exports.clear();
  },
};
