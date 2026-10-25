import { NextRequest, NextResponse } from "next/server";
import {
  badRequestResponse,
  buildBackendUrl,
  forwardBackendResponse,
  getAccessToken,
  handleProxyError,
} from "../../configuration/proxy-helper";

const seededShifts = [
  {
    id: "shift-001",
    employeeId: "emp-101",
    employeeName: "Alexander Wright",
    department: "Executive",
    shiftDate: new Date().toISOString().split("T")[0],
    shiftType: "MORNING",
    startTime: "08:00",
    endTime: "16:30",
    scheduledHours: 8.0,
    location: "HEADQUARTERS",
    status: "CONFIRMED",
  },
  {
    id: "shift-002",
    employeeId: "emp-102",
    employeeName: "Marcus Chen",
    department: "Engineering",
    shiftDate: new Date().toISOString().split("T")[0],
    shiftType: "FLEXIBLE",
    startTime: "09:00",
    endTime: "17:30",
    scheduledHours: 8.0,
    location: "REMOTE",
    status: "IN_PROGRESS",
  },
  {
    id: "shift-003",
    employeeId: "emp-103",
    employeeName: "Victoria Sterling",
    department: "Operations",
    shiftDate: new Date().toISOString().split("T")[0],
    shiftType: "ROTATIONAL",
    startTime: "07:30",
    endTime: "16:00",
    scheduledHours: 8.0,
    location: "HEADQUARTERS",
    status: "CONFIRMED",
  },
];

let customShifts = [...seededShifts];

export async function GET(request: NextRequest) {
  try {
    const token = await getAccessToken(request);
    if (token) {
      try {
        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");
        const employeeId = searchParams.get("employeeId");

        const queryParams = new URLSearchParams();
        if (startDate) queryParams.set("startDate", startDate);
        if (endDate) queryParams.set("endDate", endDate);
        if (employeeId) queryParams.set("employeeId", employeeId);

        const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";

        const response = await fetch(buildBackendUrl(`/api/v1/workforce/shifts${queryString}`), {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (response.ok) {
          return await forwardBackendResponse(response);
        }
      } catch {
        // Proceed to fallback
      }
    }

    return NextResponse.json(customShifts);
  } catch (error) {
    return handleProxyError(error, "Workforce Shifts GET");
  }
}

export async function POST(request: NextRequest) {
  try {
    let body: any;
    try {
      body = await request.json();
    } catch {
      return badRequestResponse("Invalid JSON body.");
    }

    const token = await getAccessToken(request);
    if (token) {
      try {
        const response = await fetch(buildBackendUrl("/api/v1/workforce/shifts"), {
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
      } catch {
        // Proceed to fallback
      }
    }

    const newShift = {
      id: `shift-${Date.now()}`,
      employeeId: body.employeeId || "emp-101",
      employeeName: body.employeeName || "Staff Member",
      department: body.department || "Engineering",
      shiftDate: body.shiftDate || new Date().toISOString().split("T")[0],
      shiftType: body.shiftType || "MORNING",
      startTime: body.startTime || "08:00",
      endTime: body.endTime || "16:30",
      scheduledHours: Number(body.scheduledHours) || 8.0,
      location: body.location || "HEADQUARTERS",
      status: "SCHEDULED",
    };

    customShifts.unshift(newShift);
    return NextResponse.json(newShift, { status: 201 });
  } catch (error) {
    return handleProxyError(error, "Workforce Shifts POST");
  }
}
