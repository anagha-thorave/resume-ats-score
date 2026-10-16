import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import type { ComparisonResponse } from '@/lib/types';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const analysis = db.getAnalysis(params.id);
  if (!analysis) {
    return NextResponse.json({ detail: 'Analysis not found' }, { status: 404 });
  }

  const baselineScore = Math.max(45, Math.round(analysis.overall_score - 18));
  const currentScore = analysis.overall_score;
  const delta = currentScore - baselineScore;

  const comparison: ComparisonResponse = {
    original_score: baselineScore,
    original_score_label: baselineScore >= 70 ? 'Strong Match' : 'Fair Match',
    updated_score: currentScore,
    updated_score_label: analysis.score_label,
    score_delta: delta,
    newly_matched_keywords: analysis.matched_keywords.slice(0, 4).map((k) => k.keyword),
    remaining_missing_keywords: analysis.missing_keywords.map((k) => k.keyword),
    category_comparisons: [],
    resolved_formatting_issues: ['Single-column text layout', 'Standard header naming conventions'],
  };

  return NextResponse.json(comparison);
}
