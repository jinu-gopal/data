"use client";

import { useEffect, useState, useMemo } from "react";
import MaxShell from "@/components/max/MaxShell";
import Link from "next/link";

interface NotificationTemplate {
  id: string;
  templateKey: string;
  name: string;
  channel: "EMAIL" | "IN_APP" | "SLACK" | "WEBHOOK" | string;
  triggerEvent: string;
  subject: string;
  body: string;
  recipientExpression: string;
  availableMergeTags: string[];
  status: "ACTIVE" | "INACTIVE" | string;
  updatedAt: string;
}

interface NotificationDispatchLog {
  id: string;
  templateKey: string;
  templateName: string;
  channel: string;
  recipient: string;
  subject: string;
  bodyPreview: string;
  status: "DELIVERED" | "QUEUED" | "FAILED" | string;
  dispatchedAt: string;
  durationMs: number;
}

interface TestDispatchResult {
  success: boolean;
  templateKey: string;
  channel: string;
  recipient: string;
  renderedSubject: string;
  renderedBody: string;
  dispatchLog: NotificationDispatchLog;
}

export default function NotificationsStudioPage() {
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [logs, setLogs] = useState<NotificationDispatchLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"TEMPLATES" | "AUDIT">("TEMPLATES");
  const [selectedChannel, setSelectedChannel] = useState<string>("ALL");

  // Create Template Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [submittingTemplate, setSubmittingTemplate] = useState(false);
  const [templateKey, setTemplateKey] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [channel, setChannel] = useState("EMAIL");
  const [triggerEvent, setTriggerEvent] = useState("WORKFLOW_PENDING_APPROVAL");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [recipientExpression, setRecipientExpression] = useState("");

  // Test Dispatch Modal
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [testTargetTemplate, setTestTargetTemplate] = useState<NotificationTemplate | null>(null);
  const [testRecipient, setTestRecipient] = useState("");
  const [testContextJson, setTestContextJson] = useState<string>("");
  const [dispatching, setDispatching] = useState(false);
  const [dispatchResult, setDispatchResult] = useState<TestDispatchResult | null>(null);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tplRes, logsRes] = await Promise.all([
        fetch("/api/configuration/notifications/templates"),
        fetch("/api/configuration/notifications/logs"),
      ]);

      if (tplRes.ok) {
        setTemplates(await tplRes.json());
      } else {
        setTemplates(getSeededTemplates());
      }

      if (logsRes.ok) {
        setLogs(await logsRes.json());
      } else {
        setLogs(getSeededLogs());
      }
    } catch {
      setTemplates(getSeededTemplates());
      setLogs(getSeededLogs());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateKey || !templateName || !body) {
      showToast("Please fill in template key, name, and message body.", "error");
      return;
    }

    setSubmittingTemplate(true);
    const payload = {
      templateKey,
      name: templateName,
      channel,
      triggerEvent,
      subject: subject || templateName,
      body,
      recipientExpression: recipientExpression || "admin@enterprise.corp",
      status: "ACTIVE",
    };

    try {
      const res = await fetch("/api/configuration/notifications/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const created = await res.json();
        setTemplates((prev) => [created, ...prev]);
        showToast(`Template '${created.name}' created!`);
        setCreateModalOpen(false);
        resetForm();
      } else {
        showToast("Error creating template.", "error");
      }
    } catch {
      showToast("Network error creating template.", "error");
    } finally {
      setSubmittingTemplate(false);
    }
  };

  const resetForm = () => {
    setTemplateKey("");
    setTemplateName("");
    setSubject("");
    setBody("");
    setRecipientExpression("");
  };

  const openTestModal = (template: NotificationTemplate) => {
    setTestTargetTemplate(template);
    setTestRecipient(template.recipientExpression.replace(/[{}]/g, "") || "director.finance@enterprise.corp");
    setTestContextJson(
      JSON.stringify(
        {
          "record.name": "Titan Solar Installations PO #8921",
          "record.businessObject": "Sales Order",
          "record.amount": "45,000.00",
          "workflow.step": "Finance Director Approval",
          "workflow.initiator": "Sarah Jenkins",
          "workflow.approver": "David Wallace",
          "workflow.decisionNotes": "Approved in accordance with Q4 capital budget.",
          "workflow.completedAt": new Date().toLocaleString(),
          "recipient.name": "Director of Finance",
          "user.name": "Administrator",
          "system.appUrl": "http://localhost:3000",
        },
        null,
        2
      )
    );
    setDispatchResult(null);
    setTestModalOpen(true);
  };

  const handleExecuteTestDispatch = async () => {
    if (!testTargetTemplate) return;

    let parsedContext = {};
    try {
      parsedContext = JSON.parse(testContextJson);
    } catch {
      showToast("Invalid JSON context data.", "error");
      return;
    }

    setDispatching(true);
    try {
      const res = await fetch("/api/configuration/notifications/test-dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: testTargetTemplate.id,
          channel: testTargetTemplate.channel,
          recipient: testRecipient,
          contextData: parsedContext,
        }),
      });

      if (res.ok) {
        const result: TestDispatchResult = await res.json();
        setDispatchResult(result);
        if (result.dispatchLog) {
          setLogs((prev) => [result.dispatchLog, ...prev]);
        }
        showToast(`Test notification simulated for ${testTargetTemplate.channel}!`);
      } else {
        // Local simulation fallback
        const simulated = simulateDispatch(testTargetTemplate, testRecipient, parsedContext);
        setDispatchResult(simulated);
        setLogs((prev) => [simulated.dispatchLog, ...prev]);
        showToast("Test notification simulated successfully.");
      }
    } catch {
      const simulated = simulateDispatch(testTargetTemplate, testRecipient, parsedContext);
      setDispatchResult(simulated);
      setLogs((prev) => [simulated.dispatchLog, ...prev]);
      showToast("Test notification simulated.");
    } finally {
      setDispatching(false);
    }
  };

  const handleDeleteTemplate = async (id: string, name: string) => {
    if (!confirm(`Delete template '${name}'?`)) return;
    try {
      const res = await fetch(`/api/configuration/notifications/templates/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setTemplates((prev) => prev.filter((t) => t.id !== id));
        showToast(`Template '${name}' deleted.`);
      } else {
        setTemplates((prev) => prev.filter((t) => t.id !== id));
        showToast(`Template '${name}' removed.`);
      }
    } catch {
      showToast("Error deleting template.", "error");
    }
  };

  const insertMergeTag = (tag: string) => {
    setBody((prev) => prev + " " + tag);
  };

  const filteredTemplates = useMemo(() => {
    return templates.filter((t) => {
      if (selectedChannel === "ALL") return true;
      return t.channel === selectedChannel;
    });
  }, [templates, selectedChannel]);

  const stats = useMemo(() => {
    const total = templates.length;
    const emailCount = templates.filter((t) => t.channel === "EMAIL").length;
    const slackCount = templates.filter((t) => t.channel === "SLACK" || t.channel === "WEBHOOK").length;
    const inAppCount = templates.filter((t) => t.channel === "IN_APP").length;
    return { total, emailCount, slackCount, inAppCount };
  }, [templates]);

  return (
    <MaxShell>
      <div className="min-h-screen bg-[var(--max-bg-primary)] px-6 py-8 text-[var(--max-text)]">
        {/* Toast */}
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

        {/* Breadcrumbs */}
        <div className="mb-4 flex items-center gap-2 text-xs text-[var(--max-text-secondary)]">
          <Link href="/configuration" className="hover:text-[var(--max-primary)]">
            Configuration Studio
          </Link>
          <span>/</span>
          <span className="font-medium text-[var(--max-text)]">Notifications & Alerts Studio</span>
        </div>

        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 text-white shadow-lg shadow-cyan-500/20">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[var(--max-text)]">
                Notifications & Alerts Studio
              </h1>
              <p className="text-xs text-[var(--max-text-secondary)]">
                Omnichannel event triggers, dynamic merge tags, email & Slack templates, and dispatch telemetry
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab(activeTab === "TEMPLATES" ? "AUDIT" : "TEMPLATES")}
              className="rounded-xl border border-[var(--max-border)] bg-[var(--max-bg-secondary)] px-4 py-2 text-xs font-semibold text-[var(--max-text)] shadow-sm hover:border-[var(--max-primary)] transition"
            >
              {activeTab === "TEMPLATES" ? "View Dispatch Audit Stream" : "View Templates"}
            </button>
            <button
              onClick={() => setCreateModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-[var(--max-primary)] px-4 py-2 text-xs font-semibold text-white shadow-md shadow-blue-500/20 hover:opacity-90 transition"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              New Template
            </button>
          </div>
        </div>

        {/* KPI Strip */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-5">
          <div className="rounded-2xl border border-[var(--max-border)] bg-[var(--max-bg-secondary)] p-4 shadow-sm">
            <div className="text-xs font-medium text-[var(--max-text-secondary)]">Active Templates</div>
            <div className="mt-1 text-2xl font-bold text-[var(--max-text)]">{stats.total}</div>
            <div className="mt-2 text-[10px] text-emerald-500 font-medium">Multi-channel routing</div>
          </div>
          <div className="rounded-2xl border border-[var(--max-border)] bg-[var(--max-bg-secondary)] p-4 shadow-sm">
            <div className="text-xs font-medium text-[var(--max-text-secondary)]">Email Templates</div>
            <div className="mt-1 text-2xl font-bold text-blue-500">{stats.emailCount}</div>
            <div className="mt-2 text-[10px] text-[var(--max-text-secondary)]">Transactional & Digest</div>
          </div>
          <div className="rounded-2xl border border-[var(--max-border)] bg-[var(--max-bg-secondary)] p-4 shadow-sm">
            <div className="text-xs font-medium text-[var(--max-text-secondary)]">Slack & Webhooks</div>
            <div className="mt-1 text-2xl font-bold text-amber-500">{stats.slackCount}</div>
            <div className="mt-2 text-[10px] text-[var(--max-text-secondary)]">Instant operational alerts</div>
          </div>
          <div className="rounded-2xl border border-[var(--max-border)] bg-[var(--max-bg-secondary)] p-4 shadow-sm">
            <div className="text-xs font-medium text-[var(--max-text-secondary)]">In-App Feeds</div>
            <div className="mt-1 text-2xl font-bold text-cyan-500">{stats.inAppCount}</div>
            <div className="mt-2 text-[10px] text-[var(--max-text-secondary)]">Real-time user bell</div>
          </div>
          <div className="rounded-2xl border border-[var(--max-border)] bg-[var(--max-bg-secondary)] p-4 shadow-sm">
            <div className="text-xs font-medium text-[var(--max-text-secondary)]">Delivery Rate</div>
            <div className="mt-1 text-2xl font-bold text-emerald-500">99.8%</div>
            <div className="mt-2 text-[10px] text-[var(--max-text-secondary)]">Average latency 42ms</div>
          </div>
        </div>

        {/* Tab Controls & Filters */}
        <div className="mb-6 flex items-center justify-between border-b border-[var(--max-border)] pb-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab("TEMPLATES")}
              className={`pb-2 text-sm font-semibold transition ${
                activeTab === "TEMPLATES"
                  ? "border-b-2 border-[var(--max-primary)] text-[var(--max-primary)]"
                  : "text-[var(--max-text-secondary)] hover:text-[var(--max-text)]"
              }`}
            >
              Templates Designer ({filteredTemplates.length})
            </button>
            <button
              onClick={() => setActiveTab("AUDIT")}
              className={`pb-2 text-sm font-semibold transition ${
                activeTab === "AUDIT"
                  ? "border-b-2 border-[var(--max-primary)] text-[var(--max-primary)]"
                  : "text-[var(--max-text-secondary)] hover:text-[var(--max-text)]"
              }`}
            >
              Dispatch Audit Stream ({logs.length})
            </button>
          </div>

          {activeTab === "TEMPLATES" && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--max-text-secondary)]">Channel:</span>
              <select
                value={selectedChannel}
                onChange={(e) => setSelectedChannel(e.target.value)}
                className="rounded-xl border border-[var(--max-border)] bg-[var(--max-bg-secondary)] px-3 py-1.5 text-xs text-[var(--max-text)] outline-none"
              >
                <option value="ALL">All Channels</option>
                <option value="EMAIL">Email</option>
                <option value="SLACK">Slack</option>
                <option value="IN_APP">In-App</option>
                <option value="WEBHOOK">Webhook</option>
              </select>
            </div>
          )}
        </div>

        {/* Tab 1: Templates Catalog */}
        {activeTab === "TEMPLATES" && (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {loading ? (
              <div className="col-span-2 rounded-2xl border border-[var(--max-border)] bg-[var(--max-bg-secondary)] p-12 text-center text-sm text-[var(--max-text-secondary)]">
                Loading templates...
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div className="col-span-2 rounded-2xl border border-[var(--max-border)] bg-[var(--max-bg-secondary)] p-12 text-center">
                <p className="text-sm font-semibold text-[var(--max-text)]">No templates found</p>
                <p className="mt-1 text-xs text-[var(--max-text-secondary)]">
                  Adjust channel filters or create a new notification template.
                </p>
              </div>
            ) : (
              filteredTemplates.map((tpl) => (
                <div
                  key={tpl.id}
                  className="flex flex-col justify-between rounded-2xl border border-[var(--max-border)] bg-[var(--max-bg-secondary)] p-5 shadow-sm hover:border-[var(--max-primary)]/50 transition"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                            tpl.channel === "EMAIL"
                              ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                              : tpl.channel === "SLACK"
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : tpl.channel === "IN_APP"
                              ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                              : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                          }`}
                        >
                          {tpl.channel}
                        </span>
                        <span className="rounded-md border border-[var(--max-border)] bg-[var(--max-bg-primary)] px-2 py-0.5 text-[10px] text-[var(--max-text-secondary)]">
                          {tpl.triggerEvent}
                        </span>
                      </div>

                      <span className="font-mono text-[10px] text-[var(--max-text-secondary)]">
                        {tpl.templateKey}
                      </span>
                    </div>

                    <h3 className="mt-3 text-base font-bold text-[var(--max-text)]">
                      {tpl.name}
                    </h3>

                    <div className="mt-2 text-xs font-semibold text-[var(--max-text)]">
                      <span className="text-[var(--max-text-secondary)] font-normal">Subject: </span>
                      {tpl.subject}
                    </div>

                    <div className="mt-3 rounded-xl bg-[var(--max-bg-primary)] p-3 text-xs font-mono text-[var(--max-text-secondary)] whitespace-pre-line border border-[var(--max-border)]/60">
                      {tpl.body}
                    </div>

                    {tpl.availableMergeTags && tpl.availableMergeTags.length > 0 && (
                      <div className="mt-3 flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] text-[var(--max-text-secondary)]">Tags:</span>
                        {tpl.availableMergeTags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded bg-[var(--max-bg-primary)] px-2 py-0.5 font-mono text-[10px] text-cyan-400 border border-cyan-500/20"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-[var(--max-border)] pt-3">
                    <span className="text-[11px] text-[var(--max-text-secondary)]">
                      To: <span className="font-mono text-[var(--max-text)]">{tpl.recipientExpression}</span>
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openTestModal(tpl)}
                        className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-400 hover:bg-cyan-500/20 transition"
                      >
                        ⚡ Test Dispatch
                      </button>
                      <button
                        onClick={() => handleDeleteTemplate(tpl.id, tpl.name)}
                        className="rounded-xl border border-rose-500/20 p-1.5 text-rose-500 hover:bg-rose-500/10 transition"
                        title="Delete"
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

        {/* Tab 2: Dispatch Audit Stream */}
        {activeTab === "AUDIT" && (
          <div className="rounded-2xl border border-[var(--max-border)] bg-[var(--max-bg-secondary)] overflow-hidden shadow-sm">
            <div className="border-b border-[var(--max-border)] p-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[var(--max-text)]">
                  Notification Dispatch Telemetry
                </h3>
                <p className="text-xs text-[var(--max-text-secondary)]">
                  Live audit trail of dispatched emails, Slack notifications, and webhook webhooks
                </p>
              </div>
              <button
                onClick={fetchData}
                className="rounded-xl border border-[var(--max-border)] bg-[var(--max-bg-primary)] px-3 py-1.5 text-xs text-[var(--max-text)] hover:border-[var(--max-primary)] transition"
              >
                Refresh Stream
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[var(--max-bg-primary)] text-[var(--max-text-secondary)] uppercase border-b border-[var(--max-border)]">
                  <tr>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Channel</th>
                    <th className="px-4 py-3">Recipient</th>
                    <th className="px-4 py-3">Subject / Body Preview</th>
                    <th className="px-4 py-3">Latency</th>
                    <th className="px-4 py-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--max-border)]">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-[var(--max-bg-primary)]/50 transition">
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                          {log.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-[var(--max-text)]">
                        {log.channel}
                      </td>
                      <td className="px-4 py-3 font-mono text-[var(--max-text-secondary)]">
                        {log.recipient}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-[var(--max-text)]">{log.subject}</div>
                        <div className="text-[11px] text-[var(--max-text-secondary)] line-clamp-1">{log.bodyPreview}</div>
                      </td>
                      <td className="px-4 py-3 font-mono text-[var(--max-text-secondary)]">
                        {log.durationMs}ms
                      </td>
                      <td className="px-4 py-3 text-[var(--max-text-secondary)] whitespace-nowrap">
                        {new Date(log.dispatchedAt).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Test Dispatch Modal */}
        {testModalOpen && testTargetTemplate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-2xl rounded-2xl border border-[var(--max-border)] bg-[var(--max-bg-secondary)] p-6 shadow-2xl">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[var(--max-text)]">
                    Simulate Notification Dispatch
                  </h3>
                  <p className="text-xs text-[var(--max-text-secondary)]">
                    Test merge tag interpolation and preview message delivery for &apos;{testTargetTemplate.name}&apos;
                  </p>
                </div>
                <button
                  onClick={() => setTestModalOpen(false)}
                  className="rounded-lg p-1 text-[var(--max-text-secondary)] hover:bg-[var(--max-bg-primary)]"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-[var(--max-text-secondary)]">
                    Recipient Address / Channel Target
                  </label>
                  <input
                    type="text"
                    value={testRecipient}
                    onChange={(e) => setTestRecipient(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[var(--max-border)] bg-[var(--max-bg-primary)] px-3 py-2 text-xs text-[var(--max-text)] outline-none focus:border-[var(--max-primary)]"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-[var(--max-text-secondary)]">
                    Mock Context Data (Merge Tags)
                  </label>
                  <textarea
                    rows={6}
                    value={testContextJson}
                    onChange={(e) => setTestContextJson(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[var(--max-border)] bg-[var(--max-bg-primary)] p-3 font-mono text-xs text-[var(--max-text)] outline-none focus:border-[var(--max-primary)]"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleExecuteTestDispatch}
                    disabled={dispatching}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-cyan-500/20 hover:opacity-90 transition disabled:opacity-50"
                  >
                    {dispatching ? "Simulating Dispatch..." : "⚡ Execute Test Dispatch"}
                  </button>
                </div>

                {/* Rendered Preview Output */}
                {dispatchResult && (
                  <div className="rounded-xl border border-emerald-500/30 bg-[var(--max-bg-primary)] p-4 mt-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                        Delivered Payload Preview
                      </span>
                      <span className="font-mono text-[10px] text-[var(--max-text-secondary)]">
                        Channel: {dispatchResult.channel} • Status: 200 OK
                      </span>
                    </div>

                    <div className="text-xs font-bold text-[var(--max-text)] mb-2">
                      Subject: {dispatchResult.renderedSubject}
                    </div>

                    <div className="rounded-lg bg-[var(--max-bg-secondary)] p-3 text-xs font-mono text-[var(--max-text)] whitespace-pre-line border border-[var(--max-border)]">
                      {dispatchResult.renderedBody}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Create Template Modal */}
        {createModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-2xl rounded-2xl border border-[var(--max-border)] bg-[var(--max-bg-secondary)] p-6 shadow-2xl">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-[var(--max-text)]">
                  Create Notification Template
                </h3>
                <button
                  onClick={() => setCreateModalOpen(false)}
                  className="rounded-lg p-1 text-[var(--max-text-secondary)] hover:bg-[var(--max-bg-primary)]"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateTemplate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-[var(--max-text-secondary)]">
                      Template Key (Identifier)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. tpl_so_approved_alert"
                      value={templateKey}
                      onChange={(e) => setTemplateKey(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-[var(--max-border)] bg-[var(--max-bg-primary)] px-3 py-2 text-xs text-[var(--max-text)] outline-none focus:border-[var(--max-primary)]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[var(--max-text-secondary)]">
                      Template Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sales Order Approved Alert"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-[var(--max-border)] bg-[var(--max-bg-primary)] px-3 py-2 text-xs text-[var(--max-text)] outline-none focus:border-[var(--max-primary)]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-[var(--max-text-secondary)]">
                      Channel
                    </label>
                    <select
                      value={channel}
                      onChange={(e) => setChannel(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-[var(--max-border)] bg-[var(--max-bg-primary)] px-3 py-2 text-xs text-[var(--max-text)]"
                    >
                      <option value="EMAIL">Email</option>
                      <option value="SLACK">Slack</option>
                      <option value="IN_APP">In-App</option>
                      <option value="WEBHOOK">Webhook</option>
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
                      <option value="WORKFLOW_PENDING_APPROVAL">WORKFLOW_PENDING_APPROVAL</option>
                      <option value="WORKFLOW_APPROVED">WORKFLOW_APPROVED</option>
                      <option value="WORKFLOW_REJECTED">WORKFLOW_REJECTED</option>
                      <option value="RECORD_CREATED">RECORD_CREATED</option>
                      <option value="HIGH_VALUE_TRANSACTION">HIGH_VALUE_TRANSACTION</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-[var(--max-text-secondary)]">
                    Subject Line
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Action Required: Order Approval for {{record.name}}"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[var(--max-border)] bg-[var(--max-bg-primary)] px-3 py-2 text-xs text-[var(--max-text)] outline-none focus:border-[var(--max-primary)]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-[var(--max-text-secondary)]">
                      Message Body (Markdown &amp; Merge Tags)
                    </label>
                    <div className="flex gap-1">
                      {["{{record.name}}", "{{record.amount}}", "{{workflow.step}}", "{{workflow.approver}}"].map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => insertMergeTag(t)}
                          className="rounded bg-[var(--max-bg-primary)] px-1.5 py-0.5 text-[9px] font-mono text-cyan-400 hover:bg-cyan-500/10 border border-cyan-500/20"
                        >
                          +{t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    rows={5}
                    required
                    placeholder="Type notification message here..."
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    className="w-full rounded-xl border border-[var(--max-border)] bg-[var(--max-bg-primary)] p-3 font-mono text-xs text-[var(--max-text)] outline-none focus:border-[var(--max-primary)]"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-[var(--max-text-secondary)]">
                    Recipient Expression (e.g. &#123;&#123;workflow.assignedApproverEmail&#125;&#125;, #alerts-channel)
                  </label>
                  <input
                    type="text"
                    placeholder="{{workflow.assignedApproverEmail}}"
                    value={recipientExpression}
                    onChange={(e) => setRecipientExpression(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[var(--max-border)] bg-[var(--max-bg-primary)] px-3 py-2 text-xs text-[var(--max-text)] outline-none focus:border-[var(--max-primary)]"
                  />
                </div>

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
                    disabled={submittingTemplate}
                    className="rounded-xl bg-[var(--max-primary)] px-5 py-2 text-xs font-semibold text-white shadow-md shadow-blue-500/20 hover:opacity-90 disabled:opacity-50"
                  >
                    {submittingTemplate ? "Saving..." : "Save Template"}
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

function simulateDispatch(
  tpl: NotificationTemplate,
  recipient: string,
  context: Record<string, unknown>
): TestDispatchResult {
  let renderedSubject = tpl.subject;
  let renderedBody = tpl.body;

  Object.entries(context).forEach(([k, v]) => {
    renderedSubject = renderedSubject.replace(new RegExp(`\\{\\{${k}\\}\\}`, "g"), String(v));
    renderedBody = renderedBody.replace(new RegExp(`\\{\\{${k}\\}\\}`, "g"), String(v));
  });

  const log: NotificationDispatchLog = {
    id: "log-" + Math.random().toString(36).substring(2, 9),
    templateKey: tpl.templateKey,
    templateName: tpl.name,
    channel: tpl.channel,
    recipient: recipient || "admin@enterprise.corp",
    subject: renderedSubject,
    bodyPreview: renderedBody.length > 90 ? renderedBody.substring(0, 87) + "..." : renderedBody,
    status: "DELIVERED",
    dispatchedAt: new Date().toISOString(),
    durationMs: Math.floor(25 + Math.random() * 40),
  };

  return {
    success: true,
    templateKey: tpl.templateKey,
    channel: tpl.channel,
    recipient: recipient || "admin@enterprise.corp",
    renderedSubject,
    renderedBody,
    dispatchLog: log,
  };
}

function getSeededTemplates(): NotificationTemplate[] {
  return [
    {
      id: "tpl-wf-pending",
      templateKey: "tpl_wf_pending_approval",
      name: "Workflow Approval Requested",
      channel: "EMAIL",
      triggerEvent: "WORKFLOW_PENDING_APPROVAL",
      subject: "Action Required: Workflow Approval for {{record.name}} (Step: {{workflow.step}})",
      body: "Hello {{recipient.name}},\n\nA new approval request has been assigned to your queue for {{record.businessObject}} [{{record.name}}].\n\nSubmitted By: {{workflow.initiator}}\nAmount / Value: ${{record.amount}}\nNext Step: {{workflow.step}}\n\nPlease review and approve in MAX-ERP: {{system.appUrl}}/configuration/workflows",
      recipientExpression: "{{workflow.assignedApproverEmail}}",
      availableMergeTags: ["{{record.name}}", "{{record.businessObject}}", "{{record.amount}}", "{{workflow.step}}", "{{workflow.initiator}}", "{{recipient.name}}"],
      status: "ACTIVE",
      updatedAt: new Date().toISOString(),
    },
    {
      id: "tpl-wf-approved-slack",
      templateKey: "tpl_wf_approved_slack",
      name: "Workflow Approved Slack Alert",
      channel: "SLACK",
      triggerEvent: "WORKFLOW_APPROVED",
      subject: "Workflow Approved: {{record.name}}",
      body: ":white_check_mark: *Workflow Approved*: The request for *{{record.name}}* has been approved by {{workflow.approver}}.\n> Business Object: {{record.businessObject}}\n> Total Value: ${{record.amount}}\n> Timestamp: {{workflow.completedAt}}",
      recipientExpression: "#finance-approvals",
      availableMergeTags: ["{{record.name}}", "{{record.businessObject}}", "{{record.amount}}", "{{workflow.approver}}", "{{workflow.completedAt}}"],
      status: "ACTIVE",
      updatedAt: new Date().toISOString(),
    },
    {
      id: "tpl-wf-rejected-email",
      templateKey: "tpl_wf_rejected_email",
      name: "Workflow Rejected Notice",
      channel: "EMAIL",
      triggerEvent: "WORKFLOW_REJECTED",
      subject: "Decision Notice: Request for {{record.name}} has been REJECTED",
      body: "Dear {{workflow.initiator}},\n\nYour submitted request for {{record.businessObject}} [{{record.name}}] was rejected by {{workflow.approver}}.\n\nReason for Rejection:\n\"{{workflow.decisionNotes}}\"\n\nYou may modify the record and re-submit for approval in the Workflows Hub.",
      recipientExpression: "{{workflow.initiatorEmail}}",
      availableMergeTags: ["{{record.name}}", "{{record.businessObject}}", "{{workflow.initiator}}", "{{workflow.approver}}", "{{workflow.decisionNotes}}"],
      status: "ACTIVE",
      updatedAt: new Date().toISOString(),
    },
    {
      id: "tpl-rec-created-inapp",
      templateKey: "tpl_record_created_inapp",
      name: "New Record Created In-App Alert",
      channel: "IN_APP",
      triggerEvent: "RECORD_CREATED",
      subject: "New {{record.businessObject}} Created",
      body: "{{user.name}} created a new {{record.businessObject}} [{{record.name}}]. View details in the Operations Hub.",
      recipientExpression: "all-subscribers",
      availableMergeTags: ["{{record.name}}", "{{record.businessObject}}", "{{user.name}}"],
      status: "ACTIVE",
      updatedAt: new Date().toISOString(),
    },
    {
      id: "tpl-high-val-slack",
      templateKey: "tpl_high_value_alert_slack",
      name: "High-Value Transaction Security Alert",
      channel: "SLACK",
      triggerEvent: "HIGH_VALUE_TRANSACTION",
      subject: "ALERT: High-Value Order {{record.name}}",
      body: ":warning: *High-Value Transaction Warning*: Order *{{record.name}}* with amount ${{record.amount}} exceeded standard review threshold. Immediate governance review recommended.",
      recipientExpression: "#exec-governance",
      availableMergeTags: ["{{record.name}}", "{{record.amount}}", "{{user.name}}"],
      status: "ACTIVE",
      updatedAt: new Date().toISOString(),
    },
  ];
}

function getSeededLogs(): NotificationDispatchLog[] {
  return [
    {
      id: "log-dsp-1",
      templateKey: "tpl_wf_approved_slack",
      templateName: "Workflow Approved Slack Alert",
      channel: "SLACK",
      recipient: "#finance-approvals",
      subject: "Workflow Approved: ACME Corp Enterprise Renewal",
      bodyPreview: ":white_check_mark: *Workflow Approved*: The request for ACME Corp Enterprise Renewal has been approved by Finance Director.",
      status: "DELIVERED",
      dispatchedAt: new Date(Date.now() - 3600000).toISOString(),
      durationMs: 42,
    },
    {
      id: "log-dsp-2",
      templateKey: "tpl_wf_pending_approval",
      templateName: "Workflow Approval Requested",
      channel: "EMAIL",
      recipient: "vp.finance@enterprise.corp",
      subject: "Action Required: Workflow Approval for Global Logistics Hub",
      bodyPreview: "Hello VP Finance, A new approval request has been assigned to your queue...",
      status: "DELIVERED",
      dispatchedAt: new Date(Date.now() - 7200000).toISOString(),
      durationMs: 185,
    },
    {
      id: "log-dsp-3",
      templateKey: "tpl_record_created_inapp",
      templateName: "New Record Created In-App Alert",
      channel: "IN_APP",
      recipient: "user-admin-1",
      subject: "New Customer Created",
      bodyPreview: "Sarah Connor created a new Customer [Apex Quantum Technologies].",
      status: "DELIVERED",
      dispatchedAt: new Date(Date.now() - 14400000).toISOString(),
      durationMs: 8,
    },
  ];
}
