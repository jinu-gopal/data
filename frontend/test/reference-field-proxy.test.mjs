import assert from "node:assert/strict";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUuid(id) {
  if (typeof id !== "string") return false;
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

// Mirroring frontend/app/api/configuration/business-objects/[businessObjectId]/fields/[fieldId]/reference/route.ts
class ReferenceProxySimulator {
  constructor({ token = "mock-token", envBackendUrl = "http://localhost:8080", fetchMock } = {}) {
    this.token = token;
    this.envBackendUrl = envBackendUrl;
    this.fetchMock = fetchMock || (async () => ({ status: 200, text: async () => "{}" }));
  }

  async handleGet(businessObjectId, fieldId) {
    const errObj = validateUuidParam(businessObjectId, "businessObjectId");
    if (errObj) return errObj;

    const errField = validateUuidParam(fieldId, "fieldId");
    if (errField) return errField;

    if (!this.token) {
      return unauthorizedResponse("No access token found in session.");
    }

    const backendUrl = buildBackendUrl(
      `/api/v1/configuration/business-objects/${businessObjectId}/fields/${fieldId}/reference`,
      this.envBackendUrl
    );

    const upstream = await this.fetchMock(backendUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.token}`,
        Accept: "application/json",
      },
    });

    const text = await upstream.text();
    return forwardBackendResponseSimulation(upstream.status, text);
  }

  async handlePost(businessObjectId, fieldId, rawBody) {
    const errObj = validateUuidParam(businessObjectId, "businessObjectId");
    if (errObj) return errObj;

    const errField = validateUuidParam(fieldId, "fieldId");
    if (errField) return errField;

    if (!this.token) {
      return unauthorizedResponse("No access token found in session.");
    }

    let body;
    try {
      body = typeof rawBody === "string" ? JSON.parse(rawBody) : rawBody;
    } catch {
      return badRequestResponse("Malformed JSON request body.");
    }

    if (!body || typeof body !== "object") {
      return badRequestResponse("Request body must be a valid JSON object.");
    }

    const payload = body;

    const invalidTargetUuid = validateUuidParam(
      payload.targetBusinessObjectId,
      "targetBusinessObjectId"
    );
    if (invalidTargetUuid) return invalidTargetUuid;

    if (payload.displayFieldId !== null && payload.displayFieldId !== undefined) {
      const invalidDisplayFieldUuid = validateUuidParam(
        payload.displayFieldId,
        "displayFieldId"
      );
      if (invalidDisplayFieldUuid) return invalidDisplayFieldUuid;
    }

    const backendUrl = buildBackendUrl(
      `/api/v1/configuration/business-objects/${businessObjectId}/fields/${fieldId}/reference`,
      this.envBackendUrl
    );

    const upstream = await this.fetchMock(backendUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    const text = await upstream.text();
    return forwardBackendResponseSimulation(upstream.status, text);
  }

  async handlePut(businessObjectId, fieldId, referenceId, rawBody) {
    const errObj = validateUuidParam(businessObjectId, "businessObjectId");
    if (errObj) return errObj;

    const errField = validateUuidParam(fieldId, "fieldId");
    if (errField) return errField;

    const invalidRefUuid = validateUuidParam(referenceId, "referenceId");
    if (invalidRefUuid) return invalidRefUuid;

    if (!this.token) {
      return unauthorizedResponse("No access token found in session.");
    }

    let body;
    try {
      body = typeof rawBody === "string" ? JSON.parse(rawBody) : rawBody;
    } catch {
      return badRequestResponse("Malformed JSON request body.");
    }

    if (!body || typeof body !== "object") {
      return badRequestResponse("Request body must be a valid JSON object.");
    }

    const payload = body;

    const invalidTargetUuid = validateUuidParam(
      payload.targetBusinessObjectId,
      "targetBusinessObjectId"
    );
    if (invalidTargetUuid) return invalidTargetUuid;

    if (payload.displayFieldId !== null && payload.displayFieldId !== undefined) {
      const invalidDisplayFieldUuid = validateUuidParam(
        payload.displayFieldId,
        "displayFieldId"
      );
      if (invalidDisplayFieldUuid) return invalidDisplayFieldUuid;
    }

    const backendUrl = buildBackendUrl(
      `/api/v1/configuration/business-objects/${businessObjectId}/fields/${fieldId}/reference/${referenceId}`,
      this.envBackendUrl
    );

    const upstream = await this.fetchMock(backendUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    const text = await upstream.text();
    return forwardBackendResponseSimulation(upstream.status, text);
  }

  async handleDelete(businessObjectId, fieldId, referenceId) {
    const errObj = validateUuidParam(businessObjectId, "businessObjectId");
    if (errObj) return errObj;

    const errField = validateUuidParam(fieldId, "fieldId");
    if (errField) return errField;

    const invalidRefUuid = validateUuidParam(referenceId, "referenceId");
    if (invalidRefUuid) return invalidRefUuid;

    if (!this.token) {
      return unauthorizedResponse("No access token found in session.");
    }

    const backendUrl = buildBackendUrl(
      `/api/v1/configuration/business-objects/${businessObjectId}/fields/${fieldId}/reference/${referenceId}`,
      this.envBackendUrl
    );

    const upstream = await this.fetchMock(backendUrl, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${this.token}`,
        Accept: "application/json",
      },
    });

    const text = await upstream.text();
    return forwardBackendResponseSimulation(upstream.status, text);
  }
}

// -----------------------------------------------------------------------------
// Test Suite
// -----------------------------------------------------------------------------
console.log("Starting reference field proxy suite...");

const VALID_OBJ_ID = "00000000-0000-0000-0000-000000000001";
const VALID_FIELD_ID = "00000000-0000-0000-0000-000000000002";
const VALID_REF_ID = "00000000-0000-0000-0000-000000000003";
const VALID_TARGET_OBJ_ID = "00000000-0000-0000-0000-000000000004";
const VALID_DISP_FIELD_ID = "00000000-0000-0000-0000-000000000005";

// Test 1: UUID Validation for Path Parameters
{
  console.log("Test 1: Reject invalid UUID parameters in GET, POST, PUT, DELETE");
  const proxy = new ReferenceProxySimulator();

  const getBadObj = await proxy.handleGet("invalid-uuid", VALID_FIELD_ID);
  assert.equal(getBadObj.status, 400);
  assert.equal(getBadObj.body.error, "BAD_REQUEST");

  const getBadField = await proxy.handleGet(VALID_OBJ_ID, "invalid-uuid");
  assert.equal(getBadField.status, 400);

  const postBadObj = await proxy.handlePost("not-a-uuid", VALID_FIELD_ID, {});
  assert.equal(postBadObj.status, 400);

  const putBadRef = await proxy.handlePut(VALID_OBJ_ID, VALID_FIELD_ID, "bad-uuid", {});
  assert.equal(putBadRef.status, 400);

  const deleteBadRef = await proxy.handleDelete(VALID_OBJ_ID, VALID_FIELD_ID, "bad-uuid");
  assert.equal(deleteBadRef.status, 400);

  console.log("  ✓ Test 1 passed: UUID parameters validated strictly");
}

// Test 2: Authentication Enforcement
{
  console.log("Test 2: Enforce authentication on all methods");
  const unauthProxy = new ReferenceProxySimulator({ token: null });

  const getRes = await unauthProxy.handleGet(VALID_OBJ_ID, VALID_FIELD_ID);
  assert.equal(getRes.status, 401);
  assert.equal(getRes.body.error, "UNAUTHORIZED");

  const postRes = await unauthProxy.handlePost(VALID_OBJ_ID, VALID_FIELD_ID, {
    targetBusinessObjectId: VALID_TARGET_OBJ_ID,
  });
  assert.equal(postRes.status, 401);

  const putRes = await unauthProxy.handlePut(VALID_OBJ_ID, VALID_FIELD_ID, VALID_REF_ID, {
    targetBusinessObjectId: VALID_TARGET_OBJ_ID,
  });
  assert.equal(putRes.status, 401);

  const delRes = await unauthProxy.handleDelete(VALID_OBJ_ID, VALID_FIELD_ID, VALID_REF_ID);
  assert.equal(delRes.status, 401);

  console.log("  ✓ Test 2 passed: 401 returned when session token is missing");
}

// Test 3: POST Body Validation (Target & Display UUIDs)
{
  console.log("Test 3: POST body validation");
  const proxy = new ReferenceProxySimulator();

  // Invalid JSON
  const badJsonRes = await proxy.handlePost(VALID_OBJ_ID, VALID_FIELD_ID, "not json {");
  assert.equal(badJsonRes.status, 400);

  // Missing / invalid targetBusinessObjectId
  const badTargetRes = await proxy.handlePost(VALID_OBJ_ID, VALID_FIELD_ID, {
    targetBusinessObjectId: "not-a-uuid",
  });
  assert.equal(badTargetRes.status, 400);
  assert.match(badTargetRes.body.message, /targetBusinessObjectId/);

  // Invalid displayFieldId
  const badDispRes = await proxy.handlePost(VALID_OBJ_ID, VALID_FIELD_ID, {
    targetBusinessObjectId: VALID_TARGET_OBJ_ID,
    displayFieldId: "not-a-uuid",
  });
  assert.equal(badDispRes.status, 400);
  assert.match(badDispRes.body.message, /displayFieldId/);

  console.log("  ✓ Test 3 passed: POST body validated strictly");
}

// Test 4: Dispatch POST to Backend with Nullable displayFieldId
{
  console.log("Test 4: Dispatch POST to backend with valid payload");
  let interceptedUrl = null;
  let interceptedHeaders = null;
  let interceptedBody = null;

  const proxy = new ReferenceProxySimulator({
    fetchMock: async (url, options) => {
      interceptedUrl = url;
      interceptedHeaders = options.headers;
      interceptedBody = JSON.parse(options.body);
      return {
        status: 200,
        text: async () => JSON.stringify({
          id: VALID_REF_ID,
          fieldId: VALID_FIELD_ID,
          targetBusinessObjectId: VALID_TARGET_OBJ_ID,
          displayFieldId: null,
          allowMultiple: false,
          allowCreate: false,
        }),
      };
    },
  });

  const res = await proxy.handlePost(VALID_OBJ_ID, VALID_FIELD_ID, {
    targetBusinessObjectId: VALID_TARGET_OBJ_ID,
    displayFieldId: null,
    allowMultiple: false,
    allowCreate: false,
  });

  assert.equal(res.status, 200);
  assert.equal(
    interceptedUrl,
    `http://localhost:8080/api/v1/configuration/business-objects/${VALID_OBJ_ID}/fields/${VALID_FIELD_ID}/reference`
  );
  assert.equal(interceptedHeaders.Authorization, "Bearer mock-token");
  assert.equal(interceptedBody.targetBusinessObjectId, VALID_TARGET_OBJ_ID);
  assert.equal(interceptedBody.displayFieldId, null);
  assert.equal(res.body.id, VALID_REF_ID);

  console.log("  ✓ Test 4 passed: POST forwards correctly to backend");
}

// Test 5: Dispatch PUT to Backend
{
  console.log("Test 5: Dispatch PUT to backend");
  let interceptedUrl = null;
  let interceptedMethod = null;

  const proxy = new ReferenceProxySimulator({
    fetchMock: async (url, options) => {
      interceptedUrl = url;
      interceptedMethod = options.method;
      return {
        status: 200,
        text: async () => JSON.stringify({
          id: VALID_REF_ID,
          fieldId: VALID_FIELD_ID,
          targetBusinessObjectId: VALID_TARGET_OBJ_ID,
          displayFieldId: VALID_DISP_FIELD_ID,
          allowMultiple: true,
          allowCreate: true,
        }),
      };
    },
  });

  const res = await proxy.handlePut(VALID_OBJ_ID, VALID_FIELD_ID, VALID_REF_ID, {
    targetBusinessObjectId: VALID_TARGET_OBJ_ID,
    displayFieldId: VALID_DISP_FIELD_ID,
    allowMultiple: true,
    allowCreate: true,
  });

  assert.equal(res.status, 200);
  assert.equal(interceptedMethod, "PUT");
  assert.equal(
    interceptedUrl,
    `http://localhost:8080/api/v1/configuration/business-objects/${VALID_OBJ_ID}/fields/${VALID_FIELD_ID}/reference/${VALID_REF_ID}`
  );
  assert.equal(res.body.allowMultiple, true);

  console.log("  ✓ Test 5 passed: PUT forwards to specific reference resource");
}

// Test 6: Dispatch DELETE to Backend
{
  console.log("Test 6: Dispatch DELETE to backend");
  let interceptedUrl = null;
  let interceptedMethod = null;

  const proxy = new ReferenceProxySimulator({
    fetchMock: async (url, options) => {
      interceptedUrl = url;
      interceptedMethod = options.method;
      return {
        status: 204,
        text: async () => "",
      };
    },
  });

  const res = await proxy.handleDelete(VALID_OBJ_ID, VALID_FIELD_ID, VALID_REF_ID);

  assert.equal(res.status, 204);
  assert.equal(interceptedMethod, "DELETE");
  assert.equal(
    interceptedUrl,
    `http://localhost:8080/api/v1/configuration/business-objects/${VALID_OBJ_ID}/fields/${VALID_FIELD_ID}/reference/${VALID_REF_ID}`
  );
  assert.equal(res.body, null);

  console.log("  ✓ Test 6 passed: DELETE forwards with 204 response");
}

// Test 7: Upstream Error Preservation (404, 409 Conflict)
{
  console.log("Test 7: Preserve upstream backend errors (404 Not Found, 409 Conflict)");

  const notFoundProxy = new ReferenceProxySimulator({
    fetchMock: async () => ({
      status: 404,
      text: async () => JSON.stringify({
        status: 404,
        error: "Not Found",
        message: "Reference configuration not found",
      }),
    }),
  });

  const notFoundRes = await notFoundProxy.handleGet(VALID_OBJ_ID, VALID_FIELD_ID);
  assert.equal(notFoundRes.status, 404);
  assert.equal(notFoundRes.body.message, "Reference configuration not found");

  const conflictProxy = new ReferenceProxySimulator({
    fetchMock: async () => ({
      status: 409,
      text: async () => JSON.stringify({
        status: 409,
        error: "Conflict",
        message: "Reference configuration can only be changed while the business object is DRAFT",
      }),
    }),
  });

  const conflictRes = await conflictProxy.handlePost(VALID_OBJ_ID, VALID_FIELD_ID, {
    targetBusinessObjectId: VALID_TARGET_OBJ_ID,
  });
  assert.equal(conflictRes.status, 409);
  assert.match(conflictRes.body.message, /while the business object is DRAFT/);

  console.log("  ✓ Test 7 passed: 404 and 409 upstream errors preserved verbatim");
}

console.log("\n==========================================");
console.log("All 7 reference field proxy tests passed!");
console.log("==========================================");
