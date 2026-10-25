"use client";

import { useState, useMemo } from "react";
import { Position } from "@/lib/ec-core-store";
import { hasPermission, EnterpriseRoleKey } from "@/lib/rbp-store";

interface PositionTreeDiagramProps {
  positions: Position[];
  onSelectPosition: (pos: Position) => void;
  onNavigateToProfile?: (employeeNameOrId: string) => void;
  activeRole: EnterpriseRoleKey;
}

export default function PositionTreeDiagram({
  positions,
  onSelectPosition,
  onNavigateToProfile,
  activeRole,
}: PositionTreeDiagramProps) {
  const [filterDept, setFilterDept] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [collapsedBranches, setCollapsedBranches] = useState<Record<string, boolean>>({});
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  const canViewComp = hasPermission(activeRole, "WORKFORCE_COMPENSATION_VIEW");
  const canViewProfile = hasPermission(activeRole, "WORKFORCE_PROFILE_VIEW");

  // Build tree hierarchy
  const rootPositions = useMemo(() => {
    return positions.filter((p) => !p.reportsToPositionCode || p.positionCode === "POS-EXEC-001");
  }, [positions]);

  const toggleBranch = (positionCode: string) => {
    setCollapsedBranches((prev) => ({
      ...prev,
      [positionCode]: !prev[positionCode],
    }));
  };

  const getSubordinates = (parentCode: string) => {
    return positions.filter((p) => {
      if (p.reportsToPositionCode !== parentCode) return false;
      if (filterDept !== "ALL" && p.department.toLowerCase() !== filterDept.toLowerCase()) return false;
      if (statusFilter !== "ALL" && p.status !== statusFilter) return false;
      return true;
    });
  };

  // Node Card Component
  const renderNodeCard = (pos: Position, level: number = 0) => {
    const isFilled = pos.status === "FILLED";
    const isVacant = pos.status === "VACANT";
    const isFrozen = pos.status === "FROZEN";
    const subordinates = getSubordinates(pos.positionCode);
    const hasChildren = subordinates.length > 0;
    const isCollapsed = collapsedBranches[pos.positionCode];

    const initials = pos.incumbentName
      ? pos.incumbentName
          .split(" ")
          .map((n) => n[0])
          .join("")
          .slice(0, 2)
          .toUpperCase()
      : "??";

    return (
      <div key={pos.id} className="flex flex-col items-center">
        {/* THE ORG CHART NODE CARD */}
        <div
          onClick={() => onSelectPosition(pos)}
          className={`w-[290px] rounded-2xl border bg-white p-4 text-left shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer relative group ${
            isFrozen
              ? "border-slate-300 bg-slate-50/80"
              : isFilled
              ? "border-slate-200/90 hover:border-blue-400"
              : "border-amber-200 hover:border-amber-400"
          }`}
        >
          {/* Top Bar: Code Badge & Status */}
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
            <span className="font-mono text-[11px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
              {pos.positionCode}
            </span>

            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                isFilled
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : isVacant
                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                  : "bg-slate-100 text-slate-600 border border-slate-300"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isFilled ? "bg-emerald-500" : isVacant ? "bg-amber-500" : "bg-slate-400"
                }`}
              />
              {pos.status}
            </span>
          </div>

          {/* Position Title & Department */}
          <div className="mt-2.5">
            <h4 className="text-sm font-extrabold text-slate-900 tracking-tight leading-snug group-hover:text-blue-600 transition-colors">
              {pos.title}
            </h4>
            <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
              <span>{pos.department}</span>
              <span>&bull;</span>
              <span>{pos.location}</span>
            </div>
          </div>

          {/* ASSIGNED PERSON / INCUMBENT SECTION */}
          <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50/80 p-2.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Assigned Person
            </div>

            {isFilled && pos.incumbentName ? (
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white shadow-xs">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">
                      {pos.incumbentName}
                    </div>
                    <div className="text-[10px] font-mono text-slate-500">
                      {pos.incumbentId || "EMP-001"}
                    </div>
                  </div>
                </div>

                {canViewProfile && onNavigateToProfile && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigateToProfile(pos.incumbentName || "");
                    }}
                    className="shrink-0 rounded-lg bg-white border border-slate-200 px-2.5 py-1 text-[11px] font-bold text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-all shadow-2xs"
                    title="View 360° People Profile"
                  >
                    Profile &rarr;
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold text-amber-700 italic">
                  Position Unassigned (Vacant)
                </div>
                <span className="text-[10px] font-bold text-amber-600 bg-amber-100/60 px-1.5 py-0.5 rounded">
                  Open Slot
                </span>
              </div>
            )}
          </div>

          {/* Card Footer: FTE, Level, Comp Band */}
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
            <span className="font-medium">
              FTE: <strong className="text-slate-800">{pos.fte}</strong> &bull; {pos.jobLevel}
            </span>

            {canViewComp ? (
              <span className="font-mono font-bold text-slate-700">
                ${(pos.salaryRange.min / 1000).toFixed(0)}k - ${(pos.salaryRange.max / 1000).toFixed(0)}k
              </span>
            ) : (
              <span className="font-mono text-slate-400 italic">
                &bull;&bull;&bull;&bull; (Restricted)
              </span>
            )}
          </div>

          {/* Expand/Collapse Reports Badge */}
          {hasChildren && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleBranch(pos.positionCode);
              }}
              className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full border border-slate-300 bg-white px-2.5 py-0.5 text-[10px] font-bold text-slate-700 shadow-xs hover:bg-slate-100 transition-all z-10"
            >
              <span>{isCollapsed ? "+" : "-"}</span>
              <span>{subordinates.length} Reports</span>
            </button>
          )}
        </div>

        {/* SUBORDINATES BRANCH CONNECTOR & CARDS */}
        {hasChildren && !isCollapsed && (
          <div className="flex flex-col items-center w-full">
            {/* Vertical stem connecting parent to horizontal bus bar */}
            <div className="h-8 w-0.5 bg-slate-300" />

            {/* Subordinates container with horizontal bus bar */}
            <div className="relative flex items-start justify-center gap-6 pt-6">
              {/* Horizontal line across children */}
              {subordinates.length > 1 && (
                <div
                  className="absolute top-0 h-0.5 bg-slate-300"
                  style={{
                    left: `${(1 / (subordinates.length * 2)) * 100}%`,
                    right: `${(1 / (subordinates.length * 2)) * 100}%`,
                  }}
                />
              )}

              {/* Each child node branch */}
              {subordinates.map((sub) => (
                <div key={sub.id} className="relative flex flex-col items-center">
                  {/* Vertical drop line down into child card */}
                  <div className="absolute -top-6 h-6 w-0.5 bg-slate-300" />
                  {renderNodeCard(sub, level + 1)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* DIAGRAM TOOLBAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl border border-slate-200/90 bg-white shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#86bc25]" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
              Interactive Position Diagram
            </span>
          </div>

          <div className="h-4 w-px bg-slate-200 hidden sm:block" />

          {/* Department Filter */}
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition focus:outline-none"
          >
            <option value="ALL">All Departments</option>
            <option value="Executive">Executive</option>
            <option value="Engineering">Engineering</option>
            <option value="Operations">Operations</option>
            <option value="Finance">Finance</option>
            <option value="Sales">Sales</option>
            <option value="People Operations">People Operations</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="FILLED">Filled Only</option>
            <option value="VACANT">Vacant Only</option>
            <option value="FROZEN">Frozen Only</option>
          </select>
        </div>

        {/* Zoom & Expansion Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCollapsedBranches({})}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Expand All
          </button>

          <button
            type="button"
            onClick={() => {
              const allCollapsed: Record<string, boolean> = {};
              positions.forEach((p) => {
                if (p.positionCode !== "POS-EXEC-001") {
                  allCollapsed[p.positionCode] = true;
                }
              });
              setCollapsedBranches(allCollapsed);
            }}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Collapse Levels
          </button>

          <div className="flex items-center rounded-full border border-slate-200 bg-slate-50 p-0.5">
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(z - 10, 60))}
              className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold text-slate-600 hover:bg-white transition"
              title="Zoom Out"
            >
              -
            </button>
            <span className="px-2 text-[11px] font-mono font-bold text-slate-600">
              {zoomLevel}%
            </span>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(z + 10, 140))}
              className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold text-slate-600 hover:bg-white transition"
              title="Zoom In"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* CANVAS CONTAINER */}
      <div className="w-full overflow-x-auto rounded-2xl border border-slate-200/90 bg-[#f8fafc] p-10 min-h-[640px] shadow-xs">
        <div
          className="flex flex-col items-center min-w-max transition-transform duration-200 origin-top"
          style={{ transform: `scale(${zoomLevel / 100})` }}
        >
          {rootPositions.map((root) => renderNodeCard(root, 0))}
        </div>
      </div>
    </div>
  );
}
