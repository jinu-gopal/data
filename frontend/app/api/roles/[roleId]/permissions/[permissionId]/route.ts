import { NextRequest } from "next/server";
import {
  buildBackendUrl,
  forwardBackendResponse,
  getAccessToken,
  handleProxyError,
  unauthorizedResponse,
  validateUuidParam,
} from "../../../../configuration/proxy-helper";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ roleId: string; permissionId: string }> }
) {
  try {
    const { roleId, permissionId } = await params;
    const rErr = validateUuidParam(roleId, "roleId");
    if (rErr) return rErr;

    const pErr = validateUuidParam(permissionId, "permissionId");
    if (pErr) return pErr;

    const accessToken = await getAccessToken(request);
    if (!accessToken) {
      return unauthorizedResponse("No access token found in session.");
    }

    const response = await fetch(
      buildBackendUrl(`/api/v1/roles/${roleId}/permissions/${permissionId}`),
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
    return handleProxyError(error, "Role permission remove DELETE");
  }
}
