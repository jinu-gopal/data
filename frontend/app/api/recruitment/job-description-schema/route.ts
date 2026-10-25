import { NextRequest, NextResponse } from "next/server";
import { getBusinessObject, addCustomFieldToBusinessObject } from "@/lib/business-objects-schema";

export async function GET(request: NextRequest) {
  try {
    const metadata = getBusinessObject("JOB_DESCRIPTION");
    return NextResponse.json({
      success: true,
      data: metadata,
      source: "BUSINESS_OBJECT_REGISTRY",
      version: metadata.version,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "FAILED_TO_LOAD_SCHEMA", message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.key || !body.label || !body.type) {
      return NextResponse.json(
        { error: "BAD_REQUEST", message: "Field key, label, and type are required." },
        { status: 400 }
      );
    }

    const updated = addCustomFieldToBusinessObject("JOB_DESCRIPTION", {
      key: body.key,
      label: body.label,
      type: body.type,
      required: !!body.required,
      options: body.options || [],
      category: body.category || "CUSTOM",
      description: body.description || "",
      isCustom: true,
    });

    return NextResponse.json({ success: true, data: updated }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "FAILED_TO_ADD_FIELD", message: error.message },
      { status: 500 }
    );
  }
}
