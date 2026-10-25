"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import MaxShell from "@/components/max/MaxShell";
import PositionManagementTab from "@/components/workforce/PositionManagementTab";
import OrgStructureTab from "@/components/workforce/OrgStructureTab";
import PeopleProfileTab from "@/components/workforce/PeopleProfileTab";
import TimeOffTab from "@/components/workforce/TimeOffTab";
import HireToRetireTab from "@/components/workforce/HireToRetireTab";
import { Position, OrgEntity, PeopleProfile, H2RTransition } from "@/lib/ec-core-store";
import { EnterpriseRoleKey, ENTERPRISE_ROLES } from "@/lib/rbp-store";

interface Employee {
  id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  jobTitle: string;
  managerId?: string;
  managerName?: string;
  employmentType: string;
  workLocation: string;
  status: string;
  hireDate: string;
  remainingPtoDays: number;
}

interface ShiftAssignment {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  shiftDate: string;
  shiftType: string;
  startTime: string;
  endTime: string;
  scheduledHours: number;
  location: string;
  status: string;
}

interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: string;
  approvedBy?: string;
  reviewNotes?: string;
  requestedAt: string;
}

interface WorkforceSummary {
  totalEmployees: number;
  activeEmployees: number;
  onLeaveEmployees: number;
  onDutyToday: number;
  pendingLeaveRequests: number;
  overallAttendanceRate: number;
  departmentHeadcount: Record<string, number>;
  leadershipTeam: Employee[];
  todaysShifts: ShiftAssignment[];
  recentLeaves: LeaveRequest[];
}

export default function WorkforceStudioPage() {
  const [activeTab, setActiveTab] = useState<
    "positions" | "orgStructure" | "peopleProfile" | "timeOff" | "hireToRetire" | "directory" | "shifts" | "leaves" | "policies"
  >("positions");
  const [summary, setSummary] = useState<WorkforceSummary | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<ShiftAssignment[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [orgEntities, setOrgEntities] = useState<OrgEntity[]>([]);
  const [peopleProfiles, setPeopleProfiles] = useState<PeopleProfile[]>([]);
  const [h2rTransitions, setH2rTransitions] = useState<H2RTransition[]>([]);
  const [loading, setLoading] = useState(true);

  // Enterprise RBP Active Role & Deep-link Target
  const [activeRole, setActiveRole] = useState<EnterpriseRoleKey>("SYSTEM_ADMIN");
  const [targetProfileId, setTargetProfileId] = useState<string | undefined>(undefined);

  // Filters
  const [deptFilter, setDeptFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "tree">("table");

  // Selection & Modals
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // New Employee Form State
  const [newEmp, setNewEmp] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    department: "Engineering",
    jobTitle: "",
    managerId: "",
    employmentType: "FULL_TIME",
    workLocation: "HEADQUARTERS",
    remainingPtoDays: 20,
  });

  // New Shift Form State
  const [newShift, setNewShift] = useState({
    employeeId: "",
    shiftDate: new Date().toISOString().split("T")[0],
    shiftType: "MORNING",
    startTime: "08:00",
    endTime: "16:30",
    scheduledHours: 8.0,
    location: "HEADQUARTERS",
  });

  // New Leave Form State
  const [newLeave, setNewLeave] = useState({
    employeeId: "",
    leaveType: "VACATION",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
    totalDays: 2,
    reason: "",
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [sumRes, empRes, shfRes, levRes, posRes, orgRes, profRes, trnRes] = await Promise.all([
        fetch("/api/workforce/summary"),
        fetch("/api/workforce/employees"),
        fetch("/api/workforce/shifts"),
        fetch("/api/workforce/leaves"),
        fetch("/api/workforce/positions"),
        fetch("/api/workforce/org-structure"),
        fetch("/api/workforce/people-profile"),
        fetch("/api/workforce/hire-to-retire/transitions"),
      ]);

      if (sumRes.ok) setSummary(await sumRes.json());
      if (empRes.ok) setEmployees(await empRes.json());
      if (shfRes.ok) setShifts(await shfRes.json());
      if (levRes.ok) setLeaves(await levRes.json());
      if (posRes.ok) {
        const data = await posRes.json();
        setPositions(data.positions || []);
      }
      if (orgRes.ok) {
        const data = await orgRes.json();
        setOrgEntities(data.entities || []);
      }
      if (profRes.ok) {
        const data = await profRes.json();
        setPeopleProfiles(data.profiles || []);
      }
      if (trnRes.ok) {
        const data = await trnRes.json();
        setH2rTransitions(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to load workforce telemetry", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showBanner = (msg: string) => {
    setActionSuccessMessage(msg);
    setTimeout(() => setActionSuccessMessage(null), 4000);
  };

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    return employees.filter((e) => {
      const matchDept = deptFilter === "ALL" || e.department.toUpperCase() === deptFilter.toUpperCase();
      const matchStatus = statusFilter === "ALL" || e.status.toUpperCase() === statusFilter.toUpperCase();
      const matchSearch =
        searchTerm === "" ||
        e.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.employeeNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.email.toLowerCase().includes(searchTerm.toLowerCase());
      return matchDept && matchStatus && matchSearch;
    });
  }, [employees, deptFilter, statusFilter, searchTerm]);

  // Handle Create Employee
  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmp.firstName || !newEmp.lastName || !newEmp.email || !newEmp.jobTitle) return;

    try {
      const res = await fetch("/api/workforce/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEmp),
      });

      if (res.ok) {
        setShowEmployeeModal(false);
        showBanner(`Successfully onboarded employee ${newEmp.firstName} ${newEmp.lastName}.`);
        setNewEmp({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          department: "Engineering",
          jobTitle: "",
          managerId: "",
          employmentType: "FULL_TIME",
          workLocation: "HEADQUARTERS",
          remainingPtoDays: 20,
        });
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Assign Shift
  const handleAssignShift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShift.employeeId) return;

    try {
      const res = await fetch("/api/workforce/shifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newShift),
      });

      if (res.ok) {
        setShowShiftModal(false);
        showBanner("Workforce shift scheduled successfully.");
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Request Leave
  const handleRequestLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeave.employeeId || !newLeave.reason) return;

    try {
      const res = await fetch("/api/workforce/leaves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLeave),
      });

      if (res.ok) {
        setShowLeaveModal(false);
        showBanner("Leave request submitted for managerial review.");
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Approve / Reject Leave
  const handleUpdateLeaveStatus = async (id: string, newStatus: "APPROVED" | "REJECTED") => {
    try {
      const res = await fetch(`/api/workforce/leaves/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          approvedBy: "Workforce Administrator",
          reviewNotes: newStatus === "APPROVED" ? "Approved in governance workflow." : "Rejected due to operational staffing constraints.",
        }),
      });

      if (res.ok) {
        showBanner(`Leave request marked as ${newStatus}.`);
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Department color helper
  const getDeptColor = (dept: string) => {
    switch (dept.toUpperCase()) {
      case "EXECUTIVE":
        return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800";
      case "ENGINEERING":
        return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800";
      case "OPERATIONS":
        return "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800";
      case "FINANCE":
        return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800";
      case "SALES":
        return "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
    }
  };

  return (
    <MaxShell>
      <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto">
        {/* Banner Alert */}
        {actionSuccessMessage && (
          <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400">
            <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">{actionSuccessMessage}</span>
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Human Capital & Workforce Studio
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Enterprise organizational reporting tree, multi-shift rota scheduler, and PTO entitlement governance.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* RBP Active Persona Switcher */}
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 shadow-2xs">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <svg className="w-3.5 h-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="hidden sm:inline">Active Persona (RBP):</span>
              </div>
              <select
                value={activeRole}
                onChange={(e) => setActiveRole(e.target.value as EnterpriseRoleKey)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 cursor-pointer"
              >
                {ENTERPRISE_ROLES.map((r) => (
                  <option key={r.key} value={r.key}>
                    {r.name} ({r.badge})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setShowEmployeeModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Onboard Employee
            </button>
            <button
              onClick={() => setShowShiftModal(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Assign Shift
            </button>
            <button
              onClick={() => setShowLeaveModal(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              <svg className="h-4 w-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Request Leave
            </button>
            <Link
              href="/configuration/ec-core"
              className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 px-3.5 py-2.5 text-xs font-semibold hover:bg-blue-100 transition"
            >
              <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              ⚙️ Customization & Setup
            </Link>
          </div>
        </div>

        {/* Telemetry Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Workforce</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {summary ? summary.totalEmployees : employees.length}
              </span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                {summary ? `${summary.activeEmployees} Active` : "10 Active"}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">Across 5 enterprise divisions</p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">On-Duty Shifts Today</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {summary ? summary.onDutyToday : 4}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Scheduled / Clocked-In</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">Morning & Evening plant shifts</p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Pending Leave Approvals</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {summary ? summary.pendingLeaveRequests : 2}
              </span>
              <span className="inline-flex items-center rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                Awaiting Signoff
              </span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">PTO balance auto-deduct enabled</p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Workforce Availability</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {summary ? `${summary.overallAttendanceRate.toFixed(1)}%` : "90.0%"}
              </span>
              <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">Compliance Index</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">96.8% shift coverage adherence</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-slate-200 dark:border-slate-800">
          <nav className="flex space-x-2 sm:space-x-4 overflow-x-auto pb-1" aria-label="Tabs">
            {[
              { id: "positions", label: "Position Management", badge: positions.length ? `${positions.length}` : undefined },
              { id: "orgStructure", label: "Org Structure", badge: "5-Tier" },
              { id: "peopleProfile", label: "People Profile (360°)", badge: peopleProfiles.length ? `${peopleProfiles.length}` : undefined },
              { id: "timeOff", label: "Time Off & Absences", badge: "6 Types" },
              { id: "hireToRetire", label: "Hire-to-Retire Hub", badge: "H2R" },
              { id: "directory", label: "Employee Directory" },
              { id: "shifts", label: "Shift Roster" },
              { id: "policies", label: "Workforce Policies" },
            ].map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center gap-1.5 border-b-2 py-3 px-1 text-xs font-semibold whitespace-nowrap transition ${
                    active
                      ? "border-blue-600 text-blue-600 dark:text-blue-400"
                      : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                  }`}
                >
                  {tab.label}
                  {tab.badge && (
                    <span className="ml-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1.5 py-0.2 text-[10px] font-bold">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* TAB: POSITION MANAGEMENT (EC CORE) */}
        {activeTab === "positions" && (
          <PositionManagementTab
            positions={positions}
            onRefresh={loadData}
            onTriggerBanner={showBanner}
            activeRole={activeRole}
            onNavigateToProfile={(profileIdOrName) => {
              setTargetProfileId(profileIdOrName);
              setActiveTab("peopleProfile");
            }}
          />
        )}

        {/* TAB: ORGANISATION STRUCTURE (EC CORE) */}
        {activeTab === "orgStructure" && (
          <OrgStructureTab
            entities={orgEntities}
            onRefresh={loadData}
            onTriggerBanner={showBanner}
            activeRole={activeRole}
          />
        )}

        {/* TAB: PEOPLE PROFILE (360° DOSSIER) */}
        {activeTab === "peopleProfile" && (
          <PeopleProfileTab
            profiles={peopleProfiles}
            onRefresh={loadData}
            onTriggerBanner={showBanner}
            initialProfileId={targetProfileId}
            activeRole={activeRole}
          />
        )}

        {/* TAB: TIME OFF & ABSENCE ENGINE */}
        {activeTab === "timeOff" && (
          <TimeOffTab
            requests={leaves as any}
            profiles={peopleProfiles}
            onRefresh={loadData}
            onTriggerBanner={showBanner}
            activeRole={activeRole}
          />
        )}

        {/* TAB: HIRE-TO-RETIRE (H2R) LIFECYCLE STUDIO */}
        {activeTab === "hireToRetire" && (
          <HireToRetireTab
            transitions={h2rTransitions}
            positions={positions}
            profiles={peopleProfiles}
            onRefresh={loadData}
            onTriggerBanner={showBanner}
            activeRole={activeRole}
          />
        )}

        {/* TAB 1: DIRECTORY & ORG HIERARCHY */}
        {activeTab === "directory" && (
          <div className="flex flex-col gap-5">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative min-w-[220px]">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search employee, title, email..."
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 pl-9 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-white"
                  />
                  <svg className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>

                <select
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300"
                >
                  <option value="ALL">All Departments</option>
                  <option value="EXECUTIVE">Executive</option>
                  <option value="ENGINEERING">Engineering</option>
                  <option value="OPERATIONS">Operations</option>
                  <option value="FINANCE">Finance</option>
                  <option value="SALES">Sales</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="ACTIVE">Active</option>
                  <option value="ON_LEAVE">On Leave</option>
                </select>
              </div>

              <div className="flex items-center gap-1 self-end sm:self-auto border border-slate-200 dark:border-slate-800 rounded-xl p-1 bg-slate-50 dark:bg-slate-950">
                <button
                  onClick={() => setViewMode("table")}
                  className={`px-3 py-1 text-xs font-medium rounded-lg transition ${
                    viewMode === "table"
                      ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs"
                      : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
                  }`}
                >
                  Directory Table
                </button>
                <button
                  onClick={() => setViewMode("tree")}
                  className={`px-3 py-1 text-xs font-medium rounded-lg transition ${
                    viewMode === "tree"
                      ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs"
                      : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
                  }`}
                >
                  Org Hierarchy
                </button>
              </div>
            </div>

            {/* View Mode: Table */}
            {viewMode === "table" ? (
              <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                    <thead className="bg-slate-50 dark:bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] font-semibold border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="px-5 py-3.5">Employee</th>
                        <th className="px-4 py-3.5">Department & Title</th>
                        <th className="px-4 py-3.5">Reporting Manager</th>
                        <th className="px-4 py-3.5">Location & Type</th>
                        <th className="px-4 py-3.5">PTO Balance</th>
                        <th className="px-4 py-3.5">Status</th>
                        <th className="px-4 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                      {filteredEmployees.map((emp) => (
                        <tr key={emp.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 text-xs font-bold">
                                {emp.firstName[0]}
                                {emp.lastName[0]}
                              </div>
                              <div>
                                <div className="font-semibold text-slate-900 dark:text-white">{emp.fullName}</div>
                                <div className="text-[11px] text-slate-400">{emp.employeeNumber} &bull; {emp.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className={`inline-block rounded-md border px-2 py-0.5 text-[10px] font-semibold mb-1 ${getDeptColor(emp.department)}`}>
                              {emp.department}
                            </span>
                            <div className="text-slate-700 dark:text-slate-200 text-xs">{emp.jobTitle}</div>
                          </td>
                          <td className="px-4 py-3.5">
                            {emp.managerName ? (
                              <span className="text-slate-700 dark:text-slate-300">{emp.managerName}</span>
                            ) : (
                              <span className="text-slate-400 italic text-[11px]">Chief Executive (None)</span>
                            )}
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="text-slate-800 dark:text-slate-200">{emp.workLocation}</div>
                            <div className="text-[11px] text-slate-400">{emp.employmentType}</div>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="inline-flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-100">
                              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                              {emp.remainingPtoDays} days left
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            {emp.status === "ACTIVE" ? (
                              <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 px-2 py-0.5 text-[10px] font-semibold">
                                &bull; Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 px-2 py-0.5 text-[10px] font-semibold">
                                &bull; On Leave
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <button
                              onClick={() => setSelectedEmployee(emp)}
                              className="rounded-lg border border-slate-200 dark:border-slate-800 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-blue-600 hover:border-blue-300 dark:text-slate-300 transition"
                            >
                              Dossier
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* View Mode: Org Hierarchy Tree */
              <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Enterprise Reporting Hierarchy</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Multi-tier reporting structure from CEO to operational team leads.</p>
                  </div>
                  <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold bg-blue-50 dark:bg-blue-950/50 px-2.5 py-1 rounded-lg">
                    Tier-1 Verified Governance
                  </span>
                </div>

                <div className="flex flex-col gap-6">
                  {/* CEO Node */}
                  {employees.filter((e) => !e.managerId).map((ceo) => (
                    <div key={ceo.id} className="flex flex-col items-center">
                      <div className="rounded-2xl border-2 border-purple-500/40 bg-purple-50/50 dark:bg-purple-950/30 p-4 max-w-sm text-center shadow-sm">
                        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-purple-600 text-white font-bold text-sm">
                          {ceo.firstName[0]}{ceo.lastName[0]}
                        </div>
                        <h4 className="font-bold text-slate-900 dark:text-white mt-2">{ceo.fullName}</h4>
                        <p className="text-xs text-purple-700 dark:text-purple-300 font-medium">{ceo.jobTitle}</p>
                        <span className="inline-block rounded-md bg-purple-200/60 dark:bg-purple-900/50 text-purple-900 dark:text-purple-200 px-2 py-0.5 text-[10px] font-bold mt-1.5">
                          {ceo.employeeNumber} &bull; {ceo.workLocation}
                        </span>
                      </div>

                      {/* Connecting Line Down */}
                      <div className="h-6 w-0.5 bg-slate-300 dark:bg-slate-700 my-1"></div>

                      {/* Level 2: Direct Reports to CEO */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
                        {employees.filter((e) => e.managerId === ceo.id).map((exec) => {
                          const directReports = employees.filter((r) => r.managerId === exec.id);
                          return (
                            <div key={exec.id} className="flex flex-col items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-4">
                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold">
                                {exec.firstName[0]}{exec.lastName[0]}
                              </div>
                              <h5 className="font-semibold text-slate-900 dark:text-white text-xs mt-2 text-center">{exec.fullName}</h5>
                              <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium text-center">{exec.jobTitle}</p>
                              <span className={`inline-block rounded-md border px-1.5 py-0.5 text-[9px] font-bold mt-1 ${getDeptColor(exec.department)}`}>
                                {exec.department}
                              </span>

                              {/* Nested Reports */}
                              {directReports.length > 0 && (
                                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 w-full flex flex-col gap-2">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Direct Reports ({directReports.length})</span>
                                  {directReports.map((sub) => (
                                    <div key={sub.id} className="rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 text-left">
                                      <div className="font-medium text-slate-800 dark:text-slate-200 text-[11px]">{sub.fullName}</div>
                                      <div className="text-[10px] text-slate-400">{sub.jobTitle}</div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SHIFT ROTA SCHEDULER */}
        {activeTab === "shifts" && (
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Multi-Shift Rota & Roster Engine</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Continuous plant shift operations with check-in telemetry and overtime safeguard.</p>
              </div>
              <button
                onClick={() => setShowShiftModal(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition"
              >
                + Schedule Shift
              </button>
            </div>

            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                  <thead className="bg-slate-50 dark:bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] font-semibold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-5 py-3.5">Staff Member</th>
                      <th className="px-4 py-3.5">Shift Date</th>
                      <th className="px-4 py-3.5">Shift Type & Hours</th>
                      <th className="px-4 py-3.5">Time Interval</th>
                      <th className="px-4 py-3.5">Facility / Location</th>
                      <th className="px-4 py-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                    {shifts.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                        <td className="px-5 py-3.5">
                          <div className="font-semibold text-slate-900 dark:text-white">{s.employeeName}</div>
                          <div className="text-[11px] text-slate-400">{s.department}</div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="font-mono text-slate-800 dark:text-slate-200">{s.shiftDate}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="inline-flex items-center rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 px-2 py-0.5 text-[10px] font-bold">
                            {s.shiftType}
                          </span>
                          <span className="ml-2 text-slate-500 text-[11px]">({s.scheduledHours} hrs)</span>
                        </td>
                        <td className="px-4 py-3.5 font-mono text-slate-700 dark:text-slate-300">
                          {s.startTime} - {s.endTime}
                        </td>
                        <td className="px-4 py-3.5 text-slate-700 dark:text-slate-200">
                          {s.location}
                        </td>
                        <td className="px-4 py-3.5">
                          {s.status === "CLOCKED_IN" ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 px-2.5 py-0.5 text-[10px] font-bold">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              Clocked In
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 px-2.5 py-0.5 text-[10px] font-semibold">
                              Scheduled
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: LEAVE & PTO GOVERNANCE */}
        {activeTab === "leaves" && (
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Paid Time Off & Leave Entitlements</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Automated approval workflows with real-time employee PTO ledger adjustments.</p>
              </div>
              <button
                onClick={() => setShowLeaveModal(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition"
              >
                + New Leave Request
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {leaves.map((l) => (
                <div key={l.id} className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900 dark:text-white text-sm">{l.employeeName}</span>
                      {l.status === "APPROVED" && (
                        <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 px-2 py-0.5 text-[10px] font-bold">
                          &bull; Approved
                        </span>
                      )}
                      {l.status === "PENDING" && (
                        <span className="inline-flex items-center rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 px-2 py-0.5 text-[10px] font-bold">
                          &bull; Pending Review
                        </span>
                      )}
                      {l.status === "REJECTED" && (
                        <span className="inline-flex items-center rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 px-2 py-0.5 text-[10px] font-bold">
                          &bull; Rejected
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{l.department} &bull; {l.leaveType}</p>

                    <div className="mt-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 p-3 border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-200">
                        <span>{l.startDate} &rarr; {l.endDate}</span>
                        <span className="text-blue-600 dark:text-blue-400">{l.totalDays} Work Days</span>
                      </div>
                      <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                        &ldquo;{l.reason}&rdquo;
                      </p>
                    </div>

                    {l.reviewNotes && (
                      <p className="mt-2.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                        Auditor Note: {l.reviewNotes} ({l.approvedBy})
                      </p>
                    )}
                  </div>

                  {l.status === "PENDING" && (
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleUpdateLeaveStatus(l.id, "REJECTED")}
                        className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/30 px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleUpdateLeaveStatus(l.id, "APPROVED")}
                        className="rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition"
                      >
                        Approve & Deduct PTO
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: WORKFORCE POLICIES */}
        {activeTab === "policies" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">Shift & Overtime Rules</h4>
                  <p className="text-xs text-slate-500">Statutory and enterprise compliance standards.</p>
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                  <span className="font-medium">Standard Weekly Work Hours</span>
                  <span className="font-bold text-slate-900 dark:text-white">40.0 Hours / Week</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                  <span className="font-medium">Maximum Consecutive Shift</span>
                  <span className="font-bold text-slate-900 dark:text-white">12.0 Hours Max</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                  <span className="font-medium">Night Shift Differential Rate</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">+15% Premium</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                  <span className="font-medium">Overtime Multiplier (&gt;40 hrs)</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">1.5x Base Pay</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">PTO Accrual & Entitlement Ledger</h4>
                  <p className="text-xs text-slate-500">Automated annual leave credit formula.</p>
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                  <span className="font-medium">Base Annual Paid Leave</span>
                  <span className="font-bold text-slate-900 dark:text-white">20.0 Days / Year</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                  <span className="font-medium">Paid Sick Leave Quota</span>
                  <span className="font-bold text-slate-900 dark:text-white">10.0 Days / Year</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                  <span className="font-medium">Seniority Longevity Bonus</span>
                  <span className="font-bold text-slate-900 dark:text-white">+1 Day per 2 Years</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                  <span className="font-medium">Rollover Cap to Next Fiscal Year</span>
                  <span className="font-bold text-slate-900 dark:text-white">5.0 Days Max</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: ONBOARD EMPLOYEE */}
        {showEmployeeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Onboard New Employee</h3>
                <button onClick={() => setShowEmployeeModal(false)} className="text-slate-400 hover:text-slate-600">
                  &times;
                </button>
              </div>

              <form onSubmit={handleCreateEmployee} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">First Name</label>
                    <input
                      type="text"
                      required
                      value={newEmp.firstName}
                      onChange={(e) => setNewEmp({ ...newEmp, firstName: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2 text-slate-900 dark:text-white"
                      placeholder="Jane"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Last Name</label>
                    <input
                      type="text"
                      required
                      value={newEmp.lastName}
                      onChange={(e) => setNewEmp({ ...newEmp, lastName: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2 text-slate-900 dark:text-white"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Corporate Email</label>
                    <input
                      type="email"
                      required
                      value={newEmp.email}
                      onChange={(e) => setNewEmp({ ...newEmp, email: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2 text-slate-900 dark:text-white"
                      placeholder="jane.doe@max-erp.global"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Department</label>
                    <select
                      value={newEmp.department}
                      onChange={(e) => setNewEmp({ ...newEmp, department: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2 text-slate-900 dark:text-white"
                    >
                      <option value="Executive">Executive</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Operations">Operations</option>
                      <option value="Finance">Finance</option>
                      <option value="Sales">Sales</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Job Title</label>
                  <input
                    type="text"
                    required
                    value={newEmp.jobTitle}
                    onChange={(e) => setNewEmp({ ...newEmp, jobTitle: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2 text-slate-900 dark:text-white"
                    placeholder="Senior Reliability Engineer"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Work Location</label>
                    <select
                      value={newEmp.workLocation}
                      onChange={(e) => setNewEmp({ ...newEmp, workLocation: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2 text-slate-900 dark:text-white"
                    >
                      <option value="HEADQUARTERS">Headquarters</option>
                      <option value="REMOTE">Remote</option>
                      <option value="REGIONAL_HUB">Regional Hub</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Initial PTO Days</label>
                    <input
                      type="number"
                      value={newEmp.remainingPtoDays}
                      onChange={(e) => setNewEmp({ ...newEmp, remainingPtoDays: Number(e.target.value) })}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowEmployeeModal(false)}
                    className="rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2 font-semibold text-slate-600 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
                  >
                    Onboard Staff
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: ASSIGN SHIFT */}
        {showShiftModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Assign Workforce Shift</h3>
                <button onClick={() => setShowShiftModal(false)} className="text-slate-400 hover:text-slate-600">
                  &times;
                </button>
              </div>

              <form onSubmit={handleAssignShift} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Staff Member</label>
                  <select
                    required
                    value={newShift.employeeId}
                    onChange={(e) => setNewShift({ ...newShift, employeeId: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2 text-slate-900 dark:text-white"
                  >
                    <option value="">Select Employee...</option>
                    {employees.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.fullName} ({e.department})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Shift Date</label>
                    <input
                      type="date"
                      required
                      value={newShift.shiftDate}
                      onChange={(e) => setNewShift({ ...newShift, shiftDate: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Shift Type</label>
                    <select
                      value={newShift.shiftType}
                      onChange={(e) => setNewShift({ ...newShift, shiftType: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2 text-slate-900 dark:text-white"
                    >
                      <option value="MORNING">Morning (08:00 - 16:30)</option>
                      <option value="EVENING">Evening (16:00 - 00:00)</option>
                      <option value="NIGHT">Night (00:00 - 08:00)</option>
                      <option value="ON_CALL">On-Call Standby</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Hours</label>
                    <input
                      type="number"
                      step="0.5"
                      value={newShift.scheduledHours}
                      onChange={(e) => setNewShift({ ...newShift, scheduledHours: Number(e.target.value) })}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Facility</label>
                    <input
                      type="text"
                      value={newShift.location}
                      onChange={(e) => setNewShift({ ...newShift, location: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowShiftModal(false)}
                    className="rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2 font-semibold text-slate-600 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
                  >
                    Confirm Shift
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: REQUEST LEAVE */}
        {showLeaveModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Request PTO / Leave</h3>
                <button onClick={() => setShowLeaveModal(false)} className="text-slate-400 hover:text-slate-600">
                  &times;
                </button>
              </div>

              <form onSubmit={handleRequestLeave} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Staff Member</label>
                  <select
                    required
                    value={newLeave.employeeId}
                    onChange={(e) => setNewLeave({ ...newLeave, employeeId: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2 text-slate-900 dark:text-white"
                  >
                    <option value="">Select Employee...</option>
                    {employees.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.fullName} ({e.remainingPtoDays} days remaining)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Leave Type</label>
                    <select
                      value={newLeave.leaveType}
                      onChange={(e) => setNewLeave({ ...newLeave, leaveType: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2 text-slate-900 dark:text-white"
                    >
                      <option value="VACATION">Vacation / Holiday</option>
                      <option value="SICK">Medical / Sick</option>
                      <option value="PARENTAL">Parental Leave</option>
                      <option value="BEREAVEMENT">Bereavement</option>
                      <option value="UNPAID">Unpaid Leave</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Work Days</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={newLeave.totalDays}
                      onChange={(e) => setNewLeave({ ...newLeave, totalDays: Number(e.target.value) })}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Start Date</label>
                    <input
                      type="date"
                      required
                      value={newLeave.startDate}
                      onChange={(e) => setNewLeave({ ...newLeave, startDate: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">End Date</label>
                    <input
                      type="date"
                      required
                      value={newLeave.endDate}
                      onChange={(e) => setNewLeave({ ...newLeave, endDate: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Reason / Coverage Plan</label>
                  <textarea
                    rows={2}
                    required
                    value={newLeave.reason}
                    onChange={(e) => setNewLeave({ ...newLeave, reason: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2 text-slate-900 dark:text-white"
                    placeholder="Brief description for manager approval..."
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowLeaveModal(false)}
                    className="rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2 font-semibold text-slate-600 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: EMPLOYEE DOSSIER */}
        {selectedEmployee && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-sm">
                    {selectedEmployee.firstName[0]}{selectedEmployee.lastName[0]}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{selectedEmployee.fullName}</h3>
                    <p className="text-xs text-slate-400">{selectedEmployee.jobTitle} &bull; {selectedEmployee.employeeNumber}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedEmployee(null)} className="text-slate-400 hover:text-slate-600 text-lg">
                  &times;
                </button>
              </div>

              <div className="py-4 space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Corporate Email</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{selectedEmployee.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Direct Phone</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{selectedEmployee.phone}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Department</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{selectedEmployee.department}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Work Location</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{selectedEmployee.workLocation}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Reporting Manager</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{selectedEmployee.managerName || "None (Executive)"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Employment Type</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{selectedEmployee.employmentType}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Date of Hire</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{selectedEmployee.hireDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Remaining PTO</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{selectedEmployee.remainingPtoDays} Days Available</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                <button
                  onClick={() => setSelectedEmployee(null)}
                  className="rounded-xl bg-slate-100 dark:bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200"
                >
                  Close Dossier
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MaxShell>
  );
}
