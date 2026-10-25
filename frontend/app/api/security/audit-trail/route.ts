import { NextRequest, NextResponse } from "next/server";
import {
  buildBackendUrl,
  forwardBackendResponse,
  getAccessToken,
} from "../../configuration/proxy-helper";
import { identitySecurityStore } from "@/lib/identity-security-store";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get("tenantId");
    const category = searchParams.get("category") || "ALL";
    const search = searchParams.get("search") || "";
    const limit = parseInt(searchParams.get("limit") || "100", 10);

    const token = await getAccessToken(request);

    if (token) {
      try {
        const params = new URLSearchParams();
        if (tenantId) params.set("tenantId", tenantId);
        if (category) params.set("category", category);
        if (search) params.set("search", search);
        params.set("limit", String(limit));

        const response = await fetch(
          buildBackendUrl(`/api/v1/security/audit-trail?${params.toString()}`),
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        if (response.ok) {
          return await forwardBackendResponse(response);
        }
      } catch (upstreamErr) {
        console.warn("Upstream audit trail fetch failed, using fallback:", upstreamErr);
      }
    }

    return NextResponse.json(identitySecurityStore.getAuditTrail(category, search, limit));
  } catch (error) {
    console.error("Security audit trail GET error:", error);
    return NextResponse.json(identitySecurityStore.getAuditTrail());
  }
}
