// ============================================================================
// MAX ERP Recruiting: Job Details Screen Automated Verification
// Verifies route availability, approved mockup UI components, and API contracts
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

async function runVerification() {
  console.log("\n================================================================================");
  console.log("   MAX ERP RECRUITING — JOB DETAILS SCREEN VERIFICATION");
  console.log("================================================================================\n");

  // --------------------------------------------------------------------------
  // TEST SUITE 1: Route & Page Availability
  // --------------------------------------------------------------------------
  console.log("► [SUITE 1] Web Routes Availability");
  try {
    const resMain = await fetchUrl(`${BASE_URL}/recruitment/requisitions/REQ-2026-00123/job-details`);
    assert(resMain.status === 200, "Job Details main route (/recruitment/requisitions/REQ-2026-00123/job-details) returns 200 OK");

    const resAlt = await fetchUrl(`${BASE_URL}/recruitment/requisitions/REQ-2026-00123/details`);
    assert(resAlt.status === 200, "Job Details alias route (/recruitment/requisitions/REQ-2026-00123/details) returns 200 OK");
  } catch (err) {
    assert(false, `Web routes check failed: ${err.message}`);
  }

  // --------------------------------------------------------------------------
  // TEST SUITE 2: UI Content & Approved Mockup Elements
  // --------------------------------------------------------------------------
  console.log("\n► [SUITE 2] Mockup Structural & Element Verification");
  try {
    const res = await fetchUrl(`${BASE_URL}/recruitment/requisitions/REQ-2026-00123/job-details`);
    const html = res.data;

    // Breadcrumb & Header
    assert(html.includes("Recruiting") && html.includes("Requisitions") && html.includes("REQ-2026-00123"), "Header breadcrumb contains Recruiting > Requisitions > REQ-2026-00123");
    assert(html.includes("Job Details"), "Title displays Job Details");
    assert(html.includes("Save Changes"), "Header includes Save Changes primary button");
    assert(html.includes("Actions"), "Header includes Actions dropdown");

    // 4-Step Stepper
    assert(html.includes("Job Details") && html.includes("Hiring Team") && html.includes("Approvals") && html.includes("Posting"), "Stepper displays all 4 steps (Job Details, Hiring Team, Approvals, Posting)");

    // 5 Form Sub-Tabs
    assert(html.includes("Job Information"), "Sub-tab 'Job Information' is rendered");
    assert(html.includes("Organization"), "Sub-tab 'Organization' is rendered");
    assert(html.includes("Location &amp; Type") || html.includes("Location & Type"), "Sub-tab 'Location & Type' is rendered");
    assert(html.includes("Hiring Details"), "Sub-tab 'Hiring Details' is rendered");
    assert(html.includes("Additional Information"), "Sub-tab 'Additional Information' is rendered");

    // Embedded Cards
    assert(html.includes("Job Preview"), "Card 'Job Preview' is rendered");
    assert(html.includes("View Career Site Preview"), "Button 'View Career Site Preview' is present");
    assert(html.includes("Bangalore, India"), "Location field displays Bangalore, India");
    assert(html.includes("Engineering"), "Department displays Engineering");

    // Right Sidebar Cards
    assert(html.includes("Requisition Status"), "Right sidebar displays Requisition Status card");
    assert(html.includes("Job Description"), "Right sidebar displays Job Description card");
    assert(html.includes("Related Information"), "Right sidebar displays Related Information card");
    assert(html.includes("Quick Links"), "Right sidebar displays Quick Links card");
    assert(html.includes("View Candidates") && html.includes("Hiring Team"), "Quick Links include View Candidates and Hiring Team");
  } catch (err) {
    assert(false, `Mockup structural verification failed: ${err.message}`);
  }

  // --------------------------------------------------------------------------
  // TEST SUITE 3: Requisition Backend API Contract
  // --------------------------------------------------------------------------
  console.log("\n► [SUITE 3] Requisition API Integration");
  try {
    const apiRes = await fetchUrl(`${BASE_URL}/api/recruitment/requisitions/REQ-2026-00123`);
    assert(apiRes.status === 200, "GET /api/recruitment/requisitions/REQ-2026-00123 returns 200 OK");
    assert(apiRes.json && (apiRes.json.title || apiRes.json.reqNumber), "Requisition API payload contains valid entity metadata");
    if (apiRes.json) {
      assert(apiRes.json.reqNumber === "REQ-2026-00123" || apiRes.json.id === "REQ-2026-00123", "Requisition identifier matches REQ-2026-00123");
    }
  } catch (err) {
    assert(false, `Requisition API verification failed: ${err.message}`);
  }

  console.log("\n================================================================================");
  console.log(`Job Details Verification Complete: ${passedChecks}/${totalChecks} checks passed`);
  if (failedChecks > 0) {
    console.error(`Status: FAILED (${failedChecks} failures)`);
    process.exit(1);
  } else {
    console.log("Status: ALL CHECKS PASSED (100% Mockup & API Compliance)");
  }
  console.log("================================================================================\n");
}

runVerification().catch((err) => {
  console.error("Fatal error during verification:", err);
  process.exit(1);
});
