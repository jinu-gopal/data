import { NextRequest, NextResponse } from "next/server";
import { recruitmentAutonomousOperations } from "@/lib/recruitment-autonomous-ops";

function badRequestResponse(message: string) {
  return NextResponse.json({ success: false, error: message }, { status: 400 });
}

export async function GET(request: NextRequest) {
  try {
    const alerts = recruitmentAutonomousOperations.scanOperationalCadence();
    const criticalCount = alerts.filter((a) => a.severity === "CRITICAL").length;
    const highCount = alerts.filter((a) => a.severity === "HIGH").length;
    const mediumCount = alerts.filter((a) => a.severity === "MEDIUM").length;
    const lowCount = alerts.filter((a) => a.severity === "LOW").length;

    return NextResponse.json({
      success: true,
      count: alerts.length,
      summary: {
        total: alerts.length,
        critical: criticalCount,
        high: highCount,
        medium: mediumCount,
        low: lowCount,
      },
      alerts,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to scan operational cadence" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, payload } = body;

    // ERP Handoff execution
    if (action === "execute_handoff") {
      const candidateId = payload?.candidateId;
      if (!candidateId) return badRequestResponse("payload.candidateId is required");

      const handoffRecord = recruitmentAutonomousOperations.executeErpHandoff(candidateId);
      return NextResponse.json({
        success: true,
        message: `Successfully executed ERP handoff for candidate ${handoffRecord.candidateName}`,
        handoffRecord,
      });
    }

    // Proactive resolution / action execution
    if (action === "execute_action") {
      const { alertId, actionExecutableKey, confirmed } = payload || {};
      if (!actionExecutableKey) return badRequestResponse("payload.actionExecutableKey is required");

      if (actionExecutableKey === "AUTHORIZE_LEVEL_2_OFFER" && !confirmed) {
        return NextResponse.json({
          success: false,
          requiresConfirmation: true,
          message: "Authorizing Level 2 VP offer requires explicit confirmation under corporate compensation governance.",
        }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        alertId,
        actionExecutableKey,
        executedAt: new Date().toISOString(),
        message: `Autonomous action '${actionExecutableKey}' successfully executed.`,
      });
    }

    return badRequestResponse("Invalid action. Supported: 'execute_handoff', 'execute_action'");
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to process autonomous operations request" },
      { status: 500 }
    );
  }
}
