import { NextRequest, NextResponse } from "next/server";
import {
  badRequestResponse,
  buildBackendUrl,
  forwardBackendResponse,
  getAccessToken,
} from "../../../configuration/proxy-helper";
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
    const prompt = String(payload.prompt || "standard approval").trim();
    const businessObjectKey = String(payload.businessObjectKey || "customer");

    const token = await getAccessToken(request);

    if (token) {
      try {
        const response = await fetch(buildBackendUrl("/api/v1/ai/generate/workflow"), {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ prompt, businessObjectKey }),
        });

        if (response.ok) {
          return await forwardBackendResponse(response);
        }
      } catch (upstreamErr) {
        console.warn("Upstream generate workflow failed, using local brain:", upstreamErr);
      }
    }

    const workflow = maxAiBrain.generateWorkflow(prompt);
    return NextResponse.json(workflow);
  } catch (error) {
    console.error("AI Generate Workflow POST error:", error);
    return NextResponse.json(maxAiBrain.generateWorkflow("Procurement"));
  }
}
