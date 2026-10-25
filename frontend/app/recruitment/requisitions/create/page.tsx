"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import RecruitingShell from "@/components/recruitment/RecruitingShell";
import { BusinessObjectMetadata, BusinessObjectFieldDef, getBusinessObject } from "@/lib/business-objects-schema";

// Standard templates
const REQUISITION_TEMPLATES = [
  {
    id: "tpl-eng-sr",
    name: "Senior Cloud Backend Engineer",
    department: "Engineering",
    jobLevel: "Senior",
    employmentType: "Full-time",
    workArrangement: "Hybrid",
    location: "San Francisco, CA (HQ)",
    legalEntity: "MAX Technologies Corp (US)",
    costCenter: "CC-ENG-4020",
    minSalary: 150000,
    maxSalary: 185000,
    currency: "USD",
    minExperience: 5,
    maxExperience: 9,
    educationLevel: "Bachelor's Degree",
    description: "We are seeking a seasoned Senior Cloud Backend Engineer to lead the architecture and distributed scaling of MAX ERP core transaction processing services. In this role, you will build fault-tolerant microservices, optimize high-throughput PostgreSQL queries, and design Kafka event pipelines supporting millions of enterprise workflow events daily.",
    responsibilities: [
      "Architect and scale distributed Java 21 / Spring Boot 3 microservices with sub-50ms p99 latency.",
      "Design zero-downtime database schema migrations for PostgreSQL with rigorous multi-tenant data isolation.",
      "Lead architectural RFCs and mentor mid-level engineers on distributed systems resiliency patterns.",
      "Build real-time observability telemetry using Prometheus, OpenTelemetry, and Grafana dashboards.",
      "Champion CI/CD pipeline automation with Docker, Kubernetes, and automated end-to-end integration testing.",
    ],
    requiredQualifications: [
      "Bachelor's Degree in Computer Science, Software Engineering, or equivalent practical experience",
      "5+ years of production software engineering experience in Java or TypeScript",
      "Deep understanding of distributed transactions, ACID guarantees, and database indexing",
      "Proven hands-on experience with containerization (Docker, Kubernetes) and AWS/GCP cloud platforms",
    ],
    preferredQualifications: [
      "Master's Degree in Computer Science or related engineering discipline",
      "Experience with Apache Kafka event streaming and asynchronous event sourcing",
      "Prior experience in enterprise ERP, financial accounting, or human capital management platforms",
    ],
    skills: ["Java 21", "Spring Boot 3", "PostgreSQL", "Kafka", "Docker", "Kubernetes", "TypeScript", "System Design"],
  },
  {
    id: "tpl-prod-pm",
    name: "Principal Product Manager - Workflows",
    department: "Product",
    jobLevel: "Lead",
    employmentType: "Full-time",
    workArrangement: "Remote",
    location: "Remote",
    legalEntity: "MAX Technologies Corp (US)",
    costCenter: "CC-PROD-2010",
    minSalary: 160000,
    maxSalary: 195000,
    currency: "USD",
    minExperience: 6,
    maxExperience: 10,
    educationLevel: "Bachelor's Degree",
    description: "Join MAX ERP to lead the vision, execution, and enterprise customer adoption of our next-generation automated workflow engine. You will collaborate directly with enterprise CHROs and CIOs to transform complex multi-step HR and ERP processes into frictionless digital experiences.",
    responsibilities: [
      "Define multi-quarter product strategy and roadmap for enterprise business process automation.",
      "Conduct in-depth user discovery with global customers, synthesizing feedback into precise PRDs and user stories.",
      "Work in close partnership with engineering leads to prioritize high-value capabilities and ensure delivery velocity.",
      "Monitor product adoption telemetry, sprint velocity, and customer retention metrics.",
    ],
    requiredQualifications: [
      "Bachelor's degree in Business, Computer Science, or equivalent practical field",
      "5+ years of product management leadership in B2B enterprise SaaS",
      "Demonstrated ability to drive product roadmaps from conceptual ideation to commercial launch",
    ],
    preferredQualifications: [
      "MBA or Master's degree in engineering/technology",
      "Experience with enterprise workflow builders or BPMN automation systems",
    ],
    skills: ["Product Strategy", "User Research", "Agile Roadmap", "Enterprise Workflow", "Telemetry Analytics"],
  },
  {
    id: "tpl-hr-bp",
    name: "Senior HR Business Partner",
    department: "HR",
    jobLevel: "Senior",
    employmentType: "Full-time",
    workArrangement: "Hybrid",
    location: "London, UK",
    legalEntity: "MAX Cloud Systems Ltd (UK)",
    costCenter: "CC-HR-3000",
    minSalary: 85000,
    maxSalary: 110000,
    currency: "GBP",
    minExperience: 5,
    maxExperience: 8,
    educationLevel: "Bachelor's Degree",
    description: "Partner with international executive leaders across EMEA engineering and sales organizations to provide strategic people guidance, leadership coaching, workforce planning, and organizational talent design.",
    responsibilities: [
      "Serve as strategic advisor to departmental directors on organizational design, compensation, and retention.",
      "Lead talent calibration cycles, succession planning, and annual leadership performance reviews.",
      "Resolve complex employee relations matters with empathy, legal diligence, and regulatory adherence.",
      "Analyze workforce headcount attrition, engagement surveys, and compa-ratio benchmarks.",
    ],
    requiredQualifications: [
      "Bachelor's degree in Human Resources, Business Administration, or related discipline",
      "5+ years of progressive HRBP or People Operations experience in high-growth technology companies",
      "In-depth knowledge of UK and European statutory employment regulations",
    ],
    preferredQualifications: [
      "CIPD Level 7 or SHRM-SCP certification",
      "Experience supporting engineering or technical distributed organizations",
    ],
    skills: ["Workforce Planning", "Organizational Design", "Succession Planning", "Employee Relations", "Compensation Analysis"],
  },
];

export default function CreateJobRequisitionPage() {
  const router = useRouter();

  // Active step: 1: Job Details, 2: Hiring Team, 3: Additional Information, 4: Review & Submit
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Business object metadata state
  const [boMetadata, setBoMetadata] = useState<BusinessObjectMetadata | null>(null);
  const [isLoadingSchema, setIsLoadingSchema] = useState<boolean>(true);

  // Auto-generated Requisition Code
  const [autoReqNumber, setAutoReqNumber] = useState<string>("REQ-2026-0049");

  // Section A: Job Details Form State
  const [title, setTitle] = useState<string>("");
  const [department, setDepartment] = useState<string>("Engineering");
  const [legalEntity, setLegalEntity] = useState<string>("MAX Technologies Corp (US)");
  const [location, setLocation] = useState<string>("San Francisco, CA (HQ)");
  const [employmentType, setEmploymentType] = useState<"Full-time" | "Part-time" | "Contract">("Full-time");
  const [workArrangement, setWorkArrangement] = useState<string>("Hybrid");
  const [targetHeadcount, setTargetHeadcount] = useState<number>(1);
  const [targetStartDate, setTargetStartDate] = useState<string>("");
  const [selectedPositionId, setSelectedPositionId] = useState<string>("");

  // Section B: Job Description Form State (driven by Job Description business object)
  const [jobDescription, setJobDescription] = useState<string>("");
  const [responsibilities, setResponsibilities] = useState<string[]>([
    "Architect and implement scalable, resilient enterprise microservices with high transaction integrity.",
    "Collaborate with cross-functional product, UX, and QA engineering teams to ship mission-critical features.",
    "Conduct code reviews and mentor team members on system design and software craftsmanship.",
    "Participate in operational telemetry, automated CI/CD releases, and system reliability monitoring.",
  ]);
  const [newResponsibilityInput, setNewResponsibilityInput] = useState<string>("");

  const [requiredQualifications, setRequiredQualifications] = useState<string[]>([
    "Bachelor's Degree in Computer Science, Software Engineering, or related technical field",
    "5+ years of enterprise software engineering experience with Java, Spring Boot, or TypeScript",
    "Proven experience with relational databases, PostgreSQL, SQL optimization, and transaction handling",
  ]);
  const [newReqQualInput, setNewReqQualInput] = useState<string>("");

  const [preferredQualifications, setPreferredQualifications] = useState<string[]>([
    "Master's Degree in Computer Science or related STEM discipline",
    "Experience with Apache Kafka event streaming and distributed messaging",
    "Familiarity with containerized cloud deployments on Kubernetes and Docker",
  ]);
  const [newPrefQualInput, setNewPrefQualInput] = useState<string>("");

  const [skills, setSkills] = useState<string[]>(["Java 21", "Spring Boot 3", "PostgreSQL", "Docker"]);
  const [customSkillInput, setCustomSkillInput] = useState<string>("");

  const [minExperience, setMinExperience] = useState<number>(3);
  const [maxExperience, setMaxExperience] = useState<number>(8);
  const [educationLevel, setEducationLevel] = useState<string>("Bachelor's Degree");

  // Section C: Hiring Team Form State
  const [hiringManagerName, setHiringManagerName] = useState<string>("Maria Lopez");
  const [hiringManagerTitle, setHiringManagerTitle] = useState<string>("Engineering Director");
  const [hiringManagerEmail, setHiringManagerEmail] = useState<string>("maria.lopez@max-enterprise.com");
  const [recruiterName, setRecruiterName] = useState<string>("Alex Morgan");
  const [recruiterEmail, setRecruiterEmail] = useState<string>("alex.morgan@max-enterprise.com");
  const [interviewers, setInterviewers] = useState<string[]>(["David Miller", "Elena Rostova"]);
  const [costCenter, setCostCenter] = useState<string>("CC-ENG-4020");

  // Section D: Compensation & Vacancy Form State
  const [currency, setCurrency] = useState<string>("USD");
  const [minSalary, setMinSalary] = useState<number>(140000);
  const [maxSalary, setMaxSalary] = useState<number>(175000);
  const [payFrequency, setPayFrequency] = useState<string>("Annual");
  const [vacancyReason, setVacancyReason] = useState<string>("New Headcount / Expansion");
  const [replacementEmployee, setReplacementEmployee] = useState<string>("");

  // Section E: Additional Information (Custom Business Object fields)
  const [securityClearance, setSecurityClearance] = useState<string>("None");
  const [travelPercentage, setTravelPercentage] = useState<string>("Up to 10%");
  const [relocationAssistance, setRelocationAssistance] = useState<boolean>(false);
  const [criticalRoleTag, setCriticalRoleTag] = useState<boolean>(false);

  // Collapsible section toggles
  const [sectionOpenA, setSectionOpenA] = useState<boolean>(true);
  const [sectionOpenB, setSectionOpenB] = useState<boolean>(true);
  const [sectionOpenC, setSectionOpenC] = useState<boolean>(true);
  const [sectionOpenD, setSectionOpenD] = useState<boolean>(true);
  const [sectionOpenE, setSectionOpenE] = useState<boolean>(true);

  // Modals & Drawers
  const [showTemplateModal, setShowTemplateModal] = useState<boolean>(false);
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);
  const [showDiscardModal, setShowDiscardModal] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [createdRequisitionSummary, setCreatedRequisitionSummary] = useState<any>(null);

  // AI Assistant Copilot State
  const [aiPrompt, setAiPrompt] = useState<string>("");
  const [isAiGenerating, setIsAiGenerating] = useState<boolean>(false);
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [showAiDraftModal, setShowAiDraftModal] = useState<boolean>(false);
  const [pendingAiDraft, setPendingAiDraft] = useState<any>(null);

  // Available positions & employees from API
  const [availablePositions, setAvailablePositions] = useState<any[]>([]);
  const [availableEmployees, setAvailableEmployees] = useState<any[]>([]);

  // Submission & Validation status
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // 1. Load Business Object Schema and Reference Data
  useEffect(() => {
    let isMounted = true;

    async function loadInitialData() {
      try {
        setIsLoadingSchema(true);

        // Fetch authoritative Job Description business object schema
        const schemaRes = await fetch("/api/recruitment/job-description-schema");
        if (schemaRes.ok) {
          const json = await schemaRes.json();
          if (json.data && isMounted) {
            setBoMetadata(json.data);
          }
        } else {
          // Fallback to local registry
          const localBo = getBusinessObject("JOB_DESCRIPTION");
          if (isMounted) setBoMetadata(localBo);
        }

        // Fetch vacant positions
        try {
          const posRes = await fetch("/api/workforce/positions");
          if (posRes.ok) {
            const posData = await posRes.json();
            if (posData.positions && isMounted) {
              setAvailablePositions(posData.positions);
            }
          }
        } catch {}

        // Fetch employees for hiring team
        try {
          const empRes = await fetch("/api/workforce/employees");
          if (empRes.ok) {
            const empData = await empRes.json();
            if (Array.isArray(empData) && isMounted) {
              setAvailableEmployees(empData);
            }
          }
        } catch {}

        // Calculate next requisition code
        try {
          const reqRes = await fetch("/api/recruitment/requisitions");
          if (reqRes.ok) {
            const reqList = await reqRes.json();
            if (Array.isArray(reqList) && isMounted) {
              const nextId = reqList.length + 1;
              const formattedCode = `REQ-2026-00${nextId < 10 ? "0" + nextId : nextId}`;
              setAutoReqNumber(formattedCode);
            }
          }
        } catch {}
      } catch (err) {
        console.error("Failed to load schema data:", err);
      } finally {
        if (isMounted) setIsLoadingSchema(false);
      }
    }

    loadInitialData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Validation function
  const validateForm = (isDraft: boolean = false): boolean => {
    const errors: Record<string, string> = {};

    if (!title.trim()) {
      errors.title = "Job Title is required.";
    }

    if (!department) {
      errors.department = "Department is required.";
    }

    if (!location) {
      errors.location = "Location is required.";
    }

    if (!isDraft) {
      if (!jobDescription.trim()) {
        errors.jobDescription = "Job Summary & Overview is required by Job Description business object.";
      }

      if (responsibilities.length === 0) {
        errors.responsibilities = "At least one key responsibility is required.";
      }

      if (requiredQualifications.length === 0) {
        errors.requiredQualifications = "At least one required qualification is required.";
      }

      if (skills.length === 0) {
        errors.skills = "At least one core competency or skill tag is required.";
      }

      if (!hiringManagerName.trim()) {
        errors.hiringManager = "Hiring Manager is required.";
      }

      if (minSalary <= 0) {
        errors.minSalary = "Minimum salary must be greater than zero.";
      }

      if (maxSalary < minSalary) {
        errors.maxSalary = "Maximum salary cannot be less than minimum salary.";
      }

      if (vacancyReason === "Replacement" && !replacementEmployee.trim()) {
        errors.replacementEmployee = "Replacement employee name is required for replacement vacancies.";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle template selection
  const handleApplyTemplate = (tpl: typeof REQUISITION_TEMPLATES[0]) => {
    setTitle(tpl.name);
    setDepartment(tpl.department);
    setLegalEntity(tpl.legalEntity);
    setLocation(tpl.location);
    setCostCenter(tpl.costCenter);
    setMinSalary(tpl.minSalary);
    setMaxSalary(tpl.maxSalary);
    setCurrency(tpl.currency);
    setMinExperience(tpl.minExperience);
    setMaxExperience(tpl.maxExperience);
    setEducationLevel(tpl.educationLevel);
    setJobDescription(tpl.description);
    setResponsibilities([...tpl.responsibilities]);
    setRequiredQualifications([...tpl.requiredQualifications]);
    setPreferredQualifications([...tpl.preferredQualifications]);
    setSkills([...tpl.skills]);
    setShowTemplateModal(false);
    setValidationErrors({});
  };

  // AI Assistant Generation Handler
  const handleCallAi = async (action: string = "GENERATE_JOB_DESCRIPTION", customPromptText?: string) => {
    try {
      setIsAiGenerating(true);
      setAiMessage(null);

      const payload = {
        action: action === "CHAT" ? "CHAT_ASSIST" : action,
        requisitionTitle: title || "Software Engineer",
        department,
        employmentType,
        prompt: customPromptText || aiPrompt,
        skills,
      };

      const res = await fetch("/api/recruitment/ai-recruiter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("AI Assistant service response error.");
      const data = await res.json();

      if (action === "GENERATE_JOB_DESCRIPTION") {
        setPendingAiDraft(data);
        setShowAiDraftModal(true);
      } else if (action === "SUGGEST_SKILLS" && data.skills) {
        // Add non-duplicate skills
        const combined = Array.from(new Set([...skills, ...data.skills]));
        setSkills(combined);
        setAiMessage(`Added ${data.skills.length} market-benchmarked skills.`);
      } else if (action === "CHAT") {
        setAiMessage(data.reply || "AI prompt processed.");
        if (data.suggestedAction?.type === "APPLY_DESCRIPTION") {
          handleCallAi("GENERATE_JOB_DESCRIPTION");
        }
      }
    } catch (err: any) {
      setAiMessage("AI Assistant is currently unavailable. Please verify connection.");
    } finally {
      setIsAiGenerating(false);
    }
  };

  // Apply AI Draft into Form
  const handleApplyAiDraft = () => {
    if (!pendingAiDraft) return;
    if (pendingAiDraft.description) setJobDescription(pendingAiDraft.description);
    if (pendingAiDraft.responsibilities && pendingAiDraft.responsibilities.length > 0) {
      setResponsibilities(pendingAiDraft.responsibilities);
    }
    if (pendingAiDraft.requiredQualifications && pendingAiDraft.requiredQualifications.length > 0) {
      setRequiredQualifications(pendingAiDraft.requiredQualifications);
    }
    if (pendingAiDraft.preferredQualifications && pendingAiDraft.preferredQualifications.length > 0) {
      setPreferredQualifications(pendingAiDraft.preferredQualifications);
    }
    if (pendingAiDraft.suggestedSkills && pendingAiDraft.suggestedSkills.length > 0) {
      setSkills(Array.from(new Set([...skills, ...pendingAiDraft.suggestedSkills])));
    }
    setShowAiDraftModal(false);
    setAiMessage("✨ Applied AI-generated Job Description to form.");
  };

  // Responsibility operations
  const handleAddResponsibility = () => {
    if (!newResponsibilityInput.trim()) return;
    setResponsibilities([...responsibilities, newResponsibilityInput.trim()]);
    setNewResponsibilityInput("");
  };

  const handleRemoveResponsibility = (index: number) => {
    setResponsibilities(responsibilities.filter((_, i) => i !== index));
  };

  const handleMoveResponsibility = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= responsibilities.length) return;
    const copy = [...responsibilities];
    const temp = copy[index];
    copy[index] = copy[targetIdx];
    copy[targetIdx] = temp;
    setResponsibilities(copy);
  };

  // Qualification operations
  const handleAddRequiredQual = () => {
    if (!newReqQualInput.trim()) return;
    setRequiredQualifications([...requiredQualifications, newReqQualInput.trim()]);
    setNewReqQualInput("");
  };

  const handleRemoveRequiredQual = (index: number) => {
    setRequiredQualifications(requiredQualifications.filter((_, i) => i !== index));
  };

  const handleAddPreferredQual = () => {
    if (!newPrefQualInput.trim()) return;
    setPreferredQualifications([...preferredQualifications, newPrefQualInput.trim()]);
    setNewPrefQualInput("");
  };

  const handleRemovePreferredQual = (index: number) => {
    setPreferredQualifications(preferredQualifications.filter((_, i) => i !== index));
  };

  // Skill operations
  const handleToggleSkill = (skillName: string) => {
    if (skills.includes(skillName)) {
      setSkills(skills.filter((s) => s !== skillName));
    } else {
      setSkills([...skills, skillName]);
    }
  };

  const handleAddCustomSkill = () => {
    if (!customSkillInput.trim()) return;
    const trimmed = customSkillInput.trim();
    if (!skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
    }
    setCustomSkillInput("");
  };

  // Save / Submit Requisition
  const handleSubmitRequisition = async (status: "Draft" | "Pending Approval") => {
    const isDraft = status === "Draft";
    const isValid = validateForm(isDraft);
    if (!isValid) {
      // Find which section has error and switch step
      if (validationErrors.title || validationErrors.department || validationErrors.location) {
        setCurrentStep(1);
      } else if (validationErrors.hiringManager) {
        setCurrentStep(2);
      } else if (validationErrors.jobDescription || validationErrors.responsibilities || validationErrors.skills) {
        setCurrentStep(1);
      }
      return;
    }

    try {
      setIsSubmitting(true);

      const salaryRangeStr = `${currency === "USD" ? "$" : currency + " "}${minSalary.toLocaleString()} - ${currency === "USD" ? "$" : currency + " "}${maxSalary.toLocaleString()}`;

      const payload = {
        title,
        reqNumber: autoReqNumber,
        department,
        legalEntity,
        location,
        employmentType,
        workArrangement,
        targetHeadcount,
        targetStartDate: targetStartDate || undefined,
        positionId: selectedPositionId || undefined,
        status,
        salaryRange: salaryRangeStr,
        currency,
        costCenter,
        vacancyReason,
        replacementEmployee: vacancyReason === "Replacement" ? replacementEmployee : undefined,
        hiringManager: {
          name: hiringManagerName,
          title: hiringManagerTitle,
          email: hiringManagerEmail,
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces",
        },
        recruiter: {
          name: recruiterName,
          email: recruiterEmail,
          avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces",
        },
        interviewers,
        description: jobDescription,
        responsibilities,
        requiredQualifications,
        preferredQualifications,
        requiredSkills: skills,
        minExperience,
        maxExperience,
        educationLevel,
        customFields: {
          securityClearance,
          travelPercentage,
          relocationAssistance,
          criticalRoleTag,
        },
      };

      const res = await fetch("/api/recruitment/requisitions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Server rejected requisition submission.");
      }

      const created = await res.json();
      setCreatedRequisitionSummary({ ...payload, ...created });
      setShowSuccessModal(true);
    } catch (err: any) {
      alert(`Submission error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate completion percentage for progress bar
  const calculateCompletion = () => {
    let score = 0;
    if (title.trim()) score += 20;
    if (jobDescription.trim()) score += 20;
    if (responsibilities.length > 0) score += 20;
    if (skills.length > 0) score += 15;
    if (hiringManagerName) score += 15;
    if (minSalary > 0 && maxSalary >= minSalary) score += 10;
    return Math.min(100, score);
  };

  return (
    <RecruitingShell>
      <div className="space-y-6 pb-28">
        {/* 1. Header with Breadcrumbs, Title, Subtitle and Top Actions */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-200/80 pb-5">
          <div className="space-y-1">
            {/* Breadcrumb matching Screen 1 & 2 */}
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <Link href="/recruitment" className="hover:text-blue-600 transition">
                Recruiting
              </Link>
              <span>/</span>
              <Link href="/recruitment/requisitions" className="hover:text-blue-600 transition">
                Requisitions
              </Link>
              <span>/</span>
              <span className="text-slate-800 font-semibold">Create Job Requisition</span>
            </div>

            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Create Job Requisition
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Create a new hiring request using the Job Description business object.
            </p>
          </div>

          {/* Right Header Action Buttons & Compact AI Assistant */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Use Template Action */}
            <button
              type="button"
              onClick={() => setShowTemplateModal(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition shadow-2xs"
            >
              <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
              </svg>
              <span>Use Template</span>
            </button>

            {/* Preview Action */}
            <button
              type="button"
              onClick={() => setShowPreviewModal(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition shadow-2xs"
            >
              <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>Preview</span>
            </button>

            {/* Business Object Metadata Indicator */}
            <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200/80 text-[11px] font-semibold text-purple-700">
              <span className="h-2 w-2 rounded-full bg-purple-600 animate-pulse"></span>
              <span>JOB_DESCRIPTION v2.5.0</span>
            </div>
          </div>
        </div>

        {/* 2. Compact AI Assistant Panel (Upper Right Workspace Card) */}
        <div className="bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-slate-50 border border-blue-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-bold text-slate-900">MAX AI Assistant</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                    Copilot
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Draft descriptions, generate operational responsibilities, or suggest top competencies.
                </p>
              </div>
            </div>

            {/* Interactive Prompt Box */}
            <div className="flex items-center gap-2 flex-1 max-w-xl">
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCallAi("CHAT");
                }}
                placeholder="Ask AI: e.g. Draft job description for this role..."
                className="flex-1 px-3.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-2xs"
              />
              <button
                type="button"
                onClick={() => handleCallAi("CHAT")}
                disabled={isAiGenerating}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition shadow-xs disabled:opacity-50 shrink-0"
              >
                {isAiGenerating ? "Thinking..." : "Send"}
              </button>
            </div>
          </div>

          {/* Quick AI Action Pills */}
          <div className="mt-3 pt-2.5 border-t border-blue-100/80 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[11px] text-slate-500 font-medium">Quick Suggestions:</span>
            <button
              type="button"
              onClick={() => handleCallAi("GENERATE_JOB_DESCRIPTION")}
              disabled={isAiGenerating}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200/80 text-[11px] font-medium text-slate-700 hover:border-blue-300 hover:text-blue-600 transition shadow-2xs disabled:opacity-50"
            >
              <span>✨ Draft Job Description</span>
            </button>
            <button
              type="button"
              onClick={() => handleCallAi("SUGGEST_SKILLS")}
              disabled={isAiGenerating}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200/80 text-[11px] font-medium text-slate-700 hover:border-blue-300 hover:text-blue-600 transition shadow-2xs disabled:opacity-50"
            >
              <span>💡 Suggest Market Skills</span>
            </button>
            {aiMessage && (
              <span className="text-[11px] font-medium text-blue-700 bg-blue-100/60 px-2.5 py-0.5 rounded-md animate-fade-in">
                {aiMessage}
              </span>
            )}
          </div>
        </div>

        {/* 3. Four-Step Progress Stepper matching visual reference */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs">
          <div className="relative">
            {/* Connector line */}
            <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-200 -z-0 hidden md:block">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
              ></div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
              {/* Step 1 */}
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="flex items-center gap-3 text-left group"
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition ${
                    currentStep === 1
                      ? "bg-blue-600 text-white ring-4 ring-blue-100 shadow-xs"
                      : currentStep > 1
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 text-slate-500 border border-slate-200"
                  }`}
                >
                  {currentStep > 1 ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    "1"
                  )}
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Step 1</span>
                  <span className={`text-xs font-semibold ${currentStep === 1 ? "text-blue-600" : "text-slate-700"}`}>
                    Job Details
                  </span>
                </div>
              </button>

              {/* Step 2 */}
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="flex items-center gap-3 text-left group"
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition ${
                    currentStep === 2
                      ? "bg-blue-600 text-white ring-4 ring-blue-100 shadow-xs"
                      : currentStep > 2
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 text-slate-500 border border-slate-200"
                  }`}
                >
                  {currentStep > 2 ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    "2"
                  )}
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Step 2</span>
                  <span className={`text-xs font-semibold ${currentStep === 2 ? "text-blue-600" : "text-slate-700"}`}>
                    Hiring Team
                  </span>
                </div>
              </button>

              {/* Step 3 */}
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="flex items-center gap-3 text-left group"
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition ${
                    currentStep === 3
                      ? "bg-blue-600 text-white ring-4 ring-blue-100 shadow-xs"
                      : currentStep > 3
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 text-slate-500 border border-slate-200"
                  }`}
                >
                  {currentStep > 3 ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    "3"
                  )}
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Step 3</span>
                  <span className={`text-xs font-semibold ${currentStep === 3 ? "text-blue-600" : "text-slate-700"}`}>
                    Additional Info
                  </span>
                </div>
              </button>

              {/* Step 4 */}
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="flex items-center gap-3 text-left group"
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition ${
                    currentStep === 4
                      ? "bg-blue-600 text-white ring-4 ring-blue-100 shadow-xs"
                      : "bg-slate-100 text-slate-500 border border-slate-200"
                  }`}
                >
                  4
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Step 4</span>
                  <span className={`text-xs font-semibold ${currentStep === 4 ? "text-blue-600" : "text-slate-700"}`}>
                    Review & Submit
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Form Completion Progress Bar */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-4 text-xs">
            <span className="text-slate-500 font-medium">Form Readiness: {calculateCompletion()}%</span>
            <div className="w-48 sm:w-64 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${calculateCompletion()}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            SECTION A: Job Details (Active on Step 1)
        ========================================================================= */}
        <div className={`bg-white border border-slate-200/80 rounded-2xl shadow-2xs overflow-hidden transition ${currentStep === 1 || currentStep === 4 ? "block" : "hidden"}`}>
          <div
            onClick={() => setSectionOpenA(!sectionOpenA)}
            className="px-5 py-4 flex items-center justify-between cursor-pointer bg-slate-50/50 hover:bg-slate-50 transition border-b border-slate-100"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Section A — Job Details</h2>
                <p className="text-[11px] text-slate-500">Core requisition metadata, organizational placement, and headcount allocation.</p>
              </div>
            </div>
            <svg
              className={`h-4 w-4 text-slate-400 transition-transform ${sectionOpenA ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {sectionOpenA && (
            <div className="p-5 sm:p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* 1. Job Title */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700">
                    Job Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Senior Full-Stack Cloud Architect"
                    className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition ${
                      validationErrors.title ? "border-rose-400 bg-rose-50/30" : "border-slate-200"
                    }`}
                  />
                  {validationErrors.title && (
                    <p className="text-[11px] font-semibold text-rose-600">{validationErrors.title}</p>
                  )}
                </div>

                {/* 2. Requisition Code (Auto-generated) */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Requisition Code (System Generated)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={autoReqNumber}
                      readOnly
                      className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-700 cursor-not-allowed"
                    />
                    <div className="absolute right-3 top-3 text-slate-400">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* 3. Associated Position (EC Core integration) */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Associated Enterprise Position Slot (EC Core)
                  </label>
                  <select
                    value={selectedPositionId}
                    onChange={(e) => setSelectedPositionId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  >
                    <option value="">-- Link to Enterprise Position Slot (Optional) --</option>
                    {availablePositions.map((pos) => (
                      <option key={pos.positionCode || pos.id} value={pos.positionCode || pos.id}>
                        {pos.positionCode} - {pos.title} ({pos.status})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 4. Department */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Department <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Product">Product</option>
                    <option value="HR">People Operations / HR</option>
                    <option value="Finance">Finance & Corporate Accounting</option>
                    <option value="Sales">Global Enterprise Sales</option>
                    <option value="Design">Product Design & UX</option>
                    <option value="Marketing">Growth & Marketing</option>
                    <option value="Legal">Legal & Compliance</option>
                    <option value="IT">Enterprise IT & Security</option>
                    <option value="Operations">Operations</option>
                    <option value="Executive">Executive Office</option>
                  </select>
                </div>

                {/* 5. Legal Entity */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Company / Legal Entity <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={legalEntity}
                    onChange={(e) => setLegalEntity(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  >
                    <option value="MAX Technologies Corp (US)">MAX Technologies Corp (US)</option>
                    <option value="MAX Cloud Systems Ltd (UK)">MAX Cloud Systems Ltd (UK)</option>
                    <option value="MAX APAC Operations Pte Ltd">MAX APAC Operations Pte Ltd</option>
                    <option value="MAX Enterprise Services GmbH">MAX Enterprise Services GmbH</option>
                  </select>
                </div>

                {/* 6. Location */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Primary Work Location <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  >
                    <option value="San Francisco, CA (HQ)">San Francisco, CA (HQ)</option>
                    <option value="New York, NY">New York, NY</option>
                    <option value="London, UK">London, UK</option>
                    <option value="Singapore Hub">Singapore Hub</option>
                    <option value="Berlin, DE">Berlin, DE</option>
                    <option value="Remote">Full Remote (US / Global)</option>
                  </select>
                </div>

                {/* 7. Employment Type */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Employment Type
                  </label>
                  <select
                    value={employmentType}
                    onChange={(e) => setEmploymentType(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  >
                    <option value="Full-time">Full-time Regular</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Fixed-Term Contract</option>
                  </select>
                </div>

                {/* 8. Work Arrangement */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Workplace Arrangement
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {["On-site", "Hybrid", "Remote"].map((arr) => (
                      <button
                        key={arr}
                        type="button"
                        onClick={() => setWorkArrangement(arr)}
                        className={`py-2 px-3 rounded-xl border text-xs font-semibold transition ${
                          workArrangement === arr
                            ? "bg-blue-50 border-blue-600 text-blue-700 shadow-2xs"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {arr}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 9. Number of Openings */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Number of Openings (Headcount Target) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={targetHeadcount}
                    onChange={(e) => setTargetHeadcount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  />
                </div>

                {/* 10. Target Start Date */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Target Start Date
                  </label>
                  <input
                    type="date"
                    value={targetStartDate}
                    onChange={(e) => setTargetStartDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* =========================================================================
            SECTION B: Job Description (Configured by Job Description Business Object)
            Active on Step 1
        ========================================================================= */}
        <div className={`bg-white border border-slate-200/80 rounded-2xl shadow-2xs overflow-hidden transition ${currentStep === 1 || currentStep === 4 ? "block" : "hidden"}`}>
          <div
            onClick={() => setSectionOpenB(!sectionOpenB)}
            className="px-5 py-4 flex items-center justify-between cursor-pointer bg-slate-50/50 hover:bg-slate-50 transition border-b border-slate-100"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-slate-900">Section B — Job Description</h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 border border-purple-200/80">
                    Job Description Business Object
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Dynamic field schema loaded from the authoritative Job Description business object registry.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCallAi("GENERATE_JOB_DESCRIPTION");
                }}
                disabled={isAiGenerating}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 text-xs font-semibold transition"
              >
                <span>✨ Generate with AI</span>
              </button>
              <svg
                className={`h-4 w-4 text-slate-400 transition-transform ${sectionOpenB ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {sectionOpenB && (
            <div className="p-5 sm:p-6 space-y-6">
              {/* Field 1: Job Summary & Overview */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">
                    Job Summary & Overview <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] text-slate-400">{jobDescription.length} characters</span>
                </div>
                <textarea
                  rows={4}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Provide an engaging overview of the role, team mandate, and strategic purpose within MAX ERP..."
                  className={`w-full p-3.5 bg-slate-50 border rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition leading-relaxed ${
                    validationErrors.jobDescription ? "border-rose-400 bg-rose-50/30" : "border-slate-200"
                  }`}
                />
                {validationErrors.jobDescription && (
                  <p className="text-[11px] font-semibold text-rose-600">{validationErrors.jobDescription}</p>
                )}
              </div>

              {/* Field 2: Key Responsibilities (Dynamic Interactive List with reorder/delete) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">
                    Key Responsibilities <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] text-slate-400">{responsibilities.length} responsibilities configured</span>
                </div>

                <div className="space-y-2 bg-slate-50/60 p-3 sm:p-4 rounded-xl border border-slate-200/80">
                  {responsibilities.map((resp, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs group hover:border-purple-200 transition"
                    >
                      {/* Order handle */}
                      <div className="flex flex-col gap-0.5 pt-0.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleMoveResponsibility(index, "up")}
                          disabled={index === 0}
                          className="text-slate-400 hover:text-slate-700 disabled:opacity-20"
                          title="Move Up"
                        >
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveResponsibility(index, "down")}
                          disabled={index === responsibilities.length - 1}
                          className="text-slate-400 hover:text-slate-700 disabled:opacity-20"
                          title="Move Down"
                        >
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>

                      {/* Number badge */}
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-600 shrink-0 mt-0.5">
                        {index + 1}
                      </span>

                      {/* Editable Text */}
                      <input
                        type="text"
                        value={resp}
                        onChange={(e) => {
                          const copy = [...responsibilities];
                          copy[index] = e.target.value;
                          setResponsibilities(copy);
                        }}
                        className="flex-1 text-xs text-slate-800 bg-transparent focus:outline-hidden focus:ring-1 focus:ring-purple-500 rounded px-1"
                      />

                      {/* Delete Action */}
                      <button
                        type="button"
                        onClick={() => handleRemoveResponsibility(index)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition"
                        title="Delete Responsibility"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}

                  {/* Add New Responsibility Inline Input */}
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="text"
                      value={newResponsibilityInput}
                      onChange={(e) => setNewResponsibilityInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddResponsibility();
                      }}
                      placeholder="Add a new operational responsibility..."
                      className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddResponsibility}
                      className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold transition shrink-0"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Field 3: Required & Preferred Qualifications */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Required Qualifications */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700">
                    Required Qualifications <span className="text-rose-500">*</span>
                  </label>
                  <div className="space-y-2 bg-slate-50/60 p-3 rounded-xl border border-slate-200/80">
                    <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
                      {requiredQualifications.map((qual, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-900"
                        >
                          <span className="line-clamp-2">{qual}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveRequiredQual(idx)}
                            className="text-blue-400 hover:text-rose-600"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-1.5 pt-2 border-t border-slate-200">
                      <input
                        type="text"
                        value={newReqQualInput}
                        onChange={(e) => setNewReqQualInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleAddRequiredQual();
                        }}
                        placeholder="Add required qualification..."
                        className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                      <button
                        type="button"
                        onClick={handleAddRequiredQual}
                        className="px-2.5 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-semibold"
                      >
                        + Add
                      </button>
                    </div>
                  </div>
                </div>

                {/* Preferred Qualifications */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700">
                    Preferred Qualifications (Optional)
                  </label>
                  <div className="space-y-2 bg-slate-50/60 p-3 rounded-xl border border-slate-200/80">
                    <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
                      {preferredQualifications.map((qual, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 border border-purple-200 text-xs text-purple-900"
                        >
                          <span className="line-clamp-2">{qual}</span>
                          <button
                            type="button"
                            onClick={() => handleRemovePreferredQual(idx)}
                            className="text-purple-400 hover:text-rose-600"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-1.5 pt-2 border-t border-slate-200">
                      <input
                        type="text"
                        value={newPrefQualInput}
                        onChange={(e) => setNewPrefQualInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleAddPreferredQual();
                        }}
                        placeholder="Add preferred qualification..."
                        className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                      <button
                        type="button"
                        onClick={handleAddPreferredQual}
                        className="px-2.5 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-semibold"
                      >
                        + Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Field 4: Core Competencies & Skills */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Core Competencies & Skills <span className="text-rose-500">*</span>
                </label>

                {/* Selected Skills Tags */}
                <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-medium shadow-2xs"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => handleToggleSkill(skill)}
                        className="hover:text-rose-200 font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {skills.length === 0 && (
                    <span className="text-xs text-slate-400 italic">No skills selected yet.</span>
                  )}
                </div>

                {/* Suggestions from Business Object Schema */}
                <div className="pt-2">
                  <span className="block text-[11px] font-semibold text-slate-500 mb-1.5">
                    Click to add recommended competencies:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      "Java 21",
                      "Spring Boot 3",
                      "TypeScript",
                      "React 19",
                      "Next.js",
                      "PostgreSQL",
                      "Kafka",
                      "Docker",
                      "Kubernetes",
                      "GraphQL",
                      "AWS Cloud",
                      "System Design",
                      "Product Strategy",
                      "Agile Leadership",
                    ].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => handleToggleSkill(s)}
                        className={`px-2.5 py-1 rounded-lg text-xs transition border ${
                          skills.includes(s)
                            ? "bg-slate-200 border-slate-300 text-slate-700 font-semibold"
                            : "bg-white border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-600"
                        }`}
                      >
                        {skills.includes(s) ? `✓ ${s}` : `+ ${s}`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Add Custom Skill input */}
                <div className="flex items-center gap-2 pt-2 max-w-sm">
                  <input
                    type="text"
                    value={customSkillInput}
                    onChange={(e) => setCustomSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddCustomSkill();
                    }}
                    placeholder="Add custom competency..."
                    className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomSkill}
                    className="px-3 py-1.5 bg-slate-800 text-white rounded-xl text-xs font-semibold"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Field 5 & 6: Experience Range & Education Level */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Min Experience (Years) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={30}
                    value={minExperience}
                    onChange={(e) => setMinExperience(parseInt(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Max Experience (Years)
                  </label>
                  <input
                    type="number"
                    min={minExperience}
                    max={40}
                    value={maxExperience}
                    onChange={(e) => setMaxExperience(parseInt(e.target.value) || minExperience)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Education Level <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={educationLevel}
                    onChange={(e) => setEducationLevel(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold"
                  >
                    <option value="Bachelor's Degree">Bachelor's Degree</option>
                    <option value="Master's Degree">Master's Degree</option>
                    <option value="Doctorate / Ph.D.">Doctorate / Ph.D.</option>
                    <option value="Associate Degree">Associate Degree</option>
                    <option value="High School / Secondary Diploma">High School / Secondary Diploma</option>
                    <option value="Equivalent Industry Experience">Equivalent Industry Experience</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* =========================================================================
            SECTION C: Hiring Team (Active on Step 2)
        ========================================================================= */}
        <div className={`bg-white border border-slate-200/80 rounded-2xl shadow-2xs overflow-hidden transition ${currentStep === 2 || currentStep === 4 ? "block" : "hidden"}`}>
          <div
            onClick={() => setSectionOpenC(!sectionOpenC)}
            className="px-5 py-4 flex items-center justify-between cursor-pointer bg-slate-50/50 hover:bg-slate-50 transition border-b border-slate-100"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Section C — Hiring Team</h2>
                <p className="text-[11px] text-slate-500">Designated hiring manager, lead recruiter, and interview committee.</p>
              </div>
            </div>
            <svg
              className={`h-4 w-4 text-slate-400 transition-transform ${sectionOpenC ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {sectionOpenC && (
            <div className="p-5 sm:p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* 1. Hiring Manager */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Hiring Manager <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={hiringManagerName}
                    onChange={(e) => {
                      const selected = e.target.value;
                      setHiringManagerName(selected);
                      if (selected === "Maria Lopez") {
                        setHiringManagerTitle("Engineering Director");
                        setHiringManagerEmail("maria.lopez@max-enterprise.com");
                      } else if (selected === "Rohit Sharma") {
                        setHiringManagerTitle("VP of Product");
                        setHiringManagerEmail("rohit.sharma@max-enterprise.com");
                      } else if (selected === "Priya Nair") {
                        setHiringManagerTitle("Chief People Officer");
                        setHiringManagerEmail("priya.nair@max-enterprise.com");
                      } else if (selected === "David Miller") {
                        setHiringManagerTitle("Chief Technology Officer");
                        setHiringManagerEmail("david.miller@max-enterprise.com");
                      }
                    }}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  >
                    <option value="Maria Lopez">Maria Lopez — Engineering Director</option>
                    <option value="Rohit Sharma">Rohit Sharma — VP of Product</option>
                    <option value="Priya Nair">Priya Nair — Chief People Officer</option>
                    <option value="David Miller">David Miller — Chief Technology Officer</option>
                    <option value="Elena Vance">Elena Vance — Chief Executive Officer</option>
                  </select>
                </div>

                {/* 2. Lead Recruiter */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Lead Talent Acquisition Partner / Recruiter <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={recruiterName}
                    onChange={(e) => {
                      setRecruiterName(e.target.value);
                      if (e.target.value === "Alex Morgan") {
                        setRecruiterEmail("alex.morgan@max-enterprise.com");
                      } else {
                        setRecruiterEmail("john.smith@max-enterprise.com");
                      }
                    }}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  >
                    <option value="Alex Morgan">Alex Morgan — Senior Technical Recruiter</option>
                    <option value="John Smith">John Smith — Executive Recruiter</option>
                  </select>
                </div>

                {/* 3. Cost Center GL Code */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Financial Cost Center Allocation <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={costCenter}
                    onChange={(e) => setCostCenter(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-mono font-bold"
                  >
                    <option value="CC-ENG-4020">CC-ENG-4020 (Cloud Platform Engineering)</option>
                    <option value="CC-PROD-2010">CC-PROD-2010 (Product & Design Management)</option>
                    <option value="CC-HR-3000">CC-HR-3000 (Global People Operations)</option>
                    <option value="CC-FIN-5000">CC-FIN-5000 (Corporate Finance & Treasury)</option>
                    <option value="CC-SALES-1010">CC-SALES-1010 (Enterprise Field Sales)</option>
                  </select>
                </div>

                {/* 4. Additional Interviewers */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Interview Panel Members
                  </label>
                  <div className="flex flex-wrap gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl min-h-[44px]">
                    {interviewers.map((person) => (
                      <span
                        key={person}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-xs text-indigo-800 font-medium"
                      >
                        <span>{person}</span>
                        <button
                          type="button"
                          onClick={() => setInterviewers(interviewers.filter((p) => p !== person))}
                          className="hover:text-rose-600 font-bold"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    {["Elena Rostova", "Marcus Vance", "Sarah Jenkins", "Devin Archer"].map((cand) => {
                      if (!interviewers.includes(cand)) {
                        return (
                          <button
                            key={cand}
                            type="button"
                            onClick={() => setInterviewers([...interviewers, cand])}
                            className="px-2 py-0.5 rounded-md border border-dashed border-slate-300 text-[11px] text-slate-600 hover:border-indigo-400 hover:text-indigo-600"
                          >
                            + {cand}
                          </button>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* =========================================================================
            SECTION D: Compensation & Vacancy (Active on Step 3)
        ========================================================================= */}
        <div className={`bg-white border border-slate-200/80 rounded-2xl shadow-2xs overflow-hidden transition ${currentStep === 3 || currentStep === 4 ? "block" : "hidden"}`}>
          <div
            onClick={() => setSectionOpenD(!sectionOpenD)}
            className="px-5 py-4 flex items-center justify-between cursor-pointer bg-slate-50/50 hover:bg-slate-50 transition border-b border-slate-100"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Section D — Compensation & Vacancy</h2>
                <p className="text-[11px] text-slate-500">Pay bands, salary currency, vacancy justification, and replacement tracking.</p>
              </div>
            </div>
            <svg
              className={`h-4 w-4 text-slate-400 transition-transform ${sectionOpenD ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {sectionOpenD && (
            <div className="p-5 sm:p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                {/* 1. Currency */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Currency <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-bold"
                  >
                    <option value="USD">USD ($) — US Dollar</option>
                    <option value="EUR">EUR (€) — Euro</option>
                    <option value="GBP">GBP (£) — British Pound</option>
                    <option value="SGD">SGD (S$) — Singapore Dollar</option>
                    <option value="CAD">CAD ($) — Canadian Dollar</option>
                  </select>
                </div>

                {/* 2. Min Salary */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Minimum Base Salary <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step={5000}
                    value={minSalary}
                    onChange={(e) => setMinSalary(parseInt(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                  />
                </div>

                {/* 3. Max Salary */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Maximum Base Salary <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step={5000}
                    value={maxSalary}
                    onChange={(e) => setMaxSalary(parseInt(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                  />
                </div>

                {/* 4. Pay Frequency */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Pay Frequency
                  </label>
                  <select
                    value={payFrequency}
                    onChange={(e) => setPayFrequency(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  >
                    <option value="Annual">Annual / Per Year</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Hourly">Hourly Contractor Rate</option>
                  </select>
                </div>

                {/* 5. Vacancy Reason */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Vacancy Justification Reason <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={vacancyReason}
                    onChange={(e) => setVacancyReason(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold"
                  >
                    <option value="New Headcount / Expansion">New Headcount / Expansion</option>
                    <option value="Replacement">Replacement for Departing Employee</option>
                    <option value="Reorganization">Organizational Restructuring</option>
                    <option value="Backfill">Temporary Backfill / Maternity Cover</option>
                  </select>
                </div>

                {/* 6. Replacement Employee (Conditional) */}
                {vacancyReason === "Replacement" && (
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-rose-700">
                      Replacement Employee Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={replacementEmployee}
                      onChange={(e) => setReplacementEmployee(e.target.value)}
                      placeholder="e.g. John Doe (MX-1002)"
                      className="w-full px-3.5 py-2.5 bg-rose-50/40 border border-rose-300 rounded-xl text-xs text-slate-800"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* =========================================================================
            SECTION E: Additional Information (Custom Business Object Fields)
            Active on Step 3
        ========================================================================= */}
        <div className={`bg-white border border-slate-200/80 rounded-2xl shadow-2xs overflow-hidden transition ${currentStep === 3 || currentStep === 4 ? "block" : "hidden"}`}>
          <div
            onClick={() => setSectionOpenE(!sectionOpenE)}
            className="px-5 py-4 flex items-center justify-between cursor-pointer bg-slate-50/50 hover:bg-slate-50 transition border-b border-slate-100"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Section E — Additional Information</h2>
                <p className="text-[11px] text-slate-500">Configured custom fields, compliance checks, and relocation policies.</p>
              </div>
            </div>
            <svg
              className={`h-4 w-4 text-slate-400 transition-transform ${sectionOpenE ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {sectionOpenE && (
            <div className="p-5 sm:p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* Custom Field 1: Security Clearance */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700">
                      Security Clearance Requirement
                    </label>
                    <span className="text-[10px] text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded">Custom Field</span>
                  </div>
                  <select
                    value={securityClearance}
                    onChange={(e) => setSecurityClearance(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  >
                    <option value="None">None (Standard Enterprise Clearance)</option>
                    <option value="Public Trust">Public Trust</option>
                    <option value="Secret">Secret Clearance</option>
                    <option value="Top Secret / SCI">Top Secret / SCI</option>
                  </select>
                </div>

                {/* Custom Field 2: Travel Requirement */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700">
                      Travel Requirement
                    </label>
                    <span className="text-[10px] text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded">Custom Field</span>
                  </div>
                  <select
                    value={travelPercentage}
                    onChange={(e) => setTravelPercentage(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  >
                    <option value="0% (No Travel)">0% (No Travel)</option>
                    <option value="Up to 10%">Up to 10% (Occasional team offsites)</option>
                    <option value="Up to 25%">Up to 25% (Regional customer meetings)</option>
                    <option value="25% - 50%">25% - 50% (Frequent client visits)</option>
                    <option value="More than 50%">More than 50% (Field consulting)</option>
                  </select>
                </div>

                {/* Custom Field 3: Relocation Assistance */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Relocation Assistance Provided</span>
                    <span className="text-[11px] text-slate-500 block">Offer corporate relocation stipend and immigration visa sponsorship.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRelocationAssistance(!relocationAssistance)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                      relocationAssistance ? "bg-blue-600" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        relocationAssistance ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Custom Field 4: Critical Role Tag */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Continuity-Critical Position</span>
                    <span className="text-[11px] text-slate-500 block">Key person risk flag for enterprise succession planning.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCriticalRoleTag(!criticalRoleTag)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                      criticalRoleTag ? "bg-amber-600" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        criticalRoleTag ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* =========================================================================
            SECTION F: Review & Submit (Active on Step 4)
        ========================================================================= */}
        {currentStep === 4 && (
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-2xs p-5 sm:p-6 space-y-6 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Section F — Pre-Submission Review & Approval Workflow</h2>
                  <p className="text-[11px] text-slate-500">Verify all mandatory fields before dispatching into the automated approval chain.</p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 border border-amber-200 text-amber-800">
                  Ready to Submit
                </span>
              </div>
            </div>

            {/* Checklist of Mandatory Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Job Metadata</span>
                  <span className="text-emerald-600 font-bold text-xs">✓ Complete</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Title: <strong className="text-slate-800">{title || "(Untitled)"}</strong><br />
                  Code: <span className="font-mono">{autoReqNumber}</span> | {department}
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Job Description</span>
                  <span className="text-emerald-600 font-bold text-xs">✓ Complete</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  {responsibilities.length} duties • {skills.length} skills • {minExperience}-{maxExperience} yrs exp
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Compensation</span>
                  <span className="text-emerald-600 font-bold text-xs">✓ Complete</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  {currency === "USD" ? "$" : currency} {minSalary.toLocaleString()} - {currency === "USD" ? "$" : currency} {maxSalary.toLocaleString()} ({payFrequency})
                </p>
              </div>
            </div>

            {/* Configured 3-Step Approval Chain Preview */}
            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 space-y-3">
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span className="text-xs font-bold text-slate-900">Automated Approval Routing Chain</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                <div className="p-3 rounded-lg bg-white border border-blue-100 shadow-2xs">
                  <span className="block text-[10px] font-bold uppercase text-blue-600 tracking-wider">Step 1 — Hiring Manager</span>
                  <span className="block text-xs font-bold text-slate-800">{hiringManagerName}</span>
                  <span className="text-[11px] text-slate-500">{hiringManagerTitle}</span>
                </div>

                <div className="p-3 rounded-lg bg-white border border-blue-100 shadow-2xs">
                  <span className="block text-[10px] font-bold uppercase text-blue-600 tracking-wider">Step 2 — Department Head</span>
                  <span className="block text-xs font-bold text-slate-800">David Miller</span>
                  <span className="text-[11px] text-slate-500">Chief Technology Officer</span>
                </div>

                <div className="p-3 rounded-lg bg-white border border-blue-100 shadow-2xs">
                  <span className="block text-[10px] font-bold uppercase text-blue-600 tracking-wider">Step 3 — VP People Operations</span>
                  <span className="block text-xs font-bold text-slate-800">Priya Nair</span>
                  <span className="text-[11px] text-slate-500">Chief People Officer / HRVP</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            7. Persistent Bottom Action Bar matching approved design
        ========================================================================= */}
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg px-4 sm:px-8 py-3.5">
          <div className="max-w-[1720px] mx-auto flex items-center justify-between gap-4">
            {/* Left side actions */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowDiscardModal(true)}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 transition"
              >
                Cancel
              </button>

              <span className="text-xs text-slate-500 hidden sm:inline">
                Step <strong className="text-slate-800">{currentStep}</strong> of 4
              </span>
            </div>

            {/* Right side navigation & submission actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 transition"
                >
                  ← Previous
                </button>
              )}

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={() => {
                    if (currentStep === 1) {
                      if (!title.trim()) {
                        setValidationErrors({ title: "Job Title is required to advance." });
                        return;
                      }
                    }
                    setCurrentStep((prev) => Math.min(4, prev + 1));
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition"
                >
                  Next Step →
                </button>
              ) : null}

              {/* Save as Draft */}
              <button
                type="button"
                onClick={() => handleSubmitRequisition("Draft")}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : "Save as Draft"}
              </button>

              {/* Submit for Approval */}
              <button
                type="button"
                onClick={() => handleSubmitRequisition("Pending Approval")}
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <span>Submit for Approval</span>
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* =========================================================================
            MODAL 1: Role Templates Drawer
        ========================================================================= */}
        {showTemplateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Select Job Requisition Template</h3>
                  <p className="text-xs text-slate-500">Pick an enterprise role template to populate fields.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTemplateModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                {REQUISITION_TEMPLATES.map((tpl) => (
                  <div
                    key={tpl.id}
                    className="p-4 rounded-xl border border-slate-200 hover:border-blue-500/80 hover:bg-blue-50/30 transition cursor-pointer space-y-2 group"
                    onClick={() => handleApplyTemplate(tpl)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition">
                        {tpl.name}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        {tpl.department} • {tpl.jobLevel}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2">{tpl.description}</p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {tpl.skills.slice(0, 5).map((s) => (
                        <span key={s} className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-medium text-slate-600">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowTemplateModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            MODAL 2: Candidate-Facing Job Description Preview
        ========================================================================= */}
        {showPreviewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
            <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[88vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] uppercase font-bold text-blue-600 tracking-wider">Candidate Portal Preview</span>
                  <h3 className="text-lg font-bold text-slate-900">{title || "Untitled Role"}</h3>
                  <p className="text-xs text-slate-500">{department} • {location} • {employmentType} ({workArrangement})</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  ✕
                </button>
              </div>

              {/* Description Body */}
              <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">About the Role</h4>
                  <p className="whitespace-pre-line text-slate-600">{jobDescription || "No summary provided yet."}</p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 mb-1.5">Key Responsibilities</h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-600">
                    {responsibilities.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 mb-1.5">Qualifications</h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-600">
                    {requiredQualifications.map((q, i) => (
                      <li key={i}>{q}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 mb-1.5">Core Competencies</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {skills.map((s) => (
                      <span key={s} className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-200">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Pay Band: <strong className="text-slate-900">${minSalary.toLocaleString()} - ${maxSalary.toLocaleString()} / yr</strong></span>
                  <span>Education: <strong className="text-slate-900">{educationLevel}</strong></span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(false)}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            MODAL 3: Confirm Discard Unsaved Changes
        ========================================================================= */}
        {showDiscardModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center gap-3 text-rose-600">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Discard Requisition?</h3>
                  <p className="text-xs text-slate-500">All unsaved fields will be lost.</p>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowDiscardModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Continue Editing
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/recruitment/requisitions")}
                  className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700"
                >
                  Discard & Exit
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            MODAL 4: AI Draft Review & Confirmation Modal
        ========================================================================= */}
        {showAiDraftModal && pendingAiDraft && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-600 text-white text-xs">✨</span>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Review AI-Drafted Job Description</h3>
                    <p className="text-xs text-slate-500">Review generated content before applying it to your requisition form.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAiDraftModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-700">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-900 block">Drafted Summary:</span>
                  <p className="leading-relaxed">{pendingAiDraft.description}</p>
                </div>

                {pendingAiDraft.responsibilities && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-900 block">Suggested Responsibilities ({pendingAiDraft.responsibilities.length}):</span>
                    <ul className="list-disc list-inside space-y-1 text-slate-600">
                      {pendingAiDraft.responsibilities.map((r: string, i: number) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAiDraftModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Discard Draft
                </button>
                <button
                  type="button"
                  onClick={handleApplyAiDraft}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
                >
                  Apply to Form
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            MODAL 5: Submission Success Confirmation
        ========================================================================= */}
        {showSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {createdRequisitionSummary?.status === "Draft"
                    ? "Requisition Saved as Draft"
                    : "Requisition Submitted for Approval"}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Code: <strong className="text-slate-800">{createdRequisitionSummary?.reqNumber || autoReqNumber}</strong> — {title}
                </p>
                <p className="text-[11px] text-slate-500 mt-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  {createdRequisitionSummary?.status === "Draft"
                    ? "The draft has been saved. You can return anytime to complete fields and submit."
                    : "Successfully routed into the 3-step approval chain. Notifications sent to Hiring Manager and HRVP."}
                </p>
              </div>

              <div className="pt-2 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => router.push("/recruitment/requisitions")}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition"
                >
                  View in Job Requisitions List →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RecruitingShell>
  );
}
