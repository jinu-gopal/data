"use client";

import { useState, useMemo } from "react";

export interface InterviewScorecard {
  id: string;
  candidateId: string;
  candidateName: string;
  requisitionId: string;
  requisitionTitle: string;
  interviewerId: string;
  interviewerName: string;
  interviewerRole: string;
  roundType: "TECHNICAL_SCREEN" | "SYSTEM_ARCHITECTURE" | "BEHAVIORAL_CULTURE" | "EXECUTIVE_FINAL";
  overallRecommendation: "STRONG_HIRE" | "HIRE" | "LEANING_HIRE" | "LEANING_NO_HIRE" | "STRONG_NO_HIRE";
  competencyRatings: {
    technicalProficiency: number;
    systemDesignArchitecture: number;
    problemSolvingVelocity: number;
    communicationAndTeamwork: number;
    cultureAndValuesAdd: number;
  };
  strengthsSummary: string;
  areasOfConcern: string;
  notes: string;
  submittedAt: string;
  isBlindReview: boolean;
}

interface ScorecardsTabProps {
  scorecards: InterviewScorecard[];
  candidates: Array<{ id: string; fullName: string; requisitionTitle: string; requisitionId: string }>;
  activeApprover: { name: string; role: string };
  onSubmitScorecard: (newScorecard: Partial<InterviewScorecard>) => void;
  onTriggerBanner: (msg: string) => void;
}

export default function ScorecardsTab({
  scorecards,
  candidates,
  activeApprover,
  onSubmitScorecard,
  onTriggerBanner,
}: ScorecardsTabProps) {
  const [isBlindModeActive, setIsBlindModeActive] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState(candidates[0]?.id || "cand-201");
  const [roundType, setRoundType] = useState<"TECHNICAL_SCREEN" | "SYSTEM_ARCHITECTURE" | "BEHAVIORAL_CULTURE" | "EXECUTIVE_FINAL">("SYSTEM_ARCHITECTURE");
  const [overallVerdict, setOverallVerdict] = useState<"STRONG_HIRE" | "HIRE" | "LEANING_HIRE" | "LEANING_NO_HIRE" | "STRONG_NO_HIRE">("STRONG_HIRE");

  const [ratings, setRatings] = useState({
    technicalProficiency: 5,
    systemDesignArchitecture: 5,
    problemSolvingVelocity: 4,
    communicationAndTeamwork: 5,
    cultureAndValuesAdd: 5,
  });

  const [strengths, setStrengths] = useState("Demonstrated deep understanding of distributed state consensus and high-throughput messaging.");
  const [concerns, setConcerns] = useState("None noted during technical architecture evaluation.");

  // Pre-configured mock interview schedule queue for candidates in interview status
  const interviewQueue = useMemo(() => {
    return [
      {
        id: "cand-201",
        fullName: "Priya Menon",
        requisitionTitle: "Senior Java Developer",
        requisitionId: "REQ-2026-00123",
        round: "Round 2: System Architecture",
        roundType: "SYSTEM_ARCHITECTURE" as const,
        date: "Today, 2:00 PM",
        interviewers: ["David Chen (Lead)", "Maria Lopez"],
        status: "Completed - Needs Rating",
        statusColor: "amber",
      },
      {
        id: "cand-203",
        fullName: "Lucas Schneider",
        requisitionTitle: "Full Stack Engineer",
        requisitionId: "REQ-2026-00126",
        round: "Round 1: Technical Coding",
        roundType: "TECHNICAL_SCREEN" as const,
        date: "Today, 4:30 PM",
        interviewers: ["Sarah Connor", "Alex Vance"],
        status: "In Progress",
        statusColor: "blue",
      },
      {
        id: "cand-205",
        fullName: "Emily Zhang",
        requisitionTitle: "Staff Cloud Architect",
        requisitionId: "REQ-2026-00124",
        round: "Round 3: Leadership & Core Values",
        roundType: "BEHAVIORAL_CULTURE" as const,
        date: "Tomorrow, 10:00 AM",
        interviewers: ["Elena Rostova (HR)", "John Smith"],
        status: "Scheduled",
        statusColor: "emerald",
      },
      {
        id: "cand-208",
        fullName: "Sneha S",
        requisitionTitle: "Backend Microservices Lead",
        requisitionId: "REQ-2026-00128",
        round: "Round 4: Executive Committee Final",
        roundType: "EXECUTIVE_FINAL" as const,
        date: "Tomorrow, 3:30 PM",
        interviewers: ["VP Engineering", "Maria Lopez"],
        status: "Scheduled",
        statusColor: "emerald",
      },
    ];
  }, []);

  const openRatingForCandidate = (candId: string, preRound?: "TECHNICAL_SCREEN" | "SYSTEM_ARCHITECTURE" | "BEHAVIORAL_CULTURE" | "EXECUTIVE_FINAL") => {
    setSelectedCandidateId(candId);
    if (preRound) setRoundType(preRound);
    setShowSubmitModal(true);
  };

  const handleScorecardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cand = candidates.find((c) => c.id === selectedCandidateId) || candidates[0];

    onSubmitScorecard({
      candidateId: cand.id,
      candidateName: cand.fullName,
      requisitionId: cand.requisitionId,
      requisitionTitle: cand.requisitionTitle,
      interviewerId: "emp-current",
      interviewerName: activeApprover.name,
      interviewerRole: activeApprover.role,
      roundType,
      overallRecommendation: overallVerdict,
      competencyRatings: ratings,
      strengthsSummary: strengths,
      areasOfConcern: concerns,
      notes: `Evaluation submitted by ${activeApprover.name} under enterprise anti-bias guidelines.`,
      isBlindReview: false,
    });

    setShowSubmitModal(false);
    onTriggerBanner(`✓ Structured Scorecard submitted for ${cand.fullName} (${overallVerdict.replace("_", " ")})!`);
  };

  // Group scorecards by candidate for Hiring Committee Matrix
  const candidateScorecardMap = candidates.map((cand) => {
    const list = scorecards.filter((s) => s.candidateId === cand.id);
    const avgScore =
      list.length > 0
        ? (
            list.reduce(
              (acc, s) =>
                acc +
                (s.competencyRatings.technicalProficiency +
                  s.competencyRatings.systemDesignArchitecture +
                  s.competencyRatings.problemSolvingVelocity +
                  s.competencyRatings.communicationAndTeamwork +
                  s.competencyRatings.cultureAndValuesAdd) /
                  5,
              0
            ) / list.length
          ).toFixed(1)
        : null;

    return {
      candidate: cand,
      scorecards: list,
      avgScore,
    };
  }).filter((c) => c.scorecards.length > 0);

  return (
    <div className="space-y-6">
      {/* SECTION HEADER & CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-2xl border border-slate-200/90 bg-white shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="rounded-md bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-700 uppercase tracking-wider">
              Scorecards & Interviews
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500">Anti-Bias Blind Evaluation & Consensus Rubrics</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Structured Interview Scorecards & Debriefs</h2>
          <p className="text-xs text-slate-500 mt-1">
            View active candidates in interview status, rate them across 5 core competencies, and compare panel consensus with blind scoring isolation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* BLIND MODE SWITCH */}
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs">
            <span className="font-semibold text-slate-700">Anti-Bias Blind Mode:</span>
            <button
              type="button"
              onClick={() => {
                setIsBlindModeActive(!isBlindModeActive);
                onTriggerBanner(
                  isBlindModeActive
                    ? "Blind Mode Disabled: All panel scorecards are now visible."
                    : "Blind Mode Enabled: Colleague scorecards hidden until personal evaluation is submitted."
                );
              }}
              className={`h-5 w-9 rounded-full transition p-0.5 flex items-center ${
                isBlindModeActive ? "bg-amber-500 justify-end" : "bg-slate-300 justify-start"
              }`}
            >
              <span className="h-4 w-4 rounded-full bg-white shadow-xs" />
            </button>
            <span className={`text-[10px] font-mono font-bold ${isBlindModeActive ? "text-amber-700" : "text-slate-400"}`}>
              {isBlindModeActive ? "ON" : "OFF"}
            </span>
          </div>

          <button
            onClick={() => setShowSubmitModal(true)}
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition flex items-center gap-2"
          >
            <span>⭐ Submit Interview Scorecard</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          ACTIVE INTERVIEW QUEUE: CANDIDATES IN INTERVIEW STATUS (User Requirement)
      ========================================================================= */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xs">
        <div className="border-b border-slate-100 bg-slate-50/70 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">Active Interview Queue</h3>
              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
                {interviewQueue.length} In Progress
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Candidates currently in interview status awaiting evaluation & scorecards</p>
          </div>
          <span className="text-xs font-mono text-slate-500">Live Stage: Interview (Round 1-4)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Candidate</th>
                <th className="px-4 py-3.5">Requisition / Role</th>
                <th className="px-4 py-3.5">Interview Round</th>
                <th className="px-4 py-3.5">Scheduled Time</th>
                <th className="px-4 py-3.5">Interviewer Panel</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {interviewQueue.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                        {item.fullName.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block">{item.fullName}</span>
                        <span className="text-[10px] font-mono text-slate-400">{item.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="font-semibold text-slate-900 block">{item.requisitionTitle}</span>
                    <span className="text-[10px] font-mono text-blue-600">{item.requisitionId}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="font-medium text-slate-800">{item.round}</span>
                  </td>
                  <td className="px-4 py-4 font-mono text-[11px] text-slate-600">
                    {item.date}
                  </td>
                  <td className="px-4 py-4 text-slate-600 text-[11px]">
                    {item.interviewers.join(", ")}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        item.statusColor === "amber"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : item.statusColor === "blue"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : "bg-emerald-50 text-emerald-700 border-emerald-200"
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${item.statusColor === "amber" ? "bg-amber-500 animate-pulse" : item.statusColor === "blue" ? "bg-blue-500 animate-pulse" : "bg-emerald-500"}`} />
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => openRatingForCandidate(item.id, item.roundType)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white border border-blue-200 font-semibold text-xs shadow-2xs transition"
                    >
                      <span>⭐ Rate Candidate</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* HIRING COMMITTEE DEBRIEF MATRIX */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xs">
        <div className="border-b border-slate-100 bg-slate-50/70 px-6 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                Consensus Review
              </span>
              <h3 className="text-sm font-bold text-slate-900">Hiring Committee & Debrief Matrix</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Aggregated multi-evaluator scoring with anti-bias protection</p>
          </div>
          <span className="text-xs text-slate-500 font-mono font-medium">{candidateScorecardMap.length} Candidates Evaluated</span>
        </div>

        <div className="divide-y divide-slate-100">
          {candidateScorecardMap.map(({ candidate, scorecards: cScorecards, avgScore }) => (
            <div key={candidate.id} className="p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h4 className="text-base font-bold text-slate-900">{candidate.fullName}</h4>
                  <p className="text-xs text-blue-600 font-semibold">{candidate.requisitionTitle}</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-1.5 text-center">
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Committee Average</span>
                    <span className="text-base font-black text-amber-600">{avgScore} / 5.0 ⭐</span>
                  </div>

                  <span className="rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-2 text-xs font-bold">
                    ✓ Recommended for Offer
                  </span>

                  <button
                    onClick={() => openRatingForCandidate(candidate.id)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition"
                  >
                    + Add My Scorecard
                  </button>
                </div>
              </div>

              {/* INDIVIDUAL PANEL EVALUATIONS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {cScorecards.map((sc) => {
                  const isHidden = isBlindModeActive && sc.isBlindReview && sc.interviewerName !== activeApprover.name;

                  return (
                    <div
                      key={sc.id}
                      className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-900 text-xs">{sc.interviewerName}</span>
                          <span className="text-[10px] text-slate-500 block">{sc.interviewerRole}</span>
                        </div>
                        <span
                          className={`rounded-md px-2.5 py-0.5 text-[10px] font-bold border ${
                            sc.overallRecommendation.includes("STRONG_HIRE")
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : sc.overallRecommendation.includes("HIRE")
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-rose-50 text-rose-700 border-rose-200"
                          }`}
                        >
                          {sc.overallRecommendation.replace("_", " ")}
                        </span>
                      </div>

                      {isHidden ? (
                        <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 text-center">
                          <span className="text-xs text-amber-800 font-bold">🔒 Anti-Bias Blind Evaluation Active</span>
                          <p className="text-[10px] text-amber-700 mt-1">
                            This panel member&apos;s evaluation is hidden until you submit your own scorecard for this candidate.
                          </p>
                        </div>
                      ) : (
                        <>
                          {/* 5-COMPETENCY MINI SCORES */}
                          <div className="grid grid-cols-5 gap-1.5 pt-1 text-center font-mono text-[10px]">
                            <div className="bg-white border border-slate-200 rounded-lg p-1.5 shadow-2xs">
                              <span className="text-slate-400 block text-[9px] uppercase font-bold">Tech</span>
                              <span className="text-amber-600 font-bold">{sc.competencyRatings.technicalProficiency}★</span>
                            </div>
                            <div className="bg-white border border-slate-200 rounded-lg p-1.5 shadow-2xs">
                              <span className="text-slate-400 block text-[9px] uppercase font-bold">Arch</span>
                              <span className="text-amber-600 font-bold">{sc.competencyRatings.systemDesignArchitecture}★</span>
                            </div>
                            <div className="bg-white border border-slate-200 rounded-lg p-1.5 shadow-2xs">
                              <span className="text-slate-400 block text-[9px] uppercase font-bold">Problem</span>
                              <span className="text-amber-600 font-bold">{sc.competencyRatings.problemSolvingVelocity}★</span>
                            </div>
                            <div className="bg-white border border-slate-200 rounded-lg p-1.5 shadow-2xs">
                              <span className="text-slate-400 block text-[9px] uppercase font-bold">Team</span>
                              <span className="text-amber-600 font-bold">{sc.competencyRatings.communicationAndTeamwork}★</span>
                            </div>
                            <div className="bg-white border border-slate-200 rounded-lg p-1.5 shadow-2xs">
                              <span className="text-slate-400 block text-[9px] uppercase font-bold">Culture</span>
                              <span className="text-amber-600 font-bold">{sc.competencyRatings.cultureAndValuesAdd}★</span>
                            </div>
                          </div>

                          <div className="text-[11px] text-slate-700 leading-relaxed bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                            <span className="font-bold text-slate-900">Strengths:</span> {sc.strengthsSummary}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL: SUBMIT SCORECARD & RATE CANDIDATE */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-xl rounded-2xl bg-white border border-slate-200 p-6 shadow-2xl text-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <span className="rounded-md bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 text-[10px] font-bold uppercase">
                  Interview Evaluation Rubric
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">Submit Interview Scorecard</h3>
              </div>
              <button onClick={() => setShowSubmitModal(false)} className="text-slate-400 hover:text-slate-700 text-lg leading-none">✕</button>
            </div>

            <form onSubmit={handleScorecardSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Candidate Under Review</label>
                <select
                  value={selectedCandidateId}
                  onChange={(e) => setSelectedCandidateId(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-slate-900 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  {candidates.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.fullName} — {c.requisitionTitle}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Interview Round</label>
                  <select
                    value={roundType}
                    onChange={(e) => setRoundType(e.target.value as any)}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="TECHNICAL_SCREEN">Technical Coding Screen</option>
                    <option value="SYSTEM_ARCHITECTURE">System Architecture & Scale</option>
                    <option value="BEHAVIORAL_CULTURE">Behavioral & Core Values</option>
                    <option value="EXECUTIVE_FINAL">Executive Final Round</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Overall Recommendation</label>
                  <select
                    value={overallVerdict}
                    onChange={(e) => setOverallVerdict(e.target.value as any)}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-slate-900 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="STRONG_HIRE">⭐ Strong Hire (Exceptional)</option>
                    <option value="HIRE">✓ Hire (Meets Standard)</option>
                    <option value="LEANING_HIRE">↗ Leaning Hire</option>
                    <option value="LEANING_NO_HIRE">↘ Leaning No Hire</option>
                    <option value="STRONG_NO_HIRE">✕ Strong No Hire</option>
                  </select>
                </div>
              </div>

              {/* 5-COMPETENCY SCORING RUBRICS */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="font-bold text-slate-800 block text-xs">5-Point Competency Rubric Scoring:</span>

                <div className="space-y-2.5">
                  {[
                    { key: "technicalProficiency", label: "1. Technical & Coding Proficiency" },
                    { key: "systemDesignArchitecture", label: "2. System Design & Architectural Scalability" },
                    { key: "problemSolvingVelocity", label: "3. Problem Solving & Algorithmic Velocity" },
                    { key: "communicationAndTeamwork", label: "4. Communication, Clarity & Cross-Teamwork" },
                    { key: "cultureAndValuesAdd", label: "5. Culture & Core Values Add" },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-700 font-medium">{item.label}</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() =>
                              setRatings((prev) => ({
                                ...prev,
                                [item.key]: star,
                              }))
                            }
                            className={`h-6 w-6 rounded-md font-bold text-xs transition ${
                              (ratings as any)[item.key] >= star
                                ? "bg-amber-400 text-amber-950 shadow-2xs"
                                : "bg-slate-200 text-slate-500 hover:bg-slate-300"
                            }`}
                          >
                            {star}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Key Strengths & Evidence</label>
                <textarea
                  rows={2}
                  value={strengths}
                  onChange={(e) => setStrengths(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  placeholder="Demonstrated deep understanding of distributed systems..."
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Areas of Concern or Follow-up</label>
                <textarea
                  rows={2}
                  value={concerns}
                  onChange={(e) => setConcerns(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  placeholder="None noted, or topics for next round..."
                />
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
                  Submit Scorecard &rarr;
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
