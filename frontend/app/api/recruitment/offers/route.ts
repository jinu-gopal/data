import { NextRequest, NextResponse } from "next/server";

export interface OfferLetterTemplate {
  id: string;
  name: string;
  type: "STANDARD_SALARIED" | "EXECUTIVE" | "HOURLY_CONTRACTOR";
  subject: string;
  content: string;
}

export interface CandidateOffer {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  requisitionId: string;
  requisitionTitle: string;
  department: string;
  positionSlotCode: string;
  baseSalaryUsd: number;
  signingBonusUsd: number;
  equityOptions: number;
  targetStartDate: string;
  reportingManager: string;
  status: "DRAFT" | "PENDING_FINANCE_APPROVAL" | "APPROVED" | "SENT_TO_CANDIDATE" | "ACCEPTED" | "DECLINED";
  approvalNotes?: string;
  approvedBy?: string;
  approvedAt?: string;
  sentAt?: string;
  acceptedAt?: string;
  templateId: string;
}

let offerTemplates: OfferLetterTemplate[] = [
  {
    id: "tmpl-standard",
    name: "Standard Salaried Full-Time Offer",
    type: "STANDARD_SALARIED",
    subject: "Employment Offer: {{job_title}} at MAX Enterprise Global",
    content: `Dear {{candidate_name}},

On behalf of MAX Enterprise Global, we are thrilled to extend this formal offer of employment for the position of {{job_title}} within our {{department}} division, reporting directly to {{reporting_manager}}.

COMPENSATION & EQUITY PACKAGE:
- Annual Base Compensation: \${{base_salary}} USD, payable semi-monthly.
- Sign-on Incentive: \${{signing_bonus}} USD upon completion of 90 days tenure.
- Incentive Stock Options: {{equity_shares}} shares vesting under standard 4-year schedule.
- Anticipated Start Date: {{start_date}}.

BENEFITS SUMMARY:
Comprehensive medical, dental, and vision insurance with 100% employer-sponsored employee premiums, 401(k) matching up to 5%, unlimited discretionary paid time off, and an annual $3,000 professional learning budget.

This offer is contingent upon successful completion of standard background verification (BGV).

Sincerely,
MAX Enterprise Talent Acquisition & Executive Leadership`,
  },
  {
    id: "tmpl-executive",
    name: "Executive Leadership & Senior Architect Offer",
    type: "EXECUTIVE",
    subject: "Executive Offer of Employment: {{job_title}}",
    content: `Dear {{candidate_name}},

MAX Enterprise Global is pleased to offer you the executive role of {{job_title}}. In this capacity, you will report to {{reporting_manager}} and lead critical initiatives across our global technology landscape.

EXECUTIVE COMPENSATION TERMS:
- Base Salary: \${{base_salary}} USD per annum.
- Executive Signing Bonus: \${{signing_bonus}} USD.
- Equity Grant: {{equity_shares}} Restricted Stock Units (RSUs) under executive long-term incentive plan.
- Target Effective Start Date: {{start_date}}.

We look forward to welcoming you to the executive leadership cohort.`,
  },
];

let candidateOffers: CandidateOffer[] = [
  {
    id: "off-601",
    candidateId: "cand-203",
    candidateName: "Elena Rostova",
    candidateEmail: "elena.rostova@cloudscale.net",
    requisitionId: "req-101",
    requisitionTitle: "Senior Full-Stack Cloud Architect",
    department: "Engineering",
    positionSlotCode: "REQ-ENG-084-POS2",
    baseSalaryUsd: 168000,
    signingBonusUsd: 15000,
    equityOptions: 4500,
    targetStartDate: "2026-11-15",
    reportingManager: "Marcus Chen",
    status: "APPROVED",
    approvedBy: "Rachel Green (VP Finance)",
    approvedAt: "2026-10-15T15:00:00Z",
    sentAt: "2026-10-15T16:30:00Z",
    templateId: "tmpl-standard",
    approvalNotes: "Competitive counter-offer approved within Q4 engineering compensation band.",
  },
  {
    id: "off-602",
    candidateId: "cand-206",
    candidateName: "Chloe Bennett",
    candidateEmail: "chloe.bennett@cpa-finance.org",
    requisitionId: "req-103",
    requisitionTitle: "Corporate Financial Planning Analyst",
    department: "Finance",
    positionSlotCode: "REQ-FIN-012-POS1",
    baseSalaryUsd: 118000,
    signingBonusUsd: 8000,
    equityOptions: 2000,
    targetStartDate: "2026-11-01",
    reportingManager: "Arthur Wellesley",
    status: "ACCEPTED",
    approvedBy: "Rachel Green (VP Finance)",
    approvedAt: "2026-10-10T11:00:00Z",
    sentAt: "2026-10-10T14:00:00Z",
    acceptedAt: "2026-10-12T16:20:00Z",
    templateId: "tmpl-standard",
    approvalNotes: "Offer accepted by candidate. Transitioned to pre-onboarding.",
  },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  if (type === "templates") {
    return NextResponse.json(offerTemplates);
  }
  return NextResponse.json(candidateOffers);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action || "CREATE_OFFER";

    if (action === "CREATE_TEMPLATE") {
      const newTmpl: OfferLetterTemplate = {
        id: "tmpl-" + Date.now().toString().slice(-6),
        name: body.name,
        type: body.type || "STANDARD_SALARIED",
        subject: body.subject,
        content: body.content,
      };
      offerTemplates.push(newTmpl);
      return NextResponse.json(newTmpl, { status: 201 });
    }

    // Default: Create Draft Offer for Approval
    const newOffer: CandidateOffer = {
      id: "off-" + Date.now().toString().slice(-6),
      candidateId: body.candidateId,
      candidateName: body.candidateName,
      candidateEmail: body.candidateEmail,
      requisitionId: body.requisitionId,
      requisitionTitle: body.requisitionTitle,
      department: body.department || "General",
      positionSlotCode: body.positionSlotCode || "SLOT-01",
      baseSalaryUsd: Number(body.baseSalaryUsd) || 140000,
      signingBonusUsd: Number(body.signingBonusUsd) || 0,
      equityOptions: Number(body.equityOptions) || 0,
      targetStartDate: body.targetStartDate || "2026-11-15",
      reportingManager: body.reportingManager || "Department Head",
      status: "PENDING_FINANCE_APPROVAL",
      templateId: body.templateId || "tmpl-standard",
      approvalNotes: body.approvalNotes || "Submitted for compensation review.",
    };

    candidateOffers.unshift(newOffer);
    return NextResponse.json(newOffer, { status: 201 });
  } catch {
    return NextResponse.json({ error: "FAILED_TO_PROCESS_OFFER" }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, approvalNotes, approvedBy } = body;
    const offer = candidateOffers.find((o) => o.id === id);
    if (!offer) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

    if (status) offer.status = status;
    if (approvalNotes) offer.approvalNotes = approvalNotes;

    if (status === "APPROVED") {
      offer.approvedBy = approvedBy || "Finance Controller";
      offer.approvedAt = new Date().toISOString();
    } else if (status === "SENT_TO_CANDIDATE") {
      offer.sentAt = new Date().toISOString();
    } else if (status === "ACCEPTED") {
      offer.acceptedAt = new Date().toISOString();
    }

    return NextResponse.json(offer);
  } catch {
    return NextResponse.json({ error: "FAILED_TO_UPDATE_OFFER" }, { status: 400 });
  }
}
