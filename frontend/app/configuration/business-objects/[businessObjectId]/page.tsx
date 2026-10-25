"use client";

import MaxShell from "@/components/max/MaxShell";
import TypeSpecificFieldSettings from "@/components/configuration/fields/TypeSpecificFieldSettings";
import ChoiceFieldOptions from "@/components/configuration/fields/ChoiceFieldOptions";
import ReferenceFieldSettings from "@/components/configuration/fields/ReferenceFieldSettings";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Field = {
  id: string;
  fieldKey: string;
  label: string;
  description: string | null;
  fieldType: string;
  required: boolean;
  uniqueValue: boolean;
  readOnly: boolean;
  hidden: boolean;
  defaultValue: string | null;
  minValue: number | null;
  maxValue: number | null;
  validationPattern: string | null;
  displayOrder: number;
};

type ApiError = {
  error?: string;
  message?: string;
};

const FIELD_TYPES = [
  "TEXT",
  "LONG_TEXT",
  "NUMBER",
  "DECIMAL",
  "CURRENCY",
  "PERCENTAGE",
  "DATE",
  "DATETIME",
  "BOOLEAN",
  "CHOICE",
  "MULTI_CHOICE",
  "REFERENCE",
  "USER",
  "EMAIL",
  "PHONE",
  "ADDRESS",
  "FILE",
  "IMAGE",
  "FORMULA",
  "AUTO_NUMBER",
];

const FIELD_TYPE_LABELS: Record<string, string> = {
  TEXT: "Text",
  LONG_TEXT: "Long Text",
  NUMBER: "Number",
  DECIMAL: "Decimal",
  CURRENCY: "Currency",
  PERCENTAGE: "Percentage",
  DATE: "Date",
  DATETIME: "Date & Time",
  BOOLEAN: "Boolean",
  CHOICE: "Choice",
  MULTI_CHOICE: "Multi Choice",
  REFERENCE: "Reference",
  USER: "User",
  EMAIL: "Email",
  PHONE: "Phone",
  ADDRESS: "Address",
  FILE: "File",
  IMAGE: "Image",
  FORMULA: "Formula",
  AUTO_NUMBER: "Auto Number",
};

function PlusIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function SlidersIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M4 6h16M7 12h10M10 18h4" />
      <circle cx="8" cy="6" r="2" />
      <circle cx="16" cy="12" r="2" />
      <circle cx="12" cy="18" r="2" />
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="currentColor"
    >
      <circle cx="5" cy="12" r="1.7" />
      <circle cx="12" cy="12" r="1.7" />
      <circle cx="19" cy="12" r="1.7" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M4 7h16" />
      <path d="M10 11v6M14 11v6" />
      <path d="M6 7l1 13h10l1-13" />
      <path d="M9 7V4h6v3" />
    </svg>
  );
}
function parseApiError(
  text: string,
  status: number,
  action = "Request"
): string {
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

    return `${action} failed (${status}): ${text}`;
  } catch {
    return `${action} failed (${status}): ${text}`;
  }
}

type BusinessObject = {
  id: string;
  objectKey: string;
  name: string;
  description: string | null;
  status: string;
  versionNumber?: number;
};

export default function BusinessObjectPage() {
  const params = useParams();
  const router = useRouter();

  const businessObjectId =
    typeof params.businessObjectId === "string"
      ? params.businessObjectId
      : "";

  const [businessObject, setBusinessObject] =
    useState<BusinessObject | null>(null);
  const [showEditObject, setShowEditObject] =
    useState(false);
  const [editObjectName, setEditObjectName] =
    useState("");
  const [editObjectDescription, setEditObjectDescription] =
    useState("");
  const [showPublishModal, setShowPublishModal] =
    useState(false);
  const [publishing, setPublishing] =
    useState(false);

  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showAddField, setShowAddField] =
    useState(false);

  const [showEditField, setShowEditField] =
    useState(false);

  const [openActionsId, setOpenActionsId] =
    useState<string | null>(null);

  const [showDeleteField, setShowDeleteField] =
    useState(false);

  const [deletingField, setDeletingField] =
    useState<Field | null>(null);
  const [editingField, setEditingField] =
    useState<Field | null>(null);

  const [search, setSearch] = useState("");

  // ============================================================
  // FORM STATE
  // ============================================================

  const [fieldKey, setFieldKey] = useState("");
  const [label, setLabel] = useState("");
  const [description, setDescription] =
    useState("");

  const [fieldType, setFieldType] =
    useState("TEXT");

  const [required, setRequired] =
    useState(false);

  const [uniqueValue, setUniqueValue] =
    useState(false);

  const [readOnly, setReadOnly] =
    useState(false);

  const [hidden, setHidden] =
    useState(false);

  const [defaultValue, setDefaultValue] =
    useState("");

  const [minValue, setMinValue] =
    useState("");

  const [maxValue, setMaxValue] =
    useState("");

  const [validationPattern, setValidationPattern] =
    useState("");

  const [displayOrder, setDisplayOrder] =
    useState("0");

  // ============================================================
  // LOAD FIELDS
  // ============================================================

  async function loadFields() {
    if (!businessObjectId) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api/configuration/business-objects/${businessObjectId}/fields`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const text = await response.text();

      if (!response.ok) {
        throw new Error(
          parseApiError(
            text,
            response.status,
            "Load fields"
          )
        );
      }

      if (!text) {
        setFields([]);
        return;
      }

      try {
        const data = JSON.parse(text);

        setFields(
          Array.isArray(data) ? data : []
        );
      } catch {
        throw new Error(
          "The server returned invalid JSON."
        );
      }
    } catch (err) {
      console.error(
        "LOAD FIELDS ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load fields."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let ignore = false;

    if (!businessObjectId) {
      return;
    }

    fetch(
      `/api/configuration/business-objects/${businessObjectId}/fields`,
      {
        method: "GET",
        cache: "no-store",
      }
    )
      .then(async (response) => {
        const text = await response.text();

        if (!response.ok) {
          throw new Error(
            parseApiError(
              text,
              response.status,
              "Load fields"
            )
          );
        }

        if (!text) {
          return [];
        }

        return JSON.parse(text);
      })
      .then((data) => {
        if (!ignore) {
          setFields(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load fields."
          );
          setLoading(false);
        }
      });

    fetch(
      `/api/configuration/business-objects/${businessObjectId}`,
      {
        method: "GET",
        cache: "no-store",
      }
    )
      .then(async (response) => {
        if (!response.ok) return null;
        return response.json();
      })
      .then((data) => {
        if (!ignore && data) {
          setBusinessObject(data);
        }
      })
      .catch((err) => {
        console.error("Unable to load business object:", err);
      });

    return () => {
      ignore = true;
    };
  }, [businessObjectId]);

  // ============================================================
  // EDIT BUSINESS OBJECT
  // ============================================================

  function openEditObject() {
    if (!businessObject) return;
    setEditObjectName(businessObject.name);
    setEditObjectDescription(businessObject.description ?? "");
    setError("");
    setSuccess("");
    setShowEditObject(true);
  }

  async function updateBusinessObject(event: React.FormEvent) {
    event.preventDefault();
    if (!businessObject) return;

    const cleanName = editObjectName.trim();
    if (!cleanName) {
      setError("Business object name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        `/api/configuration/business-objects/${businessObjectId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            name: cleanName,
            description: editObjectDescription.trim() || null,
          }),
        }
      );

      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(
          parseApiError(
            responseText,
            response.status,
            "Update business object"
          )
        );
      }

      const updated = JSON.parse(responseText);
      setBusinessObject(updated);
      setShowEditObject(false);
      setSuccess(
        `Business object "${cleanName}" was updated successfully.`
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update business object."
      );
    } finally {
      setSaving(false);
    }
  }

  // ============================================================
  // PUBLISH BUSINESS OBJECT
  // ============================================================

  async function publishBusinessObject() {
    if (!businessObject) return;

    try {
      setPublishing(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        `/api/configuration/business-objects/${businessObjectId}/publish`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const text = await response.text();

      if (!response.ok) {
        throw new Error(
          parseApiError(
            text,
            response.status,
            "Publish business object"
          )
        );
      }

      const updated = JSON.parse(text);
      setBusinessObject(updated);
      setShowPublishModal(false);
      setSuccess(
        `Business object "${updated.name}" has been published and is now PUBLISHED.`
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to publish business object."
      );
    } finally {
      setPublishing(false);
    }
  }

  // ============================================================
  // RESET FORM
  // ============================================================

  function resetForm() {
    setFieldKey("");
    setLabel("");
    setDescription("");
    setFieldType("TEXT");
    setRequired(false);
    setUniqueValue(false);
    setReadOnly(false);
    setHidden(false);
    setDefaultValue("");
    setMinValue("");
    setMaxValue("");
    setValidationPattern("");
    setDisplayOrder("0");
  }

  // ============================================================
  // CLOSE ADD MODAL
  // ============================================================

  function closeAddModal() {
    if (saving) {
      return;
    }

    setShowAddField(false);
    resetForm();
    setError("");
  }

  // ============================================================
  // CLOSE EDIT MODAL
  // ============================================================

  function closeEditModal() {
    if (saving) {
      return;
    }

    setShowEditField(false);
    setEditingField(null);
    resetForm();
    setError("");
  }

  // ============================================================
  // OPEN EDIT MODAL
  // ============================================================

  function openEditField(field: Field) {
    setOpenActionsId(null);
    setEditingField(field);

    setFieldKey(field.fieldKey);
    setLabel(field.label);
    setDescription(
      field.description ?? ""
    );
    setFieldType(field.fieldType);

    setRequired(field.required);
    setUniqueValue(field.uniqueValue);
    setReadOnly(field.readOnly);
    setHidden(field.hidden);

    setDefaultValue(
      field.defaultValue ?? ""
    );

    setMinValue(
      field.minValue !== null
        ? String(field.minValue)
        : ""
    );

    setMaxValue(
      field.maxValue !== null
        ? String(field.maxValue)
        : ""
    );

    setValidationPattern(
      field.validationPattern ?? ""
    );

    setDisplayOrder(
      String(field.displayOrder)
    );

    setError("");
    setSuccess("");
    setShowEditField(true);
  }

  // ============================================================
  // CREATE FIELD
  // ============================================================

  async function createField(
    event: React.FormEvent
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const cleanKey =
      fieldKey.trim().toLowerCase();

    const cleanLabel = label.trim();

    if (!cleanKey) {
      setError("Field key is required.");
      return;
    }

    if (!/^[a-z][a-z0-9_]*$/.test(cleanKey)) {
      setError(
        "Field key must start with a lowercase letter and contain only lowercase letters, numbers, and underscores."
      );
      return;
    }

    if (!cleanLabel) {
      setError("Display label is required.");
      return;
    }

    try {
      setSaving(true);

      const parsedMinValue =
        minValue.trim() !== ""
          ? Number(minValue)
          : null;

      const parsedMaxValue =
        maxValue.trim() !== ""
          ? Number(maxValue)
          : null;

      if (
        parsedMinValue !== null &&
        Number.isNaN(parsedMinValue)
      ) {
        setError(
          "Minimum value must be a valid number."
        );
        return;
      }

      if (
        parsedMaxValue !== null &&
        Number.isNaN(parsedMaxValue)
      ) {
        setError(
          "Maximum value must be a valid number."
        );
        return;
      }

      if (
        parsedMinValue !== null &&
        parsedMaxValue !== null &&
        parsedMinValue > parsedMaxValue
      ) {
        setError(
          "Minimum value cannot be greater than maximum value."
        );
        return;
      }

      const parsedDisplayOrder =
        Number(displayOrder);

      if (
        Number.isNaN(parsedDisplayOrder) ||
        parsedDisplayOrder < 0
      ) {
        setError(
          "Display order must be zero or greater."
        );
        return;
      }

      const payload = {
        fieldKey: cleanKey,
        label: cleanLabel,
        description:
          description.trim() || null,
        fieldType,
        required,
        uniqueValue,
        readOnly,
        hidden,
        defaultValue:
          defaultValue.trim() || null,
        minValue: parsedMinValue,
        maxValue: parsedMaxValue,
        validationPattern:
          validationPattern.trim() || null,
        displayOrder: parsedDisplayOrder,
      };

      console.log(
        "MAX ERP CREATE FIELD PAYLOAD",
        payload
      );

      const response = await fetch(
        `/api/configuration/business-objects/${businessObjectId}/fields`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const responseText =
        await response.text();

      console.log(
        "MAX ERP CREATE FIELD RESPONSE",
        {
          status: response.status,
          statusText: response.statusText,
          body: responseText,
        }
      );

      if (!response.ok) {
        throw new Error(
          parseApiError(
            responseText,
            response.status,
            "Create field"
          )
        );
      }

      await loadFields();

      setShowAddField(false);
      resetForm();

      setSuccess(
        `"${cleanLabel}" was created successfully.`
      );
    } catch (err) {
      console.error(
        "CREATE FIELD ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to create field."
      );
    } finally {
      setSaving(false);
    }
  }

  // ============================================================

  // ============================================================
  // DELETE FIELD
  // ============================================================

  function openDeleteField(field: Field) {
    setOpenActionsId(null);
    setDeletingField(field);
    setShowDeleteField(true);
    setError("");
    setSuccess("");
  }

  function closeDeleteField() {
    setShowDeleteField(false);
    setDeletingField(null);
  }

  async function deleteField() {
    if (!deletingField) {
      return;
    }

    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const response = await fetch(
        `/api/configuration/business-objects/${businessObjectId}/fields?fieldId=${encodeURIComponent(deletingField.id)}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const body = await response.text();
        throw new Error(parseApiError(body, response.status));
      }

      await loadFields();

      const deletedLabel = deletingField.label;

      setShowDeleteField(false);
      setDeletingField(null);
      setSuccess(`Field "${deletedLabel}" deleted successfully.`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete the field."
      );
    } finally {
      setSaving(false);
    }
  }

  // UPDATE FIELD
  // ============================================================

  async function updateField(
    event: React.FormEvent
  ) {
    event.preventDefault();

    if (!editingField) {
      return;
    }

    setError("");
    setSuccess("");

    const cleanLabel = label.trim();

    if (!cleanLabel) {
      setError("Display label is required.");
      return;
    }

    const parsedMinValue =
      minValue.trim() !== ""
        ? Number(minValue)
        : null;

    const parsedMaxValue =
      maxValue.trim() !== ""
        ? Number(maxValue)
        : null;

    if (
      parsedMinValue !== null &&
      Number.isNaN(parsedMinValue)
    ) {
      setError(
        "Minimum value must be a valid number."
      );
      return;
    }

    if (
      parsedMaxValue !== null &&
      Number.isNaN(parsedMaxValue)
    ) {
      setError(
        "Maximum value must be a valid number."
      );
      return;
    }

    if (
      parsedMinValue !== null &&
      parsedMaxValue !== null &&
      parsedMinValue > parsedMaxValue
    ) {
      setError(
        "Minimum value cannot be greater than maximum value."
      );
      return;
    }

    const parsedDisplayOrder =
      Number(displayOrder);

    if (
      Number.isNaN(parsedDisplayOrder) ||
      parsedDisplayOrder < 0
    ) {
      setError(
        "Display order must be zero or greater."
      );
      return;
    }

    try {
      setSaving(true);

      const payload = {
        label: cleanLabel,

        description:
          description.trim() || null,

        fieldType,

        required,

        uniqueValue,

        readOnly,

        hidden,

        defaultValue:
          defaultValue.trim() || null,

        minValue:
          parsedMinValue,

        maxValue:
          parsedMaxValue,

        validationPattern:
          validationPattern.trim() || null,

        displayOrder:
          parsedDisplayOrder,
      };

      console.log(
        "MAX ERP UPDATE FIELD PAYLOAD",
        payload
      );

      const response = await fetch(
        `/api/configuration/business-objects/${businessObjectId}/fields?fieldId=${encodeURIComponent(
          editingField.id
        )}`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const responseText =
        await response.text();

      console.log(
        "MAX ERP UPDATE FIELD RESPONSE",
        {
          status: response.status,
          statusText: response.statusText,
          body: responseText,
        }
      );

      if (!response.ok) {
        throw new Error(
          parseApiError(
            responseText,
            response.status,
            "Update field"
          )
        );
      }

      await loadFields();

      setShowEditField(false);
      setEditingField(null);
      resetForm();

      setSuccess(
        `"${cleanLabel}" was updated successfully.`
      );
    } catch (err) {
      console.error(
        "UPDATE FIELD ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to update field."
      );
    } finally {
      setSaving(false);
    }
  }

  // ============================================================
  // FILTER
  // ============================================================

  const filteredFields =
    fields.filter((field) => {
      const query =
        search.trim().toLowerCase();

      if (!query) {
        return true;
      }

      return (
        field.label
          .toLowerCase()
          .includes(query) ||
        field.fieldKey
          .toLowerCase()
          .includes(query) ||
        field.fieldType
          .toLowerCase()
          .includes(query)
      );
    });

  const requiredCount =
    fields.filter(
      (field) => field.required
    ).length;

  return (
    <MaxShell name="Enterprise Admin" email="admin@maxerp.local">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <button
              type="button"
              onClick={() => router.push("/configuration/business-objects")}
              className="transition hover:text-slate-600"
            >
              Business Objects
            </button>
            <span>/</span>
            <span className="text-blue-600 font-bold">{businessObject?.name || "Business Object"}</span>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`rounded-full border px-3 py-1 text-xs font-bold ${
                businessObject?.status === "PUBLISHED" ||
                businessObject?.status === "ACTIVE"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-amber-200 bg-amber-50 text-amber-700"
              }`}
            >
              {businessObject?.status || "DRAFT"}
            </span>

            <span className="text-xs text-slate-400">
              Version {businessObject?.versionNumber ?? 1}
            </span>

            {businessObject?.status === "DRAFT" ? (
              <button
                type="button"
                onClick={() => setShowPublishModal(true)}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition"
              >
                Publish Object
              </button>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                <svg className="h-4 w-4 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                </svg>
                Published &amp; Active
              </span>
            )}
          </div>
        </div>

        <div>

        {/* ==================================================== */}
        {/* TITLE */}
        {/* ==================================================== */}

        <section className="mb-8">

          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">

            <div>

              <div className="mb-3 flex items-center gap-2 text-sm text-slate-500">

                <span>
                  Configuration
                </span>

                <ChevronIcon />

                <span>
                  Business Objects
                </span>

                <ChevronIcon />

                <span className="font-medium text-slate-700">
                  {businessObject?.name || "Business Object"}
                </span>

              </div>

              <div className="flex items-center gap-4">

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">

                  <span className="text-xl font-bold">
                    {businessObject?.name?.charAt(0) || "B"}
                  </span>

                </div>

                <div>

                  <div className="flex items-center gap-3">

                    <h1 className="text-3xl font-bold tracking-tight text-slate-950">
                      {businessObject?.name || "Business Object"}
                    </h1>

                    {businessObject?.status === "DRAFT" && (
                      <button
                        type="button"
                        onClick={openEditObject}
                        className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
                      >
                        Edit Object
                      </button>
                    )}

                  </div>

                  <p className="mt-1 text-sm text-slate-500">
                    {businessObject?.description ||
                      `Define the data structure and behavior of the ${businessObject?.name || "object"}.`}
                  </p>

                </div>

              </div>

            </div>

            <div className="grid grid-cols-3 gap-3">

              <div className="min-w-[100px] rounded-xl border border-slate-200 bg-white px-4 py-3">

                <p className="text-xs font-medium text-slate-400">
                  Fields
                </p>

                <p className="mt-1 text-xl font-bold text-slate-900">
                  {fields.length}
                </p>

              </div>

              <div className="min-w-[100px] rounded-xl border border-slate-200 bg-white px-4 py-3">

                <p className="text-xs font-medium text-slate-400">
                  Required
                </p>

                <p className="mt-1 text-xl font-bold text-slate-900">
                  {requiredCount}
                </p>

              </div>

              <div className="min-w-[100px] rounded-xl border border-slate-200 bg-white px-4 py-3">

                <p className="text-xs font-medium text-slate-400">
                  Status
                </p>

                <p
                  className={`mt-1 text-sm font-bold ${
                    businessObject?.status === "PUBLISHED" ||
                    businessObject?.status === "ACTIVE"
                      ? "text-emerald-600"
                      : "text-amber-600"
                  }`}
                >
                  {businessObject?.status === "PUBLISHED"
                    ? "Published"
                    : businessObject?.status === "ACTIVE"
                    ? "Active"
                    : "Draft"}
                </p>

              </div>

            </div>

          </div>

        </section>

        {/* ==================================================== */}
        {/* SUCCESS */}
        {/* ==================================================== */}

        {success && (
          <div className="mb-6 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">

            <span>
              <strong>
                Success:
              </strong>{" "}
              {success}
            </span>

            <button
              type="button"
              onClick={() =>
                setSuccess("")
              }
              className="font-semibold text-emerald-700"
            >
              Dismiss
            </button>

          </div>
        )}

        {/* ==================================================== */}
        {/* ERROR */}
        {/* ==================================================== */}

        {error &&
          !showAddField &&
          !showEditField && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

              <strong>
                Error:
              </strong>{" "}
              {error}

            </div>
          )}

        {/* ==================================================== */}
        {/* TABS */}
        {/* ==================================================== */}

        <div className="mb-6 overflow-x-auto border-b border-slate-200">

          <div className="flex min-w-max gap-7">

            {[
              "Overview",
              "Fields",
              "Relationships",
              "Rules",
              "Workflows",
              "Permissions",
              "Audit",
              "Records",
              "Imports",
            ].map((tab) => (

              <button
                key={tab}
                type="button"
                onClick={() => {
                  if (tab === "Records") {
                    router.push(
                      `/configuration/business-objects/${businessObjectId}/records`
                    );
                  } else if (tab === "Imports") {
                    router.push(
                      `/configuration/business-objects/${businessObjectId}/imports`
                    );
                  } else if (tab === "Rules") {
                    router.push(
                      `/configuration/rules?businessObjectId=${businessObjectId}`
                    );
                  } else if (tab === "Workflows") {
                    router.push("/configuration/workflows");
                  } else if (tab === "Permissions") {
                    router.push("/security");
                  }
                }}
                className={`relative pb-4 text-sm font-medium ${
                  tab === "Fields"
                    ? "text-blue-600"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >

                {tab}

                {tab === "Fields" && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-blue-600" />
                )}

              </button>

            ))}

          </div>

        </div>

        {/* ==================================================== */}
        {/* FIELDS CARD */}
        {/* ==================================================== */}

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* TOOLBAR */}

          <div className="flex flex-col gap-4 border-b border-slate-200 p-5 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <h2 className="text-lg font-bold text-slate-900">
                Fields
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Manage the fields available on {businessObject?.name ?? "business object"} records.
              </p>

            </div>

            <div className="flex flex-col gap-3 sm:flex-row">

              <div className="relative">

                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <SearchIcon />
                </span>

                <input
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                  placeholder="Search fields..."
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm outline-none transition focus:border-blue-400 focus:bg-white sm:w-64"
                />

              </div>

              <button
                type="button"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                <SlidersIcon />
                Filter
              </button>

              {businessObject?.status === "DRAFT" ? (
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setSuccess("");
                    resetForm();
                    setShowAddField(true);
                  }}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
                >
                  <PlusIcon />
                  Add Field
                </button>
              ) : (
                <span className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3.5 text-xs font-medium text-slate-500">
                  <svg className="h-3.5 w-3.5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                  </svg>
                  Schema Locked
                </span>
              )}

            </div>

          </div>

          {/* CONTENT */}

          {loading ? (

            <div className="p-16 text-center">

              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />

              <p className="mt-4 text-sm text-slate-500">
                Loading configuration...
              </p>

            </div>

          ) : filteredFields.length === 0 ? (

            <div className="p-16 text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">

                <svg
                  viewBox="0 0 24 24"
                  className="h-7 w-7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                >
                  <rect
                    x="4"
                    y="4"
                    width="16"
                    height="16"
                    rx="2"
                  />

                  <path d="M8 9h8M8 13h5M8 17h3" />

                </svg>

              </div>

              <h3 className="mt-5 text-base font-bold text-slate-800">
                {search
                  ? "No matching fields"
                  : "No fields configured yet"}
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                {search
                  ? "Try another search term."
                  : `Create your first field to define the ${businessObject?.name ?? "business object"} data model.`}
              </p>

              {!search && (
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowAddField(true);
                  }}
                  className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  <PlusIcon />
                  Create First Field
                </button>
              )}

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full min-w-[980px]">

                <thead>

                  <tr className="border-b border-slate-200 bg-slate-50/70 text-left">

                    <th className="px-6 py-3 text-xs font-bold uppercase tracking-wide text-slate-400">
                      Field
                    </th>

                    <th className="px-6 py-3 text-xs font-bold uppercase tracking-wide text-slate-400">
                      Type
                    </th>

                    <th className="px-6 py-3 text-xs font-bold uppercase tracking-wide text-slate-400">
                      Rules
                    </th>

                    <th className="px-6 py-3 text-xs font-bold uppercase tracking-wide text-slate-400">
                      Default
                    </th>

                    <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-400">
                      Order
                    </th>

                    <th className="w-16 px-4 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-400">
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-100">

                  {filteredFields.map(
                    (field) => (

                      <tr
                        key={field.id}
                        className="group hover:bg-slate-50/70"
                      >

                        <td className="px-6 py-4">

                          <div className="flex items-center gap-3">

                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-xs font-bold text-blue-600">
                              {field.label
                                .slice(0, 1)
                                .toUpperCase()}
                            </div>

                            <div>

                              <p className="font-semibold text-slate-800">
                                {field.label}
                              </p>

                              <p className="mt-0.5 font-mono text-xs text-slate-400">
                                {field.fieldKey}
                              </p>

                            </div>

                          </div>

                        </td>

                        <td className="px-6 py-4">

                          <span className="inline-flex rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                            {FIELD_TYPE_LABELS[
                              field.fieldType
                            ] ??
                              field.fieldType}
                          </span>

                        </td>

                        <td className="px-6 py-4">

                          <div className="flex flex-wrap gap-1.5">

                            {field.required && (
                              <span className="rounded-md bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-700">
                                Required
                              </span>
                            )}

                            {field.uniqueValue && (
                              <span className="rounded-md bg-purple-50 px-2 py-1 text-[11px] font-semibold text-purple-700">
                                Unique
                              </span>
                            )}

                            {field.readOnly && (
                              <span className="rounded-md bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-700">
                                Read only
                              </span>
                            )}

                            {field.hidden && (
                              <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-500">
                                Hidden
                              </span>
                            )}

                            {!field.required &&
                              !field.uniqueValue &&
                              !field.readOnly &&
                              !field.hidden && (
                                <span className="text-xs text-slate-400">
                                  No rules
                                </span>
                              )}

                          </div>

                        </td>

                        <td className="px-6 py-4 text-sm text-slate-500">
                          {field.defaultValue || "Not set"}
                        </td>

                        <td className="px-6 py-4 text-right font-mono text-xs text-slate-400">
                          {field.displayOrder}
                        </td>

                        {/* ACTIONS */}

                        <td className="relative px-4 py-4 text-right">

                          {businessObject?.status === "DRAFT" ? (
                            <>
                              <button
                                type="button"
                                onClick={() =>
                                  setOpenActionsId(
                                    openActionsId ===
                                      field.id
                                      ? null
                                      : field.id
                                  )
                                }
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                                aria-label={`Actions for ${field.label}`}
                              >
                                <MoreIcon />
                              </button>

                              {openActionsId ===
                                field.id && (

                                <div className="absolute right-4 top-14 z-30 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 text-left shadow-xl">

                                  <button
                                    type="button"
                                    onClick={() =>
                                      openEditField(
                                        field
                                      )
                                    }
                                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                  >
                                    <EditIcon />
                                    Edit field
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      openDeleteField(
                                        field
                                      )
                                    }
                                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
                                  >
                                    <TrashIcon />
                                    Delete field
                                  </button>

                                </div>

                              )}
                            </>
                          ) : (
                            <span
                              className="inline-flex items-center gap-1 text-xs text-slate-400"
                              title="Fields cannot be modified on active business objects"
                            >
                              <svg className="h-3.5 w-3.5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                              </svg>
                              Locked
                            </span>
                          )}

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

          <div className="border-t border-slate-200 bg-slate-50/50 px-6 py-3">

            <p className="text-xs text-slate-400">
              Configuration changes are saved as draft until published.
            </p>

          </div>

        </section>

      </div>

      {/* ====================================================== */}
      {/* EDIT BUSINESS OBJECT MODAL */}
      {/* ====================================================== */}

      {showEditObject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600">
                  Business Object Details
                </div>
                <h2 className="mt-1 text-xl font-bold text-slate-950">
                  Edit Business Object
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowEditObject(false)}
                disabled={saving}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <XIcon />
              </button>
            </div>

            <form onSubmit={updateBusinessObject}>
              <div className="space-y-4 px-6 py-6">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Object Key (Immutable)
                  </label>
                  <input
                    type="text"
                    disabled
                    value={businessObject?.objectKey ?? ""}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 font-mono text-sm text-slate-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Display Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editObjectName}
                    onChange={(e) => setEditObjectName(e.target.value)}
                    placeholder="e.g. Customer Account"
                    className="mt-1.5 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={editObjectDescription}
                    onChange={(e) => setEditObjectDescription(e.target.value)}
                    placeholder="Describe this business entity..."
                    className="mt-1.5 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-4">
                <button
                  type="button"
                  onClick={() => setShowEditObject(false)}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================== */}
      {/* ADD FIELD MODAL */}
      {/* ====================================================== */}

      {showAddField && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">

          <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

              <div>

                <h2 className="text-lg font-bold text-slate-900">
                  Add Field
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Define a new field for the {businessObject?.name || "object"}.
                </p>

              </div>

              <button
                type="button"
                onClick={closeAddModal}
                disabled={saving}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
              >
                <XIcon />
              </button>

            </div>

            <form
              onSubmit={createField}
              className="max-h-[75vh] overflow-y-auto"
            >

              <div className="space-y-6 p-6">

                {error && (

                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

                    <p className="font-semibold">
                      Field creation failed
                    </p>

                    <p className="mt-1 break-words">
                      {error}
                    </p>

                  </div>

                )}

                <div>

                  <p className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                    Basic Information
                  </p>

                  <div className="grid gap-5 md:grid-cols-2">

                    <div>

                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Field Key
                        <span className="ml-1 text-red-500">
                          *
                        </span>
                      </label>

                      <input
                        value={fieldKey}
                        onChange={(e) =>
                          setFieldKey(
                            e.target.value.toLowerCase()
                          )
                        }
                        placeholder="customer_code"
                        className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-500 focus:bg-white"
                      />

                    </div>

                    <div>

                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Display Label
                        <span className="ml-1 text-red-500">
                          *
                        </span>
                      </label>

                      <input
                        value={label}
                        onChange={(e) =>
                          setLabel(e.target.value)
                        }
                        placeholder="Customer Code"
                        className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-500 focus:bg-white"
                      />

                    </div>

                  </div>

                </div>

                <div>

                  <p className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                    Data Type
                  </p>

                  <div className="grid gap-5 md:grid-cols-2">

                    <div>

                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Field Type
                      </label>

                      <select
                        value={fieldType}
                        onChange={(e) =>
                          setFieldType(e.target.value)
                        }
                        className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-500 focus:bg-white"
                      >

                        {FIELD_TYPES.map((type) => (

                          <option
                            key={type}
                            value={type}
                          >
                            {FIELD_TYPE_LABELS[type] ??
                              type}
                          </option>

                        ))}

                      </select>

                    </div>

                    <div>

                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Default Value
                      </label>

                      <input
                        value={defaultValue}
                        onChange={(e) =>
                          setDefaultValue(
                            e.target.value
                          )
                        }
                        placeholder="Optional"
                        className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-500 focus:bg-white"
                      />

                    </div>

                  </div>

                </div>

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Description
                  </label>

                  <textarea
                    value={description}
                    onChange={(e) =>
                      setDescription(
                        e.target.value
                      )
                    }
                    rows={3}
                    placeholder="Describe how this field is used..."
                    className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-blue-500 focus:bg-white"
                  />

                </div>

                <div>

                  <p className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                    Validation
                  </p>

                  <div className="grid gap-5 md:grid-cols-2">

                    <div>

                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Minimum Value
                      </label>

                      <input
                        type="number"
                        value={minValue}
                        onChange={(e) =>
                          setMinValue(
                            e.target.value
                          )
                        }
                        placeholder="Optional"
                        className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-500 focus:bg-white"
                      />

                    </div>

                    <div>

                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Maximum Value
                      </label>

                      <input
                        type="number"
                        value={maxValue}
                        onChange={(e) =>
                          setMaxValue(
                            e.target.value
                          )
                        }
                        placeholder="Optional"
                        className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-500 focus:bg-white"
                      />

                    </div>

                  </div>

                  <div className="mt-5">

                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Validation Pattern
                    </label>

                    <input
                      value={validationPattern}
                      onChange={(e) =>
                        setValidationPattern(
                          e.target.value
                        )
                      }
                      placeholder="Optional regular expression"
                      className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-500 focus:bg-white"
                    />

                  </div>

                <TypeSpecificFieldSettings
                  fieldType={fieldType}
                  defaultValue={defaultValue}
                  minValue={minValue}
                  maxValue={maxValue}
                  validationPattern={validationPattern}
                  setDefaultValue={setDefaultValue}
                  setMinValue={setMinValue}
                  setMaxValue={setMaxValue}
                  setValidationPattern={setValidationPattern}
                />


                </div>

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Display Order
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={displayOrder}
                    onChange={(e) =>
                      setDisplayOrder(
                        e.target.value
                      )
                    }
                    className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-500 focus:bg-white"
                  />

                </div>

                <div>

                  <p className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                    Field Behavior
                  </p>

                  <div className="grid gap-3 sm:grid-cols-2">

                    {[
                      {
                        label: "Required",
                        description:
                          "Users must provide a value.",
                        value: required,
                        setValue:
                          setRequired,
                      },
                      {
                        label: "Unique",
                        description:
                          "Values cannot be duplicated.",
                        value:
                          uniqueValue,
                        setValue:
                          setUniqueValue,
                      },
                      {
                        label: "Read Only",
                        description:
                          "Users cannot manually edit it.",
                        value:
                          readOnly,
                        setValue:
                          setReadOnly,
                      },
                      {
                        label: "Hidden",
                        description:
                          "Hide this field from normal forms.",
                        value: hidden,
                        setValue:
                          setHidden,
                      },
                    ].map((option) => (

                      <label
                        key={option.label}
                        className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                          option.value
                            ? "border-blue-200 bg-blue-50/50"
                            : "border-slate-200 bg-white hover:bg-slate-50"
                        }`}
                      >

                        <input
                          type="checkbox"
                          checked={
                            option.value
                          }
                          onChange={(e) =>
                            option.setValue(
                              e.target.checked
                            )
                          }
                          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />

                        <span>

                          <span className="block text-sm font-semibold text-slate-800">
                            {option.label}
                          </span>

                          <span className="mt-0.5 block text-xs text-slate-500">
                            {option.description}
                          </span>

                        </span>

                      </label>

                    ))}

                  </div>

                </div>

              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">

                <button
                  type="button"
                  onClick={closeAddModal}
                  disabled={saving}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >

                  {saving && (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  )}

                  {saving
                    ? "Creating..."
                    : "Create Field"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* ====================================================== */}
      {/* EDIT FIELD MODAL */}
      {/* ====================================================== */}

      {showEditField &&
        editingField && (

          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">

            <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">

              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

                <div>

                  <div className="flex items-center gap-2">

                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <EditIcon />
                    </div>

                    <h2 className="text-lg font-bold text-slate-900">
                      Edit Field
                    </h2>

                  </div>

                  <p className="mt-1 text-sm text-slate-500">
                    Update the configuration of this field.
                  </p>

                </div>

                <button
                  type="button"
                  onClick={closeEditModal}
                  disabled={saving}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                >
                  <XIcon />
                </button>

              </div>

              <form
                onSubmit={updateField}
                className="max-h-[75vh] overflow-y-auto"
              >

                <div className="space-y-6 p-6">

                  {error && (

                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

                      <p className="font-semibold">
                        Field update failed
                      </p>

                      <p className="mt-1 break-words">
                        {error}
                      </p>

                    </div>

                  )}

                  <div>

                    <p className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                      Basic Information
                    </p>

                    <div className="space-y-5">

                      <div>

                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                          Field Key
                        </label>

                        <input
                          value={fieldKey}
                          disabled
                          className="h-11 w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-100 px-3 font-mono text-sm text-slate-500"
                        />

                        <p className="mt-1.5 text-xs text-slate-400">
                          The technical field key cannot be changed.
                        </p>

                      </div>

                      <div>

                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                          Display Label
                          <span className="ml-1 text-red-500">
                            *
                          </span>
                        </label>

                        <input
                          value={label}
                          onChange={(e) =>
                            setLabel(
                              e.target.value
                            )
                          }
                          placeholder="Customer Name"
                          className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-500 focus:bg-white"
                        />

                      </div>

                    </div>

                  </div>

                  <div>

                    <p className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                      Data Type
                    </p>

                    <div className="grid gap-5 md:grid-cols-2">

                      <div>

                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                          Field Type
                        </label>

                        <select
                          value={fieldType}
                          onChange={(e) =>
                            setFieldType(
                              e.target.value
                            )
                          }
                          className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-500 focus:bg-white"
                        >

                          {FIELD_TYPES.map(
                            (type) => (

                              <option
                                key={type}
                                value={type}
                              >
                                {FIELD_TYPE_LABELS[
                                  type
                                ] ?? type}
                              </option>

                            )
                          )}

                        </select>

                      </div>

                      <div>

                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                          Default Value
                        </label>

                        <input
                          value={
                            defaultValue
                          }
                          onChange={(e) =>
                            setDefaultValue(
                              e.target.value
                            )
                          }
                          placeholder="Optional"
                          className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-500 focus:bg-white"
                        />

                      </div>

                    </div>

                  </div>

                  <div>

                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Description
                    </label>

                    <textarea
                      value={description}
                      onChange={(e) =>
                        setDescription(
                          e.target.value
                        )
                      }
                      rows={3}
                      placeholder="Describe how this field is used..."
                      className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-blue-500 focus:bg-white"
                    />

                  </div>

                  <div>

                    <p className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                      Validation
                    </p>

                    <div className="grid gap-5 md:grid-cols-2">

                      <div>

                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                          Minimum Value
                        </label>

                        <input
                          type="number"
                          value={minValue}
                          onChange={(e) =>
                            setMinValue(
                              e.target.value
                            )
                          }
                          placeholder="Optional"
                          className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-500 focus:bg-white"
                        />

                      </div>

                      <div>

                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                          Maximum Value
                        </label>

                        <input
                          type="number"
                          value={maxValue}
                          onChange={(e) =>
                            setMaxValue(
                              e.target.value
                            )
                          }
                          placeholder="Optional"
                          className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-500 focus:bg-white"
                        />

                      </div>

                    </div>

                    <div className="mt-5">

                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Validation Pattern
                      </label>

                      <input
                        value={
                          validationPattern
                        }
                        onChange={(e) =>
                          setValidationPattern(
                            e.target.value
                          )
                        }
                        placeholder="Optional regular expression"
                        className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-500 focus:bg-white"
                      />

                    </div>

                  </div>

                  <div>

                <TypeSpecificFieldSettings
                  fieldType={fieldType}
                  defaultValue={defaultValue}
                  minValue={minValue}
                  maxValue={maxValue}
                  validationPattern={validationPattern}
                  setDefaultValue={setDefaultValue}

                  setMinValue={setMinValue}
                  setMaxValue={setMaxValue}
                  setValidationPattern={setValidationPattern}
                />


                <ChoiceFieldOptions
                  businessObjectId={businessObjectId}
                  fieldId={editingField?.id}
                  fieldType={fieldType}
                />

                <ReferenceFieldSettings
                  businessObjectId={businessObjectId}
                  fieldId={editingField?.id}
                  fieldType={fieldType}
                />



                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Display Order
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={displayOrder}
                      onChange={(e) =>
                        setDisplayOrder(
                          e.target.value
                        )
                      }
                      className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-500 focus:bg-white"
                    />

                  </div>

                  <div>

                    <p className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                      Field Behavior
                    </p>

                    <div className="grid gap-3 sm:grid-cols-2">

                      {[
                        {
                          label:
                            "Required",
                          description:
                            "Users must provide a value.",
                          value:
                            required,
                          setValue:
                            setRequired,
                        },
                        {
                          label:
                            "Unique",
                          description:
                            "Values cannot be duplicated.",
                          value:
                            uniqueValue,
                          setValue:
                            setUniqueValue,
                        },
                        {
                          label:
                            "Read Only",
                          description:
                            "Users cannot manually edit it.",
                          value:
                            readOnly,
                          setValue:
                            setReadOnly,
                        },
                        {
                          label:
                            "Hidden",
                          description:
                            "Hide this field from normal forms.",
                          value:
                            hidden,
                          setValue:
                            setHidden,
                        },
                      ].map(
                        (option) => (

                          <label
                            key={
                              option.label
                            }
                            className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                              option.value
                                ? "border-blue-200 bg-blue-50/50"
                                : "border-slate-200 bg-white hover:bg-slate-50"
                            }`}
                          >

                            <input
                              type="checkbox"
                              checked={
                                option.value
                              }
                              onChange={(
                                e
                              ) =>
                                option.setValue(
                                  e.target
                                    .checked
                                )
                              }
                              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />

                            <span>

                              <span className="block text-sm font-semibold text-slate-800">
                                {
                                  option.label
                                }
                              </span>

                              <span className="mt-0.5 block text-xs text-slate-500">
                                {
                                  option.description
                                }
                              </span>

                            </span>

                          </label>

                        )
                      )}

                    </div>

                  </div>

                </div>

                <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">

                  <button
                    type="button"
                    onClick={
                      closeEditModal
                    }
                    disabled={saving}
                    className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >

                    {saving && (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    )}

                    {saving
                      ? "Saving..."
                      : "Save Changes"}

                  </button>

                </div>

              </form>

            </div>

          </div>

        )}

      {/* ============================================================ */}
      {/* DELETE FIELD CONFIRMATION MODAL */}
      {/* ============================================================ */}

      {showDeleteField && deletingField && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-field-title"
        >
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="px-6 py-6">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v4m0 4h.01M10.3 4.8 2.9 18a2 2 0 0 0 1.73 3h14.74A2 2 0 0 0 21.1 18L13.7 4.8a2 2 0 0 0-3.4 0Z"
                    />
                  </svg>
                </div>

                <div className="min-w-0 flex-1">
                  <h2
                    id="delete-field-title"
                    className="text-lg font-bold text-slate-900"
                  >
                    Delete field?
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    You are about to delete this configuration field.
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-sm font-semibold text-slate-900">
                  {deletingField.label}
                </p>
                <p className="mt-1 font-mono text-xs text-slate-500">
                  {deletingField.fieldKey}
                </p>
              </div>

              <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
                <p className="text-sm leading-6 text-red-700">
                  This action will remove the field from the business object configuration. Please confirm that you want to continue.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
              <button
                type="button"
                onClick={closeDeleteField}
                disabled={saving}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={deleteField}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving && (
                  <svg
                    className="h-4 w-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="9"
                      stroke="currentColor"
                      strokeWidth="3"
                      className="opacity-25"
                    />
                    <path
                      d="M21 12a9 9 0 0 0-9-9"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
                {saving ? "Deleting..." : "Delete field"}
              </button>
            </div>
          </div>
        </div>
      )}


      {showPublishModal && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="publish-object-title"
        >
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="px-6 py-6">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                    />
                  </svg>
                </div>

                <div className="min-w-0 flex-1">
                  <h2
                    id="publish-object-title"
                    className="text-lg font-bold text-slate-900"
                  >
                    Publish Business Object?
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Publishing makes this business object live and activates it for record creation and data imports.
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-500">Business Object</span>
                  <span className="font-semibold text-slate-900">{businessObject?.name}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-500">Configured Fields</span>
                  <span className="font-semibold text-slate-900">{fields.length}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-500">Target Status</span>
                  <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                    PUBLISHED
                  </span>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                <div className="flex gap-2.5">
                  <svg className="h-5 w-5 shrink-0 text-amber-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                  <p className="text-xs leading-5 text-amber-800">
                    <strong>Important:</strong> Once published, the field configuration and schema cannot be modified to protect data integrity for existing business records.
                  </p>
                </div>
              </div>

              {fields.length === 0 && (
                <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs text-red-700">
                  A business object must have at least one field before it can be published.
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
              <button
                type="button"
                onClick={() => setShowPublishModal(false)}
                disabled={publishing}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={publishBusinessObject}
                disabled={publishing || fields.length === 0}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {publishing && (
                  <svg
                    className="h-4 w-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="9"
                      stroke="currentColor"
                      strokeWidth="3"
                      className="opacity-25"
                    />
                    <path
                      d="M21 12a9 9 0 0 0-9-9"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
                {publishing ? "Publishing..." : "Confirm & Publish"}
              </button>
            </div>
          </div>
        </div>
      )}

      </div>
    </MaxShell>
  );
}
