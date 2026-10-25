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
  const department = searchParams.get("department") || undefined;
  const status = searchParams.get("status") || undefined;

  try {
    const token = await getAccessToken(request);
    if (token) {
      const queryParams = new URLSearchParams();
      if (department) queryParams.set("department", department);
      if (status) queryParams.set("status", status);

      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";
      const response = await fetch(buildBackendUrl(`/api/v1/workforce/employees${queryString}`), {
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

  // Fallback to EC Core profiles transformed to Employee list format
  let profiles = ecCoreStore.getPeopleProfiles(undefined, department);
  if (status && status !== "ALL") {
    profiles = profiles.filter((p) => p.status === status);
  }

  const employees = profiles.map((p) => ({
    id: p.id,
    employeeNumber: p.job.employeeNumber,
    firstName: p.personal.firstName,
    lastName: p.personal.lastName,
    fullName: `${p.personal.firstName} ${p.personal.lastName}`,
    email: p.personal.personalEmail,
    phone: p.personal.personalPhone,
    department: p.job.department,
    jobTitle: p.job.jobTitle,
    managerId: p.job.managerId,
    managerName: p.job.managerName,
    employmentType: p.job.employmentType,
    workLocation: p.job.workLocation,
    status: p.status,
    hireDate: p.job.hireDate,
    remainingPtoDays: p.leaveBalances.find((b) => b.leaveType === "VACATION")?.availableBalance || 20,
    positionCode: p.job.positionCode,
  }));

  return NextResponse.json(employees);
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
      const response = await fetch(buildBackendUrl("/api/v1/workforce/employees"), {
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

  // Create via EC Core store
  const hireResult = ecCoreStore.hireCandidate({
    candidateId: `cand-${Date.now()}`,
    candidateName: `${body.firstName || "New"} ${body.lastName || "Staff"}`,
    email: body.email,
    phone: body.phone,
    department: body.department,
    jobTitle: body.jobTitle,
    positionCode: body.positionCode || "POS-ENG-084",
    annualSalary: 150000,
  });

  return NextResponse.json(hireResult.employee, { status: 201 });
}
