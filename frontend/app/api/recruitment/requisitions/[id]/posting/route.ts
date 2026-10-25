import { NextRequest, NextResponse } from "next/server";
import { recruitmentStore, CareerSitePosting } from "@/lib/recruitment-store";
import {
  buildBackendUrl,
  forwardBackendResponse,
  getAccessToken,
  handleProxyError,
} from "../../../../configuration/proxy-helper";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // Check store first for posting configuration
    const posting = recruitmentStore.getPostingByRequisitionId(id);
    if (posting) {
      return NextResponse.json({
        success: true,
        data: posting,
      });
    }

    // If requisition itself doesn't exist, return 404
    const req = recruitmentStore.getRequisitionById(id);
    if (!req) {
      return NextResponse.json(
        { error: "REQUISITION_NOT_FOUND", message: `Requisition with ID "${id}" was not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "POSTING_NOT_FOUND", message: `No posting configuration found for requisition "${id}".` },
      { status: 404 }
    );
  } catch (error) {
    return handleProxyError(error, "Requisition Posting GET");
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const action = body.action || "SAVE_DRAFT"; // SAVE_DRAFT | PUBLISH

    // Validate requisition exists
    const req = recruitmentStore.getRequisitionById(id);
    if (!req) {
      return NextResponse.json(
        { error: "REQUISITION_NOT_FOUND", message: `Cannot post for unknown requisition "${id}".` },
        { status: 404 }
      );
    }

    // Required fields validation
    if (!body.careerSiteTitle || !body.careerSiteTitle.trim()) {
      return NextResponse.json(
        { error: "VALIDATION_FAILED", message: "Career Site Title is required." },
        { status: 400 }
      );
    }

    if (!body.urlSlug || !body.urlSlug.trim()) {
      return NextResponse.json(
        { error: "VALIDATION_FAILED", message: "URL Slug is required." },
        { status: 400 }
      );
    }

    // Validate URL slug syntax
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(body.urlSlug.trim())) {
      return NextResponse.json(
        {
          error: "VALIDATION_FAILED",
          message: "URL Slug must contain only lowercase alphanumeric characters and hyphens, and cannot start or end with a hyphen.",
        },
        { status: 400 }
      );
    }

    // Validate dates if present
    if (body.startDate && body.applicationDeadline) {
      const start = new Date(body.startDate);
      const deadline = new Date(body.applicationDeadline);
      if (deadline < start) {
        return NextResponse.json(
          { error: "VALIDATION_FAILED", message: "Application Deadline cannot be earlier than Posting Start Date." },
          { status: 400 }
        );
      }
    }

    let savedPosting: CareerSitePosting;
    let destinations: any[] = [];

    if (action === "PUBLISH") {
      savedPosting = recruitmentStore.publishPosting(id, body);
      destinations = [
        {
          id: "career-site",
          name: "MAX ERP Career Site",
          tier: "NATIVE",
          status: "PUBLISHED",
          url: `https://careers.maxerp.com/jobs/${savedPosting.urlSlug}`,
          publishedAt: new Date().toISOString(),
        },
        ...(savedPosting.selectedBoardIds || []).map((bId) => {
          const board = recruitmentStore.getJobBoardById(bId);
          const isNaukri = bId.toLowerCase() === "naukri";
          return {
            id: bId,
            name: board?.name || bId,
            tier: board?.tier || "FREE",
            status: isNaukri ? "PENDING_REVIEW" : "PUBLISHED",
            url: board?.externalUrl || "https://job-board.example.com",
            note: isNaukri ? "Employer compliance review in progress (est. 2-4 hours)" : undefined,
            publishedAt: new Date().toISOString(),
          };
        }),
      ];
    } else {
      savedPosting = recruitmentStore.savePostingDraft(id, body);
    }

    return NextResponse.json({
      success: true,
      data: savedPosting,
      destinations,
      message: action === "PUBLISH" ? "Requisition published successfully." : "Draft saved successfully.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "FAILED_TO_PERSIST_POSTING", message: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return POST(request, context);
}
