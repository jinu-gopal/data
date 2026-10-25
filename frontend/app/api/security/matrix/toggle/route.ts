import { NextRequest, NextResponse } from "next/server";
import {
  badRequestResponse,
  buildBackendUrl,
  forwardBackendResponse,
  getAccessToken,
} from "../../../configuration/proxy-helper";
import { identitySecurityStore } from "@/lib/identity-security-store";

export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return badRequestResponse("Invalid JSON payload.");
    }

    if (!body || typeof body !== "object") {
      return badRequestResponse("Invalid JSON payload.");
    }

    const payload = body as Record<string, unknown>;
    const roleId = String(payload.roleId || "");
    const permissionId = String(payload.permissionId || "");
    const grant = Boolean(payload.grant !== undefined ? payload.grant : payload.granted);

    if (!roleId || !permissionId) {
      return badRequestResponse("roleId and permissionId are required.");
    }

    const token = await getAccessToken(request);

    if (token) {
      try {
        const response = await fetch(buildBackendUrl("/api/v1/security/matrix/toggle"), {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          return await forwardBackendResponse(response);
        }
      } catch (upstreamErr) {
        console.warn("Upstream toggle permission failed, using local store:", upstreamErr);
      }
    }

    identitySecurityStore.toggleRolePermission(roleId, permissionId, grant);
    return NextResponse.json({
      success: true,
      roleId,
      permissionId,
      granted: grant,
    });
  } catch (error) {
    console.error("Toggle permission POST error:", error);
    return badRequestResponse("Failed to toggle permission.");
  }
}
