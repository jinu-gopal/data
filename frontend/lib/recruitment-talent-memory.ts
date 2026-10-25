// MAX ERP Recruitment Talent Memory Engine
// Authoritative intelligence layer for candidate rediscovery, terminology expansion,
// duplicate detection, and talent history across past requisitions.

import { recruitmentStore, CandidateItem, Requisition } from "./recruitment-store";

export interface SkillEquivalenceRule {
  canonicalSkill: string;
  equivalents: string[];
  category: "Languages" | "Frameworks" | "Cloud" | "Data" | "Design" | "Enterprise";
}

export const SKILL_EQUIVALENCE_DICTIONARY: SkillEquivalenceRule[] = [
  {
    canonicalSkill: "Kubernetes",
    equivalents: ["k8s", "container orchestration", "helm", "openshift", "eks", "gke", "aks"],
    category: "Cloud",
  },
  {
    canonicalSkill: "Java",
    equivalents: ["java 21", "java 17", "java 11", "core java", "j2ee", "jvm", "kotlin"],
    category: "Languages",
  },
  {
    canonicalSkill: "Spring Boot",
    equivalents: ["spring framework", "spring cloud", "spring security", "spring data", "spring mvc"],
    category: "Frameworks",
  },
  {
    canonicalSkill: "Kafka",
    equivalents: ["apache kafka", "event streaming", "rabbitmq", "pulsar", "aws kinesis", "message broker"],
    category: "Data",
  },
  {
    canonicalSkill: "Microservices",
    equivalents: ["distributed systems", "rest apis", "grpc", "service mesh", "soa"],
    category: "Frameworks",
  },
  {
    canonicalSkill: "AWS",
    equivalents: ["amazon web services", "cloud computing", "ec2", "s3", "lambda", "cloud native"],
    category: "Cloud",
  },
  {
    canonicalSkill: "SAP SuccessFactors",
    equivalents: ["employee central", "successfactors", "sap rcm", "integration center", "odata apis", "sap erp"],
    category: "Enterprise",
  },
  {
    canonicalSkill: "SQL",
    equivalents: ["postgresql", "mysql", "oracle db", "relational database", "rdbms", "complex queries"],
    category: "Data",
  },
  {
    canonicalSkill: "UI/UX Design",
    equivalents: ["figma", "design systems", "wireframing", "user research", "prototyping", "design tokens"],
    category: "Design",
  },
];

export interface CandidateDuplicateMatch {
  candidateId: string;
  candidateName: string;
  matchedField: "email" | "phone" | "name_similarity";
  confidenceScore: number;
  existingRequisition: string;
}

export interface RediscoveredCandidate {
  candidate: CandidateItem;
  originalRequisitionId: string;
  originalRequisitionTitle: string;
  matchScore: number;
  matchReasons: string[];
  demonstratedEquivalents: { canonical: string; foundInProfile: string }[];
  duplicateRisk?: CandidateDuplicateMatch;
  provenance: {
    appliedDate: string;
    source: string;
    pastInterviewFeedback?: string;
    assessmentPercentile?: number;
  };
}

class RecruitmentTalentMemory {
  /**
   * Search and rediscover candidates across past requisitions using terminology expansion
   */
  public searchPastTalent(params: {
    query?: string;
    targetRequisitionId?: string;
    minTenureYears?: number;
    skills?: string[];
  }): RediscoveredCandidate[] {
    const allCandidates = recruitmentStore.getCandidates();
    const requisitions = recruitmentStore.getRequisitions();
    const targetReq = requisitions.find((r) => r.reqNumber === params.targetRequisitionId || r.id === params.targetRequisitionId);

    const requiredSkills = params.skills && params.skills.length > 0
      ? params.skills
      : targetReq?.requiredSkills || ["Java", "Spring Boot", "Microservices"];

    const q = (params.query || "").toLowerCase().trim();

    const results: RediscoveredCandidate[] = [];

    allCandidates.forEach((cand) => {
      let score = cand.matchScore || 50;
      const matchReasons: string[] = [];
      const demonstratedEquivalents: { canonical: string; foundInProfile: string }[] = [];

      const candSkills = (cand.skillsBreakdown || []).map((s) => s.name.toLowerCase());
      const candFullText = `${cand.name} ${cand.role} ${cand.aiSummary} ${cand.interviewNotes} ${candSkills.join(" ")}`.toLowerCase();

      // 1. Terminology Expansion Matching
      requiredSkills.forEach((reqSkill) => {
        const canonical = reqSkill.toLowerCase();
        const rule = SKILL_EQUIVALENCE_DICTIONARY.find(
          (r) => r.canonicalSkill.toLowerCase() === canonical || r.equivalents.includes(canonical)
        );

        if (rule) {
          const directMatch = candSkills.some((s) => s.includes(canonical));
          if (directMatch) {
            matchReasons.push(`Direct skill demonstration: ${rule.canonicalSkill}`);
            demonstratedEquivalents.push({ canonical: rule.canonicalSkill, foundInProfile: rule.canonicalSkill });
            score += 10;
          } else {
            const equivFound = rule.equivalents.find((eq) => candFullText.includes(eq));
            if (equivFound) {
              matchReasons.push(`Equivalent competence demonstrated: '${equivFound}' satisfies '${rule.canonicalSkill}'`);
              demonstratedEquivalents.push({ canonical: rule.canonicalSkill, foundInProfile: equivFound });
              score += 8;
            }
          }
        }
      });

      // 2. Query filter
      if (q) {
        if (!candFullText.includes(q)) {
          return;
        }
        matchReasons.push(`Matches search keyword '${q}'`);
      }

      // 3. Historical Provenance
      const originalReq = requisitions.find((r) => r.reqNumber === cand.requisitionId || r.id === cand.requisitionId);

      // Check duplicates
      const duplicateRisk = this.checkDuplicateProfile(cand, allCandidates);

      score = Math.min(score, 98);

      results.push({
        candidate: cand,
        originalRequisitionId: cand.requisitionId,
        originalRequisitionTitle: originalReq?.title || cand.requisitionTitle,
        matchScore: score,
        matchReasons,
        demonstratedEquivalents,
        duplicateRisk,
        provenance: {
          appliedDate: cand.appliedDate,
          source: cand.source,
          pastInterviewFeedback: cand.interviewNotes,
          assessmentPercentile: cand.matchScore >= 90 ? 96 : cand.matchScore >= 80 ? 88 : 74,
        },
      });
    });

    results.sort((a, b) => b.matchScore - a.matchScore);
    return results;
  }

  /**
   * Duplicate profile detection (matching email, phone, or name similarity)
   */
  public checkDuplicateProfile(
    target: CandidateItem,
    allCandidates: CandidateItem[]
  ): CandidateDuplicateMatch | undefined {
    for (const c of allCandidates) {
      if (c.id === target.id) continue;

      if (c.email.toLowerCase() === target.email.toLowerCase()) {
        return {
          candidateId: c.id,
          candidateName: c.name,
          matchedField: "email",
          confidenceScore: 100,
          existingRequisition: c.requisitionTitle,
        };
      }

      if (c.phone && target.phone && c.phone.replace(/\D/g, "") === target.phone.replace(/\D/g, "")) {
        return {
          candidateId: c.id,
          candidateName: c.name,
          matchedField: "phone",
          confidenceScore: 98,
          existingRequisition: c.requisitionTitle,
        };
      }

      if (c.name.toLowerCase() === target.name.toLowerCase()) {
        return {
          candidateId: c.id,
          candidateName: c.name,
          matchedField: "name_similarity",
          confidenceScore: 85,
          existingRequisition: c.requisitionTitle,
        };
      }
    }
    return undefined;
  }
}

export const recruitmentTalentMemory = new RecruitmentTalentMemory();
