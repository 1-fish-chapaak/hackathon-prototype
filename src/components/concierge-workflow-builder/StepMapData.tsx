import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  X,
  File as FileIcon,
  Eye,
  ArrowLeftRight,
  Info,
} from 'lucide-react';
import type {
  WorkflowDraft,
  JourneyFiles,
  JourneyAlignments,
  ColumnAlignment,
  InputSpec,
} from './types';

interface Props {
  workflow: WorkflowDraft;
  files: JourneyFiles;
  alignments: JourneyAlignments;
  setAlignments: (a: JourneyAlignments) => void;
}

const AUTO_THRESHOLD = 85;

const DTYPE_STYLE: Record<string, string> = {
  STRING: 'bg-slate-100 text-slate-500',
  DECIMAL: 'bg-brand-50 text-brand-700',
  INT: 'bg-evidence-50 text-evidence-700',
  TIMESTAMP: 'bg-mitigated-50 text-mitigated-700',
  BOOL: 'bg-compliant-50 text-compliant-700',
};

function confidenceColor(c: number): string {
  if (c >= 85) return 'text-compliant';
  if (c >= 70) return 'text-mitigated';
  if (c >= 55) return 'text-high';
  return 'text-risk';
}

function barColor(c: number): string {
  if (c >= 80) return 'bg-compliant';
  if (c >= 60) return 'bg-mitigated';
  return 'bg-risk';
}

export default function StepMapData({ workflow, files, alignments, setAlignments }: Props) {
  const [expanded, setExpanded] = useState<string | null>(
    workflow.inputs[0]?.id ?? null,
  );
  const [autoExpanded, setAutoExpanded] = useState<Record<string, boolean>>({});
  const [popover, setPopover] = useState<string | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-3"
    >
      {workflow.inputs.map((input) => {
        const list = alignments[input.id] ?? [];
        const isOpen = expanded === input.id;
        const uploaded = files[input.id] ?? [];
        const mappedCount = list.filter((a) => !!a.target).length;
        const matchPct = list.length
          ? Math.round(list.reduce((n, a) => n + a.confidence, 0) / list.length)
          : 0;

        return (
          <section
            key={input.id}
            className="rounded-2xl border border-canvas-border bg-canvas-elevated overflow-hidden"
          >
            {/* Header */}
            <button
              type="button"
              onClick={() => setExpanded(isOpen ? null : input.id)}
              className="w-full flex items-start justify-between px-5 py-4 cursor-pointer hover:bg-brand-50/40 transition-colors text-left"
            >
              <div className="min-w-0">
                <div className="text-[14px] font-bold text-ink-900">{input.name}</div>
                <p className="text-[11.5px] text-ink-400 mt-0.5 line-clamp-1">
                  {input.description}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-4">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[18px] font-bold text-ink-800 tabular-nums leading-tight">
                    {mappedCount}/{list.length || input.columns?.length || 0}
                  </span>
                  <span className="text-[10px] text-ink-400 font-semibold leading-tight">
                    columns
                    <br />
                    mapped
                  </span>
                </div>
                <ChevronDown
                  size={16}
                  className={`text-ink-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
              </div>
            </button>

            {/* Mapped sources row */}
            <div className="px-5 pb-3 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold text-ink-500">Mapped Sources</span>
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-semibold text-brand-700 hover:bg-brand-50 transition-colors cursor-pointer"
              >
                <Eye size={11} />
                Preview
              </button>

              <div className="flex items-center flex-wrap gap-1.5 ml-1 flex-1">
                {uploaded.length === 0 ? (
                  <span className="text-[11px] text-ink-400">No files linked yet.</span>
                ) : (
                  <>
                    {uploaded.slice(0, 2).map((f, i) => (
                      <span
                        key={`${f.name}-${i}`}
                        className="inline-flex items-center gap-1.5 rounded-md border border-canvas-border bg-white px-2 py-0.5 text-[11px] text-ink-700"
                      >
                        <FileIcon size={10} className="text-brand-600" />
                        <span className="max-w-[160px] truncate">{f.name}</span>
                        <X size={10} className="text-ink-400" />
                      </span>
                    ))}
                    {uploaded.length > 2 && (
                      <span className="text-[10.5px] text-ink-500 font-semibold">
                        + {uploaded.length - 2} more
                      </span>
                    )}
                  </>
                )}
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-md border border-canvas-border bg-canvas hover:bg-brand-50 hover:border-brand-300 px-2 py-0.5 text-[11px] font-semibold text-ink-600 transition-colors cursor-pointer"
                >
                  <ArrowLeftRight size={10} />
                  Select File(s)
                </button>
              </div>

              {list.length > 0 && (
                <span
                  className={[
                    'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wider',
                    matchPct >= 85
                      ? 'bg-compliant-50 text-compliant-700'
                      : matchPct >= 65
                        ? 'bg-mitigated-50 text-mitigated-700'
                        : 'bg-risk-50 text-risk-700',
                  ].join(' ')}
                  title="Aggregate match score across all column alignments"
                >
                  {matchPct}% Match
                </span>
              )}
            </div>

            {/* Column Alignment */}
            {isOpen && (
              <div className="border-t border-canvas-border">
                <div className="px-5 pt-3 pb-2">
                  <div className="text-[12px] font-semibold text-ink-700 flex items-center gap-1.5">
                    <Sparkles size={11} className="text-brand-600" />
                    Column Alignment
                  </div>
                </div>
                <ColumnAlignmentTable
                  input={input}
                  rows={list}
                  autoExpanded={!!autoExpanded[input.id]}
                  onToggleAuto={() =>
                    setAutoExpanded((prev) => ({
                      ...prev,
                      [input.id]: !prev[input.id],
                    }))
                  }
                  openPopoverId={popover}
                  onOpenPopover={(id) => setPopover(popover === id ? null : id)}
                  onClosePopover={() => setPopover(null)}
                  onUpdate={(next) =>
                    setAlignments({ ...alignments, [input.id]: next })
                  }
                />
              </div>
            )}
          </section>
        );
      })}
    </motion.div>
  );
}

// ─── Column alignment table ───────────────────────────────────────────

interface TableProps {
  input: InputSpec;
  rows: ColumnAlignment[];
  autoExpanded: boolean;
  onToggleAuto: () => void;
  openPopoverId: string | null;
  onOpenPopover: (id: string) => void;
  onClosePopover: () => void;
  onUpdate: (rows: ColumnAlignment[]) => void;
}

function ColumnAlignmentTable({
  input,
  rows,
  autoExpanded,
  onToggleAuto,
  openPopoverId,
  onOpenPopover,
  onClosePopover,
  onUpdate,
}: TableProps) {
  const auto = rows.filter((r) => r.confidence >= AUTO_THRESHOLD && !r.reason);
  const exceptions = rows.filter((r) => r.confidence < AUTO_THRESHOLD || !!r.reason);
  const avgAuto = auto.length
    ? Math.round(auto.reduce((s, r) => s + r.confidence, 0) / auto.length)
    : 0;

  const clearReason = (id: string) => {
    onUpdate(
      rows.map((r) => (r.id === id ? { ...r, reason: null, confidence: Math.max(r.confidence, AUTO_THRESHOLD) } : r)),
    );
  };

  if (rows.length === 0) {
    return (
      <div className="px-5 pb-5 text-[11.5px] text-ink-400">
        No columns detected for {input.name}.
      </div>
    );
  }

  return (
    <div className="border-t border-canvas-border">
      {/* Sub-header */}
      <div className="grid grid-cols-[1fr_20px_1fr_90px] gap-3 px-5 py-2 text-[9.5px] font-bold uppercase tracking-[0.12em] text-ink-400 border-b border-canvas-border bg-canvas/60">
        <span>Source Column</span>
        <span />
        <span>Target Schema</span>
        <span className="text-right">Confidence</span>
      </div>

      {/* Auto-mapped summary row */}
      {auto.length > 0 && (
        <>
          <button
            type="button"
            onClick={onToggleAuto}
            className="w-full flex items-center justify-between px-5 py-2.5 bg-brand-50/60 hover:bg-brand-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 size={13} className="text-brand-600" />
              <span className="text-[12px] text-brand-700 font-semibold">
                {auto.length} field{auto.length === 1 ? '' : 's'} auto-mapped
                <span className="text-brand-400/70 mx-1.5">·</span>
                <span className="font-medium text-brand-500">
                  avg {avgAuto}% confidence
                </span>
              </span>
            </div>
            <span className="inline-flex items-center gap-0.5 text-[11.5px] text-brand-600 font-semibold">
              {autoExpanded ? 'Collapse' : 'Expand'}
              {autoExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </span>
          </button>
          {autoExpanded && (
            <div>
              {auto.map((row) => (
                <FieldRow
                  key={row.id}
                  row={row}
                  variant="auto"
                  popoverOpen={openPopoverId === row.id}
                  onOpenPopover={() => onOpenPopover(row.id)}
                  onClosePopover={onClosePopover}
                  onClearReason={clearReason}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Needs attention */}
      {exceptions.length > 0 && (
        <>
          <div className="px-5 py-2 flex items-center gap-2 bg-mitigated-50 border-y border-canvas-border">
            <AlertTriangle size={12} className="text-mitigated" />
            <span className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-mitigated-700">
              Needs Attention ({exceptions.length})
            </span>
          </div>
          <div>
            {exceptions.map((row) => (
              <FieldRow
                key={row.id}
                row={row}
                variant="exception"
                popoverOpen={openPopoverId === row.id}
                onOpenPopover={() => onOpenPopover(row.id)}
                onClosePopover={onClosePopover}
                onClearReason={clearReason}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Single alignment row ─────────────────────────────────────────────

interface FieldRowProps {
  row: ColumnAlignment;
  variant: 'auto' | 'exception';
  popoverOpen: boolean;
  onOpenPopover: () => void;
  onClosePopover: () => void;
  onClearReason: (id: string) => void;
}

function FieldRow({
  row,
  variant,
  popoverOpen,
  onOpenPopover,
  onClosePopover,
  onClearReason,
}: FieldRowProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!popoverOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) onClosePopover();
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [popoverOpen, onClosePopover]);

  const accent =
    variant === 'exception'
      ? row.reason === 'type_mismatch'
        ? 'border-l-2 border-mitigated'
        : 'border-l-2 border-risk/40'
      : 'border-l-2 border-transparent';

  return (
    <div
      ref={wrapperRef}
      className={`relative grid grid-cols-[1fr_20px_1fr_90px] items-center gap-3 px-5 py-2.5 border-b border-canvas-border last:border-b-0 ${accent}`}
    >
      {/* Source */}
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-[12.5px] font-semibold text-ink-800 truncate">
          {row.source.name}
        </span>
        <span
          className={`text-[9.5px] font-bold uppercase tracking-wider rounded px-1.5 py-0.5 shrink-0 ${DTYPE_STYLE[row.source.dtype] ?? DTYPE_STYLE.STRING}`}
        >
          {row.source.dtype}
        </span>
        {row.reason === 'type_mismatch' && row.target && (
          <span className="text-[9.5px] font-bold text-mitigated-700 bg-mitigated-50 rounded px-1.5 py-0.5 shrink-0">
            ≠ {row.target.dtype}
          </span>
        )}
      </div>

      <div className="text-center text-ink-300 text-[13px] leading-none select-none">→</div>

      {/* Target */}
      <div className="flex items-center gap-2 min-w-0">
        {row.target ? (
          <>
            <span className="text-[12.5px] font-semibold text-ink-800 truncate">
              {row.target.name}
            </span>
            <span
              className={`text-[9.5px] font-bold uppercase tracking-wider rounded px-1.5 py-0.5 shrink-0 ${DTYPE_STYLE[row.target.dtype] ?? DTYPE_STYLE.STRING}`}
            >
              {row.target.dtype}
            </span>
          </>
        ) : (
          <button
            type="button"
            className="text-[11.5px] font-semibold text-brand-700 hover:underline cursor-pointer"
          >
            + Map target…
          </button>
        )}
      </div>

      {/* Confidence + info */}
      <div className="flex items-center justify-end gap-1 tabular-nums">
        <span className={`text-[13px] font-bold ${confidenceColor(row.confidence)}`}>
          {row.confidence}%
        </span>
        <button
          type="button"
          onClick={onOpenPopover}
          className="w-5 h-5 rounded-full text-ink-400 hover:text-brand-600 hover:bg-brand-50 transition-colors flex items-center justify-center cursor-pointer"
          aria-label="AI justification"
        >
          <Info size={12} />
        </button>
      </div>

      {/* Popover */}
      {popoverOpen && (
        <AIJustificationPopover row={row} onClose={onClosePopover} onAccept={() => {
          onClearReason(row.id);
          onClosePopover();
        }} />
      )}
    </div>
  );
}

// ─── AI Justification popover ─────────────────────────────────────────

function AIJustificationPopover({
  row,
  onClose,
  onAccept,
}: {
  row: ColumnAlignment;
  onClose: () => void;
  onAccept: () => void;
}) {
  const metrics = [
    { label: 'Name Similarity', weight: 35, score: row.breakdown.nameSimilarity, desc: 'Fuzzy string matching & token comparison' },
    { label: 'Type Compatibility', weight: 25, score: row.breakdown.typeCompatibility, desc: 'Data type inference & format alignment' },
    { label: 'Statistical Profile', weight: 20, score: row.breakdown.statisticalProfile, desc: 'Value distribution, cardinality & null ratio' },
    { label: 'Semantic Similarity', weight: 20, score: row.breakdown.semanticSimilarity, desc: 'Embedding-based meaning comparison' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 4, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
      className="absolute right-4 top-11 z-20 w-[300px] rounded-xl bg-canvas-elevated border border-canvas-border shadow-xl"
    >
      <div className="flex items-center justify-between px-3.5 pt-3 pb-2">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded bg-brand-100 text-brand-600 flex items-center justify-center">
            <Sparkles size={11} />
          </div>
          <span className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-brand-700">
            AI Justification
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-ink-400 hover:text-ink-800 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X size={12} />
        </button>
      </div>
      <div className="px-3.5 pb-3 space-y-2.5">
        {metrics.map((m) => (
          <div key={m.label}>
            <div className="flex items-baseline justify-between mb-1">
              <div className="flex items-baseline gap-1.5">
                <span className="text-[11.5px] font-bold text-ink-800">{m.label}</span>
                <span className="text-[9.5px] font-medium text-ink-400">×{m.weight}%</span>
              </div>
              <span className={`text-[11.5px] font-bold tabular-nums ${confidenceColor(m.score)}`}>
                {m.score}%
              </span>
            </div>
            <div className="w-full h-[5px] bg-canvas rounded-full overflow-hidden mb-0.5">
              <div
                className={`h-full rounded-full transition-all duration-500 ${barColor(m.score)}`}
                style={{ width: `${m.score}%` }}
              />
            </div>
            <p className="text-[9.5px] text-ink-400 leading-snug">{m.desc}</p>
          </div>
        ))}
      </div>
      <div className="mx-3.5 border-t border-canvas-border" />
      <div className="px-3.5 py-2.5">
        <p className="text-[10.5px] text-ink-600 leading-relaxed">{row.explanation}</p>
        <div className="flex items-center justify-between gap-2 mt-2">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={[
                'inline-flex items-center rounded-full border px-2 py-0.5 text-[9.5px] font-bold tracking-wide',
                row.confidence >= 85
                  ? 'bg-compliant-50 text-compliant-700 border-compliant/40'
                  : row.confidence >= 70
                    ? 'bg-mitigated-50 text-mitigated-700 border-mitigated/40'
                    : 'bg-risk-50 text-risk-700 border-risk/40',
              ].join(' ')}
            >
              Overall: {row.confidence}%
            </span>
            <span className="text-[9.5px] text-ink-400 truncate">
              {row.source.name} → {row.target?.name ?? '—'}
            </span>
          </div>
          {row.reason && (
            <button
              type="button"
              onClick={onAccept}
              className="inline-flex items-center gap-1 rounded-md bg-brand-600 hover:bg-brand-500 text-white text-[10.5px] font-semibold px-2 py-1 transition-colors cursor-pointer"
            >
              Accept
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

