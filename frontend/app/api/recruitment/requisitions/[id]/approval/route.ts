import { NextRequest } from "next/server";
import {
  badRequestResponse,
  buildBackendUrl,
  forwardBackendResponse,
  getAccessToken,
  handleProxyError,
  unauthorizedResponse,
} from "../../../../configuration/proxy-helper";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = await getAccessToken(request);
    if (!token) return unauthorizedResponse();

    const { id } = await params;
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return badRequestResponse("Invalid JSON payload.");
    }

    const response = await fetch(buildBackendUrl(`/api/v1/recruitment/requisitions/${id}/approval`), {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    return await forwardBackendResponse(response);
  } catch (error) {
    return handleProxyError(error, "Requisition Approval PATCH");
  }
}
