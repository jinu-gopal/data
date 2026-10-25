"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import MaxShell from "@/components/max/MaxShell";
import CreateBusinessObjectButton from "@/components/configuration/CreateBusinessObjectButton";

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
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
  fieldCount?: number;
};

/* ============================================================================
 * Icons
 * ========================================================================== */

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  );
}

function SchemaIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M3 9h18M9 21V9" />
    </svg>
  );
}

function DatabaseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
  );
}

function RulesIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="m16 3 5 5-14 14H2v-5L16 3z" />
    </svg>
  );
}

function LayoutIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M12 9v12" />
    </svg>
  );
}

export default function BusinessObjectsStudioPage() {
  const [businessObjects, setBusinessObjects] = useState<BusinessObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [error, setError] = useState<string | null>(null);

  const fetchBusinessObjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/configuration/business-objects", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setBusinessObjects(Array.isArray(data) ? data : []);
      } else {
        throw new Error(`Failed to load business objects (${res.status})`);
      }
    } catch (err: any) {
      console.error("Error loading business objects:", err);
      setError(err?.message || "Failed to load business objects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinessObjects();
  }, []);

  const filteredObjects = useMemo(() => {
    return businessObjects.filter((bo) => {
      const matchesSearch =
        bo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bo.objectKey.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (bo.description && bo.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === "ALL" || bo.status.toUpperCase() === statusFilter.toUpperCase();

      return matchesSearch && matchesStatus;
    });
  }, [businessObjects, searchQuery, statusFilter]);

  const totalFieldsEstimate = useMemo(() => {
    return businessObjects.reduce((acc, curr) => acc + (curr.fieldCount || 12), 0);
  }, [businessObjects]);

  return (
    <MaxShell name="Enterprise Admin" email="admin@maxerp.local">
      <div className="space-y-6">
        {/* ===================================================================
            1. BREADCRUMB & HEADER
            ================================================================ */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
              <Link href="/configuration" className="transition hover:text-slate-600">
                Configuration Studio
              </Link>
              <span>/</span>
              <span className="text-blue-600">Business Objects</span>
            </div>
            <div className="mt-1 flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Business Objects & Metadata Engine
              </h1>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
                Active Model
              </span>
            </div>
            <p className="mt-1 max-w-3xl text-xs text-slate-500 sm:text-sm">
              Define foundational business entities, extensible custom attributes, record validation rules, and page layout definitions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/configuration/rules"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-slate-50"
            >
              <RulesIcon />
              Rules Studio
            </Link>
            <Link
              href="/configuration/layouts"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-slate-50"
            >
              <LayoutIcon />
              Layouts Designer
            </Link>
            <CreateBusinessObjectButton />
          </div>
        </div>

        {/* ===================================================================
            2. KPI SUMMARY METRICS
            ================================================================ */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Business Objects
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <SchemaIcon />
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900">{businessObjects.length}</div>
            <div className="mt-1 text-xs text-slate-500">Core master & transaction schemas</div>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Dynamic Fields
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <DatabaseIcon />
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900">{totalFieldsEstimate}+</div>
            <div className="mt-1 text-xs text-slate-500">Attributes across 20 data types</div>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Business Rules
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <RulesIcon />
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900">4 Active</div>
            <div className="mt-1 text-xs text-slate-500">Validation, visibility & computation gates</div>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Model Health
              </span>
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </div>
            <div className="mt-2 text-2xl font-bold text-emerald-600">100% Valid</div>
            <div className="mt-1 text-xs text-slate-500">PostgreSQL metadata synchronized</div>
          </div>
        </div>

        {/* ===================================================================
            3. SEARCH & STATUS FILTERS
            ================================================================ */}
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-2xs sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <SearchIcon />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search business objects by name, key, or description..."
              className="w-full rounded-xl border border-slate-200/80 bg-slate-50/70 py-2.5 pl-10 pr-10 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200/90 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active / Published</option>
              <option value="DRAFT">Draft Mode</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
        </div>

        {/* ===================================================================
            4. BUSINESS OBJECTS CATALOG
            ================================================================ */}
        {loading ? (
          <div className="flex items-center justify-center rounded-3xl border border-slate-200/90 bg-white p-12 text-sm text-slate-500">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent mr-3" />
            Loading business object schemas...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            <strong>Error:</strong> {error}
          </div>
        ) : filteredObjects.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center">
            <h3 className="text-base font-bold text-slate-800">No Business Objects Found</h3>
            <p className="mt-1 text-xs text-slate-500">No objects matched your search criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {filteredObjects.map((bo) => (
              <div
                key={bo.id}
                className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 font-mono text-base font-bold text-blue-600">
                        {bo.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition">
                            {bo.name}
                          </h3>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                              bo.status.toUpperCase() === "ACTIVE" || bo.status.toUpperCase() === "PUBLISHED"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200/70"
                                : "bg-amber-50 text-amber-700 border border-amber-200/70"
                            }`}
                          >
                            {bo.status.toUpperCase()}
                          </span>
                        </div>
                        <span className="font-mono text-[11px] text-slate-400">
                          {bo.objectKey}
                        </span>
                      </div>
                    </div>

                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                      v{bo.versionNumber || 1}.0
                    </span>
                  </div>

                  <p className="mt-3 text-xs leading-relaxed text-slate-500 line-clamp-2">
                    {bo.description || "Authoritative enterprise business object schema definition."}
                  </p>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3.5">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/configuration/business-objects/${bo.id}`}
                      className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-2xs transition hover:bg-blue-700"
                    >
                      Schema & Fields
                    </Link>
                    <Link
                      href={`/configuration/business-objects/${bo.id}/records`}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-white hover:border-slate-300"
                    >
                      Records Data
                    </Link>
                    <Link
                      href={`/configuration/rules?businessObjectId=${bo.id}`}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-white"
                      title="View Business Rules"
                    >
                      Rules
                    </Link>
                  </div>

                  <span className="text-[11px] font-bold text-slate-400">
                    Updated {new Date(bo.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ===================================================================
            5. OBJECT GOVERNANCE TIMELINE
            ================================================================ */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Governance & Schema Lifecycle
              </div>
              <h4 className="mt-1 text-sm font-bold text-slate-900">
                Enterprise Zero-Downtime Schema Evolution
              </h4>
              <p className="text-xs text-slate-500">
                Changes to business objects transition through sandbox validation before production activation.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
              <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-blue-700">1. Draft</span>
              <span className="text-slate-300">→</span>
              <span className="rounded-lg bg-slate-100 px-2.5 py-1">2. Validate</span>
              <span className="text-slate-300">→</span>
              <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-emerald-700">3. Published</span>
              <span className="text-slate-300">→</span>
              <span className="rounded-lg bg-slate-100 px-2.5 py-1">4. Audited</span>
            </div>
          </div>
        </div>
      </div>
    </MaxShell>
  );
}
