import { NextRequest, NextResponse } from "next/server";

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
    technicalProficiency: number; // 1-5
    systemDesignArchitecture: number; // 1-5
    problemSolvingVelocity: number; // 1-5
    communicationAndTeamwork: number; // 1-5
    cultureAndValuesAdd: number; // 1-5
  };
  strengthsSummary: string;
  areasOfConcern: string;
  notes: string;
  submittedAt: string;
  isBlindReview: boolean;
}

let scorecardsStore: InterviewScorecard[] = [
  {
    id: "sc-101",
    candidateId: "cand-203",
    candidateName: "Elena Rostova",
    requisitionId: "req-101",
    requisitionTitle: "Senior Full-Stack Cloud Architect",
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
    strengthsSummary: "Exceptional mastery of high-concurrency distributed state machines, multi-region database sharding, and zero-downtime schema evolution.",
    areasOfConcern: "None noted; candidate exceeded expectations across distributed failure recovery scenarios.",
    notes: "Top 1% architectural thinker. Recommend immediate advancement to offer formulation with competitive equity band.",
    submittedAt: "2026-10-14T14:30:00Z",
    isBlindReview: false,
  },
  {
    id: "sc-102",
    candidateId: "cand-203",
    candidateName: "Elena Rostova",
    requisitionId: "req-101",
    requisitionTitle: "Senior Full-Stack Cloud Architect",
    interviewerId: "emp-102",
    interviewerName: "Rachel Green",
    interviewerRole: "Principal Distributed Systems Architect",
    roundType: "TECHNICAL_SCREEN",
    overallRecommendation: "HIRE",
    competencyRatings: {
      technicalProficiency: 5,
      systemDesignArchitecture: 4,
      problemSolvingVelocity: 5,
      communicationAndTeamwork: 4,
      cultureAndValuesAdd: 4,
    },
    strengthsSummary: "Demonstrated clear coding style in Java 21 virtual threads and Spring Boot security filters under live timed sandbox.",
    areasOfConcern: "Slight hesitation when discussing Kafka consumer group rebalances under network splits, but self-corrected quickly.",
    notes: "Solid technical fundamentals and very pleasant to collaborate with.",
    submittedAt: "2026-10-13T16:00:00Z",
    isBlindReview: false,
  },
  {
    id: "sc-103",
    candidateId: "cand-204",
    candidateName: "Dev Patel",
    requisitionId: "req-101",
    requisitionTitle: "Senior Full-Stack Cloud Architect",
    interviewerId: "emp-101",
    interviewerName: "Marcus Chen",
    interviewerRole: "VP Engineering",
    roundType: "SYSTEM_ARCHITECTURE",
    overallRecommendation: "HIRE",
    competencyRatings: {
      technicalProficiency: 4,
      systemDesignArchitecture: 4,
      problemSolvingVelocity: 4,
      communicationAndTeamwork: 5,
      cultureAndValuesAdd: 5,
    },
    strengthsSummary: "Strong cloud infrastructure background with Terraform and Kubernetes multi-cluster routing.",
    areasOfConcern: "Less hands-on experience with transactional database locking semantics compared to Elena.",
    notes: "Strong team player, would thrive in our distributed cloud operations pod.",
    submittedAt: "2026-10-15T11:00:00Z",
    isBlindReview: true,
  },
  {
    id: "sc-104",
    candidateId: "cand-205",
    candidateName: "Samantha Vance",
    requisitionId: "req-104",
    requisitionTitle: "Enterprise Global Solutions Executive",
    interviewerId: "emp-104",
    interviewerName: "David Sterling",
    interviewerRole: "Chief Revenue Officer",
    roundType: "EXECUTIVE_FINAL",
    overallRecommendation: "STRONG_HIRE",
    competencyRatings: {
      technicalProficiency: 4,
      systemDesignArchitecture: 4,
      problemSolvingVelocity: 5,
      communicationAndTeamwork: 5,
      cultureAndValuesAdd: 5,
    },
    strengthsSummary: "Superb executive presence. Successfully walked through closing a $3.2M enterprise ACV contract with Fortune 100 CFO.",
    areasOfConcern: "Requires aggressive quota accelerator to join.",
    notes: "Unanimous recommendation to extend enterprise offer.",
    submittedAt: "2026-10-15T15:30:00Z",
    isBlindReview: false,
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const candidateId = searchParams.get("candidateId");
    const requisitionId = searchParams.get("requisitionId");

    let list = scorecardsStore;
    if (candidateId) {
      list = list.filter((s) => s.candidateId === candidateId);
    }
    if (requisitionId) {
      list = list.filter((s) => s.requisitionId === requisitionId);
    }

    return NextResponse.json(list);
  } catch (error) {
    return NextResponse.json({ error: "Failed to load scorecards: " + String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newScorecard: InterviewScorecard = {
      id: `sc-${Date.now()}`,
      candidateId: body.candidateId || "cand-203",
      candidateName: body.candidateName || "Candidate",
      requisitionId: body.requisitionId || "req-101",
      requisitionTitle: body.requisitionTitle || "Role",
      interviewerId: body.interviewerId || "emp-current",
      interviewerName: body.interviewerName || "Interviewer",
      interviewerRole: body.interviewerRole || "Technical Reviewer",
      roundType: body.roundType || "TECHNICAL_SCREEN",
      overallRecommendation: body.overallRecommendation || "HIRE",
      competencyRatings: body.competencyRatings || {
        technicalProficiency: 4,
        systemDesignArchitecture: 4,
        problemSolvingVelocity: 4,
        communicationAndTeamwork: 4,
        cultureAndValuesAdd: 4,
      },
      strengthsSummary: body.strengthsSummary || "Solid technical competencies and problem decomposition.",
      areasOfConcern: body.areasOfConcern || "None noted.",
      notes: body.notes || "Scorecard submitted via MAX Recruiting Studio.",
      submittedAt: new Date().toISOString(),
      isBlindReview: body.isBlindReview ?? false,
    };

    scorecardsStore.unshift(newScorecard);
    return NextResponse.json(newScorecard, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to submit scorecard: " + String(error) }, { status: 500 });
  }
}
