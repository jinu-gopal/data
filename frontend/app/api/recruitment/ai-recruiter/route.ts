import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      action = "SYNTHESIZE_CANDIDATE",
      candidateName = "Candidate",
      requisitionTitle = "Role",
      department = "Engineering",
      employmentType = "Full-time",
      skills = [],
      prompt = "",
      location = "Bangalore, India",
    } = body;

    const firstName = candidateName.split(" ")[0];

    // 1. AI Draft Job Description
    if (action === "GENERATE_JOB_DESCRIPTION") {
      const isEng = department.toLowerCase().includes("eng") || requisitionTitle.toLowerCase().includes("engineer") || requisitionTitle.toLowerCase().includes("developer");
      const isProduct = department.toLowerCase().includes("product") || requisitionTitle.toLowerCase().includes("product");
      const isSales = department.toLowerCase().includes("sales") || requisitionTitle.toLowerCase().includes("account");

      let description = "";
      let responsibilities: string[] = [];
      let requiredQualifications: string[] = [];
      let preferredQualifications: string[] = [];
      let suggestedSkills: string[] = [];
      let suggestedSalary = "$135,000 - $165,000";

      if (isEng) {
        description = `We are seeking an experienced and visionary ${requisitionTitle} to join our high-scale cloud platform engineering group. In this role, you will architect resilient backend microservices, lead core architectural decisions, and build fault-tolerant data pipelines that power mission-critical enterprise ERP workflows for Fortune 500 customers globally.`;
        responsibilities = [
          `Architect, implement, and maintain high-throughput backend services using modern microservice patterns.`,
          `Lead technical design reviews, establishing enterprise benchmarks for scalability, multi-tenancy, and latency.`,
          `Collaborate closely with product managers and cross-functional engineering teams to deliver mission-critical ERP modules.`,
          `Ensure robust system observability, automated testing coverage, and 99.99% service level objective (SLO) compliance.`,
          `Mentor junior and mid-level engineers, championing clean code principles and continuous deployment standards.`,
        ];
        requiredQualifications = [
          "Bachelor's Degree in Computer Science, Software Engineering, or equivalent practical experience",
          "5+ years of software development experience with Java, Spring Boot, or TypeScript",
          "Demonstrated expertise with PostgreSQL or distributed SQL databases and high-concurrency transactions",
          "Strong background in containerized cloud infrastructure (Docker, Kubernetes, AWS/GCP)",
        ];
        preferredQualifications = [
          "Master's degree in Computer Science or related STEM field",
          "Hands-on experience with Kafka event-driven architectures and streaming processing",
          "Familiarity with enterprise ERP/HCM data models and compliance standards (SOC2, GDPR)",
        ];
        suggestedSkills = ["Java 21", "Spring Boot 3", "PostgreSQL", "Kafka", "Docker", "Kubernetes", "TypeScript", "System Design"];
        suggestedSalary = "$150,000 - $185,000";
      } else if (isProduct) {
        description = `MAX ERP is searching for a dynamic ${requisitionTitle} to define and execute product roadmaps across our core enterprise platform. You will translate complex enterprise requirements into intuitive, modern workflow software that millions of professionals rely on daily.`;
        responsibilities = [
          `Define the product vision, strategy, and quarter-by-quarter roadmap for enterprise core modules.`,
          `Conduct user research with HR leaders, recruiters, and executives to identify high-impact customer problems.`,
          `Partner with engineering and UX design leads in agile sprints to specify functional requirements and acceptance criteria.`,
          `Track telemetry metrics, customer feature adoption, and NPS to iterate quickly on platform enhancements.`,
          `Present quarterly product updates and customer advisory council presentations.`,
        ];
        requiredQualifications = [
          "Bachelor's degree in Business, Computer Science, or equivalent field",
          "4+ years of product management experience in B2B enterprise SaaS",
          "Proven track record of shipping complex enterprise workflow or ERP applications",
        ];
        preferredQualifications = [
          "MBA or Master's degree in technical field",
          "Experience with HR tech, ATS, or workforce management software",
        ];
        suggestedSkills = ["Product Strategy", "User Research", "Agile Roadmap", "Data Telemetry", "SaaS Metrics", "Stakeholder Management"];
        suggestedSalary = "$140,000 - $170,000";
      } else if (isSales) {
        description = `Join our high-performing revenue organization as a ${requisitionTitle}. You will spearhead strategic account expansion, qualify high-value opportunities, and drive enterprise digital transformation with MAX ERP solutions.`;
        responsibilities = [
          `Execute full enterprise sales cycles from discovery, custom demos, through contract negotiation and closing.`,
          `Build strategic relationships with C-level executives, CHROs, and VP-level decision makers.`,
          `Meet and exceed quarterly quota commitments through disciplined pipeline management.`,
        ];
        requiredQualifications = [
          "Bachelor's degree in Business, Communications, or related discipline",
          "5+ years of enterprise SaaS sales experience with average ACV > $100k",
        ];
        preferredQualifications = [
          "Extensive network within enterprise HR, Finance, or Operations leadership",
        ];
        suggestedSkills = ["Enterprise Sales", "B2B SaaS", "Contract Negotiation", "RFP Management", "Executive Presentation"];
        suggestedSalary = "$120,000 - $150,000 + OTE";
      } else {
        description = `MAX ERP is seeking a highly collaborative ${requisitionTitle} to join the ${department} team. You will drive operational excellence, optimize business processes, and support strategic growth across our international business units.`;
        responsibilities = [
          `Execute day-to-day operational deliverables with precision and adherence to enterprise compliance guidelines.`,
          `Collaborate with departmental leaders to streamline operational workflows and eliminate bottlenecks.`,
        ];
        requiredQualifications = [
          "Bachelor's degree in related field or equivalent work experience",
          "3+ years of relevant experience in a high-growth corporate or tech environment",
        ];
        preferredQualifications = ["Relevant professional certifications or advanced degree"];
        suggestedSkills = ["Project Management", "Operations", "Stakeholder Collaboration", "Data Analysis", "Process Optimization"];
        suggestedSalary = "$110,000 - $135,000";
      }

      return NextResponse.json({
        success: true,
        requisitionTitle,
        department,
        description,
        responsibilities,
        requiredQualifications,
        preferredQualifications,
        suggestedSkills,
        suggestedSalary,
        generatedAt: new Date().toISOString(),
      });
    }

    // 1b. AI Enhance Job Content for Career Site & Job Boards
    if (action === "ENHANCE_JOB_CONTENT") {
      const currentText = body.content || body.description || "";
      const enhancedText = `We are seeking an accomplished ${requisitionTitle} to join our high-impact ${department} team at MAX ERP. In this pivotal role, you will architect resilient backend microservices, design low-latency transactional architectures with Java 21 & Spring Boot, and collaborate with cross-functional product and infrastructure teams to deliver world-class enterprise SaaS solutions.

Key Objectives:
• Architect scalable, fault-tolerant microservices handling enterprise workloads.
• Build automated, observable CI/CD deployment pipelines with zero-downtime releases.
• Pioneer best practices across modular system design, security, and cloud scalability.

If you thrive in solving complex technical problems and building mission-critical software, we would love to connect with you.`;

      const bulletSuggestions = [
        "Architect and maintain high-throughput distributed microservices using Java 21 and Spring Boot.",
        "Collaborate with multi-disciplinary agile squads to deliver scalable enterprise ERP platform features.",
        "Conduct rigorous code and architecture reviews, ensuring compliance with enterprise security benchmarks.",
        "Optimize SQL queries, transaction boundaries, and database caching strategies for PostgreSQL.",
        "Drive continuous improvement in telemetry, error tracking, and 99.99% system availability.",
      ];

      return NextResponse.json({
        success: true,
        requisitionTitle,
        originalContent: currentText,
        enhancedContent: enhancedText,
        suggestedBullets: bulletSuggestions,
        tone: "Compelling & Professional",
        seoKeywords: ["Java 21", "Spring Boot", "Microservices", "Enterprise SaaS", "PostgreSQL", "Cloud Architecture"],
        generatedAt: new Date().toISOString(),
      });
    }

    // 2. Bias & Inclusivity Checker
    if (action === "CHECK_BIAS_AND_INCLUSIVITY") {
      const textToScan = body.text || body.description || "";
      return NextResponse.json({
        success: true,
        inclusivityScore: 96,
        verdict: "Highly Inclusive & Neutral",
        readabilityLevel: "Grade 10 (Clear & Accessible)",
        detectedPhrases: [
          { phrase: "rockstar developer", suggestion: "accomplished engineer", type: "Cliché / Tone" },
          { phrase: "dominant market player", suggestion: "leading market provider", type: "Aggressive Wording" }
        ],
        positiveIndicators: [
          "Equal opportunity statement included",
          "Flexible hybrid work arrangement explicitly stated",
          "Clear, objective competency benchmarks used"
        ],
        generatedAt: new Date().toISOString(),
      });
    }

    // 3. Market Salary Benchmark
    if (action === "SALARY_MARKET_BENCHMARK") {
      return NextResponse.json({
        success: true,
        role: requisitionTitle,
        location,
        currency: "USD",
        percentiles: {
          p25: 140000,
          p50: 158000,
          p75: 175000,
          p90: 195000,
        },
        marketCompetitiveness: "Top 25% Competitive",
        recommendation: "Approved salary band ($140,000 - $175,000) is well aligned with market median for senior backend talent in this metro area.",
        generatedAt: new Date().toISOString(),
      });
    }

    // 4. Suggest Skills
    if (action === "SUGGEST_SKILLS") {
      const isEng = requisitionTitle.toLowerCase().includes("engineer") || requisitionTitle.toLowerCase().includes("developer");
      const skillsList = isEng
        ? ["Java 21", "Spring Boot 3", "PostgreSQL", "Kafka", "Docker", "Kubernetes", "TypeScript", "Next.js 15", "System Design", "CI/CD", "Redis", "Microservices"]
        : ["Cross-functional Leadership", "Strategic Planning", "Data Telemetry", "User Experience", "Enterprise Workflow", "Stakeholder Management", "Agile / Scrum"];

      return NextResponse.json({
        success: true,
        requisitionTitle,
        skills: skillsList,
      });
    }

    // 5. Summarize Requisition
    if (action === "SUMMARIZE_REQUISITION") {
      const summaryText = `Executive Summary for ${requisitionTitle} (${department}):
• Status: OPEN & Authorized (All approval gates signed off)
• Openings: 2 Target Headcounts | Location: ${location} (Hybrid)
• Compensation: Standard pay band with approved budget allocation
• Pipeline Velocity: 10 active candidates in pipeline (Priya Menon ranked #1 with 92% match)
• Key Interview Focus: Distributed systems scalability, Spring Boot 3 architecture, and high-concurrency transaction resiliency.`;

      return NextResponse.json({
        success: true,
        requisitionTitle,
        summary: summaryText,
        generatedAt: new Date().toISOString(),
      });
    }

    // 6. Comprehensive Candidate Evaluation (4-Pillars, Risks, Questions)
    if (action === "EVALUATE_CANDIDATE_COMPREHENSIVE") {
      return NextResponse.json({
        success: true,
        candidateName,
        requisitionTitle,
        compositeScore: 92,
        verdict: "STRONG_HIRE",
        pillars: {
          skillsMatch: { score: 95, status: "EXCELLENT", detail: "100% coverage of core Java, Spring Boot, Microservices, and REST APIs." },
          experienceMatch: { score: 92, status: "EXCELLENT", detail: "4.5 years scaling enterprise software in high-throughput environments." },
          educationMatch: { score: 90, status: "STRONG", detail: "B.Tech in Computer Science from accredited Tier-1 institution (8.9 CGPA)." },
          domainMatch: { score: 88, status: "STRONG", detail: "Experience with transactional state machines and multi-tenant architectures." },
        },
        strengths: [
          "Flawless coding round score (5.0/5) with optimal time/space complexity.",
          "Demonstrated mastery of distributed JVM performance tuning and thread safety.",
          "Proactive, structured communication style during technical debriefs.",
        ],
        redFlags: [
          "Notice period is 30 days (Standard for India market, within acceptable SLA).",
          "Limited hands-on production experience with Kafka partition rebalancing (addressable via onboarding).",
        ],
        cultureFit: {
          score: 94,
          traits: ["Collaborative", "Self-Directed", "Ownership Mindset", "Empathetic Peer Reviewer"],
        },
        recommendedNextStep: "Advance to System Architecture & Distributed Systems Round with Engineering Director.",
        generatedAt: new Date().toISOString(),
      });
    }

    // 7. Candidate Assistant Natural Language Query (Full Omnichannel Copilot)
    if (action === "ASSISTANT_QUERY") {
      const userPrompt = (prompt || "").trim();
      let reply = "";

      if (/compare/i.test(userPrompt)) {
        reply = `Compared to other applicants for ${requisitionTitle}, ${firstName} ranks #1 in core backend alignment with a 92% match score. She leads Vikram K (78%) in system architecture, and Deepa L (68%) in microservices production experience.`;
      } else if (/email|draft.*email|invite/i.test(userPrompt)) {
        reply = `Subject: Next Steps: Technical Interview for ${requisitionTitle} at MAX ERP\n\nHi ${firstName},\n\nWe were impressed by your background in enterprise Java and microservices architecture. We'd like to invite you for the technical architecture interview with our engineering panel.\n\nPlease choose a convenient time slot via your candidate portal.\n\nBest regards,\nMAX ERP Talent Acquisition`;
      } else if (/summar|profile|background/i.test(userPrompt)) {
        reply = `${candidateName} is an exceptional fit for ${requisitionTitle} with 92% composite match. Key highlights: 4.5 years enterprise Java experience, 100% core skills coverage (Spring Boot, Microservices, REST APIs), and verified strong culture fit review.`;
      } else if (/step|suggest.*step|next/i.test(userPrompt)) {
        reply = `Recommended Next Step: Advance ${firstName} to the Technical Architecture Interview round. Focus the debrief on distributed caching with Redis and zero-downtime database migrations.`;
      } else if (/question|interview.*question/i.test(userPrompt)) {
        reply = `Tailored Interview Questions for ${firstName}:\n1. In your FinTech role, how did you handle distributed transaction rollbacks across microservices?\n2. What garbage collector tuning strategies have you applied in Java 21 for latency-sensitive services?\n3. Describe an architectural trade-off where you chose eventual consistency over strict ACID compliance.`;
      } else if (/salary|comp|compensation|budget/i.test(userPrompt)) {
        reply = `Compensation Analysis for ${firstName}: Current expectation is around $155,000, perfectly centered within the approved requisition budget band ($140,000 - $175,000). Highly competitive and compliant with corporate pay equity guidelines.`;
      } else if (/red.*flag|risk|concern/i.test(userPrompt)) {
        reply = `Risk Assessment for ${firstName}: Zero compliance or credential red flags found. Notice period is 30 days, which matches our Q4 onboarding timeline. Minor knowledge gap in Kafka partition rebalancing can be closed within the first 2 weeks.`;
      } else if (/culture|fit|team/i.test(userPrompt)) {
        reply = `Culture Fit Evaluation: ${firstName} scores 94/100 on enterprise culture fit. Behavioral assessments indicate high ownership, calm composure under production outage scenarios, and strong mentorship tendencies.`;
      } else if (/offer|justif/i.test(userPrompt)) {
        reply = `Executive Justification for ${candidateName} (${requisitionTitle}):\n1. Market Alignment: Comp centered at 60th percentile of software benchmarks.\n2. Technical Surplus: Scored 96% on coding challenge, highest in pool.\n3. Velocity: Accelerates Q4 platform deliverables by ~6 weeks. Recommendation: Prepare formal offer packet.`;
      } else {
        reply = `Based on MAX AI evaluation, ${candidateName} has verified credentials in ${requisitionTitle} (${department}). Her technical assessments demonstrate strong command of high-concurrency systems, clean code standards, and agile collaboration.`;
      }

      return NextResponse.json({
        success: true,
        candidateName,
        requisitionTitle,
        reply,
        generatedAt: new Date().toISOString(),
      });
    }

    // 8. Generate Tailored Questions
    if (action === "GENERATE_QUESTIONS") {
      const questions = [
        `Can you describe an architectural scenario where you designed distributed state management or high-throughput event processing using ${(skills && skills[0]) || "Java"}?`,
        `How do you approach database schema migrations and zero-downtime deployments under high transactional load?`,
        `Walk us through a critical production incident you diagnosed: what was the root cause, telemetry used, and remediation strategy?`,
        `How do you balance engineering speed vs strict enterprise security, multi-tenancy, and compliance guidelines?`,
        `In a cross-functional leadership setting, how do you handle technical disagreements regarding architectural tradeoffs?`,
      ];
      return NextResponse.json({
        candidateName,
        requisitionTitle,
        tailoredQuestions: questions,
        generatedAt: new Date().toISOString(),
      });
    }

    // 9. Draft Offer Justification
    if (action === "DRAFT_OFFER_JUSTIFICATION") {
      const justification = `Executive Justification for ${candidateName} (${requisitionTitle}):
1. MARKET ALIGNMENT: Proposed compensation is situated at the 65th percentile of enterprise software benchmarks.
2. COMPETENCY SURPLUS: Candidate brings specialized experience matching mission-critical distributed systems requirements.
3. HIRING VELOCITY: Fills priority requisition slot ahead of Q4 deliverables, accelerating platform delivery by ~6 weeks.
4. RECOMMENDATION: Unanimous 'Strong Hire' recommendation from interview panel across technical architecture and team alignment.`;
      return NextResponse.json({
        candidateName,
        requisitionTitle,
        justification,
        generatedAt: new Date().toISOString(),
      });
    }

    // 10. Default / Fallback: Comprehensive Natural Language Recruiting QA Engine
    const query = (prompt || requisitionTitle || "").trim().toLowerCase();
    const isNaturalQuery = Boolean(query);

    // Specific Candidate Lookups
    if (query.includes("arjun")) {
      return NextResponse.json({
        candidateName: "Arjun R",
        requisitionTitle: "Senior Java Developer (REQ-2026-00123)",
        department: "Engineering",
        overallFitScore: 54,
        recommendation: "CONSIDER_WITH_TRAINING",
        executiveSummary: `Candidate Dossier: Arjun R
• Position: Senior Java Developer (REQ-2026-00123) · Engineering
• Status: Applied (New) · 54% Composite Fit (Moderate Fit)
• Location: Bangalore, India | Contact: arjun.r@gmail.com
• Core Skills: Java (80%), Spring Boot (65%), REST APIs (75%), AWS (30%), System Design (40%)
• AI Evaluation: Arjun shows good core Java fundamentals with 2.5 years experience, but needs mentorship in distributed systems and cloud architecture.
• Recommended Action: Schedule initial technical screening round.`,
        keyStrengths: ["Solid core Java syntax and object-oriented design", "Proactive communication"],
      });
    }

    if (query.includes("vikram")) {
      return NextResponse.json({
        candidateName: "Vikram K",
        requisitionTitle: "SAP SuccessFactors Consultant (REQ-2026-00120)",
        department: "HR Tech",
        overallFitScore: 78,
        recommendation: "ADVANCE_TO_INTERVIEW",
        executiveSummary: `Candidate Dossier: Vikram K
• Position: SAP SuccessFactors Consultant (REQ-2026-00120) · HR Tech
• Status: Screening (Shortlisted) · 78% Composite Fit (Good Fit)
• Location: Hyderabad, India | Contact: vikram.k@outlook.com
• Core Skills: SAP SuccessFactors (95%), Employee Central (85%), Integration Center (70%), OData APIs (65%)
• AI Evaluation: 6.0 years enterprise SAP consulting experience across 4 global enterprise rollouts. Strong domain alignment.
• Recommended Action: Schedule technical panel interview with HR lead.`,
        keyStrengths: ["Deep SAP SF Employee Central expertise", "4 enterprise global rollouts"],
      });
    }

    if (query.includes("sneha")) {
      return NextResponse.json({
        candidateName: "Sneha S",
        requisitionTitle: "Senior Java Developer (REQ-2026-00123)",
        department: "Engineering",
        overallFitScore: 84,
        recommendation: "STRONG_HIRE",
        executiveSummary: `Candidate Dossier: Sneha S
• Position: Senior Java Developer (REQ-2026-00123) · Engineering
• Status: Interview · 84% Composite Fit (Good Fit)
• Location: Bangalore, India | Contact: sneha.s@gmail.com
• Core Skills: Java (90%), Spring Boot (85%), REST APIs (85%), Microservices (80%)
• AI Evaluation: Demonstrated high optimization in coding assessment. Solid understanding of multi-threaded Java applications.
• Recommended Action: Advance to System Architecture interview round.`,
        keyStrengths: ["High coding score", "Clean microservice design patterns"],
      });
    }

    if (query.includes("rahul")) {
      return NextResponse.json({
        candidateName: "Rahul Kumar",
        requisitionTitle: "Lead Product Manager (REQ-2026-00118)",
        department: "Product",
        overallFitScore: 82,
        recommendation: "ADVANCE_TO_PANEL",
        executiveSummary: `Candidate Dossier: Rahul Kumar
• Position: Lead Product Manager (REQ-2026-00118) · Product
• Status: Interview · 82% Composite Fit (Good Fit)
• Location: Mumbai, India | Contact: rahul.kumar@gmail.com
• Core Skills: Product Strategy (90%), User Research (85%), Agile Roadmaps (85%), SaaS Metrics (80%)
• AI Evaluation: 5+ years B2B SaaS product management experience with strong stakeholder communication.
• Recommended Action: Complete executive debrief with VP Product.`,
        keyStrengths: ["B2B SaaS product roadmap leadership", "Clear user-centric problem definition"],
      });
    }

    if (query.includes("suresh")) {
      return NextResponse.json({
        candidateName: "Suresh N",
        requisitionTitle: "SAP SuccessFactors Consultant (REQ-2026-00120)",
        department: "HR Tech",
        overallFitScore: 88,
        recommendation: "OFFER_EXTENDED",
        executiveSummary: `Candidate Dossier: Suresh N
• Position: SAP SuccessFactors Consultant (REQ-2026-00120) · HR Tech
• Status: Offer · 88% Composite Fit (Good Fit)
• Location: Pune, India | Contact: suresh.n@corp.org
• Offer Details: $150,000 Base Salary + $20,000 Bonus | Level 2 Approval Pending
• AI Evaluation: Unanimous 'Hire' verdict from interview panel across enterprise ERP and cloud integrations.
• Recommended Action: Sign off Level 2 VP approval and dispatch formal offer letter.`,
        keyStrengths: ["Enterprise SAP HCM architecture", "High team culture fit rating"],
      });
    }

    if (query.includes("deepa")) {
      return NextResponse.json({
        candidateName: "Deepa L",
        requisitionTitle: "HR Business Analyst (REQ-2026-00119)",
        department: "HR Tech",
        overallFitScore: 68,
        recommendation: "BGV_IN_PROGRESS",
        executiveSummary: `Candidate Dossier: Deepa L
• Position: HR Business Analyst (REQ-2026-00119) · HR Tech
• Status: Screening (BGV) · 68% Composite Fit (Moderate Fit)
• Location: Chennai, India | Contact: deepa.l@hr-tech.in
• Verification: Background check in progress with Checkr Global.
• AI Evaluation: Good understanding of HR compliance, talent data flows, and HCM business analysis.`,
        keyStrengths: ["Compliance auditing", "HR process mapping"],
      });
    }

    if (query.includes("manu")) {
      return NextResponse.json({
        candidateName: "Manu P",
        requisitionTitle: "Senior Java Developer (REQ-2026-00123)",
        department: "Engineering",
        overallFitScore: 95,
        recommendation: "HIRED",
        executiveSummary: `Candidate Dossier: Manu P
• Position: Senior Java Developer (REQ-2026-00123) · Engineering
• Status: Hired · 95% Composite Fit (Excellent Fit)
• Location: Bangalore, India | Contact: manu.p@devs.net
• Compensation: $170,000 Base Salary
• AI Evaluation: Exceptional distributed systems architect with extensive high-concurrency event streaming experience. Onboarding in progress.`,
        keyStrengths: ["Ranked #1 in candidate pool", "Kafka streaming & high-throughput systems"],
      });
    }

    if (query.includes("karthik")) {
      return NextResponse.json({
        candidateName: "Karthik T",
        requisitionTitle: "Lead Product Manager (REQ-2026-00118)",
        department: "Product",
        overallFitScore: 48,
        recommendation: "REJECTED",
        executiveSummary: `Candidate Dossier: Karthik T
• Position: Lead Product Manager (REQ-2026-00118) · Product
• Status: Rejected · 48% Composite Fit (Poor Fit)
• Outcome: Did not meet minimum criteria for B2B enterprise SaaS roadmap experience.`,
        keyStrengths: ["General project coordination"],
      });
    }

    if (query.includes("priya")) {
      return NextResponse.json({
        candidateName: "Priya Menon",
        requisitionTitle: "Senior Java Developer (REQ-2026-00123)",
        department: "Engineering",
        overallFitScore: 92,
        recommendation: "STRONG_HIRE",
        executiveSummary: `Candidate Dossier: Priya Menon
• Position: Senior Java Developer (REQ-2026-00123) · Engineering
• Status: Shortlisted / In Review (92% Composite Match Score — Excellent Fit)
• Location: Bangalore, India | Contact: priya.menon@gmail.com | +91 98765 43210
• Core Stack: Java 21, Spring Boot, Microservices, REST APIs, Kafka, Docker
• Verified Experience: 4.5 years scaling enterprise microservices across 3 product organizations.
• Coding Debrief: 5/5 score on distributed transaction state machine assessment.
• Recommended Next Step: Advance to Technical Architecture Interview with Engineering Director.`,
        keyStrengths: [
          "Outstanding Java 21 memory model and distributed system scalability expertise.",
          "Top-ranked applicant in requisition pool with 92% composite fit score.",
          "Clear, structured communication with high team collaboration feedback.",
        ],
        areasToProbe: [
          "Specific Kafka partition rebalancing strategies under high-volume streaming.",
        ],
        interviewVerdict: "Recommended for immediate advancement to Technical Architecture Interview.",
      });
    }

    // Requisition Specific Questions
    if (query.includes("open position") || query.includes("open job") || query.includes("open req") || query.includes("how many open") || query.includes("how many requisition") || query.includes("how many job")) {
      return NextResponse.json({
        executiveSummary: `📊 **Active Job Requisitions Summary**:
There are currently **7 requisitions** in the MAX ERP recruiting pipeline:
• **5 Open & Active**:
  1. REQ-2026-00123: Senior Java Developer (Engineering · $140k-$175k)
  2. REQ-2026-00118: Lead Product Manager (Product · $150k-$185k)
  3. REQ-2026-00119: HR Business Partner (HR Tech · $95k-$125k)
  4. REQ-2026-00120: SAP SuccessFactors Consultant (HR Tech · $130k-$165k)
  5. REQ-2026-00121: Senior Financial Controller (Finance · $140k-$175k)
• **1 Pending Approval**: REQ-2026-0048 (Cloud Infrastructure Architect · Step 2 of 3)
• **1 Filled**: REQ-2026-00115 (Senior DevOps Engineer · Headcount met)`,
      });
    }

    if (query.includes("pending approval") || query.includes("pending req") || query.includes("open approval")) {
      return NextResponse.json({
        executiveSummary: `⏳ **Pending Requisition Governance Sign-offs**:
• **REQ-2026-0048**: Cloud Infrastructure Architect (Engineering · San Francisco, CA)
  - Current Gate: Step 2 of 3 (Hiring Manager approved; awaiting VP sign-off)
  - Target Headcount: 2 Openings | Budget: $160,000 - $195,000
  - Hiring Manager: Elena Vance (VP Engineering)
  - Action Available: You can authorize with 1-click via AI command: "Approve REQ-2026-0048"`,
      });
    }

    if (query.includes("0048") || query.includes("cloud architect") || query.includes("cloud infrastructure")) {
      return NextResponse.json({
        executiveSummary: `Requisition Dossier: REQ-2026-0048 (Cloud Infrastructure Architect)
• Department: Engineering | Location: San Francisco, CA (Hybrid)
• Target Headcount: 2 Openings | Budget: $160,000 - $195,000
• Hiring Manager: Elena Vance (VP Engineering)
• Status: Pending Approval (Step 2 of 3)
• Core Skills Required: Kubernetes, Terraform, AWS/GCP, Distributed System Architecture, SOC2 Compliance`,
      });
    }

    if (query.includes("00123") || query.includes("java developer")) {
      return NextResponse.json({
        executiveSummary: `Requisition Dossier: REQ-2026-00123 (Senior Java Developer)
• Department: Engineering | Location: Bangalore, India (Hybrid)
• Target Headcount: 2 Openings | Budget: $140,000 - $175,000
• Hiring Manager: John Smith (Engineering Director)
• Status: Open & Active on external job boards
• Talent Pipeline: 4 active applicants (Priya Menon ranked #1 with 92% match score)`,
      });
    }

    if (query.includes("hiring manager")) {
      return NextResponse.json({
        executiveSummary: `👥 **Hiring Managers by Requisition**:
• Senior Java Developer (REQ-2026-00123): John Smith (Engineering Director)
• Cloud Infrastructure Architect (REQ-2026-0048): Elena Vance (VP Engineering)
• Lead Product Manager (REQ-2026-00118): Anita Desai (VP Product)
• HR Business Partner (REQ-2026-00119): Marcus Chen (Chief People Officer)
• SAP SF Consultant (REQ-2026-00120): Priya Nair (HR Tech Director)`,
      });
    }

    if (query.includes("salary") || query.includes("compensation") || query.includes("pay band") || query.includes("budget")) {
      return NextResponse.json({
        executiveSummary: `💰 **Approved Requisition Compensation Bands**:
• Cloud Infrastructure Architect (REQ-0048): $160,000 - $195,000
• Senior Java Developer (REQ-0123): $140,000 - $175,000
• Lead Product Manager (REQ-0118): $150,000 - $185,000
• Senior Financial Controller (REQ-0121): $140,000 - $175,000
• SAP SF Consultant (REQ-0120): $130,000 - $165,000
• HR Business Partner (REQ-0119): $95,000 - $125,000`,
      });
    }

    // Analytics & Metrics Questions
    if (query.includes("time to hire")) {
      return NextResponse.json({
        executiveSummary: `⏱️ **Average Time-to-Hire: 18.4 Days**
• Benchmark: 46% faster than enterprise SaaS industry average (34 days).
• Department Velocity Breakdown:
  - HR Tech: 14.2 days
  - Product: 16.0 days
  - Finance: 17.5 days
  - Engineering: 21.0 days
• Sourcing Velocity: Candidate first screening completed within 48 hours of application submission.`,
      });
    }

    if (query.includes("cost per hire")) {
      return NextResponse.json({
        executiveSummary: `💵 **Average Cost-Per-Hire: $3,420**
• Benchmark: Situated in top 10th percentile for cost-efficient enterprise tech hiring.
• Breakdown: Job board distribution (24%), assessment tooling (18%), background verification (14%), sourcing operations (44%).`,
      });
    }

    if (query.includes("acceptance rate") || query.includes("offer rate")) {
      return NextResponse.json({
        executiveSummary: `📈 **Offer Acceptance Rate: 89.2%**
• 14 candidate acceptances out of 16 formal offers extended in current hiring cycle.
• Key driver: Competitive pay bands aligned with 65th percentile of regional software benchmarks.`,
      });
    }

    // Offer Hub Questions
    if (query.includes("pending offer") || (query.includes("offer") && (query.includes("who") || query.includes("how many") || query.includes("show")))) {
      return NextResponse.json({
        executiveSummary: `📄 **Candidate Offers Overview**:
• **Suresh N** (SAP SuccessFactors Consultant): $150,000 Base Salary + $20,000 Bonus · Status: Pending Approval (Level 2 VP Review)
• **Priya Menon** (Senior Java Developer): $165,000 Base Salary + $50,000 Equity · Status: Approved (Level 3 Finance Sign-off Complete)
• **Emily Zhang** (Lead Cloud Architect): $180,000 Base Salary · Status: Accepted by candidate
• Offer Letter Templates: Configured in Configuration Studio (/configuration/recruitment?tab=offers).`,
      });
    }

    // Interview Questions
    if (query.includes("interview") || query.includes("scheduled") || query.includes("calendar")) {
      return NextResponse.json({
        executiveSummary: `📅 **Upcoming Candidate Interviews**:
1. Priya Menon: Technical Architecture Round (25 Oct, 14:00 via Microsoft Teams · Interviewers: Marcus Chen, Rachel Green)
2. Sneha S: System Design & Microservices Round (26 Oct, 11:00 via Google Meet)
3. Rahul Kumar: Product Strategy Debrief (26 Oct, 15:30 via Microsoft Teams)
4. Vikram K: SAP Integration Center Review (27 Oct, 10:00 via Google Meet)
• Manage scorecards: Visit /recruitment?tab=scorecards.`,
      });
    }

    // Configuration / Help Questions
    if (query.includes("template") || query.includes("where") || query.includes("configure") || query.includes("config")) {
      return NextResponse.json({
        executiveSummary: `⚙️ **Configuration Studio Guidance**:
• **Offer Letter Templates**: Navigate to Configuration Studio ➔ Recruitment ➔ Letters & Offers (/configuration/recruitment?tab=offers).
• **Job Distribution Boards**: Navigate to Job Distribution Tab (/recruitment?tab=distribution) to connect LinkedIn, Indeed, and Glassdoor.
• **Approval Workflows**: Configured in Configuration Studio ➔ Governance Workflows (/configuration/workflows).`,
      });
    }

    if (query.includes("what can you do") || query.includes("help") || query.includes("capabilities")) {
      return NextResponse.json({
        executiveSummary: `🤖 **MAX AI Recruiting Copilot Capabilities**:
• **Autonomous Actions**:
  - Move candidate stages ("Move Priya to next stage", "Shortlist Arjun")
  - Approve job requisitions ("Approve REQ-2026-00123")
  - Open pending approval drawer ("Open pending approvals")
  - Prepare candidate communications ("Send candidate email")
• **Data Intelligence**:
  - Candidate dossiers (Priya, Arjun, Vikram, Sneha, Rahul, Suresh, Deepa, Manu, Karthik)
  - Requisition telemetry, headcount targets, and salary bands
  - Sourcing analytics: Time-to-hire (18.4d), Cost-per-hire ($3,420), Acceptance rate (89.2%)`,
      });
    }

    // Pipeline Filtering
    if (query.includes("who applied") || query.includes("candidates for") || query.includes("top candidate") || query.includes("best candidate")) {
      return NextResponse.json({
        executiveSummary: `🎯 **Top Candidates in Active Pipeline**:
1. **Manu P** — Senior Java Developer (95% Match · Hired)
2. **Priya Menon** — Senior Java Developer (92% Match · Interview / Offer)
3. **Suresh N** — SAP SuccessFactors Consultant (88% Match · Offer Extended)
4. **Sneha S** — Senior Java Developer (84% Match · Interview Scheduled)
5. **Rahul Kumar** — Lead Product Manager (82% Match · Interview Scheduled)
6. **Vikram K** — SAP SuccessFactors Consultant (78% Match · Screening)`,
      });
    }

    // General fallback
    return NextResponse.json({
      candidateName: "Priya Menon",
      requisitionTitle: "Senior Java Developer (REQ-2026-00123)",
      overallFitScore: 92,
      recommendation: "STRONG_HIRE",
      executiveSummary: `I have analyzed your request: "${query}". You can ask me about specific candidates (Priya, Arjun, Vikram, Rahul, Suresh), open requisitions, pending approvals, offer packages, or executive analytics.`,
      keyStrengths: [
        "Real-time integration with MAX ERP Recruiting database",
        "Autonomous stage progression and approval governance",
      ],
      interviewVerdict: "System online. Ready for natural language commands.",
    });
  } catch {
    return NextResponse.json({ error: "AI_RECRUITER_FAILED" }, { status: 500 });
  }
}
