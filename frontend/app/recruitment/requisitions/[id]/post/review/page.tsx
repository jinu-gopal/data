"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import RecruitingShell from "@/components/recruitment/RecruitingShell";
import {
  Requisition,
  JobBoardIntegration,
  CareerSitePosting,
  recruitmentStore,
} from "@/lib/recruitment-store";

export default function ReviewAndPublishPage() {
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

  // Posting configuration state
  const [posting, setPosting] = useState<CareerSitePosting | null>(() => {
    return recruitmentStore.getPostingByRequisitionId(rawId) || null;
  });

  // Job boards registry
  const [jobBoards, setJobBoards] = useState<JobBoardIntegration[]>(() => {
    return recruitmentStore.getJobBoards();
  });

  // Preview mode (desktop | mobile)
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [showWarningsDetail, setShowWarningsDetail] = useState(true);

  // Active preview tab inside the mock career site card
  const [previewActiveTab, setPreviewActiveTab] = useState<
    "description" | "requirements" | "perks" | "about"
  >("description");

  // Interaction & submission states
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [showPublishConfirmModal, setShowPublishConfirmModal] = useState(false);
  const [showPublishSuccessModal, setShowPublishSuccessModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [publishResults, setPublishResults] = useState<any[]>([]);

  // Trigger auto-dismiss toast
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Fetch requisition and posting data
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
          }
        }

        // Load posting configuration
        const postRes = await fetch(`/api/recruitment/requisitions/${rawId}/posting`);
        if (postRes.ok) {
          const postJson = await postRes.json();
          if (isMounted && postJson.data) {
            setPosting(postJson.data);
          }
        }

        // Load boards registry
        const boardsRes = await fetch(`/api/recruitment/job-boards`);
        if (boardsRes.ok) {
          const boardsJson = await boardsRes.json();
          if (isMounted && boardsJson.data) {
            setJobBoards(boardsJson.data);
          }
        }
      } catch (err: any) {
        console.error("Failed to load review data", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [rawId]);

  // Derived selected external job boards
  const selectedBoards = useMemo(() => {
    if (!posting || !posting.selectedBoardIds) {
      // Default to the 4 approved boards from the mockup
      return jobBoards.filter((b) => ["indeed", "linkedin", "naukri", "google-jobs"].includes(b.id));
    }
    return jobBoards.filter((b) => posting.selectedBoardIds.includes(b.id));
  }, [jobBoards, posting]);

  // Derived dates
  const formattedStartDate = useMemo(() => {
    try {
      const d = new Date(posting?.startDate || "2026-10-16");
      return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    } catch {
      return "16 Oct 2026";
    }
  }, [posting?.startDate]);

  const formattedExpiryDate = useMemo(() => {
    try {
      const d = new Date(posting?.applicationDeadline || "2026-11-15");
      return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    } catch {
      return "15 Nov 2026";
    }
  }, [posting?.applicationDeadline]);

  // Save as Draft handler
  const handleSaveDraft = async () => {
    try {
      setIsSaving(true);
      const res = await fetch(`/api/recruitment/requisitions/${rawId}/posting`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...posting, action: "SAVE_DRAFT" }),
      });

      if (res.ok) {
        triggerToast("Posting configuration saved as draft successfully.");
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

  // Publish Now Execution
  const handleConfirmPublish = async () => {
    try {
      setIsPublishing(true);
      const res = await fetch(`/api/recruitment/requisitions/${rawId}/posting`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...posting, action: "PUBLISH" }),
      });

      if (res.ok) {
        const json = await res.json();
        setShowPublishConfirmModal(false);
        setPublishResults(json.destinations || []);
        setShowPublishSuccessModal(true);
        triggerToast("🎉 Job requisition published successfully across all verified destinations!");
      } else {
        const err = await res.json();
        triggerToast(err.message || "Failed to publish job.");
      }
    } catch {
      triggerToast("Network error publishing requisition.");
    } finally {
      setIsPublishing(false);
    }
  };

  const jobTitle = posting?.careerSiteTitle || requisition?.title || "Senior Java Developer";
  const urlSlug = posting?.urlSlug || "senior-java-developer";
  const jobCategory = posting?.category || requisition?.department || "Engineering";
  const jobLocation = posting?.location || requisition?.location || "Bangalore, India";
  const employmentType = posting?.employmentType || requisition?.employmentType || "Full-time";
  const workArrangement = posting?.workArrangement || "Hybrid";
  const headcount = requisition?.targetHeadcount || 2;
  const descriptionText =
    posting?.jobDescription ||
    "We are looking for a Senior Java Developer to join our engineering team. The ideal candidate will have strong experience in Java, Spring Boot and enterprise applications. You will design, develop and maintain scalable backend services and collaborate with cross-functional teams.";

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
              <Link
                href={`/recruitment/requisitions/${requisition?.reqNumber || rawId}/post`}
                className="hover:text-slate-800 transition"
              >
                Post to Career Site
              </Link>
              <span>/</span>
              <span className="text-slate-800 font-semibold">Review & Publish</span>
            </div>

            {/* Page Title & Subtitle */}
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Review & Publish
            </h1>
            <p className="text-sm text-slate-500">
              You&apos;re almost there! Review your job posting and publish to the career site and selected job boards.
            </p>
          </div>
        </div>

        {/* =========================================================================
            FOUR-STEP PROGRESS STEPPER (Matching Image 6)
        ========================================================================= */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="max-w-4xl mx-auto flex items-center justify-between relative">
            {/* Step 1: Career Site Details (Completed) */}
            <Link
              href={`/recruitment/requisitions/${requisition?.reqNumber || rawId}/post#section-career-site`}
              className="flex items-center gap-2.5 z-10 group"
            >
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold border-2 border-slate-300 text-slate-600 bg-white group-hover:border-slate-400">
                1
              </div>
              <span className="text-xs font-semibold text-slate-600 group-hover:text-slate-900">
                Career Site Details
              </span>
            </Link>

            {/* Line 1 -> 2 */}
            <div className="flex-1 h-0.5 mx-3 bg-slate-200" />

            {/* Step 2: Select Job Boards (Completed) */}
            <Link
              href={`/recruitment/requisitions/${requisition?.reqNumber || rawId}/post#section-job-boards`}
              className="flex items-center gap-2.5 z-10 group"
            >
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold border-2 border-slate-300 text-slate-600 bg-white group-hover:border-slate-400">
                2
              </div>
              <span className="text-xs font-semibold text-slate-600 group-hover:text-slate-900">
                Select Job Boards
              </span>
            </Link>

            {/* Line 2 -> 3 */}
            <div className="flex-1 h-0.5 mx-3 bg-slate-200" />

            {/* Step 3: Job Content (Completed) */}
            <Link
              href={`/recruitment/requisitions/${requisition?.reqNumber || rawId}/post#section-job-content`}
              className="flex items-center gap-2.5 z-10 group"
            >
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold border-2 border-slate-300 text-slate-600 bg-white group-hover:border-slate-400">
                3
              </div>
              <span className="text-xs font-semibold text-slate-600 group-hover:text-slate-900">
                Job Content
              </span>
            </Link>

            {/* Line 3 -> 4 */}
            <div className="flex-1 h-0.5 mx-3 bg-blue-500" />

            {/* Step 4: Review & Publish (Active) */}
            <div className="flex items-center gap-2.5 z-10">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold bg-blue-600 text-white ring-4 ring-blue-50 shadow-xs">
                4
              </div>
              <span className="text-xs font-bold text-blue-700">
                Review & Publish
              </span>
            </div>
          </div>
        </div>

        {/* =========================================================================
            MAIN 2-COLUMN WORKSPACE: LEFT CONFIG (8 COLS), RIGHT PREVIEW & READINESS (4 COLS)
        ========================================================================= */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* ---------------------------------------------------------------------
              LEFT COLUMN: 5 Modular Information Cards (8 Cols)
          --------------------------------------------------------------------- */}
          <div className="xl:col-span-8 space-y-6">
            {/* Card 1: Requisition Overview Card with Glass Building Thumbnail */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                {/* Modern Glass Corporate Office Thumbnail */}
                <div className="w-full sm:w-44 h-28 rounded-xl overflow-hidden shrink-0 relative bg-slate-100 shadow-2xs">
                  <div
                    className="w-full h-full bg-cover bg-center"
                    style={{
                      backgroundImage: `url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&auto=format&fit=crop&q=80')`,
                    }}
                  />
                  <div className="absolute inset-0 bg-slate-900/10" />
                </div>

                {/* Requisition Details Body */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <h2 className="text-base sm:text-lg font-bold text-slate-900 truncate">
                        {jobTitle}
                      </h2>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Ready to Publish
                      </span>
                    </div>

                    {/* Edit Details Action */}
                    <Link
                      href={`/recruitment/requisitions/${requisition?.reqNumber || rawId}/post`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition"
                    >
                      <span>✏</span>
                      <span>Edit Details</span>
                    </Link>
                  </div>

                  {/* Metadata line */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
                    <span className="text-slate-800 font-semibold">{requisition?.reqNumber || rawId}</span>
                    <span>•</span>
                    <span>{jobCategory}</span>
                    <span>•</span>
                    <span>{jobLocation}</span>
                    <span>•</span>
                    <span>{employmentType}</span>
                    <span>•</span>
                    <span>{headcount} Openings</span>
                  </div>

                  {/* Short summary paragraph */}
                  <p className="text-xs text-slate-600 leading-relaxed font-sans line-clamp-2 pt-0.5">
                    {descriptionText}
                  </p>
                </div>
              </div>
            </div>

            {/* Card 2: Publication Destinations Card (Career Site + 4 External Boards) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Publication Destinations</h3>
                    <p className="text-xs text-slate-500">
                      You are publishing to 1 career site and {selectedBoards.length} job boards
                    </p>
                  </div>
                </div>

                <Link
                  href={`/recruitment/requisitions/${requisition?.reqNumber || rawId}/post#section-job-boards`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition"
                >
                  <span>✏</span>
                  <span>Edit Selections</span>
                </Link>
              </div>

              {/* 2-Column Grid: Career Site Sub-Card (Left) & External Boards 2x2 Grid (Right) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-1">
                {/* Left Sub-card: MAX ERP Career Site (5 cols) */}
                <div className="lg:col-span-5 p-4 rounded-xl border border-blue-100 bg-blue-50/30 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                          🌐
                        </div>
                        <span className="text-xs font-bold text-slate-900">MAX ERP Career Site</span>
                      </div>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Enabled
                      </span>
                    </div>

                    {/* URL Link */}
                    <div className="text-[11px] font-mono text-slate-600 truncate bg-white px-2.5 py-1.5 rounded-lg border border-slate-200/80 flex items-center justify-between">
                      <span className="truncate">https://careers.maxerp.com/jobs/{urlSlug}</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(`https://careers.maxerp.com/jobs/${urlSlug}`);
                          triggerToast("Career site URL copied to clipboard!");
                        }}
                        title="Copy URL"
                        className="text-slate-400 hover:text-blue-600 ml-1 shrink-0"
                      >
                        📋
                      </button>
                    </div>
                  </div>

                  {/* Footer Meta Row */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-blue-100/80 text-[11px] text-slate-600">
                    <span className="flex items-center gap-1">
                      <span>🏠</span>
                      <span className="font-medium">Homepage:</span>
                      <span className="font-semibold text-slate-900">
                        {posting?.showOnHomepage ? "Yes" : "No"}
                      </span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span>⭐</span>
                      <span className="font-medium">Featured:</span>
                      <span className="font-semibold text-slate-900">
                        {posting?.featured ? "Yes" : "No"}
                      </span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span>📅</span>
                      <span className="font-semibold text-slate-900">{formattedExpiryDate}</span>
                      <span className="text-slate-400">Expiry Date</span>
                    </span>
                  </div>
                </div>

                {/* Right Sub-grid: 4 Selected External Job Boards (7 cols) in 2x2 grid */}
                <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedBoards.slice(0, 4).map((board) => (
                    <div
                      key={board.id}
                      className="p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition flex items-center justify-between gap-2 shadow-2xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Logo Letter */}
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold shadow-2xs"
                          style={{
                            backgroundColor: board.logoBg,
                            color: board.logoColor,
                            border: board.logoBg === "#ffffff" ? "1px solid #e2e8f0" : "none",
                          }}
                        >
                          {board.logoLetter}
                        </div>

                        {/* Name & Tier */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-800 truncate">
                              {board.name}
                            </span>
                            <span
                              className={`text-[9px] font-semibold px-1 py-0.2 rounded-md ${
                                board.tier === "FREE"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-blue-50 text-blue-700"
                              }`}
                            >
                              {board.tier === "FREE" ? "Free" : "Premium"}
                            </span>
                          </div>
                          {/* Ready Status */}
                          <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-semibold mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Ready</span>
                          </div>
                        </div>
                      </div>

                      {/* Right arrow */}
                      <span className="text-slate-400 text-xs font-bold pr-1">›</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Row 1 of 2 Cards: Job Content (Left) & Posting Schedule (Right) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card 3: Job Content */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center text-xs">
                      📄
                    </div>
                    <h3 className="text-xs font-bold text-slate-900">Job Content</h3>
                  </div>
                  <Link
                    href={`/recruitment/requisitions/${requisition?.reqNumber || rawId}/post#section-job-content`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition"
                  >
                    <span>✏</span>
                    <span>Edit</span>
                  </Link>
                </div>

                <div className="space-y-2.5 text-xs divide-y divide-slate-100">
                  <div className="flex items-start gap-2.5 pt-1">
                    <span className="text-slate-400 mt-0.5">📄</span>
                    <div>
                      <div className="font-semibold text-slate-800">Job Description</div>
                      <div className="text-[11px] text-slate-500">Overview, skills, responsibilities</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 pt-2">
                    <span className="text-slate-400 mt-0.5">📋</span>
                    <div>
                      <div className="font-semibold text-slate-800">Key Responsibilities</div>
                      <div className="text-[11px] text-slate-500">
                        {posting?.responsibilities ? `${posting.responsibilities.length} key responsibilities` : "4 key responsibilities"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 pt-2">
                    <span className="text-slate-400 mt-0.5">🎓</span>
                    <div>
                      <div className="font-semibold text-slate-800">Qualifications</div>
                      <div className="text-[11px] text-slate-500">Education, experience, certifications</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 pt-2">
                    <span className="text-slate-400 mt-0.5">ℹ️</span>
                    <div>
                      <div className="font-semibold text-slate-800">Additional Information</div>
                      <div className="text-[11px] text-slate-500">Work setup, benefits, etc.</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 4: Posting Schedule */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xs">
                      📅
                    </div>
                    <h3 className="text-xs font-bold text-slate-900">Posting Schedule</h3>
                  </div>
                  <Link
                    href={`/recruitment/requisitions/${requisition?.reqNumber || rawId}/post#section-career-site`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition"
                  >
                    <span>✏</span>
                    <span>Edit</span>
                  </Link>
                </div>

                {/* Timeline key-value list */}
                <div className="relative pl-6 space-y-3.5 text-xs before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-blue-100">
                  <div className="relative">
                    <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-white" />
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Start Date</span>
                      <span className="font-semibold text-slate-800">{formattedStartDate}</span>
                    </div>
                  </div>

                  <div className="relative">
                    <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-blue-400 ring-4 ring-white" />
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Expiry Date</span>
                      <span className="font-semibold text-slate-800">{formattedExpiryDate}</span>
                    </div>
                  </div>

                  <div className="relative">
                    <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-blue-300 ring-4 ring-white" />
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Posting Duration</span>
                      <span className="font-semibold text-slate-800">
                        {posting?.durationDays || 30} days
                      </span>
                    </div>
                  </div>

                  <div className="relative">
                    <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-blue-200 ring-4 ring-white" />
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Auto-Expire</span>
                      <span className="font-semibold text-slate-800">
                        {posting?.applicationDeadline ? "Yes" : "No"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2 of 2 Cards: Application Settings (Left) & Visibility & SEO (Right) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card 5: Application Settings */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs">
                      👤
                    </div>
                    <h3 className="text-xs font-bold text-slate-900">Application Settings</h3>
                  </div>
                  <Link
                    href={`/recruitment/requisitions/${requisition?.reqNumber || rawId}/post#section-career-site`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition"
                  >
                    <span>✏</span>
                    <span>Edit</span>
                  </Link>
                </div>

                <div className="space-y-2 text-xs divide-y divide-slate-100">
                  <div className="flex items-center justify-between pt-1">
                    <span className="flex items-center gap-2 text-slate-500">
                      <span>🌐</span> Application Method
                    </span>
                    <span className="font-semibold text-slate-800">MAX ERP Career Site</span>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="flex items-center gap-2 text-slate-500">
                      <span>📝</span> Collect Additional Questions
                    </span>
                    <span className="font-semibold text-slate-800">Yes</span>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="flex items-center gap-2 text-slate-500">
                      <span>📄</span> Require Resume
                    </span>
                    <span className="font-semibold text-slate-800">Yes</span>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="flex items-center gap-2 text-slate-500">
                      <span>✉️</span> Allow Cover Letter
                    </span>
                    <span className="font-semibold text-slate-800">Yes</span>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="flex items-center gap-2 text-slate-500">
                      <span>💰</span> Ask for Expected Salary
                    </span>
                    <span className="font-semibold text-slate-800">Yes</span>
                  </div>
                </div>
              </div>

              {/* Card 6: Visibility & SEO */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center text-xs">
                      🎯
                    </div>
                    <h3 className="text-xs font-bold text-slate-900">Visibility & SEO</h3>
                  </div>
                  <Link
                    href={`/recruitment/requisitions/${requisition?.reqNumber || rawId}/post#section-career-site`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition"
                  >
                    <span>✏</span>
                    <span>Edit</span>
                  </Link>
                </div>

                <div className="space-y-2 text-xs divide-y divide-slate-100">
                  <div className="flex items-center justify-between pt-1">
                    <span className="flex items-center gap-2 text-slate-500">
                      <span>🔍</span> Show in Search Results
                    </span>
                    <span className="font-semibold text-slate-800">
                      {posting?.showInSearch !== false ? "Yes" : "No"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="flex items-center gap-2 text-slate-500">
                      <span>🏠</span> Feature on Homepage
                    </span>
                    <span className="font-semibold text-slate-800">
                      {posting?.showOnHomepage ? "Yes" : "No"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="flex items-center gap-2 text-slate-500">
                      <span>🏷️</span> Search Keywords
                    </span>
                    <span className="font-semibold text-slate-800 truncate max-w-[180px]">
                      Java, Spring Boot, Microservices
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="flex items-center gap-2 text-slate-500">
                      <span>🏢</span> Job Category
                    </span>
                    <span className="font-semibold text-slate-800">{jobCategory}</span>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="flex items-center gap-2 text-slate-500">
                      <span>📍</span> Location
                    </span>
                    <span className="font-semibold text-slate-800">{jobLocation}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ---------------------------------------------------------------------
              RIGHT COLUMN: Career Site Preview & Publication Readiness (4 Cols)
          --------------------------------------------------------------------- */}
          <div className="xl:col-span-4 space-y-6">
            {/* Top Card: Career Site Preview */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <h3 className="text-xs font-bold text-slate-900">Career Site Preview</h3>
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

              {/* View Switcher Pills */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/60 w-fit">
                <button
                  type="button"
                  onClick={() => setPreviewMode("desktop")}
                  className={`px-3 py-1 text-[11px] font-semibold rounded-md transition ${
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
                  className={`px-3 py-1 text-[11px] font-semibold rounded-md transition ${
                    previewMode === "mobile"
                      ? "bg-white text-slate-900 shadow-2xs"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Mobile View
                </button>
              </div>

              {/* Interactive Preview Container */}
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
                        {jobTitle}
                      </h4>
                      <span className="inline-block px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                        {workArrangement}
                      </span>
                    </div>

                    {/* Metadata line */}
                    <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-500 mt-1">
                      <span className="flex items-center gap-1">📍 {jobLocation}</span>
                      <span className="flex items-center gap-1">🏢 {jobCategory}</span>
                      <span className="flex items-center gap-1">🕒 {employmentType}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-1">
                    <Link
                      href={`/careers?apply=${requisition?.reqNumber || rawId}`}
                      className="flex-1 py-1.5 rounded-lg bg-blue-600 text-white font-semibold text-[11px] shadow-xs text-center hover:bg-blue-700 transition"
                    >
                      Apply Now
                    </Link>
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 font-semibold text-[11px] hover:bg-slate-50 transition"
                    >
                      🔖 Save Job
                    </button>
                  </div>

                  {/* Internal tabs matching Image 6 */}
                  <div className="flex items-center gap-2 border-b border-slate-100 pt-2 text-[10px] font-semibold">
                    <button
                      type="button"
                      onClick={() => setPreviewActiveTab("description")}
                      className={`pb-1 border-b-2 transition ${
                        previewActiveTab === "description"
                          ? "border-blue-600 text-blue-600"
                          : "border-transparent text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      Job Description
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewActiveTab("requirements")}
                      className={`pb-1 border-b-2 transition ${
                        previewActiveTab === "requirements"
                          ? "border-blue-600 text-blue-600"
                          : "border-transparent text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      Requirements
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewActiveTab("perks")}
                      className={`pb-1 border-b-2 transition ${
                        previewActiveTab === "perks"
                          ? "border-blue-600 text-blue-600"
                          : "border-transparent text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      Perks & Benefits
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewActiveTab("about")}
                      className={`pb-1 border-b-2 transition ${
                        previewActiveTab === "about"
                          ? "border-blue-600 text-blue-600"
                          : "border-transparent text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      About Us
                    </button>
                  </div>

                  {/* Text snippet */}
                  <div className="pt-1">
                    <p className="text-[10px] leading-relaxed text-slate-600 line-clamp-4 font-sans">
                      {descriptionText}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Card: Ready to Publish / Publication Readiness */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
                    🛡️
                  </div>
                  <h3 className="text-xs font-bold text-slate-900">Ready to Publish</h3>
                </div>

                {/* 2 minor warnings toggle badge */}
                <button
                  type="button"
                  onClick={() => setShowWarningsDetail((p) => !p)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition"
                >
                  <span>⚠️</span>
                  <span>2 minor warnings</span>
                  <span>{showWarningsDetail ? "▴" : "▾"}</span>
                </button>
              </div>

              {/* 6 Verified Readiness Checklist Items */}
              <div className="space-y-2 text-xs">
                {[
                  "Career site configuration is valid",
                  "Job content is complete",
                  `${selectedBoards.length} job boards are ready for posting`,
                  "Posting schedule is set",
                  "Application method is configured",
                  "No blocking validation errors",
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                      ✓
                    </div>
                    <span className="text-slate-700 font-medium">{item}</span>
                  </div>
                ))}
              </div>

              {/* Minor Notes / Warnings Callout Box */}
              {showWarningsDetail && (
                <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/80 space-y-1.5 text-xs">
                  <div className="text-[11px] font-bold text-amber-900">Minor Notes</div>
                  <ul className="space-y-1 text-[11px] text-amber-800 list-disc list-inside">
                    <li>Naukri may require manual review by employer account manager</li>
                    <li>Google Jobs title will be truncated to 60 characters for schema index</li>
                  </ul>
                </div>
              )}
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
              onClick={() => setShowCancelModal(true)}
              className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition"
            >
              Cancel
            </button>

            {/* Right Action Group */}
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

              {/* Publish Now Primary Button */}
              <button
                type="button"
                onClick={() => setShowPublishConfirmModal(true)}
                className="inline-flex items-center gap-2 px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition"
              >
                <span>Publish Now</span>
                <span className="text-sm">🚀</span>
              </button>
            </div>
          </div>
        </div>

        {/* =========================================================================
            MODAL 1: EXPLICIT PUBLISH CONFIRMATION DIALOG
        ========================================================================= */}
        {showPublishConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                    🚀
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Confirm Publication</h3>
                    <p className="text-xs text-slate-500">
                      Publish to MAX ERP Career Site and {selectedBoards.length} job boards.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPublishConfirmModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <p className="text-slate-600 leading-relaxed">
                  You are about to publish <strong className="text-slate-900">{jobTitle}</strong> ({requisition?.reqNumber || rawId}) to the following active channels:
                </p>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between font-semibold text-slate-800">
                    <span className="flex items-center gap-1.5">
                      <span>🌐</span> MAX ERP Career Site
                    </span>
                    <span className="text-emerald-700 text-[11px]">Immediate Live</span>
                  </div>

                  {selectedBoards.map((b) => (
                    <div key={b.id} className="flex items-center justify-between text-slate-700">
                      <span className="flex items-center gap-1.5">
                        <span
                          className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] font-bold text-white"
                          style={{ backgroundColor: b.logoBg }}
                        >
                          {b.logoLetter}
                        </span>
                        {b.name}
                      </span>
                      <span className="text-slate-500 text-[11px]">
                        {b.id === "naukri" ? "Manual Review" : "API Syndicated"}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-[11px] text-blue-900 leading-relaxed">
                  <strong>Posting Schedule:</strong> Active from {formattedStartDate} to {formattedExpiryDate} (30 days duration).
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPublishConfirmModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Back to Review
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPublish}
                  disabled={isPublishing}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition disabled:opacity-50"
                >
                  {isPublishing ? "Publishing..." : "Confirm & Publish Now"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            MODAL 2: PUBLICATION SUCCESS CELEBRATION MODAL
        ========================================================================= */}
        {showPublishSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-3xl mx-auto border border-emerald-100 shadow-2xs">
                🎉
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">Requisition Published Successfully!</h3>
                <p className="text-xs text-slate-500">
                  {jobTitle} is now live and accepting candidate applications.
                </p>
              </div>

              {/* Per-destination result breakdown */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-left space-y-2 text-xs">
                <div className="font-bold text-slate-800 pb-1 border-b border-slate-200">
                  Publication Status per Channel
                </div>

                <div className="flex items-center justify-between text-slate-700">
                  <span className="flex items-center gap-1.5 font-semibold">
                    <span>🌐</span> MAX ERP Career Site
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    ✓ Live Public
                  </span>
                </div>

                {selectedBoards.map((b) => (
                  <div key={b.id} className="flex items-center justify-between text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <span
                        className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] font-bold text-white"
                        style={{ backgroundColor: b.logoBg }}
                      >
                        {b.logoLetter}
                      </span>
                      {b.name}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        b.id === "naukri"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      }`}
                    >
                      {b.id === "naukri" ? "⏳ Review Queued" : "✓ Syndicated"}
                    </span>
                  </div>
                ))}
              </div>

              {/* Copy live link */}
              <div className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-white text-xs">
                <span className="font-mono text-slate-700 truncate flex-1 text-left">
                  https://careers.maxerp.com/jobs/{urlSlug}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(`https://careers.maxerp.com/jobs/${urlSlug}`);
                    triggerToast("Link copied!");
                  }}
                  className="px-3 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold transition"
                >
                  Copy Link
                </button>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-center gap-3 pt-2">
                <Link
                  href={`/recruitment/requisitions/${requisition?.reqNumber || rawId}`}
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition"
                >
                  Return to Requisition
                </Link>
                <Link
                  href="/recruitment/requisitions"
                  className="px-5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
                >
                  View All Requisitions
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            MODAL 3: CANCEL CONFIRMATION DIALOG
        ========================================================================= */}
        {showCancelModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Exit Review &amp; Publish?</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Any unsaved review adjustments will be discarded. Your saved draft remains safe.
              </p>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Keep Reviewing
                </button>
                <button
                  type="button"
                  onClick={() => router.push(`/recruitment/requisitions/${requisition?.reqNumber || rawId}`)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
                >
                  Exit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RecruitingShell>
  );
}
