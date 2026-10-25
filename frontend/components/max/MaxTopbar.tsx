"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import MaxSettingsMenu from "./MaxSettingsMenu";
import MaxAiCopilotDrawer from "./MaxAiCopilotDrawer";
import MaxVoiceCommandModal from "./MaxVoiceCommandModal";

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none">
      <circle
        cx="11"
        cy="11"
        r="6.5"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="m16 16 4.5 4.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[19px] w-[19px]" fill="none">
      <path
        d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M10 21h4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ChevronDown() {
  return (
    <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none">
      <path
        d="m5 7.5 5 5 5-5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.6 9h16.8M3.6 15h16.8M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
      <circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M6 20a6 6 0 0 1 12 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
      <path d="M10 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M14 8l4 4-4 4M18 12H9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type MaxTopbarProps = {
  name?: string;
  email?: string | null;
  onSignOut?: () => void;
  onToggleSidebar?: () => void;
};

export default function MaxTopbar({
  name = "Elena Vance",
  email = "elena.vance@max-enterprise.com",
  onSignOut,
  onToggleSidebar,
}: MaxTopbarProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const [navMenuOpen, setNavMenuOpen] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();
  const router = useRouter();

  const initial = name.charAt(0).toUpperCase();

  // Global Keyboard Shortcuts: ⌘J for Copilot, ⌘Shift+V for Voice Command
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "j") {
        e.preventDefault();
        setCopilotOpen((prev) => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "v") {
        e.preventDefault();
        setVoiceModalOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const navLinks = [
    { label: "Home", href: "/", active: pathname === "/" },
    { label: "Recruitment", href: "/recruitment", active: pathname?.startsWith("/recruitment") },
    { label: "Workforce & EC", href: "/workforce", active: pathname?.startsWith("/workforce") && !pathname?.includes("tab=positions") },
    { label: "Position Control", href: "/workforce?tab=positions", active: pathname?.includes("tab=positions") },
    { label: "Config Studio", href: "/configuration/ec-core", active: pathname?.startsWith("/configuration") },
    { label: "Governance", href: "/security", active: pathname?.startsWith("/security") },
    { label: "MAX AI", href: "/ai", active: pathname?.startsWith("/ai") },
  ];

  return (
    <header className="sticky top-0 z-50 h-16 w-full border-b border-slate-200/90 bg-white text-slate-900 shadow-2xs">
      <div className="mx-auto flex h-full w-full max-w-[1800px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        
        {/* LEFT: DELOITTE-GRADE BRAND LOGO + GLOBAL NAV */}
        <div className="flex items-center gap-5 lg:gap-7">
          {/* Brand Logo with Deloitte signature green dot -> Returns to Suite Home */}
          <Link href="/" className="flex items-center gap-1 group shrink-0" title="Return to MAX ERP Homepage">
            <span className="text-xl font-black tracking-tight text-slate-900 font-sans group-hover:text-blue-600 transition-colors">
              MAX
            </span>
            <span className="text-xl font-black tracking-tight text-blue-600 font-sans ml-0.5">
              ERP
            </span>
            <span
              className="inline-block h-2.5 w-2.5 rounded-full bg-[#86bc25] ml-1 mb-0.5 shadow-2xs"
              title="Enterprise Verified"
            />
          </Link>

          {/* Corporate Global Nav Dropdowns (Deloitte/AWS Style matching Recruiting UI) */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`relative px-3 py-1.5 text-xs font-semibold tracking-tight transition rounded-xl flex items-center gap-1.5 ${
                  item.active
                    ? "text-blue-600 font-bold bg-blue-50/80 border-b-2 border-blue-600 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                }`}
              >
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* CENTER: SEARCH BAR (DELOITTE / AWS STANDARD) */}
        <div className="hidden md:flex flex-1 max-w-[420px] mx-4">
          <div className="relative w-full">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <SearchIcon />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search positions, candidates, records... (⌘K)"
              className="h-9 w-full rounded-xl border border-slate-200/90 bg-slate-50 pl-9 pr-18 text-xs font-medium text-slate-900 placeholder-slate-400 shadow-2xs transition focus:border-blue-500 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-2.5 gap-1.5">
              <button
                type="button"
                onClick={() => setVoiceModalOpen(true)}
                className="flex h-6 w-6 items-center justify-center rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition cursor-pointer"
                title="Voice Command Dictation (⌘Shift+V)"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 003-3V5a3 3 0 10-6 0v6a3 3 0 003 3z" />
                </svg>
              </button>
              <kbd className="pointer-events-none rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[9px] font-mono font-bold text-slate-400 shadow-2xs">
                ⌘K
              </kbd>
            </div>
          </div>
        </div>

        {/* RIGHT: LOCALE, NOTIFICATIONS, THEME SETTINGS & PROFILE */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
          
          {/* Global Locale Selector (Deloitte Style: IN - EN) */}
          <button
            type="button"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
            title="Region and Language"
          >
            <GlobeIcon />
            <span className="font-semibold">GLOBAL - EN</span>
            <ChevronDown />
          </button>

          {/* Ask MAX AI Copilot Trigger */}
          <button
            type="button"
            onClick={() => setCopilotOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200/80 px-3 py-1.5 text-xs font-semibold text-blue-700 transition shadow-2xs group cursor-pointer"
            title="Open MAX AI Copilot (⌘J)"
          >
            <span className="text-blue-600 group-hover:scale-125 transition-transform text-xs">✨</span>
            <span>Ask MAX AI</span>
            <kbd className="hidden lg:inline-block rounded border border-blue-300/80 bg-white px-1 py-0.2 text-[9px] font-mono font-bold text-blue-700">
              ⌘J
            </kbd>
          </button>

          {/* Quick Action: New Requisition */}
          <Link
            href="/recruitment"
            className="hidden xl:inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 border border-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white transition shadow-2xs"
          >
            <span className="font-bold">+</span>
            <span>New Requisition</span>
          </Link>

          {/* Notifications Bell */}
          <button
            type="button"
            aria-label="Notifications"
            className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
          >
            <BellIcon />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#86bc25] ring-2 ring-white" />
          </button>

          {/* Settings Menu (Theme Chooser & Customization) */}
          <MaxSettingsMenu />

          {/* Administrator Profile Dropdown */}
          <div className="relative ml-1">
            <button
              type="button"
              onClick={() => setProfileOpen((prev) => !prev)}
              className="flex items-center gap-2 rounded-xl p-1.5 pl-2 text-slate-800 hover:bg-slate-100 transition"
            >
              <span className="hidden md:inline-block text-xs font-bold text-slate-900">
                {name}
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 border border-slate-200 text-[11px] font-bold text-white shadow-2xs">
                {initial}
              </div>
            </button>

            {/* Profile Dropdown Menu */}
            {profileOpen && (
              <div className="absolute right-0 top-full z-[400] mt-2 w-[290px] overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-2xl">
                <div className="border-b border-slate-100 p-4 bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 text-sm font-black text-white shadow-sm">
                      {initial}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-xs font-bold text-slate-900">
                        {name}
                      </div>
                      <div className="truncate text-[10px] text-slate-500">
                        {email}
                      </div>
                      <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.5 text-[9px] font-bold border border-emerald-200/60">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#86bc25]" />
                        Executive Administrator
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-2 space-y-1">
                  <Link
                    href="/"
                    onClick={() => setProfileOpen(false)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-xs font-bold text-slate-900 transition hover:bg-slate-50"
                  >
                    <span>🏠</span>
                    <span>MAX ERP Suite Home</span>
                  </Link>

                  <Link
                    href="/recruitment"
                    onClick={() => setProfileOpen(false)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    <UserIcon />
                    Recruiting Workspace
                  </Link>

                  <Link
                    href="/configuration/ec-core"
                    onClick={() => setProfileOpen(false)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
                      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="currentColor" strokeWidth="1.6" />
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" stroke="currentColor" strokeWidth="1.4" />
                    </svg>
                    EC Core Configuration Studio
                  </Link>

                  {onSignOut && (
                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                        onSignOut();
                      }}
                      className="mt-1 flex w-full items-center gap-3 rounded-xl bg-red-50 px-3 py-2 text-left text-xs font-bold text-red-600 transition hover:bg-red-100"
                    >
                      <LogoutIcon />
                      Sign out
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Global Slide-Over MAX AI Copilot Drawer */}
      <MaxAiCopilotDrawer isOpen={copilotOpen} onClose={() => setCopilotOpen(false)} />

      {/* Universal Executive Voice Command HUD */}
      <MaxVoiceCommandModal isOpen={voiceModalOpen} onClose={() => setVoiceModalOpen(false)} />
    </header>
  );
}