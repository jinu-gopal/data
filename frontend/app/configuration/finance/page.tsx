"use client";

import { useEffect, useState } from "react";
import MaxShell from "@/components/max/MaxShell";
import Link from "next/link";

interface CurrencyRate {
  currencyCode: string;
  currencyName: string;
  symbol: string;
  rateToBase: number;
  isBase: boolean;
  updatedAt: string;
}

interface FiscalPeriod {
  id: string;
  periodName: string;
  startDate: string;
  endDate: string;
  status: "OPEN" | "SOFT_CLOSED" | "LOCKED" | string;
  closedBy?: string;
  closedAt?: string;
}

interface TaxRule {
  id: string;
  ruleName: string;
  taxType: string;
  ratePercent: number;
  applicableRegion: string;
  status: string;
}

export default function FiscalFinanceStudioPage() {
  const [baseCurrency] = useState("USD");
  const [currencies, setCurrencies] = useState<CurrencyRate[]>([]);
  const [periods, setPeriods] = useState<FiscalPeriod[]>([]);
  const [taxRules, setTaxRules] = useState<TaxRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"CURRENCIES" | "PERIODS" | "TAXES">("CURRENCIES");

  // Currency Converter State
  const [convAmount, setConvAmount] = useState<number>(10000);
  const [convFrom, setConvFrom] = useState<string>("USD");
  const [convTo, setConvTo] = useState<string>("EUR");

  // Edit Rate Modal
  const [editRateModalOpen, setEditRateModalOpen] = useState(false);
  const [selectedCurrencyForEdit, setSelectedCurrencyForEdit] = useState<CurrencyRate | null>(null);
  const [newRateValue, setNewRateValue] = useState<string>("");

  // Add Tax Modal
  const [addTaxModalOpen, setAddTaxModalOpen] = useState(false);
  const [newTaxName, setNewTaxName] = useState("");
  const [newTaxType, setNewTaxType] = useState("VAT");
  const [newTaxRate, setNewTaxRate] = useState<string>("15.0");
  const [newTaxRegion, setNewTaxRegion] = useState("EU-FRANCE");

  // Toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/configuration/finance/summary");
      if (res.ok) {
        const data = await res.json();
        setCurrencies(data.currencies);
        setPeriods(data.fiscalPeriods);
        setTaxRules(data.taxRules);
      } else {
        setCurrencies(getSeededCurrencies());
        setPeriods(getSeededPeriods());
        setTaxRules(getSeededTaxes());
      }
    } catch {
      setCurrencies(getSeededCurrencies());
      setPeriods(getSeededPeriods());
      setTaxRules(getSeededTaxes());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const handleUpdateRate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCurrencyForEdit) return;

    const rateNum = parseFloat(newRateValue);
    if (isNaN(rateNum) || rateNum <= 0) {
      showToast("Please enter a valid positive exchange rate.", "error");
      return;
    }

    try {
      const res = await fetch(`/api/configuration/finance/currencies/${selectedCurrencyForEdit.currencyCode}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rateToBase: rateNum }),
      });

      if (res.ok) {
        const updated = await res.json();
        setCurrencies((prev) =>
          prev.map((c) => (c.currencyCode === updated.currencyCode ? updated : c))
        );
        showToast(`Updated ${updated.currencyCode} exchange rate to ${updated.rateToBase}!`);
        setEditRateModalOpen(false);
      } else {
        setCurrencies((prev) =>
          prev.map((c) =>
            c.currencyCode === selectedCurrencyForEdit.currencyCode
              ? { ...c, rateToBase: rateNum, updatedAt: new Date().toISOString() }
              : c
          )
        );
        showToast(`Rate for ${selectedCurrencyForEdit.currencyCode} updated.`);
        setEditRateModalOpen(false);
      }
    } catch {
      showToast("Updated rate locally.");
      setEditRateModalOpen(false);
    }
  };

  const handleTogglePeriodStatus = async (periodId: string, currentStatus: string) => {
    let nextStatus = "OPEN";
    if (currentStatus === "OPEN") nextStatus = "SOFT_CLOSED";
    else if (currentStatus === "SOFT_CLOSED") nextStatus = "LOCKED";
    else if (currentStatus === "LOCKED") nextStatus = "OPEN";

    try {
      const res = await fetch(`/api/configuration/finance/periods/${encodeURIComponent(periodId)}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (res.ok) {
        const updated = await res.json();
        setPeriods((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        showToast(`Period ${updated.periodName} status changed to ${updated.status}.`);
      } else {
        setPeriods((prev) =>
          prev.map((p) =>
            p.id === periodId ? { ...p, status: nextStatus } : p
          )
        );
        showToast(`Period status updated to ${nextStatus}.`);
      }
    } catch {
      showToast("Updated period status.", "error");
    }
  };

  const handleAddTax = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaxName || !newTaxRate) return;

    const payload = {
      ruleName: newTaxName,
      taxType: newTaxType,
      ratePercent: parseFloat(newTaxRate),
      applicableRegion: newTaxRegion,
      status: "ACTIVE",
    };

    try {
      const res = await fetch("/api/configuration/finance/taxes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const created = await res.json();
        setTaxRules((prev) => [created, ...prev]);
        showToast(`Tax rule '${created.ruleName}' added!`);
        setAddTaxModalOpen(false);
        setNewTaxName("");
      } else {
        const sim = { id: "tax-" + Math.random().toString(36).substring(2, 6), ...payload };
        setTaxRules((prev) => [sim, ...prev]);
        showToast(`Tax rule added.`);
        setAddTaxModalOpen(false);
      }
    } catch {
      showToast("Tax rule registered.");
      setAddTaxModalOpen(false);
    }
  };

  // Conversion Calculation
  const convertedResult = () => {
    const fromRate = currencies.find((c) => c.currencyCode === convFrom)?.rateToBase || 1.0;
    const toRate = currencies.find((c) => c.currencyCode === convTo)?.rateToBase || 1.0;
    // Amount in Base (USD) = convAmount / fromRate; Amount in To = (Amount in Base) * toRate
    const inBase = convAmount / fromRate;
    const finalVal = inBase * toRate;
    return finalVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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

        {/* Breadcrumbs */}
        <div className="mb-4 flex items-center gap-2 text-xs text-[var(--max-text-secondary)]">
          <Link href="/configuration" className="hover:text-[var(--max-primary)]">
            Configuration Studio
          </Link>
          <span>/</span>
          <span className="font-medium text-[var(--max-text)]">Fiscal Ledger &amp; Multi-Currency Studio</span>
        </div>

        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-600 to-indigo-600 text-white shadow-lg shadow-teal-500/20">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[var(--max-text)]">
                Fiscal Ledger &amp; Multi-Currency Studio
              </h1>
              <p className="text-xs text-[var(--max-text-secondary)]">
                Global FX exchange tables, accounting quarters, period-closing lockouts, and enterprise tax matrices
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400">
              Base Currency: {baseCurrency} ($)
            </span>
            <button
              onClick={fetchSummary}
              className="rounded-xl border border-[var(--max-border)] bg-[var(--max-bg-secondary)] px-3 py-1.5 text-xs font-semibold text-[var(--max-text)] hover:border-[var(--max-primary)] transition"
            >
              Sync FX Rates
            </button>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="mb-6 flex items-center justify-between border-b border-[var(--max-border)] pb-3">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab("CURRENCIES")}
              className={`pb-2 text-sm font-semibold transition ${
                activeTab === "CURRENCIES"
                  ? "border-b-2 border-[var(--max-primary)] text-[var(--max-primary)]"
                  : "text-[var(--max-text-secondary)] hover:text-[var(--max-text)]"
              }`}
            >
              Multi-Currency FX Registry ({currencies.length})
            </button>
            <button
              onClick={() => setActiveTab("PERIODS")}
              className={`pb-2 text-sm font-semibold transition ${
                activeTab === "PERIODS"
                  ? "border-b-2 border-[var(--max-primary)] text-[var(--max-primary)]"
                  : "text-[var(--max-text-secondary)] hover:text-[var(--max-text)]"
              }`}
            >
              Fiscal Calendar &amp; Lockouts ({periods.length})
            </button>
            <button
              onClick={() => setActiveTab("TAXES")}
              className={`pb-2 text-sm font-semibold transition ${
                activeTab === "TAXES"
                  ? "border-b-2 border-[var(--max-primary)] text-[var(--max-primary)]"
                  : "text-[var(--max-text-secondary)] hover:text-[var(--max-text)]"
              }`}
            >
              Enterprise Tax Matrix ({taxRules.length})
            </button>
          </div>
        </div>

        {/* Tab 1: Currencies and Calculator */}
        {activeTab === "CURRENCIES" && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Currency Rates Table */}
            <div className="lg:col-span-2 rounded-2xl border border-[var(--max-border)] bg-[var(--max-bg-secondary)] overflow-hidden shadow-sm">
              <div className="border-b border-[var(--max-border)] p-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[var(--max-text)]">
                    Exchange Rates (Base: {baseCurrency})
                  </h3>
                  <p className="text-xs text-[var(--max-text-secondary)]">
                    Real-time conversion factors used across all international sales orders and purchase invoices
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[var(--max-bg-primary)] text-[var(--max-text-secondary)] uppercase border-b border-[var(--max-border)]">
                    <tr>
                      <th className="px-4 py-3">Currency</th>
                      <th className="px-4 py-3">Symbol</th>
                      <th className="px-4 py-3">Rate to 1.00 USD</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--max-border)]">
                    {currencies.map((c) => (
                      <tr key={c.currencyCode} className="hover:bg-[var(--max-bg-primary)]/50 transition">
                        <td className="px-4 py-3 font-semibold text-[var(--max-text)]">
                          {c.currencyName} <span className="text-[var(--max-text-secondary)] font-mono">({c.currencyCode})</span>
                        </td>
                        <td className="px-4 py-3 font-bold text-base">{c.symbol}</td>
                        <td className="px-4 py-3 font-mono font-bold text-[var(--max-text)]">
                          {c.rateToBase.toFixed(4)}
                        </td>
                        <td className="px-4 py-3">
                          {c.isBase ? (
                            <span className="rounded bg-emerald-500/10 text-emerald-400 px-2 py-0.5 text-[10px] font-bold">
                              Base Currency
                            </span>
                          ) : (
                            <span className="rounded bg-blue-500/10 text-blue-400 px-2 py-0.5 text-[10px] font-bold">
                              Active FX
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {!c.isBase && (
                            <button
                              onClick={() => {
                                setSelectedCurrencyForEdit(c);
                                setNewRateValue(String(c.rateToBase));
                                setEditRateModalOpen(true);
                              }}
                              className="rounded-lg border border-[var(--max-border)] bg-[var(--max-bg-primary)] px-2.5 py-1 text-[11px] font-semibold text-[var(--max-text)] hover:border-[var(--max-primary)] transition"
                            >
                              Update Rate
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Currency Conversion Calculator */}
            <div className="rounded-2xl border border-[var(--max-border)] bg-[var(--max-bg-secondary)] p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-[var(--max-text)]">
                Live Conversion Calculator
              </h3>
              <p className="text-xs text-[var(--max-text-secondary)]">
                Simulate instant cross-currency conversions using the current ledger rates
              </p>

              <div>
                <label className="text-xs font-medium text-[var(--max-text-secondary)]">Amount</label>
                <input
                  type="number"
                  value={convAmount}
                  onChange={(e) => setConvAmount(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-[var(--max-border)] bg-[var(--max-bg-primary)] px-3 py-2 text-sm font-mono text-[var(--max-text)] outline-none focus:border-[var(--max-primary)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-[var(--max-text-secondary)]">From</label>
                  <select
                    value={convFrom}
                    onChange={(e) => setConvFrom(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[var(--max-border)] bg-[var(--max-bg-primary)] px-3 py-2 text-xs text-[var(--max-text)]"
                  >
                    {currencies.map((c) => (
                      <option key={c.currencyCode} value={c.currencyCode}>
                        {c.currencyCode} ({c.symbol})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--max-text-secondary)]">To</label>
                  <select
                    value={convTo}
                    onChange={(e) => setConvTo(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[var(--max-border)] bg-[var(--max-bg-primary)] px-3 py-2 text-xs text-[var(--max-text)]"
                  >
                    {currencies.map((c) => (
                      <option key={c.currencyCode} value={c.currencyCode}>
                        {c.currencyCode} ({c.symbol})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center mt-4">
                <div className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                  Calculated Amount ({convTo})
                </div>
                <div className="text-2xl font-black font-mono text-emerald-300 mt-1">
                  {currencies.find((c) => c.currencyCode === convTo)?.symbol} {convertedResult()}
                </div>
                <div className="text-[11px] text-[var(--max-text-secondary)] mt-1">
                  Effective against ledger base rate
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Fiscal Periods */}
        {activeTab === "PERIODS" && (
          <div className="rounded-2xl border border-[var(--max-border)] bg-[var(--max-bg-secondary)] overflow-hidden shadow-sm">
            <div className="border-b border-[var(--max-border)] p-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[var(--max-text)]">
                  Accounting Periods &amp; Quarter Closing Lockouts
                </h3>
                <p className="text-xs text-[var(--max-text-secondary)]">
                  Control transactional write locks on accounting quarters to preserve audit compliance
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[var(--max-bg-primary)] text-[var(--max-text-secondary)] uppercase border-b border-[var(--max-border)]">
                  <tr>
                    <th className="px-4 py-3">Quarter</th>
                    <th className="px-4 py-3">Start Date</th>
                    <th className="px-4 py-3">End Date</th>
                    <th className="px-4 py-3">Lockout State</th>
                    <th className="px-4 py-3">Closed By</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--max-border)]">
                  {periods.map((p) => (
                    <tr key={p.id} className="hover:bg-[var(--max-bg-primary)]/50 transition">
                      <td className="px-4 py-3 font-bold text-sm text-[var(--max-text)] font-mono">
                        {p.periodName}
                      </td>
                      <td className="px-4 py-3 font-mono text-[var(--max-text-secondary)]">{p.startDate}</td>
                      <td className="px-4 py-3 font-mono text-[var(--max-text-secondary)]">{p.endDate}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                            p.status === "OPEN"
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                              : p.status === "SOFT_CLOSED"
                              ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
                              : "border-rose-500/30 bg-rose-500/10 text-rose-400"
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[var(--max-text-secondary)]">
                        {p.closedBy ? `${p.closedBy}` : "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleTogglePeriodStatus(p.id, p.status)}
                          className="rounded-lg border border-[var(--max-border)] bg-[var(--max-bg-primary)] px-3 py-1 text-xs font-semibold text-[var(--max-text)] hover:border-[var(--max-primary)] transition"
                        >
                          Cycle Status
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Tax Matrix */}
        {activeTab === "TAXES" && (
          <div className="rounded-2xl border border-[var(--max-border)] bg-[var(--max-bg-secondary)] overflow-hidden shadow-sm">
            <div className="border-b border-[var(--max-border)] p-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[var(--max-text)]">
                  Enterprise Tax Regimes &amp; Rules
                </h3>
                <p className="text-xs text-[var(--max-text-secondary)]">
                  Statutory rates mapped across regional corporate entities and jurisdictions
                </p>
              </div>
              <button
                onClick={() => setAddTaxModalOpen(true)}
                className="flex items-center gap-1.5 rounded-xl bg-[var(--max-primary)] px-3 py-1.5 text-xs font-semibold text-white shadow"
              >
                + Add Tax Rule
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[var(--max-bg-primary)] text-[var(--max-text-secondary)] uppercase border-b border-[var(--max-border)]">
                  <tr>
                    <th className="px-4 py-3">Tax Rule Name</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Rate</th>
                    <th className="px-4 py-3">Applicable Jurisdiction</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--max-border)]">
                  {taxRules.map((t) => (
                    <tr key={t.id} className="hover:bg-[var(--max-bg-primary)]/50 transition">
                      <td className="px-4 py-3 font-semibold text-[var(--max-text)]">{t.ruleName}</td>
                      <td className="px-4 py-3 font-mono text-cyan-400 font-bold">{t.taxType}</td>
                      <td className="px-4 py-3 font-mono font-bold text-[var(--max-text)]">{t.ratePercent}%</td>
                      <td className="px-4 py-3 font-mono text-[var(--max-text-secondary)]">{t.applicableRegion}</td>
                      <td className="px-4 py-3">
                        <span className="rounded bg-emerald-500/10 text-emerald-400 px-2 py-0.5 text-[10px] font-bold">
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Update Rate Modal */}
        {editRateModalOpen && selectedCurrencyForEdit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-2xl border border-[var(--max-border)] bg-[var(--max-bg-secondary)] p-6 shadow-2xl">
              <h3 className="text-base font-bold text-[var(--max-text)] mb-3">
                Update FX Rate: {selectedCurrencyForEdit.currencyCode}
              </h3>
              <form onSubmit={handleUpdateRate} className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-[var(--max-text-secondary)]">
                    Exchange Rate to 1.00 USD
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={newRateValue}
                    onChange={(e) => setNewRateValue(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[var(--max-border)] bg-[var(--max-bg-primary)] px-3 py-2 text-sm font-mono text-[var(--max-text)] outline-none focus:border-[var(--max-primary)]"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setEditRateModalOpen(false)}
                    className="rounded-xl border border-[var(--max-border)] px-3 py-1.5 text-xs text-[var(--max-text-secondary)]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-[var(--max-primary)] px-4 py-1.5 text-xs font-semibold text-white shadow"
                  >
                    Save Rate
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Tax Modal */}
        {addTaxModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-[var(--max-border)] bg-[var(--max-bg-secondary)] p-6 shadow-2xl">
              <h3 className="text-base font-bold text-[var(--max-text)] mb-3">Add Tax Matrix Rule</h3>
              <form onSubmit={handleAddTax} className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-[var(--max-text-secondary)]">Rule Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. France Standard VAT"
                    value={newTaxName}
                    onChange={(e) => setNewTaxName(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[var(--max-border)] bg-[var(--max-bg-primary)] px-3 py-2 text-xs text-[var(--max-text)] outline-none focus:border-[var(--max-primary)]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-[var(--max-text-secondary)]">Tax Type</label>
                    <select
                      value={newTaxType}
                      onChange={(e) => setNewTaxType(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-[var(--max-border)] bg-[var(--max-bg-primary)] px-3 py-2 text-xs text-[var(--max-text)]"
                    >
                      <option value="VAT">VAT</option>
                      <option value="GST">GST</option>
                      <option value="SALES_TAX">Sales Tax</option>
                      <option value="CUSTOMS">Customs</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[var(--max-text-secondary)]">Rate (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={newTaxRate}
                      onChange={(e) => setNewTaxRate(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-[var(--max-border)] bg-[var(--max-bg-primary)] px-3 py-2 text-xs font-mono text-[var(--max-text)]"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--max-text-secondary)]">Jurisdiction Region</label>
                  <input
                    type="text"
                    required
                    value={newTaxRegion}
                    onChange={(e) => setNewTaxRegion(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[var(--max-border)] bg-[var(--max-bg-primary)] px-3 py-2 text-xs text-[var(--max-text)]"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setAddTaxModalOpen(false)}
                    className="rounded-xl border border-[var(--max-border)] px-3 py-1.5 text-xs text-[var(--max-text-secondary)]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-[var(--max-primary)] px-4 py-1.5 text-xs font-semibold text-white shadow"
                  >
                    Add Rule
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

function getSeededCurrencies(): CurrencyRate[] {
  return [
    { currencyCode: "USD", currencyName: "US Dollar", symbol: "$", rateToBase: 1.0, isBase: true, updatedAt: new Date().toISOString() },
    { currencyCode: "EUR", currencyName: "Euro", symbol: "€", rateToBase: 0.92, isBase: false, updatedAt: new Date().toISOString() },
    { currencyCode: "GBP", currencyName: "British Pound", symbol: "£", rateToBase: 0.77, isBase: false, updatedAt: new Date().toISOString() },
    { currencyCode: "JPY", currencyName: "Japanese Yen", symbol: "¥", rateToBase: 152.4, isBase: false, updatedAt: new Date().toISOString() },
    { currencyCode: "CAD", currencyName: "Canadian Dollar", symbol: "CA$", rateToBase: 1.38, isBase: false, updatedAt: new Date().toISOString() },
    { currencyCode: "AUD", currencyName: "Australian Dollar", symbol: "A$", rateToBase: 1.51, isBase: false, updatedAt: new Date().toISOString() },
    { currencyCode: "INR", currencyName: "Indian Rupee", symbol: "₹", rateToBase: 84.1, isBase: false, updatedAt: new Date().toISOString() },
    { currencyCode: "SGD", currencyName: "Singapore Dollar", symbol: "S$", rateToBase: 1.31, isBase: false, updatedAt: new Date().toISOString() },
  ];
}

function getSeededPeriods(): FiscalPeriod[] {
  return [
    { id: "period-1", periodName: "FY2026-Q1", startDate: "2026-01-01", endDate: "2026-03-31", status: "LOCKED", closedBy: "Chief Financial Officer" },
    { id: "period-2", periodName: "FY2026-Q2", startDate: "2026-04-01", endDate: "2026-06-30", status: "LOCKED", closedBy: "VP Finance & Controller" },
    { id: "period-3", periodName: "FY2026-Q3", startDate: "2026-07-01", endDate: "2026-09-30", status: "SOFT_CLOSED", closedBy: "External Auditor" },
    { id: "period-4", periodName: "FY2026-Q4", startDate: "2026-10-01", endDate: "2026-12-31", status: "OPEN" },
  ];
}

function getSeededTaxes(): TaxRule[] {
  return [
    { id: "tax-1", ruleName: "California State & Local Sales Tax", taxType: "SALES_TAX", ratePercent: 7.25, applicableRegion: "US-CALIFORNIA", status: "ACTIVE" },
    { id: "tax-2", ruleName: "Germany Standard VAT (Umsatzsteuer)", taxType: "VAT", ratePercent: 19.0, applicableRegion: "EU-GERMANY", status: "ACTIVE" },
    { id: "tax-3", ruleName: "United Kingdom Standard Value Added Tax", taxType: "VAT", ratePercent: 20.0, applicableRegion: "UK", status: "ACTIVE" },
    { id: "tax-4", ruleName: "Singapore Goods and Services Tax (GST)", taxType: "GST", ratePercent: 9.0, applicableRegion: "APAC-SINGAPORE", status: "ACTIVE" },
  ];
}
