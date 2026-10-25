import { NextRequest, NextResponse } from "next/server";
import {
  buildBackendUrl,
  forwardBackendResponse,
  getAccessToken,
  badRequestResponse,
} from "../configuration/proxy-helper";
import { identitySecurityStore } from "@/lib/identity-security-store";

export async function GET(request: NextRequest) {
  try {
    const accessToken = await getAccessToken(request);

    if (accessToken) {
      try {
        const response = await fetch(buildBackendUrl("/api/v1/users"), {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
          },
          cache: "no-store",
        });

        if (response.ok) {
          return await forwardBackendResponse(response);
        }
      } catch (upstreamErr) {
        console.warn("Upstream users fetch failed, using fallback:", upstreamErr);
      }
    }

    return NextResponse.json(identitySecurityStore.getUsers());
  } catch (error) {
    console.error("Users list GET error:", error);
    return NextResponse.json(identitySecurityStore.getUsers());
  }
}

export async function POST(request: NextRequest) {
  try {
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
      typeof payload.username !== "string" ||
      !payload.username.trim() ||
      typeof payload.email !== "string" ||
      !payload.email.trim()
    ) {
      return badRequestResponse("username and email are required.");
    }

    const sanitizedBody = {
      username: payload.username.trim(),
      email: payload.email.trim(),
      password: typeof payload.password === "string" ? payload.password : undefined,
    };

    const accessToken = await getAccessToken(request);

    if (accessToken) {
      try {
        const response = await fetch(buildBackendUrl("/api/v1/users"), {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(sanitizedBody),
          cache: "no-store",
        });

        if (response.ok) {
          return await forwardBackendResponse(response);
        }
      } catch (upstreamErr) {
        console.warn("Upstream user create failed, using local store:", upstreamErr);
      }
    }

    const created = identitySecurityStore.createUser(sanitizedBody);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("User create POST error:", error);
    return badRequestResponse("Failed to create user.");
  }
}
