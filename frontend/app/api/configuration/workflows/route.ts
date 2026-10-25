import { NextRequest, NextResponse } from "next/server";
import {
  badRequestResponse,
  buildBackendUrl,
  forwardBackendResponse,
  getAccessToken,
  isValidUuid,
  unauthorizedResponse,
} from "../proxy-helper";

export async function GET(request: NextRequest) {
  const token = await getAccessToken(request);
  if (!token) {
    return unauthorizedResponse();
  }

  const { searchParams } = new URL(request.url);
  const tenantId = searchParams.get("tenantId");
  const businessObjectId = searchParams.get("businessObjectId");

  if (!tenantId || !isValidUuid(tenantId)) {
    return badRequestResponse("Missing or invalid 'tenantId' query parameter.");
  }

  let backendPath = `/api/v1/tenants/${tenantId}/workflows`;
  if (businessObjectId) {
    if (!isValidUuid(businessObjectId)) {
      return badRequestResponse("Invalid 'businessObjectId' query parameter.");
    }
    backendPath += `?businessObjectId=${businessObjectId}`;
  }

  const response = await fetch(buildBackendUrl(backendPath), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  return forwardBackendResponse(response);
}

export async function POST(request: NextRequest) {
  const token = await getAccessToken(request);
  if (!token) {
    return unauthorizedResponse();
  }

  const { searchParams } = new URL(request.url);
  const tenantId = searchParams.get("tenantId");

  if (!tenantId || !isValidUuid(tenantId)) {
    return badRequestResponse("Missing or invalid 'tenantId' query parameter.");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequestResponse("Malformed JSON request body.");
  }

  const response = await fetch(
    buildBackendUrl(`/api/v1/tenants/${tenantId}/workflows`),
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  return forwardBackendResponse(response);
}
