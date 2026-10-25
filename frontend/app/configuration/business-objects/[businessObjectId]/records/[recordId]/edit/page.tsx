"use client";

import { useEffect, useState } from "react";
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
  description?: string | null;
  fieldType: string;
  required: boolean;
  uniqueValue: boolean;
  readOnly: boolean;
  hidden: boolean;
  defaultValue?: string | null;
  minValue?: number | null;
  maxValue?: number | null;
  validationPattern?: string | null;
  displayOrder: number;
};

type FieldOption = {
  id: string;
  optionValue: string;
  optionLabel: string;
  displayOrder: number;
  active: boolean;
  defaultOption: boolean;
};

type ReferenceConfiguration = {
  id: string;
  fieldId: string;
  targetBusinessObjectId: string;
  displayFieldId?: string | null;
  allowMultiple: boolean;
  allowCreate: boolean;
};

type TargetRecord = {
  id: string;
  recordData: Record<string, unknown>;
};

type UserOption = {
  id: string;
  username: string;
  email?: string | null;
  status?: string | null;
};

type BusinessObjectRecord = {
  id: string;
  businessObjectId: string;
  recordData: Record<string, unknown>;
  createdBy?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export default function EditBusinessObjectRecordPage() {
  const params = useParams();
  const router = useRouter();

  const businessObjectId = params.businessObjectId as string;
  const recordId = params.recordId as string;

  const [businessObject, setBusinessObject] =
    useState<BusinessObject | null>(null);

  const [fields, setFields] = useState<Field[]>([]);
  const [values, setValues] =
    useState<Record<string, unknown>>({});

  const [options, setOptions] =
    useState<Record<string, FieldOption[]>>({});

  const [references, setReferences] =
    useState<Record<string, ReferenceConfiguration>>({});

  const [referenceRecords, setReferenceRecords] =
    useState<Record<string, TargetRecord[]>>({});

  const [users, setUsers] = useState<UserOption[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!businessObjectId || !recordId) return;

    async function loadConfiguration() {
      try {
        setLoading(true);
        setError("");

        const objectsResponse = await fetch(
          "/api/configuration/business-objects",
          { cache: "no-store" }
        );

        const fieldsResponse = await fetch(
          `/api/configuration/business-objects/${businessObjectId}/fields`,
          { cache: "no-store" }
        );

        const recordResponse = await fetch(
          `/api/configuration/business-objects/${businessObjectId}/records/${recordId}`,
          { cache: "no-store" }
        );

        const usersResponse = await fetch(
          "/api/users",
          { cache: "no-store" }
        );

        if (!objectsResponse.ok) {
          throw new Error("Unable to load business objects.");
        }

        if (!fieldsResponse.ok) {
          throw new Error("Unable to load fields.");
        }

        if (!recordResponse.ok) {
          const data = await recordResponse.json().catch(() => null);

          throw new Error(
            data?.message ||
              data?.error ||
              "Unable to load record."
          );
        }

        if (!usersResponse.ok) {
          throw new Error("Unable to load users.");
        }

        const objects = await objectsResponse.json();
        const loadedFields: Field[] =
          await fieldsResponse.json();

        const record =
          (await recordResponse.json()) as BusinessObjectRecord;

        const usersData = await usersResponse.json();

        const loadedUsers: UserOption[] =
          Array.isArray(usersData) ? usersData : [];

        setUsers(loadedUsers);

        const foundObject = Array.isArray(objects)
          ? objects.find(
              (item: BusinessObject) =>
                item.id === businessObjectId
            )
          : null;

        setBusinessObject(foundObject ?? null);

        const visibleFields = Array.isArray(loadedFields)
          ? loadedFields
              .filter((field) => !field.hidden)
              .sort(
                (a, b) =>
                  a.displayOrder - b.displayOrder
              )
          : [];

        setFields(visibleFields);

        const initialValues: Record<string, unknown> = {};

        visibleFields.forEach((field) => {
          const existingValue =
            record?.recordData?.[field.fieldKey];

          if (
            existingValue !== null &&
            existingValue !== undefined
          ) {
            if (
              field.fieldType === "MULTI_CHOICE" ||
              (
                field.fieldType === "REFERENCE" &&
                false
              )
            ) {
              initialValues[field.fieldKey] =
                Array.isArray(existingValue)
                  ? existingValue
                  : [existingValue];
            } else if (
              field.fieldType === "BOOLEAN"
            ) {
              initialValues[field.fieldKey] =
                Boolean(existingValue);
            } else {
              initialValues[field.fieldKey] =
                existingValue;
            }
          } else if (
            field.fieldType === "BOOLEAN"
          ) {
            initialValues[field.fieldKey] = false;
          } else if (
            field.fieldType === "MULTI_CHOICE"
          ) {
            initialValues[field.fieldKey] = [];
          } else {
            initialValues[field.fieldKey] = "";
          }
        });

        setValues(initialValues);

        for (const field of visibleFields) {
          if (
            field.fieldType === "CHOICE" ||
            field.fieldType === "MULTI_CHOICE"
          ) {
            const response = await fetch(
              `/api/configuration/business-objects/${businessObjectId}/fields/${field.id}/options`,
              { cache: "no-store" }
            );

            if (response.ok) {
              const fieldOptions =
                await response.json();

              setOptions((current) => ({
                ...current,
                [field.fieldKey]:
                  Array.isArray(fieldOptions)
                    ? fieldOptions
                        .filter(
                          (option: FieldOption) =>
                            option.active
                        )
                        .sort(
                          (
                            a: FieldOption,
                            b: FieldOption
                          ) =>
                            a.displayOrder -
                            b.displayOrder
                        )
                    : [],
              }));
            }
          }

          if (field.fieldType === "REFERENCE") {
            const response = await fetch(
              `/api/configuration/business-objects/${businessObjectId}/fields/${field.id}/reference`,
              { cache: "no-store" }
            );

            if (response.ok) {
              const reference =
                (await response.json()) as ReferenceConfiguration;

              setReferences((current) => ({
                ...current,
                [field.fieldKey]: reference,
              }));

              const recordsResponse = await fetch(
                `/api/configuration/business-objects/${reference.targetBusinessObjectId}/records`,
                { cache: "no-store" }
              );

              if (recordsResponse.ok) {
                const records =
                  await recordsResponse.json();

                setReferenceRecords((current) => ({
                  ...current,
                  [field.fieldKey]:
                    Array.isArray(records)
                      ? records
                      : [],
                }));
              }
            }
          }
        }
      } catch (err) {
        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load record."
        );
      } finally {
        setLoading(false);
      }
    }

    loadConfiguration();
  }, [businessObjectId, recordId]);

  function updateValue(
    fieldKey: string,
    value: unknown
  ) {
    setValues((current) => ({
      ...current,
      [fieldKey]: value,
    }));
    setFieldErrors((current) => {
      if (!current[fieldKey]) return current;
      const copy = { ...current };
      delete copy[fieldKey];
      return copy;
    });
  }

  function getReferenceLabel(
    fieldKey: string,
    record: TargetRecord
  ) {
    const reference = references[fieldKey];

    if (
      reference?.displayFieldId &&
      record.recordData
    ) {
      const matchingValue =
        Object.entries(record.recordData).find(
          ([key]) =>
            key === reference.displayFieldId
        );

      if (matchingValue) {
        return String(matchingValue[1]);
      }
    }

    const values = Object.values(
      record.recordData || {}
    );

    const firstValue = values.find(
      (value) =>
        value !== null &&
        value !== undefined &&
        value !== ""
    );

    return firstValue
      ? String(firstValue)
      : record.id;
  }

  function renderField(field: Field, hasError?: boolean) {
    const value = values[field.fieldKey];

    const commonClass = hasError
      ? "mt-2 w-full rounded-lg border border-red-400 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-200"
      : "mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200";

    if (field.readOnly) {
      return (
        <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-500">
          {value === "" ||
          value === null ||
          value === undefined
            ? "Read only"
            : String(value)}
        </div>
      );
    }

    switch (field.fieldType) {
      case "LONG_TEXT":
        return (
          <textarea
            value={String(value ?? "")}
            onChange={(event) =>
              updateValue(
                field.fieldKey,
                event.target.value
              )
            }
            className={`${commonClass} min-h-28 resize-y`}
            placeholder={`Enter ${field.label.toLowerCase()}`}
            minLength={
              field.minValue !== null &&
              field.minValue !== undefined
                ? field.minValue
                : undefined
            }
          />
        );

      case "NUMBER":
      case "DECIMAL":
      case "CURRENCY":
      case "PERCENTAGE":
        return (
          <input
            type="number"
            value={
              value === "" ? "" : String(value)
            }
            onChange={(event) =>
              updateValue(
                field.fieldKey,
                event.target.value
              )
            }
            min={
              field.minValue !== null &&
              field.minValue !== undefined
                ? field.minValue
                : undefined
            }
            max={
              field.maxValue !== null &&
              field.maxValue !== undefined
                ? field.maxValue
                : undefined
            }
            step={
              field.fieldType === "NUMBER"
                ? "1"
                : "any"
            }
            className={commonClass}
          />
        );

      case "DATE":
        return (
          <input
            type="date"
            value={String(value ?? "")}
            onChange={(event) =>
              updateValue(
                field.fieldKey,
                event.target.value
              )
            }
            className={commonClass}
          />
        );

      case "DATETIME":
        return (
          <input
            type="datetime-local"
            value={String(value ?? "")}
            onChange={(event) =>
              updateValue(
                field.fieldKey,
                event.target.value
              )
            }
            className={commonClass}
          />
        );

      case "BOOLEAN":
        return (
          <label className="mt-3 flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={Boolean(value)}
              onChange={(event) =>
                updateValue(
                  field.fieldKey,
                  event.target.checked
                )
              }
              className={`h-4 w-4 rounded ${
                hasError
                  ? "border-red-500 ring-2 ring-red-200"
                  : "border-slate-300"
              }`}
            />
            <span
              className={`text-sm ${
                hasError
                  ? "font-medium text-red-700"
                  : "text-slate-700"
              }`}
            >
              {field.label}
            </span>
          </label>
        );

      case "CHOICE":
        return (
          <select
            value={String(value ?? "")}
            onChange={(event) =>
              updateValue(
                field.fieldKey,
                event.target.value
              )
            }
            className={commonClass}
          >
            <option value="">
              Select {field.label}
            </option>

            {(options[field.fieldKey] || []).map(
              (option) => (
                <option
                  key={option.id}
                  value={option.optionValue}
                >
                  {option.optionLabel}
                </option>
              )
            )}
          </select>
        );

      case "MULTI_CHOICE":
        return (
          <div
            className={`mt-2 space-y-2 rounded-lg border ${
              hasError
                ? "border-red-400 bg-red-50/30 ring-1 ring-red-300"
                : "border-slate-200 bg-slate-50"
            } p-3`}
          >
            {(options[field.fieldKey] || []).map(
              (option) => {
                const selected =
                  Array.isArray(value)
                    ? value.includes(
                        option.optionValue
                      )
                    : false;

                return (
                  <label
                    key={option.id}
                    className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 hover:bg-white"
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={(event) => {
                        const current =
                          Array.isArray(value)
                            ? [...value]
                            : [];

                        if (event.target.checked) {
                          if (
                            !current.includes(
                              option.optionValue
                            )
                          ) {
                            current.push(
                              option.optionValue
                            );
                          }
                        } else {
                          const index =
                            current.indexOf(
                              option.optionValue
                            );

                          if (index >= 0) {
                            current.splice(index, 1);
                          }
                        }

                        updateValue(
                          field.fieldKey,
                          current
                        );
                      }}
                      className="h-4 w-4 rounded border-slate-300"
                    />

                    <span className="text-sm text-slate-700">
                      {option.optionLabel}
                    </span>
                  </label>
                );
              }
            )}
          </div>
        );

      case "EMAIL":
        return (
          <input
            type="email"
            value={String(value ?? "")}
            onChange={(event) =>
              updateValue(
                field.fieldKey,
                event.target.value
              )
            }
            className={commonClass}
            placeholder="name@example.com"
          />
        );

      case "PHONE":
        return (
          <input
            type="tel"
            value={String(value ?? "")}
            onChange={(event) =>
              updateValue(
                field.fieldKey,
                event.target.value
              )
            }
            className={commonClass}
            placeholder="Phone number"
          />
        );

      case "USER":
        return (
          <select
            value={String(value ?? "")}
            onChange={(event) =>
              updateValue(
                field.fieldKey,
                event.target.value
              )
            }
            className={commonClass}
          >
            <option value="">
              Select {field.label}
            </option>

            {users.map((user) => (
              <option
                key={user.id}
                value={user.id}
              >
                {user.username}
                {user.email
                  ? ` — ${user.email}`
                  : ""}
              </option>
            ))}

            {users.length === 0 && (
              <option value="" disabled>
                No users available
              </option>
            )}
          </select>
        );

      case "REFERENCE": {
        const reference =
          references[field.fieldKey];

        const targetRecords =
          referenceRecords[field.fieldKey] || [];

        if (!reference) {
          return (
            <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-700">
              Reference configuration is not available.
            </div>
          );
        }

        if (reference.allowMultiple) {
          const selectedIds =
            Array.isArray(value)
              ? value
              : [];

          return (
            <div
              className={`mt-2 space-y-2 rounded-lg border ${
                hasError
                  ? "border-red-400 bg-red-50/30 ring-1 ring-red-300"
                  : "border-slate-200 bg-slate-50"
              } p-3`}
            >
              {targetRecords.map((record) => {
                const selected =
                  selectedIds.includes(record.id);

                return (
                  <label
                    key={record.id}
                    className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 hover:bg-white"
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={(event) => {
                        const current =
                          Array.isArray(value)
                            ? [...value]
                            : [];

                        if (
                          event.target.checked
                        ) {
                          if (
                            !current.includes(
                              record.id
                            )
                          ) {
                            current.push(record.id);
                          }
                        } else {
                          const index =
                            current.indexOf(
                              record.id
                            );

                          if (index >= 0) {
                            current.splice(index, 1);
                          }
                        }

                        updateValue(
                          field.fieldKey,
                          current
                        );
                      }}
                      className="h-4 w-4 rounded border-slate-300"
                    />

                    <span className="text-sm text-slate-700">
                      {getReferenceLabel(
                        field.fieldKey,
                        record
                      )}
                    </span>
                  </label>
                );
              })}

              {targetRecords.length === 0 && (
                <p className="text-sm text-slate-500">
                  No records available.
                </p>
              )}
            </div>
          );
        }

        return (
          <select
            value={String(value ?? "")}
            onChange={(event) =>
              updateValue(
                field.fieldKey,
                event.target.value
              )
            }
            className={commonClass}
          >
            <option value="">
              Select {field.label}
            </option>

            {targetRecords.map((record) => (
              <option
                key={record.id}
                value={record.id}
              >
                {getReferenceLabel(
                  field.fieldKey,
                  record
                )}
              </option>
            ))}
          </select>
        );
      }

      case "FILE":
      case "IMAGE":
        return (
          <input
            type="file"
            onChange={(event) =>
              updateValue(
                field.fieldKey,
                event.target.files?.[0]?.name || ""
              )
            }
            className={`${commonClass} file:mr-4 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm`}
          />
        );

      default:
        return (
          <input
            type={
              field.fieldType === "PHONE"
                ? "tel"
                : "text"
            }
            value={String(value ?? "")}
            onChange={(event) =>
              updateValue(
                field.fieldKey,
                event.target.value
              )
            }
            className={commonClass}
            placeholder={`Enter ${field.label.toLowerCase()}`}
            pattern={
              field.validationPattern ||
              undefined
            }
          />
        );
    }
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setFieldErrors({});

    const clientErrors: Record<string, string> = {};

    for (const field of fields) {
      if (field.readOnly) continue;

      if (field.required) {
        const value = values[field.fieldKey];

        const empty =
          value === null ||
          value === undefined ||
          value === "" ||
          (Array.isArray(value) &&
            value.length === 0);

        if (empty) {
          clientErrors[field.fieldKey] = `${field.label} is required.`;
        }
      }

      if (
        field.validationPattern &&
        typeof values[field.fieldKey] === "string" &&
        values[field.fieldKey] !== ""
      ) {
        try {
          const regex = new RegExp(
            field.validationPattern
          );

          if (
            !regex.test(
              String(values[field.fieldKey])
            )
          ) {
            clientErrors[field.fieldKey] = `${field.label} has an invalid format.`;
          }
        } catch {
          console.warn(
            `Invalid validation pattern for ${field.fieldKey}`
          );
        }
      }
    }

    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      setError("Please correct the errors highlighted below.");
      return;
    }

    try {
      setSaving(true);

      const payload: Record<string, unknown> = {
        ...values,
      };

      for (const field of fields) {
        if (
          field.fieldType === "NUMBER" ||
          field.fieldType === "DECIMAL" ||
          field.fieldType === "CURRENCY" ||
          field.fieldType === "PERCENTAGE"
        ) {
          const rawValue = payload[field.fieldKey];

          if (
            rawValue === "" ||
            rawValue === null ||
            rawValue === undefined ||
            (typeof rawValue === "string" &&
              rawValue.trim() === "")
          ) {
            payload[field.fieldKey] = null;
          } else if (typeof rawValue === "string") {
            const numericValue = Number(rawValue);
            payload[field.fieldKey] = Number.isNaN(
              numericValue
            )
              ? rawValue
              : numericValue;
          }
        }
      }

      const response = await fetch(
        `/api/configuration/business-objects/${businessObjectId}/records/${recordId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (
          data?.fieldErrors &&
          typeof data.fieldErrors === "object" &&
          Object.keys(data.fieldErrors).length > 0
        ) {
          setFieldErrors(data.fieldErrors as Record<string, string>);
          setError(
            data?.message ||
              "Validation failed. Please correct the errors highlighted below."
          );
          return;
        }

        throw new Error(
          data?.message ||
            data?.error ||
            "Unable to update record."
        );
      }

      setSuccess("Record updated successfully.");

      setTimeout(() => {
        router.push(
          `/configuration/business-objects/${businessObjectId}/records`
        );
      }, 700);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to update record."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-8 py-8">

        <div className="mb-6 flex items-center gap-2 text-sm">
          <button
            onClick={() =>
              router.push(
                "/configuration/business-objects"
              )
            }
            className="text-slate-500 hover:text-slate-900"
          >
            Business Objects
          </button>

          <span className="text-slate-300">
            &gt;
          </span>

          <button
            onClick={() =>
              router.push(
                `/configuration/business-objects/${businessObjectId}`
              )
            }
            className="text-slate-500 hover:text-slate-900"
          >
            {businessObject?.name ||
              "Business Object"}
          </button>

          <span className="text-slate-300">
            &gt;
          </span>

          <button
            onClick={() =>
              router.push(
                `/configuration/business-objects/${businessObjectId}/records`
              )
            }
            className="text-slate-500 hover:text-slate-900"
          >
            Records
          </button>

          <span className="text-slate-300">
            &gt;
          </span>

          <span className="font-medium text-slate-900">
            Edit Record
          </span>
        </div>

        <div className="mb-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            DATA ENTRY
          </p>

          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
            Edit {businessObject?.name || "Record"}
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Update the configured fields for this
            business object.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            <p className="font-semibold text-red-800">{error}</p>
            {Object.keys(fieldErrors).length > 0 && (
              <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-red-700">
                {Object.entries(fieldErrors).map(([key, msg]) => {
                  const matchingField = fields.find(
                    (f) => f.fieldKey === key
                  );
                  const label = matchingField?.label || key;
                  return (
                    <li key={key}>
                      <span className="font-semibold">{label}:</span> {msg}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
            {success}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <p className="text-sm text-slate-500">
              Loading record...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="border-b border-slate-200 px-7 py-5">
                <h2 className="text-base font-semibold text-slate-900">
                  Record Details
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Update the configured fields below.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 px-7 py-7 md:grid-cols-2">

                {fields.map((field) => {
                  const fieldError = fieldErrors[field.fieldKey];

                  return (
                    <div
                      key={field.id}
                      className={
                        field.fieldType === "LONG_TEXT" ||
                        field.fieldType === "MULTI_CHOICE"
                          ? "md:col-span-2"
                          : ""
                      }
                    >
                      {field.fieldType !== "BOOLEAN" && (
                        <label
                          className={`text-sm font-medium ${
                            fieldError
                              ? "text-red-700"
                              : "text-slate-800"
                          }`}
                        >
                          {field.label}

                          {field.required && (
                            <span className="ml-1 text-red-500">
                              *
                            </span>
                          )}
                        </label>
                      )}

                      {renderField(field, Boolean(fieldError))}

                      {fieldError ? (
                        <p className="mt-1.5 text-xs font-medium text-red-600">
                          {fieldError}
                        </p>
                      ) : field.description ? (
                        <p className="mt-1.5 text-xs text-slate-500">
                          {field.description}
                        </p>
                      ) : null}
                    </div>
                  );
                })}

                {fields.length === 0 && (
                  <div className="md:col-span-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
                    <p className="font-medium text-slate-700">
                      No fields configured
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Configure fields for this business
                      object before editing records.
                    </p>
                  </div>
                )}

              </div>

              <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-7 py-5">

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      `/configuration/business-objects/${businessObjectId}/records`
                    )
                  }
                  className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    saving ||
                    loading ||
                    fields.length === 0
                  }
                  className="rounded-lg bg-slate-950 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : "Save Changes"}
                </button>

              </div>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
