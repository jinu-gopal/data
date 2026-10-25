"use client";

import { ChangeEvent, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ImportRecordsPage() {
  const params = useParams<{ businessObjectId: string }>();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const businessObjectId =
    typeof params.businessObjectId === "string"
      ? params.businessObjectId
      : "";

  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    setError("");
    setMessage("");

    const selected = event.target.files?.[0] ?? null;

    if (!selected) {
      setFile(null);
      return;
    }

    const extension = selected.name.split(".").pop()?.toLowerCase();

    if (extension !== "csv" && extension !== "xlsx") {
      setFile(null);
      event.target.value = "";
      setError("Choose a CSV or XLSX file.");
      return;
    }

    setFile(selected);
  }

  async function uploadAndParse() {
    if (!businessObjectId || !file) {
      setError("Select a CSV or XLSX file first.");
      return;
    }

    setBusy(true);
    setError("");
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await fetch(
        `/api/configuration/business-objects/${businessObjectId}/imports`,
        {
          method: "POST",
          body: formData,
          cache: "no-store",
        }
      );

      const uploadText = await uploadResponse.text();
      let uploadData: Record<string, unknown> = {};

      try {
        uploadData = uploadText ? JSON.parse(uploadText) : {};
      } catch {
        throw new Error(
          `Upload returned an unexpected response (HTTP ${uploadResponse.status}).`
        );
      }

      if (!uploadResponse.ok) {
        throw new Error(
          String(
            uploadData.message ??
              uploadData.error ??
              `Upload failed (HTTP ${uploadResponse.status}).`
          )
        );
      }

      const importId = String(
        uploadData.importJobId ??
          uploadData.id ??
          uploadData.jobId ??
          ""
      );

      if (!importId) {
        throw new Error(
          "Upload succeeded, but the response did not contain an import job ID. Check the upload API response before retrying."
        );
      }

      setMessage("File uploaded. Parsing the file…");

      const parseResponse = await fetch(
        `/api/configuration/business-objects/${businessObjectId}/imports/${importId}/parse`,
        {
          method: "POST",
          cache: "no-store",
        }
      );

      const parseText = await parseResponse.text();
      let parseData: Record<string, unknown> = {};

      try {
        parseData = parseText ? JSON.parse(parseText) : {};
      } catch {
        throw new Error(
          `The file was uploaded, but the parse response was unexpected (HTTP ${parseResponse.status}). Import ID: ${importId}`
        );
      }

      if (!parseResponse.ok) {
        throw new Error(
          String(
            parseData.message ??
              parseData.error ??
              `Parsing failed (HTTP ${parseResponse.status}). Import ID: ${importId}`
          )
        );
      }

      router.push(
        `/configuration/business-objects/${businessObjectId}/imports/${importId}/mapping`
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <button
          type="button"
          onClick={() =>
            router.push(
              `/configuration/business-objects/${businessObjectId}`
            )
          }
          className="mb-6 text-sm font-medium text-slate-600 hover:text-slate-950"
        >
          ← Back to Business Object
        </button>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-7">
            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
              Data management
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
              Import Records
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Upload a CSV or Excel workbook, parse its columns, and map them
              to your business object fields before validating the records.
            </p>
          </div>

          <div
            className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center sm:p-10"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              const dropped = event.dataTransfer.files?.[0];

              if (dropped && fileInputRef.current) {
                const transfer = new DataTransfer();
                transfer.items.add(dropped);
                fileInputRef.current.files = transfer.files;
                fileInputRef.current.dispatchEvent(
                  new Event("change", { bubbles: true })
                );
              }
            }}
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-6 w-6"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 16V4m0 0L7 9m5-5 5 5M4 16.5v2A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5v-2"
                />
              </svg>
            </div>

            <h2 className="mt-4 text-base font-semibold text-slate-900">
              Select a file to import
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              CSV or XLSX format
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx"
              onChange={handleFileChange}
              className="sr-only"
              id="import-file"
            />

            <label
              htmlFor="import-file"
              className="mt-5 inline-flex cursor-pointer items-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-100"
            >
              Browse files
            </label>

            {file && (
              <div className="mx-auto mt-5 max-w-md rounded-lg border border-slate-200 bg-white p-3 text-left">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {file.name}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
            )}
          </div>

          {error && (
            <div
              role="alert"
              className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          {message && (
            <p role="status" className="mt-4 text-sm text-indigo-700">
              {message}
            </p>
          )}

          <div className="mt-7 flex flex-wrap justify-end gap-3">
            <button
              type="button"
              disabled={busy}
              onClick={() =>
                router.push(
                  `/configuration/business-objects/${businessObjectId}`
                )
              }
              className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={busy || !file}
              onClick={uploadAndParse}
              className="rounded-lg bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? "Processing…" : "Upload and Continue"}
            </button>
          </div>

          <p className="mt-5 text-xs leading-5 text-slate-500">
            Review your field mapping and validation results before importing
            records. Uploading a file does not itself create business records.
          </p>
        </section>
      </div>
    </main>
  );
}
