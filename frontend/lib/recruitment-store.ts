// MAX-ERP Recruitment Data Store & Domain Model
// Source of truth for Screen 1 (Recruiting Dashboard) & Screen 2 (Job Requisitions List)

export interface Requisition {
  id: string;
  reqNumber: string;
  title: string;
  employmentType: "Full-time" | "Part-time" | "Contract";
  jobLevel: "Entry Level" | "Mid Level" | "Senior" | "Lead" | "Director";
  department: "Engineering" | "Product" | "HR" | "Finance" | "Sales" | "Design" | "Marketing" | "Legal" | "IT" | "Executive";
  location: string;
  isRemote?: boolean;
  legalEntity?: string;
  workArrangement?: string;
  targetStartDate?: string;
  hiringManager: {
    name: string;
    avatar: string;
    email: string;
    title: string;
  };
  recruiter?: {
    name: string;
    avatar?: string;
    email?: string;
  };
  interviewers?: string[];
  status: "Draft" | "Pending Approval" | "Open" | "On Hold" | "Filled" | "Cancelled" | "In Review" | "Closed";
  targetHeadcount: number;
  filledHeadcount: number;
  salaryRange: string;
  currency?: string;
  costCenter?: string;
  vacancyReason?: string;
  replacementEmployee?: string;
  createdOn: string;
  approvalStep?: number;
  totalApprovalSteps?: number;
  description?: string;
  responsibilities?: string[];
  requiredQualifications?: string[];
  preferredQualifications?: string[];
  requiredSkills: string[];
  minExperience?: number;
  maxExperience?: number;
  educationLevel?: string;
  customFields?: Record<string, any>;
  jobCode?: string;
  requisitionTemplate?: string;
  budgetApproved?: string;
  createdBy?: string;
  lastUpdated?: string;
  daysOpen?: string;
  approvalHistory?: Array<{
    step: number;
    role: string;
    name: string;
    date: string;
    status: "APPROVED" | "PENDING" | "REJECTED";
    comments?: string;
  }>;
  candidateCount?: number;
  interviewCount?: number;
  offerCount?: number;
}

export interface CandidateItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  requisitionId: string;
  requisitionTitle: string;
  department: string;
  stage: "Applied" | "Screening" | "Interview" | "Offer" | "Hired" | "Rejected" | "Withdrawn";
  source: string;
  matchScore: number;
  avatar?: string;
  initials?: string;
  appliedDate: string;
  interviewNotes?: string;
  role?: string;
  statusLabel?: "In Review" | "New" | "Shortlisted" | "Interview" | "Offer" | "BGV" | "Hired" | "Rejected";
  recruiter?: string;
  location?: string;
  fitLevel?: "Excellent Fit" | "Good Fit" | "Moderate Fit" | "Poor Fit" | "Strong Fit" | "Partial Fit";
  skillsBreakdown?: { name: string; percentage?: number; match?: number; color?: string; status?: "Matched" | "Partial" | "Missing" }[];
  relevantExperience?: { metric: string; label: string; icon: string }[];
  aiSummary?: string;
  recommendedNextStep?: string;
}

export interface InterviewItem {
  id: string;
  candidateName: string;
  candidateEmail: string;
  requisitionId: string;
  requisitionTitle: string;
  roundType: string;
  scheduledDate: string;
  time: string;
  interviewerNames: string[];
  meetingLink: string;
  platform: "Microsoft Teams" | "Google Meet" | "In-Person" | "Phone";
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED";
}

export interface ApprovalStep {
  level: number;
  title: string;
  approverName: string;
  approverRole: string;
  approverEmail?: string;
  status: "APPROVED" | "PENDING" | "WAITING" | "REJECTED";
  decidedAt?: string;
  comments?: string;
}

export interface OfferItem {
  id: string;
  candidateName: string;
  candidateEmail?: string;
  candidatePhone?: string;
  candidateLocation?: string;
  requisitionId: string;
  requisitionTitle: string;
  department?: string;
  baseSalary: string;
  variableBonus?: string;
  equity?: string;
  signOnBonus?: string;
  totalComp?: string;
  compaRatio?: string;
  targetStartDate: string;
  status: "Draft" | "Pending Approval" | "Approved" | "Sent" | "Accepted" | "Declined";
  approvedBy?: string;
  currentApprovalLevel?: number; // 1: Hiring Manager, 2: VP / Higher Level, 3: Finance
  approvalChain?: ApprovalStep[];
  offerLetterTemplateId?: string;
  offerLetterTemplateTitle?: string;
  letterContent?: string;
  sentAt?: string;
  expiresAt?: string;
  eSignatureStatus?: "NOT_SENT" | "PENDING_SIGNATURE" | "SIGNED" | "DECLINED";
  eSignatureProvider?: string;
  notes?: string;
}

export interface ActivityItem {
  id: string;
  requisitionId: string;
  user: string;
  action: string;
  timestamp: string;
  details?: string;
}

export interface JobBoardIntegration {
  id: string;
  name: string;
  logoLetter: string;
  logoBg: string;
  logoColor: string;
  tier: "FREE" | "PREMIUM";
  status: "CONFIGURED" | "NOT_CONFIGURED" | "CONNECTED";
  description: string;
  eligibilityNotice?: string;
  requiresCredentials?: boolean;
  configuredAt?: string;
  externalUrl?: string;
}

export interface CareerSitePosting {
  id: string;
  requisitionId: string;
  careerSiteTitle: string;
  urlSlug: string;
  category: string;
  location: string;
  employmentType: string;
  workArrangement: string;
  applicationDeadline: string;
  startDate: string;
  durationDays: number;
  showOnHomepage: boolean;
  featured: boolean;
  showInSearch: boolean;
  selectedBoardIds: string[];
  jobDescription: string;
  responsibilities: string[];
  qualifications: string[];
  additionalInfo: string;
  status: "DRAFT" | "PENDING_REVIEW" | "PUBLISHED";
  lastSavedAt: string;
  publishedAt?: string;
}

export interface RecruitingTask {
  id: string;
  title: string;
  relatedTo: string;
  category: "Approvals" | "Interviews" | "Candidates";
  type: "Approval" | "Review" | "Interview" | "Offer";
  dueDate: string;
  isUrgent?: boolean;
  actionUrl: string;
}

export interface CommunicationMessage {
  id: string;
  senderName: string;
  senderRole: "Candidate" | "Colleague" | "Hiring Manager" | "System";
  senderAvatar?: string;
  senderInitials?: string;
  subject: string;
  preview: string;
  timestamp: string;
  unreadCount?: number;
  category: "Candidates" | "Colleagues";
}

export interface InterviewScorecard {
  id: string;
  candidateId: string;
  candidateName: string;
  requisitionId: string;
  requisitionTitle: string;
  interviewerId: string;
  interviewerName: string;
  interviewerRole: string;
  roundType: "TECHNICAL_SCREEN" | "SYSTEM_ARCHITECTURE" | "BEHAVIORAL_CULTURE" | "EXECUTIVE_FINAL";
  overallRecommendation: "STRONG_HIRE" | "HIRE" | "LEANING_HIRE" | "LEANING_NO_HIRE" | "STRONG_NO_HIRE";
  competencyRatings: {
    technicalProficiency: number;
    systemDesignArchitecture: number;
    problemSolvingVelocity: number;
    communicationAndTeamwork: number;
    cultureAndValuesAdd: number;
  };
  strengthsSummary: string;
  areasOfConcern: string;
  notes: string;
  submittedAt: string;
  isBlindReview: boolean;
}

export interface JobPostingChannel {
  id: string;
  requisitionId: string;
  requisitionTitle: string;
  channel: "CAREERS_PORTAL" | "LINKEDIN" | "INDEED" | "GLASSDOOR" | "INTERNAL_BOARD";
  status: "ACTIVE" | "PAUSED" | "EXPIRED";
  publishedAt: string;
  expiresAt: string;
  viewsCount: number;
  clicksCount: number;
  applicationsCount: number;
  costUsd: number;
  externalUrl?: string;
}

export interface CandidateAssessment {
  id: string;
  candidateId: string;
  candidateName: string;
  requisitionId: string;
  requisitionTitle: string;
  testId: string;
  testTitle: string;
  provider: "SYSTEM_NATIVE" | "HACKERRANK" | "CODILITY" | "TESTGORILLA";
  category: "TECHNICAL_CODING" | "APTITUDE_LOGIC" | "SYSTEM_ARCHITECTURE" | "SALES_SIMULATION";
  durationMinutes: number;
  passingScorePct: number;
  candidateScorePct?: number;
  status: "ASSIGNED" | "IN_PROGRESS" | "PASSED" | "FAILED" | "EXPIRED";
  assignedAt: string;
  completedAt?: string;
  externalInviteUrl?: string;
  adminNotes?: string;
}

export interface BgvCheck {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  requisitionId: string;
  requisitionTitle: string;
  provider: "INTERNAL_HR" | "CHECKR_GLOBAL" | "FIRST_ADVANTAGE";
  status: "INITIATED" | "IN_PROGRESS" | "CLEARED" | "FLAGGED" | "REJECTED";
  checks: {
    criminalCheck: "PENDING" | "PASSED" | "FLAGGED";
    educationVerification: "PENDING" | "PASSED" | "FLAGGED";
    employmentHistory: "PENDING" | "PASSED" | "FLAGGED";
    identityAndDrug: "PENDING" | "PASSED" | "FLAGGED";
  };
  initiatedAt: string;
  completedAt?: string;
  assignedInvestigator: string;
  reportNotes?: string;
}

export interface AgencyPartner {
  id: string;
  name: string;
  contactPerson: string;
  contactEmail: string;
  phone: string;
  commissionPct: number;
  guaranteePeriodDays: number;
  status: "ACTIVE" | "INACTIVE";
  totalCandidatesSubmitted: number;
  totalHired: number;
  totalCommissionsPaidUsd: number;
  specialty: string;
}

export interface AgencyCandidateSubmission {
  id: string;
  agencyId: string;
  agencyName: string;
  candidateName: string;
  candidateEmail: string;
  requisitionId: string;
  requisitionTitle: string;
  proposedSalaryUsd: number;
  calculatedFeeUsd: number;
  status: "SUBMITTED" | "IN_REVIEW" | "HIRED" | "REJECTED";
  submittedAt: string;
}

export interface PreOnboardingRecord {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  requisitionId: string;
  requisitionTitle: string;
  department: string;
  targetStartDate: string;
  status: "INITIATED" | "IN_PROGRESS" | "READY_FOR_HIRE" | "COMPLETED";
  progressPct: number;
  tasks: {
    welcomePacketSent: boolean;
    identityDocumentsUploaded: boolean;
    taxFormsCompleted: boolean;
    confidentialitySigned: boolean;
    itHardwareRequested: boolean;
    emailAndAccountsProvisioned: boolean;
    orientationBuddyAssigned: boolean;
  };
  hardwareSelected?: "MACBOOK_PRO_M3" | "THINKPAD_P16" | "DELL_PRECISION";
  workEmailAllocated?: string;
  orientationBuddyName?: string;
  notes?: string;
}

export const INITIAL_REQUISITIONS: Requisition[] = [
  {
    id: "req-123",
    reqNumber: "REQ-2026-00123",
    title: "Senior Java Developer",
    employmentType: "Full-time",
    jobLevel: "Senior",
    department: "Engineering",
    location: "Bangalore, India",
    isRemote: false,
    workArrangement: "Hybrid",
    targetHeadcount: 2,
    filledHeadcount: 0,
    targetStartDate: "01 Dec 2026",
    legalEntity: "MAX Technologies Pvt Ltd",
    jobCode: "JD-2026-00123",
    requisitionTemplate: "Standard Engineering Template",
    costCenter: "ENG-001 - Engineering",
    salaryRange: "₹ 12,00,000 - 18,00,000",
    currency: "INR",
    vacancyReason: "New Position",
    replacementEmployee: "-",
    budgetApproved: "Yes",
    createdBy: "John Smith",
    createdOn: "08 Oct 2026",
    lastUpdated: "10 Oct 2026",
    daysOpen: "7 days",
    hiringManager: {
      name: "Priya Menon",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=faces",
      email: "priya.menon@max-enterprise.com",
      title: "Engineering Director",
    },
    recruiter: {
      name: "John Smith (You)",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces",
      email: "john.smith@max-enterprise.com",
    },
    interviewers: ["David Miller", "Elena Rostova", "Ravi Kumar", "Anita Menon"],
    status: "Open",
    approvalStep: 3,
    totalApprovalSteps: 3,
    candidateCount: 28,
    interviewCount: 2,
    offerCount: 0,
    description: "We are looking for a Senior Java Developer to join our engineering team. The ideal candidate will have strong experience in Java, Spring Boot and enterprise applications. You will design, develop and maintain scalable backend services and collaborate with cross-functional teams.",
    responsibilities: [
      "Design and develop enterprise applications using Java and Spring Boot",
      "Collaborate with product and design teams",
      "Ensure high performance and scalability",
      "Participate in code reviews and mentor junior developers",
    ],
    requiredQualifications: ["Bachelor's Degree", "Computer Science"],
    preferredQualifications: ["Master's Degree", "Cloud Certification"],
    requiredSkills: ["Java", "Spring Boot", "Microservices"],
    minExperience: 5,
    maxExperience: 10,
    educationLevel: "Bachelor's Degree",
    customFields: {
      businessUnit: "Product Engineering",
      jobCategory: "Technology",
      travelPercentage: "Up to 10%",
      workShift: "Day Shift",
      remoteAllowed: "Yes",
    },
    approvalHistory: [
      {
        step: 1,
        role: "Hiring Manager",
        name: "Maria Lopez",
        date: "10 Oct 2026",
        status: "APPROVED",
        comments: "Headcount verified and aligned with Q4 microservices expansion deliverables.",
      },
      {
        step: 2,
        role: "Department Head",
        name: "Ravi Kumar",
        date: "12 Oct 2026",
        status: "APPROVED",
        comments: "Annual budget allocation verified under FY26 Engineering Opex budget.",
      },
      {
        step: 3,
        role: "HR Approval",
        name: "Anita Menon",
        date: "15 Oct 2026",
        status: "APPROVED",
        comments: "Pay scale verified against Bangalore regional enterprise software benchmarks.",
      },
    ],
  },
  {
    id: "req-122",
    reqNumber: "REQ-2026-00122",
    title: "SAP SuccessFactors Consultant",
    employmentType: "Full-time",
    jobLevel: "Senior",
    department: "Engineering",
    location: "Hyderabad, India",
    isRemote: false,
    workArrangement: "Hybrid",
    targetHeadcount: 2,
    filledHeadcount: 0,
    targetStartDate: "15 Dec 2026",
    legalEntity: "MAX Technologies Pvt Ltd",
    salaryRange: "₹ 18,00,000 - 24,00,000",
    createdOn: "07 Oct 2026",
    lastUpdated: "09 Oct 2026",
    hiringManager: {
      name: "Rohit S",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces",
      email: "rohit.s@max-enterprise.com",
      title: "SAP Practice Lead",
    },
    status: "Open",
    candidateCount: 16,
    requiredSkills: ["SAP SuccessFactors", "Employee Central", "Integration Center"],
  },
  {
    id: "req-121",
    reqNumber: "REQ-2026-00121",
    title: "Product Manager",
    employmentType: "Full-time",
    jobLevel: "Lead",
    department: "Product",
    location: "Bangalore, India",
    isRemote: false,
    workArrangement: "On-site",
    targetHeadcount: 1,
    filledHeadcount: 0,
    targetStartDate: "01 Jan 2027",
    legalEntity: "MAX Technologies Pvt Ltd",
    salaryRange: "₹ 22,00,000 - 30,00,000",
    createdOn: "06 Oct 2026",
    lastUpdated: "08 Oct 2026",
    hiringManager: {
      name: "Anita Desai",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces",
      email: "anita.desai@max-enterprise.com",
      title: "VP of Product",
    },
    status: "In Review",
    candidateCount: 24,
    requiredSkills: ["Product Strategy", "Roadmapping", "Enterprise B2B"],
  },
  {
    id: "req-120",
    reqNumber: "REQ-2026-00120",
    title: "UI/UX Designer",
    employmentType: "Full-time",
    jobLevel: "Mid Level",
    department: "Design",
    location: "Remote",
    isRemote: true,
    workArrangement: "Remote",
    targetHeadcount: 1,
    filledHeadcount: 0,
    targetStartDate: "15 Nov 2026",
    legalEntity: "MAX Technologies Pvt Ltd",
    salaryRange: "₹ 14,00,000 - 19,00,000",
    createdOn: "05 Oct 2026",
    lastUpdated: "07 Oct 2026",
    hiringManager: {
      name: "Vikram K",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces",
      email: "vikram.k@max-enterprise.com",
      title: "Design Director",
    },
    status: "Open",
    candidateCount: 12,
    requiredSkills: ["Figma", "Design Systems", "User Research"],
  },
  {
    id: "req-119",
    reqNumber: "REQ-2026-00119",
    title: "DevOps Engineer",
    employmentType: "Full-time",
    jobLevel: "Senior",
    department: "Engineering",
    location: "Chennai, India",
    isRemote: false,
    workArrangement: "Hybrid",
    targetHeadcount: 1,
    filledHeadcount: 0,
    targetStartDate: "01 Dec 2026",
    legalEntity: "MAX Technologies Pvt Ltd",
    salaryRange: "₹ 16,00,000 - 22,00,000",
    createdOn: "04 Oct 2026",
    lastUpdated: "06 Oct 2026",
    hiringManager: {
      name: "Karthik T",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=faces",
      email: "karthik.t@max-enterprise.com",
      title: "DevOps Lead",
    },
    status: "On Hold",
    candidateCount: 10,
    requiredSkills: ["Kubernetes", "AWS", "CI/CD", "Terraform"],
  },
  {
    id: "req-118",
    reqNumber: "REQ-2026-00118",
    title: "HR Executive",
    employmentType: "Full-time",
    jobLevel: "Mid Level",
    department: "HR",
    location: "Bangalore, India",
    isRemote: false,
    workArrangement: "On-site",
    targetHeadcount: 1,
    filledHeadcount: 0,
    targetStartDate: "15 Nov 2026",
    legalEntity: "MAX Technologies Pvt Ltd",
    salaryRange: "₹ 8,00,000 - 12,00,000",
    createdOn: "03 Oct 2026",
    lastUpdated: "05 Oct 2026",
    hiringManager: {
      name: "Neha Raj",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=faces",
      email: "neha.raj@max-enterprise.com",
      title: "HR Business Partner",
    },
    status: "Open",
    candidateCount: 8,
    requiredSkills: ["Talent Acquisition", "Employee Relations", "HR Operations"],
  },
  {
    id: "req-117",
    reqNumber: "REQ-2026-00117",
    title: "Data Analyst",
    employmentType: "Full-time",
    jobLevel: "Mid Level",
    department: "Engineering",
    location: "Pune, India",
    isRemote: false,
    workArrangement: "Hybrid",
    targetHeadcount: 1,
    filledHeadcount: 1,
    targetStartDate: "01 Nov 2026",
    legalEntity: "MAX Technologies Pvt Ltd",
    salaryRange: "₹ 11,00,000 - 15,00,000",
    createdOn: "02 Oct 2026",
    lastUpdated: "04 Oct 2026",
    hiringManager: {
      name: "Suresh N",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop&crop=faces",
      email: "suresh.n@max-enterprise.com",
      title: "Data Analytics Lead",
    },
    status: "Closed",
    candidateCount: 32,
    requiredSkills: ["SQL", "Power BI", "Python", "Data Modeling"],
  },
  {
    id: "req-048",
    reqNumber: "REQ-2026-0048",
    title: "Senior Java Developer",
    employmentType: "Full-time",
    jobLevel: "Mid Level",
    department: "Engineering",
    location: "New York",
    hiringManager: {
      name: "Maria Lopez",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces",
      email: "maria.lopez@max-enterprise.com",
      title: "Engineering Director",
    },
    status: "Pending Approval",
    targetHeadcount: 1,
    filledHeadcount: 0,
    salaryRange: "$150,000 - $175,000",
    createdOn: "12 Oct 2026",
    approvalStep: 2,
    totalApprovalSteps: 3,
    description: "Design and implement core distributed backend microservices utilizing Java 21, Spring Boot 3, and Kafka event streaming.",
    requiredSkills: ["Java 21", "Spring Boot", "Kafka", "PostgreSQL", "Docker"],
  },
  {
    id: "req-047",
    reqNumber: "REQ-2026-0047",
    title: "Product Manager",
    employmentType: "Full-time",
    jobLevel: "Mid Level",
    department: "Product",
    location: "Bangalore",
    hiringManager: {
      name: "Rohit Sharma",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces",
      email: "rohit.sharma@max-enterprise.com",
      title: "VP of Product",
    },
    status: "Open",
    targetHeadcount: 2,
    filledHeadcount: 2,
    salaryRange: "$130,000 - $155,000",
    createdOn: "11 Oct 2026",
    description: "Own the enterprise workflow configuration product roadmaps from ideation to telemetry adoption.",
    requiredSkills: ["Product Strategy", "SaaS Analytics", "User Research", "Agile Roadmap"],
  },
  {
    id: "req-046",
    reqNumber: "REQ-2026-0046",
    title: "HR Business Partner",
    employmentType: "Full-time",
    jobLevel: "Senior",
    department: "HR",
    location: "Singapore",
    hiringManager: {
      name: "Priya Nair",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=faces",
      email: "priya.nair@max-enterprise.com",
      title: "Chief People Officer",
    },
    status: "Open",
    targetHeadcount: 1,
    filledHeadcount: 1,
    salaryRange: "$115,000 - $140,000",
    createdOn: "10 Oct 2026",
    description: "Partner with global business unit leaders on workforce planning, talent development, and succession mapping.",
    requiredSkills: ["Strategic HR", "Workforce Planning", "Employee Relations", "Succession Planning"],
  },
  {
    id: "req-045",
    reqNumber: "REQ-2026-0045",
    title: "DevOps Engineer",
    employmentType: "Full-time",
    jobLevel: "Mid Level",
    department: "Engineering",
    location: "Remote",
    isRemote: true,
    hiringManager: {
      name: "Arjun Mehta",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces",
      email: "arjun.mehta@max-enterprise.com",
      title: "DevOps Lead",
    },
    status: "On Hold",
    targetHeadcount: 1,
    filledHeadcount: 0,
    salaryRange: "$135,000 - $160,000",
    createdOn: "09 Oct 2026",
    description: "Build robust infrastructure automation, GitOps pipelines, and Kubernetes multi-cluster observability.",
    requiredSkills: ["Kubernetes", "Terraform", "AWS", "Prometheus", "CI/CD"],
  },
  {
    id: "req-044",
    reqNumber: "REQ-2026-0044",
    title: "Finance Analyst",
    employmentType: "Full-time",
    jobLevel: "Entry Level",
    department: "Finance",
    location: "Dubai",
    hiringManager: {
      name: "Sneha Patel",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=faces",
      email: "sneha.patel@max-enterprise.com",
      title: "Finance Controller",
    },
    status: "Filled",
    targetHeadcount: 1,
    filledHeadcount: 1,
    salaryRange: "$95,000 - $120,000",
    createdOn: "08 Oct 2026",
    description: "Execute variance analysis, financial models, and statutory audit reconciliations across EMEA operations.",
    requiredSkills: ["FP&A", "Financial Modeling", "US GAAP", "Excel Advanced"],
  },
  {
    id: "req-043",
    reqNumber: "REQ-2026-0043",
    title: "UI/UX Designer",
    employmentType: "Full-time",
    jobLevel: "Mid Level",
    department: "Design",
    location: "Bangalore",
    hiringManager: {
      name: "Karthik Raj",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=faces",
      email: "karthik.raj@max-enterprise.com",
      title: "Design Director",
    },
    status: "Open",
    targetHeadcount: 1,
    filledHeadcount: 0,
    salaryRange: "$120,000 - $145,000",
    createdOn: "07 Oct 2026",
    description: "Design pixel-perfect enterprise user interfaces, design systems, and cohesive interactive micro-interactions.",
    requiredSkills: ["Figma", "Design Systems", "User Testing", "Enterprise UX"],
  },
  {
    id: "req-042",
    reqNumber: "REQ-2026-0042",
    title: "Data Analyst",
    employmentType: "Full-time",
    jobLevel: "Entry Level",
    department: "Product",
    location: "New York",
    hiringManager: {
      name: "Maria Lopez",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces",
      email: "maria.lopez@max-enterprise.com",
      title: "Engineering Director",
    },
    status: "Pending Approval",
    targetHeadcount: 1,
    filledHeadcount: 0,
    salaryRange: "$100,000 - $125,000",
    createdOn: "06 Oct 2026",
    approvalStep: 1,
    totalApprovalSteps: 3,
    description: "Synthesize platform telemetry and product funnels into executive dashboards and automated KPI alerts.",
    requiredSkills: ["SQL", "Python", "Tableau", "Product Analytics"],
  },
  {
    id: "req-041",
    reqNumber: "REQ-2026-0041",
    title: "QA Automation Engineer",
    employmentType: "Full-time",
    jobLevel: "Mid Level",
    department: "Engineering",
    location: "Chennai",
    hiringManager: {
      name: "Rohit Sharma",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces",
      email: "rohit.sharma@max-enterprise.com",
      title: "VP of Product",
    },
    status: "Open",
    targetHeadcount: 1,
    filledHeadcount: 0,
    salaryRange: "$110,000 - $135,000",
    createdOn: "05 Oct 2026",
    description: "Develop automated end-to-end regression test suites with Playwright, Jest, and performance load tests.",
    requiredSkills: ["Playwright", "TypeScript", "CI/CD Automation", "Test Architecture"],
  },
  {
    id: "req-040",
    reqNumber: "REQ-2026-0040",
    title: "Principal Cloud Architect",
    employmentType: "Full-time",
    jobLevel: "Lead",
    department: "Engineering",
    location: "Remote",
    isRemote: true,
    hiringManager: {
      name: "Marcus Chen",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop&crop=faces",
      email: "marcus.chen@max-enterprise.com",
      title: "CTO",
    },
    status: "Open",
    targetHeadcount: 1,
    filledHeadcount: 0,
    salaryRange: "$220,000 - $260,000",
    createdOn: "04 Oct 2026",
    description: "Lead multi-region active-active distributed architecture, sovereign cloud tenancy, and zero-trust perimeter.",
    requiredSkills: ["Cloud Architecture", "Distributed Systems", "Zero Trust", "Sovereign Cloud"],
  },
  {
    id: "req-039",
    reqNumber: "REQ-2026-0039",
    title: "Technical Recruiter",
    employmentType: "Full-time",
    jobLevel: "Mid Level",
    department: "HR",
    location: "New York",
    hiringManager: {
      name: "Priya Nair",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=faces",
      email: "priya.nair@max-enterprise.com",
      title: "Chief People Officer",
    },
    status: "Filled",
    targetHeadcount: 1,
    filledHeadcount: 1,
    salaryRange: "$105,000 - $130,000",
    createdOn: "03 Oct 2026",
    description: "Scale high-performing software engineering teams across Americas and EMEA.",
    requiredSkills: ["Full-Lifecycle Recruiting", "Tech Sourcing", "Talent Brand"],
  },
  {
    id: "req-038",
    reqNumber: "REQ-2026-0038",
    title: "Solutions Architect",
    employmentType: "Full-time",
    jobLevel: "Senior",
    department: "Sales",
    location: "London",
    hiringManager: {
      name: "Olivia Taylor",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=faces",
      email: "olivia.taylor@max-enterprise.com",
      title: "VP Sales EMEA",
    },
    status: "Open",
    targetHeadcount: 1,
    filledHeadcount: 0,
    salaryRange: "$160,000 - $190,000",
    createdOn: "02 Oct 2026",
    description: "Deliver high-impact technical demonstrations and architecture blueprints for Fortune 500 customers.",
    requiredSkills: ["Pre-Sales Engineering", "ERP Migration", "Enterprise Cloud"],
  },
  {
    id: "req-037",
    reqNumber: "REQ-2026-0037",
    title: "Compliance & Risk Analyst",
    employmentType: "Full-time",
    jobLevel: "Mid Level",
    department: "Finance",
    location: "Dublin",
    hiringManager: {
      name: "Rachel Green",
      avatar: "https://images.unsplash.com/photo-1548142813-c348350df52b?w=100&h=100&fit=crop&crop=faces",
      email: "rachel.green@max-enterprise.com",
      title: "Head of Risk & Audit",
    },
    status: "Pending Approval",
    targetHeadcount: 1,
    filledHeadcount: 0,
    salaryRange: "$110,000 - $135,000",
    createdOn: "01 Oct 2026",
    approvalStep: 1,
    totalApprovalSteps: 2,
    description: "Oversee SOC2 Type II, ISO 27001, and statutory financial governance frameworks.",
    requiredSkills: ["SOC2", "ISO 27001", "Internal Controls", "Risk Management"],
  },
  {
    id: "req-036",
    reqNumber: "REQ-2026-0036",
    title: "Security Operations Lead",
    employmentType: "Full-time",
    jobLevel: "Lead",
    department: "Engineering",
    location: "Remote",
    isRemote: true,
    hiringManager: {
      name: "Marcus Chen",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop&crop=faces",
      email: "marcus.chen@max-enterprise.com",
      title: "CTO",
    },
    status: "Open",
    targetHeadcount: 1,
    filledHeadcount: 0,
    salaryRange: "$180,000 - $215,000",
    createdOn: "30 Sep 2026",
    description: "Direct 24/7 SIEM threat hunting, incident response, and automated vulnerability management.",
    requiredSkills: ["SecOps", "SIEM", "Incident Response", "Threat Modeling"],
  },
  {
    id: "req-035",
    reqNumber: "REQ-2026-0035",
    title: "Marketing Growth Specialist",
    employmentType: "Full-time",
    jobLevel: "Mid Level",
    department: "Marketing",
    location: "San Francisco",
    hiringManager: {
      name: "David Rossi",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=faces",
      email: "david.rossi@max-enterprise.com",
      title: "CMO",
    },
    status: "Draft",
    targetHeadcount: 1,
    filledHeadcount: 0,
    salaryRange: "$110,000 - $130,000",
    createdOn: "29 Sep 2026",
    description: "Drive multi-channel demand generation, enterprise ABM campaigns, and inbound acquisition pipelines.",
    requiredSkills: ["Demand Gen", "ABM", "HubSpot", "Performance Marketing"],
  },
  {
    id: "req-034",
    reqNumber: "REQ-2026-0034",
    title: "Customer Success Manager",
    employmentType: "Full-time",
    jobLevel: "Senior",
    department: "Sales",
    location: "New York",
    hiringManager: {
      name: "Olivia Taylor",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=faces",
      email: "olivia.taylor@max-enterprise.com",
      title: "VP Sales EMEA",
    },
    status: "Filled",
    targetHeadcount: 1,
    filledHeadcount: 1,
    salaryRange: "$120,000 - $145,000",
    createdOn: "28 Sep 2026",
    description: "Champion client onboarding, net retention rate (NRR) expansion, and executive QBR cadence.",
    requiredSkills: ["Customer Retention", "Executive QBRs", "SaaS Expansion"],
  },
  {
    id: "req-033",
    reqNumber: "REQ-2026-0033",
    title: "Frontend Engineer (Next.js/React)",
    employmentType: "Full-time",
    jobLevel: "Mid Level",
    department: "Engineering",
    location: "Remote",
    isRemote: true,
    hiringManager: {
      name: "Arjun Mehta",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces",
      email: "arjun.mehta@max-enterprise.com",
      title: "DevOps Lead",
    },
    status: "Open",
    targetHeadcount: 1,
    filledHeadcount: 0,
    salaryRange: "$130,000 - $155,000",
    createdOn: "27 Sep 2026",
    description: "Build high-performance web components with Next.js App Router, Tailwind CSS, and stateful widgets.",
    requiredSkills: ["Next.js", "React 19", "Tailwind CSS", "TypeScript"],
  },
  {
    id: "req-032",
    reqNumber: "REQ-2026-0032",
    title: "Site Reliability Engineer",
    employmentType: "Full-time",
    jobLevel: "Senior",
    department: "Engineering",
    location: "Remote",
    isRemote: true,
    hiringManager: {
      name: "Marcus Chen",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop&crop=faces",
      email: "marcus.chen@max-enterprise.com",
      title: "CTO",
    },
    status: "Pending Approval",
    targetHeadcount: 1,
    filledHeadcount: 0,
    salaryRange: "$165,000 - $195,000",
    createdOn: "26 Sep 2026",
    approvalStep: 2,
    totalApprovalSteps: 3,
    description: "Uphold 99.99% availability SLAs across global multi-tenant microservices clusters.",
    requiredSkills: ["SRE", "Linux Kernel", "Kubernetes", "Observability"],
  },
  {
    id: "req-031",
    reqNumber: "REQ-2026-0031",
    title: "Corporate Legal Counsel",
    employmentType: "Full-time",
    jobLevel: "Senior",
    department: "Legal",
    location: "New York",
    hiringManager: {
      name: "Sarah Jenkins",
      avatar: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=100&h=100&fit=crop&crop=faces",
      email: "sarah.jenkins@max-enterprise.com",
      title: "General Counsel",
    },
    status: "Filled",
    targetHeadcount: 1,
    filledHeadcount: 1,
    salaryRange: "$175,000 - $210,000",
    createdOn: "25 Sep 2026",
    description: "Manage commercial customer contracts, software licensing, IP protection, and vendor SLAs.",
    requiredSkills: ["Commercial Contracts", "SaaS Agreements", "IP Law", "Compliance"],
  },
  {
    id: "req-030",
    reqNumber: "REQ-2026-0030",
    title: "Business Systems Analyst",
    employmentType: "Full-time",
    jobLevel: "Mid Level",
    department: "IT",
    location: "Bangalore",
    hiringManager: {
      name: "Rohit Sharma",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces",
      email: "rohit.sharma@max-enterprise.com",
      title: "VP of Product",
    },
    status: "Draft",
    targetHeadcount: 1,
    filledHeadcount: 0,
    salaryRange: "$95,000 - $120,000",
    createdOn: "24 Sep 2026",
    description: "Bridge business requirements with ERP workflows, custom business objects, and data pipelines.",
    requiredSkills: ["ERP Systems", "Business Analysis", "Workflow Design"],
  },
  {
    id: "req-029",
    reqNumber: "REQ-2026-0029",
    title: "Mobile App Engineer (iOS/Android)",
    employmentType: "Full-time",
    jobLevel: "Senior",
    department: "Engineering",
    location: "London",
    hiringManager: {
      name: "Arjun Mehta",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces",
      email: "arjun.mehta@max-enterprise.com",
      title: "DevOps Lead",
    },
    status: "Open",
    targetHeadcount: 1,
    filledHeadcount: 0,
    salaryRange: "$145,000 - $175,000",
    createdOn: "23 Sep 2026",
    description: "Build native mobile experiences for field operations and enterprise executive mobile approvals.",
    requiredSkills: ["Swift", "React Native", "Mobile Architecture"],
  },
  {
    id: "req-028",
    reqNumber: "REQ-2026-0028",
    title: "Database Administrator",
    employmentType: "Full-time",
    jobLevel: "Senior",
    department: "Engineering",
    location: "Remote",
    isRemote: true,
    hiringManager: {
      name: "Marcus Chen",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop&crop=faces",
      email: "marcus.chen@max-enterprise.com",
      title: "CTO",
    },
    status: "On Hold",
    targetHeadcount: 1,
    filledHeadcount: 0,
    salaryRange: "$150,000 - $180,000",
    createdOn: "22 Sep 2026",
    description: "Tune multi-terabyte PostgreSQL databases, configure cross-region replication, and manage zero-downtime partitioning.",
    requiredSkills: ["PostgreSQL", "Database Tuning", "Partitioning", "High Availability"],
  },
  {
    id: "req-027",
    reqNumber: "REQ-2026-0027",
    title: "Chief Enterprise Architect",
    employmentType: "Full-time",
    jobLevel: "Director",
    department: "Executive",
    location: "New York",
    hiringManager: {
      name: "Alexander Wright",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces",
      email: "alexander.wright@max-enterprise.com",
      title: "CEO",
    },
    status: "Pending Approval",
    targetHeadcount: 1,
    filledHeadcount: 0,
    salaryRange: "$260,000 - $310,000",
    createdOn: "21 Sep 2026",
    approvalStep: 1,
    totalApprovalSteps: 3,
    description: "Govern overarching ERP architecture, integration standards, and cloud infrastructure roadmap.",
    requiredSkills: ["Enterprise Architecture", "Cloud Strategy", "Executive Leadership"],
  },
  {
    id: "req-026",
    reqNumber: "REQ-2026-0026",
    title: "Global Event Coordinator",
    employmentType: "Contract",
    jobLevel: "Entry Level",
    department: "Marketing",
    location: "Remote",
    isRemote: true,
    hiringManager: {
      name: "David Rossi",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=faces",
      email: "david.rossi@max-enterprise.com",
      title: "CMO",
    },
    status: "Cancelled",
    targetHeadcount: 1,
    filledHeadcount: 0,
    salaryRange: "$75,000 - $90,000",
    createdOn: "20 Sep 2026",
    description: "Produce enterprise customer summits, industry conference booths, and user group webinars.",
    requiredSkills: ["Event Planning", "Vendor Management", "Logistics"],
  },
  {
    id: "req-025",
    reqNumber: "REQ-2026-0025",
    title: "Enterprise Sales Engineer",
    employmentType: "Full-time",
    jobLevel: "Mid Level",
    department: "Sales",
    location: "Singapore",
    hiringManager: {
      name: "Olivia Taylor",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=faces",
      email: "olivia.taylor@max-enterprise.com",
      title: "VP Sales EMEA",
    },
    status: "Cancelled",
    targetHeadcount: 1,
    filledHeadcount: 0,
    salaryRange: "$120,000 - $145,000",
    createdOn: "19 Sep 2026",
    description: "Partner with regional sales executives to architect proof-of-concepts for enterprise customers.",
    requiredSkills: ["Sales Engineering", "API Integration", "Customer Discovery"],
  },
];

export const INITIAL_TASKS: RecruitingTask[] = [
  {
    id: "task-1",
    title: "Approve requisition",
    relatedTo: "REQ-2026-0048 · Senior Java Developer",
    category: "Approvals",
    type: "Approval",
    dueDate: "Today",
    isUrgent: true,
    actionUrl: "/recruitment/requisitions?req=REQ-2026-0048",
  },
  {
    id: "task-2",
    title: "Review candidates",
    relatedTo: "Product Manager · 8 new applications",
    category: "Candidates",
    type: "Review",
    dueDate: "Today",
    isUrgent: true,
    actionUrl: "/recruitment/requisitions?req=REQ-2026-0047",
  },
  {
    id: "task-3",
    title: "Provide interview feedback",
    relatedTo: "Maria Lopez · Senior Java Developer",
    category: "Interviews",
    type: "Interview",
    dueDate: "Tomorrow",
    actionUrl: "/recruitment?tab=scorecards",
  },
  {
    id: "task-4",
    title: "Schedule interview",
    relatedTo: "Arjun Mehta · DevOps Engineer",
    category: "Interviews",
    type: "Interview",
    dueDate: "Tomorrow",
    actionUrl: "/recruitment?tab=interviews",
  },
  {
    id: "task-5",
    title: "Review offer details",
    relatedTo: "Priya Nair · HR Business Partner",
    category: "Approvals",
    type: "Offer",
    dueDate: "14 Oct",
    actionUrl: "/recruitment?tab=offers",
  },
  {
    id: "task-6",
    title: "Approve requisition",
    relatedTo: "REQ-2026-0042 · Data Analyst",
    category: "Approvals",
    type: "Approval",
    dueDate: "15 Oct",
    actionUrl: "/recruitment/requisitions?req=REQ-2026-0042",
  },
  {
    id: "task-7",
    title: "Final executive panel debrief",
    relatedTo: "David Kim · SRE Lead",
    category: "Interviews",
    type: "Interview",
    dueDate: "15 Oct",
    actionUrl: "/recruitment?tab=interviews",
  },
  {
    id: "task-8",
    title: "Screen incoming applicant batch",
    relatedTo: "UI/UX Designer · 5 new portfolios",
    category: "Candidates",
    type: "Review",
    dueDate: "16 Oct",
    actionUrl: "/recruitment/requisitions?req=REQ-2026-0043",
  },
  {
    id: "task-9",
    title: "Sign-off background verification (BGV)",
    relatedTo: "Chloe Bennett · Corporate FP&A",
    category: "Approvals",
    type: "Approval",
    dueDate: "16 Oct",
    actionUrl: "/recruitment?tab=bgv",
  },
  {
    id: "task-10",
    title: "Hiring committee review",
    relatedTo: "Elena Rostova · Senior Cloud Architect",
    category: "Candidates",
    type: "Review",
    dueDate: "17 Oct",
    actionUrl: "/recruitment?tab=candidates",
  },
  {
    id: "task-11",
    title: "System architecture interview loop",
    relatedTo: "Samuel Kim · Principal Engineer",
    category: "Interviews",
    type: "Interview",
    dueDate: "18 Oct",
    actionUrl: "/recruitment?tab=interviews",
  },
  {
    id: "task-12",
    title: "Prepare Day-1 onboarding checklist",
    relatedTo: "Maya Patel · Requisition REQ-ENG-084",
    category: "Interviews",
    type: "Offer",
    dueDate: "19 Oct",
    actionUrl: "/recruitment?tab=onboarding",
  },
];

export const INITIAL_MESSAGES: CommunicationMessage[] = [
  {
    id: "msg-1",
    senderName: "Priya Nair",
    senderRole: "Candidate",
    senderAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=faces",
    subject: "Re: Interview feedback - REQ-0048",
    preview: "Thank you for the interview today. I really enjoyed discussing the distributed architecture challenges...",
    timestamp: "10:24 AM",
    unreadCount: 2,
    category: "Candidates",
  },
  {
    id: "msg-2",
    senderName: "Arjun Mehta",
    senderRole: "Colleague",
    senderAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces",
    subject: "Schedule interview - DevOps Engineer",
    preview: "Can we move the interview to 11 AM? I have an urgent client escalation on the Kubernetes cluster.",
    timestamp: "09:18 AM",
    unreadCount: 1,
    category: "Colleagues",
  },
  {
    id: "msg-3",
    senderName: "Rohit Sharma",
    senderRole: "Hiring Manager",
    senderAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces",
    subject: "Offer approval - Product Manager",
    preview: "The offer is ready for your review. I have verified the equity band with finance.",
    timestamp: "Yesterday",
    category: "Colleagues",
  },
  {
    id: "msg-4",
    senderName: "Maria Lopez",
    senderRole: "Candidate",
    senderAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces",
    subject: "Re: Job description update",
    preview: "Updated JD attached. Please review the Kafka and distributed state management requirements.",
    timestamp: "Yesterday",
    category: "Candidates",
  },
  {
    id: "msg-5",
    senderName: "Career Site Applicants",
    senderRole: "System",
    senderInitials: "CS",
    subject: "15 new applications",
    preview: "New candidates available for review across Senior Java Developer and Product Manager openings.",
    timestamp: "Yesterday",
    category: "Candidates",
  },
];

const INITIAL_JOB_BOARDS: JobBoardIntegration[] = [
  {
    id: "indeed",
    name: "Indeed",
    logoLetter: "i",
    logoBg: "#003A9B",
    logoColor: "#ffffff",
    tier: "FREE",
    status: "CONFIGURED",
    description: "Global reach",
    externalUrl: "https://www.indeed.com",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    logoLetter: "in",
    logoBg: "#0A66C2",
    logoColor: "#ffffff",
    tier: "PREMIUM",
    status: "CONFIGURED",
    description: "Professional network",
    externalUrl: "https://www.linkedin.com/jobs",
  },
  {
    id: "naukri",
    name: "Naukri",
    logoLetter: "n",
    logoBg: "#0099FF",
    logoColor: "#ffffff",
    tier: "PREMIUM",
    status: "CONFIGURED",
    description: "India's #1 job site",
    externalUrl: "https://www.naukri.com",
  },
  {
    id: "monster",
    name: "Monster",
    logoLetter: "M",
    logoBg: "#6E46AE",
    logoColor: "#ffffff",
    tier: "PREMIUM",
    status: "NOT_CONFIGURED",
    description: "Global job board",
    requiresCredentials: true,
    eligibilityNotice: "Requires Monster Enterprise Employer API integration credentials.",
  },
  {
    id: "glassdoor",
    name: "Glassdoor",
    logoLetter: "g",
    logoBg: "#0CAA41",
    logoColor: "#ffffff",
    tier: "FREE",
    status: "CONFIGURED",
    description: "Company reviews & jobs",
    externalUrl: "https://www.glassdoor.com",
  },
  {
    id: "shine",
    name: "Shine",
    logoLetter: "S",
    logoBg: "#FDB813",
    logoColor: "#222222",
    tier: "PREMIUM",
    status: "NOT_CONFIGURED",
    description: "India focused",
    requiresCredentials: true,
    eligibilityNotice: "Requires Shine Recruiter Partner API key.",
  },
  {
    id: "workindia",
    name: "WorkIndia",
    logoLetter: "W",
    logoBg: "#1E3A8A",
    logoColor: "#ffffff",
    tier: "FREE",
    status: "NOT_CONFIGURED",
    description: "SMB & startup hiring",
    requiresCredentials: true,
    eligibilityNotice: "Requires WorkIndia Employer API integration connector.",
  },
  {
    id: "google-jobs",
    name: "Google Jobs",
    logoLetter: "G",
    logoBg: "#ffffff",
    logoColor: "#4285F4",
    tier: "FREE",
    status: "CONFIGURED",
    description: "Search network",
    externalUrl: "https://jobs.google.com",
  },
  {
    id: "timesjobs",
    name: "TimesJobs",
    logoLetter: "TJ",
    logoBg: "#DC2626",
    logoColor: "#ffffff",
    tier: "PREMIUM",
    status: "NOT_CONFIGURED",
    description: "India job board",
    requiresCredentials: true,
    eligibilityNotice: "Requires TimesJobs corporate recruitment API token.",
  },
];

const INITIAL_POSTINGS: CareerSitePosting[] = [
  {
    id: "post-cfg-123",
    requisitionId: "REQ-2026-00123",
    careerSiteTitle: "Senior Java Developer",
    urlSlug: "senior-java-developer",
    category: "Engineering",
    location: "Bangalore, India",
    employmentType: "Full-time",
    workArrangement: "Hybrid",
    applicationDeadline: "2026-11-15",
    startDate: "2026-10-16",
    durationDays: 30,
    showOnHomepage: true,
    featured: true,
    showInSearch: true,
    selectedBoardIds: ["indeed", "linkedin", "naukri", "glassdoor", "google-jobs"],
    jobDescription: "We are looking for a Senior Java Developer to join our engineering team. The ideal candidate will have strong experience in Java, Spring Boot and enterprise applications. You will design, develop and maintain scalable backend services and collaborate with cross-functional teams.",
    responsibilities: [
      "Architect, design, and implement high-performance backend microservices using Java 21 and Spring Boot.",
      "Develop scalable distributed transactional systems with PostgreSQL and Hibernate.",
      "Collaborate cross-functionally with frontend developers, product managers, and cloud DevOps teams.",
      "Maintain automated test suites with JUnit, Mockito, and integration pipelines ensuring 90%+ code coverage.",
      "Participate in agile sprint ceremonies, technical RFC reviews, and production incident root-cause analysis."
    ],
    qualifications: [
      "5+ years of hands-on software development experience with Java and Spring ecosystem.",
      "Solid understanding of relational database design, indexing strategies, and query tuning.",
      "Demonstrated experience with containerized environments (Docker, Kubernetes) and CI/CD pipelines.",
      "Strong grasp of RESTful API standards, OAuth2/OIDC security, and microservices patterns."
    ],
    additionalInfo: "MAX ERP provides comprehensive health insurance, competitive equity packages, annual wellness stipends, and flexible hybrid working arrangements.",
    status: "DRAFT",
    lastSavedAt: "16 Oct 2026, 10:30 AM",
  },
];

const INITIAL_OFFERS: OfferItem[] = [
  {
    id: "off-001",
    candidateName: "Priya Menon",
    candidateEmail: "priya.menon@example.com",
    candidatePhone: "+91 98450 12345",
    candidateLocation: "Bangalore, India",
    requisitionId: "REQ-2026-00123",
    requisitionTitle: "Senior Java Developer",
    department: "Enterprise Engineering",
    baseSalary: "$165,000 / yr",
    variableBonus: "15% Target ($24,750)",
    equity: "$50,000 RSUs (4-year vest)",
    signOnBonus: "$10,000",
    totalComp: "$199,750 / yr",
    compaRatio: "103% of Midpoint",
    targetStartDate: "15 Nov 2026",
    status: "Approved",
    approvedBy: "Marcus Chen (Finance Director)",
    currentApprovalLevel: 3,
    approvalChain: [
      {
        level: 1,
        title: "Level 1: Hiring Manager",
        approverName: "John Smith",
        approverRole: "Engineering Director",
        approverEmail: "john.smith@max-erp.com",
        status: "APPROVED",
        decidedAt: "18 Oct 2026, 11:20",
        comments: "Candidate scored 92% on technical debrief; exceptional microservices background.",
      },
      {
        level: 2,
        title: "Level 2: Higher Level / VP",
        approverName: "Elena Vance",
        approverRole: "VP of Engineering",
        approverEmail: "elena.vance@max-erp.com",
        status: "APPROVED",
        decidedAt: "19 Oct 2026, 14:15",
        comments: "Approved strategic hire for Core Platform modernization initiative.",
      },
      {
        level: 3,
        title: "Level 3: Executive Finance",
        approverName: "Marcus Chen",
        approverRole: "Finance & Compensation Director",
        approverEmail: "marcus.chen@max-erp.com",
        status: "APPROVED",
        decidedAt: "20 Oct 2026, 09:45",
        comments: "Compensation within allocated FY26 headcount budget band.",
      },
    ],
    offerLetterTemplateId: "tmpl-eng-01",
    offerLetterTemplateTitle: "Standard Full-Time Engineering Agreement",
    notes: "Offer fully approved by all executive signatories. Ready to dispatch letter to candidate.",
  },
  {
    id: "off-002",
    candidateName: "Devin Vance",
    candidateEmail: "devin.vance@cloudsystems.io",
    candidatePhone: "+1 (415) 555-8921",
    candidateLocation: "San Francisco, CA (Hybrid)",
    requisitionId: "REQ-2026-00124",
    requisitionTitle: "Staff Cloud Infrastructure Architect",
    department: "Cloud Platform Ops",
    baseSalary: "$210,000 / yr",
    variableBonus: "20% Target ($42,000)",
    equity: "$120,000 RSUs (4-year vest)",
    signOnBonus: "$25,000",
    totalComp: "$277,000 / yr",
    compaRatio: "108% of Midpoint",
    targetStartDate: "01 Dec 2026",
    status: "Pending Approval",
    currentApprovalLevel: 2,
    approvalChain: [
      {
        level: 1,
        title: "Level 1: Hiring Manager",
        approverName: "Ravi Kumar",
        approverRole: "Cloud Platform Lead",
        approverEmail: "ravi.kumar@max-erp.com",
        status: "APPROVED",
        decidedAt: "21 Oct 2026, 16:30",
        comments: "Strong Kubernetes and Multi-Cloud Terraform architectural expertise.",
      },
      {
        level: 2,
        title: "Level 2: Higher Level / VP",
        approverName: "Elena Vance",
        approverRole: "VP of Engineering",
        approverEmail: "elena.vance@max-erp.com",
        status: "PENDING",
        comments: "Awaiting executive review: compensation is 8% above midpoint. Requires higher-level waiver.",
      },
      {
        level: 3,
        title: "Level 3: Executive Finance",
        approverName: "Marcus Chen",
        approverRole: "Finance & Compensation Director",
        approverEmail: "marcus.chen@max-erp.com",
        status: "WAITING",
      },
    ],
    offerLetterTemplateId: "tmpl-exec-02",
    offerLetterTemplateTitle: "Staff & Principal Engineering Agreement",
    notes: "Requires higher-level VP approval for equity package prior to final finance sign-off.",
  },
  {
    id: "off-003",
    candidateName: "Emily Zhang",
    candidateEmail: "emily.zhang@ai-research.org",
    candidatePhone: "+1 (206) 555-4321",
    candidateLocation: "Seattle, WA",
    requisitionId: "REQ-2026-00125",
    requisitionTitle: "Principal AI Research Scientist",
    department: "MAX AI Labs",
    baseSalary: "$240,000 / yr",
    variableBonus: "25% Target ($60,000)",
    equity: "$180,000 RSUs (4-year vest)",
    signOnBonus: "$35,000",
    totalComp: "$335,000 / yr",
    compaRatio: "112% of Midpoint",
    targetStartDate: "10 Dec 2026",
    status: "Pending Approval",
    currentApprovalLevel: 3,
    approvalChain: [
      {
        level: 1,
        title: "Level 1: Hiring Manager",
        approverName: "Dr. Aris Thorne",
        approverRole: "Head of AI Research",
        approverEmail: "aris.thorne@max-erp.com",
        status: "APPROVED",
        decidedAt: "20 Oct 2026, 10:15",
        comments: "World-class LLM alignment and agentic reasoning researcher. Absolute must-hire.",
      },
      {
        level: 2,
        title: "Level 2: Higher Level / VP",
        approverName: "Elena Vance",
        approverRole: "VP of Engineering",
        approverEmail: "elena.vance@max-erp.com",
        status: "APPROVED",
        decidedAt: "22 Oct 2026, 15:40",
        comments: "Higher-level approval granted based on strategic enterprise AI competitive positioning.",
      },
      {
        level: 3,
        title: "Level 3: Executive Finance",
        approverName: "Marcus Chen",
        approverRole: "Finance & Compensation Director",
        approverEmail: "marcus.chen@max-erp.com",
        status: "PENDING",
        comments: "Evaluating Q4 opex adjustment for sign-on bonus.",
      },
    ],
    offerLetterTemplateId: "tmpl-exec-01",
    offerLetterTemplateTitle: "Executive Leadership Employment Agreement",
    notes: "Level 2 higher-level approval granted; awaiting final Level 3 Finance sign-off.",
  },
  {
    id: "off-004",
    candidateName: "Marcus Zhao",
    candidateEmail: "marcus.zhao@techmail.com",
    candidatePhone: "+1 (512) 555-7788",
    candidateLocation: "Austin, TX (Remote)",
    requisitionId: "REQ-2026-00123",
    requisitionTitle: "Senior Java Developer",
    department: "Enterprise Engineering",
    baseSalary: "$155,000 / yr",
    variableBonus: "12% Target ($18,600)",
    equity: "$40,000 RSUs (4-year vest)",
    signOnBonus: "$5,000",
    totalComp: "$178,600 / yr",
    compaRatio: "98% of Midpoint",
    targetStartDate: "20 Nov 2026",
    status: "Sent",
    approvedBy: "Marcus Chen",
    currentApprovalLevel: 3,
    approvalChain: [
      {
        level: 1,
        title: "Level 1: Hiring Manager",
        approverName: "John Smith",
        approverRole: "Engineering Director",
        status: "APPROVED",
        decidedAt: "19 Oct 2026, 12:00",
      },
      {
        level: 2,
        title: "Level 2: Higher Level / VP",
        approverName: "Elena Vance",
        approverRole: "VP of Engineering",
        status: "APPROVED",
        decidedAt: "20 Oct 2026, 16:30",
      },
      {
        level: 3,
        title: "Level 3: Executive Finance",
        approverName: "Marcus Chen",
        approverRole: "Finance Director",
        status: "APPROVED",
        decidedAt: "21 Oct 2026, 10:00",
      },
    ],
    offerLetterTemplateId: "tmpl-eng-01",
    offerLetterTemplateTitle: "Standard Full-Time Engineering Agreement",
    sentAt: "21 Oct 2026, 14:30",
    expiresAt: "28 Oct 2026, 23:59",
    eSignatureStatus: "PENDING_SIGNATURE",
    eSignatureProvider: "DocuSign Envelope ID: DOCU-772918-MX",
    notes: "Offer letter dispatched via DocuSign. Awaiting candidate signature.",
  },
  {
    id: "off-005",
    candidateName: "Aisha Patel",
    candidateEmail: "aisha.patel@designhub.io",
    candidatePhone: "+44 20 7946 0912",
    candidateLocation: "London, UK",
    requisitionId: "REQ-2026-00126",
    requisitionTitle: "Lead Product Experience Designer",
    department: "Product & Design",
    baseSalary: "£95,000 / yr",
    variableBonus: "15% Target (£14,250)",
    equity: "£45,000 RSUs",
    signOnBonus: "£8,000",
    totalComp: "£117,250 / yr",
    compaRatio: "101% of Midpoint",
    targetStartDate: "05 Nov 2026",
    status: "Accepted",
    approvedBy: "Marcus Chen",
    currentApprovalLevel: 3,
    approvalChain: [
      {
        level: 1,
        title: "Level 1: Hiring Manager",
        approverName: "Liam Evans",
        approverRole: "Head of Design",
        status: "APPROVED",
        decidedAt: "16 Oct 2026, 14:00",
      },
      {
        level: 2,
        title: "Level 2: Higher Level / VP",
        approverName: "Elena Vance",
        approverRole: "VP of Product & Tech",
        status: "APPROVED",
        decidedAt: "17 Oct 2026, 11:30",
      },
      {
        level: 3,
        title: "Level 3: Executive Finance",
        approverName: "Marcus Chen",
        approverRole: "Finance Director",
        status: "APPROVED",
        decidedAt: "18 Oct 2026, 09:15",
      },
    ],
    offerLetterTemplateId: "tmpl-prod-01",
    offerLetterTemplateTitle: "UK Standard Employment Contract",
    sentAt: "18 Oct 2026, 16:00",
    expiresAt: "25 Oct 2026, 23:59",
    eSignatureStatus: "SIGNED",
    eSignatureProvider: "DocuSign Envelope ID: DOCU-661902-MX (Signed 22 Oct 2026)",
    notes: "Candidate signed employment agreement. Transfer to Employee Central (EC Core) ready.",
  },
  {
    id: "off-006",
    candidateName: "Carlos Santana",
    candidateEmail: "carlos.santana@secops.dev",
    candidatePhone: "+1 (720) 555-1290",
    candidateLocation: "Denver, CO",
    requisitionId: "REQ-2026-00127",
    requisitionTitle: "Site Reliability & Observability Lead",
    department: "Cloud Platform Ops",
    baseSalary: "$185,000 / yr",
    variableBonus: "18% Target ($33,300)",
    equity: "$75,000 RSUs (4-year vest)",
    totalComp: "$218,300 / yr",
    compaRatio: "104% of Midpoint",
    targetStartDate: "15 Dec 2026",
    status: "Pending Approval",
    currentApprovalLevel: 1,
    approvalChain: [
      {
        level: 1,
        title: "Level 1: Hiring Manager",
        approverName: "Sarah Jenkins",
        approverRole: "DevOps Manager",
        status: "PENDING",
      },
      {
        level: 2,
        title: "Level 2: Higher Level / VP",
        approverName: "Elena Vance",
        approverRole: "VP of Engineering",
        status: "WAITING",
      },
      {
        level: 3,
        title: "Level 3: Executive Finance",
        approverName: "Marcus Chen",
        approverRole: "Finance Director",
        status: "WAITING",
      },
    ],
    offerLetterTemplateId: "tmpl-eng-01",
    offerLetterTemplateTitle: "Standard Full-Time Engineering Agreement",
    notes: "Offer package formulated; awaiting initial Hiring Manager endorsement.",
  },
];

class RecruitmentStore {
  private requisitions: Requisition[] = [...INITIAL_REQUISITIONS];
  private tasks: RecruitingTask[] = [...INITIAL_TASKS];
  private messages: CommunicationMessage[] = [...INITIAL_MESSAGES];
  private jobBoards: JobBoardIntegration[] = [...INITIAL_JOB_BOARDS];
  private postings: CareerSitePosting[] = [...INITIAL_POSTINGS];

  getRequisitions(): Requisition[] {
    return [...this.requisitions];
  }

  getRequisitionById(id: string): Requisition | undefined {
    return this.requisitions.find((r) => r.id === id || r.reqNumber === id);
  }

  getTasks(): RecruitingTask[] {
    return [...this.tasks];
  }

  getMessages(): CommunicationMessage[] {
    return [...this.messages];
  }

  addMessage(msg: Partial<CommunicationMessage>): CommunicationMessage {
    const newMsg: CommunicationMessage = {
      id: msg.id || `msg-${Date.now()}`,
      senderName: msg.senderName || "John Smith",
      senderRole: msg.senderRole || "Colleague",
      senderAvatar: msg.senderAvatar,
      senderInitials: msg.senderInitials || (msg.senderName ? msg.senderName.slice(0, 2).toUpperCase() : "JS"),
      subject: msg.subject || "Recruitment inquiry",
      preview: msg.preview || "Message dispatched",
      timestamp: msg.timestamp || "Just now",
      category: msg.category || "Candidates",
      unreadCount: 0,
    };
    this.messages.unshift(newMsg);
    return newMsg;
  }

  updateOfferStatus(offerId: string, status: OfferItem["status"]): OfferItem | undefined {
    const offer = this.offers.find((o) => o.id === offerId);
    if (offer) {
      offer.status = status;
      if (status === "Accepted" || status === "Sent") {
        offer.approvedBy = "Executive Board";
      }
    }
    return offer;
  }

  getSummaryCounts() {
    const total = this.requisitions.length;
    const open = this.requisitions.filter((r) => r.status === "Open").length;
    const pendingApproval = this.requisitions.filter((r) => r.status === "Pending Approval").length;
    const filled = this.requisitions.filter((r) => r.status === "Filled").length;
    const cancelled = this.requisitions.filter((r) => r.status === "Cancelled").length;
    const draft = this.requisitions.filter((r) => r.status === "Draft").length;
    const onHold = this.requisitions.filter((r) => r.status === "On Hold").length;

    return {
      total,
      open,
      pendingApproval,
      filled,
      cancelled,
      draft,
      onHold,
      activeCandidates: 342,
      interviewsThisWeek: 18,
      offersPending: 6,
    };
  }

  addRequisition(req: Partial<Requisition>): Requisition {
    const id = `req-${Date.now()}`;
    const nextNum = this.requisitions.length + 1;
    const reqNumber = `REQ-2026-00${nextNum < 10 ? "0" + nextNum : nextNum}`;

    const newReq: Requisition = {
      id,
      reqNumber,
      title: req.title || "Untitled Requisition",
      employmentType: req.employmentType || "Full-time",
      jobLevel: req.jobLevel || "Mid Level",
      department: req.department || "Engineering",
      location: req.location || "Remote",
      isRemote: req.isRemote ?? true,
      legalEntity: req.legalEntity || "MAX Technologies Corp (US)",
      workArrangement: req.workArrangement || "Hybrid",
      targetStartDate: req.targetStartDate,
      hiringManager: req.hiringManager || {
        name: "John Smith",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces",
        email: "john.smith@max-enterprise.com",
        title: "Recruiter",
      },
      recruiter: req.recruiter || {
        name: "Alex Morgan",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces",
        email: "alex.morgan@max-enterprise.com",
      },
      interviewers: req.interviewers || [],
      status: req.status || "Draft",
      targetHeadcount: req.targetHeadcount || 1,
      filledHeadcount: 0,
      salaryRange: req.salaryRange || "$120,000 - $150,000",
      currency: req.currency || "USD",
      costCenter: req.costCenter || "CC-ENG-4020",
      vacancyReason: req.vacancyReason || "New Headcount / Expansion",
      replacementEmployee: req.replacementEmployee,
      createdOn: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      approvalStep: req.status === "Pending Approval" ? 1 : undefined,
      totalApprovalSteps: req.status === "Pending Approval" ? 3 : undefined,
      requiredSkills: req.requiredSkills || ["TypeScript", "React"],
      description: req.description || "",
      responsibilities: req.responsibilities || [],
      requiredQualifications: req.requiredQualifications || [],
      preferredQualifications: req.preferredQualifications || [],
      minExperience: req.minExperience || 3,
      maxExperience: req.maxExperience || 8,
      educationLevel: req.educationLevel || "Bachelor's Degree",
      customFields: req.customFields || {},
    };

    this.requisitions = [newReq, ...this.requisitions];
    return newReq;
  }

  updateRequisitionStatus(id: string, status: Requisition["status"]): Requisition | undefined {
    const match = this.requisitions.find((r) => r.id === id || r.reqNumber === id);
    if (match) {
      match.status = status;
      if (status === "Filled") {
        match.filledHeadcount = match.targetHeadcount;
      }
      this.logActivity(match.reqNumber, "System / Recruiter", `Requisition status updated to ${status}`);
      return { ...match };
    }
    return undefined;
  }

  updateRequisition(id: string, updates: Partial<Requisition>): Requisition | undefined {
    const match = this.requisitions.find((r) => r.id === id || r.reqNumber === id);
    if (match) {
      Object.assign(match, updates);
      match.lastUpdated = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
      this.logActivity(match.reqNumber, "John Smith", "Requisition details updated");
      return { ...match };
    }
    return undefined;
  }

  candidates: CandidateItem[] = [
    {
      id: "cand-app-01",
      name: "Priya Menon",
      role: "Senior Java Developer",
      email: "priya.menon@gmail.com",
      phone: "+91 98765 43210",
      requisitionId: "REQ-2026-00123",
      requisitionTitle: "Senior Java Developer",
      department: "Engineering",
      stage: "Interview",
      statusLabel: "In Review",
      source: "LinkedIn",
      recruiter: "John Smith",
      location: "Bangalore, India",
      matchScore: 92,
      fitLevel: "Excellent Fit",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=faces",
      appliedDate: "11 Oct 2026",
      skillsBreakdown: [
        { name: "Java", percentage: 100, status: "Matched" },
        { name: "Spring Boot", percentage: 95, status: "Matched" },
        { name: "Microservices", percentage: 90, status: "Matched" },
        { name: "REST APIs", percentage: 85, status: "Matched" },
        { name: "AWS", percentage: 70, status: "Partial" },
        { name: "System Design", percentage: 60, status: "Partial" },
      ],
      relevantExperience: [
        { metric: "4.5 years", label: "Relevant experience", icon: "calendar" },
        { metric: "3 companies", label: "in similar domain", icon: "building" },
        { metric: "Java, Spring Boot", label: "Primary stack", icon: "code" },
        { metric: "Multiple projects", label: "in microservices", icon: "cube" },
      ],
      aiSummary: "Priya Menon is the best fit for this role with 92% match based on skills, 4.5 years of relevant experience, strong interview feedback and good cultural fit. She also has hands-on experience in Java, Spring Boot and microservices.",
      recommendedNextStep: "Shortlist Priya for the next interview round.",
      interviewNotes: "Outstanding distributed systems and Java memory model knowledge. Passed coding round 5/5.",
    },
    {
      id: "cand-app-02",
      name: "Arjun R",
      role: "Senior Java Developer",
      email: "arjun.r@gmail.com",
      phone: "+91 98451 22334",
      requisitionId: "REQ-2026-00123",
      requisitionTitle: "Senior Java Developer",
      department: "Engineering",
      stage: "Applied",
      statusLabel: "New",
      source: "Career Site",
      recruiter: "John Smith",
      location: "Bangalore, India",
      matchScore: 54,
      fitLevel: "Moderate Fit",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces",
      appliedDate: "12 Oct 2026",
      skillsBreakdown: [
        { name: "Java", percentage: 80, status: "Matched" },
        { name: "Spring Boot", percentage: 65, status: "Partial" },
        { name: "Microservices", percentage: 50, status: "Partial" },
        { name: "REST APIs", percentage: 75, status: "Matched" },
        { name: "AWS", percentage: 30, status: "Missing" },
        { name: "System Design", percentage: 40, status: "Missing" },
      ],
      relevantExperience: [
        { metric: "2.5 years", label: "Relevant experience", icon: "calendar" },
        { metric: "1 company", label: "in product domain", icon: "building" },
        { metric: "Java", label: "Core skill", icon: "code" },
      ],
      aiSummary: "Arjun R shows good promise in core Java fundamentals. Has 2.5 years experience but needs mentoring on distributed systems and cloud architecture.",
      recommendedNextStep: "Schedule technical screening round.",
    },
    {
      id: "cand-app-03",
      name: "Vikram K",
      role: "SAP SF Consultant",
      email: "vikram.k@outlook.com",
      phone: "+91 98112 33445",
      requisitionId: "REQ-2026-00120",
      requisitionTitle: "SAP SuccessFactors",
      department: "HR Tech",
      stage: "Screening",
      statusLabel: "Shortlisted",
      source: "Naukri",
      recruiter: "Priya Nair",
      location: "Hyderabad, India",
      matchScore: 78,
      fitLevel: "Good Fit",
      initials: "VK",
      appliedDate: "10 Oct 2026",
      skillsBreakdown: [
        { name: "SAP SuccessFactors", percentage: 95, status: "Matched" },
        { name: "Employee Central", percentage: 85, status: "Matched" },
        { name: "Integration Center", percentage: 70, status: "Partial" },
        { name: "OData APIs", percentage: 65, status: "Partial" },
      ],
      relevantExperience: [
        { metric: "6.0 years", label: "SAP Consulting", icon: "calendar" },
        { metric: "4 deployments", label: "Enterprise global rollouts", icon: "building" },
      ],
      aiSummary: "Vikram K has deep expertise in SAP SuccessFactors Employee Central module with proven track record across multi-tenant enterprise migrations.",
      recommendedNextStep: "Schedule panel interview with HR lead.",
    },
    {
      id: "cand-app-04",
      name: "Sneha S",
      role: "Senior Java Developer",
      email: "sneha.s@gmail.com",
      phone: "+91 99887 66554",
      requisitionId: "REQ-2026-00123",
      requisitionTitle: "Senior Java Developer",
      department: "Engineering",
      stage: "Interview",
      statusLabel: "Interview",
      source: "Indeed",
      recruiter: "John Smith",
      location: "Bangalore, India",
      matchScore: 84,
      fitLevel: "Good Fit",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=faces",
      appliedDate: "09 Oct 2026",
    },
    {
      id: "cand-app-05",
      name: "Rahul Kumar",
      role: "Product Manager",
      email: "rahul.kumar@gmail.com",
      phone: "+91 98223 44556",
      requisitionId: "REQ-2026-00118",
      requisitionTitle: "Product Manager",
      department: "Product",
      stage: "Interview",
      statusLabel: "Interview",
      source: "Referral",
      recruiter: "Anita Desai",
      location: "Mumbai, India",
      matchScore: 82,
      fitLevel: "Good Fit",
      initials: "RK",
      appliedDate: "08 Oct 2026",
    },
    {
      id: "cand-app-06",
      name: "Suresh N",
      role: "SAP SF Consultant",
      email: "suresh.n@corp.org",
      phone: "+91 98334 55667",
      requisitionId: "REQ-2026-00120",
      requisitionTitle: "SAP SuccessFactors",
      department: "HR Tech",
      stage: "Offer",
      statusLabel: "Offer",
      source: "Google Jobs",
      recruiter: "Priya Nair",
      location: "Pune, India",
      matchScore: 88,
      fitLevel: "Good Fit",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces",
      appliedDate: "07 Oct 2026",
    },
    {
      id: "cand-app-07",
      name: "Deepa L",
      role: "HR Business Analyst",
      email: "deepa.l@hr-tech.in",
      phone: "+91 98445 66778",
      requisitionId: "REQ-2026-00119",
      requisitionTitle: "HR Business Analyst",
      department: "HR Tech",
      stage: "Screening",
      statusLabel: "BGV",
      source: "Career Site",
      recruiter: "Anita Desai",
      location: "Chennai, India",
      matchScore: 68,
      fitLevel: "Moderate Fit",
      initials: "DL",
      appliedDate: "06 Oct 2026",
    },
    {
      id: "cand-app-08",
      name: "Manu P",
      role: "Senior Java Developer",
      email: "manu.p@devs.net",
      phone: "+91 98556 77889",
      requisitionId: "REQ-2026-00123",
      requisitionTitle: "Senior Java Developer",
      department: "Engineering",
      stage: "Hired",
      statusLabel: "Hired",
      source: "Agency",
      recruiter: "John Smith",
      location: "Bangalore, India",
      matchScore: 95,
      fitLevel: "Excellent Fit",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop&crop=faces",
      appliedDate: "05 Oct 2026",
    },
    {
      id: "cand-app-09",
      name: "Karthik T",
      role: "Product Manager",
      email: "karthik.t@pm-network.com",
      phone: "+91 98667 88990",
      requisitionId: "REQ-2026-00118",
      requisitionTitle: "Product Manager",
      department: "Product",
      stage: "Rejected",
      statusLabel: "Rejected",
      source: "LinkedIn",
      recruiter: "Priya Nair",
      location: "Delhi, India",
      matchScore: 48,
      fitLevel: "Poor Fit",
      initials: "KT",
      appliedDate: "04 Oct 2026",
    },
    {
      id: "cand-app-10",
      name: "Neha Raj",
      role: "HR Business Analyst",
      email: "neha.raj@gmail.com",
      phone: "+91 98778 99001",
      requisitionId: "REQ-2026-00119",
      requisitionTitle: "HR Business Analyst",
      department: "HR Tech",
      stage: "Screening",
      statusLabel: "In Review",
      source: "Naukri",
      recruiter: "John Smith",
      location: "Bangalore, India",
      matchScore: 76,
      fitLevel: "Good Fit",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces",
      appliedDate: "03 Oct 2026",
    },
    {
      id: "cand-123-02",
      name: "Lucas Schneider",
      role: "Senior Java Developer",
      email: "lucas.schneider@berlin-tech.io",
      phone: "+49 30 555 0192",
      requisitionId: "REQ-2026-00123",
      requisitionTitle: "Senior Java Developer",
      department: "Engineering",
      stage: "Interview",
      statusLabel: "Interview",
      source: "Employee Referral",
      recruiter: "John Smith",
      location: "Berlin / Remote",
      matchScore: 92,
      fitLevel: "Excellent Fit",
      initials: "LS",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces",
      appliedDate: "11 Oct 2026",
      interviewNotes: "Strong Spring Boot & Kafka expertise. System design scheduled.",
    },
    {
      id: "cand-123-03",
      name: "Emily Zhang",
      role: "Senior Java Developer",
      email: "emily.zhang@cloudsystems.net",
      phone: "+1 (617) 555-2384",
      requisitionId: "REQ-2026-00123",
      requisitionTitle: "Senior Java Developer",
      department: "Engineering",
      stage: "Interview",
      statusLabel: "Interview",
      source: "Careers Portal",
      recruiter: "John Smith",
      location: "Boston, USA",
      matchScore: 94,
      fitLevel: "Excellent Fit",
      initials: "EZ",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=faces",
      appliedDate: "10 Oct 2026",
      interviewNotes: "Architected microservices at scale. Culture fit round in progress.",
    },
    {
      id: "cand-123-04",
      name: "Samuel Kim",
      role: "Senior Java Developer",
      email: "sam.kim@koreatech.org",
      phone: "+82 2 555 7712",
      requisitionId: "REQ-2026-00123",
      requisitionTitle: "Senior Java Developer",
      department: "Engineering",
      stage: "Screening",
      statusLabel: "In Review",
      source: "Direct Sourcing",
      recruiter: "John Smith",
      location: "Seoul / Remote",
      matchScore: 88,
      fitLevel: "Good Fit",
      initials: "SK",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop&crop=faces",
      appliedDate: "13 Oct 2026",
    },
    {
      id: "cand-123-05",
      name: "Devin Archer",
      role: "Senior Java Developer",
      email: "devin.archer@apex-talent.com",
      phone: "+1 (415) 555-3341",
      requisitionId: "REQ-2026-00123",
      requisitionTitle: "Senior Java Developer",
      department: "Engineering",
      stage: "Screening",
      statusLabel: "In Review",
      source: "Agency",
      recruiter: "John Smith",
      location: "San Francisco, USA",
      matchScore: 85,
      fitLevel: "Good Fit",
      initials: "DA",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=faces",
      appliedDate: "13 Oct 2026",
    },
    {
      id: "cand-123-06",
      name: "Priya Sharma",
      role: "Senior Java Developer",
      email: "priya.sharma@blr-dev.in",
      phone: "+91 99001 88223",
      requisitionId: "REQ-2026-00123",
      requisitionTitle: "Senior Java Developer",
      department: "Engineering",
      stage: "Applied",
      statusLabel: "New",
      source: "Careers Portal",
      recruiter: "John Smith",
      location: "Bangalore, India",
      matchScore: 82,
      fitLevel: "Good Fit",
      initials: "PS",
      appliedDate: "14 Oct 2026",
    },
    {
      id: "cand-123-07",
      name: "Carlos Gomez",
      role: "Senior Java Developer",
      email: "carlos.gomez@enterprisesoft.com",
      phone: "+34 91 555 4422",
      requisitionId: "REQ-2026-00123",
      requisitionTitle: "Senior Java Developer",
      department: "Engineering",
      stage: "Applied",
      statusLabel: "New",
      source: "LinkedIn",
      recruiter: "John Smith",
      location: "Madrid / Remote",
      matchScore: 79,
      fitLevel: "Good Fit",
      initials: "CG",
      appliedDate: "15 Oct 2026",
    },
    {
      id: "cand-123-08",
      name: "Alex Rivera",
      role: "Senior Java Developer",
      email: "alex.rivera@fullstack.io",
      phone: "+1 (312) 555-9011",
      requisitionId: "REQ-2026-00123",
      requisitionTitle: "Senior Java Developer",
      department: "Engineering",
      stage: "Applied",
      statusLabel: "New",
      source: "Job Board",
      recruiter: "John Smith",
      location: "Chicago, USA",
      matchScore: 75,
      fitLevel: "Moderate Fit",
      initials: "AR",
      appliedDate: "15 Oct 2026",
    },
  ];

  interviews: InterviewItem[] = [
    {
      id: "int-123-01",
      candidateName: "Maya Patel",
      candidateEmail: "maya.patel@techcorp.io",
      requisitionId: "REQ-2026-00123",
      requisitionTitle: "Senior Java Developer",
      roundType: "System Design & Concurrency",
      scheduledDate: "18 Oct 2026",
      time: "14:00 - 15:00 UTC",
      interviewerNames: ["Maria Lopez", "David Miller"],
      meetingLink: "https://teams.microsoft.com/l/meetup-join/senior-java-arch",
      platform: "Microsoft Teams",
      status: "SCHEDULED",
    },
    {
      id: "int-123-02",
      candidateName: "Lucas Schneider",
      candidateEmail: "lucas.schneider@berlin-tech.io",
      requisitionId: "REQ-2026-00123",
      requisitionTitle: "Senior Java Developer",
      roundType: "Core Java & Spring Boot Architecture",
      scheduledDate: "19 Oct 2026",
      time: "16:30 - 17:30 UTC",
      interviewerNames: ["Elena Rostova", "Ravi Kumar"],
      meetingLink: "https://teams.microsoft.com/l/meetup-join/senior-java-tech",
      platform: "Microsoft Teams",
      status: "SCHEDULED",
    },
  ];

  offers: OfferItem[] = [...INITIAL_OFFERS];

  activities: ActivityItem[] = [
    {
      id: "act-1",
      requisitionId: "REQ-2026-00123",
      user: "Anita Menon (HRVP)",
      action: "Requisition marked as Open",
      timestamp: "15 Oct 2026, 17:30",
      details: "Requisition approved by all 3 required signatories and published internally.",
    },
    {
      id: "act-2",
      requisitionId: "REQ-2026-00123",
      user: "Anita Menon",
      action: "Step 3 Approval Granted",
      timestamp: "15 Oct 2026, 17:15",
      details: "HR approval sign-off completed with market compa-ratio verification.",
    },
    {
      id: "act-3",
      requisitionId: "REQ-2026-00123",
      user: "Ravi Kumar (CTO)",
      action: "Step 2 Approval Granted",
      timestamp: "12 Oct 2026, 14:20",
      details: "Department head approval signed off under FY26 Engineering Opex budget.",
    },
    {
      id: "act-4",
      requisitionId: "REQ-2026-00123",
      user: "Maria Lopez (Dir)",
      action: "Step 1 Approval Granted",
      timestamp: "10 Oct 2026, 11:05",
      details: "Hiring manager approval signed off.",
    },
    {
      id: "act-5",
      requisitionId: "REQ-2026-00123",
      user: "John Smith",
      action: "Requisition Created",
      timestamp: "08 Oct 2026, 09:30",
      details: "Initial requisition draft submitted for approval routing.",
    },
  ];

  getCandidates(requisitionId?: string): CandidateItem[] {
    if (!requisitionId || requisitionId === "ALL") return [...this.candidates];
    return this.candidates.filter(
      (c) => c.requisitionId.toLowerCase() === requisitionId.toLowerCase() ||
             (requisitionId.startsWith("req-") && c.requisitionId.includes("123"))
    );
  }

  getCandidateById(id: string): CandidateItem | undefined {
    return this.candidates.find((c) => c.id.toLowerCase() === id.toLowerCase());
  }

  addCandidate(item: Partial<CandidateItem>): CandidateItem {
    const newCand: CandidateItem = {
      id: item.id || `cand-app-${Date.now().toString().slice(-4)}`,
      name: item.name || "New Candidate",
      email: item.email || "candidate@example.com",
      phone: item.phone || "+91 98000 00000",
      requisitionId: item.requisitionId || "REQ-2026-00123",
      requisitionTitle: item.requisitionTitle || "Senior Java Developer",
      department: item.department || "Engineering",
      stage: item.stage || "Applied",
      statusLabel: item.statusLabel || "New",
      source: item.source || "Direct Portal",
      recruiter: item.recruiter || "John Smith",
      location: item.location || "Bangalore, India",
      matchScore: item.matchScore || 85,
      fitLevel: item.fitLevel || "Strong Fit",
      avatar: item.avatar || "",
      initials: (item.name || "NC").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2),
      appliedDate: item.appliedDate || new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      role: item.role || item.requisitionTitle || "Senior Java Developer",
      skillsBreakdown: item.skillsBreakdown || [
        { name: "Java", match: 90, color: "bg-blue-600" },
        { name: "Spring Boot", match: 85, color: "bg-blue-600" },
        { name: "Microservices", match: 80, color: "bg-blue-600" },
      ],
      relevantExperience: item.relevantExperience || [
        { metric: "Java Stack", label: "Enterprise backend", icon: "code" }
      ],
      aiSummary: item.aiSummary || `${item.name || "Candidate"} has submitted an application with strong matching capabilities.`,
      recommendedNextStep: item.recommendedNextStep || "Review resume and schedule initial screening round.",
    };
    this.candidates.unshift(newCand);
    this.logActivity(newCand.requisitionId, "Talent Acquisition", `New candidate ${newCand.name} added`);
    return newCand;
  }

  updateCandidate(id: string, updates: Partial<CandidateItem>): CandidateItem | null {
    const cand = this.candidates.find((c) => c.id.toLowerCase() === id.toLowerCase());
    if (!cand) return null;
    Object.assign(cand, updates);
    return { ...cand };
  }

  updateCandidateStage(id: string, stage: CandidateItem["stage"], statusLabel?: CandidateItem["statusLabel"]): CandidateItem | null {
    const cand = this.candidates.find((c) => c.id.toLowerCase() === id.toLowerCase());
    if (!cand) return null;
    cand.stage = stage;
    if (statusLabel) cand.statusLabel = statusLabel;
    this.logActivity(cand.requisitionId, "John Smith", `Updated stage for ${cand.name}`, `Candidate moved to ${statusLabel || stage}`);
    return { ...cand };
  }

  addInterview(item: Partial<InterviewItem>): InterviewItem {
    const interview: InterviewItem = {
      id: item.id || `intv-${Date.now().toString().slice(-4)}`,
      candidateName: item.candidateName || "Candidate",
      candidateEmail: item.candidateEmail || "candidate@example.com",
      requisitionId: item.requisitionId || "REQ-2026-00123",
      requisitionTitle: item.requisitionTitle || "Senior Java Developer",
      roundType: item.roundType || "Technical Interview",
      scheduledDate: item.scheduledDate || new Date().toISOString().slice(0, 10),
      time: item.time || "14:00",
      interviewerNames: item.interviewerNames || ["John Smith", "Maria Lopez"],
      meetingLink: item.meetingLink || "https://teams.microsoft.com/l/meetup-join/max-interview",
      platform: (item.platform as any) || "Microsoft Teams",
      status: "SCHEDULED",
    };
    this.interviews.unshift(interview);
    this.logActivity(interview.requisitionId, "John Smith", `Scheduled interview for ${interview.candidateName}`);
    return interview;
  }

  scheduleInterview(item: Partial<InterviewItem>): InterviewItem {
    return this.addInterview(item);
  }

  getInterviews(requisitionId?: string): InterviewItem[] {
    if (!requisitionId || requisitionId === "ALL") return [...this.interviews];
    return this.interviews.filter(
      (i) => i.requisitionId.toLowerCase() === requisitionId.toLowerCase() ||
             (requisitionId.startsWith("req-") && i.requisitionId.includes("123"))
    );
  }

  getOffers(requisitionId?: string): OfferItem[] {
    if (this.offers.length === 0) {
      this.offers = [...INITIAL_OFFERS];
    }
    if (!requisitionId || requisitionId === "ALL") return [...this.offers];
    return this.offers.filter(
      (o) => o.requisitionId.toLowerCase() === requisitionId.toLowerCase() ||
             (requisitionId.startsWith("req-") && o.requisitionId.includes("123"))
    );
  }

  getOfferById(offerId: string): OfferItem | undefined {
    return this.offers.find((o) => o.id === offerId);
  }

  approveOfferByLevel(offerId: string, level: number, remarks?: string, approverName: string = "Elena Vance (VP)"): OfferItem | undefined {
    const offer = this.offers.find((o) => o.id === offerId);
    if (!offer) return undefined;

    if (!offer.approvalChain) {
      offer.status = "Approved";
      offer.approvedBy = approverName;
      return offer;
    }

    const step = offer.approvalChain.find((s) => s.level === level);
    if (step) {
      step.status = "APPROVED";
      step.decidedAt = new Date().toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
      if (remarks) step.comments = remarks;
    }

    const nextStep = offer.approvalChain.find((s) => s.level === level + 1);
    if (nextStep) {
      nextStep.status = "PENDING";
      offer.currentApprovalLevel = level + 1;
    } else {
      // All levels approved
      offer.status = "Approved";
      offer.approvedBy = approverName;
    }

    this.logActivity(offer.requisitionId, approverName, `Approved offer for ${offer.candidateName}`, `Level ${level} approval sign-off completed. ${remarks ? `Remarks: ${remarks}` : ""}`);
    return offer;
  }

  sendOfferLetter(offerId: string, options: { templateId?: string; templateTitle?: string; customMessage?: string; deliveryMethod?: string }): OfferItem | undefined {
    const offer = this.offers.find((o) => o.id === offerId);
    if (!offer) return undefined;

    offer.status = "Sent";
    offer.sentAt = new Date().toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
    offer.expiresAt = new Date(Date.now() + 7 * 86400000).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    offer.eSignatureStatus = "PENDING_SIGNATURE";
    offer.eSignatureProvider = `DocuSign Envelope ID: DOCU-${Math.floor(100000 + Math.random() * 900000)}-MX`;
    if (options.templateId) offer.offerLetterTemplateId = options.templateId;
    if (options.templateTitle) offer.offerLetterTemplateTitle = options.templateTitle;

    this.logActivity(offer.requisitionId, "Talent Acquisition", `Offer letter dispatched to ${offer.candidateName}`, `Sent via ${options.deliveryMethod || "DocuSign e-signature"}. Valid until ${offer.expiresAt}.`);
    return offer;
  }

  requestOfferRevision(offerId: string, feedback: string, requestedBy: string = "Elena Vance (VP)"): OfferItem | undefined {
    const offer = this.offers.find((o) => o.id === offerId);
    if (!offer) return undefined;

    offer.status = "Pending Approval";
    offer.notes = `Revision requested by ${requestedBy}: ${feedback}`;
    this.logActivity(offer.requisitionId, requestedBy, `Requested offer revision for ${offer.candidateName}`, feedback);
    return offer;
  }

  createOffer(data: Partial<OfferItem>): OfferItem {
    const newOffer: OfferItem = {
      id: `off-${Date.now().toString().slice(-4)}`,
      candidateName: data.candidateName || "New Candidate",
      candidateEmail: data.candidateEmail || "candidate@example.com",
      candidatePhone: data.candidatePhone || "+1 (555) 000-0000",
      candidateLocation: data.candidateLocation || "Remote",
      requisitionId: data.requisitionId || "REQ-2026-00123",
      requisitionTitle: data.requisitionTitle || "Senior Java Developer",
      department: data.department || "Engineering",
      baseSalary: data.baseSalary || "$160,000 / yr",
      variableBonus: data.variableBonus || "15% Target",
      equity: data.equity || "$50,000 RSUs",
      totalComp: data.totalComp || "$184,000 / yr",
      compaRatio: data.compaRatio || "100% of Midpoint",
      targetStartDate: data.targetStartDate || "01 Dec 2026",
      status: "Pending Approval",
      currentApprovalLevel: 1,
      approvalChain: [
        {
          level: 1,
          title: "Level 1: Hiring Manager",
          approverName: "John Smith",
          approverRole: "Engineering Director",
          status: "PENDING",
        },
        {
          level: 2,
          title: "Level 2: Higher Level / VP",
          approverName: "Elena Vance",
          approverRole: "VP of Engineering",
          status: "WAITING",
        },
        {
          level: 3,
          title: "Level 3: Executive Finance",
          approverName: "Marcus Chen",
          approverRole: "Finance Director",
          status: "WAITING",
        },
      ],
      offerLetterTemplateId: data.offerLetterTemplateId || "tmpl-eng-01",
      offerLetterTemplateTitle: data.offerLetterTemplateTitle || "Standard Full-Time Engineering Agreement",
    };
    this.offers.unshift(newOffer);
    this.logActivity(newOffer.requisitionId, "Talent Acquisition", `New offer formulated for ${newOffer.candidateName}`);
    return newOffer;
  }

  getActivity(requisitionId?: string): ActivityItem[] {
    if (!requisitionId || requisitionId === "ALL") return [...this.activities];
    return this.activities.filter(
      (a) => a.requisitionId.toLowerCase() === requisitionId.toLowerCase() ||
             (requisitionId.startsWith("req-") && a.requisitionId.includes("123"))
    );
  }

  logActivity(requisitionId: string, user: string, action: string, details?: string) {
    this.activities = [
      {
        id: `act-${Date.now()}`,
        requisitionId,
        user,
        action,
        timestamp: new Date().toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
        details,
      },
      ...this.activities,
    ];
  }

  getJobBoards(): JobBoardIntegration[] {
    return [...this.jobBoards];
  }

  getJobBoardById(id: string): JobBoardIntegration | undefined {
    return this.jobBoards.find((b) => b.id.toLowerCase() === id.toLowerCase());
  }

  updateJobBoardStatus(id: string, status: "CONFIGURED" | "NOT_CONFIGURED" | "CONNECTED"): JobBoardIntegration | null {
    const board = this.jobBoards.find((b) => b.id.toLowerCase() === id.toLowerCase());
    if (!board) return null;
    board.status = status;
    board.configuredAt = new Date().toISOString();
    return { ...board };
  }

  getPostingByRequisitionId(requisitionId: string): CareerSitePosting | null {
    const post = this.postings.find(
      (p) =>
        p.requisitionId.toLowerCase() === requisitionId.toLowerCase() ||
        (requisitionId.startsWith("req-") && p.requisitionId.includes("123"))
    );
    if (post) return { ...post };

    // If no existing posting config, synthesize default from requisition
    const req = this.getRequisitionById(requisitionId);
    if (!req) return null;

    const slug = req.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    const newPost: CareerSitePosting = {
      id: `post-cfg-${Date.now()}`,
      requisitionId: req.reqNumber,
      careerSiteTitle: req.title,
      urlSlug: slug || "job-posting",
      category: req.department || "Engineering",
      location: req.location || "Remote",
      employmentType: req.employmentType || "Full-time",
      workArrangement: req.workArrangement || "Hybrid",
      applicationDeadline: "2026-11-15",
      startDate: new Date().toISOString().split("T")[0],
      durationDays: 30,
      showOnHomepage: true,
      featured: true,
      showInSearch: true,
      selectedBoardIds: ["indeed", "linkedin", "naukri", "glassdoor", "google-jobs"],
      jobDescription: req.description || "We are looking for a Senior Java Developer to join our engineering team. The ideal candidate will have strong experience in Java, Spring Boot and enterprise applications. You will design, develop and maintain scalable backend services and collaborate with cross-functional teams.",
      responsibilities: req.responsibilities && req.responsibilities.length > 0 ? req.responsibilities : [
        "Architect, design, and implement high-performance backend microservices using Java 21 and Spring Boot.",
        "Develop scalable distributed transactional systems with PostgreSQL and Hibernate.",
        "Collaborate cross-functionally with frontend developers, product managers, and cloud DevOps teams."
      ],
      qualifications: req.requiredSkills && req.requiredSkills.length > 0 ? req.requiredSkills : [
        "5+ years of hands-on software development experience with Java and Spring ecosystem.",
        "Solid understanding of relational database design, indexing strategies, and query tuning.",
        "Demonstrated experience with containerized environments (Docker, Kubernetes) and CI/CD pipelines."
      ],
      additionalInfo: "MAX ERP provides comprehensive health insurance, competitive equity packages, annual wellness stipends, and flexible hybrid working arrangements.",
      status: "DRAFT",
      lastSavedAt: new Date().toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
    };
    this.postings.push(newPost);
    return { ...newPost };
  }

  savePostingDraft(requisitionId: string, updates: Partial<CareerSitePosting>): CareerSitePosting {
    let existing = this.postings.find(
      (p) =>
        p.requisitionId.toLowerCase() === requisitionId.toLowerCase() ||
        (requisitionId.startsWith("req-") && p.requisitionId.includes("123"))
    );

    if (!existing) {
      this.getPostingByRequisitionId(requisitionId);
      existing = this.postings.find(
        (p) =>
          p.requisitionId.toLowerCase() === requisitionId.toLowerCase() ||
          (requisitionId.startsWith("req-") && p.requisitionId.includes("123"))
      );
    }

    if (existing) {
      Object.assign(existing, updates);
      existing.status = "DRAFT";
      existing.lastSavedAt = new Date().toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
      this.logActivity(existing.requisitionId, "Sarah Jenkins", "Saved posting draft", `Updated career site details and board selections (${existing.selectedBoardIds.length} boards)`);
      return { ...existing };
    }

    throw new Error(`Requisition ${requisitionId} not found`);
  }

  publishPosting(requisitionId: string, updates: Partial<CareerSitePosting>): CareerSitePosting {
    const existing = this.savePostingDraft(requisitionId, updates);
    existing.status = "PUBLISHED";
    existing.publishedAt = new Date().toISOString();
    this.logActivity(existing.requisitionId, "Sarah Jenkins", "Published requisition to Career Site & Job Boards", `Published to career portal and ${existing.selectedBoardIds.length} external boards`);
    return { ...existing };
  }

  // =========================================================================
  // Scorecards, Assessments, BGV, Agencies, Pre-Onboarding & Analytics
  // =========================================================================

  private scorecards: InterviewScorecard[] = [
    {
      id: "sc-101",
      candidateId: "cand-app-01",
      candidateName: "Priya Menon",
      requisitionId: "REQ-2026-00123",
      requisitionTitle: "Senior Java Developer",
      interviewerId: "emp-101",
      interviewerName: "Marcus Chen",
      interviewerRole: "VP Engineering",
      roundType: "SYSTEM_ARCHITECTURE",
      overallRecommendation: "STRONG_HIRE",
      competencyRatings: {
        technicalProficiency: 5,
        systemDesignArchitecture: 5,
        problemSolvingVelocity: 4,
        communicationAndTeamwork: 5,
        cultureAndValuesAdd: 5,
      },
      strengthsSummary: "Exceptional mastery of high-concurrency distributed state machines, multi-region database sharding, and Kafka streaming.",
      areasOfConcern: "None noted; candidate exceeded expectations across distributed failure recovery scenarios.",
      notes: "Top architectural thinker. Recommend immediate advancement to offer formulation with competitive equity band.",
      submittedAt: "2026-10-14T14:30:00Z",
      isBlindReview: false,
    },
    {
      id: "sc-102",
      candidateId: "cand-app-01",
      candidateName: "Priya Menon",
      requisitionId: "REQ-2026-00123",
      requisitionTitle: "Senior Java Developer",
      interviewerId: "emp-102",
      interviewerName: "Rachel Green",
      interviewerRole: "Staff Principal Engineer",
      roundType: "TECHNICAL_SCREEN",
      overallRecommendation: "STRONG_HIRE",
      competencyRatings: {
        technicalProficiency: 5,
        systemDesignArchitecture: 4,
        problemSolvingVelocity: 5,
        communicationAndTeamwork: 5,
        cultureAndValuesAdd: 5,
      },
      strengthsSummary: "Fluency in Spring Boot 3.3, virtual threads, reactive Netty pipelines, and memory optimization.",
      areasOfConcern: "Minor: less hands-on with Terraform cloud provisioning, but learns rapidly.",
      notes: "Clear hire. Excellent code readability, unit test coverage, and documentation style.",
      submittedAt: "2026-10-15T11:00:00Z",
      isBlindReview: false,
    },
    {
      id: "sc-103",
      candidateId: "cand-app-03",
      candidateName: "Vikram K",
      requisitionId: "REQ-2026-00123",
      requisitionTitle: "Senior Java Developer",
      interviewerId: "emp-103",
      interviewerName: "David Sterling",
      interviewerRole: "Lead Architect",
      roundType: "SYSTEM_ARCHITECTURE",
      overallRecommendation: "HIRE",
      competencyRatings: {
        technicalProficiency: 4,
        systemDesignArchitecture: 4,
        problemSolvingVelocity: 4,
        communicationAndTeamwork: 4,
        cultureAndValuesAdd: 4,
      },
      strengthsSummary: "Solid understanding of transactional semantics, PostgreSQL indexes, and REST API design.",
      areasOfConcern: "Needs slightly more exposure to event-driven architectures at massive scale.",
      notes: "Very competent senior backend engineer.",
      submittedAt: "2026-10-16T16:00:00Z",
      isBlindReview: true,
    },
  ];

  private jobPostings: JobPostingChannel[] = [
    {
      id: "post-01",
      requisitionId: "REQ-2026-00123",
      requisitionTitle: "Senior Java Developer",
      channel: "LINKEDIN",
      status: "ACTIVE",
      publishedAt: "2026-10-12T08:00:00Z",
      expiresAt: "2026-11-12T08:00:00Z",
      viewsCount: 1420,
      clicksCount: 384,
      applicationsCount: 48,
      costUsd: 495,
      externalUrl: "https://linkedin.com/jobs/view/max-erp-sr-java-dev-123",
    },
    {
      id: "post-02",
      requisitionId: "REQ-2026-00123",
      requisitionTitle: "Senior Java Developer",
      channel: "INDEED",
      status: "ACTIVE",
      publishedAt: "2026-10-12T09:00:00Z",
      expiresAt: "2026-11-12T09:00:00Z",
      viewsCount: 980,
      clicksCount: 210,
      applicationsCount: 32,
      costUsd: 250,
      externalUrl: "https://indeed.com/viewjob?jk=max-sr-java-123",
    },
    {
      id: "post-03",
      requisitionId: "REQ-2026-00123",
      requisitionTitle: "Senior Java Developer",
      channel: "CAREERS_PORTAL",
      status: "ACTIVE",
      publishedAt: "2026-10-11T12:00:00Z",
      expiresAt: "2026-12-31T23:59:59Z",
      viewsCount: 2840,
      clicksCount: 890,
      applicationsCount: 64,
      costUsd: 0,
      externalUrl: "/careers",
    },
    {
      id: "post-04",
      requisitionId: "REQ-2026-00120",
      requisitionTitle: "SAP SuccessFactors Consultant",
      channel: "GLASSDOOR",
      status: "ACTIVE",
      publishedAt: "2026-10-10T10:00:00Z",
      expiresAt: "2026-11-10T10:00:00Z",
      viewsCount: 650,
      clicksCount: 125,
      applicationsCount: 18,
      costUsd: 320,
      externalUrl: "https://glassdoor.com/job-listing/max-sap-sf-120",
    },
  ];

  private assessments: CandidateAssessment[] = [
    {
      id: "asmt-01",
      candidateId: "cand-app-01",
      candidateName: "Priya Menon",
      requisitionId: "REQ-2026-00123",
      requisitionTitle: "Senior Java Developer",
      testId: "test-tmpl-01",
      testTitle: "Java 21 & Distributed Microservices Assessment",
      provider: "HACKERRANK",
      category: "TECHNICAL_CODING",
      durationMinutes: 60,
      passingScorePct: 80,
      candidateScorePct: 96,
      status: "PASSED",
      assignedAt: "2026-10-12T10:00:00Z",
      completedAt: "2026-10-12T11:15:00Z",
      adminNotes: "Finished all 3 distributed system problems in 48 minutes with 100% test case pass rate.",
    },
    {
      id: "asmt-02",
      candidateId: "cand-app-02",
      candidateName: "Arjun R",
      requisitionId: "REQ-2026-00123",
      requisitionTitle: "Senior Java Developer",
      testId: "test-tmpl-01",
      testTitle: "Java 21 & Distributed Microservices Assessment",
      provider: "HACKERRANK",
      category: "TECHNICAL_CODING",
      durationMinutes: 60,
      passingScorePct: 80,
      candidateScorePct: 72,
      status: "FAILED",
      assignedAt: "2026-10-13T14:00:00Z",
      completedAt: "2026-10-13T15:20:00Z",
      adminNotes: "Struggled with multi-threading race condition problem. Passed basic algorithms.",
    },
    {
      id: "asmt-03",
      candidateId: "cand-app-04",
      candidateName: "Sneha S",
      requisitionId: "REQ-2026-00123",
      requisitionTitle: "Senior Java Developer",
      testId: "test-tmpl-01",
      testTitle: "Java 21 & Distributed Microservices Assessment",
      provider: "CODILITY",
      category: "TECHNICAL_CODING",
      durationMinutes: 60,
      passingScorePct: 80,
      status: "IN_PROGRESS",
      assignedAt: "2026-10-15T09:00:00Z",
      adminNotes: "Test link delivered to sneha.s@gmail.com; invite valid for 48 hours.",
    },
  ];

  private bgvChecks: BgvCheck[] = [
    {
      id: "bgv-401",
      candidateId: "cand-app-01",
      candidateName: "Priya Menon",
      candidateEmail: "priya.menon@gmail.com",
      requisitionId: "REQ-2026-00123",
      requisitionTitle: "Senior Java Developer",
      provider: "CHECKR_GLOBAL",
      status: "CLEARED",
      checks: {
        criminalCheck: "PASSED",
        educationVerification: "PASSED",
        employmentHistory: "PASSED",
        identityAndDrug: "PASSED",
      },
      initiatedAt: "2026-10-13T09:00:00Z",
      completedAt: "2026-10-15T14:30:00Z",
      assignedInvestigator: "Checkr Global Automated Verification",
      reportNotes: "All 3 prior employers (Oracle, Infosys, TechCorp) verified. Degree verified with VTU. Clean criminal background.",
    },
    {
      id: "bgv-402",
      candidateId: "cand-app-08",
      candidateName: "Manu P",
      candidateEmail: "manu.p@devs.net",
      requisitionId: "REQ-2026-00123",
      requisitionTitle: "Senior Java Developer",
      provider: "CHECKR_GLOBAL",
      status: "CLEARED",
      checks: {
        criminalCheck: "PASSED",
        educationVerification: "PASSED",
        employmentHistory: "PASSED",
        identityAndDrug: "PASSED",
      },
      initiatedAt: "2026-10-06T10:00:00Z",
      completedAt: "2026-10-08T16:00:00Z",
      assignedInvestigator: "Internal HR Compliance",
      reportNotes: "Zero adverse records. Direct hire completed.",
    },
    {
      id: "bgv-403",
      candidateId: "cand-app-06",
      candidateName: "Suresh N",
      candidateEmail: "suresh.n@corp.org",
      requisitionId: "REQ-2026-00120",
      requisitionTitle: "SAP SuccessFactors",
      provider: "FIRST_ADVANTAGE",
      status: "IN_PROGRESS",
      checks: {
        criminalCheck: "PASSED",
        educationVerification: "PASSED",
        employmentHistory: "PENDING",
        identityAndDrug: "PENDING",
      },
      initiatedAt: "2026-10-14T11:00:00Z",
      assignedInvestigator: "First Advantage Compliance Team",
      reportNotes: "Awaiting final employer letter from prior organization.",
    },
  ];

  private agencies: AgencyPartner[] = [
    {
      id: "agency-01",
      name: "Apex Executive Search Global",
      contactPerson: "David Sterling",
      contactEmail: "david.sterling@apex-talent.com",
      phone: "+1 (415) 555-8833",
      commissionPct: 20,
      guaranteePeriodDays: 90,
      status: "ACTIVE",
      totalCandidatesSubmitted: 12,
      totalHired: 3,
      totalCommissionsPaidUsd: 78000,
      specialty: "VP & Senior Cloud Architecture Leadership",
    },
    {
      id: "agency-02",
      name: "TechTalent Distributed Partners",
      contactPerson: "Jessica Walsh",
      contactEmail: "jessica@techtalent-dist.io",
      phone: "+44 20 7946 0912",
      commissionPct: 18,
      guaranteePeriodDays: 60,
      status: "ACTIVE",
      totalCandidatesSubmitted: 16,
      totalHired: 4,
      totalCommissionsPaidUsd: 92000,
      specialty: "Full-Stack, Java & DevOps Engineering",
    },
    {
      id: "agency-03",
      name: "NextGen ERP Recruiters",
      contactPerson: "Rahul Verma",
      contactEmail: "rahul@nextgenerp.in",
      phone: "+91 98112 33445",
      commissionPct: 15,
      guaranteePeriodDays: 90,
      status: "ACTIVE",
      totalCandidatesSubmitted: 8,
      totalHired: 2,
      totalCommissionsPaidUsd: 36000,
      specialty: "SAP SF, Workday & Oracle Cloud Consultants",
    },
  ];

  private agencySubmissions: AgencyCandidateSubmission[] = [
    {
      id: "sub-01",
      agencyId: "agency-02",
      agencyName: "TechTalent Distributed Partners",
      candidateName: "Manu P",
      candidateEmail: "manu.p@devs.net",
      requisitionId: "REQ-2026-00123",
      requisitionTitle: "Senior Java Developer",
      proposedSalaryUsd: 145000,
      calculatedFeeUsd: 26100,
      status: "HIRED",
      submittedAt: "2026-10-02T10:00:00Z",
    },
    {
      id: "sub-02",
      agencyId: "agency-01",
      agencyName: "Apex Executive Search Global",
      candidateName: "Devin Archer",
      candidateEmail: "devin.archer@apex-talent.com",
      requisitionId: "REQ-2026-00123",
      requisitionTitle: "Senior Java Developer",
      proposedSalaryUsd: 160000,
      calculatedFeeUsd: 32000,
      status: "IN_REVIEW",
      submittedAt: "2026-10-13T14:30:00Z",
    },
  ];

  private preOnboardingRecords: PreOnboardingRecord[] = [
    {
      id: "onb-701",
      candidateId: "cand-app-01",
      candidateName: "Priya Menon",
      candidateEmail: "priya.menon@gmail.com",
      requisitionId: "REQ-2026-00123",
      requisitionTitle: "Senior Java Developer",
      department: "Engineering",
      targetStartDate: "2026-11-01",
      status: "READY_FOR_HIRE",
      progressPct: 100,
      tasks: {
        welcomePacketSent: true,
        identityDocumentsUploaded: true,
        taxFormsCompleted: true,
        confidentialitySigned: true,
        itHardwareRequested: true,
        emailAndAccountsProvisioned: true,
        orientationBuddyAssigned: true,
      },
      hardwareSelected: "MACBOOK_PRO_M3",
      workEmailAllocated: "priya.menon@max-erp.com",
      orientationBuddyName: "Alex Rivera (Senior Engineer)",
      notes: "Pre-onboarding checklist 100% complete. Eligible for 1-click hire into active Workforce.",
    },
    {
      id: "onb-702",
      candidateId: "cand-app-06",
      candidateName: "Suresh N",
      candidateEmail: "suresh.n@corp.org",
      requisitionId: "REQ-2026-00120",
      requisitionTitle: "SAP SuccessFactors",
      department: "HR Tech",
      targetStartDate: "2026-11-15",
      status: "IN_PROGRESS",
      progressPct: 65,
      tasks: {
        welcomePacketSent: true,
        identityDocumentsUploaded: true,
        taxFormsCompleted: true,
        confidentialitySigned: true,
        itHardwareRequested: false,
        emailAndAccountsProvisioned: false,
        orientationBuddyAssigned: false,
      },
      hardwareSelected: "THINKPAD_P16",
      notes: "Offer signed. Awaiting hardware allocation and buddy selection.",
    },
  ];

  private analyticsData = {
    overview: {
      averageTimeToHireDays: 21.8,
      timeToHireTrendPct: -14.2,
      averageCostPerHireUsd: 3850,
      costPerHireTrendPct: -8.5,
      offerAcceptanceRatePct: 92.4,
      totalHiresYtd: 24,
      activeOpeningsCount: 8,
      pipelinePassThroughRatePct: 19.2,
    },
    funnelConversion: [
      { stage: "APPLIED", count: 218, conversionPct: 100 },
      { stage: "SCREENING", count: 82, conversionPct: 37.6 },
      { stage: "ASSESSMENT", count: 54, conversionPct: 24.7 },
      { stage: "INTERVIEW", count: 32, conversionPct: 14.6 },
      { stage: "OFFER", count: 14, conversionPct: 6.4 },
      { stage: "HIRED", count: 12, conversionPct: 5.5 },
    ],
    channelPerformance: [
      { channel: "CAREERS_PORTAL", candidates: 94, hires: 6, costPerHireUsd: 780, qualityScore: 4.8 },
      { channel: "LINKEDIN", candidates: 78, hires: 4, costPerHireUsd: 2850, qualityScore: 4.5 },
      { channel: "EMPLOYEE_REFERRAL", candidates: 28, hires: 3, costPerHireUsd: 2000, qualityScore: 4.9 },
      { channel: "AGENCY_PARTNERS", candidates: 14, hires: 1, costPerHireUsd: 14200, qualityScore: 4.6 },
      { channel: "INDEED", candidates: 42, hires: 2, costPerHireUsd: 1650, qualityScore: 4.1 },
    ],
    departmentVelocity: [
      { department: "Engineering", openReqs: 3, targetHeadcount: 5, filledHeadcount: 3, avgDaysToFill: 22.4 },
      { department: "HR Tech", openReqs: 2, targetHeadcount: 3, filledHeadcount: 2, avgDaysToFill: 18.0 },
      { department: "Product", openReqs: 1, targetHeadcount: 2, filledHeadcount: 1, avgDaysToFill: 24.5 },
      { department: "Finance", openReqs: 1, targetHeadcount: 1, filledHeadcount: 1, avgDaysToFill: 15.2 },
    ],
  };

  // --- Scorecard Methods ---
  getScorecards(candidateId?: string): InterviewScorecard[] {
    if (!candidateId) return [...this.scorecards];
    return this.scorecards.filter((s) => s.candidateId.toLowerCase() === candidateId.toLowerCase());
  }

  addScorecard(item: Partial<InterviewScorecard>): InterviewScorecard {
    const sc: InterviewScorecard = {
      id: item.id || `sc-${Date.now().toString().slice(-4)}`,
      candidateId: item.candidateId || "cand-app-01",
      candidateName: item.candidateName || "Candidate",
      requisitionId: item.requisitionId || "REQ-2026-00123",
      requisitionTitle: item.requisitionTitle || "Senior Java Developer",
      interviewerId: item.interviewerId || "emp-101",
      interviewerName: item.interviewerName || "Interviewer",
      interviewerRole: item.interviewerRole || "Technical Reviewer",
      roundType: item.roundType || "SYSTEM_ARCHITECTURE",
      overallRecommendation: item.overallRecommendation || "STRONG_HIRE",
      competencyRatings: item.competencyRatings || {
        technicalProficiency: 5,
        systemDesignArchitecture: 5,
        problemSolvingVelocity: 4,
        communicationAndTeamwork: 5,
        cultureAndValuesAdd: 5,
      },
      strengthsSummary: item.strengthsSummary || "Verified strong architecture and coding capability.",
      areasOfConcern: item.areasOfConcern || "None noted.",
      notes: item.notes || "Scorecard submitted via MAX ERP Interview Studio.",
      submittedAt: new Date().toISOString(),
      isBlindReview: !!item.isBlindReview,
    };
    this.scorecards.unshift(sc);
    this.logActivity(sc.requisitionId, sc.interviewerName, "Submitted interview scorecard", `Rated ${sc.overallRecommendation} for ${sc.candidateName}`);
    return sc;
  }

  // --- Job Posting Methods ---
  getJobPostings(requisitionId?: string): JobPostingChannel[] {
    if (!requisitionId || requisitionId === "ALL") return [...this.jobPostings];
    return this.jobPostings.filter((p) => p.requisitionId.toLowerCase() === requisitionId.toLowerCase());
  }

  addJobPosting(item: Partial<JobPostingChannel>): JobPostingChannel {
    const post: JobPostingChannel = {
      id: item.id || `post-${Date.now().toString().slice(-4)}`,
      requisitionId: item.requisitionId || "REQ-2026-00123",
      requisitionTitle: item.requisitionTitle || "Senior Java Developer",
      channel: item.channel || "LINKEDIN",
      status: item.status || "ACTIVE",
      publishedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
      viewsCount: 0,
      clicksCount: 0,
      applicationsCount: 0,
      costUsd: item.costUsd || 0,
      externalUrl: item.externalUrl || "https://linkedin.com/jobs",
    };
    this.jobPostings.unshift(post);
    this.logActivity(post.requisitionId, "John Smith", "Published job posting to external channel", `Channel: ${post.channel}`);
    return post;
  }

  // --- Assessment Methods ---
  getAssessments(candidateId?: string): CandidateAssessment[] {
    if (!candidateId) return [...this.assessments];
    return this.assessments.filter((a) => a.candidateId.toLowerCase() === candidateId.toLowerCase());
  }

  addAssessment(item: Partial<CandidateAssessment>): CandidateAssessment {
    const asmt: CandidateAssessment = {
      id: item.id || `asmt-${Date.now().toString().slice(-4)}`,
      candidateId: item.candidateId || "cand-app-01",
      candidateName: item.candidateName || "Candidate",
      requisitionId: item.requisitionId || "REQ-2026-00123",
      requisitionTitle: item.requisitionTitle || "Senior Java Developer",
      testId: item.testId || "test-tmpl-01",
      testTitle: item.testTitle || "Technical Coding Assessment",
      provider: item.provider || "HACKERRANK",
      category: item.category || "TECHNICAL_CODING",
      durationMinutes: item.durationMinutes || 60,
      passingScorePct: item.passingScorePct || 80,
      status: "ASSIGNED",
      assignedAt: new Date().toISOString(),
      adminNotes: item.adminNotes || "Invited via MAX ERP Assessment Studio.",
    };
    this.assessments.unshift(asmt);
    this.logActivity(asmt.requisitionId, "John Smith", "Assigned candidate assessment", `Test: ${asmt.testTitle} for ${asmt.candidateName}`);
    return asmt;
  }

  // --- BGV Methods ---
  getBgvChecks(candidateId?: string): BgvCheck[] {
    if (!candidateId) return [...this.bgvChecks];
    return this.bgvChecks.filter((b) => b.candidateId.toLowerCase() === candidateId.toLowerCase());
  }

  addBgvCheck(item: Partial<BgvCheck>): BgvCheck {
    const bgv: BgvCheck = {
      id: item.id || `bgv-${Date.now().toString().slice(-4)}`,
      candidateId: item.candidateId || "cand-app-01",
      candidateName: item.candidateName || "Candidate",
      candidateEmail: item.candidateEmail || "candidate@example.com",
      requisitionId: item.requisitionId || "REQ-2026-00123",
      requisitionTitle: item.requisitionTitle || "Senior Java Developer",
      provider: item.provider || "CHECKR_GLOBAL",
      status: "INITIATED",
      checks: {
        criminalCheck: "PENDING",
        educationVerification: "PENDING",
        employmentHistory: "PENDING",
        identityAndDrug: "PENDING",
      },
      initiatedAt: new Date().toISOString(),
      assignedInvestigator: "Checkr Global Automated Verification",
      reportNotes: item.reportNotes || "Screening initiated in compliance with corporate hiring policy.",
    };
    this.bgvChecks.unshift(bgv);
    this.logActivity(bgv.requisitionId, "HR Compliance", "Initiated background verification (BGV)", `Candidate: ${bgv.candidateName}`);
    return bgv;
  }

  updateBgvCheck(id: string, updates: Partial<BgvCheck>): BgvCheck | null {
    const bgv = this.bgvChecks.find((b) => b.id.toLowerCase() === id.toLowerCase());
    if (!bgv) return null;
    Object.assign(bgv, updates);
    return { ...bgv };
  }

  // --- Agency Methods ---
  getAgencies(): AgencyPartner[] {
    return [...this.agencies];
  }

  getAgencySubmissions(): AgencyCandidateSubmission[] {
    return [...this.agencySubmissions];
  }

  addAgencySubmission(item: Partial<AgencyCandidateSubmission>): AgencyCandidateSubmission {
    const sub: AgencyCandidateSubmission = {
      id: item.id || `sub-${Date.now().toString().slice(-4)}`,
      agencyId: item.agencyId || "agency-01",
      agencyName: item.agencyName || "Apex Executive Search Global",
      candidateName: item.candidateName || "Candidate",
      candidateEmail: item.candidateEmail || "candidate@agency.com",
      requisitionId: item.requisitionId || "REQ-2026-00123",
      requisitionTitle: item.requisitionTitle || "Senior Java Developer",
      proposedSalaryUsd: item.proposedSalaryUsd || 150000,
      calculatedFeeUsd: Math.round((item.proposedSalaryUsd || 150000) * 0.2),
      status: "SUBMITTED",
      submittedAt: new Date().toISOString(),
    };
    this.agencySubmissions.unshift(sub);
    this.logActivity(sub.requisitionId, sub.agencyName, "Agency candidate submitted", `Candidate: ${sub.candidateName} for ${sub.requisitionTitle}`);
    return sub;
  }

  // --- Pre-Onboarding Methods ---
  getPreOnboardingRecords(): PreOnboardingRecord[] {
    return [...this.preOnboardingRecords];
  }

  updatePreOnboardingTask(recordId: string, taskKey: string): PreOnboardingRecord | null {
    const record = this.preOnboardingRecords.find((r) => r.id.toLowerCase() === recordId.toLowerCase());
    if (!record) return null;
    if (taskKey in record.tasks) {
      (record.tasks as any)[taskKey] = !(record.tasks as any)[taskKey];
    }
    const completedTasks = Object.values(record.tasks).filter(Boolean).length;
    record.progressPct = Math.round((completedTasks / 7) * 100);
    if (record.progressPct === 100) {
      record.status = "READY_FOR_HIRE";
    } else {
      record.status = "IN_PROGRESS";
    }
    return { ...record };
  }

  hireToWorkforce(recordId: string): { success: boolean; message: string; employeeId: string } {
    const record = this.preOnboardingRecords.find((r) => r.id.toLowerCase() === recordId.toLowerCase());
    const empId = `EMP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    if (record) {
      record.status = "COMPLETED";
      record.progressPct = 100;
      this.updateCandidateStage(record.candidateId, "Hired", "Hired");
      const req = this.getRequisitionById(record.requisitionId);
      if (req) {
        req.filledHeadcount = (req.filledHeadcount || 0) + 1;
        if (req.filledHeadcount >= req.targetHeadcount) {
          req.status = "Filled";
        }
      }
      this.logActivity(
        record.requisitionId,
        "John Smith",
        "Hired candidate to Workforce",
        `Candidate ${record.candidateName} converted to active Employee ${empId} in Workforce Management.`
      );
    }
    return {
      success: true,
      message: `Candidate converted to active employee (${empId}) in Workforce Management.`,
      employeeId: empId,
    };
  }

  // --- Analytics Data ---
  getAnalyticsData() {
    return { ...this.analyticsData };
  }
}

export const recruitmentStore = new RecruitmentStore();
