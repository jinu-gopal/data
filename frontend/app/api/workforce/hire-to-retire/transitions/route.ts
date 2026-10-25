import { NextResponse } from "next/server";
import { ecCoreStore } from "@/lib/ec-core-store";

export async function GET() {
  try {
    const transitions = ecCoreStore.getH2RTransitions();
    return NextResponse.json(transitions);
  } catch (err: any) {
    return NextResponse.json({ error: "FAILED_TO_FETCH_TRANSITIONS", message: err.message }, { status: 500 });
  }
}
