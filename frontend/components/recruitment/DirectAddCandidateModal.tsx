"use client";

import { useState } from "react";

interface JobRequisition {
  id: string;
  reqNumber: string;
  title: string;
  department: string;
  jobLevel: string;
  employmentType: string;
  location: string;
  targetHeadcount: number;
  filledHeadcount: number;
  salaryRange: string;
  hiringManagerName: string;
  status: string;
  requiredSkills: string[];
}

interface DirectAddCandidateModalProps {
  requisitions: JobRequisition[];
  onClose: () => void;
  onSuccess: (candidate: any) => void;
  triggerBanner: (msg: string) => void;
}

export default function DirectAddCandidateModal({
  requisitions,
  onClose,
  onSuccess,
  triggerBanner,
}: DirectAddCandidateModalProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    requisitionId: requisitions[0]?.id || "req-101",
    currentTitle: "",
    yearsOfExperience: "6",
    source: "DIRECT_SOURCING",
    stage: "SOURCED",
    portfolioUrl: "",
    resumeSummary: "",
  });

  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = (event.target?.result as string) || "";
      // Heuristic auto-fill
      const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
      const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");

      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || cleanName,
        email: prev.email || (emailMatch ? emailMatch[0] : ""),
        phone: prev.phone || (phoneMatch ? phoneMatch[0] : ""),
        resumeSummary: text.length > 20 ? text.slice(0, 300) + "..." : prev.resumeSummary,
      }));
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email) return;

    setSubmitting(true);
    try {
      const targetReq = requisitions.find((r) => r.id === formData.requisitionId);

      const res = await fetch("/api/recruitment/candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          requisitionId: formData.requisitionId,
          source: formData.source,
          stage: formData.stage,
          portfolioUrl: formData.portfolioUrl,
          resumeSummary: `[DIRECT SOURCING] ${formData.currentTitle ? `Title: ${formData.currentTitle} | ` : ""}${formData.yearsOfExperience ? `Exp: ${formData.yearsOfExperience} yrs | ` : ""}${formData.resumeSummary || "Candidate sourced directly into pipeline without internal/public job posting."}`,
          notes: `Direct candidate sourcing by recruiter into ${targetReq?.title || "Requisition"} without requiring career site posting.`,
        }),
      });

      if (res.ok) {
        const created = await res.json();
        const candidateRecord = {
          id: created.id || "cand-" + Date.now().toString().slice(-6),
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          requisitionId: formData.requisitionId,
          requisitionTitle: targetReq?.title || "Sourced Position",
          department: targetReq?.department || "Engineering",
          stage: formData.stage,
          source: formData.source,
          resumeSummary: formData.resumeSummary,
          portfolioUrl: formData.portfolioUrl,
          interviewScore: 0,
          appliedAt: new Date().toISOString(),
          lastActivityAt: new Date().toISOString(),
        };

        onSuccess(candidateRecord);
        triggerBanner(`Directly sourced candidate "${formData.fullName}" added to pipeline without posting!`);
        onClose();
      } else {
        triggerBanner("Failed to save direct candidate. Check server status.");
      }
    } catch (err) {
      console.error(err);
      triggerBanner("Error adding candidate directly.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
      <div className="w-full max-w-xl rounded-2xl bg-slate-950 border border-slate-800 p-6 shadow-2xl text-slate-200 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
        <div className="flex items-start justify-between pb-4 border-b border-slate-800 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">
                Recruiter Direct Ingestion
              </span>
              <span className="text-[9px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800 px-1.5 py-0.2 rounded">
                Zero Job Post Required
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mt-1">Direct Add / Sourced Candidate</h3>
            <p className="text-xs text-slate-400">
              Add candidates directly into any requisition or unposted opening without publishing to internal or public job boards.
            </p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white text-lg">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Target Requisition Selection */}
          <div>
            <label className="block text-slate-300 font-bold mb-1">Target Requisition *</label>
            <select
              value={formData.requisitionId}
              onChange={(e) => setFormData({ ...formData, requisitionId: e.target.value })}
              className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-white focus:outline-hidden focus:border-blue-500"
            >
              {requisitions.map((req) => (
                <option key={req.id} value={req.id}>
                  {req.reqNumber} — {req.title} ({req.department} • {req.jobLevel})
                </option>
              ))}
            </select>
          </div>

          {/* Quick Resume Upload */}
          <div className="p-3 rounded-xl border border-dashed border-slate-700 bg-slate-900/60 hover:bg-slate-900 text-center transition">
            <input
              type="file"
              id="directCandidateResume"
              accept=".pdf,.docx,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />
            <label htmlFor="directCandidateResume" className="cursor-pointer block">
              <span className="text-xs text-blue-400 font-semibold block">
                {uploadedFileName ? `✓ Attached: ${uploadedFileName}` : "📁 Click to upload Candidate Resume (PDF, DOCX, TXT)"}
              </span>
              <span className="text-[10px] text-slate-500">
                Automatically extracts candidate name, email, phone & summary
              </span>
            </label>
          </div>

          {/* Candidate Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Candidate Full Name *</label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="e.g. Maya Patel"
                className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="maya.patel@example.com"
                className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (415) 555-0199"
                className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Current Job Title</label>
              <input
                type="text"
                value={formData.currentTitle}
                onChange={(e) => setFormData({ ...formData, currentTitle: e.target.value })}
                placeholder="e.g. Senior Cloud Architect"
                className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Years Experience</label>
              <input
                type="text"
                value={formData.yearsOfExperience}
                onChange={(e) => setFormData({ ...formData, yearsOfExperience: e.target.value })}
                placeholder="e.g. 7"
                className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Sourcing Channel</label>
              <select
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-white focus:outline-hidden focus:border-blue-500"
              >
                <option value="DIRECT_SOURCING">Direct Recruiter Sourcing</option>
                <option value="LINKEDIN_RECRUITER">LinkedIn Recruiter</option>
                <option value="EXECUTIVE_SEARCH">Executive Search / Headhunter</option>
                <option value="EMPLOYEE_REFERRAL">Employee Referral</option>
                <option value="AGENCY">Agency Partner</option>
                <option value="CAMPUS">Campus / University</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Initial Pipeline Stage</label>
              <select
                value={formData.stage}
                onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-white focus:outline-hidden focus:border-blue-500"
              >
                <option value="SOURCED">Sourced Lead</option>
                <option value="APPLIED">Applied</option>
                <option value="SCREENING">Screening</option>
                <option value="INTERVIEW">Interview Scheduled</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">LinkedIn / Portfolio URL</label>
            <input
              type="url"
              value={formData.portfolioUrl}
              onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
              placeholder="https://linkedin.com/in/candidatename"
              className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Profile Summary & Sourcing Notes</label>
            <textarea
              rows={3}
              value={formData.resumeSummary}
              onChange={(e) => setFormData({ ...formData, resumeSummary: e.target.value })}
              placeholder="Key skills, distributed systems background, compensation expectations..."
              className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-800 px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-500 disabled:opacity-50 shadow-md shadow-blue-600/30 transition flex items-center gap-1.5"
            >
              {submitting ? "Adding Sourced Candidate..." : "Direct Add Candidate &rarr;"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
