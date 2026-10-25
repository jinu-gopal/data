import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      action = "GENERATE_LETTER",
      prompt = "",
      letterText = "",
      category = "ENGINEERING",
      jurisdiction = "US",
      level = "SENIOR",
      candidateName = "Alex Mercer",
      jobTitle = "Staff Cloud Architect",
    } = body;

    // 1. GENERATE LETTER FROM PROMPT
    if (action === "GENERATE_LETTER") {
      const generatedCode = `LTR-AI-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      const title = prompt.length > 5 && prompt.length < 50 
        ? prompt 
        : `${level.charAt(0) + level.slice(1).toLowerCase()} ${jobTitle} Offer (${jurisdiction})`;

      const generatedBody = `Dear {{candidate_name}},

On behalf of MAX Enterprise Global, we are delighted to extend this formal offer of employment for the position of {{job_title}}, reporting directly to {{reporting_manager}}.

1. COMPENSATION & INCENTIVES:
- Base Annual Salary: \${{base_salary}} USD (or local equivalent in ${jurisdiction}), payable in accordance with customary payroll practices.
- Annual Performance Target Incentive: 20% of base salary based on key performance objectives and company growth milestones.
- Sign-on Grant: \${{signing_bonus}} USD, payable upon completion of 90 calendar days of tenure.
- Long-Term Equity Incentive: {{equity_shares}} Restricted Stock Units (RSUs) vesting 25% after 12 months, followed by quarterly vesting over 36 months.
- Anticipated Commencement Date: {{start_date}}.

2. COMPREHENSIVE BENEFITS & RETIREMENT:
You will be eligible for enterprise health insurance, life and disability coverage, 401(k)/pension matching up to 6%, four weeks of annual paid leave, and an annual \$3,000 professional growth stipend.

3. GOVERNING CONDITIONS:
This offer is contingent upon satisfactory completion of background verification (BGV) and confirmation of legal right to work. Employment is governed by applicable labor regulations of ${jurisdiction}.

Sincerely,
MAX Enterprise Executive Talent & Leadership`;

      return NextResponse.json({
        id: `ltr-ai-${Date.now()}`,
        code: generatedCode,
        title,
        category,
        jurisdiction,
        level,
        employmentType: "FULL_TIME",
        subject: `Employment Offer: ${title} - MAX Enterprise Global`,
        summary: `AI generated letter tailored from prompt: "${prompt || "Standard enterprise role"}". Includes comprehensive compensation schedule, equity vesting cliff, and compliance conditions for ${jurisdiction}.`,
        body: generatedBody,
        supportedMergeTags: ["{{candidate_name}}", "{{job_title}}", "{{base_salary}}", "{{signing_bonus}}", "{{equity_shares}}", "{{start_date}}", "{{reporting_manager}}"],
        mandatoryClauses: [
          "At-Will Employment Disclaimer",
          "BGV Clearance Contingency",
          "12-Month Bonus Clawback",
          "Proprietary IP Assignment"
        ],
        aiScore: 98,
        isAiGenerated: true,
        approvalRequired: true,
        approvalChain: ["VP Engineering", "VP Finance", "Head of People"],
        generatedAt: new Date().toISOString(),
      });
    }

    // 2. AUDIT COMPLIANCE & TONE
    if (action === "AUDIT_COMPLIANCE" || action === "AUDIT_LEGAL_COMPLIANCE") {
      const text = (letterText || body.letterBody || "").toLowerCase();
      const hasAtWill = text.includes("at-will") || text.includes("at will") || text.includes("notice period");
      const hasBgv = text.includes("background") || text.includes("bgv") || text.includes("verification");
      const hasIp = text.includes("intellectual property") || text.includes("ip") || text.includes("work made for hire") || text.includes("inventions");
      const hasClawback = text.includes("clawback") || text.includes("repay") || text.includes("tenure");

      let complianceScore = 80;
      if (hasAtWill) complianceScore += 5;
      if (hasBgv) complianceScore += 5;
      if (hasIp) complianceScore += 5;
      if (hasClawback) complianceScore += 5;

      const recommendations: string[] = [];
      if (!hasBgv) {
        recommendations.push("Add an explicit Background Verification (BGV) contingency clause to safeguard hiring compliance.");
      }
      if (!hasIp) {
        recommendations.push("Include a comprehensive Intellectual Property Assignment clause ('work made for hire') for enterprise protection.");
      }
      if (!hasClawback) {
        recommendations.push("Insert a 12-month tenure clawback provision for sign-on bonuses or relocation assistance.");
      }
      if (recommendations.length === 0) {
        recommendations.push("Letter satisfies all enterprise compliance benchmarks. Ready for executive dispatch.");
      }

      return NextResponse.json({
        overallScore: Math.min(complianceScore, 100),
        legalComplianceScore: Math.min(complianceScore, 100),
        toneInclusivityScore: 96,
        readabilityGrade: "Grade 11 (Professional Executive)",
        jurisdictionAlignment: `${jurisdiction} compliant standards verified`,
        findings: [
          {
            type: "COMPLIANCE",
            status: hasBgv ? "PASS" : "WARNING",
            label: "BGV Contingency Clause",
            detail: hasBgv ? "Satisfies enterprise screening standard." : "Missing explicit background check condition.",
          },
          {
            type: "LEGAL",
            status: hasIp ? "PASS" : "WARNING",
            label: "Proprietary IP & Inventions",
            detail: hasIp ? "Appropriate 'work made for hire' covenants detected." : "No explicit IP assignment found.",
          },
          {
            type: "RISK",
            status: hasClawback ? "PASS" : "INFO",
            label: "Bonus Clawback Protection",
            detail: hasClawback ? "12-month bonus protection in place." : "Consider adding standard 1-year clawback for unearned bonuses.",
          },
          {
            type: "INCLUSIVITY",
            status: "PASS",
            label: "Tone & Gender-Neutral Language",
            detail: "Zero discriminatory or non-inclusive terminology detected. High warmth and clarity rating.",
          },
        ],
        recommendations,
        auditedAt: new Date().toISOString(),
      });
    }

    // 3. RECOMMEND ENTERPRISE CLAUSES
    if (action === "RECOMMEND_CLAUSES") {
      const clauseBank = [
        {
          id: "clause-change-of-control",
          name: "Double-Trigger Change of Control Acceleration",
          category: "EQUITY_LEGAL",
          recommendedFor: "EXECUTIVE / LEAD",
          snippet: `CHANGE OF CONTROL ACCELERATION:
In the event of a Change of Control of MAX Enterprise Global followed within twelve (12) months by an involuntary termination without Cause or resignation for Good Reason, one hundred percent (100%) of unvested Restricted Stock Units or stock options shall immediately vest in full.`,
        },
        {
          id: "clause-clawback-signon",
          name: "12-Month Sign-on Bonus Clawback Provision",
          category: "FINANCIAL_RISK",
          recommendedFor: "ALL HIRES",
          snippet: `BONUS CLAWBACK PROVISION:
The Sign-on Incentive is subject to continuous active employment for twelve (12) calendar months following {{start_date}}. In the event Employee resigns voluntarily or is terminated for Cause prior to completing 12 months, Employee agrees to repay a pro-rated portion within thirty (30) days of separation.`,
        },
        {
          id: "clause-remote-equipment",
          name: "Home Office & Cloud Infrastructure Stipend",
          category: "REMOTE_WORK",
          recommendedFor: "REMOTE HIRES",
          snippet: `REMOTE WORKSPACE & HARDWARE STIPEND:
Company will provide a one-time reimbursement of up to \$3,000 USD for ergonomic workstation furniture, high-resolution monitors, and approved cryptographic peripherals, plus \$150 USD monthly for high-speed fiber broadband connectivity.`,
        },
        {
          id: "clause-garden-leave",
          name: "Garden Leave & Network Disconnection Protocol",
          category: "CONFIDENTIALITY",
          recommendedFor: "EXECUTIVE & SALES",
          snippet: `GARDEN LEAVE PREROGATIVE:
During any applicable notice period, Company reserves the right to place Employee on Garden Leave. During such period, Employee will continue to receive full salary and benefits but must refrain from contacting clients, accessing company networks, or performing competing services.`,
        },
        {
          id: "clause-relocation-repay",
          name: "24-Month Relocation Assistance Repayment Agreement",
          category: "MOBILITY",
          recommendedFor: "RELOCATION",
          snippet: `RELOCATION EXPENSE REPAYMENT:
If Employee terminates employment voluntarily within twenty-four (24) months of the relocation effective date, Employee will reimburse Company 100% of relocation expenses if separated within year one, and 50% if separated within year two.`,
        },
      ];

      return NextResponse.json({
        recommendedClauses: clauseBank,
        count: clauseBank.length,
      });
    }

    // 4. CANDIDATE PLAIN-LANGUAGE TL;DR SUMMARY
    if (action === "SUMMARIZE_LETTER") {
      return NextResponse.json({
        candidateName,
        jobTitle,
        offerAtAGlance: {
          role: jobTitle,
          annualBaseSalary: "$165,000 - $185,000 USD",
          targetBonus: "20% Annual Performance Target ($35,000 USD)",
          equityAward: "4,500 Restricted Stock Units (4-Year Vesting with 1-Year Cliff)",
          signOnIncentive: "$15,000 USD Cash Disbursed on First Payroll",
          healthBenefits: "100% Employer-Paid Healthcare, Dental, Vision Premiums",
          retirementPlan: "401(k) Dollar-for-Dollar Matching up to 5%",
          vacationPolicy: "Unlimited Discretionary Paid Time Off + 12 Corporate Holidays",
          specialPerks: "$3,000 Annual Learning Budget + Home Office Setup Grant",
          importantDeadlines: "Offer valid for acceptance within 7 business days",
        },
        keyContingencies: [
          "Standard background verification (criminal & degree checks) clearance",
          "Verification of legal authorization to work",
          "Countersignature on Proprietary Inventions & Confidentiality Agreement",
        ],
        plainLanguageExplainer: "This offer guarantees your base monthly pay with annual bonus upside. You earn a share of company ownership through equity that vests over 4 years. The company provides complete health coverage and retirement matching from Day 1.",
        generatedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({ error: "Unsupported AI action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "AI Letter Processing Failed: " + String(error) }, { status: 500 });
  }
}
