import { NextRequest } from "next/server";
import {
  badRequestResponse,
  buildBackendUrl,
  forwardBackendResponse,
  getAccessToken,
  handleProxyError,
  unauthorizedResponse,
} from "../../configuration/proxy-helper";

export async function GET(request: NextRequest) {
  try {
    const token = await getAccessToken(request);
    if (!token) return unauthorizedResponse();

    const response = await fetch(buildBackendUrl("/api/v1/analytics/dashboards"), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    return await forwardBackendResponse(response);
  } catch (error) {
    return handleProxyError(error, "Analytics Dashboards GET");
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = await getAccessToken(request);
    if (!token) return unauthorizedResponse();

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return badRequestResponse("Invalid JSON payload.");
    }

    const response = await fetch(buildBackendUrl("/api/v1/analytics/dashboards"), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    return await forwardBackendResponse(response);
  } catch (error) {
    return handleProxyError(error, "Analytics Dashboards POST");
  }
}
