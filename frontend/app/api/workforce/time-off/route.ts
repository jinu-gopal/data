import { NextRequest, NextResponse } from "next/server";
import { ecCoreStore } from "@/lib/ec-core-store";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get("employeeId");

    const leaveRequests = ecCoreStore.getLeaveRequests({ employeeId: employeeId || undefined });

    let employeeProfile = null;
    let balances = null;
    if (employeeId) {
      employeeProfile = ecCoreStore.getPeopleProfileById(employeeId);
      if (employeeProfile) {
        balances = employeeProfile.leaveBalances;
      }
    }

    // Time-off policies
    const policies = [
      {
        leaveType: "VACATION",
        name: "Annual Paid Vacation",
        annualEntitlementDays: 25,
        accrualFrequency: "Monthly (2.08 days/mo)",
        maxCarryOverDays: 5,
        noticeDaysRequired: 7,
        description: "Paid annual personal time for rest, travel, and recharge.",
      },
      {
        leaveType: "SICK",
        name: "Medical & Health Absence",
        annualEntitlementDays: 12,
        accrualFrequency: "Annual Frontload on Jan 1",
        maxCarryOverDays: 0,
        noticeDaysRequired: 0,
        description: "Full salary coverage for employee illness, injury, and healthcare appointments.",
      },
      {
        leaveType: "PARENTAL",
        name: "Global Parental Bonding Leave",
        annualEntitlementDays: 60,
        accrualFrequency: "Event-based entitlement",
        maxCarryOverDays: 0,
        noticeDaysRequired: 30,
        description: "12 weeks of 100% paid leave for primary or secondary caregivers upon birth or adoption.",
      },
      {
        leaveType: "BEREAVEMENT",
        name: "Compassionate Leave",
        annualEntitlementDays: 5,
        accrualFrequency: "Event-based entitlement",
        maxCarryOverDays: 0,
        noticeDaysRequired: 0,
        description: "Paid compassionate time for loss of immediate or extended family members.",
      },
      {
        leaveType: "FLOATING",
        name: "Floating Cultural / Wellness Holiday",
        annualEntitlementDays: 3,
        accrualFrequency: "Annual Frontload on Jan 1",
        maxCarryOverDays: 0,
        noticeDaysRequired: 2,
        description: "Discretionary cultural, civic, or mental wellness days.",
      },
      {
        leaveType: "STUDY",
        name: "Professional Development & Study",
        annualEntitlementDays: 5,
        accrualFrequency: "Annual Frontload on Jan 1",
        maxCarryOverDays: 0,
        noticeDaysRequired: 14,
        description: "Approved technical certification, exam preparation, or academic courses.",
      },
    ];

    // Upcoming calendar absence events
    const approvedRequests = leaveRequests.filter((l) => l.status === "APPROVED");
    const calendarEvents = approvedRequests.map((r) => ({
      id: r.id,
      employeeId: r.employeeId,
      employeeName: r.employeeName,
      department: r.department,
      leaveType: r.leaveType,
      startDate: r.startDate,
      endDate: r.endDate,
      totalDays: r.totalDays,
    }));

    return NextResponse.json({
      requests: leaveRequests,
      balances,
      policies,
      calendarEvents,
      metrics: {
        totalRequests: leaveRequests.length,
        pendingApprovals: leaveRequests.filter((l) => l.status === "PENDING").length,
        approvedTotal: approvedRequests.length,
        rejectedTotal: leaveRequests.filter((l) => l.status === "REJECTED").length,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: "FAILED_TO_FETCH_TIME_OFF", message: err.message }, { status: 500 });
  }
}
