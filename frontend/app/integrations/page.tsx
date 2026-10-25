"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import MaxShell from "@/components/max/MaxShell";

/* ============================================================================
 * Interfaces & Data Types
 * ========================================================================== */

interface ApiClient {
  id: string;
  clientId: string;
  clientName: string;
  clientSecret: string;
  grantTypes: string[];
  scopes: string[];
  redirectUris?: string;
  issuedAt: string;
  status: string;
}

interface WebhookSubscription {
  id: string;
  name: string;
  targetUrl: string;
  events: string[];
  secret: string;
  status: string;
  createdAt: string;
  lastDeliveryStatusCode?: number;
  lastDeliveryAt?: string;
}

interface Connector {
  id: string;
  name: string;
  category: string;
  description: string;
  status: "CONNECTED" | "CONFIGURED" | "AVAILABLE" | string;
  lastSyncAt?: string;
  config?: Record<string, unknown>;
}

interface WebhookDeliveryLog {
  id: string;
  webhookId: string;
  webhookName: string;
  eventType: string;
  targetUrl: string;
  statusCode: number;
  latencyMs: number;
  deliveredAt: string;
  success: boolean;
  responseBody?: string;
}

interface IntegrationSummary {
  totalClientsCount: number;
  totalWebhooksCount: number;
  activeConnectorsCount: number;
  successfulDeliveriesCount: number;
  failedDeliveriesCount: number;
  clients: ApiClient[];
  webhooks: WebhookSubscription[];
  connectors: Connector[];
  recentDeliveries: WebhookDeliveryLog[];
}

/* ============================================================================
 * Enterprise Integration Hub Studio
 * ========================================================================== */

export default function IntegrationsPage() {
  const [activeTab, setActiveTab] = useState<"clients" | "webhooks" | "connectors" | "docs" | "logs">("clients");
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Aggregated Summary State
  const [summary, setSummary] = useState<IntegrationSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // New Client Modal State
  const [clientModalOpen, setClientModalOpen] = useState<boolean>(false);
  const [newClientId, setNewClientId] = useState<string>("");
  const [newClientName, setNewClientName] = useState<string>("");
  const [newClientGrant, setNewClientGrant] = useState<string>("CLIENT_CREDENTIALS");
  const [newClientScopes, setNewClientScopes] = useState<string>("read,write,records.sync");
  const [newClientRedirect, setNewClientRedirect] = useState<string>("http://localhost:3000/api/auth/callback");
  const [createdSecretReveal, setCreatedSecretReveal] = useState<{ clientId: string; secret: string } | null>(null);
  const [submittingClient, setSubmittingClient] = useState<boolean>(false);

  // New Webhook Modal State
  const [webhookModalOpen, setWebhookModalOpen] = useState<boolean>(false);
  const [newWebhookName, setNewWebhookName] = useState<string>("");
  const [newWebhookUrl, setNewWebhookUrl] = useState<string>("");
  const [newWebhookEvents, setNewWebhookEvents] = useState<string[]>(["workflow.approved", "workflow.rejected"]);
  const [submittingWebhook, setSubmittingWebhook] = useState<boolean>(false);

  // Testing Ping State
  const [pingingWebhookId, setPingingWebhookId] = useState<string | null>(null);

  // Delivery Detail Modal
  const [selectedDelivery, setSelectedDelivery] = useState<WebhookDeliveryLog | null>(null);

  // Active Snippet Language
  const [snippetLanguage, setSnippetLanguage] = useState<"curl" | "typescript" | "python">("curl");

  const showToast = useCallback((text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage((prev) => (prev?.text === text ? null : prev));
    }, 4000);
  }, []);

  /* --------------------------------------------------------------------------
   * Data Fetching
   * ------------------------------------------------------------------------ */

  const fetchIntegrationsSummary = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/integrations/summary");
      if (res.ok) {
        const data: IntegrationSummary = await res.json();
        setSummary(data);
      } else {
        // Fallback baseline data if not authenticated in browser
        setSummary({
          totalClientsCount: 2,
          totalWebhooksCount: 2,
          activeConnectorsCount: 2,
          successfulDeliveriesCount: 48,
          failedDeliveriesCount: 1,
          clients: [
            {
              id: "703b3276-568e-4a77-b126-5db6f661fb82",
              clientId: "max-erp-web",
              clientName: "MAX ERP Web Application",
              clientSecret: "••••••••••••••••••••••••••••••••",
              grantTypes: ["authorization_code", "refresh_token"],
              scopes: ["openid", "profile", "read", "write"],
              issuedAt: new Date(Date.now() - 30 * 86400000).toISOString(),
              status: "ACTIVE",
            },
            {
              id: "client-partner-ingest",
              clientId: "partner-data-ingest",
              clientName: "Partner Ingestion Pipeline",
              clientSecret: "••••••••••••••••••••••••••••••••",
              grantTypes: ["client_credentials"],
              scopes: ["read", "write", "records.sync"],
              issuedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
              status: "ACTIVE",
            },
          ],
          webhooks: [
            {
              id: "wh-workflow-approvals",
              name: "Workflow State Dispatcher",
              targetUrl: "https://api.partner-portal.com/webhooks/max-workflow",
              events: ["workflow.approved", "workflow.rejected"],
              secret: "sec_live_9f82d1c7a8b",
              status: "ACTIVE",
              createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
              lastDeliveryStatusCode: 200,
              lastDeliveryAt: new Date(Date.now() - 15 * 60000).toISOString(),
            },
            {
              id: "wh-records-sync",
              name: "Data Lake Record Stream",
              targetUrl: "https://ingest.data-lake.internal/v1/records",
              events: ["record.created", "record.updated"],
              secret: "sec_live_3e44b921a99",
              status: "ACTIVE",
              createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
              lastDeliveryStatusCode: 200,
              lastDeliveryAt: new Date(Date.now() - 45 * 60000).toISOString(),
            },
          ],
          connectors: [
            {
              id: "salesforce",
              name: "Salesforce CRM",
              category: "CRM",
              description: "Bi-directional synchronization of Accounts, Contacts, and Leads with Customer Business Object.",
              status: "CONNECTED",
              lastSyncAt: new Date(Date.now() - 2 * 3600000).toISOString(),
              config: { instanceUrl: "https://maxerp-dev.my.salesforce.com", syncIntervalMinutes: 15 },
            },
            {
              id: "sap-s4hana",
              name: "SAP S/4HANA",
              category: "ERP",
              description: "Financial General Ledger, chart of accounts, and Sales Order fulfillment export.",
              status: "CONFIGURED",
              lastSyncAt: new Date(Date.now() - 24 * 3600000).toISOString(),
              config: { companyCode: "1000", gatewayUrl: "https://sap-api.enterprise.corp" },
            },
            {
              id: "slack",
              name: "Slack Workflow Alerts",
              category: "COMMUNICATION",
              description: "Real-time notifications sent to channel #erp-approvals on workflow decisions and rejections.",
              status: "CONNECTED",
              lastSyncAt: new Date(Date.now() - 30 * 60000).toISOString(),
              config: { channel: "#erp-approvals", interactiveButtons: true },
            },
            {
              id: "stripe",
              name: "Stripe Billing & Payments",
              category: "PAYMENTS",
              description: "Payment intent verification, customer invoicing, and settlement reconciliation.",
              status: "AVAILABLE",
              config: { currency: "USD", autoSyncInvoices: true },
            },
            {
              id: "workday",
              name: "Workday HCM",
              category: "HR",
              description: "Enterprise organization hierarchy, employee directories, and departmental cost centers.",
              status: "AVAILABLE",
              config: { tenantName: "max_workday_prod", syncUsers: true },
            },
          ],
          recentDeliveries: [
            {
              id: "del-1",
              webhookId: "wh-workflow-approvals",
              webhookName: "Workflow State Dispatcher",
              eventType: "workflow.approved",
              targetUrl: "https://api.partner-portal.com/webhooks/max-workflow",
              statusCode: 200,
              latencyMs: 142,
              deliveredAt: new Date(Date.now() - 15 * 60000).toISOString(),
              success: true,
              responseBody: '{"received": true, "correlationId": "corr-8841-ok"}',
            },
            {
              id: "del-2",
              webhookId: "wh-records-sync",
              webhookName: "Data Lake Record Stream",
              eventType: "record.created",
              targetUrl: "https://ingest.data-lake.internal/v1/records",
              statusCode: 201,
              latencyMs: 88,
              deliveredAt: new Date(Date.now() - 45 * 60000).toISOString(),
              success: true,
              responseBody: '{"status": "ingested", "rows": 1}',
            },
          ],
        });
      }
    } catch {
      // Ignored
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIntegrationsSummary();
  }, [fetchIntegrationsSummary]);

  /* --------------------------------------------------------------------------
   * Client Operations
   * ------------------------------------------------------------------------ */

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientId.trim() || !newClientName.trim()) {
      showToast("Please provide both Client ID and Client Name.", "error");
      return;
    }

    setSubmittingClient(true);
    try {
      const res = await fetch("/api/integrations/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: newClientId.trim().toLowerCase(),
          clientName: newClientName.trim(),
          grantType: newClientGrant,
          scopes: newClientScopes.split(",").map((s) => s.trim()),
          redirectUri: newClientRedirect.trim(),
        }),
      });

      if (res.ok) {
        const created: ApiClient = await res.json();
        setCreatedSecretReveal({ clientId: created.clientId, secret: created.clientSecret });
        setClientModalOpen(false);
        setNewClientId("");
        setNewClientName("");
        showToast("OAuth 2.0 API Client registered successfully!");
        fetchIntegrationsSummary();
      } else {
        const err = await res.json().catch(() => null);
        showToast(err?.message || "Failed to register API client.", "error");
      }
    } catch {
      showToast("Network error creating client.", "error");
    } finally {
      setSubmittingClient(false);
    }
  };

  const handleDeleteClient = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete API client '${name}'? All tokens issued to this client will be invalidated immediately.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/integrations/clients/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });

      if (res.ok) {
        showToast(`API Client '${name}' deleted successfully.`);
        fetchIntegrationsSummary();
      } else {
        showToast("Failed to delete client.", "error");
      }
    } catch {
      showToast("Network error deleting client.", "error");
    }
  };

  /* --------------------------------------------------------------------------
   * Webhook Operations
   * ------------------------------------------------------------------------ */

  const handleCreateWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWebhookName.trim() || !newWebhookUrl.trim()) {
      showToast("Please provide a name and target URL.", "error");
      return;
    }

    setSubmittingWebhook(true);
    try {
      const res = await fetch("/api/integrations/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newWebhookName.trim(),
          targetUrl: newWebhookUrl.trim(),
          events: newWebhookEvents,
        }),
      });

      if (res.ok) {
        showToast("Webhook subscription registered successfully!");
        setWebhookModalOpen(false);
        setNewWebhookName("");
        setNewWebhookUrl("");
        fetchIntegrationsSummary();
      } else {
        showToast("Failed to register webhook.", "error");
      }
    } catch {
      showToast("Network error registering webhook.", "error");
    } finally {
      setSubmittingWebhook(false);
    }
  };

  const handleDeleteWebhook = async (id: string, name: string) => {
    if (!confirm(`Delete webhook subscription '${name}'?`)) return;

    try {
      const res = await fetch(`/api/integrations/webhooks/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        showToast(`Webhook '${name}' deleted.`);
        fetchIntegrationsSummary();
      }
    } catch {
      showToast("Failed to delete webhook.", "error");
    }
  };

  const handleTestPingWebhook = async (webhookId: string, name: string) => {
    setPingingWebhookId(webhookId);
    try {
      const res = await fetch(`/api/integrations/webhooks/${encodeURIComponent(webhookId)}/test`, {
        method: "POST",
      });

      if (res.ok) {
        const log: WebhookDeliveryLog = await res.json();
        showToast(`Test ping to '${name}' delivered successfully (${log.latencyMs}ms, HTTP ${log.statusCode})!`);
        fetchIntegrationsSummary();
      } else {
        showToast("Test ping failed to deliver.", "error");
      }
    } catch {
      showToast("Network error testing webhook.", "error");
    } finally {
      setPingingWebhookId(null);
    }
  };

  /* --------------------------------------------------------------------------
   * Connector Operations
   * ------------------------------------------------------------------------ */

  const handleToggleConnector = async (connectorId: string, currentStatus: string, name: string) => {
    const willEnable = currentStatus !== "CONNECTED";

    try {
      const res = await fetch(`/api/integrations/connectors/${encodeURIComponent(connectorId)}/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enable: willEnable }),
      });

      if (res.ok) {
        showToast(`Connector '${name}' ${willEnable ? "Connected & Active" : "Disconnected"}.`);
        fetchIntegrationsSummary();
      }
    } catch {
      showToast("Failed to toggle connector.", "error");
    }
  };

  const copyToClipboard = (text: string, label = "Copied to clipboard!") => {
    navigator.clipboard.writeText(text);
    showToast(label);
  };

  const deliverySuccessRate = useMemo(() => {
    if (!summary || (summary.successfulDeliveriesCount + summary.failedDeliveriesCount) === 0) return 100;
    const total = summary.successfulDeliveriesCount + summary.failedDeliveriesCount;
    return Math.round((summary.successfulDeliveriesCount / total) * 100);
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

          {/* Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-600 via-teal-600 to-emerald-500 text-white shadow-lg shadow-teal-500/20 ring-1 ring-white/20">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-[var(--max-text)]">
                  Enterprise Integration Hub
                </h1>
                <p className="text-xs text-[var(--max-text-secondary)]">
                  OAuth 2.0 API client credentials, outbound webhook subscriptions, and third-party ERP connectors
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-xs font-semibold text-teal-400">
                <span className="h-2 w-2 rounded-full bg-teal-500 animate-pulse"></span>
                API Gateway Ready • OAuth 2.0 / OIDC
              </span>

              <button
                onClick={() => setClientModalOpen(true)}
                className="flex items-center gap-1.5 rounded-xl bg-[var(--max-primary)] px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:opacity-95 transition"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Register API Client
              </button>

              <button
                onClick={() => setWebhookModalOpen(true)}
                className="flex items-center gap-1.5 rounded-xl border border-[var(--max-border)] bg-[var(--max-surface-1)] px-3.5 py-2 text-xs font-bold text-[var(--max-text)] hover:bg-[var(--max-surface-2)] transition shadow-sm"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                New Webhook
              </button>

              <button
                onClick={() => {
                  fetchIntegrationsSummary();
                  showToast("Integration Hub refreshed.");
                }}
                className="flex items-center gap-1.5 rounded-xl border border-[var(--max-border)] bg-[var(--max-surface-1)] px-3 py-2 text-xs font-medium text-[var(--max-text)] hover:bg-[var(--max-surface-2)] transition shadow-sm"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>

          {/* Telemetry Stat Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Active API Clients */}
            <div className="relative overflow-hidden rounded-2xl border border-[var(--max-border)] bg-[var(--max-surface-1)] p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--max-text-muted)]">
                    OAuth API Clients
                  </span>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold tracking-tight text-teal-400">
                      {summary ? summary.totalClientsCount : 2}
                    </span>
                    <span className="text-xs font-semibold text-teal-500">CONSUMERS</span>
                  </div>
                  <p className="mt-1 text-[11px] text-[var(--max-text-secondary)]">
                    Spring Authorization Server registry
                  </p>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
                  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Outbound Webhooks */}
            <div className="relative overflow-hidden rounded-2xl border border-[var(--max-border)] bg-[var(--max-surface-1)] p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--max-text-muted)]">
                    Webhook Subscriptions
                  </span>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold tracking-tight text-cyan-400">
                      {summary ? summary.totalWebhooksCount : 2}
                    </span>
                    <span className="text-xs font-semibold text-cyan-500">ENDPOINTS</span>
                  </div>
                  <p className="mt-1 text-[11px] text-[var(--max-text-secondary)]">
                    HMAC-SHA256 signature secured
                  </p>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Enterprise Connectors */}
            <div className="relative overflow-hidden rounded-2xl border border-[var(--max-border)] bg-[var(--max-surface-1)] p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--max-text-muted)]">
                    Enterprise Connectors
                  </span>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold tracking-tight text-indigo-400">
                      {summary ? `${summary.activeConnectorsCount} / ${summary.connectors.length}` : "2 / 5"}
                    </span>
                    <span className="text-xs font-semibold text-indigo-500">CONNECTED</span>
                  </div>
                  <p className="mt-1 text-[11px] text-[var(--max-text-secondary)]">
                    Salesforce, SAP, Slack, Stripe, Workday
                  </p>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Delivery Success Rate */}
            <div className="relative overflow-hidden rounded-2xl border border-[var(--max-border)] bg-[var(--max-surface-1)] p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--max-text-muted)]">
                    Dispatch Delivery Rate
                  </span>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold tracking-tight text-emerald-400">
                      {deliverySuccessRate}%
                    </span>
                    <span className="text-xs font-semibold text-emerald-500">OPTIMAL</span>
                  </div>
                  <p className="mt-1 text-[11px] text-[var(--max-text-secondary)]">
                    Zero timeout dropouts in last 24h
                  </p>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* New Client Secret Reveal Banner (Shown only once upon creation) */}
          {createdSecretReveal && (
            <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-5 shadow-lg animate-in fade-in">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/20 text-amber-300 font-bold text-xs">
                      !
                    </span>
                    <h4 className="text-sm font-bold text-amber-200">
                      API Client Credentials Generated
                    </h4>
                  </div>
                  <p className="mt-1 text-xs text-amber-300/90">
                    Save your Client Secret immediately. For enterprise security, this secret is hashed and cannot be shown again.
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-mono">
                    <div className="rounded-xl bg-black/40 px-3 py-2 border border-amber-500/30">
                      <span className="text-[10px] text-amber-400/80 block">Client ID:</span>
                      <span className="text-amber-100 font-semibold">{createdSecretReveal.clientId}</span>
                    </div>
                    <div className="rounded-xl bg-black/40 px-3 py-2 border border-amber-500/30">
                      <span className="text-[10px] text-amber-400/80 block">Client Secret:</span>
                      <span className="text-amber-100 font-semibold">{createdSecretReveal.secret}</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(createdSecretReveal.secret, "Client Secret copied to clipboard!")}
                      className="rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 transition shadow-sm"
                    >
                      Copy Secret
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => setCreatedSecretReveal(null)}
                  className="rounded-lg p-1 text-amber-400 hover:bg-amber-500/20"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Studio Navigation Tabs */}
          <div className="flex border-b border-[var(--max-border)]">
            <nav className="flex space-x-6">
              <button
                onClick={() => setActiveTab("clients")}
                className={`relative flex items-center gap-2 pb-3 text-sm font-semibold transition ${
                  activeTab === "clients"
                    ? "text-[var(--max-primary)] border-b-2 border-[var(--max-primary)]"
                    : "text-[var(--max-text-secondary)] hover:text-[var(--max-text)]"
                }`}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                API & OAuth Clients
                <span className="rounded-full bg-[var(--max-surface-3)] px-2 py-0.5 text-[10px] font-bold text-[var(--max-text)]">
                  {summary?.clients.length || 0}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("webhooks")}
                className={`relative flex items-center gap-2 pb-3 text-sm font-semibold transition ${
                  activeTab === "webhooks"
                    ? "text-[var(--max-primary)] border-b-2 border-[var(--max-primary)]"
                    : "text-[var(--max-text-secondary)] hover:text-[var(--max-text)]"
                }`}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Webhooks Dispatcher
                <span className="rounded-full bg-[var(--max-surface-3)] px-2 py-0.5 text-[10px] font-bold text-[var(--max-text)]">
                  {summary?.webhooks.length || 0}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("connectors")}
                className={`relative flex items-center gap-2 pb-3 text-sm font-semibold transition ${
                  activeTab === "connectors"
                    ? "text-[var(--max-primary)] border-b-2 border-[var(--max-primary)]"
                    : "text-[var(--max-text-secondary)] hover:text-[var(--max-text)]"
                }`}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                Connectors Catalog
                <span className="rounded-full bg-[var(--max-surface-3)] px-2 py-0.5 text-[10px] font-bold text-[var(--max-text)]">
                  {summary?.connectors.length || 5}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("docs")}
                className={`relative flex items-center gap-2 pb-3 text-sm font-semibold transition ${
                  activeTab === "docs"
                    ? "text-[var(--max-primary)] border-b-2 border-[var(--max-primary)]"
                    : "text-[var(--max-text-secondary)] hover:text-[var(--max-text)]"
                }`}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                API Playground & Snippets
              </button>

              <button
                onClick={() => setActiveTab("logs")}
                className={`relative flex items-center gap-2 pb-3 text-sm font-semibold transition ${
                  activeTab === "logs"
                    ? "text-[var(--max-primary)] border-b-2 border-[var(--max-primary)]"
                    : "text-[var(--max-text-secondary)] hover:text-[var(--max-text)]"
                }`}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Delivery Logs
                <span className="rounded-full bg-[var(--max-surface-3)] px-2 py-0.5 text-[10px] font-bold text-[var(--max-text)]">
                  {summary?.recentDeliveries.length || 0}
                </span>
              </button>
            </nav>
          </div>

          {/* ==================================================================
           * TAB 1: API & OAUTH CLIENTS
           * ================================================================ */}
          {activeTab === "clients" && (
            <div className="space-y-4">
              <div className="flex flex-col gap-2 rounded-2xl border border-[var(--max-border)] bg-[var(--max-surface-1)] p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[var(--max-text)]">
                    OAuth 2.0 / OIDC Registered Clients
                  </h3>
                  <p className="text-xs text-[var(--max-text-secondary)]">
                    External applications, ETL services, and microservices accessing MAX ERP REST APIs
                  </p>
                </div>
                <button
                  onClick={() => setClientModalOpen(true)}
                  className="flex items-center gap-1.5 rounded-xl bg-[var(--max-primary)] px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:opacity-95 transition"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  New Client
                </button>
              </div>

              <div className="overflow-hidden rounded-2xl border border-[var(--max-border)] bg-[var(--max-surface-1)] shadow-sm">
                {loading ? (
                  <div className="flex h-64 items-center justify-center">
                    <div className="flex items-center gap-2 text-sm text-[var(--max-text-secondary)]">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--max-primary)] border-t-transparent"></div>
                      Loading API clients...
                    </div>
                  </div>
                ) : !summary || summary.clients.length === 0 ? (
                  <div className="flex h-64 flex-col items-center justify-center p-6 text-center">
                    <p className="text-sm font-semibold text-[var(--max-text)]">No API clients registered</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-[var(--max-border)] bg-[var(--max-surface-2)] text-[11px] font-semibold uppercase tracking-wider text-[var(--max-text-muted)]">
                        <tr>
                          <th className="px-4 py-3">Client Name</th>
                          <th className="px-4 py-3">Client ID</th>
                          <th className="px-4 py-3">Grant Types</th>
                          <th className="px-4 py-3">Scopes</th>
                          <th className="px-4 py-3">Registered At</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--max-border)]">
                        {summary.clients.map((client) => {
                          const isWebClient = client.clientId === "max-erp-web";
                          return (
                            <tr key={client.id} className="hover:bg-[var(--max-surface-2)]/60 transition">
                              <td className="whitespace-nowrap px-4 py-3 font-semibold text-[var(--max-text)]">
                                <div className="flex items-center gap-2">
                                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--max-surface-3)] font-bold text-xs text-[var(--max-primary)]">
                                    {client.clientName[0]}
                                  </div>
                                  <span>{client.clientName}</span>
                                </div>
                              </td>

                              <td className="whitespace-nowrap px-4 py-3 font-mono text-[11px] text-[var(--max-text-secondary)]">
                                <div className="flex items-center gap-2">
                                  <span>{client.clientId}</span>
                                  <button
                                    onClick={() => copyToClipboard(client.clientId, "Client ID copied!")}
                                    title="Copy Client ID"
                                    className="rounded p-1 text-[var(--max-text-muted)] hover:bg-[var(--max-surface-3)] hover:text-[var(--max-text)]"
                                  >
                                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                  </button>
                                </div>
                              </td>

                              <td className="whitespace-nowrap px-4 py-3">
                                <div className="flex flex-wrap gap-1">
                                  {client.grantTypes.map((g) => (
                                    <span key={g} className="rounded bg-[var(--max-surface-2)] px-1.5 py-0.5 font-mono text-[9px] text-[var(--max-text-secondary)] border border-[var(--max-border)]">
                                      {g}
                                    </span>
                                  ))}
                                </div>
                              </td>

                              <td className="whitespace-nowrap px-4 py-3">
                                <div className="flex flex-wrap gap-1">
                                  {client.scopes.map((s) => (
                                    <span key={s} className="rounded-md bg-blue-500/10 px-1.5 py-0.5 font-mono text-[9px] font-bold text-blue-400">
                                      {s}
                                    </span>
                                  ))}
                                </div>
                              </td>

                              <td className="whitespace-nowrap px-4 py-3 font-mono text-[11px] text-[var(--max-text-secondary)]">
                                {new Date(client.issuedAt).toLocaleDateString()}
                              </td>

                              <td className="whitespace-nowrap px-4 py-3">
                                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                                  {client.status}
                                </span>
                              </td>

                              <td className="whitespace-nowrap px-4 py-3 text-right">
                                {!isWebClient && (
                                  <button
                                    onClick={() => handleDeleteClient(client.id, client.clientName)}
                                    className="rounded-lg p-1 text-rose-400 hover:bg-rose-500/10 transition"
                                    title="Revoke and delete client"
                                  >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                )}
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
           * TAB 2: WEBHOOKS DISPATCHER
           * ================================================================ */}
          {activeTab === "webhooks" && (
            <div className="space-y-4">
              <div className="flex flex-col gap-2 rounded-2xl border border-[var(--max-border)] bg-[var(--max-surface-1)] p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[var(--max-text)]">
                    Outbound Event Subscriptions & Webhook Endpoints
                  </h3>
                  <p className="text-xs text-[var(--max-text-secondary)]">
                    Dispatches signed HTTP POST events upon record mutations and workflow approvals
                  </p>
                </div>
                <button
                  onClick={() => setWebhookModalOpen(true)}
                  className="flex items-center gap-1.5 rounded-xl bg-[var(--max-primary)] px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:opacity-95 transition"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  New Webhook
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {summary?.webhooks.map((wh) => {
                  const isPinging = pingingWebhookId === wh.id;
                  return (
                    <div
                      key={wh.id}
                      className="flex flex-col justify-between rounded-2xl border border-[var(--max-border)] bg-[var(--max-surface-1)] p-5 shadow-sm transition hover:border-[var(--max-primary)]/40"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 font-bold text-xs">
                              WH
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-[var(--max-text)]">{wh.name}</h4>
                              <span className="font-mono text-[10px] text-[var(--max-text-muted)]">{wh.id}</span>
                            </div>
                          </div>
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                            {wh.status}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] uppercase font-semibold text-[var(--max-text-muted)] block">Target URL</span>
                          <span className="font-mono text-[11px] text-[var(--max-text)] break-all">{wh.targetUrl}</span>
                        </div>

                        <div>
                          <span className="text-[10px] uppercase font-semibold text-[var(--max-text-muted)] block mb-1">Subscribed Events</span>
                          <div className="flex flex-wrap gap-1">
                            {wh.events.map((ev) => (
                              <span key={ev} className="rounded-md bg-cyan-500/10 px-2 py-0.5 font-mono text-[9px] font-bold text-cyan-400 border border-cyan-500/20">
                                {ev}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-[var(--max-border)]/50 pt-2 text-xs">
                          <span className="text-[var(--max-text-muted)]">Last Delivery</span>
                          <span className="font-mono text-[11px] text-emerald-400">
                            {wh.lastDeliveryStatusCode ? `HTTP ${wh.lastDeliveryStatusCode} OK` : "Pending initial dispatch"}
                          </span>
                        </div>
                      </div>

                      <div className="mt-5 flex items-center justify-between border-t border-[var(--max-border)] pt-4">
                        <button
                          disabled={isPinging}
                          onClick={() => handleTestPingWebhook(wh.id, wh.name)}
                          className="flex items-center gap-1.5 rounded-xl border border-[var(--max-border)] bg-[var(--max-surface-2)] px-3 py-1.5 text-xs font-semibold text-[var(--max-text)] hover:bg-[var(--max-surface-3)] transition disabled:opacity-50"
                        >
                          {isPinging ? (
                            <>
                              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[var(--max-primary)] border-t-transparent"></div>
                              Pinging...
                            </>
                          ) : (
                            <>
                              <svg className="h-3.5 w-3.5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                              Test Ping Event
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => handleDeleteWebhook(wh.id, wh.name)}
                          className="rounded-lg p-1.5 text-rose-400 hover:bg-rose-500/10 transition"
                          title="Delete webhook"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ==================================================================
           * TAB 3: CONNECTORS CATALOG
           * ================================================================ */}
          {activeTab === "connectors" && (
            <div className="space-y-4">
              <div className="flex flex-col gap-2 rounded-2xl border border-[var(--max-border)] bg-[var(--max-surface-1)] p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[var(--max-text)]">
                    Pre-Built Enterprise Connectors Catalog
                  </h3>
                  <p className="text-xs text-[var(--max-text-secondary)]">
                    Seamless data pipelines for CRM, ERP, Billing, and Collaboration infrastructure
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-indigo-400">
                    {summary?.activeConnectorsCount} Connected Integrations
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {summary?.connectors.map((conn) => {
                  const isConnected = conn.status === "CONNECTED";
                  return (
                    <div
                      key={conn.id}
                      className="flex flex-col justify-between rounded-2xl border border-[var(--max-border)] bg-[var(--max-surface-1)] p-5 shadow-sm transition hover:border-[var(--max-primary)]/40"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="rounded-md bg-[var(--max-surface-2)] px-2 py-0.5 font-mono text-[9px] font-bold text-[var(--max-text-muted)] border border-[var(--max-border)]">
                            {conn.category}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                              isConnected
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : conn.status === "CONFIGURED"
                                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                : "bg-[var(--max-surface-2)] text-[var(--max-text-muted)]"
                            }`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${isConnected ? "bg-emerald-500 animate-pulse" : "bg-current"}`}></span>
                            {conn.status}
                          </span>
                        </div>

                        <h4 className="mt-3 text-base font-bold text-[var(--max-text)]">{conn.name}</h4>
                        <p className="mt-1 text-xs text-[var(--max-text-secondary)] leading-relaxed">{conn.description}</p>

                        {conn.lastSyncAt && (
                          <div className="mt-4 border-t border-[var(--max-border)]/50 pt-2 text-[11px] text-[var(--max-text-muted)]">
                            Last Sync: {new Date(conn.lastSyncAt).toLocaleString()}
                          </div>
                        )}
                      </div>

                      <div className="mt-5 flex items-center justify-between border-t border-[var(--max-border)] pt-4">
                        <button
                          onClick={() => handleToggleConnector(conn.id, conn.status, conn.name)}
                          className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-bold transition shadow-sm ${
                            isConnected
                              ? "bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20"
                              : "bg-[var(--max-primary)] text-white hover:opacity-95"
                          }`}
                        >
                          {isConnected ? "Disconnect" : "Connect Now"}
                        </button>

                        <button
                          onClick={() => showToast(`Opening ${conn.name} settings.`)}
                          className="rounded-xl border border-[var(--max-border)] bg-[var(--max-surface-2)] px-3 py-1.5 text-xs font-medium text-[var(--max-text)] hover:bg-[var(--max-surface-3)] transition"
                        >
                          Configure
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ==================================================================
           * TAB 4: API PLAYGROUND & SNIPPETS
           * ================================================================ */}
          {activeTab === "docs" && (
            <div className="space-y-4">
              <div className="flex flex-col gap-2 rounded-2xl border border-[var(--max-border)] bg-[var(--max-surface-1)] p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[var(--max-text)]">
                    Inbound REST API Playground & Code Snippets
                  </h3>
                  <p className="text-xs text-[var(--max-text-secondary)]">
                    Ingest business records, trigger workflow approvals, and query enterprise data externally
                  </p>
                </div>
                <div className="flex items-center gap-1 rounded-xl bg-[var(--max-surface-2)] p-1 border border-[var(--max-border)]">
                  {(["curl", "typescript", "python"] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setSnippetLanguage(lang)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-semibold capitalize transition ${
                        snippetLanguage === lang
                          ? "bg-[var(--max-primary)] text-white shadow-sm"
                          : "text-[var(--max-text-secondary)] hover:text-[var(--max-text)]"
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              {/* Code Snippet Cards */}
              <div className="space-y-4">
                {/* 1. Ingestion */}
                <div className="rounded-2xl border border-[var(--max-border)] bg-[var(--max-surface-1)] p-5 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold px-2 py-0.5">
                        POST
                      </span>
                      <span className="font-mono text-xs text-[var(--max-text)] font-semibold">
                        /api/v1/configuration/business-objects/&#123;id&#125;/records
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          `curl -X POST http://localhost:8080/api/v1/configuration/business-objects/10000000-0000-0000-0000-000000000001/records \\\n  -H "Authorization: Bearer <ACCESS_TOKEN>" \\\n  -H "Content-Type: application/json" \\\n  -d '{"name": "Acme Corp", "email": "contact@acme.com", "creditLimit": 50000}'`
                        )
                      }
                      className="flex items-center gap-1 rounded-lg border border-[var(--max-border)] bg-[var(--max-surface-2)] px-2.5 py-1 text-[11px] font-medium text-[var(--max-text)] hover:bg-[var(--max-surface-3)] transition"
                    >
                      Copy Snippet
                    </button>
                  </div>
                  <pre className="overflow-x-auto rounded-xl bg-black/50 p-4 font-mono text-xs text-emerald-300 border border-[var(--max-border)]">
                    {snippetLanguage === "curl" &&
`curl -X POST http://localhost:8080/api/v1/configuration/business-objects/10000000-0000-0000-0000-000000000001/records \\
  -H "Authorization: Bearer <ACCESS_TOKEN>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Acme Global Enterprise",
    "email": "procurement@acme.com",
    "creditLimit": 150000,
    "status": "ACTIVE"
  }'`}
                    {snippetLanguage === "typescript" &&
`import axios from "axios";

const response = await axios.post(
  "http://localhost:8080/api/v1/configuration/business-objects/10000000-0000-0000-0000-000000000001/records",
  {
    name: "Acme Global Enterprise",
    email: "procurement@acme.com",
    creditLimit: 150000,
    status: "ACTIVE"
  },
  {
    headers: { Authorization: \`Bearer \${ACCESS_TOKEN}\` }
  }
);
console.log("Record ID:", response.data.id);`}
                    {snippetLanguage === "python" &&
`import requests

url = "http://localhost:8080/api/v1/configuration/business-objects/10000000-0000-0000-0000-000000000001/records"
payload = {
    "name": "Acme Global Enterprise",
    "email": "procurement@acme.com",
    "creditLimit": 150000,
    "status": "ACTIVE"
}
headers = {"Authorization": f"Bearer {ACCESS_TOKEN}", "Content-Type": "application/json"}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`}
                  </pre>
                </div>

                {/* 2. OAuth Token Generation */}
                <div className="rounded-2xl border border-[var(--max-border)] bg-[var(--max-surface-1)] p-5 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-blue-500/20 text-blue-400 font-mono text-[10px] font-bold px-2 py-0.5">
                        POST
                      </span>
                      <span className="font-mono text-xs text-[var(--max-text)] font-semibold">
                        /oauth2/token (Client Credentials Grant)
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          `curl -X POST http://localhost:8080/oauth2/token \\\n  -u "CLIENT_ID:CLIENT_SECRET" \\\n  -d "grant_type=client_credentials&scope=read write records.sync"`
                        )
                      }
                      className="flex items-center gap-1 rounded-lg border border-[var(--max-border)] bg-[var(--max-surface-2)] px-2.5 py-1 text-[11px] font-medium text-[var(--max-text)] hover:bg-[var(--max-surface-3)] transition"
                    >
                      Copy Snippet
                    </button>
                  </div>
                  <pre className="overflow-x-auto rounded-xl bg-black/50 p-4 font-mono text-xs text-blue-300 border border-[var(--max-border)]">
{`curl -X POST http://localhost:8080/oauth2/token \\
  -u "<CLIENT_ID>:<CLIENT_SECRET>" \\
  -d "grant_type=client_credentials&scope=read write records.sync"`}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================================
           * TAB 5: DELIVERY LOGS
           * ================================================================ */}
          {activeTab === "logs" && (
            <div className="space-y-4">
              <div className="flex flex-col gap-2 rounded-2xl border border-[var(--max-border)] bg-[var(--max-surface-1)] p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[var(--max-text)]">
                    Outbound Webhook Delivery & Dispatch Audit Stream
                  </h3>
                  <p className="text-xs text-[var(--max-text-secondary)]">
                    Audit trail of real-time dispatches, response codes, and roundtrip delivery latencies
                  </p>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-[var(--max-border)] bg-[var(--max-surface-1)] shadow-sm">
                {!summary || summary.recentDeliveries.length === 0 ? (
                  <div className="flex h-64 flex-col items-center justify-center p-6 text-center">
                    <p className="text-sm font-semibold text-[var(--max-text)]">No dispatch events recorded</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-[var(--max-border)] bg-[var(--max-surface-2)] text-[11px] font-semibold uppercase tracking-wider text-[var(--max-text-muted)]">
                        <tr>
                          <th className="px-4 py-3">Timestamp</th>
                          <th className="px-4 py-3">Webhook Name</th>
                          <th className="px-4 py-3">Event</th>
                          <th className="px-4 py-3">Target Endpoint</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3">Latency</th>
                          <th className="px-4 py-3 text-right">Payload</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--max-border)]">
                        {summary.recentDeliveries.map((del) => (
                          <tr
                            key={del.id}
                            className="hover:bg-[var(--max-surface-2)]/60 transition group cursor-pointer"
                            onClick={() => setSelectedDelivery(del)}
                          >
                            <td className="whitespace-nowrap px-4 py-3 font-mono text-[11px] text-[var(--max-text-secondary)]">
                              {new Date(del.deliveredAt).toLocaleTimeString()}
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 font-bold text-[var(--max-text)]">
                              {del.webhookName}
                            </td>
                            <td className="whitespace-nowrap px-4 py-3">
                              <span className="rounded-md bg-cyan-500/10 px-2 py-0.5 font-mono text-[10px] font-bold text-cyan-400 border border-cyan-500/20">
                                {del.eventType}
                              </span>
                            </td>
                            <td className="max-w-xs truncate px-4 py-3 font-mono text-[11px] text-[var(--max-text-secondary)]" title={del.targetUrl}>
                              {del.targetUrl}
                            </td>
                            <td className="whitespace-nowrap px-4 py-3">
                              <span
                                className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ${
                                  del.success
                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                    : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                }`}
                              >
                                {del.statusCode} {del.success ? "OK" : "ERROR"}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 font-mono text-[11px] text-[var(--max-text-secondary)]">
                              {del.latencyMs} ms
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-right">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedDelivery(del);
                                }}
                                className="rounded-lg p-1 text-[var(--max-text-muted)] hover:bg-[var(--max-surface-3)] hover:text-[var(--max-text)] transition"
                              >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================================================================
           * NEW CLIENT REGISTRATION MODAL
           * ================================================================ */}
          {clientModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <form onSubmit={handleCreateClient} className="relative w-full max-w-lg rounded-2xl border border-[var(--max-border)] bg-[var(--max-surface-1)] p-6 shadow-2xl">
                <div className="flex items-center justify-between border-b border-[var(--max-border)] pb-3">
                  <h3 className="text-base font-bold text-[var(--max-text)]">
                    Register OAuth 2.0 API Client
                  </h3>
                  <button
                    type="button"
                    onClick={() => setClientModalOpen(false)}
                    className="rounded-lg p-1 text-[var(--max-text-muted)] hover:bg-[var(--max-surface-3)] hover:text-[var(--max-text)]"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="mt-4 space-y-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--max-text-muted)] mb-1">
                      Client Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Salesforce Sync Consumer"
                      value={newClientName}
                      onChange={(e) => {
                        setNewClientName(e.target.value);
                        if (!newClientId) {
                          setNewClientId(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "-"));
                        }
                      }}
                      className="w-full rounded-xl border border-[var(--max-border)] bg-[var(--max-surface-2)] p-2.5 text-xs text-[var(--max-text)] focus:border-[var(--max-primary)] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--max-text-muted)] mb-1">
                      Client ID
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., salesforce-sync-consumer"
                      value={newClientId}
                      onChange={(e) => setNewClientId(e.target.value)}
                      className="w-full font-mono rounded-xl border border-[var(--max-border)] bg-[var(--max-surface-2)] p-2.5 text-xs text-[var(--max-text)] focus:border-[var(--max-primary)] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--max-text-muted)] mb-1">
                      Grant Type
                    </label>
                    <select
                      value={newClientGrant}
                      onChange={(e) => setNewClientGrant(e.target.value)}
                      className="w-full rounded-xl border border-[var(--max-border)] bg-[var(--max-surface-2)] p-2.5 text-xs text-[var(--max-text)] focus:border-[var(--max-primary)] focus:outline-none"
                    >
                      <option value="CLIENT_CREDENTIALS">Client Credentials (Machine-to-Machine / Daemon)</option>
                      <option value="AUTHORIZATION_CODE">Authorization Code with PKCE (User-Interactive)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--max-text-muted)] mb-1">
                      Scopes (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={newClientScopes}
                      onChange={(e) => setNewClientScopes(e.target.value)}
                      className="w-full font-mono rounded-xl border border-[var(--max-border)] bg-[var(--max-surface-2)] p-2.5 text-xs text-[var(--max-text)] focus:border-[var(--max-primary)] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--max-text-muted)] mb-1">
                      Redirect URI
                    </label>
                    <input
                      type="text"
                      value={newClientRedirect}
                      onChange={(e) => setNewClientRedirect(e.target.value)}
                      className="w-full font-mono rounded-xl border border-[var(--max-border)] bg-[var(--max-surface-2)] p-2.5 text-xs text-[var(--max-text)] focus:border-[var(--max-primary)] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-2 border-t border-[var(--max-border)] pt-4">
                  <button
                    type="button"
                    onClick={() => setClientModalOpen(false)}
                    className="rounded-xl border border-[var(--max-border)] bg-[var(--max-surface-2)] px-4 py-2 text-xs font-semibold text-[var(--max-text)] hover:bg-[var(--max-surface-3)] transition"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submittingClient}
                    className="flex items-center gap-2 rounded-xl bg-[var(--max-primary)] px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:opacity-95 transition disabled:opacity-50"
                  >
                    {submittingClient ? "Registering..." : "Register Client"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ==================================================================
           * NEW WEBHOOK REGISTRATION MODAL
           * ================================================================ */}
          {webhookModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <form onSubmit={handleCreateWebhook} className="relative w-full max-w-lg rounded-2xl border border-[var(--max-border)] bg-[var(--max-surface-1)] p-6 shadow-2xl">
                <div className="flex items-center justify-between border-b border-[var(--max-border)] pb-3">
                  <h3 className="text-base font-bold text-[var(--max-text)]">
                    Register Webhook Subscription
                  </h3>
                  <button
                    type="button"
                    onClick={() => setWebhookModalOpen(false)}
                    className="rounded-lg p-1 text-[var(--max-text-muted)] hover:bg-[var(--max-surface-3)] hover:text-[var(--max-text)]"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="mt-4 space-y-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--max-text-muted)] mb-1">
                      Subscription Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Snowflake ETL Ingestion"
                      value={newWebhookName}
                      onChange={(e) => setNewWebhookName(e.target.value)}
                      className="w-full rounded-xl border border-[var(--max-border)] bg-[var(--max-surface-2)] p-2.5 text-xs text-[var(--max-text)] focus:border-[var(--max-primary)] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--max-text-muted)] mb-1">
                      Target HTTP(S) URL
                    </label>
                    <input
                      type="url"
                      required
                      placeholder="https://api.external.com/webhooks/receive"
                      value={newWebhookUrl}
                      onChange={(e) => setNewWebhookUrl(e.target.value)}
                      className="w-full font-mono rounded-xl border border-[var(--max-border)] bg-[var(--max-surface-2)] p-2.5 text-xs text-[var(--max-text)] focus:border-[var(--max-primary)] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--max-text-muted)] mb-1">
                      Subscribed Events
                    </label>
                    <div className="space-y-1.5 pt-1">
                      {(["workflow.approved", "workflow.rejected", "record.created", "record.updated"] as const).map((ev) => (
                        <label key={ev} className="flex items-center gap-2 cursor-pointer text-xs text-[var(--max-text)]">
                          <input
                            type="checkbox"
                            checked={newWebhookEvents.includes(ev)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewWebhookEvents([...newWebhookEvents, ev]);
                              } else {
                                setNewWebhookEvents(newWebhookEvents.filter((item) => item !== ev));
                              }
                            }}
                            className="rounded border-[var(--max-border)] text-[var(--max-primary)]"
                          />
                          <span className="font-mono text-[11px]">{ev}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-2 border-t border-[var(--max-border)] pt-4">
                  <button
                    type="button"
                    onClick={() => setWebhookModalOpen(false)}
                    className="rounded-xl border border-[var(--max-border)] bg-[var(--max-surface-2)] px-4 py-2 text-xs font-semibold text-[var(--max-text)] hover:bg-[var(--max-surface-3)] transition"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submittingWebhook}
                    className="flex items-center gap-2 rounded-xl bg-[var(--max-primary)] px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:opacity-95 transition disabled:opacity-50"
                  >
                    {submittingWebhook ? "Saving..." : "Create Webhook"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ==================================================================
           * DELIVERY DETAIL MODAL
           * ================================================================ */}
          {selectedDelivery && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className="relative w-full max-w-lg rounded-2xl border border-[var(--max-border)] bg-[var(--max-surface-1)] p-6 shadow-2xl">
                <div className="flex items-center justify-between border-b border-[var(--max-border)] pb-3">
                  <h3 className="text-sm font-bold text-[var(--max-text)]">
                    Webhook Delivery Response
                  </h3>
                  <button
                    onClick={() => setSelectedDelivery(null)}
                    className="rounded-lg p-1 text-[var(--max-text-muted)] hover:bg-[var(--max-surface-3)] hover:text-[var(--max-text)]"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="mt-4 space-y-3 text-xs">
                  <div className="flex justify-between border-b border-[var(--max-border)]/50 pb-2">
                    <span className="text-[var(--max-text-muted)]">Event:</span>
                    <span className="font-mono font-bold text-cyan-400">{selectedDelivery.eventType}</span>
                  </div>
                  <div className="flex justify-between border-b border-[var(--max-border)]/50 pb-2">
                    <span className="text-[var(--max-text-muted)]">Status Code:</span>
                    <span className="font-mono font-bold text-emerald-400">HTTP {selectedDelivery.statusCode}</span>
                  </div>
                  <div className="flex justify-between border-b border-[var(--max-border)]/50 pb-2">
                    <span className="text-[var(--max-text-muted)]">Latency:</span>
                    <span className="font-mono text-[var(--max-text)]">{selectedDelivery.latencyMs} ms</span>
                  </div>
                  <div className="flex justify-between border-b border-[var(--max-border)]/50 pb-2">
                    <span className="text-[var(--max-text-muted)]">Endpoint:</span>
                    <span className="font-mono text-[var(--max-text-secondary)] truncate max-w-xs">{selectedDelivery.targetUrl}</span>
                  </div>

                  <div>
                    <span className="text-[var(--max-text-muted)] block mb-1">Response Body:</span>
                    <pre className="max-h-40 overflow-auto rounded-xl bg-[var(--max-surface-2)] p-3 font-mono text-[11px] text-emerald-300 border border-[var(--max-border)]">
                      {selectedDelivery.responseBody || "{}"}
                    </pre>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setSelectedDelivery(null)}
                    className="rounded-xl bg-[var(--max-surface-2)] px-4 py-2 text-xs font-semibold text-[var(--max-text)] hover:bg-[var(--max-surface-3)] transition"
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
