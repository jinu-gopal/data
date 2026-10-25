"use client";

import { useEffect, useState, useMemo } from "react";
import MaxShell from "@/components/max/MaxShell";

interface AnalyticsWidget {
  id: string;
  title: string;
  widgetType: "METRIC_CARD" | "BAR_CHART" | "LINE_AREA" | "DONUT_PIE" | string;
  dataMetric: string;
  value: string;
  trend: string;
  timeRange: string;
  chartData: Array<{ label: string; value: number; color?: string }>;
  colSpan: number;
}

interface AnalyticsDashboard {
  id: string;
  name: string;
  description: string;
  category: string;
  isDefault: boolean;
  widgets: AnalyticsWidget[];
  updatedAt: string;
}

export default function AnalyticsDashboardPage() {
  const [dashboards, setDashboards] = useState<AnalyticsDashboard[]>([]);
  const [selectedDashboardId, setSelectedDashboardId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"TODAY" | "7D" | "30D" | "90D" | "YTD">("30D");

  // Add Widget Modal
  const [addWidgetModalOpen, setAddWidgetModalOpen] = useState(false);
  const [widgetTitle, setWidgetTitle] = useState("");
  const [widgetType, setWidgetType] = useState("METRIC_CARD");
  const [widgetVal, setWidgetVal] = useState("$250,000");
  const [widgetTrend, setWidgetTrend] = useState("+15% vs last month");

  // Toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchDashboards = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/analytics/dashboards");
      if (res.ok) {
        const data: AnalyticsDashboard[] = await res.json();
        setDashboards(data);
        if (data.length > 0 && !selectedDashboardId) {
          setSelectedDashboardId(data[0].id);
        }
      } else {
        const defs = getSeededDashboards();
        setDashboards(defs);
        if (defs.length > 0) setSelectedDashboardId(defs[0].id);
      }
    } catch {
      const defs = getSeededDashboards();
      setDashboards(defs);
      if (defs.length > 0) setSelectedDashboardId(defs[0].id);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboards();
  }, []);

  const activeDashboard = useMemo(() => {
    return dashboards.find((d) => d.id === selectedDashboardId) || dashboards[0] || null;
  }, [dashboards, selectedDashboardId]);

  const metricWidgets = useMemo(() => {
    if (!activeDashboard) return [];
    return activeDashboard.widgets.filter((w) => w.widgetType === "METRIC_CARD");
  }, [activeDashboard]);

  const chartWidgets = useMemo(() => {
    if (!activeDashboard) return [];
    return activeDashboard.widgets.filter((w) => w.widgetType !== "METRIC_CARD");
  }, [activeDashboard]);

  const handleAddWidget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDashboard || !widgetTitle) return;

    const newW: AnalyticsWidget = {
      id: "w-" + Math.random().toString(36).substring(2, 8),
      title: widgetTitle,
      widgetType,
      dataMetric: "custom",
      value: widgetVal,
      trend: widgetTrend,
      timeRange,
      chartData:
        widgetType === "BAR_CHART"
          ? [
              { label: "Q1", value: 120 },
              { label: "Q2", value: 190 },
              { label: "Q3", value: 240 },
              { label: "Q4", value: 310 },
            ]
          : [],
      colSpan: widgetType === "METRIC_CARD" ? 1 : 2,
    };

    setDashboards((prev) =>
      prev.map((d) =>
        d.id === activeDashboard.id
          ? { ...d, widgets: [...d.widgets, newW] }
          : d
      )
    );

    setAddWidgetModalOpen(false);
    setWidgetTitle("");
    showToast(`Widget '${newW.title}' added to dashboard!`);
  };

  const handleExportSnapshot = () => {
    window.print();
    showToast("Print / PDF report dialog opened.");
  };

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

        {/* Header Strip */}
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/20">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[var(--max-text)]">
                Enterprise Analytics &amp; Custom Dashboards
              </h1>
              <p className="text-xs text-[var(--max-text-secondary)]">
                Cross-object KPI aggregation, visual trend telemetry, operational throughput, and scheduled reporting
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Dashboard Selector */}
            <select
              value={selectedDashboardId}
              onChange={(e) => setSelectedDashboardId(e.target.value)}
              className="rounded-xl border border-[var(--max-border)] bg-[var(--max-bg-secondary)] px-3 py-2 text-xs font-semibold text-[var(--max-text)] outline-none focus:border-[var(--max-primary)]"
            >
              {dashboards.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>

            {/* Time Range Selector */}
            <div className="flex items-center rounded-xl border border-[var(--max-border)] bg-[var(--max-bg-secondary)] p-1 text-xs">
              {(["TODAY", "7D", "30D", "90D", "YTD"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setTimeRange(r)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                    timeRange === r
                      ? "bg-[var(--max-primary)] text-white shadow"
                      : "text-[var(--max-text-secondary)] hover:text-[var(--max-text)]"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            <button
              onClick={() => setAddWidgetModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border border-[var(--max-border)] bg-[var(--max-bg-secondary)] px-3 py-2 text-xs font-semibold text-[var(--max-text)] hover:border-[var(--max-primary)] transition"
            >
              + Add Widget
            </button>

            <button
              onClick={handleExportSnapshot}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-blue-500/20 hover:opacity-90 transition"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Export Report
            </button>
          </div>
        </div>

        {/* Active Dashboard Info */}
        {activeDashboard && (
          <div className="mb-6 rounded-2xl border border-[var(--max-border)] bg-[var(--max-bg-secondary)]/50 p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
                Category: {activeDashboard.category}
              </span>
              <p className="text-xs text-[var(--max-text-secondary)] mt-0.5">
                {activeDashboard.description}
              </p>
            </div>
            <span className="text-[11px] font-mono text-[var(--max-text-secondary)]">
              Updated: {new Date(activeDashboard.updatedAt).toLocaleDateString()}
            </span>
          </div>
        )}

        {/* Section 1: KPI Metric Cards Grid */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {metricWidgets.map((w) => (
            <div
              key={w.id}
              className="rounded-2xl border border-[var(--max-border)] bg-[var(--max-bg-secondary)] p-5 shadow-sm hover:border-[var(--max-primary)]/40 transition"
            >
              <div className="text-xs font-medium text-[var(--max-text-secondary)]">
                {w.title}
              </div>
              <div className="mt-2 text-2xl font-bold tracking-tight text-[var(--max-text)]">
                {w.value}
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-500">
                <span>↑</span>
                <span>{w.trend}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Section 2: Visual Chart Cards Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {chartWidgets.map((widget) => (
            <div
              key={widget.id}
              className="rounded-2xl border border-[var(--max-border)] bg-[var(--max-bg-secondary)] p-6 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-[var(--max-text)]">
                    {widget.title}
                  </h3>
                  <p className="text-xs text-[var(--max-text-secondary)]">
                    Period: {timeRange} • Headline: {widget.value} ({widget.trend})
                  </p>
                </div>
                <span className="rounded-lg bg-[var(--max-bg-primary)] px-2.5 py-1 text-[10px] font-mono text-[var(--max-text-secondary)] border border-[var(--max-border)]">
                  {widget.widgetType}
                </span>
              </div>

              {/* Bar Chart Visualization */}
              {widget.widgetType === "BAR_CHART" && (
                <div className="mt-6 flex h-56 items-end gap-3 rounded-xl border border-[var(--max-border)] bg-[var(--max-bg-primary)] p-4">
                  {widget.chartData.map((d) => {
                    const maxVal = Math.max(...widget.chartData.map((cd) => cd.value));
                    const heightPercent = Math.max(15, (d.value / maxVal) * 100);
                    return (
                      <div key={d.label} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                        <span className="text-[10px] font-mono font-bold text-[var(--max-text-secondary)] opacity-0 group-hover:opacity-100 transition">
                          ${d.value}k
                        </span>
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className="w-full rounded-t-lg bg-gradient-to-t from-blue-600 to-indigo-500 group-hover:from-blue-500 group-hover:to-cyan-400 transition-all"
                        />
                        <span className="text-[11px] font-mono text-[var(--max-text-secondary)]">
                          {d.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Donut / Pie Visualization */}
              {widget.widgetType === "DONUT_PIE" && (
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <div className="relative flex items-center justify-center h-48">
                    {/* SVG Pie Representation */}
                    <svg viewBox="0 0 100 100" className="h-40 w-40 -rotate-90">
                      <circle cx="50" cy="50" r="38" fill="transparent" stroke="#3b82f6" strokeWidth="20" strokeDasharray="80 160" />
                      <circle cx="50" cy="50" r="38" fill="transparent" stroke="#10b981" strokeWidth="20" strokeDasharray="67 173" strokeDashoffset="-80" />
                      <circle cx="50" cy="50" r="38" fill="transparent" stroke="#f59e0b" strokeWidth="20" strokeDasharray="52 188" strokeDashoffset="-147" />
                      <circle cx="50" cy="50" r="38" fill="transparent" stroke="#8b5cf6" strokeWidth="20" strokeDasharray="38 202" strokeDashoffset="-199" />
                    </svg>
                    <div className="absolute text-center">
                      <div className="text-lg font-bold text-[var(--max-text)]">100%</div>
                      <div className="text-[9px] uppercase font-bold text-[var(--max-text-secondary)]">Allocated</div>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {widget.chartData.map((d) => (
                      <div key={d.label} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: d.color || "#3b82f6" }}
                          />
                          <span className="text-[var(--max-text)]">{d.label}</span>
                        </div>
                        <span className="font-mono font-bold text-[var(--max-text)]">{d.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add Widget Modal */}
        {addWidgetModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-[var(--max-border)] bg-[var(--max-bg-secondary)] p-6 shadow-2xl">
              <h3 className="text-base font-bold text-[var(--max-text)] mb-3">Add Analytics Widget</h3>
              <form onSubmit={handleAddWidget} className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-[var(--max-text-secondary)]">Widget Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Total Active Orders"
                    value={widgetTitle}
                    onChange={(e) => setWidgetTitle(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[var(--max-border)] bg-[var(--max-bg-primary)] px-3 py-2 text-xs text-[var(--max-text)] outline-none focus:border-[var(--max-primary)]"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--max-text-secondary)]">Widget Type</label>
                  <select
                    value={widgetType}
                    onChange={(e) => setWidgetType(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[var(--max-border)] bg-[var(--max-bg-primary)] px-3 py-2 text-xs text-[var(--max-text)]"
                  >
                    <option value="METRIC_CARD">KPI Metric Card</option>
                    <option value="BAR_CHART">Bar Chart (Time Trajectory)</option>
                    <option value="DONUT_PIE">Donut Breakdown</option>
                  </select>
                </div>
                {widgetType === "METRIC_CARD" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-[var(--max-text-secondary)]">Display Value</label>
                      <input
                        type="text"
                        value={widgetVal}
                        onChange={(e) => setWidgetVal(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-[var(--max-border)] bg-[var(--max-bg-primary)] px-3 py-2 text-xs text-[var(--max-text)]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-[var(--max-text-secondary)]">Trend Tag</label>
                      <input
                        type="text"
                        value={widgetTrend}
                        onChange={(e) => setWidgetTrend(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-[var(--max-border)] bg-[var(--max-bg-primary)] px-3 py-2 text-xs text-[var(--max-text)]"
                      />
                    </div>
                  </div>
                )}
                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setAddWidgetModalOpen(false)}
                    className="rounded-xl border border-[var(--max-border)] px-3 py-1.5 text-xs text-[var(--max-text-secondary)]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-[var(--max-primary)] px-4 py-1.5 text-xs font-semibold text-white shadow"
                  >
                    Add Widget
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

function getSeededDashboards(): AnalyticsDashboard[] {
  return [
    {
      id: "dash-exec-overview",
      name: "Executive Performance Command Center",
      description: "High-level enterprise revenue, accounts growth, approval SLAs, and budget distribution",
      category: "EXECUTIVE",
      isDefault: true,
      widgets: [
        {
          id: "w-rev-kpi",
          title: "Gross Recognized Revenue",
          widgetType: "METRIC_CARD",
          dataMetric: "revenue",
          value: "$4,850,200",
          trend: "+18.4% vs last quarter",
          timeRange: "30D",
          chartData: [],
          colSpan: 1,
        },
        {
          id: "w-cust-kpi",
          title: "Active Enterprise Accounts",
          widgetType: "METRIC_CARD",
          dataMetric: "accounts",
          value: "1,420",
          trend: "+8.2% new onboardings",
          timeRange: "30D",
          chartData: [],
          colSpan: 1,
        },
        {
          id: "w-sla-kpi",
          title: "Workflow Approval SLA Compliance",
          widgetType: "METRIC_CARD",
          dataMetric: "sla",
          value: "99.4%",
          trend: "+1.1% on-time approvals",
          timeRange: "30D",
          chartData: [],
          colSpan: 1,
        },
        {
          id: "w-ingest-kpi",
          title: "Data Pipeline Throughput",
          widgetType: "METRIC_CARD",
          dataMetric: "throughput",
          value: "18,450 rows",
          trend: "99.13% zero-fault rate",
          timeRange: "30D",
          chartData: [],
          colSpan: 1,
        },
        {
          id: "w-rev-chart",
          title: "Monthly Revenue Trajectory (USD Millions)",
          widgetType: "BAR_CHART",
          dataMetric: "revenue_trend",
          value: "$4.85M",
          trend: "+24% YoY",
          timeRange: "YTD",
          chartData: [
            { label: "Jan", value: 320 },
            { label: "Feb", value: 380 },
            { label: "Mar", value: 450 },
            { label: "Apr", value: 410 },
            { label: "May", value: 520 },
            { label: "Jun", value: 590 },
            { label: "Jul", value: 610 },
            { label: "Aug", value: 680 },
            { label: "Sep", value: 720 },
            { label: "Oct", value: 850 },
          ],
          colSpan: 2,
        },
        {
          id: "w-dept-donut",
          title: "Budget Allocation by Business Unit",
          widgetType: "DONUT_PIE",
          dataMetric: "budget_distribution",
          value: "100%",
          trend: "Full allocation",
          timeRange: "YTD",
          chartData: [
            { label: "Engineering & R&D", value: 34, color: "#3b82f6" },
            { label: "Operations & Supply", value: 28, color: "#10b981" },
            { label: "Sales & Marketing", value: 22, color: "#f59e0b" },
            { label: "Corporate & G&A", value: 16, color: "#8b5cf6" },
          ],
          colSpan: 2,
        },
      ],
      updatedAt: new Date().toISOString(),
    },
  ];
}
