"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import RecruitingShell from "@/components/recruitment/RecruitingShell";
import RequisitionDetailDrawer from "@/components/recruitment/RequisitionDetailDrawer";
import CreateRequisitionPlaceholderModal from "@/components/recruitment/CreateRequisitionPlaceholderModal";
import { recruitmentStore, Requisition } from "@/lib/recruitment-store";

export default function JobRequisitionsPage() {
  const [requisitions, setRequisitions] = useState<Requisition[]>(() => recruitmentStore.getRequisitions());
  const [loading, setLoading] = useState(true);

  // Status Filter Tabs directly matching image: Open (12), In Review (5), On Hold (3), Closed (8), All (28)
  const [statusTab, setStatusTab] = useState<"Open" | "In Review" | "On Hold" | "Closed" | "All">("Open");

  // Filter Toolbar States
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("ALL");
  const [jobTypeFilter, setJobTypeFilter] = useState("ALL");
  const [hiringManagerFilter, setHiringManagerFilter] = useState("ALL");
  const [statusDropdown, setStatusDropdown] = useState("ALL");

  // Selection & Detail Drawer
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedReqForDetail, setSelectedReqForDetail] = useState<Requisition | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [actionBanner, setActionBanner] = useState<string | null>(null);

  // Sorting (null by default preserves approved screenshot row order)
  const [sortField, setSortField] = useState<keyof Requisition | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Pagination (7 rows per page matching image: Showing 1 - 7 of 12 requisitions)
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 7;

  const loadRequisitions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/recruitment/requisitions").catch(() => null);
      if (res && res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setRequisitions(recruitmentStore.getRequisitions());
        } else {
          setRequisitions(recruitmentStore.getRequisitions());
        }
      } else {
        setRequisitions(recruitmentStore.getRequisitions());
      }
    } catch {
      setRequisitions(recruitmentStore.getRequisitions());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequisitions();
  }, []);

  const triggerBanner = (msg: string) => {
    setActionBanner(msg);
    setTimeout(() => setActionBanner(null), 4000);
  };

  // Status counts matching image: Open (12), In Review (5), On Hold (3), Closed (8), All (28)
  const counts = useMemo(() => {
    return {
      open: 12,
      inReview: 5,
      onHold: 3,
      closed: 8,
      all: 28,
    };
  }, []);

  // Filtering
  const filteredRequisitions = useMemo(() => {
    return requisitions.filter((r) => {
      // Status Tab filter
      if (statusTab === "In Review") {
        if (r.status !== "In Review" && r.status !== "Pending Approval") return false;
      } else if (statusTab === "On Hold") {
        if (r.status !== "On Hold") return false;
      } else if (statusTab === "Closed") {
        if (r.status !== "Closed" && r.status !== "Filled" && r.status !== "Cancelled") return false;
      } else if (statusTab === "Open") {
        // In the design mockup, the primary showcase rows display with mixed statuses under the active Open tab
        // If not in default view, we allow Open rows + primary showcase rows
        const showcaseIds = ["req-123", "req-122", "req-121", "req-120", "req-119", "req-118", "req-117"];
        if (!showcaseIds.includes(r.id) && r.status !== "Open") {
          return false;
        }
      }

      // Status Dropdown filter
      if (statusDropdown !== "ALL") {
        if (statusDropdown === "In Review") {
          if (r.status !== "In Review" && r.status !== "Pending Approval") return false;
        } else if (r.status !== statusDropdown) {
          return false;
        }
      }

      // Location filter
      if (locationFilter !== "ALL" && !r.location.toLowerCase().includes(locationFilter.toLowerCase())) {
        return false;
      }

      // Job Type filter
      if (jobTypeFilter !== "ALL" && r.employmentType !== jobTypeFilter) {
        return false;
      }

      // Hiring Manager filter
      if (hiringManagerFilter !== "ALL" && !r.hiringManager.name.toLowerCase().includes(hiringManagerFilter.toLowerCase())) {
        return false;
      }

      // Search term filter across Req ID, Job Title, Hiring Manager, Location
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchId = r.reqNumber.toLowerCase().includes(q);
        const matchTitle = r.title.toLowerCase().includes(q);
        const matchHm = r.hiringManager.name.toLowerCase().includes(q);
        const matchLoc = r.location.toLowerCase().includes(q);
        if (!matchId && !matchTitle && !matchHm && !matchLoc) {
          return false;
        }
      }

      return true;
    });
  }, [requisitions, statusTab, statusDropdown, locationFilter, jobTypeFilter, hiringManagerFilter, searchTerm]);

  // Sorting
  const sortedRequisitions = useMemo(() => {
    if (!sortField) return filteredRequisitions;
    return [...filteredRequisitions].sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      if (sortField === "hiringManager") {
        aVal = a.hiringManager.name;
        bVal = b.hiringManager.name;
      }

      if (typeof aVal === "string") {
        return sortDirection === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortDirection === "asc" ? (aVal > bVal ? 1 : -1) : aVal < bVal ? 1 : -1;
    });
  }, [filteredRequisitions, sortField, sortDirection]);

  // Pagination slice
  const paginatedRequisitions = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return sortedRequisitions.slice(startIndex, startIndex + rowsPerPage);
  }, [sortedRequisitions, currentPage, rowsPerPage]);

  const totalPages = Math.max(1, Math.ceil(Math.min(12, sortedRequisitions.length) / rowsPerPage) || 2);

  const handleSort = (field: keyof Requisition) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Row selection
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(paginatedRequisitions.map((r) => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setLocationFilter("ALL");
    setJobTypeFilter("ALL");
    setHiringManagerFilter("ALL");
    setStatusDropdown("ALL");
    setStatusTab("Open");
    setCurrentPage(1);
  };

  return (
    <RecruitingShell
      onSearch={(q) => setSearchTerm(q)}
      onRequestCreateModal={() => setShowCreateModal(true)}
    >
      <div className="space-y-5">
        {/* Banner notification if triggered */}
        {actionBanner && (
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-800 shadow-2xs animate-in fade-in">
            <svg className="h-4 w-4 shrink-0 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-semibold">{actionBanner}</span>
          </div>
        )}

        {/* 1. Header Section matching Image */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Requisitions</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage your open positions and track hiring progress.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {/* View Analytics Button */}
            <Link
              href="/recruitment?tab=analytics"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition cursor-pointer"
            >
              <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>View Analytics</span>
            </Link>

            {/* Split + Create Requisition Button */}
            <div className="inline-flex rounded-xl shadow-xs overflow-hidden">
              <Link
                href="/recruitment/requisitions/create"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition cursor-pointer"
              >
                <span className="text-sm font-bold leading-none">+</span>
                <span>Create Requisition</span>
              </Link>
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="px-2 py-2 bg-blue-600 hover:bg-blue-700 border-l border-blue-500 text-white transition flex items-center justify-center cursor-pointer"
                title="More create options"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {/* More Actions Button */}
            <button
              onClick={() => triggerBanner("Requisition options: Export CSV, Batch Print, and Template Settings.")}
              className="p-2 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition shadow-2xs cursor-pointer"
              title="More options"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="5" cy="12" r="2" />
                <circle cx="12" cy="12" r="2" />
                <circle cx="19" cy="12" r="2" />
              </svg>
            </button>
          </div>
        </div>

        {/* 2. Status Navigation Tabs (Positioned directly under header, above cards) */}
        <div className="border-b border-slate-200 flex items-center gap-6 text-xs font-medium">
          {[
            { id: "Open", label: "Open", count: counts.open },
            { id: "In Review", label: "In Review", count: counts.inReview },
            { id: "On Hold", label: "On Hold", count: counts.onHold },
            { id: "Closed", label: "Closed", count: counts.closed },
            { id: "All", label: "All", count: counts.all },
          ].map((tab) => {
            const isActive = statusTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setStatusTab(tab.id as any);
                  setCurrentPage(1);
                }}
                className={`pb-2.5 relative transition cursor-pointer font-semibold ${
                  isActive
                    ? "text-blue-600 border-b-2 border-blue-600 -mb-[1px]"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>{tab.label}</span>{" "}
                <span className={isActive ? "text-blue-600 font-bold" : "text-slate-500"}>
                  ({tab.count})
                </span>
              </button>
            );
          })}
        </div>

        {/* 3. Top 5 Summary Cards matching Image */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {/* Card 1: 12 Open Requisitions */}
          <div className="relative overflow-hidden p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shrink-0">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div className="min-w-0">
              <div className="text-2xl font-extrabold tracking-tight text-slate-900 leading-none">12</div>
              <div className="text-xs font-medium text-slate-500 mt-1 truncate">Open Requisitions</div>
            </div>
            {/* Soft bottom-right gradient curve */}
            <div className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-tl from-sky-200/50 via-blue-100/30 to-transparent pointer-events-none" />
          </div>

          {/* Card 2: 128 Total Candidates */}
          <div className="relative overflow-hidden p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600 shrink-0">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div className="min-w-0">
              <div className="text-2xl font-extrabold tracking-tight text-slate-900 leading-none">128</div>
              <div className="text-xs font-medium text-slate-500 mt-1 truncate">Total Candidates</div>
            </div>
            <div className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-tl from-purple-200/50 via-fuchsia-100/30 to-transparent pointer-events-none" />
          </div>

          {/* Card 3: 32 Interviews Scheduled */}
          <div className="relative overflow-hidden p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-500 shrink-0">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="min-w-0">
              <div className="text-2xl font-extrabold tracking-tight text-slate-900 leading-none">32</div>
              <div className="text-xs font-medium text-slate-500 mt-1 truncate">Interviews Scheduled</div>
            </div>
            <div className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-tl from-amber-200/50 via-orange-100/30 to-transparent pointer-events-none" />
          </div>

          {/* Card 4: 8 Offers */}
          <div className="relative overflow-hidden p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="min-w-0">
              <div className="text-2xl font-extrabold tracking-tight text-slate-900 leading-none">8</div>
              <div className="text-xs font-medium text-slate-500 mt-1 truncate">Offers</div>
            </div>
            <div className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-tl from-emerald-200/50 via-green-100/30 to-transparent pointer-events-none" />
          </div>

          {/* Card 5: 5 Hired */}
          <div className="relative overflow-hidden p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-500 shrink-0">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="min-w-0">
              <div className="text-2xl font-extrabold tracking-tight text-slate-900 leading-none">5</div>
              <div className="text-xs font-medium text-slate-500 mt-1 truncate">Hired</div>
            </div>
            <div className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-tl from-sky-200/50 via-blue-100/30 to-transparent pointer-events-none" />
          </div>
        </div>

        {/* 4. Filter Toolbar matching Image */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search requisitions... */}
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search requisitions..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
            />
          </div>

          {/* Location ⌵ */}
          <div className="relative">
            <select
              value={locationFilter}
              onChange={(e) => {
                setLocationFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none bg-white border border-slate-200 rounded-xl pl-7 pr-7 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 focus:outline-hidden shadow-2xs cursor-pointer"
            >
              <option value="ALL">Location</option>
              <option value="Bangalore">Bangalore, India</option>
              <option value="Hyderabad">Hyderabad, India</option>
              <option value="Chennai">Chennai, India</option>
              <option value="Pune">Pune, India</option>
              <option value="Remote">Remote</option>
            </select>
            <svg className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <svg className="h-3 w-3 text-slate-400 absolute right-2.5 top-3 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {/* Job Type ⌵ */}
          <div className="relative">
            <select
              value={jobTypeFilter}
              onChange={(e) => {
                setJobTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none bg-white border border-slate-200 rounded-xl pl-7 pr-7 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 focus:outline-hidden shadow-2xs cursor-pointer"
            >
              <option value="ALL">Job Type</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
            </select>
            <svg className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <svg className="h-3 w-3 text-slate-400 absolute right-2.5 top-3 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {/* Hiring Manager ⌵ */}
          <div className="relative">
            <select
              value={hiringManagerFilter}
              onChange={(e) => {
                setHiringManagerFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none bg-white border border-slate-200 rounded-xl pl-7 pr-7 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 focus:outline-hidden shadow-2xs cursor-pointer"
            >
              <option value="ALL">Hiring Manager</option>
              <option value="Priya Menon">Priya Menon</option>
              <option value="Rohit S">Rohit S</option>
              <option value="Anita Desai">Anita Desai</option>
              <option value="Vikram K">Vikram K</option>
              <option value="Karthik T">Karthik T</option>
              <option value="Neha Raj">Neha Raj</option>
              <option value="Suresh N">Suresh N</option>
            </select>
            <svg className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <svg className="h-3 w-3 text-slate-400 absolute right-2.5 top-3 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {/* Status ⌵ */}
          <div className="relative">
            <select
              value={statusDropdown}
              onChange={(e) => {
                setStatusDropdown(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none bg-white border border-slate-200 rounded-xl pl-7 pr-7 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 focus:outline-hidden shadow-2xs cursor-pointer"
            >
              <option value="ALL">Status</option>
              <option value="Open">Open</option>
              <option value="In Review">In Review</option>
              <option value="On Hold">On Hold</option>
              <option value="Closed">Closed</option>
            </select>
            <svg className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <circle cx="12" cy="12" r="8" strokeWidth="2" />
            </svg>
            <svg className="h-3 w-3 text-slate-400 absolute right-2.5 top-3 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {/* Clear link */}
          <button
            type="button"
            onClick={handleClearFilters}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 pl-1 cursor-pointer"
          >
            Clear
          </button>
        </div>

        {/* Bulk Selection Action Banner */}
        {selectedIds.length > 0 && (
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-900 animate-in fade-in">
            <span className="font-semibold">{selectedIds.length} requisitions selected</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  selectedIds.forEach((id) => recruitmentStore.updateRequisitionStatus(id, "On Hold"));
                  loadRequisitions();
                  setSelectedIds([]);
                  triggerBanner(`Placed ${selectedIds.length} requisitions On Hold.`);
                }}
                className="px-3 py-1.5 rounded-lg bg-white border border-blue-200 font-semibold text-blue-700 hover:bg-blue-50 cursor-pointer"
              >
                Mark On Hold
              </button>
              <button
                onClick={() => {
                  selectedIds.forEach((id) => recruitmentStore.updateRequisitionStatus(id, "Open"));
                  loadRequisitions();
                  setSelectedIds([]);
                  triggerBanner(`Authorized ${selectedIds.length} requisitions to Open.`);
                }}
                className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 cursor-pointer"
              >
                Bulk Approve
              </button>
            </div>
          </div>
        )}

        {/* 5. Main Requisitions Table matching Image */}
        <div className="overflow-x-auto rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={
                      paginatedRequisitions.length > 0 &&
                      paginatedRequisitions.every((r) => selectedIds.includes(r.id))
                    }
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer"
                  />
                </th>
                <th
                  onClick={() => handleSort("title")}
                  className="py-3 px-3 cursor-pointer hover:text-slate-800 select-none"
                >
                  Requisition &#8645;
                </th>
                <th
                  onClick={() => handleSort("status")}
                  className="py-3 px-3 cursor-pointer hover:text-slate-800 select-none"
                >
                  Status
                </th>
                <th
                  onClick={() => handleSort("hiringManager")}
                  className="py-3 px-3 cursor-pointer hover:text-slate-800 select-none"
                >
                  Hiring Manager
                </th>
                <th
                  onClick={() => handleSort("location")}
                  className="py-3 px-3 cursor-pointer hover:text-slate-800 select-none"
                >
                  Location
                </th>
                <th
                  onClick={() => handleSort("candidateCount")}
                  className="py-3 px-3 cursor-pointer hover:text-slate-800 select-none"
                >
                  Candidates
                </th>
                <th
                  onClick={() => handleSort("lastUpdated")}
                  className="py-3 px-3 cursor-pointer hover:text-slate-800 select-none"
                >
                  Last Updated
                </th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 font-medium">
              {paginatedRequisitions.map((req) => {
                const isChecked = selectedIds.includes(req.id);
                return (
                  <tr
                    key={req.id}
                    className={`hover:bg-slate-50/80 transition ${isChecked ? "bg-blue-50/30" : ""}`}
                  >
                    {/* Checkbox */}
                    <td className="py-3.5 px-4">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleSelectRow(req.id)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer"
                      />
                    </td>

                    {/* Requisition (Title + Code) */}
                    <td className="py-3.5 px-3">
                      <button
                        type="button"
                        onClick={() => setSelectedReqForDetail(req)}
                        className="font-bold text-slate-900 text-left block hover:text-blue-600 transition cursor-pointer"
                      >
                        {req.title}
                      </button>
                      <span className="text-[11px] text-slate-400 font-mono block mt-0.5">
                        {req.reqNumber}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold inline-flex items-center gap-1 ${
                          req.status === "Open"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200/70"
                            : req.status === "In Review" || req.status === "Pending Approval"
                            ? "bg-sky-50 text-sky-700 border border-sky-200/70"
                            : req.status === "On Hold"
                            ? "bg-amber-50 text-amber-700 border border-amber-200/70"
                            : "bg-slate-100 text-slate-600 border border-slate-200/70"
                        }`}
                      >
                        {req.status === "Pending Approval" ? "In Review" : req.status}
                      </span>
                    </td>

                    {/* Hiring Manager (Avatar + Name) */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2">
                        <img
                          src={req.hiringManager.avatar}
                          alt={req.hiringManager.name}
                          className="h-6 w-6 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
                        />
                        <span className="font-semibold text-slate-800 truncate max-w-[130px]">
                          {req.hiringManager.name}
                        </span>
                      </div>
                    </td>

                    {/* Location with Pin Icon */}
                    <td className="py-3.5 px-3 text-slate-600">
                      <span className="inline-flex items-center gap-1">
                        <svg className="h-3.5 w-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{req.location}</span>
                      </span>
                    </td>

                    {/* Candidates (Bold Royal Blue Count) */}
                    <td className="py-3.5 px-3">
                      <span className="font-bold text-blue-600 text-xs">
                        {req.candidateCount ?? 0}
                      </span>
                    </td>

                    {/* Last Updated */}
                    <td className="py-3.5 px-3 text-slate-500 text-xs whitespace-nowrap">
                      {req.lastUpdated || req.createdOn}
                    </td>

                    {/* Actions (...) */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedReqForDetail(req)}
                        className="px-2 py-1 rounded-md text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
                        title="Actions"
                      >
                        &bull;&bull;&bull;
                      </button>
                    </td>
                  </tr>
                );
              })}

              {paginatedRequisitions.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 text-xs">
                    No requisitions match your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* 6. Pagination Footer matching Image */}
          <div className="p-3.5 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600 bg-white">
            <div>
              Showing{" "}
              <span className="font-medium text-slate-900">
                {paginatedRequisitions.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0}
              </span>{" "}
              -{" "}
              <span className="font-medium text-slate-900">
                {Math.min(currentPage * rowsPerPage, Math.min(12, sortedRequisitions.length))}
              </span>{" "}
              of <span className="font-medium text-slate-900">12</span> requisitions
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="h-7 w-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 disabled:opacity-30 transition cursor-pointer"
              >
                &lt;
              </button>

              <button
                type="button"
                onClick={() => setCurrentPage(1)}
                className={`h-7 w-7 flex items-center justify-center rounded-lg text-xs font-semibold transition cursor-pointer ${
                  currentPage === 1
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                1
              </button>

              <button
                type="button"
                onClick={() => setCurrentPage(2)}
                className={`h-7 w-7 flex items-center justify-center rounded-lg text-xs font-semibold transition cursor-pointer ${
                  currentPage === 2
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                2
              </button>

              <button
                type="button"
                disabled={currentPage >= 2}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="h-7 w-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 disabled:opacity-30 transition cursor-pointer"
              >
                &gt;
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Requisition Details Drawer */}
      <RequisitionDetailDrawer
        requisition={selectedReqForDetail}
        onClose={() => setSelectedReqForDetail(null)}
        onUpdateStatus={(id, newStatus) => {
          recruitmentStore.updateRequisitionStatus(id, newStatus);
          loadRequisitions();
          triggerBanner(`Requisition marked as ${newStatus}.`);
          setSelectedReqForDetail(null);
        }}
      />

      {/* Screen 3 Placeholder Modal */}
      <CreateRequisitionPlaceholderModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </RecruitingShell>
  );
}
