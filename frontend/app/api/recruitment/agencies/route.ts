import { NextRequest, NextResponse } from "next/server";

export interface AgencyPartner {
  id: string;
  name: string;
  contactPerson: string;
  contactEmail: string;
  phone: string;
  commissionPct: number; // e.g. 20%
  guaranteePeriodDays: number; // e.g. 90
  status: "ACTIVE" | "INACTIVE";
  totalCandidatesSubmitted: number;
  totalHired: number;
  totalCommissionsPaidUsd: number;
  specialty: string;
}

export interface AgencyCandidateSubmission {
  id: string;
  agencyId: string;
  agencyName: string;
  candidateName: string;
  candidateEmail: string;
  requisitionId: string;
  requisitionTitle: string;
  proposedSalaryUsd: number;
  calculatedFeeUsd: number;
  status: "SUBMITTED" | "IN_REVIEW" | "HIRED" | "REJECTED";
  submittedAt: string;
}

let agencies: AgencyPartner[] = [
  {
    id: "agency-01",
    name: "Apex Executive Search Global",
    contactPerson: "David Sterling",
    contactEmail: "david.sterling@apex-talent.com",
    phone: "+1 (415) 555-8833",
    commissionPct: 20,
    guaranteePeriodDays: 90,
    status: "ACTIVE",
    totalCandidatesSubmitted: 6,
    totalHired: 1,
    totalCommissionsPaidUsd: 32000,
    specialty: "VP & Senior Cloud Architecture Leadership",
  },
  {
    id: "agency-02",
    name: "TechTalent Distributed Partners",
    contactPerson: "Jessica Walsh",
    contactEmail: "j.walsh@techtalent-global.io",
    phone: "+1 (212) 555-9044",
    commissionPct: 18,
    guaranteePeriodDays: 90,
    status: "ACTIVE",
    totalCandidatesSubmitted: 9,
    totalHired: 2,
    totalCommissionsPaidUsd: 48500,
    specialty: "High-throughput Backend, Next.js & SRE Engineers",
  },
  {
    id: "agency-03",
    name: "Vanguard Financial & Legal Recruiters",
    contactPerson: "Edward Hayes",
    contactEmail: "edward@vanguardrecruit.org",
    phone: "+1 (312) 555-7122",
    commissionPct: 15,
    guaranteePeriodDays: 60,
    status: "ACTIVE",
    totalCandidatesSubmitted: 4,
    totalHired: 1,
    totalCommissionsPaidUsd: 17700,
    specialty: "Corporate FP&A, Controllership & Audit",
  },
];

let agencySubmissions: AgencyCandidateSubmission[] = [
  {
    id: "sub-101",
    agencyId: "agency-01",
    agencyName: "Apex Executive Search Global",
    candidateName: "Samuel Kim",
    candidateEmail: "sam.kim.safety@koreaplant.org",
    requisitionId: "req-102",
    requisitionTitle: "Plant Reliability & Safety Lead",
    proposedSalaryUsd: 145000,
    calculatedFeeUsd: 29000,
    status: "IN_REVIEW",
    submittedAt: "2026-10-08T11:00:00Z",
  },
  {
    id: "sub-102",
    agencyId: "agency-02",
    agencyName: "TechTalent Distributed Partners",
    candidateName: "Liam Vance",
    candidateEmail: "liam.vance@enterprisesales.co",
    requisitionId: "req-104",
    requisitionTitle: "Enterprise Global Solutions Executive",
    proposedSalaryUsd: 155000,
    calculatedFeeUsd: 27900,
    status: "IN_REVIEW",
    submittedAt: "2026-10-10T14:20:00Z",
  },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  if (type === "submissions") {
    return NextResponse.json(agencySubmissions);
  }
  return NextResponse.json(agencies);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action || (body.candidateName ? "SUBMIT_CANDIDATE" : "REGISTER_AGENCY");

    if (action === "SUBMIT_CANDIDATE") {
      const agency = agencies.find((a) => a.id === body.agencyId);
      const feePct = agency ? agency.commissionPct : 18;
      const proposedSalary = Number(body.proposedSalaryUsd) || 140000;
      const fee = Math.round((proposedSalary * feePct) / 100);

      const newSub: AgencyCandidateSubmission = {
        id: "sub-" + Date.now().toString().slice(-6),
        agencyId: body.agencyId,
        agencyName: agency?.name || "Independent Agency",
        candidateName: body.candidateName,
        candidateEmail: body.candidateEmail,
        requisitionId: body.requisitionId,
        requisitionTitle: body.requisitionTitle,
        proposedSalaryUsd: proposedSalary,
        calculatedFeeUsd: fee,
        status: "SUBMITTED",
        submittedAt: new Date().toISOString(),
      };
      agencySubmissions.unshift(newSub);
      if (agency) agency.totalCandidatesSubmitted += 1;
      return NextResponse.json(newSub, { status: 201 });
    }

    // Default: Register Agency
    const newAgency: AgencyPartner = {
      id: "agency-" + Date.now().toString().slice(-6),
      name: body.name,
      contactPerson: body.contactPerson,
      contactEmail: body.contactEmail,
      phone: body.phone || "+1 (555) 000-0000",
      commissionPct: Number(body.commissionPct) || 18,
      guaranteePeriodDays: Number(body.guaranteePeriodDays) || 90,
      status: "ACTIVE",
      totalCandidatesSubmitted: 0,
      totalHired: 0,
      totalCommissionsPaidUsd: 0,
      specialty: body.specialty || "Enterprise IT & Engineering",
    };

    agencies.unshift(newAgency);
    return NextResponse.json(newAgency, { status: 201 });
  } catch {
    return NextResponse.json({ error: "FAILED_TO_PROCESS_AGENCY" }, { status: 400 });
  }
}
