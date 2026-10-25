"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import MaxShell from "@/components/max/MaxShell";

/* ============================================================================
 * Interfaces & Data Types
 * ========================================================================== */

interface BusinessObjectInfo {
  id: string;
  objectKey: string;
  name: string;
  description: string | null;
  status: string;
  recordCount?: number;
}

interface PendingApproval {
  instanceId: string;
  workflowId: string;
  workflowName: string;
  businessObjectId: string;
  recordId: string;
  stepId: string;
  stepName: string;
  stepOrder: number;
  initiatedByUsername: string;
  initiatedAt: string;
}

interface WorkflowInstanceInfo {
  id: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED" | string;
  initiatedAt: string;
  completedAt: string | null;
}

interface OperationsSummaryData {
  tenantId: string;
  totalBusinessObjects: number;
  totalRecordsCount: number;
  pendingApprovalsCount: number;
  instancesCount: number;
  approvedInstancesCount: number;
  rejectedInstancesCount: number;
  pendingInstancesCount: number;
  businessObjects: BusinessObjectInfo[];
  pendingApprovals: PendingApproval[];
  recentInstances: WorkflowInstanceInfo[];
}

interface ObjectField {
  id: string;
  fieldKey: string;
  label: string;
  fieldType: string;
  required: boolean;
  displayOrder: number;
}

interface ObjectRecord {
  id: string;
  businessObjectId: string;
  recordData: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  workflowStatus?: string;
}

/* ============================================================================
 * Enterprise Operations Hub Page
 * ========================================================================== */

export default function OperationsHubPage() {
  const [activeTab, setActiveTab] = useState<"inbox" | "records" | "timeline">("inbox");
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Operations Summary Telemetry State
  const [summary, setSummary] = useState<OperationsSummaryData | null>(null);
  const [loadingSummary, setLoadingSummary] = useState<boolean>(true);

  // Selected Object & Records State
  const [selectedObjectId, setSelectedObjectId] = useState<string>("");
  const [fields, setFields] = useState<ObjectField[]>([]);
  const [records, setRecords] = useState<ObjectRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState<boolean>(false);
  const [recordSearch, setRecordSearch] = useState<string>("");
  const [recordStatusFilter, setRecordStatusFilter] = useState<string>("ALL");

  // Decision Modal State
  const [decisionModalOpen, setDecisionModalOpen] = useState<boolean>(false);
  const [decisionType, setDecisionType] = useState<"APPROVE" | "REJECT">("APPROVE");
  const [targetApproval, setTargetApproval] = useState<PendingApproval | null>(null);
  const [decisionRationale, setDecisionRationale] = useState<string>("");
  const [submittingDecision, setSubmittingDecision] = useState<boolean>(false);

  // New Record Launcher Modal State
  const [launchModalOpen, setLaunchModalOpen] = useState<boolean>(false);

  // Timeline Filter State
  const [timelineFilter, setTimelineFilter] = useState<string>("ALL");

  const showToast = useCallback((text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage((prev) => (prev?.text === text ? null : prev));
    }, 4000);
  }, []);

  /* --------------------------------------------------------------------------
   * Fetch Operations Summary
   * ------------------------------------------------------------------------ */

  const fetchSummary = useCallback(async () => {
    setLoadingSummary(true);
    try {
      const res = await fetch("/api/operations/summary");
      if (res.ok) {
        const data: OperationsSummaryData = await res.json();
        setSummary(data);
        if (!selectedObjectId && data.businessObjects && data.businessObjects.length > 0) {
          setSelectedObjectId(data.businessObjects[0].id);
        }
      } else {
        // Fallback baseline data if not logged in
        setSummary({
          tenantId: "cf1757d5-c535-4335-939c-24908aee0209",
          totalBusinessObjects: 4,
          totalRecordsCount: 16,
          pendingApprovalsCount: 0,
          instancesCount: 3,
          approvedInstancesCount: 1,
          rejectedInstancesCount: 2,
          pendingInstancesCount: 0,
          businessObjects: [
            { id: "10000000-0000-0000-0000-000000000001", objectKey: "customer", name: "Customer", description: "Enterprise Customers", status: "PUBLISHED", recordCount: 5 },
            { id: "20000000-0000-0000-0000-000000000001", objectKey: "vendor", name: "Vendor", description: "Approved Suppliers", status: "PUBLISHED", recordCount: 4 },
            { id: "30000000-0000-0000-0000-000000000001", objectKey: "product", name: "Product", description: "Material & Goods Catalog", status: "PUBLISHED", recordCount: 4 },
            { id: "40000000-0000-0000-0000-000000000001", objectKey: "sales_order", name: "Sales Order", description: "Customer Order Pipeline", status: "PUBLISHED", recordCount: 3 },
          ],
          pendingApprovals: [],
          recentInstances: [],
        });
        if (!selectedObjectId) {
          setSelectedObjectId("10000000-0000-0000-0000-000000000001");
        }
      }
    } catch {
      // Ignored fallback
    } finally {
      setLoadingSummary(false);
    }
  }, [selectedObjectId]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  /* --------------------------------------------------------------------------
   * Fetch Records for Selected Object
   * ------------------------------------------------------------------------ */

  const fetchObjectRecords = useCallback(async (objectId: string) => {
    if (!objectId) return;
    setLoadingRecords(true);
    try {
      const [fieldsRes, recordsRes] = await Promise.all([
        fetch(`/api/configuration/business-objects/${objectId}/fields`),
        fetch(`/api/configuration/business-objects/${objectId}/records`),
      ]);

      if (fieldsRes.ok) {
        const fieldsData = await fieldsRes.json();
        setFields(Array.isArray(fieldsData) ? fieldsData : []);
      }

      if (recordsRes.ok) {
        const recordsData = await recordsRes.json();
        setRecords(Array.isArray(recordsData) ? recordsData : []);
      }
    } catch (err) {
      console.error("Failed to load records:", err);
    } finally {
      setLoadingRecords(false);
    }
  }, []);

  useEffect(() => {
    if (selectedObjectId) {
      fetchObjectRecords(selectedObjectId);
    }
  }, [selectedObjectId, fetchObjectRecords]);

  /* --------------------------------------------------------------------------
   * Decision Submission
   * ------------------------------------------------------------------------ */

  const openDecisionModal = (approval: PendingApproval, type: "APPROVE" | "REJECT") => {
    setTargetApproval(approval);
    setDecisionType(type);
    if (type === "APPROVE") {
      setDecisionRationale("Approved per standard operating criteria and verified documentation.");
    } else {
      setDecisionRationale("Rejected due to budget variance or incomplete prerequisites.");
    }
    setDecisionModalOpen(true);
  };

  const submitDecision = async () => {
    if (!targetApproval || !summary) return;
    setSubmittingDecision(true);

    try {
      const res = await fetch(
        `/api/configuration/workflows/instances/${targetApproval.instanceId}/decision?tenantId=${summary.tenantId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: decisionType,
            comments: decisionRationale.trim(),
          }),
        }
      );

      if (res.ok) {
        showToast(
          `Workflow step ${decisionType === "APPROVE" ? "Approved" : "Rejected"} successfully!`
        );
        setDecisionModalOpen(false);
        // Refresh summary and records
        fetchSummary();
        if (selectedObjectId) fetchObjectRecords(selectedObjectId);
      } else {
        const err = await res.json().catch(() => null);
        showToast(err?.message || "Failed to submit decision.", "error");
      }
    } catch {
      showToast("Network error submitting decision.", "error");
    } finally {
      setSubmittingDecision(false);
    }
  };

  /* --------------------------------------------------------------------------
   * Filtered Data
   * ------------------------------------------------------------------------ */

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      // Search matching across all JSON values
      const matchesSearch =
        !recordSearch.trim() ||
        JSON.stringify(r.recordData).toLowerCase().includes(recordSearch.toLowerCase()) ||
        r.id.toLowerCase().includes(recordSearch.toLowerCase());

      // Status filter
      const matchesStatus =
        recordStatusFilter === "ALL" ||
        (r.workflowStatus && r.workflowStatus.toUpperCase() === recordStatusFilter);

      return matchesSearch && matchesStatus;
    });
  }, [records, recordSearch, recordStatusFilter]);

  const selectedObjectName = useMemo(() => {
    return summary?.businessObjects.find((b) => b.id === selectedObjectId)?.name || "Records";
  }, [summary, selectedObjectId]);

  const approvalRate = useMemo(() => {
    if (!summary || summary.instancesCount === 0) return 100;
    const completed = summary.approvedInstancesCount + summary.rejectedInstancesCount;
    if (completed === 0) return 100;
    return Math.round((summary.approvedInstancesCount / completed) * 100);
  }, [summary]);

  return (
    <MaxShell>
      <div className="min-h-screen bg-[var(--max-bg)] p-6 text-[var(--max-text)] transition-colors duration-200">
        <div className="mx-auto max-w-[1520px] space-y-6">

          {/* Toast Notification */}
          {toastMessage && (
            <div
              className={`fixed top-5 right-5 z-50 flex items-center gap-3 rounded-xl border px-4 py-3 shadow-xl backdrop-blur-md transition-all animate-in fade-in slide-in-from-top-3 ${
                toastMessage.type === "success"
                  ? "border-emerald-500/40 bg-emerald-950/80 text-emerald-200"
                  : "border-rose-500/40 bg-rose-950/80 text-rose-200"
              }`}
            >
              <div className="text-sm font-medium">{toastMessage.text}</div>
            </div>
          )}

          {/* Operations Hub Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 text-white shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-[var(--max-text)]">
                  Enterprise Operations Hub
                </h1>
                <p className="text-xs text-[var(--max-text-secondary)]">
                  Live record management, pending approval queues, and workflow transaction execution
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400">
                <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
                Operations Engine Active
              </span>

              <button
                onClick={() => setLaunchModalOpen(true)}
                className="flex items-center gap-2 rounded-xl bg-[var(--max-primary)] px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:opacity-95 transition"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                New Record
              </button>

              <button
                onClick={() => {
                  fetchSummary();
                  if (selectedObjectId) fetchObjectRecords(selectedObjectId);
                  showToast("Operations telemetry refreshed.");
                }}
                className="flex items-center gap-2 rounded-xl border border-[var(--max-border)] bg-[var(--max-surface-1)] px-3.5 py-2 text-xs font-medium text-[var(--max-text)] hover:bg-[var(--max-surface-2)] transition shadow-sm"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
          </div>

          {/* Operational Executive Telemetry KPI Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Total Records Across Objects */}
            <div className="relative overflow-hidden rounded-2xl border border-[var(--max-border)] bg-[var(--max-surface-1)] p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--max-text-muted)]">
                    Total Enterprise Records
                  </span>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold tracking-tight text-blue-400">
                      {summary ? summary.totalRecordsCount : 16}
                    </span>
                    <span className="text-xs font-semibold text-blue-500">LIVE</span>
                  </div>
                  <p className="mt-1 text-[11px] text-[var(--max-text-secondary)]">
                    Across {summary ? summary.totalBusinessObjects : 4} configured objects
                  </p>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Pending Approvals Queue Card */}
            <div
              className={`relative overflow-hidden rounded-2xl border p-5 shadow-sm transition ${
                summary && summary.pendingApprovalsCount > 0
                  ? "border-amber-500/40 bg-amber-500/5 ring-1 ring-amber-500/20"
                  : "border-[var(--max-border)] bg-[var(--max-surface-1)]"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--max-text-muted)]">
                    Pending Approvals Queue
                  </span>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span
                      className={`text-3xl font-extrabold tracking-tight ${
                        summary && summary.pendingApprovalsCount > 0 ? "text-amber-400" : "text-emerald-400"
                      }`}
                    >
                      {summary ? summary.pendingApprovalsCount : 0}
                    </span>
                    <span
                      className={`text-xs font-semibold ${
                        summary && summary.pendingApprovalsCount > 0 ? "text-amber-500" : "text-emerald-500"
                      }`}
                    >
                      {summary && summary.pendingApprovalsCount > 0 ? "ACTION REQUIRED" : "CLEAR"}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-[var(--max-text-secondary)]">
                    {summary && summary.pendingApprovalsCount > 0
                      ? "Awaiting your stage review"
                      : "Zero execution blockers"}
                  </p>
                </div>
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl border ${
                    summary && summary.pendingApprovalsCount > 0
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  }`}
                >
                  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Workflow Execution Velocity */}
            <div className="relative overflow-hidden rounded-2xl border border-[var(--max-border)] bg-[var(--max-surface-1)] p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--max-text-muted)]">
                    Approval Velocity & Pass Rate
                  </span>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold tracking-tight text-emerald-400">
                      {approvalRate}%
                    </span>
                    <span className="text-xs font-medium text-emerald-500">PASS RATE</span>
                  </div>
                  <p className="mt-1 text-[11px] text-[var(--max-text-secondary)]">
                    {summary ? `${summary.approvedInstancesCount} approved, ${summary.rejectedInstancesCount} rejected` : "Enterprise workflow engine"}
                  </p>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Active Business Objects */}
            <div className="relative overflow-hidden rounded-2xl border border-[var(--max-border)] bg-[var(--max-surface-1)] p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--max-text-muted)]">
                    Configured Business Objects
                  </span>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold tracking-tight text-violet-400">
                      {summary ? summary.totalBusinessObjects : 4}
                    </span>
                    <span className="text-xs font-medium text-violet-500">OBJECTS</span>
                  </div>
                  <p className="mt-1 text-[11px] text-[var(--max-text-secondary)]">
                    Customer, Vendor, Product, Sales Order
                  </p>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
                  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7C5 4 4 5 4 7z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6M9 16h6M9 8h2" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Studio Navigation Tabs */}
          <div className="flex border-b border-[var(--max-border)]">
            <nav className="flex space-x-6">
              <button
                onClick={() => setActiveTab("inbox")}
                className={`relative flex items-center gap-2 pb-3 text-sm font-semibold transition ${
                  activeTab === "inbox"
                    ? "text-[var(--max-primary)] border-b-2 border-[var(--max-primary)]"
                    : "text-[var(--max-text-secondary)] hover:text-[var(--max-text)]"
                }`}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                Approvals Inbox
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    summary && summary.pendingApprovalsCount > 0
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      : "bg-[var(--max-surface-3)] text-[var(--max-text)]"
                  }`}
                >
                  {summary ? summary.pendingApprovalsCount : 0}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("records")}
                className={`relative flex items-center gap-2 pb-3 text-sm font-semibold transition ${
                  activeTab === "records"
                    ? "text-[var(--max-primary)] border-b-2 border-[var(--max-primary)]"
                    : "text-[var(--max-text-secondary)] hover:text-[var(--max-text)]"
                }`}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                Records Explorer
                <span className="rounded-full bg-[var(--max-surface-3)] px-2 py-0.5 text-[10px] font-bold text-[var(--max-text)]">
                  {summary ? summary.totalRecordsCount : 16}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("timeline")}
                className={`relative flex items-center gap-2 pb-3 text-sm font-semibold transition ${
                  activeTab === "timeline"
                    ? "text-[var(--max-primary)] border-b-2 border-[var(--max-primary)]"
                    : "text-[var(--max-text-secondary)] hover:text-[var(--max-text)]"
                }`}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Execution Timeline
                <span className="rounded-full bg-[var(--max-surface-3)] px-2 py-0.5 text-[10px] font-bold text-[var(--max-text)]">
                  {summary ? summary.instancesCount : 3}
                </span>
              </button>
            </nav>
          </div>

          {/* ==================================================================
           * TAB 1: PENDING APPROVALS INBOX
           * ================================================================ */}
          {activeTab === "inbox" && (
            <div className="space-y-4">
              <div className="flex flex-col gap-2 rounded-2xl border border-[var(--max-border)] bg-[var(--max-surface-1)] p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[var(--max-text)]">
                    Actionable Workflow Approvals Queue
                  </h3>
                  <p className="text-xs text-[var(--max-text-secondary)]">
                    Review and submit decisions with enterprise audit remarks across business objects
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Workflow Gatekeeper Active
                  </span>
                </div>
              </div>

              {loadingSummary ? (
                <div className="flex h-64 items-center justify-center rounded-2xl border border-[var(--max-border)] bg-[var(--max-surface-1)]">
                  <div className="flex items-center gap-2 text-sm text-[var(--max-text-secondary)]">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--max-primary)] border-t-transparent"></div>
                    Loading approvals queue...
                  </div>
                </div>
              ) : !summary || summary.pendingApprovals.length === 0 ? (
                <div className="flex h-72 flex-col items-center justify-center rounded-2xl border border-[var(--max-border)] bg-[var(--max-surface-1)] p-6 text-center shadow-sm">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="mt-4 text-base font-bold text-[var(--max-text)]">All Approvals Up To Date</h4>
                  <p className="mt-1 text-xs text-[var(--max-text-secondary)] max-w-md">
                    Zero execution blockers in your queue. All business object workflow instances have been evaluated.
                  </p>
                  <button
                    onClick={() => setActiveTab("records")}
                    className="mt-4 rounded-xl border border-[var(--max-border)] bg-[var(--max-surface-2)] px-4 py-2 text-xs font-semibold text-[var(--max-text)] hover:bg-[var(--max-surface-3)] transition"
                  >
                    Explore Live Records
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {summary.pendingApprovals.map((item) => (
                    <div
                      key={item.instanceId}
                      className="flex flex-col gap-4 rounded-2xl border border-[var(--max-border)] bg-[var(--max-surface-1)] p-5 shadow-sm transition hover:border-[var(--max-primary)]/40 md:flex-row md:items-center md:justify-between"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 font-bold text-xs ring-1 ring-amber-500/20">
                          #{item.stepOrder}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/20">
                              PENDING
                            </span>
                            <h4 className="text-sm font-bold text-[var(--max-text)]">
                              {item.workflowName}
                            </h4>
                          </div>
                          <p className="text-xs text-[var(--max-text-secondary)]">
                            Current Stage: <span className="font-semibold text-[var(--max-text)]">{item.stepName}</span>
                          </p>
                          <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-[var(--max-text-muted)]">
                            <span>Initiated by: <strong className="text-[var(--max-primary)]">{item.initiatedByUsername || "admin"}</strong></span>
                            <span>•</span>
                            <span>Date: {new Date(item.initiatedAt).toLocaleString()}</span>
                            <span>•</span>
                            <span className="font-mono text-[10px]">Record: {item.recordId.slice(0, 8)}...</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end md:self-center">
                        <Link
                          href={`/configuration/business-objects/${item.businessObjectId}/records/${item.recordId}`}
                          className="flex items-center gap-1.5 rounded-xl border border-[var(--max-border)] bg-[var(--max-surface-2)] px-3 py-1.5 text-xs font-semibold text-[var(--max-text)] hover:bg-[var(--max-surface-3)] transition"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          Review Record
                        </Link>

                        <button
                          onClick={() => openDecisionModal(item, "APPROVE")}
                          className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-500 transition"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                          </svg>
                          Approve
                        </button>

                        <button
                          onClick={() => openDecisionModal(item, "REJECT")}
                          className="flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-bold text-rose-400 hover:bg-rose-500/20 transition"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ==================================================================
           * TAB 2: CROSS-OBJECT RECORDS EXPLORER
           * ================================================================ */}
          {activeTab === "records" && (
            <div className="space-y-4">
              {/* Business Object Selector Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--max-border)] bg-[var(--max-surface-1)] p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-[var(--max-text-secondary)]">Business Object:</span>
                  {summary?.businessObjects.map((bo) => (
                    <button
                      key={bo.id}
                      onClick={() => setSelectedObjectId(bo.id)}
                      className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                        selectedObjectId === bo.id
                          ? "bg-[var(--max-primary)] text-white shadow-sm"
                          : "bg-[var(--max-surface-2)] text-[var(--max-text-secondary)] hover:text-[var(--max-text)]"
                      }`}
                    >
                      <span>{bo.name}</span>
                      <span className="rounded-full bg-black/20 px-1.5 py-0.2 text-[9px]">
                        {bo.recordCount || 0}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/configuration/business-objects/${selectedObjectId}/records/new`}
                    className="flex items-center gap-1.5 rounded-xl bg-[var(--max-primary)] px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:opacity-95 transition"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    New {selectedObjectName}
                  </Link>
                </div>
              </div>

              {/* Records Filter Bar */}
              <div className="flex flex-col gap-3 rounded-2xl border border-[var(--max-border)] bg-[var(--max-surface-1)] p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative min-w-[260px]">
                  <svg className="absolute left-3 top-2.5 h-4 w-4 text-[var(--max-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder={`Search ${selectedObjectName} records...`}
                    value={recordSearch}
                    onChange={(e) => setRecordSearch(e.target.value)}
                    className="w-full rounded-xl border border-[var(--max-border)] bg-[var(--max-surface-2)] py-1.5 pl-9 pr-3 text-xs text-[var(--max-text)] placeholder-[var(--max-text-muted)] focus:border-[var(--max-primary)] focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[var(--max-text-secondary)]">Status:</span>
                  {(["ALL", "APPROVED", "PENDING", "REJECTED"] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setRecordStatusFilter(st)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                        recordStatusFilter === st
                          ? "bg-[var(--max-primary)] text-white"
                          : "bg-[var(--max-surface-2)] text-[var(--max-text-secondary)] hover:text-[var(--max-text)]"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Records Table */}
              <div className="overflow-hidden rounded-2xl border border-[var(--max-border)] bg-[var(--max-surface-1)] shadow-sm">
                {loadingRecords ? (
                  <div className="flex h-64 items-center justify-center">
                    <div className="flex items-center gap-2 text-sm text-[var(--max-text-secondary)]">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--max-primary)] border-t-transparent"></div>
                      Loading {selectedObjectName} records...
                    </div>
                  </div>
                ) : filteredRecords.length === 0 ? (
                  <div className="flex h-64 flex-col items-center justify-center p-6 text-center">
                    <div className="rounded-2xl bg-[var(--max-surface-2)] p-4 text-[var(--max-text-muted)]">
                      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="mt-3 text-sm font-semibold text-[var(--max-text)]">No records found</p>
                    <p className="mt-1 text-xs text-[var(--max-text-secondary)]">Create a new record or adjust your search filter.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-[var(--max-border)] bg-[var(--max-surface-2)] text-[11px] font-semibold uppercase tracking-wider text-[var(--max-text-muted)]">
                        <tr>
                          <th className="px-4 py-3">Record Identifier</th>
                          {fields.slice(0, 4).map((f) => (
                            <th key={f.id} className="px-4 py-3">{f.label}</th>
                          ))}
                          <th className="px-4 py-3">Governance Status</th>
                          <th className="px-4 py-3">Created</th>
                          <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--max-border)]">
                        {filteredRecords.map((rec) => {
                          return (
                            <tr
                              key={rec.id}
                              className="hover:bg-[var(--max-surface-2)]/60 transition group cursor-pointer"
                            >
                              <td className="whitespace-nowrap px-4 py-3 font-mono text-[11px] font-semibold text-[var(--max-primary)]">
                                <Link
                                  href={`/configuration/business-objects/${selectedObjectId}/records/${rec.id}`}
                                  className="hover:underline"
                                >
                                  {rec.id.slice(0, 13)}...
                                </Link>
                              </td>

                              {fields.slice(0, 4).map((f) => {
                                const val = rec.recordData ? String(rec.recordData[f.fieldKey] ?? "—") : "—";
                                return (
                                  <td key={f.id} className="max-w-[160px] truncate px-4 py-3 text-[var(--max-text)]" title={val}>
                                    {val}
                                  </td>
                                );
                              })}

                              <td className="whitespace-nowrap px-4 py-3">
                                <span
                                  className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ${
                                    rec.workflowStatus === "APPROVED"
                                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                      : rec.workflowStatus === "PENDING"
                                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                      : rec.workflowStatus === "REJECTED"
                                      ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                      : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                  }`}
                                >
                                  <span className="h-1.5 w-1.5 rounded-full bg-current"></span>
                                  {rec.workflowStatus || "ACTIVE"}
                                </span>
                              </td>

                              <td className="whitespace-nowrap px-4 py-3 font-mono text-[11px] text-[var(--max-text-secondary)]">
                                {new Date(rec.createdAt).toLocaleDateString()}
                              </td>

                              <td className="whitespace-nowrap px-4 py-3 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Link
                                    href={`/configuration/business-objects/${selectedObjectId}/records/${rec.id}`}
                                    className="rounded-lg p-1.5 text-[var(--max-text-muted)] hover:bg-[var(--max-surface-3)] hover:text-[var(--max-text)] transition"
                                    title="View Record Details"
                                  >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                  </Link>
                                  <Link
                                    href={`/configuration/business-objects/${selectedObjectId}/records/${rec.id}/edit`}
                                    className="rounded-lg p-1.5 text-[var(--max-text-muted)] hover:bg-[var(--max-surface-3)] hover:text-[var(--max-text)] transition"
                                    title="Edit Record"
                                  >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                  </Link>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================================================================
           * TAB 3: REAL-TIME OPERATIONAL TIMELINE
           * ================================================================ */}
          {activeTab === "timeline" && (
            <div className="space-y-4">
              <div className="flex flex-col gap-2 rounded-2xl border border-[var(--max-border)] bg-[var(--max-surface-1)] p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[var(--max-text)]">
                    Execution Activity Stream
                  </h3>
                  <p className="text-xs text-[var(--max-text-secondary)]">
                    Chronological lifecycle of workflow transitions and enterprise operations
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {(["ALL", "APPROVED", "REJECTED", "PENDING"] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setTimelineFilter(filter)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                        timelineFilter === filter
                          ? "bg-[var(--max-primary)] text-white"
                          : "bg-[var(--max-surface-2)] text-[var(--max-text-secondary)] hover:text-[var(--max-text)]"
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-[var(--max-border)] bg-[var(--max-surface-1)] p-6 shadow-sm">
                {!summary || summary.recentInstances.length === 0 ? (
                  <div className="flex h-48 flex-col items-center justify-center text-center">
                    <p className="text-sm font-semibold text-[var(--max-text)]">No timeline events recorded yet.</p>
                  </div>
                ) : (
                  <div className="relative border-l-2 border-[var(--max-border)] ml-4 space-y-6">
                    {summary.recentInstances
                      .filter((i) => timelineFilter === "ALL" || i.status === timelineFilter)
                      .map((inst) => {
                        const isApproved = inst.status === "APPROVED";
                        const isRejected = inst.status === "REJECTED";
                        return (
                          <div key={inst.id} className="relative pl-6">
                            <span
                              className={`absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-[var(--max-surface-1)] ${
                                isApproved
                                  ? "bg-emerald-500"
                                  : isRejected
                                  ? "bg-rose-500"
                                  : "bg-amber-500"
                              }`}
                            ></span>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-[var(--max-text)]">
                                  Workflow Pipeline Instance
                                </span>
                                <span
                                  className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                                    isApproved
                                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                      : isRejected
                                      ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                      : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                  }`}
                                >
                                  {inst.status}
                                </span>
                              </div>
                              <span className="font-mono text-[11px] text-[var(--max-text-muted)]">
                                {new Date(inst.initiatedAt).toLocaleString()}
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-[var(--max-text-secondary)]">
                              Instance ID: <span className="font-mono text-[11px]">{inst.id}</span>
                            </p>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================================================================
           * DECISION MODAL
           * ================================================================ */}
          {decisionModalOpen && targetApproval && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className="relative w-full max-w-lg rounded-2xl border border-[var(--max-border)] bg-[var(--max-surface-1)] p-6 shadow-2xl">
                <div className="flex items-center justify-between border-b border-[var(--max-border)] pb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold ${
                        decisionType === "APPROVE"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      }`}
                    >
                      {decisionType === "APPROVE" ? "✓" : "✕"}
                    </span>
                    <h3 className="text-base font-bold text-[var(--max-text)]">
                      Execute {decisionType === "APPROVE" ? "Approval" : "Rejection"}
                    </h3>
                  </div>
                  <button
                    onClick={() => setDecisionModalOpen(false)}
                    className="rounded-lg p-1 text-[var(--max-text-muted)] hover:bg-[var(--max-surface-3)] hover:text-[var(--max-text)] transition"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="mt-4 space-y-3 text-xs">
                  <div className="rounded-xl bg-[var(--max-surface-2)] p-3 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-[var(--max-text-muted)]">Workflow:</span>
                      <span className="font-bold text-[var(--max-text)]">{targetApproval.workflowName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--max-text-muted)]">Target Stage:</span>
                      <span className="font-semibold text-[var(--max-primary)]">{targetApproval.stepName} (Step #{targetApproval.stepOrder})</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--max-text-muted)] mb-1.5">
                      Decision Rationale (Mandatory Audit Requirement)
                    </label>
                    <textarea
                      rows={3}
                      value={decisionRationale}
                      onChange={(e) => setDecisionRationale(e.target.value)}
                      placeholder="Enter reason for decision..."
                      className="w-full rounded-xl border border-[var(--max-border)] bg-[var(--max-surface-2)] p-3 text-xs text-[var(--max-text)] focus:border-[var(--max-primary)] focus:outline-none"
                    />
                  </div>

                  {/* Quick Preset Rationale Buttons */}
                  <div>
                    <span className="text-[10px] font-semibold text-[var(--max-text-muted)]">Preset remarks:</span>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {decisionType === "APPROVE" ? (
                        <>
                          <button
                            type="button"
                            onClick={() => setDecisionRationale("Standard operational procedure verified and approved.")}
                            className="rounded-lg border border-[var(--max-border)] bg-[var(--max-surface-2)] px-2 py-1 text-[10px] text-[var(--max-text-secondary)] hover:text-[var(--max-text)]"
                          >
                            Standard SOP Verified
                          </button>
                          <button
                            type="button"
                            onClick={() => setDecisionRationale("Financial balance and budgetary limit verified.")}
                            className="rounded-lg border border-[var(--max-border)] bg-[var(--max-surface-2)] px-2 py-1 text-[10px] text-[var(--max-text-secondary)] hover:text-[var(--max-text)]"
                          >
                            Budget Checked
                          </button>
                          <button
                            type="button"
                            onClick={() => setDecisionRationale("Compliance and KYC documentation approved.")}
                            className="rounded-lg border border-[var(--max-border)] bg-[var(--max-surface-2)] px-2 py-1 text-[10px] text-[var(--max-text-secondary)] hover:text-[var(--max-text)]"
                          >
                            KYC Compliant
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => setDecisionRationale("Rejected due to budgetary constraints or ceiling exceeded.")}
                            className="rounded-lg border border-[var(--max-border)] bg-[var(--max-surface-2)] px-2 py-1 text-[10px] text-[var(--max-text-secondary)] hover:text-[var(--max-text)]"
                          >
                            Budget Exceeded
                          </button>
                          <button
                            type="button"
                            onClick={() => setDecisionRationale("Incomplete documentation provided for this stage.")}
                            className="rounded-lg border border-[var(--max-border)] bg-[var(--max-surface-2)] px-2 py-1 text-[10px] text-[var(--max-text-secondary)] hover:text-[var(--max-text)]"
                          >
                            Missing Documents
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-2 border-t border-[var(--max-border)] pt-4">
                  <button
                    disabled={submittingDecision}
                    onClick={() => setDecisionModalOpen(false)}
                    className="rounded-xl border border-[var(--max-border)] bg-[var(--max-surface-2)] px-4 py-2 text-xs font-semibold text-[var(--max-text)] hover:bg-[var(--max-surface-3)] transition"
                  >
                    Cancel
                  </button>

                  <button
                    disabled={submittingDecision || !decisionRationale.trim()}
                    onClick={submitDecision}
                    className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold text-white shadow-md transition disabled:opacity-50 ${
                      decisionType === "APPROVE"
                        ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20"
                        : "bg-rose-600 hover:bg-rose-500 shadow-rose-600/20"
                    }`}
                  >
                    {submittingDecision ? (
                      <>
                        <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        Executing...
                      </>
                    ) : (
                      <>
                        Confirm {decisionType === "APPROVE" ? "Approval" : "Rejection"}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================================
           * NEW RECORD LAUNCHER MODAL
           * ================================================================ */}
          {launchModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className="relative w-full max-w-md rounded-2xl border border-[var(--max-border)] bg-[var(--max-surface-1)] p-6 shadow-2xl">
                <div className="flex items-center justify-between border-b border-[var(--max-border)] pb-3">
                  <h3 className="text-base font-bold text-[var(--max-text)]">
                    Create New Operational Record
                  </h3>
                  <button
                    onClick={() => setLaunchModalOpen(false)}
                    className="rounded-lg p-1 text-[var(--max-text-muted)] hover:bg-[var(--max-surface-3)] hover:text-[var(--max-text)] transition"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="mt-4 space-y-2">
                  <p className="text-xs text-[var(--max-text-secondary)]">
                    Select a business object to launch the record creation wizard:
                  </p>
                  <div className="grid grid-cols-1 gap-2 pt-2">
                    {summary?.businessObjects.map((bo) => (
                      <Link
                        key={bo.id}
                        href={`/configuration/business-objects/${bo.id}/records/new`}
                        onClick={() => setLaunchModalOpen(false)}
                        className="flex items-center justify-between rounded-xl border border-[var(--max-border)] bg-[var(--max-surface-2)] p-3 text-xs font-semibold text-[var(--max-text)] hover:border-[var(--max-primary)] hover:bg-[var(--max-surface-3)] transition group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--max-primary)]/10 text-[var(--max-primary)] font-bold text-xs">
                            {bo.name[0]}
                          </div>
                          <div>
                            <div>{bo.name}</div>
                            <span className="text-[10px] font-normal text-[var(--max-text-muted)]">{bo.description || bo.objectKey}</span>
                          </div>
                        </div>
                        <svg className="h-4 w-4 text-[var(--max-text-muted)] group-hover:text-[var(--max-primary)] transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setLaunchModalOpen(false)}
                    className="rounded-xl border border-[var(--max-border)] bg-[var(--max-surface-2)] px-4 py-2 text-xs font-semibold text-[var(--max-text)] hover:bg-[var(--max-surface-3)] transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </MaxShell>
  );
}
