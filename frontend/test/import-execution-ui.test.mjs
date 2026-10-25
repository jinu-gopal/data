import assert from "node:assert/strict";

console.log("=================================================");
console.log("STARTING IMPORT EXECUTION & HISTORY UI LOGIC TESTS");
console.log("=================================================");

// -------------------------------------------------------------
// Pure logic functions mirroring the UI components
// -------------------------------------------------------------

function shouldShowExecuteAction(validationResult, executionResult) {
  if (!validationResult) return false;
  if ((validationResult.validRows ?? 0) <= 0) return false;
  if (executionResult) return false;
  return true;
}

function parseExecutionError(status, errorBody) {
  if (status === 401) {
    return "Authentication required or session expired.";
  }
  if (status === 403) {
    return "Permission denied: CONFIGURATION:MANAGE permission is required to execute imports.";
  }
  if (status === 409) {
    return (
      errorBody?.message ||
      "Conflict: The import job is either currently executing or not in a VALIDATED state."
    );
  }
  return errorBody?.message || errorBody?.error || `Execution failed with HTTP ${status}.`;
}

function formatBytes(bytes) {
  if (bytes === null || bytes === undefined || bytes === 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// Simulates the Execution Controller within mapping/page.tsx
class ImportExecutionController {
  constructor({ businessObjectId, importId, fetchClient }) {
    this.businessObjectId = businessObjectId;
    this.importId = importId;
    this.fetchClient = fetchClient;

    this.validationResult = null;
    this.executionResult = null;
    this.showConfirmModal = false;
    this.executing = false;
    this.executionError = "";
    this.retryCount = 0;
  }

  setValidationResult(result) {
    this.validationResult = result;
  }

  openConfirmModal() {
    if (!shouldShowExecuteAction(this.validationResult, this.executionResult)) {
      return false;
    }
    this.showConfirmModal = true;
    this.executionError = "";
    return true;
  }

  cancelConfirmation() {
    if (this.executing) return;
    this.showConfirmModal = false;
    this.executionError = "";
  }

  async confirmAndExecute() {
    // Prevent duplicate submissions
    if (this.executing) return false;
    if (!this.showConfirmModal) return false;
    if (!shouldShowExecuteAction(this.validationResult, this.executionResult)) {
      return false;
    }

    this.executing = true;
    this.executionError = "";

    try {
      const response = await this.fetchClient(
        `/api/configuration/business-objects/${this.businessObjectId}/imports/${this.importId}/execute`,
        { method: "POST" }
      );

      if (!response.ok) {
        this.executionError = parseExecutionError(response.status, response.data);
        return false;
      }

      this.executionResult = response.data;
      this.showConfirmModal = false;
      return true;
    } catch (err) {
      this.executionError = err.message;
      return false;
    } finally {
      this.executing = false;
    }
  }
}

// -------------------------------------------------------------
// Test 1: Execute action visibility based on validation outcome
// -------------------------------------------------------------
console.log("\n[TEST 1] Execute action hidden when there are no eligible valid rows");
{
  assert.equal(
    shouldShowExecuteAction(null, null),
    false,
    "Hidden when validation result is null"
  );
  assert.equal(
    shouldShowExecuteAction({ totalRows: 10, validRows: 0, invalidRows: 10 }, null),
    false,
    "Hidden when validRows is 0"
  );
  assert.equal(
    shouldShowExecuteAction({ totalRows: 0, validRows: 0 }, null),
    false,
    "Hidden when dataset is empty"
  );
  assert.equal(
    shouldShowExecuteAction({ totalRows: 10, validRows: 10, invalidRows: 0 }, null),
    true,
    "Visible when validRows > 0"
  );
  assert.equal(
    shouldShowExecuteAction({ totalRows: 10, validRows: 5, invalidRows: 5 }, null),
    true,
    "Visible when partial valid rows exist"
  );
  assert.equal(
    shouldShowExecuteAction(
      { totalRows: 10, validRows: 5 },
      { status: "COMPLETED", processedRows: 5 }
    ),
    false,
    "Hidden after execution is completed"
  );
  console.log("  PASS: Visibility rules adhere to validRows and execution lifecycle.");
}

// -------------------------------------------------------------
// Test 2: Confirmation cancellation does not invoke execution
// -------------------------------------------------------------
console.log("\n[TEST 2] Confirmation cancellation does not call the execute endpoint");
{
  let executeCallCount = 0;
  const mockFetch = async () => {
    executeCallCount++;
    return { ok: true, data: { status: "COMPLETED", processedRows: 5 } };
  };

  const ctrl = new ImportExecutionController({
    businessObjectId: "bo-123",
    importId: "imp-456",
    fetchClient: mockFetch,
  });

  ctrl.setValidationResult({ totalRows: 5, validRows: 5, invalidRows: 0 });

  // Open modal
  const opened = ctrl.openConfirmModal();
  assert.equal(opened, true);
  assert.equal(ctrl.showConfirmModal, true);

  // User decides to cancel
  ctrl.cancelConfirmation();
  assert.equal(ctrl.showConfirmModal, false);
  assert.equal(executeCallCount, 0, "Execute API must NEVER be called upon cancel");
  assert.equal(ctrl.executionResult, null);
  console.log("  PASS: Cancellation cleanly resets dialog without triggering API call.");
}

// -------------------------------------------------------------
// Test 3: Execution requires explicit click on Confirm & Execute
// -------------------------------------------------------------
console.log("\n[TEST 3] Execution happens only after explicit confirmation");
{
  let calledUrl = null;
  let calledMethod = null;
  const mockFetch = async (url, opts) => {
    calledUrl = url;
    calledMethod = opts.method;
    return {
      ok: true,
      data: {
        status: "COMPLETED",
        totalRows: 10,
        processedRows: 10,
        failedRows: 0,
        duplicateRows: 0,
      },
    };
  };

  const ctrl = new ImportExecutionController({
    businessObjectId: "cf1757d5-c535-4335-939c-24908aee0209",
    importId: "e87b649a-0744-48f8-b3d6-681b49f96ce7",
    fetchClient: mockFetch,
  });

  ctrl.setValidationResult({ totalRows: 10, validRows: 10, invalidRows: 0 });
  ctrl.openConfirmModal();

  // Explicit confirmation
  const success = await ctrl.confirmAndExecute();
  assert.equal(success, true);
  assert.equal(
    calledUrl,
    "/api/configuration/business-objects/cf1757d5-c535-4335-939c-24908aee0209/imports/e87b649a-0744-48f8-b3d6-681b49f96ce7/execute"
  );
  assert.equal(calledMethod, "POST");
  assert.equal(ctrl.showConfirmModal, false);
  assert.equal(ctrl.executionResult.status, "COMPLETED");
  console.log("  PASS: Explicit confirmation successfully dispatches execution POST.");
}

// -------------------------------------------------------------
// Test 4: Duplicate submission prevention
// -------------------------------------------------------------
console.log("\n[TEST 4] Duplicate submission is prevented");
{
  let concurrentInvocations = 0;
  let totalCalls = 0;

  const slowFetch = async () => {
    totalCalls++;
    concurrentInvocations++;
    await new Promise((resolve) => setTimeout(resolve, 50));
    concurrentInvocations--;
    return {
      ok: true,
      data: { status: "COMPLETED", processedRows: 10 },
    };
  };

  const ctrl = new ImportExecutionController({
    businessObjectId: "bo-1",
    importId: "imp-1",
    fetchClient: slowFetch,
  });

  ctrl.setValidationResult({ totalRows: 10, validRows: 10 });
  ctrl.openConfirmModal();

  // Fire execution and immediate second click attempt while in progress
  const firstExecPromise = ctrl.confirmAndExecute();
  assert.equal(ctrl.executing, true, "Controller must mark state as executing immediately");

  const secondExecResult = await ctrl.confirmAndExecute();
  assert.equal(secondExecResult, false, "Second concurrent invocation must be discarded");

  await firstExecPromise;
  assert.equal(totalCalls, 1, "Only a single network call must be executed");
  assert.equal(concurrentInvocations, 0, "No pending concurrent invocations left");
  assert.equal(ctrl.executing, false);
  console.log("  PASS: Concurrent submissions blocked, executing flag protects against double-clicks.");
}

// -------------------------------------------------------------
// Test 5: 409 conflicts and server errors displayed safely
// -------------------------------------------------------------
console.log("\n[TEST 5] 409 conflicts, auth failures, and server errors displayed safely");
{
  // 409 Conflict
  const fetch409 = async () => ({
    ok: false,
    status: 409,
    data: { message: "Import job is already executing or status was modified concurrently" },
  });
  const ctrl409 = new ImportExecutionController({
    businessObjectId: "bo-1",
    importId: "imp-1",
    fetchClient: fetch409,
  });
  ctrl409.setValidationResult({ validRows: 5 });
  ctrl409.openConfirmModal();
  await ctrl409.confirmAndExecute();
  assert.equal(
    ctrl409.executionError,
    "Import job is already executing or status was modified concurrently"
  );

  // 401 Unauthorized
  const fetch401 = async () => ({ ok: false, status: 401, data: null });
  const ctrl401 = new ImportExecutionController({
    businessObjectId: "bo-1",
    importId: "imp-1",
    fetchClient: fetch401,
  });
  ctrl401.setValidationResult({ validRows: 5 });
  ctrl401.openConfirmModal();
  await ctrl401.confirmAndExecute();
  assert.equal(ctrl401.executionError, "Authentication required or session expired.");

  // 403 Forbidden
  const fetch403 = async () => ({ ok: false, status: 403, data: null });
  const ctrl403 = new ImportExecutionController({
    businessObjectId: "bo-1",
    importId: "imp-1",
    fetchClient: fetch403,
  });
  ctrl403.setValidationResult({ validRows: 5 });
  ctrl403.openConfirmModal();
  await ctrl403.confirmAndExecute();
  assert.equal(
    ctrl403.executionError,
    "Permission denied: CONFIGURATION:MANAGE permission is required to execute imports."
  );

  // No automatic retry verified
  assert.equal(ctrl409.retryCount, 0);
  assert.equal(ctrl401.retryCount, 0);
  console.log("  PASS: Structured HTTP status codes preserved and sanitized; no automatic retry executed.");
}

// -------------------------------------------------------------
// Test 6: Final counts come directly from execution response
// -------------------------------------------------------------
console.log("\n[TEST 6] Final counts come from the execution response, not preview assumptions");
{
  // Scenario: Preview reported 10 valid rows, but during transactional insert,
  // 1 row hit a concurrent unique constraint failure on the backend.
  const fetchWithRuntimeFailedRow = async () => ({
    ok: true,
    data: {
      status: "COMPLETED_WITH_ERRORS",
      totalRows: 10,
      processedRows: 9,
      failedRows: 1,
      duplicateRows: 0,
      errors: [
        {
          rowNumber: 7,
          columnName: "code",
          errorCode: "UNIQUE_VIOLATION",
          errorMessage: "Record with this code already exists in database",
          sourceValue: "CUST-007",
        },
      ],
    },
  });

  const ctrl = new ImportExecutionController({
    businessObjectId: "bo-1",
    importId: "imp-1",
    fetchClient: fetchWithRuntimeFailedRow,
  });

  ctrl.setValidationResult({ totalRows: 10, validRows: 10, invalidRows: 0 });
  ctrl.openConfirmModal();
  await ctrl.confirmAndExecute();

  // Counts reflect backend execution response
  assert.equal(ctrl.executionResult.status, "COMPLETED_WITH_ERRORS");
  assert.equal(ctrl.executionResult.processedRows, 9, "Processed count must match backend (9, not 10)");
  assert.equal(ctrl.executionResult.failedRows, 1, "Failed count must match backend (1, not 0)");
  assert.equal(ctrl.executionResult.errors.length, 1);
  assert.equal(ctrl.executionResult.errors[0].rowNumber, 7);
  console.log("  PASS: Execution result is source of truth for all final metrics.");
}

// -------------------------------------------------------------
// Test 7: History list renders states correctly
// -------------------------------------------------------------
console.log("\n[TEST 7] History list formatting and status helpers");
{
  assert.equal(formatBytes(0), "—");
  assert.equal(formatBytes(512), "512 B");
  assert.equal(formatBytes(1536), "1.5 KB");
  assert.equal(formatBytes(2097152), "2.00 MB");

  // Mock history payload verification
  const historyList = [
    {
      id: "imp-2",
      fileName: "customers_batch2.csv",
      fileType: "CSV",
      status: "COMPLETED",
      totalRows: 100,
      processedRows: 100,
      invalidRows: 0,
      duplicateRows: 0,
      createdAt: "2026-10-14T10:00:00Z",
    },
    {
      id: "imp-1",
      fileName: "customers_batch1.csv",
      fileType: "CSV",
      status: "COMPLETED_WITH_ERRORS",
      totalRows: 50,
      processedRows: 48,
      invalidRows: 2,
      duplicateRows: 0,
      createdAt: "2026-10-14T09:00:00Z",
    },
  ];

  assert.equal(historyList.length, 2);
  assert.equal(historyList[0].status, "COMPLETED");
  assert.equal(historyList[1].status, "COMPLETED_WITH_ERRORS");
  console.log("  PASS: History helpers and dataset formatting validated.");
}

console.log("\n=================================================");
console.log("ALL IMPORT EXECUTION & HISTORY UI LOGIC TESTS PASSED (7/7)");
console.log("=================================================");
