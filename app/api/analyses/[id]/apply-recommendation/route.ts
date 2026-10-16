import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { calculateAtsScore } from '@/lib/scoring';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const analysis = db.getAnalysis(params.id);
  if (!analysis) {
    return NextResponse.json({ detail: 'Analysis not found' }, { status: 404 });
  }

  const resume = db.getResume(analysis.resume_id);
  if (!resume) {
    return NextResponse.json({ detail: 'Resume not found' }, { status: 404 });
  }

  const job = db.getJobDescription(analysis.job_description_id);

  try {
    const body = await req.json();
    const { recommendation_id, action, custom_text } = body;

    const rec = analysis.recommendations.find((r) => r.id === recommendation_id);
    if (!rec) {
      return NextResponse.json({ detail: 'Recommendation not found' }, { status: 404 });
    }

    if (action === 'rejected') {
      rec.status = 'rejected';
      db.saveAnalysis(analysis);
      return NextResponse.json({ status: 'rejected', recommendation_id });
    }

    const appliedText = action === 'custom' && custom_text ? custom_text : rec.suggested_text;

    // Apply change based on section
    if (rec.section === 'summary') {
      resume.parsed_data.summary = appliedText;
    } else if (rec.section === 'experience' && rec.item_id !== undefined && rec.bullet_index !== undefined) {
      const exp = resume.parsed_data.experience.find((e) => e.id === rec.item_id);
      if (exp && exp.bullets[rec.bullet_index] !== undefined) {
        exp.bullets[rec.bullet_index] = appliedText;
      }
    } else if (rec.section === 'skills') {
      // Extract skill from target requirement or suggestion
      const skillMatch = rec.target_requirement.replace(/^Target Skill:\s*/i, '').trim();
      if (skillMatch && !resume.parsed_data.technical_skills.includes(skillMatch)) {
        resume.parsed_data.technical_skills.push(skillMatch);
      }
    }

    rec.status = 'accepted';
    resume.updated_at = new Date().toISOString();
    db.saveResume(resume);

    // Re-score analysis if job is available
    if (job) {
      const scoring = calculateAtsScore(resume.parsed_data, job.extracted_requirements);
      analysis.overall_score = scoring.overall_score;
      analysis.score_label = scoring.score_label;
      analysis.category_scores = scoring.category_scores;
      analysis.matched_keywords = scoring.matched_keywords;
      analysis.missing_keywords = scoring.missing_keywords;
      analysis.formatting_feedback = scoring.formatting_feedback;
    }

    db.saveAnalysis(analysis);

    return NextResponse.json({
      status: 'applied',
      recommendation_id,
      updated_score: analysis.overall_score,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Apply failed';
    return NextResponse.json({ detail: msg }, { status: 500 });
  }
}
