import Link from "next/link";
import { auth } from "@/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

/* ============================================================================
 * Types
 * ========================================================================== */

type BusinessObject = {
  id: string;
  objectKey: string;
  name: string;
  description: string | null;
  status: string;
  versionNumber: number;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
};

type BusinessObjectField = {
  id: string;
  businessObjectId: string;
  fieldKey: string;
  label: string;
  description: string | null;
  fieldType: string;
  required: boolean;
  uniqueValue: boolean;
  readOnly: boolean;
  hidden: boolean;
  defaultValue: string | null;
  minValue: number | null;
  maxValue: number | null;
  validationPattern: string | null;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
};

type BusinessObjectWithFields = BusinessObject & {
  fields: BusinessObjectField[];
};

/* ============================================================================
 * Configuration
 * ========================================================================== */

const FRONTEND_URL =
  process.env.NEXTAUTH_URL ||
  process.env.AUTH_URL ||
  "http://localhost:3000";

/* ============================================================================
 * API Error
 * ========================================================================== */

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/* ============================================================================
 * Server-side API helper
 *
 * The page is a Server Component.
 *
 * We forward the incoming browser cookie to the Next.js API route so that
 * the API route can resolve the authenticated NextAuth session and forward
 * the OAuth access token to Spring Boot.
 *
 * Browser
 *   ↓
 * NextAuth cookie
 *   ↓
 * Server Component
 *   ↓
 * Next.js API route
 *   ↓
 * Spring Boot
 * ========================================================================== */

async function fetchFrontendApi<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const requestHeaders = await headers();

  const cookie = requestHeaders.get("cookie");

  const response = await fetch(`${FRONTEND_URL}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",

      ...(cookie
        ? {
            Cookie: cookie,
          }
        : {}),

      ...(options?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (response.status === 401) {
    throw new ApiError("Authentication required.", 401);
  }

  if (!response.ok) {
    let message = `API request failed with status ${response.status}.`;

    try {
      const errorBody = await response.json();

      if (
        errorBody &&
        typeof errorBody === "object" &&
        "message" in errorBody &&
        typeof errorBody.message === "string"
      ) {
        message = errorBody.message;
      }
    } catch {
      // Keep the default error message when the response isn't JSON.
    }

    throw new ApiError(message, response.status);
  }

  return response.json() as Promise<T>;
}

/* ============================================================================
 * Data access
 * ========================================================================== */

async function getBusinessObjects(): Promise<BusinessObject[]> {
  const data = await fetchFrontendApi<unknown>(
    "/api/configuration/business-objects"
  );

  if (!Array.isArray(data)) {
    throw new Error(
      "The Business Objects API returned an unexpected response."
    );
  }

  return data as BusinessObject[];
}

async function getFields(
  businessObjectId: string
): Promise<BusinessObjectField[]> {
  const data = await fetchFrontendApi<unknown>(
    `/api/configuration/business-objects/${businessObjectId}/fields`
  );

  if (!Array.isArray(data)) {
    throw new Error(
      `The Fields API returned an unexpected response for business object ${businessObjectId}.`
    );
  }

  return data as BusinessObjectField[];
}

/* ============================================================================
 * Page
 * ========================================================================== */

export default async function BusinessObjectsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const userName = session.user.name ?? "User";

  let businessObjects: BusinessObject[] = [];
  let objectsWithFields: BusinessObjectWithFields[] = [];
  let pageError: string | null = null;

  try {
    businessObjects = await getBusinessObjects();

    objectsWithFields = await Promise.all(
      businessObjects.map(async (businessObject) => {
        const fields = await getFields(businessObject.id);

        return {
          ...businessObject,
          fields,
        };
      })
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect("/login");
    }

    console.error("Business Objects page failed:", error);

    pageError =
      error instanceof Error
        ? error.message
        : "Unable to load Business Objects.";
  }

  const totalFields = objectsWithFields.reduce(
    (total, businessObject) => total + businessObject.fields.length,
    0
  );

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* =====================================================================
          Header
          ================================================================== */}

      <header className="sticky top-0 z-40 flex h-20 items-center justify-between border-b border-slate-200 bg-white px-6">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-lg font-bold text-white transition hover:bg-slate-800"
            aria-label="MAX ERP Home"
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

          <div
            className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700"
            aria-hidden="true"
          >
            {userName.charAt(0).toUpperCase()}
          </div>

          <Link
            href="/configuration"
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Configuration
          </Link>
        </div>
      </header>

      <div className="flex">
        {/* ===================================================================
            Sidebar
            ================================================================ */}

        <aside className="hidden min-h-[calc(100vh-5rem)] w-64 border-r border-slate-200 bg-white lg:block">
          <div className="p-5">
            <div className="mb-4 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
              Configuration
            </div>

            <nav className="space-y-1" aria-label="Configuration navigation">
              <SidebarItem
                href="/configuration"
                icon="⌂"
                label="Overview"
              />

              <SidebarItem
                href="/configuration/business-objects"
                icon="◇"
                label="Business Objects"
                active
              />

              <SidebarItem
                href="/configuration#fields"
                icon="▦"
                label="Fields"
              />

              <SidebarItem
                href="/configuration#relationships"
                icon="⇄"
                label="Relationships"
              />

              <SidebarItem
                href="/configuration#workflows"
                icon="↗"
                label="Workflows"
              />

              <SidebarItem
                href="/configuration#rules"
                icon="✓"
                label="Rules"
              />

              <SidebarItem
                href="/configuration#permissions"
                icon="◉"
                label="Permissions"
              />

              <SidebarItem
                href="/configuration#notifications"
                icon="♢"
                label="Notifications"
              />

              <SidebarItem
                href="/configuration#integrations"
                icon="↔"
                label="Integrations"
              />

              <div className="my-5 border-t border-slate-100" />

              <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Intelligence
              </div>

              <SidebarItem
                href="/configuration#max-ai"
                icon="✦"
                label="MAX AI"
              />
            </nav>
          </div>
        </aside>

        {/* ===================================================================
            Main content
            ================================================================ */}

        <section className="min-w-0 flex-1">
          <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
            {/* Breadcrumb */}

            <div className="mb-6 flex items-center gap-2 text-sm text-slate-400">
              <Link
                href="/configuration"
                className="transition hover:text-slate-700"
              >
                Configuration Studio
              </Link>

              <span>›</span>

              <span className="font-medium text-slate-700">
                Business Objects
              </span>
            </div>

            {/* Page header */}

            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div>
                <div className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-blue-600">
                  Configuration Model
                </div>

                <h1 className="text-4xl font-bold tracking-tight">
                  Business Objects
                </h1>

                <p className="mt-3 max-w-3xl text-base leading-7 text-slate-500">
                  Define the reusable business entities that form the
                  foundation of MAX ERP.
                </p>
              </div>

              <button
                type="button"
                disabled
                className="cursor-not-allowed rounded-xl bg-slate-200 px-5 py-3 text-sm font-semibold text-slate-500"
              >
                + Create Business Object
              </button>
            </div>

            {/* =================================================================
                Error state
                ============================================================== */}

            {pageError && (
              <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 text-sm font-bold text-red-700">
                    !
                  </div>

                  <div>
                    <h2 className="font-semibold text-red-900">
                      Unable to load configuration
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-red-700">
                      {pageError}
                    </p>

                    <p className="mt-2 text-xs text-red-600">
                      Check the MAX ERP Identity Service and frontend API
                      connection, then refresh this page.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* =================================================================
                Search / Filters
                ============================================================== */}

            <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="relative flex-1">
                  <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-400">
                    ⌕
                  </div>

                  <input
                    type="text"
                    placeholder="Search business objects..."
                    disabled
                    aria-label="Search business objects"
                    className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none"
                  />
                </div>

                <div className="flex gap-3">
                  <select
                    disabled
                    aria-label="Filter business objects by status"
                    className="cursor-not-allowed rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500"
                    defaultValue="ALL"
                  >
                    <option value="ALL">All statuses</option>
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>

                  <button
                    type="button"
                    disabled
                    className="cursor-not-allowed rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-500"
                  >
                    Filters
                  </button>
                </div>
              </div>
            </div>

            {/* =================================================================
                Configured objects
                ============================================================== */}

            <div className="mt-8">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">
                    Configured objects
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Objects available in the configuration model.
                  </p>
                </div>

                <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
                  {businessObjects.length}{" "}
                  {businessObjects.length === 1 ? "object" : "objects"}
                </span>
              </div>

              {pageError ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
                  <div className="text-lg font-bold text-slate-800">
                    Configuration unavailable
                  </div>

                  <p className="mt-2 text-sm text-slate-500">
                    Business object data could not be retrieved.
                  </p>
                </div>
              ) : objectsWithFields.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
                  <div className="text-lg font-bold">
                    No business objects
                  </div>

                  <p className="mt-2 text-sm text-slate-500">
                    No business objects are currently configured.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {objectsWithFields.map((businessObject) => (
                    <Link
                      key={businessObject.id}
                      href={`/configuration/business-objects/${businessObject.id}`}
                      className="group block rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                    >
                      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        {/* Object information */}

                        <div className="flex items-start gap-5">
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-xl font-semibold text-blue-600">
                            ◇
                          </div>

                          <div>
                            <div className="flex flex-wrap items-center gap-3">
                              <h3 className="text-lg font-bold">
                                {businessObject.name}
                              </h3>

                              <StatusBadge
                                status={businessObject.status}
                              />
                            </div>

                            <div className="mt-1 font-mono text-xs text-slate-400">
                              {businessObject.objectKey}
                            </div>

                            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                              {businessObject.description ||
                                "Configurable business object."}
                            </p>
                          </div>
                        </div>

                        {/* Object metrics */}

                        <div className="flex shrink-0 items-center gap-8">
                          <ObjectMetric
                            label="Version"
                            value={`v${businessObject.versionNumber}`}
                          />

                          <ObjectMetric
                            label="Fields"
                            value={String(
                              businessObject.fields.length
                            )}
                          />

                          <div className="text-sm font-bold text-blue-600 transition group-hover:translate-x-0.5">
                            Configure →
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* =================================================================
                Summary
                ============================================================== */}

            <div className="mt-8 grid gap-5 md:grid-cols-3">
              <SummaryCard
                label="Business Objects"
                value={String(businessObjects.length)}
                description="Configured entities"
              />

              <SummaryCard
                label="Fields"
                value={String(totalFields)}
                description="Configured data fields"
              />

              <SummaryCard
                label="Model Status"
                value={pageError ? "Unavailable" : "Active"}
                description="Configuration model"
              />
            </div>

            {/* =================================================================
                Capability areas
                ============================================================== */}

            <div className="mt-8 grid gap-5 md:grid-cols-3">
              <CapabilityCard
                icon="▦"
                title="Fields"
                description="Add data types, defaults, validation, visibility and behavior."
              />

              <CapabilityCard
                icon="⇄"
                title="Relationships"
                description="Connect this object with other business objects."
              />

              <CapabilityCard
                icon="✓"
                title="Rules"
                description="Add conditions, calculations and validation logic."
              />
            </div>

            {/* =================================================================
                Governance
                ============================================================== */}

            <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                    Governance
                  </div>

                  <h2 className="mt-2 text-lg font-bold">
                    Object lifecycle
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Configuration changes are versioned and controlled before
                    they become active.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                  <Stage text="Draft" active />

                  <span className="text-slate-300">→</span>

                  <Stage text="Review" />

                  <span className="text-slate-300">→</span>

                  <Stage text="Test" />

                  <span className="text-slate-300">→</span>

                  <Stage text="Publish" />

                  <span className="text-slate-300">→</span>

                  <Stage text="Audit" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

/* ============================================================================
 * Components
 * ========================================================================== */

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
      aria-current={active ? "page" : undefined}
      className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${
        active
          ? "bg-blue-50 font-semibold text-blue-700"
          : "font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-950"
      }`}
    >
      <span className="w-5 text-center" aria-hidden="true">
        {icon}
      </span>

      {label}
    </Link>
  );
}

function StatusBadge({ status }: { status: string }) {
  const normalizedStatus = status.toUpperCase();

  const className =
    normalizedStatus === "PUBLISHED"
      ? "bg-emerald-50 text-emerald-700"
      : normalizedStatus === "ARCHIVED"
        ? "bg-slate-100 text-slate-500"
        : "bg-amber-50 text-amber-700";

  return (
    <span
      className={`rounded-full px-3 py-1 text-[11px] font-bold ${className}`}
    >
      {normalizedStatus}
    </span>
  );
}

function ObjectMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="hidden text-right sm:block">
      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </div>

      <div className="mt-1 text-sm font-bold text-slate-800">
        {value}
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
        {label}
      </div>

      <div className="mt-2 text-2xl font-bold text-slate-900">
        {value}
      </div>

      <div className="mt-1 text-sm text-slate-500">
        {description}
      </div>
    </div>
  );
}

function CapabilityCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
        {icon}
      </div>

      <h3 className="mt-4 font-bold">{title}</h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function Stage({
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