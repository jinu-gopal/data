import { NextRequest, NextResponse } from "next/server";

export interface PipelineStageConfig {
  id: string;
  name: string;
  order: number;
  color: string;
  slaDays: number;
  isMandatory: boolean;
  enabled: boolean;
  requiresScorecard?: boolean;
  requiresBgvClearance?: boolean;
}

let stagesConfig: PipelineStageConfig[] = [
  { id: "APPLIED", name: "Applied", order: 1, color: "blue", slaDays: 3, isMandatory: true, enabled: true },
  { id: "SCREENING", name: "Screening", order: 2, color: "cyan", slaDays: 4, isMandatory: true, enabled: true },
  { id: "ASSESSMENT", name: "Assessment", order: 3, color: "indigo", slaDays: 5, isMandatory: false, enabled: true },
  { id: "INTERVIEW", name: "Interview", order: 4, color: "amber", slaDays: 7, isMandatory: true, enabled: true, requiresScorecard: true },
  { id: "OFFER", name: "Offer", order: 5, color: "purple", slaDays: 5, isMandatory: true, enabled: true },
  { id: "BGV", name: "Background Check (BGV)", order: 6, color: "slate", slaDays: 7, isMandatory: true, enabled: true, requiresBgvClearance: true },
  { id: "PRE_ONBOARDING", name: "Pre-Onboarding", order: 7, color: "teal", slaDays: 10, isMandatory: true, enabled: true },
  { id: "HIRED", name: "Hired to Workforce", order: 8, color: "emerald", slaDays: 2, isMandatory: true, enabled: true },
];

export async function GET() {
  return NextResponse.json(stagesConfig.sort((a, b) => a.order - b.order));
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, enabled, slaDays, isMandatory } = body;
    const stage = stagesConfig.find((s) => s.id === id);
    if (!stage) return NextResponse.json({ error: "STAGE_NOT_FOUND" }, { status: 404 });

    if (enabled !== undefined) stage.enabled = Boolean(enabled);
    if (slaDays !== undefined) stage.slaDays = Number(slaDays);
    if (isMandatory !== undefined) stage.isMandatory = Boolean(isMandatory);

    return NextResponse.json(stage);
  } catch {
    return NextResponse.json({ error: "FAILED_TO_UPDATE_STAGE" }, { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newStage: PipelineStageConfig = {
      id: "STAGE_" + Date.now().toString().slice(-4),
      name: body.name,
      order: stagesConfig.length + 1,
      color: body.color || "blue",
      slaDays: Number(body.slaDays) || 5,
      isMandatory: Boolean(body.isMandatory),
      enabled: true,
    };
    stagesConfig.push(newStage);
    return NextResponse.json(newStage, { status: 201 });
  } catch {
    return NextResponse.json({ error: "FAILED_TO_CREATE_STAGE" }, { status: 400 });
  }
}
