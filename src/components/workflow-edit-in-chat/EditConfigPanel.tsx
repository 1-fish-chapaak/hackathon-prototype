import { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Database,
  FileText,
  Folder,
  PanelRightClose,
  Play,
  TableProperties,
} from 'lucide-react';
import type { EditWorkspaceTab } from './types';

interface Props {
  initialTab: EditWorkspaceTab;
  open: boolean;
  onToggleOpen: () => void;
}

interface TabMeta {
  key: EditWorkspaceTab;
  label: string;
  count?: string;
  badgeTone?: 'progress' | 'plain';
}

const TABS: TabMeta[] = [
  { key: 'input', label: 'Input Config', count: '3/3', badgeTone: 'progress' },
  { key: 'plan', label: 'Plan', count: '4', badgeTone: 'plain' },
  { key: 'output', label: 'Output Config', count: '6', badgeTone: 'plain' },
  { key: 'preview', label: 'Preview' },
];

export default function EditConfigPanel({ initialTab, open, onToggleOpen }: Props) {
  const [tab, setTab] = useState<EditWorkspaceTab>(initialTab);

  if (!open) {
    return (
      <aside className="flex flex-col h-full bg-canvas-elevated border-l border-canvas-border min-h-0 w-12 shrink-0">
        <button
          type="button"
          title="Expand panel"
          onClick={onToggleOpen}
          className="m-2 w-8 h-8 rounded-lg flex items-center justify-center text-ink-400 hover:bg-canvas hover:text-ink-700 transition-colors cursor-pointer"
        >
          <PanelRightClose size={14} className="rotate-180" />
        </button>
      </aside>
    );
  }

  return (
    <aside className="flex flex-col h-full bg-canvas-elevated border-l border-canvas-border min-h-0">
      {/* Tabs */}
      <div className="h-14 border-b border-canvas-border flex items-end px-3 gap-1 shrink-0">
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={[
                'inline-flex items-center gap-1.5 text-[12px] font-semibold pb-2.5 -mb-px border-b-2 transition-colors cursor-pointer px-1',
                active
                  ? 'text-brand-700 border-brand-600'
                  : 'text-ink-400 border-transparent hover:text-ink-600',
              ].join(' ')}
            >
              {t.label}
              {t.count && (
                <span
                  className={[
                    'inline-flex items-center text-[10.5px] font-bold px-1.5 py-0.5 rounded-full tabular-nums',
                    active && t.badgeTone === 'progress'
                      ? 'bg-brand-50 text-brand-700'
                      : t.badgeTone === 'progress'
                        ? 'bg-canvas border border-canvas-border text-ink-500'
                        : active
                          ? 'bg-brand-50 text-brand-700'
                          : 'bg-canvas border border-canvas-border text-ink-500',
                  ].join(' ')}
                >
                  {t.count}
                </span>
              )}
              {active && <span className="ml-0.5 w-1 h-1 rounded-full bg-brand-600" />}
            </button>
          );
        })}
        <button
          type="button"
          title="Collapse panel"
          onClick={onToggleOpen}
          className="ml-auto mb-2 w-7 h-7 rounded-md flex items-center justify-center text-ink-400 hover:bg-canvas hover:text-ink-700 transition-colors cursor-pointer"
        >
          <PanelRightClose size={14} />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto min-h-0 p-3 space-y-3 bg-canvas">
        {tab === 'input' && <InputConfigTab />}
        {tab === 'plan' && <PlanTab />}
        {tab === 'output' && <OutputConfigTab />}
        {tab === 'preview' && <PreviewTab />}
      </div>
    </aside>
  );
}

/* ─────────────────────────── Input Config ─────────────────────────── */

const FOLDERS: { name: string; files: number; type: string }[] = [
  { name: 'Vendor Contracts', files: 4, type: 'PDF' },
  { name: 'Signed Statements', files: 2, type: 'PDF' },
  { name: 'Policy Documents', files: 3, type: 'PDF' },
];

const FILES: {
  name: string;
  desc: string;
  type: string;
  cols: string[];
}[] = [
  {
    name: 'Invoices',
    desc: 'Vendor invoices for the period under audit.',
    type: 'CSV',
    cols: ['Invoice No', 'Vendor', 'PO Ref', 'Amount', 'Line Item', 'Invoice Date'],
  },
  {
    name: 'Purchase Orders',
    desc: 'Open and closed POs from the ERP.',
    type: 'CSV',
    cols: ['PO No', 'Vendor', 'Contract Ref', 'Amount', 'Line Item', 'Status'],
  },
  {
    name: 'Contracts Register',
    desc: 'Signed master contracts and statements.',
    type: 'PDF',
    cols: ['Contract Ref', 'Vendor', 'Scope', 'Cap', 'End Date'],
  },
];

function InputConfigTab() {
  return (
    <>
      {/* Folders header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[12.5px] font-semibold text-ink-700">
          <Folder size={13} className="text-brand-600" />
          Folders
        </div>
        <span className="text-[10.5px] font-semibold text-ink-400">
          {FOLDERS.length} folders
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {FOLDERS.map((f) => (
          <div
            key={f.name}
            className="rounded-xl border border-canvas-border bg-canvas-elevated p-3 hover:border-brand-200 transition-colors"
          >
            <div className="flex items-start justify-between mb-1">
              <div className="w-7 h-7 rounded-lg bg-brand-50 flex items-center justify-center">
                <Folder size={13} className="text-brand-600" />
              </div>
              <span className="text-[9.5px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-paper-50 text-ink-500">
                {f.type}
              </span>
            </div>
            <div className="text-[12px] font-semibold text-ink-800 mt-1">{f.name}</div>
            <div className="text-[10.5px] text-ink-400 mt-0.5">{f.files} files</div>
            <button className="mt-2 inline-flex items-center gap-1 text-[10.5px] text-ink-400 hover:text-brand-600 transition-colors cursor-pointer">
              <ChevronRight size={10} />
              Show files
            </button>
          </div>
        ))}
      </div>

      {/* Files */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2 text-[12.5px] font-semibold text-ink-700">
          <Database size={13} className="text-brand-600" />
          Files
        </div>
        <span className="text-[10.5px] font-semibold text-ink-400">
          {FILES.length} sources
        </span>
      </div>

      <div className="space-y-2">
        {FILES.map((f) => (
          <div
            key={f.name}
            className="rounded-xl border border-canvas-border bg-canvas-elevated p-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Database size={12} className="text-brand-500 shrink-0" />
                  <span className="text-[12.5px] font-semibold text-ink-900 truncate">
                    {f.name}
                  </span>
                </div>
                <div className="text-[11px] text-ink-400 mt-0.5 truncate">{f.desc}</div>
              </div>
              <span
                className={[
                  'text-[9.5px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0',
                  f.type === 'CSV'
                    ? 'bg-compliant-50 text-compliant-700'
                    : 'bg-paper-50 text-ink-500',
                ].join(' ')}
              >
                {f.type}
              </span>
            </div>
            <div className="flex flex-wrap gap-1 mt-2.5">
              {f.cols.map((c) => (
                <span
                  key={c}
                  className="text-[10.5px] font-medium px-1.5 py-0.5 rounded-md bg-brand-50/70 text-brand-700"
                >
                  {c}
                </span>
              ))}
            </div>
            <button className="mt-2 inline-flex items-center gap-1 text-[10.5px] text-ink-400 hover:text-brand-600 transition-colors cursor-pointer">
              <ChevronRight size={10} />
              Show column details
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

/* ─────────────────────────── Plan ─────────────────────────── */

const PLAN_STEPS: { name: string; desc: string }[] = [
  {
    name: 'Ingest invoice + PO data',
    desc: 'Pull from SAP ERP — AP Module and GL Transaction History.',
  },
  {
    name: 'Normalise vendor + amount fields',
    desc: 'Trim, lower-case, currency-normalise to base currency.',
  },
  {
    name: 'Three-way match',
    desc: 'Match Invoice ↔ PO ↔ Contract using PO Ref + tolerance.',
  },
  {
    name: 'Score variance + route',
    desc: 'Within tolerance → matched. Beyond → variance. No match → unmatched.',
  },
];

function PlanTab() {
  return (
    <div className="rounded-xl border border-canvas-border bg-canvas-elevated p-4">
      <div className="text-[10px] font-bold uppercase tracking-wider text-ink-400 mb-3">
        Query Execution Plan
      </div>
      <ol className="space-y-3">
        {PLAN_STEPS.map((s, i) => (
          <li key={s.name} className="flex items-start gap-3">
            <div className="flex flex-col items-center shrink-0">
              <div className="w-6 h-6 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center text-[11px] font-bold">
                {i + 1}
              </div>
              {i < PLAN_STEPS.length - 1 && (
                <div className="w-px flex-1 min-h-[16px] bg-canvas-border mt-1" />
              )}
            </div>
            <div className="min-w-0 pb-1">
              <div className="text-[12.5px] font-semibold text-ink-800">{s.name}</div>
              <div className="text-[11.5px] text-ink-400 leading-relaxed">{s.desc}</div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ─────────────────────────── Output Config ─────────────────────────── */

const OUTPUT_COLUMNS: { name: string; type: string; required?: boolean }[] = [
  { name: 'Invoice No', type: 'TXT', required: true },
  { name: 'Vendor', type: 'TXT', required: true },
  { name: 'PO Ref', type: 'TXT' },
  { name: 'Amount', type: 'NUM', required: true },
  { name: 'Variance %', type: '%' },
  { name: 'Status', type: 'BADGE' },
];

const TYPE_TONE: Record<string, string> = {
  TXT: 'bg-paper-50 text-ink-500',
  NUM: 'bg-brand-50 text-brand-700',
  '%': 'bg-mitigated-50 text-mitigated-700',
  BADGE: 'bg-brand-50 text-brand-700',
};

function OutputConfigTab() {
  const [layout, setLayout] = useState<'table' | 'dashboard' | 'summary'>('dashboard');
  return (
    <>
      <div className="rounded-xl border border-canvas-border bg-canvas-elevated p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[12.5px] font-semibold text-ink-800 flex items-center gap-1.5">
            <TableProperties size={13} className="text-brand-600" />
            Output Columns
          </div>
          <span className="text-[10.5px] font-semibold text-ink-400">
            {OUTPUT_COLUMNS.length} cols
          </span>
        </div>
        <ul className="space-y-1.5">
          {OUTPUT_COLUMNS.map((c) => (
            <li
              key={c.name}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-canvas border border-canvas-border"
            >
              <span className="text-[12px] font-medium text-ink-800 flex-1 truncate">
                {c.name}
              </span>
              <span
                className={`text-[9.5px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${TYPE_TONE[c.type] || 'bg-paper-50 text-ink-500'}`}
              >
                {c.type}
              </span>
              {c.required && (
                <span className="text-[9.5px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-high-50 text-high-700">
                  Req
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl border border-canvas-border bg-canvas-elevated p-4">
        <div className="text-[12.5px] font-semibold text-ink-800 mb-3">Output Layout</div>
        <div className="flex gap-1.5">
          {(['table', 'dashboard', 'summary'] as const).map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setLayout(opt)}
              className={[
                'flex-1 px-3 py-2 rounded-lg text-[11.5px] font-semibold capitalize transition-colors cursor-pointer border',
                layout === opt
                  ? 'bg-brand-50 text-brand-700 border-brand-300'
                  : 'bg-canvas text-ink-500 border-canvas-border hover:text-ink-800',
              ].join(' ')}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

/* ─────────────────────────── Preview ─────────────────────────── */

const PREVIEW_ROWS: { invoice: string; vendor: string; status: 'matched' | 'variance' | 'unmatched'; variance: string }[] = [
  { invoice: 'INV-4521', vendor: 'Acme Corp', status: 'matched', variance: '0.0%' },
  { invoice: 'INV-3102', vendor: 'Acme Corp', status: 'variance', variance: '3.4%' },
  { invoice: 'INV-9072', vendor: 'Global Supplies', status: 'unmatched', variance: '—' },
  { invoice: 'INV-1188', vendor: 'BlueLeaf Tech', status: 'matched', variance: '0.4%' },
];

const STATUS_CHIP: Record<'matched' | 'variance' | 'unmatched', string> = {
  matched: 'bg-compliant-50 text-compliant-700',
  variance: 'bg-mitigated-50 text-mitigated-700',
  unmatched: 'bg-risk-50 text-risk-700',
};

function PreviewTab() {
  return (
    <>
      <div className="rounded-xl border border-canvas-border bg-canvas-elevated p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[12.5px] font-semibold text-ink-800 flex items-center gap-1.5">
            <FileText size={13} className="text-brand-600" />
            Live Preview
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg bg-brand-600 hover:bg-brand-500 text-white transition-colors cursor-pointer"
          >
            <Play size={10} />
            Run sample
          </button>
        </div>
        <div className="rounded-lg border border-canvas-border overflow-hidden bg-canvas">
          <div className="grid grid-cols-[1fr_1fr_70px_60px] gap-2 px-3 py-2 bg-canvas border-b border-canvas-border">
            <span className="text-[10px] font-bold uppercase tracking-wider text-ink-400">
              Invoice
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-ink-400">
              Vendor
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-ink-400">
              Status
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-ink-400 text-right">
              Δ
            </span>
          </div>
          {PREVIEW_ROWS.map((r) => (
            <div
              key={r.invoice}
              className="grid grid-cols-[1fr_1fr_70px_60px] gap-2 px-3 py-2 border-b border-canvas-border last:border-0 items-center"
            >
              <span className="text-[11.5px] font-mono text-ink-800 truncate">{r.invoice}</span>
              <span className="text-[11.5px] text-ink-700 truncate">{r.vendor}</span>
              <span
                className={`inline-flex items-center justify-center text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${STATUS_CHIP[r.status]}`}
              >
                {r.status}
              </span>
              <span className="text-[11.5px] font-mono text-ink-700 text-right">{r.variance}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-brand-200 bg-brand-50/40 p-3 flex items-start gap-2">
        <ChevronDown size={12} className="text-brand-700 mt-0.5 -rotate-90" />
        <p className="text-[11.5px] leading-relaxed text-brand-800">
          Showing sample data. Click <strong className="font-semibold">Run sample</strong> to
          re-execute against the latest cached run, or open the executor for a full pass.
        </p>
      </div>
    </>
  );
}
