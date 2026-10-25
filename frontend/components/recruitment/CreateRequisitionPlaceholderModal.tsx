"use client";

interface CreateRequisitionPlaceholderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateRequisitionPlaceholderModal({
  isOpen,
  onClose,
}: CreateRequisitionPlaceholderModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-2xs p-4 animate-in fade-in">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 font-bold text-xs">
              +
            </span>
            <h3 className="text-base font-bold text-slate-900">Create Job Requisition</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-lg font-bold">
            &times;
          </button>
        </div>

        <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
          <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-blue-900">
            <span className="font-bold block text-sm mb-1">Approved Scope Boundary</span>
            <p>
              In accordance with project scope specifications, <strong>Screen 1 (Recruiting Dashboard)</strong> and{" "}
              <strong>Screen 2 (Job Requisitions List with AI Assistant)</strong> are fully implemented.
            </p>
          </div>

          <p className="text-slate-500">
            <strong>Screen 3: Create Job Requisition Form & Stepper</strong> is reserved for the next phase. Requisition drafting, position slot binding, and approval routing are handled through the Requisitions table and AI Assistant.
          </p>
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 transition shadow-xs"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
}
