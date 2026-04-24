import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import {
  ChevronDown,
  CheckCircle2,
  X,
  File as FileIcon,
  Eye,
  ArrowLeftRight,
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
  expandedInputId?: string | null;
  onToggleExpand?: (inputId: string) => void;
}

const DTYPE_STYLE: Record<string, string> = {
  STRING: 'bg-slate-100 text-slate-500',
  DECIMAL: 'bg-brand-50 text-brand-700',
  INT: 'bg-evidence-50 text-evidence-700',
  TIMESTAMP: 'bg-mitigated-50 text-mitigated-700',
  BOOL: 'bg-compliant-50 text-compliant-700',
};

export default function StepMapData({
  workflow,
  files,
  setFiles,
  alignments,
  setAlignments,
  expandedInputId,
  onToggleExpand,
}: Props) {
  const [internalExpanded, setInternalExpanded] = useState<string | null>(
    workflow.inputs[0]?.id ?? null,
  );
  const expanded = expandedInputId !== undefined ? expandedInputId : internalExpanded;
  const toggleExpanded = (inputId: string) => {
    if (onToggleExpand) {
      onToggleExpand(inputId);
    } else {
      setInternalExpanded((prev) => (prev === inputId ? null : inputId));
    }
  };
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

        return (
          <section
            key={input.id}
            className="rounded-2xl border border-canvas-border bg-canvas-elevated overflow-visible"
          >
            {/* Header */}
            <button
              type="button"
              onClick={() => toggleExpanded(input.id)}
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
                <ColumnAlignmentTable input={input} rows={list} />
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
}

function ColumnAlignmentTable({ input, rows }: TableProps) {
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
      <div className="grid grid-cols-[1fr_20px_1fr] gap-3 px-5 py-2 text-[9.5px] font-bold uppercase tracking-[0.12em] text-ink-400 border-b border-canvas-border/60 bg-canvas/60">
        <span>Source Column</span>
        <span />
        <span>Target Schema</span>
      </div>
      <div>
        {rows.map((row) => (
          <FieldRow key={row.id} row={row} />
        ))}
      </div>
    </div>
  );
}

// ─── Single alignment row ─────────────────────────────────────────────

function FieldRow({ row }: { row: ColumnAlignment }) {
  return (
    <div className="relative grid grid-cols-[1fr_20px_1fr] items-center gap-3 px-5 py-2.5">
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
    </div>
  );
}

// ─── Select File(s) dropdown ─────────────────────────────────────────

function SelectFileDropdown({
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
        Choose File
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
  const [pos, setPos] = useState({ top: 0, left: 0, width: 224 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !triggerRef.current) return;
    const updatePos = () => {
      const rect = triggerRef.current!.getBoundingClientRect();
      const width = Math.max(rect.width, 224);
      let left = rect.left;
      if (left + width > window.innerWidth - 12) left = window.innerWidth - width - 12;
      if (left < 12) left = 12;
      setPos({
        top: rect.bottom + 6 + window.scrollY,
        left: left + window.scrollX,
        width,
      });
    };
    updatePos();
    window.addEventListener('scroll', updatePos, true);
    window.addEventListener('resize', updatePos);
    return () => {
      window.removeEventListener('scroll', updatePos, true);
      window.removeEventListener('resize', updatePos);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (
        triggerRef.current && !triggerRef.current.contains(t) &&
        panelRef.current && !panelRef.current.contains(t)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const filtered = DEMO_UPLOADED_COLUMNS.filter((c) =>
    c.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      <button
        ref={triggerRef}
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

      {open &&
        createPortal(
          <div
            ref={panelRef}
            style={{ position: 'absolute', top: pos.top, left: pos.left, width: pos.width }}
            className="bg-canvas-elevated rounded-xl shadow-lg border border-canvas-border z-[9999] overflow-hidden"
          >
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
          </div>,
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

