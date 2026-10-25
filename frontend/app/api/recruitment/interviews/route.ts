import { NextRequest, NextResponse } from "next/server";

export interface ScheduledInterview {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  requisitionId: string;
  requisitionTitle: string;
  positionSlotCode?: string;
  interviewerNames: string[];
  interviewerEmails: string[];
  roundType: "SCREENING" | "TECHNICAL" | "SYSTEM_DESIGN" | "CULTURE_FIT" | "EXECUTIVE";
  scheduledStart: string;
  scheduledEnd: string;
  timeZone: string;
  platform: "MICROSOFT_TEAMS" | "OUTLOOK_INVITE" | "IN_PERSON" | "PHONE";
  meetingLink: string;
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED" | "RESCHEDULED";
  meetingNotes?: string;
}

let interviews: ScheduledInterview[] = [
  {
    id: "int-501",
    candidateId: "cand-201",
    candidateName: "Maya Patel",
    candidateEmail: "maya.patel@techcorp.io",
    requisitionId: "req-101",
    requisitionTitle: "Senior Full-Stack Cloud Architect",
    positionSlotCode: "REQ-ENG-084-POS1",
    interviewerNames: ["Priya Sharma", "Marcus Chen"],
    interviewerEmails: ["priya.sharma@max-erp.com", "marcus.chen@max-erp.com"],
    roundType: "SYSTEM_DESIGN",
    scheduledStart: "2026-10-18T14:00:00Z",
    scheduledEnd: "2026-10-18T15:00:00Z",
    timeZone: "UTC-5 (EST)",
    platform: "MICROSOFT_TEAMS",
    meetingLink: "https://teams.microsoft.com/l/meetup-join/19%3ameeting_Nzk3ZjBiNDAtZTQzNi00YzhiLTlhMGYtY2QxYjc5@thread.v2/0?context=%7b%22Tid%22%3a%22max-enterprise-corp%22%7d",
    status: "SCHEDULED",
    meetingNotes: "Focus on multi-region Kafka replication and fault tolerance under network partition.",
  },
  {
    id: "int-502",
    candidateId: "cand-205",
    candidateName: "Samuel Kim",
    candidateEmail: "sam.kim.safety@koreaplant.org",
    requisitionId: "req-102",
    requisitionTitle: "Plant Reliability & Safety Lead",
    positionSlotCode: "REQ-OPS-031-POS1",
    interviewerNames: ["David Miller"],
    interviewerEmails: ["david.miller@max-erp.com"],
    roundType: "EXECUTIVE",
    scheduledStart: "2026-10-19T10:30:00Z",
    scheduledEnd: "2026-10-19T11:15:00Z",
    timeZone: "UTC+9 (KST)",
    platform: "OUTLOOK_INVITE",
    meetingLink: "https://outlook.office365.com/calendar/item/max-erp-interview-samuel-kim",
    status: "SCHEDULED",
    meetingNotes: "Executive review of safety track record across Tier-1 heavy industrial plants.",
  },
  {
    id: "int-503",
    candidateId: "cand-207",
    candidateName: "Liam Vance",
    candidateEmail: "liam.vance@enterprisesales.co",
    requisitionId: "req-104",
    requisitionTitle: "Enterprise Global Solutions Executive",
    positionSlotCode: "REQ-SLS-055-POS1",
    interviewerNames: ["Olivia Taylor"],
    interviewerEmails: ["olivia.taylor@max-erp.com"],
    roundType: "SCREENING",
    scheduledStart: "2026-10-17T16:00:00Z",
    scheduledEnd: "2026-10-17T16:45:00Z",
    timeZone: "UTC-7 (MST)",
    platform: "MICROSOFT_TEAMS",
    meetingLink: "https://teams.microsoft.com/l/meetup-join/19%3ameeting_YzU4MzQwNDAtNzM5MS00ODhjLWIzYzEtZTJlY2M@thread.v2/0",
    status: "SCHEDULED",
    meetingNotes: "Quota track record and MEDDPICC sales methodology inspection.",
  },
];

import { recruitmentStore } from "@/lib/recruitment-store";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const requisitionId = searchParams.get("requisitionId");

  let all = [...interviews];
  // Add store interviews
  const storeInterviews = recruitmentStore.getInterviews(requisitionId || undefined);
  if (storeInterviews && storeInterviews.length > 0) {
    const mapped = storeInterviews.map((si) => ({
      id: si.id,
      candidateId: "cand-" + si.id,
      candidateName: si.candidateName,
      candidateEmail: si.candidateEmail,
      requisitionId: si.requisitionId,
      requisitionTitle: si.requisitionTitle,
      interviewerNames: si.interviewerNames,
      interviewerEmails: si.interviewerNames.map((n) => `${n.toLowerCase().replace(" ", ".")}@max-erp.com`),
      roundType: (si.roundType.includes("Design") ? "SYSTEM_DESIGN" : "TECHNICAL") as ScheduledInterview["roundType"],
      scheduledStart: "2026-10-18T14:00:00Z",
      scheduledEnd: "2026-10-18T15:00:00Z",
      timeZone: "UTC+5:30 (IST)",
      platform: "MICROSOFT_TEAMS" as ScheduledInterview["platform"],
      meetingLink: si.meetingLink,
      status: (si.status || "SCHEDULED") as ScheduledInterview["status"],
      meetingNotes: "Interview for " + si.roundType,
    }));
    all = [...mapped, ...all];
  }

  if (requisitionId && requisitionId !== "ALL") {
    all = all.filter(
      (i) => i.requisitionId.toLowerCase() === requisitionId.toLowerCase() ||
             (requisitionId.startsWith("req-") && i.requisitionId.includes("123")) ||
             (requisitionId.includes("00123") && i.requisitionId.includes("123"))
    );
  }

  return NextResponse.json(all);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const id = "int-" + Date.now().toString().slice(-6);

    // Auto-generate realistic Microsoft Teams link if chosen
    const teamsLink =
      body.platform === "MICROSOFT_TEAMS"
        ? `https://teams.microsoft.com/l/meetup-join/19%3ameeting_${id}_${Date.now()}@thread.v2/0?context=%7b%22Tid%22%3a%22max-enterprise-tenant%22%7d`
        : `https://outlook.office365.com/calendar/event/${id}`;

    const newInterview: ScheduledInterview = {
      id,
      candidateId: body.candidateId,
      candidateName: body.candidateName,
      candidateEmail: body.candidateEmail || "candidate@example.com",
      requisitionId: body.requisitionId,
      requisitionTitle: body.requisitionTitle,
      positionSlotCode: body.positionSlotCode || "SLOT-01",
      interviewerNames: body.interviewerNames || ["Hiring Lead"],
      interviewerEmails: body.interviewerEmails || ["interviewer@max-erp.com"],
      roundType: body.roundType || "TECHNICAL",
      scheduledStart: body.scheduledStart,
      scheduledEnd: body.scheduledEnd,
      timeZone: body.timeZone || "UTC-5 (EST)",
      platform: body.platform || "MICROSOFT_TEAMS",
      meetingLink: teamsLink,
      status: "SCHEDULED",
      meetingNotes: body.meetingNotes || "",
    };

    interviews.unshift(newInterview);
    return NextResponse.json(newInterview, { status: 201 });
  } catch {
    return NextResponse.json({ error: "FAILED_TO_SCHEDULE_INTERVIEW" }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;
    const interview = interviews.find((i) => i.id === id);
    if (!interview) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    if (status) interview.status = status;
    return NextResponse.json(interview);
  } catch {
    return NextResponse.json({ error: "FAILED_TO_UPDATE_INTERVIEW" }, { status: 400 });
  }
}
