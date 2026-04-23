import { useState } from 'react';
import {
  ListChecks,
  Table2,
  FileOutput,
  Check,
  ShieldCheck,
  ChevronRight,
  SlidersHorizontal,
  BookOpenText,
  DollarSign,
  CalendarDays,
  Type as TypeIcon,
  Lightbulb,
  Plus,
  X,
} from 'lucide-react';
import type { WorkflowDraft, ToleranceRule, InputNote } from './types';

type Tab = 'plan' | 'input' | 'output';

interface MappedRisk {
  id: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Mapped' | 'Gap';
  title: string;
  process: string;
  evidence: string;
  controlsCount: number;
}

const SEVERITY_COLORS: Record<MappedRisk['severity'], string> = {
  Critical: 'text-risk bg-risk-50',
  High: 'text-high bg-high-50',
  Medium: 'text-mitigated bg-mitigated-50',
  Low: 'text-compliant bg-compliant-50',
};

const MAPPED_RISKS: MappedRisk[] = [
  {
    id: 'R-AP-001',
    severity: 'High',
    status: 'Mapped',
    title: 'Duplicate invoice payments resulting in financial leakage',
    process: 'Accounts Payable',
    evidence: 'E O',
    controlsCount: 2,
  },
  {
    id: 'R-AP-002',
    severity: 'Critical',
    status: 'Mapped',
    title: 'Payments to unapproved or fictitious vendors',
    process: 'Accounts Payable',
    evidence: 'E',
    controlsCount: 3,
  },
  {
    id: 'R-AP-003',
    severity: 'Medium',
    status: 'Mapped',
    title: 'GL coding deviation from policy matrix',
    process: 'General Ledger',
    evidence: 'O',
    controlsCount: 1,
  },
  {
    id: 'R-AP-004',
    severity: 'Medium',
    status: 'Gap',
    title: 'Segregation-of-duties breach on invoice posting',
    process: 'Accounts Payable',
    evidence: '—',
    controlsCount: 0,
  },
];

interface Props {
  workflow: WorkflowDraft | null;
}

export default function PlanPanel({ workflow }: Props) {
  const [tab, setTab] = useState<Tab>('plan');

  return (
    <aside className="flex flex-col h-full bg-canvas-elevated border-l border-canvas-border min-h-0">
      {/* Tabs */}
      <div className="h-14 border-b border-canvas-border flex items-end px-2 shrink-0">
        {(
          [
            { key: 'plan', label: 'Plan', icon: ListChecks },
            { key: 'input', label: 'Input Config', icon: Table2 },
            { key: 'output', label: 'Output Config', icon: FileOutput },
          ] as { key: Tab; label: string; icon: typeof ListChecks }[]
        ).map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={[
                'inline-flex items-center gap-1.5 text-[12px] font-semibold px-2.5 pb-2.5 -mb-px border-b-2 transition-colors cursor-pointer',
                active
                  ? 'text-brand-700 border-brand-600'
                  : 'text-ink-400 border-transparent hover:text-ink-600',
              ].join(' ')}
            >
              <t.icon size={13} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto min-h-0 p-3 space-y-3 bg-canvas">
        {tab === 'plan' && (
          <>
            <PlanSection workflow={workflow} />
            <RACMSection />
          </>
        )}
        {tab === 'input' && <InputConfigSection workflow={workflow} />}
        {tab === 'output' && <OutputConfigSection workflow={workflow} />}
      </div>
    </aside>
  );
}

function PlanSection({ workflow }: { workflow: WorkflowDraft | null }) {
  if (!workflow) {
    return (
      <div className="rounded-xl border border-canvas-border bg-canvas-elevated p-4">
        <p className="text-[11.5px] text-ink-400">
          The execution plan appears once you generate a workflow.
        </p>
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-canvas-border bg-canvas-elevated p-4">
      <div className="text-[10px] font-bold uppercase tracking-wider text-ink-400 mb-3">
        Query Execution Plan
      </div>
      <ol className="space-y-3">
        {workflow.steps.map((s, idx) => (
          <li key={s.id} className="flex items-start gap-3">
            <div className="flex flex-col items-center shrink-0">
              <div className="w-6 h-6 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center text-[11px] font-bold">
                {idx + 1}
              </div>
              {idx < workflow.steps.length - 1 && (
                <div className="w-px flex-1 min-h-[16px] bg-canvas-border mt-1" />
              )}
            </div>
            <div className="min-w-0 pb-1">
              <div className="text-[12px] font-semibold text-ink-800 truncate">{s.name}</div>
              <div className="text-[11px] text-ink-400 leading-relaxed">{s.description}</div>
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-3 rounded-lg border border-compliant/40 bg-compliant-50 p-2.5 flex items-start gap-2">
        <div className="w-5 h-5 rounded-full bg-compliant text-white flex items-center justify-center shrink-0 mt-0.5">
          <Check size={11} />
        </div>
        <div className="min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-wider text-compliant-700">
            {workflow.output.type === 'flags'
              ? 'Flags Output'
              : workflow.output.type === 'table'
                ? 'Table Output'
                : 'Summary Output'}
          </div>
          <div className="text-[12px] font-semibold text-ink-800 leading-tight">
            {workflow.output.title}
          </div>
        </div>
      </div>
    </div>
  );
}

function RACMSection() {
  const mapped = MAPPED_RISKS.filter((r) => r.status === 'Mapped').length;
  const total = MAPPED_RISKS.length;
  const coverage = Math.round((mapped / total) * 100);
  return (
    <div className="rounded-xl border border-canvas-border bg-canvas-elevated p-4">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-7 h-7 rounded-lg bg-brand-50 flex items-center justify-center">
          <ShieldCheck size={14} className="text-brand-600" />
        </div>
        <div>
          <div className="text-[12px] font-semibold text-ink-800 leading-tight">
            Risk &amp; Control Matrix
          </div>
          <div className="text-[10.5px] text-ink-400">
            {MAPPED_RISKS.length} risks · {MAPPED_RISKS.reduce((n, r) => n + r.controlsCount, 0)}{' '}
            controls
          </div>
        </div>
      </div>

      <div className="mt-3 mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-ink-400">
            Control Coverage
          </span>
          <span className="text-[10.5px] font-semibold text-ink-600">
            {mapped}/{total}
            {total - mapped > 0 && (
              <span className="ml-1 text-mitigated-700">
                {total - mapped} gap{total - mapped === 1 ? '' : 's'}
              </span>
            )}
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-canvas-border overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-500 to-compliant rounded-full"
            style={{ width: `${coverage}%` }}
          />
        </div>
      </div>

      <div className="text-[10px] font-bold uppercase tracking-wider text-ink-400 mb-2">
        Mapped Risks
      </div>
      <ul className="space-y-2">
        {MAPPED_RISKS.map((r) => (
          <li
            key={r.id}
            className="rounded-lg border border-canvas-border bg-canvas p-2.5 hover:border-brand-300 transition-colors"
          >
            <div className="flex items-center gap-2 mb-1">
              <ChevronRight size={11} className="text-ink-400 shrink-0" />
              <span className="text-[11px] font-semibold text-ink-800">{r.id}</span>
              <span
                className={`text-[9.5px] uppercase tracking-wider font-bold rounded-full px-1.5 py-0.5 ${SEVERITY_COLORS[r.severity]}`}
              >
                {r.severity}
              </span>
              <span
                className={[
                  'text-[9.5px] uppercase tracking-wider font-bold rounded-full px-1.5 py-0.5',
                  r.status === 'Mapped'
                    ? 'text-evidence bg-evidence-50'
                    : 'text-mitigated bg-mitigated-50',
                ].join(' ')}
              >
                {r.status}
              </span>
            </div>
            <div className="text-[11px] text-ink-700 leading-snug mb-1">{r.title}</div>
            <div className="flex items-center gap-2 text-[10px] text-ink-400">
              <span>{r.process}</span>
              <span>·</span>
              <span className="font-mono">{r.evidence}</span>
              <span>·</span>
              <span>{r.controlsCount} controls</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

const SEVERITY_BADGE: Record<ToleranceRule['severity'], string> = {
  Strict: 'bg-risk-50 text-risk-700',
  Moderate: 'bg-mitigated-50 text-mitigated-700',
  Relaxed: 'bg-compliant-50 text-compliant-700',
};

const DEFAULT_TOLERANCE_RULES: ToleranceRule[] = [
  { id: 'amount', label: 'Amount', description: '±5%', severity: 'Moderate', enabled: false },
  { id: 'date', label: 'Date', description: '±3 calendar days', severity: 'Moderate', enabled: false },
  { id: 'text', label: 'Text similarity', description: '≥80% fuzzy match', severity: 'Moderate', enabled: false },
];

const TOLERANCE_ICON: Record<ToleranceRule['id'], typeof DollarSign> = {
  amount: DollarSign,
  date: CalendarDays,
  text: TypeIcon,
};

const DEFAULT_NOTES: InputNote[] = [
  {
    id: 'n1',
    name: 'Rate Card Reference',
    description: 'Standard rate card with approved vendor pricing tiers',
    aiSuggested: true,
    enabled: true,
  },
  {
    id: 'n2',
    name: 'Audit Policy Guide',
    description: 'Internal audit thresholds and escalation criteria',
    aiSuggested: true,
    enabled: false,
  },
];

const DEFAULT_AI_SUGGESTIONS = [
  'Historical benchmark data for trend comparison',
  'Approval matrix for authority validation',
];

let _noteIdCounter = 1000;
function nextNoteId(): string {
  return `n-${++_noteIdCounter}`;
}

function InputConfigSection({ workflow }: { workflow: WorkflowDraft | null }) {
  const [rules, setRules] = useState<ToleranceRule[]>(DEFAULT_TOLERANCE_RULES);
  const [notes, setNotes] = useState<InputNote[]>(DEFAULT_NOTES);
  const [suggestions, setSuggestions] = useState<string[]>(DEFAULT_AI_SUGGESTIONS);
  const [addingNote, setAddingNote] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const toggleRule = (id: ToleranceRule['id']) =>
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)));

  const toggleNote = (id: string) =>
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, enabled: !n.enabled } : n)));

  const activeRuleCount = rules.filter((r) => r.enabled).length;

  const acceptSuggestion = (idx: number) => {
    const text = suggestions[idx];
    const id = nextNoteId();
    setNotes((prev) => [
      ...prev,
      { id, name: text, description: 'AI-suggested reference note', aiSuggested: true, enabled: true },
    ]);
    setSuggestions((prev) => prev.filter((_, i) => i !== idx));
  };

  const addNote = () => {
    if (!newName.trim()) return;
    const id = nextNoteId();
    setNotes((prev) => [
      ...prev,
      {
        id,
        name: newName.trim(),
        description: newDesc.trim() || 'User note',
        aiSuggested: false,
        enabled: true,
      },
    ]);
    setNewName('');
    setNewDesc('');
    setAddingNote(false);
  };

  return (
    <div className="space-y-3">
      {/* Tolerance rules */}
      <div className="rounded-xl border border-canvas-border bg-canvas-elevated">
        <div className="flex items-center gap-2 px-3 py-2.5 border-b border-canvas-border">
          <SlidersHorizontal size={13} className="text-ink-400" />
          <span className="text-[12px] font-semibold text-ink-700 flex-1">
            Tolerance rules
          </span>
          <span className="text-[10.5px] font-semibold text-ink-400">
            {activeRuleCount} active
          </span>
        </div>
        <div className="p-2 space-y-1.5">
          {rules.map((r) => {
            const Icon = TOLERANCE_ICON[r.id];
            return (
              <div
                key={r.id}
                className={`rounded-lg transition-opacity ${r.enabled ? '' : 'opacity-55'} flex items-center gap-2.5 px-2.5 py-2 hover:bg-brand-50/40`}
              >
                <div className="w-7 h-7 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                  <Icon size={12} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-semibold text-ink-800">{r.label}</div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10.5px] text-ink-400">{r.description}</span>
                    <span
                      className={`text-[9.5px] font-bold uppercase tracking-wider rounded px-1.5 py-0.5 ${SEVERITY_BADGE[r.severity]}`}
                    >
                      {r.severity}
                    </span>
                  </div>
                </div>
                <Toggle enabled={r.enabled} onToggle={() => toggleRule(r.id)} />
              </div>
            );
          })}
        </div>
        <button
          type="button"
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-[11.5px] font-semibold text-ink-400 hover:text-brand-700 hover:bg-brand-50/40 border-t border-dashed border-canvas-border transition-colors cursor-pointer"
        >
          <Plus size={12} />
          Add tolerance parameter
        </button>
      </div>

      {/* Notes */}
      <div className="rounded-xl border border-canvas-border bg-canvas-elevated">
        <div className="flex items-center gap-2 px-3 py-2.5 border-b border-canvas-border">
          <BookOpenText size={13} className="text-ink-400" />
          <span className="text-[12px] font-semibold text-ink-700 flex-1">Notes</span>
          <span className="text-[10.5px] font-semibold text-ink-400">
            {notes.length} ref{notes.length === 1 ? '' : 's'}
          </span>
        </div>

        <div className="p-2 space-y-2">
          {notes.map((n) => (
            <div
              key={n.id}
              className={`rounded-lg border p-2.5 transition-colors ${
                n.enabled
                  ? 'border-brand-200 bg-brand-50/20'
                  : 'border-canvas-border bg-canvas'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
                    n.enabled
                      ? 'bg-brand-50 border-brand-200 text-brand-600'
                      : 'bg-white border-canvas-border text-ink-400'
                  }`}
                >
                  <BookOpenText size={12} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[12px] font-semibold text-ink-800 truncate">
                      {n.name}
                    </span>
                    {n.aiSuggested && (
                      <span className="text-[9.5px] font-bold leading-none bg-brand-50 text-brand-700 border border-brand-200 rounded px-1 py-0.5">
                        AI
                      </span>
                    )}
                  </div>
                  <p className="text-[10.5px] text-ink-400 mt-0.5 leading-relaxed">
                    {n.description}
                  </p>
                </div>
                <Toggle enabled={n.enabled} onToggle={() => toggleNote(n.id)} />
              </div>
            </div>
          ))}

          {suggestions.length > 0 && (
            <div className="rounded-lg border border-brand-200 bg-brand-50/40 p-2.5">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Lightbulb size={11} className="text-brand-600" />
                <span className="text-[10.5px] font-bold text-brand-700 uppercase tracking-wider">
                  AI Suggestions
                </span>
              </div>
              <div className="space-y-1.5">
                {suggestions.map((s, i) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => acceptSuggestion(i)}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md bg-white/70 border border-brand-100 hover:bg-white hover:border-brand-300 transition-colors cursor-pointer group"
                  >
                    <Plus size={11} className="text-brand-400 group-hover:text-brand-700" />
                    <span className="text-[11.5px] text-brand-700 text-left flex-1">{s}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {addingNote ? (
            <div className="rounded-lg border border-brand-200 bg-brand-50/20 p-2.5 space-y-1.5">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Note title"
                autoFocus
                className="w-full rounded-md border border-canvas-border bg-canvas-elevated px-2 py-1.5 text-[12px] font-semibold text-ink-800 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600/30 transition-all"
              />
              <input
                type="text"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Short description (optional)"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') addNote();
                  if (e.key === 'Escape') {
                    setAddingNote(false);
                    setNewName('');
                    setNewDesc('');
                  }
                }}
                className="w-full rounded-md border border-canvas-border bg-canvas-elevated px-2 py-1.5 text-[11.5px] text-ink-600 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600/30 transition-all"
              />
              <div className="flex items-center gap-1.5 pt-0.5">
                <button
                  type="button"
                  onClick={addNote}
                  disabled={!newName.trim()}
                  className={`inline-flex items-center gap-1 rounded-md text-[11px] font-semibold px-2 py-1 transition-colors ${
                    newName.trim()
                      ? 'bg-brand-600 hover:bg-brand-500 text-white cursor-pointer'
                      : 'bg-brand-100 text-brand-300 cursor-not-allowed'
                  }`}
                >
                  <Check size={10} />
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAddingNote(false);
                    setNewName('');
                    setNewDesc('');
                  }}
                  className="inline-flex items-center gap-1 rounded-md text-[11px] font-semibold px-2 py-1 text-ink-500 hover:bg-canvas transition-colors cursor-pointer"
                >
                  <X size={10} />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAddingNote(true)}
              className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-canvas-border bg-canvas hover:border-brand-300 hover:text-brand-700 text-ink-400 text-[11.5px] font-semibold px-3 py-2 transition-colors cursor-pointer"
            >
              <Plus size={12} />
              Add Note
            </button>
          )}
        </div>
      </div>

      {/* Context: which workflow */}
      {workflow && (
        <div className="text-center text-[10px] uppercase tracking-wider text-ink-400 font-semibold">
          For {workflow.name}
        </div>
      )}
    </div>
  );
}

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={[
        'relative w-8 h-[18px] rounded-full transition-colors shrink-0 cursor-pointer',
        enabled ? 'bg-brand-600' : 'bg-canvas-border',
      ].join(' ')}
      aria-pressed={enabled}
    >
      <span
        className={[
          'absolute top-[2px] w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform',
          enabled ? 'translate-x-[16px]' : 'translate-x-[2px]',
        ].join(' ')}
      />
    </button>
  );
}

function OutputConfigSection({ workflow }: { workflow: WorkflowDraft | null }) {
  if (!workflow) return <PlanSection workflow={null} />;
  return (
    <div className="rounded-xl border border-canvas-border bg-canvas-elevated p-4">
      <div className="text-[10px] font-bold uppercase tracking-wider text-ink-400 mb-3">
        Output Configuration
      </div>
      <div className="rounded-lg border border-compliant/40 bg-compliant-50 p-3">
        <div className="text-[10px] font-bold uppercase tracking-wider text-compliant-700 mb-1">
          {workflow.output.type} output
        </div>
        <div className="text-[12px] font-semibold text-ink-800 leading-tight mb-1">
          {workflow.output.title}
        </div>
        <p className="text-[11px] text-ink-600 leading-relaxed">{workflow.output.description}</p>
      </div>
    </div>
  );
}
