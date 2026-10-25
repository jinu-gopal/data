import { NextRequest, NextResponse } from "next/server";
import { buildBackendUrl } from "../../configuration/proxy-helper";

interface JobRequisition {
  id: string;
  reqNumber: string;
  title: string;
  department: string;
  jobLevel: string;
  employmentType: string;
  location: string;
  targetHeadcount: number;
  salaryRange: string;
  hiringManagerName: string;
  status: string;
  requiredSkills: string[];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const message = (body.message || body.question || body.query || "").toString();

    // Fetch active requisitions for real-time context
    const res = await fetch(buildBackendUrl("/api/v1/recruitment/public/requisitions"), {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    let jobs: JobRequisition[] = [];
    if (res.ok) {
      jobs = await res.json();
    }

    const q = message.toLowerCase().trim();
    let reply = "";
    let recommendedJobs: JobRequisition[] = [];

    // 1. Work Permit & Visa Sponsorship
    if (q.includes("visa") || q.includes("permit") || q.includes("sponsorship") || q.includes("h1b") || q.includes("h-1b") || q.includes("opt") || q.includes("green card") || q.includes("work authorization")) {
      reply = `### MAX Global Work Permit & Visa Sponsorship Policies

1. **United States**:
   - **F-1 STEM OPT**: We welcome candidates on active STEM OPT (up to 36 months).
   - **H-1B Transfers**: Direct cap-exempt and existing H-1B visa transfers are sponsored for Senior, Staff, and Lead engineering roles.
   - **Green Card Sponsorship**: PERM processing is initiated for qualifying permanent full-time employees after 1 year of tenure.

2. **Canada**:
   - Supported under the **Global Talent Stream (GTS)** with accelerated 2-week LMIA processing for software architects and senior engineers.

3. **European Union (EU)**:
   - Full sponsorship for the **EU Blue Card** across our Berlin, Dublin, and remote hubs.

4. **Remote Global Contractors**:
   - For jurisdictions without a direct entity, MAX contracts through international Employer of Record (EOR) partners (Deel / Remote.com) with statutory compliance and local currency payouts.

> **Prerequisite Note**: When applying, please check the Work Authorization field. If a role does not currently sponsor visas in your region, your profile is automatically routed to our **Global Talent Pool (Future Consideration)** for upcoming remote openings!`;
      recommendedJobs = jobs.slice(0, 2);

    // 2. Legal Eligibility & Background Verification (BGV)
    } else if (q.includes("legal") || q.includes("eligibility") || q.includes("background check") || q.includes("bgv") || q.includes("i-9") || q.includes("compliance") || q.includes("right to work")) {
      reply = `### Legal Eligibility & Employment Compliance Standards

- **Right to Work Verification**: All hired candidates must complete statutory right-to-work verification (e.g., Form I-9 in the US, Right to Work in the UK, SIN validation in Canada) within 3 business days of starting.
- **Background Verification (BGV)**:
  - Standard BGV is conducted via accredited Tier-1 screening partners (Sterling / Checkr).
  - Covers: Highest educational degree verification, prior 5-year employment verification, and jurisdictional criminal history review.
  - **Equal Opportunity**: MAX Enterprise is an OFCCP-compliant Equal Opportunity Employer (EOE). We do not discriminate based on race, gender, religion, national origin, veteran status, or disability.
- **Data Privacy**: All applicant data is strictly handled under GDPR (EU) and CCPA (California) standards and never shared outside talent acquisition.`;

    // 3. Remote Work Policy & Equipment
    } else if (q.includes("remote") || q.includes("location") || q.includes("work from home") || q.includes("wfh") || q.includes("hours")) {
      const remoteJobs = jobs.filter((j) => j.location.toUpperCase().includes("REMOTE"));
      recommendedJobs = remoteJobs.length > 0 ? remoteJobs : jobs;
      reply = `### MAX Remote-First Global Work Policy

- **100% Remote Flexibility**: Work from home, co-working spaces, or our global hubs. All open technology and enterprise sales positions are remote-eligible across approved jurisdictions.
- **Home Office Setup Stipend**: **$1,500 USD** one-time stipend on day 1 for ergonomic desk, chair, and external displays, plus **$100/month** high-speed internet reimbursement.
- **Hardware Provided**: Choice of Apple MacBook Pro (M3 Max / 64GB) or Dell XPS Developer Edition (Ubuntu/Windows) with enterprise peripherals.
- **Flexible Core Hours**: Teams collaborate across asynchronous workflows with 3-4 overlapping core collaboration hours per day.`;

    // 4. Referral Program & Internal Mobility Bonus
    } else if (q.includes("referral") || q.includes("bonus") || q.includes("internal job") || q.includes("refer") || q.includes("mobility")) {
      reply = `### Employee Referral & Internal Mobility Program

- **Referral Bonuses**:
  - **Engineering & Architecture (Staff+)**: **$5,000 USD** referral bonus.
  - **Senior Software Engineers & Solutions Leads**: **$4,000 USD** referral bonus.
  - **Product, Sales & Operations**: **$3,000 USD** referral bonus.
- **How It Works**:
  - When applying on our Careers site, candidates can check **"Referred by a MAX Employee"** and enter the employee's name or email.
  - The referring employee receives 50% upon hire and 50% after 90 days of tenure.
- **Internal Mobility**: Existing MAX employees can apply directly to open requisitions or explore internal secondments with hiring manager alignment.`;

    // 5. Compensation, Salary & Equity
    } else if (q.includes("salary") || q.includes("compensation") || q.includes("pay") || q.includes("equity") || q.includes("rsu") || q.includes("package")) {
      reply = `### Tier-1 Compensation Philosophy at MAX

- **Base Salary Bands**: Open roles range from **$118,000 to $185,000+ USD** base, benchmarked annually against Radford & Option Impact top 10% tech industry percentiles.
- **Equity Incentive**: Long-term equity grants (Incentive Stock Options or RSUs) vesting over 4 years with a 1-year cliff.
- **Annual Bonus**: 10% - 25% target performance bonus based on company and individual milestones.
- **Signing Bonuses**: Available for competitive market counter-offers and high-impact specialized roles.`;
      recommendedJobs = jobs;

    // 6. Benefits, Health & Leave
    } else if (q.includes("benefit") || q.includes("perk") || q.includes("health") || q.includes("insurance") || q.includes("pto") || q.includes("vacation") || q.includes("parental leave")) {
      reply = `### Comprehensive Global Benefits Package

- **Health Coverage**: 100% employer-covered health, dental, and vision insurance for employees, with 80% coverage for dependents.
- **Retirement / 401(k)**: 5% company match, immediately 100% vested.
- **Paid Time Off (PTO)**: 25 days paid vacation + 12 company holidays + unlimited sick time.
- **Parental Leave**: 16 weeks of 100% paid parental leave for primary and secondary caregivers.
- **Learning Stipend**: **$3,000 USD/year** for conferences, certifications (AWS, CKA, PMP), and professional courses.`;

    // 7. Candidate Account & Self-Scheduling
    } else if (q.includes("status") || q.includes("track") || q.includes("schedule") || q.includes("account") || q.includes("outlook") || q.includes("teams")) {
      reply = `### Candidate Portal & Auto-Scheduling System

- **Track Your Application**: Click **"Candidate Portal"** in the top navigation or enter your email / tracking ID to check live progress (` + "`APPLIED` → `SCREENING` → `INTERVIEW` → `OFFER`" + `).
- **Outlook Calendar Auto-Scheduling**: When invited for interviews, our platform reads interviewer availability in real-time. You can pick your preferred time slot and receive an instant Microsoft Teams invite!
- **Digital Offer Acceptance**: Extended offers can be reviewed with transparent compensation breakdowns and digitally signed directly in your Candidate Account.`;

    // 8. Engineering Roles
    } else if (q.includes("engineer") || q.includes("java") || q.includes("developer") || q.includes("architect") || q.includes("cloud") || q.includes("spring") || q.includes("react")) {
      const engJobs = jobs.filter((j) => j.department.toUpperCase() === "ENGINEERING");
      recommendedJobs = engJobs;
      reply = `### Open Engineering Requisitions

We have ${engJobs.length} active high-impact engineering requisitions:
${engJobs.map((j) => `- **${j.title}** (${j.salaryRange}) • Stack: ${j.requiredSkills.join(", ")}`).join("\n")}

You can upload your resume to get a real-time fit analysis across Skills, Experience, Education, and Certifications!`;

    // 9. Sales & Operations
    } else if (q.includes("sales") || q.includes("quota") || q.includes("account") || q.includes("enterprise") || q.includes("operations")) {
      const salesJobs = jobs.filter((j) => j.department.toUpperCase() === "SALES" || j.department.toUpperCase() === "OPERATIONS");
      recommendedJobs = salesJobs;
      reply = `### Enterprise Sales & Operations Requisitions

${salesJobs.map((j) => `- **${j.title}** (${j.salaryRange}) • Department: ${j.department}`).join("\n")}

All roles feature competitive commission structures and executive collaboration.`;

    // 10. General Overview / Fallback
    } else {
      const matched = jobs.filter((j) =>
        j.title.toLowerCase().includes(q) ||
        j.department.toLowerCase().includes(q) ||
        (j.requiredSkills && j.requiredSkills.some((s) => q.includes(s.toLowerCase())))
      );

      if (matched.length > 0) {
        recommendedJobs = matched;
        reply = `I found **${matched.length} matching role(s)** based on your inquiry: **${matched.map((j) => j.title).join(", ")}**.\n\nYou can upload your resume to calculate your multi-pillar fit score, or ask me about our **work permit policies**, **benefits**, **remote work guidelines**, or **referral bonus program**!`;
      } else {
        recommendedJobs = jobs.slice(0, 2);
        reply = `Welcome to **MAX Careers AI Advisor**! I can assist you with:\n\n1. **Work Permit & Visa Sponsorship Policies** (STEM OPT, H-1B, EU Blue Card, Canada GTS)\n2. **Legal Eligibility & Compliance** (Right to work, BGV, I-9)\n3. **Compensation & Benefits** (Salary bands, equity, $1,500 WFH budget, 401k match)\n4. **Role Recommendations & Skills Fit**\n5. **Interview Auto-Scheduling & Candidate Portal**\n\nHow can I help you today?`;
      }
    }

    return NextResponse.json({
      reply,
      answer: reply,
      recommendedRoleIds: recommendedJobs.map((j) => j.id),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "AI_CHAT_FAILED", message: error instanceof Error ? error.message : "Error processing query" },
      { status: 500 }
    );
  }
}
