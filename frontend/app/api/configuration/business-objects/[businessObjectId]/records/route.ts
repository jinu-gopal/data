import { NextRequest } from "next/server";
import {
  buildBackendUrl,
  forwardBackendResponse,
  getAccessToken,
  handleProxyError,
  unauthorizedResponse,
  badRequestResponse,
  validateUuidParam,
} from "../../../proxy-helper";

export async function GET(
  request: NextRequest,
  context: {
    params: Promise<{ businessObjectId: string }>;
  }
) {
  try {
    const { businessObjectId } = await context.params;

    const invalidUuid = validateUuidParam(businessObjectId, "businessObjectId");
    if (invalidUuid) return invalidUuid;

    const accessToken = await getAccessToken(request);
    if (!accessToken) {
      return unauthorizedResponse("No access token found in session.");
    }

    const response = await fetch(
      buildBackendUrl(
        `/api/v1/configuration/business-objects/${businessObjectId}/records`
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
    return handleProxyError(error, "Business object records GET");
  }
}

export async function POST(
  request: NextRequest,
  context: {
    params: Promise<{ businessObjectId: string }>;
  }
) {
  try {
    const { businessObjectId } = await context.params;

    const invalidUuid = validateUuidParam(businessObjectId, "businessObjectId");
    if (invalidUuid) return invalidUuid;

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
      return badRequestResponse("Record data must be a JSON object of field key-value pairs.");
    }

    const response = await fetch(
      buildBackendUrl(
        `/api/v1/configuration/business-objects/${businessObjectId}/records`
      ),
      {
        method: "POST",
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
    return handleProxyError(error, "Business object record POST");
  }
}