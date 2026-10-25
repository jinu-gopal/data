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

function unauthorizedResponse(
  message = "Authentication required or session expired."
) {
  return { status: 401, body: { error: "UNAUTHORIZED", message } };
}

function badRequestResponse(message) {
  return { status: 400, body: { error: "BAD_REQUEST", message } };
}

class WorkflowProxySimulator {
  constructor({ token = "mock-jwt-token", fetchMock = null } = {}) {
    this.token = token;
    this.fetchMock =
      fetchMock ||
      (async () => ({
        status: 200,
        text: async () => JSON.stringify({ success: true }),
      }));
  }

  async getWorkflows(tenantId, businessObjectId) {
    if (!this.token) return unauthorizedResponse();
    if (!tenantId || !isValidUuid(tenantId)) {
      return badRequestResponse("Missing or invalid 'tenantId' query parameter.");
    }
    let path = `/api/v1/tenants/${tenantId}/workflows`;
    if (businessObjectId) {
      if (!isValidUuid(businessObjectId)) {
        return badRequestResponse("Invalid 'businessObjectId' query parameter.");
      }
      path += `?businessObjectId=${businessObjectId}`;
    }
    const res = await this.fetchMock(buildBackendUrl(path), {
      method: "GET",
      headers: { Authorization: `Bearer ${this.token}` },
    });
    return { status: res.status, body: JSON.parse(await res.text()) };
  }

  async getWorkflow(tenantId, workflowId) {
    if (!this.token) return unauthorizedResponse();
    const inv = validateUuidParam(workflowId, "workflowId");
    if (inv) return inv;
    if (!tenantId || !isValidUuid(tenantId)) {
      return badRequestResponse("Missing or invalid 'tenantId' query parameter.");
    }
    const res = await this.fetchMock(
      buildBackendUrl(`/api/v1/tenants/${tenantId}/workflows/${workflowId}`),
      {
        method: "GET",
        headers: { Authorization: `Bearer ${this.token}` },
      }
    );
    return { status: res.status, body: JSON.parse(await res.text()) };
  }

  async submitRecord(tenantId, workflowId, recordId, contextData = {}) {
    if (!this.token) return unauthorizedResponse();
    const inv = validateUuidParam(workflowId, "workflowId");
    if (inv) return inv;
    if (!tenantId || !isValidUuid(tenantId)) {
      return badRequestResponse("Missing or invalid 'tenantId' query parameter.");
    }
    if (!recordId || !isValidUuid(recordId)) {
      return badRequestResponse("Missing or invalid 'recordId'.");
    }
    const res = await this.fetchMock(
      buildBackendUrl(`/api/v1/tenants/${tenantId}/workflows/${workflowId}/instances`),
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ recordId, contextData }),
      }
    );
    return { status: res.status, body: JSON.parse(await res.text()) };
  }

  async executeDecision(tenantId, instanceId, action, comments) {
    if (!this.token) return unauthorizedResponse();
    const inv = validateUuidParam(instanceId, "instanceId");
    if (inv) return inv;
    if (!tenantId || !isValidUuid(tenantId)) {
      return badRequestResponse("Missing or invalid 'tenantId' query parameter.");
    }
    if (!comments || !comments.trim()) {
      return badRequestResponse("Decision reasoning comment is mandatory.");
    }
    const res = await this.fetchMock(
      buildBackendUrl(`/api/v1/tenants/${tenantId}/workflows/instances/${instanceId}/decision`),
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action, comments }),
      }
    );
    return { status: res.status, body: JSON.parse(await res.text()) };
  }

  async getInboxPending(tenantId) {
    if (!this.token) return unauthorizedResponse();
    if (!tenantId || !isValidUuid(tenantId)) {
      return badRequestResponse("Missing or invalid 'tenantId' query parameter.");
    }
    const res = await this.fetchMock(
      buildBackendUrl(`/api/v1/tenants/${tenantId}/workflows/inbox/pending`),
      {
        method: "GET",
        headers: { Authorization: `Bearer ${this.token}` },
      }
    );
    return { status: res.status, body: JSON.parse(await res.text()) };
  }
}

async function runTests() {
  console.log("Starting Workflow & Approvals Proxy Test Suite...\n");

  const validTenant = "cf1757d5-c535-4335-939c-24908aee0209";
  const validWorkflow = "a1000000-0000-0000-0000-000000000001";
  const validRecord = "10000000-0000-0000-0003-000000000001";
  const validInstance = "b1000000-0000-0000-0000-000000000001";

  // Test 1: Unauthenticated request returns 401
  {
    const sim = new WorkflowProxySimulator({ token: null });
    const res = await sim.getWorkflows(validTenant);
    assert.equal(res.status, 401);
    assert.equal(res.body.error, "UNAUTHORIZED");
    console.log("✓ Test 1 Passed: Unauthenticated requests rejected with 401");
  }

  // Test 2: Invalid Tenant UUID returns 400
  {
    const sim = new WorkflowProxySimulator();
    const res = await sim.getWorkflows("invalid-uuid");
    assert.equal(res.status, 400);
    assert.equal(res.body.error, "BAD_REQUEST");
    console.log("✓ Test 2 Passed: Malformed Tenant UUID rejected with 400");
  }

  // Test 3: Invalid Workflow UUID returns 400
  {
    const sim = new WorkflowProxySimulator();
    const res = await sim.getWorkflow(validTenant, "bad-id");
    assert.equal(res.status, 400);
    assert.equal(res.body.error, "BAD_REQUEST");
    console.log("✓ Test 3 Passed: Malformed Workflow UUID rejected with 400");
  }

  // Test 4: Decision requires non-empty comments
  {
    const sim = new WorkflowProxySimulator();
    const res = await sim.executeDecision(validTenant, validInstance, "APPROVED", "   ");
    assert.equal(res.status, 400);
    assert.equal(res.body.error, "BAD_REQUEST");
    console.log("✓ Test 4 Passed: Empty approval remarks rejected with 400");
  }

  // Test 5: Get Workflows forwards correct parameters
  {
    let capturedUrl = "";
    const sim = new WorkflowProxySimulator({
      fetchMock: async (url) => {
        capturedUrl = url;
        return {
          status: 200,
          text: async () => JSON.stringify([{ id: validWorkflow, name: "Order Approval" }]),
        };
      },
    });

    const res = await sim.getWorkflows(validTenant, validRecord);
    assert.equal(res.status, 200);
    assert(capturedUrl.includes(`/api/v1/tenants/${validTenant}/workflows?businessObjectId=${validRecord}`));
    assert.equal(res.body[0].name, "Order Approval");
    console.log("✓ Test 5 Passed: GET workflows query forwarded accurately");
  }

  // Test 6: Submit Record to Workflow passes context and recordId
  {
    let capturedBody = null;
    const sim = new WorkflowProxySimulator({
      fetchMock: async (url, opts) => {
        capturedBody = JSON.parse(opts.body);
        return {
          status: 201,
          text: async () => JSON.stringify({ id: validInstance, status: "PENDING" }),
        };
      },
    });

    const res = await sim.submitRecord(validTenant, validWorkflow, validRecord, { amount: 50000 });
    assert.equal(res.status, 201);
    assert.equal(capturedBody.recordId, validRecord);
    assert.equal(capturedBody.contextData.amount, 50000);
    assert.equal(res.body.status, "PENDING");
    console.log("✓ Test 6 Passed: Submit record forwards payload and receives 201 Created");
  }

  // Test 7: Execute Decision forwards action and remarks
  {
    let capturedBody = null;
    const sim = new WorkflowProxySimulator({
      fetchMock: async (url, opts) => {
        capturedBody = JSON.parse(opts.body);
        return {
          status: 200,
          text: async () => JSON.stringify({ id: validInstance, status: "APPROVED" }),
        };
      },
    });

    const res = await sim.executeDecision(validTenant, validInstance, "APPROVED", "Clear for dispatch");
    assert.equal(res.status, 200);
    assert.equal(capturedBody.action, "APPROVED");
    assert.equal(capturedBody.comments, "Clear for dispatch");
    assert.equal(res.body.status, "APPROVED");
    console.log("✓ Test 7 Passed: Execute decision approves and forwards justification remarks");
  }

  // Test 8: Get Inbox Pending returns pending approvals
  {
    const sim = new WorkflowProxySimulator({
      fetchMock: async () => ({
        status: 200,
        text: async () => JSON.stringify([{ instanceId: validInstance, stepName: "Finance Review" }]),
      }),
    });

    const res = await sim.getInboxPending(validTenant);
    assert.equal(res.status, 200);
    assert.equal(res.body.length, 1);
    assert.equal(res.body[0].stepName, "Finance Review");
    console.log("✓ Test 8 Passed: GET pending inbox successfully retrieves awaiting approvals");
  }

  console.log("\nAll 8 Workflow Proxy tests passed successfully!");
}

runTests().catch((err) => {
  console.error("Test Suite Failed:", err);
  process.exit(1);
});
