"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  recruitmentStore,
  Requisition,
  CandidateItem,
} from "@/lib/recruitment-store";
import { maxVoiceEngine } from "@/lib/max-voice-engine";
import AiCopilotChatWorkspace from "./max-ai/AiCopilotChatWorkspace";
import FindCandidatesWorkspace from "./max-ai/FindCandidatesWorkspace";
import SummarizeWorkspace from "./max-ai/SummarizeWorkspace";
import DraftEmailWorkspace from "./max-ai/DraftEmailWorkspace";
import NextStepsWorkspace from "./max-ai/NextStepsWorkspace";
import CompareCandidatesWorkspace from "./max-ai/CompareCandidatesWorkspace";
import InsightsWorkspace from "./max-ai/InsightsWorkspace";

export type WorkspaceType =
  | "copilot"
  | "find-candidates"
  | "summarize"
  | "draft-email"
  | "next-steps"
  | "compare"
  | "insights"
  | null;

interface PendingAction {
  type: "EMAIL" | "STAGE_CHANGE" | "INTERVIEW" | "OFFER" | "BGV";
  title: string;
  description: string;
  execute: () => void;
}

interface MaxAiFloatingPanelProps {
  onFilterChange?: (filter: { status?: string; department?: string; search?: string }) => void;
  onSelectRequisition?: (req: Requisition) => void;
}

export default function MaxAiFloatingPanel({
  onFilterChange,
  onSelectRequisition,
}: MaxAiFloatingPanelProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Mode: null | "text" | "voice"
  const [mode, setMode] = useState<"text" | "voice" | null>(null);
  // Menu collapse state: true = expanded, false = collapsed to only the glowing circular icon
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  // Active Action Workspace: null (dock view) or one of the 7 mini-workspaces (including copilot)
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceType>(null);

  // Dynamic parameters passed into workspaces via NLP extraction
  const [nlpQuery, setNlpQuery] = useState("");
  const [targetEmailCandId, setTargetEmailCandId] = useState<string | undefined>(undefined);
  const [targetCompare1, setTargetCompare1] = useState<string | undefined>(undefined);
  const [targetCompare2, setTargetCompare2] = useState<string | undefined>(undefined);

  const [textInput, setTextInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [speechNotice, setSpeechNotice] = useState<string | null>(null);
  const [speechTranscript, setSpeechTranscript] = useState("");
  const [isTtsSpeaking, setIsTtsSpeaking] = useState(false);

  // Consequential confirmation & Toast states
  const [pendingConfirmation, setPendingConfirmation] = useState<PendingAction | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Domain Store Data & Context
  const [requisitions, setRequisitions] = useState<Requisition[]>([]);
  const [candidates, setCandidates] = useState<CandidateItem[]>([]);
  const [activeReq, setActiveReq] = useState<Requisition | null>(null);

  const recognitionRef = useRef<any>(null);

  // Initialize store subscriptions & data
  useEffect(() => {
    const reqs = recruitmentStore.getRequisitions();
    const cands = recruitmentStore.getCandidates();
    setRequisitions(reqs);
    setCandidates(cands);

    // Default to open Senior Java Developer requisition or first available
    const defaultReq =
      reqs.find((r) => r.reqNumber === "REQ-2026-00123") ||
      reqs.find((r) => r.status === "Open") ||
      reqs[0];
    if (defaultReq) {
      setActiveReq(defaultReq);
    }

    const refreshData = () => {
      setRequisitions(recruitmentStore.getRequisitions());
      setCandidates(recruitmentStore.getCandidates());
    };

    const interval = setInterval(refreshData, 3000);
    return () => clearInterval(interval);
  }, []);

  // Initialize Web Speech API
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onstart = () => {
          setIsListening(true);
          setSpeechNotice(null);
        };

        recognition.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((res: any) => res[0].transcript)
            .join("");
          setSpeechTranscript(transcript);
          if (event.results[0] && event.results[0].isFinal) {
            handleProcessCommand(transcript);
          }
        };

        recognition.onerror = (event: any) => {
          setIsListening(false);
          if (event.error === "not-allowed" || event.error === "permission-denied") {
            setSpeechNotice("Microphone permission denied. Please allow microphone in browser.");
          } else {
            setSpeechNotice(`Speech notice: ${event.error}. You can type in Text mode.`);
          }
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4500);
  };

  const handleToggleMode = (selectedMode: "text" | "voice") => {
    if (mode === selectedMode) {
      setMode(null);
      if (isListening) {
        recognitionRef.current?.stop();
        setIsListening(false);
      }
      return;
    }

    setMode(selectedMode);
    setSpeechNotice(null);

    if (selectedMode === "voice") {
      if (!recognitionRef.current) {
        setSpeechNotice("Voice recognition not supported in this browser. Please use Text mode.");
        return;
      }
      try {
        if (isListening) {
          recognitionRef.current.stop();
          setIsListening(false);
        } else {
          recognitionRef.current.start();
        }
      } catch (err) {
        console.warn("Speech recognition issue:", err);
      }
    } else {
      if (isListening) {
        recognitionRef.current?.stop();
        setIsListening(false);
      }
    }
  };

  // =========================================================================
  // Deep Intelligent NLP Parser & Entity Extractor
  // =========================================================================
  const handleProcessCommand = (instruction: string) => {
    const raw = instruction.trim();
    if (!raw) return;

    const lower = raw.toLowerCase();
    setTextInput("");
    setSpeechTranscript("");
    setMode(null);

    // 1. Consequential Action: Send Email
    if (
      lower.includes("send email") ||
      lower.includes("dispatch email") ||
      lower.includes("send mail") ||
      lower.includes("mail to")
    ) {
      setPendingConfirmation({
        type: "EMAIL",
        title: "Send Candidate / Hiring Team Email",
        description:
          "Are you sure you want to dispatch this email to Priya Menon and the hiring manager via Enterprise Mail Services?",
        execute: () => {
          recruitmentStore.addMessage({
            senderName: "John Smith (Recruiter)",
            senderRole: "Colleague",
            subject: "Candidate Pipeline Update: Technical Panel Confirmed",
            preview:
              "Candidate Priya Menon has been aligned for the final architecture debrief round.",
            category: "Candidates",
          });
          triggerToast("✉️ Email successfully dispatched to candidate & hiring team.");
        },
      });
      return;
    }

    // 2. Consequential Action: Advance / Move Candidate
    if (
      lower.includes("advance") ||
      lower.includes("move") ||
      lower.includes("shortlist") ||
      lower.includes("reject") ||
      lower.includes("hire")
    ) {
      const cands = recruitmentStore.getCandidates();
      let target =
        cands.find(
          (c) =>
            lower.includes(c.name.toLowerCase()) ||
            c.name.toLowerCase().split(" ").some((p) => p.length > 2 && lower.includes(p))
        ) || cands[0];

      let targetStage: CandidateItem["stage"] = "Interview";
      if (lower.includes("offer")) targetStage = "Offer";
      else if (lower.includes("hire") || lower.includes("hired")) targetStage = "Hired";
      else if (lower.includes("screen")) targetStage = "Screening";
      else if (lower.includes("reject")) targetStage = "Rejected";

      setPendingConfirmation({
        type: "STAGE_CHANGE",
        title: `Advance Candidate: ${target.name}`,
        description: `Are you sure you want to transition candidate ${target.name} to the '${targetStage}' stage for requisition '${target.requisitionTitle}'?`,
        execute: () => {
          const statusLabel: CandidateItem["statusLabel"] =
            targetStage === "Offer"
              ? "Offer"
              : targetStage === "Hired"
              ? "Hired"
              : targetStage === "Interview"
              ? "Interview"
              : targetStage === "Rejected"
              ? "Rejected"
              : "In Review";
          recruitmentStore.updateCandidateStage(target.id, targetStage, statusLabel);
          triggerToast(`🚀 Candidate ${target.name} successfully moved to ${targetStage} stage.`);
        },
      });
      return;
    }

    // 3. Consequential Action: Approve Offer
    if (lower.includes("approve offer") || lower.includes("sign offer")) {
      setPendingConfirmation({
        type: "OFFER",
        title: "Approve Candidate Offer: Emily Zhang ($160,000)",
        description:
          "Are you sure you want to sign off as Level 2 Executive Approver on the compensation offer for Emily Zhang?",
        execute: () => {
          triggerToast("✍️ Level 2 Executive Sign-off completed for Emily Zhang.");
        },
      });
      return;
    }

    // 4. Intent: Candidate Comparison
    if (lower.includes("compare") || lower.includes("versus") || lower.includes("vs")) {
      const cands = recruitmentStore.getCandidates();
      const c1 = cands.find((c) => lower.includes(c.name.toLowerCase().split(" ")[0])) || cands[0];
      const c2 =
        cands.find((c) => c.id !== c1.id && lower.includes(c.name.toLowerCase().split(" ")[0])) ||
        cands[1] ||
        cands[0];
      setTargetCompare1(c1.id);
      setTargetCompare2(c2.id);
      setActiveWorkspace("compare");
      return;
    }

    // 5. Intent: Requisition Summary
    if (
      lower.includes("summarize") ||
      lower.includes("summary") ||
      lower.includes("req-") ||
      lower.includes("overview")
    ) {
      const reqs = recruitmentStore.getRequisitions();
      const matchedReq = reqs.find(
        (r) =>
          lower.includes(r.reqNumber.toLowerCase()) ||
          lower.includes(r.title.toLowerCase())
      );
      if (matchedReq) {
        setActiveReq(matchedReq);
      }
      setActiveWorkspace("summarize");
      return;
    }

    // 6. Intent: Draft Email
    if (
      lower.includes("draft") ||
      lower.includes("email") ||
      lower.includes("message") ||
      lower.includes("write to")
    ) {
      const cands = recruitmentStore.getCandidates();
      const matchedCand = cands.find((c) =>
        lower.includes(c.name.toLowerCase().split(" ")[0])
      );
      if (matchedCand) {
        setTargetEmailCandId(matchedCand.id);
      }
      setActiveWorkspace("draft-email");
      return;
    }

    // 7. Intent: Next Steps / Recommendations
    if (
      lower.includes("next step") ||
      lower.includes("recommend") ||
      lower.includes("what next") ||
      lower.includes("todo") ||
      lower.includes("pending")
    ) {
      setActiveWorkspace("next-steps");
      return;
    }

    // 8. Intent: Find Candidates
    if (
      lower.includes("find") ||
      lower.includes("candidate") ||
      lower.includes("applicant") ||
      lower.includes("search") ||
      lower.includes("developer") ||
      lower.includes("engineer") ||
      lower.includes("java")
    ) {
      setNlpQuery(raw);
      setActiveWorkspace("find-candidates");
      return;
    }

    // 9. Intent: Insights & Analytics
    if (
      lower.includes("insight") ||
      lower.includes("analytics") ||
      lower.includes("trend") ||
      lower.includes("metric") ||
      lower.includes("velocity") ||
      lower.includes("funnel") ||
      lower.includes("time to hire")
    ) {
      setActiveWorkspace("insights");
      return;
    }

    // 10. Default: Open full Conversational Copilot with this prompt
    setNlpQuery(raw);
    setActiveWorkspace("copilot");
  };

  // Quick Action Pill Click Handler
  const handlePillClick = (actionName: string) => {
    switch (actionName) {
      case "Find Candidates":
        setActiveWorkspace("find-candidates");
        break;
      case "Summarize":
        setActiveWorkspace("summarize");
        break;
      case "Draft Email":
        setActiveWorkspace("draft-email");
        break;
      case "Next Steps":
        setActiveWorkspace("next-steps");
        break;
      case "Compare":
        setActiveWorkspace("compare");
        break;
      case "Insights":
        setActiveWorkspace("insights");
        break;
    }
  };

  // Add Candidate to Requisition Handler
  const handleAddCandidateToRequisition = (cand: CandidateItem, req: Requisition) => {
    recruitmentStore.updateCandidateStage(cand.id, "Applied", "New");
    triggerToast(`✓ ${cand.name} successfully added to ${req.reqNumber} (${req.title})`);
  };

  // Advance Candidate Stage Handler
  const handleAdvanceCandidate = (cand: CandidateItem, targetStage: CandidateItem["stage"]) => {
    const label: CandidateItem["statusLabel"] =
      targetStage === "Offer"
        ? "Offer"
        : targetStage === "Interview"
        ? "Interview"
        : "In Review";
    recruitmentStore.updateCandidateStage(cand.id, targetStage, label);
  };

  // Send Email Handler with confirmation
  const handleRequestSendEmail = (payload: {
    recipientName: string;
    recipientEmail: string;
    subject: string;
    message: string;
  }) => {
    setPendingConfirmation({
      type: "EMAIL",
      title: `Dispatch Email to ${payload.recipientName}`,
      description: `Are you sure you want to dispatch this email to ${payload.recipientName} (${payload.recipientEmail}) via Enterprise Mail Services? Subject: "${payload.subject}"`,
      execute: () => {
        recruitmentStore.addMessage({
          senderName: "John Smith (Recruiter)",
          senderRole: "Colleague",
          subject: payload.subject,
          preview: payload.message.slice(0, 100) + "...",
          category: "Candidates",
        });
        triggerToast(`✉️ Email successfully dispatched to ${payload.recipientName}.`);
        setActiveWorkspace(null);
      },
    });
  };

  const currentReq = activeReq || requisitions[0] || {
    id: "req-123",
    reqNumber: "REQ-2026-00123",
    title: "Senior Java Developer",
    department: "Engineering",
    location: "Bangalore, India",
    status: "Open",
    employmentType: "Full-time",
    targetHeadcount: 2,
    filledHeadcount: 0,
    salaryRange: "₹ 12,00,000 - 18,00,000",
    hiringManager: {
      name: "Maria Lopez",
      avatar: "",
      email: "maria.lopez@max-enterprise.com",
      title: "Engineering Director",
    },
    requiredSkills: ["Java", "Spring Boot", "Microservices"],
  } as Requisition;

  return (
    <>
      {/* 1. Ambient Background Glow */}
      <div
        className={`fixed bottom-0 right-0 pointer-events-none z-30 overflow-hidden w-[320px] h-[320px] select-none transition-opacity duration-300 ${
          isMenuOpen ? "opacity-40" : "opacity-0"
        }`}
      >
        <svg
          viewBox="0 0 300 300"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="ai-glow-neon" cx="80%" cy="80%" r="60%">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#ec4899" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="260" cy="260" r="180" fill="url(#ai-glow-neon)" />
        </svg>
      </div>

      {/* 2. Toast Notifications */}
      {toastMessage && (
        <div className="fixed bottom-20 right-5 z-50 rounded-lg bg-slate-900/95 border border-slate-700/80 px-3 py-1.5 text-[11px] font-semibold text-white shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 flex items-center gap-1.5">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 3. Consequential Action Confirmation Dialog */}
      {pendingConfirmation && (
        <div className="fixed bottom-24 right-5 z-50 w-76 sm:w-84 rounded-xl bg-[#090e1f] border border-amber-500/70 p-3.5 shadow-2xl text-white space-y-2.5 animate-in fade-in slide-in-from-bottom-3 backdrop-blur-lg">
          <div className="flex items-center gap-1.5 text-amber-400 text-[10px] font-bold uppercase tracking-wider">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-400/20 text-amber-300 text-[10px]">
              ⚠️
            </span>
            <span>Confirmation Required</span>
          </div>
          <h4 className="text-xs font-bold text-slate-100">{pendingConfirmation.title}</h4>
          <p className="text-[11px] text-slate-300 leading-relaxed font-normal">
            {pendingConfirmation.description}
          </p>
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setPendingConfirmation(null)}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                const action = pendingConfirmation;
                setPendingConfirmation(null);
                action.execute();
              }}
              className="px-3 py-1 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-[11px] font-bold transition shadow-xs cursor-pointer"
            >
              Confirm
            </button>
          </div>
        </div>
      )}

      {/* =======================================================================
       * 4. FOCUSED MINI-WORKSPACE / COPILOT PANEL (When an action is active)
       * ===================================================================== */}
      {isMenuOpen && activeWorkspace !== null && (
        <div className="fixed bottom-4 right-4 sm:bottom-5 sm:right-5 z-50 w-[470px] sm:w-[510px] max-w-[calc(100vw-24px)] max-h-[88vh] flex flex-col rounded-2xl bg-[#080d1f]/98 border border-indigo-500/50 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_30px_rgba(99,102,241,0.25)] backdrop-blur-2xl text-white overflow-hidden animate-in fade-in slide-in-from-bottom-3">
          {/* Header Bar */}
          <div className="px-3.5 py-2.5 bg-gradient-to-r from-[#111936] via-[#0d142b] to-[#080d1f] border-b border-indigo-500/30 shrink-0 space-y-2">
            <div className="flex items-center justify-between">
              {/* Left Brand Badge */}
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 via-purple-600 to-fuchsia-600 text-white shrink-0 shadow-[0_0_10px_rgba(139,92,246,0.6)]">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[12px] font-black tracking-wider text-white">
                      MAX AI
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      Copilot Enterprise
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Controls: Voice TTS Mute Toggle + Back to Dock + Close Button */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    const newState = !maxVoiceEngine.isVoiceEnabled();
                    maxVoiceEngine.setVoiceEnabled(newState);
                    triggerToast(newState ? "🔊 Voice audio replies enabled" : "🔇 Voice audio replies muted");
                  }}
                  className="p-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] transition cursor-pointer border border-slate-700/60"
                  title="Toggle Voice Speech Synthesis (TTS)"
                >
                  {maxVoiceEngine.isVoiceEnabled() ? "🔊" : "🔇"}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveWorkspace(null)}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-medium transition cursor-pointer border border-slate-700/60"
                  title="Return to dock"
                >
                  <span>← Dock</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveWorkspace(null)}
                  className="h-6 w-6 flex items-center justify-center rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white text-xs cursor-pointer ml-0.5"
                  title="Close workspace"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Quick Hop Workspace Pill Switchers */}
            <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none text-[10px] font-semibold">
              <button
                type="button"
                onClick={() => setActiveWorkspace("copilot")}
                className={`px-2 py-0.5 rounded-md transition cursor-pointer whitespace-nowrap ${
                  activeWorkspace === "copilot"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-slate-900/80 text-slate-400 hover:text-slate-200"
                }`}
              >
                💬 Copilot
              </button>
              <button
                type="button"
                onClick={() => setActiveWorkspace("find-candidates")}
                className={`px-2 py-0.5 rounded-md transition cursor-pointer whitespace-nowrap ${
                  activeWorkspace === "find-candidates"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-900/80 text-slate-400 hover:text-slate-200"
                }`}
              >
                🔍 Find
              </button>
              <button
                type="button"
                onClick={() => setActiveWorkspace("summarize")}
                className={`px-2 py-0.5 rounded-md transition cursor-pointer whitespace-nowrap ${
                  activeWorkspace === "summarize"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-900/80 text-slate-400 hover:text-slate-200"
                }`}
              >
                📄 Summary
              </button>
              <button
                type="button"
                onClick={() => setActiveWorkspace("draft-email")}
                className={`px-2 py-0.5 rounded-md transition cursor-pointer whitespace-nowrap ${
                  activeWorkspace === "draft-email"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "bg-slate-900/80 text-slate-400 hover:text-slate-200"
                }`}
              >
                ✉️ Email
              </button>
              <button
                type="button"
                onClick={() => setActiveWorkspace("next-steps")}
                className={`px-2 py-0.5 rounded-md transition cursor-pointer whitespace-nowrap ${
                  activeWorkspace === "next-steps"
                    ? "bg-purple-600 text-white shadow-xs"
                    : "bg-slate-900/80 text-slate-400 hover:text-slate-200"
                }`}
              >
                ⚡ Next
              </button>
              <button
                type="button"
                onClick={() => setActiveWorkspace("compare")}
                className={`px-2 py-0.5 rounded-md transition cursor-pointer whitespace-nowrap ${
                  activeWorkspace === "compare"
                    ? "bg-cyan-600 text-white shadow-xs"
                    : "bg-slate-900/80 text-slate-400 hover:text-slate-200"
                }`}
              >
                ⚖️ Compare
              </button>
              <button
                type="button"
                onClick={() => setActiveWorkspace("insights")}
                className={`px-2 py-0.5 rounded-md transition cursor-pointer whitespace-nowrap ${
                  activeWorkspace === "insights"
                    ? "bg-fuchsia-600 text-white shadow-xs"
                    : "bg-slate-900/80 text-slate-400 hover:text-slate-200"
                }`}
              >
                📈 Insights
              </button>
            </div>
          </div>

          {/* Scrollable Mini-Workspace Content */}
          <div className="overflow-y-auto max-h-[calc(88vh-140px)] px-3.5 py-3 space-y-3 scrollbar-thin scrollbar-thumb-slate-700">
            {activeWorkspace === "copilot" && (
              <AiCopilotChatWorkspace
                requisitions={requisitions}
                candidates={candidates}
                activeReq={currentReq}
                onNavigateWorkspace={(ws, meta) => {
                  if (meta?.query) setNlpQuery(meta.query);
                  if (meta?.candidateId) setTargetEmailCandId(meta.candidateId);
                  if (meta?.cand1) setTargetCompare1(meta.cand1);
                  if (meta?.cand2) setTargetCompare2(meta.cand2);
                  if (meta?.reqId) {
                    const r = requisitions.find((item) => item.id === meta.reqId);
                    if (r) setActiveReq(r);
                  }
                  setActiveWorkspace(ws as WorkspaceType);
                }}
                onTriggerToast={triggerToast}
                onRequestConfirmation={(action) => setPendingConfirmation(action)}
                initialQuery={nlpQuery}
              />
            )}

            {activeWorkspace === "find-candidates" && (
              <FindCandidatesWorkspace
                requisitions={requisitions}
                activeReq={currentReq}
                onSelectReq={(req) => {
                  setActiveReq(req);
                  if (onSelectRequisition) onSelectRequisition(req);
                }}
                candidates={candidates}
                onAddToRequisition={handleAddCandidateToRequisition}
                onTriggerToast={triggerToast}
                initialQuery={nlpQuery}
              />
            )}

            {activeWorkspace === "summarize" && (
              <SummarizeWorkspace
                requisitions={requisitions}
                activeReq={currentReq}
                onSelectReq={(req) => {
                  setActiveReq(req);
                  if (onSelectRequisition) onSelectRequisition(req);
                }}
                candidates={candidates}
              />
            )}

            {activeWorkspace === "draft-email" && (
              <DraftEmailWorkspace
                requisitions={requisitions}
                activeReq={currentReq}
                candidates={candidates}
                onRequestSendEmail={handleRequestSendEmail}
                onTriggerToast={triggerToast}
                initialCandidateId={targetEmailCandId}
              />
            )}

            {activeWorkspace === "next-steps" && (
              <NextStepsWorkspace
                requisitions={requisitions}
                activeReq={currentReq}
                onSelectReq={(req) => {
                  setActiveReq(req);
                  if (onSelectRequisition) onSelectRequisition(req);
                }}
                candidates={candidates}
                onRequestConfirmation={(action) => setPendingConfirmation(action)}
                onAdvanceCandidate={handleAdvanceCandidate}
                onTriggerToast={triggerToast}
              />
            )}

            {activeWorkspace === "compare" && (
              <CompareCandidatesWorkspace
                requisitions={requisitions}
                activeReq={currentReq}
                onSelectReq={(req) => {
                  setActiveReq(req);
                  if (onSelectRequisition) onSelectRequisition(req);
                }}
                candidates={candidates}
                onRequestConfirmation={(action) => setPendingConfirmation(action)}
                onAdvanceCandidate={handleAdvanceCandidate}
                onTriggerToast={triggerToast}
                initialCand1Id={targetCompare1}
                initialCand2Id={targetCompare2}
              />
            )}

            {activeWorkspace === "insights" && (
              <InsightsWorkspace
                requisitions={requisitions}
                activeReq={currentReq}
                onSelectReq={(req) => {
                  setActiveReq(req);
                  if (onSelectRequisition) onSelectRequisition(req);
                }}
              />
            )}
          </div>

          {/* Sticky Bottom Controls on Every Workspace */}
          <div className="px-3.5 py-2 bg-gradient-to-t from-[#060a17] to-[#0c1226] border-t border-slate-800 flex items-center justify-between gap-2 shrink-0">
            {/* Command Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleProcessCommand(textInput);
              }}
              className="flex-1 flex items-center bg-[#090e1f] border border-slate-700/80 rounded-xl px-2.5 py-1 text-[11px] shadow-inner focus-within:border-blue-500"
            >
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Ask MAX AI in this workspace (or speak command)..."
                className="flex-1 bg-transparent text-white placeholder-slate-400 focus:outline-hidden text-[11px]"
              />
              <button
                type="submit"
                disabled={!textInput.trim()}
                className="ml-1 text-blue-400 hover:text-blue-300 disabled:opacity-30 cursor-pointer"
                title="Send instruction"
              >
                ↗
              </button>
            </form>

            {/* Bottom Capsule: [ Text | Voice ] */}
            <div className="flex items-center rounded-xl bg-[#090e1f] border border-indigo-900/50 px-1 py-0.5 shadow-xl shrink-0 h-8">
              <button
                type="button"
                onClick={() => setActiveWorkspace("copilot")}
                className={`px-1.5 py-0.5 rounded-lg transition text-[9px] font-medium cursor-pointer ${
                  activeWorkspace === "copilot"
                    ? "bg-blue-600/30 text-blue-300 border border-blue-500/50"
                    : "text-slate-300 hover:text-white"
                }`}
                title="Open Copilot chat"
              >
                Text
              </button>
              <div className="w-[1px] h-3 bg-slate-700/60 mx-0.5" />
              <button
                type="button"
                onClick={() => handleToggleMode("voice")}
                className={`px-1.5 py-0.5 rounded-lg transition text-[9px] font-medium cursor-pointer flex items-center gap-1 ${
                  mode === "voice"
                    ? "bg-purple-600/30 text-purple-300 border border-purple-500/50"
                    : "text-slate-300 hover:text-white"
                }`}
                title="Voice mode"
              >
                {isListening && (
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" />
                )}
                <span>Voice</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =======================================================================
       * 5. THE COMPACT APPROVED FLOATING DOCK (When no workspace is open)
       * ===================================================================== */}
      {activeWorkspace === null && (
        <div className="fixed bottom-4 right-4 sm:bottom-5 sm:right-5 z-40 flex flex-col items-end gap-1.5 select-none">
          {/* If isMenuOpen, show the headline and 6 compact pills */}
          {isMenuOpen && (
            <div className="flex flex-col items-end gap-1.5 animate-in fade-in slide-in-from-bottom-2 duration-150">
              {/* Headline matching mockup */}
              <div className="text-right pr-1 select-none">
                <div className="text-[11px] font-medium tracking-tight text-[#1e1b4b] leading-tight">
                  AI that
                </div>
                <div className="text-[11px] font-medium tracking-tight text-[#1e1b4b] leading-tight">
                  moves hiring
                </div>
                <div className="text-[11px] font-medium tracking-tight text-[#1e1b4b] leading-tight">
                  forward.
                </div>
                <div className="w-8 h-[1.5px] bg-indigo-500/60 mt-1 ml-auto rounded-full" />
              </div>

              {/* The 6 Action Pills */}
              <div className="flex flex-col items-end gap-1">
                {/* 1. Find Candidates */}
                <button
                  type="button"
                  onClick={() => handlePillClick("Find Candidates")}
                  className="flex items-center gap-2 rounded-full bg-[#090e1f] hover:bg-[#141c38] text-white border border-indigo-900/40 shadow-md px-2.5 py-1 transition transform hover:scale-[1.02] cursor-pointer mr-0"
                >
                  <div className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-blue-600/30 text-blue-400">
                    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <span className="text-[11px] font-medium text-white tracking-wide pr-0.5">
                    Find Candidates
                  </span>
                </button>

                {/* 2. Summarize */}
                <button
                  type="button"
                  onClick={() => handlePillClick("Summarize")}
                  className="flex items-center gap-2 rounded-full bg-[#090e1f] hover:bg-[#141c38] text-white border border-indigo-900/40 shadow-md px-2.5 py-1 transition transform hover:scale-[1.02] cursor-pointer mr-2"
                >
                  <div className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-blue-500/30 text-blue-300">
                    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <span className="text-[11px] font-medium text-white tracking-wide pr-0.5">
                    Summarize
                  </span>
                </button>

                {/* 3. Draft Email */}
                <button
                  type="button"
                  onClick={() => handlePillClick("Draft Email")}
                  className="flex items-center gap-2 rounded-full bg-[#090e1f] hover:bg-[#141c38] text-white border border-indigo-900/40 shadow-md px-2.5 py-1 transition transform hover:scale-[1.02] cursor-pointer mr-3.5"
                >
                  <div className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-amber-600/30 text-amber-400">
                    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <span className="text-[11px] font-medium text-white tracking-wide pr-0.5">
                    Draft Email
                  </span>
                </button>

                {/* 4. Next Steps */}
                <button
                  type="button"
                  onClick={() => handlePillClick("Next Steps")}
                  className="flex items-center gap-2 rounded-full bg-[#090e1f] hover:bg-[#141c38] text-white border border-indigo-900/40 shadow-md px-2.5 py-1 transition transform hover:scale-[1.02] cursor-pointer mr-3.5"
                >
                  <div className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-purple-600/30 text-purple-400">
                    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                  </div>
                  <span className="text-[11px] font-medium text-white tracking-wide pr-0.5">
                    Next Steps
                  </span>
                </button>

                {/* 5. Compare */}
                <button
                  type="button"
                  onClick={() => handlePillClick("Compare")}
                  className="flex items-center gap-2 rounded-full bg-[#090e1f] hover:bg-[#141c38] text-white border border-indigo-900/40 shadow-md px-2.5 py-1 transition transform hover:scale-[1.02] cursor-pointer mr-2"
                >
                  <div className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-cyan-600/30 text-cyan-400">
                    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <span className="text-[11px] font-medium text-white tracking-wide pr-0.5">
                    Compare
                  </span>
                </button>

                {/* 6. Insights */}
                <button
                  type="button"
                  onClick={() => handlePillClick("Insights")}
                  className="flex items-center gap-2 rounded-full bg-[#090e1f] hover:bg-[#141c38] text-white border border-indigo-900/40 shadow-md px-2.5 py-1 transition transform hover:scale-[1.02] cursor-pointer mr-0"
                >
                  <div className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-fuchsia-600/30 text-fuchsia-400">
                    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      />
                    </svg>
                  </div>
                  <span className="text-[11px] font-medium text-white tracking-wide pr-0.5">
                    Insights
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Bottom Row: [ Text Popover / Voice Feedback (if active) ] + [ Text | Voice ] Capsule + Glowing Circular MAX AI Button */}
          <div className="flex items-center gap-2">
            {/* Sleek Text Input Bar (Appears horizontally to the left ONLY when user clicks Text) */}
            {isMenuOpen && mode === "text" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleProcessCommand(textInput);
                }}
                className="w-68 sm:w-76 flex items-center rounded-xl bg-[#090e1f] border border-blue-500/60 p-1 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-right-3"
              >
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Ask MAX AI Copilot..."
                  className="flex-1 bg-transparent px-2.5 py-1 text-[11px] text-white placeholder-slate-400 focus:outline-hidden"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!textInput.trim()}
                  className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-40 transition shadow-xs cursor-pointer shrink-0"
                  title="Submit command"
                >
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveWorkspace("copilot");
                    setMode(null);
                  }}
                  className="px-1.5 py-0.5 text-[9px] font-bold text-indigo-300 hover:text-white bg-indigo-900/40 rounded ml-1 cursor-pointer"
                  title="Open Copilot"
                >
                  Chat ↗
                </button>
                <button
                  type="button"
                  onClick={() => setMode(null)}
                  className="p-1 text-slate-400 hover:text-white text-xs ml-0.5 cursor-pointer"
                  title="Close input"
                >
                  ✕
                </button>
              </form>
            )}

            {/* Voice Listening Feedback (Appears horizontally to the left ONLY when user clicks Voice) */}
            {isMenuOpen && mode === "voice" && (
              <div className="flex items-center rounded-xl bg-[#090e1f] border border-purple-500/60 px-2.5 py-1 shadow-2xl backdrop-blur-md animate-in fade-in text-[11px] text-white gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span
                    className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 ${
                      isListening ? "opacity-75" : "opacity-0"
                    }`}
                  />
                  <span
                    className={`relative inline-flex rounded-full h-2 w-2 ${
                      isListening ? "bg-rose-500" : "bg-purple-500"
                    }`}
                  />
                </span>
                <span className="font-medium text-purple-300 text-[10px]">
                  {isListening ? "Listening..." : "Click Voice"}
                </span>
                {speechTranscript && (
                  <span className="text-[9px] text-slate-300 italic truncate max-w-[120px]">
                    &ldquo;{speechTranscript}&rdquo;
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setMode(null)}
                  className="p-0.5 text-slate-400 hover:text-white text-xs cursor-pointer ml-0.5"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Speech Notice if browser does not support */}
            {speechNotice && (
              <div className="w-56 rounded-lg bg-amber-950/90 border border-amber-600/50 p-1.5 text-[9px] text-amber-200">
                {speechNotice}
              </div>
            )}

            {/* THE SIDE-BY-SIDE TEXT & VOICE CAPSULE (Only shown when menu is expanded) */}
            {isMenuOpen && (
              <div className="flex items-center rounded-xl bg-[#090e1f] border border-indigo-900/50 px-1.5 py-0.5 shadow-xl backdrop-blur-md animate-in fade-in h-9">
                {/* 1. Text Option */}
                <button
                  type="button"
                  onClick={() => {
                    if (mode === "text") {
                      setMode(null);
                    } else {
                      setActiveWorkspace("copilot");
                    }
                  }}
                  className={`flex flex-col items-center justify-center px-2 py-0.5 rounded-lg transition cursor-pointer ${
                    activeWorkspace === "copilot" || mode === "text"
                      ? "bg-blue-600/30 text-blue-300 border border-blue-500/50 shadow-inner"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                  }`}
                  title="Text Mode (Open AI Copilot)"
                >
                  <svg className="w-3.5 h-3.5 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                  </svg>
                  <span className="text-[9px] font-medium leading-none mt-0.5">Text</span>
                </button>

                {/* Divider line */}
                <div className="w-[1px] h-4 bg-slate-700/60 mx-0.5" />

                {/* 2. Voice Option */}
                <button
                  type="button"
                  onClick={() => handleToggleMode("voice")}
                  className={`flex flex-col items-center justify-center px-2 py-0.5 rounded-lg transition relative cursor-pointer ${
                    mode === "voice"
                      ? "bg-purple-600/30 text-purple-300 border border-purple-500/50 shadow-inner"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                  }`}
                  title="Voice Mode (Microphone Input)"
                >
                  {isListening && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
                    </span>
                  )}
                  <svg
                    className={`w-3.5 h-3.5 text-purple-400 ${isListening ? "animate-pulse" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                    />
                  </svg>
                  <span className="text-[9px] font-medium leading-none mt-0.5">Voice</span>
                </button>
              </div>
            )}

            {/* GLOWING MAX AI CIRCULAR BUTTON (56px diameter) */}
            <div
              className="relative group cursor-pointer"
              onClick={() => {
                setIsMenuOpen((prev) => !prev);
                setMode(null);
              }}
              title={isMenuOpen ? "Click to collapse menu back to icon" : "Click to expand MAX AI"}
            >
              {/* Luminous Pulsing Halo Ring */}
              <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-cyan-400 via-purple-500 to-fuchsia-500 opacity-90 blur-[4px] group-hover:opacity-100 group-hover:blur-[6px] transition duration-300 animate-pulse" />

              {/* Circular Button Disc */}
              <div className="relative flex flex-col items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-[#230d4a] via-[#14082e] to-[#0a0319] border border-cyan-400/60 shadow-[0_0_15px_rgba(56,189,248,0.45),0_0_25px_rgba(217,70,239,0.35)] text-white transition transform group-hover:scale-105 active:scale-95">
                {/* Sparkle Star Group */}
                <div className="relative">
                  <svg
                    className="w-4 h-4 text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.95)]"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
                  </svg>
                  <svg
                    className="w-1.5 h-1.5 text-cyan-300 absolute -top-0.5 -right-1.5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
                  </svg>
                  <svg
                    className="w-1 h-1 text-fuchsia-300 absolute -bottom-0.5 -left-1"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
                  </svg>
                </div>
                {/* Title */}
                <span className="text-[9px] font-extrabold tracking-wider mt-0.5 text-white leading-none">
                  MAX AI
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
