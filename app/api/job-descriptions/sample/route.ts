import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import type { JobDescriptionResponse } from '@/lib/types';

export async function POST() {
  const sampleJob: JobDescriptionResponse = {
    id: 'job-sample-fintech-senior',
    title: 'Senior Full Stack Engineer (FinTech Core Platform)',
    company_name: 'Stripe, Inc.',
    description_text: `We are looking for a Senior Full Stack Engineer to join our Core Financial Platform team.
You will architect mission-critical payment workflows, scale microservices, and build high-performance React applications.

Requirements:
• 4+ years of professional full-stack development experience
• Strong proficiency in React, TypeScript, Next.js, and modern CSS
• Production experience with backend systems using Python (FastAPI/Django) or Node.js
• Deep knowledge of relational databases (PostgreSQL, SQL query optimization) and Redis caching
• Hands-on experience with Docker, CI/CD pipelines, and cloud infrastructure (AWS/GCP)
• Strong understanding of RESTful API design, security practices, and microservice architecture

Preferred Qualifications:
• Experience with Kubernetes, Kafka, and distributed event-driven systems
• Familiarity with financial transactions, PCI compliance, and idempotency guarantees
• Degree in Computer Science or equivalent practical engineering experience`,
    extracted_requirements: {
      title: 'Senior Full Stack Engineer (FinTech Core Platform)',
      required_skills: [
        'React', 'TypeScript', 'Next.js', 'Python', 'FastAPI',
        'Node.js', 'PostgreSQL', 'SQL', 'Docker', 'REST APIs', 'Git', 'Redis',
      ],
      preferred_skills: ['Kubernetes', 'AWS', 'Kafka', 'CI/CD', 'Microservices'],
      responsibilities: [
        'Architect mission-critical payment workflows with 99.99% reliability',
        'Scale backend microservices and design low-latency REST endpoints',
        'Build responsive, accessible user interfaces with React and Next.js',
      ],
      qualifications: [
        '4+ years of professional full-stack development experience',
        'Proficiency with TypeScript, Python, PostgreSQL, and Docker',
      ],
      tools_and_tech: [
        'React', 'TypeScript', 'Next.js', 'Python', 'FastAPI',
        'Node.js', 'PostgreSQL', 'Docker', 'Kubernetes', 'AWS',
      ],
      experience_level: 'Senior Level (4+ years)',
      education_required: "Bachelor's Degree in Computer Science or related field",
    },
    created_at: new Date().toISOString(),
  };

  db.saveJobDescription(sampleJob);

  return NextResponse.json(sampleJob);
}
