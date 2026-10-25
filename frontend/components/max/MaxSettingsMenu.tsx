"use client";

import { useState } from "react";
import { useMaxTheme, type MaxTheme } from "@/app/theme-provider";

function SettingsIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[17px] w-[17px]"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="3"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M19 12a7 7 0 0 1-.5 2.6l1.6 1.4-2.1 2.1-1.5-1.5A7 7 0 0 1 14 19l-.2 2h-3l-.2-2a7 7 0 0 1-2.5-1.4l-1.5 1.5-2.1-2.1 1.6-1.4A7 7 0 0 1 5.6 12L4 10.7l2.1-2.1 1.5 1.4A7 7 0 0 1 10.6 8L11 5h3l.4 3a7 7 0 0 1 2.5 2l1.5-1.4 2.1 2.1L19 12Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <circle
        cx="12"
        cy="12"
        r="3.5"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path
        d="M20 15.5A8.5 8.5 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SnowIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path
        d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9M8.5 5.1 12 7l3.5-1.9M8.5 18.9 12 17l3.5 1.9"
        stroke="currentColor"
        strokeWidth="1.45"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path
        d="m12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EmeraldIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path
        d="M6 3h12l4 6-10 12L2 9l4-6Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M2 9h20M12 21 8.5 9 10 3M12 21l3.5-12L14 3"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AmethystIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path
        d="M12 2 3 7v10l9 5 9-5V7l-9-5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M12 22V12M12 12 3 7M12 12l9-5M7.5 4.5l9 5M4.5 14.5l7.5 4.5 7.5-4.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronDown() {
  return (
    <svg
      viewBox="0 0 20 20"
      className="h-3.5 w-3.5"
      fill="none"
    >
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

function ChevronRight() {
  return (
    <svg
      viewBox="0 0 20 20"
      className="h-3.5 w-3.5"
      fill="none"
    >
      <path
        d="m7.5 5 5 5-5 5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PreferencesIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
      <path
        d="M4 7h16M4 17h16M9 4v6M15 14v6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="9" cy="7" r="2" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="15" cy="17" r="2" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function KeyboardIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
      <rect
        x="3"
        y="6"
        width="18"
        height="12"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M7 10h.01M10 10h.01M13 10h.01M16 10h.01M7 14h10"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ProxyIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
      <circle
        cx="12"
        cy="12"
        r="8.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M3.8 12h16.4M12 3.5c2.1 2.3 3.2 5.1 3.2 8.5S14.1 18.2 12 20.5M12 3.5C9.9 5.8 8.8 8.6 8.8 12s1.1 6.2 3.2 8.5"
        stroke="currentColor"
        strokeWidth="1.4"
      />
    </svg>
  );
}

function SystemIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
      <rect
        x="4"
        y="4"
        width="16"
        height="16"
        rx="3"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M8 9h8M8 12h8M8 15h5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
      <circle
        cx="12"
        cy="12"
        r="8.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M12 11v5M12 8h.01"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function HelpIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
      <circle
        cx="12"
        cy="12"
        r="8.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M9.8 9a2.4 2.4 0 1 1 3.9 1.8c-.9.7-1.7 1.1-1.7 2.4M12 16.5h.01"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

type ThemeOption = {
  id: MaxTheme;
  name: string;
  description: string;
  icon: React.ReactNode;
};

const themes: ThemeOption[] = [
  {
    id: "obsidian",
    name: "Imperial Obsidian",
    description: "Royal Dark • Velvet Onyx & Slate",
    icon: <MoonIcon />,
  },
  {
    id: "platinum",
    name: "Imperial Platinum",
    description: "Royal Light • Alabaster & Sapphire",
    icon: <SunIcon />,
  },
  {
    id: "midnight",
    name: "Command Midnight",
    description: "Royal Navy • Deep Space Azure",
    icon: <SparkleIcon />,
  },
  {
    id: "emerald",
    name: "Emerald Sovereign",
    description: "Royal Malachite • Swiss Wealth & Gold",
    icon: <EmeraldIcon />,
  },
  {
    id: "amethyst",
    name: "Royal Amethyst",
    description: "Imperial Velvet • Violet & Rose Gold",
    icon: <AmethystIcon />,
  },
  {
    id: "arctic",
    name: "Nordic Arctic",
    description: "Royal Glacier • Opal & Frost Azure",
    icon: <SnowIcon />,
  },
];

export default function MaxSettingsMenu() {
  const { theme, setTheme } = useMaxTheme();

  const [open, setOpen] = useState(false);

  function selectTheme(nextTheme: MaxTheme) {
    setTheme(nextTheme);
  }

  return (
    <div className="relative">

      {/* SETTINGS BUTTON */}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={`
          flex h-9 items-center gap-1.5 rounded-xl border px-2.5 sm:px-3
          text-xs font-semibold transition shadow-2xs cursor-pointer
          ${
            open
              ? "border-blue-500 bg-blue-50/80 text-blue-700"
              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900"
          }
        `}
      >
        <SettingsIcon />

        <span className="hidden sm:block">
          Settings
        </span>

        <ChevronDown />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-[300] mt-2 w-[380px] overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-2xl">

          {/* HEADER */}

          <div className="border-b border-slate-100 bg-slate-50 px-5 py-3.5">
            <div className="text-sm font-bold text-slate-900">
              Settings
            </div>

            <div className="mt-0.5 text-[10px] text-slate-500">
              Workspace preferences & appearance
            </div>
          </div>

          {/* APPEARANCE */}

          <div className="border-b border-slate-100 px-5 py-3.5">

            <div className="mb-3">
              <div className="text-[9px] font-mono font-bold uppercase tracking-[0.18em] text-slate-500">
                Appearance (6 Themes)
              </div>

              <div className="mt-0.5 text-xs font-semibold text-slate-900">
                Choose your workspace theme
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">

              {themes.map((item) => {
                const active = theme === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => selectTheme(item.id)}
                    className={`
                      group relative overflow-hidden rounded-xl border p-2
                      text-left transition cursor-pointer
                      ${
                        active
                          ? "border-blue-500 bg-blue-50/60 ring-1 ring-blue-500 shadow-2xs"
                          : "border-slate-200 bg-slate-50/70 hover:border-slate-300 hover:bg-slate-100/70"
                      }
                    `}
                  >

                    {/* REALISTIC MINI WINDOW PREVIEW */}

                    <div
                      className={`
                        relative h-[56px] overflow-hidden rounded-lg border
                        ${
                          item.id === "platinum"
                            ? "border-slate-300 bg-[#f8fafc]"
                            : item.id === "obsidian"
                              ? "border-zinc-800 bg-[#0c0d10]"
                              : item.id === "midnight"
                                ? "border-blue-950 bg-[#030712]"
                                : item.id === "emerald"
                                  ? "border-emerald-950 bg-[#050e09]"
                                  : item.id === "amethyst"
                                    ? "border-purple-950 bg-[#090611]"
                                    : "border-sky-200 bg-[#eef5fb]"
                        }
                      `}
                    >

                      {/* Top bar preview */}
                      <div className="absolute top-0 left-0 right-0 h-3 border-b border-white/5 flex items-center px-1.5 gap-0.5">
                        <span className="h-1 w-1 rounded-full bg-[#ff5f56]" />
                        <span className="h-1 w-1 rounded-full bg-[#ffbd2e]" />
                        <span className="h-1 w-1 rounded-full bg-[#27c93f]" />
                      </div>

                      {/* Left rail & main card blocks */}
                      <div className="absolute top-3 left-0 bottom-0 w-3 border-r border-white/5 flex flex-col items-center pt-1 gap-1">
                        <span className="h-1 w-1.5 rounded-xs bg-white/20" />
                        <span className="h-1 w-1.5 rounded-xs bg-white/20" />
                      </div>

                      <div className="absolute top-4 left-4 right-1.5 bottom-1 flex gap-1">
                        <div className="flex-1 rounded border border-white/5 bg-white/5 p-1 flex flex-col justify-end">
                          <span
                            className={`h-2 rounded-xs ${
                              item.id === "emerald"
                                ? "bg-emerald-500"
                                : item.id === "amethyst"
                                  ? "bg-purple-500"
                                  : item.id === "arctic"
                                    ? "bg-cyan-400"
                                    : item.id === "obsidian"
                                      ? "bg-sky-400"
                                      : item.id === "midnight"
                                        ? "bg-sky-500"
                                        : "bg-blue-600"
                            }`}
                          />
                        </div>

                        <div className="flex-1 rounded border border-white/5 bg-white/5 p-1 flex items-center justify-center">
                          <span className="h-3 w-3 rounded-full border border-white/20" />
                        </div>
                      </div>

                      {active && (
                        <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-white text-black font-bold text-[9px] shadow-sm">
                          ✓
                        </span>
                      )}
                    </div>

                    <div className="mt-2 flex items-center gap-2">

                      <span
                        className={`
                          flex h-6 w-6 items-center justify-center rounded-lg text-xs
                          ${
                            active
                              ? "bg-blue-600 text-white font-bold"
                              : "bg-slate-200/80 text-slate-700"
                          }
                        `}
                      >
                        {item.icon}
                      </span>

                      <span className="min-w-0">
                        <span className="block truncate text-[11px] font-bold text-slate-900">
                          {item.name}
                        </span>

                        <span className="block truncate text-[8px] text-slate-500">
                          {item.description}
                        </span>
                      </span>

                    </div>
                  </button>
                );
              })}

            </div>

            {/* ACTIVE THEME ROW */}

            <div className="mt-3 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">

              <div className="flex items-center gap-2">

                <span className="text-blue-600">
                  {themes.find((item) => item.id === theme)?.icon ?? <SunIcon />}
                </span>

                <div>
                  <div className="text-[8px] font-mono font-bold uppercase tracking-wider text-slate-500">
                    Active theme
                  </div>

                  <div className="text-[10px] font-bold text-slate-900">
                    {themes.find((item) => item.id === theme)?.name}
                  </div>
                </div>

              </div>

              <span className="rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-[8px] font-mono font-bold text-blue-700">
                ACTIVE
              </span>

            </div>
          </div>

          {/* SYSTEM SETTINGS */}

          <div className="p-2">

            <div className="px-3 py-2 text-[8px] font-bold uppercase tracking-[0.18em] text-[var(--max-text-muted)]">
              System & preferences
            </div>

            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-[var(--max-surface-2)]"
            >
              <span className="text-[var(--max-text-secondary)]">
                <PreferencesIcon />
              </span>

              <span className="flex-1">
                <span className="block text-[10px] font-bold text-[var(--max-text)]">
                  Preferences
                </span>
                <span className="block text-[8px] text-[var(--max-text-muted)]">
                  Interface and display settings
                </span>
              </span>

              <ChevronRight />
            </button>

            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-[var(--max-surface-2)]"
            >
              <span className="text-[var(--max-text-secondary)]">
                <KeyboardIcon />
              </span>

              <span className="flex-1">
                <span className="block text-[10px] font-bold text-[var(--max-text)]">
                  Keyboard shortcuts
                </span>
                <span className="block text-[8px] text-[var(--max-text-muted)]">
                  View and customize shortcuts
                </span>
              </span>

              <ChevronRight />
            </button>

            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-[var(--max-surface-2)]"
            >
              <span className="text-[var(--max-text-secondary)]">
                <ProxyIcon />
              </span>

              <span className="flex-1">
                <span className="block text-[10px] font-bold text-[var(--max-text)]">
                  Proxy
                </span>
                <span className="block text-[8px] text-[var(--max-text-muted)]">
                  Network and proxy configuration
                </span>
              </span>

              <ChevronRight />
            </button>

            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-[var(--max-surface-2)]"
            >
              <span className="text-[var(--max-text-secondary)]">
                <SystemIcon />
              </span>

              <span className="flex-1">
                <span className="block text-[10px] font-bold text-[var(--max-text)]">
                  System information
                </span>
                <span className="block text-[8px] text-[var(--max-text-muted)]">
                  Version, environment and health
                </span>
              </span>

              <ChevronRight />
            </button>

            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-[var(--max-surface-2)]"
            >
              <span className="text-[var(--max-text-secondary)]">
                <InfoIcon />
              </span>

              <span className="flex-1">
                <span className="block text-[10px] font-bold text-[var(--max-text)]">
                  About MAX ERP
                </span>
                <span className="block text-[8px] text-[var(--max-text-muted)]">
                  Platform information
                </span>
              </span>

              <ChevronRight />
            </button>

            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-[var(--max-surface-2)]"
            >
              <span className="text-[var(--max-text-secondary)]">
                <HelpIcon />
              </span>

              <span className="flex-1">
                <span className="block text-[10px] font-bold text-[var(--max-text)]">
                  Help & support
                </span>
                <span className="block text-[8px] text-[var(--max-text-muted)]">
                  Documentation and support
                </span>
              </span>

              <ChevronRight />
            </button>

          </div>
        </div>
      )}
    </div>
  );
}