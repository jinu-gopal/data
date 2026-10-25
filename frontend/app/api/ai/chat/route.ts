import { NextRequest, NextResponse } from "next/server";
import {
  badRequestResponse,
  buildBackendUrl,
  forwardBackendResponse,
  getAccessToken,
} from "../../configuration/proxy-helper";
import { maxAiBrain } from "@/lib/max-ai-brain";

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
    const message = String(payload.message || payload.prompt || "").trim();
    const contextModule = payload.contextModule ? String(payload.contextModule) : undefined;

    if (!message) {
      return badRequestResponse("message is required.");
    }

    const token = await getAccessToken(request);

    if (token) {
      try {
        const response = await fetch(buildBackendUrl("/api/v1/ai/chat"), {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ message }),
        });

        if (response.ok) {
          return await forwardBackendResponse(response);
        }
      } catch (upstreamErr) {
        console.warn("Upstream AI chat failed, using local brain:", upstreamErr);
      }
    }

    const reply = maxAiBrain.processPrompt(message, contextModule);
    return NextResponse.json(reply);
  } catch (error) {
    console.error("AI Chat POST error:", error);
    return NextResponse.json(
      maxAiBrain.processPrompt("summarize platform capabilities")
    );
  }
}
