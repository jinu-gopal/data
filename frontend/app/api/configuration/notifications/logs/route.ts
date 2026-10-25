import { NextRequest } from "next/server";
import {
  buildBackendUrl,
  forwardBackendResponse,
  getAccessToken,
  handleProxyError,
  unauthorizedResponse,
} from "../../proxy-helper";

export async function GET(request: NextRequest) {
  try {
    const token = await getAccessToken(request);
    if (!token) return unauthorizedResponse();

    const response = await fetch(buildBackendUrl("/api/v1/configuration/notifications/logs"), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    return await forwardBackendResponse(response);
  } catch (error) {
    return handleProxyError(error, "Notification Logs GET");
  }
}
