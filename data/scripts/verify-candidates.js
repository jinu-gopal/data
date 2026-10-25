// ============================================================================
// MAX ERP Recruiting: Candidate Applications Screen Automated Verification
// Verifies route availability, approved mockup UI components, drawer elements, and APIs
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
  console.log("   MAX ERP RECRUITING — CANDIDATE APPLICATIONS SCREEN VERIFICATION");
  console.log("================================================================================\n");

  // --------------------------------------------------------------------------
  // TEST SUITE 1: Route & Page Availability
  // --------------------------------------------------------------------------
  console.log("► [SUITE 1] Web Routes Availability");
  try {
    const resMain = await fetchUrl(`${BASE_URL}/recruitment/candidates`);
    assert(resMain.status === 200, "Candidate Applications main route (/recruitment/candidates) returns 200 OK");

    const resAlt = await fetchUrl(`${BASE_URL}/recruitment/candidates/applications`);
    assert(resAlt.status === 200, "Candidate Applications alias route (/recruitment/candidates/applications) returns 200 OK");
  } catch (err) {
    assert(false, `Web routes check failed: ${err.message}`);
  }

  // --------------------------------------------------------------------------
  // TEST SUITE 2: UI Content & Approved Mockup Elements (Matching Image 2)
  // --------------------------------------------------------------------------
  console.log("\n► [SUITE 2] Mockup Structural & Element Verification");
  try {
    const res = await fetchUrl(`${BASE_URL}/recruitment/candidates`);
    const html = res.data;
    const cleanHtml = html.replace(/<!--[\s\S]*?-->/g, "");

    // Header & Actions
    assert(cleanHtml.includes("Candidate Applications"), "Page title displays 'Candidate Applications'");
    assert(cleanHtml.includes("Export"), "Header displays 'Export' button");
    assert(cleanHtml.includes("Add Candidate"), "Header displays 'Add Candidate' primary button");

    // 6 KPI Metric Cards
    assert(cleanHtml.includes("Total") && cleanHtml.includes("128"), "KPI Card 'Total' rendered with count 128");
    assert(cleanHtml.includes("New") && cleanHtml.includes("32"), "KPI Card 'New' rendered with count 32");
    assert(cleanHtml.includes("In Review") && cleanHtml.includes("28"), "KPI Card 'In Review' rendered with count 28");
    assert(cleanHtml.includes("Shortlisted") && cleanHtml.includes("25"), "KPI Card 'Shortlisted' rendered with count 25");
    assert(cleanHtml.includes("Interview") && cleanHtml.includes("18"), "KPI Card 'Interview' rendered with count 18");
    assert(cleanHtml.includes("Offer") && cleanHtml.includes("12"), "KPI Card 'Offer' rendered with count 12");

    // Search and Voice Command
    assert(cleanHtml.includes("Search by name, email") && cleanHtml.includes("skills"), "Search input is rendered with correct placeholder");

    // 4 View Tabs
    assert(cleanHtml.includes("All Applications (128)"), "View tab 'All Applications (128)' is present");
    assert(cleanHtml.includes("Pipeline View"), "View tab 'Pipeline View' is present");
    assert(cleanHtml.includes("Calendar View"), "View tab 'Calendar View' is present");
    assert(cleanHtml.includes("Kanban View"), "View tab 'Kanban View' is present");

    // Approved Candidate Names in Table
    assert(cleanHtml.includes("Priya Menon"), "Candidate 'Priya Menon' rendered in table");
    assert(cleanHtml.includes("Arjun R"), "Candidate 'Arjun R' rendered in table");
    assert(cleanHtml.includes("Vikram K"), "Candidate 'Vikram K' rendered in table");
    assert(cleanHtml.includes("Sneha S"), "Candidate 'Sneha S' rendered in table");
    assert(cleanHtml.includes("Rahul Kumar"), "Candidate 'Rahul Kumar' rendered in table");
    assert(cleanHtml.includes("Suresh N"), "Candidate 'Suresh N' rendered in table");
    assert(cleanHtml.includes("Deepa L"), "Candidate 'Deepa L' rendered in table");
    assert(cleanHtml.includes("Manu P"), "Candidate 'Manu P' rendered in table");
    assert(cleanHtml.includes("Karthik T"), "Candidate 'Karthik T' rendered in table");
    assert(cleanHtml.includes("Neha Raj"), "Candidate 'Neha Raj' rendered in table");

    // Drawer Header & Action Buttons for Priya Menon
    assert(cleanHtml.includes("Send Email"), "Drawer action 'Send Email' button is rendered");
    assert(cleanHtml.includes("Move to Stage"), "Drawer action 'Move to Stage' button is rendered");
    assert(cleanHtml.includes("Schedule Interview"), "Drawer action 'Schedule Interview' button is rendered");

    // Drawer Navigation Tabs
    assert(cleanHtml.includes("Overview"), "Drawer tab 'Overview' is rendered");
    assert(cleanHtml.includes("Resume"), "Drawer tab 'Resume' is rendered");
    assert(cleanHtml.includes("AI Insights"), "Drawer tab 'AI Insights' is rendered");
    assert(cleanHtml.includes("Comparison"), "Drawer tab 'Comparison' is rendered");
    assert(cleanHtml.includes("Interviews (2)"), "Drawer tab 'Interviews (2)' is rendered");
    assert(cleanHtml.includes("Assessments (1)"), "Drawer tab 'Assessments (1)' is rendered");
    assert(cleanHtml.includes("Timeline"), "Drawer tab 'Timeline' is rendered");

    // Ask MAX AI Section & Quick Action Pills
    assert(cleanHtml.includes("Ask MAX AI about Priya"), "Ask MAX AI input bar is rendered");
    assert(cleanHtml.includes("Compare with similar candidates"), "Pill 'Compare with similar candidates' is rendered");
    assert(cleanHtml.includes("Draft interview email"), "Pill 'Draft interview email' is rendered");
    assert(cleanHtml.includes("Summarize profile"), "Pill 'Summarize profile' is rendered");
    assert(cleanHtml.includes("Suggest next steps"), "Pill 'Suggest next steps' is rendered");

    // AI Candidate Comparison & Radial Gauges
    assert(cleanHtml.includes("AI Candidate Comparison"), "Section 'AI Candidate Comparison' is rendered");
    assert(cleanHtml.includes("92%") && cleanHtml.includes("78%") && cleanHtml.includes("68%") && cleanHtml.includes("54%"), "Comparison gauges for Priya (92%), Vikram (78%), Deepa (68%), Arjun (54%) rendered");

    // Comparison Sub-tabs & Skills breakdown
    assert(cleanHtml.includes("Skills &amp; Experience") || cleanHtml.includes("Skills & Experience"), "Comparison sub-tab 'Skills & Experience' rendered");
    assert(cleanHtml.includes("Spring Boot") && cleanHtml.includes("Microservices"), "Skills breakdown includes Spring Boot and Microservices");
    assert(cleanHtml.includes("Recommended Next Step"), "Drawer includes 'Recommended Next Step' card");
  } catch (err) {
    assert(false, `Mockup structural verification failed: ${err.message}`);
  }

  // --------------------------------------------------------------------------
  // TEST SUITE 3: Candidates Backend API Contract
  // --------------------------------------------------------------------------
  console.log("\n► [SUITE 3] Candidates API Integration");
  try {
    const apiRes = await fetchUrl(`${BASE_URL}/api/recruitment/candidates`);
    assert(apiRes.status === 200, "GET /api/recruitment/candidates returns 200 OK");
    assert(Array.isArray(apiRes.json) && apiRes.json.length >= 10, "API returns array with >= 10 candidates");

    const priya = apiRes.json ? apiRes.json.find((c) => c.name === "Priya Menon") : null;
    assert(priya !== null && priya !== undefined, "Candidate Priya Menon is present in API response");
    if (priya) {
      assert(priya.matchScore === 92, "Priya Menon matchScore equals 92%");
      assert(priya.stage === "Interview", "Priya Menon stage is 'Interview'");
    }
  } catch (err) {
    assert(false, `Candidate API verification failed: ${err.message}`);
  }

  console.log("\n================================================================================");
  console.log(`Candidate Applications Verification Complete: ${passedChecks}/${totalChecks} checks passed`);
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
