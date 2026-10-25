"use client";

import { useState } from "react";

interface DisqualifyCandidateModalProps {
  candidate: { id: string; fullName: string; requisitionTitle: string };
  onClose: () => void;
  onConfirmDisqualify: (reasonCode: string, delayHours: number, notes: string) => void;
}

const DISPOSITION_REASONS = [
  { code: "UNDER_QUALIFIED_EXPERIENCE", label: "Lacks Required Distributed Architecture Depth", category: "QUALIFICATION" },
  { code: "FAILED_TECHNICAL_SCREEN", label: "Did Not Meet Coding Assessment Benchmark Threshold", category: "ASSESSMENT" },
  { code: "COMPENSATION_MISMATCH", label: "Salary Expectations Exceed Approved Compensation Band", category: "COMPENSATION" },
  { code: "KNOCKOUT_QUESTIONS_FAILED", label: "Failed Mandatory Prescreen Knockout Criteria (Work Auth/Location)", category: "PRESCREEN" },
  { code: "FAILED_BGV_SCREENING", label: "Adverse Discrepancy in Background Verification Check", category: "BGV" },
  { code: "OFFER_DECLINED_COMPETING", label: "Candidate Withdrew / Accepted Counter-Offer", category: "WITHDRAWAL" },
  { code: "ROLE_FROZEN_OR_FILLED", label: "Requisition Filled by Prior Slot Candidate", category: "ADMINISTRATIVE" },
];

export default function DisqualifyCandidateModal({
  candidate,
  onClose,
  onConfirmDisqualify,
}: DisqualifyCandidateModalProps) {
  const [selectedReason, setSelectedReason] = useState(DISPOSITION_REASONS[0].code);
  const [delayOption, setDelayOption] = useState<number>(24); // 24 hours delayed rejection
  const [internalNotes, setInternalNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmDisqualify(selectedReason, delayOption, internalNotes);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-2xl bg-slate-950 border border-slate-800 p-6 shadow-2xl text-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <div>
            <span className="rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/30 px-2 py-0.5 text-[10px] font-bold uppercase">
              MAX Enterprise OFCCP Disposition Governance
            </span>
            <h3 className="text-base font-bold text-white mt-1">Disqualify / Reject Candidate</h3>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-500 block uppercase font-bold">Candidate Under Review</span>
            <div className="text-sm font-bold text-white mt-0.5">{candidate.fullName}</div>
            <div className="text-[11px] text-blue-400 font-semibold">{candidate.requisitionTitle}</div>
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">Official Disposition Reason Code (OFCCP Compliant) *</label>
            <select
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
              className="w-full rounded-xl bg-slate-900 border border-slate-800 p-2.5 text-white font-medium"
            >
              {DISPOSITION_REASONS.map((r) => (
                <option key={r.code} value={r.code}>
                  [{r.category}] {r.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">White-Glove Polite Notification Cadence</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { hours: 24, label: "Delay 24 Hours", sub: "(Recommended)" },
                { hours: 48, label: "Delay 48 Hours", sub: "(Weekend Buffering)" },
                { hours: 0, label: "Send Immediately", sub: "(Instant Dispatch)" },
              ].map(({ hours, label, sub }) => (
                <button
                  key={hours}
                  type="button"
                  onClick={() => setDelayOption(hours)}
                  className={`p-2.5 rounded-xl border text-left transition ${
                    delayOption === hours
                      ? "bg-slate-900 border-blue-500 text-white"
                      : "bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <div className="font-bold text-[11px]">{label}</div>
                  <div className="text-[9px] text-slate-500">{sub}</div>
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-500 mt-1.5">
              * Enterprise best practice: Delayed polite rejection notifications prevent robotic perception and protect your employer brand.
            </p>
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">Internal Recruiter Audit Notes</label>
            <textarea
              rows={2}
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              placeholder="Candidate feedback logged for audit trail and talent pool tagging..."
              className="w-full rounded-xl bg-slate-900 border border-slate-800 p-2.5 text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-800 px-4 py-2 text-xs font-bold text-slate-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-500 shadow-md"
            >
              Confirm Disqualification &rarr;
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
