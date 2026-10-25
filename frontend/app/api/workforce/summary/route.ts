import { NextRequest, NextResponse } from "next/server";
import {
  buildBackendUrl,
  forwardBackendResponse,
  getAccessToken,
} from "../../configuration/proxy-helper";
import { ecCoreStore } from "@/lib/ec-core-store";

export async function GET(request: NextRequest) {
  try {
    const token = await getAccessToken(request);
    if (token) {
      const response = await fetch(buildBackendUrl("/api/v1/workforce/summary"), {
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
    // Proceed to fallback
  }

  // Fallback to EC Core Store
  const profiles = ecCoreStore.getPeopleProfiles();
  const positions = ecCoreStore.getPositions();
  const leaveRequests = ecCoreStore.getLeaveRequests();

  const totalEmployees = profiles.length;
  const activeEmployees = profiles.filter((p) => p.status === "ACTIVE").length;
  const onLeaveEmployees = profiles.filter((p) => p.status === "ON_LEAVE").length;
  const pendingLeaveRequests = leaveRequests.filter((l) => l.status === "PENDING").length;

  const departmentHeadcount: Record<string, number> = {};
  profiles.forEach((p) => {
    departmentHeadcount[p.job.department] = (departmentHeadcount[p.job.department] || 0) + 1;
  });

  const leadershipTeam = profiles
    .filter((p) => p.job.jobLevel === "C-LEVEL" || p.job.jobLevel === "M-2")
    .map((p) => ({
      id: p.id,
      employeeNumber: p.job.employeeNumber,
      firstName: p.personal.firstName,
      lastName: p.personal.lastName,
      fullName: `${p.personal.firstName} ${p.personal.lastName}`,
      email: p.personal.personalEmail,
      phone: p.personal.personalPhone,
      department: p.job.department,
      jobTitle: p.job.jobTitle,
      employmentType: p.job.employmentType,
      workLocation: p.job.workLocation,
      status: p.status,
      hireDate: p.job.hireDate,
      remainingPtoDays: p.leaveBalances.find((b) => b.leaveType === "VACATION")?.availableBalance || 20,
    }));

  return NextResponse.json({
    totalEmployees,
    activeEmployees,
    onLeaveEmployees,
    onDutyToday: activeEmployees,
    pendingLeaveRequests,
    overallAttendanceRate: 98.4,
    departmentHeadcount,
    leadershipTeam,
    totalPositions: positions.length,
    vacantPositions: positions.filter((p) => p.status === "VACANT").length,
    todaysShifts: [],
    recentLeaves: leaveRequests.slice(0, 5),
  });
}
