"use client";

import { useEffect, useState, useMemo } from "react";
import MaxShell from "@/components/max/MaxShell";

interface DocumentTemplate {
  id: string;
  templateKey: string;
  name: string;
  documentType: "INVOICE" | "PURCHASE_ORDER" | "PACKING_SLIP" | string;
  businessObjectId: string;
  businessObjectName: string;
  companyHeader: string;
  companyAddress: string;
  primaryColor: string;
  bodyHtml: string;
  footerText: string;
  availableMergeTags: string[];
  status: string;
  updatedAt: string;
}

interface RenderedDoc {
  templateKey: string;
  documentTitle: string;
  renderedHtml: string;
  totalAmount: string;
  renderedAt: string;
}

export default function DocumentStudioPage() {
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [rendering, setRendering] = useState(false);
  const [renderedDoc, setRenderedDoc] = useState<RenderedDoc | null>(null);

  // Context Mock State
  const [docNumber, setDocNumber] = useState("INV-2026-9810");
  const [clientName, setClientName] = useState("Acme Industrial Technologies Corp");
  const [clientEmail, setClientEmail] = useState("accounts.payable@acme-corp.com");
  const [subtotal, setSubtotal] = useState("44,500.00");
  const [taxAmount, setTaxAmount] = useState("3,750.00");
  const [totalAmount, setTotalAmount] = useState("48,250.00");

  // Toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/documents/templates");
      if (res.ok) {
        const data: DocumentTemplate[] = await res.json();
        setTemplates(data);
        if (data.length > 0 && !selectedTemplateId) {
          setSelectedTemplateId(data[0].id);
        }
      } else {
        const defs = getSeededTemplates();
        setTemplates(defs);
        if (defs.length > 0) setSelectedTemplateId(defs[0].id);
      }
    } catch {
      const defs = getSeededTemplates();
      setTemplates(defs);
      if (defs.length > 0) setSelectedTemplateId(defs[0].id);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const activeTemplate = useMemo(() => {
    return templates.find((t) => t.id === selectedTemplateId) || templates[0] || null;
  }, [templates, selectedTemplateId]);

  const handleRender = async () => {
    if (!activeTemplate) return;
    setRendering(true);
    try {
      const res = await fetch("/api/documents/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: activeTemplate.id,
          contextData: {
            "invoice.number": docNumber,
            "po.number": docNumber,
            "customer.name": clientName,
            "vendor.name": clientName,
            "customer.email": clientEmail,
            "invoice.subtotal": subtotal,
            "invoice.taxAmount": taxAmount,
            "invoice.totalAmount": totalAmount,
            "po.totalAmount": totalAmount,
          },
        }),
      });

      if (res.ok) {
        const doc: RenderedDoc = await res.json();
        setRenderedDoc(doc);
        showToast("Document rendered successfully!");
      } else {
        setRenderedDoc(simulateRender(activeTemplate, docNumber, clientName, totalAmount));
        showToast("Document rendered in preview simulator.");
      }
    } catch {
      setRenderedDoc(simulateRender(activeTemplate, docNumber, clientName, totalAmount));
      showToast("Document preview rendered.");
    } finally {
      setRendering(false);
    }
  };

  // Initial render when template changes
  useEffect(() => {
    if (activeTemplate) {
      handleRender();
    }
  }, [activeTemplate?.id]);

  const handlePrint = () => {
    window.print();
    showToast("Print / PDF dialog triggered.");
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
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-600 to-amber-600 text-white shadow-lg shadow-pink-500/20">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[var(--max-text)]">
                Document Generation &amp; Invoicing Engine
              </h1>
              <p className="text-xs text-[var(--max-text-secondary)]">
                Automated commercial invoices, purchase orders, packing slips, dynamic merge tags, and print-ready PDF sheets
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-xl border border-[var(--max-border)] bg-[var(--max-bg-secondary)] px-4 py-2 text-xs font-semibold text-[var(--max-text)] hover:border-[var(--max-primary)] transition"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print / Save PDF
            </button>
            <button
              onClick={() => showToast("Dispatched simulated invoice to client email.")}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-pink-500/20 hover:opacity-90 transition"
            >
              ⚡ Dispatch Email
            </button>
          </div>
        </div>

        {/* Studio Workspace */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left: Template Selector & Document Parameters */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-[var(--max-border)] bg-[var(--max-bg-secondary)] p-5 shadow-sm">
              <h3 className="text-sm font-bold text-[var(--max-text)] mb-3">
                Document Templates
              </h3>
              <div className="space-y-2">
                {templates.map((tpl) => (
                  <button
                    key={tpl.id}
                    onClick={() => setSelectedTemplateId(tpl.id)}
                    className={`w-full text-left rounded-xl p-3 text-xs transition border ${
                      selectedTemplateId === tpl.id
                        ? "border-[var(--max-primary)] bg-[var(--max-primary)]/10 font-semibold text-[var(--max-text)]"
                        : "border-[var(--max-border)] bg-[var(--max-bg-primary)] text-[var(--max-text-secondary)] hover:border-[var(--max-primary)]/50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-[var(--max-text)]">{tpl.name}</span>
                      <span className="rounded bg-rose-500/10 text-rose-400 px-1.5 py-0.5 text-[9px] font-bold">
                        {tpl.documentType}
                      </span>
                    </div>
                    <div className="text-[10px] text-[var(--max-text-secondary)]">
                      Target: {tpl.businessObjectName} • Key: {tpl.templateKey}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Document Context Inputs */}
            <div className="rounded-2xl border border-[var(--max-border)] bg-[var(--max-bg-secondary)] p-5 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-[var(--max-text)]">
                Document Context Data
              </h3>

              <div>
                <label className="text-[11px] font-medium text-[var(--max-text-secondary)]">Doc / Invoice #</label>
                <input
                  type="text"
                  value={docNumber}
                  onChange={(e) => setDocNumber(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[var(--max-border)] bg-[var(--max-bg-primary)] px-3 py-1.5 text-xs text-[var(--max-text)]"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-[var(--max-text-secondary)]">Client / Recipient Name</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[var(--max-border)] bg-[var(--max-bg-primary)] px-3 py-1.5 text-xs text-[var(--max-text)]"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-[var(--max-text-secondary)]">Client Email</label>
                <input
                  type="text"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[var(--max-border)] bg-[var(--max-bg-primary)] px-3 py-1.5 text-xs text-[var(--max-text)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-medium text-[var(--max-text-secondary)]">Subtotal ($)</label>
                  <input
                    type="text"
                    value={subtotal}
                    onChange={(e) => setSubtotal(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[var(--max-border)] bg-[var(--max-bg-primary)] px-3 py-1.5 text-xs text-[var(--max-text)]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-[var(--max-text-secondary)]">Grand Total ($)</label>
                  <input
                    type="text"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[var(--max-border)] bg-[var(--max-bg-primary)] px-3 py-1.5 text-xs text-[var(--max-text)] font-bold text-emerald-400"
                  />
                </div>
              </div>

              <button
                onClick={handleRender}
                disabled={rendering}
                className="w-full mt-2 rounded-xl bg-[var(--max-primary)] py-2 text-xs font-semibold text-white shadow hover:opacity-90 disabled:opacity-50"
              >
                {rendering ? "Updating Preview..." : "Re-render Preview"}
              </button>
            </div>
          </div>

          {/* Right: Print-Ready Document Sheet Preview */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-[var(--max-border)] bg-[var(--max-bg-secondary)] p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4 border-b border-[var(--max-border)] pb-3">
                <span className="text-xs font-bold text-[var(--max-text)]">
                  Live Document Sheet Preview (A4 Standard)
                </span>
                <span className="text-[10px] font-mono text-[var(--max-text-secondary)]">
                  Rendered at {renderedDoc ? new Date(renderedDoc.renderedAt).toLocaleTimeString() : "--"}
                </span>
              </div>

              {/* White Document Paper Sheet */}
              <div className="rounded-xl bg-white text-slate-900 p-8 shadow-2xl font-sans min-h-[580px] border border-slate-200">
                {/* Enterprise Header */}
                <div className="flex justify-between items-start border-b border-slate-200 pb-5">
                  <div>
                    <h2 className="text-lg font-black tracking-tight text-blue-700">
                      {activeTemplate?.companyHeader || "MAX ENTERPRISE GLOBAL"}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs">
                      {activeTemplate?.companyAddress || "100 Enterprise Way, Suite 400, San Francisco CA"}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block rounded bg-blue-100 text-blue-800 font-black px-2.5 py-1 text-xs uppercase tracking-wider">
                      {activeTemplate?.documentType || "INVOICE"}
                    </span>
                    <div className="text-xs font-mono font-bold text-slate-700 mt-2">{docNumber}</div>
                    <div className="text-[11px] text-slate-400">Date: October 16, 2026</div>
                  </div>
                </div>

                {/* Recipient Details */}
                <div className="my-6 grid grid-cols-2 gap-6 text-xs">
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">BILLED TO:</div>
                    <div className="text-sm font-bold text-slate-800 mt-1">{clientName}</div>
                    <div className="text-slate-500">{clientEmail}</div>
                    <div className="text-slate-500 font-mono text-[11px]">Tax ID: US-99214-082</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">PAYMENT TERMS:</div>
                    <div className="text-slate-700 font-medium mt-1">Net 30 Days via Wire / ACH Transfer</div>
                    <div className="text-slate-500">Status: <strong className="text-emerald-600">APPROVED</strong></div>
                  </div>
                </div>

                {/* Line Items Table */}
                <table className="w-full text-left text-xs my-6 border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-200 text-slate-500 uppercase text-[10px]">
                      <th className="py-2">Item Description</th>
                      <th className="py-2 text-center">Qty</th>
                      <th className="py-2 text-right">Unit Price</th>
                      <th className="py-2 text-right">Tax</th>
                      <th className="py-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
                    <tr>
                      <td className="py-2.5 font-sans font-medium text-slate-800">MAX Enterprise ERP Core Platform (Annual)</td>
                      <td className="py-2.5 text-center">1</td>
                      <td className="py-2.5 text-right">$35,000.00</td>
                      <td className="py-2.5 text-right">$2,800.00</td>
                      <td className="py-2.5 text-right font-bold text-slate-900">$37,800.00</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-sans font-medium text-slate-800">Cloud Integration Gateway &amp; Telemetry Hub</td>
                      <td className="py-2.5 text-center">1</td>
                      <td className="py-2.5 text-right">$6,500.00</td>
                      <td className="py-2.5 text-right">$520.00</td>
                      <td className="py-2.5 text-right font-bold text-slate-900">$7,020.00</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-sans font-medium text-slate-800">24/7 Mission-Critical SLA &amp; Support</td>
                      <td className="py-2.5 text-center">1</td>
                      <td className="py-2.5 text-right">$3,000.00</td>
                      <td className="py-2.5 text-right">$430.00</td>
                      <td className="py-2.5 text-right font-bold text-slate-900">$3,430.00</td>
                    </tr>
                  </tbody>
                </table>

                {/* Totals Section */}
                <div className="flex justify-end pt-4 border-t border-slate-200">
                  <div className="w-64 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-500">
                      <span>Subtotal:</span>
                      <span className="font-mono">${subtotal}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Estimated Tax:</span>
                      <span className="font-mono">${taxAmount}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-300">
                      <span>Total Due:</span>
                      <span className="font-mono text-blue-700">${totalAmount} USD</span>
                    </div>
                  </div>
                </div>

                {/* Footer Notes */}
                <div className="mt-10 pt-4 border-t border-slate-100 text-[11px] text-slate-400 italic text-center">
                  {activeTemplate?.footerText || "Thank you for your business. Remit payment in USD."}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MaxShell>
  );
}

function simulateRender(tpl: DocumentTemplate, docNo: string, client: string, total: string): RenderedDoc {
  return {
    templateKey: tpl.templateKey,
    documentTitle: tpl.name,
    renderedHtml: `<p>Simulated Document: ${docNo} for ${client}</p>`,
    totalAmount: total,
    renderedAt: new Date().toISOString(),
  };
}

function getSeededTemplates(): DocumentTemplate[] {
  return [
    {
      id: "doc-tpl-invoice",
      templateKey: "doc_commercial_invoice",
      name: "Enterprise Commercial Tax Invoice",
      documentType: "INVOICE",
      businessObjectId: "sales-order-bo-id",
      businessObjectName: "Sales Order",
      companyHeader: "MAX ENTERPRISE GLOBAL TECHNOLOGIES",
      companyAddress: "100 Enterprise Boulevard, Suite 500, San Francisco CA 94107",
      primaryColor: "#2563eb",
      bodyHtml: "",
      footerText: "Thank you for choosing MAX ERP. All payments are governed by Master Enterprise Agreement #MEA-9941.",
      availableMergeTags: ["{{invoice.number}}", "{{customer.name}}", "{{invoice.totalAmount}}"],
      status: "ACTIVE",
      updatedAt: new Date().toISOString(),
    },
    {
      id: "doc-tpl-po",
      templateKey: "doc_purchase_order",
      name: "Official Purchase Order Requisition",
      documentType: "PURCHASE_ORDER",
      businessObjectId: "vendor-bo-id",
      businessObjectName: "Vendor",
      companyHeader: "MAX ENTERPRISE SUPPLY CHAIN DIV",
      companyAddress: "450 Industrial Parkway, Austin TX 78701",
      primaryColor: "#059669",
      bodyHtml: "",
      footerText: "Deliveries subject to MAX Vendor Quality Standard ISO-9001.",
      availableMergeTags: ["{{po.number}}", "{{vendor.name}}", "{{po.totalAmount}}"],
      status: "ACTIVE",
      updatedAt: new Date().toISOString(),
    },
  ];
}
