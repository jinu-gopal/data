"use client";

import { useState } from "react";
import Link from "next/link";
import { useMaxTheme, type MaxTheme } from "@/app/theme-provider";

type SettingsSection =
  | "appearance"
  | "preferences"
  | "shortcuts"
  | "proxy"
  | "system"
  | "about"
  | "support";

type ThemeOption = {
  id: MaxTheme;
  name: string;
  description: string;
  surface: string;
  panel: string;
  accent: string;
};

const themes: ThemeOption[] = [
  {
    id: "platinum",
    name: "Platinum",
    description: "Premium enterprise",
    surface: "#f7f9fc",
    panel: "#ffffff",
    accent: "#255be6",
  },
  {
    id: "obsidian",
    name: "Obsidian",
    description: "Professional dark",
    surface: "#080c14",
    panel: "#111722",
    accent: "#8b7cff",
  },
  {
    id: "arctic",
    name: "Arctic",
    description: "Clean modern",
    surface: "#effaff",
    panel: "#ffffff",
    accent: "#08a9d8",
  },
  {
    id: "midnight",
    name: "Midnight",
    description: "Executive navy",
    surface: "#08152e",
    panel: "#0f203d",
    accent: "#4e8cff",
  },
];

function ArrowLeft() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none">
      <path
        d="M15 10H5M9 6l-4 4 4 4"
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
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none">
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
        d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SlidersIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path
        d="M4 7h16M4 17h16"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle
        cx="9"
        cy="7"
        r="2"
        fill="currentColor"
      />
      <circle
        cx="15"
        cy="17"
        r="2"
        fill="currentColor"
      />
    </svg>
  );
}

function KeyboardIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
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

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <circle
        cx="12"
        cy="12"
        r="8.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M3.7 12h16.6M12 3.5c2.1 2.3 3.2 5.1 3.2 8.5S14.1 18.2 12 20.5M12 3.5C9.9 5.8 8.8 8.6 8.8 12s1.1 6.2 3.2 8.5"
        stroke="currentColor"
        strokeWidth="1.4"
      />
    </svg>
  );
}

function ServerIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <rect
        x="4"
        y="4"
        width="16"
        height="6"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <rect
        x="4"
        y="14"
        width="16"
        height="6"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M8 7h.01M8 17h.01"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
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
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <circle
        cx="12"
        cy="12"
        r="8.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M9.7 9a2.5 2.5 0 1 1 4 1.9c-.9.7-1.7 1.1-1.7 2.4M12 16.5h.01"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none">
      <path
        d="m4.5 10 3.2 3.2L15.5 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StatusDot() {
  return (
    <span className="relative flex h-2.5 w-2.5">
      <span className="absolute h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
      <span className="relative h-2.5 w-2.5 rounded-full bg-emerald-500" />
    </span>
  );
}

const navigation: Array<{
  id: SettingsSection;
  label: string;
  description: string;
  icon: React.ReactNode;
}> = [
  {
    id: "appearance",
    label: "Appearance",
    description: "Theme and visual preferences",
    icon: <SunIcon />,
  },
  {
    id: "preferences",
    label: "Preferences",
    description: "Workspace behaviour",
    icon: <SlidersIcon />,
  },
  {
    id: "shortcuts",
    label: "Keyboard shortcuts",
    description: "Commands and navigation",
    icon: <KeyboardIcon />,
  },
  {
    id: "proxy",
    label: "Proxy",
    description: "Network configuration",
    icon: <GlobeIcon />,
  },
  {
    id: "system",
    label: "System information",
    description: "Environment and platform status",
    icon: <ServerIcon />,
  },
  {
    id: "about",
    label: "About MAX ERP",
    description: "Platform information",
    icon: <InfoIcon />,
  },
  {
    id: "support",
    label: "Help & support",
    description: "Documentation and assistance",
    icon: <HelpIcon />,
  },
];

export default function SettingsPage() {
  const { theme, setTheme } = useMaxTheme();

  const [section, setSection] =
    useState<SettingsSection>("appearance");

  const activeTheme =
    themes.find((item) => item.id === theme) ?? themes[0];

  return (
    <div className="min-h-[calc(100vh-76px)]">

      {/* =====================================================
          HEADER
          ===================================================== */}

      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <Link
            href="/"
            className="mb-3 inline-flex items-center gap-2 text-[10px] font-bold text-[var(--max-text-muted)] transition hover:text-[var(--max-primary)]"
          >
            <ArrowLeft />
            Back to workspace
          </Link>

          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--max-primary)]">
            Workspace settings
          </div>

          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            Settings
          </h1>

          <p className="mt-1 max-w-2xl text-sm text-[var(--max-text-secondary)]">
            Configure your MAX ERP workspace, appearance,
            network environment and platform preferences.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-[var(--max-border)] bg-[var(--max-surface)] px-4 py-3 shadow-[var(--max-shadow-sm)]">

          <StatusDot />

          <div>
            <div className="text-[9px] font-bold uppercase tracking-wider text-[var(--max-text-muted)]">
              Platform
            </div>

            <div className="text-[11px] font-bold text-emerald-600">
              Operational
            </div>
          </div>

        </div>
      </div>

      {/* =====================================================
          SETTINGS WORKSPACE
          ===================================================== */}

      <div className="grid gap-6 lg:grid-cols-[285px_1fr]">

        {/* ===================================================
            SETTINGS NAVIGATION
            =================================================== */}

        <aside className="h-fit rounded-2xl border border-[var(--max-border)] bg-[var(--max-surface)] p-2 shadow-[var(--max-shadow-sm)]">

          <div className="px-3 pb-2 pt-3 text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--max-text-muted)]">
            Settings
          </div>

          {navigation.map((item) => {

            const active = section === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSection(item.id)}
                className={`
                  mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition
                  ${
                    active
                      ? "bg-[var(--max-primary-soft)] text-[var(--max-primary)]"
                      : "text-[var(--max-text-secondary)] hover:bg-[var(--max-surface-2)]"
                  }
                `}
              >

                <span
                  className={`
                    flex h-9 w-9 shrink-0 items-center justify-center rounded-lg
                    ${
                      active
                        ? "bg-[var(--max-primary)] text-white"
                        : "bg-[var(--max-surface-2)]"
                    }
                  `}
                >
                  {item.icon}
                </span>

                <span className="min-w-0 flex-1">

                  <span className="block text-[11px] font-bold">
                    {item.label}
                  </span>

                  <span className="mt-0.5 block truncate text-[8px] text-[var(--max-text-muted)]">
                    {item.description}
                  </span>

                </span>

                {active && (
                  <ChevronRight />
                )}

              </button>
            );
          })}

        </aside>

        {/* ===================================================
            CONTENT
            =================================================== */}

        <section className="min-w-0">

          {/* =================================================
              APPEARANCE
              ================================================= */}

          {section === "appearance" && (
            <div className="space-y-5">

              <div className="rounded-2xl border border-[var(--max-border)] bg-[var(--max-surface)] p-6 shadow-[var(--max-shadow-sm)]">

                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">

                  <div>
                    <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--max-primary)]">
                      Appearance
                    </div>

                    <h2 className="mt-1 text-xl font-bold">
                      Workspace theme
                    </h2>

                    <p className="mt-1 max-w-xl text-xs leading-5 text-[var(--max-text-secondary)]">
                      Choose the visual identity used throughout
                      the MAX ERP workspace.
                    </p>
                  </div>

                  <div className="rounded-full bg-[var(--max-primary-soft)] px-3 py-1.5 text-[9px] font-bold text-[var(--max-primary)]">
                    {activeTheme.name} active
                  </div>

                </div>

                <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                  {themes.map((item) => {

                    const active = item.id === theme;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setTheme(item.id)}
                        className={`
                          group overflow-hidden rounded-2xl border text-left transition
                          ${
                            active
                              ? "border-[var(--max-primary)] ring-2 ring-[var(--max-primary)]/15"
                              : "border-[var(--max-border)] hover:-translate-y-0.5 hover:border-[var(--max-primary)]"
                          }
                        `}
                      >

                        {/* VISUAL PREVIEW */}

                        <div
                          className="relative h-36 p-3"
                          style={{
                            background: item.surface,
                          }}
                        >

                          <div
                            className="h-full overflow-hidden rounded-xl border"
                            style={{
                              background: item.panel,
                              borderColor:
                                item.id === "platinum"
                                  ? "#dbe2ec"
                                  : `${item.accent}55`,
                            }}
                          >

                            {/* MINI TOPBAR */}

                            <div
                              className="flex h-7 items-center gap-1 border-b px-2"
                              style={{
                                borderColor:
                                  item.id === "platinum"
                                    ? "#e3e8ef"
                                    : `${item.accent}35`,
                              }}
                            >
                              <span
                                className="h-2 w-2 rounded-full"
                                style={{
                                  background: item.accent,
                                }}
                              />

                              <span
                                className="h-1.5 w-12 rounded-full"
                                style={{
                                  background:
                                    item.id === "platinum"
                                      ? "#cbd5e1"
                                      : `${item.accent}55`,
                                }}
                              />

                            </div>

                            {/* MINI BODY */}

                            <div className="flex h-[calc(100%-28px)]">

                              <div
                                className="w-[27%] border-r p-2"
                                style={{
                                  borderColor:
                                    item.id === "platinum"
                                      ? "#e3e8ef"
                                      : `${item.accent}35`,
                                }}
                              >
                                <div
                                  className="h-2 w-full rounded-full"
                                  style={{
                                    background: item.accent,
                                  }}
                                />

                                <div
                                  className="mt-2 h-1.5 w-4/5 rounded-full"
                                  style={{
                                    background:
                                      item.id === "platinum"
                                        ? "#cbd5e1"
                                        : `${item.accent}55`,
                                  }}
                                />

                                <div
                                  className="mt-2 h-1.5 w-3/5 rounded-full"
                                  style={{
                                    background:
                                      item.id === "platinum"
                                        ? "#cbd5e1"
                                        : `${item.accent}55`,
                                  }}
                                />
                              </div>

                              <div className="flex flex-1 gap-1.5 p-2">

                                <span
                                  className="flex-1 rounded-md border"
                                  style={{
                                    borderColor:
                                      item.id === "platinum"
                                        ? "#dbe2ec"
                                        : `${item.accent}40`,
                                  }}
                                />

                                <span
                                  className="flex-1 rounded-md border"
                                  style={{
                                    borderColor:
                                      item.id === "platinum"
                                        ? "#dbe2ec"
                                        : `${item.accent}40`,
                                  }}
                                />

                                <span
                                  className="flex-1 rounded-md border"
                                  style={{
                                    borderColor:
                                      item.id === "platinum"
                                        ? "#dbe2ec"
                                        : `${item.accent}40`,
                                  }}
                                />

                              </div>

                            </div>
                          </div>

                          {active && (
                            <div
                              className="absolute right-5 top-5 flex h-7 w-7 items-center justify-center rounded-full text-white shadow-lg"
                              style={{
                                background: item.accent,
                              }}
                            >
                              <CheckIcon />
                            </div>
                          )}

                        </div>

                        {/* THEME DETAILS */}

                        <div className="bg-[var(--max-surface)] p-4">

                          <div className="flex items-center justify-between">

                            <div>
                              <div className="text-xs font-bold">
                                {item.name}
                              </div>

                              <div className="mt-1 text-[9px] text-[var(--max-text-muted)]">
                                {item.description}
                              </div>
                            </div>

                            {active && (
                              <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[8px] font-bold text-emerald-600">
                                Active
                              </span>
                            )}

                          </div>

                        </div>
                      </button>
                    );
                  })}

                </div>

              </div>

              {/* ACTIVE THEME */}

              <div className="rounded-2xl border border-[var(--max-border)] bg-[var(--max-surface)] p-6 shadow-[var(--max-shadow-sm)]">

                <div className="flex items-center gap-4">

                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-xl text-white"
                    style={{
                      background: activeTheme.accent,
                    }}
                  >
                    <SunIcon />
                  </div>

                  <div className="flex-1">

                    <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--max-text-muted)]">
                      Current workspace appearance
                    </div>

                    <div className="mt-1 text-sm font-bold">
                      {activeTheme.name}
                    </div>

                    <div className="mt-1 text-[10px] text-[var(--max-text-secondary)]">
                      {activeTheme.description}
                    </div>

                  </div>

                  <div className="hidden items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-2 text-[9px] font-bold text-emerald-600 sm:flex">
                    <StatusDot />
                    Applied
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* =================================================
              PLACEHOLDER SETTINGS
              ================================================= */}

          {section !== "appearance" && (
            <div className="rounded-2xl border border-[var(--max-border)] bg-[var(--max-surface)] shadow-[var(--max-shadow-sm)]">

              <div className="border-b border-[var(--max-border-soft)] p-7">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--max-primary-soft)] text-[var(--max-primary)]">
                  {
                    navigation.find(
                      (item) => item.id === section
                    )?.icon
                  }
                </div>

                <div className="mt-5 text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--max-primary)]">
                  Settings
                </div>

                <h2 className="mt-1 text-2xl font-bold">
                  {
                    navigation.find(
                      (item) => item.id === section
                    )?.label
                  }
                </h2>

                <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--max-text-secondary)]">
                  {
                    navigation.find(
                      (item) => item.id === section
                    )?.description
                  }
                </p>

              </div>

              <div className="p-7">

                <div className="rounded-2xl border border-dashed border-[var(--max-border)] bg-[var(--max-surface-2)] p-8 text-center">

                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--max-surface)] text-[var(--max-primary)] shadow-sm">
                    {
                      navigation.find(
                        (item) => item.id === section
                      )?.icon
                    }
                  </div>

                  <h3 className="mt-4 text-sm font-bold">
                    Enterprise configuration coming next
                  </h3>

                  <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-[var(--max-text-secondary)]">
                    This section is reserved for the MAX ERP
                    platform configuration layer. We will connect
                    it to the real system configuration rather than
                    keeping it as a visual-only setting.
                  </p>

                  <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-2 text-[9px] font-bold text-amber-600">
                    Configuration module planned
                  </div>

                </div>

              </div>
            </div>
          )}

        </section>
      </div>
    </div>
  );
}