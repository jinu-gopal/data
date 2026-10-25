import { NextRequest } from "next/server";
import {
  buildBackendUrl,
  forwardBackendResponse,
  getAccessToken,
  handleProxyError,
  unauthorizedResponse,
  badRequestResponse,
  validateUuidParam,
} from "../../../../../proxy-helper";

export async function GET(
  request: NextRequest,
  context: {
    params: Promise<{
      businessObjectId: string;
      fieldId: string;
    }>;
  }
) {
  try {
    const { businessObjectId, fieldId } = await context.params;

    const invalidObjUuid = validateUuidParam(businessObjectId, "businessObjectId");
    if (invalidObjUuid) return invalidObjUuid;

    const invalidFieldUuid = validateUuidParam(fieldId, "fieldId");
    if (invalidFieldUuid) return invalidFieldUuid;

    const accessToken = await getAccessToken(request);
    if (!accessToken) {
      return unauthorizedResponse("No access token found in session.");
    }

    const response = await fetch(
      buildBackendUrl(
        `/api/v1/configuration/business-objects/${businessObjectId}/fields/${fieldId}/reference`
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
    return handleProxyError(error, "Field reference GET");
  }
}

export async function POST(
  request: NextRequest,
  context: {
    params: Promise<{
      businessObjectId: string;
      fieldId: string;
    }>;
  }
) {
  try {
    const { businessObjectId, fieldId } = await context.params;

    const invalidObjUuid = validateUuidParam(businessObjectId, "businessObjectId");
    if (invalidObjUuid) return invalidObjUuid;

    const invalidFieldUuid = validateUuidParam(fieldId, "fieldId");
    if (invalidFieldUuid) return invalidFieldUuid;

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

    const invalidTargetUuid = validateUuidParam(
      payload.targetBusinessObjectId,
      "targetBusinessObjectId"
    );
    if (invalidTargetUuid) return invalidTargetUuid;

    if (payload.displayFieldId !== null && payload.displayFieldId !== undefined) {
      const invalidDisplayFieldUuid = validateUuidParam(
        payload.displayFieldId,
        "displayFieldId"
      );
      if (invalidDisplayFieldUuid) return invalidDisplayFieldUuid;
    }

    const response = await fetch(
      buildBackendUrl(
        `/api/v1/configuration/business-objects/${businessObjectId}/fields/${fieldId}/reference`
      ),
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
        cache: "no-store",
      }
    );

    return await forwardBackendResponse(response);
  } catch (error) {
    return handleProxyError(error, "Field reference POST");
  }
}

export async function PUT(
  request: NextRequest,
  context: {
    params: Promise<{
      businessObjectId: string;
      fieldId: string;
    }>;
  }
) {
  try {
    const { businessObjectId, fieldId } = await context.params;

    const invalidObjUuid = validateUuidParam(businessObjectId, "businessObjectId");
    if (invalidObjUuid) return invalidObjUuid;

    const invalidFieldUuid = validateUuidParam(fieldId, "fieldId");
    if (invalidFieldUuid) return invalidFieldUuid;

    const referenceId = request.nextUrl.searchParams.get("referenceId");
    const invalidRefUuid = validateUuidParam(referenceId, "referenceId");
    if (invalidRefUuid) return invalidRefUuid;

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

    const invalidTargetUuid = validateUuidParam(
      payload.targetBusinessObjectId,
      "targetBusinessObjectId"
    );
    if (invalidTargetUuid) return invalidTargetUuid;

    if (payload.displayFieldId !== null && payload.displayFieldId !== undefined) {
      const invalidDisplayFieldUuid = validateUuidParam(
        payload.displayFieldId,
        "displayFieldId"
      );
      if (invalidDisplayFieldUuid) return invalidDisplayFieldUuid;
    }

    const response = await fetch(
      buildBackendUrl(
        `/api/v1/configuration/business-objects/${businessObjectId}/fields/${fieldId}/reference/${referenceId}`
      ),
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
        cache: "no-store",
      }
    );

    return await forwardBackendResponse(response);
  } catch (error) {
    return handleProxyError(error, "Field reference PUT");
  }
}

export async function DELETE(
  request: NextRequest,
  context: {
    params: Promise<{
      businessObjectId: string;
      fieldId: string;
    }>;
  }
) {
  try {
    const { businessObjectId, fieldId } = await context.params;

    const invalidObjUuid = validateUuidParam(businessObjectId, "businessObjectId");
    if (invalidObjUuid) return invalidObjUuid;

    const invalidFieldUuid = validateUuidParam(fieldId, "fieldId");
    if (invalidFieldUuid) return invalidFieldUuid;

    const referenceId = request.nextUrl.searchParams.get("referenceId");
    const invalidRefUuid = validateUuidParam(referenceId, "referenceId");
    if (invalidRefUuid) return invalidRefUuid;

    const accessToken = await getAccessToken(request);
    if (!accessToken) {
      return unauthorizedResponse("No access token found in session.");
    }

    const response = await fetch(
      buildBackendUrl(
        `/api/v1/configuration/business-objects/${businessObjectId}/fields/${fieldId}/reference/${referenceId}`
      ),
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );

    return await forwardBackendResponse(response);
  } catch (error) {
    return handleProxyError(error, "Field reference DELETE");
  }
}