import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lightbulb, Save, X } from 'lucide-react';
import type { WorkflowDraft } from './types';

interface Props {
  open: boolean;
  onClose: () => void;
  workflow: WorkflowDraft;
  onConfirm: (payload: {
    name: string;
    businessProcess: string;
    subProcess: string;
    description: string;
  }) => void;
}

const PROCESS_TREE: Record<string, string[]> = {
  Procurement: [
    'Purchase Order Management',
    'Vendor Management',
    'Contract Compliance',
    'Sourcing',
  ],
  'Finance & Accounting': [
    'Accounts Payable',
    'Accounts Receivable',
    'General Ledger',
    'Period Close',
  ],
  'Audit & Compliance': [
    'Internal Audit',
    'Regulatory Reporting',
    'Risk Assessment',
    'SOX Controls',
  ],
  Operations: [
    'Inventory Reconciliation',
    'Logistics & Shipping',
    'Quality Assurance',
  ],
};

const BUSINESS_PROCESSES = Object.keys(PROCESS_TREE);

export default function SaveWorkflowModal({
  open,
  onClose,
  workflow,
  onConfirm,
}: Props) {
  const [name, setName] = useState(workflow.name);
  const [businessProcess, setBusinessProcess] = useState('');
  const [subProcess, setSubProcess] = useState('');
  const [description, setDescription] = useState(workflow.description);

  // Reset form whenever the modal opens for the current workflow.
  useEffect(() => {
    if (!open) return;
    setName(workflow.name);
    setBusinessProcess('');
    setSubProcess('');
    setDescription(workflow.description);
  }, [open, workflow]);

  const subProcessOptions = useMemo(
    () => (businessProcess ? PROCESS_TREE[businessProcess] : []),
    [businessProcess],
  );

  const canSave =
    name.trim().length > 0 && businessProcess.length > 0 && subProcess.length > 0;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-ink-900/40 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-[560px] max-h-[90vh] rounded-2xl bg-canvas-elevated border border-canvas-border shadow-2xl flex flex-col overflow-hidden">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 px-6 py-4 border-b border-canvas-border">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                    <Save size={17} />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-[15px] font-semibold text-ink-800 leading-tight">
                      Save as workflow
                    </h2>
                    <p className="text-[12px] text-ink-500 leading-relaxed mt-0.5">
                      Turn this query result into a re-runnable workflow.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg text-ink-500 hover:bg-canvas flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Body */}
              <div className="overflow-y-auto px-6 py-4 flex flex-col gap-4">
                {/* Switch-mode callout */}
                <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50/70 px-3.5 py-3">
                  <Lightbulb
                    size={15}
                    className="text-amber-700 mt-0.5 shrink-0"
                  />
                  <p className="text-[12.5px] text-amber-900 leading-relaxed">
                    This chat will switch to{' '}
                    <strong className="font-semibold">workflow mode</strong>. You won't be
                    able to switch back to query mode in this chat — start a new chat for
                    that.
                  </p>
                </div>

                {/* Workflow name */}
                <div>
                  <label className="block text-[12.5px] font-semibold text-ink-800 mb-1.5">
                    Workflow name <span className="text-risk">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-lg border border-canvas-border bg-canvas-elevated px-3 py-2 text-[13px] text-ink-800 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600/30 transition-all"
                    placeholder="e.g. Duplicate Invoice Detection — Q1 ±3 days"
                  />
                  <p className="text-[11.5px] text-ink-400 mt-1">
                    IRA pre-filled this from your query. Edit if needed.
                  </p>
                </div>

                {/* Business process + Sub-process */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[12.5px] font-semibold text-ink-800 mb-1.5">
                      Business process <span className="text-risk">*</span>
                    </label>
                    <select
                      value={businessProcess}
                      onChange={(e) => {
                        setBusinessProcess(e.target.value);
                        setSubProcess('');
                      }}
                      className="w-full rounded-lg border border-canvas-border bg-canvas-elevated px-3 py-2 text-[13px] text-ink-800 focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600/30 transition-all cursor-pointer"
                    >
                      <option value="">Select…</option>
                      {BUSINESS_PROCESSES.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[12.5px] font-semibold text-ink-800 mb-1.5">
                      Sub-process <span className="text-risk">*</span>
                    </label>
                    <select
                      value={subProcess}
                      onChange={(e) => setSubProcess(e.target.value)}
                      disabled={!businessProcess}
                      className="w-full rounded-lg border border-canvas-border bg-canvas-elevated px-3 py-2 text-[13px] text-ink-800 focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600/30 transition-all cursor-pointer disabled:cursor-not-allowed disabled:bg-canvas disabled:text-ink-400"
                    >
                      <option value="">
                        {businessProcess
                          ? 'Select sub-process…'
                          : 'Pick a business process first'}
                      </option>
                      {subProcessOptions.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[12.5px] font-semibold text-ink-800 mb-1.5">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-canvas-border bg-canvas-elevated px-3 py-2 text-[13px] text-ink-800 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600/30 transition-all resize-none"
                    placeholder="What does this workflow do?"
                  />
                  <p className="text-[11.5px] text-ink-400 mt-1">
                    Optional. IRA pre-filled this from your query.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-2 px-6 py-3 border-t border-canvas-border bg-canvas">
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex items-center justify-center rounded-lg text-[12.5px] font-semibold px-4 py-2 text-ink-600 hover:bg-canvas-elevated transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!canSave}
                  onClick={() =>
                    onConfirm({
                      name: name.trim(),
                      businessProcess,
                      subProcess,
                      description: description.trim(),
                    })
                  }
                  className="inline-flex items-center gap-1.5 rounded-lg text-[12.5px] font-semibold px-4 py-2 bg-gradient-to-br from-brand-600 to-fuchsia-600 hover:from-brand-500 hover:to-fuchsia-500 text-white shadow-[0_8px_16px_-8px_rgba(106,18,205,0.45)] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                >
                  <Save size={13} />
                  Save & switch to workflow
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
