import assert from "node:assert/strict";

// Helper replicating cleanMapping logic
function getCleanMappingPayload(mapping) {
  const clean = {};
  for (const [col, fid] of Object.entries(mapping)) {
    if (fid && typeof fid === "string" && fid.trim() !== "") {
      clean[col] = fid.trim();
    }
  }
  return clean;
}

// Helper replicating duplicate field detection
function getDuplicateFieldMap(mapping) {
  const targetMap = {};
  for (const [col, fid] of Object.entries(mapping)) {
    if (fid && fid.trim() !== "") {
      if (!targetMap[fid]) targetMap[fid] = [];
      targetMap[fid].push(col);
    }
  }
  const duplicates = {};
  for (const [fid, cols] of Object.entries(targetMap)) {
    if (cols.length > 1) {
      duplicates[fid] = cols;
    }
  }
  return duplicates;
}

// Helper replicating error parser
function parseError(text, status, action) {
  if (!text) {
    return `${action} failed with HTTP ${status}.`;
  }

  try {
    const data = JSON.parse(text);
    if (data.message) {
      return `${action} failed (${status}): ${data.message}`;
    }
    if (data.error) {
      return `${action} failed (${status}): ${data.error}`;
    }
  } catch {
    // raw
  }

  return `${action} failed (${status}): ${text}`;
}

// Workflow simulator
async function simulateValidateWorkflow({
  mapping,
  mockSaveApi,
  mockValidateApi,
}) {
  const payload = getCleanMappingPayload(mapping);

  // Step 1: Save mapping
  const saveResult = await mockSaveApi(payload);
  if (!saveResult.ok) {
    const errText = parseError(saveResult.text, saveResult.status, "Save mapping before validation");
    return { success: false, step: "save", error: errText };
  }

  // Step 2: Validate
  const validateResult = await mockValidateApi();
  if (!validateResult.ok) {
    const errText = parseError(validateResult.text, validateResult.status, "Validation");
    return { success: false, step: "validate", error: errText };
  }

  let data;
  try {
    data = JSON.parse(validateResult.text);
  } catch {
    return {
      success: false,
      step: "parse",
      error: "Validation completed, but the server returned an invalid response format.",
    };
  }

  data.errors = Array.isArray(data.errors) ? data.errors : [];
  return { success: true, data };
}

console.log("=================================================");
console.log("STARTING IMPORT VALIDATION PREVIEW TESTS");
console.log("=================================================");

// Test 1: Clean Mapping Payload & Unmapped Filter
{
  const rawMapping = {
    col_a: "11111111-1111-1111-1111-111111111111",
    col_b: "",
    col_c: "   ",
    col_d: "22222222-2222-2222-2222-222222222222",
  };

  const clean = getCleanMappingPayload(rawMapping);
  assert.equal(Object.keys(clean).length, 2);
  assert.equal(clean.col_a, "11111111-1111-1111-1111-111111111111");
  assert.equal(clean.col_d, "22222222-2222-2222-2222-222222222222");
  assert.equal(clean.col_b, undefined);
  assert.equal(clean.col_c, undefined);

  console.log("[TEST 1] Clean Mapping Payload: PASS");
}

// Test 2: Duplicate Field Detection
{
  const duplicateMapping = {
    col_first_name: "fid-name-1",
    col_alt_name: "fid-name-1",
    col_email: "fid-email-2",
  };

  const dupes = getDuplicateFieldMap(duplicateMapping);
  assert.ok(dupes["fid-name-1"]);
  assert.equal(dupes["fid-name-1"].length, 2);
  assert.deepEqual(dupes["fid-name-1"], ["col_first_name", "col_alt_name"]);
  assert.equal(dupes["fid-email-2"], undefined);

  console.log("[TEST 2] Duplicate Target Field Detection: PASS");
}

// Test 3: Save Failure Prevents Validation Trigger
{
  let validateTriggered = false;

  const result = await simulateValidateWorkflow({
    mapping: { col_1: "fid-1" },
    mockSaveApi: async () => ({
      ok: false,
      status: 400,
      text: JSON.stringify({
        error: "BAD_REQUEST",
        message: "Target field cannot be mapped: system_id",
      }),
    }),
    mockValidateApi: async () => {
      validateTriggered = true;
      return { ok: true, text: "{}" };
    },
  });

  assert.equal(result.success, false);
  assert.equal(result.step, "save");
  assert.match(result.error, /Save mapping before validation failed \(400\): Target field cannot be mapped/);
  assert.equal(validateTriggered, false, "Validate endpoint MUST NOT be called when save fails");

  console.log("[TEST 3] Save Failure Blocks Validation: PASS");
}

// Test 4: Successful Validation with Valid and Invalid Rows & Nullable Fields
{
  const sampleBackendValidationResponse = {
    importJobId: "33333333-3333-3333-3333-333333333333",
    businessObjectId: "44444444-4444-4444-4444-444444444444",
    status: "COMPLETED_WITH_ERRORS",
    totalRows: 10,
    validRows: 8,
    invalidRows: 2,
    duplicateRows: 1,
    errors: [
      {
        rowNumber: 3,
        columnName: "customer_email",
        errorCode: "INVALID_EMAIL",
        errorMessage: "Value 'not-an-email' is not a valid email address.",
        sourceValue: "not-an-email",
      },
      {
        rowNumber: 5,
        columnName: null, // Required field not mapped has null column & sourceValue
        errorCode: "REQUIRED_FIELD_NOT_MAPPED",
        errorMessage: "Required field 'Tax ID' is not mapped to an import column.",
        sourceValue: null,
      },
    ],
  };

  const result = await simulateValidateWorkflow({
    mapping: { customer_email: "field-email-id" },
    mockSaveApi: async () => ({ ok: true, status: 200, text: "{}" }),
    mockValidateApi: async () => ({
      ok: true,
      status: 200,
      text: JSON.stringify(sampleBackendValidationResponse),
    }),
  });

  assert.equal(result.success, true);
  assert.equal(result.data.totalRows, 10);
  assert.equal(result.data.validRows, 8);
  assert.equal(result.data.invalidRows, 2);
  assert.equal(result.data.duplicateRows, 1);
  assert.equal(result.data.status, "COMPLETED_WITH_ERRORS");
  assert.equal(result.data.errors.length, 2);

  // Verify nullable column and sourceValue handling
  const requiredFieldError = result.data.errors[1];
  assert.equal(requiredFieldError.columnName, null);
  assert.equal(requiredFieldError.sourceValue, null);
  assert.equal(requiredFieldError.errorCode, "REQUIRED_FIELD_NOT_MAPPED");

  console.log("[TEST 4] Successful Validation with Nullable Error Fields: PASS");
}

// Test 5: 100% Valid Dataset
{
  const validBackendResponse = {
    importJobId: "33333333-3333-3333-3333-333333333333",
    businessObjectId: "44444444-4444-4444-4444-444444444444",
    status: "VALIDATED",
    totalRows: 25,
    validRows: 25,
    invalidRows: 0,
    duplicateRows: 0,
    errors: [],
  };

  const result = await simulateValidateWorkflow({
    mapping: { name: "field-name-id", code: "field-code-id" },
    mockSaveApi: async () => ({ ok: true, status: 200, text: "{}" }),
    mockValidateApi: async () => ({
      ok: true,
      status: 200,
      text: JSON.stringify(validBackendResponse),
    }),
  });

  assert.equal(result.success, true);
  assert.equal(result.data.invalidRows, 0);
  assert.equal(result.data.validRows, 25);
  assert.equal(result.data.totalRows, 25);
  assert.equal(result.data.status, "VALIDATED");
  assert.equal(result.data.errors.length, 0);

  console.log("[TEST 5] 100% Valid Dataset Handling: PASS");
}

// Test 6: Empty Rows Dataset Handling
{
  const emptyBackendResponse = {
    importJobId: "33333333-3333-3333-3333-333333333333",
    businessObjectId: "44444444-4444-4444-4444-444444444444",
    status: "VALIDATED",
    totalRows: 0,
    validRows: 0,
    invalidRows: 0,
    duplicateRows: 0,
    errors: [],
  };

  const result = await simulateValidateWorkflow({
    mapping: {},
    mockSaveApi: async () => ({ ok: true, status: 200, text: "{}" }),
    mockValidateApi: async () => ({
      ok: true,
      status: 200,
      text: JSON.stringify(emptyBackendResponse),
    }),
  });

  assert.equal(result.success, true);
  assert.equal(result.data.totalRows, 0);
  assert.equal(result.data.errors.length, 0);

  console.log("[TEST 6] Empty Rows Dataset Handling: PASS");
}

// Test 7: Backend 400 Bad Request on Validation
{
  const result = await simulateValidateWorkflow({
    mapping: {},
    mockSaveApi: async () => ({ ok: true, status: 200, text: "{}" }),
    mockValidateApi: async () => ({
      ok: false,
      status: 400,
      text: JSON.stringify({
        error: "BAD_REQUEST",
        message: "Import mapping has not been configured",
      }),
    }),
  });

  assert.equal(result.success, false);
  assert.equal(result.step, "validate");
  assert.match(result.error, /Validation failed \(400\): Import mapping has not been configured/);

  console.log("[TEST 7] Backend 400 Structured Validation Rejection: PASS");
}

// Test 8: Backend 401 Unauthorized Boundary
{
  const result = await simulateValidateWorkflow({
    mapping: { name: "fid" },
    mockSaveApi: async () => ({
      ok: false,
      status: 401,
      text: JSON.stringify({
        error: "UNAUTHORIZED",
        message: "No access token found in session.",
      }),
    }),
    mockValidateApi: async () => ({ ok: true, text: "{}" }),
  });

  assert.equal(result.success, false);
  assert.equal(result.step, "save");
  assert.match(result.error, /Save mapping before validation failed \(401\): No access token found in session/);

  console.log("[TEST 8] 401 Unauthorized Boundary Handling: PASS");
}

console.log("=================================================");
console.log("ALL IMPORT VALIDATION TESTS PASSED (8/8)");
console.log("=================================================");
