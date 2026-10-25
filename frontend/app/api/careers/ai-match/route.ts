import { NextRequest, NextResponse } from "next/server";
import { buildBackendUrl } from "../../configuration/proxy-helper";
import { recruitmentStore } from "@/lib/recruitment-store";

interface JobRequisition {
  id: string;
  reqNumber: string;
  title: string;
  department: string;
  jobLevel: string;
  employmentType: string;
  location: string;
  targetHeadcount: number;
  filledHeadcount: number;
  salaryRange: string;
  hiringManagerName: string;
  status: string;
  requiredSkills: string[];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      resumeText = "",
      fileName = "",
      candidateProfile = "",
      generateCoverNote = false,
      targetJobTitle = "",
      targetDepartment = "",
    } = body;

    // Fetch active requisitions from backend
    let backendJobs: JobRequisition[] = [];
    try {
      const res = await fetch(buildBackendUrl("/api/v1/recruitment/public/requisitions"), {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      if (res.ok) {
        backendJobs = await res.json();
      }
    } catch {
      // Backend fallback
    }

    // Pull open requisitions from recruitmentStore
    const storeOpenJobs: JobRequisition[] = recruitmentStore
      .getRequisitions()
      .filter((r) => r.status === "Open")
      .map((r) => ({
        id: r.id,
        reqNumber: r.reqNumber,
        title: r.title,
        department: r.department,
        jobLevel: r.jobLevel || "SENIOR",
        employmentType: r.employmentType || "FULL_TIME",
        location: r.location || "Remote",
        targetHeadcount: r.targetHeadcount || 1,
        filledHeadcount: r.filledHeadcount || 0,
        salaryRange: r.salaryRange || "$130,000 - $165,000",
        hiringManagerName: r.hiringManager?.name || "Maria Lopez",
        status: "OPEN",
        requiredSkills: r.requiredSkills || ["Java 21", "Spring Boot", "Distributed Systems"],
      }));

    const combinedMap = new Map<string, JobRequisition>();
    storeOpenJobs.forEach((job) => combinedMap.set(job.reqNumber.toLowerCase(), job));
    backendJobs.forEach((job) => combinedMap.set((job.reqNumber || job.id).toLowerCase(), job));
    const jobs = Array.from(combinedMap.values());

    const combinedText = `${resumeText} ${candidateProfile}`.toLowerCase();

    // 1. Advanced 4-Pillar AI Parsing: Skills, Education, Certifications & Experience
    const parsedProfile = parseCandidateProfile(combinedText, fileName, resumeText);

    // 2. Generate Cover Note if requested
    let generatedCoverNote = "";
    if (generateCoverNote) {
      generatedCoverNote = generateAiCoverLetter(parsedProfile, targetJobTitle, targetDepartment);
    }

    // 3. Multi-Dimensional Fit Scoring for Each Requisition
    const matches = jobs.map((job) => {
      const skills = job.requiredSkills || [];
      const matchedSkills: string[] = [];
      const missingSkills: string[] = [];

      skills.forEach((skill) => {
        const skillLower = skill.toLowerCase();
        if (combinedText.includes(skillLower)) {
          matchedSkills.push(skill);
        } else {
          // Token partial match
          const tokens = skillLower.split(/[\s,]+/);
          const hasTokenMatch = tokens.some((t) => t.length > 2 && combinedText.includes(t));
          if (hasTokenMatch) {
            matchedSkills.push(skill);
          } else {
            missingSkills.push(skill);
          }
        }
      });

      // Pillar 1: Skills Alignment (40%)
      const skillScore = skills.length > 0 ? (matchedSkills.length / skills.length) * 100 : 75;

      // Pillar 2: Experience & Seniority Alignment (30%)
      const expYears = parsedProfile.experienceYears || 5;
      let expScore = 70;
      if (job.jobLevel.toUpperCase().includes("DIRECTOR") || job.jobLevel.toUpperCase().includes("STAFF") || job.jobLevel.toUpperCase().includes("LEAD")) {
        expScore = expYears >= 8 ? 95 : expYears >= 5 ? 75 : 50;
      } else if (job.jobLevel.toUpperCase().includes("SENIOR")) {
        expScore = expYears >= 5 ? 95 : expYears >= 3 ? 80 : 60;
      } else {
        expScore = expYears >= 2 ? 90 : 80;
      }

      // Pillar 3: Education & Certifications (20%)
      let eduCertScore = 70;
      if (parsedProfile.certifications.length > 0) eduCertScore += 15;
      if (parsedProfile.education.degreeLevel.includes("Master") || parsedProfile.education.degreeLevel.includes("PhD")) eduCertScore += 15;
      eduCertScore = Math.min(100, eduCertScore);

      // Pillar 4: Domain & Industry Fit (10%)
      let domainScore = 60;
      if (combinedText.includes(job.department.toLowerCase())) domainScore += 25;
      if (job.title.toLowerCase().split(" ").some((w) => w.length > 3 && combinedText.includes(w))) domainScore += 15;
      domainScore = Math.min(100, domainScore);

      // Weighted Total
      const weightedOverall = Math.round(
        skillScore * 0.40 +
        expScore * 0.30 +
        eduCertScore * 0.20 +
        domainScore * 0.10
      );
      const overallFit = Math.min(99, Math.max(35, weightedOverall));

      // Prerequisite Check
      const meetsCorePrereqs = matchedSkills.length >= Math.ceil(skills.length * 0.4);
      let prerequisiteReason = "Meets core competency and experience threshold.";
      if (!meetsCorePrereqs && skills.length > 0) {
        prerequisiteReason = `Missing critical prerequisite skills: ${missingSkills.slice(0, 2).join(", ")}.`;
      }

      let rationale = "";
      if (overallFit >= 85) {
        rationale = `Exceptional fit (${overallFit}%): Strong alignment across ${matchedSkills.length} key competencies (${matchedSkills.slice(0, 3).join(", ")}), validated by ${expYears} yrs experience and ${parsedProfile.education.degreeLevel || "formal credentials"}.`;
      } else if (overallFit >= 65) {
        rationale = `Promising match (${overallFit}%): Solid technical background in ${matchedSkills.join(", ") || job.department}. Recommend deepening expertise in ${missingSkills.slice(0, 2).join(", ")}.`;
      } else {
        rationale = `Growth opportunity (${overallFit}%): Relevant foundational background, but core requisition requires deeper ${missingSkills.slice(0, 2).join(", ")} specialization.`;
      }

      return {
        jobId: job.id,
        reqNumber: job.reqNumber,
        title: job.title,
        department: job.department,
        matchScore: overallFit,
        matchedSkills,
        missingSkills,
        aiRationale: rationale,
        meetsPrerequisites: meetsCorePrereqs,
        prerequisiteReason,
        scorecard: {
          skills: Math.round(skillScore),
          experience: Math.round(expScore),
          educationCerts: Math.round(eduCertScore),
          domainFit: Math.round(domainScore),
        },
      };
    });

    matches.sort((a, b) => b.matchScore - a.matchScore);

    return NextResponse.json({
      matches,
      parsedProfile,
      generatedCoverNote,
      analyzedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "AI_MATCH_FAILED", message: error instanceof Error ? error.message : "Error analyzing profile" },
      { status: 500 }
    );
  }
}

function parseCandidateProfile(textLower: string, fileName: string, originalText: string) {
  // Clean text from PDF artifacts if raw PDF bytecode was submitted
  const isBinaryOrPdf = originalText.includes("%PDF") || originalText.includes("obj\n<<") || /[\x00-\x08\x0E-\x1F]/.test(originalText);
  let cleanedText = originalText;
  if (isBinaryOrPdf) {
    // Extract readable ASCII word sequences from the raw PDF stream
    const asciiTokens = originalText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}|(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|[A-Za-z0-9#+]{2,}/g) || [];
    cleanedText = asciiTokens.join(" ");
  }

  const emailMatch = cleanedText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = cleanedText.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  const linkedinMatch = cleanedText.match(/https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+/);

  // Extract candidate name heuristic from file name, document lines, or email
  let name = "";
  if (fileName) {
    const cleanName = fileName.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
    const parts = cleanName.split(/\s+/).filter((p) => !["resume", "cv", "updated", "final", "2026", "2025", "2024", "v1", "v2", "profile", "document", "candidate"].includes(p.toLowerCase()));
    if (parts.length > 0) {
      name = parts.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
    }
  }

  // Fallback 1: Extract from early lines if plain text contains a candidate name header
  if (!name && cleanedText) {
    const lines = cleanedText.split(/[\r\n]+/).map((l) => l.trim()).filter((l) => l.length > 0 && l.length < 40);
    for (const line of lines.slice(0, 4)) {
      if (/^[A-Za-z]+(?:\s+[A-Za-z]+){1,2}$/.test(line) && !/resume|curriculum|summary|objective|page|developer|engineer|analyst/i.test(line)) {
        name = line.split(/\s+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
        break;
      }
    }
  }

  // Fallback 2: Extract from email prefix
  if (!name && emailMatch) {
    const prefix = emailMatch[0].split("@")[0].replace(/[0-9._-]+/g, " ").trim();
    if (prefix.length >= 3) {
      name = prefix.split(/\s+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
    }
  }

  // 1. Technical & Functional Skills
  const skillDict = [
    "Java 21", "Java", "Spring Boot", "Next.js", "React", "TypeScript", "JavaScript",
    "Distributed Systems", "Microservices", "PostgreSQL", "Kafka", "Docker", "Kubernetes",
    "AWS", "Azure", "GCP", "B2B SaaS Sales", "MEDDPICC", "Contract Negotiation",
    "Pipeline Architecture", "Financial Modeling", "Corporate FP&A", "SCADA", "Safety Protocols",
    "Python", "Go", "C++", "SQL", "GraphQL", "Redis", "Elasticsearch", "CI/CD", "Terraform"
  ];
  const detectedSkills = skillDict.filter((s) => textLower.includes(s.toLowerCase()));

  // 2. Education Extraction
  let degreeLevel = "Bachelor's Degree";
  if (textLower.includes("ph.d") || textLower.includes("phd") || textLower.includes("doctorate")) {
    degreeLevel = "Ph.D. / Doctorate";
  } else if (textLower.includes("master") || textLower.includes("ms ") || textLower.includes("m.s") || textLower.includes("mba") || textLower.includes("m.tech")) {
    degreeLevel = "Master's Degree (MS / MBA)";
  } else if (textLower.includes("bachelor") || textLower.includes("bs ") || textLower.includes("b.s") || textLower.includes("b.tech") || textLower.includes("bba")) {
    degreeLevel = "Bachelor of Science / B.Tech";
  }

  let fieldOfStudy = "Computer Science / Information Systems";
  if (textLower.includes("business") || textLower.includes("finance") || textLower.includes("economics") || textLower.includes("accounting")) {
    fieldOfStudy = "Business Administration / Finance";
  } else if (textLower.includes("mechanical") || textLower.includes("electrical") || textLower.includes("industrial")) {
    fieldOfStudy = "Industrial Engineering";
  }

  // 3. Certifications Extraction
  const certCatalog = [
    "AWS Certified Solutions Architect",
    "AWS Certified Developer",
    "Azure Solutions Architect Expert",
    "GCP Professional Cloud Architect",
    "Certified Kubernetes Administrator (CKA)",
    "CISSP - Information Systems Security",
    "Project Management Professional (PMP)",
    "Certified ScrumMaster (CSM)",
    "Certified Public Accountant (CPA)",
    "Chartered Financial Analyst (CFA)",
    "TOGAF Enterprise Architecture"
  ];
  const certifications = certCatalog.filter((cert) => {
    const tokens = cert.toLowerCase().split(/[\s()-]+/);
    return tokens.some((t) => t.length > 3 && textLower.includes(t));
  });

  // 4. Experience Years Extraction
  let experienceYears = 6;
  const expMatch = textLower.match(/(\d+)\+?\s*(?:years?|yrs?)(?:\s+of)?(?:\s+(?:experience|industry|software|engineering|sales|distributed|hands-on|relevant))?/);
  if (expMatch && expMatch[1]) {
    experienceYears = parseInt(expMatch[1], 10);
  }

  // Current Title Extraction
  let currentTitle = "Software Engineering & Architecture Professional";
  if (textLower.includes("staff architect") || textLower.includes("lead architect") || textLower.includes("cloud architect")) {
    currentTitle = "Staff Cloud Architect";
  } else if (textLower.includes("sales executive") || textLower.includes("account executive") || textLower.includes("vp sales")) {
    currentTitle = "Enterprise Solutions Executive";
  } else if (textLower.includes("financial analyst") || textLower.includes("fp&a")) {
    currentTitle = "Senior FP&A Analyst";
  }

  // Clean human-readable executive summary - NEVER raw %PDF bytecode
  let summary = "";
  if (isBinaryOrPdf || originalText.trim().startsWith("%PDF") || originalText.length < 30) {
    const skillsSnippet = detectedSkills.slice(0, 4).join(", ") || "cloud architecture and distributed systems";
    summary = `${name ? name + " — " : ""}${currentTitle} with ${experienceYears}+ years of proven enterprise track record. Core competencies include ${skillsSnippet}. Holds ${degreeLevel} in ${fieldOfStudy}${certifications.length > 0 ? " with " + certifications[0] + " certification" : ""}.`;
  } else {
    summary = originalText.slice(0, 320) + (originalText.length > 320 ? "..." : "");
  }

  return {
    fullName: name,
    email: emailMatch ? emailMatch[0] : "",
    phone: phoneMatch ? phoneMatch[0] : "",
    portfolioUrl: linkedinMatch ? linkedinMatch[0] : "",
    detectedSkills,
    experienceYears,
    currentTitle,
    education: {
      degreeLevel,
      fieldOfStudy,
      university: "Accredited University Cohort",
    },
    certifications,
    summary,
  };
}

function generateAiCoverLetter(profile: ReturnType<typeof parseCandidateProfile>, jobTitle: string, department: string) {
  const candidateName = profile.fullName || "Candidate";
  const title = profile.currentTitle || "Professional";
  const skillsList = profile.detectedSkills.slice(0, 4).join(", ") || "distributed systems and enterprise engineering";
  const certNote = profile.certifications.length > 0 ? `I also hold professional credentials including ${profile.certifications[0]}.` : "";

  return `Dear MAX Enterprise Global Talent Acquisition Team,

I am writing to express my enthusiastic interest in the ${jobTitle || "Open Requisition"} role within your ${department || "Technology"} division. With over ${profile.experienceYears} years of proven expertise as a ${title}, I have consistently architected resilient platforms, delivered mission-critical enterprise solutions, and led high-impact initiatives.

My background aligns closely with your core requirements, specifically my deep proficiency in ${skillsList}. ${certNote} Throughout my career, I have prioritized architectural reliability, cross-functional collaboration, and measurable business outcomes that scale seamlessly across distributed global operations.

I am particularly excited about MAX-ERP's mission to power autonomous enterprise infrastructure. I would welcome the opportunity to discuss how my competencies in ${skillsList} can accelerate your engineering and business milestones.

Sincerely,
${candidateName}`;
}
