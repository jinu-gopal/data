import { NextRequest, NextResponse } from "next/server";
import {
  buildBackendUrl,
  forwardBackendResponse,
  getAccessToken,
  badRequestResponse,
} from "../configuration/proxy-helper";
import { identitySecurityStore } from "@/lib/identity-security-store";

export async function GET(request: NextRequest) {
  try {
    const tenantId = request.nextUrl.searchParams.get("tenantId") || undefined;
    const accessToken = await getAccessToken(request);

    if (accessToken && tenantId) {
      try {
        const response = await fetch(
          buildBackendUrl(`/api/v1/roles?tenantId=${tenantId}`),
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
        console.warn("Upstream roles fetch failed, using fallback:", upstreamErr);
      }
    }

    return NextResponse.json(identitySecurityStore.getRoles(tenantId));
  } catch (error) {
    console.error("Roles list GET error:", error);
    return NextResponse.json(identitySecurityStore.getRoles());
  }
}

export async function POST(request: NextRequest) {
  try {
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

    if (
      typeof payload.roleKey !== "string" ||
      !payload.roleKey.trim() ||
      typeof payload.name !== "string" ||
      !payload.name.trim() ||
      typeof payload.tenantId !== "string" ||
      !payload.tenantId.trim()
    ) {
      return badRequestResponse("roleKey, name, and tenantId are required.");
    }

    const sanitizedBody = {
      roleKey: payload.roleKey.trim(),
      name: payload.name.trim(),
      description: typeof payload.description === "string" ? payload.description.trim() : undefined,
      tenantId: payload.tenantId.trim(),
    };

    const accessToken = await getAccessToken(request);

    if (accessToken) {
      try {
        const response = await fetch(buildBackendUrl("/api/v1/roles"), {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(sanitizedBody),
          cache: "no-store",
        });

        if (response.ok) {
          return await forwardBackendResponse(response);
        }
      } catch (upstreamErr) {
        console.warn("Upstream role create failed, using local store:", upstreamErr);
      }
    }

    const created = identitySecurityStore.createRole(sanitizedBody);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Role create POST error:", error);
    return badRequestResponse("Failed to create role.");
  }
}
