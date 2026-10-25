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
  { params }: { params: Promise<{ roleId: string }> }
) {
  try {
    const { roleId } = await params;
    const accessToken = await getAccessToken(request);

    if (accessToken) {
      try {
        const response = await fetch(
          buildBackendUrl(`/api/v1/roles/${roleId}/permissions`),
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
        console.warn("Upstream role permissions fetch failed, using fallback:", upstreamErr);
      }
    }

    const matrix = identitySecurityStore.getRbacMatrix();
    const permIds = matrix.rolePermissionMap[roleId] || [];
    const perms = matrix.permissions
      .filter((p) => permIds.includes(p.id))
      .map((p) => ({
        id: `rp-${roleId}-${p.id}`,
        roleId,
        roleKey: "ROLE_CUSTOM",
        permissionId: p.id,
        permissionKey: p.permissionKey,
        permissionName: p.name,
        moduleKey: p.moduleKey,
        actionKey: p.actionKey,
        createdAt: new Date().toISOString(),
      }));

    return NextResponse.json(perms);
  } catch (error) {
    console.error("Role permissions GET error:", error);
    return NextResponse.json([]);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roleId: string }> }
) {
  try {
    const { roleId } = await params;
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
    const permissionId = String(payload.permissionId || "");
    if (!permissionId) {
      return badRequestResponse("permissionId is required.");
    }

    const accessToken = await getAccessToken(request);

    if (accessToken) {
      try {
        const response = await fetch(
          buildBackendUrl(`/api/v1/roles/${roleId}/permissions`),
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ permissionId }),
            cache: "no-store",
          }
        );

        if (response.ok) {
          return await forwardBackendResponse(response);
        }
      } catch (upstreamErr) {
        console.warn("Upstream role permission grant failed:", upstreamErr);
      }
    }

    identitySecurityStore.toggleRolePermission(roleId, permissionId, true);
    return NextResponse.json(
      {
        id: `rp-${roleId}-${permissionId}`,
        roleId,
        permissionId,
        granted: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Role permission grant error:", error);
    return badRequestResponse("Failed to assign permission to role.");
  }
}
