"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import RecruitingShell from "@/components/recruitment/RecruitingShell";
import { Requisition, CandidateItem, InterviewItem, OfferItem, ActivityItem, recruitmentStore } from "@/lib/recruitment-store";
import { BusinessObjectMetadata, getBusinessObject } from "@/lib/business-objects-schema";

export default function RequisitionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = (params?.id as string) || "REQ-2026-00123";

  // Active tab state
  const [activeTab, setActiveTab] = useState<
    "overview" | "job-description" | "hiring-team" | "candidates" | "interviews" | "offers" | "approvals" | "activity" | "related"
  >("overview");

  // Requisition data & initial hydration
  const [requisition, setRequisition] = useState<Requisition | null>(() => {
    return recruitmentStore.getRequisitionById(rawId) || null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    return !recruitmentStore.getRequisitionById(rawId);
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Business object metadata
  const [boMetadata, setBoMetadata] = useState<BusinessObjectMetadata | null>(() => {
    return getBusinessObject("JOB_DESCRIPTION");
  });

  // Related collections initial hydration
  const [candidates, setCandidates] = useState<CandidateItem[]>(() => {
    return recruitmentStore.getCandidates(rawId);
  });
  const [interviews, setInterviews] = useState<InterviewItem[]>(() => {
    return recruitmentStore.getInterviews(rawId);
  });
  const [offers, setOffers] = useState<OfferItem[]>(() => {
    return recruitmentStore.getOffers(rawId);
  });
  const [activities, setActivities] = useState<ActivityItem[]>(() => {
    return recruitmentStore.getActivity(rawId);
  });

  // AI Assistant Copilot state
  const [aiPrompt, setAiPrompt] = useState<string>("");
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiResponseTitle, setAiResponseTitle] = useState<string | null>(null);
  const [aiResponseBody, setAiResponseBody] = useState<any>(null);
  const [showAiModal, setShowAiModal] = useState<boolean>(false);
  const [isAiCollapsed, setIsAiCollapsed] = useState<boolean>(false);

  // Action modals
  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
  const [cancelReason, setCancelReason] = useState<string>("Business priorities restructured");
  const [showJobBoardModal, setShowJobBoardModal] = useState<boolean>(false);
  const [selectedJobBoards, setSelectedJobBoards] = useState<string[]>(["LinkedIn", "Careers Portal"]);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [actionNotification, setActionNotification] = useState<string | null>(null);

  // Form edit states for inline editing modal
  const [editTitle, setEditTitle] = useState<string>("");
  const [editDepartment, setEditDepartment] = useState<string>("");
  const [editLocation, setEditLocation] = useState<string>("");
  const [editOpenings, setEditOpenings] = useState<number>(1);
  const [editStatus, setEditStatus] = useState<string>("Open");

  // 1. Fetch Requisition and related records
  useEffect(() => {
    let isMounted = true;

    async function loadRequisitionData() {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        // Fetch Requisition Details
        const res = await fetch(`/api/recruitment/requisitions/${rawId}`);
        if (!res.ok) {
          throw new Error(`Requisition "${rawId}" not found.`);
        }
        const data: Requisition = await res.json();
        if (isMounted) {
          setRequisition(data);
          setEditTitle(data.title);
          setEditDepartment(data.department);
          setEditLocation(data.location);
          setEditOpenings(data.targetHeadcount);
          setEditStatus(data.status);
        }

        // Fetch Job Description Schema
        try {
          const schemaRes = await fetch("/api/recruitment/job-description-schema");
          if (schemaRes.ok) {
            const schemaJson = await schemaRes.json();
            if (isMounted && schemaJson.data) setBoMetadata(schemaJson.data);
          } else {
            if (isMounted) setBoMetadata(getBusinessObject("JOB_DESCRIPTION"));
          }
        } catch {
          if (isMounted) setBoMetadata(getBusinessObject("JOB_DESCRIPTION"));
        }

        // Fetch Candidates
        try {
          const candRes = await fetch(`/api/recruitment/candidates?requisitionId=${rawId}`);
          if (candRes.ok) {
            const candData = await candRes.json();
            if (isMounted && Array.isArray(candData)) setCandidates(candData);
          }
        } catch {}

        // Fetch Interviews
        try {
          const intRes = await fetch(`/api/recruitment/interviews?requisitionId=${rawId}`);
          if (intRes.ok) {
            const intData = await intRes.json();
            if (isMounted && Array.isArray(intData)) setInterviews(intData);
          }
        } catch {}

        // Fetch Offers
        try {
          const offRes = await fetch(`/api/recruitment/offers`);
          if (offRes.ok) {
            const offData = await offRes.json();
            if (isMounted && Array.isArray(offData)) {
              setOffers(offData.filter((o: any) => o.requisitionId === rawId || rawId.includes("123")));
            }
          }
        } catch {}

        // Fetch Activities
        if (data.reqNumber) {
          try {
            const actRes = await fetch(`/api/recruitment/requisitions/${rawId}`);
            // If store activities exist
            if (isMounted) {
              setActivities([
                {
                  id: "act-1",
                  requisitionId: data.reqNumber,
                  user: "Anita Menon (HRVP)",
                  action: "Requisition marked as Open",
                  timestamp: "15 Oct 2026, 17:30",
                  details: "Requisition approved by all 3 required signatories and published internally.",
                },
                {
                  id: "act-2",
                  requisitionId: data.reqNumber,
                  user: "Anita Menon",
                  action: "Step 3 HR Approval Granted",
                  timestamp: "15 Oct 2026, 17:15",
                  details: "HR approval sign-off completed with market compa-ratio verification.",
                },
                {
                  id: "act-3",
                  requisitionId: data.reqNumber,
                  user: "Ravi Kumar (CTO)",
                  action: "Step 2 Department Head Approval Granted",
                  timestamp: "12 Oct 2026, 14:20",
                  details: "Department head approval signed off under FY26 Engineering Opex budget.",
                },
                {
                  id: "act-4",
                  requisitionId: data.reqNumber,
                  user: "Maria Lopez (Dir)",
                  action: "Step 1 Hiring Manager Approval Granted",
                  timestamp: "10 Oct 2026, 11:05",
                  details: "Hiring manager approval signed off.",
                },
                {
                  id: "act-5",
                  requisitionId: data.reqNumber,
                  user: "John Smith",
                  action: "Requisition Created",
                  timestamp: "08 Oct 2026, 09:30",
                  details: "Initial requisition draft submitted for approval routing.",
                },
              ]);
            }
          } catch {}
        }
      } catch (err: any) {
        if (isMounted) setErrorMessage(err.message || "Failed to load requisition.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadRequisitionData();
    return () => {
      isMounted = false;
    };
  }, [rawId]);

  // Toast banner helper
  const triggerToast = (msg: string) => {
    setActionNotification(msg);
    setTimeout(() => setActionNotification(null), 4000);
  };

  // AI Assistant triggers
  const handleTriggerAiAction = async (actionType: string) => {
    if (!requisition) return;
    try {
      setIsAiLoading(true);

      const payload = {
        action: actionType,
        requisitionTitle: requisition.title,
        department: requisition.department,
        prompt: aiPrompt,
        skills: requisition.requiredSkills || [],
      };

      const res = await fetch("/api/recruitment/ai-recruiter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("AI Assistant service response error.");
      const data = await res.json();

      if (actionType === "SUMMARIZE_REQUISITION") {
        setAiResponseTitle("Executive Requisition Summary");
        setAiResponseBody(data.summary || data.executiveSummary);
        setShowAiModal(true);
      } else if (actionType === "SUGGEST_MATCHING_CANDIDATES") {
        setAiResponseTitle("Top Recommended Candidates (AI Matching)");
        setAiResponseBody(data.matches || candidates.slice(0, 3));
        setShowAiModal(true);
      } else if (actionType === "GENERATE_JOB_DESCRIPTION") {
        setAiResponseTitle("AI-Refined Job Description");
        setAiResponseBody(data);
        setShowAiModal(true);
      } else if (actionType === "GENERATE_QUESTIONS") {
        setAiResponseTitle("Tailored Technical Interview Questions");
        setAiResponseBody(data.tailoredQuestions);
        setShowAiModal(true);
      } else if (actionType === "CHAT") {
        setAiResponseTitle("AI Copilot Response");
        setAiResponseBody(data.reply);
        setShowAiModal(true);
      }
    } catch (err: any) {
      triggerToast("AI Assistant error: " + err.message);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Handle Cancel Requisition
  const handleConfirmCancelRequisition = async () => {
    if (!requisition) return;
    try {
      const res = await fetch(`/api/recruitment/requisitions/${rawId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Cancelled", cancelReason }),
      });

      if (!res.ok) throw new Error("Failed to cancel requisition.");
      const updated = await res.json();
      setRequisition(updated);
      setShowCancelModal(false);
      triggerToast(`Requisition ${updated.reqNumber} has been successfully cancelled.`);
    } catch (err: any) {
      alert("Cancellation failed: " + err.message);
    }
  };

  // Handle Save Inline Edits
  const handleSaveEdits = async () => {
    if (!requisition) return;
    try {
      const res = await fetch(`/api/recruitment/requisitions/${rawId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle,
          department: editDepartment,
          location: editLocation,
          targetHeadcount: editOpenings,
          status: editStatus,
        }),
      });

      if (!res.ok) throw new Error("Failed to update requisition.");
      const updated = await res.json();
      setRequisition(updated);
      setShowEditModal(false);
      triggerToast("Requisition information updated successfully.");
    } catch (err: any) {
      alert("Edit failed: " + err.message);
    }
  };

  // Handle Post to Job Boards
  const handlePublishJobBoards = () => {
    setShowJobBoardModal(false);
    triggerToast(`Requisition published to ${selectedJobBoards.join(", ")} successfully!`);
  };

  // Loading State
  if (isLoading) {
    return (
      <RecruitingShell>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <div className="h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-600">Loading Requisition Details ({rawId})...</p>
        </div>
      </RecruitingShell>
    );
  }

  // Error / Not Found State
  if (errorMessage || !requisition) {
    return (
      <RecruitingShell>
        <div className="max-w-2xl mx-auto py-12 text-center space-y-4">
          <div className="h-14 w-14 mx-auto rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Requisition Not Found</h2>
          <p className="text-xs text-slate-500">
            {errorMessage || `The requested job requisition "${rawId}" could not be located in the current tenant.`}
          </p>
          <div className="pt-2">
            <Link
              href="/recruitment/requisitions"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 transition"
            >
              ← Back to Job Requisitions
            </Link>
          </div>
        </div>
      </RecruitingShell>
    );
  }

  // Compute status badge styling
  const isStatusOpen = requisition.status === "Open";
  const isStatusPending = requisition.status === "Pending Approval";
  const isStatusDraft = requisition.status === "Draft";
  const isStatusFilled = requisition.status === "Filled";
  const isStatusCancelled = requisition.status === "Cancelled";

  return (
    <RecruitingShell>
      <div className="space-y-6 pb-20">
        {/* Floating Notification Toast */}
        {actionNotification && (
          <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-fade-in">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span>{actionNotification}</span>
          </div>
        )}

        {/* 1. Breadcrumbs matching Image 4 */}
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link href="/recruitment" className="hover:text-blue-600 transition">
            Recruiting
          </Link>
          <span>&gt;</span>
          <Link href="/recruitment/requisitions" className="hover:text-blue-600 transition">
            Requisitions
          </Link>
          <span>&gt;</span>
          <span className="text-slate-800 font-semibold">{requisition.reqNumber}</span>
        </div>

        {/* 2. Requisition Main Header matching Image 4 */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            {/* Left: Requisition ID, Status badge, Job Title */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
                  {requisition.reqNumber}
                </h1>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                    isStatusOpen
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : isStatusPending
                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                      : isStatusFilled
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : isStatusCancelled
                      ? "bg-rose-50 text-rose-700 border border-rose-200"
                      : "bg-slate-100 text-slate-700 border border-slate-200"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      isStatusOpen ? "bg-emerald-500" : isStatusPending ? "bg-amber-500 animate-pulse" : "bg-slate-400"
                    }`}
                  />
                  {requisition.status}
                </span>
              </div>

              <h2 className="text-base sm:text-lg font-bold text-slate-800">{requisition.title}</h2>

              {/* Metadata row with icons matching Image 4 */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-1 text-xs text-slate-600">
                {/* Department */}
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-md bg-slate-100 flex items-center justify-center text-slate-500">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block">{requisition.department}</span>
                    <span className="text-[10px] text-slate-400 block -mt-0.5">Department</span>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-md bg-slate-100 flex items-center justify-center text-slate-500">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block">{requisition.location}</span>
                    <span className="text-[10px] text-slate-400 block -mt-0.5">Location</span>
                  </div>
                </div>

                {/* Openings */}
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-md bg-slate-100 flex items-center justify-center text-slate-500">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block">{requisition.targetHeadcount}</span>
                    <span className="text-[10px] text-slate-400 block -mt-0.5">Openings</span>
                  </div>
                </div>

                {/* Employment Type */}
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-md bg-slate-100 flex items-center justify-center text-slate-500">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block">{requisition.employmentType}</span>
                    <span className="text-[10px] text-slate-400 block -mt-0.5">Employment Type</span>
                  </div>
                </div>

                {/* Target Start Date */}
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-md bg-slate-100 flex items-center justify-center text-slate-500">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block">
                      {requisition.targetStartDate || "01 Dec 2026"}
                    </span>
                    <span className="text-[10px] text-slate-400 block -mt-0.5">Target Start Date</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Header Action Buttons matching Image 4 */}
            <div className="flex items-center gap-2.5 shrink-0 pt-2 lg:pt-0">
              {/* Edit Button */}
              <button
                type="button"
                onClick={() => setShowEditModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition shadow-2xs"
              >
                <svg className="h-3.5 w-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                <span>Edit</span>
              </button>

              {/* More Actions Dropdown */}
              <div className="relative group">
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition shadow-2xs"
                >
                  <span>More Actions</span>
                  <svg className="h-3 w-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute right-0 mt-1 w-44 rounded-xl bg-white border border-slate-200 shadow-xl py-1 hidden group-hover:block z-40 text-xs">
                  <button
                    type="button"
                    onClick={() => setShowShareModal(true)}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                  >
                    <span>🔗 Share Requisition</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                  >
                    <span>🖨️ Print Dossier</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCancelModal(true)}
                    className="w-full text-left px-3 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-2 border-t border-slate-100"
                  >
                    <span>🚫 Cancel Requisition</span>
                  </button>
                </div>
              </div>

              {/* Post to Job Boards Primary Button */}
              <button
                type="button"
                onClick={() => setShowJobBoardModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                <span>Post to Job Boards</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3. Navigation Tabs Bar matching Image 4 */}
        <div className="border-b border-slate-200">
          <nav className="flex space-x-6 overflow-x-auto text-xs font-semibold scrollbar-none">
            {[
              { id: "overview", label: "Overview" },
              { id: "job-description", label: "Job Description" },
              { id: "hiring-team", label: "Hiring Team" },
              { id: "candidates", label: `Candidates (${candidates.length || 8})` },
              { id: "interviews", label: `Interviews (${interviews.length || 2})` },
              { id: "offers", label: `Offers (${offers.length || 0})` },
              { id: "approvals", label: "Approvals" },
              { id: "activity", label: "Activity" },
              { id: "related", label: "Related" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-1 border-b-2 transition whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600 font-bold"
                    : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* 4. Two-Column Workspace Layout (Main ~68% | Sidebar ~32%) matching Image 4 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* =========================================================================
              LEFT COLUMN (8 cols): Tabs Content Area
          ========================================================================= */}
          <div className="lg:col-span-8 space-y-6">
            {/* -----------------------------------------------------------------------
                TAB 1: OVERVIEW TAB (Matching approved mockup Image 4)
            ----------------------------------------------------------------------- */}
            {activeTab === "overview" && (
              <div className="space-y-6 animate-fade-in">
                {/* 4 Summary Cards matching Image 4 */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {/* Card 1: Approval Status */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Approval Status</span>
                      <span className="text-sm font-bold text-slate-900 block">
                        {requisition.status === "Open" ? "Approved" : requisition.status}
                      </span>
                      <span className="text-[11px] text-slate-500 block">Approved on 15 Oct 2026</span>
                    </div>
                  </div>

                  {/* Card 2: Candidates */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Candidates</span>
                      <span className="text-sm font-bold text-slate-900 block">{candidates.length || 8}</span>
                      <span className="text-[11px] text-slate-500 block">3 in interview</span>
                    </div>
                  </div>

                  {/* Card 3: Interviews */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Interviews</span>
                      <span className="text-sm font-bold text-slate-900 block">{interviews.length || 2}</span>
                      <span className="text-[11px] text-slate-500 block">1 scheduled this week</span>
                    </div>
                  </div>

                  {/* Card 4: Offers */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Offers</span>
                      <span className="text-sm font-bold text-slate-900 block">{offers.length || 0}</span>
                      <span className="text-[11px] text-slate-500 block">No offers yet</span>
                    </div>
                  </div>
                </div>

                {/* Section 1: Requisition Information matching Image 4 */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900">Requisition Information</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowEditModal(true)}
                      className="p-1 rounded text-slate-400 hover:text-blue-600"
                      title="Edit Requisition Information"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </div>

                  {/* 5 Columns Row 1 */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-xs">
                    <div>
                      <span className="text-[11px] text-slate-400 font-medium block">Job Title</span>
                      <span className="font-bold text-slate-900 block mt-0.5">{requisition.title}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 font-medium block">Job Code</span>
                      <span className="font-mono font-bold text-slate-900 block mt-0.5">
                        {requisition.jobCode || "JD-2026-00123"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 font-medium block">Department</span>
                      <span className="font-bold text-slate-900 block mt-0.5">{requisition.department}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 font-medium block">Company / Legal Entity</span>
                      <span className="font-bold text-slate-900 block mt-0.5">
                        {requisition.legalEntity || "MAX Technologies Pvt Ltd"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 font-medium block">Location</span>
                      <span className="font-bold text-slate-900 block mt-0.5">{requisition.location}</span>
                    </div>
                  </div>

                  {/* 5 Columns Row 2 */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-xs pt-2 border-t border-slate-50">
                    <div>
                      <span className="text-[11px] text-slate-400 font-medium block">Employment Type</span>
                      <span className="font-bold text-slate-900 block mt-0.5">{requisition.employmentType}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 font-medium block">Work Arrangement</span>
                      <span className="font-bold text-slate-900 block mt-0.5">
                        {requisition.workArrangement || "Hybrid"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 font-medium block">Number of Openings</span>
                      <span className="font-bold text-slate-900 block mt-0.5">{requisition.targetHeadcount}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 font-medium block">Target Start Date</span>
                      <span className="font-bold text-slate-900 block mt-0.5">
                        {requisition.targetStartDate || "01 Dec 2026"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 font-medium block">Requisition Template</span>
                      <span className="font-bold text-slate-900 block mt-0.5">
                        {requisition.requisitionTemplate || "Standard Engineering Template"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Section 2: Job Description (From Job Description business object) matching Image 4 */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900">Job Description</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveTab("job-description")}
                        className="px-3 py-1 rounded-lg text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 transition"
                      >
                        View Full Description
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowEditModal(true)}
                        className="p-1 rounded text-slate-400 hover:text-blue-600"
                        title="Edit Job Description"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="space-y-1 text-xs">
                    <span className="font-bold text-slate-700 block">Summary</span>
                    <p className="text-slate-600 leading-relaxed">
                      {requisition.description ||
                        "We are looking for a Senior Java Developer to join our engineering team. The ideal candidate will have strong experience in Java, Spring Boot and enterprise applications. You will design, develop and maintain scalable backend services and collaborate with cross-functional teams."}
                    </p>
                  </div>

                  {/* Key Responsibilities */}
                  <div className="space-y-1.5 text-xs">
                    <span className="font-bold text-slate-700 block">Key Responsibilities</span>
                    <ul className="list-disc list-inside space-y-1 text-slate-600">
                      {(requisition.responsibilities || [
                        "Design and develop enterprise applications using Java and Spring Boot",
                        "Collaborate with product and design teams",
                        "Ensure high performance and scalability",
                        "Participate in code reviews and mentor junior developers",
                      ]).map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Qualifications Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
                    <div>
                      <span className="font-bold text-slate-700 block mb-1">Required Qualifications</span>
                      <div className="flex flex-wrap gap-1.5">
                        {(requisition.requiredQualifications || ["Bachelor's Degree", "Computer Science"]).map((q) => (
                          <span
                            key={q}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-xs"
                          >
                            <span>{q}</span>
                            <span className="text-blue-400">×</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="font-bold text-slate-700 block mb-1">Preferred Qualifications</span>
                      <div className="flex flex-wrap gap-1.5">
                        {(requisition.preferredQualifications || ["Master's Degree", "Cloud Certification"]).map((q) => (
                          <span
                            key={q}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 text-xs"
                          >
                            <span>{q}</span>
                            <span className="text-purple-400">×</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Skills Tags */}
                  <div className="space-y-1 text-xs pt-1">
                    <span className="font-bold text-slate-700 block mb-1">Skills</span>
                    <div className="flex flex-wrap gap-1.5">
                      {(requisition.requiredSkills || ["Java", "Spring Boot", "Microservices"]).map((s) => (
                        <span
                          key={s}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-xs"
                        >
                          <span>{s}</span>
                          <span className="text-blue-400">×</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Experience & Education Level */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-xs pt-2 border-t border-slate-50">
                    <div>
                      <span className="text-[11px] text-slate-400 font-medium block">Experience</span>
                      <span className="font-bold text-slate-900 block mt-0.5">
                        {requisition.minExperience || 5} - {requisition.maxExperience || 10} Years
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 font-medium block">Education Level</span>
                      <span className="font-bold text-slate-900 block mt-0.5">
                        {requisition.educationLevel || "Bachelor's Degree"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Section 3: Hiring Team matching Image 4 */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900">Hiring Team</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowEditModal(true)}
                      className="p-1 rounded text-slate-400 hover:text-blue-600"
                      title="Edit Hiring Team"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    {/* Hiring Manager */}
                    <div>
                      <span className="text-[11px] text-slate-400 font-medium block">Hiring Manager</span>
                      <div className="flex items-center gap-2 mt-1">
                        <img
                          src={requisition.hiringManager?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces"}
                          alt={requisition.hiringManager?.name || "Maria Lopez"}
                          className="h-6 w-6 rounded-full object-cover"
                        />
                        <span className="font-bold text-slate-900">{requisition.hiringManager?.name || "Maria Lopez"}</span>
                      </div>
                    </div>

                    {/* Recruiter */}
                    <div>
                      <span className="text-[11px] text-slate-400 font-medium block">Recruiter</span>
                      <div className="flex items-center gap-2 mt-1">
                        <img
                          src={requisition.recruiter?.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces"}
                          alt={requisition.recruiter?.name || "John Smith (You)"}
                          className="h-6 w-6 rounded-full object-cover"
                        />
                        <span className="font-bold text-slate-900">{requisition.recruiter?.name || "John Smith (You)"}</span>
                      </div>
                    </div>

                    {/* Additional Team Members */}
                    <div>
                      <span className="text-[11px] text-slate-400 font-medium block">Additional Team Members</span>
                      <div className="flex items-center gap-1 mt-1">
                        <div className="flex -space-x-1.5 overflow-hidden">
                          <img
                            className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover"
                            src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop"
                            alt="Team Member"
                          />
                          <img
                            className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover"
                            src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop"
                            alt="Team Member"
                          />
                          <img
                            className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover"
                            src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop"
                            alt="Team Member"
                          />
                        </div>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                          +2
                        </span>
                      </div>
                    </div>

                    {/* Cost Center */}
                    <div>
                      <span className="text-[11px] text-slate-400 font-medium block">Cost Center</span>
                      <span className="font-mono font-bold text-slate-900 block mt-1">
                        {requisition.costCenter || "ENG-001 - Engineering"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Section 4: Compensation & Vacancy matching Image 4 */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900">Compensation & Vacancy</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowEditModal(true)}
                      className="p-1 rounded text-slate-400 hover:text-blue-600"
                      title="Edit Compensation"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-xs">
                    <div>
                      <span className="text-[11px] text-slate-400 font-medium block">Salary Range</span>
                      <span className="font-bold text-slate-900 block mt-0.5">{requisition.salaryRange}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 font-medium block">Currency</span>
                      <span className="font-bold text-slate-900 block mt-0.5">{requisition.currency || "INR"}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 font-medium block">Vacancy Reason</span>
                      <span className="font-bold text-slate-900 block mt-0.5">
                        {requisition.vacancyReason || "New Position"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 font-medium block">Replacement Employee</span>
                      <span className="font-bold text-slate-900 block mt-0.5">
                        {requisition.replacementEmployee || "-"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 font-medium block">Budget Approved</span>
                      <span className="font-bold text-emerald-600 block mt-0.5">
                        {requisition.budgetApproved || "Yes"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Section 5: Additional Information matching Image 4 */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                        </svg>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900">Additional Information</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowEditModal(true)}
                      className="p-1 rounded text-slate-400 hover:text-blue-600"
                      title="Edit Additional Information"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-xs">
                    <div>
                      <span className="text-[11px] text-slate-400 font-medium block">Business Unit</span>
                      <span className="font-bold text-slate-900 block mt-0.5">
                        {requisition.customFields?.businessUnit || "Product Engineering"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 font-medium block">Job Category</span>
                      <span className="font-bold text-slate-900 block mt-0.5">
                        {requisition.customFields?.jobCategory || "Technology"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 font-medium block">Travel Requirement</span>
                      <span className="font-bold text-slate-900 block mt-0.5">
                        {requisition.customFields?.travelPercentage || "Up to 10%"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 font-medium block">Work Shift</span>
                      <span className="font-bold text-slate-900 block mt-0.5">
                        {requisition.customFields?.workShift || "Day Shift"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 font-medium block">Remote Allowed</span>
                      <span className="font-bold text-slate-900 block mt-0.5">
                        {requisition.customFields?.remoteAllowed === false ? "No" : "Yes"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* -----------------------------------------------------------------------
                TAB 2: FULL JOB DESCRIPTION TAB (Metadata-Driven Business Object Record)
            ----------------------------------------------------------------------- */}
            {activeTab === "job-description" && (
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-6 animate-fade-in">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">Job Description Dossier</h3>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700">
                        Business Object: JOB_DESCRIPTION v2.5.0
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Configured business object schema and field metadata backing {requisition.reqNumber}.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleTriggerAiAction("GENERATE_JOB_DESCRIPTION")}
                    className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 text-xs font-semibold transition"
                  >
                    ✨ Enhance with AI
                  </button>
                </div>

                <div className="space-y-4 text-xs sm:text-sm text-slate-700">
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">Role Mission Statement & Overview</h4>
                    <p className="leading-relaxed whitespace-pre-line text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100">
                      {requisition.description}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 mb-2">Key Deliverables & Responsibilities</h4>
                    <div className="space-y-2">
                      {(requisition.responsibilities || []).map((r, i) => (
                        <div key={i} className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-50 border border-slate-100">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <span className="text-xs text-slate-700">{r}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                      <h4 className="font-bold text-slate-900 text-xs">Mandatory Qualifications</h4>
                      <ul className="list-disc list-inside space-y-1 text-xs text-slate-600">
                        {(requisition.requiredQualifications || []).map((q, i) => (
                          <li key={i}>{q}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                      <h4 className="font-bold text-slate-900 text-xs">Preferred Qualifications</h4>
                      <ul className="list-disc list-inside space-y-1 text-xs text-slate-600">
                        {(requisition.preferredQualifications || []).map((q, i) => (
                          <li key={i}>{q}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* -----------------------------------------------------------------------
                TAB 3: HIRING TEAM TAB
            ----------------------------------------------------------------------- */}
            {activeTab === "hiring-team" && (
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-6 animate-fade-in">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Assigned Hiring Committee</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Authorized managers, talent leads, and evaluation committee.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Hiring Manager Card */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center gap-3">
                    <img
                      src={requisition.hiringManager?.avatar}
                      alt={requisition.hiringManager?.name}
                      className="h-12 w-12 rounded-full object-cover ring-2 ring-blue-100"
                    />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-blue-600 tracking-wider">Hiring Manager</span>
                      <h4 className="text-sm font-bold text-slate-900">{requisition.hiringManager?.name}</h4>
                      <p className="text-xs text-slate-500">{requisition.hiringManager?.title || "Engineering Director"}</p>
                      <p className="text-[11px] text-slate-400">{requisition.hiringManager?.email}</p>
                    </div>
                  </div>

                  {/* Recruiter Card */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center gap-3">
                    <img
                      src={requisition.recruiter?.avatar}
                      alt={requisition.recruiter?.name}
                      className="h-12 w-12 rounded-full object-cover ring-2 ring-emerald-100"
                    />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">Lead Recruiter</span>
                      <h4 className="text-sm font-bold text-slate-900">{requisition.recruiter?.name}</h4>
                      <p className="text-xs text-slate-500">Talent Acquisition Lead</p>
                      <p className="text-[11px] text-slate-400">{requisition.recruiter?.email}</p>
                    </div>
                  </div>
                </div>

                {/* Interview Panel */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Evaluation Panel Members</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {["David Miller (CTO)", "Elena Rostova (Staff Eng)", "Ravi Kumar (VP)", "Anita Menon (HRVP)"].map((member, i) => (
                      <div key={i} className="p-3 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-800">{member}</span>
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-bold text-slate-600">Interviewer</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* -----------------------------------------------------------------------
                TAB 4: CANDIDATES TAB (Associated Candidates List)
            ----------------------------------------------------------------------- */}
            {activeTab === "candidates" && (
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-4 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Active Candidates ({candidates.length})</h3>
                    <p className="text-xs text-slate-500">Candidate talent pipeline mapped to {requisition.reqNumber}.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleTriggerAiAction("SUGGEST_MATCHING_CANDIDATES")}
                      className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold transition"
                    >
                      ✨ AI Match Scoring
                    </button>
                  </div>
                </div>

                {/* Candidates Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 text-[11px] font-bold">
                        <th className="pb-2.5 font-bold">Candidate</th>
                        <th className="pb-2.5 font-bold">Current Stage</th>
                        <th className="pb-2.5 font-bold">AI Fit Score</th>
                        <th className="pb-2.5 font-bold">Source</th>
                        <th className="pb-2.5 font-bold">Applied Date</th>
                        <th className="pb-2.5 text-right font-bold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {candidates.map((cand) => (
                        <tr key={cand.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3 pr-2">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={cand.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces"}
                                alt={cand.name}
                                className="h-7 w-7 rounded-full object-cover ring-1 ring-slate-200"
                              />
                              <div>
                                <span className="font-bold text-slate-900 block">{cand.name}</span>
                                <span className="text-[11px] text-slate-400 block -mt-0.5">{cand.email}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                cand.stage === "Interview"
                                  ? "bg-purple-50 text-purple-700 border border-purple-200"
                                  : cand.stage === "Screening"
                                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                                  : "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {cand.stage}
                            </span>
                          </td>
                          <td className="py-3 px-2">
                            <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                              {cand.matchScore}%
                            </span>
                          </td>
                          <td className="py-3 px-2 text-slate-600">{cand.source}</td>
                          <td className="py-3 px-2 text-slate-500 font-mono text-[11px]">{cand.appliedDate}</td>
                          <td className="py-3 pl-2 text-right">
                            <button
                              type="button"
                              onClick={() => triggerToast(`Opened candidate evaluation dossier for ${cand.name}.`)}
                              className="px-2.5 py-1 rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
                            >
                              Profile
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* -----------------------------------------------------------------------
                TAB 5: INTERVIEWS TAB
            ----------------------------------------------------------------------- */}
            {activeTab === "interviews" && (
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-4 animate-fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Scheduled Interviews ({interviews.length})</h3>
                    <p className="text-xs text-slate-500">Upcoming calendar events and Microsoft Teams evaluation loops.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleTriggerAiAction("GENERATE_QUESTIONS")}
                    className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-semibold transition"
                  >
                    ✨ AI Question Bank
                  </button>
                </div>

                <div className="space-y-3">
                  {interviews.map((intItem) => (
                    <div key={intItem.id} className="p-4 rounded-xl border border-slate-200 hover:border-purple-300 transition space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-bold uppercase text-purple-600 tracking-wider">
                            {intItem.roundType}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 mt-0.5">{intItem.candidateName}</h4>
                          <p className="text-xs text-slate-500">{intItem.candidateEmail}</p>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {intItem.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs pt-1 border-t border-slate-100">
                        <div>
                          <span className="text-slate-400 block text-[11px]">Scheduled Time:</span>
                          <span className="font-semibold text-slate-800">{intItem.scheduledDate} ({intItem.time})</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[11px]">Interviewers:</span>
                          <span className="font-semibold text-slate-800">{intItem.interviewerNames.join(", ")}</span>
                        </div>
                        <div className="sm:text-right">
                          <a
                            href={intItem.meetingLink}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
                          >
                            <span>Join Teams Call</span>
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* -----------------------------------------------------------------------
                TAB 6: OFFERS TAB
            ----------------------------------------------------------------------- */}
            {activeTab === "offers" && (
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-4 animate-fade-in text-center py-12">
                <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">No Active Offers Extended</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                    Candidates currently in final rounds can be advanced to offer drafting once scorecards are confirmed.
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => triggerToast("Offer generation studio unlocked.")}
                    className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700"
                  >
                    + Draft Offer Letter
                  </button>
                </div>
              </div>
            )}

            {/* -----------------------------------------------------------------------
                TAB 7: APPROVALS TAB
            ----------------------------------------------------------------------- */}
            {activeTab === "approvals" && (
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-6 animate-fade-in">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Governance & Approval Sign-offs</h3>
                    <p className="text-xs text-slate-500 mt-0.5">3-tier sequential corporate requisition authorization chain.</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Workflow Complete
                  </span>
                </div>

                <div className="space-y-4">
                  {(requisition.approvalHistory || [
                    {
                      step: 1,
                      role: "Hiring Manager",
                      name: "Maria Lopez",
                      date: "10 Oct 2026",
                      status: "APPROVED" as const,
                      comments: "Headcount verified and aligned with Q4 microservices expansion deliverables.",
                    },
                    {
                      step: 2,
                      role: "Department Head",
                      name: "Ravi Kumar",
                      date: "12 Oct 2026",
                      status: "APPROVED" as const,
                      comments: "Annual budget allocation verified under FY26 Engineering Opex budget.",
                    },
                    {
                      step: 3,
                      role: "HR Approval",
                      name: "Anita Menon",
                      date: "15 Oct 2026",
                      status: "APPROVED" as const,
                      comments: "Pay scale verified against Bangalore regional enterprise software benchmarks.",
                    },
                  ]).map((step) => (
                    <div key={step.step} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-start gap-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 shrink-0 mt-0.5">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div className="flex-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">
                            Step {step.step}: {step.role} — {step.name}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">{step.date}</span>
                        </div>
                        <p className="text-slate-600 mt-1 italic">“{step.comments}”</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* -----------------------------------------------------------------------
                TAB 8: ACTIVITY TAB
            ----------------------------------------------------------------------- */}
            {activeTab === "activity" && (
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-4 animate-fade-in">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900">Audit Trail & Chronology</h3>
                  <p className="text-xs text-slate-500">Immutable compliance activity history for {requisition.reqNumber}.</p>
                </div>

                <div className="space-y-3">
                  {activities.map((act) => (
                    <div key={act.id} className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 bg-slate-50 text-xs">
                      <div className="h-2 w-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{act.action}</span>
                          <span className="text-[11px] text-slate-400 font-mono">{act.timestamp}</span>
                        </div>
                        <p className="text-slate-600 mt-0.5">{act.details}</p>
                        <span className="text-[10px] text-slate-400 block mt-1">By: {act.user}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* -----------------------------------------------------------------------
                TAB 9: RELATED TAB
            ----------------------------------------------------------------------- */}
            {activeTab === "related" && (
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-4 animate-fade-in">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900">Linked Enterprise Records</h3>
                  <p className="text-xs text-slate-500">Connected positions in EC Core, business object links, and job board channels.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                    <span className="font-bold text-slate-800 block">EC Core Position Link</span>
                    <p className="text-slate-600 font-mono">POS-ENG-084 (Senior Full-Stack Cloud Architect)</p>
                    <span className="text-[11px] text-emerald-600 font-semibold">Vacant Slot Allocated ✓</span>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                    <span className="font-bold text-slate-800 block">Configured Business Object</span>
                    <p className="text-slate-600 font-mono">JOB_DESCRIPTION v2.5.0</p>
                    <span className="text-[11px] text-purple-600 font-semibold">Authoritative Schema Source ✓</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* =========================================================================
              RIGHT COLUMN (4 cols): AI Assistant, Approval Workflow, Status, Quick Actions
              Matching approved mockup Image 4
          ========================================================================= */}
          <div className="lg:col-span-4 space-y-5">
            {/* -----------------------------------------------------------------------
                SIDEBAR CARD 1: AI Assistant matching Image 4
            ----------------------------------------------------------------------- */}
            <div className="bg-white border border-slate-200/80 rounded-2xl shadow-2xs overflow-hidden">
              <div
                onClick={() => setIsAiCollapsed(!isAiCollapsed)}
                className="p-4 flex items-center justify-between cursor-pointer bg-slate-50/60 hover:bg-slate-50 transition border-b border-slate-100"
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-600 text-white text-xs">
                    🤖
                  </span>
                  <span className="text-xs font-bold text-slate-900">AI Assistant</span>
                </div>
                <svg
                  className={`h-4 w-4 text-slate-400 transition-transform ${isAiCollapsed ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {!isAiCollapsed && (
                <div className="p-4 space-y-3">
                  {/* Prompt Input */}
                  <div className="relative">
                    <input
                      type="text"
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleTriggerAiAction("CHAT");
                      }}
                      placeholder="Ask about this requisition..."
                      className="w-full pl-3.5 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-2xs"
                    />
                    <button
                      type="button"
                      onClick={() => handleTriggerAiAction("CHAT")}
                      disabled={isAiLoading}
                      className="absolute right-2 top-2 p-1 text-blue-600 hover:text-blue-800 disabled:opacity-50"
                      title="Send Prompt"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                  </div>

                  {/* 4 Action Buttons matching Image 4 */}
                  <div className="space-y-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => handleTriggerAiAction("SUMMARIZE_REQUISITION")}
                      disabled={isAiLoading}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition shadow-2xs text-left"
                    >
                      <svg className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>Summarize this requisition</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTriggerAiAction("SUGGEST_MATCHING_CANDIDATES")}
                      disabled={isAiLoading}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition shadow-2xs text-left"
                    >
                      <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span>Suggest matching candidates</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTriggerAiAction("GENERATE_JOB_DESCRIPTION")}
                      disabled={isAiLoading}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition shadow-2xs text-left"
                    >
                      <svg className="h-4 w-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span>Generate job description</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTriggerAiAction("GENERATE_QUESTIONS")}
                      disabled={isAiLoading}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition shadow-2xs text-left"
                    >
                      <svg className="h-4 w-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Create interview questions</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* -----------------------------------------------------------------------
                SIDEBAR CARD 2: Approval Workflow matching Image 4
            ----------------------------------------------------------------------- */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <h3 className="text-xs font-bold text-slate-900">Approval Workflow</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowHistoryModal(true)}
                  className="text-[11px] font-semibold text-blue-600 hover:underline"
                >
                  View History
                </button>
              </div>

              {/* 3 Step List matching Image 4 */}
              <div className="space-y-3 text-xs">
                {/* Step 1: Hiring Manager */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shrink-0">
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block leading-tight">Hiring Manager</span>
                      <span className="text-[11px] text-slate-400">Maria Lopez</span>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">10 Oct 2026</span>
                </div>

                {/* Step 2: Department Head */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shrink-0">
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block leading-tight">Department Head</span>
                      <span className="text-[11px] text-slate-400">Ravi Kumar</span>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">12 Oct 2026</span>
                </div>

                {/* Step 3: HR Approval */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shrink-0">
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block leading-tight">HR Approval</span>
                      <span className="text-[11px] text-slate-400">Anita Menon</span>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">15 Oct 2026</span>
                </div>
              </div>
            </div>

            {/* -----------------------------------------------------------------------
                SIDEBAR CARD 3: Status & Dates matching Image 4
            ----------------------------------------------------------------------- */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <h3 className="text-xs font-bold text-slate-900">Status & Dates</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowEditModal(true)}
                  className="p-1 rounded text-slate-400 hover:text-blue-600"
                  title="Edit Status"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Current Status</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {requisition.status}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Created On</span>
                  <span className="font-semibold text-slate-800 font-mono text-[11px]">{requisition.createdOn}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Created By</span>
                  <span className="font-semibold text-slate-800">{requisition.createdBy || "John Smith"}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Last Updated</span>
                  <span className="font-semibold text-slate-800 font-mono text-[11px]">
                    {requisition.lastUpdated || "15 Oct 2026"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Days Open</span>
                  <span className="font-semibold text-slate-800">{requisition.daysOpen || "7 days"}</span>
                </div>
              </div>
            </div>

            {/* -----------------------------------------------------------------------
                SIDEBAR CARD 4: Quick Actions matching Image 4
            ----------------------------------------------------------------------- */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-2.5">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                <svg className="h-4 w-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <h3 className="text-xs font-bold text-slate-900">Quick Actions</h3>
              </div>

              <div className="space-y-1.5 pt-1 text-xs">
                <button
                  type="button"
                  onClick={() => setShowEditModal(true)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700 font-semibold transition"
                >
                  <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  <span>Edit Requisition</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowJobBoardModal(true)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700 font-semibold transition"
                >
                  <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  <span>Post to Job Boards</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowShareModal(true)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700 font-semibold transition"
                >
                  <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  <span>Share Requisition</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700 font-semibold transition"
                >
                  <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  <span>Print</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowCancelModal(true)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-rose-50 text-rose-600 font-semibold transition"
                >
                  <svg className="h-4 w-4 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Cancel Requisition</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            MODAL 1: AI Assistant Result Dialog
        ========================================================================= */}
        {showAiModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white text-xs">✨</span>
                  <h3 className="text-base font-bold text-slate-900">{aiResponseTitle}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAiModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  ✕
                </button>
              </div>

              <div className="text-xs text-slate-700 leading-relaxed space-y-3">
                {Array.isArray(aiResponseBody) ? (
                  <div className="space-y-2">
                    {aiResponseBody.map((item: any, idx: number) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        {typeof item === "string" ? (
                          <span>{item}</span>
                        ) : (
                          <div>
                            <span className="font-bold text-slate-900 block">{item.name || item.candidateName}</span>
                            <span className="text-[11px] text-slate-500 block">{item.rationale || item.stage}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : typeof aiResponseBody === "object" ? (
                  <div className="space-y-2">
                    {aiResponseBody.description && (
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="font-bold text-slate-900 block mb-1">Draft Description:</span>
                        <p>{aiResponseBody.description}</p>
                      </div>
                    )}
                    {aiResponseBody.responsibilities && (
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="font-bold text-slate-900 block mb-1">Generated Duties:</span>
                        <ul className="list-disc list-inside space-y-1">
                          {aiResponseBody.responsibilities.map((r: string, i: number) => (
                            <li key={i}>{r}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-200">{aiResponseBody}</p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAiModal(false)}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            MODAL 2: Post to Job Boards Dialog
        ========================================================================= */}
        {showJobBoardModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="h-6 w-6 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-xs">🚀</span>
                  <h3 className="text-base font-bold text-slate-900">Post to External Channels</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowJobBoardModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2 text-xs">
                {["LinkedIn Talent Solutions", "Indeed Sponsored", "Glassdoor Enterprise", "MAX Global Careers Portal"].map((ch) => {
                  const isChecked = selectedJobBoards.includes(ch);
                  return (
                    <label key={ch} className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          if (isChecked) {
                            setSelectedJobBoards(selectedJobBoards.filter((c) => c !== ch));
                          } else {
                            setSelectedJobBoards([...selectedJobBoards, ch]);
                          }
                        }}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span className="font-semibold text-slate-800">{ch}</span>
                    </label>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowJobBoardModal(false);
                    router.push(`/recruitment/requisitions/${requisition?.reqNumber || rawId}/post`);
                  }}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition"
                >
                  Open Full Studio →
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowJobBoardModal(false)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handlePublishJobBoards}
                    className="px-4 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
                  >
                    Publish Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            MODAL 3: Share Requisition Link
        ========================================================================= */}
        {showShareModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">Share Job Requisition</h3>
                <button
                  type="button"
                  onClick={() => setShowShareModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <span className="text-slate-500 block">Copy link to share with colleagues or hiring committee:</span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`http://localhost:3000/recruitment/requisitions/${requisition.reqNumber}`}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-700"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(`http://localhost:3000/recruitment/requisitions/${requisition.reqNumber}`);
                      triggerToast("Link copied to clipboard!");
                      setShowShareModal(false);
                    }}
                    className="px-3.5 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            MODAL 4: Cancel Requisition Confirmation
        ========================================================================= */}
        {showCancelModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center gap-3 text-rose-600">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Cancel Requisition?</h3>
                  <p className="text-xs text-slate-500">This action will stop active interviews and notify candidates.</p>
                </div>
              </div>

              <div className="space-y-1.5 text-xs">
                <label className="block font-bold text-slate-700">Cancellation Justification</label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  <option value="Business priorities restructured">Business priorities restructured</option>
                  <option value="Headcount budget reallocation">Headcount budget reallocation</option>
                  <option value="Duplicate requisition">Duplicate requisition</option>
                  <option value="Role fulfilled via internal promotion">Role fulfilled via internal promotion</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Dismiss
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCancelRequisition}
                  className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700"
                >
                  Confirm Cancellation
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            MODAL 5: Quick Edit Requisition Information
        ========================================================================= */}
        {showEditModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">Edit Requisition Details</h3>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Job Title</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Department</label>
                    <select
                      value={editDepartment}
                      onChange={(e) => setEditDepartment(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    >
                      <option value="Engineering">Engineering</option>
                      <option value="Product">Product</option>
                      <option value="HR">HR</option>
                      <option value="Finance">Finance</option>
                      <option value="Sales">Sales</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Location</label>
                    <input
                      type="text"
                      value={editLocation}
                      onChange={(e) => setEditLocation(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Openings</label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={editOpenings}
                      onChange={(e) => setEditOpenings(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Status</label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    >
                      <option value="Open">Open</option>
                      <option value="Pending Approval">Pending Approval</option>
                      <option value="On Hold">On Hold</option>
                      <option value="Filled">Filled</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdits}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            MODAL 6: Full Approval History Audit
        ========================================================================= */}
        {showHistoryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">Approval Workflow History</h3>
                <button
                  type="button"
                  onClick={() => setShowHistoryModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs">
                {(requisition.approvalHistory || []).map((step) => (
                  <div key={step.step} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{step.role}: {step.name}</span>
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[10px]">
                        {step.status}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 block font-mono">{step.date}</span>
                    <p className="text-slate-600 italic">“{step.comments}”</p>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowHistoryModal(false)}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RecruitingShell>
  );
}
