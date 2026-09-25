"use client";

import { useEffect, useRef, useState } from "react";
import {
  useMaxTheme,
  type MaxTheme,
} from "./theme-provider";

const themes: {
  id: MaxTheme;
  name: string;
  description: string;
  icon: "platinum" | "obsidian" | "arctic" | "midnight";
}[] = [
  {
    id: "platinum",
    name: "Platinum",
    description: "Premium enterprise",
    icon: "platinum",
  },
  {
    id: "obsidian",
    name: "Obsidian",
    description: "Professional dark",
    icon: "obsidian",
  },
  {
    id: "arctic",
    name: "Arctic",
    description: "Clean modern",
    icon: "arctic",
  },
  {
    id: "midnight",
    name: "Midnight",
    description: "Executive navy",
    icon: "midnight",
  },
];

function ThemeIcon({ theme }: { theme: MaxTheme }) {
  if (theme === "platinum") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
        <circle
          cx="12"
          cy="12"
          r="4"
          stroke="currentColor"
          strokeWidth="1.7"
        />
        <path
          d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (theme === "obsidian") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
        <path
          d="M20 15.2A8.4 8.4 0 0 1 8.8 4a8.5 8.5 0 1 0 11.2 11.2Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (theme === "arctic") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
        <path
          d="M7 18h10a4 4 0 0 0 .7-7.94A6 6 0 0 0 6.05 9.2 4.5 4.5 0 0 0 7 18Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path
        d="M12 2.8 14 9l6.2 2-6.2 2-2 6.2-2-6.2-6.2-2L9.8 9 12 2.8Z"
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

function ThemePreview({
  theme,
  active,
}: {
  theme: MaxTheme;
  active: boolean;
}) {
  const configs = {
    platinum: {
      background: "bg-[#f4f6f9]",
      border: "border-slate-200",
      sidebar: "bg-white",
      line: "bg-slate-300",
      activeLine: "bg-blue-500",
      card: "bg-white",
      cardBorder: "border-slate-200",
      check: "bg-blue-600",
    },
    obsidian: {
      background: "bg-[#090d13]",
      border: "border-slate-700",
      sidebar: "bg-[#0c131c]",
      line: "bg-slate-600",
      activeLine: "bg-blue-500",
      card: "bg-[#111821]",
      cardBorder: "border-slate-700",
      check: "bg-blue-500",
    },
    arctic: {
      background: "bg-gradient-to-br from-sky-50 via-white to-cyan-50",
      border: "border-sky-200",
      sidebar: "bg-white/80",
      line: "bg-sky-200",
      activeLine: "bg-sky-500",
      card: "bg-white/90",
      cardBorder: "border-sky-100",
      check: "bg-sky-600",
    },
    midnight: {
      background:
        "bg-gradient-to-br from-[#0a1220] via-[#0d1a2c] to-[#111f35]",
      border: "border-blue-900/70",
      sidebar: "bg-[#0b1524]",
      line: "bg-slate-600",
      activeLine: "bg-blue-400",
      card: "bg-[#111d2e]",
      cardBorder: "border-blue-900/70",
      check: "bg-blue-500",
    },
  };

  const config = configs[theme];

  return (
    <div
      className={`relative h-[82px] overflow-hidden rounded-xl border ${config.background} ${config.border}`}
    >
      <div
        className={`absolute left-0 top-0 h-full w-[24%] border-r ${config.border} ${config.sidebar}`}
      />

      <div
        className={`absolute left-2 top-3 h-1.5 w-8 rounded-full ${config.line}`}
      />

      <div
        className={`absolute left-2 top-7 h-1.5 w-6 rounded-full ${config.activeLine}`}
      />

      <div
        className={`absolute left-2 top-11 h-1.5 w-7 rounded-full ${config.line}`}
      />

      <div
        className={`absolute left-[31%] right-3 top-3 h-3 rounded-md ${config.card}`}
      />

      <div className="absolute bottom-3 left-[31%] right-3 grid grid-cols-3 gap-1.5">
        <div
          className={`h-9 rounded-md border ${config.cardBorder} ${config.card}`}
        />
        <div
          className={`h-9 rounded-md border ${config.cardBorder} ${config.card}`}
        />
        <div
          className={`h-9 rounded-md border ${config.cardBorder} ${config.card}`}
        />
      </div>

      {active && (
        <div
          className={`absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full ${config.check} text-[9px] font-bold text-white`}
        >
          ✓
        </div>
      )}
    </div>
  );
}

export default function ThemeSettings() {
  const { theme, setTheme } = useMaxTheme();

  const [open, setOpen] = useState(false);

  const containerRef =
    useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(
          event.target as Node
        )
      ) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener(
        "mousedown",
        handleOutsideClick
      );
    }

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, [open]);

  const selectedTheme =
    themes.find((item) => item.id === theme) ??
    themes[0];

  return (
    <div
      ref={containerRef}
      className="relative z-[200]"
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="true"
        className="group flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-slate-50 to-blue-50 text-blue-600">
          <svg
            viewBox="0 0 24 24"
            className={`h-4 w-4 transition-transform duration-300 ${
              open ? "rotate-90" : ""
            }`}
            fill="none"
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
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
          </svg>
        </span>

        <span className="hidden sm:block">
          Settings
        </span>

        <span className="text-[9px] text-slate-400">
          {open ? "▲" : "▼"}
        </span>
      </button>

      {open && (
        <div
          className="absolute right-0 top-full z-[300] mt-3 w-[390px] overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.18)]"
          onClick={(event) =>
            event.stopPropagation()
          }
        >
          <div className="relative overflow-hidden border-b border-slate-700 bg-[#101722] px-6 py-5 text-white">
            <div className="absolute -right-10 -top-16 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />

            <div className="relative flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/10">
                <span className="text-lg">✦</span>
              </div>

              <div>
                <div className="text-sm font-bold tracking-tight">
                  MAX ERP Appearance
                </div>

                <div className="mt-1 text-[10px] text-slate-400">
                  Enterprise workspace personalization
                </div>
              </div>
            </div>
          </div>

          <div className="p-5">
            <div className="mb-4 flex items-end justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  Visual system
                </div>

                <div className="mt-1 text-sm font-bold text-slate-800">
                  Choose your workspace
                </div>
              </div>

              <div className="rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-bold text-slate-500">
                {selectedTheme.name}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {themes.map((item) => {
                const active =
                  item.id === theme;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setTheme(item.id);
                      setOpen(false);
                    }}
                    className={`group relative cursor-pointer overflow-hidden rounded-2xl border p-2.5 text-left transition-all duration-200 ${
                      active
                        ? "border-blue-500 bg-blue-50 shadow-md shadow-blue-500/10"
                        : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                    }`}
                  >
                    <ThemePreview
                      theme={item.id}
                      active={active}
                    />

                    <div className="mt-3 flex items-center gap-2">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                          item.id === "platinum"
                            ? "bg-slate-100 text-slate-700"
                            : item.id === "obsidian"
                              ? "bg-slate-900 text-blue-400"
                              : item.id === "arctic"
                                ? "bg-sky-100 text-sky-600"
                                : "bg-blue-950 text-blue-300"
                        }`}
                      >
                        <ThemeIcon
                          theme={item.id}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-slate-800">
                          {item.name}
                        </div>

                        <div className="mt-0.5 truncate text-[9px] text-slate-500">
                          {item.description}
                        </div>
                      </div>
                    </div>

                    {active && (
                      <div className="absolute bottom-2.5 right-2.5 rounded-full bg-blue-600 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white">
                        Active
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-slate-100 bg-slate-50 px-5 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
                  <ThemeIcon theme={theme} />
                </div>

                <div>
                  <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                    Active theme
                  </div>

                  <div className="mt-0.5 text-xs font-bold text-slate-700">
                    {selectedTheme.name}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-bold text-emerald-600">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Applied
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}