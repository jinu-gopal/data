// MAX-ERP Enterprise Core HR (Employee Central) Data Store
// Provides Position Management, Org Structure, 360° People Profile, Time Off, and Hire-to-Retire Lifecycle Engine.

export interface Position {
  id: string;
  positionCode: string;
  title: string;
  department: string;
  division: string;
  businessUnit: string;
  legalEntity: string;
  location: string;
  jobLevel: string;
  jobBand: string;
  fte: number;
  targetHeadcount: number;
  currentHeadcount: number;
  status: "VACANT" | "FILLED" | "FROZEN";
  costCenter: string;
  reportsToPositionCode: string | null;
  reportsToTitle: string | null;
  incumbentId: string | null;
  incumbentName: string | null;
  vacantSince?: string | null;
  requisitionId?: string | null;
  salaryRange: { min: number; max: number; currency: string };
  createdAt: string;
  updatedAt: string;
}

export interface OrgEntity {
  id: string;
  code: string;
  name: string;
  type: "LEGAL_ENTITY" | "BUSINESS_UNIT" | "DIVISION" | "DEPARTMENT" | "LOCATION" | "COST_CENTER";
  parentId?: string | null;
  parentCode?: string | null;
  headName?: string;
  headTitle?: string;
  headcount: number;
  budgetUsd?: number;
  country?: string;
  currency?: string;
  description?: string;
}

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  preferredName?: string;
  dateOfBirth: string;
  gender: string;
  maritalStatus: string;
  nationality: string;
  personalEmail: string;
  personalPhone: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
    email: string;
  };
  residentialAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

export interface JobInfo {
  employeeNumber: string;
  positionCode: string;
  jobTitle: string;
  department: string;
  division: string;
  businessUnit: string;
  legalEntity: string;
  workLocation: string;
  managerId: string;
  managerName: string;
  employmentType: "FULL_TIME" | "PART_TIME" | "CONTRACT";
  jobLevel: string;
  hireDate: string;
  probationEndDate: string;
  standardWeeklyHours: number;
  flsaStatus: "EXEMPT" | "NON_EXEMPT";
}

export interface CompensationInfo {
  annualBaseSalary: number;
  currency: string;
  payFrequency: "BI_WEEKLY" | "MONTHLY" | "SEMI_MONTHLY";
  bonusTargetPct: number;
  equityGrantShares: number;
  vestingSchedule: string;
  payGradeBand: { min: number; mid: number; max: number };
  compaRatio: number;
  healthPlan: string;
  retirementPlan: string;
}

export interface WorkAuthorizationInfo {
  citizenship: string;
  passportNumberMasked: string;
  passportCountry: string;
  workPermitType: "US_CITIZEN" | "PERMANENT_RESIDENT" | "H1B_SPECIALTY" | "EU_BLUE_CARD" | "EMPLOYMENT_PASS" | "GLOBAL_TALENT";
  permitExpiryDate: string;
  i9VerificationStatus: "VERIFIED" | "PENDING" | "EXEMPT";
  bgvStatus: "CLEARED" | "IN_PROGRESS" | "FLAGGED";
  bgvClearedDate?: string;
  complianceSignOffDate?: string;
}

export interface DirectDepositInfo {
  bankName: string;
  routingNumberMasked: string;
  accountNumberMasked: string;
  accountType: "CHECKING" | "SAVINGS";
  depositAllocationPct: number;
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  eventType: "HIRED" | "PROMOTION" | "TRANSFER" | "COMPENSATION_REVISION" | "LEAVE_OF_ABSENCE" | "RETURN_FROM_LEAVE" | "RETIREMENT" | "SEPARATION";
  title: string;
  description: string;
  performedBy: string;
  effectiveDate: string;
  previousValue?: string;
  newValue?: string;
}

export interface LeaveBalance {
  leaveType: "VACATION" | "SICK" | "PARENTAL" | "BEREAVEMENT" | "FLOATING" | "STUDY";
  totalEntitlement: number;
  accrued: number;
  taken: number;
  pending: number;
  availableBalance: number;
  unit: "DAYS";
}

export interface PeopleProfile {
  id: string;
  status: "ACTIVE" | "ON_LEAVE" | "RETIRED" | "TERMINATED";
  personal: PersonalInfo;
  job: JobInfo;
  compensation: CompensationInfo;
  workAuthorization: WorkAuthorizationInfo;
  directDeposit: DirectDepositInfo;
  leaveBalances: LeaveBalance[];
  timeline: TimelineEvent[];
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  leaveType: "VACATION" | "SICK" | "PARENTAL" | "BEREAVEMENT" | "FLOATING" | "STUDY";
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  requestedAt: string;
  reviewerName?: string;
  reviewNotes?: string;
  reviewedAt?: string;
}

export interface H2RTransition {
  id: string;
  employeeId: string;
  employeeName: string;
  transitionType: "NEW_HIRE" | "JOB_CHANGE" | "PROMOTION" | "TRANSFER" | "LEAVE_OF_ABSENCE" | "RETURN_FROM_LEAVE" | "RETIREMENT" | "SEPARATION";
  effectiveDate: string;
  status: "COMPLETED" | "PENDING_APPROVAL" | "STAGED";
  details: {
    sourceRequisitionId?: string;
    candidateId?: string;
    positionCodeBefore?: string;
    positionCodeAfter?: string;
    departmentBefore?: string;
    departmentAfter?: string;
    managerBefore?: string;
    managerAfter?: string;
    salaryBefore?: number;
    salaryAfter?: number;
    separationReason?: string;
    checklistCompleted?: boolean;
    assetsReturned?: string[];
    severancePayoutUsd?: number;
  };
  initiatedBy: string;
  initiatedAt: string;
  notes?: string;
}

// ----------------------------------------------------------------------------
// SEED DATA: POSITIONS
// ----------------------------------------------------------------------------
let positions: Position[] = [
  {
    id: "pos-001",
    positionCode: "POS-EXEC-001",
    title: "Chief Executive Officer",
    department: "Executive",
    division: "Executive Leadership",
    businessUnit: "Global Enterprise Group",
    legalEntity: "MAX Global Holdings Inc.",
    location: "HEADQUARTERS",
    jobLevel: "C-LEVEL",
    jobBand: "Band Executive",
    fte: 1.0,
    targetHeadcount: 1,
    currentHeadcount: 1,
    status: "FILLED",
    costCenter: "CC-EXEC-001",
    reportsToPositionCode: null,
    reportsToTitle: null,
    incumbentId: "emp-001",
    incumbentName: "Elena Vance",
    salaryRange: { min: 350000, max: 450000, currency: "USD" },
    createdAt: "2021-01-01T00:00:00Z",
    updatedAt: "2026-10-15T00:00:00Z",
  },
  {
    id: "pos-002",
    positionCode: "POS-ENG-001",
    title: "Chief Technology Officer",
    department: "Engineering",
    division: "Cloud Infrastructure & Platforms",
    businessUnit: "Enterprise Cloud & AI",
    legalEntity: "MAX Technologies Corp (US)",
    location: "HEADQUARTERS",
    jobLevel: "C-LEVEL",
    jobBand: "Band Executive",
    fte: 1.0,
    targetHeadcount: 1,
    currentHeadcount: 1,
    status: "FILLED",
    costCenter: "CC-ENG-101",
    reportsToPositionCode: "POS-EXEC-001",
    reportsToTitle: "Chief Executive Officer",
    incumbentId: "emp-002",
    incumbentName: "Marcus Chen",
    salaryRange: { min: 280000, max: 340000, currency: "USD" },
    createdAt: "2021-01-01T00:00:00Z",
    updatedAt: "2026-10-15T00:00:00Z",
  },
  {
    id: "pos-003",
    positionCode: "POS-FIN-001",
    title: "Chief Financial Officer",
    department: "Finance",
    division: "Corporate Treasury & Reporting",
    businessUnit: "Corporate Governance",
    legalEntity: "MAX Global Holdings Inc.",
    location: "HEADQUARTERS",
    jobLevel: "C-LEVEL",
    jobBand: "Band Executive",
    fte: 1.0,
    targetHeadcount: 1,
    currentHeadcount: 1,
    status: "FILLED",
    costCenter: "CC-FIN-301",
    reportsToPositionCode: "POS-EXEC-001",
    reportsToTitle: "Chief Executive Officer",
    incumbentId: "emp-003",
    incumbentName: "Sarah Jenkins",
    salaryRange: { min: 270000, max: 330000, currency: "USD" },
    createdAt: "2021-01-01T00:00:00Z",
    updatedAt: "2026-10-15T00:00:00Z",
  },
  {
    id: "pos-004",
    positionCode: "POS-OPS-001",
    title: "Chief Operating Officer",
    department: "Operations",
    division: "Global Plant Operations",
    businessUnit: "Manufacturing & Supply",
    legalEntity: "MAX Technologies Corp (US)",
    location: "HEADQUARTERS",
    jobLevel: "C-LEVEL",
    jobBand: "Band Executive",
    fte: 1.0,
    targetHeadcount: 1,
    currentHeadcount: 1,
    status: "FILLED",
    costCenter: "CC-OPS-201",
    reportsToPositionCode: "POS-EXEC-001",
    reportsToTitle: "Chief Executive Officer",
    incumbentId: "emp-004",
    incumbentName: "David Ross",
    salaryRange: { min: 260000, max: 320000, currency: "USD" },
    createdAt: "2021-01-01T00:00:00Z",
    updatedAt: "2026-10-15T00:00:00Z",
  },
  {
    id: "pos-005",
    positionCode: "POS-ENG-002",
    title: "Lead Systems Architect",
    department: "Engineering",
    division: "Cloud Infrastructure & Platforms",
    businessUnit: "Enterprise Cloud & AI",
    legalEntity: "MAX Technologies Corp (US)",
    location: "REMOTE",
    jobLevel: "IC-5",
    jobBand: "Band 5 (Staff)",
    fte: 1.0,
    targetHeadcount: 1,
    currentHeadcount: 1,
    status: "FILLED",
    costCenter: "CC-ENG-101",
    reportsToPositionCode: "POS-ENG-001",
    reportsToTitle: "Chief Technology Officer",
    incumbentId: "emp-005",
    incumbentName: "Priya Sharma",
    salaryRange: { min: 180000, max: 220000, currency: "USD" },
    createdAt: "2022-01-15T00:00:00Z",
    updatedAt: "2026-10-15T00:00:00Z",
  },
  {
    id: "pos-006",
    positionCode: "POS-ENG-003",
    title: "Senior Full-Stack Engineer",
    department: "Engineering",
    division: "Cloud Infrastructure & Platforms",
    businessUnit: "Enterprise Cloud & AI",
    legalEntity: "MAX Technologies Corp (US)",
    location: "REMOTE",
    jobLevel: "IC-4",
    jobBand: "Band 4 (Senior)",
    fte: 1.0,
    targetHeadcount: 1,
    currentHeadcount: 1,
    status: "FILLED",
    costCenter: "CC-ENG-101",
    reportsToPositionCode: "POS-ENG-002",
    reportsToTitle: "Lead Systems Architect",
    incumbentId: "emp-006",
    incumbentName: "Alex Morgan",
    salaryRange: { min: 140000, max: 175000, currency: "USD" },
    createdAt: "2022-06-01T00:00:00Z",
    updatedAt: "2026-10-15T00:00:00Z",
  },
  {
    id: "pos-007",
    positionCode: "POS-ENG-084",
    title: "Senior Full-Stack Cloud Architect",
    department: "Engineering",
    division: "Cloud Infrastructure & Platforms",
    businessUnit: "Enterprise Cloud & AI",
    legalEntity: "MAX Technologies Corp (US)",
    location: "REMOTE",
    jobLevel: "IC-4",
    jobBand: "Band 4 (Senior)",
    fte: 1.0,
    targetHeadcount: 1,
    currentHeadcount: 0,
    status: "VACANT",
    costCenter: "CC-ENG-101",
    reportsToPositionCode: "POS-ENG-002",
    reportsToTitle: "Lead Systems Architect",
    incumbentId: null,
    incumbentName: null,
    vacantSince: "2026-09-01T00:00:00Z",
    requisitionId: "req-101",
    salaryRange: { min: 150000, max: 185000, currency: "USD" },
    createdAt: "2026-09-01T00:00:00Z",
    updatedAt: "2026-10-15T00:00:00Z",
  },
  {
    id: "pos-008",
    positionCode: "POS-OPS-032",
    title: "Plant Reliability & Safety Lead",
    department: "Operations",
    division: "Industrial Automation & Safety",
    businessUnit: "Manufacturing & Supply",
    legalEntity: "MAX Technologies Corp (US)",
    location: "HEADQUARTERS",
    jobLevel: "M-1",
    jobBand: "Band 4 (Lead)",
    fte: 1.0,
    targetHeadcount: 1,
    currentHeadcount: 0,
    status: "VACANT",
    costCenter: "CC-OPS-201",
    reportsToPositionCode: "POS-OPS-001",
    reportsToTitle: "Chief Operating Officer",
    incumbentId: null,
    incumbentName: null,
    vacantSince: "2026-08-15T00:00:00Z",
    requisitionId: "req-102",
    salaryRange: { min: 125000, max: 155000, currency: "USD" },
    createdAt: "2026-08-15T00:00:00Z",
    updatedAt: "2026-10-15T00:00:00Z",
  },
  {
    id: "pos-009",
    positionCode: "POS-FIN-019",
    title: "Corporate Financial Planning Analyst",
    department: "Finance",
    division: "Corporate Treasury & Reporting",
    businessUnit: "Corporate Governance",
    legalEntity: "MAX Global Holdings Inc.",
    location: "HEADQUARTERS",
    jobLevel: "IC-3",
    jobBand: "Band 3 (Mid)",
    fte: 1.0,
    targetHeadcount: 1,
    currentHeadcount: 1,
    status: "FILLED",
    costCenter: "CC-FIN-301",
    reportsToPositionCode: "POS-FIN-001",
    reportsToTitle: "Chief Financial Officer",
    incumbentId: "emp-009",
    incumbentName: "James Wilson",
    salaryRange: { min: 110000, max: 135000, currency: "USD" },
    createdAt: "2022-09-01T00:00:00Z",
    updatedAt: "2026-10-15T00:00:00Z",
  },
  {
    id: "pos-010",
    positionCode: "POS-SLS-055",
    title: "Enterprise Global Solutions Executive",
    department: "Sales",
    division: "Commercial & Revenue Operations",
    businessUnit: "Global Commercial",
    legalEntity: "MAX Enterprise UK Ltd",
    location: "LONDON_HUB",
    jobLevel: "IC-4",
    jobBand: "Band 4 (Senior)",
    fte: 1.0,
    targetHeadcount: 1,
    currentHeadcount: 0,
    status: "VACANT",
    costCenter: "CC-SLS-401",
    reportsToPositionCode: "POS-EXEC-001",
    reportsToTitle: "Chief Executive Officer",
    incumbentId: null,
    incumbentName: null,
    vacantSince: "2026-09-15T00:00:00Z",
    requisitionId: "req-104",
    salaryRange: { min: 130000, max: 165000, currency: "USD" },
    createdAt: "2026-09-15T00:00:00Z",
    updatedAt: "2026-10-15T00:00:00Z",
  },
  {
    id: "pos-011",
    positionCode: "POS-HR-010",
    title: "People Operations & Talent Director",
    department: "People Operations",
    division: "Talent Acquisition & Employee Experience",
    businessUnit: "Corporate Governance",
    legalEntity: "MAX Global Holdings Inc.",
    location: "HEADQUARTERS",
    jobLevel: "M-2",
    jobBand: "Band 5 (Director)",
    fte: 1.0,
    targetHeadcount: 1,
    currentHeadcount: 1,
    status: "FILLED",
    costCenter: "CC-HR-501",
    reportsToPositionCode: "POS-EXEC-001",
    reportsToTitle: "Chief Executive Officer",
    incumbentId: "emp-008",
    incumbentName: "Rachel Green",
    salaryRange: { min: 160000, max: 195000, currency: "USD" },
    createdAt: "2022-03-01T00:00:00Z",
    updatedAt: "2026-10-15T00:00:00Z",
  },
];

// ----------------------------------------------------------------------------
// SEED DATA: ORGANISATION STRUCTURE
// ----------------------------------------------------------------------------
let orgEntities: OrgEntity[] = [
  // Legal Entities
  {
    id: "le-001",
    code: "LE-GLOBAL",
    name: "MAX Global Holdings Inc.",
    type: "LEGAL_ENTITY",
    country: "USA",
    currency: "USD",
    headName: "Elena Vance",
    headTitle: "Chief Executive Officer",
    headcount: 240,
    budgetUsd: 48000000,
    description: "Ultimate Global Parent Holding Corporation incorporated in Delaware.",
  },
  {
    id: "le-002",
    code: "LE-US-TECH",
    name: "MAX Technologies Corp (US)",
    type: "LEGAL_ENTITY",
    parentId: "le-001",
    parentCode: "LE-GLOBAL",
    country: "USA",
    currency: "USD",
    headName: "Marcus Chen",
    headTitle: "Chief Technology Officer",
    headcount: 155,
    budgetUsd: 28000000,
    description: "Americas core operating technology subsidiary (San Francisco HQ).",
  },
  {
    id: "le-003",
    code: "LE-UK-EMEA",
    name: "MAX Enterprise UK Ltd",
    type: "LEGAL_ENTITY",
    parentId: "le-001",
    parentCode: "LE-GLOBAL",
    country: "United Kingdom",
    currency: "GBP",
    headName: "Olivia Taylor",
    headTitle: "Global Enterprise Sales Director",
    headcount: 52,
    budgetUsd: 12000000,
    description: "EMEA Regional Operating Headquarters based in Canary Wharf, London.",
  },
  {
    id: "le-004",
    code: "LE-APAC-SG",
    name: "MAX Asia-Pacific Pte Ltd",
    type: "LEGAL_ENTITY",
    parentId: "le-001",
    parentCode: "LE-GLOBAL",
    country: "Singapore",
    currency: "SGD",
    headName: "Priya Sharma",
    headTitle: "Lead Systems Architect",
    headcount: 33,
    budgetUsd: 8000000,
    description: "APAC Regional Innovation Center based in Marina Bay, Singapore.",
  },

  // Business Units
  {
    id: "bu-001",
    code: "BU-CLOUD",
    name: "Enterprise Cloud & AI Platforms",
    type: "BUSINESS_UNIT",
    parentId: "le-002",
    parentCode: "LE-US-TECH",
    headName: "Marcus Chen",
    headTitle: "CTO & General Manager",
    headcount: 110,
    budgetUsd: 18500000,
    description: "Next-generation distributed cloud ERP architecture and AI co-pilots.",
  },
  {
    id: "bu-002",
    code: "BU-OPS",
    name: "Manufacturing & Industrial Supply",
    type: "BUSINESS_UNIT",
    parentId: "le-002",
    parentCode: "LE-US-TECH",
    headName: "David Ross",
    headTitle: "COO & VP Operations",
    headcount: 80,
    budgetUsd: 14200000,
    description: "Industrial plant operations, smart supply chain telemetry, and reliability engineering.",
  },
  {
    id: "bu-003",
    code: "BU-CORP",
    name: "Corporate Governance & Shared Services",
    type: "BUSINESS_UNIT",
    parentId: "le-001",
    parentCode: "LE-GLOBAL",
    headName: "Sarah Jenkins",
    headTitle: "CFO & Head of Shared Services",
    headcount: 50,
    budgetUsd: 15300000,
    description: "Global finance, legal compliance, people operations, and enterprise security.",
  },

  // Divisions
  {
    id: "div-001",
    code: "DIV-ENG",
    name: "Cloud Infrastructure & Platforms",
    type: "DIVISION",
    parentId: "bu-001",
    parentCode: "BU-CLOUD",
    headName: "Priya Sharma",
    headTitle: "Lead Systems Architect",
    headcount: 65,
    budgetUsd: 11000000,
  },
  {
    id: "div-002",
    code: "DIV-OPS",
    name: "Industrial Automation & Safety",
    type: "DIVISION",
    parentId: "bu-002",
    parentCode: "BU-OPS",
    headName: "Carlos Gomez",
    headTitle: "Plant Operations Manager",
    headcount: 48,
    budgetUsd: 8500000,
  },
  {
    id: "div-003",
    code: "DIV-FIN",
    name: "Corporate Treasury & Reporting",
    type: "DIVISION",
    parentId: "bu-003",
    parentCode: "BU-CORP",
    headName: "James Wilson",
    headTitle: "Accounting & Controller Lead",
    headcount: 24,
    budgetUsd: 4500000,
  },
  {
    id: "div-004",
    code: "DIV-HR",
    name: "Talent Acquisition & Employee Experience",
    type: "DIVISION",
    parentId: "bu-003",
    parentCode: "BU-CORP",
    headName: "Rachel Green",
    headTitle: "People Operations & Talent Director",
    headcount: 16,
    budgetUsd: 2800000,
  },

  // Departments
  {
    id: "dep-001",
    code: "DEP-ENG",
    name: "Engineering",
    type: "DEPARTMENT",
    parentId: "div-001",
    parentCode: "DIV-ENG",
    headcount: 65,
    budgetUsd: 11000000,
  },
  {
    id: "dep-002",
    code: "DEP-OPS",
    name: "Operations",
    type: "DEPARTMENT",
    parentId: "div-002",
    parentCode: "DIV-OPS",
    headcount: 48,
    budgetUsd: 8500000,
  },
  {
    id: "dep-003",
    code: "DEP-FIN",
    name: "Finance",
    type: "DEPARTMENT",
    parentId: "div-003",
    parentCode: "DIV-FIN",
    headcount: 24,
    budgetUsd: 4500000,
  },
  {
    id: "dep-004",
    code: "DEP-HR",
    name: "People Operations",
    type: "DEPARTMENT",
    parentId: "div-004",
    parentCode: "DIV-HR",
    headcount: 16,
    budgetUsd: 2800000,
  },
  {
    id: "dep-005",
    code: "DEP-SLS",
    name: "Sales",
    type: "DEPARTMENT",
    parentId: "le-003",
    parentCode: "LE-UK-EMEA",
    headcount: 52,
    budgetUsd: 12000000,
  },

  // Work Locations
  {
    id: "loc-001",
    code: "LOC-SF",
    name: "San Francisco Global HQ",
    type: "LOCATION",
    country: "USA",
    headcount: 130,
    description: "450 Mission St, San Francisco, CA 94105",
  },
  {
    id: "loc-002",
    code: "LOC-LDN",
    name: "London Regional Center",
    type: "LOCATION",
    country: "United Kingdom",
    headcount: 45,
    description: "25 Bank Street, Canary Wharf, London E14 5JP",
  },
  {
    id: "loc-003",
    code: "LOC-SGP",
    name: "Singapore Innovation Park",
    type: "LOCATION",
    country: "Singapore",
    headcount: 28,
    description: "Marina Bay Financial Centre Tower 1, Singapore 018981",
  },
  {
    id: "loc-004",
    code: "LOC-RMT",
    name: "Global Remote & Distributed",
    type: "LOCATION",
    country: "Global",
    headcount: 37,
    description: "High-trust asynchronous distributed global workforce.",
  },

  // Cost Centers
  {
    id: "cc-001",
    code: "CC-ENG-101",
    name: "Cloud Platform Engineering R&D",
    type: "COST_CENTER",
    parentId: "dep-001",
    parentCode: "DEP-ENG",
    budgetUsd: 11000000,
    headcount: 65,
  },
  {
    id: "cc-002",
    code: "CC-OPS-201",
    name: "Plant Operations & Industrial Safety",
    type: "COST_CENTER",
    parentId: "dep-002",
    parentCode: "DEP-OPS",
    budgetUsd: 8500000,
    headcount: 48,
  },
  {
    id: "cc-003",
    code: "CC-FIN-301",
    name: "Treasury & Corporate Controller",
    type: "COST_CENTER",
    parentId: "dep-003",
    parentCode: "DEP-FIN",
    budgetUsd: 4500000,
    headcount: 24,
  },
  {
    id: "cc-004",
    code: "CC-SLS-401",
    name: "Global Enterprise Commercial Sales",
    type: "COST_CENTER",
    parentId: "dep-005",
    parentCode: "DEP-SLS",
    budgetUsd: 12000000,
    headcount: 52,
  },
  {
    id: "cc-005",
    code: "CC-HR-501",
    name: "People Experience & Talent Ops",
    type: "COST_CENTER",
    parentId: "dep-004",
    parentCode: "DEP-HR",
    budgetUsd: 2800000,
    headcount: 16,
  },
];

// Helper default leave balances
const makeDefaultLeaveBalances = (vacationDays = 25, sickDays = 12): LeaveBalance[] => [
  { leaveType: "VACATION", totalEntitlement: vacationDays, accrued: vacationDays, taken: 4, pending: 0, availableBalance: vacationDays - 4, unit: "DAYS" },
  { leaveType: "SICK", totalEntitlement: sickDays, accrued: sickDays, taken: 1, pending: 0, availableBalance: sickDays - 1, unit: "DAYS" },
  { leaveType: "PARENTAL", totalEntitlement: 60, accrued: 60, taken: 0, pending: 0, availableBalance: 60, unit: "DAYS" },
  { leaveType: "BEREAVEMENT", totalEntitlement: 5, accrued: 5, taken: 0, pending: 0, availableBalance: 5, unit: "DAYS" },
  { leaveType: "FLOATING", totalEntitlement: 3, accrued: 3, taken: 1, pending: 0, availableBalance: 2, unit: "DAYS" },
  { leaveType: "STUDY", totalEntitlement: 5, accrued: 5, taken: 0, pending: 0, availableBalance: 5, unit: "DAYS" },
];

// ----------------------------------------------------------------------------
// SEED DATA: 360° PEOPLE PROFILES
// ----------------------------------------------------------------------------
let peopleProfiles: Map<string, PeopleProfile> = new Map([
  [
    "emp-001",
    {
      id: "emp-001",
      status: "ACTIVE",
      personal: {
        firstName: "Elena",
        lastName: "Vance",
        preferredName: "Elena",
        dateOfBirth: "1982-06-14",
        gender: "Female",
        maritalStatus: "Married",
        nationality: "American",
        personalEmail: "elena.vance@personal.io",
        personalPhone: "+1 (415) 555-0101",
        emergencyContact: {
          name: "Thomas Vance",
          relationship: "Spouse",
          phone: "+1 (415) 555-0199",
          email: "thomas.vance@family.com",
        },
        residentialAddress: {
          street: "742 Evergreen Terrace",
          city: "San Francisco",
          state: "CA",
          postalCode: "94109",
          country: "United States",
        },
      },
      job: {
        employeeNumber: "MX-1001",
        positionCode: "POS-EXEC-001",
        jobTitle: "Chief Executive Officer",
        department: "Executive",
        division: "Executive Leadership",
        businessUnit: "Global Enterprise Group",
        legalEntity: "MAX Global Holdings Inc.",
        workLocation: "HEADQUARTERS",
        managerId: "",
        managerName: "Board of Directors",
        employmentType: "FULL_TIME",
        jobLevel: "C-LEVEL",
        hireDate: "2021-03-15",
        probationEndDate: "2021-09-15",
        standardWeeklyHours: 40,
        flsaStatus: "EXEMPT",
      },
      compensation: {
        annualBaseSalary: 420000,
        currency: "USD",
        payFrequency: "SEMI_MONTHLY",
        bonusTargetPct: 40,
        equityGrantShares: 150000,
        vestingSchedule: "4-Year Monthly Vesting",
        payGradeBand: { min: 350000, mid: 400000, max: 450000 },
        compaRatio: 1.05,
        healthPlan: "MAX Executive Platinum Comprehensive PPO",
        retirementPlan: "401(k) with 6% Maximum Corporate Match",
      },
      workAuthorization: {
        citizenship: "United States",
        passportNumberMasked: "US-******742",
        passportCountry: "USA",
        workPermitType: "US_CITIZEN",
        permitExpiryDate: "2032-05-20",
        i9VerificationStatus: "VERIFIED",
        bgvStatus: "CLEARED",
        bgvClearedDate: "2021-03-10",
        complianceSignOffDate: "2021-03-15",
      },
      directDeposit: {
        bankName: "JPMorgan Chase Bank, N.A.",
        routingNumberMasked: "******021",
        accountNumberMasked: "******8841",
        accountType: "CHECKING",
        depositAllocationPct: 100,
      },
      leaveBalances: makeDefaultLeaveBalances(28, 15),
      timeline: [
        {
          id: "tl-001",
          timestamp: "2021-03-15T09:00:00Z",
          eventType: "HIRED",
          title: "Appointed Chief Executive Officer",
          description: "Elected by Board of Directors to lead MAX ERP global strategy.",
          performedBy: "Board of Directors",
          effectiveDate: "2021-03-15",
        },
        {
          id: "tl-002",
          timestamp: "2023-01-01T00:00:00Z",
          eventType: "COMPENSATION_REVISION",
          title: "Executive Compensation Adjustment",
          description: "Base compensation adjusted to $420,000 for sustained multi-tenant growth.",
          performedBy: "Compensation Committee",
          effectiveDate: "2023-01-01",
          previousValue: "$380,000",
          newValue: "$420,000",
        },
      ],
    },
  ],
  [
    "emp-002",
    {
      id: "emp-002",
      status: "ACTIVE",
      personal: {
        firstName: "Marcus",
        lastName: "Chen",
        preferredName: "Marcus",
        dateOfBirth: "1985-09-22",
        gender: "Male",
        maritalStatus: "Single",
        nationality: "American",
        personalEmail: "marcus.chen@techmail.io",
        personalPhone: "+1 (415) 555-0102",
        emergencyContact: {
          name: "Linda Chen",
          relationship: "Sister",
          phone: "+1 (415) 555-0188",
          email: "linda.chen@family.com",
        },
        residentialAddress: {
          street: "108 Market Street",
          city: "San Francisco",
          state: "CA",
          postalCode: "94105",
          country: "United States",
        },
      },
      job: {
        employeeNumber: "MX-1002",
        positionCode: "POS-ENG-001",
        jobTitle: "Chief Technology Officer",
        department: "Engineering",
        division: "Cloud Infrastructure & Platforms",
        businessUnit: "Enterprise Cloud & AI",
        legalEntity: "MAX Technologies Corp (US)",
        workLocation: "HEADQUARTERS",
        managerId: "emp-001",
        managerName: "Elena Vance",
        employmentType: "FULL_TIME",
        jobLevel: "C-LEVEL",
        hireDate: "2021-06-01",
        probationEndDate: "2021-12-01",
        standardWeeklyHours: 40,
        flsaStatus: "EXEMPT",
      },
      compensation: {
        annualBaseSalary: 310000,
        currency: "USD",
        payFrequency: "SEMI_MONTHLY",
        bonusTargetPct: 30,
        equityGrantShares: 90000,
        vestingSchedule: "4-Year Monthly Vesting",
        payGradeBand: { min: 280000, mid: 310000, max: 340000 },
        compaRatio: 1.0,
        healthPlan: "MAX Executive Platinum Comprehensive PPO",
        retirementPlan: "401(k) with 6% Maximum Corporate Match",
      },
      workAuthorization: {
        citizenship: "United States",
        passportNumberMasked: "US-******912",
        passportCountry: "USA",
        workPermitType: "US_CITIZEN",
        permitExpiryDate: "2031-11-15",
        i9VerificationStatus: "VERIFIED",
        bgvStatus: "CLEARED",
        bgvClearedDate: "2021-05-25",
        complianceSignOffDate: "2021-06-01",
      },
      directDeposit: {
        bankName: "Silicon Valley Bank (First Citizens)",
        routingNumberMasked: "******120",
        accountNumberMasked: "******4412",
        accountType: "CHECKING",
        depositAllocationPct: 100,
      },
      leaveBalances: makeDefaultLeaveBalances(25, 12),
      timeline: [
        {
          id: "tl-101",
          timestamp: "2021-06-01T09:00:00Z",
          eventType: "HIRED",
          title: "Joined as Chief Technology Officer",
          description: "Initiated Next-Gen MAX ERP platform engineering and multi-cloud roadmap.",
          performedBy: "Elena Vance",
          effectiveDate: "2021-06-01",
        },
      ],
    },
  ],
  [
    "emp-005",
    {
      id: "emp-005",
      status: "ACTIVE",
      personal: {
        firstName: "Priya",
        lastName: "Sharma",
        preferredName: "Priya",
        dateOfBirth: "1988-11-04",
        gender: "Female",
        maritalStatus: "Married",
        nationality: "Indian",
        personalEmail: "priya.sharma@cloudtech.dev",
        personalPhone: "+1 (415) 555-0105",
        emergencyContact: {
          name: "Rajesh Sharma",
          relationship: "Spouse",
          phone: "+1 (415) 555-0177",
          email: "rajesh.sharma@family.com",
        },
        residentialAddress: {
          street: "320 Fremont Street",
          city: "San Francisco",
          state: "CA",
          postalCode: "94105",
          country: "United States",
        },
      },
      job: {
        employeeNumber: "MX-1005",
        positionCode: "POS-ENG-002",
        jobTitle: "Lead Systems Architect",
        department: "Engineering",
        division: "Cloud Infrastructure & Platforms",
        businessUnit: "Enterprise Cloud & AI",
        legalEntity: "MAX Technologies Corp (US)",
        workLocation: "REMOTE",
        managerId: "emp-002",
        managerName: "Marcus Chen",
        employmentType: "FULL_TIME",
        jobLevel: "IC-5",
        hireDate: "2022-04-18",
        probationEndDate: "2022-10-18",
        standardWeeklyHours: 40,
        flsaStatus: "EXEMPT",
      },
      compensation: {
        annualBaseSalary: 205000,
        currency: "USD",
        payFrequency: "BI_WEEKLY",
        bonusTargetPct: 20,
        equityGrantShares: 35000,
        vestingSchedule: "4-Year with 1-Year Cliff",
        payGradeBand: { min: 180000, mid: 200000, max: 220000 },
        compaRatio: 1.025,
        healthPlan: "MAX Platinum Gold PPO",
        retirementPlan: "401(k) with 6% Maximum Corporate Match",
      },
      workAuthorization: {
        citizenship: "India",
        passportNumberMasked: "IN-******621",
        passportCountry: "IND",
        workPermitType: "H1B_SPECIALTY",
        permitExpiryDate: "2028-09-30",
        i9VerificationStatus: "VERIFIED",
        bgvStatus: "CLEARED",
        bgvClearedDate: "2022-04-10",
        complianceSignOffDate: "2022-04-18",
      },
      directDeposit: {
        bankName: "Bank of America, N.A.",
        routingNumberMasked: "******456",
        accountNumberMasked: "******9082",
        accountType: "CHECKING",
        depositAllocationPct: 100,
      },
      leaveBalances: makeDefaultLeaveBalances(22, 12),
      timeline: [
        {
          id: "tl-201",
          timestamp: "2022-04-18T09:00:00Z",
          eventType: "HIRED",
          title: "Onboarded as Senior Distributed Architect",
          description: "Joined Core Systems Engineering team.",
          performedBy: "Marcus Chen",
          effectiveDate: "2022-04-18",
        },
        {
          id: "tl-202",
          timestamp: "2024-03-01T00:00:00Z",
          eventType: "PROMOTION",
          title: "Promoted to Lead Systems Architect",
          description: "Promoted to IC-5 Staff Level for outstanding distributed consensus design.",
          performedBy: "Marcus Chen",
          effectiveDate: "2024-03-01",
          previousValue: "Senior Distributed Architect ($185k)",
          newValue: "Lead Systems Architect ($205k)",
        },
      ],
    },
  ],
  [
    "emp-006",
    {
      id: "emp-006",
      status: "ACTIVE",
      personal: {
        firstName: "Alex",
        lastName: "Morgan",
        preferredName: "Alex",
        dateOfBirth: "1992-03-19",
        gender: "Non-Binary",
        maritalStatus: "Single",
        nationality: "American",
        personalEmail: "alex.morgan@codelabs.org",
        personalPhone: "+1 (415) 555-0106",
        emergencyContact: {
          name: "Taylor Morgan",
          relationship: "Parent",
          phone: "+1 (415) 555-0166",
          email: "taylor.morgan@family.com",
        },
        residentialAddress: {
          street: "550 Battery Street",
          city: "San Francisco",
          state: "CA",
          postalCode: "94111",
          country: "United States",
        },
      },
      job: {
        employeeNumber: "MX-1006",
        positionCode: "POS-ENG-003",
        jobTitle: "Senior Full-Stack Engineer",
        department: "Engineering",
        division: "Cloud Infrastructure & Platforms",
        businessUnit: "Enterprise Cloud & AI",
        legalEntity: "MAX Technologies Corp (US)",
        workLocation: "REMOTE",
        managerId: "emp-005",
        managerName: "Priya Sharma",
        employmentType: "FULL_TIME",
        jobLevel: "IC-4",
        hireDate: "2023-02-01",
        probationEndDate: "2023-08-01",
        standardWeeklyHours: 40,
        flsaStatus: "EXEMPT",
      },
      compensation: {
        annualBaseSalary: 165000,
        currency: "USD",
        payFrequency: "BI_WEEKLY",
        bonusTargetPct: 15,
        equityGrantShares: 18000,
        vestingSchedule: "4-Year with 1-Year Cliff",
        payGradeBand: { min: 140000, mid: 160000, max: 175000 },
        compaRatio: 1.031,
        healthPlan: "MAX Platinum Gold PPO",
        retirementPlan: "401(k) with 6% Maximum Corporate Match",
      },
      workAuthorization: {
        citizenship: "United States",
        passportNumberMasked: "US-******334",
        passportCountry: "USA",
        workPermitType: "US_CITIZEN",
        permitExpiryDate: "2033-01-20",
        i9VerificationStatus: "VERIFIED",
        bgvStatus: "CLEARED",
        bgvClearedDate: "2023-01-20",
        complianceSignOffDate: "2023-02-01",
      },
      directDeposit: {
        bankName: "Wells Fargo Bank, N.A.",
        routingNumberMasked: "******789",
        accountNumberMasked: "******1120",
        accountType: "CHECKING",
        depositAllocationPct: 100,
      },
      leaveBalances: makeDefaultLeaveBalances(20, 12),
      timeline: [
        {
          id: "tl-301",
          timestamp: "2023-02-01T09:00:00Z",
          eventType: "HIRED",
          title: "Onboarded as Senior Full-Stack Engineer",
          description: "Hired to drive Next.js UI integration and GraphQL backend federation.",
          performedBy: "Priya Sharma",
          effectiveDate: "2023-02-01",
        },
      ],
    },
  ],
]);

// ----------------------------------------------------------------------------
// SEED DATA: TIME OFF REQUESTS
// ----------------------------------------------------------------------------
let leaveRequests: LeaveRequest[] = [
  {
    id: "lev-001",
    employeeId: "emp-005",
    employeeName: "Priya Sharma",
    department: "Engineering",
    leaveType: "VACATION",
    startDate: "2026-11-10",
    endDate: "2026-11-14",
    totalDays: 5,
    reason: "Annual family vacation and rest.",
    status: "APPROVED",
    requestedAt: "2026-10-01T10:00:00Z",
    reviewerName: "Marcus Chen",
    reviewNotes: "Approved. Handover coverage aligned with Alex Morgan.",
    reviewedAt: "2026-10-02T14:30:00Z",
  },
  {
    id: "lev-002",
    employeeId: "emp-006",
    employeeName: "Alex Morgan",
    department: "Engineering",
    leaveType: "FLOATING",
    startDate: "2026-10-24",
    endDate: "2026-10-24",
    totalDays: 1,
    reason: "Personal wellness floating holiday.",
    status: "PENDING",
    requestedAt: "2026-10-18T08:15:00Z",
  },
  {
    id: "lev-003",
    employeeId: "emp-002",
    employeeName: "Marcus Chen",
    department: "Engineering",
    leaveType: "STUDY",
    startDate: "2026-11-02",
    endDate: "2026-11-04",
    totalDays: 3,
    reason: "Attending Enterprise Distributed Cloud Summit keynote.",
    status: "APPROVED",
    requestedAt: "2026-09-28T11:00:00Z",
    reviewerName: "Elena Vance",
    reviewNotes: "Approved executive conference participation.",
    reviewedAt: "2026-09-29T16:00:00Z",
  },
];

// ----------------------------------------------------------------------------
// SEED DATA: HIRE-TO-RETIRE (H2R) TRANSITIONS
// ----------------------------------------------------------------------------
let h2rTransitions: H2RTransition[] = [
  {
    id: "h2r-001",
    employeeId: "emp-005",
    employeeName: "Priya Sharma",
    transitionType: "PROMOTION",
    effectiveDate: "2024-03-01",
    status: "COMPLETED",
    details: {
      positionCodeBefore: "POS-ENG-003",
      positionCodeAfter: "POS-ENG-002",
      departmentBefore: "Engineering",
      departmentAfter: "Engineering",
      managerBefore: "Marcus Chen",
      managerAfter: "Marcus Chen",
      salaryBefore: 185000,
      salaryAfter: 205000,
    },
    initiatedBy: "Marcus Chen",
    initiatedAt: "2024-02-15T10:00:00Z",
    notes: "Promoted to IC-5 Staff Level following outstanding system architecture leadership.",
  },
  {
    id: "h2r-002",
    employeeId: "emp-006",
    employeeName: "Alex Morgan",
    transitionType: "NEW_HIRE",
    effectiveDate: "2023-02-01",
    status: "COMPLETED",
    details: {
      sourceRequisitionId: "req-101",
      candidateId: "cand-201",
      positionCodeAfter: "POS-ENG-003",
      departmentAfter: "Engineering",
      managerAfter: "Priya Sharma",
      salaryAfter: 165000,
      checklistCompleted: true,
    },
    initiatedBy: "Rachel Green",
    initiatedAt: "2023-01-20T14:30:00Z",
    notes: "Successfully converted from candidate pipeline to active employee.",
  },
];

// ============================================================================
// EXPORTED STORE INTERACTION METHODS
// ============================================================================

export const ecCoreStore = {
  // POSITIONS
  getPositions(filters?: { department?: string; status?: string; search?: string }): Position[] {
    return positions.filter((p) => {
      if (filters?.department && filters.department !== "ALL" && p.department.toLowerCase() !== filters.department.toLowerCase()) return false;
      if (filters?.status && filters.status !== "ALL" && p.status !== filters.status) return false;
      if (filters?.search) {
        const q = filters.search.toLowerCase();
        return (
          p.positionCode.toLowerCase().includes(q) ||
          p.title.toLowerCase().includes(q) ||
          p.department.toLowerCase().includes(q) ||
          (p.incumbentName && p.incumbentName.toLowerCase().includes(q))
        );
      }
      return true;
    });
  },

  getPositionByCode(code: string): Position | undefined {
    return positions.find((p) => p.positionCode.toLowerCase() === code.toLowerCase() || p.id === code);
  },

  createPosition(data: Partial<Position>): Position {
    const nextSeq = positions.length + 1;
    const prefix = data.department ? data.department.substring(0, 3).toUpperCase() : "GEN";
    const code = data.positionCode || `POS-${prefix}-${String(nextSeq).padStart(3, "0")}`;
    const newPos: Position = {
      id: `pos-${Date.now()}`,
      positionCode: code,
      title: data.title || "Untitled Position",
      department: data.department || "Engineering",
      division: data.division || "Cloud Infrastructure & Platforms",
      businessUnit: data.businessUnit || "Enterprise Cloud & AI",
      legalEntity: data.legalEntity || "MAX Technologies Corp (US)",
      location: data.location || "REMOTE",
      jobLevel: data.jobLevel || "IC-4",
      jobBand: data.jobBand || "Band 4",
      fte: data.fte !== undefined ? data.fte : 1.0,
      targetHeadcount: data.targetHeadcount || 1,
      currentHeadcount: data.status === "FILLED" ? 1 : 0,
      status: data.status || "VACANT",
      costCenter: data.costCenter || "CC-ENG-101",
      reportsToPositionCode: data.reportsToPositionCode || null,
      reportsToTitle: data.reportsToTitle || null,
      incumbentId: data.incumbentId || null,
      incumbentName: data.incumbentName || null,
      vacantSince: data.status === "VACANT" ? new Date().toISOString() : null,
      requisitionId: data.requisitionId || null,
      salaryRange: data.salaryRange || { min: 130000, max: 170000, currency: "USD" },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    positions.unshift(newPos);
    return newPos;
  },

  updatePosition(codeOrId: string, updates: Partial<Position>): Position | null {
    const pos = positions.find((p) => p.positionCode === codeOrId || p.id === codeOrId);
    if (!pos) return null;
    Object.assign(pos, updates, { updatedAt: new Date().toISOString() });
    if (updates.status === "FILLED") pos.currentHeadcount = 1;
    if (updates.status === "VACANT") {
      pos.currentHeadcount = 0;
      pos.incumbentId = null;
      pos.incumbentName = null;
      pos.vacantSince = new Date().toISOString();
    }
    return pos;
  },

  vacatePosition(codeOrId: string): Position | null {
    return this.updatePosition(codeOrId, { status: "VACANT", incumbentId: null, incumbentName: null });
  },

  getPositionHierarchy(): any {
    const posMap = new Map<string, any>();
    positions.forEach((p) => {
      posMap.set(p.positionCode, { ...p, children: [] });
    });

    const roots: any[] = [];
    positions.forEach((p) => {
      const node = posMap.get(p.positionCode);
      if (p.reportsToPositionCode && posMap.has(p.reportsToPositionCode)) {
        posMap.get(p.reportsToPositionCode).children.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  },

  // ORG STRUCTURE
  getOrgEntities(): OrgEntity[] {
    return orgEntities;
  },

  createOrgEntity(data: Partial<OrgEntity>): OrgEntity {
    const newEntity: OrgEntity = {
      id: `ent-${Date.now()}`,
      code: data.code || `ENT-${Date.now().toString().slice(-4)}`,
      name: data.name || "New Organizational Unit",
      type: data.type || "DEPARTMENT",
      parentId: data.parentId || null,
      parentCode: data.parentCode || null,
      headName: data.headName,
      headTitle: data.headTitle,
      headcount: data.headcount || 0,
      budgetUsd: data.budgetUsd || 0,
      country: data.country,
      currency: data.currency,
      description: data.description,
    };
    orgEntities.push(newEntity);
    return newEntity;
  },

  // PEOPLE PROFILE
  getPeopleProfiles(search?: string, department?: string): PeopleProfile[] {
    let list = Array.from(peopleProfiles.values());
    if (department && department !== "ALL") {
      list = list.filter((p) => p.job.department.toLowerCase() === department.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.personal.firstName.toLowerCase().includes(q) ||
          p.personal.lastName.toLowerCase().includes(q) ||
          p.job.jobTitle.toLowerCase().includes(q) ||
          p.job.employeeNumber.toLowerCase().includes(q) ||
          p.job.positionCode.toLowerCase().includes(q)
      );
    }
    return list;
  },

  getPeopleProfileById(idOrEmpNo: string): PeopleProfile | null {
    if (peopleProfiles.has(idOrEmpNo)) {
      return peopleProfiles.get(idOrEmpNo)!;
    }
    for (const p of peopleProfiles.values()) {
      if (p.job.employeeNumber.toLowerCase() === idOrEmpNo.toLowerCase()) {
        return p;
      }
    }
    return null;
  },

  updatePeopleProfile(id: string, updates: Partial<PeopleProfile>): PeopleProfile | null {
    const existing = this.getPeopleProfileById(id);
    if (!existing) return null;
    if (updates.personal) Object.assign(existing.personal, updates.personal);
    if (updates.job) Object.assign(existing.job, updates.job);
    if (updates.compensation) Object.assign(existing.compensation, updates.compensation);
    if (updates.workAuthorization) Object.assign(existing.workAuthorization, updates.workAuthorization);
    if (updates.directDeposit) Object.assign(existing.directDeposit, updates.directDeposit);
    if (updates.status) existing.status = updates.status;
    return existing;
  },

  addTimelineEvent(employeeId: string, event: Omit<TimelineEvent, "id">): TimelineEvent | null {
    const prof = this.getPeopleProfileById(employeeId);
    if (!prof) return null;
    const newEv: TimelineEvent = {
      ...event,
      id: `tl-${Date.now()}`,
    };
    prof.timeline.unshift(newEv);
    return newEv;
  },

  // TIME OFF
  getLeaveRequests(filters?: { employeeId?: string; status?: string }): LeaveRequest[] {
    return leaveRequests.filter((l) => {
      if (filters?.employeeId && l.employeeId !== filters.employeeId) return false;
      if (filters?.status && filters.status !== "ALL" && l.status !== filters.status) return false;
      return true;
    });
  },

  submitLeaveRequest(data: {
    employeeId: string;
    leaveType: "VACATION" | "SICK" | "PARENTAL" | "BEREAVEMENT" | "FLOATING" | "STUDY";
    startDate: string;
    endDate: string;
    totalDays: number;
    reason: string;
  }): LeaveRequest {
    const emp = this.getPeopleProfileById(data.employeeId);
    const newReq: LeaveRequest = {
      id: `lev-${Date.now().toString().slice(-6)}`,
      employeeId: data.employeeId,
      employeeName: emp ? `${emp.personal.firstName} ${emp.personal.lastName}` : "Employee",
      department: emp ? emp.job.department : "General",
      leaveType: data.leaveType,
      startDate: data.startDate,
      endDate: data.endDate,
      totalDays: data.totalDays,
      reason: data.reason,
      status: "PENDING",
      requestedAt: new Date().toISOString(),
    };
    leaveRequests.unshift(newReq);

    // Update pending balance in profile
    if (emp) {
      const balance = emp.leaveBalances.find((b) => b.leaveType === data.leaveType);
      if (balance) {
        balance.pending += data.totalDays;
      }
    }

    return newReq;
  },

  reviewLeaveRequest(requestId: string, status: "APPROVED" | "REJECTED", reviewerName: string, notes?: string): LeaveRequest | null {
    const req = leaveRequests.find((l) => l.id === requestId);
    if (!req) return null;
    req.status = status;
    req.reviewerName = reviewerName;
    req.reviewNotes = notes;
    req.reviewedAt = new Date().toISOString();

    const emp = this.getPeopleProfileById(req.employeeId);
    if (emp) {
      const balance = emp.leaveBalances.find((b) => b.leaveType === req.leaveType);
      if (balance) {
        balance.pending = Math.max(0, balance.pending - req.totalDays);
        if (status === "APPROVED") {
          balance.taken += req.totalDays;
          balance.availableBalance = Math.max(0, balance.availableBalance - req.totalDays);
        }
      }
    }

    return req;
  },

  // HIRE-TO-RETIRE (H2R) LIFECYCLE
  getH2RTransitions(): H2RTransition[] {
    return h2rTransitions;
  },

  // 1. CONVERT CANDIDATE TO ACTIVE EMPLOYEE
  hireCandidate(data: {
    candidateId: string;
    candidateName: string;
    email: string;
    phone?: string;
    positionCode: string;
    requisitionId?: string;
    department?: string;
    jobTitle?: string;
    managerName?: string;
    annualSalary?: number;
    startDate?: string;
    workAuthorization?: string;
  }): { employee: PeopleProfile; position: Position; transition: H2RTransition } {
    const nextNum = 1000 + peopleProfiles.size + 1;
    const employeeNumber = `MX-${nextNum}`;
    const empId = `emp-${Date.now().toString().slice(-4)}`;

    const names = data.candidateName.trim().split(" ");
    const firstName = names[0] || "New";
    const lastName = names.slice(1).join(" ") || "Employee";

    // Update target position
    let targetPos = positions.find((p) => p.positionCode === data.positionCode);
    if (!targetPos) {
      // Find first vacant position or create one
      targetPos = positions.find((p) => p.status === "VACANT") || positions[positions.length - 1];
    }

    if (targetPos) {
      targetPos.status = "FILLED";
      targetPos.currentHeadcount = 1;
      targetPos.incumbentId = empId;
      targetPos.incumbentName = data.candidateName;
      targetPos.vacantSince = null;
    }

    const newProfile: PeopleProfile = {
      id: empId,
      status: "ACTIVE",
      personal: {
        firstName,
        lastName,
        preferredName: firstName,
        dateOfBirth: "1994-08-20",
        gender: "Prefer not to disclose",
        maritalStatus: "Single",
        nationality: "American",
        personalEmail: data.email,
        personalPhone: data.phone || "+1 (555) 019-8234",
        emergencyContact: {
          name: `${firstName} Emergency Contact`,
          relationship: "Family",
          phone: "+1 (555) 019-9999",
          email: `emergency.${data.email}`,
        },
        residentialAddress: {
          street: "123 Innovation Way",
          city: "San Francisco",
          state: "CA",
          postalCode: "94107",
          country: "United States",
        },
      },
      job: {
        employeeNumber,
        positionCode: targetPos ? targetPos.positionCode : data.positionCode,
        jobTitle: data.jobTitle || (targetPos ? targetPos.title : "Systems Specialist"),
        department: data.department || (targetPos ? targetPos.department : "Engineering"),
        division: targetPos ? targetPos.division : "Cloud Infrastructure & Platforms",
        businessUnit: targetPos ? targetPos.businessUnit : "Enterprise Cloud & AI",
        legalEntity: targetPos ? targetPos.legalEntity : "MAX Technologies Corp (US)",
        workLocation: targetPos ? targetPos.location : "HEADQUARTERS",
        managerId: "emp-002",
        managerName: data.managerName || "Marcus Chen",
        employmentType: "FULL_TIME",
        jobLevel: targetPos ? targetPos.jobLevel : "IC-4",
        hireDate: data.startDate || new Date().toISOString().split("T")[0],
        probationEndDate: new Date(Date.now() + 180 * 86400000).toISOString().split("T")[0],
        standardWeeklyHours: 40,
        flsaStatus: "EXEMPT",
      },
      compensation: {
        annualBaseSalary: data.annualSalary || 165000,
        currency: "USD",
        payFrequency: "BI_WEEKLY",
        bonusTargetPct: 15,
        equityGrantShares: 15000,
        vestingSchedule: "4-Year Standard Vesting, 1-Year Cliff",
        payGradeBand: { min: 140000, mid: 165000, max: 185000 },
        compaRatio: 1.0,
        healthPlan: "MAX Platinum Comprehensive HMO",
        retirementPlan: "401(k) with 6% Maximum Corporate Match",
      },
      workAuthorization: {
        citizenship: "United States",
        passportNumberMasked: "US-******882",
        passportCountry: "USA",
        workPermitType: (data.workAuthorization as any) || "US_CITIZEN",
        permitExpiryDate: "2034-01-01",
        i9VerificationStatus: "VERIFIED",
        bgvStatus: "CLEARED",
        bgvClearedDate: new Date().toISOString().split("T")[0],
        complianceSignOffDate: new Date().toISOString().split("T")[0],
      },
      directDeposit: {
        bankName: "JPMorgan Chase Bank, N.A.",
        routingNumberMasked: "******441",
        accountNumberMasked: "******7723",
        accountType: "CHECKING",
        depositAllocationPct: 100,
      },
      leaveBalances: makeDefaultLeaveBalances(25, 12),
      timeline: [
        {
          id: `tl-${Date.now()}`,
          timestamp: new Date().toISOString(),
          eventType: "HIRED",
          title: `Hired as ${targetPos ? targetPos.title : "Employee"}`,
          description: `Converted from Candidate Offer Acceptance into EC Core. Assigned Position ${targetPos ? targetPos.positionCode : data.positionCode}.`,
          performedBy: "Talent Acquisition & EC Core",
          effectiveDate: data.startDate || new Date().toISOString().split("T")[0],
        },
      ],
    };

    peopleProfiles.set(empId, newProfile);

    const transition: H2RTransition = {
      id: `h2r-${Date.now().toString().slice(-5)}`,
      employeeId: empId,
      employeeName: data.candidateName,
      transitionType: "NEW_HIRE",
      effectiveDate: data.startDate || new Date().toISOString().split("T")[0],
      status: "COMPLETED",
      details: {
        candidateId: data.candidateId,
        sourceRequisitionId: data.requisitionId,
        positionCodeAfter: targetPos ? targetPos.positionCode : data.positionCode,
        departmentAfter: newProfile.job.department,
        managerAfter: newProfile.job.managerName,
        salaryAfter: newProfile.compensation.annualBaseSalary,
        checklistCompleted: true,
      },
      initiatedBy: "EC Core Lifecycle Automation",
      initiatedAt: new Date().toISOString(),
      notes: `Successfully onboarded from RCM into Employee Central Core.`,
    };

    h2rTransitions.unshift(transition);

    return { employee: newProfile, position: targetPos!, transition };
  },

  // 2. JOB CHANGE / PROMOTION / TRANSFER
  executeJobChange(data: {
    employeeId: string;
    newPositionCode: string;
    newDepartment?: string;
    newJobTitle?: string;
    newSalary?: number;
    newManagerName?: string;
    changeReason: "PROMOTION" | "TRANSFER" | "LATERAL_MOVE";
    effectiveDate: string;
    notes?: string;
  }): { employee: PeopleProfile; transition: H2RTransition } | null {
    const emp = this.getPeopleProfileById(data.employeeId);
    if (!emp) return null;

    const oldPosCode = emp.job.positionCode;
    const oldSalary = emp.compensation.annualBaseSalary;
    const oldDept = emp.job.department;
    const oldManager = emp.job.managerName;

    // Vacate previous position
    const oldPos = positions.find((p) => p.positionCode === oldPosCode);
    if (oldPos && oldPos.incumbentId === emp.id) {
      oldPos.status = "VACANT";
      oldPos.currentHeadcount = 0;
      oldPos.incumbentId = null;
      oldPos.incumbentName = null;
      oldPos.vacantSince = new Date().toISOString();
    }

    // Fill new position
    const newPos = positions.find((p) => p.positionCode === data.newPositionCode);
    if (newPos) {
      newPos.status = "FILLED";
      newPos.currentHeadcount = 1;
      newPos.incumbentId = emp.id;
      newPos.incumbentName = `${emp.personal.firstName} ${emp.personal.lastName}`;
      newPos.vacantSince = null;
    }

    // Update employee profile
    emp.job.positionCode = data.newPositionCode;
    if (data.newJobTitle) emp.job.jobTitle = data.newJobTitle;
    else if (newPos) emp.job.jobTitle = newPos.title;

    if (data.newDepartment) emp.job.department = data.newDepartment;
    else if (newPos) emp.job.department = newPos.department;

    if (data.newManagerName) emp.job.managerName = data.newManagerName;
    if (data.newSalary) {
      emp.compensation.annualBaseSalary = data.newSalary;
      emp.compensation.compaRatio = Math.round((data.newSalary / emp.compensation.payGradeBand.mid) * 1000) / 1000;
    }

    // Timeline event
    this.addTimelineEvent(emp.id, {
      timestamp: new Date().toISOString(),
      eventType: data.changeReason === "PROMOTION" ? "PROMOTION" : "TRANSFER",
      title: `${data.changeReason === "PROMOTION" ? "Promoted to" : "Transferred to"} ${emp.job.jobTitle}`,
      description: `Transitioned to Position ${data.newPositionCode} within ${emp.job.department}. Reason: ${data.notes || data.changeReason}.`,
      performedBy: "Executive Management",
      effectiveDate: data.effectiveDate,
      previousValue: `${oldPosCode} ($${oldSalary.toLocaleString()})`,
      newValue: `${data.newPositionCode} ($${emp.compensation.annualBaseSalary.toLocaleString()})`,
    });

    const transition: H2RTransition = {
      id: `h2r-${Date.now().toString().slice(-5)}`,
      employeeId: emp.id,
      employeeName: `${emp.personal.firstName} ${emp.personal.lastName}`,
      transitionType: data.changeReason === "PROMOTION" ? "PROMOTION" : "TRANSFER",
      effectiveDate: data.effectiveDate,
      status: "COMPLETED",
      details: {
        positionCodeBefore: oldPosCode,
        positionCodeAfter: data.newPositionCode,
        departmentBefore: oldDept,
        departmentAfter: emp.job.department,
        managerBefore: oldManager,
        managerAfter: emp.job.managerName,
        salaryBefore: oldSalary,
        salaryAfter: emp.compensation.annualBaseSalary,
      },
      initiatedBy: "EC Core Lifecycle Studio",
      initiatedAt: new Date().toISOString(),
      notes: data.notes || `Completed ${data.changeReason}.`,
    };

    h2rTransitions.unshift(transition);
    return { employee: emp, transition };
  },

  // 3. LEAVE OF ABSENCE / RETURN
  toggleLeaveOfAbsence(employeeId: string, action: "START_LEAVE" | "RETURN_FROM_LEAVE", effectiveDate: string, reason?: string): PeopleProfile | null {
    const emp = this.getPeopleProfileById(employeeId);
    if (!emp) return null;

    if (action === "START_LEAVE") {
      emp.status = "ON_LEAVE";
      this.addTimelineEvent(emp.id, {
        timestamp: new Date().toISOString(),
        eventType: "LEAVE_OF_ABSENCE",
        title: "Placed on Leave of Absence",
        description: reason || "Employee initiated approved temporary leave of absence.",
        performedBy: "People Operations",
        effectiveDate,
      });
    } else {
      emp.status = "ACTIVE";
      this.addTimelineEvent(emp.id, {
        timestamp: new Date().toISOString(),
        eventType: "RETURN_FROM_LEAVE",
        title: "Returned from Leave of Absence",
        description: "Employee reinstated to active workforce standing.",
        performedBy: "People Operations",
        effectiveDate,
      });
    }

    return emp;
  },

  // 4. RETIREMENT / SEPARATION
  retireOrSeparate(data: {
    employeeId: string;
    separationType: "RETIREMENT" | "RESIGNATION" | "MUTUAL_SEPARATION" | "SEPARATION";
    effectiveDate: string;
    reason: string;
    assetsReturned: string[];
    severancePayoutUsd?: number;
  }): { employee: PeopleProfile; vacatedPosition: Position | null; transition: H2RTransition } | null {
    const emp = this.getPeopleProfileById(data.employeeId);
    if (!emp) return null;

    const currentPosCode = emp.job.positionCode;
    emp.status = data.separationType === "RETIREMENT" ? "RETIRED" : "TERMINATED";

    // Vacate the position so recruitment can backfill!
    const pos = positions.find((p) => p.positionCode === currentPosCode);
    if (pos && pos.incumbentId === emp.id) {
      pos.status = "VACANT";
      pos.currentHeadcount = 0;
      pos.incumbentId = null;
      pos.incumbentName = null;
      pos.vacantSince = data.effectiveDate;
    }

    // Add timeline event
    this.addTimelineEvent(emp.id, {
      timestamp: new Date().toISOString(),
      eventType: data.separationType === "RETIREMENT" ? "RETIREMENT" : "SEPARATION",
      title: `${data.separationType === "RETIREMENT" ? "Honorable Retirement" : "Separation Completed"}`,
      description: `${data.reason}. Position ${currentPosCode} vacated for backfill. Assets returned: ${data.assetsReturned.join(", ")}.`,
      performedBy: "People Operations & Legal",
      effectiveDate: data.effectiveDate,
    });

    const transition: H2RTransition = {
      id: `h2r-${Date.now().toString().slice(-5)}`,
      employeeId: emp.id,
      employeeName: `${emp.personal.firstName} ${emp.personal.lastName}`,
      transitionType: data.separationType === "RETIREMENT" ? "RETIREMENT" : "SEPARATION",
      effectiveDate: data.effectiveDate,
      status: "COMPLETED",
      details: {
        positionCodeBefore: currentPosCode,
        departmentBefore: emp.job.department,
        separationReason: data.reason,
        checklistCompleted: true,
        assetsReturned: data.assetsReturned,
        severancePayoutUsd: data.severancePayoutUsd || 0,
      },
      initiatedBy: "EC Core Offboarding Engine",
      initiatedAt: new Date().toISOString(),
      notes: `${data.separationType} processed. Position ${currentPosCode} is now VACANT.`,
    };

    h2rTransitions.unshift(transition);

    return { employee: emp, vacatedPosition: pos || null, transition };
  },
};
