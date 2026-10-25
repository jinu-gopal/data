async function verify() {
  const pageRes = await fetch('http://localhost:3000/recruitment/requisitions/create');
  const html = await pageRes.text();
  const checks = [
    'Create Job Requisition',
    'Job Description business object',
    'Section A — Job Details',
    'Section B — Job Description',
    'Section C — Hiring Team',
    'Section D — Compensation &amp; Vacancy',
    'Section E — Additional Information',
    'Save as Draft',
    'Submit for Approval',
    'MAX AI Assistant',
    'Use Template',
    'Preview'
  ];
  console.log('=== SCREEN 3 WEB ROUTE VERIFICATION ===');
  console.log('HTTP Status:', pageRes.status);
  let allPassed = true;
  for (const c of checks) {
    const passed = html.includes(c);
    console.log(` - Check [${c}]: ${passed ? '✓ PASS' : '✗ FAIL'}`);
    if (!passed) allPassed = false;
  }
  console.log('Overall Elements Result:', allPassed ? '100% ALL CHECKS PASSED' : 'SOME CHECKS FAILED');
}
verify();
