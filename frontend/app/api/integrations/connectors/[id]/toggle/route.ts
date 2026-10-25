import { NextRequest, NextResponse } from "next/server";
import {
  badRequestResponse,
  buildBackendUrl,
  forwardBackendResponse,
  getAccessToken,
} from "../../../../configuration/proxy-helper";
import { identitySecurityStore } from "@/lib/identity-security-store";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
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
    const enable = Boolean(payload.enable !== undefined ? payload.enable : true);
    const token = await getAccessToken(request);

    if (token) {
      try {
        const response = await fetch(
          buildBackendUrl(`/api/v1/integrations/connectors/${encodeURIComponent(id)}/toggle`),
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify(payload),
          }
        );

        if (response.ok) {
          return await forwardBackendResponse(response);
        }
      } catch (upstreamErr) {
        console.warn("Upstream toggle connector failed, using local store:", upstreamErr);
      }
    }

    const updated = identitySecurityStore.toggleConnector(id, enable);
    if (!updated) {
      return badRequestResponse(`Connector ${id} not found.`);
    }
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Connector toggle POST error:", error);
    return badRequestResponse("Failed to toggle connector state.");
  }
}
