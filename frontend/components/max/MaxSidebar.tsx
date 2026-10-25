"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

// Icon components matching the reference image's minimalist monochrome style
function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path d="m3 9.5 9-7 9 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-10Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M9 21.5v-6h6v6" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function BarChartIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <rect x="4" y="12" width="3.5" height="8" rx="1" stroke="currentColor" strokeWidth="1.6" />
      <rect x="10.25" y="8" width="3.5" height="12" rx="1" stroke="currentColor" strokeWidth="1.6" />
      <rect x="16.5" y="4" width="3.5" height="16" rx="1" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function WorkforceIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M5.5 21a6.5 6.5 0 0 1 13 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function OperationsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <rect x="3" y="4" width="18" height="16" rx="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 10h18M10 20V10" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function FinanceIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <rect x="3" y="5" width="18" height="14" rx="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 10h18M7 15h2m4 0h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function DocumentIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M14 2v6h6M8 13h8M8 17h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function ConfigIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}

function SecurityIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ObjectsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M12 12v9M12 12l8-4.5M12 12 4 7.5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function AnalyticsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path d="M3 3v18h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="m7 14 4-4 4 3 5-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Module Tile item
interface ModuleTile {
  title: string;
  subTitle: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
}

const MODULE_TILES: ModuleTile[] = [
  {
    title: "Recruiting",
    subTitle: "Talent ATS",
    href: "/recruitment",
    icon: <BarChartIcon />,
    badge: "ATS",
  },
  {
    title: "Workforce",
    subTitle: "People & Org",
    href: "/workforce",
    icon: <WorkforceIcon />,
    badge: "HCM",
  },
  {
    title: "Operations",
    subTitle: "Execution",
    href: "/operations",
    icon: <OperationsIcon />,
    badge: "OPS",
  },
  {
    title: "Finance",
    subTitle: "Currencies",
    href: "/configuration/finance",
    icon: <FinanceIcon />,
    badge: "FIN",
  },
  {
    title: "AI Letters",
    subTitle: "Offer Docs",
    href: "/recruitment/letters",
    icon: <DocumentIcon />,
    badge: "100+",
  },
  {
    title: "Config",
    subTitle: "Governance",
    href: "/configuration",
    icon: <ConfigIcon />,
    badge: "CORE",
  },
  {
    title: "Objects",
    subTitle: "Metadata",
    href: "/configuration/business-objects",
    icon: <ObjectsIcon />,
  },
  {
    title: "Analytics",
    subTitle: "BI Telemetry",
    href: "/analytics",
    icon: <AnalyticsIcon />,
    badge: "LIVE",
  },
];

export default function MaxSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`fixed left-0 top-0 z-50 flex h-screen border-r border-[#1a1b22] bg-[#0c0d11] transition-all duration-300 ${
        collapsed ? "w-[64px]" : "w-[236px]"
      }`}
    >
      {/* ========================================================
          RAIL 1: ULTRA-COMPACT 64px ICON DOCK (FAR LEFT)
          Matches the leftmost icon rail in the user's reference
          ======================================================== */}
      <div className="flex h-full w-[64px] shrink-0 flex-col justify-between border-r border-[#1a1b22] bg-[#09090d] py-3.5">
        {/* Top: macOS style window dots + Hamburger button */}
        <div className="flex flex-col items-center">
          {/* macOS window dots */}
          <div className="flex items-center gap-1.5 pt-0.5 pb-3">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56] opacity-90 shadow-xs" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e] opacity-90 shadow-xs" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f] opacity-90 shadow-xs" />
          </div>

          {/* Hamburger toggle */}
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            aria-label="Toggle Navigation Rail"
            className="mt-1 flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
              <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>

          {/* Quick rail icon shortcuts with small labels underneath matching reference */}
          <div className="mt-4 flex flex-col items-center gap-2.5 w-full px-1">
            <Link
              href="/"
              title="Home Dashboard"
              className={`group flex flex-col items-center justify-center py-2 px-1 w-full rounded-xl transition ${
                pathname === "/"
                  ? "text-white bg-white/10 shadow-xs"
                  : "text-slate-500 hover:text-slate-200 hover:bg-white/5"
              }`}
            >
              <div className="flex h-7 w-7 items-center justify-center">
                <HomeIcon />
              </div>
              <span className="mt-0.5 text-[8px] font-medium tracking-tight">Home</span>
            </Link>

            <Link
              href="/recruitment"
              title="Recruiting Studio"
              className={`group flex flex-col items-center justify-center py-2 px-1 w-full rounded-xl transition ${
                pathname.startsWith("/recruitment")
                  ? "text-white bg-white/10 shadow-xs"
                  : "text-slate-500 hover:text-slate-200 hover:bg-white/5"
              }`}
            >
              <div className="flex h-7 w-7 items-center justify-center">
                <BarChartIcon />
              </div>
              <span className="mt-0.5 text-[8px] font-medium tracking-tight">Recruiting</span>
            </Link>

            <Link
              href="/workforce"
              title="Workforce & People"
              className={`group flex flex-col items-center justify-center py-2 px-1 w-full rounded-xl transition ${
                pathname.startsWith("/workforce")
                  ? "text-white bg-white/10 shadow-xs"
                  : "text-slate-500 hover:text-slate-200 hover:bg-white/5"
              }`}
            >
              <div className="flex h-7 w-7 items-center justify-center">
                <WorkforceIcon />
              </div>
              <span className="mt-0.5 text-[8px] font-medium tracking-tight">Workforce</span>
            </Link>

            <Link
              href="/operations"
              title="Operations"
              className={`group flex flex-col items-center justify-center py-2 px-1 w-full rounded-xl transition ${
                pathname.startsWith("/operations")
                  ? "text-white bg-white/10 shadow-xs"
                  : "text-slate-500 hover:text-slate-200 hover:bg-white/5"
              }`}
            >
              <div className="flex h-7 w-7 items-center justify-center">
                <OperationsIcon />
              </div>
              <span className="mt-0.5 text-[8px] font-medium tracking-tight">Ops</span>
            </Link>

            <Link
              href="/security"
              title="Security & Governance"
              className={`group flex flex-col items-center justify-center py-2 px-1 w-full rounded-xl transition ${
                pathname.startsWith("/security")
                  ? "text-white bg-white/10 shadow-xs"
                  : "text-slate-500 hover:text-slate-200 hover:bg-white/5"
              }`}
            >
              <div className="flex h-7 w-7 items-center justify-center">
                <SecurityIcon />
              </div>
              <span className="mt-0.5 text-[8px] font-medium tracking-tight">Security</span>
            </Link>
          </div>
        </div>

        {/* Bottom Rail: Settings & Profile */}
        <div className="flex flex-col items-center gap-2">
          <Link
            href="/configuration"
            title="System Settings"
            className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-500 hover:bg-white/5 hover:text-white transition"
          >
            <ConfigIcon />
          </Link>

          <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-slate-700 to-slate-900 border border-white/20 flex items-center justify-center text-[10px] font-bold text-white shadow-xs">
            M
          </div>
        </div>
      </div>

      {/* ========================================================
          RAIL 2: 172px MODULE SQUIRCLE TILE COLUMN
          Matches the "EPR >" header and squircle tiles in reference
          ======================================================== */}
      {!collapsed && (
        <div className="flex h-full w-[172px] flex-1 flex-col bg-[#101116] p-3 overflow-y-auto">
          {/* Header block: "EPR >" tab matching reference image */}
          <Link
            href="/"
            className="flex items-center justify-between rounded-xl bg-[#202127] border border-white/10 px-3.5 py-2.5 mb-3.5 shadow-sm group hover:border-white/20 transition"
          >
            <span className="text-sm font-black tracking-tight text-white group-hover:text-slate-200">
              EPR
            </span>
            <span className="text-slate-400 font-bold text-xs">&gt;</span>
          </Link>

          {/* SQUIRCLE MODULE TILES (Centered Icon on Top, Centered Text Below) */}
          <div className="grid grid-cols-1 gap-2.5">
            {MODULE_TILES.map((tile) => {
              const isActive =
                tile.href === "/"
                  ? pathname === "/"
                  : pathname === tile.href || pathname.startsWith(`${tile.href}/`);

              return (
                <Link
                  key={tile.href}
                  href={tile.href}
                  className={`group flex flex-col items-center justify-center rounded-2xl py-3.5 px-2 transition-all duration-200 ${
                    isActive
                      ? "bg-[#25262e] text-white border border-white/15 shadow-xl ring-1 ring-white/10"
                      : "bg-[#141519]/70 text-slate-400 hover:bg-[#1a1b22] hover:text-white border border-white/5 hover:border-white/10"
                  }`}
                >
                  {/* Centered Icon on top */}
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-xl transition ${
                      isActive
                        ? "text-white"
                        : "text-slate-400 group-hover:text-white"
                    }`}
                  >
                    {tile.icon}
                  </div>

                  {/* Centered Label underneath */}
                  <span className="mt-1.5 text-xs font-bold tracking-tight text-center truncate w-full">
                    {tile.title}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* System operational status banner at bottom */}
          <div className="mt-auto pt-4 border-t border-white/5">
            <div className="rounded-xl bg-[#141519] border border-white/5 p-2 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="text-[9px] font-bold text-slate-300 truncate">
                  Cluster Online
                </div>
                <div className="text-[8px] text-slate-500">
                  99.98% SLA
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
