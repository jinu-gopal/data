import { NextResponse } from "next/server";

// Pulls eligible candidates ready for EC Core hire conversion
export async function GET() {
  try {
    const candidates = [
      {
        candidateId: "cand-203",
        fullName: "Emily Zhang",
        email: "emily.zhang@mit.alumni.edu",
        phone: "+1 (617) 555-2384",
        requisitionId: "req-101",
        requisitionTitle: "Senior Full-Stack Cloud Architect",
        department: "Engineering",
        targetPositionCode: "POS-ENG-084",
        offeredSalary: 175000,
        targetStartDate: "2026-11-01",
        managerName: "Marcus Chen",
        status: "OFFER_ACCEPTED",
        bgvStatus: "CLEARED",
        workAuthorization: "US_CITIZEN",
        notes: "Offer accepted with full signature. Pre-onboarding checklist 100% complete.",
      },
      {
        candidateId: "cand-201",
        fullName: "Maya Patel",
        email: "maya.patel@devtalent.net",
        phone: "+1 (415) 555-8912",
        requisitionId: "req-101",
        requisitionTitle: "Senior Full-Stack Cloud Architect",
        department: "Engineering",
        targetPositionCode: "POS-ENG-085",
        offeredSalary: 180000,
        targetStartDate: "2026-11-15",
        managerName: "Marcus Chen",
        status: "OFFER_ACCEPTED",
        bgvStatus: "CLEARED",
        workAuthorization: "H1B_SPECIALTY",
        notes: "Ex-Stripe infrastructure lead. H-1B transfer petition approved.",
      },
    ];

    return NextResponse.json(candidates);
  } catch (err: any) {
    return NextResponse.json({ error: "FAILED_TO_LOAD_ELIGIBLE_CANDIDATES", message: err.message }, { status: 500 });
  }
}
