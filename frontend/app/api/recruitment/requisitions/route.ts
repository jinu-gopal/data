import { NextRequest, NextResponse } from "next/server";
import {
  badRequestResponse,
  buildBackendUrl,
  forwardBackendResponse,
  getAccessToken,
  handleProxyError,
} from "../../configuration/proxy-helper";
import { recruitmentStore } from "@/lib/recruitment-store";

export async function GET(request: NextRequest) {
  try {
    const token = await getAccessToken(request);
    if (token) {
      const { searchParams } = new URL(request.url);
      const department = searchParams.get("department");
      const status = searchParams.get("status");

      const queryParams = new URLSearchParams();
      if (department) queryParams.set("department", department);
      if (status) queryParams.set("status", status);

      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";

      const response = await fetch(buildBackendUrl(`/api/v1/recruitment/requisitions${queryString}`), {
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
  } catch {
    // Proceed to fallback store
  }

  // Resilient fallback from recruitment store
  const { searchParams } = new URL(request.url);
  const department = searchParams.get("department");
  const status = searchParams.get("status");

  let reqs = recruitmentStore.getRequisitions();
  if (department && department !== "ALL") {
    reqs = reqs.filter((r) => r.department.toLowerCase() === department.toLowerCase());
  }
  if (status && status !== "ALL") {
    reqs = reqs.filter((r) => r.status.toLowerCase() === status.toLowerCase());
  }

  return NextResponse.json(reqs);
}

export async function POST(request: NextRequest) {
  try {
    const token = await getAccessToken(request);
    let body: any;
    try {
      body = await request.json();
    } catch {
      return badRequestResponse("Invalid JSON payload.");
    }

    if (token) {
      const response = await fetch(buildBackendUrl("/api/v1/recruitment/requisitions"), {
        method: "POST",
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

    // Save to recruitment store
    const created = recruitmentStore.addRequisition(body);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return handleProxyError(error, "Job Requisitions POST");
  }
}
