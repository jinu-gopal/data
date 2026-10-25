import { NextRequest, NextResponse } from "next/server";
import {
  badRequestResponse,
  buildBackendUrl,
  forwardBackendResponse,
  getAccessToken,
  handleProxyError,
} from "../../../../configuration/proxy-helper";
import { recruitmentStore } from "@/lib/recruitment-store";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let body: any;
  try {
    body = await request.json();
  } catch {
    return badRequestResponse("Invalid JSON payload.");
  }

  try {
    const token = await getAccessToken(request);
    if (token) {
      const response = await fetch(buildBackendUrl(`/api/v1/recruitment/candidates/${encodeURIComponent(id)}/stage`), {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        return await forwardBackendResponse(response);
      }
    }
  } catch (error) {
    // Proceed to fallback
  }

  const updated = recruitmentStore.updateCandidateStage(id, body.stage, body.statusLabel || body.stage);
  if (!updated) {
    return NextResponse.json({ error: "NOT_FOUND", message: `Candidate with id "${id}" was not found.` }, { status: 404 });
  }

  return NextResponse.json(updated);
}
