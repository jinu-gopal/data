"use client";

import { useState } from "react";

interface SelfScheduleModalProps {
  candidate: { id: string; fullName: string; email: string; requisitionTitle: string };
  onClose: () => void;
  onConfirmBooking: (interview: {
    candidateId: string;
    candidateName: string;
    candidateEmail: string;
    roundType: string;
    platform: "MICROSOFT_TEAMS" | "OUTLOOK_INVITE";
    scheduledStart: string;
    scheduledEnd: string;
    interviewerNames: string[];
    meetingLink: string;
    meetingNotes?: string;
  }) => void;
}

const AVAILABLE_DAYS = [
  { date: "2026-10-19", dayName: "Monday", label: "Oct 19" },
  { date: "2026-10-20", dayName: "Tuesday", label: "Oct 20" },
  { date: "2026-10-21", dayName: "Wednesday", label: "Oct 21" },
  { date: "2026-10-22", dayName: "Thursday", label: "Oct 22" },
];

const TIME_SLOTS: Record<string, { start: string; end: string; label: string; available: boolean }[]> = {
  "2026-10-19": [
    { start: "10:00", end: "11:00", label: "10:00 AM – 11:00 AM", available: true },
    { start: "11:30", end: "12:30", label: "11:30 AM – 12:30 PM", available: false },
    { start: "14:00", end: "15:00", label: "02:00 PM – 03:00 PM", available: true },
    { start: "16:00", end: "17:00", label: "04:00 PM – 05:00 PM", available: true },
  ],
  "2026-10-20": [
    { start: "09:30", end: "10:30", label: "09:30 AM – 10:30 AM", available: true },
    { start: "11:00", end: "12:00", label: "11:00 AM – 12:00 PM", available: true },
    { start: "14:30", end: "15:30", label: "02:30 PM – 03:30 PM", available: true },
    { start: "16:30", end: "17:30", label: "04:30 PM – 05:30 PM", available: false },
  ],
  "2026-10-21": [
    { start: "10:00", end: "11:00", label: "10:00 AM – 11:00 AM", available: true },
    { start: "13:00", end: "14:00", label: "01:00 PM – 02:00 PM", available: true },
    { start: "15:00", end: "16:00", label: "03:00 PM – 04:00 PM", available: true },
    { start: "17:00", end: "18:00", label: "05:00 PM – 06:00 PM", available: true },
  ],
  "2026-10-22": [
    { start: "09:00", end: "10:00", label: "09:00 AM – 10:00 AM", available: true },
    { start: "11:00", end: "12:00", label: "11:00 AM – 12:00 PM", available: true },
    { start: "14:00", end: "15:00", label: "02:00 PM – 03:00 PM", available: false },
    { start: "16:00", end: "17:00", label: "04:00 PM – 05:00 PM", available: true },
  ],
};

export default function SelfScheduleModal({
  candidate,
  onClose,
  onConfirmBooking,
}: SelfScheduleModalProps) {
  const [selectedDay, setSelectedDay] = useState(AVAILABLE_DAYS[0].date);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(0);
  const [roundType, setRoundType] = useState("Technical Architecture & Deep Dive");
  const [platform, setPlatform] = useState<"MICROSOFT_TEAMS" | "OUTLOOK_INVITE">("MICROSOFT_TEAMS");
  const [timezone, setTimezone] = useState("America/New_York (EST)");
  const [interviewers, setInterviewers] = useState("Sarah Jenkins (Staff Architect), David Sterling (VP Eng)");
  const [copiedLink, setCopiedLink] = useState(false);

  const currentSlots = TIME_SLOTS[selectedDay] || [];
  const activeSlot = currentSlots[selectedSlotIndex] || currentSlots[0];

  const handleCopyCandidateLink = () => {
    const link = `https://careers.maxerp.com/portal/self-schedule?reqId=${candidate.id}&token=mxs_${Math.random().toString(36).substring(2, 9)}`;
    navigator.clipboard?.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleBook = () => {
    const startIso = `${selectedDay}T${activeSlot.start}:00Z`;
    const endIso = `${selectedDay}T${activeSlot.end}:00Z`;
    const teamsMeetingId = `teams-mtg-${Math.floor(100000 + Math.random() * 900000)}`;

    onConfirmBooking({
      candidateId: candidate.id,
      candidateName: candidate.fullName,
      candidateEmail: candidate.email,
      roundType,
      platform,
      scheduledStart: startIso,
      scheduledEnd: endIso,
      interviewerNames: interviewers.split(",").map((s) => s.trim()),
      meetingLink: `https://teams.microsoft.com/l/meetup-join/${teamsMeetingId}`,
      meetingNotes: `Enterprise Calendar Self-Schedule confirmation. Sync dispatched to Outlook via MS Graph API. Timezone: ${timezone}`,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-slate-950 border border-slate-800 p-6 shadow-2xl text-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
              📅
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold uppercase">
                  Enterprise Self-Schedule & Teams Sync
                </span>
                <span className="text-[10px] text-slate-400 font-mono">MS Graph API Connected</span>
              </div>
              <h3 className="text-base font-bold text-white mt-0.5">
                Self-Schedule Interview for {candidate.fullName}
              </h3>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition">
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
          {/* Left Column: Configuration & Interviewer panel */}
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Candidate & Position</span>
              <div className="text-sm font-bold text-white mt-0.5">{candidate.fullName}</div>
              <div className="text-[11px] text-blue-400 font-semibold">{candidate.requisitionTitle}</div>
              <div className="text-[11px] text-slate-400 mt-1">{candidate.email}</div>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Interview Round Type</label>
              <select
                value={roundType}
                onChange={(e) => setRoundType(e.target.value)}
                className="w-full rounded-xl bg-slate-900 border border-slate-800 p-2 text-white font-medium focus:border-blue-500 outline-hidden"
              >
                <option value="Initial Recruiter Prescreen (30m)">Initial Recruiter Prescreen (30m)</option>
                <option value="Technical Architecture & Deep Dive (60m)">Technical Architecture & Deep Dive (60m)</option>
                <option value="Live Coding & Problem Solving (60m)">Live Coding & Problem Solving (60m)</option>
                <option value="Hiring Manager & Leadership Fit (45m)">Hiring Manager & Leadership Fit (45m)</option>
                <option value="Executive Bar Raiser & Offer Debrief (45m)">Executive Bar Raiser & Offer Debrief (45m)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Meeting Platform & Calendar Sync</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPlatform("MICROSOFT_TEAMS")}
                  className={`p-2 rounded-xl border flex items-center gap-2 transition ${
                    platform === "MICROSOFT_TEAMS"
                      ? "bg-indigo-900/30 border-indigo-500 text-indigo-300 font-bold"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <span className="text-base">💼</span>
                  <div className="text-left">
                    <div className="text-[11px] leading-tight">Microsoft Teams</div>
                    <div className="text-[9px] text-slate-400">Live Video Bridge</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setPlatform("OUTLOOK_INVITE")}
                  className={`p-2 rounded-xl border flex items-center gap-2 transition ${
                    platform === "OUTLOOK_INVITE"
                      ? "bg-blue-900/30 border-blue-500 text-blue-300 font-bold"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <span className="text-base">✉️</span>
                  <div className="text-left">
                    <div className="text-[11px] leading-tight">Outlook Invite</div>
                    <div className="text-[9px] text-slate-400">Calendar Direct</div>
                  </div>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Assigned Interviewer Panel</label>
              <input
                type="text"
                value={interviewers}
                onChange={(e) => setInterviewers(e.target.value)}
                className="w-full rounded-xl bg-slate-900 border border-slate-800 p-2 text-white font-medium focus:border-blue-500 outline-hidden"
                placeholder="Comma separated names"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Timezone Context</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full rounded-xl bg-slate-900 border border-slate-800 p-2 text-white font-medium focus:border-blue-500 outline-hidden"
              >
                <option value="America/New_York (EST)">America/New York (EST/EDT)</option>
                <option value="America/Los_Angeles (PST)">America/Los Angeles (PST/PDT)</option>
                <option value="Europe/London (GMT/BST)">Europe/London (GMT/BST)</option>
                <option value="Europe/Berlin (CET)">Europe/Berlin (CET/CEST)</option>
                <option value="Asia/Kolkata (IST)">Asia/Kolkata (IST)</option>
                <option value="Asia/Singapore (SGT)">Asia/Singapore (SGT)</option>
              </select>
            </div>
          </div>

          {/* Right Column: Interactive Slot Picker & Calendar Grid */}
          <div className="space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-300 font-bold">1. Select Interview Date</span>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Live Outlook Free/Busy
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {AVAILABLE_DAYS.map((d) => (
                  <button
                    key={d.date}
                    type="button"
                    onClick={() => {
                      setSelectedDay(d.date);
                      setSelectedSlotIndex(0);
                    }}
                    className={`p-2 rounded-xl border text-center transition ${
                      selectedDay === d.date
                        ? "bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-500/20 font-bold"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <div className="text-[10px] uppercase font-semibold">{d.dayName.substring(0, 3)}</div>
                    <div className="text-xs font-bold mt-0.5">{d.label}</div>
                  </button>
                ))}
              </div>

              <span className="text-slate-300 font-bold block mb-2">2. Choose Synchronized Free Slot</span>
              <div className="space-y-2">
                {currentSlots.map((slot, idx) => {
                  const isSelected = selectedSlotIndex === idx;
                  return (
                    <button
                      key={slot.start}
                      type="button"
                      disabled={!slot.available}
                      onClick={() => setSelectedSlotIndex(idx)}
                      className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition ${
                        !slot.available
                          ? "bg-slate-900/30 border-slate-800/50 text-slate-600 cursor-not-allowed"
                          : isSelected
                          ? "bg-emerald-950/40 border-emerald-500 text-emerald-300 font-bold shadow-md shadow-emerald-500/10"
                          : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs">🕒</span>
                        <span className="text-xs font-semibold">{slot.label}</span>
                      </div>
                      <div>
                        {slot.available ? (
                          <span
                            className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                              isSelected
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                                : "bg-slate-800 text-slate-400"
                            }`}
                          >
                            {isSelected ? "Selected" : "Open Slot"}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[9px] font-bold uppercase">
                            Conflict (Busy)
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Candidate Self-Serve Link Generation */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Candidate Self-Schedule Link</span>
                <span className="text-[10px] text-cyan-400">Enterprise Candidate Self-Scheduling</span>
              </div>
              <p className="text-[10px] text-slate-500 mb-2 leading-relaxed">
                Send this personalized token link directly to the candidate so they can choose their own slot from the interviewer availability matrix.
              </p>
              <button
                type="button"
                onClick={handleCopyCandidateLink}
                className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition"
              >
                <span>🔗</span>
                <span>{copiedLink ? "Link Copied to Clipboard! 🎉" : "Copy Self-Service Candidate Portal Link"}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-800 mt-5">
          <div className="text-[11px] text-slate-500">
            Selected: <span className="text-white font-bold">{selectedDay} @ {activeSlot?.label}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleBook}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-500/25 flex items-center gap-1.5 transition"
            >
              <span>📅</span>
              <span>Confirm & Send Teams Invite</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
