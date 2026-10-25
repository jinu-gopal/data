import { NextRequest, NextResponse } from "next/server";
import { ecCoreStore } from "@/lib/ec-core-store";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const position = ecCoreStore.getPositionByCode(id);
    if (!position) {
      return NextResponse.json({ error: "NOT_FOUND", message: `Position ${id} not found.` }, { status: 404 });
    }
    return NextResponse.json(position);
  } catch (err: any) {
    return NextResponse.json({ error: "INTERNAL_ERROR", message: err.message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (body.action === "VACATE") {
      const vacated = ecCoreStore.vacatePosition(id);
      if (!vacated) {
        return NextResponse.json({ error: "NOT_FOUND", message: `Position ${id} not found.` }, { status: 404 });
      }
      return NextResponse.json(vacated);
    }

    const updated = ecCoreStore.updatePosition(id, body);
    if (!updated) {
      return NextResponse.json({ error: "NOT_FOUND", message: `Position ${id} not found.` }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: "FAILED_TO_UPDATE_POSITION", message: err.message }, { status: 500 });
  }
}
