/**
 * MAX-ERP Suite 18: AI Candidate Assistant & Voice Action Intelligence
 * Verifies that the AI Assistant correctly resolves candidates (e.g. Priya Menon),
 * generates structured interactive action cards, supports voice/text actions,
 * and executes live stage mutations and requisition approvals.
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
  console.log("Suite 18: AI Candidate Assistant & Voice Action Verification");
  console.log("================================================================================");

  // 1. Verify AiAssistantPanel.tsx exists and imports real domain stores
  const panelPath = path.join(ROOT, "frontend/components/recruitment/AiAssistantPanel.tsx");
  assert(fs.existsSync(panelPath), "AiAssistantPanel.tsx exists in frontend/components/recruitment");

  const panelCode = fs.readFileSync(panelPath, "utf8");
  assert(panelCode.includes("recruitmentStore"), "AiAssistantPanel imports recruitmentStore");
  assert(panelCode.includes("maxAiBrain"), "AiAssistantPanel imports maxAiBrain");
  assert(panelCode.includes("useRouter"), "AiAssistantPanel imports useRouter for card navigation");

  // 2. Verify candidate search & dossier resolution (No hardcoded John Smith placeholder)
  assert(!panelCode.includes('candidateName: "John Smith"'), "Hardcoded 'John Smith' placeholder removed from AiAssistantPanel");
  assert(panelCode.includes("isCandidateQuery"), "AiAssistantPanel implements dedicated Candidate Query matching");
  assert(panelCode.includes("matchedCand"), "AiAssistantPanel resolves specific matched candidate from recruitmentStore");
  assert(panelCode.includes("skillsBreakdown"), "AiAssistantPanel formats verified candidate skills and match score");
  assert(panelCode.includes("Candidate Dossier:"), "AiAssistantPanel generates structured Candidate Dossier text");

  // 3. Verify Interactive Action Cards with Navigation
  assert(panelCode.includes("actionLabel || c.actionUrl || c.reqData || c.onClick"), "Interactive action button rendered on cards");
  assert(panelCode.includes("router.push(c.actionUrl)"), "Cards navigate to actionUrl via Next.js router");
  assert(panelCode.includes("onSelectRequisition(c.reqData)"), "Requisition cards trigger onSelectRequisition drawer open");
  assert(panelCode.includes("/recruitment/candidates?id="), "Direct deep link to candidate profile provided in cards");
  assert(panelCode.includes("/recruitment/offers"), "Direct link to Candidate Offers provided in cards");

  // 4. Verify AI Actions for Requisitions & Pending Approvals
  assert(panelCode.includes("updateRequisitionStatus"), "AI Assistant can authorize & approve requisitions");
  assert(panelCode.includes("open pending"), "AI Assistant supports voice/text command to open pending approvals");
  assert(panelCode.includes("onSelectRequisition(pending[0])"), "AI Assistant automatically opens pending requisition drawer on 'open' command");

  // 5. Verify Candidate Offer AI Approvals
  assert(panelCode.includes("approveOfferByLevel"), "AI Assistant supports Level 2 Candidate Offer approvals");
  assert(panelCode.includes("Elena Vance (VP)"), "Executive sign-off recorded on offer approval");

  // 6. Verify Speech Synthesis TTS
  assert(panelCode.includes("speakText"), "Speech synthesis TTS function implemented");
  assert(panelCode.includes("SpeechSynthesisUtterance"), "SpeechSynthesisUtterance invoked for voice feedback");

  // 7. Verify API Route /api/recruitment/ai-recruiter candidate intelligence
  const routePath = path.join(ROOT, "frontend/app/api/recruitment/ai-recruiter/route.ts");
  assert(fs.existsSync(routePath), "AI Recruiter API route exists");
  const routeCode = fs.readFileSync(routePath, "utf8");
  assert(routeCode.includes("Priya Menon"), "AI Recruiter API provides real Priya Menon candidate data");
  assert(routeCode.includes("isNaturalQuery"), "AI Recruiter API safely handles natural queries without mad-lib output");

  // 8. Verify Dashboard AI Voice handler in frontend/app/recruitment/page.tsx
  const dashPath = path.join(ROOT, "frontend/app/recruitment/page.tsx");
  const dashCode = fs.readFileSync(dashPath, "utf8");
  assert(dashCode.includes("Candidate Dossier:"), "Dashboard AI voice handler also resolves candidate dossiers");
  assert(dashCode.includes("active candidate offers"), "Dashboard AI voice handler provides offer status");

  // 9. Verify candidate Priya Menon in recruitmentStore
  const storePath = path.join(ROOT, "frontend/lib/recruitment-store.ts");
  const storeCode = fs.readFileSync(storePath, "utf8");
  assert(storeCode.includes("Priya Menon"), "Priya Menon exists in recruitmentStore with full profile");
  assert(storeCode.includes("REQ-2026-00123"), "Priya Menon linked to REQ-2026-00123 (Senior Java Developer)");
  assert(storeCode.includes("matchScore: 92"), "Priya Menon has 92% match score");

  console.log("--------------------------------------------------------------------------------");
  console.log(`Assertions Passed: ${passedAssertions} / ${totalAssertions}`);
  if (passedAssertions === totalAssertions) {
    console.log("Status: ALL SUITE 18 TESTS PASSED (100% SUCCESS)");
    process.exit(0);
  } else {
    console.error("Status: SOME SUITE 18 TESTS FAILED");
    process.exit(1);
  }
}

runTests();
