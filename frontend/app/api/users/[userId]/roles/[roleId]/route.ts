import { NextRequest, NextResponse } from "next/server";
import {
  buildBackendUrl,
  forwardBackendResponse,
  getAccessToken,
} from "../../../../configuration/proxy-helper";
import { identitySecurityStore } from "@/lib/identity-security-store";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string; roleId: string }> }
) {
  try {
    const { userId, roleId } = await params;
    const tenantId = request.nextUrl.searchParams.get("tenantId");
    const organizationId = request.nextUrl.searchParams.get("organizationId");
    let query = tenantId ? `tenantId=${tenantId}` : "";
    if (organizationId) {
      query += `&organizationId=${organizationId}`;
    }

    const accessToken = await getAccessToken(request);

    if (accessToken) {
      try {
        const response = await fetch(
          buildBackendUrl(`/api/v1/users/${userId}/roles/${roleId}${query ? `?${query}` : ""}`),
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            cache: "no-store",
          }
        );

        if (response.ok) {
          return await forwardBackendResponse(response);
        }
      } catch (upstreamErr) {
        console.warn("Upstream revoke role failed, using local store:", upstreamErr);
      }
    }

    identitySecurityStore.removeRoleFromUser(userId, roleId);
    return NextResponse.json({ success: true, userId, roleId });
  } catch (error) {
    console.error("Revoke role DELETE error:", error);
    return NextResponse.json({ success: false });
  }
}
