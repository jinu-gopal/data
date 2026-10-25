"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Requisition, recruitmentStore, CandidateItem } from "@/lib/recruitment-store";

interface RequisitionDetailDrawerProps {
  requisition: Requisition | null;
  onClose: () => void;
  onUpdateStatus?: (id: string, newStatus: Requisition["status"]) => void;
}

export default function RequisitionDetailDrawer({
  requisition,
  onClose,
  onUpdateStatus,
}: RequisitionDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "candidates" | "governance">("overview");
  const [candidatesList, setCandidatesList] = useState<CandidateItem[]>([]);

  // Hydrate candidates for this requisition
  useMemo(() => {
    if (!requisition) {
      setCandidatesList([]);
      return;
    }
    const filtered = recruitmentStore.getCandidates(requisition.id);
    if (filtered.length > 0) {
      setCandidatesList(filtered);
    } else {
      // Fallback to top candidates relevant to this role
      setCandidatesList(recruitmentStore.getCandidates().slice(0, 4));
    }
  }, [requisition]);

  if (!requisition) return null;

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
  };

  // Pipeline stage counts
  const stageCounts = {
    Applied: candidatesList.filter((c) => c.stage === "Applied").length,
    Screening: candidatesList.filter((c) => c.stage === "Screening").length,
    Interview: candidatesList.filter((c) => c.stage === "Interview").length,
    Offer: candidatesList.filter((c) => c.stage === "Offer").length,
    Hired: candidatesList.filter((c) => c.stage === "Hired").length,
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-2xs transition-opacity animate-in fade-in">
      <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-start justify-between bg-slate-50/70 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {requisition.reqNumber}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  requisition.status === "Open"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : requisition.status === "Pending Approval"
                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                    : requisition.status === "Filled"
                    ? "bg-purple-50 text-purple-700 border border-purple-200"
                    : requisition.status === "On Hold"
                    ? "bg-sky-50 text-sky-700 border border-sky-200"
                    : "bg-slate-100 text-slate-700 border border-slate-200"
                }`}
              >
                {requisition.status}
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-1">{requisition.title}</h2>
            <p className="text-xs text-slate-500">
              {requisition.department} &bull; {requisition.location} &bull; Created {requisition.createdOn}
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition text-lg leading-none"
          >
            &times;
          </button>
        </div>

        {/* Segmented Sub-tabs */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-slate-200 bg-white text-xs font-semibold shrink-0">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-2.5 px-2 border-b-2 transition ${
              activeTab === "overview"
                ? "border-blue-600 text-blue-600 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Job Specs & Info
          </button>
          <button
            onClick={() => setActiveTab("candidates")}
            className={`pb-2.5 px-2 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === "candidates"
                ? "border-blue-600 text-blue-600 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>Candidates & Pipeline</span>
            <span className="px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
              {candidatesList.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("governance")}
            className={`pb-2.5 px-2 border-b-2 transition ${
              activeTab === "governance"
                ? "border-blue-600 text-blue-600 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Approvals & Governance
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {/* ===================================================================
              TAB 1: OVERVIEW & JOB SPECS
          =================================================================== */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Key Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Headcount</span>
                  <span className="text-sm font-bold text-slate-900 mt-0.5 block">
                    {requisition.filledHeadcount} / {requisition.targetHeadcount}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Job Level</span>
                  <span className="text-sm font-bold text-slate-900 mt-0.5 block">{requisition.jobLevel}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Employment</span>
                  <span className="text-sm font-bold text-slate-900 mt-0.5 block">{requisition.employmentType}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Compensation</span>
                  <span className="text-xs font-bold text-slate-900 mt-0.5 block truncate">{requisition.salaryRange}</span>
                </div>
              </div>

              {/* Hiring Manager Card */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Hiring Lead</span>
                <div className="flex items-center gap-3">
                  <img
                    src={requisition.hiringManager.avatar}
                    alt={requisition.hiringManager.name}
                    className="h-10 w-10 rounded-full object-cover ring-2 ring-slate-100"
                  />
                  <div>
                    <span className="text-sm font-bold text-slate-900 block">{requisition.hiringManager.name}</span>
                    <span className="text-[11px] text-slate-500 block">{requisition.hiringManager.title}</span>
                    <span className="text-[10px] text-blue-600 font-mono block">{requisition.hiringManager.email}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              {requisition.description && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Job Overview</span>
                  <p className="text-slate-700 leading-relaxed bg-slate-50/60 p-3.5 rounded-xl border border-slate-200/70">
                    {requisition.description}
                  </p>
                </div>
              )}

              {/* Required Skills */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Required Competencies</span>
                <div className="flex flex-wrap gap-1.5">
                  {requisition.requiredSkills.map((s) => (
                    <span key={s} className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200/60 font-semibold text-[11px]">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href={`/recruitment/requisitions/${requisition.reqNumber || requisition.id}`}
                  className="w-full py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs flex items-center justify-center gap-2 border border-blue-200 transition"
                >
                  <span>Open Full Requisition Workspace &rarr;</span>
                </Link>
              </div>
            </div>
          )}

          {/* ===================================================================
              TAB 2: CANDIDATES & TALENT PIPELINE (User Requirement)
          =================================================================== */}
          {activeTab === "candidates" && (
            <div className="space-y-5">
              {/* Pipeline Stage Funnel Summary Bar */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Talent Pipeline Progress
                </span>
                <div className="grid grid-cols-5 gap-1.5 text-center font-mono">
                  <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-2xs">
                    <span className="text-[9px] text-slate-400 uppercase block font-semibold">Applied</span>
                    <span className="text-sm font-bold text-slate-800">{stageCounts.Applied}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-2xs">
                    <span className="text-[9px] text-slate-400 uppercase block font-semibold">Screen</span>
                    <span className="text-sm font-bold text-slate-800">{stageCounts.Screening}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-blue-50 border border-blue-200 shadow-2xs">
                    <span className="text-[9px] text-blue-600 uppercase block font-bold">Interview</span>
                    <span className="text-sm font-bold text-blue-800">{stageCounts.Interview}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 shadow-2xs">
                    <span className="text-[9px] text-amber-600 uppercase block font-bold">Offer</span>
                    <span className="text-sm font-bold text-amber-800">{stageCounts.Offer}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 shadow-2xs">
                    <span className="text-[9px] text-emerald-600 uppercase block font-bold">Hired</span>
                    <span className="text-sm font-bold text-emerald-800">{stageCounts.Hired}</span>
                  </div>
                </div>
              </div>

              {/* Candidates List with Stage and Action */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">
                    Active Candidates in Pipeline ({candidatesList.length})
                  </span>
                  <Link
                    href={`/recruitment/candidates?reqId=${requisition.id}`}
                    className="text-xs font-semibold text-blue-600 hover:underline"
                  >
                    View All in Talent Pool &rarr;
                  </Link>
                </div>

                {candidatesList.map((cand) => (
                  <div
                    key={cand.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs hover:border-blue-200 transition space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                          {cand.name.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <div>
                          <span className="text-sm font-bold text-slate-900 block">{cand.name}</span>
                          <span className="text-[11px] text-slate-500 block">{cand.email}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 inline-block">
                          {cand.matchScore}% AI Match
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">{cand.appliedDate}</span>
                      </div>
                    </div>

                    {/* Stage & Progress Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 font-semibold uppercase">Current Stage:</span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
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
                      </div>

                      <div className="flex items-center gap-1.5">
                        {cand.stage !== "Hired" && (
                          <button
                            type="button"
                            onClick={() => handleAdvanceCandidate(cand.id, cand.stage)}
                            className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-semibold text-[11px] hover:bg-blue-700 transition shadow-2xs"
                          >
                            Advance &rarr;
                          </button>
                        )}
                        <Link
                          href={`/recruitment/candidates?candidateId=${cand.id}`}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-semibold text-[11px] hover:bg-slate-100 transition"
                        >
                          Profile
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===================================================================
              TAB 3: GOVERNANCE & APPROVAL WORKFLOW
          =================================================================== */}
          {activeTab === "governance" && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900">Governance Approval Stepper</span>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                    Step {requisition.approvalStep || 1} of {requisition.totalApprovalSteps || 3}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-amber-800">
                  <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                  <span>Pending Financial Controller & HR Director Sign-off</span>
                </div>
                {onUpdateStatus && (
                  <div className="pt-2 flex items-center gap-2">
                    <button
                      onClick={() => onUpdateStatus(requisition.id, "Open")}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 transition shadow-2xs"
                    >
                      ✓ Authorize & Set to Open
                    </button>
                    <button
                      onClick={() => onUpdateStatus(requisition.id, "On Hold")}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-semibold text-xs hover:bg-slate-50 transition"
                    >
                      Hold
                    </button>
                  </div>
                )}
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2 text-xs">
                <span className="font-bold text-slate-900 block">Approval Audit Trail:</span>
                <div className="space-y-1.5 text-slate-600">
                  <div className="flex items-center justify-between">
                    <span>1. Department VP Sign-off:</span>
                    <span className="text-emerald-700 font-bold">Approved (12 Oct 2026)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>2. Headcount & Compensation Budget:</span>
                    <span className="text-amber-700 font-bold">In Review (Controller)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>3. Executive HR Authorization:</span>
                    <span className="text-slate-400">Pending Step 2</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between shrink-0">
          <Link
            href={`/recruitment/requisitions/${requisition.reqNumber || requisition.id}`}
            className="text-xs font-semibold text-blue-600 hover:underline"
          >
            Full Requisition Details &rarr;
          </Link>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold hover:bg-slate-50 transition text-xs shadow-2xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
