"use client";

import { useState, useEffect } from "react";
import {
  recruitmentCandidateDossierEngine,
  UnifiedCandidateDossier,
  RequirementEvidenceStatus,
} from "@/lib/recruitment-candidate-dossier";

interface MaxCandidateDossierModalProps {
  candidateId: string;
  requisitionId?: string;
  isOpen: boolean;
  onClose: () => void;
  onAdvanceCandidate?: (candidateId: string, stage: string) => void;
  onDraftEmail?: (candidateId: string) => void;
}

export default function MaxCandidateDossierModal({
  candidateId,
  requisitionId,
  isOpen,
  onClose,
  onAdvanceCandidate,
  onDraftEmail,
}: MaxCandidateDossierModalProps) {
  const [activeTab, setActiveTab] = useState<"ai-pillars" | "explainable-match" | "experience" | "timeline">("ai-pillars");
  const [dossier, setDossier] = useState<UnifiedCandidateDossier | null>(null);

  useEffect(() => {
    if (isOpen && candidateId) {
      const generated = recruitmentCandidateDossierEngine.generateDossier(candidateId, requisitionId);
      setDossier(generated);
    }
  }, [isOpen, candidateId, requisitionId]);

  if (!isOpen || !dossier) return null;

  const getStatusBadge = (status: RequirementEvidenceStatus) => {
    switch (status) {
      case "DEMONSTRATED":
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">✓ Demonstrated</span>;
      case "PARTIALLY_DEMONSTRATED":
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">⚠️ Partial Evidence</span>;
      case "REQUIRES_VERIFICATION":
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">🔍 Verify in Panel</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-700 text-slate-300">Not Found</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-[#090e1f] border border-indigo-500/40 shadow-2xl text-slate-100 overflow-hidden">
        {/* Top Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-[#111936] via-[#0d142b] to-[#090e1f] border-b border-indigo-500/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            {dossier.avatar ? (
              <img
                src={dossier.avatar}
                alt={dossier.fullName}
                className="h-10 w-10 rounded-full object-cover ring-2 ring-indigo-500/60 shrink-0"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black flex items-center justify-center text-sm shrink-0">
                {dossier.fullName.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white tracking-tight">{dossier.fullName}</h2>
                <span className="px-2 py-0.2 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {dossier.matchingRubric.overallScore}% Fit Score
                </span>
                <span className="px-2 py-0.2 rounded-full text-[9px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                  Stage: {dossier.currentStage}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {dossier.activeRequisitionTitle} ({dossier.activeRequisitionNumber}) • {dossier.location} • {dossier.email}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="h-7 w-7 flex items-center justify-center rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white text-sm cursor-pointer transition"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-5 pt-2 pb-1.5 border-b border-slate-800 bg-slate-900/60 gap-1 text-[11px] font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("ai-pillars")}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "ai-pillars" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-400 hover:text-white"
            }`}
          >
            <span>✨</span>
            <span>8 AI Evaluation Pillars</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("explainable-match")}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "explainable-match" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-400 hover:text-white"
            }`}
          >
            <span>⚖️</span>
            <span>Explainable Evidence Match</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("experience")}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "experience" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-400 hover:text-white"
            }`}
          >
            <span>💼</span>
            <span>Experience & Provenance</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("timeline")}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "timeline" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-400 hover:text-white"
            }`}
          >
            <span>⏱️</span>
            <span>Chronological Timeline</span>
          </button>
        </div>

        {/* Main Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-[12px] scrollbar-thin scrollbar-thumb-slate-700">
          {/* TAB 1: 8 AI Evaluation Pillars */}
          {activeTab === "ai-pillars" && (
            <div className="space-y-3.5">
              {/* Pillar 1: Professional Summary */}
              <div className="p-3.5 rounded-xl bg-[#0d142b] border border-indigo-500/30 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 block">
                  Pillar 1: Professional Summary
                </span>
                <p className="text-slate-200 leading-relaxed font-normal">{dossier.aiEvaluations.professionalSummary}</p>
              </div>

              {/* Pillar 2 & 3: Role Experience & Evidence-Backed Strengths */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block">
                    Pillar 2: Relevant Role Experience
                  </span>
                  <p className="text-slate-300 leading-relaxed">{dossier.aiEvaluations.relevantRoleExperience}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-emerald-900/40 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                    Pillar 3: Evidence-Backed Strengths
                  </span>
                  <ul className="space-y-1 text-slate-300">
                    {dossier.aiEvaluations.evidenceBackedStrengths.map((s, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-emerald-400 font-bold shrink-0">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Pillar 4 & 5: Demonstrated vs Missing Requirements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300 block">
                    Pillar 4: Demonstrated Requirements
                  </span>
                  <ul className="space-y-1 text-slate-300">
                    {dossier.aiEvaluations.demonstratedRequirements.map((d, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-blue-400 font-bold shrink-0">✓</span>
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-amber-900/40 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                    Pillar 5: Missing / Unverified Requirements
                  </span>
                  <ul className="space-y-1 text-slate-300">
                    {dossier.aiEvaluations.missingOrUnclearRequirements.map((m, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-amber-400 font-bold shrink-0">⚠️</span>
                        <span>{m}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Pillar 6 & 7: Transferable Skills & Suggested Assessment Questions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-purple-900/40 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 block">
                    Pillar 6: Transferable Skills
                  </span>
                  <ul className="space-y-1 text-slate-300">
                    {dossier.aiEvaluations.transferableSkills.map((t, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-purple-400 font-bold shrink-0">✦</span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block">
                    Pillar 7: Suggested Panel Questions
                  </span>
                  <ul className="space-y-1 text-slate-300">
                    {dossier.aiEvaluations.suggestedInterviewQuestions.map((q, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-blue-400 font-bold shrink-0">?</span>
                        <span>{q}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Pillar 8: Recommended Next Step */}
              <div className="p-3 rounded-xl bg-gradient-to-r from-blue-950/60 to-indigo-950/60 border border-blue-500/40 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300 block">
                    Pillar 8: Recommended Next Step
                  </span>
                  <p className="text-white font-semibold text-xs mt-0.5">{dossier.aiEvaluations.recommendedNextStep}</p>
                </div>
                {onAdvanceCandidate && (
                  <button
                    type="button"
                    onClick={() => onAdvanceCandidate(dossier.candidateId, "Interview")}
                    className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition cursor-pointer shadow-xs shrink-0"
                  >
                    Advance Candidate ↗
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Explainable Evidence Match */}
          {activeTab === "explainable-match" && (
            <div className="space-y-3.5">
              {/* Scoring Formula Methodology Banner */}
              <div className="p-3.5 rounded-xl bg-[#0d142b] border border-slate-800 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Scoring Model: 40% Skills + 30% Interview + 20% Tenure + 10% Assessment
                </span>
                <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Skills (40%)</span>
                    <span className="text-base font-extrabold text-white">{dossier.matchingRubric.breakdown.skillsAlignmentScore}%</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Interview (30%)</span>
                    <span className="text-base font-extrabold text-blue-400">{dossier.matchingRubric.breakdown.interviewScorecardScore}%</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Tenure (20%)</span>
                    <span className="text-base font-extrabold text-purple-400">{dossier.matchingRubric.breakdown.domainTenureScore}%</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Assessment (10%)</span>
                    <span className="text-base font-extrabold text-emerald-400">{dossier.matchingRubric.breakdown.assessmentPercentileScore}%</span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">{dossier.matchingRubric.methodologyExplanation}</p>
              </div>

              {/* Requirement-by-Requirement Evidence Table */}
              <div className="rounded-xl bg-slate-900/90 border border-slate-800 divide-y divide-slate-800/80">
                <div className="p-3 flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <span>Requirement Criterion</span>
                  <span>Evidence & Source Citation</span>
                </div>
                {dossier.matchingRubric.requirementEvidence.map((req, idx) => (
                  <div key={idx} className="p-3 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-white text-xs">{req.requirementName}</span>
                      {getStatusBadge(req.status)}
                    </div>
                    <p className="text-[11px] text-slate-300 italic">&ldquo;{req.evidenceQuote}&rdquo;</p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 pt-0.5">
                      <span>Source: <strong className="text-slate-300">{req.evidenceSource}</strong></span>
                      <span>•</span>
                      <span>Confidence: <strong className="text-slate-300">{req.confidenceScore}%</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Experience & Provenance Skills */}
          {activeTab === "experience" && (
            <div className="space-y-3.5">
              {/* Provenance Skills */}
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Provenance-Tracked Skills Matrix
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  {dossier.provenanceSkills.map((ps, idx) => (
                    <div key={idx} className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/80 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-white block">{ps.skill}</span>
                        <span className="text-[9px] text-slate-400">{ps.provenance.replace("_", " ")}</span>
                      </div>
                      <span className="font-bold text-cyan-300">{ps.verifiedScorePct}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Career Milestones */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Career Milestones & Employment Record
                </span>
                {dossier.experienceMilestones.map((exp, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-[#0d142b] border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{exp.title}</span>
                      <span className="text-[10px] text-slate-400">{exp.period}</span>
                    </div>
                    <span className="text-[10px] text-blue-400 block font-semibold">{exp.company}</span>
                    <ul className="space-y-0.5 text-[11px] text-slate-300 pt-1">
                      {exp.highlights.map((h, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-slate-400">•</span>
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: Activity Timeline */}
          {activeTab === "timeline" && (
            <div className="space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Audit Timeline of Candidate Interactions
              </span>
              <div className="space-y-2 relative pl-4 border-l-2 border-indigo-500/40 ml-2">
                {dossier.activityTimeline.map((item) => (
                  <div key={item.id} className="relative space-y-0.5">
                    <div className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-indigo-500 ring-2 ring-slate-900" />
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-white text-xs">{item.title}</span>
                      <span className="text-slate-400">{item.date}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-snug">{item.description}</p>
                    <span className="text-[9px] text-indigo-400 font-semibold block">Actor: {item.actor}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 bg-[#060a17] border-t border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            {onDraftEmail && (
              <button
                type="button"
                onClick={() => onDraftEmail(dossier.candidateId)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
              >
                ✉️ Draft Outreach
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition cursor-pointer"
            >
              Close
            </button>
            {onAdvanceCandidate && (
              <button
                type="button"
                onClick={() => onAdvanceCandidate(dossier.candidateId, "Interview")}
                className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs transition shadow-xs cursor-pointer"
              >
                Advance Candidate ↗
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
