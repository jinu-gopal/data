import { NextRequest, NextResponse } from "next/server";
import { recruitmentCandidateDossierEngine } from "@/lib/recruitment-candidate-dossier";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const requisitionId = searchParams.get("requisitionId") || undefined;

    if (!id) {
      return NextResponse.json({ success: false, error: "Candidate ID is required" }, { status: 400 });
    }

    const dossier = recruitmentCandidateDossierEngine.generateDossier(id, requisitionId);
    return NextResponse.json({ success: true, dossier });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to generate candidate dossier" },
      { status: 500 }
    );
  }
}
