import { NextRequest, NextResponse } from "next/server";
import { recruitmentAiWorkflowEngine } from "@/lib/recruitment-ai-workflow-engine";

function badRequestResponse(message: string) {
  return NextResponse.json({ success: false, error: message }, { status: 400 });
}

export async function GET() {
  try {
    const workflows = recruitmentAiWorkflowEngine.getWorkflows();
    const logs = recruitmentAiWorkflowEngine.getExecutionLogs();
    return NextResponse.json({ success: true, count: workflows.length, workflows, logs });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to retrieve workflows" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, payload } = body;

    if (action === "toggle") {
      const { workflowKey, enabled } = payload;
      if (!workflowKey) return badRequestResponse("workflowKey is required");
      const success = recruitmentAiWorkflowEngine.toggleWorkflow(workflowKey, Boolean(enabled));
      return NextResponse.json({ success, workflowKey, enabled: Boolean(enabled) });
    }

    if (action === "test_run" || action === "execute") {
      const { workflowKey, entityId, entityType, dryRun } = payload;
      if (!workflowKey) return badRequestResponse("workflowKey is required");

      const log = await recruitmentAiWorkflowEngine.executeWorkflow({
        workflowKey,
        entityId: entityId || "test-cand-01",
        entityType: entityType || "Candidate",
        dryRun: action === "test_run" ? true : Boolean(dryRun),
      });

      return NextResponse.json({ success: true, executionLog: log });
    }

    return badRequestResponse("Invalid action. Supported: 'toggle', 'test_run', 'execute'");
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to execute workflow action" },
      { status: 500 }
    );
  }
}
