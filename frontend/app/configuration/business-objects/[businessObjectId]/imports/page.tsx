"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type BusinessObject = {
  id: string;
  objectKey: string;
  name: string;
  description?: string | null;
  status: string;
};

type ImportJob = {
  id: string;
  businessObjectId: string;
  fileName: string;
  fileType: string;
  fileSizeBytes?: number | null;
  status: string;
  totalRows?: number | null;
  validRows?: number | null;
  invalidRows?: number | null;
  duplicateRows?: number | null;
  processedRows?: number | null;
  columnMapping?: Record<string, unknown> | null;
  summary?: Record<string, unknown> | null;
  createdBy?: string | null;
  createdAt: string;
  startedAt?: string | null;
  completedAt?: string | null;
  updatedAt?: string | null;
};

function formatBytes(bytes?: number | null): string {
  if (bytes === null || bytes === undefined || bytes === 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDate(isoString?: string | null): string {
  if (!isoString) return "—";
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return isoString;
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case "COMPLETED":
      return (
        <span className="inline-flex items-center rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
          COMPLETED
        </span>
      );
    case "COMPLETED_WITH_ERRORS":
      return (
        <span className="inline-flex items-center rounded-md bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-600/20">
          COMPLETED WITH ERRORS
        </span>
      );
    case "EXECUTING":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/20">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-600" />
          EXECUTING
        </span>
      );
    case "VALIDATED":
      return (
        <span className="inline-flex items-center rounded-md bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700 ring-1 ring-inset ring-sky-600/20">
          VALIDATED
        </span>
      );
    case "PARSED":
      return (
        <span className="inline-flex items-center rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-600/20">
          PARSED
        </span>
      );
    case "UPLOADED":
      return (
        <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-inset ring-slate-600/20">
          UPLOADED
        </span>
      );
    case "FAILED":
      return (
        <span className="inline-flex items-center rounded-md bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 ring-1 ring-inset ring-rose-600/20">
          FAILED
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
          {status}
        </span>
      );
  }
}

export default function ImportHistoryPage() {
  const params = useParams<{ businessObjectId: string }>();
  const router = useRouter();

  const businessObjectId =
    typeof params.businessObjectId === "string" ? params.businessObjectId : "";

  const [businessObject, setBusinessObject] = useState<BusinessObject | null>(
    null
  );
  const [jobs, setJobs] = useState<ImportJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedJob, setSelectedJob] = useState<ImportJob | null>(null);

  useEffect(() => {
    if (!businessObjectId) return;

    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const [boRes, jobsRes] = await Promise.all([
          fetch(
            `/api/configuration/business-objects/${businessObjectId}`,
            { cache: "no-store" }
          ),
          fetch(
            `/api/configuration/business-objects/${businessObjectId}/imports`,
            { cache: "no-store" }
          ),
        ]);

        if (boRes.ok) {
          const boData = await boRes.json();
          setBusinessObject(boData);
        }

        if (!jobsRes.ok) {
          const errText = await jobsRes.text();
          let parsedError = "";
          try {
            const errJson = JSON.parse(errText);
            parsedError =
              errJson.message || errJson.error || `HTTP ${jobsRes.status}`;
          } catch {
            parsedError = errText || `HTTP ${jobsRes.status}`;
          }

          if (jobsRes.status === 401) {
            throw new Error("Authentication required or session expired.");
          }
          if (jobsRes.status === 403) {
            throw new Error("You lack permission to view import history.");
          }
          if (jobsRes.status === 404) {
            throw new Error("Business object not found.");
          }

          throw new Error(`Failed to load import history: ${parsedError}`);
        }

        const jobsData = await jobsRes.json();
        setJobs(Array.isArray(jobsData) ? jobsData : []);
      } catch (err) {
        console.error("LOAD IMPORT HISTORY ERROR:", err);
        setError(
          err instanceof Error
            ? err.message
            : "An unexpected error occurred while loading import history."
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [businessObjectId]);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm">
          <button
            onClick={() => router.push("/configuration/business-objects")}
            className="text-slate-500 hover:text-slate-900"
          >
            Business Objects
          </button>
          <span className="text-slate-300">&gt;</span>
          <button
            onClick={() =>
              router.push(`/configuration/business-objects/${businessObjectId}`)
            }
            className="text-slate-500 hover:text-slate-900"
          >
            {businessObject?.name || "Business Object"}
          </button>
          <span className="text-slate-300">&gt;</span>
          <button
            onClick={() =>
              router.push(
                `/configuration/business-objects/${businessObjectId}/records`
              )
            }
            className="text-slate-500 hover:text-slate-900"
          >
            Records
          </button>
          <span className="text-slate-300">&gt;</span>
          <span className="font-medium text-slate-900">Import History</span>
        </div>

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              AUDIT & LOGS
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
              {businessObject?.name || "Business Object"} Import History
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Review previously uploaded files, execution outcomes, and row processing metrics.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() =>
                router.push(
                  `/configuration/business-objects/${businessObjectId}/records`
                )
              }
              className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              ← Back to Records
            </button>

            <button
              type="button"
              onClick={() =>
                router.push(
                  `/configuration/business-objects/${businessObjectId}/imports/new`
                )
              }
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              <span>+ Import Records</span>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800 shadow-sm">
            <div className="flex items-start gap-3">
              <svg
                className="h-5 w-5 flex-shrink-0 text-rose-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div>
                <h4 className="font-semibold text-rose-900">
                  Failed to load history
                </h4>
                <p className="mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Content Section */}
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-16 text-center shadow-sm">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
            <p className="text-sm font-medium text-slate-600">
              Loading import history...
            </p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-8 py-20 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-xl text-slate-500">
              <svg
                className="h-6 w-6 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-slate-900">
              No import jobs yet
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
              No files have been imported for this business object. Start by uploading a CSV or XLSX file.
            </p>
            <button
              type="button"
              onClick={() =>
                router.push(
                  `/configuration/business-objects/${businessObjectId}/imports/new`
                )
              }
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              Start First Import
            </button>
          </div>
        ) : (
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between bg-slate-50/50">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Previous Imports
                </h2>
                <p className="text-xs text-slate-500">
                  Showing {jobs.length} total import job{jobs.length === 1 ? "" : "s"} ordered newest-first
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-6 py-3.5 font-semibold text-slate-600">
                      File
                    </th>
                    <th className="px-6 py-3.5 font-semibold text-slate-600">
                      Created At
                    </th>
                    <th className="px-6 py-3.5 font-semibold text-slate-600">
                      Status
                    </th>
                    <th className="px-6 py-3.5 font-semibold text-slate-600">
                      Total Rows
                    </th>
                    <th className="px-6 py-3.5 font-semibold text-slate-600">
                      Processed
                    </th>
                    <th className="px-6 py-3.5 font-semibold text-slate-600">
                      Issues (Inv/Dup)
                    </th>
                    <th className="px-6 py-3.5 text-right font-semibold text-slate-600">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {jobs.map((job) => {
                    const isResumeable =
                      job.status === "VALIDATED" ||
                      job.status === "PARSED" ||
                      job.status === "UPLOADED";

                    return (
                      <tr key={job.id} className="hover:bg-slate-50/80">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-bold text-slate-700">
                              {job.fileType || "FILE"}
                            </span>
                            <span className="font-medium text-slate-900 max-w-[240px] truncate" title={job.fileName}>
                              {job.fileName}
                            </span>
                          </div>
                          <span className="text-xs text-slate-400 mt-0.5 block">
                            {formatBytes(job.fileSizeBytes)}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-xs text-slate-600 whitespace-nowrap">
                          {formatDate(job.createdAt)}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(job.status)}
                        </td>

                        <td className="px-6 py-4 font-mono text-sm font-semibold text-slate-900">
                          {job.totalRows ?? "—"}
                        </td>

                        <td className="px-6 py-4">
                          {job.processedRows !== null &&
                          job.processedRows !== undefined ? (
                            <span className="font-mono text-sm font-bold text-emerald-700">
                              {job.processedRows}
                            </span>
                          ) : job.validRows !== null &&
                            job.validRows !== undefined ? (
                            <span className="font-mono text-xs text-slate-500">
                              {job.validRows} (valid)
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-xs">
                          <div className="flex items-center gap-2">
                            {(job.invalidRows ?? 0) > 0 ? (
                              <span className="rounded bg-rose-50 px-2 py-0.5 font-semibold text-rose-700">
                                {job.invalidRows} invalid
                              </span>
                            ) : null}
                            {(job.duplicateRows ?? 0) > 0 ? (
                              <span className="rounded bg-amber-50 px-2 py-0.5 font-semibold text-amber-700">
                                {job.duplicateRows} dup
                              </span>
                            ) : null}
                            {(job.invalidRows ?? 0) === 0 &&
                            (job.duplicateRows ?? 0) === 0 ? (
                              <span className="text-slate-400">None</span>
                            ) : null}
                          </div>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedJob(job)}
                              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                            >
                              Details
                            </button>

                            {isResumeable && (
                              <button
                                type="button"
                                onClick={() =>
                                  router.push(
                                    `/configuration/business-objects/${businessObjectId}/imports/${job.id}/mapping`
                                  )
                                }
                                className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                              >
                                {job.status === "VALIDATED"
                                  ? "Execute / Review →"
                                  : "Resume →"}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Job Detail Modal */}
        {selectedJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-150">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 bg-slate-50/50">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Import Job Details
                  </h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    ID: {selectedJob.id}
                  </p>
                </div>
                <div>{getStatusBadge(selectedJob.status)}</div>
              </div>

              {/* Modal Body */}
              <div className="max-h-[70vh] overflow-y-auto px-6 py-6 space-y-6">
                {/* File Information */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                    File Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4 rounded-xl border border-slate-100 bg-slate-50/50 p-4 text-xs">
                    <div>
                      <span className="text-slate-500">File Name:</span>
                      <p className="font-semibold text-slate-900 mt-0.5 truncate">
                        {selectedJob.fileName}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500">Type & Size:</span>
                      <p className="font-semibold text-slate-900 mt-0.5">
                        {selectedJob.fileType} ({formatBytes(selectedJob.fileSizeBytes)})
                      </p>
                    </div>
                  </div>
                </div>

                {/* Metrics Breakdown */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                    Row Metrics
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="rounded-xl border border-slate-200 p-3">
                      <span className="text-xs text-slate-500">Total Rows</span>
                      <p className="text-xl font-bold text-slate-900 mt-1">
                        {selectedJob.totalRows ?? 0}
                      </p>
                    </div>
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-3">
                      <span className="text-xs text-emerald-700">Processed</span>
                      <p className="text-xl font-bold text-emerald-700 mt-1">
                        {selectedJob.processedRows ?? selectedJob.validRows ?? 0}
                      </p>
                    </div>
                    <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-3">
                      <span className="text-xs text-rose-700">Invalid</span>
                      <p className="text-xl font-bold text-rose-700 mt-1">
                        {selectedJob.invalidRows ?? 0}
                      </p>
                    </div>
                    <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-3">
                      <span className="text-xs text-amber-700">Duplicate</span>
                      <p className="text-xl font-bold text-amber-700 mt-1">
                        {selectedJob.duplicateRows ?? 0}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Timestamps */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                    Timestamps
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4 text-xs">
                    <div>
                      <span className="text-slate-500">Created:</span>
                      <p className="font-medium text-slate-800 mt-0.5">
                        {formatDate(selectedJob.createdAt)}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500">Started:</span>
                      <p className="font-medium text-slate-800 mt-0.5">
                        {formatDate(selectedJob.startedAt)}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500">Completed:</span>
                      <p className="font-medium text-slate-800 mt-0.5">
                        {formatDate(selectedJob.completedAt)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Column Mapping (if present) */}
                {selectedJob.columnMapping &&
                  Object.keys(selectedJob.columnMapping).length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                        Column Mapping
                      </h4>
                      <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200 text-xs">
                        <table className="w-full text-left">
                          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                            <tr>
                              <th className="px-4 py-2 font-semibold">
                                Source Column
                              </th>
                              <th className="px-4 py-2 font-semibold">
                                Target Field Key / ID
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-mono">
                            {Object.entries(selectedJob.columnMapping).map(
                              ([col, target]) => (
                                <tr key={col}>
                                  <td className="px-4 py-2 font-medium text-slate-900">
                                    {col}
                                  </td>
                                  <td className="px-4 py-2 text-slate-600">
                                    {String(target)}
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4 bg-slate-50/50">
                <button
                  type="button"
                  onClick={() => setSelectedJob(null)}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                >
                  Close
                </button>

                <div className="flex items-center gap-2">
                  {selectedJob.status === "VALIDATED" ? (
                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          `/configuration/business-objects/${businessObjectId}/imports/${selectedJob.id}/mapping`
                        )
                      }
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
                    >
                      Review & Execute →
                    </button>
                  ) : selectedJob.status === "COMPLETED" ||
                    selectedJob.status === "COMPLETED_WITH_ERRORS" ? (
                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          `/configuration/business-objects/${businessObjectId}/records`
                        )
                      }
                      className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
                    >
                      View Created Records →
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
