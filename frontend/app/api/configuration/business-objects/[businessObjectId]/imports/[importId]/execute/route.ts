import { NextRequest } from "next/server";
import {
  buildBackendUrl,
  forwardBackendResponse,
  getAccessToken,
  handleProxyError,
  unauthorizedResponse,
  validateUuidParam,
} from "@/app/api/configuration/proxy-helper";

export async function POST(
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
        `/api/v1/configuration/business-objects/${businessObjectId}/imports/${importId}/execute`
      ),
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );

    return await forwardBackendResponse(response);
  } catch (error) {
    return handleProxyError(error, "Business object import execute POST");
  }
}
