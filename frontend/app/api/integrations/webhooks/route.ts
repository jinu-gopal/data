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
        const response = await fetch(buildBackendUrl("/api/v1/integrations/webhooks"), {
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
        console.warn("Upstream webhooks fetch failed, using fallback:", upstreamErr);
      }
    }

    return NextResponse.json(identitySecurityStore.getWebhooks());
  } catch (error) {
    console.error("Webhooks GET error:", error);
    return NextResponse.json(identitySecurityStore.getWebhooks());
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
    const name = String(payload.name || "").trim();
    const targetUrl = String(payload.targetUrl || "").trim();
    const events = Array.isArray(payload.events) ? payload.events : ["workflow.approved"];

    if (!name || !targetUrl) {
      return badRequestResponse("name and targetUrl are required.");
    }

    const token = await getAccessToken(request);

    if (token) {
      try {
        const response = await fetch(buildBackendUrl("/api/v1/integrations/webhooks"), {
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
        console.warn("Upstream webhook create failed, using local store:", upstreamErr);
      }
    }

    const created = identitySecurityStore.createWebhook({
      name,
      targetUrl,
      events,
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Webhooks POST error:", error);
    return badRequestResponse("Failed to create webhook.");
  }
}
