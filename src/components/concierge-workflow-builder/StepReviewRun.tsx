import { motion, AnimatePresence } from 'motion/react';
import {
  Loader2,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Database,
  ChevronDown,
} from 'lucide-react';
import { useState } from 'react';
import type {
  WorkflowDraft,
  JourneyFiles,
  JourneyMappings,
  RunResult,
  StepSpec,
} from './types';

interface Props {
  workflow: WorkflowDraft;
  files: JourneyFiles;
  mappings: JourneyMappings;
  running: boolean;
  result: RunResult | null;
}

const STEP_BADGE: Record<
  StepSpec['type'],
  { label: string; bg: string; text: string }
> = {
  extract: { label: 'Ingestion', bg: 'bg-brand-50', text: 'text-brand-700' },
  analyze: { label: 'Analysis', bg: 'bg-evidence-50', text: 'text-evidence-700' },
  compare: { label: 'Comparison', bg: 'bg-brand-50', text: 'text-brand-700' },
  flag: { label: 'Flagging', bg: 'bg-risk-50', text: 'text-risk-700' },
  validate: { label: 'Validation', bg: 'bg-evidence-50', text: 'text-evidence-700' },
  summarize: { label: 'Summary', bg: 'bg-compliant-50', text: 'text-compliant-700' },
  calculate: { label: 'Calculation', bg: 'bg-mitigated-50', text: 'text-mitigated-700' },
};

const STAT_TONE: Record<NonNullable<RunResult['stats'][number]['tone']>, string> = {
  primary: 'text-brand-600',
  risk: 'text-risk',
  warning: 'text-mitigated',
  ok: 'text-compliant',
};

const ROW_TONE: Record<'flagged' | 'warning' | 'ok', string> = {
  flagged: 'bg-risk-50 border-l-2 border-risk',
  warning: 'bg-mitigated-50 border-l-2 border-mitigated',
  ok: 'bg-compliant-50 border-l-2 border-compliant',
};

const ROW_ICON = {
  flagged: AlertOctagon,
  warning: AlertTriangle,
  ok: CheckCircle2,
} as const;

const ROW_ICON_TONE: Record<'flagged' | 'warning' | 'ok', string> = {
  flagged: 'text-risk',
  warning: 'text-mitigated',
  ok: 'text-compliant',
};

export default function StepReviewRun({
  workflow,
  files,
  mappings,
  running,
  result,
}: Props) {
  const [expanded, setExpanded] = useState<string | null>(workflow.steps[0]?.id ?? null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-3"
    >
      {/* Summary */}
      <section className="rounded-xl border border-canvas-border bg-canvas-elevated p-4">
        <span className="text-[12px] font-bold uppercaser text-brand-600">
          {workflow.category}
        </span>
        <h3 className="text-[15px] font-semibold text-ink-800 mt-0.5">
          {workflow.name}
        </h3>
        <p className="text-[12px] text-ink-500 leading-relaxed mt-1">{workflow.description}</p>
        <div className="rounded-lg bg-canvas border border-canvas-border p-3 mt-3">
          <div className="text-[12px] uppercaser text-ink-400 font-bold mb-1">
            Prompt
          </div>
          <p className="text-[12px] text-ink-800 leading-relaxed whitespace-pre-wrap">
            {workflow.logicPrompt}
          </p>
        </div>
      </section>

      {/* Steps (collapsible) */}
      {workflow.steps.map((step, idx) => {
        const badge = STEP_BADGE[step.type];
        const relevantInputs = workflow.inputs.filter((i) =>
          step.dataFiles.includes(i.id),
        );
        const isOpen = expanded === step.id;
        return (
          <section
            key={step.id}
            className="rounded-xl border border-canvas-border bg-canvas-elevated"
          >
            <button
              type="button"
              onClick={() => setExpanded(isOpen ? null : step.id)}
              className="w-full flex items-center justify-between gap-3 px-4 py-3 cursor-pointer"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-6 h-6 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center text-[12px] font-bold shrink-0">
                  {idx + 1}
                </span>
                <span
                  className={`text-[12px] uppercaser font-bold rounded-full px-1.5 py-0.5 ${badge.bg} ${badge.text}`}
                >
                  {badge.label}
                </span>
                <span className="text-[13px] font-semibold text-ink-800 truncate">
                  {step.name}
                </span>
              </div>
              <ChevronDown
                size={14}
                className={`text-ink-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {isOpen && (
              <div className="px-4 pb-4">
                <p className="text-[12px] text-ink-600 leading-relaxed mb-3">
                  {step.description}
                </p>
                <div className="text-[12px] uppercaser font-bold text-ink-400 mb-1.5">
                  Data sources used
                </div>
                <ul className="space-y-1.5">
                  {relevantInputs.map((input) => {
                    const mapped = mappings[step.id]?.[input.id] ?? [];
                    const count = (files[input.id] ?? []).length;
                    return (
                      <li
                        key={input.id}
                        className="flex items-center gap-2 bg-canvas rounded-md border border-canvas-border px-3 py-1.5"
                      >
                        <Database size={12} className="text-brand-600 shrink-0" />
                        <span className="text-[12px] font-semibold text-ink-800 truncate">
                          {input.name}
                        </span>
                        <span className="text-[12px] text-ink-400 ml-auto">
                          {count} file{count === 1 ? '' : 's'} · {mapped.length} column
                          {mapped.length === 1 ? '' : 's'}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </section>
        );
      })}

      {/* Output intent */}
      <section className="rounded-xl border border-compliant/40 bg-compliant-50 p-4">
        <div className="text-[12px] uppercaser font-bold text-compliant-700 mb-1">
          {workflow.output.type} output
        </div>
        <div className="text-[14px] font-semibold text-ink-800 leading-tight mb-1">
          {workflow.output.title}
        </div>
        <p className="text-[12px] text-ink-600 leading-relaxed">
          {workflow.output.description}
        </p>
      </section>

      {/* Running / Result */}
      {running && (
        <div className="rounded-xl border border-canvas-border bg-canvas-elevated p-5 flex items-center gap-3">
          <Loader2 size={18} className="animate-spin text-brand-600 shrink-0" />
          <div>
            <div className="text-[13px] font-semibold text-ink-800">Running workflow…</div>
            <div className="text-[12px] text-ink-500">
              Ingesting, validating, and generating your output.
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {result && (
          <motion.section
            key={result.title}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-xl border border-canvas-border bg-canvas-elevated p-4"
          >
            <div className="flex items-baseline justify-between gap-4 mb-1">
              <h4 className="text-[14px] font-semibold text-ink-800">
                {result.title}
              </h4>
              <span className="text-[12px] uppercaser text-ink-400 font-bold">
                {result.outputType}
              </span>
            </div>
            <p className="text-[12px] text-ink-500 leading-relaxed mb-3">
              {result.description}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
              {result.stats.map((s) => (
                <div
                  key={s.label}
                  className="rounded-lg border border-canvas-border bg-canvas p-3"
                >
                  <div className="text-[9.5px] uppercaser text-ink-400 font-bold">
                    {s.label}
                  </div>
                  <div className={`mt-0.5 text-[17px] font-bold ${STAT_TONE[s.tone]}`}>
                    {s.value}
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-lg border border-canvas-border overflow-hidden">
              <table className="w-full text-[12px]">
                <thead className="bg-canvas text-ink-500">
                  <tr>
                    <th className="w-7"></th>
                    {result.columns.map((c) => (
                      <th
                        key={c}
                        className="text-left font-semibold px-2.5 py-1.5 whitespace-nowrap"
                      >
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((r, i) => {
                    const Icon = ROW_ICON[r.status];
                    return (
                      <tr
                        key={i}
                        className={`${ROW_TONE[r.status]} ${i === 0 ? '' : 'border-t border-canvas-border'}`}
                      >
                        <td className="px-2 py-1.5 align-middle">
                          <Icon size={13} className={ROW_ICON_TONE[r.status]} />
                        </td>
                        {r.cells.map((cell, j) => (
                          <td
                            key={j}
                            className="px-2.5 py-1.5 text-ink-800 whitespace-nowrap"
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
