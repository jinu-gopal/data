import { NextRequest, NextResponse } from "next/server";
import {
  badRequestResponse,
  buildBackendUrl,
  forwardBackendResponse,
  getAccessToken,
} from "../../configuration/proxy-helper";
import { ecCoreStore } from "@/lib/ec-core-store";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || undefined;
  const employeeId = searchParams.get("employeeId") || undefined;

  try {
    const token = await getAccessToken(request);
    if (token) {
      const queryParams = new URLSearchParams();
      if (status) queryParams.set("status", status);
      if (employeeId) queryParams.set("employeeId", employeeId);

      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";
      const response = await fetch(buildBackendUrl(`/api/v1/workforce/leaves${queryString}`), {
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
    // Fallback
  }

  // Fallback to EC Core store
  const leaves = ecCoreStore.getLeaveRequests({ employeeId, status });
  return NextResponse.json(leaves);
}

export async function POST(request: NextRequest) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return badRequestResponse("Invalid JSON body.");
  }

  try {
    const token = await getAccessToken(request);
    if (token) {
      const response = await fetch(buildBackendUrl("/api/v1/workforce/leaves"), {
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
  } catch {
    // Fallback
  }

  // Fallback to EC Core store
  const leave = ecCoreStore.submitLeaveRequest({
    employeeId: body.employeeId || "emp-006",
    leaveType: body.leaveType || "VACATION",
    startDate: body.startDate,
    endDate: body.endDate,
    totalDays: body.totalDays || 1,
    reason: body.reason || "General leave request",
  });

  return NextResponse.json(leave, { status: 201 });
}
