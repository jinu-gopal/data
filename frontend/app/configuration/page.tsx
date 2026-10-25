"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

function SearchIcon() {
  return (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function RecruitmentConfigIcon() {
  return (
    <svg
      className="h-6 w-6"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M21 13.26A23.93 23.93 0 0 1 12 15c-3.18 0-6.22-.62-9-1.74M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2m4 6h.01M5 20h14a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EcCoreConfigIcon() {
  return (
    <svg
      className="h-6 w-6"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="9"
        cy="7"
        r="4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      className="h-4 w-4 shrink-0"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 10h11M11 6l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function OrganizationStudioIcon() {
  return (
    <svg
      className="h-6 w-6"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-3"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 9v.01M9 12v.01M9 15v.01M9 18v.01M16 15v.01M16 18v.01"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ObjectIcon() {
  return (
    <svg
      className="h-6 w-6"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="4.5"
        y="4.5"
        width="15"
        height="15"
        rx="3"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M8.5 9h7M8.5 12h7M8.5 15h4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function FieldIcon() {
  return (
    <svg
      className="h-6 w-6"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 7.5A2.5 2.5 0 0 1 7.5 5h9A2.5 2.5 0 0 1 19 7.5v9a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 5 16.5v-9Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M8.5 9h7M8.5 12h4.5M8.5 15h6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function WorkflowIcon() {
  return (
    <svg
      className="h-6 w-6"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="4"
        y="4"
        width="6"
        height="6"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <rect
        x="14"
        y="14"
        width="6"
        height="6"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M10 7h4a4 4 0 0 1 4 4v3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="m15.5 12.5 2.5 2.5 2.5-2.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function RulesIcon() {
  return (
    <svg
      className="h-6 w-6"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6 5h12M6 12h12M6 19h12"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <circle cx="9" cy="5" r="1.8" fill="currentColor" />
      <circle cx="15" cy="12" r="1.8" fill="currentColor" />
      <circle cx="11" cy="19" r="1.8" fill="currentColor" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      className="h-6 w-6"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 3.5 19 6v5.4c0 4.3-2.8 7.8-7 9.1-4.2-1.3-7-4.8-7-9.1V6l7-2.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="m9 12 2 2 4-4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg
      className="h-6 w-6"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6.5 16.5h11l-1.2-1.8V10a4.3 4.3 0 0 0-8.6 0v4.7l-1.2 1.8Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M10 19h4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IntegrationIcon() {
  return (
    <svg
      className="h-6 w-6"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="7"
        cy="12"
        r="3"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <circle
        cx="17"
        cy="7"
        r="3"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <circle
        cx="17"
        cy="17"
        r="3"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="m9.7 10.7 4.5-2.4M9.7 13.3l4.5 2.4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg
      className="h-6 w-6"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PipelineIcon() {
  return (
    <svg
      className="h-6 w-6"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 16v1a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StatusDot() {
  return (
    <span className="relative flex h-2.5 w-2.5 shrink-0">
      <span className="pointer-events-none absolute h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
      <span className="relative h-2.5 w-2.5 rounded-full bg-emerald-500" />
    </span>
  );
}

const BUSINESS_OBJECTS_PATH = "/configuration/business-objects";
const ORGANIZATIONS_PATH = "/configuration/organizations";
const USERS_ACCESS_PATH = "/users";
const WORKFLOWS_PATH = "/configuration/workflows";
const RULES_PATH = "/configuration/rules";
const NOTIFICATIONS_PATH = "/configuration/notifications";
const DATA_PIPELINE_PATH = "/configuration/data-pipeline";
const INTEGRATIONS_PATH = "/integrations";
const AI_PATH = "/ai";
const LAYOUTS_PATH = "/configuration/layouts";
const FINANCE_PATH = "/configuration/finance";
const RECRUITMENT_PATH = "/configuration/recruitment";
const EC_CORE_PATH = "/configuration/ec-core";

interface ConfigurationArea {
  title: string;
  description: string;
  icon: () => React.JSX.Element;
  href: string;
  badge: string;
  tone: string;
  category: string;
  keywords: string;
}

const configurationAreas: ConfigurationArea[] = [
  {
    title: "Organization Structure",
    description:
      "Model multi-entity legal structures, corporate divisions, regional branches, and functional departments.",
    icon: OrganizationStudioIcon,
    href: ORGANIZATIONS_PATH,
    badge: "Structure",
    tone: "blue",
    category: "Core",
    keywords: "organization structure org chart entities branches departments hierarchy positions",
  },
  {
    title: "Business Objects",
    description:
      "Define the enterprise data objects that form the foundation of MAX ERP.",
    icon: ObjectIcon,
    href: BUSINESS_OBJECTS_PATH,
    badge: "Core",
    tone: "violet",
    category: "Core",
    keywords: "business objects data schema entities models tables records fields",
  },
  {
    title: "Fields",
    description:
      "Create configurable fields, validations, defaults and data behavior.",
    icon: FieldIcon,
    href: BUSINESS_OBJECTS_PATH,
    badge: "Data",
    tone: "violet",
    category: "Core",
    keywords: "fields custom columns validations picklists datatypes formulas",
  },
  {
    title: "Workflows",
    description:
      "Design approval flows, assignments, conditions and automated actions.",
    icon: WorkflowIcon,
    href: WORKFLOWS_PATH,
    badge: "Automation",
    tone: "emerald",
    category: "Automation",
    keywords: "workflows approvals transitions automation routing review sod",
  },
  {
    title: "Rules",
    description:
      "Define business rules that control enterprise behavior without code.",
    icon: RulesIcon,
    href: RULES_PATH,
    badge: "Logic",
    tone: "amber",
    category: "Automation",
    keywords: "rules engine logic decisions validation formulas conditions",
  },
  {
    title: "Users & Access",
    description:
      "Configure enterprise roles, RBAC permissions matrix, and user access policies.",
    icon: ShieldIcon,
    href: USERS_ACCESS_PATH,
    badge: "Security",
    tone: "rose",
    category: "Security",
    keywords: "users access security roles permissions rbac policies identity",
  },
  {
    title: "Recruiting & Talent",
    description:
      "Configure talent pipeline stages, SLA thresholds, Microsoft Teams Graph API integration, and email notification templates.",
    icon: RecruitmentConfigIcon,
    href: RECRUITMENT_PATH,
    badge: "ATS Setup",
    tone: "blue",
    category: "Talent",
    keywords: "recruiting talent pipeline stages sla microsoft teams graph api email notification templates offer letters background verification assessments",
  },
  {
    title: "Employee Central & Core HR",
    description:
      "Configure salary grade bands, numbering sequences, 5-tier org structure, custom field builder for people profiles, time-off accrual policies, and Hire-to-Retire gates.",
    icon: EcCoreConfigIcon,
    href: EC_CORE_PATH,
    badge: "EC Core",
    tone: "emerald",
    category: "Talent",
    keywords: "employee central core hr position management org structure people profile custom fields time off absence hire to retire onboarding offboarding salary bands",
  },
  {
    title: "Notifications",
    description:
      "Configure event-driven notifications and enterprise alerts.",
    icon: BellIcon,
    href: NOTIFICATIONS_PATH,
    badge: "Events",
    tone: "cyan",
    category: "Automation",
    keywords: "notifications alerts email events dispatch webhooks templates",
  },
  {
    title: "Data Pipeline",
    description:
      "Multi-object batch export, bulk ingestion job telemetry, and error inspector.",
    icon: PipelineIcon,
    href: DATA_PIPELINE_PATH,
    badge: "Pipeline",
    tone: "teal",
    category: "Core",
    keywords: "data pipeline etl ingestion export batch sync telemetry",
  },
  {
    title: "Integrations",
    description:
      "Connect MAX ERP with external systems through APIs and events.",
    icon: IntegrationIcon,
    href: INTEGRATIONS_PATH,
    badge: "Connect",
    tone: "indigo",
    category: "Automation",
    keywords: "integrations api webhooks rest endpoints connectors external",
  },
  {
    title: "MAX AI",
    description:
      "Use governed natural language to propose configuration changes.",
    icon: SparkleIcon,
    href: AI_PATH,
    badge: "AI",
    tone: "orange",
    category: "Core",
    keywords: "max ai natural language copilot llm assistant generator",
  },
  {
    title: "Form & Layouts",
    description:
      "Drag-and-drop form views, sections, role-based layouts, and responsive previews.",
    icon: ObjectIcon,
    href: LAYOUTS_PATH,
    badge: "Designer",
    tone: "violet",
    category: "Core",
    keywords: "layouts forms sections drag drop views visual designer",
  },
  {
    title: "Fiscal & Currencies",
    description:
      "Multi-currency exchange rates, fiscal quarters, lockout controls, and tax matrix.",
    icon: OrganizationStudioIcon,
    href: FINANCE_PATH,
    badge: "Finance",
    tone: "emerald",
    category: "Finance",
    keywords: "fiscal currencies forex exchange rates periods tax accounting",
  },
];

const toneClasses: Record<
  string,
  {
    icon: string;
    badge: string;
    glow: string;
  }
> = {
  blue: {
    icon: "bg-blue-50 text-blue-600",
    badge: "bg-blue-50 text-blue-600",
    glow: "bg-blue-100/70",
  },
  violet: {
    icon: "bg-violet-50 text-violet-600",
    badge: "bg-violet-50 text-violet-600",
    glow: "bg-violet-100/70",
  },
  emerald: {
    icon: "bg-emerald-50 text-emerald-600",
    badge: "bg-emerald-50 text-emerald-600",
    glow: "bg-emerald-100/70",
  },
  amber: {
    icon: "bg-amber-50 text-amber-600",
    badge: "bg-amber-50 text-amber-600",
    glow: "bg-amber-100/70",
  },
  rose: {
    icon: "bg-rose-50 text-rose-600",
    badge: "bg-rose-50 text-rose-600",
    glow: "bg-rose-100/70",
  },
  cyan: {
    icon: "bg-cyan-50 text-cyan-600",
    badge: "bg-cyan-50 text-cyan-600",
    glow: "bg-cyan-100/70",
  },
  indigo: {
    icon: "bg-indigo-50 text-indigo-600",
    badge: "bg-indigo-50 text-indigo-600",
    glow: "bg-indigo-100/70",
  },
  orange: {
    icon: "bg-orange-50 text-orange-600",
    badge: "bg-orange-50 text-orange-600",
    glow: "bg-orange-100/70",
  },
  teal: {
    icon: "bg-teal-50 text-teal-600",
    badge: "bg-teal-50 text-teal-600",
    glow: "bg-teal-100/70",
  },
};

export default function ConfigurationStudioPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  const filteredAreas = useMemo(() => {
    return configurationAreas.filter((area) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        area.title.toLowerCase().includes(q) ||
        area.description.toLowerCase().includes(q) ||
        area.badge.toLowerCase().includes(q) ||
        (area.keywords && area.keywords.toLowerCase().includes(q));

      const matchesCat =
        selectedCategory === "ALL" || area.category === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-slate-950">
      <div className="mx-auto max-w-[1600px] px-5 py-8 sm:px-8 lg:px-10">
        {/* HEADER */}
        <header className="relative z-20 mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-blue-600">
              MAX ERP
            </div>

            <h1 className="mt-1 text-2xl font-bold tracking-tight">
              Configuration Studio
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Design how your enterprise operates without changing the
              platform core.
            </p>
          </div>

          <div className="relative z-20 flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-emerald-600">
            <StatusDot />
            Configuration engine ready
          </div>
        </header>

        {/* HERO */}
        <section className="relative isolate overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_15px_50px_rgba(15,23,42,0.07)]">
          {/* DECORATIVE BACKGROUND ONLY */}
          <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-blue-100/60 blur-3xl" />

          <div className="pointer-events-none absolute bottom-[-160px] left-[30%] h-80 w-80 rounded-full bg-violet-100/50 blur-3xl" />

          {/* CONTENT LAYER */}
          <div className="relative z-10 grid gap-10 p-7 sm:p-9 lg:grid-cols-[1fr_440px] lg:p-11">
            {/* LEFT */}
            <div className="flex flex-col justify-center">
              <div className="relative z-20 flex w-fit items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.17em] text-blue-700">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                No-code enterprise configuration
              </div>

              <h2 className="relative z-20 mt-5 max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                Configure MAX ERP around{" "}
                <span className="text-blue-600">your business</span>
              </h2>

              <p className="relative z-20 mt-4 max-w-2xl text-sm leading-6 text-slate-500 sm:text-[15px]">
                Build your data model, business rules, workflows, permissions,
                notifications and integrations through configuration instead
                of custom application code.
              </p>

              <div className="relative z-30 mt-7 flex flex-wrap gap-3">
                <Link
                  href={BUSINESS_OBJECTS_PATH}
                  prefetch
                  aria-label="Open Business Objects"
                  className="relative z-30 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl active:translate-y-0"
                >
                  Open Business Objects
                  <ArrowIcon />
                </Link>

                <div className="relative z-20 inline-flex items-center rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 text-xs font-bold text-slate-500">
                  Draft configuration mode
                </div>
              </div>
            </div>

            {/* 3D CONFIGURATION VISUAL */}
            <div className="relative z-10 flex min-h-[330px] items-center justify-center overflow-hidden rounded-3xl bg-slate-950">
              {/* VISUAL BACKGROUND */}
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.24),transparent_58%)]" />

              <div
                className="pointer-events-none relative h-60 w-60"
                style={{ perspective: "900px" }}
              >
                {/* ORBIT 1 */}
                <div
                  className="pointer-events-none absolute left-1/2 top-1/2 h-56 w-56 rounded-full border border-blue-400/25"
                  style={{
                    transform:
                      "translate(-50%, -50%) rotateX(68deg) rotateZ(12deg)",
                  }}
                />

                {/* ORBIT 2 */}
                <div
                  className="pointer-events-none absolute left-1/2 top-1/2 h-48 w-48 rounded-full border border-violet-400/25"
                  style={{
                    transform:
                      "translate(-50%, -50%) rotateY(68deg) rotateZ(-15deg)",
                  }}
                />

                {/* ORBIT 3 */}
                <div
                  className="pointer-events-none absolute left-1/2 top-1/2 h-40 w-40 rounded-full border border-cyan-300/20"
                  style={{
                    transform:
                      "translate(-50%, -50%) rotateX(70deg) rotateY(25deg)",
                  }}
                />

                {/* GLOW */}
                <div className="pointer-events-none absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/20 blur-3xl" />

                {/* CORE */}
                <div
                  className="pointer-events-none absolute left-1/2 top-1/2 flex h-32 w-32 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[30px] border border-white/20 bg-white/10 shadow-[0_0_80px_rgba(59,130,246,0.35)] backdrop-blur-xl"
                  style={{
                    transform:
                      "translate(-50%, -50%) rotateX(8deg) rotateY(-8deg)",
                  }}
                >
                  <div className="text-center">
                    <div className="text-4xl font-black tracking-tighter text-white">
                      M
                    </div>

                    <div className="mt-1 text-[8px] font-bold uppercase tracking-[0.28em] text-blue-300">
                      CONFIG
                    </div>
                  </div>
                </div>

                {/* FLOATING NODES */}
                <div className="pointer-events-none absolute left-0 top-10 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-[9px] font-bold text-blue-200 backdrop-blur-md">
                  Objects
                </div>

                <div className="pointer-events-none absolute right-0 top-7 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-[9px] font-bold text-violet-200 backdrop-blur-md">
                  Fields
                </div>

                <div className="pointer-events-none absolute bottom-12 left-2 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-[9px] font-bold text-emerald-200 backdrop-blur-md">
                  Workflows
                </div>

                <div className="pointer-events-none absolute bottom-7 right-0 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-[9px] font-bold text-amber-200 backdrop-blur-md">
                  Rules
                </div>
              </div>

              {/* STATUS PANEL */}
              <div className="pointer-events-none absolute bottom-4 left-5 right-5 rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">
                      Configuration state
                    </div>

                    <div className="mt-1 text-xs font-bold text-white">
                      Changes remain in draft until published
                    </div>
                  </div>

                  <div className="rounded-full bg-amber-400/10 px-2.5 py-1 text-[9px] font-bold text-amber-300">
                    DRAFT
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION TITLE & SEARCH */}
        <section className="relative z-20 mt-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600">
                Configuration areas
              </div>

              <h2 className="mt-2 text-2xl font-bold tracking-tight">
                Enterprise configuration
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Each area controls a different part of the MAX ERP behavior model.
              </p>
            </div>

            <div className="text-xs font-semibold text-slate-500">
              Showing <span className="font-bold text-slate-900">{filteredAreas.length}</span> of {configurationAreas.length} areas
            </div>
          </div>

          {/* SEARCH AND CATEGORY FILTER BAR */}
          <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <SearchIcon />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search settings & configuration (e.g. recruitment, talent pipeline, teams, email templates, rules)..."
                className="w-full rounded-xl border-0 bg-slate-50/80 py-2.5 pl-10 pr-10 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-[11px] font-semibold text-slate-400 hover:text-slate-700"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1">
              {[
                { id: "ALL", label: "All" },
                { id: "Talent", label: "Talent & ATS" },
                { id: "Core", label: "Core Model" },
                { id: "Automation", label: "Automation" },
                { id: "Security", label: "Security" },
                { id: "Finance", label: "Finance" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                    selectedCategory === cat.id
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-slate-100/70 text-slate-600 hover:bg-slate-200/70"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* CONFIGURATION CARDS */}
        <section className="relative z-20 mt-6">
          {filteredAreas.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-xs">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                <SearchIcon />
              </div>
              <h3 className="mt-4 text-sm font-bold text-slate-900">No configuration settings found</h3>
              <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">
                No configuration module matched &ldquo;{searchQuery}&rdquo;. Try searching for &ldquo;recruiting&rdquo;, &ldquo;pipeline&rdquo;, &ldquo;teams&rdquo;, &ldquo;workflows&rdquo;, or &ldquo;rules&rdquo;.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("ALL");
                }}
                className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition"
              >
                Reset Search & Filters
              </button>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {filteredAreas.map((area) => {
                const Icon = area.icon;
                const tone = toneClasses[area.tone] || toneClasses.blue;

                return (
                  <Link
                    key={area.title}
                    href={area.href}
                    prefetch
                    aria-label={`Configure ${area.title}`}
                    className="group relative z-20 block cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    {/* DECORATIVE GLOW */}
                    <div
                      className={`pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full blur-sm transition duration-300 group-hover:scale-125 ${tone.glow}`}
                    />

                    <div className="relative z-10">
                      <div className="flex items-center justify-between">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-xl ${tone.icon}`}
                        >
                          <Icon />
                        </div>

                        <span
                          className={`rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider ${tone.badge}`}
                        >
                          {area.badge}
                        </span>
                      </div>

                      <h3 className="mt-6 text-base font-bold text-slate-900">{area.title}</h3>

                      <p className="mt-2 min-h-[58px] text-xs leading-5 text-slate-500">
                        {area.description}
                      </p>

                      <div className="mt-5 flex items-center gap-2 text-xs font-bold text-slate-700 transition-all group-hover:gap-3 group-hover:text-blue-600">
                        Configure
                        <ArrowIcon />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* LOWER CONTENT */}
        <section className="relative z-20 mt-8 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          {/* LIFECYCLE */}
          <div className="relative z-20 rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-5">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                Governance
              </div>

              <h2 className="mt-1 text-lg font-bold">
                Configuration lifecycle
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                MAX ERP keeps configuration changes controlled and auditable.
              </p>
            </div>

            <div className="grid gap-3 p-6 sm:grid-cols-4">
              <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                <div className="text-[9px] font-bold uppercase tracking-wider text-blue-600">
                  01
                </div>

                <div className="mt-3 text-xs font-bold">Design</div>

                <p className="mt-1 text-[10px] leading-4 text-slate-500">
                  Define the required configuration.
                </p>
              </div>

              <div className="rounded-xl border border-violet-100 bg-violet-50/60 p-4">
                <div className="text-[9px] font-bold uppercase tracking-wider text-violet-600">
                  02
                </div>

                <div className="mt-3 text-xs font-bold">Validate</div>

                <p className="mt-1 text-[10px] leading-4 text-slate-500">
                  Check dependencies and behavior.
                </p>
              </div>

              <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-4">
                <div className="text-[9px] font-bold uppercase tracking-wider text-amber-600">
                  03
                </div>

                <div className="mt-3 text-xs font-bold">Approve</div>

                <p className="mt-1 text-[10px] leading-4 text-slate-500">
                  Review changes before publication.
                </p>
              </div>

              <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
                <div className="text-[9px] font-bold uppercase tracking-wider text-emerald-600">
                  04
                </div>

                <div className="mt-3 text-xs font-bold">Publish</div>

                <p className="mt-1 text-[10px] leading-4 text-slate-500">
                  Activate the approved version.
                </p>
              </div>
            </div>
          </div>

          {/* MAX AI */}
          <div className="relative z-20 overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
            <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-blue-500/20 blur-3xl" />

            <div className="relative z-10">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-blue-300">
                <SparkleIcon />
                MAX AI
              </div>

              <h2 className="mt-5 text-lg font-bold">
                Configure with natural language
              </h2>

              <p className="mt-2 text-xs leading-5 text-slate-400">
                Describe the business change you need. MAX AI can later
                propose the configuration, show its impact and prepare it for
                approval.
              </p>

              <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                  Example
                </div>

                <p className="mt-2 text-xs leading-5 text-slate-300">
                  “Add a mandatory customer GST number and validate its format
                  for Indian customers.”
                </p>
              </div>

              <div className="mt-5 flex items-center gap-2 text-[10px] font-bold text-amber-300">
                <span className="rounded-full bg-amber-400/10 px-2 py-1">
                  Planned capability
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}