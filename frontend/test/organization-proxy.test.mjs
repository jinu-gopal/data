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

class OrgTenantProxySimulator {
  constructor({ token = "mock-jwt-token-12345", fetchMock = null } = {}) {
    this.token = token;
    this.fetchMock =
      fetchMock ||
      (async () => ({
        status: 200,
        text: async () => JSON.stringify({ success: true }),
      }));
  }

  async getTenants() {
    if (!this.token) return unauthorizedResponse();
    const url = buildBackendUrl("/api/v1/tenants");
    const res = await this.fetchMock(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${this.token}`, Accept: "application/json" },
    });
    return forwardBackendResponseSimulation(res.status, await res.text());
  }

  async postTenant(body) {
    if (!this.token) return unauthorizedResponse();
    if (!body || typeof body !== "object") return badRequestResponse("Request body must be a valid JSON object.");
    if (!body.tenantKey || !body.name) return badRequestResponse("tenantKey and name are required.");

    const sanitized = {
      tenantKey: body.tenantKey.trim(),
      name: body.name.trim(),
    };
    const url = buildBackendUrl("/api/v1/tenants");
    const res = await this.fetchMock(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sanitized),
    });
    return forwardBackendResponseSimulation(res.status, await res.text());
  }

  async getOrganizations(tenantId) {
    const err = validateUuidParam(tenantId, "tenantId");
    if (err) return err;
    if (!this.token) return unauthorizedResponse();

    const url = buildBackendUrl(`/api/v1/tenants/${tenantId}/organizations`);
    const res = await this.fetchMock(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${this.token}`, Accept: "application/json" },
    });
    return forwardBackendResponseSimulation(res.status, await res.text());
  }

  async postOrganization(tenantId, body) {
    const err = validateUuidParam(tenantId, "tenantId");
    if (err) return err;
    if (!this.token) return unauthorizedResponse();

    if (!body || typeof body !== "object") return badRequestResponse("Request body must be a valid JSON object.");
    if (!body.organizationKey || !body.name || !body.organizationType) {
      return badRequestResponse("organizationKey, name, and organizationType are required.");
    }

    let parentId = null;
    if (body.parentOrganizationId) {
      if (!isValidUuid(body.parentOrganizationId)) {
        return badRequestResponse("parentOrganizationId must be a valid UUID.");
      }
      parentId = body.parentOrganizationId;
    }

    const sanitized = {
      organizationKey: body.organizationKey.trim(),
      name: body.name.trim(),
      organizationType: body.organizationType.trim().toUpperCase(),
      parentOrganizationId: parentId,
    };

    const url = buildBackendUrl(`/api/v1/tenants/${tenantId}/organizations`);
    const res = await this.fetchMock(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sanitized),
    });
    return forwardBackendResponseSimulation(res.status, await res.text());
  }

  async putOrganization(tenantId, organizationId, body) {
    const tErr = validateUuidParam(tenantId, "tenantId");
    if (tErr) return tErr;
    const oErr = validateUuidParam(organizationId, "organizationId");
    if (oErr) return oErr;
    if (!this.token) return unauthorizedResponse();

    if (!body || typeof body !== "object") return badRequestResponse("Request body must be a valid JSON object.");
    if (!body.name || !body.status) return badRequestResponse("name and status are required.");

    let parentId = null;
    if (body.parentOrganizationId) {
      if (!isValidUuid(body.parentOrganizationId)) {
        return badRequestResponse("parentOrganizationId must be a valid UUID.");
      }
      parentId = body.parentOrganizationId;
    }

    const sanitized = {
      name: body.name.trim(),
      status: body.status.trim().toUpperCase(),
      organizationType: body.organizationType ? body.organizationType.trim().toUpperCase() : undefined,
      parentOrganizationId: parentId,
    };

    const url = buildBackendUrl(`/api/v1/tenants/${tenantId}/organizations/${organizationId}`);
    const res = await this.fetchMock(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${this.token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sanitized),
    });
    return forwardBackendResponseSimulation(res.status, await res.text());
  }
}

const VALID_TENANT_ID = "cf1757d5-c535-4335-939c-24908aee0209";
const VALID_ORG_ID = "ce6beb56-1a5b-48f7-b118-3a0a1ebb6c46";

console.log("=== Running Organization & Tenant Proxy Tests ===\n");

// Test 1: Tenant List Proxy
{
  console.log("Test 1: Tenant List GET proxy forwarding and auth");
  let capturedUrl = null;
  const proxy = new OrgTenantProxySimulator({
    fetchMock: async (url) => {
      capturedUrl = url;
      return {
        status: 200,
        text: async () => JSON.stringify([{ id: VALID_TENANT_ID, tenantKey: "security-test" }]),
      };
    },
  });

  const res = await proxy.getTenants();
  assert.equal(res.status, 200);
  assert.equal(capturedUrl, "http://localhost:8080/api/v1/tenants");
  assert.equal(res.body[0].tenantKey, "security-test");

  const unauthProxy = new OrgTenantProxySimulator({ token: null });
  const unauthRes = await unauthProxy.getTenants();
  assert.equal(unauthRes.status, 401);
  console.log("  ✓ Test 1 passed: Tenant GET forwards correctly and enforces auth");
}

// Test 2: Tenant POST proxy
{
  console.log("Test 2: Tenant Create POST proxy validation and payload handling");
  let capturedBody = null;
  const proxy = new OrgTenantProxySimulator({
    fetchMock: async (url, opts) => {
      capturedBody = JSON.parse(opts.body);
      return {
        status: 201,
        text: async () => JSON.stringify({ id: VALID_TENANT_ID, ...capturedBody }),
      };
    },
  });

  const res = await proxy.postTenant({ tenantKey: "  acme-corp  ", name: "  Acme Corporation  " });
  assert.equal(res.status, 201);
  assert.equal(capturedBody.tenantKey, "acme-corp");
  assert.equal(capturedBody.name, "Acme Corporation");

  const missingKeyRes = await proxy.postTenant({ tenantKey: "", name: "Acme" });
  assert.equal(missingKeyRes.status, 400);
  console.log("  ✓ Test 2 passed: Tenant POST trims and validates required fields");
}

// Test 3: Organization GET proxy with UUID validation
{
  console.log("Test 3: Organization GET proxy parameter validation");
  const proxy = new OrgTenantProxySimulator({
    fetchMock: async (url) => ({
      status: 200,
      text: async () => JSON.stringify([{ id: VALID_ORG_ID, name: "Hospital Division" }]),
    }),
  });

  const badUuidRes = await proxy.getOrganizations("not-a-uuid");
  assert.equal(badUuidRes.status, 400);
  assert.equal(badUuidRes.body.error, "BAD_REQUEST");

  const goodRes = await proxy.getOrganizations(VALID_TENANT_ID);
  assert.equal(goodRes.status, 200);
  assert.equal(goodRes.body[0].name, "Hospital Division");
  console.log("  ✓ Test 3 passed: UUID parameter validation protects backend from malformed IDs");
}

// Test 4: Organization Create POST with hierarchy parent UUID validation
{
  console.log("Test 4: Organization POST proxy with optional parent ID");
  let capturedBody = null;
  const proxy = new OrgTenantProxySimulator({
    fetchMock: async (url, opts) => {
      capturedBody = JSON.parse(opts.body);
      return {
        status: 201,
        text: async () => JSON.stringify({ id: "11111111-2222-3333-4444-555555555555", ...capturedBody }),
      };
    },
  });

  // Invalid parent UUID rejected
  const badParentRes = await proxy.postOrganization(VALID_TENANT_ID, {
    organizationKey: "sub-org",
    name: "Sub Org",
    organizationType: "DEPARTMENT",
    parentOrganizationId: "invalid-parent",
  });
  assert.equal(badParentRes.status, 400);

  // Valid parent UUID accepted
  const validRes = await proxy.postOrganization(VALID_TENANT_ID, {
    organizationKey: "finance-dept",
    name: "Finance Department",
    organizationType: "department",
    parentOrganizationId: VALID_ORG_ID,
  });
  assert.equal(validRes.status, 201);
  assert.equal(capturedBody.organizationKey, "finance-dept");
  assert.equal(capturedBody.organizationType, "DEPARTMENT");
  assert.equal(capturedBody.parentOrganizationId, VALID_ORG_ID);
  console.log("  ✓ Test 4 passed: Organization POST validates hierarchy links and normalizes types");
}

// Test 5: Organization Update PUT
{
  console.log("Test 5: Organization PUT updates name and status");
  let capturedBody = null;
  const proxy = new OrgTenantProxySimulator({
    fetchMock: async (url, opts) => {
      capturedBody = JSON.parse(opts.body);
      return {
        status: 200,
        text: async () => JSON.stringify({ id: VALID_ORG_ID, ...capturedBody }),
      };
    },
  });

  const res = await proxy.putOrganization(VALID_TENANT_ID, VALID_ORG_ID, {
    name: "Renamed Org",
    status: "active",
  });
  assert.equal(res.status, 200);
  assert.equal(capturedBody.name, "Renamed Org");
  assert.equal(capturedBody.status, "ACTIVE");
  console.log("  ✓ Test 5 passed: Organization PUT updates and normalizes status");
}

console.log("\n=============================================");
console.log("All 5 Organization & Tenant proxy tests passed!");
console.log("=============================================");
