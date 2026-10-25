"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import MaxShell from "@/components/max/MaxShell";

/* ============================================================================
 * Types & Domain Interfaces
 * ========================================================================== */

interface WorkflowStep {
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
  createdAt?: string;
  updatedAt?: string;
}

interface Workflow {
  id: string;
  tenantId: string;
  businessObjectId: string;
  businessObjectName?: string;
  businessObjectKey?: string;
  workflowKey: string;
  name: string;
  description?: string;
  triggerType: "MANUAL_SUBMISSION" | "RECORD_CREATION" | "RECORD_UPDATE" | "FIELD_CHANGE";
  status: "DRAFT" | "ACTIVE" | "INACTIVE";
  steps: WorkflowStep[];
  createdAt?: string;
  updatedAt?: string;
}

interface WorkflowAction {
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
}

interface WorkflowInstance {
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
}

interface PendingApproval {
  instanceId: string;
  tenantId: string;
  workflowId: string;
  workflowName?: string;
  businessObjectId: string;
  businessObjectName?: string;
  businessObjectKey?: string;
  recordId: string;
  stepId?: string;
  stepName?: string;
  stepOrder: number;
  approverRoleId?: string;
  approverRoleName?: string;
  approverUserId?: string;
  initiatedBy: string;
  initiatorUsername?: string;
  initiatedAt: string;
  contextData?: Record<string, unknown>;
}

interface BusinessObject {
  id: string;
  name: string;
  objectKey: string;
}

interface RoleItem {
  id: string;
  roleKey: string;
  name: string;
}

interface RecordItem {
  id: string;
  businessObjectId: string;
  recordData: Record<string, unknown>;
  createdAt: string;
}

const DEFAULT_TENANT_ID = "cf1757d5-c535-4335-939c-24908aee0209";

export default function WorkflowsPage() {
  const [tenantId] = useState(DEFAULT_TENANT_ID);
  const [activeTab, setActiveTab] = useState<"studio" | "inbox" | "history" | "simulator">("studio");

  // Domain data
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [businessObjects, setBusinessObjects] = useState<BusinessObject[]>([]);
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);
  const [historyInstances, setHistoryInstances] = useState<WorkflowInstance[]>([]);
  const [sampleRecords, setSampleRecords] = useState<RecordItem[]>([]);

  // UI State
  const [loading, setLoading] = useState(true);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);
  const [filterBoId, setFilterBoId] = useState<string>("ALL");
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modals
  const [showCreateWorkflowModal, setShowCreateWorkflowModal] = useState(false);
  const [showAddStepModal, setShowAddStepModal] = useState(false);
  const [stepTargetWorkflowId, setStepTargetWorkflowId] = useState<string | null>(null);
  const [editingStep, setEditingStep] = useState<WorkflowStep | null>(null);

  // Decision Modal
  const [decisionModal, setDecisionModal] = useState<{
    instanceId: string;
    action: "APPROVED" | "REJECTED";
    stepName: string;
    targetName: string;
  } | null>(null);
  const [decisionComment, setDecisionComment] = useState("");
  const [decisionError, setDecisionError] = useState<string | null>(null);
  const [submittingDecision, setSubmittingDecision] = useState(false);

  // Audit Viewer Modal
  const [viewingInstance, setViewingInstance] = useState<WorkflowInstance | null>(null);

  // Create Workflow Form
  const [newWfBoId, setNewWfBoId] = useState("");
  const [newWfKey, setNewWfKey] = useState("");
  const [newWfName, setNewWfName] = useState("");
  const [newWfDesc, setNewWfDesc] = useState("");
  const [newWfTrigger, setNewWfTrigger] = useState<Workflow["triggerType"]>("MANUAL_SUBMISSION");

  // Step Form
  const [stepOrder, setStepOrder] = useState<number>(1);
  const [stepName, setStepName] = useState("");
  const [stepRoleId, setStepRoleId] = useState("");
  const [stepCondition, setStepCondition] = useState("");
  const [stepStatusApproved, setStepStatusApproved] = useState("APPROVED");
  const [stepStatusRejected, setStepStatusRejected] = useState("REJECTED");
  const [stepTimeout, setStepTimeout] = useState<number>(24);

  // Simulator Form
  const [simBoId, setSimBoId] = useState("");
  const [simWorkflowId, setSimWorkflowId] = useState("");
  const [simRecordId, setSimRecordId] = useState("");
  const [simAmount, setSimAmount] = useState<number>(65000);
  const [simulating, setSimulating] = useState(false);

  const [sessionExpired, setSessionExpired] = useState(false);

  const showToast = useCallback((text: string, type: "success" | "error" = "success") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // Fetch initial data
  const loadData = useCallback(async () => {
    setLoading(true);
    setSessionExpired(false);
    try {
      // 1. Fetch Business Objects
      const boRes = await fetch("/api/configuration/business-objects");
      let boData: BusinessObject[] = [];
      if (boRes.ok) {
        boData = await boRes.json();
        setBusinessObjects(boData);
        if (boData.length > 0 && !newWfBoId) {
          setNewWfBoId(boData[0].id);
          setSimBoId(boData[0].id);
        }
      } else if (boRes.status === 401) {
        setSessionExpired(true);
      }

      // 2. Fetch Roles
      const rolesRes = await fetch(`/api/roles?tenantId=${tenantId}`);
      if (rolesRes.ok) {
        const rolesData = await rolesRes.json();
        setRoles(rolesData);
        if (rolesData.length > 0 && !stepRoleId) {
          setStepRoleId(rolesData[0].id);
        }
      }

      // 3. Fetch Workflows
      const wfRes = await fetch(`/api/configuration/workflows?tenantId=${tenantId}`);
      if (wfRes.ok) {
        const wfData: Workflow[] = await wfRes.json();
        setWorkflows(wfData);
        if (wfData.length > 0 && !selectedWorkflowId) {
          setSelectedWorkflowId(wfData[0].id);
        }
      } else if (wfRes.status === 401) {
        setSessionExpired(true);
      }

      // 4. Fetch Pending Approvals Inbox
      const inboxRes = await fetch(`/api/configuration/workflows/inbox?tenantId=${tenantId}`);
      if (inboxRes.ok) {
        const inboxData = await inboxRes.json();
        setPendingApprovals(inboxData);
      }

      // 5. Fetch Instances History
      const instRes = await fetch(`/api/configuration/workflows/instances?tenantId=${tenantId}`);
      if (instRes.ok) {
        const instData = await instRes.json();
        setHistoryInstances(instData);
      }

      // 6. Fetch Sample Records for simulator
      if (boData.length > 0) {
        const targetBo = boData.find((b) => b.objectKey === "sales_order") || boData[0];
        const recRes = await fetch(`/api/configuration/business-objects/${targetBo.id}/records`);
        if (recRes.ok) {
          const recData = await recRes.json();
          setSampleRecords(recData);
          if (recData.length > 0) setSimRecordId(recData[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load workflow studio data:", err);
      showToast("Network error loading workflow studio", "error");
    } finally {
      setLoading(false);
    }
  }, [tenantId, newWfBoId, stepRoleId, selectedWorkflowId, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filtered workflows
  const filteredWorkflows = useMemo(() => {
    if (filterBoId === "ALL") return workflows;
    return workflows.filter((w) => w.businessObjectId === filterBoId);
  }, [workflows, filterBoId]);

  // Selected workflow object
  const activeWorkflow = useMemo(() => {
    return workflows.find((w) => w.id === selectedWorkflowId) || workflows[0] || null;
  }, [workflows, selectedWorkflowId]);

  // Create Workflow Handler
  const handleCreateWorkflow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWfName.trim() || !newWfKey.trim() || !newWfBoId) {
      showToast("Please fill all required workflow fields", "error");
      return;
    }

    try {
      const res = await fetch(`/api/configuration/workflows?tenantId=${tenantId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessObjectId: newWfBoId,
          workflowKey: newWfKey.trim().toLowerCase().replace(/\s+/g, "_"),
          name: newWfName.trim(),
          description: newWfDesc.trim(),
          triggerType: newWfTrigger,
          status: "ACTIVE",
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to create workflow");
      }

      const created: Workflow = await res.json();
      setWorkflows((prev) => [created, ...prev]);
      setSelectedWorkflowId(created.id);
      setShowCreateWorkflowModal(false);
      setNewWfKey("");
      setNewWfName("");
      setNewWfDesc("");
      showToast(`Workflow '${created.name}' created successfully`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error creating workflow";
      showToast(msg, "error");
    }
  };

  // Add / Edit Step Handler
  const handleSaveStep = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetWfId = stepTargetWorkflowId || activeWorkflow?.id;
    if (!targetWfId || !stepName.trim()) {
      showToast("Step name is required", "error");
      return;
    }

    try {
      const payload = {
        stepOrder: Number(stepOrder),
        name: stepName.trim(),
        stepType: "APPROVAL",
        approverRoleId: stepRoleId || null,
        conditionExpression: stepCondition.trim() || null,
        statusOnApproval: stepStatusApproved.trim() || "APPROVED",
        statusOnRejection: stepStatusRejected.trim() || "REJECTED",
        timeoutHours: Number(stepTimeout) || 24,
      };

      let res: Response;
      if (editingStep) {
        res = await fetch(
          `/api/configuration/workflows/${targetWfId}/steps/${editingStep.id}?tenantId=${tenantId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );
      } else {
        res = await fetch(`/api/configuration/workflows/${targetWfId}/steps?tenantId=${tenantId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to save workflow step");
      }

      showToast(editingStep ? "Step updated successfully" : "Step added to pipeline");
      setShowAddStepModal(false);
      setEditingStep(null);
      // Refresh workflows
      const wfRes = await fetch(`/api/configuration/workflows?tenantId=${tenantId}`);
      if (wfRes.ok) {
        setWorkflows(await wfRes.json());
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving step";
      showToast(msg, "error");
    }
  };

  // Delete Step Handler
  const handleDeleteStep = async (workflowId: string, stepId: string) => {
    if (!confirm("Are you sure you want to remove this approval step?")) return;
    try {
      const res = await fetch(
        `/api/configuration/workflows/${workflowId}/steps/${stepId}?tenantId=${tenantId}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed to delete step");
      showToast("Step removed");
      const wfRes = await fetch(`/api/configuration/workflows?tenantId=${tenantId}`);
      if (wfRes.ok) setWorkflows(await wfRes.json());
    } catch {
      showToast("Failed to delete step", "error");
    }
  };

  // Toggle Workflow Status
  const handleToggleStatus = async (wf: Workflow) => {
    const newStatus = wf.status === "ACTIVE" ? "DRAFT" : "ACTIVE";
    try {
      const res = await fetch(`/api/configuration/workflows/${wf.id}?tenantId=${tenantId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      setWorkflows((prev) =>
        prev.map((w) => (w.id === wf.id ? { ...w, status: newStatus } : w))
      );
      showToast(`Workflow status set to ${newStatus}`);
    } catch {
      showToast("Failed to update status", "error");
    }
  };

  // Execute Approval Decision (Approve / Reject)
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
            ? "Session expired. Please refresh your login session."
            : `Failed to submit decision (HTTP ${res.status})`);
        setDecisionError(errorMsg);
        showToast(errorMsg, "error");
        return;
      }

      showToast(
        decisionModal.action === "APPROVED"
          ? "✓ Approval decision registered successfully"
          : "✕ Workflow record marked as Rejected"
      );

      setDecisionModal(null);
      setDecisionComment("");
      setDecisionError(null);

      // Refresh inbox and history
      const inboxRes = await fetch(`/api/configuration/workflows/inbox?tenantId=${tenantId}`);
      if (inboxRes.ok) setPendingApprovals(await inboxRes.json());
      const instRes = await fetch(`/api/configuration/workflows/instances?tenantId=${tenantId}`);
      if (instRes.ok) setHistoryInstances(await instRes.json());
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error executing decision";
      setDecisionError(msg);
      showToast(msg, "error");
    } finally {
      setSubmittingDecision(false);
    }
  };

  // Simulator Launch
  const handleLaunchSimulation = async () => {
    if (!simWorkflowId || !simRecordId) {
      showToast("Please choose both a target workflow and a sample record", "error");
      return;
    }

    setSimulating(true);
    try {
      const res = await fetch(
        `/api/configuration/workflows/${simWorkflowId}/instances?tenantId=${tenantId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recordId: simRecordId,
            contextData: {
              total_amount: Number(simAmount),
              credit_limit: Number(simAmount),
              simulation_timestamp: new Date().toISOString(),
              priority: simAmount >= 50000 ? "HIGH" : "NORMAL",
            },
          }),
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Simulation failed to launch");
      }

      showToast("🚀 Workflow instance dispatched! Switched to Approvals Inbox.");
      // Refresh inbox and switch tab
      const inboxRes = await fetch(`/api/configuration/workflows/inbox?tenantId=${tenantId}`);
      if (inboxRes.ok) setPendingApprovals(await inboxRes.json());
      const instRes = await fetch(`/api/configuration/workflows/instances?tenantId=${tenantId}`);
      if (instRes.ok) setHistoryInstances(await instRes.json());
      setActiveTab("inbox");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Simulation launch failed";
      showToast(msg, "error");
    } finally {
      setSimulating(false);
    }
  };

  return (
    <MaxShell>
      <div className="min-h-screen bg-slate-950 text-slate-100 p-6 space-y-6">
        {/* Toast Notification */}
        {toast && (
          <div
            className={`fixed bottom-6 right-6 z-[9999] px-5 py-3.5 rounded-xl shadow-2xl flex items-center space-x-3 text-sm font-medium border transition-all animate-bounce ${
              toast.type === "success"
                ? "bg-emerald-950/90 text-emerald-200 border-emerald-700/60 shadow-emerald-900/30"
                : "bg-rose-950/90 text-rose-200 border-rose-700/60 shadow-rose-900/30"
            }`}
          >
            <span>{toast.type === "success" ? "✓" : "⚠"}</span>
            <span>{toast.text}</span>
          </div>
        )}

        {/* Header & Tenant Indicator */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div>
            <div className="flex items-center space-x-3 mb-1">
              <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Workflows & Approvals Studio
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Enterprise Automation
              </span>
            </div>
            <p className="text-sm text-slate-400">
              Visual multi-step approval pipelines, dynamic rule gating, and role-based execution governance.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-slate-400">Tenant:</span>
              <span className="text-slate-200 font-semibold">MAX Security Test Tenant</span>
            </div>

            <button
              onClick={() => setShowCreateWorkflowModal(true)}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-semibold shadow-lg shadow-emerald-950/40 transition-all cursor-pointer"
            >
              <span>+</span>
              <span>New Pipeline</span>
            </button>
          </div>
        </div>

        {/* Session Expired Notice */}
        {sessionExpired && (
          <div className="bg-amber-950/80 border border-amber-500/40 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-amber-200 shadow-xl">
            <div className="flex items-center space-x-3">
              <span className="text-xl">⚠️</span>
              <div>
                <p className="text-sm font-bold">Authentication Session Expired</p>
                <p className="text-xs text-amber-300/80">
                  Your enterprise session token has expired. Please sign in again to load workflows, business objects, and submit approvals.
                </p>
              </div>
            </div>
            <Link
              href="/login?callbackUrl=/configuration/workflows"
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg shadow-md transition-all whitespace-nowrap"
            >
              Sign In to MAX ERP →
            </Link>
          </div>
        )}

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Active Pipelines</p>
              <p className="text-2xl font-bold text-white mt-1">
                {workflows.filter((w) => w.status === "ACTIVE").length}{" "}
                <span className="text-xs font-normal text-slate-500">/ {workflows.length} total</span>
              </p>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Pending Approvals</p>
              <p className="text-2xl font-bold text-amber-400 mt-1">{pendingApprovals.length}</p>
            </div>
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Total Pipeline Runs</p>
              <p className="text-2xl font-bold text-cyan-400 mt-1">{historyInstances.length}</p>
            </div>
            <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-lg border border-cyan-500/20">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>

          <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Approval Rate</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">
                {historyInstances.length > 0
                  ? `${Math.round(
                      (historyInstances.filter((h) => h.status === "APPROVED").length /
                        historyInstances.length) *
                        100
                    )}%`
                  : "100%"}
              </p>
            </div>
            <div className="p-3 bg-purple-500/10 text-purple-400 rounded-lg border border-purple-500/20">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 space-x-1">
          <button
            onClick={() => setActiveTab("studio")}
            className={`flex items-center space-x-2 px-5 py-3 border-b-2 font-medium text-sm transition-all cursor-pointer ${
              activeTab === "studio"
                ? "border-emerald-500 text-emerald-400 bg-emerald-500/5"
                : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
            <span>Visual Pipeline Studio</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
              {workflows.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("inbox")}
            className={`flex items-center space-x-2 px-5 py-3 border-b-2 font-medium text-sm transition-all cursor-pointer ${
              activeTab === "inbox"
                ? "border-emerald-500 text-emerald-400 bg-emerald-500/5"
                : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <span>Approvals Inbox</span>
            {pendingApprovals.length > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {pendingApprovals.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`flex items-center space-x-2 px-5 py-3 border-b-2 font-medium text-sm transition-all cursor-pointer ${
              activeTab === "history"
                ? "border-emerald-500 text-emerald-400 bg-emerald-500/5"
                : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Execution Audit Trail</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
              {historyInstances.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("simulator")}
            className={`flex items-center space-x-2 px-5 py-3 border-b-2 font-medium text-sm transition-all cursor-pointer ${
              activeTab === "simulator"
                ? "border-emerald-500 text-emerald-400 bg-emerald-500/5"
                : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Pipeline Test Runner</span>
          </button>
        </div>

        {/* TAB 1: VISUAL PIPELINE STUDIO */}
        {activeTab === "studio" && (
          <div className="space-y-6">
            {/* Filter bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Target Object:
                </span>
                <button
                  onClick={() => setFilterBoId("ALL")}
                  className={`px-3 py-1 text-xs rounded-lg font-medium transition-all cursor-pointer ${
                    filterBoId === "ALL"
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  All Objects
                </button>
                {businessObjects.map((bo) => (
                  <button
                    key={bo.id}
                    onClick={() => setFilterBoId(bo.id)}
                    className={`px-3 py-1 text-xs rounded-lg font-medium transition-all cursor-pointer ${
                      filterBoId === bo.id
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    {bo.name}
                  </button>
                ))}
              </div>

              <div className="text-xs text-slate-400">
                Showing {filteredWorkflows.length} pipeline{filteredWorkflows.length === 1 ? "" : "s"}
              </div>
            </div>

            {/* Workflow Pipeline Display */}
            {filteredWorkflows.length === 0 ? (
              <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-dashed border-slate-800">
                <p className="text-slate-400 text-sm">No workflows configured for this filter.</p>
                <button
                  onClick={() => setShowCreateWorkflowModal(true)}
                  className="mt-3 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg cursor-pointer"
                >
                  + Create Your First Pipeline
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredWorkflows.map((wf) => (
                  <div
                    key={wf.id}
                    className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-6 shadow-xl space-y-6 transition-all hover:border-slate-700/80"
                  >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/70 pb-4">
                      <div>
                        <div className="flex items-center space-x-3">
                          <h2 className="text-lg font-bold text-white">{wf.name}</h2>
                          <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                            {wf.workflowKey}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
                            {wf.businessObjectName || "Business Object"}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium border ${
                              wf.status === "ACTIVE"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : "bg-slate-700/40 text-slate-400 border-slate-600/40"
                            }`}
                          >
                            {wf.status}
                          </span>
                        </div>
                        {wf.description && (
                          <p className="text-xs text-slate-400 mt-1.5 max-w-2xl">{wf.description}</p>
                        )}
                      </div>

                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleToggleStatus(wf)}
                          className={`text-xs px-3 py-1.5 rounded-lg border font-medium cursor-pointer transition-all ${
                            wf.status === "ACTIVE"
                              ? "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
                              : "bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border-emerald-700/60"
                          }`}
                        >
                          {wf.status === "ACTIVE" ? "Pause / Set Draft" : "Activate Pipeline"}
                        </button>
                        <button
                          onClick={() => {
                            setStepTargetWorkflowId(wf.id);
                            setEditingStep(null);
                            setStepOrder(wf.steps.length + 1);
                            setStepName("");
                            setStepCondition("");
                            setShowAddStepModal(true);
                          }}
                          className="text-xs px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold cursor-pointer"
                        >
                          + Add Step
                        </button>
                      </div>
                    </div>

                    {/* Visual Multi-Step Pipeline Stepper */}
                    <div className="overflow-x-auto pb-4 pt-2">
                      <div className="flex items-center space-x-3 min-w-[700px]">
                        {/* Start Trigger Node */}
                        <div className="flex-shrink-0 w-44 bg-slate-950/90 border border-slate-800 rounded-xl p-3.5 space-y-1">
                          <div className="flex items-center space-x-1.5 text-xs text-emerald-400 font-semibold uppercase tracking-wider">
                            <span className="h-2 w-2 rounded-full bg-emerald-400" />
                            <span>Trigger Gate</span>
                          </div>
                          <p className="text-xs font-medium text-slate-200">
                            {wf.triggerType.replace("_", " ")}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Evaluated upon record dispatch
                          </p>
                        </div>

                        {/* Connector Arrow */}
                        <div className="flex-shrink-0 text-slate-600">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </div>

                        {/* Steps Sequence */}
                        {wf.steps.length === 0 ? (
                          <div className="flex-1 border border-dashed border-slate-800 rounded-xl p-4 text-center">
                            <p className="text-xs text-slate-500">No steps defined yet.</p>
                            <button
                              onClick={() => {
                                setStepTargetWorkflowId(wf.id);
                                setEditingStep(null);
                                setStepOrder(1);
                                setStepName("");
                                setStepCondition("");
                                setShowAddStepModal(true);
                              }}
                              className="mt-1 text-xs text-emerald-400 hover:underline cursor-pointer"
                            >
                              + Add Stage 1
                            </button>
                          </div>
                        ) : (
                          wf.steps.map((step, idx) => (
                            <div key={step.id} className="flex items-center space-x-3 flex-shrink-0">
                              <div className="w-64 bg-slate-950/90 border border-slate-800 rounded-xl p-3.5 space-y-2 hover:border-slate-700 transition-all relative group">
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                                    Stage {step.stepOrder}
                                  </span>
                                  <div className="flex items-center space-x-1.5 opacity-80 group-hover:opacity-100">
                                    <button
                                      onClick={() => {
                                        setStepTargetWorkflowId(wf.id);
                                        setEditingStep(step);
                                        setStepOrder(step.stepOrder);
                                        setStepName(step.name);
                                        setStepRoleId(step.approverRoleId || "");
                                        setStepCondition(step.conditionExpression || "");
                                        setStepStatusApproved(step.statusOnApproval);
                                        setStepStatusRejected(step.statusOnRejection);
                                        setStepTimeout(step.timeoutHours || 24);
                                        setShowAddStepModal(true);
                                      }}
                                      className="text-xs text-slate-400 hover:text-white cursor-pointer"
                                      title="Edit step"
                                    >
                                      ✎
                                    </button>
                                    <button
                                      onClick={() => handleDeleteStep(wf.id, step.id)}
                                      className="text-xs text-rose-400 hover:text-rose-300 cursor-pointer"
                                      title="Delete step"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                </div>

                                <div>
                                  <p className="text-sm font-semibold text-white truncate">
                                    {step.name}
                                  </p>
                                  <div className="flex items-center space-x-1.5 mt-1">
                                    <span className="text-[11px] text-slate-400">Approver:</span>
                                    <span className="text-xs font-medium text-amber-300 truncate">
                                      {step.approverRoleName || "Designated Role"}
                                    </span>
                                  </div>
                                </div>

                                {step.conditionExpression && (
                                  <div className="bg-slate-900/90 px-2 py-1 rounded border border-slate-800 text-[11px] text-slate-300 font-mono truncate">
                                    Rule: {step.conditionExpression}
                                  </div>
                                )}

                                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-900">
                                  <span className="text-emerald-400">✓ {step.statusOnApproval}</span>
                                  <span className="text-rose-400">✕ {step.statusOnRejection}</span>
                                </div>
                              </div>

                              {idx < wf.steps.length - 1 && (
                                <div className="flex-shrink-0 text-slate-600">
                                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                  </svg>
                                </div>
                              )}
                            </div>
                          ))
                        )}

                        {/* End Result Node */}
                        <div className="flex-shrink-0 text-slate-600">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </div>

                        <div className="flex-shrink-0 w-36 bg-slate-950/90 border border-slate-800 rounded-xl p-3.5 space-y-1">
                          <div className="flex items-center space-x-1.5 text-xs text-purple-400 font-semibold uppercase tracking-wider">
                            <span>Final Action</span>
                          </div>
                          <p className="text-xs font-medium text-slate-200">
                            Record State Finalized
                          </p>
                          <p className="text-[11px] text-emerald-400">
                            APPROVED / REJECTED
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: APPROVALS INBOX */}
        {activeTab === "inbox" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
              <div>
                <h2 className="text-lg font-bold text-white">Pending Approvals Queue</h2>
                <p className="text-xs text-slate-400">
                  Review submitted records, examine rule context, and approve or reject with audit comments.
                </p>
              </div>
              <button
                onClick={loadData}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg cursor-pointer"
              >
                ↻ Refresh Queue
              </button>
            </div>

            {pendingApprovals.length === 0 ? (
              <div className="text-center py-20 bg-slate-900/30 rounded-2xl border border-dashed border-slate-800">
                <div className="h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-3">
                  ✓
                </div>
                <h3 className="text-base font-semibold text-white">Inbox Zero!</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  There are currently no items pending approval. You can use the Pipeline Test Runner to submit a sample record into a workflow.
                </p>
                <button
                  onClick={() => setActiveTab("simulator")}
                  className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Go to Pipeline Test Runner
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {pendingApprovals.map((item) => (
                  <div
                    key={item.instanceId}
                    className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5 hover:border-slate-700 transition-all"
                  >
                    <div className="space-y-2 max-w-2xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold">
                          {item.businessObjectName || "Business Object"}
                        </span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                          Stage {item.stepOrder}: {item.stepName}
                        </span>
                        <span className="text-xs text-slate-500">
                          Pipeline: {item.workflowName}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-base font-bold text-white">
                          {String(
                            item.contextData?.company_name ||
                              item.contextData?.order_number ||
                              item.contextData?.customer_code ||
                              item.recordId
                          )}
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Initiated by{" "}
                          <span className="text-slate-200 font-medium">{item.initiatorUsername || "Admin"}</span>{" "}
                          • Submitted on {new Date(item.initiatedAt).toLocaleString()}
                        </p>
                      </div>

                      {/* Snapshot Highlights */}
                      {item.contextData && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {Object.entries(item.contextData)
                            .slice(0, 5)
                            .map(([key, val]) => (
                              <span
                                key={key}
                                className="text-[11px] bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800 text-slate-300"
                              >
                                <span className="text-slate-500 font-mono">{key}:</span>{" "}
                                <span className="font-semibold">{String(val)}</span>
                              </span>
                            ))}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-3 flex-shrink-0">
                      <button
                        onClick={() => {
                          const targetName = String(
                            item.contextData?.company_name ||
                              item.contextData?.order_number ||
                              "Record"
                          );
                          setDecisionModal({
                            instanceId: item.instanceId,
                            action: "APPROVED",
                            stepName: item.stepName || "Approval",
                            targetName,
                          });
                          setDecisionComment(
                            "Verified and approved in accordance with workflow stage requirements."
                          );
                          setDecisionError(null);
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold rounded-lg shadow-md shadow-emerald-950/30 flex items-center space-x-1.5 cursor-pointer"
                      >
                        <span>✓</span>
                        <span>Approve Stage</span>
                      </button>

                      <button
                        onClick={() => {
                          const targetName = String(
                            item.contextData?.company_name ||
                              item.contextData?.order_number ||
                              "Record"
                          );
                          setDecisionModal({
                            instanceId: item.instanceId,
                            action: "REJECTED",
                            stepName: item.stepName || "Approval",
                            targetName,
                          });
                          setDecisionComment(
                            "Rejected during stage compliance review due to policy threshold requirements."
                          );
                          setDecisionError(null);
                        }}
                        className="px-4 py-2 bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 text-xs font-semibold rounded-lg flex items-center space-x-1.5 cursor-pointer"
                      >
                        <span>✕</span>
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: EXECUTION AUDIT TRAIL */}
        {activeTab === "history" && (
          <div className="space-y-4">
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Workflow Execution History</h2>
                <p className="text-xs text-slate-400">
                  Full multi-step audit logs, timestamps, approver signatures, and mandatory comments.
                </p>
              </div>
              <button
                onClick={loadData}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg cursor-pointer"
              >
                ↻ Refresh History
              </button>
            </div>

            <div className="bg-slate-900/70 border border-slate-800/90 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Pipeline</th>
                      <th className="py-3 px-4">Target Record</th>
                      <th className="py-3 px-4">Current Stage</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Initiated</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {historyInstances.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-12 text-slate-500">
                          No execution instances recorded yet.
                        </td>
                      </tr>
                    ) : (
                      historyInstances.map((inst) => (
                        <tr key={inst.id} className="hover:bg-slate-850/50 transition-colors">
                          <td className="py-3.5 px-4 font-semibold text-white">
                            {inst.workflowName || "Workflow"}
                            <span className="block text-[10px] text-slate-500 font-normal">
                              {inst.businessObjectName}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-300">
                            {String(
                              inst.contextData?.company_name ||
                                inst.contextData?.order_number ||
                                inst.recordId.substring(0, 8) + "..."
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-slate-400">
                            {inst.status === "PENDING"
                              ? `Stage ${inst.currentStepOrder}: ${inst.currentStepName || "Pending"}`
                              : "Completed"}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                                inst.status === "APPROVED"
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                  : inst.status === "REJECTED"
                                  ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                  : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                              }`}
                            >
                              {inst.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-400 font-mono">
                            {new Date(inst.initiatedAt).toLocaleDateString()}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => setViewingInstance(inst)}
                              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-medium text-xs cursor-pointer"
                            >
                              View Audit
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: PIPELINE TEST RUNNER / SIMULATOR */}
        {activeTab === "simulator" && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
              <h2 className="text-lg font-bold text-white">Pipeline Test Simulator</h2>
              <p className="text-xs text-slate-400">
                Trigger active workflows against real database records with simulated financial metrics to test condition gates and approval progressions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Form */}
              <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-6 shadow-xl space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  1. Simulation Parameters
                </h3>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Select Workflow Pipeline
                  </label>
                  <select
                    value={simWorkflowId}
                    onChange={(e) => setSimWorkflowId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">-- Choose Pipeline --</option>
                    {workflows
                      .filter((w) => w.status === "ACTIVE")
                      .map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.name} ({w.businessObjectName})
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Select Test Target Record
                  </label>
                  <select
                    value={simRecordId}
                    onChange={(e) => setSimRecordId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">-- Choose Target Record --</option>
                    {sampleRecords.map((r) => (
                      <option key={r.id} value={r.id}>
                        {String(
                          r.recordData.company_name ||
                            r.recordData.order_number ||
                            r.recordData.customer_code ||
                            r.id
                        )}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Simulated Financial Amount ($)
                  </label>
                  <input
                    type="number"
                    value={simAmount}
                    onChange={(e) => setSimAmount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Triggers conditions like `total_amount &gt; 50000` or `credit_limit &gt;= 250000`.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleLaunchSimulation}
                    disabled={simulating}
                    className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/40 cursor-pointer disabled:opacity-50"
                  >
                    {simulating ? "Executing..." : "🚀 Dispatch Workflow Simulation"}
                  </button>
                </div>
              </div>

              {/* Guide */}
              <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  2. Simulation Verification Guide
                </h3>
                <div className="space-y-3 text-xs text-slate-300">
                  <div className="flex items-start space-x-2">
                    <span className="text-emerald-400 font-bold">1.</span>
                    <p>
                      <strong>Conditional Gating:</strong> If the simulated amount meets the condition on Step 1, it will enter the queue for that role.
                    </p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-emerald-400 font-bold">2.</span>
                    <p>
                      <strong>Approvals Inbox:</strong> Once dispatched, switch to the <em>Approvals Inbox</em> to execute 1-click approval or rejection.
                    </p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-emerald-400 font-bold">3.</span>
                    <p>
                      <strong>Audit Trail:</strong> When approved, the workflow advances to Stage 2 or finalizes the record with full timestamps and comments.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: CREATE WORKFLOW */}
        {showCreateWorkflowModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white">Create New Workflow Pipeline</h3>
                <button
                  onClick={() => setShowCreateWorkflowModal(false)}
                  className="text-slate-400 hover:text-white cursor-pointer text-sm"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateWorkflow} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Target Business Object *
                  </label>
                  <select
                    value={newWfBoId}
                    onChange={(e) => setNewWfBoId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200"
                    required
                  >
                    {businessObjects.length === 0 ? (
                      <option value="" disabled>
                        {sessionExpired
                          ? "⚠️ Session expired - please sign in again"
                          : "Loading business objects..."}
                      </option>
                    ) : (
                      businessObjects.map((bo) => (
                        <option key={bo.id} value={bo.id}>
                          {bo.name} ({bo.objectKey})
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Workflow Key * (e.g. sales_order_approval)
                  </label>
                  <input
                    type="text"
                    value={newWfKey}
                    onChange={(e) => setNewWfKey(e.target.value)}
                    placeholder="sales_order_approval"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Workflow Display Name *
                  </label>
                  <input
                    type="text"
                    value={newWfName}
                    onChange={(e) => setNewWfName(e.target.value)}
                    placeholder="Commercial Sales Order Gating"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={newWfDesc}
                    onChange={(e) => setNewWfDesc(e.target.value)}
                    placeholder="Governance rules and multi-tiered executive clearance..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Trigger Gate
                  </label>
                  <select
                    value={newWfTrigger}
                    onChange={(e) => setNewWfTrigger(e.target.value as Workflow["triggerType"])}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200"
                  >
                    <option value="MANUAL_SUBMISSION">Manual User Submission</option>
                    <option value="RECORD_CREATION">Auto on Record Creation</option>
                    <option value="RECORD_UPDATE">Auto on Record Update</option>
                  </select>
                </div>

                <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowCreateWorkflowModal(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg cursor-pointer"
                  >
                    Create Pipeline
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: ADD / EDIT STEP */}
        {showAddStepModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white">
                  {editingStep ? `Edit Stage ${editingStep.stepOrder}` : "Add Approval Stage"}
                </h3>
                <button
                  onClick={() => setShowAddStepModal(false)}
                  className="text-slate-400 hover:text-white cursor-pointer text-sm"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveStep} className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1">
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Stage Order
                    </label>
                    <input
                      type="number"
                      value={stepOrder}
                      onChange={(e) => setStepOrder(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Stage Name *
                    </label>
                    <input
                      type="text"
                      value={stepName}
                      onChange={(e) => setStepName(e.target.value)}
                      placeholder="e.g. Executive Risk Clearance"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Approver Role *
                  </label>
                  <select
                    value={stepRoleId}
                    onChange={(e) => setStepRoleId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200"
                    required
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.roleKey})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Condition Expression (Optional rule gate)
                  </label>
                  <input
                    type="text"
                    value={stepCondition}
                    onChange={(e) => setStepCondition(e.target.value)}
                    placeholder="e.g. total_amount > 50000 or credit_limit >= 250000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono"
                  />
                  <div className="flex items-center space-x-2 mt-1">
                    <button
                      type="button"
                      onClick={() => setStepCondition("total_amount > 50000")}
                      className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300 hover:bg-slate-700 cursor-pointer"
                    >
                      amount &gt; 50k
                    </button>
                    <button
                      type="button"
                      onClick={() => setStepCondition("credit_limit >= 250000")}
                      className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300 hover:bg-slate-700 cursor-pointer"
                    >
                      credit &gt;= 250k
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Status on Approval
                    </label>
                    <input
                      type="text"
                      value={stepStatusApproved}
                      onChange={(e) => setStepStatusApproved(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-emerald-400 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Status on Rejection
                    </label>
                    <input
                      type="text"
                      value={stepStatusRejected}
                      onChange={(e) => setStepStatusRejected(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-rose-400 font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowAddStepModal(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg cursor-pointer"
                  >
                    Save Stage
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: DECISION CONFIRMATION (APPROVE / REJECT WITH MANDATORY REMARKS) */}
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
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
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

        {/* MODAL: AUDIT TIMELINE VIEWER */}
        {viewingInstance && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-2xl w-full space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white">
                    Workflow Audit Timeline
                  </h3>
                  <p className="text-xs text-slate-400">
                    {viewingInstance.workflowName} • {viewingInstance.businessObjectName}
                  </p>
                </div>
                <button
                  onClick={() => setViewingInstance(null)}
                  className="text-slate-400 hover:text-white cursor-pointer text-sm"
                >
                  ✕
                </button>
              </div>

              {/* Status Banner */}
              <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div>
                  <span className="text-xs text-slate-400">Instance ID:</span>{" "}
                  <span className="text-xs font-mono text-slate-200">{viewingInstance.id}</span>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    viewingInstance.status === "APPROVED"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : viewingInstance.status === "REJECTED"
                      ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                      : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  }`}
                >
                  {viewingInstance.status}
                </span>
              </div>

              {/* Actions Log */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Audit Actions History
                </h4>
                {(!viewingInstance.actions || viewingInstance.actions.length === 0) ? (
                  <p className="text-xs text-slate-500 py-3">No actions logged yet for this instance.</p>
                ) : (
                  <div className="space-y-2.5">
                    {viewingInstance.actions.map((act) => (
                      <div
                        key={act.id}
                        className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              act.action === "APPROVED"
                                ? "bg-emerald-500/20 text-emerald-300"
                                : "bg-rose-500/20 text-rose-300"
                            }`}
                          >
                            {act.action}
                          </span>
                          <span className="text-[11px] font-mono text-slate-500">
                            {new Date(act.actionTimestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-slate-200">{act.comments}</p>
                        <p className="text-[11px] text-slate-400">
                          Actor:{" "}
                          <span className="text-slate-300">{act.actorUsername || act.actorUserId}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-2 text-right border-t border-slate-800">
                <button
                  onClick={() => setViewingInstance(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MaxShell>
  );
}
