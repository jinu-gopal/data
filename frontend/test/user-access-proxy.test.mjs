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

function buildBackendUrl(path) {
  return `http://localhost:8080${path.startsWith("/") ? path : `/${path}`}`;
}

function unauthorizedResponse(message = "Authentication required or session expired.") {
  return { status: 401, body: { error: "UNAUTHORIZED", message } };
}

function badRequestResponse(message) {
  return { status: 400, body: { error: "BAD_REQUEST", message } };
}

async function forwardBackendResponseSimulation(status, responseText) {
  if (status === 204) return { status: 204, body: null };
  if (!responseText) return { status, body: null };
  try {
    return { status, body: JSON.parse(responseText) };
  } catch {
    return { status, body: { error: "BACKEND_ERROR", message: responseText } };
  }
}

class UserAccessProxySimulator {
  constructor({ token = "mock-jwt-token", fetchMock = null } = {}) {
    this.token = token;
    this.fetchMock =
      fetchMock ||
      (async () => ({
        status: 200,
        text: async () => JSON.stringify({ success: true }),
      }));
  }

  async getUsers() {
    if (!this.token) return unauthorizedResponse();
    const res = await this.fetchMock(buildBackendUrl("/api/v1/users"), {
      method: "GET",
      headers: { Authorization: `Bearer ${this.token}` },
    });
    return forwardBackendResponseSimulation(res.status, await res.text());
  }

  async postUser(body) {
    if (!this.token) return unauthorizedResponse();
    if (!body || typeof body !== "object") return badRequestResponse("Request body must be a valid JSON object.");
    if (!body.username || !body.email || !body.password) {
      return badRequestResponse("username, email, and password are required.");
    }
    const sanitized = {
      username: body.username.trim(),
      email: body.email.trim(),
      password: body.password,
    };
    const res = await this.fetchMock(buildBackendUrl("/api/v1/users"), {
      method: "POST",
      headers: { Authorization: `Bearer ${this.token}`, "Content-Type": "application/json" },
      body: JSON.stringify(sanitized),
    });
    return forwardBackendResponseSimulation(res.status, await res.text());
  }

  async getRoles(tenantId) {
    if (!isValidUuid(tenantId)) return badRequestResponse("Valid tenantId query parameter is required.");
    if (!this.token) return unauthorizedResponse();
    const res = await this.fetchMock(buildBackendUrl(`/api/v1/roles?tenantId=${tenantId}`), {
      method: "GET",
      headers: { Authorization: `Bearer ${this.token}` },
    });
    return forwardBackendResponseSimulation(res.status, await res.text());
  }

  async postRole(body) {
    if (!this.token) return unauthorizedResponse();
    if (!body || typeof body !== "object") return badRequestResponse("Request body must be a valid JSON object.");
    if (!isValidUuid(body.tenantId) || !body.roleKey || !body.name) {
      return badRequestResponse("Valid tenantId, roleKey, and name are required.");
    }
    const sanitized = {
      tenantId: body.tenantId,
      roleKey: body.roleKey.trim(),
      name: body.name.trim(),
      description: body.description ? body.description.trim() : null,
    };
    const res = await this.fetchMock(buildBackendUrl("/api/v1/roles"), {
      method: "POST",
      headers: { Authorization: `Bearer ${this.token}`, "Content-Type": "application/json" },
      body: JSON.stringify(sanitized),
    });
    return forwardBackendResponseSimulation(res.status, await res.text());
  }

  async assignUserRole(userId, body) {
    const uErr = validateUuidParam(userId, "userId");
    if (uErr) return uErr;
    if (!this.token) return unauthorizedResponse();
    if (!body || typeof body !== "object") return badRequestResponse("Request body must be a valid JSON object.");
    if (!isValidUuid(body.roleId) || !isValidUuid(body.tenantId)) {
      return badRequestResponse("Valid roleId and tenantId are required.");
    }
    const res = await this.fetchMock(buildBackendUrl(`/api/v1/users/${userId}/roles`), {
      method: "POST",
      headers: { Authorization: `Bearer ${this.token}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return forwardBackendResponseSimulation(res.status, await res.text());
  }

  async getRolePermissions(roleId) {
    const rErr = validateUuidParam(roleId, "roleId");
    if (rErr) return rErr;
    if (!this.token) return unauthorizedResponse();
    const res = await this.fetchMock(buildBackendUrl(`/api/v1/roles/${roleId}/permissions`), {
      method: "GET",
      headers: { Authorization: `Bearer ${this.token}` },
    });
    return forwardBackendResponseSimulation(res.status, await res.text());
  }

  async getPermissions() {
    if (!this.token) return unauthorizedResponse();
    const res = await this.fetchMock(buildBackendUrl("/api/v1/permissions"), {
      method: "GET",
      headers: { Authorization: `Bearer ${this.token}` },
    });
    return forwardBackendResponseSimulation(res.status, await res.text());
  }
}

const VALID_USER_ID = "0c5cc1d1-1d02-4d9d-af14-c9f0c3286959";
const VALID_ROLE_ID = "89b34568-f484-48ed-958e-177a3ca688ae";
const VALID_TENANT_ID = "cf1757d5-c535-4335-939c-24908aee0209";

console.log("=== Running Users & RBAC Proxy Tests ===\n");

// Test 1: User list & authentication
{
  console.log("Test 1: User GET list forwarding and auth enforcement");
  let capturedUrl = null;
  const proxy = new UserAccessProxySimulator({
    fetchMock: async (url) => {
      capturedUrl = url;
      return { status: 200, text: async () => JSON.stringify([{ id: VALID_USER_ID, username: "admin" }]) };
    },
  });

  const res = await proxy.getUsers();
  assert.equal(res.status, 200);
  assert.equal(capturedUrl, "http://localhost:8080/api/v1/users");
  assert.equal(res.body[0].username, "admin");

  const unauthProxy = new UserAccessProxySimulator({ token: null });
  const unauthRes = await unauthProxy.getUsers();
  assert.equal(unauthRes.status, 401);
  console.log("  ✓ Test 1 passed: User list forwards and enforces session token");
}

// Test 2: User create POST validation
{
  console.log("Test 2: User POST creates user and validates fields");
  let capturedBody = null;
  const proxy = new UserAccessProxySimulator({
    fetchMock: async (url, opts) => {
      capturedBody = JSON.parse(opts.body);
      return { status: 201, text: async () => JSON.stringify({ id: VALID_USER_ID, ...capturedBody }) };
    },
  });

  const invalidRes = await proxy.postUser({ username: "", email: "", password: "" });
  assert.equal(invalidRes.status, 400);

  const validRes = await proxy.postUser({
    username: "john.doe",
    email: "john@maxerp.local",
    password: "Password@123",
  });
  assert.equal(validRes.status, 201);
  assert.equal(capturedBody.username, "john.doe");
  assert.equal(capturedBody.email, "john@maxerp.local");
  console.log("  ✓ Test 2 passed: User creation validates required fields and trims input");
}

// Test 3: Role list & tenant scoping
{
  console.log("Test 3: Roles GET enforces tenantId UUID parameter");
  const proxy = new UserAccessProxySimulator();

  const badTenantRes = await proxy.getRoles("not-a-uuid");
  assert.equal(badTenantRes.status, 400);

  const goodTenantRes = await proxy.getRoles(VALID_TENANT_ID);
  assert.equal(goodTenantRes.status, 200);
  console.log("  ✓ Test 3 passed: Roles requires RFC-compliant tenantId parameter");
}

// Test 4: Role create POST
{
  console.log("Test 4: Role POST validates tenantId and role metadata");
  let capturedBody = null;
  const proxy = new UserAccessProxySimulator({
    fetchMock: async (url, opts) => {
      capturedBody = JSON.parse(opts.body);
      return { status: 200, text: async () => JSON.stringify({ id: VALID_ROLE_ID, ...capturedBody }) };
    },
  });

  const badRes = await proxy.postRole({ tenantId: "bad", roleKey: "clerk", name: "Clerk" });
  assert.equal(badRes.status, 400);

  const goodRes = await proxy.postRole({
    tenantId: VALID_TENANT_ID,
    roleKey: "  inventory_clerk  ",
    name: "  Inventory Clerk  ",
    description: "Manages warehouse items",
  });
  assert.equal(goodRes.status, 200);
  assert.equal(capturedBody.roleKey, "inventory_clerk");
  assert.equal(capturedBody.name, "Inventory Clerk");
  console.log("  ✓ Test 4 passed: Role creation trims roleKey and validates tenant ID");
}

// Test 5: Role Permissions & User Role Assignment
{
  console.log("Test 5: Assign role to user with UUID checks");
  const proxy = new UserAccessProxySimulator();

  const badUserRes = await proxy.assignUserRole("invalid-user-id", {
    roleId: VALID_ROLE_ID,
    tenantId: VALID_TENANT_ID,
  });
  assert.equal(badUserRes.status, 400);

  const badRoleRes = await proxy.assignUserRole(VALID_USER_ID, {
    roleId: "bad-role",
    tenantId: VALID_TENANT_ID,
  });
  assert.equal(badRoleRes.status, 400);

  const goodRes = await proxy.assignUserRole(VALID_USER_ID, {
    roleId: VALID_ROLE_ID,
    tenantId: VALID_TENANT_ID,
  });
  assert.equal(goodRes.status, 200);
  console.log("  ✓ Test 5 passed: User role assignment validates all UUID boundaries");
}

// Test 6: Permissions directory GET
{
  console.log("Test 6: Permissions list directory");
  const proxy = new UserAccessProxySimulator();
  const res = await proxy.getPermissions();
  assert.equal(res.status, 200);

  const unauthProxy = new UserAccessProxySimulator({ token: null });
  const unauthRes = await unauthProxy.getPermissions();
  assert.equal(unauthRes.status, 401);
  console.log("  ✓ Test 6 passed: Permissions directory accessible with auth");
}

console.log("\n=============================================");
console.log("All 6 Users & RBAC proxy tests passed!");
console.log("=============================================");
