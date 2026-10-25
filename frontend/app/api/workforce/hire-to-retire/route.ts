import { NextRequest, NextResponse } from "next/server";
import { ecCoreStore } from "@/lib/ec-core-store";

export async function GET() {
  try {
    const transitions = ecCoreStore.getH2RTransitions();
    const positions = ecCoreStore.getPositions();
    const profiles = ecCoreStore.getPeopleProfiles();

    return NextResponse.json({
      transitions,
      metrics: {
        totalTransitions: transitions.length,
        newHiresCount: transitions.filter((t) => t.transitionType === "NEW_HIRE").length,
        promotionsCount: transitions.filter((t) => t.transitionType === "PROMOTION").length,
        transfersCount: transitions.filter((t) => t.transitionType === "TRANSFER").length,
        retirementsCount: transitions.filter((t) => t.transitionType === "RETIREMENT").length,
        activeHeadcount: profiles.filter((p) => p.status === "ACTIVE").length,
        vacantPositionsCount: positions.filter((p) => p.status === "VACANT").length,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: "FAILED_TO_FETCH_H2R", message: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action; // "HIRE_CANDIDATE" | "JOB_CHANGE" | "LEAVE_OF_ABSENCE" | "RETIRE_SEPARATE"

    switch (action) {
      case "HIRE_CANDIDATE": {
        if (!body.candidateId || !body.candidateName || !body.email || !body.positionCode) {
          return NextResponse.json(
            { error: "BAD_REQUEST", message: "candidateId, candidateName, email, and positionCode are required." },
            { status: 400 }
          );
        }

        const result = ecCoreStore.hireCandidate({
          candidateId: body.candidateId,
          candidateName: body.candidateName,
          email: body.email,
          phone: body.phone,
          positionCode: body.positionCode,
          requisitionId: body.requisitionId,
          department: body.department,
          jobTitle: body.jobTitle,
          managerName: body.managerName,
          annualSalary: body.annualSalary ? Number(body.annualSalary) : undefined,
          startDate: body.startDate,
          workAuthorization: body.workAuthorization,
        });

        return NextResponse.json(result, { status: 201 });
      }

      case "JOB_CHANGE": {
        if (!body.employeeId || !body.newPositionCode) {
          return NextResponse.json(
            { error: "BAD_REQUEST", message: "employeeId and newPositionCode are required." },
            { status: 400 }
          );
        }

        const result = ecCoreStore.executeJobChange({
          employeeId: body.employeeId,
          newPositionCode: body.newPositionCode,
          newDepartment: body.newDepartment,
          newJobTitle: body.newJobTitle,
          newSalary: body.newSalary ? Number(body.newSalary) : undefined,
          newManagerName: body.newManagerName,
          changeReason: body.changeReason || "PROMOTION",
          effectiveDate: body.effectiveDate || new Date().toISOString().split("T")[0],
          notes: body.notes,
        });

        if (!result) {
          return NextResponse.json({ error: "NOT_FOUND", message: `Employee ${body.employeeId} not found.` }, { status: 404 });
        }

        return NextResponse.json(result);
      }

      case "LEAVE_OF_ABSENCE": {
        if (!body.employeeId || !body.loaAction) {
          return NextResponse.json(
            { error: "BAD_REQUEST", message: "employeeId and loaAction (START_LEAVE | RETURN_FROM_LEAVE) are required." },
            { status: 400 }
          );
        }

        const updated = ecCoreStore.toggleLeaveOfAbsence(
          body.employeeId,
          body.loaAction,
          body.effectiveDate || new Date().toISOString().split("T")[0],
          body.reason
        );

        if (!updated) {
          return NextResponse.json({ error: "NOT_FOUND", message: `Employee ${body.employeeId} not found.` }, { status: 404 });
        }

        return NextResponse.json(updated);
      }

      case "RETIRE_SEPARATE": {
        if (!body.employeeId || !body.separationType) {
          return NextResponse.json(
            { error: "BAD_REQUEST", message: "employeeId and separationType are required." },
            { status: 400 }
          );
        }

        const result = ecCoreStore.retireOrSeparate({
          employeeId: body.employeeId,
          separationType: body.separationType,
          effectiveDate: body.effectiveDate || new Date().toISOString().split("T")[0],
          reason: body.reason || "Planned retirement transition",
          assetsReturned: body.assetsReturned || ["Laptop", "Security Access Card", "Corporate Card"],
          severancePayoutUsd: body.severancePayoutUsd ? Number(body.severancePayoutUsd) : 0,
        });

        if (!result) {
          return NextResponse.json({ error: "NOT_FOUND", message: `Employee ${body.employeeId} not found.` }, { status: 404 });
        }

        return NextResponse.json(result);
      }

      default:
        return NextResponse.json(
          { error: "BAD_REQUEST", message: `Unknown H2R lifecycle action: ${action}` },
          { status: 400 }
        );
    }
  } catch (err: any) {
    return NextResponse.json({ error: "FAILED_TO_PROCESS_H2R", message: err.message }, { status: 500 });
  }
}
