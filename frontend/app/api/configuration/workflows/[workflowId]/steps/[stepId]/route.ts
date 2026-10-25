import { NextRequest } from "next/server";
import {
  badRequestResponse,
  buildBackendUrl,
  forwardBackendResponse,
  getAccessToken,
  isValidUuid,
  unauthorizedResponse,
  validateUuidParam,
} from "../../../../proxy-helper";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ workflowId: string; stepId: string }> }
) {
  const token = await getAccessToken(request);
  if (!token) return unauthorizedResponse();

  const { workflowId, stepId } = await params;
  const invalidWfId = validateUuidParam(workflowId, "workflowId");
  if (invalidWfId) return invalidWfId;
  const invalidStepId = validateUuidParam(stepId, "stepId");
  if (invalidStepId) return invalidStepId;

  const { searchParams } = new URL(request.url);
  const tenantId = searchParams.get("tenantId");
  if (!tenantId || !isValidUuid(tenantId)) {
    return badRequestResponse("Missing or invalid 'tenantId' query parameter.");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequestResponse("Malformed JSON request body.");
  }

  const response = await fetch(
    buildBackendUrl(
      `/api/v1/tenants/${tenantId}/workflows/${workflowId}/steps/${stepId}`
    ),
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  return forwardBackendResponse(response);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ workflowId: string; stepId: string }> }
) {
  const token = await getAccessToken(request);
  if (!token) return unauthorizedResponse();

  const { workflowId, stepId } = await params;
  const invalidWfId = validateUuidParam(workflowId, "workflowId");
  if (invalidWfId) return invalidWfId;
  const invalidStepId = validateUuidParam(stepId, "stepId");
  if (invalidStepId) return invalidStepId;

  const { searchParams } = new URL(request.url);
  const tenantId = searchParams.get("tenantId");
  if (!tenantId || !isValidUuid(tenantId)) {
    return badRequestResponse("Missing or invalid 'tenantId' query parameter.");
  }

  const response = await fetch(
    buildBackendUrl(
      `/api/v1/tenants/${tenantId}/workflows/${workflowId}/steps/${stepId}`
    ),
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return forwardBackendResponse(response);
}
