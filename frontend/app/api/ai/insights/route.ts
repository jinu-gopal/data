import { NextRequest, NextResponse } from "next/server";
import {
  buildBackendUrl,
  forwardBackendResponse,
  getAccessToken,
} from "../../configuration/proxy-helper";
import { maxAiBrain } from "@/lib/max-ai-brain";

export async function GET(request: NextRequest) {
  try {
    const token = await getAccessToken(request);

    if (token) {
      try {
        const response = await fetch(buildBackendUrl("/api/v1/ai/insights"), {
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
        console.warn("Upstream AI insights failed, using local brain:", upstreamErr);
      }
    }

    return NextResponse.json(maxAiBrain.getEnterpriseTelemetry());
  } catch (error) {
    console.error("AI Insights GET error:", error);
    return NextResponse.json(maxAiBrain.getEnterpriseTelemetry());
  }
}
