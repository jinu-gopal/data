"use client";

import { useState, useEffect } from "react";
import { Requisition, CandidateItem } from "@/lib/recruitment-store";

interface DraftEmailWorkspaceProps {
  requisitions: Requisition[];
  activeReq: Requisition;
  candidates: CandidateItem[];
  onRequestSendEmail: (payload: {
    recipientName: string;
    recipientEmail: string;
    subject: string;
    message: string;
  }) => void;
  onTriggerToast: (msg: string) => void;
  initialCandidateId?: string;
  initialPurpose?: EmailPurpose;
  initialTone?: EmailTone;
}

type EmailPurpose =
  | "Interview Invitation"
  | "Application Status Update"
  | "Recruiter Outreach"
  | "Offer Follow-up"
  | "Feedback Request";

type EmailTone = "Professional" | "Warm & Welcoming" | "Direct & Concise" | "Executive";

export default function DraftEmailWorkspace({
  activeReq,
  candidates,
  onRequestSendEmail,
  onTriggerToast,
  initialCandidateId,
  initialPurpose,
  initialTone,
}: DraftEmailWorkspaceProps) {
  const [purpose, setPurpose] = useState<EmailPurpose>(initialPurpose || "Interview Invitation");
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>(
    initialCandidateId || candidates[0]?.id || "cand-app-01"
  );
  const [tone, setTone] = useState<EmailTone>(initialTone || "Professional");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);

  // Selected candidate object
  const selectedCandidate =
    candidates.find((c) => c.id === selectedCandidateId) || candidates[0];

  // Helper to generate context-rich email draft
  const generateDraft = (
    currentPurpose: EmailPurpose,
    cand: CandidateItem,
    currentTone: EmailTone,
    req: Requisition
  ) => {
    const candName = cand?.name || "Candidate";
    const roleName = req?.title || cand?.role || "Senior Java Developer";
    const company = "MAX Enterprise";

    let genSubject = "";
    let genBody = "";

    switch (currentPurpose) {
      case "Interview Invitation": {
        genSubject = `Interview Invitation: ${roleName} at ${company} — Technical Panel Round`;
        if (currentTone === "Warm & Welcoming") {
          genBody = `Hi ${candName},\n\nWe were really excited to review your background! Given your hands-on experience in ${
            (cand.skillsBreakdown || [])[0]?.name || "distributed systems"
          }, we would love to invite you for a 45-minute virtual conversation with our engineering team.\n\nPlease reply with a couple of time slots that work best for you this week, or use our scheduling portal.\n\nWarm regards,\nRecruiting Team\n${company}`;
        } else if (currentTone === "Executive") {
          genBody = `Dear ${candName},\n\nFollowing our review of leadership benchmarks for the ${roleName} requisition (${req.reqNumber}), we are pleased to invite you to an executive panel debrief.\n\nOur Director of Engineering looks forward to discussing architectural scalability and organizational impact.\n\nRespectfully,\nExecutive Talent Acquisition\n${company}`;
        } else if (currentTone === "Direct & Concise") {
          genBody = `Hello ${candName},\n\nYour profile matches our requirements for ${roleName}. We'd like to schedule your 45-minute technical round.\n\nPlease confirm your availability for Thursday or Friday between 2:00 PM and 5:00 PM IST.\n\nBest,\n${company} Recruiting`;
        } else {
          // Professional default
          genBody = `Dear ${candName},\n\nThank you for taking the time to speak with us regarding the ${roleName} opportunity (${req.reqNumber}) at ${company}.\n\nWe were impressed by your technical track record and would like to invite you to the next stage of our evaluation process: a 45-minute technical interview panel with our team.\n\nPlease let us know if any of the following times suit your calendar:\n• Tomorrow at 2:00 PM IST\n• Thursday at 11:00 AM IST\n• Friday at 4:00 PM IST\n\nWe look forward to speaking with you.\n\nSincerely,\nTalent Acquisition Team\n${company}`;
        }
        break;
      }
      case "Application Status Update": {
        genSubject = `Update on your application for ${roleName} at ${company}`;
        genBody = `Dear ${candName},\n\nThank you for your interest in the ${roleName} position at ${company}. We wanted to provide a quick update on your candidacy status.\n\nYour application has progressed to the '${cand.stage}' stage and our hiring team is currently completing internal evaluations. We expect to share confirmed next steps within 2 business days.\n\nThank you for your patience and enthusiasm.\n\nBest regards,\nTalent Acquisition Operations\n${company}`;
        break;
      }
      case "Recruiter Outreach": {
        genSubject = `Exciting Opportunity: ${roleName} at ${company}`;
        genBody = `Hello ${candName},\n\nI came across your profile and was very impressed by your extensive experience in ${
          (cand.skillsBreakdown || [])[0]?.name || "backend microservices"
        }.\n\nAt ${company}, our team is scaling high-throughput distributed platforms and we are hiring a ${roleName} in Bangalore. I believe your background would be a tremendous fit for our technical roadmap.\n\nWould you be open to a brief 15-minute introductory conversation this week?\n\nBest regards,\nJohn Smith\nSenior Technical Recruiter\n${company}`;
        break;
      }
      case "Offer Follow-up": {
        genSubject = `Offer Letter Follow-Up: ${roleName} at ${company}`;
        genBody = `Dear ${candName},\n\nFollowing up on our recent compensation discussion for the ${roleName} role. We are thrilled at the prospect of welcoming you to ${company}!\n\nPlease review the extended offer letter in your candidate portal. Do not hesitate to reach out if you have any questions regarding health benefits, equity vesting, or start dates.\n\nWarm regards,\nPeople & Culture Team\n${company}`;
        break;
      }
      case "Feedback Request": {
        genSubject = `Interview Feedback Request: ${candName} for ${roleName}`;
        genBody = `Hi Interview Panel,\n\nCandidate ${candName} recently completed their interview for ${roleName} (${req.reqNumber}).\n\nPlease submit your structured scorecard and competency ratings within the enterprise 24-hour SLA window so that we can proceed with hiring decisions.\n\nLink to Scorecard: /recruitment/candidates?id=${cand.id}#scorecard\n\nThank you,\nRecruiting Operations`;
        break;
      }
    }

    setSubject(genSubject);
    setMessage(genBody);
  };

  // Sync draft on purpose, recipient, or tone change
  useEffect(() => {
    if (selectedCandidate) {
      generateDraft(purpose, selectedCandidate, tone, activeReq);
    }
  }, [purpose, selectedCandidateId, tone, activeReq.id]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`Subject: ${subject}\n\n${message}`);
      setCopied(true);
      onTriggerToast("📋 Email draft copied to clipboard");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      onTriggerToast("Draft ready for review");
    }
  };

  const handleSend = () => {
    if (!selectedCandidate) return;
    onRequestSendEmail({
      recipientName: selectedCandidate.name,
      recipientEmail: selectedCandidate.email,
      subject,
      message,
    });
  };

  return (
    <div className="space-y-3.5 text-slate-100">
      {/* 1. Header */}
      <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-3 space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-amber-500/20 text-amber-400 text-xs">
              ✉️
            </span>
            <h3 className="text-xs font-bold text-white tracking-wide">Draft Recruiter Email</h3>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-amber-900/40 border border-amber-500/30 text-[9px] font-semibold text-amber-300">
            Enterprise Mail
          </span>
        </div>
        <p className="text-[11px] text-slate-300 leading-snug">
          Compose AI-assisted communications tailored to verified candidates and recruiting stages.
        </p>
      </div>

      {/* 2. Purpose Selector */}
      <div className="space-y-1">
        <label className="block text-[10px] font-semibold text-slate-300">Email Purpose</label>
        <select
          value={purpose}
          onChange={(e) => setPurpose(e.target.value as EmailPurpose)}
          className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-100 focus:outline-hidden focus:border-amber-500 cursor-pointer"
        >
          <option value="Interview Invitation">Interview Invitation</option>
          <option value="Application Status Update">Application Status Update</option>
          <option value="Recruiter Outreach">Recruiter Outreach</option>
          <option value="Offer Follow-up">Offer Letter Follow-up</option>
          <option value="Feedback Request">Internal Feedback Request</option>
        </select>
      </div>

      {/* 3. Recipient Selection & Tone Selector */}
      <div className="grid grid-cols-2 gap-2 text-[10px]">
        <div>
          <label className="block text-slate-300 font-semibold mb-1">Authorized Recipient</label>
          <select
            value={selectedCandidateId}
            onChange={(e) => setSelectedCandidateId(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2 py-1 text-[11px] text-slate-100 focus:outline-hidden focus:border-amber-500 truncate cursor-pointer"
          >
            {candidates.slice(0, 8).map((cand) => (
              <option key={cand.id} value={cand.id} className="bg-slate-900 text-white">
                {cand.name} ({cand.email})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-slate-300 font-semibold mb-1">Communication Tone</label>
          <select
            value={tone}
            onChange={(e) => setTone(e.target.value as EmailTone)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2 py-1 text-[11px] text-slate-100 focus:outline-hidden focus:border-amber-500 cursor-pointer"
          >
            <option value="Professional">Professional</option>
            <option value="Warm & Welcoming">Warm & Welcoming</option>
            <option value="Direct & Concise">Direct & Concise</option>
            <option value="Executive">Executive</option>
          </select>
        </div>
      </div>

      {/* 4. Subject Line Input */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[10px]">
          <span className="font-semibold text-slate-300">Subject</span>
          <span className="text-slate-400">Editable</span>
        </div>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full bg-[#0d142b] border border-slate-700/80 rounded-lg px-2.5 py-1 text-[11px] font-medium text-white focus:outline-hidden focus:border-amber-500 shadow-inner"
        />
      </div>

      {/* 5. Message Body Textarea */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[10px]">
          <span className="font-semibold text-slate-300">Message Body</span>
          <span className="text-slate-400">Context-Aware AI Draft</span>
        </div>
        <textarea
          rows={7}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full bg-[#0d142b] border border-slate-700/80 rounded-xl p-2.5 text-[11px] text-slate-200 leading-relaxed focus:outline-hidden focus:border-amber-500 shadow-inner resize-y font-normal"
        />
      </div>

      {/* 6. Actions Bar: Regenerate, Copy, Send (with confirmation) */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800">
        <button
          type="button"
          onClick={() => {
            if (selectedCandidate) {
              generateDraft(purpose, selectedCandidate, tone, activeReq);
              onTriggerToast("✨ New AI draft generated");
            }
          }}
          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-semibold transition cursor-pointer flex items-center gap-1"
        >
          <span>↻</span>
          <span>Regenerate</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-semibold transition cursor-pointer flex items-center gap-1"
          >
            <span>{copied ? "✓" : "📋"}</span>
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>

          <button
            type="button"
            onClick={handleSend}
            className="px-3.5 py-1 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-[10px] font-bold transition shadow-xs cursor-pointer flex items-center gap-1"
          >
            <span>✉️</span>
            <span>Send Email</span>
          </button>
        </div>
      </div>
    </div>
  );
}
