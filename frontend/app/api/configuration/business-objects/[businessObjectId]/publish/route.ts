import { NextRequest } from "next/server";
import {
  buildBackendUrl,
  forwardBackendResponse,
  getAccessToken,
  handleProxyError,
  unauthorizedResponse,
  validateUuidParam,
} from "../../../proxy-helper";

export async function POST(
  request: NextRequest,
  context: {
    params: Promise<{
      businessObjectId: string;
    }>;
  }
) {
  try {
    const { businessObjectId } = await context.params;

    const invalidUuid = validateUuidParam(businessObjectId, "businessObjectId");
    if (invalidUuid) {
      return invalidUuid;
    }

    const accessToken = await getAccessToken(request);
    if (!accessToken) {
      return unauthorizedResponse("No access token found in session.");
    }

    const response = await fetch(
      buildBackendUrl(
        `/api/v1/configuration/business-objects/${businessObjectId}/publish`
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
    return handleProxyError(error, "Business object publish POST");
  }
}
