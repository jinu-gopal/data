import { NextRequest, NextResponse } from "next/server";
import {
  buildBackendUrl,
  forwardBackendResponse,
  getAccessToken,
} from "../../proxy-helper";
import { identitySecurityStore } from "@/lib/identity-security-store";

export async function GET(request: NextRequest) {
  try {
    const token = await getAccessToken(request);

    if (token) {
      try {
        const response = await fetch(buildBackendUrl("/api/v1/configuration/data-pipeline/jobs"), {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (response.ok) {
          return await forwardBackendResponse(response);
        }
      } catch (upstreamErr) {
        console.warn("Upstream data pipeline jobs fetch failed, using fallback:", upstreamErr);
      }
    }

    return NextResponse.json(identitySecurityStore.getPipelineJobs());
  } catch (error) {
    console.error("Data Pipeline Jobs GET error:", error);
    return NextResponse.json(identitySecurityStore.getPipelineJobs());
  }
}
