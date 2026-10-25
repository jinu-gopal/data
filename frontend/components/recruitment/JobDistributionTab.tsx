"use client";

import { useState } from "react";

export interface JobPostingChannel {
  id: string;
  requisitionId: string;
  requisitionTitle: string;
  channel: "CAREERS_PORTAL" | "LINKEDIN" | "INDEED" | "GLASSDOOR" | "INTERNAL_BOARD";
  status: "ACTIVE" | "PAUSED" | "EXPIRED";
  publishedAt: string;
  expiresAt: string;
  viewsCount: number;
  clicksCount: number;
  applicationsCount: number;
  costUsd: number;
  externalUrl?: string;
}

interface JobDistributionTabProps {
  postings: JobPostingChannel[];
  requisitions: Array<{ id: string; reqNumber: string; title: string }>;
  onPublish: (newPosting: Partial<JobPostingChannel>) => void;
  onTriggerBanner: (msg: string) => void;
}

export default function JobDistributionTab({
  postings,
  requisitions,
  onPublish,
  onTriggerBanner,
}: JobDistributionTabProps) {
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [selectedReqId, setSelectedReqId] = useState(requisitions[0]?.id || "");
  const [selectedChannel, setSelectedChannel] = useState<"LINKEDIN" | "INDEED" | "GLASSDOOR" | "CAREERS_PORTAL">("LINKEDIN");
  const [allocatedBudget, setAllocatedBudget] = useState("495");
  const [campaignName, setCampaignName] = useState("q4_tech_hiring");

  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    onTriggerBanner("✓ Sourcing campaign URL copied to clipboard with UTM tags!");
    setTimeout(() => setCopiedUrl(null), 3000);
  };

  const handlePublishSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const req = requisitions.find((r) => r.id === selectedReqId) || requisitions[0];
    const generatedUrl = `http://localhost:3000/careers?reqId=${req.id}&utm_source=${selectedChannel.toLowerCase()}&utm_campaign=${campaignName}`;

    onPublish({
      id: `post-${Date.now()}`,
      requisitionId: req.id,
      requisitionTitle: req.title,
      channel: selectedChannel,
      status: "ACTIVE",
      publishedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
      viewsCount: 0,
      clicksCount: 0,
      applicationsCount: 0,
      costUsd: Number(allocatedBudget),
      externalUrl: generatedUrl,
    });

    setShowPublishModal(false);
    onTriggerBanner(`✓ Requisition published to ${selectedChannel} with UTM tracking!`);
  };

  return (
    <div className="space-y-6">
      {/* SECTION HEADER & QUICK ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-2xl border border-slate-200/90 bg-white shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="rounded-md bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-bold text-blue-700 uppercase tracking-wider">
              SmartDistribute & Sourcing ROI
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500">Multi-Channel Talent Distribution</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Job Board Multi-Posting & Campaign Telemetry</h2>
          <p className="text-xs text-slate-500 mt-1">
            1-click job broadcasting to LinkedIn, Indeed, Glassdoor, and Careers Portal with auto-tagged UTM campaign parameters and cost-per-application (CPA) analytics.
          </p>
        </div>

        <button
          onClick={() => setShowPublishModal(true)}
          className="rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition flex items-center gap-2 whitespace-nowrap self-start sm:self-auto"
        >
          <span>📢 Publish Requisition to Job Boards</span>
          <span>&rarr;</span>
        </button>
      </div>

      {/* METRICS OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Postings */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
            </div>
            <div>
              <span className="text-xs font-medium text-slate-500 block">Active Postings</span>
              <span className="text-2xl font-bold tracking-tight text-slate-900 block mt-0.5">
                {postings.filter((p) => p.status === "ACTIVE").length}
              </span>
              <span className="text-[11px] text-blue-600 font-medium">Across 4 Job Boards</span>
            </div>
          </div>
        </div>

        {/* Card 2: Candidate Impressions */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <div>
              <span className="text-xs font-medium text-slate-500 block">Candidate Impressions</span>
              <span className="text-2xl font-bold tracking-tight text-slate-900 block mt-0.5">
                {postings.reduce((sum, p) => sum + p.viewsCount, 0).toLocaleString()}
              </span>
              <span className="text-[11px] text-emerald-600 font-medium">+18.4% this month</span>
            </div>
          </div>
        </div>

        {/* Card 3: Applications Captured */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <span className="text-xs font-medium text-slate-500 block">Applications Captured</span>
              <span className="text-2xl font-bold tracking-tight text-slate-900 block mt-0.5">
                {postings.reduce((sum, p) => sum + p.applicationsCount, 0)}
              </span>
              <span className="text-[11px] text-purple-600 font-medium">22.8% Conversion Rate</span>
            </div>
          </div>
        </div>

        {/* Card 4: Total Sourcing Spend */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <span className="text-xs font-medium text-slate-500 block">Total Sourcing Spend</span>
              <span className="text-2xl font-bold tracking-tight text-slate-900 block mt-0.5">
                ${postings.reduce((sum, p) => sum + p.costUsd, 0).toLocaleString()}
              </span>
              <span className="text-[11px] text-amber-700 font-medium">Avg CPA: $18.40</span>
            </div>
          </div>
        </div>
      </div>

      {/* POSTINGS LISTING TABLE */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xs">
        <div className="border-b border-slate-100 bg-slate-50/70 px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Live Multi-Channel Job Broadcasts</h3>
            <p className="text-xs text-slate-500">Active postings and real-time recruitment channel metrics</p>
          </div>
          <span className="text-xs text-slate-500 font-mono font-medium">{postings.length} Configured Channels</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Requisition Title</th>
                <th className="px-4 py-3.5">Channel Board</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Views / Clicks</th>
                <th className="px-4 py-3.5">Applications</th>
                <th className="px-4 py-3.5">Cost / CPA</th>
                <th className="px-6 py-3.5 text-right">Tracking UTM URL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {postings.map((p) => {
                const cpa = p.applicationsCount > 0 ? (p.costUsd / p.applicationsCount).toFixed(2) : "0.00";
                const channelBadge =
                  p.channel === "LINKEDIN"
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : p.channel === "INDEED"
                    ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                    : p.channel === "GLASSDOOR"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-purple-50 text-purple-700 border-purple-200";

                return (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {p.requisitionTitle}
                      <div className="font-mono text-[10px] text-slate-400 font-normal mt-0.5">{p.requisitionId}</div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-block rounded-md border px-2.5 py-0.5 text-[10px] font-bold ${channelBadge}`}>
                        {p.channel.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center gap-1.5 font-bold text-emerald-700 text-[11px] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 font-mono text-[11px]">
                      <span className="text-slate-900 font-bold">{p.viewsCount.toLocaleString()}</span> views /{" "}
                      <span className="text-blue-600 font-semibold">{p.clicksCount.toLocaleString()}</span> clicks
                    </td>
                    <td className="px-4 py-4">
                      <span className="rounded-lg bg-slate-100 border border-slate-200 px-2.5 py-1 font-bold text-slate-800">
                        {p.applicationsCount}
                      </span>
                    </td>
                    <td className="px-4 py-4 font-mono text-[11px]">
                      <div className="text-slate-900 font-bold">${p.costUsd} USD</div>
                      <div className="text-slate-400 text-[10px]">CPA: ${cpa}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleCopyLink(p.externalUrl || "http://localhost:3000/careers")}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 shadow-2xs transition"
                      >
                        {copiedUrl === p.externalUrl ? "✓ Copied" : "Copy UTM Link"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* EMPLOYEE REFERRAL CAMPAIGN BOX */}
      <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-2xs">
        <div>
          <span className="rounded-md bg-blue-100 text-blue-700 border border-blue-200 px-2 py-0.5 text-[10px] font-bold uppercase">
            Internal Employee Referral Engine
          </span>
          <h4 className="text-sm font-bold text-slate-900 mt-1.5">Enterprise Employee Referral Portals</h4>
          <p className="text-xs text-slate-600 mt-0.5">
            Generate personal referral links for employees. Successful hires automatically credit a $2,500 USD referral bonus.
          </p>
        </div>

        <button
          onClick={() => handleCopyLink("http://localhost:3000/careers?ref=emp-alex-101&bonus=2500")}
          className="rounded-xl border border-blue-300 bg-white px-4 py-2.5 text-xs font-semibold text-blue-700 hover:bg-blue-50 transition whitespace-nowrap shadow-xs"
        >
          🔗 Copy My Employee Referral Link
        </button>
      </div>

      {/* MODAL: PUBLISH REQUISITION */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 p-6 shadow-2xl text-slate-800">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <span className="rounded-md bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 text-[10px] font-bold uppercase">
                  Job Distribution
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">Publish to Global Job Boards</h3>
              </div>
              <button
                onClick={() => setShowPublishModal(false)}
                className="text-slate-400 hover:text-slate-700 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handlePublishSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Select Requisition</label>
                <select
                  value={selectedReqId}
                  onChange={(e) => setSelectedReqId(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  {requisitions.map((req) => (
                    <option key={req.id} value={req.id}>
                      {req.reqNumber} — {req.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Target Job Board</label>
                <select
                  value={selectedChannel}
                  onChange={(e) => setSelectedChannel(e.target.value as any)}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  <option value="LINKEDIN">LinkedIn Talent Solutions</option>
                  <option value="INDEED">Indeed Sponsored Jobs</option>
                  <option value="GLASSDOOR">Glassdoor Tech Network</option>
                  <option value="CAREERS_PORTAL">MAX Public Careers Portal (Free)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Allocated Sourcing Budget ($)</label>
                  <input
                    type="number"
                    value={allocatedBudget}
                    onChange={(e) => setAllocatedBudget(e.target.value)}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-slate-900 font-mono focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    placeholder="495"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">UTM Campaign Tag</label>
                  <input
                    type="text"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-slate-900 font-mono focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    placeholder="q4_cloud_arch"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
                <span className="font-bold text-slate-700">Generated URL Preview:</span>
                <div className="font-mono text-blue-600 break-all mt-1">
                  http://localhost:3000/careers?reqId={selectedReqId}&utm_source={selectedChannel.toLowerCase()}&utm_campaign={campaignName}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPublishModal(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 shadow-xs"
                >
                  Confirm & Broadcast &rarr;
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
