"use client";

import { useState } from "react";
import Link from "next/link";

interface RecruitingHeaderProps {
  onSearch?: (query: string) => void;
}

export default function RecruitingHeader({ onSearch }: RecruitingHeaderProps) {
  const [searchVal, setSearchVal] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAppLauncher, setShowAppLauncher] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchVal(e.target.value);
    if (onSearch) onSearch(e.target.value);
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/90 px-4 sm:px-6 flex items-center justify-between gap-3 sticky top-0 z-20 shadow-2xs">
      {/* 0. Return to Suite Home Navigation Link */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 hover:text-blue-600 shadow-2xs transition group shrink-0"
        title="Return to MAX ERP Homepage"
      >
        <span className="text-slate-400 group-hover:-translate-x-0.5 group-hover:text-blue-600 transition-transform">&larr;</span>
        <svg className="h-3.5 w-3.5 text-slate-500 group-hover:text-blue-600 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <span className="hidden sm:inline">Suite Home</span>
      </Link>

      {/* 1. Global Search Bar matching Image */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchVal}
            onChange={handleSearchChange}
            placeholder="Search candidates, requisitions, jobs..."
            className="w-full pl-10 pr-12 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-2xs"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <kbd className="inline-flex items-center px-1.5 py-0.5 rounded border border-slate-200 bg-white text-[10px] font-medium text-slate-400 shadow-2xs">
              ⌘ K
            </kbd>
          </div>
        </div>
      </div>

      {/* 2. Right Toolbar Items matching Image 1 & 2 */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Global Dropdown */}
        <button className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition">
          <svg className="h-3.5 w-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Global</span>
          <svg className="h-3 w-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Notifications with Badge '12' */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications((p) => !p)}
            className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
            title="Notifications"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-1 right-1 h-4 min-w-[16px] px-1 rounded-full bg-rose-600 text-[9px] font-bold text-white flex items-center justify-center">
              12
            </span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white border border-slate-200 shadow-xl p-3 z-50 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 font-bold text-slate-900">
                <span>Notifications (12)</span>
                <span className="text-[10px] text-blue-600 font-semibold cursor-pointer">Mark all read</span>
              </div>
              <div className="py-2 space-y-2 max-h-60 overflow-y-auto">
                <div className="p-2 rounded-lg bg-blue-50/70 border border-blue-100 text-slate-800">
                  <span className="font-semibold block">REQ-2026-0048 approved</span>
                  <span className="text-[11px] text-slate-500">Finance has approved Senior Java Developer slot.</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 text-slate-800">
                  <span className="font-semibold block">New Candidate Applied</span>
                  <span className="text-[11px] text-slate-500">Maya Patel applied for Lead Systems Architect.</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Help Icon */}
        <button
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
          title="Help & Support"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>

        {/* App Launcher Grid with Interactive Launchpad */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowAppLauncher((p) => !p)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
            title="MAX Enterprise App Launcher"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>

          {showAppLauncher && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-slate-200 shadow-2xl p-2.5 z-50 text-xs">
              <div className="pb-2 mb-1.5 border-b border-slate-100 flex items-center justify-between">
                <span className="font-bold text-slate-900">MAX Enterprise Suite</span>
                <span className="text-[10px] text-slate-400">Launchpad</span>
              </div>
              <div className="space-y-1">
                <Link
                  href="/"
                  onClick={() => setShowAppLauncher(false)}
                  className="flex items-center gap-2.5 p-2 rounded-xl bg-emerald-50/70 border border-emerald-200/60 text-emerald-900 font-bold hover:bg-emerald-100/70 transition"
                >
                  <span className="text-base">🏠</span>
                  <div className="min-w-0">
                    <span className="block font-bold">Suite Homepage</span>
                    <span className="block text-[10px] text-emerald-700/80 font-normal">Return to main launchpad</span>
                  </div>
                </Link>
                <Link
                  href="/workforce"
                  onClick={() => setShowAppLauncher(false)}
                  className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 text-slate-700 font-medium transition"
                >
                  <span className="text-base">👥</span>
                  <span>Workforce &amp; EC Core</span>
                </Link>
                <Link
                  href="/configuration/ec-core"
                  onClick={() => setShowAppLauncher(false)}
                  className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 text-slate-700 font-medium transition"
                >
                  <span className="text-base">⚙️</span>
                  <span>Configuration Studio</span>
                </Link>
                <Link
                  href="/security"
                  onClick={() => setShowAppLauncher(false)}
                  className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 text-slate-700 font-medium transition"
                >
                  <span className="text-base">🛡️</span>
                  <span>Security &amp; Governance</span>
                </Link>
                <Link
                  href="/ai"
                  onClick={() => setShowAppLauncher(false)}
                  className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 text-slate-700 font-medium transition"
                >
                  <span className="text-base">✨</span>
                  <span>MAX AI Copilot Studio</span>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile: John Smith - Recruiter */}
        <div className="relative pl-1">
          <button
            onClick={() => setShowUserMenu((p) => !p)}
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-100 transition text-left"
          >
            <img
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=faces"
              alt="John Smith"
              className="h-8 w-8 rounded-full object-cover ring-2 ring-slate-200"
            />
            <div className="hidden md:flex flex-col">
              <span className="text-xs font-bold text-slate-900 leading-tight">John Smith</span>
              <span className="text-[10px] text-slate-500 leading-tight flex items-center gap-0.5">
                Recruiter
                <svg className="h-3 w-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-slate-200 shadow-xl p-2 z-50 text-xs font-medium">
              <div className="px-3 py-2 border-b border-slate-100">
                <span className="font-bold text-slate-900 block">John Smith</span>
                <span className="text-[11px] text-slate-500 block">john.smith@max-enterprise.com</span>
              </div>
              <div className="py-1 space-y-0.5">
                <Link
                  href="/"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-emerald-800 bg-emerald-50/60 hover:bg-emerald-100/70 font-bold"
                >
                  <span className="flex items-center gap-2">
                    <span>🏠</span>
                    <span>MAX ERP Suite Home</span>
                  </span>
                  <span className="text-[10px] text-emerald-600">&rarr;</span>
                </Link>
                <Link
                  href="/workforce"
                  onClick={() => setShowUserMenu(false)}
                  className="block px-3 py-1.5 rounded-lg text-slate-700 hover:bg-slate-50"
                >
                  Workforce &amp; EC Core
                </Link>
                <Link
                  href="/configuration/recruitment"
                  onClick={() => setShowUserMenu(false)}
                  className="block px-3 py-1.5 rounded-lg text-slate-700 hover:bg-slate-50"
                >
                  Recruiting Settings
                </Link>
                <Link
                  href="/careers"
                  onClick={() => setShowUserMenu(false)}
                  className="block px-3 py-1.5 rounded-lg text-slate-700 hover:bg-slate-50"
                >
                  Public Career Portal
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
