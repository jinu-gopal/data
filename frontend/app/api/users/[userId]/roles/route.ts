import { NextRequest, NextResponse } from "next/server";
import {
  buildBackendUrl,
  forwardBackendResponse,
  getAccessToken,
  badRequestResponse,
} from "../../../configuration/proxy-helper";
import { identitySecurityStore } from "@/lib/identity-security-store";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const tenantId = request.nextUrl.searchParams.get("tenantId") || undefined;
    const accessToken = await getAccessToken(request);

    if (accessToken && tenantId) {
      try {
        const response = await fetch(
          buildBackendUrl(`/api/v1/users/${userId}/roles?tenantId=${tenantId}`),
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: "application/json",
            },
            cache: "no-store",
          }
        );

        if (response.ok) {
          return await forwardBackendResponse(response);
        }
      } catch (upstreamErr) {
        console.warn("Upstream user roles fetch failed, using fallback:", upstreamErr);
      }
    }

    const roles = identitySecurityStore.getUserRoles(userId, tenantId);
    return NextResponse.json(roles);
  } catch (error) {
    console.error("User roles GET error:", error);
    return NextResponse.json([]);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return badRequestResponse("Malformed JSON request body.");
    }

    if (!body || typeof body !== "object") {
      return badRequestResponse("Request body must be a valid JSON object.");
    }

    const payload = body as Record<string, unknown>;
    const roleId = String(payload.roleId || "");
    const tenantId = String(payload.tenantId || "00000000-0000-0000-0000-000000000001");
    const organizationId = payload.organizationId ? String(payload.organizationId) : undefined;

    if (!roleId) {
      return badRequestResponse("roleId is required.");
    }

    const accessToken = await getAccessToken(request);

    if (accessToken) {
      try {
        const response = await fetch(
          buildBackendUrl(`/api/v1/users/${userId}/roles`),
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
            cache: "no-store",
          }
        );

        if (response.ok) {
          return await forwardBackendResponse(response);
        }
      } catch (upstreamErr) {
        console.warn("Upstream assign role failed, using local store:", upstreamErr);
      }
    }

    const assigned = identitySecurityStore.assignRoleToUser({
      userId,
      roleId,
      tenantId,
      organizationId,
    });
    return NextResponse.json(assigned, { status: 201 });
  } catch (error) {
    console.error("Assign role POST error:", error);
    return badRequestResponse("Failed to assign role.");
  }
}
