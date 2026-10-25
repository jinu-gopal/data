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
  { params }: { params: Promise<{ tenantId: string }> }
) {
  try {
    const { tenantId } = await params;
    const uuidErr = validateUuidParam(tenantId, "tenantId");
    if (uuidErr) return uuidErr;

    const accessToken = await getAccessToken(request);
    if (!accessToken) {
      return unauthorizedResponse("No access token found in session.");
    }

    const response = await fetch(
      buildBackendUrl(`/api/v1/tenants/${tenantId}`),
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );

    return await forwardBackendResponse(response);
  } catch (error) {
    return handleProxyError(error, "Tenant GET");
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  try {
    const { tenantId } = await params;
    const uuidErr = validateUuidParam(tenantId, "tenantId");
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

    if (
      typeof payload.name !== "string" ||
      !payload.name.trim() ||
      typeof payload.status !== "string" ||
      !payload.status.trim()
    ) {
      return badRequestResponse("name and status are required for tenant update.");
    }

    const sanitizedBody = {
      name: payload.name.trim(),
      status: payload.status.trim().toUpperCase(),
    };

    const response = await fetch(
      buildBackendUrl(`/api/v1/tenants/${tenantId}`),
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sanitizedBody),
        cache: "no-store",
      }
    );

    return await forwardBackendResponse(response);
  } catch (error) {
    return handleProxyError(error, "Tenant update PUT");
  }
}
