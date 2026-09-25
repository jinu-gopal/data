"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MaxSettingsMenu from "./MaxSettingsMenu";

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

function SparkleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none">
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

function CommandIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
      <path
        d="M7 4a3 3 0 1 0 0 6h10a3 3 0 1 0 0-6M7 14a3 3 0 1 0 0 6h10a3 3 0 1 0 0-6M7 10v4M17 10v4"
        stroke="currentColor"
        strokeWidth="1.5"
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

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
      <circle
        cx="12"
        cy="8"
        r="3"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M6 20a6 6 0 0 1 12 0"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
      <path
        d="M10 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M14 8l4 4-4 4M18 12H9"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type MaxTopbarProps = {
  name?: string;
  email?: string | null;
  onSignOut?: () => void;
};

export default function MaxTopbar({
  name = "Administrator",
  email = null,
  onSignOut,
}: MaxTopbarProps) {
  const [profileOpen, setProfileOpen] = useState(false);

  const router = useRouter();

  const initial = name.charAt(0).toUpperCase();

  function handleMyProfile() {
    setProfileOpen(false);
    router.push("/account");
  }

  return (
    <header className="sticky top-0 z-40 h-[76px] border-b border-[var(--max-border)] bg-[var(--max-topbar)] backdrop-blur-xl">

      <div className="flex h-full items-center justify-between gap-5 px-5 sm:px-7 lg:px-8">

        {/* SEARCH */}

        <div className="flex min-w-0 flex-1 items-center">

          <button
            type="button"
            className="group flex h-11 w-full max-w-[600px] items-center gap-3 rounded-xl border border-[var(--max-border)] bg-[var(--max-surface)] px-4 text-left shadow-[var(--max-shadow-sm)] transition hover:border-[var(--max-primary)]"
          >
            <span className="text-[var(--max-text-muted)] group-hover:text-[var(--max-primary)]">
              <SearchIcon />
            </span>

            <span className="flex-1 text-xs font-medium text-[var(--max-text-muted)]">
              Search MAX ERP...
            </span>

            <span className="hidden items-center gap-1 rounded-md border border-[var(--max-border)] bg-[var(--max-surface-2)] px-2 py-1 text-[9px] font-bold text-[var(--max-text-muted)] sm:flex">
              <CommandIcon />
              K
            </span>
          </button>
        </div>

        {/* ACTIONS */}

        <div className="flex shrink-0 items-center gap-2">

          {/* MAX AI */}

          <button
            type="button"
            className="hidden h-11 items-center gap-2 rounded-xl border border-[var(--max-border)] bg-[var(--max-surface)] px-4 text-[11px] font-bold text-[var(--max-text)] shadow-[var(--max-shadow-sm)] transition hover:border-violet-300 sm:flex"
          >
            <span className="text-violet-500">
              <SparkleIcon />
            </span>

            MAX AI

            <span className="rounded-full bg-violet-100 px-1.5 py-0.5 text-[7px] font-black uppercase text-violet-600">
              AI
            </span>
          </button>

          {/* NOTIFICATIONS */}

          <button
            type="button"
            aria-label="Notifications"
            className="relative flex h-11 w-11 items-center justify-center rounded-xl text-[var(--max-text-secondary)] transition hover:bg-[var(--max-surface-2)] hover:text-[var(--max-text)]"
          >
            <BellIcon />

            <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-red-500 ring-2 ring-[var(--max-surface)]" />
          </button>

          <div className="mx-1 hidden h-7 w-px bg-[var(--max-border)] sm:block" />

          {/* SETTINGS */}

          <MaxSettingsMenu />

          {/* ADMINISTRATOR */}

          <div className="relative">

            <button
              type="button"
              onClick={() =>
                setProfileOpen((value) => !value)
              }
              className="flex h-11 items-center gap-2 rounded-xl px-1.5 transition hover:bg-[var(--max-surface-2)]"
            >

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--max-primary)] text-xs font-black text-white shadow-md">
                {initial}
              </div>

              <div className="hidden text-left lg:block">

                <div className="max-w-[130px] truncate text-[11px] font-bold text-[var(--max-text)]">
                  {name}
                </div>

                <div className="text-[8px] font-semibold text-[var(--max-text-muted)]">
                  Administrator
                </div>

              </div>

              <span className="hidden text-[var(--max-text-muted)] lg:block">
                <ChevronDown />
              </span>

            </button>

            {/* PROFILE MENU */}

            {profileOpen && (
              <div className="absolute right-0 top-full z-[400] mt-3 w-[290px] overflow-hidden rounded-2xl border border-[var(--max-border)] bg-[var(--max-surface)] shadow-[var(--max-shadow-lg)]">

                {/* PROFILE HEADER */}

                <div className="border-b border-[var(--max-border-soft)] p-4">

                  <div className="flex items-center gap-3">

                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--max-primary)] text-sm font-black text-white">
                      {initial}
                    </div>

                    <div className="min-w-0">

                      <div className="truncate text-xs font-bold text-[var(--max-text)]">
                        {name}
                      </div>

                      {email && (
                        <div className="mt-1 truncate text-[9px] text-[var(--max-text-muted)]">
                          {email}
                        </div>
                      )}

                      <span className="mt-2 inline-flex rounded-full bg-[var(--max-primary-soft)] px-2 py-1 text-[7px] font-bold text-[var(--max-primary)]">
                        Enterprise Administrator
                      </span>

                    </div>

                  </div>
                </div>

                {/* MENU */}

                <div className="p-2">

                  {/* MY PROFILE */}

                  <button
                    type="button"
                    onClick={handleMyProfile}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[10px] font-semibold text-[var(--max-text-secondary)] transition hover:bg-[var(--max-surface-2)]"
                  >
                    <UserIcon />
                    My profile
                  </button>

                  {/* SIGN OUT */}

                  {onSignOut && (
                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                        onSignOut();
                      }}
                      className="mt-1 flex w-full items-center gap-3 rounded-xl bg-red-500/5 px-3 py-3 text-left text-[10px] font-bold text-red-500 transition hover:bg-red-500/10"
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
    </header>
  );
}