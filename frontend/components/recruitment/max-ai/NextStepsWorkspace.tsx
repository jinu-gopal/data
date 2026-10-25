"use client";

import Link from "next/link";
import { Requisition, CandidateItem } from "@/lib/recruitment-store";

interface PendingAction {
  type: "EMAIL" | "STAGE_CHANGE" | "INTERVIEW" | "OFFER" | "BGV";
  title: string;
  description: string;
  execute: () => void;
}

interface NextStepsWorkspaceProps {
  requisitions: Requisition[];
  activeReq: Requisition;
  onSelectReq: (req: Requisition) => void;
  candidates: CandidateItem[];
  onRequestConfirmation: (action: PendingAction) => void;
  onAdvanceCandidate: (candidate: CandidateItem, targetStage: CandidateItem["stage"]) => void;
  onTriggerToast: (msg: string) => void;
}

export default function NextStepsWorkspace({
  requisitions,
  activeReq,
  onSelectReq,
  candidates,
  onRequestConfirmation,
  onAdvanceCandidate,
  onTriggerToast,
}: NextStepsWorkspaceProps) {
  // Find key candidate context for this requisition
  const priya =
    candidates.find((c) => c.name.toLowerCase().includes("priya")) || candidates[0];

  return (
    <div className="space-y-3.5 text-slate-100">
      {/* 1. Header with Requisition Switcher */}
      <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-purple-500/20 text-purple-400 text-xs">
                ⚡
              </span>
              <h3 className="text-xs font-bold text-white tracking-wide">Next Steps</h3>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
              Actionable recommendations prioritized by active recruiting workflow and SLAs.
            </p>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-purple-900/40 border border-purple-500/30 text-[9px] font-semibold text-purple-300 shrink-0">
            Workflow Engine
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
              className="bg-slate-800/90 border border-slate-700/80 rounded-md px-2 py-0.5 text-[11px] font-medium text-slate-100 focus:outline-hidden focus:border-purple-500 truncate max-w-[240px] cursor-pointer"
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

      {/* 2. Prioritized Recommendation Cards */}
      <div className="space-y-2.5">
        {/* Recommendation 1: Advance Priya Menon to Executive Debrief */}
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/40 transition space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="px-1.5 py-0.2 rounded text-[8px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase">
                  High Priority
                </span>
                <h4 className="text-xs font-bold text-white">
                  Advance Priya Menon to Executive Debrief
                </h4>
              </div>
              <p className="text-[10px] text-slate-300 leading-snug">
                Priya scored 92% in System Architecture; panel feedback recommends immediate final debrief.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1.5 border-t border-slate-800/80 text-[10px]">
            <span className="text-slate-400">
              Candidate: <strong className="text-slate-200">{priya?.name || "Priya Menon"}</strong> (92% Fit)
            </span>
            <button
              type="button"
              onClick={() => {
                if (!priya) return;
                onRequestConfirmation({
                  type: "STAGE_CHANGE",
                  title: `Advance ${priya.name} to Executive Debrief`,
                  description: `Are you sure you want to transition ${priya.name} to the Executive Debrief stage for ${activeReq.title}? This will notify the interview panel.`,
                  execute: () => {
                    onAdvanceCandidate(priya, "Interview");
                    onTriggerToast(`🚀 ${priya.name} advanced to Executive Debrief.`);
                  },
                });
              }}
              className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-[10px] font-bold transition shadow-xs cursor-pointer"
            >
              Advance to Debrief
            </button>
          </div>
        </div>

        {/* Recommendation 2: Collect Missing Interview Scorecards */}
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/40 transition space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="px-1.5 py-0.2 rounded text-[8px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase">
                  High Priority
                </span>
                <h4 className="text-xs font-bold text-white">
                  Collect Missing Interview Scorecards
                </h4>
              </div>
              <p className="text-[10px] text-slate-300 leading-snug">
                Technical Interview 2 scorecard from Marcus Chen is overdue by 18 hours (&gt; 24h SLA).
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1.5 border-t border-slate-800/80 text-[10px]">
            <span className="text-slate-400">
              Interviewer: <strong className="text-slate-200">Marcus Chen (CTO)</strong>
            </span>
            <button
              type="button"
              onClick={() => {
                onTriggerToast("🔔 Scorecard reminder dispatched to Marcus Chen via Slack & Email.");
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-300 hover:text-white border border-purple-500/30 text-[10px] font-semibold transition cursor-pointer"
            >
              Send Reminder
            </button>
          </div>
        </div>

        {/* Recommendation 3: Prepare & Review Offer for Emily Zhang */}
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/40 transition space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="px-1.5 py-0.2 rounded text-[8px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                  Medium Priority
                </span>
                <h4 className="text-xs font-bold text-white">
                  Complete Level 2 VP Approval for Emily Zhang Offer
                </h4>
              </div>
              <p className="text-[10px] text-slate-300 leading-snug">
                $160,000 Total Compensation package awaiting final executive authorization.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1.5 border-t border-slate-800/80 text-[10px]">
            <span className="text-slate-400">
              Offer: <strong className="text-slate-200">Emily Zhang</strong> ($160k Base)
            </span>
            <button
              type="button"
              onClick={() => {
                onRequestConfirmation({
                  type: "OFFER",
                  title: "Approve Offer: Emily Zhang ($160,000)",
                  description:
                    "Are you sure you want to sign off as Level 2 Executive Approver on the compensation package for Emily Zhang?",
                  execute: () => {
                    onTriggerToast("✍️ Level 2 Executive Offer Approval recorded.");
                  },
                });
              }}
              className="px-2.5 py-1 rounded-lg bg-amber-600/30 hover:bg-amber-600 text-amber-300 hover:text-white border border-amber-500/40 text-[10px] font-bold transition cursor-pointer"
            >
              Authorize Sign-Off
            </button>
          </div>
        </div>

        {/* Recommendation 4: Review 8 Inbound Applications */}
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/40 transition space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="px-1.5 py-0.2 rounded text-[8px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                  Medium Priority
                </span>
                <h4 className="text-xs font-bold text-white">
                  Review 8 Inbound Applications in Screening Queue
                </h4>
              </div>
              <p className="text-[10px] text-slate-300 leading-snug">
                Fresh resumes received via Careers Portal and LinkedIn require initial recruiter triage.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1.5 border-t border-slate-800/80 text-[10px]">
            <span className="text-slate-400">Queue: 8 New Inbound Resumes</span>
            <Link
              href="/recruitment/candidates?stage=Applied"
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-semibold transition"
            >
              Open Screening Queue ↗
            </Link>
          </div>
        </div>

        {/* Recommendation 5: Initiate Background Verification */}
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/40 transition space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="px-1.5 py-0.2 rounded text-[8px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase">
                  Standard Flow
                </span>
                <h4 className="text-xs font-bold text-white">
                  Initiate Background Verification (BGV)
                </h4>
              </div>
              <p className="text-[10px] text-slate-300 leading-snug">
                Candidate Lucas Vance accepted offer letter; launch First Advantage identity and credential check.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1.5 border-t border-slate-800/80 text-[10px]">
            <span className="text-slate-400">
              Provider: <strong className="text-slate-200">First Advantage / Checkr</strong>
            </span>
            <button
              type="button"
              onClick={() => {
                onRequestConfirmation({
                  type: "BGV",
                  title: "Initiate BGV: Lucas Vance",
                  description:
                    "Dispatch BGV authorization consent packet to Lucas Vance via First Advantage enterprise integration?",
                  execute: () => {
                    onTriggerToast("🛡️ BGV background check initiated with First Advantage.");
                  },
                });
              }}
              className="px-2.5 py-1 rounded-lg bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/40 text-[10px] font-semibold transition cursor-pointer"
            >
              Initiate BGV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
