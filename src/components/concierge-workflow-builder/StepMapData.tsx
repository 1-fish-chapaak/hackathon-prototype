import { motion } from 'motion/react';
import { ArrowRight, ArrowLeft, Link2 } from 'lucide-react';
import type {
  WorkflowDraft,
  JourneyMappings,
  ColumnRole,
  StepMapping,
} from './types';

interface Props {
  workflow: WorkflowDraft;
  mappings: JourneyMappings;
  setMappings: (m: JourneyMappings) => void;
  onNext: () => void;
  onBack: () => void;
}

const ROLES: { id: ColumnRole; label: string; description: string }[] = [
  { id: 'join_key', label: 'Join key', description: 'Match rows across inputs.' },
  { id: 'compare', label: 'Compare', description: 'Checked for equality or variance.' },
  { id: 'filter', label: 'Filter', description: 'Narrow the scope.' },
  { id: 'output', label: 'Output', description: 'Show in the result.' },
];

const ROLE_COLORS: Record<ColumnRole, string> = {
  join_key: 'bg-evidence-50 text-evidence-700 border-evidence/30',
  compare: 'bg-brand-50 text-brand-700 border-brand-300',
  filter: 'bg-mitigated-50 text-mitigated-700 border-mitigated/30',
  output: 'bg-compliant-50 text-compliant-700 border-compliant/30',
};

export default function StepMapData({
  workflow,
  mappings,
  setMappings,
  onNext,
  onBack,
}: Props) {
  const setRole = (
    stepId: string,
    inputId: string,
    column: string,
    role: ColumnRole | null,
  ) => {
    const stepMap: StepMapping = { ...(mappings[stepId] ?? {}) };
    const existing = stepMap[inputId] ?? [];
    const withoutCol = existing.filter((m) => m.column !== column);
    stepMap[inputId] = role === null ? withoutCol : [...withoutCol, { column, role }];
    setMappings({ ...mappings, [stepId]: stepMap });
  };

  const roleFor = (stepId: string, inputId: string, column: string): ColumnRole | null => {
    const found = mappings[stepId]?.[inputId]?.find((m) => m.column === column);
    return found?.role ?? null;
  };

  const assignedCount = Object.values(mappings).reduce((n, step) => {
    return (
      n +
      Object.values(step).reduce((m, list) => m + list.length, 0)
    );
  }, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col gap-4"
    >
      <div className="rounded-2xl border border-canvas-border bg-canvas-elevated p-6">
        <div className="flex items-center gap-2 mb-1">
          <Link2 size={14} className="text-brand-600" />
          <h3 className="text-[14px] font-semibold text-ink-800 tracking-tight">
            Tell IRA how to use each column
          </h3>
        </div>
        <p className="text-[12.5px] text-ink-500 leading-relaxed">
          For each step, pick a role for the columns that matter. Rows you don't touch stay
          unassigned — IRA will ignore them. You can change these before running.
        </p>
        <div className="flex flex-wrap gap-2 mt-3">
          {ROLES.map((r) => (
            <span
              key={r.id}
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10.5px] font-semibold ${ROLE_COLORS[r.id]}`}
            >
              {r.label}
              <span className="opacity-70 font-normal">{r.description}</span>
            </span>
          ))}
        </div>
      </div>

      {workflow.steps.map((step, idx) => {
        const relevantInputs = workflow.inputs.filter((i) => step.dataFiles.includes(i.id));
        return (
          <div
            key={step.id}
            className="rounded-2xl border border-canvas-border bg-canvas-elevated p-5"
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-400">
                    Step {idx + 1}
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-brand-600">
                    {step.type}
                  </span>
                </div>
                <h4 className="text-[13px] font-semibold text-ink-800">{step.name}</h4>
                <p className="text-[11.5px] text-ink-500 mt-0.5 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {relevantInputs.map((input) => (
                <div
                  key={input.id}
                  className="rounded-xl border border-canvas-border bg-canvas p-3.5"
                >
                  <div className="text-[12px] font-semibold text-ink-800 mb-2 flex items-center gap-2">
                    {input.name}
                    <span className="text-[10px] uppercase tracking-wider text-ink-400 font-semibold">
                      {input.type}
                    </span>
                  </div>
                  <ul className="flex flex-col gap-1.5">
                    {(input.columns ?? []).map((col) => {
                      const active = roleFor(step.id, input.id, col);
                      return (
                        <li
                          key={col}
                          className="flex items-center justify-between gap-2 bg-white rounded-lg border border-canvas-border px-2.5 py-1.5"
                        >
                          <span className="text-[12px] text-ink-800 font-medium truncate">
                            {col}
                          </span>
                          <div className="flex items-center gap-1 shrink-0">
                            {ROLES.map((r) => {
                              const on = active === r.id;
                              return (
                                <button
                                  key={r.id}
                                  type="button"
                                  onClick={() =>
                                    setRole(step.id, input.id, col, on ? null : r.id)
                                  }
                                  className={[
                                    'text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border transition-colors cursor-pointer',
                                    on
                                      ? ROLE_COLORS[r.id]
                                      : 'bg-white text-ink-400 border-canvas-border hover:text-ink-600 hover:border-ink-400',
                                  ].join(' ')}
                                >
                                  {r.label}
                                </button>
                              );
                            })}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 rounded-lg border border-canvas-border bg-white hover:bg-canvas text-[13px] font-semibold text-ink-600 px-4 py-2 transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} />
          Back
        </button>
        <div className="flex items-center gap-3">
          <span className="text-[11.5px] text-ink-400">
            {assignedCount} column {assignedCount === 1 ? 'role' : 'roles'} assigned
          </span>
          <button
            type="button"
            onClick={onNext}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-[13px] font-semibold px-4 py-2 transition-colors cursor-pointer"
          >
            Review & run
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
