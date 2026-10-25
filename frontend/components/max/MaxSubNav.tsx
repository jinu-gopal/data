"use client";

import { useState } from "react";
import Link from "next/link";

interface SubNavProps {
  title?: string;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  statusBadge?: string;
}

export default function MaxSubNav({
  title = "Recruitment & Talent Operations",
  activeTab = "KANBAN",
  onTabChange,
  statusBadge = "26 Active Positions",
}: SubNavProps) {
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  const navItems = [
    { id: "KANBAN", label: "Pipeline Kanban", count: "148" },
    { id: "CANDIDATES", label: "Candidate Directory", count: "148" },
    { id: "REQUISITIONS", label: "Job Requisitions", count: "26" },
    { id: "INTERVIEWS", label: "Teams Interviews", count: "34" },
    { id: "OFFERS", label: "Offer Studio", count: "12" },
    { id: "POSITIONS", label: "EC Position Control", count: "17" },
    { id: "ANALYTICS", label: "Executive Analytics", count: "Live" },
  ];

  return (
    <div className="w-full mb-6">
      <div className="w-full rounded-2xl border border-slate-200/90 bg-white p-3 sm:px-6 sm:py-3.5 shadow-xs transition-colors dark:border-white/10 dark:bg-[#14151b] flex flex-wrap items-center justify-between gap-4">
        
        {/* Left: Module Title & Telemetry */}
        <div className="flex items-center gap-3">
          <span className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
            {title}
          </span>
          <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200/60 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-[#86bc25] animate-pulse" />
            {statusBadge}
          </span>
        </div>

        {/* Center / Right: AWS Style Sub-Navigation Items */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange && onTabChange(item.id)}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-[#111827] text-white shadow-xs dark:bg-white dark:text-black"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5"
                }`}
              >
                <span>{item.label}</span>
                <span
                  className={`rounded-md px-1.5 py-0.5 text-[10px] font-mono font-bold ${
                    isActive
                      ? "bg-white/20 text-white dark:bg-black/10 dark:text-black"
                      : "bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-400"
                  }`}
                >
                  {item.count}
                </span>
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
}
