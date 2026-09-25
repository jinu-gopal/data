import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const BACKEND_URL =
  process.env.MAX_ERP_BACKEND_URL || "http://localhost:8080";

type RouteContext = {
  params: Promise<{
    businessObjectId: string;
  }>;
};

async function getAccessToken(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    cookieName: "authjs.session-token",
    salt: "authjs.session-token",
    secureCookie: false,
  });

  if (!token) {
    return null;
  }

  const accessToken = token.accessToken;

  if (typeof accessToken !== "string" || accessToken.length === 0) {
    return null;
  }

  return accessToken;
}

// ============================================================
// GET FIELDS
// ============================================================

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  console.log("========== MAX ERP FIELD GET ==========");

  const { businessObjectId } = await context.params;

  const accessToken = await getAccessToken(request);

  if (!accessToken) {
    return NextResponse.json(
      {
        error: "UNAUTHORIZED",
        message: "MAX ERP login session is missing or does not contain an access token.",
      },
      { status: 401 }
    );
  }

  try {
    const backendResponse = await fetch(
      `${BACKEND_URL}/api/v1/configuration/business-objects/${businessObjectId}/fields`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );

    console.log(
      "MAX ERP FIELD GET backend status:",
      backendResponse.status
    );

    const responseText = await backendResponse.text();

    if (!backendResponse.ok) {
      console.error(
        "MAX ERP FIELD GET backend error:",
        responseText
      );

      return NextResponse.json(
        {
          error: "BACKEND_ERROR",
          message: "Backend request failed.",
          status: backendResponse.status,
        },
        { status: backendResponse.status }
      );
    }

    try {
      const data = JSON.parse(responseText);

      return NextResponse.json(data, {
        status: backendResponse.status,
      });
    } catch {
      return new NextResponse(responseText, {
        status: backendResponse.status,
        headers: {
          "Content-Type":
            backendResponse.headers.get("content-type") ||
            "application/json",
        },
      });
    }
  } catch (error) {
    console.error(
      "MAX ERP FIELD GET exception:",
      error
    );

    return NextResponse.json(
      {
        error: "BACKEND_CONNECTION_ERROR",
        message: "Unable to connect to MAX ERP Identity Service.",
      },
      { status: 502 }
    );
  }
}

// ============================================================
// CREATE FIELD
// ============================================================

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  console.log("========== MAX ERP FIELD POST ==========");

  const { businessObjectId } = await context.params;

  const accessToken = await getAccessToken(request);

  if (!accessToken) {
    return NextResponse.json(
      {
        error: "UNAUTHORIZED",
        message: "MAX ERP login session is missing or does not contain an access token.",
      },
      { status: 401 }
    );
  }

  try {
    const body = await request.text();

    const backendResponse = await fetch(
      `${BACKEND_URL}/api/v1/configuration/business-objects/${businessObjectId}/fields`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body,
      }
    );

    console.log(
      "MAX ERP FIELD POST backend status:",
      backendResponse.status
    );

    const responseText = await backendResponse.text();

    if (!backendResponse.ok) {
      console.error(
        "MAX ERP FIELD POST backend error:",
        responseText
      );

      return NextResponse.json(
        {
          error: "BACKEND_ERROR",
          message: "Backend request failed.",
          status: backendResponse.status,
        },
        { status: backendResponse.status }
      );
    }

    try {
      const data = JSON.parse(responseText);

      return NextResponse.json(data, {
        status: backendResponse.status,
      });
    } catch {
      return new NextResponse(responseText, {
        status: backendResponse.status,
        headers: {
          "Content-Type":
            backendResponse.headers.get("content-type") ||
            "application/json",
        },
      });
    }
  } catch (error) {
    console.error(
      "MAX ERP FIELD POST exception:",
      error
    );

    return NextResponse.json(
      {
        error: "BACKEND_CONNECTION_ERROR",
        message: "Unable to connect to MAX ERP Identity Service.",
      },
      { status: 502 }
    );
  }
}

// ============================================================
// UPDATE FIELD
// ============================================================

export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  console.log("========== MAX ERP FIELD PUT ==========");

  const { businessObjectId } = await context.params;

  const accessToken = await getAccessToken(request);

  if (!accessToken) {
    return NextResponse.json(
      {
        error: "UNAUTHORIZED",
        message: "MAX ERP login session is missing or does not contain an access token.",
      },
      { status: 401 }
    );
  }

  try {
    const body = await request.text();

    const fieldId = request.nextUrl.searchParams.get("fieldId");

    if (!fieldId) {
      return NextResponse.json(
        {
          error: "BAD_REQUEST",
          message: "fieldId query parameter is required.",
        },
        { status: 400 }
      );
    }

    const backendResponse = await fetch(
      `${BACKEND_URL}/api/v1/configuration/business-objects/${businessObjectId}/fields/${fieldId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body,
      }
    );

    console.log(
      "MAX ERP FIELD PUT backend status:",
      backendResponse.status
    );

    const responseText = await backendResponse.text();

    if (!backendResponse.ok) {
      console.error(
        "MAX ERP FIELD PUT backend error:",
        responseText
      );

      return NextResponse.json(
        {
          error: "BACKEND_ERROR",
          message: "Backend request failed.",
          status: backendResponse.status,
          details: responseText,
        },
        { status: backendResponse.status }
      );
    }

    try {
      const data = JSON.parse(responseText);

      return NextResponse.json(data, {
        status: backendResponse.status,
      });
    } catch {
      return new NextResponse(responseText, {
        status: backendResponse.status,
        headers: {
          "Content-Type":
            backendResponse.headers.get("content-type") ||
            "application/json",
        },
      });
    }
  } catch (error) {
    console.error(
      "MAX ERP FIELD PUT exception:",
      error
    );

    return NextResponse.json(
      {
        error: "BACKEND_CONNECTION_ERROR",
        message: "Unable to connect to MAX ERP Identity Service.",
      },
      { status: 502 }
    );
  }
}