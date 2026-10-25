import { NextRequest, NextResponse } from "next/server";
import { ecCoreStore } from "@/lib/ec-core-store";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const status = body.status; // "APPROVED" | "REJECTED"
    if (status !== "APPROVED" && status !== "REJECTED") {
      return NextResponse.json({ error: "BAD_REQUEST", message: "Status must be APPROVED or REJECTED." }, { status: 400 });
    }

    const reviewed = ecCoreStore.reviewLeaveRequest(
      id,
      status,
      body.reviewerName || "Manager",
      body.notes || ""
    );

    if (!reviewed) {
      return NextResponse.json({ error: "NOT_FOUND", message: `Leave request ${id} not found.` }, { status: 404 });
    }

    return NextResponse.json(reviewed);
  } catch (err: any) {
    return NextResponse.json({ error: "FAILED_TO_REVIEW_LEAVE", message: err.message }, { status: 500 });
  }
}
