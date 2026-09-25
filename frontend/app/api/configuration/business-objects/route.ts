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

export async function GET(request: NextRequest) {
  try {
    const accessToken = await getAccessToken(request);

    if (!accessToken) {
      return NextResponse.json(
        {
          error: "UNAUTHORIZED",
          message: "No access token found.",
        },
        { status: 401 }
      );
    }

    const response = await fetch(
      `${BACKEND_URL}/api/v1/configuration/business-objects`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );

    const data = await readBackendResponse(response);

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error("Business objects GET failed:", error);

    return NextResponse.json(
      {
        error: "BACKEND_ERROR",
        message: "Backend request failed.",
      },
      { status: 500 }
    );
  }
}