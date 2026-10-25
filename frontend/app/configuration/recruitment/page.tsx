"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import MaxShell from "@/components/max/MaxShell";

/* ============================================================================
 * Interfaces & Domain Models
 * ========================================================================== */

interface PipelineStageConfig {
  id: string;
  name: string;
  order: number;
  color: string;
  slaDays: number;
  isMandatory: boolean;
  enabled: boolean;
  requiresScorecard?: boolean;
  requiresBgvClearance?: boolean;
}

interface TeamsSettings {
  tenantId: string;
  clientId: string;
  clientSecretConfigured: boolean;
  status: "CONNECTED" | "DISCONNECTED" | "AUTHENTICATING";
  connectedTenantName: string;
  defaultMeetingDurationMins: number;
  autoRecordMeetings: boolean;
  allowDialInAudio: boolean;
  dialInConferenceNumber: string;
  dialInConferenceId: string;
  lastSyncAt: string;
}

interface EmailTemplate {
  id: string;
  code: string;
  name: string;
  category: "CANDIDATE" | "INTERVIEWER" | "APPROVER";
  subject: string;
  senderAlias: string;
  body: string;
  supportedMergeTags: string[];
}

interface OfferTemplate {
  id: string;
  name: string;
  type: string;
  subject: string;
  content: string;
}

interface RecruitmentRule {
  id: string;
  name: string;
  code: string;
  description: string;
  category: "WORKFLOW_AUTOMATION" | "COMPLIANCE_GATE" | "SLA_MONITOR" | "CANDIDATE_EXPERIENCE";
  enabled: boolean;
  triggerEvent: string;
  conditionDescription: string;
  actionDescription: string;
  thresholdValue?: number;
}

interface FormFieldConfig {
  fieldKey: string;
  label: string;
  fieldType: "TEXT" | "EMAIL" | "PHONE" | "NUMBER" | "DATE" | "SELECT" | "MULTI_SELECT" | "TEXTAREA" | "FILE" | "BOOLEAN";
  isMandatory: boolean;
  options?: string[];
  placeholder?: string;
}

interface FormSectionConfig {
  sectionKey: string;
  title: string;
  description: string;
  enabled: boolean;
  fields: FormFieldConfig[];
}

interface ScreeningQuestionConfig {
  id: string;
  question: string;
  type: "YES_NO" | "MULTIPLE_CHOICE" | "TEXT" | "NUMERIC";
  options?: string[];
  idealAnswer?: string;
  isKnockout: boolean;
  knockoutReason?: string;
}

interface ApplicationFormConfig {
  id: string;
  requisitionId?: string | null;
  formTitle: string;
  description: string;
  isDefault: boolean;
  isActive: boolean;
  sections: FormSectionConfig[];
  screeningQuestions: ScreeningQuestionConfig[];
  updatedAt: string;
}

const DEFAULT_EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: "tmpl-email-01",
    code: "INTERVIEW_INVITATION_TEAMS",
    name: "Interview Invitation (Microsoft Teams Video)",
    category: "CANDIDATE",
    subject: "Interview Invitation: {{job_title}} at {{company_name}}",
    senderAlias: "MAX Talent Acquisition <recruiting@max-erp.com>",
    body: `Dear {{candidate_name}},

Thank you for your interest in the {{job_title}} position within our {{department}} division. We were very impressed with your background and would love to invite you to a {{round_type}} interview.

INTERVIEW DETAILS:
- Date & Time: {{interview_date}} at {{interview_time}}
- Platform: Microsoft Teams Video Conference
- Meeting Link: {{teams_link}}
- Dial-in Conference: {{dial_in_number}} (PIN: {{conference_id}})
- Interview Panel: {{interviewer_names}}

Please confirm your availability by accepting the calendar invitation attached.

Best regards,
The MAX Enterprise Talent Team`,
    supportedMergeTags: ["{{candidate_name}}", "{{job_title}}", "{{department}}", "{{interview_date}}", "{{interview_time}}", "{{teams_link}}", "{{dial_in_number}}", "{{conference_id}}", "{{interviewer_names}}", "{{company_name}}"],
  },
  {
    id: "tmpl-email-02",
    code: "APPLICATION_CONFIRMATION",
    name: "Candidate Application Received Confirmation",
    category: "CANDIDATE",
    subject: "Application Received: {{job_title}} - MAX Enterprise Global",
    senderAlias: "MAX Careers Portal <careers@max-erp.com>",
    body: `Hello {{candidate_name}},

Thank you for submitting your application for the {{job_title}} requisition ({{requisition_number}}).

Our hiring team and talent intelligence engines are reviewing your competencies. You will receive an update regarding next steps within 48 business hours.

Application Tracking ID: {{candidate_id}}

Warm regards,
Global Talent Acquisition Team`,
    supportedMergeTags: ["{{candidate_name}}", "{{job_title}}", "{{requisition_number}}", "{{candidate_id}}"],
  },
  {
    id: "tmpl-email-03",
    code: "SCORECARD_SUBMISSION_DUE",
    name: "Interviewer Scorecard Submission Reminder",
    category: "INTERVIEWER",
    subject: "Action Required: Submit Interview Scorecard for {{candidate_name}}",
    senderAlias: "MAX ATS Engine <system@max-erp.com>",
    body: `Hi {{interviewer_name}},

Your {{round_type}} interview with {{candidate_name}} for the {{job_title}} role has concluded.

Please submit your 4-Pillar Scorecard rating (Technical, Problem Solving, Communication, Culture) to help our hiring committee evaluate next steps.

Scorecard Link: {{scorecard_link}}

Thank you for your timely feedback!`,
    supportedMergeTags: ["{{interviewer_name}}", "{{candidate_name}}", "{{job_title}}", "{{round_type}}", "{{scorecard_link}}"],
  },
  {
    id: "tmpl-email-04",
    code: "OFFER_LETTER_DISPATCH",
    name: "Formal Employment Offer Extended",
    category: "CANDIDATE",
    subject: "Formal Offer of Employment: {{job_title}} - MAX Enterprise Global",
    senderAlias: "Executive Hiring Office <offers@max-erp.com>",
    body: `Dear {{candidate_name}},

On behalf of the executive leadership team at MAX Enterprise Global, we are delighted to offer you the position of {{job_title}}!

OFFER HIGHLIGHTS:
- Annual Base Salary: \${{base_salary}} USD
- Sign-on Incentive: \${{signing_bonus}} USD
- Equity Grant: {{equity_shares}} shares
- Anticipated Start Date: {{start_date}}
- Reporting Manager: {{reporting_manager}}

Please review your complete digital offer packet and sign via our portal by {{expiration_date}}.

Welcome to the team!`,
    supportedMergeTags: ["{{candidate_name}}", "{{job_title}}", "{{base_salary}}", "{{signing_bonus}}", "{{equity_shares}}", "{{start_date}}", "{{reporting_manager}}", "{{expiration_date}}"],
  },
  {
    id: "tmpl-email-05",
    code: "PRE_ONBOARDING_WELCOME",
    name: "Pre-Onboarding Welcome & Workstation Setup",
    category: "CANDIDATE",
    subject: "Welcome to MAX-ERP! Pre-Onboarding & IT Setup Instructions",
    senderAlias: "Workforce People Operations <people-ops@max-erp.com>",
    body: `Dear {{candidate_name}},

Congratulations on accepting your offer for {{job_title}}!

Before your official start date on {{start_date}}, please log in to our Pre-Onboarding Portal to:
1. Verify tax withholding (W-4 / I-9) and direct deposit.
2. Sign enterprise IP and security compliance acknowledgements.
3. Select your engineering workstation (Apple MacBook Pro M3 Max or Lenovo ThinkPad P16).

Onboarding Link: {{onboarding_portal_url}}

We are thrilled to build with you!`,
    supportedMergeTags: ["{{candidate_name}}", "{{job_title}}", "{{start_date}}", "{{onboarding_portal_url}}"],
  },
  {
    id: "tmpl-email-06",
    code: "POLITE_REJECTION",
    name: "Polite Rejection & Talent Pool Retention",
    category: "CANDIDATE",
    subject: "Update on your application for {{job_title}} at MAX Enterprise",
    senderAlias: "MAX Talent Team <recruiting@max-erp.com>",
    body: `Dear {{candidate_name}},

Thank you for taking the time to speak with our team regarding the {{job_title}} position.

While your background in {{department}} is impressive, we have decided to move forward with another candidate whose specific domain experience more closely aligns with our immediate technical needs.

We will keep your profile in our executive talent network for future high-impact roles matching your skill set.

We wish you the very best in your professional endeavors.

Sincerely,
MAX Enterprise Talent Acquisition`,
    supportedMergeTags: ["{{candidate_name}}", "{{job_title}}", "{{department}}"],
  },
];

export default function RecruitmentConfigurationPage() {
  const [activeSection, setActiveSection] = useState<
    "ALL" | "PIPELINE" | "TEAMS" | "EMAIL_TEMPLATES" | "OFFER_TEMPLATES" | "RULES" | "APPLICATION_FORMS"
  >("ALL");

  const [searchQuery, setSearchQuery] = useState("");
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);

  // Configuration Data
  const [pipelineStages, setPipelineStages] = useState<PipelineStageConfig[]>([]);
  const [teamsSettings, setTeamsSettings] = useState<TeamsSettings | null>(null);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>(DEFAULT_EMAIL_TEMPLATES);
  const [offerTemplates, setOfferTemplates] = useState<OfferTemplate[]>([]);

  // Recruiting Rules & Automations Data
  const [rules, setRules] = useState<RecruitmentRule[]>([]);
  const [selectedRuleCategory, setSelectedRuleCategory] = useState<string>("ALL");
  const [showAddRuleModal, setShowAddRuleModal] = useState(false);
  const [newRule, setNewRule] = useState({
    name: "",
    code: "",
    description: "",
    category: "WORKFLOW_AUTOMATION" as RecruitmentRule["category"],
    triggerEvent: "STAGE_CHANGE",
    conditionDescription: "",
    actionDescription: "",
    thresholdValue: 0,
  });

  // Dynamic Application Form Configuration Data
  const [formConfig, setFormConfig] = useState<ApplicationFormConfig | null>(null);
  const [savingForm, setSavingForm] = useState(false);
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    question: "",
    type: "YES_NO" as ScreeningQuestionConfig["type"],
    isKnockout: false,
    knockoutReason: "",
    idealAnswer: "YES",
  });

  // Editing State
  const [selectedEmailTmpl, setSelectedEmailTmpl] = useState<EmailTemplate | null>(null);
  const [testingTeams, setTestingTeams] = useState(false);
  const [showAddStageModal, setShowAddStageModal] = useState(false);
  const [newStageName, setNewStageName] = useState("");
  const [newStageSla, setNewStageSla] = useState(5);

  const triggerBanner = (msg: string) => {
    setBannerMessage(msg);
    setTimeout(() => setBannerMessage(null), 4000);
  };

  // Load Settings
  const loadSettings = async () => {
    try {
      const [pipeRes, teamsRes, offerRes, rulesRes, formsRes] = await Promise.all([
        fetch("/api/recruitment/pipeline-config").then((r) => r.ok ? r.json() : []),
        fetch("/api/recruitment/teams-config").then((r) => r.ok ? r.json() : null),
        fetch("/api/recruitment/offers?type=templates").then((r) => r.ok ? r.json() : []),
        fetch("/api/recruitment/rules").then((r) => r.ok ? r.json() : []),
        fetch("/api/recruitment/forms").then((r) => r.ok ? r.json() : null),
      ]);
      setPipelineStages(pipeRes);
      setTeamsSettings(teamsRes);
      setOfferTemplates(offerRes);
      setRules(rulesRes);
      setFormConfig(formsRes);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  // Test Teams Graph Connection
  const handleTestTeamsConnection = async () => {
    setTestingTeams(true);
    try {
      const res = await fetch("/api/recruitment/teams-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "TEST_CONNECTION" }),
      });
      if (res.ok) {
        const data = await res.json();
        setTeamsSettings(data.config);
        triggerBanner("✓ Successfully verified Graph API: Connected to MAX Enterprise Microsoft 365 Tenant!");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTestingTeams(false);
    }
  };

  // Toggle Pipeline Stage
  const handleToggleStage = async (stageId: string, currentStatus: boolean) => {
    const updated = !currentStatus;
    setPipelineStages((prev) =>
      prev.map((s) => (s.id === stageId ? { ...s, enabled: updated } : s))
    );
    try {
      await fetch("/api/recruitment/pipeline-config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: stageId, enabled: updated }),
      });
      triggerBanner(`Pipeline Stage status updated to: ${updated ? "ENABLED" : "DISABLED"}`);
    } catch (err) {
      console.error(err);
    }
  };

  // Update Stage SLA
  const handleUpdateStageSla = async (stageId: string, slaDays: number) => {
    setPipelineStages((prev) =>
      prev.map((s) => (s.id === stageId ? { ...s, slaDays } : s))
    );
    try {
      await fetch("/api/recruitment/pipeline-config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: stageId, slaDays }),
      });
      triggerBanner(`Updated SLA limit to ${slaDays} days.`);
    } catch (err) {
      console.error(err);
    }
  };

  // Add Custom Pipeline Stage
  const handleAddCustomStage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStageName.trim()) return;

    try {
      const res = await fetch("/api/recruitment/pipeline-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newStageName,
          slaDays: newStageSla,
          isMandatory: false,
        }),
      });

      if (res.ok) {
        const created = await res.json();
        setPipelineStages((prev) => [...prev, created]);
        setShowAddStageModal(false);
        setNewStageName("");
        triggerBanner(`Custom stage '${newStageName}' added to Talent Pipeline!`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Save Email Template Edits
  const handleSaveEmailTemplate = (updatedTmpl: EmailTemplate) => {
    setEmailTemplates((prev) =>
      prev.map((t) => (t.id === updatedTmpl.id ? updatedTmpl : t))
    );
    setSelectedEmailTmpl(null);
    triggerBanner(`Saved email template '${updatedTmpl.name}'`);
  };

  // Rule Actions
  const handleToggleRule = async (ruleId: string, currentEnabled: boolean) => {
    const updated = !currentEnabled;
    setRules((prev) => prev.map((r) => (r.id === ruleId ? { ...r, enabled: updated } : r)));
    try {
      await fetch("/api/recruitment/rules", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: ruleId, enabled: updated }),
      });
      triggerBanner(`Rule status updated to: ${updated ? "ENABLED" : "PAUSED"}`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    setRules((prev) => prev.filter((r) => r.id !== ruleId));
    try {
      await fetch(`/api/recruitment/rules?id=${ruleId}`, { method: "DELETE" });
      triggerBanner("Automation rule deleted.");
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRule.name.trim()) return;
    try {
      const res = await fetch("/api/recruitment/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRule),
      });
      if (res.ok) {
        const created = await res.json();
        setRules((prev) => [...prev, created]);
        setShowAddRuleModal(false);
        setNewRule({
          name: "",
          code: "",
          description: "",
          category: "WORKFLOW_AUTOMATION",
          triggerEvent: "STAGE_CHANGE",
          conditionDescription: "",
          actionDescription: "",
          thresholdValue: 0,
        });
        triggerBanner(`Rule '${created.name}' created and activated!`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Dynamic Application Form Actions
  const handleToggleFormSection = (sectionKey: string) => {
    if (!formConfig) return;
    setFormConfig({
      ...formConfig,
      sections: formConfig.sections.map((sec) =>
        sec.sectionKey === sectionKey ? { ...sec, enabled: !sec.enabled } : sec
      ),
    });
  };

  const handleToggleFieldMandatory = (sectionKey: string, fieldKey: string) => {
    if (!formConfig) return;
    setFormConfig({
      ...formConfig,
      sections: formConfig.sections.map((sec) => {
        if (sec.sectionKey !== sectionKey) return sec;
        return {
          ...sec,
          fields: sec.fields.map((f) =>
            f.fieldKey === fieldKey ? { ...f, isMandatory: !f.isMandatory } : f
          ),
        };
      }),
    });
  };

  const handleDeleteScreeningQuestion = (qId: string) => {
    if (!formConfig) return;
    setFormConfig({
      ...formConfig,
      screeningQuestions: formConfig.screeningQuestions.filter((q) => q.id !== qId),
    });
    triggerBanner("Screening question removed.");
  };

  const handleAddScreeningQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formConfig || !newQuestion.question.trim()) return;
    const q: ScreeningQuestionConfig = {
      id: `sq-${Date.now()}`,
      question: newQuestion.question,
      type: newQuestion.type,
      isKnockout: newQuestion.isKnockout,
      knockoutReason: newQuestion.knockoutReason,
      idealAnswer: newQuestion.idealAnswer,
    };
    setFormConfig({
      ...formConfig,
      screeningQuestions: [...formConfig.screeningQuestions, q],
    });
    setShowAddQuestionModal(false);
    setNewQuestion({
      question: "",
      type: "YES_NO",
      isKnockout: false,
      knockoutReason: "",
      idealAnswer: "YES",
    });
    triggerBanner("Screening question added to configuration.");
  };

  const handleSaveFormConfig = async () => {
    if (!formConfig) return;
    setSavingForm(true);
    try {
      const res = await fetch("/api/recruitment/forms", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formConfig),
      });
      if (res.ok) {
        const data = await res.json();
        setFormConfig(data);
        triggerBanner("✓ Dynamic Application Form saved successfully!");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingForm(false);
    }
  };

  // Global Settings Search Filtering
  const filteredPipelineStages = useMemo(() => {
    if (!searchQuery) return pipelineStages;
    const q = searchQuery.toLowerCase();
    return pipelineStages.filter(
      (s) => s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q)
    );
  }, [pipelineStages, searchQuery]);

  const filteredEmailTemplates = useMemo(() => {
    if (!searchQuery) return emailTemplates;
    const q = searchQuery.toLowerCase();
    return emailTemplates.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        t.code.toLowerCase().includes(q) ||
        t.body.toLowerCase().includes(q)
    );
  }, [emailTemplates, searchQuery]);

  const matchesTeams = useMemo(() => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      "microsoft teams graph azure calendar video conference dial-in"
        .toLowerCase()
        .includes(q) ||
      (teamsSettings?.connectedTenantName || "").toLowerCase().includes(q)
    );
  }, [searchQuery, teamsSettings]);

  const matchesOffers = useMemo(() => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      "offer letters merge tags compensation templates salary"
        .toLowerCase()
        .includes(q) ||
      offerTemplates.some((t) => t.name.toLowerCase().includes(q))
    );
  }, [searchQuery, offerTemplates]);

  const filteredRules = useMemo(() => {
    let list = rules;
    if (selectedRuleCategory !== "ALL") {
      list = list.filter((r) => r.category === selectedRuleCategory);
    }
    if (!searchQuery) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.code.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.conditionDescription.toLowerCase().includes(q) ||
        r.actionDescription.toLowerCase().includes(q)
    );
  }, [rules, selectedRuleCategory, searchQuery]);

  const matchesRules = useMemo(() => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      "automation rules knockout compliance trigger criteria action gate"
        .toLowerCase()
        .includes(q) ||
      rules.some((r) => r.name.toLowerCase().includes(q) || r.code.toLowerCase().includes(q))
    );
  }, [searchQuery, rules]);

  const matchesForms = useMemo(() => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      "form builder application fields screening questions knockout prerequisite"
        .toLowerCase()
        .includes(q) ||
      Boolean(formConfig && formConfig.formTitle.toLowerCase().includes(q))
    );
  }, [searchQuery, formConfig]);

  return (
    <MaxShell>
      <div className="space-y-6">
        {/* Banner Alert Toast */}
        {bannerMessage && (
          <div className="fixed top-20 right-6 z-50 flex items-center gap-3 rounded-2xl bg-blue-600 px-5 py-3 text-white shadow-2xl animate-in slide-in-from-top-4">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-xs font-semibold">{bannerMessage}</span>
          </div>
        )}

        {/* Top Header & Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <Link href="/configuration" className="text-blue-500 hover:underline font-semibold">
                Configuration Hub
              </Link>
              <span>/</span>
              <span className="text-slate-300 font-mono">Recruitment & Talent Settings</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              Talent Acquisition & Recruiting Configuration
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Global administration outside the recruiting workspace: configure Talent Pipeline stages, Microsoft Teams Graph API, and Automated Email Notification Templates.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/recruitment"
              className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-bold text-slate-200 hover:text-white hover:bg-slate-800 transition flex items-center gap-1.5"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              <span>Go to Recruiting Studio &rarr;</span>
            </Link>
          </div>
        </div>

        {/* Global Settings Search Bar */}
        <div className="relative max-w-2xl bg-slate-950 p-2 rounded-2xl border border-slate-800 shadow-xl">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search recruitment settings (e.g. 'teams', 'pipeline', 'offer template', 'email', 'sla')..."
            className="w-full rounded-xl bg-slate-900 border border-slate-800 px-4 py-2.5 pl-10 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
          />
          <svg className="absolute left-4.5 top-4.5 h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-3.5 text-xs text-slate-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* Section Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { id: "ALL", label: "All Settings" },
            { id: "PIPELINE", label: "🎯 Talent Pipeline" },
            { id: "RULES", label: "⚙️ Business Rules & Automations" },
            { id: "APPLICATION_FORMS", label: "📋 Application Form Builder" },
            { id: "TEAMS", label: "💬 Microsoft Teams Integration" },
            { id: "EMAIL_TEMPLATES", label: "✉️ Email Notification Templates" },
            { id: "OFFER_TEMPLATES", label: "📑 Offer Letter Templates" },
          ].map((sec) => (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id as any)}
              className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                activeSection === sec.id
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {sec.label}
            </button>
          ))}
        </div>

        {/* =====================================================================
         * SECTION 1: TALENT PIPELINE CONFIGURATION
         * ===================================================================== */}
        {(activeSection === "ALL" || activeSection === "PIPELINE") && (
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Talent Pipeline Stages & SLA Gate Governance</span>
                  <span className="text-[10px] font-mono text-blue-400 bg-blue-950/60 border border-blue-800/60 px-2 py-0.5 rounded-full">
                    {filteredPipelineStages.length} Stages
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Customize recruitment stages, configure stage turnaround SLAs, and enforce mandatory evaluation gates.
                </p>
              </div>

              <button
                onClick={() => setShowAddStageModal(true)}
                className="rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-blue-500"
              >
                + Add Pipeline Stage
              </button>
            </div>

            <div className="space-y-2.5">
              {filteredPipelineStages.map((stage) => (
                <div
                  key={stage.id}
                  className="p-3.5 rounded-xl border border-slate-800 bg-slate-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-slate-500 font-bold w-6">{stage.order}.</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{stage.name}</span>
                        {stage.isMandatory && (
                          <span className="rounded-md bg-purple-950 text-purple-300 border border-purple-800 px-1.5 py-0.2 text-[9px] font-bold">
                            Mandatory Gate
                          </span>
                        )}
                        {stage.requiresScorecard && (
                          <span className="rounded-md bg-amber-950 text-amber-300 border border-amber-800 px-1.5 py-0.2 text-[9px] font-bold">
                            Requires Scorecard
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400">
                        Default Stage Code: <code className="font-mono text-blue-400">{stage.id}</code>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* SLA Input */}
                    <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg">
                      <span className="text-slate-400 text-[11px]">SLA:</span>
                      <input
                        type="number"
                        min="1"
                        max="30"
                        value={stage.slaDays}
                        onChange={(e) => handleUpdateStageSla(stage.id, Number(e.target.value))}
                        className="w-10 bg-transparent text-white font-mono font-bold text-center focus:outline-hidden"
                      />
                      <span className="text-slate-500 text-[10px]">days</span>
                    </div>

                    <button
                      onClick={() => handleToggleStage(stage.id, stage.enabled)}
                      className={`rounded-lg px-3 py-1 text-xs font-bold transition ${
                        stage.enabled
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {stage.enabled ? "Active ✓" : "Disabled"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =====================================================================
         * SECTION 2: MICROSOFT TEAMS & CALENDAR INTEGRATION
         * ===================================================================== */}
        {(activeSection === "ALL" || activeSection === "TEAMS") && matchesTeams && (
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
                  M365
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>Microsoft Teams & Outlook Calendar Integration</span>
                    <span className="rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 text-[10px] font-bold">
                      {teamsSettings?.status || "CONNECTED"}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Microsoft Graph API credentials for automatic video conference room provisioning and Outlook calendar `.ics` invites.
                  </p>
                </div>
              </div>

              <button
                onClick={handleTestTeamsConnection}
                disabled={testingTeams}
                className="rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-500 disabled:opacity-50 transition shadow-md shadow-purple-600/25 flex items-center gap-1.5"
              >
                {testingTeams ? (
                  <>
                    <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Testing Graph Token...</span>
                  </>
                ) : (
                  <>
                    <span>Test Graph API Connection</span>
                    <span>&rarr;</span>
                  </>
                )}
              </button>
            </div>

            {/* Microsoft 365 Credentials Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Azure AD Tenant ID</span>
                <span className="font-mono text-white text-xs block truncate">
                  {teamsSettings?.tenantId || "7f4c3a2b-91d8-4f5e-b3c2-89a102345678"}
                </span>
                <span className="text-[10px] text-emerald-400">Tenant: {teamsSettings?.connectedTenantName || "MAX Enterprise Global"}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Client ID (App ID)</span>
                <span className="font-mono text-white text-xs block truncate">
                  {teamsSettings?.clientId || "3d2e1f0a-6c5b-4a3b-8f7e-123456789abc"}
                </span>
                <span className="text-[10px] text-slate-400">OAuth2 Client Credentials Grant</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Client Secret</span>
                <span className="font-mono text-slate-400 text-xs block">••••••••••••••••••••••••••••••••</span>
                <span className="text-[10px] text-emerald-400">✓ Secret Valid (Expires Oct 2027)</span>
              </div>
            </div>

            {/* Default Conference Settings */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <h4 className="font-bold text-white text-xs">Conference & Meeting Default Options:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] text-slate-300">
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span>Default Meeting Length:</span>
                  <strong className="text-white font-mono">45 Minutes</strong>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span>Auto-Recording:</span>
                  <strong className="text-emerald-400">Enabled (Cloud)</strong>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span>Toll-Free Dial-in Audio:</span>
                  <strong className="text-white font-mono">+1 (800) 555-8326</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
         * SECTION 3: EMAIL NOTIFICATION TEMPLATES
         * ===================================================================== */}
        {(activeSection === "ALL" || activeSection === "EMAIL_TEMPLATES") && (
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Recruitment Email Notification Templates</span>
                  <span className="text-[10px] font-mono text-purple-400 bg-purple-950/60 border border-purple-800/60 px-2 py-0.5 rounded-full">
                    {filteredEmailTemplates.length} Templates
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Configure automated email templates, sender aliases, merge tags, and candidate/interviewer correspondence.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredEmailTemplates.map((tmpl) => (
                <div
                  key={tmpl.id}
                  className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-3 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div>
                        <span className="rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/30 px-2 py-0.5 text-[9px] font-bold">
                          {tmpl.category}
                        </span>
                        <h4 className="text-sm font-bold text-white mt-1.5">{tmpl.name}</h4>
                      </div>
                      <span className="font-mono text-[9px] text-slate-500">{tmpl.code}</span>
                    </div>

                    <p className="text-xs text-slate-300 font-semibold mb-2">Subject: {tmpl.subject}</p>

                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400 line-clamp-4 leading-relaxed whitespace-pre-line">
                      {tmpl.body}
                    </div>

                    <div className="mt-2.5 flex flex-wrap gap-1">
                      {tmpl.supportedMergeTags.slice(0, 4).map((tag) => (
                        <span key={tag} className="rounded-md bg-slate-900 border border-slate-800 px-1.5 py-0.5 text-[9px] font-mono text-blue-400">
                          {tag}
                        </span>
                      ))}
                      {tmpl.supportedMergeTags.length > 4 && (
                        <span className="text-[9px] text-slate-500 self-center">
                          +{tmpl.supportedMergeTags.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500">{tmpl.senderAlias}</span>
                    <button
                      onClick={() => setSelectedEmailTmpl(tmpl)}
                      className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-500"
                    >
                      Edit Template &rarr;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =====================================================================
         * SECTION 4: OFFER LETTER TEMPLATES
         * ===================================================================== */}
        {(activeSection === "ALL" || activeSection === "OFFER_TEMPLATES") && matchesOffers && (
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-800 gap-3">
              <div>
                <h3 className="text-base font-bold text-white">Offer Letter Master Templates</h3>
                <p className="text-xs text-slate-400">
                  Standard Salaried, Executive, and Hourly Contractor formal offer letters with legal signature blocks.
                </p>
              </div>

              <Link
                href="/recruitment/letters"
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:from-blue-500 hover:to-indigo-500 transition whitespace-nowrap"
              >
                <span>✉️ Open Letter Studio (100+ Letters & AI)</span>
                <span>&rarr;</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {offerTemplates.map((tmpl) => (
                <div key={tmpl.id} className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white">{tmpl.name}</h4>
                    <span className="rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 text-[9px] font-bold">
                      {tmpl.type}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400 line-clamp-3 leading-relaxed">
                    {tmpl.content}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =====================================================================
         * SECTION 5: RECRUITING BUSINESS RULES & AUTOMATION ENGINE
         * ===================================================================== */}
        {(activeSection === "ALL" || activeSection === "RULES") && matchesRules && (
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-800 gap-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Recruiting Business Rules & Automation Engine</span>
                  <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded-full">
                    {filteredRules.length} Configured Rules
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Configure event triggers, conditional cutoff gates, automated stage transitions, and SLA alerts.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddRuleModal(true)}
                  className="rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white hover:bg-amber-500 shadow-md shadow-amber-600/20 transition flex items-center gap-1.5"
                >
                  <span>➕ Add Custom Automation Rule</span>
                </button>
              </div>
            </div>

            {/* Rule Category Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {[
                { id: "ALL", label: "All Rules" },
                { id: "WORKFLOW_AUTOMATION", label: "⚡ Workflow Automation" },
                { id: "COMPLIANCE_GATE", label: "🛡️ Compliance Gate" },
                { id: "SLA_MONITOR", label: "⏱️ SLA Monitor" },
                { id: "CANDIDATE_EXPERIENCE", label: "👤 Candidate Experience" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedRuleCategory(cat.id)}
                  className={`rounded-lg px-3 py-1 font-semibold transition ${
                    selectedRuleCategory === cat.id
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      : "text-slate-400 hover:text-white bg-slate-900 border border-slate-800"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Rule Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredRules.map((rule) => {
                const categoryColor =
                  rule.category === "COMPLIANCE_GATE"
                    ? "text-rose-400 bg-rose-950/60 border-rose-800/60"
                    : rule.category === "SLA_MONITOR"
                    ? "text-sky-400 bg-sky-950/60 border-sky-800/60"
                    : rule.category === "CANDIDATE_EXPERIENCE"
                    ? "text-emerald-400 bg-emerald-950/60 border-emerald-800/60"
                    : "text-amber-400 bg-amber-950/60 border-amber-800/60";

                return (
                  <div
                    key={rule.id}
                    className={`rounded-2xl border p-4 space-y-3 transition flex flex-col justify-between ${
                      rule.enabled
                        ? "border-slate-800 bg-slate-950 shadow-md"
                        : "border-slate-800/40 bg-slate-950/40 opacity-70"
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className={`rounded-md border px-2 py-0.5 text-[9px] font-bold ${categoryColor}`}>
                            {rule.category.replace(/_/g, " ")}
                          </span>
                          <span className="font-mono text-[10px] text-slate-500">{rule.code}</span>
                        </div>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            rule.enabled
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                              : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          {rule.enabled ? "ACTIVE" : "PAUSED"}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-white mb-1">{rule.name}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed mb-3">{rule.description}</p>

                      {/* Rule Trigger - Condition - Action Pill Box */}
                      <div className="space-y-1.5 rounded-xl bg-slate-900 border border-slate-800 p-2.5 text-[11px] font-mono">
                        <div className="flex items-start gap-2">
                          <span className="text-amber-400 font-bold shrink-0">TRIGGER:</span>
                          <span className="text-slate-300">{rule.triggerEvent}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-cyan-400 font-bold shrink-0">IF:</span>
                          <span className="text-slate-300">{rule.conditionDescription}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-emerald-400 font-bold shrink-0">THEN:</span>
                          <span className="text-slate-300">{rule.actionDescription}</span>
                        </div>
                        {rule.thresholdValue !== undefined && (
                          <div className="flex items-center gap-2 pt-1 border-t border-slate-800/60">
                            <span className="text-slate-500 text-[10px]">Threshold Value:</span>
                            <span className="text-white font-bold text-[10px] bg-slate-800 px-1.5 py-0.2 rounded">
                              {rule.thresholdValue}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-slate-400 font-medium cursor-pointer flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={rule.enabled}
                            onChange={() => handleToggleRule(rule.id, rule.enabled)}
                            className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0 h-4 w-4"
                          />
                          <span>{rule.enabled ? "Rule Enabled" : "Rule Paused"}</span>
                        </label>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteRule(rule.id)}
                        className="text-xs text-rose-400 hover:text-rose-300 font-medium hover:underline"
                      >
                        Delete Rule
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =====================================================================
         * SECTION 6: DYNAMIC APPLICATION FORM & SCREENING QUESTION STUDIO
         * ===================================================================== */}
        {(activeSection === "ALL" || activeSection === "APPLICATION_FORMS") && matchesForms && (
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-800 gap-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Dynamic Application Form & Screening Question Studio</span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                    {formConfig?.sections.length || 0} Sections Active
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Configure candidate application form layout, toggle sections, mark fields mandatory, and manage automated knockout questions.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={savingForm || !formConfig}
                  onClick={handleSaveFormConfig}
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 shadow-md shadow-emerald-600/20 transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  {savingForm ? (
                    <>
                      <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving Form...</span>
                    </>
                  ) : (
                    <span>💾 Save Application Form Config &rarr;</span>
                  )}
                </button>
              </div>
            </div>

            {/* Subsection 6.1: Form Sections & Fields */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>1. Standard Application Sections & Field Controls</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    (Enable/disable sections or toggle mandatory flags)
                  </span>
                </h4>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {formConfig?.sections.map((section) => (
                  <div
                    key={section.sectionKey}
                    className={`rounded-2xl border p-4 space-y-3 transition ${
                      section.enabled
                        ? "border-slate-800 bg-slate-950"
                        : "border-slate-800/50 bg-slate-950/40 opacity-60"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2 border-b border-slate-800/80">
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="text-xs font-bold text-white">{section.title}</h5>
                          <span className="text-[9px] font-mono text-slate-500 uppercase">{section.sectionKey}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{section.description}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="text-xs font-medium text-slate-300 flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={section.enabled}
                            onChange={() => handleToggleFormSection(section.sectionKey)}
                            className="rounded border-slate-700 bg-slate-900 text-blue-500 focus:ring-0 h-4 w-4"
                          />
                          <span className={section.enabled ? "text-emerald-400 font-bold" : "text-slate-500"}>
                            {section.enabled ? "Section Enabled" : "Section Disabled"}
                          </span>
                        </label>
                      </div>
                    </div>

                    {section.enabled && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
                        {section.fields.map((field) => (
                          <div
                            key={field.fieldKey}
                            className="rounded-xl border border-slate-800 bg-slate-900/60 p-2.5 flex items-center justify-between text-xs"
                          >
                            <div className="min-w-0 pr-2">
                              <span className="text-white font-medium block truncate">{field.label}</span>
                              <span className="text-[10px] font-mono text-blue-400 block">{field.fieldType}</span>
                            </div>

                            <label className="flex items-center gap-1.5 text-[11px] text-slate-400 cursor-pointer shrink-0">
                              <input
                                type="checkbox"
                                checked={field.isMandatory}
                                onChange={() => handleToggleFieldMandatory(section.sectionKey, field.fieldKey)}
                                className="rounded border-slate-700 bg-slate-900 text-rose-500 focus:ring-0 h-3.5 w-3.5"
                              />
                              <span className={field.isMandatory ? "text-rose-400 font-bold" : "text-slate-500"}>
                                Mandatory
                              </span>
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Subsection 6.2: Custom Screening Questions & Knockout Engine */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>2. Custom Screening Questions & Knockout Governance</span>
                    <span className="text-[10px] font-mono text-rose-400 bg-rose-950/60 border border-rose-800/60 px-2 py-0.5 rounded-full">
                      {formConfig?.screeningQuestions.filter((q) => q.isKnockout).length || 0} Knockout Gates
                    </span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    Questions presented to candidates during application. Knockout questions auto-archive non-compliant submissions to Future Consideration.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddQuestionModal(true)}
                  className="rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-slate-200 hover:text-white hover:bg-slate-800 transition flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <span>➕ Add Screening Question</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {formConfig?.screeningQuestions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-slate-500 font-bold">#{idx + 1}</span>
                        <span className="rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/30 px-1.5 py-0.2 text-[9px] font-mono font-bold">
                          {q.type}
                        </span>
                        {q.isKnockout ? (
                          <span className="rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/30 px-2 py-0.2 text-[9px] font-bold flex items-center gap-1">
                            <span>🚨 KNOCKOUT GATE</span>
                          </span>
                        ) : (
                          <span className="rounded-md bg-slate-800 text-slate-400 px-2 py-0.2 text-[9px]">
                            Informational
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-bold text-white">{q.question}</p>
                      {q.isKnockout && q.knockoutReason && (
                        <p className="text-[11px] text-rose-400/90 font-mono">
                          Auto-reject Reason: {q.knockoutReason} (Ideal response: {q.idealAnswer || "YES"})
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => handleDeleteScreeningQuestion(q.id)}
                        className="text-xs text-rose-400 hover:text-rose-300 font-medium hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
         * MODAL: EDIT EMAIL TEMPLATE
         * ===================================================================== */}
        {selectedEmailTmpl && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
            <div className="w-full max-w-2xl rounded-2xl bg-slate-950 border border-slate-800 p-6 shadow-2xl text-slate-200 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                <div>
                  <span className="text-[10px] font-mono text-purple-400 uppercase font-bold">{selectedEmailTmpl.code}</span>
                  <h3 className="text-lg font-bold text-white">Edit Email Template: {selectedEmailTmpl.name}</h3>
                </div>
                <button onClick={() => setSelectedEmailTmpl(null)} className="text-slate-500 hover:text-white text-lg">
                  &times;
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Subject Line</label>
                  <input
                    type="text"
                    value={selectedEmailTmpl.subject}
                    onChange={(e) => setSelectedEmailTmpl({ ...selectedEmailTmpl, subject: e.target.value })}
                    className="w-full rounded-xl bg-slate-900 border border-slate-800 p-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Sender Alias</label>
                  <input
                    type="text"
                    value={selectedEmailTmpl.senderAlias}
                    onChange={(e) => setSelectedEmailTmpl({ ...selectedEmailTmpl, senderAlias: e.target.value })}
                    className="w-full rounded-xl bg-slate-900 border border-slate-800 p-2.5 text-white"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-slate-300 font-medium">Template Content</label>
                    <span className="text-[10px] text-slate-500">Supports merge tags shown below</span>
                  </div>
                  <textarea
                    rows={8}
                    value={selectedEmailTmpl.body}
                    onChange={(e) => setSelectedEmailTmpl({ ...selectedEmailTmpl, body: e.target.value })}
                    className="w-full rounded-xl bg-slate-900 border border-slate-800 p-3 text-white font-mono text-[11px] leading-relaxed"
                  />
                </div>

                {/* Available Merge Tags Pill Selector */}
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block mb-1">Available Merge Tags (Click to Append):</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedEmailTmpl.supportedMergeTags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setSelectedEmailTmpl({ ...selectedEmailTmpl, body: selectedEmailTmpl.body + " " + tag })}
                        className="rounded-lg bg-blue-950/60 border border-blue-800/60 px-2 py-0.5 text-[10px] font-mono text-blue-300 hover:bg-blue-900/60"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setSelectedEmailTmpl(null)}
                    className="rounded-xl border border-slate-800 px-4 py-2 text-xs font-bold text-slate-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveEmailTemplate(selectedEmailTmpl)}
                    className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500"
                  >
                    Save Changes &rarr;
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
         * MODAL: ADD CUSTOM PIPELINE STAGE
         * ===================================================================== */}
        {showAddStageModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
            <div className="w-full max-w-md rounded-2xl bg-slate-950 border border-slate-800 p-6 shadow-2xl text-slate-200">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                <h3 className="text-base font-bold text-white">Add Custom Pipeline Stage</h3>
                <button onClick={() => setShowAddStageModal(false)} className="text-slate-500 hover:text-white text-lg">
                  &times;
                </button>
              </div>

              <form onSubmit={handleAddCustomStage} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Stage Name *</label>
                  <input
                    type="text"
                    required
                    value={newStageName}
                    onChange={(e) => setNewStageName(e.target.value)}
                    placeholder="e.g. Executive Bar Raiser Interview"
                    className="w-full rounded-xl bg-slate-900 border border-slate-800 p-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Turnaround SLA (Days)</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={newStageSla}
                    onChange={(e) => setNewStageSla(Number(e.target.value))}
                    className="w-full rounded-xl bg-slate-900 border border-slate-800 p-2 text-white"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowAddStageModal(false)}
                    className="rounded-xl border border-slate-800 px-4 py-2 text-xs font-bold text-slate-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500"
                  >
                    Add Stage &rarr;
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* =====================================================================
         * MODAL: ADD RECRUITING AUTOMATION RULE
         * ===================================================================== */}
        {showAddRuleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
            <div className="w-full max-w-lg rounded-2xl bg-slate-950 border border-slate-800 p-6 shadow-2xl text-slate-200">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>➕ Add Custom Recruiting Automation Rule</span>
                </h3>
                <button onClick={() => setShowAddRuleModal(false)} className="text-slate-500 hover:text-white text-lg">
                  &times;
                </button>
              </div>

              <form onSubmit={handleCreateRule} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Rule Name *</label>
                  <input
                    type="text"
                    required
                    value={newRule.name}
                    onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                    placeholder="e.g. Auto-Notify Hiring Manager on Offer Extension"
                    className="w-full rounded-xl bg-slate-900 border border-slate-800 p-2 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Rule Code (Unique) *</label>
                    <input
                      type="text"
                      required
                      value={newRule.code}
                      onChange={(e) => setNewRule({ ...newRule, code: e.target.value.toUpperCase().replace(/\s+/g, "_") })}
                      placeholder="e.g. NOTIFY_HM_OFFER"
                      className="w-full rounded-xl bg-slate-900 border border-slate-800 p-2 text-white font-mono uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Rule Category</label>
                    <select
                      value={newRule.category}
                      onChange={(e) => setNewRule({ ...newRule, category: e.target.value as any })}
                      className="w-full rounded-xl bg-slate-900 border border-slate-800 p-2 text-white"
                    >
                      <option value="WORKFLOW_AUTOMATION">Workflow Automation</option>
                      <option value="COMPLIANCE_GATE">Compliance Gate</option>
                      <option value="SLA_MONITOR">SLA Monitor</option>
                      <option value="CANDIDATE_EXPERIENCE">Candidate Experience</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={newRule.description}
                    onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                    placeholder="Describe business reason and trigger outcome..."
                    className="w-full rounded-xl bg-slate-900 border border-slate-800 p-2 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Trigger Event</label>
                    <input
                      type="text"
                      value={newRule.triggerEvent}
                      onChange={(e) => setNewRule({ ...newRule, triggerEvent: e.target.value })}
                      placeholder="e.g. STAGE_CHANGE, ASSESSMENT_COMPLETED"
                      className="w-full rounded-xl bg-slate-900 border border-slate-800 p-2 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Threshold Value (Optional)</label>
                    <input
                      type="number"
                      value={newRule.thresholdValue || ""}
                      onChange={(e) => setNewRule({ ...newRule, thresholdValue: Number(e.target.value) })}
                      placeholder="e.g. 85"
                      className="w-full rounded-xl bg-slate-900 border border-slate-800 p-2 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Condition Description (IF)</label>
                  <input
                    type="text"
                    value={newRule.conditionDescription}
                    onChange={(e) => setNewRule({ ...newRule, conditionDescription: e.target.value })}
                    placeholder="e.g. Candidate reaches OFFER stage with approved headcount slot"
                    className="w-full rounded-xl bg-slate-900 border border-slate-800 p-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Automated Action (THEN)</label>
                  <input
                    type="text"
                    value={newRule.actionDescription}
                    onChange={(e) => setNewRule({ ...newRule, actionDescription: e.target.value })}
                    placeholder="e.g. Send Outlook calendar placeholder and dispatch Teams card"
                    className="w-full rounded-xl bg-slate-900 border border-slate-800 p-2 text-white"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowAddRuleModal(false)}
                    className="rounded-xl border border-slate-800 px-4 py-2 text-xs font-bold text-slate-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white hover:bg-amber-500"
                  >
                    Create & Activate Rule &rarr;
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* =====================================================================
         * MODAL: ADD SCREENING QUESTION
         * ===================================================================== */}
        {showAddQuestionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
            <div className="w-full max-w-lg rounded-2xl bg-slate-950 border border-slate-800 p-6 shadow-2xl text-slate-200">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>➕ Add Custom Screening Question</span>
                </h3>
                <button onClick={() => setShowAddQuestionModal(false)} className="text-slate-500 hover:text-white text-lg">
                  &times;
                </button>
              </div>

              <form onSubmit={handleAddScreeningQuestion} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Question Prompt *</label>
                  <textarea
                    rows={2}
                    required
                    value={newQuestion.question}
                    onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                    placeholder="e.g. Do you have at least 3 years experience deploying Kubernetes clusters in production?"
                    className="w-full rounded-xl bg-slate-900 border border-slate-800 p-2 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Response Type</label>
                    <select
                      value={newQuestion.type}
                      onChange={(e) => setNewQuestion({ ...newQuestion, type: e.target.value as any })}
                      className="w-full rounded-xl bg-slate-900 border border-slate-800 p-2 text-white"
                    >
                      <option value="YES_NO">Yes / No (Boolean)</option>
                      <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                      <option value="NUMERIC">Numeric Value</option>
                      <option value="TEXT">Short Text</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Ideal / Passing Answer</label>
                    <input
                      type="text"
                      value={newQuestion.idealAnswer}
                      onChange={(e) => setNewQuestion({ ...newQuestion, idealAnswer: e.target.value })}
                      placeholder="e.g. YES"
                      className="w-full rounded-xl bg-slate-900 border border-slate-800 p-2 text-white font-mono"
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-3 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newQuestion.isKnockout}
                      onChange={(e) => setNewQuestion({ ...newQuestion, isKnockout: e.target.checked })}
                      className="rounded border-rose-700 bg-slate-900 text-rose-500 focus:ring-0 h-4 w-4"
                    />
                    <span className="text-white font-bold text-xs flex items-center gap-1.5">
                      <span>🚨 Knockout Screening Question</span>
                    </span>
                  </label>
                  <p className="text-[11px] text-slate-400">
                    If enabled, candidates answering contrary to the passing answer are immediately disqualified and routed to Future Consideration.
                  </p>

                  {newQuestion.isKnockout && (
                    <div className="pt-2">
                      <label className="block text-rose-300 font-medium mb-1 text-[11px]">Knockout Rejection Reason (Audit Log)</label>
                      <input
                        type="text"
                        value={newQuestion.knockoutReason}
                        onChange={(e) => setNewQuestion({ ...newQuestion, knockoutReason: e.target.value })}
                        placeholder="e.g. Missing mandatory Kubernetes production certification"
                        className="w-full rounded-xl bg-slate-900 border border-slate-800 p-2 text-white"
                      />
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowAddQuestionModal(false)}
                    className="rounded-xl border border-slate-800 px-4 py-2 text-xs font-bold text-slate-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500"
                  >
                    Add Question &rarr;
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
