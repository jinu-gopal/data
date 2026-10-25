"use client";

import { useState } from "react";

export interface CandidateAssessment {
  id: string;
  candidateId: string;
  candidateName: string;
  requisitionId: string;
  requisitionTitle: string;
  testId: string;
  testTitle: string;
  provider: "SYSTEM_NATIVE" | "HACKERRANK" | "CODILITY" | "TESTGORILLA";
  category: "TECHNICAL_CODING" | "APTITUDE_LOGIC" | "SYSTEM_ARCHITECTURE" | "SALES_SIMULATION";
  durationMinutes: number;
  passingScorePct: number;
  candidateScorePct?: number;
  status: "ASSIGNED" | "IN_PROGRESS" | "PASSED" | "FAILED" | "EXPIRED";
  assignedAt: string;
  completedAt?: string;
  externalInviteUrl?: string;
  adminNotes?: string;
}

export interface BgvCheck {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  requisitionId: string;
  requisitionTitle: string;
  provider: "INTERNAL_HR" | "CHECKR_GLOBAL" | "FIRST_ADVANTAGE";
  status: "INITIATED" | "IN_PROGRESS" | "CLEARED" | "FLAGGED" | "REJECTED";
  checks: {
    criminalCheck: "PENDING" | "PASSED" | "FLAGGED";
    educationVerification: "PENDING" | "PASSED" | "FLAGGED";
    employmentHistory: "PENDING" | "PASSED" | "FLAGGED";
    identityAndDrug: "PENDING" | "PASSED" | "FLAGGED";
  };
  initiatedAt: string;
  completedAt?: string;
  assignedInvestigator: string;
  reportNotes?: string;
}

interface AssessmentsBgvTabProps {
  assessments: CandidateAssessment[];
  bgvChecks: BgvCheck[];
  candidates: Array<{ id: string; fullName: string; email: string; requisitionTitle: string; requisitionId: string }>;
  onAssignAssessment: (newAssessment: Partial<CandidateAssessment>) => void;
  onInitiateBgv: (newBgv: Partial<BgvCheck>) => void;
  onTriggerBanner: (msg: string) => void;
}

export default function AssessmentsBgvTab({
  assessments,
  bgvChecks,
  candidates,
  onAssignAssessment,
  onInitiateBgv,
  onTriggerBanner,
}: AssessmentsBgvTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<"ASSESSMENTS" | "BGV">("ASSESSMENTS");

  // Modal states
  const [showAssignTestModal, setShowAssignTestModal] = useState(false);
  const [showInitiateBgvModal, setShowInitiateBgvModal] = useState(false);

  const [selectedCandidateId, setSelectedCandidateId] = useState(candidates[0]?.id || "cand-201");
  const [selectedTestId, setSelectedTestId] = useState("test-tmpl-01");
  const [testProvider, setTestProvider] = useState<"SYSTEM_NATIVE" | "HACKERRANK" | "CODILITY">("SYSTEM_NATIVE");
  const [bgvProvider, setBgvProvider] = useState<"CHECKR_GLOBAL" | "FIRST_ADVANTAGE" | "INTERNAL_HR">("CHECKR_GLOBAL");

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cand = candidates.find((c) => c.id === selectedCandidateId) || candidates[0];

    onAssignAssessment({
      id: `ass-${Date.now()}`,
      candidateId: cand.id,
      candidateName: cand.fullName,
      requisitionId: cand.requisitionId,
      requisitionTitle: cand.requisitionTitle,
      testId: selectedTestId,
      testTitle: selectedTestId === "test-tmpl-01" ? "Java 21 & Distributed Microservices" : "HackerRank Senior Cloud Benchmark",
      provider: testProvider,
      category: "TECHNICAL_CODING",
      durationMinutes: 45,
      passingScorePct: 80,
      status: "ASSIGNED",
      assignedAt: new Date().toISOString(),
      externalInviteUrl: `https://${testProvider.toLowerCase()}.com/test/invite-${Date.now()}`,
    });

    setShowAssignTestModal(false);
    onTriggerBanner(`✓ Assessment link dispatched to ${cand.fullName}!`);
  };

  const handleBgvSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cand = candidates.find((c) => c.id === selectedCandidateId) || candidates[0];

    onInitiateBgv({
      id: `bgv-${Date.now()}`,
      candidateId: cand.id,
      candidateName: cand.fullName,
      candidateEmail: cand.email,
      requisitionId: cand.requisitionId,
      requisitionTitle: cand.requisitionTitle,
      provider: bgvProvider,
      status: "IN_PROGRESS",
      checks: {
        criminalCheck: "PASSED",
        educationVerification: "PENDING",
        employmentHistory: "PENDING",
        identityAndDrug: "PASSED",
      },
      initiatedAt: new Date().toISOString(),
      assignedInvestigator: bgvProvider === "CHECKR_GLOBAL" ? "Checkr Automated Suite" : "Enterprise Security Desk",
      reportNotes: "Background verification protocol initiated with candidate consent.",
    });

    setShowInitiateBgvModal(false);
    onTriggerBanner(`✓ Background Screening initiated for ${cand.fullName} via ${bgvProvider}!`);
  };

  return (
    <div className="space-y-6">
      {/* HEADER & CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-2xl border border-slate-200/90 bg-white shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="rounded-md bg-purple-50 border border-purple-200 px-2 py-0.5 text-[10px] font-bold text-purple-700 uppercase tracking-wider">
              Verification & Assessment Engine
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500">Technical Sandboxes & Security Screening</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Assessments & Background Verification (BGV)</h2>
          <p className="text-xs text-slate-500 mt-1">
            Administer technical coding sandboxes, CCAT logic benchmarks, and enterprise background security checks prior to offer formulation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeSubTab === "ASSESSMENTS" ? (
            <button
              onClick={() => setShowAssignTestModal(true)}
              className="rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition"
            >
              + Assign Assessment Test
            </button>
          ) : (
            <button
              onClick={() => setShowInitiateBgvModal(true)}
              className="rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition"
            >
              + Initiate BGV Screening
            </button>
          )}
        </div>
      </div>

      {/* SUB-TAB TOGGLE */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-semibold">
        <button
          onClick={() => setActiveSubTab("ASSESSMENTS")}
          className={`pb-3 border-b-2 transition flex items-center gap-2 ${
            activeSubTab === "ASSESSMENTS"
              ? "border-blue-600 text-blue-600 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <span>🧪 Technical Assessments ({assessments.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab("BGV")}
          className={`pb-3 border-b-2 transition flex items-center gap-2 ${
            activeSubTab === "BGV"
              ? "border-blue-600 text-blue-600 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <span>🛡️ Background Checks & BGV ({bgvChecks.length})</span>
        </button>
      </div>

      {/* VIEW 1: ASSESSMENTS */}
      {activeSubTab === "ASSESSMENTS" && (
        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xs">
          <div className="border-b border-slate-100 bg-slate-50/70 px-6 py-4 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Active Technical Evaluations</h3>
            <span className="text-xs text-slate-500 font-mono">{assessments.length} Tests Dispatched</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Candidate</th>
                  <th className="px-4 py-3.5">Assessment Title</th>
                  <th className="px-4 py-3.5">Provider</th>
                  <th className="px-4 py-3.5">Duration</th>
                  <th className="px-4 py-3.5">Score / Threshold</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Invite Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {assessments.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {a.candidateName}
                      <div className="font-mono text-[10px] text-slate-400 font-normal mt-0.5">{a.requisitionTitle}</div>
                    </td>
                    <td className="px-4 py-4 font-semibold text-slate-800">{a.testTitle}</td>
                    <td className="px-4 py-4">
                      <span className="rounded-md bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 text-[10px] font-bold">
                        {a.provider}
                      </span>
                    </td>
                    <td className="px-4 py-4 font-mono text-[11px] text-slate-600">{a.durationMinutes} mins</td>
                    <td className="px-4 py-4 font-mono text-[11px]">
                      {a.candidateScorePct !== undefined ? (
                        <span className={`font-bold ${a.candidateScorePct >= a.passingScorePct ? "text-emerald-700" : "text-rose-700"}`}>
                          {a.candidateScorePct}% (Pass: {a.passingScorePct}%)
                        </span>
                      ) : (
                        <span className="text-slate-400">Pending (Pass: {a.passingScorePct}%)</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                          a.status === "PASSED"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : a.status === "FAILED"
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : "bg-blue-50 text-blue-700 border-blue-200"
                        }`}
                      >
                        {a.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <a
                        href={a.externalInviteUrl || "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-slate-50 shadow-2xs transition inline-block"
                      >
                        Launch Sandbox &rarr;
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: BGV CHECKS */}
      {activeSubTab === "BGV" && (
        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xs">
          <div className="border-b border-slate-100 bg-slate-50/70 px-6 py-4 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Background Security Screenings</h3>
            <span className="text-xs text-slate-500 font-mono">{bgvChecks.length} Verifications Underway</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Candidate</th>
                  <th className="px-4 py-3.5">BGV Provider</th>
                  <th className="px-4 py-3.5">Criminal Record</th>
                  <th className="px-4 py-3.5">Degree Verification</th>
                  <th className="px-4 py-3.5">Past Employment</th>
                  <th className="px-4 py-3.5">Identity & Drug</th>
                  <th className="px-6 py-3.5 text-right">Overall Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {bgvChecks.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {b.candidateName}
                      <div className="font-mono text-[10px] text-slate-400 font-normal mt-0.5">{b.candidateEmail}</div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold">
                        {b.provider}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-[10px] font-bold font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        ✓ {b.checks.criminalCheck}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded border ${b.checks.educationVerification === "PASSED" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
                        {b.checks.educationVerification === "PASSED" ? "✓ PASSED" : "⏳ PENDING"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded border ${b.checks.employmentHistory === "PASSED" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
                        {b.checks.employmentHistory === "PASSED" ? "✓ PASSED" : "⏳ PENDING"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-[10px] font-bold font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        ✓ {b.checks.identityAndDrug}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-bold border ${
                          b.status === "CLEARED"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: ASSIGN TEST */}
      {showAssignTestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 p-6 shadow-2xl text-slate-800">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">Assign Technical Sandbox Test</h3>
              <button onClick={() => setShowAssignTestModal(false)} className="text-slate-400 hover:text-slate-700 text-lg leading-none">✕</button>
            </div>

            <form onSubmit={handleAssignSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Select Candidate</label>
                <select
                  value={selectedCandidateId}
                  onChange={(e) => setSelectedCandidateId(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  {candidates.map((c) => (
                    <option key={c.id} value={c.id}>{c.fullName} — {c.requisitionTitle}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Assessment Provider</label>
                <select
                  value={testProvider}
                  onChange={(e) => setTestProvider(e.target.value as any)}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  <option value="SYSTEM_NATIVE">MAX Native Cognitive & Coding Sandbox</option>
                  <option value="HACKERRANK">HackerRank Enterprise Suite</option>
                  <option value="CODILITY">Codility Automated Test Session</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Assessment Track</label>
                <select
                  value={selectedTestId}
                  onChange={(e) => setSelectedTestId(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  <option value="test-tmpl-01">Java 21 Virtual Threads & Spring Security (45m)</option>
                  <option value="test-tmpl-02">Executive Cognitive Aptitude & Logic CCAT (20m)</option>
                  <option value="test-tmpl-03">Full-Stack Cloud Architecture Benchmark (60m)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAssignTestModal(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 shadow-xs"
                >
                  Dispatch Assessment &rarr;
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: INITIATE BGV */}
      {showInitiateBgvModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 p-6 shadow-2xl text-slate-800">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">Initiate BGV Screening</h3>
              <button onClick={() => setShowInitiateBgvModal(false)} className="text-slate-400 hover:text-slate-700 text-lg leading-none">✕</button>
            </div>

            <form onSubmit={handleBgvSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Target Candidate</label>
                <select
                  value={selectedCandidateId}
                  onChange={(e) => setSelectedCandidateId(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  {candidates.map((c) => (
                    <option key={c.id} value={c.id}>{c.fullName} ({c.email})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Screening Vendor Partner</label>
                <select
                  value={bgvProvider}
                  onChange={(e) => setBgvProvider(e.target.value as any)}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  <option value="CHECKR_GLOBAL">Checkr Global Automated Screening</option>
                  <option value="FIRST_ADVANTAGE">First Advantage Enterprise Verification</option>
                  <option value="INTERNAL_HR">Internal HR Security Desk</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <span className="font-bold text-slate-800 block">Standard Checks Package:</span>
                <div>✓ 7-Year County, State & Federal Criminal Search</div>
                <div>✓ Highest Degree Academic Credential Verification</div>
                <div>✓ Prior 3 Employers Employment Verification</div>
                <div>✓ Global Sanctions & Terrorist Watchlist Screening</div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowInitiateBgvModal(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 shadow-xs"
                >
                  Authorize BGV Screening &rarr;
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
