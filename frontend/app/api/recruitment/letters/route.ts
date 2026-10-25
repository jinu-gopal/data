import { NextRequest, NextResponse } from "next/server";

export interface LetterTemplate {
  id: string;
  code: string;
  title: string;
  category: 
    | "ENGINEERING" 
    | "EXECUTIVE" 
    | "PRODUCT" 
    | "SALES" 
    | "HR" 
    | "REMOTE_CONTRACT" 
    | "INTERNSHIP" 
    | "APPOINTMENT" 
    | "PROMOTION_COMP" 
    | "LEGAL_SEPARATION";
  jurisdiction: "US" | "UK" | "GERMANY" | "INDIA" | "SINGAPORE" | "GLOBAL_REMOTE";
  level: "ENTRY" | "MID" | "SENIOR" | "LEAD" | "EXECUTIVE" | "DIRECTOR";
  employmentType: "FULL_TIME" | "PART_TIME" | "CONTRACTOR" | "INTERN" | "EXECUTIVE";
  subject: string;
  summary: string;
  body: string;
  supportedMergeTags: string[];
  mandatoryClauses: string[];
  aiScore: number; // 0-100 quality/compliance score
  isAiGenerated?: boolean;
  approvalRequired: boolean;
  approvalChain: string[];
  updatedAt: string;
}

// Generate the 102 enterprise letter templates across 10 categories
const SEED_LETTERS: LetterTemplate[] = [
  // 1. ENGINEERING (12)
  {
    id: "ltr-eng-001",
    code: "ENG-CLOUD-ARCH-US",
    title: "Senior Full-Stack Cloud Architect Offer",
    category: "ENGINEERING",
    jurisdiction: "US",
    level: "LEAD",
    employmentType: "FULL_TIME",
    subject: "Employment Offer: Senior Full-Stack Cloud Architect - MAX Enterprise Global",
    summary: "Standard US full-time cloud architect offer featuring base salary, quarterly RSU vesting schedule, relocation assistance, and at-will employment terms.",
    body: `Dear {{candidate_name}},

On behalf of MAX Enterprise Global, we are pleased to offer you the position of Senior Full-Stack Cloud Architect within our Enterprise Platform Division, reporting directly to {{reporting_manager}}.

1. COMPENSATION & INCENTIVES:
- Base Annual Salary: \${{base_salary}} USD, payable semi-monthly in accordance with normal payroll practices.
- Sign-on Incentive: \${{signing_bonus}} USD, disbursed on your initial payroll cycle (subject to a 12-month tenure clawback).
- Equity Incentive Grant: {{equity_shares}} Restricted Stock Units (RSUs) subject to board approval, vesting 25% after 12 months and quarterly thereafter.
- Target Effective Start Date: {{start_date}}.

2. HEALTH & RETIREMENT BENEFITS:
You will be eligible to participate in MAX Enterprise comprehensive medical, dental, vision, life insurance, and 401(k) program with a 5% dollar-for-dollar employer matching contribution.

3. GOVERNING TERMS:
This employment offer is contingent upon successful completion of background verification (BGV) and confirmation of legal authorization to work in the United States. Your employment with MAX Enterprise Global is at-will.

Sincerely,
MAX Enterprise Talent Acquisition Team`,
    supportedMergeTags: ["{{candidate_name}}", "{{base_salary}}", "{{signing_bonus}}", "{{equity_shares}}", "{{start_date}}", "{{reporting_manager}}"],
    mandatoryClauses: ["At-Will Employment", "BGV Clearance Contingency", "12-Month Bonus Clawback", "IP Assignment"],
    aiScore: 98,
    approvalRequired: true,
    approvalChain: ["Engineering Director", "VP Finance", "Head of People"],
    updatedAt: "2026-10-16T12:00:00Z",
  },
  {
    id: "ltr-eng-002",
    code: "ENG-DIST-SYS-REMOTE",
    title: "Principal Distributed Systems Engineer Offer",
    category: "ENGINEERING",
    jurisdiction: "GLOBAL_REMOTE",
    level: "LEAD",
    employmentType: "FULL_TIME",
    subject: "Offer of Employment: Principal Distributed Systems Engineer (Global Remote)",
    summary: "Remote global engineering offer with home-office equipment budget, high-concurrency architecture ownership, and equity cliff terms.",
    body: `Dear {{candidate_name}},

We are thrilled to offer you the position of Principal Distributed Systems Engineer at MAX Enterprise Global. In this role, you will lead the core distributed persistence and messaging architecture for our next-generation cloud ERP.

COMPENSATION & REMOTE STIPEND:
- Base Salary: \${{base_salary}} USD per annum.
- Home Office & Hardware Setup Allowance: \$4,000 USD one-time stipend, plus \$250 USD monthly remote internet/coworking reimbursement.
- Equity Grant: {{equity_shares}} Incentive Stock Options (ISOs) under our 2026 Global Equity Incentive Plan.
- Official Start Date: {{start_date}}.

WORKING MODALITY:
This position is fully remote. You are expected to maintain core collaborative hours with our global engineering squads.

Warm regards,
Global Engineering Leadership`,
    supportedMergeTags: ["{{candidate_name}}", "{{base_salary}}", "{{equity_shares}}", "{{start_date}}", "{{reporting_manager}}"],
    mandatoryClauses: ["Remote Working Policy", "Security & Data Protection", "IP Assignment"],
    aiScore: 96,
    approvalRequired: true,
    approvalChain: ["Chief Technology Officer", "VP People"],
    updatedAt: "2026-10-15T14:30:00Z",
  },
  {
    id: "ltr-eng-003",
    code: "ENG-AI-INFRA-US",
    title: "AI / LLM Infrastructure Engineer Offer",
    category: "ENGINEERING",
    jurisdiction: "US",
    level: "SENIOR",
    employmentType: "FULL_TIME",
    subject: "Employment Offer: Senior AI Infrastructure Engineer - Enterprise Copilot",
    summary: "Targeted offer for AI/ML platform engineer covering GPU cluster access, model safety protocols, and accelerated equity vesting.",
    body: `Dear {{candidate_name}},

MAX Enterprise Global is excited to invite you to join our Enterprise AI & Cognitive Infrastructure squad as Senior AI Infrastructure Engineer.

COMPENSATION SUMMARY:
- Base Compensation: \${{base_salary}} USD / year.
- Performance Bonus Target: 20% of base salary, evaluated annually against AI infrastructure uptime and inference cost optimization milestones.
- Sign-on Grant: \${{signing_bonus}} USD.
- Equity Package: {{equity_shares}} RSUs with 4-year vesting schedule.
- Reporting To: {{reporting_manager}}.
- Anticipated Start Date: {{start_date}}.

Sincerely,
Enterprise Talent & AI Leadership`,
    supportedMergeTags: ["{{candidate_name}}", "{{base_salary}}", "{{signing_bonus}}", "{{equity_shares}}", "{{start_date}}", "{{reporting_manager}}"],
    mandatoryClauses: ["AI Model IP Protection", "Confidentiality", "At-Will Employment"],
    aiScore: 97,
    approvalRequired: true,
    approvalChain: ["VP AI & Research", "VP Finance"],
    updatedAt: "2026-10-14T11:00:00Z",
  },
  {
    id: "ltr-eng-004",
    code: "ENG-SRE-PLATFORM-UK",
    title: "Site Reliability & Platform Lead Offer (UK)",
    category: "ENGINEERING",
    jurisdiction: "UK",
    level: "LEAD",
    employmentType: "FULL_TIME",
    subject: "Offer of Employment: Site Reliability & Platform Lead (London / Remote)",
    summary: "UK statutory compliant offer with 3 months mutual notice period, on-call compensation premiums, and pension workplace contribution.",
    body: `Dear {{candidate_name}},

MAX Enterprise Systems (UK) Limited is pleased to offer you the permanent role of Site Reliability & Platform Lead.

TERMS OF EMPLOYMENT:
- Base Salary: £{{base_salary}} GBP per annum, paid monthly in arrears.
- On-Call Rota Standby Premium: £650 GBP per weekly rotation plus overtime multipliers for active incident escalation.
- Pension Scheme: Employer statutory pension contribution of 8% matched with 5% employee contribution.
- Notice Period: Three (3) calendar months written notice by either party following probation.
- Probationary Period: Six (6) months from commencement date {{start_date}}.

Yours sincerely,
MAX Enterprise Systems UK Human Resources`,
    supportedMergeTags: ["{{candidate_name}}", "{{base_salary}}", "{{start_date}}", "{{reporting_manager}}"],
    mandatoryClauses: ["UK Employment Rights Act 1996", "Notice Period Clause", "GDPR Data Notice"],
    aiScore: 99,
    approvalRequired: true,
    approvalChain: ["Head of EMEA Engineering", "UK People Director"],
    updatedAt: "2026-10-13T09:15:00Z",
  },
  {
    id: "ltr-eng-005",
    code: "ENG-FRONTEND-DE",
    title: "Senior Frontend React / Next.js Engineer (Germany)",
    category: "ENGINEERING",
    jurisdiction: "GERMANY",
    level: "SENIOR",
    employmentType: "FULL_TIME",
    subject: "Anstellungsvertrag: Senior Frontend Engineer - MAX Enterprise GmbH",
    summary: "German employment contract format complying with German Civil Code (BGB), statutory 30 days vacation, and statutory sick pay.",
    body: `Dear {{candidate_name}},

We are pleased to extend this formal offer of employment with MAX Enterprise GmbH (Germany) as Senior Frontend Engineer.

1. SALARY & WORKING TIME:
- Annual Gross Salary: €{{base_salary}} EUR, payable in 12 equal monthly installments.
- Regular Working Hours: 40 hours per week from Monday through Friday.
- Annual Paid Leave: 30 working days per calendar year.
- Commencing Date: {{start_date}}.

2. PROBATION & TERMINATION:
The first six (6) months constitute a probationary period (Probezeit) pursuant to § 622 Para. 3 BGB, terminable with two (2) weeks notice. Thereafter, statutory notice periods apply.

Mit freundlichen Grüßen,
MAX Enterprise GmbH Managing Director`,
    supportedMergeTags: ["{{candidate_name}}", "{{base_salary}}", "{{start_date}}", "{{reporting_manager}}"],
    mandatoryClauses: ["German BGB Compliance", "Probezeit Clause", "Statutory Leave"],
    aiScore: 95,
    approvalRequired: true,
    approvalChain: ["Germany General Manager", "EMEA HR Lead"],
    updatedAt: "2026-10-12T16:00:00Z",
  },
  {
    id: "ltr-eng-006",
    code: "ENG-EMBEDDED-APAC",
    title: "Embedded Systems & IoT Firmware Engineer (APAC)",
    category: "ENGINEERING",
    jurisdiction: "SINGAPORE",
    level: "MID",
    employmentType: "FULL_TIME",
    subject: "Offer of Employment: Embedded Systems & IoT Firmware Engineer",
    summary: "Singapore Employment Act compliant contract with Central Provident Fund (CPF) deductions and lab equipment safety provisions.",
    body: `Dear {{candidate_name}},

MAX Enterprise Technologies Pte Ltd is pleased to offer you employment as Embedded Systems & IoT Firmware Engineer.

TERMS & BENEFITS:
- Basic Monthly Salary: SGD \${{base_salary}}, payable at month end.
- CPF Contribution: Statutory employer and employee CPF contributions as stipulated by Singapore CPF Board.
- Annual Wage Supplement (AWS / 13th Month): Discretionary one month bonus payable in December.
- Commencement: {{start_date}}.

Yours faithfully,
MAX Enterprise Technologies Pte Ltd`,
    supportedMergeTags: ["{{candidate_name}}", "{{base_salary}}", "{{start_date}}", "{{reporting_manager}}"],
    mandatoryClauses: ["Singapore Employment Act", "CPF Compliance", "Proprietary Hardware IP"],
    aiScore: 94,
    approvalRequired: false,
    approvalChain: ["Engineering Manager"],
    updatedAt: "2026-10-11T08:00:00Z",
  },
  {
    id: "ltr-eng-007",
    code: "ENG-DB-POSTGRES-US",
    title: "Database Reliability Engineer - PostgreSQL Lead",
    category: "ENGINEERING",
    jurisdiction: "US",
    level: "SENIOR",
    employmentType: "FULL_TIME",
    subject: "Employment Offer: Database Reliability Engineer (PostgreSQL)",
    summary: "PostgreSQL DBA lead offer with mission-critical multi-tenant database SLAs, performance bonuses, and zero-downtime maintenance ownership.",
    body: `Dear {{candidate_name}},

MAX Enterprise Global is pleased to offer you the role of Database Reliability Engineer. In this role, you will report to {{reporting_manager}} and safeguard our core relational databases.

COMPENSATION:
- Base: \${{base_salary}} USD / year.
- Equity: {{equity_shares}} RSUs.
- Joining Bonus: \${{signing_bonus}} USD.
- Effective: {{start_date}}.`,
    supportedMergeTags: ["{{candidate_name}}", "{{base_salary}}", "{{signing_bonus}}", "{{equity_shares}}", "{{start_date}}", "{{reporting_manager}}"],
    mandatoryClauses: ["Data Confidentiality", "At-Will Employment"],
    aiScore: 93,
    approvalRequired: true,
    approvalChain: ["Infrastructure Director"],
    updatedAt: "2026-10-10T11:00:00Z",
  },
  {
    id: "ltr-eng-008",
    code: "ENG-SEC-CRYPTO-UK",
    title: "Lead Cryptography & AppSec Architect (UK)",
    category: "ENGINEERING",
    jurisdiction: "UK",
    level: "LEAD",
    employmentType: "FULL_TIME",
    subject: "Offer of Employment: Lead Cryptography & Security Architect",
    summary: "Senior security architect offer with strict security clearance stipulations, non-disclosure protocols, and security conference budget.",
    body: `Dear {{candidate_name}},

We are pleased to appoint you as Lead Cryptography & AppSec Architect at MAX Enterprise Systems UK.

TERMS:
- Base Salary: £{{base_salary}} GBP per annum.
- Security Research Grant: £5,000 GBP annual budget for attending BlackHat/DEFCON and zero-day research.
- Start Date: {{start_date}}.`,
    supportedMergeTags: ["{{candidate_name}}", "{{base_salary}}", "{{start_date}}", "{{reporting_manager}}"],
    mandatoryClauses: ["Security Clearance", "Strict NDA", "Export Control"],
    aiScore: 96,
    approvalRequired: true,
    approvalChain: ["CISO", "Head of People UK"],
    updatedAt: "2026-10-09T14:00:00Z",
  },
  {
    id: "ltr-eng-009",
    code: "ENG-QA-AUTO-IN",
    title: "Lead SDET & Automation Architect (India)",
    category: "ENGINEERING",
    jurisdiction: "INDIA",
    level: "LEAD",
    employmentType: "FULL_TIME",
    subject: "Appointment Letter: Lead SDET & QA Automation Architect - MAX India",
    summary: "India IT industry standard CTC structure including Basic, HRA, Special Allowance, Provident Fund, and Gratuity benefits.",
    body: `Dear {{candidate_name}},

MAX Enterprise India Private Limited is pleased to offer you appointment as Lead SDET & QA Automation Architect.

COMPENSATION BREAKDOWN (Cost-to-Company):
- Annual Fixed CTC: INR ₹{{base_salary}}, payable in equal monthly installments.
  * Basic Salary: 40% of CTC
  * House Rent Allowance (HRA): 20% of CTC
  * Flexible Benefits & Special Allowance: Balance component
- Joining Sign-on Bonus: INR ₹{{signing_bonus}}.
- Provident Fund (PF): 12% employer matching contribution as per EPF Act.
- Joining Date: {{start_date}}.
- Reporting Manager: {{reporting_manager}}.`,
    supportedMergeTags: ["{{candidate_name}}", "{{base_salary}}", "{{signing_bonus}}", "{{start_date}}", "{{reporting_manager}}"],
    mandatoryClauses: ["EPF Act Compliance", "Gratuity Act 1972", "3-Month Notice Period"],
    aiScore: 98,
    approvalRequired: true,
    approvalChain: ["India Engineering VP", "India HR Director"],
    updatedAt: "2026-10-08T10:00:00Z",
  },
  {
    id: "ltr-eng-010",
    code: "ENG-MOBILE-LEAD-US",
    title: "Lead Mobile Applications Architect (iOS / Android)",
    category: "ENGINEERING",
    jurisdiction: "US",
    level: "LEAD",
    employmentType: "FULL_TIME",
    subject: "Offer of Employment: Lead Mobile Applications Architect",
    summary: "Mobile engineering leadership offer with app store release milestone bonuses and mobile testing device library budget.",
    body: `Dear {{candidate_name}},

We are pleased to extend an offer for Lead Mobile Applications Architect with MAX Enterprise Global.

TERMS:
- Base Salary: \${{base_salary}} USD.
- Annual Bonus: 15% target based on mobile ERP app performance and customer satisfaction.
- Equity: {{equity_shares}} RSUs.
- Start Date: {{start_date}}.`,
    supportedMergeTags: ["{{candidate_name}}", "{{base_salary}}", "{{equity_shares}}", "{{start_date}}", "{{reporting_manager}}"],
    mandatoryClauses: ["App Store IP Rights", "At-Will Employment"],
    aiScore: 92,
    approvalRequired: false,
    approvalChain: ["Engineering Director"],
    updatedAt: "2026-10-07T12:00:00Z",
  },
  {
    id: "ltr-eng-011",
    code: "ENG-DATA-ARCH-SG",
    title: "Enterprise Big Data Architect (Singapore)",
    category: "ENGINEERING",
    jurisdiction: "SINGAPORE",
    level: "LEAD",
    employmentType: "FULL_TIME",
    subject: "Offer of Employment: Enterprise Big Data Architect",
    summary: "Singapore data platform lead offer covering multi-cloud data lakes, Spark/Flink pipelines, and regional data residency compliance.",
    body: `Dear {{candidate_name}},

MAX Enterprise Technologies Pte Ltd invites you to join as Enterprise Big Data Architect.

TERMS:
- Base Salary: SGD \${{base_salary}} per annum.
- Variable Bonus: Up to 2 months based on platform reliability.
- Start Date: {{start_date}}.`,
    supportedMergeTags: ["{{candidate_name}}", "{{base_salary}}", "{{start_date}}", "{{reporting_manager}}"],
    mandatoryClauses: ["PDPA Compliance", "Cross-Border Data Residency"],
    aiScore: 94,
    approvalRequired: true,
    approvalChain: ["VP APAC Engineering"],
    updatedAt: "2026-10-06T11:00:00Z",
  },
  {
    id: "ltr-eng-012",
    code: "ENG-DEVOPS-K8S-REMOTE",
    title: "Senior Kubernetes & Infrastructure Platform Engineer",
    category: "ENGINEERING",
    jurisdiction: "GLOBAL_REMOTE",
    level: "SENIOR",
    employmentType: "FULL_TIME",
    subject: "Offer of Employment: Senior Kubernetes Platform Engineer",
    summary: "Multi-cluster Kubernetes engineer offer with infrastructure-as-code ownership and global cloud certifications sponsorship.",
    body: `Dear {{candidate_name}},

We are pleased to offer you the role of Senior Kubernetes Platform Engineer at MAX Enterprise Global.

TERMS:
- Base Salary: \${{base_salary}} USD / year.
- Equity: {{equity_shares}} ISOs.
- Home Office Allowance: \$3,500 USD.
- Effective: {{start_date}}.`,
    supportedMergeTags: ["{{candidate_name}}", "{{base_salary}}", "{{equity_shares}}", "{{start_date}}", "{{reporting_manager}}"],
    mandatoryClauses: ["Remote Security Protocol", "IP Assignment"],
    aiScore: 93,
    approvalRequired: false,
    approvalChain: ["DevOps Director"],
    updatedAt: "2026-10-05T09:00:00Z",
  },

  // 2. EXECUTIVE & LEADERSHIP (10)
  {
    id: "ltr-exec-001",
    code: "EXEC-CTO-GLOBAL",
    title: "Chief Technology Officer (CTO) Executive Appointment",
    category: "EXECUTIVE",
    jurisdiction: "GLOBAL_REMOTE",
    level: "EXECUTIVE",
    employmentType: "EXECUTIVE",
    subject: "Executive Employment Agreement: Chief Technology Officer - MAX Enterprise Global",
    summary: "C-level executive agreement featuring substantial equity grant, double-trigger acceleration upon change-of-control, 6 months severance, and non-solicitation.",
    body: `Dear {{candidate_name}},

On behalf of the Board of Directors of MAX Enterprise Global, we are proud to formally offer you appointment as Chief Technology Officer (CTO).

1. EXECUTIVE COMPENSATION & EQUITY:
- Base Executive Salary: \${{base_salary}} USD per annum, payable in semi-monthly installments.
- Executive Incentive Bonus: Target of 50% of annual base salary based on board-approved OKRs.
- Long-Term Equity Grant: {{equity_shares}} Restricted Stock Units representing executive equity ownership, vesting over a 4-year schedule with 1-year cliff.
- Change-of-Control Acceleration: 100% accelerated vesting upon a double-trigger event (acquisition and involuntary termination).

2. SEVERANCE & BENEFITS:
In the event of termination without Cause, you shall receive six (6) months continued base salary and health insurance continuation.

3. EFFECTIVE DATE & REPORTING:
You will report directly to the Chief Executive Officer and Board of Directors, commencing on {{start_date}}.

Warm regards,
Board of Directors & Chief Executive Officer
MAX Enterprise Global Inc.`,
    supportedMergeTags: ["{{candidate_name}}", "{{base_salary}}", "{{equity_shares}}", "{{start_date}}"],
    mandatoryClauses: ["Change of Control Double Trigger", "Executive Severance", "24-Month Non-Solicitation", "D&O Insurance Coverage"],
    aiScore: 99,
    approvalRequired: true,
    approvalChain: ["Board Compensation Committee", "Chief Executive Officer"],
    updatedAt: "2026-10-16T10:00:00Z",
  },
  {
    id: "ltr-exec-002",
    code: "EXEC-VP-ENG-US",
    title: "Vice President of Global Engineering Offer",
    category: "EXECUTIVE",
    jurisdiction: "US",
    level: "EXECUTIVE",
    employmentType: "EXECUTIVE",
    subject: "Executive Offer: Vice President of Global Engineering",
    summary: "Senior engineering executive offer managing 200+ engineers with executive bonus pool, golden parachute clause, and garden leave.",
    body: `Dear {{candidate_name}},

MAX Enterprise Global is thrilled to offer you the role of Vice President of Global Engineering, reporting to the Chief Technology Officer.

TERMS:
- Base Executive Salary: \${{base_salary}} USD.
- Annual Executive Bonus Target: 35%.
- Equity Grant: {{equity_shares}} RSUs.
- Executive Relocation Allowance: \$25,000 USD lump sum.
- Start Date: {{start_date}}.`,
    supportedMergeTags: ["{{candidate_name}}", "{{base_salary}}", "{{equity_shares}}", "{{start_date}}"],
    mandatoryClauses: ["Garden Leave Clause", "Executive Non-Compete", "IP Assignment"],
    aiScore: 97,
    approvalRequired: true,
    approvalChain: ["Chief Executive Officer", "Compensation Committee"],
    updatedAt: "2026-10-15T09:00:00Z",
  },
  {
    id: "ltr-exec-003",
    code: "EXEC-CPO-UK",
    title: "Chief People Officer (CPO) Executive Offer",
    category: "EXECUTIVE",
    jurisdiction: "UK",
    level: "EXECUTIVE",
    employmentType: "EXECUTIVE",
    subject: "Executive Appointment: Chief People Officer - MAX Enterprise",
    summary: "UK executive contract with board committee governance, global mobility leadership, and senior executive compensation package.",
    body: `Dear {{candidate_name}},

We are honored to offer you the role of Chief People Officer at MAX Enterprise Systems UK.

TERMS:
- Base Salary: £{{base_salary}} GBP per annum.
- Executive Performance Bonus: 30% target.
- Long-Term Incentive Plan: {{equity_shares}} shares.
- Mutual Notice Period: 6 months.
- Commencement: {{start_date}}.`,
    supportedMergeTags: ["{{candidate_name}}", "{{base_salary}}", "{{equity_shares}}", "{{start_date}}"],
    mandatoryClauses: ["Executive Notice Clause", "Senior Manager Regime", "D&O Indemnification"],
    aiScore: 98,
    approvalRequired: true,
    approvalChain: ["Chief Executive Officer", "Board Nomination Committee"],
    updatedAt: "2026-10-14T08:00:00Z",
  },
  {
    id: "ltr-exec-004",
    code: "EXEC-CFO-US",
    title: "Chief Financial Officer (CFO) Executive Offer",
    category: "EXECUTIVE",
    jurisdiction: "US",
    level: "EXECUTIVE",
    employmentType: "EXECUTIVE",
    subject: "Executive Offer: Chief Financial Officer",
    summary: "CFO offer with Sarbanes-Oxley (SOX) compliance accountability, audit committee reporting, and public listing incentive shares.",
    body: `Dear {{candidate_name}},

MAX Enterprise Global hereby offers you appointment as Chief Financial Officer.

TERMS:
- Base Salary: \${{base_salary}} USD / year.
- Performance Bonus: 40% target tied to EBITDA and revenue growth.
- Equity Grant: {{equity_shares}} shares with liquidity event vesting bonuses.
- Effective: {{start_date}}.`,
    supportedMergeTags: ["{{candidate_name}}", "{{base_salary}}", "{{equity_shares}}", "{{start_date}}"],
    mandatoryClauses: ["SOX Compliance Certification", "Clawback Policy", "D&O Insurance"],
    aiScore: 99,
    approvalRequired: true,
    approvalChain: ["Board Audit Committee", "CEO"],
    updatedAt: "2026-10-13T10:00:00Z",
  },
  {
    id: "ltr-exec-005",
    code: "EXEC-LEGAL-US",
    title: "General Counsel & Corporate Secretary Offer",
    category: "EXECUTIVE",
    jurisdiction: "US",
    level: "EXECUTIVE",
    employmentType: "EXECUTIVE",
    subject: "Executive Offer: General Counsel & Corporate Secretary",
    summary: "Chief legal officer offer covering global legal governance, patent portfolio oversight, and board secretary fiduciary duties.",
    body: `Dear {{candidate_name}},

We are pleased to offer you appointment as General Counsel & Corporate Secretary of MAX Enterprise Global.

TERMS:
- Base Salary: \${{base_salary}} USD.
- Annual Bonus: 30% target.
- Equity Grant: {{equity_shares}} RSUs.
- Commencement: {{start_date}}.`,
    supportedMergeTags: ["{{candidate_name}}", "{{base_salary}}", "{{equity_shares}}", "{{start_date}}"],
    mandatoryClauses: ["Attorney-Client Privilege", "Bar Association Good Standing", "Fiduciary Duty"],
    aiScore: 98,
    approvalRequired: true,
    approvalChain: ["CEO", "Board of Directors"],
    updatedAt: "2026-10-12T11:00:00Z",
  },
  {
    id: "ltr-exec-006",
    code: "EXEC-VP-PROD-DE",
    title: "Vice President of Product Management (Germany)",
    category: "EXECUTIVE",
    jurisdiction: "GERMANY",
    level: "EXECUTIVE",
    employmentType: "EXECUTIVE",
    subject: "Executive Contract: Vice President Product - MAX Enterprise GmbH",
    summary: "German executive contract (Leitender Angestellter) with enterprise product portfolio P&L ownership and management bonus.",
    body: `Dear {{candidate_name}},

MAX Enterprise GmbH is pleased to appoint you as Vice President of Product Management.

TERMS:
- Annual Base Salary: €{{base_salary}} EUR.
- Management Performance Bonus: €50,000 EUR target.
- Company Car Allowance: €1,200 EUR per month.
- Start Date: {{start_date}}.`,
    supportedMergeTags: ["{{candidate_name}}", "{{base_salary}}", "{{start_date}}"],
    mandatoryClauses: ["Leitender Angestellter Status", "Post-Contractual Non-Compete"],
    aiScore: 96,
    approvalRequired: true,
    approvalChain: ["Chief Product Officer", "Managing Director GmbH"],
    updatedAt: "2026-10-11T13:00:00Z",
  },
  {
    id: "ltr-exec-007",
    code: "EXEC-CRO-US",
    title: "Chief Revenue Officer (CRO) Executive Offer",
    category: "EXECUTIVE",
    jurisdiction: "US",
    level: "EXECUTIVE",
    employmentType: "EXECUTIVE",
    subject: "Executive Offer: Chief Revenue Officer",
    summary: "Global revenue leader offer with uncapped revenue commission accelerator, ARR targets, and global sales team governance.",
    body: `Dear {{candidate_name}},

MAX Enterprise Global is pleased to offer you the role of Chief Revenue Officer.

TERMS:
- Base Salary: \${{base_salary}} USD.
- On-Target Earnings (OTE): \${{signing_bonus}} USD (50/50 base/commission split).
- Equity Grant: {{equity_shares}} RSUs.
- Effective: {{start_date}}.`,
    supportedMergeTags: ["{{candidate_name}}", "{{base_salary}}", "{{signing_bonus}}", "{{equity_shares}}", "{{start_date}}"],
    mandatoryClauses: ["Sales Quota Policy", "Clawback on Defaulted Contracts"],
    aiScore: 97,
    approvalRequired: true,
    approvalChain: ["CEO", "Compensation Committee"],
    updatedAt: "2026-10-10T15:00:00Z",
  },
  {
    id: "ltr-exec-008",
    code: "EXEC-VP-SALES-UK",
    title: "Vice President of Enterprise Sales - EMEA (UK)",
    category: "EXECUTIVE",
    jurisdiction: "UK",
    level: "EXECUTIVE",
    employmentType: "EXECUTIVE",
    subject: "Executive Offer: VP Enterprise Sales EMEA",
    summary: "EMEA sales executive offer with territory quota governance, multi-currency commission schemes, and executive healthcare.",
    body: `Dear {{candidate_name}},

We are pleased to appoint you as Vice President of Enterprise Sales (EMEA) at MAX Enterprise Systems UK.

TERMS:
- Base: £{{base_salary}} GBP.
- OTE Target: £350,000 GBP.
- Effective: {{start_date}}.`,
    supportedMergeTags: ["{{candidate_name}}", "{{base_salary}}", "{{start_date}}"],
    mandatoryClauses: ["Commission Rules", "Customer Non-Solicit"],
    aiScore: 95,
    approvalRequired: true,
    approvalChain: ["Chief Revenue Officer", "UK Managing Director"],
    updatedAt: "2026-10-09T16:00:00Z",
  },
  {
    id: "ltr-exec-009",
    code: "EXEC-CISO-SG",
    title: "Chief Information Security Officer (Singapore)",
    category: "EXECUTIVE",
    jurisdiction: "SINGAPORE",
    level: "EXECUTIVE",
    employmentType: "EXECUTIVE",
    subject: "Executive Offer: Chief Information Security Officer (CISO)",
    summary: "APAC CISO offer with regional banking regulation compliance (MAS-TRM), ISO 27001 oversight, and incident response governance.",
    body: `Dear {{candidate_name}},

MAX Enterprise Technologies Pte Ltd invites you to join as Chief Information Security Officer (CISO).

TERMS:
- Base: SGD \${{base_salary}} per annum.
- Discretionary Executive Bonus: 25%.
- Equity: {{equity_shares}} shares.
- Start Date: {{start_date}}.`,
    supportedMergeTags: ["{{candidate_name}}", "{{base_salary}}", "{{equity_shares}}", "{{start_date}}"],
    mandatoryClauses: ["MAS Cyber Regulations", "Incident Reporting Fiduciary Duty"],
    aiScore: 97,
    approvalRequired: true,
    approvalChain: ["CEO", "Board Risk Committee"],
    updatedAt: "2026-10-08T09:00:00Z",
  },
  {
    id: "ltr-exec-010",
    code: "EXEC-MD-APAC",
    title: "Managing Director - APAC Regional Operations",
    category: "EXECUTIVE",
    jurisdiction: "SINGAPORE",
    level: "EXECUTIVE",
    employmentType: "EXECUTIVE",
    subject: "Executive Appointment: Managing Director (APAC)",
    summary: "Regional P&L executive agreement covering expansion across Australia, Japan, ASEAN, and India with regional profit-sharing.",
    body: `Dear {{candidate_name}},

We are pleased to offer you appointment as Managing Director (APAC Operations).

TERMS:
- Base: SGD \${{base_salary}}.
- Regional Profit Sharing: 5% of net regional operating profit.
- Effective: {{start_date}}.`,
    supportedMergeTags: ["{{candidate_name}}", "{{base_salary}}", "{{start_date}}"],
    mandatoryClauses: ["Statutory Director Fiduciary", "Anti-Bribery FCPA/UKBA"],
    aiScore: 98,
    approvalRequired: true,
    approvalChain: ["Board of Directors", "CEO"],
    updatedAt: "2026-10-07T10:00:00Z",
  },

  // 3. PRODUCT, DESIGN & ANALYTICS (10)
  {
    id: "ltr-prod-001",
    code: "PROD-DIR-US",
    title: "Director of Enterprise Product Management",
    category: "PRODUCT",
    jurisdiction: "US",
    level: "DIRECTOR",
    employmentType: "FULL_TIME",
    subject: "Offer of Employment: Director of Enterprise Product Management",
    summary: "Product leadership offer directing ERP core modules with roadmap milestone bonuses and product innovation patent bonuses.",
    body: `Dear {{candidate_name}},

MAX Enterprise Global is pleased to extend this offer for Director of Enterprise Product Management.

TERMS:
- Base Salary: \${{base_salary}} USD / year.
- Performance Bonus Target: 20%.
- Equity Grant: {{equity_shares}} RSUs.
- Reporting To: {{reporting_manager}}.
- Commencement: {{start_date}}.`,
    supportedMergeTags: ["{{candidate_name}}", "{{base_salary}}", "{{equity_shares}}", "{{start_date}}", "{{reporting_manager}}"],
    mandatoryClauses: ["Product IP Assignment", "At-Will Employment"],
    aiScore: 96,
    approvalRequired: true,
    approvalChain: ["VP Product", "VP Finance"],
    updatedAt: "2026-10-16T09:00:00Z",
  },
  {
    id: "ltr-prod-002",
    code: "PROD-UX-LEAD-REMOTE",
    title: "Lead UX / UI Product Designer (Global Remote)",
    category: "PRODUCT",
    jurisdiction: "GLOBAL_REMOTE",
    level: "LEAD",
    employmentType: "FULL_TIME",
    subject: "Employment Offer: Lead UX/UI Product Designer",
    summary: "Design lead offer overseeing design systems, design tokens, Figma enterprise libraries, and user research labs globally.",
    body: `Dear {{candidate_name}},

We are thrilled to offer you the position of Lead UX/UI Product Designer at MAX Enterprise Global.

TERMS:
- Base Salary: \${{base_salary}} USD.
- Hardware & Design Software Stipend: \$3,500 USD.
- Equity: {{equity_shares}} ISOs.
- Start Date: {{start_date}}.`,
    supportedMergeTags: ["{{candidate_name}}", "{{base_salary}}", "{{equity_shares}}", "{{start_date}}", "{{reporting_manager}}"],
    mandatoryClauses: ["Design Assets Copyright", "Remote Working Guidelines"],
    aiScore: 95,
    approvalRequired: false,
    approvalChain: ["VP Design"],
    updatedAt: "2026-10-15T12:00:00Z",
  },
  {
    id: "ltr-prod-003",
    code: "PROD-DATA-SCI-US",
    title: "Lead Data Scientist - Predictive Operations & AI",
    category: "PRODUCT",
    jurisdiction: "US",
    level: "LEAD",
    employmentType: "FULL_TIME",
    subject: "Offer of Employment: Lead Data Scientist",
    summary: "Data science offer building automated demand forecasting and predictive maintenance machine learning pipelines.",
    body: `Dear {{candidate_name}},

We are pleased to offer you appointment as Lead Data Scientist at MAX Enterprise Global.

TERMS:
- Base Salary: \${{base_salary}} USD.
- Equity: {{equity_shares}} RSUs.
- Sign-on: \${{signing_bonus}} USD.
- Effective: {{start_date}}.`,
    supportedMergeTags: ["{{candidate_name}}", "{{base_salary}}", "{{signing_bonus}}", "{{equity_shares}}", "{{start_date}}", "{{reporting_manager}}"],
    mandatoryClauses: ["Algorithm IP Assignment", "At-Will Employment"],
    aiScore: 97,
    approvalRequired: true,
    approvalChain: ["Head of Data Science", "VP HR"],
    updatedAt: "2026-10-14T14:00:00Z",
  },
  {
    id: "ltr-prod-004",
    code: "PROD-BI-LEAD-UK",
    title: "Business Intelligence & Analytics Lead (UK)",
    category: "PRODUCT",
    jurisdiction: "UK",
    level: "SENIOR",
    employmentType: "FULL_TIME",
    subject: "Offer of Employment: Business Intelligence & Analytics Lead",
    summary: "UK analytics lead offer building executive dashboards, telemetry reporting, and customer churn analytics.",
    body: `Dear {{candidate_name}},

MAX Enterprise Systems UK is pleased to offer you the role of BI & Analytics Lead.

TERMS:
- Base Salary: £{{base_salary}} GBP.
- Performance Bonus: 15%.
- Start Date: {{start_date}}.`,
    supportedMergeTags: ["{{candidate_name}}", "{{base_salary}}", "{{start_date}}", "{{reporting_manager}}"],
    mandatoryClauses: ["Data Governance Clause", "Notice Period 2 Months"],
    aiScore: 94,
    approvalRequired: false,
    approvalChain: ["Analytics Director"],
    updatedAt: "2026-10-13T15:00:00Z",
  },
  {
    id: "ltr-prod-005",
    code: "PROD-TECH-PM-DE",
    title: "Technical Product Manager - Platform APIs (Germany)",
    category: "PRODUCT",
    jurisdiction: "GERMANY",
    level: "SENIOR",
    employmentType: "FULL_TIME",
    subject: "Anstellungsvertrag: Technical Product Manager - MAX Enterprise GmbH",
    summary: "German contract for platform PM driving GraphQL/REST developer APIs and third-party developer ecosystems.",
    body: `Dear {{candidate_name}},

We are pleased to offer you employment with MAX Enterprise GmbH as Technical Product Manager.

TERMS:
- Gross Annual Salary: €{{base_salary}} EUR.
- Vacation: 30 days.
- Start Date: {{start_date}}.`,
    supportedMergeTags: ["{{candidate_name}}", "{{base_salary}}", "{{start_date}}", "{{reporting_manager}}"],
    mandatoryClauses: ["German BGB Standards", "IP Transfer"],
    aiScore: 93,
    approvalRequired: true,
    approvalChain: ["Director Product EMEA"],
    updatedAt: "2026-10-12T16:00:00Z",
  },
  {
    id: "ltr-prod-006",
    code: "PROD-UX-RESEARCH-US",
    title: "Senior User Researcher & Usability Lab Lead",
    category: "PRODUCT",
    jurisdiction: "US",
    level: "SENIOR",
    employmentType: "FULL_TIME",
    subject: "Offer of Employment: Senior User Researcher",
    summary: "UX research offer running customer advisory councils, benchmark testing, and heuristic evaluations.",
    body: `Dear {{candidate_name}},

MAX Enterprise Global is pleased to offer you the role of Senior User Researcher.

TERMS:
- Base Salary: \${{base_salary}} USD.
- Equity: {{equity_shares}} RSUs.
- Start Date: {{start_date}}.`,
    supportedMergeTags: ["{{candidate_name}}", "{{base_salary}}", "{{equity_shares}}", "{{start_date}}", "{{reporting_manager}}"],
    mandatoryClauses: ["Participant Consent Policies", "At-Will Employment"],
    aiScore: 92,
    approvalRequired: false,
    approvalChain: ["Design Director"],
    updatedAt: "2026-10-11T11:00:00Z",
  },
  {
    id: "ltr-prod-007",
    code: "PROD-QUANT-SG",
    title: "Quantitative Strategy & Financial Modeling Analyst",
    category: "PRODUCT",
    jurisdiction: "SINGAPORE",
    level: "MID",
    employmentType: "FULL_TIME",
    subject: "Offer of Employment: Quantitative Strategy Analyst",
    summary: "Singapore quantitative analyst offer supporting algorithmic pricing models and treasury optimization engines.",
    body: `Dear {{candidate_name}},

MAX Enterprise Technologies Pte Ltd offers you employment as Quantitative Strategy Analyst.

TERMS:
- Monthly Salary: SGD \${{base_salary}}.
- Bonus: Annual performance incentive.
- Commencement: {{start_date}}.`,
    supportedMergeTags: ["{{candidate_name}}", "{{base_salary}}", "{{start_date}}", "{{reporting_manager}}"],
    mandatoryClauses: ["Financial Model Proprietary Rights", "CPF Compliance"],
    aiScore: 94,
    approvalRequired: false,
    approvalChain: ["Fintech Product Lead"],
    updatedAt: "2026-10-10T12:00:00Z",
  },
  {
    id: "ltr-prod-008",
    code: "PROD-GROWTH-US",
    title: "Growth Product Manager - Product-Led Onboarding",
    category: "PRODUCT",
    jurisdiction: "US",
    level: "SENIOR",
    employmentType: "FULL_TIME",
    subject: "Offer of Employment: Growth Product Manager",
    summary: "Product-led growth offer focusing on self-serve trial conversion, user viral loops, and enterprise workspace activation.",
    body: `Dear {{candidate_name}},

We are pleased to offer you the position of Growth Product Manager at MAX Enterprise Global.

TERMS:
- Base: \${{base_salary}} USD.
- Bonus: 20% milestone linked.
- Equity: {{equity_shares}} RSUs.
- Effective: {{start_date}}.`,
    supportedMergeTags: ["{{candidate_name}}", "{{base_salary}}", "{{equity_shares}}", "{{start_date}}", "{{reporting_manager}}"],
    mandatoryClauses: ["Customer Acquisition Data Confidentiality", "At-Will"],
    aiScore: 95,
    approvalRequired: true,
    approvalChain: ["VP Growth", "VP Finance"],
    updatedAt: "2026-10-09T13:00:00Z",
  },
  {
    id: "ltr-prod-009",
    code: "PROD-SCRUM-IN",
    title: "Principal Agile Coach & Enterprise Scrum Master (India)",
    category: "PRODUCT",
    jurisdiction: "INDIA",
    level: "LEAD",
    employmentType: "FULL_TIME",
    subject: "Appointment Letter: Enterprise Agile Coach - MAX India",
    summary: "Indian IT appointment order driving SAFe / LeSS enterprise agile transformation across distributed product pods.",
    body: `Dear {{candidate_name}},

MAX Enterprise India Pvt Ltd is pleased to appoint you as Enterprise Agile Coach.

TERMS:
- Annual CTC: INR ₹{{base_salary}}.
- Joining Bonus: INR ₹{{signing_bonus}}.
- Effective Joining Date: {{start_date}}.`,
    supportedMergeTags: ["{{candidate_name}}", "{{base_salary}}", "{{signing_bonus}}", "{{start_date}}", "{{reporting_manager}}"],
    mandatoryClauses: ["Notice Period 90 Days", "PF & Gratuity"],
    aiScore: 96,
    approvalRequired: false,
    approvalChain: ["India Operations Head"],
    updatedAt: "2026-10-08T14:00:00Z",
  },
  {
    id: "ltr-prod-010",
    code: "PROD-SOL-REMOTE",
    title: "Principal Enterprise Solutions Consultant",
    category: "PRODUCT",
    jurisdiction: "GLOBAL_REMOTE",
    level: "LEAD",
    employmentType: "FULL_TIME",
    subject: "Offer of Employment: Principal Enterprise Solutions Consultant",
    summary: "Global solutions consulting offer bridging enterprise customer architectural requirements with core product roadmap.",
    body: `Dear {{candidate_name}},

MAX Enterprise Global is excited to extend an offer for Principal Enterprise Solutions Consultant.

TERMS:
- Base: \${{base_salary}} USD.
- Variable Consulting Bonus: 20%.
- Equity: {{equity_shares}} shares.
- Start Date: {{start_date}}.`,
    supportedMergeTags: ["{{candidate_name}}", "{{base_salary}}", "{{equity_shares}}", "{{start_date}}", "{{reporting_manager}}"],
    mandatoryClauses: ["Travel Policy Allowance", "Customer Conflict of Interest"],
    aiScore: 94,
    approvalRequired: true,
    approvalChain: ["Head of Solutions Consulting"],
    updatedAt: "2026-10-07T15:00:00Z",
  },

  // 4. SALES, MARKETING & GTM (10)
  {
    id: "ltr-sales-001",
    code: "SALES-STRAT-AE-US",
    title: "Enterprise Strategic Account Executive Offer (US)",
    category: "SALES",
    jurisdiction: "US",
    level: "SENIOR",
    employmentType: "FULL_TIME",
    subject: "Employment Offer: Enterprise Strategic Account Executive - MAX Enterprise Global",
    summary: "50/50 OTE sales compensation structure with quarterly quota milestones, commission accelerators up to 250%, and travel expense policy.",
    body: `Dear {{candidate_name}},

MAX Enterprise Global is pleased to extend this formal offer of employment for Enterprise Strategic Account Executive.

1. COMPENSATION & ON-TARGET EARNINGS (OTE):
- Base Annual Salary: \${{base_salary}} USD, payable semi-monthly.
- Variable Sales Commission Target: \${{base_salary}} USD at 100% quota attainment.
- Total Target Earnings (OTE): Double base salary, with uncapped commission accelerators for over-achievement exceeding quota.
- Sign-on Non-Recoverable Draw: \${{signing_bonus}} USD for the initial two quarters.
- Assigned Sales Quota: \$1,800,000 USD Annual Contract Value (ACV).

2. EQUITY & BENEFITS:
- Equity Grant: {{equity_shares}} RSUs.
- Start Date: {{start_date}}.`,
    supportedMergeTags: ["{{candidate_name}}", "{{base_salary}}", "{{signing_bonus}}", "{{equity_shares}}", "{{start_date}}", "{{reporting_manager}}"],
    mandatoryClauses: ["Sales Incentive Plan Rules", "Customer Non-Solicitation", "At-Will Employment"],
    aiScore: 98,
    approvalRequired: true,
    approvalChain: ["VP Sales", "Chief Revenue Officer", "VP Finance"],
    updatedAt: "2026-10-16T11:30:00Z",
  },
  {
    id: "ltr-sales-002",
    code: "SALES-SDR-UK",
    title: "Sales Development Representative (UK)",
    category: "SALES",
    jurisdiction: "UK",
    level: "ENTRY",
    employmentType: "FULL_TIME",
    subject: "Offer of Employment: Sales Development Representative",
    summary: "Entry-level outbound sales development offer with meeting booking bonuses and fast-track promotion milestones.",
    body: `Dear {{candidate_name}},

MAX Enterprise Systems UK is pleased to offer you the role of Sales Development Representative.

TERMS:
- Base Salary: £{{base_salary}} GBP.
- Monthly Outbound Commission: £1,200 GBP on target meetings held.
- Start Date: {{start_date}}.`,
    supportedMergeTags: ["{{candidate_name}}", "{{base_salary}}", "{{start_date}}", "{{reporting_manager}}"],
    mandatoryClauses: ["UK Employment Law", "Notice Period 1 Month"],
    aiScore: 92,
    approvalRequired: false,
    approvalChain: ["SDR Manager"],
    updatedAt: "2026-10-15T10:00:00Z",
  },
  {
    id: "ltr-sales-003",
    code: "SALES-VP-CS-US",
    title: "Vice President of Customer Success & Retention",
    category: "SALES",
    jurisdiction: "US",
    level: "EXECUTIVE",
    employmentType: "FULL_TIME",
    subject: "Executive Offer: Vice President of Customer Success",
    summary: "Customer success executive offer with Gross Retention Rate (GRR) and Net Retention Rate (NRR) executive bonuses.",
    body: `Dear {{candidate_name}},

MAX Enterprise Global is thrilled to offer you the role of Vice President of Customer Success.

TERMS:
- Base: \${{base_salary}} USD.
- Annual NRR Bonus Target: 30% linked to 115%+ Net Revenue Retention.
- Equity: {{equity_shares}} RSUs.
- Commencement: {{start_date}}.`,
    supportedMergeTags: ["{{candidate_name}}", "{{base_salary}}", "{{equity_shares}}", "{{start_date}}", "{{reporting_manager}}"],
    mandatoryClauses: ["Executive Retention Metrics", "Customer Confidentiality"],
    aiScore: 96,
    approvalRequired: true,
    approvalChain: ["CRO", "CEO"],
    updatedAt: "2026-10-14T09:00:00Z",
  },
  {
    id: "ltr-sales-004",
    code: "SALES-HEAD-GROWTH-DE",
    title: "Global Head of Demand Generation (Germany)",
    category: "SALES",
    jurisdiction: "GERMANY",
    level: "DIRECTOR",
    employmentType: "FULL_TIME",
    subject: "Anstellungsvertrag: Head of Demand Generation - MAX Enterprise GmbH",
    summary: "Marketing leadership offer in Germany overseeing multi-channel inbound pipeline, field events, and digital ad budgets.",
    body: `Dear {{candidate_name}},

We are pleased to offer you the role of Head of Demand Generation at MAX Enterprise GmbH.

TERMS:
- Gross Salary: €{{base_salary}} EUR per annum.
- Marketing Pipeline Bonus: €25,000 EUR on MQL/SQL targets.
- Start Date: {{start_date}}.`,
    supportedMergeTags: ["{{candidate_name}}", "{{base_salary}}", "{{start_date}}", "{{reporting_manager}}"],
    mandatoryClauses: ["German Statutory Notice", "Marketing Data Governance"],
    aiScore: 94,
    approvalRequired: true,
    approvalChain: ["Chief Marketing Officer"],
    updatedAt: "2026-10-13T11:00:00Z",
  },
  {
    id: "ltr-sales-005",
    code: "SALES-PARTNER-SG",
    title: "Strategic Partner & Global Alliance Director (Singapore)",
    category: "SALES",
    jurisdiction: "SINGAPORE",
    level: "DIRECTOR",
    employmentType: "FULL_TIME",
    subject: "Offer of Employment: Strategic Partner & Alliance Director",
    summary: "System integrator (SI) and cloud hyperscaler alliance leadership offer with partner-influenced ARR commissions.",
    body: `Dear {{candidate_name}},

MAX Enterprise Technologies Pte Ltd offers you the position of Strategic Partner & Alliance Director.

TERMS:
- Base Salary: SGD \${{base_salary}}.
- Partner Influenced Revenue Bonus: SGD \$60,000 target.
- Start Date: {{start_date}}.`,
    supportedMergeTags: ["{{candidate_name}}", "{{base_salary}}", "{{start_date}}", "{{reporting_manager}}"],
    mandatoryClauses: ["Alliance Partner Ethics", "FCPA Anti-Corruption"],
    aiScore: 96,
    approvalRequired: true,
    approvalChain: ["VP Global Alliances"],
    updatedAt: "2026-10-12T12:00:00Z",
  },
  {
    id: "ltr-sales-006",
    code: "SALES-PRE-SE-US",
    title: "Senior Pre-Sales Solutions Engineer (US)",
    category: "SALES",
    jurisdiction: "US",
    level: "SENIOR",
    employmentType: "FULL_TIME",
    subject: "Offer of Employment: Senior Pre-Sales Solutions Engineer",
    summary: "Technical sales engineer offer with 70/30 base/bonus split, proof-of-concept delivery incentives, and demo cloud infrastructure budget.",
    body: `Dear {{candidate_name}},

MAX Enterprise Global offers you the position of Senior Pre-Sales Solutions Engineer.

TERMS:
- Base: \${{base_salary}} USD.
- Technical Win Variable Bonus: 25%.
- Equity: {{equity_shares}} RSUs.
- Effective: {{start_date}}.`,
    supportedMergeTags: ["{{candidate_name}}", "{{base_salary}}", "{{equity_shares}}", "{{start_date}}", "{{reporting_manager}}"],
    mandatoryClauses: ["Demo Security Policies", "At-Will Employment"],
    aiScore: 93,
    approvalRequired: false,
    approvalChain: ["Head of Pre-Sales"],
    updatedAt: "2026-10-11T13:00:00Z",
  },
  {
    id: "ltr-sales-007",
    code: "SALES-TAM-IN",
    title: "Technical Account Manager - Strategic Accounts (India)",
    category: "SALES",
    jurisdiction: "INDIA",
    level: "SENIOR",
    employmentType: "FULL_TIME",
    subject: "Appointment Letter: Technical Account Manager - MAX India",
    summary: "Customer relationship and SLA support offer for top-tier Indian conglomerate enterprise accounts.",
    body: `Dear {{candidate_name}},

MAX Enterprise India Pvt Ltd is pleased to offer you appointment as Technical Account Manager.

TERMS:
- Fixed CTC: INR ₹{{base_salary}}.
- Variable SLA Performance Bonus: INR ₹3,00,000.
- Start Date: {{start_date}}.`,
    supportedMergeTags: ["{{candidate_name}}", "{{base_salary}}", "{{start_date}}", "{{reporting_manager}}"],
    mandatoryClauses: ["Notice Period 60 Days", "PF Compliance"],
    aiScore: 94,
    approvalRequired: false,
    approvalChain: ["India Customer Support Director"],
    updatedAt: "2026-10-10T14:00:00Z",
  },
  {
    id: "ltr-sales-008",
    code: "SALES-COMM-US",
    title: "Director of Corporate Communications & Global PR",
    category: "SALES",
    jurisdiction: "US",
    level: "DIRECTOR",
    employmentType: "FULL_TIME",
    subject: "Offer of Employment: Director of Corporate Communications",
    summary: "PR leadership offer governing media interviews, press release dispatches, crisis communication, and brand sentiment.",
    body: `Dear {{candidate_name}},

We are pleased to offer you the role of Director of Corporate Communications at MAX Enterprise Global.

TERMS:
- Base: \${{base_salary}} USD.
- Annual Bonus: 20%.
- Equity: {{equity_shares}} RSUs.
- Start Date: {{start_date}}.`,
    supportedMergeTags: ["{{candidate_name}}", "{{base_salary}}", "{{equity_shares}}", "{{start_date}}", "{{reporting_manager}}"],
    mandatoryClauses: ["Media Spokesperson Restrictions", "Insider Trading Policy"],
    aiScore: 95,
    approvalRequired: true,
    approvalChain: ["Chief Marketing Officer"],
    updatedAt: "2026-10-09T15:00:00Z",
  },
  {
    id: "ltr-sales-009",
    code: "SALES-DIGITAL-REMOTE",
    title: "Senior Digital Marketing & SEO Strategy Lead",
    category: "SALES",
    jurisdiction: "GLOBAL_REMOTE",
    level: "SENIOR",
    employmentType: "FULL_TIME",
    subject: "Offer of Employment: Senior Digital Marketing Lead",
    summary: "Remote digital marketing lead offer covering international paid search, SEO algorithms, and analytics attribution models.",
    body: `Dear {{candidate_name}},

MAX Enterprise Global offers you the position of Senior Digital Marketing Lead.

TERMS:
- Base Salary: \${{base_salary}} USD.
- Performance Incentive: \$15,000 USD tied to organic inbound growth.
- Effective: {{start_date}}.`,
    supportedMergeTags: ["{{candidate_name}}", "{{base_salary}}", "{{start_date}}", "{{reporting_manager}}"],
    mandatoryClauses: ["Marketing Content Ownership", "Remote Guidelines"],
    aiScore: 92,
    approvalRequired: false,
    approvalChain: ["VP Marketing"],
    updatedAt: "2026-10-08T16:00:00Z",
  },
  {
    id: "ltr-sales-010",
    code: "SALES-ONBOARD-UK",
    title: "Enterprise Customer Onboarding & Implementation Specialist",
    category: "SALES",
    jurisdiction: "UK",
    level: "MID",
    employmentType: "FULL_TIME",
    subject: "Offer of Employment: Enterprise Customer Onboarding Specialist",
    summary: "Implementation specialist offer leading 90-day ERP deployment and data migration go-lives for European enterprises.",
    body: `Dear {{candidate_name}},

MAX Enterprise Systems UK is pleased to offer you employment as Customer Onboarding Specialist.

TERMS:
- Base: £{{base_salary}} GBP.
- Go-Live Milestone Bonus: £8,000 GBP.
- Start Date: {{start_date}}.`,
    supportedMergeTags: ["{{candidate_name}}", "{{base_salary}}", "{{start_date}}", "{{reporting_manager}}"],
    mandatoryClauses: ["Customer Data Confidentiality", "UK Employment Standards"],
    aiScore: 93,
    approvalRequired: false,
    approvalChain: ["Head of Implementation"],
    updatedAt: "2026-10-07T11:00:00Z",
  },

  // 5. HUMAN RESOURCES & TALENT (10)
  {
    id: "ltr-hr-001",
    code: "HR-HEAD-TA-US",
    title: "Global Head of Talent Acquisition Offer",
    category: "HR",
    jurisdiction: "US",
    level: "DIRECTOR",
    employmentType: "FULL_TIME",
    subject: "Offer of Employment: Global Head of Talent Acquisition - MAX Enterprise",
    summary: "Talent acquisition leadership offer governing recruiter pipeline efficiency, employer branding, and global recruitment agency SLAs.",
    body: `Dear {{candidate_name}},

MAX Enterprise Global is delighted to offer you appointment as Global Head of Talent Acquisition.

TERMS:
- Base Salary: \${{base_salary}} USD per annum.
- Time-to-Fill & Quality-of-Hire Bonus Target: 25%.
- Equity Grant: {{equity_shares}} RSUs.
- Reporting To: {{reporting_manager}}.
- Start Date: {{start_date}}.`,
    supportedMergeTags: ["{{candidate_name}}", "{{base_salary}}", "{{equity_shares}}", "{{start_date}}", "{{reporting_manager}}"],
    mandatoryClauses: ["Equal Employment Opportunity Policy", "Candidate Data Privacy"],
    aiScore: 97,
    approvalRequired: true,
    approvalChain: ["Chief People Officer", "VP Finance"],
    updatedAt: "2026-10-16T12:00:00Z",
  },
  {
    id: "ltr-hr-002",
    code: "HR-TECH-REC-REMOTE",
    title: "Senior Technical Recruiter - AI & Distributed Systems",
    category: "HR",
    jurisdiction: "GLOBAL_REMOTE",
    level: "SENIOR",
    employmentType: "FULL_TIME",
    subject: "Employment Offer: Senior Technical Recruiter",
    summary: "High-volume tech recruiter offer with quarterly hiring completion bonuses and LinkedIn Recruiter Corporate Seat access.",
    body: `Dear {{candidate_name}},

We are pleased to offer you the role of Senior Technical Recruiter at MAX Enterprise Global.

TERMS:
- Base: \${{base_salary}} USD.
- Placement Bonus: \$1,500 USD per engineering hire retained past 90 days.
- Start Date: {{start_date}}.`,
    supportedMergeTags: ["{{candidate_name}}", "{{base_salary}}", "{{start_date}}", "{{reporting_manager}}"],
    mandatoryClauses: ["Candidate Confidentiality", "Remote Policy"],
    aiScore: 93,
    approvalRequired: false,
    approvalChain: ["Director Talent Acquisition"],
    updatedAt: "2026-10-15T11:00:00Z",
  },
  {
    id: "ltr-hr-003",
    code: "HR-HRBP-ENG-UK",
    title: "Senior HR Business Partner - Engineering (UK)",
    category: "HR",
    jurisdiction: "UK",
    level: "SENIOR",
    employmentType: "FULL_TIME",
    subject: "Offer of Employment: Senior HR Business Partner (Engineering)",
    summary: "Strategic HRBP offer partnering with VP of Engineering on succession planning, headcount budgets, and performance appraisals.",
    body: `Dear {{candidate_name}},

MAX Enterprise Systems UK offers you the role of Senior HR Business Partner (Engineering).

TERMS:
- Base Salary: £{{base_salary}} GBP.
- Performance Incentive: 15%.
- Start Date: {{start_date}}.`,
    supportedMergeTags: ["{{candidate_name}}", "{{base_salary}}", "{{start_date}}", "{{reporting_manager}}"],
    mandatoryClauses: ["Employee Grievance Protocols", "Notice Period 2 Months"],
    aiScore: 95,
    approvalRequired: true,
    approvalChain: ["UK People Director"],
    updatedAt: "2026-10-14T10:00:00Z",
  },
  {
    id: "ltr-hr-004",
    code: "HR-COMP-MGR-US",
    title: "Total Rewards & Executive Compensation Manager",
    category: "HR",
    jurisdiction: "US",
    level: "SENIOR",
    employmentType: "FULL_TIME",
    subject: "Offer of Employment: Total Rewards & Compensation Manager",
    summary: "Compensation benchmarking offer managing Radford/Mercer salary surveys, equity pools, and annual merit review cycles.",
    body: `Dear {{candidate_name}},

MAX Enterprise Global offers you the role of Total Rewards & Compensation Manager.

TERMS:
- Base Salary: \${{base_salary}} USD.
- Equity: {{equity_shares}} RSUs.
- Effective: {{start_date}}.`,
    supportedMergeTags: ["{{candidate_name}}", "{{base_salary}}", "{{equity_shares}}", "{{start_date}}", "{{reporting_manager}}"],
    mandatoryClauses: ["Strict Salary Confidentiality", "At-Will Employment"],
    aiScore: 96,
    approvalRequired: true,
    approvalChain: ["VP Total Rewards"],
    updatedAt: "2026-10-13T14:00:00Z",
  },
  {
    id: "ltr-hr-005",
    code: "HR-CULTURE-DE",
    title: "Employee Experience & Workplace Culture Lead (Germany)",
    category: "HR",
    jurisdiction: "GERMANY",
    level: "MID",
    employmentType: "FULL_TIME",
    subject: "Anstellungsvertrag: Workplace Culture Lead - MAX Enterprise GmbH",
    summary: "Employee engagement and wellness offer collaborating with the local German Works Council (Betriebsrat).",
    body: `Dear {{candidate_name}},

MAX Enterprise GmbH is pleased to appoint you as Workplace Culture Lead.

TERMS:
- Base: €{{base_salary}} EUR per annum.
- Leave: 30 days statutory.
- Start Date: {{start_date}}.`,
    supportedMergeTags: ["{{candidate_name}}", "{{base_salary}}", "{{start_date}}", "{{reporting_manager}}"],
    mandatoryClauses: ["Betriebsrat Collaboration Protocols", "Health & Safety"],
    aiScore: 92,
    approvalRequired: false,
    approvalChain: ["Germany HR Director"],
    updatedAt: "2026-10-12T15:00:00Z",
  },
  {
    id: "ltr-hr-006",
    code: "HR-PAYROLL-IN",
    title: "HR Operations & Global Payroll Specialist (India)",
    category: "HR",
    jurisdiction: "INDIA",
    level: "MID",
    employmentType: "FULL_TIME",
    subject: "Appointment Letter: HR Operations Specialist - MAX India",
    summary: "Payroll compliance offer managing monthly salary disbursement, TDS tax deductions, Form 16 issuance, and PF remittances.",
    body: `Dear {{candidate_name}},

MAX Enterprise India Pvt Ltd offers you appointment as HR Operations & Payroll Specialist.

TERMS:
- Annual CTC: INR ₹{{base_salary}}.
- Effective Date: {{start_date}}.`,
    supportedMergeTags: ["{{candidate_name}}", "{{base_salary}}", "{{start_date}}", "{{reporting_manager}}"],
    mandatoryClauses: ["Statutory Tax Withholding", "Strict Payroll Non-Disclosure"],
    aiScore: 94,
    approvalRequired: false,
    approvalChain: ["India HR Operations Manager"],
    updatedAt: "2026-10-11T09:00:00Z",
  },
  {
    id: "ltr-hr-007",
    code: "HR-PEOPLE-ANALYTICS-SG",
    title: "Talent Intelligence & People Analytics Lead (Singapore)",
    category: "HR",
    jurisdiction: "SINGAPORE",
    level: "SENIOR",
    employmentType: "FULL_TIME",
    subject: "Offer of Employment: People Analytics Lead",
    summary: "People analytics offer building predictive attrition models, recruitment funnel telemetry, and diversity heatmaps.",
    body: `Dear {{candidate_name}},

MAX Enterprise Technologies Pte Ltd offers you the role of People Analytics Lead.

TERMS:
- Base: SGD \${{base_salary}}.
- Start Date: {{start_date}}.`,
    supportedMergeTags: ["{{candidate_name}}", "{{base_salary}}", "{{start_date}}", "{{reporting_manager}}"],
    mandatoryClauses: ["Employee Data Protection (PDPA)", "CPF Rules"],
    aiScore: 93,
    approvalRequired: false,
    approvalChain: ["Head of People APAC"],
    updatedAt: "2026-10-10T10:00:00Z",
  },
  {
    id: "ltr-hr-008",
    code: "HR-MOBILITY-US",
    title: "Global Mobility & Immigration Specialist",
    category: "HR",
    jurisdiction: "US",
    level: "SENIOR",
    employmentType: "FULL_TIME",
    subject: "Offer of Employment: Global Mobility Specialist",
    summary: "Corporate immigration offer managing H-1B, L-1, O-1 petitions, green card sponsorship workflows, and tax equalizations.",
    body: `Dear {{candidate_name}},

MAX Enterprise Global is pleased to offer you the position of Global Mobility Specialist.

TERMS:
- Base: \${{base_salary}} USD.
- Equity: {{equity_shares}} RSUs.
- Effective: {{start_date}}.`,
    supportedMergeTags: ["{{candidate_name}}", "{{base_salary}}", "{{equity_shares}}", "{{start_date}}", "{{reporting_manager}}"],
    mandatoryClauses: ["Immigration Law Fiduciary", "At-Will Employment"],
    aiScore: 95,
    approvalRequired: false,
    approvalChain: ["Legal Director", "VP HR"],
    updatedAt: "2026-10-09T11:00:00Z",
  },
  {
    id: "ltr-hr-009",
    code: "HR-LD-DIR-US",
    title: "Director of Learning & Leadership Development (L&D)",
    category: "HR",
    jurisdiction: "US",
    level: "DIRECTOR",
    employmentType: "FULL_TIME",
    subject: "Offer of Employment: Director of Learning & Development",
    summary: "L&D leadership offer governing executive coaching programs, technical certifications curriculum, and new hire onboarding bootcamps.",
    body: `Dear {{candidate_name}},

We are pleased to offer you appointment as Director of Learning & Development at MAX Enterprise Global.

TERMS:
- Base: \${{base_salary}} USD.
- Bonus: 20%.
- Equity: {{equity_shares}} RSUs.
- Start Date: {{start_date}}.`,
    supportedMergeTags: ["{{candidate_name}}", "{{base_salary}}", "{{equity_shares}}", "{{start_date}}", "{{reporting_manager}}"],
    mandatoryClauses: ["Training Material Copyright", "At-Will"],
    aiScore: 96,
    approvalRequired: true,
    approvalChain: ["Chief People Officer"],
    updatedAt: "2026-10-08T12:00:00Z",
  },
  {
    id: "ltr-hr-010",
    code: "HR-DEI-LEAD-UK",
    title: "Global Diversity, Equity & Inclusion (DEI) Director",
    category: "HR",
    jurisdiction: "UK",
    level: "DIRECTOR",
    employmentType: "FULL_TIME",
    subject: "Offer of Employment: Global DEI Director",
    summary: "Global diversity leadership offer steering gender pay gap reporting, inclusive recruitment filters, and employee resource groups (ERGs).",
    body: `Dear {{candidate_name}},

MAX Enterprise Systems UK is pleased to offer you the role of Global DEI Director.

TERMS:
- Base Salary: £{{base_salary}} GBP.
- Start Date: {{start_date}}.`,
    supportedMergeTags: ["{{candidate_name}}", "{{base_salary}}", "{{start_date}}", "{{reporting_manager}}"],
    mandatoryClauses: ["UK Equality Act 2010", "Notice Period 3 Months"],
    aiScore: 97,
    approvalRequired: true,
    approvalChain: ["CPO", "Chief Executive Officer"],
    updatedAt: "2026-10-07T13:00:00Z",
  },

  // 6. REMOTE, GLOBAL & CONTRACTOR (10)
  {
    id: "ltr-rem-001",
    code: "REM-SOW-CONTRACT",
    title: "International Independent Contractor Agreement (SOW)",
    category: "REMOTE_CONTRACT",
    jurisdiction: "GLOBAL_REMOTE",
    level: "SENIOR",
    employmentType: "CONTRACTOR",
    subject: "Statement of Work (SOW) & Independent Contractor Agreement",
    summary: "Legally insulated contractor agreement with clear contractor autonomy, indemnification, invoice terms, and intellectual property assignment.",
    body: `Dear {{candidate_name}},

This Independent Contractor Agreement defines the terms under which you will provide specialized engineering services to MAX Enterprise Global.

1. INDEPENDENT STATUS:
The Contractor is an independent entity, not an employee. Contractor is solely responsible for all national and local taxes, insurance, and benefits.

2. STATEMENT OF WORK:
- Daily/Hourly Rate: \${{base_salary}} USD per day worked (Net 30 payment terms upon approved timesheets).
- Project Term: Six (6) months starting {{start_date}}, renewable by mutual written consent.
- Scope: High-scale enterprise data pipeline enhancements as specified in sprint tickets.

3. WORK PRODUCT ASSIGNMENT:
All deliverables and code created constitute 'work made for hire' and belong exclusively to MAX Enterprise Global.`,
    supportedMergeTags: ["{{candidate_name}}", "{{base_salary}}", "{{start_date}}"],
    mandatoryClauses: ["Independent Contractor Safe Harbor", "Full IP Transfer", "Indemnification & Non-Liability"],
    aiScore: 98,
    approvalRequired: true,
    approvalChain: ["VP Engineering", "General Counsel"],
    updatedAt: "2026-10-16T13:00:00Z",
  },
  {
    id: "ltr-rem-002",
    code: "REM-EOR-GLOBAL",
    title: "Employer of Record (EOR) Co-Employment Notice",
    category: "REMOTE_CONTRACT",
    jurisdiction: "GLOBAL_REMOTE",
    level: "MID",
    employmentType: "FULL_TIME",
    subject: "Welcome to MAX Enterprise Global - Tripartite EOR Onboarding Agreement",
    summary: "Tripartite agreement explaining dual obligations between local legal Employer of Record and MAX Enterprise as managing enterprise.",
    body: `Dear {{candidate_name}},

We are thrilled to welcome you to the MAX Enterprise Global distributed team! Your employment will be officially facilitated through our licensed Employer of Record (EOR) partner in your country.

TERMS:
- Monthly Gross Remuneration: \${{base_salary}} (denominated in your local currency).
- Day-to-Day Operations: Supervised directly by MAX Enterprise Engineering Lead {{reporting_manager}}.
- Official Commencement: {{start_date}}.`,
    supportedMergeTags: ["{{candidate_name}}", "{{base_salary}}", "{{start_date}}", "{{reporting_manager}}"],
    mandatoryClauses: ["Local Labor Code Compliance", "IP Direct Assignment to MAX"],
    aiScore: 96,
    approvalRequired: true,
    approvalChain: ["Head of Global People Operations"],
    updatedAt: "2026-10-15T14:00:00Z",
  },
  {
    id: "ltr-rem-003",
    code: "REM-HOME-OFFICE",
    title: "Remote Work & Home-Office Equipment Stipend Letter",
    category: "REMOTE_CONTRACT",
    jurisdiction: "GLOBAL_REMOTE",
    level: "MID",
    employmentType: "FULL_TIME",
    subject: "Addendum: Remote Work Authorization & Equipment Stipend",
    summary: "Official company authorization for remote work with ergonomic chair allowance, high-speed broadband subsidy, and security compliance.",
    body: `Dear {{candidate_name}},

MAX Enterprise Global hereby authorizes your primary work arrangement as Home-Office Remote.

BENEFITS & ALLOCATIONS:
- One-Time Hardware Setup: \$2,500 USD for designated company-approved laptop and dual 4K monitors.
- Ergonomic Workspace Grant: \$1,000 USD for sit-stand desk and chair.
- Monthly High-Speed Internet Subsidy: \$100 USD.
- Effective From: {{start_date}}.`,
    supportedMergeTags: ["{{candidate_name}}", "{{start_date}}"],
    mandatoryClauses: ["Home Security Policy", "Asset Return Contingency"],
    aiScore: 94,
    approvalRequired: false,
    approvalChain: ["IT Operations Manager"],
    updatedAt: "2026-10-14T15:00:00Z",
  },
  {
    id: "ltr-rem-004",
    code: "REM-FIXED-TERM-US",
    title: "Fixed-Term Enterprise Project Consultant Agreement",
    category: "REMOTE_CONTRACT",
    jurisdiction: "US",
    level: "SENIOR",
    employmentType: "CONTRACTOR",
    subject: "Fixed-Term Consulting Agreement: ERP Migration Specialist",
    summary: "Fixed-term 12-month consultant offer with scheduled completion milestones and intellectual property release.",
    body: `Dear {{candidate_name}},

We are pleased to engage your services as Fixed-Term Project Consultant for our ERP Cloud Modernization project.

TERMS:
- Rate: \${{base_salary}} USD per hour, up to 40 hours weekly.
- Contract Duration: Exactly 12 months, starting {{start_date}}.`,
    supportedMergeTags: ["{{candidate_name}}", "{{base_salary}}", "{{start_date}}", "{{reporting_manager}}"],
    mandatoryClauses: ["Fixed Expiration Date", "No Expectation of Permanency"],
    aiScore: 93,
    approvalRequired: true,
    approvalChain: ["Finance Director"],
    updatedAt: "2026-10-13T16:00:00Z",
  },
  {
    id: "ltr-rem-005",
    code: "REM-WRITER-CONTRACT",
    title: "Freelance Senior Technical Documentation Specialist",
    category: "REMOTE_CONTRACT",
    jurisdiction: "GLOBAL_REMOTE",
    level: "MID",
    employmentType: "CONTRACTOR",
    subject: "Contractor Agreement: Technical API Documentation Specialist",
    summary: "Deliverable-based freelance contract for authoring enterprise SDK developer guides and REST API documentation.",
    body: `Dear {{candidate_name}},

MAX Enterprise Global engages your freelance services for Technical API Documentation authoring.

TERMS:
- Project Fee: \${{base_salary}} USD upon delivery of 12 complete API modules.
- Deadline: {{start_date}}.`,
    supportedMergeTags: ["{{candidate_name}}", "{{base_salary}}", "{{start_date}}"],
    mandatoryClauses: ["Deliverable Acceptance Criteria", "Copyright Transfer"],
    aiScore: 91,
    approvalRequired: false,
    approvalChain: ["Lead Technical Writer"],
    updatedAt: "2026-10-12T11:00:00Z",
  },
  {
    id: "ltr-rem-006",
    code: "REM-CROSS-BORDER",
    title: "Cross-Border Secondment & Dual Entity Agreement",
    category: "REMOTE_CONTRACT",
    jurisdiction: "GLOBAL_REMOTE",
    level: "SENIOR",
    employmentType: "FULL_TIME",
    subject: "Cross-Border Dual Employment & Intercompany Secondment Letter",
    summary: "Tax equalized cross-border secondment between MAX US and MAX UK affiliates with double taxation treaty adherence.",
    body: `Dear {{candidate_name}},

This agreement memorializes your temporary cross-border secondment from MAX US to MAX UK.

TERMS:
- Secondment Period: 18 months starting {{start_date}}.
- Tax Equalization: Company ensures net take-home pay is protected against cross-border tax rate variations.`,
    supportedMergeTags: ["{{candidate_name}}", "{{start_date}}"],
    mandatoryClauses: ["Tax Equalization Protocol", "Host Country Visas"],
    aiScore: 97,
    approvalRequired: true,
    approvalChain: ["VP Global Tax", "Head of Mobility"],
    updatedAt: "2026-10-11T12:00:00Z",
  },
  {
    id: "ltr-rem-007",
    code: "REM-NOMAD-FLEX",
    title: "Digital Nomad & Flexible Work Location Agreement",
    category: "REMOTE_CONTRACT",
    jurisdiction: "GLOBAL_REMOTE",
    level: "MID",
    employmentType: "FULL_TIME",
    subject: "Addendum: 90-Day Temporary Overseas Remote Work Authorization",
    summary: "Allows employees to work up to 90 calendar days per year from foreign jurisdictions without creating permanent establishment risks.",
    body: `Dear {{candidate_name}},

MAX Enterprise Global approves your temporary request to work remotely from overseas.

TERMS:
- Approved Window: Maximum 90 consecutive calendar days starting {{start_date}}.
- Compliance: Employee confirms no local tax presence or permanent establishment is triggered.`,
    supportedMergeTags: ["{{candidate_name}}", "{{start_date}}"],
    mandatoryClauses: ["Permanent Establishment Safe Harbor", "Data Export Ban"],
    aiScore: 95,
    approvalRequired: true,
    approvalChain: ["VP Tax", "HRBP"],
    updatedAt: "2026-10-10T13:00:00Z",
  },
  {
    id: "ltr-rem-008",
    code: "REM-ADVISORY-BOARD",
    title: "Part-Time Strategic Advisory Board Member Agreement",
    category: "REMOTE_CONTRACT",
    jurisdiction: "US",
    level: "EXECUTIVE",
    employmentType: "PART_TIME",
    subject: "Appointment: Member of Technical Advisory Board",
    summary: "Advisory board agreement with equity advisory compensation, quarterly board meetings, and conflict of interest carveouts.",
    body: `Dear {{candidate_name}},

MAX Enterprise Global is honored to invite you to serve on our Technical Advisory Board.

TERMS:
- Time Commitment: Approximately 4 hours per calendar quarter.
- Advisory Equity: {{equity_shares}} Advisory Shares vesting quarterly over 2 years.
- Commencement: {{start_date}}.`,
    supportedMergeTags: ["{{candidate_name}}", "{{equity_shares}}", "{{start_date}}"],
    mandatoryClauses: ["Advisory Role Carveout", "Conflict of Interest Disclosure"],
    aiScore: 98,
    approvalRequired: true,
    approvalChain: ["CEO", "Board of Directors"],
    updatedAt: "2026-10-09T14:00:00Z",
  },
  {
    id: "ltr-rem-009",
    code: "REM-SEC-AUDITOR",
    title: "External Security Auditor Engagement Agreement",
    category: "REMOTE_CONTRACT",
    jurisdiction: "GLOBAL_REMOTE",
    level: "SENIOR",
    employmentType: "CONTRACTOR",
    subject: "Engagement Letter: Third-Party SOC2 / ISO Penetration Testing",
    summary: "Authorization letter allowing external penetration tester to probe enterprise infrastructure within defined Rules of Engagement (ROE).",
    body: `Dear {{candidate_name}},

This engagement authorizes your security assessment firm to perform authorized penetration testing of our staging ERP environments.

TERMS:
- Scope: Defined in Exhibit A (Rules of Engagement).
- Term: {{start_date}} through project completion.`,
    supportedMergeTags: ["{{candidate_name}}", "{{start_date}}"],
    mandatoryClauses: ["Safe Harbor Exemption", "Strict Rules of Engagement ROE"],
    aiScore: 99,
    approvalRequired: true,
    approvalChain: ["CISO", "General Counsel"],
    updatedAt: "2026-10-08T15:00:00Z",
  },
  {
    id: "ltr-rem-010",
    code: "REM-MIGRATION-SOW",
    title: "Database Migration Specialist Statement of Work",
    category: "REMOTE_CONTRACT",
    jurisdiction: "GLOBAL_REMOTE",
    level: "SENIOR",
    employmentType: "CONTRACTOR",
    subject: "Statement of Work: Legacy Oracle to PostgreSQL Migration",
    summary: "Fixed-price milestone contract for migrating 50TB legacy schemas to PostgreSQL with zero data loss warranties.",
    body: `Dear {{candidate_name}},

MAX Enterprise Global engages your consultancy for Oracle to PostgreSQL Schema Migration.

TERMS:
- Total SOW Amount: \${{base_salary}} USD in 4 milestone disbursements.
- Commencement: {{start_date}}.`,
    supportedMergeTags: ["{{candidate_name}}", "{{base_salary}}", "{{start_date}}"],
    mandatoryClauses: ["Zero Data Loss Warranty", "Performance Acceptance Test"],
    aiScore: 96,
    approvalRequired: true,
    approvalChain: ["VP Data Engineering"],
    updatedAt: "2026-10-07T16:00:00Z",
  },

  // 7. INTERNSHIPS & EARLY CAREER (10)
  {
    id: "ltr-int-001",
    code: "INT-SWE-SUMMER-US",
    title: "Summer Software Engineering Internship Offer (US)",
    category: "INTERNSHIP",
    jurisdiction: "US",
    level: "ENTRY",
    employmentType: "INTERN",
    subject: "Summer Internship Offer: Software Engineering Intern - MAX Enterprise Global",
    summary: "12-week summer undergraduate internship offer with competitive hourly wage, mentorship program, and return offer eligibility.",
    body: `Dear {{candidate_name}},

MAX Enterprise Global is excited to extend this offer of a Summer Internship as Software Engineering Intern in our Core Platform team.

INTERNSHIP DETAILS:
- Hourly Rate: \$48.00 USD per hour, based on a standard 40-hour work week.
- Term: 12-week program starting {{start_date}}.
- Dedicated 1:1 Senior Engineering Mentor assigned for duration.
- Relocation Housing Stipend: \$3,000 USD lump sum.
- Eligible for Fast-Track Full-Time New Graduate Return Offer based on end-of-summer project showcase.`,
    supportedMergeTags: ["{{candidate_name}}", "{{start_date}}", "{{reporting_manager}}"],
    mandatoryClauses: ["At-Will Internship", "Student Enrollment Verification", "IP Assignment"],
    aiScore: 96,
    approvalRequired: false,
    approvalChain: ["University Recruiting Lead"],
    updatedAt: "2026-10-16T14:00:00Z",
  },
  {
    id: "ltr-int-002",
    code: "INT-AI-FELLOW-US",
    title: "PhD Artificial Intelligence Research Fellow Offer",
    category: "INTERNSHIP",
    jurisdiction: "US",
    level: "MID",
    employmentType: "INTERN",
    subject: "Appointment: AI Research Fellow - Enterprise Cognitive Lab",
    summary: "Fellowship for doctoral students in machine learning with academic publication rights and patent bonus eligibility.",
    body: `Dear {{candidate_name}},

We are pleased to appoint you as AI Research Fellow at MAX Enterprise Global.

TERMS:
- Monthly Fellowship Stipend: \$9,500 USD per month.
- Academic Publication: Right to co-author papers at NeurIPS/ICML subject to prior IP clearance.
- Duration: 16 weeks starting {{start_date}}.`,
    supportedMergeTags: ["{{candidate_name}}", "{{start_date}}", "{{reporting_manager}}"],
    mandatoryClauses: ["Academic Publication Carveout", "Pre-Publication Review"],
    aiScore: 98,
    approvalRequired: true,
    approvalChain: ["Head of AI Research"],
    updatedAt: "2026-10-15T15:00:00Z",
  },
  {
    id: "ltr-int-003",
    code: "INT-GRAD-MGMT-UK",
    title: "Graduate Management Trainee Program Offer (UK)",
    category: "INTERNSHIP",
    jurisdiction: "UK",
    level: "ENTRY",
    employmentType: "FULL_TIME",
    subject: "Offer of Employment: Graduate Management Trainee Program",
    summary: "Two-year rotational graduate scheme through Finance, Operations, Sales, and Product with professional study support.",
    body: `Dear {{candidate_name}},

MAX Enterprise Systems UK is pleased to offer you admission to our two-year Graduate Management Trainee Program.

TERMS:
- Starting Salary: £34,000 GBP per annum with scheduled 6-month rotation uplifts.
- Study Support: Fully funded CIMA/ACCA/CFA study leave and exam fees.
- Start Date: {{start_date}}.`,
    supportedMergeTags: ["{{candidate_name}}", "{{start_date}}"],
    mandatoryClauses: ["Rotational Mobility Clause", "Study Fee Clawback (24 months)"],
    aiScore: 97,
    approvalRequired: true,
    approvalChain: ["Head of Graduate Programs UK"],
    updatedAt: "2026-10-14T16:00:00Z",
  },
  {
    id: "ltr-int-004",
    code: "INT-COOP-ACADEMIC",
    title: "Academic Co-Op Semester Internship Agreement",
    category: "INTERNSHIP",
    jurisdiction: "US",
    level: "ENTRY",
    employmentType: "INTERN",
    subject: "Co-Operative Education Agreement: Engineering Co-Op",
    summary: "Tripartite university co-op agreement providing semester academic credit and hands-on production code contributions.",
    body: `Dear {{candidate_name}},

MAX Enterprise Global confirms your 6-month Academic Co-Op placement.

TERMS:
- Compensation: \$40.00 USD/hour.
- University Academic Credit: 15 Credits evaluated via midterm and final faculty reports.
- Effective: {{start_date}}.`,
    supportedMergeTags: ["{{candidate_name}}", "{{start_date}}", "{{reporting_manager}}"],
    mandatoryClauses: ["University Co-Op Agreement", "Student Performance Review"],
    aiScore: 94,
    approvalRequired: false,
    approvalChain: ["University Liaison Manager"],
    updatedAt: "2026-10-13T10:00:00Z",
  },
  {
    id: "ltr-int-005",
    code: "INT-PM-SUMMER-US",
    title: "Product Management Summer Associate Offer (MBA)",
    category: "INTERNSHIP",
    jurisdiction: "US",
    level: "MID",
    employmentType: "INTERN",
    subject: "Summer Associate Offer: Product Management (MBA)",
    summary: "MBA intern offer owning an enterprise product feature from customer discovery through prototype launch.",
    body: `Dear {{candidate_name}},

We are excited to invite you to join MAX Enterprise Global as MBA Product Management Summer Associate.

TERMS:
- Monthly Salary: \$10,000 USD per month.
- Housing Assistance: \$3,500 USD.
- Duration: 10 weeks starting {{start_date}}.`,
    supportedMergeTags: ["{{candidate_name}}", "{{start_date}}", "{{reporting_manager}}"],
    mandatoryClauses: ["MBA Return Offer Evaluation", "At-Will Employment"],
    aiScore: 96,
    approvalRequired: true,
    approvalChain: ["VP Product"],
    updatedAt: "2026-10-12T11:00:00Z",
  },
  {
    id: "ltr-int-006",
    code: "INT-DATA-SCI-SUMMER",
    title: "Data Science & Analytics Summer Intern",
    category: "INTERNSHIP",
    jurisdiction: "US",
    level: "ENTRY",
    employmentType: "INTERN",
    subject: "Internship Offer: Data Science Summer Intern",
    summary: "Undergraduate data science internship analyzing real-time enterprise event telemetry and building visual dashboard widgets.",
    body: `Dear {{candidate_name}},

MAX Enterprise Global welcomes you as Data Science Summer Intern.

TERMS:
- Rate: \$44.00 USD per hour.
- Term: 12 weeks from {{start_date}}.`,
    supportedMergeTags: ["{{candidate_name}}", "{{start_date}}", "{{reporting_manager}}"],
    mandatoryClauses: ["Data Access Security", "At-Will"],
    aiScore: 92,
    approvalRequired: false,
    approvalChain: ["Data Science Manager"],
    updatedAt: "2026-10-11T12:00:00Z",
  },
  {
    id: "ltr-int-007",
    code: "INT-SALES-APPRENTICE",
    title: "Commercial Sales & GTM Apprenticeship Agreement",
    category: "INTERNSHIP",
    jurisdiction: "UK",
    level: "ENTRY",
    employmentType: "INTERN",
    subject: "Apprenticeship Agreement: Technical Sales Trainee",
    summary: "UK government recognized Level 4 Sales Apprenticeship contract combining 80% on-the-job training with 20% off-the-job classroom study.",
    body: `Dear {{candidate_name}},

MAX Enterprise Systems UK admits you into the Commercial Sales Apprenticeship.

TERMS:
- Starting Wage: £24,000 GBP per annum.
- 20% Off-The-Job Training Time Guaranteed.
- Start Date: {{start_date}}.`,
    supportedMergeTags: ["{{candidate_name}}", "{{start_date}}"],
    mandatoryClauses: ["Apprenticeship Standards UK", "Training Commitment Statement"],
    aiScore: 95,
    approvalRequired: false,
    approvalChain: ["Apprenticeship Director"],
    updatedAt: "2026-10-10T13:00:00Z",
  },
  {
    id: "ltr-int-008",
    code: "INT-LEGAL-SUMMER",
    title: "Legal Summer Associate Internship Offer",
    category: "INTERNSHIP",
    jurisdiction: "US",
    level: "MID",
    employmentType: "INTERN",
    subject: "Summer Associate Offer: Corporate Legal Department",
    summary: "Law student internship assisting with commercial contract redlining, open-source software license auditing, and compliance research.",
    body: `Dear {{candidate_name}},

MAX Enterprise Global Legal Department offers you appointment as Legal Summer Associate.

TERMS:
- Stipend: \$2,200 USD weekly.
- 10 weeks starting {{start_date}}.`,
    supportedMergeTags: ["{{candidate_name}}", "{{start_date}}"],
    mandatoryClauses: ["Attorney-Client Privilege", "Conflict Clearance"],
    aiScore: 97,
    approvalRequired: true,
    approvalChain: ["General Counsel"],
    updatedAt: "2026-10-09T14:00:00Z",
  },
  {
    id: "ltr-int-009",
    code: "INT-FINANCE-GRAD-SG",
    title: "Finance & Treasury Graduate Analyst (Singapore)",
    category: "INTERNSHIP",
    jurisdiction: "SINGAPORE",
    level: "ENTRY",
    employmentType: "FULL_TIME",
    subject: "Offer of Employment: Finance Graduate Analyst",
    summary: "Singapore finance graduate scheme with treasury cash management, forex hedging, and financial reporting rotations.",
    body: `Dear {{candidate_name}},

MAX Enterprise Technologies Pte Ltd offers you employment as Finance Graduate Analyst.

TERMS:
- Salary: SGD \$4,500 per month.
- Start Date: {{start_date}}.`,
    supportedMergeTags: ["{{candidate_name}}", "{{start_date}}"],
    mandatoryClauses: ["Financial Data Non-Disclosure", "CPF"],
    aiScore: 93,
    approvalRequired: false,
    approvalChain: ["Finance Director APAC"],
    updatedAt: "2026-10-08T15:00:00Z",
  },
  {
    id: "ltr-int-010",
    code: "INT-RETURN-OFFER",
    title: "Internship Return Offer - Permanent Full-Time Software Engineer",
    category: "INTERNSHIP",
    jurisdiction: "US",
    level: "ENTRY",
    employmentType: "FULL_TIME",
    subject: "Congratulations! Full-Time Return Offer: Software Engineer I - MAX Enterprise Global",
    summary: "Formal conversion from successful summer internship to permanent full-time position upon university graduation with early-decision signing bonus.",
    body: `Dear {{candidate_name}},

Congratulations on your stellar performance during your summer internship! The entire engineering division was blown away by your contributions.

We are delighted to extend this permanent Full-Time Return Offer as Software Engineer I:
- Base Salary: \${{base_salary}} USD / year.
- Early Decision Signing Incentive: \${{signing_bonus}} USD (for acceptance within 30 days).
- Equity Grant: {{equity_shares}} RSUs.
- Anticipated Post-Graduation Start Date: {{start_date}}.`,
    supportedMergeTags: ["{{candidate_name}}", "{{base_salary}}", "{{signing_bonus}}", "{{equity_shares}}", "{{start_date}}", "{{reporting_manager}}"],
    mandatoryClauses: ["Graduation Degree Verification", "At-Will Employment"],
    aiScore: 99,
    approvalRequired: true,
    approvalChain: ["Engineering VP", "University Recruiting Lead"],
    updatedAt: "2026-10-07T16:00:00Z",
  },

  // 8. APPOINTMENT, CONFIRMATION & PROBATION (10)
  {
    id: "ltr-app-001",
    code: "APP-FORMAL-ORDER",
    title: "Official Appointment Order & Joining Instructions",
    category: "APPOINTMENT",
    jurisdiction: "GLOBAL_REMOTE",
    level: "MID",
    employmentType: "FULL_TIME",
    subject: "Official Appointment Order - Ref: MAX/HR/APP/{{candidate_id}}",
    summary: "Official corporate appointment decree documenting employee ID generation, tax code recording, and formal platform access activation.",
    body: `APPOINTMENT ORDER

To: {{candidate_name}}
Candidate Ref: {{candidate_id}}

This order confirms that you have successfully satisfied all pre-employment contingencies, including reference checks and background screening.

You are formally appointed to the position of {{job_title}} with effective commencement on {{start_date}}.

Assigned Details:
- Department: {{department}}
- Reporting Manager: {{reporting_manager}}
- Workstation/Access Code: PROD-USR-{{candidate_id}}

Authorized by:
Global Human Resources Administration
MAX Enterprise Global`,
    supportedMergeTags: ["{{candidate_name}}", "{{candidate_id}}", "{{job_title}}", "{{department}}", "{{reporting_manager}}", "{{start_date}}"],
    mandatoryClauses: ["Official Seal of Appointment", "Company Code of Conduct"],
    aiScore: 98,
    approvalRequired: false,
    approvalChain: ["HR Operations Lead"],
    updatedAt: "2026-10-16T15:00:00Z",
  },
  {
    id: "ltr-app-002",
    code: "APP-PROB-CONFIRM",
    title: "Successful Probation Completion & Permanent Confirmation",
    category: "APPOINTMENT",
    jurisdiction: "GLOBAL_REMOTE",
    level: "MID",
    employmentType: "FULL_TIME",
    subject: "Confirmation of Employment: Successful Completion of Probation",
    summary: "Celebratory formal letter confirming satisfactory probation review, conferring permanent status, and unlocking annual merit bonus pools.",
    body: `Dear {{candidate_name}},

We are pleased to inform you that you have successfully completed your six (6) month probationary period in your role as {{job_title}}.

Effective immediately, your employment with MAX Enterprise Global is formally confirmed as Permanent.

Your manager {{reporting_manager}} noted your exceptional dedication, technical execution, and positive team spirit. You are now fully eligible for our annual performance review cycle and executive mentoring programs.

Congratulations and thank you for your commitment to excellence!`,
    supportedMergeTags: ["{{candidate_name}}", "{{job_title}}", "{{reporting_manager}}"],
    mandatoryClauses: ["Statutory Confirmation Clause", "Notice Period Update"],
    aiScore: 97,
    approvalRequired: true,
    approvalChain: ["Direct Manager", "HRBP"],
    updatedAt: "2026-10-15T16:00:00Z",
  },
  {
    id: "ltr-app-003",
    code: "APP-PROB-EXTEND",
    title: "Probation Period Extension & Performance Milestones",
    category: "APPOINTMENT",
    jurisdiction: "GLOBAL_REMOTE",
    level: "MID",
    employmentType: "FULL_TIME",
    subject: "Notice: Extension of Probationary Period & 60-Day Action Plan",
    summary: "Constructive formal notification extending probation by 60 days with clear measurable deliverables and weekly mentoring cadence.",
    body: `Dear {{candidate_name}},

This letter serves to communicate the results of your probationary review for the position of {{job_title}}.

While you have shown progress in several areas, certain critical core technical proficiencies require further demonstration before confirmation can be granted. Consequently, management has decided to extend your probationary period by sixty (60) days through to the new target date.

Your manager {{reporting_manager}} will conduct weekly milestone check-ins pursuant to the attached Performance Development Plan.`,
    supportedMergeTags: ["{{candidate_name}}", "{{job_title}}", "{{reporting_manager}}"],
    mandatoryClauses: ["Probation Extension Clause", "PIP Action Milestones"],
    aiScore: 95,
    approvalRequired: true,
    approvalChain: ["Department Head", "HR Director"],
    updatedAt: "2026-10-14T11:00:00Z",
  },
  {
    id: "ltr-app-004",
    code: "APP-DUAL-ENTITY",
    title: "Intercompany Deputation & Dual Entity Appointment",
    category: "APPOINTMENT",
    jurisdiction: "GLOBAL_REMOTE",
    level: "SENIOR",
    employmentType: "FULL_TIME",
    subject: "Intercompany Deputation Letter: MAX Parent & Subsidiary Transfer",
    summary: "Formally assigns an employee to provide executive oversight across multiple legal corporate subsidiaries without breaking continuous service tenure.",
    body: `Dear {{candidate_name}},

You are hereby designated for intercompany deputation to provide technical architecture leadership to our subsidiary entity, commencing {{start_date}}.

Your parent company service seniority, benefits, and equity vesting remain unbroken and continuous throughout this deputation.`,
    supportedMergeTags: ["{{candidate_name}}", "{{start_date}}"],
    mandatoryClauses: ["Continuous Service Guarantee", "Dual Entity Fiduciary"],
    aiScore: 96,
    approvalRequired: true,
    approvalChain: ["Chief Legal Officer", "CPO"],
    updatedAt: "2026-10-13T12:00:00Z",
  },
  {
    id: "ltr-app-005",
    code: "APP-REGULARIZATION",
    title: "Contractor Regularization to Permanent Full-Time Status",
    category: "APPOINTMENT",
    jurisdiction: "US",
    level: "MID",
    employmentType: "FULL_TIME",
    subject: "Transition to Permanent Status: Congratulations on Regularization",
    summary: "Converts long-standing contractual staff to full-time permanent corporate employee, crediting previous tenure toward 401(k) vesting.",
    body: `Dear {{candidate_name}},

MAX Enterprise Global is thrilled to offer you transition from your current contractor capacity to full-time permanent regular employment.

Your tenure as a contractor will be credited toward our internal seniority recognition milestones.
- New Base Salary: \${{base_salary}} USD.
- Effective: {{start_date}}.`,
    supportedMergeTags: ["{{candidate_name}}", "{{base_salary}}", "{{start_date}}"],
    mandatoryClauses: ["Contract Termination Release", "Full-Time Benefits Enrolment"],
    aiScore: 97,
    approvalRequired: true,
    approvalChain: ["VP Engineering", "VP Total Rewards"],
    updatedAt: "2026-10-12T13:00:00Z",
  },
  {
    id: "ltr-app-006",
    code: "APP-ACTING-ROLE",
    title: "Temporary Acting Capacity & Responsibility Allowance",
    category: "APPOINTMENT",
    jurisdiction: "UK",
    level: "SENIOR",
    employmentType: "FULL_TIME",
    subject: "Appointment in Acting Capacity: Interim Head of Engineering",
    summary: "Assigns temporary acting leadership role with monthly acting responsibility stipend while formal executive search proceeds.",
    body: `Dear {{candidate_name}},

We are pleased to appoint you as Interim Acting Head of Engineering during the transition period.

TERMS:
- Acting Responsibility Allowance: £1,200 GBP per month additional to base salary.
- Duration: Up to six months from {{start_date}}.`,
    supportedMergeTags: ["{{candidate_name}}", "{{start_date}}"],
    mandatoryClauses: ["Acting Allowance Terms", "Reversion to Substantive Role"],
    aiScore: 94,
    approvalRequired: true,
    approvalChain: ["CTO", "UK People Lead"],
    updatedAt: "2026-10-11T14:00:00Z",
  },
  {
    id: "ltr-app-007",
    code: "APP-MGR-CHANGE",
    title: "Reporting Line Alignment & Manager Reassignment Notice",
    category: "APPOINTMENT",
    jurisdiction: "GLOBAL_REMOTE",
    level: "MID",
    employmentType: "FULL_TIME",
    subject: "Organizational Update: Alignment of Reporting Manager",
    summary: "Standard HR notice documenting organizational chart realignments and new supervisory chains.",
    body: `Dear {{candidate_name}},

As part of our Q4 strategic engineering alignment, please note that effective {{start_date}}, your official reporting line will transition to {{reporting_manager}}.

Your core title, compensation, and contractual terms remain entirely unaffected.`,
    supportedMergeTags: ["{{candidate_name}}", "{{start_date}}", "{{reporting_manager}}"],
    mandatoryClauses: ["Org Chart Realignment Clause", "No Contractual Impairment"],
    aiScore: 93,
    approvalRequired: false,
    approvalChain: ["HR Operations"],
    updatedAt: "2026-10-10T15:00:00Z",
  },
  {
    id: "ltr-app-008",
    code: "APP-REHIRE-SENIORITY",
    title: "Re-Hire & Seniority Bridging Restoration Letter",
    category: "APPOINTMENT",
    jurisdiction: "US",
    level: "SENIOR",
    employmentType: "FULL_TIME",
    subject: "Welcome Back! Seniority Bridging & Re-Hire Formalities",
    summary: "Reinstates returning boomerang employees, bridging their prior years of tenure for PTO accruals and 401(k) vesting schedules.",
    body: `Dear {{candidate_name}},

Welcome back to MAX Enterprise Global! Under our Boomerang Alumni Policy, we are pleased to approve the bridging of your prior service.

Your accrued tenure from your previous tenure will count towards your annual vacation accrual tier and service anniversary awards.
- Commencement Date: {{start_date}}.`,
    supportedMergeTags: ["{{candidate_name}}", "{{start_date}}"],
    mandatoryClauses: ["Seniority Bridging Formula", "At-Will Employment"],
    aiScore: 98,
    approvalRequired: true,
    approvalChain: ["VP Total Rewards", "CPO"],
    updatedAt: "2026-10-09T16:00:00Z",
  },
  {
    id: "ltr-app-009",
    code: "APP-STATUTORY-IN",
    title: "Statutory Appointment Order (Model Standing Orders - India)",
    category: "APPOINTMENT",
    jurisdiction: "INDIA",
    level: "ENTRY",
    employmentType: "FULL_TIME",
    subject: "Form B: Statutory Appointment Order under Industrial Employment Act",
    summary: "Mandatory statutory appointment order format complying with state Shops & Establishments and Industrial Standing Orders.",
    body: `STATUTORY APPOINTMENT ORDER

Name of Workman: {{candidate_name}}
Ticket/Emp No: {{candidate_id}}

You are appointed as permanent staff in our Software Development establishment with effect from {{start_date}}.

Subject to certified Standing Orders and applicable state labor legislation.`,
    supportedMergeTags: ["{{candidate_name}}", "{{candidate_id}}", "{{start_date}}"],
    mandatoryClauses: ["Standing Orders Schedule", "Statutory Dispute Settlement"],
    aiScore: 95,
    approvalRequired: false,
    approvalChain: ["Factory / Establishment Manager"],
    updatedAt: "2026-10-08T11:00:00Z",
  },
  {
    id: "ltr-app-010",
    code: "APP-LOCATION-CONFIRM",
    title: "Primary Office Workstation & Facility Access Designation",
    category: "APPOINTMENT",
    jurisdiction: "GLOBAL_REMOTE",
    level: "MID",
    employmentType: "FULL_TIME",
    subject: "Workplace Facility Designation & Security Badge Issuance",
    summary: "Official security notification authorizing access to corporate tech centers, biometrics, and secure data room badges.",
    body: `Dear {{candidate_name}},

Your primary office designation has been confirmed at our Corporate Technology Center.

Security badge and cryptographic 2FA tokens have been provisioned for commencement on {{start_date}}.`,
    supportedMergeTags: ["{{candidate_name}}", "{{start_date}}"],
    mandatoryClauses: ["Facility Security Protocol", "Badge Return Policy"],
    aiScore: 92,
    approvalRequired: false,
    approvalChain: ["Facilities Security Manager"],
    updatedAt: "2026-10-07T12:00:00Z",
  },

  // 9. PROMOTION, TRANSFER & SALARY REVISION (10)
  {
    id: "ltr-pro-001",
    code: "PRO-MERIT-INCREASE",
    title: "Annual Merit Compensation Revision & Band Uplift Letter",
    category: "PROMOTION_COMP",
    jurisdiction: "GLOBAL_REMOTE",
    level: "SENIOR",
    employmentType: "FULL_TIME",
    subject: "Congratulations: Annual Compensation Revision & Merit Adjustment",
    summary: "Celebratory compensation uplift letter detailing new base salary, percentage merit increase, revised equity grants, and performance commendation.",
    body: `Dear {{candidate_name}},

In recognition of your exceptional contributions to MAX Enterprise Global over the past fiscal year, we are thrilled to announce a revision to your compensation.

COMPENSATION REVISION SUMMARY:
- Current Base Salary: \${{base_salary}} USD
- New Adjusted Annual Base Salary: \$185,000 USD (an 8.5% merit uplift)
- Discretionary Equity Refresh: 1,500 additional Restricted Stock Units
- Effective Payroll Cycle: Effective immediately on the 1st of the upcoming month.

Your manager {{reporting_manager}} highlighted your pivotal leadership during our cloud migration and your mentorship of junior teammates.

Congratulations on this well-deserved recognition!`,
    supportedMergeTags: ["{{candidate_name}}", "{{base_salary}}", "{{reporting_manager}}"],
    mandatoryClauses: ["Confidentiality of Compensation", "Annual Merit Review Cadence"],
    aiScore: 99,
    approvalRequired: true,
    approvalChain: ["VP Total Rewards", "Department VP"],
    updatedAt: "2026-10-16T16:00:00Z",
  },
  {
    id: "ltr-pro-002",
    code: "PRO-INTERNAL-PROMOTE",
    title: "Internal Promotion to Staff Cloud Architect",
    category: "PROMOTION_COMP",
    jurisdiction: "US",
    level: "LEAD",
    employmentType: "FULL_TIME",
    subject: "Promotion Announcement: Promotion to Staff Cloud Architect",
    summary: "Promotional advancement letter conferring new job level, broadened architectural charter, salary increment, and executive equity grant.",
    body: `Dear {{candidate_name}},

On behalf of the Technical Career Ladder Committee, we are honored to congratulate you on your promotion to Staff Cloud Architect (Level E6).

PROMOTION TERMS:
- New Base Salary: \${{base_salary}} USD per annum.
- Promotional Equity Grant: {{equity_shares}} RSUs.
- Effective Date: {{start_date}}.

Thank you for setting the architectural gold standard for our global engineering division.`,
    supportedMergeTags: ["{{candidate_name}}", "{{base_salary}}", "{{equity_shares}}", "{{start_date}}"],
    mandatoryClauses: ["Level E6 Responsibilities", "At-Will Employment"],
    aiScore: 98,
    approvalRequired: true,
    approvalChain: ["CTO", "Head of People"],
    updatedAt: "2026-10-15T17:00:00Z",
  },
  {
    id: "ltr-pro-003",
    code: "PRO-LATERAL-TRANSFER",
    title: "Lateral Departmental Transfer - Core Platform to AI Lab",
    category: "PROMOTION_COMP",
    jurisdiction: "GLOBAL_REMOTE",
    level: "SENIOR",
    employmentType: "FULL_TIME",
    subject: "Transfer Confirmation: Internal Transfer to Enterprise AI Squad",
    summary: "Facilitates seamless internal talent mobility between product squads while maintaining compensation parity and seniority.",
    body: `Dear {{candidate_name}},

We are pleased to approve your internal transfer to the Enterprise AI & Cognitive Computing Group, reporting to {{reporting_manager}}.

Your continuous tenure, benefits, and current equity vesting schedule remain in full force without interruption.
- Transfer Effective Date: {{start_date}}.`,
    supportedMergeTags: ["{{candidate_name}}", "{{start_date}}", "{{reporting_manager}}"],
    mandatoryClauses: ["Handover Clearance", "Cross-Squad IP Transition"],
    aiScore: 95,
    approvalRequired: true,
    approvalChain: ["Releasing Manager", "Receiving VP"],
    updatedAt: "2026-10-14T12:00:00Z",
  },
  {
    id: "ltr-pro-004",
    code: "PRO-EXPAT-RELOCATE",
    title: "International Expatriate Relocation Assignment Letter (US to UK)",
    category: "PROMOTION_COMP",
    jurisdiction: "UK",
    level: "LEAD",
    employmentType: "FULL_TIME",
    subject: "International Assignment Letter: Relocation to London Tech Center",
    summary: "Comprehensive expatriate relocation package with transatlantic shipping, temporary corporate housing, visa assistance, and tax equalization.",
    body: `Dear {{candidate_name}},

MAX Enterprise Global is pleased to formalize your international expatriate assignment to our London Technology Center.

RELOCATION PROVISIONS:
- Base Salary: £{{base_salary}} GBP per annum.
- Transatlantic Airfare & Container Shipping: 100% employer paid.
- Corporate Executive Housing: 60 days temporary fully furnished flat in Central London.
- Relocation Disturbance Allowance: £7,500 GBP tax-free settlement grant.
- Target Relocation Date: {{start_date}}.`,
    supportedMergeTags: ["{{candidate_name}}", "{{base_salary}}", "{{start_date}}"],
    mandatoryClauses: ["24-Month Relocation Clawback", "Tax Equalization", "Visa Contingency"],
    aiScore: 99,
    approvalRequired: true,
    approvalChain: ["Global Mobility Director", "VP Finance", "CPO"],
    updatedAt: "2026-10-13T13:00:00Z",
  },
  {
    id: "ltr-pro-005",
    code: "PRO-SPOT-BONUS",
    title: "Discretionary Spot Achievement & Milestone Award Letter",
    category: "PROMOTION_COMP",
    jurisdiction: "GLOBAL_REMOTE",
    level: "MID",
    employmentType: "FULL_TIME",
    subject: "Special Recognition: Discretionary Spot Achievement Award",
    summary: "Formal citation and lump-sum cash bonus awarded for critical weekend incident mitigation or heroic customer launch delivery.",
    body: `Dear {{candidate_name}},

In recognition of your exceptional round-the-clock dedication during our Q3 major database upgrade, leadership has awarded you a Discretionary Spot Cash Bonus of \$5,000 USD.

This special reward will be disbursed on your upcoming payroll. Thank you for living our engineering values!`,
    supportedMergeTags: ["{{candidate_name}}"],
    mandatoryClauses: ["Discretionary Tax Withholding", "Executive Recognition"],
    aiScore: 96,
    approvalRequired: true,
    approvalChain: ["Engineering Director", "VP Finance"],
    updatedAt: "2026-10-12T14:00:00Z",
  },
  {
    id: "ltr-pro-006",
    code: "PRO-EQUITY-REFRESH",
    title: "Annual Long-Term Retention Equity Refresh Grant",
    category: "PROMOTION_COMP",
    jurisdiction: "US",
    level: "SENIOR",
    employmentType: "FULL_TIME",
    subject: "Notice of Equity Award: 2026 Annual Retention Stock Refresh",
    summary: "Notifies senior technical and executive contributors of additional RSU grants to ensure competitive unvested retention value.",
    body: `Dear {{candidate_name}},

The Board of Directors has authorized an Annual Equity Refresh Grant of {{equity_shares}} Restricted Stock Units in recognition of your long-term strategic value to MAX Enterprise Global.

Vesting Schedule: 25% annual vesting across 48 months from the grant date.`,
    supportedMergeTags: ["{{candidate_name}}", "{{equity_shares}}"],
    mandatoryClauses: ["Stock Plan Rules 2026", "Board Approval Ratification"],
    aiScore: 97,
    approvalRequired: true,
    approvalChain: ["Board Compensation Committee"],
    updatedAt: "2026-10-11T15:00:00Z",
  },
  {
    id: "ltr-pro-007",
    code: "PRO-ONCALL-PREMIUM",
    title: "24/7 Production On-Call & Standby Allowance Authorization",
    category: "PROMOTION_COMP",
    jurisdiction: "GLOBAL_REMOTE",
    level: "MID",
    employmentType: "FULL_TIME",
    subject: "Authorization: Critical Production Support Standby Allowance",
    summary: "Authorizes ongoing monthly stipends and per-incident surge multipliers for primary on-call engineers.",
    body: `Dear {{candidate_name}},

This addendum formalizes your enrollment in Tier-1 Production Incident Standby Rota.

You will receive an ongoing monthly on-call readiness allowance of \$750 USD plus 1.5x regular hourly compensation for active incident mitigation hours.`,
    supportedMergeTags: ["{{candidate_name}}"],
    mandatoryClauses: ["On-Call SLA Response Times", "Device Connectivity Standard"],
    aiScore: 94,
    approvalRequired: false,
    approvalChain: ["Site Reliability Director"],
    updatedAt: "2026-10-10T16:00:00Z",
  },
  {
    id: "ltr-pro-008",
    code: "PRO-MARKET-CORRECT",
    title: "Off-Cycle Market Benchmarking Equity & Salary Adjustment",
    category: "PROMOTION_COMP",
    jurisdiction: "US",
    level: "SENIOR",
    employmentType: "FULL_TIME",
    subject: "Market Realignment: Proactive Compensation Adjustment",
    summary: "Proactive compensation increase initiated by HR total rewards to ensure high-performing engineering staff remain above market 75th percentile.",
    body: `Dear {{candidate_name}},

Following our comprehensive market total rewards benchmarking analysis, MAX Enterprise is proactively raising your base salary to \${{base_salary}} USD to reflect prevailing industry top-quartile standards.`,
    supportedMergeTags: ["{{candidate_name}}", "{{base_salary}}"],
    mandatoryClauses: ["Market Parity Policy", "Confidentiality"],
    aiScore: 95,
    approvalRequired: true,
    approvalChain: ["VP Total Rewards", "CPO"],
    updatedAt: "2026-10-09T17:00:00Z",
  },
  {
    id: "ltr-pro-009",
    code: "PRO-SHIFT-DIFF",
    title: "Follow-the-Sun Shift Differential & Night Premium Allowance",
    category: "PROMOTION_COMP",
    jurisdiction: "INDIA",
    level: "MID",
    employmentType: "FULL_TIME",
    subject: "Allowance Authorization: Global Follow-the-Sun Shift Differential",
    summary: "Authorizes statutory night shift allowances and door-to-door cab escort for round-the-clock global cloud support personnel.",
    body: `Dear {{candidate_name}},

You are approved for the APAC-to-EMEA Shift Differential Allowance of INR ₹25,000 per month, alongside company-sponsored door-to-door transport.`,
    supportedMergeTags: ["{{candidate_name}}"],
    mandatoryClauses: ["Statutory Shift Norms", "Safety Transport Guidelines"],
    aiScore: 93,
    approvalRequired: false,
    approvalChain: ["India Operations Manager"],
    updatedAt: "2026-10-08T18:00:00Z",
  },
  {
    id: "ltr-pro-010",
    code: "PRO-MILESTONE-BONUS",
    title: "Enterprise V2.0 Platform Launch Milestone Bonus Notification",
    category: "PROMOTION_COMP",
    jurisdiction: "GLOBAL_REMOTE",
    level: "LEAD",
    employmentType: "FULL_TIME",
    subject: "Achievement Award: Enterprise V2.0 Platform Go-Live Bonus",
    summary: "Official congratulations and milestone achievement payout for successfully shipping the next-generation multi-tenant platform on schedule.",
    body: `Dear {{candidate_name}},

Congratulations on the flawless global go-live of MAX ERP V2.0! In accordance with the Project Milestone Charter, you are awarded an achievement bonus of \$10,000 USD.`,
    supportedMergeTags: ["{{candidate_name}}"],
    mandatoryClauses: ["Project Charter Criteria", "Tax Withholding"],
    aiScore: 96,
    approvalRequired: true,
    approvalChain: ["CEO", "CTO"],
    updatedAt: "2026-10-07T19:00:00Z",
  },

  // 10. LEGAL, COMPLIANCE, EXIT & SEPARATION (10)
  {
    id: "ltr-leg-001",
    code: "LEG-NDA-IP",
    title: "Proprietary Information, Inventions Agreement & NDA",
    category: "LEGAL_SEPARATION",
    jurisdiction: "GLOBAL_REMOTE",
    level: "SENIOR",
    employmentType: "FULL_TIME",
    subject: "Legal Agreement: Non-Disclosure, Proprietary Information & Invention Assignment",
    summary: "Essential corporate legal agreement protecting trade secrets, AI training corpora, patentable architectures, and customer databases.",
    body: `PROPRIETARY INFORMATION & INVENTIONS AGREEMENT

This Agreement is entered into by and between MAX Enterprise Global and {{candidate_name}}.

1. CONFIDENTIAL INFORMATION:
Employee agrees to hold all enterprise source code, customer records, pricing algorithms, and unpublished architectural plans in strictest confidence during and after employment.

2. INVENTIONS & INTELLECTUAL PROPERTY:
All inventions, modifications, code commits, and machine learning models developed during tenure belong exclusively to MAX Enterprise Global as 'work made for hire'.

3. NON-SOLICITATION:
Employee agrees not to solicit enterprise customers or employees for a period of twelve (12) months following separation.`,
    supportedMergeTags: ["{{candidate_name}}"],
    mandatoryClauses: ["Trade Secret Protection", "Full IP Assignment", "12-Month Non-Solicit"],
    aiScore: 100,
    approvalRequired: true,
    approvalChain: ["General Counsel"],
    updatedAt: "2026-10-16T17:00:00Z",
  },
  {
    id: "ltr-leg-002",
    code: "LEG-RELIEVING-EXP",
    title: "Official Relieving Order & Service Experience Certificate",
    category: "LEGAL_SEPARATION",
    jurisdiction: "INDIA",
    level: "SENIOR",
    employmentType: "FULL_TIME",
    subject: "Relieving Order & Experience Certificate: {{candidate_name}}",
    summary: "Formal statutory relieving certificate confirming completion of notice period, surrender of company hardware, and exemplary professional conduct.",
    body: `RELIEVING ORDER & EXPERIENCE CERTIFICATE

Date: 16 October 2026
To Whom It May Concern,

This is to certify that {{candidate_name}} was employed with MAX Enterprise India Private Limited from {{start_date}} to our mutually agreed separation date.

During their tenure, they served with distinction as {{job_title}} within our Enterprise Platform Division.

{{candidate_name}} has been relieved of all operational duties upon the close of business hours, having satisfactorily handed over all company credentials and hardware. We confirm their character and conduct have been exemplary.

We wish them every success in their future professional endeavors.

Authorized Signatory
MAX Enterprise India Private Limited`,
    supportedMergeTags: ["{{candidate_name}}", "{{job_title}}", "{{start_date}}"],
    mandatoryClauses: ["Clearance of Dues Certification", "Official Seal & Signature"],
    aiScore: 99,
    approvalRequired: true,
    approvalChain: ["HR Director India"],
    updatedAt: "2026-10-15T18:00:00Z",
  },
  {
    id: "ltr-leg-003",
    code: "LEG-VERIFY-EMPLOY",
    title: "Bonafide Employment & Income Verification Letter",
    category: "LEGAL_SEPARATION",
    jurisdiction: "US",
    level: "MID",
    employmentType: "FULL_TIME",
    subject: "Verification of Employment & Compensation: {{candidate_name}}",
    summary: "Standard bank and mortgage verification letter attesting to permanent full-time employment, current salary, and good standing.",
    body: `To: Mortgage Underwriting / Financial Institutions

RE: Employment Verification for {{candidate_name}}

This letter formally confirms that {{candidate_name}} is currently employed in good standing with MAX Enterprise Global as a regular, full-time {{job_title}}.

Their current annual base compensation is \${{base_salary}} USD. Their original date of hire was {{start_date}}.

Please contact our People Operations desk for any further verification inquiries.

MAX Enterprise Human Resources`,
    supportedMergeTags: ["{{candidate_name}}", "{{job_title}}", "{{base_salary}}", "{{start_date}}"],
    mandatoryClauses: ["Truth in Lending Act Compliance", "Good Standing Certification"],
    aiScore: 98,
    approvalRequired: false,
    approvalChain: ["HR Operations Desk"],
    updatedAt: "2026-10-14T13:00:00Z",
  },
  {
    id: "ltr-leg-004",
    code: "LEG-SEVERANCE-MUTUAL",
    title: "Mutual Separation & General Release of Claims Agreement",
    category: "LEGAL_SEPARATION",
    jurisdiction: "US",
    level: "SENIOR",
    employmentType: "FULL_TIME",
    subject: "Confidential Mutual Separation Agreement & General Release",
    summary: "Comprehensive severance package offering continued pay, COBRA healthcare subsidy, ADEA 21-day review period, and mutual non-disparagement.",
    body: `CONFIDENTIAL SEPARATION AGREEMENT & RELEASE

This Separation Agreement is made between MAX Enterprise Global and {{candidate_name}}.

1. SEVERANCE CONSIDERATION:
Company agrees to pay Employee twelve (12) weeks of severance pay, payable in regular bi-weekly installments, plus 100% employer-paid COBRA premium subsidies for three (3) months.

2. RELEASE OF CLAIMS:
In consideration, Employee waives and releases all claims arising from employment, including claims under Title VII and the ADEA.

3. REVIEW PERIOD:
Employee has 21 calendar days to consider this Agreement and 7 days following execution to revoke.`,
    supportedMergeTags: ["{{candidate_name}}"],
    mandatoryClauses: ["ADEA 21-Day Review Period", "7-Day Revocation Window", "Mutual Non-Disparagement"],
    aiScore: 100,
    approvalRequired: true,
    approvalChain: ["General Counsel", "Chief People Officer"],
    updatedAt: "2026-10-13T14:00:00Z",
  },
  {
    id: "ltr-leg-005",
    code: "LEG-BGV-CONSENT",
    title: "Background Verification (BGV) Candidate Consent Form",
    category: "LEGAL_SEPARATION",
    jurisdiction: "GLOBAL_REMOTE",
    level: "ENTRY",
    employmentType: "FULL_TIME",
    subject: "Background Screening Disclosure & Authorization Form",
    summary: "Fair Credit Reporting Act (FCRA) compliant consent disclosure allowing accredited screening partners to verify academic degrees and criminal history.",
    body: `BACKGROUND VERIFICATION DISCLOSURE & CONSENT

I, {{candidate_name}}, hereby authorize MAX Enterprise Global and its designated background screening partners to conduct background verification, including educational credentials, past employment records, and criminal records checks.`,
    supportedMergeTags: ["{{candidate_name}}"],
    mandatoryClauses: ["FCRA Disclosure Mandate", "Candidate Voluntary Consent"],
    aiScore: 98,
    approvalRequired: false,
    approvalChain: ["Recruiting Coordinator"],
    updatedAt: "2026-10-12T15:00:00Z",
  },
  {
    id: "ltr-leg-006",
    code: "LEG-VISA-SUPPORT",
    title: "Immigration & Work Visa Sponsorship Petition Support Letter",
    category: "LEGAL_SEPARATION",
    jurisdiction: "US",
    level: "SENIOR",
    employmentType: "FULL_TIME",
    subject: "Support Letter for USCIS Form I-129 (H-1B / O-1 Specialty Occupation)",
    summary: "Attestation letter submitted to immigration authorities proving specialty occupation complexity, candidate credentials, and prevailing wage compliance.",
    body: `United States Citizenship and Immigration Services (USCIS)

RE: Form I-129 Petition for Nonimmigrant Worker
Beneficiary: {{candidate_name}}
Position: {{job_title}}

MAX Enterprise Global petitions for {{candidate_name}} in the specialty occupation of {{job_title}}. The position requires at minimum a Bachelor's Degree in Computer Science and specialized distributed systems experience.

We confirm the offered wage of \${{base_salary}} USD meets or exceeds the certified prevailing wage.`,
    supportedMergeTags: ["{{candidate_name}}", "{{job_title}}", "{{base_salary}}"],
    mandatoryClauses: ["Prevailing Wage Attestation", "Specialty Occupation Criteria"],
    aiScore: 99,
    approvalRequired: true,
    approvalChain: ["Immigration Counsel", "VP HR"],
    updatedAt: "2026-10-11T16:00:00Z",
  },
  {
    id: "ltr-leg-007",
    code: "LEG-GARDEN-LEAVE",
    title: "Notice of Garden Leave & Post-Employment Restrictive Covenants",
    category: "LEGAL_SEPARATION",
    jurisdiction: "UK",
    level: "EXECUTIVE",
    employmentType: "EXECUTIVE",
    subject: "Notice: Placement on Garden Leave & Restrictive Covenants Reminder",
    summary: "Directs departing executive to refrain from contacting customers or accessing computer networks during notice period while continuing on full pay.",
    body: `Dear {{candidate_name}},

Following your notice of resignation, MAX Enterprise Systems UK exercises its contractual prerogative under Clause 14 to place you on Garden Leave for your 3-month notice period.

You will remain on full salary and benefits but must not access company networks or contact enterprise clients.`,
    supportedMergeTags: ["{{candidate_name}}"],
    mandatoryClauses: ["Network Disconnection Notice", "Restricted Customer Contact"],
    aiScore: 97,
    approvalRequired: true,
    approvalChain: ["UK Legal Counsel", "Managing Director"],
    updatedAt: "2026-10-10T17:00:00Z",
  },
  {
    id: "ltr-leg-008",
    code: "LEG-ASSET-RETURN",
    title: "Company Property Return Certificate & IT Security Release",
    category: "LEGAL_SEPARATION",
    jurisdiction: "GLOBAL_REMOTE",
    level: "MID",
    employmentType: "FULL_TIME",
    subject: "IT Clearance: Certificate of Asset Return & Credential Revocation",
    summary: "Formal checklist confirming surrender of encrypted MacBooks, YubiKeys, building passes, and wiping of company data on personal devices.",
    body: `CERTIFICATE OF ASSET RETURN & SECURITY RELEASE

Employee: {{candidate_name}}
Employee ID: {{candidate_id}}

IT Security certifies that all company-issued laptops, access cards, and cryptographic credentials have been surrendered and all remote MDM profiles safely wiped.`,
    supportedMergeTags: ["{{candidate_name}}", "{{candidate_id}}"],
    mandatoryClauses: ["MDM Remote Wipe Verification", "Cryptographic Key Surrender"],
    aiScore: 96,
    approvalRequired: false,
    approvalChain: ["IT Service Desk Lead"],
    updatedAt: "2026-10-09T18:00:00Z",
  },
  {
    id: "ltr-leg-009",
    code: "LEG-GOOD-STANDING",
    title: "Letter of Good Standing & Professional Reference",
    category: "LEGAL_SEPARATION",
    jurisdiction: "GLOBAL_REMOTE",
    level: "SENIOR",
    employmentType: "FULL_TIME",
    subject: "Professional Reference & Statement of Good Standing: {{candidate_name}}",
    summary: "Formal corporate letter attesting to candidate's high ethical standards, technical prowess, and eligibility for re-hire.",
    body: `To Whom It May Concern,

MAX Enterprise Global confirms that {{candidate_name}} served with the highest professional standing as {{job_title}}.

Their technical acumen, dedication to software quality, and cooperative team conduct were highly valued. They departed voluntarily and remain eligible for re-hire.`,
    supportedMergeTags: ["{{candidate_name}}", "{{job_title}}"],
    mandatoryClauses: ["Re-Hire Eligibility Attestation", "Corporate Good Standing"],
    aiScore: 97,
    approvalRequired: true,
    approvalChain: ["Head of People Operations"],
    updatedAt: "2026-10-08T19:00:00Z",
  },
  {
    id: "ltr-leg-010",
    code: "LEG-STANDSTILL",
    title: "Mutual Non-Disparagement & Standstill Agreement",
    category: "LEGAL_SEPARATION",
    jurisdiction: "US",
    level: "EXECUTIVE",
    employmentType: "EXECUTIVE",
    subject: "Standstill Agreement & Binding Covenant of Mutual Non-Disparagement",
    summary: "Binding corporate covenant preventing both parties from publishing negative or derogatory remarks in public forums or social media.",
    body: `MUTUAL NON-DISPARAGEMENT COVENANT

Both MAX Enterprise Global and {{candidate_name}} mutually agree not to make, publish, or endorse any disparaging, derogatory, or defamatory statements regarding the other party in any medium, public or private.`,
    supportedMergeTags: ["{{candidate_name}}"],
    mandatoryClauses: ["Liquidated Damages for Breach", "Mutual Enforceability"],
    aiScore: 98,
    approvalRequired: true,
    approvalChain: ["General Counsel"],
    updatedAt: "2026-10-07T20:00:00Z",
  },
];

// In-memory mutable letter repository initialized with our 102 seed letters
let lettersRepository: LetterTemplate[] = [...SEED_LETTERS];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = (searchParams.get("search") || "").toLowerCase().trim();
    const category = searchParams.get("category") || "ALL";
    const jurisdiction = searchParams.get("jurisdiction") || "ALL";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "12", 10);

    let filtered = lettersRepository;

    if (category !== "ALL") {
      filtered = filtered.filter((l) => l.category === category);
    }

    if (jurisdiction !== "ALL") {
      filtered = filtered.filter((l) => l.jurisdiction === jurisdiction);
    }

    if (search) {
      filtered = filtered.filter(
        (l) =>
          l.title.toLowerCase().includes(search) ||
          l.code.toLowerCase().includes(search) ||
          l.summary.toLowerCase().includes(search) ||
          l.subject.toLowerCase().includes(search) ||
          l.mandatoryClauses.some((c) => c.toLowerCase().includes(search))
      );
    }

    const total = filtered.length;
    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      categoriesSummary: {
        ALL: lettersRepository.length,
        ENGINEERING: lettersRepository.filter((l) => l.category === "ENGINEERING").length,
        EXECUTIVE: lettersRepository.filter((l) => l.category === "EXECUTIVE").length,
        PRODUCT: lettersRepository.filter((l) => l.category === "PRODUCT").length,
        SALES: lettersRepository.filter((l) => l.category === "SALES").length,
        HR: lettersRepository.filter((l) => l.category === "HR").length,
        REMOTE_CONTRACT: lettersRepository.filter((l) => l.category === "REMOTE_CONTRACT").length,
        INTERNSHIP: lettersRepository.filter((l) => l.category === "INTERNSHIP").length,
        APPOINTMENT: lettersRepository.filter((l) => l.category === "APPOINTMENT").length,
        PROMOTION_COMP: lettersRepository.filter((l) => l.category === "PROMOTION_COMP").length,
        LEGAL_SEPARATION: lettersRepository.filter((l) => l.category === "LEGAL_SEPARATION").length,
      },
      letters: paginated,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to load letters: " + String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newLetter: LetterTemplate = {
      id: `ltr-custom-${Date.now()}`,
      code: body.code || `LTR-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      title: body.title || "Custom Letter Template",
      category: body.category || "ENGINEERING",
      jurisdiction: body.jurisdiction || "GLOBAL_REMOTE",
      level: body.level || "SENIOR",
      employmentType: body.employmentType || "FULL_TIME",
      subject: body.subject || "Formal Notification - MAX Enterprise",
      summary: body.summary || "Custom user/AI authored enterprise letter template.",
      body: body.body || "",
      supportedMergeTags: body.supportedMergeTags || ["{{candidate_name}}", "{{base_salary}}", "{{start_date}}"],
      mandatoryClauses: body.mandatoryClauses || ["At-Will Employment", "IP Assignment"],
      aiScore: body.aiScore || 96,
      isAiGenerated: !!body.isAiGenerated,
      approvalRequired: body.approvalRequired !== false,
      approvalChain: body.approvalChain || ["VP Engineering", "Head of People"],
      updatedAt: new Date().toISOString(),
    };

    lettersRepository.unshift(newLetter);
    return NextResponse.json(newLetter, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create letter: " + String(error) }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const index = lettersRepository.findIndex((l) => l.id === body.id);
    if (index === -1) {
      return NextResponse.json({ error: "Letter not found" }, { status: 404 });
    }

    lettersRepository[index] = {
      ...lettersRepository[index],
      ...body,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(lettersRepository[index]);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update letter: " + String(error) }, { status: 500 });
  }
}
