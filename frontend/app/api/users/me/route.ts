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

  if (!token) {
    return null;
  }

  const accessToken = token.accessToken;

  if (
    typeof accessToken !== "string" ||
    accessToken.length === 0
  ) {
    return null;
  }

  return accessToken;
}

export async function GET(request: NextRequest) {
  try {
    const accessToken = await getAccessToken(request);

    if (!accessToken) {
      return NextResponse.json(
        {
          message: "Not authenticated",
        },
        {
          status: 401,
        }
      );
    }

    const response = await fetch(
      `${BACKEND_URL}/api/v1/users/me`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );

    const contentType =
      response.headers.get("content-type") || "";

    const data = contentType.includes("application/json")
      ? await response.json()
      : {
          message: await response.text(),
        };

    if (!response.ok) {
      return NextResponse.json(
        data,
        {
          status: response.status,
        }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error(
      "Failed to load current MAX ERP user:",
      error
    );

    return NextResponse.json(
      {
        message: "Unable to contact MAX ERP Identity Service",
      },
      {
        status: 502,
      }
    );
  }
}
