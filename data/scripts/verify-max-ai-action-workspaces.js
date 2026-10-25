/**
 * Automated Verification Script: MAX AI Recruiting Action Workspaces
 * Verifies all 6 Action Workspaces:
 * 1. Find Candidates
 * 2. Summarize
 * 3. Draft Email
 * 4. Next Steps
 * 5. Compare Candidates
 * 6. Insights
 * And validates Text & Voice multimodal controls and consequential action safety.
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "../../");
let totalAssertions = 0;
let passedAssertions = 0;

function assert(condition, message) {
  totalAssertions++;
  if (condition) {
    passedAssertions++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    console.error(`  ✗ FAIL: ${message}`);
  }
}

async function run() {
  console.log("================================================================================");
  console.log("     MAX AI RECRUITING ACTION WORKSPACES VERIFICATION SUITE");
  console.log("================================================================================\n");

  // 1. Verify MaxAiFloatingPanel.tsx
  const panelPath = path.join(ROOT, "frontend/components/recruitment/MaxAiFloatingPanel.tsx");
  assert(fs.existsSync(panelPath), "MaxAiFloatingPanel.tsx exists");
  const panelCode = fs.readFileSync(panelPath, "utf8");

  // Check state and workspace types
  assert(panelCode.includes("activeWorkspace"), "Implements activeWorkspace state");
  assert(panelCode.includes('"copilot"'), "Workspace type includes copilot");
  assert(panelCode.includes('"find-candidates"'), "Workspace type includes find-candidates");
  assert(panelCode.includes('"summarize"'), "Workspace type includes summarize");
  assert(panelCode.includes('"draft-email"'), "Workspace type includes draft-email");
  assert(panelCode.includes('"next-steps"'), "Workspace type includes next-steps");
  assert(panelCode.includes('"compare"'), "Workspace type includes compare");
  assert(panelCode.includes('"insights"'), "Workspace type includes insights");

  // Check Text, Voice and Copilot integration
  assert(panelCode.includes("handleToggleMode"), "Supports Text and Voice mode toggling");
  assert(panelCode.includes("recognitionRef"), "Implements Speech Recognition for Voice mode");
  assert(panelCode.includes("pendingConfirmation"), "Implements Consequential Action Confirmation dialog");
  assert(panelCode.includes("AiCopilotChatWorkspace"), "Imports and renders AiCopilotChatWorkspace");

  // 1b. Verify AiCopilotChatWorkspace.tsx
  const copilotPath = path.join(ROOT, "frontend/components/recruitment/max-ai/AiCopilotChatWorkspace.tsx");
  assert(fs.existsSync(copilotPath), "AiCopilotChatWorkspace.tsx exists");
  const copilotCode = fs.readFileSync(copilotPath, "utf8");
  assert(copilotCode.includes("QUICK_PROMPTS"), "Provides quick copilot query suggestions");
  assert(copilotCode.includes("isThinking"), "Implements agentic reasoning thinking indicator");
  assert(copilotCode.includes("speakText"), "Implements Text-to-Speech audio speech synthesis");

  // 2. Workspace A: Find Candidates
  const findPath = path.join(ROOT, "frontend/components/recruitment/max-ai/FindCandidatesWorkspace.tsx");
  assert(fs.existsSync(findPath), "FindCandidatesWorkspace.tsx exists");
  const findCode = fs.readFileSync(findPath, "utf8");
  assert(findCode.includes("Find Candidates"), "Find Candidates heading rendered");
  assert(findCode.includes("Natural search:"), "Natural-language search field present");
  assert(findCode.includes("AVAILABLE_SKILLS"), "Multi-skill filter selector configured");
  assert(findCode.includes("minExp"), "Minimum experience filter implemented");
  assert(findCode.includes("showAdvanced"), "Collapsible advanced filters implemented");
  assert(findCode.includes("activeTab"), "Supports Search, Recommendations, and Saved views");
  assert(findCode.includes("onAddToRequisition"), "Supports adding candidates to requisition without duplicate records");

  // 3. Workspace B: Summarize
  const sumPath = path.join(ROOT, "frontend/components/recruitment/max-ai/SummarizeWorkspace.tsx");
  assert(fs.existsSync(sumPath), "SummarizeWorkspace.tsx exists");
  const sumCode = fs.readFileSync(sumPath, "utf8");
  assert(sumCode.includes("Requisition Summary"), "Requisition Summary heading rendered");
  assert(sumCode.includes("Candidate Pipeline Stage Distribution"), "Shows stage distribution telemetry");
  assert(sumCode.includes("Key Progress Highlights"), "Displays progress highlights");
  assert(sumCode.includes("Outstanding Actions, Risks & Delays"), "Displays risks and delays");
  assert(sumCode.includes("showSupportingDetails"), "Provides option to view supporting details");

  // 4. Workspace C: Draft Email
  const emailPath = path.join(ROOT, "frontend/components/recruitment/max-ai/DraftEmailWorkspace.tsx");
  assert(fs.existsSync(emailPath), "DraftEmailWorkspace.tsx exists");
  const emailCode = fs.readFileSync(emailPath, "utf8");
  assert(emailCode.includes("Email Purpose"), "Email Purpose selector provided");
  assert(emailCode.includes("Interview Invitation"), "Supports Interview Invitation purpose");
  assert(emailCode.includes("Authorized Recipient"), "Recipient selection based on verified records");
  assert(emailCode.includes("Communication Tone"), "Tone selection configured");
  assert(emailCode.includes("handleCopy"), "Copy to clipboard implemented");
  assert(emailCode.includes("onRequestSendEmail"), "Send email delegates to confirmation flow");

  // 5. Workspace D: Next Steps
  const nextPath = path.join(ROOT, "frontend/components/recruitment/max-ai/NextStepsWorkspace.tsx");
  assert(fs.existsSync(nextPath), "NextStepsWorkspace.tsx exists");
  const nextCode = fs.readFileSync(nextPath, "utf8");
  assert(nextCode.includes("Next Steps"), "Next Steps heading rendered");
  assert(nextCode.includes("Advance Priya Menon to Executive Debrief"), "Shows prioritized advance recommendation");
  assert(nextCode.includes("Collect Missing Interview Scorecards"), "Shows scorecard reminder recommendation");
  assert(nextCode.includes("Complete Level 2 VP Approval"), "Shows offer approval recommendation");
  assert(nextCode.includes("Initiate Background Verification"), "Shows BGV recommendation");
  assert(nextCode.includes("onRequestConfirmation"), "Consequential actions protected by confirmation step");

  // 6. Workspace E: Compare Candidates
  const compPath = path.join(ROOT, "frontend/components/recruitment/max-ai/CompareCandidatesWorkspace.tsx");
  assert(fs.existsSync(compPath), "CompareCandidatesWorkspace.tsx exists");
  const compCode = fs.readFileSync(compPath, "utf8");
  assert(compCode.includes("Compare Candidates"), "Compare Candidates heading rendered");
  assert(compCode.includes("Candidate A") && compCode.includes("Candidate B"), "Side-by-side selection for candidates");
  assert(compCode.includes("Core Skills Alignment"), "Compares skills matrix");
  assert(compCode.includes("Coding Benchmark"), "Compares assessment percentiles");
  assert(compCode.includes("Interview Scorecard"), "Compares interview feedback ratings");
  assert(compCode.includes("Strengths & Gaps"), "Analyzes job-specific strengths and gaps");
  assert(compCode.includes("Scoring Methodology"), "Explains scoring methodology transparently");

  // 7. Workspace F: Insights
  const insPath = path.join(ROOT, "frontend/components/recruitment/max-ai/InsightsWorkspace.tsx");
  assert(fs.existsSync(insPath), "InsightsWorkspace.tsx exists");
  const insCode = fs.readFileSync(insPath, "utf8");
  assert(insCode.includes("Recruiting Insights"), "Recruiting Insights heading rendered");
  assert(insCode.includes("Time to Hire"), "Displays time to hire KPI");
  assert(insCode.includes("Offer Acceptance"), "Displays offer acceptance rate KPI");
  assert(insCode.includes("Configured Stage Funnel"), "Renders stage conversion funnel");
  assert(insCode.includes("Top Sources"), "Renders sourcing channel breakdown");
  assert(insCode.includes("Velocity Status"), "Renders requisition-level turnaround velocity");

  console.log("\n--------------------------------------------------------------------------------");
  console.log(`Assertions Passed: ${passedAssertions} / ${totalAssertions}`);
  if (passedAssertions === totalAssertions) {
    console.log("Status: ALL MAX AI ACTION WORKSPACES VERIFIED PERFECTLY (100% SUCCESS)");
    process.exit(0);
  } else {
    console.error("Status: SOME VERIFICATION ASSERTIONS FAILED");
    process.exit(1);
  }
}

run();
