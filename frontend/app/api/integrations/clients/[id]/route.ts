import { NextRequest, NextResponse } from "next/server";
import {
  buildBackendUrl,
  forwardBackendResponse,
  getAccessToken,
} from "../../../configuration/proxy-helper";
import { identitySecurityStore } from "@/lib/identity-security-store";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const token = await getAccessToken(request);

    if (token) {
      try {
        const response = await fetch(
          buildBackendUrl(`/api/v1/integrations/clients/${encodeURIComponent(id)}`),
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
        console.warn("Upstream client delete failed, using local store:", upstreamErr);
      }
    }

    const success = identitySecurityStore.deleteClient(id);
    return NextResponse.json({ success, id });
  } catch (error) {
    console.error("API client DELETE error:", error);
    return NextResponse.json({ success: false, id: "unknown" });
  }
}
