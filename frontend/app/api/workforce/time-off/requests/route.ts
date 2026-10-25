import { NextRequest, NextResponse } from "next/server";
import { ecCoreStore } from "@/lib/ec-core-store";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get("employeeId") || undefined;
    const status = searchParams.get("status") || undefined;

    const requests = ecCoreStore.getLeaveRequests({ employeeId, status });
    return NextResponse.json(requests);
  } catch (err: any) {
    return NextResponse.json({ error: "FAILED_TO_FETCH_LEAVE_REQUESTS", message: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.employeeId || !body.leaveType || !body.startDate || !body.endDate) {
      return NextResponse.json(
        { error: "BAD_REQUEST", message: "employeeId, leaveType, startDate, and endDate are required." },
        { status: 400 }
      );
    }

    const totalDays = Number(body.totalDays) > 0 ? Number(body.totalDays) : 1;
    const leave = ecCoreStore.submitLeaveRequest({
      employeeId: body.employeeId,
      leaveType: body.leaveType,
      startDate: body.startDate,
      endDate: body.endDate,
      totalDays,
      reason: body.reason || "General absence",
    });

    return NextResponse.json(leave, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: "FAILED_TO_SUBMIT_LEAVE", message: err.message }, { status: 500 });
  }
}
