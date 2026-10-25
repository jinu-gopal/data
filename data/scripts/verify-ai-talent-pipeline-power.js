/**
 * Automated Verification: MAX AI Powerful Autonomous Talent Pipeline & Agentic Actions
 */

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

async function run() {
  console.log("================================================================================");
  console.log("    MAX AI POWERFUL AUTONOMOUS AGENT & TALENT PIPELINE VERIFICATION");
  console.log("================================================================================");

  let passed = 0;
  let total = 0;

  async function testCase(name, fn) {
    total++;
    try {
      await fn();
      console.log(`  ✓ [${total}] ${name}: PASSED`);
      passed++;
    } catch (err) {
      console.error(`  ✗ [${total}] ${name}: FAILED - ${err.message}`);
    }
  }

  // 1. User exact prompt test
  await testCase("Natural Language: 'create a new talent pipeline for recruting'", async () => {
    const res = await fetch(`${BASE_URL}/api/ai/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "create a new talent pipeline for recruting" }),
    });
    if (!res.ok) throw new Error(`HTTP status ${res.status}`);
    const data = await res.json();
    if (data.actionType !== "PROPOSE_TALENT_PIPELINE") {
      throw new Error(`Expected actionType PROPOSE_TALENT_PIPELINE, got ${data.actionType}`);
    }
    const pipe = data.proposedTalentPipeline || data.proposedPipeline;
    if (!pipe) throw new Error("proposedTalentPipeline missing in response");
    if (!Array.isArray(pipe.stages) || pipe.stages.length !== 6) {
      throw new Error(`Expected 6 governed stages, got ${pipe.stages?.length}`);
    }
    if (pipe.totalTurnaroundSlaDays !== 14) {
      throw new Error(`Expected 14 days SLA, got ${pipe.totalTurnaroundSlaDays}`);
    }
  });

  // 2. Action: Create Requisition
  await testCase("Agentic Action: 'create job requisition for Principal Cloud Architect'", async () => {
    const res = await fetch(`${BASE_URL}/api/ai/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "create job requisition for Principal Cloud Architect in Engineering" }),
    });
    if (!res.ok) throw new Error(`HTTP status ${res.status}`);
    const data = await res.json();
    if (data.actionType !== "EXECUTE_ACTION") {
      throw new Error(`Expected actionType EXECUTE_ACTION, got ${data.actionType}`);
    }
    if (data.executedAction?.actionType !== "CREATE_REQUISITION") {
      throw new Error(`Expected CREATE_REQUISITION, got ${data.executedAction?.actionType}`);
    }
    if (!data.executedAction?.deepLink?.includes("/recruitment/requisitions")) {
      throw new Error(`Invalid deepLink: ${data.executedAction?.deepLink}`);
    }
  });

  // 3. Action: Advance Candidate Stage
  await testCase("Agentic Action: 'advance candidate Priya Menon to Interview'", async () => {
    const res = await fetch(`${BASE_URL}/api/ai/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "advance candidate Priya Menon to Interview" }),
    });
    if (!res.ok) throw new Error(`HTTP status ${res.status}`);
    const data = await res.json();
    if (data.actionType !== "EXECUTE_ACTION") {
      throw new Error(`Expected actionType EXECUTE_ACTION, got ${data.actionType}`);
    }
    if (data.executedAction?.actionType !== "ADVANCE_CANDIDATE_STAGE") {
      throw new Error(`Expected ADVANCE_CANDIDATE_STAGE, got ${data.executedAction?.actionType}`);
    }
    if (!data.executedAction?.deepLink?.includes("/recruitment/candidates")) {
      throw new Error(`Invalid deepLink: ${data.executedAction?.deepLink}`);
    }
  });

  // 4. Action: Approve Candidate Offer
  await testCase("Agentic Action: 'approve offer for Emily Zhang'", async () => {
    const res = await fetch(`${BASE_URL}/api/ai/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "approve offer for Emily Zhang" }),
    });
    if (!res.ok) throw new Error(`HTTP status ${res.status}`);
    const data = await res.json();
    if (data.actionType !== "EXECUTE_ACTION") {
      throw new Error(`Expected actionType EXECUTE_ACTION, got ${data.actionType}`);
    }
    if (data.executedAction?.actionType !== "APPROVE_OFFER") {
      throw new Error(`Expected APPROVE_OFFER, got ${data.executedAction?.actionType}`);
    }
    if (!data.executedAction?.deepLink?.includes("/recruitment/offers")) {
      throw new Error(`Invalid deepLink: ${data.executedAction?.deepLink}`);
    }
  });

  // 5. Action: Schedule Interview
  await testCase("Agentic Action: 'schedule interview for Lucas Schneider'", async () => {
    const res = await fetch(`${BASE_URL}/api/ai/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "schedule interview for Lucas Schneider" }),
    });
    if (!res.ok) throw new Error(`HTTP status ${res.status}`);
    const data = await res.json();
    if (data.actionType !== "EXECUTE_ACTION") {
      throw new Error(`Expected actionType EXECUTE_ACTION, got ${data.actionType}`);
    }
    if (data.executedAction?.actionType !== "SCHEDULE_INTERVIEW") {
      throw new Error(`Expected SCHEDULE_INTERVIEW, got ${data.executedAction?.actionType}`);
    }
    if (!data.executedAction?.deepLink?.includes("/recruitment/interviews")) {
      throw new Error(`Invalid deepLink: ${data.executedAction?.deepLink}`);
    }
  });

  console.log("================================================================================");
  console.log(`Final Result: ${passed}/${total} Tests Passed (${Math.round((passed / total) * 100)}%)`);
  console.log("================================================================================");
  if (passed !== total) process.exit(1);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
