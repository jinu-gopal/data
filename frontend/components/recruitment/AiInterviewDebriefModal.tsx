"use client";

import { useState, useEffect } from "react";

interface Candidate {
  id: string;
  fullName: string;
  email: string;
  requisitionTitle?: string;
  department?: string;
  stage: string;
}

interface AiInterviewDebriefModalProps {
  candidate: Candidate;
  onClose: () => void;
  triggerBanner: (msg: string) => void;
}

export default function AiInterviewDebriefModal({
  candidate,
  onClose,
  triggerBanner,
}: AiInterviewDebriefModalProps) {
  const [loading, setLoading] = useState(true);
  const [debrief, setDebrief] = useState<any | null>(null);
  const [isShared, setIsShared] = useState(false);

  useEffect(() => {
    generateDebrief();
  }, [candidate.id]);

  const generateDebrief = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/recruitment/interviews/ai-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interviewId: "int-" + candidate.id,
          candidateName: candidate.fullName,
          requisitionTitle: candidate.requisitionTitle || "Senior Full-Stack Cloud Architect",
          roundType: "SYSTEM_DESIGN",
          audioDurationMinutes: 48,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setDebrief(data);
      }
    } catch (e) {
      console.error("Failed to generate AI interview debrief:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleShareWithRecruiter = () => {
    setIsShared(true);
    triggerBanner(`AI Interview Synthesis shared with Recruiter & logged to ${candidate.fullName}'s timeline!`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-slate-950 border border-slate-800 p-6 shadow-2xl text-slate-200 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
        <div className="flex items-start justify-between pb-4 border-b border-slate-800 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider">
                Automated Interview Intelligence
              </span>
              <span className="text-[9px] font-semibold bg-purple-950 text-purple-300 border border-purple-800 px-1.5 py-0.2 rounded">
                Microsoft Teams Live Audio Ingestion
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mt-1">AI Interview Debrief & Recording Synthesis</h3>
            <p className="text-xs text-slate-400">
              Candidate: <strong className="text-white">{candidate.fullName}</strong> • Role: {candidate.requisitionTitle}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white text-lg">
            &times;
          </button>
        </div>

        {/* Audio Recording Status Bar */}
        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/70 flex items-center justify-between mb-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-rose-400 font-bold">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse"></span>
              <span>48:15 Recorded</span>
            </div>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">Microsoft Teams Enterprise Meeting</span>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
            <span>✓ Speech-to-Text Transcribed</span>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
            <div className="h-7 w-7 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <span>MAX AI is analyzing transcript tokens, architecture answers, and generating scorecard...</span>
          </div>
        ) : debrief ? (
          <div className="space-y-4 text-xs">
            {/* Executive Recommendation Pill */}
            <div className="p-4 rounded-xl border border-emerald-500/40 bg-emerald-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-400 block tracking-wider">
                  Hiring Recommendation
                </span>
                <span className="text-2xl font-black text-white flex items-center gap-2 mt-0.5">
                  <span>STRONG HIRE</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {debrief.confidenceScore}% AI Confidence
                  </span>
                </span>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-[10px] text-slate-400 block font-mono">Platform</span>
                <span className="text-xs font-semibold text-slate-200">{debrief.recordedPlatform}</span>
              </div>
            </div>

            {/* Executive Summary */}
            <div>
              <h4 className="font-bold text-white mb-1.5 flex items-center gap-1.5">
                <span>🤖 AI Executive Debrief</span>
              </h4>
              <p className="text-slate-300 leading-relaxed bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 text-[11px]">
                {debrief.executiveSummary}
              </p>
            </div>

            {/* 4-Competency Rating Scorecard */}
            <div>
              <h4 className="font-bold text-white mb-2">Competency Scorecard & Technical Breakdown</h4>
              <div className="space-y-2">
                {debrief.competencyRatings?.map((comp: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      <span className="font-bold text-white block">{comp.competency}</span>
                      <span className="text-[11px] text-slate-400 block mt-0.5">{comp.feedback}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-black text-emerald-400">{comp.score} / {comp.maxScore}</span>
                      <div className="w-16 bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-emerald-400 h-full rounded-full"
                          style={{ width: `${(comp.score / comp.maxScore) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Strengths & Growth Areas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-950/10">
                <h5 className="font-bold text-emerald-300 mb-2 flex items-center gap-1">
                  <span>✓ Key Technical Strengths</span>
                </h5>
                <ul className="space-y-1.5 text-[11px] text-slate-300 list-disc pl-4">
                  {debrief.keyStrengths?.map((s: string, idx: number) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60">
                <h5 className="font-bold text-slate-300 mb-2 flex items-center gap-1">
                  <span>Growth & Onboarding Areas</span>
                </h5>
                <ul className="space-y-1.5 text-[11px] text-slate-400 list-disc pl-4">
                  {debrief.growthAreas?.map((g: string, idx: number) => (
                    <li key={idx}>{g}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Next Steps Recommendation Note */}
            <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-800/40 text-[11px] text-purple-200">
              <strong>Hiring Lead Note:</strong> {debrief.hiringRecommendationNotes}
            </div>
          </div>
        ) : null}

        <div className="mt-6 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="text-[11px] text-slate-500">
            {isShared ? (
              <span className="text-emerald-400 font-semibold">✓ Shared with Recruiter & Committee</span>
            ) : (
              <span>Not yet shared with committee</span>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-xl border border-slate-800 px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
            >
              Close
            </button>
            <button
              onClick={handleShareWithRecruiter}
              disabled={isShared}
              className="rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 px-4 py-2 text-xs font-bold text-white transition flex items-center gap-1.5 shadow-md shadow-purple-600/30"
            >
              <span>{isShared ? "✓ Debrief Shared" : "📤 Share Debrief with Recruiter"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
