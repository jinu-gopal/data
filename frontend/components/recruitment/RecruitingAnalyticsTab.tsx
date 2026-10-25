"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface RecruitingAnalyticsTabProps {
  analyticsData: any;
}

export default function RecruitingAnalyticsTab({ analyticsData }: RecruitingAnalyticsTabProps) {
  const router = useRouter();

  // Active drilldown modal state
  const [activeModal, setActiveModal] = useState<"time-to-hire" | "cost-per-hire" | "offer-acceptance" | null>(null);

  const overview = analyticsData?.overview || {
    averageTimeToHireDays: 22.4,
    timeToHireTrendPct: -11.8,
    averageCostPerHireUsd: 4250,
    costPerHireTrendPct: -6.2,
    offerAcceptanceRatePct: 91.3,
    totalHiresYtd: 18,
    activeOpeningsCount: 6,
    pipelinePassThroughRatePct: 18.5,
  };

  const funnel = analyticsData?.funnelConversion || [
    { stage: "APPLIED", count: 184, conversionPct: 100 },
    { stage: "SCREENING", count: 68, conversionPct: 37.0 },
    { stage: "ASSESSMENT", count: 42, conversionPct: 22.8 },
    { stage: "INTERVIEW", count: 26, conversionPct: 14.1 },
    { stage: "OFFER", count: 12, conversionPct: 6.5 },
    { stage: "HIRED", count: 11, conversionPct: 6.0 },
  ];

  const channels = analyticsData?.channelPerformance || [
    { channel: "CAREERS_PORTAL", candidates: 74, hires: 5, costPerHireUsd: 850, qualityScore: 4.6 },
    { channel: "LINKEDIN", candidates: 62, hires: 3, costPerHireUsd: 3200, qualityScore: 4.4 },
    { channel: "EMPLOYEE_REFERRAL", candidates: 24, hires: 2, costPerHireUsd: 2000, qualityScore: 4.9 },
    { channel: "AGENCY_PARTNERS", candidates: 18, hires: 1, costPerHireUsd: 14500, qualityScore: 4.5 },
    { channel: "CAMPUS_OUTREACH", candidates: 6, hires: 0, costPerHireUsd: 1200, qualityScore: 3.8 },
  ];

  const departments = analyticsData?.departmentVelocity || [
    { department: "Engineering", openReqs: 2, targetHeadcount: 4, filledHeadcount: 2, avgDaysToFill: 24.1 },
    { department: "Sales", openReqs: 1, targetHeadcount: 3, filledHeadcount: 1, avgDaysToFill: 19.5 },
    { department: "Operations", openReqs: 1, targetHeadcount: 1, filledHeadcount: 0, avgDaysToFill: 28.0 },
    { department: "Finance", openReqs: 1, targetHeadcount: 1, filledHeadcount: 1, avgDaysToFill: 16.2 },
  ];

  const handleStageClick = (stage: string) => {
    const formatted = stage.charAt(0).toUpperCase() + stage.slice(1).toLowerCase();
    router.push(`/recruitment/candidates?stage=${formatted}`);
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="p-5 rounded-2xl border border-slate-200/90 bg-white shadow-2xs">
        <div className="flex items-center gap-2 mb-1">
          <span className="rounded-md bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-bold text-blue-700 uppercase tracking-wider">
            Executive SLA & Analytics
          </span>
          <span className="text-xs text-slate-400">•</span>
          <span className="text-xs text-slate-500">Pipeline Velocity, Funnel Conversion & Sourcing ROI</span>
        </div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">Recruitment Analytics & Executive SLA Dashboards</h2>
        <p className="text-xs text-slate-500 mt-1">
          Real-time measurement of hiring velocity, pass-through conversion dropoffs, channel quality ratings, and offer acceptance rates (OAR). <strong className="text-blue-600">Click any metric or funnel bar to inspect underlying records.</strong>
        </p>
      </div>

      {/* TOP 4 INTERACTIVE KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Time to Hire (Clickable) */}
        <div
          onClick={() => setActiveModal("time-to-hire")}
          className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs hover:shadow-md hover:border-blue-300 transition cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Average Time-to-Hire</span>
              <span className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition text-xs">&rarr;</span>
            </div>
            <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{overview.averageTimeToHireDays} Days</div>
            <div className="mt-1 text-[11px] text-emerald-600 font-semibold">{overview.timeToHireTrendPct}% faster than Q3 SLA</div>
          </div>
          <span className="text-[10px] text-blue-600 font-semibold mt-3 block">Click to view velocity breakdown</span>
        </div>

        {/* Card 2: Cost Per Hire (Clickable) */}
        <div
          onClick={() => setActiveModal("cost-per-hire")}
          className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs hover:shadow-md hover:border-emerald-300 transition cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Average Cost Per Hire</span>
              <span className="text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition text-xs">&rarr;</span>
            </div>
            <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900">${overview.averageCostPerHireUsd.toLocaleString()} USD</div>
            <div className="mt-1 text-[11px] text-emerald-600 font-semibold">{overview.costPerHireTrendPct}% cost efficiency gain</div>
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold mt-3 block">Click to view expense audit</span>
        </div>

        {/* Card 3: Offer Acceptance Rate (Clickable) */}
        <div
          onClick={() => setActiveModal("offer-acceptance")}
          className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs hover:shadow-md hover:border-purple-300 transition cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Offer Acceptance Rate (OAR)</span>
              <span className="text-slate-300 group-hover:text-purple-600 group-hover:translate-x-0.5 transition text-xs">&rarr;</span>
            </div>
            <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{overview.offerAcceptanceRatePct}%</div>
            <div className="mt-1 text-[11px] text-purple-600 font-semibold">11 Hired / 12 Offers Extended</div>
          </div>
          <span className="text-[10px] text-purple-600 font-semibold mt-3 block">Click to view offer decisions</span>
        </div>

        {/* Card 4: Total Hires YTD (Clickable -> Navigates to Hired Candidates) */}
        <div
          onClick={() => router.push("/recruitment/candidates?stage=Hired")}
          className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs hover:shadow-md hover:border-amber-300 transition cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Hires YTD</span>
              <span className="text-slate-300 group-hover:text-amber-600 group-hover:translate-x-0.5 transition text-xs">&rarr;</span>
            </div>
            <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{overview.totalHiresYtd} Engineers</div>
            <div className="mt-1 text-[11px] text-amber-600 font-semibold">{overview.activeOpeningsCount} Active Openings</div>
          </div>
          <span className="text-[10px] text-amber-700 font-semibold mt-3 block">Click to view hired talent pool</span>
        </div>
      </div>

      {/* RECRUITMENT FUNNEL CONVERSION (CLICKABLE STAGES) */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Candidate Pipeline Pass-Through Funnel</h3>
            <p className="text-xs text-slate-500">Stage-by-stage attrition and drop-off velocity analysis. Click any stage to inspect candidate list.</p>
          </div>
          <span className="text-xs font-mono text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            {overview.pipelinePassThroughRatePct}% Net Pass-Through
          </span>
        </div>

        <div className="space-y-3 pt-2">
          {funnel.map((step: any, idx: number) => {
            const barWidth = Math.max(step.conversionPct, 6);
            const colors = [
              "from-blue-600 to-indigo-600",
              "from-sky-500 to-blue-500",
              "from-purple-600 to-indigo-600",
              "from-amber-500 to-orange-500",
              "from-teal-500 to-emerald-500",
              "from-emerald-600 to-green-600",
            ];

            return (
              <div
                key={step.stage}
                onClick={() => handleStageClick(step.stage)}
                className="space-y-1.5 p-2 rounded-xl hover:bg-slate-50 transition cursor-pointer group"
                title={`Click to view ${step.count} candidates in ${step.stage} stage`}
              >
                <div className="flex justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-slate-400 font-bold">0{idx + 1}</span>
                    <span className="font-bold text-slate-900 group-hover:text-blue-600 transition">{step.stage}</span>
                    <span className="text-slate-500 font-mono text-[11px]">({step.count} candidates)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">{step.conversionPct}%</span>
                    <span className="text-[11px] text-blue-600 opacity-0 group-hover:opacity-100 transition">View &rarr;</span>
                  </div>
                </div>

                <div className="h-3.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div
                    className={`h-full bg-gradient-to-r ${colors[idx % colors.length]} transition-all duration-500`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* TWO COLUMN: SOURCING CHANNELS ROI & DEPARTMENT VELOCITY */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* SOURCING CHANNEL QUALITY & ROI */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Sourcing Channel ROI & Quality</h3>
              <p className="text-xs text-slate-500">Applicant volume vs cost per hire</p>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Quality Score / 5.0</span>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="text-[10px] text-slate-400 font-bold uppercase border-b border-slate-100">
              <tr>
                <th className="pb-2">Channel</th>
                <th className="pb-2">Candidates</th>
                <th className="pb-2">Hires</th>
                <th className="pb-2 text-right">Cost/Hire</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {channels.map((c: any) => (
                <tr
                  key={c.channel}
                  onClick={() => router.push("/recruitment/candidates")}
                  className="hover:bg-slate-50/70 transition cursor-pointer"
                  title="Click to view candidates from this channel"
                >
                  <td className="py-3 font-bold text-slate-900">{c.channel.replace("_", " ")}</td>
                  <td className="py-3 font-mono text-slate-600">{c.candidates}</td>
                  <td className="py-3 font-mono font-bold text-emerald-700">{c.hires}</td>
                  <td className="py-3 text-right font-mono font-semibold text-slate-900">${c.costPerHireUsd.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* DEPARTMENT FILL VELOCITY */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Department Headcount Velocity</h3>
              <p className="text-xs text-slate-500">Target vs filled hiring SLA</p>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Days to Fill</span>
          </div>

          <div className="space-y-3">
            {departments.map((d: any) => (
              <div
                key={d.department}
                onClick={() => router.push("/recruitment/requisitions")}
                className="rounded-xl bg-slate-50/80 border border-slate-200 p-3.5 flex items-center justify-between hover:bg-slate-100/70 hover:border-blue-300 transition cursor-pointer group"
                title={`Click to view requisitions in ${d.department}`}
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition">{d.department}</h4>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {d.openReqs} Open Req • {d.filledHeadcount}/{d.targetHeadcount} Slots Filled
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-base font-black text-amber-600 font-mono">{d.avgDaysToFill}d</span>
                  <span className="text-[9px] text-slate-400 block uppercase font-bold">Avg Fill SLA</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* =========================================================================
          DRILLDOWN MODAL 1: TIME TO HIRE VELOCITY BREAKDOWN
      ========================================================================= */}
      {activeModal === "time-to-hire" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 p-6 shadow-2xl text-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="rounded-md bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 text-[10px] font-bold uppercase">
                  Velocity Telemetry
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">Time-to-Hire Velocity by Department</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700 text-lg leading-none">✕</button>
            </div>

            <p className="text-xs text-slate-500">
              Average across all 24 requisitions is <strong>22.4 days</strong> (Target SLA: 30 days). Below is the breakdown by division:
            </p>

            <div className="space-y-2 text-xs">
              {[
                { dept: "Engineering & Cloud Architecture", days: "24.1 days", status: "Within SLA", reqs: "REQ-2026-00123, REQ-2026-00124" },
                { dept: "Enterprise Sales & GTM", days: "19.5 days", status: "Ahead of SLA", reqs: "REQ-2026-00125" },
                { dept: "Security & Operations", days: "28.0 days", status: "Within SLA", reqs: "REQ-2026-00127" },
                { dept: "Finance & Global Controllership", days: "16.2 days", status: "Ahead of SLA", reqs: "REQ-2026-00128" },
              ].map((row) => (
                <div key={row.dept} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 block">{row.dept}</span>
                    <span className="text-[10px] text-slate-400 font-mono">Requisitions: {row.reqs}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900 font-mono text-sm block">{row.days}</span>
                    <span className="text-[10px] text-emerald-600 font-semibold">{row.status}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setActiveModal(null);
                  router.push("/recruitment/requisitions");
                }}
                className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 shadow-xs"
              >
                Inspect All Requisitions &rarr;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          DRILLDOWN MODAL 2: COST PER HIRE AUDIT
      ========================================================================= */}
      {activeModal === "cost-per-hire" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 p-6 shadow-2xl text-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold uppercase">
                  Budget & Spend Audit
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">Cost Per Hire Breakdown ($4,250 USD Avg)</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700 text-lg leading-none">✕</button>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
              <span className="font-semibold text-emerald-900">Total Sourcing Spend YTD:</span>
              <span className="text-base font-black text-emerald-800 font-mono">$51,000 USD (12 Hires)</span>
            </div>

            <div className="space-y-2 text-xs">
              {[
                { category: "External Staffing Agencies & Search", spend: "$28,500", pct: "55.8%", note: "Apex Talent & Cloud Recruiters" },
                { category: "Job Board Sponsorships (LinkedIn, Indeed)", spend: "$15,200", pct: "29.8%", note: "4 active campaigns" },
                { category: "Technical Assessment Tools (HackerRank)", spend: "$4,800", pct: "9.4%", note: "Annual enterprise license" },
                { category: "Employee Referral Bonuses Paid", spend: "$2,500", pct: "5.0%", note: "1 referral conversion credited" },
              ].map((item) => (
                <div key={item.category} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 block">{item.category}</span>
                    <span className="text-[10px] text-slate-500">{item.note}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900 font-mono text-sm block">{item.spend}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{item.pct}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          DRILLDOWN MODAL 3: OFFER ACCEPTANCE DETAILS
      ========================================================================= */}
      {activeModal === "offer-acceptance" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 p-6 shadow-2xl text-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="rounded-md bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 text-[10px] font-bold uppercase">
                  Offer Telemetry
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">Offer Acceptance Rate (91.3% OAR)</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700 text-lg leading-none">✕</button>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="text-[10px] text-emerald-700 block uppercase font-bold">Accepted</span>
                <span className="text-lg font-black text-emerald-800">11</span>
              </div>
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                <span className="text-[10px] text-amber-700 block uppercase font-bold">Pending</span>
                <span className="text-lg font-black text-amber-800">1</span>
              </div>
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
                <span className="text-[10px] text-rose-700 block uppercase font-bold">Declined</span>
                <span className="text-lg font-black text-rose-800">0</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">Priya Menon — Senior Java Developer</span>
                  <span className="text-[10px] text-slate-400">Offer: $155,000 USD • Accepted 2 days ago</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Accepted
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">Lucas Schneider — Full Stack Engineer</span>
                  <span className="text-[10px] text-slate-400">Offer: $140,000 USD • Pending candidate response</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  Decision Pending
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setActiveModal(null);
                  router.push("/recruitment/candidates?stage=Offer");
                }}
                className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 shadow-xs"
              >
                Inspect Candidate Offers &rarr;
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
