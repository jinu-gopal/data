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

  const businessObjectId = searchParams.get("businessObjectId");
  const recordId = searchParams.get("recordId");
  const status = searchParams.get("status");

  let backendUrl = `/api/v1/tenants/${tenantId}/workflows/instances?`;
  const queryParts: string[] = [];
  if (businessObjectId) {
    if (!isValidUuid(businessObjectId)) {
      return badRequestResponse("Invalid 'businessObjectId' query parameter.");
    }
    queryParts.push(`businessObjectId=${businessObjectId}`);
  }
  if (recordId) {
    if (!isValidUuid(recordId)) {
      return badRequestResponse("Invalid 'recordId' query parameter.");
    }
    queryParts.push(`recordId=${recordId}`);
  }
  if (status) {
    queryParts.push(`status=${encodeURIComponent(status)}`);
  }

  backendUrl += queryParts.join("&");

  const response = await fetch(buildBackendUrl(backendUrl), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  return forwardBackendResponse(response);
}
