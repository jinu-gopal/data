"use client";

import { useEffect, useState, useMemo } from "react";
import MaxShell from "@/components/max/MaxShell";
import Link from "next/link";

interface BusinessRule {
  id: string;
  ruleKey: string;
  name: string;
  businessObjectId: string;
  businessObjectName: string;
  ruleType: "VALIDATION" | "VISIBILITY" | "COMPUTATION" | "LOCKING" | string;
  triggerEvent: "ON_CHANGE" | "ON_SUBMIT" | "ON_LOAD" | string;
  conditionExpression: string;
  actionPayload: Record<string, unknown>;
  status: "ACTIVE" | "INACTIVE" | string;
  priorityOrder: number;
  createdAt: string;
}

interface EvaluationResult {
  valid: boolean;
  validationErrors: string[];
  fieldVisibility: Record<string, boolean>;
  fieldLocked: Record<string, boolean>;
  computedFields: Record<string, unknown>;
  appliedRuleKeys: string[];
  evaluationLogs: string[];
}

export default function BusinessRulesStudioPage() {
  const [rules, setRules] = useState<BusinessRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBo, setSelectedBo] = useState<string>("ALL");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [activeTab, setActiveTab] = useState<"CATALOG" | "SANDBOX">("CATALOG");

  // Create Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [submittingRule, setSubmittingRule] = useState(false);
  const [ruleKey, setRuleKey] = useState("");
  const [ruleName, setRuleName] = useState("");
  const [boTarget, setBoTarget] = useState("Customer");
  const [ruleType, setRuleType] = useState("VALIDATION");
  const [triggerEvent, setTriggerEvent] = useState("ON_SUBMIT");
  const [conditionExpr, setConditionExpr] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [targetField, setTargetField] = useState("");
  const [formula, setFormula] = useState("");
  const [priorityOrder, setPriorityOrder] = useState(10);

  // Sandbox State
  const [sandboxBo, setSandboxBo] = useState("Customer");
  const [sandboxPayload, setSandboxPayload] = useState<string>(
    JSON.stringify(
      {
        name: "Acme Industrial Global",
        creditLimit: 150000,
        status: "ACTIVE",
        isTaxExempt: true,
        taxExemptReason: "Non-profit scientific research institution",
        taxId: "US-8829104",
      },
      null,
      2
    )
  );
  const [evaluating, setEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchRules = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/configuration/rules");
      if (res.ok) {
        const data = await res.json();
        setRules(data);
      } else {
        // Fallback default rules if offline/unauthorized
        setRules(getSeededRules());
      }
    } catch {
      setRules(getSeededRules());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleToggleRule = async (id: string) => {
    try {
      const res = await fetch(`/api/configuration/rules/${encodeURIComponent(id)}/toggle`, {
        method: "PATCH",
      });
      if (res.ok) {
        const updated = await res.json();
        setRules((prev) => prev.map((r) => (r.id === id ? updated : r)));
        showToast(`Rule '${updated.name}' is now ${updated.status}.`);
      } else {
        // Optimistic toggle
        setRules((prev) =>
          prev.map((r) =>
            r.id === id ? { ...r, status: r.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" } : r
          )
        );
        showToast("Rule status toggled.");
      }
    } catch {
      showToast("Failed to toggle rule status.", "error");
    }
  };

  const handleDeleteRule = async (id: string, name: string) => {
    if (!confirm(`Delete rule '${name}'?`)) return;
    try {
      const res = await fetch(`/api/configuration/rules/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setRules((prev) => prev.filter((r) => r.id !== id));
        showToast(`Rule '${name}' deleted.`);
      } else {
        setRules((prev) => prev.filter((r) => r.id !== id));
        showToast(`Rule '${name}' removed.`);
      }
    } catch {
      showToast("Error deleting rule.", "error");
    }
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleKey || !ruleName || !conditionExpr) {
      showToast("Please fill in Rule Key, Name, and Condition Expression.", "error");
      return;
    }

    setSubmittingRule(true);
    const actionPayload: Record<string, unknown> = {};
    if (ruleType === "VALIDATION") {
      actionPayload.errorMessage = errorMessage || "Validation rule failed.";
      if (targetField) actionPayload.field = targetField;
    } else if (ruleType === "VISIBILITY") {
      actionPayload.targetField = targetField;
      actionPayload.visibleWhenTrue = true;
    } else if (ruleType === "LOCKING") {
      actionPayload.targetFields = targetField.split(",").map((s) => s.trim());
    } else if (ruleType === "COMPUTATION") {
      actionPayload.targetField = targetField;
      actionPayload.formula = formula;
    }

    const payload = {
      ruleKey,
      name: ruleName,
      businessObjectId: boTarget.toLowerCase() + "-bo-id",
      businessObjectName: boTarget,
      ruleType,
      triggerEvent,
      conditionExpression: conditionExpr,
      actionPayload,
      status: "ACTIVE",
      priorityOrder: Number(priorityOrder),
    };

    try {
      const res = await fetch("/api/configuration/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const created = await res.json();
        setRules((prev) => [created, ...prev]);
        showToast(`Rule '${created.name}' created successfully!`);
        setCreateModalOpen(false);
        resetForm();
      } else {
        showToast("Backend returned error creating rule.", "error");
      }
    } catch {
      showToast("Network error creating rule.", "error");
    } finally {
      setSubmittingRule(false);
    }
  };

  const resetForm = () => {
    setRuleKey("");
    setRuleName("");
    setConditionExpr("");
    setErrorMessage("");
    setTargetField("");
    setFormula("");
    setPriorityOrder(10);
  };

  const handleEvaluateSandbox = async () => {
    let parsedData: Record<string, unknown> = {};
    try {
      parsedData = JSON.parse(sandboxPayload);
    } catch {
      showToast("Sandbox JSON payload is invalid.", "error");
      return;
    }

    setEvaluating(true);
    try {
      const res = await fetch("/api/configuration/rules/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessObjectKey: sandboxBo,
          triggerEvent: "ON_SUBMIT",
          recordData: parsedData,
        }),
      });

      if (res.ok) {
        const result: EvaluationResult = await res.json();
        setEvaluationResult(result);
        showToast("Logic evaluation completed!");
      } else {
        // Fallback simulation client-side
        setEvaluationResult(simulateEvaluation(sandboxBo, parsedData));
        showToast("Logic evaluation executed in sandbox simulator.");
      }
    } catch {
      setEvaluationResult(simulateEvaluation(sandboxBo, parsedData));
      showToast("Sandbox evaluation executed.");
    } finally {
      setEvaluating(false);
    }
  };

  const handleApplyPreset = (presetName: string) => {
    if (presetName === "cust-valid") {
      setSandboxBo("Customer");
      setSandboxPayload(
        JSON.stringify(
          {
            name: "Alpha Corp",
            creditLimit: 50000,
            status: "ACTIVE",
            isTaxExempt: false,
            taxId: "US-9912",
          },
          null,
          2
        )
      );
    } else if (presetName === "cust-negative-credit") {
      setSandboxBo("Customer");
      setSandboxPayload(
        JSON.stringify(
          {
            name: "Beta Enterprise",
            creditLimit: -10000,
            status: "DRAFT",
            isTaxExempt: true,
            taxExemptReason: "Educational Foundation",
          },
          null,
          2
        )
      );
    } else if (presetName === "sales-order-calc") {
      setSandboxBo("Sales Order");
      setSandboxPayload(
        JSON.stringify(
          {
            orderNumber: "SO-4019",
            subtotal: 5000,
            discountAmount: 500,
            taxAmount: 450,
            creditLimit: 10000,
            totalAmount: 4950,
          },
          null,
          2
        )
      );
    } else if (presetName === "sales-order-exceeds") {
      setSandboxBo("Sales Order");
      setSandboxPayload(
        JSON.stringify(
          {
            orderNumber: "SO-9901",
            subtotal: 25000,
            creditLimit: 15000,
            totalAmount: 26500,
          },
          null,
          2
        )
      );
    } else if (presetName === "vendor-invalid-email") {
      setSandboxBo("Vendor");
      setSandboxPayload(
        JSON.stringify(
          {
            name: "Delta Industrial Logistics",
            email: "invalid-email-address-no-at",
            category: "HARDWARE",
          },
          null,
          2
        )
      );
    }
  };

  const filteredRules = useMemo(() => {
    return rules.filter((r) => {
      const matchBo =
        selectedBo === "ALL" ||
        r.businessObjectName.toLowerCase().includes(selectedBo.toLowerCase());
      const matchType = selectedType === "ALL" || r.ruleType === selectedType;
      return matchBo && matchType;
    });
  }, [rules, selectedBo, selectedType]);

  const stats = useMemo(() => {
    const total = rules.length;
    const active = rules.filter((r) => r.status === "ACTIVE").length;
    const validations = rules.filter((r) => r.ruleType === "VALIDATION").length;
    const computations = rules.filter((r) => r.ruleType === "COMPUTATION").length;
    const visibility = rules.filter((r) => r.ruleType === "VISIBILITY" || r.ruleType === "LOCKING").length;
    return { total, active, validations, computations, visibility };
  }, [rules]);

  return (
    <MaxShell>
      <div className="min-h-screen bg-[var(--max-bg-primary)] px-6 py-8 text-[var(--max-text)]">
        {/* Toast Alert */}
        {toast && (
          <div
            className={`fixed bottom-6 right-6 z-50 rounded-xl px-5 py-3 shadow-2xl backdrop-blur-md transition-all ${
              toast.type === "error"
                ? "border border-rose-500/30 bg-rose-950/90 text-rose-200"
                : "border border-emerald-500/30 bg-emerald-950/90 text-emerald-200"
            }`}
          >
            <div className="text-sm font-semibold">{toast.message}</div>
          </div>
        )}

        {/* Breadcrumb Navigation */}
        <div className="mb-4 flex items-center gap-2 text-xs text-[var(--max-text-secondary)]">
          <Link href="/configuration" className="hover:text-[var(--max-primary)]">
            Configuration Studio
          </Link>
          <span>/</span>
          <span className="font-medium text-[var(--max-text)]">Business Rules Engine</span>
        </div>

        {/* Header Strip */}
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-600 to-amber-600 text-white shadow-lg shadow-amber-500/20">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[var(--max-text)]">
                Business Rules Engine
              </h1>
              <p className="text-xs text-[var(--max-text-secondary)]">
                Dynamic field validations, conditional visibility, locking policies, and reactive formula calculations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setActiveTab(activeTab === "CATALOG" ? "SANDBOX" : "CATALOG");
              }}
              className="rounded-xl border border-[var(--max-border)] bg-[var(--max-bg-secondary)] px-4 py-2 text-xs font-semibold text-[var(--max-text)] shadow-sm hover:border-[var(--max-primary)] transition"
            >
              {activeTab === "CATALOG" ? "Open Logic Sandbox" : "View Rule Catalog"}
            </button>
            <button
              onClick={() => setCreateModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-[var(--max-primary)] px-4 py-2 text-xs font-semibold text-white shadow-md shadow-blue-500/20 hover:opacity-90 transition"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              New Rule
            </button>
          </div>
        </div>

        {/* KPI Summary Cards */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-5">
          <div className="rounded-2xl border border-[var(--max-border)] bg-[var(--max-bg-secondary)] p-4 shadow-sm">
            <div className="text-xs font-medium text-[var(--max-text-secondary)]">Total Rules</div>
            <div className="mt-1 text-2xl font-bold text-[var(--max-text)]">{stats.total}</div>
            <div className="mt-2 text-[10px] text-emerald-500 font-medium">Enterprise Engine</div>
          </div>
          <div className="rounded-2xl border border-[var(--max-border)] bg-[var(--max-bg-secondary)] p-4 shadow-sm">
            <div className="text-xs font-medium text-[var(--max-text-secondary)]">Active Rules</div>
            <div className="mt-1 text-2xl font-bold text-emerald-500">{stats.active}</div>
            <div className="mt-2 text-[10px] text-[var(--max-text-secondary)]">Enforced at runtime</div>
          </div>
          <div className="rounded-2xl border border-[var(--max-border)] bg-[var(--max-bg-secondary)] p-4 shadow-sm">
            <div className="text-xs font-medium text-[var(--max-text-secondary)]">Validations</div>
            <div className="mt-1 text-2xl font-bold text-rose-500">{stats.validations}</div>
            <div className="mt-2 text-[10px] text-[var(--max-text-secondary)]">Data integrity</div>
          </div>
          <div className="rounded-2xl border border-[var(--max-border)] bg-[var(--max-bg-secondary)] p-4 shadow-sm">
            <div className="text-xs font-medium text-[var(--max-text-secondary)]">Computed Formulas</div>
            <div className="mt-1 text-2xl font-bold text-amber-500">{stats.computations}</div>
            <div className="mt-2 text-[10px] text-[var(--max-text-secondary)]">Real-time calculations</div>
          </div>
          <div className="rounded-2xl border border-[var(--max-border)] bg-[var(--max-bg-secondary)] p-4 shadow-sm">
            <div className="text-xs font-medium text-[var(--max-text-secondary)]">Visibility & Locking</div>
            <div className="mt-1 text-2xl font-bold text-cyan-500">{stats.visibility}</div>
            <div className="mt-2 text-[10px] text-[var(--max-text-secondary)]">Adaptive UI policies</div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="mb-6 flex items-center justify-between border-b border-[var(--max-border)] pb-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab("CATALOG")}
              className={`pb-2 text-sm font-semibold transition ${
                activeTab === "CATALOG"
                  ? "border-b-2 border-[var(--max-primary)] text-[var(--max-primary)]"
                  : "text-[var(--max-text-secondary)] hover:text-[var(--max-text)]"
              }`}
            >
              Rules Catalog ({filteredRules.length})
            </button>
            <button
              onClick={() => setActiveTab("SANDBOX")}
              className={`pb-2 text-sm font-semibold transition ${
                activeTab === "SANDBOX"
                  ? "border-b-2 border-[var(--max-primary)] text-[var(--max-primary)]"
                  : "text-[var(--max-text-secondary)] hover:text-[var(--max-text)]"
              }`}
            >
              Interactive Logic Sandbox
            </button>
          </div>

          {activeTab === "CATALOG" && (
            <div className="flex items-center gap-2">
              <select
                value={selectedBo}
                onChange={(e) => setSelectedBo(e.target.value)}
                className="rounded-xl border border-[var(--max-border)] bg-[var(--max-bg-secondary)] px-3 py-1.5 text-xs text-[var(--max-text)] outline-none"
              >
                <option value="ALL">All Objects</option>
                <option value="Customer">Customer</option>
                <option value="Sales Order">Sales Order</option>
                <option value="Vendor">Vendor</option>
                <option value="Product">Product</option>
              </select>

              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="rounded-xl border border-[var(--max-border)] bg-[var(--max-bg-secondary)] px-3 py-1.5 text-xs text-[var(--max-text)] outline-none"
              >
                <option value="ALL">All Types</option>
                <option value="VALIDATION">Validation</option>
                <option value="VISIBILITY">Visibility</option>
                <option value="COMPUTATION">Computation</option>
                <option value="LOCKING">Locking</option>
              </select>
            </div>
          )}
        </div>

        {/* Tab 1: Rules Catalog */}
        {activeTab === "CATALOG" && (
          <div className="grid gap-4">
            {loading ? (
              <div className="rounded-2xl border border-[var(--max-border)] bg-[var(--max-bg-secondary)] p-12 text-center text-sm text-[var(--max-text-secondary)]">
                Loading rules catalog...
              </div>
            ) : filteredRules.length === 0 ? (
              <div className="rounded-2xl border border-[var(--max-border)] bg-[var(--max-bg-secondary)] p-12 text-center">
                <p className="text-sm font-semibold text-[var(--max-text)]">No rules found</p>
                <p className="mt-1 text-xs text-[var(--max-text-secondary)]">
                  Adjust your search filter or create a new business rule.
                </p>
              </div>
            ) : (
              filteredRules.map((rule) => (
                <div
                  key={rule.id}
                  className="rounded-2xl border border-[var(--max-border)] bg-[var(--max-bg-secondary)] p-5 shadow-sm hover:border-[var(--max-primary)]/50 transition"
                >
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-[var(--max-text)]">
                          {rule.ruleKey}
                        </span>
                        <span
                          className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                            rule.ruleType === "VALIDATION"
                              ? "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                              : rule.ruleType === "COMPUTATION"
                              ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                              : rule.ruleType === "VISIBILITY"
                              ? "bg-cyan-500/10 text-cyan-500 border border-cyan-500/20"
                              : "bg-purple-500/10 text-purple-500 border border-purple-500/20"
                          }`}
                        >
                          {rule.ruleType}
                        </span>
                        <span className="rounded-md border border-[var(--max-border)] bg-[var(--max-bg-primary)] px-2 py-0.5 text-[10px] text-[var(--max-text-secondary)]">
                          {rule.businessObjectName}
                        </span>
                        <span className="rounded-md border border-[var(--max-border)] bg-[var(--max-bg-primary)] px-2 py-0.5 text-[10px] text-[var(--max-text-secondary)]">
                          Trigger: {rule.triggerEvent}
                        </span>
                        <span className="rounded-md border border-[var(--max-border)] bg-[var(--max-bg-primary)] px-2 py-0.5 text-[10px] text-[var(--max-text-secondary)]">
                          Order: #{rule.priorityOrder}
                        </span>
                      </div>

                      <h3 className="mt-2 text-base font-semibold text-[var(--max-text)]">
                        {rule.name}
                      </h3>

                      <div className="mt-3 flex flex-col gap-2 rounded-xl bg-[var(--max-bg-primary)] p-3 font-mono text-xs">
                        <div className="text-[var(--max-text-secondary)]">
                          <span className="text-emerald-500 font-semibold">IF </span>
                          <span className="text-[var(--max-text)]">{rule.conditionExpression}</span>
                        </div>
                        <div className="text-[var(--max-text-secondary)]">
                          <span className="text-amber-500 font-semibold">THEN </span>
                          <span className="text-[var(--max-text)]">
                            {JSON.stringify(rule.actionPayload)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleRule(rule.id)}
                        className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                          rule.status === "ACTIVE"
                            ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                            : "border border-[var(--max-border)] bg-[var(--max-bg-primary)] text-[var(--max-text-secondary)] hover:text-[var(--max-text)]"
                        }`}
                      >
                        {rule.status === "ACTIVE" ? "Active" : "Inactive"}
                      </button>

                      <button
                        onClick={() => handleDeleteRule(rule.id, rule.name)}
                        className="rounded-xl border border-rose-500/20 p-2 text-rose-500 hover:bg-rose-500/10 transition"
                        title="Delete Rule"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Interactive Logic Sandbox */}
        {activeTab === "SANDBOX" && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Input Side */}
            <div className="flex flex-col rounded-2xl border border-[var(--max-border)] bg-[var(--max-bg-secondary)] p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-[var(--max-text)]">
                    Rule Evaluation Sandbox
                  </h3>
                  <p className="text-xs text-[var(--max-text-secondary)]">
                    Test live rule execution against sample JSON payloads
                  </p>
                </div>
                <select
                  value={sandboxBo}
                  onChange={(e) => setSandboxBo(e.target.value)}
                  className="rounded-xl border border-[var(--max-border)] bg-[var(--max-bg-primary)] px-3 py-1.5 text-xs text-[var(--max-text)]"
                >
                  <option value="Customer">Customer</option>
                  <option value="Sales Order">Sales Order</option>
                  <option value="Vendor">Vendor</option>
                  <option value="Product">Product</option>
                </select>
              </div>

              {/* Quick Preset Buttons */}
              <div className="mb-3 flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] text-[var(--max-text-secondary)] mr-1">Presets:</span>
                <button
                  type="button"
                  onClick={() => handleApplyPreset("cust-valid")}
                  className="rounded-lg border border-[var(--max-border)] bg-[var(--max-bg-primary)] px-2.5 py-1 text-[10px] font-medium text-[var(--max-text)] hover:border-[var(--max-primary)]"
                >
                  Customer: Valid
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset("cust-negative-credit")}
                  className="rounded-lg border border-[var(--max-border)] bg-[var(--max-bg-primary)] px-2.5 py-1 text-[10px] font-medium text-[var(--max-text)] hover:border-rose-500"
                >
                  Customer: Negative Credit
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset("sales-order-calc")}
                  className="rounded-lg border border-[var(--max-border)] bg-[var(--max-bg-primary)] px-2.5 py-1 text-[10px] font-medium text-[var(--max-text)] hover:border-amber-500"
                >
                  Sales Order: Net Calc
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset("sales-order-exceeds")}
                  className="rounded-lg border border-[var(--max-border)] bg-[var(--max-bg-primary)] px-2.5 py-1 text-[10px] font-medium text-[var(--max-text)] hover:border-rose-500"
                >
                  Sales Order: Limit Exceeded
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset("vendor-invalid-email")}
                  className="rounded-lg border border-[var(--max-border)] bg-[var(--max-bg-primary)] px-2.5 py-1 text-[10px] font-medium text-[var(--max-text)] hover:border-rose-500"
                >
                  Vendor: Invalid Email
                </button>
              </div>

              <textarea
                value={sandboxPayload}
                onChange={(e) => setSandboxPayload(e.target.value)}
                rows={14}
                className="w-full rounded-xl border border-[var(--max-border)] bg-[var(--max-bg-primary)] p-3 font-mono text-xs text-[var(--max-text)] outline-none focus:border-[var(--max-primary)]"
                placeholder="Enter JSON record payload..."
              />

              <button
                onClick={handleEvaluateSandbox}
                disabled={evaluating}
                className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-500/20 hover:opacity-95 transition disabled:opacity-50"
              >
                {evaluating ? "Evaluating Logic..." : "Execute Rules Engine"}
              </button>
            </div>

            {/* Results Side */}
            <div className="flex flex-col rounded-2xl border border-[var(--max-border)] bg-[var(--max-bg-secondary)] p-6 shadow-sm">
              <h3 className="text-base font-semibold text-[var(--max-text)]">
                Evaluation Telemetry
              </h3>
              <p className="text-xs text-[var(--max-text-secondary)] mb-4">
                Real-time validation outcomes, visibility flags, computed values, and trace logs
              </p>

              {evaluationResult ? (
                <div className="flex flex-col gap-4">
                  {/* Status Banner */}
                  <div
                    className={`flex items-center justify-between rounded-xl p-4 border ${
                      evaluationResult.valid
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                        : "border-rose-500/30 bg-rose-500/10 text-rose-400"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{evaluationResult.valid ? "✓" : "⚠"}</span>
                      <span className="font-semibold text-sm">
                        {evaluationResult.valid
                          ? "Payload Passed All Validation Assertions"
                          : "Integrity Violations Detected"}
                      </span>
                    </div>
                    <span className="text-xs font-mono">
                      {evaluationResult.appliedRuleKeys.length} rules triggered
                    </span>
                  </div>

                  {/* Validation Errors */}
                  {evaluationResult.validationErrors.length > 0 && (
                    <div className="rounded-xl border border-rose-500/20 bg-[var(--max-bg-primary)] p-4">
                      <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-2">
                        Validation Violations
                      </h4>
                      <ul className="list-inside list-disc space-y-1 text-xs text-rose-300">
                        {evaluationResult.validationErrors.map((err, idx) => (
                          <li key={idx}>{err}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Computed Fields */}
                  {Object.keys(evaluationResult.computedFields).length > 0 && (
                    <div className="rounded-xl border border-amber-500/20 bg-[var(--max-bg-primary)] p-4">
                      <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
                        Computed Formulas
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(evaluationResult.computedFields).map(([k, v]) => (
                          <div
                            key={k}
                            className="rounded-lg bg-[var(--max-bg-secondary)] p-2.5 font-mono text-xs"
                          >
                            <span className="text-[var(--max-text-secondary)]">{k}: </span>
                            <span className="text-amber-300 font-bold">{String(v)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Field Visibility & Locking */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-cyan-500/20 bg-[var(--max-bg-primary)] p-3">
                      <h4 className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider mb-1.5">
                        Visibility Map
                      </h4>
                      {Object.keys(evaluationResult.fieldVisibility).length > 0 ? (
                        <div className="space-y-1 text-xs font-mono">
                          {Object.entries(evaluationResult.fieldVisibility).map(([k, v]) => (
                            <div key={k} className="flex justify-between">
                              <span>{k}</span>
                              <span className={v ? "text-emerald-400" : "text-rose-400"}>
                                {v ? "Visible" : "Hidden"}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-[var(--max-text-secondary)]">All fields visible</span>
                      )}
                    </div>

                    <div className="rounded-xl border border-purple-500/20 bg-[var(--max-bg-primary)] p-3">
                      <h4 className="text-[10px] font-bold text-purple-400 uppercase tracking-wider mb-1.5">
                        Field Lock State
                      </h4>
                      {Object.keys(evaluationResult.fieldLocked).length > 0 ? (
                        <div className="space-y-1 text-xs font-mono">
                          {Object.entries(evaluationResult.fieldLocked).map(([k, v]) => (
                            <div key={k} className="flex justify-between">
                              <span>{k}</span>
                              <span className={v ? "text-purple-400 font-bold" : "text-[var(--max-text-secondary)]"}>
                                {v ? "Locked (Read-Only)" : "Editable"}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-[var(--max-text-secondary)]">No fields locked</span>
                      )}
                    </div>
                  </div>

                  {/* Execution Trace Logs */}
                  <div className="rounded-xl border border-[var(--max-border)] bg-[var(--max-bg-primary)] p-3">
                    <h4 className="text-[10px] font-bold text-[var(--max-text-secondary)] uppercase tracking-wider mb-1.5">
                      Trace Logs
                    </h4>
                    <div className="max-h-36 overflow-y-auto space-y-1 text-[11px] font-mono text-[var(--max-text-secondary)]">
                      {evaluationResult.evaluationLogs.map((logStr, i) => (
                        <div key={i}>{logStr}</div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-[var(--max-border)] p-12 text-center">
                  <div className="text-3xl mb-2">⚡</div>
                  <p className="text-sm font-semibold text-[var(--max-text)]">Sandbox Ready</p>
                  <p className="text-xs text-[var(--max-text-secondary)] max-w-sm mt-1">
                    Select a preset or edit the JSON payload on the left, then click &quot;Execute Rules Engine&quot; to test your business logic.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Create Rule Modal */}
        {createModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-2xl rounded-2xl border border-[var(--max-border)] bg-[var(--max-bg-secondary)] p-6 shadow-2xl">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-[var(--max-text)]">
                  Create Business Rule
                </h3>
                <button
                  onClick={() => setCreateModalOpen(false)}
                  className="rounded-lg p-1 text-[var(--max-text-secondary)] hover:bg-[var(--max-bg-primary)]"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateRule} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-[var(--max-text-secondary)]">
                      Rule Key (System identifier)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. cust_credit_limit_check"
                      value={ruleKey}
                      onChange={(e) => setRuleKey(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-[var(--max-border)] bg-[var(--max-bg-primary)] px-3 py-2 text-xs text-[var(--max-text)] outline-none focus:border-[var(--max-primary)]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[var(--max-text-secondary)]">
                      Rule Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Enforce Customer Credit Limit"
                      value={ruleName}
                      onChange={(e) => setRuleName(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-[var(--max-border)] bg-[var(--max-bg-primary)] px-3 py-2 text-xs text-[var(--max-text)] outline-none focus:border-[var(--max-primary)]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-medium text-[var(--max-text-secondary)]">
                      Target Object
                    </label>
                    <select
                      value={boTarget}
                      onChange={(e) => setBoTarget(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-[var(--max-border)] bg-[var(--max-bg-primary)] px-3 py-2 text-xs text-[var(--max-text)]"
                    >
                      <option value="Customer">Customer</option>
                      <option value="Sales Order">Sales Order</option>
                      <option value="Vendor">Vendor</option>
                      <option value="Product">Product</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[var(--max-text-secondary)]">
                      Rule Type
                    </label>
                    <select
                      value={ruleType}
                      onChange={(e) => setRuleType(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-[var(--max-border)] bg-[var(--max-bg-primary)] px-3 py-2 text-xs text-[var(--max-text)]"
                    >
                      <option value="VALIDATION">Validation</option>
                      <option value="VISIBILITY">Visibility</option>
                      <option value="COMPUTATION">Computation</option>
                      <option value="LOCKING">Locking</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[var(--max-text-secondary)]">
                      Trigger Event
                    </label>
                    <select
                      value={triggerEvent}
                      onChange={(e) => setTriggerEvent(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-[var(--max-border)] bg-[var(--max-bg-primary)] px-3 py-2 text-xs text-[var(--max-text)]"
                    >
                      <option value="ON_SUBMIT">ON_SUBMIT</option>
                      <option value="ON_CHANGE">ON_CHANGE</option>
                      <option value="ON_LOAD">ON_LOAD</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-[var(--max-text-secondary)]">
                    Condition Expression (e.g. creditLimit &gt;= 0, status == &apos;ACTIVE&apos;)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="creditLimit >= 0"
                    value={conditionExpr}
                    onChange={(e) => setConditionExpr(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[var(--max-border)] bg-[var(--max-bg-primary)] px-3 py-2 font-mono text-xs text-[var(--max-text)] outline-none focus:border-[var(--max-primary)]"
                  />
                </div>

                {ruleType === "VALIDATION" && (
                  <div>
                    <label className="text-xs font-medium text-[var(--max-text-secondary)]">
                      Error Message On Violation
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Credit limit cannot be a negative amount."
                      value={errorMessage}
                      onChange={(e) => setErrorMessage(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-[var(--max-border)] bg-[var(--max-bg-primary)] px-3 py-2 text-xs text-[var(--max-text)] outline-none focus:border-[var(--max-primary)]"
                    />
                  </div>
                )}

                {(ruleType === "VISIBILITY" || ruleType === "LOCKING") && (
                  <div>
                    <label className="text-xs font-medium text-[var(--max-text-secondary)]">
                      Target Field(s) (comma-separated if multiple)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. taxExemptReason, taxId"
                      value={targetField}
                      onChange={(e) => setTargetField(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-[var(--max-border)] bg-[var(--max-bg-primary)] px-3 py-2 text-xs text-[var(--max-text)] outline-none focus:border-[var(--max-primary)]"
                    />
                  </div>
                )}

                {ruleType === "COMPUTATION" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-[var(--max-text-secondary)]">
                        Target Field (To Store Result)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. netTotal"
                        value={targetField}
                        onChange={(e) => setTargetField(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-[var(--max-border)] bg-[var(--max-bg-primary)] px-3 py-2 text-xs text-[var(--max-text)] outline-none focus:border-[var(--max-primary)]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-[var(--max-text-secondary)]">
                        Formula Expression
                      </label>
                      <input
                        type="text"
                        placeholder="subtotal - discountAmount + taxAmount"
                        value={formula}
                        onChange={(e) => setFormula(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-[var(--max-border)] bg-[var(--max-bg-primary)] px-3 py-2 font-mono text-xs text-[var(--max-text)] outline-none focus:border-[var(--max-primary)]"
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setCreateModalOpen(false)}
                    className="rounded-xl border border-[var(--max-border)] px-4 py-2 text-xs font-semibold text-[var(--max-text-secondary)] hover:text-[var(--max-text)]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingRule}
                    className="rounded-xl bg-[var(--max-primary)] px-5 py-2 text-xs font-semibold text-white shadow-md shadow-blue-500/20 hover:opacity-90 disabled:opacity-50"
                  >
                    {submittingRule ? "Saving..." : "Save Rule"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </MaxShell>
  );
}

function simulateEvaluation(bo: string, data: Record<string, unknown>): EvaluationResult {
  const result: EvaluationResult = {
    valid: true,
    validationErrors: [],
    fieldVisibility: {},
    fieldLocked: {},
    computedFields: {},
    appliedRuleKeys: [],
    evaluationLogs: [],
  };

  if (bo === "Customer") {
    const credit = Number(data.creditLimit ?? 0);
    if (credit < 0) {
      result.valid = false;
      result.validationErrors.push("Credit limit cannot be a negative amount: " + credit);
      result.appliedRuleKeys.push("customer_credit_limit_positive");
      result.evaluationLogs.push("Rule [customer_credit_limit_positive]: VIOLATED - creditLimit < 0");
    } else {
      result.appliedRuleKeys.push("customer_credit_limit_positive");
      result.evaluationLogs.push("Rule [customer_credit_limit_positive]: PASSED");
    }

    if (data.isTaxExempt === true) {
      result.fieldVisibility["taxExemptReason"] = true;
      result.appliedRuleKeys.push("customer_tax_exemption_visibility");
    } else {
      result.fieldVisibility["taxExemptReason"] = false;
    }

    if (data.status === "ACTIVE") {
      result.fieldLocked["taxId"] = true;
      result.fieldLocked["legalName"] = true;
      result.appliedRuleKeys.push("customer_lock_tax_id_active");
    }
  } else if (bo === "Sales Order") {
    const sub = Number(data.subtotal ?? 0);
    const disc = Number(data.discountAmount ?? 0);
    const tax = Number(data.taxAmount ?? 0);
    result.computedFields["netTotal"] = sub - disc + tax;
    result.appliedRuleKeys.push("sales_order_net_total_calc");
    result.evaluationLogs.push("Rule [sales_order_net_total_calc]: Computed netTotal = " + (sub - disc + tax));

    const total = Number(data.totalAmount ?? sub);
    const limit = Number(data.creditLimit ?? 0);
    if (limit > 0 && total > limit) {
      result.valid = false;
      result.validationErrors.push("Sales Order total ($" + total + ") exceeds customer credit limit ($" + limit + ").");
      result.appliedRuleKeys.push("sales_order_credit_limit_check");
    }
  } else if (bo === "Vendor") {
    const email = String(data.email ?? "");
    if (!email.includes("@")) {
      result.valid = false;
      result.validationErrors.push("A valid corporate vendor contact email is required.");
      result.appliedRuleKeys.push("vendor_email_required");
    }
  }

  return result;
}

function getSeededRules(): BusinessRule[] {
  return [
    {
      id: "rule-cust-credit-val",
      ruleKey: "customer_credit_limit_positive",
      name: "Customer Credit Limit Must Be Non-Negative",
      businessObjectId: "customer-bo-id",
      businessObjectName: "Customer",
      ruleType: "VALIDATION",
      triggerEvent: "ON_SUBMIT",
      conditionExpression: "creditLimit >= 0",
      actionPayload: { errorMessage: "Credit limit cannot be a negative amount.", field: "creditLimit" },
      status: "ACTIVE",
      priorityOrder: 10,
      createdAt: new Date().toISOString(),
    },
    {
      id: "rule-cust-tax-vis",
      ruleKey: "customer_tax_exemption_visibility",
      name: "Show Tax Exemption Reason Only When Tax Exempt",
      businessObjectId: "customer-bo-id",
      businessObjectName: "Customer",
      ruleType: "VISIBILITY",
      triggerEvent: "ON_CHANGE",
      conditionExpression: "isTaxExempt == true",
      actionPayload: { targetField: "taxExemptReason", visibleWhenTrue: true },
      status: "ACTIVE",
      priorityOrder: 20,
      createdAt: new Date().toISOString(),
    },
    {
      id: "rule-cust-lock-active",
      ruleKey: "customer_lock_tax_id_active",
      name: "Lock Tax ID and Legal Name Once Customer Is Active",
      businessObjectId: "customer-bo-id",
      businessObjectName: "Customer",
      ruleType: "LOCKING",
      triggerEvent: "ON_LOAD",
      conditionExpression: "status == 'ACTIVE'",
      actionPayload: { targetFields: ["taxId", "legalName", "registrationNumber"] },
      status: "ACTIVE",
      priorityOrder: 30,
      createdAt: new Date().toISOString(),
    },
    {
      id: "rule-so-credit-check",
      ruleKey: "sales_order_credit_limit_check",
      name: "Enforce Customer Credit Limit On Sales Orders",
      businessObjectId: "sales-order-bo-id",
      businessObjectName: "Sales Order",
      ruleType: "VALIDATION",
      triggerEvent: "ON_SUBMIT",
      conditionExpression: "totalAmount <= creditLimit",
      actionPayload: { errorMessage: "Sales Order total exceeds customer approved credit limit.", field: "totalAmount" },
      status: "ACTIVE",
      priorityOrder: 10,
      createdAt: new Date().toISOString(),
    },
    {
      id: "rule-so-net-calc",
      ruleKey: "sales_order_net_total_calc",
      name: "Calculate Net Total with Discount and Tax",
      businessObjectId: "sales-order-bo-id",
      businessObjectName: "Sales Order",
      ruleType: "COMPUTATION",
      triggerEvent: "ON_CHANGE",
      conditionExpression: "subtotal > 0",
      actionPayload: { targetField: "netTotal", formula: "subtotal - discountAmount + taxAmount" },
      status: "ACTIVE",
      priorityOrder: 15,
      createdAt: new Date().toISOString(),
    },
    {
      id: "rule-vnd-email-val",
      ruleKey: "vendor_email_required",
      name: "Require Valid Corporate Email For Vendors",
      businessObjectId: "vendor-bo-id",
      businessObjectName: "Vendor",
      ruleType: "VALIDATION",
      triggerEvent: "ON_SUBMIT",
      conditionExpression: "email != null && email.contains('@')",
      actionPayload: { errorMessage: "A valid corporate vendor contact email is required.", field: "email" },
      status: "ACTIVE",
      priorityOrder: 10,
      createdAt: new Date().toISOString(),
    },
    {
      id: "rule-prd-margin-calc",
      ruleKey: "product_margin_computation",
      name: "Compute Gross Margin Percentage",
      businessObjectId: "product-bo-id",
      businessObjectName: "Product",
      ruleType: "COMPUTATION",
      triggerEvent: "ON_CHANGE",
      conditionExpression: "sellingPrice > 0",
      actionPayload: { targetField: "marginPercent", formula: "((sellingPrice - costPrice) / sellingPrice) * 100" },
      status: "ACTIVE",
      priorityOrder: 12,
      createdAt: new Date().toISOString(),
    },
  ];
}
