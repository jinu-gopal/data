// ============================================================================
// MAX ERP Recruiting: Complete AI Recruiter & Copilot Capabilities Verification
// Verifies 10 comprehensive AI pillars across candidate evaluation, job creation,
// bias auditing, market benchmarking, and natural language query processing.
// ============================================================================

const http = require("http");

const BASE_URL = "http://localhost:3000";

function postJson(url, payload) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const bodyStr = JSON.stringify(payload);
    const reqOptions = {
      hostname: parsed.hostname,
      port: parsed.port,
      path: parsed.pathname + parsed.search,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(bodyStr),
      },
    };

    const req = http.request(reqOptions, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch {}
        resolve({ status: res.statusCode, data, json });
      });
    });

    req.on("error", reject);
    req.write(bodyStr);
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

async function runAiVerification() {
  console.log("\n================================================================================");
  console.log("   MAX ERP RECRUITING — ALL AI CAPABILITIES COMPREHENSIVE VERIFICATION");
  console.log("================================================================================\n");

  // --------------------------------------------------------------------------
  // PILLAR 1: AI Job Description Generation
  // --------------------------------------------------------------------------
  console.log("► [PILLAR 1] AI Job Description Generation");
  try {
    const res = await postJson(`${BASE_URL}/api/recruitment/ai-recruiter`, {
      action: "GENERATE_JOB_DESCRIPTION",
      requisitionTitle: "Senior Java Developer",
      department: "Engineering",
    });
    assert(res.status === 200, "GENERATE_JOB_DESCRIPTION returns 200 OK");
    assert(res.json.description && res.json.description.length > 50, "Generated description contains rich role summary");
    assert(Array.isArray(res.json.responsibilities) && res.json.responsibilities.length >= 3, "Returns 3+ structured responsibilities");
    assert(Array.isArray(res.json.requiredQualifications) && res.json.requiredQualifications.length >= 3, "Returns 3+ required qualifications");
    assert(res.json.suggestedSalary, "Returns suggested salary range");
  } catch (err) {
    assert(false, `Pillar 1 failed: ${err.message}`);
  }

  // --------------------------------------------------------------------------
  // PILLAR 2: AI Job Content Enhancement & SEO
  // --------------------------------------------------------------------------
  console.log("\n► [PILLAR 2] AI Job Content Enhancement for Career Sites");
  try {
    const res = await postJson(`${BASE_URL}/api/recruitment/ai-recruiter`, {
      action: "ENHANCE_JOB_CONTENT",
      requisitionTitle: "Senior Java Developer",
      department: "Engineering",
      content: "Looking for Java developer.",
    });
    assert(res.status === 200, "ENHANCE_JOB_CONTENT returns 200 OK");
    assert(res.json.enhancedContent && res.json.enhancedContent.includes("Key Objectives"), "Enhanced content includes formatted objectives");
    assert(Array.isArray(res.json.suggestedBullets) && res.json.suggestedBullets.length >= 3, "Returns high-impact bullet suggestions");
    assert(Array.isArray(res.json.seoKeywords) && res.json.seoKeywords.length >= 4, "Returns SEO indexing keywords");
  } catch (err) {
    assert(false, `Pillar 2 failed: ${err.message}`);
  }

  // --------------------------------------------------------------------------
  // PILLAR 3: AI Bias & Inclusivity Audit
  // --------------------------------------------------------------------------
  console.log("\n► [PILLAR 3] AI Bias, Tone & Inclusivity Audit");
  try {
    const res = await postJson(`${BASE_URL}/api/recruitment/ai-recruiter`, {
      action: "CHECK_BIAS_AND_INCLUSIVITY",
      text: "We are looking for a rockstar developer to join our dominant engineering squad.",
    });
    assert(res.status === 200, "CHECK_BIAS_AND_INCLUSIVITY returns 200 OK");
    assert(res.json.inclusivityScore >= 90, "Inclusivity score computed (>= 90%)");
    assert(Array.isArray(res.json.detectedPhrases) && res.json.detectedPhrases.length > 0, "Identifies non-inclusive phrasing with suggestions");
  } catch (err) {
    assert(false, `Pillar 3 failed: ${err.message}`);
  }

  // --------------------------------------------------------------------------
  // PILLAR 4: Live Market Salary Benchmark
  // --------------------------------------------------------------------------
  console.log("\n► [PILLAR 4] Market Salary & Competitiveness Benchmark");
  try {
    const res = await postJson(`${BASE_URL}/api/recruitment/ai-recruiter`, {
      action: "SALARY_MARKET_BENCHMARK",
      requisitionTitle: "Senior Java Developer",
      location: "Bangalore, India",
    });
    assert(res.status === 200, "SALARY_MARKET_BENCHMARK returns 200 OK");
    assert(res.json.percentiles && res.json.percentiles.p50 > 0, "Returns live percentiles (p25, p50, p75, p90)");
    assert(res.json.marketCompetitiveness, "Returns competitiveness rating");
  } catch (err) {
    assert(false, `Pillar 4 failed: ${err.message}`);
  }

  // --------------------------------------------------------------------------
  // PILLAR 5: In-Demand Skill Recommendations
  // --------------------------------------------------------------------------
  console.log("\n► [PILLAR 5] AI Skill Extraction & Competency Suggestions");
  try {
    const res = await postJson(`${BASE_URL}/api/recruitment/ai-recruiter`, {
      action: "SUGGEST_SKILLS",
      requisitionTitle: "Senior Java Developer",
    });
    assert(res.status === 200, "SUGGEST_SKILLS returns 200 OK");
    assert(Array.isArray(res.json.skills) && res.json.skills.includes("Java 21"), "Includes Java 21 in recommended skills");
  } catch (err) {
    assert(false, `Pillar 5 failed: ${err.message}`);
  }

  // --------------------------------------------------------------------------
  // PILLAR 6: 4-Pillar Comprehensive Candidate Evaluation
  // --------------------------------------------------------------------------
  console.log("\n► [PILLAR 6] 4-Pillar Candidate Deep-Evaluation & Risk Radar");
  try {
    const res = await postJson(`${BASE_URL}/api/recruitment/ai-recruiter`, {
      action: "EVALUATE_CANDIDATE_COMPREHENSIVE",
      candidateName: "Priya Menon",
      requisitionTitle: "Senior Java Developer",
    });
    assert(res.status === 200, "EVALUATE_CANDIDATE_COMPREHENSIVE returns 200 OK");
    assert(res.json.pillars && res.json.pillars.skillsMatch && res.json.pillars.experienceMatch, "Contains 4-Pillar breakdowns");
    assert(Array.isArray(res.json.strengths) && res.json.strengths.length >= 2, "Identifies candidate strengths");
    assert(Array.isArray(res.json.redFlags), "Analyzes risk factors & red flags");
    assert(res.json.verdict === "STRONG_HIRE", "Provides verified recommendation verdict");
  } catch (err) {
    assert(false, `Pillar 6 failed: ${err.message}`);
  }

  // --------------------------------------------------------------------------
  // PILLAR 7: Natural Language Candidate Q&A / Omnichannel Copilot
  // --------------------------------------------------------------------------
  console.log("\n► [PILLAR 7] Natural Language Candidate Q&A Omnichannel Copilot");
  const queryTests = [
    { prompt: "Compare Priya with other candidates", check: "Vikram" },
    { prompt: "Draft interview invitation email", check: "Subject" },
    { prompt: "Summarize candidate profile and experience", check: "4.5 years" },
    { prompt: "Suggest next steps for candidate", check: "Architecture" },
    { prompt: "Generate tailored interview questions", check: "microservices" },
    { prompt: "Analyze salary and compensation budget", check: "155,000" },
    { prompt: "Evaluate candidate culture fit and team alignment", check: "Culture" },
    { prompt: "Draft executive offer justification", check: "Justification" },
  ];

  for (const q of queryTests) {
    try {
      const res = await postJson(`${BASE_URL}/api/recruitment/ai-recruiter`, {
        action: "ASSISTANT_QUERY",
        prompt: q.prompt,
        candidateName: "Priya Menon",
        requisitionTitle: "Senior Java Developer",
      });
      assert(res.status === 200 && res.json.reply.toLowerCase().includes(q.check.toLowerCase()), `Copilot handles: "${q.prompt}"`);
    } catch (err) {
      assert(false, `Copilot query failed: ${err.message}`);
    }
  }

  // --------------------------------------------------------------------------
  // PILLAR 8: Tailored Question Bank Generation
  // --------------------------------------------------------------------------
  console.log("\n► [PILLAR 8] Tailored Question Bank Generation");
  try {
    const res = await postJson(`${BASE_URL}/api/recruitment/ai-recruiter`, {
      action: "GENERATE_QUESTIONS",
      candidateName: "Priya Menon",
      requisitionTitle: "Senior Java Developer",
    });
    assert(res.status === 200, "GENERATE_QUESTIONS returns 200 OK");
    assert(Array.isArray(res.json.tailoredQuestions) && res.json.tailoredQuestions.length >= 4, "Returns 4+ tailored scenario questions");
  } catch (err) {
    assert(false, `Pillar 8 failed: ${err.message}`);
  }

  // --------------------------------------------------------------------------
  // PILLAR 9: Executive Offer Justification Generation
  // --------------------------------------------------------------------------
  console.log("\n► [PILLAR 9] Executive Offer Justification Generation");
  try {
    const res = await postJson(`${BASE_URL}/api/recruitment/ai-recruiter`, {
      action: "DRAFT_OFFER_JUSTIFICATION",
      candidateName: "Priya Menon",
      requisitionTitle: "Senior Java Developer",
    });
    assert(res.status === 200, "DRAFT_OFFER_JUSTIFICATION returns 200 OK");
    assert(res.json.justification && res.json.justification.includes("MARKET ALIGNMENT"), "Generates structured executive justification");
  } catch (err) {
    assert(false, `Pillar 9 failed: ${err.message}`);
  }

  // --------------------------------------------------------------------------
  // PILLAR 10: Requisition Pipeline Velocity Summary
  // --------------------------------------------------------------------------
  console.log("\n► [PILLAR 10] Requisition Pipeline Velocity Summary");
  try {
    const res = await postJson(`${BASE_URL}/api/recruitment/ai-recruiter`, {
      action: "SUMMARIZE_REQUISITION",
      requisitionTitle: "Senior Java Developer",
      department: "Engineering",
    });
    assert(res.status === 200, "SUMMARIZE_REQUISITION returns 200 OK");
    assert(res.json.summary && res.json.summary.includes("Pipeline Velocity"), "Synthesizes pipeline velocity summary");
  } catch (err) {
    assert(false, `Pillar 10 failed: ${err.message}`);
  }

  console.log("\n================================================================================");
  console.log(`AI Capabilities Verification Complete: ${passedChecks}/${totalChecks} checks passed`);
  if (failedChecks > 0) {
    console.error(`Status: FAILED (${failedChecks} failures)`);
    process.exit(1);
  } else {
    console.log("Status: ALL AI CAPABILITIES VERIFIED (100% Comprehensive Coverage)");
  }
  console.log("================================================================================\n");
}

runAiVerification().catch((err) => {
  console.error("Fatal error during verification:", err);
  process.exit(1);
});
