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
} from "../../../../configuration/proxy-helper";

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ tenantId: string; organizationId: string }>;
  }
) {
  try {
    const { tenantId, organizationId } = await params;
    const tenantErr = validateUuidParam(tenantId, "tenantId");
    if (tenantErr) return tenantErr;

    const orgErr = validateUuidParam(organizationId, "organizationId");
    if (orgErr) return orgErr;

    const accessToken = await getAccessToken(request);
    if (!accessToken) {
      return unauthorizedResponse("No access token found in session.");
    }

    const response = await fetch(
      buildBackendUrl(
        `/api/v1/tenants/${tenantId}/organizations/${organizationId}`
      ),
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
    return handleProxyError(error, "Organization GET");
  }
}

export async function PUT(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ tenantId: string; organizationId: string }>;
  }
) {
  try {
    const { tenantId, organizationId } = await params;
    const tenantErr = validateUuidParam(tenantId, "tenantId");
    if (tenantErr) return tenantErr;

    const orgErr = validateUuidParam(organizationId, "organizationId");
    if (orgErr) return orgErr;

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
      return badRequestResponse("name and status are required.");
    }

    let parentId: string | null = null;
    if (
      payload.parentOrganizationId !== undefined &&
      payload.parentOrganizationId !== null &&
      payload.parentOrganizationId !== ""
    ) {
      if (!isValidUuid(payload.parentOrganizationId)) {
        return badRequestResponse("parentOrganizationId must be a valid UUID.");
      }
      parentId = payload.parentOrganizationId as string;
    }

    const sanitizedBody: Record<string, unknown> = {
      name: payload.name.trim(),
      status: payload.status.trim().toUpperCase(),
      organizationType:
        typeof payload.organizationType === "string" &&
        payload.organizationType.trim()
          ? payload.organizationType.trim().toUpperCase()
          : undefined,
      parentOrganizationId: parentId,
    };

    const response = await fetch(
      buildBackendUrl(
        `/api/v1/tenants/${tenantId}/organizations/${organizationId}`
      ),
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
    return handleProxyError(error, "Organization update PUT");
  }
}
