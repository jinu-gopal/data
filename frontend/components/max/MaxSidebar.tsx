"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
};

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[19px] w-[19px]" fill="none">
      <path
        d="m4 10 8-7 8 7v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-9Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M9 21v-6h6v6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function OperationsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[19px] w-[19px]" fill="none">
      <rect
        x="4"
        y="4"
        width="16"
        height="16"
        rx="3"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M8 9h8M8 13h5M8 17h3"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ConfigurationIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[19px] w-[19px]" fill="none">
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

function ObjectsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[19px] w-[19px]" fill="none">
      <rect
        x="5"
        y="5"
        width="14"
        height="14"
        rx="3"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M9 9h6M9 12h6M9 15h4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[19px] w-[19px]" fill="none">
      <circle
        cx="12"
        cy="8"
        r="3"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M6 19a6 6 0 0 1 12 0"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function AIIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[19px] w-[19px]" fill="none">
      <path
        d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z"
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

function IntegrationIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[19px] w-[19px]" fill="none">
      <circle
        cx="6"
        cy="12"
        r="2.5"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <circle
        cx="18"
        cy="7"
        r="2.5"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <circle
        cx="18"
        cy="17"
        r="2.5"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="m8.2 11 7.4-3M8.2 13l7.4 3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SecurityIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[19px] w-[19px]" fill="none">
      <path
        d="M12 3 19 6v5c0 4.7-2.8 8-7 10-4.2-2-7-5.3-7-10V6l7-3Z"
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

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[19px] w-[19px]" fill="none">
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

function ChevronIcon({
  collapsed,
}: {
  collapsed: boolean;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-4 w-4 transition-transform duration-300 ${
        collapsed ? "rotate-180" : ""
      }`}
      fill="none"
    >
      <path
        d="m15 18-6-6 6-6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path
        d="M5 7h14M5 12h14M5 17h14"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

const primaryNavigation: NavItem[] = [
  {
    label: "Home",
    href: "/",
    icon: <HomeIcon />,
  },
  {
    label: "Operations",
    href: "/operations",
    icon: <OperationsIcon />,
  },
];

const configurationNavigation: NavItem[] = [
  {
    label: "Configuration",
    href: "/configuration",
    icon: <ConfigurationIcon />,
  },
  {
    label: "Business Objects",
    href: "/configuration/business-objects",
    icon: <ObjectsIcon />,
  },
  {
    label: "Users & Access",
    href: "/users",
    icon: <UsersIcon />,
    badge: "Soon",
  },
];

const platformNavigation: NavItem[] = [
  {
    label: "MAX AI",
    href: "/ai",
    icon: <AIIcon />,
    badge: "AI",
  },
  {
    label: "Integrations",
    href: "/integrations",
    icon: <IntegrationIcon />,
    badge: "Soon",
  },
  {
    label: "Security",
    href: "/security",
    icon: <SecurityIcon />,
    badge: "Soon",
  },
];

function NavigationItem({
  item,
  collapsed,
  pathname,
}: {
  item: NavItem;
  collapsed: boolean;
  pathname: string;
}) {
  const isActive =
    item.href === "/"
      ? pathname === "/"
      : pathname === item.href ||
        pathname.startsWith(`${item.href}/`);

  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      className={`group relative flex h-11 items-center gap-3 rounded-xl px-3 text-[12px] font-semibold transition-all duration-200 ${
        collapsed
          ? "justify-center"
          : ""
      } ${
        isActive
          ? "bg-[var(--max-primary-soft)] text-[var(--max-primary)] shadow-sm"
          : "text-[var(--max-text-secondary)] hover:bg-[var(--max-surface-3)] hover:text-[var(--max-text)]"
      }`}
    >
      {isActive && (
        <span className="absolute left-0 top-2.5 h-6 w-[3px] rounded-r-full bg-[var(--max-primary)]" />
      )}

      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition ${
          isActive
            ? "bg-[var(--max-primary)] text-white shadow-sm"
            : "bg-transparent"
        }`}
      >
        {item.icon}
      </span>

      {!collapsed && (
        <>
          <span className="min-w-0 flex-1 truncate">
            {item.label}
          </span>

          {item.badge && (
            <span
              className={`rounded-full px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider ${
                item.badge === "AI"
                  ? "bg-violet-100 text-violet-600"
                  : "bg-[var(--max-surface-3)] text-[var(--max-text-muted)]"
              }`}
            >
              {item.badge}
            </span>
          )}
        </>
      )}
    </Link>
  );
}

export default function MaxSidebar() {
  const pathname = usePathname();

  const [collapsed, setCollapsed] =
    useState(false);

  return (
    <aside
      className={`fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-[var(--max-border)] bg-[var(--max-sidebar)] transition-all duration-300 ${
        collapsed ? "w-[78px]" : "w-[258px]"
      }`}
    >
      {/* ===================================================
          BRAND
          =================================================== */}

      <div
        className={`flex h-[76px] shrink-0 items-center border-b border-[var(--max-border-soft)] ${
          collapsed
            ? "justify-center px-3"
            : "px-5"
        }`}
      >
        <Link
          href="/"
          className="flex items-center gap-3"
        >
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-950 text-white shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/40 to-transparent" />

            <span className="relative text-sm font-black">
              M
            </span>
          </div>

          {!collapsed && (
            <div className="min-w-0">
              <div className="text-[17px] font-black tracking-tight text-[var(--max-text)]">
                MAX <span className="text-[var(--max-primary)]">ERP</span>
              </div>

              <div className="text-[8px] font-bold uppercase tracking-[0.22em] text-[var(--max-text-muted)]">
                Enterprise Platform
              </div>
            </div>
          )}
        </Link>
      </div>

        {/* ===================================================
            NAVIGATION
            =================================================== */}

      {/* ===================================================
          NAVIGATION
          =================================================== */}

      <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-5">

        {/* MAIN */}

        <div className="mb-6">
          {!collapsed && (
            <div className="mb-2 px-3 text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--max-text-muted)]">
              Workspace
            </div>
          )}

          <div className="space-y-1">
            {primaryNavigation.map(
              (item) => (
                <NavigationItem
                  key={item.href}
                  item={item}
                  collapsed={collapsed}
                  pathname={pathname}
                />
              )
            )}
          </div>
        </div>

        {/* CONFIGURATION */}

        <div className="mb-6">
          {!collapsed && (
            <div className="mb-2 px-3 text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--max-text-muted)]">
              Enterprise
            </div>
          )}

          <div className="space-y-1">
            {configurationNavigation.map(
              (item) => (
                <NavigationItem
                  key={item.href}
                  item={item}
                  collapsed={collapsed}
                  pathname={pathname}
                />
              )
            )}
          </div>
        </div>

        {/* PLATFORM */}

        <div>
          {!collapsed && (
            <div className="mb-2 px-3 text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--max-text-muted)]">
              Platform
            </div>
          )}

          <div className="space-y-1">
            {platformNavigation.map(
              (item) => (
                <NavigationItem
                  key={item.href}
                  item={item}
                  collapsed={collapsed}
                  pathname={pathname}
                />
              )
            )}
          </div>
        </div>
      </nav>

      {/* ===================================================
          BOTTOM
          =================================================== */}

      <div className="shrink-0 border-t border-[var(--max-border-soft)] p-3">

        {!collapsed && (
          <div className="mb-2">
            <NavigationItem
              item={{
                label: "Settings",
                href: "/settings",
                icon: <SettingsIcon />,
              }}
              collapsed={false}
              pathname={pathname}
            />
          </div>
        )}

        {collapsed && (
          <NavigationItem
            item={{
              label: "Settings",
              href: "/settings",
              icon: <SettingsIcon />,
            }}
            collapsed
            pathname={pathname}
          />
        )}

        {/* SYSTEM STATUS */}

        <div
          className={`mt-2 rounded-xl border border-[var(--max-border-soft)] bg-[var(--max-surface-2)] p-3 ${
            collapsed
              ? "flex justify-center"
              : ""
          }`}
        >
          <div className="flex items-center gap-2">

            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
              <span className="relative h-2 w-2 rounded-full bg-emerald-500" />
            </span>

            {!collapsed && (
              <div className="min-w-0">
                <div className="text-[9px] font-bold text-[var(--max-text)]">
                  Platform operational
                </div>

                <div className="mt-0.5 text-[8px] text-[var(--max-text-muted)]">
                  All core services connected
                </div>
              </div>
            )}
          </div>
        </div>

        {/* COLLAPSE */}

        <button
          type="button"
          onClick={() =>
            setCollapsed(
              (value) => !value
            )
          }
          title={
            collapsed
              ? "Expand sidebar"
              : "Collapse sidebar"
          }
          className={`mt-2 flex h-9 w-full items-center rounded-xl text-[var(--max-text-muted)] transition hover:bg-[var(--max-surface-3)] hover:text-[var(--max-text)] ${
            collapsed
              ? "justify-center"
              : "justify-center gap-2"
          }`}
        >
          <ChevronIcon
            collapsed={collapsed}
          />

          {!collapsed && (
            <span className="text-[10px] font-semibold">
              Collapse navigation
            </span>
          )}
        </button>
      </div>
    </aside>
  );
}
