import { NextRequest } from "next/server";
import {
  buildBackendUrl,
  forwardBackendResponse,
  getAccessToken,
  handleProxyError,
  unauthorizedResponse,
  badRequestResponse,
  validateUuidParam,
} from "../../../../proxy-helper";

export async function GET(
  request: NextRequest,
  context: {
    params: Promise<{
      businessObjectId: string;
      recordId: string;
    }>;
  }
) {
  try {
    const { businessObjectId, recordId } = await context.params;

    const invalidObjUuid = validateUuidParam(businessObjectId, "businessObjectId");
    if (invalidObjUuid) return invalidObjUuid;

    const invalidRecUuid = validateUuidParam(recordId, "recordId");
    if (invalidRecUuid) return invalidRecUuid;

    const accessToken = await getAccessToken(request);
    if (!accessToken) {
      return unauthorizedResponse("No access token found in session.");
    }

    const response = await fetch(
      buildBackendUrl(
        `/api/v1/configuration/business-objects/${businessObjectId}/records/${recordId}`
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
    return handleProxyError(error, "Business object record GET");
  }
}

export async function PUT(
  request: NextRequest,
  context: {
    params: Promise<{
      businessObjectId: string;
      recordId: string;
    }>;
  }
) {
  try {
    const { businessObjectId, recordId } = await context.params;

    const invalidObjUuid = validateUuidParam(businessObjectId, "businessObjectId");
    if (invalidObjUuid) return invalidObjUuid;

    const invalidRecUuid = validateUuidParam(recordId, "recordId");
    if (invalidRecUuid) return invalidRecUuid;

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

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return badRequestResponse("Record update data must be a valid JSON object.");
    }

    const response = await fetch(
      buildBackendUrl(
        `/api/v1/configuration/business-objects/${businessObjectId}/records/${recordId}`
      ),
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        cache: "no-store",
      }
    );

    return await forwardBackendResponse(response);
  } catch (error) {
    return handleProxyError(error, "Business object record PUT");
  }
}

export async function DELETE(
  request: NextRequest,
  context: {
    params: Promise<{
      businessObjectId: string;
      recordId: string;
    }>;
  }
) {
  try {
    const { businessObjectId, recordId } = await context.params;

    const invalidObjUuid = validateUuidParam(businessObjectId, "businessObjectId");
    if (invalidObjUuid) return invalidObjUuid;

    const invalidRecUuid = validateUuidParam(recordId, "recordId");
    if (invalidRecUuid) return invalidRecUuid;

    const accessToken = await getAccessToken(request);
    if (!accessToken) {
      return unauthorizedResponse("No access token found in session.");
    }

    const response = await fetch(
      buildBackendUrl(
        `/api/v1/configuration/business-objects/${businessObjectId}/records/${recordId}`
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
    return handleProxyError(error, "Business object record DELETE");
  }
}
