import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Search,
  UploadCloud,
  Link2,
  FolderClosed,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Plus,
  FileSpreadsheet,
  FileText,
  Database,
  CheckCircle2,
  File as FileIcon,
  X,
  PanelRightClose,
  FileOutput,
  Lock,
  SlidersHorizontal,
  DollarSign,
  Sparkles,
  Zap,
  Download,
  Loader2,
  AlertOctagon,
  AlertTriangle,
} from 'lucide-react';
import { DATA_SOURCES } from '../../data/mockData';
import type { JourneyFiles, RunResult, UploadedFile, WorkflowDraft } from './types';

interface Props {
  workflow: WorkflowDraft;
  files: JourneyFiles;
  setFiles: (f: JourneyFiles) => void;
  result?: RunResult | null;
  running?: boolean;
}

interface Folder {
  id: string;
  name: string;
  fileCount: number;
  files: { name: string; type: string; rows?: number }[];
}

const DEMO_FOLDERS: Folder[] = [
  { id: 'f-1', name: 'Test folder', fileCount: 0, files: [] },
  {
    id: 'f-2',
    name: 'invoice',
    fileCount: 1,
    files: [{ name: 'invoice_mar_2026.pdf', type: 'pdf' }],
  },
];

function typeIcon(type: string) {
  if (type === 'csv' || type === 'excel') return FileSpreadsheet;
  if (type === 'pdf') return FileText;
  if (type === 'sql') return Database;
  return FileIcon;
}

function typeColor(type: string): string {
  if (type === 'csv') return 'text-compliant-700 bg-compliant-50';
  if (type === 'excel') return 'text-compliant-700 bg-compliant-50';
  if (type === 'pdf') return 'text-high-700 bg-high-50';
  if (type === 'sql') return 'text-evidence-700 bg-evidence-50';
  return 'text-ink-500 bg-canvas';
}

type PanelTab = 'plan' | 'input' | 'output';

export default function DataSourcePanel({
  workflow,
  files,
  setFiles,
  result = null,
  running = false,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const inputTabFileRef = useRef<HTMLInputElement | null>(null);
  const [tab, setTab] = useState<PanelTab>('plan');
  const [search, setSearch] = useState('');
  const [sqlOpen, setSqlOpen] = useState(false);
  const [openFolderIds, setOpenFolderIds] = useState<Set<string>>(new Set());
  const [frozenInputIds, setFrozenInputIds] = useState<Set<string>>(new Set());
  const [tolRule, setTolRule] = useState({
    mode: 'percentage' as 'percentage' | 'absolute',
    percentage: 5,
    absolute: 500,
    enabled: true,
    expanded: true,
  });
  const [pendingUploadInputId, setPendingUploadInputId] = useState<string | null>(null);

  // Auto-jump to Output tab the first time a result lands.
  const autoJumpedRef = useRef(false);
  useEffect(() => {
    if (result && !autoJumpedRef.current) {
      autoJumpedRef.current = true;
      setTab('output');
    }
    if (!result) autoJumpedRef.current = false;
  }, [result]);

  const pickTargetInputId = (current: JourneyFiles): string => {
    const reqInputs = workflow.inputs.filter((i) => i.required);
    for (const inp of reqInputs) {
      if ((current[inp.id] ?? []).length === 0) return inp.id;
    }
    return workflow.inputs[0]?.id ?? '';
  };

  const toggleFolder = (id: string) => {
    setOpenFolderIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const removeLinkedSource = (sourceName: string) => {
    const next: JourneyFiles = {};
    for (const [inputId, arr] of Object.entries(files)) {
      next[inputId] = arr.filter(
        (f) => !(f.linkedSource && f.name === sourceName),
      );
    }
    setFiles(next);
  };

  const handleUpload = (picked: FileList | null) => {
    if (!picked || picked.length === 0) return;
    const target = pickTargetInputId(files);
    if (!target) return;
    const arr = Array.from(picked);
    const next = { ...files };
    for (const f of arr) {
      const added: UploadedFile = { name: f.name, size: f.size };
      next[target] = [...(next[target] ?? []), added];
    }
    setFiles(next);
  };

  const toggleFreeze = (id: string) => {
    setFrozenInputIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const triggerInputUpload = (inputId: string) => {
    setPendingUploadInputId(inputId);
    inputTabFileRef.current?.click();
  };

  const handleInputTabUpload = (picked: FileList | null) => {
    if (!picked || picked.length === 0 || !pendingUploadInputId) return;
    const target = pendingUploadInputId;
    const arr = Array.from(picked);
    const next = { ...files };
    for (const f of arr) {
      const added: UploadedFile = { name: f.name, size: f.size };
      next[target] = [...(next[target] ?? []), added];
    }
    setFiles(next);
    setPendingUploadInputId(null);
  };

  const formatBadgeClass = (type: string): string => {
    if (type === 'sql') return 'bg-evidence-50 text-evidence-700 border border-evidence-200/50';
    if (type === 'csv') return 'bg-compliant-50 text-compliant-700 border border-compliant/20';
    if (type === 'pdf') return 'bg-high-50 text-high-700 border border-high/20';
    return 'bg-canvas text-ink-500 border border-canvas-border';
  };

  const addedSources = useMemo(() => {
    type Added = {
      key: string;
      name: string;
      type: string;
      meta: string;
      linked: boolean;
    };
    const rows: Added[] = [];
    const seen = new Set<string>();
    for (const [inputId, arr] of Object.entries(files)) {
      for (let i = 0; i < arr.length; i++) {
        const f = arr[i];
        if (seen.has(f.name)) continue;
        seen.add(f.name);
        if (f.linkedSource) {
          const lib = DATA_SOURCES.find((d) => d.name === f.name);
          rows.push({
            key: `${inputId}-${i}-${f.name}`,
            name: f.name,
            type: lib?.type ?? 'sql',
            meta: lib ? `${lib.records} · ${lib.type.toUpperCase()}` : 'Linked source',
            linked: true,
          });
        } else {
          const ext = (f.name.split('.').pop() ?? '').toLowerCase();
          const type = ext === 'csv' ? 'csv' : ext === 'pdf' ? 'pdf' : ext === 'xlsx' || ext === 'xls' ? 'excel' : 'csv';
          const sizeStr =
            f.size > 1024 * 1024
              ? `${(f.size / (1024 * 1024)).toFixed(1)} MB`
              : f.size > 1024
                ? `${(f.size / 1024).toFixed(1)} KB`
                : f.size > 0
                  ? `${f.size} B`
                  : 'Uploaded';
          rows.push({
            key: `${inputId}-${i}-${f.name}`,
            name: f.name,
            type,
            meta: `${sizeStr}${ext ? ` · ${ext.toUpperCase()}` : ''}`,
            linked: false,
          });
        }
      }
    }
    return rows.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()));
  }, [files, search]);

  const TABS: { id: PanelTab; label: string }[] = [
    { id: 'plan', label: 'Data' },
    { id: 'input', label: 'Input' },
    { id: 'output', label: 'Output' },
  ];

  return (
    <aside className="flex flex-col h-full w-full bg-canvas border-l border-canvas-border min-h-0">
      {/* Tabs */}
      <div className="px-4 pt-3 border-b border-canvas-border shrink-0">
        <div className="flex items-center gap-5">
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={[
                  'relative pb-2.5 text-[13px] font-semibold transition-colors cursor-pointer',
                  active
                    ? 'text-brand-700'
                    : 'text-ink-500 hover:text-ink-800',
                ].join(' ')}
              >
                {t.label}
                {active && (
                  <span className="absolute left-0 right-0 -bottom-px h-[2px] bg-brand-600 rounded-full" />
                )}
              </button>
            );
          })}
          <button
            type="button"
            aria-label="Collapse panel"
            className="ml-auto mb-1.5 w-7 h-7 rounded-md text-ink-400 hover:text-ink-700 hover:bg-canvas-elevated flex items-center justify-center transition-colors cursor-pointer"
          >
            <PanelRightClose size={15} />
          </button>
        </div>
      </div>

      {/* Scroll body */}
      <div className="flex-1 overflow-y-auto min-h-0 px-3 py-3">
        {tab === 'input' && (
          <div>
            {/* Hidden shared file input for per-input-card uploads */}
            <input
              ref={inputTabFileRef}
              type="file"
              hidden
              multiple
              onChange={(e) => {
                handleInputTabUpload(e.target.files);
                e.target.value = '';
              }}
            />

            {/* Header */}
            <div className="flex items-center gap-2 mb-3 px-1">
              <div className="w-7 h-7 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                <Database size={14} />
              </div>
              <span className="text-[13px] font-semibold text-ink-800 flex-1 min-w-0 truncate">
                Input Configuration
              </span>
              <span className="text-[11px] font-semibold text-brand-700 rounded-full bg-brand-50 px-2 py-0.5 shrink-0">
                {workflow.inputs.length} source{workflow.inputs.length === 1 ? '' : 's'}
              </span>
            </div>

            {/* Input source cards */}
            <div className="grid grid-cols-2 gap-2 items-start mb-4">
              {workflow.inputs.map((input) => {
                const frozen = frozenInputIds.has(input.id);
                const uploaded = (files[input.id] ?? []).length;
                return (
                  <div
                    key={input.id}
                    className={[
                      'rounded-xl border p-3 transition-colors',
                      frozen
                        ? 'border-brand-300 bg-brand-50/40'
                        : 'border-canvas-border bg-canvas-elevated',
                    ].join(' ')}
                  >
                    {/* Header row */}
                    <div className="flex items-start gap-2.5 mb-2">
                      <div
                        className={[
                          'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                          frozen ? 'bg-brand-100 text-brand-600' : 'bg-brand-50 text-brand-600',
                        ].join(' ')}
                      >
                        {frozen ? <Lock size={14} /> : <Database size={14} />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[13px] font-semibold text-ink-800 leading-tight truncate">
                          {input.name}
                        </div>
                        <div className="text-[11.5px] text-ink-400 leading-tight truncate mt-0.5">
                          {frozen ? 'System Reference' : input.description || 'Data source'}
                        </div>
                      </div>
                      <span
                        className={[
                          'text-[10px] font-bold uppercase tracking-wider rounded-md px-1.5 py-0.5 shrink-0',
                          formatBadgeClass(input.type),
                        ].join(' ')}
                      >
                        {input.type}
                      </span>
                    </div>

                    {/* Column chips */}
                    {input.columns && input.columns.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2.5">
                        {input.columns.map((col) => (
                          <span
                            key={col}
                            className="inline-flex items-center rounded-md bg-canvas border border-canvas-border px-1.5 py-0.5 text-[10.5px] text-ink-600 font-mono"
                          >
                            {col}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Freeze toggle + status badge */}
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={frozen}
                          onClick={() => toggleFreeze(input.id)}
                          className={[
                            'relative w-9 h-5 rounded-full transition-colors shrink-0 cursor-pointer',
                            frozen ? 'bg-brand-600' : 'bg-canvas-border',
                          ].join(' ')}
                        >
                          <span
                            className={[
                              'absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform',
                              frozen ? 'translate-x-4' : 'translate-x-0',
                            ].join(' ')}
                          />
                        </button>
                        <span
                          className={[
                            'text-[12px] font-semibold truncate',
                            frozen ? 'text-brand-700' : 'text-ink-500',
                          ].join(' ')}
                        >
                          {frozen ? 'Frozen' : 'Freeze'}
                        </span>
                      </div>
                      {frozen ? (
                        <span className="inline-flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-wider rounded-md px-2 py-0.5 bg-brand-100 text-brand-700 shrink-0">
                          <CheckCircle2 size={10} />
                          Frozen
                        </span>
                      ) : input.required ? (
                        <span className="text-[10.5px] font-bold uppercase tracking-wider rounded-md px-2 py-0.5 bg-high-50 text-high-700 shrink-0">
                          Required
                        </span>
                      ) : (
                        <span className="text-[10.5px] font-semibold uppercase tracking-wider rounded-md px-2 py-0.5 text-ink-400 shrink-0">
                          Optional
                        </span>
                      )}
                    </div>

                    {/* Body: drop zone or frozen info */}
                    {frozen ? (
                      <div className="rounded-lg bg-white/60 border border-brand-200 px-3 py-2">
                        <div className="text-[11.5px] font-semibold text-brand-700 leading-tight">
                          Using cached version from Mar 20, 2026
                        </div>
                        <div className="text-[11px] text-brand-600/80 leading-tight mt-0.5">
                          {uploaded > 0 ? `${uploaded} file${uploaded === 1 ? '' : 's'} cached` : '892 records'}
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => triggerInputUpload(input.id)}
                        className="w-full rounded-lg border border-dashed border-canvas-border bg-canvas hover:border-brand-300 hover:bg-brand-50/40 transition-colors py-2.5 flex items-center justify-center gap-1.5 text-[11.5px] text-ink-500 hover:text-brand-700 cursor-pointer"
                      >
                        <UploadCloud size={12} />
                        {uploaded > 0
                          ? `${uploaded} file${uploaded === 1 ? '' : 's'} — add more`
                          : 'Drop file or click to upload'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Tolerance rules */}
            {(() => {
              const sev = (() => {
                if (tolRule.mode === 'percentage') {
                  if (tolRule.percentage <= 3)
                    return { label: 'Strict', bg: 'rgba(220,38,38,0.12)', color: '#B91C1C' };
                  if (tolRule.percentage <= 10)
                    return { label: 'Moderate', bg: 'rgba(183,137,0,0.14)', color: '#92631F' };
                  return { label: 'Relaxed', bg: 'rgba(15,110,86,0.12)', color: '#0F6E56' };
                }
                if (tolRule.absolute <= 100)
                  return { label: 'Strict', bg: 'rgba(220,38,38,0.12)', color: '#B91C1C' };
                if (tolRule.absolute <= 1000)
                  return { label: 'Moderate', bg: 'rgba(183,137,0,0.14)', color: '#92631F' };
                return { label: 'Relaxed', bg: 'rgba(15,110,86,0.12)', color: '#0F6E56' };
              })();
              const summary =
                tolRule.mode === 'percentage'
                  ? `±${tolRule.percentage}%`
                  : `±$${tolRule.absolute.toLocaleString()}`;
              return (
                <section className="rounded-xl border border-canvas-border bg-canvas-elevated overflow-hidden">
                  {/* Card header */}
                  <div className="flex items-center justify-between gap-3 px-3 pt-3 pb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-7 h-7 rounded-md bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                        <SlidersHorizontal size={13} />
                      </span>
                      <span className="text-[13px] font-semibold text-ink-800 truncate">
                        Tolerance rules
                      </span>
                    </div>
                    <span className="text-[11px] text-ink-400 font-medium shrink-0">
                      {tolRule.enabled ? '1 active' : 'Off'}
                    </span>
                  </div>

                  {/* Rule row */}
                  <div className="px-3 pb-3">
                    <div className="rounded-lg border border-canvas-border bg-canvas">
                      <div className="flex items-center justify-between gap-2 px-3 py-2.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                            style={{ background: '#E1F5EE', color: '#0F6E56' }}
                          >
                            <DollarSign size={14} />
                          </span>
                          <div className="min-w-0">
                            <div className="text-[13px] font-semibold text-ink-800 leading-tight">
                              Amount
                            </div>
                            <div className="mt-0.5 flex items-center gap-1.5">
                              <span className="text-[11.5px] text-ink-500 tabular-nums">
                                {summary}
                              </span>
                              <span
                                className="text-[9.5px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider"
                                style={{ background: sev.bg, color: sev.color }}
                              >
                                {sev.label}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            aria-label={tolRule.expanded ? 'Collapse rule' : 'Expand rule'}
                            onClick={() =>
                              setTolRule((r) => ({ ...r, expanded: !r.expanded }))
                            }
                            className="w-6 h-6 rounded-md text-ink-500 hover:text-ink-800 hover:bg-canvas-elevated flex items-center justify-center cursor-pointer transition-colors"
                          >
                            {tolRule.expanded ? (
                              <ChevronDown size={13} />
                            ) : (
                              <ChevronRight size={13} />
                            )}
                          </button>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={tolRule.enabled}
                            aria-label="Toggle tolerance rule"
                            onClick={() =>
                              setTolRule((r) => ({ ...r, enabled: !r.enabled }))
                            }
                            className={[
                              'relative w-10 h-[22px] rounded-full transition-colors cursor-pointer',
                              tolRule.enabled ? 'bg-brand-600' : 'bg-canvas-border',
                            ].join(' ')}
                          >
                            <span
                              className={[
                                'absolute top-0.5 left-0.5 w-[18px] h-[18px] rounded-full bg-white shadow-sm transition-transform',
                                tolRule.enabled ? 'translate-x-[18px]' : 'translate-x-0',
                              ].join(' ')}
                            />
                          </button>
                        </div>
                      </div>

                      {/* Expanded body */}
                      {tolRule.expanded && (
                        <div
                          className={[
                            'border-t border-canvas-border px-3 py-3 transition-opacity',
                            tolRule.enabled ? 'opacity-100' : 'opacity-55 pointer-events-none',
                          ].join(' ')}
                        >
                          {/* Applied to */}
                          <div className="flex items-center gap-1.5 mb-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-ink-400">
                              Applied to
                            </span>
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider rounded-md px-1.5 py-0.5 bg-brand-50 text-brand-700">
                              <Sparkles size={9} />
                              AI
                            </span>
                          </div>
                          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-1.5 mb-3">
                            <button
                              type="button"
                              className="flex items-center gap-1.5 rounded-lg border border-canvas-border bg-canvas-elevated px-2 py-1.5 text-[12px] text-ink-800 hover:border-brand-300 transition-colors cursor-pointer min-w-0"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-brand-600 shrink-0" />
                              <span className="truncate font-medium">Invoice Amount</span>
                              <ChevronDown size={11} className="text-ink-400 ml-auto shrink-0" />
                            </button>
                            <span className="text-[11px] text-ink-400 px-1">vs</span>
                            <button
                              type="button"
                              className="flex items-center gap-1.5 rounded-lg border border-canvas-border bg-canvas-elevated px-2 py-1.5 text-[12px] text-ink-800 hover:border-brand-300 transition-colors cursor-pointer min-w-0"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                              <span className="truncate font-medium">GL Amount</span>
                              <ChevronDown size={11} className="text-ink-400 ml-auto shrink-0" />
                            </button>
                          </div>

                          {/* Mode tabs */}
                          <div className="flex rounded-lg border border-canvas-border overflow-hidden mb-3">
                            {(['percentage', 'absolute'] as const).map((m) => {
                              const active = tolRule.mode === m;
                              return (
                                <button
                                  key={m}
                                  type="button"
                                  onClick={() => setTolRule((r) => ({ ...r, mode: m }))}
                                  className="flex-1 py-1.5 text-[11px] font-semibold transition-all cursor-pointer capitalize"
                                  style={
                                    active
                                      ? { background: '#6A12CD', color: '#fff' }
                                      : { background: '#fff', color: '#94a3b8' }
                                  }
                                >
                                  {m}
                                </button>
                              );
                            })}
                          </div>

                          {tolRule.mode === 'percentage' ? (
                            <div>
                              <div className="flex items-center gap-2 mb-1.5">
                                <span className="text-[18px] font-bold tabular-nums min-w-[40px] text-brand-700">
                                  {tolRule.percentage}%
                                </span>
                                <span
                                  className="text-[9.5px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider"
                                  style={{ background: sev.bg, color: sev.color }}
                                >
                                  {sev.label}
                                </span>
                              </div>
                              <input
                                type="range"
                                min={0}
                                max={20}
                                step={0.5}
                                value={tolRule.percentage}
                                onChange={(e) =>
                                  setTolRule((r) => ({
                                    ...r,
                                    percentage: parseFloat(e.target.value),
                                  }))
                                }
                                className="w-full h-1.5 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-[#6A12CD] [&::-webkit-slider-thumb]:border-[2.5px] [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-[0_2px_8px_rgba(106,18,205,0.35)]"
                                style={{
                                  background:
                                    'linear-gradient(to right, rgba(220,38,38,0.2), rgba(183,137,0,0.2), rgba(15,110,86,0.2))',
                                }}
                              />
                              <div className="flex justify-between mt-1.5">
                                <span
                                  className="text-[9.5px] font-semibold px-1.5 py-0.5 rounded"
                                  style={{ background: 'rgba(220,38,38,0.08)', color: '#DC2626' }}
                                >
                                  0% Strict
                                </span>
                                <span
                                  className="text-[9.5px] font-semibold px-1.5 py-0.5 rounded"
                                  style={{ background: 'rgba(15,110,86,0.08)', color: '#0F6E56' }}
                                >
                                  20% Relaxed
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="flex items-center gap-2">
                                <div className="flex items-center flex-1 border border-canvas-border rounded-lg overflow-hidden focus-within:border-brand-400/50 focus-within:ring-2 focus-within:ring-brand-100 transition-all bg-white">
                                  <span className="text-[11px] font-semibold text-ink-400 pl-3 pr-1 select-none">
                                    $
                                  </span>
                                  <input
                                    type="number"
                                    min={0}
                                    step={50}
                                    value={tolRule.absolute}
                                    onChange={(e) =>
                                      setTolRule((r) => ({
                                        ...r,
                                        absolute: Math.max(0, Number(e.target.value) || 0),
                                      }))
                                    }
                                    className="flex-1 py-1.5 pr-3 text-[13px] font-semibold bg-transparent outline-none tabular-nums text-brand-700"
                                  />
                                </div>
                                <span
                                  className="text-[9.5px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0"
                                  style={{ background: sev.bg, color: sev.color }}
                                >
                                  {sev.label}
                                </span>
                              </div>
                              <div className="flex gap-1.5 mt-2">
                                {[100, 500, 1000, 5000].map((v) => (
                                  <button
                                    key={v}
                                    type="button"
                                    onClick={() =>
                                      setTolRule((r) => ({ ...r, absolute: v }))
                                    }
                                    className="flex-1 py-1 text-[10.5px] font-semibold rounded-md border transition-all cursor-pointer"
                                    style={
                                      tolRule.absolute === v
                                        ? {
                                            background: 'rgba(106,18,205,0.06)',
                                            color: '#6A12CD',
                                            borderColor: 'rgba(106,18,205,0.25)',
                                          }
                                        : {
                                            background: '#fff',
                                            color: '#94a3b8',
                                            borderColor: '#e2e8f0',
                                          }
                                    }
                                  >
                                    ${v.toLocaleString()}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              );
            })()}
          </div>
        )}

        {tab === 'output' && (
          <div>
            {running && !result ? (
              <div className="flex flex-col items-center justify-center text-center py-12 px-4">
                <Loader2 size={20} className="animate-spin text-brand-600 mb-2" />
                <div className="text-[12.5px] font-semibold text-ink-800">
                  Running {workflow.name}…
                </div>
              </div>
            ) : !result ? (
              <div className="flex flex-col items-center justify-center text-center py-12 px-4">
                <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-3">
                  <FileOutput size={18} />
                </div>
                <div className="text-[13px] font-semibold text-ink-800 mb-1">
                  No output yet
                </div>
                <div className="text-[12px] text-ink-500 max-w-[220px] leading-snug">
                  Run the workflow to see KPIs and the audit report here.
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {/* Run header */}
                <div className="flex items-start gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                    <Zap size={16} className="text-brand-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-semibold text-ink-900 leading-tight truncate">
                      {workflow.name}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap mt-1">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-compliant-700 bg-compliant-50 rounded-full px-2 py-0.5">
                        <CheckCircle2 size={10} />
                        RUN SUCCESSFUL
                      </span>
                      <span className="text-[10.5px] text-ink-400">
                        RUN ID: RWF-4407-B
                      </span>
                    </div>
                    <div className="text-[10.5px] text-ink-400 mt-0.5">
                      {(28_345_840).toLocaleString()} records
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label="Download"
                    className="w-8 h-8 rounded-lg border border-canvas-border text-ink-600 hover:bg-canvas-elevated flex items-center justify-center cursor-pointer transition-colors shrink-0"
                  >
                    <Download size={13} />
                  </button>
                </div>

                {/* KPI cards */}
                <div className="grid grid-cols-2 gap-2">
                  <OutputKPICard
                    label="TOTAL INVOICES"
                    value="1,129"
                    delta="+13%"
                    deltaTone="ok"
                  />
                  <OutputKPICard
                    label="CRITICAL FLAGS"
                    value="3"
                    valueTone="risk"
                    delta="+2"
                    deltaTone="risk"
                  />
                  <OutputKPICard
                    label="AUDIT ACCURACY"
                    value="99.4%"
                    valueTone="ok"
                    delta="+8.2%"
                    deltaTone="ok"
                  />
                  <OutputKPICard
                    label="POTENTIAL SAVINGS"
                    value="$42.5k"
                    delta="New"
                    deltaTone="neutral"
                  />
                </div>

                {/* Audit Report */}
                <div className="mt-1">
                  <h2 className="text-[13px] font-semibold text-ink-900 mb-2 px-1">
                    Audit Report
                  </h2>

                  <div className="rounded-xl border border-canvas-border bg-canvas-elevated overflow-hidden">
                    <div className="flex items-baseline justify-between gap-2 px-3 pt-2.5 pb-1.5">
                      <div className="text-[12.5px] font-semibold text-ink-800 truncate">
                        {result.title}
                      </div>
                      <span className="text-[10px] text-ink-400 font-bold uppercase tracking-wider shrink-0">
                        {result.outputType}
                      </span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-[11.5px]">
                        <thead className="bg-canvas text-ink-500 border-y border-canvas-border">
                          <tr>
                            <th className="w-6"></th>
                            {result.columns.map((c) => (
                              <th
                                key={c}
                                className="text-left font-semibold px-2 py-1.5 whitespace-nowrap"
                              >
                                {c}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {result.rows.map((r, i) => {
                            const Icon =
                              r.status === 'flagged'
                                ? AlertOctagon
                                : r.status === 'warning'
                                  ? AlertTriangle
                                  : CheckCircle2;
                            const tone =
                              r.status === 'flagged'
                                ? 'bg-risk-50 border-l-2 border-risk'
                                : r.status === 'warning'
                                  ? 'bg-mitigated-50 border-l-2 border-mitigated'
                                  : 'bg-compliant-50 border-l-2 border-compliant';
                            const iconTone =
                              r.status === 'flagged'
                                ? 'text-risk'
                                : r.status === 'warning'
                                  ? 'text-mitigated'
                                  : 'text-compliant';
                            return (
                              <tr
                                key={i}
                                className={`${tone} ${i === 0 ? '' : 'border-t border-canvas-border'}`}
                              >
                                <td className="px-1.5 py-1.5 align-middle">
                                  <Icon size={12} className={iconTone} />
                                </td>
                                {r.cells.map((cell, j) => (
                                  <td
                                    key={j}
                                    className="px-2 py-1.5 text-ink-800 whitespace-nowrap"
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
                  </div>
                </div>

                {/* Flag Distribution */}
                <FlagDistributionCard />

                {/* Monthly Invoice Volume */}
                <MonthlyInvoiceVolumeCard />
              </div>
            )}
          </div>
        )}

        {tab === 'plan' && (
          <>
            <div className="relative mb-3">
              <Search
                size={12}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search data sources…"
                className="w-full rounded-lg border border-canvas-border bg-canvas-elevated px-8 py-1.5 text-[12px] text-ink-800 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600/30 transition-all"
              />
            </div>
        {/* Data Library */}
        <section className="mb-5">
          <div className="flex items-center gap-1.5 mb-2 px-1">
            <FolderClosed size={12} className="text-ink-500" />
            <span className="text-[12px] font-bold text-ink-700">Data Library</span>
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full rounded-xl border border-dashed border-brand-300 bg-brand-50/40 hover:bg-brand-50 transition-colors p-3 flex flex-col items-center gap-1.5 cursor-pointer mb-2"
          >
            <div className="w-8 h-8 rounded-lg bg-brand-100 text-brand-600 flex items-center justify-center">
              <UploadCloud size={14} />
            </div>
            <div className="text-[12.5px] font-semibold text-ink-800">Upload</div>
            <div className="text-[10.5px] text-ink-400 text-center leading-tight">
              2GB per file · CSV, XLSX, XLS, PDF, PNG…
            </div>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            hidden
            multiple
            onChange={(e) => {
              handleUpload(e.target.files);
              e.target.value = '';
            }}
          />

          <button
            type="button"
            onClick={() => setSqlOpen((v) => !v)}
            className="w-full rounded-lg border border-canvas-border bg-canvas-elevated hover:border-brand-300 transition-colors px-3 py-2 flex items-center gap-2 cursor-pointer"
          >
            {sqlOpen ? (
              <ChevronDown size={12} className="text-ink-500" />
            ) : (
              <ChevronRight size={12} className="text-ink-500" />
            )}
            <Link2 size={12} className="text-brand-600" />
            <span className="text-[12px] font-semibold text-ink-800">
              Connect SQL Database
            </span>
          </button>
          {sqlOpen && (
            <div className="mt-1 rounded-lg border border-canvas-border bg-canvas-elevated px-3 py-2 text-[11.5px] text-ink-500 leading-snug">
              Connect Postgres, MySQL, or Snowflake — credentials are stored in your workspace vault.
            </div>
          )}
        </section>

        {/* Folders */}
        <section className="mb-5">
          <div className="flex items-center justify-between mb-2 px-1">
            <div className="flex items-center gap-1.5">
              <FolderClosed size={12} className="text-ink-500" />
              <span className="text-[12px] font-bold text-ink-700">Folders</span>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-md border border-canvas-border bg-canvas-elevated hover:border-brand-300 hover:bg-brand-50/40 px-2 py-0.5 text-[11px] font-semibold text-ink-700 transition-colors cursor-pointer"
            >
              <Plus size={10} />
              New
            </button>
          </div>
          <ul className="grid grid-cols-2 gap-2 items-start">
            {DEMO_FOLDERS.map((folder) => {
              const open = openFolderIds.has(folder.id);
              return (
                <li
                  key={folder.id}
                  className="rounded-lg border border-canvas-border bg-canvas-elevated hover:border-brand-300 transition-colors overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => toggleFolder(folder.id)}
                    className="w-full flex items-center gap-2 px-2.5 py-2 cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-md bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                      {open ? <FolderOpen size={13} /> : <FolderClosed size={13} />}
                    </div>
                    <div className="min-w-0 flex-1 text-left">
                      <div className="text-[12px] font-semibold text-ink-800 truncate">
                        {folder.name}
                      </div>
                      <div className="text-[11px] text-ink-400 truncate">
                        {folder.fileCount} file{folder.fileCount === 1 ? '' : 's'}
                      </div>
                    </div>
                    {open ? (
                      <ChevronDown size={12} className="text-ink-500 shrink-0" />
                    ) : (
                      <ChevronRight size={12} className="text-ink-500 shrink-0" />
                    )}
                  </button>
                  {open && folder.files.length > 0 && (
                    <ul className="border-t border-canvas-border bg-canvas px-2 py-1.5 flex flex-col gap-1">
                      {folder.files.map((f) => {
                        const Icon = typeIcon(f.type);
                        return (
                          <li
                            key={f.name}
                            className="flex items-center gap-2 rounded-md px-1.5 py-1"
                          >
                            <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${typeColor(f.type)}`}>
                              <Icon size={10} />
                            </div>
                            <span className="text-[11.5px] font-medium text-ink-800 truncate flex-1">
                              {f.name}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                  {open && folder.files.length === 0 && (
                    <div className="border-t border-canvas-border bg-canvas px-3 py-2 text-[11px] text-ink-400 text-center">
                      Empty folder
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        {/* Sources — files/sources added to this workflow */}
        <section>
          <div className="flex items-center gap-1.5 mb-2 px-1">
            <Database size={12} className="text-ink-500" />
            <span className="text-[12px] font-bold text-ink-700">Sources</span>
            <span className="text-[11px] text-ink-400 rounded-full bg-canvas-elevated border border-canvas-border px-1.5">
              {addedSources.length}
            </span>
          </div>
          {addedSources.length === 0 ? (
            <div className="rounded-lg border border-dashed border-canvas-border bg-canvas-elevated px-3 py-5 text-center">
              <div className="text-[11.5px] font-semibold text-ink-700 mb-0.5">
                {search ? `No added sources match “${search}”.` : 'No sources added yet'}
              </div>
              {!search && (
                <div className="text-[11px] text-ink-400 leading-snug">
                  Upload a file or link a data source — it will appear here.
                </div>
              )}
            </div>
          ) : (
            <ul className="grid grid-cols-2 gap-2 items-start">
              {addedSources.map((s) => {
                const Icon = typeIcon(s.type);
                return (
                  <li
                    key={s.key}
                    className="relative rounded-lg border border-brand-200 bg-brand-50/40 px-2.5 py-2 transition-colors"
                  >
                    <div className="flex items-start gap-2 pr-7">
                      <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${typeColor(s.type)}`}>
                        <Icon size={12} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[12px] font-semibold text-ink-800 truncate leading-tight">
                          {s.name}
                        </div>
                        <div className="text-[11px] text-ink-400 truncate mt-0.5">
                          {s.meta}
                        </div>
                      </div>
                    </div>
                    <div className="mt-1.5 flex items-center gap-1 text-[11px]">
                      <CheckCircle2 size={10} className="text-compliant-700 shrink-0" />
                      <span className="font-semibold text-compliant-700">Good</span>
                      {s.linked && (
                        <span className="ml-auto text-[10px] font-semibold uppercase tracking-wider text-brand-600">
                          Linked
                        </span>
                      )}
                    </div>
                    {s.linked && (
                      <button
                        type="button"
                        onClick={() => removeLinkedSource(s.name)}
                        aria-label={`Unlink ${s.name}`}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-md border border-canvas-border bg-canvas text-ink-400 hover:text-risk hover:border-risk/30 flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <X size={11} />
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
          </>
        )}
      </div>
    </aside>
  );
}

function OutputKPICard({
  label,
  value,
  valueTone,
  delta,
  deltaTone,
}: {
  label: string;
  value: string;
  valueTone?: 'risk' | 'ok' | 'default';
  delta?: string;
  deltaTone?: 'risk' | 'ok' | 'neutral';
}) {
  const valueColor =
    valueTone === 'risk'
      ? 'text-risk'
      : valueTone === 'ok'
        ? 'text-compliant'
        : 'text-ink-900';
  const deltaColor =
    deltaTone === 'risk'
      ? 'text-risk bg-risk-50'
      : deltaTone === 'ok'
        ? 'text-compliant-700 bg-compliant-50'
        : 'text-ink-500 bg-canvas';
  return (
    <div className="rounded-xl border border-canvas-border bg-canvas-elevated p-2.5">
      <div className="text-[9.5px] font-bold text-ink-400 tracking-wider">{label}</div>
      <div className="flex items-baseline gap-1.5 mt-0.5">
        <div className={`text-[18px] font-bold ${valueColor} leading-none tabular-nums`}>
          {value}
        </div>
        {delta && (
          <span
            className={`text-[9.5px] font-bold rounded-md px-1.5 py-0.5 ${deltaColor}`}
          >
            {delta}
          </span>
        )}
      </div>
    </div>
  );
}

const FLAG_DISTRIBUTION: { label: string; value: number; color: string }[] = [
  { label: 'MTOW Mismatch', value: 45, color: '#E24C5D' },
  { label: 'Excess Charge', value: 30, color: '#6A12CD' },
  { label: 'Invalid ID', value: 25, color: '#F0A93B' },
];

function FlagDistributionCard() {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const total = FLAG_DISTRIBUTION.reduce((n, s) => n + s.value, 0);
  let offsetAccum = 0;
  return (
    <div className="rounded-xl border border-canvas-border bg-canvas-elevated p-3">
      <div className="text-[10.5px] font-bold text-ink-400 tracking-wider mb-2">
        FLAG DISTRIBUTION
      </div>
      <div className="flex items-center gap-3">
        <svg
          viewBox="0 0 80 80"
          width="78"
          height="78"
          className="shrink-0 -rotate-90"
          aria-hidden="true"
        >
          {FLAG_DISTRIBUTION.map((seg) => {
            const dash = (seg.value / total) * circumference;
            const gap = circumference - dash;
            const el = (
              <circle
                key={seg.label}
                cx={40}
                cy={40}
                r={radius}
                fill="transparent"
                stroke={seg.color}
                strokeWidth={10}
                strokeDasharray={`${dash} ${gap}`}
                strokeDashoffset={-offsetAccum}
                strokeLinecap="butt"
              />
            );
            offsetAccum += dash;
            return el;
          })}
        </svg>
        <ul className="flex flex-col gap-1.5 min-w-0 flex-1">
          {FLAG_DISTRIBUTION.map((seg) => (
            <li key={seg.label} className="flex items-center gap-2 text-[12px]">
              <span
                className="w-3 h-3 rounded-sm shrink-0"
                style={{ background: seg.color }}
              />
              <span className="flex-1 truncate text-ink-700">{seg.label}</span>
              <span className="font-bold text-ink-900 tabular-nums">{seg.value}%</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const MONTHLY_VOLUME: { month: string; value: number; label: string }[] = [
  { month: 'Oct', value: 1800, label: '1.8K' },
  { month: 'Nov', value: 2100, label: '2.1K' },
  { month: 'Dec', value: 1900, label: '1.9K' },
  { month: 'Jan', value: 2400, label: '2.4K' },
  { month: 'Feb', value: 2100, label: '2.1K' },
  { month: 'Mar', value: 2100, label: '2.1K' },
];

function MonthlyInvoiceVolumeCard() {
  const max = Math.max(...MONTHLY_VOLUME.map((m) => m.value));
  const chartHeight = 56;
  return (
    <div className="rounded-xl border border-canvas-border bg-canvas-elevated p-3">
      <div className="text-[12.5px] font-semibold text-ink-900 mb-3">
        Monthly Invoice Volume
      </div>
      <div className="grid grid-cols-6 gap-2 items-end" style={{ height: chartHeight + 32 }}>
        {MONTHLY_VOLUME.map((m) => {
          const h = Math.max(4, (m.value / max) * chartHeight);
          return (
            <div key={m.month} className="flex flex-col items-center gap-1 min-w-0">
              <div className="text-[10.5px] font-semibold text-ink-500 tabular-nums">
                {m.label}
              </div>
              <div
                className="w-full rounded-t-sm bg-gradient-to-t from-[#334b6e] to-[#4b6890]"
                style={{ height: `${h}px` }}
                aria-label={`${m.month}: ${m.label}`}
              />
              <div className="text-[10.5px] text-ink-400">{m.month}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
