"use client";

import { useState, useEffect } from "react";
import RecruitingShell from "@/components/recruitment/RecruitingShell";
import {
  recruitmentAiActionRegistry,
  AiActionDefinition,
} from "@/lib/recruitment-ai-action-registry";
import {
  recruitmentAiWorkflowEngine,
  RecruitingAiWorkflow,
  WorkflowExecutionLog,
} from "@/lib/recruitment-ai-workflow-engine";

export default function MaxAiStudioPage() {
  const [activeTab, setActiveTab] = useState<"actions" | "workflows" | "providers" | "audit">("actions");
  const [actions, setActions] = useState<AiActionDefinition[]>([]);
  const [workflows, setWorkflows] = useState<RecruitingAiWorkflow[]>([]);
  const [auditLogs, setAuditLogs] = useState<WorkflowExecutionLog[]>([]);
  const [selectedAction, setSelectedAction] = useState<AiActionDefinition | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // Provider config state
  const [selectedProvider, setSelectedProvider] = useState("anthropic");
  const [selectedModel, setSelectedModel] = useState("claude-3-7-sonnet");
  const [dailyQuota, setDailyQuota] = useState("500000");
  const [sovereignFallback, setSovereignFallback] = useState(true);

  useEffect(() => {
    setActions(recruitmentAiActionRegistry.getAllActions());
    setWorkflows(recruitmentAiWorkflowEngine.getWorkflows());
    setAuditLogs(recruitmentAiWorkflowEngine.getExecutionLogs());
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const toggleAction = (actionKey: string, current: boolean) => {
    recruitmentAiActionRegistry.toggleAction(actionKey, !current);
    setActions([...recruitmentAiActionRegistry.getAllActions()]);
    triggerToast(`Action '${actionKey}' is now ${!current ? "Enabled" : "Disabled"}.`);
  };

  const toggleWorkflow = (workflowKey: string, current: boolean) => {
    recruitmentAiWorkflowEngine.toggleWorkflow(workflowKey, !current);
    setWorkflows([...recruitmentAiWorkflowEngine.getWorkflows()]);
    triggerToast(`Workflow '${workflowKey}' is now ${!current ? "Active" : "Paused"}.`);
  };

  const handleTestWorkflow = async (workflowKey: string) => {
    setIsSimulating(true);
    try {
      const log = await recruitmentAiWorkflowEngine.executeWorkflow({
        workflowKey,
        entityId: "cand-app-01 (Priya Menon)",
        entityType: "CandidateApplication",
        dryRun: true,
      });
      setAuditLogs([...recruitmentAiWorkflowEngine.getExecutionLogs()]);
      triggerToast(`✓ Simulated dry-run completed successfully for ${log.workflowName}.`);
    } catch (e: any) {
      triggerToast(`Simulation error: ${e.message}`);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <RecruitingShell>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Toast */}
        {toastMessage && (
          <div className="fixed top-20 right-5 z-50 rounded-xl bg-slate-900 border border-slate-700 px-4 py-2 text-xs font-semibold text-white shadow-2xl backdrop-blur-md animate-in fade-in">
            {toastMessage}
          </div>
        )}

        {/* 1. Header with Breadcrumb & Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
              <span>Recruiting</span>
              <span>/</span>
              <span className="text-blue-600">MAX AI Studio</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-500 text-white shadow-sm shadow-indigo-500/30">
                <span className="text-base">⚙️</span>
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  MAX AI Studio
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  Configurable AI action registry, event-driven workflow builder, and multi-tenant LLM governance.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => triggerToast("✨ Ready to register new custom action.")}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
            >
              + New AI Action
            </button>
            <button
              type="button"
              onClick={() => triggerToast("✨ Ready to build new workflow.")}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
            >
              + New Workflow
            </button>
          </div>
        </div>

        {/* 2. Top Tabs */}
        <div className="flex items-center gap-1 border-b border-slate-200 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("actions")}
            className={`pb-3 px-3 transition cursor-pointer border-b-2 flex items-center gap-1.5 ${
              activeTab === "actions"
                ? "border-blue-600 text-blue-600 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>🛠️</span>
            <span>Configurable AI Actions ({actions.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("workflows")}
            className={`pb-3 px-3 transition cursor-pointer border-b-2 flex items-center gap-1.5 ${
              activeTab === "workflows"
                ? "border-blue-600 text-blue-600 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>⚡</span>
            <span>Event-Driven Workflow Builder ({workflows.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("providers")}
            className={`pb-3 px-3 transition cursor-pointer border-b-2 flex items-center gap-1.5 ${
              activeTab === "providers"
                ? "border-blue-600 text-blue-600 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>🧠</span>
            <span>Multi-Tenant LLM Provider Settings</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("audit")}
            className={`pb-3 px-3 transition cursor-pointer border-b-2 flex items-center gap-1.5 ${
              activeTab === "audit"
                ? "border-blue-600 text-blue-600 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>📋</span>
            <span>Execution Audit Trail ({auditLogs.length})</span>
          </button>
        </div>

        {/* 3. TAB CONTENT */}
        {/* TAB 1: AI Actions Registry */}
        {activeTab === "actions" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {actions.map((act) => (
                <div
                  key={act.actionKey}
                  className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-blue-400 transition flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {act.category}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleAction(act.actionKey, act.enabled)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                          act.enabled
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                            : "bg-slate-100 text-slate-600 border border-slate-300"
                        }`}
                      >
                        {act.enabled ? "Active" : "Disabled"}
                      </button>
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{act.name}</h3>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{act.description}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 space-y-1 text-[11px] text-slate-600">
                      <div>
                        <span className="text-slate-400">Supported Screens: </span>
                        <span className="font-semibold text-slate-700">{act.supportedScreens.join(", ")}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Confirmation Guard: </span>
                        <span className={`font-semibold ${act.requiresConfirmation ? "text-amber-600" : "text-slate-700"}`}>
                          {act.requiresConfirmation ? "⚠️ Requires Approval" : "Instant"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-medium">v{act.version}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedAction(act)}
                      className="text-xs text-blue-600 hover:underline font-semibold cursor-pointer"
                    >
                      Configure Schema & Prompts ↗
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Selected Action Detail Modal / Drawer */}
            {selectedAction && (
              <div className="p-5 rounded-2xl bg-white border border-blue-200 shadow-xl space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Configure Action: {selectedAction.name}
                    </h3>
                    <span className="text-xs text-slate-500 font-mono">{selectedAction.actionKey} • Version {selectedAction.version}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedAction(null)}
                    className="p-1 rounded text-slate-400 hover:text-slate-700 text-sm font-bold cursor-pointer"
                  >
                    ✕ Close
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-2">
                    <label className="font-bold text-slate-700 block">Prompt Template</label>
                    <textarea
                      rows={5}
                      defaultValue={selectedAction.promptTemplate}
                      className="w-full font-mono text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-bold text-slate-700 block">Required RBAC Permissions</label>
                    <input
                      type="text"
                      defaultValue={selectedAction.requiredPermissions.join(", ")}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                    />
                    <label className="font-bold text-slate-700 block pt-2">Timeout Behavior</label>
                    <span className="text-slate-500 block">Bounded maximum runtime: {selectedAction.timeoutMs} ms with idempotent retry guard.</span>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      triggerToast(`✓ Configuration updated for ${selectedAction.name}.`);
                      setSelectedAction(null);
                    }}
                    className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Workflow Builder */}
        {activeTab === "workflows" && (
          <div className="space-y-4">
            {workflows.map((wf) => (
              <div
                key={wf.workflowId}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-extrabold text-slate-900">{wf.name}</h3>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        Trigger: {wf.triggerEvent}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{wf.description}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isSimulating}
                      onClick={() => handleTestWorkflow(wf.workflowKey)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition cursor-pointer border border-slate-300 flex items-center gap-1.5"
                    >
                      <span>▶</span>
                      <span>Test Run / Preview</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleWorkflow(wf.workflowKey, wf.enabled)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        wf.enabled ? "bg-emerald-600 text-white" : "bg-slate-300 text-slate-700"
                      }`}
                    >
                      {wf.enabled ? "Active" : "Paused"}
                    </button>
                  </div>
                </div>

                {/* Workflow Steps Visual Chain */}
                <div className="pt-2 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Governed Step Execution Chain ({wf.steps.length} Steps)
                  </span>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                    {wf.steps.map((st, i) => (
                      <div key={st.stepId} className="flex items-center gap-2 shrink-0">
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 shadow-2xs space-y-0.5 min-w-[170px]">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="font-bold text-slate-400">Step {st.stepOrder}</span>
                            <span className="px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 text-[9px] font-semibold">
                              {st.type.replace("_", " ")}
                            </span>
                          </div>
                          <span className="font-bold text-slate-900 block truncate">{st.name}</span>
                          <span className="text-[10px] text-slate-500 block truncate">
                            {st.actionKey || st.serviceTarget || st.assigneeRole}
                          </span>
                        </div>
                        {i < wf.steps.length - 1 && (
                          <span className="text-slate-400 font-bold">→</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: Multi-Tenant LLM Provider Config */}
        {activeTab === "providers" && (
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-5 max-w-3xl">
            <div>
              <h3 className="text-base font-bold text-slate-900">LLM Provider & Governance Configuration</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure authorized LLM providers, model tiers, and token quotas per enterprise tenant.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Primary LLM Provider</label>
                  <select
                    value={selectedProvider}
                    onChange={(e) => setSelectedProvider(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                  >
                    <option value="anthropic">Anthropic (Claude 3.7)</option>
                    <option value="openai">OpenAI (GPT-4o)</option>
                    <option value="sovereign">Local Sovereign LLM (Llama 3 70B)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Default Model Tier</label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                  >
                    <option value="claude-3-7-sonnet">claude-3-7-sonnet-20250219</option>
                    <option value="gpt-4o">gpt-4o-enterprise</option>
                    <option value="max-sovereign-70b">max-sovereign-70b-v2</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tenant Daily Token Quota</label>
                <input
                  type="text"
                  value={dailyQuota}
                  onChange={(e) => setDailyQuota(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Tokens reset daily at 00:00 UTC with automated circuit breaker.</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block">Sovereign On-Premise Fallback</span>
                  <span className="text-[10px] text-slate-500">Route prompts to local cluster if cloud provider latency exceeds 3000ms.</span>
                </div>
                <input
                  type="checkbox"
                  checked={sovereignFallback}
                  onChange={(e) => setSovereignFallback(e.target.checked)}
                  className="h-4 w-4 rounded text-blue-600 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => triggerToast("✓ LLM Provider settings saved securely for tenant.")}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
              >
                Save Provider Settings
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: Audit Trail */}
        {activeTab === "audit" && (
          <div className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Automated Execution Logs & Security Ledger</h3>
              <span className="text-xs text-slate-500 font-semibold">{auditLogs.length} Events</span>
            </div>
            {auditLogs.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No workflow execution events logged in current session. Run a test workflow above.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 text-xs">
                {auditLogs.map((log) => (
                  <div key={log.executionId} className="p-4 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{log.workflowName}</span>
                        <span className={`px-2 py-0.2 rounded text-[10px] font-bold ${
                          log.isDryRun ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                        }`}>
                          {log.status}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">{log.startedAt}</span>
                    </div>
                    <p className="text-slate-600 text-[11px]">
                      Target Entity: <strong className="text-slate-800">{log.entityId}</strong> ({log.entityType}) • Trigger: {log.triggerEvent}
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {log.executedSteps.map((st) => (
                        <span key={st.stepId} className="px-2 py-0.5 rounded bg-slate-50 border border-slate-200 text-[10px] text-slate-700">
                          {st.name} ({st.durationMs}ms)
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </RecruitingShell>
  );
}
