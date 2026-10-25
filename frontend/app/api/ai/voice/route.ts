import { NextRequest, NextResponse } from "next/server";
import { maxVoiceEngine } from "@/lib/max-voice-engine";
import { badRequestResponse } from "../../configuration/proxy-helper";

export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return badRequestResponse("Invalid JSON payload.");
    }

    if (!body || typeof body !== "object") {
      return badRequestResponse("Invalid JSON payload.");
    }

    const payload = body as Record<string, unknown>;
    const transcript = String(payload.transcript || payload.command || payload.query || "").trim();
    const currentRoute = payload.currentRoute ? String(payload.currentRoute) : "/";

    if (!transcript) {
      return badRequestResponse("transcript is required.");
    }

    const result = maxVoiceEngine.parseAndExecute(transcript, currentRoute);

    // Prepare TTS payload for client-side audio rendering
    const cleanSpeech = result.spokenResponse.replace(/[*_#`~[\]()]/g, "").trim();

    return NextResponse.json({
      success: true,
      transcript: result.transcript,
      intent: result.intent,
      actionType: result.actionType || null,
      targetUrl: result.targetUrl || null,
      spokenResponse: result.spokenResponse,
      displayMessage: result.displayMessage,
      confidence: result.confidence,
      executedAction: result.executedAction || null,
      ttsPayload: {
        text: cleanSpeech,
        rate: 1.05,
        pitch: 1.0,
        lang: "en-US",
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("AI Voice API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal voice processing error",
      },
      { status: 500 }
    );
  }
}
