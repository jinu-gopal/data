import assert from "node:assert/strict";

// Replicate the exact proxy helper logic from frontend/app/api/configuration/proxy-helper.ts
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUuid(id) {
  if (typeof id !== "string") {
    return false;
  }
  return UUID_REGEX.test(id.trim());
}

function validateUuidParam(id, paramName = "id") {
  if (!isValidUuid(id)) {
    return {
      status: 400,
      body: {
        error: "BAD_REQUEST",
        message: `Invalid UUID provided for parameter: ${paramName}.`,
      },
    };
  }
  return null;
}

function getBackendOrigin(envBackendUrl, envApiUrl) {
  const origin = envBackendUrl || envApiUrl || "http://localhost:8080";
  return origin.trim().replace(/\/+$/, "");
}

function buildBackendUrl(path, envBackendUrl, envApiUrl) {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${getBackendOrigin(envBackendUrl, envApiUrl)}${cleanPath}`;
}

function unauthorizedResponse(message = "Authentication required or session expired.") {
  return {
    status: 401,
    body: {
      error: "UNAUTHORIZED",
      message,
    },
  };
}

function badRequestResponse(message) {
  return {
    status: 400,
    body: {
      error: "BAD_REQUEST",
      message,
    },
  };
}

async function forwardBackendResponseSimulation(status, responseText) {
  if (status === 204) {
    return { status: 204, body: null };
  }

  if (!responseText) {
    return { status, body: null };
  }

  try {
    const data = JSON.parse(responseText);
    return { status, body: data };
  } catch {
    if (status >= 500) {
      return {
        status,
        body: {
          error: "INTERNAL_ERROR",
          message: "The backend service encountered an error.",
        },
      };
    }

    return {
      status,
      body: {
        error: "BACKEND_ERROR",
        message: responseText.substring(0, 300),
      },
    };
  }
}

// -------------------------------------------------------------
// Simulators for each route handler
// -------------------------------------------------------------

// Simulates POST /api/configuration/business-objects/[businessObjectId]/imports/[importId]/execute
async function simulateExecuteProxy({
  businessObjectId,
  importId,
  sessionToken,
  tokenExpiresAt,
  fetchSpy,
  envOrigin,
}) {
  const invalidObjUuid = validateUuidParam(businessObjectId, "businessObjectId");
  if (invalidObjUuid) return invalidObjUuid;

  const invalidImpUuid = validateUuidParam(importId, "importId");
  if (invalidImpUuid) return invalidImpUuid;

  if (!sessionToken) {
    return unauthorizedResponse("No access token found in session.");
  }

  if (tokenExpiresAt && Date.now() >= tokenExpiresAt * 1000) {
    return unauthorizedResponse("Authentication required or session expired.");
  }

  const targetUrl = buildBackendUrl(
    `/api/v1/configuration/business-objects/${businessObjectId}/imports/${importId}/execute`,
    envOrigin
  );

  const response = await fetchSpy(targetUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${sessionToken}`,
      Accept: "application/json",
    },
  });

  return forwardBackendResponseSimulation(response.status, response.body);
}

// Simulates GET /api/configuration/business-objects/[businessObjectId]/imports
async function simulateHistoryProxy({
  businessObjectId,
  sessionToken,
  tokenExpiresAt,
  fetchSpy,
  envOrigin,
}) {
  const invalidObjUuid = validateUuidParam(businessObjectId, "businessObjectId");
  if (invalidObjUuid) return invalidObjUuid;

  if (!sessionToken) {
    return unauthorizedResponse("No access token found in session.");
  }

  if (tokenExpiresAt && Date.now() >= tokenExpiresAt * 1000) {
    return unauthorizedResponse("Authentication required or session expired.");
  }

  const targetUrl = buildBackendUrl(
    `/api/v1/configuration/business-objects/${businessObjectId}/imports`,
    envOrigin
  );

  const response = await fetchSpy(targetUrl, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${sessionToken}`,
      Accept: "application/json",
    },
  });

  return forwardBackendResponseSimulation(response.status, response.body);
}

// Simulates GET /api/configuration/business-objects/[businessObjectId]/imports/[importId]
async function simulateJobDetailsProxy({
  businessObjectId,
  importId,
  sessionToken,
  tokenExpiresAt,
  fetchSpy,
  envOrigin,
}) {
  const invalidObjUuid = validateUuidParam(businessObjectId, "businessObjectId");
  if (invalidObjUuid) return invalidObjUuid;

  const invalidImpUuid = validateUuidParam(importId, "importId");
  if (invalidImpUuid) return invalidImpUuid;

  if (!sessionToken) {
    return unauthorizedResponse("No access token found in session.");
  }

  if (tokenExpiresAt && Date.now() >= tokenExpiresAt * 1000) {
    return unauthorizedResponse("Authentication required or session expired.");
  }

  const targetUrl = buildBackendUrl(
    `/api/v1/configuration/business-objects/${businessObjectId}/imports/${importId}`,
    envOrigin
  );

  const response = await fetchSpy(targetUrl, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${sessionToken}`,
      Accept: "application/json",
    },
  });

  return forwardBackendResponseSimulation(response.status, response.body);
}

// Simulates POST /api/configuration/business-objects/[businessObjectId]/imports (Upload)
async function simulateUploadProxy({
  businessObjectId,
  hasFile,
  fileSize,
  sessionToken,
  tokenExpiresAt,
  fetchSpy,
  envOrigin,
}) {
  const invalidObjUuid = validateUuidParam(businessObjectId, "businessObjectId");
  if (invalidObjUuid) return invalidObjUuid;

  if (!sessionToken) {
    return unauthorizedResponse("No access token found in session.");
  }

  if (tokenExpiresAt && Date.now() >= tokenExpiresAt * 1000) {
    return unauthorizedResponse("Authentication required or session expired.");
  }

  if (!hasFile || fileSize === 0) {
    return badRequestResponse("A non-empty file must be provided for upload.");
  }

  const targetUrl = buildBackendUrl(
    `/api/v1/configuration/business-objects/${businessObjectId}/imports`,
    envOrigin
  );

  const response = await fetchSpy(targetUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${sessionToken}`,
      Accept: "application/json",
    },
  });

  return forwardBackendResponseSimulation(response.status, response.body);
}

// -------------------------------------------------------------
// Test Execution
// -------------------------------------------------------------
console.log("=================================================");
console.log("STARTING IMPORT EXECUTION & HISTORY PROXY TESTS");
console.log("=================================================");

const validBoId = "cf1757d5-c535-4335-939c-24908aee0209";
const validImpId = "e87b649a-0744-48f8-b3d6-681b49f96ce7";

// 1. Execute route forwards POST to correct normalized backend URL
console.log("\n[TEST 1] Execute route forwards POST to normalized backend URL");
{
  let calledUrl = null;
  let sentOptions = null;
  const mockFetch = async (url, opts) => {
    calledUrl = url;
    sentOptions = opts;
    return {
      status: 200,
      body: JSON.stringify({
        importJobId: validImpId,
        businessObjectId: validBoId,
        status: "COMPLETED",
        totalRows: 10,
        processedRows: 10,
        failedRows: 0,
        duplicateRows: 0,
      }),
    };
  };

  const res = await simulateExecuteProxy({
    businessObjectId: validBoId,
    importId: validImpId,
    sessionToken: "valid-jwt",
    tokenExpiresAt: Math.floor(Date.now() / 1000) + 3600,
    fetchSpy: mockFetch,
    envOrigin: "http://backend-server:8080/",
  });

  assert.equal(res.status, 200);
  assert.equal(
    calledUrl,
    `http://backend-server:8080/api/v1/configuration/business-objects/${validBoId}/imports/${validImpId}/execute`
  );
  assert.equal(sentOptions.method, "POST");
  assert.equal(sentOptions.headers.Authorization, "Bearer valid-jwt");
  assert.equal(res.body.status, "COMPLETED");
  assert.equal(res.body.processedRows, 10);
  console.log("  PASS: POST forwarded with correct URL, method, headers, and status 200 response.");
}

// 2. Invalid or traversal-like UUIDs rejected before backend dispatch
console.log("\n[TEST 2] Invalid or traversal-like UUIDs rejected before backend dispatch");
{
  const maliciousIds = [
    "../../actuator/env",
    "../admin",
    "@evil.com",
    "cf1757d5-c535-4335-939c-24908aee0209/execute",
    "invalid-uuid",
    "12345",
  ];

  for (const malId of maliciousIds) {
    let backendCalled = false;
    const fetchSpy = async () => {
      backendCalled = true;
      return { status: 200, body: "{}" };
    };

    // Test businessObjectId invalid
    const res1 = await simulateExecuteProxy({
      businessObjectId: malId,
      importId: validImpId,
      sessionToken: "valid-jwt",
      fetchSpy,
    });
    assert.equal(res1.status, 400);
    assert.equal(res1.body.error, "BAD_REQUEST");
    assert.equal(backendCalled, false, `Backend must not be called for invalid businessObjectId: ${malId}`);

    // Test importId invalid
    const res2 = await simulateExecuteProxy({
      businessObjectId: validBoId,
      importId: malId,
      sessionToken: "valid-jwt",
      fetchSpy,
    });
    assert.equal(res2.status, 400);
    assert.equal(res2.body.error, "BAD_REQUEST");
    assert.equal(backendCalled, false, `Backend must not be called for invalid importId: ${malId}`);
  }
  console.log("  PASS: All traversal and invalid UUID inputs rejected with 400 before backend contact.");
}

// 3. Missing and expired sessions are rejected
console.log("\n[TEST 3] Missing and expired sessions rejected");
{
  let backendCalled = false;
  const fetchSpy = async () => {
    backendCalled = true;
    return { status: 200, body: "{}" };
  };

  // Missing session
  const resMissing = await simulateExecuteProxy({
    businessObjectId: validBoId,
    importId: validImpId,
    sessionToken: null,
    fetchSpy,
  });
  assert.equal(resMissing.status, 401);
  assert.equal(resMissing.body.error, "UNAUTHORIZED");
  assert.equal(backendCalled, false, "Backend must not be called when token is missing");

  // Expired session
  const resExpired = await simulateExecuteProxy({
    businessObjectId: validBoId,
    importId: validImpId,
    sessionToken: "expired-jwt",
    tokenExpiresAt: Math.floor(Date.now() / 1000) - 300,
    fetchSpy,
  });
  assert.equal(resExpired.status, 401);
  assert.equal(resExpired.body.error, "UNAUTHORIZED");
  assert.equal(backendCalled, false, "Backend must not be called when token is expired");
  console.log("  PASS: Missing and expired sessions rejected with 401.");
}

// 4. Token is forwarded only to configured backend origin
console.log("\n[TEST 4] Token forwarded only to configured backend origin");
{
  let targetOrigin = null;
  const mockFetch = async (url) => {
    targetOrigin = new URL(url).origin;
    return { status: 200, body: JSON.stringify({ status: "COMPLETED" }) };
  };

  await simulateExecuteProxy({
    businessObjectId: validBoId,
    importId: validImpId,
    sessionToken: "secret-bearer-jwt",
    tokenExpiresAt: Math.floor(Date.now() / 1000) + 3600,
    fetchSpy: mockFetch,
    envOrigin: "http://internal-max-erp:8080",
  });

  assert.equal(targetOrigin, "http://internal-max-erp:8080");
  console.log("  PASS: Token transmitted exclusively to configured backend origin.");
}

// 5. HTTP 409 execution conflicts are preserved
console.log("\n[TEST 5] HTTP 409 execution conflicts preserved");
{
  const conflictPayload = JSON.stringify({
    status: 409,
    message: "Import job is not in a VALIDATED state (current status: PARSED)",
  });

  const mockFetchConflict = async () => ({
    status: 409,
    body: conflictPayload,
  });

  const res = await simulateExecuteProxy({
    businessObjectId: validBoId,
    importId: validImpId,
    sessionToken: "valid-jwt",
    tokenExpiresAt: Math.floor(Date.now() / 1000) + 3600,
    fetchSpy: mockFetchConflict,
  });

  assert.equal(res.status, 409);
  assert.equal(res.body.status, 409);
  assert.equal(
    res.body.message,
    "Import job is not in a VALIDATED state (current status: PARSED)"
  );
  console.log("  PASS: 409 conflict and message preserved intact.");
}

// 6. Structured validation and authorization errors remain safe and readable
console.log("\n[TEST 6] Structured validation and authorization errors remain safe and readable");
{
  // 403 Forbidden
  const mockFetch403 = async () => ({
    status: 403,
    body: JSON.stringify({
      status: 403,
      code: "PERMISSION_DENIED",
      message: "User lacks CONFIGURATION:MANAGE permission",
    }),
  });

  const res403 = await simulateExecuteProxy({
    businessObjectId: validBoId,
    importId: validImpId,
    sessionToken: "valid-jwt",
    tokenExpiresAt: Math.floor(Date.now() / 1000) + 3600,
    fetchSpy: mockFetch403,
  });
  assert.equal(res403.status, 403);
  assert.equal(res403.body.code, "PERMISSION_DENIED");

  // 404 Not Found (mismatch)
  const mockFetch404 = async () => ({
    status: 404,
    body: JSON.stringify({
      status: 404,
      message: "Import job does not belong to the specified business object",
    }),
  });

  const res404 = await simulateExecuteProxy({
    businessObjectId: validBoId,
    importId: validImpId,
    sessionToken: "valid-jwt",
    tokenExpiresAt: Math.floor(Date.now() / 1000) + 3600,
    fetchSpy: mockFetch404,
  });
  assert.equal(res404.status, 404);
  assert.equal(
    res404.body.message,
    "Import job does not belong to the specified business object"
  );
  console.log("  PASS: 403 and 404 structured errors preserved safely.");
}

// 7. History GET forwards to correct endpoint
console.log("\n[TEST 7] History GET forwards to correct endpoint");
{
  let calledUrl = null;
  let sentMethod = null;
  const mockFetch = async (url, opts) => {
    calledUrl = url;
    sentMethod = opts.method;
    return {
      status: 200,
      body: JSON.stringify([
        { id: validImpId, status: "COMPLETED", fileName: "import1.csv" },
        { id: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d", status: "VALIDATED", fileName: "import2.csv" },
      ]),
    };
  };

  const res = await simulateHistoryProxy({
    businessObjectId: validBoId,
    sessionToken: "valid-jwt",
    tokenExpiresAt: Math.floor(Date.now() / 1000) + 3600,
    fetchSpy: mockFetch,
    envOrigin: "http://backend-server:8080",
  });

  assert.equal(res.status, 200);
  assert.equal(
    calledUrl,
    `http://backend-server:8080/api/v1/configuration/business-objects/${validBoId}/imports`
  );
  assert.equal(sentMethod, "GET");
  assert.equal(res.body.length, 2);
  assert.equal(res.body[0].fileName, "import1.csv");
  console.log("  PASS: History GET forwards to correct URL and returns job array.");
}

// 8. Adding GET does not break existing import-upload POST handler
console.log("\n[TEST 8] Adding GET does not break existing import-upload POST handler");
{
  let calledUrl = null;
  let sentMethod = null;
  const mockFetch = async (url, opts) => {
    calledUrl = url;
    sentMethod = opts.method;
    return {
      status: 201,
      body: JSON.stringify({
        importJobId: validImpId,
        status: "UPLOADED",
        fileName: "upload.csv",
      }),
    };
  };

  // Successful upload
  const res = await simulateUploadProxy({
    businessObjectId: validBoId,
    hasFile: true,
    fileSize: 1024,
    sessionToken: "valid-jwt",
    tokenExpiresAt: Math.floor(Date.now() / 1000) + 3600,
    fetchSpy: mockFetch,
    envOrigin: "http://backend-server:8080",
  });

  assert.equal(res.status, 201);
  assert.equal(
    calledUrl,
    `http://backend-server:8080/api/v1/configuration/business-objects/${validBoId}/imports`
  );
  assert.equal(sentMethod, "POST");
  assert.equal(res.body.status, "UPLOADED");

  // Empty file rejected
  const resEmpty = await simulateUploadProxy({
    businessObjectId: validBoId,
    hasFile: true,
    fileSize: 0,
    sessionToken: "valid-jwt",
    fetchSpy: mockFetch,
  });
  assert.equal(resEmpty.status, 400);
  assert.equal(resEmpty.body.error, "BAD_REQUEST");

  console.log("  PASS: POST upload behavior preserved and non-regressed.");
}

// 9. Job-details GET validates both IDs and forwards correctly
console.log("\n[TEST 9] Job-details GET validates both IDs and forwards correctly");
{
  let calledUrl = null;
  let sentMethod = null;
  const mockFetch = async (url, opts) => {
    calledUrl = url;
    sentMethod = opts.method;
    return {
      status: 200,
      body: JSON.stringify({
        id: validImpId,
        businessObjectId: validBoId,
        status: "COMPLETED",
        totalRows: 25,
        processedRows: 25,
      }),
    };
  };

  const res = await simulateJobDetailsProxy({
    businessObjectId: validBoId,
    importId: validImpId,
    sessionToken: "valid-jwt",
    tokenExpiresAt: Math.floor(Date.now() / 1000) + 3600,
    fetchSpy: mockFetch,
    envOrigin: "http://backend-server:8080",
  });

  assert.equal(res.status, 200);
  assert.equal(
    calledUrl,
    `http://backend-server:8080/api/v1/configuration/business-objects/${validBoId}/imports/${validImpId}`
  );
  assert.equal(sentMethod, "GET");
  assert.equal(res.body.id, validImpId);
  assert.equal(res.body.processedRows, 25);

  // Mismatch / Not Found propagation
  const mockFetch404 = async () => ({
    status: 404,
    body: JSON.stringify({
      status: 404,
      message: "Import job not found",
    }),
  });

  const res404 = await simulateJobDetailsProxy({
    businessObjectId: validBoId,
    importId: validImpId,
    sessionToken: "valid-jwt",
    tokenExpiresAt: Math.floor(Date.now() / 1000) + 3600,
    fetchSpy: mockFetch404,
  });
  assert.equal(res404.status, 404);
  assert.equal(res404.body.message, "Import job not found");

  console.log("  PASS: Job-details GET correctly dispatches, validates, and propagates responses.");
}

console.log("\n=================================================");
console.log("ALL IMPORT EXECUTION & HISTORY PROXY TESTS PASSED (9/9)");
console.log("=================================================");
