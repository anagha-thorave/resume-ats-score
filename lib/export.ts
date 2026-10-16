// ============================================================
// ResumeIQ — Document Generator Engine (PDF / DOCX)
// ============================================================

import type { ParsedResumeData } from './types';

export function generateResumeHtml(resume: ParsedResumeData, templateName: string = 'classic_professional'): string {
  const isMinimal = templateName === 'modern_minimal';
  const isTechnical = templateName === 'technical_fresher';

  const primaryColor = isMinimal ? '#4338CA' : isTechnical ? '#0284C7' : '#1E293B';
  const accentColor = isMinimal ? '#6366F1' : isTechnical ? '#0EA5E9' : '#0F172A';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${resume.contact.full_name || 'Resume'} - ResumeIQ</title>
  <style>
    @page { size: A4; margin: 15mm; }
    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      color: #1a1a1a;
      line-height: 1.45;
      font-size: 10.5pt;
      margin: 0;
      padding: 20px;
    }
    .header {
      border-bottom: 2px solid ${primaryColor};
      padding-bottom: 12px;
      margin-bottom: 16px;
    }
    .name {
      font-size: 22pt;
      font-weight: bold;
      color: ${accentColor};
      margin: 0 0 6px 0;
    }
    .contact-line {
      font-size: 9.5pt;
      color: #555;
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }
    h2 {
      font-size: 11pt;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: ${primaryColor};
      border-bottom: 1px solid #ddd;
      padding-bottom: 4px;
      margin: 14px 0 8px 0;
    }
    .section-content { margin-bottom: 12px; }
    .exp-item { margin-bottom: 10px; }
    .exp-header {
      display: flex;
      justify-content: space-between;
      font-weight: bold;
      font-size: 10.5pt;
    }
    .exp-sub {
      color: #444;
      font-style: italic;
      font-size: 9.5pt;
      margin-bottom: 4px;
    }
    ul {
      margin: 4px 0 0 18px;
      padding: 0;
    }
    li { margin-bottom: 3px; font-size: 10pt; color: #222; }
    .skills-line { font-size: 10pt; }
    .skills-label { font-weight: bold; color: #333; }
  </style>
</head>
<body>
  <div class="header">
    <div class="name">${resume.contact.full_name || 'Candidate Name'}</div>
    <div class="contact-line">
      ${resume.contact.email ? `<span>✉ ${resume.contact.email}</span>` : ''}
      ${resume.contact.phone ? `<span>☎ ${resume.contact.phone}</span>` : ''}
      ${resume.contact.location ? `<span>📍 ${resume.contact.location}</span>` : ''}
      ${resume.contact.linkedin_url ? `<span>🔗 ${resume.contact.linkedin_url}</span>` : ''}
      ${resume.contact.github_url ? `<span>💻 ${resume.contact.github_url}</span>` : ''}
    </div>
  </div>

  ${resume.summary ? `
  <div class="section-content">
    <h2>Professional Summary</h2>
    <p style="margin: 0; font-size: 10pt;">${resume.summary}</p>
  </div>` : ''}

  ${resume.technical_skills.length > 0 ? `
  <div class="section-content">
    <h2>Technical Skills</h2>
    <div class="skills-line">
      <span class="skills-label">Languages & Technologies:</span>
      ${resume.technical_skills.join(', ')}
    </div>
    ${resume.soft_skills.length > 0 ? `
    <div class="skills-line" style="margin-top: 4px;">
      <span class="skills-label">Competencies:</span>
      ${resume.soft_skills.join(', ')}
    </div>` : ''}
  </div>` : ''}

  ${resume.experience.length > 0 ? `
  <div class="section-content">
    <h2>Work Experience</h2>
    ${resume.experience.map((e) => `
      <div class="exp-item">
        <div class="exp-header">
          <span>${e.title} — ${e.company}</span>
          <span style="font-weight: normal; color: #666; font-size: 9.5pt;">${e.start_date || ''}</span>
        </div>
        ${e.location ? `<div class="exp-sub">${e.location}</div>` : ''}
        <ul>
          ${e.bullets.map((b) => `<li>${b}</li>`).join('')}
        </ul>
      </div>
    `).join('')}
  </div>` : ''}

  ${resume.projects.length > 0 ? `
  <div class="section-content">
    <h2>Projects</h2>
    ${resume.projects.map((p) => `
      <div class="exp-item">
        <div class="exp-header">
          <span>${p.title} ${p.technologies.length > 0 ? `<span style="font-weight: normal; color: #555; font-size: 9.5pt;">(${p.technologies.join(', ')})</span>` : ''}</span>
        </div>
        <ul>
          ${p.bullets.map((b) => `<li>${b}</li>`).join('')}
        </ul>
      </div>
    `).join('')}
  </div>` : ''}

  ${resume.education.length > 0 ? `
  <div class="section-content">
    <h2>Education</h2>
    ${resume.education.map((edu) => `
      <div class="exp-header">
        <span>${edu.degree}, ${edu.institution} ${edu.gpa ? `| GPA: ${edu.gpa}` : ''}</span>
        <span style="font-weight: normal; color: #666; font-size: 9.5pt;">${edu.graduation_year || ''}</span>
      </div>
    `).join('')}
  </div>` : ''}
</body>
</html>`;
}
