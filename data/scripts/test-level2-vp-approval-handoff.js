/**
 * Live Automated Test: Level 2 VP Offer Approval & EC Core Position Handoff
 * Calls http://localhost:3000/api/recruitment/autonomous-ops over HTTP
 */

const http = require("http");

function postJson(urlPath, data) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const req = http.request(
      {
        hostname: "localhost",
        port: 3000,
        path: urlPath,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
        },
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          try {
            resolve({ statusCode: res.statusCode, data: JSON.parse(body) });
          } catch (e) {
            resolve({ statusCode: res.statusCode, data: body });
          }
        });
      }
    );
    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

async function run() {
  console.log("================================================================================");
  console.log("  LIVE TEST: LEVEL 2 VP OFFER APPROVAL & EC CORE POSITION SLOT HANDOFF");
  console.log("================================================================================\n");

  // 1. Authorize Level 2 Offer
  console.log("► [STEP 1] Executing Level 2 Executive VP Offer Authorization...");
  const authRes = await postJson("/api/recruitment/autonomous-ops", {
    action: "execute_action",
    payload: {
      alertId: "alert-offer-02",
      actionExecutableKey: "AUTHORIZE_LEVEL_2_OFFER",
      confirmed: true,
    },
  });

  if (authRes.data && authRes.data.success) {
    console.log(`  ✓ SUCCESS: ${authRes.data.message}`);
    console.log(`  • Executed At: ${authRes.data.executedAt}`);
  } else {
    console.error("  ✗ FAILED to authorize offer:", authRes);
    process.exit(1);
  }

  // 2. Execute ERP Handoff to Workforce Central
  console.log("\n► [STEP 2] Executing Autonomous ERP Handoff to Workforce Central (EC Core)...");
  const handoffRes = await postJson("/api/recruitment/autonomous-ops", {
    action: "execute_handoff",
    payload: {
      candidateId: "cand-123-02",
    },
  });

  if (handoffRes.data && handoffRes.data.success) {
    const r = handoffRes.data.handoffRecord;
    console.log(`  ✓ SUCCESS: ${handoffRes.data.message}`);
    console.log(`  • Appointed Employee   : ${r.candidateName}`);
    console.log(`  • Occupied Position Slot: ${r.positionCodeAllocated} (${r.positionTitle})`);
    console.log(`  • Department Cost Center: ${r.department} - ${r.costCenter}`);
    console.log(`  • Corporate Email       : ${r.workEmailAllocated}`);
    console.log(`  • Pre-Onboarding Start  : ${r.startDate}`);
    console.log(`  • State                 : ${r.status}`);
    console.log(`  • Digital Signature Hash: ${r.digitalSignatureAuditHash}`);
    console.log(`  • Authorized Signatory  : ${r.approvedBy}`);
  } else {
    console.error("  ✗ FAILED to execute ERP handoff:", handoffRes);
    process.exit(1);
  }

  console.log("\n================================================================================");
  console.log("  VERIFICATION RESULT: ALL LEVEL 2 APPROVAL & HANDOFF GATES PASSED (100%)");
  console.log("================================================================================\n");
}

run().catch((err) => {
  console.error("Error executing live test:", err);
  process.exit(1);
});
