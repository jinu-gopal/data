import { NextRequest, NextResponse } from "next/server";
import { ecCoreStore } from "@/lib/ec-core-store";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const profile = ecCoreStore.getPeopleProfileById(id);
    if (!profile) {
      return NextResponse.json({ error: "NOT_FOUND", message: `Profile ${id} not found.` }, { status: 404 });
    }
    return NextResponse.json(profile);
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

    const updated = ecCoreStore.updatePeopleProfile(id, body);
    if (!updated) {
      return NextResponse.json({ error: "NOT_FOUND", message: `Profile ${id} not found.` }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: "FAILED_TO_UPDATE_PROFILE", message: err.message }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!body.title || !body.eventType) {
      return NextResponse.json({ error: "BAD_REQUEST", message: "Title and EventType are required." }, { status: 400 });
    }

    const event = ecCoreStore.addTimelineEvent(id, {
      timestamp: new Date().toISOString(),
      eventType: body.eventType,
      title: body.title,
      description: body.description || "",
      performedBy: body.performedBy || "HR Administrator",
      effectiveDate: body.effectiveDate || new Date().toISOString().split("T")[0],
      previousValue: body.previousValue,
      newValue: body.newValue,
    });

    if (!event) {
      return NextResponse.json({ error: "NOT_FOUND", message: `Profile ${id} not found.` }, { status: 404 });
    }

    return NextResponse.json(event, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: "FAILED_TO_ADD_TIMELINE_EVENT", message: err.message }, { status: 500 });
  }
}
