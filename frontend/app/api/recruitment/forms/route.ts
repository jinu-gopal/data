import { NextRequest, NextResponse } from "next/server";

export interface FormFieldConfig {
  fieldKey: string;
  label: string;
  fieldType: "TEXT" | "EMAIL" | "PHONE" | "NUMBER" | "DATE" | "SELECT" | "MULTI_SELECT" | "TEXTAREA" | "FILE" | "BOOLEAN";
  isMandatory: boolean;
  options?: string[];
  placeholder?: string;
}

export interface FormSectionConfig {
  sectionKey: string;
  title: string;
  description: string;
  enabled: boolean;
  fields: FormFieldConfig[];
}

export interface ScreeningQuestionConfig {
  id: string;
  question: string;
  type: "YES_NO" | "MULTIPLE_CHOICE" | "TEXT" | "NUMERIC";
  options?: string[];
  idealAnswer?: string;
  isKnockout: boolean;
  knockoutReason?: string;
}

export interface ApplicationFormConfig {
  id: string;
  requisitionId?: string | null;
  formTitle: string;
  description: string;
  isDefault: boolean;
  isActive: boolean;
  sections: FormSectionConfig[];
  screeningQuestions: ScreeningQuestionConfig[];
  updatedAt: string;
}

let formConfigs: ApplicationFormConfig[] = [
  {
    id: "form-standard-default",
    requisitionId: null,
    formTitle: "Standard Global Enterprise Application Form",
    description: "Default application form configured with standard EEO, prerequisite validation, and OFCCP declarations.",
    isDefault: true,
    isActive: true,
    updatedAt: new Date().toISOString(),
    sections: [
      {
        sectionKey: "PERSONAL_INFO",
        title: "1. Personal Credentials",
        description: "Legal identity and core contact details.",
        enabled: true,
        fields: [
          { fieldKey: "fullName", label: "Full Legal Name", fieldType: "TEXT", isMandatory: true, placeholder: "e.g. Maya Patel" },
          { fieldKey: "email", label: "Email Address", fieldType: "EMAIL", isMandatory: true, placeholder: "maya.patel@example.com" },
          { fieldKey: "phone", label: "Phone Number", fieldType: "PHONE", isMandatory: false, placeholder: "+1 (555) 012-3456" },
          { fieldKey: "currentTitle", label: "Current Job Title", fieldType: "TEXT", isMandatory: false, placeholder: "e.g. Senior Software Engineer" },
        ],
      },
      {
        sectionKey: "RESUME_ATTACHMENT",
        title: "2. Resume / Curriculum Vitae",
        description: "Upload resume (PDF, DOCX, TXT) for automatic AI 4-pillar competency analysis.",
        enabled: true,
        fields: [
          { fieldKey: "resumeFile", label: "Resume File", fieldType: "FILE", isMandatory: true },
          { fieldKey: "portfolioUrl", label: "Portfolio / GitHub / LinkedIn URL", fieldType: "TEXT", isMandatory: false, placeholder: "https://linkedin.com/in/..." },
        ],
      },
      {
        sectionKey: "WORK_AUTHORIZATION",
        title: "3. Work Authorization & Prerequisites",
        description: "Legal eligibility and compliance screening.",
        enabled: true,
        fields: [
          {
            fieldKey: "hasWorkAuthorization",
            label: "Authorized to work in role location without visa sponsorship?",
            fieldType: "BOOLEAN",
            isMandatory: true,
          },
          {
            fieldKey: "meetsPrerequisites",
            label: "Meet mandatory technical competencies and minimum years experience?",
            fieldType: "BOOLEAN",
            isMandatory: true,
          },
        ],
      },
      {
        sectionKey: "COMPENSATION_AVAILABILITY",
        title: "4. Notice Period & Availability",
        description: "Target start date, notice period, and compensation requirements.",
        enabled: true,
        fields: [
          {
            fieldKey: "noticePeriodDays",
            label: "Notice Period",
            fieldType: "SELECT",
            isMandatory: false,
            options: ["Immediate (0 days)", "2 Weeks (14 days)", "30 Days", "60 Days", "90 Days"],
          },
          {
            fieldKey: "salaryExpectations",
            label: "Target Annual Salary (USD)",
            fieldType: "TEXT",
            isMandatory: false,
            placeholder: "e.g. $160,000",
          },
        ],
      },
      {
        sectionKey: "REFERRAL_PROGRAM",
        title: "5. Employee Referral & Internal Mobility",
        description: "Capture referral details for employee bonus distribution.",
        enabled: true,
        fields: [
          { fieldKey: "isReferred", label: "Referred by a MAX employee?", fieldType: "BOOLEAN", isMandatory: false },
          { fieldKey: "referrerName", label: "Referrer Name / Email", fieldType: "TEXT", isMandatory: false, placeholder: "e.g. Marcus Chen" },
          { fieldKey: "internalEmployeeId", label: "Referrer Employee ID", fieldType: "TEXT", isMandatory: false, placeholder: "e.g. EMP-ENG-001" },
        ],
      },
      {
        sectionKey: "CONSENT_DECLARATION",
        title: "6. Declarations & Consent",
        description: "Candidate data privacy and background verification consent.",
        enabled: true,
        fields: [
          {
            fieldKey: "privacyConsent",
            label: "I consent to the collection and processing of my application data under MAX ERP privacy policy.",
            fieldType: "BOOLEAN",
            isMandatory: true,
          },
        ],
      },
    ],
    screeningQuestions: [
      {
        id: "sq-01",
        question: "Do you hold at least 5 years of hands-on experience in distributed systems and cloud platforms?",
        type: "YES_NO",
        idealAnswer: "YES",
        isKnockout: false,
      },
      {
        id: "sq-02",
        question: "Are you willing to participate in a background verification check prior to formal employment?",
        type: "YES_NO",
        idealAnswer: "YES",
        isKnockout: true,
        knockoutReason: "Candidate declined background verification policy.",
      },
    ],
  },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const reqId = searchParams.get("requisitionId");

  if (reqId) {
    const specific = formConfigs.find((f) => f.requisitionId === reqId);
    if (specific) return NextResponse.json(specific);
  }

  const defaultForm = formConfigs.find((f) => f.isDefault) || formConfigs[0];
  return NextResponse.json(defaultForm);
}

export async function PUT(request: NextRequest) {
  try {
    const body: ApplicationFormConfig = await request.json();
    const idx = formConfigs.findIndex((f) => f.id === body.id);
    body.updatedAt = new Date().toISOString();

    if (idx >= 0) {
      formConfigs[idx] = body;
    } else {
      formConfigs.push(body);
    }

    return NextResponse.json(body);
  } catch (err: any) {
    return NextResponse.json({ error: "FAILED_TO_SAVE_FORM_CONFIG", message: err?.message }, { status: 400 });
  }
}
