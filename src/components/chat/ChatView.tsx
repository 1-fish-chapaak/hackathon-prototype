import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Send, Paperclip, Sparkles, History, X, FileText,
  Workflow, ShieldCheck, BarChart3, ChevronDown, ChevronRight,
  MessageSquare, ArrowRight, Mic, Plus, Lightbulb,
  Save, CheckCircle, Maximize2,
  ExternalLink, Download, MoreHorizontal, Pencil, CornerDownLeft, ArrowUpRight,
} from 'lucide-react';
import { CHAT_HISTORY, CHAT_CONVERSATIONS, CLARIFICATION_STEPS } from '../../data/mockData';
import { useToast } from '../shared/Toast';
import type { WorkflowTypeId } from '../../data/mockData';
import type { ArtifactTab } from '../../hooks/useAppState';
import { TextShimmer } from '../shared/TextShimmer';
import { AuditifyHelloEffect } from '../shared/HelloEffect';
import BorderGlow from '../shared/BorderGlow';
import FloatingLines from '../shared/FloatingLines';
// Persona removed — Rive WebGL crashes in some browsers
import ClarificationCard from './ClarificationCard';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  thinking?: string[];
  hasArtifact?: boolean;
  artifactType?: 'workflow' | 'query' | 'report';
  followUps?: string[];
  timestamp: Date;
  // Rich inline components
  richType?: 'summary-kpi' | 'audit-result' | 'audit-loading' | 'clarification' | 'save-workflow-prompt';
  richData?: Record<string, unknown>;
}

// Clarification interaction shape (one per IRA message of richType 'clarification')
interface ClarificationData {
  intro: string;
  questions: { question: string; options: string[] }[];
  answers: Record<number, string>;
  status: 'open' | 'submitted'; // 'submitted' freezes the UI into a recap
}

// ─── Audit-query result fixture ──────────────────────────────────────────────
const AUDIT_RESULT = {
  kpis: [
    { label: 'Records scanned', value: '1.2M', color: 'text-ink-800' },
    { label: 'Duplicates found', value: '8', color: 'text-risk-700' },
    { label: 'Total amount', value: '₹6.16L', color: 'text-mitigated-700' },
    { label: 'Highest match', value: '96%', color: 'text-evidence-700' },
  ],
  charts: [
    {
      id: 'confidence',
      label: 'By confidence',
      // Match-score histogram — 4 vertical bars
      data: [
        { bucket: '90–100%', count: 5, tone: 'bg-risk' },
        { bucket: '80–89%', count: 2, tone: 'bg-high' },
        { bucket: '70–79%', count: 1, tone: 'bg-mitigated' },
        { bucket: '60–69%', count: 0, tone: 'bg-compliant' },
      ],
    },
    {
      id: 'vendor',
      label: 'By vendor',
      // Top vendors — horizontal bars
      data: [
        { bucket: 'Acme Corp', count: 4, tone: 'bg-risk' },
        { bucket: 'Global Supplies', count: 2, tone: 'bg-high' },
        { bucket: 'TechParts Ltd', count: 1, tone: 'bg-mitigated' },
        { bucket: 'FastShip Logistics', count: 1, tone: 'bg-mitigated' },
      ],
    },
  ],
  table: {
    columns: ['Invoice A', 'Invoice B', 'Vendor', 'Amount', 'Match %'],
    rows: [
      ['INV-2024-8821', 'INV-2024-8847', 'Acme Corp', '₹1,42,500', '96%'],
      ['INV-2024-8910', 'INV-2024-9001', 'Acme Corp', '₹89,200', '94%'],
      ['INV-2024-9112', 'INV-2024-9183', 'Global Supplies', '₹2,18,400', '92%'],
      ['INV-2024-9245', 'INV-2024-9301', 'Acme Corp', '₹54,000', '91%'],
      ['INV-2024-9377', 'INV-2024-9420', 'Global Supplies', '₹76,800', '90%'],
    ],
    totalRows: 8,
  },
};

const AUDIT_FOLLOWUPS = [
  'Show match-method breakdown for the top 3 flags',
  'Drill into Acme Corp’s flagged invoices',
  'Build a recurring duplicate-invoice monitoring workflow',
];

interface ChatViewProps {
  showChatHistory: boolean;
  toggleChatHistory: () => void;
  setShowArtifacts: (v: boolean) => void;
  setActiveArtifactTab: (t: ArtifactTab) => void;
  setArtifactMode: (m: 'query' | 'workflow') => void;
  setWorkflowCanvasStage?: (stage: number) => void;
  setWorkflowType?: (type: WorkflowTypeId | null) => void;
  setQueryAssumptions?: (assumptions: string[]) => void;
  initialQuery?: string;
  onInitialQueryProcessed?: () => void;
  /** When set, ChatView loads CHAT_CONVERSATIONS[selectedChatId] on mount/change. */
  selectedChatId?: string | null;
  /** Called once the selected chat has been loaded so the parent can clear the id. */
  onChatLoaded?: () => void;
  /** Optional view router so the slide-out can deep-link to /recents. */
  setView?: (v: import('../../hooks/useAppState').View) => void;
}

const QUICK_ACTIONS = [
  { icon: Workflow, label: 'Build a workflow', color: 'from-purple-500 to-violet-600' },
  { icon: ShieldCheck, label: 'Run audit query', color: 'from-blue-500 to-cyan-500' },
];

// Step labels for the subtle inline audit loader. The artifact panel renders
// the full Plan / Code / Sources detail; here we only narrate progress as a
// single shimmering line and sync the active artifact tab.
const LOADING_STEPS: { label: string; tab: ArtifactTab | null }[] = [
  { label: 'Generating execution plan…',  tab: 'plan' },
  { label: 'Writing SQL query…',          tab: 'code' },
  { label: 'Connecting data sources…',    tab: 'sources' },
  { label: 'Processing 1.2M records…',    tab: null },
];

const WORKFLOW_TYPE_NAMES: Record<WorkflowTypeId, string> = {
  reconciliation: 'Three-Way Reconciliation',
  detection: 'Duplicate Detection',
  monitoring: 'Vendor Master Monitoring',
  compliance: 'Segregation of Duties Compliance',
};

const detectWorkflowType = (msg: string): WorkflowTypeId => {
  const lower = msg.toLowerCase();
  if (lower.includes('reconciliation') || lower.includes('3-way') || lower.includes('po match')) return 'reconciliation';
  if (lower.includes('duplicate') || lower.includes('detection')) return 'detection';
  if (lower.includes('monitor') || lower.includes('vendor master') || lower.includes('change')) return 'monitoring';
  if (lower.includes('sod') || lower.includes('segregation') || lower.includes('compliance')) return 'compliance';
  return 'detection';
};

// ─── Chart primitives ────────────────────────────────────────────────────────

type ChartDatum = { bucket: string; count: number; tone: string };

function VerticalBars({ data, maxBarHeight = 140 }: { data: ChartDatum[]; maxBarHeight?: number }) {
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div className="flex items-end justify-around gap-3 px-2" style={{ height: maxBarHeight + 32 }}>
      {data.map(d => {
        const h = (d.count / max) * maxBarHeight;
        return (
          <div key={d.bucket} className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
            <div className="text-[12px] font-semibold text-ink-700 tabular-nums">{d.count}</div>
            <div className={`w-full rounded-t-md ${d.tone}`} style={{ height: Math.max(h, 2) }} />
            <div className="text-[11px] text-ink-500 truncate w-full text-center">{d.bucket}</div>
          </div>
        );
      })}
    </div>
  );
}

function HorizontalBars({ data }: { data: ChartDatum[] }) {
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div className="flex flex-col gap-2 px-2 py-3">
      {data.map(d => {
        const w = (d.count / max) * 100;
        return (
          <div key={d.bucket} className="flex items-center gap-3">
            <div className="w-32 text-[12px] text-ink-700 truncate shrink-0">{d.bucket}</div>
            <div className="flex-1 h-5 bg-paper-100 rounded-md overflow-hidden">
              <div className={`h-full rounded-md ${d.tone}`} style={{ width: `${w}%` }} />
            </div>
            <div className="w-6 text-right text-[12px] font-semibold text-ink-700 tabular-nums">{d.count}</div>
          </div>
        );
      })}
    </div>
  );
}

function renderChart(chart: typeof AUDIT_RESULT.charts[number], variant: 'inline' | 'fullscreen') {
  if (chart.id === 'confidence') return <VerticalBars data={chart.data} maxBarHeight={variant === 'fullscreen' ? 280 : 140} />;
  return <HorizontalBars data={chart.data} />;
}

// ─── ChartGroup with chip toggle + fullscreen ────────────────────────────────

function ChartGroup({ charts }: { charts: typeof AUDIT_RESULT.charts }) {
  const [activeId, setActiveId] = useState(charts[0].id);
  const [fullscreen, setFullscreen] = useState(false);
  const active = charts.find(c => c.id === activeId) ?? charts[0];

  return (
    <>
      <div className="rounded-xl border border-canvas-border bg-canvas-elevated overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 border-b border-canvas-border bg-paper-50/60">
          {charts.length > 1 ? (
            <div className="inline-flex items-center gap-1 p-0.5 rounded-md bg-paper-100">
              {charts.map(c => {
                const isActive = c.id === activeId;
                return (
                  <button
                    key={c.id}
                    onClick={() => setActiveId(c.id)}
                    className={`px-2.5 h-7 rounded text-[12px] font-medium transition-colors ${
                      isActive ? 'bg-canvas-elevated text-brand-700 shadow-sm' : 'text-ink-500 hover:text-ink-700'
                    }`}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>
          ) : (
            <span className="text-[12px] font-medium text-ink-700">{active.label}</span>
          )}
          <button
            onClick={() => setFullscreen(true)}
            className="p-1.5 rounded-md text-ink-500 hover:text-ink-700 hover:bg-paper-100 transition-colors cursor-pointer"
            aria-label="Expand chart"
          >
            <Maximize2 size={14} />
          </button>
        </div>
        <div className="py-3">{renderChart(active, 'inline')}</div>
      </div>
      <AnimatePresence>
        {fullscreen && (
          <FullscreenChartModal
            charts={charts}
            activeId={activeId}
            onActiveChange={setActiveId}
            onClose={() => setFullscreen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

function FullscreenChartModal({
  charts, activeId, onActiveChange, onClose,
}: {
  charts: typeof AUDIT_RESULT.charts;
  activeId: string;
  onActiveChange: (id: string) => void;
  onClose: () => void;
}) {
  const active = charts.find(c => c.id === activeId) ?? charts[0];
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.96, y: 8 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.96, y: 8 }}
        transition={{ duration: 0.15, ease: [0.2, 0, 0, 1] }}
        className="relative w-[960px] max-w-[90vw] bg-canvas-elevated rounded-2xl border border-canvas-border shadow-xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-canvas-border">
          {charts.length > 1 ? (
            <div className="inline-flex items-center gap-1 p-0.5 rounded-md bg-paper-100">
              {charts.map(c => {
                const isActive = c.id === activeId;
                return (
                  <button
                    key={c.id}
                    onClick={() => onActiveChange(c.id)}
                    className={`px-3 h-7 rounded text-[12px] font-medium transition-colors ${
                      isActive ? 'bg-canvas-elevated text-brand-700 shadow-sm' : 'text-ink-500 hover:text-ink-700'
                    }`}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>
          ) : (
            <span className="text-[13px] font-semibold text-ink-800">{active.label}</span>
          )}
          <button onClick={onClose} className="p-1.5 rounded-md text-ink-500 hover:text-ink-700 hover:bg-paper-100 transition-colors cursor-pointer">
            <X size={16} />
          </button>
        </div>
        <div className="overflow-x-auto p-6">
          <div className="min-w-[600px]">{renderChart(active, 'fullscreen')}</div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Results table preview ───────────────────────────────────────────────────

function ResultsTable({
  columns, rows, totalRows, onOpen, onDownload,
}: {
  columns: string[];
  rows: string[][];
  totalRows: number;
  onOpen: () => void;
  onDownload: () => void;
}) {
  return (
    <div className="rounded-xl border border-canvas-border bg-canvas-elevated overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b border-canvas-border bg-paper-50">
              {columns.map(c => (
                <th key={c} className="text-left px-3 py-2.5 font-semibold text-ink-500">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-canvas-border last:border-b-0 hover:bg-brand-50/40 transition-colors">
                {row.map((cell, j) => (
                  <td key={j} className={`px-3 py-2.5 text-ink-700 ${j >= 3 ? 'tabular-nums' : ''}`}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between px-3 py-2 border-t border-canvas-border bg-paper-50/60">
        <span className="text-[12px] text-ink-500">Preview · <span className="tabular-nums">{rows.length}</span> of <span className="tabular-nums">{totalRows}</span> results</span>
        <div className="flex items-center gap-1">
          <button onClick={onOpen} className="inline-flex items-center gap-1 h-7 px-2 rounded-md text-[12px] text-ink-600 hover:text-brand-700 hover:bg-brand-50 transition-colors cursor-pointer">
            <ExternalLink size={12} /> Open in new view
          </button>
          <button onClick={onDownload} className="inline-flex items-center gap-1 h-7 px-2 rounded-md text-[12px] text-ink-600 hover:text-brand-700 hover:bg-brand-50 transition-colors cursor-pointer">
            <Download size={12} /> Download CSV
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Actions dropdown ────────────────────────────────────────────────────────

function ActionsMenu({ onPick }: { onPick: (action: 'workflow' | 'report' | 'dashboard') => void }) {
  const [open, setOpen] = useState(false);
  const items: { id: 'workflow' | 'report' | 'dashboard'; label: string; icon: React.ElementType }[] = [
    { id: 'workflow', label: 'Save as workflow', icon: Workflow },
    { id: 'report', label: 'Add to report', icon: FileText },
    { id: 'dashboard', label: 'Add to dashboard', icon: BarChart3 },
  ];
  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(p => !p)}
        className="inline-flex items-center gap-2 h-9 px-3 rounded-md bg-canvas-elevated border border-canvas-border text-[12px] font-semibold text-ink-700 hover:border-brand-200 hover:text-ink-800 transition-colors cursor-pointer"
      >
        <MoreHorizontal size={14} />
        Actions
        <ChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.12 }}
              className="absolute left-0 top-full mt-1 w-56 z-20 bg-canvas-elevated border border-canvas-border rounded-md py-1 shadow-md"
            >
              {items.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => { onPick(item.id); setOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-ink-700 hover:bg-brand-50 hover:text-brand-700 transition-colors cursor-pointer"
                  >
                    <Icon size={14} className="text-ink-500" />
                    {item.label}
                  </button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Collapsible thinking trail (one per IRA message) ───────────────────────

function ThinkingTrail({ summary, steps, defaultOpen = false }: {
  summary: string;
  steps: string[];
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  if (!steps.length) return null;
  return (
    <button
      onClick={() => setOpen(p => !p)}
      className="group inline-flex items-start gap-1.5 text-left text-[12px] text-ink-500 hover:text-ink-700 transition-colors cursor-pointer mb-2"
    >
      <ChevronRight size={12} className={`mt-0.5 shrink-0 transition-transform ${open ? 'rotate-90' : ''}`} />
      <span className="flex-1">
        <span className="block">{summary}</span>
        {open && (
          <span className="mt-1.5 block pl-2 border-l border-canvas-border space-y-0.5">
            {steps.map((s, i) => (
              <span key={i} className="block text-ink-500">— {s}</span>
            ))}
          </span>
        )}
      </span>
    </button>
  );
}

// ─── Clarification block (interactive, lives inside an IRA message) ────────

function ClarificationBlock({
  data, onAnswer, onSubmit, onSkipAll, onSkipCurrent,
}: {
  data: ClarificationData;
  onAnswer: (qIndex: number, answer: string) => void;
  onSubmit: () => void;
  onSkipAll: () => void;
  onSkipCurrent: (qIndex: number) => void;
}) {
  const total = data.questions.length;
  const answeredCount = Object.keys(data.answers).length;
  const activeIndex = data.questions.findIndex((_, i) => data.answers[i] === undefined);

  const [highlighted, setHighlighted] = useState(0);
  const [customInput, setCustomInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const customInputRef = useRef(customInput);
  customInputRef.current = customInput;

  // Reset highlight + input when active question changes
  useEffect(() => {
    setHighlighted(0);
    setCustomInput('');
  }, [activeIndex]);

  const activeQ = activeIndex !== -1 ? data.questions[activeIndex] : null;
  const optionCount = activeQ?.options.length ?? 0;

  // Keyboard navigation — only fires while clarification is open and active
  useEffect(() => {
    if (data.status === 'submitted' || activeIndex === -1 || !activeQ) return;
    const handler = (e: KeyboardEvent) => {
      const active = document.activeElement;
      const inMainTextarea =
        active instanceof HTMLTextAreaElement ||
        (active instanceof HTMLInputElement && active !== inputRef.current);
      const inOurInput = active === inputRef.current;

      if (e.key === 'ArrowDown') {
        if (inMainTextarea) return;
        e.preventDefault();
        setHighlighted(h => Math.min(h + 1, optionCount - 1));
      } else if (e.key === 'ArrowUp') {
        if (inMainTextarea) return;
        e.preventDefault();
        setHighlighted(h => Math.max(h - 1, 0));
      } else if (e.key === 'Enter' && !inMainTextarea && !inOurInput) {
        e.preventDefault();
        selectOption(activeQ.options[highlighted]);
      } else if (e.key === 'Escape') {
        if (inMainTextarea) return;
        e.preventDefault();
        skipCurrent();
      } else if (/^[1-9]$/.test(e.key) && !inMainTextarea && !inOurInput) {
        const num = parseInt(e.key, 10) - 1;
        if (num < optionCount) {
          e.preventDefault();
          selectOption(activeQ.options[num]);
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
    // selectOption / skipCurrent close over highlighted + activeIndex; we want fresh ones
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlighted, activeIndex, optionCount, data.status]);

  if (data.status === 'submitted') {
    return (
      <div className="text-[13px] text-ink-700 leading-relaxed">
        Got it — running with these inputs.
      </div>
    );
  }

  if (activeIndex === -1 || !activeQ) {
    return null;
  }

  function selectOption(opt: string) {
    if (activeIndex === -1) return;
    const wasLast = answeredCount === total - 1;
    onAnswer(activeIndex, opt);
    if (wasLast) setTimeout(() => onSubmit(), 80);
  }

  function skipCurrent() {
    if (activeIndex === -1) return;
    const wasLast = activeIndex === total - 1;
    onSkipCurrent(activeIndex);
    if (wasLast) setTimeout(() => onSubmit(), 80);
  }

  return (
    <div className="space-y-2">
      <div className="rounded-xl border border-canvas-border bg-canvas-elevated overflow-hidden shadow-sm">
        {/* Header */}
        <div className="px-4 py-3 border-b border-canvas-border bg-paper-50/40 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[13px] font-semibold text-ink-800 truncate">{activeQ.question}</span>
            <span className="text-[11px] text-ink-500 tabular-nums shrink-0">· {activeIndex + 1} of {total}</span>
          </div>
          <button
            onClick={onSkipAll}
            aria-label="Dismiss clarification"
            className="text-ink-400 hover:text-ink-700 p-0.5 rounded transition-colors cursor-pointer shrink-0"
          >
            <X size={14} />
          </button>
        </div>

        {/* Numbered options */}
        <div role="listbox" aria-label={activeQ.question}>
          {activeQ.options.map((opt, idx) => {
            const isHighlighted = highlighted === idx;
            return (
              <button
                key={opt}
                role="option"
                aria-selected={isHighlighted}
                onClick={() => selectOption(opt)}
                onMouseEnter={() => setHighlighted(idx)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left border-t border-canvas-border first:border-t-0 transition-colors cursor-pointer ${
                  isHighlighted ? 'bg-paper-100/70' : 'hover:bg-paper-50/50'
                }`}
              >
                <span className={`inline-flex items-center justify-center w-6 h-6 rounded text-[11px] font-mono tabular-nums shrink-0 transition-colors ${
                  isHighlighted ? 'bg-paper-200 text-ink-800' : 'bg-paper-100 text-ink-500'
                }`}>
                  {idx + 1}
                </span>
                <span className="flex-1 text-[13px] text-ink-800">{opt}</span>
                {isHighlighted && (
                  <CornerDownLeft size={12} className="text-ink-500 shrink-0" />
                )}
              </button>
            );
          })}

          {/* Custom input row */}
          <div className="border-t border-canvas-border flex items-center gap-3 px-4 py-2">
            <Pencil size={13} className="text-ink-400 shrink-0" />
            <input
              ref={inputRef}
              value={customInput}
              onChange={e => setCustomInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && customInputRef.current.trim()) {
                  e.preventDefault();
                  e.stopPropagation();
                  selectOption(customInputRef.current.trim());
                }
              }}
              placeholder="Something else"
              className="flex-1 bg-transparent text-[13px] text-ink-800 placeholder:text-ink-400 outline-none h-8"
            />
            <button
              onClick={skipCurrent}
              className="px-3 h-7 text-[12px] font-medium text-ink-600 hover:text-ink-800 border border-canvas-border bg-paper-50/60 hover:bg-paper-100/60 rounded-md transition-colors cursor-pointer shrink-0"
            >
              Skip
            </button>
          </div>
        </div>
      </div>

      {/* Footer kbd hints + answered tally */}
      <div className="flex items-center justify-between gap-4 text-[11px] text-ink-500 px-1">
        <div className="flex items-center gap-3">
          <span>↑↓ to navigate</span>
          <span className="text-ink-300">·</span>
          <span>Enter to select</span>
          <span className="text-ink-300">·</span>
          <span>Esc to skip</span>
        </div>
        <span className="tabular-nums">{answeredCount} of {total} answered</span>
      </div>
    </div>
  );
}

// ─── Subtle inline audit loader ───────────────────────────────────────────────
// Single shimmering line that cycles through LOADING_STEPS, syncs the active
// artifact tab as it advances, and fires onComplete when done. The artifact
// panel carries the heavy detail (Plan / Code / Sources); inline stays quiet.
function InlineAuditLoader({
  steps,
  onTabSwitch,
  onComplete,
  stepDurationMs = 1700,
}: {
  steps: { label: string; tab: ArtifactTab | null }[];
  onTabSwitch?: (tab: ArtifactTab) => void;
  onComplete: () => void;
  stepDurationMs?: number;
}) {
  const [stepIdx, setStepIdx] = useState(0);
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  const onTabSwitchRef = useRef(onTabSwitch);
  onCompleteRef.current = onComplete;
  onTabSwitchRef.current = onTabSwitch;

  useEffect(() => {
    if (completedRef.current) return;
    if (stepIdx >= steps.length) {
      completedRef.current = true;
      onCompleteRef.current();
      return;
    }
    const tab = steps[stepIdx].tab;
    if (tab) onTabSwitchRef.current?.(tab);
    const t = setTimeout(() => setStepIdx(i => i + 1), stepDurationMs);
    return () => clearTimeout(t);
  }, [stepIdx, steps, stepDurationMs]);

  const active = steps[Math.min(stepIdx, steps.length - 1)];
  return (
    <div className="flex items-center gap-2 text-[13px] text-ink-600">
      <span className="relative flex h-1.5 w-1.5 shrink-0" aria-hidden>
        <span className="absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-60 animate-ping" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-600" />
      </span>
      <TextShimmer as="span" duration={2} spread={1.5}>
        {active.label}
      </TextShimmer>
    </div>
  );
}

function SaveWorkflowButton() {
  const [saved, setSaved] = useState(false);
  if (saved) {
    return (
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="flex items-center gap-1.5 px-3 py-2 bg-compliant-50 text-compliant rounded-lg text-[12px] font-semibold">
        <CheckCircle size={12} /> Saved to Library
      </motion.div>
    );
  }
  return (
    <button onClick={() => setSaved(true)} className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-[12px] font-semibold transition-colors cursor-pointer">
      <Save size={12} /> Save to Library
    </button>
  );
}

export default function ChatView({ showChatHistory, toggleChatHistory, setShowArtifacts, setActiveArtifactTab, setArtifactMode, setWorkflowType, initialQuery, onInitialQueryProcessed, selectedChatId, onChatLoaded, setView }: ChatViewProps) {
  const { addToast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [thinkingSteps, setThinkingSteps] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const processingRef = useRef(false);

  // New flow state
  const [showClarificationCard, setShowClarificationCard] = useState(false);
  const [clarificationQuestions, setClarificationQuestions] = useState<Array<{ question: string; options: string[] }>>([]);
  const [showProgressiveLoader, setShowProgressiveLoader] = useState(false);

  // Workflow build flow state
  const [workflowBuildPhase, setWorkflowBuildPhase] = useState(0); // 0=idle, 1=asking-files, 2=asking-logic, 3=confirming, 4=input-config, 5=freeze-confirm, 6=output-config, 7=save
  const [currentWorkflowType, setCurrentWorkflowType] = useState<WorkflowTypeId | null>(null);

  // Track whether the progressive loader is rendering an audit-query response
  const activeQueryFlowRef = useRef<'audit-query' | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isUserScrolledUp = useRef(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const threshold = 100;
    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    isUserScrolledUp.current = distanceFromBottom > threshold;
  }, []);

  useEffect(() => {
    if (!isUserScrolledUp.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, thinkingSteps, showClarificationCard, showProgressiveLoader]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach(t => clearTimeout(t));
    };
  }, []);

  // Support for "Ask AI about risk" context — auto-send initialQuery when it appears
  useEffect(() => {
    if (initialQuery) {
      setMessages(prev => [...prev, { id: `msg-${Date.now()}`, role: 'user', text: initialQuery, timestamp: new Date() }]);
      simulateResponse(initialQuery);
      onInitialQueryProcessed?.();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  // Clear all pending timers
  const clearTimers = () => {
    timersRef.current.forEach(t => clearTimeout(t));
    timersRef.current = [];
  };

  // Schedule a callback after ms — stored in ref for cleanup
  const schedule = (fn: () => void, ms: number) => {
    const t = setTimeout(fn, ms);
    timersRef.current.push(t);
  };

  // ─── Load a saved conversation by id (used by slide-out + Recents) ───
  const loadChatById = useCallback((chatId: string) => {
    const convo = CHAT_CONVERSATIONS[chatId];
    if (!convo) return false;
    const msgs: ChatMessage[] = convo.map((m, idx) => ({
      id: `history-${chatId}-${idx}`,
      role: m.role,
      text: m.text,
      timestamp: new Date(),
    }));
    setMessages(msgs);
    setShowClarificationCard(false);
    setShowProgressiveLoader(false);
    setIsTyping(false);
    setThinkingSteps([]);
    setWorkflowBuildPhase(0);
    setCurrentWorkflowType(null);
    clearTimers();
    return true;
  }, []);

  // Honor selectedChatId from app state (Recents → Chats deep-link).
  // Always clear the selection after the effect runs — even when the id has
  // no matching CHAT_CONVERSATIONS entry — so a stale id never sticks.
  useEffect(() => {
    if (!selectedChatId) return;
    loadChatById(selectedChatId);
    onChatLoaded?.();
  }, [selectedChatId, loadChatById, onChatLoaded]);

  // ─── Query Clarification Complete Handler ───
  // ─── Start the audit run as ONE IRA message that hosts the loader inline ───
  const auditRunMsgIdRef = useRef<string | null>(null);
  const startAuditQueryRun = () => {
    activeQueryFlowRef.current = 'audit-query';
    const msgId = `msg-audit-run-${Date.now()}`;
    auditRunMsgIdRef.current = msgId;

    setMessages(prev => [...prev, {
      id: msgId,
      role: 'assistant',
      text: '',
      thinking: [
        'Generating execution plan',
        'Writing SQL query',
        'Connecting to data sources',
        'Processing 1.2M records',
      ],
      timestamp: new Date(),
      richType: 'audit-loading',
    }]);

    setShowProgressiveLoader(true);
    setArtifactMode('query');
    setShowArtifacts(true);
    setActiveArtifactTab('plan');
  };

  // ─── Update an answer for the active clarification message ───
  const updateClarificationAnswer = (msgId: string, qIndex: number, answer: string) => {
    setMessages(prev => prev.map(m => {
      if (m.id !== msgId || m.richType !== 'clarification') return m;
      const data = m.richData as unknown as ClarificationData;
      return {
        ...m,
        richData: { ...data, answers: { ...data.answers, [qIndex]: answer } } as unknown as Record<string, unknown>,
      };
    }));
  };

  // ─── Skip a single clarification question — sentinel '' marks "skipped but acknowledged" ───
  const skipClarificationQuestion = (msgId: string, qIndex: number) => {
    setMessages(prev => prev.map(m => {
      if (m.id !== msgId || m.richType !== 'clarification') return m;
      const data = m.richData as unknown as ClarificationData;
      return {
        ...m,
        richData: { ...data, answers: { ...data.answers, [qIndex]: '' } } as unknown as Record<string, unknown>,
      };
    }));
  };

  // ─── Submit the clarification — freeze it, drop a single user msg, start the run ───
  const submitClarification = (msgId: string, fromSkip = false) => {
    let consolidated: { question: string; answer: string }[] = [];
    setMessages(prev => prev.map(m => {
      if (m.id !== msgId || m.richType !== 'clarification') return m;
      const data = m.richData as unknown as ClarificationData;
      consolidated = data.questions
        .map((q, qi) => ({ question: q.question, answer: data.answers[qi] }))
        .filter(p => !!p.answer);
      return {
        ...m,
        richData: { ...data, status: 'submitted' } as unknown as Record<string, unknown>,
      };
    }));

    schedule(() => {
      const userText = consolidated.length
        ? consolidated.map(c => `• ${c.answer}`).join('\n')
        : (fromSkip ? 'Skip — use sensible defaults.' : 'Run with the inputs above.');
      setMessages(prev => [...prev, {
        id: `msg-user-clarify-${Date.now()}`,
        role: 'user',
        text: userText,
        timestamp: new Date(),
      }]);
    }, 80);

    schedule(() => startAuditQueryRun(), 240);
  };

  // ─── Workflow Clarification Complete Handler ───
  const handleWorkflowClarificationComplete = (answers: Record<number, string>) => {
    setShowClarificationCard(false);

    if (workflowBuildPhase === 1) {
      // Phase 1 complete — summarize and move to Phase 2 (logic)
      const format = answers[0] || 'Mixed sources';
      const count = answers[1] || '3+ sources';
      setMessages(prev => [...prev, {
        id: `msg-wf-files-summary-${Date.now()}`,
        role: 'assistant',
        text: `Got it — **${format}** with **${count}**. Now let me understand the matching logic.`,
        timestamp: new Date(),
      }]);
      setWorkflowBuildPhase(2);

      // Show logic clarification card after brief delay
      schedule(() => {
        setClarificationQuestions([
          { question: 'What matching logic should I use?', options: ['Exact field matching', 'Fuzzy match with tolerance', 'AI-powered pattern detection', 'Custom rules (I\'ll define)'] },
          { question: 'What should happen with mismatches?', options: ['Flag for manual review', 'Auto-reject and notify', 'Quarantine for investigation', 'Score and prioritize'] },
        ]);
        setShowClarificationCard(true);
      }, 800);
    }
    else if (workflowBuildPhase === 2) {
      // Phase 2 complete — summarize and wait for user confirmation before opening canvas
      const logic = answers[0] || 'Fuzzy match';
      const action = answers[1] || 'Flag for review';
      setMessages(prev => [...prev, {
        id: `msg-wf-logic-summary-${Date.now()}`,
        role: 'assistant',
        text: `Perfect — **${logic}** with **${action}** for mismatches.\n\nHere's what I'll build:\n\n• **Data sources:** Mixed format (SQL + file upload)\n• **Matching:** ${logic}\n• **Mismatches:** ${action}\n\nShall I open the workflow canvas and configure the inputs? Type **"go"** or **"looks good"** to proceed.`,
        timestamp: new Date(),
        followUps: ['Looks good, build it', 'Change the matching logic', 'Add more data sources'],
      }]);
      setWorkflowBuildPhase(3);
    }
  };

  // ─── Clarification Card Complete Router (workflow flow only — audit-query is inline now) ───
  const handleClarificationCardComplete = (answers: Record<number, string>) => {
    setShowClarificationCard(false);
    if (workflowBuildPhase > 0) {
      handleWorkflowClarificationComplete(answers);
    }
  };

  // ─── Inline Query Clarification Flow ───
  // ONE IRA message holds: thinking summary + intro + 4 stacked questions + submit row.
  // User answers via clicking options or typing in the main chat box (routed to first
  // unanswered question while a clarification is open).
  const startQueryClarificationFlow = () => {
    clearTimers();
    setIsTyping(true);

    schedule(() => {
      setIsTyping(false);
      const questions = CLARIFICATION_STEPS.map(step => ({
        question: step.question,
        options: step.options,
      }));
      const data: ClarificationData = {
        intro: "One quick check before I run — pick what fits, or type your own.",
        questions,
        answers: {},
        status: 'open',
      };
      setMessages(prev => [...prev, {
        id: `msg-clarify-${Date.now()}`,
        role: 'assistant',
        text: '',
        thinking: [
          'Parsed intent: invoice duplicate detection',
          'Identified 4 underspecified parameters',
          'Selected highest-impact prompts for clarification',
        ],
        timestamp: new Date(),
        richType: 'clarification',
        richData: data as unknown as Record<string, unknown>,
      }]);
    }, 600);
  };

  // ─── Progressive Loading Complete — swap the SAME IRA msg from loading → result ───
  const handleProgressiveLoadingComplete = () => {
    setShowProgressiveLoader(false);
    activeQueryFlowRef.current = null;

    const targetId = auditRunMsgIdRef.current;
    auditRunMsgIdRef.current = null;

    setMessages(prev => prev.map(m => {
      if (m.id !== targetId) return m;
      return {
        ...m,
        text: "Done. I scanned 1.2M invoice records and surfaced 8 potential duplicates — total exposure ₹6.16L, with the highest-confidence pair at 96% match (Acme Corp). Acme accounts for half of the flags and is the first place I'd look.",
        followUps: AUDIT_FOLLOWUPS,
        richType: 'audit-result',
        richData: AUDIT_RESULT,
      };
    }));
  };

  // ─── Conversational Workflow Flow ───
  const startConversationalWorkflowFlow = (userMsg: string) => {
    clearTimers();
    const wfType = detectWorkflowType(userMsg);
    const wfName = WORKFLOW_TYPE_NAMES[wfType];
    setCurrentWorkflowType(wfType);
    setWorkflowBuildPhase(1);

    // Brief thinking animation
    setIsTyping(true);
    schedule(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: `msg-wf-intro-${Date.now()}`,
        role: 'assistant',
        text: `Great, I'll help you build a **${wfName}** workflow. Let me understand your data sources first.`,
        timestamp: new Date(),
      }]);
      // Show file type clarification card
      setClarificationQuestions([
        { question: 'What data format are your source files?', options: ['CSV / Excel upload', 'Direct SQL connection', 'User uploads in chat', 'Mixed (SQL + file upload)'] },
        { question: 'How many data sources will this workflow need?', options: ['1 source (single file)', '2 sources (input + reference)', '3+ sources (multi-way match)', 'Not sure \u2014 recommend for me'] },
      ]);
      setShowClarificationCard(true);
    }, 1200);
  };

  // ─── Open Canvas After User Confirms (workflow phase 3) ───
  const openCanvasAfterConfirmation = () => {
    setIsTyping(true);
    schedule(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: `msg-wf-opening-canvas-${Date.now()}`,
        role: 'assistant',
        text: `Setting up your workflow canvas now...`,
        timestamp: new Date(),
      }]);
    }, 600);

    schedule(() => {
      setArtifactMode('workflow');
      setWorkflowType?.(currentWorkflowType);
      setShowArtifacts(true);
    }, 1200);

    schedule(() => {
      setMessages(prev => [...prev, {
        id: `msg-wf-canvas-ready-${Date.now()}`,
        role: 'assistant',
        text: `I've configured the input sources based on your selections. Review and customize the input configuration in the canvas.\n\nTake your time — click **'Confirm Inputs'** when ready.`,
        timestamp: new Date(),
      }]);
      setWorkflowBuildPhase(4);
    }, 2500);

    // Tip messages
    const freezeHintId = 'msg-wf-freeze-hint';
    schedule(() => {
      setMessages(prev => {
        if (prev.some(m => m.id === freezeHintId)) return prev;
        return [...prev, {
          id: freezeHintId,
          role: 'assistant' as const,
          text: `**Tip:** I've frozen the **Vendor Master Data** by default (last refreshed Mar 20). Toggle freeze on any other source that doesn't change between runs.`,
          timestamp: new Date(),
        }];
      });
    }, 8000);

    schedule(() => {
      setMessages(prev => {
        if (prev.some(m => m.id === 'msg-wf-save-prompt')) return prev;
        return [...prev, {
          id: 'msg-wf-save-prompt',
          role: 'assistant' as const,
          text: '',
          richType: 'save-workflow-prompt',
          timestamp: new Date(),
        }];
      });
    }, 20000);
  };

  const handleAuditAction = (action: 'workflow' | 'report' | 'dashboard') => {
    const labels: Record<typeof action, { in_progress: string; done: string }> = {
      workflow: { in_progress: 'Adding to workflow library…', done: 'Saved as workflow “AQ-2026-04-24”.' },
      report: { in_progress: 'Adding to report draft…', done: 'Added to report “FY26 Q1 — Findings”.' },
      dashboard: { in_progress: 'Adding to dashboard…', done: 'Added to dashboard “P2P health”.' },
    };
    addToast({ type: 'info', message: labels[action].in_progress });
    setTimeout(() => {
      addToast({ type: 'success', message: labels[action].done });
    }, 1200);
  };

  const simulateResponse = (userMsg: string) => {
    clearTimers();

    // If workflow is awaiting user confirmation (phase 3), any positive reply opens canvas
    if (workflowBuildPhase === 3) {
      openCanvasAfterConfirmation();
      return;
    }

    const lower = userMsg.toLowerCase();
    if (lower.includes('workflow') || lower.includes('build a') || lower.includes('build me') || lower.includes('create a') || lower.includes('design a') || lower.includes('reconciliation')) {
      startConversationalWorkflowFlow(userMsg);
      return;
    }

    // Default — audit query flow with clarification → assumptions → loader → inline rich response
    startQueryClarificationFlow();
  };

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed && files.length === 0) return;
    let text = trimmed;
    if (files.length > 0) text += `\n[Attached: ${files.map(f => f.name).join(', ')}]`;

    // If a clarification message is open, route the typed text to its first
    // unanswered question instead of starting a new chat turn.
    const openClarify = [...messages].reverse().find(
      m => m.richType === 'clarification' && (m.richData as unknown as ClarificationData)?.status === 'open'
    );
    if (openClarify && trimmed) {
      const data = openClarify.richData as unknown as ClarificationData;
      const firstUnanswered = data.questions.findIndex((_, i) => !data.answers[i]);
      if (firstUnanswered !== -1) {
        updateClarificationAnswer(openClarify.id, firstUnanswered, trimmed);
        setInput('');
        setFiles([]);
        if (textareaRef.current) textareaRef.current.style.height = 'auto';
        return;
      }
    }

    setMessages(prev => [...prev, { id: `msg-${Date.now()}`, role: 'user', text, timestamp: new Date() }]);
    setInput('');
    setFiles([]);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    simulateResponse(text);
  };

  const handleFollowUpClick = (question: string) => {
    if (processingRef.current) return;
    processingRef.current = true;
    setMessages(prev => [...prev, { id: `msg-${Date.now()}`, role: 'user', text: question, timestamp: new Date() }]);
    simulateResponse(question);
    setTimeout(() => { processingRef.current = false; }, 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
  };

  const handleTextareaInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + 'px';
    }
  };

  const isEmpty = messages.length === 0;

  // Most-recent open clarification — drives the docked picker at the bottom of the chat.
  const openClarification = [...messages].reverse().find(
    m => m.richType === 'clarification' && (m.richData as unknown as ClarificationData)?.status === 'open'
  );

  /* ────────────────────── CHAT HISTORY SIDEBAR ────────────────────── */
  const chatHistoryPanel = (
    <AnimatePresence>
      {showChatHistory && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 280, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="h-full bg-white border-r border-border-light overflow-hidden shrink-0"
        >
          <div className="p-4 border-b border-border-light flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text">Chat History</h3>
            <button onClick={toggleChatHistory} className="text-text-muted hover:text-text-secondary p-1 rounded-md hover:bg-gray-50 cursor-pointer">
              <X size={16} />
            </button>
          </div>
          <div className="p-3">
            <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-border text-[12.5px] text-primary font-medium hover:bg-primary-xlight transition-colors cursor-pointer">
              <Plus size={14} />
              New Chat
            </button>
          </div>
          <div className="overflow-y-auto flex-1" style={{ height: 'calc(100% - 150px)' }}>
            {CHAT_HISTORY.map(chat => (
              <button
                key={chat.id}
                className="w-full text-left px-4 py-3 border-b border-border-light hover:bg-primary-xlight/50 transition-colors group cursor-pointer"
                onClick={() => loadChatById(chat.id)}
              >
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-md bg-primary/5 flex items-center justify-center shrink-0 mt-0.5">
                    <MessageSquare size={12} className="text-primary/60" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[13px] font-medium text-text truncate group-hover:text-primary transition-colors">{chat.title}</div>
                    <div className="text-[12px] text-text-muted truncate mt-0.5">{chat.preview}</div>
                    <div className="text-[12px] text-text-muted/60 mt-1">{chat.timestamp}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
          {/* Slide-out is a quick switcher for the last 5; canonical browser is /recents. */}
          {setView && (
            <div className="border-t border-border-light p-3">
              <button
                onClick={() => { toggleChatHistory(); setView('recents'); }}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-[12px] font-semibold text-brand-700 hover:bg-brand-50 transition-colors cursor-pointer"
              >
                Browse all in Recents
                <ArrowRight size={12} />
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );

  /* ────────────────────── EMPTY STATE ────────────────────── */
  if (isEmpty) {
    return (
      <div style={{ display: 'flex', height: '100%', width: '100%' }}>
        {chatHistoryPanel}

        <div style={{
          flex: '1 1 0%',
          minWidth: 0,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: '#f8f9fc',
        }}
          className="bg-hero-pattern bg-grid-subtle relative"
        >
          <FloatingLines
            enabledWaves={['top', 'middle', 'bottom']}
            lineCount={5}
            lineDistance={5}
            bendRadius={5}
            bendStrength={-0.5}
            interactive={true}
            parallax={true}
            color="#6a12cd"
            opacity={0.06}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 20px' }} className="relative z-10">
            <button onClick={toggleChatHistory} className="p-2.5 text-text-muted hover:text-text-secondary hover:bg-gray-100 rounded-lg transition-colors cursor-pointer" aria-label="Chat History">
              <History size={18} />
            </button>
            <button className="p-2.5 text-text-muted hover:text-text-secondary hover:bg-gray-100 rounded-lg transition-colors cursor-pointer" aria-label="New Chat">
              <Plus size={18} />
            </button>
          </div>

          <div style={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'auto',
            padding: '0 24px 60px',
          }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              style={{ width: 720, maxWidth: '100%', textAlign: 'center' }}
            >
              <div className="mb-4">
                <AuditifyHelloEffect
                  className="text-primary h-14 mx-auto"
                  speed={0.7}
                />
              </div>

              <h1 style={{ fontSize: 34, fontWeight: 500, letterSpacing: '-0.02em', marginBottom: 8, color: 'rgba(14,11,30,0.85)' }}>
                Audit smarter.{' '}
                <TextShimmer as="span" className="font-bold" duration={3} spread={2}>
                  Not harder.
                </TextShimmer>
              </h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.5, duration: 0.6 }}
                className="text-[15px] text-text-muted mb-10"
              >
                Your AI copilot already knows what to look for. Just ask.
              </motion.p>

              <div className="ai-border" style={{ marginBottom: 24 }}>
                <div style={{ position: 'relative', background: 'white', borderRadius: 18 }}>
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={e => { setInput(e.target.value); handleTextareaInput(); }}
                    onKeyDown={handleKeyDown}
                    placeholder="Describe a workflow and let Auditify do the rest"
                    style={{
                      width: '100%', background: 'transparent', border: 'none', outline: 'none',
                      resize: 'none', padding: '20px 20px 56px', fontSize: 15, minHeight: 100,
                      maxHeight: 200, borderRadius: 18, fontFamily: 'inherit', color: '#0e0b1e',
                      boxSizing: 'border-box',
                    }}
                    rows={2}
                  />
                  <div style={{ position: 'absolute', left: 12, bottom: 12, display: 'flex', gap: 4 }}>
                    <button className="p-2 text-text-muted/40 hover:text-primary hover:bg-primary-xlight rounded-lg transition-colors cursor-pointer" aria-label="Voice input">
                      <Mic size={18} />
                    </button>
                    <label className="cursor-pointer p-2 text-text-muted/40 hover:text-primary hover:bg-primary-xlight rounded-lg transition-colors" aria-label="Attach files">
                      <Plus size={18} />
                      <input type="file" multiple className="hidden" onChange={handleFileUpload} />
                    </label>
                  </div>
                  <div style={{ position: 'absolute', right: 12, bottom: 12 }}>
                    <button
                      onClick={handleSend}
                      disabled={!input.trim() && files.length === 0}
                      className="px-5 py-2.5 bg-gradient-to-r from-primary to-primary-medium hover:from-primary-hover hover:to-primary disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-[13px] font-semibold transition-all flex items-center gap-2 shadow-sm cursor-pointer"
                    >
                      <Sparkles size={14} />
                      Submit
                    </button>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 32 }}>
                {QUICK_ACTIONS.map((action, i) => (
                  <motion.button
                    key={action.label}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.08 }}
                    onClick={() => {
                      const text = action.label;
                      setMessages(prev => [...prev, { id: `msg-${Date.now()}`, role: 'user', text, timestamp: new Date() }]);
                      simulateResponse(text);
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-border-light bg-white hover:border-primary/30 hover:shadow-sm transition-all text-[13px] text-text-secondary hover:text-text cursor-pointer"
                  >
                    <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${action.color} flex items-center justify-center`}>
                      <action.icon size={11} className="text-white" />
                    </div>
                    {action.label}
                  </motion.button>
                ))}
              </div>

            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  /* ────────────────────── MESSAGES STATE ────────────────────── */
  return (
    <div className="flex h-full w-full" style={{ flex: '1 1 0%', minWidth: 0 }}>
      {chatHistoryPanel}
      <div className="flex flex-col h-full bg-white" style={{ flex: '1 1 0%', minWidth: 0 }}>
        {/* Top bar */}
        <div className="h-12 border-b border-canvas-border bg-canvas-elevated flex items-center justify-between px-4 shrink-0 z-10">
          <div className="flex items-center gap-2">
            <button onClick={toggleChatHistory} className={`p-1.5 rounded-md transition-colors cursor-pointer ${showChatHistory ? 'bg-primary/10 text-primary' : 'text-text-muted hover:text-text-secondary hover:bg-gray-50'}`}>
              <History size={16} />
            </button>
            <span className="text-sm font-medium text-text">Chat</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setMessages([]); setInput(''); setShowClarificationCard(false); setShowProgressiveLoader(false); setWorkflowBuildPhase(0); setCurrentWorkflowType(null); clearTimers(); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-light text-[12px] font-medium text-text-secondary hover:bg-white hover:border-primary/20 transition-all cursor-pointer"
            >
              <Plus size={12} />
              New Chat
            </button>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-primary/10 to-primary-medium/10 text-primary text-[12px] font-semibold">
              <Sparkles size={11} />
              AI Copilot
            </div>
          </div>
        </div>

        {/* Messages */}
        <div
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto"
        >
          <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
            <AnimatePresence initial={false}>
              {messages.map((msg, msgIdx) => (
                <motion.div key={msg.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className="max-w-[85%]">
                    {/* Single thinking trail per IRA message */}
                    {msg.role === 'assistant' && msg.thinking && msg.thinking.length > 0 && (
                      <ThinkingTrail
                        summary={
                          msg.richType === 'clarification' ? 'Identified ambiguity, asking for inputs' :
                          msg.richType === 'audit-loading' ? 'Running query through plan → SQL → sources → results' :
                          msg.richType === 'audit-result' ? 'Completed query — running through plan → SQL → sources → results' :
                          `Thought for ${msg.thinking.length} steps`
                        }
                        steps={msg.thinking}
                      />
                    )}

                    {/* Rich inline components */}
                    {msg.richType === 'clarification' ? (
                      <div className="max-w-[66ch]">
                        {(msg.richData as unknown as ClarificationData).status === 'submitted' ? (
                          <div className="text-[13px] text-ink-700 leading-relaxed">
                            Got it — running with these inputs.
                          </div>
                        ) : (
                          <div className="text-[15px] leading-[1.65] text-ink-800">
                            {(msg.richData as unknown as ClarificationData).intro}
                          </div>
                        )}
                      </div>
                    ) : msg.richType === 'audit-loading' ? (
                      <div className="max-w-[680px]">
                        {showProgressiveLoader && msg.id === auditRunMsgIdRef.current && (
                          <InlineAuditLoader
                            steps={LOADING_STEPS}
                            onTabSwitch={setActiveArtifactTab}
                            onComplete={handleProgressiveLoadingComplete}
                          />
                        )}
                      </div>
                    ) : msg.richType === 'audit-result' ? (
                      <div className="space-y-4 max-w-[680px]">
                        {/* Body text */}
                        {msg.text && (
                          <div className="text-[15px] leading-[1.65] text-ink-800 max-w-[66ch]">{msg.text}</div>
                        )}

                        {/* Affordance: link inline result to the auto-opened panel */}
                        <button
                          onClick={() => setShowArtifacts(true)}
                          className="inline-flex items-center gap-1.5 text-[12px] text-ink-500 hover:text-brand-700 transition-colors cursor-pointer"
                        >
                          <span>Plan, query, and sources are in the artifact panel</span>
                          <ArrowUpRight size={12} />
                        </button>

                        {/* KPI cards */}
                        <div className="grid grid-cols-4 gap-2">
                          {AUDIT_RESULT.kpis.map((kpi, ki) => (
                            <motion.div
                              key={kpi.label}
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: ki * 0.05 }}
                              className="rounded-xl border border-canvas-border bg-canvas-elevated p-3"
                            >
                              <div className={`text-[18px] font-semibold tabular-nums ${kpi.color}`}>{kpi.value}</div>
                              <div className="text-[12px] text-ink-500 mt-0.5">{kpi.label}</div>
                            </motion.div>
                          ))}
                        </div>

                        {/* Charts */}
                        <ChartGroup charts={AUDIT_RESULT.charts} />

                        {/* Table preview */}
                        <ResultsTable
                          columns={AUDIT_RESULT.table.columns}
                          rows={AUDIT_RESULT.table.rows}
                          totalRows={AUDIT_RESULT.table.totalRows}
                          onOpen={() => addToast({ type: 'info', message: 'Opening full results in a new view…' })}
                          onDownload={() => addToast({ type: 'success', message: 'CSV download started.' })}
                        />

                        {/* Actions dropdown */}
                        <div className="flex items-center gap-2">
                          <ActionsMenu onPick={handleAuditAction} />
                        </div>
                      </div>
                    ) : msg.richType === 'summary-kpi' ? (
                      <div className="ml-7 grid grid-cols-4 gap-2">
                        {((msg.richData?.kpis as { label: string; value: string; color: string }[] | undefined) || []).map((kpi, ki) => (
                          <motion.div key={kpi.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: ki * 0.1 }}
                            className="rounded-xl border border-canvas-border bg-canvas-elevated p-3 text-center"
                          >
                            <div className={`text-lg font-semibold tabular-nums ${kpi.color}`}>{kpi.value}</div>
                            <div className="text-[12px] text-ink-500 mt-0.5">{kpi.label}</div>
                          </motion.div>
                        ))}
                      </div>
                    ) : msg.richType === 'save-workflow-prompt' ? (
                      <div className="ml-12 mt-1">
                        <div className="glass-card rounded-xl p-4 border border-primary/10 max-w-md">
                          <div className="flex items-center gap-2 mb-2">
                            <Save size={13} className="text-primary" />
                            <span className="text-[12px] font-semibold text-text">Save Workflow</span>
                          </div>
                          <p className="text-[12px] text-text-muted mb-3">Ready to save this workflow to your library for recurring use?</p>
                          <div className="flex gap-2">
                            <SaveWorkflowButton />
                            <button className="px-3 py-2 text-[12px] font-medium text-text-muted hover:text-text-secondary hover:bg-surface-2 rounded-lg transition-colors cursor-pointer">
                              Continue editing
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : msg.text ? (
                      msg.role === 'user' ? (
                        <div className="px-4 py-3 rounded-2xl rounded-br-sm bg-brand-600 text-white text-[13.5px] leading-relaxed">
                          {msg.text}
                        </div>
                      ) : (
                        // Editorial: AI response is prose, not a bubble. No border, no shadow, no avatar gutter.
                        <div className="text-[15px] leading-[1.65] text-ink-800 max-w-[66ch]">
                          {msg.text}
                        </div>
                      )
                    ) : null}

                    {/* AI Recommended Follow-up Questions */}
                    {msg.role === 'assistant' && msg.followUps && msg.followUps.length > 0 && msgIdx === messages.length - 1 && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mt-3 ml-7"
                      >
                        <div className="flex items-center gap-1.5 mb-2">
                          <Lightbulb size={11} className="text-primary/50" />
                          <span className="text-[12px] font-semibold text-text-muted">Suggested follow-ups</span>
                        </div>
                        <div className="flex flex-col gap-2">
                          {msg.followUps.map((q, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -6 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.4 + i * 0.1 }}
                            >
                              <BorderGlow
                                borderRadius={12}
                                glowRadius={25}
                                glowIntensity={0.9}
                                coneSpread={25}
                                edgeSensitivity={30}
                                backgroundColor="#ffffff"
                                colors={['#6a12cd', '#9b59d6', '#c084fc']}
                              >
                                <div
                                  className="flex items-center gap-2.5 px-3.5 py-2.5 cursor-pointer group rounded-xl"
                                  onClick={() => handleFollowUpClick(q)}
                                >
                                  <div className="w-5 h-5 rounded-md bg-primary/5 flex items-center justify-center shrink-0">
                                    <ArrowRight size={11} className="text-primary/50 group-hover:text-primary transition-colors" />
                                  </div>
                                  <span className="text-[12px] text-text-secondary group-hover:text-text transition-colors">{q}</span>
                                </div>
                              </BorderGlow>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Thinking animation */}
            {isTyping && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
                <div className="max-w-[85%]">
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 mt-0.5">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-medium flex items-center justify-center shadow-sm-infinite">
                        <Sparkles size={14} className="text-white" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 pt-1">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[12px] font-semibold text-primary">Auditify Copilot</span>
                        <span className="text-[12px] text-text-muted">is thinking...</span>
                      </div>

                      {thinkingSteps.length > 0 && (
                        <div className="mb-2">
                          <div className="pl-3 border-l-2 border-primary/20 space-y-1">
                            {thinkingSteps.map((step, i) => (
                              <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="text-[12px] text-text-muted flex items-center gap-1.5">
                                <div className={`w-1.5 h-1.5 rounded-full ${i === thinkingSteps.length - 1 ? 'bg-primary' : 'bg-primary/30'}`} />
                                {step}
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}

                      {thinkingSteps.length === 0 && (
                        <div className="inline-flex items-center gap-1.5 px-1 py-2">
                          <div className="flex gap-1.5 items-center h-5">
                            <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} className="w-1.5 h-1.5 rounded-full bg-brand-400" />
                            <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }} className="w-1.5 h-1.5 rounded-full bg-brand-400" />
                            <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }} className="w-1.5 h-1.5 rounded-full bg-brand-400" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Inline rich messages render the loader + clarification — no global panel */}
        </div>

        {/* Input area */}
        <div className="shrink-0 px-4 sm:px-6 pb-5 max-w-3xl mx-auto w-full">
          {/* Workflow clarification (legacy ClarificationCard kept for the workflow flow only) */}
          <AnimatePresence>
            {showClarificationCard && workflowBuildPhase > 0 && (
              <div className="mb-0">
                <ClarificationCard
                  questions={clarificationQuestions}
                  onComplete={handleClarificationCardComplete}
                  onSkipAll={() => {
                    setShowClarificationCard(false);
                    handleWorkflowClarificationComplete({});
                  }}
                />
              </div>
            )}
          </AnimatePresence>

          {openClarification ? (
            // Audit-query clarification — docked picker replaces the chat input until submitted/dismissed
            <ClarificationBlock
              data={openClarification.richData as unknown as ClarificationData}
              onAnswer={(qi, ans) => updateClarificationAnswer(openClarification.id, qi, ans)}
              onSubmit={() => submitClarification(openClarification.id)}
              onSkipAll={() => submitClarification(openClarification.id, true)}
              onSkipCurrent={(qi) => skipClarificationQuestion(openClarification.id, qi)}
            />
          ) : (
            <>
              {files.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {files.map((f, i) => (
                    <div key={i} className="flex items-center gap-1 bg-primary-light text-primary text-[12px] px-2 py-1 rounded-md font-medium">
                      <FileText size={11} />
                      <span className="truncate max-w-[100px]">{f.name}</span>
                      <button onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))} className="hover:text-primary-hover ml-0.5 cursor-pointer"><X size={10} /></button>
                    </div>
                  ))}
                </div>
              )}
              <div className="ai-border">
                <div className="relative bg-white rounded-[18px]">
                  <textarea
                    value={input}
                    onChange={e => { setInput(e.target.value); handleTextareaInput(); }}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask anything or describe a workflow to build..."
                    className="w-full bg-transparent border-none outline-none resize-none py-4 pl-4 pr-28 text-[13.5px] text-text placeholder:text-text-muted min-h-[48px] max-h-[160px] rounded-[18px]"
                    rows={1}
                  />
                  <div className="absolute right-2 bottom-2 flex items-center gap-1">
                    <label className="cursor-pointer p-2 text-text-muted hover:text-primary hover:bg-primary-xlight rounded-lg transition-colors">
                      <Paperclip size={15} />
                      <input type="file" multiple className="hidden" onChange={handleFileUpload} />
                    </label>
                    <button onClick={handleSend} disabled={!input.trim() && files.length === 0} className="p-2 bg-gradient-to-r from-primary to-primary-medium hover:from-primary-hover hover:to-primary disabled:from-gray-200 disabled:to-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white rounded-xl transition-all cursor-pointer">
                      <Send size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
