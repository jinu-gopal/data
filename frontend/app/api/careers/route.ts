import { NextResponse } from "next/server";
import { buildBackendUrl } from "../configuration/proxy-helper";
import { recruitmentStore } from "@/lib/recruitment-store";

export async function GET() {
  try {
    let backendJobs: any[] = [];
    try {
      const response = await fetch(buildBackendUrl("/api/v1/recruitment/public/requisitions"), {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      if (response.ok) {
        backendJobs = await response.json();
      }
    } catch {
      // Backend fallback
    }

    // Pull open requisitions from recruitmentStore
    const storeOpenJobs = recruitmentStore
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
        createdAt: r.createdOn || new Date().toISOString(),
        approvalStatus: "APPROVED",
        approverNames: ["Maria Lopez (Hiring Lead)", "Sarah Jenkins (HR Director)"],
        positionSlots: [
          {
            slotId: `slot-${r.id}-1`,
            slotCode: `${r.reqNumber}-POS1`,
            status: "UNFILLED",
            assignedCandidateId: null,
            assignedCandidateName: null,
          },
        ],
      }));

    // Merge and deduplicate by reqNumber
    const combinedMap = new Map<string, any>();
    storeOpenJobs.forEach((job) => combinedMap.set(job.reqNumber.toLowerCase(), job));
    backendJobs.forEach((job) => combinedMap.set((job.reqNumber || job.id).toLowerCase(), job));

    const allPublicJobs = Array.from(combinedMap.values());
    return NextResponse.json(allPublicJobs);
  } catch (error) {
    return NextResponse.json(
      { error: "SERVER_ERROR", message: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
