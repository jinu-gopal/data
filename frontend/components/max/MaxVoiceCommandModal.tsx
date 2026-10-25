"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { maxVoiceEngine, VoiceCommandResult } from "@/lib/max-voice-engine";

interface MaxVoiceCommandModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExecuteCustomCommand?: (command: VoiceCommandResult) => void;
}

export default function MaxVoiceCommandModal({
  isOpen,
  onClose,
  onExecuteCustomCommand,
}: MaxVoiceCommandModalProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [lastResult, setLastResult] = useState<VoiceCommandResult | null>(null);
  const [audioFeedbackEnabled, setAudioFeedbackEnabled] = useState(true);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [manualInput, setManualInput] = useState("");

  const recognitionRef = useRef<any>(null);

  // Initialize Web Speech Recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).SpeechRecognition ||
        (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        setSpeechSupported(false);
      } else {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onstart = () => {
          setIsListening(true);
          setInterimTranscript("");
        };

        recognition.onresult = (event: any) => {
          let currentInterim = "";
          let finalTranscript = "";

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              currentInterim += event.results[i][0].transcript;
            }
          }

          if (finalTranscript) {
            setTranscript(finalTranscript);
            setInterimTranscript("");
            executeSpokenCommand(finalTranscript);
          } else {
            setInterimTranscript(currentInterim);
          }
        };

        recognition.onerror = (e: any) => {
          setIsListening(false);
          console.warn("Voice speech recognition event notice:", e.error);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  // Auto-start listening when modal opens
  useEffect(() => {
    if (isOpen) {
      setLastResult(null);
      setTranscript("");
      setInterimTranscript("");
      setManualInput("");
      startListening();
    } else {
      stopListening();
      maxVoiceEngine.stopSpeaking();
    }
  }, [isOpen]);

  const startListening = () => {
    if (!speechSupported) return;
    try {
      recognitionRef.current?.start();
    } catch {
      // Ignored if already started
    }
  };

  const stopListening = () => {
    try {
      recognitionRef.current?.stop();
    } catch {
      // Ignored
    }
    setIsListening(false);
  };

  const executeSpokenCommand = (text: string) => {
    if (!text.trim()) return;
    stopListening();

    const result = maxVoiceEngine.parseAndExecute(text, pathname || "/");
    setLastResult(result);

    // Speak audio feedback if enabled
    if (audioFeedbackEnabled) {
      maxVoiceEngine.speak(result.spokenResponse);
    }

    // Call custom callback if provided
    if (onExecuteCustomCommand) {
      onExecuteCustomCommand(result);
    }

    // If navigation intent, navigate after brief pause for feedback
    if (result.intent === "NAVIGATE" && result.targetUrl) {
      setTimeout(() => {
        router.push(result.targetUrl!);
        onClose();
      }, 900);
    }
  };

  const handleQuickPromptClick = (prompt: string) => {
    setTranscript(prompt);
    executeSpokenCommand(prompt);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark backdrop with blur */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modern Voice Command HUD Dialog */}
      <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 text-slate-900 shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* TOP CONTROLS */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 border border-blue-200 text-blue-600 font-bold text-sm shadow-2xs">
              🎙️
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight font-sans">MAX AI Voice Command HUD</h2>
              <p className="text-[10px] text-slate-500">Natural Language Operational Dictation</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio Feedback Toggle */}
            <button
              type="button"
              onClick={() => {
                const nextState = !audioFeedbackEnabled;
                setAudioFeedbackEnabled(nextState);
                maxVoiceEngine.setVoiceEnabled(nextState);
              }}
              className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-1 text-xs font-semibold transition shadow-2xs cursor-pointer ${
                audioFeedbackEnabled
                  ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                  : "border-slate-200 bg-white text-slate-600"
              }`}
              title={audioFeedbackEnabled ? "Spoken Audio Voice Enabled" : "Audio Muted"}
            >
              <span>{audioFeedbackEnabled ? "🔊 Spoken Audio: ON" : "🔇 Audio: Muted"}</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* VOICE VISUALIZER / PULSING HUD */}
        <div className="my-6 flex flex-col items-center text-center">
          <div className="relative flex items-center justify-center">
            {/* Concentric Pulsing Wave Rings */}
            {isListening && (
              <>
                <div className="absolute h-28 w-28 rounded-full bg-blue-500/20 animate-ping" />
                <div className="absolute h-24 w-24 rounded-full bg-indigo-500/30 animate-pulse" />
              </>
            )}

            {/* Center Mic Orb */}
            <button
              type="button"
              onClick={() => {
                if (isListening) stopListening();
                else startListening();
              }}
              className={`relative z-10 flex h-20 w-20 items-center justify-center rounded-full text-2xl shadow-xl transition-all duration-300 cursor-pointer ${
                isListening
                  ? "bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 ring-4 ring-blue-400/40 scale-105 text-white"
                  : "bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 hover:scale-105"
              }`}
            >
              {isListening ? "🎙️" : "🎤"}
            </button>
          </div>

          <div className="mt-4">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold shadow-2xs ${
                isListening
                  ? "bg-blue-50 border border-blue-200 text-blue-700 animate-pulse"
                  : "bg-slate-100 border border-slate-200 text-slate-600"
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${isListening ? "bg-blue-600" : "bg-slate-400"}`} />
              <span>{isListening ? "Listening... Speak your instruction now" : "Click microphone or type command"}</span>
            </span>
          </div>

          {/* TRANSCRIPT DISPLAY */}
          <div className="mt-4 min-h-[60px] w-full max-w-md rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
            {transcript || interimTranscript ? (
              <p className="text-sm font-semibold text-slate-900 italic">
                &ldquo;{transcript || interimTranscript}&rdquo;
              </p>
            ) : (
              <p className="text-xs text-slate-500">
                Speak commands like &ldquo;Open Candidate Applications&rdquo;, &ldquo;Approve pending leave&rdquo;, or &ldquo;Freeze position budget&rdquo;...
              </p>
            )}
          </div>
        </div>

        {/* EXECUTED RESULT CARD */}
        {lastResult && (
          <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-3.5 text-left text-xs space-y-1.5 animate-in fade-in duration-150 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-bold text-emerald-900">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>Command Executed: {lastResult.intent}</span>
              </span>
              <span className="rounded-md bg-emerald-100 border border-emerald-200 px-1.5 py-0.5 text-[10px] font-mono font-bold text-emerald-800">
                {Math.round(lastResult.confidence * 100)}% Confidence
              </span>
            </div>
            <p className="text-emerald-800 text-xs font-medium">
              {lastResult.displayMessage}
            </p>
            {lastResult.targetUrl && (
              <div className="pt-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    router.push(lastResult.targetUrl!);
                    onClose();
                  }}
                  className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white transition shadow-2xs cursor-pointer"
                >
                  <span>Open Target View</span>
                  <span>→</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* QUICK SUGGESTIONS CHIPS */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Suggested Spoken Commands:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {[
              "Open Candidate Applications",
              "Compare Priya with other candidates",
              "Approve pending leave request",
              "Freeze position budget",
              "Show active sessions",
              "Design Equipment Maintenance schema",
              "Summarize enterprise telemetry",
            ].map((cmd, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleQuickPromptClick(cmd)}
                className="rounded-xl bg-white hover:bg-slate-50 border border-slate-200 px-2.5 py-1 text-[10px] font-semibold text-slate-700 hover:text-blue-600 hover:border-blue-300 transition shadow-2xs cursor-pointer"
              >
                &ldquo;{cmd}&rdquo;
              </button>
            ))}
          </div>
        </div>

        {/* MANUAL INPUT FALLBACK */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (manualInput.trim()) {
                setTranscript(manualInput.trim());
                executeSpokenCommand(manualInput.trim());
              }
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="Or type voice command manually..."
              className="h-9 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 transition"
            />
            <button
              type="submit"
              disabled={!manualInput.trim()}
              className="h-9 rounded-xl bg-blue-600 hover:bg-blue-700 px-4 text-xs font-semibold text-white transition shadow-2xs disabled:opacity-40 cursor-pointer"
            >
              Run
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
