"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Requisition, CandidateItem } from "@/lib/recruitment-store";
import { maxVoiceEngine } from "@/lib/max-voice-engine";

export interface ChatMessage {
  id: string;
  sender: "ai" | "user";
  text: string;
  timestamp: string;
  actionCards?: {
    type: "candidates" | "requisitions" | "next-steps" | "comparison" | "insights";
    candidates?: CandidateItem[];
    requisition?: Requisition;
    bullets?: string[];
    actionLabel?: string;
    onAction?: () => void;
  };
}

interface AiCopilotChatWorkspaceProps {
  requisitions: Requisition[];
  candidates: CandidateItem[];
  activeReq: Requisition;
  onNavigateWorkspace: (workspace: string, meta?: any) => void;
  onTriggerToast: (msg: string) => void;
  onRequestConfirmation: (action: any) => void;
  initialQuery?: string;
}

const QUICK_PROMPTS = [
  { label: "⚡ Top AI Matches", query: "Who are our top-matched candidates for Senior Java Developer?" },
  { label: "📁 360° Candidate Dossier", query: "Show Candidate Dossier for Priya Menon" },
  { label: "🛠️ MAX AI Studio", query: "Open MAX AI Studio and show autonomous workflows" },
  { label: "📊 Hiring Bottlenecks", query: "What are the main bottlenecks slowing down hiring this week?" },
  { label: "📄 Summarize REQ-2026-00123", query: "Summarize requisition REQ-2026-00123" },
  { label: "⚖️ Compare Priya vs Sneha", query: "Compare Priya Menon and Sneha S" },
  { label: "✉️ Draft Interview Invite", query: "Draft an interview invitation email to Priya Menon" },
  { label: "✍️ Pending Offer Approvals", query: "Show pending offer approvals" },
];

export default function AiCopilotChatWorkspace({
  requisitions,
  candidates,
  activeReq,
  onNavigateWorkspace,
  onTriggerToast,
  onRequestConfirmation,
  initialQuery = "",
}: AiCopilotChatWorkspaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-welcome",
      sender: "ai",
      text: `Hello John. I am **MAX AI**, your enterprise talent acquisition copilot.\n\nI am actively monitoring **${requisitions.length} open requisitions**, **${candidates.length} active candidates**, and **32 scheduled interviews** across your enterprise pipeline.\n\nYou can ask natural recruiting questions, analyze candidate fit rubrics, draft communications, or command autonomous pipeline actions.`,
      timestamp: "Just now",
      actionCards: {
        type: "next-steps",
        bullets: [
          "Priya Menon (92% Fit) has completed technical rounds and is ready for executive debrief.",
          "2 interviewer scorecards are overdue (> 24h SLA) for System Architecture rounds.",
          "Level 2 compensation approval pending for Emily Zhang ($160k package).",
        ],
        actionLabel: "View Prioritized Next Steps",
        onAction: () => onNavigateWorkspace("next-steps"),
      },
    },
  ]);

  const [inputVal, setInputVal] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  // Execute initial query if provided
  useEffect(() => {
    if (initialQuery.trim() && messages.length === 1) {
      handleSendPrompt(initialQuery);
    }
  }, [initialQuery]);

  const speakText = (text: string) => {
    const clean = text.replace(/[*#`_~[\]()]/g, "").trim();
    setIsSpeaking(true);
    maxVoiceEngine.speak(clean, () => setIsSpeaking(false));
  };

  const handleSendPrompt = (promptText: string) => {
    const q = promptText.trim();
    if (!q) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      sender: "user",
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal("");
    setIsThinking(true);

    setTimeout(() => {
      processAgenticQuery(q);
      setIsThinking(false);
    }, 450);
  };

  const processAgenticQuery = (query: string) => {
    const lower = query.toLowerCase();

    // 1. Candidate Comparison Queries
    if (lower.includes("compare") || lower.includes("versus") || lower.includes("vs")) {
      const c1 = candidates.find((c) => lower.includes(c.name.toLowerCase().split(" ")[0])) || candidates[0];
      const c2 = candidates.find((c) => c.id !== c1.id && lower.includes(c.name.toLowerCase().split(" ")[0])) || candidates[1] || candidates[0];

      const aiMsg: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        sender: "ai",
        text: `### Comparative Evaluation: **${c1.name}** vs **${c2.name}**\n\n• **${c1.name}** (${c1.matchScore}% Match): Lead candidate for ${c1.role}. Demonstrates 4.5 years experience with deep expertise in distributed event streaming.\n• **${c2.name}** (${c2.matchScore}% Match): Strong core foundations with 3.2 years experience and rapid feature execution.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        actionCards: {
          type: "comparison",
          candidates: [c1, c2],
          actionLabel: "Open Side-by-Side Comparison Workspace",
          onAction: () => onNavigateWorkspace("compare", { cand1: c1.id, cand2: c2.id }),
        },
      };
      setMessages((prev) => [...prev, aiMsg]);
      speakText(`Compared ${c1.name} at ${c1.matchScore} percent match versus ${c2.name} at ${c2.matchScore} percent match.`);
      return;
    }

    // 2. Candidate Match / Find Queries
    if (lower.includes("candidate") || lower.includes("find") || lower.includes("top match") || lower.includes("who applied")) {
      const topMatches = [...candidates]
        .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
        .slice(0, 3);

      const aiMsg: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        sender: "ai",
        text: `### Top Matched Candidates for **${activeReq.title}** (${activeReq.reqNumber})\n\nEvaluated **${candidates.length} active applicants** against required skills (${activeReq.requiredSkills?.join(", ") || "Java, Spring Boot"}):\n\n1. **${topMatches[0].name}** — **${topMatches[0].matchScore}% Match** (${topMatches[0].stage})\n2. **${topMatches[1].name}** — **${topMatches[1].matchScore}% Match** (${topMatches[1].stage})\n3. **${topMatches[2].name}** — **${topMatches[2].matchScore}% Match** (${topMatches[2].stage})`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        actionCards: {
          type: "candidates",
          candidates: topMatches,
          actionLabel: "Open in Find Candidates Workspace",
          onAction: () => onNavigateWorkspace("find-candidates", { query }),
        },
      };
      setMessages((prev) => [...prev, aiMsg]);
      speakText(`Found ${topMatches.length} top candidates for ${activeReq.title}, led by ${topMatches[0].name} with a ${topMatches[0].matchScore} percent match score.`);
      return;
    }

    // 3. Requisition Summary Queries
    if (lower.includes("summarize") || lower.includes("summary") || lower.includes("req-") || lower.includes("requisition status")) {
      const foundReq = requisitions.find((r) => lower.includes(r.reqNumber.toLowerCase()) || lower.includes(r.title.toLowerCase())) || activeReq;
      const count = candidates.filter((c) => c.requisitionId === foundReq.reqNumber || c.requisitionId === foundReq.id).length;

      const aiMsg: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        sender: "ai",
        text: `### Requisition Telemetry: **${foundReq.reqNumber}** (${foundReq.title})\n\n• **Status**: ${foundReq.status} • **Department**: ${foundReq.department} • **Location**: ${foundReq.location}\n• **Headcount**: ${foundReq.filledHeadcount} / ${foundReq.targetHeadcount} Filled • **Target Date**: ${foundReq.targetStartDate || "01 Dec 2026"}\n• **Active Pipeline**: ${count || 28} Candidates\n• **Velocity**: Average turnaround is 12.4 days vs 14 days SLA.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        actionCards: {
          type: "requisitions",
          requisition: foundReq,
          actionLabel: "Open Requisition Summary Workspace",
          onAction: () => onNavigateWorkspace("summarize", { reqId: foundReq.id }),
        },
      };
      setMessages((prev) => [...prev, aiMsg]);
      speakText(`Summary for ${foundReq.reqNumber}: Position is ${foundReq.status} with ${count || 28} active candidates.`);
      return;
    }

    // 4. Hiring Bottlenecks & SLA Analytics
    if (lower.includes("bottleneck") || lower.includes("delay") || lower.includes("sla") || lower.includes("slow")) {
      const aiMsg: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        sender: "ai",
        text: `### AI Operational Bottleneck Diagnostic\n\n1. **Overdue Interview Scorecards**: 2 technical panel scorecards for REQ-2026-00123 are overdue by 18 hours (assigned to Marcus Chen).\n2. **Level 2 Offer Sign-Off**: Compensation approval for Emily Zhang ($160k base) is awaiting VP authorization.\n3. **Screening Pipeline Depth**: Careers portal submissions for Product Management require recruiter review.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        actionCards: {
          type: "next-steps",
          bullets: [
            "Send automated scorecard reminder to Marcus Chen",
            "Review and sign Level 2 VP offer for Emily Zhang",
            "Triage 8 new inbound resumes in screening queue",
          ],
          actionLabel: "Execute Next Steps Actions",
          onAction: () => onNavigateWorkspace("next-steps"),
        },
      };
      setMessages((prev) => [...prev, aiMsg]);
      speakText("Identified 2 key bottlenecks: overdue interview scorecards and pending Level 2 offer authorization.");
      return;
    }

    // 5. Draft Email Queries
    if (lower.includes("draft") || lower.includes("email") || lower.includes("write to") || lower.includes("invite")) {
      const target = candidates.find((c) => lower.includes(c.name.toLowerCase().split(" ")[0])) || candidates[0];

      const aiMsg: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        sender: "ai",
        text: `### Prepared Email Draft for **${target.name}**\n\n**Subject**: Interview Invitation: ${activeReq.title} at MAX Enterprise\n\nI have pre-populated a personalized, professional invitation draft with candidate experience highlights and scheduling links ready for review in the Email Workspace.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        actionCards: {
          type: "next-steps",
          actionLabel: "Open Draft Email Workspace",
          onAction: () => onNavigateWorkspace("draft-email", { candidateId: target.id }),
        },
      };
      setMessages((prev) => [...prev, aiMsg]);
      speakText(`Prepared interview invitation email draft for ${target.name}.`);
      return;
    }

    // 6. Next Steps & Actions
    if (lower.includes("next step") || lower.includes("what next") || lower.includes("recommend") || lower.includes("todo")) {
      const aiMsg: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        sender: "ai",
        text: `### Recommended Next Actions for Hiring Team\n\n• **Priority 1**: Advance Priya Menon (92% Fit) to Executive Debrief round.\n• **Priority 2**: Send reminder for overdue technical scorecard on REQ-2026-00123.\n• **Priority 3**: Complete Level 2 offer authorization for Emily Zhang ($160k).\n• **Priority 4**: Initiate BGV compliance check for Lucas Vance.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        actionCards: {
          type: "next-steps",
          actionLabel: "Open Next Steps Action Workspace",
          onAction: () => onNavigateWorkspace("next-steps"),
        },
      };
      setMessages((prev) => [...prev, aiMsg]);
      speakText("Recommended 4 priority hiring actions including advancing Priya Menon and clearing overdue scorecards.");
      return;
    }

    // 7. Analytics & Insights
    if (lower.includes("insight") || lower.includes("analytics") || lower.includes("metric") || lower.includes("funnel") || lower.includes("time to hire")) {
      const aiMsg: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        sender: "ai",
        text: `### Talent Pipeline Telemetry & Velocity Highlights\n\n• **Time to Hire**: 18.4 days (target 21.0d • 12% faster than SaaS benchmark)\n• **Offer Acceptance Rate**: 94.2% across global hubs\n• **Application Volume**: 128 applicants (+18% MoM)\n• **Top Sourcing Channel**: LinkedIn (44%), followed by Employee Referrals (28%)`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        actionCards: {
          type: "insights",
          actionLabel: "Open Insights & Analytics Workspace",
          onAction: () => onNavigateWorkspace("insights"),
        },
      };
      setMessages((prev) => [...prev, aiMsg]);
      speakText("Average time to hire is 18.4 days with a 94.2 percent offer acceptance rate.");
      return;
    }

    // 8. AI Studio & Workflow Engine
    if (lower.includes("studio") || lower.includes("workflow") || lower.includes("action registry") || lower.includes("llm")) {
      const aiMsg: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        sender: "ai",
        text: `### MAX AI Studio & Intelligent Workflows\n\n• **Action Registry**: 8 enterprise recruiting actions configured with role-based governance.\n• **Autonomous Workflows**: 3 event-driven blueprints active (Inbound Application Triage, Scorecard Reconciliation, Governed Offer Authorization).\n• **Multi-Tenant LLM Gateway**: Configurable Anthropic, OpenAI, and Google Gemini models with audit logging.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        actionCards: {
          type: "next-steps",
          actionLabel: "Launch MAX AI Studio ↗",
          onAction: () => {
            window.location.href = "/recruitment/ai-studio";
          },
        },
      };
      setMessages((prev) => [...prev, aiMsg]);
      speakText("MAX AI Studio is active with 8 configurable actions and 3 autonomous workflow blueprints.");
      return;
    }

    // 9. Candidate Dossier & Talent Memory
    if (lower.includes("dossier") || lower.includes("talent memory") || lower.includes("rediscovery") || lower.includes("provenance")) {
      const target = candidates.find((c) => lower.includes(c.name.toLowerCase().split(" ")[0])) || candidates[0];
      const aiMsg: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        sender: "ai",
        text: `### Unified Candidate Dossier: **${target.name}**\n\n• **8-Pillar AI Synthesis**: Verified skills, relevant experience (4.5 yrs), interview scorecards (4.2/5.0), and cultural alignment.\n• **Requirement Categorization**: 4 Demonstrated, 1 Partially Demonstrated, 0 Not Found.\n• **Provenance**: Original applicant for REQ-2026-00089 rediscovered via MAX Talent Memory.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        actionCards: {
          type: "next-steps",
          actionLabel: `View ${target.name}'s Full 360° Dossier ↗`,
          onAction: () => {
            window.location.href = `/recruitment/candidates`;
          },
        },
      };
      setMessages((prev) => [...prev, aiMsg]);
      speakText(`Candidate Dossier for ${target.name} demonstrates 8-pillar alignment with verified evidence.`);
      return;
    }

    // Fallback: General Enterprise Assistance
    const aiMsg: ChatMessage = {
      id: `msg-${Date.now()}-ai`,
      sender: "ai",
      text: `### MAX AI Intelligence Response\n\nI have evaluated your request against active recruiting data for **${activeReq.title}** (${activeReq.reqNumber}).\n\nI can execute actions across any of the 6 specialized workspaces: sourcing candidates, summarizing requisitions, drafting emails, managing workflow next steps, side-by-side candidate comparison, or recruiting analytics.`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      actionCards: {
        type: "next-steps",
        actionLabel: "Explore Action Workspaces",
        onAction: () => onNavigateWorkspace("find-candidates"),
      },
    };
    setMessages((prev) => [...prev, aiMsg]);
  };

  return (
    <div className="flex flex-col h-full space-y-3 text-slate-100">
      {/* 1. Quick Prompt Suggestion Chips */}
      <div className="shrink-0 space-y-1">
        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
          Suggested Copilot Queries
        </span>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {QUICK_PROMPTS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendPrompt(p.query)}
              className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-[#141e3d] text-slate-200 hover:text-white border border-slate-700/80 hover:border-indigo-500/60 text-[10px] font-medium transition shrink-0 cursor-pointer shadow-xs"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Messages Stream */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[380px] scrollbar-thin scrollbar-thumb-slate-700">
        {messages.map((msg) => {
          const isAi = msg.sender === "ai";

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${isAi ? "justify-start" : "justify-end"}`}
            >
              {isAi && (
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 text-white shrink-0 mt-0.5 shadow-[0_0_8px_rgba(99,102,241,0.5)]">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
                  </svg>
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-3 space-y-2 text-[11px] leading-relaxed shadow-lg ${
                  isAi
                    ? "bg-[#0d142b] border border-slate-800 text-slate-200"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium ml-auto"
                }`}
              >
                {/* Header row for AI */}
                {isAi && (
                  <div className="flex items-center justify-between pb-1 border-b border-slate-800/80 text-[9px]">
                    <span className="font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
                      MAX AI Copilot
                    </span>
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <span>{msg.timestamp}</span>
                      <button
                        type="button"
                        onClick={() => speakText(msg.text)}
                        className="hover:text-blue-300 cursor-pointer p-0.5"
                        title="Read aloud"
                      >
                        🔊
                      </button>
                    </div>
                  </div>
                )}

                {/* Text Content */}
                <div className="whitespace-pre-line font-normal space-y-1">
                  {msg.text}
                </div>

                {/* Action Card if provided */}
                {msg.actionCards && (
                  <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                    {msg.actionCards.bullets && (
                      <div className="space-y-1 bg-slate-900/60 p-2 rounded-lg text-[10px]">
                        {msg.actionCards.bullets.map((b, i) => (
                          <div key={i} className="flex items-start gap-1.5 text-slate-300">
                            <span className="text-blue-400 font-bold">•</span>
                            <span>{b}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {msg.actionCards.candidates && (
                      <div className="space-y-1.5">
                        {msg.actionCards.candidates.map((cand) => (
                          <div
                            key={cand.id}
                            className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-2 text-[10px]"
                          >
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="font-bold text-white truncate">{cand.name}</span>
                              <span className="px-1 py-0.2 rounded text-[8px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                {cand.matchScore}%
                              </span>
                              <span className="text-slate-400 truncate">{cand.stage}</span>
                            </div>
                            <Link
                              href={`/recruitment/candidates?id=${cand.id}`}
                              className="text-blue-400 hover:text-blue-300 font-semibold shrink-0"
                            >
                              Dossier ↗
                            </Link>
                          </div>
                        ))}
                      </div>
                    )}

                    {msg.actionCards.actionLabel && msg.actionCards.onAction && (
                      <button
                        type="button"
                        onClick={msg.actionCards.onAction}
                        className="w-full mt-1 py-1 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-[10px] font-bold transition shadow-xs cursor-pointer flex items-center justify-center gap-1"
                      >
                        <span>{msg.actionCards.actionLabel}</span>
                        <span>→</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {!isAi && (
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-800 text-slate-200 text-[10px] font-bold shrink-0 mt-0.5 border border-slate-700">
                  JS
                </div>
              )}
            </div>
          );
        })}

        {/* Live Thinking Indicator */}
        {isThinking && (
          <div className="flex items-center gap-2 text-[10px] text-indigo-300 p-2 rounded-xl bg-slate-900/60 border border-indigo-500/20 w-fit animate-pulse">
            <span className="flex h-2 w-2 rounded-full bg-indigo-400 animate-ping" />
            <span className="font-medium">MAX AI is analyzing talent telemetry & benchmarks...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendPrompt(inputVal);
        }}
        className="flex items-center bg-[#0d142b] border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-[11px] shadow-inner focus-within:border-blue-500 shrink-0"
      >
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Ask MAX AI (e.g. 'Compare Priya and Sneha', 'Summarize bottlenecks')..."
          className="flex-1 bg-transparent text-white placeholder-slate-400 focus:outline-hidden text-[11px]"
        />
        <button
          type="submit"
          disabled={!inputVal.trim() || isThinking}
          className="ml-1.5 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold disabled:opacity-30 cursor-pointer shadow-xs transition"
          title="Send query"
        >
          Send ↗
        </button>
      </form>
    </div>
  );
}
