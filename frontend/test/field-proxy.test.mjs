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

// Simulates frontend/app/api/configuration/business-objects/[businessObjectId]/fields/route.ts
class FieldProxySimulator {
  constructor({ token = "mock-token", envBackendUrl = "http://localhost:8080", fetchMock } = {}) {
    this.token = token;
    this.envBackendUrl = envBackendUrl;
    this.fetchMock = fetchMock || (async () => ({ status: 200, text: async () => "[]" }));
  }

  async handleGet(businessObjectId) {
    const errObj = validateUuidParam(businessObjectId, "businessObjectId");
    if (errObj) return errObj;

    if (!this.token) {
      return unauthorizedResponse("No access token found in session.");
    }

    const backendUrl = buildBackendUrl(
      `/api/v1/configuration/business-objects/${businessObjectId}/fields`,
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

  async handlePost(businessObjectId, rawBody) {
    const errObj = validateUuidParam(businessObjectId, "businessObjectId");
    if (errObj) return errObj;

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

    if (
      typeof payload.fieldKey !== "string" ||
      !payload.fieldKey.trim() ||
      typeof payload.label !== "string" ||
      !payload.label.trim() ||
      typeof payload.fieldType !== "string" ||
      !payload.fieldType.trim()
    ) {
      return badRequestResponse("fieldKey, label, and fieldType are required.");
    }

    const backendUrl = buildBackendUrl(
      `/api/v1/configuration/business-objects/${businessObjectId}/fields`,
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

  async handlePut(businessObjectId, fieldId, rawBody) {
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

    const backendUrl = buildBackendUrl(
      `/api/v1/configuration/business-objects/${businessObjectId}/fields/${fieldId}`,
      this.envBackendUrl
    );

    const upstream = await this.fetchMock(backendUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    const text = await upstream.text();
    return forwardBackendResponseSimulation(upstream.status, text);
  }

  async handleDelete(businessObjectId, fieldId) {
    const errObj = validateUuidParam(businessObjectId, "businessObjectId");
    if (errObj) return errObj;

    const errField = validateUuidParam(fieldId, "fieldId");
    if (errField) return errField;

    if (!this.token) {
      return unauthorizedResponse("No access token found in session.");
    }

    const backendUrl = buildBackendUrl(
      `/api/v1/configuration/business-objects/${businessObjectId}/fields/${fieldId}`,
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
console.log("Starting field proxy suite...");

const VALID_OBJ_ID = "00000000-0000-0000-0000-000000000001";
const VALID_FIELD_ID = "00000000-0000-0000-0000-000000000002";

// Test 1: UUID Validation for businessObjectId and fieldId
{
  console.log("Test 1: Reject invalid UUID parameters in GET, POST, PUT, DELETE");
  const proxy = new FieldProxySimulator();

  const getBadObj = await proxy.handleGet("invalid-uuid");
  assert.equal(getBadObj.status, 400);
  assert.equal(getBadObj.body.error, "BAD_REQUEST");

  const postBadObj = await proxy.handlePost("not-a-uuid", {});
  assert.equal(postBadObj.status, 400);

  const putBadField = await proxy.handlePut(VALID_OBJ_ID, "bad-field", {});
  assert.equal(putBadField.status, 400);

  const delBadField = await proxy.handleDelete(VALID_OBJ_ID, "bad-field");
  assert.equal(delBadField.status, 400);

  console.log("  ✓ Test 1 passed: UUID parameters validated strictly");
}

// Test 2: Authentication Enforcement
{
  console.log("Test 2: Enforce authentication on all methods");
  const unauthProxy = new FieldProxySimulator({ token: null });

  const getRes = await unauthProxy.handleGet(VALID_OBJ_ID);
  assert.equal(getRes.status, 401);

  const postRes = await unauthProxy.handlePost(VALID_OBJ_ID, {
    fieldKey: "test", label: "Test", fieldType: "TEXT",
  });
  assert.equal(postRes.status, 401);

  const putRes = await unauthProxy.handlePut(VALID_OBJ_ID, VALID_FIELD_ID, { label: "Test" });
  assert.equal(putRes.status, 401);

  const delRes = await unauthProxy.handleDelete(VALID_OBJ_ID, VALID_FIELD_ID);
  assert.equal(delRes.status, 401);

  console.log("  ✓ Test 2 passed: 401 returned when session token is missing");
}

// Test 3: POST Body Validation
{
  console.log("Test 3: POST body validation");
  const proxy = new FieldProxySimulator();

  // Missing required fields
  const missingKeyRes = await proxy.handlePost(VALID_OBJ_ID, {
    label: "Test", fieldType: "TEXT",
  });
  assert.equal(missingKeyRes.status, 400);
  assert.match(missingKeyRes.body.message, /fieldKey, label, and fieldType are required/);

  const missingTypeRes = await proxy.handlePost(VALID_OBJ_ID, {
    fieldKey: "test", label: "Test",
  });
  assert.equal(missingTypeRes.status, 400);

  console.log("  ✓ Test 3 passed: POST body validated strictly");
}

// Test 4: Dispatch POST to Backend
{
  console.log("Test 4: Dispatch POST to backend");
  let interceptedUrl = null;
  let interceptedBody = null;

  const proxy = new FieldProxySimulator({
    fetchMock: async (url, options) => {
      interceptedUrl = url;
      interceptedBody = JSON.parse(options.body);
      return {
        status: 200,
        text: async () => JSON.stringify({
          id: VALID_FIELD_ID,
          fieldKey: interceptedBody.fieldKey,
          label: interceptedBody.label,
          fieldType: interceptedBody.fieldType,
        }),
      };
    },
  });

  const res = await proxy.handlePost(VALID_OBJ_ID, {
    fieldKey: "vat_number",
    label: "VAT Number",
    fieldType: "TEXT",
  });

  assert.equal(res.status, 200);
  assert.equal(
    interceptedUrl,
    `http://localhost:8080/api/v1/configuration/business-objects/${VALID_OBJ_ID}/fields`
  );
  assert.equal(interceptedBody.fieldKey, "vat_number");
  assert.equal(res.body.id, VALID_FIELD_ID);

  console.log("  ✓ Test 4 passed: POST forwards correctly to backend");
}

// Test 5: Dispatch PUT and DELETE to Backend
{
  console.log("Test 5: Dispatch PUT and DELETE to backend");
  let putUrl = null;
  let delUrl = null;

  const proxy = new FieldProxySimulator({
    fetchMock: async (url, options) => {
      if (options.method === "PUT") {
        putUrl = url;
        return {
          status: 200,
          text: async () => JSON.stringify({ id: VALID_FIELD_ID, label: "Updated" }),
        };
      }
      if (options.method === "DELETE") {
        delUrl = url;
        return {
          status: 204,
          text: async () => "",
        };
      }
      return { status: 200, text: async () => "{}" };
    },
  });

  const putRes = await proxy.handlePut(VALID_OBJ_ID, VALID_FIELD_ID, { label: "Updated" });
  assert.equal(putRes.status, 200);
  assert.equal(
    putUrl,
    `http://localhost:8080/api/v1/configuration/business-objects/${VALID_OBJ_ID}/fields/${VALID_FIELD_ID}`
  );

  const delRes = await proxy.handleDelete(VALID_OBJ_ID, VALID_FIELD_ID);
  assert.equal(delRes.status, 204);
  assert.equal(
    delUrl,
    `http://localhost:8080/api/v1/configuration/business-objects/${VALID_OBJ_ID}/fields/${VALID_FIELD_ID}`
  );

  console.log("  ✓ Test 5 passed: PUT and DELETE forward to backend correctly");
}

// Test 6: Upstream Conflict Preservation
{
  console.log("Test 6: Preserve upstream 409 Conflict");
  const conflictProxy = new FieldProxySimulator({
    fetchMock: async () => ({
      status: 409,
      text: async () => JSON.stringify({
        status: 409,
        error: "CONFLICT",
        message: "Fields can only be created while the business object is in DRAFT status",
      }),
    }),
  });

  const conflictRes = await conflictProxy.handlePost(VALID_OBJ_ID, {
    fieldKey: "test", label: "Test", fieldType: "TEXT",
  });
  assert.equal(conflictRes.status, 409);
  assert.match(conflictRes.body.message, /in DRAFT status/);

  console.log("  ✓ Test 6 passed: 409 conflict preserved");
}

console.log("\n==========================================");
console.log("All 6 field proxy tests passed!");
console.log("==========================================");
