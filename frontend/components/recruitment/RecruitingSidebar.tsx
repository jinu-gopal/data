"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface RecruitingSidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onRequestCreateModal?: () => void;
}

export default function RecruitingSidebar({
  collapsed = false,
  onToggleCollapse,
  onRequestCreateModal,
}: RecruitingSidebarProps) {
  const pathname = usePathname();
  const [requisitionsOpen, setRequisitionsOpen] = useState(pathname?.startsWith("/recruitment/requisitions") || pathname === "/recruitment");
  const [candidatesOpen, setCandidatesOpen] = useState(pathname?.includes("/candidates") || false);
  const [interviewsOpen, setInterviewsOpen] = useState(false);
  const [offersOpen, setOffersOpen] = useState(false);
  const [postingsOpen, setPostingsOpen] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);
  const [workforceOpen, setWorkforceOpen] = useState(false);
  const [integrationsOpen, setIntegrationsOpen] = useState(false);

  const isDashboardActive = pathname === "/recruitment" || pathname === "/recruitment/dashboard";
  const isRequisitionsActive = pathname?.startsWith("/recruitment/requisitions");
  const [moduleMenuOpen, setModuleMenuOpen] = useState(false);

  return (
    <aside
      className={`bg-[#0f172a] text-slate-300 transition-all duration-300 flex flex-col shrink-0 h-screen sticky top-0 z-30 border-r border-slate-800/80 ${
        collapsed ? "w-[72px]" : "w-[240px]"
      }`}
    >
      {/* 1. Header with Brand & Sidebar Collapse Toggle */}
      <div className="h-16 flex items-center justify-between px-3 border-b border-slate-800/80 shrink-0">
        <Link
          href="/"
          className="flex items-center gap-2.5 hover:opacity-90 transition group cursor-pointer"
          title="Return to MAX ERP Homepage"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 text-white font-black text-lg shadow-sm shadow-blue-500/20 shrink-0 group-hover:scale-105 transition-transform">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-extrabold text-white text-base tracking-tight font-sans flex items-center gap-1.5">
                <span>MAX <span className="text-blue-400 font-bold">ERP</span></span>
              </span>
            </div>
          )}
        </Link>

        {/* Sidebar Collapse Toggle Button matching Image (>< icon) */}
        <button
          type="button"
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          title={collapsed ? "Expand sidebar" : "Collapse to icon"}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {collapsed ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            )}
          </svg>
        </button>
      </div>

      {/* 2. Module Selector with Dropdown */}
      {!collapsed && (
        <div className="px-3 pt-3 pb-2 relative">
          <button
            type="button"
            onClick={() => setModuleMenuOpen((p) => !p)}
            className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-xs font-semibold text-white transition"
          >
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-500"></span>
              Recruiting
            </span>
            <svg className={`h-3.5 w-3.5 text-slate-400 transition-transform ${moduleMenuOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {moduleMenuOpen && (
            <div className="absolute left-3 right-3 mt-1.5 p-1.5 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl z-50 text-xs space-y-1">
              <Link
                href="/"
                onClick={() => setModuleMenuOpen(false)}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-emerald-400 hover:bg-slate-800 font-bold"
              >
                <span>🏠</span>
                <span>MAX ERP Suite Home</span>
              </Link>
              <Link
                href="/workforce"
                onClick={() => setModuleMenuOpen(false)}
                className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
              >
                <span>👥</span>
                <span>Workforce Central</span>
              </Link>
              <Link
                href="/configuration/recruitment"
                onClick={() => setModuleMenuOpen(false)}
                className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
              >
                <span>⚙️</span>
                <span>Configuration Studio</span>
              </Link>
              <Link
                href="/security"
                onClick={() => setModuleMenuOpen(false)}
                className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
              >
                <span>🛡️</span>
                <span>Security Governance</span>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* 3. Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-2.5 py-2 space-y-1 text-xs font-medium scrollbar-thin scrollbar-thumb-slate-800">
        {/* Prominent Return to Suite Home Navigation Link */}
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-200 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/70 mb-2.5 font-bold shadow-xs transition group"
          title="Return to MAX ERP Homepage"
        >
          <svg className="h-4 w-4 shrink-0 text-emerald-400 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          {!collapsed && (
            <div className="flex items-center justify-between w-full">
              <span>Suite Home</span>
              <span className="text-[10px] text-emerald-400/90 font-semibold group-hover:translate-x-0.5 transition-transform">
                &larr; Exit
              </span>
            </div>
          )}
        </Link>

        {/* Dashboard */}
        <Link
          href="/recruitment"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition group ${
            isDashboardActive
              ? "bg-slate-800/90 text-white font-semibold shadow-xs"
              : "text-slate-400 hover:text-white hover:bg-slate-800/50"
          }`}
          title="Dashboard"
        >
          <svg className={`h-4 w-4 shrink-0 ${isDashboardActive ? "text-blue-400" : "text-slate-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          {!collapsed && <span>Dashboard</span>}
        </Link>

        {/* Requisitions (Collapsible with Submenu) */}
        <div>
          <button
            onClick={() => setRequisitionsOpen((prev) => !prev)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition ${
              isRequisitionsActive && !collapsed
                ? "bg-blue-600 text-white font-semibold shadow-xs"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
            title="Requisitions"
          >
            <div className="flex items-center gap-3">
              <svg className={`h-4 w-4 shrink-0 ${isRequisitionsActive ? "text-white" : "text-slate-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {!collapsed && <span>Requisitions</span>}
            </div>
            {!collapsed && (
              <svg
                className={`h-3.5 w-3.5 ${isRequisitionsActive ? "text-white" : "text-slate-400"} transition-transform ${requisitionsOpen ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </button>

          {!collapsed && requisitionsOpen && (
            <div className="ml-4 pl-3 border-l border-slate-800 space-y-1 mt-1 pb-1">
              <Link
                href="/recruitment/requisitions"
                className={`block px-3 py-1.5 rounded-lg text-xs transition ${
                  pathname === "/recruitment/requisitions"
                    ? "bg-blue-600 text-white font-semibold shadow-xs"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/40"
                }`}
              >
                All Requisitions
              </Link>
              <Link
                href="/recruitment/requisitions/create"
                className={`block px-3 py-1.5 rounded-lg text-xs transition ${
                  pathname === "/recruitment/requisitions/create"
                    ? "bg-blue-600 text-white font-semibold shadow-xs"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/40"
                }`}
              >
                Create Requisition
              </Link>
              <Link
                href="/recruitment/requisitions?status=Pending+Approval"
                className="block px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800/40 transition"
              >
                Approvals
              </Link>
              <Link
                href="/workforce"
                className="block px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800/40 transition"
              >
                Position Management
              </Link>
            </div>
          )}
        </div>

        {/* Candidates */}
        <div>
          <button
            onClick={() => setCandidatesOpen((p) => !p)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition ${
              pathname?.includes("/recruitment/candidates")
                ? "bg-blue-600 text-white font-semibold"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
            title="Candidates"
          >
            <div className="flex items-center gap-3">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {!collapsed && <span>Candidates</span>}
            </div>
            {!collapsed && (
              <svg
                className={`h-3.5 w-3.5 text-slate-400 transition-transform ${candidatesOpen ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </button>

          {!collapsed && candidatesOpen && (
            <div className="mt-1 ml-4 pl-4 border-l border-slate-700/60 space-y-1 text-xs">
              <Link
                href="/recruitment/candidates"
                className={`block py-1.5 px-2 rounded-md transition ${
                  pathname === "/recruitment/candidates" || pathname.includes("/candidates")
                    ? "text-white font-medium bg-blue-700/60"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Candidate Applications
              </Link>
              <Link
                href="/recruitment?tab=candidates"
                className="block py-1.5 px-2 rounded-md text-slate-400 hover:text-white transition"
              >
                Candidate Pipeline
              </Link>
              <Link
                href="/recruitment?tab=talent-pools"
                className="block py-1.5 px-2 rounded-md text-slate-400 hover:text-white transition"
              >
                Talent Pool
              </Link>
              <Link
                href="/recruitment?tab=interviews"
                className="block py-1.5 px-2 rounded-md text-slate-400 hover:text-white transition"
              >
                Interviews
              </Link>
              <Link
                href="/recruitment?tab=assessments"
                className="block py-1.5 px-2 rounded-md text-slate-400 hover:text-white transition"
              >
                Assessments
              </Link>
            </div>
          )}
        </div>

        {/* Interviews */}
        <div>
          <button
            onClick={() => setInterviewsOpen((p) => !p)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition ${
              pathname?.includes("tab=scorecards") || pathname?.includes("tab=interviews")
                ? "bg-slate-800 text-white font-semibold"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
            title="Interviews"
          >
            <div className="flex items-center gap-3">
              <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {!collapsed && <span>Interviews</span>}
            </div>
            {!collapsed && (
              <svg className={`h-3.5 w-3.5 text-slate-400 transition-transform ${interviewsOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </button>
          {!collapsed && interviewsOpen && (
            <div className="mt-1 ml-4 pl-4 border-l border-slate-700/60 space-y-1 text-xs">
              <Link
                href="/recruitment?tab=scorecards"
                className="block py-1.5 px-2 rounded-md text-slate-400 hover:text-white transition"
              >
                Scorecards & Rubrics
              </Link>
              <Link
                href="/careers"
                className="block py-1.5 px-2 rounded-md text-slate-400 hover:text-white transition"
              >
                Self-Schedule Portal
              </Link>
            </div>
          )}
        </div>

        {/* Offers & Higher-Level Approvals */}
        <div>
          <button
            onClick={() => setOffersOpen((p) => !p)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition ${
              pathname?.includes("/offers")
                ? "bg-slate-800 text-white font-semibold"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
            title="Candidate Offers & Executive Approvals"
          >
            <div className="flex items-center gap-3">
              <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {!collapsed && <span>Offers</span>}
            </div>
            {!collapsed && (
              <svg className={`h-3.5 w-3.5 text-slate-400 transition-transform ${offersOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </button>
          {!collapsed && offersOpen && (
            <div className="mt-1 ml-4 pl-4 border-l border-slate-700/60 space-y-1 text-xs">
              <Link
                href="/recruitment/offers"
                className={`block py-1.5 px-2 rounded-md transition ${
                  pathname === "/recruitment/offers"
                    ? "text-white font-bold bg-white/10"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Candidate Offers
              </Link>
              <Link
                href="/recruitment/offers?tab=approvals"
                className="block py-1.5 px-2 rounded-md text-slate-400 hover:text-white transition"
              >
                Higher-Level Approvals
              </Link>
              <Link
                href="/configuration/recruitment?tab=offers"
                className="block py-1.5 px-2 rounded-md text-blue-400/80 hover:text-blue-300 transition text-[11px] flex items-center justify-between"
                title="Manage templates in Configuration Studio"
              >
                <span>Template Config</span>
                <span className="text-[10px]">Studio ↗</span>
              </Link>
            </div>
          )}
        </div>

        {/* Job Postings */}
        <div>
          <button
            onClick={() => setPostingsOpen((p) => !p)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition ${
              pathname?.includes("tab=distribution")
                ? "bg-slate-800 text-white font-semibold"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
            title="Job Postings"
          >
            <div className="flex items-center gap-3">
              <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
              {!collapsed && <span>Job Postings</span>}
            </div>
            {!collapsed && (
              <svg className={`h-3.5 w-3.5 text-slate-400 transition-transform ${postingsOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </button>
          {!collapsed && postingsOpen && (
            <div className="mt-1 ml-4 pl-4 border-l border-slate-700/60 space-y-1 text-xs">
              <Link
                href="/recruitment?tab=distribution"
                className="block py-1.5 px-2 rounded-md text-slate-400 hover:text-white transition"
              >
                Multi-Channel Boards
              </Link>
              <Link
                href="/careers"
                className="block py-1.5 px-2 rounded-md text-slate-400 hover:text-white transition"
              >
                Career Site Preview
              </Link>
            </div>
          )}
        </div>

        {/* Talent Pools */}
        <Link
          href="/recruitment/candidates"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 cursor-pointer transition"
          title="Talent Pools"
        >
          <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          {!collapsed && <span>Talent Pools</span>}
        </Link>

        {/* Referrals */}
        <Link
          href="/recruitment?tab=distribution"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 cursor-pointer transition"
          title="Referrals"
        >
          <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          {!collapsed && <span>Referrals</span>}
        </Link>

        {/* Agencies */}
        <Link
          href="/recruitment?tab=agencies"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 cursor-pointer transition"
          title="Agencies"
        >
          <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          {!collapsed && <span>Agencies</span>}
        </Link>

        {/* Assessments & BGV */}
        <Link
          href="/recruitment?tab=assessments"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 cursor-pointer transition"
          title="Assessments & BGV"
        >
          <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {!collapsed && <span>Assessments & BGV</span>}
        </Link>



        {/* Divider */}
        <div className="pt-2 pb-1">
          <div className="border-t border-slate-800/80"></div>
        </div>

        {/* Communication */}
        <div className="flex items-center justify-between px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 cursor-pointer transition" title="Communication">
          <div className="flex items-center gap-3">
            <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {!collapsed && <span>Communication</span>}
          </div>
          {!collapsed && (
            <span className="h-5 min-w-[20px] px-1.5 flex items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white">
              8
            </span>
          )}
        </div>

        {/* AI Assistant */}
        <Link
          href="/recruitment/requisitions"
          className="flex items-center justify-between px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 cursor-pointer transition"
          title="AI Assistant"
        >
          <div className="flex items-center gap-3">
            <svg className="h-4 w-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            {!collapsed && <span>AI Assistant</span>}
          </div>
          {!collapsed && (
            <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
              New
            </span>
          )}
        </Link>

        {/* MAX AI Studio */}
        <Link
          href="/recruitment/ai-studio"
          className={`flex items-center justify-between px-3 py-2 rounded-lg transition ${
            pathname === "/recruitment/ai-studio"
              ? "bg-purple-600/20 text-purple-300 font-semibold border border-purple-500/30"
              : "text-slate-400 hover:text-white hover:bg-slate-800/50"
          }`}
          title="MAX AI Studio & Workflow Builder"
        >
          <div className="flex items-center gap-3">
            <svg className="h-4 w-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            {!collapsed && <span>MAX AI Studio</span>}
          </div>
          {!collapsed && (
            <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-bold border border-purple-500/30">
              Studio
            </span>
          )}
        </Link>

        {/* Analytics */}
        <Link
          href="/recruitment?tab=analytics"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition"
          title="Analytics"
        >
          <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          {!collapsed && <span>Analytics</span>}
        </Link>

        {/* Reports */}
        <Link
          href="/recruitment?tab=analytics"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition"
          title="Reports"
        >
          <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {!collapsed && <span>Reports</span>}
        </Link>

        {/* Divider */}
        <div className="pt-2 pb-1">
          <div className="border-t border-slate-800/80"></div>
        </div>

        {/* Workforce */}
        <Link
          href="/workforce"
          className="flex items-center justify-between px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition"
          title="Workforce"
        >
          <div className="flex items-center gap-3">
            <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            {!collapsed && <span>Workforce</span>}
          </div>
          {!collapsed && (
            <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
        </Link>

        {/* Integrations */}
        <Link
          href="/configuration/recruitment"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition"
          title="Integrations"
        >
          <div className="flex items-center gap-3">
            <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            {!collapsed && <span>Integrations</span>}
          </div>
        </Link>

        {/* Settings */}
        <Link
          href="/configuration/recruitment"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition"
          title="Settings"
        >
          <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {!collapsed && <span>Settings</span>}
        </Link>
      </nav>

      {/* 4. Bottom Collapse Action */}
      <div className="p-3 border-t border-slate-800/80 shrink-0">
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 text-xs font-semibold transition"
        >
          <svg
            className={`h-4 w-4 transition-transform ${collapsed ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
