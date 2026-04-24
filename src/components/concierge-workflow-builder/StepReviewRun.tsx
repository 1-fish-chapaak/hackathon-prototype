import { motion, AnimatePresence, Reorder, useDragControls } from 'motion/react';
import {
  Loader2,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  ChevronDown,
  Pencil,
  Trash2,
  GripVertical,
  Check,
  X,
} from 'lucide-react';
import { useState, type Dispatch, type SetStateAction } from 'react';
import type {
  WorkflowDraft,
  JourneyFiles,
  JourneyMappings,
  RunResult,
  StepSpec,
  ColumnRole,
} from './types';

interface Props {
  workflow: WorkflowDraft;
  setWorkflow: Dispatch<SetStateAction<WorkflowDraft | null>>;
  files: JourneyFiles;
  mappings: JourneyMappings;
  setMappings: Dispatch<SetStateAction<JourneyMappings>>;
  running: boolean;
  result: RunResult | null;
  expandedSource?: string | null;
  setExpandedSource?: Dispatch<SetStateAction<string | null>>;
}

const STEP_BADGE: Record<
  StepSpec['type'],
  { label: string; bg: string; text: string }
> = {
  extract: { label: 'INGESTION', bg: 'bg-brand-50', text: 'text-brand-700' },
  analyze: { label: 'ANALYSIS', bg: 'bg-brand-600', text: 'text-white' },
  compare: { label: 'COMPARISON', bg: 'bg-brand-50', text: 'text-brand-700' },
  flag: { label: 'FLAGGING', bg: 'bg-risk-50', text: 'text-risk-700' },
  validate: { label: 'VALIDATION', bg: 'bg-evidence-50', text: 'text-evidence-700' },
  summarize: { label: 'SUMMARY', bg: 'bg-compliant-50', text: 'text-compliant-700' },
  calculate: { label: 'CALCULATION', bg: 'bg-mitigated-50', text: 'text-mitigated-700' },
};

const ROLE_BADGE: Record<ColumnRole, { label: string; bg: string; text: string }> = {
  join_key: { label: 'JOIN KEY', bg: 'bg-blue-100', text: 'text-blue-700' },
  filter: { label: 'FILTER', bg: 'bg-risk-50', text: 'text-risk-700' },
  compare: { label: 'COMPARE', bg: 'bg-brand-50', text: 'text-brand-700' },
  output: { label: 'OUTPUT', bg: 'bg-compliant-50', text: 'text-compliant-700' },
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

const STEP_TYPES: StepSpec['type'][] = [
  'extract',
  'analyze',
  'compare',
  'validate',
  'flag',
  'calculate',
  'summarize',
];

interface StepCardProps {
  step: StepSpec;
  idx: number;
  workflow: WorkflowDraft;
  mappings: JourneyMappings;
  expandedSource: string | null;
  setExpandedSource: (key: string | null) => void;
  onSaveStep: (next: StepSpec) => void;
  onDeleteStep: (stepId: string) => void;
}

function StepCard({
  step,
  idx,
  workflow,
  mappings,
  expandedSource,
  setExpandedSource,
  onSaveStep,
  onDeleteStep,
}: StepCardProps) {
  const dragControls = useDragControls();
  const [mode, setMode] = useState<'view' | 'edit' | 'confirm-delete'>('view');
  const [draftName, setDraftName] = useState(step.name);
  const [draftDesc, setDraftDesc] = useState(step.description);
  const [draftType, setDraftType] = useState<StepSpec['type']>(step.type);

  const badge = STEP_BADGE[step.type];
  const relevantInputs = workflow.inputs.filter((i) =>
    step.dataFiles.includes(i.id),
  );
  const stepMappings = mappings[step.id] ?? {};

  const startEdit = () => {
    setDraftName(step.name);
    setDraftDesc(step.description);
    setDraftType(step.type);
    setMode('edit');
  };

  const commitEdit = () => {
    const name = draftName.trim();
    if (!name) return;
    onSaveStep({
      ...step,
      name,
      description: draftDesc.trim(),
      type: draftType,
    });
    setMode('view');
  };

  const cancelEdit = () => {
    setMode('view');
  };

  return (
    <Reorder.Item
      value={step}
      dragListener={false}
      dragControls={dragControls}
      layout
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="list-none"
      whileDrag={{
        scale: 1.01,
        boxShadow: '0 12px 28px -8px rgba(16, 24, 40, 0.18)',
        cursor: 'grabbing',
      }}
    >
      <section className="group relative rounded-xl border border-canvas-border bg-canvas-elevated p-4">
        {/* Top-right actions */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
          {mode === 'view' && (
            <>
              <button
                type="button"
                onClick={startEdit}
                aria-label="Edit step"
                title="Edit step"
                className="w-7 h-7 rounded-md text-ink-400 hover:text-brand-600 hover:bg-brand-50 flex items-center justify-center cursor-pointer transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
              >
                <Pencil size={13} />
              </button>
              <button
                type="button"
                onClick={() => setMode('confirm-delete')}
                aria-label="Delete step"
                title="Delete step"
                className="w-7 h-7 rounded-md text-ink-400 hover:text-risk hover:bg-risk-50 flex items-center justify-center cursor-pointer transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
              >
                <Trash2 size={13} />
              </button>
            </>
          )}

          {mode === 'edit' && (
            <>
              <button
                type="button"
                onClick={cancelEdit}
                aria-label="Cancel edit"
                title="Cancel"
                className="w-7 h-7 rounded-md text-ink-500 hover:bg-canvas flex items-center justify-center cursor-pointer transition-colors"
              >
                <X size={14} />
              </button>
              <button
                type="button"
                onClick={commitEdit}
                aria-label="Save step"
                title="Save"
                disabled={!draftName.trim()}
                className="w-7 h-7 rounded-md bg-brand-600 hover:bg-brand-500 text-white disabled:bg-ink-200 disabled:text-ink-400 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer transition-colors"
              >
                <Check size={14} />
              </button>
            </>
          )}

          {mode === 'confirm-delete' && (
            <div className="flex items-center gap-1.5 rounded-md border border-risk/30 bg-risk-50 px-2 py-1">
              <span className="text-[11px] font-semibold text-risk-700">Delete step?</span>
              <button
                type="button"
                onClick={() => setMode('view')}
                className="text-[11px] font-semibold text-ink-600 hover:text-ink-800 px-1.5 py-0.5 rounded cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => onDeleteStep(step.id)}
                className="text-[11px] font-semibold text-white bg-risk hover:bg-risk/90 px-2 py-0.5 rounded cursor-pointer"
              >
                Delete
              </button>
            </div>
          )}
        </div>

        <div className="flex items-start gap-2">
          {/* Drag handle */}
          <button
            type="button"
            onPointerDown={(e) => dragControls.start(e)}
            aria-label="Drag to reorder"
            title="Drag to reorder"
            className="shrink-0 mt-1 w-5 h-7 flex items-center justify-center text-ink-300 hover:text-ink-600 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity touch-none"
          >
            <GripVertical size={14} />
          </button>

          <span className="w-7 h-7 rounded-full bg-ink-900 text-white flex items-center justify-center text-[12px] font-bold shrink-0 mt-0.5">
            {idx + 1}
          </span>

          <div className="min-w-0 flex-1 pr-16">
            {mode === 'edit' ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <input
                    type="text"
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        commitEdit();
                      } else if (e.key === 'Escape') {
                        e.preventDefault();
                        cancelEdit();
                      }
                    }}
                    autoFocus
                    placeholder="Step name"
                    className="flex-1 min-w-[180px] text-[15px] font-semibold text-ink-800 bg-canvas border border-canvas-border rounded-md px-2 py-1 focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400"
                  />
                  <select
                    value={draftType}
                    onChange={(e) => setDraftType(e.target.value as StepSpec['type'])}
                    className="text-[11px] font-bold tracking-wider rounded-md px-2 py-1 bg-canvas border border-canvas-border text-ink-700 cursor-pointer focus:outline-none focus:border-brand-400"
                  >
                    {STEP_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {STEP_BADGE[t].label}
                      </option>
                    ))}
                  </select>
                </div>
                <textarea
                  value={draftDesc}
                  onChange={(e) => setDraftDesc(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      e.preventDefault();
                      cancelEdit();
                    }
                  }}
                  placeholder="What does this step do?"
                  rows={2}
                  className="w-full text-[12.5px] text-ink-700 leading-relaxed bg-canvas border border-canvas-border rounded-md px-2 py-1.5 resize-none focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400"
                />
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-[15px] font-semibold text-ink-800">
                    {step.name}
                  </h3>
                  <span
                    className={`text-[10.5px] font-bold tracking-wider rounded-md px-2 py-0.5 ${badge.bg} ${badge.text}`}
                  >
                    {badge.label}
                  </span>
                </div>
                <p className="text-[12.5px] text-ink-500 leading-relaxed mt-0.5">
                  {step.description}
                </p>
              </>
            )}

            {relevantInputs.length > 0 && (
              <>
                <div className="text-[11px] font-bold text-ink-400 tracking-wider mt-4 mb-2">
                  DATA SOURCES USED
                </div>
                <div className="flex flex-wrap gap-2">
                  {relevantInputs.map((input) => {
                    const key = `${step.id}:${input.id}`;
                    const isOpen = expandedSource === key;
                    const mappedCols = stepMappings[input.id] ?? [];
                    const columnNames =
                      mappedCols.length > 0
                        ? mappedCols.map((m) => m.column)
                        : input.columns ?? [];
                    const colCount = columnNames.length;
                    return (
                      <div key={input.id} className="flex flex-col">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedSource(isOpen ? null : key)
                          }
                          className={[
                            'inline-flex items-center gap-2 rounded-lg border text-[12.5px] px-3 py-1.5 transition-colors cursor-pointer',
                            isOpen
                              ? 'border-brand-400 bg-brand-50/60 text-ink-800'
                              : 'border-canvas-border bg-canvas text-ink-700 hover:border-brand-300',
                          ].join(' ')}
                        >
                          <span
                            className={[
                              'w-1.5 h-1.5 rounded-full',
                              isOpen ? 'bg-brand-600' : 'bg-compliant',
                            ].join(' ')}
                          />
                          <span className="font-semibold">{input.name}</span>
                          <span className="text-ink-400 text-[12px]">
                            {colCount} col{colCount === 1 ? '' : 's'}
                          </span>
                          <ChevronDown
                            size={13}
                            className={`text-ink-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                          />
                        </button>
                      </div>
                    );
                  })}
                </div>

                <AnimatePresence initial={false}>
                  {(() => {
                    const openInput = relevantInputs.find(
                      (i) => expandedSource === `${step.id}:${i.id}`,
                    );
                    if (!openInput) return null;
                    const mappedCols =
                      stepMappings[openInput.id] ?? [];
                    const columnNames =
                      mappedCols.length > 0
                        ? mappedCols.map((m) => m.column)
                        : openInput.columns ?? [];
                    const roleByColumn = new Map(
                      mappedCols.map((m) => [m.column, m.role] as const),
                    );
                    return (
                      <motion.div
                        key={`${step.id}:${openInput.id}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                        className="overflow-hidden"
                      >
                        <div className="mt-2 rounded-lg border border-canvas-border bg-canvas p-3">
                          <div className="text-[12.5px] font-semibold text-ink-800 mb-2">
                            {openInput.name}
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {columnNames.length === 0 && (
                              <div className="text-[12px] text-ink-400">
                                No columns configured for this source yet.
                              </div>
                            )}
                            {columnNames.map((col) => {
                              const role = roleByColumn.get(col);
                              const roleBadge = role
                                ? ROLE_BADGE[role]
                                : null;
                              return (
                                <span
                                  key={col}
                                  className="inline-flex items-center gap-1.5 rounded-md border border-canvas-border bg-canvas-elevated px-2 py-1 text-[12px] text-ink-700"
                                >
                                  {col}
                                  {roleBadge && (
                                    <span
                                      className={`text-[9.5px] font-bold tracking-wider rounded px-1.5 py-0.5 ${roleBadge.bg} ${roleBadge.text}`}
                                    >
                                      {roleBadge.label}
                                    </span>
                                  )}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })()}
                </AnimatePresence>
              </>
            )}
          </div>
        </div>
      </section>
    </Reorder.Item>
  );
}

export default function StepReviewRun({
  workflow,
  setWorkflow,
  mappings,
  setMappings,
  running,
  result,
  expandedSource: expandedSourceProp,
  setExpandedSource: setExpandedSourceProp,
}: Props) {
  const [internalExpandedSource, setInternalExpandedSource] = useState<string | null>(null);
  const expandedSource =
    expandedSourceProp !== undefined ? expandedSourceProp : internalExpandedSource;
  const setExpandedSource = setExpandedSourceProp ?? setInternalExpandedSource;

  const handleReorder = (next: StepSpec[]) => {
    setWorkflow((prev) => (prev ? { ...prev, steps: next } : prev));
  };

  const handleSaveStep = (next: StepSpec) => {
    setWorkflow((prev) =>
      prev
        ? {
            ...prev,
            steps: prev.steps.map((s) => (s.id === next.id ? next : s)),
          }
        : prev,
    );
  };

  const handleDeleteStep = (stepId: string) => {
    setWorkflow((prev) =>
      prev ? { ...prev, steps: prev.steps.filter((s) => s.id !== stepId) } : prev,
    );
    setMappings((prev) => {
      if (!(stepId in prev)) return prev;
      const { [stepId]: _drop, ...rest } = prev;
      return rest;
    });
    setExpandedSource((key) => (key && key.startsWith(`${stepId}:`) ? null : key));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-3"
    >
      {/* Steps — execution plan (drag to reorder) */}
      <Reorder.Group
        axis="y"
        values={workflow.steps}
        onReorder={handleReorder}
        className="flex flex-col gap-3 list-none p-0 m-0"
      >
        {workflow.steps.map((step, idx) => (
          <StepCard
            key={step.id}
            step={step}
            idx={idx}
            workflow={workflow}
            mappings={mappings}
            expandedSource={expandedSource}
            setExpandedSource={setExpandedSource}
            onSaveStep={handleSaveStep}
            onDeleteStep={handleDeleteStep}
          />
        ))}
      </Reorder.Group>

      {/* Output intent */}
      <section className="rounded-xl border border-compliant/40 bg-compliant-50 p-4">
        <div className="text-[12px] font-bold text-compliant-700 mb-1">
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
              <span className="text-[12px] text-ink-400 font-bold">
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
                  <div className="text-[9.5px] text-ink-400 font-bold">
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
