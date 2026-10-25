"use client";

import { useState } from "react";
import { Position } from "@/lib/ec-core-store";
import PositionTreeDiagram from "./PositionTreeDiagram";
import BusinessObjectConfigModal from "./BusinessObjectConfigModal";
import { getBusinessObject, BusinessObjectFieldDef } from "@/lib/business-objects-schema";
import { hasPermission, EnterpriseRoleKey } from "@/lib/rbp-store";

interface PositionManagementTabProps {
  positions: Position[];
  onRefresh: () => void;
  onTriggerBanner: (msg: string) => void;
  onNavigateToProfile?: (employeeNameOrId: string) => void;
  activeRole?: EnterpriseRoleKey;
}

export default function PositionManagementTab({
  positions,
  onRefresh,
  onTriggerBanner,
  onNavigateToProfile,
  activeRole = "SYSTEM_ADMIN",
}: PositionManagementTabProps) {
  const [filterDept, setFilterDept] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"diagram" | "table">("diagram");
  const [selectedPos, setSelectedPos] = useState<Position | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBoModal, setShowBoModal] = useState(false);

  // Load fields dynamically from Business Object definition
  const [boSchema, setBoSchema] = useState(() => getBusinessObject("POSITION"));

  // Form state dynamically driven by Business Object fields
  const [posFormData, setPosFormData] = useState<Record<string, any>>({
    title: "",
    department: "Engineering",
    division: "Cloud Infrastructure & Platforms",
    businessUnit: "Enterprise Cloud & AI",
    legalEntity: "MAX Technologies Corp (US)",
    location: "REMOTE",
    jobLevel: "IC-4",
    jobBand: "Band 4",
    fte: 1.0,
    costCenter: "CC-ENG-101",
    reportsToPositionCode: "POS-ENG-002",
    minSalary: 140000,
    maxSalary: 175000,
    securityClearance: "None",
    criticalRoleTag: false,
    remotePolicy: "Hybrid (3d office)",
  });

  // RBP Permission checks
  const canViewPositions = hasPermission(activeRole, "WORKFORCE_POSITION_VIEW");
  const canManagePositions = hasPermission(activeRole, "WORKFORCE_POSITION_MANAGE");
  const canViewComp = hasPermission(activeRole, "WORKFORCE_COMPENSATION_VIEW");
  const canManageBO = hasPermission(activeRole, "CONFIG_BUSINESSOBJECTS_MANAGE");
  const canViewProfile = hasPermission(activeRole, "WORKFORCE_PROFILE_VIEW");

  if (!canViewPositions) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-8 text-center space-y-3">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600 font-bold text-lg">
          &times;
        </div>
        <h3 className="text-base font-extrabold text-slate-900">Access Restricted by Role-Based Permissions (RBP)</h3>
        <p className="text-xs text-slate-600 max-w-md mx-auto">
          Your current role (<strong className="font-semibold">{activeRole}</strong>) does not have the{" "}
          <code className="font-mono text-rose-700 bg-rose-100 px-1 py-0.5 rounded">WORKFORCE_POSITION_VIEW</code>{" "}
          permission required to view the Position Architecture and Hierarchy Tree.
        </p>
      </div>
    );
  }

  const filteredPositions = positions.filter((p) => {
    if (filterDept !== "ALL" && p.department.toLowerCase() !== filterDept.toLowerCase()) return false;
    if (filterStatus !== "ALL" && p.status !== filterStatus) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        p.positionCode.toLowerCase().includes(q) ||
        p.title.toLowerCase().includes(q) ||
        p.department.toLowerCase().includes(q) ||
        (p.incumbentName && p.incumbentName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const totalPositions = positions.length;
  const vacantPositions = positions.filter((p) => p.status === "VACANT").length;
  const filledPositions = positions.filter((p) => p.status === "FILLED").length;
  const frozenPositions = positions.filter((p) => p.status === "FROZEN").length;
  const totalFte = positions.reduce((acc, p) => acc + p.fte, 0);

  const handleCreatePosition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManagePositions) {
      alert("Access Denied: You lack WORKFORCE_POSITION_MANAGE permission.");
      return;
    }

    try {
      const res = await fetch("/api/workforce/positions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...posFormData,
          salaryRange: {
            min: Number(posFormData.minSalary || 100000),
            max: Number(posFormData.maxSalary || 150000),
            currency: "USD",
          },
        }),
      });

      if (res.ok) {
        const created = await res.json();
        onTriggerBanner(`Created position ${created.positionCode}: "${created.title}"`);
        setShowCreateModal(false);
        onRefresh();
      } else {
        const err = await res.json();
        alert(`Error: ${err.message || "Failed to create position"}`);
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleToggleFreeze = async (pos: Position) => {
    if (!canManagePositions) return;
    const nextStatus = pos.status === "FROZEN" ? "VACANT" : "FROZEN";
    try {
      const res = await fetch(`/api/workforce/positions/${pos.positionCode}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        onTriggerBanner(`Position ${pos.positionCode} status changed to ${nextStatus}`);
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleVacate = async (pos: Position) => {
    if (!canManagePositions) return;
    try {
      const res = await fetch(`/api/workforce/positions/${pos.positionCode}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "VACANT",
          incumbentId: null,
          incumbentName: null,
        }),
      });
      if (res.ok) {
        onTriggerBanner(`Position ${pos.positionCode} vacated and ready for talent backfill.`);
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. EXECUTIVE METRICS & ACTIONS BANNER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-2xl border border-slate-200/90 bg-white shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 uppercase tracking-wider">
              EC Core &bull; Position Architecture
            </span>
            <span className="text-xs text-slate-300">&bull;</span>
            <span className="text-xs font-semibold text-slate-500">
              Business Object Driven &bull; RBP Governed
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Position Management & Reporting Hierarchy
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Enterprise single-incumbent position registry with visual tree diagram, continuous FTE control, and field schemas governed by Business Objects.
          </p>
        </div>

        {/* Action Buttons */}
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
            title={canManageBO ? "Configure Position Schema under Business Objects" : "RBP Restricted: Admin Only"}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
              <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="currentColor" strokeWidth="1.6" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <span>Configure in Business Objects</span>
          </button>

          {/* Create Position Button */}
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            disabled={!canManagePositions}
            className={`rounded-full px-5 py-2 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 ${
              canManagePositions
                ? "bg-slate-900 hover:bg-black text-white cursor-pointer"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
            title={canManagePositions ? "Create New Position" : "RBP Restricted: Requires WORKFORCE_POSITION_MANAGE"}
          >
            <span>+</span>
            <span>New Position</span>
          </button>
        </div>
      </div>

      {/* 2. CORPORATE METRICS STRIP */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl border border-slate-200/90 bg-white shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Positions</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">{totalPositions} Slots</span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">{totalFte.toFixed(1)} Authorized FTE</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200/90 bg-white shadow-2xs">
          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">Filled Positions</span>
          <span className="text-2xl font-black text-emerald-700 mt-1 block">{filledPositions} Filled</span>
          <span className="text-[10px] text-emerald-600 mt-0.5 block">Incumbents Assigned</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200/90 bg-white shadow-2xs">
          <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">Vacant Positions</span>
          <span className="text-2xl font-black text-amber-700 mt-1 block">{vacantPositions} Vacant</span>
          <span className="text-[10px] text-amber-600 mt-0.5 block">Open for Talent Backfill</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200/90 bg-white shadow-2xs">
          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">Budget Frozen</span>
          <span className="text-2xl font-black text-slate-700 mt-1 block">{frozenPositions} Frozen</span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Spending Suspended</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200/90 bg-white shadow-2xs col-span-2 lg:col-span-1">
          <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider block">Business Object Schema</span>
          <span className="text-2xl font-black text-purple-700 mt-1 block">{boSchema.fields.length} Fields</span>
          <span className="text-[10px] text-purple-600 mt-0.5 block">100% Governed by BO</span>
        </div>
      </div>

      {/* 3. VIEW MODE SWITCHER & SEARCH BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl border border-slate-200/90 bg-white shadow-xs">
        <div className="flex items-center gap-2">
          {/* View Mode Segmented Pill */}
          <div className="flex items-center rounded-full bg-slate-100 p-1 border border-slate-200/80">
            <button
              type="button"
              onClick={() => setViewMode("diagram")}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === "diagram"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none">
                <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
                <rect x="8.5" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
                <path d="M6.5 10v2h11v-2M12 12v2" stroke="currentColor" strokeWidth="1.8" />
              </svg>
              <span>Diagram Tree</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === "table"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none">
                <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span>Data Table</span>
            </button>
          </div>
        </div>

        {/* Search input in table mode */}
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search code, title, incumbent..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white transition"
          />
          <span className="text-xs text-slate-500 font-mono hidden sm:inline-block">
            {filteredPositions.length} of {positions.length}
          </span>
        </div>
      </div>

      {/* 4. MAIN DISPLAY: DIAGRAM TREE VS TABLE */}
      {viewMode === "diagram" ? (
        <PositionTreeDiagram
          positions={positions}
          onSelectPosition={(pos) => setSelectedPos(pos)}
          onNavigateToProfile={onNavigateToProfile}
          activeRole={activeRole}
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3.5">Position Code</th>
                <th className="px-4 py-3.5">Title & Level</th>
                <th className="px-4 py-3.5">Department & Cost Center</th>
                <th className="px-4 py-3.5">FTE & Headcount</th>
                <th className="px-4 py-3.5">Assigned Incumbent</th>
                <th className="px-4 py-3.5">Reports To</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredPositions.map((pos) => {
                const isVacant = pos.status === "VACANT";
                const isFilled = pos.status === "FILLED";
                const isFrozen = pos.status === "FROZEN";

                return (
                  <tr key={pos.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-4 py-3.5 font-mono font-bold text-slate-900">
                      {pos.positionCode}
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900">{pos.title}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {pos.jobLevel} &bull; {pos.jobBand}
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="text-slate-800">{pos.department}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{pos.costCenter}</div>
                    </td>

                    <td className="px-4 py-3.5 font-mono">
                      <div className="text-slate-700">
                        {pos.currentHeadcount} / {pos.targetHeadcount} ({pos.fte} FTE)
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {canViewComp ? (
                          `$${(pos.salaryRange.min / 1000).toFixed(0)}k - $${(pos.salaryRange.max / 1000).toFixed(0)}k`
                        ) : (
                          "•••••• (Restricted)"
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      {isFilled && pos.incumbentName ? (
                        <div className="flex items-center gap-2">
                          <div>
                            <span className="font-bold text-slate-900 block">{pos.incumbentName}</span>
                            <span className="text-[10px] text-slate-500 block font-mono">{pos.incumbentId}</span>
                          </div>
                          {canViewProfile && onNavigateToProfile && (
                            <button
                              type="button"
                              onClick={() => onNavigateToProfile(pos.incumbentName || "")}
                              className="rounded bg-slate-100 hover:bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-blue-600 transition"
                            >
                              Profile &rarr;
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded text-[11px] font-semibold italic">
                          Unassigned (Vacant)
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      {pos.reportsToPositionCode ? (
                        <div className="text-slate-700">
                          <span className="font-mono text-[11px] text-slate-900 font-bold">{pos.reportsToPositionCode}</span>
                          <span className="text-[10px] text-slate-500 block">{pos.reportsToTitle}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px] italic">Root Executive</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide border ${
                          isFilled
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : isVacant
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-slate-100 text-slate-600 border-slate-300"
                        }`}
                      >
                        {pos.status}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-right space-x-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedPos(pos)}
                        className="rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-200 transition"
                      >
                        Details
                      </button>

                      {canManagePositions && isFilled && (
                        <button
                          type="button"
                          onClick={() => handleVacate(pos)}
                          className="rounded-full bg-amber-50 border border-amber-200 px-2.5 py-1 text-[11px] font-semibold text-amber-800 hover:bg-amber-100 transition"
                        >
                          Vacate
                        </button>
                      )}

                      {canManagePositions && (
                        <button
                          type="button"
                          onClick={() => handleToggleFreeze(pos)}
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold border transition ${
                            isFrozen
                              ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                              : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          {isFrozen ? "Unfreeze" : "Freeze"}
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

      {/* 5. POSITION DETAILS MODAL (DRIVEN BY BUSINESS OBJECTS) */}
      {selectedPos && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="font-mono text-xs text-blue-700 font-bold bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                  {selectedPos.positionCode}
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">{selectedPos.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPos(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            {/* Dynamic Business Object Fields Display */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Department & Division</span>
                <span className="text-slate-900 font-bold">{selectedPos.department}</span>
                <span className="text-slate-500 text-[11px] block">{selectedPos.division}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Job Band & Level</span>
                <span className="text-slate-900 font-bold">{selectedPos.jobLevel}</span>
                <span className="text-slate-500 text-[11px] block">{selectedPos.jobBand}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Salary Range (Target)</span>
                {canViewComp ? (
                  <span className="text-emerald-700 font-bold font-mono">
                    ${selectedPos.salaryRange.min.toLocaleString()} - ${selectedPos.salaryRange.max.toLocaleString()} USD
                  </span>
                ) : (
                  <span className="text-slate-400 font-mono italic">•••••• (RBP Restricted)</span>
                )}
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Reports-To Position</span>
                <span className="text-slate-900 font-bold font-mono">
                  {selectedPos.reportsToPositionCode || "None (Root)"}
                </span>
                <span className="text-slate-500 text-[11px] block">{selectedPos.reportsToTitle}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Legal Entity & Location</span>
                <span className="text-slate-900 font-bold">{selectedPos.legalEntity}</span>
                <span className="text-slate-500 text-[11px] block">{selectedPos.location}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Assigned Incumbent</span>
                {selectedPos.incumbentName ? (
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-emerald-800 font-bold">{selectedPos.incumbentName}</span>
                    {canViewProfile && onNavigateToProfile && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPos(null);
                          onNavigateToProfile(selectedPos.incumbentName || "");
                        }}
                        className="text-blue-600 hover:underline font-bold text-[11px]"
                      >
                        Profile &rarr;
                      </button>
                    )}
                  </div>
                ) : (
                  <span className="text-amber-800 italic">Position is currently VACANT</span>
                )}
              </div>
            </div>

            {/* Custom Business Object Fields */}
            {boSchema.fields.filter((f) => f.isCustom).length > 0 && (
              <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/30 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block">
                  Configured Business Object Custom Fields
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {boSchema.fields.filter((f) => f.isCustom).map((f) => (
                    <div key={f.key}>
                      <span className="text-slate-500 text-[10px] block">{f.label}</span>
                      <span className="text-slate-800 font-semibold">
                        {String(posFormData[f.key] ?? "Default Configured")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedPos(null)}
                className="rounded-full bg-slate-900 text-white px-5 py-2 text-xs font-bold hover:bg-black transition shadow-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. CREATE POSITION MODAL (FIELDS DERIVED FROM BUSINESS OBJECT) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded uppercase">
                  Business Object: POSITION
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">Create New Position Slot</h3>
                <p className="text-xs text-slate-500">
                  Form fields and data types are populated strictly from the Position Business Object.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreatePosition} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-700 font-bold block mb-1">Position Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Principal Distributed Systems Architect"
                  value={posFormData.title}
                  onChange={(e) => setPosFormData({ ...posFormData, title: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Department *</label>
                  <select
                    value={posFormData.department}
                    onChange={(e) => setPosFormData({ ...posFormData, department: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900"
                  >
                    <option value="Executive">Executive</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Operations">Operations</option>
                    <option value="Finance">Finance</option>
                    <option value="Sales">Sales</option>
                    <option value="People Operations">People Operations</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">Legal Entity *</label>
                  <select
                    value={posFormData.legalEntity}
                    onChange={(e) => setPosFormData({ ...posFormData, legalEntity: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900"
                  >
                    <option value="MAX Technologies Corp (US)">MAX Technologies Corp (US)</option>
                    <option value="MAX Cloud Systems Ltd (UK)">MAX Cloud Systems Ltd (UK)</option>
                    <option value="MAX APAC Operations Pte Ltd">MAX APAC Operations Pte Ltd</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Job Level *</label>
                  <select
                    value={posFormData.jobLevel}
                    onChange={(e) => setPosFormData({ ...posFormData, jobLevel: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900"
                  >
                    <option value="C-LEVEL">C-LEVEL (Executive)</option>
                    <option value="M-2">M-2 (Director/VP)</option>
                    <option value="M-1">M-1 (Lead/Manager)</option>
                    <option value="IC-5">IC-5 (Principal/Staff)</option>
                    <option value="IC-4">IC-4 (Senior Architect)</option>
                    <option value="IC-3">IC-3 (Mid-Level)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">Reports-To Position *</label>
                  <select
                    value={posFormData.reportsToPositionCode}
                    onChange={(e) => setPosFormData({ ...posFormData, reportsToPositionCode: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 font-mono"
                  >
                    {positions.map((p) => (
                      <option key={p.id} value={p.positionCode}>
                        {p.positionCode} - {p.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">FTE (Full-Time Equivalent) *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="1.0"
                    required
                    value={posFormData.fte}
                    onChange={(e) => setPosFormData({ ...posFormData, fte: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">Cost Center *</label>
                  <input
                    type="text"
                    required
                    value={posFormData.costCenter}
                    onChange={(e) => setPosFormData({ ...posFormData, costCenter: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 font-mono"
                  />
                </div>
              </div>

              {canViewComp && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-700 font-bold block mb-1">Min Base Salary (USD) *</label>
                    <input
                      type="number"
                      required
                      value={posFormData.minSalary}
                      onChange={(e) => setPosFormData({ ...posFormData, minSalary: Number(e.target.value) })}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-slate-700 font-bold block mb-1">Max Base Salary (USD) *</label>
                    <input
                      type="number"
                      required
                      value={posFormData.maxSalary}
                      onChange={(e) => setPosFormData({ ...posFormData, maxSalary: Number(e.target.value) })}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Dynamic Custom Fields from Business Objects */}
              {boSchema.fields.filter((f) => f.isCustom).map((f) => (
                <div key={f.key} className="p-2.5 rounded-xl border border-blue-100 bg-blue-50/20">
                  <label className="text-slate-800 font-bold block mb-1">
                    {f.label} {f.required && "*"}
                    <span className="text-[10px] text-blue-600 font-mono ml-2">(BO Custom)</span>
                  </label>
                  {f.type === "SELECT" ? (
                    <select
                      value={posFormData[f.key] || ""}
                      onChange={(e) => setPosFormData({ ...posFormData, [f.key]: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900"
                    >
                      {f.options?.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : f.type === "BOOLEAN" ? (
                    <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-semibold mt-1">
                      <input
                        type="checkbox"
                        checked={Boolean(posFormData[f.key])}
                        onChange={(e) => setPosFormData({ ...posFormData, [f.key]: e.target.checked })}
                        className="rounded border-slate-300 text-blue-600"
                      />
                      <span>Enable for this position</span>
                    </label>
                  ) : (
                    <input
                      type={f.type === "NUMBER" ? "number" : "text"}
                      value={posFormData[f.key] || ""}
                      onChange={(e) => setPosFormData({ ...posFormData, [f.key]: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900"
                    />
                  )}
                </div>
              ))}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-slate-900 hover:bg-black text-white px-6 py-2 text-xs font-bold transition shadow-xs"
                >
                  Create Position
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. BUSINESS OBJECT SCHEMA CONFIG MODAL */}
      {showBoModal && (
        <BusinessObjectConfigModal
          objectKey="POSITION"
          onClose={() => setShowBoModal(false)}
          onSchemaUpdated={() => {
            setBoSchema(getBusinessObject("POSITION"));
            onTriggerBanner("Business Object POSITION schema updated successfully.");
          }}
        />
      )}
    </div>
  );
}
