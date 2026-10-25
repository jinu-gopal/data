"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import MaxShell from "@/components/max/MaxShell";
import {
  EcCoreConfig,
  JobLevelConfig,
  CustomFieldConfig,
  LeaveTypePolicyConfig,
  OnboardingChecklistConfig,
} from "@/app/api/configuration/ec-core/route";

export default function EcCoreConfigurationPage() {
  const [config, setConfig] = useState<EcCoreConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "positions" | "orgStructure" | "peopleProfile" | "timeOff" | "hireToRetire"
  >("positions");
  const [savedBanner, setSavedBanner] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // New Job Level Modal
  const [showJobLevelModal, setShowJobLevelModal] = useState(false);
  const [newJobLevel, setNewJobLevel] = useState<JobLevelConfig>({
    code: "",
    name: "",
    band: "Band 4",
    minSalaryUsd: 120000,
    midSalaryUsd: 150000,
    maxSalaryUsd: 180000,
  });

  // New Custom Field Modal
  const [showCustomFieldModal, setShowCustomFieldModal] = useState(false);
  const [newCustomField, setNewCustomField] = useState<CustomFieldConfig>({
    id: `cf-${Date.now()}`,
    key: "",
    label: "",
    type: "TEXT",
    section: "PERSONAL",
    required: false,
  });

  // New Leave Type Modal
  const [showLeaveTypeModal, setShowLeaveTypeModal] = useState(false);
  const [newLeaveType, setNewLeaveType] = useState<LeaveTypePolicyConfig>({
    code: "",
    name: "",
    annualDays: 10,
    accrualMethod: "MONTHLY_ACCRUAL",
    maxCarryoverDays: 5,
    noticeDaysRequired: 3,
    requiresAttachment: false,
    enabled: true,
  });

  // New Onboarding Task Modal
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [newOnboardingTask, setNewOnboardingTask] = useState<OnboardingChecklistConfig>({
    id: `chk-${Date.now()}`,
    taskName: "",
    category: "HR",
    mandatory: true,
    enabled: true,
  });

  // New Offboarding Asset input
  const [newAssetInput, setNewAssetInput] = useState("");

  const loadConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/configuration/ec-core");
      if (res.ok) {
        setConfig(await res.json());
      }
    } catch (err) {
      console.error("Failed to load EC Core config", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const triggerBanner = (msg: string) => {
    setSavedBanner(msg);
    setTimeout(() => setSavedBanner(null), 4000);
  };

  const handleSaveAll = async () => {
    if (!config) return;
    setSaving(true);
    try {
      const res = await fetch("/api/configuration/ec-core", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      if (res.ok) {
        triggerBanner("✓ All Employee Central configurations saved successfully.");
      } else {
        alert("Failed to save configuration.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Handlers for Position Job Levels
  const handleAddJobLevel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!config || !newJobLevel.code || !newJobLevel.name) return;
    const updated = {
      ...config,
      positions: {
        ...config.positions,
        jobLevels: [...config.positions.jobLevels, newJobLevel],
      },
    };
    setConfig(updated);
    setShowJobLevelModal(false);
    setNewJobLevel({
      code: "",
      name: "",
      band: "Band 4",
      minSalaryUsd: 120000,
      midSalaryUsd: 150000,
      maxSalaryUsd: 180000,
    });
    triggerBanner(`✓ Added job level: ${newJobLevel.code}`);
  };

  const handleDeleteJobLevel = (code: string) => {
    if (!config) return;
    const updated = {
      ...config,
      positions: {
        ...config.positions,
        jobLevels: config.positions.jobLevels.filter((jl) => jl.code !== code),
      },
    };
    setConfig(updated);
    triggerBanner(`✓ Removed job level: ${code}`);
  };

  // Handlers for Custom Fields
  const handleAddCustomField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!config || !newCustomField.key || !newCustomField.label) return;
    const updated = {
      ...config,
      peopleProfile: {
        ...config.peopleProfile,
        customFields: [...config.peopleProfile.customFields, newCustomField],
      },
    };
    setConfig(updated);
    setShowCustomFieldModal(false);
    setNewCustomField({
      id: `cf-${Date.now()}`,
      key: "",
      label: "",
      type: "TEXT",
      section: "PERSONAL",
      required: false,
    });
    triggerBanner(`✓ Added custom field: "${newCustomField.label}"`);
  };

  const handleDeleteCustomField = (id: string) => {
    if (!config) return;
    const updated = {
      ...config,
      peopleProfile: {
        ...config.peopleProfile,
        customFields: config.peopleProfile.customFields.filter((cf) => cf.id !== id),
      },
    };
    setConfig(updated);
    triggerBanner("✓ Removed custom field.");
  };

  // Handlers for Leave Types
  const handleAddLeaveType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!config || !newLeaveType.code || !newLeaveType.name) return;
    const updated = {
      ...config,
      timeOff: {
        ...config.timeOff,
        leaveTypes: [...config.timeOff.leaveTypes, newLeaveType],
      },
    };
    setConfig(updated);
    setShowLeaveTypeModal(false);
    setNewLeaveType({
      code: "",
      name: "",
      annualDays: 10,
      accrualMethod: "MONTHLY_ACCRUAL",
      maxCarryoverDays: 5,
      noticeDaysRequired: 3,
      requiresAttachment: false,
      enabled: true,
    });
    triggerBanner(`✓ Added leave policy: ${newLeaveType.name}`);
  };

  const handleToggleLeaveType = (code: string) => {
    if (!config) return;
    const updated = {
      ...config,
      timeOff: {
        ...config.timeOff,
        leaveTypes: config.timeOff.leaveTypes.map((lt) =>
          lt.code === code ? { ...lt, enabled: !lt.enabled } : lt
        ),
      },
    };
    setConfig(updated);
  };

  // Handlers for Onboarding Tasks
  const handleAddOnboardingTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!config || !newOnboardingTask.taskName) return;
    const updated = {
      ...config,
      hireToRetire: {
        ...config.hireToRetire,
        onboardingChecklist: [...config.hireToRetire.onboardingChecklist, newOnboardingTask],
      },
    };
    setConfig(updated);
    setShowOnboardingModal(false);
    setNewOnboardingTask({
      id: `chk-${Date.now()}`,
      taskName: "",
      category: "HR",
      mandatory: true,
      enabled: true,
    });
    triggerBanner("✓ Added pre-onboarding task.");
  };

  const handleToggleOnboardingTask = (id: string) => {
    if (!config) return;
    const updated = {
      ...config,
      hireToRetire: {
        ...config.hireToRetire,
        onboardingChecklist: config.hireToRetire.onboardingChecklist.map((task) =>
          task.id === id ? { ...task, enabled: !task.enabled } : task
        ),
      },
    };
    setConfig(updated);
  };

  const handleAddAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!config || !newAssetInput.trim()) return;
    const updated = {
      ...config,
      hireToRetire: {
        ...config.hireToRetire,
        offboardingAssets: [...config.hireToRetire.offboardingAssets, newAssetInput.trim()],
      },
    };
    setConfig(updated);
    setNewAssetInput("");
    triggerBanner("✓ Added offboarding asset.");
  };

  const handleRemoveAsset = (idx: number) => {
    if (!config) return;
    const updated = {
      ...config,
      hireToRetire: {
        ...config.hireToRetire,
        offboardingAssets: config.hireToRetire.offboardingAssets.filter((_, i) => i !== idx),
      },
    };
    setConfig(updated);
  };

  if (loading || !config) {
    return (
      <MaxShell>
        <div className="flex h-96 items-center justify-center text-xs text-slate-400">
          Loading EC Core Configuration Studio...
        </div>
      </MaxShell>
    );
  }

  return (
    <MaxShell>
      <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto">
        {/* BANNER NOTIFICATION */}
        {savedBanner && (
          <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400 shadow-lg">
            <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">{savedBanner}</span>
          </div>
        )}

        {/* PAGE HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-2xl border border-slate-200 bg-white shadow-2xs">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Link
                href="/configuration"
                className="text-xs text-slate-500 hover:text-slate-900 transition flex items-center gap-1 font-semibold"
              >
                &larr; Configuration Hub
              </Link>
              <span className="text-slate-300">&bull;</span>
              <span className="rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                EC Core HR Customization Studio
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight font-sans">
              Employee Central Customization & Setup
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl">
              Customer administrative console to configure Position salary bands, 5-tier Org Structure rules, Custom People Profile fields, Statutory Leave policies, and Hire-to-Retire workflow checklists.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/workforce"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
            >
              Open Workforce Studio &rarr;
            </Link>

            <button
              onClick={handleSaveAll}
              disabled={saving}
              className="rounded-xl bg-blue-600 hover:bg-blue-700 px-5 py-2 text-xs font-semibold text-white shadow-2xs transition disabled:opacity-50"
            >
              {saving ? "Saving Changes..." : "✓ Save All Changes"}
            </button>
          </div>
        </div>

        {/* 5 CONFIGURATION TABS NAVIGATION */}
        <div className="border-b border-slate-200">
          <nav className="flex space-x-2 sm:space-x-6 overflow-x-auto pb-1" aria-label="Tabs">
            {[
              { id: "positions", label: "1. Position & Salary Bands", badge: `${config.positions.jobLevels.length} Levels` },
              { id: "orgStructure", label: "2. Organisation Tiers", badge: config.orgStructure.primaryCurrency },
              { id: "peopleProfile", label: "3. People Profile & Custom Fields", badge: `${config.peopleProfile.customFields.length} Fields` },
              { id: "timeOff", label: "4. Time Off Policies", badge: `${config.timeOff.leaveTypes.length} Types` },
              { id: "hireToRetire", label: "5. Hire-to-Retire Workflows", badge: "H2R Setup" },
            ].map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center gap-2 border-b-2 py-3 px-1 text-xs font-bold whitespace-nowrap transition ${
                    active
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800"
                  }`}
                >
                  {tab.label}
                  {tab.badge && (
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-mono ${active ? "bg-blue-100 text-blue-700 font-bold" : "bg-slate-100 text-slate-600"}`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* =====================================================================
         * TAB 1: POSITION MANAGEMENT & SALARY BANDS
         * ===================================================================== */}
        {activeTab === "positions" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2 text-xs">
                <label className="text-slate-700 block font-semibold">Position Code Prefix</label>
                <input
                  type="text"
                  value={config.positions.codePrefix}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      positions: { ...config.positions, codePrefix: e.target.value },
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 text-slate-900 px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                />
                <span className="text-[10px] text-slate-500 block">Prefix applied to all created slots (e.g. POS-ENG-101)</span>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2 text-xs">
                <label className="text-slate-700 block font-semibold">Fractional FTE Support</label>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-300">Allow Part-Time (0.5 / 0.8 FTE)</span>
                  <input
                    type="checkbox"
                    checked={config.positions.allowFractionalFte}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        positions: { ...config.positions, allowFractionalFte: e.target.checked },
                      })
                    }
                    className="h-4 w-4 rounded border-slate-200 bg-slate-50 text-slate-900 text-blue-600 focus:ring-blue-500"
                  />
                </div>
                <span className="text-[10px] text-slate-500 block">Permits slots with non-1.0 FTE allocations</span>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2 text-xs">
                <label className="text-slate-700 block font-semibold">Automated Requisition Trigger</label>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-300">Trigger Backfill on Vacancy</span>
                  <input
                    type="checkbox"
                    checked={config.positions.autoTriggerRequisitionsOnVacancy}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        positions: {
                          ...config.positions,
                          autoTriggerRequisitionsOnVacancy: e.target.checked,
                        },
                      })
                    }
                    className="h-4 w-4 rounded border-slate-200 bg-slate-50 text-slate-900 text-blue-600 focus:ring-blue-500"
                  />
                </div>
                <span className="text-[10px] text-slate-500 block">Notifies recruiting whenever a position is vacated</span>
              </div>
            </div>

            {/* JOB LEVELS & SALARY BANDS TABLE */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Configured Job Levels & Salary Benchmark Bands</h3>
                  <p className="text-xs text-slate-400">Define min, midpoint, and max compensation ranges for every grade.</p>
                </div>

                <button
                  onClick={() => setShowJobLevelModal(true)}
                  className="rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-500 transition"
                >
                  + Add Job Level
                </button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Level Code</th>
                      <th className="px-4 py-3">Classification Name</th>
                      <th className="px-4 py-3">Band</th>
                      <th className="px-4 py-3 font-mono">Min Salary (USD)</th>
                      <th className="px-4 py-3 font-mono text-emerald-400">Midpoint (USD)</th>
                      <th className="px-4 py-3 font-mono">Max Salary (USD)</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {config.positions.jobLevels.map((jl) => (
                      <tr key={jl.code} className="hover:bg-slate-50/50 transition">
                        <td className="px-4 py-3 font-mono text-blue-400 font-bold">{jl.code}</td>
                        <td className="px-4 py-3 text-slate-900 font-bold">{jl.name}</td>
                        <td className="px-4 py-3 text-slate-400">{jl.band}</td>
                        <td className="px-4 py-3 font-mono text-slate-300">${jl.minSalaryUsd.toLocaleString()}</td>
                        <td className="px-4 py-3 font-mono text-emerald-400 font-bold">${jl.midSalaryUsd.toLocaleString()}</td>
                        <td className="px-4 py-3 font-mono text-slate-300">${jl.maxSalaryUsd.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleDeleteJobLevel(jl.code)}
                            className="text-red-400 hover:text-red-300 text-xs"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
         * TAB 2: ORGANISATION TIERS & CURRENCY
         * ===================================================================== */}
        {activeTab === "orgStructure" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2 text-xs">
                <label className="text-slate-700 block font-semibold">Consolidated Reporting Currency</label>
                <select
                  value={config.orgStructure.primaryCurrency}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      orgStructure: { ...config.orgStructure, primaryCurrency: e.target.value },
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 text-slate-900 px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                >
                  <option value="USD">USD ($) - United States Dollar</option>
                  <option value="EUR">EUR (€) - Euro</option>
                  <option value="GBP">GBP (£) - British Pound Sterling</option>
                  <option value="SGD">SGD (S$) - Singapore Dollar</option>
                  <option value="INR">INR (₹) - Indian Rupee</option>
                </select>
                <span className="text-[10px] text-slate-500 block">Base currency used for multi-entity rollups</span>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2 text-xs">
                <label className="text-slate-700 block font-semibold">Cost Center Tagging Rule</label>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-300">Mandatory on All Positions</span>
                  <input
                    type="checkbox"
                    checked={config.orgStructure.mandatoryCostCenterTagging}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        orgStructure: {
                          ...config.orgStructure,
                          mandatoryCostCenterTagging: e.target.checked,
                        },
                      })
                    }
                    className="h-4 w-4 rounded border-slate-200 bg-slate-50 text-slate-900 text-blue-600 focus:ring-blue-500"
                  />
                </div>
                <span className="text-[10px] text-slate-500 block">Blocks position creation without valid cost center code</span>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2 text-xs">
                <label className="text-slate-700 block font-semibold">Budget Variance Alert Threshold (%)</label>
                <input
                  type="number"
                  min="50"
                  max="100"
                  value={config.orgStructure.budgetVarianceAlertPct}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      orgStructure: {
                        ...config.orgStructure,
                        budgetVarianceAlertPct: parseInt(e.target.value) || 90,
                      },
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 text-slate-900 px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                />
                <span className="text-[10px] text-slate-500 block">Alert triggers when departmental salary exceeds threshold</span>
              </div>
            </div>

            {/* ORGANIZATIONAL TIERS CONFIGURATION */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-4">
              <div className="border-b border-slate-200 pb-3">
                <h3 className="text-base font-bold text-slate-900">Configurable 5-Tier Organizational Hierarchy</h3>
                <p className="text-xs text-slate-400">Enable or rename structural tiers to reflect your enterprise organization model.</p>
              </div>

              <div className="space-y-2">
                {config.orgStructure.enabledTiers.map((tier, idx) => (
                  <div
                    key={tier.tierKey}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="h-6 w-6 rounded-full bg-slate-800 flex items-center justify-center font-mono font-bold text-slate-400 text-[11px]">
                        {idx + 1}
                      </span>
                      <div>
                        <span className="text-slate-900 font-bold">{tier.tierName}</span>
                        <span className="text-[10px] text-slate-500 font-mono block">{tier.tierKey}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <input
                        type="text"
                        value={tier.tierName}
                        onChange={(e) => {
                          const updatedTiers = [...config.orgStructure.enabledTiers];
                          updatedTiers[idx].tierName = e.target.value;
                          setConfig({
                            ...config,
                            orgStructure: { ...config.orgStructure, enabledTiers: updatedTiers },
                          });
                        }}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-900 text-xs w-48"
                      />

                      <label className="flex items-center gap-2 cursor-pointer">
                        <span className="text-slate-400 text-xs">{tier.enabled ? "Enabled" : "Disabled"}</span>
                        <input
                          type="checkbox"
                          checked={tier.enabled}
                          onChange={(e) => {
                            const updatedTiers = [...config.orgStructure.enabledTiers];
                            updatedTiers[idx].enabled = e.target.checked;
                            setConfig({
                              ...config,
                              orgStructure: { ...config.orgStructure, enabledTiers: updatedTiers },
                            });
                          }}
                          className="h-4 w-4 rounded border-slate-200 bg-slate-50 text-blue-600 focus:ring-blue-500"
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
         * TAB 3: PEOPLE PROFILE & CUSTOM FIELD BUILDER
         * ===================================================================== */}
        {activeTab === "peopleProfile" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2 text-xs">
                <label className="text-slate-700 block font-semibold">PII Data Privacy Masking</label>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-300">Mask Passports & Accounts</span>
                  <input
                    type="checkbox"
                    checked={config.peopleProfile.maskSensitiveData}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        peopleProfile: { ...config.peopleProfile, maskSensitiveData: e.target.checked },
                      })
                    }
                    className="h-4 w-4 rounded border-slate-200 bg-slate-50 text-slate-900 text-blue-600 focus:ring-blue-500"
                  />
                </div>
                <span className="text-[10px] text-slate-500 block">Displays ******8841 format for non-admins</span>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2 text-xs">
                <label className="text-slate-700 block font-semibold">I-9 Right to Work Audit Window (Days)</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={config.peopleProfile.i9VerificationWindowDays}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      peopleProfile: {
                        ...config.peopleProfile,
                        i9VerificationWindowDays: parseInt(e.target.value) || 3,
                      },
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 text-slate-900 px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                />
                <span className="text-[10px] text-slate-500 block">Statutory window from first day of employment</span>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2 text-xs">
                <label className="text-slate-700 block font-semibold">Default Probation Duration (Days)</label>
                <input
                  type="number"
                  min="30"
                  max="365"
                  value={config.peopleProfile.defaultProbationDays}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      peopleProfile: {
                        ...config.peopleProfile,
                        defaultProbationDays: parseInt(e.target.value) || 180,
                      },
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 text-slate-900 px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                />
                <span className="text-[10px] text-slate-500 block">Pre-populates probation end date for new hires</span>
              </div>
            </div>

            {/* CUSTOM FIELDS STUDIO */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Custom Profile Fields & User-Defined Attributes</h3>
                  <p className="text-xs text-slate-400">Extend standard employee dossiers with customer-specific metadata.</p>
                </div>

                <button
                  onClick={() => setShowCustomFieldModal(true)}
                  className="rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-500 transition"
                >
                  + Add Custom Field
                </button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Attribute Key</th>
                      <th className="px-4 py-3">Label</th>
                      <th className="px-4 py-3">Field Type</th>
                      <th className="px-4 py-3">Dossier Section</th>
                      <th className="px-4 py-3">Mandatory</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {config.peopleProfile.customFields.map((cf) => (
                      <tr key={cf.id} className="hover:bg-slate-50/50 transition">
                        <td className="px-4 py-3 font-mono text-purple-400 font-bold">{cf.key}</td>
                        <td className="px-4 py-3 text-slate-900 font-bold">{cf.label}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                            {cf.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-300">{cf.section}</td>
                        <td className="px-4 py-3">
                          {cf.required ? (
                            <span className="text-emerald-400 font-bold">&check; Required</span>
                          ) : (
                            <span className="text-slate-500">Optional</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleDeleteCustomField(cf.id)}
                            className="text-red-400 hover:text-red-300 text-xs"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
         * TAB 4: TIME OFF & ABSENCES POLICIES MATRIX
         * ===================================================================== */}
        {activeTab === "timeOff" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2 text-xs">
                <label className="text-slate-700 block font-semibold">Approval Auto-Deduction</label>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-300">Deduct Balance on Approval</span>
                  <input
                    type="checkbox"
                    checked={config.timeOff.autoDeductBalancesOnApproval}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        timeOff: {
                          ...config.timeOff,
                          autoDeductBalancesOnApproval: e.target.checked,
                        },
                      })
                    }
                    className="h-4 w-4 rounded border-slate-200 bg-slate-50 text-slate-900 text-blue-600 focus:ring-blue-500"
                  />
                </div>
                <span className="text-[10px] text-slate-500 block">Immediately reflects in available days wallet</span>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2 text-xs">
                <label className="text-slate-700 block font-semibold">Partial-Day Absences</label>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-300">Allow Half-Day Requests (0.5d)</span>
                  <input
                    type="checkbox"
                    checked={config.timeOff.allowHalfDayRequests}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        timeOff: {
                          ...config.timeOff,
                          allowHalfDayRequests: e.target.checked,
                        },
                      })
                    }
                    className="h-4 w-4 rounded border-slate-200 bg-slate-50 text-slate-900 text-blue-600 focus:ring-blue-500"
                  />
                </div>
                <span className="text-[10px] text-slate-500 block">Enables half-day morning/afternoon PTO</span>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2 text-xs">
                <label className="text-slate-700 block font-semibold">Carryover Expiry Cutoff</label>
                <select
                  value={config.timeOff.carryoverExpiryMonth}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      timeOff: {
                        ...config.timeOff,
                        carryoverExpiryMonth: parseInt(e.target.value) || 3,
                      },
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 text-slate-900 px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                >
                  <option value={3}>March 31 (Q1 End)</option>
                  <option value={6}>June 30 (Mid-Year)</option>
                  <option value={12}>December 31 (Full Year)</option>
                </select>
                <span className="text-[10px] text-slate-500 block">Statutory forfeiture date for unspent carried leave</span>
              </div>
            </div>

            {/* LEAVE TYPES MATRIX */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Statutory Leave Policies & Accrual Rules</h3>
                  <p className="text-xs text-slate-400">Configure entitlements, carryover rules, and notice periods for all absence types.</p>
                </div>

                <button
                  onClick={() => setShowLeaveTypeModal(true)}
                  className="rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-500 transition"
                >
                  + Add Leave Type
                </button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Code</th>
                      <th className="px-4 py-3">Policy Name</th>
                      <th className="px-4 py-3 font-mono">Annual Days</th>
                      <th className="px-4 py-3">Accrual Method</th>
                      <th className="px-4 py-3 font-mono">Max Carryover</th>
                      <th className="px-4 py-3">Notice Days</th>
                      <th className="px-4 py-3">Medical Certificate</th>
                      <th className="px-4 py-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {config.timeOff.leaveTypes.map((lt) => (
                      <tr key={lt.code} className="hover:bg-slate-50/50 transition">
                        <td className="px-4 py-3 font-mono text-teal-400 font-bold">{lt.code}</td>
                        <td className="px-4 py-3 text-slate-900 font-bold">{lt.name}</td>
                        <td className="px-4 py-3 font-mono text-white">{lt.annualDays}d</td>
                        <td className="px-4 py-3 text-slate-300 text-[11px] font-mono">{lt.accrualMethod}</td>
                        <td className="px-4 py-3 font-mono text-slate-400">{lt.maxCarryoverDays}d</td>
                        <td className="px-4 py-3 text-slate-400">{lt.noticeDaysRequired}d</td>
                        <td className="px-4 py-3">
                          {lt.requiresAttachment ? (
                            <span className="text-amber-400 font-bold">Mandatory</span>
                          ) : (
                            <span className="text-slate-500">Optional</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleToggleLeaveType(lt.code)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition ${
                              lt.enabled
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : "bg-slate-800 text-slate-500 border border-slate-700"
                            }`}
                          >
                            {lt.enabled ? "Active" : "Disabled"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
         * TAB 5: HIRE-TO-RETIRE (H2R) WORKFLOWS & CHECKLISTS
         * ===================================================================== */}
        {activeTab === "hireToRetire" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2 text-xs">
                <label className="text-slate-700 block font-semibold">Employee ID Numbering Rule</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={config.hireToRetire.employeeIdPrefix}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        hireToRetire: { ...config.hireToRetire, employeeIdPrefix: e.target.value },
                      })
                    }
                    placeholder="Prefix (e.g. MX-)"
                    className="rounded-xl border border-slate-200 bg-slate-50 text-slate-900 px-3 py-2 text-white font-mono"
                  />
                  <input
                    type="number"
                    value={config.hireToRetire.nextEmployeeSequence}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        hireToRetire: {
                          ...config.hireToRetire,
                          nextEmployeeSequence: parseInt(e.target.value) || 1000,
                        },
                      })
                    }
                    placeholder="Start Seq"
                    className="rounded-xl border border-slate-200 bg-slate-50 text-slate-900 px-3 py-2 text-white font-mono"
                  />
                </div>
                <span className="text-[10px] text-slate-500 block">
                  Next generated ID: {config.hireToRetire.employeeIdPrefix}
                  {config.hireToRetire.nextEmployeeSequence}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2 text-xs">
                <label className="text-slate-700 block font-semibold">Position Vacating on Separation</label>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-300">Auto-Reset Slot to VACANT</span>
                  <input
                    type="checkbox"
                    checked={config.hireToRetire.autoVacatePositionOnSeparation}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        hireToRetire: {
                          ...config.hireToRetire,
                          autoVacatePositionOnSeparation: e.target.checked,
                        },
                      })
                    }
                    className="h-4 w-4 rounded border-slate-200 bg-slate-50 text-slate-900 text-blue-600 focus:ring-blue-500"
                  />
                </div>
                <span className="text-[10px] text-slate-500 block">Immediately frees position for recruitment backfill</span>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2 text-xs">
                <label className="text-slate-700 block font-semibold">Offboarding Asset Recovery Items</label>
                <span className="text-emerald-400 font-bold block">
                  {config.hireToRetire.offboardingAssets.length} Mandatory Asset Items
                </span>
                <span className="text-[10px] text-slate-500 block">Hardware & credentials checked during exit</span>
              </div>
            </div>

            {/* PRE-ONBOARDING TASKS SETUP */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Pre-Day 1 Onboarding Gates & Provisioning Tasks</h3>
                  <p className="text-xs text-slate-400">Configure tasks that incoming hires must complete before Day 1.</p>
                </div>

                <button
                  onClick={() => setShowOnboardingModal(true)}
                  className="rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-500 transition"
                >
                  + Add Onboarding Gate
                </button>
              </div>

              <div className="space-y-2">
                {config.hireToRetire.onboardingChecklist.map((task, idx) => (
                  <div
                    key={task.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="h-6 w-6 rounded-full bg-slate-800 flex items-center justify-center font-mono font-bold text-slate-400 text-[11px]">
                        {idx + 1}
                      </span>
                      <div>
                        <span className="text-slate-900 font-bold">{task.taskName}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-indigo-400">
                            {task.category}
                          </span>
                          {task.mandatory && (
                            <span className="text-[10px] text-amber-400 font-bold">&bull; Mandatory Gate</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleOnboardingTask(task.id)}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold transition ${
                        task.enabled
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-slate-800 text-slate-500 border border-slate-700"
                      }`}
                    >
                      {task.enabled ? "Active" : "Disabled"}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* OFFBOARDING ASSETS SETUP */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-4">
              <div className="border-b border-slate-200 pb-3">
                <h3 className="text-base font-bold text-slate-900">Offboarding Mandatory Asset Return Recovery List</h3>
                <p className="text-xs text-slate-400">Items that must be signed off by IT & Facilities before separation completion.</p>
              </div>

              <form onSubmit={handleAddAsset} className="flex gap-2">
                <input
                  type="text"
                  value={newAssetInput}
                  onChange={(e) => setNewAssetInput(e.target.value)}
                  placeholder="e.g. YubiKey 5C NFC Security Hardware Token"
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 transition"
                >
                  + Add Asset
                </button>
              </form>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                {config.hireToRetire.offboardingAssets.map((asset, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 flex items-center justify-between"
                  >
                    <span className="text-slate-300 font-medium">&bull; {asset}</span>
                    <button
                      onClick={() => handleRemoveAsset(idx)}
                      className="text-red-400 hover:text-red-300 text-xs font-bold"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
         * MODAL: ADD JOB LEVEL
         * ===================================================================== */}
        {showJobLevelModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xs p-6 shadow-2xl space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="text-base font-bold text-slate-900">Add Job Level & Salary Band</h3>
                <button
                  onClick={() => setShowJobLevelModal(false)}
                  className="text-slate-400 hover:text-white text-lg font-bold"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleAddJobLevel} className="space-y-3">
                <div>
                  <label className="text-slate-400 block mb-1">Level Code *</label>
                  <input
                    type="text"
                    required
                    value={newJobLevel.code}
                    onChange={(e) => setNewJobLevel({ ...newJobLevel, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. IC-6"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 text-slate-900 px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Classification Name *</label>
                  <input
                    type="text"
                    required
                    value={newJobLevel.name}
                    onChange={(e) => setNewJobLevel({ ...newJobLevel, name: e.target.value })}
                    placeholder="e.g. Fellow / Senior Director"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 text-slate-900 px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Band Label</label>
                  <input
                    type="text"
                    value={newJobLevel.band}
                    onChange={(e) => setNewJobLevel({ ...newJobLevel, band: e.target.value })}
                    placeholder="e.g. Band 6 (Fellow)"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 text-slate-900 px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 font-mono">
                  <div>
                    <label className="text-slate-400 block mb-1 text-[10px]">Min (USD)</label>
                    <input
                      type="number"
                      value={newJobLevel.minSalaryUsd}
                      onChange={(e) => setNewJobLevel({ ...newJobLevel, minSalaryUsd: parseInt(e.target.value) || 0 })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 text-slate-900 px-2.5 py-1.5 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1 text-[10px]">Mid (USD)</label>
                    <input
                      type="number"
                      value={newJobLevel.midSalaryUsd}
                      onChange={(e) => setNewJobLevel({ ...newJobLevel, midSalaryUsd: parseInt(e.target.value) || 0 })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 text-slate-900 px-2.5 py-1.5 text-emerald-400 font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1 text-[10px]">Max (USD)</label>
                    <input
                      type="number"
                      value={newJobLevel.maxSalaryUsd}
                      onChange={(e) => setNewJobLevel({ ...newJobLevel, maxSalaryUsd: parseInt(e.target.value) || 0 })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 text-slate-900 px-2.5 py-1.5 text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowJobLevelModal(false)}
                    className="rounded-xl bg-slate-800 px-4 py-2 text-slate-300 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-500"
                  >
                    Save Level
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* =====================================================================
         * MODAL: ADD CUSTOM FIELD
         * ===================================================================== */}
        {showCustomFieldModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xs p-6 shadow-2xl space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="text-base font-bold text-slate-900">Add Custom Profile Field</h3>
                <button
                  onClick={() => setShowCustomFieldModal(false)}
                  className="text-slate-400 hover:text-white text-lg font-bold"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleAddCustomField} className="space-y-3">
                <div>
                  <label className="text-slate-400 block mb-1">Field Label *</label>
                  <input
                    type="text"
                    required
                    value={newCustomField.label}
                    onChange={(e) =>
                      setNewCustomField({
                        ...newCustomField,
                        label: e.target.value,
                        key: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ""),
                      })
                    }
                    placeholder="e.g. Employee Parking Spot"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 text-slate-900 px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Attribute Key</label>
                  <input
                    type="text"
                    required
                    value={newCustomField.key}
                    onChange={(e) => setNewCustomField({ ...newCustomField, key: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 text-slate-900 px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1">Field Type</label>
                    <select
                      value={newCustomField.type}
                      onChange={(e) =>
                        setNewCustomField({ ...newCustomField, type: e.target.value as any })
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 text-slate-900 px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="TEXT">Text</option>
                      <option value="NUMBER">Number</option>
                      <option value="SELECT">Dropdown Select</option>
                      <option value="DATE">Date</option>
                      <option value="BOOLEAN">Boolean Switch</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Dossier Section</label>
                    <select
                      value={newCustomField.section}
                      onChange={(e) =>
                        setNewCustomField({ ...newCustomField, section: e.target.value as any })
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 text-slate-900 px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="PERSONAL">Personal Info</option>
                      <option value="JOB">Job & Org Placement</option>
                      <option value="COMPENSATION">Compensation</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-300">Mandatory on Dossier</span>
                  <input
                    type="checkbox"
                    checked={newCustomField.required}
                    onChange={(e) =>
                      setNewCustomField({ ...newCustomField, required: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-slate-200 bg-slate-50 text-slate-900 text-blue-600 focus:ring-blue-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowCustomFieldModal(false)}
                    className="rounded-xl bg-slate-800 px-4 py-2 text-slate-300 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-500"
                  >
                    Add Field
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* =====================================================================
         * MODAL: ADD LEAVE TYPE
         * ===================================================================== */}
        {showLeaveTypeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xs p-6 shadow-2xl space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="text-base font-bold text-slate-900">Add Leave Policy</h3>
                <button
                  onClick={() => setShowLeaveTypeModal(false)}
                  className="text-slate-400 hover:text-white text-lg font-bold"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleAddLeaveType} className="space-y-3">
                <div>
                  <label className="text-slate-400 block mb-1">Policy Name *</label>
                  <input
                    type="text"
                    required
                    value={newLeaveType.name}
                    onChange={(e) =>
                      setNewLeaveType({
                        ...newLeaveType,
                        name: e.target.value,
                        code: e.target.value.toUpperCase().replace(/[^A-Z]/g, "_"),
                      })
                    }
                    placeholder="e.g. Sabbatical Leave"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 text-slate-900 px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1">Code</label>
                    <input
                      type="text"
                      required
                      value={newLeaveType.code}
                      onChange={(e) => setNewLeaveType({ ...newLeaveType, code: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 text-slate-900 px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Annual Days</label>
                    <input
                      type="number"
                      value={newLeaveType.annualDays}
                      onChange={(e) =>
                        setNewLeaveType({ ...newLeaveType, annualDays: parseInt(e.target.value) || 0 })
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 text-slate-900 px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Accrual Method</label>
                  <select
                    value={newLeaveType.accrualMethod}
                    onChange={(e) =>
                      setNewLeaveType({ ...newLeaveType, accrualMethod: e.target.value as any })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 text-slate-900 px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="MONTHLY_ACCRUAL">Monthly Pro-Rata Accrual</option>
                    <option value="ANNUAL_FRONTLOAD">Annual Frontload on Jan 1</option>
                    <option value="EVENT_BASED">Event-Based (Birth, Bereavement, etc.)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-300">Requires Document Attachment</span>
                  <input
                    type="checkbox"
                    checked={newLeaveType.requiresAttachment}
                    onChange={(e) =>
                      setNewLeaveType({ ...newLeaveType, requiresAttachment: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-slate-200 bg-slate-50 text-slate-900 text-blue-600 focus:ring-blue-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowLeaveTypeModal(false)}
                    className="rounded-xl bg-slate-800 px-4 py-2 text-slate-300 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-500"
                  >
                    Save Policy
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* =====================================================================
         * MODAL: ADD ONBOARDING TASK
         * ===================================================================== */}
        {showOnboardingModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xs p-6 shadow-2xl space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="text-base font-bold text-slate-900">Add Pre-Onboarding Task Gate</h3>
                <button
                  onClick={() => setShowOnboardingModal(false)}
                  className="text-slate-400 hover:text-white text-lg font-bold"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleAddOnboardingTask} className="space-y-3">
                <div>
                  <label className="text-slate-400 block mb-1">Task Title *</label>
                  <input
                    type="text"
                    required
                    value={newOnboardingTask.taskName}
                    onChange={(e) =>
                      setNewOnboardingTask({ ...newOnboardingTask, taskName: e.target.value })
                    }
                    placeholder="e.g. Health Insurance Benefits Enrollment"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 text-slate-900 px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Functional Category</label>
                  <select
                    value={newOnboardingTask.category}
                    onChange={(e) =>
                      setNewOnboardingTask({
                        ...newOnboardingTask,
                        category: e.target.value as any,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 text-slate-900 px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="HR">People / HR Operations</option>
                    <option value="IT">IT & Hardware Provisioning</option>
                    <option value="COMPLIANCE">Legal & Statutory Compliance</option>
                    <option value="PEOPLE">Culture & Buddy Orientation</option>
                  </select>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-300">Mandatory Pre-Day 1 Gate</span>
                  <input
                    type="checkbox"
                    checked={newOnboardingTask.mandatory}
                    onChange={(e) =>
                      setNewOnboardingTask({ ...newOnboardingTask, mandatory: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-slate-200 bg-slate-50 text-slate-900 text-blue-600 focus:ring-blue-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowOnboardingModal(false)}
                    className="rounded-xl bg-slate-800 px-4 py-2 text-slate-300 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-500"
                  >
                    Add Task
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </MaxShell>
  );
}
