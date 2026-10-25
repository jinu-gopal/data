"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import MaxShell from "@/components/max/MaxShell";

type BusinessObject = {
  id: string;
  objectKey: string;
  name: string;
  description?: string | null;
  status: string;
};

type Field = {
  id: string;
  fieldKey: string;
  label: string;
  description?: string | null;
  fieldType: string;
  required: boolean;
  uniqueValue: boolean;
  readOnly: boolean;
  hidden: boolean;
  defaultValue?: string | null;
  minValue?: number | null;
  maxValue?: number | null;
  validationPattern?: string | null;
  displayOrder: number;
};

type FieldOption = {
  id: string;
  optionValue: string;
  optionLabel: string;
  displayOrder: number;
  active: boolean;
};

type UserOption = {
  id: string;
  username: string;
  email?: string | null;
};

type BusinessObjectRecord = {
  id: string;
  businessObjectId: string;
  recordData: Record<string, unknown>;
  createdBy?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

type Workflow = {
  id: string;
  tenantId: string;
  businessObjectId: string;
  businessObjectName?: string;
  workflowKey: string;
  name: string;
  description?: string;
  triggerType: "MANUAL_SUBMISSION" | "RECORD_CREATION" | "RECORD_UPDATE" | "FIELD_CHANGE";
  status: "DRAFT" | "ACTIVE" | "INACTIVE";
  stepCount?: number;
  steps?: WorkflowStep[];
};

type WorkflowStep = {
  id: string;
  workflowId: string;
  stepOrder: number;
  name: string;
  stepType: "APPROVAL" | "NOTIFICATION" | "AUTO_ACTION";
  approverRoleId?: string;
  approverRoleName?: string;
  approverUserId?: string;
  approverUsername?: string;
  conditionExpression?: string;
  statusOnApproval: string;
  statusOnRejection: string;
  timeoutHours?: number;
};

type WorkflowAction = {
  id: string;
  instanceId: string;
  stepId: string;
  stepName?: string;
  stepOrder?: number;
  actorUserId: string;
  actorUsername?: string;
  action: "APPROVED" | "REJECTED" | "DELEGATED";
  comments: string;
  actionTimestamp: string;
};

type WorkflowInstance = {
  id: string;
  tenantId: string;
  workflowId: string;
  workflowName?: string;
  workflowKey?: string;
  businessObjectId: string;
  businessObjectName?: string;
  businessObjectKey?: string;
  recordId: string;
  currentStepId?: string;
  currentStepName?: string;
  currentStepOrder: number;
  totalSteps?: number;
  approverRoleId?: string;
  approverRoleName?: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  initiatedBy: string;
  initiatorUsername?: string;
  initiatedAt: string;
  completedAt?: string;
  contextData?: Record<string, unknown>;
  actions?: WorkflowAction[];
  steps?: WorkflowStep[];
};

const DEFAULT_TENANT_ID = "cf1757d5-c535-4335-939c-24908aee0209";

export default function RecordDetailWithWorkflowGatingPage() {
  const params = useParams();
  const router = useRouter();

  const businessObjectId = params.businessObjectId as string;
  const recordId = params.recordId as string;
  const tenantId = DEFAULT_TENANT_ID;

  // Domain state
  const [businessObject, setBusinessObject] = useState<BusinessObject | null>(null);
  const [fields, setFields] = useState<Field[]>([]);
  const [options, setOptions] = useState<Record<string, FieldOption[]>>({});
  const [users, setUsers] = useState<UserOption[]>([]);
  const [record, setRecord] = useState<BusinessObjectRecord | null>(null);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [instances, setInstances] = useState<WorkflowInstance[]>([]);

  // UI state
  const [activeTab, setActiveTab] = useState<"fields" | "workflow" | "audit">("fields");
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState<Record<string, unknown>>({});
  const [savingRecord, setSavingRecord] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Workflow Submission Modal
  const [showSubmitWorkflowModal, setShowSubmitWorkflowModal] = useState(false);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState("");
  const [submittingWorkflow, setSubmittingWorkflow] = useState(false);

  // Approval / Decision Modal
  const [decisionModal, setDecisionModal] = useState<{
    instanceId: string;
    action: "APPROVED" | "REJECTED";
    stepName: string;
    targetName: string;
  } | null>(null);
  const [decisionComment, setDecisionComment] = useState("");
  const [decisionError, setDecisionError] = useState<string | null>(null);
  const [submittingDecision, setSubmittingDecision] = useState(false);

  const showToast = useCallback((text: string, type: "success" | "error" = "success") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // Fetch initial data
  const loadData = useCallback(async () => {
    if (!businessObjectId || !recordId) return;
    setLoading(true);

    try {
      // 1. Fetch Business Object & Fields & Users
      const [boRes, fieldsRes, usersRes, recRes] = await Promise.all([
        fetch("/api/configuration/business-objects"),
        fetch(`/api/configuration/business-objects/${businessObjectId}/fields`),
        fetch("/api/users"),
        fetch(`/api/configuration/business-objects/${businessObjectId}/records/${recordId}`),
      ]);

      if (boRes.ok) {
        const bos: BusinessObject[] = await boRes.json();
        const currentBo = bos.find((b) => b.id === businessObjectId) || null;
        setBusinessObject(currentBo);
      }

      if (fieldsRes.ok) {
        const fData: Field[] = await fieldsRes.json();
        setFields(fData.sort((a, b) => a.displayOrder - b.displayOrder));

        // Load options for choice fields
        const choiceFields = fData.filter(
          (f) => f.fieldType === "CHOICE" || f.fieldType === "MULTI_CHOICE"
        );
        const optionsMap: Record<string, FieldOption[]> = {};
        await Promise.all(
          choiceFields.map(async (field) => {
            const optRes = await fetch(
              `/api/configuration/business-objects/${businessObjectId}/fields/${field.id}/options`
            );
            if (optRes.ok) {
              optionsMap[field.fieldKey] = await optRes.json();
            }
          })
        );
        setOptions(optionsMap);
      }

      if (usersRes.ok) {
        setUsers(await usersRes.json());
      }

      if (recRes.ok) {
        const rData: BusinessObjectRecord = await recRes.json();
        setRecord(rData);
        setEditValues(rData.recordData || {});
      } else {
        showToast("Record not found or access denied", "error");
      }

      // 2. Fetch Workflows for this business object
      const wfRes = await fetch(
        `/api/configuration/workflows?tenantId=${tenantId}&businessObjectId=${businessObjectId}`
      );
      if (wfRes.ok) {
        const wfData: Workflow[] = await wfRes.json();
        setWorkflows(wfData);
        if (wfData.length > 0) {
          setSelectedWorkflowId(wfData[0].id);
        }
      }

      // 3. Fetch Workflow Instances for this record
      const instRes = await fetch(
        `/api/configuration/workflows/instances?tenantId=${tenantId}&recordId=${recordId}`
      );
      if (instRes.ok) {
        setInstances(await instRes.json());
      }
    } catch (err) {
      console.error("Failed to load record details:", err);
      showToast("Error loading record data", "error");
    } finally {
      setLoading(false);
    }
  }, [businessObjectId, recordId, tenantId, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Active Pending Instance (Governance gate)
  const activePendingInstance = useMemo(() => {
    return instances.find((i) => i.status === "PENDING") || null;
  }, [instances]);

  // Latest Completed or Rejected Instance
  const latestFinishedInstance = useMemo(() => {
    return (
      instances
        .filter((i) => i.status === "APPROVED" || i.status === "REJECTED")
        .sort(
          (a, b) =>
            new Date(b.completedAt || b.initiatedAt).getTime() -
            new Date(a.completedAt || a.initiatedAt).getTime()
        )[0] || null
    );
  }, [instances]);

  // Overall governance status
  const governanceStatus = useMemo(() => {
    if (activePendingInstance) return "PENDING";
    if (latestFinishedInstance) return latestFinishedInstance.status;
    const rawStatus = String(record?.recordData?.workflow_status || "").toUpperCase();
    if (rawStatus === "APPROVED" || rawStatus === "REJECTED" || rawStatus === "PENDING") {
      return rawStatus;
    }
    return "UNSUBMITTED";
  }, [activePendingInstance, latestFinishedInstance, record]);

  // Compute Primary Title for Record
  const recordTitle = useMemo(() => {
    if (!record?.recordData) return "Record Details";
    const data = record.recordData;
    return String(
      data.company_name ||
        data.name ||
        data.order_number ||
        data.customer_name ||
        data.product_name ||
        data.title ||
        `Record ${record.id.slice(0, 8)}`
    );
  }, [record]);

  // Field change handler in edit mode
  const handleFieldChange = (key: string, value: unknown) => {
    setEditValues((prev) => ({ ...prev, [key]: value }));
  };

  // Save record changes
  const handleSaveRecord = async () => {
    if (!record) return;
    setSavingRecord(true);
    try {
      const res = await fetch(
        `/api/configuration/business-objects/${businessObjectId}/records/${recordId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editValues),
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to update record");
      }

      const updated = await res.json();
      setRecord(updated);
      setEditValues(updated.recordData || {});
      setIsEditing(false);
      showToast("Record updated successfully");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Save failed";
      showToast(msg, "error");
    } finally {
      setSavingRecord(false);
    }
  };

  // Dispatch / Submit Record into a Workflow Pipeline
  const handleDispatchWorkflow = async () => {
    if (!selectedWorkflowId || !record) return;
    setSubmittingWorkflow(true);
    try {
      const res = await fetch(
        `/api/configuration/workflows/${selectedWorkflowId}/instances?tenantId=${tenantId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recordId: record.id,
            contextData: record.recordData || {},
          }),
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to submit record for approval");
      }

      showToast("✓ Record successfully submitted into approval pipeline!");
      setShowSubmitWorkflowModal(false);

      // Reload instances and record
      const instRes = await fetch(
        `/api/configuration/workflows/instances?tenantId=${tenantId}&recordId=${recordId}`
      );
      if (instRes.ok) setInstances(await instRes.json());

      const recRes = await fetch(
        `/api/configuration/business-objects/${businessObjectId}/records/${recordId}`
      );
      if (recRes.ok) setRecord(await recRes.json());
      setActiveTab("workflow");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Workflow dispatch failed";
      showToast(msg, "error");
    } finally {
      setSubmittingWorkflow(false);
    }
  };

  // Submit Approval / Rejection Decision
  const handleDecisionSubmit = async () => {
    if (!decisionModal) return;
    setDecisionError(null);

    const fallbackRemark =
      decisionModal.action === "APPROVED"
        ? "Verified and approved in accordance with workflow stage requirements."
        : "Rejected during stage compliance review due to policy threshold requirements.";

    const finalComments = decisionComment.trim() || fallbackRemark;

    setSubmittingDecision(true);
    try {
      const res = await fetch(
        `/api/configuration/workflows/instances/${decisionModal.instanceId}/decision?tenantId=${tenantId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: decisionModal.action,
            comments: finalComments,
          }),
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const errorMsg =
          err.message ||
          (err.error === "UNAUTHORIZED"
            ? "Session expired. Please sign in again."
            : `Failed to register decision (HTTP ${res.status})`);
        setDecisionError(errorMsg);
        showToast(errorMsg, "error");
        return;
      }

      showToast(
        decisionModal.action === "APPROVED"
          ? "✓ Stage approval registered successfully"
          : "✕ Workflow record marked as Rejected"
      );

      setDecisionModal(null);
      setDecisionComment("");
      setDecisionError(null);

      // Refresh instances and record
      const instRes = await fetch(
        `/api/configuration/workflows/instances?tenantId=${tenantId}&recordId=${recordId}`
      );
      if (instRes.ok) setInstances(await instRes.json());

      const recRes = await fetch(
        `/api/configuration/business-objects/${businessObjectId}/records/${recordId}`
      );
      if (recRes.ok) setRecord(await recRes.json());
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error executing decision";
      setDecisionError(msg);
      showToast(msg, "error");
    } finally {
      setSubmittingDecision(false);
    }
  };

  // Helper formatting for field display
  const formatValue = (field: Field, val: unknown) => {
    if (val === null || val === undefined || val === "") return "—";
    if (field.fieldType === "CURRENCY") {
      const num = Number(val);
      return isNaN(num)
        ? String(val)
        : `$${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    if (field.fieldType === "NUMBER") {
      const num = Number(val);
      return isNaN(num) ? String(val) : num.toLocaleString();
    }
    if (field.fieldType === "CHOICE") {
      const opts = options[field.fieldKey] || [];
      const match = opts.find((o) => o.optionValue === String(val));
      return match ? match.optionLabel : String(val);
    }
    if (field.fieldType === "BOOLEAN") {
      return val === true || val === "true" ? "Yes" : "No";
    }
    if (field.fieldType === "USER") {
      const u = users.find((user) => user.id === String(val));
      return u ? `${u.username} (${u.email || "No email"})` : String(val);
    }
    if (field.fieldType === "DATE" || field.fieldType === "DATETIME") {
      try {
        return new Date(String(val)).toLocaleDateString();
      } catch {
        return String(val);
      }
    }
    return String(val);
  };

  if (loading) {
    return (
      <MaxShell>
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="h-10 w-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400 text-sm font-medium">Loading record & governance context...</p>
          </div>
        </div>
      </MaxShell>
    );
  }

  if (!record || !businessObject) {
    return (
      <MaxShell>
        <div className="min-h-screen bg-slate-950 text-slate-100 p-6 flex flex-col items-center justify-center">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full text-center space-y-4">
            <span className="text-4xl">🔍</span>
            <h2 className="text-xl font-bold text-white">Record Not Found</h2>
            <p className="text-slate-400 text-xs">
              The requested record could not be loaded or was removed from this business object.
            </p>
            <button
              onClick={() =>
                router.push(
                  `/configuration/business-objects/${businessObjectId}/records`
                )
              }
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
            >
              ← Back to Records Table
            </button>
          </div>
        </div>
      </MaxShell>
    );
  }

  return (
    <MaxShell>
      <div className="min-h-screen bg-slate-950 text-slate-100 p-6 space-y-6">
        {/* Global Floating Toast */}
        {toast && (
          <div
            className={`fixed bottom-6 right-6 z-[9999] px-5 py-3.5 rounded-xl shadow-2xl flex items-center space-x-3 text-sm font-medium border transition-all animate-bounce ${
              toast.type === "success"
                ? "bg-emerald-950/95 text-emerald-200 border-emerald-700 shadow-emerald-900/40"
                : "bg-rose-950/95 text-rose-200 border-rose-700 shadow-rose-900/40"
            }`}
          >
            <span>{toast.type === "success" ? "✓" : "⚠"}</span>
            <span>{toast.text}</span>
          </div>
        )}

        {/* Top Breadcrumb Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <Link href="/configuration" className="hover:text-slate-200">
              Configuration
            </Link>
            <span>/</span>
            <Link href="/configuration/business-objects" className="hover:text-slate-200">
              Business Objects
            </Link>
            <span>/</span>
            <Link
              href={`/configuration/business-objects/${businessObjectId}/records`}
              className="hover:text-slate-200 font-medium text-slate-300"
            >
              {businessObject.name} Records
            </Link>
            <span>/</span>
            <span className="text-emerald-400 font-semibold truncate max-w-xs">{recordTitle}</span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() =>
                router.push(
                  `/configuration/business-objects/${businessObjectId}/records`
                )
              }
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-medium cursor-pointer transition-colors"
            >
              ← Back to Records
            </button>

            {isEditing ? (
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setEditValues(record.recordData || {});
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveRecord}
                  disabled={savingRecord}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-md shadow-emerald-950/40 cursor-pointer disabled:opacity-50"
                >
                  {savingRecord ? "Saving..." : "Save Changes"}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                disabled={governanceStatus === "PENDING"}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  governanceStatus === "PENDING"
                    ? "bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed"
                    : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200 hover:text-white"
                }`}
                title={
                  governanceStatus === "PENDING"
                    ? "Field modifications are locked while undergoing governance review"
                    : "Edit record fields"
                }
              >
                {governanceStatus === "PENDING" ? "🔒 Locked for Review" : "✏️ Edit Record"}
              </button>
            )}

            {governanceStatus !== "PENDING" && (
              <button
                type="button"
                onClick={() => setShowSubmitWorkflowModal(true)}
                className="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg text-xs font-bold shadow-md shadow-indigo-950/40 flex items-center space-x-1.5 cursor-pointer"
              >
                <span>⚡</span>
                <span>Submit for Approval</span>
              </button>
            )}
          </div>
        </div>

        {/* HERO GOVERNANCE STATUS CARD */}
        <div
          className={`p-6 rounded-2xl border shadow-xl transition-all ${
            governanceStatus === "PENDING"
              ? "bg-gradient-to-br from-amber-950/30 via-slate-900 to-slate-900 border-amber-500/40 shadow-amber-950/20"
              : governanceStatus === "APPROVED"
              ? "bg-gradient-to-br from-emerald-950/30 via-slate-900 to-slate-900 border-emerald-500/40 shadow-emerald-950/20"
              : governanceStatus === "REJECTED"
              ? "bg-gradient-to-br from-rose-950/30 via-slate-900 to-slate-900 border-rose-500/40 shadow-rose-950/20"
              : "bg-slate-900 border-slate-800 shadow-slate-950/40"
          }`}
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-black text-white tracking-tight">{recordTitle}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                  {businessObject.name}
                </span>

                {/* Status Badges */}
                {governanceStatus === "PENDING" && (
                  <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                    <span className="h-2 w-2 rounded-full bg-amber-400" />
                    <span>UNDER REVIEW: STAGE {activePendingInstance?.currentStepOrder}</span>
                  </span>
                )}
                {governanceStatus === "APPROVED" && (
                  <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span>✓ FULLY APPROVED</span>
                  </span>
                )}
                {governanceStatus === "REJECTED" && (
                  <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                    <span className="h-2 w-2 rounded-full bg-rose-400" />
                    <span>✕ GOVERNANCE REJECTED</span>
                  </span>
                )}
                {governanceStatus === "UNSUBMITTED" && (
                  <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-400 border border-slate-700">
                    <span>DRAFT / NOT SUBMITTED</span>
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-400">
                Record ID: <span className="font-mono text-slate-300">{record.id}</span> • Created:{" "}
                {new Date(record.createdAt || Date.now()).toLocaleString()}
              </p>
            </div>

            {/* Quick Decision Action Panel if Record is Pending */}
            {activePendingInstance && (
              <div className="bg-slate-950/80 border border-amber-500/30 p-4 rounded-xl flex flex-col sm:flex-row items-center gap-3">
                <div className="text-left sm:text-right">
                  <p className="text-[11px] text-amber-400 font-bold uppercase tracking-wider">
                    Action Required
                  </p>
                  <p className="text-xs text-white font-medium">
                    {activePendingInstance.currentStepName || "Approval Stage"}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Role: {activePendingInstance.approverRoleName || "Authorized Manager"}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setDecisionModal({
                        instanceId: activePendingInstance.id,
                        action: "APPROVED",
                        stepName: activePendingInstance.currentStepName || "Approval Stage",
                        targetName: recordTitle,
                      });
                      setDecisionComment(
                        "Verified and approved in accordance with workflow stage requirements."
                      );
                      setDecisionError(null);
                    }}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-md shadow-emerald-950/40 flex items-center space-x-1 cursor-pointer transition-all"
                  >
                    <span>✓</span>
                    <span>Approve</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDecisionModal({
                        instanceId: activePendingInstance.id,
                        action: "REJECTED",
                        stepName: activePendingInstance.currentStepName || "Approval Stage",
                        targetName: recordTitle,
                      });
                      setDecisionComment(
                        "Rejected during stage compliance review due to policy threshold requirements."
                      );
                      setDecisionError(null);
                    }}
                    className="px-3.5 py-2 bg-rose-950/80 hover:bg-rose-900 border border-rose-700/60 text-rose-300 rounded-lg text-xs font-bold flex items-center space-x-1 cursor-pointer transition-all"
                  >
                    <span>✕</span>
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Stepper Pipeline Progress Indicator */}
          {activePendingInstance && activePendingInstance.steps && (
            <div className="mt-6 pt-6 border-t border-slate-800/80">
              <p className="text-xs font-semibold text-slate-300 mb-4">
                Pipeline Progress: {activePendingInstance.workflowName}
              </p>
              <div className="flex items-center w-full">
                {activePendingInstance.steps.map((step, idx) => {
                  const isCurrent = step.id === activePendingInstance.currentStepId;
                  const isPassed = step.stepOrder < activePendingInstance.currentStepOrder;
                  return (
                    <div key={step.id} className="flex-1 flex items-center">
                      <div className="flex flex-col items-center">
                        <div
                          className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                            isCurrent
                              ? "bg-amber-500 text-slate-950 ring-4 ring-amber-500/20 animate-pulse font-black"
                              : isPassed
                              ? "bg-emerald-600 text-white"
                              : "bg-slate-800 text-slate-400 border border-slate-700"
                          }`}
                        >
                          {isPassed ? "✓" : step.stepOrder}
                        </div>
                        <span className="text-[11px] font-medium text-slate-300 mt-2 text-center max-w-[120px] truncate">
                          {step.name}
                        </span>
                        <span className="text-[9px] text-slate-500 font-mono">
                          {isCurrent ? "Active Gate" : isPassed ? "Complete" : "Pending"}
                        </span>
                      </div>
                      {idx < (activePendingInstance.steps?.length ?? 0) - 1 && (
                        <div
                          className={`flex-1 h-0.5 mx-2 ${
                            isPassed ? "bg-emerald-500" : "bg-slate-800"
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* TAB CONTROLS */}
        <div className="flex items-center space-x-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800 max-w-fit">
          <button
            type="button"
            onClick={() => setActiveTab("fields")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center space-x-2 ${
              activeTab === "fields"
                ? "bg-slate-800 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <span>📋</span>
            <span>Record Fields ({fields.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("workflow")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center space-x-2 ${
              activeTab === "workflow"
                ? "bg-slate-800 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <span>⚡</span>
            <span>Approval Pipeline ({instances.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("audit")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center space-x-2 ${
              activeTab === "audit"
                ? "bg-slate-800 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <span>📜</span>
            <span>Audit Trail</span>
          </button>
        </div>

        {/* TAB 1: RECORD FIELDS */}
        {activeTab === "fields" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <h2 className="text-base font-bold text-white">Dynamic Field Values</h2>
                    <p className="text-xs text-slate-400">
                      Defined schema attributes for {businessObject.name}
                    </p>
                  </div>
                  {governanceStatus === "PENDING" && (
                    <span className="text-xs text-amber-400 bg-amber-950/60 border border-amber-800/60 px-3 py-1 rounded-lg flex items-center space-x-1.5 font-medium">
                      <span>🔒</span>
                      <span>Read-only under active approval</span>
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {fields.map((field) => {
                    const val = isEditing
                      ? editValues[field.fieldKey]
                      : record.recordData?.[field.fieldKey];

                    return (
                      <div
                        key={field.id}
                        className={`p-4 rounded-xl border transition-all ${
                          isEditing
                            ? "bg-slate-950/80 border-slate-700/80"
                            : "bg-slate-950/40 border-slate-800/60 hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-semibold text-slate-300">
                            {field.label}
                            {field.required && (
                              <span className="text-rose-500 ml-0.5">*</span>
                            )}
                          </label>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                            {field.fieldType}
                          </span>
                        </div>

                        {isEditing ? (
                          field.fieldType === "CHOICE" ? (
                            <select
                              value={String(val ?? "")}
                              onChange={(e) =>
                                handleFieldChange(field.fieldKey, e.target.value)
                              }
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                            >
                              <option value="">-- Select {field.label} --</option>
                              {(options[field.fieldKey] || []).map((opt) => (
                                <option key={opt.id} value={opt.optionValue}>
                                  {opt.optionLabel}
                                </option>
                              ))}
                            </select>
                          ) : field.fieldType === "BOOLEAN" ? (
                            <div className="flex items-center space-x-3 mt-2">
                              <label className="flex items-center space-x-1.5 text-xs text-slate-300 cursor-pointer">
                                <input
                                  type="radio"
                                  name={field.fieldKey}
                                  checked={val === true || val === "true"}
                                  onChange={() => handleFieldChange(field.fieldKey, true)}
                                />
                                <span>Yes</span>
                              </label>
                              <label className="flex items-center space-x-1.5 text-xs text-slate-300 cursor-pointer">
                                <input
                                  type="radio"
                                  name={field.fieldKey}
                                  checked={val === false || val === "false"}
                                  onChange={() => handleFieldChange(field.fieldKey, false)}
                                />
                                <span>No</span>
                              </label>
                            </div>
                          ) : (
                            <input
                              type={
                                field.fieldType === "NUMBER" ||
                                field.fieldType === "CURRENCY"
                                  ? "number"
                                  : "text"
                              }
                              value={String(val ?? "")}
                              onChange={(e) =>
                                handleFieldChange(
                                  field.fieldKey,
                                  field.fieldType === "NUMBER" ||
                                    field.fieldType === "CURRENCY"
                                    ? e.target.value === ""
                                      ? ""
                                      : Number(e.target.value)
                                    : e.target.value
                                )
                              }
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                            />
                          )
                        ) : (
                          <p className="text-sm font-medium text-white break-words mt-1">
                            {formatValue(field, val)}
                          </p>
                        )}

                        {field.description && (
                          <p className="text-[10px] text-slate-500 mt-1">
                            {field.description}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Quick Context & Actions Sidebar */}
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <h3 className="text-sm font-bold text-white">Governance Snapshot</h3>
                <div className="space-y-3 text-xs text-slate-300">
                  <div className="flex justify-between py-1.5 border-b border-slate-800">
                    <span className="text-slate-400">Current Gating</span>
                    <strong
                      className={
                        governanceStatus === "APPROVED"
                          ? "text-emerald-400"
                          : governanceStatus === "PENDING"
                          ? "text-amber-400"
                          : governanceStatus === "REJECTED"
                          ? "text-rose-400"
                          : "text-slate-400"
                      }
                    >
                      {governanceStatus}
                    </strong>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800">
                    <span className="text-slate-400">Target Object</span>
                    <span className="text-white font-mono">{businessObject.objectKey}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800">
                    <span className="text-slate-400">Associated Pipelines</span>
                    <span className="text-white">{workflows.length} configured</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800">
                    <span className="text-slate-400">Total Audit Runs</span>
                    <span className="text-white">{instances.length} execution(s)</span>
                  </div>
                </div>

                {workflows.length > 0 && governanceStatus !== "PENDING" && (
                  <button
                    type="button"
                    onClick={() => setShowSubmitWorkflowModal(true)}
                    className="w-full mt-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center justify-center space-x-2"
                  >
                    <span>⚡</span>
                    <span>Trigger Workflow Pipeline</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: WORKFLOW PIPELINE & STAGES */}
        {activeTab === "workflow" && (
          <div className="space-y-6">
            {instances.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
                <span className="text-4xl">⚡</span>
                <h3 className="text-base font-bold text-white">
                  No Active or Historical Approval Runs
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  This record has not yet been submitted to an approval workflow. Click below to
                  dispatch it into a multi-step pipeline.
                </p>
                <button
                  type="button"
                  onClick={() => setShowSubmitWorkflowModal(true)}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg cursor-pointer"
                >
                  Submit for Approval Now
                </button>
              </div>
            ) : (
              instances.map((instance) => (
                <div
                  key={instance.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                    <div>
                      <div className="flex items-center space-x-3">
                        <h3 className="text-base font-bold text-white">
                          {instance.workflowName || "Workflow Pipeline"}
                        </h3>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            instance.status === "PENDING"
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                              : instance.status === "APPROVED"
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                              : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                          }`}
                        >
                          {instance.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Initiated by <strong className="text-slate-300">{instance.initiatorUsername || "Admin"}</strong> on{" "}
                        {new Date(instance.initiatedAt).toLocaleString()}
                        {instance.completedAt && (
                          <span>
                            {" "}• Completed: {new Date(instance.completedAt).toLocaleString()}
                          </span>
                        )}
                      </p>
                    </div>

                    {instance.status === "PENDING" && (
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            setDecisionModal({
                              instanceId: instance.id,
                              action: "APPROVED",
                              stepName: instance.currentStepName || "Approval Stage",
                              targetName: recordTitle,
                            });
                            setDecisionComment(
                              "Verified and approved in accordance with workflow stage requirements."
                            );
                            setDecisionError(null);
                          }}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-md cursor-pointer"
                        >
                          ✓ Approve Stage
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDecisionModal({
                              instanceId: instance.id,
                              action: "REJECTED",
                              stepName: instance.currentStepName || "Approval Stage",
                              targetName: recordTitle,
                            });
                            setDecisionComment(
                              "Rejected during stage compliance review due to policy threshold requirements."
                            );
                            setDecisionError(null);
                          }}
                          className="px-3.5 py-1.5 bg-rose-950 border border-rose-700/60 text-rose-300 hover:text-white rounded-lg text-xs font-bold cursor-pointer"
                        >
                          ✕ Reject
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Step Gating Details */}
                  {instance.steps && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                        Pipeline Stages & Evaluation Rules
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {instance.steps.map((st) => {
                          const isCurrent = st.id === instance.currentStepId;
                          const isPast = st.stepOrder < instance.currentStepOrder;
                          return (
                            <div
                              key={st.id}
                              className={`p-4 rounded-xl border ${
                                isCurrent
                                  ? "bg-amber-950/20 border-amber-500/50"
                                  : isPast
                                  ? "bg-slate-950/60 border-emerald-500/30"
                                  : "bg-slate-950/40 border-slate-800"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-white">
                                  Stage {st.stepOrder}: {st.name}
                                </span>
                                <span
                                  className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                                    isCurrent
                                      ? "bg-amber-500 text-slate-950 font-bold"
                                      : isPast
                                      ? "bg-emerald-950 text-emerald-300 border border-emerald-700/50"
                                      : "bg-slate-800 text-slate-400"
                                  }`}
                                >
                                  {isCurrent ? "ACTIVE" : isPast ? "PASSED" : "PENDING"}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 mt-2">
                                Approver Role:{" "}
                                <strong className="text-slate-300 font-mono">
                                  {st.approverRoleName || "Configured Role"}
                                </strong>
                              </p>
                              {st.conditionExpression && (
                                <p className="text-[11px] text-slate-400 mt-1">
                                  Gating Rule:{" "}
                                  <span className="font-mono text-amber-300 bg-slate-900 px-1.5 py-0.5 rounded">
                                    {st.conditionExpression}
                                  </span>
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 3: AUDIT TRAIL */}
        {activeTab === "audit" && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <h3 className="text-base font-bold text-white">Chronological Audit Trail</h3>
            {instances.length === 0 ? (
              <p className="text-xs text-slate-400">No audit records found for this record.</p>
            ) : (
              <div className="space-y-4">
                {instances.flatMap((i) => i.actions || []).length === 0 ? (
                  <p className="text-xs text-slate-400">
                    Instance was initiated, awaiting first recorded approver action.
                  </p>
                ) : (
                  instances
                    .flatMap((i) => i.actions || [])
                    .sort(
                      (a, b) =>
                        new Date(b.actionTimestamp).getTime() -
                        new Date(a.actionTimestamp).getTime()
                    )
                    .map((act) => (
                      <div
                        key={act.id}
                        className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start space-x-4"
                      >
                        <div
                          className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold mt-0.5 ${
                            act.action === "APPROVED"
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                              : "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                          }`}
                        >
                          {act.action === "APPROVED" ? "✓" : "✕"}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-bold text-white">
                              {act.action} by{" "}
                              <span className="text-emerald-400">
                                {act.actorUsername || "Authorized Approver"}
                              </span>
                            </p>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {new Date(act.actionTimestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 italic bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                            &ldquo;{act.comments}&rdquo;
                          </p>
                        </div>
                      </div>
                    ))
                )}
              </div>
            )}
          </div>
        )}

        {/* MODAL: SUBMIT RECORD TO WORKFLOW */}
        {showSubmitWorkflowModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white">Submit to Workflow Pipeline</h3>
                <button
                  type="button"
                  onClick={() => setShowSubmitWorkflowModal(false)}
                  className="text-slate-400 hover:text-white cursor-pointer text-sm"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-slate-300">
                Target Record: <strong className="text-white">{recordTitle}</strong>
              </p>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Select Approval Pipeline
                </label>
                {workflows.length === 0 ? (
                  <p className="text-xs text-rose-400 bg-rose-950/40 p-2.5 rounded-lg border border-rose-800/60">
                    No active workflows found for {businessObject.name}. Create one in Workflow Studio first.
                  </p>
                ) : (
                  <select
                    value={selectedWorkflowId}
                    onChange={(e) => setSelectedWorkflowId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    {workflows.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.workflowKey})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSubmitWorkflowModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDispatchWorkflow}
                  disabled={submittingWorkflow || workflows.length === 0}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-lg cursor-pointer disabled:opacity-50"
                >
                  {submittingWorkflow ? "Submitting..." : "Confirm & Submit"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: DECISION (APPROVE / REJECT) */}
        {decisionModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <span
                    className={`h-3 w-3 rounded-full ${
                      decisionModal.action === "APPROVED" ? "bg-emerald-500" : "bg-rose-500"
                    }`}
                  />
                  <h3 className="text-base font-bold text-white">
                    {decisionModal.action === "APPROVED" ? "Confirm Stage Approval" : "Confirm Rejection"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setDecisionModal(null);
                    setDecisionError(null);
                  }}
                  className="text-slate-400 hover:text-white cursor-pointer text-sm"
                >
                  ✕
                </button>
              </div>

              {decisionError && (
                <div className="p-3 bg-rose-950/80 border border-rose-500/50 rounded-xl text-rose-200 text-xs flex items-center space-x-2 animate-shake">
                  <span className="text-rose-400 font-bold">⚠️</span>
                  <span>{decisionError}</span>
                </div>
              )}

              <div className="text-xs text-slate-300 space-y-1 bg-slate-950/50 p-3 rounded-xl border border-slate-800/80">
                <p>
                  <span className="text-slate-400">Target Record:</span>{" "}
                  <strong className="text-white">{decisionModal.targetName}</strong>
                </p>
                <p>
                  <span className="text-slate-400">Approval Stage:</span>{" "}
                  <strong className="text-amber-400">{decisionModal.stepName}</strong>
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-300">
                    Decision Rationale Remarks *
                    <span className="text-slate-500 font-normal ml-1">(Mandatory audit log)</span>
                  </label>
                  <span className="text-[10px] text-slate-400">One-click presets below:</span>
                </div>

                {/* Quick Preset Chips */}
                <div className="flex flex-wrap gap-1.5 pt-0.5 pb-1">
                  {decisionModal.action === "APPROVED" ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setDecisionComment("Terms reviewed and financial thresholds verified compliant.");
                          setDecisionError(null);
                        }}
                        className="text-[10px] bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-700/50 px-2 py-0.5 rounded cursor-pointer transition-colors"
                      >
                        ✓ Terms Verified
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDecisionComment("Risk assessment passed; collateral and limits confirmed.");
                          setDecisionError(null);
                        }}
                        className="text-[10px] bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-700/50 px-2 py-0.5 rounded cursor-pointer transition-colors"
                      >
                        ✓ Risk Approved
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDecisionComment("Executive sign-off granted in accordance with delegation policy.");
                          setDecisionError(null);
                        }}
                        className="text-[10px] bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-700/50 px-2 py-0.5 rounded cursor-pointer transition-colors"
                      >
                        ✓ Executive Sign-off
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setDecisionComment("Risk limit exceeded without required collateral guarantee.");
                          setDecisionError(null);
                        }}
                        className="text-[10px] bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-700/50 px-2 py-0.5 rounded cursor-pointer transition-colors"
                      >
                        ✕ Limit Exceeded
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDecisionComment("Missing mandatory documentation or incomplete compliance verification.");
                          setDecisionError(null);
                        }}
                        className="text-[10px] bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-700/50 px-2 py-0.5 rounded cursor-pointer transition-colors"
                      >
                        ✕ Incomplete Docs
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDecisionComment("Commercial terms non-compliant with standard credit guidelines.");
                          setDecisionError(null);
                        }}
                        className="text-[10px] bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-700/50 px-2 py-0.5 rounded cursor-pointer transition-colors"
                      >
                        ✕ Terms Non-compliant
                      </button>
                    </>
                  )}
                </div>

                <textarea
                  rows={3}
                  value={decisionComment}
                  onChange={(e) => {
                    setDecisionComment(e.target.value);
                    if (decisionError) setDecisionError(null);
                  }}
                  placeholder={
                    decisionModal.action === "APPROVED"
                      ? "e.g. Terms reviewed and budget verified with commercial finance."
                      : "e.g. Credit limit threshold exceeded without executive collateral guarantee."
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                  required
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setDecisionModal(null);
                    setDecisionError(null);
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDecisionSubmit}
                  disabled={submittingDecision}
                  className={`px-4 py-2 rounded-lg text-xs font-bold text-white shadow-lg cursor-pointer disabled:opacity-50 flex items-center space-x-2 ${
                    decisionModal.action === "APPROVED"
                      ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/40"
                      : "bg-rose-600 hover:bg-rose-500 shadow-rose-950/40"
                  }`}
                >
                  {submittingDecision ? (
                    <>
                      <span className="inline-block h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Submit {decisionModal.action}</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MaxShell>
  );
}
