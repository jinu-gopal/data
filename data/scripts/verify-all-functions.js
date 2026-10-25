// ============================================================================
// MAX ERP Recruiting: Interactive Functions & API Workflows Verification
// Verifies all interactive workflows, candidate operations, requisition updates,
// interview scheduling, email messaging, and MAX AI Copilot query capabilities
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

async function runAllFunctionsVerification() {
  console.log("\n================================================================================");
  console.log("   MAX ERP RECRUITING — INTERACTIVE FUNCTIONS COMPREHENSIVE VERIFICATION");
  console.log("================================================================================\n");

  // --------------------------------------------------------------------------
  // TEST SUITE 1: Candidate Creation & Ingestion Workflow
  // --------------------------------------------------------------------------
  console.log("► [SUITE 1] Candidate Creation & Registration Workflow");
  const testCandidateName = "Rohini Sen " + Date.now().toString().slice(-4);
  const testCandidateEmail = `rohini.${Date.now()}@example.com`;
  let createdCandidateId = "";

  try {
    const createRes = await fetchUrl(`${BASE_URL}/api/recruitment/candidates`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: {
        name: testCandidateName,
        email: testCandidateEmail,
        phone: "+91 98765 11223",
        requisitionId: "REQ-2026-00123",
        role: "Senior Java Developer",
        source: "Career Site",
        stage: "Applied",
        statusLabel: "New",
      },
    });

    assert(createRes.status === 201 || createRes.status === 200, "POST /api/recruitment/candidates creates candidate (200/201)");
    assert(createRes.json && createRes.json.id, "Created candidate returns assigned ID");
    assert(createRes.json && createRes.json.name === testCandidateName, "Created candidate name matches input");
    createdCandidateId = createRes.json ? createRes.json.id : "";
  } catch (err) {
    assert(false, `Candidate creation failed: ${err.message}`);
  }

  // --------------------------------------------------------------------------
  // TEST SUITE 2: Candidate Retrieval & Details Inspection
  // --------------------------------------------------------------------------
  console.log("\n► [SUITE 2] Candidate Details Retrieval API");
  try {
    const getRes = await fetchUrl(`${BASE_URL}/api/recruitment/candidates/${createdCandidateId || "cand-app-01"}`);
    assert(getRes.status === 200, "GET /api/recruitment/candidates/[id] returns 200 OK");
    assert(getRes.json && getRes.json.email, "Candidate payload contains verified email and profile records");
  } catch (err) {
    assert(false, `Candidate details retrieval failed: ${err.message}`);
  }

  // --------------------------------------------------------------------------
  // TEST SUITE 3: Candidate Stage Progression Workflow
  // --------------------------------------------------------------------------
  console.log("\n► [SUITE 3] Candidate Stage Advancement Workflow");
  try {
    const stageRes = await fetchUrl(`${BASE_URL}/api/recruitment/candidates/${createdCandidateId || "cand-app-01"}/stage`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: {
        stage: "Interview",
        statusLabel: "Interview",
      },
    });

    assert(stageRes.status === 200, "PATCH /api/recruitment/candidates/[id]/stage returns 200 OK");
    assert(stageRes.json && stageRes.json.stage === "Interview", "Candidate stage updated to 'Interview'");
    assert(stageRes.json && stageRes.json.statusLabel === "Interview", "Candidate statusLabel updated to 'Interview'");
  } catch (err) {
    assert(false, `Candidate stage advancement failed: ${err.message}`);
  }

  // --------------------------------------------------------------------------
  // TEST SUITE 4: Interview Scheduling Workflow
  // --------------------------------------------------------------------------
  console.log("\n► [SUITE 4] Interview Scheduling & Video Bridge Provisioning");
  try {
    const interviewRes = await fetchUrl(`${BASE_URL}/api/recruitment/interviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: {
        candidateId: createdCandidateId || "cand-app-01",
        candidateName: testCandidateName,
        candidateEmail: testCandidateEmail,
        requisitionId: "REQ-2026-00123",
        requisitionTitle: "Senior Java Developer",
        roundType: "SYSTEM_DESIGN",
        scheduledStart: "2026-10-25T14:00:00Z",
        scheduledEnd: "2026-10-25T15:00:00Z",
        platform: "MICROSOFT_TEAMS",
      },
    });

    assert(interviewRes.status === 201 || interviewRes.status === 200, "POST /api/recruitment/interviews returns 200/201 OK");
    assert(interviewRes.json && interviewRes.json.meetingLink, "Interview record includes generated meeting link");
    assert(interviewRes.json && interviewRes.json.status === "SCHEDULED", "Interview status set to SCHEDULED");
  } catch (err) {
    assert(false, `Interview scheduling failed: ${err.message}`);
  }

  // --------------------------------------------------------------------------
  // TEST SUITE 5: Candidate Communication / Email Dispatch Workflow
  // --------------------------------------------------------------------------
  console.log("\n► [SUITE 5] Candidate Communication & Email Dispatch");
  try {
    const messageRes = await fetchUrl(`${BASE_URL}/api/recruitment/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: {
        senderName: "John Smith",
        senderRole: "Lead Recruiter",
        recipientName: "Priya Menon",
        candidateId: "cand-app-01",
        candidateName: "Priya Menon",
        requisitionId: "REQ-2026-00123",
        content: "Hi Priya, you are invited to the technical architecture debrief round.",
      },
    });

    assert(messageRes.status === 201 || messageRes.status === 200, "POST /api/recruitment/messages returns 200/201 OK");
    assert(messageRes.json && messageRes.json.content, "Dispatched message audit record returned");
  } catch (err) {
    assert(false, `Candidate email dispatch failed: ${err.message}`);
  }

  // --------------------------------------------------------------------------
  // TEST SUITE 6: Ask MAX AI Natural Language Recruiter Query
  // --------------------------------------------------------------------------
  console.log("\n► [SUITE 6] Ask MAX AI Copilot Natural Language Queries");
  try {
    const aiRes = await fetchUrl(`${BASE_URL}/api/recruitment/ai-recruiter`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: {
        action: "ASSISTANT_QUERY",
        prompt: "Compare Priya with other candidates",
        candidateName: "Priya Menon",
        requisitionTitle: "Senior Java Developer",
        department: "Engineering",
      },
    });

    assert(aiRes.status === 200, "POST /api/recruitment/ai-recruiter (ASSISTANT_QUERY) returns 200 OK");
    assert(aiRes.json && aiRes.json.reply && aiRes.json.reply.length > 20, "AI generates informative context-aware response");
    assert(aiRes.json && (aiRes.json.reply.includes("Priya") || aiRes.json.reply.includes("match")), "AI response contains candidate comparative analysis");
  } catch (err) {
    assert(false, `AI Recruiter query failed: ${err.message}`);
  }

  // --------------------------------------------------------------------------
  // TEST SUITE 7: Job Details Requisition Synchronization
  // --------------------------------------------------------------------------
  console.log("\n► [SUITE 7] Job Details Requisition Synchronization (PATCH)");
  try {
    const patchRes = await fetchUrl(`${BASE_URL}/api/recruitment/requisitions/REQ-2026-00123`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: {
        title: "Senior Java Developer",
        department: "Engineering",
        location: "Bangalore, India",
        employmentType: "Full-time",
        targetHeadcount: 2,
        status: "Open",
      },
    });

    assert(patchRes.status === 200, "PATCH /api/recruitment/requisitions/REQ-2026-00123 returns 200 OK");
    assert(patchRes.json && patchRes.json.targetHeadcount === 2, "Target headcount persisted correctly");
    assert(patchRes.json && patchRes.json.status === "Open", "Requisition status confirmed as Open");
  } catch (err) {
    assert(false, `Job Details synchronization failed: ${err.message}`);
  }

  console.log("\n================================================================================");
  console.log(`All Functions Verification Complete: ${passedChecks}/${totalChecks} checks passed`);
  if (failedChecks > 0) {
    console.error(`Status: FAILED (${failedChecks} failures)`);
    process.exit(1);
  } else {
    console.log("Status: ALL FUNCTIONS WORKING PROPERLY (100% Verified)");
  }
  console.log("================================================================================\n");
}

runAllFunctionsVerification().catch((err) => {
  console.error("Fatal error during verification:", err);
  process.exit(1);
});
