"use client";

import { useState } from "react";
import {
  getBusinessObject,
  addCustomFieldToBusinessObject,
  removeCustomFieldFromBusinessObject,
  BusinessObjectFieldDef,
} from "@/lib/business-objects-schema";

interface BusinessObjectConfigModalProps {
  objectKey: "POSITION" | "LEGAL_ENTITY";
  onClose: () => void;
  onSchemaUpdated: () => void;
}

export default function BusinessObjectConfigModal({
  objectKey,
  onClose,
  onSchemaUpdated,
}: BusinessObjectConfigModalProps) {
  const [schema, setSchema] = useState(() => getBusinessObject(objectKey));
  const [showAddField, setShowAddField] = useState(false);

  // New field form state
  const [newField, setNewField] = useState<BusinessObjectFieldDef>({
    key: "",
    label: "",
    type: "TEXT",
    required: false,
    category: "CUSTOM",
    description: "",
    options: [],
  });
  const [optionsRaw, setOptionsRaw] = useState("");

  const handleAddField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newField.key.trim() || !newField.label.trim()) return;

    const parsedOptions = newField.type === "SELECT"
      ? optionsRaw.split(",").map((s) => s.trim()).filter(Boolean)
      : undefined;

    const fieldToAdd: BusinessObjectFieldDef = {
      ...newField,
      key: newField.key.trim().replace(/\s+/g, "_"),
      options: parsedOptions,
      isCustom: true,
    };

    const updated = addCustomFieldToBusinessObject(objectKey, fieldToAdd);
    setSchema(updated);
    setShowAddField(false);
    setNewField({
      key: "",
      label: "",
      type: "TEXT",
      required: false,
      category: "CUSTOM",
      description: "",
    });
    setOptionsRaw("");
    onSchemaUpdated();
  };

  const handleDeleteField = (fieldKey: string) => {
    const updated = removeCustomFieldFromBusinessObject(objectKey, fieldKey);
    setSchema(updated);
    onSchemaUpdated();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full uppercase">
                Business Object Definition
              </span>
              <span className="text-xs text-slate-400">&bull;</span>
              <span className="text-xs font-mono font-semibold text-slate-500">
                v{schema.version}
              </span>
            </div>
            <h3 className="text-lg font-black text-slate-900 mt-1">
              {schema.name} &bull; Fields & Schema Config
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              All position and legal entity attributes are governed strictly by this Business Object definition.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          >
            &times;
          </button>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700">
            Total Fields Configured: <strong className="text-slate-900">{schema.fields.length}</strong>
          </span>

          <button
            type="button"
            onClick={() => setShowAddField(!showAddField)}
            className="rounded-full bg-slate-900 hover:bg-black text-white px-4 py-2 text-xs font-bold shadow-xs transition flex items-center gap-1.5"
          >
            <span>+ Add Custom Field</span>
          </button>
        </div>

        {/* Add Custom Field Form */}
        {showAddField && (
          <form
            onSubmit={handleAddField}
            className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 space-y-3 text-xs"
          >
            <div className="font-bold text-slate-900">Configure New Business Object Field</div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Field Label *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Security Clearance"
                  value={newField.label}
                  onChange={(e) => {
                    const label = e.target.value;
                    const key = label.toLowerCase().replace(/[^a-z0-9]/g, "_");
                    setNewField({ ...newField, label, key });
                  }}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Field Key (API Identifier) *</label>
                <input
                  type="text"
                  required
                  value={newField.key}
                  onChange={(e) => setNewField({ ...newField, key: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Data Type *</label>
                <select
                  value={newField.type}
                  onChange={(e) => setNewField({ ...newField, type: e.target.value as any })}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:outline-none"
                >
                  <option value="TEXT">Text String</option>
                  <option value="NUMBER">Numeric Value</option>
                  <option value="SELECT">Dropdown Selection</option>
                  <option value="DATE">Calendar Date</option>
                  <option value="BOOLEAN">Boolean (Yes/No)</option>
                  <option value="CURRENCY">Currency Amount</option>
                </select>
              </div>
            </div>

            {newField.type === "SELECT" && (
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Dropdown Options (Comma separated)</label>
                <input
                  type="text"
                  placeholder="Option 1, Option 2, Option 3"
                  value={optionsRaw}
                  onChange={(e) => setOptionsRaw(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900"
                />
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-semibold">
                <input
                  type="checkbox"
                  checked={newField.required}
                  onChange={(e) => setNewField({ ...newField, required: e.target.checked })}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Mandatory Field</span>
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddField(false)}
                  className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 text-xs font-bold shadow-xs"
                >
                  Save to Business Object
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Fields Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Field Label & Key</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Rules</th>
                <th className="px-4 py-3 text-right">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {schema.fields.map((f) => (
                <tr key={f.key} className="hover:bg-slate-50/60 transition">
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-900">{f.label}</div>
                    <div className="font-mono text-[10px] text-slate-500">{f.key}</div>
                  </td>

                  <td className="px-4 py-3">
                    <span className="font-mono text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded">
                      {f.type}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <span className="text-[11px] text-slate-600">{f.category}</span>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {f.required ? (
                        <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded">
                          Required
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500">Optional</span>
                      )}
                      {f.readOnly && (
                        <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded">
                          System Locked
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-3 text-right">
                    {f.isCustom ? (
                      <button
                        type="button"
                        onClick={() => handleDeleteField(f.key)}
                        className="rounded-full bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 px-2.5 py-0.5 text-[10px] font-bold transition"
                      >
                        Remove Custom
                      </button>
                    ) : (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        Business Object Core
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <span className="text-[11px] text-slate-500">
            Changes persist to MAX ERP Business Objects Metadata Engine.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-slate-900 hover:bg-black text-white px-5 py-2 text-xs font-bold transition shadow-xs"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
