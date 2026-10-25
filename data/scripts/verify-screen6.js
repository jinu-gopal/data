// ============================================================================
// MAX ERP Recruiting: Screen 6 (Review & Publish) Automated Verification
// Tests route health, API publication contracts, and UI component parity
// ============================================================================

const http = require("http");
const fs = require("fs");
const path = require("path");

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
  console.log("   MAX ERP RECRUITING — SCREEN 6 (REVIEW & PUBLISH) VERIFICATION");
  console.log("================================================================================\n");

  // --------------------------------------------------------------------------
  // TEST SUITE 1: Route & Page Availability
  // --------------------------------------------------------------------------
  console.log("► [SUITE 1] Web Routes Availability");
  try {
    const resMain = await fetchUrl(`${BASE_URL}/recruitment/requisitions/REQ-2026-00123/post/review`);
    assert(resMain.status === 200, "Screen 6 main route (/recruitment/requisitions/REQ-2026-00123/post/review) returns 200 OK");

    const resAlt = await fetchUrl(`${BASE_URL}/recruitment/requisitions/REQ-2026-00123/review`);
    assert(resAlt.status === 200, "Screen 6 alias route (/review) returns 200 OK");
  } catch (err) {
    assert(false, `Web routes check failed: ${err.message}`);
  }

  // --------------------------------------------------------------------------
  // TEST SUITE 2: Publication API & Destination Syndication Contract
  // --------------------------------------------------------------------------
  console.log("\n► [SUITE 2] Publication API Contract (/api/recruitment/requisitions/[id]/posting)");
  try {
    const pubRes = await fetchUrl(`${BASE_URL}/api/recruitment/requisitions/REQ-2026-00123/posting`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: {
        action: "PUBLISH",
        careerSiteTitle: "Senior Java Developer",
        urlSlug: "senior-java-developer",
        category: "Engineering",
        location: "Bangalore, India",
        employmentType: "Full-time",
        workArrangement: "Hybrid",
        startDate: "2026-10-16",
        applicationDeadline: "2026-11-15",
        selectedBoardIds: ["indeed", "linkedin", "naukri", "google-jobs"],
        jobDescription: "We are looking for a Senior Java Developer to join our engineering team.",
      },
    });

    assert(pubRes.status === 200, "POST with action PUBLISH returns 200 OK");
    assert(pubRes.json && pubRes.json.data.status === "PUBLISHED", "Requisition posting status updated to PUBLISHED");
    assert(pubRes.json && pubRes.json.destinations.length >= 5, "API returns per-destination publication results (career site + 4 boards)");

    const careerDest = pubRes.json.destinations.find((d) => d.id === "career-site");
    assert(careerDest && careerDest.status === "PUBLISHED", "MAX ERP Career Site status is PUBLISHED with public URL");

    const naukriDest = pubRes.json.destinations.find((d) => d.id === "naukri");
    assert(naukriDest && naukriDest.status === "PENDING_REVIEW", "Naukri destination indicates compliance review status");
  } catch (err) {
    assert(false, `Publication API check failed: ${err.message}`);
  }

  // --------------------------------------------------------------------------
  // TEST SUITE 3: Screen 6 UI Component Structure & Approved Mockup Parity
  // --------------------------------------------------------------------------
  console.log("\n► [SUITE 3] Screen 6 UI Component Structure & Mockup Parity");
  try {
    const filePath = path.join(process.cwd(), "frontend/app/recruitment/requisitions/[id]/post/review/page.tsx");
    assert(fs.existsSync(filePath), "Screen 6 page component file exists on disk");

    const code = fs.readFileSync(filePath, "utf-8");

    // Stepper checks
    assert(code.includes("Career Site Details") && code.includes("Select Job Boards") && code.includes("Job Content") && code.includes("Review & Publish"), "4-Step Progress Stepper present (Steps 1, 2, 3, 4)");

    // Card 1: Requisition Overview checks
    assert(code.includes("Ready to Publish"), "Status badge 'Ready to Publish' present");
    assert(code.includes("Edit Details"), "Action 'Edit Details' present");
    assert(code.includes("REQ-2026-00123") && code.includes("Openings"), "Requisition ID and Openings count rendered");

    // Card 2: Publication Destinations checks
    assert(code.includes("Publication Destinations"), "Card 2: 'Publication Destinations' present");
    assert(code.includes("Edit Selections"), "Action 'Edit Selections' present");
    assert(code.includes("MAX ERP Career Site") && code.includes("https://careers.maxerp.com/jobs/"), "Native Career Site card with URL slug present");
    assert(code.includes("Homepage:") && code.includes("Featured:") && code.includes("Expiry Date"), "Career site meta items (Homepage, Featured, Expiry Date) present");
    assert(code.includes("selectedBoards.slice") && code.includes("board.name") && code.includes("Ready"), "4 external job boards rendered with Ready status");

    // Card 3: Job Content checks
    assert(code.includes("Job Content"), "Card 3: 'Job Content' card present");
    assert(code.includes("Job Description") && code.includes("Key Responsibilities") && code.includes("Qualifications") && code.includes("Additional Information"), "4 Job Content rows present");

    // Card 4: Posting Schedule checks
    assert(code.includes("Posting Schedule"), "Card 4: 'Posting Schedule' timeline present");
    assert(code.includes("Start Date") && code.includes("Expiry Date") && code.includes("Posting Duration") && code.includes("Auto-Expire"), "Schedule timeline rows present");

    // Card 5: Application Settings checks
    assert(code.includes("Application Settings"), "Card 5: 'Application Settings' card present");
    assert(code.includes("Application Method") && code.includes("Require Resume") && code.includes("Allow Cover Letter") && code.includes("Ask for Expected Salary"), "Application settings rows present");

    // Card 6: Visibility & SEO checks
    assert(code.includes("Visibility & SEO"), "Card 6: 'Visibility & SEO' card present");
    assert(code.includes("Show in Search Results") && code.includes("Feature on Homepage") && code.includes("Search Keywords"), "Visibility & SEO rows present");

    // Right Column: Career Site Preview checks
    assert(code.includes("Career Site Preview"), "Right Card 1: 'Career Site Preview' present");
    assert(code.includes("Desktop View") && code.includes("Mobile View"), "Desktop / Mobile view switcher present");
    assert(code.includes("Open in New Tab"), "Action 'Open in New Tab' present");
    assert(code.includes("Build the future with us"), "Hero corporate banner overlay text present");

    // Right Column: Ready to Publish / Publication Readiness checks
    assert(code.includes("Ready to Publish"), "Right Card 2: 'Ready to Publish' card present");
    assert(code.includes("2 minor warnings"), "Amber badge '2 minor warnings' present");
    assert(code.includes("Career site configuration is valid") && code.includes("Job content is complete") && code.includes("No blocking validation errors"), "6 verified checklist items present");
    assert(code.includes("Naukri may require manual review") && code.includes("Google Jobs title will be truncated"), "Minor notes warning panel present");

    // Bottom Action Bar & Modals
    assert(code.includes("Cancel"), "Bottom bar 'Cancel' action present");
    assert(code.includes("Save as Draft"), "Bottom bar 'Save as Draft' action present");
    assert(code.includes("Publish Now"), "Bottom bar 'Publish Now' action present");
    assert(code.includes("Confirm Publication"), "Modal 1: Explicit publish confirmation modal present");
    assert(code.includes("Requisition Published Successfully!"), "Modal 2: Publication success celebration modal present");
  } catch (err) {
    assert(false, `UI component structure check failed: ${err.message}`);
  }

  // --------------------------------------------------------------------------
  // SUMMARY
  // --------------------------------------------------------------------------
  console.log("\n================================================================================");
  console.log(`   EXECUTION SUMMARY: ${passedChecks}/${totalChecks} Passed (${Math.round((passedChecks / totalChecks) * 100)}%)`);
  if (failedChecks === 0) {
    console.log("   🎉 ALL SCREEN 6 VERIFICATION CHECKS PASSED PERFECTLY!");
  } else {
    console.log(`   ⚠️ ${failedChecks} CHECKS FAILED.`);
  }
  console.log("================================================================================\n");

  process.exit(failedChecks === 0 ? 0 : 1);
}

runVerification();
