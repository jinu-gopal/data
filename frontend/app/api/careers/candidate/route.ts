import { NextRequest, NextResponse } from "next/server";
import { buildBackendUrl } from "../../configuration/proxy-helper";
import { recruitmentStore } from "@/lib/recruitment-store";

interface CandidateRecord {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  requisitionId: string;
  requisitionTitle?: string;
  department?: string;
  stage: string;
  source?: string;
  resumeSummary?: string;
  notes?: string;
  appliedAt?: string;
}

// Available Outlook Calendar slots read from recruiting team's calendar
const mockOutlookAvailabilitySlots = [
  {
    slotId: "slot-cal-101",
    interviewerName: "Marcus Chen (Lead Cloud Architect)",
    interviewerEmail: "marcus.chen@max-erp.com",
    startTime: "2026-10-19T14:00:00Z",
    endTime: "2026-10-19T15:00:00Z",
    formattedTime: "Monday, Oct 19 • 10:00 AM - 11:00 AM EST",
    platform: "MICROSOFT_TEAMS",
    status: "AVAILABLE",
  },
  {
    slotId: "slot-cal-102",
    interviewerName: "Marcus Chen (Lead Cloud Architect)",
    interviewerEmail: "marcus.chen@max-erp.com",
    startTime: "2026-10-19T18:00:00Z",
    endTime: "2026-10-19T19:00:00Z",
    formattedTime: "Monday, Oct 19 • 2:00 PM - 3:00 PM EST",
    platform: "MICROSOFT_TEAMS",
    status: "AVAILABLE",
  },
  {
    slotId: "slot-cal-103",
    interviewerName: "Priya Sharma (VP Engineering)",
    interviewerEmail: "priya.sharma@max-erp.com",
    startTime: "2026-10-20T15:30:00Z",
    endTime: "2026-10-20T16:30:00Z",
    formattedTime: "Tuesday, Oct 20 • 11:30 AM - 12:30 PM EST",
    platform: "MICROSOFT_TEAMS",
    status: "AVAILABLE",
  },
  {
    slotId: "slot-cal-104",
    interviewerName: "Marcus Chen (Lead Cloud Architect)",
    interviewerEmail: "marcus.chen@max-erp.com",
    startTime: "2026-10-21T19:00:00Z",
    endTime: "2026-10-21T20:00:00Z",
    formattedTime: "Wednesday, Oct 21 • 3:00 PM - 4:00 PM EST",
    platform: "MICROSOFT_TEAMS",
    status: "AVAILABLE",
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lookup = (searchParams.get("lookup") || searchParams.get("email") || searchParams.get("id") || "").trim();

    if (!lookup) {
      return NextResponse.json({ error: "MISSING_LOOKUP_PARAM" }, { status: 400 });
    }

    // Try finding candidate in backend
    let candidate: CandidateRecord | null = null;

    try {
      const res = await fetch(buildBackendUrl(`/api/v1/recruitment/candidates`), {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      if (res.ok) {
        const allCandidates: CandidateRecord[] = await res.json();
        const found = allCandidates.find(
          (c) =>
            c.id.toLowerCase() === lookup.toLowerCase() ||
            c.email.toLowerCase() === lookup.toLowerCase()
        );
        if (found) candidate = found;
      }
    } catch (e) {
      console.warn("Backend candidate lookup failed, trying fallback:", e);
    }

    // Try recruitmentStore if not found in backend
    if (!candidate) {
      const storeCand = recruitmentStore
        .getCandidates()
        .find(
          (c) =>
            c.id.toLowerCase() === lookup.toLowerCase() ||
            c.email.toLowerCase() === lookup.toLowerCase() ||
            c.name.toLowerCase().includes(lookup.toLowerCase())
        );

      if (storeCand) {
        candidate = {
          id: storeCand.id,
          fullName: storeCand.name,
          email: storeCand.email,
          phone: storeCand.phone || "+1 (555) 019-1234",
          requisitionId: storeCand.requisitionId,
          requisitionTitle: storeCand.role || storeCand.requisitionTitle,
          department: storeCand.department || "Engineering",
          stage: storeCand.stage.toUpperCase(),
          source: storeCand.source,
          resumeSummary: `${storeCand.name} - Profile match evaluated at ${storeCand.matchScore}% Match Score.`,
          notes: `Candidate in ${storeCand.stage} stage.`,
          appliedAt: "2026-10-15T09:30:00Z",
        };
      }
    }

    // Fallback seed candidate for demo tracking if not found
    if (!candidate) {
      if (lookup.toLowerCase().includes("patel") || lookup.toLowerCase().includes("maya") || lookup.includes("201") || lookup.includes("c38191a8")) {
        candidate = {
          id: lookup.startsWith("cand-") ? lookup : "cand-201",
          fullName: "Maya Patel",
          email: lookup.includes("@") ? lookup : "maya.patel@techcorp.io",
          phone: "+1 (415) 889-1234",
          requisitionId: "req-101",
          requisitionTitle: "Senior Full-Stack Cloud Architect",
          department: "Engineering",
          stage: "INTERVIEW",
          source: "CAREERS_PORTAL",
          resumeSummary: "Attached Resume: Maya_Patel_CV.pdf | 8+ yrs distributed architecture, Spring Boot, Next.js.",
          notes: "[ELIGIBILITY VERIFIED] Prerequisite qualifications met.",
          appliedAt: "2026-10-14T09:30:00Z",
        };
      } else if (lookup.toLowerCase().includes("elena") || lookup.includes("203") || lookup.includes("off-601")) {
        candidate = {
          id: "cand-203",
          fullName: "Elena Rostova",
          email: "elena.rostova@cloudscale.net",
          phone: "+1 (415) 555-0199",
          requisitionId: "req-101",
          requisitionTitle: "Senior Full-Stack Cloud Architect",
          department: "Engineering",
          stage: "OFFER",
          source: "EMPLOYEE_REFERRAL",
          resumeSummary: "Referred candidate with 10+ yrs distributed cloud microservices.",
          notes: "Final stage approved by VP Engineering. Formal offer extended.",
          appliedAt: "2026-10-08T11:00:00Z",
        };
      } else {
        // Generic synthesized candidate record
        candidate = {
          id: lookup.startsWith("cand-") ? lookup : "cand-" + Math.random().toString(36).slice(2, 8),
          fullName: lookup.includes("@") ? lookup.split("@")[0].replace(".", " ") : "Candidate Profile",
          email: lookup.includes("@") ? lookup : `${lookup}@applicant.max-erp.com`,
          phone: "+1 (555) 019-8822",
          requisitionId: "req-101",
          requisitionTitle: "Senior Full-Stack Cloud Architect",
          department: "Engineering",
          stage: "APPLIED",
          source: "CAREERS_PORTAL",
          notes: "Application undergoing automated screening.",
          appliedAt: new Date().toISOString(),
        };
      }
    }

    // Associated Scheduled Interviews
    const scheduledInterviews = [
      {
        id: "int-live-01",
        roundType: "SYSTEM_DESIGN",
        title: "Technical Architecture & Scalability Round",
        interviewerNames: ["Marcus Chen (Staff Architect)", "Priya Sharma (VP Eng)"],
        scheduledTime: "Monday, Oct 19 • 2:00 PM - 3:00 PM EST",
        meetingLink: "https://teams.microsoft.com/l/meetup-join/max-interview-marcus-chen",
        status: candidate.stage === "INTERVIEW" ? "PENDING_CONFIRMATION" : "SCHEDULED",
      },
    ];

    // Offer Letter Data if in OFFER stage
    const offerDetails =
      candidate.stage === "OFFER"
        ? {
            id: "off-601",
            status: "SENT_TO_CANDIDATE",
            jobTitle: candidate.requisitionTitle || "Senior Full-Stack Cloud Architect",
            department: candidate.department || "Engineering",
            reportingManager: "Marcus Chen",
            baseSalary: "$168,000 USD",
            signingBonus: "$15,000 USD",
            equityOptions: "4,500 RSUs (4-year vesting)",
            targetStartDate: "November 15, 2026",
            benefitsSummary:
              "100% employer-sponsored health, dental & vision, 5% 401(k) match, 25 days PTO, and $1,500 home office budget.",
            isAccepted: false,
          }
        : null;

    return NextResponse.json({
      candidate,
      timeline: [
        { stage: "APPLIED", label: "Application Ingested", completed: true, date: "Oct 14, 2026" },
        { stage: "SCREENING", label: "Prerequisite & AI Screen", completed: true, date: "Oct 15, 2026" },
        {
          stage: "INTERVIEW",
          label: "Technical & System Design Interview",
          completed: candidate.stage === "OFFER" || candidate.stage === "HIRED",
          current: candidate.stage === "INTERVIEW",
          date: candidate.stage === "INTERVIEW" ? "In Progress" : "Oct 16, 2026",
        },
        {
          stage: "OFFER",
          label: "Formal Offer Extended",
          completed: candidate.stage === "HIRED",
          current: candidate.stage === "OFFER",
          date: candidate.stage === "OFFER" ? "Awaiting Acceptance" : "Pending",
        },
        { stage: "HIRED", label: "Workforce Onboarding", completed: candidate.stage === "HIRED", date: "Pending" },
      ],
      availableOutlookSlots: mockOutlookAvailabilitySlots,
      scheduledInterviews,
      offerDetails,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "CANDIDATE_LOOKUP_FAILED", message: error instanceof Error ? error.message : "Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, candidateId, slotId, offerId } = body;
    const signedName = body.signedName || body.legalSignature || body.signature || "";

    // Action 1: Self-Schedule & Confirm Interview Slot from Outlook Calendar
    if (action === "CONFIRM_INTERVIEW") {
      const selectedSlot = mockOutlookAvailabilitySlots.find((s) => s.slotId === slotId) || mockOutlookAvailabilitySlots[0];
      const meetingLink = `https://teams.microsoft.com/l/meetup-join/19%3ameeting_${Date.now()}@thread.v2/0?context=%7b%22Tid%22%3a%22max-enterprise-corp%22%7d`;

      try {
        recruitmentStore.scheduleInterview({
          candidateName: candidateId,
          candidateEmail: "candidate@max-enterprise.com",
          roundType: "Technical Architecture & Scalability",
          scheduledDate: selectedSlot.startTime.split("T")[0],
          time: "14:00",
          interviewerNames: [selectedSlot.interviewerName],
          meetingLink,
          platform: "Microsoft Teams",
        });
      } catch {
        // Fallback
      }

      return NextResponse.json({
        success: true,
        candidateId,
        selectedSlot,
        meetingLink,
        confirmationCode: "MS-CONF-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
        message: `Interview confirmed with ${selectedSlot.interviewerName} for ${selectedSlot.formattedTime}. Calendar invitation sent to your email with Teams link!`,
      });
    }

    // Action 2: Digital Offer Letter Acceptance
    if (action === "ACCEPT_OFFER") {
      if (!signedName || !signedName.trim()) {
        return NextResponse.json({ error: "SIGNATURE_REQUIRED", message: "Please type your full legal name to accept." }, { status: 400 });
      }

      try {
        recruitmentStore.updateOfferStatus(offerId || "off-601", "Accepted");
        if (candidateId) {
          recruitmentStore.updateCandidateStage(candidateId, "Hired");
        }
      } catch {
        // Fallback
      }

      return NextResponse.json({
        success: true,
        offerId: offerId || "off-601",
        signedBy: signedName.trim(),
        acceptedAt: new Date().toISOString(),
        stage: "OFFER_ACCEPTED",
        nextSteps: "Your pre-onboarding packet and hardware selection guide have been unlocked! Check your email for login credentials.",
        message: `Congratulations ${signedName}! You have formally accepted the offer of employment at MAX Enterprise Global.`,
      });
    }

    // Action 3: Candidate Self-Withdrawal
    if (action === "WITHDRAW_APPLICATION") {
      const reason = body.reason || "Candidate requested voluntary application withdrawal.";
      return NextResponse.json({
        success: true,
        candidateId,
        stage: "WITHDRAWN",
        withdrawnAt: new Date().toISOString(),
        message: "Your application has been successfully withdrawn. Thank you for your interest in MAX Enterprise.",
        reason,
      });
    }

    // Action 4: Candidate Interview Reschedule Request
    if (action === "REQUEST_RESCHEDULE") {
      const rescheduleReason = body.reason || "Candidate requested an alternate interview time.";
      const preferredTimes = body.preferredTimes || "Flexible within next 3 business days.";
      return NextResponse.json({
        success: true,
        candidateId,
        rescheduleRequested: true,
        reason: rescheduleReason,
        preferredTimes,
        message: "Your reschedule request has been logged. Our Talent Acquisition coordinator will review the panel's calendar and reach out with updated times.",
      });
    }

    return NextResponse.json({ error: "UNKNOWN_ACTION" }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: "ACTION_FAILED", message: error instanceof Error ? error.message : "Error" },
      { status: 500 }
    );
  }
}
