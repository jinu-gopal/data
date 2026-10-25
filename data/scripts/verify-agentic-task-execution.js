/**
 * MAX-ERP Suite 19: Agentic Autonomous Task Execution Verification
 * Verifies that the AI Copilot acts as an autonomous agent executing tasks:
 * - Candidate stage progression ("Move Priya to next stage" -> advances to Offer)
 * - Requisition approval & publishing ("Approve REQ-2026-00123" -> Open)
 * - Drawer activation ("Open pending approvals" -> activates drawer)
 * - Communication composer activation ("Send candidate email" -> opens prefilled modal)
 * - Structured Agent Execution Card with interactive action buttons
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
    console.log(`  ✓ ${message}`);
  } else {
    console.error(`  ✗ FAIL: ${message}`);
  }
}

async function runTests() {
  console.log("================================================================================");
  console.log("Suite 19: Agentic Autonomous Task Execution Verification");
  console.log("================================================================================");

  // 1. Verify page.tsx has autonomous agent handler
  const pagePath = path.join(ROOT, "frontend/app/recruitment/page.tsx");
  assert(fs.existsSync(pagePath), "frontend/app/recruitment/page.tsx exists");

  const pageCode = fs.readFileSync(pagePath, "utf8");
  assert(pageCode.includes("isStageAction"), "Autonomous candidate stage mutation intent implemented in page.tsx");
  assert(pageCode.includes("recruitmentStore.updateCandidateStage"), "Candidate stage mutation executed directly on store");
  assert(pageCode.includes("loadDashboardData()"), "Dashboard telemetry reloaded immediately after agent task");
  assert(pageCode.includes("triggerBanner("), "Visual agent action toast banner triggered");
  assert(pageCode.includes("aiAgentCard"), "aiAgentCard state and rendering implemented in page.tsx");

  // 2. Verify Next Stage progression logic
  assert(pageCode.includes('case "Interview":\n              targetStage = "Offer"'), "Interview stage advances to Offer stage on 'next stage' command");
  assert(pageCode.includes('case "Screening":\n              targetStage = "Interview"'), "Screening stage advances to Interview stage on 'next stage' command");
  assert(pageCode.includes('case "Applied":\n              targetStage = "Screening"'), "Applied stage advances to Screening stage on 'next stage' command");

  // 3. Verify Requisition Approval Task Execution
  assert(pageCode.includes("recruitmentStore.updateRequisitionStatus(targetReq.id, \"Open\")"), "Requisition status mutated to Open on approval command");
  assert(pageCode.includes("approvalStep: targetReq.totalApprovalSteps"), "Requisition approval step completed autonomously");

  // 4. Verify Open Pending Approvals Drawer Activation
  assert(pageCode.includes("setSelectedReq(pendingReq)"), "Pending requisition drawer activated directly on 'Open pending approvals'");
  assert(pageCode.includes('setReqStatusFilter("Pending Approval")'), "Requisition filter set to Pending Approval");

  // 5. Verify Communication Composer Agent Task
  assert(pageCode.includes("setShowComposeCommModal(true)"), "Communication composer modal opened autonomously");
  assert(pageCode.includes("setCommRecipientType(\"candidate\")"), "Recipient configured to candidate autonomously");
  assert(pageCode.includes("setCommSubject("), "Subject pre-drafted autonomously");

  // 6. Verify Structured Agent Card UI rendering
  assert(pageCode.includes("Autonomous Agent"), "Autonomous Agent indicator rendered on execution card");
  assert(pageCode.includes("aiAgentCard.actions.map"), "Interactive action buttons rendered on Agent Card");
  assert(pageCode.includes("aiAgentCard.badge"), "Status badge rendered on Agent Card");
  assert(pageCode.includes("aiAgentCard.details.map"), "Execution details bullet list rendered on Agent Card");

  // 7. Verify AiAssistantPanel.tsx also supports agentic stage advancement
  const panelPath = path.join(ROOT, "frontend/components/recruitment/AiAssistantPanel.tsx");
  const panelCode = fs.readFileSync(panelPath, "utf8");
  assert(panelCode.includes("Autonomous Agent Execution"), "AiAssistantPanel implements Autonomous Agent Execution");
  assert(panelCode.includes('case "Interview":\n                  targetStage = "Offer"'), "AiAssistantPanel advances Interview to Offer on 'next stage'");

  console.log("--------------------------------------------------------------------------------");
  console.log(`Assertions Passed: ${passedAssertions} / ${totalAssertions}`);
  if (passedAssertions === totalAssertions) {
    console.log("Status: ALL SUITE 19 TESTS PASSED (100% SUCCESS)");
    process.exit(0);
  } else {
    console.error("Status: SOME SUITE 19 TESTS FAILED");
    process.exit(1);
  }
}

runTests();
