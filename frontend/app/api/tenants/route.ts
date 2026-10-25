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
    const accessToken = await getAccessToken(request);

    if (accessToken) {
      try {
        const response = await fetch(buildBackendUrl("/api/v1/tenants"), {
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
        console.warn("Upstream tenants fetch failed, using fallback:", upstreamErr);
      }
    }

    return NextResponse.json(identitySecurityStore.getTenants());
  } catch (error) {
    console.error("Tenants list GET error:", error);
    return NextResponse.json(identitySecurityStore.getTenants());
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
      typeof payload.tenantKey !== "string" ||
      !payload.tenantKey.trim() ||
      typeof payload.name !== "string" ||
      !payload.name.trim()
    ) {
      return badRequestResponse("tenantKey and name are required.");
    }

    const sanitizedBody = {
      tenantKey: payload.tenantKey.trim(),
      name: payload.name.trim(),
    };

    const accessToken = await getAccessToken(request);

    if (accessToken) {
      try {
        const response = await fetch(buildBackendUrl("/api/v1/tenants"), {
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
        console.warn("Upstream tenant create failed, using local store:", upstreamErr);
      }
    }

    const created = identitySecurityStore.createTenant(sanitizedBody);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Tenant create POST error:", error);
    return badRequestResponse("Failed to create tenant.");
  }
}
