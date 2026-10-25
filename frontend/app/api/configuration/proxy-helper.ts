import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Returns the canonical, normalized backend origin URL.
 * Guarantees no trailing slashes.
 */
export function getBackendOrigin(): string {
  const origin =
    process.env.MAX_ERP_BACKEND_URL ||
    process.env.MAX_ERP_API_URL ||
    "http://localhost:8080";

  return origin.trim().replace(/\/+$/, "");
}

/**
 * Builds a safe backend URL, ensuring it only targets the configured backend origin.
 */
export function buildBackendUrl(path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${getBackendOrigin()}${cleanPath}`;
}

/**
 * Validates that the provided ID is a valid RFC-compliant UUID string.
 */
export function isValidUuid(id: unknown): id is string {
  if (typeof id !== "string") {
    return false;
  }
  return UUID_REGEX.test(id.trim());
}

/**
 * Validates a UUID route parameter or query parameter.
 * Returns null if valid, or a 400 Bad Request response if invalid.
 */
export function validateUuidParam(
  id: unknown,
  paramName = "id"
): NextResponse | null {
  if (!isValidUuid(id)) {
    return NextResponse.json(
      {
        error: "BAD_REQUEST",
        message: `Invalid UUID provided for parameter: ${paramName}.`,
      },
      { status: 400 }
    );
  }
  return null;
}

/**
 * Resolves the OAuth access token from the session.
 * Checks both insecure (HTTP / localhost) and secure (HTTPS / production) cookie names.
 * Validates token expiration if present.
 */
export async function getAccessToken(
  request: NextRequest
): Promise<string | null> {
  try {
    let token = await getToken({
      req: request,
      secret: process.env.AUTH_SECRET,
      cookieName: "authjs.session-token",
      salt: "authjs.session-token",
      secureCookie: false,
    });

    if (!token) {
      token = await getToken({
        req: request,
        secret: process.env.AUTH_SECRET,
        cookieName: "__Secure-authjs.session-token",
        salt: "__Secure-authjs.session-token",
        secureCookie: true,
      });
    }

    if (!token) {
      token = await getToken({
        req: request,
        secret: process.env.AUTH_SECRET,
      });
    }

    if (!token?.accessToken || typeof token.accessToken !== "string") {
      return null;
    }

    return token.accessToken;
  } catch {
    return null;
  }
}

/**
 * Returns a standardized 401 Unauthorized response.
 */
export function unauthorizedResponse(
  message = "Authentication required or session expired."
): NextResponse {
  return NextResponse.json(
    {
      error: "UNAUTHORIZED",
      message,
    },
    { status: 401 }
  );
}

/**
 * Returns a standardized 400 Bad Request response.
 */
export function badRequestResponse(message: string): NextResponse {
  return NextResponse.json(
    {
      error: "BAD_REQUEST",
      message,
    },
    { status: 400 }
  );
}

/**
 * Forwards an upstream backend HTTP response safely to the client.
 * Preserves status codes and structured backend validation errors.
 * Sanitizes server stack traces and HTML error bodies.
 */
export async function forwardBackendResponse(
  response: Response
): Promise<NextResponse> {
  const status = response.status;

  if (status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  const text = await response.text();

  if (!text) {
    return new NextResponse(null, { status });
  }

  try {
    const data = JSON.parse(text);
    return NextResponse.json(data, { status });
  } catch {
    // Upstream returned non-JSON response (e.g. HTML 500 error page)
    if (status >= 500) {
      return NextResponse.json(
        {
          error: "INTERNAL_ERROR",
          message: "The backend service encountered an error.",
        },
        { status }
      );
    }

    return NextResponse.json(
      {
        error: "BACKEND_ERROR",
        message: text.substring(0, 300),
      },
      { status }
    );
  }
}

/**
 * Handles unexpected proxy errors without leaking credentials or stack traces.
 */
export function handleProxyError(
  error: unknown,
  action = "Request"
): NextResponse {
  console.error(
    `[Configuration Proxy Error] ${action}:`,
    error instanceof Error ? error.message : "Unknown error"
  );

  return NextResponse.json(
    {
      error: "PROXY_ERROR",
      message: `${action} failed. Unable to reach configuration backend.`,
    },
    { status: 502 }
  );
}
