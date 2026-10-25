import { NextRequest, NextResponse } from "next/server";
import {
  recruitmentAiActionRegistry,
  SupportedScreen,
  AiActionExecutionRequest,
} from "@/lib/recruitment-ai-action-registry";

function badRequestResponse(message: string) {
  return NextResponse.json({ success: false, error: message }, { status: 400 });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const screen = searchParams.get("screen") as SupportedScreen | null;

    if (screen) {
      const filtered = recruitmentAiActionRegistry.getActionsForScreen(screen);
      return NextResponse.json({ success: true, count: filtered.length, actions: filtered });
    }

    const all = recruitmentAiActionRegistry.getAllActions();
    return NextResponse.json({ success: true, count: all.length, actions: all });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to retrieve AI actions" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, payload } = body;

    // Toggle enabled status
    if (action === "toggle") {
      const { actionKey, enabled } = payload;
      if (!actionKey) return badRequestResponse("actionKey is required");
      const success = recruitmentAiActionRegistry.toggleAction(actionKey, Boolean(enabled));
      return NextResponse.json({ success, actionKey, enabled: Boolean(enabled) });
    }

    // Execute action
    if (action === "execute") {
      const execRequest: AiActionExecutionRequest = payload;
      if (!execRequest?.actionKey) return badRequestResponse("payload.actionKey is required");

      const response = await recruitmentAiActionRegistry.executeAction(execRequest);
      return NextResponse.json(response);
    }

    return badRequestResponse("Invalid action. Supported: 'toggle', 'execute'");
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to execute AI action" },
      { status: 500 }
    );
  }
}
