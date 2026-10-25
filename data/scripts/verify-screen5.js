// ============================================================================
// MAX ERP Recruiting: Screen 5 (Career Site & Job Boards) Automated Verification
// Tests route health, API contracts, validations, and UI component integrity
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
  console.log("   MAX ERP RECRUITING — SCREEN 5 (CAREER SITE & JOB BOARDS) VERIFICATION");
  console.log("================================================================================\n");

  // --------------------------------------------------------------------------
  // TEST SUITE 1: Route & Page Availability
  // --------------------------------------------------------------------------
  console.log("► [SUITE 1] Web Routes Availability");
  try {
    const resMain = await fetchUrl(`${BASE_URL}/recruitment/requisitions/REQ-2026-00123/post`);
    assert(resMain.status === 200, "Screen 5 main route (/recruitment/requisitions/REQ-2026-00123/post) returns 200 OK");

    const resAlt = await fetchUrl(`${BASE_URL}/recruitment/requisitions/REQ-2026-00123/post-to-career-site`);
    assert(resAlt.status === 200, "Screen 5 alias route (/post-to-career-site) returns 200 OK");
  } catch (err) {
    assert(false, `Web routes check failed: ${err.message}`);
  }

  // --------------------------------------------------------------------------
  // TEST SUITE 2: Job Boards Registry API
  // --------------------------------------------------------------------------
  console.log("\n► [SUITE 2] Job Boards Registry API (/api/recruitment/job-boards)");
  try {
    const allBoardsRes = await fetchUrl(`${BASE_URL}/api/recruitment/job-boards`);
    assert(allBoardsRes.status === 200, "GET /api/recruitment/job-boards returns 200 OK");
    assert(allBoardsRes.json && allBoardsRes.json.total === 9, "Returns 9 authoritative job boards in registry");

    const freeBoardsRes = await fetchUrl(`${BASE_URL}/api/recruitment/job-boards?filter=FREE`);
    assert(freeBoardsRes.json && freeBoardsRes.json.data.length === 4, "Filter FREE returns 4 free boards (Indeed, Glassdoor, WorkIndia, Google Jobs)");

    const premiumBoardsRes = await fetchUrl(`${BASE_URL}/api/recruitment/job-boards?filter=PREMIUM`);
    assert(premiumBoardsRes.json && premiumBoardsRes.json.data.length === 5, "Filter PREMIUM returns 5 premium boards (LinkedIn, Naukri, Monster, Shine, TimesJobs)");

    const configuredBoardsRes = await fetchUrl(`${BASE_URL}/api/recruitment/job-boards?filter=CONFIGURED`);
    assert(configuredBoardsRes.json && configuredBoardsRes.json.data.length >= 4, "Filter CONFIGURED returns configured boards with valid credentials");

    // Test board connector toggle
    const toggleRes = await fetchUrl(`${BASE_URL}/api/recruitment/job-boards`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: { id: "monster", status: "CONFIGURED" },
    });
    assert(toggleRes.status === 200 && toggleRes.json.data.status === "CONFIGURED", "PATCH /api/recruitment/job-boards successfully updates board configuration status");

    // Revert monster to NOT_CONFIGURED
    await fetchUrl(`${BASE_URL}/api/recruitment/job-boards`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: { id: "monster", status: "NOT_CONFIGURED" },
    });
  } catch (err) {
    assert(false, `Job Boards API check failed: ${err.message}`);
  }

  // --------------------------------------------------------------------------
  // TEST SUITE 3: Posting Configuration API & Validations
  // --------------------------------------------------------------------------
  console.log("\n► [SUITE 3] Requisition Posting API (/api/recruitment/requisitions/[id]/posting)");
  try {
    const getPostingRes = await fetchUrl(`${BASE_URL}/api/recruitment/requisitions/REQ-2026-00123/posting`);
    assert(getPostingRes.status === 200, "GET posting configuration returns 200 OK");
    assert(getPostingRes.json && getPostingRes.json.data.careerSiteTitle === "Senior Java Developer", "Default posting title matches requisition");
    assert(getPostingRes.json && getPostingRes.json.data.urlSlug === "senior-java-developer", "Default URL slug matches 'senior-java-developer'");
    assert(getPostingRes.json && getPostingRes.json.data.selectedBoardIds.length >= 4, "Pre-selected boards match approved mockup");

    // Test Save as Draft
    const saveDraftRes = await fetchUrl(`${BASE_URL}/api/recruitment/requisitions/REQ-2026-00123/posting`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: {
        action: "SAVE_DRAFT",
        careerSiteTitle: "Senior Java Developer",
        urlSlug: "senior-java-developer",
        category: "Engineering",
        location: "Bangalore, India",
        employmentType: "Full-time",
        workArrangement: "Hybrid",
        startDate: "2026-10-16",
        applicationDeadline: "2026-11-15",
        selectedBoardIds: ["indeed", "linkedin", "naukri", "glassdoor", "google-jobs"],
        jobDescription: "We are looking for a Senior Java Developer to join our engineering team.",
      },
    });
    assert(saveDraftRes.status === 200, "POST with action SAVE_DRAFT persists successfully with 200 OK");
    assert(saveDraftRes.json && saveDraftRes.json.data.status === "DRAFT", "Draft status persisted as DRAFT");

    // Validation Test 1: Empty title
    const emptyTitleRes = await fetchUrl(`${BASE_URL}/api/recruitment/requisitions/REQ-2026-00123/posting`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: { action: "SAVE_DRAFT", careerSiteTitle: "", urlSlug: "test-slug" },
    });
    assert(emptyTitleRes.status === 400, "Validation rejects empty Career Site Title (400 Bad Request)");

    // Validation Test 2: Invalid slug with uppercase / special chars
    const invalidSlugRes = await fetchUrl(`${BASE_URL}/api/recruitment/requisitions/REQ-2026-00123/posting`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: { action: "SAVE_DRAFT", careerSiteTitle: "Title", urlSlug: "INVALID SLUG!" },
    });
    assert(invalidSlugRes.status === 400, "Validation rejects invalid URL slug with spaces or uppercase (400 Bad Request)");

    // Validation Test 3: Inverted dates (deadline before start)
    const invertedDatesRes = await fetchUrl(`${BASE_URL}/api/recruitment/requisitions/REQ-2026-00123/posting`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: {
        action: "SAVE_DRAFT",
        careerSiteTitle: "Title",
        urlSlug: "valid-slug",
        startDate: "2026-11-20",
        applicationDeadline: "2026-10-01",
      },
    });
    assert(invertedDatesRes.status === 400, "Validation rejects application deadline earlier than start date (400 Bad Request)");
  } catch (err) {
    assert(false, `Posting API check failed: ${err.message}`);
  }

  // --------------------------------------------------------------------------
  // TEST SUITE 4: AI Recruiter Enhance Job Content API
  // --------------------------------------------------------------------------
  console.log("\n► [SUITE 4] AI Recruiter Enhance Content API");
  try {
    const aiRes = await fetchUrl(`${BASE_URL}/api/recruitment/ai-recruiter`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: {
        action: "ENHANCE_JOB_CONTENT",
        requisitionTitle: "Senior Java Developer",
        department: "Engineering",
        content: "Basic description",
      },
    });
    assert(aiRes.status === 200, "POST /api/recruitment/ai-recruiter ENHANCE_JOB_CONTENT returns 200 OK");
    assert(aiRes.json && aiRes.json.enhancedContent.length > 50, "AI generates compelling, enhanced job description");
    assert(aiRes.json && aiRes.json.suggestedBullets.length >= 3, "AI returns high-impact bullet suggestions");
  } catch (err) {
    assert(false, `AI Enhance check failed: ${err.message}`);
  }

  // --------------------------------------------------------------------------
  // TEST SUITE 5: Source Code & Approved UI Layout Integrity
  // --------------------------------------------------------------------------
  console.log("\n► [SUITE 5] Screen 5 UI Component Structure & Mockup Parity");
  try {
    const filePath = path.join(process.cwd(), "frontend/app/recruitment/requisitions/[id]/post/page.tsx");
    assert(fs.existsSync(filePath), "Screen 5 page component file exists on disk");

    const code = fs.readFileSync(filePath, "utf-8");

    // Stepper checks
    assert(code.includes("Career Site Details") && code.includes("Select Job Boards") && code.includes("Job Content") && code.includes("Review & Publish"), "4-Step Progress Stepper present (Steps 1, 2, 3, 4)");

    // Section A checks
    assert(code.includes("Career Site Posting Details"), "Section A: 'Career Site Posting Details' section present");
    assert(code.includes("https://careers.maxerp.com/jobs/"), "Public URL slug preview with 'https://careers.maxerp.com/jobs/' present");
    assert(code.includes("Show this job on the careers homepage"), "Switch toggle for 'Show this job on the careers homepage' present");
    assert(code.includes("Feature this job on the careers site"), "Switch toggle for 'Feature this job on the careers site' present");
    assert(code.includes("Show in search results"), "Checkbox for 'Show in search results' present");

    // Section B checks
    assert(code.includes("Select External Job Boards"), "Section B: 'Select External Job Boards' present");
    assert(code.includes("Manage Job Boards"), "Header action 'Manage Job Boards' present");
    assert(code.includes("Add Another Job Board"), "Action '+ Add Another Job Board' present");
    assert(code.includes("filteredBoards.map") && code.includes("board.name") && code.includes("board.tier"), "Authoritative Job boards rendered dynamically in 3x3 grid");

    // Section C checks
    assert(code.includes("Job Content"), "Section C: 'Job Content' section present");
    assert(code.includes("Use Requisition Content"), "Action 'Use Requisition Content' present");
    assert(code.includes("AI Enhance"), "Action 'AI Enhance' with sparkles present");
    assert(code.includes("Key Responsibilities") && code.includes("Qualifications") && code.includes("Additional Information"), "4 Content Tabs present (Description, Responsibilities, Qualifications, Additional)");

    // Section D checks
    assert(code.includes("Career Site Preview"), "Section D: 'Career Site Preview' card present");
    assert(code.includes("Desktop View") && code.includes("Mobile View"), "Desktop / Mobile view switcher present");
    assert(code.includes("Open in New Tab"), "Action 'Open in New Tab' present");
    assert(code.includes("Build the future with us"), "Hero corporate banner overlay text present");

    // Section E checks
    assert(code.includes("Posting Summary"), "Section E: 'Posting Summary' receipt card present");
    assert(code.includes("Posting Duration") && code.includes("Application Method") && code.includes("Auto-Expire") && code.includes("Feature Job"), "Posting Summary key-value rows present");

    // Persistent Bottom Bar checks
    assert(code.includes("Save as Draft"), "Bottom bar 'Save as Draft' action present");
    assert(code.includes("Continue to Review"), "Bottom bar 'Continue to Review' action present");
    assert(code.includes("Review & Publish Requisition"), "Modal 1: Step 4 Review & Publish dialog present");
    assert(code.includes("Manage Job Board Integrations"), "Modal 2: Manage Job Boards dialog present");
    assert(code.includes("AI-Enhanced Job Description Draft"), "Modal 5: AI Enhance preview dialog present");
    assert(code.includes("Reset to Requisition Content?"), "Modal 6: Reset Requisition confirmation modal present");
  } catch (err) {
    assert(false, `UI component structure check failed: ${err.message}`);
  }

  // --------------------------------------------------------------------------
  // SUMMARY
  // --------------------------------------------------------------------------
  console.log("\n================================================================================");
  console.log(`   EXECUTION SUMMARY: ${passedChecks}/${totalChecks} Passed (${Math.round((passedChecks / totalChecks) * 100)}%)`);
  if (failedChecks === 0) {
    console.log("   🎉 ALL SCREEN 5 VERIFICATION CHECKS PASSED PERFECTLY!");
  } else {
    console.log(`   ⚠️ ${failedChecks} CHECKS FAILED.`);
  }
  console.log("================================================================================\n");

  process.exit(failedChecks === 0 ? 0 : 1);
}

runVerification();
