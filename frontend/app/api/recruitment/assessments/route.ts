import { NextRequest, NextResponse } from "next/server";

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

export interface AssessmentTemplate {
  id: string;
  title: string;
  provider: "SYSTEM_NATIVE" | "HACKERRANK" | "CODILITY" | "TESTGORILLA";
  category: "TECHNICAL_CODING" | "APTITUDE_LOGIC" | "SYSTEM_ARCHITECTURE" | "SALES_SIMULATION";
  durationMinutes: number;
  passingScorePct: number;
  questionCount: number;
  description: string;
}

let assessmentTemplates: AssessmentTemplate[] = [
  {
    id: "test-tmpl-01",
    title: "Java 21 & Distributed Microservices Assessment",
    provider: "SYSTEM_NATIVE",
    category: "TECHNICAL_CODING",
    durationMinutes: 45,
    passingScorePct: 80,
    questionCount: 6,
    description: "Evaluates concurrency, reactive streams, Spring Boot security, and database transactional isolation.",
  },
  {
    id: "test-tmpl-02",
    title: "Executive Cognitive Aptitude & Logic (CCAT)",
    provider: "SYSTEM_NATIVE",
    category: "APTITUDE_LOGIC",
    durationMinutes: 20,
    passingScorePct: 75,
    questionCount: 15,
    description: "Evaluates spatial reasoning, math logic, and rapid problem comprehension under time constraints.",
  },
  {
    id: "test-tmpl-03",
    title: "HackerRank Senior Full-Stack Cloud Benchmark",
    provider: "HACKERRANK",
    category: "SYSTEM_ARCHITECTURE",
    durationMinutes: 60,
    passingScorePct: 85,
    questionCount: 3,
    description: "Multi-language algorithmic benchmark and distributed caching architecture simulation.",
  },
  {
    id: "test-tmpl-04",
    title: "Enterprise SaaS Sales Negotiation Simulation",
    provider: "TESTGORILLA",
    category: "SALES_SIMULATION",
    durationMinutes: 30,
    passingScorePct: 70,
    questionCount: 8,
    description: "Interactive scenario evaluation of MEDDPICC objection handling and enterprise pricing models.",
  },
];

let candidateAssessments: CandidateAssessment[] = [
  {
    id: "cand-test-101",
    candidateId: "cand-201",
    candidateName: "Maya Patel",
    requisitionId: "req-101",
    requisitionTitle: "Senior Full-Stack Cloud Architect",
    testId: "test-tmpl-01",
    testTitle: "Java 21 & Distributed Microservices Assessment",
    provider: "SYSTEM_NATIVE",
    category: "TECHNICAL_CODING",
    durationMinutes: 45,
    passingScorePct: 80,
    candidateScorePct: 94,
    status: "PASSED",
    assignedAt: "2026-10-14T09:00:00Z",
    completedAt: "2026-10-14T09:42:00Z",
    adminNotes: "Outstanding performance on thread-safe memory management and event stream ordering.",
  },
  {
    id: "cand-test-102",
    candidateId: "cand-205",
    candidateName: "Samuel Kim",
    requisitionId: "req-102",
    requisitionTitle: "Plant Reliability & Safety Lead",
    testId: "test-tmpl-02",
    testTitle: "Executive Cognitive Aptitude & Logic (CCAT)",
    provider: "SYSTEM_NATIVE",
    category: "APTITUDE_LOGIC",
    durationMinutes: 20,
    passingScorePct: 75,
    candidateScorePct: 88,
    status: "PASSED",
    assignedAt: "2026-10-13T11:00:00Z",
    completedAt: "2026-10-13T11:18:00Z",
  },
  {
    id: "cand-test-103",
    candidateId: "cand-207",
    candidateName: "Liam Vance",
    requisitionId: "req-104",
    requisitionTitle: "Enterprise Global Solutions Executive",
    testId: "test-tmpl-04",
    testTitle: "Enterprise SaaS Sales Negotiation Simulation",
    provider: "TESTGORILLA",
    category: "SALES_SIMULATION",
    durationMinutes: 30,
    passingScorePct: 70,
    candidateScorePct: 78,
    status: "PASSED",
    assignedAt: "2026-10-15T14:30:00Z",
    completedAt: "2026-10-15T14:58:00Z",
  },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  if (type === "templates") {
    return NextResponse.json(assessmentTemplates);
  }
  return NextResponse.json(candidateAssessments);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action || "ASSIGN";

    if (action === "CREATE_TEMPLATE") {
      const newTmpl: AssessmentTemplate = {
        id: "test-tmpl-" + Date.now().toString().slice(-6),
        title: body.title,
        provider: body.provider || "SYSTEM_NATIVE",
        category: body.category || "TECHNICAL_CODING",
        durationMinutes: body.durationMinutes || 30,
        passingScorePct: body.passingScorePct || 75,
        questionCount: body.questionCount || 5,
        description: body.description || "",
      };
      assessmentTemplates.unshift(newTmpl);
      return NextResponse.json(newTmpl, { status: 201 });
    }

    // Default: Assign assessment to candidate
    const newAssigned: CandidateAssessment = {
      id: "cand-test-" + Date.now().toString().slice(-6),
      candidateId: body.candidateId,
      candidateName: body.candidateName,
      requisitionId: body.requisitionId,
      requisitionTitle: body.requisitionTitle,
      testId: body.testId,
      testTitle: body.testTitle,
      provider: body.provider || "SYSTEM_NATIVE",
      category: body.category || "TECHNICAL_CODING",
      durationMinutes: body.durationMinutes || 30,
      passingScorePct: body.passingScorePct || 75,
      candidateScorePct: body.candidateScorePct !== undefined ? body.candidateScorePct : undefined,
      status: body.candidateScorePct !== undefined
        ? (body.candidateScorePct >= (body.passingScorePct || 75) ? "PASSED" : "FAILED")
        : "ASSIGNED",
      assignedAt: new Date().toISOString(),
      completedAt: body.candidateScorePct !== undefined ? new Date().toISOString() : undefined,
      externalInviteUrl: body.provider !== "SYSTEM_NATIVE" ? `https://tests.assessment-gateway.io/session/${Date.now()}` : undefined,
      adminNotes: body.adminNotes || "Assessment triggered via Recruiting Studio.",
    };

    candidateAssessments.unshift(newAssigned);
    return NextResponse.json(newAssigned, { status: 201 });
  } catch {
    return NextResponse.json({ error: "FAILED_TO_PROCESS_ASSESSMENT" }, { status: 400 });
  }
}
