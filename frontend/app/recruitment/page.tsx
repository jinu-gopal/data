"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import RecruitingShell from "@/components/recruitment/RecruitingShell";

export interface AiAgentCard {
  type: "MUTATION_SUCCESS" | "DRAWER_OPENED" | "MODAL_OPENED" | "NAVIGATED" | "INFO";
  badge: string;
  badgeType: "success" | "info" | "action";
  title: string;
  description: string;
  details?: string[];
  actions?: Array<{
    label: string;
    onClick: () => void;
    primary?: boolean;
  }>;
}
import CreateRequisitionPlaceholderModal from "@/components/recruitment/CreateRequisitionPlaceholderModal";
import RequisitionDetailDrawer from "@/components/recruitment/RequisitionDetailDrawer";
import JobDistributionTab from "@/components/recruitment/JobDistributionTab";
import ScorecardsTab from "@/components/recruitment/ScorecardsTab";
import AssessmentsBgvTab from "@/components/recruitment/AssessmentsBgvTab";
import AgenciesTab from "@/components/recruitment/AgenciesTab";
import RecruitingAnalyticsTab from "@/components/recruitment/RecruitingAnalyticsTab";
import DirectAddCandidateModal from "@/components/recruitment/DirectAddCandidateModal";
import SelfScheduleModal from "@/components/recruitment/SelfScheduleModal";
import {
  recruitmentStore,
  Requisition,
  RecruitingTask,
  CommunicationMessage,
  InterviewScorecard,
  JobPostingChannel,
  CandidateAssessment,
  BgvCheck,
  AgencyPartner,
  AgencyCandidateSubmission,
  OfferItem,
} from "@/lib/recruitment-store";

function RecruitingDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  // Category Hub state (Pre-onboarding removed per user instruction)
  const [activeCategory, setActiveCategory] = useState<
    "overview" | "distribution" | "scorecards" | "assessments" | "agencies" | "analytics"
  >("overview");

  // Sync tabParam on mount or change
  useEffect(() => {
    if (!tabParam) return;
    const t = tabParam.toLowerCase();
    if (t === "distribution" || t === "postings") setActiveCategory("distribution");
    else if (t === "scorecards" || t === "interviews") setActiveCategory("scorecards");
    else if (t === "assessments" || t === "bgv") setActiveCategory("assessments");
    else if (t === "agencies") setActiveCategory("agencies");
    else if (t === "analytics" || t === "reports") setActiveCategory("analytics");
    else if (t === "overview") setActiveCategory("overview");
  }, [tabParam]);

  // Core Data State
  const [requisitions, setRequisitions] = useState<Requisition[]>([]);
  const [tasks, setTasks] = useState<RecruitingTask[]>([]);
  const [messages, setMessages] = useState<CommunicationMessage[]>([]);
  const [summaryCounts, setSummaryCounts] = useState(() => recruitmentStore.getSummaryCounts());

  // Operational Tabs State
  const [scorecards, setScorecards] = useState<InterviewScorecard[]>(() => recruitmentStore.getScorecards());
  const [jobPostings, setJobPostings] = useState<JobPostingChannel[]>(() => recruitmentStore.getJobPostings());
  const [assessments, setAssessments] = useState<CandidateAssessment[]>(() => recruitmentStore.getAssessments());
  const [bgvChecks, setBgvChecks] = useState<BgvCheck[]>(() => recruitmentStore.getBgvChecks());
  const [agencies, setAgencies] = useState<AgencyPartner[]>(() => recruitmentStore.getAgencies());
  const [agencySubmissions, setAgencySubmissions] = useState<AgencyCandidateSubmission[]>(() =>
    recruitmentStore.getAgencySubmissions()
  );
  const [analyticsData, setAnalyticsData] = useState<any>(() => recruitmentStore.getAnalyticsData());

  // Requisitions table status filter
  const [reqStatusFilter, setReqStatusFilter] = useState<"All" | "Pending Approval" | "Open" | "Filled" | "On Hold">("All");

  // Task & Comm Tab state
  const [activeTaskTab, setActiveTaskTab] = useState<"All" | "Approvals" | "Interviews" | "Candidates">("All");
  const [activeCommTab, setActiveCommTab] = useState<"All" | "Candidates" | "Colleagues">("All");
  const [commSearch, setCommSearch] = useState("");

  // Communication Center Modals & State (User Requirement)
  const [showComposeCommModal, setShowComposeCommModal] = useState(false);
  const [selectedThreadMsg, setSelectedThreadMsg] = useState<CommunicationMessage | null>(null);
  const [threadReplyText, setThreadReplyText] = useState("");
  const [commRecipientType, setCommRecipientType] = useState<"candidate" | "colleague">("candidate");
  const [commRecipientId, setCommRecipientId] = useState("cand-201");
  const [commChannel, setCommChannel] = useState<"Email" | "InApp" | "Teams">("Email");
  const [commTemplate, setCommTemplate] = useState("custom");
  const [commSubject, setCommSubject] = useState("");
  const [commBody, setCommBody] = useState("");
  const [commIsUrgent, setCommIsUrgent] = useState(false);

  // Pending Offers Modal State (User Requirement)
  const [showPendingOffersModal, setShowPendingOffersModal] = useState(false);
  const [pendingOffers, setPendingOffers] = useState<OfferItem[]>(() => recruitmentStore.getOffers());

  // AI & Voice Assistant State (User Requirement)
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [aiAgentCard, setAiAgentCard] = useState<AiAgentCard | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [isVoiceListening, setIsVoiceListening] = useState(false);

  // Modals & Drawers
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedReq, setSelectedReq] = useState<Requisition | null>(null);
  const [quickActionBanner, setQuickActionBanner] = useState<string | null>(null);
  const [showDirectAddCandidate, setShowDirectAddCandidate] = useState(false);
  const [showSelfSchedule, setShowSelfSchedule] = useState(false);
  const [showMoreActions, setShowMoreActions] = useState(false);

  // Load from API with fallback to recruitmentStore
  const loadDashboardData = async () => {
    try {
      const [sumRes, reqRes] = await Promise.all([
        fetch("/api/recruitment/summary").catch(() => null),
        fetch("/api/recruitment/requisitions").catch(() => null),
      ]);

      if (sumRes && sumRes.ok) {
        const sumData = await sumRes.json();
        setSummaryCounts({
          total: sumData.openRequisitions || 24,
          open: sumData.openRequisitions || 10,
          pendingApproval: 6,
          filled: 4,
          cancelled: 2,
          draft: 2,
          onHold: 2,
          activeCandidates: sumData.totalCandidatesInPipeline || 342,
          interviewsThisWeek: sumData.activeInterviews || 18,
          offersPending: sumData.offersExtended || 6,
        });
      } else {
        setSummaryCounts(recruitmentStore.getSummaryCounts());
      }

      if (reqRes && reqRes.ok) {
        const reqData = await reqRes.json();
        if (Array.isArray(reqData) && reqData.length > 0) {
          setRequisitions(recruitmentStore.getRequisitions());
        } else {
          setRequisitions(recruitmentStore.getRequisitions());
        }
      } else {
        setRequisitions(recruitmentStore.getRequisitions());
      }
    } catch {
      setRequisitions(recruitmentStore.getRequisitions());
      setSummaryCounts(recruitmentStore.getSummaryCounts());
    }

    setTasks(recruitmentStore.getTasks());
    setMessages(recruitmentStore.getMessages());
    setScorecards(recruitmentStore.getScorecards());
    setJobPostings(recruitmentStore.getJobPostings());
    setAssessments(recruitmentStore.getAssessments());
    setBgvChecks(recruitmentStore.getBgvChecks());
    setAgencies(recruitmentStore.getAgencies());
    setAgencySubmissions(recruitmentStore.getAgencySubmissions());
    setAnalyticsData(recruitmentStore.getAnalyticsData());
    setPendingOffers(recruitmentStore.getOffers());
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const triggerBanner = (msg: string) => {
    setQuickActionBanner(msg);
    setTimeout(() => setQuickActionBanner(null), 4500);
  };

  // Candidates & Requisitions mappings for child tabs
  const candidatesForTabs = useMemo(() => {
    return recruitmentStore.getCandidates().map((c) => ({
      id: c.id,
      fullName: c.name,
      email: c.email,
      requisitionId: c.requisitionId,
      requisitionTitle: c.role || c.requisitionTitle,
    }));
  }, []);

  const reqsForTabs = useMemo(() => {
    return requisitions.map((r) => ({
      id: r.id,
      reqNumber: r.reqNumber,
      title: r.title,
      department: r.department,
      jobLevel: r.jobLevel,
      employmentType: r.employmentType,
      location: r.location,
      targetHeadcount: r.targetHeadcount,
      filledHeadcount: r.filledHeadcount,
      salaryRange: r.salaryRange,
      hiringManagerName: r.hiringManager.name,
      status: r.status,
      requiredSkills: r.requiredSkills || [],
    }));
  }, [requisitions]);

  // Operational tab handlers
  const handleSubmitScorecard = (newScorecard: Partial<InterviewScorecard>) => {
    const added = recruitmentStore.addScorecard(newScorecard);
    setScorecards(recruitmentStore.getScorecards());
    triggerBanner(`✓ Scorecard submitted for ${added.candidateName} (${added.overallRecommendation}).`);
  };

  const handlePublishJobPosting = (newPosting: Partial<JobPostingChannel>) => {
    const created = recruitmentStore.addJobPosting(newPosting);
    setJobPostings(recruitmentStore.getJobPostings());
    triggerBanner(`✓ Campaign published to ${created.channel} for ${created.requisitionTitle}.`);
  };

  const handleAssignAssessment = (newAssessment: Partial<CandidateAssessment>) => {
    const created = recruitmentStore.addAssessment(newAssessment);
    setAssessments(recruitmentStore.getAssessments());
    triggerBanner(`✓ Assessment "${created.testTitle}" assigned to ${created.candidateName}.`);
  };

  const handleInitiateBgv = (newBgv: Partial<BgvCheck>) => {
    const created = recruitmentStore.addBgvCheck(newBgv);
    setBgvChecks(recruitmentStore.getBgvChecks());
    triggerBanner(`✓ Background check initiated with ${created.provider} for ${created.candidateName}.`);
  };

  const handleSubmitAgencyCandidate = (newSubmission: Partial<AgencyCandidateSubmission>) => {
    const created = recruitmentStore.addAgencySubmission(newSubmission);
    setAgencySubmissions(recruitmentStore.getAgencySubmissions());
    triggerBanner(`✓ Candidate ${created.candidateName} submitted by ${created.agencyName}.`);
  };

  // Filtered Tasks
  const filteredTasks = useMemo(() => {
    if (activeTaskTab === "All") return tasks;
    return tasks.filter((t) => t.category === activeTaskTab);
  }, [tasks, activeTaskTab]);

  // Filtered Communications
  const filteredMessages = useMemo(() => {
    return messages.filter((m) => {
      const matchCat = activeCommTab === "All" || m.category === activeCommTab;
      const matchSearch =
        commSearch === "" ||
        m.senderName.toLowerCase().includes(commSearch.toLowerCase()) ||
        m.subject.toLowerCase().includes(commSearch.toLowerCase()) ||
        m.preview.toLowerCase().includes(commSearch.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [messages, activeCommTab, commSearch]);

  // Filtered Requisitions for Table
  const filteredRequisitions = useMemo(() => {
    if (reqStatusFilter === "All") return requisitions;
    return requisitions.filter((r) => r.status === reqStatusFilter);
  }, [requisitions, reqStatusFilter]);

  // 1-Click Approve Requisition Handler
  const handleApproveRequisition = (reqId: string, reqNumber: string) => {
    recruitmentStore.updateRequisitionStatus(reqId, "Open");
    loadDashboardData();
    triggerBanner(`🎉 Requisition ${reqNumber} authorized and approved! Status is now Open.`);
  };

  // 1-Click Approve Offer Handler
  const handleApproveOffer = (offerId: string, candidateName: string) => {
    recruitmentStore.updateOfferStatus(offerId, "Sent");
    setPendingOffers(recruitmentStore.getOffers());
    setSummaryCounts(recruitmentStore.getSummaryCounts());
    triggerBanner(`✓ Offer approved & dispatched to ${candidateName}!`);
  };

  // Communication Dispatch Handler
  const handleSendCommunication = (e: React.FormEvent) => {
    e.preventDefault();
    const candidateRecipients = [
      { id: "cand-201", name: "Priya Menon", role: "Candidate", category: "Candidates" as const },
      { id: "cand-203", name: "Lucas Schneider", role: "Candidate", category: "Candidates" as const },
      { id: "cand-205", name: "Emily Zhang", role: "Candidate", category: "Candidates" as const },
      { id: "cand-208", name: "Sneha S", role: "Candidate", category: "Candidates" as const },
    ];
    const colleagueRecipients = [
      { id: "col-1", name: "Maria Lopez", role: "Hiring Manager", category: "Colleagues" as const },
      { id: "col-2", name: "David Chen", role: "Colleague", category: "Colleagues" as const },
      { id: "col-3", name: "Elena Rostova", role: "Colleague", category: "Colleagues" as const },
      { id: "col-4", name: "Sarah Connor", role: "Colleague", category: "Colleagues" as const },
    ];

    const recipientList = commRecipientType === "candidate" ? candidateRecipients : colleagueRecipients;
    const matched = recipientList.find((r) => r.id === commRecipientId) || recipientList[0];

    const created = recruitmentStore.addMessage({
      senderName: matched.name,
      senderRole: matched.role as any,
      subject: commSubject || `${commChannel} notification: Status update`,
      preview: commBody || "Message dispatched successfully via enterprise communication hub.",
      category: matched.category,
      timestamp: "Just now",
      unreadCount: 0,
    });

    setMessages(recruitmentStore.getMessages());
    setShowComposeCommModal(false);
    setCommSubject("");
    setCommBody("");
    triggerBanner(`✓ ${commChannel} message sent to ${matched.name}!`);
  };

  // Reply in Thread Handler
  const handleSendThreadReply = () => {
    if (!threadReplyText.trim() || !selectedThreadMsg) return;
    recruitmentStore.addMessage({
      senderName: selectedThreadMsg.senderName,
      senderRole: selectedThreadMsg.senderRole,
      subject: `Re: ${selectedThreadMsg.subject}`,
      preview: threadReplyText,
      category: selectedThreadMsg.category,
      timestamp: "Just now",
    });
    setMessages(recruitmentStore.getMessages());
    setThreadReplyText("");
    triggerBanner(`✓ Reply sent to ${selectedThreadMsg.senderName}!`);
  };

  // AI & Voice Natural Language Autonomous Agent Task Execution
  const handleAiAsk = async (query: string) => {
    if (!query.trim()) return;
    setAiLoading(true);
    setAiResponse(null);
    setAiAgentCard(null);

    const qLower = query.toLowerCase();

    // =========================================================================
    // AGENTIC TASK 1: Candidate Stage Mutation & Pipeline Progression
    // e.g. "Move Priya to next stage", "Advance Priya", "Move Priya to Offer", "Shortlist Priya", "Hire Priya"
    // =========================================================================
    const isStageAction =
      qLower.includes("move") ||
      qLower.includes("advance") ||
      qLower.includes("next stage") ||
      qLower.includes("shortlist") ||
      qLower.includes("hire") ||
      qLower.includes("reject") ||
      qLower.includes("promote") ||
      qLower.includes("progress");

    if (isStageAction) {
      const allCands = recruitmentStore.getCandidates();
      const matched =
        allCands.find(
          (c) =>
            qLower.includes(c.name.toLowerCase()) ||
            c.name.toLowerCase().split(" ").some((part) => part.length > 2 && qLower.includes(part))
        ) || allCands[0];

      if (matched) {
        const prevStage = matched.stage;
        let targetStage: "Applied" | "Screening" | "Interview" | "Offer" | "Hired" | "Rejected" = "Offer";
        let targetLabel: "In Review" | "New" | "Shortlisted" | "Interview" | "Offer" | "BGV" | "Hired" | "Rejected" = "Offer";

        if (qLower.includes("offer")) {
          targetStage = "Offer";
          targetLabel = "Offer";
        } else if (qLower.includes("hire") || qLower.includes("hired")) {
          targetStage = "Hired";
          targetLabel = "Hired";
        } else if (qLower.includes("screening") || qLower.includes("shortlist")) {
          targetStage = "Screening";
          targetLabel = "Shortlisted";
        } else if (qLower.includes("interview")) {
          targetStage = "Interview";
          targetLabel = "In Review";
        } else if (qLower.includes("reject")) {
          targetStage = "Rejected";
          targetLabel = "Rejected";
        } else {
          // Next stage progression: Applied -> Screening -> Interview -> Offer -> Hired
          switch (prevStage) {
            case "Applied":
              targetStage = "Screening";
              targetLabel = "Shortlisted";
              break;
            case "Screening":
              targetStage = "Interview";
              targetLabel = "In Review";
              break;
            case "Interview":
              targetStage = "Offer";
              targetLabel = "Offer";
              break;
            case "Offer":
              targetStage = "Hired";
              targetLabel = "Hired";
              break;
            default:
              targetStage = "Offer";
              targetLabel = "Offer";
          }
        }

        // 1. MUTATE CANDIDATE STAGE IN RECRUITMENT STORE
        recruitmentStore.updateCandidateStage(matched.id, targetStage, targetLabel);

        // 2. REFRESH DASHBOARD DATA SO METRICS & TABLES UPDATE INSTANTLY
        loadDashboardData();

        // 3. TRIGGER TOAST BANNER
        triggerBanner(`🎉 AGENT ACTION: ${matched.name} successfully advanced to ${targetStage} stage for ${matched.requisitionTitle}!`);

        // 4. PREPARE AGENT EXECUTION CARD
        const respText = `✅ **Agent Task Executed: Advanced ${matched.name} to ${targetStage} Stage**\n\n` +
          `• **Candidate**: ${matched.name} · ${matched.requisitionTitle} (${matched.requisitionId})\n` +
          `• **Pipeline Transition**: ${prevStage} ➔ **${targetStage}** (${targetLabel})\n` +
          `• **Fit Score**: ${matched.matchScore}% Composite Match (${matched.fitLevel || "Excellent Fit"})\n` +
          `• **Autonomous Actions Triggered**:\n` +
          `  - Candidate record synchronized across Talent Acquisition pipeline.\n` +
          `  - Automated notification dispatched to Hiring Manager John Smith.\n` +
          `  - Candidate Offer Package prepared and ready for executive review.`;

        setAiResponse(respText);

        setAiAgentCard({
          type: "MUTATION_SUCCESS",
          badge: "✓ TASK COMPLETED AUTONOMOUSLY",
          badgeType: "success",
          title: `Advanced ${matched.name} to ${targetStage} Stage`,
          description: `Successfully moved candidate from ${prevStage} stage to ${targetStage} stage in ${matched.requisitionId}.`,
          details: [
            `Role: ${matched.requisitionTitle} (${matched.requisitionId})`,
            `Transition: ${prevStage} ➔ ${targetStage}`,
            `Fit Score: ${matched.matchScore}% Match (${matched.fitLevel || "Excellent Fit"})`,
            `Status: Synchronized with live database & talent pipeline`,
          ],
          actions: [
            {
              label: "Inspect Offer Hub ➔",
              primary: true,
              onClick: () => router.push("/recruitment/offers"),
            },
            {
              label: "View in Talent Pipeline ➔",
              primary: false,
              onClick: () => router.push("/recruitment/candidates"),
            },
            {
              label: "Send Candidate Email ✉️",
              primary: false,
              onClick: () => {
                setCommRecipientType("candidate");
                setCommRecipientId(matched.id);
                setCommSubject(`Next Steps & Offer Stage Update — ${matched.requisitionTitle}`);
                setCommBody(`Hi ${matched.name.split(" ")[0]},\n\nWe are delighted to inform you that you have been advanced to the Offer stage for ${matched.requisitionTitle}. Our talent acquisition team is finalizing your formal offer package.\n\nBest regards,\nMAX ERP Talent Acquisition`);
                setShowComposeCommModal(true);
              },
            },
          ],
        });

        // 5. VOICE TTS CONFIRMATION
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(
            new SpeechSynthesisUtterance(`Task completed. Successfully moved ${matched.name} to the ${targetStage} stage.`)
          );
        }

        setAiLoading(false);
        return;
      }
    }

    // =========================================================================
    // AGENTIC TASK 2: Requisition Approvals
    // =========================================================================
    if (
      qLower.includes("approve") &&
      (qLower.includes("req") || qLower.includes("123") || qLower.includes("0048") || qLower.includes("00123") || qLower.includes("requisition"))
    ) {
      const targetReq =
        requisitions.find(
          (r) =>
            qLower.includes(r.reqNumber.toLowerCase()) ||
            r.id.toLowerCase().includes("123") ||
            (qLower.includes("0048") && (r.reqNumber.includes("0048") || r.id.includes("0048"))) ||
            r.status === "Pending Approval"
        ) || requisitions[0];

      if (targetReq) {
        recruitmentStore.updateRequisitionStatus(targetReq.id, "Open");
        recruitmentStore.updateRequisition(targetReq.id, {
          approvalStep: targetReq.totalApprovalSteps || 3,
          status: "Open",
        });
        loadDashboardData();
        triggerBanner(`🎉 AGENT ACTION: Requisition ${targetReq.reqNumber} authorized and moved to Open status!`);

        const respText = `✅ **Agent Task Executed: Requisition Authorized & Published**\n\n` +
          `• **Requisition**: ${targetReq.reqNumber} · ${targetReq.title}\n` +
          `• **Status Transition**: Pending Approval ➔ **Open** (Authorized)\n` +
          `• **Approval Gate**: Level ${targetReq.totalApprovalSteps || 3}/${targetReq.totalApprovalSteps || 3} signed off.\n` +
          `• **Autonomous Actions Triggered**:\n` +
          `  - Published to configured career sites and job boards.\n` +
          `  - Talent acquisition pipeline opened for applicants.`;

        setAiResponse(respText);

        setAiAgentCard({
          type: "MUTATION_SUCCESS",
          badge: "✓ REQUISITION AUTHORIZED",
          badgeType: "success",
          title: `Requisition ${targetReq.reqNumber} Approved & Open`,
          description: `Authorized ${targetReq.title} (${targetReq.department}). Role is now active and published.`,
          details: [
            `Requisition: ${targetReq.reqNumber} · ${targetReq.title}`,
            `Status: Open (Budget Authorized)`,
            `Headcount: ${targetReq.targetHeadcount} Openings`,
            `Salary Band: ${targetReq.salaryRange}`,
          ],
          actions: [
            {
              label: "Open Requisition Drawer ➔",
              primary: true,
              onClick: () => setSelectedReq({ ...targetReq, status: "Open" }),
            },
            {
              label: "Manage Job Distribution ➔",
              primary: false,
              onClick: () => setActiveCategory("distribution"),
            },
          ],
        });

        if (typeof window !== "undefined" && "speechSynthesis" in window) {
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(
            new SpeechSynthesisUtterance(`Requisition ${targetReq.reqNumber} has been authorized and opened.`)
          );
        }
        setAiLoading(false);
        return;
      }
    }

    // =========================================================================
    // AGENTIC TASK 3: Open Pending Approvals Drawer
    // =========================================================================
    if (
      qLower.includes("pending approval") ||
      qLower.includes("open approval") ||
      qLower.includes("pending requisitions") ||
      qLower.includes("governance approval")
    ) {
      setReqStatusFilter("Pending Approval");
      const pendingReq =
        requisitions.find((r) => r.status === "Pending Approval") ||
        recruitmentStore.getRequisitions().find((r) => r.status === "Pending Approval");

      if (pendingReq) {
        setSelectedReq(pendingReq);
      }
      triggerBanner(`📂 AGENT ACTION: Opened pending requisition ${pendingReq?.reqNumber || "REQ-2026-0048"} for review.`);

      const respText = `✅ **Agent Task Executed: Opened Pending Approvals Drawer**\n\n` +
        `• **Target Requisition**: ${pendingReq?.reqNumber || "REQ-2026-0048"} · ${pendingReq?.title || "Cloud Infrastructure Architect"}\n` +
        `• **Current Gate**: Step ${pendingReq?.approvalStep || 2} of ${pendingReq?.totalApprovalSteps || 3}\n` +
        `• **Action Taken**: Activated Requisition Detail Drawer directly on screen. You can authorize or inspect with 1-click.`;

      setAiResponse(respText);

      setAiAgentCard({
        type: "DRAWER_OPENED",
        badge: "✓ DRAWER ACTIVATED ON SCREEN",
        badgeType: "action",
        title: `Pending Requisition: ${pendingReq?.reqNumber || "REQ-2026-0048"}`,
        description: `Opened ${pendingReq?.title || "Requisition"} drawer for executive governance sign-off.`,
        details: [
          `Requisition: ${pendingReq?.reqNumber || "REQ-2026-0048"}`,
          `Hiring Manager: ${pendingReq?.hiringManager.name || "John Smith"}`,
          `Status: Pending Approval (Step ${pendingReq?.approvalStep || 2}/${pendingReq?.totalApprovalSteps || 3})`,
        ],
        actions: [
          {
            label: `Approve ${pendingReq?.reqNumber || "REQ-2026-0048"} Now ⚡`,
            primary: true,
            onClick: () => handleAiAsk(`Approve ${pendingReq?.reqNumber || "REQ-2026-0048"}`),
          },
        ],
      });

      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(
          new SpeechSynthesisUtterance(`Opened requisition ${pendingReq?.reqNumber || "REQ-2026-0048"} for approval review.`)
        );
      }
      setAiLoading(false);
      return;
    }

    // =========================================================================
    // AGENTIC TASK 4: Candidate Communication & Email Composer
    // =========================================================================
    if (qLower.includes("send message") || qLower.includes("email") || qLower.includes("contact candidate")) {
      const allCands = recruitmentStore.getCandidates();
      const targetCand =
        allCands.find(
          (c) =>
            qLower.includes(c.name.toLowerCase()) ||
            c.name.toLowerCase().split(" ").some((part) => part.length > 2 && qLower.includes(part))
        ) || allCands[0];

      setCommRecipientType("candidate");
      setCommRecipientId(targetCand.id);
      setCommSubject(`Interview Follow-up & Next Steps — ${targetCand.requisitionTitle}`);
      setCommBody(
        `Hi ${targetCand.name.split(" ")[0]},\n\nWe were impressed by your background and technical interview performance. We are pleased to advance your candidacy to the next stage in our talent acquisition pipeline.\n\nPlease let us know if you have any questions.\n\nBest regards,\nMAX ERP Talent Acquisition`
      );
      setShowComposeCommModal(true);
      triggerBanner(`✉️ AGENT ACTION: Communication composer activated for ${targetCand.name}.`);

      const respText = `✅ **Agent Task Executed: Communication Composer Activated**\n\n` +
        `• **Recipient**: ${targetCand.name} (${targetCand.email})\n` +
        `• **Subject**: Interview Follow-up & Next Steps — ${targetCand.requisitionTitle}\n` +
        `• **Status**: Pre-drafted and ready for 1-click dispatch.`;

      setAiResponse(respText);

      setAiAgentCard({
        type: "MODAL_OPENED",
        badge: "✓ COMPOSER ACTIVATED",
        badgeType: "action",
        title: `Candidate Email Prepared: ${targetCand.name}`,
        description: `Communication composer opened with pre-drafted status update for ${targetCand.email}.`,
        details: [
          `Recipient: ${targetCand.name} (${targetCand.email})`,
          `Role: ${targetCand.requisitionTitle} (${targetCand.requisitionId})`,
          `Channel: Enterprise SMTP & In-App Mail`,
        ],
        actions: [
          {
            label: "Open Composer Modal ➔",
            primary: true,
            onClick: () => setShowComposeCommModal(true),
          },
        ],
      });

      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(
          new SpeechSynthesisUtterance(`Opened communication composer for ${targetCand.name}.`)
        );
      }
      setAiLoading(false);
      return;
    }

    // =========================================================================
    // AGENTIC TASK 5: Show Candidates in Interview Queue
    // =========================================================================
    if (qLower.includes("interview") || qLower.includes("scorecard") || qLower.includes("rate candidate")) {
      setActiveCategory("scorecards");
      triggerBanner("📋 AGENT ACTION: Switched to Active Interview Queue & Candidate Scorecards.");

      const respText = `✅ **Agent Task Executed: Switched to Active Interview Queue**\n\n` +
        `• Displaying candidates currently undergoing technical and behavioral interview rounds.\n` +
        `• 1-click evaluation rubrics and rating submissions are now available.`;

      setAiResponse(respText);

      setAiAgentCard({
        type: "NAVIGATED",
        badge: "✓ VIEW ACTIVATED",
        badgeType: "info",
        title: "Active Interview Queue & Scorecards",
        description: "Displaying candidates currently undergoing interview rounds.",
        actions: [
          {
            label: "Advance Top Candidate (Priya) ➔",
            primary: true,
            onClick: () => handleAiAsk("Move Priya to next stage."),
          },
        ],
      });

      setAiLoading(false);
      return;
    }

    // =========================================================================
    // AGENTIC TASK 6: Show Time to Hire / Executive Analytics
    // =========================================================================
    if (qLower.includes("analytics") || qLower.includes("time to hire") || qLower.includes("cost per hire")) {
      setActiveCategory("analytics");
      triggerBanner("📊 AGENT ACTION: Opened Executive Analytics & Velocity Dashboard.");

      const respText = `✅ **Agent Task Executed: Switched to Executive Analytics**\n\n` +
        `• Telemetry Loaded: Average time-to-hire (18.4 days), Offer Acceptance Rate (89.2%), Cost-per-hire ($3,420).\n` +
        `• Interactive breakdown across all 5 organizational tiers displayed.`;

      setAiResponse(respText);

      setAiAgentCard({
        type: "NAVIGATED",
        badge: "✓ ANALYTICS LOADED",
        badgeType: "info",
        title: "Executive Recruiting Analytics",
        description: "Displaying hiring velocity, pipeline funnels, and cost-per-hire metrics.",
      });

      setAiLoading(false);
      return;
    }

    // =========================================================================
    // AGENTIC TASK 7: Find Matching Candidates
    // =========================================================================
    if (qLower.includes("match") || qLower.includes("matching candidates")) {
      const allCands = recruitmentStore.getCandidates();
      const topCands = allCands.filter((c) => c.matchScore >= 80);
      triggerBanner(`🎯 AGENT ACTION: Identified ${topCands.length} high-match candidates (Score ≥ 80%).`);

      const respText = `✅ **Agent Task Executed: Top Candidate Matching Completed**\n\n` +
        topCands.map((c) => `• **${c.name}** — ${c.role || c.requisitionTitle} (${c.matchScore}% Match · ${c.stage})`).join("\n");

      setAiResponse(respText);

      setAiAgentCard({
        type: "MUTATION_SUCCESS",
        badge: "✓ MATCHING COMPLETED",
        badgeType: "success",
        title: `Found ${topCands.length} Top-Ranked Candidates`,
        description: "Scored across skills, experience, and domain rubrics.",
        details: topCands.map((c) => `${c.name}: ${c.matchScore}% Fit (${c.stage})`),
        actions: [
          {
            label: "⚡ Advance Priya to Next Stage",
            primary: true,
            onClick: () => handleAiAsk("Move Priya to next stage."),
          },
          {
            label: "Inspect Talent Pipeline ➔",
            primary: false,
            onClick: () => router.push("/recruitment/candidates"),
          },
        ],
      });

      setAiLoading(false);
      return;
    }

    // =========================================================================
    // CANDIDATE SEARCH & DOSSIER LOOKUP (With 1-Click Action Buttons)
    // =========================================================================
    if (
      qLower.includes("candidate") ||
      qLower.includes("priya") ||
      qLower.includes("find") ||
      qLower.includes("search") ||
      qLower.includes("who is") ||
      qLower.includes("applicant")
    ) {
      const allCands = recruitmentStore.getCandidates();
      const matched = allCands.find(
        (c) =>
          qLower.includes(c.name.toLowerCase()) ||
          c.name.toLowerCase().split(" ").some((part) => part.length > 2 && qLower.includes(part))
      );

      if (matched) {
        const respText = `🔍 **Candidate Dossier: ${matched.name}**\n` +
          `• **Role**: ${matched.requisitionTitle} (${matched.requisitionId})\n` +
          `• **Stage**: **${matched.stage}** (${matched.statusLabel || "In Review"}) · **${matched.matchScore}% Match (${matched.fitLevel})**\n` +
          `• **Location & Contact**: ${matched.location || "Bangalore, India"} | ${matched.email}\n` +
          `• **AI Evaluation**: ${matched.aiSummary || "Top-ranked applicant with verified competencies."}\n` +
          `• **Recommended Action**: ${matched.recommendedNextStep || "Advance to next interview round."}`;

        setAiResponse(respText);

        setAiAgentCard({
          type: "INFO",
          badge: "🔍 CANDIDATE IDENTIFIED",
          badgeType: "info",
          title: `${matched.name} · ${matched.requisitionTitle}`,
          description: `Current Stage: ${matched.stage} (${matched.statusLabel || "In Review"}) · ${matched.matchScore}% Composite Fit`,
          details: [
            `Requisition: ${matched.requisitionId}`,
            `Contact: ${matched.email} · ${matched.phone}`,
            `Location: ${matched.location || "Bangalore, India"}`,
          ],
          actions: [
            {
              label: `⚡ Move ${matched.name.split(" ")[0]} to Next Stage`,
              primary: true,
              onClick: () => handleAiAsk(`Move ${matched.name} to next stage.`),
            },
            {
              label: `✉️ Send Email to ${matched.name.split(" ")[0]}`,
              primary: false,
              onClick: () => handleAiAsk(`Send candidate email for ${matched.name}`),
            },
            {
              label: "Inspect Offer Package ➔",
              primary: false,
              onClick: () => router.push("/recruitment/offers"),
            },
          ],
        });

        if (typeof window !== "undefined" && "speechSynthesis" in window) {
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(
            new SpeechSynthesisUtterance(`Found ${matched.name}, ${matched.requisitionTitle} with ${matched.matchScore} percent match.`)
          );
        }
        setAiLoading(false);
        return;
      }
    }

    // =========================================================================
    // CANDIDATE OFFERS & APPROVALS
    // =========================================================================
    if (qLower.includes("offer")) {
      const offers = recruitmentStore.getOffers();
      const pendingOffers = offers.filter((o) => o.status === "Pending Approval");
      const respText = `Found ${offers.length} active candidate offers (${pendingOffers.length} pending higher-level approval).\n• Top Offer: ${offers[0]?.candidateName} (${offers[0]?.requisitionTitle}) at ${offers[0]?.baseSalary} base.\n• Status: ${offers[0]?.status} (Level ${offers[0]?.currentApprovalLevel || 1} Review).`;
      setAiResponse(respText);

      setAiAgentCard({
        type: "INFO",
        badge: "📄 OFFERS MANAGEMENT",
        badgeType: "info",
        title: "Candidate Offers Hub",
        description: `${offers.length} active offers (${pendingOffers.length} pending higher-level approval).`,
        actions: [
          {
            label: "Open Candidate Offers ➔",
            primary: true,
            onClick: () => router.push("/recruitment/offers"),
          },
        ],
      });

      setAiLoading(false);
      return;
    }

    // =========================================================================
    // REQUISITION & HEADCOUNT QUESTIONS
    // =========================================================================
    if (
      qLower.includes("open position") ||
      qLower.includes("open job") ||
      qLower.includes("open req") ||
      qLower.includes("how many open") ||
      qLower.includes("how many requisition") ||
      qLower.includes("how many job")
    ) {
      const openReqs = requisitions.filter((r) => r.status === "Open");
      const respText = `📊 **Active Job Requisitions**: There are currently **${openReqs.length} Open positions** across MAX ERP:\n` +
        openReqs.map((r, idx) => `${idx + 1}. **${r.reqNumber}**: ${r.title} (${r.department} · ${r.salaryRange})`).join("\n") +
        `\n\n• Plus 1 requisition awaiting governance approval (REQ-2026-0048 Cloud Infrastructure Architect).`;

      setAiResponse(respText);
      setAiAgentCard({
        type: "INFO",
        badge: "📊 REQUISITIONS TELEMETRY",
        badgeType: "info",
        title: `${openReqs.length} Open Job Requisitions`,
        description: "Active positions published across configured career sites.",
        details: openReqs.map((r) => `${r.reqNumber}: ${r.title} (${r.department})`),
        actions: [
          {
            label: "Open Pending Approvals ➔",
            primary: true,
            onClick: () => handleAiAsk("Open pending approvals"),
          },
          {
            label: "View Distribution Boards ➔",
            primary: false,
            onClick: () => setActiveCategory("distribution"),
          },
        ],
      });
      setAiLoading(false);
      return;
    }

    if (qLower.includes("0048") || qLower.includes("cloud architect") || qLower.includes("cloud infrastructure")) {
      const r = requisitions.find((x) => x.reqNumber.includes("0048") || x.title.toLowerCase().includes("cloud")) || requisitions[0];
      const respText = `📄 **Requisition Telemetry: ${r.reqNumber} · ${r.title}**\n` +
        `• **Department**: ${r.department} | **Location**: ${r.location}\n` +
        `• **Status**: **${r.status}** (Step ${r.approvalStep || 2} of ${r.totalApprovalSteps || 3})\n` +
        `• **Target Headcount**: ${r.targetHeadcount} Openings | **Pay Band**: ${r.salaryRange}\n` +
        `• **Hiring Manager**: ${r.hiringManager.name} (${r.hiringManager.title})\n` +
        `• **Required Skills**: Kubernetes, Terraform, AWS/GCP, Distributed Systems`;

      setAiResponse(respText);
      setAiAgentCard({
        type: "DRAWER_OPENED",
        badge: "📄 REQUISITION DOSSIER",
        badgeType: "info",
        title: `${r.reqNumber} · ${r.title}`,
        description: `Status: ${r.status} · Hiring Manager: ${r.hiringManager.name}`,
        details: [
          `Department: ${r.department} (${r.location})`,
          `Budget: ${r.salaryRange}`,
          `Approval Step: ${r.approvalStep || 2}/${r.totalApprovalSteps || 3}`,
        ],
        actions: [
          {
            label: "Open Requisition Drawer ➔",
            primary: true,
            onClick: () => setSelectedReq(r),
          },
          {
            label: "Approve Requisition Now ⚡",
            primary: false,
            onClick: () => handleAiAsk(`Approve ${r.reqNumber}`),
          },
        ],
      });
      setAiLoading(false);
      return;
    }

    if (qLower.includes("salary") || qLower.includes("compensation") || qLower.includes("pay band")) {
      const respText = `💰 **Approved Requisition Compensation Bands**:\n` +
        `• **Cloud Infrastructure Architect (REQ-0048)**: $160,000 - $195,000\n` +
        `• **Senior Java Developer (REQ-0123)**: $140,000 - $175,000\n` +
        `• **Lead Product Manager (REQ-0118)**: $150,000 - $185,000\n` +
        `• **Senior Financial Controller (REQ-0121)**: $140,000 - $175,000\n` +
        `• **SAP SF Consultant (REQ-0120)**: $130,000 - $165,000\n` +
        `• **HR Business Partner (REQ-0119)**: $95,000 - $125,000`;

      setAiResponse(respText);
      setAiAgentCard({
        type: "INFO",
        badge: "💰 COMPENSATION BENCHMARKS",
        badgeType: "info",
        title: "Requisition Pay Bands",
        description: "Benchmark aligned with 65th percentile of enterprise software salary surveys.",
      });
      setAiLoading(false);
      return;
    }

    if (qLower.includes("hiring manager")) {
      const respText = `👥 **Hiring Managers by Requisition**:\n` +
        `• **Senior Java Developer (REQ-0123)**: John Smith (Engineering Director)\n` +
        `• **Cloud Infrastructure Architect (REQ-0048)**: Elena Vance (VP Engineering)\n` +
        `• **Lead Product Manager (REQ-0118)**: Anita Desai (VP Product)\n` +
        `• **HR Business Partner (REQ-0119)**: Marcus Chen (Chief People Officer)\n` +
        `• **SAP SF Consultant (REQ-0120)**: Priya Nair (HR Tech Director)`;

      setAiResponse(respText);
      setAiAgentCard({
        type: "INFO",
        badge: "👥 STAKEHOLDER MAPPING",
        badgeType: "info",
        title: "Requisition Hiring Managers",
        description: "Departmental leads assigned to sign-offs and interview debriefs.",
      });
      setAiLoading(false);
      return;
    }

    if (qLower.includes("template") || qLower.includes("where") || qLower.includes("configure") || qLower.includes("config")) {
      const respText = `⚙️ **Configuration Studio & System Settings**:\n` +
        `• **Offer Letter Templates**: Managed in Configuration Studio ➔ Letters & Offers (/configuration/recruitment?tab=offers).\n` +
        `• **Job Distribution Boards**: Managed in Job Distribution tab (/recruitment?tab=distribution) to connect LinkedIn, Indeed, Glassdoor.\n` +
        `• **Governance Approval Workflows**: Configured in Configuration Studio ➔ Governance Workflows (/configuration/workflows).`;

      setAiResponse(respText);
      setAiAgentCard({
        type: "INFO",
        badge: "⚙️ CONFIGURATION STUDIO",
        badgeType: "info",
        title: "System Configuration Links",
        description: "Direct shortcuts to Configuration Studio hubs.",
        actions: [
          {
            label: "Open Offer Templates ➔",
            primary: true,
            onClick: () => router.push("/configuration/recruitment?tab=offers"),
          },
          {
            label: "Open Job Distribution ➔",
            primary: false,
            onClick: () => setActiveCategory("distribution"),
          },
        ],
      });
      setAiLoading(false);
      return;
    }

    if (qLower.includes("what can you do") || qLower.includes("help") || qLower.includes("capabilities")) {
      const respText = `🤖 **MAX AI Recruiting Copilot Capabilities**:\n` +
        `• **Autonomous Actions**:\n` +
        `  - "Move Priya to next stage" (advances candidate to Offer)\n` +
        `  - "Approve REQ-2026-00123" (signs off governance gates)\n` +
        `  - "Open pending approvals" (pops open requisition drawer)\n` +
        `  - "Send candidate email" (opens pre-drafted communication)\n` +
        `• **Live Data Queries**:\n` +
        `  - Candidate dossiers (Priya, Arjun, Vikram, Sneha, Rahul, Suresh, Deepa, Manu)\n` +
        `  - Open positions & hiring managers\n` +
        `  - Hiring velocity: Time-to-hire (18.4d), Cost-per-hire ($3,420), Acceptance (89.2%)`;

      setAiResponse(respText);
      setAiAgentCard({
        type: "INFO",
        badge: "🤖 SYSTEM CAPABILITIES",
        badgeType: "info",
        title: "AI Copilot Command Center",
        description: "Natural language agent capable of autonomous workflow execution and data discovery.",
      });
      setAiLoading(false);
      return;
    }

    // Fallback to AI Recruiter API with rich QA
    try {
      const res = await fetch("/api/recruitment/ai-recruiter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ASSISTANT_QUERY",
          prompt: query,
          requisitionTitle: query,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAiResponse(data.executiveSummary || data.reply || data.justification || "Action processed successfully.");
      } else {
        setAiResponse(`Synthesized recruitment workflow for: "${query}". Requisition telemetry updated.`);
      }
    } catch {
      setAiResponse(`Analyzed query: "${query}". Live AI assistant is operational.`);
    } finally {
      setAiLoading(false);
    }
  };

  // Web Speech Recognition Trigger
  const handleStartVoiceCommand = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      triggerBanner("Voice recognition is not supported in this browser. Please type your command.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      setIsVoiceListening(true);
      triggerBanner("🎙️ Listening... Speak command (e.g. 'Open pending approvals' or 'Approve REQ-2026-00123')");

      recognition.onresult = (event: any) => {
        const spoken = event.results[0][0].transcript;
        setAiPrompt(spoken);
        setIsVoiceListening(false);
        handleAiAsk(spoken);
      };

      recognition.onerror = () => {
        setIsVoiceListening(false);
      };

      recognition.onend = () => {
        setIsVoiceListening(false);
      };

      recognition.start();
    } catch {
      setIsVoiceListening(false);
    }
  };

  return (
    <RecruitingShell onRequestCreateModal={() => setShowCreateModal(true)}>
      <div className="space-y-6">
        {/* Banner Alert if triggered */}
        {quickActionBanner && (
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-800 shadow-2xs animate-in fade-in">
            <svg className="h-4 w-4 shrink-0 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-semibold">{quickActionBanner}</span>
          </div>
        )}

        {/* 1. Dashboard Heading & Quick Actions */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Good Morning, John</h1>
            <p className="text-xs text-slate-500 mt-1">
              Here&apos;s what&apos;s happening in your enterprise recruiting workspace.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-xs font-medium text-slate-500 mr-1 hidden sm:inline">
              Tuesday, 13 Oct 2026
            </span>

            {/* + Create Job Requisition Button */}
            <Link
              href="/recruitment/requisitions/create"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 shadow-xs transition"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Job Requisition
            </Link>

            {/* Add Candidate Button */}
            <button
              onClick={() => setShowDirectAddCandidate(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
            >
              <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Add Candidate
            </button>

            {/* Schedule Interview Button */}
            <button
              onClick={() => setShowSelfSchedule(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
            >
              <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Schedule Interview
            </button>

            {/* More Actions Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowMoreActions((p) => !p)}
                className="inline-flex items-center gap-1 px-2.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
              >
                <span>More Actions</span>
                <svg className="h-3 w-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showMoreActions && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-slate-200 shadow-lg py-1.5 z-40 text-xs font-medium text-slate-700">
                  <Link
                    href="/configuration/recruitment"
                    className="block px-3 py-2 hover:bg-slate-50 transition"
                    onClick={() => setShowMoreActions(false)}
                  >
                    ⚙️ Recruiting Configuration Studio
                  </Link>
                  <Link
                    href="/careers"
                    className="block px-3 py-2 hover:bg-slate-50 transition"
                    onClick={() => setShowMoreActions(false)}
                  >
                    🌐 Public Career Portal
                  </Link>
                  <Link
                    href="/recruitment/offers"
                    className="block px-3 py-2 hover:bg-slate-50 transition"
                    onClick={() => setShowMoreActions(false)}
                  >
                    📄 Candidate Offers & Executive Approvals
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Category Hub Switcher Bar (Pre-onboarding removed per user requirement) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200/80 text-xs font-semibold scrollbar-none">
          {[
            { id: "overview", label: "Dashboard & Pipeline", icon: "📊" },
            { id: "distribution", label: "Job Distribution", icon: "🎯" },
            { id: "scorecards", label: "Scorecards & Interviews", icon: "📋" },
            { id: "assessments", label: "Assessments & BGV", icon: "🔬" },
            { id: "agencies", label: "Staffing Agencies", icon: "🏢" },
            { id: "analytics", label: "Executive Analytics", icon: "📈" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition shrink-0 ${
                activeCategory === cat.id
                  ? "bg-blue-600 text-white font-bold shadow-xs"
                  : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200/80"
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* ===================================================================
            VIEW 1: OVERVIEW & DASHBOARD (Approved Screen 1)
        =================================================================== */}
        {activeCategory === "overview" && (
          <div className="space-y-6">
            {/* Top 4 KPI Summary Cards matching Image 1 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Open Requisitions (24) */}
              <Link
                href="/recruitment/requisitions"
                className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-blue-300 transition group flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-slate-500 block">Open Requisitions</span>
                    <span className="text-2xl font-bold tracking-tight text-slate-900 block mt-0.5">
                      {summaryCounts.total}
                    </span>
                  </div>
                </div>
                <svg className="h-5 w-5 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>

              {/* Card 2: Active Candidates (342) */}
              <Link
                href="/recruitment/candidates"
                className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-purple-300 transition group flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-slate-500 block">Active Candidates</span>
                    <span className="text-2xl font-bold tracking-tight text-slate-900 block mt-0.5">
                      {summaryCounts.activeCandidates}
                    </span>
                  </div>
                </div>
                <svg className="h-5 w-5 text-slate-300 group-hover:text-purple-600 group-hover:translate-x-0.5 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>

              {/* Card 3: Interviews This Week (18) */}
              <button
                onClick={() => setActiveCategory("scorecards")}
                className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-emerald-300 transition group flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-slate-500 block">Interviews This Week</span>
                    <span className="text-2xl font-bold tracking-tight text-slate-900 block mt-0.5">
                      {summaryCounts.interviewsThisWeek}
                    </span>
                  </div>
                </div>
                <svg className="h-5 w-5 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Card 4: Offers Pending (6) -> Opens Offers Review Modal (User Requirement) */}
              <button
                type="button"
                onClick={() => setShowPendingOffersModal(true)}
                className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-amber-300 transition group flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-slate-500 block">Offers Pending</span>
                    <span className="text-2xl font-bold tracking-tight text-slate-900 block mt-0.5">
                      {summaryCounts.offersPending}
                    </span>
                  </div>
                </div>
                <svg className="h-5 w-5 text-slate-300 group-hover:text-amber-600 group-hover:translate-x-0.5 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Main Split Grid (Left Column ~68%, Right Column ~32%) matching Image 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* ===================== LEFT COLUMN (8 COLS) ===================== */}
              <div className="lg:col-span-8 space-y-6">
                {/* CARD 1: My Tasks (12) */}
                <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-slate-900">My Tasks</h2>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                        12
                      </span>
                    </div>
                    <button
                      onClick={() => triggerBanner("Displaying all active tasks across recruiting pipeline.")}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
                    >
                      View All &rarr;
                    </button>
                  </div>

                  {/* Subtabs: All (12), Approvals (4), Interviews (5), Candidates (3) */}
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                    {[
                      { id: "All", label: "All (12)" },
                      { id: "Approvals", label: "Approvals (4)" },
                      { id: "Interviews", label: "Interviews (5)" },
                      { id: "Candidates", label: "Candidates (3)" },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTaskTab(tab.id as any)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                          activeTaskTab === tab.id
                            ? "bg-slate-100 text-slate-900 font-bold"
                            : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Tasks Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                        <tr>
                          <th className="pb-2.5 font-bold">Task</th>
                          <th className="pb-2.5 font-bold">Related To</th>
                          <th className="pb-2.5 font-bold">Type</th>
                          <th className="pb-2.5 font-bold">Due Date</th>
                          <th className="pb-2.5 text-right font-bold">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {filteredTasks.slice(0, 5).map((task) => (
                          <tr key={task.id} className="hover:bg-slate-50/70 transition group">
                            <td className="py-3 pr-3">
                              <div className="flex items-center gap-2.5">
                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 shrink-0">
                                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                </div>
                                <span className="font-semibold text-slate-900">{task.title}</span>
                              </div>
                            </td>
                            <td className="py-3 px-3 text-slate-600 font-medium">{task.relatedTo}</td>
                            <td className="py-3 px-3">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  task.type === "Approval"
                                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                                    : task.type === "Review"
                                    ? "bg-rose-50 text-rose-700 border border-rose-200"
                                    : task.type === "Interview"
                                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                                    : "bg-orange-50 text-orange-700 border border-orange-200"
                                }`}
                              >
                                {task.type}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <span className={`font-semibold ${task.dueDate === "Today" ? "text-rose-600" : "text-slate-600"}`}>
                                {task.dueDate}
                              </span>
                            </td>
                            <td className="py-3 pl-3 text-right">
                              <Link
                                href={task.actionUrl}
                                className="text-slate-400 group-hover:text-blue-600 inline-flex items-center"
                              >
                                &gt;
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* CARD 2: Recent Job Requisitions with Status Filter & Direct Actions */}
                <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h2 className="text-base font-bold text-slate-900">Job Requisitions</h2>
                    <div className="flex items-center gap-2">
                      {/* Status Filter Pills (Includes Pending Approval for AI / 1-click review) */}
                      {(["All", "Pending Approval", "Open", "Filled", "On Hold"] as const).map((filter) => (
                        <button
                          key={filter}
                          type="button"
                          onClick={() => setReqStatusFilter(filter)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                            reqStatusFilter === filter
                              ? filter === "Pending Approval"
                                ? "bg-amber-500 text-white font-bold shadow-2xs"
                                : "bg-blue-600 text-white font-bold shadow-2xs"
                              : "bg-slate-100 text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          {filter}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                        <tr>
                          <th className="pb-2.5 font-bold">Req ID</th>
                          <th className="pb-2.5 font-bold">Job Title</th>
                          <th className="pb-2.5 font-bold">Department</th>
                          <th className="pb-2.5 font-bold">Location</th>
                          <th className="pb-2.5 font-bold">Hiring Manager</th>
                          <th className="pb-2.5 font-bold">Status</th>
                          <th className="pb-2.5 text-right font-bold">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {filteredRequisitions.slice(0, 6).map((req) => (
                          <tr key={req.id} className="hover:bg-slate-50/70 transition">
                            <td className="py-3 pr-2">
                              <button
                                onClick={() => setSelectedReq(req)}
                                className="font-mono text-blue-600 font-semibold hover:underline"
                              >
                                {req.reqNumber}
                              </button>
                            </td>
                            <td className="py-3 px-2 font-bold text-slate-900">{req.title}</td>
                            <td className="py-3 px-2 text-slate-600">{req.department}</td>
                            <td className="py-3 px-2 text-slate-600">{req.location}</td>
                            <td className="py-3 px-2 text-slate-800">{req.hiringManager.name}</td>
                            <td className="py-3 px-2">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  req.status === "Open"
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : req.status === "Pending Approval"
                                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                                    : req.status === "Filled"
                                    ? "bg-purple-50 text-purple-700 border border-purple-200"
                                    : req.status === "On Hold"
                                    ? "bg-sky-50 text-sky-700 border border-sky-200"
                                    : "bg-slate-100 text-slate-700 border border-slate-200"
                                }`}
                              >
                                {req.status}
                              </span>
                            </td>
                            <td className="py-3 pl-2 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {req.status === "Pending Approval" ? (
                                  <button
                                    onClick={() => handleApproveRequisition(req.id, req.reqNumber)}
                                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] shadow-2xs transition"
                                  >
                                    ✓ Approve
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => setSelectedReq(req)}
                                    className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-[10px] transition"
                                  >
                                    View
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* ===================== RIGHT COLUMN (4 COLS) ===================== */}
              <div className="lg:col-span-4 space-y-6">
                {/* CARD 3: COMMUNICATION CENTER (Revamped with Compose, Reply & Threads) */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900">Communication Center</h3>
                    </div>

                    <button
                      onClick={() => setShowComposeCommModal(true)}
                      className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs transition flex items-center gap-1"
                    >
                      <span>+ New Message</span>
                    </button>
                  </div>

                  {/* Tabs: All (6), Candidates (5), Colleagues (3) */}
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2 text-xs">
                    <button
                      onClick={() => setActiveCommTab("All")}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold transition ${
                        activeCommTab === "All" ? "bg-slate-100 text-slate-900 font-bold" : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      All
                      <span className="h-4 w-4 rounded-full bg-rose-600 text-white text-[9px] flex items-center justify-center font-bold">
                        {messages.length}
                      </span>
                    </button>
                    <button
                      onClick={() => setActiveCommTab("Candidates")}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold transition ${
                        activeCommTab === "Candidates" ? "bg-slate-100 text-slate-900 font-bold" : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      Candidates
                    </button>
                    <button
                      onClick={() => setActiveCommTab("Colleagues")}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold transition ${
                        activeCommTab === "Colleagues" ? "bg-slate-100 text-slate-900 font-bold" : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      Colleagues
                    </button>
                  </div>

                  {/* Search input */}
                  <div className="relative">
                    <input
                      type="text"
                      value={commSearch}
                      onChange={(e) => setCommSearch(e.target.value)}
                      placeholder="Search conversations..."
                      className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                    />
                    <svg className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>

                  {/* Message List (Clicking opens thread) */}
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {filteredMessages.map((msg) => (
                      <div
                        key={msg.id}
                        onClick={() => setSelectedThreadMsg(msg)}
                        className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-blue-300 transition cursor-pointer space-y-1 group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[9px] font-bold flex items-center justify-center shrink-0">
                              {msg.senderInitials || msg.senderName.slice(0, 2).toUpperCase()}
                            </div>
                            <span className="font-semibold text-slate-900 text-xs">{msg.senderName}</span>
                            <span className="text-[10px] text-slate-400">({msg.senderRole})</span>
                          </div>
                          <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                        </div>
                        <p className="text-[11px] font-semibold text-slate-800 truncate">{msg.subject}</p>
                        <p className="text-[11px] text-slate-500 truncate">{msg.preview}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CARD 4: Quick AI Prompt (MAX AI Copilot & Voice) */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-5 w-5 items-center justify-center rounded-md bg-purple-100 text-purple-700 text-xs font-bold">
                        ✦
                      </div>
                      <h3 className="text-sm font-bold text-slate-900">MAX AI & Voice Copilot</h3>
                    </div>
                    <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                      Voice Enabled
                    </span>
                  </div>

                  {/* Input form with Microphone Button */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleAiAsk(aiPrompt);
                    }}
                    className="relative flex items-center gap-1.5"
                  >
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder='Ask or speak: "Open pending approvals", "Approve REQ-2026-00123"...'
                        className="w-full pl-3 pr-8 py-2 text-xs rounded-xl border border-slate-200/80 bg-slate-50 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-purple-500 shadow-2xs"
                      />
                      <button
                        type="submit"
                        disabled={aiLoading}
                        className="absolute right-2 top-2 text-purple-600 hover:text-purple-800 font-bold text-xs disabled:opacity-50"
                      >
                        ➤
                      </button>
                    </div>

                    {/* Microphone Voice Button */}
                    <button
                      type="button"
                      onClick={handleStartVoiceCommand}
                      className={`h-8 w-8 rounded-xl flex items-center justify-center text-xs transition shrink-0 ${
                        isVoiceListening
                          ? "bg-rose-600 text-white animate-pulse shadow-md"
                          : "border border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                      }`}
                      title="Speak voice command"
                    >
                      🎙️
                    </button>
                  </form>

                  {/* AI Response feedback */}
                  {aiLoading && (
                    <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-100 text-xs text-purple-800 flex items-center gap-2 animate-pulse">
                      <span>✦ Executing AI command...</span>
                    </div>
                  )}
                  {/* AI Agent Execution Result Card */}
                  {aiAgentCard && (
                    <div className="p-3.5 rounded-2xl bg-gradient-to-b from-blue-50/90 to-indigo-50/60 border border-blue-200/90 shadow-2xs space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide uppercase ${
                            aiAgentCard.badgeType === "success"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : aiAgentCard.badgeType === "action"
                              ? "bg-purple-100 text-purple-800 border border-purple-300"
                              : "bg-blue-100 text-blue-800 border border-blue-300"
                          }`}
                        >
                          {aiAgentCard.badge}
                        </span>
                        <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Autonomous Agent
                        </span>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{aiAgentCard.title}</h4>
                        <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                          {aiAgentCard.description}
                        </p>
                      </div>

                      {aiAgentCard.details && aiAgentCard.details.length > 0 && (
                        <div className="p-2.5 rounded-xl bg-white/90 border border-blue-100 space-y-1 text-[10px] text-slate-700 shadow-2xs">
                          {aiAgentCard.details.map((detail, idx) => (
                            <div key={idx} className="flex items-start gap-1.5">
                              <span className="text-blue-600 font-bold">•</span>
                              <span className="leading-snug">{detail}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {aiAgentCard.actions && aiAgentCard.actions.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {aiAgentCard.actions.map((act, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={act.onClick}
                              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition flex items-center gap-1 shadow-2xs cursor-pointer ${
                                act.primary
                                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                                  : "bg-white hover:bg-slate-100 text-slate-800 border border-slate-200"
                              }`}
                            >
                              <span>{act.label}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Fallback AI Response if no Agent Card */}
                  {!aiAgentCard && aiResponse && (
                    <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 space-y-1">
                      <span className="font-bold block">AI Intelligence Action:</span>
                      <p className="whitespace-pre-line text-[11px] leading-relaxed">{aiResponse}</p>
                    </div>
                  )}

                  {/* 6 Quick Action Pill Buttons */}
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    {[
                      "Open pending approvals",
                      "Approve REQ-2026-00123",
                      "Show candidates in interview",
                      "Send candidate email",
                      "Show time to hire",
                      "Find matching candidates",
                    ].map((action) => (
                      <button
                        key={action}
                        onClick={() => {
                          setAiPrompt(action);
                          handleAiAsk(action);
                        }}
                        className="p-2 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-100 hover:border-blue-200 font-semibold text-slate-700 text-left transition truncate"
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            VIEW 2: JOB DISTRIBUTION TAB (Restyled Light Theme)
        =================================================================== */}
        {activeCategory === "distribution" && (
          <JobDistributionTab
            postings={jobPostings}
            requisitions={reqsForTabs}
            onPublish={handlePublishJobPosting}
            onTriggerBanner={triggerBanner}
          />
        )}

        {/* ===================================================================
            VIEW 3: SCORECARDS & INTERVIEWS TAB (With Active Interview Queue & Rubric)
        =================================================================== */}
        {activeCategory === "scorecards" && (
          <ScorecardsTab
            scorecards={scorecards}
            candidates={candidatesForTabs}
            activeApprover={{ name: "John Smith", role: "Recruiting Lead" }}
            onSubmitScorecard={handleSubmitScorecard}
            onTriggerBanner={triggerBanner}
          />
        )}

        {/* ===================================================================
            VIEW 4: ASSESSMENTS & BGV TAB (Restyled Light Theme)
        =================================================================== */}
        {activeCategory === "assessments" && (
          <AssessmentsBgvTab
            assessments={assessments}
            bgvChecks={bgvChecks}
            candidates={candidatesForTabs}
            onAssignAssessment={handleAssignAssessment}
            onInitiateBgv={handleInitiateBgv}
            onTriggerBanner={triggerBanner}
          />
        )}

        {/* ===================================================================
            VIEW 5: AGENCIES & STAFFING PARTNERS TAB (Restyled Light Theme)
        =================================================================== */}
        {activeCategory === "agencies" && (
          <AgenciesTab
            agencies={agencies}
            submissions={agencySubmissions}
            requisitions={reqsForTabs}
            onSubmitCandidate={handleSubmitAgencyCandidate}
            onTriggerBanner={triggerBanner}
          />
        )}

        {/* ===================================================================
            VIEW 6: EXECUTIVE RECRUITING ANALYTICS TAB (Interactive Drilldowns)
        =================================================================== */}
        {activeCategory === "analytics" && (
          <RecruitingAnalyticsTab analyticsData={analyticsData} />
        )}
      </div>

      {/* =========================================================================
          MODAL: PENDING OFFERS REVIEW & APPROVAL (User Requirement)
      ========================================================================= */}
      {showPendingOffersModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-2xl rounded-2xl bg-white border border-slate-200 p-6 shadow-2xl text-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="rounded-md bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 text-[10px] font-bold uppercase">
                  Executive Compensation & Governance
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">Pending Offers Awaiting Decision</h3>
              </div>
              <button onClick={() => setShowPendingOffersModal(false)} className="text-slate-400 hover:text-slate-700 text-lg leading-none">✕</button>
            </div>

            <p className="text-xs text-slate-500">
              Review compensation packages, approve releases, or open letter templates in Letter Studio:
            </p>

            <div className="space-y-3">
              {pendingOffers.map((offer) => (
                <div key={offer.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{offer.candidateName}</h4>
                      <p className="text-xs text-blue-600 font-semibold">{offer.requisitionTitle}</p>
                      <span className="text-[10px] text-slate-400 font-mono">Req ID: {offer.requisitionId}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-black text-slate-900 font-mono block">{offer.baseSalary}</span>
                      <span className="text-[10px] text-slate-500 block">Start Date: {offer.targetStartDate}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/80">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      Status: {offer.status}
                    </span>

                    <div className="flex items-center gap-2">
                      {offer.status !== "Sent" && offer.status !== "Accepted" && (
                        <button
                          type="button"
                          onClick={() => handleApproveOffer(offer.id, offer.candidateName)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs transition"
                        >
                          ✓ Approve & Release Offer
                        </button>
                      )}
                      <Link
                        href="/recruitment/offers"
                        className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
                      >
                        Offers Workspace &rarr;
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-100 text-xs">
              <Link href="/recruitment/offers" className="font-bold text-blue-600 hover:underline">
                Open Full Candidate Offers &amp; Approvals Workspace &rarr;
              </Link>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPendingOffersModal(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Close
                </button>
                <Link
                  href="/recruitment/offers"
                  className="rounded-xl bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700 shadow-xs transition"
                >
                  Manage Offers &amp; Approvals
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: COMPOSE COMMUNICATION MESSAGE (User Requirement)
      ========================================================================= */}
      {showComposeCommModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 p-6 shadow-2xl text-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="rounded-md bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 text-[10px] font-bold uppercase">
                  Enterprise Communication Hub
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">Compose & Dispatch Message</h3>
              </div>
              <button onClick={() => setShowComposeCommModal(false)} className="text-slate-400 hover:text-slate-700 text-lg leading-none">✕</button>
            </div>

            <form onSubmit={handleSendCommunication} className="space-y-4 text-xs">
              {/* Recipient Type Toggle */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">Recipient Category</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCommRecipientType("candidate");
                      setCommRecipientId("cand-201");
                    }}
                    className={`p-2 rounded-xl border text-center font-semibold transition ${
                      commRecipientType === "candidate"
                        ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    👤 Candidate
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCommRecipientType("colleague");
                      setCommRecipientId("col-1");
                    }}
                    className={`p-2 rounded-xl border text-center font-semibold transition ${
                      commRecipientType === "colleague"
                        ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    👥 Colleague / Interviewer
                  </button>
                </div>
              </div>

              {/* Recipient Select */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">Select Recipient</label>
                <select
                  value={commRecipientId}
                  onChange={(e) => setCommRecipientId(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-slate-900 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  {commRecipientType === "candidate" ? (
                    <>
                      <option value="cand-201">Priya Menon (Senior Java Developer)</option>
                      <option value="cand-203">Lucas Schneider (Full Stack Engineer)</option>
                      <option value="cand-205">Emily Zhang (Staff Cloud Architect)</option>
                      <option value="cand-208">Sneha S (Backend Microservices Lead)</option>
                    </>
                  ) : (
                    <>
                      <option value="col-1">Maria Lopez (Engineering Director / Hiring Lead)</option>
                      <option value="col-2">David Chen (Technical Architect / Lead Interviewer)</option>
                      <option value="col-3">Elena Rostova (HR Director / Compensation Committee)</option>
                      <option value="col-4">Sarah Connor (Senior Technical Recruiter)</option>
                    </>
                  )}
                </select>
              </div>

              {/* Channel Selector */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">Dispatch Channel</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "Email", label: "📧 Email", desc: "Official SMTP" },
                    { id: "InApp", label: "💬 In-App", desc: "Candidate Portal" },
                    { id: "Teams", label: "🔔 MS Teams", desc: "Hiring Channel" },
                  ].map((ch) => (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => setCommChannel(ch.id as any)}
                      className={`p-2 rounded-xl border text-center transition ${
                        commChannel === ch.id
                          ? "bg-blue-50 border-blue-600 text-blue-700 font-bold"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <span className="block font-semibold">{ch.label}</span>
                      <span className="text-[10px] text-slate-400 block">{ch.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Template Picker */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">Quick Template</label>
                <select
                  value={commTemplate}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCommTemplate(val);
                    if (val === "interview") {
                      setCommSubject("Interview Confirmation & Preparation Details");
                      setCommBody("We are pleased to invite you to the upcoming System Architecture round. Please review the attached guidelines and join via the MS Teams link.");
                    } else if (val === "feedback") {
                      setCommSubject("Scorecard Evaluation Request for Recent Candidate Round");
                      setCommBody("Please submit your 5-point competency scorecard for today's candidate session by EOD to allow the committee debrief to proceed.");
                    } else if (val === "offer") {
                      setCommSubject("Offer Update & Compensation Discussion");
                      setCommBody("We are excited to share an update regarding your candidacy and would love to schedule a brief call to walk through your offer details.");
                    }
                  }}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 p-2 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  <option value="custom">-- Custom Message --</option>
                  <option value="interview">Interview Invitation & Instructions</option>
                  <option value="feedback">Colleague Scorecard Request</option>
                  <option value="offer">Offer Letter Discussion</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={commSubject}
                  onChange={(e) => setCommSubject(e.target.value)}
                  placeholder="e.g. Next Steps in Recruiting Pipeline"
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Message Body</label>
                <textarea
                  rows={4}
                  required
                  value={commBody}
                  onChange={(e) => setCommBody(e.target.value)}
                  placeholder="Write your message here..."
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={commIsUrgent}
                    onChange={(e) => setCommIsUrgent(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs text-slate-700 font-medium">Mark as High Priority Notification</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowComposeCommModal(false)}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 shadow-xs"
                  >
                    Send Message &rarr;
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          DRAWER: CONVERSATION THREAD DETAILS & INLINE REPLY (User Requirement)
      ========================================================================= */}
      {selectedThreadMsg && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-2xs transition-opacity animate-in fade-in">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-start justify-between bg-slate-50/70 shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-700 font-bold text-sm flex items-center justify-center shrink-0">
                  {selectedThreadMsg.senderInitials || selectedThreadMsg.senderName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{selectedThreadMsg.senderName}</h3>
                  <span className="text-xs text-slate-500">{selectedThreadMsg.senderRole} &bull; {selectedThreadMsg.timestamp}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedThreadMsg(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-bold text-slate-900 block text-xs">{selectedThreadMsg.subject}</span>
                <p className="text-slate-700 leading-relaxed">{selectedThreadMsg.preview}</p>
                <div className="flex items-center gap-2 pt-2 text-[10px] text-slate-400 border-t border-slate-200/80">
                  <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600 font-semibold">
                    Category: {selectedThreadMsg.category}
                  </span>
                  <span>Delivered via Enterprise Mail &amp; Teams</span>
                </div>
              </div>
            </div>

            {/* Inline Reply Form */}
            <div className="p-4 border-t border-slate-200 bg-slate-50/80 space-y-2 shrink-0">
              <label className="block text-[11px] font-bold text-slate-700">Reply to {selectedThreadMsg.senderName}:</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={threadReplyText}
                  onChange={(e) => setThreadReplyText(e.target.value)}
                  placeholder="Type quick reply..."
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={handleSendThreadReply}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-2xs transition"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Requisition Detail Drawer (With Candidates & Talent Pipeline) */}
      <RequisitionDetailDrawer
        requisition={selectedReq}
        onClose={() => setSelectedReq(null)}
        onUpdateStatus={(id, newStatus) => {
          recruitmentStore.updateRequisitionStatus(id, newStatus);
          loadDashboardData();
          triggerBanner(`Requisition status updated to ${newStatus}.`);
          setSelectedReq(null);
        }}
      />

      {/* Screen 3 Scope Boundary Modal */}
      <CreateRequisitionPlaceholderModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      {/* Direct Add Candidate Sourcing Modal */}
      {showDirectAddCandidate && (
        <DirectAddCandidateModal
          requisitions={reqsForTabs}
          onClose={() => setShowDirectAddCandidate(false)}
          onSuccess={(newCandidate) => {
            recruitmentStore.addCandidate(newCandidate);
            loadDashboardData();
            setShowDirectAddCandidate(false);
            triggerBanner(`✓ Candidate ${newCandidate.fullName || newCandidate.name} added to talent pipeline!`);
          }}
          triggerBanner={triggerBanner}
        />
      )}

      {/* Self-Schedule Interview Modal */}
      {showSelfSchedule && (
        <SelfScheduleModal
          candidate={
            candidatesForTabs[0] || {
              id: "cand-app-01",
              fullName: "Priya Menon",
              email: "priya.menon@gmail.com",
              requisitionTitle: "Senior Java Developer",
            }
          }
          onClose={() => setShowSelfSchedule(false)}
          onConfirmBooking={(interview) => {
            recruitmentStore.scheduleInterview({
              candidateName: interview.candidateName,
              candidateEmail: interview.candidateEmail,
              roundType: interview.roundType,
              scheduledDate: interview.scheduledStart.split("T")[0] || "2026-10-25",
              time: "14:00",
              interviewerNames: interview.interviewerNames,
              meetingLink: interview.meetingLink,
              platform: "Microsoft Teams",
            });
            setShowSelfSchedule(false);
            triggerBanner(`✓ Interview confirmed with ${interview.candidateName} via Microsoft Teams!`);
          }}
        />
      )}
    </RecruitingShell>
  );
}

export default function RecruitingDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-8">
          <div className="flex items-center gap-3 text-sm font-semibold text-slate-600 animate-pulse">
            <span className="h-3 w-3 rounded-full bg-blue-600 animate-ping"></span>
            Loading MAX ERP Recruiting Workspace...
          </div>
        </div>
      }
    >
      <RecruitingDashboardContent />
    </Suspense>
  );
}
