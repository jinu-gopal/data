"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type BusinessObject = {
  id: string;
  objectKey: string;
  name: string;
  description?: string | null;
  status: string;
};

type Field = {
  id: string;
  fieldKey: string;
  label: string;
  fieldType: string;
  required: boolean;
  readOnly: boolean;
  hidden: boolean;
  displayOrder: number;
};

type MappingResponse = {
  importJobId: string;
  businessObjectId: string;
  mapping?: Record<string, string>;
  sourceColumns?: string[];
};

type ValidationError = {
  rowNumber?: number | null;
  columnName?: string | null;
  errorCode?: string | null;
  errorMessage?: string | null;
  sourceValue?: string | null;
};

type ValidationResponse = {
  importJobId: string;
  businessObjectId: string;
  status: string;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  duplicateRows: number;
  errors?: ValidationError[];
};

type ExecutionError = {
  rowNumber?: number | null;
  columnName?: string | null;
  errorCode?: string | null;
  errorMessage?: string | null;
  sourceValue?: string | null;
};

type ExecutionResponse = {
  importJobId: string;
  businessObjectId: string;
  status: string;
  totalRows: number;
  processedRows: number;
  failedRows: number;
  duplicateRows: number;
  createdRecordIds?: string[];
  errors?: ExecutionError[];
  startedAt?: string | null;
  completedAt?: string | null;
};

type ApiError = {
  message?: string;
  error?: string;
};

function parseError(text: string, status: number, action: string) {
  if (!text) {
    return `${action} failed with HTTP ${status}.`;
  }

  try {
    const data = JSON.parse(text) as ApiError;

    if (data.message) {
      return `${action} failed (${status}): ${data.message}`;
    }

    if (data.error) {
      return `${action} failed (${status}): ${data.error}`;
    }
  } catch {
    // Use raw response below.
  }

  return `${action} failed (${status}): ${text}`;
}

export default function ImportMappingPage() {
  const params = useParams();
  const router = useRouter();

  const businessObjectId =
    typeof params.businessObjectId === "string"
      ? params.businessObjectId
      : "";

  const importId =
    typeof params.importId === "string"
      ? params.importId
      : "";

  const [businessObject, setBusinessObject] = useState<BusinessObject | null>(
    null
  );
  const [fields, setFields] = useState<Field[]>([]);
  const [sourceColumns, setSourceColumns] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [validating, setValidating] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [executionResult, setExecutionResult] =
    useState<ExecutionResponse | null>(null);
  const [executionError, setExecutionError] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [activeTab, setActiveTab] = useState<"mapping" | "preview">("mapping");
  const [validationResult, setValidationResult] =
    useState<ValidationResponse | null>(null);

  // Error search and filter state for validation preview
  const [errorSearch, setErrorSearch] = useState("");
  const [errorColumnFilter, setErrorColumnFilter] = useState("ALL");

  useEffect(() => {
    if (!businessObjectId || !importId) {
      return;
    }

    async function loadMapping() {
      try {
        setLoading(true);
        setError("");

        const [mappingResponse, fieldsResponse, boResponse] = await Promise.all([
          fetch(
            `/api/configuration/business-objects/${businessObjectId}/imports/${importId}/mapping`,
            {
              method: "GET",
              cache: "no-store",
            }
          ),
          fetch(
            `/api/configuration/business-objects/${businessObjectId}/fields`,
            {
              method: "GET",
              cache: "no-store",
            }
          ),
          fetch(
            `/api/configuration/business-objects/${businessObjectId}`,
            {
              method: "GET",
              cache: "no-store",
            }
          ),
        ]);

        if (boResponse.ok) {
          try {
            const boData = await boResponse.json();
            setBusinessObject(boData);
          } catch {
            // Ignore bo parse failure
          }
        }

        const mappingText = await mappingResponse.text();
        const fieldsText = await fieldsResponse.text();

        if (!mappingResponse.ok) {
          throw new Error(
            parseError(
              mappingText,
              mappingResponse.status,
              "Load mapping"
            )
          );
        }

        if (!fieldsResponse.ok) {
          throw new Error(
            parseError(
              fieldsText,
              fieldsResponse.status,
              "Load fields"
            )
          );
        }

        const mappingData: MappingResponse = mappingText
          ? (JSON.parse(mappingText) as MappingResponse)
          : {
              importJobId: importId,
              businessObjectId,
            };

        const fieldsData = fieldsText ? JSON.parse(fieldsText) : [];

        const loadedFields: Field[] = Array.isArray(fieldsData)
          ? fieldsData
              .filter((field: Field) => !field.hidden)
              .sort(
                (a: Field, b: Field) =>
                  a.displayOrder - b.displayOrder
              )
          : [];

        setFields(loadedFields);

        const existingMapping =
          mappingData.mapping &&
          typeof mappingData.mapping === "object"
            ? mappingData.mapping
            : {};

        setMapping(existingMapping);

        if (Array.isArray(mappingData.sourceColumns)) {
          setSourceColumns(mappingData.sourceColumns);
        } else {
          setSourceColumns(Object.keys(existingMapping));
        }
      } catch (err) {
        console.error("LOAD IMPORT MAPPING ERROR:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load import mapping."
        );
      } finally {
        setLoading(false);
      }
    }

    loadMapping();
  }, [businessObjectId, importId]);

  const fieldById = useMemo(() => {
    const result: Record<string, Field> = {};

    fields.forEach((field) => {
      result[field.id] = field;
    });

    return result;
  }, [fields]);

  const mappedCount = useMemo(
    () =>
      sourceColumns.filter(
        (column) => Boolean(mapping[column])
      ).length,
    [sourceColumns, mapping]
  );

  const unmappedCount = sourceColumns.length - mappedCount;

  // Detect duplicate target field assignments (same field mapped to multiple source columns)
  const duplicateFieldMap = useMemo(() => {
    const targetMap: Record<string, string[]> = {};
    for (const [col, fid] of Object.entries(mapping)) {
      if (fid && fid.trim() !== "") {
        if (!targetMap[fid]) targetMap[fid] = [];
        targetMap[fid].push(col);
      }
    }
    const duplicates: Record<string, string[]> = {};
    for (const [fid, cols] of Object.entries(targetMap)) {
      if (cols.length > 1) {
        duplicates[fid] = cols;
      }
    }
    return duplicates;
  }, [mapping]);

  function autoMap() {
    const nextMapping = { ...mapping };

    sourceColumns.forEach((column) => {
      const normalizedColumn = column.trim().toLowerCase();

      const match = fields.find(
        (field) =>
          field.fieldKey.toLowerCase() === normalizedColumn ||
          field.label.trim().toLowerCase() === normalizedColumn
      );

      if (match) {
        nextMapping[column] = match.id;
      }
    });

    setMapping(nextMapping);
    setSuccess("");
    setError("");
  }

  function updateMapping(sourceColumn: string, fieldId: string) {
    setMapping((current) => {
      const next = { ...current };

      if (!fieldId) {
        delete next[sourceColumn];
      } else {
        next[sourceColumn] = fieldId;
      }

      return next;
    });

    setSuccess("");
    setError("");
  }

  function getCleanMappingPayload(): Record<string, string> {
    const clean: Record<string, string> = {};
    for (const [col, fid] of Object.entries(mapping)) {
      if (fid && typeof fid === "string" && fid.trim() !== "") {
        clean[col] = fid.trim();
      }
    }
    return clean;
  }

  async function executeSaveMapping(
    payload: Record<string, string>
  ): Promise<boolean> {
    const response = await fetch(
      `/api/configuration/business-objects/${businessObjectId}/imports/${importId}/mapping`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          mapping: payload,
        }),
      }
    );

    const text = await response.text();

    if (!response.ok) {
      throw new Error(
        parseError(text, response.status, "Save mapping")
      );
    }

    return true;
  }

  async function saveMapping() {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = getCleanMappingPayload();
      await executeSaveMapping(payload);

      setSuccess("Import mapping saved successfully.");
    } catch (err) {
      console.error("SAVE IMPORT MAPPING ERROR:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to save import mapping."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleValidateImport() {
    if (saving || validating || executing) return;

    setError("");
    setSuccess("");
    setValidating(true);

    try {
      // Step 1: Always save column mapping first
      const payload = getCleanMappingPayload();
      await executeSaveMapping(payload);

      // Step 2: Trigger backend validation via proxy route
      const validateResponse = await fetch(
        `/api/configuration/business-objects/${businessObjectId}/imports/${importId}/validate`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
        }
      );

      const validateText = await validateResponse.text();

      if (!validateResponse.ok) {
        throw new Error(
          parseError(
            validateText,
            validateResponse.status,
            "Validation"
          )
        );
      }

      let parsedResult: ValidationResponse;
      try {
        parsedResult = JSON.parse(validateText) as ValidationResponse;
      } catch {
        throw new Error(
          "Validation completed, but the server returned an invalid response format."
        );
      }

      // Ensure errors is an array even if omitted
      parsedResult.errors = Array.isArray(parsedResult.errors)
        ? parsedResult.errors
        : [];

      setValidationResult(parsedResult);
      setActiveTab("preview");
      setSuccess(
        "Mapping saved and import validation completed successfully."
      );
    } catch (err) {
      console.error("VALIDATE IMPORT ERROR:", err);

      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred during import validation."
      );
    } finally {
      setValidating(false);
    }
  }

  async function handleExecuteImport() {
    if (executing || !businessObjectId || !importId) return;

    setExecuting(true);
    setExecutionError("");
    setError("");

    try {
      const response = await fetch(
        `/api/configuration/business-objects/${businessObjectId}/imports/${importId}/execute`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
        }
      );

      const text = await response.text();
      let data: ExecutionResponse;

      try {
        data = JSON.parse(text) as ExecutionResponse;
      } catch {
        throw new Error(
          `Execution request failed (HTTP ${response.status}). The server response was not valid JSON.`
        );
      }

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Authentication required or session expired.");
        }
        if (response.status === 403) {
          throw new Error(
            (data as unknown as ApiError)?.message ||
              "Permission denied: CONFIGURATION:MANAGE permission is required to execute imports."
          );
        }
        if (response.status === 409) {
          throw new Error(
            (data as unknown as ApiError).message ||
              "Conflict: The import job is either currently executing or not in a VALIDATED state."
          );
        }

        throw new Error(
          (data as unknown as ApiError).message ||
            (data as unknown as ApiError).error ||
            `Execution failed with HTTP ${response.status}.`
        );
      }

      data.errors = Array.isArray(data.errors) ? data.errors : [];
      setExecutionResult(data);
      setShowConfirmModal(false);
      setSuccess(
        data.status === "COMPLETED"
          ? `Import executed successfully! ${data.processedRows} record(s) created.`
          : `Import execution completed with status ${data.status}. ${data.processedRows} created, ${data.failedRows} failed.`
      );
    } catch (err) {
      console.error("EXECUTE IMPORT ERROR:", err);
      setExecutionError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred during import execution."
      );
    } finally {
      setExecuting(false);
    }
  }

  // Filter errors for the preview table
  const filteredErrors = useMemo(() => {
    if (!validationResult?.errors) return [];

    return validationResult.errors.filter((item) => {
      // Filter by column
      if (
        errorColumnFilter !== "ALL" &&
        (item.columnName || "UNMAPPED") !== errorColumnFilter
      ) {
        return false;
      }

      // Filter by search query
      if (errorSearch.trim()) {
        const query = errorSearch.toLowerCase().trim();
        const rowMatch =
          item.rowNumber !== null &&
          item.rowNumber !== undefined &&
          String(item.rowNumber).includes(query);
        const colMatch = (item.columnName || "").toLowerCase().includes(query);
        const codeMatch = (item.errorCode || "").toLowerCase().includes(query);
        const msgMatch = (item.errorMessage || "").toLowerCase().includes(query);
        const valMatch = (item.sourceValue || "").toLowerCase().includes(query);

        return rowMatch || colMatch || codeMatch || msgMatch || valMatch;
      }

      return true;
    });
  }, [validationResult, errorSearch, errorColumnFilter]);

  // Unique columns present in validation errors
  const errorColumns = useMemo(() => {
    if (!validationResult?.errors) return [];
    const set = new Set<string>();
    validationResult.errors.forEach((err) => {
      if (err.columnName) set.add(err.columnName);
    });
    return Array.from(set).sort();
  }, [validationResult]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f5f7fb]">
        <div className="mx-auto max-w-[1200px] px-6 py-12">
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
            <p className="mt-4 text-sm text-slate-500">
              Loading import mapping...
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div>
              <p className="text-xs font-bold tracking-[0.16em] text-blue-600">
                MAX ERP
              </p>
              <p className="text-sm font-semibold text-slate-700">
                {businessObject?.name || "Business Object"} Import
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() =>
                router.push(
                  `/configuration/business-objects/${businessObjectId}/imports`
                )
              }
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              Import History
            </button>

            <button
              type="button"
              onClick={() =>
                router.push(
                  `/configuration/business-objects/${businessObjectId}`
                )
              }
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              ← Back to Business Object
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1200px] px-6 py-8">
        {/* Navigation Tabs / Stepper */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <nav className="flex space-x-2" aria-label="Import Workflow Steps">
            <button
              type="button"
              onClick={() => setActiveTab("mapping")}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                activeTab === "mapping"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              <span>1. Column Mapping</span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                  activeTab === "mapping"
                    ? "bg-blue-700 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {mappedCount}/{sourceColumns.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (validationResult) {
                  setActiveTab("preview");
                }
              }}
              disabled={!validationResult}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                activeTab === "preview"
                  ? "bg-blue-600 text-white shadow-sm"
                  : validationResult
                  ? "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                  : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60"
              }`}
            >
              <span>2. Validation Preview</span>
              {validationResult ? (
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                    validationResult.invalidRows === 0
                      ? activeTab === "preview"
                        ? "bg-emerald-700 text-white"
                        : "bg-emerald-100 text-emerald-700"
                      : activeTab === "preview"
                      ? "bg-rose-700 text-white"
                      : "bg-rose-100 text-rose-700"
                  }`}
                >
                  {validationResult.validRows}/{validationResult.totalRows} valid
                </span>
              ) : (
                <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs text-slate-500">
                  Not validated
                </span>
              )}
            </button>
          </nav>

          {/* Quick Action in Header */}
          {activeTab === "mapping" ? (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleValidateImport}
                disabled={validating || saving || sourceColumns.length === 0}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {validating && (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                )}
                <span>
                  {validating ? "Saving & Validating..." : "Validate Import"}
                </span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              {validationResult &&
                validationResult.validRows > 0 &&
                !executionResult && (
                  <button
                    type="button"
                    onClick={() => {
                      setExecutionError("");
                      setShowConfirmModal(true);
                    }}
                    disabled={executing || validating}
                    className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span>⚡ Execute Import ({validationResult.validRows})</span>
                  </button>
                )}
            </div>
          )}
        </div>

        {/* Global Feedback Banners */}
        {error && (
          <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 shadow-sm">
            <p className="font-semibold">Operation failed</p>
            <p className="mt-1">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 shadow-sm">
            {success}
          </div>
        )}

        {/* VIEW 1: COLUMN MAPPING */}
        {activeTab === "mapping" && (
          <div>
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                  Map File Columns
                </h1>
                <p className="mt-1.5 text-sm text-slate-500">
                  Associate each column from your uploaded file with a field
                  defined on the business object.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={autoMap}
                  disabled={saving || validating || fields.length === 0}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  ⚡ Auto-Map Matches
                </button>
              </div>
            </div>

            {/* Duplicate Field Warning Banner */}
            {Object.keys(duplicateFieldMap).length > 0 && (
              <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 shadow-sm">
                <p className="font-semibold">
                  ⚠️ Duplicate Target Field Mappings Detected
                </p>
                <p className="mt-1 text-xs text-amber-800">
                  The same business object field has been assigned to multiple
                  source columns. Please ensure each field is mapped at most
                  once:
                </p>
                <ul className="mt-2 list-disc pl-5 text-xs">
                  {Object.entries(duplicateFieldMap).map(([fid, cols]) => {
                    const fLabel = fieldById[fid]?.label || fid;
                    return (
                      <li key={fid}>
                        <strong>{fLabel}</strong> is mapped by columns:{" "}
                        <span className="font-mono">{cols.join(", ")}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* Mapping Table */}
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between bg-slate-50/50">
                <h2 className="text-base font-bold text-slate-900">
                  Column Mappings
                </h2>
                <span className="text-xs text-slate-500">
                  Total File Columns: <strong>{sourceColumns.length}</strong>
                </span>
              </div>

              {sourceColumns.length === 0 ? (
                <div className="p-12 text-center text-sm text-slate-500">
                  No columns were found in the uploaded import file.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px] text-left text-sm">
                    <thead className="border-b border-slate-200 bg-slate-50">
                      <tr>
                        <th className="px-6 py-3.5 font-semibold text-slate-600">
                          Source Column (File)
                        </th>
                        <th className="px-6 py-3.5 font-semibold text-slate-600">
                          Destination Field (Business Object)
                        </th>
                        <th className="px-6 py-3.5 font-semibold text-slate-600">
                          Type & Constraints
                        </th>
                        <th className="px-6 py-3.5 font-semibold text-slate-600">
                          Status
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {sourceColumns.map((column) => {
                        const selectedFieldId = mapping[column] || "";
                        const selectedField = fieldById[selectedFieldId];
                        const isDuplicate =
                          selectedFieldId &&
                          duplicateFieldMap[selectedFieldId]?.length > 1;

                        return (
                          <tr key={column} className="hover:bg-slate-50">
                            <td className="px-6 py-4">
                              <span className="font-mono text-sm font-medium text-slate-800">
                                {column}
                              </span>
                            </td>

                            <td className="px-6 py-4">
                              <select
                                value={selectedFieldId}
                                onChange={(event) =>
                                  updateMapping(column, event.target.value)
                                }
                                disabled={saving || validating || executing}
                                className={`h-10 w-full max-w-[420px] rounded-lg border bg-white px-3 text-sm text-slate-700 outline-none focus:ring-1 ${
                                  isDuplicate
                                    ? "border-amber-400 focus:border-amber-500 focus:ring-amber-500"
                                    : "border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                                }`}
                              >
                                <option value="">— Not mapped —</option>

                                {fields.map((field) => (
                                  <option key={field.id} value={field.id}>
                                    {field.label} ({field.fieldKey})
                                    {field.required ? " *" : ""}
                                  </option>
                                ))}
                              </select>

                              {isDuplicate && (
                                <p className="mt-1 text-xs text-amber-600">
                                  Duplicate: also mapped in other column(s)
                                </p>
                              )}
                            </td>

                            <td className="px-6 py-4">
                              {selectedField ? (
                                <div className="flex items-center gap-1.5">
                                  <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                                    {selectedField.fieldType}
                                  </span>
                                  {selectedField.required && (
                                    <span className="rounded-md bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-600">
                                      Required
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-slate-400">—</span>
                              )}
                            </td>

                            <td className="px-6 py-4">
                              {selectedFieldId ? (
                                <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                                  Mapped
                                </span>
                              ) : (
                                <span className="rounded-md bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                                  Unmapped
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Bottom Action Footer */}
              <div className="flex flex-col gap-4 border-t border-slate-200 bg-slate-50/70 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-5 text-sm">
                  <span className="text-slate-500">
                    Mapped:
                    <strong className="ml-1 text-emerald-700">
                      {mappedCount}
                    </strong>
                  </span>

                  <span className="text-slate-500">
                    Unmapped:
                    <strong className="ml-1 text-amber-700">
                      {unmappedCount}
                    </strong>
                  </span>

                  <span className="text-slate-400">|</span>

                  <span className="text-xs text-slate-500 self-center">
                    Validation saves column mapping automatically.
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={saveMapping}
                    disabled={saving || validating || executing}
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save Mapping Only"}
                  </button>

                  {validationResult && (
                    <button
                      type="button"
                      onClick={() => setActiveTab("preview")}
                      className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                    >
                      View Preview →
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleValidateImport}
                    disabled={validating || saving || executing || sourceColumns.length === 0}
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {validating && (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    )}
                    <span>
                      {validating
                        ? "Saving & Validating..."
                        : "Validate Import"}
                    </span>
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* VIEW 2: VALIDATION PREVIEW & EXECUTION RESULTS */}
        {activeTab === "preview" && validationResult && (
          <div>
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                  Import Validation Preview
                </h1>
                <p className="mt-1.5 text-sm text-slate-500">
                  Review validation metrics and row-level issues before
                  executing.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab("mapping")}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                >
                  ← Back to Mapping
                </button>

                <button
                  type="button"
                  onClick={handleValidateImport}
                  disabled={validating || saving || executing}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {validating && (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  )}
                  <span>{validating ? "Validating..." : "Re-validate"}</span>
                </button>

                {validationResult.validRows > 0 && !executionResult && (
                  <button
                    type="button"
                    onClick={() => {
                      setExecutionError("");
                      setShowConfirmModal(true);
                    }}
                    disabled={validating || saving || executing}
                    className="flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span>⚡ Execute Import ({validationResult.validRows})</span>
                  </button>
                )}
              </div>
            </div>

            {/* Execution Result Banner & Metrics (Rendered after execution) */}
            {executionResult && (
              <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div
                  className={`border-b px-6 py-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between ${
                    executionResult.status === "COMPLETED"
                      ? "border-emerald-200 bg-emerald-50/70"
                      : executionResult.status === "COMPLETED_WITH_ERRORS"
                      ? "border-amber-200 bg-amber-50/70"
                      : "border-rose-200 bg-rose-50/70"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center rounded-md px-3 py-1 text-xs font-bold ${
                        executionResult.status === "COMPLETED"
                          ? "bg-emerald-100 text-emerald-800"
                          : executionResult.status === "COMPLETED_WITH_ERRORS"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {executionResult.status}
                    </span>
                    <h2 className="text-base font-bold text-slate-900">
                      {executionResult.status === "COMPLETED"
                        ? "Import Execution Succeeded"
                        : executionResult.status === "COMPLETED_WITH_ERRORS"
                        ? "Import Completed with Issues"
                        : "Import Execution Failed"}
                    </h2>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          `/configuration/business-objects/${businessObjectId}/records`
                        )
                      }
                      className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700"
                    >
                      View Created Records →
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          `/configuration/business-objects/${businessObjectId}/imports`
                        )
                      }
                      className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                    >
                      Import History
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          `/configuration/business-objects/${businessObjectId}/imports/new`
                        )
                      }
                      className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                    >
                      Import Another File
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
                      <p className="text-xs font-semibold text-slate-500 uppercase">
                        Total Rows
                      </p>
                      <p className="mt-1 text-2xl font-bold text-slate-900">
                        {executionResult.totalRows}
                      </p>
                    </div>

                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 text-center">
                      <p className="text-xs font-semibold text-emerald-700 uppercase">
                        Processed / Created
                      </p>
                      <p className="mt-1 text-2xl font-bold text-emerald-700">
                        {executionResult.processedRows}
                      </p>
                    </div>

                    <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4 text-center">
                      <p className="text-xs font-semibold text-rose-700 uppercase">
                        Failed Rows
                      </p>
                      <p className="mt-1 text-2xl font-bold text-rose-700">
                        {executionResult.failedRows}
                      </p>
                    </div>

                    <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 text-center">
                      <p className="text-xs font-semibold text-amber-700 uppercase">
                        Duplicate Rows
                      </p>
                      <p className="mt-1 text-2xl font-bold text-amber-700">
                        {executionResult.duplicateRows}
                      </p>
                    </div>
                  </div>

                  {executionResult.errors && executionResult.errors.length > 0 && (
                    <div className="mt-6 border-t border-slate-200 pt-6">
                      <h3 className="text-sm font-bold text-slate-900 mb-3">
                        Execution Errors ({executionResult.errors.length})
                      </h3>
                      <div className="max-h-60 overflow-y-auto rounded-xl border border-slate-200 text-xs">
                        <table className="w-full text-left">
                          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                            <tr>
                              <th className="px-4 py-2 font-semibold">Row #</th>
                              <th className="px-4 py-2 font-semibold">Column</th>
                              <th className="px-4 py-2 font-semibold">Code</th>
                              <th className="px-4 py-2 font-semibold">Message</th>
                              <th className="px-4 py-2 font-semibold">Value</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {executionResult.errors.map((err, idx) => (
                              <tr key={idx} className="hover:bg-slate-50">
                                <td className="px-4 py-2 font-medium text-slate-900">
                                  {err.rowNumber ?? "—"}
                                </td>
                                <td className="px-4 py-2 font-mono text-slate-600">
                                  {err.columnName ?? "—"}
                                </td>
                                <td className="px-4 py-2 text-rose-600 font-semibold">
                                  {err.errorCode ?? "—"}
                                </td>
                                <td className="px-4 py-2 text-slate-700">
                                  {err.errorMessage || "Execution error"}
                                </td>
                                <td className="px-4 py-2 font-mono text-slate-500">
                                  {err.sourceValue || "—"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Validation Metrics Grid */}
            <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {/* Total Rows */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Total Rows
                </p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {validationResult.totalRows}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Rows in parsed file
                </p>
              </div>

              {/* Valid Rows */}
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                  Valid Rows
                </p>
                <p className="mt-2 text-3xl font-bold text-emerald-700">
                  {validationResult.validRows}
                </p>
                <p className="mt-1 text-xs text-emerald-600">
                  Passed all constraints
                </p>
              </div>

              {/* Invalid Rows */}
              <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-rose-700">
                  Invalid Rows
                </p>
                <p className="mt-2 text-3xl font-bold text-rose-700">
                  {validationResult.invalidRows}
                </p>
                <p className="mt-1 text-xs text-rose-600">
                  Contain one or more errors
                </p>
              </div>

              {/* Duplicate Rows */}
              <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">
                  Duplicate Rows
                </p>
                <p className="mt-2 text-3xl font-bold text-amber-700">
                  {validationResult.duplicateRows}
                </p>
                <p className="mt-1 text-xs text-amber-600">
                  Duplicate entries identified
                </p>
              </div>
            </div>

            {/* Overall Status Banner */}
            {validationResult.totalRows === 0 ? (
              <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-base font-semibold text-slate-800">
                  No data rows to validate
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  The uploaded file does not contain any data rows. Check your
                  source file and upload again.
                </p>
              </div>
            ) : validationResult.invalidRows === 0 ? (
              <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                      <svg
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-emerald-900">
                        All rows are valid and ready for import
                      </h3>
                      <p className="mt-1 text-sm text-emerald-800">
                        All {validationResult.totalRows} row(s) passed data type
                        checks, required field constraints, and value validation.
                      </p>
                      <p className="mt-2 text-xs font-medium text-emerald-700">
                        {executionResult
                          ? "Execution has been completed for this import job."
                          : "Click 'Execute Import' to create records in the database."}
                      </p>
                    </div>
                  </div>

                  {!executionResult && validationResult.validRows > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setExecutionError("");
                        setShowConfirmModal(true);
                      }}
                      disabled={executing || validating}
                      className="flex-shrink-0 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      ⚡ Execute Import →
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-6 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-700">
                      <svg
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-rose-900">
                        Validation issues detected in{" "}
                        {validationResult.invalidRows} of{" "}
                        {validationResult.totalRows} rows
                      </h3>
                      <p className="mt-1 text-sm text-rose-800">
                        Some rows contain invalid data formats or are missing
                        required fields. Review the error breakdown below, or
                        return to mapping to correct column associations.
                      </p>
                      {validationResult.validRows > 0 && !executionResult && (
                        <p className="mt-2 text-xs font-medium text-amber-800">
                          {validationResult.validRows} valid row(s) can still be
                          executed, while invalid rows will be skipped.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveTab("mapping")}
                      className="flex-shrink-0 rounded-lg border border-rose-300 bg-white px-4 py-2 text-sm font-semibold text-rose-700 shadow-sm hover:bg-rose-50"
                    >
                      ← Return to Mapping
                    </button>

                    {validationResult.validRows > 0 && !executionResult && (
                      <button
                        type="button"
                        onClick={() => {
                          setExecutionError("");
                          setShowConfirmModal(true);
                        }}
                        disabled={executing || validating}
                        className="flex-shrink-0 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Execute Valid Rows ({validationResult.validRows}) →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Error Breakdown Section */}
            {validationResult.errors && validationResult.errors.length > 0 ? (
              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-6 py-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">
                        Row-Level Validation Errors
                      </h2>
                      <p className="mt-1 text-sm text-slate-500">
                        Showing {filteredErrors.length} of{" "}
                        {validationResult.errors.length} detected issue
                        {validationResult.errors.length === 1 ? "" : "s"}
                      </p>
                    </div>

                    {/* Filter and Search Controls */}
                    <div className="flex flex-wrap items-center gap-3">
                      {errorColumns.length > 0 && (
                        <select
                          value={errorColumnFilter}
                          onChange={(e) => setErrorColumnFilter(e.target.value)}
                          className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none focus:border-blue-500"
                        >
                          <option value="ALL">All Columns</option>
                          {errorColumns.map((col) => (
                            <option key={col} value={col}>
                              Column: {col}
                            </option>
                          ))}
                        </select>
                      )}

                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search errors..."
                          value={errorSearch}
                          onChange={(e) => setErrorSearch(e.target.value)}
                          className="h-9 w-48 rounded-lg border border-slate-200 bg-white pl-8 pr-3 text-xs text-slate-700 outline-none focus:border-blue-500 sm:w-60"
                        />
                        <svg
                          className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px] text-left text-sm">
                    <thead className="border-b border-slate-200 bg-slate-50">
                      <tr>
                        <th className="px-6 py-3 font-semibold text-slate-600">
                          Row #
                        </th>
                        <th className="px-6 py-3 font-semibold text-slate-600">
                          Source Column
                        </th>
                        <th className="px-6 py-3 font-semibold text-slate-600">
                          Error Code
                        </th>
                        <th className="px-6 py-3 font-semibold text-slate-600">
                          Error Message
                        </th>
                        <th className="px-6 py-3 font-semibold text-slate-600">
                          Source Value
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {filteredErrors.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-6 py-10 text-center text-sm text-slate-500"
                          >
                            No errors match your filter criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredErrors.map((errItem, idx) => (
                          <tr
                            key={`${errItem.rowNumber}-${errItem.columnName}-${idx}`}
                            className="hover:bg-slate-50"
                          >
                            <td className="px-6 py-3.5 font-medium text-slate-900">
                              {errItem.rowNumber !== null &&
                              errItem.rowNumber !== undefined ? (
                                <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700">
                                  Row {errItem.rowNumber}
                                </span>
                              ) : (
                                <span className="text-slate-400">—</span>
                              )}
                            </td>

                            <td className="px-6 py-3.5">
                              {errItem.columnName ? (
                                <span className="font-mono text-xs font-semibold text-slate-800">
                                  {errItem.columnName}
                                </span>
                              ) : (
                                <span className="text-xs italic text-slate-500">
                                  (Entire Row / Unmapped)
                                </span>
                              )}
                            </td>

                            <td className="px-6 py-3.5">
                              {errItem.errorCode ? (
                                <span className="inline-flex rounded-md bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700">
                                  {errItem.errorCode}
                                </span>
                              ) : (
                                <span className="text-slate-400">—</span>
                              )}
                            </td>

                            <td className="px-6 py-3.5 text-slate-700">
                              {errItem.errorMessage || "Validation failed."}
                            </td>

                            <td className="px-6 py-3.5">
                              {errItem.sourceValue !== null &&
                              errItem.sourceValue !== undefined &&
                              errItem.sourceValue !== "" ? (
                                <span className="rounded bg-slate-100 px-2 py-1 font-mono text-xs text-slate-700 max-w-[200px] truncate inline-block">
                                  {errItem.sourceValue}
                                </span>
                              ) : (
                                <span className="text-xs italic text-slate-400">
                                  — (empty)
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/60 px-6 py-3 text-xs text-slate-500">
                  <span>
                    Total error records reported:{" "}
                    <strong>{validationResult.errors.length}</strong>
                  </span>
                  <span>
                    Valid rows can be executed into the database; invalid rows
                    will be skipped.
                  </span>
                </div>
              </section>
            ) : validationResult.invalidRows > 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                <p className="text-sm font-semibold text-slate-800">
                  Invalid rows were detected ({validationResult.invalidRows}),
                  but no detailed error messages were returned by the server.
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Try re-validating or return to column mapping to inspect
                  required fields.
                </p>
              </div>
            ) : null}

            {/* Bottom Actions Bar */}
            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={() => setActiveTab("mapping")}
                className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
              >
                ← Back to Column Mapping
              </button>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleValidateImport}
                  disabled={validating || saving || executing}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {validating && (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  )}
                  <span>
                    {validating ? "Re-validating..." : "Re-run Validation"}
                  </span>
                </button>

                {validationResult.validRows > 0 && !executionResult && (
                  <button
                    type="button"
                    onClick={() => {
                      setExecutionError("");
                      setShowConfirmModal(true);
                    }}
                    disabled={validating || saving || executing}
                    className="flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span>Execute Import ({validationResult.validRows} rows) →</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Execution Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-150">
              {/* Modal Header */}
              <div className="border-b border-slate-200 bg-slate-50/70 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      Confirm Import Execution
                    </h3>
                    <p className="text-xs text-slate-500">
                      Ready to insert validated records into the database.
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5">
                {/* Error Banner inside modal if execution failed */}
                {executionError && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800">
                    <p className="font-bold">Execution Failed</p>
                    <p className="mt-1">{executionError}</p>
                  </div>
                )}

                {/* Target info */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-2.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Target Business Object:</span>
                    <strong className="text-slate-900 font-semibold">
                      {businessObject?.name || "Business Object"}
                      {businessObject?.objectKey ? ` (${businessObject.objectKey})` : ""}
                    </strong>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">Records to Create:</span>
                    <strong className="text-emerald-700 font-bold">
                      {validationResult?.validRows ?? 0} record(s)
                    </strong>
                  </div>

                  {((validationResult?.invalidRows ?? 0) > 0 ||
                    (validationResult?.duplicateRows ?? 0) > 0) && (
                    <div className="flex justify-between text-xs text-slate-500 pt-1 border-t border-slate-200">
                      <span>Rows to Skip:</span>
                      <span className="text-slate-700">
                        {validationResult?.invalidRows ?? 0} invalid,{" "}
                        {validationResult?.duplicateRows ?? 0} duplicate
                      </span>
                    </div>
                  )}
                </div>

                {/* Explicit Warning */}
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
                  <div className="flex items-start gap-2.5">
                    <svg
                      className="h-5 w-5 flex-shrink-0 text-amber-600 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    <div>
                      <p className="font-bold">Permanent Database Mutation</p>
                      <p className="mt-1 text-amber-800">
                        Confirming will create real records in the MAX ERP
                        database. This operation cannot be automatically undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50/70 px-6 py-4">
                <button
                  type="button"
                  onClick={() => {
                    if (!executing) {
                      setShowConfirmModal(false);
                      setExecutionError("");
                    }
                  }}
                  disabled={executing}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleExecuteImport}
                  disabled={executing}
                  className="flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {executing && (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  )}
                  <span>
                    {executing ? "Executing Import..." : "Confirm & Execute"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
