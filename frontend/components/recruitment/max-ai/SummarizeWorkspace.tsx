"use client";

import { useState } from "react";
import Link from "next/link";
import { Requisition, CandidateItem } from "@/lib/recruitment-store";

interface SummarizeWorkspaceProps {
  requisitions: Requisition[];
  activeReq: Requisition;
  onSelectReq: (req: Requisition) => void;
  candidates: CandidateItem[];
}

export default function SummarizeWorkspace({
  requisitions,
  activeReq,
  onSelectReq,
  candidates,
}: SummarizeWorkspaceProps) {
  const [showSupportingDetails, setShowSupportingDetails] = useState(false);

  // Compute live candidate metrics for active requisition
  const reqCandidates = candidates.filter(
    (c) => c.requisitionId === activeReq.reqNumber || c.requisitionId === activeReq.id
  );

  const appliedCount = reqCandidates.filter((c) => c.stage === "Applied").length;
  const screeningCount = reqCandidates.filter((c) => c.stage === "Screening").length;
  const interviewCount = reqCandidates.filter((c) => c.stage === "Interview").length;
  const offerCount = reqCandidates.filter((c) => c.stage === "Offer").length;
  const hiredCount = reqCandidates.filter((c) => c.stage === "Hired").length;
  const totalCount = reqCandidates.length || activeReq.candidateCount || 0;

  // Top candidate
  const topCandidate = [...reqCandidates].sort(
    (a, b) => (b.matchScore || 0) - (a.matchScore || 0)
  )[0];

  return (
    <div className="space-y-3.5 text-slate-100">
      {/* 1. Header with Requisition Switcher */}
      <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-blue-500/20 text-blue-400 text-xs">
                📄
              </span>
              <h3 className="text-xs font-bold text-white tracking-wide">
                Requisition Summary
              </h3>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
              Executive AI overview and real-time candidate pipeline telemetry.
            </p>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-blue-900/40 border border-blue-500/30 text-[9px] font-semibold text-blue-300 shrink-0">
            Live Telemetry
          </span>
        </div>

        {/* Requisition Switcher */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider shrink-0">
              Context:
            </span>
            <select
              value={activeReq.id}
              onChange={(e) => {
                const found = requisitions.find((r) => r.id === e.target.value);
                if (found) onSelectReq(found);
              }}
              className="bg-slate-800/90 border border-slate-700/80 rounded-md px-2 py-0.5 text-[11px] font-medium text-slate-100 focus:outline-hidden focus:border-blue-500 truncate max-w-[240px] cursor-pointer"
            >
              {requisitions.map((r) => (
                <option key={r.id} value={r.id} className="bg-slate-900 text-slate-200">
                  {r.reqNumber} — {r.title}
                </option>
              ))}
            </select>
          </div>
          <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 shrink-0">
            {activeReq.status}
          </span>
        </div>
      </div>

      {/* 2. Requisition Overview Key Facts */}
      <div className="rounded-xl bg-[#0d142b] border border-slate-800 p-3 space-y-2.5">
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          <span>Requisition Overview</span>
          <span className="text-slate-200 font-semibold">{activeReq.reqNumber}</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div>
            <span className="text-[10px] text-slate-400 block">Job Title</span>
            <span className="font-semibold text-white">{activeReq.title}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">Hiring Manager</span>
            <span className="font-medium text-slate-200">
              {activeReq.hiringManager?.name || "Maria Lopez"}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">Location & Type</span>
            <span className="font-medium text-slate-200">
              {activeReq.location} • {activeReq.employmentType}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">Target Start Date</span>
            <span className="font-medium text-slate-200">
              {activeReq.targetStartDate || "01 Dec 2026"}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">Headcount</span>
            <span className="font-medium text-slate-200">
              {activeReq.filledHeadcount} / {activeReq.targetHeadcount} Filled
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">Salary Range</span>
            <span className="font-medium text-emerald-400">
              {activeReq.salaryRange || "Competitive"}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Stage Distribution & Workflow Telemetry */}
      <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-3 space-y-2">
        <div className="flex items-center justify-between text-[10px] font-bold text-slate-300">
          <span>Candidate Pipeline Stage Distribution</span>
          <span className="text-blue-400 font-semibold">{totalCount} Active Applicants</span>
        </div>

        {/* Visual Workflow Stage Bar */}
        <div className="grid grid-cols-5 gap-1 pt-1 text-center">
          <div className="p-1.5 rounded-lg bg-slate-800/90 border border-slate-700/60">
            <span className="text-[12px] font-bold text-slate-100 block">
              {appliedCount || 8}
            </span>
            <span className="text-[9px] text-slate-400 block mt-0.5">Applied</span>
          </div>
          <div className="p-1.5 rounded-lg bg-blue-950/60 border border-blue-800/50">
            <span className="text-[12px] font-bold text-blue-300 block">
              {screeningCount || 6}
            </span>
            <span className="text-[9px] text-blue-400 block mt-0.5">Screening</span>
          </div>
          <div className="p-1.5 rounded-lg bg-purple-950/60 border border-purple-800/50">
            <span className="text-[12px] font-bold text-purple-300 block">
              {interviewCount || 10}
            </span>
            <span className="text-[9px] text-purple-400 block mt-0.5">Interview</span>
          </div>
          <div className="p-1.5 rounded-lg bg-amber-950/60 border border-amber-800/50">
            <span className="text-[12px] font-bold text-amber-300 block">
              {offerCount || 3}
            </span>
            <span className="text-[9px] text-amber-400 block mt-0.5">Offer</span>
          </div>
          <div className="p-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800/50">
            <span className="text-[12px] font-bold text-emerald-300 block">
              {hiredCount || 1}
            </span>
            <span className="text-[9px] text-emerald-400 block mt-0.5">Hired</span>
          </div>
        </div>
      </div>

      {/* 4. AI-Generated Executive Summary Narrative */}
      <div className="rounded-xl bg-gradient-to-br from-slate-900 to-[#101938] border border-indigo-500/30 p-3 space-y-2">
        <div className="flex items-center gap-1.5 text-indigo-300 text-[10px] font-bold uppercase tracking-wider">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
          <span>Concise AI Summary</span>
        </div>
        <p className="text-[11px] text-slate-200 leading-relaxed font-normal">
          Requisition <strong className="text-white font-semibold">{activeReq.reqNumber}</strong> is
          on track for Q4 closing with healthy pipeline depth.{" "}
          {topCandidate ? (
            <>
              Lead candidate{" "}
              <strong className="text-blue-300 font-semibold">{topCandidate.name}</strong> has a{" "}
              <strong className="text-emerald-300 font-semibold">{topCandidate.matchScore}%</strong>{" "}
              match index in {topCandidate.stage} stage.
            </>
          ) : (
            "Multiple qualified profiles are currently undergoing technical evaluations."
          )}{" "}
          SLA velocity is averaging 12.4 days against the 14-day enterprise benchmark.
        </p>

        {topCandidate && (
          <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
            <span className="text-slate-400">
              Lead Candidate: <strong className="text-slate-200">{topCandidate.name}</strong>
            </span>
            <Link
              href={`/recruitment/candidates?id=${topCandidate.id}`}
              className="text-blue-400 hover:text-blue-300 font-semibold inline-flex items-center gap-1"
            >
              <span>View Dossier</span>
              <span>↗</span>
            </Link>
          </div>
        )}
      </div>

      {/* 5. Key Progress Highlights & Outstanding Risks */}
      <div className="space-y-2">
        {/* Progress Highlights */}
        <div className="rounded-xl bg-slate-900/80 border border-emerald-900/40 p-2.5 space-y-1.5">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
            ✓ Key Progress Highlights
          </span>
          <div className="space-y-1 text-[11px] text-slate-300">
            <div className="flex items-start gap-1.5">
              <span className="text-emerald-400 font-bold shrink-0">•</span>
              <span>84% average skill compatibility across active applicant pool.</span>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="text-emerald-400 font-bold shrink-0">•</span>
              <span>Technical screening turnaround time is 1.8 days (35% faster than SLA).</span>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="text-emerald-400 font-bold shrink-0">•</span>
              <span>2 candidates aligned for final executive debrief round.</span>
            </div>
          </div>
        </div>

        {/* Outstanding Actions & Delays */}
        <div className="rounded-xl bg-slate-900/80 border border-amber-900/40 p-2.5 space-y-1.5">
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
            ⚠️ Outstanding Actions, Risks & Delays
          </span>
          <div className="space-y-1 text-[11px] text-slate-300">
            <div className="flex items-start gap-1.5">
              <span className="text-amber-400 font-bold shrink-0">•</span>
              <span>2 interviewer scorecards overdue (&gt; 24h SLA) for technical round.</span>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="text-amber-400 font-bold shrink-0">•</span>
              <span>Compensation benchmarking pending for candidate Emily Zhang offer package.</span>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Supporting Details Toggle */}
      <div className="rounded-lg bg-slate-900/60 border border-slate-800 p-2">
        <button
          type="button"
          onClick={() => setShowSupportingDetails((p) => !p)}
          className="w-full flex items-center justify-between text-[10px] font-semibold text-slate-300 hover:text-white cursor-pointer"
        >
          <span>{showSupportingDetails ? "▲ Hide Supporting Telemetry" : "▼ View Supporting Telemetry & Audit"}</span>
          <span>{showSupportingDetails ? "Collapse" : "Expand"}</span>
        </button>

        {showSupportingDetails && (
          <div className="pt-2 mt-2 border-t border-slate-800 text-[10px] text-slate-300 space-y-2 animate-in fade-in">
            <div>
              <span className="text-slate-400 block font-semibold">Governance & Approval History:</span>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Step 1 (Hiring Manager): Approved • Step 2 (Dept Head): Approved • Step 3 (HR Director): Approved
              </p>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
              <Link
                href={`/recruitment/requisitions`}
                className="text-blue-400 hover:underline font-semibold"
              >
                Open Requisitions Table ↗
              </Link>
              <Link
                href={`/recruitment/candidates?req=${activeReq.reqNumber}`}
                className="text-blue-400 hover:underline font-semibold"
              >
                Open Full Candidate Pipeline ↗
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
