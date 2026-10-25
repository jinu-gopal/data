// ============================================================================
// MAX ERP Recruiting: Complete Module & All Features Comprehensive Verification
// Verifies all 7 Category Hubs, Operational tabs, APIs, and workflows:
// 1. Dashboard & Pipeline Overview
// 2. Job Distribution & Multi-Channel Postings
// 3. Interview Coordination & Scorecard Rubrics
// 4. Candidate Technical Assessments & Checkr BGV
// 5. Staffing Agency Partners & Fee Tracking
// 6. Day-1 Pre-Onboarding (ONB 2.0) & 1-Click Workforce Conversion
// 7. Executive Telemetry & Analytics
// 8. Offer Letter Studio & Template Audit
// 9. Recruiting Configuration Studio (Pipeline Stages, Rules, Forms)
// 10. Public Career Portal & Candidate Self-Service
// ============================================================================

const http = require("http");

const BASE_URL = "http://localhost:3000";

function fetchUrl(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const reqOptions = {
      hostname: parsed.hostname,
      port: parsed.port,
      path: parsed.pathname + parsed.search,
      method: options.method || "GET",
      headers: options.headers || {},
    };

    const req = http.request(reqOptions, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch {}
        resolve({ status: res.statusCode, data, json, headers: res.headers });
      });
    });

    req.on("error", reject);
    if (options.body) {
      req.write(typeof options.body === "string" ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;

function assert(condition, message) {
  totalChecks++;
  if (condition) {
    passedChecks++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    failedChecks++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

async function runComprehensiveModuleVerification() {
  console.log("\n================================================================================");
  console.log("   MAX ERP RECRUITING — COMPLETE MODULE & EXTENDED CAPABILITIES VERIFICATION");
  console.log("================================================================================\n");

  // --------------------------------------------------------------------------
  // SUITE 1: Recruiting Hub Web Routes & Category Hub URLs
  // --------------------------------------------------------------------------
  console.log("► [SUITE 1] Workspace Hubs & Route Health Check");
  const routes = [
    { path: "/recruitment", name: "Recruiting Dashboard (Overview)" },
    { path: "/recruitment?tab=distribution", name: "Job Distribution Hub" },
    { path: "/recruitment?tab=scorecards", name: "Scorecards & Interviews Hub" },
    { path: "/recruitment?tab=assessments", name: "Assessments & BGV Hub" },
    { path: "/recruitment?tab=agencies", name: "Staffing Agencies Hub" },
    { path: "/recruitment?tab=pre-onboarding", name: "Pre-Onboarding (ONB 2.0) Hub" },
    { path: "/recruitment?tab=analytics", name: "Executive Analytics Hub" },
    { path: "/recruitment/letters", name: "Offer Letter Studio" },
    { path: "/recruitment/candidates", name: "Candidate Applications Main Page" },
    { path: "/recruitment/requisitions", name: "Job Requisitions List" },
    { path: "/recruitment/requisitions/create", name: "Create Job Requisition" },
    { path: "/configuration/recruitment", name: "Recruiting Configuration Studio" },
    { path: "/careers", name: "Public Candidate Career Portal" },
  ];

  for (const r of routes) {
    try {
      const res = await fetchUrl(`${BASE_URL}${r.path}`);
      assert(res.status === 200, `${r.name} (${r.path}) returns 200 OK`);
    } catch (err) {
      assert(false, `${r.name} failed to load: ${err.message}`);
    }
  }

  // --------------------------------------------------------------------------
  // SUITE 2: Interview Scorecards & Evaluation Rubrics API
  // --------------------------------------------------------------------------
  console.log("\n► [SUITE 2] Interview Scorecards API & Evaluation Rubric");
  try {
    const scGet = await fetchUrl(`${BASE_URL}/api/recruitment/scorecards`);
    assert(scGet.status === 200, "GET /api/recruitment/scorecards returns 200 OK");
    assert(Array.isArray(scGet.json) && scGet.json.length > 0, "Scorecards endpoint returns non-empty array");

    const scPost = await fetchUrl(`${BASE_URL}/api/recruitment/scorecards`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: {
        candidateId: "cand-app-01",
        candidateName: "Priya Menon",
        requisitionId: "REQ-2026-00123",
        requisitionTitle: "Senior Java Developer",
        interviewerId: "emp-204",
        interviewerName: "Alexander Vance",
        interviewerRole: "Principal Systems Engineer",
        roundType: "SYSTEM_ARCHITECTURE",
        overallRecommendation: "STRONG_HIRE",
        competencyRatings: {
          technicalProficiency: 5,
          systemDesignArchitecture: 5,
          problemSolvingVelocity: 5,
          communicationAndTeamwork: 5,
          cultureAndValuesAdd: 5,
        },
        strengthsSummary: "Exceptional mastery of distributed consensus, memory profiling, and virtual threads.",
        areasOfConcern: "None.",
        notes: "Unanimous strong hire recommendation.",
        isBlindReview: false,
      },
    });
    assert(scPost.status === 200 || scPost.status === 201, "POST /api/recruitment/scorecards creates scorecard record");
    assert(scPost.json && scPost.json.id, "Created scorecard contains assigned unique ID");
    assert(scPost.json && scPost.json.overallRecommendation === "STRONG_HIRE", "Recommendation matches submission");
  } catch (err) {
    assert(false, `Scorecard suite failed: ${err.message}`);
  }

  // --------------------------------------------------------------------------
  // SUITE 3: Job Distribution & Multi-Channel Postings API
  // --------------------------------------------------------------------------
  console.log("\n► [SUITE 3] Job Distribution & Board Integration API");
  try {
    const boardsGet = await fetchUrl(`${BASE_URL}/api/recruitment/job-boards`);
    assert(boardsGet.status === 200, "GET /api/recruitment/job-boards returns 200 OK");
    const boardsList = boardsGet.json?.data || boardsGet.json;
    assert(Array.isArray(boardsList) && boardsList.length >= 4, "Returns active job boards (LinkedIn, Indeed, Glassdoor, Google Jobs)");

    const postRes = await fetchUrl(`${BASE_URL}/api/recruitment/postings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: {
        requisitionId: "REQ-2026-00123",
        requisitionTitle: "Senior Java Developer",
        channel: "LINKEDIN",
        costUsd: 495,
        campaignName: "q4_enterprise_tech_expansion",
      },
    });
    assert(postRes.status === 200 || postRes.status === 201, "POST /api/recruitment/postings publishes channel campaign");
    assert(postRes.json && postRes.json.channel === "LINKEDIN", "Posting record specifies correct target channel");
  } catch (err) {
    assert(false, `Job distribution suite failed: ${err.message}`);
  }

  // --------------------------------------------------------------------------
  // SUITE 4: Candidate Technical Assessments & BGV Screening API
  // --------------------------------------------------------------------------
  console.log("\n► [SUITE 4] Technical Assessments & Background Verification (BGV) API");
  try {
    const asmtGet = await fetchUrl(`${BASE_URL}/api/recruitment/assessments`);
    assert(asmtGet.status === 200, "GET /api/recruitment/assessments returns 200 OK");

    const asmtPost = await fetchUrl(`${BASE_URL}/api/recruitment/assessments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: {
        candidateId: "cand-app-01",
        candidateName: "Priya Menon",
        requisitionId: "REQ-2026-00123",
        requisitionTitle: "Senior Java Developer",
        testId: "test-tmpl-01",
        testTitle: "Java 21 & Distributed Microservices Assessment",
        provider: "HACKERRANK",
        durationMinutes: 60,
        passingScorePct: 80,
      },
    });
    assert(asmtPost.status === 200 || asmtPost.status === 201, "POST /api/recruitment/assessments assigns test invite");
    assert(asmtPost.json && asmtPost.json.status === "ASSIGNED", "Assessment status set to ASSIGNED");

    const bgvGet = await fetchUrl(`${BASE_URL}/api/recruitment/bgv`);
    assert(bgvGet.status === 200, "GET /api/recruitment/bgv returns 200 OK");
    assert(Array.isArray(bgvGet.json) && bgvGet.json.length > 0, "BGV checks registry populated");

    const bgvPost = await fetchUrl(`${BASE_URL}/api/recruitment/bgv`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: {
        candidateId: "cand-app-01",
        candidateName: "Priya Menon",
        candidateEmail: "priya.menon@gmail.com",
        requisitionId: "REQ-2026-00123",
        requisitionTitle: "Senior Java Developer",
        provider: "CHECKR_GLOBAL",
      },
    });
    assert(bgvPost.status === 200 || bgvPost.status === 201, "POST /api/recruitment/bgv initiates Checkr verification");
    assert(bgvPost.json && bgvPost.json.status === "INITIATED", "BGV status set to INITIATED");
  } catch (err) {
    assert(false, `Assessments & BGV suite failed: ${err.message}`);
  }

  // --------------------------------------------------------------------------
  // SUITE 5: Staffing Agencies & Candidate Submissions API
  // --------------------------------------------------------------------------
  console.log("\n► [SUITE 5] Staffing Agency Partners & Submission Governance API");
  try {
    const agnGet = await fetchUrl(`${BASE_URL}/api/recruitment/agencies`);
    assert(agnGet.status === 200, "GET /api/recruitment/agencies returns 200 OK");
    const agnList = Array.isArray(agnGet.json) ? agnGet.json : agnGet.json?.agencies;
    assert(Array.isArray(agnList) && agnList.length >= 3, "Returns configured agency partners");

    const agnSub = await fetchUrl(`${BASE_URL}/api/recruitment/agencies`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: {
        agencyId: "agency-01",
        agencyName: "Apex Executive Search Global",
        candidateName: "Devin Archer",
        candidateEmail: "devin.archer@apex-talent.com",
        requisitionId: "REQ-2026-00123",
        requisitionTitle: "Senior Java Developer",
        proposedSalaryUsd: 160000,
      },
    });
    assert(agnSub.status === 200 || agnSub.status === 201, "POST /api/recruitment/agencies registers agency submission");
    assert(agnSub.json && agnSub.json.calculatedFeeUsd === 32000, "20% commission fee calculated automatically ($32,000)");
  } catch (err) {
    assert(false, `Agency suite failed: ${err.message}`);
  }

  // --------------------------------------------------------------------------
  // SUITE 6: Day-1 Pre-Onboarding (ONB 2.0) & Workforce Conversion API
  // --------------------------------------------------------------------------
  console.log("\n► [SUITE 6] Day-1 Pre-Onboarding & Workforce Conversion API");
  try {
    const onbGet = await fetchUrl(`${BASE_URL}/api/recruitment/onboarding`);
    assert(onbGet.status === 200, "GET /api/recruitment/onboarding returns 200 OK");
    assert(Array.isArray(onbGet.json) && onbGet.json.length > 0, "Pre-onboarding records list populated");

    const candidateId = "cand-app-01";
    const hireRes = await fetchUrl(`${BASE_URL}/api/recruitment/candidates/${candidateId}/hire`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: {
        employeeId: "EMP-2026-0428",
        targetStartDate: "2026-11-01",
        department: "Engineering",
        positionSlotId: "POS-ENG-084-A",
      },
    });
    assert(hireRes.status === 200 || hireRes.status === 201, "POST /api/recruitment/candidates/[id]/hire executes 1-click hire");
    assert(hireRes.json && hireRes.json.success === true, "Hire response confirms successful workforce conversion");
    assert(hireRes.json && hireRes.json.employeeId, "Generated Employee ID returned for active workforce studio");
  } catch (err) {
    assert(false, `Pre-onboarding suite failed: ${err.message}`);
  }

  // --------------------------------------------------------------------------
  // SUITE 7: Executive Telemetry & Operational Analytics API
  // --------------------------------------------------------------------------
  console.log("\n► [SUITE 7] Executive Recruiting Analytics & Velocity Telemetry API");
  try {
    const analyticsRes = await fetchUrl(`${BASE_URL}/api/recruitment/analytics`);
    assert(analyticsRes.status === 200, "GET /api/recruitment/analytics returns 200 OK");
    assert(analyticsRes.json?.overview?.averageTimeToHireDays !== undefined, "Telemetry includes average time to hire");
    assert(analyticsRes.json?.overview?.offerAcceptanceRatePct >= 90, "Telemetry includes high offer acceptance rate (>= 90%)");
    assert(Array.isArray(analyticsRes.json?.funnelConversion), "Telemetry includes full 6-stage funnel conversion");
  } catch (err) {
    assert(false, `Analytics suite failed: ${err.message}`);
  }

  // --------------------------------------------------------------------------
  // SUITE 8: Offer Letter Studio & Template Audit API
  // --------------------------------------------------------------------------
  console.log("\n► [SUITE 8] Offer Letter Studio & AI Compliance Audit API");
  try {
    const lettersGet = await fetchUrl(`${BASE_URL}/api/recruitment/letters`);
    assert(lettersGet.status === 200, "GET /api/recruitment/letters returns 200 OK");
    assert(lettersGet.json?.total >= 10, "Offer studio provides enterprise letter templates");

    const auditRes = await fetchUrl(`${BASE_URL}/api/recruitment/letters/ai`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: {
        action: "AUDIT_COMPLIANCE",
        letterText: "Dear Candidate, We offer you employment subject to satisfactory background checks, arbitration agreement, and at-will notice...",
        jurisdiction: "US",
        employmentType: "FULL_TIME",
      },
    });
    assert(auditRes.status === 200, "POST /api/recruitment/letters/ai (Legal Compliance Audit) returns 200 OK");
    assert(auditRes.json?.overallScore >= 80, "AI compliance audit generates compliance score >= 80%");
  } catch (err) {
    assert(false, `Letters suite failed: ${err.message}`);
  }

  // --------------------------------------------------------------------------
  // SUITE 9: Recruiting Configuration Studio API (Pipeline, Teams, Rules)
  // --------------------------------------------------------------------------
  console.log("\n► [SUITE 9] Recruiting Configuration Studio & Automation Rules API");
  try {
    const pipeRes = await fetchUrl(`${BASE_URL}/api/recruitment/pipeline-config`);
    assert(pipeRes.status === 200, "GET /api/recruitment/pipeline-config returns 200 OK");
    const stagesList = Array.isArray(pipeRes.json) ? pipeRes.json : pipeRes.json?.stages;
    assert(Array.isArray(stagesList) && stagesList.length >= 6, "Config returns full pipeline stage definitions");

    const rulesRes = await fetchUrl(`${BASE_URL}/api/recruitment/rules`);
    assert(rulesRes.status === 200, "GET /api/recruitment/rules returns 200 OK");
    assert(Array.isArray(rulesRes.json) && rulesRes.json.length >= 4, "Returns active automated recruiting rules");

    const teamsRes = await fetchUrl(`${BASE_URL}/api/recruitment/teams-config`);
    assert(teamsRes.status === 200, "GET /api/recruitment/teams-config returns 200 OK");
    assert(teamsRes.json?.status === "CONNECTED", "Teams & Outlook integration status is CONNECTED");
  } catch (err) {
    assert(false, `Configuration suite failed: ${err.message}`);
  }

  // --------------------------------------------------------------------------
  // FINAL SUMMARY
  // --------------------------------------------------------------------------
  console.log("\n================================================================================");
  console.log(`Recruiting Module Comprehensive Verification: ${passedChecks}/${totalChecks} checks passed`);
  if (failedChecks === 0) {
    console.log("Status: ALL EXTENDED RECRUITING MODULE FEATURES COMPLETE & OPERATIONAL (100%)");
  } else {
    console.error(`Status: ${failedChecks} checks failed.`);
  }
  console.log("================================================================================\n");

  process.exit(failedChecks === 0 ? 0 : 1);
}

runComprehensiveModuleVerification().catch((err) => {
  console.error("Fatal test error:", err);
  process.exit(1);
});
