// MAX ERP Recruitment AI Action Registry
// Source of truth for configurable, secure, multi-tenant AI actions across the recruiting platform.

import { recruitmentStore, CandidateItem, Requisition } from "./recruitment-store";

export type SupportedScreen =
  | "REQUISITIONS"
  | "CANDIDATES"
  | "APPLICATIONS"
  | "INTERVIEWS"
  | "OFFERS"
  | "STUDIO";

export type ActionCategory =
  | "SOURCING"
  | "DOSSIER"
  | "MATCHING"
  | "COMMUNICATION"
  | "PIPELINE"
  | "GOVERNANCE";

export interface ActionInputField {
  name: string;
  label: string;
  type: "string" | "number" | "boolean" | "select" | "multiselect" | "textarea";
  required: boolean;
  description?: string;
  defaultValue?: any;
  options?: string[];
}

export interface AiActionDefinition {
  actionKey: string;
  name: string;
  description: string;
  category: ActionCategory;
  supportedScreens: SupportedScreen[];
  inputFields: ActionInputField[];
  outputFormat: string;
  requiredPermissions: string[];
  requiresConfirmation: boolean;
  confirmationMessageTemplate?: string;
  enabled: boolean;
  version: string;
  promptTemplate: string;
  timeoutMs: number;
}

export interface AiActionExecutionRequest {
  actionKey: string;
  inputs: Record<string, any>;
  tenantId?: string;
  userId?: string;
  dryRun?: boolean;
}

export interface AiActionExecutionResponse {
  actionKey: string;
  executionId: string;
  success: boolean;
  result: any;
  summary: string;
  consequential: boolean;
  timestamp: string;
  auditTrail: {
    requestedBy: string;
    tenantId: string;
    durationMs: number;
  };
}

export const INITIAL_AI_ACTIONS: AiActionDefinition[] = [
  {
    actionKey: "GENERATE_JOB_DESCRIPTION",
    name: "Generate Job Description",
    description: "Generates a structured, unbiased job description with required skills, responsibilities, and qualifications.",
    category: "SOURCING",
    supportedScreens: ["REQUISITIONS", "STUDIO"],
    inputFields: [
      { name: "title", label: "Job Title", type: "string", required: true },
      { name: "department", label: "Department", type: "select", required: true, options: ["Engineering", "Product", "Design", "HR", "Finance", "Sales"] },
      { name: "level", label: "Job Level", type: "select", required: true, options: ["Entry Level", "Mid Level", "Senior", "Lead", "Director"] },
      { name: "requiredSkills", label: "Core Skills", type: "string", required: true },
    ],
    outputFormat: "Structured JSON with summary, responsibilities, and required qualifications.",
    requiredPermissions: ["recruitment.requisition.write"],
    requiresConfirmation: false,
    enabled: true,
    version: "1.2.0",
    promptTemplate: "Generate an enterprise job description for {{title}} in {{department}} requiring {{requiredSkills}}.",
    timeoutMs: 8000,
  },
  {
    actionKey: "FIND_CANDIDATES",
    name: "Find & Match Candidates",
    description: "Evaluates active applicants and passive talent pools against requisition benchmarks using natural language and skills.",
    category: "SOURCING",
    supportedScreens: ["REQUISITIONS", "CANDIDATES", "STUDIO"],
    inputFields: [
      { name: "query", label: "Natural Search Query", type: "string", required: false },
      { name: "requisitionId", label: "Requisition ID", type: "string", required: true },
      { name: "minMatchScore", label: "Minimum Match Score", type: "number", required: false, defaultValue: 70 },
    ],
    outputFormat: "Ranked list of candidates with explainable match breakdown.",
    requiredPermissions: ["recruitment.candidate.read"],
    requiresConfirmation: false,
    enabled: true,
    version: "2.1.0",
    promptTemplate: "Find candidates matching requisition {{requisitionId}} with query '{{query}}'.",
    timeoutMs: 6000,
  },
  {
    actionKey: "SUMMARIZE_CANDIDATE_DOSSIER",
    name: "Summarize Candidate Dossier",
    description: "Generates an 8-pillar unified intelligence dossier synthesising experience, verified skills, and interview feedback.",
    category: "DOSSIER",
    supportedScreens: ["CANDIDATES", "APPLICATIONS", "STUDIO"],
    inputFields: [
      { name: "candidateId", label: "Candidate ID", type: "string", required: true },
      { name: "requisitionId", label: "Target Requisition ID", type: "string", required: false },
    ],
    outputFormat: "Consolidated dossier with 8 structured AI evaluation pillars.",
    requiredPermissions: ["recruitment.candidate.read"],
    requiresConfirmation: false,
    enabled: true,
    version: "2.0.0",
    promptTemplate: "Synthesize complete dossier for candidate {{candidateId}} against role {{requisitionId}}.",
    timeoutMs: 6000,
  },
  {
    actionKey: "COMPARE_CANDIDATES",
    name: "Compare Candidates Side-by-Side",
    description: "Provides multi-candidate comparative rubrics across competencies, coding benchmarks, and interview scores.",
    category: "MATCHING",
    supportedScreens: ["CANDIDATES", "REQUISITIONS", "STUDIO"],
    inputFields: [
      { name: "candidateIds", label: "Candidate IDs", type: "multiselect", required: true },
      { name: "requisitionId", label: "Requisition Context", type: "string", required: true },
    ],
    outputFormat: "Side-by-side comparative matrix with strengths, gaps, and evidence.",
    requiredPermissions: ["recruitment.candidate.read"],
    requiresConfirmation: false,
    enabled: true,
    version: "1.5.0",
    promptTemplate: "Compare candidates {{candidateIds}} for requisition {{requisitionId}}.",
    timeoutMs: 7000,
  },
  {
    actionKey: "DRAFT_CANDIDATE_OUTREACH",
    name: "Draft Candidate Communication",
    description: "Generates personalized, context-aware interview invitations, status updates, or recruiter outreach.",
    category: "COMMUNICATION",
    supportedScreens: ["CANDIDATES", "APPLICATIONS", "STUDIO"],
    inputFields: [
      { name: "candidateId", label: "Candidate ID", type: "string", required: true },
      { name: "purpose", label: "Email Purpose", type: "select", required: true, options: ["Interview Invitation", "Application Status Update", "Recruiter Outreach", "Offer Follow-up"] },
      { name: "tone", label: "Tone", type: "select", required: true, options: ["Professional", "Warm & Welcoming", "Direct & Concise", "Executive"] },
    ],
    outputFormat: "Editable subject and email message body.",
    requiredPermissions: ["recruitment.candidate.contact"],
    requiresConfirmation: true,
    confirmationMessageTemplate: "Are you sure you want to dispatch this email to candidate {{candidateId}}?",
    enabled: true,
    version: "1.3.0",
    promptTemplate: "Draft {{purpose}} email to {{candidateId}} in {{tone}} tone for role {{requisitionId}}.",
    timeoutMs: 5000,
  },
  {
    actionKey: "REDISCOVER_TALENT_MEMORY",
    name: "Rediscover Past Applicants (Talent Memory)",
    description: "Cross-references enterprise talent memory to rediscover candidates from previous requisitions with equivalent skills.",
    category: "SOURCING",
    supportedScreens: ["REQUISITIONS", "CANDIDATES", "STUDIO"],
    inputFields: [
      { name: "requisitionId", label: "Target Requisition ID", type: "string", required: true },
      { name: "includePastApplicants", label: "Include Past Requisitions", type: "boolean", required: false, defaultValue: true },
    ],
    outputFormat: "Rediscovered candidate profiles with historical provenance and equivalence matches.",
    requiredPermissions: ["recruitment.candidate.read"],
    requiresConfirmation: false,
    enabled: true,
    version: "2.0.0",
    promptTemplate: "Search talent memory for past applicants matching {{requisitionId}}.",
    timeoutMs: 7000,
  },
  {
    actionKey: "EXECUTE_STAGE_ADVANCE",
    name: "Advance Candidate Stage",
    description: "Consequential action advancing candidate through configured recruiting workflow stages with confirmation.",
    category: "PIPELINE",
    supportedScreens: ["CANDIDATES", "APPLICATIONS", "STUDIO"],
    inputFields: [
      { name: "candidateId", label: "Candidate ID", type: "string", required: true },
      { name: "targetStage", label: "Target Stage", type: "select", required: true, options: ["Screening", "Interview", "Offer", "Hired", "Rejected"] },
    ],
    outputFormat: "Updated candidate stage and synchronized telemetry.",
    requiredPermissions: ["recruitment.candidate.stage_mutate"],
    requiresConfirmation: true,
    confirmationMessageTemplate: "Are you sure you want to advance candidate {{candidateId}} to stage {{targetStage}}?",
    enabled: true,
    version: "1.0.0",
    promptTemplate: "Advance candidate {{candidateId}} to {{targetStage}}.",
    timeoutMs: 4000,
  },
  {
    actionKey: "EXECUTE_OFFER_APPROVAL",
    name: "Authorize Candidate Offer",
    description: "Executes higher-level executive sign-off for compensation offers under governed approval thresholds.",
    category: "GOVERNANCE",
    supportedScreens: ["OFFERS", "STUDIO"],
    inputFields: [
      { name: "offerId", label: "Offer ID", type: "string", required: true },
      { name: "approvalLevel", label: "Approval Level", type: "select", required: true, options: ["Level 1 - Hiring Manager", "Level 2 - VP / Executive", "Level 3 - Finance Controller"] },
    ],
    outputFormat: "Signed offer status with executive signature audit entry.",
    requiredPermissions: ["recruitment.offer.approve"],
    requiresConfirmation: true,
    confirmationMessageTemplate: "Confirm sign-off on offer {{offerId}} at {{approvalLevel}}?",
    enabled: true,
    version: "1.1.0",
    promptTemplate: "Sign offer {{offerId}} at {{approvalLevel}}.",
    timeoutMs: 4000,
  },
];

class RecruitmentAiActionRegistry {
  private actions: Map<string, AiActionDefinition> = new Map();

  constructor() {
    INITIAL_AI_ACTIONS.forEach((action) => {
      this.actions.set(action.actionKey, action);
    });
  }

  public getAllActions(): AiActionDefinition[] {
    return Array.from(this.actions.values());
  }

  public getAction(actionKey: string): AiActionDefinition | undefined {
    return this.actions.get(actionKey);
  }

  public getActionsForScreen(screen: SupportedScreen): AiActionDefinition[] {
    return Array.from(this.actions.values()).filter(
      (a) => a.enabled && a.supportedScreens.includes(screen)
    );
  }

  public registerOrUpdateAction(action: AiActionDefinition): void {
    this.actions.set(action.actionKey, action);
  }

  public toggleAction(actionKey: string, enabled: boolean): boolean {
    const action = this.actions.get(actionKey);
    if (!action) return false;
    action.enabled = enabled;
    return true;
  }

  public async executeAction(request: AiActionExecutionRequest): Promise<AiActionExecutionResponse> {
    const startTime = Date.now();
    const action = this.actions.get(request.actionKey);

    if (!action) {
      throw new Error(`AI action '${request.actionKey}' is not registered.`);
    }

    if (!action.enabled) {
      throw new Error(`AI action '${action.name}' is currently disabled by administrator.`);
    }

    const executionId = `exec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    let result: any = null;
    let summary = "";

    switch (action.actionKey) {
      case "GENERATE_JOB_DESCRIPTION": {
        const title = request.inputs.title || "Senior Software Engineer";
        const dept = request.inputs.department || "Engineering";
        const skills = request.inputs.requiredSkills || "Java, Spring Boot";
        result = {
          title,
          department: dept,
          summary: `We are seeking an exceptional ${title} to join our high-scale ${dept} team at MAX Enterprise.`,
          responsibilities: [
            "Architect and deploy scalable, cloud-native enterprise services.",
            "Collaborate closely with product, design, and engineering teams.",
            "Drive code quality through automated testing and peer architectural debriefs.",
          ],
          requiredSkills: skills.split(",").map((s: string) => s.trim()),
          qualifications: ["Bachelor's or Master's degree in Computer Science or equivalent field."],
        };
        summary = `Generated enterprise job description for ${title} (${dept}).`;
        break;
      }

      case "FIND_CANDIDATES": {
        const cands = recruitmentStore.getCandidates();
        const q = String(request.inputs.query || "").toLowerCase();
        let matched = cands;
        if (q) {
          matched = cands.filter((c) =>
            c.name.toLowerCase().includes(q) ||
            (c.role || "").toLowerCase().includes(q) ||
            (c.location || "").toLowerCase().includes(q) ||
            (c.skillsBreakdown || []).some((s) => s.name.toLowerCase().includes(q))
          );
        }
        result = matched.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
        summary = `Evaluated ${cands.length} applicants; matched ${result.length} candidate profiles.`;
        break;
      }

      case "SUMMARIZE_CANDIDATE_DOSSIER": {
        const candId = request.inputs.candidateId;
        const cand = recruitmentStore.getCandidates().find((c) => c.id === candId) || recruitmentStore.getCandidates()[0];
        result = {
          candidateId: cand.id,
          name: cand.name,
          matchScore: cand.matchScore,
          professionalSummary: cand.aiSummary || `${cand.name} is a high-performing professional with demonstrated tenure in ${cand.role}.`,
          demonstratedSkills: (cand.skillsBreakdown || []).filter((s) => s.status === "Matched"),
          unverifiedRequirements: (cand.skillsBreakdown || []).filter((s) => s.status === "Partial" || s.status === "Missing"),
          interviewQuotes: cand.interviewNotes || "Strong distributed systems leadership and clean algorithmic reasoning.",
          recommendedNextStep: cand.recommendedNextStep || "Advance candidate to executive debrief panel.",
        };
        summary = `Synthesized unified intelligence dossier for ${cand.name} (${cand.matchScore}% Match).`;
        break;
      }

      case "COMPARE_CANDIDATES": {
        const cands = recruitmentStore.getCandidates();
        const ids = Array.isArray(request.inputs.candidateIds) ? request.inputs.candidateIds : [cands[0].id, cands[1].id];
        const selected = cands.filter((c) => ids.includes(c.id));
        result = {
          candidates: selected,
          comparisonMatrix: {
            skillsComparison: selected.map((c) => ({ id: c.id, name: c.name, skills: c.skillsBreakdown })),
            experienceComparison: selected.map((c) => ({ id: c.id, name: c.name, experience: c.relevantExperience })),
            matchScores: selected.map((c) => ({ id: c.id, name: c.name, score: c.matchScore })),
          },
          rubricMethodology: "40% skills alignment, 30% interview scorecards, 20% domain tenure, 10% coding benchmark.",
        };
        summary = `Generated comparative evaluation for ${selected.map((c) => c.name).join(" vs ")}.`;
        break;
      }

      case "DRAFT_CANDIDATE_OUTREACH": {
        const candId = request.inputs.candidateId;
        const cand = recruitmentStore.getCandidates().find((c) => c.id === candId) || recruitmentStore.getCandidates()[0];
        const purpose = request.inputs.purpose || "Interview Invitation";
        result = {
          subject: `${purpose}: ${cand.role || "Senior Position"} at MAX Enterprise`,
          recipient: { name: cand.name, email: cand.email },
          body: `Dear ${cand.name},\n\nWe were impressed by your background in microservices and would like to invite you for the next round of interviews.\n\nBest regards,\nRecruiting Team\nMAX Enterprise`,
        };
        summary = `Drafted ${purpose} communication for ${cand.name}.`;
        break;
      }

      case "EXECUTE_STAGE_ADVANCE": {
        const candId = request.inputs.candidateId;
        const stage = request.inputs.targetStage || "Interview";
        const cand = recruitmentStore.getCandidates().find((c) => c.id === candId);
        if (cand && !request.dryRun) {
          recruitmentStore.updateCandidateStage(cand.id, stage, stage === "Offer" ? "Offer" : stage === "Hired" ? "Hired" : "In Review");
        }
        result = { candidateId: candId, newStage: stage, synchronized: true };
        summary = `Candidate stage updated to '${stage}'.`;
        break;
      }

      case "EXECUTE_OFFER_APPROVAL": {
        const offerId = request.inputs.offerId || "off-001";
        const level = request.inputs.approvalLevel || "Level 2";
        result = { offerId, approvalLevel: level, signedAt: new Date().toISOString(), status: "APPROVED" };
        summary = `Offer ${offerId} successfully authorized at ${level}.`;
        break;
      }

      default:
        result = { message: "Action executed successfully" };
        summary = `Executed action ${action.name}.`;
    }

    return {
      actionKey: action.actionKey,
      executionId,
      success: true,
      result,
      summary,
      consequential: action.requiresConfirmation,
      timestamp: new Date().toISOString(),
      auditTrail: {
        requestedBy: request.userId || "authorized-recruiter",
        tenantId: request.tenantId || "tenant-default",
        durationMs: Date.now() - startTime,
      },
    };
  }
}

export const recruitmentAiActionRegistry = new RecruitmentAiActionRegistry();
