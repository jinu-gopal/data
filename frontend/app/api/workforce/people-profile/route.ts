import { NextRequest, NextResponse } from "next/server";
import { ecCoreStore } from "@/lib/ec-core-store";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const department = searchParams.get("department") || undefined;
    const search = searchParams.get("search") || undefined;

    const profiles = ecCoreStore.getPeopleProfiles(search, department);

    return NextResponse.json({
      profiles,
      totalCount: profiles.length,
      activeCount: profiles.filter((p) => p.status === "ACTIVE").length,
      onLeaveCount: profiles.filter((p) => p.status === "ON_LEAVE").length,
      retiredCount: profiles.filter((p) => p.status === "RETIRED").length,
    });
  } catch (err: any) {
    return NextResponse.json({ error: "FAILED_TO_FETCH_PROFILES", message: err.message }, { status: 500 });
  }
}
