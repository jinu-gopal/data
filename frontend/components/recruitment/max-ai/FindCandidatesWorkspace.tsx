"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Requisition, CandidateItem } from "@/lib/recruitment-store";

interface FindCandidatesWorkspaceProps {
  requisitions: Requisition[];
  activeReq: Requisition;
  onSelectReq: (req: Requisition) => void;
  candidates: CandidateItem[];
  onAddToRequisition: (candidate: CandidateItem, req: Requisition) => void;
  onTriggerToast: (msg: string) => void;
  initialQuery?: string;
}

const AVAILABLE_SKILLS = [
  "Java",
  "Spring Boot",
  "Microservices",
  "Kafka",
  "AWS",
  "Docker",
  "REST APIs",
  "System Design",
  "React",
  "TypeScript",
];

export default function FindCandidatesWorkspace({
  requisitions,
  activeReq,
  onSelectReq,
  candidates,
  onAddToRequisition,
  onTriggerToast,
  initialQuery = "",
}: FindCandidatesWorkspaceProps) {
  // Tabs: search | recommendations | saved
  const [activeTab, setActiveTab] = useState<"search" | "recommendations" | "saved">("search");
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [minExp, setMinExp] = useState<string>("any");
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [employmentType, setEmploymentType] = useState<string>("all");
  const [noticePeriod, setNoticePeriod] = useState<string>("all");
  const [availability, setAvailability] = useState<string>("all");
  const [savedCandidateIds, setSavedCandidateIds] = useState<Set<string>>(new Set(["cand-app-01"]));

  // Auto-extract skills, location, and experience if an initial natural-language query was passed
  useEffect(() => {
    if (initialQuery.trim()) {
      setSearchQuery(initialQuery);
      const lower = initialQuery.toLowerCase();

      // Detect skill chips
      const matchedSkills = AVAILABLE_SKILLS.filter((s) => lower.includes(s.toLowerCase()));
      if (matchedSkills.length > 0) {
        setSelectedSkills(matchedSkills);
      }

      // Detect location
      if (lower.includes("bangalore")) setLocationFilter("Bangalore");
      else if (lower.includes("hyderabad")) setLocationFilter("Hyderabad");
      else if (lower.includes("remote")) setLocationFilter("Remote");
      else if (lower.includes("chennai")) setLocationFilter("Chennai");
      else if (lower.includes("pune")) setLocationFilter("Pune");

      // Detect experience
      if (lower.includes("5 year") || lower.includes("4 year") || lower.includes("senior")) {
        setMinExp("4");
      } else if (lower.includes("2 year") || lower.includes("mid")) {
        setMinExp("2");
      } else if (lower.includes("6 year") || lower.includes("8 year") || lower.includes("lead")) {
        setMinExp("6");
      }
    }
  }, [initialQuery]);

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const toggleSaveCandidate = (id: string, name: string) => {
    setSavedCandidateIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        onTriggerToast(`Removed ${name} from saved candidates`);
      } else {
        next.add(id);
        onTriggerToast(`Saved ${name} for ${activeReq.reqNumber}`);
      }
      return next;
    });
  };

  // Filtered & Ranked candidates
  const filteredCandidates = useMemo(() => {
    let list = [...candidates];

    // Filter by Tab
    if (activeTab === "recommendations") {
      list = list.filter((c) => (c.matchScore || 0) >= 70);
    } else if (activeTab === "saved") {
      list = list.filter((c) => savedCandidateIds.has(c.id));
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((c) => {
        const name = c.name.toLowerCase();
        const role = (c.role || c.requisitionTitle || "").toLowerCase();
        const loc = (c.location || "").toLowerCase();
        const skills = (c.skillsBreakdown || []).map((s) => s.name.toLowerCase()).join(" ");
        return name.includes(q) || role.includes(q) || loc.includes(q) || skills.includes(q);
      });
    }

    // Skill chips filter
    if (selectedSkills.length > 0) {
      list = list.filter((c) => {
        const candSkills = (c.skillsBreakdown || []).map((s) => s.name.toLowerCase());
        return selectedSkills.some((s) => candSkills.includes(s.toLowerCase()));
      });
    }

    // Location filter
    if (locationFilter !== "all") {
      list = list.filter((c) =>
        (c.location || "").toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    // Sort by match score descending
    list.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    return list;
  }, [
    candidates,
    activeTab,
    searchQuery,
    selectedSkills,
    locationFilter,
    savedCandidateIds,
  ]);

  return (
    <div className="space-y-3.5 text-slate-100">
      {/* 1. Header with Active Requisition Context */}
      <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-blue-500/20 text-blue-400 text-xs">
                🔍
              </span>
              <h3 className="text-xs font-bold text-white tracking-wide">Find Candidates</h3>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
              Find the best candidates for this requisition using AI.
            </p>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-blue-900/40 border border-blue-500/30 text-[9px] font-semibold text-blue-300 shrink-0">
            AI Sourcing
          </span>
        </div>

        {/* Active Requisition Selector */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider shrink-0">
              Target Requisition:
            </span>
            <select
              value={activeReq.id}
              onChange={(e) => {
                const found = requisitions.find((r) => r.id === e.target.value);
                if (found) onSelectReq(found);
              }}
              className="bg-slate-800/90 border border-slate-700/80 rounded-md px-2 py-0.5 text-[11px] font-medium text-slate-100 focus:outline-hidden focus:border-blue-500 truncate max-w-[240px] cursor-pointer"
            >
              {requisitions.map((r) => (
                <option key={r.id} value={r.id} className="bg-slate-900 text-slate-200">
                  {r.reqNumber} — {r.title}
                </option>
              ))}
            </select>
          </div>
          <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 shrink-0">
            {activeReq.status}
          </span>
        </div>
      </div>

      {/* 2. Natural Language Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
          <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Natural search: e.g. Senior Java with Kafka & microservices in Bangalore..."
          className="w-full bg-[#0d142b] border border-slate-700/80 rounded-xl pl-8 pr-8 py-1.5 text-[11px] text-white placeholder-slate-400 focus:outline-hidden focus:border-blue-500/80 transition shadow-inner"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-white text-xs cursor-pointer"
          >
            ✕
          </button>
        )}
      </div>

      {/* 3. Skills Selector Chips */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[10px]">
          <span className="font-semibold text-slate-300">Filter by Core Skills:</span>
          {selectedSkills.length > 0 && (
            <button
              type="button"
              onClick={() => setSelectedSkills([])}
              className="text-blue-400 hover:text-blue-300 cursor-pointer"
            >
              Reset ({selectedSkills.length})
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-1">
          {AVAILABLE_SKILLS.map((skill) => {
            const isSelected = selectedSkills.includes(skill);
            return (
              <button
                key={skill}
                type="button"
                onClick={() => toggleSkill(skill)}
                className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition cursor-pointer border ${
                  isSelected
                    ? "bg-blue-600 text-white border-blue-400 shadow-xs"
                    : "bg-slate-800/80 text-slate-300 border-slate-700/60 hover:bg-slate-700 hover:text-white"
                }`}
              >
                {isSelected ? `✓ ${skill}` : `+ ${skill}`}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Experience & Location Filter Row */}
      <div className="grid grid-cols-2 gap-2 text-[10px]">
        <div>
          <label className="block text-slate-400 font-semibold mb-0.5">Min Experience</label>
          <select
            value={minExp}
            onChange={(e) => setMinExp(e.target.value)}
            className="w-full bg-slate-800/90 border border-slate-700/80 rounded-lg px-2 py-1 text-[11px] text-slate-200 focus:outline-hidden focus:border-blue-500"
          >
            <option value="any">Any Experience</option>
            <option value="2">2+ Years</option>
            <option value="4">4+ Years</option>
            <option value="6">6+ Years</option>
            <option value="8">8+ Years</option>
          </select>
        </div>
        <div>
          <label className="block text-slate-400 font-semibold mb-0.5">Location</label>
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="w-full bg-slate-800/90 border border-slate-700/80 rounded-lg px-2 py-1 text-[11px] text-slate-200 focus:outline-hidden focus:border-blue-500"
          >
            <option value="all">All Locations</option>
            <option value="Bangalore">Bangalore, India</option>
            <option value="Hyderabad">Hyderabad, India</option>
            <option value="Remote">Remote</option>
            <option value="Chennai">Chennai, India</option>
            <option value="Pune">Pune, India</option>
          </select>
        </div>
      </div>

      {/* 5. Collapsible Advanced Filters */}
      <div className="rounded-lg bg-slate-900/60 border border-slate-800/80 p-2">
        <button
          type="button"
          onClick={() => setShowAdvanced((p) => !p)}
          className="w-full flex items-center justify-between text-[10px] font-semibold text-slate-300 hover:text-white cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <span>⚙️</span>
            <span>Advanced Filters (Employment, Notice, Availability)</span>
          </span>
          <span>{showAdvanced ? "▲" : "▼"}</span>
        </button>

        {showAdvanced && (
          <div className="grid grid-cols-3 gap-2 pt-2 mt-2 border-t border-slate-800 text-[10px] animate-in fade-in">
            <div>
              <label className="block text-slate-400 mb-0.5">Employment</label>
              <select
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-[10px] text-slate-200"
              >
                <option value="all">All Types</option>
                <option value="full-time">Full-time</option>
                <option value="contract">Contract</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 mb-0.5">Notice Period</label>
              <select
                value={noticePeriod}
                onChange={(e) => setNoticePeriod(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-[10px] text-slate-200"
              >
                <option value="all">Any Notice</option>
                <option value="immediate">Immediate</option>
                <option value="15days">≤ 15 Days</option>
                <option value="30days">≤ 30 Days</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 mb-0.5">Availability</label>
              <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-[10px] text-slate-200"
              >
                <option value="all">Any Time</option>
                <option value="immediate">Immediate</option>
                <option value="this-month">This Month</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* 6. View Tabs: Search | Recommendations | Saved */}
      <div className="flex items-center rounded-lg bg-slate-900 border border-slate-800 p-0.5 text-[10px] font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab("search")}
          className={`flex-1 py-1 rounded-md text-center transition cursor-pointer ${
            activeTab === "search"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Search ({filteredCandidates.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("recommendations")}
          className={`flex-1 py-1 rounded-md text-center transition cursor-pointer ${
            activeTab === "recommendations"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Recommendations
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("saved")}
          className={`flex-1 py-1 rounded-md text-center transition cursor-pointer ${
            activeTab === "saved"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Saved ({savedCandidateIds.size})
        </button>
      </div>

      {/* 7. Results List */}
      <div className="space-y-2">
        {filteredCandidates.length === 0 ? (
          <div className="text-center py-6 px-4 rounded-xl bg-slate-900/50 border border-slate-800/80 text-slate-400 text-[11px]">
            <p>No candidates match the specified criteria.</p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedSkills([]);
                setMinExp("any");
                setLocationFilter("all");
              }}
              className="mt-2 text-blue-400 hover:underline font-semibold cursor-pointer"
            >
              Reset all filters
            </button>
          </div>
        ) : (
          filteredCandidates.map((cand) => {
            const isSaved = savedCandidateIds.has(cand.id);
            const isAlreadyInReq = cand.requisitionId === activeReq.reqNumber;

            return (
              <div
                key={cand.id}
                className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-blue-500/40 transition space-y-2"
              >
                {/* Candidate Summary Row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5 min-w-0">
                    {cand.avatar ? (
                      <img
                        src={cand.avatar}
                        alt={cand.name}
                        className="h-8 w-8 rounded-full object-cover ring-1 ring-slate-700 shrink-0"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-700 to-indigo-800 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                        {cand.initials || cand.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-[12px] text-white truncate">
                          {cand.name}
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {cand.matchScore}% Match
                        </span>
                        <span className="px-1 py-0.2 rounded text-[8px] font-semibold bg-slate-800 text-slate-300">
                          {cand.stage}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-300 truncate mt-0.5">
                        {cand.role || cand.requisitionTitle} • {cand.location || "Bangalore, India"}
                      </p>
                    </div>
                  </div>

                  {/* Bookmark Button */}
                  <button
                    type="button"
                    onClick={() => toggleSaveCandidate(cand.id, cand.name)}
                    className={`p-1 rounded text-xs transition cursor-pointer ${
                      isSaved ? "text-amber-400 hover:text-amber-300" : "text-slate-500 hover:text-slate-300"
                    }`}
                    title={isSaved ? "Remove from saved" : "Save candidate"}
                  >
                    {isSaved ? "★" : "☆"}
                  </button>
                </div>

                {/* Key Skills & Explainable Match Tag */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/80 text-[9px]">
                  <div className="flex items-center gap-1 flex-wrap min-w-0">
                    {(cand.skillsBreakdown || []).slice(0, 3).map((s, idx) => (
                      <span
                        key={idx}
                        className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60"
                      >
                        {s.name}
                      </span>
                    ))}
                    {(cand.skillsBreakdown || []).length > 3 && (
                      <span className="text-slate-400">
                        +{cand.skillsBreakdown!.length - 3}
                      </span>
                    )}
                  </div>
                  <span className="text-[8px] text-blue-300 font-medium shrink-0">
                    Explainable AI Fit
                  </span>
                </div>

                {/* Actions: View Profile & Add to Requisition */}
                <div className="flex items-center justify-end gap-2 pt-1">
                  <Link
                    href={`/recruitment/candidates?id=${cand.id}`}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-medium transition cursor-pointer"
                  >
                    View Profile ↗
                  </Link>

                  {isAlreadyInReq ? (
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[10px] font-semibold">
                      ✓ In Requisition
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onAddToRequisition(cand, activeReq)}
                      className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-semibold transition cursor-pointer shadow-xs"
                    >
                      + Add to Requisition
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
