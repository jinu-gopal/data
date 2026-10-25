import { NextRequest, NextResponse } from "next/server";
import { recruitmentStore } from "@/lib/recruitment-store";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") || "ALL"; // ALL | FREE | PREMIUM | CONFIGURED
    const search = searchParams.get("search")?.toLowerCase() || "";

    let boards = recruitmentStore.getJobBoards();

    if (filter === "FREE") {
      boards = boards.filter((b) => b.tier === "FREE");
    } else if (filter === "PREMIUM") {
      boards = boards.filter((b) => b.tier === "PREMIUM");
    } else if (filter === "CONFIGURED") {
      boards = boards.filter((b) => b.status === "CONFIGURED" || b.status === "CONNECTED");
    }

    if (search) {
      boards = boards.filter(
        (b) =>
          b.name.toLowerCase().includes(search) ||
          b.description.toLowerCase().includes(search)
      );
    }

    return NextResponse.json({
      success: true,
      data: boards,
      total: boards.length,
      configuredCount: boards.filter((b) => b.status === "CONFIGURED" || b.status === "CONNECTED").length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "FAILED_TO_LOAD_JOB_BOARDS", message: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;
    if (!id || !status) {
      return NextResponse.json(
        { error: "BAD_REQUEST", message: "Job board id and status are required." },
        { status: 400 }
      );
    }

    const updated = recruitmentStore.updateJobBoardStatus(id, status);
    if (!updated) {
      return NextResponse.json(
        { error: "NOT_FOUND", message: `Job board ${id} not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "FAILED_TO_UPDATE_JOB_BOARD", message: error.message },
      { status: 500 }
    );
  }
}
