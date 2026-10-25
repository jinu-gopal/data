"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import RecruitingShell from "@/components/recruitment/RecruitingShell";
import { OfferItem, ApprovalStep, recruitmentStore } from "@/lib/recruitment-store";
import { recruitmentAutonomousOperations, ErpHandoffRecord } from "@/lib/recruitment-autonomous-ops";
import { ecCoreStore, Position } from "@/lib/ec-core-store";

export default function CandidateOffersPage() {
  const [offers, setOffers] = useState<OfferItem[]>(() => recruitmentStore.getOffers());
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [levelFilter, setLevelFilter] = useState<string>("ALL");
  const [departmentFilter, setDepartmentFilter] = useState<string>("ALL");

  // Selected Offer for Actions
  const [selectedOffer, setSelectedOffer] = useState<OfferItem | null>(null);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showNewOfferModal, setShowNewOfferModal] = useState(false);

  // Send Offer Letter Form State
  const [selectedTemplate, setSelectedTemplate] = useState("tmpl-eng-01");
  const [deliveryMethod, setDeliveryMethod] = useState<"DOCUSIGN" | "EMAIL_PDF">("DOCUSIGN");
  const [customCoverNote, setCustomCoverNote] = useState(
    "We are delighted to extend this formal offer of employment to join our engineering leadership team at MAX Enterprise. Please review the terms and complete your digital signature."
  );

  // Higher-Level Approval Form State
  const [approvalRemarks, setApprovalRemarks] = useState(
    "Approved. Strong talent profile and critical strategic hire for FY26 platform initiatives."
  );
  const [revisionFeedback, setRevisionFeedback] = useState("");
  const [showRevisionInput, setShowRevisionInput] = useState(false);

  // Level 2 VP Governance & EC Core Position Control State
  const [positions, setPositions] = useState<Position[]>(() => ecCoreStore.getPositions());
  const [selectedPositionCode, setSelectedPositionCode] = useState<string>("POS-ENG-002");
  const [digitalSignature, setDigitalSignature] = useState("Elena Vance (VP of Engineering)");
  const [autoHandoff, setAutoHandoff] = useState(true);
  const [handoffReceipt, setHandoffReceipt] = useState<ErpHandoffRecord | null>(null);
  const [showHandoffModal, setShowHandoffModal] = useState(false);

  // New Offer Form State
  const [newCandidateName, setNewCandidateName] = useState("");
  const [newRequisitionTitle, setNewRequisitionTitle] = useState("Senior Java Developer");
  const [newReqId, setNewReqId] = useState("REQ-2026-00123");
  const [newBaseSalary, setNewBaseSalary] = useState("$160,000 / yr");
  const [newBonus, setNewBonus] = useState("15% Target ($24,000)");
  const [newEquity, setNewEquity] = useState("$50,000 RSUs");
  const [newStartDate, setNewStartDate] = useState("01 Dec 2026");

  // Toast Banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  const refreshOffers = () => {
    setOffers(recruitmentStore.getOffers());
  };

  // Metrics Calculations
  const metrics = useMemo(() => {
    const total = offers.length;
    const pendingApproval = offers.filter((o) => o.status === "Pending Approval").length;
    const approved = offers.filter((o) => o.status === "Approved").length;
    const sent = offers.filter((o) => o.status === "Sent").length;
    const accepted = offers.filter((o) => o.status === "Accepted").length;
    return { total, pendingApproval, approved, sent, accepted };
  }, [offers]);

  // Filtering Logic
  const filteredOffers = useMemo(() => {
    return offers.filter((o) => {
      const matchSearch =
        o.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.requisitionTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.requisitionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (o.department && o.department.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchStatus =
        statusFilter === "ALL"
          ? true
          : statusFilter === "PENDING"
          ? o.status === "Pending Approval"
          : statusFilter === "APPROVED"
          ? o.status === "Approved"
          : statusFilter === "SENT"
          ? o.status === "Sent"
          : statusFilter === "ACCEPTED"
          ? o.status === "Accepted"
          : true;

      const matchLevel =
        levelFilter === "ALL"
          ? true
          : levelFilter === "LEVEL_1"
          ? o.currentApprovalLevel === 1
          : levelFilter === "LEVEL_2"
          ? o.currentApprovalLevel === 2
          : levelFilter === "LEVEL_3"
          ? o.currentApprovalLevel === 3
          : true;

      const matchDept =
        departmentFilter === "ALL" || !o.department
          ? true
          : o.department === departmentFilter;

      return matchSearch && matchStatus && matchLevel && matchDept;
    });
  }, [offers, searchTerm, statusFilter, levelFilter, departmentFilter]);

  // Handle Higher-Level Approval & Autonomous ERP Position Slot Handoff
  const handleExecuteApproval = () => {
    if (!selectedOffer) return;
    const levelToApprove = selectedOffer.currentApprovalLevel || 2;
    const signer = digitalSignature.trim() || "Elena Vance (VP of Engineering)";

    recruitmentStore.approveOfferByLevel(
      selectedOffer.id,
      levelToApprove,
      approvalRemarks,
      signer
    );

    // If Level 2 VP Approval with Autonomous ERP Handoff enabled:
    if (levelToApprove >= 2 && autoHandoff) {
      // Find candidate or match by name
      const cands = recruitmentStore.getCandidates();
      const cand = cands.find((c) => c.name.toLowerCase() === selectedOffer.candidateName.toLowerCase()) || cands[0];

      // Update EC Core Position Slot to FILLED
      if (selectedPositionCode) {
        ecCoreStore.updatePosition(selectedPositionCode, {
          status: "FILLED",
          incumbentId: cand?.id || "emp-new-hired",
          incumbentName: selectedOffer.candidateName,
        });
      }

      // Execute Autonomous ERP Handoff to Employee Central & Pre-Onboarding
      const receipt = recruitmentAutonomousOperations.executeErpHandoff(cand?.id || "cand-app-01", {
        targetStartDate: selectedOffer.targetStartDate || "01 Dec 2026",
      });

      // Augment receipt with position slot and offer specifics
      receipt.candidateName = selectedOffer.candidateName;
      receipt.positionCodeAllocated = selectedPositionCode;
      receipt.approvedBy = signer;

      setHandoffReceipt(receipt);
      setShowHandoffModal(true);
    }

    refreshOffers();
    setShowApproveModal(false);
    triggerToast(`✓ Offer for ${selectedOffer.candidateName} approved at Level ${levelToApprove} by ${signer}!`);
  };

  // Handle Revision Request
  const handleRequestRevision = () => {
    if (!selectedOffer || !revisionFeedback.trim()) return;
    recruitmentStore.requestOfferRevision(
      selectedOffer.id,
      revisionFeedback,
      "Elena Vance (VP of Engineering)"
    );
    refreshOffers();
    setShowApproveModal(false);
    setShowRevisionInput(false);
    triggerToast(`Offer for ${selectedOffer.candidateName} sent back for revision with feedback.`);
  };

  // Handle Send Offer Letter
  const handleDispatchOfferLetter = () => {
    if (!selectedOffer) return;
    recruitmentStore.sendOfferLetter(selectedOffer.id, {
      templateId: selectedTemplate,
      templateTitle:
        selectedTemplate === "tmpl-eng-01"
          ? "Standard Full-Time Engineering Agreement"
          : selectedTemplate === "tmpl-exec-01"
          ? "Executive Leadership Employment Agreement"
          : "Principal & Staff Employment Contract",
      customMessage: customCoverNote,
      deliveryMethod: deliveryMethod === "DOCUSIGN" ? "DocuSign e-signature" : "Official PDF",
    });
    refreshOffers();
    setShowSendModal(false);
    triggerToast(`✉️ Formal Offer Letter successfully dispatched to ${selectedOffer.candidateName} (${selectedOffer.candidateEmail || "Candidate"})!`);
  };

  // Handle Create Offer
  const handleCreateNewOffer = () => {
    if (!newCandidateName.trim()) return;
    recruitmentStore.createOffer({
      candidateName: newCandidateName,
      requisitionTitle: newRequisitionTitle,
      requisitionId: newReqId,
      baseSalary: newBaseSalary,
      variableBonus: newBonus,
      equity: newEquity,
      targetStartDate: newStartDate,
    });
    refreshOffers();
    setShowNewOfferModal(false);
    setNewCandidateName("");
    triggerToast(`New candidate offer drafted for ${newCandidateName}.`);
  };

  return (
    <RecruitingShell>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 flex items-center gap-3 px-5 py-3 rounded-xl bg-slate-900 text-white text-sm font-medium shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-top-4">
          <span className="text-emerald-400 font-bold">✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="space-y-6 pb-12">
        {/* =====================================================================
            TOP HEADER: Operational Title + Configuration Studio Redirection Pill
        ===================================================================== */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span>Recruiting</span>
              <span>/</span>
              <span className="text-slate-900 font-semibold">Candidate Offers &amp; Approvals</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 mt-1">
              Candidate Offers &amp; Executive Approvals
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Review candidates in offer-related status, execute multi-tier higher-level approvals, and dispatch official employment agreements.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Separation of Concerns Pill: Config Studio link */}
            <Link
              href="/configuration/recruitment?tab=offers"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100/70 text-xs font-semibold text-blue-800 transition shadow-2xs group"
              title="Manage templates in Configuration Studio"
            >
              <span>⚙️</span>
              <span>Offer Letter Templates (Config Studio)</span>
              <span className="text-blue-500 group-hover:translate-x-0.5 transition-transform">&rarr;</span>
            </Link>

            <button
              type="button"
              onClick={() => setShowNewOfferModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-xs transition"
            >
              <span className="text-sm leading-none">+</span>
              <span>Prepare New Offer</span>
            </button>
          </div>
        </div>

        {/* =====================================================================
            CONFIGURATION STUDIO SEPARATION BANNER
        ===================================================================== */}
        <div className="p-3.5 rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-50 via-white to-blue-50/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 text-base shrink-0">
              ℹ️
            </div>
            <div className="text-xs">
              <span className="font-bold text-slate-900">Operational Offer Management Workspace: </span>
              <span className="text-slate-600">
                This screen manages live candidate offer packages, executive approval chains, and digital agreements. Letter templates, merge tags, and compensation governance rules are maintained in Configuration Studio.
              </span>
            </div>
          </div>
          <Link
            href="/configuration/recruitment?tab=offers"
            className="text-xs font-bold text-blue-600 hover:text-blue-800 whitespace-nowrap flex items-center gap-1 shrink-0"
          >
            <span>Open Studio</span>
            <span>&rarr;</span>
          </Link>
        </div>

        {/* =====================================================================
            KPI METRIC CARDS
        ===================================================================== */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Offers In Pipeline
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black text-slate-900 font-mono">{metrics.total}</span>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                Active
              </span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">Across all requisitions</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-2xs relative overflow-hidden">
            <div className="absolute top-0 right-0 h-1 w-full bg-amber-400" />
            <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider block">
              Awaiting Approvals
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black text-amber-700 font-mono">{metrics.pendingApproval}</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full animate-pulse">
                Action Required
              </span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">Level 2 &amp; 3 Sign-offs</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-blue-200 shadow-2xs relative overflow-hidden">
            <div className="absolute top-0 right-0 h-1 w-full bg-blue-500" />
            <span className="text-[11px] font-semibold text-blue-800 uppercase tracking-wider block">
              Approved &amp; Ready
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black text-blue-700 font-mono">{metrics.approved}</span>
              <span className="text-[10px] font-bold text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                Ready to Send
              </span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">All signatories signed</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-purple-200 shadow-2xs relative overflow-hidden">
            <div className="absolute top-0 right-0 h-1 w-full bg-purple-500" />
            <span className="text-[11px] font-semibold text-purple-800 uppercase tracking-wider block">
              Sent / Extended
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black text-purple-700 font-mono">{metrics.sent}</span>
              <span className="text-[10px] font-bold text-purple-800 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">
                DocuSign Active
              </span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">Awaiting candidate sign</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-emerald-200 shadow-2xs relative overflow-hidden">
            <div className="absolute top-0 right-0 h-1 w-full bg-emerald-500" />
            <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block">
              Signed &amp; Accepted
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black text-emerald-700 font-mono">{metrics.accepted}</span>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                EC Ready
              </span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">Pre-onboarding queued</span>
          </div>
        </div>

        {/* =====================================================================
            SEARCH & FILTER CONTROLS
        ===================================================================== */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setStatusFilter("ALL")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                statusFilter === "ALL"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All Offers ({metrics.total})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("PENDING")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1 ${
                statusFilter === "PENDING"
                  ? "bg-amber-500 text-white shadow-xs"
                  : "bg-amber-50 text-amber-800 border border-amber-200/60 hover:bg-amber-100"
              }`}
            >
              <span>Pending Approvals</span>
              <span className="h-4 w-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
                {metrics.pendingApproval}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("APPROVED")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1 ${
                statusFilter === "APPROVED"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-blue-50 text-blue-800 border border-blue-200/60 hover:bg-blue-100"
              }`}
            >
              <span>Approved (Ready)</span>
              <span className="h-4 w-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
                {metrics.approved}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("SENT")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1 ${
                statusFilter === "SENT"
                  ? "bg-purple-600 text-white shadow-xs"
                  : "bg-purple-50 text-purple-800 border border-purple-200/60 hover:bg-purple-100"
              }`}
            >
              <span>Sent / Extended</span>
              <span className="h-4 w-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
                {metrics.sent}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("ACCEPTED")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1 ${
                statusFilter === "ACCEPTED"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-emerald-50 text-emerald-800 border border-emerald-200/60 hover:bg-emerald-100"
              }`}
            >
              <span>Accepted</span>
              <span className="h-4 w-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
                {metrics.accepted}
              </span>
            </button>
          </div>

          {/* Search + Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[240px]">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search candidate, role, req ID..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
              <svg className="w-4 h-4 text-slate-400 absolute left-2.5 top-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 font-medium focus:outline-hidden"
            >
              <option value="ALL">All Approval Tiers</option>
              <option value="LEVEL_1">Level 1: Hiring Manager</option>
              <option value="LEVEL_2">Level 2: Higher Level / VP</option>
              <option value="LEVEL_3">Level 3: Executive Finance</option>
            </select>
          </div>
        </div>

        {/* =====================================================================
            CANDIDATE OFFERS TABLE
        ===================================================================== */}
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Candidate &amp; Role</th>
                  <th className="py-3 px-4">Compensation Package</th>
                  <th className="py-3 px-4">Approval Chain Status</th>
                  <th className="py-3 px-4">Offer Status</th>
                  <th className="py-3 px-4">Start / Expire</th>
                  <th className="py-3 px-4 text-right">Recruiter &amp; Executive Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOffers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-xl mb-2 text-slate-400">
                        📄
                      </div>
                      <p className="font-semibold text-slate-700">No candidate offers match current filter</p>
                      <p className="text-slate-400 text-[11px] mt-0.5">Try resetting search or status filters</p>
                    </td>
                  </tr>
                ) : (
                  filteredOffers.map((offer) => {
                    const initials = offer.candidateName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2);

                    const isPendingApproval = offer.status === "Pending Approval";
                    const isApproved = offer.status === "Approved";
                    const isSent = offer.status === "Sent";
                    const isAccepted = offer.status === "Accepted";

                    return (
                      <tr key={offer.id} className="hover:bg-slate-50/70 transition group">
                        {/* 1. Candidate & Role */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-700 to-indigo-900 text-white font-black text-xs flex items-center justify-center shadow-xs shrink-0">
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <span className="font-bold text-slate-900 block truncate group-hover:text-blue-600 transition-colors">
                                {offer.candidateName}
                              </span>
                              <span className="text-[11px] text-slate-600 block truncate font-medium">
                                {offer.requisitionTitle}
                              </span>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded">
                                  {offer.requisitionId}
                                </span>
                                {offer.department && (
                                  <span className="text-[10px] text-slate-500 font-medium">
                                    • {offer.department}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 2. Compensation Package */}
                        <td className="py-3.5 px-4">
                          <div>
                            <span className="font-bold text-slate-900 font-mono block text-sm">
                              {offer.baseSalary}
                            </span>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                              {offer.variableBonus && <span>Bonus: {offer.variableBonus}</span>}
                              {offer.equity && <span>• Eq: {offer.equity}</span>}
                            </div>
                            {offer.compaRatio && (
                              <span className="inline-block mt-1 text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200/60 px-1.5 py-0.2 rounded">
                                Compa: {offer.compaRatio}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* 3. Multi-Tier Approval Chain Graphic */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5">
                              {offer.approvalChain && offer.approvalChain.length > 0 ? (
                                offer.approvalChain.map((step) => (
                                  <div
                                    key={step.level}
                                    className={`relative flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-black border transition ${
                                      step.status === "APPROVED"
                                        ? "bg-emerald-500 text-white border-emerald-600"
                                        : step.status === "PENDING"
                                        ? "bg-amber-400 text-amber-950 border-amber-500 animate-pulse ring-2 ring-amber-200"
                                        : "bg-slate-100 text-slate-400 border-slate-200"
                                    }`}
                                    title={`${step.title}: ${step.approverName} (${step.status}) ${step.comments ? `— ${step.comments}` : ""}`}
                                  >
                                    {step.status === "APPROVED" ? "✓" : step.level}
                                  </div>
                                ))
                              ) : (
                                <span className="text-[11px] text-slate-400">Single-Tier</span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-500 font-medium block">
                              {isPendingApproval
                                ? `Awaiting: Level ${offer.currentApprovalLevel || 2} Sign-off`
                                : isApproved || isSent || isAccepted
                                ? "All 3 Signatories Approved"
                                : "Drafting Package"}
                            </span>
                          </div>
                        </td>

                        {/* 4. Offer Status Badge */}
                        <td className="py-3.5 px-4">
                          {isPendingApproval ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping" />
                              Pending Level {offer.currentApprovalLevel || 2}
                            </span>
                          ) : isApproved ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                              Approved — Ready to Send
                            </span>
                          ) : isSent ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
                              <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                              Sent (DocuSign Active)
                            </span>
                          ) : isAccepted ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              Signed &amp; Accepted
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                              {offer.status}
                            </span>
                          )}
                        </td>

                        {/* 5. Start / Expire */}
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-slate-800 block">
                            {offer.targetStartDate}
                          </span>
                          {offer.expiresAt ? (
                            <span className="text-[10px] text-slate-400 block">
                              Exp: {offer.expiresAt}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 block">
                              Standard 7-Day Window
                            </span>
                          )}
                        </td>

                        {/* 6. Contextual Recruiter & Executive Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* A: Primary Action: Approve (if Pending) */}
                            {isPendingApproval && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedOffer(offer);
                                  setShowApproveModal(true);
                                }}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-2xs transition"
                              >
                                <span>⚡</span>
                                <span>Approve (Higher Level)</span>
                              </button>
                            )}

                            {/* B: Primary Action: Send Offer Letter (if Approved) */}
                            {isApproved && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedOffer(offer);
                                  setShowSendModal(true);
                                }}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-2xs transition"
                              >
                                <span>✉️</span>
                                <span>Send Offer Letter</span>
                              </button>
                            )}

                            {/* C: Action: Resend / View (if Sent) */}
                            {isSent && (
                              <button
                                type="button"
                                onClick={() => {
                                  triggerToast(`DocuSign signing reminder re-dispatched to ${offer.candidateName}.`);
                                }}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 font-semibold text-xs transition"
                              >
                                <span>🔄</span>
                                <span>Remind Candidate</span>
                              </button>
                            )}

                            {/* D: Action: View Offer & Letter Sheet */}
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedOffer(offer);
                                setShowDetailsModal(true);
                              }}
                              className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition"
                              title="Inspect compensation details & audit history"
                            >
                              <span>View Details</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* =====================================================================
            MODAL 1: SEND FORMAL OFFER LETTER TO CANDIDATE
        ===================================================================== */}
        {showSendModal && selectedOffer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                    Official Employment Agreement Dispatch
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1">
                    Send Offer Letter to {selectedOffer.candidateName}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSendModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Step 1: Summary Card */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <span className="text-slate-500 block text-[10px]">Position</span>
                  <span className="font-bold text-slate-900 block truncate">{selectedOffer.requisitionTitle}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Base Compensation</span>
                  <span className="font-bold text-slate-900 block">{selectedOffer.baseSalary}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Target Start</span>
                  <span className="font-bold text-slate-900 block">{selectedOffer.targetStartDate}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Candidate Email</span>
                  <span className="font-bold text-blue-600 block truncate">{selectedOffer.candidateEmail || "priya.menon@example.com"}</span>
                </div>
              </div>

              {/* Step 2: Template Selection */}
              <div className="space-y-1.5 text-xs">
                <label className="font-bold text-slate-800">Select Offer Letter Template</label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  <option value="tmpl-eng-01">Standard Full-Time Engineering Agreement (US / Global)</option>
                  <option value="tmpl-exec-01">Executive Leadership &amp; Officer Agreement (Includes Equity &amp; IP)</option>
                  <option value="tmpl-prod-01">UK / EMEA Standard Employment Contract</option>
                  <option value="tmpl-contract-01">Independent Contractor &amp; Advisory Agreement</option>
                </select>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                  <span>Templates managed in Configuration Studio</span>
                  <Link href="/configuration/recruitment?tab=offers" className="text-blue-600 hover:underline font-semibold">
                    Edit templates &rarr;
                  </Link>
                </div>
              </div>

              {/* Step 3: Interactive Letterhead Preview */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 text-xs shadow-inner max-h-56 overflow-y-auto font-serif leading-relaxed text-slate-700">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 font-sans">
                  <span className="font-black tracking-tight text-slate-900 text-sm">MAX ENTERPRISE CORP</span>
                  <span className="text-[10px] text-slate-400">OFFICIAL OFFER OF EMPLOYMENT</span>
                </div>
                <p>
                  <strong>Date:</strong> {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}
                </p>
                <p>
                  <strong>Dear {selectedOffer.candidateName},</strong>
                </p>
                <p>
                  On behalf of MAX Enterprise, we are thrilled to offer you the position of{" "}
                  <strong>{selectedOffer.requisitionTitle}</strong> in our {selectedOffer.department || "Enterprise Engineering"} division, reporting to your designated Engineering Director.
                </p>
                <p>
                  <strong>Compensation:</strong> Your starting annual base salary will be <strong>{selectedOffer.baseSalary}</strong>, payable bi-weekly. In addition, you are eligible for an annual incentive target of <strong>{selectedOffer.variableBonus || "15%"}</strong> and an initial equity grant of <strong>{selectedOffer.equity || "$50,000 RSUs"}</strong> subject to standard board vesting.
                </p>
                <p>
                  <strong>Start Date:</strong> Your anticipated start date will be <strong>{selectedOffer.targetStartDate}</strong>.
                </p>
                <p>
                  This offer is contingent upon successful background verification and standard proprietary rights agreements.
                </p>
                <div className="pt-2 flex justify-between items-end border-t border-slate-100 text-[10px] font-sans text-slate-500">
                  <span>Signatory: Elena Vance, VP of Engineering</span>
                  <span>Recipient: {selectedOffer.candidateName}</span>
                </div>
              </div>

              {/* Step 4: Delivery Options & Note */}
              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-4">
                  <label className="font-bold text-slate-800">Delivery Channel:</label>
                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="deliveryMethod"
                      checked={deliveryMethod === "DOCUSIGN"}
                      onChange={() => setDeliveryMethod("DOCUSIGN")}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="font-medium text-slate-700">DocuSign Secure E-Signature (Recommended)</span>
                  </label>
                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="deliveryMethod"
                      checked={deliveryMethod === "EMAIL_PDF"}
                      onChange={() => setDeliveryMethod("EMAIL_PDF")}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="font-medium text-slate-700">Official Encrypted PDF Attachment</span>
                  </label>
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Personalized Recruiter Note to Candidate</label>
                  <textarea
                    rows={2}
                    value={customCoverNote}
                    onChange={(e) => setCustomCoverNote(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowSendModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDispatchOfferLetter}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-xs flex items-center gap-1.5"
                >
                  <span>✉️</span>
                  <span>Dispatch Offer Letter Now</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            MODAL 2: HIGHER-LEVEL EXECUTIVE OFFER APPROVAL MODAL
        ===================================================================== */}
        {showApproveModal && selectedOffer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-black uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    Executive Governance &amp; Compensation Sign-off
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1">
                    Higher-Level Offer Approval: {selectedOffer.candidateName}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowApproveModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Candidate & Package Breakdown */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                  <div>
                    <span className="font-bold text-slate-900 text-sm block">{selectedOffer.candidateName}</span>
                    <span className="text-slate-600 font-medium block">{selectedOffer.requisitionTitle} ({selectedOffer.requisitionId})</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                      Level {selectedOffer.currentApprovalLevel || 2} Action Required
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-slate-500 text-[10px] block">Proposed Base Salary:</span>
                    <span className="font-bold text-slate-900 font-mono text-sm">{selectedOffer.baseSalary}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Target Variable Bonus:</span>
                    <span className="font-bold text-slate-900">{selectedOffer.variableBonus || "15% Target"}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Equity / RSUs Package:</span>
                    <span className="font-bold text-slate-900">{selectedOffer.equity || "$50,000 RSUs"}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Band Compa-Ratio:</span>
                    <span className="font-bold text-emerald-700">{selectedOffer.compaRatio || "103% of Midpoint"}</span>
                  </div>
                </div>
              </div>

              {/* Multi-Tier Approval Chain Status */}
              <div className="space-y-2 text-xs">
                <span className="font-bold text-slate-800 block">Approval Hierarchy &amp; Signoff Trail</span>
                <div className="space-y-2">
                  {selectedOffer.approvalChain?.map((step) => (
                    <div
                      key={step.level}
                      className={`p-3 rounded-xl border flex items-center justify-between ${
                        step.status === "APPROVED"
                          ? "bg-emerald-50/60 border-emerald-200 text-emerald-900"
                          : step.status === "PENDING"
                          ? "bg-amber-50/70 border-amber-300 text-amber-950 ring-1 ring-amber-300"
                          : "bg-slate-50 border-slate-200 text-slate-500"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
                            step.status === "APPROVED"
                              ? "bg-emerald-600 text-white"
                              : step.status === "PENDING"
                              ? "bg-amber-500 text-white animate-pulse"
                              : "bg-slate-200 text-slate-500"
                          }`}
                        >
                          {step.status === "APPROVED" ? "✓" : step.level}
                        </div>
                        <div>
                          <span className="font-bold block text-xs">{step.title}</span>
                          <span className="text-[11px] opacity-80 block">{step.approverName} ({step.approverRole})</span>
                        </div>
                      </div>

                      <div className="text-right text-[10px]">
                        <span className="font-bold block uppercase tracking-wider">{step.status}</span>
                        {step.decidedAt && <span className="opacity-70">{step.decidedAt}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Level 2 VP Governance: Workforce Central (EC Core) Position Slot Control */}
              {(selectedOffer.currentApprovalLevel || 2) >= 2 && !showRevisionInput && (
                <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/90 space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b border-indigo-200/80 pb-2">
                    <span className="font-bold text-indigo-950 flex items-center gap-1.5">
                      <span>🏛️</span>
                      <span>Workforce Central (EC Core) Position Slot Authorization</span>
                    </span>
                    <span className="text-[10px] font-bold bg-indigo-200/80 text-indigo-900 px-2 py-0.5 rounded-md">
                      Level 2 Governance
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-indigo-900 block mb-1">
                        Select Vacant Position Slot to Occupy:
                      </label>
                      <select
                        value={selectedPositionCode}
                        onChange={(e) => setSelectedPositionCode(e.target.value)}
                        className="w-full p-2 rounded-xl border border-indigo-300 bg-white text-slate-800 text-xs font-semibold focus:outline-hidden"
                      >
                        {positions
                          .filter((p) => p.status === "VACANT" || p.positionCode === "POS-ENG-002" || p.positionCode === "POS-ENG-003")
                          .map((p) => (
                            <option key={p.positionCode} value={p.positionCode}>
                              {p.positionCode} — {p.title} ({p.department})
                            </option>
                          ))}
                        {positions.length === 0 && (
                          <option value="POS-ENG-002">POS-ENG-002 — Staff Cloud Architect (Engineering)</option>
                        )}
                      </select>
                      <span className="text-[10px] text-indigo-700/80 mt-1 block">
                        Cost Center: CC-ENG-101 • Approved FTE: 1.0 • Slot Status: Available
                      </span>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-indigo-900 block mb-1">
                        Executive Digital Signature Authentication:
                      </label>
                      <input
                        type="text"
                        value={digitalSignature}
                        onChange={(e) => setDigitalSignature(e.target.value)}
                        className="w-full p-2 rounded-xl border border-indigo-300 bg-white text-slate-800 text-xs font-mono font-bold focus:outline-hidden"
                        placeholder="Elena Vance (VP of Engineering)"
                      />
                      <span className="text-[10px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
                        <span>🔒</span>
                        <span>Authorized Signatory Credentials Verified</span>
                      </span>
                    </div>
                  </div>

                  {/* Auto-Handoff Checkbox */}
                  <div className="pt-2 border-t border-indigo-200/60 flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer select-none text-indigo-950 font-semibold text-xs">
                      <input
                        type="checkbox"
                        checked={autoHandoff}
                        onChange={(e) => setAutoHandoff(e.target.checked)}
                        className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                      />
                      <span>Trigger Autonomous ERP Handoff (occupy position slot &amp; initialize pre-onboarding)</span>
                    </label>
                    <span className="text-[10px] text-indigo-600 font-bold uppercase">Automated</span>
                  </div>
                </div>
              )}

              {/* Remarks or Revision Input */}
              {!showRevisionInput ? (
                <div className="space-y-1.5 text-xs">
                  <label className="font-bold text-slate-800 block">Executive Approval Sign-off Remarks</label>
                  <textarea
                    rows={2}
                    value={approvalRemarks}
                    onChange={(e) => setApprovalRemarks(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    placeholder="Enter approval note for audit record..."
                  />
                </div>
              ) : (
                <div className="space-y-1.5 text-xs bg-amber-50 p-3 rounded-xl border border-amber-200">
                  <label className="font-bold text-amber-900 block">Compensation Revision Instructions for Recruiter</label>
                  <textarea
                    rows={2}
                    value={revisionFeedback}
                    onChange={(e) => setRevisionFeedback(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-amber-300 bg-white text-slate-800 focus:outline-hidden"
                    placeholder="Specify required compensation or terms adjustments (e.g. reduce sign-on bonus to $15K)..."
                  />
                </div>
              )}

              {/* Decision Actions */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
                {!showRevisionInput ? (
                  <button
                    type="button"
                    onClick={() => setShowRevisionInput(true)}
                    className="text-xs font-semibold text-amber-800 hover:text-amber-950 underline"
                  >
                    Request Compensation Revision
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowRevisionInput(false)}
                    className="text-xs font-semibold text-slate-600 hover:text-slate-800 underline"
                  >
                    Back to Approval
                  </button>
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowApproveModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700"
                  >
                    Cancel
                  </button>

                  {!showRevisionInput ? (
                    <button
                      type="button"
                      onClick={handleExecuteApproval}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-xs font-bold text-white shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>✓</span>
                      <span>
                        {(selectedOffer.currentApprovalLevel || 2) >= 2 && autoHandoff
                          ? "Authorize Level 2 VP Sign-off & Execute ERP Handoff"
                          : "Approve Offer (Higher Level)"}
                      </span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleRequestRevision}
                      className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-xs font-bold text-white shadow-xs"
                    >
                      Submit Revision Request
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            MODAL 3: CANDIDATE OFFER DETAILS & AUDIT TRAIL MODAL
        ===================================================================== */}
        {showDetailsModal && selectedOffer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500">Candidate Offer Sheet</span>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">{selectedOffer.candidateName}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDetailsModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Requisition:</span>
                    <span className="font-bold text-slate-800">{selectedOffer.requisitionTitle} ({selectedOffer.requisitionId})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Department:</span>
                    <span className="font-semibold text-slate-800">{selectedOffer.department || "Engineering"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Target Start Date:</span>
                    <span className="font-semibold text-slate-800">{selectedOffer.targetStartDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Status:</span>
                    <span className="font-bold text-blue-700">{selectedOffer.status}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200 space-y-1.5">
                  <span className="font-bold text-blue-900 block">Total Target Earnings</span>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Base Salary:</span>
                    <span className="font-mono font-bold text-slate-900">{selectedOffer.baseSalary}</span>
                  </div>
                  {selectedOffer.variableBonus && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Target Variable Bonus:</span>
                      <span className="font-semibold text-slate-800">{selectedOffer.variableBonus}</span>
                    </div>
                  )}
                  {selectedOffer.equity && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Equity Grant:</span>
                      <span className="font-semibold text-slate-800">{selectedOffer.equity}</span>
                    </div>
                  )}
                  {selectedOffer.signOnBonus && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Sign-on Bonus:</span>
                      <span className="font-semibold text-slate-800">{selectedOffer.signOnBonus}</span>
                    </div>
                  )}
                </div>

                {selectedOffer.notes && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="font-bold text-slate-800 block mb-1">Audit Notes</span>
                    <p className="text-slate-600 text-[11px] leading-relaxed">{selectedOffer.notes}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            MODAL 4: PREPARE NEW OFFER MODAL
        ===================================================================== */}
        {showNewOfferModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">Prepare New Candidate Offer</h3>
                <button
                  type="button"
                  onClick={() => setShowNewOfferModal(false)}
                  className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Candidate Full Name</label>
                  <input
                    type="text"
                    value={newCandidateName}
                    onChange={(e) => setNewCandidateName(e.target.value)}
                    placeholder="E.g. Samantha Wright"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Job Title</label>
                    <input
                      type="text"
                      value={newRequisitionTitle}
                      onChange={(e) => setNewRequisitionTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Requisition ID</label>
                    <input
                      type="text"
                      value={newReqId}
                      onChange={(e) => setNewReqId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Base Salary</label>
                    <input
                      type="text"
                      value={newBaseSalary}
                      onChange={(e) => setNewBaseSalary(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Target Start Date</label>
                    <input
                      type="text"
                      value={newStartDate}
                      onChange={(e) => setNewStartDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewOfferModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateNewOffer}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs"
                >
                  Create Offer Package
                </button>
              </div>
            </div>
          </div>
        )}
        {/* =====================================================================
            MODAL 5: ERP HANDOFF & WORKFORCE CENTRAL CONFIRMATION RECEIPT
        ===================================================================== */}
        {showHandoffModal && handoffReceipt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-lg font-black shrink-0">
                    ✓
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      Workforce Central (EC Core) Position Synchronized
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5">
                      Executive Sign-off &amp; ERP Handoff Complete
                    </h3>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowHandoffModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Occupied Position Slot Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/50 border border-indigo-200/90 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-indigo-100 pb-2.5">
                  <div>
                    <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">
                      Occupied Position Slot
                    </span>
                    <span className="font-extrabold text-slate-900 text-sm">
                      {handoffReceipt.positionCodeAllocated || "POS-ENG-002"} — {handoffReceipt.positionTitle || "Staff Cloud Infrastructure Architect"}
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    ● Status: FILLED
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-slate-700">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Appointed Incumbent:</span>
                    <span className="font-bold text-slate-900">{handoffReceipt.candidateName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Department &amp; Cost Center:</span>
                    <span className="font-bold text-slate-900">{handoffReceipt.department} ({handoffReceipt.costCenter})</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Corporate Email Allocated:</span>
                    <span className="font-bold text-blue-700 font-mono">{handoffReceipt.workEmailAllocated}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Pre-Onboarding Target Start:</span>
                    <span className="font-bold text-slate-900">{handoffReceipt.startDate}</span>
                  </div>
                </div>
              </div>

              {/* Digital Governance Audit Badge */}
              <div className="p-3.5 rounded-xl bg-slate-900 text-slate-200 text-xs space-y-1.5 font-mono">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Cryptographic Sign-off Hash:</span>
                  <span className="text-emerald-400 font-bold">{handoffReceipt.digitalSignatureAuditHash || "SIG-VP-2026-AUTH"}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Executive Authorizer:</span>
                  <span className="text-white font-bold">{handoffReceipt.approvedBy || "Elena Vance (VP of Engineering)"}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Platform State:</span>
                  <span className="text-cyan-400 font-bold">SYNCHRONIZED_TO_EC_CORE</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <Link
                  href="/workforce"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800"
                >
                  <span>🏛️ View in Workforce Central</span>
                  <span>&rarr;</span>
                </Link>

                <button
                  type="button"
                  onClick={() => setShowHandoffModal(false)}
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition"
                >
                  Done &amp; Close Receipt
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RecruitingShell>
  );
}
