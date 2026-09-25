import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const BACKEND_URL =
  process.env.MAX_ERP_BACKEND_URL || "http://localhost:8080";

async function getAccessToken(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    cookieName: "authjs.session-token",
    salt: "authjs.session-token",
    secureCookie: false,
  });

  return token?.accessToken as string | undefined;
}

async function readBackendResponse(response: Response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
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
  const { businessObjectId } = await context.params;

  console.log("========== MAX ERP FIELD GET ==========");
  console.log("Business Object:", businessObjectId);

  try {
    const accessToken = await getAccessToken(request);

    console.log("Access token found:", !!accessToken);

    if (!accessToken) {
      return NextResponse.json(
        {
          error: "UNAUTHORIZED",
          message: "MAX ERP access token was not found in the session.",
        },
        { status: 401 }
      );
    }

    const backendUrl =
      `${BACKEND_URL}/api/v1/configuration/business-objects/` +
      `${businessObjectId}/fields`;

    console.log("Calling backend:", backendUrl);

    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    console.log("Backend GET status:", response.status);

    const data = await readBackendResponse(response);

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "BACKEND_ERROR",
          message:
            typeof data === "string"
              ? data
              : data?.message || "Backend request failed.",
          status: response.status,
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data ?? []);
  } catch (error) {
    console.error("MAX ERP FIELD GET ERROR:", error);

    return NextResponse.json(
      {
        error: "INTERNAL_ERROR",
        message: "Unable to load fields.",
      },
      { status: 500 }
    );
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
  const { businessObjectId } = await context.params;

  console.log("========== MAX ERP FIELD POST ==========");
  console.log("Business Object:", businessObjectId);

  try {
    const accessToken = await getAccessToken(request);

    console.log("Access token found:", !!accessToken);

    if (!accessToken) {
      return NextResponse.json(
        {
          error: "UNAUTHORIZED",
          message: "MAX ERP access token was not found in the session.",
        },
        { status: 401 }
      );
    }

    const body = await request.text();

    console.log("Request body:", body);

    if (!body) {
      return NextResponse.json(
        {
          error: "BAD_REQUEST",
          message: "Request body is empty.",
        },
        { status: 400 }
      );
    }

    const backendUrl =
      `${BACKEND_URL}/api/v1/configuration/business-objects/` +
      `${businessObjectId}/fields`;

    console.log("Calling backend:", backendUrl);

    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body,
      cache: "no-store",
    });

    console.log("Backend POST status:", response.status);

    const data = await readBackendResponse(response);

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "BACKEND_ERROR",
          message:
            typeof data === "string"
              ? data
              : data?.message || "Backend request failed.",
          status: response.status,
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error("MAX ERP FIELD POST ERROR:", error);

    return NextResponse.json(
      {
        error: "INTERNAL_ERROR",
        message: "Unable to create field.",
      },
      { status: 500 }
    );
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
  const { businessObjectId } = await context.params;

  console.log("========== MAX ERP FIELD PUT ==========");
  console.log("Business Object:", businessObjectId);

  try {
    const accessToken = await getAccessToken(request);

    console.log("Access token found:", !!accessToken);

    if (!accessToken) {
      return NextResponse.json(
        {
          error: "UNAUTHORIZED",
          message: "MAX ERP access token was not found in the session.",
        },
        { status: 401 }
      );
    }

    /*
     * Current frontend sends:
     *
     * PUT /fields?fieldId=XXXXXXXX
     *
     * Backend expects:
     *
     * PUT /fields/XXXXXXXX
     *
     * Translate the frontend request here.
     */

    const fieldId = request.nextUrl.searchParams.get("fieldId");

    console.log("Field ID:", fieldId);

    if (!fieldId) {
      return NextResponse.json(
        {
          error: "BAD_REQUEST",
          message: "fieldId query parameter is required.",
        },
        { status: 400 }
      );
    }

    const body = await request.text();

    console.log("Request body:", body);

    if (!body) {
      return NextResponse.json(
        {
          error: "BAD_REQUEST",
          message: "Request body is empty.",
        },
        { status: 400 }
      );
    }

    const backendUrl =
      `${BACKEND_URL}/api/v1/configuration/business-objects/` +
      `${businessObjectId}/fields/${fieldId}`;

    console.log("Calling backend:", backendUrl);

    const response = await fetch(backendUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body,
      cache: "no-store",
    });

    console.log("Backend PUT status:", response.status);

    const data = await readBackendResponse(response);

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "BACKEND_ERROR",
          message:
            typeof data === "string"
              ? data
              : data?.message || "Backend request failed.",
          status: response.status,
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error("MAX ERP FIELD PUT ERROR:", error);

    return NextResponse.json(
      {
        error: "INTERNAL_ERROR",
        message: "Unable to update field.",
      },
      { status: 500 }
    );
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
  const { businessObjectId } = await context.params;

  console.log("========== MAX ERP FIELD DELETE ==========");
  console.log("Business Object:", businessObjectId);

  try {
    const accessToken = await getAccessToken(request);

    console.log("Access token found:", !!accessToken);

    if (!accessToken) {
      return NextResponse.json(
        {
          error: "UNAUTHORIZED",
          message: "MAX ERP access token was not found in the session.",
        },
        { status: 401 }
      );
    }

    const fieldId = request.nextUrl.searchParams.get("fieldId");

    console.log("Field ID:", fieldId);

    if (!fieldId) {
      return NextResponse.json(
        {
          error: "BAD_REQUEST",
          message: "fieldId query parameter is required.",
        },
        { status: 400 }
      );
    }

    const backendUrl =
      `${BACKEND_URL}/api/v1/configuration/business-objects/` +
      `${businessObjectId}/fields/${fieldId}`;

    console.log("Calling backend:", backendUrl);

    const response = await fetch(backendUrl, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    console.log("Backend DELETE status:", response.status);

    const data = await readBackendResponse(response);

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "BACKEND_ERROR",
          message:
            typeof data === "string"
              ? data
              : data?.message || "Backend request failed.",
          status: response.status,
        },
        { status: response.status }
      );
    }

    /*
     * Backend DELETE returns 204 No Content.
     *
     * Therefore we return a clean success response
     * instead of trying to serialize an empty response body.
     */

    if (response.status === 204) {
      return new NextResponse(null, {
        status: 204,
      });
    }

    return NextResponse.json(data ?? null, {
      status: response.status,
    });
  } catch (error) {
    console.error("MAX ERP FIELD DELETE ERROR:", error);

    return NextResponse.json(
      {
        error: "INTERNAL_ERROR",
        message: "Unable to delete field.",
      },
      { status: 500 }
    );
  }
}