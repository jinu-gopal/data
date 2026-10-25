"use client";

import { useState } from "react";
import { OrgEntity } from "@/lib/ec-core-store";
import BusinessObjectConfigModal from "./BusinessObjectConfigModal";
import { getBusinessObject, BusinessObjectFieldDef } from "@/lib/business-objects-schema";
import { hasPermission, EnterpriseRoleKey } from "@/lib/rbp-store";

interface OrgStructureTabProps {
  entities: OrgEntity[];
  onRefresh: () => void;
  onTriggerBanner: (msg: string) => void;
  activeRole?: EnterpriseRoleKey;
}

export default function OrgStructureTab({
  entities,
  onRefresh,
  onTriggerBanner,
  activeRole = "SYSTEM_ADMIN",
}: OrgStructureTabProps) {
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBoModal, setShowBoModal] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<OrgEntity | null>(null);

  // Load Legal Entity Schema from Business Objects
  const [leSchema, setLeSchema] = useState(() => getBusinessObject("LEGAL_ENTITY"));

  // Form state dynamically driven by Business Object fields
  const [newEntity, setNewEntity] = useState<Record<string, any>>({
    name: "",
    code: "",
    type: "LEGAL_ENTITY",
    headName: "",
    headTitle: "Managing Director",
    country: "United States",
    currency: "USD",
    budgetUsd: 25000000,
    description: "",
    statutoryAuditor: "Deloitte & Touche LLP",
    incorporationDate: "2021-03-15",
    taxIdNumber: "XX-XXXXXXX",
  });

  // RBP Permission checks
  const canManagePositions = hasPermission(activeRole, "WORKFORCE_POSITION_MANAGE");
  const canManageBO = hasPermission(activeRole, "CONFIG_BUSINESSOBJECTS_MANAGE");
  const canViewComp = hasPermission(activeRole, "WORKFORCE_COMPENSATION_VIEW");

  const categories = [
    { key: "ALL", label: "All Structures" },
    { key: "LEGAL_ENTITY", label: "Legal Entities (4)" },
    { key: "BUSINESS_UNIT", label: "Business Units (3)" },
    { key: "DIVISION", label: "Divisions (4)" },
    { key: "DEPARTMENT", label: "Departments (5)" },
    { key: "LOCATION", label: "Work Sites (4)" },
    { key: "COST_CENTER", label: "Cost Centers (5)" },
  ];

  const filtered = entities.filter((e) => {
    if (activeCategory !== "ALL" && e.type !== activeCategory) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        e.name.toLowerCase().includes(q) ||
        e.code.toLowerCase().includes(q) ||
        (e.headName && e.headName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const legalEntities = entities.filter((e) => e.type === "LEGAL_ENTITY");
  const totalHeadcount = legalEntities.reduce((sum, e) => sum + e.headcount, 0);
  const totalBudget = legalEntities.reduce((sum, e) => sum + (e.budgetUsd || 0), 0);

  const handleAddEntity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManagePositions) {
      alert("Access Denied: You lack WORKFORCE_POSITION_MANAGE permission.");
      return;
    }

    try {
      const res = await fetch("/api/workforce/org-structure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEntity),
      });
      if (res.ok) {
        const created = await res.json();
        onTriggerBanner(`Added ${created.type}: "${created.name}" (${created.code})`);
        setShowAddModal(false);
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. EXECUTIVE HEADER BANNER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-2xl border border-slate-200/90 bg-white shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="rounded-full bg-purple-50 border border-purple-200 px-2.5 py-0.5 text-[10px] font-bold text-purple-700 uppercase tracking-wider">
              EC Core &bull; Multi-Tier Enterprise Topology
            </span>
            <span className="text-xs text-slate-300">&bull;</span>
            <span className="text-xs font-semibold text-slate-500">
              Business Object Governed &bull; Jurisdictions & Rollups
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Organisation Structure Architecture
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
            5-tier enterprise hierarchy connecting Legal Entities, Business Units, Divisions, Departments, Locations, and Cost Centers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {/* Configure in Business Objects Button */}
          <button
            type="button"
            onClick={() => setShowBoModal(true)}
            disabled={!canManageBO}
            className={`rounded-full border px-4 py-2 text-xs font-semibold transition-all flex items-center gap-2 ${
              canManageBO
                ? "border-slate-300 bg-white text-slate-800 hover:bg-slate-50 shadow-2xs"
                : "border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
            title={canManageBO ? "Configure Legal Entity Schema under Business Objects" : "RBP Restricted: Admin Only"}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
              <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="currentColor" strokeWidth="1.6" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <span>Configure in Business Objects</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            disabled={!canManagePositions}
            className={`rounded-full px-5 py-2 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 ${
              canManagePositions
                ? "bg-slate-900 hover:bg-black text-white cursor-pointer"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            <span>+</span>
            <span>Add Org Unit</span>
          </button>
        </div>
      </div>

      {/* 2. ROLLUP ANALYTICS STRIP */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl border border-slate-200/90 bg-white shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Global Enterprise Parent</span>
          <span className="text-base sm:text-lg font-black text-slate-900 mt-1 block">MAX Global Holdings</span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Delaware C-Corp &bull; 4 Operating Sub-Entities</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200/90 bg-white shadow-2xs">
          <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider block">Enterprise Headcount</span>
          <span className="text-2xl font-black text-purple-700 mt-1 block">{totalHeadcount} Staff</span>
          <span className="text-[10px] text-purple-600 mt-0.5 block">100% Cost-Allocated</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200/90 bg-white shadow-2xs">
          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">Authorized Annual Opex</span>
          <span className="text-2xl font-black text-emerald-700 mt-1 block font-mono">
            {canViewComp ? `$${(totalBudget / 1000000).toFixed(1)}M USD` : "••••••"}
          </span>
          <span className="text-[10px] text-emerald-600 mt-0.5 block">Fiscal Year 2026 Consolidated</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200/90 bg-white shadow-2xs">
          <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block">Workplace Footprint</span>
          <span className="text-2xl font-black text-blue-700 mt-1 block">4 Hubs + Remote</span>
          <span className="text-[10px] text-blue-600 mt-0.5 block">SF, London, Singapore, Berlin</span>
        </div>
      </div>

      {/* 3. FILTER CATEGORY PILLS */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl border border-slate-200/90 bg-white shadow-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => setActiveCategory(cat.key)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeCategory === cat.key
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Filter structure by name or code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-64 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white transition"
        />
      </div>

      {/* 4. ENTITIES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item) => {
          const typeBadgeColor =
            item.type === "LEGAL_ENTITY"
              ? "bg-blue-50 text-blue-700 border-blue-200"
              : item.type === "BUSINESS_UNIT"
              ? "bg-purple-50 text-purple-700 border-purple-200"
              : item.type === "DIVISION"
              ? "bg-indigo-50 text-indigo-700 border-indigo-200"
              : item.type === "LOCATION"
              ? "bg-amber-50 text-amber-700 border-amber-200"
              : item.type === "COST_CENTER"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-slate-100 text-slate-700 border-slate-200";

          return (
            <div
              key={item.id}
              onClick={() => setSelectedEntity(item)}
              className="p-5 rounded-2xl border border-slate-200/90 bg-white hover:border-blue-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3 group shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${typeBadgeColor}`}>
                    {item.type.replace("_", " ")}
                  </span>
                  <span className="font-mono text-xs text-slate-500 font-bold">{item.code}</span>
                </div>

                <h3 className="text-base font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {item.name}
                </h3>
                {item.description && (
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{item.description}</p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                {item.headName && (
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Unit Leader</span>
                    <span className="text-slate-800 font-semibold">{item.headName}</span>
                  </div>
                )}

                {item.headcount > 0 && (
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Headcount</span>
                    <span className="text-slate-900 font-bold font-mono">{item.headcount} FTE</span>
                  </div>
                )}

                {item.budgetUsd ? (
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Annual Budget</span>
                    <span className="text-emerald-700 font-bold font-mono">
                      {canViewComp ? `$${(item.budgetUsd / 1000000).toFixed(1)}M USD` : "••••••"}
                    </span>
                  </div>
                ) : null}

                {item.country && (
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Jurisdiction</span>
                    <span className="text-slate-700 font-semibold">{item.country}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 5. DETAIL MODAL (LEGAL ENTITY & ORG UNIT) */}
      {selectedEntity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-mono text-purple-700 font-bold bg-purple-50 border border-purple-200 px-2 py-0.5 rounded">
                  {selectedEntity.code}
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">{selectedEntity.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEntity(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Structure Type</span>
                  <span className="text-slate-900 font-bold">{selectedEntity.type}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Parent Reference</span>
                  <span className="text-slate-900 font-bold font-mono">{selectedEntity.parentCode || "Corporate Root"}</span>
                </div>
              </div>

              {selectedEntity.type === "LEGAL_ENTITY" && (
                <div className="p-3 rounded-xl border border-purple-100 bg-purple-50/20 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 block">
                    Business Object: LEGAL_ENTITY Attributes
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-slate-500 text-[10px] block">Statutory Auditor:</span>
                      <span className="text-slate-800 font-semibold">{newEntity.statutoryAuditor || "Deloitte & Touche LLP"}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Incorporation Date:</span>
                      <span className="text-slate-800 font-semibold font-mono">{newEntity.incorporationDate || "2021-03-15"}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Tax ID / EIN:</span>
                      <span className="text-slate-800 font-semibold font-mono">{newEntity.taxIdNumber || "XX-XXXXXXX"}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Functional Currency:</span>
                      <span className="text-slate-800 font-semibold font-mono">{selectedEntity.currency || "USD"}</span>
                    </div>
                  </div>
                </div>
              )}

              {selectedEntity.description && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold mb-1">Corporate Mandate</span>
                  <p className="text-slate-700 leading-relaxed">{selectedEntity.description}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedEntity(null)}
                className="rounded-full bg-slate-900 text-white px-5 py-2 text-xs font-bold hover:bg-black transition shadow-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. ADD ORG UNIT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded uppercase">
                  Business Object: LEGAL_ENTITY & ORG
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">Add Enterprise Org Unit</h3>
                <p className="text-xs text-slate-500">
                  Fields and rules conform to the configured Business Object schema.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddEntity} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Classification Type *</label>
                  <select
                    value={newEntity.type}
                    onChange={(e) => setNewEntity({ ...newEntity, type: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900"
                  >
                    <option value="LEGAL_ENTITY">Legal Entity</option>
                    <option value="BUSINESS_UNIT">Business Unit</option>
                    <option value="DIVISION">Division</option>
                    <option value="DEPARTMENT">Department</option>
                    <option value="LOCATION">Work Location</option>
                    <option value="COST_CENTER">Cost Center</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">Unit Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. LE-US-05 or CC-SALES-101"
                    value={newEntity.code}
                    onChange={(e) => setNewEntity({ ...newEntity, code: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Unit / Entity Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MAX Americas Operating Corp"
                  value={newEntity.name}
                  onChange={(e) => setNewEntity({ ...newEntity, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Managing Director / Lead</label>
                  <input
                    type="text"
                    placeholder="e.g. Elena Vance"
                    value={newEntity.headName}
                    onChange={(e) => setNewEntity({ ...newEntity, headName: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">Officer Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Executive VP"
                    value={newEntity.headTitle}
                    onChange={(e) => setNewEntity({ ...newEntity, headTitle: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Country / Jurisdiction *</label>
                  <select
                    value={newEntity.country}
                    onChange={(e) => setNewEntity({ ...newEntity, country: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900"
                  >
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Singapore">Singapore</option>
                    <option value="Germany">Germany</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">Annual Budget Allocation (USD) *</label>
                  <input
                    type="number"
                    required
                    value={newEntity.budgetUsd}
                    onChange={(e) => setNewEntity({ ...newEntity, budgetUsd: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 font-mono"
                  />
                </div>
              </div>

              {/* Dynamic Legal Entity Business Object custom fields */}
              {newEntity.type === "LEGAL_ENTITY" && leSchema.fields.filter((f) => f.isCustom).map((f) => (
                <div key={f.key} className="p-2.5 rounded-xl border border-purple-100 bg-purple-50/20">
                  <label className="text-slate-800 font-bold block mb-1">
                    {f.label} {f.required && "*"}
                    <span className="text-[10px] text-purple-600 font-mono ml-2">(BO Custom)</span>
                  </label>
                  {f.type === "SELECT" ? (
                    <select
                      value={newEntity[f.key] || ""}
                      onChange={(e) => setNewEntity({ ...newEntity, [f.key]: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900"
                    >
                      {f.options?.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={f.type === "DATE" ? "date" : "text"}
                      value={newEntity[f.key] || ""}
                      onChange={(e) => setNewEntity({ ...newEntity, [f.key]: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900"
                    />
                  )}
                </div>
              ))}

              <div>
                <label className="text-slate-700 font-bold block mb-1">Description / Mandate</label>
                <textarea
                  rows={2}
                  value={newEntity.description}
                  onChange={(e) => setNewEntity({ ...newEntity, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-slate-900 hover:bg-black text-white px-6 py-2 text-xs font-bold transition shadow-xs"
                >
                  Add Unit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. BUSINESS OBJECT SCHEMA CONFIG MODAL */}
      {showBoModal && (
        <BusinessObjectConfigModal
          objectKey="LEGAL_ENTITY"
          onClose={() => setShowBoModal(false)}
          onSchemaUpdated={() => {
            setLeSchema(getBusinessObject("LEGAL_ENTITY"));
            onTriggerBanner("Business Object LEGAL_ENTITY schema updated successfully.");
          }}
        />
      )}
    </div>
  );
}
