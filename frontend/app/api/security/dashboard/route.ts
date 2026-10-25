import { NextRequest, NextResponse } from "next/server";
import {
  buildBackendUrl,
  forwardBackendResponse,
  getAccessToken,
} from "../../configuration/proxy-helper";
import { identitySecurityStore } from "@/lib/identity-security-store";

export async function GET(request: NextRequest) {
  try {
    const token = await getAccessToken(request);

    if (token) {
      try {
        const { searchParams } = new URL(request.url);
        const tenantId = searchParams.get("tenantId");
        const query = tenantId ? `?tenantId=${tenantId}` : "";
        const response = await fetch(buildBackendUrl(`/api/v1/security/dashboard${query}`), {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (response.ok) {
          return await forwardBackendResponse(response);
        }
      } catch (upstreamErr) {
        console.warn("Upstream security dashboard fetch failed, using fallback:", upstreamErr);
      }
    }

    return NextResponse.json(identitySecurityStore.getSecurityMetrics());
  } catch (error) {
    console.error("Security dashboard GET error:", error);
    return NextResponse.json(identitySecurityStore.getSecurityMetrics());
  }
}
