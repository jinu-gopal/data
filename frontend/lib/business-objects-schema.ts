// MAX-ERP Business Objects Metadata & Schema Registry
// Defines fields for Position, Legal Entity, and Organization entities strictly configured under Business Objects.

export interface BusinessObjectFieldDef {
  key: string;
  label: string;
  type: "TEXT" | "NUMBER" | "SELECT" | "DATE" | "BOOLEAN" | "CURRENCY" | "TEXTAREA" | "TAGS";
  required: boolean;
  readOnly?: boolean;
  hidden?: boolean;
  options?: string[];
  category: "PRIMARY" | "ORGANIZATIONAL" | "COMPENSATION" | "CUSTOM" | "COMPLIANCE" | "QUALIFICATIONS";
  description?: string;
  isCustom?: boolean;
  defaultValue?: any;
  order?: number;
}

export type BusinessObjectKey = "POSITION" | "LEGAL_ENTITY" | "DEPARTMENT" | "EMPLOYEE" | "JOB_DESCRIPTION";

export interface BusinessObjectMetadata {
  objectKey: BusinessObjectKey;
  name: string;
  description: string;
  version: string;
  fields: BusinessObjectFieldDef[];
}

export const INITIAL_BUSINESS_OBJECTS: Record<string, BusinessObjectMetadata> = {
  JOB_DESCRIPTION: {
    objectKey: "JOB_DESCRIPTION",
    name: "Job Description",
    description: "Authoritative business object defining job description content, core competencies, qualifications, experience criteria, and compliance tags.",
    version: "2.5.0",
    fields: [
      {
        key: "description",
        label: "Job Summary & Overview",
        type: "TEXTAREA",
        required: true,
        category: "PRIMARY",
        order: 1,
        description: "Comprehensive role overview, mission statement, and strategic organizational context.",
      },
      {
        key: "responsibilities",
        label: "Key Responsibilities",
        type: "TAGS",
        required: true,
        category: "PRIMARY",
        order: 2,
        description: "List of core operational duties, day-to-day deliverables, and engineering responsibilities.",
      },
      {
        key: "requiredQualifications",
        label: "Required Qualifications",
        type: "TAGS",
        required: true,
        category: "QUALIFICATIONS",
        order: 3,
        options: [
          "Bachelor's Degree in Computer Science, Engineering, or related technical discipline",
          "5+ years of full-stack or backend enterprise software engineering experience",
          "Strong experience building distributed systems with Java 21, Spring Boot, or TypeScript",
          "Demonstrated expertise with SQL / relational databases and transaction isolation",
          "Hands-on containerization and CI/CD automation with Docker, Kubernetes, and GitHub Actions",
          "Excellent written and verbal communication skills with cross-functional stakeholders",
        ],
        description: "Mandatory qualification criteria required for candidate evaluation.",
      },
      {
        key: "preferredQualifications",
        label: "Preferred Qualifications",
        type: "TAGS",
        required: false,
        category: "QUALIFICATIONS",
        order: 4,
        options: [
          "Master's degree in CS, Computer Engineering, or MBA",
          "Experience architecting high-throughput event streaming systems with Apache Kafka",
          "Deep familiarity with OAuth2, OIDC, RBAC, and multi-tenant SaaS compliance",
          "Prior experience in fintech, enterprise HRIS / ERP, or payroll software development",
          "Familiarity with Next.js 15, React 19, and Tailwind CSS design systems",
        ],
        description: "Desirable skills that differentiate exceptional candidates.",
      },
      {
        key: "skills",
        label: "Core Competencies & Skills",
        type: "TAGS",
        required: true,
        category: "QUALIFICATIONS",
        order: 5,
        options: [
          "Java 21",
          "Spring Boot 3",
          "TypeScript",
          "React 19",
          "Next.js",
          "PostgreSQL",
          "Kafka",
          "Docker",
          "Kubernetes",
          "Microservices",
          "GraphQL",
          "REST APIs",
          "AWS Cloud",
          "System Design",
          "Agile Leadership",
          "CI/CD Pipelines",
        ],
        description: "Core technical competencies and skills tagged to the requisition.",
      },
      {
        key: "minExperience",
        label: "Minimum Experience (Years)",
        type: "NUMBER",
        required: true,
        category: "PRIMARY",
        order: 6,
        defaultValue: 3,
        description: "Minimum years of relevant professional experience required.",
      },
      {
        key: "maxExperience",
        label: "Maximum Experience (Years)",
        type: "NUMBER",
        required: false,
        category: "PRIMARY",
        order: 7,
        defaultValue: 8,
        description: "Target upper ceiling of relevant professional experience.",
      },
      {
        key: "educationLevel",
        label: "Education Level",
        type: "SELECT",
        required: true,
        category: "QUALIFICATIONS",
        order: 8,
        options: [
          "Bachelor's Degree",
          "Master's Degree",
          "Doctorate / Ph.D.",
          "Associate Degree",
          "High School / Secondary Diploma",
          "Equivalent Industry Experience",
        ],
        defaultValue: "Bachelor's Degree",
        description: "Baseline academic educational qualification.",
      },
      // Configurable Business Object custom fields
      {
        key: "securityClearance",
        label: "Security Clearance Requirement",
        type: "SELECT",
        required: false,
        options: ["None", "Public Trust", "Secret", "Top Secret / SCI"],
        category: "CUSTOM",
        isCustom: true,
        order: 9,
        defaultValue: "None",
        description: "Government compliance or statutory security clearance required for position.",
      },
      {
        key: "travelPercentage",
        label: "Travel Requirement",
        type: "SELECT",
        required: false,
        options: ["0% (No Travel)", "Up to 10%", "Up to 25%", "25% - 50%", "More than 50%"],
        category: "CUSTOM",
        isCustom: true,
        order: 10,
        defaultValue: "Up to 10%",
        description: "Expected domestic and international travel frequency.",
      },
      {
        key: "relocationAssistance",
        label: "Relocation Assistance Provided",
        type: "BOOLEAN",
        required: false,
        category: "CUSTOM",
        isCustom: true,
        order: 11,
        defaultValue: false,
        description: "Whether company relocation stipend and immigration visa sponsorship are offered.",
      },
      {
        key: "criticalRoleTag",
        label: "Continuity-Critical Position",
        type: "BOOLEAN",
        required: false,
        category: "CUSTOM",
        isCustom: true,
        order: 12,
        defaultValue: false,
        description: "Flagged under corporate succession planning and business continuity risk matrix.",
      },
      {
        key: "businessUnit",
        label: "Business Unit",
        type: "TEXT",
        required: false,
        category: "ORGANIZATIONAL",
        isCustom: true,
        order: 13,
        defaultValue: "Product Engineering",
        description: "Operational business unit hierarchy.",
      },
      {
        key: "jobCategory",
        label: "Job Category",
        type: "TEXT",
        required: false,
        category: "ORGANIZATIONAL",
        isCustom: true,
        order: 14,
        defaultValue: "Technology",
        description: "Functional job discipline classification.",
      },
      {
        key: "workShift",
        label: "Work Shift",
        type: "SELECT",
        required: false,
        options: ["Day Shift", "Night Shift", "Rotational", "Flexible"],
        category: "ORGANIZATIONAL",
        isCustom: true,
        order: 15,
        defaultValue: "Day Shift",
        description: "Assigned operational work shift schedule.",
      },
      {
        key: "remoteAllowed",
        label: "Remote Allowed",
        type: "BOOLEAN",
        required: false,
        category: "ORGANIZATIONAL",
        isCustom: true,
        order: 16,
        defaultValue: true,
        description: "Whether remote work is permitted for this role.",
      },
    ],
  },
  POSITION: {
    objectKey: "POSITION",
    name: "Enterprise Position",
    description: "Defines organizational position slots, reporting lines, FTE allocation, and compensation bands.",
    version: "2.4.0",
    fields: [
      { key: "positionCode", label: "Position Code", type: "TEXT", required: true, readOnly: true, category: "PRIMARY", description: "Unique enterprise identifier for the position (e.g. POS-EXEC-001)" },
      { key: "title", label: "Position Title", type: "TEXT", required: true, category: "PRIMARY", description: "Official job title for the role" },
      { key: "department", label: "Department", type: "SELECT", required: true, options: ["Executive", "Engineering", "Operations", "Finance", "Sales", "People Operations"], category: "ORGANIZATIONAL" },
      { key: "division", label: "Division", type: "TEXT", required: true, category: "ORGANIZATIONAL", description: "Corporate operational division" },
      { key: "businessUnit", label: "Business Unit", type: "TEXT", required: true, category: "ORGANIZATIONAL", description: "Strategic business unit" },
      { key: "legalEntity", label: "Legal Entity", type: "SELECT", required: true, options: ["MAX Technologies Corp (US)", "MAX Cloud Systems Ltd (UK)", "MAX APAC Operations Pte Ltd", "MAX Enterprise Services GmbH"], category: "ORGANIZATIONAL" },
      { key: "location", label: "Work Location / Site", type: "SELECT", required: true, options: ["San Francisco, CA (HQ)", "London, UK", "Singapore Hub", "Berlin, DE", "REMOTE"], category: "ORGANIZATIONAL" },
      { key: "jobLevel", label: "Job Level", type: "SELECT", required: true, options: ["C-LEVEL", "M-2", "M-1", "IC-5", "IC-4", "IC-3", "IC-2"], category: "PRIMARY" },
      { key: "jobBand", label: "Pay Grade Band", type: "TEXT", required: true, category: "COMPENSATION", description: "Standard compensation band" },
      { key: "fte", label: "FTE Allocation", type: "NUMBER", required: true, category: "PRIMARY", description: "Full-time equivalence (e.g. 1.0 or 0.5)" },
      { key: "costCenter", label: "Cost Center Tag", type: "TEXT", required: true, category: "COMPENSATION", description: "Financial GL cost center allocation" },
      { key: "reportsToPositionCode", label: "Reports-To Position", type: "TEXT", required: false, category: "ORGANIZATIONAL", description: "Parent position in organizational hierarchy" },
      { key: "minSalary", label: "Minimum Base Salary (USD)", type: "CURRENCY", required: true, category: "COMPENSATION" },
      { key: "maxSalary", label: "Maximum Base Salary (USD)", type: "CURRENCY", required: true, category: "COMPENSATION" },
      // Configurable Business Object custom fields
      { key: "securityClearance", label: "Security Clearance Required", type: "SELECT", required: false, options: ["None", "Public Trust", "Secret", "Top Secret"], category: "CUSTOM", isCustom: true, description: "Compliance clearance level required for slot" },
      { key: "criticalRoleTag", label: "Business Continuity Critical", type: "BOOLEAN", required: false, category: "CUSTOM", isCustom: true, description: "Key person risk flag for succession planning" },
      { key: "remotePolicy", label: "Work Arrangement Policy", type: "SELECT", required: false, options: ["Hybrid (3d office)", "Full Remote", "On-Site Only"], category: "CUSTOM", isCustom: true, description: "Configured workplace arrangement requirement" },
    ],
  },
  LEGAL_ENTITY: {
    objectKey: "LEGAL_ENTITY",
    name: "Legal Entity",
    description: "Statutory corporate body registered in a sovereign jurisdiction for financial and payroll governance.",
    version: "2.1.0",
    fields: [
      { key: "code", label: "Entity Code", type: "TEXT", required: true, readOnly: true, category: "PRIMARY", description: "Corporate statutory code (e.g. LE-US-01)" },
      { key: "name", label: "Legal Entity Name", type: "TEXT", required: true, category: "PRIMARY", description: "Registered legal corporate name" },
      { key: "type", label: "Entity Classification", type: "TEXT", required: true, readOnly: true, category: "PRIMARY" },
      { key: "country", label: "Country of Jurisdiction", type: "SELECT", required: true, options: ["United States", "United Kingdom", "Singapore", "Germany", "Canada"], category: "ORGANIZATIONAL" },
      { key: "currency", label: "Functional Currency", type: "SELECT", required: true, options: ["USD", "GBP", "SGD", "EUR", "CAD"], category: "COMPENSATION" },
      { key: "headName", label: "Managing Director / CEO", type: "TEXT", required: false, category: "ORGANIZATIONAL" },
      { key: "headTitle", label: "Officer Title", type: "TEXT", required: false, category: "ORGANIZATIONAL" },
      { key: "budgetUsd", label: "Authorized Annual Opex (USD)", type: "CURRENCY", required: true, category: "COMPENSATION" },
      { key: "description", label: "Entity Mandate", type: "TEXT", required: false, category: "PRIMARY" },
      // Configurable Business Object custom fields
      { key: "statutoryAuditor", label: "Statutory External Auditor", type: "SELECT", required: false, options: ["Deloitte & Touche LLP", "PricewaterhouseCoopers", "Ernst & Young", "KPMG"], category: "CUSTOM", isCustom: true, description: "Independent external auditing firm" },
      { key: "incorporationDate", label: "Date of Incorporation", type: "DATE", required: false, category: "CUSTOM", isCustom: true, description: "Official corporate charter filing date" },
      { key: "taxIdNumber", label: "Tax Identification / EIN", type: "TEXT", required: false, category: "CUSTOM", isCustom: true, description: "Jurisdictional tax identification number" },
    ],
  },
};

// Global in-memory store with local persistence
let boStore = { ...INITIAL_BUSINESS_OBJECTS };

export function getBusinessObject(objectKey: BusinessObjectKey | string): BusinessObjectMetadata {
  return boStore[objectKey] || INITIAL_BUSINESS_OBJECTS[objectKey];
}

export function addCustomFieldToBusinessObject(
  objectKey: BusinessObjectKey | string,
  field: BusinessObjectFieldDef
): BusinessObjectMetadata {
  const current = getBusinessObject(objectKey);
  if (!current) {
    throw new Error(`Business object ${objectKey} not found`);
  }
  const exists = current.fields.some((f) => f.key === field.key);
  
  let updatedFields: BusinessObjectFieldDef[];
  if (exists) {
    updatedFields = current.fields.map((f) => (f.key === field.key ? { ...field, isCustom: true } : f));
  } else {
    updatedFields = [...current.fields, { ...field, isCustom: true }];
  }

  boStore[objectKey] = {
    ...current,
    fields: updatedFields,
  };

  return boStore[objectKey];
}

export function removeCustomFieldFromBusinessObject(
  objectKey: BusinessObjectKey | string,
  fieldKey: string
): BusinessObjectMetadata {
  const current = getBusinessObject(objectKey);
  if (!current) {
    throw new Error(`Business object ${objectKey} not found`);
  }
  boStore[objectKey] = {
    ...current,
    fields: current.fields.filter((f) => f.key !== fieldKey || !f.isCustom),
  };
  return boStore[objectKey];
}
