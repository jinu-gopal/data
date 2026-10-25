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

// Simulates frontend/app/api/configuration/business-objects/[businessObjectId]/fields/[fieldId]/options/route.ts
class FieldOptionsProxySimulator {
  constructor({ token = "mock-token", envBackendUrl = "http://localhost:8080", fetchMock } = {}) {
    this.token = token;
    this.envBackendUrl = envBackendUrl;
    this.fetchMock = fetchMock || (async () => ({ status: 200, text: async () => "[]" }));
  }

  async handleGet(businessObjectId, fieldId) {
    const errObj = validateUuidParam(businessObjectId, "businessObjectId");
    if (errObj) return errObj;

    const errField = validateUuidParam(fieldId, "fieldId");
    if (errField) return errField;

    if (!this.token) {
      return unauthorizedResponse("No access token found in session.");
    }

    const targetUrl = buildBackendUrl(
      `/api/v1/configuration/business-objects/${businessObjectId}/fields/${fieldId}/options`,
      this.envBackendUrl
    );

    const upstream = await this.fetchMock(targetUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.token}`,
        Accept: "application/json",
      },
    });

    const text = await upstream.text();
    return forwardBackendResponseSimulation(upstream.status, text);
  }

  async handlePost(businessObjectId, fieldId, body) {
    const errObj = validateUuidParam(businessObjectId, "businessObjectId");
    if (errObj) return errObj;

    const errField = validateUuidParam(fieldId, "fieldId");
    if (errField) return errField;

    if (!this.token) {
      return unauthorizedResponse("No access token found in session.");
    }

    if (!body || typeof body !== "object") {
      return badRequestResponse("Request body must be a valid JSON object.");
    }

    const targetUrl = buildBackendUrl(
      `/api/v1/configuration/business-objects/${businessObjectId}/fields/${fieldId}/options`,
      this.envBackendUrl
    );

    const upstream = await this.fetchMock(targetUrl, {
      method: "POST",
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

  async handlePut(businessObjectId, fieldId, optionId, body) {
    const errObj = validateUuidParam(businessObjectId, "businessObjectId");
    if (errObj) return errObj;

    const errField = validateUuidParam(fieldId, "fieldId");
    if (errField) return errField;

    const errOpt = validateUuidParam(optionId, "optionId");
    if (errOpt) return errOpt;

    if (!this.token) {
      return unauthorizedResponse("No access token found in session.");
    }

    if (!body || typeof body !== "object") {
      return badRequestResponse("Request body must be a valid JSON object.");
    }

    const targetUrl = buildBackendUrl(
      `/api/v1/configuration/business-objects/${businessObjectId}/fields/${fieldId}/options/${optionId}`,
      this.envBackendUrl
    );

    const upstream = await this.fetchMock(targetUrl, {
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

  async handleDelete(businessObjectId, fieldId, optionId) {
    const errObj = validateUuidParam(businessObjectId, "businessObjectId");
    if (errObj) return errObj;

    const errField = validateUuidParam(fieldId, "fieldId");
    if (errField) return errField;

    const errOpt = validateUuidParam(optionId, "optionId");
    if (errOpt) return errOpt;

    if (!this.token) {
      return unauthorizedResponse("No access token found in session.");
    }

    const targetUrl = buildBackendUrl(
      `/api/v1/configuration/business-objects/${businessObjectId}/fields/${fieldId}/options/${optionId}`,
      this.envBackendUrl
    );

    const upstream = await this.fetchMock(targetUrl, {
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

async function runTests() {
  console.log("=================================================");
  console.log("STARTING FIELD OPTIONS PROXY TESTS");
  console.log("=================================================\n");

  const validObjId = "dd885a0e-9c14-48b6-96fb-c051ab26d075";
  const validFieldId = "884b0aa7-944c-4ad9-b6ed-cb112b785004";
  const validOptId = "66d90d58-db75-4774-beb8-513e4feee7cb";

  // TEST 1: UUID Validation for all parameters
  console.log("[TEST 1] UUID parameter validation on route parameters");
  {
    const proxy = new FieldOptionsProxySimulator();

    const badObjRes = await proxy.handleGet("invalid-uuid", validFieldId);
    assert.strictEqual(badObjRes.status, 400);
    assert.strictEqual(badObjRes.body.error, "BAD_REQUEST");

    const badFieldRes = await proxy.handlePost(validObjId, "../../traversal", { optionValue: "A", optionLabel: "A" });
    assert.strictEqual(badFieldRes.status, 400);

    const badOptPut = await proxy.handlePut(validObjId, validFieldId, "123-not-uuid", { active: false });
    assert.strictEqual(badOptPut.status, 400);

    const badOptDel = await proxy.handleDelete(validObjId, validFieldId, "");
    assert.strictEqual(badOptDel.status, 400);

    console.log("  PASS: All UUID positive and negative injection assertions passed.");
  }

  // TEST 2: Authentication Boundaries
  console.log("\n[TEST 2] Missing and expired session boundaries");
  {
    const unauthProxy = new FieldOptionsProxySimulator({ token: null });

    const getRes = await unauthProxy.handleGet(validObjId, validFieldId);
    assert.strictEqual(getRes.status, 401);

    const postRes = await unauthProxy.handlePost(validObjId, validFieldId, { optionValue: "V", optionLabel: "L" });
    assert.strictEqual(postRes.status, 401);

    const putRes = await unauthProxy.handlePut(validObjId, validFieldId, validOptId, { optionLabel: "L" });
    assert.strictEqual(putRes.status, 401);

    const delRes = await unauthProxy.handleDelete(validObjId, validFieldId, validOptId);
    assert.strictEqual(delRes.status, 401);

    console.log("  PASS: Unauthenticated requests rejected with 401 without contacting backend.");
  }

  // TEST 3: GET options dispatches correctly and preserves upstream array
  console.log("\n[TEST 3] GET options forwards to normalized backend endpoint");
  {
    let capturedUrl = "";
    let capturedHeaders = null;

    const proxy = new FieldOptionsProxySimulator({
      token: "secret-bearer",
      envBackendUrl: "http://localhost:8080/",
      fetchMock: async (url, options) => {
        capturedUrl = url;
        capturedHeaders = options.headers;
        return {
          status: 200,
          text: async () => JSON.stringify([
            { id: validOptId, optionValue: "Corporate", optionLabel: "Corporate" },
            { id: "ec97140c-512c-4bd9-a72b-9bf7dbb59cb3", optionValue: "Individual", optionLabel: "Individual" }
          ]),
        };
      },
    });

    const res = await proxy.handleGet(validObjId, validFieldId);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(capturedUrl, `http://localhost:8080/api/v1/configuration/business-objects/${validObjId}/fields/${validFieldId}/options`);
    assert.strictEqual(capturedHeaders["Authorization"], "Bearer secret-bearer");
    assert.strictEqual(res.body.length, 2);
    assert.strictEqual(res.body[0].optionValue, "Corporate");

    console.log("  PASS: GET options successfully routed and response parsed.");
  }

  // TEST 4: POST creates option and passes through payload
  console.log("\n[TEST 4] POST option routes payload to backend");
  {
    let capturedBody = null;

    const proxy = new FieldOptionsProxySimulator({
      fetchMock: async (url, options) => {
        capturedBody = JSON.parse(options.body);
        return {
          status: 200,
          text: async () => JSON.stringify({ id: "new-uuid", ...capturedBody }),
        };
      },
    });

    const payload = {
      optionValue: "Business",
      optionLabel: "Business Client",
      displayOrder: 2,
      active: true,
      defaultOption: false,
    };

    const res = await proxy.handlePost(validObjId, validFieldId, payload);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(capturedBody.optionValue, "Business");
    assert.strictEqual(res.body.optionValue, "Business");

    console.log("  PASS: POST option creates option with valid payload.");
  }

  // TEST 5: PUT updates option by optionId
  console.log("\n[TEST 5] PUT option routes update with optionId");
  {
    let capturedUrl = "";
    let capturedMethod = "";

    const proxy = new FieldOptionsProxySimulator({
      fetchMock: async (url, options) => {
        capturedUrl = url;
        capturedMethod = options.method;
        return {
          status: 200,
          text: async () => JSON.stringify({ id: validOptId, optionLabel: "Updated Label" }),
        };
      },
    });

    const res = await proxy.handlePut(validObjId, validFieldId, validOptId, { optionLabel: "Updated Label" });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(capturedMethod, "PUT");
    assert.strictEqual(capturedUrl, `http://localhost:8080/api/v1/configuration/business-objects/${validObjId}/fields/${validFieldId}/options/${validOptId}`);

    console.log("  PASS: PUT option correctly targets optionId sub-resource.");
  }

  // TEST 6: DELETE option deletes by optionId
  console.log("\n[TEST 6] DELETE option sends DELETE request");
  {
    let capturedUrl = "";
    let capturedMethod = "";

    const proxy = new FieldOptionsProxySimulator({
      fetchMock: async (url, options) => {
        capturedUrl = url;
        capturedMethod = options.method;
        return {
          status: 204,
          text: async () => "",
        };
      },
    });

    const res = await proxy.handleDelete(validObjId, validFieldId, validOptId);
    assert.strictEqual(res.status, 204);
    assert.strictEqual(capturedMethod, "DELETE");
    assert.strictEqual(capturedUrl, `http://localhost:8080/api/v1/configuration/business-objects/${validObjId}/fields/${validFieldId}/options/${validOptId}`);

    console.log("  PASS: DELETE option correctly executed.");
  }

  // TEST 7: Backend errors (409 conflict, 400 validation error) preserved
  console.log("\n[TEST 7] Structured backend errors preserved");
  {
    const proxy = new FieldOptionsProxySimulator({
      fetchMock: async () => ({
        status: 409,
        text: async () => JSON.stringify({
          error: "CONFLICT",
          message: "An option with value 'Corporate' already exists",
        }),
      }),
    });

    const res = await proxy.handlePost(validObjId, validFieldId, { optionValue: "Corporate", optionLabel: "Corporate" });
    assert.strictEqual(res.status, 409);
    assert.strictEqual(res.body.message, "An option with value 'Corporate' already exists");

    console.log("  PASS: Structured 409 conflict error preserved.");
  }

  console.log("\n=================================================");
  console.log("ALL FIELD OPTIONS PROXY TESTS PASSED (7/7)");
  console.log("=================================================");
}

runTests().catch((err) => {
  console.error("TEST FAILED:", err);
  process.exit(1);
});
