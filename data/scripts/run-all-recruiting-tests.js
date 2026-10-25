// ============================================================================
// MAX ERP Recruiting: Master Test Runner
// Runs all recruiting verification suites and presents a unified summary
// ============================================================================

const { execSync } = require("child_process");
const path = require("path");

const suites = [
  { name: "AI Recruiter & 10 AI Pillars", file: "verify-ai-capabilities.js" },
  { name: "Candidate Applications & AI Drawer", file: "verify-candidates.js" },
  { name: "Job Details Screen & Sub-Tabs", file: "verify-job-details.js" },
  { name: "Interactive Workflows & APIs", file: "verify-all-functions.js" },
  { name: "Screen 6: Review & Publish", file: "verify-screen6.js" },
  { name: "Screen 5: Career Site & Job Boards", file: "verify-screen5.js" },
  { name: "Screen 4: Requisition Details", file: "verify-screen4.js" },
  { name: "Screen 3: Create Job Requisition", file: "verify-screen3.js" },
  { name: "Full Module & 7 Category Hubs", file: "verify-full-module.js" },
  { name: "10 User Feedback Enhancements", file: "verify-user-feedback-fixes.js" },
  { name: "Candidate Career Portal (/careers)", file: "verify-careers-portal.js" },
  { name: "Business Objects & Metadata Engine", file: "verify-business-objects.js" },
  { name: "Workforce Management & EC Core", file: "verify-workforce.js" },
  { name: "Security, RBAC & Governance Studio", file: "verify-security-governance.js" },
  { name: "Universal Enterprise AI Copilot", file: "verify-enterprise-ai-copilot.js" },
  { name: "Voice Commands & Multimodal Speech AI", file: "verify-voice-command-ai.js" },
  { name: "Candidate Offers & Higher-Level Approvals", file: "verify-candidate-offers.js" },
  { name: "AI Candidate Assistant & Voice Action Intelligence", file: "verify-ai-candidate-assistant.js" },
  { name: "Agentic Autonomous Task Execution", file: "verify-agentic-task-execution.js" },
  { name: "Autonomous Talent Pipeline & Agentic AI Power", file: "verify-ai-talent-pipeline-power.js" },
  { name: "MAX AI Recruiting Action Workspaces", file: "verify-max-ai-action-workspaces.js" },
  { name: "MAX ERP AI Recruiting Intelligence Master", file: "verify-recruiting-intelligence-master.js" },
];

console.log("\n================================================================================");
console.log("             MAX ERP RECRUITING — MASTER AUTOMATED TEST RUNNER");
console.log("================================================================================\n");

let passedSuites = 0;
let failedSuites = 0;
const results = [];

for (const suite of suites) {
  process.stdout.write(`► Running: ${suite.name} (${suite.file})... `);
  const startTime = Date.now();
  try {
    const scriptPath = path.join(__dirname, suite.file);
    execSync(`node "${scriptPath}"`, { stdio: "pipe" });
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✓ PASSED [${duration}s]`);
    passedSuites++;
    results.push({ name: suite.name, status: "PASSED", duration: `${duration}s` });
  } catch (err) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✗ FAILED [${duration}s]`);
    failedSuites++;
    results.push({ name: suite.name, status: "FAILED", duration: `${duration}s` });
  }
}

console.log("\n================================================================================");
console.log("                        MASTER TEST SUITE SUMMARY");
console.log("================================================================================");
results.forEach((r, idx) => {
  const icon = r.status === "PASSED" ? "✓" : "✗";
  console.log(`  ${icon} [${idx + 1}/${results.length}] ${r.name.padEnd(42)}: ${r.status} (${r.duration})`);
});
console.log("================================================================================");
console.log(`Final Result: ${passedSuites}/${suites.length} Suites Passed (${((passedSuites / suites.length) * 100).toFixed(0)}%)`);
if (failedSuites > 0) {
  console.log("Status: SOME SUITES FAILED");
  process.exit(1);
} else {
  console.log("Status: ALL SUITES PASSED PERFECTLY (100% HEALTHY)");
}
console.log("================================================================================\n");
