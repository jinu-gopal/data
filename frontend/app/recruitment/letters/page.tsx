"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import MaxShell from "@/components/max/MaxShell";

/* ============================================================================
 * Interfaces
 * ========================================================================== */

interface LetterTemplate {
  id: string;
  code: string;
  title: string;
  category: string;
  jurisdiction: string;
  level: string;
  employmentType: string;
  subject: string;
  summary: string;
  body: string;
  supportedMergeTags: string[];
  mandatoryClauses: string[];
  aiScore: number;
  isAiGenerated?: boolean;
  approvalRequired: boolean;
  approvalChain: string[];
  updatedAt: string;
}

interface LettersApiResponse {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  categoriesSummary: Record<string, number>;
  letters: LetterTemplate[];
}

interface AuditFinding {
  type: string;
  status: "PASS" | "WARNING" | "INFO";
  label: string;
  detail: string;
}

interface AuditResult {
  overallScore: number;
  legalComplianceScore: number;
  toneInclusivityScore: number;
  readabilityGrade: string;
  jurisdictionAlignment: string;
  findings: AuditFinding[];
  recommendations: string[];
}

interface ClauseItem {
  id: string;
  name: string;
  category: string;
  recommendedFor: string;
  snippet: string;
}

interface CandidateSummaryResult {
  candidateName: string;
  jobTitle: string;
  offerAtAGlance: Record<string, string>;
  keyContingencies: string[];
  plainLanguageExplainer: string;
}

const CATEGORY_NAMES: Record<string, string> = {
  ALL: "All Letters (100+)",
  ENGINEERING: "Engineering & Tech",
  EXECUTIVE: "Executive & Leadership",
  PRODUCT: "Product, Design & Analytics",
  SALES: "Sales & Marketing (GTM)",
  HR: "HR & Talent Acquisition",
  REMOTE_CONTRACT: "Remote & Contractor",
  INTERNSHIP: "Internships & Early Career",
  APPOINTMENT: "Appointment & Probation",
  PROMOTION_COMP: "Promotion & Merit Revisions",
  LEGAL_SEPARATION: "Legal, Exit & NDA",
};

const JURISDICTION_FLAGS: Record<string, string> = {
  US: "🇺🇸 US",
  UK: "🇬🇧 UK",
  GERMANY: "🇩🇪 Germany",
  INDIA: "🇮🇳 India",
  SINGAPORE: "🇸🇬 Singapore",
  GLOBAL_REMOTE: "🌐 Global Remote",
};

export default function LetterStudioPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/recruitment/offers");
  }, [router]);

  // State
  const [letters, setLetters] = useState<LetterTemplate[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [categoriesSummary, setCategoriesSummary] = useState<Record<string, number>>({});
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedJurisdiction, setSelectedJurisdiction] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"GRID" | "TABLE">("GRID");

  // Active Letter for Preview / Editor Drawer
  const [activeLetter, setActiveLetter] = useState<LetterTemplate | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editedBody, setEditedBody] = useState("");
  const [isPersonalizedMode, setIsPersonalizedMode] = useState(false);
  const [selectedCandidateIndex, setSelectedCandidateIndex] = useState(0);

  // Mock candidates for live personalization simulation
  const mockCandidates = [
    {
      name: "Elena Rostova",
      role: "Senior Full-Stack Cloud Architect",
      salary: "168,000",
      bonus: "15,000",
      equity: "4,500",
      startDate: "November 15, 2026",
      manager: "Marcus Chen (VP Architecture)",
      id: "CAND-203",
    },
    {
      name: "Dev Patel",
      role: "Lead Distributed Systems Engineer",
      salary: "192,000",
      bonus: "25,000",
      equity: "6,000",
      startDate: "December 01, 2026",
      manager: "Rachel Green (Engineering Director)",
      id: "CAND-204",
    },
    {
      name: "Samantha Vance",
      role: "Enterprise Strategic Account Executive",
      salary: "140,000",
      bonus: "140,000",
      equity: "3,000",
      startDate: "November 01, 2026",
      manager: "David Sterling (Chief Revenue Officer)",
      id: "CAND-205",
    },
  ];

  // AI Assistant Modals
  const [isAiGeneratorOpen, setIsAiGeneratorOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiTargetJurisdiction, setAiTargetJurisdiction] = useState("US");
  const [aiTargetCategory, setAiTargetCategory] = useState("ENGINEERING");
  const [aiTargetLevel, setAiTargetLevel] = useState("SENIOR");
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // AI Audit State
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);

  // AI Clause Recommender State
  const [isClauseModalOpen, setIsClauseModalOpen] = useState(false);
  const [clauses, setClauses] = useState<ClauseItem[]>([]);
  const [isLoadingClauses, setIsLoadingClauses] = useState(false);

  // AI Summary State
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [candidateSummary, setCandidateSummary] = useState<CandidateSummaryResult | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch Letters from API
  const fetchLetters = async (page = 1, category = selectedCategory, jurisdiction = selectedJurisdiction, search = searchQuery) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        limit: "12",
        category,
        jurisdiction,
        search,
      });

      const res = await fetch(`/api/recruitment/letters?${params.toString()}`);
      if (res.ok) {
        const data: LettersApiResponse = await res.json();
        setLetters(data.letters);
        setTotalCount(data.total);
        setTotalPages(data.totalPages);
        setCategoriesSummary(data.categoriesSummary || {});
        setCurrentPage(page);
      }
    } catch (err) {
      console.error("Failed to load letters:", err);
      showToast("Could not load letters catalog");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLetters(1, selectedCategory, selectedJurisdiction, searchQuery);
  }, [selectedCategory, selectedJurisdiction]);

  // Handle Search submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLetters(1, selectedCategory, selectedJurisdiction, searchQuery);
  };

  // Open Letter Detail / Edit
  const handleOpenLetter = (letter: LetterTemplate) => {
    setActiveLetter(letter);
    setEditedBody(letter.body);
    setIsPersonalizedMode(false);
    setIsEditorOpen(true);
  };

  // Render text with candidate personal values
  const personalizedBody = useMemo(() => {
    if (!activeLetter) return "";
    const cand = mockCandidates[selectedCandidateIndex];
    return editedBody
      .replace(/\{\{candidate_name\}\}/g, cand.name)
      .replace(/\{\{candidate_id\}\}/g, cand.id)
      .replace(/\{\{job_title\}\}/g, cand.role)
      .replace(/\{\{base_salary\}\}/g, cand.salary)
      .replace(/\{\{signing_bonus\}\}/g, cand.bonus)
      .replace(/\{\{equity_shares\}\}/g, cand.equity)
      .replace(/\{\{start_date\}\}/g, cand.startDate)
      .replace(/\{\{reporting_manager\}\}/g, cand.manager)
      .replace(/\{\{department\}\}/g, "Enterprise Platform Division")
      .replace(/\{\{company_name\}\}/g, "MAX Enterprise Global");
  }, [editedBody, selectedCandidateIndex, activeLetter]);

  // AI 1: Generate Letter with AI
  const handleGenerateWithAi = async () => {
    if (!aiPrompt.trim()) return;
    try {
      setIsGeneratingAi(true);
      const res = await fetch("/api/recruitment/letters/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "GENERATE_LETTER",
          prompt: aiPrompt,
          category: aiTargetCategory,
          jurisdiction: aiTargetJurisdiction,
          level: aiTargetLevel,
        }),
      });

      if (res.ok) {
        const generated = await res.json();
        // Save to repository via POST
        const saveRes = await fetch("/api/recruitment/letters", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(generated),
        });

        if (saveRes.ok) {
          const savedLetter = await saveRes.json();
          setIsAiGeneratorOpen(false);
          setAiPrompt("");
          showToast(`AI successfully generated letter: ${savedLetter.title}`);
          fetchLetters(1, selectedCategory, selectedJurisdiction, searchQuery);
          handleOpenLetter(savedLetter);
        }
      }
    } catch {
      showToast("AI letter generation failed. Please try again.");
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // AI 2: Run Compliance & Legal Audit
  const handleRunAudit = async (letter: LetterTemplate) => {
    try {
      setActiveLetter(letter);
      setIsAuditModalOpen(true);
      setIsAuditing(true);
      const res = await fetch("/api/recruitment/letters/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "AUDIT_COMPLIANCE",
          letterText: letter.body,
          jurisdiction: letter.jurisdiction,
        }),
      });
      if (res.ok) {
        const audit = await res.json();
        setAuditResult(audit);
      }
    } catch {
      showToast("AI Compliance Audit failed");
    } finally {
      setIsAuditing(false);
    }
  };

  // AI 3: Recommend Legal Clauses
  const handleOpenClauseRecommender = async (letter: LetterTemplate) => {
    try {
      setActiveLetter(letter);
      setIsClauseModalOpen(true);
      setIsLoadingClauses(true);
      const res = await fetch("/api/recruitment/letters/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "RECOMMEND_CLAUSES",
          letterText: letter.body,
          category: letter.category,
          jurisdiction: letter.jurisdiction,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setClauses(data.recommendedClauses || []);
      }
    } catch {
      showToast("Failed to load clause recommendations");
    } finally {
      setIsLoadingClauses(false);
    }
  };

  // Inject selected clause into active letter
  const handleInjectClause = (clause: ClauseItem) => {
    const updated = editedBody + "\n\n" + clause.snippet;
    setEditedBody(updated);
    showToast(`Injected clause: "${clause.name}"`);
    setIsClauseModalOpen(false);
  };

  // AI 4: Candidate Plain-Language TL;DR
  const handleSummarizeLetter = async (letter: LetterTemplate) => {
    try {
      setActiveLetter(letter);
      setIsSummaryModalOpen(true);
      setIsSummarizing(true);
      const res = await fetch("/api/recruitment/letters/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SUMMARIZE_LETTER",
          letterText: letter.body,
          candidateName: mockCandidates[selectedCandidateIndex].name,
          jobTitle: letter.title,
        }),
      });
      if (res.ok) {
        const summary = await res.json();
        setCandidateSummary(summary);
      }
    } catch {
      showToast("Failed to generate candidate summary");
    } finally {
      setIsSummarizing(false);
    }
  };

  // Save changes to active letter
  const handleSaveLetter = async () => {
    if (!activeLetter) return;
    try {
      const res = await fetch("/api/recruitment/letters", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...activeLetter,
          body: editedBody,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setActiveLetter(updated);
        showToast("Letter template saved successfully");
        fetchLetters(currentPage, selectedCategory, selectedJurisdiction, searchQuery);
      }
    } catch {
      showToast("Failed to save letter template");
    }
  };

  return (
    <MaxShell>
      <div className="min-h-screen bg-slate-50 text-slate-900">
        {/* TOAST NOTIFICATION */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-semibold text-white shadow-xl animate-fade-in">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            {toastMessage}
          </div>
        )}

        {/* TOP HERO & HEADER */}
        <div className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-[1700px] px-6 py-6 lg:px-10">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-blue-600">
                  <span>MAX ATS</span>
                  <span>•</span>
                  <span>Recruitment & Talent Operations</span>
                  <span>•</span>
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-blue-700">100+ Enterprise Letters</span>
                </div>
                <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                  Enterprise Letter Studio & AI Hub
                </h1>
                <p className="mt-1 text-xs text-slate-500 max-w-3xl">
                  Manage over 100+ production-grade offer letters, appointment decrees, promotion revisions, and legal agreements.
                  Accelerate drafting, legal compliance audits, clause injection, and candidate plain-language summaries with built-in AI intelligence.
                </p>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href="/recruitment"
                  className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 hover:text-slate-900 transition"
                >
                  ← Back to Recruiting Studio
                </Link>

                <Link
                  href="/configuration/recruitment"
                  className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 hover:text-slate-900 transition"
                >
                  ⚙️ Global Settings
                </Link>

                <button
                  type="button"
                  onClick={() => setIsAiGeneratorOpen(true)}
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 transition"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 3v19M5 10l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Draft with AI
                </button>
              </div>
            </div>

            {/* QUICK STATS PILLS */}
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Repository Total</div>
                <div className="mt-1 text-xl font-black text-slate-900">{totalCount || 102} Letters</div>
                <div className="mt-0.5 text-[10px] text-emerald-600 font-semibold">10 Enterprise Categories</div>
              </div>

              <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3">
                <div className="text-[10px] font-bold uppercase tracking-wider text-blue-700">Engineering & Tech</div>
                <div className="mt-1 text-xl font-black text-blue-950">{categoriesSummary["ENGINEERING"] || 12}</div>
                <div className="mt-0.5 text-[10px] text-blue-600">Cloud, AI, SRE, Mobile</div>
              </div>

              <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3">
                <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">Executive & C-Level</div>
                <div className="mt-1 text-xl font-black text-indigo-950">{categoriesSummary["EXECUTIVE"] || 10}</div>
                <div className="mt-0.5 text-[10px] text-indigo-600">CTO, CFO, CPO, General Counsel</div>
              </div>

              <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3">
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Remote & Global</div>
                <div className="mt-1 text-xl font-black text-emerald-950">{categoriesSummary["REMOTE_CONTRACT"] || 10}</div>
                <div className="mt-0.5 text-[10px] text-emerald-600">EOR, Contractor SOW, Nomad</div>
              </div>

              <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-3">
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Promotions & Merit</div>
                <div className="mt-1 text-xl font-black text-amber-950">{categoriesSummary["PROMOTION_COMP"] || 10}</div>
                <div className="mt-0.5 text-[10px] text-amber-600">Bands, Equity Refresh, Spot</div>
              </div>

              <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-3">
                <div className="text-[10px] font-bold uppercase tracking-wider text-rose-700">Legal, Exit & NDA</div>
                <div className="mt-1 text-xl font-black text-rose-950">{categoriesSummary["LEGAL_SEPARATION"] || 10}</div>
                <div className="mt-0.5 text-[10px] text-rose-600">Release, Relieving, Verification</div>
              </div>
            </div>
          </div>
        </div>

        {/* SEARCH, CATEGORIES & JURISDICTION TOOLBAR */}
        <div className="mx-auto max-w-[1700px] px-6 py-6 lg:px-10">
          <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            {/* SEARCH ROW */}
            <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search 100+ letters by role, keywords, clauses, jurisdiction (e.g. cloud architect, equity cliff, clawback, BGV, London, Singapore)..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2.5 pl-10 pr-10 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
                <svg className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" viewBox="0 0 20 20" fill="none">
                  <path d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      fetchLetters(1, selectedCategory, selectedJurisdiction, "");
                    }}
                    className="absolute right-3 top-2.5 text-xs font-semibold text-slate-400 hover:text-slate-700"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* JURISDICTION SELECTOR */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap">Jurisdiction:</span>
                <select
                  value={selectedJurisdiction}
                  onChange={(e) => setSelectedJurisdiction(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="ALL">All Regions (Global)</option>
                  <option value="US">🇺🇸 United States</option>
                  <option value="UK">🇬🇧 United Kingdom</option>
                  <option value="GERMANY">🇩🇪 Germany (EU)</option>
                  <option value="INDIA">🇮🇳 India</option>
                  <option value="SINGAPORE">🇸🇬 Singapore (APAC)</option>
                  <option value="GLOBAL_REMOTE">🌐 Global Distributed</option>
                </select>

                {/* VIEW MODE TOGGLE */}
                <div className="flex items-center rounded-xl border border-slate-200 bg-slate-100 p-1">
                  <button
                    type="button"
                    onClick={() => setViewMode("GRID")}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                      viewMode === "GRID" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    Grid
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("TABLE")}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                      viewMode === "TABLE" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    Table
                  </button>
                </div>
              </div>
            </form>

            {/* CATEGORY TABS SCROLLABLE BAR */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {Object.keys(CATEGORY_NAMES).map((catKey) => {
                const count = categoriesSummary[catKey] ?? (catKey === "ALL" ? totalCount : 0);
                const isSelected = selectedCategory === catKey;

                return (
                  <button
                    key={catKey}
                    type="button"
                    onClick={() => setSelectedCategory(catKey)}
                    className={`flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-1.5 font-bold transition ${
                      isSelected
                        ? "bg-slate-950 text-white shadow-xs"
                        : "bg-slate-100/70 text-slate-600 hover:bg-slate-200/80"
                    }`}
                  >
                    <span>{CATEGORY_NAMES[catKey]}</span>
                    <span
                      className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                        isSelected ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* MAIN LETTER LISTING (GRID OR TABLE) */}
          <div className="mt-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-16 text-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                <p className="mt-4 text-xs font-bold text-slate-600">Loading enterprise letter templates...</p>
              </div>
            ) : letters.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-16 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </div>
                <h3 className="mt-4 text-sm font-bold text-slate-950">No letters match criteria</h3>
                <p className="mt-1 max-w-sm text-xs text-slate-500">
                  Try adjusting your search query, selecting another category, or generating a new custom letter using AI.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory("ALL");
                    setSelectedJurisdiction("ALL");
                    setSearchQuery("");
                  }}
                  className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700"
                >
                  Reset All Filters
                </button>
              </div>
            ) : viewMode === "GRID" ? (
              /* GRID VIEW */
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {letters.map((letter) => (
                  <div
                    key={letter.id}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                  >
                    <div>
                      {/* CARD BADGES */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[10px] font-bold text-slate-500">
                          {letter.code}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                            {JURISDICTION_FLAGS[letter.jurisdiction] || letter.jurisdiction}
                          </span>
                          <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                            {letter.aiScore}/100 AI
                          </span>
                        </div>
                      </div>

                      {/* TITLE */}
                      <h3 className="mt-3 text-base font-bold text-slate-950 group-hover:text-blue-600 transition">
                        {letter.title}
                      </h3>

                      {/* SUMMARY */}
                      <p className="mt-2 text-xs leading-5 text-slate-500 line-clamp-3">
                        {letter.summary}
                      </p>

                      {/* MANDATORY CLAUSES PILLS */}
                      <div className="mt-4 flex flex-wrap gap-1">
                        {letter.mandatoryClauses.slice(0, 3).map((clause, idx) => (
                          <span
                            key={idx}
                            className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-600"
                          >
                            ✓ {clause}
                          </span>
                        ))}
                        {letter.mandatoryClauses.length > 3 && (
                          <span className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400">
                            +{letter.mandatoryClauses.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* ACTION BUTTONS BAR */}
                    <div className="mt-5 border-t border-slate-100 pt-3 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleRunAudit(letter)}
                          title="Run AI Compliance Audit"
                          className="rounded-lg bg-indigo-50 p-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition"
                        >
                          ⚖️ Audit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenClauseRecommender(letter)}
                          title="AI Clause Injector"
                          className="rounded-lg bg-amber-50 p-1.5 text-xs font-bold text-amber-700 hover:bg-amber-100 transition"
                        >
                          🧩 Clauses
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSummarizeLetter(letter)}
                          title="Candidate Plain-English Summary"
                          className="rounded-lg bg-emerald-50 p-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition"
                        >
                          📋 TL;DR
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenLetter(letter)}
                        className="rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-600 transition shadow-xs"
                      >
                        Preview & Edit →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* TABLE VIEW */
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600">
                    <tr>
                      <th className="px-5 py-3.5">Code & Title</th>
                      <th className="px-4 py-3.5">Category</th>
                      <th className="px-4 py-3.5">Jurisdiction</th>
                      <th className="px-4 py-3.5">Level</th>
                      <th className="px-4 py-3.5">AI Score</th>
                      <th className="px-4 py-3.5">Clauses</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {letters.map((letter) => (
                      <tr key={letter.id} className="hover:bg-slate-50 transition">
                        <td className="px-5 py-3.5">
                          <div className="font-mono text-[10px] font-bold text-slate-400">{letter.code}</div>
                          <div className="font-bold text-slate-950 mt-0.5">{letter.title}</div>
                        </td>
                        <td className="px-4 py-3.5 text-slate-600 font-semibold">
                          {CATEGORY_NAMES[letter.category] || letter.category}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                            {JURISDICTION_FLAGS[letter.jurisdiction] || letter.jurisdiction}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                            {letter.level}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                            {letter.aiScore}/100
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-slate-500 text-[11px]">
                          {letter.mandatoryClauses.length} mandatory
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleRunAudit(letter)}
                              className="rounded-lg bg-indigo-50 px-2 py-1 text-[11px] font-bold text-indigo-700 hover:bg-indigo-100"
                            >
                              Audit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenLetter(letter)}
                              className="rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-blue-600"
                            >
                              Open
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* PAGINATION BAR */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-slate-200 pt-4">
              <div className="text-xs text-slate-500 font-medium">
                Page <span className="font-bold text-slate-900">{currentPage}</span> of{" "}
                <span className="font-bold text-slate-900">{totalPages || 1}</span> (Showing {letters.length} of {totalCount} letters)
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => fetchLetters(currentPage - 1, selectedCategory, selectedJurisdiction, searchQuery)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 disabled:opacity-40 hover:bg-slate-50 transition"
                >
                  ← Previous
                </button>

                {Array.from({ length: Math.min(totalPages, 5) }).map((_, idx) => {
                  const pageNum = idx + 1;
                  const isCur = pageNum === currentPage;
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => fetchLetters(pageNum, selectedCategory, selectedJurisdiction, searchQuery)}
                      className={`h-8 w-8 rounded-xl text-xs font-bold transition ${
                        isCur ? "bg-slate-900 text-white shadow-xs" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => fetchLetters(currentPage + 1, selectedCategory, selectedJurisdiction, searchQuery)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 disabled:opacity-40 hover:bg-slate-50 transition"
                >
                  Next →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
         * MODAL 1: AI LETTER GENERATOR
         * ======================================================================= */}
        {isAiGeneratorOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase text-blue-700">
                    Enterprise AI Copilot
                  </span>
                  <h3 className="mt-1 text-lg font-bold text-slate-950">Draft Custom Letter with AI</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAiGeneratorOpen(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              <div className="mt-4 space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700">Describe the Letter Requirements</label>
                  <textarea
                    rows={4}
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="E.g. Draft an Executive Offer for a VP of Engineering in London with £185k base salary, 30% performance bonus, £20k sign-on bonus, 4-year equity vesting, 3 months notice period, and garden leave clause..."
                    className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                {/* QUICK PROMPT INSPIRATION CHIPS */}
                <div>
                  <div className="text-[11px] font-bold text-slate-500">Quick Inspiration Prompts:</div>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {[
                      "Senior Cloud Architect in US with $175k Base & 5k RSUs",
                      "Remote Distributed Systems Lead with Home Office Stipend",
                      "London Strategic Sales Director with 50/50 OTE & Accelerators",
                      "International Relocation US to UK with Housing & Tax Equalization",
                      "Mutual Separation & ADEA 21-Day Review Severance Agreement",
                    ].map((snippet) => (
                      <button
                        key={snippet}
                        type="button"
                        onClick={() => setAiPrompt(snippet)}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition text-left"
                      >
                        + {snippet}
                      </button>
                    ))}
                  </div>
                </div>

                {/* TARGET OPTIONS */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700">Category</label>
                    <select
                      value={aiTargetCategory}
                      onChange={(e) => setAiTargetCategory(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-semibold text-slate-800"
                    >
                      <option value="ENGINEERING">Engineering & Tech</option>
                      <option value="EXECUTIVE">Executive</option>
                      <option value="PRODUCT">Product & Design</option>
                      <option value="SALES">Sales & GTM</option>
                      <option value="HR">HR & Talent</option>
                      <option value="REMOTE_CONTRACT">Remote & Contractor</option>
                      <option value="INTERNSHIP">Internship</option>
                      <option value="PROMOTION_COMP">Promotion & Comp</option>
                      <option value="LEGAL_SEPARATION">Legal & Exit</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700">Jurisdiction</label>
                    <select
                      value={aiTargetJurisdiction}
                      onChange={(e) => setAiTargetJurisdiction(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-semibold text-slate-800"
                    >
                      <option value="US">United States</option>
                      <option value="UK">United Kingdom</option>
                      <option value="GERMANY">Germany (EU)</option>
                      <option value="INDIA">India</option>
                      <option value="SINGAPORE">Singapore</option>
                      <option value="GLOBAL_REMOTE">Global Remote</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700">Seniority Level</label>
                    <select
                      value={aiTargetLevel}
                      onChange={(e) => setAiTargetLevel(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-semibold text-slate-800"
                    >
                      <option value="ENTRY">Entry Level</option>
                      <option value="MID">Mid Level</option>
                      <option value="SENIOR">Senior</option>
                      <option value="LEAD">Principal / Lead</option>
                      <option value="DIRECTOR">Director</option>
                      <option value="EXECUTIVE">Executive / C-Level</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAiGeneratorOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={isGeneratingAi || !aiPrompt.trim()}
                  onClick={handleGenerateWithAi}
                  className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isGeneratingAi ? (
                    <>
                      <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      AI Synthesizing Letter...
                    </>
                  ) : (
                    "Generate & Add to Catalog →"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
         * MODAL 2: FULL LETTER PREVIEW & LIVE PERSONALIZER DRAWER
         * ======================================================================= */}
        {isEditorOpen && activeLetter && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
            <div className="relative flex h-[90vh] w-full max-w-5xl flex-col rounded-2xl bg-white shadow-2xl overflow-hidden">
              {/* DRAWER HEADER */}
              <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-500">{activeLetter.code}</span>
                    <span className="rounded-md bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                      {JURISDICTION_FLAGS[activeLetter.jurisdiction] || activeLetter.jurisdiction}
                    </span>
                    <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                      Score: {activeLetter.aiScore}/100
                    </span>
                  </div>
                  <h2 className="mt-1 text-lg font-black text-slate-950">{activeLetter.title}</h2>
                </div>

                <div className="flex items-center gap-2">
                  {/* PERSONALIZATION TOGGLE */}
                  <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1">
                    <button
                      type="button"
                      onClick={() => setIsPersonalizedMode(false)}
                      className={`rounded-lg px-3 py-1 text-xs font-bold transition ${
                        !isPersonalizedMode ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Template Editor
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsPersonalizedMode(true)}
                      className={`rounded-lg px-3 py-1 text-xs font-bold transition ${
                        isPersonalizedMode ? "bg-blue-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      ⚡ Candidate Preview
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsEditorOpen(false)}
                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* CANDIDATE SELECTOR STRIP (When Personalized Mode is Active) */}
              {isPersonalizedMode && (
                <div className="flex items-center justify-between border-b border-blue-100 bg-blue-50/70 px-6 py-2.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-blue-900">Personalize with Candidate:</span>
                    <select
                      value={selectedCandidateIndex}
                      onChange={(e) => setSelectedCandidateIndex(Number(e.target.value))}
                      className="rounded-lg border border-blue-200 bg-white px-2.5 py-1 font-bold text-blue-950 focus:outline-none"
                    >
                      {mockCandidates.map((cand, idx) => (
                        <option key={cand.id} value={idx}>
                          {cand.name} — {cand.role} (${cand.salary})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="rounded-lg bg-white border border-blue-200 px-3 py-1 font-bold text-blue-700 hover:bg-blue-50 transition"
                    >
                      🖨️ Print / Save as PDF
                    </button>
                  </div>
                </div>
              )}

              {/* MERGE TAG HELPER BAR (When Editor Mode is Active) */}
              {!isPersonalizedMode && (
                <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-200 bg-slate-100/60 px-6 py-2 text-xs">
                  <span className="font-bold text-slate-500 whitespace-nowrap">Insert Tag:</span>
                  {[
                    "{{candidate_name}}",
                    "{{job_title}}",
                    "{{base_salary}}",
                    "{{signing_bonus}}",
                    "{{equity_shares}}",
                    "{{start_date}}",
                    "{{reporting_manager}}",
                    "{{department}}",
                  ].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setEditedBody((prev) => prev + " " + tag)}
                      className="whitespace-nowrap rounded-md bg-white border border-slate-200 px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              )}

              {/* BODY CONTENT */}
              <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                {isPersonalizedMode ? (
                  /* RENDERED LETTER DOCUMENT */
                  <div className="mx-auto max-w-3xl rounded-xl border border-slate-200 bg-white p-10 shadow-sm font-serif leading-relaxed text-slate-900 text-sm whitespace-pre-line">
                    <div className="border-b border-slate-200 pb-4 mb-6 flex justify-between items-start font-sans">
                      <div>
                        <div className="text-xl font-black text-blue-700">MAX ENTERPRISE GLOBAL</div>
                        <div className="text-[11px] text-slate-500">Corporate Global Headquarters • Talent Operations</div>
                      </div>
                      <div className="text-right text-xs text-slate-500">
                        Date: October 16, 2026<br />
                        Confidential Employment Communication
                      </div>
                    </div>

                    <div className="text-xs font-sans font-bold text-slate-700 mb-4">
                      SUBJECT: {activeLetter.subject.replace(/\{\{candidate_name\}\}/g, mockCandidates[selectedCandidateIndex].name)}
                    </div>

                    {personalizedBody}

                    <div className="mt-12 pt-6 border-t border-slate-200 flex justify-between text-xs font-sans text-slate-600">
                      <div>
                        <div className="border-b border-slate-400 w-48 mb-1" />
                        <div>Authorized Corporate Signatory</div>
                        <div className="text-[10px] text-slate-400">MAX Enterprise Global Inc.</div>
                      </div>
                      <div>
                        <div className="border-b border-slate-400 w-48 mb-1" />
                        <div>Candidate Acceptance Signature</div>
                        <div className="text-[10px] text-slate-400">Date: ________________________</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* RAW TEMPLATE TEXTAREA */
                  <textarea
                    rows={20}
                    value={editedBody}
                    onChange={(e) => setEditedBody(e.target.value)}
                    className="h-full w-full font-mono text-xs leading-relaxed text-slate-900 bg-white border border-slate-200 rounded-xl p-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                )}
              </div>

              {/* DRAWER FOOTER */}
              <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleRunAudit(activeLetter)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-50 shadow-xs"
                  >
                    ⚖️ Run AI Legal Audit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenClauseRecommender(activeLetter)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-amber-700 hover:bg-amber-50 shadow-xs"
                  >
                    🧩 AI Clause Bank
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSummarizeLetter(activeLetter)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-50 shadow-xs"
                  >
                    📋 Candidate TL;DR
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditorOpen(false)}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
                  >
                    Close
                  </button>

                  {!isPersonalizedMode && (
                    <button
                      type="button"
                      onClick={handleSaveLetter}
                      className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition"
                    >
                      Save Template Changes
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
         * MODAL 3: AI COMPLIANCE & LEGAL RISK AUDIT
         * ======================================================================= */}
        {isAuditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                    AI Legal Auditor
                  </span>
                  <h3 className="text-lg font-bold text-slate-950">Compliance & Risk Scan</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAuditModalOpen(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              {isAuditing ? (
                <div className="py-12 text-center">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                  <p className="mt-3 text-xs font-bold text-slate-600">AI scanning letter for legal clauses & jurisdiction risk...</p>
                </div>
              ) : auditResult ? (
                <div className="mt-4 space-y-4">
                  {/* SCORE CARDS */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3 text-center">
                      <div className="text-[10px] font-bold uppercase text-indigo-700">Legal Compliance</div>
                      <div className="mt-1 text-2xl font-black text-indigo-950">{auditResult.legalComplianceScore}/100</div>
                    </div>

                    <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3 text-center">
                      <div className="text-[10px] font-bold uppercase text-emerald-700">Inclusivity & Tone</div>
                      <div className="mt-1 text-2xl font-black text-emerald-950">{auditResult.toneInclusivityScore}/100</div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
                      <div className="text-[10px] font-bold uppercase text-slate-500">Readability</div>
                      <div className="mt-1 text-xs font-bold text-slate-900 mt-2">{auditResult.readabilityGrade}</div>
                    </div>
                  </div>

                  {/* FINDINGS LIST */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Compliance Findings:</h4>
                    <div className="mt-2 space-y-2">
                      {auditResult.findings.map((f, idx) => (
                        <div
                          key={idx}
                          className="flex items-start justify-between rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs"
                        >
                          <div>
                            <span className="font-bold text-slate-900">{f.label}</span>
                            <p className="text-[11px] text-slate-500 mt-0.5">{f.detail}</p>
                          </div>
                          <span
                            className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                              f.status === "PASS"
                                ? "bg-emerald-100 text-emerald-800"
                                : f.status === "WARNING"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {f.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* RECOMMENDATIONS */}
                  <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3">
                    <div className="text-[11px] font-bold text-blue-900">AI Recommendations:</div>
                    <ul className="mt-1 list-disc pl-4 text-xs text-blue-800 space-y-1">
                      {auditResult.recommendations.map((rec, idx) => (
                        <li key={idx}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : null}

              <div className="mt-6 flex justify-end border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAuditModalOpen(false)}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
         * MODAL 4: AI CLAUSE RECOMMENDER & INJECTOR
         * ======================================================================= */}
        {isClauseModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                    AI Clause Bank
                  </span>
                  <h3 className="text-lg font-bold text-slate-950">Recommended Legal Clauses</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsClauseModalOpen(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              {isLoadingClauses ? (
                <div className="py-12 text-center">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-amber-600 border-t-transparent" />
                  <p className="mt-3 text-xs font-bold text-slate-600">Retrieving specialized legal clauses...</p>
                </div>
              ) : (
                <div className="mt-4 space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                  {clauses.map((clause) => (
                    <div
                      key={clause.id}
                      className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs hover:border-amber-400 transition"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-slate-950">{clause.name}</h4>
                          <span className="text-[10px] font-semibold text-slate-400">
                            Category: {clause.category} • Target: {clause.recommendedFor}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleInjectClause(clause)}
                          className="rounded-lg bg-amber-500 px-3 py-1 text-xs font-bold text-white hover:bg-amber-600 shadow-xs"
                        >
                          + Inject Clause
                        </button>
                      </div>
                      <pre className="mt-2.5 rounded-lg bg-slate-50 p-2.5 font-mono text-[11px] text-slate-700 whitespace-pre-wrap">
                        {clause.snippet}
                      </pre>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 flex justify-end border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setIsClauseModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
         * MODAL 5: AI CANDIDATE PLAIN-LANGUAGE SUMMARY (TL;DR)
         * ======================================================================= */}
        {isSummaryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                    Candidate Experience
                  </span>
                  <h3 className="text-lg font-bold text-slate-950">Offer-at-a-Glance (Candidate TL;DR)</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSummaryModalOpen(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              {isSummarizing ? (
                <div className="py-12 text-center">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
                  <p className="mt-3 text-xs font-bold text-slate-600">Translating legal agreement into plain language...</p>
                </div>
              ) : candidateSummary ? (
                <div className="mt-4 space-y-4">
                  {/* CANDIDATE HEADER */}
                  <div className="rounded-xl bg-emerald-50/70 border border-emerald-100 p-4">
                    <h4 className="text-sm font-black text-emerald-950">
                      Welcome {candidateSummary.candidateName}! Here is your offer breakdown:
                    </h4>
                    <p className="mt-1 text-xs text-emerald-800 leading-relaxed">
                      {candidateSummary.plainLanguageExplainer}
                    </p>
                  </div>

                  {/* KEY METRICS GRID */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(candidateSummary.offerAtAGlance).map(([k, v]) => (
                      <div key={k} className="rounded-xl border border-slate-100 bg-slate-50 p-2.5">
                        <span className="text-[10px] font-bold uppercase text-slate-400">
                          {k.replace(/([A-Z])/g, " $1")}
                        </span>
                        <div className="font-bold text-slate-900 mt-0.5">{v}</div>
                      </div>
                    ))}
                  </div>

                  {/* CONTINGENCIES */}
                  <div>
                    <h5 className="text-[11px] font-bold text-slate-700">Next Steps & Contingencies:</h5>
                    <ul className="mt-1 list-disc pl-4 text-xs text-slate-600 space-y-0.5">
                      {candidateSummary.keyContingencies.map((c, idx) => (
                        <li key={idx}>{c}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : null}

              <div className="mt-6 flex justify-end border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setIsSummaryModalOpen(false)}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
                >
                  Close Summary
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MaxShell>
  );
}
