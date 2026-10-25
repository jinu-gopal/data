/**
 * ============================================================================
 * MAX-ERP Universal Voice Command & Multimodal AI Verification Suite
 * ============================================================================
 *
 * Verifies all 8 core capabilities of the MAX Voice Command & Speech Engine:
 *  1. Voice API Route Availability (/api/ai/voice)
 *  2. Cross-Module Spoken Navigation Routing (Recruiting, Workforce, Positions, Governance)
 *  3. Spoken Candidate Comparison & Talent Synthesis
 *  4. Voice-Driven Candidate Stage Progression
 *  5. Spoken Autonomous Action Execution (Leave Approval, Position Control, Token Revocation)
 *  6. Spoken Schema & Workflow Architecture Synthesis
 *  7. Spoken Executive Telemetry & Operational Health Inquiries
 *  8. TTS Executive Speech Synthesis Payload Formulation (Audio parameters, clean text)
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

async function runVoiceTests() {
  console.log(`\n${colors.bright}${colors.cyan}================================================================================`);
  console.log(`MAX-ERP Universal Voice Command & AI Engine Verification Suite`);
  console.log(`Target: ${BASE_URL}`);
  console.log(`================================================================================${colors.reset}\n`);

  // --------------------------------------------------------------------------
  // SECTION 1: Voice API Route Availability
  // --------------------------------------------------------------------------
  console.log(`${colors.bright}▶ SECTION 1: Voice API Route Availability (/api/ai/voice)${colors.reset}`);
  try {
    const res = await fetch(`${BASE_URL}/api/ai/voice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript: 'ping' }),
    });
    if (res.status === 200) {
      const data = await res.json();
      if (data.success) {
        logPass('Voice Engine Endpoint (/api/ai/voice)', `Status: 200 OK | Response: "${data.spokenResponse.slice(0, 45)}..."`);
      } else {
        logFail('Voice Engine Endpoint (/api/ai/voice)', 'success was false');
      }
    } else {
      logFail('Voice Engine Endpoint (/api/ai/voice)', `HTTP ${res.status}`);
    }
  } catch (err) {
    logFail('Voice API Endpoint Check', err.message);
  }

  // --------------------------------------------------------------------------
  // SECTION 2: Cross-Module Spoken Navigation Routing
  // --------------------------------------------------------------------------
  console.log(`\n${colors.bright}▶ SECTION 2: Cross-Module Spoken Navigation Routing${colors.reset}`);
  const navCommands = [
    { voice: 'navigate to recruitment requisitions', target: '/recruitment', name: 'Recruiting Studio' },
    { voice: 'open candidate applications pipeline', target: '/recruitment/candidates', name: 'Candidate Pipeline' },
    { voice: 'show careers job portal', target: '/careers', name: 'Career Site' },
    { voice: 'go to workforce management', target: '/workforce', name: 'Workforce Central' },
    { voice: 'open position hierarchy org chart', target: '/workforce?tab=positions', name: 'Position Control' },
    { voice: 'open time off leaves engine', target: '/workforce?tab=timeoff', name: 'Time Off Wallets' },
    { voice: 'navigate to security audit studio', target: '/security', name: 'Governance & Security' },
    { voice: 'open enterprise user directory and rbac', target: '/users', name: 'User Directory' },
    { voice: 'open integration hub webhooks', target: '/integrations', name: 'Integration Hub' },
    { voice: 'go to business objects schema builder', target: '/configuration/business-objects', name: 'Business Objects' },
    { voice: 'open max ai copilot studio', target: '/ai', name: 'AI Studio' },
  ];

  for (const cmd of navCommands) {
    try {
      const res = await fetch(`${BASE_URL}/api/ai/voice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: cmd.voice }),
      });
      const data = await res.json();
      if (data.intent === 'NAVIGATE' && data.targetUrl === cmd.target) {
        logPass(`Spoken Nav: "${cmd.voice}"`, `Routed -> ${cmd.target} (${cmd.name})`);
      } else {
        logFail(`Spoken Nav: "${cmd.voice}"`, `Got intent=${data.intent}, target=${data.targetUrl}`);
      }
    } catch (err) {
      logFail(`Spoken Nav: "${cmd.voice}"`, err.message);
    }
  }

  // --------------------------------------------------------------------------
  // SECTION 3: Spoken Candidate Comparison & Talent Synthesis
  // --------------------------------------------------------------------------
  console.log(`\n${colors.bright}▶ SECTION 3: Spoken Candidate Comparison & Talent Synthesis${colors.reset}`);
  try {
    const res = await fetch(`${BASE_URL}/api/ai/voice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript: 'compare Priya with other candidates for this job' }),
    });
    const data = await res.json();
    if (data.intent === 'SYNTHESIZE' && data.targetUrl?.includes('tab=comparison') && data.spokenResponse.includes('Priya Menon')) {
      logPass('Spoken Comparison: Priya Menon', `Intent: SYNTHESIZE | Target: ${data.targetUrl}`);
    } else {
      logFail('Spoken Comparison: Priya Menon', JSON.stringify(data));
    }
  } catch (err) {
    logFail('Spoken Comparison: Priya Menon', err.message);
  }

  try {
    const res = await fetch(`${BASE_URL}/api/ai/voice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript: 'compare Emily with other applicants' }),
    });
    const data = await res.json();
    if (data.intent === 'SYNTHESIZE' && data.spokenResponse.includes('Emily Zhang')) {
      logPass('Spoken Comparison: Emily Zhang', `Audio Response: "${data.spokenResponse.slice(0, 60)}..."`);
    } else {
      logFail('Spoken Comparison: Emily Zhang', JSON.stringify(data));
    }
  } catch (err) {
    logFail('Spoken Comparison: Emily Zhang', err.message);
  }

  // --------------------------------------------------------------------------
  // SECTION 4: Voice-Driven Candidate Stage Progression
  // --------------------------------------------------------------------------
  console.log(`\n${colors.bright}▶ SECTION 4: Voice-Driven Candidate Stage Progression${colors.reset}`);
  try {
    const res = await fetch(`${BASE_URL}/api/ai/voice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript: 'shortlist candidate for senior role' }),
    });
    const data = await res.json();
    if (data.intent === 'EXECUTE_ACTION' && data.actionType === 'MOVE_CANDIDATE_STAGE') {
      logPass('Spoken Stage Move: Shortlist', `ActionType: ${data.actionType} | Audio: "${data.spokenResponse}"`);
    } else {
      logFail('Spoken Stage Move: Shortlist', JSON.stringify(data));
    }
  } catch (err) {
    logFail('Spoken Stage Move: Shortlist', err.message);
  }

  try {
    const res = await fetch(`${BASE_URL}/api/ai/voice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript: 'move to interview stage' }),
    });
    const data = await res.json();
    if (data.intent === 'EXECUTE_ACTION' && data.spokenResponse.includes('Interview')) {
      logPass('Spoken Stage Move: Interview', `Audio: "${data.spokenResponse}"`);
    } else {
      logFail('Spoken Stage Move: Interview', JSON.stringify(data));
    }
  } catch (err) {
    logFail('Spoken Stage Move: Interview', err.message);
  }

  // --------------------------------------------------------------------------
  // SECTION 5: Spoken Autonomous Action Execution
  // --------------------------------------------------------------------------
  console.log(`\n${colors.bright}▶ SECTION 5: Spoken Autonomous Action Execution${colors.reset}`);
  
  // A: Leave Request Approval via Voice
  try {
    const res = await fetch(`${BASE_URL}/api/ai/voice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript: 'approve leave request for Alex Morgan' }),
    });
    const data = await res.json();
    if (data.intent === 'EXECUTE_ACTION' && data.actionType === 'APPROVE_LEAVE' && data.executedAction?.success) {
      logPass('Autonomous Voice Action: Leave Approval', `ActionId: ${data.executedAction.actionId} | Entity: ${data.executedAction.entityName}`);
    } else {
      logFail('Autonomous Voice Action: Leave Approval', JSON.stringify(data));
    }
  } catch (err) {
    logFail('Autonomous Voice Action: Leave Approval', err.message);
  }

  // B: Position Freeze via Voice
  try {
    const res = await fetch(`${BASE_URL}/api/ai/voice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript: 'freeze position POS-2026-ENG-001' }),
    });
    const data = await res.json();
    if (data.intent === 'EXECUTE_ACTION' && data.actionType === 'FREEZE_POSITION' && data.executedAction?.success) {
      logPass('Autonomous Voice Action: Freeze Position', `Position: ${data.executedAction.entityName} | DeepLink: ${data.executedAction.deepLink}`);
    } else {
      logFail('Autonomous Voice Action: Freeze Position', JSON.stringify(data));
    }
  } catch (err) {
    logFail('Autonomous Voice Action: Freeze Position', err.message);
  }

  // C: Session Revocation via Voice
  try {
    const res = await fetch(`${BASE_URL}/api/ai/voice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript: 'revoke session token for suspicious user' }),
    });
    const data = await res.json();
    if (data.intent === 'EXECUTE_ACTION' && (data.actionType === 'TERMINATE_SESSION' || data.actionType === 'REVOKE_SESSION') && data.executedAction?.success) {
      logPass('Autonomous Voice Action: Revoke Session', `Summary: ${data.executedAction.summary}`);
    } else {
      logFail('Autonomous Voice Action: Revoke Session', JSON.stringify(data));
    }
  } catch (err) {
    logFail('Autonomous Voice Action: Revoke Session', err.message);
  }

  // D: Entitlement Grant via Voice
  try {
    const res = await fetch(`${BASE_URL}/api/ai/voice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript: 'grant audit auditor permissions to security team' }),
    });
    const data = await res.json();
    if (data.intent === 'EXECUTE_ACTION' && (data.actionType === 'GRANT_PERMISSION' || data.actionType === 'GRANT_ENTITLEMENT') && data.executedAction?.success) {
      logPass('Autonomous Voice Action: Grant Entitlement', `Summary: ${data.executedAction.summary}`);
    } else {
      logFail('Autonomous Voice Action: Grant Entitlement', JSON.stringify(data));
    }
  } catch (err) {
    logFail('Autonomous Voice Action: Grant Entitlement', err.message);
  }

  // E: Webhook Ping via Voice
  try {
    const res = await fetch(`${BASE_URL}/api/ai/voice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript: 'test webhook integration' }),
    });
    const data = await res.json();
    if (data.intent === 'EXECUTE_ACTION' && (data.actionType === 'PING_WEBHOOK' || data.actionType === 'TEST_WEBHOOK') && data.executedAction?.success) {
      logPass('Autonomous Voice Action: Webhook Ping', `Summary: ${data.executedAction.summary}`);
    } else {
      logFail('Autonomous Voice Action: Webhook Ping', JSON.stringify(data));
    }
  } catch (err) {
    logFail('Autonomous Voice Action: Webhook Ping', err.message);
  }

  // --------------------------------------------------------------------------
  // SECTION 6: Spoken Schema & Workflow Architecture Synthesis
  // --------------------------------------------------------------------------
  console.log(`\n${colors.bright}▶ SECTION 6: Spoken Schema & Workflow Synthesis${colors.reset}`);
  try {
    const res = await fetch(`${BASE_URL}/api/ai/voice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript: 'create a business object schema for VendorContract' }),
    });
    const data = await res.json();
    if (data.intent === 'SYNTHESIZE' && data.actionType === 'PROPOSE_SCHEMA') {
      logPass('Spoken Schema Architecture', `Target: ${data.targetUrl} | Spoken: "${data.spokenResponse.slice(0, 55)}..."`);
    } else {
      logFail('Spoken Schema Architecture', JSON.stringify(data));
    }
  } catch (err) {
    logFail('Spoken Schema Architecture', err.message);
  }

  try {
    const res = await fetch(`${BASE_URL}/api/ai/voice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript: 'design approval workflow for CapexApproval' }),
    });
    const data = await res.json();
    if (data.intent === 'SYNTHESIZE' && data.actionType === 'PROPOSE_WORKFLOW') {
      logPass('Spoken Workflow Architecture', `Target: ${data.targetUrl} | Spoken: "${data.spokenResponse.slice(0, 55)}..."`);
    } else {
      logFail('Spoken Workflow Architecture', JSON.stringify(data));
    }
  } catch (err) {
    logFail('Spoken Workflow Architecture', err.message);
  }

  // --------------------------------------------------------------------------
  // SECTION 7: Spoken Executive Telemetry
  // --------------------------------------------------------------------------
  console.log(`\n${colors.bright}▶ SECTION 7: Spoken Executive Telemetry & Inquiries${colors.reset}`);
  try {
    const res = await fetch(`${BASE_URL}/api/ai/voice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript: 'what is the enterprise workforce capacity and system health' }),
    });
    const data = await res.json();
    if (data.intent === 'QUERY' && data.spokenResponse.includes('health index')) {
      logPass('Spoken Executive Telemetry', `Audio: "${data.spokenResponse}"`);
    } else {
      logFail('Spoken Executive Telemetry', JSON.stringify(data));
    }
  } catch (err) {
    logFail('Spoken Executive Telemetry', err.message);
  }

  // --------------------------------------------------------------------------
  // SECTION 8: TTS Audio Synthesis Payload Formulation
  // --------------------------------------------------------------------------
  console.log(`\n${colors.bright}▶ SECTION 8: TTS Audio Synthesis Payload Formulation${colors.reset}`);
  try {
    const res = await fetch(`${BASE_URL}/api/ai/voice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript: 'what can you do' }),
    });
    const data = await res.json();
    const tts = data.ttsPayload;
    if (tts && tts.text && tts.rate === 1.05 && tts.pitch === 1.0 && tts.lang === 'en-US') {
      // Ensure no markdown characters leaked into TTS text
      const hasMarkdown = /[*_#`~[\]()]/.test(tts.text);
      if (!hasMarkdown) {
        logPass('TTS Formulation & Markdown Cleanliness', `Rate: ${tts.rate} | Pitch: ${tts.pitch} | Clean Text: "${tts.text.slice(0, 50)}..."`);
      } else {
        logFail('TTS Formulation', `Markdown characters found in TTS audio text: "${tts.text}"`);
      }
    } else {
      logFail('TTS Formulation', JSON.stringify(tts));
    }
  } catch (err) {
    logFail('TTS Formulation', err.message);
  }

  // --------------------------------------------------------------------------
  // Final Scorecard
  // --------------------------------------------------------------------------
  console.log(`\n${colors.bright}${colors.cyan}================================================================================`);
  console.log(`MAX-ERP Universal Voice Command & AI Engine Verification Scorecard`);
  console.log(`Total Passed: ${colors.green}${passedCount}${colors.cyan} | Total Failed: ${failedCount === 0 ? colors.green + '0' : colors.red + failedCount}${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}================================================================================${colors.reset}\n`);

  if (failedCount > 0) {
    process.exit(1);
  }
}

runVoiceTests();
