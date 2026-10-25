import { NextRequest, NextResponse } from "next/server";

export interface RecruitmentRule {
  id: string;
  name: string;
  code: string;
  description: string;
  category: "WORKFLOW_AUTOMATION" | "COMPLIANCE_GATE" | "SLA_MONITOR" | "CANDIDATE_EXPERIENCE";
  enabled: boolean;
  triggerEvent: string;
  conditionDescription: string;
  actionDescription: string;
  thresholdValue?: number;
}

let rules: RecruitmentRule[] = [
  {
    id: "rule-01",
    name: "Auto-Advance High Assessment Performers",
    code: "AUTO_ADVANCE_ASSESSMENT",
    description: "Automatically advances candidate from Assessment to Interview if score meets threshold.",
    category: "WORKFLOW_AUTOMATION",
    enabled: true,
    triggerEvent: "ASSESSMENT_COMPLETED",
    conditionDescription: "Candidate assessment score >= 85%",
    actionDescription: "Transition candidate stage to INTERVIEW and notify Hiring Manager.",
    thresholdValue: 85,
  },
  {
    id: "rule-02",
    name: "Auto-Reject Below Benchmark Scores",
    code: "AUTO_REJECT_LOW_SCORE",
    description: "Politely archives candidate application if technical assessment score is below minimum cutoff.",
    category: "WORKFLOW_AUTOMATION",
    enabled: true,
    triggerEvent: "ASSESSMENT_COMPLETED",
    conditionDescription: "Candidate assessment score < 50%",
    actionDescription: "Transition candidate stage to REJECTED and queue talent pool email.",
    thresholdValue: 50,
  },
  {
    id: "rule-03",
    name: "Candidate Screening Stage SLA Warning",
    code: "SCREENING_SLA_ALERT",
    description: "Flags applications lingering in Screening without interviewer action.",
    category: "SLA_MONITOR",
    enabled: true,
    triggerEvent: "DAILY_PIPELINE_CRON",
    conditionDescription: "Candidate in SCREENING for > 4 business days",
    actionDescription: "Highlight card with amber SLA badge and ping Recruiter inbox.",
    thresholdValue: 4,
  },
  {
    id: "rule-04",
    name: "Duplicate Application Guard",
    code: "DUPLICATE_APPLICATION_CHECK",
    description: "Detects repeat applications from the same candidate within a 6-month talent cooldown period.",
    category: "CANDIDATE_EXPERIENCE",
    enabled: true,
    triggerEvent: "APPLICATION_RECEIVED",
    conditionDescription: "Identical email address submitted within past 180 days",
    actionDescription: "Flag candidate card with DUPLICATE alert and link prior dossier.",
    thresholdValue: 180,
  },
  {
    id: "rule-05",
    name: "Mandatory BGV Clearance Before Workforce Hire",
    code: "MANDATORY_BGV_BEFORE_HIRE",
    description: "Strict compliance gate: blocks final hiring handshake until background check reports CLEARED.",
    category: "COMPLIANCE_GATE",
    enabled: true,
    triggerEvent: "HIRE_ATTEMPTED",
    conditionDescription: "Candidate BGV status != CLEARED",
    actionDescription: "Block hire transition with compliance error modal.",
  },
];

export async function GET() {
  return NextResponse.json(rules);
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, enabled, thresholdValue } = body;
    const rule = rules.find((r) => r.id === id);
    if (!rule) return NextResponse.json({ error: "RULE_NOT_FOUND" }, { status: 404 });

    if (enabled !== undefined) rule.enabled = Boolean(enabled);
    if (thresholdValue !== undefined) rule.thresholdValue = Number(thresholdValue);

    return NextResponse.json(rule);
  } catch {
    return NextResponse.json({ error: "FAILED_TO_UPDATE_RULE" }, { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newRule: RecruitmentRule = {
      id: "rule-" + Date.now().toString().slice(-4),
      name: body.name || "Custom Business Rule",
      code: body.code || "CUSTOM_RULE_" + Date.now().toString().slice(-4),
      description: body.description || "Custom automated recruitment workflow rule.",
      category: body.category || "WORKFLOW_AUTOMATION",
      enabled: body.enabled !== undefined ? Boolean(body.enabled) : true,
      triggerEvent: body.triggerEvent || "APPLICATION_SUBMITTED",
      conditionDescription: body.conditionDescription || "Configured condition satisfied",
      actionDescription: body.actionDescription || "Execute automated recruiting action",
      thresholdValue: body.thresholdValue ? Number(body.thresholdValue) : undefined,
    };
    rules.push(newRule);
    return NextResponse.json(newRule, { status: 201 });
  } catch {
    return NextResponse.json({ error: "FAILED_TO_CREATE_RULE" }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "MISSING_ID" }, { status: 400 });

    const idx = rules.findIndex((r) => r.id === id);
    if (idx === -1) return NextResponse.json({ error: "RULE_NOT_FOUND" }, { status: 404 });

    const removed = rules.splice(idx, 1)[0];
    return NextResponse.json({ success: true, removed });
  } catch {
    return NextResponse.json({ error: "FAILED_TO_DELETE_RULE" }, { status: 400 });
  }
}
