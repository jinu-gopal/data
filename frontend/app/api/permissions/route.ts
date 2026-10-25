import { NextRequest, NextResponse } from "next/server";
import {
  buildBackendUrl,
  forwardBackendResponse,
  getAccessToken,
} from "../configuration/proxy-helper";
import { identitySecurityStore } from "@/lib/identity-security-store";

export async function GET(request: NextRequest) {
  try {
    const accessToken = await getAccessToken(request);

    if (accessToken) {
      try {
        const response = await fetch(buildBackendUrl("/api/v1/permissions"), {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
          },
          cache: "no-store",
        });

        if (response.ok) {
          return await forwardBackendResponse(response);
        }
      } catch (upstreamErr) {
        console.warn("Upstream permissions fetch failed, using fallback:", upstreamErr);
      }
    }

    return NextResponse.json(identitySecurityStore.getPermissions());
  } catch (error) {
    console.error("Permissions list GET error:", error);
    return NextResponse.json(identitySecurityStore.getPermissions());
  }
}
