"use client";

import { useEffect, useState } from "react";

type BusinessObject = {
  id: string;
  objectKey: string;
  name: string;
};

type Field = {
  id: string;
  fieldKey: string;
  label: string;
  fieldType: string;
};

type ReferenceConfiguration = {
  id: string;
  fieldId: string;
  targetBusinessObjectId: string;
  displayFieldId: string | null;
  allowMultiple: boolean;
  allowCreate: boolean;
};

type ReferenceFieldSettingsProps = {
  businessObjectId: string;
  fieldId?: string;
  fieldType: string;
};

export default function ReferenceFieldSettings({
  businessObjectId,
  fieldId,
  fieldType,
}: ReferenceFieldSettingsProps) {
  const [businessObjects, setBusinessObjects] = useState<BusinessObject[]>([]);
  const [targetFields, setTargetFields] = useState<Field[]>([]);
  const [configuration, setConfiguration] =
    useState<ReferenceConfiguration | null>(null);

  const [targetBusinessObjectId, setTargetBusinessObjectId] = useState("");
  const [displayFieldId, setDisplayFieldId] = useState("");
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [allowCreate, setAllowCreate] = useState(false);

  const [loading, setLoading] = useState(false);
  const [loadingObjects, setLoadingObjects] = useState(false);
  const [loadingFields, setLoadingFields] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (fieldType !== "REFERENCE" || !fieldId) {
      return;
    }

    loadBusinessObjects();
    loadConfiguration();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fieldId, fieldType]);

  async function loadBusinessObjects() {
    setLoadingObjects(true);
    setError("");

    try {
      const response = await fetch(
        "/api/configuration/business-objects"
      );

      if (!response.ok) {
        throw new Error("Unable to load business objects.");
      }

      const data = await response.json();

      const objects = Array.isArray(data)
        ? data
        : Array.isArray(data.content)
          ? data.content
          : [];

      setBusinessObjects(objects);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load business objects."
      );
    } finally {
      setLoadingObjects(false);
    }
  }

  async function loadConfiguration() {
    if (!fieldId) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/configuration/business-objects/${businessObjectId}/fields/${fieldId}/reference`
      );

      if (response.status === 404) {
        setConfiguration(null);
        setTargetBusinessObjectId("");
        setDisplayFieldId("");
        setAllowMultiple(false);
        setAllowCreate(false);
        return;
      }

      if (!response.ok) {
        throw new Error("Unable to load reference configuration.");
      }

      const data: ReferenceConfiguration = await response.json();

      setConfiguration(data);
      setTargetBusinessObjectId(data.targetBusinessObjectId);
      setDisplayFieldId(data.displayFieldId ?? "");
      setAllowMultiple(data.allowMultiple);
      setAllowCreate(data.allowCreate);

      await loadTargetFields(data.targetBusinessObjectId);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load reference configuration."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadTargetFields(targetObjectId: string) {
    if (!targetObjectId) {
      setTargetFields([]);
      return;
    }

    setLoadingFields(true);

    try {
      const response = await fetch(
        `/api/configuration/business-objects/${targetObjectId}/fields`
      );

      if (!response.ok) {
        throw new Error("Unable to load target object fields.");
      }

      const data = await response.json();

      const fields = Array.isArray(data)
        ? data
        : Array.isArray(data.content)
          ? data.content
          : [];

      setTargetFields(fields);
    } catch (err) {
      setTargetFields([]);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load target object fields."
      );
    } finally {
      setLoadingFields(false);
    }
  }

  async function handleTargetObjectChange(
    value: string
  ) {
    setTargetBusinessObjectId(value);
    setDisplayFieldId("");
    setTargetFields([]);
    setError("");
    setSuccess("");

    await loadTargetFields(value);
  }

  async function saveConfiguration() {
    if (!fieldId) {
      setError("Save the field first, then configure its reference.");
      return;
    }

    if (!targetBusinessObjectId) {
      setError("Please select a target business object.");
      return;
    }

    if (targetFields.length > 0 && !displayFieldId) {
      setError("Please select a display field.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        targetBusinessObjectId,
        displayFieldId: displayFieldId || null,
        allowMultiple,
        allowCreate,
      };

      const url = configuration
        ? `/api/configuration/business-objects/${businessObjectId}/fields/${fieldId}/reference?referenceId=${encodeURIComponent(configuration.id)}`
        : `/api/configuration/business-objects/${businessObjectId}/fields/${fieldId}/reference`;

      const response = await fetch(url, {
        method: configuration ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = await response.text();
        let message = "Unable to save reference configuration.";

        try {
          const parsed = JSON.parse(body);
          message = parsed.message ?? parsed.error ?? message;
        } catch {
          if (body) {
            message = body;
          }
        }

        throw new Error(message);
      }

      const data: ReferenceConfiguration =
        await response.json();

      setConfiguration(data);
      setTargetBusinessObjectId(data.targetBusinessObjectId);
      setDisplayFieldId(data.displayFieldId ?? "");
      setAllowMultiple(data.allowMultiple);
      setAllowCreate(data.allowCreate);
      setSuccess("Reference configuration saved successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save reference configuration."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteConfiguration() {
    if (!fieldId || !configuration) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `/api/configuration/business-objects/${businessObjectId}/fields/${fieldId}/reference?referenceId=${encodeURIComponent(configuration.id)}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const body = await response.text();
        let message = "Unable to remove reference configuration.";

        try {
          const parsed = JSON.parse(body);
          message = parsed.message ?? parsed.error ?? message;
        } catch {
          if (body) {
            message = body;
          }
        }

        throw new Error(message);
      }

      setConfiguration(null);
      setTargetBusinessObjectId("");
      setDisplayFieldId("");
      setAllowMultiple(false);
      setAllowCreate(false);
      setTargetFields([]);
      setSuccess("Reference configuration removed.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to remove reference configuration."
      );
    } finally {
      setSaving(false);
    }
  }

  if (fieldType !== "REFERENCE") {
    return null;
  }

  if (!fieldId) {
    return (
      <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4">
        <div className="text-sm font-semibold text-blue-900">
          Reference Configuration
        </div>
        <div className="mt-1 text-sm text-blue-700">
          Save the field first, then you can configure its reference.
        </div>
      </div>
    );
  }

  return (
    <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-5">
      <div className="mb-4">
        <div className="text-sm font-semibold text-slate-900">
          Reference Configuration
        </div>
        <div className="mt-1 text-xs text-slate-500">
          Connect this field to another MAX ERP Business Object.
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {success}
        </div>
      )}

      {loading ? (
        <div className="text-sm text-slate-500">
          Loading reference configuration...
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Target Business Object
            </label>

            <select
              value={targetBusinessObjectId}
              onChange={(event) =>
                handleTargetObjectChange(event.target.value)
              }
              disabled={loadingObjects || saving}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">
                {loadingObjects
                  ? "Loading business objects..."
                  : "Select a business object"}
              </option>

              {businessObjects
                .filter((object) => object.id !== businessObjectId)
                .map((object) => (
                  <option key={object.id} value={object.id}>
                    {object.name || object.objectKey}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Display Field
            </label>

            <select
              value={displayFieldId}
              onChange={(event) =>
                setDisplayFieldId(event.target.value)
              }
              disabled={
                !targetBusinessObjectId ||
                loadingFields ||
                saving
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">
                {!targetBusinessObjectId
                  ? "Select a target object first"
                  : loadingFields
                    ? "Loading fields..."
                    : "Select a display field"}
              </option>

              {targetFields.map((field) => (
                <option key={field.id} value={field.id}>
                  {field.label} ({field.fieldKey})
                </option>
              ))}
            </select>

            <div className="mt-1 text-xs text-slate-500">
              This field will be shown when users select a record.
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-3">
              <input
                type="checkbox"
                checked={allowMultiple}
                onChange={(event) =>
                  setAllowMultiple(event.target.checked)
                }
                disabled={saving}
                className="h-4 w-4 rounded border-slate-300"
              />

              <span>
                <span className="block text-sm font-semibold text-slate-700">
                  Allow Multiple
                </span>
                <span className="block text-xs text-slate-500">
                  Allow selecting multiple target records.
                </span>
              </span>
            </label>

            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-3">
              <input
                type="checkbox"
                checked={allowCreate}
                onChange={(event) =>
                  setAllowCreate(event.target.checked)
                }
                disabled={saving}
                className="h-4 w-4 rounded border-slate-300"
              />

              <span>
                <span className="block text-sm font-semibold text-slate-700">
                  Allow Create
                </span>
                <span className="block text-xs text-slate-500">
                  Allow users to create a target record from this field.
                </span>
              </span>
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={saveConfiguration}
              disabled={saving || loadingObjects || loadingFields}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : configuration
                  ? "Save Changes"
                  : "Save Reference"}
            </button>

            {configuration && (
              <button
                type="button"
                onClick={deleteConfiguration}
                disabled={saving}
                className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Remove Reference
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}