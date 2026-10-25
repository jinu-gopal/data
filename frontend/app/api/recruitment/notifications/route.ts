import { NextRequest, NextResponse } from "next/server";

export interface RecruitmentNotification {
  id: string;
  recipientType: "CANDIDATE" | "RECRUITER" | "INTERVIEWER" | "FINANCE_APPROVER";
  recipientName: string;
  recipientEmail: string;
  eventType:
    | "APPLICATION_CONFIRMATION"
    | "INTERVIEW_INVITATION_TEAMS"
    | "ASSESSMENT_INVITATION"
    | "SCORECARD_SUBMITTED"
    | "OFFER_APPROVAL_REQUIRED"
    | "OFFER_LETTER_SENT"
    | "PRE_ONBOARDING_WELCOME";
  subject: string;
  bodyPreview: string;
  status: "SENT" | "DELIVERED" | "QUEUED";
  sentAt: string;
  metadata?: Record<string, string>;
}

let notifications: RecruitmentNotification[] = [
  {
    id: "notif-01",
    recipientType: "CANDIDATE",
    recipientName: "Maya Patel",
    recipientEmail: "maya.patel@techcorp.io",
    eventType: "INTERVIEW_INVITATION_TEAMS",
    subject: "Interview Invitation: System Architecture with MAX-ERP Leadership",
    bodyPreview:
      "Hi Maya, you are invited to a 60-minute technical interview for Senior Full-Stack Cloud Architect on Oct 18, 2026. Teams Link: https://teams.microsoft.com/l/meetup-join/...",
    status: "DELIVERED",
    sentAt: "2026-10-15T14:30:00Z",
    metadata: { requisitionId: "req-101", roundType: "SYSTEM_DESIGN" },
  },
  {
    id: "notif-02",
    recipientType: "INTERVIEWER",
    recipientName: "Priya Sharma",
    recipientEmail: "priya.sharma@max-erp.com",
    eventType: "INTERVIEW_INVITATION_TEAMS",
    subject: "Interview Scheduled: Maya Patel for Senior Cloud Architect",
    bodyPreview:
      "Interview scheduled for Oct 18, 2026 at 14:00 EST. Candidate dossier and interview rating scorecard link attached.",
    status: "DELIVERED",
    sentAt: "2026-10-15T14:30:00Z",
    metadata: { candidateId: "cand-201" },
  },
  {
    id: "notif-03",
    recipientType: "FINANCE_APPROVER",
    recipientName: "Rachel Green (VP Finance)",
    recipientEmail: "rachel.green@max-erp.com",
    eventType: "OFFER_APPROVAL_REQUIRED",
    subject: "Action Required: Compensation Approval for Elena Rostova ($168k Base)",
    bodyPreview:
      "A formal offer has been drafted for Elena Rostova (Senior Cloud Architect). Compensation falls within approved Q4 budget. Please review and sign off.",
    status: "DELIVERED",
    sentAt: "2026-10-15T15:10:00Z",
  },
  {
    id: "notif-04",
    recipientType: "CANDIDATE",
    recipientName: "Elena Rostova",
    recipientEmail: "elena.rostova@cloudscale.net",
    eventType: "OFFER_LETTER_SENT",
    subject: "Official Offer of Employment from MAX Enterprise Global",
    bodyPreview:
      "Dear Elena, we are delighted to offer you the position of Senior Full-Stack Cloud Architect! Please view your offer packet and complete signing.",
    status: "SENT",
    sentAt: "2026-10-15T16:30:00Z",
  },
  {
    id: "notif-05",
    recipientType: "CANDIDATE",
    recipientName: "Chloe Bennett",
    recipientEmail: "chloe.bennett@cpa-finance.org",
    eventType: "PRE_ONBOARDING_WELCOME",
    subject: "Welcome to MAX-ERP! Getting Started with Pre-Onboarding",
    bodyPreview:
      "Welcome to the team Chloe! Please access your onboarding portal to review benefits, verify tax withholding, and select your IT workstation.",
    status: "DELIVERED",
    sentAt: "2026-10-13T10:00:00Z",
  },
];

export async function GET() {
  return NextResponse.json(notifications);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newNotif: RecruitmentNotification = {
      id: "notif-" + Date.now().toString().slice(-6),
      recipientType: body.recipientType || "CANDIDATE",
      recipientName: body.recipientName,
      recipientEmail: body.recipientEmail,
      eventType: body.eventType || "APPLICATION_CONFIRMATION",
      subject: body.subject,
      bodyPreview: body.bodyPreview || "",
      status: "SENT",
      sentAt: new Date().toISOString(),
      metadata: body.metadata || {},
    };

    notifications.unshift(newNotif);
    return NextResponse.json(newNotif, { status: 201 });
  } catch {
    return NextResponse.json({ error: "FAILED_TO_DISPATCH_NOTIFICATION" }, { status: 400 });
  }
}
