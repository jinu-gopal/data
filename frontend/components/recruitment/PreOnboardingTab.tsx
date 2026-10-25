"use client";

import { useState } from "react";

export interface PreOnboardingRecord {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  requisitionId: string;
  requisitionTitle: string;
  department: string;
  targetStartDate: string;
  status: "INITIATED" | "IN_PROGRESS" | "READY_FOR_HIRE" | "COMPLETED";
  progressPct: number;
  tasks: {
    welcomePacketSent: boolean;
    identityDocumentsUploaded: boolean;
    taxFormsCompleted: boolean;
    confidentialitySigned: boolean;
    itHardwareRequested: boolean;
    emailAndAccountsProvisioned: boolean;
    orientationBuddyAssigned: boolean;
  };
  hardwareSelected?: "MACBOOK_PRO_M3" | "THINKPAD_P16" | "DELL_PRECISION";
  workEmailAllocated?: string;
  orientationBuddyName?: string;
  notes?: string;
}

interface PreOnboardingTabProps {
  records: PreOnboardingRecord[];
  onCompleteTask: (recordId: string, taskKey: string) => void;
  onHireToWorkforce: (record: PreOnboardingRecord) => void;
  onTriggerBanner: (msg: string) => void;
}

export default function PreOnboardingTab({
  records,
  onCompleteTask,
  onHireToWorkforce,
  onTriggerBanner,
}: PreOnboardingTabProps) {
  const [activeRecordId, setActiveRecordId] = useState<string | null>(records[0]?.id || null);

  const selectedRecord = records.find((r) => r.id === activeRecordId) || records[0];

  const handleToggle = (taskKey: string) => {
    if (!selectedRecord) return;
    onCompleteTask(selectedRecord.id, taskKey);
    onTriggerBanner(`✓ Updated task: ${taskKey}`);
  };

  return (
    <div className="space-y-6">
      {/* SECTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-2xl border border-slate-800 bg-slate-950">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="rounded-md bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
              MAX ERP RCM &rarr; EC Core Handover
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs text-slate-400">Pre-Day 1 Provisioning & Compliance</span>
          </div>
          <h2 className="text-xl font-black text-white">Pre-Onboarding & IT Provisioning Handover</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Bridge the gap between offer acceptance and Day-1 orientation. Track tax forms, hardware provisioning, and automated employee creation in Workforce Studio.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400">
            {records.filter((r) => r.status === "READY_FOR_HIRE").length} Candidates Ready for Day 1
          </span>
        </div>
      </div>

      {/* TWO COLUMN WORKSPACE: LIST ON LEFT, DETAIL & CHECKLIST ON RIGHT */}
      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
        {/* LEFT COLUMN: CANDIDATES LIST */}
        <div className="space-y-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block px-1">
            Incoming Hires ({records.length})
          </span>

          {records.map((r) => {
            const isSelected = selectedRecord?.id === r.id;

            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setActiveRecordId(r.id)}
                className={`w-full text-left rounded-2xl border p-4 transition ${
                  isSelected
                    ? "bg-slate-900 border-emerald-500/60 shadow-lg"
                    : "bg-slate-950 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white">{r.candidateName}</h4>
                  <span
                    className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                      r.status === "READY_FOR_HIRE"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                        : "bg-blue-500/10 text-blue-400 border border-blue-500/30"
                    }`}
                  >
                    {r.progressPct}% Ready
                  </span>
                </div>

                <p className="text-xs text-slate-400 mt-1">{r.requisitionTitle}</p>

                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-800/80 pt-2 font-mono">
                  <span>Start: {r.targetStartDate}</span>
                  <span>{r.department}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* RIGHT COLUMN: 7-STEP PRE-ONBOARDING GATES & PROVISIONING */}
        {selectedRecord && (
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-800 gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-white">{selectedRecord.candidateName}</h3>
                  <span className="rounded-md bg-slate-900 border border-slate-800 px-2 py-0.5 text-[10px] font-mono text-emerald-400 font-bold">
                    Target Start: {selectedRecord.targetStartDate}
                  </span>
                </div>
                <p className="text-xs text-blue-400 font-semibold">{selectedRecord.requisitionTitle} • {selectedRecord.department}</p>
              </div>

              {selectedRecord.progressPct === 100 && (
                <button
                  type="button"
                  onClick={() => onHireToWorkforce(selectedRecord)}
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 shadow-md transition"
                >
                  ✓ Complete Hire to Workforce Studio &rarr;
                </button>
              )}
            </div>

            {/* PROGRESS GAUGE */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <span className="text-slate-300">Pre-Day 1 Readiness Scorecard</span>
                <span className="text-emerald-400">{selectedRecord.progressPct}% Complete</span>
              </div>
              <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                  style={{ width: `${selectedRecord.progressPct}%` }}
                />
              </div>
            </div>

            {/* 7-STEP CHECKLIST */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300 block">Mandatory Onboarding Gates:</span>

              {[
                { key: "welcomePacketSent", label: "1. Welcome & Orientation Packet Dispatched", desc: "Sent pre-hire welcome documentation & first day itinerary." },
                { key: "identityDocumentsUploaded", label: "2. Identity Verification & Passport/Work Visa Uploaded", desc: "I-9 / Right to Work statutory verification documents." },
                { key: "taxFormsCompleted", label: "3. Tax Withholding Forms (W-4 / W-8BEN / Form 16)", desc: "Direct deposit banking credentials and tax elections." },
                { key: "confidentialitySigned", label: "4. Executed NDA & Proprietary Inventions Agreement", desc: "Countersigned IP assignment agreement safely archived." },
                { key: "itHardwareRequested", label: "5. IT Hardware Provisioning Ticket Created", desc: `Asset: ${selectedRecord.hardwareSelected || "MacBook Pro 16\" M3 Max"} (MDM Profile Staged)` },
                { key: "emailAndAccountsProvisioned", label: "6. Corporate Identity & SSO Email Allocated", desc: `Email: ${selectedRecord.workEmailAllocated || "candidate@max-erp.com"} (Google/M365 Provisioned)` },
                { key: "orientationBuddyAssigned", label: "7. Dedicated Onboarding Buddy Assigned", desc: `Assigned Peer Buddy: ${selectedRecord.orientationBuddyName || "Senior Engineer"}` },
              ].map(({ key, label, desc }) => {
                const isDone = (selectedRecord.tasks as any)[key];

                return (
                  <div
                    key={key}
                    onClick={() => handleToggle(key)}
                    className={`flex items-start justify-between rounded-xl border p-3.5 cursor-pointer transition ${
                      isDone
                        ? "bg-slate-900/80 border-emerald-500/40"
                        : "bg-slate-900/30 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold ${isDone ? "text-emerald-400" : "text-slate-200"}`}>
                          {label}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{desc}</p>
                    </div>

                    <span
                      className={`rounded-lg px-2 py-0.5 text-[10px] font-bold ${
                        isDone ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800 text-slate-500"
                      }`}
                    >
                      {isDone ? "✓ COMPLETED" : "PENDING"}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* IT ASSET & BUDDY INFO STRIP */}
            <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
              <div>
                <span className="text-slate-500 text-[10px] block">Provisioned Hardware</span>
                <span className="text-white font-bold">{selectedRecord.hardwareSelected || "MacBook Pro M3 Max"}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Corporate Mail</span>
                <span className="text-blue-400 font-bold">{selectedRecord.workEmailAllocated || "elena@max-erp.com"}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Orientation Buddy</span>
                <span className="text-emerald-400 font-bold">{selectedRecord.orientationBuddyName || "Rachel Green"}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
