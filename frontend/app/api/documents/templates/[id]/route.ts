import { NextRequest } from "next/server";
import {
  badRequestResponse,
  buildBackendUrl,
  forwardBackendResponse,
  getAccessToken,
  handleProxyError,
  unauthorizedResponse,
} from "../../../configuration/proxy-helper";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getAccessToken(request);
    if (!token) return unauthorizedResponse();

    const { id } = await params;
    const response = await fetch(buildBackendUrl(`/api/v1/documents/templates/${encodeURIComponent(id)}`), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    return await forwardBackendResponse(response);
  } catch (error) {
    return handleProxyError(error, "Document Template GET by ID");
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getAccessToken(request);
    if (!token) return unauthorizedResponse();

    const { id } = await params;
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return badRequestResponse("Invalid JSON payload.");
    }

    const response = await fetch(buildBackendUrl(`/api/v1/documents/templates/${encodeURIComponent(id)}`), {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    return await forwardBackendResponse(response);
  } catch (error) {
    return handleProxyError(error, "Document Template PUT");
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getAccessToken(request);
    if (!token) return unauthorizedResponse();

    const { id } = await params;
    const response = await fetch(buildBackendUrl(`/api/v1/documents/templates/${encodeURIComponent(id)}`), {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return await forwardBackendResponse(response);
  } catch (error) {
    return handleProxyError(error, "Document Template DELETE");
  }
}
