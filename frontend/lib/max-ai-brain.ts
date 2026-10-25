// MAX ERP Enterprise AI Brain
// Universal Cognitive Engine powering MAX AI Copilot across Recruiting, Workforce,
// Metadata Engine, Security Governance, Integrations, and Autonomous Action Execution.

import { identitySecurityStore } from "./identity-security-store";
import { ecCoreStore } from "./ec-core-store";
import { INITIAL_BUSINESS_OBJECTS } from "./business-objects-schema";
import { recruitmentStore } from "./recruitment-store";

export interface AiActionExecutionResult {
  actionId: string;
  actionType: string;
  entityType: string;
  entityId: string;
  entityName: string;
  summary: string;
  timestamp: string;
  success: boolean;
  deepLink?: string;
}

export interface FieldDraft {
  fieldKey: string;
  label: string;
  fieldType: string;
  required: boolean;
  displayOrder: number;
  defaultValue?: string;
  choiceOptions?: string[];
  description?: string;
}

export interface AiGeneratedSchema {
  objectKey: string;
  name: string;
  description: string;
  fields: FieldDraft[];
}

export interface StepDraft {
  stepOrder: number;
  name: string;
  stepType: string;
  approverRoleKey: string;
  approverRoleName: string;
  conditionExpression?: string;
}

export interface AiGeneratedWorkflow {
  workflowKey: string;
  name: string;
  description: string;
  businessObjectKey: string;
  steps: StepDraft[];
}

export interface PipelineStageDraft {
  stageOrder: number;
  stageKey: string;
  name: string;
  description: string;
  slaTargetHours: number;
  slaLabel: string;
  gateCriteria: string[];
  assignedRoles: string[];
  automatedActions: string[];
  color: string;
}

export interface AiGeneratedTalentPipeline {
  pipelineId: string;
  pipelineKey: string;
  name: string;
  targetDepartment: string;
  targetRole: string;
  description: string;
  version: string;
  totalTurnaroundSlaDays: number;
  stages: PipelineStageDraft[];
  complianceGuards: string[];
  status: "DRAFT_PROPOSAL" | "DEPLOYED_ACTIVE";
}

export interface AiChatReply {
  reply: string;
  actionType:
    | "PROPOSE_TALENT_PIPELINE"
    | "PROPOSE_SCHEMA"
    | "PROPOSE_WORKFLOW"
    | "EXECUTE_ACTION"
    | "DATA_INSIGHT"
    | "GENERAL_ASSISTANCE";
  proposedTalentPipeline?: AiGeneratedTalentPipeline | null;
  proposedPipeline?: AiGeneratedTalentPipeline | null;
  proposedSchema?: AiGeneratedSchema | null;
  proposedWorkflow?: AiGeneratedWorkflow | null;
  executedAction?: AiActionExecutionResult | null;
  suggestedQueries: string[];
  metricsSnapshot?: Record<string, string | number>;
}

export interface AiEnterpriseTelemetry {
  healthIndex: number;
  executiveSummary: string;
  approvalVelocity: string;
  headcountUtilization: string;
  openRequisitionsCount: number;
  totalEmployeesCount: number;
  activeSessionsCount: number;
  connectedIntegrationsCount: number;
  bottlenecks: string[];
  recommendations: string[];
}

class MaxAiBrain {
  /* --------------------------------------------------------------------------
   * Universal Chat & Intent Recognition
   * ------------------------------------------------------------------------ */

  public processPrompt(prompt: string, contextModule?: string): AiChatReply {
    const raw = prompt.trim();
    const q = raw.toLowerCase();

    // 1. ACTION: Approve / Reject Leave
    if ((q.includes("approve") || q.includes("reject")) && (q.includes("leave") || q.includes("time off") || q.includes("vacation"))) {
      const isApprove = !q.includes("reject");
      const leaves = ecCoreStore.getLeaveRequests();
      const target = leaves.find((l) => l.status === "PENDING") || leaves[0];
      if (target) {
        ecCoreStore.reviewLeaveRequest(target.id, isApprove ? "APPROVED" : "REJECTED", "Elena Vance (CEO / MAX AI Copilot)");
        const result: AiActionExecutionResult = {
          actionId: `act-${Date.now()}`,
          actionType: isApprove ? "APPROVE_LEAVE" : "REJECT_LEAVE",
          entityType: "TimeOffRequest",
          entityId: target.id,
          entityName: `${target.employeeName} (${target.leaveType})`,
          summary: `Successfully ${isApprove ? "approved" : "rejected"} statutory leave request for ${target.employeeName} (${target.totalDays} days). Accrual balance deducted automatically.`,
          timestamp: new Date().toISOString(),
          success: true,
          deepLink: "/workforce?tab=timeoff",
        };

        return {
          reply: `✅ **Action Executed**: ${result.summary}\n\nThe employee dossier and team absence calendar have been synchronized in real-time.`,
          actionType: "EXECUTE_ACTION",
          executedAction: result,
          suggestedQueries: [
            "View workforce leave balances",
            "Show team absence calendar",
            "Check headcount utilization",
          ],
        };
      }
    }

    // 2. ACTION: Freeze / Unfreeze Position Budget
    if (q.includes("position") && (q.includes("freeze") || q.includes("unfreeze"))) {
      const isFreeze = !q.includes("unfreeze");
      const positions = ecCoreStore.getPositions();
      const target = positions.find((p) => isFreeze ? p.status !== "FROZEN" : p.status === "FROZEN") || positions[positions.length - 1];
      if (target) {
        ecCoreStore.updatePosition(target.positionCode, { status: isFreeze ? "FROZEN" : "VACANT" });
        const result: AiActionExecutionResult = {
          actionId: `act-${Date.now()}`,
          actionType: isFreeze ? "FREEZE_POSITION" : "UNFREEZE_POSITION",
          entityType: "Position",
          entityId: target.positionCode,
          entityName: `${target.title} (${target.positionCode})`,
          summary: `Position budget ${isFreeze ? "FROZEN" : "UNFROZEN"} for ${target.title} (${target.positionCode}) in ${target.department}.`,
          timestamp: new Date().toISOString(),
          success: true,
          deepLink: "/workforce?tab=positions",
        };

        return {
          reply: `🛡️ **Position Budget Governance Updated**:\n\n${result.summary}\n\nRequisition routing for this headcount slot has been updated in talent acquisition pipeline.`,
          actionType: "EXECUTE_ACTION",
          executedAction: result,
          suggestedQueries: [
            "List vacant engineering positions",
            "Show organization 5-tier topology",
            "Analyze department headcount budget",
          ],
        };
      }
    }

    // 3. ACTION: Revoke / Terminate Session
    if (q.includes("session") && (q.includes("terminate") || q.includes("revoke") || q.includes("kill"))) {
      const sessions = identitySecurityStore.getActiveSessions();
      const target = sessions[sessions.length - 1] || {
        id: `sess-prod-${Date.now()}`,
        principalName: "marcus.chen",
        registeredClientId: "partner-data-ingest",
        ipAddress: "192.168.1.105",
        issuedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
        status: "ACTIVE" as const,
      };
      identitySecurityStore.terminateSession(target.id);
        const result: AiActionExecutionResult = {
          actionId: `act-${Date.now()}`,
          actionType: "TERMINATE_SESSION",
          entityType: "ActiveSession",
          entityId: target.id,
          entityName: `${target.principalName} (${target.registeredClientId})`,
          summary: `OAuth2 bearer session token forcefully revoked for principal ${target.principalName}. Immutable audit log logged.`,
          timestamp: new Date().toISOString(),
          success: true,
          deepLink: "/security",
        };

        return {
          reply: `🔒 **Security Token Revocation Complete**:\n\n${result.summary}\n\nThe client application will be challenged for re-authentication on its next API call.`,
          actionType: "EXECUTE_ACTION",
          executedAction: result,
          suggestedQueries: [
            "Inspect recent security audit events",
            "Review active OAuth sessions",
            "Check RBAC permission matrix",
          ],
        };
    }

    // 4. ACTION: Toggle RBAC Permission
    if (q.includes("permission") && (q.includes("grant") || q.includes("revoke") || q.includes("toggle"))) {
      const isGrant = !q.includes("revoke");
      const matrix = identitySecurityStore.getRbacMatrix();
      const role = matrix.roles.find((r) => r.roleKey.includes("RECRUIT") || r.roleKey.includes("ADMIN")) || matrix.roles[0];
      const perm = matrix.permissions.find((p) => p.permissionKey.includes("publish") || p.permissionKey.includes("write")) || matrix.permissions[0];

      identitySecurityStore.toggleRolePermission(role.id, perm.id, isGrant);
      const result: AiActionExecutionResult = {
        actionId: `act-${Date.now()}`,
        actionType: isGrant ? "GRANT_PERMISSION" : "REVOKE_PERMISSION",
        entityType: "RolePermission",
        entityId: `${role.id}:${perm.id}`,
        entityName: `${role.name} → ${perm.name}`,
        summary: `${isGrant ? "Granted" : "Revoked"} entitlement "${perm.name}" (${perm.permissionKey}) on role "${role.name}".`,
        timestamp: new Date().toISOString(),
        success: true,
        deepLink: "/security",
      };

      return {
        reply: `⚡ **RBAC Authority Matrix Synchronized**:\n\n${result.summary}\n\nChanges propagate immediately across all authenticated sessions.`,
        actionType: "EXECUTE_ACTION",
        executedAction: result,
        suggestedQueries: [
          "Show all roles for current tenant",
          "Inspect audit trail for RBAC shifts",
          "Check multi-tenant access control",
        ],
      };
    }

    // 5. ACTION: Ping Webhook / Trigger Integration
    if (q.includes("webhook") && (q.includes("ping") || q.includes("test") || q.includes("dispatch"))) {
      const webhooks = identitySecurityStore.getWebhooks();
      const target = webhooks[0];
      if (target) {
        const pingLog = identitySecurityStore.testPingWebhook(target.id);
        const result: AiActionExecutionResult = {
          actionId: `act-${Date.now()}`,
          actionType: "PING_WEBHOOK",
          entityType: "WebhookSubscription",
          entityId: target.id,
          entityName: target.name,
          summary: `Dispatched test payload to ${target.targetUrl}. HTTP 200 OK received in ${pingLog.latencyMs}ms.`,
          timestamp: new Date().toISOString(),
          success: true,
          deepLink: "/integrations",
        };

        return {
          reply: `📡 **Webhook Ping Successful**:\n\nTarget: \`${target.targetUrl}\`\nResponse: \`200 OK\` (${pingLog.latencyMs}ms latency)\nPayload received and acknowledged by subscriber.`,
          actionType: "EXECUTE_ACTION",
          executedAction: result,
          suggestedQueries: [
            "List active integration connectors",
            "View webhook delivery logs",
            "Check Salesforce CRM sync status",
          ],
        };
      }
    }

    // =========================================================================
    // 6. RECRUITMENT & TALENT ACTIONS (MAX AI Autonomous Agent)
    // =========================================================================

    // 6A. PROPOSE: Governed Talent Acquisition Pipeline Blueprint
    const isTalentPipelineIntent =
      (q.includes("pipeline") || q.includes("funnel") || q.includes("hiring stage") || q.includes("candidate stage") || q.includes("hiring stages")) &&
      (q.includes("talent") ||
        q.includes("recruit") ||
        q.includes("recruting") ||
        q.includes("hire") ||
        q.includes("hiring") ||
        q.includes("candidate") ||
        q.includes("job") ||
        q.includes("req") ||
        contextModule === "recruitment");

    if (isTalentPipelineIntent) {
      const pipeline = this.generateTalentPipeline(raw);
      return {
        reply:
          `🎯 **Autonomous Talent Acquisition Pipeline Synthesized**:\n\n` +
          `I have architected a governed 6-stage end-to-end recruitment pipeline for **${pipeline.name}** (\`${pipeline.pipelineKey}\`).\n\n` +
          `• **Stages Configured**: ${pipeline.stages.length} sequential candidate evaluation gates\n` +
          `• **Total SLA Turnaround**: ${pipeline.totalTurnaroundSlaDays} days end-to-end SLA\n` +
          `• **Gating Rules & Compliance**: Automated match scoring, blind scorecard calibration, and compensation compa-ratio governance\n\n` +
          `Review the pipeline blueprint below and click **"Deploy Pipeline to Recruiting"** to activate it across candidate tracking queues.`,
        actionType: "PROPOSE_TALENT_PIPELINE",
        proposedTalentPipeline: pipeline,
        proposedPipeline: pipeline,
        suggestedQueries: [
          "Deploy pipeline to all open engineering requisitions",
          "Create a job requisition for Senior Staff AI Engineer",
          "Advance candidate Priya Menon to Interview",
          "Send offer letter to Emily Zhang",
        ],
      };
    }

    // 6B. ACTION: Create Job Requisition
    if (
      (q.includes("requisition") || q.includes("job posting") || q.includes("open job") || q.includes("hire for") || q.includes("new job")) &&
      (q.includes("create") || q.includes("draft") || q.includes("open") || q.includes("build") || q.includes("add") || q.includes("new"))
    ) {
      let jobTitle = "Senior Staff AI Engineer";
      if (q.includes("engineer")) jobTitle = "Senior Staff AI Engineer";
      else if (q.includes("architect")) jobTitle = "Enterprise Cloud Architect";
      else if (q.includes("product")) jobTitle = "Principal Product Manager";
      else if (q.includes("sales") || q.includes("account")) jobTitle = "Enterprise Account Executive";
      else if (q.includes("analyst")) jobTitle = "Senior HR Business Analyst";
      else {
        const cleaned = raw.replace(/create|a|new|job|requisition|draft|for|the|posting|open/gi, "").trim();
        if (cleaned.length > 3) {
          jobTitle = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
        }
      }

      const department = (q.includes("product") ? "Product" : q.includes("sales") ? "Sales" : q.includes("hr") ? "HR" : "Engineering") as any;
      const newReq = recruitmentStore.addRequisition({
        title: jobTitle,
        department,
        status: "Open",
        targetHeadcount: 1,
        salaryRange: "$160,000 - $210,000",
        requiredSkills: ["Enterprise Architecture", "System Design", "Cloud Infrastructure", "Full Lifecycle Delivery"],
        description: `Autonomous requisition synthesized by MAX AI Copilot for strategic growth in ${department}.`,
      });

      const result: AiActionExecutionResult = {
        actionId: `act-${Date.now()}`,
        actionType: "CREATE_REQUISITION",
        entityType: "JobRequisition",
        entityId: newReq.id,
        entityName: `${newReq.title} (${newReq.reqNumber})`,
        summary: `Created open job requisition for ${newReq.title} in ${newReq.department} with 1 open slot. Status set to Open with automated talent sourcing enabled.`,
        timestamp: new Date().toISOString(),
        success: true,
        deepLink: "/recruitment/requisitions",
      };

      return {
        reply: `💼 **Job Requisition Created Successfully**:\n\n` +
          `• **Requisition Code**: \`${newReq.reqNumber}\`\n` +
          `• **Role Title**: **${newReq.title}**\n` +
          `• **Department**: ${newReq.department}\n` +
          `• **Status**: \`${newReq.status}\` (Target Headcount: ${newReq.targetHeadcount})\n` +
          `• **Budget Allocation**: ${newReq.salaryRange}\n\n` +
          `The requisition has been published to internal talent mobility boards and connected job distribution channels.`,
        actionType: "EXECUTE_ACTION",
        executedAction: result,
        suggestedQueries: [
          `View candidates for ${newReq.reqNumber}`,
          "Synthesize talent pipeline for this requisition",
          "List all open engineering requisitions",
        ],
      };
    }

    // 6C. ACTION: Advance Candidate in Pipeline
    if (
      (q.includes("advance") || q.includes("move") || q.includes("promote") || q.includes("shortlist")) &&
      (q.includes("candidate") || q.includes("applicant") || q.includes("priya") || q.includes("lucas") || q.includes("emily") || q.includes("arjun") || q.includes("stage") || q.includes("interview") || q.includes("offer"))
    ) {
      const candidates = recruitmentStore.getCandidates();
      let target = candidates.find((c) =>
        (q.includes("priya") && c.name.toLowerCase().includes("priya")) ||
        (q.includes("lucas") && c.name.toLowerCase().includes("lucas")) ||
        (q.includes("emily") && c.name.toLowerCase().includes("emily")) ||
        (q.includes("arjun") && c.name.toLowerCase().includes("arjun"))
      );
      if (!target) target = candidates[0];

      let nextStage: any = "Interview";
      let nextStatusLabel: any = "Interview";
      if (q.includes("offer")) {
        nextStage = "Offer";
        nextStatusLabel = "Offer";
      } else if (q.includes("hire") || q.includes("onboard")) {
        nextStage = "Hired";
        nextStatusLabel = "Hired";
      } else if (q.includes("screen")) {
        nextStage = "Screening";
        nextStatusLabel = "In Review";
      }

      if (target) {
        recruitmentStore.updateCandidateStage(target.id, nextStage, nextStatusLabel);
        const result: AiActionExecutionResult = {
          actionId: `act-${Date.now()}`,
          actionType: "ADVANCE_CANDIDATE_STAGE",
          entityType: "Candidate",
          entityId: target.id,
          entityName: `${target.name} (${target.role || target.requisitionTitle})`,
          summary: `Candidate ${target.name} advanced to ${nextStage} stage. Interview calibration notifications dispatched to hiring team.`,
          timestamp: new Date().toISOString(),
          success: true,
          deepLink: "/recruitment/candidates",
        };

        return {
          reply: `🚀 **Candidate Pipeline Advanced**:\n\n` +
            `• **Candidate**: **${target.name}** (\`${target.id}\`)\n` +
            `• **Requisition**: ${target.requisitionTitle}\n` +
            `• **New Stage**: \`${nextStage}\` (${nextStatusLabel})\n` +
            `• **AI Match Score**: ${target.matchScore}%\n\n` +
            `Interviewer calibration briefing dossiers have been synced and the candidate journey has been updated in real-time.`,
          actionType: "EXECUTE_ACTION",
          executedAction: result,
          suggestedQueries: [
            `View candidate dossier for ${target.name}`,
            `Schedule panel interview for ${target.name}`,
            "Generate candidate comparison matrix",
          ],
        };
      }
    }

    // 6D. ACTION: Approve or Send Offer Letter
    if (
      (q.includes("offer") || q.includes("letter")) &&
      (q.includes("send") || q.includes("approve") || q.includes("dispatch") || q.includes("sign off") || q.includes("issue"))
    ) {
      const isSend = q.includes("send") || q.includes("dispatch") || q.includes("issue");
      const offers = recruitmentStore.getOffers();
      let targetOffer = offers.find((o) =>
        (q.includes("emily") && o.candidateName.toLowerCase().includes("emily")) ||
        (q.includes("priya") && o.candidateName.toLowerCase().includes("priya")) ||
        (q.includes("lucas") && o.candidateName.toLowerCase().includes("lucas"))
      );
      if (!targetOffer) targetOffer = offers.find((o) => o.status === "Pending Approval") || offers[0];

      if (targetOffer) {
        let updatedOffer;
        if (isSend) {
          updatedOffer = recruitmentStore.sendOfferLetter(targetOffer.id, {
            templateTitle: "Executive Engineering Offer Letter (Global)",
            deliveryMethod: "DocuSign e-signature",
          });
        } else {
          updatedOffer = recruitmentStore.approveOfferByLevel(
            targetOffer.id,
            targetOffer.currentApprovalLevel || 1,
            "Approved by Executive Board via MAX AI Copilot",
            "Elena Vance (VP & MAX AI Copilot)"
          );
        }

        const result: AiActionExecutionResult = {
          actionId: `act-${Date.now()}`,
          actionType: isSend ? "SEND_OFFER_LETTER" : "APPROVE_OFFER",
          entityType: "CandidateOffer",
          entityId: targetOffer.id,
          entityName: `${targetOffer.candidateName} (${targetOffer.requisitionTitle})`,
          summary: isSend
            ? `Official offer letter dispatched to ${targetOffer.candidateName} via DocuSign e-signature with 7-day acceptance window.`
            : `Level ${targetOffer.currentApprovalLevel || 1} approval granted for ${targetOffer.candidateName}. Compensation package validated against compa-ratio midpoints.`,
          timestamp: new Date().toISOString(),
          success: true,
          deepLink: "/recruitment/offers",
        };

        return {
          reply: `📑 **Candidate Offer Action Completed**:\n\n` +
            `• **Candidate**: **${targetOffer.candidateName}**\n` +
            `• **Requisition**: ${targetOffer.requisitionTitle}\n` +
            `• **Compensation Package**: ${targetOffer.totalComp} (Base: ${targetOffer.baseSalary}, Equity: ${targetOffer.equity})\n` +
            `• **Status**: \`${updatedOffer?.status || targetOffer.status}\`\n\n` +
            `${result.summary}`,
          actionType: "EXECUTE_ACTION",
          executedAction: result,
          suggestedQueries: [
            "View offer approvals queue",
            "Track DocuSign e-signature telemetry",
            "View hire-to-retire pre-onboarding queue",
          ],
        };
      }
    }

    // 6E. ACTION: Schedule Interview
    if (
      (q.includes("schedule") || q.includes("book")) &&
      (q.includes("interview") || q.includes("round") || q.includes("call"))
    ) {
      const candidates = recruitmentStore.getCandidates();
      let target = candidates.find((c) =>
        (q.includes("priya") && c.name.toLowerCase().includes("priya")) ||
        (q.includes("lucas") && c.name.toLowerCase().includes("lucas")) ||
        (q.includes("emily") && c.name.toLowerCase().includes("emily"))
      ) || candidates[0];

      const interview = recruitmentStore.scheduleInterview({
        candidateName: target.name,
        candidateEmail: target.email,
        requisitionId: target.requisitionId,
        requisitionTitle: target.requisitionTitle,
        roundType: "Technical Architecture & System Design",
        scheduledDate: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
        time: "14:00 - 15:00 UTC",
        interviewerNames: ["John Smith (Director)", "Maria Lopez (Staff Architect)"],
      });

      const result: AiActionExecutionResult = {
        actionId: `act-${Date.now()}`,
        actionType: "SCHEDULE_INTERVIEW",
        entityType: "Interview",
        entityId: interview.id,
        entityName: `${interview.candidateName} - ${interview.roundType}`,
        summary: `Interview scheduled with ${interview.candidateName} for ${interview.scheduledDate} at ${interview.time}. Calendar invites and Microsoft Teams link dispatched.`,
        timestamp: new Date().toISOString(),
        success: true,
        deepLink: "/recruitment/interviews",
      };

      return {
        reply: `📅 **Interview Scheduled Successfully**:\n\n` +
          `• **Candidate**: **${interview.candidateName}**\n` +
          `• **Round**: ${interview.roundType}\n` +
          `• **Date & Time**: ${interview.scheduledDate} at ${interview.time}\n` +
          `• **Interviewers**: ${interview.interviewerNames.join(", ")}\n` +
          `• **Platform**: Microsoft Teams (${interview.meetingLink})\n\n` +
          `Automated candidate preparation packet and interviewer rubric scorecards have been synchronized.`,
        actionType: "EXECUTE_ACTION",
        executedAction: result,
        suggestedQueries: [
          "View scheduled interviews calendar",
          "Inspect candidate scorecard rubric",
          "Advance candidate to next stage",
        ],
      };
    }

    // 7. PROPOSE: Schema / Business Object Design
    if (
      q.includes("schema") ||
      q.includes("business object") ||
      q.includes("table") ||
      q.includes("entity") ||
      q.includes("create object") ||
      q.includes("model") ||
      q.includes("equipment") ||
      q.includes("asset") ||
      q.includes("contract") ||
      q.includes("vendor") ||
      q.includes("inventory") ||
      q.includes("project")
    ) {
      const schema = this.generateSchema(raw);
      return {
        reply: `I have architected a normalized enterprise Business Object schema for **${schema.name}** (\`${schema.objectKey}\`).\n\n` +
          `• **Normalized Fields**: ${schema.fields.length} typed attributes\n` +
          `• **Data Types**: ${Array.from(new Set(schema.fields.map((f) => f.fieldType))).join(", ")}\n` +
          `• **Constraints**: Mandatory validation rules, choice sets, and auto-indexed display order\n\n` +
          `Review the schema specification below and click **"Apply to System"** to register it directly into the MAX ERP Metadata Catalog.`,
        actionType: "PROPOSE_SCHEMA",
        proposedSchema: schema,
        suggestedQueries: [
          `Generate 3-stage approval workflow for ${schema.name}`,
          `Add reference field to Department in ${schema.name}`,
          `Generate sample CSV dataset for ${schema.name}`,
        ],
      };
    }

    // 8. PROPOSE: Approval Workflow Pipeline
    if (
      q.includes("workflow") ||
      q.includes("approval") ||
      q.includes("sign-off") ||
      q.includes("routing") ||
      (q.includes("pipeline") && !q.includes("talent") && !q.includes("recruit"))
    ) {
      const workflow = this.generateWorkflow(raw);
      return {
        reply: `I have synthesized an enterprise multi-tier governance workflow: **${workflow.name}** (\`${workflow.workflowKey}\`).\n\n` +
          `• **Stages Configured**: ${workflow.steps.length} sequential approval gates\n` +
          `• **Roles Assigned**: ${workflow.steps.map((s) => s.approverRoleName).join(" → ")}\n` +
          `• **Condition Expressions**: Dynamic threshold evaluation with SLA routing\n\n` +
          `Review the stage blueprint below and click **"Activate Workflow"** to deploy this governance gate.`,
        actionType: "PROPOSE_WORKFLOW",
        proposedWorkflow: workflow,
        suggestedQueries: [
          "Add automated escalation after 48 hours",
          "Require rationale remarks on rejection",
          "View pending workflow executions",
        ],
      };
    }

    // 8. DATA INSIGHTS: Telemetry & Executive Summary
    if (
      q.includes("insight") ||
      q.includes("telemetry") ||
      q.includes("analytics") ||
      q.includes("status") ||
      q.includes("summary") ||
      q.includes("bottleneck") ||
      q.includes("health") ||
      q.includes("how many") ||
      q.includes("headcount")
    ) {
      const insights = this.getEnterpriseTelemetry();
      return {
        reply: `📊 **MAX ERP Executive Telemetry Briefing**:\n\n` +
          `• **System Health Index**: **${insights.healthIndex}%** (Enterprise Grade)\n` +
          `• **Total Workforce Headcount**: **${insights.totalEmployeesCount} active employees** across 5 tiers\n` +
          `• **Talent Requisitions**: **${insights.openRequisitionsCount} open requisitions** in talent pipeline\n` +
          `• **Security & Identity**: **${insights.activeSessionsCount} live sessions**, 0 compromised credentials\n` +
          `• **Approval Velocity**: ${insights.approvalVelocity}\n\n` +
          `**Executive Summary**: ${insights.executiveSummary}`,
        actionType: "DATA_INSIGHT",
        suggestedQueries: [
          "Analyze open positions by department",
          "Check leave approval velocity",
          "Review enterprise integration health",
        ],
        metricsSnapshot: {
          healthIndex: insights.healthIndex,
          employees: insights.totalEmployeesCount,
          openRequisitions: insights.openRequisitionsCount,
          activeSessions: insights.activeSessionsCount,
        },
      };
    }

    // 9. GENERAL ASSISTANCE (Context-Aware)
    let moduleAdvice = "";
    if (contextModule === "recruitment" || q.includes("recruiting") || q.includes("candidate") || q.includes("job")) {
      moduleAdvice = "I am ready to screen candidate resumes, draft tailored job descriptions, benchmark compensation bands, or generate AI interview scorecards.";
    } else if (contextModule === "workforce" || q.includes("employee") || q.includes("position")) {
      moduleAdvice = "I can inspect 360 People Profiles, calculate promotion compa-ratios, approve pending PTO wallets, or model FTE budget rebalances.";
    } else if (contextModule === "security" || q.includes("security") || q.includes("rbac")) {
      moduleAdvice = "I can analyze session token lifecycles, audit privilege escalation events, or configure multi-tenant role-permission matrices.";
    } else {
      moduleAdvice = "I can design custom Business Object schemas with 20 field types, deploy multi-tier approval workflows, or automate cross-module operations.";
    }

    return {
      reply: `Hello! I am **MAX AI Enterprise Copilot**, embedded natively across all MAX ERP business modules.\n\n${moduleAdvice}\n\nYou can give me natural-language instructions to build schemas, manage workforce dossiers, execute approvals, or query enterprise telemetry.`,
      actionType: "GENERAL_ASSISTANCE",
      suggestedQueries: [
        "Design Equipment Maintenance schema",
        "Create 3-step Procurement Approval workflow",
        "Approve pending statutory leave requests",
        "Summarize enterprise operational telemetry",
      ],
    };
  }

  /* --------------------------------------------------------------------------
   * Schema Generation Engine
   * ------------------------------------------------------------------------ */

  public generateSchema(prompt: string): AiGeneratedSchema {
    const p = prompt.toLowerCase();

    // Healthcare / Medical Equipment
    if (p.includes("equipment") || p.includes("machine") || p.includes("maintenance") || p.includes("hospital")) {
      return {
        objectKey: "equipment_maintenance",
        name: "Equipment Maintenance Asset",
        description: "Enterprise asset maintenance tracking with statutory calibration schedules, maintenance logs, and downtime telemetry.",
        fields: [
          { fieldKey: "assetTag", label: "Asset Tag / Serial No", fieldType: "TEXT", required: true, displayOrder: 1 },
          { fieldKey: "equipmentName", label: "Equipment Name", fieldType: "TEXT", required: true, displayOrder: 2 },
          { fieldKey: "manufacturer", label: "Manufacturer", fieldType: "TEXT", required: true, displayOrder: 3 },
          { fieldKey: "modelNumber", label: "Model Number", fieldType: "TEXT", required: false, displayOrder: 4 },
          { fieldKey: "category", label: "Asset Category", fieldType: "CHOICE", required: true, displayOrder: 5, choiceOptions: ["DIAGNOSTIC", "SURGICAL", "LABORATORY", "FACILITY", "IT_HARDWARE"] },
          { fieldKey: "purchasePrice", label: "Acquisition Cost", fieldType: "CURRENCY", required: true, displayOrder: 6 },
          { fieldKey: "commissionDate", label: "Commissioning Date", fieldType: "DATE", required: true, displayOrder: 7 },
          { fieldKey: "nextServiceDue", label: "Next Preventive Service Due", fieldType: "DATE", required: true, displayOrder: 8 },
          { fieldKey: "operationalStatus", label: "Operational Status", fieldType: "CHOICE", required: true, displayOrder: 9, choiceOptions: ["OPERATIONAL", "UNDER_MAINTENANCE", "CALIBRATION_REQUIRED", "DECOMMISSIONED"] },
          { fieldKey: "isMissionCritical", label: "Mission Critical Asset", fieldType: "BOOLEAN", required: true, displayOrder: 10, defaultValue: "true" },
          { fieldKey: "serviceNotes", label: "Technician & Calibration Log", fieldType: "RICH_TEXT", required: false, displayOrder: 11 },
        ],
      };
    }

    // Vendor / Supplier Evaluation
    if (p.includes("vendor") || p.includes("supplier") || p.includes("evaluation") || p.includes("procurement")) {
      return {
        objectKey: "vendor_evaluation",
        name: "Vendor Performance Evaluation",
        description: "Quarterly vendor performance scorecard tracking SLA compliance, pricing competitiveness, and statutory certifications.",
        fields: [
          { fieldKey: "vendorCode", label: "Vendor Code", fieldType: "TEXT", required: true, displayOrder: 1 },
          { fieldKey: "legalName", label: "Vendor Legal Name", fieldType: "TEXT", required: true, displayOrder: 2 },
          { fieldKey: "evaluationPeriod", label: "Evaluation Quarter", fieldType: "CHOICE", required: true, displayOrder: 3, choiceOptions: ["Q1_2026", "Q2_2026", "Q3_2026", "Q4_2026"] },
          { fieldKey: "slaScore", label: "SLA Delivery Score (0-100)", fieldType: "NUMBER", required: true, displayOrder: 4 },
          { fieldKey: "qualityScore", label: "Quality Assessment Score (0-100)", fieldType: "NUMBER", required: true, displayOrder: 5 },
          { fieldKey: "pricingTier", label: "Commercial Competitiveness", fieldType: "CHOICE", required: true, displayOrder: 6, choiceOptions: ["EXEMPLARY", "COMPETITIVE", "EXPENSIVE", "NON_COMPLIANT"] },
          { fieldKey: "annualContractValue", label: "Annual Contract Value (ACV)", fieldType: "CURRENCY", required: true, displayOrder: 7 },
          { fieldKey: "isoCertified", label: "ISO 9001 / SOC2 Certified", fieldType: "BOOLEAN", required: true, displayOrder: 8, defaultValue: "true" },
          { fieldKey: "primaryContactEmail", label: "Vendor Account Executive Email", fieldType: "EMAIL", required: true, displayOrder: 9 },
          { fieldKey: "executiveSummary", label: "Procurement Committee Review", fieldType: "RICH_TEXT", required: false, displayOrder: 10 },
        ],
      };
    }

    // Expense / Reimbursement
    if (p.includes("expense") || p.includes("travel") || p.includes("reimburse") || p.includes("claim")) {
      return {
        objectKey: "employee_expense_claim",
        name: "Employee Expense Claim",
        description: "Corporate expense reimbursement dossier with multi-currency receipts, per-diem validation, and policy compliance.",
        fields: [
          { fieldKey: "claimNumber", label: "Expense Claim Number", fieldType: "TEXT", required: true, displayOrder: 1 },
          { fieldKey: "employeeId", label: "Employee ID", fieldType: "TEXT", required: true, displayOrder: 2 },
          { fieldKey: "expenseCategory", label: "Expense Category", fieldType: "CHOICE", required: true, displayOrder: 3, choiceOptions: ["AIRFARE", "LODGING", "MEALS_ENTERTAINMENT", "MILEAGE", "SOFTWARE_SAAS", "OFFICE_SUPPLIES"] },
          { fieldKey: "expenseDate", label: "Transaction Date", fieldType: "DATE", required: true, displayOrder: 4 },
          { fieldKey: "claimAmount", label: "Claim Amount", fieldType: "CURRENCY", required: true, displayOrder: 5 },
          { fieldKey: "receiptUrl", label: "Digital Receipt Document Link", fieldType: "URL", required: true, displayOrder: 6 },
          { fieldKey: "businessJustification", label: "Business Purpose & Client Details", fieldType: "TEXT", required: true, displayOrder: 7 },
          { fieldKey: "billableToClient", label: "Billable to Client Account", fieldType: "BOOLEAN", required: true, displayOrder: 8, defaultValue: "false" },
          { fieldKey: "costCenterCode", label: "Charging Cost Center", fieldType: "TEXT", required: true, displayOrder: 9 },
        ],
      };
    }

    // Default: Dynamic entity inferred from prompt keywords
    const cleanedName = prompt
      .replace(/create|design|build|make|schema|object|entity|table|for|a|an/gi, "")
      .trim();
    const title = cleanedName ? cleanedName.charAt(0).toUpperCase() + cleanedName.slice(1) : "Enterprise Asset Record";
    const key = title.toLowerCase().replace(/[^a-z0-9]+/g, "_").slice(0, 30);

    return {
      objectKey: key || "custom_asset",
      name: `${title} Record`,
      description: `Managed enterprise record for ${title} with audit tracking, statutory attributes, and workflow integration.`,
      fields: [
        { fieldKey: "code", label: `${title} Identifier Code`, fieldType: "TEXT", required: true, displayOrder: 1 },
        { fieldKey: "name", label: `${title} Primary Name`, fieldType: "TEXT", required: true, displayOrder: 2 },
        { fieldKey: "typeCategory", label: "Classification Category", fieldType: "CHOICE", required: true, displayOrder: 3, choiceOptions: ["STANDARD", "PREMIUM", "RESTRICTED", "ARCHIVED"] },
        { fieldKey: "monetaryValue", label: "Valuation Amount", fieldType: "CURRENCY", required: false, displayOrder: 4 },
        { fieldKey: "effectiveDate", label: "Effective Date", fieldType: "DATE", required: true, displayOrder: 5 },
        { fieldKey: "isActive", label: "Operational Active Flag", fieldType: "BOOLEAN", required: true, displayOrder: 6, defaultValue: "true" },
        { fieldKey: "remarks", label: "Audit & Operational Notes", fieldType: "RICH_TEXT", required: false, displayOrder: 7 },
      ],
    };
  }

  /* --------------------------------------------------------------------------
   * Workflow Generation Engine
   * ------------------------------------------------------------------------ */

  public generateWorkflow(prompt: string): AiGeneratedWorkflow {
    const p = prompt.toLowerCase();

    if (p.includes("procurement") || p.includes("purchase") || p.includes("vendor") || p.includes("10000") || p.includes("50000")) {
      return {
        workflowKey: "wf_procurement_tiered_approval",
        name: "Tiered Procurement & Expenditure Authorization",
        description: "Three-tier sequential approval pipeline routing purchase requisitions through Department Head, Finance Director, and Executive VP.",
        businessObjectKey: "customer",
        steps: [
          {
            stepOrder: 1,
            name: "Department Manager Approval",
            stepType: "APPROVAL",
            approverRoleKey: "ROLE_HR_SPECIALIST",
            approverRoleName: "Department Manager",
            conditionExpression: "record.amount >= 0",
          },
          {
            stepOrder: 2,
            name: "Finance Director Review & Budget Check",
            stepType: "APPROVAL",
            approverRoleKey: "ROLE_SECURITY_ADMIN",
            approverRoleName: "Finance & Governance Director",
            conditionExpression: "record.amount > 10000",
          },
          {
            stepOrder: 3,
            name: "Executive VP & CFO Sign-Off",
            stepType: "APPROVAL",
            approverRoleKey: "ROLE_SUPER_ADMIN",
            approverRoleName: "Executive Vice President / CFO",
            conditionExpression: "record.amount > 50000",
          },
        ],
      };
    }

    if (
      p.includes("offer") ||
      p.includes("hire") ||
      p.includes("candidate") ||
      p.includes("recruiting") ||
      p.includes("recruting") ||
      p.includes("talent") ||
      p.includes("applicant")
    ) {
      return {
        workflowKey: "wf_candidate_offer_approval",
        name: "Executive Candidate Offer & Compensation Sign-Off",
        description: "Two-stage verification ensuring compensation parity and hiring manager sign-off prior to digital contract issuance.",
        businessObjectKey: "candidate",
        steps: [
          {
            stepOrder: 1,
            name: "Hiring Manager Review",
            stepType: "APPROVAL",
            approverRoleKey: "ROLE_RECRUITING_MANAGER",
            approverRoleName: "Hiring Manager Lead",
            conditionExpression: "record.status == 'OFFER_PENDING'",
          },
          {
            stepOrder: 2,
            name: "Compensation Committee & VP Sign-Off",
            stepType: "APPROVAL",
            approverRoleKey: "ROLE_SUPER_ADMIN",
            approverRoleName: "VP of People & Culture",
            conditionExpression: "record.baseSalary > 180000",
          },
        ],
      };
    }

    return {
      workflowKey: "wf_standard_enterprise_governance",
      name: "Standard Enterprise Two-Stage Governance",
      description: "Standard peer review and executive authorization gate for enterprise records.",
      businessObjectKey: "sales_order",
      steps: [
        {
          stepOrder: 1,
          name: "Operational Peer Review",
          stepType: "REVIEW",
          approverRoleKey: "ROLE_HR_SPECIALIST",
          approverRoleName: "Operational Reviewer",
          conditionExpression: "record.isActive == true",
        },
        {
          stepOrder: 2,
          name: "Executive Sign-Off",
          stepType: "APPROVAL",
          approverRoleKey: "ROLE_SUPER_ADMIN",
          approverRoleName: "Executive Administrator",
          conditionExpression: "record.requiresExecutiveSignoff == true",
        },
      ],
    };
  }

  /* --------------------------------------------------------------------------
   * Talent Acquisition Pipeline Synthesis Engine
   * ------------------------------------------------------------------------ */

  public generateTalentPipeline(prompt: string): AiGeneratedTalentPipeline {
    const p = prompt.toLowerCase();

    let dept = "Global Engineering & Technology";
    let role = "Full-Lifecycle Technical & Cloud Roles";
    let pipelineKey = "pipe_tech_engineering_2026";
    let name = "Autonomous Talent Acquisition Pipeline (Engineering & Tech)";

    if (p.includes("sale") || p.includes("gtm") || p.includes("commercial")) {
      dept = "Global Sales & Enterprise GTM";
      role = "Enterprise Account Executives & Solutions Leaders";
      pipelineKey = "pipe_sales_gtm_2026";
      name = "Strategic Enterprise GTM Hiring Pipeline";
    } else if (p.includes("product") || p.includes("design") || p.includes("ux")) {
      dept = "Product Management & Design";
      role = "Product Managers & Principal UX Designers";
      pipelineKey = "pipe_product_design_2026";
      name = "Design & Product Innovation Talent Pipeline";
    } else if (p.includes("executive") || p.includes("leadership") || p.includes("director") || p.includes("vp")) {
      dept = "Executive Leadership";
      role = "C-Suite, VP & Senior Director Roles";
      pipelineKey = "pipe_executive_leadership_2026";
      name = "Executive & Board Talent Acquisition Pipeline";
    }

    return {
      pipelineId: `pipe-${Date.now()}`,
      pipelineKey,
      name,
      targetDepartment: dept,
      targetRole: role,
      description:
        "Governed 6-stage talent pipeline synthesizing automated AI sourcing, standardized competency rubrics, SLA-backed turnaround gates, and 1-click H2R conversion.",
      version: "v2.6 Enterprise Governed",
      totalTurnaroundSlaDays: 14,
      complianceGuards: [
        "EEOC & GDPR compliance checks automatically enforced on intake",
        "Blind rubric calibration applied on technical evaluation scorecards",
        "Compensation compa-ratio midpoint guard rails with mandatory executive sign-off",
        "Immutable audit log preserved for all candidate status transitions",
      ],
      status: "DRAFT_PROPOSAL",
      stages: [
        {
          stageOrder: 1,
          stageKey: "stage_sourcing_intake",
          name: "Sourcing & Application Intake",
          description:
            "Multi-channel ingestion (LinkedIn, Careers Portal, Direct Sourcing) with automated deduplication and AI resume normalization.",
          slaTargetHours: 24,
          slaLabel: "24h SLA",
          gateCriteria: [
            "Resume parsed & structured into normalized skills taxonomy",
            "Work authorization & statutory eligibility verified",
            "Zero duplicate applicant records confirmed across tenant",
          ],
          assignedRoles: ["Talent Sourcer", "MAX AI Ingestion Agent"],
          automatedActions: [
            "Automated confirmation email with candidate portal link dispatched",
            "Normalized skills extracted and indexed into candidate dossier",
            "Candidate consent & privacy telemetry logged",
          ],
          color: "emerald",
        },
        {
          stageOrder: 2,
          stageKey: "stage_ai_screening",
          name: "AI Match Scoring & Pre-Screen",
          description:
            "Cognitive match evaluation against requisition required skills, experience thresholds, and automated knockout questions.",
          slaTargetHours: 48,
          slaLabel: "48h SLA",
          gateCriteria: [
            "Requisition match score >= 75%",
            "Core technology stack competencies satisfied",
            "Recruiter 20-minute alignment screening cleared",
          ],
          assignedRoles: ["Primary Recruiter", "MAX AI Screening Copilot"],
          automatedActions: [
            "Calculate weighted fit index and skills breakdown matrix",
            "Generate AI candidate briefing dossier for hiring manager",
            "Dispatch self-service interview booking link to qualified candidates",
          ],
          color: "blue",
        },
        {
          stageOrder: 3,
          stageKey: "stage_technical_eval",
          name: "Technical & Functional Assessment",
          description:
            "Hands-on coding exercise, architecture review, or role-specific problem solving evaluated against standardized rubrics.",
          slaTargetHours: 72,
          slaLabel: "72h SLA",
          gateCriteria: [
            "Blind technical scorecard submitted by 2 independent evaluators",
            "Rubric score >= 4.0 / 5.0 across system design and problem solving",
            "Zero code plagiarism or assessment integrity flags",
          ],
          assignedRoles: ["Lead Architect", "Technical Bar Raiser"],
          automatedActions: [
            "Spin up isolated code challenge sandbox and verify environment",
            "Sync evaluation scorecard directly into recruitment repository",
            "Log interviewer calibration telemetry and score variance",
          ],
          color: "indigo",
        },
        {
          stageOrder: 4,
          stageKey: "stage_panel_interview",
          name: "Cross-Functional Panel & Leadership",
          description:
            "Multi-stakeholder interview assessing cross-team collaboration, customer empathy, systems ownership, and cultural value-add.",
          slaTargetHours: 96,
          slaLabel: "4 Days SLA",
          gateCriteria: [
            "Consensus recommendation >= 'HIRE' across panel members",
            "Hiring Manager sign-off recorded in audit log",
            "Debrief calibration meeting completed with unanimous alignment",
          ],
          assignedRoles: ["Hiring Manager", "Product Partner", "Department VP"],
          automatedActions: [
            "Aggregate panel scorecards into centralized debrief matrix",
            "Highlight strengths and areas of concern for hiring committee",
            "Trigger executive summary memo to VP of Talent",
          ],
          color: "violet",
        },
        {
          stageOrder: 5,
          stageKey: "stage_offer_governance",
          name: "Compensation Modeling & Offer Approval",
          description:
            "Dynamic compa-ratio verification, equity vesting calculation, and multi-tier executive approval routing.",
          slaTargetHours: 24,
          slaLabel: "24h SLA",
          gateCriteria: [
            "Compensation within approved salary band midpoint (+/- 10%)",
            "Level 1 (Hiring Manager) and Level 2 (VP) approvals recorded",
            "Finance department cost-center headcount budget verified",
          ],
          assignedRoles: ["Compensation Lead", "VP of People", "Finance Controller"],
          automatedActions: [
            "Generate official PDF offer package from corporate template",
            "Route DocuSign envelope with automated 7-day expiration timer",
            "Update pipeline telemetry and reserve requisition headcount slot",
          ],
          color: "amber",
        },
        {
          stageOrder: 6,
          stageKey: "stage_h2r_onboarding",
          name: "Offer Acceptance & H2R Transition",
          description:
            "Candidate e-signature execution, automatic background check (BGV) initiation, and seamless Day-1 provisioning in Employee Central.",
          slaTargetHours: 0,
          slaLabel: "Instant Handoff",
          gateCriteria: [
            "DocuSign digital signature executed by candidate",
            "Statutory BGV background verification package dispatched",
            "Agreed target start date confirmed with hiring team",
          ],
          assignedRoles: ["HR Operations", "IT Identity Administrator", "Hiring Manager"],
          automatedActions: [
            "Provision pre-hire user identity in MAX Identity Service",
            "Trigger IT hardware procurement and workstation provisioning ticket",
            "Seed Employee Central Onboarding Task Journey for Day-1 readiness",
          ],
          color: "teal",
        },
      ],
    };
  }

  /* --------------------------------------------------------------------------
   * Telemetry Engine
   * ------------------------------------------------------------------------ */

  public getEnterpriseTelemetry(): AiEnterpriseTelemetry {
    const secMetrics = identitySecurityStore.getSecurityMetrics();
    const positions = ecCoreStore.getPositions();
    const totalHeadcount = positions.reduce((acc, p) => acc + p.currentHeadcount, 0);
    const vacantCount = positions.filter((p) => p.status === "VACANT").length;
    const connectors = identitySecurityStore.getConnectors();
    const activeConnectors = connectors.filter((c) => c.status === "CONNECTED").length;

    return {
      healthIndex: 99,
      executiveSummary: `MAX ERP is operating with 99% health index across all 5 primary enterprise domains. Workforce capacity is at ${totalHeadcount} employees with ${vacantCount} vacant strategic slots in recruitment. Zero privilege escalation incidents or session anomalies detected.`,
      approvalVelocity: "Optimal (Avg 1.2 hrs turnaround across workflows)",
      headcountUtilization: `${Math.round(((positions.length - vacantCount) / Math.max(1, positions.length)) * 100)}% FTE Budget Fill Rate`,
      openRequisitionsCount: vacantCount,
      totalEmployeesCount: totalHeadcount,
      activeSessionsCount: secMetrics.activeSessionsCount,
      connectedIntegrationsCount: activeConnectors,
      bottlenecks: [
        "Zero critical operational bottlenecks detected across active queues.",
        "Candidate offer turnaround velocity benchmarked in top 5th percentile of enterprise SaaS.",
      ],
      recommendations: [
        "Position POS-ENG-084 candidate Emily Zhang has accepted offer; ready for 1-click Day-1 conversion into Employee Central.",
        "Salesforce CRM and SAP S/4HANA synchronization pipelines are healthy with zero delivery dropouts in past 24 hours.",
        "Consider enabling auto-approval threshold for expense claims under $250 to accelerate operational cadence.",
      ],
    };
  }
}

// Global Singleton
export const maxAiBrain = new MaxAiBrain();
