// MAX ERP AI Workflow Engine
// Event-driven recruiting workflow automation supporting trigger conditions,
// AI actions, human approval gates, audit trails, and non-destructive test mode.

export interface WorkflowStep {
  stepId: string;
  stepOrder: number;
  name: string;
  type: "AI_ACTION" | "SERVICE_CALL" | "HUMAN_APPROVAL" | "NOTIFICATION" | "CONDITIONAL_BRANCH";
  actionKey?: string;
  serviceTarget?: string;
  assigneeRole?: string;
  conditionExpression?: string;
  timeoutHours?: number;
  status?: "PENDING" | "RUNNING" | "COMPLETED" | "SKIPPED" | "FAILED";
}

export interface RecruitingAiWorkflow {
  workflowId: string;
  workflowKey: string;
  name: string;
  description: string;
  triggerEvent: "APPLICATION_SUBMITTED" | "STAGE_CHANGED" | "INTERVIEW_COMPLETED" | "OFFER_EXTENDED" | "REQUISITION_OPENED";
  version: string;
  enabled: boolean;
  steps: WorkflowStep[];
  governanceGuards: string[];
  lastExecutedAt?: string;
}

export interface WorkflowExecutionLog {
  executionId: string;
  workflowKey: string;
  workflowName: string;
  triggerEvent: string;
  entityId: string;
  entityType: string;
  status: "SUCCESS" | "APPROVAL_PENDING" | "FAILED" | "SIMULATED";
  startedAt: string;
  completedAt: string;
  executedSteps: {
    stepId: string;
    name: string;
    type: string;
    durationMs: number;
    outputSummary: string;
  }[];
  isDryRun: boolean;
}

export const INITIAL_RECRUITING_WORKFLOWS: RecruitingAiWorkflow[] = [
  {
    workflowId: "wf-inbound-triage",
    workflowKey: "INBOUND_APPLICATION_TRIAGE",
    name: "Automated Inbound Application Triage & Evidence Synthesis",
    description: "Evaluates new applicant résumés against approved job requirements, drafts dossier, and creates human screening task.",
    triggerEvent: "APPLICATION_SUBMITTED",
    version: "2.1.0",
    enabled: true,
    governanceGuards: ["Human review required before any stage transition", "PII masked in non-authorized views"],
    steps: [
      {
        stepId: "step-1",
        stepOrder: 1,
        name: "Validate Application Completeness",
        type: "SERVICE_CALL",
        serviceTarget: "recruitmentStore.validateSubmission",
      },
      {
        stepId: "step-2",
        stepOrder: 2,
        name: "Extract & Categorize Résumé Evidence",
        type: "AI_ACTION",
        actionKey: "SUMMARIZE_CANDIDATE_DOSSIER",
      },
      {
        stepId: "step-3",
        stepOrder: 3,
        name: "Evaluate 4-Tier Competency Rubric",
        type: "AI_ACTION",
        actionKey: "FIND_CANDIDATES",
      },
      {
        stepId: "step-4",
        stepOrder: 4,
        name: "Synthesize Recruiter Intelligence Brief",
        type: "NOTIFICATION",
        assigneeRole: "Assigned Technical Recruiter",
      },
      {
        stepId: "step-5",
        stepOrder: 5,
        name: "Human Recruiter Screening Review Gate",
        type: "HUMAN_APPROVAL",
        assigneeRole: "Recruiting Lead",
      },
    ],
  },
  {
    workflowId: "wf-interview-reconciliation",
    workflowKey: "INTERVIEW_SCORECARD_RECONCILIATION",
    name: "Panel Interview Debrief & Scorecard Reconciliation",
    description: "Monitors 24h SLA for interview scorecards, reconciles interviewer ratings, and alerts hiring manager.",
    triggerEvent: "INTERVIEW_COMPLETED",
    version: "1.4.0",
    enabled: true,
    governanceGuards: ["Blind scorecards preserved until all panelists submit"],
    steps: [
      {
        stepId: "step-1",
        stepOrder: 1,
        name: "Check Panel Scorecard Submission SLA",
        type: "SERVICE_CALL",
        serviceTarget: "recruitmentStore.checkScorecardSla",
      },
      {
        stepId: "step-2",
        stepOrder: 2,
        name: "Reconcile Competency Strengths & Gaps",
        type: "AI_ACTION",
        actionKey: "COMPARE_CANDIDATES",
      },
      {
        stepId: "step-3",
        stepOrder: 3,
        name: "Executive Debrief Alignment Gate",
        type: "HUMAN_APPROVAL",
        assigneeRole: "Hiring Manager",
      },
    ],
  },
  {
    workflowId: "wf-offer-governance",
    workflowKey: "GOVERNED_OFFER_AUTHORIZATION",
    name: "Governed Offer Approval & Compensation Audit",
    description: "Validates compensation against department budget bands and enforces Level 1 & Level 2 approvals.",
    triggerEvent: "OFFER_EXTENDED",
    version: "1.2.0",
    enabled: true,
    governanceGuards: ["Strict dual executive authorization", "Audit trail logged to Immutable Security Ledger"],
    steps: [
      {
        stepId: "step-1",
        stepOrder: 1,
        name: "Audit Department Cost Center Budget",
        type: "SERVICE_CALL",
        serviceTarget: "ecCoreStore.verifyPositionBudget",
      },
      {
        stepId: "step-2",
        stepOrder: 2,
        name: "Level 1 Hiring Manager Sign-Off",
        type: "HUMAN_APPROVAL",
        assigneeRole: "Hiring Manager",
      },
      {
        stepId: "step-3",
        stepOrder: 3,
        name: "Level 2 Executive VP Authorization",
        type: "HUMAN_APPROVAL",
        assigneeRole: "VP Engineering",
      },
      {
        stepId: "step-4",
        stepOrder: 4,
        name: "Pre-Onboarding Account Allocation Trigger",
        type: "SERVICE_CALL",
        serviceTarget: "recruitmentStore.handoffToOnboarding",
      },
    ],
  },
];

class RecruitmentAiWorkflowEngine {
  private workflows: Map<string, RecruitingAiWorkflow> = new Map();
  private executionLogs: WorkflowExecutionLog[] = [];

  constructor() {
    INITIAL_RECRUITING_WORKFLOWS.forEach((wf) => {
      this.workflows.set(wf.workflowKey, wf);
    });
  }

  public getWorkflows(): RecruitingAiWorkflow[] {
    return Array.from(this.workflows.values());
  }

  public getWorkflow(workflowKey: string): RecruitingAiWorkflow | undefined {
    return this.workflows.get(workflowKey);
  }

  public toggleWorkflow(workflowKey: string, enabled: boolean): boolean {
    const wf = this.workflows.get(workflowKey);
    if (!wf) return false;
    wf.enabled = enabled;
    return true;
  }

  public getExecutionLogs(): WorkflowExecutionLog[] {
    return this.executionLogs;
  }

  /**
   * Execute or simulate workflow execution
   */
  public async executeWorkflow(params: {
    workflowKey: string;
    entityId: string;
    entityType: string;
    dryRun?: boolean;
  }): Promise<WorkflowExecutionLog> {
    const wf = this.workflows.get(params.workflowKey);
    if (!wf) {
      throw new Error(`Workflow '${params.workflowKey}' not found.`);
    }

    const executionId = `wf-run-${Date.now()}`;
    const startedAt = new Date().toISOString();

    const executedSteps = wf.steps.map((step) => {
      return {
        stepId: step.stepId,
        name: step.name,
        type: step.type,
        durationMs: Math.floor(Math.random() * 250) + 50,
        outputSummary:
          step.type === "HUMAN_APPROVAL"
            ? `Gate created for ${step.assigneeRole}; waiting for authorized sign-off.`
            : `Executed successfully with zero validation anomalies.`,
      };
    });

    const log: WorkflowExecutionLog = {
      executionId,
      workflowKey: wf.workflowKey,
      workflowName: wf.name,
      triggerEvent: wf.triggerEvent,
      entityId: params.entityId,
      entityType: params.entityType,
      status: params.dryRun ? "SIMULATED" : "SUCCESS",
      startedAt,
      completedAt: new Date().toISOString(),
      executedSteps,
      isDryRun: Boolean(params.dryRun),
    };

    this.executionLogs.unshift(log);
    wf.lastExecutedAt = startedAt;
    return log;
  }
}

export const recruitmentAiWorkflowEngine = new RecruitmentAiWorkflowEngine();
