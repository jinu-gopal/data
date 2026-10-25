// ============================================================================
// MAX ERP: Workforce Management & Employee Central Core Automated Verification Suite
// Validates Employee Directory, Org Chart, Position Slots, H2R, and Time-Off
// ============================================================================

const http = require("http");

function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const parsed = data ? JSON.parse(data) : null;
          resolve({ status: res.statusCode, headers: res.headers, body: parsed, raw: data });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, body: null, raw: data });
        }
      });
    });

    req.on("error", reject);
    req.setTimeout(8000, () => {
      req.destroy();
      reject(new Error("Request timed out"));
    });

    if (body) {
      const bodyStr = typeof body === "string" ? body : JSON.stringify(body);
      req.setHeader("Content-Length", Buffer.byteLength(bodyStr));
      req.write(bodyStr);
    }
    req.end();
  });
}

async function runSuite() {
  console.log("\n================================================================================");
  console.log("       MAX ERP: WORKFORCE MANAGEMENT & EC CORE VERIFICATION SUITE");
  console.log("================================================================================\n");

  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
    }
  }

  try {
    // ------------------------------------------------------------------------
    // 1. Workforce Hub Page (/workforce)
    // ------------------------------------------------------------------------
    console.log("► [1] Workforce Studio Navigation Shell & Tabs");
    const wfPage = await request({
      hostname: "localhost",
      port: 3000,
      path: "/workforce",
      method: "GET",
    });
    assert(wfPage.status === 200, "Workforce Studio loads with status 200 OK");
    assert(wfPage.raw.includes("Workforce") || wfPage.raw.includes("Position Management"), "Workforce header & navigation tabs rendered");

    // ------------------------------------------------------------------------
    // 2. Workforce Summary Telemetry (/api/workforce/summary)
    // ------------------------------------------------------------------------
    console.log("\n► [2] Workforce Telemetry & Executive Metrics API");
    const summaryRes = await request({
      hostname: "localhost",
      port: 3000,
      path: "/api/workforce/summary",
      method: "GET",
    });
    assert(summaryRes.status === 200, "GET /api/workforce/summary returns HTTP 200");
    assert(summaryRes.body && typeof summaryRes.body.totalEmployees === "number", "Total employees metric calculated");
    assert(summaryRes.body && summaryRes.body.activeEmployees > 0, "Active employee count reported");
    assert(summaryRes.body && summaryRes.body.departmentHeadcount, "Department headcount distribution breakdown present");

    // ------------------------------------------------------------------------
    // 3. Employee Directory API (/api/workforce/employees)
    // ------------------------------------------------------------------------
    console.log("\n► [3] Employee Directory & 360° Dossier API");
    const employeesRes = await request({
      hostname: "localhost",
      port: 3000,
      path: "/api/workforce/employees",
      method: "GET",
    });
    assert(employeesRes.status === 200, "GET /api/workforce/employees returns HTTP 200");
    assert(Array.isArray(employeesRes.body) && employeesRes.body.length > 0, "Employee roster populated with active personnel");

    const sampleEmp = employeesRes.body[0];
    assert(!!sampleEmp.fullName && !!sampleEmp.email && !!sampleEmp.jobTitle, "Employee records include name, email, and job title");

    // ------------------------------------------------------------------------
    // 4. Position Management API (/api/workforce/positions)
    // ------------------------------------------------------------------------
    console.log("\n► [4] Enterprise Position Management & FTE Allocation API");
    const posRes = await request({
      hostname: "localhost",
      port: 3000,
      path: "/api/workforce/positions",
      method: "GET",
    });
    assert(posRes.status === 200, "GET /api/workforce/positions returns HTTP 200");
    const positionsList = posRes.body.positions || posRes.body;
    assert(Array.isArray(positionsList) && positionsList.length > 0, "Position slots configured across departments");

    const hasFte = positionsList.some((p) => p.fte !== undefined);
    assert(hasFte, "Position slots track FTE capacity allocation");

    // ------------------------------------------------------------------------
    // 5. Organizational Structure API (/api/workforce/org-structure)
    // ------------------------------------------------------------------------
    console.log("\n► [5] 5-Tier Organizational Hierarchy API");
    const orgRes = await request({
      hostname: "localhost",
      port: 3000,
      path: "/api/workforce/org-structure",
      method: "GET",
    });
    assert(orgRes.status === 200, "GET /api/workforce/org-structure returns HTTP 200");
    const entities = orgRes.body.entities || orgRes.body;
    assert(Array.isArray(entities) && entities.length > 0, "Org structure entities defined (Division, Department, Unit)");

    // ------------------------------------------------------------------------
    // 6. Hire-to-Retire Hub & Transitions (/api/workforce/hire-to-retire)
    // ------------------------------------------------------------------------
    console.log("\n► [6] Hire-to-Retire (H2R) Lifecycle Governance");
    const h2rRes = await request({
      hostname: "localhost",
      port: 3000,
      path: "/api/workforce/hire-to-retire",
      method: "GET",
    });
    assert(h2rRes.status === 200, "GET /api/workforce/hire-to-retire returns HTTP 200");
    assert(h2rRes.body && h2rRes.body.metrics, "H2R lifecycle metrics (new hires, promotions, transfers) tracked");

    // ------------------------------------------------------------------------
    // 7. Recruiting to Employee Conversion Bridge
    // ------------------------------------------------------------------------
    console.log("\n► [7] Recruiting to Workforce Bridge");
    const eligibleRes = await request({
      hostname: "localhost",
      port: 3000,
      path: "/api/workforce/hire-to-retire/eligible-candidates",
      method: "GET",
    });
    assert(eligibleRes.status === 200, "GET /eligible-candidates returns HTTP 200");
    assert(Array.isArray(eligibleRes.body) && eligibleRes.body.length > 0, "Cleared offer candidates ready for hire conversion");

    // ------------------------------------------------------------------------
    // 8. Time-Off & PTO Engine (/api/workforce/time-off and /leaves)
    // ------------------------------------------------------------------------
    console.log("\n► [8] Time-Off & PTO Entitlement Engine");
    const timeOffRes = await request({
      hostname: "localhost",
      port: 3000,
      path: "/api/workforce/time-off",
      method: "GET",
    });
    assert(timeOffRes.status === 200, "GET /api/workforce/time-off returns HTTP 200");

    const leavesRes = await request({
      hostname: "localhost",
      port: 3000,
      path: "/api/workforce/leaves",
      method: "GET",
    });
    assert(leavesRes.status === 200, "GET /api/workforce/leaves returns HTTP 200");
    assert(Array.isArray(leavesRes.body), "Leave requests queryable");

    // ------------------------------------------------------------------------
    // 9. Shift & Roster Scheduler (/api/workforce/shifts)
    // ------------------------------------------------------------------------
    console.log("\n► [9] Shift & Roster Scheduler API");
    const shiftsRes = await request({
      hostname: "localhost",
      port: 3000,
      path: "/api/workforce/shifts",
      method: "GET",
    });
    assert(shiftsRes.status === 200, "GET /api/workforce/shifts returns HTTP 200");
    assert(Array.isArray(shiftsRes.body), "Shift assignments array returned");

    // ------------------------------------------------------------------------
    // 10. Employee Onboarding Action (POST /api/workforce/employees)
    // ------------------------------------------------------------------------
    console.log("\n► [10] Onboard New Employee Action");
    const newEmpEmail = `jordan.lee.${Date.now()}@maxerp.local`;
    const onboardRes = await request(
      {
        hostname: "localhost",
        port: 3000,
        path: "/api/workforce/employees",
        method: "POST",
        headers: { "Content-Type": "application/json" },
      },
      {
        firstName: "Jordan",
        lastName: "Lee",
        email: newEmpEmail,
        phone: "+1 (555) 234-5678",
        department: "Engineering",
        jobTitle: "Senior DevOps Specialist",
        employmentType: "FULL_TIME",
        workLocation: "HEADQUARTERS",
        positionCode: "POS-ENG-084",
      }
    );
    assert(onboardRes.status === 201 || onboardRes.status === 200, "Employee onboarded successfully with HTTP 201");

    // ------------------------------------------------------------------------
    // 11. Leave Approval Workflow (PATCH /leaves/[id]/status)
    // ------------------------------------------------------------------------
    console.log("\n► [11] Managerial Leave Approval Workflow");
    const approveLeaveRes = await request(
      {
        hostname: "localhost",
        port: 3000,
        path: "/api/workforce/leaves/leave-req-001/status",
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      },
      {
        status: "APPROVED",
        approvedBy: "Director of People Operations",
        reviewNotes: "Approved in standard governance cycle.",
      }
    );
    assert(approveLeaveRes.status === 200, "Leave request approved with HTTP 200");
    assert(approveLeaveRes.body && approveLeaveRes.body.status === "APPROVED", "Leave status successfully updated to APPROVED");

    // ------------------------------------------------------------------------
    // Summary
    // ------------------------------------------------------------------------
    console.log("\n================================================================================");
    console.log(`Workforce Verification: ${passed}/${total} checks passed (${Math.round((passed / total) * 100)}%)`);
    if (passed === total) {
      console.log("Status: ALL WORKFORCE & EC CORE CAPABILITIES OPERATIONAL (100%)");
    } else {
      console.error("Status: SOME CHECKS FAILED");
      process.exitCode = 1;
    }
    console.log("================================================================================\n");
  } catch (err) {
    console.error("Test execution error:", err);
    process.exit(1);
  }
}

runSuite();
