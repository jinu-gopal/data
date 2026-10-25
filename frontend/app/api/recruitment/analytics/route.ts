import { NextResponse } from "next/server";

export async function GET() {
  const analyticsData = {
    overview: {
      averageTimeToHireDays: 22.4,
      timeToHireTrendPct: -11.8, // improved by 11.8%
      averageCostPerHireUsd: 4250,
      costPerHireTrendPct: -6.2,
      offerAcceptanceRatePct: 91.3,
      totalHiresYtd: 18,
      activeOpeningsCount: 6,
      pipelinePassThroughRatePct: 18.5,
    },
    funnelConversion: [
      { stage: "APPLIED", count: 184, conversionPct: 100 },
      { stage: "SCREENING", count: 68, conversionPct: 37.0 },
      { stage: "ASSESSMENT", count: 42, conversionPct: 22.8 },
      { stage: "INTERVIEW", count: 26, conversionPct: 14.1 },
      { stage: "OFFER", count: 12, conversionPct: 6.5 },
      { stage: "HIRED", count: 11, conversionPct: 6.0 },
    ],
    channelPerformance: [
      { channel: "CAREERS_PORTAL", candidates: 74, hires: 5, costPerHireUsd: 850, qualityScore: 4.6 },
      { channel: "LINKEDIN", candidates: 62, hires: 3, costPerHireUsd: 3200, qualityScore: 4.4 },
      { channel: "EMPLOYEE_REFERRAL", candidates: 24, hires: 2, costPerHireUsd: 2000, qualityScore: 4.9 },
      { channel: "AGENCY_PARTNERS", candidates: 18, hires: 1, costPerHireUsd: 14500, qualityScore: 4.5 },
      { channel: "CAMPUS_OUTREACH", candidates: 6, hires: 0, costPerHireUsd: 1200, qualityScore: 3.8 },
    ],
    departmentVelocity: [
      { department: "Engineering", openReqs: 2, targetHeadcount: 4, filledHeadcount: 2, avgDaysToFill: 24.1 },
      { department: "Sales", openReqs: 1, targetHeadcount: 3, filledHeadcount: 1, avgDaysToFill: 19.5 },
      { department: "Operations", openReqs: 1, targetHeadcount: 1, filledHeadcount: 0, avgDaysToFill: 28.0 },
      { department: "Finance", openReqs: 1, targetHeadcount: 1, filledHeadcount: 1, avgDaysToFill: 16.2 },
    ],
    generatedAt: new Date().toISOString(),
  };

  return NextResponse.json(analyticsData);
}
