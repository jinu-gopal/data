import { NextRequest, NextResponse } from "next/server";

export interface JobLevelConfig {
  code: string;
  name: string;
  band: string;
  minSalaryUsd: number;
  midSalaryUsd: number;
  maxSalaryUsd: number;
}

export interface CustomFieldConfig {
  id: string;
  key: string;
  label: string;
  type: "TEXT" | "NUMBER" | "SELECT" | "DATE" | "BOOLEAN";
  section: "PERSONAL" | "JOB" | "COMPENSATION";
  required: boolean;
  options?: string[];
}

export interface LeaveTypePolicyConfig {
  code: string;
  name: string;
  annualDays: number;
  accrualMethod: "MONTHLY_ACCRUAL" | "ANNUAL_FRONTLOAD" | "EVENT_BASED";
  maxCarryoverDays: number;
  noticeDaysRequired: number;
  requiresAttachment: boolean;
  enabled: boolean;
}

export interface OnboardingChecklistConfig {
  id: string;
  taskName: string;
  category: "HR" | "IT" | "COMPLIANCE" | "PEOPLE";
  mandatory: boolean;
  enabled: boolean;
}

export interface EcCoreConfig {
  positions: {
    codePrefix: string;
    nextSequenceNumber: number;
    allowFractionalFte: boolean;
    autoTriggerRequisitionsOnVacancy: boolean;
    jobLevels: JobLevelConfig[];
  };
  orgStructure: {
    primaryCurrency: string;
    mandatoryCostCenterTagging: boolean;
    budgetVarianceAlertPct: number;
    enabledTiers: {
      tierKey: string;
      tierName: string;
      enabled: boolean;
      order: number;
    }[];
  };
  peopleProfile: {
    maskSensitiveData: boolean;
    i9VerificationWindowDays: number;
    defaultProbationDays: number;
    customFields: CustomFieldConfig[];
  };
  timeOff: {
    autoDeductBalancesOnApproval: boolean;
    allowHalfDayRequests: boolean;
    carryoverExpiryMonth: number;
    leaveTypes: LeaveTypePolicyConfig[];
  };
  hireToRetire: {
    employeeIdPrefix: string;
    nextEmployeeSequence: number;
    employeeIdLength: number;
    autoVacatePositionOnSeparation: boolean;
    onboardingChecklist: OnboardingChecklistConfig[];
    offboardingAssets: string[];
  };
}

let ecConfiguration: EcCoreConfig = {
  positions: {
    codePrefix: "POS-",
    nextSequenceNumber: 100,
    allowFractionalFte: true,
    autoTriggerRequisitionsOnVacancy: true,
    jobLevels: [
      { code: "C-LEVEL", name: "Chief Officer / Executive", band: "Band Executive", minSalaryUsd: 280000, midSalaryUsd: 360000, maxSalaryUsd: 450000 },
      { code: "M-2", name: "Director / Vice President", band: "Band 5 (Director)", minSalaryUsd: 190000, midSalaryUsd: 230000, maxSalaryUsd: 280000 },
      { code: "M-1", name: "Manager / Practice Lead", band: "Band 4 (Lead)", minSalaryUsd: 150000, midSalaryUsd: 180000, maxSalaryUsd: 210000 },
      { code: "IC-5", name: "Principal / Staff Specialist", band: "Band 5 (Staff)", minSalaryUsd: 175000, midSalaryUsd: 205000, maxSalaryUsd: 235000 },
      { code: "IC-4", name: "Senior Professional / Architect", band: "Band 4 (Senior)", minSalaryUsd: 140000, midSalaryUsd: 165000, maxSalaryUsd: 185000 },
      { code: "IC-3", name: "Mid-Level Professional", band: "Band 3 (Mid)", minSalaryUsd: 110000, midSalaryUsd: 125000, maxSalaryUsd: 145000 },
      { code: "IC-2", name: "Associate Specialist", band: "Band 2 (Associate)", minSalaryUsd: 85000, midSalaryUsd: 98000, maxSalaryUsd: 115000 },
    ],
  },
  orgStructure: {
    primaryCurrency: "USD",
    mandatoryCostCenterTagging: true,
    budgetVarianceAlertPct: 90,
    enabledTiers: [
      { tierKey: "LEGAL_ENTITY", tierName: "Legal Entity", enabled: true, order: 1 },
      { tierKey: "BUSINESS_UNIT", tierName: "Business Unit", enabled: true, order: 2 },
      { tierKey: "DIVISION", tierName: "Division", enabled: true, order: 3 },
      { tierKey: "DEPARTMENT", tierName: "Department", enabled: true, order: 4 },
      { tierKey: "LOCATION", tierName: "Work Location / Site", enabled: true, order: 5 },
      { tierKey: "COST_CENTER", tierName: "Cost Center", enabled: true, order: 6 },
    ],
  },
  peopleProfile: {
    maskSensitiveData: true,
    i9VerificationWindowDays: 3,
    defaultProbationDays: 180,
    customFields: [
      { id: "cf-01", key: "githubHandle", label: "Developer GitHub Profile", type: "TEXT", section: "PERSONAL", required: false },
      { id: "cf-02", key: "securityClearance", label: "Govt Security Clearance Level", type: "SELECT", section: "JOB", required: false, options: ["None", "Public Trust", "Secret", "Top Secret / SCI"] },
      { id: "cf-03", key: "cubicleLocation", label: "HQ Desk / Pod Number", type: "TEXT", section: "JOB", required: false },
      { id: "cf-04", key: "tshirtSize", label: "Company Swag Size", type: "SELECT", section: "PERSONAL", required: false, options: ["XS", "S", "M", "L", "XL", "2XL"] },
    ],
  },
  timeOff: {
    autoDeductBalancesOnApproval: true,
    allowHalfDayRequests: true,
    carryoverExpiryMonth: 3,
    leaveTypes: [
      { code: "VACATION", name: "Annual Paid Vacation", annualDays: 25, accrualMethod: "MONTHLY_ACCRUAL", maxCarryoverDays: 5, noticeDaysRequired: 7, requiresAttachment: false, enabled: true },
      { code: "SICK", name: "Medical & Health Absence", annualDays: 12, accrualMethod: "ANNUAL_FRONTLOAD", maxCarryoverDays: 0, noticeDaysRequired: 0, requiresAttachment: true, enabled: true },
      { code: "PARENTAL", name: "Global Parental Bonding Leave", annualDays: 60, accrualMethod: "EVENT_BASED", maxCarryoverDays: 0, noticeDaysRequired: 30, requiresAttachment: true, enabled: true },
      { code: "BEREAVEMENT", name: "Compassionate Leave", annualDays: 5, accrualMethod: "EVENT_BASED", maxCarryoverDays: 0, noticeDaysRequired: 0, requiresAttachment: false, enabled: true },
      { code: "FLOATING", name: "Floating Cultural / Wellness Holiday", annualDays: 3, accrualMethod: "ANNUAL_FRONTLOAD", maxCarryoverDays: 0, noticeDaysRequired: 2, requiresAttachment: false, enabled: true },
      { code: "STUDY", name: "Professional Development & Study", annualDays: 5, accrualMethod: "ANNUAL_FRONTLOAD", maxCarryoverDays: 0, noticeDaysRequired: 14, requiresAttachment: true, enabled: true },
    ],
  },
  hireToRetire: {
    employeeIdPrefix: "MX-",
    nextEmployeeSequence: 1007,
    employeeIdLength: 4,
    autoVacatePositionOnSeparation: true,
    onboardingChecklist: [
      { id: "chk-01", taskName: "Welcome & First-Day Itinerary Dispatched", category: "HR", mandatory: true, enabled: true },
      { id: "chk-02", taskName: "I-9 / Right to Work Statutory Documents Uploaded", category: "COMPLIANCE", mandatory: true, enabled: true },
      { id: "chk-03", taskName: "Direct Deposit Bank Details & Tax Withholdings (W-4)", category: "HR", mandatory: true, enabled: true },
      { id: "chk-04", taskName: "Confidentiality & IP Assignment Agreement Signed", category: "COMPLIANCE", mandatory: true, enabled: true },
      { id: "chk-05", taskName: "Corporate Laptop & Security Hardware Provisioned", category: "IT", mandatory: true, enabled: true },
      { id: "chk-06", taskName: "Corporate SSO & Cloud Email Provisioned", category: "IT", mandatory: true, enabled: true },
      { id: "chk-07", taskName: "Departmental Peer Orientation Buddy Assigned", category: "PEOPLE", mandatory: false, enabled: true },
    ],
    offboardingAssets: [
      "Corporate MacBook / Laptop",
      "Security Building Badge / FOB",
      "Corporate Travel Credit Card",
      "Single Sign-On (SSO) & Cloud Access Revocation",
    ],
  },
};

export async function GET() {
  return NextResponse.json(ecConfiguration);
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.positions) {
      ecConfiguration.positions = {
        ...ecConfiguration.positions,
        ...body.positions,
      };
    }

    if (body.orgStructure) {
      ecConfiguration.orgStructure = {
        ...ecConfiguration.orgStructure,
        ...body.orgStructure,
      };
    }

    if (body.peopleProfile) {
      ecConfiguration.peopleProfile = {
        ...ecConfiguration.peopleProfile,
        ...body.peopleProfile,
      };
    }

    if (body.timeOff) {
      ecConfiguration.timeOff = {
        ...ecConfiguration.timeOff,
        ...body.timeOff,
      };
    }

    if (body.hireToRetire) {
      ecConfiguration.hireToRetire = {
        ...ecConfiguration.hireToRetire,
        ...body.hireToRetire,
      };
    }

    return NextResponse.json({
      success: true,
      message: "EC Core configuration updated successfully.",
      configuration: ecConfiguration,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "FAILED_TO_UPDATE_EC_CONFIG", message: err.message },
      { status: 400 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    ecConfiguration = body;
    return NextResponse.json({
      success: true,
      message: "EC Core configuration replaced successfully.",
      configuration: ecConfiguration,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "FAILED_TO_REPLACE_EC_CONFIG", message: err.message },
      { status: 400 }
    );
  }
}
