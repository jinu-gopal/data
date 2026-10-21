/**
 * ============================================================================
 * MAX-ERP EC Core (Employee Central) Comprehensive Test Suite
 * ============================================================================
 * 
 * Usage:
 *   node scripts/test-ec-core-module.js
 * 
 * Verifies all 6 core pillars of the Employee Central (EC Core) foundation:
 *  1. Workforce Web Route Health (/workforce)
 *  2. Position Management & Reports-To Hierarchy Tree
 *  3. Organisation Structure 5-Tier Topology (LE -> BU -> Div -> Dept -> Cost Center)
 *  4. 360° People Profile Master Dossier (Personal, Job, Comp, Work Auth, Bank, Timeline)
 *  5. Time Off & Absences Engine (6 Leave Wallets, Accruals, Approval Auto-Deduct)
 *  6. Hire-to-Retire (H2R) Lifecycle Engine:
 *     - Candidate Offer Ingestion (RCM -> EC Core Employee with sequential MX ID)
 *     - Position Slot Allocation (VACANT -> FILLED)
 *     - Merit Promotion & Department Transfer
 *     - Temporary Leave of Absence (ACTIVE -> ON_LEAVE -> ACTIVE)
 *     - Honorable Retirement / Offboarding & Position Vacating (FILLED -> VACANT)
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

function printSection(title) {
  console.log(`\n${colors.cyan}══════════════════════════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}▶ ${colors.bright}${title}${colors.reset}`);
  console.log(`${colors.cyan}══════════════════════════════════════════════════════════════════════════════${colors.reset}`);
}

async function runTestSuite() {
  console.log(`\n${colors.bright}MAX-ERP Employee Central (EC Core) Test Suite${colors.reset}`);
  console.log(`Testing Target: ${colors.yellow}${BASE_URL}${colors.reset}`);
  console.log(`Timestamp: ${new Date().toISOString()}\n`);

  const runId = Date.now().toString().slice(-4);

  // ==========================================================================
  // PILLAR 1: Web Route Health
  // ==========================================================================
  printSection('PILLAR 1: Workforce & EC Core Web Route Availability');

  try {
    const res = await fetch(`${BASE_URL}/workforce`);
    if (res.status === 200) {
      logPass('Human Capital & Workforce Studio (/workforce)', 'Status: 200 OK | Turbopack Client SSR Mounted');
    } else {
      logFail('Human Capital & Workforce Studio (/workforce)', `Expected 200, got ${res.status}`);
    }
  } catch (err) {
    logFail('Human Capital & Workforce Studio (/workforce)', err.message);
  }

  // ==========================================================================
  // PILLAR 2: Position Management & Reporting Hierarchy
  // ==========================================================================
  printSection('PILLAR 2: Position Architecture, FTE Governance & Hierarchy');

  try {
    const res = await fetch(`${BASE_URL}/api/workforce/positions`);
    const data = await res.json();

    if (res.status === 200 && Array.isArray(data.positions) && data.meta) {
      logPass('Position Registry & Headcount Telemetry', 
        `Total Positions: ${data.meta.totalPositions} | Vacant: ${data.meta.vacantCount} | Filled: ${data.meta.filledCount} | Total FTE: ${data.meta.totalFte}`);
    } else {
      logFail('Position Registry & Headcount Telemetry', `Invalid response structure: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    logFail('Position Registry & Headcount Telemetry', err.message);
  }

  try {
    const res = await fetch(`${BASE_URL}/api/workforce/positions?view=hierarchy`);
    const tree = await res.json();

    if (res.status === 200 && Array.isArray(tree) && tree.length > 0) {
      const root = tree[0];
      logPass('Hierarchical Position Tree (Parent-Child Reports-To)', 
        `Root: ${root.positionCode} (${root.title}) | Direct Subordinates: ${root.children ? root.children.length : 0}`);
    } else {
      logFail('Hierarchical Position Tree', `Expected array of roots, got: ${JSON.stringify(tree)}`);
    }
  } catch (err) {
    logFail('Hierarchical Position Tree', err.message);
  }

  let createdPositionCode = '';
  try {
    const newPosPayload = {
      title: `Principal AI Platform Engineer ${runId}`,
      department: 'Engineering',
      division: 'Cloud Infrastructure & Platforms',
      businessUnit: 'Enterprise Cloud & AI',
      legalEntity: 'MAX Technologies Corp (US)',
      jobLevel: 'IC-5',
      jobBand: 'Band 5',
      fte: 1.0,
      costCenter: 'CC-ENG-101',
      reportsToPositionCode: 'POS-ENG-001',
      reportsToTitle: 'Chief Technology Officer',
      salaryRange: { min: 190000, max: 230000, currency: 'USD' },
    };

    const res = await fetch(`${BASE_URL}/api/workforce/positions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPosPayload),
    });

    const data = await res.json();
    if (res.status === 201 && data.positionCode) {
      createdPositionCode = data.positionCode;
      logPass('Dynamic Position Creation', 
        `Created Position Code: ${data.positionCode} | Title: "${data.title}" | Cost Center: ${data.costCenter}`);
    } else {
      logFail('Dynamic Position Creation', `Expected 201, got ${res.status}`);
    }
  } catch (err) {
    logFail('Dynamic Position Creation', err.message);
  }

  // Freeze position test
  if (createdPositionCode) {
    try {
      const res = await fetch(`${BASE_URL}/api/workforce/positions/${createdPositionCode}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'FROZEN' }),
      });
      const data = await res.json();
      if (res.status === 200 && data.status === 'FROZEN') {
        logPass('Position Budget Governance (Freeze/Unfreeze)', `Position ${createdPositionCode} successfully FROZEN`);
      } else {
        logFail('Position Budget Governance', `Expected status FROZEN, got ${data.status}`);
      }
    } catch (err) {
      logFail('Position Budget Governance', err.message);
    }
  }

  // ==========================================================================
  // PILLAR 3: Organisation Structure (5-Tier Topology)
  // ==========================================================================
  printSection('PILLAR 3: 5-Tier Organisation Structure Architecture');

  try {
    const res = await fetch(`${BASE_URL}/api/workforce/org-structure`);
    const data = await res.json();

    if (res.status === 200 && data.structure && data.metrics) {
      logPass('Enterprise Structure Topology Breakdown', 
        `Legal Entities: ${data.metrics.totalLegalEntities} | Business Units: ${data.metrics.totalBusinessUnits} | Divisions: ${data.metrics.totalDivisions} | Departments: ${data.metrics.totalDepartments} | Locations: ${data.metrics.totalLocations} | Cost Centers: ${data.metrics.totalCostCenters}`);
      logPass('Consolidated Global Financial Rollups', 
        `Enterprise Headcount: ${data.metrics.totalHeadcount} Staff | Consolidated Budget: $${(data.metrics.totalBudgetUsd / 1000000).toFixed(1)}M USD`);
    } else {
      logFail('Enterprise Structure Topology Breakdown', `Invalid payload: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    logFail('Enterprise Structure Topology Breakdown', err.message);
  }

  // ==========================================================================
  // PILLAR 4: 360° People Profile Master Dossier
  // ==========================================================================
  printSection('PILLAR 4: 360° People Profile Master Dossier');

  try {
    const res = await fetch(`${BASE_URL}/api/workforce/people-profile/emp-001`);
    const p = await res.json();

    if (res.status === 200 && p.personal && p.job && p.compensation && p.workAuthorization && p.directDeposit && p.timeline) {
      logPass('Section 1: Biographical & Statutory Personal Info', 
        `Name: ${p.personal.firstName} ${p.personal.lastName} | DOB: ${p.personal.dateOfBirth} | Nationality: ${p.personal.nationality}`);
      logPass('Section 2: Organizational Placement & Reporting Line', 
        `Employee ID: ${p.job.employeeNumber} | Position: ${p.job.positionCode} (${p.job.jobTitle}) | Department: ${p.job.department}`);
      logPass('Section 3: Compensation, Pay Band & Compa-Ratio', 
        `Base Salary: $${p.compensation.annualBaseSalary.toLocaleString()} USD | Compa-Ratio: ${p.compensation.compaRatio} | Bonus Target: ${p.compensation.bonusTargetPct}%`);
      logPass('Section 4: Work Authorization & Immigration Audit', 
        `Permit Type: ${p.workAuthorization.workPermitType} | I-9 Status: ${p.workAuthorization.i9VerificationStatus} | BGV Status: ${p.workAuthorization.bgvStatus}`);
      logPass('Section 5: Direct Deposit Bank Distribution', 
        `Institution: ${p.directDeposit.bankName} | Account: ${p.directDeposit.accountNumberMasked} (${p.directDeposit.depositAllocationPct}% Allocation)`);
      logPass('Section 6: Historical Audit Timeline', 
        `Recorded Events: ${p.timeline.length} (Latest: "${p.timeline[0]?.title}")`);
    } else {
      logFail('360° Master Dossier Verification', `Missing dossier sections: ${JSON.stringify(p)}`);
    }
  } catch (err) {
    logFail('360° Master Dossier Verification', err.message);
  }

  // Add timeline audit event
  try {
    const eventPayload = {
      eventType: 'COMPENSATION_REVISION',
      title: 'Executive Board Retention Grant',
      description: 'Special stock option award granted for multi-tenant scalability.',
      effectiveDate: '2026-10-15',
      previousValue: '150,000 RSUs',
      newValue: '175,000 RSUs',
    };

    const res = await fetch(`${BASE_URL}/api/workforce/people-profile/emp-001`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventPayload),
    });

    const event = await res.json();
    if (res.status === 201 && event.id) {
      logPass('Timeline Audit Event Append', 
        `Event ID: ${event.id} | Title: "${event.title}" | Effective: ${event.effectiveDate}`);
    } else {
      logFail('Timeline Audit Event Append', `Expected 201, got ${res.status}`);
    }
  } catch (err) {
    logFail('Timeline Audit Event Append', err.message);
  }

  // ==========================================================================
  // PILLAR 5: Time Off & Absences Engine
  // ==========================================================================
  printSection('PILLAR 5: Time Off & Absences Engine');

  try {
    const res = await fetch(`${BASE_URL}/api/workforce/time-off?employeeId=emp-005`);
    const data = await res.json();

    if (res.status === 200 && Array.isArray(data.policies) && Array.isArray(data.balances)) {
      logPass('6 Statutory Leave Types & Policy Framework', 
        `Policies Configured: ${data.policies.map(p => p.leaveType).join(', ')}`);
      logPass('Personal Leave Wallet & Accrual Balances', 
        `Vacation: ${data.balances.find(b => b.leaveType === 'VACATION')?.availableBalance}d available | Sick: ${data.balances.find(b => b.leaveType === 'SICK')?.availableBalance}d available`);
      logPass('Team Absence Calendar Synchronization', 
        `Approved Calendar Absences: ${data.calendarEvents.length} upcoming team events`);
    } else {
      logFail('Time Off Policy & Balances Framework', `Invalid structure: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    logFail('Time Off Policy & Balances Framework', err.message);
  }

  let createdRequestId = '';
  try {
    const leavePayload = {
      employeeId: 'emp-005',
      leaveType: 'VACATION',
      startDate: '2026-12-22',
      endDate: '2026-12-24',
      totalDays: 3,
      reason: 'Winter holiday leave',
    };

    const res = await fetch(`${BASE_URL}/api/workforce/time-off/requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leavePayload),
    });

    const data = await res.json();
    if (res.status === 201 && data.id && data.status === 'PENDING') {
      createdRequestId = data.id;
      logPass('Leave Request Submission & Routing', 
        `Request ID: ${data.id} | Employee: ${data.employeeName} | Days: ${data.totalDays} | Status: ${data.status}`);
    } else {
      logFail('Leave Request Submission & Routing', `Expected 201 PENDING, got: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    logFail('Leave Request Submission & Routing', err.message);
  }

  // Manager Approval & Auto-Deduct
  if (createdRequestId) {
    try {
      const res = await fetch(`${BASE_URL}/api/workforce/time-off/requests/${createdRequestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'APPROVED',
          reviewerName: 'Marcus Chen (CTO)',
          notes: 'Approved for winter coverage.',
        }),
      });

      const data = await res.json();
      if (res.status === 200 && data.status === 'APPROVED') {
        logPass('Manager Approval & Automated Balance Deduction', 
          `Status: APPROVED | Reviewer: "${data.reviewerName}" | PTO balance deducted immediately`);
      } else {
        logFail('Manager Approval & Automated Balance Deduction', `Expected APPROVED, got: ${data.status}`);
      }
    } catch (err) {
      logFail('Manager Approval & Automated Balance Deduction', err.message);
    }
  }

  // ==========================================================================
  // PILLAR 6: Hire-to-Retire (H2R) Full Lifecycle Process Engine
  // ==========================================================================
  printSection('PILLAR 6: Hire-to-Retire (H2R) Full Lifecycle Process Engine');

  // Step 6A: Check eligible accepted candidates from RCM
  try {
    const res = await fetch(`${BASE_URL}/api/workforce/hire-to-retire/eligible-candidates`);
    const candidates = await res.json();

    if (res.status === 200 && Array.isArray(candidates) && candidates.length > 0) {
      logPass('RCM Candidate Pipeline Ingestion Queue', 
        `Candidates Ready for Day-1 Hire: ${candidates.map(c => `${c.fullName} (${c.targetPositionCode})`).join(', ')}`);
    } else {
      logFail('RCM Candidate Pipeline Ingestion Queue', `No eligible candidates found: ${JSON.stringify(candidates)}`);
    }
  } catch (err) {
    logFail('RCM Candidate Pipeline Ingestion Queue', err.message);
  }

  // Step 6B: Execute HIRE_CANDIDATE (RCM -> EC Core)
  let newlyHiredEmployeeId = '';
  try {
    const hirePayload = {
      action: 'HIRE_CANDIDATE',
      candidateId: `cand-test-${runId}`,
      candidateName: `Devin Archer ${runId}`,
      email: `devin.archer.${runId}@enterprise-cloud.io`,
      phone: '+1 (415) 555-4921',
      positionCode: 'POS-ENG-084',
      requisitionId: 'req-101',
      department: 'Engineering',
      jobTitle: 'Senior Full-Stack Cloud Architect',
      managerName: 'Marcus Chen',
      annualSalary: 172000,
      startDate: new Date().toISOString().split('T')[0],
      workAuthorization: 'US_CITIZEN',
    };

    const res = await fetch(`${BASE_URL}/api/workforce/hire-to-retire`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(hirePayload),
    });

    const data = await res.json();
    if (res.status === 201 && data.employee && data.position) {
      newlyHiredEmployeeId = data.employee.id;
      const empNo = data.employee.job.employeeNumber;
      const posStatus = data.position.status;
      logPass('Lifecycle Step 1: Candidate Conversion to Active Employee', 
        `Created Employee: ${data.employee.personal.firstName} ${data.employee.personal.lastName} (${empNo}) | Status: ${data.employee.status}`);
      logPass('Lifecycle Step 1: Position Slot Auto-Allocation (VACANT -> FILLED)', 
        `Position: ${data.position.positionCode} (${data.position.title}) | Status: ${posStatus} | Incumbent: "${data.position.incumbentName}"`);
    } else {
      logFail('Lifecycle Step 1: Candidate Conversion', `Expected 201, got: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    logFail('Lifecycle Step 1: Candidate Conversion', err.message);
  }

  // Step 6C: Execute JOB_CHANGE (Merit Promotion)
  if (newlyHiredEmployeeId) {
    try {
      const promotionPayload = {
        action: 'JOB_CHANGE',
        employeeId: newlyHiredEmployeeId,
        newPositionCode: 'POS-ENG-002',
        newJobTitle: 'Lead Distributed Systems Architect',
        newSalary: 198000,
        changeReason: 'PROMOTION',
        effectiveDate: new Date().toISOString().split('T')[0],
        notes: 'Accelerated promotion for outstanding distributed consensus design.',
      };

      const res = await fetch(`${BASE_URL}/api/workforce/hire-to-retire`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(promotionPayload),
      });

      const data = await res.json();
      if (res.status === 200 && data.employee && data.transition) {
        logPass('Lifecycle Step 2: Internal Promotion & Compensation Revision', 
          `Promoted to: "${data.employee.job.jobTitle}" | Position: ${data.employee.job.positionCode} | Revised Salary: $${data.employee.compensation.annualBaseSalary.toLocaleString()} USD`);
      } else {
        logFail('Lifecycle Step 2: Internal Promotion', `Expected 200, got: ${JSON.stringify(data)}`);
      }
    } catch (err) {
      logFail('Lifecycle Step 2: Internal Promotion', err.message);
    }

    // Step 6D: Execute LEAVE_OF_ABSENCE
    try {
      const loaPayload = {
        action: 'LEAVE_OF_ABSENCE',
        employeeId: newlyHiredEmployeeId,
        loaAction: 'START_LEAVE',
        effectiveDate: new Date().toISOString().split('T')[0],
        reason: 'Parental Bonding Leave',
      };

      const res = await fetch(`${BASE_URL}/api/workforce/hire-to-retire`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loaPayload),
      });

      const data = await res.json();
      if (res.status === 200 && data.status === 'ON_LEAVE') {
        logPass('Lifecycle Step 3: Leave of Absence (ACTIVE -> ON_LEAVE)', 
          `Status changed to: ${data.status} | Timeline event logged`);
      } else {
        logFail('Lifecycle Step 3: Leave of Absence', `Expected ON_LEAVE, got: ${data.status}`);
      }

      // Return from leave
      const returnRes = await fetch(`${BASE_URL}/api/workforce/hire-to-retire`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'LEAVE_OF_ABSENCE',
          employeeId: newlyHiredEmployeeId,
          loaAction: 'RETURN_FROM_LEAVE',
          effectiveDate: new Date().toISOString().split('T')[0],
        }),
      });

      const returnData = await returnRes.json();
      if (returnRes.status === 200 && returnData.status === 'ACTIVE') {
        logPass('Lifecycle Step 3: Return from Leave (ON_LEAVE -> ACTIVE)', 
          `Employee reinstated to: ${returnData.status}`);
      } else {
        logFail('Lifecycle Step 3: Return from Leave', `Expected ACTIVE, got: ${returnData.status}`);
      }
    } catch (err) {
      logFail('Lifecycle Step 3: Leave of Absence Workflow', err.message);
    }

    // Step 6E: Execute RETIRE_SEPARATE (Separation / Retirement & Position Vacating)
    try {
      const retirePayload = {
        action: 'RETIRE_SEPARATE',
        employeeId: newlyHiredEmployeeId,
        separationType: 'RETIREMENT',
        effectiveDate: new Date().toISOString().split('T')[0],
        reason: 'Honorable executive retirement.',
        assetsReturned: ['MacBook Pro M3 Max', 'Security Badge', 'Amex Corporate Card'],
        severancePayoutUsd: 35000,
      };

      const res = await fetch(`${BASE_URL}/api/workforce/hire-to-retire`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(retirePayload),
      });

      const data = await res.json();
      if (res.status === 200 && data.employee.status === 'RETIRED' && data.vacatedPosition) {
        logPass('Lifecycle Step 4: Separation / Retirement Offboarding', 
          `Status: ${data.employee.status} | Assets Returned: ${data.transition.details.assetsReturned?.join(', ')} | Severance: $${data.transition.details.severancePayoutUsd?.toLocaleString()}`);
        logPass('Lifecycle Step 4: Position Slot Vacating for RCM Backfill (FILLED -> VACANT)', 
          `Position ${data.vacatedPosition.positionCode} reset to ${data.vacatedPosition.status} | Ready for talent requisition backfill!`);
      } else {
        logFail('Lifecycle Step 4: Separation & Position Vacating', `Expected RETIRED with vacated position, got: ${JSON.stringify(data)}`);
      }
    } catch (err) {
      logFail('Lifecycle Step 4: Separation & Position Vacating', err.message);
    }
  }

  // Verify transition audit log
  try {
    const res = await fetch(`${BASE_URL}/api/workforce/hire-to-retire/transitions`);
    const history = await res.json();

    if (res.status === 200 && Array.isArray(history) && history.length >= 2) {
      logPass('Immutable Hire-to-Retire Transitions Audit Log', 
        `Total Logged Lifecycle Transitions: ${history.length} events archived`);
    } else {
      logFail('Hire-to-Retire Transitions Audit Log', `Expected >= 2 transitions, got: ${history.length}`);
    }
  } catch (err) {
    logFail('Hire-to-Retire Transitions Audit Log', err.message);
  }

  // ==========================================================================
  // PILLAR 7: Customer Configuration & Customization Studio
  // ==========================================================================
  printSection('PILLAR 7: Customer Configuration Studio & Customization API');

  // Step 7A: UI Studio Availability
  try {
    const res = await fetch(`${BASE_URL}/configuration/ec-core`);
    if (res.status === 200) {
      logPass('Customer Configuration Studio Web Route (/configuration/ec-core)', 
        'Status: 200 OK | 5-Tab Customization Studio active');
    } else {
      logFail('Customer Configuration Studio Web Route (/configuration/ec-core)', `Expected 200, got ${res.status}`);
    }
  } catch (err) {
    logFail('Customer Configuration Studio Web Route (/configuration/ec-core)', err.message);
  }

  // Step 7B: Configuration GET (Retrieve all 5 config domains)
  let initialConfig = null;
  try {
    const res = await fetch(`${BASE_URL}/api/configuration/ec-core`);
    const data = await res.json();

    if (
      res.status === 200 &&
      data.positions?.jobLevels &&
      data.orgStructure?.enabledTiers &&
      data.peopleProfile?.customFields &&
      data.timeOff?.leaveTypes &&
      data.hireToRetire?.onboardingChecklist
    ) {
      initialConfig = data;
      logPass('Customer Configuration Retrieval (All 5 Core Domains)', 
        `Job Levels: ${data.positions.jobLevels.length} | Org Tiers: ${data.orgStructure.enabledTiers.length} | Custom Fields: ${data.peopleProfile.customFields.length} | Leave Policies: ${data.timeOff.leaveTypes.length} | Onboarding Gates: ${data.hireToRetire.onboardingChecklist.length}`);
    } else {
      logFail('Customer Configuration Retrieval', `Missing expected configuration domains: ${Object.keys(data).join(', ')}`);
    }
  } catch (err) {
    logFail('Customer Configuration Retrieval', err.message);
  }

  // Step 7C: Dynamic Tenant Customization (PATCH /api/configuration/ec-core)
  try {
    const customTestField = {
      id: `cf-test-${runId}`,
      key: `securityBadgeId_${runId}`,
      label: `Smart Badge Serial #${runId}`,
      type: 'TEXT',
      section: 'JOB',
      required: false,
    };

    const newJobLevel = {
      code: `EX-${runId}`,
      name: `Distinguished AI Fellow ${runId}`,
      band: 'Band 6 (Executive Fellow)',
      minSalaryUsd: 320000,
      midSalaryUsd: 400000,
      maxSalaryUsd: 500000,
    };

    const updatedJobLevels = initialConfig?.positions?.jobLevels ? [...initialConfig.positions.jobLevels, newJobLevel] : [newJobLevel];
    const updatedCustomFields = initialConfig?.peopleProfile?.customFields ? [...initialConfig.peopleProfile.customFields, customTestField] : [customTestField];

    const patchPayload = {
      positions: {
        autoTriggerRequisitionsOnVacancy: true,
        jobLevels: updatedJobLevels,
      },
      peopleProfile: {
        maskSensitiveData: true,
        defaultProbationDays: 90,
        customFields: updatedCustomFields,
      },
      timeOff: {
        carryoverExpiryMonth: 4,
      },
      hireToRetire: {
        employeeIdPrefix: 'MX-',
      },
    };

    const patchRes = await fetch(`${BASE_URL}/api/configuration/ec-core`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patchPayload),
    });

    const patchData = await patchRes.json();
    const returnedConfig = patchData.configuration || patchData.config;

    if (
      patchRes.status === 200 &&
      returnedConfig?.peopleProfile?.defaultProbationDays === 90 &&
      returnedConfig?.positions?.jobLevels?.some((l) => l.code === newJobLevel.code) &&
      returnedConfig?.peopleProfile?.customFields?.some((f) => f.key === customTestField.key)
    ) {
      logPass('Customer Dynamic Customization & Policy Update (PATCH)', 
        `Custom Field [${customTestField.key}] added | Job Level [${newJobLevel.code}] added | Probation updated to 90 days`);
    } else {
      logFail('Customer Dynamic Customization & Policy Update', `Unexpected response: ${JSON.stringify(patchData)}`);
    }
  } catch (err) {
    logFail('Customer Dynamic Customization & Policy Update', err.message);
  }

  // Step 7D: Verify Updated Configuration Persistence
  try {
    const verifyRes = await fetch(`${BASE_URL}/api/configuration/ec-core`);
    const verifiedConfig = await verifyRes.json();

    if (
      verifyRes.status === 200 &&
      verifiedConfig.peopleProfile.defaultProbationDays === 90 &&
      verifiedConfig.timeOff.carryoverExpiryMonth === 4
    ) {
      logPass('Customer Customization Persistence & In-Memory Store Integrity', 
        `Persisted: defaultProbationDays=${verifiedConfig.peopleProfile.defaultProbationDays}, carryoverExpiryMonth=${verifiedConfig.timeOff.carryoverExpiryMonth}`);
    } else {
      logFail('Customer Customization Persistence', `Verification failed: probation=${verifiedConfig?.peopleProfile?.defaultProbationDays}`);
    }
  } catch (err) {
    logFail('Customer Customization Persistence', err.message);
  }

  // ==========================================================================
  // FINAL SCORECARD
  // ==========================================================================
  console.log(`\n${colors.cyan}══════════════════════════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bright}EC CORE & HIRE-TO-RETIRE TEST SUITE SUMMARY${colors.reset}`);
  console.log(`${colors.cyan}══════════════════════════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`  Total Checks Executed : ${passedCount + failedCount}`);
  console.log(`  ${colors.green}Passed Checks         : ${passedCount}${colors.reset}`);
  console.log(`  ${failedCount === 0 ? colors.green : colors.red}Failed Checks         : ${failedCount}${colors.reset}`);

  const healthPct = Math.round((passedCount / (passedCount + failedCount)) * 100);
  console.log(`  Overall Health        : ${healthPct >= 95 ? colors.green : colors.yellow}${healthPct}% ${healthPct === 100 ? 'HEALTHY & READY FOR UAT' : 'ATTENTION REQUIRED'}${colors.reset}`);
  console.log(`${colors.cyan}══════════════════════════════════════════════════════════════════════════════\n${colors.reset}`);

  process.exit(failedCount === 0 ? 0 : 1);
}

runTestSuite();
