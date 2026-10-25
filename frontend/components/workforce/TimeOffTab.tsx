"use client";

import { useState } from "react";
import { LeaveRequest, PeopleProfile } from "@/lib/ec-core-store";
import { EnterpriseRoleKey, hasPermission } from "@/lib/rbp-store";

interface TimeOffTabProps {
  requests: LeaveRequest[];
  profiles: PeopleProfile[];
  onRefresh: () => void;
  onTriggerBanner: (msg: string) => void;
  activeRole?: EnterpriseRoleKey;
}

export default function TimeOffTab({
  requests,
  profiles,
  onRefresh,
  onTriggerBanner,
  activeRole = "SYSTEM_ADMIN",
}: TimeOffTabProps) {
  const [selectedEmpId, setSelectedEmpId] = useState<string>(profiles[0]?.id || "emp-005");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectNotes, setRejectNotes] = useState("");

  const canApprove = hasPermission(activeRole, "WORKFORCE_TIME_OFF_APPROVE");

  const [requestForm, setRequestForm] = useState({
    employeeId: profiles[0]?.id || "emp-005",
    leaveType: "VACATION" as any,
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
    totalDays: 2,
    reason: "",
  });

  const selectedProfile = profiles.find((p) => p.id === selectedEmpId) || profiles[0];

  const filteredRequests = requests.filter((r) => {
    if (statusFilter !== "ALL" && r.status !== statusFilter) return false;
    return true;
  });

  const pendingRequests = requests.filter((r) => r.status === "PENDING");

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/workforce/time-off/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestForm),
      });

      if (res.ok) {
        onTriggerBanner("✓ Leave request submitted and routed to manager approval queue.");
        setShowRequestModal(false);
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReview = async (requestId: string, status: "APPROVED" | "REJECTED", notes = "") => {
    try {
      const res = await fetch(`/api/workforce/time-off/requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          reviewerName: "People Operations & Manager",
          notes,
        }),
      });

      if (res.ok) {
        onTriggerBanner(`✓ Leave request ${requestId} marked as ${status}.`);
        setRejectingId(null);
        setRejectNotes("");
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER SECTION - Professional Light Theme */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-2xl border border-slate-200/90 bg-white shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="rounded-md bg-teal-50 border border-teal-200 px-2 py-0.5 text-[11px] font-bold text-teal-700 uppercase tracking-wider">
              EC Core &bull; Time Off & Absence Engine
            </span>
            <span className="text-xs text-slate-400">&bull;</span>
            <span className="text-xs text-slate-500 font-medium">Statutory Accruals & Team Calendar</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Time Off & Absence Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Governs 6 statutory leave types, monthly accruals, absence calendar schedules, and manager approvals.
          </p>
        </div>

        <button
          onClick={() => setShowRequestModal(true)}
          className="rounded-xl bg-teal-600 hover:bg-teal-700 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition inline-flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Request Time Off
        </button>
      </div>

      {/* EMPLOYEE LEAVE BALANCE CARDS (6 TYPES) */}
      {selectedProfile && (
        <div className="p-5 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Personal Leave Wallet</span>
              <h3 className="text-base font-bold text-slate-900">
                Entitlement Balances: {selectedProfile.personal.firstName} {selectedProfile.personal.lastName}{" "}
                <span className="text-xs font-normal text-slate-500 font-mono">({selectedProfile.job.employeeNumber})</span>
              </h3>
            </div>

            <select
              value={selectedEmpId}
              onChange={(e) => setSelectedEmpId(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 font-medium focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
            >
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.personal.firstName} {p.personal.lastName} ({p.job.department})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {selectedProfile.leaveBalances.map((b) => (
              <div key={b.leaveType} className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-2 hover:border-teal-300 transition">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                    {b.leaveType}
                  </span>
                  <span className="text-[10px] text-teal-700 font-mono font-bold bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200/60">
                    {b.availableBalance}d left
                  </span>
                </div>

                <div className="text-2xl font-black text-slate-900 font-mono">{b.availableBalance}</div>

                <div className="text-[10px] text-slate-500 font-mono space-y-0.5 pt-1 border-t border-slate-200/70">
                  <div>Entitled: {b.totalEntitlement}d</div>
                  <div>Taken: {b.taken}d</div>
                  <div>Pending: {b.pending}d</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PENDING APPROVAL QUEUE (IF ANY) */}
      {pendingRequests.length > 0 && (
        <div className="p-5 rounded-2xl border border-amber-200 bg-amber-50/50 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse" />
              <h3 className="text-sm font-bold text-amber-900">
                Pending Manager Absence Approvals ({pendingRequests.length})
              </h3>
            </div>
            <span className="text-xs font-medium text-amber-700">Immediate Review Required</span>
          </div>

          <div className="space-y-2">
            {pendingRequests.map((r) => (
              <div
                key={r.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs shadow-2xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{r.employeeName}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200 font-semibold">
                      {r.leaveType} &bull; {r.totalDays} Days
                    </span>
                  </div>
                  <div className="text-slate-500 text-xs mt-0.5">
                    Dates: <span className="text-slate-800 font-mono font-medium">{r.startDate}</span> to{" "}
                    <span className="text-slate-800 font-mono font-medium">{r.endDate}</span> &bull; Reason: &ldquo;{r.reason}&rdquo;
                  </div>
                </div>

                {canApprove ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleReview(r.id, "APPROVED")}
                      className="rounded-lg bg-emerald-600 px-3 py-1.5 font-semibold text-white hover:bg-emerald-700 shadow-2xs transition"
                    >
                      ✓ Approve
                    </button>

                    <button
                      onClick={() => setRejectingId(r.id)}
                      className="rounded-lg bg-rose-50 border border-rose-200 px-3 py-1.5 font-semibold text-rose-700 hover:bg-rose-100 transition"
                    >
                      Reject
                    </button>
                  </div>
                ) : (
                  <span className="text-[11px] font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded">
                    RBP: Approval Restricted
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TEAM ABSENCE CALENDAR VISUALIZATION */}
      <div className="p-5 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Upcoming Team Absence Schedule</h3>
            <p className="text-xs text-slate-500">Scheduled and approved leaves across all operating units.</p>
          </div>
          <span className="text-xs font-medium text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200">
            Calendar Synchronized
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {requests
            .filter((r) => r.status === "APPROVED")
            .map((r) => (
              <div key={r.id} className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{r.employeeName}</span>
                  <span className="text-[10px] text-teal-700 font-semibold px-2 py-0.5 rounded bg-teal-50 border border-teal-200">
                    {r.leaveType}
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 font-mono">
                  {r.startDate} &rarr; {r.endDate} ({r.totalDays}d)
                </div>
                <div className="text-[11px] text-slate-500 italic truncate">
                  &ldquo;{r.reason}&rdquo;
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* REQUESTS TABLE */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Leave Requests History</h3>
          <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-lg p-0.5 text-xs">
            {["ALL", "PENDING", "APPROVED", "REJECTED"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${
                  statusFilter === st ? "bg-white text-slate-900 shadow-2xs font-bold" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200/90 bg-white shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Leave Type</th>
                <th className="px-4 py-3">Dates & Days</th>
                <th className="px-4 py-3">Reason</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Approver Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredRequests.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/70 transition">
                  <td className="px-4 py-3 font-bold text-slate-900">{r.employeeName}</td>
                  <td className="px-4 py-3 font-mono text-teal-700 font-bold">{r.leaveType}</td>
                  <td className="px-4 py-3 font-mono text-slate-700">
                    {r.startDate} to {r.endDate} ({r.totalDays}d)
                  </td>
                  <td className="px-4 py-3 text-slate-600 max-w-xs truncate">{r.reason}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        r.status === "APPROVED"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : r.status === "PENDING"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-[11px]">
                    {r.reviewNotes || <span className="text-slate-400 italic">None</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* REQUEST MODAL */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Submit Leave Request</h3>
              <button
                onClick={() => setShowRequestModal(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmitRequest} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 font-medium block mb-1">Employee *</label>
                <select
                  value={requestForm.employeeId}
                  onChange={(e) => setRequestForm({ ...requestForm, employeeId: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                >
                  {profiles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.personal.firstName} {p.personal.lastName} ({p.job.jobTitle})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-700 font-medium block mb-1">Leave Type *</label>
                <select
                  value={requestForm.leaveType}
                  onChange={(e) => setRequestForm({ ...requestForm, leaveType: e.target.value as any })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                >
                  <option value="VACATION">Annual Paid Vacation (25d entitlement)</option>
                  <option value="SICK">Medical & Health Absence (12d entitlement)</option>
                  <option value="PARENTAL">Parental Bonding Leave (60d entitlement)</option>
                  <option value="BEREAVEMENT">Compassionate Bereavement (5d entitlement)</option>
                  <option value="FLOATING">Floating Wellness Holiday (3d entitlement)</option>
                  <option value="STUDY">Professional Development / Study (5d entitlement)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-medium block mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={requestForm.startDate}
                    onChange={(e) => setRequestForm({ ...requestForm, startDate: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-medium block mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={requestForm.endDate}
                    onChange={(e) => setRequestForm({ ...requestForm, endDate: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-medium block mb-1">Total Absence Days</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={requestForm.totalDays}
                  onChange={(e) => setRequestForm({ ...requestForm, totalDays: parseInt(e.target.value) || 1 })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 font-mono focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                />
              </div>

              <div>
                <label className="text-slate-700 font-medium block mb-1">Reason / Notes</label>
                <textarea
                  rows={2}
                  required
                  value={requestForm.reason}
                  onChange={(e) => setRequestForm({ ...requestForm, reason: e.target.value })}
                  placeholder="Provide context for manager approval..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-slate-700 hover:bg-slate-50 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-teal-600 px-4 py-2 font-semibold text-white hover:bg-teal-700 shadow-xs transition"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REJECT NOTES MODAL */}
      {rejectingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Decline Leave Request</h3>
            <p className="text-xs text-slate-500">Provide an explanation note for the employee.</p>

            <textarea
              rows={3}
              value={rejectNotes}
              onChange={(e) => setRejectNotes(e.target.value)}
              placeholder="e.g. Critical release sprint during requested dates..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectingId(null)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReview(rejectingId, "REJECTED", rejectNotes)}
                className="rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 transition"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
