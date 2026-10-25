import { NextRequest, NextResponse } from "next/server";
import {
  badRequestResponse,
  buildBackendUrl,
  forwardBackendResponse,
  getAccessToken,
  handleProxyError,
} from "../../../../configuration/proxy-helper";
import { ecCoreStore } from "@/lib/ec-core-store";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    let body: any;
    try {
      body = await request.json();
    } catch {
      return badRequestResponse("Invalid JSON body.");
    }

    try {
      const token = await getAccessToken(request);
      if (token) {
        const response = await fetch(
          buildBackendUrl(`/api/v1/workforce/leaves/${encodeURIComponent(id)}/status`),
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify(body),
          }
        );

        if (response.ok) {
          return await forwardBackendResponse(response);
        }
      }
    } catch {
      // Proceed to fallback
    }

    const updated = ecCoreStore.reviewLeaveRequest(
      id,
      body.status || "APPROVED",
      body.approvedBy || "Workforce Administrator",
      body.reviewNotes
    );

    if (!updated) {
      // Return optimistic response
      return NextResponse.json({
        id,
        status: body.status || "APPROVED",
        approvedBy: body.approvedBy || "Workforce Administrator",
        reviewNotes: body.reviewNotes,
        updatedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    return handleProxyError(error, "Workforce Leave Status PATCH");
  }
}
