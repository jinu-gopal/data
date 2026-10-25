import { NextRequest, NextResponse } from "next/server";
import { recruitmentTalentMemory } from "@/lib/recruitment-talent-memory";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || undefined;
    const targetRequisitionId = searchParams.get("requisitionId") || undefined;
    const skillsParam = searchParams.get("skills");
    const skills = skillsParam ? skillsParam.split(",") : undefined;

    const results = recruitmentTalentMemory.searchPastTalent({
      query,
      targetRequisitionId,
      skills,
    });

    return NextResponse.json({
      success: true,
      count: results.length,
      rediscoveredCandidates: results,
      methodology: "Semantic equivalence dictionary & historical application provenance",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to search talent memory" },
      { status: 500 }
    );
  }
}
