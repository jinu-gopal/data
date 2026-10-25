"use client";

import { useState, useEffect } from "react";
import { PeopleProfile } from "@/lib/ec-core-store";
import { hasPermission, EnterpriseRoleKey } from "@/lib/rbp-store";

interface PeopleProfileTabProps {
  profiles: PeopleProfile[];
  onRefresh: () => void;
  onTriggerBanner: (msg: string) => void;
  initialProfileId?: string;
  activeRole?: EnterpriseRoleKey;
}

export default function PeopleProfileTab({
  profiles,
  onRefresh,
  onTriggerBanner,
  initialProfileId,
  activeRole = "SYSTEM_ADMIN",
}: PeopleProfileTabProps) {
  const [selectedId, setSelectedId] = useState<string>(() => {
    if (initialProfileId) {
      const match = profiles.find(
        (p) =>
          p.id === initialProfileId ||
          p.personal.firstName.toLowerCase() === initialProfileId.toLowerCase() ||
          `${p.personal.firstName} ${p.personal.lastName}`.toLowerCase() === initialProfileId.toLowerCase()
      );
      if (match) return match.id;
    }
    return profiles[0]?.id || "emp-001";
  });

  useEffect(() => {
    if (initialProfileId) {
      const match = profiles.find(
        (p) =>
          p.id === initialProfileId ||
          p.personal.firstName.toLowerCase() === initialProfileId.toLowerCase() ||
          `${p.personal.firstName} ${p.personal.lastName}`.toLowerCase() === initialProfileId.toLowerCase()
      );
      if (match) setSelectedId(match.id);
    }
  }, [initialProfileId, profiles]);

  const [activeSubTab, setActiveSubTab] = useState<
    "personal" | "job" | "compensation" | "workAuth" | "directDeposit" | "timeline"
  >("personal");
  const [searchTerm, setSearchTerm] = useState("");
  const [deptFilter, setDeptFilter] = useState("ALL");
  const [showEventModal, setShowEventModal] = useState(false);

  // RBP Permission checks
  const canViewProfile = hasPermission(activeRole, "WORKFORCE_PROFILE_VIEW");
  const canViewComp = hasPermission(activeRole, "WORKFORCE_COMPENSATION_VIEW");
  const canManageH2R = hasPermission(activeRole, "WORKFORCE_H2R_EXECUTE");

  // New Event Form State
  const [newEvent, setNewEvent] = useState({
    eventType: "COMPENSATION_REVISION",
    title: "Annual Merit Compensation Revision",
    description: "Annual performance cycle merit adjustment approved.",
    effectiveDate: new Date().toISOString().split("T")[0],
    previousValue: "",
    newValue: "",
  });

  if (!canViewProfile) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-8 text-center space-y-3">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600 font-bold text-lg">
          &times;
        </div>
        <h3 className="text-base font-extrabold text-slate-900">Access Restricted by Role-Based Permissions (RBP)</h3>
        <p className="text-xs text-slate-600 max-w-md mx-auto">
          Your current role (<strong className="font-semibold">{activeRole}</strong>) does not have the{" "}
          <code className="font-mono text-rose-700 bg-rose-100 px-1 py-0.5 rounded">WORKFORCE_PROFILE_VIEW</code>{" "}
          permission required to inspect employee People Profile dossiers.
        </p>
      </div>
    );
  }

  const filteredProfiles = profiles.filter((p) => {
    if (deptFilter !== "ALL" && p.job.department.toLowerCase() !== deptFilter.toLowerCase()) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        p.personal.firstName.toLowerCase().includes(q) ||
        p.personal.lastName.toLowerCase().includes(q) ||
        p.job.jobTitle.toLowerCase().includes(q) ||
        p.job.employeeNumber.toLowerCase().includes(q) ||
        p.job.positionCode.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const selectedProfile = profiles.find((p) => p.id === selectedId) || profiles[0];

  const handleAddTimelineEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProfile) return;
    try {
      const res = await fetch(`/api/workforce/people-profile/${selectedProfile.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newEvent,
          performedBy: "People Operations Lead",
        }),
      });

      if (res.ok) {
        onTriggerBanner(`Added audit timeline event for ${selectedProfile.personal.firstName}`);
        setShowEventModal(false);
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!selectedProfile) {
    return (
      <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
        No people profiles loaded in EC Core.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. EXECUTIVE HEADER BANNER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-2xl border border-slate-200/90 bg-white shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
              EC Core &bull; People Profile 360&deg;
            </span>
            <span className="text-xs text-slate-300">&bull;</span>
            <span className="text-xs font-semibold text-slate-500">
              Master Dossier &bull; Statutory & Organizational Records
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Enterprise People Profile Master Dossier
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Holistic 360-degree employee dossier covering biographical, job placement, compensation bands, work permits, direct deposits, and historical timeline.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-full">
            {profiles.length} Active EC Master Profiles
          </span>
        </div>
      </div>

      {/* 2. TWO-COLUMN LAYOUT: ROSTER ON LEFT, 360 DOSSIER ON RIGHT */}
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        
        {/* LEFT COLUMN: EMPLOYEE SEARCH & SELECTOR */}
        <div className="space-y-3">
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Search employee or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-full border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white transition"
            />

            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="w-full rounded-full border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-800 focus:outline-none"
            >
              <option value="ALL">All Departments</option>
              <option value="Executive">Executive</option>
              <option value="Engineering">Engineering</option>
              <option value="Operations">Operations</option>
              <option value="Finance">Finance</option>
              <option value="Sales">Sales</option>
            </select>
          </div>

          <div className="space-y-2 max-h-[680px] overflow-y-auto pr-1">
            {filteredProfiles.map((p) => {
              const isSelected = p.id === selectedProfile.id;
              const initials = `${p.personal.firstName[0]}${p.personal.lastName[0]}`;

              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedId(p.id)}
                  className={`w-full text-left rounded-2xl border p-3.5 transition-all flex items-center gap-3 cursor-pointer ${
                    isSelected
                      ? "bg-slate-900 border-slate-900 text-white shadow-sm"
                      : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs ${
                      isSelected
                        ? "bg-white text-slate-900"
                        : "bg-slate-100 text-slate-800 border border-slate-200"
                    }`}
                  >
                    {initials}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span
                        className={`font-bold text-xs truncate ${
                          isSelected ? "text-white" : "text-slate-900"
                        }`}
                      >
                        {p.personal.firstName} {p.personal.lastName}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold ml-1 ${
                          isSelected ? "text-emerald-300" : "text-emerald-700 font-bold"
                        }`}
                      >
                        {p.job.employeeNumber}
                      </span>
                    </div>

                    <div
                      className={`text-[11px] truncate mt-0.5 ${
                        isSelected ? "text-slate-300" : "text-slate-500"
                      }`}
                    >
                      {p.job.jobTitle}
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`text-[10px] font-mono ${
                          isSelected ? "text-slate-300" : "text-slate-500"
                        }`}
                      >
                        {p.job.positionCode}
                      </span>
                      <span className="text-slate-400 text-[10px]">&bull;</span>
                      <span
                        className={`text-[10px] ${
                          isSelected ? "text-slate-300" : "text-slate-600"
                        }`}
                      >
                        {p.job.department}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: 360° DOSSIER */}
        <div className="space-y-5">
          {/* TOP EMPLOYEE BANNER */}
          <div className="p-6 rounded-2xl border border-slate-200/90 bg-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-xl shadow-xs">
                {selectedProfile.personal.firstName[0]}
                {selectedProfile.personal.lastName[0]}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                    {selectedProfile.personal.firstName} {selectedProfile.personal.lastName}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {selectedProfile.status}
                  </span>
                </div>

                <p className="text-xs text-slate-700 font-semibold mt-0.5">
                  {selectedProfile.job.jobTitle} &bull;{" "}
                  <span className="font-mono font-bold text-blue-700">
                    {selectedProfile.job.positionCode}
                  </span>
                </p>

                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 mt-1 font-mono">
                  <span>ID: {selectedProfile.job.employeeNumber}</span>
                  <span>&bull;</span>
                  <span>{selectedProfile.personal.personalEmail}</span>
                  <span>&bull;</span>
                  <span>{selectedProfile.job.workLocation}</span>
                </div>
              </div>
            </div>

            {canManageH2R && (
              <button
                type="button"
                onClick={() => setShowEventModal(true)}
                className="rounded-full bg-slate-900 hover:bg-black text-white px-4 py-2 text-xs font-bold transition shadow-xs shrink-0"
              >
                + Record Audit Event
              </button>
            )}
          </div>

          {/* 6 SUB-TABS STRIP */}
          <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl border border-slate-200/90 bg-white shadow-2xs">
            {[
              { key: "personal", label: "1. Personal Info" },
              { key: "job", label: "2. Job Placement" },
              { key: "compensation", label: "3. Compensation & Pay" },
              { key: "workAuth", label: "4. Work Authorization" },
              { key: "directDeposit", label: "5. Direct Deposit" },
              { key: "timeline", label: `6. History Timeline (${selectedProfile.timeline.length})` },
            ].map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveSubTab(key as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeSubTab === key
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* SUB-TAB 1: PERSONAL INFO */}
          {activeSubTab === "personal" && (
            <div className="p-6 rounded-2xl border border-slate-200/90 bg-white space-y-5 text-xs shadow-xs">
              <h4 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2">
                Biographical & Statutory Identification
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Legal Name</span>
                  <span className="text-slate-900 font-bold text-sm">
                    {selectedProfile.personal.firstName} {selectedProfile.personal.lastName}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Preferred Name</span>
                  <span className="text-slate-900 font-bold">{selectedProfile.personal.preferredName || "None"}</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Date of Birth</span>
                  <span className="text-slate-900 font-bold font-mono">{selectedProfile.personal.dateOfBirth}</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Gender & Marital Status</span>
                  <span className="text-slate-900 font-bold">
                    {selectedProfile.personal.gender} &bull; {selectedProfile.personal.maritalStatus}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Nationality</span>
                  <span className="text-slate-900 font-bold">{selectedProfile.personal.nationality}</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Personal Phone</span>
                  <span className="text-slate-900 font-mono font-bold">{selectedProfile.personal.personalPhone}</span>
                </div>
              </div>

              <h4 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2 pt-2">
                Emergency Contact & Residential Address
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Primary Emergency Contact</span>
                  <div className="text-slate-900 font-bold text-sm">
                    {selectedProfile.personal.emergencyContact.name} ({selectedProfile.personal.emergencyContact.relationship})
                  </div>
                  <div className="text-slate-600 font-mono">
                    Phone: {selectedProfile.personal.emergencyContact.phone}
                  </div>
                  <div className="text-slate-500 font-mono text-[11px]">
                    Email: {selectedProfile.personal.emergencyContact.email}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Residential Address</span>
                  <div className="text-slate-900 font-bold">
                    {selectedProfile.personal.residentialAddress.street}
                  </div>
                  <div className="text-slate-600">
                    {selectedProfile.personal.residentialAddress.city},{" "}
                    {selectedProfile.personal.residentialAddress.state}{" "}
                    {selectedProfile.personal.residentialAddress.postalCode}
                  </div>
                  <div className="text-slate-500">
                    {selectedProfile.personal.residentialAddress.country}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SUB-TAB 2: JOB & PLACEMENT */}
          {activeSubTab === "job" && (
            <div className="p-6 rounded-2xl border border-slate-200/90 bg-white space-y-5 text-xs shadow-xs">
              <h4 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2">
                Organizational Assignment & Reporting Lines
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Position Code</span>
                  <span className="text-blue-700 font-bold font-mono text-sm">{selectedProfile.job.positionCode}</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Job Level & Band</span>
                  <span className="text-slate-900 font-bold">{selectedProfile.job.jobLevel}</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Direct Manager</span>
                  <span className="text-slate-900 font-bold">{selectedProfile.job.managerName}</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Business Unit & Division</span>
                  <span className="text-slate-900 font-bold">{selectedProfile.job.businessUnit}</span>
                  <span className="text-slate-500 block text-[11px]">{selectedProfile.job.division}</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Legal Entity</span>
                  <span className="text-slate-900 font-bold">{selectedProfile.job.legalEntity}</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Worksite Location</span>
                  <span className="text-slate-900 font-bold">{selectedProfile.job.workLocation}</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Hire Date & Service Tenure</span>
                  <span className="text-slate-900 font-bold font-mono">{selectedProfile.job.hireDate}</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Probation Status</span>
                  <span className="text-emerald-700 font-bold">Passed &bull; {selectedProfile.job.probationEndDate}</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Schedule & Standard Hours</span>
                  <span className="text-slate-900 font-bold font-mono">
                    {selectedProfile.job.standardWeeklyHours} hrs/week &bull; {selectedProfile.job.flsaStatus}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* SUB-TAB 3: COMPENSATION */}
          {activeSubTab === "compensation" && (
            <div className="p-6 rounded-2xl border border-slate-200/90 bg-white space-y-5 text-xs shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h4 className="text-sm font-extrabold text-slate-900">Compensation Structure & Grade Bands</h4>
                <span className="text-xs font-mono text-emerald-700 font-bold">
                  Compa-Ratio: {selectedProfile.compensation.compaRatio}
                </span>
              </div>

              {canViewComp ? (
                <>
                  {/* SALARY & BONUS HERO */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200">
                      <span className="text-emerald-800 text-[10px] uppercase tracking-wider block font-bold">
                        Annual Base Salary
                      </span>
                      <span className="text-2xl font-black text-slate-900 font-mono mt-1 block">
                        ${selectedProfile.compensation.annualBaseSalary.toLocaleString()}{" "}
                        <span className="text-xs font-normal text-slate-500">USD</span>
                      </span>
                      <span className="text-[10px] text-slate-600 mt-1 block">
                        Paid {selectedProfile.compensation.payFrequency.replace("_", " ")}
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-200">
                      <span className="text-purple-800 text-[10px] uppercase tracking-wider block font-bold">
                        Annual Target Incentive
                      </span>
                      <span className="text-2xl font-black text-slate-900 font-mono mt-1 block">
                        {selectedProfile.compensation.bonusTargetPct}% Target
                      </span>
                      <span className="text-[10px] text-slate-600 mt-1 block">
                        ${((selectedProfile.compensation.annualBaseSalary * selectedProfile.compensation.bonusTargetPct) / 100).toLocaleString()} USD Annual Target
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200">
                      <span className="text-blue-800 text-[10px] uppercase tracking-wider block font-bold">
                        Equity Grants & Stock
                      </span>
                      <span className="text-2xl font-black text-slate-900 font-mono mt-1 block">
                        {selectedProfile.compensation.equityGrantShares.toLocaleString()}{" "}
                        <span className="text-xs font-normal text-slate-500">RSUs</span>
                      </span>
                      <span className="text-[10px] text-slate-600 mt-1 block">
                        {selectedProfile.compensation.vestingSchedule}
                      </span>
                    </div>
                  </div>

                  {/* PAY GRADE BAND GAUGE */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-800">Pay Grade Range Penetration</span>
                      <span className="text-emerald-700">
                        Target Mid: ${selectedProfile.compensation.payGradeBand.mid.toLocaleString()} USD
                      </span>
                    </div>

                    <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden flex">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 via-emerald-500 to-amber-500"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.max(
                              20,
                              ((selectedProfile.compensation.annualBaseSalary - selectedProfile.compensation.payGradeBand.min) /
                                (selectedProfile.compensation.payGradeBand.max - selectedProfile.compensation.payGradeBand.min)) *
                                100
                            )
                          )}%`,
                        }}
                      />
                    </div>

                    <div className="flex justify-between text-[10px] font-mono text-slate-500">
                      <span>Min: ${selectedProfile.compensation.payGradeBand.min.toLocaleString()}</span>
                      <span>Mid: ${selectedProfile.compensation.payGradeBand.mid.toLocaleString()}</span>
                      <span>Max: ${selectedProfile.compensation.payGradeBand.max.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* BENEFITS ENROLLMENT */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-slate-500 text-[10px] uppercase font-bold block">Health & Medical Plan</span>
                      <span className="text-slate-900 font-bold">{selectedProfile.compensation.healthPlan}</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-slate-500 text-[10px] uppercase font-bold block">Retirement / Pension</span>
                      <span className="text-slate-900 font-bold">{selectedProfile.compensation.retirementPlan}</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="text-slate-400 font-bold text-sm">Confidential Compensation Information</div>
                  <p className="text-xs text-slate-500">
                    Your active role (<strong className="text-slate-700">{activeRole}</strong>) does not have the{" "}
                    <code className="font-mono text-xs bg-slate-200 text-slate-800 px-1 py-0.5 rounded">WORKFORCE_COMPENSATION_VIEW</code> permission.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* SUB-TAB 4: WORK AUTH */}
          {activeSubTab === "workAuth" && (
            <div className="p-6 rounded-2xl border border-slate-200/90 bg-white space-y-5 text-xs shadow-xs">
              <h4 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2">
                Immigration, Passport & Right to Work Compliance
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Citizenship Status</span>
                  <span className="text-slate-900 font-bold">{selectedProfile.workAuthorization.citizenship}</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Work Permit / Visa Class</span>
                  <span className="text-emerald-700 font-bold font-mono">
                    {selectedProfile.workAuthorization.workPermitType}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Permit Expiry Date</span>
                  <span className="text-slate-900 font-bold font-mono">
                    {selectedProfile.workAuthorization.permitExpiryDate}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Passport Serial (Masked)</span>
                  <span className="text-slate-900 font-bold font-mono">
                    {selectedProfile.workAuthorization.passportNumberMasked} (
                    {selectedProfile.workAuthorization.passportCountry})
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">I-9 Right to Work Audit</span>
                  <span className="text-emerald-700 font-bold">
                    &check; {selectedProfile.workAuthorization.i9VerificationStatus}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Background Verification (BGV)</span>
                  <span className="text-emerald-700 font-bold">
                    &check; {selectedProfile.workAuthorization.bgvStatus} &bull;{" "}
                    {selectedProfile.workAuthorization.bgvClearedDate}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* SUB-TAB 5: DIRECT DEPOSIT */}
          {activeSubTab === "directDeposit" && (
            <div className="p-6 rounded-2xl border border-slate-200/90 bg-white space-y-5 text-xs shadow-xs">
              <h4 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2">
                Electronic Direct Deposit & Bank Credentials
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Depository Institution</span>
                  <span className="text-slate-900 font-bold text-sm block">
                    {selectedProfile.directDeposit.bankName}
                  </span>
                  <span className="text-slate-600 font-mono text-[11px] block">
                    Account Type: {selectedProfile.directDeposit.accountType}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Masked Account Details</span>
                  <span className="text-emerald-800 font-bold font-mono text-sm block">
                    Routing: {selectedProfile.directDeposit.routingNumberMasked}
                  </span>
                  <span className="text-slate-700 font-mono text-[11px] block">
                    Account: {selectedProfile.directDeposit.accountNumberMasked} (100% Net Pay Allocation)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* SUB-TAB 6: TIMELINE & AUDIT TRAIL */}
          {activeSubTab === "timeline" && (
            <div className="p-6 rounded-2xl border border-slate-200/90 bg-white space-y-5 text-xs shadow-xs">
              <h4 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2">
                Comprehensive Employee Lifecycle Audit History
              </h4>

              <div className="space-y-4 pl-3 border-l-2 border-slate-200">
                {selectedProfile.timeline.map((ev) => (
                  <div key={ev.id} className="relative pl-6 space-y-1">
                    <div className="absolute -left-[19px] top-1 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white shadow-xs" />

                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{ev.title}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        {ev.eventType}
                      </span>
                    </div>

                    <p className="text-slate-600 text-xs">{ev.description}</p>

                    {(ev.previousValue || ev.newValue) && (
                      <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 pt-1">
                        <span>Before: {ev.previousValue}</span>
                        <span>&rarr;</span>
                        <span className="text-emerald-700 font-bold">After: {ev.newValue}</span>
                      </div>
                    )}

                    <div className="text-[10px] text-slate-400 font-mono pt-0.5">
                      Effective: {ev.effectiveDate} &bull; Authorized By: {ev.performedBy}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. TIMELINE EVENT MODAL */}
      {showEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">Record Audit Timeline Event</h3>
                <p className="text-xs text-slate-500">
                  Logs official HR lifecycle adjustment for {selectedProfile.personal.firstName}{" "}
                  {selectedProfile.personal.lastName}.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowEventModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddTimelineEvent} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 font-bold block mb-1">Event Type</label>
                <select
                  value={newEvent.eventType}
                  onChange={(e) => setNewEvent({ ...newEvent, eventType: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none"
                >
                  <option value="COMPENSATION_REVISION">Compensation Revision</option>
                  <option value="PROMOTION">Merit Promotion</option>
                  <option value="TRANSFER">Departmental Transfer</option>
                  <option value="LEAVE_OF_ABSENCE">Leave of Absence</option>
                  <option value="RETURN_FROM_LEAVE">Return from Leave</option>
                </select>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="e.g. Merit Promotion to Senior Staff"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Detailed Rationale</label>
                <textarea
                  rows={2}
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Previous Value</label>
                  <input
                    type="text"
                    value={newEvent.previousValue}
                    onChange={(e) => setNewEvent({ ...newEvent, previousValue: e.target.value })}
                    placeholder="e.g. $185,000"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">New Value</label>
                  <input
                    type="text"
                    value={newEvent.newValue}
                    onChange={(e) => setNewEvent({ ...newEvent, newValue: e.target.value })}
                    placeholder="e.g. $205,000"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEventModal(false)}
                  className="rounded-full border border-slate-300 bg-white px-4 py-2 text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-slate-900 hover:bg-black px-5 py-2 font-bold text-white shadow-xs transition"
                >
                  Append Event to Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
