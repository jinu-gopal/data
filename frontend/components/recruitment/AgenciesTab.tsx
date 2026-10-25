"use client";

import { useState } from "react";

export interface AgencyPartner {
  id: string;
  name: string;
  contactPerson: string;
  contactEmail: string;
  phone: string;
  commissionPct: number;
  guaranteePeriodDays: number;
  status: "ACTIVE" | "INACTIVE";
  totalCandidatesSubmitted: number;
  totalHired: number;
  totalCommissionsPaidUsd: number;
  specialty: string;
}

export interface AgencyCandidateSubmission {
  id: string;
  agencyId: string;
  agencyName: string;
  candidateName: string;
  candidateEmail: string;
  requisitionId: string;
  requisitionTitle: string;
  proposedSalaryUsd: number;
  calculatedFeeUsd: number;
  status: "SUBMITTED" | "IN_REVIEW" | "HIRED" | "REJECTED";
  submittedAt: string;
}

interface AgenciesTabProps {
  agencies: AgencyPartner[];
  submissions: AgencyCandidateSubmission[];
  requisitions: Array<{ id: string; reqNumber: string; title: string }>;
  onSubmitCandidate: (newSubmission: Partial<AgencyCandidateSubmission>) => void;
  onTriggerBanner: (msg: string) => void;
}

export default function AgenciesTab({
  agencies,
  submissions,
  requisitions,
  onSubmitCandidate,
  onTriggerBanner,
}: AgenciesTabProps) {
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedAgencyId, setSelectedAgencyId] = useState(agencies[0]?.id || "agency-01");
  const [candidateName, setCandidateName] = useState("");
  const [candidateEmail, setCandidateEmail] = useState("");
  const [selectedReqId, setSelectedReqId] = useState(requisitions[0]?.id || "");
  const [proposedSalary, setProposedSalary] = useState("165000");

  const agency = agencies.find((a) => a.id === selectedAgencyId) || agencies[0];
  const calculatedFee = ((Number(proposedSalary) * (agency?.commissionPct || 20)) / 100).toFixed(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const req = requisitions.find((r) => r.id === selectedReqId) || requisitions[0];

    onSubmitCandidate({
      id: `sub-${Date.now()}`,
      agencyId: agency.id,
      agencyName: agency.name,
      candidateName,
      candidateEmail,
      requisitionId: req.id,
      requisitionTitle: req.title,
      proposedSalaryUsd: Number(proposedSalary),
      calculatedFeeUsd: Number(calculatedFee),
      status: "SUBMITTED",
      submittedAt: new Date().toISOString(),
    });

    setShowSubmitModal(false);
    setCandidateName("");
    setCandidateEmail("");
    onTriggerBanner(`✓ Agency candidate ${candidateName} submitted with 6-month ownership locked!`);
  };

  return (
    <div className="space-y-6">
      {/* SECTION HEADER & SUBMIT BUTTON */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-2xl border border-slate-200/90 bg-white shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
              Enterprise Agency Portal
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500">External Staffing & Headhunter Management</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Staffing Agency Partners & Vendor Submissions</h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage external search agreements, placement commission rates (18-20%), 90-day replacement guarantees, and candidate ownership tracking.
          </p>
        </div>

        <button
          onClick={() => setShowSubmitModal(true)}
          className="rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition whitespace-nowrap self-start sm:self-auto"
        >
          + Submit Agency Candidate
        </button>
      </div>

      {/* AGENCY PARTNER ROSTER CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {agencies.map((a) => (
          <div key={a.id} className="rounded-2xl border border-slate-200/90 bg-white p-5 space-y-4 shadow-2xs">
            <div className="flex items-start justify-between">
              <div>
                <span className="rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold">
                  {a.commissionPct}% Placement Fee
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1.5">{a.name}</h3>
                <p className="text-xs text-slate-500">{a.specialty}</p>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono text-slate-400 block uppercase font-bold">Guarantee</span>
                <span className="text-xs font-semibold text-slate-700">{a.guaranteePeriodDays} Days Free Replacement</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-center font-mono">
              <div>
                <span className="text-slate-400 text-[10px] block font-medium">Submitted</span>
                <span className="text-slate-900 font-bold text-sm">{a.totalCandidatesSubmitted}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block font-medium">Hired</span>
                <span className="text-emerald-700 font-bold text-sm">{a.totalHired}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block font-medium">Commissions</span>
                <span className="text-amber-700 font-bold text-sm">${(a.totalCommissionsPaidUsd / 1000).toFixed(0)}k</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
              <span>Contact: <strong className="text-slate-700">{a.contactPerson}</strong> ({a.contactEmail})</span>
              <span className="font-mono text-slate-400">{a.phone}</span>
            </div>
          </div>
        ))}
      </div>

      {/* SUBMISSIONS TABLE */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xs">
        <div className="border-b border-slate-100 bg-slate-50/70 px-6 py-4 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Agency Candidate Pipeline & Ownership Tracking</h3>
          <span className="text-xs text-slate-500 font-mono font-medium">{submissions.length} Active Submissions</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Candidate Name</th>
                <th className="px-4 py-3.5">Agency Vendor</th>
                <th className="px-4 py-3.5">Requisition</th>
                <th className="px-4 py-3.5">Proposed Base</th>
                <th className="px-4 py-3.5">Calculated Fee</th>
                <th className="px-4 py-3.5">Ownership Lock</th>
                <th className="px-6 py-3.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {submissions.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/70 transition">
                  <td className="px-6 py-4 font-bold text-slate-900">
                    {s.candidateName}
                    <div className="font-mono text-[10px] text-slate-400 font-normal mt-0.5">{s.candidateEmail}</div>
                  </td>
                  <td className="px-4 py-4 font-semibold text-slate-800">{s.agencyName}</td>
                  <td className="px-4 py-4 text-blue-600 font-semibold">{s.requisitionTitle}</td>
                  <td className="px-4 py-4 font-mono font-bold text-slate-900">${s.proposedSalaryUsd.toLocaleString()} USD</td>
                  <td className="px-4 py-4 font-mono font-bold text-amber-700">${s.calculatedFeeUsd.toLocaleString()} USD</td>
                  <td className="px-4 py-4 text-[11px] font-mono text-emerald-700">
                    <span className="inline-flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      🔒 6-Month Protected
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span
                      className={`inline-block rounded-full px-2.5 py-1 text-xs font-bold border ${
                        s.status === "HIRED"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-blue-50 text-blue-700 border-blue-200"
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: SUBMIT CANDIDATE */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 p-6 shadow-2xl text-slate-800">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <span className="rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold uppercase">
                  Vendor Portal
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">Submit Agency Candidate</h3>
              </div>
              <button onClick={() => setShowSubmitModal(false)} className="text-slate-400 hover:text-slate-700 text-lg leading-none">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Staffing Agency Partner</label>
                <select
                  value={selectedAgencyId}
                  onChange={(e) => setSelectedAgencyId(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-slate-900 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  {agencies.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.commissionPct}% commission fee)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Candidate Full Name</label>
                  <input
                    type="text"
                    required
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    placeholder="e.g. Alex Rivera"
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Candidate Email</label>
                  <input
                    type="email"
                    required
                    value={candidateEmail}
                    onChange={(e) => setCandidateEmail(e.target.value)}
                    placeholder="e.g. alex.rivera@gmail.com"
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Target Requisition</label>
                <select
                  value={selectedReqId}
                  onChange={(e) => setSelectedReqId(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  {requisitions.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.reqNumber} — {r.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Proposed Annual Base Salary ($ USD)</label>
                <input
                  type="number"
                  value={proposedSalary}
                  onChange={(e) => setProposedSalary(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-slate-900 font-mono focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                <div>
                  <span className="text-emerald-900 font-bold block">Calculated Agency Fee:</span>
                  <span className="text-emerald-700 text-[11px]">
                    {agency?.commissionPct}% of ${Number(proposedSalary).toLocaleString()}
                  </span>
                </div>
                <div className="text-lg font-black text-emerald-800 font-mono">${Number(calculatedFee).toLocaleString()} USD</div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 shadow-xs"
                >
                  Lock Ownership & Submit &rarr;
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
