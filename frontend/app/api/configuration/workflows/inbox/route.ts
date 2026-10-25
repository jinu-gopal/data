import { NextRequest } from "next/server";
import {
  badRequestResponse,
  buildBackendUrl,
  forwardBackendResponse,
  getAccessToken,
  isValidUuid,
  unauthorizedResponse,
} from "../../proxy-helper";

export async function GET(request: NextRequest) {
  const token = await getAccessToken(request);
  if (!token) return unauthorizedResponse();

  const { searchParams } = new URL(request.url);
  const tenantId = searchParams.get("tenantId");
  if (!tenantId || !isValidUuid(tenantId)) {
    return badRequestResponse("Missing or invalid 'tenantId' query parameter.");
  }

  const response = await fetch(
    buildBackendUrl(`/api/v1/tenants/${tenantId}/workflows/inbox/pending`),
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
