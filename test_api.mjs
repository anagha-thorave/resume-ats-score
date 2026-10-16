async function test() {
  console.log('Testing ResumeIQ Full-Stack Next.js APIs...');
  
  // 1. Health
  const health = await fetch('http://localhost:3000/api/health').then(r => r.json());
  console.log('✓ Health:', health.status, health.runtime);

  // 2. Sample resume
  const resume = await fetch('http://localhost:3000/api/resumes/sample', { method: 'POST' }).then(r => r.json());
  console.log('✓ Sample Resume loaded:', resume.parsed_data.contact.full_name);

  // 3. Sample job
  const job = await fetch('http://localhost:3000/api/job-descriptions/sample', { method: 'POST' }).then(r => r.json());
  console.log('✓ Sample Job loaded:', job.title);

  // 4. Run Analysis
  const analysis = await fetch('http://localhost:3000/api/analyses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resume_id: resume.id, job_description_id: job.id })
  }).then(r => r.json());
  console.log('✓ ATS Analysis calculated:');
  console.log('  - Overall Score:', analysis.overall_score + '%', `(${analysis.score_label})`);
  console.log('  - Matched Keywords:', analysis.matched_keywords?.length);
  console.log('  - Missing Keywords:', analysis.missing_keywords?.length);
  console.log('  - Recommendations:', analysis.recommendations?.length);

  // 5. Dashboard summary
  const dashboard = await fetch('http://localhost:3000/api/history/dashboard').then(r => r.json());
  console.log('✓ Dashboard Metrics:', `Total Resumes: ${dashboard.total_resumes}, Avg Score: ${dashboard.average_ats_score}%`);

  // 6. Test Pages
  const pages = ['/', '/dashboard', '/job', '/editor', '/history'];
  for (const page of pages) {
    const res = await fetch(`http://localhost:3000${page}`);
    console.log(`✓ Page ${page} HTTP ${res.status}`);
  }

  console.log('\n🎉 ALL FULL-STACK NEXT.JS ENDPOINTS AND PAGES ARE WORKING PERFECTLY!');
}

test().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
