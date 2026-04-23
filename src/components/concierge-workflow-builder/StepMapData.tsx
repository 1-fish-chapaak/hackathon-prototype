import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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
  Plus,
  Search,
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
  setFiles: (f: JourneyFiles) => void;
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

export default function StepMapData({ workflow, files, setFiles, alignments, setAlignments }: Props) {
  const [expanded, setExpanded] = useState<string | null>(
    workflow.inputs[0]?.id ?? null,
  );
  const [autoExpanded, setAutoExpanded] = useState<Record<string, boolean>>({});
  const [popover, setPopover] = useState<string | null>(null);
  const [selectFileOpen, setSelectFileOpen] = useState<string | null>(null);
  const [selectFileSearch, setSelectFileSearch] = useState('');
  const [previewInput, setPreviewInput] = useState<{ name: string; files: { name: string }[] } | null>(null);

  // Collect all uploaded files across all inputs for the file selector
  const allUploadedFiles = useMemo(() => {
    const all: { name: string; inputId: string }[] = [];
    Object.entries(files).forEach(([inputId, fileList]) => {
      fileList.forEach((f) => all.push({ name: f.name, inputId }));
    });
    return all;
  }, [files]);

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
            className="rounded-2xl border border-canvas-border bg-canvas-elevated overflow-visible"
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

            {/* Mapped sources */}
            <div className="px-5 pb-4">
              <div className="border-t border-canvas-border/30 mb-3" />

              {/* Row 1: label + preview · match */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-ink-400">
                    Mapped Sources
                  </span>
                  {uploaded.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setPreviewInput({ name: input.name, files: uploaded })}
                      className="inline-flex items-center gap-1.5 rounded-full border border-canvas-border bg-canvas-elevated hover:border-ink-300 hover:text-ink-800 px-2.5 py-0.5 text-[11px] font-semibold text-ink-600 transition-colors cursor-pointer"
                    >
                      <Eye size={11} />
                      Preview
                    </button>
                  )}
                </div>
                {list.length > 0 && (
                  <div
                    className={[
                      'inline-flex items-center gap-1 tabular-nums',
                      matchPct >= 85
                        ? 'text-compliant-700'
                        : matchPct >= 65
                          ? 'text-mitigated-700'
                          : 'text-risk-700',
                    ].join(' ')}
                    title="Aggregate match score across all column alignments"
                  >
                    <span className="text-[11px] font-bold uppercase tracking-wider">
                      {matchPct}% Match
                    </span>
                    <Info
                      size={12}
                      className={
                        matchPct >= 85
                          ? 'text-compliant/70'
                          : matchPct >= 65
                            ? 'text-mitigated/80'
                            : 'text-risk/80'
                      }
                    />
                  </div>
                )}
              </div>

              {/* Row 2: file pills · select button */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center flex-wrap gap-1.5 min-w-0">
                  {uploaded.length === 0 ? (
                    <span className="text-[11.5px] text-ink-400 italic">
                      No files mapped. Upload or choose a file to get started.
                    </span>
                  ) : (
                    <>
                      {uploaded.slice(0, 2).map((f, i) => (
                        <span
                          key={`${f.name}-${i}`}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-brand-200/60 bg-brand-50/60 pl-2.5 pr-1.5 py-1 text-[11.5px] text-ink-700"
                        >
                          <FileIcon size={11} className="text-brand-600/70 shrink-0" />
                          <span className="max-w-[160px] truncate">{f.name}</span>
                          <button
                            type="button"
                            className="p-0.5 rounded text-ink-400 hover:text-risk-600 hover:bg-risk-50 transition-colors"
                            aria-label="Remove file"
                          >
                            <X size={11} />
                          </button>
                        </span>
                      ))}
                      {uploaded.length > 2 && (
                        <span className="inline-flex items-center rounded-lg border border-brand-200/60 bg-brand-50/40 px-2.5 py-1 text-[11.5px] font-semibold text-brand-700">
                          + {uploaded.length - 2} more
                        </span>
                      )}
                    </>
                  )}
                </div>

                <SelectFileDropdown
                  inputId={input.id}
                  isOpen={selectFileOpen === input.id}
                  onToggle={() => {
                    setSelectFileOpen(selectFileOpen === input.id ? null : input.id);
                    setSelectFileSearch('');
                  }}
                  onClose={() => setSelectFileOpen(null)}
                  search={selectFileSearch}
                  setSearch={setSelectFileSearch}
                  allFiles={allUploadedFiles}
                  currentFiles={uploaded}
                  onToggleFile={(fileName, isCurrentlySelected) => {
                    const current = files[input.id] ?? [];
                    if (isCurrentlySelected) {
                      setFiles({ ...files, [input.id]: current.filter((f) => f.name !== fileName) });
                    } else {
                      // Find the file from any input to copy its metadata
                      const source = allUploadedFiles.find((f) => f.name === fileName);
                      if (source) {
                        const original = (files[source.inputId] ?? []).find((f) => f.name === fileName);
                        setFiles({ ...files, [input.id]: [...current, original ?? { name: fileName, size: 0 }] });
                      }
                    }
                  }}
                />
              </div>
            </div>

            {/* Column Alignment */}
            {isOpen && (
              <div className="border-t border-canvas-border/30 rounded-b-2xl overflow-hidden">
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

      {/* Preview modal */}
      {previewInput && (
        <DataPreviewModal
          schemaName={previewInput.name}
          fileName={previewInput.files[0]?.name ?? ''}
          onClose={() => setPreviewInput(null)}
        />
      )}
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
    <div>
      {/* Sub-header */}
      <div className="grid grid-cols-[1fr_20px_1fr_90px] gap-3 px-5 py-2 text-[9.5px] font-bold uppercase tracking-[0.12em] text-ink-400 border-b border-canvas-border/60 bg-canvas/60">
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
          <div className="px-5 py-2 flex items-center gap-2 bg-mitigated-50/60 border-b border-canvas-border/40">
            <AlertTriangle size={12} className="text-mitigated" />
            <span className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-mitigated-700">
              Needs Attention ({exceptions.length})
            </span>
          </div>
          <div className="bg-mitigated-50/20 overflow-hidden">
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
      ? 'border-l-[3px] border-mitigated'
      : 'border-l-[3px] border-transparent';

  return (
    <div
      ref={wrapperRef}
      className={`relative grid grid-cols-[1fr_20px_1fr_90px] items-center gap-3 px-5 py-2.5 ${accent}`}
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

      {/* Target — dropdown selector */}
      <div className="flex items-center min-w-0">
        <TargetColumnSelector row={row} />
      </div>

      {/* Confidence + info */}
      <div className="flex items-center justify-end gap-1 tabular-nums">
        <span className={`text-[13px] font-bold ${confidenceColor(row.confidence)}`}>
          {row.confidence}%
        </span>
        <AIJustificationButton
          row={row}
          popoverOpen={popoverOpen}
          onOpenPopover={onOpenPopover}
          onClosePopover={onClosePopover}
          onClearReason={onClearReason}
        />
      </div>
    </div>
  );
}

// ─── Select File(s) dropdown ─────────────────────────────────────────

function SelectFileDropdown({
  inputId,
  isOpen,
  onToggle,
  onClose,
  search,
  setSearch,
  allFiles,
  currentFiles,
  onToggleFile,
}: {
  inputId: string;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  search: string;
  setSearch: (s: string) => void;
  allFiles: { name: string; inputId: string }[];
  currentFiles: { name: string }[];
  onToggleFile: (fileName: string, isCurrentlySelected: boolean) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    setTimeout(() => searchRef.current?.focus(), 0);
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, onClose]);

  const currentNames = new Set(currentFiles.map((f) => f.name));
  const filtered = allFiles.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={onToggle}
        className="inline-flex items-center gap-1.5 rounded-lg border border-brand-300 bg-canvas-elevated hover:bg-brand-50 px-3 py-1.5 text-[11.5px] font-semibold text-brand-700 transition-colors cursor-pointer"
      >
        <ArrowLeftRight size={12} />
        Select File(s)
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 w-72 bg-canvas-elevated rounded-xl border border-canvas-border shadow-lg z-50 overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2.5 border-b border-canvas-border/60">
            <Search size={14} className="text-ink-400 shrink-0" />
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search files..."
              className="w-full text-[12px] text-ink-700 placeholder:text-ink-400 outline-none bg-transparent"
            />
          </div>
          <div className="max-h-48 overflow-y-auto py-1">
            {filtered.length > 0 ? (
              filtered.map((f, i) => {
                const isSelected = currentNames.has(f.name);
                return (
                  <label
                    key={`${f.name}-${i}`}
                    className={`flex items-center gap-2.5 px-3 py-2 text-[12px] cursor-pointer transition-colors ${
                      isSelected ? 'text-ink-800' : 'text-ink-600 hover:bg-brand-50/40'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleFile(f.name, isSelected)}
                      className="size-3.5 rounded border-ink-300 accent-brand-600 shrink-0 cursor-pointer"
                    />
                    <span className="truncate">{f.name}</span>
                  </label>
                );
              })
            ) : (
              <p className="px-3 py-3 text-[11px] text-ink-400 text-center">
                No files found
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Target column selector dropdown ─────────────────────────────────

const DEMO_UPLOADED_COLUMNS = [
  'VendorId', 'VendorName', 'vendor_name', 'vendor_code',
  'inv_number', 'inv_date', 'amount', 'total_amount',
  'po_ref', 'po_number', 'status', 'country',
  'region', 'department', 'description', 'gl_code',
  'account_name', 'debit', 'credit', 'period',
];

function TargetColumnSelector({ row }: { row: ColumnAlignment }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const filtered = DEMO_UPLOADED_COLUMNS.filter((c) =>
    c.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
          row.target
            ? 'border border-canvas-border hover:border-brand-400/40 hover:shadow-sm'
            : 'border border-dashed border-brand-300 hover:border-brand-500 hover:bg-brand-50/60'
        }`}
      >
        {row.target ? (
          <>
            <span className="text-[12.5px] font-semibold text-brand-700 truncate">
              {row.target.name}
            </span>
            <span
              className={`text-[9.5px] font-bold uppercase tracking-wider rounded px-1.5 py-0.5 shrink-0 ${DTYPE_STYLE[row.target.dtype] ?? DTYPE_STYLE.STRING}`}
            >
              {row.target.dtype}
            </span>
          </>
        ) : (
          <span className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-brand-700">
            <Plus size={11} />
            Map column
          </span>
        )}
        <ChevronDown
          size={11}
          className={`text-ink-400/70 shrink-0 transition-transform ml-0.5 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1.5 w-56 bg-canvas-elevated rounded-xl shadow-lg border border-canvas-border z-50 overflow-hidden">
          <div className="p-2 border-b border-canvas-border/60">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search columns..."
              className="w-full text-[12px] px-3 py-1.5 rounded-lg border border-canvas-border outline-none focus:border-ink-300 placeholder:text-ink-400 bg-transparent"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="max-h-48 overflow-y-auto py-1">
            {filtered.length > 0 ? (
              filtered.map((colName) => (
                <button
                  key={colName}
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-[12px] hover:bg-brand-50 transition-colors flex items-center justify-between ${
                    colName === row.target?.name
                      ? 'bg-brand-50/80 text-brand-700 font-semibold'
                      : 'text-ink-600'
                  }`}
                >
                  <span>{colName}</span>
                  {colName === row.target?.name && (
                    <CheckCircle2 size={13} className="text-brand-600" />
                  )}
                </button>
              ))
            ) : (
              <p className="px-3 py-3 text-[11px] text-ink-400 text-center">
                No matching columns
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── AI Justification button + portal popover ────────────────────────

function AIJustificationButton({
  row,
  popoverOpen,
  onOpenPopover,
  onClosePopover,
  onClearReason,
}: {
  row: ColumnAlignment;
  popoverOpen: boolean;
  onOpenPopover: () => void;
  onClosePopover: () => void;
  onClearReason: (id: string) => void;
}) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (popoverOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const panelW = 300;
      let left = rect.right - panelW;
      if (left < 12) left = 12;
      if (left + panelW > window.innerWidth - 12) left = window.innerWidth - panelW - 12;
      setPos({
        top: rect.bottom + 10 + window.scrollY,
        left: left + window.scrollX,
      });
    }
  }, [popoverOpen]);

  useEffect(() => {
    if (!popoverOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        triggerRef.current && !triggerRef.current.contains(e.target as Node)
      ) {
        onClosePopover();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [popoverOpen, onClosePopover]);

  const metrics = [
    { label: 'Name Similarity', weight: 35, score: row.breakdown.nameSimilarity, desc: 'Fuzzy string matching & token comparison' },
    { label: 'Type Compatibility', weight: 25, score: row.breakdown.typeCompatibility, desc: 'Data type inference & format alignment' },
    { label: 'Statistical Profile', weight: 20, score: row.breakdown.statisticalProfile, desc: 'Value distribution, cardinality & null ratio' },
    { label: 'Semantic Similarity', weight: 20, score: row.breakdown.semanticSimilarity, desc: 'Embedding-based meaning comparison' },
  ];

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={onOpenPopover}
        className={`w-5 h-5 rounded-full transition-colors flex items-center justify-center cursor-pointer ${
          popoverOpen
            ? 'text-brand-600 bg-brand-100'
            : 'text-ink-400 hover:text-brand-600 hover:bg-brand-50'
        }`}
        aria-label="AI justification"
      >
        <Info size={12} />
      </button>

      {popoverOpen &&
        createPortal(
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
            className="w-[300px] rounded-xl bg-canvas-elevated border border-canvas-border shadow-xl z-[9999]"
            style={{ position: 'absolute', top: pos.top, left: pos.left }}
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
                onClick={onClosePopover}
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
                    onClick={() => {
                      onClearReason(row.id);
                      onClosePopover();
                    }}
                    className="inline-flex items-center gap-1 rounded-md bg-brand-600 hover:bg-brand-500 text-white text-[10.5px] font-semibold px-2 py-1 transition-colors cursor-pointer"
                  >
                    Accept
                  </button>
                )}
              </div>
            </div>
          </motion.div>,
          document.body,
        )}
    </>
  );
}

// ─── Data Preview Modal ──────────────────────────────────────────────

const PREVIEW_DATA = [
  { row: 1, invoice_no: 'INV-001', vendor_id: 'V-1042', amount: '12,450.00', gl_code: '5010', invoice_date: '2024-01-05' },
  { row: 2, invoice_no: 'INV-002', vendor_id: 'V-2381', amount: '8,200.00', gl_code: '5020', invoice_date: '2024-01-12' },
  { row: 3, invoice_no: 'INV-003', vendor_id: 'V-1042', amount: '3,750.50', gl_code: '5010', invoice_date: '2024-01-18' },
  { row: 4, invoice_no: 'INV-004', vendor_id: 'V-9901', amount: '22,000.00', gl_code: '6030', invoice_date: '2024-01-22' },
  { row: 5, invoice_no: 'INV-005', vendor_id: 'V-3310', amount: '5,600.00', gl_code: '5020', invoice_date: '2024-01-29' },
];

const PREVIEW_COLUMNS = ['ROW', 'INVOICE_NO', 'VENDOR_ID', 'AMOUNT', 'GL_CODE', 'INVOICE_DATE'];

function DataPreviewModal({
  schemaName,
  fileName,
  onClose,
}: {
  schemaName: string;
  fileName: string;
  onClose: () => void;
}) {
  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-[680px] max-h-[80vh] bg-canvas-elevated rounded-2xl shadow-2xl border border-canvas-border overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-canvas-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center">
              <FileIcon size={16} className="text-brand-600" />
            </div>
            <div>
              <div className="text-[14px] font-bold text-ink-900">{schemaName}</div>
              <div className="text-[11.5px] text-ink-400">{fileName}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-ink-400 hover:text-ink-800 hover:bg-canvas transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Table */}
        <div className="overflow-auto max-h-[60vh]">
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="border-b border-canvas-border bg-canvas/60">
                {PREVIEW_COLUMNS.map((col) => (
                  <th
                    key={col}
                    className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-[0.1em] text-ink-400"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PREVIEW_DATA.map((row) => (
                <tr key={row.row} className="border-b border-canvas-border/40 hover:bg-brand-50/20 transition-colors">
                  <td className="px-4 py-2.5 text-ink-400 tabular-nums">{row.row}</td>
                  <td className="px-4 py-2.5 text-ink-800 font-medium">{row.invoice_no}</td>
                  <td className="px-4 py-2.5 text-ink-800">{row.vendor_id}</td>
                  <td className="px-4 py-2.5 text-ink-800 tabular-nums text-right">{row.amount}</td>
                  <td className="px-4 py-2.5 text-ink-800 tabular-nums">{row.gl_code}</td>
                  <td className="px-4 py-2.5 text-ink-800 tabular-nums">{row.invoice_date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-canvas-border">
          <span className="text-[11px] text-ink-400">Previewing first 5 entries</span>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-[12px] font-semibold px-4 py-2 transition-colors cursor-pointer"
          >
            Close Preview
          </button>
        </div>
      </motion.div>
    </div>,
    document.body,
  );
}

