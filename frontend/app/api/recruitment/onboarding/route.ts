import { NextRequest, NextResponse } from "next/server";

export interface PreOnboardingRecord {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  requisitionId: string;
  requisitionTitle: string;
  department: string;
  targetStartDate: string;
  status: "INITIATED" | "IN_PROGRESS" | "READY_FOR_HIRE" | "COMPLETED";
  progressPct: number;
  tasks: {
    welcomePacketSent: boolean;
    identityDocumentsUploaded: boolean;
    taxFormsCompleted: boolean;
    confidentialitySigned: boolean;
    itHardwareRequested: boolean;
    emailAndAccountsProvisioned: boolean;
    orientationBuddyAssigned: boolean;
  };
  hardwareSelected?: "MACBOOK_PRO_M3" | "THINKPAD_P16" | "DELL_PRECISION";
  workEmailAllocated?: string;
  orientationBuddyName?: string;
  notes?: string;
}

let onboardingRecords: PreOnboardingRecord[] = [
  {
    id: "onb-701",
    candidateId: "cand-206",
    candidateName: "Chloe Bennett",
    candidateEmail: "chloe.bennett@cpa-finance.org",
    requisitionId: "req-103",
    requisitionTitle: "Corporate Financial Planning Analyst",
    department: "Finance",
    targetStartDate: "2026-11-01",
    status: "READY_FOR_HIRE",
    progressPct: 100,
    tasks: {
      welcomePacketSent: true,
      identityDocumentsUploaded: true,
      taxFormsCompleted: true,
      confidentialitySigned: true,
      itHardwareRequested: true,
      emailAndAccountsProvisioned: true,
      orientationBuddyAssigned: true,
    },
    hardwareSelected: "THINKPAD_P16",
    workEmailAllocated: "chloe.bennett@max-erp.com",
    orientationBuddyName: "Arthur Wellesley (FP&A Lead)",
    notes: "All onboarding documentation fully verified and signed. Ready for workforce creation.",
  },
  {
    id: "onb-702",
    candidateId: "cand-203",
    candidateName: "Elena Rostova",
    candidateEmail: "elena.rostova@cloudscale.net",
    requisitionId: "req-101",
    requisitionTitle: "Senior Full-Stack Cloud Architect",
    department: "Engineering",
    targetStartDate: "2026-11-15",
    status: "IN_PROGRESS",
    progressPct: 57,
    tasks: {
      welcomePacketSent: true,
      identityDocumentsUploaded: true,
      taxFormsCompleted: true,
      confidentialitySigned: true,
      itHardwareRequested: false,
      emailAndAccountsProvisioned: false,
      orientationBuddyAssigned: false,
    },
    hardwareSelected: "MACBOOK_PRO_M3",
    workEmailAllocated: "elena.rostova@max-erp.com",
    orientationBuddyName: "Marcus Chen",
    notes: "Welcome packet signed. IT hardware dispatch request queued.",
  },
];

export async function GET() {
  return NextResponse.json(onboardingRecords);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newRecord: PreOnboardingRecord = {
      id: "onb-" + Date.now().toString().slice(-6),
      candidateId: body.candidateId,
      candidateName: body.candidateName,
      candidateEmail: body.candidateEmail,
      requisitionId: body.requisitionId,
      requisitionTitle: body.requisitionTitle,
      department: body.department || "General",
      targetStartDate: body.targetStartDate || "2026-11-15",
      status: "INITIATED",
      progressPct: 14,
      tasks: {
        welcomePacketSent: true,
        identityDocumentsUploaded: false,
        taxFormsCompleted: false,
        confidentialitySigned: false,
        itHardwareRequested: false,
        emailAndAccountsProvisioned: false,
        orientationBuddyAssigned: false,
      },
      hardwareSelected: body.hardwareSelected || "MACBOOK_PRO_M3",
      workEmailAllocated: body.candidateName.toLowerCase().replace(/\s+/g, ".") + "@max-erp.com",
      orientationBuddyName: body.orientationBuddyName || "Assigned Team Mentor",
      notes: "Pre-onboarding process initiated after offer acceptance.",
    };

    onboardingRecords.unshift(newRecord);
    return NextResponse.json(newRecord, { status: 201 });
  } catch {
    return NextResponse.json({ error: "FAILED_TO_INITIATE_ONBOARDING" }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, taskKey, taskValue, status, notes } = body;
    const record = onboardingRecords.find((r) => r.id === id);
    if (!record) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

    if (taskKey && taskKey in record.tasks) {
      (record.tasks as Record<string, boolean>)[taskKey] = Boolean(taskValue);
    }
    if (status) record.status = status;
    if (notes) record.notes = notes;

    // Recalculate progress percentage
    const keys = Object.keys(record.tasks) as Array<keyof typeof record.tasks>;
    const completedCount = keys.filter((k) => record.tasks[k]).length;
    record.progressPct = Math.round((completedCount / keys.length) * 100);

    if (record.progressPct === 100) {
      record.status = "READY_FOR_HIRE";
    }

    return NextResponse.json(record);
  } catch {
    return NextResponse.json({ error: "FAILED_TO_UPDATE_ONBOARDING" }, { status: 400 });
  }
}
