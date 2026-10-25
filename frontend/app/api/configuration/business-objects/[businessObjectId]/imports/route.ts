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
        `/api/v1/configuration/business-objects/${businessObjectId}/imports`
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
    return handleProxyError(error, "Business object import history GET");
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

    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return badRequestResponse("Malformed multipart form data.");
    }

    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return badRequestResponse("A non-empty file must be provided for upload.");
    }

    // Forward file to backend multipart endpoint
    const backendFormData = new FormData();
    backendFormData.append("file", file, file.name);

    const response = await fetch(
      buildBackendUrl(
        `/api/v1/configuration/business-objects/${businessObjectId}/imports`
      ),
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
        body: backendFormData,
        cache: "no-store",
      }
    );

    return await forwardBackendResponse(response);
  } catch (error) {
    return handleProxyError(error, "Business object import POST");
  }
}
