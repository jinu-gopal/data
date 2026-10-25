import { NextRequest } from "next/server";
import {
  buildBackendUrl,
  forwardBackendResponse,
  getAccessToken,
  handleProxyError,
  unauthorizedResponse,
  badRequestResponse,
  validateUuidParam,
  isValidUuid,
} from "../../../../configuration/proxy-helper";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string; accessId: string }> }
) {
  try {
    const { userId, accessId } = await params;
    const uErr = validateUuidParam(userId, "userId");
    if (uErr) return uErr;

    const aErr = validateUuidParam(accessId, "accessId");
    if (aErr) return aErr;

    const tenantId = request.nextUrl.searchParams.get("tenantId");
    if (!tenantId || !isValidUuid(tenantId)) {
      return badRequestResponse("Valid tenantId query parameter is required.");
    }

    const accessToken = await getAccessToken(request);
    if (!accessToken) {
      return unauthorizedResponse("No access token found in session.");
    }

    const response = await fetch(
      buildBackendUrl(`/api/v1/users/${userId}/tenant-access/${accessId}?tenantId=${tenantId}`),
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      }
    );

    return await forwardBackendResponse(response);
  } catch (error) {
    return handleProxyError(error, "User tenant access revoke DELETE");
  }
}
