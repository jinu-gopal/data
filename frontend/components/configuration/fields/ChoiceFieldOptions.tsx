"use client";

import { useEffect, useState } from "react";

type Option = {
  id: string;
  optionValue: string;
  optionLabel: string;
  displayOrder: number;
  active: boolean;
  defaultOption: boolean;
};

type ChoiceFieldOptionsProps = {
  businessObjectId: string;
  fieldId?: string;
  fieldType: string;
};

export default function ChoiceFieldOptions({
  businessObjectId,
  fieldId,
  fieldType,
}: ChoiceFieldOptionsProps) {
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [editingOption, setEditingOption] = useState<Option | null>(null);
  const [optionValue, setOptionValue] = useState("");
  const [optionLabel, setOptionLabel] = useState("");
  const [displayOrder, setDisplayOrder] = useState("0");
  const [active, setActive] = useState(true);
  const [defaultOption, setDefaultOption] = useState(false);

  const isChoice =
    fieldType === "CHOICE" || fieldType === "MULTI_CHOICE";

  async function loadOptions() {
    if (!fieldId || !isChoice) {
      setOptions([]);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/configuration/business-objects/${businessObjectId}/fields/${fieldId}/options`
      );

      if (!response.ok) {
        throw new Error("Unable to load field options.");
      }

      const data = await response.json();
      setOptions(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load field options."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let ignore = false;

    if (!fieldId || !isChoice) {
      return;
    }

    fetch(
      `/api/configuration/business-objects/${businessObjectId}/fields/${fieldId}/options`
    )
      .then((res) => {
        if (!res.ok) throw new Error("Unable to load field options.");
        return res.json();
      })
      .then((data) => {
        if (!ignore) {
          setOptions(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load field options."
          );
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [fieldId, isChoice, businessObjectId]);

  function resetForm() {
    setEditingOption(null);
    setOptionValue("");
    setOptionLabel("");
    setDisplayOrder(String(options.length));
    setActive(true);
    setDefaultOption(false);
    setError("");
  }

  function openAdd() {
    resetForm();
    setShowForm(true);
  }

  function openEdit(option: Option) {
    setEditingOption(option);
    setOptionValue(option.optionValue);
    setOptionLabel(option.optionLabel);
    setDisplayOrder(String(option.displayOrder));
    setActive(option.active);
    setDefaultOption(option.defaultOption);
    setError("");
    setShowForm(true);
  }

  async function saveOption() {
    if (!fieldId) {
      setError("Save the field first before adding options.");
      return;
    }

    const cleanValue = optionValue.trim();
    const cleanLabel = optionLabel.trim();

    if (!cleanValue) {
      setError("Option value is required.");
      return;
    }

    if (!cleanLabel) {
      setError("Option label is required.");
      return;
    }

    const parsedOrder = Number(displayOrder);

    if (!Number.isInteger(parsedOrder) || parsedOrder < 0) {
      setError("Display order must be a non-negative whole number.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const payload = {
        optionValue: cleanValue,
        optionLabel: cleanLabel,
        displayOrder: parsedOrder,
        active,
        defaultOption,
      };

      const url = editingOption
        ? `/api/configuration/business-objects/${businessObjectId}/fields/${fieldId}/options?optionId=${encodeURIComponent(editingOption.id)}`
        : `/api/configuration/business-objects/${businessObjectId}/fields/${fieldId}/options`;

      const response = await fetch(url, {
        method: editingOption ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(
          text || `Unable to ${editingOption ? "update" : "create"} option.`
        );
      }

      await loadOptions();
      setShowForm(false);
      resetForm();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save option."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteOption(option: Option) {
    if (!fieldId) return;

    if (!window.confirm(`Delete option "${option.optionLabel}"?`)) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch(
        `/api/configuration/business-objects/${businessObjectId}/fields/${fieldId}/options?optionId=${encodeURIComponent(option.id)}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Unable to delete option.");
      }

      await loadOptions();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete option."
      );
    } finally {
      setSaving(false);
    }
  }

  if (!isChoice) {
    return null;
  }

  return (
    <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">
            Options
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Define the values available for this {fieldType === "MULTI_CHOICE" ? "multi-select" : "selection"} field.
          </p>
        </div>

        {fieldId && (
          <button
            type="button"
            onClick={openAdd}
            className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
          >
            + Add option
          </button>
        )}
      </div>

      {!fieldId && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700">
          Save the field first, then you can configure its options.
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
          {error}
        </div>
      )}

      {fieldId && (
        <div className="mt-4 overflow-hidden rounded-lg border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-500">
              <tr>
                <th className="px-4 py-3">Label</th>
                <th className="px-4 py-3">Value</th>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Default</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-xs text-slate-400"
                  >
                    Loading options...
                  </td>
                </tr>
              ) : options.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-xs text-slate-400"
                  >
                    No options configured yet.
                  </td>
                </tr>
              ) : (
                options
                  .slice()
                  .sort((a, b) => a.displayOrder - b.displayOrder)
                  .map((option) => (
                    <tr key={option.id}>
                      <td className="px-4 py-3 font-medium text-slate-700">
                        {option.optionLabel}
                      </td>

                      <td className="px-4 py-3 font-mono text-xs text-slate-500">
                        {option.optionValue}
                      </td>

                      <td className="px-4 py-3 text-slate-500">
                        {option.displayOrder}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-1 text-[11px] font-semibold ${
                            option.active
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {option.active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        {option.defaultOption ? (
                          <span className="text-xs font-semibold text-blue-600">
                            Default
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">
                            —
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => openEdit(option)}
                          className="mr-3 text-xs font-semibold text-blue-600 hover:text-blue-700"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          disabled={saving}
                          onClick={() => deleteOption(option)}
                          className="text-xs font-semibold text-red-600 hover:text-red-700 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-5">
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-slate-800">
              {editingOption ? "Edit option" : "Add option"}
            </h4>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-semibold text-slate-600">
                Label
              </label>
              <input
                value={optionLabel}
                onChange={(e) => setOptionLabel(e.target.value)}
                placeholder="e.g. Company"
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold text-slate-600">
                Value
              </label>
              <input
                value={optionValue}
                onChange={(e) => setOptionValue(e.target.value)}
                placeholder="e.g. company"
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold text-slate-600">
                Display Order
              </label>
              <input
                type="number"
                min="0"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(e.target.value)}
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-end gap-5 pb-1">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300"
                />
                Active
              </label>

              <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
                <input
                  type="checkbox"
                  checked={defaultOption}
                  onChange={(e) => setDefaultOption(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300"
                />
                Default
              </label>
            </div>
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={saveOption}
              className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : editingOption
                  ? "Update option"
                  : "Add option"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}