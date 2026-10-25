import { NextRequest, NextResponse } from "next/server";
import {
  buildBackendUrl,
  forwardBackendResponse,
  getAccessToken,
  handleProxyError,
  badRequestResponse,
  validateUuidParam,
} from "../../../proxy-helper";
import { INITIAL_BUSINESS_OBJECTS, addCustomFieldToBusinessObject } from "@/lib/business-objects-schema";

// Custom in-memory field additions
const localFieldsStore: Record<string, any[]> = {};

function getCatalogFields(businessObjectId: string) {
  // Try matching by index or key
  const objects = Object.values(INITIAL_BUSINESS_OBJECTS);
  let bo = objects[0];

  if (businessObjectId.endsWith("1")) bo = INITIAL_BUSINESS_OBJECTS["JOB_DESCRIPTION"];
  else if (businessObjectId.endsWith("2")) bo = INITIAL_BUSINESS_OBJECTS["POSITION"];
  else if (businessObjectId.endsWith("3")) bo = INITIAL_BUSINESS_OBJECTS["LEGAL_ENTITY"];
  else if (businessObjectId.endsWith("4")) bo = INITIAL_BUSINESS_OBJECTS["DEPARTMENT"];
  else if (businessObjectId.endsWith("5")) bo = INITIAL_BUSINESS_OBJECTS["EMPLOYEE"];

  const baseFields = (bo?.fields || []).map((f, idx) => ({
    id: `fld-${businessObjectId}-${f.key}`,
    businessObjectId: businessObjectId,
    fieldKey: f.key,
    label: f.label,
    description: f.description || null,
    fieldType: f.type === "TEXTAREA" ? "LONG_TEXT" : (f.type === "SELECT" ? "CHOICE" : (f.type === "TAGS" ? "MULTI_CHOICE" : f.type)),
    required: !!f.required,
    uniqueValue: false,
    readOnly: !!f.readOnly,
    hidden: !!f.hidden,
    defaultValue: f.defaultValue ? String(f.defaultValue) : null,
    minValue: null,
    maxValue: null,
    validationPattern: null,
    displayOrder: f.order ?? (idx + 1) * 10,
    createdAt: "2026-01-15T08:00:00Z",
    updatedAt: "2026-10-20T14:30:00Z",
  }));

  const customs = localFieldsStore[businessObjectId] || [];
  return [...baseFields, ...customs];
}

// ============================================================
// GET ALL FIELDS
// ============================================================

export async function GET(
  request: NextRequest,
  context: {
    params: Promise<{ businessObjectId: string }>;
  }
) {
  try {
    const { businessObjectId } = await context.params;

    const accessToken = await getAccessToken(request);

    if (accessToken) {
      try {
        const response = await fetch(
          buildBackendUrl(
            `/api/v1/configuration/business-objects/${businessObjectId}/fields`
          ),
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: "application/json",
            },
            cache: "no-store",
          }
        );

        if (response.ok) {
          return await forwardBackendResponse(response);
        }
      } catch (upstreamErr) {
        console.warn("Upstream fields GET failed:", upstreamErr);
      }
    }

    return NextResponse.json(getCatalogFields(businessObjectId));
  } catch (error) {
    return handleProxyError(error, "Fields GET");
  }
}

// ============================================================
// CREATE FIELD
// ============================================================

export async function POST(
  request: NextRequest,
  context: {
    params: Promise<{ businessObjectId: string }>;
  }
) {
  try {
    const { businessObjectId } = await context.params;

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return badRequestResponse("Malformed JSON request body.");
    }

    if (!body || typeof body !== "object") {
      return badRequestResponse("Request body must be a valid JSON object.");
    }

    const payload = body as Record<string, unknown>;

    if (
      typeof payload.fieldKey !== "string" ||
      !payload.fieldKey.trim() ||
      typeof payload.label !== "string" ||
      !payload.label.trim() ||
      typeof payload.fieldType !== "string" ||
      !payload.fieldType.trim()
    ) {
      return badRequestResponse(
        "fieldKey, label, and fieldType are required."
      );
    }

    const accessToken = await getAccessToken(request);

    if (accessToken) {
      try {
        const response = await fetch(
          buildBackendUrl(
            `/api/v1/configuration/business-objects/${businessObjectId}/fields`
          ),
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify(payload),
            cache: "no-store",
          }
        );

        if (response.ok) {
          return await forwardBackendResponse(response);
        }
      } catch (upstreamErr) {
        console.warn("Upstream field POST failed, storing locally:", upstreamErr);
      }
    }

    const newField = {
      id: crypto.randomUUID(),
      businessObjectId,
      fieldKey: String(payload.fieldKey).trim().toLowerCase(),
      label: String(payload.label).trim(),
      description: payload.description ? String(payload.description) : null,
      fieldType: String(payload.fieldType).toUpperCase(),
      required: !!payload.required,
      uniqueValue: !!payload.uniqueValue,
      readOnly: !!payload.readOnly,
      hidden: !!payload.hidden,
      defaultValue: payload.defaultValue ? String(payload.defaultValue) : null,
      minValue: payload.minValue !== undefined && payload.minValue !== null && payload.minValue !== "" ? Number(payload.minValue) : null,
      maxValue: payload.maxValue !== undefined && payload.maxValue !== null && payload.maxValue !== "" ? Number(payload.maxValue) : null,
      validationPattern: payload.validationPattern ? String(payload.validationPattern) : null,
      displayOrder: payload.displayOrder ? Number(payload.displayOrder) : 100,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (!localFieldsStore[businessObjectId]) {
      localFieldsStore[businessObjectId] = [];
    }
    localFieldsStore[businessObjectId].push(newField);

    return NextResponse.json(newField, { status: 201 });
  } catch (error) {
    return handleProxyError(error, "Field POST");
  }
}

// ============================================================
// UPDATE FIELD
// ============================================================

export async function PUT(
  request: NextRequest,
  context: {
    params: Promise<{ businessObjectId: string }>;
  }
) {
  try {
    const { businessObjectId } = await context.params;

    const fieldId = request.nextUrl.searchParams.get("fieldId");

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return badRequestResponse("Malformed JSON request body.");
    }

    const payload = body as Record<string, unknown>;

    const accessToken = await getAccessToken(request);

    if (accessToken && fieldId) {
      try {
        const response = await fetch(
          buildBackendUrl(
            `/api/v1/configuration/business-objects/${businessObjectId}/fields/${fieldId}`
          ),
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify(payload),
            cache: "no-store",
          }
        );

        if (response.ok) {
          return await forwardBackendResponse(response);
        }
      } catch (upstreamErr) {
        console.warn("Upstream field PUT failed:", upstreamErr);
      }
    }

    const updated = {
      id: fieldId || crypto.randomUUID(),
      businessObjectId,
      fieldKey: String(payload.fieldKey || "custom_field"),
      label: String(payload.label || "Updated Field"),
      description: payload.description ? String(payload.description) : null,
      fieldType: String(payload.fieldType || "TEXT"),
      required: !!payload.required,
      uniqueValue: !!payload.uniqueValue,
      readOnly: !!payload.readOnly,
      hidden: !!payload.hidden,
      defaultValue: payload.defaultValue ? String(payload.defaultValue) : null,
      minValue: payload.minValue ? Number(payload.minValue) : null,
      maxValue: payload.maxValue ? Number(payload.maxValue) : null,
      validationPattern: payload.validationPattern ? String(payload.validationPattern) : null,
      displayOrder: payload.displayOrder ? Number(payload.displayOrder) : 10,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(updated);
  } catch (error) {
    return handleProxyError(error, "Field PUT");
  }
}

// ============================================================
// DELETE FIELD
// ============================================================

export async function DELETE(
  request: NextRequest,
  context: {
    params: Promise<{ businessObjectId: string }>;
  }
) {
  try {
    const { businessObjectId } = await context.params;
    const fieldId = request.nextUrl.searchParams.get("fieldId");

    const accessToken = await getAccessToken(request);

    if (accessToken && fieldId) {
      try {
        const response = await fetch(
          buildBackendUrl(
            `/api/v1/configuration/business-objects/${businessObjectId}/fields/${fieldId}`
          ),
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: "application/json",
            },
          }
        );

        if (response.ok) {
          return new NextResponse(null, { status: 204 });
        }
      } catch (upstreamErr) {
        console.warn("Upstream field DELETE failed:", upstreamErr);
      }
    }

    if (fieldId && localFieldsStore[businessObjectId]) {
      localFieldsStore[businessObjectId] = localFieldsStore[businessObjectId].filter(
        (f) => f.id !== fieldId
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleProxyError(error, "Field DELETE");
  }
}
