import { NextRequest } from "next/server";
import {
  buildBackendUrl,
  forwardBackendResponse,
  getAccessToken,
  handleProxyError,
  unauthorizedResponse,
  badRequestResponse,
  validateUuidParam,
  isValidUuid,
} from "../../configuration/proxy-helper";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roleId: string }> }
) {
  try {
    const { roleId } = await params;
    const rErr = validateUuidParam(roleId, "roleId");
    if (rErr) return rErr;

    const tenantId = request.nextUrl.searchParams.get("tenantId");
    if (!tenantId || !isValidUuid(tenantId)) {
      return badRequestResponse("Valid tenantId query parameter is required.");
    }

    const accessToken = await getAccessToken(request);
    if (!accessToken) {
      return unauthorizedResponse("No access token found in session.");
    }

    const response = await fetch(
      buildBackendUrl(`/api/v1/roles/${roleId}?tenantId=${tenantId}`),
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
    return handleProxyError(error, "Role GET");
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ roleId: string }> }
) {
  try {
    const { roleId } = await params;
    const rErr = validateUuidParam(roleId, "roleId");
    if (rErr) return rErr;

    const tenantId = request.nextUrl.searchParams.get("tenantId");
    if (!tenantId || !isValidUuid(tenantId)) {
      return badRequestResponse("Valid tenantId query parameter is required.");
    }

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

    const sanitizedBody: Record<string, unknown> = {
      name: typeof payload.name === "string" ? payload.name.trim() : "",
      description: typeof payload.description === "string" ? payload.description.trim() : null,
      status: typeof payload.status === "string" ? payload.status.trim().toUpperCase() : "ACTIVE",
    };

    const response = await fetch(
      buildBackendUrl(`/api/v1/roles/${roleId}?tenantId=${tenantId}`),
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
    return handleProxyError(error, "Role update PUT");
  }
}
