async function verifyScreen4() {
  const url = 'http://localhost:3000/recruitment/requisitions/REQ-2026-00123';
  const pageRes = await fetch(url);
  const html = await pageRes.text();
  
  const checks = [
    'REQ-2026-00123',
    'Senior Java Developer',
    'Engineering',
    'Bangalore, India',
    'Openings',
    'Full-time',
    '01 Dec 2026',
    'Post to Job Boards',
    'Overview',
    'Job Description',
    'Hiring Team',
    'Candidates (',
    'Interviews (2)',
    'Offers (0)',
    'Approvals',
    'Activity',
    'Related',
    'Approval Status',
    'Requisition Information',
    'JD-2026-00123',
    'MAX Technologies Pvt Ltd',
    'Standard Engineering Template',
    'View Full Description',
    'Maria Lopez',
    'John Smith (You)',
    'ENG-001 - Engineering',
    'Compensation &amp; Vacancy',
    'New Position',
    'Additional Information',
    'Product Engineering',
    'AI Assistant',
    'Summarize this requisition',
    'Suggest matching candidates',
    'Generate job description',
    'Create interview questions',
    'Approval Workflow',
    'View History',
    'Status &amp; Dates',
    'Quick Actions',
    'Cancel Requisition',
  ];

  console.log('=== SCREEN 4 REQUISITION DETAILS VERIFICATION ===');
  console.log('Target URL:', url);
  console.log('HTTP Status:', pageRes.status);

  let passedCount = 0;
  for (const c of checks) {
    const passed = html.includes(c);
    console.log(` - Check [${c}]: ${passed ? '✓ PASS' : '✗ FAIL'}`);
    if (passed) passedCount++;
  }

  const allPassed = passedCount === checks.length;
  console.log(`Total Checks: ${passedCount} / ${checks.length}`);
  console.log('Overall Elements Result:', allPassed ? '100% ALL CHECKS PASSED' : 'SOME CHECKS FAILED');
}

verifyScreen4();
