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
    const tenantId = request.nextUrl.searchParams.get("tenantId") || "00000000-0000-0000-0000-000000000001";
    const accessToken = await getAccessToken(request);

    if (accessToken) {
      try {
        const response = await fetch(
          buildBackendUrl(`/api/v1/users/${userId}/tenant-access?tenantId=${tenantId}`),
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
        console.warn("Upstream user tenant access fetch failed:", upstreamErr);
      }
    }

    const tenant = identitySecurityStore.getTenantById(tenantId) || identitySecurityStore.getTenants()[0];
    const accessList = [
      {
        id: `uta-${userId}-${tenant.id}`,
        userId,
        tenantId: tenant.id,
        tenantKey: tenant.tenantKey,
        tenantName: tenant.name,
        organizationId: "org-sec-001",
        status: "ACTIVE",
      },
    ];

    return NextResponse.json(accessList);
  } catch (error) {
    console.error("User tenant access GET error:", error);
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
    const tenantId = String(payload.tenantId || "00000000-0000-0000-0000-000000000001");
    const organizationId = payload.organizationId ? String(payload.organizationId) : undefined;

    const accessToken = await getAccessToken(request);

    if (accessToken) {
      try {
        const response = await fetch(
          buildBackendUrl(`/api/v1/users/${userId}/tenant-access`),
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
        console.warn("Upstream grant tenant access failed:", upstreamErr);
      }
    }

    const tenant = identitySecurityStore.getTenantById(tenantId) || identitySecurityStore.getTenants()[0];
    const createdAccess = {
      id: `uta-${userId}-${tenantId}`,
      userId,
      tenantId,
      tenantKey: tenant.tenantKey,
      tenantName: tenant.name,
      organizationId: organizationId || null,
      status: "ACTIVE",
    };

    return NextResponse.json(createdAccess, { status: 201 });
  } catch (error) {
    console.error("User tenant access POST error:", error);
    return badRequestResponse("Failed to grant tenant access.");
  }
}
