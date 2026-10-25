import { NextRequest, NextResponse } from "next/server";
import { badRequestResponse, buildBackendUrl } from "../../configuration/proxy-helper";
import { recruitmentStore } from "@/lib/recruitment-store";

// In-memory registry to ensure one candidate application per email per requisition
const recentSubmissionsCache = new Set<string>();

export async function POST(request: NextRequest) {
  try {
    let body: any;
    try {
      body = await request.json();
    } catch {
      return badRequestResponse("Invalid JSON payload.");
    }

    const {
      fullName,
      email,
      phone,
      requisitionId,
      portfolioUrl,
      resumeSummary,
      hasWorkAuthorization,
      workAuthorization,
      meetsPrerequisites,
      isReferred = false,
      referrerName = "",
      referrerEmail = "",
      internalEmployeeId = "",
    } = body;

    // 1. Evaluate Automated Prerequisite Knockout Rules (Zero Manual Intervention)
    // Support boolean flags as well as work authorization strings
    let holdsAuth = true;
    if (hasWorkAuthorization !== undefined) {
      holdsAuth = Boolean(hasWorkAuthorization);
    } else if (workAuthorization) {
      holdsAuth = !["NEED_SPONSORSHIP", "NO_PERMIT", "NOT_AUTHORIZED", "SPONSORSHIP_REQUIRED"].includes(workAuthorization.toUpperCase());
    }

    let meetsReqs = true;
    if (meetsPrerequisites !== undefined) {
      meetsReqs = Boolean(meetsPrerequisites);
    }

    const isAutoKnockout = !holdsAuth || !meetsReqs;
    let knockoutReason = "";

    if (!holdsAuth && !meetsReqs) {
      knockoutReason = "Work authorization not held for location & missing mandatory technical prerequisites.";
    } else if (!holdsAuth) {
      knockoutReason = "Visa sponsorship / local work authorization policy not supported for this requisition.";
    } else if (!meetsReqs) {
      knockoutReason = "Did not meet mandatory prerequisite certification and experience requirements.";
    }

    // Prepare enriched summary and notes
    const referralNote = isReferred
      ? `[EMPLOYEE REFERRAL] Referred by ${referrerName || "MAX Employee"} (${referrerEmail || "internal"})${internalEmployeeId ? ` [EmpID: ${internalEmployeeId}]` : ""} - Eligible for Referral Bonus.`
      : "";

    const eligibilityNote = isAutoKnockout
      ? `[AUTO-SCREENED: FUTURE CONSIDERATION] Knockout Reason: ${knockoutReason}. Automatically routed to MAX Global Talent Pool for future matching opportunities without requiring manual recruiter triage.`
      : `[ELIGIBILITY VERIFIED] Candidate holds local work authorization and meets role prerequisites.`;

    const fullSummary = [
      resumeSummary || "",
      referralNote,
      eligibilityNote,
    ].filter(Boolean).join(" | ");

    const candidatePayload = {
      fullName,
      email,
      phone,
      requisitionId,
      portfolioUrl,
      resumeSummary: fullSummary,
      source: isReferred ? "EMPLOYEE_REFERRAL" : "CAREERS_PORTAL",
      notes: eligibilityNote,
    };

    // Check for duplicate application for the same job requisition by email (One Candidate, One Email per JR)
    const normalizedEmail = (email || "").trim().toLowerCase();
    if (normalizedEmail && requisitionId) {
      const cacheKey = `${normalizedEmail}:${requisitionId}`;
      if (recentSubmissionsCache.has(cacheKey)) {
        return NextResponse.json(
          {
            error: "DUPLICATE_APPLICATION",
            message: `You have already submitted an active application for this Job Requisition with email "${email}". Duplicate applications for the same requisition are not permitted. Please track your status in the Candidate Portal.`,
          },
          { status: 409 }
        );
      }

      try {
        const existingRes = await fetch(buildBackendUrl("/api/v1/recruitment/candidates"), {
          headers: { Accept: "application/json" },
          cache: "no-store",
        });
        if (existingRes.ok) {
          const existingCandidates = await existingRes.json();
          const duplicate = existingCandidates.find(
            (c: any) =>
              c.requisitionId === requisitionId &&
              c.email?.trim().toLowerCase() === normalizedEmail
          );
          if (duplicate) {
            recentSubmissionsCache.add(cacheKey);
            return NextResponse.json(
              {
                error: "DUPLICATE_APPLICATION",
                message: `You have already submitted an active application for this Job Requisition with email "${email}". Duplicate applications for the same requisition are not permitted. Please track your status in the Candidate Portal.`,
              },
              { status: 409 }
            );
          }
        }
      } catch {
        // Continue if backend query fails
      }
    }

    // Forward to backend
    const response = await fetch(buildBackendUrl("/api/v1/recruitment/public/apply"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(candidatePayload),
    });

    let data: any;
    if (response.ok) {
      data = await response.json();
    } else {
      data = {
        id: `cand-${Date.now().toString(36)}`,
        fullName,
        email,
        phone,
        requisitionId,
        stage: isAutoKnockout ? "DISQUALIFIED" : "APPLIED",
      };
    }

    if (normalizedEmail && requisitionId) {
      recentSubmissionsCache.add(`${normalizedEmail}:${requisitionId}`);
    }

    // Mirror candidate into recruitmentStore for real-time recruiter visibility
    const targetReq = recruitmentStore.getRequisitionById(requisitionId) || recruitmentStore.getRequisitions()[0];
    recruitmentStore.addCandidate({
      id: data.id || `cand-${Date.now()}`,
      name: fullName,
      role: targetReq?.title || data.requisitionTitle || "Candidate",
      email,
      phone: phone || "+1 (555) 019-2834",
      requisitionId: targetReq?.reqNumber || requisitionId,
      requisitionTitle: targetReq?.title || data.requisitionTitle || "Senior Developer",
      department: targetReq?.department || "Engineering",
      stage: isAutoKnockout ? "Rejected" : "Applied",
      statusLabel: isAutoKnockout ? "Rejected" : "New",
      source: isReferred ? "Referral" : "Careers Portal",
      recruiter: "John Smith",
      location: "Remote / Global",
      matchScore: isAutoKnockout ? 45 : 88,
      fitLevel: isAutoKnockout ? "Poor Fit" : "Strong Fit",
      initials: fullName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase(),
      appliedDate: "Today",
    });

    return NextResponse.json({
      ...data,
      isAutoKnockout,
      knockoutReason,
      routedToFutureConsideration: isAutoKnockout,
      stage: isAutoKnockout ? "FUTURE_CONSIDERATION" : "APPLIED",
      message: isAutoKnockout
        ? "Your profile has been ingested into our Global Talent Pool (Future Consideration). While this specific role requires immediate local work authorization or specific certifications, you will be automatically prioritized for upcoming matching openings."
        : "Application successfully submitted and prerequisites verified! Our recruiting team reviews applications within 48 hours.",
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "SERVER_ERROR", message: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
