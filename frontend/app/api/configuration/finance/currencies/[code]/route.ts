import { NextRequest } from "next/server";
import {
  badRequestResponse,
  buildBackendUrl,
  forwardBackendResponse,
  getAccessToken,
  handleProxyError,
  unauthorizedResponse,
} from "../../../proxy-helper";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const token = await getAccessToken(request);
    if (!token) return unauthorizedResponse();

    const { code } = await params;
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return badRequestResponse("Invalid JSON payload.");
    }

    const response = await fetch(buildBackendUrl(`/api/v1/configuration/finance/currencies/${encodeURIComponent(code)}`), {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    return await forwardBackendResponse(response);
  } catch (error) {
    return handleProxyError(error, "Currency Rate PUT");
  }
}
