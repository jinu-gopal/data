"use client";

import { useState, useEffect } from "react";
import { H2RTransition, Position, PeopleProfile } from "@/lib/ec-core-store";
import { EnterpriseRoleKey, hasPermission } from "@/lib/rbp-store";

interface HireToRetireTabProps {
  transitions: H2RTransition[];
  positions: Position[];
  profiles: PeopleProfile[];
  onRefresh: () => void;
  onTriggerBanner: (msg: string) => void;
  activeRole?: EnterpriseRoleKey;
}

export default function HireToRetireTab({
  transitions,
  positions,
  profiles,
  onRefresh,
  onTriggerBanner,
  activeRole = "SYSTEM_ADMIN",
}: HireToRetireTabProps) {
  const [activeModal, setActiveModal] = useState<
    "NONE" | "HIRE" | "JOB_CHANGE" | "LOA" | "RETIRE"
  >("NONE");

  const [eligibleCandidates, setEligibleCandidates] = useState<any[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);

  const canExecute = hasPermission(activeRole, "WORKFORCE_H2R_EXECUTE");

  // New Hire Form State
  const [hireForm, setHireForm] = useState({
    candidateId: "cand-203",
    candidateName: "Emily Zhang",
    email: "emily.zhang@mit.alumni.edu",
    phone: "+1 (617) 555-2384",
    positionCode: "POS-ENG-084",
    requisitionId: "req-101",
    department: "Engineering",
    jobTitle: "Senior Full-Stack Cloud Architect",
    managerName: "Marcus Chen",
    annualSalary: 175000,
    startDate: new Date().toISOString().split("T")[0],
    workAuthorization: "US_CITIZEN",
  });

  // Job Change Form State
  const [jobChangeForm, setJobChangeForm] = useState({
    employeeId: profiles[0]?.id || "emp-006",
    newPositionCode: "POS-ENG-002",
    newDepartment: "Engineering",
    newJobTitle: "Lead Systems Architect",
    newSalary: 195000,
    newManagerName: "Marcus Chen",
    changeReason: "PROMOTION" as any,
    effectiveDate: new Date().toISOString().split("T")[0],
    notes: "Merit promotion for excellence in cloud microservices.",
  });

  // LOA Form State
  const [loaForm, setLoaForm] = useState({
    employeeId: profiles[0]?.id || "emp-005",
    loaAction: "START_LEAVE" as any,
    effectiveDate: new Date().toISOString().split("T")[0],
    reason: "Approved parental bonding leave.",
  });

  // Separation / Retirement Form State
  const [retireForm, setRetireForm] = useState({
    employeeId: profiles[0]?.id || "emp-001",
    separationType: "RETIREMENT" as any,
    effectiveDate: new Date().toISOString().split("T")[0],
    reason: "Honorable corporate retirement after distinguished tenure.",
    assetsReturned: ["Corporate Laptop", "Security Badge", "Corporate Credit Card", "Building FOB"],
    severancePayoutUsd: 25000,
  });

  const loadEligibleCandidates = async () => {
    setLoadingCandidates(true);
    try {
      const res = await fetch("/api/workforce/hire-to-retire/eligible-candidates");
      if (res.ok) {
        setEligibleCandidates(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCandidates(false);
    }
  };

  useEffect(() => {
    loadEligibleCandidates();
  }, []);

  const handleSelectCandidateForHire = (cand: any) => {
    setHireForm({
      candidateId: cand.candidateId,
      candidateName: cand.fullName,
      email: cand.email,
      phone: cand.phone || "+1 (555) 019-2234",
      positionCode: cand.targetPositionCode || "POS-ENG-084",
      requisitionId: cand.requisitionId,
      department: "Engineering",
      jobTitle: cand.requisitionTitle,
      managerName: "Marcus Chen",
      annualSalary: cand.offeredSalary || 165000,
      startDate: cand.targetStartDate || new Date().toISOString().split("T")[0],
      workAuthorization: "US_CITIZEN",
    });
    setActiveModal("HIRE");
  };

  const handleExecuteHire = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/workforce/hire-to-retire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ONBOARD_NEW_HIRE",
          ...hireForm,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        onTriggerBanner(
          `✓ Candidate ${hireForm.candidateName} successfully onboarded as employee ${data.employee.job.employeeNumber} into position ${hireForm.positionCode}.`
        );
        setActiveModal("NONE");
        loadEligibleCandidates();
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExecuteJobChange = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/workforce/hire-to-retire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "JOB_CHANGE",
          ...jobChangeForm,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        onTriggerBanner(
          `✓ Successfully executed ${jobChangeForm.changeReason} for ${data.employee.personal.firstName}. Assigned to position ${data.employee.job.positionCode}.`
        );
        setActiveModal("NONE");
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExecuteLOA = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/workforce/hire-to-retire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "LEAVE_OF_ABSENCE",
          ...loaForm,
        }),
      });

      if (res.ok) {
        onTriggerBanner(
          `✓ Leave of Absence updated: Employee status changed to ${
            loaForm.loaAction === "START_LEAVE" ? "ON_LEAVE" : "ACTIVE"
          }.`
        );
        setActiveModal("NONE");
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExecuteRetire = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/workforce/hire-to-retire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "RETIRE_SEPARATE",
          ...retireForm,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        onTriggerBanner(
          `✓ Separation completed for ${data.employee.personal.firstName} ${data.employee.personal.lastName}. Position ${
            data.vacatedPosition?.positionCode || "slot"
          } vacated for backfill.`
        );
        setActiveModal("NONE");
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const vacantPositions = positions.filter((p) => p.status === "VACANT");

  return (
    <div className="space-y-6">
      {/* HEADER SECTION - Light Professional Theme */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-2xl border border-slate-200/90 bg-white shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="rounded-md bg-amber-50 border border-amber-200 px-2 py-0.5 text-[11px] font-bold text-amber-800 uppercase tracking-wider">
              EC Core &bull; Hire-to-Retire (H2R) Studio
            </span>
            <span className="text-xs text-slate-400">&bull;</span>
            <span className="text-xs text-slate-500 font-medium">Total Lifecycle Transition Engine</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Hire-to-Retire Process Orchestration</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Governs end-to-end employee lifecycle: Candidate Offer Ingestion, Internal Promotions, Transfers, Leaves of Absence, and Offboarding / Retirement.
          </p>
        </div>

        {canExecute ? (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveModal("HIRE")}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition"
            >
              + Onboard New Hire
            </button>

            <button
              onClick={() => setActiveModal("JOB_CHANGE")}
              className="rounded-xl bg-blue-600 hover:bg-blue-700 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition"
            >
              + Promote / Transfer
            </button>

            <button
              onClick={() => setActiveModal("LOA")}
              className="rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 transition"
            >
              LOA Action
            </button>

            <button
              onClick={() => setActiveModal("RETIRE")}
              className="rounded-xl bg-rose-600 hover:bg-rose-700 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition"
            >
              Retire / Separate
            </button>
          </div>
        ) : (
          <span className="text-xs font-medium text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            RBP: Read-Only (H2R Execution Restricted)
          </span>
        )}
      </div>

      {/* 4 STAGE LIFECYCLE WORKFLOW MAP */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1 hover:border-emerald-300 transition">
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider">
            <span>Stage 1: Ingest & Onboard</span>
          </div>
          <p className="text-xs text-slate-900 font-bold">Candidate to Employee</p>
          <p className="text-[11px] text-slate-500">
            Converts accepted RCM offers, provisions MX-XXXX ID, and marks vacant position slot FILLED.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1 hover:border-blue-300 transition">
          <div className="flex items-center gap-2 text-blue-700 font-bold text-xs uppercase tracking-wider">
            <span>Stage 2: Grow & Promote</span>
          </div>
          <p className="text-xs text-slate-900 font-bold">Merit Promotion / Transfer</p>
          <p className="text-[11px] text-slate-500">
            Reassigns positions, updates reports-to hierarchy, adjusts compensation bands, and logs timeline.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1 hover:border-amber-300 transition">
          <div className="flex items-center gap-2 text-amber-700 font-bold text-xs uppercase tracking-wider">
            <span>Stage 3: Pause & Retain</span>
          </div>
          <p className="text-xs text-slate-900 font-bold">Leave of Absence (LOA)</p>
          <p className="text-[11px] text-slate-500">
            Governs parental, medical, or sabbatical pauses with seamless return-to-work reinstatement.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1 hover:border-rose-300 transition">
          <div className="flex items-center gap-2 text-rose-700 font-bold text-xs uppercase tracking-wider">
            <span>Stage 4: Offboard & Vacate</span>
          </div>
          <p className="text-xs text-slate-900 font-bold">Retirement / Separation</p>
          <p className="text-[11px] text-slate-500">
            Executes exit checklist, pays accrued PTO, and immediately resets position to VACANT for backfill.
          </p>
        </div>
      </div>

      {/* RCM INGESTION QUEUE: ACCEPTED CANDIDATES READY FOR DAY-1 ONBOARDING */}
      <div className="p-5 rounded-2xl border border-emerald-200 bg-emerald-50/40 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-emerald-200/60 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="text-base font-bold text-emerald-950">
                RCM Ingestion Queue: Candidates with Accepted Offers ({eligibleCandidates.length})
              </h3>
            </div>
            <p className="text-xs text-emerald-800/80 mt-0.5">
              These candidates have completed digital offer signing and BGV clearance. Click to onboard directly into EC Core.
            </p>
          </div>

          <span className="text-xs font-semibold text-emerald-800 bg-white px-2.5 py-1 rounded-md border border-emerald-200 shadow-2xs">
            Day-1 Ready
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {eligibleCandidates.map((cand) => (
            <div
              key={cand.candidateId}
              className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{cand.fullName}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 font-semibold">
                    {cand.status}
                  </span>
                </div>

                <div className="text-xs text-slate-700 font-medium mt-0.5">
                  {cand.requisitionTitle} &bull;{" "}
                  <span className="text-blue-700 font-mono font-bold">
                    Target: {cand.targetPositionCode}
                  </span>
                </div>

                <div className="text-[11px] text-slate-500 mt-1 font-mono">
                  Offered: ${cand.offeredSalary.toLocaleString()} USD &bull; Start: {cand.targetStartDate}
                </div>

                <p className="text-[11px] text-slate-600 italic mt-1">&ldquo;{cand.notes}&rdquo;</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-emerald-700 font-bold">&check; BGV {cand.bgvStatus}</span>

                {canExecute ? (
                  <button
                    onClick={() => handleSelectCandidateForHire(cand)}
                    className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 shadow-2xs transition"
                  >
                    &rarr; Complete Onboard into EC Core
                  </button>
                ) : (
                  <span className="text-[10px] text-slate-400">RBP Gated</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* COMPLETED TRANSITIONS AUDIT TRAIL */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Completed Lifecycle Transitions Log ({transitions.length})
          </h3>
          <span className="text-xs font-mono text-slate-500">Immutable Audit Trail</span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200/90 bg-white shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Transition Type</th>
                <th className="px-4 py-3">Effective Date</th>
                <th className="px-4 py-3">Position Transition</th>
                <th className="px-4 py-3">Salary & Org Impact</th>
                <th className="px-4 py-3">Initiated By / Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {transitions.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/70 transition">
                  <td className="px-4 py-3 font-bold text-slate-900">{t.employeeName}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        t.transitionType === "NEW_HIRE"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : t.transitionType === "PROMOTION"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : t.transitionType === "TRANSFER"
                          ? "bg-purple-50 text-purple-700 border border-purple-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}
                    >
                      {t.transitionType}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-600">{t.effectiveDate}</td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {t.details.positionCodeBefore && (
                      <span className="text-slate-400">{t.details.positionCodeBefore} &rarr; </span>
                    )}
                    <span className="text-blue-700 font-bold">{t.details.positionCodeAfter || "VACATED"}</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-600">
                    {t.details.salaryAfter ? `$${t.details.salaryAfter.toLocaleString()} USD` : "N/A"}
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-[11px]">
                    <span className="font-bold text-slate-800 block">{t.initiatedBy}</span>
                    <span className="truncate block max-w-xs">{t.notes}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================================
       * MODAL 1: ONBOARD NEW HIRE (RCM -> EC CORE)
       * ========================================================================= */}
      {activeModal === "HIRE" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Onboard Candidate to EC Core</h3>
                <p className="text-xs text-slate-500">
                  Converts candidate into an active employee dossier and marks target position as FILLED.
                </p>
              </div>
              <button
                onClick={() => setActiveModal("NONE")}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleExecuteHire} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-medium block mb-1">Candidate Full Name *</label>
                  <input
                    type="text"
                    required
                    value={hireForm.candidateName}
                    onChange={(e) => setHireForm({ ...hireForm, candidateName: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-medium block mb-1">Corporate / Personal Email *</label>
                  <input
                    type="email"
                    required
                    value={hireForm.email}
                    onChange={(e) => setHireForm({ ...hireForm, email: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-medium block mb-1">Target Position Slot *</label>
                  <select
                    value={hireForm.positionCode}
                    onChange={(e) => setHireForm({ ...hireForm, positionCode: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  >
                    {vacantPositions.map((p) => (
                      <option key={p.id} value={p.positionCode}>
                        {p.positionCode} &bull; {p.title} (VACANT)
                      </option>
                    ))}
                    {vacantPositions.length === 0 && (
                      <option value="POS-ENG-084">POS-ENG-084 &bull; Senior Full-Stack Cloud Architect</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 font-medium block mb-1">Department</label>
                  <input
                    type="text"
                    value={hireForm.department}
                    onChange={(e) => setHireForm({ ...hireForm, department: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-medium block mb-1">Annual Base Salary (USD)</label>
                  <input
                    type="number"
                    value={hireForm.annualSalary}
                    onChange={(e) => setHireForm({ ...hireForm, annualSalary: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-medium block mb-1">Start Date</label>
                  <input
                    type="date"
                    value={hireForm.startDate}
                    onChange={(e) => setHireForm({ ...hireForm, startDate: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveModal("NONE")}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-slate-700 hover:bg-slate-50 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700 shadow-xs transition"
                >
                  ✓ Complete Day-1 Hire
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
       * MODAL 2: JOB CHANGE / PROMOTION / TRANSFER
       * ========================================================================= */}
      {activeModal === "JOB_CHANGE" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Execute Job Change / Promotion</h3>
                <p className="text-xs text-slate-500">
                  Transitions employee to new position, vacating previous slot and updating compensation.
                </p>
              </div>
              <button
                onClick={() => setActiveModal("NONE")}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleExecuteJobChange} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 font-medium block mb-1">Employee *</label>
                <select
                  value={jobChangeForm.employeeId}
                  onChange={(e) => setJobChangeForm({ ...jobChangeForm, employeeId: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                >
                  {profiles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.personal.firstName} {p.personal.lastName} &bull; Current: {p.job.positionCode} ({p.job.jobTitle})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-medium block mb-1">Transition Type</label>
                  <select
                    value={jobChangeForm.changeReason}
                    onChange={(e) => setJobChangeForm({ ...jobChangeForm, changeReason: e.target.value as any })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  >
                    <option value="PROMOTION">Merit Promotion</option>
                    <option value="TRANSFER">Departmental Transfer</option>
                    <option value="LATERAL_MOVE">Lateral Role Shift</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 font-medium block mb-1">Target Position Code</label>
                  <select
                    value={jobChangeForm.newPositionCode}
                    onChange={(e) => setJobChangeForm({ ...jobChangeForm, newPositionCode: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  >
                    {positions.map((p) => (
                      <option key={p.id} value={p.positionCode}>
                        {p.positionCode} &bull; {p.title} ({p.status})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-medium block mb-1">Revised Base Salary (USD)</label>
                  <input
                    type="number"
                    value={jobChangeForm.newSalary}
                    onChange={(e) => setJobChangeForm({ ...jobChangeForm, newSalary: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-medium block mb-1">Effective Date</label>
                  <input
                    type="date"
                    value={jobChangeForm.effectiveDate}
                    onChange={(e) => setJobChangeForm({ ...jobChangeForm, effectiveDate: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-medium block mb-1">Executive Notes / Rationale</label>
                <textarea
                  rows={2}
                  value={jobChangeForm.notes}
                  onChange={(e) => setJobChangeForm({ ...jobChangeForm, notes: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveModal("NONE")}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-slate-700 hover:bg-slate-50 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 shadow-xs transition"
                >
                  Execute Transition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
       * MODAL 3: LEAVE OF ABSENCE (LOA)
       * ========================================================================= */}
      {activeModal === "LOA" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Leave of Absence (LOA) Action</h3>
              <button
                onClick={() => setActiveModal("NONE")}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleExecuteLOA} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 font-medium block mb-1">Employee *</label>
                <select
                  value={loaForm.employeeId}
                  onChange={(e) => setLoaForm({ ...loaForm, employeeId: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                >
                  {profiles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.personal.firstName} {p.personal.lastName} (Status: {p.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-700 font-medium block mb-1">Action</label>
                <select
                  value={loaForm.loaAction}
                  onChange={(e) => setLoaForm({ ...loaForm, loaAction: e.target.value as any })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                >
                  <option value="START_LEAVE">Start Leave of Absence (Status &rarr; ON_LEAVE)</option>
                  <option value="RETURN_FROM_LEAVE">Return to Work (Status &rarr; ACTIVE)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-700 font-medium block mb-1">Effective Date</label>
                <input
                  type="date"
                  value={loaForm.effectiveDate}
                  onChange={(e) => setLoaForm({ ...loaForm, effectiveDate: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                />
              </div>

              <div>
                <label className="text-slate-700 font-medium block mb-1">Reason / Notes</label>
                <textarea
                  rows={2}
                  value={loaForm.reason}
                  onChange={(e) => setLoaForm({ ...loaForm, reason: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveModal("NONE")}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-slate-700 hover:bg-slate-50 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-amber-600 px-4 py-2 font-semibold text-white hover:bg-amber-700 shadow-xs transition"
                >
                  Confirm LOA Action
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
       * MODAL 4: RETIREMENT / SEPARATION
       * ========================================================================= */}
      {activeModal === "RETIRE" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Retirement & Separation Offboarding</h3>
                <p className="text-xs text-slate-500">
                  Offboards employee, calculates severance/PTO payout, and vacates position for backfill.
                </p>
              </div>
              <button
                onClick={() => setActiveModal("NONE")}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleExecuteRetire} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 font-medium block mb-1">Employee *</label>
                <select
                  value={retireForm.employeeId}
                  onChange={(e) => setRetireForm({ ...retireForm, employeeId: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
                >
                  {profiles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.personal.firstName} {p.personal.lastName} &bull; Position: {p.job.positionCode} ({p.job.jobTitle})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-medium block mb-1">Separation Type</label>
                  <select
                    value={retireForm.separationType}
                    onChange={(e) => setRetireForm({ ...retireForm, separationType: e.target.value as any })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
                  >
                    <option value="RETIREMENT">Honorable Corporate Retirement</option>
                    <option value="RESIGNATION">Voluntary Resignation</option>
                    <option value="MUTUAL_SEPARATION">Mutual Separation Agreement</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 font-medium block mb-1">Effective Last Day</label>
                  <input
                    type="date"
                    value={retireForm.effectiveDate}
                    onChange={(e) => setRetireForm({ ...retireForm, effectiveDate: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-medium block mb-1">Reason / Official Documentation</label>
                <textarea
                  rows={2}
                  value={retireForm.reason}
                  onChange={(e) => setRetireForm({ ...retireForm, reason: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  Mandatory Asset Return Checklist:
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700">
                  <div>&check; Corporate MacBook / Laptop returned</div>
                  <div>&check; Security Building Badge deactivated</div>
                  <div>&check; Corporate Travel Credit Card cancelled</div>
                  <div>&check; Single Sign-On / Cloud Access revoked</div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveModal("NONE")}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-slate-700 hover:bg-slate-50 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-rose-600 px-4 py-2 font-semibold text-white hover:bg-rose-700 shadow-xs transition"
                >
                  ✓ Execute Separation & Vacate Position
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
