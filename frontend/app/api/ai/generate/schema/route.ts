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
    const prompt = String(payload.prompt || "custom entity").trim();

    const token = await getAccessToken(request);

    if (token) {
      try {
        const response = await fetch(buildBackendUrl("/api/v1/ai/generate/schema"), {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ prompt }),
        });

        if (response.ok) {
          return await forwardBackendResponse(response);
        }
      } catch (upstreamErr) {
        console.warn("Upstream generate schema failed, using local brain:", upstreamErr);
      }
    }

    const schema = maxAiBrain.generateSchema(prompt);
    return NextResponse.json(schema);
  } catch (error) {
    console.error("AI Generate Schema POST error:", error);
    return NextResponse.json(maxAiBrain.generateSchema("Equipment Asset"));
  }
}
