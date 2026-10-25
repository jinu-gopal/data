import { NextRequest } from "next/server";
import {
  badRequestResponse,
  buildBackendUrl,
  forwardBackendResponse,
  getAccessToken,
  isValidUuid,
  unauthorizedResponse,
  validateUuidParam,
} from "../../../proxy-helper";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ workflowId: string }> }
) {
  const token = await getAccessToken(request);
  if (!token) return unauthorizedResponse();

  const { workflowId } = await params;
  const invalidId = validateUuidParam(workflowId, "workflowId");
  if (invalidId) return invalidId;

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
      `/api/v1/tenants/${tenantId}/workflows/${workflowId}/instances`
    ),
    {
      method: "POST",
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
