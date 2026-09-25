import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function ConfigurationStudioPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const userName = session.user.name ?? "User";

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-40 flex h-20 items-center justify-between border-b border-slate-200 bg-white px-6">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-lg font-bold text-white"
          >
            M
          </Link>

          <div>
            <div className="text-xl font-bold tracking-tight">
              MAX <span className="font-normal text-blue-600">ERP</span>
            </div>

            <div className="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-400">
              Enterprise Platform
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="hidden text-sm font-semibold sm:block">
            {userName}
          </span>

          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
            {userName.charAt(0).toUpperCase()}
          </div>

          <Link
            href="/"
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Dashboard
          </Link>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden min-h-[calc(100vh-5rem)] w-64 border-r border-slate-200 bg-white lg:block">
          <div className="p-5">
            <div className="mb-4 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
              Configuration
            </div>

            <nav className="space-y-1">
              <SidebarItem
                href="/configuration"
                icon="⌂"
                label="Overview"
                active
              />

              <SidebarItem
                href="/configuration/business-objects"
                icon="◇"
                label="Business Objects"
              />

              <SidebarItem
                href="#fields"
                icon="▦"
                label="Fields"
              />

              <SidebarItem
                href="#relationships"
                icon="⇄"
                label="Relationships"
              />

              <SidebarItem
                href="#workflows"
                icon="↗"
                label="Workflows"
              />

              <SidebarItem
                href="#rules"
                icon="✓"
                label="Rules"
              />

              <SidebarItem
                href="#permissions"
                icon="◉"
                label="Permissions"
              />

              <SidebarItem
                href="#notifications"
                icon="♢"
                label="Notifications"
              />

              <SidebarItem
                href="#integrations"
                icon="↔"
                label="Integrations"
              />

              <div className="my-5 border-t border-slate-100" />

              <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Intelligence
              </div>

              <SidebarItem
                href="#max-ai"
                icon="✦"
                label="MAX AI"
              />
            </nav>
          </div>
        </aside>

        {/* Main */}
        <section className="min-w-0 flex-1">
          <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
            {/* Breadcrumb */}
            <div className="mb-6 flex items-center gap-2 text-sm text-slate-400">
              <Link href="/" className="hover:text-slate-700">
                Dashboard
              </Link>

              <span>›</span>

              <span className="font-medium text-slate-700">
                Configuration Studio
              </span>
            </div>

            {/* Hero */}
            <div className="mb-10 flex flex-col justify-between gap-6 xl:flex-row xl:items-end">
              <div>
                <div className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-blue-600">
                  Configuration Workspace
                </div>

                <h1 className="text-4xl font-bold tracking-tight">
                  Configuration Studio
                </h1>

                <p className="mt-3 max-w-3xl text-base leading-7 text-slate-500">
                  Design and control the behavior of MAX ERP without changing
                  application code.
                </p>
              </div>

              <Link
                href="/configuration/business-objects"
                className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
              >
                Manage Business Objects
                <span className="ml-2">→</span>
              </Link>
            </div>

            {/* Metrics */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                label="Business Objects"
                value="1"
                description="Configured objects"
              />

              <MetricCard
                label="Fields"
                value="0"
                description="Configured fields"
              />

              <MetricCard
                label="Active Workflows"
                value="0"
                description="Published workflows"
              />

              <MetricCard
                label="Published Rules"
                value="0"
                description="Active business rules"
              />
            </div>

            {/* Configuration Areas */}
            <div className="mt-10">
              <div className="mb-5">
                <h2 className="text-xl font-bold">
                  Configuration areas
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Define how your enterprise platform behaves.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                <ConfigurationCard
                  href="/configuration/business-objects"
                  icon="◇"
                  title="Business Objects"
                  description="Define the reusable business entities that form the foundation of your ERP."
                  action="Open Business Objects"
                />

                <ConfigurationCard
                  href="#fields"
                  icon="▦"
                  title="Fields"
                  description="Define data types, validation, visibility, defaults and field behavior."
                  action="Configure Fields"
                />

                <ConfigurationCard
                  href="#relationships"
                  icon="⇄"
                  title="Relationships"
                  description="Connect business objects and define how enterprise data relates."
                  action="Configure Relationships"
                />

                <ConfigurationCard
                  href="#workflows"
                  icon="↗"
                  title="Workflows"
                  description="Create approval processes, automated actions and business journeys."
                  action="Configure Workflows"
                />

                <ConfigurationCard
                  href="#rules"
                  icon="✓"
                  title="Business Rules"
                  description="Define validations, conditions, calculations and automated decisions."
                  action="Configure Rules"
                />

                <ConfigurationCard
                  href="#permissions"
                  icon="◉"
                  title="Permissions"
                  description="Control access to objects, fields, actions and enterprise data."
                  action="Configure Permissions"
                />
              </div>
            </div>

            {/* MAX AI */}
            <section
              id="max-ai"
              className="mt-10 overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-sm"
            >
              <div className="border-b border-blue-100 bg-blue-50/70 p-6 lg:p-8">
                <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 font-bold text-white">
                        ✦
                      </span>

                      <span className="text-sm font-bold text-blue-700">
                        MAX AI
                      </span>
                    </div>

                    <h2 className="text-2xl font-bold">
                      Configure MAX ERP using natural language
                    </h2>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                      Describe the configuration you need. MAX AI will prepare
                      a proposed change for review.
                    </p>
                  </div>

                  <span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-blue-700 shadow-sm">
                    Controlled changes
                  </span>
                </div>
              </div>

              <div className="p-6 lg:p-8">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Example request
                  </div>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    “Create a customer field called credit limit, make it
                    mandatory for enterprise customers, and require approval
                    when the value exceeds the configured threshold.”
                  </p>
                </div>

                <div className="mt-5 flex flex-col gap-4 sm:flex-row">
                  <div className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-400">
                    Describe what you want to configure...
                  </div>

                  <button
                    disabled
                    className="rounded-xl bg-slate-200 px-6 py-3 text-sm font-semibold text-slate-500"
                  >
                    Generate configuration
                  </button>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-2 text-xs font-semibold">
                  <GovernanceStage text="Draft" active />
                  <span className="text-slate-300">→</span>

                  <GovernanceStage text="Impact Analysis" />
                  <span className="text-slate-300">→</span>

                  <GovernanceStage text="Test" />
                  <span className="text-slate-300">→</span>

                  <GovernanceStage text="Approval" />
                  <span className="text-slate-300">→</span>

                  <GovernanceStage text="Publish" />
                  <span className="text-slate-300">→</span>

                  <GovernanceStage text="Audit" />
                </div>
              </div>
            </section>

            {/* Recent Activity */}
            <section className="mt-10">
              <div className="mb-5">
                <h2 className="text-xl font-bold">
                  Recent configuration activity
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Changes and configuration events across the platform.
                </p>
              </div>

              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <ActivityRow
                  object="Customer"
                  action="Business object created"
                  status="Draft"
                  time="Just now"
                />

                <ActivityRow
                  object="Configuration Studio"
                  action="Workspace initialized"
                  status="Active"
                  time="Today"
                />

                <ActivityRow
                  object="MAX Identity"
                  action="Authentication connected"
                  status="Active"
                  time="Today"
                />
              </div>
            </section>

            {/* Governance */}
            <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
              <div className="grid gap-8 lg:grid-cols-2">
                <div>
                  <div className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                    Governance
                  </div>

                  <h2 className="text-xl font-bold">
                    Configuration is controlled
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    MAX ERP does not allow AI or configuration changes to
                    silently modify production behavior. Changes move through
                    a controlled lifecycle with validation, approval and
                    auditability.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <GovernanceItem
                    title="Versioned"
                    description="Every configuration has a version."
                  />

                  <GovernanceItem
                    title="Audited"
                    description="Changes retain their history."
                  />

                  <GovernanceItem
                    title="Testable"
                    description="Changes can be validated before publishing."
                  />

                  <GovernanceItem
                    title="Reversible"
                    description="Published versions can be restored."
                  />
                </div>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

function SidebarItem({
  href,
  icon,
  label,
  active = false,
}: {
  href: string;
  icon: string;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
        active
          ? "bg-blue-50 font-semibold text-blue-700"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
      }`}
    >
      <span className="w-5 text-center text-base">{icon}</span>
      {label}
    </Link>
  );
}

function MetricCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
        {label}
      </div>

      <div className="mt-3 text-3xl font-bold tracking-tight">
        {value}
      </div>

      <div className="mt-1 text-xs text-slate-500">
        {description}
      </div>
    </div>
  );
}

function ConfigurationCard({
  href,
  icon,
  title,
  description,
  action,
}: {
  href: string;
  icon: string;
  title: string;
  description: string;
  action: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
    >
      <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-lg text-slate-700 transition group-hover:bg-blue-50 group-hover:text-blue-600">
        {icon}
      </div>

      <h3 className="text-lg font-bold">
        {title}
      </h3>

      <p className="mt-2 min-h-12 text-sm leading-6 text-slate-500">
        {description}
      </p>

      <div className="mt-5 text-sm font-bold text-blue-600">
        {action} →
      </div>
    </Link>
  );
}

function GovernanceStage({
  text,
  active = false,
}: {
  text: string;
  active?: boolean;
}) {
  return (
    <span
      className={`rounded-full px-3 py-1.5 ${
        active
          ? "bg-blue-100 text-blue-700"
          : "bg-slate-100 text-slate-500"
      }`}
    >
      {text}
    </span>
  );
}

function ActivityRow({
  object,
  action,
  status,
  time,
}: {
  object: string;
  action: string;
  status: string;
  time: string;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-slate-100 p-5 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold">
          {object.charAt(0)}
        </div>

        <div>
          <div className="text-sm font-semibold">{object}</div>
          <div className="mt-1 text-xs text-slate-500">{action}</div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          {status}
        </span>

        <span className="text-xs text-slate-400">{time}</span>
      </div>
    </div>
  );
}

function GovernanceItem({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <div className="text-sm font-bold">{title}</div>
      <div className="mt-1 text-xs leading-5 text-slate-500">
        {description}
      </div>
    </div>
  );
}