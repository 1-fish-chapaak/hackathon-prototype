import { motion } from 'motion/react';
import { Link2 } from 'lucide-react';
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
}

const ROLES: { id: ColumnRole; label: string }[] = [
  { id: 'join_key', label: 'Join key' },
  { id: 'compare', label: 'Compare' },
  { id: 'filter', label: 'Filter' },
  { id: 'output', label: 'Output' },
];

const ROLE_COLORS: Record<ColumnRole, string> = {
  join_key: 'bg-evidence-50 text-evidence-700 border-evidence/30',
  compare: 'bg-brand-50 text-brand-700 border-brand-300',
  filter: 'bg-mitigated-50 text-mitigated-700 border-mitigated/30',
  output: 'bg-compliant-50 text-compliant-700 border-compliant/30',
};

export default function StepMapData({ workflow, mappings, setMappings }: Props) {
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-3"
    >
      <section className="rounded-xl border border-canvas-border bg-canvas-elevated p-4">
        <div className="flex items-center gap-2 mb-1">
          <Link2 size={14} className="text-brand-600" />
          <h3 className="text-[13px] font-semibold text-ink-800">Tell IRA how to use each column</h3>
        </div>
        <p className="text-[12px] text-ink-500 leading-relaxed">
          For each step, pick a role for the columns that matter. Unassigned columns are ignored.
        </p>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {ROLES.map((r) => (
            <span
              key={r.id}
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${ROLE_COLORS[r.id]}`}
            >
              {r.label}
            </span>
          ))}
        </div>
      </section>

      {workflow.steps.map((step, idx) => {
        const relevantInputs = workflow.inputs.filter((i) => step.dataFiles.includes(i.id));
        return (
          <section
            key={step.id}
            className="rounded-xl border border-canvas-border bg-canvas-elevated p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="w-5 h-5 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center text-[10px] font-bold">
                {idx + 1}
              </span>
              <span className="text-[10px] uppercase tracking-wider font-bold text-brand-600">
                {step.type}
              </span>
              <span className="text-[13px] font-semibold text-ink-800 truncate">{step.name}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {relevantInputs.map((input) => (
                <div
                  key={input.id}
                  className="rounded-lg border border-canvas-border bg-canvas p-3"
                >
                  <div className="text-[11.5px] font-semibold text-ink-800 mb-2 flex items-center gap-2">
                    {input.name}
                    <span className="text-[9.5px] uppercase tracking-wider text-ink-400 font-bold">
                      {input.type}
                    </span>
                  </div>
                  <ul className="flex flex-col gap-1.5">
                    {(input.columns ?? []).map((col) => {
                      const active = roleFor(step.id, input.id, col);
                      return (
                        <li
                          key={col}
                          className="flex items-center justify-between gap-2 bg-white rounded-md border border-canvas-border px-2.5 py-1.5"
                        >
                          <span className="text-[11.5px] text-ink-800 font-medium truncate">
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
                                    'text-[9.5px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full border transition-colors cursor-pointer',
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
          </section>
        );
      })}
    </motion.div>
  );
}
