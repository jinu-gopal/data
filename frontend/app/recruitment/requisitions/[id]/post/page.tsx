"use client";

import { useState, useEffect, useMemo, use } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import RecruitingShell from "@/components/recruitment/RecruitingShell";
import {
  Requisition,
  JobBoardIntegration,
  CareerSitePosting,
  recruitmentStore,
} from "@/lib/recruitment-store";
import { getBusinessObject } from "@/lib/business-objects-schema";

export default function PostToCareerSitePage() {
  const params = useParams();
  const router = useRouter();
  const rawId = (params?.id as string) || "REQ-2026-00123";

  // Requisition initial state
  const [requisition, setRequisition] = useState<Requisition | null>(() => {
    return recruitmentStore.getRequisitionById(rawId) || null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    return !recruitmentStore.getRequisitionById(rawId);
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Stepper state (1: Career Site Details, 2: Select Job Boards, 3: Job Content, 4: Review & Publish)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Section A: Career Site Posting Details
  const [careerSiteTitle, setCareerSiteTitle] = useState("Senior Java Developer");
  const [urlSlug, setUrlSlug] = useState("senior-java-developer");
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [jobCategory, setJobCategory] = useState("Engineering");
  const [jobLocation, setJobLocation] = useState("Bangalore, India");
  const [employmentType, setEmploymentType] = useState("Full-time");
  const [workArrangement, setWorkArrangement] = useState("Hybrid");
  const [applicationDeadline, setApplicationDeadline] = useState("2026-11-15");
  const [startDate, setStartDate] = useState("2026-10-16");
  const [postingDuration, setPostingDuration] = useState("30");
  const [showOnHomepage, setShowOnHomepage] = useState(true);
  const [featureJob, setFeatureJob] = useState(true);
  const [showInSearch, setShowInSearch] = useState(true);

  // Section B: Select External Job Boards
  const [boardFilter, setBoardFilter] = useState<"ALL" | "FREE" | "PREMIUM" | "CONFIGURED">("ALL");
  const [boardSearch, setBoardSearch] = useState("");
  const [jobBoards, setJobBoards] = useState<JobBoardIntegration[]>(() => {
    return recruitmentStore.getJobBoards();
  });
  const [selectedBoardIds, setSelectedBoardIds] = useState<string[]>([
    "indeed",
    "linkedin",
    "naukri",
    "glassdoor",
    "google-jobs",
  ]);

  // Section C: Job Content
  const [activeContentTab, setActiveContentTab] = useState<
    "description" | "responsibilities" | "qualifications" | "additional"
  >("description");

  const [jobDescription, setJobDescription] = useState(
    "We are looking for a Senior Java Developer to join our engineering team. The ideal candidate will have strong experience in Java, Spring Boot and enterprise applications. You will design, develop and maintain scalable backend services and collaborate with cross-functional teams."
  );

  const [responsibilities, setResponsibilities] = useState(
    "• Design, develop, and maintain high-performance backend microservices using Java 21 and Spring Boot.\n• Develop scalable distributed transactional systems with PostgreSQL and Hibernate.\n• Collaborate cross-functionally with frontend developers, product managers, and cloud DevOps teams.\n• Maintain automated test suites with JUnit, Mockito, and integration pipelines ensuring 90%+ code coverage.\n• Participate in agile sprint ceremonies, technical RFC reviews, and production incident root-cause analysis."
  );

  const [qualifications, setQualifications] = useState(
    "• 5+ years of hands-on software development experience with Java and Spring ecosystem.\n• Solid understanding of relational database design, indexing strategies, and query tuning.\n• Demonstrated experience with containerized environments (Docker, Kubernetes) and CI/CD pipelines.\n• Strong grasp of RESTful API standards, OAuth2/OIDC security, and microservices patterns."
  );

  const [additionalInfo, setAdditionalInfo] = useState(
    "MAX ERP provides comprehensive health insurance, competitive equity packages, annual wellness stipends, and flexible hybrid working arrangements."
  );

  // Section D: Career Site Preview State
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");

  // Save / Submit states
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [isDirty, setIsDirty] = useState(false);

  // Modals state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showManageBoardsModal, setShowManageBoardsModal] = useState(false);
  const [showConfigureBoardModal, setShowConfigureBoardModal] = useState<JobBoardIntegration | null>(null);
  const [showAddBoardModal, setShowAddBoardModal] = useState(false);
  const [showAiEnhanceModal, setShowAiEnhanceModal] = useState(false);
  const [aiEnhancedDraft, setAiEnhancedDraft] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);
  const [showCancelConfirmModal, setShowCancelConfirmModal] = useState(false);

  // Toast auto-clear
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Helper to slugify string
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  // When career site title changes, auto-update slug if not manually customized
  const handleTitleChange = (val: string) => {
    setCareerSiteTitle(val);
    setIsDirty(true);
    if (!isSlugManuallyEdited) {
      setUrlSlug(generateSlug(val));
    }
  };

  // Initial data loading
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setIsLoading(true);
        // Load requisition
        const reqRes = await fetch(`/api/recruitment/requisitions/${rawId}`);
        if (reqRes.ok) {
          const reqData = await reqRes.json();
          if (isMounted && reqData) {
            setRequisition(reqData);
            if (!careerSiteTitle) setCareerSiteTitle(reqData.title);
            if (!urlSlug) setUrlSlug(generateSlug(reqData.title));
            if (reqData.department) setJobCategory(reqData.department);
            if (reqData.location) setJobLocation(reqData.location);
            if (reqData.employmentType) setEmploymentType(reqData.employmentType);
            if (reqData.workArrangement) setWorkArrangement(reqData.workArrangement);
            if (reqData.description) setJobDescription(reqData.description);
          }
        }

        // Load existing posting configuration if available
        const postRes = await fetch(`/api/recruitment/requisitions/${rawId}/posting`);
        if (postRes.ok) {
          const postJson = await postRes.json();
          if (isMounted && postJson.data) {
            const cfg: CareerSitePosting = postJson.data;
            setCareerSiteTitle(cfg.careerSiteTitle);
            setUrlSlug(cfg.urlSlug);
            setJobCategory(cfg.category);
            setJobLocation(cfg.location);
            setEmploymentType(cfg.employmentType);
            setWorkArrangement(cfg.workArrangement);
            setApplicationDeadline(cfg.applicationDeadline);
            setStartDate(cfg.startDate);
            setShowOnHomepage(cfg.showOnHomepage);
            setFeatureJob(cfg.featured);
            setShowInSearch(cfg.showInSearch);
            if (cfg.selectedBoardIds && cfg.selectedBoardIds.length > 0) {
              setSelectedBoardIds(cfg.selectedBoardIds);
            }
            if (cfg.jobDescription) setJobDescription(cfg.jobDescription);
            if (cfg.responsibilities && cfg.responsibilities.length > 0) {
              setResponsibilities(cfg.responsibilities.join("\n"));
            }
            if (cfg.qualifications && cfg.qualifications.length > 0) {
              setQualifications(cfg.qualifications.join("\n"));
            }
            if (cfg.additionalInfo) setAdditionalInfo(cfg.additionalInfo);
          }
        }

        // Load Job Boards registry
        const boardsRes = await fetch(`/api/recruitment/job-boards`);
        if (boardsRes.ok) {
          const boardsJson = await boardsRes.json();
          if (isMounted && boardsJson.data) {
            setJobBoards(boardsJson.data);
          }
        }
      } catch (err: any) {
        if (isMounted) setErrorMessage(err.message || "Failed to load requisition data.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [rawId]);

  // Filtered Job Boards
  const filteredBoards = useMemo(() => {
    return jobBoards.filter((board) => {
      if (boardFilter === "FREE" && board.tier !== "FREE") return false;
      if (boardFilter === "PREMIUM" && board.tier !== "PREMIUM") return false;
      if (boardFilter === "CONFIGURED" && board.status !== "CONFIGURED" && board.status !== "CONNECTED") return false;
      if (boardSearch.trim()) {
        const q = boardSearch.toLowerCase();
        return board.name.toLowerCase().includes(q) || board.description.toLowerCase().includes(q);
      }
      return true;
    });
  }, [jobBoards, boardFilter, boardSearch]);

  // Selected boards objects for summary
  const selectedBoardsList = useMemo(() => {
    return jobBoards.filter((b) => selectedBoardIds.includes(b.id));
  }, [jobBoards, selectedBoardIds]);

  // Handle board toggle
  const handleToggleBoard = (board: JobBoardIntegration) => {
    setIsDirty(true);
    if (board.status === "NOT_CONFIGURED") {
      setShowConfigureBoardModal(board);
      return;
    }

    setSelectedBoardIds((prev) => {
      if (prev.includes(board.id)) {
        return prev.filter((id) => id !== board.id);
      } else {
        return [...prev, board.id];
      }
    });
  };

  // Configure Board save handler
  const handleSaveBoardConfiguration = async (boardId: string) => {
    try {
      const res = await fetch("/api/recruitment/job-boards", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: boardId, status: "CONFIGURED" }),
      });
      if (res.ok) {
        const json = await res.json();
        setJobBoards((prev) =>
          prev.map((b) => (b.id === boardId ? { ...b, status: "CONFIGURED" } : b))
        );
        setSelectedBoardIds((prev) => [...prev, boardId]);
        setShowConfigureBoardModal(null);
        triggerToast(`${json.data.name} integration configured and selected!`);
      }
    } catch {
      triggerToast("Failed to configure board connector.");
    }
  };

  // Validation function
  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!careerSiteTitle.trim()) {
      errors.careerSiteTitle = "Career Site Title is required.";
    }

    if (!urlSlug.trim()) {
      errors.urlSlug = "URL Slug is required.";
    } else {
      const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
      if (!slugRegex.test(urlSlug.trim())) {
        errors.urlSlug = "Slug must contain only lowercase letters, numbers, and hyphens.";
      }
    }

    if (!jobLocation.trim()) {
      errors.jobLocation = "Job Location is required.";
    }

    if (!jobCategory.trim()) {
      errors.jobCategory = "Job Category is required.";
    }

    if (startDate && applicationDeadline) {
      if (new Date(applicationDeadline) < new Date(startDate)) {
        errors.applicationDeadline = "Application deadline must be after posting start date.";
      }
    }

    if (!jobDescription.trim()) {
      errors.jobDescription = "Job Description content cannot be empty.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save as Draft
  const handleSaveDraft = async () => {
    if (!careerSiteTitle.trim() || !urlSlug.trim()) {
      validateForm();
      triggerToast("Please provide Career Site Title and URL Slug to save draft.");
      return;
    }

    try {
      setIsSaving(true);
      const payload: Partial<CareerSitePosting> = {
        careerSiteTitle,
        urlSlug,
        category: jobCategory,
        location: jobLocation,
        employmentType,
        workArrangement,
        applicationDeadline,
        startDate,
        durationDays: parseInt(postingDuration) || 30,
        showOnHomepage,
        featured: featureJob,
        showInSearch,
        selectedBoardIds,
        jobDescription,
        responsibilities: responsibilities.split("\n").filter(Boolean),
        qualifications: qualifications.split("\n").filter(Boolean),
        additionalInfo,
        status: "DRAFT",
      };

      const res = await fetch(`/api/recruitment/requisitions/${rawId}/posting`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, action: "SAVE_DRAFT" }),
      });

      if (res.ok) {
        setIsDirty(false);
        triggerToast("Career site posting draft saved successfully!");
      } else {
        const err = await res.json();
        triggerToast(err.message || "Failed to save draft.");
      }
    } catch {
      triggerToast("Network error saving draft.");
    } finally {
      setIsSaving(false);
    }
  };

  // Continue to Review -> Navigate to Screen 6 (Review & Publish)
  const handleContinueToReview = async () => {
    const isValid = validateForm();
    if (!isValid) {
      triggerToast("Please resolve validation errors before continuing.");
      return;
    }
    await handleSaveDraft();
    router.push(`/recruitment/requisitions/${rawId}/post/review`);
  };

  // Final Publish Handler
  const handleConfirmPublish = async () => {
    try {
      setIsPublishing(true);
      const payload: Partial<CareerSitePosting> = {
        careerSiteTitle,
        urlSlug,
        category: jobCategory,
        location: jobLocation,
        employmentType,
        workArrangement,
        applicationDeadline,
        startDate,
        durationDays: parseInt(postingDuration) || 30,
        showOnHomepage,
        featured: featureJob,
        showInSearch,
        selectedBoardIds,
        jobDescription,
        responsibilities: responsibilities.split("\n").filter(Boolean),
        qualifications: qualifications.split("\n").filter(Boolean),
        additionalInfo,
        status: "PUBLISHED",
      };

      const res = await fetch(`/api/recruitment/requisitions/${rawId}/posting`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, action: "PUBLISH" }),
      });

      if (res.ok) {
        setShowReviewModal(false);
        setIsDirty(false);
        triggerToast("🎉 Job published successfully to Career Site and Selected Job Boards!");
        setTimeout(() => {
          router.push(`/recruitment/requisitions/${rawId}`);
        }, 1800);
      } else {
        const err = await res.json();
        triggerToast(err.message || "Failed to publish job.");
      }
    } catch {
      triggerToast("Network error publishing job.");
    } finally {
      setIsPublishing(false);
    }
  };

  // Reset to Requisition Content
  const handleResetToRequisition = () => {
    if (requisition) {
      if (requisition.description) setJobDescription(requisition.description);
      if (requisition.responsibilities && requisition.responsibilities.length > 0) {
        setResponsibilities(requisition.responsibilities.join("\n"));
      }
      if (requisition.requiredSkills && requisition.requiredSkills.length > 0) {
        setQualifications(requisition.requiredSkills.map((s) => `• ${s}`).join("\n"));
      }
      triggerToast("Job Content restored from official Requisition record.");
    }
    setShowResetConfirmModal(false);
  };

  // AI Enhance Action
  const handleAiEnhance = async () => {
    try {
      setIsAiLoading(true);
      setShowAiEnhanceModal(true);
      const res = await fetch("/api/recruitment/ai-recruiter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ENHANCE_JOB_CONTENT",
          requisitionTitle: careerSiteTitle,
          department: jobCategory,
          content: jobDescription,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        setAiEnhancedDraft(json.enhancedContent);
      } else {
        triggerToast("AI Service temporarily busy. Please try again.");
      }
    } catch {
      triggerToast("Failed to connect to AI Assistant.");
    } finally {
      setIsAiLoading(false);
    }
  };

  // Apply AI Enhanced Copy
  const handleApplyAiDraft = () => {
    if (aiEnhancedDraft) {
      setJobDescription(aiEnhancedDraft);
      setIsDirty(true);
      triggerToast("AI-enhanced copy applied to Job Description!");
    }
    setShowAiEnhanceModal(false);
    setAiEnhancedDraft(null);
  };

  // Cancel Action
  const handleCancel = () => {
    if (isDirty) {
      setShowCancelConfirmModal(true);
    } else {
      router.push(`/recruitment/requisitions/${rawId}`);
    }
  };

  // Compute Days Open / Duration
  const formattedStartDate = useMemo(() => {
    try {
      const d = new Date(startDate);
      return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    } catch {
      return "16 Oct 2026";
    }
  }, [startDate]);

  const formattedExpiryDate = useMemo(() => {
    try {
      const d = new Date(applicationDeadline);
      return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    } catch {
      return "15 Nov 2026";
    }
  }, [applicationDeadline]);

  // Calculate duration days
  const computedDurationDays = useMemo(() => {
    try {
      const start = new Date(startDate).getTime();
      const end = new Date(applicationDeadline).getTime();
      const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      return diff > 0 ? `${diff} days` : "30 days";
    } catch {
      return "30 days";
    }
  }, [startDate, applicationDeadline]);

  return (
    <RecruitingShell>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 flex items-center gap-3 px-5 py-3 rounded-xl bg-slate-900 text-white text-sm font-medium shadow-2xl border border-slate-700 animate-fade-in">
          <svg className="w-5 h-5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-400 hover:text-white transition"
          >
            ✕
          </button>
        </div>
      )}

      <div className="space-y-6 pb-24">
        {/* =========================================================================
            HEADER & BREADCRUMBS
        ========================================================================= */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            {/* Breadcrumb */}
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
              <span className="text-slate-800 font-semibold">Post to Career Site</span>
            </div>

            {/* Page Title & Subtitle */}
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Post to Career Site
            </h1>
            <p className="text-sm text-slate-500">
              Publish this job on your company career site and external job boards.
            </p>
          </div>

          {/* Header Action: View Requisition */}
          <div>
            <Link
              href={`/recruitment/requisitions/${requisition?.reqNumber || rawId}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-xs transition"
            >
              <span>View Requisition</span>
              <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>
          </div>
        </div>

        {/* =========================================================================
            FOUR-STEP PROGRESS STEPPER
        ========================================================================= */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="max-w-4xl mx-auto flex items-center justify-between relative">
            {/* Step 1: Career Site Details */}
            <button
              onClick={() => {
                setCurrentStep(1);
                document.getElementById("section-career-site")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="flex items-center gap-2.5 z-10 group"
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${
                  currentStep === 1
                    ? "bg-blue-600 text-white ring-4 ring-blue-50 shadow-xs"
                    : "bg-blue-100 text-blue-700 font-semibold"
                }`}
              >
                1
              </div>
              <span
                className={`text-xs font-semibold ${
                  currentStep === 1 ? "text-blue-700" : "text-slate-600 group-hover:text-slate-900"
                }`}
              >
                Career Site Details
              </span>
            </button>

            {/* Line 1 -> 2 */}
            <div className="flex-1 h-0.5 mx-3 bg-slate-200" />

            {/* Step 2: Select Job Boards */}
            <button
              onClick={() => {
                setCurrentStep(2);
                document.getElementById("section-job-boards")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="flex items-center gap-2.5 z-10 group"
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${
                  currentStep === 2
                    ? "bg-blue-600 text-white ring-4 ring-blue-50 shadow-xs"
                    : "border-2 border-slate-300 text-slate-500 bg-white group-hover:border-slate-400"
                }`}
              >
                2
              </div>
              <span
                className={`text-xs font-semibold ${
                  currentStep === 2 ? "text-blue-700" : "text-slate-600 group-hover:text-slate-900"
                }`}
              >
                Select Job Boards
              </span>
            </button>

            {/* Line 2 -> 3 */}
            <div className="flex-1 h-0.5 mx-3 bg-slate-200" />

            {/* Step 3: Job Content */}
            <button
              onClick={() => {
                setCurrentStep(3);
                document.getElementById("section-job-content")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="flex items-center gap-2.5 z-10 group"
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${
                  currentStep === 3
                    ? "bg-blue-600 text-white ring-4 ring-blue-50 shadow-xs"
                    : "border-2 border-slate-300 text-slate-500 bg-white group-hover:border-slate-400"
                }`}
              >
                3
              </div>
              <span
                className={`text-xs font-semibold ${
                  currentStep === 3 ? "text-blue-700" : "text-slate-600 group-hover:text-slate-900"
                }`}
              >
                Job Content
              </span>
            </button>

            {/* Line 3 -> 4 */}
            <div className="flex-1 h-0.5 mx-3 bg-slate-200" />

            {/* Step 4: Review & Publish */}
            <button
              onClick={() => {
                setCurrentStep(4);
                handleContinueToReview();
              }}
              className="flex items-center gap-2.5 z-10 group"
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${
                  currentStep === 4
                    ? "bg-blue-600 text-white ring-4 ring-blue-50 shadow-xs"
                    : "border-2 border-slate-300 text-slate-500 bg-white group-hover:border-slate-400"
                }`}
              >
                4
              </div>
              <span
                className={`text-xs font-semibold ${
                  currentStep === 4 ? "text-blue-700" : "text-slate-600 group-hover:text-slate-900"
                }`}
              >
                Review & Publish
              </span>
            </button>
          </div>
        </div>

        {/* =========================================================================
            MAIN 2-COLUMN WORKSPACE: LEFT CONFIG (8 COLS), RIGHT PREVIEW & SUMMARY (4 COLS)
        ========================================================================= */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* ---------------------------------------------------------------------
              LEFT COLUMN: Configuration Sections (8 Cols)
          --------------------------------------------------------------------- */}
          <div className="xl:col-span-8 space-y-6">
            {/* Card 0: Requisition Information Banner */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h2 className="text-sm font-bold text-slate-900">Requisition Information</h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <div className="text-[11px] font-medium text-slate-400">Requisition ID</div>
                  <div className="text-xs font-bold text-slate-800 mt-0.5">
                    {requisition?.reqNumber || rawId}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-medium text-slate-400">Job Title</div>
                  <div className="text-xs font-semibold text-slate-800 mt-0.5 truncate">
                    {requisition?.title || careerSiteTitle}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-medium text-slate-400">Department</div>
                  <div className="text-xs font-semibold text-slate-800 mt-0.5">
                    {requisition?.department || jobCategory}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-medium text-slate-400">Location</div>
                  <div className="text-xs font-semibold text-slate-800 mt-0.5 truncate">
                    {requisition?.location || jobLocation}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-medium text-slate-400">Employment Type</div>
                  <div className="text-xs font-semibold text-slate-800 mt-0.5">
                    {requisition?.employmentType || employmentType}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-medium text-slate-400">Number of Openings</div>
                  <div className="text-xs font-semibold text-slate-800 mt-0.5">
                    {requisition?.targetHeadcount || 2}
                  </div>
                </div>
              </div>
            </div>

            {/* Card 1: Section A — Career Site Posting Details */}
            <div id="section-career-site" className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Career Site Posting Details</h2>
                  <p className="text-xs text-slate-500">
                    Configure how this job will appear on your company career site.
                  </p>
                </div>
              </div>

              {/* Form Grid */}
              <div className="space-y-4">
                {/* Row 1: Title, URL Slug, Category */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Career Site Title */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Career Site Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={careerSiteTitle}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      placeholder="e.g. Senior Java Developer"
                      className={`w-full px-3 py-2 text-xs rounded-xl border bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition ${
                        formErrors.careerSiteTitle ? "border-red-400 bg-red-50/20" : "border-slate-200"
                      }`}
                    />
                    {formErrors.careerSiteTitle && (
                      <p className="text-[11px] text-red-500 mt-1">{formErrors.careerSiteTitle}</p>
                    )}
                  </div>

                  {/* URL Slug */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      URL Slug <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={urlSlug}
                      onChange={(e) => {
                        setUrlSlug(e.target.value);
                        setIsSlugManuallyEdited(true);
                        setIsDirty(true);
                      }}
                      placeholder="e.g. senior-java-developer"
                      className={`w-full px-3 py-2 text-xs rounded-xl border bg-white font-mono text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition ${
                        formErrors.urlSlug ? "border-red-400 bg-red-50/20" : "border-slate-200"
                      }`}
                    />
                    {/* Public URL Preview underneath */}
                    <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-slate-500 truncate">
                      <span className="truncate">https://careers.maxerp.com/jobs/{urlSlug}</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(`https://careers.maxerp.com/jobs/${urlSlug}`);
                          triggerToast("Career site URL copied to clipboard!");
                        }}
                        title="Copy public URL"
                        className="text-slate-400 hover:text-blue-600 transition shrink-0"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                    {formErrors.urlSlug && (
                      <p className="text-[11px] text-red-500 mt-1">{formErrors.urlSlug}</p>
                    )}
                  </div>

                  {/* Job Category */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Job Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={jobCategory}
                      onChange={(e) => {
                        setJobCategory(e.target.value);
                        setIsDirty(true);
                      }}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition"
                    >
                      <option value="Engineering">Engineering</option>
                      <option value="Product">Product</option>
                      <option value="Design">Design</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Sales">Sales</option>
                      <option value="HR">HR & People</option>
                      <option value="Finance">Finance</option>
                      <option value="Operations">Operations</option>
                      <option value="Legal">Legal</option>
                    </select>
                  </div>
                </div>

                {/* Row 2: Location, Employment Type, Work Arrangement, Application Deadline */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Job Location */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Job Location <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-medium">
                        {jobLocation}
                        <button
                          type="button"
                          onClick={() => {
                            setJobLocation(jobLocation === "Bangalore, India" ? "Remote" : "Bangalore, India");
                            setIsDirty(true);
                          }}
                          className="hover:text-blue-900"
                        >
                          ✕
                        </button>
                      </span>
                    </div>
                  </div>

                  {/* Employment Type */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Employment Type
                    </label>
                    <select
                      value={employmentType}
                      onChange={(e) => {
                        setEmploymentType(e.target.value);
                        setIsDirty(true);
                      }}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition"
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Internship">Internship</option>
                    </select>
                  </div>

                  {/* Work Arrangement */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Work Arrangement
                    </label>
                    <select
                      value={workArrangement}
                      onChange={(e) => {
                        setWorkArrangement(e.target.value);
                        setIsDirty(true);
                      }}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition"
                    >
                      <option value="Hybrid">Hybrid</option>
                      <option value="On-site">On-site</option>
                      <option value="Remote">Remote</option>
                    </select>
                  </div>

                  {/* Application Deadline */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Application Deadline
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={applicationDeadline}
                        onChange={(e) => {
                          setApplicationDeadline(e.target.value);
                          setIsDirty(true);
                        }}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition"
                      />
                    </div>
                    {formErrors.applicationDeadline && (
                      <p className="text-[11px] text-red-500 mt-1">{formErrors.applicationDeadline}</p>
                    )}
                  </div>
                </div>

                {/* Row 3: Toggles & Checkbox */}
                <div className="flex flex-wrap items-center gap-6 pt-3 border-t border-slate-100">
                  {/* Switch 1: Show on Homepage */}
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={showOnHomepage}
                      onClick={() => {
                        setShowOnHomepage((p) => !p);
                        setIsDirty(true);
                      }}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                        showOnHomepage ? "bg-blue-600" : "bg-slate-200"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                          showOnHomepage ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                    <span className="text-xs text-slate-600">Show this job on the careers homepage</span>
                  </label>

                  {/* Switch 2: Feature Job */}
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={featureJob}
                      onClick={() => {
                        setFeatureJob((p) => !p);
                        setIsDirty(true);
                      }}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                        featureJob ? "bg-blue-600" : "bg-slate-200"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                          featureJob ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                    <span className="text-xs text-slate-600">Feature this job on the careers site</span>
                  </label>

                  {/* Checkbox 3: Show in Search Results */}
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={showInSearch}
                      onChange={(e) => {
                        setShowInSearch(e.target.checked);
                        setIsDirty(true);
                      }}
                      className="w-4 h-4 rounded-sm border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-xs text-slate-600">Show in search results</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Card 2: Section B — Select External Job Boards */}
            <div id="section-job-boards" className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Select External Job Boards</h2>
                    <p className="text-xs text-slate-500">
                      Choose the external job boards where you want to publish this job.
                    </p>
                  </div>
                </div>

                {/* Manage Job Boards Action Button */}
                <button
                  type="button"
                  onClick={() => setShowManageBoardsModal(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Manage Job Boards</span>
                </button>
              </div>

              {/* Filters & Search Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
                {/* Filter Tabs */}
                <div className="flex items-center gap-1 border-b sm:border-b-0 border-slate-100">
                  {(["ALL", "FREE", "PREMIUM", "CONFIGURED"] as const).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setBoardFilter(f)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                        boardFilter === f
                          ? "bg-slate-100 text-slate-900 border-b-2 border-blue-600 sm:border-b-0"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {f === "ALL" && "All Job Boards"}
                      {f === "FREE" && "Free Job Boards"}
                      {f === "PREMIUM" && "Premium Job Boards"}
                      {f === "CONFIGURED" && "Configured Boards"}
                    </button>
                  ))}
                </div>

                {/* Search input */}
                <div className="relative sm:w-60">
                  <input
                    type="text"
                    value={boardSearch}
                    onChange={(e) => setBoardSearch(e.target.value)}
                    placeholder="Search job boards..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition"
                  />
                  <svg className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* 3x3 Grid of Job Boards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                {filteredBoards.map((board) => {
                  const isSelected = selectedBoardIds.includes(board.id);
                  const isConfigured = board.status === "CONFIGURED" || board.status === "CONNECTED";

                  return (
                    <div
                      key={board.id}
                      onClick={() => handleToggleBoard(board)}
                      className={`p-3.5 rounded-xl border transition cursor-pointer select-none relative ${
                        isSelected
                          ? "border-blue-500 bg-blue-50/20 shadow-xs"
                          : isConfigured
                          ? "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                          : "border-slate-200 bg-slate-50/60 opacity-85 hover:opacity-100"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Custom Checkbox */}
                        <div className="pt-0.5">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}} // handled by parent div
                            className="w-4 h-4 rounded-sm border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer pointer-events-none"
                          />
                        </div>

                        {/* Brand Logo Chip */}
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm font-bold shadow-2xs"
                          style={{
                            backgroundColor: board.logoBg,
                            color: board.logoColor,
                            border: board.logoBg === "#ffffff" ? "1px solid #e2e8f0" : "none",
                          }}
                        >
                          {board.logoLetter}
                        </div>

                        {/* Board Info & Tier Badge */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-bold text-slate-800 truncate">
                              {board.name}
                            </span>
                            <span
                              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${
                                board.tier === "FREE"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200/50"
                                  : "bg-blue-50 text-blue-700 border border-blue-200/50"
                              }`}
                            >
                              {board.tier === "FREE" ? "Free" : "Premium"}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">
                            {board.description}
                          </p>

                          {/* Not Configured Hint */}
                          {!isConfigured && (
                            <span className="inline-block text-[10px] text-amber-600 font-medium mt-1">
                              Requires configuration ↗
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add Another Job Board link button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddBoardModal(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition"
                >
                  <span className="text-base leading-none">+</span>
                  <span>Add Another Job Board</span>
                </button>
              </div>
            </div>

            {/* Card 3: Section C — Job Content */}
            <div id="section-job-content" className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Job Content</h2>
                    <p className="text-xs text-slate-500">
                      Use content from the requisition or customize it for each channel.
                    </p>
                  </div>
                </div>

                {/* Header right action: Use Requisition Content */}
                <button
                  type="button"
                  onClick={() => setShowResetConfirmModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-xs transition"
                >
                  <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Use Requisition Content</span>
                </button>
              </div>

              {/* Tabs Bar & AI Enhance Trigger */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pt-2 gap-2">
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setActiveContentTab("description")}
                    className={`pb-2.5 text-xs font-semibold border-b-2 transition ${
                      activeContentTab === "description"
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Job Description
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveContentTab("responsibilities")}
                    className={`pb-2.5 text-xs font-semibold border-b-2 transition ${
                      activeContentTab === "responsibilities"
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Key Responsibilities
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveContentTab("qualifications")}
                    className={`pb-2.5 text-xs font-semibold border-b-2 transition ${
                      activeContentTab === "qualifications"
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Qualifications
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveContentTab("additional")}
                    className={`pb-2.5 text-xs font-semibold border-b-2 transition ${
                      activeContentTab === "additional"
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Additional Information
                  </button>
                </div>

                {/* AI Enhance Button */}
                <button
                  type="button"
                  onClick={handleAiEnhance}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-semibold border border-purple-200/60 shadow-2xs transition mb-2 sm:mb-1.5"
                >
                  <span className="text-purple-600">✨</span>
                  <span>AI Enhance</span>
                </button>
              </div>

              {/* Rich Text Toolbar */}
              <div className="flex flex-wrap items-center gap-1 p-1.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-600">
                <select className="px-2 py-1 text-xs font-medium bg-transparent border-0 rounded-md text-slate-700 focus:outline-hidden cursor-pointer">
                  <option>Paragraph</option>
                  <option>Heading 1</option>
                  <option>Heading 2</option>
                  <option>Heading 3</option>
                </select>
                <div className="w-px h-4 bg-slate-300 mx-1" />
                <button type="button" className="p-1 hover:bg-slate-200 rounded-md font-bold text-xs" title="Bold">
                  B
                </button>
                <button type="button" className="p-1 hover:bg-slate-200 rounded-md italic text-xs font-serif" title="Italic">
                  I
                </button>
                <button type="button" className="p-1 hover:bg-slate-200 rounded-md underline text-xs" title="Underline">
                  U
                </button>
                <div className="w-px h-4 bg-slate-300 mx-1" />
                <button type="button" className="p-1 hover:bg-slate-200 rounded-md text-xs" title="Bullet List">
                  • List
                </button>
                <button type="button" className="p-1 hover:bg-slate-200 rounded-md text-xs" title="Numbered List">
                  1. List
                </button>
                <div className="w-px h-4 bg-slate-300 mx-1" />
                <button type="button" className="p-1 hover:bg-slate-200 rounded-md text-xs" title="Insert Link">
                  🔗
                </button>
                <button type="button" className="p-1 hover:bg-slate-200 rounded-md text-xs" title="Insert Checkbox">
                  ☑
                </button>
                <button type="button" className="p-1 hover:bg-slate-200 rounded-md text-xs" title="Insert Image">
                  🖼
                </button>
              </div>

              {/* Textarea Editor Area */}
              <div>
                {activeContentTab === "description" && (
                  <textarea
                    rows={6}
                    value={jobDescription}
                    onChange={(e) => {
                      setJobDescription(e.target.value);
                      setIsDirty(true);
                    }}
                    placeholder="Enter comprehensive job overview and objectives..."
                    className="w-full p-3.5 text-xs leading-relaxed rounded-xl border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition resize-y font-sans"
                  />
                )}

                {activeContentTab === "responsibilities" && (
                  <textarea
                    rows={6}
                    value={responsibilities}
                    onChange={(e) => {
                      setResponsibilities(e.target.value);
                      setIsDirty(true);
                    }}
                    placeholder="Enter key responsibilities (one per line)..."
                    className="w-full p-3.5 text-xs leading-relaxed rounded-xl border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition resize-y font-sans"
                  />
                )}

                {activeContentTab === "qualifications" && (
                  <textarea
                    rows={6}
                    value={qualifications}
                    onChange={(e) => {
                      setQualifications(e.target.value);
                      setIsDirty(true);
                    }}
                    placeholder="Enter required and preferred qualifications..."
                    className="w-full p-3.5 text-xs leading-relaxed rounded-xl border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition resize-y font-sans"
                  />
                )}

                {activeContentTab === "additional" && (
                  <textarea
                    rows={6}
                    value={additionalInfo}
                    onChange={(e) => {
                      setAdditionalInfo(e.target.value);
                      setIsDirty(true);
                    }}
                    placeholder="Enter company culture, equal opportunity statement, benefits..."
                    className="w-full p-3.5 text-xs leading-relaxed rounded-xl border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition resize-y font-sans"
                  />
                )}

                {formErrors.jobDescription && (
                  <p className="text-[11px] text-red-500 mt-1">{formErrors.jobDescription}</p>
                )}
              </div>
            </div>
          </div>

          {/* ---------------------------------------------------------------------
              RIGHT COLUMN: Career Site Preview & Posting Summary (4 Cols)
          --------------------------------------------------------------------- */}
          <div className="xl:col-span-4 space-y-6">
            {/* Top Card: Section D — Career Site Preview */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">Career Site Preview</h3>
                    <p className="text-[11px] text-slate-500">This is how the job will appear on your career site.</p>
                  </div>
                </div>
              </div>

              {/* View Switcher: Desktop | Mobile | Open in New Tab */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/60">
                  <button
                    type="button"
                    onClick={() => setPreviewMode("desktop")}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition ${
                      previewMode === "desktop"
                        ? "bg-white text-slate-900 shadow-2xs"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    Desktop View
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode("mobile")}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition ${
                      previewMode === "mobile"
                        ? "bg-white text-slate-900 shadow-2xs"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    Mobile View
                  </button>
                </div>

                <Link
                  href={`/careers?preview=${requisition?.reqNumber || rawId}`}
                  target="_blank"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 transition"
                >
                  <span>Open in New Tab</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </Link>
              </div>

              {/* Interactive Live Preview Frame */}
              <div
                className={`overflow-hidden rounded-xl border border-slate-200 bg-slate-900 transition-all ${
                  previewMode === "mobile"
                    ? "max-w-[320px] mx-auto border-4 border-slate-800 rounded-[32px] shadow-xl"
                    : "w-full"
                }`}
              >
                {/* Simulated Portal Top Bar */}
                <div className="bg-[#0f172a] px-3.5 py-2.5 flex items-center justify-between text-white border-b border-slate-800 text-[10px]">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-sm bg-blue-600 flex items-center justify-center font-bold text-[9px]">
                      M
                    </div>
                    <span className="font-bold tracking-tight">MAX ERP</span>
                  </div>
                  {previewMode === "desktop" ? (
                    <div className="flex items-center gap-3 text-slate-300 font-medium">
                      <span className="text-white font-semibold">Careers</span>
                      <span>Life at MAX ERP</span>
                      <span>Teams</span>
                      <span>Locations</span>
                      <span>🔍</span>
                      <span>☰</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-slate-300">
                      <span>🔍</span>
                      <span>☰</span>
                    </div>
                  )}
                </div>

                {/* Hero Header with Corporate Image */}
                <div className="relative bg-gradient-to-r from-slate-900 to-slate-800 py-6 px-4 text-white overflow-hidden">
                  <div
                    className="absolute inset-0 opacity-25 bg-cover bg-center"
                    style={{
                      backgroundImage: `url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80')`,
                    }}
                  />
                  <div className="relative z-10 space-y-1">
                    <h4 className="text-sm font-bold tracking-tight">Build the future with us</h4>
                    <p className="text-[10px] text-slate-300">Great people. Greater possibilities.</p>
                  </div>
                </div>

                {/* Job Detail Preview Body */}
                <div className="bg-white p-4 space-y-3">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-bold text-slate-900 truncate">
                        {careerSiteTitle || "Job Title"}
                      </h4>
                      <span className="inline-block px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                        {workArrangement}
                      </span>
                    </div>

                    {/* Metadata line */}
                    <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-500 mt-1">
                      <span className="flex items-center gap-1">
                        📍 {jobLocation}
                      </span>
                      <span className="flex items-center gap-1">
                        🏢 {jobCategory}
                      </span>
                      <span className="flex items-center gap-1">
                        🕒 {employmentType}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      className="flex-1 py-1.5 rounded-lg bg-blue-600 text-white font-semibold text-[11px] shadow-xs text-center hover:bg-blue-700 transition"
                    >
                      Apply Now
                    </button>
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 font-semibold text-[11px] hover:bg-slate-50 transition"
                    >
                      🔖 Save Job
                    </button>
                  </div>

                  {/* Snippet of Job Description */}
                  <div className="pt-2 border-t border-slate-100">
                    <div className="text-[11px] font-bold text-slate-800 mb-1">Job Description</div>
                    <p className="text-[10px] leading-relaxed text-slate-600 line-clamp-4 font-sans">
                      {jobDescription}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Card: Section E — Posting Summary */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-xs font-bold text-slate-900">Posting Summary</h3>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    document.getElementById("section-career-site")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition flex items-center gap-1"
                >
                  <span>✏</span>
                  <span>Edit</span>
                </button>
              </div>

              {/* Summary Table List */}
              <div className="space-y-2 text-xs pt-1 divide-y divide-slate-100">
                {/* Career Site Status */}
                <div className="flex items-center justify-between pt-1.5">
                  <span className="text-slate-500">Career Site</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Enabled
                  </span>
                </div>

                {/* Selected Job Boards */}
                <div className="flex items-center justify-between pt-1.5">
                  <span className="text-slate-500">Selected Job Boards</span>
                  <div className="flex items-center gap-1.5">
                    {/* Tiny logos stack */}
                    <div className="flex items-center -space-x-1">
                      {selectedBoardsList.slice(0, 4).map((b) => (
                        <div
                          key={b.id}
                          title={b.name}
                          className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white ring-1 ring-white"
                          style={{ backgroundColor: b.logoBg, color: b.logoColor }}
                        >
                          {b.logoLetter}
                        </div>
                      ))}
                    </div>
                    <span className="text-xs font-semibold text-slate-800">
                      {selectedBoardIds.length} {selectedBoardIds.length === 1 ? "board" : "boards"}
                    </span>
                  </div>
                </div>

                {/* Posting Duration */}
                <div className="flex items-center justify-between pt-1.5">
                  <span className="text-slate-500">Posting Duration</span>
                  <span className="font-semibold text-slate-800">{computedDurationDays}</span>
                </div>

                {/* Start Date */}
                <div className="flex items-center justify-between pt-1.5">
                  <span className="text-slate-500">Start Date</span>
                  <span className="font-semibold text-slate-800">{formattedStartDate}</span>
                </div>

                {/* Expiry Date */}
                <div className="flex items-center justify-between pt-1.5">
                  <span className="text-slate-500">Expiry Date</span>
                  <span className="font-semibold text-slate-800">{formattedExpiryDate}</span>
                </div>

                {/* Application Method */}
                <div className="flex items-center justify-between pt-1.5">
                  <span className="text-slate-500">Application Method</span>
                  <span className="font-semibold text-slate-800">MAX ERP career site</span>
                </div>

                {/* Auto-Expire */}
                <div className="flex items-center justify-between pt-1.5">
                  <span className="text-slate-500">Auto-Expire</span>
                  <span className="font-semibold text-slate-800">{applicationDeadline ? "Yes" : "No"}</span>
                </div>

                {/* Feature Job */}
                <div className="flex items-center justify-between pt-1.5">
                  <span className="text-slate-500">Feature Job</span>
                  <span className="font-semibold text-slate-800">{featureJob ? "Yes" : "No"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            PERSISTENT BOTTOM ACTION BAR
        ========================================================================= */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 py-3.5 px-6 shadow-lg">
          <div className="max-w-[1720px] mx-auto flex items-center justify-between">
            {/* Cancel Button */}
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition"
            >
              Cancel
            </button>

            {/* Right Group: Save as Draft & Continue to Review */}
            <div className="flex items-center gap-3">
              {/* Save as Draft */}
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-xs transition disabled:opacity-50"
              >
                <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                <span>{isSaving ? "Saving..." : "Save as Draft"}</span>
              </button>

              {/* Continue to Review */}
              <button
                type="button"
                onClick={handleContinueToReview}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition"
              >
                <span>Continue to Review</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>

        {/* =========================================================================
            MODAL 1: STEP 4 — REVIEW & PUBLISH DIALOG
        ========================================================================= */}
        {showReviewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
            <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                    4
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Review & Publish Requisition</h3>
                    <p className="text-xs text-slate-500">Verify your career site details and job board destinations.</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  ✕
                </button>
              </div>

              {/* Review summary cards */}
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-500">Posting Title</span>
                    <span className="font-bold text-slate-800">{careerSiteTitle}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-500">Public URL</span>
                    <span className="font-mono text-blue-600 truncate max-w-[280px]">
                      https://careers.maxerp.com/jobs/{urlSlug}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-500">Department / Location</span>
                    <span className="font-semibold text-slate-800">{jobCategory} • {jobLocation} ({workArrangement})</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-500">Posting Schedule</span>
                    <span className="font-semibold text-slate-800">{formattedStartDate} — {formattedExpiryDate} ({computedDurationDays})</span>
                  </div>
                </div>

                {/* Destinations */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 space-y-2">
                  <span className="font-bold text-slate-700 block">Publication Destinations ({1 + selectedBoardIds.length})</span>
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-[11px] font-semibold border border-emerald-200">
                      🌐 MAX ERP Career Site
                    </span>
                    {selectedBoardsList.map((b) => (
                      <span
                        key={b.id}
                        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-white text-slate-700 text-[11px] font-medium border border-slate-200 shadow-2xs"
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] font-bold"
                          style={{ backgroundColor: b.logoBg, color: b.logoColor }}
                        >
                          {b.logoLetter}
                        </span>
                        {b.name}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 italic">
                  Note: Publishing will activate the posting immediately on your career portal and dispatch syndication payloads to authorized external boards.
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Back to Edit
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPublish}
                  disabled={isPublishing}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition disabled:opacity-50"
                >
                  {isPublishing ? "Publishing..." : "Confirm & Publish Now"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            MODAL 2: MANAGE JOB BOARDS DIALOG
        ========================================================================= */}
        {showManageBoardsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Manage Job Board Integrations</h3>
                  <p className="text-xs text-slate-500">Configure connection status and employer API credentials.</p>
                </div>
                <button
                  onClick={() => setShowManageBoardsModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  ✕
                </button>
              </div>

              <div className="max-h-96 overflow-y-auto space-y-2 pr-1">
                {jobBoards.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                        style={{ backgroundColor: b.logoBg, color: b.logoColor }}
                      >
                        {b.logoLetter}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-800">{b.name}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-slate-200 text-slate-700">
                            {b.tier}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">{b.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          b.status === "CONFIGURED" || b.status === "CONNECTED"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {b.status}
                      </span>
                      {b.status === "NOT_CONFIGURED" ? (
                        <button
                          type="button"
                          onClick={() => {
                            setShowManageBoardsModal(false);
                            setShowConfigureBoardModal(b);
                          }}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                        >
                          Configure
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={async () => {
                            await fetch("/api/recruitment/job-boards", {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ id: b.id, status: "NOT_CONFIGURED" }),
                            });
                            setJobBoards((prev) =>
                              prev.map((item) => (item.id === b.id ? { ...item, status: "NOT_CONFIGURED" } : item))
                            );
                            setSelectedBoardIds((prev) => prev.filter((id) => id !== b.id));
                            triggerToast(`${b.name} disconnected.`);
                          }}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
                        >
                          Disconnect
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowManageBoardsModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            MODAL 3: CONFIGURE SPECIFIC JOB BOARD MODAL
        ========================================================================= */}
        {showConfigureBoardModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                    style={{
                      backgroundColor: showConfigureBoardModal.logoBg,
                      color: showConfigureBoardModal.logoColor,
                    }}
                  >
                    {showConfigureBoardModal.logoLetter}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Configure {showConfigureBoardModal.name} Integration
                    </h3>
                    <p className="text-[11px] text-slate-500">Provide employer credentials to enable syndication.</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowConfigureBoardModal(null)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Employer Client ID / Account ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    defaultValue={`MAX-CORP-${showConfigureBoardModal.id.toUpperCase()}-2026`}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    API Secret / Access Token <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    defaultValue="••••••••••••••••••••••••••••••••"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  {showConfigureBoardModal.eligibilityNotice ||
                    "Enter valid employer credentials to verify authentication and enable 1-click posting."}
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowConfigureBoardModal(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveBoardConfiguration(showConfigureBoardModal.id)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
                >
                  Connect & Enable
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            MODAL 4: ADD ANOTHER JOB BOARD MODAL
        ========================================================================= */}
        {showAddBoardModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">Add Custom Job Board Connector</h3>
                <button
                  onClick={() => setShowAddBoardModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Board Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Stack Overflow Jobs / Wellfound"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Syndication Protocol</label>
                  <select className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white">
                    <option>Standard REST API Connector</option>
                    <option>Direct XML / RSS Feed Ingestion</option>
                    <option>JSON Webhook Dispatcher</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Endpoint / Feed URL</label>
                  <input
                    type="url"
                    placeholder="https://api.job-board.com/v1/jobs"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddBoardModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddBoardModal(false);
                    triggerToast("Custom job board connector registered successfully!");
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
                >
                  Register Connector
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            MODAL 5: AI ENHANCE JOB CONTENT MODAL
        ========================================================================= */}
        {showAiEnhanceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
            <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-purple-600 text-lg">✨</span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">AI-Enhanced Job Description Draft</h3>
                    <p className="text-[11px] text-slate-500">Refined for search optimization and candidate engagement.</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAiEnhanceModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  ✕
                </button>
              </div>

              {isAiLoading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3">
                  <div className="w-8 h-8 rounded-full border-2 border-purple-600 border-t-transparent animate-spin" />
                  <p className="text-xs font-semibold text-slate-600">Generating compelling job description copy...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3.5 bg-purple-50/50 rounded-xl border border-purple-100 text-xs text-slate-700 leading-relaxed font-sans whitespace-pre-line max-h-72 overflow-y-auto">
                    {aiEnhancedDraft}
                  </div>
                  <p className="text-[11px] text-slate-500 italic">
                    Review and edit the draft as needed. Applying will update your active Job Description editor.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAiEnhanceModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Discard Draft
                </button>
                <button
                  type="button"
                  disabled={!aiEnhancedDraft || isAiLoading}
                  onClick={handleApplyAiDraft}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50"
                >
                  Apply AI Draft
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            MODAL 6: RESET TO REQUISITION CONFIRMATION MODAL
        ========================================================================= */}
        {showResetConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Reset to Requisition Content?</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                This will overwrite your customized career site text with the official Job Description business object content. Are you sure you want to proceed?
              </p>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResetConfirmModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleResetToRequisition}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
                >
                  Confirm Reset
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            MODAL 7: DISCARD UNSAVED CHANGES CONFIRMATION
        ========================================================================= */}
        {showCancelConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Discard Unsaved Changes?</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                You have unsaved changes on this posting. Leaving now will discard your edits.
              </p>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCancelConfirmModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Keep Editing
                </button>
                <button
                  type="button"
                  onClick={() => router.push(`/recruitment/requisitions/${rawId}`)}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold"
                >
                  Discard & Exit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RecruitingShell>
  );
}
