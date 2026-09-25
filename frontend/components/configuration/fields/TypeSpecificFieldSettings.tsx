"use client";

type TypeSpecificFieldSettingsProps = {
  fieldType: string;
  defaultValue: string;
  minValue: string;
  maxValue: string;
  validationPattern: string;
  setDefaultValue: (value: string) => void;
  setMinValue: (value: string) => void;
  setMaxValue: (value: string) => void;
  setValidationPattern: (value: string) => void;
};

export default function TypeSpecificFieldSettings({
  fieldType,
  defaultValue,
  minValue,
  maxValue,
  validationPattern,
  setDefaultValue,
  setMinValue,
  setMaxValue,
  setValidationPattern,
}: TypeSpecificFieldSettingsProps) {
  const showDefault =
    !["AUTO_NUMBER", "FORMULA"].includes(fieldType);

  const showRange = [
    "NUMBER",
    "DECIMAL",
    "CURRENCY",
    "PERCENTAGE",
  ].includes(fieldType);

  const showPattern = [
    "TEXT",
    "LONG_TEXT",
    "EMAIL",
    "PHONE",
  ].includes(fieldType);

  if (!showDefault && !showRange && !showPattern) {
    return null;
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-5">
      <div className="mb-4">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Type-specific configuration
        </p>

        <p className="mt-1 text-xs text-slate-500">
          Configure settings specific to the selected field type.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">

        {showDefault && (
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Default Value
            </label>

            <input
              value={defaultValue}
              onChange={(e) => setDefaultValue(e.target.value)}
              placeholder="Optional"
              className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500"
            />

            <p className="mt-1.5 text-xs text-slate-500">
              Value automatically populated when a new record is created.
            </p>
          </div>
        )}

        {showRange && (
          <>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Minimum Value
              </label>

              <input
                type="number"
                value={minValue}
                onChange={(e) => setMinValue(e.target.value)}
                placeholder="Optional"
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500"
              />

              <p className="mt-1.5 text-xs text-slate-500">
                Lowest value allowed for this field.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Maximum Value
              </label>

              <input
                type="number"
                value={maxValue}
                onChange={(e) => setMaxValue(e.target.value)}
                placeholder="Optional"
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500"
              />

              <p className="mt-1.5 text-xs text-slate-500">
                Highest value allowed for this field.
              </p>
            </div>
          </>
        )}

        {showPattern && (
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Validation Pattern
            </label>

            <input
              value={validationPattern}
              onChange={(e) =>
                setValidationPattern(e.target.value)
              }
              placeholder="Optional regular expression"
              className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-mono outline-none focus:border-blue-500"
            />

            <p className="mt-1.5 text-xs text-slate-500">
              Regular expression used to validate the entered value.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}