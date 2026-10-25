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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ instanceId: string }> }
) {
  const token = await getAccessToken(request);
  if (!token) return unauthorizedResponse();

  const { instanceId } = await params;
  const invalidId = validateUuidParam(instanceId, "instanceId");
  if (invalidId) return invalidId;

  const { searchParams } = new URL(request.url);
  const tenantId = searchParams.get("tenantId");
  if (!tenantId || !isValidUuid(tenantId)) {
    return badRequestResponse("Missing or invalid 'tenantId' query parameter.");
  }

  const response = await fetch(
    buildBackendUrl(
      `/api/v1/tenants/${tenantId}/workflows/instances/${instanceId}`
    ),
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    }
  );

  return forwardBackendResponse(response);
}
