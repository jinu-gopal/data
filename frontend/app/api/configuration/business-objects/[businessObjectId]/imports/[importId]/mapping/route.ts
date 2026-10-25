import { NextRequest } from "next/server";
import {
  buildBackendUrl,
  forwardBackendResponse,
  getAccessToken,
  handleProxyError,
  unauthorizedResponse,
  badRequestResponse,
  validateUuidParam,
} from "@/app/api/configuration/proxy-helper";

export async function GET(
  request: NextRequest,
  context: {
    params: Promise<{
      businessObjectId: string;
      importId: string;
    }>;
  }
) {
  try {
    const { businessObjectId, importId } = await context.params;

    const invalidObjUuid = validateUuidParam(businessObjectId, "businessObjectId");
    if (invalidObjUuid) return invalidObjUuid;

    const invalidImpUuid = validateUuidParam(importId, "importId");
    if (invalidImpUuid) return invalidImpUuid;

    const accessToken = await getAccessToken(request);
    if (!accessToken) {
      return unauthorizedResponse("No access token found in session.");
    }

    const response = await fetch(
      buildBackendUrl(
        `/api/v1/configuration/business-objects/${businessObjectId}/imports/${importId}/mapping`
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
    return handleProxyError(error, "Business object import mapping GET");
  }
}

export async function PUT(
  request: NextRequest,
  context: {
    params: Promise<{
      businessObjectId: string;
      importId: string;
    }>;
  }
) {
  try {
    const { businessObjectId, importId } = await context.params;

    const invalidObjUuid = validateUuidParam(businessObjectId, "businessObjectId");
    if (invalidObjUuid) return invalidObjUuid;

    const invalidImpUuid = validateUuidParam(importId, "importId");
    if (invalidImpUuid) return invalidImpUuid;

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
      return badRequestResponse("Import mapping save request must be a valid JSON object.");
    }

    const response = await fetch(
      buildBackendUrl(
        `/api/v1/configuration/business-objects/${businessObjectId}/imports/${importId}/mapping`
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
    return handleProxyError(error, "Business object import mapping PUT");
  }
}
