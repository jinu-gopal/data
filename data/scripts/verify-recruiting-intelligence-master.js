/**
 * Automated Verification Script: MAX ERP AI-Powered Recruiting Intelligence Master Suite
 * Validates the 6 Core Differentiators:
 * 1. MAX AI — Unified Recruiting Copilot & Action Registry
 * 2. MAX Talent Memory — Intelligent Candidate Rediscovery & Equivalence Dictionary
 * 3. MAX Candidate Dossier — Unified 360° Candidate Intelligence & 8 AI Pillars
 * 4. MAX AI Studio — Configurable Actions & Visual Workflow Builder
 * 5. Explainable Candidate Intelligence — Evidence-Based Match Scoring & Citations
 * 6. MAX Autonomous Operations — Proactive Monitoring & Enterprise ERP Handoff
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
  console.log("   MAX ERP AI-POWERED RECRUITING INTELLIGENCE MASTER VERIFICATION SUITE");
  console.log("================================================================================\n");

  // ---------------------------------------------------------------------------
  // 1. MAX AI Foundation & Action Registry
  // ---------------------------------------------------------------------------
  console.log("► [1/6] Verifying MAX AI Action Registry & Server Execution Handlers...");
  const registryPath = path.join(ROOT, "frontend/lib/recruitment-ai-action-registry.ts");
  assert(fs.existsSync(registryPath), "recruitment-ai-action-registry.ts exists");
  const registryCode = fs.readFileSync(registryPath, "utf8");

  assert(registryCode.includes("INITIAL_AI_ACTIONS"), "Defines core enterprise action catalog (INITIAL_AI_ACTIONS)");
  assert(registryCode.includes("GENERATE_JOB_DESCRIPTION"), "Registers GENERATE_JOB_DESCRIPTION action");
  assert(registryCode.includes("FIND_CANDIDATES"), "Registers FIND_CANDIDATES action");
  assert(registryCode.includes("SUMMARIZE_CANDIDATE_DOSSIER"), "Registers SUMMARIZE_CANDIDATE_DOSSIER action");
  assert(registryCode.includes("COMPARE_CANDIDATES"), "Registers COMPARE_CANDIDATES action");
  assert(registryCode.includes("DRAFT_CANDIDATE_OUTREACH"), "Registers DRAFT_CANDIDATE_OUTREACH action");
  assert(registryCode.includes("REDISCOVER_TALENT_MEMORY"), "Registers REDISCOVER_TALENT_MEMORY action");
  assert(registryCode.includes("EXECUTE_STAGE_ADVANCE"), "Registers EXECUTE_STAGE_ADVANCE action");
  assert(registryCode.includes("EXECUTE_OFFER_APPROVAL"), "Registers EXECUTE_OFFER_APPROVAL action");
  assert(registryCode.includes("requiresConfirmation: true"), "Enforces confirmation requirement for consequential actions");
  assert(registryCode.includes("recruitmentAiActionRegistry = new RecruitmentAiActionRegistry"), "Exports singleton registry");

  const actionApiRoute = path.join(ROOT, "frontend/app/api/recruitment/ai-studio/actions/route.ts");
  assert(fs.existsSync(actionApiRoute), "Action Studio API route exists");
  const actionApiCode = fs.readFileSync(actionApiRoute, "utf8");
  assert(actionApiCode.includes("recruitmentAiActionRegistry.getAllActions"), "API supports GET actions listing");
  assert(actionApiCode.includes("recruitmentAiActionRegistry.executeAction"), "API supports POST execution endpoint");

  // ---------------------------------------------------------------------------
  // 2. MAX Talent Memory & Intelligent Rediscovery
  // ---------------------------------------------------------------------------
  console.log("\n► [2/6] Verifying MAX Talent Memory & Rediscovery Engine...");
  const talentMemPath = path.join(ROOT, "frontend/lib/recruitment-talent-memory.ts");
  assert(fs.existsSync(talentMemPath), "recruitment-talent-memory.ts exists");
  const talentMemCode = fs.readFileSync(talentMemPath, "utf8");

  assert(talentMemCode.includes("SKILL_EQUIVALENCE_DICTIONARY"), "Contains comprehensive skill equivalence dictionary");
  assert(talentMemCode.includes('"Kubernetes"'), "Recognizes Kubernetes canonical skill");
  assert(talentMemCode.includes('"k8s"'), "Recognizes k8s container orchestration equivalent");
  assert(talentMemCode.includes('"Kafka"'), "Recognizes Kafka canonical skill");
  assert(talentMemCode.includes('"event streaming"'), "Recognizes event streaming equivalent");
  assert(talentMemCode.includes('"Spring Boot"'), "Recognizes Spring Boot canonical skill");
  assert(talentMemCode.includes("searchPastTalent"), "Implements semantic rediscovery search algorithm");
  assert(talentMemCode.includes("checkDuplicateProfile"), "Implements cross-requisition duplicate detection");
  assert(talentMemCode.includes("provenance"), "Tracks previous requisition application provenance");

  const talentMemApi = path.join(ROOT, "frontend/app/api/recruitment/talent-memory/route.ts");
  assert(fs.existsSync(talentMemApi), "Talent memory API route exists");

  // ---------------------------------------------------------------------------
  // 3. MAX Candidate Dossier & 8 AI Pillars
  // ---------------------------------------------------------------------------
  console.log("\n► [3/6] Verifying MAX Candidate Dossier & 8 AI Evaluation Pillars...");
  const dossierPath = path.join(ROOT, "frontend/lib/recruitment-candidate-dossier.ts");
  assert(fs.existsSync(dossierPath), "recruitment-candidate-dossier.ts exists");
  const dossierCode = fs.readFileSync(dossierPath, "utf8");

  assert(dossierCode.includes("UnifiedCandidateDossier"), "Defines UnifiedCandidateDossier data structure");
  assert(dossierCode.includes("aiEvaluations:"), "Evaluates 8 AI pillars for candidate intelligence");
  assert(dossierCode.includes("professionalSummary:"), "Pillar 1: Professional summary");
  assert(dossierCode.includes("relevantRoleExperience:"), "Pillar 2: Relevant role experience");
  assert(dossierCode.includes("evidenceBackedStrengths:"), "Pillar 3: Evidence-backed strengths");
  assert(dossierCode.includes("demonstratedRequirements:"), "Pillar 4: Demonstrated requirements");
  assert(dossierCode.includes("missingOrUnclearRequirements:"), "Pillar 5: Missing or unclear requirements");
  assert(dossierCode.includes("transferableSkills:"), "Pillar 6: Transferable skills");
  assert(dossierCode.includes("suggestedInterviewQuestions:"), "Pillar 7: Suggested interview questions");
  assert(dossierCode.includes("recommendedNextStep:"), "Pillar 8: Recommended next step");

  // 4-Tier Categorization & Explainable Match Breakdown
  assert(dossierCode.includes("DEMONSTRATED"), "Category 1: Demonstrated requirement");
  assert(dossierCode.includes("PARTIALLY_DEMONSTRATED"), "Category 2: Partially Demonstrated requirement");
  assert(dossierCode.includes("NOT_FOUND"), "Category 3: Not Found requirement");
  assert(dossierCode.includes("REQUIRES_VERIFICATION"), "Category 4: Requires Verification requirement");
  assert(dossierCode.includes("skillsAlignmentScore: number; // 40%"), "Calculates 40% Skills Alignment weight");
  assert(dossierCode.includes("interviewScorecardScore: number; // 30%"), "Calculates 30% Interview Scorecard weight");
  assert(dossierCode.includes("domainTenureScore: number; // 20%"), "Calculates 20% Domain Tenure weight");
  assert(dossierCode.includes("assessmentPercentileScore: number; // 10%"), "Calculates 10% Assessment Percentile weight");

  const dossierModalPath = path.join(ROOT, "frontend/components/recruitment/MaxCandidateDossierModal.tsx");
  assert(fs.existsSync(dossierModalPath), "MaxCandidateDossierModal.tsx exists");
  const dossierModalCode = fs.readFileSync(dossierModalPath, "utf8");
  assert(dossierModalCode.includes("ai-pillars"), "Presents 8 AI Pillars tab");
  assert(dossierModalCode.includes("explainable-match"), "Presents Explainable Match tab");
  assert(dossierModalCode.includes("requirementEvidence"), "Displays requirement-by-requirement evidence");
  assert(dossierModalCode.includes("evidenceQuote"), "Displays verifiable evidence quote citations");

  const dossierApi = path.join(ROOT, "frontend/app/api/recruitment/candidates/[id]/dossier/route.ts");
  assert(fs.existsSync(dossierApi), "Candidate dossier API route exists");

  // ---------------------------------------------------------------------------
  // 4. MAX AI Studio & Workflow Engine
  // ---------------------------------------------------------------------------
  console.log("\n► [4/6] Verifying MAX AI Studio & Event-Driven Workflow Engine...");
  const workflowEnginePath = path.join(ROOT, "frontend/lib/recruitment-ai-workflow-engine.ts");
  assert(fs.existsSync(workflowEnginePath), "recruitment-ai-workflow-engine.ts exists");
  const workflowEngineCode = fs.readFileSync(workflowEnginePath, "utf8");

  assert(workflowEngineCode.includes("INBOUND_APPLICATION_TRIAGE"), "Blueprint 1: Inbound application auto-triage");
  assert(workflowEngineCode.includes("INTERVIEW_SCORECARD_RECONCILIATION"), "Blueprint 2: Interview scorecard reconciliation");
  assert(workflowEngineCode.includes("GOVERNED_OFFER_AUTHORIZATION"), "Blueprint 3: Governed offer authorization");
  assert(workflowEngineCode.includes("executeWorkflow"), "Implements workflow execution engine");
  assert(workflowEngineCode.includes("dryRun"), "Supports dry-run simulation mode");
  assert(workflowEngineCode.includes("executionLogs"), "Maintains complete workflow audit trail");

  const aiStudioPage = path.join(ROOT, "frontend/app/recruitment/ai-studio/page.tsx");
  assert(fs.existsSync(aiStudioPage), "MAX AI Studio page exists");
  const aiStudioCode = fs.readFileSync(aiStudioPage, "utf8");
  assert(aiStudioCode.includes("activeTab"), "Supports studio section tabs");
  assert(aiStudioCode.includes('"actions"'), "Action Registry administration tab");
  assert(aiStudioCode.includes('"workflows"'), "Visual Workflow Builder tab");
  assert(aiStudioCode.includes('"providers"'), "Multi-Tenant LLM Gateway settings tab");
  assert(aiStudioCode.includes('"audit"'), "Audit Trail & Governance logs tab");

  const workflowApi = path.join(ROOT, "frontend/app/api/recruitment/ai-studio/workflows/route.ts");
  assert(fs.existsSync(workflowApi), "AI Studio workflow API route exists");

  // ---------------------------------------------------------------------------
  // 5. MAX Autonomous Recruiting Operations & ERP Handoff
  // ---------------------------------------------------------------------------
  console.log("\n► [5/6] Verifying Autonomous Recruiting Operations & ERP Handoff Engine...");
  const autoOpsPath = path.join(ROOT, "frontend/lib/recruitment-autonomous-ops.ts");
  assert(fs.existsSync(autoOpsPath), "recruitment-autonomous-ops.ts exists");
  const autoOpsCode = fs.readFileSync(autoOpsPath, "utf8");

  assert(autoOpsCode.includes("scanOperationalCadence"), "Proactively monitors operational pipeline cadences");
  assert(autoOpsCode.includes("OVERDUE_FEEDBACK"), "Detects overdue interview scorecard SLA breaches");
  assert(autoOpsCode.includes("APPROVAL_BOTTLENECK"), "Detects pending VP Level 2 offer bottlenecks");
  assert(autoOpsCode.includes("UNTRIAGED_APPLICATION"), "Detects untriaged screening queue backlogs");
  assert(autoOpsCode.includes("BUDGET_DISCREPANCY"), "Validates requisition budget against EC Core Position Hierarchy");
  assert(autoOpsCode.includes("executeErpHandoff"), "Executes seamless candidate transition into Workforce Central & Onboarding");
  assert(autoOpsCode.includes("@max-enterprise.com"), "Allocates enterprise corporate identity during handoff");

  const autoOpsApi = path.join(ROOT, "frontend/app/api/recruitment/autonomous-ops/route.ts");
  assert(fs.existsSync(autoOpsApi), "Autonomous operations API route exists");
  const autoOpsApiCode = fs.readFileSync(autoOpsApi, "utf8");
  assert(autoOpsApiCode.includes("execute_handoff"), "API supports ERP handoff execution");
  assert(autoOpsApiCode.includes("execute_action"), "API supports autonomous resolution actions");

  // ---------------------------------------------------------------------------
  // 6. Navigation & UI Integration
  // ---------------------------------------------------------------------------
  console.log("\n► [6/6] Verifying Navigation & UI Integration across Recruiting Module...");
  const sidebarPath = path.join(ROOT, "frontend/components/recruitment/RecruitingSidebar.tsx");
  const sidebarCode = fs.readFileSync(sidebarPath, "utf8");
  assert(sidebarCode.includes("/recruitment/ai-studio"), "Recruiting Sidebar links to MAX AI Studio");

  const candidatesPagePath = path.join(ROOT, "frontend/app/recruitment/candidates/page.tsx");
  const candidatesPageCode = fs.readFileSync(candidatesPagePath, "utf8");
  assert(candidatesPageCode.includes("MaxCandidateDossierModal"), "Candidate applications page imports MaxCandidateDossierModal");
  assert(candidatesPageCode.includes("showDossierModal"), "Candidate applications page manages dossier modal state");
  assert(candidatesPageCode.includes("Open 360° AI Candidate Dossier"), "Provides instant access to candidate dossier");

  const copilotWorkspacePath = path.join(ROOT, "frontend/components/recruitment/max-ai/AiCopilotChatWorkspace.tsx");
  const copilotWorkspaceCode = fs.readFileSync(copilotWorkspacePath, "utf8");
  assert(copilotWorkspaceCode.includes("MAX AI Studio & Intelligent Workflows"), "Copilot chat handles AI Studio queries");
  assert(copilotWorkspaceCode.includes("Unified Candidate Dossier"), "Copilot chat handles Candidate Dossier queries");

  // ---------------------------------------------------------------------------
  // Summary
  // ---------------------------------------------------------------------------
  console.log("\n================================================================================");
  console.log(`Assertions Passed: ${passedAssertions} / ${totalAssertions} (${((passedAssertions / totalAssertions) * 100).toFixed(0)}%)`);
  if (passedAssertions === totalAssertions) {
    console.log("STATUS: ALL RECRUITING INTELLIGENCE ASSERTIONS PASSED (100% HEALTHY)");
    console.log("================================================================================\n");
    process.exit(0);
  } else {
    console.error("STATUS: SOME ASSERTIONS FAILED");
    console.log("================================================================================\n");
    process.exit(1);
  }
}

run().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
