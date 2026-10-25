"use client";

import { useState } from "react";

type CreateBusinessObjectResponse = {
  id?: string;
  objectKey?: string;
  name?: string;
  message?: string;
  error?: string;
};

export default function CreateBusinessObjectButton() {
  const [open, setOpen] = useState(false);
  const [objectKey, setObjectKey] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function resetForm() {
    setObjectKey("");
    setName("");
    setDescription("");
    setError("");
  }

  function closeModal() {
    if (saving) return;
    setOpen(false);
    resetForm();
  }

  async function handleCreate() {
    setError("");

    const normalizedKey = objectKey.trim().toLowerCase();

    if (!normalizedKey) {
      setError("Object Key is required.");
      return;
    }

    if (!/^[a-z][a-z0-9_]*$/.test(normalizedKey)) {
      setError(
        "Object Key must start with a lowercase letter and contain only lowercase letters, numbers, and underscores."
      );
      return;
    }

    if (!name.trim()) {
      setError("Object Name is required.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/configuration/business-objects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          objectKey: normalizedKey,
          name: name.trim(),
          description: description.trim() || null,
        }),
      });

      const data =
        (await response.json().catch(() => null)) as
          | CreateBusinessObjectResponse
          | null;

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            `Unable to create Business Object (${response.status}).`
        );
      }

      window.location.reload();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create Business Object."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError("");
          setOpen(true);
        }}
        className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
      >
        + Create Business Object
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-business-object-title"
        >
          <div className="w-full max-w-xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
            <div className="border-b border-slate-100 px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600">
                    Configuration Model
                  </div>

                  <h2
                    id="create-business-object-title"
                    className="mt-2 text-2xl font-bold tracking-tight text-slate-950"
                  >
                    Create Business Object
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Define a reusable business entity for your MAX ERP
                    configuration model.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  aria-label="Close"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="space-y-5 px-6 py-6">
              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-100 text-sm font-bold text-red-700">
                      !
                    </div>

                    <div>
                      <div className="text-sm font-semibold text-red-900">
                        Unable to create Business Object
                      </div>
                      <div className="mt-1 text-sm leading-6 text-red-700">
                        {error}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label
                  htmlFor="business-object-name"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Object Name
                  <span className="ml-1 text-red-500">*</span>
                </label>

                <input
                  id="business-object-name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. User"
                  maxLength={150}
                  autoFocus
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />

                <p className="mt-2 text-xs text-slate-400">
                  The human-readable name displayed throughout MAX ERP.
                </p>
              </div>

              <div>
                <label
                  htmlFor="business-object-key"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Object Key
                  <span className="ml-1 text-red-500">*</span>
                </label>

                <input
                  id="business-object-key"
                  type="text"
                  value={objectKey}
                  onChange={(event) =>
                    setObjectKey(event.target.value.toLowerCase())
                  }
                  placeholder="e.g. user"
                  maxLength={100}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-mono text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />

                <p className="mt-2 text-xs text-slate-400">
                  Lowercase letters, numbers and underscores. Must start with a
                  letter.
                </p>
              </div>

              <div>
                <label
                  htmlFor="business-object-description"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Description
                  <span className="ml-1 text-xs font-normal text-slate-400">
                    Optional
                  </span>
                </label>

                <textarea
                  id="business-object-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Describe what this business object represents..."
                  maxLength={1000}
                  rows={4}
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />

                <div className="mt-2 text-right text-xs text-slate-400">
                  {description.length}/1000
                </div>
              </div>

              <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-sm font-bold text-blue-700">
                    i
                  </div>

                  <div>
                    <div className="text-sm font-semibold text-blue-900">
                      Draft configuration
                    </div>

                    <p className="mt-1 text-xs leading-5 text-blue-700">
                      New Business Objects start as Draft. You can configure
                      fields and relationships before they are published.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-4">
              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleCreate}
                disabled={saving}
                className="rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Creating..." : "Create Business Object"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}