import { NextRequest } from "next/server";
import {
  buildBackendUrl,
  forwardBackendResponse,
  getAccessToken,
  handleProxyError,
  unauthorizedResponse,
  badRequestResponse,
  validateUuidParam,
} from "../../configuration/proxy-helper";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const uuidErr = validateUuidParam(userId, "userId");
    if (uuidErr) return uuidErr;

    const accessToken = await getAccessToken(request);
    if (!accessToken) {
      return unauthorizedResponse("No access token found in session.");
    }

    const response = await fetch(buildBackendUrl(`/api/v1/users/${userId}`), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    return await forwardBackendResponse(response);
  } catch (error) {
    return handleProxyError(error, "User GET");
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const uuidErr = validateUuidParam(userId, "userId");
    if (uuidErr) return uuidErr;

    const accessToken = await getAccessToken(request);
    if (!accessToken) {
      return unauthorizedResponse("No access token found in session.");
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return badRequestResponse("Malformed JSON request body.");
    }

    if (!body || typeof body !== "object") {
      return badRequestResponse("Request body must be a valid JSON object.");
    }

    const payload = body as Record<string, unknown>;

    const sanitizedBody: Record<string, unknown> = {};
    if (typeof payload.email === "string" && payload.email.trim()) {
      sanitizedBody.email = payload.email.trim();
    }
    if (typeof payload.status === "string" && payload.status.trim()) {
      sanitizedBody.status = payload.status.trim().toUpperCase();
    }
    if (typeof payload.emailVerified === "boolean") {
      sanitizedBody.emailVerified = payload.emailVerified;
    }
    if (typeof payload.mfaEnabled === "boolean") {
      sanitizedBody.mfaEnabled = payload.mfaEnabled;
    }

    const response = await fetch(buildBackendUrl(`/api/v1/users/${userId}`), {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sanitizedBody),
      cache: "no-store",
    });

    return await forwardBackendResponse(response);
  } catch (error) {
    return handleProxyError(error, "User update PUT");
  }
}
