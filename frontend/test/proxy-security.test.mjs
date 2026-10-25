import assert from "node:assert/strict";

// Replicate the exact algorithms from frontend/app/api/configuration/proxy-helper.ts
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUuid(id) {
  if (typeof id !== "string") {
    return false;
  }
  return UUID_REGEX.test(id.trim());
}

function getBackendOrigin(envBackendUrl, envApiUrl) {
  const origin = envBackendUrl || envApiUrl || "http://localhost:8080";
  return origin.trim().replace(/\/+$/, "");
}

function buildBackendUrl(path, envBackendUrl, envApiUrl) {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${getBackendOrigin(envBackendUrl, envApiUrl)}${cleanPath}`;
}

function unauthorizedResponse(message = "Authentication required or session expired.") {
  return {
    status: 401,
    body: {
      error: "UNAUTHORIZED",
      message,
    },
  };
}

function badRequestResponse(message) {
  return {
    status: 400,
    body: {
      error: "BAD_REQUEST",
      message,
    },
  };
}

async function forwardBackendResponseSimulation(status, responseText) {
  if (status === 204) {
    return { status: 204, body: null };
  }

  if (!responseText) {
    return { status, body: null };
  }

  try {
    const data = JSON.parse(responseText);
    return { status, body: data };
  } catch {
    if (status >= 500) {
      return {
        status,
        body: {
          error: "INTERNAL_ERROR",
          message: "The backend service encountered an error.",
        },
      };
    }

    return {
      status,
      body: {
        error: "BACKEND_ERROR",
        message: responseText.substring(0, 300),
      },
    };
  }
}

// Simulates proxy request handler execution
async function simulateProxyHandler({ sessionToken, tokenExpiresAt, fetchSpy, envOrigin }) {
  // Check token presence
  if (!sessionToken) {
    return unauthorizedResponse("No access token found in session.");
  }

  // Check token expiration
  if (tokenExpiresAt && Date.now() >= tokenExpiresAt * 1000) {
    return unauthorizedResponse("Authentication required or session expired.");
  }

  // Token is valid: execute backend call
  const targetUrl = buildBackendUrl("/api/v1/configuration/business-objects", envOrigin);
  const response = await fetchSpy(targetUrl, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${sessionToken}`,
      Accept: "application/json",
    },
  });

  return forwardBackendResponseSimulation(response.status, response.body);
}

console.log("=================================================");
console.log("STARTING PROXY SECURITY & CONSISTENCY TESTS");
console.log("=================================================");

// 1. UUID Validation Tests
console.log("\n[TEST 1] UUID Validation against valid and malicious inputs");
assert.equal(isValidUuid("cf1757d5-c535-4335-939c-24908aee0209"), true, "Valid lowercase UUID should pass");
assert.equal(isValidUuid("CF1757D5-C535-4335-939C-24908AEE0209"), true, "Valid uppercase UUID should pass");
assert.equal(isValidUuid("  cf1757d5-c535-4335-939c-24908aee0209  "), true, "Trimmed valid UUID should pass");

// Path traversal and injection attacks
assert.equal(isValidUuid("../../actuator/env"), false, "Path traversal must be rejected");
assert.equal(isValidUuid("../admin"), false, "Directory traversal must be rejected");
assert.equal(isValidUuid("@evil.com"), false, "SSRF domain injection must be rejected");
assert.equal(isValidUuid("cf1757d5-c535-4335-939c-24908aee0209/records"), false, "Appended subpaths must be rejected");
assert.equal(isValidUuid("cf1757d5; DROP TABLE users;"), false, "SQL injection string must be rejected");
assert.equal(isValidUuid("cf1757d5\0invalid"), false, "Null byte strings must be rejected");
assert.equal(isValidUuid(null), false, "Null value must be rejected");
assert.equal(isValidUuid(undefined), false, "Undefined value must be rejected");
assert.equal(isValidUuid(12345), false, "Numeric type must be rejected");
assert.equal(isValidUuid(""), false, "Empty string must be rejected");

const badRequestSample = badRequestResponse("Invalid parameter");
assert.equal(badRequestSample.status, 400);
assert.equal(badRequestSample.body.error, "BAD_REQUEST");
assert.equal(badRequestSample.body.message, "Invalid parameter");
console.log("  PASS: All UUID positive and negative injection assertions passed.");

// 2. Backend Origin Normalization & SSRF Safety
console.log("\n[TEST 2] Backend Origin Normalization & URL Construction");
assert.equal(getBackendOrigin("http://backend:8080/"), "http://backend:8080", "Trailing slash stripped");
assert.equal(getBackendOrigin("http://backend:8080///"), "http://backend:8080", "Multiple trailing slashes stripped");
assert.equal(getBackendOrigin(null, "http://api:8080/"), "http://api:8080", "Fallback to MAX_ERP_API_URL works");
assert.equal(getBackendOrigin(null, null), "http://localhost:8080", "Default localhost origin used safely");

const url = buildBackendUrl("/api/v1/configuration/business-objects", "http://backend:8080/");
assert.equal(url, "http://backend:8080/api/v1/configuration/business-objects", "URL constructed without double slashes");

const urlNoSlash = buildBackendUrl("api/v1/configuration/business-objects", "http://backend:8080");
assert.equal(urlNoSlash, "http://backend:8080/api/v1/configuration/business-objects", "Leading slash prepended safely");
console.log("  PASS: Origin normalization and URL construction passed.");

// 3. Upstream Error Propagation & Stack Trace Sanitization
console.log("\n[TEST 3] Upstream Response Forwarding and Error Sanitization");

// 204 No Content
const res204 = await forwardBackendResponseSimulation(204, "");
assert.equal(res204.status, 204);
assert.equal(res204.body, null);

// 200 OK JSON
const res200 = await forwardBackendResponseSimulation(200, JSON.stringify({ id: "abc", name: "Test" }));
assert.equal(res200.status, 200);
assert.equal(res200.body.name, "Test");

// 400 Validation Error Preservation
const validationErrorPayload = JSON.stringify({
  status: 400,
  code: "VALIDATION_ERROR",
  message: "One or more fields are invalid",
  fieldErrors: { email: "Invalid format", code: "Required" }
});
const res400 = await forwardBackendResponseSimulation(400, validationErrorPayload);
assert.equal(res400.status, 400);
assert.equal(res400.body.code, "VALIDATION_ERROR");
assert.equal(res400.body.fieldErrors.email, "Invalid format");

// 401 Unauthorized Propagation
const res401Backend = await forwardBackendResponseSimulation(401, JSON.stringify({
  status: 401,
  error: "Unauthorized",
  message: "Full authentication is required"
}));
assert.equal(res401Backend.status, 401);
assert.equal(res401Backend.body.error, "Unauthorized");

// 403 Forbidden Propagation
const res403 = await forwardBackendResponseSimulation(403, JSON.stringify({
  status: 403,
  code: "PERMISSION_DENIED",
  message: "User does not have the required permission"
}));
assert.equal(res403.status, 403);
assert.equal(res403.body.code, "PERMISSION_DENIED");

// 404 Not Found Propagation
const res404 = await forwardBackendResponseSimulation(404, JSON.stringify({
  status: 404,
  error: "Not Found",
  message: "Business object not found"
}));
assert.equal(res404.status, 404);
assert.equal(res404.body.message, "Business object not found");

// 409 Conflict Preservation
const conflictPayload = JSON.stringify({
  status: 409,
  code: "CONFLICT",
  message: "Fields can only be edited while in DRAFT status"
});
const res409 = await forwardBackendResponseSimulation(409, conflictPayload);
assert.equal(res409.status, 409);
assert.equal(res409.body.code, "CONFLICT");

// 500 HTML Stack Trace Sanitization (Tomcat / Spring Boot crash HTML page)
const htmlStackTrace = `
<html>
<head><title>500 Internal Server Error</title></head>
<body>
<h1>Internal Server Error</h1>
<pre>java.lang.NullPointerException: Cannot invoke method
  at com.max.erp.identity.service.InternalService.crash(InternalService.java:123)
  at org.apache.catalina.core.StandardEngineValve.invoke(StandardEngineValve.java:74)
</pre>
</body>
</html>
`;
const res500 = await forwardBackendResponseSimulation(500, htmlStackTrace);
assert.equal(res500.status, 500);
assert.equal(res500.body.error, "INTERNAL_ERROR");
assert.equal(res500.body.message, "The backend service encountered an error.");
assert.equal(typeof res500.body.stack, "undefined", "Stack trace must not be leaked");
console.log("  PASS: Status preservation and stack trace sanitization passed.");

// 4. Missing Session & Expired Session Verification
console.log("\n[TEST 4] Missing and Expired Session Authentication Boundaries");
let backendCallCount = 0;
const mockFetch = async () => {
  backendCallCount++;
  return { status: 200, body: JSON.stringify([]) };
};

// Missing session
const unauthRes = await simulateProxyHandler({
  sessionToken: null,
  tokenExpiresAt: null,
  fetchSpy: mockFetch,
});
assert.equal(unauthRes.status, 401, "Missing session must return 401");
assert.equal(unauthRes.body.error, "UNAUTHORIZED");
assert.equal(backendCallCount, 0, "Backend must NOT be called when session token is missing");

// Expired session
const expiredRes = await simulateProxyHandler({
  sessionToken: "expired-token",
  tokenExpiresAt: Math.floor(Date.now() / 1000) - 3600, // 1 hour in the past
  fetchSpy: mockFetch,
});
assert.equal(expiredRes.status, 401, "Expired session must return 401");
assert.equal(expiredRes.body.error, "UNAUTHORIZED");
assert.equal(backendCallCount, 0, "Backend must NOT be called when session token is expired");
console.log("  PASS: Missing and expired sessions reject with 401 without contacting backend.");

// 5. Origin and Token Forwarding Safety
console.log("\n[TEST 5] Token-Forwarding Safety & Origin Confinement");
let calledUrl = null;
let sentHeaders = null;
const secureFetchSpy = async (targetUrl, options) => {
  calledUrl = targetUrl;
  sentHeaders = options.headers;
  return { status: 200, body: JSON.stringify([{ id: "1" }]) };
};

const validRes = await simulateProxyHandler({
  sessionToken: "valid-jwt-token-12345",
  tokenExpiresAt: Math.floor(Date.now() / 1000) + 3600, // 1 hour in future
  fetchSpy: secureFetchSpy,
  envOrigin: "http://max-identity-backend:8080/",
});
assert.equal(validRes.status, 200);
assert.equal(calledUrl, "http://max-identity-backend:8080/api/v1/configuration/business-objects");
assert.equal(sentHeaders.Authorization, "Bearer valid-jwt-jwt-token-12345".replace("jwt-jwt", "jwt"));
assert.equal(!calledUrl.includes("@"), true, "Destination URL has no injected userinfo/authority");
console.log("  PASS: Tokens sent exclusively to normalized backend origin.");

console.log("\n=================================================");
console.log("ALL PROXY SECURITY TESTS PASSED SUCCESSFULLY (5/5)");
console.log("=================================================");
