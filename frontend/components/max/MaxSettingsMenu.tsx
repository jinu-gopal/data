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
    id: "platinum",
    name: "Platinum",
    description: "Premium enterprise",
    icon: <SunIcon />,
  },
  {
    id: "obsidian",
    name: "Obsidian",
    description: "Professional dark",
    icon: <MoonIcon />,
  },
  {
    id: "arctic",
    name: "Arctic",
    description: "Clean modern",
    icon: <SnowIcon />,
  },
  {
    id: "midnight",
    name: "Midnight",
    description: "Executive navy",
    icon: <SparkleIcon />,
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
          flex h-11 items-center gap-2 rounded-xl border px-4
          text-[11px] font-bold transition
          ${
            open
              ? "border-[var(--max-primary)] bg-[var(--max-primary-soft)] text-[var(--max-primary)]"
              : "border-[var(--max-border)] bg-[var(--max-surface)] text-[var(--max-text)] hover:bg-[var(--max-surface-2)]"
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
        <div className="absolute right-0 top-full z-[300] mt-3 w-[360px] overflow-hidden rounded-2xl border border-[var(--max-border)] bg-[var(--max-surface)] shadow-[var(--max-shadow-lg)]">

          {/* HEADER */}

          <div className="border-b border-[var(--max-border-soft)] px-5 py-4">
            <div className="text-sm font-bold text-[var(--max-text)]">
              Settings
            </div>

            <div className="mt-1 text-[10px] text-[var(--max-text-muted)]">
              Workspace preferences and system controls
            </div>
          </div>

          {/* APPEARANCE */}

          <div className="border-b border-[var(--max-border-soft)] px-5 py-4">

            <div className="mb-3">
              <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--max-text-muted)]">
                Appearance
              </div>

              <div className="mt-1 text-xs font-semibold text-[var(--max-text)]">
                Choose your workspace theme
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">

              {themes.map((item) => {
                const active = theme === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => selectTheme(item.id)}
                    className={`
                      group relative overflow-hidden rounded-xl border p-2.5
                      text-left transition
                      ${
                        active
                          ? "border-[var(--max-primary)] bg-[var(--max-primary-soft)] ring-1 ring-[var(--max-primary)]"
                          : "border-[var(--max-border)] bg-[var(--max-surface-2)] hover:border-[var(--max-primary)]"
                      }
                    `}
                  >

                    {/* VISUAL PREVIEW */}

                    <div
                      className={`
                        relative h-[62px] overflow-hidden rounded-lg border
                        ${
                          item.id === "platinum"
                            ? "border-slate-200 bg-white"
                            : item.id === "obsidian"
                              ? "border-slate-700 bg-[#080c14]"
                              : item.id === "arctic"
                                ? "border-cyan-200 bg-[#f2fbff]"
                                : "border-blue-900 bg-[#0a1630]"
                        }
                      `}
                    >

                      <div className="absolute left-2 top-2 h-1.5 w-10 rounded-full bg-slate-300" />

                      <div
                        className={`
                          absolute left-2 top-6 h-1.5 w-7 rounded-full
                          ${
                            item.id === "arctic"
                              ? "bg-cyan-400"
                              : "bg-blue-500"
                          }
                        `}
                      />

                      <div className="absolute bottom-2 left-2 right-2 grid grid-cols-3 gap-1.5">
                        <span className="h-6 rounded border border-current opacity-20" />
                        <span className="h-6 rounded border border-current opacity-20" />
                        <span className="h-6 rounded border border-current opacity-20" />
                      </div>

                      {active && (
                        <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--max-primary)] text-white">
                          ✓
                        </span>
                      )}
                    </div>

                    <div className="mt-2 flex items-center gap-2">

                      <span
                        className={`
                          flex h-7 w-7 items-center justify-center rounded-lg
                          ${
                            active
                              ? "bg-[var(--max-primary)] text-white"
                              : "bg-[var(--max-surface)] text-[var(--max-text-secondary)]"
                          }
                        `}
                      >
                        {item.icon}
                      </span>

                      <span className="min-w-0">
                        <span className="block text-[11px] font-bold text-[var(--max-text)]">
                          {item.name}
                        </span>

                        <span className="block truncate text-[8px] text-[var(--max-text-muted)]">
                          {item.description}
                        </span>
                      </span>

                    </div>
                  </button>
                );
              })}

            </div>

            {/* ACTIVE THEME */}

            <div className="mt-3 flex items-center justify-between rounded-xl border border-[var(--max-border-soft)] bg-[var(--max-surface-2)] px-3 py-2.5">

              <div className="flex items-center gap-2">

                <span className="text-[var(--max-primary)]">
                  <SunIcon />
                </span>

                <div>
                  <div className="text-[8px] font-bold uppercase tracking-wider text-[var(--max-text-muted)]">
                    Active theme
                  </div>

                  <div className="text-[10px] font-bold text-[var(--max-text)]">
                    {themes.find((item) => item.id === theme)?.name}
                  </div>
                </div>

              </div>

              <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[8px] font-bold text-emerald-600">
                Applied
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