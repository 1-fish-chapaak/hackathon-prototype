import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Play, Loader2, CheckCircle2, AlertTriangle, AlertOctagon } from 'lucide-react';
import type {
  WorkflowDraft,
  JourneyFiles,
  JourneyMappings,
  RunResult,
} from './types';

interface Props {
  workflow: WorkflowDraft;
  files: JourneyFiles;
  mappings: JourneyMappings;
  running: boolean;
  result: RunResult | null;
  onRun: () => void;
  onBack: () => void;
  onRestart: () => void;
}

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
  onRun,
  onBack,
  onRestart,
}: Props) {
  const inputSummary = workflow.inputs.map((i) => ({
    id: i.id,
    name: i.name,
    count: (files[i.id] ?? []).length,
  }));
  const mappingCount = Object.values(mappings).reduce(
    (n, step) => n + Object.values(step).reduce((m, list) => m + list.length, 0),
    0,
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col gap-4"
    >
      {/* Summary */}
      <div className="rounded-2xl border border-canvas-border bg-canvas-elevated p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-brand-600">
              {workflow.category}
            </span>
            <h3 className="text-[16px] font-semibold text-ink-800 tracking-tight mt-0.5">
              {workflow.name}
            </h3>
            <p className="text-[12.5px] text-ink-500 leading-relaxed mt-1 max-w-2xl">
              {workflow.description}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-[10px] uppercase tracking-wider text-ink-400 font-semibold">
              Output
            </div>
            <div className="text-[12.5px] font-semibold text-ink-800">{workflow.output.title}</div>
          </div>
        </div>

        <div className="rounded-xl bg-canvas border border-canvas-border p-3.5 mb-4">
          <div className="text-[10px] uppercase tracking-wider text-ink-400 font-semibold mb-1">
            Prompt
          </div>
          <p className="text-[12.5px] text-ink-800 leading-relaxed whitespace-pre-wrap">
            {workflow.logicPrompt}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <SummaryTile label="Inputs" value={`${workflow.inputs.length}`} />
          <SummaryTile
            label="Files uploaded"
            value={`${inputSummary.reduce((n, i) => n + i.count, 0)}`}
          />
          <SummaryTile label="Steps" value={`${workflow.steps.length}`} />
          <SummaryTile label="Columns mapped" value={`${mappingCount}`} />
        </div>

        <div className="mt-5 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 rounded-lg border border-canvas-border bg-white hover:bg-canvas text-[13px] font-semibold text-ink-600 px-4 py-2 transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} />
            Back
          </button>
          <div className="flex items-center gap-2">
            {result && (
              <button
                type="button"
                onClick={onRestart}
                className="inline-flex items-center gap-1.5 rounded-lg border border-canvas-border bg-white hover:bg-canvas text-[13px] font-semibold text-ink-600 px-4 py-2 transition-colors cursor-pointer"
              >
                Start over
              </button>
            )}
            <button
              type="button"
              disabled={running}
              onClick={onRun}
              className={[
                'inline-flex items-center gap-1.5 rounded-lg text-[13px] font-semibold px-4 py-2 transition-colors',
                running
                  ? 'bg-brand-300 text-white cursor-wait'
                  : 'bg-brand-600 hover:bg-brand-500 text-white cursor-pointer',
              ].join(' ')}
            >
              {running ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Running…
                </>
              ) : result ? (
                <>
                  <Play size={14} />
                  Run again
                </>
              ) : (
                <>
                  <Play size={14} />
                  Run workflow
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            key={result.title}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="rounded-2xl border border-canvas-border bg-canvas-elevated p-6"
          >
            <div className="flex items-baseline justify-between gap-4 mb-1">
              <h4 className="text-[14px] font-semibold text-ink-800 tracking-tight">
                {result.title}
              </h4>
              <span className="text-[11px] uppercase tracking-wider text-ink-400 font-semibold">
                {result.outputType}
              </span>
            </div>
            <p className="text-[12px] text-ink-500 leading-relaxed mb-4">{result.description}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
              {result.stats.map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl border border-canvas-border bg-canvas p-3.5"
                >
                  <div className="text-[10px] uppercase tracking-wider text-ink-400 font-semibold">
                    {s.label}
                  </div>
                  <div className={`mt-1 text-[20px] font-bold ${STAT_TONE[s.tone]}`}>
                    {s.value}
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-canvas-border overflow-hidden">
              <table className="w-full text-[12.5px]">
                <thead className="bg-canvas text-ink-500">
                  <tr>
                    <th className="w-8"></th>
                    {result.columns.map((c) => (
                      <th
                        key={c}
                        className="text-left font-semibold px-3 py-2 whitespace-nowrap"
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
                        <td className="px-2 py-2 align-middle">
                          <Icon size={14} className={ROW_ICON_TONE[r.status]} />
                        </td>
                        {r.cells.map((cell, j) => (
                          <td
                            key={j}
                            className="px-3 py-2 text-ink-800 whitespace-nowrap"
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
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-canvas-border bg-canvas p-3.5">
      <div className="text-[10px] uppercase tracking-wider text-ink-400 font-semibold">
        {label}
      </div>
      <div className="mt-1 text-[18px] font-bold text-ink-800">{value}</div>
    </div>
  );
}
