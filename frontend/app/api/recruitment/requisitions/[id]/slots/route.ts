import { NextRequest, NextResponse } from "next/server";
import { buildBackendUrl, getAccessToken, unauthorizedResponse } from "../../../../configuration/proxy-helper";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const res = await fetch(buildBackendUrl(`/api/v1/recruitment/requisitions/${id}`));
    if (!res.ok) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    const req = await res.json();
    return NextResponse.json(req.positionSlots || []);
  } catch {
    return NextResponse.json({ error: "FAILED_TO_LOAD_SLOTS" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = await getAccessToken(request);
    if (!token) return unauthorizedResponse();

    const { id } = await params;
    const body = await request.json();
    const { slotId, status, candidateId, candidateName } = body;

    // Fetch requisition from backend
    const res = await fetch(buildBackendUrl(`/api/v1/recruitment/requisitions/${id}`));
    if (!res.ok) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    const req = await res.json();

    const slots = req.positionSlots || [];
    const targetSlot = slots.find((s: any) => s.slotId === slotId);
    if (targetSlot) {
      if (status) targetSlot.status = status;
      if (candidateId !== undefined) targetSlot.assignedCandidateId = candidateId;
      if (candidateName !== undefined) targetSlot.assignedCandidateName = candidateName;
    }

    return NextResponse.json(slots);
  } catch {
    return NextResponse.json({ error: "FAILED_TO_UPDATE_SLOT" }, { status: 500 });
  }
}
