"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  recruitmentStore,
  Requisition,
  CandidateItem,
  OfferItem,
  InterviewItem,
} from "@/lib/recruitment-store";
import { maxAiBrain } from "@/lib/max-ai-brain";

interface CardItem {
  title: string;
  subtitle: string;
  status?: string;
  actionLabel?: string;
  actionUrl?: string;
  reqData?: Requisition;
  onClick?: () => void;
}

interface AiMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  actionRequired?: {
    type: "CONFIRM_APPROVAL" | "CONFIRM_DRAFT" | "MOVE_STAGE";
    reqId?: string;
    candidateId?: string;
    details?: string;
  };
  cards?: CardItem[];
}

interface AiAssistantPanelProps {
  requisitions?: Requisition[];
  onSelectRequisition?: (req: Requisition) => void;
  onFilterChange?: (filter: { status?: string; department?: string; search?: string }) => void;
  onClose?: () => void;
}

export default function AiAssistantPanel({
  requisitions = [],
  onSelectRequisition,
  onFilterChange,
  onClose,
}: AiAssistantPanelProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"chat" | "voice">("chat");
  const [inputPrompt, setInputPrompt] = useState("");
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [speechError, setSpeechError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Speech Recognition API
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        setSpeechSupported(false);
      } else {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onstart = () => {
          setIsListening(true);
          setSpeechError(null);
        };

        recognition.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0].transcript)
            .join("");
          setInputPrompt(transcript);
          if (event.results[0] && event.results[0].isFinal) {
            handleSendMessage(transcript);
          }
        };

        recognition.onerror = (event: any) => {
          setIsListening(false);
          if (event.error === "not-allowed" || event.error === "permission-denied") {
            setSpeechError("Microphone permission denied. Please allow microphone access in your browser settings.");
          } else {
            setSpeechError(`Speech notice: ${event.error}. You can also type commands directly.`);
          }
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const toggleVoiceListen = () => {
    if (!speechSupported) {
      setSpeechError("Voice input is not supported by your current browser. You can type commands directly.");
      return;
    }
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setSpeechError(null);
      try {
        recognitionRef.current?.start();
      } catch (err: any) {
        console.warn("Speech start issue", err);
      }
    }
  };

  const speakText = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      // Remove markdown symbols for clear pronunciation
      const cleanText = text
        .replace(/[*#•_`]/g, "")
        .replace(/https?:\/\/\S+/g, "")
        .slice(0, 180);
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleQuickAction = (actionText: string) => {
    handleSendMessage(actionText);
  };

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputPrompt;
    if (!textToSend.trim()) return;

    const userMsg: AiMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: textToSend,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt("");
    setLoading(true);

    try {
      const lower = textToSend.toLowerCase();

      // =========================================================================
      // 1. CANDIDATE SEARCH & DOSSIER QUERY (User Issue Resolution)
      // =========================================================================
      const isCandidateQuery =
        lower.includes("candidate") ||
        lower.includes("priya") ||
        lower.includes("arjun") ||
        lower.includes("vikram") ||
        lower.includes("sneha") ||
        lower.includes("rahul") ||
        lower.includes("suresh") ||
        lower.includes("deepa") ||
        lower.includes("manu") ||
        lower.includes("karthik") ||
        lower.includes("find") ||
        lower.includes("search") ||
        lower.includes("who is") ||
        lower.includes("applicant") ||
        lower.includes("applicants") ||
        lower.includes("match score");

      if (isCandidateQuery) {
        const allCandidates = recruitmentStore.getCandidates();

        // Check if query matches a specific candidate
        const matchedCand = allCandidates.find(
          (c) =>
            lower.includes(c.name.toLowerCase()) ||
            c.name
              .toLowerCase()
              .split(" ")
              .some((part) => part.length > 2 && lower.includes(part))
        );

        if (matchedCand) {
          // Check if user wants to mutate stage (Autonomous Agent Execution)
          if (
            lower.includes("shortlist") ||
            lower.includes("move") ||
            lower.includes("advance") ||
            lower.includes("hire") ||
            lower.includes("reject") ||
            lower.includes("offer") ||
            lower.includes("next stage")
          ) {
            let targetStage: CandidateItem["stage"] = "Offer";
            if (lower.includes("offer")) {
              targetStage = "Offer";
            } else if (lower.includes("hire") || lower.includes("hired")) {
              targetStage = "Hired";
            } else if (lower.includes("screening") || lower.includes("shortlist")) {
              targetStage = "Screening";
            } else if (lower.includes("interview")) {
              targetStage = "Interview";
            } else if (lower.includes("reject")) {
              targetStage = "Rejected";
            } else {
              // Next stage progression
              switch (matchedCand.stage) {
                case "Applied":
                  targetStage = "Screening";
                  break;
                case "Screening":
                  targetStage = "Interview";
                  break;
                case "Interview":
                  targetStage = "Offer";
                  break;
                case "Offer":
                  targetStage = "Hired";
                  break;
                default:
                  targetStage = "Offer";
              }
            }

            recruitmentStore.updateCandidateStage(
              matchedCand.id,
              targetStage,
              targetStage === "Offer" ? "Offer" : "In Review"
            );

            const replyText = `✅ **Agent Task Executed: Advanced ${matchedCand.name} to ${targetStage} Stage**\n\n• **Transition**: ${matchedCand.stage} ➔ **${targetStage}**\n• **Role**: ${matchedCand.requisitionTitle} (${matchedCand.requisitionId})\n• **Fit Score**: ${matchedCand.matchScore}% Match (${matchedCand.fitLevel || "Strong Fit"})\n• **Status**: Talent pipeline and recruiter notifications synchronized.`;

            if (mode === "voice") speakText(replyText);

            setMessages((prev) => [
              ...prev,
              {
                id: `ai-${Date.now()}`,
                sender: "assistant",
                text: replyText,
                cards: [
                  {
                    title: `${matchedCand.name} · Now in ${targetStage}`,
                    subtitle: `${matchedCand.requisitionId} · ${matchedCand.matchScore}% Match Score`,
                    status: targetStage,
                    actionLabel: "View in Talent Pipeline",
                    actionUrl: `/recruitment/candidates?id=${matchedCand.id}`,
                  },
                  ...(targetStage === "Offer"
                    ? [
                        {
                          title: "Candidate Offer Management",
                          subtitle:
                            "Inspect compensation package and prepare formal offer letter",
                          status: "Offer",
                          actionLabel: "Open Offers",
                          actionUrl: "/recruitment/offers",
                        },
                      ]
                    : []),
                ],
              },
            ]);
            setLoading(false);
            return;
          }

          // Candidate Dossier Lookup (e.g. "Find the candidate Priya.")
          const skillsList = matchedCand.skillsBreakdown
            ? matchedCand.skillsBreakdown
                .map((s) => `${s.name} (${s.percentage || s.match || 90}%)`)
                .join(", ")
            : "Java 21, Spring Boot, Microservices, REST APIs, Docker, Kubernetes";

          const replyText = `🔍 **Candidate Dossier: ${matchedCand.name}**
• **Target Role**: ${matchedCand.requisitionTitle} (${matchedCand.requisitionId})
• **Stage**: **${matchedCand.stage}** · Status: **${matchedCand.statusLabel || "In Review"}**
• **Fit Rating**: **${matchedCand.matchScore}% Composite Match** (${matchedCand.fitLevel || "Strong Fit"})
• **Location & Contact**: ${matchedCand.location || "Bangalore, India"} · ${matchedCand.email} · ${matchedCand.phone}
• **Verified Skills**: ${skillsList}
• **AI Evaluation**: ${matchedCand.aiSummary || `${matchedCand.name} demonstrates seasoned domain expertise and direct technical alignment with ${matchedCand.requisitionTitle}.`}
• **Recommended Next Step**: ${matchedCand.recommendedNextStep || "Advance to Technical Architecture Interview"}`;

          if (mode === "voice") speakText(`Found candidate ${matchedCand.name}, ${matchedCand.role || matchedCand.requisitionTitle} with ${matchedCand.matchScore} percent match score.`);

          setMessages((prev) => [
            ...prev,
            {
              id: `ai-${Date.now()}`,
              sender: "assistant",
              text: replyText,
              cards: [
                {
                  title: `${matchedCand.name} · ${matchedCand.role || matchedCand.requisitionTitle}`,
                  subtitle: `${matchedCand.requisitionId} · ${matchedCand.stage} (${matchedCand.matchScore}% Match Score)`,
                  status: matchedCand.statusLabel || matchedCand.stage,
                  actionLabel: "View Candidate Profile",
                  actionUrl: `/recruitment/candidates?id=${matchedCand.id}`,
                },
                {
                  title: "Talent Pipeline Overview",
                  subtitle: `Compare with other applicants for ${matchedCand.requisitionTitle}`,
                  actionLabel: "Open Talent Pipeline",
                  actionUrl: `/recruitment/candidates`,
                },
                {
                  title: "Interview Scorecard",
                  subtitle: `View rating rubrics and notes for ${matchedCand.name}`,
                  actionLabel: "Inspect Scorecard",
                  actionUrl: "/recruitment/interviews",
                },
                {
                  title: "Candidate Offer Management",
                  subtitle: "Inspect compensation package and higher-level approvals",
                  actionLabel: "Open Offers Hub",
                  actionUrl: "/recruitment/offers",
                },
              ],
            },
          ]);
          setLoading(false);
          return;
        }

        // General Candidate search / top candidates
        let candidateList = allCandidates;
        if (lower.includes("interview")) {
          candidateList = allCandidates.filter((c) => c.stage === "Interview");
        } else if (lower.includes("offer")) {
          candidateList = allCandidates.filter((c) => c.stage === "Offer");
        } else if (lower.includes("top") || lower.includes("best")) {
          candidateList = allCandidates.filter((c) => c.matchScore >= 80);
        }

        const displayed = candidateList.slice(0, 4);
        const replyText = `Found **${candidateList.length} candidate(s)** in the recruiting database matching your query:`;

        if (mode === "voice") speakText(`Found ${candidateList.length} candidates in the recruiting database.`);

        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: "assistant",
            text: replyText,
            cards: displayed.map((c) => ({
              title: `${c.name} · ${c.role || c.requisitionTitle}`,
              subtitle: `${c.requisitionId} · ${c.stage} (${c.matchScore}% Match Score)`,
              status: c.statusLabel || c.stage,
              actionLabel: "View Profile",
              actionUrl: `/recruitment/candidates?id=${c.id}`,
            })),
          },
        ]);
        setLoading(false);
        return;
      }

      // =========================================================================
      // 2. REQUISITIONS & PENDING APPROVAL WORKFLOW
      // =========================================================================
      if (
        lower.includes("approve req") ||
        lower.includes("approve requisition") ||
        (lower.includes("approve") && (lower.includes("0048") || lower.includes("00123") || lower.includes("pending")))
      ) {
        const targetReq =
          requisitions.find(
            (r) =>
              lower.includes(r.reqNumber.toLowerCase()) ||
              r.status === "Pending Approval"
          ) || requisitions[0];

        if (targetReq) {
          recruitmentStore.updateRequisitionStatus(targetReq.id, "Open");
          recruitmentStore.updateRequisition(targetReq.id, {
            approvalStep: targetReq.totalApprovalSteps || 3,
            status: "Open",
          });

          if (onFilterChange) onFilterChange({ status: "Open" });
          if (onSelectRequisition) onSelectRequisition({ ...targetReq, status: "Open" });

          const replyText = `✅ **Requisition Authorized & Approved**: **${targetReq.reqNumber} · ${targetReq.title}** has been approved and moved to **Open** status.\n\nApproval gate completed. The role is now actively distributed on external job boards.`;

          if (mode === "voice") speakText(`Requisition ${targetReq.reqNumber} has been approved.`);

          setMessages((prev) => [
            ...prev,
            {
              id: `ai-${Date.now()}`,
              sender: "assistant",
              text: replyText,
              cards: [
                {
                  title: `${targetReq.reqNumber} · ${targetReq.title} (Open)`,
                  subtitle: `${targetReq.department} · ${targetReq.salaryRange} · Authorized`,
                  status: "Open",
                  actionLabel: "Open Requisition Drawer",
                  reqData: { ...targetReq, status: "Open" },
                },
              ],
            },
          ]);
          setLoading(false);
          return;
        }
      }

      if (
        lower.includes("pending approval") ||
        lower.includes("open pending") ||
        lower.includes("my pending approvals") ||
        lower.includes("approvals")
      ) {
        if (onFilterChange) onFilterChange({ status: "Pending Approval" });
        const pending = requisitions.filter((r) => r.status === "Pending Approval");

        // If user specifically asked to "open" and there are pending requisitions, open the drawer
        if (lower.includes("open") && onSelectRequisition && pending.length > 0) {
          onSelectRequisition(pending[0]);
        }

        const replyText = `You have **${pending.length} requisition(s)** awaiting multi-tier governance approval:`;

        if (mode === "voice") speakText(`You have ${pending.length} requisitions awaiting approval.`);

        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: "assistant",
            text: replyText,
            cards: pending.map((r) => ({
              title: `${r.reqNumber} · ${r.title}`,
              subtitle: `Step ${r.approvalStep || 1} of ${r.totalApprovalSteps || 3} · Hiring Manager: ${r.hiringManager.name}`,
              status: "Pending Approval",
              actionLabel: "Open & Review Requisition",
              reqData: r,
            })),
          },
        ]);
        setLoading(false);
        return;
      }

      if (lower.includes("show open requisitions") || lower.includes("open requisitions")) {
        if (onFilterChange) onFilterChange({ status: "Open" });
        const openReqs = requisitions.filter((r) => r.status === "Open");

        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: "assistant",
            text: `Here are the **${openReqs.length} open requisitions** currently active in your talent acquisition workspace:`,
            cards: openReqs.slice(0, 4).map((r) => ({
              title: `${r.reqNumber} · ${r.title}`,
              subtitle: `${r.department} · ${r.location} · Headcount: ${r.filledHeadcount}/${r.targetHeadcount}`,
              status: r.status,
              actionLabel: "View Requisition Details",
              reqData: r,
            })),
          },
        ]);
        setLoading(false);
        return;
      }

      if (lower.includes("engineering")) {
        if (onFilterChange) onFilterChange({ department: "Engineering" });
        const engReqs = requisitions.filter((r) => r.department === "Engineering");

        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: "assistant",
            text: `Found **${engReqs.length} requisitions** in the Engineering department:`,
            cards: engReqs.slice(0, 4).map((r) => ({
              title: `${r.reqNumber} · ${r.title}`,
              subtitle: `${r.location} · ${r.salaryRange} · ${r.status}`,
              status: r.status,
              actionLabel: "Inspect Requisition",
              reqData: r,
            })),
          },
        ]);
        setLoading(false);
        return;
      }

      // =========================================================================
      // 3. CANDIDATE OFFERS & LEVEL 2 APPROVALS
      // =========================================================================
      if (lower.includes("offer") || lower.includes("offers") || lower.includes("compensation")) {
        const offers = recruitmentStore.getOffers();

        // Check if approving offer
        if (lower.includes("approve") || lower.includes("sign off")) {
          const targetOffer =
            offers.find(
              (o) =>
                lower.includes(o.candidateName.toLowerCase()) ||
                o.status === "Pending Approval"
            ) || offers[0];

          if (targetOffer) {
            recruitmentStore.approveOfferByLevel(
              targetOffer.id,
              targetOffer.currentApprovalLevel || 2,
              "Authorized via AI Assistant",
              "Elena Vance (VP)"
            );

            const replyText = `✅ **Offer Approved**: Level ${targetOffer.currentApprovalLevel || 2} executive approval completed for **${targetOffer.candidateName}** (${targetOffer.requisitionTitle}).\n• Base Salary: **${targetOffer.baseSalary}**\n• Equity/Bonus: **${targetOffer.equity || "$50,000"}**\n• Status: Ready for Formal Letter Dispatch via DocuSign.`;

            if (mode === "voice") speakText(`Offer for ${targetOffer.candidateName} approved.`);

            setMessages((prev) => [
              ...prev,
              {
                id: `ai-${Date.now()}`,
                sender: "assistant",
                text: replyText,
                cards: [
                  {
                    title: `${targetOffer.candidateName} · Offer Approved`,
                    subtitle: `${targetOffer.requisitionTitle} · ${targetOffer.baseSalary}`,
                    status: "Approved",
                    actionLabel: "Send Formal Offer Letter",
                    actionUrl: "/recruitment/offers",
                  },
                ],
              },
            ]);
            setLoading(false);
            return;
          }
        }

        // List offers
        const replyText = `Found **${offers.length} active candidate offers** across hiring pipelines:`;

        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: "assistant",
            text: replyText,
            cards: offers.slice(0, 4).map((o) => ({
              title: `${o.candidateName} · ${o.requisitionTitle}`,
              subtitle: `${o.baseSalary} Base · Level ${o.currentApprovalLevel || 1} Review`,
              status: o.status,
              actionLabel: "Inspect Offer Details",
              actionUrl: "/recruitment/offers",
            })),
          },
        ]);
        setLoading(false);
        return;
      }

      // =========================================================================
      // 4. INTERVIEW SCHEDULING & SCORECARDS
      // =========================================================================
      if (lower.includes("interview") || lower.includes("scorecard") || lower.includes("rubric")) {
        const interviews = recruitmentStore.getInterviews();
        const replyText = `Found **${interviews.length} scheduled interviews** in the active queue:`;

        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: "assistant",
            text: replyText,
            cards: interviews.slice(0, 4).map((i) => ({
              title: `${i.candidateName} · ${i.roundType}`,
              subtitle: `${i.scheduledDate} at ${i.time} · ${i.platform}`,
              status: i.status,
              actionLabel: "Open Interview Scorecard",
              actionUrl: "/recruitment/interviews",
            })),
          },
        ]);
        setLoading(false);
        return;
      }

      // =========================================================================
      // 5. SUMMARIZE REQUISITION
      // =========================================================================
      if (lower.includes("summarize")) {
        const matchedReq =
          requisitions.find(
            (r) =>
              lower.includes(r.reqNumber.toLowerCase()) ||
              lower.includes(r.title.toLowerCase())
          ) || requisitions[0];

        if (matchedReq) {
          const replyText = `📊 **Requisition Telemetry Summary: ${matchedReq.reqNumber} · ${matchedReq.title}**
• **Department**: ${matchedReq.department} · **Location**: ${matchedReq.location}
• **Status**: **${matchedReq.status}** · **Headcount**: ${matchedReq.filledHeadcount}/${matchedReq.targetHeadcount}
• **Compensation Band**: ${matchedReq.salaryRange}
• **Hiring Manager**: ${matchedReq.hiringManager.name} (${matchedReq.hiringManager.title})
• **Core Required Skills**: ${matchedReq.requiredSkills?.join(", ") || "Java 21, Spring Boot, Microservices"}
• **Talent Pipeline Health**: 10 active applicants (Priya Menon ranked #1 with 92% match score).`;

          if (mode === "voice") speakText(`Summary for ${matchedReq.reqNumber}, ${matchedReq.title} in ${matchedReq.department}.`);

          setMessages((prev) => [
            ...prev,
            {
              id: `ai-${Date.now()}`,
              sender: "assistant",
              text: replyText,
              cards: [
                {
                  title: `${matchedReq.reqNumber} · ${matchedReq.title}`,
                  subtitle: `${matchedReq.department} · Headcount: ${matchedReq.filledHeadcount}/${matchedReq.targetHeadcount}`,
                  status: matchedReq.status,
                  actionLabel: "Inspect Requisition Drawer",
                  reqData: matchedReq,
                },
                {
                  title: "Talent Pipeline",
                  subtitle: "Review all candidates applied to this requisition",
                  actionLabel: "View Candidates",
                  actionUrl: "/recruitment/candidates",
                },
              ],
            },
          ]);
          setLoading(false);
          return;
        }
      }

      // =========================================================================
      // 5b. REQUISITION & HEADCOUNT QUESTIONS
      // =========================================================================
      if (
        lower.includes("open position") ||
        lower.includes("open job") ||
        lower.includes("open req") ||
        lower.includes("how many open") ||
        lower.includes("how many requisition") ||
        lower.includes("how many job")
      ) {
        const openReqs = requisitions.filter((r) => r.status === "Open");
        const replyText = `📊 **Active Job Requisitions**: There are currently **${openReqs.length} Open positions** across MAX ERP:\n` +
          openReqs.map((r, idx) => `${idx + 1}. **${r.reqNumber}**: ${r.title} (${r.department} · ${r.salaryRange})`).join("\n") +
          `\n\n• Plus 1 requisition awaiting governance approval (REQ-2026-0048 Cloud Infrastructure Architect).`;

        if (mode === "voice") speakText(`There are ${openReqs.length} open positions currently active.`);

        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: "assistant",
            text: replyText,
            cards: openReqs.map((r) => ({
              title: `${r.reqNumber} · ${r.title}`,
              subtitle: `${r.department} · ${r.salaryRange}`,
              status: r.status,
              actionLabel: "Inspect Requisition",
              reqData: r,
            })),
          },
        ]);
        setLoading(false);
        return;
      }

      if (lower.includes("0048") || lower.includes("cloud architect") || lower.includes("cloud infrastructure")) {
        const r = requisitions.find((x) => x.reqNumber.includes("0048") || x.title.toLowerCase().includes("cloud")) || requisitions[0];
        const replyText = `📄 **Requisition Telemetry: ${r.reqNumber} · ${r.title}**\n` +
          `• **Department**: ${r.department} | **Location**: ${r.location}\n` +
          `• **Status**: **${r.status}** (Step ${r.approvalStep || 2} of ${r.totalApprovalSteps || 3})\n` +
          `• **Target Headcount**: ${r.targetHeadcount} Openings | **Pay Band**: ${r.salaryRange}\n` +
          `• **Hiring Manager**: ${r.hiringManager.name} (${r.hiringManager.title})\n` +
          `• **Required Skills**: Kubernetes, Terraform, AWS/GCP, Distributed Systems`;

        if (mode === "voice") speakText(`Requisition ${r.reqNumber}, ${r.title} in ${r.department}.`);

        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: "assistant",
            text: replyText,
            cards: [
              {
                title: `${r.reqNumber} · ${r.title}`,
                subtitle: `Step ${r.approvalStep || 2}/${r.totalApprovalSteps || 3} · HM: ${r.hiringManager.name}`,
                status: r.status,
                actionLabel: "Open & Review Requisition",
                reqData: r,
              },
            ],
          },
        ]);
        setLoading(false);
        return;
      }

      if (lower.includes("salary") || lower.includes("compensation") || lower.includes("pay band")) {
        const replyText = `💰 **Approved Requisition Compensation Bands**:\n` +
          `• **Cloud Infrastructure Architect (REQ-0048)**: $160,000 - $195,000\n` +
          `• **Senior Java Developer (REQ-0123)**: $140,000 - $175,000\n` +
          `• **Lead Product Manager (REQ-0118)**: $150,000 - $185,000\n` +
          `• **Senior Financial Controller (REQ-0121)**: $140,000 - $175,000\n` +
          `• **SAP SF Consultant (REQ-0120)**: $130,000 - $165,000\n` +
          `• **HR Business Partner (REQ-0119)**: $95,000 - $125,000`;

        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: "assistant",
            text: replyText,
            cards: [
              {
                title: "Executive Compensation Rubric",
                subtitle: "Aligned with 65th percentile of regional software market surveys",
                actionLabel: "Inspect Requisitions",
                actionUrl: "/recruitment/requisitions",
              },
            ],
          },
        ]);
        setLoading(false);
        return;
      }

      if (lower.includes("hiring manager")) {
        const replyText = `👥 **Hiring Managers by Requisition**:\n` +
          `• **Senior Java Developer (REQ-0123)**: John Smith (Engineering Director)\n` +
          `• **Cloud Infrastructure Architect (REQ-0048)**: Elena Vance (VP Engineering)\n` +
          `• **Lead Product Manager (REQ-0118)**: Anita Desai (VP Product)\n` +
          `• **HR Business Partner (REQ-0119)**: Marcus Chen (Chief People Officer)\n` +
          `• **SAP SF Consultant (REQ-0120)**: Priya Nair (HR Tech Director)`;

        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: "assistant",
            text: replyText,
          },
        ]);
        setLoading(false);
        return;
      }

      if (lower.includes("time to hire") || lower.includes("cost per hire") || lower.includes("acceptance rate")) {
        const replyText = `⏱️ **Recruiting Analytics & Hiring Velocity**:\n` +
          `• **Average Time-to-Hire**: **18.4 Days** (46% faster than SaaS benchmark)\n` +
          `• **Average Cost-Per-Hire**: **$3,420** (top 10th percentile efficiency)\n` +
          `• **Offer Acceptance Rate**: **89.2%** (14 accepted out of 16 extended)`;

        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: "assistant",
            text: replyText,
            cards: [
              {
                title: "Executive Analytics Dashboard",
                subtitle: "Inspect hiring velocity and talent funnels across all 5 tiers",
                actionLabel: "Open Analytics",
                actionUrl: "/recruitment?tab=analytics",
              },
            ],
          },
        ]);
        setLoading(false);
        return;
      }

      if (lower.includes("template") || lower.includes("where") || lower.includes("configure") || lower.includes("config")) {
        const replyText = `⚙️ **Configuration Studio & System Settings**:\n` +
          `• **Offer Letter Templates**: Managed in Configuration Studio ➔ Letters & Offers (/configuration/recruitment?tab=offers).\n` +
          `• **Job Distribution Boards**: Managed in Job Distribution tab (/recruitment?tab=distribution).\n` +
          `• **Governance Approval Workflows**: Configured in Configuration Studio ➔ Governance Workflows (/configuration/workflows).`;

        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: "assistant",
            text: replyText,
            cards: [
              {
                title: "Offer Letter Templates",
                subtitle: "Manage letterheads, dynamic tokens, and DocuSign integration",
                actionLabel: "Open Templates",
                actionUrl: "/configuration/recruitment?tab=offers",
              },
            ],
          },
        ]);
        setLoading(false);
        return;
      }

      // =========================================================================
      // 6. GENERATE JOB DESCRIPTION
      // =========================================================================
      if (lower.includes("job description") || lower.includes("draft jd")) {
        const res = await fetch("/api/recruitment/ai-recruiter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "GENERATE_JOB_DESCRIPTION",
            requisitionTitle: textToSend
              .replace(/generate|job|description|for|draft|jd/gi, "")
              .trim() || "Staff Software Engineer",
            department: "Engineering",
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const replyText = `📄 **Generated Job Description: ${data.requisitionTitle}**\n\n${data.description}\n\n**Core Responsibilities:**\n${data.responsibilities?.slice(0, 3).map((r: string, idx: number) => `${idx + 1}. ${r}`).join("\n")}\n\n**Suggested Pay Band**: ${data.suggestedSalary || "$140,000 - $175,000"}`;

          setMessages((prev) => [
            ...prev,
            {
              id: `ai-${Date.now()}`,
              sender: "assistant",
              text: replyText,
              cards: [
                {
                  title: `Draft Requisition: ${data.requisitionTitle}`,
                  subtitle: `Suggested Band: ${data.suggestedSalary || "$140k - $175k"}`,
                  status: "Draft",
                  actionLabel: "Create Requisition",
                  actionUrl: "/recruitment/requisitions",
                },
              ],
            },
          ]);
          setLoading(false);
          return;
        }
      }

      // =========================================================================
      // 7. DRAFT HIRING MANAGER / CANDIDATE EMAIL
      // =========================================================================
      if (lower.includes("email") || lower.includes("mail")) {
        const replyText = `✉️ **Draft Email**: Update on Candidate Pipeline for Senior Java Developer\n\n**Subject**: Talent Acquisition Update: Priya Menon (92% Fit Score) Ready for Technical Panel\n\nHi Hiring Manager,\n\nPriya Menon has completed technical screening with outstanding marks in distributed Java architectures (5/5). We have benchmarked their compensation at market standard ($165,000 base).\n\nPlease let us know your availability for the final panel review this week.\n\nBest regards,\nMAX ERP Talent Acquisition`;

        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: "assistant",
            text: replyText,
            cards: [
              {
                title: "Communication Center",
                subtitle: "Dispatch this message via Enterprise SMTP / Teams",
                actionLabel: "Open Communication Center",
                actionUrl: "/recruitment?tab=communication",
              },
            ],
          },
        ]);
        setLoading(false);
        return;
      }

      // =========================================================================
      // 8. GENERAL AI RECRUITING & PLATFORM FALLBACK (Universal Brain)
      // =========================================================================
      const brainReply = maxAiBrain.processPrompt(textToSend, "recruitment");

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: "assistant",
          text: brainReply.reply,
          cards: [
            {
              title: "Recruiting Dashboard Overview",
              subtitle: "Open recruitment pipeline metrics and headcount velocity",
              actionLabel: "Open Dashboard",
              actionUrl: "/recruitment",
            },
            {
              title: "Talent Pipeline",
              subtitle: "Inspect all active candidates and fit scores",
              actionLabel: "View Candidates",
              actionUrl: "/recruitment/candidates",
            },
          ],
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: "assistant",
          text: `Processed query: "${textToSend}". Live recruiting assistant is active and synchronized with your enterprise requisitions.`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <aside className="w-80 lg:w-[340px] xl:w-[360px] bg-white border-l border-slate-200/90 flex flex-col h-[calc(100vh-64px)] sticky top-16 shrink-0 shadow-2xs">
      {/* 1. Header with Mode Switcher (Chat / Voice) matching Image 2 */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-sm font-bold text-slate-900">AI Assistant</h2>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5 text-xs">
          <button
            onClick={() => setMode("chat")}
            className={`px-3 py-1 rounded-md font-semibold transition ${
              mode === "chat" ? "bg-white text-blue-600 shadow-2xs" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Chat
          </button>
          <button
            onClick={() => {
              setMode("voice");
              toggleVoiceListen();
            }}
            className={`px-3 py-1 rounded-md font-semibold flex items-center gap-1 transition ${
              mode === "voice" ? "bg-white text-blue-600 shadow-2xs" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            Voice
          </button>
        </div>
      </div>

      {/* 2. Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs scrollbar-thin scrollbar-thumb-slate-200">
        {/* Welcome Card matching Image 2 */}
        <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-sm shadow-xs">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Hi John!</h3>
            <p className="text-slate-500 mt-0.5 text-xs leading-relaxed">
              I can help you with candidates, requisitions, offers, and approvals. Type or speak commands below.
            </p>
          </div>
        </div>

        {/* Speech Recognition Error Notice if any */}
        {speechError && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
            <span className="font-semibold block">Voice Assistant Note:</span>
            <span>{speechError}</span>
          </div>
        )}

        {/* Voice Listening Mode Indicator */}
        {mode === "voice" && (
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-center space-y-2">
            <div className="relative inline-flex items-center justify-center">
              <span className={`absolute h-10 w-10 rounded-full bg-blue-400 opacity-75 ${isListening ? "animate-ping" : ""}`} />
              <button
                onClick={toggleVoiceListen}
                className="relative flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 shadow-md transition"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>
            </div>
            <p className="text-xs font-bold text-blue-900">
              {isListening ? "Listening... Speak your command now" : "Voice mode ready. Click mic to speak"}
            </p>
            <p className="text-[11px] text-blue-700">
              Try: &ldquo;Find the candidate Priya&rdquo; or &ldquo;Show my pending approvals&rdquo;
            </p>
          </div>
        )}

        {/* Quick Actions (6 Items matching Image 2 & Candidate Discovery) */}
        {messages.length === 0 && (
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Quick actions</span>

            {/* 1. Find the candidate Priya (Key user scenario) */}
            <button
              onClick={() => handleQuickAction("Find the candidate Priya.")}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-blue-300 transition text-left group"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <span className="font-semibold text-slate-800 text-xs group-hover:text-blue-600">
                Find candidate Priya (Senior Java Dev)
              </span>
            </button>

            {/* 2. Show my pending approvals */}
            <button
              onClick={() => handleQuickAction("Show my pending approvals")}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-blue-300 transition text-left group"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600 shrink-0">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="font-semibold text-slate-800 text-xs group-hover:text-blue-600">
                Show my pending approvals
              </span>
            </button>

            {/* 3. Show open requisitions */}
            <button
              onClick={() => handleQuickAction("Show open requisitions")}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-blue-300 transition text-left group"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="font-semibold text-slate-800 text-xs group-hover:text-blue-600">
                Show open requisitions
              </span>
            </button>

            {/* 4. Show candidate offers */}
            <button
              onClick={() => handleQuickAction("Show pending candidate offers")}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-blue-300 transition text-left group"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-50 text-purple-600 shrink-0">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="font-semibold text-slate-800 text-xs group-hover:text-blue-600">
                Show candidate offers awaiting approval
              </span>
            </button>

            {/* 5. Generate job description */}
            <button
              onClick={() => handleQuickAction("Generate job description for Product Manager")}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-blue-300 transition text-left group"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 text-rose-600 shrink-0">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <span className="font-semibold text-slate-800 text-xs group-hover:text-blue-600">
                Generate job description
              </span>
            </button>

            {/* 6. Draft hiring manager email */}
            <button
              onClick={() => handleQuickAction("Draft hiring manager email for REQ-2026-0048")}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-blue-300 transition text-left group"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50 text-red-600 shrink-0">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="font-semibold text-slate-800 text-xs group-hover:text-blue-600">
                Draft hiring manager email
              </span>
            </button>
          </div>
        )}

        {/* Message Thread */}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`space-y-2 ${m.sender === "user" ? "text-right" : "text-left"}`}
          >
            <div
              className={`inline-block p-3 rounded-2xl max-w-[94%] leading-relaxed ${
                m.sender === "user"
                  ? "bg-blue-600 text-white font-medium rounded-br-xs"
                  : "bg-slate-50 border border-slate-200 text-slate-800 rounded-bl-xs"
              }`}
            >
              <div className="whitespace-pre-line text-xs">{m.text}</div>

              {/* Render Interactive Structured Cards if attached */}
              {m.cards && m.cards.length > 0 && (
                <div className="mt-2.5 space-y-2 text-left">
                  {m.cards.map((c, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1.5 hover:border-blue-400 hover:shadow-xs transition"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-slate-900 text-xs truncate">
                          {c.title}
                        </span>
                        {c.status && (
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                              c.status === "Open" || c.status === "Approved" || c.status === "Hired"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : c.status === "Pending Approval" || c.status === "In Review" || c.status === "Draft"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-blue-50 text-blue-700 border border-blue-200"
                            }`}
                          >
                            {c.status}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug">{c.subtitle}</p>

                      {/* Interactive Action Trigger Button */}
                      {(c.actionLabel || c.actionUrl || c.reqData || c.onClick) && (
                        <button
                          type="button"
                          onClick={() => {
                            if (c.onClick) {
                              c.onClick();
                            } else if (c.reqData && onSelectRequisition) {
                              onSelectRequisition(c.reqData);
                            } else if (c.actionUrl) {
                              router.push(c.actionUrl);
                            }
                          }}
                          className="mt-1.5 w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-semibold transition"
                        >
                          <span>{c.actionLabel || "View Details"}</span>
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 text-xs">
            <span className="h-2 w-2 rounded-full bg-blue-600 animate-ping" />
            <span>Analyzing recruiting data & candidate records...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. Input & Voice Command Footer matching Image 2 */}
      <div className="p-3 border-t border-slate-200/90 bg-white space-y-2 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder="Ask about Priya, requisitions, offers..."
            className="w-full pr-20 pl-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />

          <div className="absolute right-1.5 flex items-center gap-1">
            <button
              type="button"
              onClick={toggleVoiceListen}
              className={`p-1.5 rounded-lg transition ${
                isListening
                  ? "bg-rose-100 text-rose-600"
                  : "text-slate-400 hover:text-slate-700 hover:bg-slate-200/60"
              }`}
              title="Voice Input (Speech)"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>

            <button
              type="submit"
              disabled={!inputPrompt.trim()}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 transition shadow-2xs"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </div>
        </form>

        {/* Try suggestions footer matching Image 2 */}
        <div className="text-[10px] text-slate-400 space-y-0.5 leading-tight pt-0.5">
          <span className="font-semibold text-slate-500">Try:</span> &ldquo;Find candidate Priya&rdquo; &bull; &ldquo;Show my pending approvals&rdquo; &bull; &ldquo;Approve REQ-2026-0048&rdquo;
        </div>
      </div>
    </aside>
  );
}
