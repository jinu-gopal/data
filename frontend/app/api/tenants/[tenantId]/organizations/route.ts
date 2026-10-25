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
  { params }: { params: Promise<{ tenantId: string }> }
) {
  try {
    const { tenantId } = await params;
    const accessToken = await getAccessToken(request);

    if (accessToken) {
      try {
        const response = await fetch(
          buildBackendUrl(`/api/v1/tenants/${tenantId}/organizations`),
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
        console.warn("Upstream organizations fetch failed, using fallback:", upstreamErr);
      }
    }

    const orgs = identitySecurityStore.getOrganizations(tenantId);
    return NextResponse.json(orgs);
  } catch (error) {
    console.error("Organizations list GET error:", error);
    return NextResponse.json([]);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  try {
    const { tenantId } = await params;
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
    const accessToken = await getAccessToken(request);

    if (accessToken) {
      try {
        const response = await fetch(
          buildBackendUrl(`/api/v1/tenants/${tenantId}/organizations`),
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
        console.warn("Upstream organization create failed:", upstreamErr);
      }
    }

    const newOrg = {
      id: `org-${Date.now()}`,
      organizationKey: String(payload.organizationKey || `org-${Date.now()}`),
      name: String(payload.name || "Custom Organization"),
      organizationType: String(payload.organizationType || "DEPARTMENT"),
      tenantId,
    };
    return NextResponse.json(newOrg, { status: 201 });
  } catch (error) {
    console.error("Organization create POST error:", error);
    return badRequestResponse("Failed to create organization.");
  }
}
