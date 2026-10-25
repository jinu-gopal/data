import { NextRequest } from "next/server";
import {
  buildBackendUrl,
  forwardBackendResponse,
  getAccessToken,
  handleProxyError,
  unauthorizedResponse,
} from "../../../../proxy-helper";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getAccessToken(request);
    if (!token) return unauthorizedResponse();

    const { id } = await params;
    const response = await fetch(buildBackendUrl(`/api/v1/configuration/data-pipeline/jobs/${encodeURIComponent(id)}/errors`), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    return await forwardBackendResponse(response);
  } catch (error) {
    return handleProxyError(error, "Data Pipeline Job Errors GET");
  }
}
