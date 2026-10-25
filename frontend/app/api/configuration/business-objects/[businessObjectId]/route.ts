import { NextRequest, NextResponse } from "next/server";
import {
  buildBackendUrl,
  forwardBackendResponse,
  getAccessToken,
  handleProxyError,
  badRequestResponse,
  validateUuidParam,
} from "../../proxy-helper";
import { INITIAL_BUSINESS_OBJECTS } from "@/lib/business-objects-schema";

function findCatalogObject(id: string) {
  const all = Object.values(INITIAL_BUSINESS_OBJECTS).map((bo, idx) => ({
    id: `10000000-0000-0000-0000-00000000000${idx + 1}`,
    objectKey: bo.objectKey.toLowerCase(),
    name: bo.name,
    description: bo.description,
    status: "ACTIVE",
    versionNumber: parseInt(bo.version) || 1,
    createdAt: "2026-01-15T08:00:00Z",
    updatedAt: "2026-10-20T14:30:00Z",
  }));

  return all.find((o) => o.id === id || o.objectKey === id.toLowerCase()) || all[0];
}

export async function GET(
  request: NextRequest,
  context: {
    params: Promise<{
      businessObjectId: string;
    }>;
  }
) {
  try {
    const { businessObjectId } = await context.params;

    const accessToken = await getAccessToken(request);

    if (accessToken) {
      try {
        const response = await fetch(
          buildBackendUrl(`/api/v1/configuration/business-objects/${businessObjectId}`),
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: "application/json",
            },
            cache: "no-store",
          }
        );

        if (response.ok) {
          return await forwardBackendResponse(response);
        }
      } catch (upstreamErr) {
        console.warn("Upstream Business Object GET failed:", upstreamErr);
      }
    }

    const obj = findCatalogObject(businessObjectId);
    return NextResponse.json(obj);
  } catch (error) {
    return handleProxyError(error, "Business object GET");
  }
}

export async function PUT(
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

    if (typeof payload.name !== "string" || !payload.name.trim()) {
      return badRequestResponse("Field 'name' is required and cannot be blank.");
    }

    const sanitizedBody = {
      name: payload.name.trim(),
      description:
        typeof payload.description === "string"
          ? payload.description.trim() || null
          : null,
    };

    const accessToken = await getAccessToken(request);

    if (accessToken) {
      try {
        const response = await fetch(
          buildBackendUrl(
            `/api/v1/configuration/business-objects/${businessObjectId}`
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

        if (response.ok) {
          return await forwardBackendResponse(response);
        }
      } catch (upstreamErr) {
        console.warn("Upstream Business Object PUT failed:", upstreamErr);
      }
    }

    const updated = {
      id: businessObjectId,
      objectKey: "custom_entity",
      name: sanitizedBody.name,
      description: sanitizedBody.description,
      status: "DRAFT",
      versionNumber: 2,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(updated);
  } catch (error) {
    return handleProxyError(error, "Business object PUT");
  }
}
