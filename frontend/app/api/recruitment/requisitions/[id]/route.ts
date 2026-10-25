import { NextRequest, NextResponse } from "next/server";
import {
  buildBackendUrl,
  forwardBackendResponse,
  getAccessToken,
  handleProxyError,
} from "../../../configuration/proxy-helper";
import { recruitmentStore } from "@/lib/recruitment-store";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const token = await getAccessToken(request);
    if (token) {
      const response = await fetch(buildBackendUrl(`/api/v1/recruitment/requisitions/${id}`), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (response.ok) {
        return await forwardBackendResponse(response);
      }
    }

    // Fallback to store
    const requisition = recruitmentStore.getRequisitionById(id);
    if (!requisition) {
      // Check if ID matches a substring like "123" or "req-048"
      const all = recruitmentStore.getRequisitions();
      const match = all.find(
        (r) =>
          r.id.toLowerCase() === id.toLowerCase() ||
          r.reqNumber.toLowerCase() === id.toLowerCase() ||
          r.reqNumber.toLowerCase().includes(id.toLowerCase())
      );

      if (match) {
        return NextResponse.json(match);
      }

      return NextResponse.json(
        { error: "REQUISITION_NOT_FOUND", message: `Requisition with identifier "${id}" was not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json(requisition);
  } catch (error) {
    return handleProxyError(error, "Requisition GET");
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "BAD_REQUEST", message: "Invalid JSON body" }, { status: 400 });
    }

    const token = await getAccessToken(request);
    if (token) {
      const response = await fetch(buildBackendUrl(`/api/v1/recruitment/requisitions/${id}`), {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        return await forwardBackendResponse(response);
      }
    }

    // Fallback store update
    if (body.status) {
      const updated = recruitmentStore.updateRequisitionStatus(id, body.status);
      if (updated) return NextResponse.json(updated);
    }

    const updated = recruitmentStore.updateRequisition(id, body);
    if (!updated) {
      return NextResponse.json({ error: "NOT_FOUND", message: "Requisition not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    return handleProxyError(error, "Requisition PATCH");
  }
}
