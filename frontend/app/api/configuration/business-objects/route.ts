import { NextRequest, NextResponse } from "next/server";
import {
  buildBackendUrl,
  forwardBackendResponse,
  getAccessToken,
  handleProxyError,
  badRequestResponse,
} from "../proxy-helper";
import { INITIAL_BUSINESS_OBJECTS } from "@/lib/business-objects-schema";

// In-memory catalog store for development / offline fallback
const customObjectsStore: Array<{
  id: string;
  objectKey: string;
  name: string;
  description: string | null;
  status: string;
  versionNumber: number;
  createdAt: string;
  updatedAt: string;
}> = [];

function getCatalogObjects() {
  const baseObjects = Object.values(INITIAL_BUSINESS_OBJECTS).map((bo, idx) => ({
    id: `10000000-0000-0000-0000-00000000000${idx + 1}`,
    objectKey: bo.objectKey.toLowerCase(),
    name: bo.name,
    description: bo.description,
    status: "ACTIVE",
    versionNumber: parseInt(bo.version) || 1,
    createdAt: "2026-01-15T08:00:00Z",
    updatedAt: "2026-10-20T14:30:00Z",
  }));

  return [...baseObjects, ...customObjectsStore];
}

export async function GET(request: NextRequest) {
  try {
    const accessToken = await getAccessToken(request);

    if (accessToken) {
      try {
        const response = await fetch(
          buildBackendUrl("/api/v1/configuration/business-objects"),
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
        console.warn("Upstream Business Objects fetch failed, using schema catalog:", upstreamErr);
      }
    }

    return NextResponse.json(getCatalogObjects());
  } catch (error) {
    return handleProxyError(error, "Business objects list GET");
  }
}

export async function POST(request: NextRequest) {
  try {
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
      typeof payload.objectKey !== "string" ||
      !payload.objectKey.trim() ||
      typeof payload.name !== "string" ||
      !payload.name.trim()
    ) {
      return badRequestResponse("objectKey and name are required.");
    }

    const sanitizedBody = {
      objectKey: payload.objectKey.trim(),
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
          buildBackendUrl("/api/v1/configuration/business-objects"),
          {
            method: "POST",
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
        console.warn("Upstream Business Object create failed, storing locally:", upstreamErr);
      }
    }

    const newObj = {
      id: crypto.randomUUID(),
      objectKey: sanitizedBody.objectKey.toLowerCase(),
      name: sanitizedBody.name,
      description: sanitizedBody.description,
      status: "DRAFT",
      versionNumber: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    customObjectsStore.push(newObj);
    return NextResponse.json(newObj, { status: 201 });
  } catch (error) {
    return handleProxyError(error, "Business object create POST");
  }
}
