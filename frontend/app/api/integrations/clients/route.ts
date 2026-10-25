import { NextRequest, NextResponse } from "next/server";
import {
  badRequestResponse,
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
        const response = await fetch(buildBackendUrl("/api/v1/integrations/clients"), {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          cache: "no-store",
        });

        if (response.ok) {
          return await forwardBackendResponse(response);
        }
      } catch (upstreamErr) {
        console.warn("Upstream API clients fetch failed, using fallback:", upstreamErr);
      }
    }

    return NextResponse.json(identitySecurityStore.getClients());
  } catch (error) {
    console.error("API clients GET error:", error);
    return NextResponse.json(identitySecurityStore.getClients());
  }
}

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
    const clientId = String(payload.clientId || "").trim();
    const clientName = String(payload.clientName || "").trim();
    const grantTypes = Array.isArray(payload.grantTypes) ? payload.grantTypes : ["client_credentials"];
    const scopes = Array.isArray(payload.scopes) ? payload.scopes : ["read", "write"];
    const redirectUris = payload.redirectUris ? String(payload.redirectUris) : undefined;

    if (!clientId || !clientName) {
      return badRequestResponse("clientId and clientName are required.");
    }

    const token = await getAccessToken(request);

    if (token) {
      try {
        const response = await fetch(buildBackendUrl("/api/v1/integrations/clients"), {
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
        console.warn("Upstream client create failed, using local store:", upstreamErr);
      }
    }

    const created = identitySecurityStore.createClient({
      clientId,
      clientName,
      grantTypes,
      scopes,
      redirectUris,
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("API clients POST error:", error);
    return badRequestResponse("Failed to create API client.");
  }
}
