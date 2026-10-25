import { NextRequest, NextResponse } from "next/server";
import { ecCoreStore } from "@/lib/ec-core-store";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const department = searchParams.get("department") || undefined;
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;
    const view = searchParams.get("view"); // "hierarchy" | "list"

    if (view === "hierarchy") {
      const hierarchy = ecCoreStore.getPositionHierarchy();
      return NextResponse.json(hierarchy);
    }

    const positions = ecCoreStore.getPositions({ department, status, search });
    
    // Telemetry summary
    const totalPositions = positions.length;
    const vacantCount = positions.filter((p) => p.status === "VACANT").length;
    const filledCount = positions.filter((p) => p.status === "FILLED").length;
    const frozenCount = positions.filter((p) => p.status === "FROZEN").length;
    const totalFte = positions.reduce((acc, p) => acc + p.fte, 0);

    return NextResponse.json({
      positions,
      meta: {
        totalPositions,
        vacantCount,
        filledCount,
        frozenCount,
        totalFte,
        occupancyRate: totalPositions > 0 ? Math.round((filledCount / totalPositions) * 100) : 0,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: "FAILED_TO_FETCH_POSITIONS", message: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.title || !body.department) {
      return NextResponse.json({ error: "BAD_REQUEST", message: "Title and Department are required." }, { status: 400 });
    }

    const newPosition = ecCoreStore.createPosition(body);
    return NextResponse.json(newPosition, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: "FAILED_TO_CREATE_POSITION", message: err.message }, { status: 500 });
  }
}
