"use client";

import { useState } from "react";
import Link from "next/link";
import { Requisition, CandidateItem } from "@/lib/recruitment-store";

interface PendingAction {
  type: "EMAIL" | "STAGE_CHANGE" | "INTERVIEW" | "OFFER" | "BGV";
  title: string;
  description: string;
  execute: () => void;
}

interface CompareCandidatesWorkspaceProps {
  requisitions: Requisition[];
  activeReq: Requisition;
  onSelectReq: (req: Requisition) => void;
  candidates: CandidateItem[];
  onRequestConfirmation: (action: PendingAction) => void;
  onAdvanceCandidate: (candidate: CandidateItem, targetStage: CandidateItem["stage"]) => void;
  onTriggerToast: (msg: string) => void;
  initialCand1Id?: string;
  initialCand2Id?: string;
}

export default function CompareCandidatesWorkspace({
  requisitions,
  activeReq,
  onSelectReq,
  candidates,
  onRequestConfirmation,
  onAdvanceCandidate,
  onTriggerToast,
  initialCand1Id,
  initialCand2Id,
}: CompareCandidatesWorkspaceProps) {
  // Filter candidates relevant to this req
  const reqCandidates = candidates.filter(
    (c) => c.requisitionId === activeReq.reqNumber || c.requisitionId === activeReq.id
  );
  const candidatePool = reqCandidates.length >= 2 ? reqCandidates : candidates;

  const [cand1Id, setCand1Id] = useState<string>(
    initialCand1Id || candidatePool[0]?.id || "cand-app-01"
  );
  const [cand2Id, setCand2Id] = useState<string>(
    initialCand2Id || candidatePool[1]?.id || candidatePool[0]?.id || "cand-app-04"
  );

  const cand1 = candidatePool.find((c) => c.id === cand1Id) || candidatePool[0];
  const cand2 = candidatePool.find((c) => c.id === cand2Id) || candidatePool[1] || candidatePool[0];

  return (
    <div className="space-y-3.5 text-slate-100">
      {/* 1. Header with Requisition Switcher */}
      <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-cyan-500/20 text-cyan-400 text-xs">
                ⚖️
              </span>
              <h3 className="text-xs font-bold text-white tracking-wide">Compare Candidates</h3>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
              Side-by-side comparative analysis against requisition benchmarks and interview rubrics.
            </p>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-cyan-900/40 border border-cyan-500/30 text-[9px] font-semibold text-cyan-300 shrink-0">
            Side-by-Side
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
              className="bg-slate-800/90 border border-slate-700/80 rounded-md px-2 py-0.5 text-[11px] font-medium text-slate-100 focus:outline-hidden focus:border-cyan-500 truncate max-w-[240px] cursor-pointer"
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

      {/* 2. Candidate Selection Dropdowns */}
      <div className="grid grid-cols-2 gap-2 text-[10px]">
        <div className="space-y-1">
          <label className="block text-cyan-300 font-semibold">Candidate A</label>
          <select
            value={cand1Id}
            onChange={(e) => setCand1Id(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2 py-1 text-[11px] text-white focus:outline-hidden focus:border-cyan-500 truncate cursor-pointer"
          >
            {candidatePool.map((c) => (
              <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                {c.name} ({c.matchScore}%)
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="block text-indigo-300 font-semibold">Candidate B</label>
          <select
            value={cand2Id}
            onChange={(e) => setCand2Id(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2 py-1 text-[11px] text-white focus:outline-hidden focus:border-indigo-500 truncate cursor-pointer"
          >
            {candidatePool.map((c) => (
              <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                {c.name} ({c.matchScore}%)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. Candidate Profile Badges */}
      <div className="grid grid-cols-2 gap-2">
        {/* Candidate 1 Pill */}
        <div className="p-2.5 rounded-xl bg-slate-900/90 border border-cyan-500/30 space-y-1">
          <div className="flex items-center gap-2">
            {cand1.avatar ? (
              <img
                src={cand1.avatar}
                alt={cand1.name}
                className="h-7 w-7 rounded-full object-cover ring-1 ring-cyan-500 shrink-0"
              />
            ) : (
              <div className="h-7 w-7 rounded-full bg-cyan-900 text-cyan-200 text-[10px] font-bold flex items-center justify-center shrink-0">
                {cand1.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-white block truncate">
                {cand1.name}
              </span>
              <span className="text-[9px] text-slate-400 block truncate">
                {cand1.stage} • {cand1.location || "Bangalore"}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[9px]">
            <span className="text-slate-400">Match Fit:</span>
            <span className="font-bold text-emerald-300 bg-emerald-500/10 px-1 py-0.2 rounded border border-emerald-500/20">
              {cand1.matchScore}%
            </span>
          </div>
        </div>

        {/* Candidate 2 Pill */}
        <div className="p-2.5 rounded-xl bg-slate-900/90 border border-indigo-500/30 space-y-1">
          <div className="flex items-center gap-2">
            {cand2.avatar ? (
              <img
                src={cand2.avatar}
                alt={cand2.name}
                className="h-7 w-7 rounded-full object-cover ring-1 ring-indigo-500 shrink-0"
              />
            ) : (
              <div className="h-7 w-7 rounded-full bg-indigo-900 text-indigo-200 text-[10px] font-bold flex items-center justify-center shrink-0">
                {cand2.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-white block truncate">
                {cand2.name}
              </span>
              <span className="text-[9px] text-slate-400 block truncate">
                {cand2.stage} • {cand2.location || "Bangalore"}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[9px]">
            <span className="text-slate-400">Match Fit:</span>
            <span className="font-bold text-emerald-300 bg-emerald-500/10 px-1 py-0.2 rounded border border-emerald-500/20">
              {cand2.matchScore}%
            </span>
          </div>
        </div>
      </div>

      {/* 4. Side-by-Side Comparison Matrix */}
      <div className="rounded-xl bg-[#0d142b] border border-slate-800 divide-y divide-slate-800/80 text-[10px]">
        {/* Row 1: Experience & Domain */}
        <div className="p-2.5 grid grid-cols-2 gap-2">
          <div className="space-y-0.5">
            <span className="text-[9px] uppercase font-bold text-slate-400 block">Experience</span>
            <span className="font-semibold text-slate-100">
              {cand1.relevantExperience?.[0]?.metric || "4.5 years"}
            </span>
            <span className="text-[9px] text-slate-400 block">
              {cand1.relevantExperience?.[1]?.label || "Enterprise microservices"}
            </span>
          </div>
          <div className="space-y-0.5 border-l border-slate-800/80 pl-2">
            <span className="text-[9px] uppercase font-bold text-slate-400 block">Experience</span>
            <span className="font-semibold text-slate-100">
              {cand2.relevantExperience?.[0]?.metric || "3.2 years"}
            </span>
            <span className="text-[9px] text-slate-400 block">
              {cand2.relevantExperience?.[1]?.label || "Product engineering"}
            </span>
          </div>
        </div>

        {/* Row 2: Required Skills */}
        <div className="p-2.5 grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <span className="text-[9px] uppercase font-bold text-slate-400 block">
              Core Skills Alignment
            </span>
            <div className="space-y-1">
              {(cand1.skillsBreakdown || [
                { name: "Java", percentage: 95 },
                { name: "Spring Boot", percentage: 90 },
                { name: "Microservices", percentage: 92 },
              ])
                .slice(0, 3)
                .map((s, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[9px]">
                    <span className="text-slate-300">{s.name}</span>
                    <span className="font-semibold text-cyan-300">{s.percentage || 90}%</span>
                  </div>
                ))}
            </div>
          </div>
          <div className="space-y-1 border-l border-slate-800/80 pl-2">
            <span className="text-[9px] uppercase font-bold text-slate-400 block">
              Core Skills Alignment
            </span>
            <div className="space-y-1">
              {(cand2.skillsBreakdown || [
                { name: "Java", percentage: 80 },
                { name: "Spring Boot", percentage: 70 },
                { name: "Microservices", percentage: 65 },
              ])
                .slice(0, 3)
                .map((s, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[9px]">
                    <span className="text-slate-300">{s.name}</span>
                    <span className="font-semibold text-indigo-300">{s.percentage || 75}%</span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Row 3: Assessment Percentile */}
        <div className="p-2.5 grid grid-cols-2 gap-2">
          <div className="space-y-0.5">
            <span className="text-[9px] uppercase font-bold text-slate-400 block">
              Coding Benchmark
            </span>
            <span className="font-semibold text-emerald-400">96th percentile</span>
            <span className="text-[9px] text-slate-400 block">Hackerrank Java Suite</span>
          </div>
          <div className="space-y-0.5 border-l border-slate-800/80 pl-2">
            <span className="text-[9px] uppercase font-bold text-slate-400 block">
              Coding Benchmark
            </span>
            <span className="font-semibold text-blue-400">88th percentile</span>
            <span className="text-[9px] text-slate-400 block">Hackerrank Java Suite</span>
          </div>
        </div>

        {/* Row 4: Interview Ratings & Feedback */}
        <div className="p-2.5 grid grid-cols-2 gap-2">
          <div className="space-y-0.5">
            <span className="text-[9px] uppercase font-bold text-slate-400 block">
              Interview Scorecard
            </span>
            <span className="font-semibold text-cyan-300">4.8 / 5.0 Rating</span>
            <p className="text-[9px] text-slate-300 leading-tight">
              &ldquo;Exceptional mastery of event streaming & distributed memory models.&rdquo;
            </p>
          </div>
          <div className="space-y-0.5 border-l border-slate-800/80 pl-2">
            <span className="text-[9px] uppercase font-bold text-slate-400 block">
              Interview Scorecard
            </span>
            <span className="font-semibold text-indigo-300">4.2 / 5.0 Rating</span>
            <p className="text-[9px] text-slate-300 leading-tight">
              &ldquo;Solid core foundations; fast feature turnaround in sprint simulations.&rdquo;
            </p>
          </div>
        </div>

        {/* Row 5: Job-Specific Strengths & Gaps */}
        <div className="p-2.5 grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <span className="text-[9px] uppercase font-bold text-slate-400 block">
              Strengths & Gaps
            </span>
            <div className="text-[9px]">
              <span className="text-emerald-400 font-semibold block">Strength:</span>
              <span className="text-slate-300">High-throughput Kafka streaming architecture.</span>
            </div>
            <div className="text-[9px]">
              <span className="text-amber-400 font-semibold block">Gap:</span>
              <span className="text-slate-400">Minimal hands-on Kubernetes multi-cluster ops.</span>
            </div>
          </div>
          <div className="space-y-1 border-l border-slate-800/80 pl-2">
            <span className="text-[9px] uppercase font-bold text-slate-400 block">
              Strengths & Gaps
            </span>
            <div className="text-[9px]">
              <span className="text-emerald-400 font-semibold block">Strength:</span>
              <span className="text-slate-300">Clean REST API design and test automation.</span>
            </div>
            <div className="text-[9px]">
              <span className="text-amber-400 font-semibold block">Gap:</span>
              <span className="text-slate-400">Requires guidance on distributed locking logic.</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Explainable Scoring Note */}
      <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-2.5 text-[10px] text-slate-400 leading-relaxed">
        <strong className="text-slate-300">Scoring Methodology:</strong> Evaluated based on 40%
        required skills alignment, 30% technical interview scorecard, 20% relevant domain tenure,
        and 10% coding assessment percentile. AI assists recruiters; final hiring decisions remain
        human-governed.
      </div>

      {/* 6. Action Links & Advance Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <Link
            href={`/recruitment/candidates?id=${cand1.id}`}
            className="text-cyan-400 hover:underline text-[10px] font-semibold"
          >
            {cand1.name} Profile ↗
          </Link>
          <button
            type="button"
            onClick={() => {
              onRequestConfirmation({
                type: "STAGE_CHANGE",
                title: `Advance ${cand1.name}`,
                description: `Confirm advancement of ${cand1.name} to the next interview round for ${activeReq.title}?`,
                execute: () => {
                  onAdvanceCandidate(cand1, "Interview");
                  onTriggerToast(`✓ ${cand1.name} advanced to next round.`);
                },
              });
            }}
            className="px-2 py-0.5 rounded bg-cyan-600/30 hover:bg-cyan-600 text-cyan-200 hover:text-white border border-cyan-500/40 text-[9px] font-bold transition cursor-pointer"
          >
            Select A
          </button>
        </div>

        <div className="flex items-center justify-between pl-2 border-l border-slate-800">
          <Link
            href={`/recruitment/candidates?id=${cand2.id}`}
            className="text-indigo-400 hover:underline text-[10px] font-semibold"
          >
            {cand2.name} Profile ↗
          </Link>
          <button
            type="button"
            onClick={() => {
              onRequestConfirmation({
                type: "STAGE_CHANGE",
                title: `Advance ${cand2.name}`,
                description: `Confirm advancement of ${cand2.name} to the next interview round for ${activeReq.title}?`,
                execute: () => {
                  onAdvanceCandidate(cand2, "Interview");
                  onTriggerToast(`✓ ${cand2.name} advanced to next round.`);
                },
              });
            }}
            className="px-2 py-0.5 rounded bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white border border-indigo-500/40 text-[9px] font-bold transition cursor-pointer"
          >
            Select B
          </button>
        </div>
      </div>
    </div>
  );
}
