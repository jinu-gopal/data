/**
 * ============================================================================
 * MAX-ERP Universal Enterprise AI Copilot & Autonomous Engine Verification Suite
 * ============================================================================
 *
 * Verifies all 8 core pillars of the MAX AI Enterprise Engine:
 *  1. AI Studio Web Route Availability (/ai)
 *  2. Conversational Intent Processing & Multi-Domain Cognition (/api/ai/chat)
 *  3. Autonomous Action Execution (Leave Approval, Position Freeze, Session Revoke)
 *  4. Dedicated Schema Architect Engine (/api/ai/generate/schema)
 *  5. Dedicated Approval Workflow Generator (/api/ai/generate/workflow)
 *  6. 1-Click Schema Deployment & Metadata Registry (/api/ai/apply-schema)
 *  7. Cross-Enterprise Telemetry & Executive Insights (/api/ai/insights)
 *  8. Universal Global Copilot Integration (⌘J Drawer & Topbar Mount)
 * ============================================================================
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  dim: '\x1b[2m',
};

let passedCount = 0;
let failedCount = 0;

function logPass(title, details) {
  passedCount++;
  console.log(`  ${colors.green}✓ PASS:${colors.reset} ${colors.bright}${title}${colors.reset}`);
  if (details) console.log(`         ${colors.dim}${details}${colors.reset}`);
}

function logFail(title, error) {
  failedCount++;
  console.log(`  ${colors.red}✗ FAIL:${colors.reset} ${colors.bright}${title}${colors.reset}`);
  console.log(`         ${colors.red}${error}${colors.reset}`);
}

async function runTests() {
  console.log(`\n${colors.bright}${colors.cyan}================================================================================`);
  console.log(`MAX-ERP Universal Enterprise AI Copilot Verification Suite`);
  console.log(`Target: ${BASE_URL}`);
  console.log(`================================================================================${colors.reset}\n`);

  // --------------------------------------------------------------------------
  // PILLAR 1: Web Route Availability
  // --------------------------------------------------------------------------
  console.log(`${colors.bright}▶ PILLAR 1: Web Route Availability & Shell Mount${colors.reset}`);
  try {
    const res = await fetch(`${BASE_URL}/ai`);
    if (res.status === 200) {
      logPass("MAX AI Copilot Studio Web Route (/ai)", "Status: 200 OK | Shell Mounted");
    } else {
      logFail("MAX AI Copilot Studio Web Route (/ai)", `Status: ${res.status}`);
    }
  } catch (err) {
    logFail("AI Web Route Check", err.message);
  }

  // --------------------------------------------------------------------------
  // PILLAR 2: Multi-Domain Cognition & Intent Recognition
  // --------------------------------------------------------------------------
  console.log(`\n${colors.bright}▶ PILLAR 2: Multi-Domain Cognition & Intent Recognition (/api/ai/chat)${colors.reset}`);
  try {
    // 2a. Schema Proposal Intent
    const schemaChatRes = await fetch(`${BASE_URL}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: "Design Equipment Maintenance business object for diagnostic machines" }),
    });
    if (schemaChatRes.ok) {
      const data = await schemaChatRes.json();
      if (data.actionType === "PROPOSE_SCHEMA" && data.proposedSchema) {
        logPass("Conversational Schema Synthesis Intent", `Object: "${data.proposedSchema.name}" | Fields: ${data.proposedSchema.fields.length}`);
      } else {
        logFail("Conversational Schema Synthesis Intent", `Unexpected response: ${JSON.stringify(data)}`);
      }
    } else {
      logFail("Conversational Schema Synthesis Intent", `Status: ${schemaChatRes.status}`);
    }

    // 2b. Workflow Proposal Intent
    const wfChatRes = await fetch(`${BASE_URL}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: "Create 3-step procurement approval workflow for expenses over $10,000" }),
    });
    if (wfChatRes.ok) {
      const data = await wfChatRes.json();
      if (data.actionType === "PROPOSE_WORKFLOW" && data.proposedWorkflow) {
        logPass("Conversational Workflow Synthesis Intent", `Workflow: "${data.proposedWorkflow.name}" | Gates: ${data.proposedWorkflow.steps.length}`);
      } else {
        logFail("Conversational Workflow Synthesis Intent", `Unexpected action: ${data.actionType}`);
      }
    } else {
      logFail("Conversational Workflow Synthesis Intent", `Status: ${wfChatRes.status}`);
    }
  } catch (err) {
    logFail("Multi-Domain Cognition Check", err.message);
  }

  // --------------------------------------------------------------------------
  // PILLAR 3: Autonomous Action Execution Engine
  // --------------------------------------------------------------------------
  console.log(`\n${colors.bright}▶ PILLAR 3: Autonomous Action Execution Engine (NLQ -> Execution)${colors.reset}`);
  try {
    // 3a. Autonomous Leave Approval
    const leaveActRes = await fetch(`${BASE_URL}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: "Approve pending statutory leave request for employee" }),
    });
    if (leaveActRes.ok) {
      const data = await leaveActRes.json();
      if (data.actionType === "EXECUTE_ACTION" && data.executedAction?.actionType === "APPROVE_LEAVE") {
        logPass("Autonomous Action: Statutory Leave Approval", `${data.executedAction.summary}`);
      } else {
        logFail("Autonomous Action: Statutory Leave Approval", `Unexpected action: ${JSON.stringify(data.executedAction)}`);
      }
    } else {
      logFail("Autonomous Action: Statutory Leave Approval", `Status: ${leaveActRes.status}`);
    }

    // 3b. Autonomous Position Budget Freeze
    const posActRes = await fetch(`${BASE_URL}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: "Freeze position budget for vacant engineering role" }),
    });
    if (posActRes.ok) {
      const data = await posActRes.json();
      if (data.actionType === "EXECUTE_ACTION" && data.executedAction?.actionType === "FREEZE_POSITION") {
        logPass("Autonomous Action: Position Budget Freeze", `${data.executedAction.summary}`);
      } else {
        logFail("Autonomous Action: Position Budget Freeze", `Unexpected action: ${JSON.stringify(data.executedAction)}`);
      }
    } else {
      logFail("Autonomous Action: Position Budget Freeze", `Status: ${posActRes.status}`);
    }

    // 3c. Autonomous Session Token Revocation
    const sessActRes = await fetch(`${BASE_URL}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: "Terminate stale active session for security compliance" }),
    });
    if (sessActRes.ok) {
      const data = await sessActRes.json();
      if (data.actionType === "EXECUTE_ACTION" && data.executedAction?.actionType === "TERMINATE_SESSION") {
        logPass("Autonomous Action: Forceful Session Revocation", `${data.executedAction.summary}`);
      } else {
        logFail("Autonomous Action: Forceful Session Revocation", `Unexpected action: ${JSON.stringify(data.executedAction)}`);
      }
    } else {
      logFail("Autonomous Action: Forceful Session Revocation", `Status: ${sessActRes.status}`);
    }

    // 3d. Autonomous RBAC Permission Grant
    const rbacActRes = await fetch(`${BASE_URL}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: "Grant recruitment publish permission to recruiting lead role" }),
    });
    if (rbacActRes.ok) {
      const data = await rbacActRes.json();
      if (data.actionType === "EXECUTE_ACTION" && data.executedAction?.actionType === "GRANT_PERMISSION") {
        logPass("Autonomous Action: Dynamic RBAC Entitlement Grant", `${data.executedAction.summary}`);
      } else {
        logFail("Autonomous Action: Dynamic RBAC Entitlement Grant", `Unexpected action: ${JSON.stringify(data.executedAction)}`);
      }
    } else {
      logFail("Autonomous Action: Dynamic RBAC Entitlement Grant", `Status: ${rbacActRes.status}`);
    }

    // 3e. Autonomous Webhook Ping Dispatch
    const whActRes = await fetch(`${BASE_URL}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: "Ping webhook for security alerts" }),
    });
    if (whActRes.ok) {
      const data = await whActRes.json();
      if (data.actionType === "EXECUTE_ACTION" && data.executedAction?.actionType === "PING_WEBHOOK") {
        logPass("Autonomous Action: Live Webhook Ping Dispatch", `${data.executedAction.summary}`);
      } else {
        logFail("Autonomous Action: Live Webhook Ping Dispatch", `Unexpected action: ${JSON.stringify(data.executedAction)}`);
      }
    } else {
      logFail("Autonomous Action: Live Webhook Ping Dispatch", `Status: ${whActRes.status}`);
    }
  } catch (err) {
    logFail("Autonomous Action Execution Check", err.message);
  }

  // --------------------------------------------------------------------------
  // PILLAR 4: Dedicated Schema Architect Engine
  // --------------------------------------------------------------------------
  console.log(`\n${colors.bright}▶ PILLAR 4: Dedicated Schema Architect Engine (/api/ai/generate/schema)${colors.reset}`);
  try {
    const res = await fetch(`${BASE_URL}/api/ai/generate/schema`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: "Vendor Performance Evaluation with SLA scores, contract value, ISO certifications" }),
    });
    if (res.ok) {
      const schema = await res.json();
      if (schema.objectKey === "vendor_evaluation" && schema.fields.length >= 8) {
        logPass("Schema Architecture & Type Normalization", `Synthesized: "${schema.name}" | Key: ${schema.objectKey} | ${schema.fields.length} typed fields`);
      } else {
        logFail("Schema Architecture & Type Normalization", `Invalid schema output: ${JSON.stringify(schema)}`);
      }
    } else {
      logFail("Schema Architecture API", `Status: ${res.status}`);
    }
  } catch (err) {
    logFail("Schema Architect Check", err.message);
  }

  // --------------------------------------------------------------------------
  // PILLAR 5: Dedicated Approval Workflow Generator
  // --------------------------------------------------------------------------
  console.log(`\n${colors.bright}▶ PILLAR 5: Dedicated Approval Workflow Generator (/api/ai/generate/workflow)${colors.reset}`);
  try {
    const res = await fetch(`${BASE_URL}/api/ai/generate/workflow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: "Procurement approval: manager up to $10k, director up to $50k, VP above $50k",
        businessObjectKey: "customer",
      }),
    });
    if (res.ok) {
      const wf = await res.json();
      if (wf.steps && wf.steps.length === 3) {
        logPass("Sequential Multi-Tier Governance Synthesis", `Pipeline: "${wf.name}" | 3 Gates (${wf.steps.map((s) => s.name).join(' → ')})`);
      } else {
        logFail("Sequential Multi-Tier Governance Synthesis", `Steps count mismatch: ${wf.steps?.length}`);
      }
    } else {
      logFail("Workflow Generator API", `Status: ${res.status}`);
    }
  } catch (err) {
    logFail("Workflow Generator Check", err.message);
  }

  // --------------------------------------------------------------------------
  // PILLAR 6: 1-Click Schema Deployment & Metadata Registry
  // --------------------------------------------------------------------------
  console.log(`\n${colors.bright}▶ PILLAR 6: 1-Click Schema Deployment & Metadata Registry (/api/ai/apply-schema)${colors.reset}`);
  try {
    const testBoKey = `ai_clinical_trial_${Date.now().toString().slice(-4)}`;
    const deployRes = await fetch(`${BASE_URL}/api/ai/apply-schema`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        objectKey: testBoKey,
        name: "Clinical Trial Protocol",
        description: "Regulated clinical study protocol with patient cohorts and FDA phase milestone gates.",
        fields: [
          { fieldKey: "protocolId", label: "Protocol ID", fieldType: "TEXT", required: true, displayOrder: 1 },
          { fieldKey: "trialPhase", label: "FDA Study Phase", fieldType: "CHOICE", required: true, displayOrder: 2, choiceOptions: ["PHASE_1", "PHASE_2", "PHASE_3"] },
          { fieldKey: "patientCohortSize", label: "Cohort Target Count", fieldType: "NUMBER", required: true, displayOrder: 3 },
          { fieldKey: "budgetAllocated", label: "Phase Budget USD", fieldType: "CURRENCY", required: true, displayOrder: 4 },
        ],
      }),
    });

    if (deployRes.ok) {
      const result = await deployRes.json();
      if (result.success && result.fieldsCreated === 4) {
        logPass("1-Click AI Schema Catalog Registration", `Provisioned Business Object "${result.businessObject.name}" with ${result.fieldsCreated} validated fields`);
      } else {
        logFail("1-Click AI Schema Catalog Registration", `Unexpected result: ${JSON.stringify(result)}`);
      }
    } else {
      logFail("1-Click AI Schema Catalog Registration", `Status: ${deployRes.status}`);
    }
  } catch (err) {
    logFail("Schema Deployment Check", err.message);
  }

  // --------------------------------------------------------------------------
  // PILLAR 7: Cross-Enterprise Telemetry & Executive Insights
  // --------------------------------------------------------------------------
  console.log(`\n${colors.bright}▶ PILLAR 7: Cross-Enterprise Telemetry & Executive Insights (/api/ai/insights)${colors.reset}`);
  try {
    const res = await fetch(`${BASE_URL}/api/ai/insights`);
    if (res.ok) {
      const insights = await res.json();
      if (typeof insights.healthIndex === 'number' && insights.healthIndex >= 90) {
        logPass("Real-Time Cross-Store Telemetry Synthesis", `Health: ${insights.healthIndex}% | Headcount: ${insights.totalEmployeesCount} Staff | Active Integrations: ${insights.connectedIntegrationsCount}`);
        logPass("Autonomous Executive Strategic Recommendations", `Recommendations: ${insights.recommendations.length} insights delivered`);
      } else {
        logFail("Real-Time Cross-Store Telemetry Synthesis", `Invalid health index: ${insights.healthIndex}`);
      }
    } else {
      logFail("AI Insights API", `Status: ${res.status}`);
    }
  } catch (err) {
    logFail("Telemetry Insights Check", err.message);
  }

  // --------------------------------------------------------------------------
  // PILLAR 8: Universal Global Copilot Integration
  // --------------------------------------------------------------------------
  console.log(`\n${colors.bright}▶ PILLAR 8: Universal Global Copilot Integration (⌘J Drawer Mount)${colors.reset}`);
  try {
    const fs = require('fs');
    const path = require('path');
    const topbarContent = fs.readFileSync(path.join(__dirname, '../../frontend/components/max/MaxTopbar.tsx'), 'utf8');

    const hasCopilotDrawer = topbarContent.includes('MaxAiCopilotDrawer');
    const hasShortcut = topbarContent.includes('metaKey || e.ctrlKey') && topbarContent.includes('"j"');
    const hasPillButton = topbarContent.includes('Ask MAX AI');

    if (hasCopilotDrawer && hasShortcut && hasPillButton) {
      logPass("Global ⌘J Keyboard Shortcut & Copilot Mount", "MaxTopbar successfully wired with Ask MAX AI trigger pill, Cmd+J listener, and Copilot Drawer.");
    } else {
      logFail("Global ⌘J Keyboard Shortcut & Copilot Mount", `Missing: drawer=${hasCopilotDrawer}, shortcut=${hasShortcut}, pill=${hasPillButton}`);
    }
  } catch (err) {
    logFail("Universal Copilot Mount Check", err.message);
  }

  // --------------------------------------------------------------------------
  // Summary
  // --------------------------------------------------------------------------
  console.log(`\n${colors.bright}================================================================================`);
  console.log(`MAX-ERP UNIVERSAL AI COPILOT TEST SUMMARY`);
  console.log(`================================================================================${colors.reset}`);
  console.log(`  Total Checks Executed : ${passedCount + failedCount}`);
  console.log(`  Passed Checks         : ${colors.green}${passedCount}${colors.reset}`);
  console.log(`  Failed Checks         : ${failedCount === 0 ? colors.green + '0' : colors.red + failedCount}${colors.reset}`);
  console.log(`  Health Status         : ${failedCount === 0 ? colors.bright + colors.green + '100% HEALTHY & READY FOR ENTERPRISE DEPLOYMENT' : colors.red + 'FAILURES DETECTED'}${colors.reset}`);
  console.log(`${colors.bright}================================================================================${colors.reset}\n`);

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTests();
