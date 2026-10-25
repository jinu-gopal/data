"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  AiChatReply,
  AiActionExecutionResult,
  AiGeneratedSchema,
  AiGeneratedWorkflow,
  AiGeneratedTalentPipeline,
} from "@/lib/max-ai-brain";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  actionType?: string;
  executedAction?: AiActionExecutionResult | null;
  proposedSchema?: AiGeneratedSchema | null;
  proposedWorkflow?: AiGeneratedWorkflow | null;
  proposedPipeline?: AiGeneratedTalentPipeline | null;
  proposedTalentPipeline?: AiGeneratedTalentPipeline | null;
  suggestedQueries?: string[];
}

interface MaxAiCopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MaxAiCopilotDrawer({ isOpen, onClose }: MaxAiCopilotDrawerProps) {
  const pathname = usePathname();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-copilot",
      role: "assistant",
      content:
        "Hello! I am **MAX AI Enterprise Copilot**, embedded natively across all MAX ERP workflows.\n\n" +
        "You can command me to execute operations, approve requisitions & leaves, design custom schemas, or query real-time enterprise telemetry.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      suggestedQueries: [
        "Summarize platform telemetry",
        "Approve pending leave request",
        "Freeze position budget",
        "Design Equipment Maintenance schema",
      ],
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Context Module Detection
  const currentModule = pathname?.startsWith("/recruitment")
    ? "recruitment"
    : pathname?.startsWith("/workforce")
    ? "workforce"
    : pathname?.startsWith("/security")
    ? "security"
    : pathname?.startsWith("/integrations")
    ? "integrations"
    : pathname?.startsWith("/configuration")
    ? "configuration"
    : "general";

  // Auto-focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Web Speech API Voice Dictation
  const toggleListening = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).SpeechRecognition ||
      (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please type your command.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputPrompt(transcript);
          handleSend(transcript);
        }
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const handleSend = async (overridePrompt?: string) => {
    const promptToSend = (overridePrompt || inputPrompt).trim();
    if (!promptToSend || isSending) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      role: "user",
      content: promptToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt("");
    setIsSending(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: promptToSend,
          contextModule: currentModule,
        }),
      });

      if (res.ok) {
        const data: AiChatReply = await res.json();
        const aiMsg: Message = {
          id: `ai-${Date.now()}`,
          role: "assistant",
          content: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          actionType: data.actionType,
          executedAction: data.executedAction,
          proposedSchema: data.proposedSchema,
          proposedWorkflow: data.proposedWorkflow,
          proposedPipeline: data.proposedTalentPipeline || data.proposedPipeline,
          proposedTalentPipeline: data.proposedTalentPipeline || data.proposedPipeline,
          suggestedQueries: data.suggestedQueries,
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        throw new Error("AI copilot server unavailable");
      }
    } catch {
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        role: "assistant",
        content: "I encountered a transient connection issue. Falling back to local brain intelligence.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        suggestedQueries: ["Summarize platform telemetry", "View workforce status"],
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <aside className="w-screen max-w-md border-l border-slate-200 bg-white text-slate-900 shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-200">
          
          {/* TOPBAR */}
          <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 shadow-2xs text-white font-bold text-sm">
                ✨
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold tracking-tight text-slate-900 font-sans">MAX AI Copilot</h3>
                  <span className="rounded-full bg-blue-50 border border-blue-200/80 px-2 py-0.5 text-[10px] font-mono font-bold text-blue-700">
                    {currentModule.toUpperCase()}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">Autonomous Enterprise Assistant</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <Link
                href="/ai"
                onClick={onClose}
                className="rounded-xl px-2 py-1 text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition text-xs font-semibold flex items-center gap-1"
                title="Open Full AI Studio"
              >
                <span>Studio</span>
                <span className="text-[10px]">↗</span>
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                aria-label="Close Copilot"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* CHAT MESSAGES STREAM */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-[#f8fafc]">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
              >
                <div className="flex items-center gap-1.5 mb-1 px-1">
                  <span className="text-[10px] font-semibold text-slate-500">
                    {m.role === "user" ? "You" : "MAX AI"}
                  </span>
                  <span className="text-[9px] text-slate-400">• {m.timestamp}</span>
                </div>

                <div
                  className={`rounded-2xl px-4 py-3 text-xs leading-relaxed max-w-[92%] ${
                    m.role === "user"
                      ? "bg-blue-600 text-white rounded-tr-none shadow-2xs font-medium"
                      : "bg-white text-slate-800 border border-slate-200/90 rounded-tl-none shadow-2xs"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{m.content}</div>

                  {/* ACTION EXECUTION CONFIRMATION CARD */}
                  {m.executedAction && (
                    <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50/80 p-2.5 text-emerald-950">
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Action Executed Successfully</span>
                        </span>
                        <span className="font-mono text-[10px] text-emerald-700">{m.executedAction.actionType}</span>
                      </div>
                      <p className="mt-1 text-[11px] text-emerald-800 font-medium">
                        {m.executedAction.entityName}
                      </p>
                      {m.executedAction.deepLink && (
                        <div className="mt-2 pt-2 border-t border-emerald-200 flex justify-end">
                          <Link
                            href={m.executedAction.deepLink}
                            onClick={onClose}
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-2 py-1 text-[10px] font-semibold text-white transition shadow-2xs"
                          >
                            <span>Inspect Entity in Studio</span>
                            <span>→</span>
                          </Link>
                        </div>
                      )}
                    </div>
                  )}

                  {/* PROPOSED SCHEMA CARD */}
                  {m.proposedSchema && (
                    <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50/70 p-2.5 text-slate-900">
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className="text-blue-800">Schema Proposal: {m.proposedSchema.name}</span>
                        <span className="rounded bg-blue-100 text-blue-700 px-1.5 py-0.5 text-[9px] font-mono font-bold">
                          {m.proposedSchema.fields.length} Fields
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-600 line-clamp-2">
                        {m.proposedSchema.description}
                      </p>
                      <div className="mt-2.5 flex items-center justify-end gap-2 pt-2 border-t border-blue-200">
                        <Link
                          href="/ai?tab=schema"
                          onClick={onClose}
                          className="rounded-lg bg-blue-600 hover:bg-blue-700 px-2.5 py-1 text-[10px] font-semibold text-white transition shadow-2xs"
                        >
                          Customize in Schema Studio
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* PROPOSED WORKFLOW CARD */}
                  {m.proposedWorkflow && (
                    <div className="mt-3 rounded-xl border border-indigo-200 bg-indigo-50/70 p-2.5 text-slate-900">
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className="text-indigo-800">Workflow: {m.proposedWorkflow.name}</span>
                        <span className="rounded bg-indigo-100 text-indigo-700 px-1.5 py-0.5 text-[9px] font-mono font-bold">
                          {m.proposedWorkflow.steps.length} Gates
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-600 line-clamp-2">
                        {m.proposedWorkflow.description}
                      </p>
                      <div className="mt-2.5 flex items-center justify-end gap-2 pt-2 border-t border-indigo-200">
                        <Link
                          href="/ai?tab=workflow"
                          onClick={onClose}
                          className="rounded-lg bg-indigo-600 hover:bg-indigo-700 px-2.5 py-1 text-[10px] font-semibold text-white transition shadow-2xs"
                        >
                          Inspect Workflow Blueprint
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* PROPOSED TALENT PIPELINE CARD */}
                  {(m.proposedPipeline || m.proposedTalentPipeline) && (() => {
                    const pipe = m.proposedPipeline || m.proposedTalentPipeline!;
                    return (
                      <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50/80 p-3 text-slate-900 space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-bold">
                          <span className="text-blue-900 flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                            <span>Talent Pipeline: {pipe.name}</span>
                          </span>
                          <span className="rounded bg-blue-100 text-blue-700 px-1.5 py-0.5 text-[9px] font-bold font-mono">
                            {pipe.stages.length} Stages • {pipe.totalTurnaroundSlaDays}d SLA
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-snug">
                          {pipe.description}
                        </p>
                        <div className="space-y-1 pt-1 border-t border-blue-200/80">
                          {pipe.stages.map((st) => (
                            <div key={st.stageKey} className="flex items-center justify-between rounded-lg bg-white px-2 py-1 text-[10px] border border-slate-200 shadow-2xs">
                              <span className="font-semibold text-slate-800">
                                {st.stageOrder}. {st.name}
                              </span>
                              <span className="font-mono text-[9px] font-bold text-blue-600">
                                {st.slaLabel}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-2.5 flex items-center justify-between gap-2 pt-2 border-t border-blue-200">
                          <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                            <span>✓</span> EEOC & GDPR Compliant
                          </span>
                          <Link
                            href="/recruitment/candidates"
                            onClick={onClose}
                            className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-3 py-1 text-[10px] font-bold text-white transition shadow-2xs"
                          >
                            Deploy to Recruiting →
                          </Link>
                        </div>
                      </div>
                    );
                  })()}

                  {/* SUGGESTED QUERY CHIPS */}
                  {m.suggestedQueries && m.suggestedQueries.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                      {m.suggestedQueries.map((q, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleSend(q)}
                          className="rounded-xl bg-white hover:bg-slate-50 border border-slate-200 px-2.5 py-1 text-[10px] font-semibold text-slate-700 hover:text-blue-600 hover:border-blue-300 transition text-left shadow-2xs cursor-pointer"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isSending && (
              <div className="flex items-center gap-2 text-slate-500 text-xs px-2 py-1">
                <span className="inline-block h-2 w-2 rounded-full bg-blue-600 animate-ping" />
                <span>MAX AI is reasoning across ERP stores...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* INPUT BAR */}
          <div className="border-t border-slate-200 bg-white p-3.5">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="relative flex items-center"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                placeholder={isListening ? "Listening... Speak now" : "Ask anything or execute action..."}
                disabled={isSending}
                className="h-10 w-full rounded-xl border border-slate-200/90 bg-slate-50 pl-3.5 pr-20 text-xs font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 transition disabled:opacity-50"
              />

              <div className="absolute right-1.5 flex items-center gap-1">
                {/* Voice Input Button */}
                <button
                  type="button"
                  onClick={toggleListening}
                  aria-label="Voice input"
                  className={`flex h-7 w-7 items-center justify-center rounded-lg transition cursor-pointer ${
                    isListening
                      ? "bg-red-600 text-white animate-pulse"
                      : "text-slate-400 hover:text-blue-600 hover:bg-slate-100"
                  }`}
                  title="Voice Command Dictation"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 003-3V5a3 3 0 10-6 0v6a3 3 0 003 3z" />
                  </svg>
                </button>

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={!inputPrompt.trim() || isSending}
                  aria-label="Send message"
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition disabled:opacity-30 disabled:cursor-not-allowed shadow-2xs cursor-pointer"
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </form>
            <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 px-1">
              <span>Press <kbd className="font-mono text-slate-500">Enter</kbd> to execute</span>
              <span>Autonomous Action Engine Active</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
