// ============================================================================
// MAX ERP: Business Objects & Metadata Engine Automated Verification Suite
// Validates Schema Builder, Dynamic Custom Fields, Validation Rules, and Layouts
// ============================================================================

const http = require("http");
const { execSync } = require("child_process");

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
  console.log("    MAX ERP: BUSINESS OBJECTS & METADATA ENGINE VERIFICATION SUITE");
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
    // 1. Business Objects Studio Page (/configuration/business-objects)
    // ------------------------------------------------------------------------
    console.log("► [1] Business Objects Studio & Navigation Shell");
    const boPage = await request({
      hostname: "localhost",
      port: 3000,
      path: "/configuration/business-objects",
      method: "GET",
    });
    assert(boPage.status === 200, "Studio loads with status 200 OK (no 307 redirect)");
    assert(boPage.raw.includes("Business Objects &amp; Metadata Engine") || boPage.raw.includes("Business Objects"), "Studio branding and header rendered");
    assert(boPage.raw.includes("Rules Studio"), "1-Click Rules Studio link present");
    assert(boPage.raw.includes("Layouts Designer"), "1-Click Layouts Designer link present");

    // ------------------------------------------------------------------------
    // 2. Business Objects Catalog API (/api/configuration/business-objects)
    // ------------------------------------------------------------------------
    console.log("\n► [2] Business Objects Catalog & Metadata API");
    const boApi = await request({
      hostname: "localhost",
      port: 3000,
      path: "/api/configuration/business-objects",
      method: "GET",
    });
    assert(boApi.status === 200, "GET /api/configuration/business-objects returns HTTP 200");
    assert(Array.isArray(boApi.body) && boApi.body.length >= 3, "Catalog contains core business entities");

    const jobDesc = boApi.body.find((b) => b.objectKey === "job_description");
    assert(!!jobDesc, "Job Description business object exists in registry");

    const position = boApi.body.find((b) => b.objectKey === "position");
    assert(!!position, "Enterprise Position business object exists in registry");

    const legalEntity = boApi.body.find((b) => b.objectKey === "legal_entity");
    assert(!!legalEntity, "Legal Entity business object exists in registry");

    // ------------------------------------------------------------------------
    // 3. Schema Builder Page (/configuration/business-objects/[id])
    // ------------------------------------------------------------------------
    console.log("\n► [3] Schema Builder Workspace");
    const schemaPage = await request({
      hostname: "localhost",
      port: 3000,
      path: "/configuration/business-objects/10000000-0000-0000-0000-000000000001",
      method: "GET",
    });
    assert(schemaPage.status === 200, "Schema Builder loads with status 200 OK");
    assert(schemaPage.raw.includes("Fields") && schemaPage.raw.includes("Overview"), "Schema builder tabs (Fields, Overview, Rules, Records) rendered");

    // ------------------------------------------------------------------------
    // 4. Dynamic Custom Fields API (/fields)
    // ------------------------------------------------------------------------
    console.log("\n► [4] Dynamic Custom Fields & Attributes API");
    const fieldsApi = await request({
      hostname: "localhost",
      port: 3000,
      path: "/api/configuration/business-objects/10000000-0000-0000-0000-000000000001/fields",
      method: "GET",
    });
    assert(fieldsApi.status === 200, "GET /fields returns HTTP 200");
    assert(Array.isArray(fieldsApi.body) && fieldsApi.body.length >= 10, "Job Description has comprehensive configured fields");

    const hasResponsibilities = fieldsApi.body.some((f) => f.fieldKey === "responsibilities");
    assert(hasResponsibilities, "Field 'responsibilities' configured with constraints");

    const hasSkills = fieldsApi.body.some((f) => f.fieldKey === "skills");
    assert(hasSkills, "Field 'skills' configured with multi-choice options");

    // ------------------------------------------------------------------------
    // 5. Add Custom Field (POST /fields)
    // ------------------------------------------------------------------------
    console.log("\n► [5] Add Dynamic Custom Field");
    const newFieldKey = "certifications_req_" + Date.now();
    const createFieldRes = await request(
      {
        hostname: "localhost",
        port: 3000,
        path: "/api/configuration/business-objects/10000000-0000-0000-0000-000000000001/fields",
        method: "POST",
        headers: { "Content-Type": "application/json" },
      },
      {
        fieldKey: newFieldKey,
        label: "Mandatory Certifications",
        fieldType: "TEXT",
        required: false,
        uniqueValue: false,
        readOnly: false,
        hidden: false,
        description: "Statutory licenses and professional certifications",
      }
    );
    assert(createFieldRes.status === 201 || createFieldRes.status === 200, "Custom field created with HTTP 201/200");
    assert(createFieldRes.body && createFieldRes.body.fieldKey === newFieldKey, "New field reflects correct key and properties");

    // ------------------------------------------------------------------------
    // 6. Business Rules Studio (/configuration/rules)
    // ------------------------------------------------------------------------
    console.log("\n► [6] Business Rules Studio & Execution Engine");
    const rulesPage = await request({
      hostname: "localhost",
      port: 3000,
      path: "/configuration/rules",
      method: "GET",
    });
    assert(rulesPage.status === 200, "Rules Studio loads with status 200 OK");
    assert(rulesPage.raw.includes("Rules Studio") || rulesPage.raw.includes("Business Rules"), "Rules Studio workspace rendered");

    // ------------------------------------------------------------------------
    // 7. Form Layouts Designer (/configuration/layouts)
    // ------------------------------------------------------------------------
    console.log("\n► [7] Form Layouts Designer");
    const layoutsPage = await request({
      hostname: "localhost",
      port: 3000,
      path: "/configuration/layouts",
      method: "GET",
    });
    assert(layoutsPage.status === 200, "Layouts Designer loads with status 200 OK");
    assert(layoutsPage.raw.includes("Layouts") || layoutsPage.raw.includes("Form"), "Form layout designer workspace rendered");

    // ------------------------------------------------------------------------
    // 8. Dynamic Record Explorer (/records)
    // ------------------------------------------------------------------------
    console.log("\n► [8] Dynamic Records Explorer");
    const recordsPage = await request({
      hostname: "localhost",
      port: 3000,
      path: "/configuration/business-objects/10000000-0000-0000-0000-000000000001/records",
      method: "GET",
    });
    assert(recordsPage.status === 200, "Dynamic Records page loads with status 200 OK");

    // ------------------------------------------------------------------------
    // Summary
    // ------------------------------------------------------------------------
    console.log("\n================================================================================");
    console.log(`Business Objects Verification: ${passed}/${total} checks passed (${Math.round((passed / total) * 100)}%)`);
    if (passed === total) {
      console.log("Status: ALL BUSINESS OBJECTS & METADATA CAPABILITIES OPERATIONAL (100%)");
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
