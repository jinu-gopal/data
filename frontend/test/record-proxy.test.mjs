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

// Simulates frontend/app/api/configuration/business-objects/[businessObjectId]/records routes
class RecordProxySimulator {
  constructor({ token = "mock-token", envBackendUrl = "http://localhost:8080", fetchMock } = {}) {
    this.token = token;
    this.envBackendUrl = envBackendUrl;
    this.fetchMock = fetchMock || (async () => ({ status: 200, text: async () => "[]" }));
  }

  async handleListGet(businessObjectId) {
    const errObj = validateUuidParam(businessObjectId, "businessObjectId");
    if (errObj) return errObj;

    if (!this.token) {
      return unauthorizedResponse("No access token found in session.");
    }

    const backendUrl = buildBackendUrl(
      `/api/v1/configuration/business-objects/${businessObjectId}/records`,
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

  async handleCreatePost(businessObjectId, rawBody) {
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

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return badRequestResponse("Record data must be a JSON object of field key-value pairs.");
    }

    const backendUrl = buildBackendUrl(
      `/api/v1/configuration/business-objects/${businessObjectId}/records`,
      this.envBackendUrl
    );

    const upstream = await this.fetchMock(backendUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const text = await upstream.text();
    return forwardBackendResponseSimulation(upstream.status, text);
  }

  async handleDetailGet(businessObjectId, recordId) {
    const errObj = validateUuidParam(businessObjectId, "businessObjectId");
    if (errObj) return errObj;

    const errRec = validateUuidParam(recordId, "recordId");
    if (errRec) return errRec;

    if (!this.token) {
      return unauthorizedResponse("No access token found in session.");
    }

    const backendUrl = buildBackendUrl(
      `/api/v1/configuration/business-objects/${businessObjectId}/records/${recordId}`,
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

  async handleUpdatePut(businessObjectId, recordId, rawBody) {
    const errObj = validateUuidParam(businessObjectId, "businessObjectId");
    if (errObj) return errObj;

    const errRec = validateUuidParam(recordId, "recordId");
    if (errRec) return errRec;

    if (!this.token) {
      return unauthorizedResponse("No access token found in session.");
    }

    let body;
    try {
      body = typeof rawBody === "string" ? JSON.parse(rawBody) : rawBody;
    } catch {
      return badRequestResponse("Malformed JSON request body.");
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return badRequestResponse("Record update data must be a valid JSON object.");
    }

    const backendUrl = buildBackendUrl(
      `/api/v1/configuration/business-objects/${businessObjectId}/records/${recordId}`,
      this.envBackendUrl
    );

    const upstream = await this.fetchMock(backendUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${this.token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const text = await upstream.text();
    return forwardBackendResponseSimulation(upstream.status, text);
  }

  async handleDelete(businessObjectId, recordId) {
    const errObj = validateUuidParam(businessObjectId, "businessObjectId");
    if (errObj) return errObj;

    const errRec = validateUuidParam(recordId, "recordId");
    if (errRec) return errRec;

    if (!this.token) {
      return unauthorizedResponse("No access token found in session.");
    }

    const backendUrl = buildBackendUrl(
      `/api/v1/configuration/business-objects/${businessObjectId}/records/${recordId}`,
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
console.log("Starting record proxy suite...");

const VALID_OBJ_ID = "00000000-0000-0000-0000-000000000001";
const VALID_REC_ID = "00000000-0000-0000-0000-000000000002";

// Test 1: UUID Validation for businessObjectId and recordId
{
  console.log("Test 1: Reject invalid UUID parameters");
  const proxy = new RecordProxySimulator();

  const listBad = await proxy.handleListGet("not-a-uuid");
  assert.equal(listBad.status, 400);

  const createBad = await proxy.handleCreatePost("not-a-uuid", {});
  assert.equal(createBad.status, 400);

  const detailBadObj = await proxy.handleDetailGet("bad-obj", VALID_REC_ID);
  assert.equal(detailBadObj.status, 400);

  const detailBadRec = await proxy.handleDetailGet(VALID_OBJ_ID, "bad-rec");
  assert.equal(detailBadRec.status, 400);

  const putBadRec = await proxy.handleUpdatePut(VALID_OBJ_ID, "bad-rec", {});
  assert.equal(putBadRec.status, 400);

  const delBadRec = await proxy.handleDelete(VALID_OBJ_ID, "bad-rec");
  assert.equal(delBadRec.status, 400);

  console.log("  ✓ Test 1 passed: All UUID parameters validated strictly");
}

// Test 2: Authentication Enforcement
{
  console.log("Test 2: Enforce authentication on all methods");
  const unauthProxy = new RecordProxySimulator({ token: null });

  const getRes = await unauthProxy.handleListGet(VALID_OBJ_ID);
  assert.equal(getRes.status, 401);

  const postRes = await unauthProxy.handleCreatePost(VALID_OBJ_ID, { name: "Test" });
  assert.equal(postRes.status, 401);

  const putRes = await unauthProxy.handleUpdatePut(VALID_OBJ_ID, VALID_REC_ID, { name: "Test" });
  assert.equal(putRes.status, 401);

  const delRes = await unauthProxy.handleDelete(VALID_OBJ_ID, VALID_REC_ID);
  assert.equal(delRes.status, 401);

  console.log("  ✓ Test 2 passed: 401 returned when session token is missing");
}

// Test 3: POST and PUT Body Validation
{
  console.log("Test 3: POST and PUT body validation");
  const proxy = new RecordProxySimulator();

  const badJsonRes = await proxy.handleCreatePost(VALID_OBJ_ID, "not json {");
  assert.equal(badJsonRes.status, 400);

  const arrayBodyRes = await proxy.handleCreatePost(VALID_OBJ_ID, [1, 2, 3]);
  assert.equal(arrayBodyRes.status, 400);

  const arrayPutRes = await proxy.handleUpdatePut(VALID_OBJ_ID, VALID_REC_ID, [1, 2, 3]);
  assert.equal(arrayPutRes.status, 400);

  console.log("  ✓ Test 3 passed: Body format validated strictly");
}

// Test 4: Dispatch Create POST to Backend
{
  console.log("Test 4: Dispatch create POST to backend");
  let interceptedUrl = null;
  let interceptedBody = null;

  const proxy = new RecordProxySimulator({
    fetchMock: async (url, options) => {
      interceptedUrl = url;
      interceptedBody = JSON.parse(options.body);
      return {
        status: 200,
        text: async () => JSON.stringify({
          id: VALID_REC_ID,
          businessObjectId: VALID_OBJ_ID,
          recordData: interceptedBody,
        }),
      };
    },
  });

  const res = await proxy.handleCreatePost(VALID_OBJ_ID, {
    company_name: "Acme Corp",
    customer_type: "Corporate",
  });

  assert.equal(res.status, 200);
  assert.equal(
    interceptedUrl,
    `http://localhost:8080/api/v1/configuration/business-objects/${VALID_OBJ_ID}/records`
  );
  assert.equal(interceptedBody.company_name, "Acme Corp");
  assert.equal(res.body.id, VALID_REC_ID);

  console.log("  ✓ Test 4 passed: POST forwards correctly to backend");
}

// Test 5: Dispatch Detail GET, PUT, and DELETE to Backend
{
  console.log("Test 5: Dispatch detail GET, PUT, and DELETE to backend");
  let getUrl = null;
  let putUrl = null;
  let delUrl = null;

  const proxy = new RecordProxySimulator({
    fetchMock: async (url, options) => {
      if (options.method === "GET") {
        getUrl = url;
        return {
          status: 200,
          text: async () => JSON.stringify({ id: VALID_REC_ID, recordData: { name: "Acme" } }),
        };
      }
      if (options.method === "PUT") {
        putUrl = url;
        return {
          status: 200,
          text: async () => JSON.stringify({ id: VALID_REC_ID, recordData: { name: "Updated" } }),
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

  const detailRes = await proxy.handleDetailGet(VALID_OBJ_ID, VALID_REC_ID);
  assert.equal(detailRes.status, 200);
  assert.equal(
    getUrl,
    `http://localhost:8080/api/v1/configuration/business-objects/${VALID_OBJ_ID}/records/${VALID_REC_ID}`
  );

  const putRes = await proxy.handleUpdatePut(VALID_OBJ_ID, VALID_REC_ID, { name: "Updated" });
  assert.equal(putRes.status, 200);
  assert.equal(
    putUrl,
    `http://localhost:8080/api/v1/configuration/business-objects/${VALID_OBJ_ID}/records/${VALID_REC_ID}`
  );

  const delRes = await proxy.handleDelete(VALID_OBJ_ID, VALID_REC_ID);
  assert.equal(delRes.status, 204);
  assert.equal(
    delUrl,
    `http://localhost:8080/api/v1/configuration/business-objects/${VALID_OBJ_ID}/records/${VALID_REC_ID}`
  );

  console.log("  ✓ Test 5 passed: GET, PUT, DELETE target specific record URL");
}

// Test 6: Upstream Validation Error Preservation
{
  console.log("Test 6: Preserve upstream validation error");
  const errorProxy = new RecordProxySimulator({
    fetchMock: async () => ({
      status: 400,
      text: async () => JSON.stringify({
        status: 400,
        error: "VALIDATION_ERROR",
        message: "Record validation failed",
        errors: { company_name: "Company name is required" },
      }),
    }),
  });

  const res = await errorProxy.handleCreatePost(VALID_OBJ_ID, {});
  assert.equal(res.status, 400);
  assert.equal(res.body.error, "VALIDATION_ERROR");
  assert.equal(res.body.errors.company_name, "Company name is required");

  console.log("  ✓ Test 6 passed: Upstream validation error preserved verbatim");
}

console.log("\n==========================================");
console.log("All 6 record proxy tests passed!");
console.log("==========================================");
