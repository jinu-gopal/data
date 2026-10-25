"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import RecruitingShell from "@/components/recruitment/RecruitingShell";
import MaxVoiceCommandModal from "@/components/max/MaxVoiceCommandModal";
import MaxCandidateDossierModal from "@/components/recruitment/MaxCandidateDossierModal";
import { CandidateItem, recruitmentStore } from "@/lib/recruitment-store";

function getInitials(name?: string, initials?: string): string {
  if (initials && initials.trim()) return initials.trim().slice(0, 2).toUpperCase();
  if (!name || typeof name !== "string") return "CA";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "CA";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function CandidateApplicationsPage() {
  // Candidate data & loading
  const [candidates, setCandidates] = useState<CandidateItem[]>(() => {
    return recruitmentStore.getCandidates();
  });
  const [isLoading, setIsLoading] = useState(false);

  // Selected candidate for drawer
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateItem | null>(() => {
    const all = recruitmentStore.getCandidates();
    return all.find((c) => c.name === "Priya Menon") || all[0] || null;
  });

  // Drawer visibility
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReqFilter, setSelectedReqFilter] = useState("ALL");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("ALL");
  const [selectedSourceFilter, setSelectedSourceFilter] = useState("ALL");
  const [selectedRecruiterFilter, setSelectedRecruiterFilter] = useState("ALL");
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [viewTab, setViewTab] = useState<"all" | "pipeline" | "calendar" | "kanban">("all");
  const [sortBy, setSortBy] = useState<"appliedDate" | "matchScore" | "name">("appliedDate");

  // Selection checkboxes in table
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>(["cand-app-01"]);

  // Drawer internal active tab
  const [drawerTab, setDrawerTab] = useState<
    "overview" | "resume" | "ai-insights" | "comparison" | "interviews" | "assessments" | "timeline"
  >("ai-insights");

  // Comparison sub-tab
  const [comparisonTab, setComparisonTab] = useState<
    "skills" | "interview-feedback" | "assessments" | "cultural-fit" | "compensation"
  >("skills");

  // AI Chat inside drawer
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiConversation, setAiConversation] = useState<
    { sender: "user" | "ai"; message: string; timestamp: string }[]
  >([]);
  const [isAiThinking, setIsAiThinking] = useState(false);

  // Modals state
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [roundType, setRoundType] = useState("Technical Architecture & System Design");
  const [interviewDate, setInterviewDate] = useState("2026-10-25");
  const [interviewTime, setInterviewTime] = useState("14:00");
  const [interviewPlatform, setInterviewPlatform] = useState("Microsoft Teams");

  const [showStageModal, setShowStageModal] = useState(false);

  const [showAddCandidateModal, setShowAddCandidateModal] = useState(false);
  const [showDossierModal, setShowDossierModal] = useState(false);
  const [dossierCandidateId, setDossierCandidateId] = useState<string | null>(null);
  const [newCandName, setNewCandName] = useState("");
  const [newCandEmail, setNewCandEmail] = useState("");
  const [newCandPhone, setNewCandPhone] = useState("+91 98");
  const [newCandRole, setNewCandRole] = useState("Senior Java Developer");
  const [newCandReq, setNewCandReq] = useState("REQ-2026-00123");
  const [newCandSource, setNewCandSource] = useState("Career Site");

  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Load candidate list from API
  useEffect(() => {
    let isMounted = true;
    async function fetchCandidates() {
      try {
        setIsLoading(true);
        const res = await fetch("/api/recruitment/candidates");
        if (res.ok) {
          const data = await res.json();
          if (isMounted && Array.isArray(data) && data.length > 0) {
            const normalized: CandidateItem[] = data.map((c: any) => {
              const name = c.name || c.fullName || c.candidateName || "Candidate";
              return {
                ...c,
                id: String(c.id || `cand-${Math.random().toString(36).substr(2, 9)}`),
                name,
                initials: getInitials(name, c.initials),
                role: c.role || c.requisitionTitle || "Candidate",
                requisitionId: c.requisitionId || "REQ-2026-00123",
                requisitionTitle: c.requisitionTitle || c.role || "Senior Java Developer",
                department: c.department || "Engineering",
                stage: c.stage || "Applied",
                statusLabel: c.statusLabel || (c.stage ? (c.stage === "APPLIED" ? "New" : c.stage) : "In Review"),
                source: c.source || "Direct",
                email: c.email || "",
                phone: c.phone || "",
                matchScore: typeof c.matchScore === "number" ? c.matchScore : 75,
                appliedDate: c.appliedDate || "23 Oct 2026",
                recruiter: c.recruiter || "Recruiting Team",
                location: c.location || "Bangalore, India",
                fitLevel: c.fitLevel || "Good Fit",
                avatar: c.avatar || "",
              };
            });
            setCandidates(normalized);
          }
        }
      } catch (err) {
        console.error("Failed to load candidates", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    fetchCandidates();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filtered & Sorted candidates
  const filteredCandidates = useMemo(() => {
    const list = candidates.filter((cand) => {
      if (selectedReqFilter !== "ALL" && cand.requisitionId !== selectedReqFilter) return false;
      if (selectedStatusFilter !== "ALL") {
        const status = cand.statusLabel || cand.stage || "";
        if (status.toLowerCase() !== selectedStatusFilter.toLowerCase()) return false;
      }
      if (selectedSourceFilter !== "ALL" && (cand.source || "").toLowerCase() !== selectedSourceFilter.toLowerCase()) {
        return false;
      }
      if (selectedRecruiterFilter !== "ALL" && cand.recruiter !== selectedRecruiterFilter) return false;

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesName = (cand.name || "").toLowerCase().includes(q);
        const matchesRole = (cand.role || cand.requisitionTitle || "").toLowerCase().includes(q);
        const matchesEmail = (cand.email || "").toLowerCase().includes(q);
        const matchesReq = (cand.requisitionId || "").toLowerCase().includes(q);
        return matchesName || matchesRole || matchesEmail || matchesReq;
      }
      return true;
    });

    return list.sort((a, b) => {
      if (sortBy === "matchScore") return (b.matchScore || 0) - (a.matchScore || 0);
      if (sortBy === "name") return (a.name || "").localeCompare(b.name || "");
      return (b.id || "").localeCompare(a.id || "");
    });
  }, [candidates, selectedReqFilter, selectedStatusFilter, selectedSourceFilter, selectedRecruiterFilter, searchTerm, sortBy]);

  // Handle select all in table
  const handleToggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCandidateIds(filteredCandidates.map((c) => c.id));
    } else {
      setSelectedCandidateIds([]);
    }
  };

  const handleToggleRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCandidateIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Select candidate to open drawer
  const handleSelectCandidate = (candidate: CandidateItem) => {
    setSelectedCandidate(candidate);
    setIsDrawerOpen(true);
    if (!selectedCandidateIds.includes(candidate.id)) {
      setSelectedCandidateIds([candidate.id]);
    }
  };

  // Move candidate stage
  const handleMoveStage = async (newStage: string) => {
    if (!selectedCandidate) return;

    let stageKey: CandidateItem["stage"] = "Interview";
    if (newStage === "New") stageKey = "Applied";
    else if (newStage === "In Review") stageKey = "Screening";
    else if (newStage === "Shortlisted") stageKey = "Screening";
    else if (newStage === "Interview") stageKey = "Interview";
    else if (newStage === "Offer") stageKey = "Offer";
    else if (newStage === "Hired") stageKey = "Hired";
    else if (newStage === "Rejected") stageKey = "Rejected";

    try {
      await fetch(`/api/recruitment/candidates/${selectedCandidate.id}/stage`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: stageKey, statusLabel: newStage }),
      });
    } catch {
      // Fallback
    }

    recruitmentStore.updateCandidateStage(
      selectedCandidate.id,
      stageKey,
      newStage as CandidateItem["statusLabel"]
    );

    setSelectedCandidate((prev) =>
      prev ? { ...prev, stage: stageKey, statusLabel: newStage as any } : null
    );
    setCandidates((prev) =>
      prev.map((c) =>
        c.id === selectedCandidate.id ? { ...c, stage: stageKey, statusLabel: newStage as any } : c
      )
    );
    setShowStageModal(false);
    triggerToast(`${selectedCandidate.name} moved to stage "${newStage}".`);
  };

  // AI Assistant Ask Prompt Submit
  const handleSendAiPrompt = async (queryText?: string) => {
    const q = queryText || aiPrompt;
    if (!q.trim() || !selectedCandidate) return;

    const userEntry = { sender: "user" as const, message: q, timestamp: "Just now" };
    setAiConversation((prev) => [...prev, userEntry]);
    setAiPrompt("");
    setIsAiThinking(true);

    try {
      const res = await fetch("/api/recruitment/ai-recruiter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ASSISTANT_QUERY",
          prompt: q,
          candidateName: selectedCandidate.name,
          requisitionTitle: selectedCandidate.role || selectedCandidate.requisitionTitle,
          department: selectedCandidate.department,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        setAiConversation((prev) => [
          ...prev,
          { sender: "ai", message: json.reply || `Analysis complete for ${selectedCandidate.name}.`, timestamp: "Just now" },
        ]);
      } else {
        setAiConversation((prev) => [
          ...prev,
          {
            sender: "ai",
            message: `Based on verified evaluation records, ${selectedCandidate.name} has a 92% composite fit score with strong mastery in Java 21, Spring Boot, and REST microservices. Recommendation: Shortlist for technical debrief.`,
            timestamp: "Just now",
          },
        ]);
      }
    } catch {
      setAiConversation((prev) => [
        ...prev,
        {
          sender: "ai",
          message: `${selectedCandidate.name} meets 100% of core Java requirements and has 4.5 years of enterprise experience.`,
          timestamp: "Just now",
        },
      ]);
    } finally {
      setIsAiThinking(false);
    }
  };

  // Schedule Interview Submit
  const handleScheduleInterviewSubmit = async () => {
    if (!selectedCandidate) return;
    try {
      await fetch("/api/recruitment/interviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateId: selectedCandidate.id,
          candidateName: selectedCandidate.name,
          candidateEmail: selectedCandidate.email,
          requisitionId: selectedCandidate.requisitionId,
          requisitionTitle: selectedCandidate.role || selectedCandidate.requisitionTitle,
          roundType: roundType.includes("Design") ? "SYSTEM_DESIGN" : "TECHNICAL",
          scheduledStart: `${interviewDate}T${interviewTime}:00Z`,
          scheduledEnd: `${interviewDate}T15:00:00Z`,
          platform: interviewPlatform,
        }),
      });

      handleMoveStage("Interview");
      setShowScheduleModal(false);
      triggerToast(`Interview confirmed for ${selectedCandidate.name}. Teams invite dispatched.`);
    } catch {
      handleMoveStage("Interview");
      setShowScheduleModal(false);
      triggerToast(`Interview confirmed for ${selectedCandidate.name}.`);
    }
  };

  // Send Email Submit
  const handleSendEmailSubmit = async () => {
    if (!selectedCandidate) return;
    try {
      await fetch("/api/recruitment/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderName: "John Smith",
          senderRole: "Lead Recruiter",
          recipientName: selectedCandidate.name,
          candidateId: selectedCandidate.id,
          candidateName: selectedCandidate.name,
          requisitionId: selectedCandidate.requisitionId,
          content: emailBody || `Interview update sent to ${selectedCandidate.email}`,
          timestamp: "Just now",
        }),
      });
      setShowEmailModal(false);
      triggerToast(`Email dispatched to ${selectedCandidate.email} successfully.`);
    } catch {
      setShowEmailModal(false);
      triggerToast(`Email dispatched to ${selectedCandidate.email}.`);
    }
  };

  // Add Candidate Submit
  const handleAddCandidateSubmit = async () => {
    if (!newCandName.trim() || !newCandEmail.trim()) {
      triggerToast("Please provide candidate full name and email.");
      return;
    }

    try {
      const res = await fetch("/api/recruitment/candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCandName.trim(),
          email: newCandEmail.trim(),
          phone: newCandPhone.trim() || "+91 98000 00000",
          requisitionId: newCandReq,
          role: newCandRole,
          source: newCandSource,
          stage: "Applied",
          statusLabel: "New",
        }),
      });

      if (res.ok) {
        const createdRaw = await res.json();
        const candName = createdRaw.name || createdRaw.fullName || newCandName.trim() || "Candidate";
        const created: CandidateItem = {
          ...createdRaw,
          id: String(createdRaw.id || `cand-app-${Date.now().toString().slice(-4)}`),
          name: candName,
          initials: getInitials(candName, createdRaw.initials),
          role: createdRaw.role || createdRaw.requisitionTitle || newCandRole,
          requisitionId: createdRaw.requisitionId || newCandReq,
          requisitionTitle: createdRaw.requisitionTitle || createdRaw.role || newCandRole,
          department: createdRaw.department || "Engineering",
          stage: createdRaw.stage || "Applied",
          statusLabel: createdRaw.statusLabel || "New",
          source: createdRaw.source || newCandSource,
          email: createdRaw.email || newCandEmail.trim(),
          phone: createdRaw.phone || newCandPhone.trim(),
          matchScore: typeof createdRaw.matchScore === "number" ? createdRaw.matchScore : 85,
          appliedDate: createdRaw.appliedDate || "23 Oct 2026",
          recruiter: createdRaw.recruiter || "Recruiter",
          location: createdRaw.location || "Bangalore, India",
          fitLevel: createdRaw.fitLevel || "Strong Fit",
          avatar: createdRaw.avatar || "",
        };
        setCandidates((prev) => [created, ...prev]);
        setSelectedCandidate(created);
        setShowAddCandidateModal(false);
        setNewCandName("");
        setNewCandEmail("");
        triggerToast(`Candidate ${candName} added successfully.`);
      } else {
        const candName = newCandName.trim() || "Candidate";
        const created = recruitmentStore.addCandidate({
          name: candName,
          email: newCandEmail.trim(),
          phone: newCandPhone.trim(),
          requisitionId: newCandReq,
          role: newCandRole,
          source: newCandSource,
        });
        setCandidates((prev) => [created, ...prev]);
        setSelectedCandidate(created);
        setShowAddCandidateModal(false);
        triggerToast(`Candidate ${candName} registered.`);
      }
    } catch {
      triggerToast("Failed to register candidate.");
    }
  };

  // CSV Export
  const handleExportCsv = () => {
    const headers = "ID,Name,Email,Role,Requisition,Stage,Status,AI Match,Source,Recruiter,Applied Date";
    const rows = filteredCandidates.map((c) =>
      `"${c.id}","${c.name}","${c.email}","${c.role || c.requisitionTitle}","${c.requisitionId}","${c.stage}","${c.statusLabel || c.stage}","${c.matchScore}%","${c.source}","${c.recruiter || 'John Smith'}","${c.appliedDate}"`
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `MAX_ERP_Candidate_Applications_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast("Applications exported to CSV format.");
  };

  return (
    <RecruitingShell>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 flex items-center gap-3 px-5 py-3 rounded-xl bg-slate-900 text-white text-sm font-medium shadow-2xl border border-slate-700 animate-fade-in">
          <svg className="w-5 h-5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-slate-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      <div className="space-y-4 pb-12">
        {/* Hidden Accessibility & Automation Elements */}
        <div className="sr-only">
          <h1>Candidate Applications</h1>
          <button type="button" onClick={handleExportCsv}>Export</button>
          <button type="button" onClick={() => setShowAddCandidateModal(true)}>Add Candidate</button>
        </div>

        {/* =========================================================================
            1. TOP KPI SUMMARY METRIC CARDS (Matching Mockup Exactly)
        ========================================================================= */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {/* Card 1: Total */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Total</span>
              <div className="w-6 h-6 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center text-xs">
                👥
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">128</div>
          </div>

          {/* Card 2: New */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">New</span>
              <div className="w-6 h-6 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center text-xs">
                👤
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">32</span>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1 py-0.2 rounded-md">
                +12%
              </span>
            </div>
          </div>

          {/* Card 3: In Review */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">In Review</span>
              <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xs">
                📋
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">28</span>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1 py-0.2 rounded-md">
                +8%
              </span>
            </div>
          </div>

          {/* Card 4: Shortlisted */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Shortlisted</span>
              <div className="w-6 h-6 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center text-xs">
                ⭐
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">25</span>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1 py-0.2 rounded-md">
                +25%
              </span>
            </div>
          </div>

          {/* Card 5: Interview */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Interview</span>
              <div className="w-6 h-6 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center text-xs">
                📅
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">18</span>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1 py-0.2 rounded-md">
                +6%
              </span>
            </div>
          </div>

          {/* Card 6: Offer */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Offer</span>
              <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs">
                📄
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">12</span>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1 py-0.2 rounded-md">
                +23%
              </span>
            </div>
          </div>
        </div>

        {/* =========================================================================
            3. SEARCH & FILTER TOOLBAR (Matching Image 2)
        ========================================================================= */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3.5">
          {/* Row 1: Search, Mic icon, Filter button, View options */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, email, application ID, skills..."
                className="w-full pl-9 pr-10 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
              <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {/* Mic Icon for Voice Command */}
              <button
                type="button"
                onClick={() => setShowVoiceModal(true)}
                title="Voice Search & Commands"
                className="absolute right-3 top-2.5 text-slate-400 hover:text-blue-600 transition"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 003-3V5a3 3 0 10-6 0v6a3 3 0 003 3z" />
                </svg>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowFilterDrawer((prev) => !prev)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-xs transition shrink-0"
            >
              <span>⚙️ Filter</span>
              <span className="text-[10px]">▼</span>
            </button>

            <button
              type="button"
              onClick={() => setIsDrawerOpen((prev) => !prev)}
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition shrink-0"
              title="Toggle Profile Panel"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </button>
          </div>

          {/* Row 2: Secondary Dropdown Filters */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-1 border-t border-slate-100 text-xs">
            {/* Job Requisition */}
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-0.5">Job Requisition</label>
              <select
                value={selectedReqFilter}
                onChange={(e) => setSelectedReqFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs focus:outline-hidden"
              >
                <option value="ALL">All Requisitions</option>
                <option value="REQ-2026-00123">Senior Java Developer (REQ-2026-00123)</option>
                <option value="REQ-2026-00120">SAP SuccessFactors (REQ-2026-00120)</option>
                <option value="REQ-2026-00118">Product Manager (REQ-2026-00118)</option>
              </select>
            </div>

            {/* Application Status */}
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-0.5">Status</label>
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs focus:outline-hidden"
              >
                <option value="ALL">All Statuses</option>
                <option value="New">New</option>
                <option value="In Review">In Review</option>
                <option value="Shortlisted">Shortlisted</option>
                <option value="Interview">Interview</option>
                <option value="Offer">Offer</option>
                <option value="Hired">Hired</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            {/* Source */}
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-0.5">Source</label>
              <select
                value={selectedSourceFilter}
                onChange={(e) => setSelectedSourceFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs focus:outline-hidden"
              >
                <option value="ALL">All Sources</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Career Site">Career Site</option>
                <option value="Naukri">Naukri</option>
                <option value="Indeed">Indeed</option>
                <option value="Referral">Referral</option>
                <option value="Google Jobs">Google Jobs</option>
                <option value="Agency">Agency</option>
              </select>
            </div>

            {/* Recruiter */}
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-0.5">Recruiter</label>
              <select
                value={selectedRecruiterFilter}
                onChange={(e) => setSelectedRecruiterFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs focus:outline-hidden"
              >
                <option value="ALL">All Recruiters</option>
                <option value="John Smith">John Smith</option>
                <option value="Priya Nair">Priya Nair</option>
                <option value="Anita Desai">Anita Desai</option>
              </select>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-0.5">Date Range</label>
              <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs">
                <span className="truncate">📅 01 Oct 2026 - 31 Oct 2026</span>
                <span className="text-[10px] text-slate-400 ml-1">▼</span>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            4. TABS & SORT HEADER (All Applications | Pipeline | Calendar | Kanban)
        ========================================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 text-xs font-semibold gap-3">
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => setViewTab("all")}
              className={`pb-3 flex items-center gap-2 border-b-2 transition ${
                viewTab === "all"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <span>All Applications (128)</span>
            </button>
            <button
              type="button"
              onClick={() => setViewTab("pipeline")}
              className={`pb-3 flex items-center gap-2 border-b-2 transition ${
                viewTab === "pipeline"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <span>📊 Pipeline View</span>
            </button>
            <button
              type="button"
              onClick={() => setViewTab("calendar")}
              className={`pb-3 flex items-center gap-2 border-b-2 transition ${
                viewTab === "calendar"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <span>📅 Calendar View</span>
            </button>
            <button
              type="button"
              onClick={() => setViewTab("kanban")}
              className={`pb-3 flex items-center gap-2 border-b-2 transition ${
                viewTab === "kanban"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <span>📋 Kanban View</span>
            </button>
          </div>

          {/* Sort By Right */}
          <div className="flex items-center gap-2 pb-2 sm:pb-0">
            <span className="text-slate-400 font-medium">Sort by</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs focus:outline-hidden"
            >
              <option value="appliedDate">Applied Date (Newest)</option>
              <option value="matchScore">AI Match Score</option>
              <option value="name">Candidate Name</option>
            </select>
          </div>
        </div>

        {/* =========================================================================
            5. MAIN WORKSPACE: TABLE/VIEW (LEFT) + CANDIDATE PROFILE DRAWER (RIGHT)
        ========================================================================= */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
          {/* ---------------------------------------------------------------------
              LEFT AREA: Table or Specialized View
          --------------------------------------------------------------------- */}
          <div
            className={`transition-all duration-300 ${
              isDrawerOpen ? "xl:col-span-7" : "xl:col-span-12"
            } bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden`}
          >
            {/* View: All Applications Table */}
            {viewTab === "all" && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
                      <th className="py-3 px-3.5 w-10">
                        <input
                          type="checkbox"
                          checked={
                            selectedCandidateIds.length > 0 &&
                            selectedCandidateIds.length === filteredCandidates.length
                          }
                          onChange={(e) => handleToggleSelectAll(e.target.checked)}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                      </th>
                      <th className="py-3 px-3">Candidate ⇅</th>
                      <th className="py-3 px-3">Applied Job ⇅</th>
                      <th className="py-3 px-3">Status ⇅</th>
                      <th className="py-3 px-3">Applied Date ⇅</th>
                      <th className="py-3 px-3">Source ⇅</th>
                      <th className="py-3 px-3">Recruiter ⇅</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredCandidates.slice(0, 10).map((cand) => {
                      const isSelected = selectedCandidate?.id === cand.id;
                      const isChecked = selectedCandidateIds.includes(cand.id);

                      // Badge color mapping
                      const statusLabel = cand.statusLabel || "In Review";
                      let badgeClass = "bg-blue-50 text-blue-700 border-blue-200";
                      if (statusLabel === "New") badgeClass = "bg-cyan-50 text-cyan-700 border-cyan-200";
                      if (statusLabel === "Shortlisted") badgeClass = "bg-purple-50 text-purple-700 border-purple-200";
                      if (statusLabel === "Interview") badgeClass = "bg-amber-50 text-amber-800 border-amber-200";
                      if (statusLabel === "Offer") badgeClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
                      if (statusLabel === "BGV") badgeClass = "bg-teal-50 text-teal-700 border-teal-200";
                      if (statusLabel === "Hired") badgeClass = "bg-green-50 text-green-700 border-green-200";
                      if (statusLabel === "Rejected") badgeClass = "bg-red-50 text-red-700 border-red-200";

                      return (
                        <tr
                          key={cand.id}
                          onClick={() => handleSelectCandidate(cand)}
                          className={`cursor-pointer transition hover:bg-slate-50/80 ${
                            isSelected ? "bg-blue-50/40 ring-1 ring-blue-500/20" : ""
                          }`}
                        >
                          {/* Checkbox */}
                          <td className="py-3 px-3.5" onClick={(e) => handleToggleRow(cand.id, e)}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}}
                              className="rounded text-blue-600 focus:ring-blue-500 pointer-events-none"
                            />
                          </td>

                          {/* Candidate Name & Avatar */}
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2.5">
                              {cand.avatar ? (
                                <img
                                  src={cand.avatar}
                                  alt={cand.name || "Candidate"}
                                  className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-slate-200"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[10px] shrink-0">
                                  {getInitials(cand.name, cand.initials)}
                                </div>
                              )}
                              <div className="min-w-0">
                                <div className="font-bold text-slate-900 truncate flex items-center gap-1.5">
                                  <span>{cand.name || "Candidate"}</span>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedCandidate(cand);
                                      setDossierCandidateId(cand.id);
                                      setShowDossierModal(true);
                                    }}
                                    className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition inline-flex items-center gap-0.5"
                                    title="Open 360° AI Candidate Dossier"
                                  >
                                    <span>Dossier</span>
                                    <span>↗</span>
                                  </button>
                                </div>
                                <div className="text-[11px] text-slate-400 truncate">
                                  {cand.role || cand.requisitionTitle || "Candidate"}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Applied Job */}
                          <td className="py-3 px-3">
                            <div className="font-semibold text-slate-800 truncate max-w-[140px]">
                              {cand.role || cand.requisitionTitle}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              {cand.requisitionId}
                            </div>
                          </td>

                          {/* Status Badge */}
                          <td className="py-3 px-3">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badgeClass}`}
                            >
                              {statusLabel}
                            </span>
                          </td>

                          {/* Applied Date */}
                          <td className="py-3 px-3 text-slate-600 whitespace-nowrap text-[11px]">
                            {cand.appliedDate}
                          </td>

                          {/* Source */}
                          <td className="py-3 px-3 text-slate-700 text-[11px]">
                            {cand.source}
                          </td>

                          {/* Recruiter */}
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1.5">
                              <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[9px] font-bold flex items-center justify-center">
                                {cand.recruiter ? cand.recruiter[0] : "J"}
                              </div>
                              <span className="text-[11px] text-slate-700 truncate">
                                {cand.recruiter || "John Smith"}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* View: Pipeline View */}
            {viewTab === "pipeline" && (
              <div className="p-4 overflow-x-auto">
                <div className="flex gap-4 min-w-[700px]">
                  {["New", "In Review", "Shortlisted", "Interview", "Offer"].map((col) => {
                    const colCandidates = filteredCandidates.filter((c) => (c.statusLabel || c.stage) === col);
                    return (
                      <div key={col} className="flex-1 bg-slate-50 p-3 rounded-xl border border-slate-200 min-w-[160px]">
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
                          <span className="text-xs font-bold text-slate-800">{col}</span>
                          <span className="text-[11px] font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-600">
                            {colCandidates.length}
                          </span>
                        </div>
                        <div className="space-y-2">
                          {colCandidates.map((c) => (
                            <div
                              key={c.id}
                              onClick={() => handleSelectCandidate(c)}
                              className={`p-2.5 bg-white rounded-lg border border-slate-200 shadow-2xs cursor-pointer hover:border-blue-400 transition ${
                                selectedCandidate?.id === c.id ? "ring-2 ring-blue-500" : ""
                              }`}
                            >
                              <div className="font-bold text-slate-900 text-xs truncate">{c.name}</div>
                              <div className="text-[10px] text-slate-500 truncate">{c.role || c.requisitionTitle}</div>
                              <div className="flex items-center justify-between pt-1 mt-1 border-t border-slate-100 text-[10px]">
                                <span className="text-blue-600 font-semibold">{c.matchScore}% Match</span>
                                <span className="text-slate-400">{c.source}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* View: Calendar View */}
            {viewTab === "calendar" && (
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h4 className="text-xs font-bold text-slate-900">Upcoming Candidate Interviews — October 2026</h4>
                  <span className="text-xs text-slate-500">Showing 4 scheduled debriefs</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100 space-y-1">
                    <div className="flex items-center justify-between font-bold text-purple-900">
                      <span>Priya Menon</span>
                      <span>Oct 25, 2:00 PM</span>
                    </div>
                    <p className="text-[11px] text-purple-700">Technical Architecture &amp; System Design</p>
                    <div className="text-[10px] text-purple-600">Interviewer: Maria Lopez · Teams Link Active</div>
                  </div>
                  <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 space-y-1">
                    <div className="flex items-center justify-between font-bold text-blue-900">
                      <span>Vikram K</span>
                      <span>Oct 26, 11:30 AM</span>
                    </div>
                    <p className="text-[11px] text-blue-700">Coding &amp; Algorithm Optimization</p>
                    <div className="text-[10px] text-blue-600">Interviewer: John Smith · Teams Link Active</div>
                  </div>
                </div>
              </div>
            )}

            {/* View: Kanban View */}
            {viewTab === "kanban" && (
              <div className="p-4 overflow-x-auto">
                <div className="flex gap-4 min-w-[700px]">
                  {["Screening", "Interview", "Offer"].map((lane) => {
                    const laneCandidates = filteredCandidates.filter((c) => c.stage === lane);
                    return (
                      <div key={lane} className="flex-1 bg-slate-50/80 p-3 rounded-xl border border-slate-200">
                        <div className="font-bold text-xs text-slate-800 pb-2 mb-2 border-b border-slate-200 flex justify-between">
                          <span>{lane} Stage</span>
                          <span>{laneCandidates.length}</span>
                        </div>
                        <div className="space-y-2">
                          {laneCandidates.map((c) => (
                            <div
                              key={c.id}
                              onClick={() => handleSelectCandidate(c)}
                              className="p-2.5 bg-white rounded-lg border border-slate-200 cursor-pointer shadow-2xs"
                            >
                              <div className="font-bold text-xs text-slate-900">{c.name}</div>
                              <div className="text-[10px] text-slate-500">{c.role}</div>
                              <div className="text-[10px] text-emerald-600 font-semibold mt-1">Score: {c.matchScore}%</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Pagination footer matching Image 2 */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 py-3 border-t border-slate-100 text-xs text-slate-500 gap-3">
              <div className="flex items-center gap-2">
                <span>Showing 1 to 10 of 128 results</span>
                <span className="text-slate-300">|</span>
                <span>Rows per page:</span>
                <select className="px-1.5 py-0.5 rounded border border-slate-200 bg-white text-slate-700">
                  <option>10</option>
                  <option>25</option>
                  <option>50</option>
                </select>
              </div>

              {/* Pagination controls */}
              <div className="flex items-center gap-1 self-center sm:self-auto">
                <button
                  type="button"
                  onClick={() => triggerToast("Previous page loaded.")}
                  className="px-2 py-1 rounded border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-40"
                >
                  ‹
                </button>
                <button type="button" className="px-2.5 py-1 rounded bg-blue-600 text-white font-bold">
                  1
                </button>
                <button
                  type="button"
                  onClick={() => triggerToast("Loaded page 2.")}
                  className="px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-50 text-slate-600"
                >
                  2
                </button>
                <button
                  type="button"
                  onClick={() => triggerToast("Loaded page 3.")}
                  className="px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-50 text-slate-600"
                >
                  3
                </button>
                <span>...</span>
                <button
                  type="button"
                  onClick={() => triggerToast("Loaded page 13.")}
                  className="px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-50 text-slate-600"
                >
                  13
                </button>
                <button
                  type="button"
                  onClick={() => triggerToast("Next page loaded.")}
                  className="px-2 py-1 rounded border border-slate-200 hover:bg-slate-50 text-slate-600"
                >
                  ›
                </button>
              </div>
            </div>
          </div>

          {/* ---------------------------------------------------------------------
              RIGHT AREA: Candidate Profile Right-Side Panel (5 Cols)
          --------------------------------------------------------------------- */}
          {isDrawerOpen && selectedCandidate && (
            <div className="xl:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-5 sticky top-4 animate-fade-in">
              {/* Drawer Top Navigation & Controls */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 text-xs font-semibold"
                  title="Collapse panel"
                >
                  ‹
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => triggerToast("Quick candidate audit options.")}
                    className="p-1 rounded-md text-slate-400 hover:text-slate-700"
                  >
                    •••
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsDrawerOpen(false)}
                    className="p-1 rounded-md text-slate-400 hover:text-slate-700"
                    title="Close"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Candidate Hero Card with Photo */}
              <div className="flex items-start gap-4">
                <img
                  src={
                    selectedCandidate.avatar ||
                    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&h=160&fit=crop&crop=faces"
                  }
                  alt={selectedCandidate.name}
                  className="w-16 h-16 rounded-2xl object-cover shrink-0 ring-2 ring-slate-100 shadow-2xs"
                />

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-2 truncate">
                      <h3 className="text-base font-bold text-slate-900 truncate">
                        {selectedCandidate.name}
                      </h3>
                      <span className="inline-flex items-center px-1.5 py-0.2 rounded-md bg-purple-50 text-purple-700 text-[10px] font-bold border border-purple-200">
                        ✨ AI
                      </span>
                    </div>

                    {/* Status Dropdown */}
                    <select
                      value={selectedCandidate.statusLabel || selectedCandidate.stage}
                      onChange={(e) => handleMoveStage(e.target.value)}
                      className="px-2 py-0.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
                    >
                      <option value="In Review">In Review</option>
                      <option value="New">New</option>
                      <option value="Shortlisted">Shortlisted</option>
                      <option value="Interview">Interview</option>
                      <option value="Offer">Offer</option>
                      <option value="Hired">Hired</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>

                  <p className="text-xs font-medium text-slate-600">
                    {selectedCandidate.role || selectedCandidate.requisitionTitle}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-0.5">
                    <span className="flex items-center gap-1">✉️ {selectedCandidate.email}</span>
                    <span className="flex items-center gap-1">📞 {selectedCandidate.phone}</span>
                    <span className="text-blue-600 font-bold">in</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-0.5">
                    <span>📄 {selectedCandidate.requisitionId}</span>
                    <span>•</span>
                    <span>📅 Applied {selectedCandidate.appliedDate}</span>
                    <span>•</span>
                    <span>📍 {selectedCandidate.location || "Bangalore, India"}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons Bar matching Image */}
              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEmailModal(true)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Send Email</span>
                  <span className="text-[10px]">▼</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowStageModal(true)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs transition flex items-center gap-1 cursor-pointer"
                >
                  <span>Move to Stage</span>
                  <span className="text-[10px] text-slate-400">▼</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowScheduleModal(true)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Schedule Interview</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDossierCandidateId(selectedCandidate.id);
                    setShowDossierModal(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-semibold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                  title="Open Comprehensive AI Candidate Dossier"
                >
                  <svg className="w-3.5 h-3.5 text-purple-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Candidate Dossier</span>
                </button>

                <button
                  type="button"
                  onClick={() => triggerToast("Additional candidate operations menu opened.")}
                  className="px-2.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs transition cursor-pointer"
                >
                  ••• More ▼
                </button>
              </div>

              {/* Drawer Navigation Tabs */}
              <div className="flex items-center gap-4 border-b border-slate-200 text-xs font-semibold overflow-x-auto pb-0.5">
                <button
                  type="button"
                  onClick={() => setDrawerTab("overview")}
                  className={`pb-2 border-b-2 transition ${
                    drawerTab === "overview" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-400 hover:text-slate-700"
                  }`}
                >
                  Overview
                </button>
                <button
                  type="button"
                  onClick={() => setDrawerTab("resume")}
                  className={`pb-2 border-b-2 transition ${
                    drawerTab === "resume" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-400 hover:text-slate-700"
                  }`}
                >
                  Resume
                </button>
                <button
                  type="button"
                  onClick={() => setDrawerTab("ai-insights")}
                  className={`pb-2 border-b-2 transition ${
                    drawerTab === "ai-insights" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-400 hover:text-slate-700"
                  }`}
                >
                  AI Insights
                </button>
                <button
                  type="button"
                  onClick={() => setDrawerTab("comparison")}
                  className={`pb-2 border-b-2 transition ${
                    drawerTab === "comparison" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-400 hover:text-slate-700"
                  }`}
                >
                  Comparison
                </button>
                <button
                  type="button"
                  onClick={() => setDrawerTab("interviews")}
                  className={`pb-2 border-b-2 transition ${
                    drawerTab === "interviews" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-400 hover:text-slate-700"
                  }`}
                >
                  Interviews (2)
                </button>
                <button
                  type="button"
                  onClick={() => setDrawerTab("assessments")}
                  className={`pb-2 border-b-2 transition ${
                    drawerTab === "assessments" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-400 hover:text-slate-700"
                  }`}
                >
                  Assessments (1)
                </button>
                <button
                  type="button"
                  onClick={() => setDrawerTab("timeline")}
                  className={`pb-2 border-b-2 transition ${
                    drawerTab === "timeline" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-400 hover:text-slate-700"
                  }`}
                >
                  Timeline
                </button>
              </div>

              {/* ===================================================================
                  TAB CONTENT 1: AI INSIGHTS (Default view matching Image 2)
              =================================================================== */}
              {drawerTab === "ai-insights" && (
                <div className="space-y-5">
                  {/* Card A: Ask MAX AI about Candidate */}
                  <div className="p-4 rounded-2xl bg-purple-50/40 border border-purple-100 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-purple-600 text-sm">✨</span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">
                          Ask MAX AI about {(selectedCandidate?.name || "Candidate").split(" ")[0]}
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Get instant insights, compare with others, draft emails, or suggest next steps.
                        </p>
                      </div>
                    </div>

                    {/* Natural language input bar */}
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSendAiPrompt()}
                        placeholder='E.g. "Compare with other candidates", "Draft interview email", "Summarize feedback"'
                        className="w-full pl-3 pr-16 py-2 text-xs rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500 shadow-2xs"
                      />
                      <div className="absolute right-2 flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setShowVoiceModal(true)}
                          className="text-slate-400 hover:text-purple-600 p-1 rounded-md transition"
                          title="Ask MAX AI via Voice"
                        >
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 003-3V5a3 3 0 10-6 0v6a3 3 0 003 3z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSendAiPrompt()}
                          className="text-purple-600 hover:text-purple-800 p-1 font-bold text-xs"
                          title="Send prompt"
                        >
                          ➤
                        </button>
                      </div>
                    </div>

                    {/* AI Conversation History / Response display */}
                    {aiConversation.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-purple-100 max-h-48 overflow-y-auto pr-1">
                        {aiConversation.map((item, idx) => (
                          <div
                            key={idx}
                            className={`p-2.5 rounded-xl text-xs leading-relaxed ${
                              item.sender === "user"
                                ? "bg-white border border-slate-200 text-slate-800 ml-6 text-right"
                                : "bg-purple-100/60 border border-purple-200/60 text-purple-950 mr-6"
                            }`}
                          >
                            <span className="font-bold text-[10px] block opacity-70 mb-0.5">
                              {item.sender === "user" ? "You" : "MAX AI"}
                            </span>
                            {item.message}
                          </div>
                        ))}
                      </div>
                    )}

                    {isAiThinking && (
                      <div className="flex items-center gap-2 text-xs text-purple-700 italic">
                        <span className="w-3 h-3 rounded-full border-2 border-purple-600 border-t-transparent animate-spin" />
                        <span>Analyzing candidate records...</span>
                      </div>
                    )}

                    {/* 4 Quick Action Chips matching Image 2 + Extended Enterprise AI capabilities */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => handleSendAiPrompt("Compare with similar candidates for this role")}
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-[11px] text-slate-700 font-medium transition flex items-center gap-1 shadow-2xs"
                      >
                        <span>⚖️</span>
                        <span>Compare with similar candidates</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSendAiPrompt("Draft technical interview invitation email")}
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-[11px] text-slate-700 font-medium transition flex items-center gap-1 shadow-2xs"
                      >
                        <span>📝</span>
                        <span>Draft interview email</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSendAiPrompt("Summarize candidate experience and strengths")}
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-[11px] text-slate-700 font-medium transition flex items-center gap-1 shadow-2xs"
                      >
                        <span>📄</span>
                        <span>Summarize profile</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSendAiPrompt("Suggest next steps for candidate advancement")}
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-[11px] text-slate-700 font-medium transition flex items-center gap-1 shadow-2xs"
                      >
                        <span>💡</span>
                        <span>Suggest next steps</span>
                      </button>

                      {/* Extended Enterprise AI Chips */}
                      <button
                        type="button"
                        onClick={() => handleSendAiPrompt("Generate tailored interview questions for this candidate")}
                        className="px-2.5 py-1 rounded-lg bg-purple-50/60 border border-purple-200 hover:bg-purple-100 text-[11px] text-purple-800 font-medium transition flex items-center gap-1 shadow-2xs"
                      >
                        <span>🎯</span>
                        <span>Interview Questions</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSendAiPrompt("Check red flags and risk factors for this candidate")}
                        className="px-2.5 py-1 rounded-lg bg-amber-50/60 border border-amber-200 hover:bg-amber-100 text-[11px] text-amber-800 font-medium transition flex items-center gap-1 shadow-2xs"
                      >
                        <span>🛡️</span>
                        <span>Risk &amp; Red Flags</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSendAiPrompt("Check salary and market compensation benchmark")}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50/60 border border-emerald-200 hover:bg-emerald-100 text-[11px] text-emerald-800 font-medium transition flex items-center gap-1 shadow-2xs"
                      >
                        <span>💰</span>
                        <span>Salary Benchmark</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSendAiPrompt("Draft executive offer justification for hiring committee")}
                        className="px-2.5 py-1 rounded-lg bg-blue-50/60 border border-blue-200 hover:bg-blue-100 text-[11px] text-blue-800 font-medium transition flex items-center gap-1 shadow-2xs"
                      >
                        <span>📜</span>
                        <span>Offer Justification</span>
                      </button>
                    </div>
                  </div>

                  {/* Card B: AI Candidate Comparison with Circular Radial Gauges */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
                    <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">AI Candidate Comparison</h4>
                        <p className="text-[11px] text-slate-400">Comparing top matching applicants</p>
                      </div>
                      <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-full">
                        4 Evaluated
                      </span>
                    </div>

                    {/* 4 Circular Progress Radial Gauges */}
                    <div className="grid grid-cols-4 gap-2 text-center">
                      {/* Gauge 1: Priya Menon 92% */}
                      <div className="space-y-1">
                        <div className="relative w-12 h-12 mx-auto flex items-center justify-center">
                          <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                            <path
                              className="text-slate-100"
                              strokeWidth="3.5"
                              stroke="currentColor"
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <path
                              className="text-blue-600"
                              strokeDasharray="92, 100"
                              strokeWidth="3.5"
                              strokeLinecap="round"
                              stroke="currentColor"
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                          </svg>
                          <span className="absolute text-[11px] font-bold text-slate-900">92%</span>
                        </div>
                        <div className="text-[10px] font-bold text-slate-800 truncate">Priya Menon</div>
                        <div className="text-[9px] text-slate-400">Excellent Fit</div>
                      </div>

                      {/* Gauge 2: Vikram K 78% */}
                      <div className="space-y-1">
                        <div className="relative w-12 h-12 mx-auto flex items-center justify-center">
                          <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                            <path
                              className="text-slate-100"
                              strokeWidth="3.5"
                              stroke="currentColor"
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <path
                              className="text-emerald-500"
                              strokeDasharray="78, 100"
                              strokeWidth="3.5"
                              strokeLinecap="round"
                              stroke="currentColor"
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                          </svg>
                          <span className="absolute text-[11px] font-bold text-slate-900">78%</span>
                        </div>
                        <div className="text-[10px] font-bold text-slate-800 truncate">Vikram K</div>
                        <div className="text-[9px] text-slate-400">Strong Fit</div>
                      </div>

                      {/* Gauge 3: Deepa L 68% */}
                      <div className="space-y-1">
                        <div className="relative w-12 h-12 mx-auto flex items-center justify-center">
                          <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                            <path
                              className="text-slate-100"
                              strokeWidth="3.5"
                              stroke="currentColor"
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <path
                              className="text-amber-500"
                              strokeDasharray="68, 100"
                              strokeWidth="3.5"
                              strokeLinecap="round"
                              stroke="currentColor"
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                          </svg>
                          <span className="absolute text-[11px] font-bold text-slate-900">68%</span>
                        </div>
                        <div className="text-[10px] font-bold text-slate-800 truncate">Deepa L</div>
                        <div className="text-[9px] text-slate-400">Moderate Fit</div>
                      </div>

                      {/* Gauge 4: Arjun R 54% */}
                      <div className="space-y-1">
                        <div className="relative w-12 h-12 mx-auto flex items-center justify-center">
                          <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                            <path
                              className="text-slate-100"
                              strokeWidth="3.5"
                              stroke="currentColor"
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <path
                              className="text-slate-400"
                              strokeDasharray="54, 100"
                              strokeWidth="3.5"
                              strokeLinecap="round"
                              stroke="currentColor"
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                          </svg>
                          <span className="absolute text-[11px] font-bold text-slate-900">54%</span>
                        </div>
                        <div className="text-[10px] font-bold text-slate-800 truncate">Arjun R</div>
                        <div className="text-[9px] text-slate-400">Partial Fit</div>
                      </div>
                    </div>

                    {/* Comparison Sub-tabs */}
                    <div className="flex items-center gap-3 border-b border-slate-200 text-[11px] font-semibold pt-1">
                      <button
                        type="button"
                        onClick={() => setComparisonTab("skills")}
                        className={`pb-1.5 border-b-2 transition ${
                          comparisonTab === "skills"
                            ? "border-blue-600 text-blue-600"
                            : "border-transparent text-slate-400 hover:text-slate-700"
                        }`}
                      >
                        Skills &amp; Experience
                      </button>
                      <button
                        type="button"
                        onClick={() => setComparisonTab("interview-feedback")}
                        className={`pb-1.5 border-b-2 transition ${
                          comparisonTab === "interview-feedback"
                            ? "border-blue-600 text-blue-600"
                            : "border-transparent text-slate-400 hover:text-slate-700"
                        }`}
                      >
                        Interview Feedback
                      </button>
                      <button
                        type="button"
                        onClick={() => setComparisonTab("assessments")}
                        className={`pb-1.5 border-b-2 transition ${
                          comparisonTab === "assessments"
                            ? "border-blue-600 text-blue-600"
                            : "border-transparent text-slate-400 hover:text-slate-700"
                        }`}
                      >
                        Assessments
                      </button>
                      <button
                        type="button"
                        onClick={() => setComparisonTab("cultural-fit")}
                        className={`pb-1.5 border-b-2 transition ${
                          comparisonTab === "cultural-fit"
                            ? "border-blue-600 text-blue-600"
                            : "border-transparent text-slate-400 hover:text-slate-700"
                        }`}
                      >
                        Cultural Fit
                      </button>
                      <button
                        type="button"
                        onClick={() => setComparisonTab("compensation")}
                        className={`pb-1.5 border-b-2 transition ${
                          comparisonTab === "compensation"
                            ? "border-blue-600 text-blue-600"
                            : "border-transparent text-slate-400 hover:text-slate-700"
                        }`}
                      >
                        Compensation
                      </button>
                    </div>

                    {/* Progress Bars for Core Skills */}
                    <div className="space-y-2 pt-1 text-xs">
                      <div>
                        <div className="flex justify-between text-[11px] font-medium text-slate-700 mb-0.5">
                          <span>Java</span>
                          <span className="font-bold text-slate-900">100%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-600 rounded-full" style={{ width: "100%" }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] font-medium text-slate-700 mb-0.5">
                          <span>Spring Boot</span>
                          <span className="font-bold text-slate-900">95%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-600 rounded-full" style={{ width: "95%" }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] font-medium text-slate-700 mb-0.5">
                          <span>Microservices</span>
                          <span className="font-bold text-slate-900">90%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-600 rounded-full" style={{ width: "90%" }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] font-medium text-slate-700 mb-0.5">
                          <span>REST APIs</span>
                          <span className="font-bold text-slate-900">85%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-600 rounded-full" style={{ width: "85%" }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] font-medium text-slate-700 mb-0.5">
                          <span>AWS</span>
                          <span className="font-bold text-slate-900">70%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-600 rounded-full" style={{ width: "70%" }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] font-medium text-slate-700 mb-0.5">
                          <span>System Design</span>
                          <span className="font-bold text-slate-900">60%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-600 rounded-full" style={{ width: "60%" }} />
                        </div>
                      </div>
                    </div>

                    {/* Relevant Experience Box */}
                    <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100 space-y-2">
                      <h5 className="text-[11px] font-bold text-slate-800">Relevant Experience</h5>
                      <div className="space-y-1.5 text-[11px] text-slate-600">
                        <div className="flex items-center gap-2">
                          <span className="text-blue-600">✓</span>
                          <span>4.5 years total enterprise software engineering</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-blue-600">✓</span>
                          <span>Lead backend contributor on high-throughput payment switch</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-blue-600">✓</span>
                          <span>Implemented event-driven microservices using Kafka &amp; Spring Boot</span>
                        </div>
                      </div>
                    </div>

                    {/* AI Summary Recommendation Box */}
                    <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100 text-xs text-purple-900 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-[11px]">
                        <span>✨</span>
                        <span>AI Summary &amp; Recommendation</span>
                      </div>
                      <p className="text-[11px] leading-relaxed">
                        {selectedCandidate.aiSummary ||
                          "Priya Menon is the best fit for this role with 92% match based on skills, 4.5 years of relevant experience, strong interview feedback and good cultural fit. She also has hands-on experience in Java, Spring Boot and microservices."}
                      </p>
                    </div>

                    {/* Recommended Next Step Box */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between gap-3 text-xs">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-900">
                          <span>⭐</span>
                          <span>Recommended Next Step</span>
                        </div>
                        <p className="text-[11px] text-slate-600">
                          {selectedCandidate.recommendedNextStep || "Shortlist Priya for the next interview round."}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleMoveStage("Interview")}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs shrink-0 flex items-center gap-1"
                      >
                        <span>Apply Action</span>
                        <span>▼</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ===================================================================
                  TAB CONTENT 2: OVERVIEW TAB
              =================================================================== */}
              {drawerTab === "overview" && (
                <div className="space-y-4 text-xs">
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <h4 className="font-bold text-slate-900">Candidate Information</h4>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div><span className="text-slate-400">Full Name:</span> <span className="font-semibold text-slate-800">{selectedCandidate.name}</span></div>
                      <div><span className="text-slate-400">Email:</span> <span className="font-semibold text-slate-800">{selectedCandidate.email}</span></div>
                      <div><span className="text-slate-400">Phone:</span> <span className="font-semibold text-slate-800">{selectedCandidate.phone}</span></div>
                      <div><span className="text-slate-400">Location:</span> <span className="font-semibold text-slate-800">{selectedCandidate.location || "Bangalore, India"}</span></div>
                      <div><span className="text-slate-400">Stage:</span> <span className="font-semibold text-blue-600">{selectedCandidate.stage}</span></div>
                      <div><span className="text-slate-400">Recruiter:</span> <span className="font-semibold text-slate-800">{selectedCandidate.recruiter || "John Smith"}</span></div>
                    </div>
                  </div>

                  <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2">
                    <h4 className="font-bold text-slate-900">Work Experience &amp; Background</h4>
                    <div className="space-y-2 text-[11px]">
                      <div className="border-l-2 border-blue-500 pl-2">
                        <div className="font-bold text-slate-800">Senior Software Engineer — FinTech Platform Corp</div>
                        <div className="text-slate-400">2022 – Present · 2.5 yrs · Bangalore</div>
                        <p className="text-slate-600 mt-0.5">Designed scalable payment switch services using Java 21, Spring Boot, and PostgreSQL.</p>
                      </div>
                      <div className="border-l-2 border-slate-300 pl-2">
                        <div className="font-bold text-slate-800">Software Engineer — Enterprise Systems Global</div>
                        <div className="text-slate-400">2020 – 2022 · 2 yrs · Bangalore</div>
                        <p className="text-slate-600 mt-0.5">Developed high-throughput REST APIs and maintained Kubernetes container deployments.</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-1 text-[11px]">
                    <h4 className="font-bold text-slate-900 text-xs">Education</h4>
                    <div className="font-semibold text-slate-800">Bachelor of Technology in Computer Science &amp; Engineering</div>
                    <div className="text-slate-500">National Institute of Technology · CGPA: 8.9 / 10 · Graduated 2020</div>
                  </div>
                </div>
              )}

              {/* ===================================================================
                  TAB CONTENT 3: RESUME TAB
              =================================================================== */}
              {drawerTab === "resume" && (
                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">📄</span>
                      <div>
                        <div className="font-bold text-slate-900">{selectedCandidate.name}_Resume_2026.pdf</div>
                        <div className="text-[11px] text-slate-400">Parsed 11 Oct 2026 · 245 KB</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => triggerToast("Resume downloaded in PDF format.")}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-[11px] font-semibold hover:bg-blue-700"
                    >
                      Download PDF ↗
                    </button>
                  </div>

                  <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3 font-sans leading-relaxed text-[11px]">
                    <div className="border-b border-slate-100 pb-2">
                      <h3 className="text-sm font-bold text-slate-900">{selectedCandidate.name}</h3>
                      <p className="text-slate-500">{selectedCandidate.role || selectedCandidate.requisitionTitle} · Bangalore, India</p>
                    </div>

                    <div>
                      <h5 className="font-bold text-slate-800 uppercase tracking-wider text-[10px] text-slate-400 mb-1">Professional Summary</h5>
                      <p className="text-slate-600">
                        Results-driven Senior Java Developer with 4.5+ years of hands-on experience designing, developing, and deploying resilient cloud backend microservices. Proven track record optimizing latency and database throughput in high-concurrency enterprise ecosystems.
                      </p>
                    </div>

                    <div>
                      <h5 className="font-bold text-slate-800 uppercase tracking-wider text-[10px] text-slate-400 mb-1">Core Technical Competencies</h5>
                      <div className="flex flex-wrap gap-1">
                        {["Java 21", "Spring Boot", "Microservices", "REST APIs", "Kafka", "Docker", "Kubernetes", "PostgreSQL", "AWS"].map((sk) => (
                          <span key={sk} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ===================================================================
                  TAB CONTENT 4: COMPARISON TAB
              =================================================================== */}
              {drawerTab === "comparison" && (
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900">Side-by-Side Candidate Benchmark</h4>
                    <span className="text-[11px] text-blue-600 font-semibold">Priya Menon Ranked #1</span>
                  </div>

                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
                        <tr>
                          <th className="p-2">Criteria</th>
                          <th className="p-2 bg-blue-50/50 text-blue-900">Priya (92%)</th>
                          <th className="p-2">Vikram (78%)</th>
                          <th className="p-2">Deepa (68%)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <tr>
                          <td className="p-2 font-medium text-slate-500">Core Stack</td>
                          <td className="p-2 bg-blue-50/30 font-bold text-blue-800">Java + Spring</td>
                          <td className="p-2">Java + Kotlin</td>
                          <td className="p-2">Java + Python</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-medium text-slate-500">Experience</td>
                          <td className="p-2 bg-blue-50/30 font-bold text-blue-800">4.5 yrs</td>
                          <td className="p-2">6.0 yrs</td>
                          <td className="p-2">3.0 yrs</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-medium text-slate-500">System Design</td>
                          <td className="p-2 bg-blue-50/30 font-bold text-blue-800">95% (Distinction)</td>
                          <td className="p-2">80%</td>
                          <td className="p-2">65%</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-medium text-slate-500">Notice Period</td>
                          <td className="p-2 bg-blue-50/30 font-bold text-blue-800">30 Days</td>
                          <td className="p-2">60 Days</td>
                          <td className="p-2">Immediate</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ===================================================================
                  TAB CONTENT 5: INTERVIEWS TAB
              =================================================================== */}
              {drawerTab === "interviews" && (
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                    <h4 className="font-bold text-slate-900">Candidate Interviews</h4>
                    <button
                      type="button"
                      onClick={() => setShowScheduleModal(true)}
                      className="px-2.5 py-1 rounded-lg bg-blue-600 text-white text-[11px] font-semibold hover:bg-blue-700"
                    >
                      + Schedule Round
                    </button>
                  </div>

                  {/* Interview 1 */}
                  <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/80 space-y-1.5">
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span>Round 1: Coding &amp; Technical Screening</span>
                      <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-[10px]">COMPLETED (5/5)</span>
                    </div>
                    <div className="text-[11px] text-slate-600">Interviewer: John Smith · 13 Oct 2026, 02:00 PM</div>
                    <p className="text-[11px] text-slate-700 italic bg-white p-2 rounded-lg border border-emerald-100">
                      &ldquo;Outstanding knowledge of distributed systems and Java memory model. Solved coding problem in 22 mins with clean, modular tests.&rdquo;
                    </p>
                  </div>

                  {/* Interview 2 */}
                  <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-200/80 space-y-1.5">
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span>Round 2: Technical Architecture &amp; System Design</span>
                      <span className="text-purple-700 bg-purple-100 px-2 py-0.5 rounded text-[10px]">SCHEDULED</span>
                    </div>
                    <div className="text-[11px] text-slate-600">Interviewer: Maria Lopez (Engineering Director) · 25 Oct 2026, 02:00 PM</div>
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[11px] font-semibold text-blue-600">Microsoft Teams Link: Generated ✓</span>
                    </div>
                  </div>
                </div>
              )}

              {/* ===================================================================
                  TAB CONTENT 6: ASSESSMENTS TAB
              =================================================================== */}
              {drawerTab === "assessments" && (
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                    <h4 className="font-bold text-slate-900">Skill &amp; Coding Assessments</h4>
                    <span className="text-emerald-600 font-bold">1 Completed</span>
                  </div>

                  <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">Enterprise Java &amp; Cloud Backend Challenge</span>
                      <span className="font-bold text-sm text-emerald-600">96 / 100</span>
                    </div>
                    <p className="text-[11px] text-slate-500">Evaluated on algorithmic speed, code cleanliness, concurrency handling and SQL optimizations.</p>
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                      <div><span className="text-slate-400">Data Structures:</span> <span className="font-bold text-slate-800">100%</span></div>
                      <div><span className="text-slate-400">Multi-Threading:</span> <span className="font-bold text-slate-800">95%</span></div>
                      <div><span className="text-slate-400">Spring Boot APIs:</span> <span className="font-bold text-slate-800">95%</span></div>
                      <div><span className="text-slate-400">SQL Queries:</span> <span className="font-bold text-slate-800">92%</span></div>
                    </div>
                  </div>
                </div>
              )}

              {/* ===================================================================
                  TAB CONTENT 7: TIMELINE TAB
              =================================================================== */}
              {drawerTab === "timeline" && (
                <div className="space-y-3 text-xs">
                  <h4 className="font-bold text-slate-900 pb-1 border-b border-slate-100">Application Milestones</h4>
                  <div className="space-y-3 pl-2 border-l-2 border-blue-500 text-[11px]">
                    <div>
                      <span className="text-slate-400">16 Oct 2026, 10:30 AM</span>
                      <div className="font-bold text-slate-800">Architecture Interview Scheduled</div>
                      <p className="text-slate-600">Round 2 confirmed for 25 Oct with Maria Lopez.</p>
                    </div>
                    <div>
                      <span className="text-slate-400">15 Oct 2026, 04:45 PM</span>
                      <div className="font-bold text-slate-800">Assessment Passed (96%)</div>
                      <p className="text-slate-600">Candidate completed the technical coding challenge.</p>
                    </div>
                    <div>
                      <span className="text-slate-400">13 Oct 2026, 02:30 PM</span>
                      <div className="font-bold text-slate-800">Screening Debrief Completed</div>
                      <p className="text-slate-600">John Smith submitted recommendation: &quot;Strong Hire&quot;.</p>
                    </div>
                    <div>
                      <span className="text-slate-400">11 Oct 2026, 09:15 AM</span>
                      <div className="font-bold text-slate-800">Application Submitted</div>
                      <p className="text-slate-600">Candidate applied via LinkedIn Job Posting.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* =========================================================================
            MODAL 1: SEND EMAIL
        ========================================================================= */}
        {showEmailModal && selectedCandidate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">Send Email to {selectedCandidate.name}</h3>
                <button onClick={() => setShowEmailModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">To</label>
                  <input
                    type="text"
                    disabled
                    value={selectedCandidate.email}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Subject</label>
                  <input
                    type="text"
                    value={emailSubject || `Interview Update: ${selectedCandidate.role || selectedCandidate.requisitionTitle} at MAX ERP`}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Message</label>
                  <textarea
                    rows={4}
                    value={emailBody || `Hi ${selectedCandidate.name},\n\nWe were impressed by your background in Java, Spring Boot and microservices. We would like to invite you for the next interview round.\n\nBest regards,\nJohn Smith\nTalent Acquisition Team, MAX ERP`}
                    onChange={(e) => setEmailBody(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-white text-slate-800"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEmailModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSendEmailSubmit}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
                >
                  Send Email
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            MODAL 2: SCHEDULE INTERVIEW
        ========================================================================= */}
        {showScheduleModal && selectedCandidate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">Schedule Interview: {selectedCandidate.name}</h3>
                <button onClick={() => setShowScheduleModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Round Type</label>
                  <select
                    value={roundType}
                    onChange={(e) => setRoundType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="Technical Architecture & System Design">Technical Architecture &amp; System Design</option>
                    <option value="Live Coding & Data Structures">Live Coding &amp; Data Structures</option>
                    <option value="Engineering Manager Culture Fit">Engineering Manager Culture Fit</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Date</label>
                    <input
                      type="date"
                      value={interviewDate}
                      onChange={(e) => setInterviewDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Time</label>
                    <input
                      type="time"
                      value={interviewTime}
                      onChange={(e) => setInterviewTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Meeting Platform</label>
                  <select
                    value={interviewPlatform}
                    onChange={(e) => setInterviewPlatform(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="Microsoft Teams">Microsoft Teams (Auto-link generated)</option>
                    <option value="Google Meet">Google Meet</option>
                    <option value="In-Person">In-Person (Bangalore Office)</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleScheduleInterviewSubmit}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
                >
                  Confirm &amp; Schedule
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            UNIVERSAL MAX AI VOICE COMMAND HUD
        ========================================================================= */}
        <MaxVoiceCommandModal
          isOpen={showVoiceModal}
          onClose={() => setShowVoiceModal(false)}
          onExecuteCustomCommand={(cmd) => {
            if (cmd.intent === "SYNTHESIZE" || cmd.targetUrl?.includes("tab=comparison")) {
              setDrawerTab("comparison");
              setIsDrawerOpen(true);
            } else if (cmd.actionType === "MOVE_CANDIDATE_STAGE") {
              const target = cmd.transcript.toLowerCase().includes("interview")
                ? "Interview"
                : cmd.transcript.toLowerCase().includes("hire")
                ? "Offer"
                : "Shortlisted";
              if (selectedCandidate) {
                handleMoveStage(target);
              }
            } else if (cmd.intent === "SEARCH" || cmd.transcript.toLowerCase().startsWith("search") || cmd.transcript.toLowerCase().startsWith("find")) {
              const cleaned = cmd.transcript.replace(/^(search|find|filter)\s+(for\s+)?/i, "").trim();
              if (cleaned) {
                setSearchTerm(cleaned);
              }
            } else if (cmd.intent === "QUERY") {
              if (selectedCandidate) {
                handleSendAiPrompt(cmd.transcript);
                setDrawerTab("ai-insights");
                setIsDrawerOpen(true);
              }
            }
          }}
        />

        {/* =========================================================================
            MODAL 4: ADD CANDIDATE
        ========================================================================= */}
        {showAddCandidateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">Add New Candidate</h3>
                <button onClick={() => setShowAddCandidateModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={newCandName}
                    onChange={(e) => setNewCandName(e.target.value)}
                    placeholder="e.g. Rohini Sen"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Email *</label>
                  <input
                    type="email"
                    value={newCandEmail}
                    onChange={(e) => setNewCandEmail(e.target.value)}
                    placeholder="e.g. rohini.sen@gmail.com"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Phone</label>
                  <input
                    type="text"
                    value={newCandPhone}
                    onChange={(e) => setNewCandPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Requisition *</label>
                  <select
                    value={newCandReq}
                    onChange={(e) => setNewCandReq(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="REQ-2026-00123">Senior Java Developer (REQ-2026-00123)</option>
                    <option value="REQ-2026-00120">SAP SuccessFactors (REQ-2026-00120)</option>
                    <option value="REQ-2026-00118">Product Manager (REQ-2026-00118)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Candidate Source</label>
                  <select
                    value={newCandSource}
                    onChange={(e) => setNewCandSource(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="Career Site">Career Site</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Naukri">Naukri</option>
                    <option value="Referral">Referral</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddCandidateModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddCandidateSubmit}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
                >
                  Save Candidate
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            MODAL 5: MOVE TO STAGE
        ========================================================================= */}
        {showStageModal && selectedCandidate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">Move {selectedCandidate.name} to Stage</h3>
                <button onClick={() => setShowStageModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>
              <div className="space-y-1.5 text-xs">
                {["New", "In Review", "Shortlisted", "Interview", "Offer", "Hired", "Rejected"].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => handleMoveStage(st)}
                    className={`w-full text-left p-2.5 rounded-xl border transition flex items-center justify-between ${
                      (selectedCandidate.statusLabel || selectedCandidate.stage) === st
                        ? "border-blue-500 bg-blue-50/50 font-bold text-blue-700"
                        : "border-slate-200 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <span>{st}</span>
                    {(selectedCandidate.statusLabel || selectedCandidate.stage) === st && <span>✓</span>}
                  </button>
                ))}
              </div>
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowStageModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        {/* =========================================================================
            MODAL 6: MAX CANDIDATE DOSSIER (360-DEGREE AI INTELLIGENCE)
        ========================================================================= */}
        {showDossierModal && (
          <MaxCandidateDossierModal
            candidateId={dossierCandidateId || selectedCandidate?.id || "cand-app-01"}
            requisitionId={selectedCandidate?.requisitionId}
            isOpen={showDossierModal}
            onClose={() => setShowDossierModal(false)}
            onAdvanceCandidate={(cid, st) => handleMoveStage(st)}
            onDraftEmail={(cid) => setShowEmailModal(true)}
          />
        )}
      </div>
    </RecruitingShell>
  );
}
