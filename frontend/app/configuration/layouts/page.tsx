"use client";

import { useEffect, useState, useMemo } from "react";
import MaxShell from "@/components/max/MaxShell";
import Link from "next/link";

interface FormLayoutField {
  fieldKey: string;
  label: string;
  fieldType: string;
  required: boolean;
  readOnly: boolean;
  colSpan: number;
  defaultValue?: string;
}

interface FormLayoutSection {
  id: string;
  title: string;
  description?: string;
  columns: number;
  collapsible: boolean;
  defaultExpanded: boolean;
  fields: FormLayoutField[];
}

interface FormLayout {
  id: string;
  layoutKey: string;
  name: string;
  businessObjectId: string;
  businessObjectName: string;
  assignedRole: string;
  isDefault: boolean;
  headerSubtitleField?: string;
  headerHighlightFields: string[];
  sections: FormLayoutSection[];
  relatedLists: string[];
  updatedAt: string;
}

export default function FormLayoutsStudioPage() {
  const [layouts, setLayouts] = useState<FormLayout[]>([]);
  const [selectedLayoutId, setSelectedLayoutId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [viewportMode, setViewportMode] = useState<"DESKTOP" | "TABLET" | "MOBILE">("DESKTOP");

  // New Section State
  const [newSectionModalOpen, setNewSectionModalOpen] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [newSectionDesc, setNewSectionDesc] = useState("");
  const [newSectionCols, setNewSectionCols] = useState(2);

  // New Field State
  const [targetSectionIdForField, setTargetSectionIdForField] = useState<string | null>(null);
  const [newFieldKey, setNewFieldKey] = useState("");
  const [newFieldLabel, setNewFieldLabel] = useState("");
  const [newFieldType, setNewFieldType] = useState("TEXT");
  const [newFieldRequired, setNewFieldRequired] = useState(false);
  const [newFieldReadOnly, setNewFieldReadOnly] = useState(false);
  const [newFieldColSpan, setNewFieldColSpan] = useState(1);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchLayouts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/configuration/layouts");
      if (res.ok) {
        const data: FormLayout[] = await res.json();
        setLayouts(data);
        if (data.length > 0 && !selectedLayoutId) {
          setSelectedLayoutId(data[0].id);
        }
      } else {
        const defaults = getSeededLayouts();
        setLayouts(defaults);
        if (defaults.length > 0) setSelectedLayoutId(defaults[0].id);
      }
    } catch {
      const defaults = getSeededLayouts();
      setLayouts(defaults);
      if (defaults.length > 0) setSelectedLayoutId(defaults[0].id);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLayouts();
  }, []);

  const activeLayout = useMemo(() => {
    return layouts.find((l) => l.id === selectedLayoutId) || layouts[0] || null;
  }, [layouts, selectedLayoutId]);

  const handleSaveLayout = async () => {
    if (!activeLayout) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/configuration/layouts/${encodeURIComponent(activeLayout.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(activeLayout),
      });

      if (res.ok) {
        const updated = await res.json();
        setLayouts((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
        showToast(`Layout '${updated.name}' saved successfully!`);
      } else {
        showToast(`Layout '${activeLayout.name}' saved locally.`);
      }
    } catch {
      showToast(`Layout updated locally.`);
    } finally {
      setSaving(false);
    }
  };

  const handleAddSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLayout || !newSectionTitle) return;

    const newSec: FormLayoutSection = {
      id: "sec-" + Math.random().toString(36).substring(2, 8),
      title: newSectionTitle,
      description: newSectionDesc,
      columns: Number(newSectionCols),
      collapsible: true,
      defaultExpanded: true,
      fields: [],
    };

    setLayouts((prev) =>
      prev.map((l) =>
        l.id === activeLayout.id
          ? { ...l, sections: [...l.sections, newSec] }
          : l
      )
    );

    setNewSectionModalOpen(false);
    setNewSectionTitle("");
    setNewSectionDesc("");
    showToast(`Section '${newSec.title}' added!`);
  };

  const handleAddField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLayout || !targetSectionIdForField || !newFieldKey || !newFieldLabel) return;

    const newField: FormLayoutField = {
      fieldKey: newFieldKey,
      label: newFieldLabel,
      fieldType: newFieldType,
      required: newFieldRequired,
      readOnly: newFieldReadOnly,
      colSpan: Number(newFieldColSpan),
    };

    setLayouts((prev) =>
      prev.map((l) => {
        if (l.id !== activeLayout.id) return l;
        const updatedSecs = l.sections.map((sec) =>
          sec.id === targetSectionIdForField
            ? { ...sec, fields: [...sec.fields, newField] }
            : sec
        );
        return { ...l, sections: updatedSecs };
      })
    );

    setTargetSectionIdForField(null);
    setNewFieldKey("");
    setNewFieldLabel("");
    setNewFieldRequired(false);
    setNewFieldReadOnly(false);
    showToast(`Field '${newField.label}' added!`);
  };

  const handleDeleteSection = (secId: string) => {
    if (!activeLayout) return;
    setLayouts((prev) =>
      prev.map((l) =>
        l.id === activeLayout.id
          ? { ...l, sections: l.sections.filter((s) => s.id !== secId) }
          : l
      )
    );
    showToast("Section removed.");
  };

  const handleDeleteField = (secId: string, fieldKey: string) => {
    if (!activeLayout) return;
    setLayouts((prev) =>
      prev.map((l) => {
        if (l.id !== activeLayout.id) return l;
        const updatedSecs = l.sections.map((sec) =>
          sec.id === secId
            ? { ...sec, fields: sec.fields.filter((f) => f.fieldKey !== fieldKey) }
            : sec
        );
        return { ...l, sections: updatedSecs };
      })
    );
    showToast("Field removed.");
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
          <span className="font-medium text-[var(--max-text)]">Visual Form &amp; Layout Designer</span>
        </div>

        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-500 via-indigo-600 to-blue-600 text-white shadow-lg shadow-purple-500/20">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[var(--max-text)]">
                Visual Form &amp; Layout Designer
              </h1>
              <p className="text-xs text-[var(--max-text-secondary)]">
                Multi-column sections, collapsible field groups, role-based layout assignments, and responsive viewport simulator
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Viewport switch */}
            <div className="flex items-center rounded-xl border border-[var(--max-border)] bg-[var(--max-bg-secondary)] p-1 text-xs">
              <button
                onClick={() => setViewportMode("DESKTOP")}
                className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                  viewportMode === "DESKTOP"
                    ? "bg-[var(--max-primary)] text-white shadow"
                    : "text-[var(--max-text-secondary)] hover:text-[var(--max-text)]"
                }`}
                title="Desktop View"
              >
                🖥️ Desktop
              </button>
              <button
                onClick={() => setViewportMode("TABLET")}
                className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                  viewportMode === "TABLET"
                    ? "bg-[var(--max-primary)] text-white shadow"
                    : "text-[var(--max-text-secondary)] hover:text-[var(--max-text)]"
                }`}
                title="Tablet View"
              >
                📱 Tablet
              </button>
              <button
                onClick={() => setViewportMode("MOBILE")}
                className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                  viewportMode === "MOBILE"
                    ? "bg-[var(--max-primary)] text-white shadow"
                    : "text-[var(--max-text-secondary)] hover:text-[var(--max-text)]"
                }`}
                title="Mobile View"
              >
                📲 Mobile
              </button>
            </div>

            <button
              onClick={handleSaveLayout}
              disabled={saving}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-500/20 hover:opacity-90 transition disabled:opacity-50"
            >
              {saving ? "Saving Changes..." : "Save Layout"}
            </button>
          </div>
        </div>

        {/* Studio Workspace Layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Left Column: Layout Selector & Header Settings */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-[var(--max-border)] bg-[var(--max-bg-secondary)] p-5 shadow-sm">
              <h3 className="text-sm font-bold text-[var(--max-text)] mb-3">
                Layout Profiles
              </h3>
              <div className="space-y-2">
                {layouts.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => setSelectedLayoutId(l.id)}
                    className={`w-full text-left rounded-xl p-3 text-xs transition border ${
                      selectedLayoutId === l.id
                        ? "border-[var(--max-primary)] bg-[var(--max-primary)]/10 font-semibold text-[var(--max-text)]"
                        : "border-[var(--max-border)] bg-[var(--max-bg-primary)] text-[var(--max-text-secondary)] hover:border-[var(--max-primary)]/50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-[var(--max-text)]">{l.name}</span>
                      {l.isDefault && (
                        <span className="rounded bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 text-[9px] font-bold">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-[var(--max-text-secondary)]">
                      Target: {l.businessObjectName} • Role: {l.assignedRole}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {activeLayout && (
              <div className="rounded-2xl border border-[var(--max-border)] bg-[var(--max-bg-secondary)] p-5 shadow-sm space-y-3">
                <h3 className="text-sm font-bold text-[var(--max-text)]">
                  Header Highlights
                </h3>
                <p className="text-[11px] text-[var(--max-text-secondary)]">
                  Fields displayed as prominent KPI pills in the record header banner:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {activeLayout.headerHighlightFields.map((f) => (
                    <span
                      key={f}
                      className="rounded-lg border border-[var(--max-border)] bg-[var(--max-bg-primary)] px-2.5 py-1 font-mono text-[11px] text-purple-400 font-semibold"
                    >
                      {f}
                    </span>
                  ))}
                </div>

                <div className="border-t border-[var(--max-border)] pt-3">
                  <h4 className="text-xs font-bold text-[var(--max-text)] mb-1">Related Lists</h4>
                  <ul className="space-y-1 text-xs text-[var(--max-text-secondary)]">
                    {activeLayout.relatedLists.map((rl) => (
                      <li key={rl} className="flex items-center gap-1.5">
                        <span className="text-emerald-500">✓</span> {rl}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Center/Right: Live Visual Layout Canvas */}
          <div className="lg:col-span-3">
            <div
              className={`rounded-2xl border border-[var(--max-border)] bg-[var(--max-bg-secondary)] p-6 shadow-sm mx-auto transition-all ${
                viewportMode === "MOBILE"
                  ? "max-w-sm"
                  : viewportMode === "TABLET"
                  ? "max-w-xl"
                  : "w-full"
              }`}
            >
              {activeLayout ? (
                <div className="space-y-6">
                  {/* Simulated Record Header Banner */}
                  <div className="rounded-xl border border-[var(--max-border)] bg-[var(--max-bg-primary)] p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider font-bold text-[var(--max-text-secondary)]">
                        {activeLayout.businessObjectName} Record View
                      </span>
                      <h2 className="text-lg font-bold text-[var(--max-text)]">
                        Acme Industrial Technologies Corp
                      </h2>
                      <div className="text-xs text-[var(--max-text-secondary)] font-mono">
                        {activeLayout.headerSubtitleField}: billing@acme-corp.com
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {activeLayout.headerHighlightFields.map((hf) => (
                        <div
                          key={hf}
                          className="rounded-xl border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-center"
                        >
                          <div className="text-[9px] uppercase font-bold text-[var(--max-text-secondary)]">{hf}</div>
                          <div className="text-xs font-bold text-purple-400">ACTIVE • $50,000</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Section Controls */}
                  <div className="flex items-center justify-between border-b border-[var(--max-border)] pb-2">
                    <span className="text-xs font-bold text-[var(--max-text)]">
                      Form Layout Sections ({activeLayout.sections.length})
                    </span>
                    <button
                      onClick={() => setNewSectionModalOpen(true)}
                      className="rounded-lg border border-[var(--max-primary)]/40 bg-[var(--max-primary)]/10 px-3 py-1 text-xs font-semibold text-[var(--max-primary)] hover:bg-[var(--max-primary)]/20 transition"
                    >
                      + Add Section
                    </button>
                  </div>

                  {/* Sections List */}
                  {activeLayout.sections.map((section) => (
                    <div
                      key={section.id}
                      className="rounded-xl border border-[var(--max-border)] bg-[var(--max-bg-primary)] p-4 shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-3 border-b border-[var(--max-border)] pb-2">
                        <div>
                          <h4 className="text-sm font-bold text-[var(--max-text)]">
                            {section.title}
                          </h4>
                          {section.description && (
                            <p className="text-[11px] text-[var(--max-text-secondary)]">
                              {section.description}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="rounded bg-[var(--max-bg-secondary)] px-2 py-0.5 text-[10px] font-mono text-[var(--max-text-secondary)] border border-[var(--max-border)]">
                            {section.columns} Columns
                          </span>
                          <button
                            onClick={() => setTargetSectionIdForField(section.id)}
                            className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 hover:bg-emerald-500/20"
                          >
                            + Field
                          </button>
                          <button
                            onClick={() => handleDeleteSection(section.id)}
                            className="text-rose-500 hover:text-rose-400 text-xs p-1"
                            title="Delete Section"
                          >
                            ✕
                          </button>
                        </div>
                      </div>

                      {/* Fields Grid inside Section */}
                      <div
                        className={`grid gap-3 ${
                          viewportMode === "MOBILE" || section.columns === 1
                            ? "grid-cols-1"
                            : "grid-cols-2"
                        }`}
                      >
                        {section.fields.map((field) => (
                          <div
                            key={field.fieldKey}
                            className={`rounded-lg border border-[var(--max-border)] bg-[var(--max-bg-secondary)] p-3 relative group ${
                              field.colSpan === 2 && viewportMode !== "MOBILE"
                                ? "col-span-2"
                                : "col-span-1"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-xs font-semibold text-[var(--max-text)] flex items-center gap-1">
                                {field.label}
                                {field.required && <span className="text-rose-500">*</span>}
                              </label>

                              <div className="flex items-center gap-1.5">
                                <span className="rounded px-1.5 py-0.2 text-[9px] font-mono text-[var(--max-text-secondary)] bg-[var(--max-bg-primary)]">
                                  {field.fieldType}
                                </span>
                                {field.readOnly && (
                                  <span className="rounded px-1 text-[9px] font-bold text-amber-400 bg-amber-500/10">
                                    ReadOnly
                                  </span>
                                )}
                                <button
                                  onClick={() => handleDeleteField(section.id, field.fieldKey)}
                                  className="text-rose-500 hover:text-rose-400 text-xs opacity-0 group-hover:opacity-100 transition"
                                  title="Delete Field"
                                >
                                  ✕
                                </button>
                              </div>
                            </div>

                            <input
                              type="text"
                              disabled={field.readOnly}
                              placeholder={`Enter ${field.label.toLowerCase()}...`}
                              defaultValue={field.defaultValue || ""}
                              className="mt-1 w-full rounded-lg border border-[var(--max-border)] bg-[var(--max-bg-primary)] px-2.5 py-1.5 text-xs text-[var(--max-text)] outline-none focus:border-[var(--max-primary)] disabled:opacity-60"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center text-xs text-[var(--max-text-secondary)]">
                  Select a layout profile to open the visual designer canvas.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Add Section Modal */}
        {newSectionModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-[var(--max-border)] bg-[var(--max-bg-secondary)] p-6 shadow-2xl">
              <h3 className="text-base font-bold text-[var(--max-text)] mb-3">Add Layout Section</h3>
              <form onSubmit={handleAddSection} className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-[var(--max-text-secondary)]">Section Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Shipping & Logistics"
                    value={newSectionTitle}
                    onChange={(e) => setNewSectionTitle(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[var(--max-border)] bg-[var(--max-bg-primary)] px-3 py-2 text-xs text-[var(--max-text)] outline-none focus:border-[var(--max-primary)]"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--max-text-secondary)]">Description (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Fulfillment carrier, tracking numbers, and delivery date"
                    value={newSectionDesc}
                    onChange={(e) => setNewSectionDesc(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[var(--max-border)] bg-[var(--max-bg-primary)] px-3 py-2 text-xs text-[var(--max-text)] outline-none focus:border-[var(--max-primary)]"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--max-text-secondary)]">Layout Columns</label>
                  <select
                    value={newSectionCols}
                    onChange={(e) => setNewSectionCols(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-[var(--max-border)] bg-[var(--max-bg-primary)] px-3 py-2 text-xs text-[var(--max-text)]"
                  >
                    <option value={1}>1 Column (Stacked)</option>
                    <option value={2}>2 Columns (Standard Grid)</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setNewSectionModalOpen(false)}
                    className="rounded-xl border border-[var(--max-border)] px-3 py-1.5 text-xs text-[var(--max-text-secondary)]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-[var(--max-primary)] px-4 py-1.5 text-xs font-semibold text-white shadow"
                  >
                    Add Section
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Field Modal */}
        {targetSectionIdForField && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-[var(--max-border)] bg-[var(--max-bg-secondary)] p-6 shadow-2xl">
              <h3 className="text-base font-bold text-[var(--max-text)] mb-3">Add Field to Section</h3>
              <form onSubmit={handleAddField} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-[var(--max-text-secondary)]">Field Key</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. carrierTrackingId"
                      value={newFieldKey}
                      onChange={(e) => setNewFieldKey(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-[var(--max-border)] bg-[var(--max-bg-primary)] px-3 py-2 text-xs text-[var(--max-text)] outline-none focus:border-[var(--max-primary)]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[var(--max-text-secondary)]">Field Label</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Tracking Number"
                      value={newFieldLabel}
                      onChange={(e) => setNewFieldLabel(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-[var(--max-border)] bg-[var(--max-bg-primary)] px-3 py-2 text-xs text-[var(--max-text)] outline-none focus:border-[var(--max-primary)]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-[var(--max-text-secondary)]">Field Type</label>
                    <select
                      value={newFieldType}
                      onChange={(e) => setNewFieldType(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-[var(--max-border)] bg-[var(--max-bg-primary)] px-3 py-2 text-xs text-[var(--max-text)]"
                    >
                      <option value="TEXT">Text</option>
                      <option value="NUMBER">Number</option>
                      <option value="BOOLEAN">Boolean</option>
                      <option value="CHOICE">Choice</option>
                      <option value="REFERENCE">Reference</option>
                      <option value="DATE">Date</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[var(--max-text-secondary)]">Width Span</label>
                    <select
                      value={newFieldColSpan}
                      onChange={(e) => setNewFieldColSpan(Number(e.target.value))}
                      className="mt-1 w-full rounded-xl border border-[var(--max-border)] bg-[var(--max-bg-primary)] px-3 py-2 text-xs text-[var(--max-text)]"
                    >
                      <option value={1}>1 Column</option>
                      <option value={2}>Full Width (2 Columns)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-1">
                  <label className="flex items-center gap-2 text-xs text-[var(--max-text)]">
                    <input
                      type="checkbox"
                      checked={newFieldRequired}
                      onChange={(e) => setNewFieldRequired(e.target.checked)}
                      className="rounded"
                    />
                    Required Field
                  </label>
                  <label className="flex items-center gap-2 text-xs text-[var(--max-text)]">
                    <input
                      type="checkbox"
                      checked={newFieldReadOnly}
                      onChange={(e) => setNewFieldReadOnly(e.target.checked)}
                      className="rounded"
                    />
                    Read Only
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setTargetSectionIdForField(null)}
                    className="rounded-xl border border-[var(--max-border)] px-3 py-1.5 text-xs text-[var(--max-text-secondary)]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-[var(--max-primary)] px-4 py-1.5 text-xs font-semibold text-white shadow"
                  >
                    Add Field
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

function getSeededLayouts(): FormLayout[] {
  return [
    {
      id: "layout-cust-default",
      layoutKey: "layout_customer_master",
      name: "Customer Standard Master View",
      businessObjectId: "customer-bo-id",
      businessObjectName: "Customer",
      assignedRole: "ALL",
      isDefault: true,
      headerSubtitleField: "email",
      headerHighlightFields: ["creditLimit", "status", "tier"],
      sections: [
        {
          id: "c-sec-1",
          title: "Primary Account Details",
          description: "Core corporate and contact attributes",
          columns: 2,
          collapsible: true,
          defaultExpanded: true,
          fields: [
            { fieldKey: "name", label: "Account Name", fieldType: "TEXT", required: true, readOnly: false, colSpan: 1 },
            { fieldKey: "status", label: "Account Status", fieldType: "CHOICE", required: true, readOnly: false, colSpan: 1, defaultValue: "ACTIVE" },
            { fieldKey: "email", label: "Billing Email", fieldType: "TEXT", required: true, readOnly: false, colSpan: 1 },
            { fieldKey: "phone", label: "Telephone", fieldType: "TEXT", required: false, readOnly: false, colSpan: 1 },
          ],
        },
        {
          id: "c-sec-2",
          title: "Credit & Commercial Terms",
          description: "Financial parameters, approved credit limits and tax registration",
          columns: 2,
          collapsible: true,
          defaultExpanded: true,
          fields: [
            { fieldKey: "creditLimit", label: "Approved Credit Limit", fieldType: "NUMBER", required: true, readOnly: false, colSpan: 1, defaultValue: "50000" },
            { fieldKey: "tier", label: "Enterprise Tier", fieldType: "CHOICE", required: true, readOnly: false, colSpan: 1, defaultValue: "STANDARD" },
            { fieldKey: "isTaxExempt", label: "Tax Exempt Entity", fieldType: "BOOLEAN", required: false, readOnly: false, colSpan: 1, defaultValue: "false" },
            { fieldKey: "taxExemptReason", label: "Tax Exemption Reason", fieldType: "TEXT", required: false, readOnly: false, colSpan: 1 },
            { fieldKey: "taxId", label: "Federal Tax ID / EIN", fieldType: "TEXT", required: false, readOnly: false, colSpan: 2 },
          ],
        },
      ],
      relatedLists: ["Sales Orders", "Workflow Approvals", "Audit History"],
      updatedAt: new Date().toISOString(),
    },
    {
      id: "layout-so-default",
      layoutKey: "layout_sales_order_master",
      name: "Sales Order Enterprise Layout",
      businessObjectId: "sales-order-bo-id",
      businessObjectName: "Sales Order",
      assignedRole: "ALL",
      isDefault: true,
      headerSubtitleField: "customer",
      headerHighlightFields: ["netTotal", "status", "orderNumber"],
      sections: [
        {
          id: "so-sec-1",
          title: "Order Header Information",
          description: "Order references, customer assignment and workflow status",
          columns: 2,
          collapsible: true,
          defaultExpanded: true,
          fields: [
            { fieldKey: "orderNumber", label: "Sales Order #", fieldType: "TEXT", required: true, readOnly: true, colSpan: 1, defaultValue: "SO-AUTO" },
            { fieldKey: "status", label: "Order Status", fieldType: "CHOICE", required: true, readOnly: false, colSpan: 1, defaultValue: "DRAFT" },
            { fieldKey: "customer", label: "Customer Account", fieldType: "REFERENCE", required: true, readOnly: false, colSpan: 2 },
          ],
        },
        {
          id: "so-sec-2",
          title: "Financial Summary & Calculations",
          description: "Subtotal, discounts, calculated taxes, and final net amount",
          columns: 2,
          collapsible: true,
          defaultExpanded: true,
          fields: [
            { fieldKey: "subtotal", label: "Subtotal Amount", fieldType: "NUMBER", required: true, readOnly: false, colSpan: 1, defaultValue: "0.00" },
            { fieldKey: "discountAmount", label: "Discount Applied", fieldType: "NUMBER", required: false, readOnly: false, colSpan: 1, defaultValue: "0.00" },
            { fieldKey: "taxAmount", label: "Tax Total", fieldType: "NUMBER", required: false, readOnly: false, colSpan: 1, defaultValue: "0.00" },
            { fieldKey: "netTotal", label: "Net Order Total", fieldType: "NUMBER", required: true, readOnly: true, colSpan: 1, defaultValue: "0.00" },
          ],
        },
      ],
      relatedLists: ["Order Line Items", "Invoices", "Approval Decision Trail"],
      updatedAt: new Date().toISOString(),
    },
  ];
}
