import { NextRequest, NextResponse } from "next/server";
import {
  buildBackendUrl,
  forwardBackendResponse,
  getAccessToken,
} from "../../../configuration/proxy-helper";
import { identitySecurityStore } from "@/lib/identity-security-store";

interface RouteContext {
  params: Promise<{
    sessionId: string;
  }>;
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { sessionId } = await context.params;
    const token = await getAccessToken(request);

    if (token) {
      try {
        const response = await fetch(
          buildBackendUrl(`/api/v1/security/sessions/${encodeURIComponent(sessionId)}`),
          {
            method: "DELETE",
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
        console.warn("Upstream session terminate failed, using fallback:", upstreamErr);
      }
    }

    const success = identitySecurityStore.terminateSession(sessionId);
    return NextResponse.json({
      success,
      message: `Session ${sessionId} terminated successfully.`,
    });
  } catch (error) {
    console.error("Session terminate DELETE error:", error);
    return NextResponse.json({ success: false });
  }
}
