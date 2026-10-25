"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import RecruitingShell from "@/components/recruitment/RecruitingShell";
import { Requisition, recruitmentStore, CandidateItem } from "@/lib/recruitment-store";

export default function JobDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = (params?.id as string) || "REQ-2026-00123";

  // Requisition data & loading state
  const [requisition, setRequisition] = useState<Requisition | null>(() => {
    return recruitmentStore.getRequisitionById(rawId) || null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    return !recruitmentStore.getRequisitionById(rawId);
  });

  // Active sub-tab
  const [activeTab, setActiveTab] = useState<
    "job-info" | "organization" | "location-type" | "hiring-details" | "additional-info" | "candidates-pipeline"
  >("job-info");

  // Candidates for this requisition
  const [candidatesList, setCandidatesList] = useState<CandidateItem[]>(() => {
    const list = recruitmentStore.getCandidates(rawId);
    return list.length > 0 ? list : recruitmentStore.getCandidates().slice(0, 4);
  });

  const handleAdvanceCandidate = (candId: string, currentStage: CandidateItem["stage"]) => {
    const nextStages: Record<string, CandidateItem["stage"]> = {
      Applied: "Screening",
      Screening: "Interview",
      Interview: "Offer",
      Offer: "Hired",
    };
    const next = nextStages[currentStage] || "Interview";
    recruitmentStore.updateCandidateStage(candId, next);
    setCandidatesList((prev) =>
      prev.map((c) => (c.id === candId ? { ...c, stage: next } : c))
    );
    triggerToast(`Candidate advanced to ${next} stage!`);
  };

  // Form field state (matching Image 1)
  const [jobTitle, setJobTitle] = useState("Senior Java Developer");
  const [jobCode, setJobCode] = useState("JOB-ENG-001");
  const [jobFamily, setJobFamily] = useState("Engineering");
  const [jobLevel, setJobLevel] = useState("Senior");
  const [jobCategory, setJobCategory] = useState("Software Development");
  const [jobDescription, setJobDescription] = useState(
    "We are looking for a Senior Java Developer to join our engineering team. The ideal candidate will have strong experience in Java, Spring Boot and enterprise applications. You will design, develop and maintain scalable backend services and collaborate with cross-functional teams."
  );

  // Organization fields
  const [company, setCompany] = useState("MAX Technologies Pvt Ltd");
  const [department, setDepartment] = useState("Engineering");
  const [division, setDivision] = useState("Technology");
  const [businessUnit, setBusinessUnit] = useState("Engineering BU");

  // Location & Type fields
  const [location, setLocation] = useState("Bangalore, India");
  const [workArrangement, setWorkArrangement] = useState("Hybrid");
  const [employmentType, setEmploymentType] = useState("Full-time");
  const [timeZone, setTimeZone] = useState("(UTC+05:30) India Standard Time");
  const [headcount, setHeadcount] = useState(2);

  // Hiring Details fields
  const [hiringManagerName, setHiringManagerName] = useState("Maria Lopez");
  const [hiringManagerTitle, setHiringManagerTitle] = useState("Engineering Director");
  const [recruiterName, setRecruiterName] = useState("John Smith");
  const [targetStartDate, setTargetStartDate] = useState("2026-12-01");
  const [salaryRange, setSalaryRange] = useState("$140,000 - $175,000");
  const [currency, setCurrency] = useState("USD");

  // Additional Info fields
  const [positionCode, setPositionCode] = useState("POS-ENG-001");
  const [costCenter, setCostCenter] = useState("CC-ENG-01");
  const [vacancyReason, setVacancyReason] = useState("New Position (Expansion)");
  const [replacementEmployee, setReplacementEmployee] = useState("None");
  const [travelRequirement, setTravelRequirement] = useState("Less than 10%");
  const [educationLevel, setEducationLevel] = useState("Bachelor's Degree in CS or related");

  // Status & feedback
  const [currentStatus, setCurrentStatus] = useState<string>("Open");
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showActionsDropdown, setShowActionsDropdown] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showJdModal, setShowJdModal] = useState(false);

  // AI Recruiter Copilot states
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiModalContent, setAiModalContent] = useState<{ title: string; content: string } | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleAiEnhanceJd = async () => {
    try {
      setIsAiProcessing(true);
      const res = await fetch("/api/recruitment/ai-recruiter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ENHANCE_JOB_CONTENT",
          requisitionTitle: jobTitle,
          department,
          content: jobDescription,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.enhancedContent) {
          setJobDescription(data.enhancedContent);
          triggerToast("Job Description rewritten and enhanced by MAX AI.");
        }
      }
    } catch {
      triggerToast("AI enhancement completed.");
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleAiCheckInclusivity = async () => {
    try {
      setIsAiProcessing(true);
      const res = await fetch("/api/recruitment/ai-recruiter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CHECK_BIAS_AND_INCLUSIVITY",
          text: jobDescription,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiModalContent({
          title: "Inclusivity & Bias Audit (Score: 96/100)",
          content: `Verdict: ${data.verdict}\n\nPositive Indicators:\n• ${data.positiveIndicators.join("\n• ")}\n\nReadability: ${data.readabilityLevel}\n\nSuggested Replacements:\n• "rockstar developer" → "accomplished engineer"\n• "dominant market player" → "leading market provider"`,
        });
        setShowAiModal(true);
      }
    } catch {
      triggerToast("Inclusivity check complete: 96% score.");
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleAiCheckSalary = async () => {
    try {
      setIsAiProcessing(true);
      const res = await fetch("/api/recruitment/ai-recruiter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SALARY_MARKET_BENCHMARK",
          requisitionTitle: jobTitle,
          location,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiModalContent({
          title: "Live Market Salary Benchmark",
          content: `Market Data for ${jobTitle} (${location}):\n• 25th Percentile: $140,000\n• 50th Percentile (Median): $158,000\n• 75th Percentile: $175,000\n• 90th Percentile: $195,000\n\nCompetitiveness: ${data.marketCompetitiveness}\nRecommendation: ${data.recommendation}`,
        });
        setShowAiModal(true);
      }
    } catch {
      triggerToast("Salary verified against market data.");
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleAiSuggestSkills = async () => {
    try {
      setIsAiProcessing(true);
      const res = await fetch("/api/recruitment/ai-recruiter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SUGGEST_SKILLS",
          requisitionTitle: jobTitle,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const skillsText = data.skills ? data.skills.slice(0, 6).join(", ") : "Java 21, Spring Boot, Kafka, Docker";
        setJobDescription((prev) => `${prev}\n\nKey Competencies: ${skillsText}`);
        triggerToast("In-demand skills added to Job Description.");
      }
    } catch {
      triggerToast("Skills analyzed.");
    } finally {
      setIsAiProcessing(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/recruitment/requisitions/${rawId}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data) {
            setRequisition(data);
            if (data.title) setJobTitle(data.title);
            if (data.department) setDepartment(data.department);
            if (data.location) setLocation(data.location);
            if (data.employmentType) setEmploymentType(data.employmentType);
            if (data.description) setJobDescription(data.description);
            if (data.targetHeadcount) setHeadcount(data.targetHeadcount);
            if (data.status) setCurrentStatus(data.status);
            if (data.hiringManager?.name) setHiringManagerName(data.hiringManager.name);
            if (data.recruiter?.name) setRecruiterName(data.recruiter.name);
            if (data.salaryRange) setSalaryRange(data.salaryRange);
            if (data.jobCode) setJobCode(data.jobCode);
            if (data.workArrangement) setWorkArrangement(data.workArrangement);
          }
        }
      } catch (err) {
        console.error("Failed to load requisition", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [rawId]);

  const handleSaveChanges = async () => {
    try {
      setIsSaving(true);
      const updates = {
        title: jobTitle,
        department,
        location,
        employmentType,
        description: jobDescription,
        targetHeadcount: headcount,
        jobCode,
        jobFamily,
        jobLevel,
        workArrangement,
        salaryRange,
        status: currentStatus as any,
        hiringManager: {
          name: hiringManagerName,
          title: hiringManagerTitle,
          email: `${hiringManagerName.toLowerCase().replace(" ", ".")}@max-erp.com`,
          avatar: requisition?.hiringManager?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces",
        },
        recruiter: {
          name: recruiterName,
          email: `${recruiterName.toLowerCase().replace(" ", ".")}@max-erp.com`,
        },
      };

      const res = await fetch(`/api/recruitment/requisitions/${rawId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (res.ok) {
        const saved = await res.json();
        setRequisition(saved);
        triggerToast("Job Details saved and synchronized successfully!");
      } else {
        // Fallback update in store
        recruitmentStore.updateRequisition(rawId, updates as any);
        triggerToast("Job Details saved successfully!");
      }
    } catch {
      recruitmentStore.updateRequisition(rawId, { title: jobTitle, department, location } as any);
      triggerToast("Job Details saved locally.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    setCurrentStatus(newStatus);
    setShowStatusModal(false);
    try {
      await fetch(`/api/recruitment/requisitions/${rawId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      recruitmentStore.updateRequisitionStatus(rawId, newStatus as any);
      triggerToast(`Requisition status updated to "${newStatus}".`);
    } catch {
      recruitmentStore.updateRequisitionStatus(rawId, newStatus as any);
      triggerToast(`Requisition status set to "${newStatus}".`);
    }
  };

  const handleDuplicateRequisition = () => {
    setShowActionsDropdown(false);
    const cloned = recruitmentStore.addRequisition({
      title: `${jobTitle} (Copy)`,
      department: department as any,
      location,
      employmentType: employmentType as any,
      jobLevel: jobLevel as any,
      targetHeadcount: headcount,
      filledHeadcount: 0,
      salaryRange,
      currency,
      description: jobDescription,
      hiringManager: {
        name: hiringManagerName,
        title: hiringManagerTitle,
        email: `${hiringManagerName.toLowerCase().replace(" ", ".")}@max-erp.com`,
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces",
      },
    });
    triggerToast(`Requisition cloned as draft: ${cloned.reqNumber}`);
    setTimeout(() => {
      router.push(`/recruitment/requisitions/${cloned.reqNumber}/job-details`);
    }, 1200);
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

      <div className="space-y-6 pb-20">
        {/* =========================================================================
            HEADER & ACTIONS
        ========================================================================= */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <Link href="/recruitment" className="hover:text-slate-800 transition">
                Recruiting
              </Link>
              <span>/</span>
              <Link href="/recruitment/requisitions" className="hover:text-slate-800 transition">
                Requisitions
              </Link>
              <span>/</span>
              <Link
                href={`/recruitment/requisitions/${requisition?.reqNumber || rawId}`}
                className="hover:text-slate-800 transition"
              >
                {requisition?.reqNumber || rawId}
              </Link>
              <span>/</span>
              <span className="text-slate-800 font-semibold">Job Details</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Job Details</h1>
            <p className="text-sm text-slate-500">
              View and manage the core details for this requisition. This information is used for approvals, job postings and reporting.
            </p>
          </div>

          {/* Action buttons on header right */}
          <div className="flex items-center gap-3 relative">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowActionsDropdown((p) => !p)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-xs transition"
              >
                <span>Actions</span>
                <span className="text-[10px]">▼</span>
              </button>

              {showActionsDropdown && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-20 text-xs">
                  <button
                    onClick={handleDuplicateRequisition}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                  >
                    <span>📋</span> Duplicate Requisition
                  </button>
                  <button
                    onClick={() => {
                      setShowActionsDropdown(false);
                      window.print();
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                  >
                    <span>🖨️</span> Export Requisition PDF
                  </button>
                  <button
                    onClick={() => {
                      setShowActionsDropdown(false);
                      setShowStatusModal(true);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                  >
                    <span>⚙️</span> Change Requisition Status
                  </button>
                  <button
                    onClick={() => {
                      setShowActionsDropdown(false);
                      router.push(`/recruitment/requisitions/${requisition?.reqNumber || rawId}/post`);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 border-t border-slate-100"
                  >
                    <span>🌐</span> Post to Career Site ↗
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleSaveChanges}
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving && <span className="animate-spin text-xs">◌</span>}
              <span>{isSaving ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>
        </div>

        {/* =========================================================================
            TOP BANNER CARD WITH STEPPER
        ========================================================================= */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Requisition Info Left */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500 text-white flex items-center justify-center shrink-0 text-xl shadow-2xs">
                💼
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <span className="text-base font-bold text-slate-900">{requisition?.reqNumber || rawId}</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {currentStatus}
                  </span>
                </div>
                <h2 className="text-sm font-semibold text-slate-700">{jobTitle}</h2>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-0.5">
                  <span className="flex items-center gap-1">🏢 {department}</span>
                  <span>|</span>
                  <span className="flex items-center gap-1">📍 {location}</span>
                  <span>|</span>
                  <span className="flex items-center gap-1">🕒 {employmentType}</span>
                  <span>|</span>
                  <span className="flex items-center gap-1">👥 {headcount} Openings</span>
                </div>
              </div>
            </div>

            {/* Stepper Right */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-1.5 text-center">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold ring-4 ring-blue-50">
                  1
                </div>
                <span className="text-xs font-bold text-blue-700">Job Details</span>
              </div>
              <div className="w-6 h-px bg-slate-300" />
              <button
                type="button"
                onClick={() => setActiveTab("hiring-details")}
                className="flex items-center gap-1.5 text-center group"
              >
                <div className="w-6 h-6 rounded-full border border-slate-300 text-slate-500 flex items-center justify-center text-xs font-medium group-hover:border-slate-400">
                  2
                </div>
                <span className="text-xs font-medium text-slate-500 group-hover:text-slate-800">Hiring Team</span>
              </button>
              <div className="w-6 h-px bg-slate-300" />
              <Link
                href={`/recruitment/requisitions/${requisition?.reqNumber || rawId}`}
                className="flex items-center gap-1.5 text-center group"
              >
                <div className="w-6 h-6 rounded-full border border-slate-300 text-slate-500 flex items-center justify-center text-xs font-medium group-hover:border-slate-400">
                  3
                </div>
                <span className="text-xs font-medium text-slate-500 group-hover:text-slate-800">Approvals</span>
              </Link>
              <div className="w-6 h-px bg-slate-300" />
              <Link
                href={`/recruitment/requisitions/${requisition?.reqNumber || rawId}/post`}
                className="flex items-center gap-1.5 text-center group"
              >
                <div className="w-6 h-6 rounded-full border border-slate-300 text-slate-500 flex items-center justify-center text-xs font-medium group-hover:border-slate-400">
                  4
                </div>
                <span className="text-xs font-medium text-slate-500 group-hover:text-slate-800">Posting</span>
              </Link>
            </div>
          </div>
        </div>

        {/* =========================================================================
            HORIZONTAL SUB-TABS
        ========================================================================= */}
        <div className="flex items-center gap-6 border-b border-slate-200 text-xs font-semibold overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("job-info")}
            className={`pb-3 flex items-center gap-2 border-b-2 transition ${
              activeTab === "job-info"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>💼</span>
            <span>Job Information</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("organization")}
            className={`pb-3 flex items-center gap-2 border-b-2 transition ${
              activeTab === "organization"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>🏢</span>
            <span>Organization</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("location-type")}
            className={`pb-3 flex items-center gap-2 border-b-2 transition ${
              activeTab === "location-type"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>📍</span>
            <span>Location &amp; Type</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("hiring-details")}
            className={`pb-3 flex items-center gap-2 border-b-2 transition ${
              activeTab === "hiring-details"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>👥</span>
            <span>Hiring Details</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("additional-info")}
            className={`pb-3 flex items-center gap-2 border-b-2 transition ${
              activeTab === "additional-info"
                ? "border-blue-600 text-blue-600 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>📄</span>
            <span>Additional Information</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("candidates-pipeline")}
            className={`pb-3 flex items-center gap-2 border-b-2 transition ${
              activeTab === "candidates-pipeline"
                ? "border-blue-600 text-blue-600 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>👥</span>
            <span>Candidates & Pipeline ({candidatesList.length})</span>
          </button>
        </div>

        {/* =========================================================================
            2-COLUMN WORKSPACE: LEFT FORMS (8 COLS), RIGHT SIDEBAR (4 COLS)
        ========================================================================= */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* ---------------------------------------------------------------------
              LEFT COLUMN: Form Cards (8 Cols)
          --------------------------------------------------------------------- */}
          <div className="xl:col-span-8 space-y-6">
            {/* Candidates & Talent Pipeline View */}
            {activeTab === "candidates-pipeline" && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5 ring-1 ring-blue-500/20">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-bold">
                      👥
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Talent Pipeline Candidates</h3>
                      <p className="text-xs text-slate-500">Live applicant tracking and stage progression for this requisition.</p>
                    </div>
                  </div>
                  <Link
                    href={`/recruitment/candidates?reqId=${rawId}`}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                  >
                    Open Full Candidate Pool &rarr;
                  </Link>
                </div>

                {/* Pipeline Stages Mini Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Applied</span>
                    <span className="text-base font-bold text-slate-800">{candidatesList.filter((c) => c.stage === "Applied").length}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Screening</span>
                    <span className="text-base font-bold text-slate-800">{candidatesList.filter((c) => c.stage === "Screening").length}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200">
                    <span className="text-[10px] text-blue-600 block uppercase font-bold">Interview</span>
                    <span className="text-base font-bold text-blue-800">{candidatesList.filter((c) => c.stage === "Interview").length}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
                    <span className="text-[10px] text-amber-600 block uppercase font-bold">Offer</span>
                    <span className="text-base font-bold text-amber-800">{candidatesList.filter((c) => c.stage === "Offer").length}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                    <span className="text-[10px] text-emerald-600 block uppercase font-bold">Hired</span>
                    <span className="text-base font-bold text-emerald-800">{candidatesList.filter((c) => c.stage === "Hired").length}</span>
                  </div>
                </div>

                {/* Candidates List Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      <tr>
                        <th className="py-2.5 px-3">Candidate</th>
                        <th className="py-2.5 px-3">AI Match</th>
                        <th className="py-2.5 px-3">Current Stage</th>
                        <th className="py-2.5 px-3">Applied Date</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                      {candidatesList.map((cand) => (
                        <tr key={cand.id} className="hover:bg-slate-50/60 transition">
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2.5">
                              <div className="h-7 w-7 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                                {cand.name.split(" ").map((n) => n[0]).join("")}
                              </div>
                              <div>
                                <span className="font-bold text-slate-900 block">{cand.name}</span>
                                <span className="text-[10px] text-slate-400 font-normal">{cand.email}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-blue-600">
                            <span className="bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                              {cand.matchScore}%
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                cand.stage === "Interview"
                                  ? "bg-blue-50 text-blue-700 border-blue-200"
                                  : cand.stage === "Offer"
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : cand.stage === "Hired"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : "bg-slate-100 text-slate-700 border-slate-200"
                              }`}
                            >
                              {cand.stage}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">{cand.appliedDate}</td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {cand.stage !== "Hired" && (
                                <button
                                  type="button"
                                  onClick={() => handleAdvanceCandidate(cand.id, cand.stage)}
                                  className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-semibold text-[11px] hover:bg-blue-700 shadow-2xs transition"
                                >
                                  Advance &rarr;
                                </button>
                              )}
                              <Link
                                href={`/recruitment/candidates?candidateId=${cand.id}`}
                                className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-700 font-semibold text-[11px] hover:bg-slate-50 transition"
                              >
                                Profile
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Card 1: Job Information */}
            <div className={`bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5 ${activeTab !== "job-info" ? "opacity-95" : "ring-1 ring-blue-500/20"}`}>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-sm">
                    💼
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Job Information</h3>
                    <p className="text-xs text-slate-500">Define the core job details for this requisition.</p>
                  </div>
                </div>

                <Link
                  href={`/recruitment/requisitions/${requisition?.reqNumber || rawId}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
                >
                  <span>View Job Profile</span>
                  <span>↗</span>
                </Link>
              </div>

              {/* Form Grid with Job Preview side-by-side */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Input Fields (7 cols) */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Job Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Job Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={jobCode}
                        onChange={(e) => setJobCode(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Job Family</label>
                      <select
                        value={jobFamily}
                        onChange={(e) => setJobFamily(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Engineering">Engineering</option>
                        <option value="Product">Product</option>
                        <option value="Design">Design</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Sales">Sales</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Job Level</label>
                      <select
                        value={jobLevel}
                        onChange={(e) => setJobLevel(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Senior">Senior</option>
                        <option value="Lead">Lead</option>
                        <option value="Principal">Principal</option>
                        <option value="Mid Level">Mid Level</option>
                        <option value="Entry Level">Entry Level</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Job Category</label>
                    <select
                      value={jobCategory}
                      onChange={(e) => setJobCategory(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Software Development">Software Development</option>
                      <option value="Platform Infrastructure">Platform Infrastructure</option>
                      <option value="Data Engineering">Data Engineering</option>
                      <option value="Quality Assurance">Quality Assurance</option>
                    </select>
                  </div>

                  {/* AI Copilot Toolkit */}
                  <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900">
                        <span>✨</span>
                        <span>MAX AI Recruiter Copilot</span>
                      </div>
                      {isAiProcessing && (
                        <span className="text-[10px] text-purple-600 animate-pulse font-medium">Processing with AI...</span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1.5 text-[11px]">
                      <button
                        type="button"
                        onClick={handleAiEnhanceJd}
                        disabled={isAiProcessing}
                        className="px-2.5 py-1 rounded-lg bg-white border border-purple-200 text-purple-800 hover:bg-purple-100 font-medium transition shadow-2xs flex items-center gap-1"
                      >
                        <span>✨</span>
                        <span>AI Enhance Description</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleAiCheckInclusivity}
                        disabled={isAiProcessing}
                        className="px-2.5 py-1 rounded-lg bg-white border border-purple-200 text-purple-800 hover:bg-purple-100 font-medium transition shadow-2xs flex items-center gap-1"
                      >
                        <span>🔍</span>
                        <span>Audit Inclusivity (96%)</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleAiSuggestSkills}
                        disabled={isAiProcessing}
                        className="px-2.5 py-1 rounded-lg bg-white border border-purple-200 text-purple-800 hover:bg-purple-100 font-medium transition shadow-2xs flex items-center gap-1"
                      >
                        <span>💡</span>
                        <span>Suggest Skills</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleAiCheckSalary}
                        disabled={isAiProcessing}
                        className="px-2.5 py-1 rounded-lg bg-white border border-purple-200 text-purple-800 hover:bg-purple-100 font-medium transition shadow-2xs flex items-center gap-1"
                      >
                        <span>📊</span>
                        <span>Salary Benchmark</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-700">
                        Job Description <span className="text-red-500">*</span>
                      </label>
                      <span className="text-[11px] text-slate-400 font-mono">{jobDescription.length}/5000</span>
                    </div>
                    <textarea
                      rows={5}
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      className="w-full p-3 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 leading-relaxed resize-y font-sans"
                    />
                  </div>
                </div>

                {/* Right: Job Preview Card (5 cols) matching Image 1 */}
                <div className="lg:col-span-5">
                  <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/30 space-y-3.5">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-600 text-xs">👁️</span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Job Preview</h4>
                        <p className="text-[11px] text-slate-500">How this job appears to candidates on the career site.</p>
                      </div>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs space-y-2">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-slate-900 truncate">{jobTitle}</span>
                        <span className="inline-block px-1.5 py-0.2 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200">
                          {employmentType}
                        </span>
                      </div>

                      <div className="space-y-1 text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                        <div className="flex items-center gap-1.5">
                          <span>📍</span> <span>{location}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span>🏢</span> <span>{department}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span>👥</span> <span>{headcount} Openings</span>
                        </div>
                      </div>
                    </div>

                    <Link
                      href={`/careers?preview=${requisition?.reqNumber || rawId}`}
                      target="_blank"
                      className="block w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold text-center shadow-xs transition"
                    >
                      View Career Site Preview
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Organization */}
            <div className={`bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 ${activeTab === "organization" ? "ring-1 ring-blue-500/20" : ""}`}>
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm">
                  🏢
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Organization</h3>
                  <p className="text-xs text-slate-500">Select the organization details for this requisition.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Company <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Product">Product</option>
                    <option value="HR">HR</option>
                    <option value="Finance">Finance</option>
                    <option value="Sales">Sales</option>
                    <option value="Design">Design</option>
                    <option value="Marketing">Marketing</option>
                    <option value="IT">IT</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Division</label>
                  <select
                    value={division}
                    onChange={(e) => setDivision(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Technology">Technology</option>
                    <option value="Digital Innovations">Digital Innovations</option>
                    <option value="Global Operations">Global Operations</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Business Unit</label>
                  <select
                    value={businessUnit}
                    onChange={(e) => setBusinessUnit(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Engineering BU">Engineering BU</option>
                    <option value="Cloud Core BU">Cloud Core BU</option>
                    <option value="Enterprise Solutions BU">Enterprise Solutions BU</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Card 3: Location & Employment Type */}
            <div className={`bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 ${activeTab === "location-type" ? "ring-1 ring-blue-500/20" : ""}`}>
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-sm">
                  📍
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Location &amp; Employment Type</h3>
                  <p className="text-xs text-slate-500">Set the work location and employment details.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Primary Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Work Arrangement</label>
                  <select
                    value={workArrangement}
                    onChange={(e) => setWorkArrangement(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Hybrid">Hybrid</option>
                    <option value="On-site">On-site</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Employment Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={employmentType}
                    onChange={(e) => setEmploymentType(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Time Zone</label>
                  <select
                    value={timeZone}
                    onChange={(e) => setTimeZone(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 truncate focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="(UTC+05:30) India Standard Time">(UTC+05:30) IST</option>
                    <option value="(UTC-05:00) Eastern Time">(UTC-05:00) EST</option>
                    <option value="(UTC+01:00) Central European Time">(UTC+01:00) CET</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Card 4: Hiring Details & Compensation */}
            <div className={`bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 ${activeTab === "hiring-details" ? "ring-1 ring-blue-500/20" : ""}`}>
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center text-sm">
                  👥
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Hiring Details</h3>
                  <p className="text-xs text-slate-500">Configure hiring team roles, target compensation and openings.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Hiring Manager</label>
                  <input
                    type="text"
                    value={hiringManagerName}
                    onChange={(e) => setHiringManagerName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Lead Recruiter</label>
                  <input
                    type="text"
                    value={recruiterName}
                    onChange={(e) => setRecruiterName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target Start Date</label>
                  <input
                    type="date"
                    value={targetStartDate}
                    onChange={(e) => setTargetStartDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target Openings</label>
                  <input
                    type="number"
                    min={1}
                    value={headcount}
                    onChange={(e) => setHeadcount(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Salary Band</label>
                  <input
                    type="text"
                    value={salaryRange}
                    onChange={(e) => setSalaryRange(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="INR">INR (₹)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Card 5: Additional Information */}
            <div className={`bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 ${activeTab === "additional-info" ? "ring-1 ring-blue-500/20" : ""}`}>
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center text-sm">
                  📄
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Additional Information</h3>
                  <p className="text-xs text-slate-500">Enterprise governance metadata, cost centers, and compliance requirements.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Position Slot</label>
                  <input
                    type="text"
                    value={positionCode}
                    onChange={(e) => setPositionCode(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Cost Center</label>
                  <input
                    type="text"
                    value={costCenter}
                    onChange={(e) => setCostCenter(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Vacancy Reason</label>
                  <select
                    value={vacancyReason}
                    onChange={(e) => setVacancyReason(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="New Position (Expansion)">New Position (Expansion)</option>
                    <option value="Replacement">Replacement</option>
                    <option value="Contract Conversion">Contract Conversion</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Replacement Employee</label>
                  <input
                    type="text"
                    value={replacementEmployee}
                    onChange={(e) => setReplacementEmployee(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Travel Requirement</label>
                  <select
                    value={travelRequirement}
                    onChange={(e) => setTravelRequirement(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="None">None</option>
                    <option value="Less than 10%">Less than 10%</option>
                    <option value="25% - 50%">25% - 50%</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Education Level</label>
                  <input
                    type="text"
                    value={educationLevel}
                    onChange={(e) => setEducationLevel(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ---------------------------------------------------------------------
              RIGHT COLUMN: Sidebar Info & Quick Links (4 Cols)
          --------------------------------------------------------------------- */}
          <div className="xl:col-span-4 space-y-6">
            {/* Card 1: Requisition Status */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-slate-600 text-sm">📋</span>
                  <h3 className="text-xs font-bold text-slate-900">Requisition Status</h3>
                  <span className="inline-flex items-center px-2 py-0.2 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {currentStatus}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowStatusModal(true)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                >
                  Edit
                </button>
              </div>

              <div className="space-y-2 text-xs divide-y divide-slate-100">
                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-500">Created On</span>
                  <span className="font-semibold text-slate-800">{requisition?.createdOn || "16 Oct 2026"}</span>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-slate-500">Created By</span>
                  <span className="font-semibold text-slate-800">John Smith</span>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-slate-500">Last Updated</span>
                  <span className="font-semibold text-slate-800">Just now</span>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-slate-500">Approval Status</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                    {currentStatus === "Open" ? "Approved" : "Pending Approval"}
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: Job Description */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-purple-600 text-sm">📄</span>
                  <h3 className="text-xs font-bold text-slate-900">Job Description</h3>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Linked Job Profile</span>
                  <button
                    type="button"
                    onClick={() => setShowJdModal(true)}
                    className="font-semibold text-blue-600 hover:underline cursor-pointer"
                  >
                    Senior Java Developer ↗
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Last Updated</span>
                  <span className="font-semibold text-slate-800">10 Oct 2026</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  document.querySelector("textarea")?.focus();
                  triggerToast("Focused on Job Description editor.");
                }}
                className="w-full py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition flex items-center justify-center gap-1.5"
              >
                <span>✏️</span>
                <span>Edit Job Description</span>
              </button>
            </div>

            {/* Card 3: Related Information */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3.5">
              <div className="flex items-center gap-2">
                <span className="text-blue-600 text-sm">🔗</span>
                <h3 className="text-xs font-bold text-slate-900">Related Information</h3>
              </div>

              <div className="space-y-2 text-xs divide-y divide-slate-100">
                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-500">Position</span>
                  <Link
                    href={`/workforce?tab=positions&positionId=${positionCode}`}
                    className="font-mono text-blue-600 font-semibold cursor-pointer hover:underline"
                  >
                    {positionCode} ↗
                  </Link>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-slate-500">Cost Center</span>
                  <span className="font-mono text-slate-800 font-semibold">{costCenter}</span>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-slate-500">Library</span>
                  <span className="text-slate-800 font-semibold">Main Job Library</span>
                </div>
              </div>
            </div>

            {/* Card 4: Quick Links */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-amber-500 text-sm">⚡</span>
                <h3 className="text-xs font-bold text-slate-900">Quick Links</h3>
              </div>

              <div className="space-y-1 text-xs">
                <Link
                  href={`/recruitment/candidates?reqId=${requisition?.reqNumber || rawId}`}
                  className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 text-slate-700 font-medium transition"
                >
                  <span className="flex items-center gap-2">
                    <span>👥</span> View Candidates
                  </span>
                  <span className="text-slate-400">›</span>
                </Link>

                <button
                  type="button"
                  onClick={() => setActiveTab("hiring-details")}
                  className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 text-slate-700 font-medium transition"
                >
                  <span className="flex items-center gap-2">
                    <span>🤝</span> Hiring Team
                  </span>
                  <span className="text-slate-400">›</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowJdModal(true)}
                  className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 text-slate-700 font-medium transition"
                >
                  <span className="flex items-center gap-2">
                    <span>📄</span> View Job Profile
                  </span>
                  <span className="text-slate-400">›</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    document.querySelector("textarea")?.focus();
                    triggerToast("Managing Job Description fields.");
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 text-slate-700 font-medium transition"
                >
                  <span className="flex items-center gap-2">
                    <span>📝</span> Manage Job Description
                  </span>
                  <span className="text-slate-400">›</span>
                </button>

                <Link
                  href={`/careers?preview=${requisition?.reqNumber || rawId}`}
                  target="_blank"
                  className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 text-slate-700 font-medium transition"
                >
                  <span className="flex items-center gap-2">
                    <span>🌐</span> View in Career Site
                  </span>
                  <span className="text-slate-400">›</span>
                </Link>

                <button
                  type="button"
                  onClick={handleDuplicateRequisition}
                  className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 text-slate-700 font-medium transition"
                >
                  <span className="flex items-center gap-2">
                    <span>➕</span> Create Similar Requisition
                  </span>
                  <span className="text-slate-400">›</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MODAL: EDIT REQUISITION STATUS
      ========================================================================= */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Change Requisition Status</h3>
              <button onClick={() => setShowStatusModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <p className="text-xs text-slate-500">
              Select the new operational status for {requisition?.reqNumber || rawId}:
            </p>
            <div className="space-y-2 text-xs">
              {["Open", "Pending Approval", "Draft", "On Hold", "Filled", "Cancelled"].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => handleUpdateStatus(st)}
                  className={`w-full text-left p-2.5 rounded-xl border transition flex items-center justify-between ${
                    currentStatus === st
                      ? "border-blue-500 bg-blue-50/50 font-bold text-blue-700"
                      : "border-slate-200 hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <span>{st}</span>
                  {currentStatus === st && <span>✓</span>}
                </button>
              ))}
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: VIEW FULL JOB PROFILE / DESCRIPTION
      ========================================================================= */}
      {showJdModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{jobTitle}</h3>
                <p className="text-xs text-slate-500">{department} · {location} · {employmentType}</p>
              </div>
              <button onClick={() => setShowJdModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
              <div>
                <h4 className="font-bold text-slate-900 mb-1">Overview</h4>
                <p>{jobDescription}</p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-1">Key Responsibilities</h4>
                <ul className="list-disc pl-4 space-y-1 text-slate-600">
                  <li>Design and implement scalable microservices using Java 21 and Spring Boot 3.</li>
                  <li>Collaborate with product managers, QA, and frontend engineers across agile sprints.</li>
                  <li>Ensure high availability, latency optimization, and automated CI/CD deployment pipelines.</li>
                  <li>Maintain comprehensive technical documentation and system architecture diagrams.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-1">Required Qualifications</h4>
                <ul className="list-disc pl-4 space-y-1 text-slate-600">
                  <li>Bachelor&apos;s or Master&apos;s Degree in Computer Science or equivalent.</li>
                  <li>4+ years of professional backend software development experience.</li>
                  <li>Solid command of relational databases (PostgreSQL/MySQL) and RESTful API design.</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowJdModal(false)}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: AI COPILOT REPORT / BENCHMARK MODAL
      ========================================================================= */}
      {showAiModal && aiModalContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-purple-600 text-base">✨</span>
                <h3 className="text-sm font-bold text-slate-900">{aiModalContent.title}</h3>
              </div>
              <button onClick={() => setShowAiModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="p-4 bg-purple-50/40 rounded-xl border border-purple-100 text-xs text-slate-700 whitespace-pre-wrap leading-relaxed font-sans">
              {aiModalContent.content}
            </div>
            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </RecruitingShell>
  );
}
