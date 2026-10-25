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
        `/api/v1/configuration/business-objects/${businessObjectId}/fields/${fieldId}/options`
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
    return handleProxyError(error, "Field options GET");
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

    const response = await fetch(
      buildBackendUrl(
        `/api/v1/configuration/business-objects/${businessObjectId}/fields/${fieldId}/options`
      ),
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
        cache: "no-store",
      }
    );

    return await forwardBackendResponse(response);
  } catch (error) {
    return handleProxyError(error, "Field options POST");
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

    const optionId = request.nextUrl.searchParams.get("optionId");
    const invalidOptionUuid = validateUuidParam(optionId, "optionId");
    if (invalidOptionUuid) return invalidOptionUuid;

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

    const response = await fetch(
      buildBackendUrl(
        `/api/v1/configuration/business-objects/${businessObjectId}/fields/${fieldId}/options/${optionId}`
      ),
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
        cache: "no-store",
      }
    );

    return await forwardBackendResponse(response);
  } catch (error) {
    return handleProxyError(error, "Field options PUT");
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

    const optionId = request.nextUrl.searchParams.get("optionId");
    const invalidOptionUuid = validateUuidParam(optionId, "optionId");
    if (invalidOptionUuid) return invalidOptionUuid;

    const accessToken = await getAccessToken(request);
    if (!accessToken) {
      return unauthorizedResponse("No access token found in session.");
    }

    const response = await fetch(
      buildBackendUrl(
        `/api/v1/configuration/business-objects/${businessObjectId}/fields/${fieldId}/options/${optionId}`
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
    return handleProxyError(error, "Field options DELETE");
  }
}