"use client";

import { useState } from "react";
import Link from "next/link";
import { Requisition } from "@/lib/recruitment-store";

interface InsightsWorkspaceProps {
  requisitions: Requisition[];
  activeReq: Requisition;
  onSelectReq: (req: Requisition) => void;
}

export default function InsightsWorkspace({
  requisitions,
  activeReq,
  onSelectReq,
}: InsightsWorkspaceProps) {
  const [dateRange, setDateRange] = useState<"30d" | "q4" | "ytd">("30d");

  return (
    <div className="space-y-3.5 text-slate-100">
      {/* 1. Header with Requisition & Date Range Filters */}
      <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-fuchsia-500/20 text-fuchsia-400 text-xs">
                📈
              </span>
              <h3 className="text-xs font-bold text-white tracking-wide">Recruiting Insights</h3>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
              Talent acquisition analytics, pipeline velocity, and requisition trends.
            </p>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-fuchsia-900/40 border border-fuchsia-500/30 text-[9px] font-semibold text-fuchsia-300 shrink-0">
            Real-Time Analytics
          </span>
        </div>

        {/* Filter Controls: Requisition & Date Range */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-[10px]">
          <div>
            <span className="text-slate-400 uppercase font-semibold tracking-wider block mb-0.5">
              Requisition
            </span>
            <select
              value={activeReq.id}
              onChange={(e) => {
                const found = requisitions.find((r) => r.id === e.target.value);
                if (found) onSelectReq(found);
              }}
              className="w-full bg-slate-800/90 border border-slate-700/80 rounded-md px-2 py-1 text-[11px] font-medium text-slate-100 focus:outline-hidden focus:border-fuchsia-500 truncate cursor-pointer"
            >
              <option value="all">All Requisitions (12 Open)</option>
              {requisitions.map((r) => (
                <option key={r.id} value={r.id} className="bg-slate-900 text-slate-200">
                  {r.reqNumber} — {r.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <span className="text-slate-400 uppercase font-semibold tracking-wider block mb-0.5">
              Date Range
            </span>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="w-full bg-slate-800/90 border border-slate-700/80 rounded-md px-2 py-1 text-[11px] font-medium text-slate-100 focus:outline-hidden focus:border-fuchsia-500 cursor-pointer"
            >
              <option value="30d">Last 30 Days</option>
              <option value="q4">Current Quarter (Q4 2026)</option>
              <option value="ytd">Year to Date (FY26)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Grid */}
      <div className="grid grid-cols-2 gap-2">
        {/* KPI 1: Application Volume */}
        <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
            Applications
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-extrabold text-white">128</span>
            <span className="text-[10px] font-bold text-emerald-400">+18% MoM</span>
          </div>
          <span className="text-[9px] text-slate-400 block">Across 12 open roles</span>
        </div>

        {/* KPI 2: Time to Hire */}
        <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
            Time to Hire
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-extrabold text-white">18.4d</span>
            <span className="text-[10px] font-bold text-emerald-400">-2.6d SLA</span>
          </div>
          <span className="text-[9px] text-slate-400 block">Target: 21.0 days</span>
        </div>

        {/* KPI 3: Offer Acceptance Rate */}
        <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
            Offer Acceptance
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-extrabold text-emerald-400">94.2%</span>
            <span className="text-[10px] font-medium text-slate-400">8 of 9</span>
          </div>
          <span className="text-[9px] text-slate-400 block">Benchmark: 88.0%</span>
        </div>

        {/* KPI 4: Screening Pass Rate */}
        <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
            Screening Pass Rate
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-extrabold text-white">42.5%</span>
            <span className="text-[10px] font-medium text-slate-400">High fit</span>
          </div>
          <span className="text-[9px] text-slate-400 block">AI-screened candidates</span>
        </div>
      </div>

      {/* 3. Workflow Funnel Breakdown */}
      <div className="rounded-xl bg-[#0d142b] border border-slate-800 p-3 space-y-2">
        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
          <span>Configured Stage Funnel</span>
          <span className="text-slate-300">Conversion Rate</span>
        </div>

        <div className="space-y-1.5 text-[10px]">
          {/* Applied */}
          <div className="space-y-0.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-medium">Applied</span>
              <span className="text-slate-400 font-semibold">128 (100%)</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-slate-400 rounded-full w-full" />
            </div>
          </div>

          {/* Screening */}
          <div className="space-y-0.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-medium">Screening</span>
              <span className="text-blue-300 font-semibold">68 (53.1%)</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full w-[53%]" />
            </div>
          </div>

          {/* Interview */}
          <div className="space-y-0.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-medium">Interview</span>
              <span className="text-purple-300 font-semibold">32 (25.0%)</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500 rounded-full w-[25%]" />
            </div>
          </div>

          {/* Offer */}
          <div className="space-y-0.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-medium">Offer</span>
              <span className="text-amber-300 font-semibold">12 (9.4%)</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full w-[9.4%]" />
            </div>
          </div>

          {/* Hired */}
          <div className="space-y-0.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-medium">Hired</span>
              <span className="text-emerald-300 font-semibold">8 (6.2%)</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full w-[6.2%]" />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Candidate Sources & Hiring Velocity */}
      <div className="grid grid-cols-2 gap-2 text-[10px]">
        {/* Sourcing Breakdown */}
        <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
          <span className="font-bold text-slate-300 uppercase tracking-wider block">
            Top Sources
          </span>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">LinkedIn</span>
              <span className="font-semibold text-white">44% (56)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Referrals</span>
              <span className="font-semibold text-emerald-400">28% (36)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Careers Site</span>
              <span className="font-semibold text-blue-400">18% (23)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Agencies</span>
              <span className="font-semibold text-slate-300">10% (13)</span>
            </div>
          </div>
        </div>

        {/* Turnaround Velocity */}
        <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
          <span className="font-bold text-slate-300 uppercase tracking-wider block">
            Velocity Status
          </span>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 truncate max-w-[90px]">Senior Java</span>
              <span className="font-bold text-emerald-400">12.4d ✓</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 truncate max-w-[90px]">SAP Consult</span>
              <span className="font-bold text-blue-400">18.0d ✓</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 truncate max-w-[90px]">Product Mgr</span>
              <span className="font-bold text-amber-400">24.5d ⚠️</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 truncate max-w-[90px]">UI/UX Lead</span>
              <span className="font-bold text-emerald-400">14.1d ✓</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Concise AI Telemetry Insight */}
      <div className="rounded-xl bg-slate-900/60 border border-fuchsia-500/30 p-2.5 space-y-1 text-[10px] text-slate-300 leading-relaxed">
        <div className="flex items-center gap-1.5 text-fuchsia-300 font-bold uppercase tracking-wider">
          <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-400 animate-pulse" />
          <span>AI Velocity Diagnostic</span>
        </div>
        <p>
          Hiring velocity is optimal across Engineering roles. Candidate pipeline health is strong with zero
          compliance dropouts. Bottleneck identified: Interview panel feedback submission averaging 48 hours
          for Product Management positions.
        </p>
      </div>

      {/* 6. Deep Link to Analytics Hub */}
      <div className="pt-1 border-t border-slate-800 flex justify-end">
        <Link
          href="/recruitment?tab=analytics"
          className="inline-flex items-center gap-1 text-[10px] font-bold text-fuchsia-400 hover:text-fuchsia-300"
        >
          <span>Open Full Analytics Hub</span>
          <span>→</span>
        </Link>
      </div>
    </div>
  );
}
