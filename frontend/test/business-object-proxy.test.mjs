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

// Simulates frontend/app/api/configuration/business-objects and [businessObjectId] routes
class BusinessObjectProxySimulator {
  constructor({ token = "mock-token", envBackendUrl = "http://localhost:8080", fetchMock } = {}) {
    this.token = token;
    this.envBackendUrl = envBackendUrl;
    this.fetchMock = fetchMock || (async () => ({ status: 200, text: async () => "[]" }));
  }

  async handleListGet() {
    if (!this.token) {
      return unauthorizedResponse("No access token found in session.");
    }

    const backendUrl = buildBackendUrl(
      "/api/v1/configuration/business-objects",
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

  async handleCreatePost(rawBody) {
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
      typeof payload.objectKey !== "string" ||
      !payload.objectKey.trim() ||
      typeof payload.name !== "string" ||
      !payload.name.trim()
    ) {
      return badRequestResponse("objectKey and name are required.");
    }

    const backendUrl = buildBackendUrl(
      "/api/v1/configuration/business-objects",
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

  async handleDetailGet(businessObjectId) {
    const errObj = validateUuidParam(businessObjectId, "businessObjectId");
    if (errObj) return errObj;

    if (!this.token) {
      return unauthorizedResponse("No access token found in session.");
    }

    const backendUrl = buildBackendUrl(
      `/api/v1/configuration/business-objects/${businessObjectId}`,
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

  async handleUpdatePut(businessObjectId, rawBody) {
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

    const backendUrl = buildBackendUrl(
      `/api/v1/configuration/business-objects/${businessObjectId}`,
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

  async handlePublishPost(businessObjectId) {
    const errObj = validateUuidParam(businessObjectId, "businessObjectId");
    if (errObj) return errObj;

    if (!this.token) {
      return unauthorizedResponse("No access token found in session.");
    }

    const backendUrl = buildBackendUrl(
      `/api/v1/configuration/business-objects/${businessObjectId}/publish`,
      this.envBackendUrl
    );

    const upstream = await this.fetchMock(backendUrl, {
      method: "POST",
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
console.log("Starting business object proxy suite...");

const VALID_OBJ_ID = "00000000-0000-0000-0000-000000000001";

// Test 1: UUID Validation for businessObjectId
{
  console.log("Test 1: Reject invalid UUID parameters");
  const proxy = new BusinessObjectProxySimulator();

  const getBad = await proxy.handleDetailGet("bad-uuid");
  assert.equal(getBad.status, 400);

  const putBad = await proxy.handleUpdatePut("bad-uuid", {});
  assert.equal(putBad.status, 400);

  const publishBad = await proxy.handlePublishPost("bad-uuid");
  assert.equal(publishBad.status, 400);

  console.log("  ✓ Test 1 passed: UUID parameter validated strictly");
}

// Test 2: Authentication Enforcement
{
  console.log("Test 2: Enforce authentication on all methods");
  const unauthProxy = new BusinessObjectProxySimulator({ token: null });

  const listRes = await unauthProxy.handleListGet();
  assert.equal(listRes.status, 401);

  const getRes = await unauthProxy.handleDetailGet(VALID_OBJ_ID);
  assert.equal(getRes.status, 401);

  const postRes = await unauthProxy.handleCreatePost({ objectKey: "test", name: "Test" });
  assert.equal(postRes.status, 401);

  const putRes = await unauthProxy.handleUpdatePut(VALID_OBJ_ID, { name: "Test" });
  assert.equal(putRes.status, 401);

  console.log("  ✓ Test 2 passed: 401 returned when session token is missing");
}

// Test 3: POST Body Validation
{
  console.log("Test 3: POST body validation");
  const proxy = new BusinessObjectProxySimulator();

  const missingKeyRes = await proxy.handleCreatePost({ name: "Test" });
  assert.equal(missingKeyRes.status, 400);
  assert.match(missingKeyRes.body.message, /objectKey and name are required/);

  const missingNameRes = await proxy.handleCreatePost({ objectKey: "test" });
  assert.equal(missingNameRes.status, 400);

  console.log("  ✓ Test 3 passed: POST body validated strictly");
}

// Test 4: Dispatch GET and POST to Backend
{
  console.log("Test 4: Dispatch GET and POST to backend");
  let listUrl = null;
  let detailUrl = null;
  let postUrl = null;

  const proxy = new BusinessObjectProxySimulator({
    fetchMock: async (url, options) => {
      if (options.method === "GET" && url.endsWith("/business-objects")) {
        listUrl = url;
        return { status: 200, text: async () => JSON.stringify([{ id: VALID_OBJ_ID, name: "Customer" }]) };
      }
      if (options.method === "GET" && url.includes(VALID_OBJ_ID)) {
        detailUrl = url;
        return { status: 200, text: async () => JSON.stringify({ id: VALID_OBJ_ID, name: "Customer" }) };
      }
      if (options.method === "POST") {
        postUrl = url;
        return { status: 201, text: async () => JSON.stringify({ id: VALID_OBJ_ID, name: "Vendor" }) };
      }
      return { status: 200, text: async () => "{}" };
    },
  });

  const listRes = await proxy.handleListGet();
  assert.equal(listRes.status, 200);
  assert.equal(listUrl, "http://localhost:8080/api/v1/configuration/business-objects");

  const detailRes = await proxy.handleDetailGet(VALID_OBJ_ID);
  assert.equal(detailRes.status, 200);
  assert.equal(detailUrl, `http://localhost:8080/api/v1/configuration/business-objects/${VALID_OBJ_ID}`);

  const postRes = await proxy.handleCreatePost({ objectKey: "vendor", name: "Vendor" });
  assert.equal(postRes.status, 201);
  assert.equal(postUrl, "http://localhost:8080/api/v1/configuration/business-objects");

  console.log("  ✓ Test 4 passed: GET and POST forward to backend correctly");
}

// Test 5: Upstream Error Preservation (404, 409 Conflict)
{
  console.log("Test 5: Preserve upstream errors");

  const notFoundProxy = new BusinessObjectProxySimulator({
    fetchMock: async () => ({
      status: 404,
      text: async () => JSON.stringify({
        status: 404,
        error: "NOT_FOUND",
        message: "Business object not found",
      }),
    }),
  });

  const notFoundRes = await notFoundProxy.handleDetailGet(VALID_OBJ_ID);
  assert.equal(notFoundRes.status, 404);
  assert.equal(notFoundRes.body.message, "Business object not found");

  const conflictProxy = new BusinessObjectProxySimulator({
    fetchMock: async () => ({
      status: 409,
      text: async () => JSON.stringify({
        status: 409,
        error: "CONFLICT",
        message: "Only DRAFT business objects can be updated",
      }),
    }),
  });

  const conflictRes = await conflictProxy.handleUpdatePut(VALID_OBJ_ID, { name: "New Name" });
  assert.equal(conflictRes.status, 409);
  assert.match(conflictRes.body.message, /Only DRAFT business objects can be updated/);

  console.log("  ✓ Test 5 passed: 404 and 409 errors preserved verbatim");
}

// Test 6: Publish Business Object Proxy Flow
{
  console.log("Test 6: Publish business object flow and error propagation");
  let interceptedUrl = null;
  let interceptedMethod = null;

  const proxy = new BusinessObjectProxySimulator({
    fetchMock: async (url, options) => {
      interceptedUrl = url;
      interceptedMethod = options.method;
      return {
        status: 200,
        text: async () => JSON.stringify({
          id: VALID_OBJ_ID,
          name: "Customer",
          status: "PUBLISHED",
        }),
      };
    },
  });

  const res = await proxy.handlePublishPost(VALID_OBJ_ID);
  assert.equal(res.status, 200);
  assert.equal(interceptedMethod, "POST");
  assert.equal(
    interceptedUrl,
    `http://localhost:8080/api/v1/configuration/business-objects/${VALID_OBJ_ID}/publish`
  );
  assert.equal(res.body.status, "PUBLISHED");

  const unauthProxy = new BusinessObjectProxySimulator({ token: null });
  const unauthRes = await unauthProxy.handlePublishPost(VALID_OBJ_ID);
  assert.equal(unauthRes.status, 401);

  const badUuidRes = await proxy.handlePublishPost("bad-id");
  assert.equal(badUuidRes.status, 400);

  const noFieldsProxy = new BusinessObjectProxySimulator({
    fetchMock: async () => ({
      status: 400,
      text: async () => JSON.stringify({
        status: 400,
        error: "BAD_REQUEST",
        message: "Cannot publish a business object without any configured fields",
      }),
    }),
  });

  const noFieldsRes = await noFieldsProxy.handlePublishPost(VALID_OBJ_ID);
  assert.equal(noFieldsRes.status, 400);
  assert.match(noFieldsRes.body.message, /without any configured fields/);

  console.log("  ✓ Test 6 passed: Publish endpoint forwards correctly and preserves auth/validation");
}

console.log("\n==========================================");
console.log("All 6 business object proxy tests passed!");
console.log("==========================================");

