import Link from "next/link";
import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import MaxShell from "@/components/max/MaxShell";

function Arrow() {
  return (
    <svg
      className="h-4 w-4"
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

function Gear() {
  return (
    <svg
      className="h-6 w-6"
      viewBox="0 0 24 24"
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
        strokeWidth="1.3"
        strokeLinejoin="round"
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
        x="5"
        y="5"
        width="14"
        height="14"
        rx="3"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M9 9h6M9 12h6M9 15h3"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg
      className="h-6 w-6"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="8"
        r="3"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M6.5 19a5.5 5.5 0 0 1 11 0"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Sparkles() {
  return (
    <svg
      className="h-6 w-6"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="m12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Check() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="m5 10 3 3 7-7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Pulse() {
  return (
    <span className="relative flex h-2.5 w-2.5">
      <span className="absolute h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
      <span className="relative h-2.5 w-2.5 rounded-full bg-emerald-500" />
    </span>
  );
}

export default async function Home() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const name = session.user.name ?? "User";
  const email = session.user.email ?? null;
  const firstName = name.split(" ")[0];

  async function handleSignOut() {
    "use server";

    await signOut({
      redirectTo: "/login",
    });
  }

  return (
    <MaxShell
      name={name}
      email={email}
      onSignOut={handleSignOut}
    >
      <div className="min-h-screen text-[var(--max-text)]">

        {/* =====================================================
            HERO
            ===================================================== */}

        <section className="relative overflow-hidden rounded-[28px] border border-[var(--max-border)] bg-[var(--max-surface)] shadow-[var(--max-shadow-lg)]">

          <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-[var(--max-primary-soft)] blur-3xl" />

          <div className="absolute -bottom-40 left-1/3 h-80 w-80 rounded-full bg-[var(--max-accent-soft)] blur-3xl" />

          <div className="relative grid gap-8 p-7 sm:p-9 lg:grid-cols-[1fr_430px] lg:p-10">

            <div className="flex flex-col justify-center">

              <div className="flex w-fit items-center gap-2 rounded-full border border-[var(--max-border)] bg-[var(--max-surface-2)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--max-primary)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--max-primary)]" />
                Enterprise Workspace
              </div>

              <h1 className="mt-5 max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                Welcome back,{" "}
                <span className="text-[var(--max-primary)]">
                  {firstName}
                </span>
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--max-text-secondary)] sm:text-[15px]">
                Your intelligent enterprise workspace for configuration,
                business data, workflows, access and AI-powered operations.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">

                <Link
                  href="/configuration"
                  className="inline-flex items-center gap-2 rounded-xl bg-[var(--max-primary)] px-5 py-3 text-xs font-bold text-white shadow-lg transition hover:opacity-90"
                >
                  Open Configuration Studio
                  <Arrow />
                </Link>

                <Link
                  href="/configuration/business-objects"
                  className="inline-flex items-center gap-2 rounded-xl border border-[var(--max-border)] bg-[var(--max-surface)] px-5 py-3 text-xs font-bold text-[var(--max-text)] transition hover:bg-[var(--max-surface-2)]"
                >
                  Business Objects
                  <Arrow />
                </Link>

              </div>
            </div>

            {/* =================================================
                PLATFORM VISUAL
                ================================================= */}

            <div className="relative flex min-h-[310px] items-center justify-center overflow-hidden rounded-3xl bg-[var(--max-visual-bg)]">

              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--max-visual-glow),transparent_55%)]" />

              <div
                className="relative h-56 w-56"
                style={{ perspective: "900px" }}
              >

                <div
                  className="absolute left-1/2 top-1/2 h-52 w-52 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--max-visual-line)]"
                  style={{
                    transform:
                      "translate(-50%, -50%) rotateX(68deg)",
                  }}
                />

                <div
                  className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--max-visual-line-2)]"
                  style={{
                    transform:
                      "translate(-50%, -50%) rotateY(68deg)",
                  }}
                />

                <div
                  className="absolute left-1/2 top-1/2 h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--max-visual-line-3)]"
                  style={{
                    transform:
                      "translate(-50%, -50%) rotateX(68deg) rotateY(20deg)",
                  }}
                />

                <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--max-visual-glow-strong)] blur-3xl" />

                <div
                  className="absolute left-1/2 top-1/2 flex h-32 w-32 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[32px] border border-white/20 bg-white/10 shadow-[0_0_80px_var(--max-visual-shadow)] backdrop-blur-xl"
                  style={{
                    transform:
                      "translate(-50%, -50%) rotateX(8deg) rotateY(-8deg)",
                  }}
                >
                  <div className="text-center">
                    <div className="text-4xl font-black tracking-tighter text-white">
                      M
                    </div>

                    <div className="mt-1 text-[8px] font-bold uppercase tracking-[0.28em] text-[var(--max-visual-accent)]">
                      MAX ERP
                    </div>
                  </div>
                </div>

                <div className="absolute left-1 top-12 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-[9px] font-bold text-white/70 backdrop-blur-md">
                  Identity
                </div>

                <div className="absolute right-0 top-8 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-[9px] font-bold text-white/70 backdrop-blur-md">
                  AI
                </div>

                <div className="absolute bottom-10 left-2 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-[9px] font-bold text-white/70 backdrop-blur-md">
                  Data
                </div>

                <div className="absolute bottom-5 right-0 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-[9px] font-bold text-white/70 backdrop-blur-md">
                  Workflows
                </div>
              </div>

              <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-md">

                <div>
                  <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/45">
                    Platform
                  </div>

                  <div className="mt-1 text-xs font-bold text-white">
                    Core services operational
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-400">
                  <Pulse />
                  Connected
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            PLATFORM NAVIGATION
            ===================================================== */}

        <section className="mt-10">

          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--max-primary)]">
            Platform navigation
          </div>

          <h2 className="mt-2 text-2xl font-bold tracking-tight">
            Everything in one workspace
          </h2>

          <p className="mt-1 text-sm text-[var(--max-text-secondary)]">
            Configure and operate MAX ERP from a single enterprise control
            layer.
          </p>

        </section>

        {/* =====================================================
            MODULE CARDS
            ===================================================== */}

        <section className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">

          {/* CONFIGURATION */}

          <Link
            href="/configuration"
            className="group relative overflow-hidden rounded-2xl border border-[var(--max-border)] bg-[var(--max-surface)] p-6 shadow-[var(--max-shadow-sm)] transition duration-200 hover:-translate-y-1 hover:shadow-[var(--max-shadow-lg)]"
          >
            <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[var(--max-primary-soft)] transition group-hover:scale-125" />

            <div className="relative">

              <div className="flex items-center justify-between">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--max-primary-soft)] text-[var(--max-primary)]">
                  <Gear />
                </div>

                <span className="rounded-full bg-[var(--max-primary-soft)] px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-[var(--max-primary)]">
                  Core
                </span>

              </div>

              <h3 className="mt-6 text-base font-bold">
                Configuration Studio
              </h3>

              <p className="mt-2 min-h-[60px] text-xs leading-5 text-[var(--max-text-secondary)]">
                Configure business objects, fields, rules, workflows,
                permissions and enterprise behavior without coding.
              </p>

              <div className="mt-5 flex items-center gap-2 text-xs font-bold text-[var(--max-primary)] transition-all group-hover:gap-3">
                Open Studio
                <Arrow />
              </div>

            </div>
          </Link>

          {/* BUSINESS OBJECTS */}

          <Link
            href="/configuration/business-objects"
            className="group relative overflow-hidden rounded-2xl border border-[var(--max-border)] bg-[var(--max-surface)] p-6 shadow-[var(--max-shadow-sm)] transition duration-200 hover:-translate-y-1 hover:shadow-[var(--max-shadow-lg)]"
          >
            <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[var(--max-accent-soft)] transition group-hover:scale-125" />

            <div className="relative">

              <div className="flex items-center justify-between">

                <div className="flex items-center justify-between">

                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--max-accent-soft)] text-[var(--max-accent)]">
                    <ObjectIcon />
                  </div>

                </div>

                <span className="rounded-full bg-[var(--max-accent-soft)] px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-[var(--max-accent)]">
                  Data
                </span>

              </div>

              <h3 className="mt-6 text-base font-bold">
                Business Objects
              </h3>

              <p className="mt-2 min-h-[60px] text-xs leading-5 text-[var(--max-text-secondary)]">
                Create and manage the configurable enterprise objects that
                power MAX ERP.
              </p>

              <div className="mt-5 flex items-center gap-2 text-xs font-bold text-[var(--max-accent)] transition-all group-hover:gap-3">
                Manage Objects
                <Arrow />
              </div>

            </div>
          </Link>

          {/* USERS */}

          <div className="group relative overflow-hidden rounded-2xl border border-[var(--max-border)] bg-[var(--max-surface)] p-6 shadow-[var(--max-shadow-sm)]">

            <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-emerald-500/10" />

            <div className="relative">

              <div className="flex items-center justify-between">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                  <UsersIcon />
                </div>

                <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-emerald-600">
                  Security
                </span>

              </div>

              <h3 className="mt-6 text-base font-bold">
                Users & Access
              </h3>

              <p className="mt-2 min-h-[60px] text-xs leading-5 text-[var(--max-text-secondary)]">
                Manage enterprise users, roles, permissions and access
                policies.
              </p>

              <div className="mt-5 text-xs font-bold text-[var(--max-text-muted)]">
                Access Management

                <span className="ml-2 rounded-full bg-[var(--max-surface-2)] px-2 py-1 text-[9px] uppercase tracking-wider">
                  Coming soon
                </span>
              </div>

            </div>
          </div>

          {/* MAX AI */}

          <div className="group relative overflow-hidden rounded-2xl border border-[var(--max-border)] bg-[var(--max-surface)] p-6 shadow-[var(--max-shadow-sm)]">

            <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-amber-500/10" />

            <div className="relative">

              <div className="flex items-center justify-between">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
                  <Sparkles />
                </div>

                <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-amber-600">
                  AI
                </span>

              </div>

              <h3 className="mt-6 text-base font-bold">
                MAX AI
              </h3>

              <p className="mt-2 min-h-[60px] text-xs leading-5 text-[var(--max-text-secondary)]">
                Governed natural-language intelligence for configuration,
                automation and enterprise operations.
              </p>

              <div className="mt-5 text-xs font-bold text-[var(--max-text-muted)]">
                AI Workspace

                <span className="ml-2 rounded-full bg-[var(--max-surface-2)] px-2 py-1 text-[9px] uppercase tracking-wider">
                  Coming soon
                </span>
              </div>

            </div>
          </div>

        </section>

        {/* =====================================================
            PLATFORM FOUNDATION + SYSTEM STATUS
            ===================================================== */}

        <section className="mt-8 grid gap-6 xl:grid-cols-[1.55fr_1fr]">

          <div className="rounded-2xl border border-[var(--max-border)] bg-[var(--max-surface)] shadow-[var(--max-shadow-sm)]">

            <div className="border-b border-[var(--max-border-soft)] px-6 py-5">

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                <div>

                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--max-text-muted)]">
                    Platform foundation
                  </div>

                  <h2 className="mt-1 text-lg font-bold">
                    MAX ERP Architecture
                  </h2>

                  <p className="mt-1 text-xs text-[var(--max-text-secondary)]">
                    The core layers powering the enterprise platform.
                  </p>

                </div>

                <div className="flex w-fit items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                  <Pulse />
                  Operational
                </div>

              </div>
            </div>

            <div className="grid gap-4 p-6 sm:grid-cols-2">

              <div className="rounded-2xl border border-[var(--max-border-soft)] bg-[var(--max-surface-2)] p-5">

                <div className="flex items-center justify-between">

                  <div>
                    <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--max-text-muted)]">
                      Identity
                    </div>

                    <div className="mt-2 text-sm font-bold">
                      MAX Identity
                    </div>
                  </div>

                  <div className="rounded-xl bg-[var(--max-surface)] p-2 text-[var(--max-primary)] shadow-sm">
                    <UsersIcon />
                  </div>

                </div>

                <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-emerald-600">
                  <Check />
                  Authentication active
                </div>

              </div>

              <Link
                href="/configuration"
                className="rounded-2xl border border-[var(--max-border-soft)] bg-[var(--max-surface-2)] p-5 transition hover:border-[var(--max-primary)]"
              >

                <div className="flex items-center justify-between">

                  <div>
                    <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--max-text-muted)]">
                      Configuration
                    </div>

                    <div className="mt-2 text-sm font-bold">
                      Configuration Studio
                    </div>
                  </div>

                  <div className="rounded-xl bg-[var(--max-surface)] p-2 text-[var(--max-primary)] shadow-sm">
                    <Gear />
                  </div>

                </div>

                <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-emerald-600">
                  <Check />
                  Workspace available
                </div>

              </Link>

              <Link
                href="/configuration/business-objects"
                className="rounded-2xl border border-[var(--max-border-soft)] bg-[var(--max-surface-2)] p-5 transition hover:border-[var(--max-accent)]"
              >

                <div className="flex items-center justify-between">

                  <div>
                    <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--max-text-muted)]">
                      Data model
                    </div>

                    <div className="mt-2 text-sm font-bold">
                      Business Objects
                    </div>
                  </div>

                  <div className="rounded-xl bg-[var(--max-surface)] p-2 text-[var(--max-accent)] shadow-sm">
                    <ObjectIcon />
                  </div>

                </div>

                <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-emerald-600">
                  <Check />
                  Configuration available
                </div>

              </Link>

              <div className="rounded-2xl border border-[var(--max-border-soft)] bg-[var(--max-surface-2)] p-5">

                <div className="flex items-center justify-between">

                  <div>
                    <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--max-text-muted)]">
                      Intelligence
                    </div>

                    <div className="mt-2 text-sm font-bold">
                      MAX AI
                    </div>
                  </div>

                  <div className="rounded-xl bg-[var(--max-surface)] p-2 text-amber-600 shadow-sm">
                    <Sparkles />
                  </div>

                </div>

                <div className="mt-4 text-[10px] font-bold text-amber-600">
                  AI capability foundation
                </div>

              </div>

            </div>
          </div>

          {/* SYSTEM STATUS */}

          <div className="rounded-2xl border border-[var(--max-border)] bg-[var(--max-surface)] shadow-[var(--max-shadow-sm)]">

            <div className="border-b border-[var(--max-border-soft)] px-6 py-5">

              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--max-text-muted)]">
                Operations
              </div>

              <h2 className="mt-1 text-lg font-bold">
                System status
              </h2>

              <p className="mt-1 text-xs text-[var(--max-text-secondary)]">
                Current MAX ERP platform connectivity.
              </p>

            </div>

            <div className="divide-y divide-[var(--max-border-soft)]">

              <div className="flex items-center justify-between px-6 py-4">
                <span className="text-xs font-semibold">
                  Authentication
                </span>

                <span className="flex items-center gap-2 text-[10px] font-bold text-emerald-600">
                  <Pulse />
                  Active
                </span>
              </div>

              <div className="flex items-center justify-between px-6 py-4">
                <span className="text-xs font-semibold">
                  MAX Identity
                </span>

                <span className="flex items-center gap-2 text-[10px] font-bold text-emerald-600">
                  <Pulse />
                  Connected
                </span>
              </div>

              <div className="flex items-center justify-between px-6 py-4">
                <span className="text-xs font-semibold">
                  PostgreSQL
                </span>

                <span className="flex items-center gap-2 text-[10px] font-bold text-emerald-600">
                  <Pulse />
                  Available
                </span>
              </div>

              <div className="flex items-center justify-between px-6 py-4">
                <span className="text-xs font-semibold">
                  Configuration API
                </span>

                <span className="flex items-center gap-2 text-[10px] font-bold text-emerald-600">
                  <Pulse />
                  Available
                </span>
              </div>

            </div>

            <div className="border-t border-[var(--max-border-soft)] bg-[var(--max-surface-2)] px-6 py-5">

              <div className="flex gap-3">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--max-primary-soft)] text-[var(--max-primary)]">
                  <Gear />
                </div>

                <div>

                  <div className="text-xs font-bold">
                    Configuration-first architecture
                  </div>

                  <p className="mt-1 text-[10px] leading-4 text-[var(--max-text-secondary)]">
                    Enterprise behavior is designed to be configurable
                    without modifying the platform core.
                  </p>

                </div>

              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            FOOTER
            ===================================================== */}

        <footer className="mt-10 flex flex-col gap-2 border-t border-[var(--max-border)] py-5 text-[10px] text-[var(--max-text-muted)] sm:flex-row sm:items-center sm:justify-between">

          <span>
            MAX ERP Enterprise Platform
          </span>

          <span>
            No-code configuration&nbsp;&nbsp;•&nbsp;&nbsp;Enterprise
            architecture&nbsp;&nbsp;•&nbsp;&nbsp;AI-ready
          </span>

        </footer>

      </div>
    </MaxShell>
  );
}