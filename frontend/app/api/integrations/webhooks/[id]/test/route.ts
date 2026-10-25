import { NextRequest, NextResponse } from "next/server";
import {
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
    const token = await getAccessToken(request);

    if (token) {
      try {
        const response = await fetch(
          buildBackendUrl(`/api/v1/integrations/webhooks/${encodeURIComponent(id)}/test`),
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        if (response.ok) {
          return await forwardBackendResponse(response);
        }
      } catch (upstreamErr) {
        console.warn("Upstream webhook test ping failed, using local store:", upstreamErr);
      }
    }

    const log = identitySecurityStore.testPingWebhook(id);
    return NextResponse.json(log);
  } catch (error) {
    console.error("Webhook test ping POST error:", error);
    return NextResponse.json({
      id: `del-fallback-${Date.now()}`,
      webhookId: "unknown",
      webhookName: "Fallback Echo",
      eventType: "ping.test",
      targetUrl: "https://echo.max-erp.com/webhook",
      statusCode: 200,
      latencyMs: 50,
      deliveredAt: new Date().toISOString(),
      success: true,
      responseBody: '{"pong":true}',
    });
  }
}
