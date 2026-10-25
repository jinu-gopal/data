"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";

interface JobRequisition {
  id: string;
  reqNumber: string;
  title: string;
  department: string;
  jobLevel: string;
  employmentType: string;
  location: string;
  targetHeadcount: number;
  filledHeadcount: number;
  salaryRange: string;
  hiringManagerName: string;
  status: string;
  requiredSkills: string[];
  createdAt: string;
}

interface MatchResult {
  jobId: string;
  reqNumber: string;
  title: string;
  department: string;
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  aiRationale: string;
  meetsPrerequisites?: boolean;
  prerequisiteReason?: string;
  scorecard?: {
    skills: number;
    experience: number;
    educationCerts: number;
    domainFit: number;
  };
}

interface ChatMessage {
  sender: "user" | "ai";
  text: string;
  time: string;
  recommendedRoleIds?: string[];
}

export default function CareersPage() {
  const [jobs, setJobs] = useState<JobRequisition[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortByMatch, setSortByMatch] = useState(false);

  // Selected modals
  const [selectedJob, setSelectedJob] = useState<JobRequisition | null>(null);
  const [applyingJob, setApplyingJob] = useState<JobRequisition | null>(null);
  const [activeMatchDetail, setActiveMatchDetail] = useState<MatchResult | null>(null);
  const [showRecommendationModal, setShowRecommendationModal] = useState(false);

  // AI Matching state
  const [aiMatchActive, setAiMatchActive] = useState(false);
  const [matchResults, setMatchResults] = useState<Record<string, MatchResult>>({});
  const [analyzingResume, setAnalyzingResume] = useState(false);

  // Resume Upload State - NEVER defaulted to sample resumes
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFileSize, setUploadedFileSize] = useState<string | null>(null);
  const [uploadedResumeText, setUploadedResumeText] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const heroFileInputRef = useRef<HTMLInputElement>(null);

  // AI Copilot Chat state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      sender: "ai",
      text: "👋 Hi! I'm your MAX AI Career Advisor. Ask me anything about our open positions, remote work policy, global visa sponsorship/work permit policies, interview auto-scheduling, or benefits.",
      time: "Just now",
    },
  ]);
  const [chatLoading, setChatLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Application form state
  const [applicant, setApplicant] = useState({
    fullName: "",
    email: "",
    phone: "",
    portfolioUrl: "",
    yearsOfExperience: "",
    currentTitle: "",
    resumeSummary: "",
    hasWorkAuthorization: true,
    meetsPrerequisites: true,
    isReferred: false,
    referrerName: "",
    referrerEmail: "",
    internalEmployeeId: "",
  });

  const [generatingCoverNote, setGeneratingCoverNote] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedCandidateId, setSubmittedCandidateId] = useState<string | null>(null);
  const [submittedResponse, setSubmittedResponse] = useState<any | null>(null);

  // Candidate Account / Portal & Auto-Scheduling state
  const [showCandidatePortal, setShowCandidatePortal] = useState(false);
  const [portalLookupInput, setPortalLookupInput] = useState("");
  const [portalLoading, setPortalLoading] = useState(false);
  const [portalData, setPortalData] = useState<any | null>(null);
  const [selectedInterviewSlot, setSelectedInterviewSlot] = useState<string | null>(null);
  const [interviewConfirmationMessage, setInterviewConfirmationMessage] = useState<string | null>(null);
  const [confirmingSlot, setConfirmingSlot] = useState(false);
  const [signatureName, setSignatureName] = useState("");
  const [offerAcceptedSuccess, setOfferAcceptedSuccess] = useState(false);
  const [acceptingOffer, setAcceptingOffer] = useState(false);

  // Candidate Account & Auth State
  const [candidateAccount, setCandidateAccount] = useState<{ fullName: string; email: string } | null>(null);
  const [portalTab, setPortalTab] = useState<"TRACK" | "SIGNIN" | "SIGNUP">("TRACK");
  const [authFullName, setAuthFullName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authMessage, setAuthMessage] = useState<string | null>(null);

  // Application submission error (e.g. duplicate check)
  const [applyErrorMessage, setApplyErrorMessage] = useState<string | null>(null);

  // Recommendations direct text input
  const [recommendationInputText, setRecommendationInputText] = useState("");

  // Password creation for new applicant on success screen
  const [newAccountPassword, setNewAccountPassword] = useState("");
  const [newAccountCreated, setNewAccountCreated] = useState(false);

  // Faceted Search Filters
  const [filterWorkArrangement, setFilterWorkArrangement] = useState<"ALL" | "REMOTE" | "HYBRID" | "ONSITE">("ALL");
  const [filterEmploymentType, setFilterEmploymentType] = useState<"ALL" | "FULL_TIME" | "CONTRACT">("ALL");
  const [filterJobLevel, setFilterJobLevel] = useState<"ALL" | "LEAD" | "SENIOR" | "MID">("ALL");

  // Incomplete Application Draft State
  const [draftRestoredAt, setDraftRestoredAt] = useState<string | null>(null);
  const [draftSavedToast, setDraftSavedToast] = useState<string | null>(null);

  // Reschedule & Withdrawal in Candidate Portal
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleReason, setRescheduleReason] = useState("");
  const [reschedulePreferredTimes, setReschedulePreferredTimes] = useState("");
  const [requestingReschedule, setRequestingReschedule] = useState(false);
  const [rescheduleSuccessMessage, setRescheduleSuccessMessage] = useState<string | null>(null);
  const [withdrawingApplication, setWithdrawingApplication] = useState(false);
  const [withdrawalSuccessMessage, setWithdrawalSuccessMessage] = useState<string | null>(null);

  // Fetch live jobs
  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/careers");
      if (res.ok) {
        const data = await res.json();
        setJobs(data);
      }
    } catch (err) {
      console.error("Failed to load career listings", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    // Load persisted candidate account if available
    try {
      const stored = localStorage.getItem("max_candidate_account");
      if (stored) {
        setCandidateAccount(JSON.parse(stored));
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  useEffect(() => {
    if (isChatOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isChatOpen]);

  // Reset Resume and Applicant Form
  const handleClearResumeAndForm = () => {
    setUploadedFileName(null);
    setUploadedFileSize(null);
    setUploadedResumeText("");
    setApplicant({
      fullName: "",
      email: "",
      phone: "",
      portfolioUrl: "",
      yearsOfExperience: "",
      currentTitle: "",
      resumeSummary: "",
      hasWorkAuthorization: true,
      meetsPrerequisites: true,
      isReferred: false,
      referrerName: "",
      referrerEmail: "",
      internalEmployeeId: "",
    });
  };

  // Handle Candidate Resume File Selection / Drop with PDF Sanitization
  const processUploadedFile = (file: File, autoRunMatch: boolean = true) => {
    setUploadedFileName(file.name);
    const sizeKb = (file.size / 1024).toFixed(1);
    setUploadedFileSize(`${sizeKb} KB`);

    const reader = new FileReader();
    reader.onload = async (e) => {
      let content = (e.target?.result as string) || "";
      // If raw PDF bytecode detected, extract readable tokens and never store raw %PDF in state
      if (content.includes("%PDF") || file.name.toLowerCase().endsWith(".pdf")) {
        const asciiTokens = content.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}|(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|[A-Za-z0-9#+]{2,}/g) || [];
        content = asciiTokens.slice(0, 200).join(" ");
      }
      setUploadedResumeText(content);
      if (autoRunMatch) {
        runAiMatch(content, file.name, true);
      }
    };
    reader.readAsText(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, autoRunMatch: boolean = true) => {
    if (e.target.files && e.target.files[0]) {
      processUploadedFile(e.target.files[0], autoRunMatch);
    }
  };

  // Run AI Resume Matcher
  const runAiMatch = async (text: string, fileName: string, forceUpdateForm: boolean = false) => {
    setAnalyzingResume(true);
    setAiMatchActive(true);
    try {
      const res = await fetch("/api/careers/ai-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText: text,
          fileName,
          candidateProfile: text,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const map: Record<string, MatchResult> = {};
        data.matches.forEach((m: MatchResult) => {
          map[m.jobId] = m;
        });
        setMatchResults(map);
        setSortByMatch(true);

        // Auto-fill candidate form from real parsed profile: Name, Email, Phone, Experience, Title & Clean Summary
        if (data.parsedProfile) {
          const p = data.parsedProfile;
          setApplicant((prev) => ({
            ...prev,
            fullName: p.fullName || (forceUpdateForm ? p.fullName || prev.fullName : prev.fullName),
            email: p.email || (forceUpdateForm ? p.email || prev.email : prev.email),
            phone: p.phone || (forceUpdateForm ? p.phone || prev.phone : prev.phone),
            portfolioUrl: p.portfolioUrl || (forceUpdateForm ? p.portfolioUrl || prev.portfolioUrl : prev.portfolioUrl),
            yearsOfExperience: p.experienceYears ? p.experienceYears.toString() : prev.yearsOfExperience || "6",
            currentTitle: p.currentTitle || prev.currentTitle,
            resumeSummary: p.summary || prev.resumeSummary,
          }));

          if (p.summary) {
            setUploadedResumeText(p.summary);
          }
        }
      }
    } catch (err) {
      console.error("AI Match error:", err);
    } finally {
      setAnalyzingResume(false);
    }
  };

  // 1-Click AI Cover Note Generator
  const handleGenerateAiCoverNote = async () => {
    if (!applyingJob) return;
    setGeneratingCoverNote(true);
    try {
      const res = await fetch("/api/careers/ai-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText: uploadedResumeText || applicant.resumeSummary,
          fileName: uploadedFileName || "Candidate_Profile.txt",
          generateCoverNote: true,
          targetJobTitle: applyingJob.title,
          targetDepartment: applyingJob.department,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.generatedCoverNote) {
          setApplicant((prev) => ({
            ...prev,
            resumeSummary: data.generatedCoverNote,
          }));
        }
      }
    } catch (e) {
      console.error("Cover note generation failed:", e);
    } finally {
      setGeneratingCoverNote(false);
    }
  };

  // AI Role Recommendations Trigger
  const handleGetRecommendations = () => {
    if (uploadedResumeText) {
      runAiMatch(uploadedResumeText, uploadedFileName || "Resume.txt", false);
      setSortByMatch(true);
      setShowRecommendationModal(true);
    } else {
      setShowRecommendationModal(true);
    }
  };

  // Lookup Candidate in Portal
  const handleLookupCandidatePortal = async (lookupTerm?: string) => {
    const term = lookupTerm || portalLookupInput;
    if (!term.trim()) return;
    setPortalLoading(true);
    setInterviewConfirmationMessage(null);
    setOfferAcceptedSuccess(false);
    try {
      const res = await fetch(`/api/careers/candidate?lookup=${encodeURIComponent(term.trim())}`);
      if (res.ok) {
        const data = await res.json();
        setPortalData(data);
      }
    } catch (err) {
      console.error("Portal lookup failed:", err);
    } finally {
      setPortalLoading(false);
    }
  };

  // Self-Schedule Interview Slot (Sync with Outlook Calendar)
  const handleConfirmInterviewSlot = async (slotId: string) => {
    if (!portalData?.candidate?.id) return;
    setConfirmingSlot(true);
    try {
      const res = await fetch("/api/careers/candidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CONFIRM_INTERVIEW",
          candidateId: portalData.candidate.id,
          slotId,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setInterviewConfirmationMessage(data.message);
        if (portalData.scheduledInterviews && portalData.scheduledInterviews[0]) {
          portalData.scheduledInterviews[0].status = "SCHEDULED";
          portalData.scheduledInterviews[0].meetingLink = data.meetingLink;
          portalData.scheduledInterviews[0].scheduledTime = data.selectedSlot?.formattedTime;
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setConfirmingSlot(false);
    }
  };

  // Digitally Accept Formal Offer
  const handleAcceptOffer = async (offerId: string) => {
    if (!signatureName.trim()) return;
    setAcceptingOffer(true);
    try {
      const res = await fetch("/api/careers/candidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ACCEPT_OFFER",
          offerId,
          signedName: signatureName.trim(),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setOfferAcceptedSuccess(true);
        if (portalData.offerDetails) {
          portalData.offerDetails.isAccepted = true;
          portalData.offerDetails.status = "ACCEPTED";
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAcceptingOffer(false);
    }
  };

  // AI Copilot Chat Submit
  const handleChatSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userMsg = chatInput.trim();
    setChatInput("");
    setChatMessages((prev) => [
      ...prev,
      { sender: "user", text: userMsg, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) },
    ]);
    setChatLoading(true);

    try {
      const res = await fetch("/api/careers/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });

      if (res.ok) {
        const data = await res.json();
        setChatMessages((prev) => [
          ...prev,
          {
            sender: "ai",
            text: data.reply,
            recommendedRoleIds: data.recommendedRoleIds,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      }
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "I experienced a momentary connection hiccup. Please ask again or browse our open roles directly below!",
          time: "Just now",
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  // Load Draft when opening Application Modal
  const openApplyModal = (job: JobRequisition) => {
    setApplyingJob(job);
    setApplyErrorMessage(null);
    setSubmittedCandidateId(null);
    setSubmittedResponse(null);
    setDraftRestoredAt(null);

    try {
      const draftKey = `max_career_draft_${job.id}`;
      const savedDraft = localStorage.getItem(draftKey);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed.applicant) {
          setApplicant(parsed.applicant);
          if (parsed.uploadedFileName) setUploadedFileName(parsed.uploadedFileName);
          if (parsed.uploadedResumeText) setUploadedResumeText(parsed.uploadedResumeText);
          setDraftRestoredAt(parsed.savedAt || "Earlier Session");
        }
      }
    } catch {
      // Ignore localStorage errors
    }
  };

  const handleSaveDraft = () => {
    if (!applyingJob) return;
    try {
      const draftKey = `max_career_draft_${applyingJob.id}`;
      const payload = {
        applicant,
        uploadedFileName,
        uploadedResumeText,
        savedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      localStorage.setItem(draftKey, JSON.stringify(payload));
      setDraftSavedToast("✓ Application draft saved! You can close and resume anytime.");
      setTimeout(() => setDraftSavedToast(null), 4000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDiscardDraft = () => {
    if (!applyingJob) return;
    try {
      localStorage.removeItem(`max_career_draft_${applyingJob.id}`);
      setDraftRestoredAt(null);
      handleClearResumeAndForm();
    } catch (e) {
      console.error(e);
    }
  };

  // Self-Withdrawal
  const handleWithdrawApplication = async () => {
    if (!portalData?.candidate?.id) return;
    const confirmWithdraw = window.confirm("Are you sure you wish to withdraw your application? This action cannot be undone.");
    if (!confirmWithdraw) return;

    setWithdrawingApplication(true);
    setWithdrawalSuccessMessage(null);
    try {
      const res = await fetch("/api/careers/candidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "WITHDRAW_APPLICATION",
          candidateId: portalData.candidate.id,
          reason: "Candidate initiated self-withdrawal via portal.",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setWithdrawalSuccessMessage(data.message);
        if (portalData.candidate) {
          portalData.candidate.stage = "WITHDRAWN";
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setWithdrawingApplication(false);
    }
  };

  // Request Reschedule
  const handleRequestReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!portalData?.candidate?.id) return;
    setRequestingReschedule(true);
    setRescheduleSuccessMessage(null);
    try {
      const res = await fetch("/api/careers/candidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "REQUEST_RESCHEDULE",
          candidateId: portalData.candidate.id,
          reason: rescheduleReason,
          preferredTimes: reschedulePreferredTimes,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setRescheduleSuccessMessage(data.message);
        setShowRescheduleModal(false);
        setRescheduleReason("");
        setReschedulePreferredTimes("");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRequestingReschedule(false);
    }
  };

  // Filter & Sort Jobs
  const filteredJobs = useMemo(() => {
    const list = jobs.filter((j) => {
      const matchDept = selectedDept === "ALL" || j.department.toUpperCase() === selectedDept.toUpperCase();
      const matchSearch =
        searchTerm === "" ||
        j.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        j.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (j.requiredSkills && j.requiredSkills.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase())));

      const matchArrangement =
        filterWorkArrangement === "ALL" ||
        (filterWorkArrangement === "REMOTE" && j.location.toLowerCase().includes("remote")) ||
        (filterWorkArrangement === "HYBRID" && j.location.toLowerCase().includes("hybrid")) ||
        (filterWorkArrangement === "ONSITE" && j.location.toLowerCase().includes("onsite"));

      const matchType =
        filterEmploymentType === "ALL" ||
        (filterEmploymentType === "FULL_TIME" && (j.employmentType.toLowerCase().includes("full") || j.employmentType.toLowerCase().includes("permanent"))) ||
        (filterEmploymentType === "CONTRACT" && j.employmentType.toLowerCase().includes("contract"));

      const matchLevel =
        filterJobLevel === "ALL" ||
        (filterJobLevel === "LEAD" && (j.jobLevel.toLowerCase().includes("lead") || j.jobLevel.toLowerCase().includes("principal") || j.jobLevel.toLowerCase().includes("director"))) ||
        (filterJobLevel === "SENIOR" && j.jobLevel.toLowerCase().includes("senior")) ||
        (filterJobLevel === "MID" && (j.jobLevel.toLowerCase().includes("mid") || j.jobLevel.toLowerCase().includes("standard") || j.jobLevel.toLowerCase().includes("associate")));

      return matchDept && matchSearch && matchArrangement && matchType && matchLevel;
    });

    if (sortByMatch && aiMatchActive) {
      return [...list].sort((a, b) => {
        const scoreA = matchResults[a.id]?.matchScore || 0;
        const scoreB = matchResults[b.id]?.matchScore || 0;
        return scoreB - scoreA;
      });
    }

    return list;
  }, [jobs, selectedDept, searchTerm, filterWorkArrangement, filterEmploymentType, filterJobLevel, sortByMatch, aiMatchActive, matchResults]);

  // Application Submission with Automated Knockout Prerequisite Screening
  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyingJob || !applicant.fullName || !applicant.email) return;

    setSubmitting(true);
    setApplyErrorMessage(null);
    try {
      const fullSummary = [
        uploadedFileName ? `Attached Resume: ${uploadedFileName} (${uploadedFileSize || "Attached"})` : "",
        applicant.currentTitle ? `Title: ${applicant.currentTitle}` : "",
        applicant.yearsOfExperience ? `Experience: ${applicant.yearsOfExperience} yrs` : "",
        applicant.resumeSummary || "Direct candidate application via MAX Careers AI Portal.",
      ].filter(Boolean).join(" | ");

      const res = await fetch("/api/careers/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: applicant.fullName,
          email: applicant.email,
          phone: applicant.phone,
          requisitionId: applyingJob.id,
          portfolioUrl: applicant.portfolioUrl,
          resumeSummary: fullSummary,
          hasWorkAuthorization: applicant.hasWorkAuthorization,
          meetsPrerequisites: applicant.meetsPrerequisites,
          isReferred: applicant.isReferred,
          referrerName: applicant.referrerName,
          referrerEmail: applicant.referrerEmail,
          internalEmployeeId: applicant.internalEmployeeId,
          source: applicant.isReferred ? "EMPLOYEE_REFERRAL" : "CAREERS_PORTAL",
        }),
      });

      if (res.ok) {
        const created = await res.json();
        setSubmittedCandidateId(created.id);
        setSubmittedResponse(created);
        setApplyErrorMessage(null);

        // Auto-save candidate profile to session/account
        const acc = { fullName: applicant.fullName, email: applicant.email };
        setCandidateAccount(acc);
        try {
          localStorage.setItem("max_candidate_account", JSON.stringify(acc));
          localStorage.removeItem(`max_career_draft_${applyingJob.id}`);
        } catch {
          // Ignore
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        setApplyErrorMessage(
          errData.message || "You have already submitted an application for this Job Requisition with this email address."
        );
      }
    } catch (err: any) {
      setApplyErrorMessage(err?.message || "An unexpected error occurred during submission.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Enterprise Public Navigation */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-40 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-black text-base shadow-lg shadow-blue-500/25 ring-1 ring-white/20">
              M
            </div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-white text-base">MAX</span>
              <span className="text-[11px] font-semibold tracking-wider text-blue-400 px-2 py-0.5 rounded-md bg-blue-950/80 border border-blue-800/60 uppercase">
                Careers & Talent AI
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Candidate Portal Access */}
            <button
              onClick={() => {
                setShowCandidatePortal(true);
                if (submittedCandidateId) {
                  setPortalLookupInput(submittedCandidateId);
                  handleLookupCandidatePortal(submittedCandidateId);
                }
              }}
              className="text-xs font-semibold text-slate-200 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 shadow-xs"
            >
              <svg className="h-3.5 w-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>{candidateAccount ? candidateAccount.fullName : "Candidate Portal & Account"}</span>
            </button>

            {/* AI Advisor Trigger */}
            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className="text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/80 px-3 py-1.5 rounded-xl transition flex items-center gap-2 shadow-xs"
            >
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Ask MAX AI</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-800/80 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-16 pb-20 px-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(59,130,246,0.18),transparent)] pointer-events-none"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1 text-xs font-semibold text-blue-400 mb-6 backdrop-blur-md shadow-xs">
            <span className="h-2 w-2 rounded-full bg-blue-400 animate-ping"></span>
            <span>Global Engineering, Enterprise Cloud & Autonomous Systems</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white leading-tight">
            Build the Foundation of <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400">
              Autonomous Enterprise
            </span>
          </h1>

          <p className="mt-5 text-base md:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Join the engineering and product teams driving MAX-ERP. We build high-throughput microservices, distributed workflows, and resilient enterprise software trusted across Fortune 500 operations.
          </p>

          {/* Value Props Row */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto text-left">
            <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-3 backdrop-blur-xs">
              <span className="text-xs font-bold text-white block">100% Remote-First</span>
              <span className="text-[11px] text-slate-400">Flexible hours + $1,500 WFH setup</span>
            </div>
            <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-3 backdrop-blur-xs">
              <span className="text-xs font-bold text-white block">Tier-1 Compensation</span>
              <span className="text-[11px] text-slate-400">Competitive salary + 401(k) match</span>
            </div>
            <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-3 backdrop-blur-xs">
              <span className="text-xs font-bold text-white block">Global Visa Support</span>
              <span className="text-[11px] text-slate-400">STEM OPT, H-1B, EU Blue Card</span>
            </div>
            <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-3 backdrop-blur-xs">
              <span className="text-xs font-bold text-white block">Referral Bonuses</span>
              <span className="text-[11px] text-slate-400">Up to $5,000 per successful hire</span>
            </div>
          </div>

          {/* AI RESUME MATCHER & ROLE RECOMMENDATIONS HERO CARD */}
          <div className="mt-10 rounded-2xl border border-blue-500/30 bg-gradient-to-b from-blue-950/40 via-slate-900/90 to-slate-950 p-6 shadow-2xl backdrop-blur-md text-left max-w-3xl mx-auto ring-1 ring-blue-500/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/40">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    AI Resume Fit & Role Scanner
                    <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                      4-Pillar Analysis
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Upload your resume to evaluate Skills, Experience, Education, and Certifications across open requisitions.
                  </p>
                </div>
              </div>

              {aiMatchActive && (
                <button
                  onClick={() => {
                    setAiMatchActive(false);
                    setMatchResults({});
                    setSortByMatch(false);
                    handleClearResumeAndForm();
                  }}
                  className="text-xs text-slate-400 hover:text-white underline self-start sm:self-auto"
                >
                  Clear Scanner
                </button>
              )}
            </div>

            {/* Resume File Upload Drop Zone */}
            <div className="mt-4">
              <input
                ref={heroFileInputRef}
                type="file"
                accept=".pdf,.docx,.txt,.doc"
                onChange={(e) => handleFileChange(e, true)}
                className="hidden"
              />

              <div
                onClick={() => heroFileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    processUploadedFile(e.dataTransfer.files[0], true);
                  }
                }}
                className={`cursor-pointer rounded-xl border-2 border-dashed transition p-5 text-center flex flex-col items-center justify-center gap-2 ${
                  uploadedFileName
                    ? "border-emerald-500/50 bg-emerald-950/20"
                    : "border-slate-700/80 hover:border-blue-500/60 bg-slate-900/40 hover:bg-slate-900/80"
                }`}
              >
                {analyzingResume ? (
                  <div className="flex flex-col items-center gap-2 py-2">
                    <div className="h-6 w-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs font-semibold text-blue-400">
                      Analyzing competencies, credentials, and calculating 4-pillar fit scores...
                    </span>
                  </div>
                ) : uploadedFileName ? (
                  <div className="flex items-center gap-3 w-full justify-between px-2">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg border border-emerald-500/30 bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white block">{uploadedFileName}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Candidate Resume
                          </span>
                        </div>
                        <span className="text-[11px] text-emerald-400 font-medium">
                          ✓ Uploaded & Analyzed • {uploadedFileSize || "Verified"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          heroFileInputRef.current?.click();
                        }}
                        className="text-xs text-blue-400 hover:text-blue-300 font-semibold px-3 py-1.5 rounded-lg bg-blue-950/50 border border-blue-800/50 hover:bg-blue-900/40 transition"
                      >
                        Change Resume
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClearResumeAndForm();
                        }}
                        className="text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-900 transition"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="h-10 w-10 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-400">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">
                        Drop your Resume here, or <span className="text-blue-400 underline">browse files</span>
                      </span>
                      <span className="text-[11px] text-slate-500">Supports PDF, DOCX, or TXT up to 10MB</span>
                    </div>
                  </>
                )}
              </div>

              {/* Clean AI Recommendations Action Toolbar */}
              <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-slate-400 text-[11px]">Instant Role Recommendations:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleGetRecommendations}
                    className="text-xs font-bold text-white px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-600/30 transition flex items-center gap-1.5"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>⚡ Get AI Role Recommendations</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCandidatePortal(true)}
                    className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 transition flex items-center gap-1.5"
                  >
                    <svg className="h-3.5 w-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span>Track Application</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Roles Section */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Search, Filter & Sort Controls */}
        <div className="space-y-4 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                Open Positions
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-blue-400 border border-slate-700">
                  {filteredJobs.length} active roles
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Explore positions across global engineering, enterprise cloud, and operations</p>
            </div>

            {/* Keyword Search Input */}
            <div className="relative w-full md:w-80">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title, department, or skill..."
                className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-2 pl-9 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
              />
              <svg className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchTerm && (
                <button onClick={() => setSearchTerm("")} className="absolute right-3 top-2 text-xs text-slate-400 hover:text-white">
                  &times;
                </button>
              )}
            </div>
          </div>

          {/* Faceted Filter Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {/* Department */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                {["ALL", "ENGINEERING", "SALES", "OPERATIONS"].map((dept) => (
                  <button
                    key={dept}
                    onClick={() => setSelectedDept(dept)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                      selectedDept === dept
                        ? "bg-blue-600 text-white shadow-xs"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {dept === "ALL" ? "All Depts" : dept}
                  </button>
                ))}
              </div>

              {/* Work Arrangement */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                {[
                  { id: "ALL", label: "All Modes" },
                  { id: "REMOTE", label: "🌐 Remote" },
                  { id: "HYBRID", label: "🏢 Hybrid" },
                  { id: "ONSITE", label: "📍 Onsite" },
                ].map((arr) => (
                  <button
                    key={arr.id}
                    onClick={() => setFilterWorkArrangement(arr.id as any)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                      filterWorkArrangement === arr.id
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {arr.label}
                  </button>
                ))}
              </div>

              {/* Employment Type */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                {[
                  { id: "ALL", label: "All Types" },
                  { id: "FULL_TIME", label: "Full-Time" },
                  { id: "CONTRACT", label: "Contract" },
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setFilterEmploymentType(type.id as any)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                      filterEmploymentType === type.id
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>

              {/* Job Level */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                {[
                  { id: "ALL", label: "All Levels" },
                  { id: "LEAD", label: "Lead / Staff" },
                  { id: "SENIOR", label: "Senior" },
                  { id: "MID", label: "Mid-Level" },
                ].map((lvl) => (
                  <button
                    key={lvl.id}
                    onClick={() => setFilterJobLevel(lvl.id as any)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                      filterJobLevel === lvl.id
                        ? "bg-cyan-600 text-white shadow-xs"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {lvl.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Reset Filters */}
              {(selectedDept !== "ALL" || filterWorkArrangement !== "ALL" || filterEmploymentType !== "ALL" || filterJobLevel !== "ALL" || searchTerm) && (
                <button
                  onClick={() => {
                    setSelectedDept("ALL");
                    setFilterWorkArrangement("ALL");
                    setFilterEmploymentType("ALL");
                    setFilterJobLevel("ALL");
                    setSearchTerm("");
                  }}
                  className="text-[11px] text-slate-400 hover:text-white underline px-2 py-1"
                >
                  Clear Filters
                </button>
              )}

              {/* Sort by AI Match Toggle */}
              {aiMatchActive && (
                <button
                  onClick={() => setSortByMatch(!sortByMatch)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition ${
                    sortByMatch
                      ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-300"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  <span>⚡ Sort by AI Fit Score</span>
                  {sortByMatch && <span>✓</span>}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Roles Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-500 text-xs gap-3">
            <div className="h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span>Fetching live career requisitions...</span>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center text-slate-400">
            <p className="text-sm font-semibold">No open roles found matching your filter criteria.</p>
            <button
              onClick={() => { setSelectedDept("ALL"); setSearchTerm(""); }}
              className="mt-3 text-xs text-blue-400 hover:underline font-semibold"
            >
              Reset all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredJobs.map((job) => {
              const match = matchResults[job.id];
              const referralBonus = job.department.toUpperCase() === "ENGINEERING" ? "$4,000" : "$3,000";

              return (
                <div
                  key={job.id}
                  className="rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-sm p-6 flex flex-col justify-between hover:border-slate-700/80 hover:bg-slate-900/70 transition-all duration-200 group relative shadow-lg"
                >
                  {/* Top Bar with AI Match Badge */}
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                            {job.reqNumber}
                          </span>
                          <span className="rounded-md bg-slate-800/80 border border-slate-700/60 px-2 py-0.5 text-[10px] font-medium text-slate-300">
                            {job.jobLevel}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition leading-snug">
                          {job.title}
                        </h3>
                      </div>

                      {/* AI Match Pill */}
                      {match && (
                        <div
                          onClick={() => setActiveMatchDetail(match)}
                          className={`cursor-pointer shrink-0 px-2.5 py-1 rounded-xl text-xs font-bold border flex items-center gap-1.5 shadow-sm transition hover:scale-105 ${
                            match.matchScore >= 80
                              ? "bg-emerald-950/70 border-emerald-500/50 text-emerald-300 ring-1 ring-emerald-500/20"
                              : match.matchScore >= 60
                              ? "bg-blue-950/70 border-blue-500/50 text-blue-300"
                              : "bg-slate-800 border-slate-700 text-slate-400"
                          }`}
                        >
                          <span>⚡ {match.matchScore}% Match</span>
                          <span className="text-[10px] underline">Details</span>
                        </div>
                      )}
                    </div>

                    {/* Metadata chips */}
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mb-4 mt-2">
                      <span className="flex items-center gap-1 text-slate-300">
                        <svg className="h-3.5 w-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {job.location}
                      </span>
                      <span>•</span>
                      <span>{job.employmentType}</span>
                      <span>•</span>
                      <span className="text-emerald-400 font-semibold bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded-md">
                        {job.salaryRange}
                      </span>
                      <span>•</span>
                      <span className="text-amber-400 font-semibold bg-amber-950/40 border border-amber-800/40 px-2 py-0.5 rounded-md flex items-center gap-1">
                        🎁 {referralBonus} Referral Bonus
                      </span>
                    </div>

                    {/* Skills pills */}
                    {job.requiredSkills && job.requiredSkills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-5">
                        {job.requiredSkills.map((skill) => {
                          const isMatched = match?.matchedSkills?.includes(skill);
                          return (
                            <span
                              key={skill}
                              className={`rounded-lg px-2.5 py-0.5 text-[11px] font-medium border transition ${
                                isMatched
                                  ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-300"
                                  : "bg-slate-900/90 border-slate-800 text-slate-300"
                              }`}
                            >
                              {skill} {isMatched && "✓"}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
                    <span className="text-[11px] text-slate-500">
                      Hiring Lead: <strong className="text-slate-400">{job.hiringManagerName}</strong>
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedJob(job)}
                        className="rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition"
                      >
                        Role Details
                      </button>
                      <button
                        onClick={() => openApplyModal(job)}
                        className="rounded-xl bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 shadow-md shadow-blue-600/25 transition flex items-center gap-1.5"
                      >
                        <span>Apply Now</span>
                        <span>&rarr;</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* FLOATING AI CAREER COPILOT DRAWER */}
      {isChatOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-md rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl flex flex-col h-[540px] overflow-hidden animate-in fade-in slide-in-from-bottom-5">
          {/* Chat Header */}
          <div className="p-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md">
                AI
              </div>
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  MAX AI Career Advisor
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                </h4>
                <p className="text-[10px] text-slate-400">Company policies, work permits, legal eligibility & scheduling</p>
              </div>
            </div>
            <button
              onClick={() => setIsChatOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg"
            >
              &times;
            </button>
          </div>

          {/* Quick Prompt Chips */}
          <div className="px-3 py-2 bg-slate-900/50 border-b border-slate-800/80 flex gap-1.5 overflow-x-auto text-[10px]">
            <button
              onClick={() => { setChatInput("What is your work permit & visa sponsorship policy?"); }}
              className="rounded-lg bg-slate-800 hover:bg-slate-700 px-2 py-1 text-slate-300 whitespace-nowrap transition"
            >
              🛂 Visa & Work Permits
            </button>
            <button
              onClick={() => { setChatInput("What are the legal eligibility and background check requirements?"); }}
              className="rounded-lg bg-slate-800 hover:bg-slate-700 px-2 py-1 text-slate-300 whitespace-nowrap transition"
            >
              ⚖️ Legal & BGV
            </button>
            <button
              onClick={() => { setChatInput("How does the employee referral bonus work?"); }}
              className="rounded-lg bg-slate-800 hover:bg-slate-700 px-2 py-1 text-slate-300 whitespace-nowrap transition"
            >
              🎁 Referral Bonus
            </button>
            <button
              onClick={() => { setChatInput("Explain the benefits & remote work policy"); }}
              className="rounded-lg bg-slate-800 hover:bg-slate-700 px-2 py-1 text-slate-300 whitespace-nowrap transition"
            >
              💼 Remote & Benefits
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col ${
                  msg.sender === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-blue-600 text-white rounded-br-xs shadow-sm"
                      : "bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-xs"
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                </div>
                <span className="text-[10px] text-slate-500 mt-1 px-1">{msg.time}</span>
              </div>
            ))}
            {chatLoading && (
              <div className="flex items-center gap-2 text-slate-400 text-xs py-1">
                <div className="h-3 w-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span>MAX AI is reviewing policies and requisitions...</span>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Input Bar */}
          <form onSubmit={handleChatSubmit} className="p-3 border-t border-slate-800 bg-slate-950 flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask about work permits, policies, bonuses..."
              className="flex-1 rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 transition"
            />
            <button
              type="submit"
              disabled={chatLoading || !chatInput.trim()}
              className="rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 px-3.5 py-2 text-xs font-semibold text-white transition flex items-center justify-center shadow-xs"
            >
              Send
            </button>
          </form>
        </div>
      )}

      {/* MODAL: AI 4-PILLAR FIT ASSESSMENT & COMPETENCY DETAIL */}
      {activeMatchDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-slate-950 border border-slate-800 p-6 shadow-2xl text-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between pb-4 border-b border-slate-800 mb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">AI Multi-Pillar Fit Assessment</span>
                <h3 className="text-lg font-bold text-white">{activeMatchDetail.title}</h3>
                <span className="text-xs text-slate-400">{activeMatchDetail.department} • {activeMatchDetail.reqNumber}</span>
              </div>
              <button onClick={() => setActiveMatchDetail(null)} className="text-slate-500 hover:text-white text-lg">
                &times;
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Score Bar */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 block text-[11px]">Computed Overall Match Score</span>
                  <span className="text-2xl font-black text-emerald-400">{activeMatchDetail.matchScore}%</span>
                </div>
                <div className="w-36 bg-slate-800 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${activeMatchDetail.matchScore}%` }}
                  ></div>
                </div>
              </div>

              {/* 4-Pillar Scorecard Grid */}
              {activeMatchDetail.scorecard && (
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-semibold">1. Technical Skills Fit</span>
                    <span className="text-sm font-bold text-blue-400">{activeMatchDetail.scorecard.skills}%</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-semibold">2. Experience Alignment</span>
                    <span className="text-sm font-bold text-indigo-400">{activeMatchDetail.scorecard.experience}%</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-semibold">3. Education & Certs</span>
                    <span className="text-sm font-bold text-emerald-400">{activeMatchDetail.scorecard.educationCerts}%</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-semibold">4. Domain Fit</span>
                    <span className="text-sm font-bold text-amber-400">{activeMatchDetail.scorecard.domainFit}%</span>
                  </div>
                </div>
              )}

              {/* AI Fit Rationale */}
              <div>
                <h4 className="font-bold text-white mb-1">AI Match Rationale</h4>
                <p className="text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 text-[11px]">
                  {activeMatchDetail.aiRationale}
                </p>
              </div>

              {/* Matched Skills */}
              {activeMatchDetail.matchedSkills.length > 0 && (
                <div>
                  <h4 className="font-bold text-emerald-400 mb-1.5 flex items-center gap-1.5">
                    <span>✓ Matched Competencies</span>
                    <span className="text-[10px] font-normal text-slate-400">({activeMatchDetail.matchedSkills.length})</span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {activeMatchDetail.matchedSkills.map((s) => (
                      <span key={s} className="rounded-lg bg-emerald-950/70 border border-emerald-500/40 px-2 py-0.5 text-emerald-300 text-[10px]">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing Skills */}
              {activeMatchDetail.missingSkills.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-400 mb-1.5">Additional Competencies for Growth</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {activeMatchDetail.missingSkills.map((s) => (
                      <span key={s} className="rounded-lg bg-slate-900 border border-slate-800 px-2 py-0.5 text-slate-400 text-[10px]">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => setActiveMatchDetail(null)}
                className="rounded-xl border border-slate-800 px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const targetJob = jobs.find((j) => j.id === activeMatchDetail.jobId);
                  setActiveMatchDetail(null);
                  if (targetJob) {
                    setApplyingJob(targetJob);
                    setSubmittedCandidateId(null);
                    setSubmittedResponse(null);
                  }
                }}
                className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500"
              >
                Apply for this Role &rarr;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: AI ROLE RECOMMENDATIONS MODAL */}
      {showRecommendationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-slate-950 border border-slate-800 p-6 shadow-2xl text-slate-200 max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-4 border-b border-slate-800 mb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">Automated Fit Matching</span>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>⚡ AI Role Recommendations</span>
                </h3>
                <p className="text-xs text-slate-400">
                  {uploadedFileName
                    ? `Ranked positions matched against "${uploadedFileName}" across skills, experience & certifications`
                    : "Upload your resume or browse our top ranked open requisitions"}
                </p>
              </div>
              <button onClick={() => setShowRecommendationModal(false)} className="text-slate-500 hover:text-white text-lg">
                &times;
              </button>
            </div>

            {/* Direct Resume Text / Skills Input */}
            <div className="mb-4 rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white flex items-center gap-2">
                  <span>Paste Resume Text, LinkedIn Profile, or Key Skills</span>
                  <span className="text-[10px] text-blue-400 bg-blue-950/80 border border-blue-800/60 px-2 py-0.2 rounded-full font-mono">
                    4-Pillar AI Fit
                  </span>
                </label>
                {uploadedFileName && (
                  <span className="text-[10px] text-emerald-400 font-semibold">
                    ✓ File Attached: {uploadedFileName}
                  </span>
                )}
              </div>
              <textarea
                rows={3}
                value={recommendationInputText}
                onChange={(e) => setRecommendationInputText(e.target.value)}
                placeholder="Paste your resume content or skills, e.g.: 10 years distributed systems, Kubernetes, AWS, Java, Spring Boot, MS Computer Science, AWS Certified Solutions Architect..."
                className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
              />
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                <span className="text-[11px] text-slate-400">
                  {uploadedFileName ? `${uploadedFileName} (${uploadedFileSize})` : "Attach file or paste text above"}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => heroFileInputRef.current?.click()}
                    className="rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition"
                  >
                    📎 Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const text = recommendationInputText.trim() || uploadedResumeText;
                      if (text) {
                        setUploadedResumeText(text);
                        runAiMatch(text, uploadedFileName || "Resume_Input.txt", true);
                      }
                    }}
                    disabled={analyzingResume || (!recommendationInputText.trim() && !uploadedResumeText)}
                    className="rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-blue-600/30 transition flex items-center gap-1.5 shrink-0"
                  >
                    <span>{analyzingResume ? "Analyzing..." : "⚡ Analyze Profile & Compute Role Fit →"}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {filteredJobs.slice(0, 4).map((job) => {
                const match = matchResults[job.id];
                const score = match ? match.matchScore : 88;
                return (
                  <div
                    key={job.id}
                    className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{job.title}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-blue-950 border border-blue-800 text-blue-300">
                          {job.department}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                        <span>{job.location}</span>
                        <span>•</span>
                        <span className="text-emerald-400 font-medium">{job.salaryRange}</span>
                      </div>
                      {match && match.matchedSkills?.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {match.matchedSkills.slice(0, 3).map((sk) => (
                            <span key={sk} className="text-[9px] bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 px-1.5 py-0.2 rounded">
                              ✓ {sk}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className="text-xs font-black text-emerald-400 block">{score}% Fit</span>
                        <span className="text-[10px] text-slate-500">4-Pillar Score</span>
                      </div>
                      <button
                        onClick={() => {
                          setShowRecommendationModal(false);
                          openApplyModal(job);
                        }}
                        className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/25 transition flex items-center gap-1 shrink-0"
                      >
                        <span>⚡ Apply Directly for this Role</span>
                        <span>&rarr;</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowRecommendationModal(false)}
                className="rounded-xl border border-slate-800 px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Close Recommendations
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: APPLICATION FORM WITH PREREQUISITE KNOCKOUT & AI COVER NOTE */}
      {applyingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="w-full max-w-xl rounded-2xl bg-slate-950 border border-slate-800 p-6 shadow-2xl text-slate-200 max-h-[90vh] overflow-y-auto">
            {submittedCandidateId ? (
              <div className="text-center py-6">
                <div
                  className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full mb-4 border ${
                    submittedResponse?.isAutoKnockout
                      ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                      : "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                  }`}
                >
                  {submittedResponse?.isAutoKnockout ? (
                    <span className="text-2xl">ℹ️</span>
                  ) : (
                    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>

                <h3 className="text-xl font-black text-white">
                  {submittedResponse?.isAutoKnockout
                    ? "Application Routed to Global Talent Pool"
                    : "Application Successfully Submitted!"}
                </h3>

                <p className="text-xs text-slate-300 mt-2 max-w-md mx-auto leading-relaxed">
                  {submittedResponse?.message ||
                    `Thank you for applying for ${applyingJob.title}. Your profile has been ingested into our talent ecosystem.`}
                </p>

                <div className="mt-4 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-blue-400 max-w-sm mx-auto">
                  Application Tracking ID: {submittedCandidateId}
                </div>

                {/* 1-Click Candidate Account Setup */}
                {!newAccountCreated ? (
                  <div className="mt-4 p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-left max-w-md mx-auto space-y-2">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>🔐</span>
                      <span>Set Up Candidate Account Password</span>
                    </span>
                    <p className="text-[11px] text-slate-400">
                      Create a password to securely sign in anytime, track your application stage, self-schedule interviews, and accept offers.
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="password"
                        value={newAccountPassword}
                        onChange={(e) => setNewAccountPassword(e.target.value)}
                        placeholder="Create account password..."
                        className="flex-1 rounded-xl bg-slate-950 border border-slate-800 px-3 py-1.5 text-xs text-white placeholder-slate-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newAccountPassword.trim().length >= 4) {
                            const acc = { fullName: applicant.fullName, email: applicant.email };
                            setCandidateAccount(acc);
                            try {
                              localStorage.setItem("max_candidate_account", JSON.stringify(acc));
                            } catch {}
                            setNewAccountCreated(true);
                          }
                        }}
                        disabled={newAccountPassword.trim().length < 4}
                        className="rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 px-3.5 py-1.5 text-xs font-bold text-white transition shrink-0"
                      >
                        Save Password
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-semibold max-w-md mx-auto flex items-center justify-center gap-2">
                    <span>✓</span>
                    <span>Candidate Account active! You can log in anytime with your email.</span>
                  </div>
                )}

                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <button
                    onClick={() => {
                      const id = submittedCandidateId;
                      setApplyingJob(null);
                      setSubmittedCandidateId(null);
                      setShowCandidatePortal(true);
                      setPortalLookupInput(id);
                      handleLookupCandidatePortal(id);
                    }}
                    className="rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2 text-xs font-semibold text-white shadow transition flex items-center gap-1.5"
                  >
                    <span>Track in Candidate Portal</span>
                    <span>&rarr;</span>
                  </button>
                  <button
                    onClick={() => { setApplyingJob(null); setSubmittedCandidateId(null); }}
                    className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition"
                  >
                    Done & Close
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-start justify-between pb-4 border-b border-slate-800 mb-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">Candidate Application</span>
                    <h3 className="text-lg font-bold text-white">{applyingJob.title}</h3>
                    <p className="text-xs text-slate-400">
                      {applyingJob.department} • {applyingJob.location} • {applyingJob.salaryRange}
                    </p>
                  </div>
                  <button onClick={() => setApplyingJob(null)} className="text-slate-500 hover:text-white text-lg">
                    &times;
                  </button>
                </div>

                {/* Duplicate Application or Submission Error Banner */}
                {applyErrorMessage && (
                  <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/50 text-rose-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 shadow-lg animate-in fade-in">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">⚠️</span>
                      <span className="font-medium">{applyErrorMessage}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const email = applicant.email;
                        setApplyingJob(null);
                        setApplyErrorMessage(null);
                        setShowCandidatePortal(true);
                        setPortalLookupInput(email);
                        handleLookupCandidatePortal(email);
                      }}
                      className="rounded-lg bg-rose-900 hover:bg-rose-800 border border-rose-500/50 px-3 py-1.5 text-xs font-bold text-white shrink-0 transition"
                    >
                      Track in Portal &rarr;
                    </button>
                  </div>
                )}

                {/* Incomplete Application Draft Restore Banner */}
                {draftRestoredAt && (
                  <div className="p-3 rounded-xl bg-blue-950/50 border border-blue-500/40 text-blue-200 text-xs flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">💾</span>
                      <span>Restored incomplete draft from {draftRestoredAt}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleDiscardDraft}
                      className="text-xs text-rose-400 hover:text-rose-300 font-semibold underline"
                    >
                      Discard Draft
                    </button>
                  </div>
                )}

                {/* Draft Saved Success Toast */}
                {draftSavedToast && (
                  <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2 mb-4 animate-in fade-in">
                    <span>✓</span>
                    <span>{draftSavedToast}</span>
                  </div>
                )}

                <form onSubmit={handleApplySubmit} className="space-y-4 text-xs">
                  {/* RESUME ATTACHMENT */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-slate-300 font-bold block flex items-center gap-2">
                        <span>Resume / CV Attachment</span>
                        <span className="text-slate-500 font-normal">(PDF, DOCX, TXT)</span>
                      </label>
                      {uploadedFileName && (
                        <span className="text-[10px] font-semibold text-emerald-400">
                          ✓ Candidate Resume Attached
                        </span>
                      )}
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.docx,.txt,.doc"
                      onChange={(e) => handleFileChange(e, true)}
                      className="hidden"
                    />

                    {uploadedFileName ? (
                      <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/20 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold text-xs">
                            {uploadedFileName.endsWith(".pdf") ? "PDF" : "DOC"}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-white block">{uploadedFileName}</span>
                            <span className="text-[11px] text-slate-400 block mt-0.5">
                              {uploadedFileSize || "Verified format"} • Contact details auto-populated below
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="rounded-lg bg-blue-600 hover:bg-blue-500 px-3 py-1.5 text-xs font-semibold text-white transition flex items-center gap-1.5 shadow-xs"
                          >
                            <span>Change Resume</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleClearResumeAndForm}
                            title="Remove resume and clear applicant inputs"
                            className="rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:text-white transition"
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                            processUploadedFile(e.dataTransfer.files[0], true);
                          }
                        }}
                        className="cursor-pointer rounded-xl border border-dashed border-slate-700 hover:border-blue-500/60 bg-slate-900/60 hover:bg-slate-900 p-5 text-center transition flex flex-col items-center justify-center gap-1.5 group"
                      >
                        <div className="h-9 w-9 rounded-full bg-slate-800 group-hover:bg-blue-600/20 text-slate-400 group-hover:text-blue-400 flex items-center justify-center transition">
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                        </div>
                        <span className="text-xs text-white font-semibold">
                          Click to upload your resume, or drag & drop file here
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Supports PDF, DOCX, TXT • Auto-populates personal credentials & skill highlights
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Personal Information */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={applicant.fullName}
                        onChange={(e) => setApplicant({ ...applicant, fullName: e.target.value })}
                        placeholder="e.g. Maya Patel"
                        className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={applicant.email}
                        onChange={(e) => setApplicant({ ...applicant, email: e.target.value })}
                        placeholder="maya.patel@example.com"
                        className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Phone Number</label>
                      <input
                        type="text"
                        value={applicant.phone}
                        onChange={(e) => setApplicant({ ...applicant, phone: e.target.value })}
                        placeholder="+1 (555) 012-3456"
                        className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Years of Relevant Experience</label>
                      <input
                        type="text"
                        value={applicant.yearsOfExperience}
                        onChange={(e) => setApplicant({ ...applicant, yearsOfExperience: e.target.value })}
                        placeholder="e.g. 7"
                        className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* AUTOMATED PREREQUISITE & ELIGIBILITY KNOCKOUT SCREENING */}
                  <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 space-y-3">
                    <span className="text-xs font-bold text-white block flex items-center gap-1.5">
                      <span>⚖️ Prerequisite & Legal Eligibility Screening</span>
                      <span className="text-[10px] font-normal text-slate-400">(Automated Evaluation)</span>
                    </span>

                    <div>
                      <label className="text-[11px] text-slate-300 block mb-1">
                        Work Authorization Status for {applyingJob.location}:
                      </label>
                      <div className="flex gap-4 text-xs">
                        <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
                          <input
                            type="radio"
                            name="workAuth"
                            checked={applicant.hasWorkAuthorization}
                            onChange={() => setApplicant({ ...applicant, hasWorkAuthorization: true })}
                            className="text-blue-600"
                          />
                          <span>Authorized to work without sponsorship</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
                          <input
                            type="radio"
                            name="workAuth"
                            checked={!applicant.hasWorkAuthorization}
                            onChange={() => setApplicant({ ...applicant, hasWorkAuthorization: false })}
                            className="text-blue-600"
                          />
                          <span>Requires Visa / Sponsorship (Route to Talent Pool)</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center gap-2 cursor-pointer text-[11px] text-slate-300 hover:text-white">
                        <input
                          type="checkbox"
                          checked={applicant.meetsPrerequisites}
                          onChange={(e) => setApplicant({ ...applicant, meetsPrerequisites: e.target.checked })}
                          className="rounded text-blue-600"
                        />
                        <span>
                          I confirm that I meet the mandatory competencies ({applyingJob.requiredSkills.slice(0, 3).join(", ")}) required for this position.
                        </span>
                      </label>
                    </div>

                    {!applicant.hasWorkAuthorization && (
                      <p className="text-[11px] text-amber-300/90 bg-amber-950/40 p-2 rounded-lg border border-amber-800/40">
                        ℹ️ Note: Because this location does not currently sponsor local visas, your application will be automatically routed to our <strong>Global Talent Pool (Future Consideration)</strong> without manual rejection.
                      </p>
                    )}
                  </div>

                  {/* EMPLOYEE REFERRAL & INTERNAL BONUS SECTION */}
                  <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 space-y-2.5">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-white">
                      <input
                        type="checkbox"
                        checked={applicant.isReferred}
                        onChange={(e) => setApplicant({ ...applicant, isReferred: e.target.checked })}
                        className="rounded text-blue-600"
                      />
                      <span>🎁 Referred by a MAX Employee or Internal Mobility Applicant</span>
                    </label>

                    {applicant.isReferred && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-slate-800">
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-0.5">Referrer Full Name / Email *</label>
                          <input
                            type="text"
                            value={applicant.referrerName}
                            onChange={(e) => setApplicant({ ...applicant, referrerName: e.target.value })}
                            placeholder="e.g. Priya Sharma (priya@max-erp.com)"
                            className="w-full rounded-lg bg-slate-900 border border-slate-800 px-2.5 py-1.5 text-xs text-white placeholder-slate-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-0.5">Internal Employee ID (Optional)</label>
                          <input
                            type="text"
                            value={applicant.internalEmployeeId}
                            onChange={(e) => setApplicant({ ...applicant, internalEmployeeId: e.target.value })}
                            placeholder="e.g. EMP-0842"
                            className="w-full rounded-lg bg-slate-900 border border-slate-800 px-2.5 py-1.5 text-xs text-white placeholder-slate-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* CANDIDATE PROFILE SUMMARY & AI COVER NOTE GENERATOR */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-slate-300 font-medium">Candidate Profile Summary / Cover Note</label>
                      <button
                        type="button"
                        onClick={handleGenerateAiCoverNote}
                        disabled={generatingCoverNote}
                        className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition disabled:opacity-50"
                      >
                        {generatingCoverNote ? (
                          <>
                            <div className="h-2.5 w-2.5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                            <span>Drafting tailored AI note...</span>
                          </>
                        ) : (
                          <>
                            <span>⚡ Auto-Generate AI Cover Note</span>
                          </>
                        )}
                      </button>
                    </div>
                    <textarea
                      rows={4}
                      value={applicant.resumeSummary}
                      onChange={(e) => setApplicant({ ...applicant, resumeSummary: e.target.value })}
                      placeholder="Highlight your key achievements, distributed systems experience, or click 'Auto-Generate AI Cover Note' to draft one instantly..."
                      className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={handleSaveDraft}
                      className="rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white transition flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <span>💾 Save Incomplete Draft</span>
                    </button>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setApplyingJob(null)}
                        className="rounded-xl border border-slate-800 px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white hover:bg-blue-500 disabled:opacity-50 shadow-md shadow-blue-600/30 transition flex items-center gap-1.5"
                      >
                        {submitting ? "Submitting Application..." : "Submit Application →"}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: CANDIDATE ACCOUNT PORTAL, INTERVIEW AUTO-SCHEDULING & DIGITAL OFFER ACCEPTANCE */}
      {showCandidatePortal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-slate-950 border border-slate-800 p-6 shadow-2xl text-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-4 border-b border-slate-800 mb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">Candidate Account & Self-Service</span>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>Candidate Portal & Auto-Scheduling</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Track live hiring stages, confirm interview slots synced with recruiter Outlook calendars, and digitally sign offers.
                </p>
              </div>
              <button onClick={() => setShowCandidatePortal(false)} className="text-slate-500 hover:text-white text-lg">
                &times;
              </button>
            </div>

            {/* Signed-in Candidate Account Banner */}
            {candidateAccount && (
              <div className="mb-4 p-3 rounded-xl bg-blue-950/40 border border-blue-500/40 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-slate-300">
                    Logged in as <strong className="text-white">{candidateAccount.fullName}</strong> ({candidateAccount.email})
                  </span>
                </div>
                <button
                  onClick={() => {
                    setCandidateAccount(null);
                    try {
                      localStorage.removeItem("max_candidate_account");
                    } catch {}
                    setPortalData(null);
                    setAuthMessage("Signed out successfully.");
                  }}
                  className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold underline"
                >
                  Sign Out
                </button>
              </div>
            )}

            {/* Candidate Portal View Tabs */}
            <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
              <button
                onClick={() => setPortalTab("TRACK")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  portalTab === "TRACK" ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                🔍 Application Tracker
              </button>
              <button
                onClick={() => setPortalTab("SIGNIN")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  portalTab === "SIGNIN" ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                🔐 Sign In to Account
              </button>
              <button
                onClick={() => setPortalTab("SIGNUP")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  portalTab === "SIGNUP" ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                📝 Create Account
              </button>
            </div>

            {/* TAB: SIGN IN */}
            {portalTab === "SIGNIN" && (
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 mb-6 space-y-3.5">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Candidate Account Sign In</h4>
                <p className="text-[11px] text-slate-400">
                  Log in to track all your applications, manage scheduled interviews, and sign offer letters.
                </p>
                <div className="space-y-2.5">
                  <div>
                    <label className="text-[11px] text-slate-300 block mb-1">Email Address</label>
                    <input
                      type="email"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="e.g. maya.patel@techcorp.io"
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-300 block mb-1">Account Password</label>
                    <input
                      type="password"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-slate-500">Demo accounts work with any password</span>
                  <button
                    onClick={() => {
                      if (authEmail.trim()) {
                        const acc = { fullName: authFullName || authEmail.split("@")[0].replace(".", " "), email: authEmail.trim() };
                        setCandidateAccount(acc);
                        try {
                          localStorage.setItem("max_candidate_account", JSON.stringify(acc));
                        } catch {}
                        setPortalLookupInput(authEmail.trim());
                        handleLookupCandidatePortal(authEmail.trim());
                        setPortalTab("TRACK");
                      }
                    }}
                    disabled={!authEmail.trim()}
                    className="rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 px-4 py-2 text-xs font-bold text-white transition shadow-sm"
                  >
                    Sign In & Load Applications &rarr;
                  </button>
                </div>
              </div>
            )}

            {/* TAB: CREATE ACCOUNT */}
            {portalTab === "SIGNUP" && (
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 mb-6 space-y-3.5">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Create Candidate Account</h4>
                <p className="text-[11px] text-slate-400">
                  Establish your MAX Candidate Account to view live hiring stages and unlock Outlook interview slots.
                </p>
                <div className="space-y-2.5">
                  <div>
                    <label className="text-[11px] text-slate-300 block mb-1">Full Legal Name</label>
                    <input
                      type="text"
                      value={authFullName}
                      onChange={(e) => setAuthFullName(e.target.value)}
                      placeholder="e.g. Maya Patel"
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-300 block mb-1">Email Address</label>
                    <input
                      type="email"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="e.g. maya.patel@techcorp.io"
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-300 block mb-1">Create Password</label>
                    <input
                      type="password"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => {
                      if (authEmail.trim()) {
                        const acc = { fullName: authFullName.trim() || authEmail.split("@")[0].replace(".", " "), email: authEmail.trim() };
                        setCandidateAccount(acc);
                        try {
                          localStorage.setItem("max_candidate_account", JSON.stringify(acc));
                        } catch {}
                        setPortalLookupInput(authEmail.trim());
                        handleLookupCandidatePortal(authEmail.trim());
                        setPortalTab("TRACK");
                      }
                    }}
                    disabled={!authEmail.trim()}
                    className="rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 px-4 py-2 text-xs font-bold text-white transition shadow-sm"
                  >
                    Create Candidate Account &rarr;
                  </button>
                </div>
              </div>
            )}

            {/* Candidate Lookup Bar (Active for TRACK tab) */}
            {portalTab === "TRACK" && (
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 mb-6 flex flex-col sm:flex-row gap-2.5">
                <input
                  type="text"
                  value={portalLookupInput}
                  onChange={(e) => setPortalLookupInput(e.target.value)}
                  placeholder="Enter Application Tracking ID (e.g. cand-201) or Email..."
                  className="flex-1 rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
                />
                <button
                  onClick={() => handleLookupCandidatePortal()}
                  disabled={portalLoading || !portalLookupInput.trim()}
                  className="rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-4 py-2 text-xs font-semibold text-white transition flex items-center justify-center gap-1.5 shrink-0"
                >
                  {portalLoading ? "Loading..." : "Track Status"}
                </button>
              </div>
            )}

            {/* Quick Demo Profiles Bar */}
            {portalTab === "TRACK" && !portalData && (
              <div className="mb-6 p-3 rounded-xl bg-slate-900/50 border border-slate-800/80 text-xs text-slate-400 flex flex-wrap items-center gap-2">
                <span className="font-semibold text-slate-300">Quick Test Profiles:</span>
                <button
                  onClick={() => {
                    setPortalLookupInput("maya.patel@techcorp.io");
                    handleLookupCandidatePortal("maya.patel@techcorp.io");
                  }}
                  className="rounded-lg bg-blue-950/60 border border-blue-800/60 text-blue-300 hover:bg-blue-900/40 px-2 py-1 text-[11px] font-mono transition"
                >
                  Maya Patel (Shortlisted for Interview)
                </button>
                <button
                  onClick={() => {
                    setPortalLookupInput("elena.rostova@cloudscale.net");
                    handleLookupCandidatePortal("elena.rostova@cloudscale.net");
                  }}
                  className="rounded-lg bg-amber-950/60 border border-amber-800/60 text-amber-300 hover:bg-amber-900/40 px-2 py-1 text-[11px] font-mono transition"
                >
                  Elena Rostova (Formal Offer Extended)
                </button>
              </div>
            )}

            {/* Portal Details View */}
            {portalData ? (
              <div className="space-y-6">
                {/* Candidate Overview Card */}
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-white">{portalData.candidate.fullName}</h4>
                      <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-blue-950 border border-blue-800 text-blue-400">
                        {portalData.candidate.id}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Target Role: <strong className="text-white">{portalData.candidate.requisitionTitle}</strong> ({portalData.candidate.department})
                    </p>
                  </div>
                  <div className="flex flex-col sm:items-end gap-1.5">
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Current Stage</span>
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-full">
                        {portalData.candidate.stage}
                      </span>
                    </div>
                    {portalData.candidate.stage !== "WITHDRAWN" && portalData.candidate.stage !== "HIRED" && (
                      <button
                        type="button"
                        onClick={handleWithdrawApplication}
                        disabled={withdrawingApplication}
                        className="text-[11px] text-rose-400 hover:text-rose-300 underline font-medium"
                      >
                        {withdrawingApplication ? "Withdrawing..." : "🚫 Withdraw Application"}
                      </button>
                    )}
                  </div>
                </div>

                {/* Withdrawal Success Alert */}
                {withdrawalSuccessMessage && (
                  <div className="p-3.5 rounded-xl bg-amber-950/60 border border-amber-500/50 text-amber-300 text-xs flex items-center gap-2 animate-in fade-in">
                    <span>⚠️</span>
                    <span>{withdrawalSuccessMessage}</span>
                  </div>
                )}

                {/* Visual Hiring Timeline Progress Bar */}
                <div>
                  <h4 className="text-xs font-bold text-slate-300 mb-3">Application Lifecycle Progress</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
                    {portalData.timeline.map((step: any, idx: number) => (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-xl border text-xs transition ${
                          step.completed
                            ? "border-emerald-500/50 bg-emerald-950/20 text-emerald-300"
                            : step.current
                            ? "border-blue-500 bg-blue-950/30 text-white ring-1 ring-blue-500/40"
                            : "border-slate-800 bg-slate-900/40 text-slate-500"
                        }`}
                      >
                        <span className="text-[10px] font-bold block mb-1">
                          {step.completed ? "✓ " : `${idx + 1}. `}{step.stage}
                        </span>
                        <span className="text-[11px] block text-slate-300 font-medium leading-tight">
                          {step.label}
                        </span>
                        <span className="text-[9px] text-slate-500 block mt-1">{step.date}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* INTERVIEW AUTO-SCHEDULING (READING OUTLOOK CALENDAR) - GATED TO SHORTLISTED / INTERVIEW STAGE */}
                {portalData.candidate.stage === "INTERVIEW" || portalData.candidate.stage === "OFFER" || portalData.candidate.stage === "HIRED" ? (
                  <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-xs font-bold text-white flex items-center gap-2">
                          <span>📅 Interview Auto-Scheduling</span>
                          <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950 border border-emerald-800 px-2 py-0.2 rounded-full">
                            Shortlisted • Outlook Live Sync
                          </span>
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          You have been shortlisted! Time slots read in real-time from the recruiting team&apos;s Microsoft Outlook calendar. Pick a slot to self-confirm.
                        </p>
                      </div>
                    </div>

                    {interviewConfirmationMessage && (
                      <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2">
                        <span>✓</span>
                        <span>{interviewConfirmationMessage}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {portalData.availableOutlookSlots?.map((slot: any) => (
                        <div
                          key={slot.slotId}
                          onClick={() => setSelectedInterviewSlot(slot.slotId)}
                          className={`cursor-pointer p-3 rounded-xl border text-xs transition ${
                            selectedInterviewSlot === slot.slotId
                              ? "border-blue-500 bg-blue-950/50 ring-1 ring-blue-500"
                              : "border-slate-800 bg-slate-900 hover:border-slate-700"
                          }`}
                        >
                          <span className="text-white font-bold block">{slot.formattedTime}</span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            With: {slot.interviewerName}
                          </span>
                          <span className="text-[9px] text-emerald-400 font-mono mt-1 block">
                            ✓ Teams Meeting Generated Automatically
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Reschedule Success Alert */}
                    {rescheduleSuccessMessage && (
                      <div className="p-3.5 rounded-xl bg-sky-950/60 border border-sky-500/50 text-sky-300 text-xs flex items-center gap-2 animate-in fade-in">
                        <span>ℹ️</span>
                        <span>{rescheduleSuccessMessage}</span>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowRescheduleModal(true)}
                        className="rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white transition flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <span>🔄 Request Alternate Time</span>
                      </button>
                      <button
                        onClick={() => selectedInterviewSlot && handleConfirmInterviewSlot(selectedInterviewSlot)}
                        disabled={!selectedInterviewSlot || confirmingSlot}
                        className="rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 px-4 py-2 text-xs font-semibold text-white transition shadow-sm"
                      >
                        {confirmingSlot ? "Syncing Calendar..." : "Confirm Selected Interview Slot"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-slate-800/80 bg-slate-900/50 p-4 space-y-2">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-lg bg-slate-800 text-slate-400 flex items-center justify-center text-sm shrink-0">
                        🔒
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white flex items-center gap-2">
                          <span>Interview Self-Scheduling Locked</span>
                          <span className="text-[10px] text-amber-400 bg-amber-950/80 border border-amber-800/60 px-2 py-0.2 rounded-full">
                            Current Stage: {portalData.candidate.stage}
                          </span>
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                          Your application is currently in <strong>{portalData.candidate.stage}</strong> review. Once your profile is shortlisted for technical rounds by our recruiting team, our recruiter&apos;s live Outlook calendar slots will automatically unlock here for you to schedule your preferred interview time.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* DIGITAL OFFER LETTER ACCEPTANCE (IF EXTENDED) */}
                {portalData.offerDetails && (
                  <div className="rounded-xl border border-amber-500/40 bg-amber-950/20 p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-xs font-bold text-amber-300 flex items-center gap-2">
                          <span>📄 Formal Offer Letter Extended</span>
                          <span className="text-[10px] px-2 py-0.2 rounded font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            {portalData.offerDetails.status}
                          </span>
                        </h4>
                        <p className="text-[11px] text-slate-300 mt-0.5">
                          Review your formal compensation package and digitally sign to begin pre-onboarding.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-bold block">Annual Base</span>
                        <span className="font-bold text-emerald-400">{portalData.offerDetails.baseSalary}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-bold block">Signing Bonus</span>
                        <span className="font-bold text-white">{portalData.offerDetails.signingBonus}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-bold block">Equity Grant</span>
                        <span className="font-bold text-white">{portalData.offerDetails.equityOptions}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-bold block">Start Date</span>
                        <span className="font-bold text-white">{portalData.offerDetails.targetStartDate}</span>
                      </div>
                    </div>

                    {offerAcceptedSuccess || portalData.offerDetails.isAccepted ? (
                      <div className="p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 text-xs">
                        <span className="font-bold block text-sm">✓ Formal Offer Accepted!</span>
                        <span className="text-[11px] text-slate-300 block mt-1">
                          Welcome to MAX Enterprise Global. Your pre-onboarding checklist and hardware allocation (MacBook Pro / Dell XPS) are now unlocked!
                        </span>
                      </div>
                    ) : (
                      <div className="pt-2 border-t border-slate-800 space-y-2">
                        <label className="text-[11px] text-slate-300 block">
                          Type your Full Legal Name to Digitally Accept Offer:
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={signatureName}
                            onChange={(e) => setSignatureName(e.target.value)}
                            placeholder="e.g. Elena Rostova"
                            className="flex-1 rounded-xl bg-slate-950 border border-slate-800 px-3 py-1.5 text-xs text-white placeholder-slate-500"
                          />
                          <button
                            onClick={() => handleAcceptOffer(portalData.offerDetails.id)}
                            disabled={!signatureName.trim() || acceptingOffer}
                            className="rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 px-4 py-2 text-xs font-semibold text-white transition shadow-sm"
                          >
                            {acceptingOffer ? "Accepting..." : "Accept Offer & Pre-Onboard"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 text-xs">
                <span>Enter your application ID or email above to view real-time status and schedule slots.</span>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowCandidatePortal(false)}
                className="rounded-xl border border-slate-800 px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Close Portal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ROLE DETAILS */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-slate-950 border border-slate-800 p-6 shadow-2xl text-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-4 border-b border-slate-800 mb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">{selectedJob.reqNumber}</span>
                <h3 className="text-xl font-bold text-white">{selectedJob.title}</h3>
                <p className="text-xs text-slate-400">{selectedJob.department} • {selectedJob.location}</p>
              </div>
              <button onClick={() => setSelectedJob(null)} className="text-slate-500 hover:text-white text-lg">
                &times;
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-300">
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Compensation</span>
                  <span className="font-semibold text-emerald-400 text-sm">{selectedJob.salaryRange}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Level</span>
                  <span className="font-semibold text-white">{selectedJob.jobLevel}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Employment</span>
                  <span className="font-semibold text-white">{selectedJob.employmentType}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Hiring Manager</span>
                  <span className="font-semibold text-white">{selectedJob.hiringManagerName}</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-white mb-2">Required Core Competencies</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedJob.requiredSkills.map((s) => (
                    <span key={s} className="rounded-lg bg-blue-950/60 border border-blue-800/60 px-2.5 py-1 text-blue-300 text-[11px] font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-white mb-1">About MAX Enterprise Global</h4>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  As part of MAX-ERP, you will solve distributed consensus, sub-millisecond database queries, and multi-tenant security challenges powering industrial operations across North America, Europe, and Asia-Pacific.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white mb-1">Benefits & Perks</h4>
                <ul className="text-slate-400 space-y-1 list-disc pl-4 text-[11px]">
                  <li>100% remote work flexibility with home office setup budget ($1,500)</li>
                  <li>Comprehensive global health, vision, and dental insurance</li>
                  <li>401(k) / pension contribution matching up to 5%</li>
                  <li>Generous equity grants and annual performance bonuses</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => setSelectedJob(null)}
                className="rounded-xl border border-slate-800 px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const j = selectedJob;
                  setSelectedJob(null);
                  if (j) openApplyModal(j);
                }}
                className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 shadow-md shadow-blue-600/30"
              >
                Apply for this Position &rarr;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REQUEST INTERVIEW RESCHEDULE */}
      {showRescheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-950 border border-slate-800 p-6 shadow-2xl text-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>🔄 Request Alternate Interview Time</span>
              </h3>
              <button onClick={() => setShowRescheduleModal(false)} className="text-slate-500 hover:text-white text-lg">
                &times;
              </button>
            </div>

            <form onSubmit={handleRequestReschedule} className="space-y-4 text-xs">
              <p className="text-[11px] text-slate-400">
                If the published Outlook slots conflict with your existing commitments, let us know your preferred availability windows. Our talent coordinator will consult the panel and send updated slots.
              </p>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Reason for Reschedule *</label>
                <input
                  type="text"
                  required
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  placeholder="e.g. Prior client commitment or work conflict during current slots"
                  className="w-full rounded-xl bg-slate-900 border border-slate-800 p-2.5 text-white placeholder-slate-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Preferred Time Windows & Timezone *</label>
                <textarea
                  rows={3}
                  required
                  value={reschedulePreferredTimes}
                  onChange={(e) => setReschedulePreferredTimes(e.target.value)}
                  placeholder="e.g. Available Thursday or Friday between 2:00 PM - 5:00 PM EST, or mornings after 10:00 AM"
                  className="w-full rounded-xl bg-slate-900 border border-slate-800 p-2.5 text-white placeholder-slate-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowRescheduleModal(false)}
                  className="rounded-xl border border-slate-800 px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={requestingReschedule}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 disabled:opacity-50"
                >
                  {requestingReschedule ? "Submitting..." : "Send Reschedule Request →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FLOATING ASK AI CAREER ADVISOR BUTTON */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold px-4 py-3 shadow-2xl flex items-center gap-2.5 transition-all duration-300 hover:scale-105 ring-2 ring-blue-400/30"
          title="Open MAX AI Career Advisor"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-xs sm:text-sm font-bold">💬 Ask AI Career Advisor</span>
        </button>
      </div>
    </div>
  );
}
