import { NextRequest, NextResponse } from "next/server";

export interface BgvCheck {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  requisitionId: string;
  requisitionTitle: string;
  provider: "INTERNAL_HR" | "CHECKR_GLOBAL" | "FIRST_ADVANTAGE";
  status: "INITIATED" | "IN_PROGRESS" | "CLEARED" | "FLAGGED" | "REJECTED";
  checks: {
    criminalCheck: "PENDING" | "PASSED" | "FLAGGED";
    educationVerification: "PENDING" | "PASSED" | "FLAGGED";
    employmentHistory: "PENDING" | "PASSED" | "FLAGGED";
    identityAndDrug: "PENDING" | "PASSED" | "FLAGGED";
  };
  initiatedAt: string;
  completedAt?: string;
  assignedInvestigator: string;
  reportNotes?: string;
}

let bgvChecks: BgvCheck[] = [
  {
    id: "bgv-401",
    candidateId: "cand-206",
    candidateName: "Chloe Bennett",
    candidateEmail: "chloe.bennett@cpa-finance.org",
    requisitionId: "req-103",
    requisitionTitle: "Corporate Financial Planning Analyst",
    provider: "CHECKR_GLOBAL",
    status: "CLEARED",
    checks: {
      criminalCheck: "PASSED",
      educationVerification: "PASSED",
      employmentHistory: "PASSED",
      identityAndDrug: "PASSED",
    },
    initiatedAt: "2026-10-11T09:00:00Z",
    completedAt: "2026-10-13T14:30:00Z",
    assignedInvestigator: "Checkr Automated Suite & HR Team",
    reportNotes: "All criminal, financial credit history, and CPA certification credentials fully verified with zero adverse findings.",
  },
  {
    id: "bgv-402",
    candidateId: "cand-203",
    candidateName: "Elena Rostova",
    candidateEmail: "elena.rostova@cloudscale.net",
    requisitionId: "req-101",
    requisitionTitle: "Senior Full-Stack Cloud Architect",
    provider: "INTERNAL_HR",
    status: "IN_PROGRESS",
    checks: {
      criminalCheck: "PASSED",
      educationVerification: "PASSED",
      employmentHistory: "PENDING",
      identityAndDrug: "PASSED",
    },
    initiatedAt: "2026-10-15T10:00:00Z",
    assignedInvestigator: "Brenda Vance (Senior HR Compliance Lead)",
    reportNotes: "Previous employment reference check pending HR response from CloudScale Networks.",
  },
];

export async function GET() {
  return NextResponse.json(bgvChecks);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newCheck: BgvCheck = {
      id: "bgv-" + Date.now().toString().slice(-6),
      candidateId: body.candidateId,
      candidateName: body.candidateName,
      candidateEmail: body.candidateEmail,
      requisitionId: body.requisitionId,
      requisitionTitle: body.requisitionTitle,
      provider: body.provider || "CHECKR_GLOBAL",
      status: "INITIATED",
      checks: {
        criminalCheck: "PENDING",
        educationVerification: "PENDING",
        employmentHistory: "PENDING",
        identityAndDrug: "PENDING",
      },
      initiatedAt: new Date().toISOString(),
      assignedInvestigator: body.assignedInvestigator || "HR Compliance Specialist",
      reportNotes: body.reportNotes || "Background screening package initiated.",
    };

    bgvChecks.unshift(newCheck);
    return NextResponse.json(newCheck, { status: 201 });
  } catch {
    return NextResponse.json({ error: "FAILED_TO_INITIATE_BGV" }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, reportNotes, checks } = body;
    const check = bgvChecks.find((b) => b.id === id);
    if (!check) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

    if (status) check.status = status;
    if (reportNotes) check.reportNotes = reportNotes;
    if (checks) check.checks = { ...check.checks, ...checks };

    if (status === "CLEARED" || status === "FLAGGED" || status === "REJECTED") {
      check.completedAt = new Date().toISOString();
    }

    return NextResponse.json(check);
  } catch {
    return NextResponse.json({ error: "FAILED_TO_UPDATE_BGV" }, { status: 400 });
  }
}
