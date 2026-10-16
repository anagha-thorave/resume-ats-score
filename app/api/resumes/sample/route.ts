import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import type { ResumeResponse, ParsedResumeData } from '@/lib/types';

export async function POST() {
  const sampleData: ParsedResumeData = {
    contact: {
      full_name: 'Alex Chen',
      email: 'alex.chen.dev@example.com',
      phone: '+1 (555) 382-9401',
      location: 'San Francisco, CA',
      linkedin_url: 'https://linkedin.com/in/alexchen-dev',
      github_url: 'https://github.com/alexchen-dev',
      portfolio_url: 'https://alexchen.dev',
    },
    summary:
      'Innovative Full Stack Software Engineer with 4+ years of experience engineering high-throughput web applications with React, TypeScript, Python, and cloud infrastructure. Proven track record of improving system uptime and reducing latency.',
    technical_skills: [
      'JavaScript', 'TypeScript', 'React', 'Next.js', 'Python',
      'FastAPI', 'Node.js', 'PostgreSQL', 'SQL', 'Git',
      'REST APIs', 'Tailwind CSS', 'Redis',
    ],
    soft_skills: [
      'Problem Solving', 'Agile', 'Team Collaboration', 'System Design', 'Communication',
    ],
    tools_and_frameworks: ['Docker', 'Linux', 'VS Code', 'Postman', 'Jest'],
    experience: [
      {
        id: 'exp-sample-1',
        title: 'Senior Frontend / Full Stack Engineer',
        company: 'Apex Cloud Systems',
        location: 'San Francisco, CA',
        start_date: '2022 - Present',
        is_current: true,
        bullets: [
          'Engineered real-time analytics dashboard with React, TypeScript, and FastAPI serving 120,000+ monthly active users.',
          'Optimized client-side rendering bundle sizes by 38%, accelerating average first-contentful paint to 0.8 seconds.',
          'Collaborated in an agile cross-functional team to architect reusable component design system adopted across 4 applications.',
        ],
      },
      {
        id: 'exp-sample-2',
        title: 'Software Engineer',
        company: 'Nexus Data Solutions',
        location: 'San Jose, CA',
        start_date: '2020 - 2022',
        is_current: false,
        bullets: [
          'Developed backend microservices in Python and PostgreSQL processing 2M+ records daily with 99.9% uptime.',
          'Implemented RESTful API endpoints and integrated automated CI/CD unit testing pipelines with PyTest.',
          'Reduced database query execution latency by 45% through indexed query optimizations and Redis caching.',
        ],
      },
    ],
    internships: [
      {
        id: 'int-sample-1',
        title: 'Software Engineering Intern',
        company: 'TechStream Labs',
        location: 'Sunnyvale, CA',
        start_date: 'Summer 2019',
        is_current: false,
        bullets: [
          'Built internal automation tooling with Python and JavaScript for test result aggregation.',
        ],
      },
    ],
    education: [
      {
        id: 'edu-sample-1',
        institution: 'University of California, Berkeley',
        degree: 'Bachelor of Science in Computer Science',
        field_of_study: 'Computer Science',
        graduation_year: '2020',
        gpa: '3.8 / 4.0',
      },
    ],
    projects: [
      {
        id: 'proj-sample-1',
        title: 'Distributed Task Engine',
        technologies: ['Python', 'FastAPI', 'Redis', 'Docker'],
        link: 'https://github.com/alexchen-dev/task-engine',
        bullets: [
          'Constructed an asynchronous task queuing system capable of handling 5,000 concurrent jobs.',
          'Implemented WebSocket live progress streaming for connected dashboard clients.',
        ],
      },
      {
        id: 'proj-sample-2',
        title: 'AI Documentation Search',
        technologies: ['React', 'TypeScript', 'Node.js', 'Vector DB'],
        link: 'https://github.com/alexchen-dev/ai-search',
        bullets: [
          'Designed semantic search interface with instant typeahead and markdown highlighting.',
        ],
      },
    ],
    certifications: [
      {
        id: 'cert-sample-1',
        name: 'AWS Certified Solutions Architect – Associate',
        issuer: 'Amazon Web Services',
        issue_date: '2023',
      },
    ],
    achievements: [
      {
        id: 'ach-sample-1',
        title: 'Hackathon 1st Place Winner',
        description:
          'Led 4-person team to build real-time collaborative workspace tool out of 85 participating teams.',
      },
    ],
    languages: ['English (Fluent)', 'Mandarin (Conversational)'],
    extraction_warnings: [],
    completeness_score: 95.0,
  };

  const id = 'res-sample-alex-chen';
  const resume: ResumeResponse = {
    id,
    original_filename: 'Alex_Chen_Resume.pdf',
    file_type: 'application/pdf',
    file_size: 46080,
    extracted_text: `${sampleData.contact.full_name}\n${sampleData.contact.email}\n${sampleData.summary}`,
    parsed_data: sampleData,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  db.saveResume(resume);

  return NextResponse.json(resume);
}
