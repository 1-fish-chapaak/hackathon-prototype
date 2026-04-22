import { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'motion/react';
import {
  Check, X, Calendar, ChevronDown, GripVertical, Sparkles,
  Workflow as WorkflowIcon, ShieldAlert, ClipboardCheck,
  ArrowRight, Plus,
} from 'lucide-react';
import type { View } from '../../hooks/useAppState';
import { RISKS, CONTROLS, ENGAGEMENTS, ENGAGEMENT_CONTROLS, DEFICIENCIES, WORKFLOWS } from '../../data/mockData';
import { SeverityBadge } from '../shared/StatusBadge';

interface Props {
  setView: (v: View) => void;
}

// ─── Onboarding checklist ────────────────────────────────────────────────────

interface OnboardingStep {
  id: string;
  label: string;
  cta: string;
  go: View;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  { id: 'team',       label: 'Invite your team',         cta: 'Open Users',   go: 'admin-users' },
  { id: 'data',       label: 'Connect a data source',    cta: 'Connect',      go: 'data-sources' },
  { id: 'workflow',   label: 'Run your first workflow',  cta: 'Open library', go: 'workflow-templates' },
  { id: 'engagement', label: 'Create a test engagement', cta: 'Start',        go: 'audit-execution' },
  { id: 'report',     label: 'Export your first report', cta: 'Open builder', go: 'reports' },
];

const ONBOARDING_KEY = 'home.onboarding.v1';
const ORDER_KEY      = 'home.section-order.v1';

function QuickActionPanel({ setView, onDismiss }: { setView: Props['setView']; onDismiss: () => void }) {
  const [done, setDone] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem(ONBOARDING_KEY) || '[]')); }
    catch { return new Set(); }
  });

  useEffect(() => {
    localStorage.setItem(ONBOARDING_KEY, JSON.stringify(Array.from(done)));
  }, [done]);

  const total = ONBOARDING_STEPS.length;
  const completed = done.size;
  const pct = Math.round((completed / total) * 100);

  const toggle = (id: string) => {
    setDone(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <section className="rounded-xl border border-canvas-border bg-canvas-elevated p-6">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-md bg-brand-50 flex items-center justify-center shrink-0">
            <Sparkles size={16} className="text-brand-700" />
          </div>
          <div>
            <div className="font-display text-[20px] font-[420] text-ink-900 leading-tight">
              Welcome, Administrator <span className="font-mono font-normal text-[12px] text-ink-500 ml-1">— {completed}/{total} done</span>
            </div>
            <p className="text-[13px] text-ink-500 mt-0.5">Get your workspace set up in a few quick steps.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-[11px] font-mono text-ink-500 tabular-nums">{pct}%</div>
          <div className="w-32 h-1.5 rounded-full bg-canvas-border overflow-hidden">
            <div
              className="h-full bg-brand-600 transition-[width] duration-300 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
          <button
            onClick={onDismiss}
            className="text-ink-400 hover:text-ink-700 transition-colors p-1 rounded-md cursor-pointer"
            aria-label="Dismiss onboarding"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <ul className="divide-y divide-canvas-border">
        {ONBOARDING_STEPS.map(step => {
          const isDone = done.has(step.id);
          return (
            <li key={step.id} className="flex items-center gap-3 py-3">
              <button
                onClick={() => toggle(step.id)}
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                  isDone
                    ? 'bg-compliant border-compliant text-white'
                    : 'border-canvas-border hover:border-brand-300'
                }`}
                aria-label={isDone ? 'Mark incomplete' : 'Mark complete'}
              >
                {isDone && <Check size={12} strokeWidth={3} />}
              </button>
              <span className={`flex-1 text-[14px] ${isDone ? 'text-ink-400 line-through' : 'text-ink-800'}`}>
                {step.label}
              </span>
              <button
                onClick={() => setView(step.go)}
                className="flex items-center gap-1 text-[13px] font-semibold text-brand-700 hover:text-brand-600 transition-colors cursor-pointer"
              >
                {step.cta}
                <ArrowRight size={13} />
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

// ─── Work Queue ──────────────────────────────────────────────────────────────

type QueueType = 'workflow' | 'approval' | 'task';

interface QueueItem {
  id: string;
  type: QueueType;
  item: string;
  context: string;
  risk: 'critical' | 'high' | 'medium' | 'low';
  due: string;            // human-readable
  dueDate: Date;
  action: { label: string; go: View };
}

function buildWorkQueue(): QueueItem[] {
  const today = new Date('2026-04-23');
  const days = (n: number) => { const d = new Date(today); d.setDate(d.getDate() + n); return d; };
  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  // Workflows that haven't been run recently — flag a few as "pending to run".
  const pendingWfs = WORKFLOWS.slice(0, 3).map((wf, i): QueueItem => ({
    id: `q-wf-${wf.id}`,
    type: 'workflow',
    item: wf.name,
    context: `${wf.type} · ${wf.runs} prior runs`,
    risk: i === 0 ? 'critical' : i === 1 ? 'high' : 'medium',
    due: fmt(days(i === 0 ? -1 : i + 1)),
    dueDate: days(i === 0 ? -1 : i + 1),
    action: { label: 'Run', go: 'workflow-templates' },
  }));

  // Deficiency approvals.
  const approvals = DEFICIENCIES.filter(d => d.status !== 'resolved').map((d): QueueItem => ({
    id: `q-app-${d.id}`,
    type: 'approval',
    item: d.finding.length > 60 ? d.finding.slice(0, 57) + '…' : d.finding,
    context: `Deficiency · ${d.assignee}`,
    risk: d.severity === 'MW' ? 'critical' : d.severity === 'SD' ? 'high' : 'medium',
    due: d.due,
    dueDate: new Date(d.due),
    action: { label: 'Open', go: 'findings' },
  }));

  // Engagement control tasks (those not started).
  const tasks = ENGAGEMENT_CONTROLS
    .filter(c => c.oe === 'not-started' || c.de === 'not-started')
    .slice(0, 3)
    .map((c, i): QueueItem => ({
      id: `q-tk-${c.id}`,
      type: 'task',
      item: `Test ${c.control}`,
      context: `${c.racm} · ${c.assignee}`,
      risk: c.isKey ? 'high' : 'medium',
      due: fmt(days(i + 5)),
      dueDate: days(i + 5),
      action: { label: 'Open', go: 'execution-testing' },
    }));

  return [...pendingWfs, ...approvals, ...tasks].sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
}

const TYPE_META: Record<QueueType, { label: string; icon: React.ElementType }> = {
  workflow: { label: 'Workflow',  icon: WorkflowIcon },
  approval: { label: 'Approval',  icon: ShieldAlert },
  task:     { label: 'Task',      icon: ClipboardCheck },
};

function WorkQueueSection({ setView }: { setView: Props['setView'] }) {
  const items = useMemo(buildWorkQueue, []);
  const today = new Date('2026-04-23');

  return (
    <div>
      <div className="flex items-end justify-between mb-3">
        <div>
          <div className="font-mono text-[11px] text-ink-500 tracking-tight tabular-nums">Work queue</div>
          <h2 className="font-display text-[24px] font-[420] text-ink-900 leading-tight">{items.length} items waiting on you</h2>
        </div>
        <button
          onClick={() => setView('workflow-templates')}
          className="text-[13px] font-semibold text-brand-700 hover:text-brand-600 transition-colors cursor-pointer"
        >
          View all →
        </button>
      </div>

      <div className="rounded-xl border border-canvas-border bg-canvas-elevated overflow-hidden">
        <table className="w-full text-[13px] tabular-nums">
          <thead>
            <tr className="border-b border-canvas-border bg-paper-50/40">
              <th className="text-left font-semibold text-ink-500 px-4 h-10 w-[110px]">Type</th>
              <th className="text-left font-semibold text-ink-500 px-2 h-10">Item</th>
              <th className="text-left font-semibold text-ink-500 px-2 h-10 w-[110px]">Risk</th>
              <th className="text-left font-semibold text-ink-500 px-2 h-10 w-[110px]">Due</th>
              <th className="text-right font-semibold text-ink-500 px-4 h-10 w-[90px]">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, idx) => {
              const Icon = TYPE_META[it.type].icon;
              const overdue = it.dueDate < today;
              return (
                <tr
                  key={it.id}
                  className={`h-12 ${idx > 0 ? 'border-t border-canvas-border' : ''} hover:bg-brand-50/40 transition-colors`}
                >
                  <td className="px-4">
                    <span className="inline-flex items-center gap-1.5 text-[12px] text-ink-700 font-medium">
                      <Icon size={13} className="text-ink-500" />
                      {TYPE_META[it.type].label}
                    </span>
                  </td>
                  <td className="px-2">
                    <div className="text-ink-900">{it.item}</div>
                    <div className="text-[11px] text-ink-500 mt-0.5">{it.context}</div>
                  </td>
                  <td className="px-2">
                    <SeverityBadge severity={it.risk} />
                  </td>
                  <td className="px-2">
                    <span className={`inline-flex items-center gap-1 ${overdue ? 'text-risk-700 font-medium' : 'text-ink-700'}`}>
                      <Calendar size={12} />
                      {it.due}
                    </span>
                  </td>
                  <td className="px-4 text-right">
                    <button
                      onClick={() => setView(it.action.go)}
                      className="inline-flex items-center gap-1 text-[12px] font-semibold text-brand-700 hover:text-brand-600 transition-colors cursor-pointer"
                    >
                      {it.action.label}
                      <ArrowRight size={12} />
                    </button>
                  </td>
                </tr>
              );
            })}
            {items.length === 0 && (
              <tr><td colSpan={5} className="text-center text-ink-500 py-8">Nothing waiting on you. Nice.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Health Dashboard ────────────────────────────────────────────────────────

function PieDonut({ value, total, size = 120 }: { value: number; total: number; size?: number }) {
  const r = (size - 14) / 2;
  const circ = 2 * Math.PI * r;
  const pct = total > 0 ? value / total : 0;
  const dash = pct * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-label="planned vs executed">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-canvas-border)" strokeWidth="10" />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="var(--color-brand-600)" strokeWidth="10"
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeDashoffset={circ / 4}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle"
        className="font-display tabular-nums" style={{ fontSize: 22, fill: 'var(--color-ink-900)' }}>
        {Math.round(pct * 100)}%
      </text>
    </svg>
  );
}

function HealthDashboardSection() {
  const active = ENGAGEMENTS.filter(e => e.status === 'active');
  const planned   = active.reduce((s, e) => s + e.controls, 0);
  const executed  = active.reduce((s, e) => s + e.tested, 0);
  const completionPct = planned > 0 ? Math.round((executed / planned) * 100) : 0;

  const riskTotal   = RISKS.length;
  const riskFailed  = RISKS.filter(r => r.status === 'open' && (r.severity === 'critical' || r.severity === 'high')).length;
  const riskHealthy = RISKS.filter(r => r.status === 'mitigated').length;

  const ctlTotal   = CONTROLS.length;
  const ctlPending = CONTROLS.filter(c => c.status === 'not-tested').length;
  const ctlOverdue = CONTROLS.filter(c => c.status === 'ineffective').length;

  return (
    <div>
      <div className="flex items-end justify-between mb-3">
        <div>
          <div className="font-mono text-[11px] text-ink-500 tracking-tight tabular-nums">Health · {active.length} active engagement{active.length === 1 ? '' : 's'}</div>
          <h2 className="font-display text-[24px] font-[420] text-ink-900 leading-tight">Audit health at a glance</h2>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Completion + Pie */}
        <div className="col-span-6 rounded-xl border border-canvas-border bg-canvas-elevated p-5">
          <div className="text-[11px] font-mono text-ink-500 tabular-nums mb-2">Engagement completion</div>
          <div className="flex items-center gap-6">
            <div>
              <div className="font-display text-[44px] font-[420] tabular-nums text-ink-900 leading-none">{completionPct}%</div>
              <div className="text-[12px] text-ink-500 mt-2">
                <span className="text-ink-800 font-medium tabular-nums">{executed}</span> of <span className="text-ink-800 font-medium tabular-nums">{planned}</span> controls executed
              </div>
              <div className="text-[12px] text-ink-500 mt-0.5">across {active.length} active engagement{active.length === 1 ? '' : 's'}</div>
            </div>
            <div className="ml-auto">
              <PieDonut value={executed} total={planned} />
            </div>
          </div>
        </div>

        {/* Risk overview */}
        <div className="col-span-3 rounded-xl border border-canvas-border bg-canvas-elevated p-5">
          <div className="text-[11px] font-mono text-ink-500 tabular-nums mb-3">Risk overview</div>
          <div className="font-display text-[36px] font-[420] tabular-nums text-ink-900 leading-none">{riskTotal}</div>
          <div className="text-[12px] text-ink-500 mt-2">total risks tracked</div>
          <div className="mt-4 space-y-2 pt-4 border-t border-canvas-border">
            <div className="flex items-baseline justify-between">
              <span className="text-[12px] text-ink-500">Failed</span>
              <span className="font-display text-[20px] font-[420] tabular-nums text-risk-700">{riskFailed}</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-[12px] text-ink-500">Healthy</span>
              <span className="font-display text-[20px] font-[420] tabular-nums text-compliant-700">{riskHealthy}</span>
            </div>
          </div>
        </div>

        {/* Controls overview */}
        <div className="col-span-3 rounded-xl border border-canvas-border bg-canvas-elevated p-5">
          <div className="text-[11px] font-mono text-ink-500 tabular-nums mb-3">Controls overview</div>
          <div className="font-display text-[36px] font-[420] tabular-nums text-ink-900 leading-none">{ctlTotal}</div>
          <div className="text-[12px] text-ink-500 mt-2">total controls in library</div>
          <div className="mt-4 space-y-2 pt-4 border-t border-canvas-border">
            <div className="flex items-baseline justify-between">
              <span className="text-[12px] text-ink-500">Pending</span>
              <span className="font-display text-[20px] font-[420] tabular-nums text-mitigated-700">{ctlPending}</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-[12px] text-ink-500">Overdue</span>
              <span className="font-display text-[20px] font-[420] tabular-nums text-risk-700">{ctlOverdue}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Draggable section wrapper ───────────────────────────────────────────────

type SectionKey = 'queue' | 'health';

function DraggableSection({
  index, dragKey, isDraggedOver, onDragStart, onDragOver, onDragLeave, onDrop, children,
}: {
  index: number;
  dragKey: SectionKey;
  isDraggedOver: boolean;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver:  (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop:      (e: React.DragEvent) => void;
  children: React.ReactNode;
}) {
  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`group relative rounded-2xl transition-colors ${isDraggedOver ? 'ring-2 ring-brand-300 ring-offset-4 ring-offset-canvas' : ''}`}
      data-section={dragKey}
      data-index={index}
    >
      <div
        draggable
        onDragStart={onDragStart}
        className="absolute -left-7 top-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing text-ink-400 hover:text-ink-700"
        aria-label="Drag to reorder section"
        title="Drag to reorder"
      >
        <GripVertical size={18} />
      </div>
      {children}
    </div>
  );
}

// ─── HomeView ────────────────────────────────────────────────────────────────

const PERIODS = ['This Quarter', 'Last Quarter', 'Custom'] as const;
type Period = typeof PERIODS[number];

const ONBOARDING_DISMISSED_KEY = 'home.onboarding-dismissed.v1';

export default function HomeView({ setView }: Props) {
  const [period, setPeriod] = useState<Period>('This Quarter');
  const [periodOpen, setPeriodOpen] = useState(false);
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(ONBOARDING_DISMISSED_KEY) === '1');

  const [order, setOrder] = useState<SectionKey[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(ORDER_KEY) || '[]') as SectionKey[];
      if (saved.length === 2 && saved.every(k => k === 'queue' || k === 'health')) return saved;
    } catch { /* fall through */ }
    return ['queue', 'health'];
  });
  useEffect(() => { localStorage.setItem(ORDER_KEY, JSON.stringify(order)); }, [order]);

  const draggedRef = useRef<SectionKey | null>(null);
  const [hoverKey, setHoverKey] = useState<SectionKey | null>(null);

  const dismiss = () => {
    setDismissed(true);
    localStorage.setItem(ONBOARDING_DISMISSED_KEY, '1');
  };

  const sectionFor = (key: SectionKey) =>
    key === 'queue' ? <WorkQueueSection setView={setView} /> : <HealthDashboardSection />;

  const handleDragStart = (key: SectionKey) => (e: React.DragEvent) => {
    draggedRef.current = key;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', key);
  };

  const handleDragOver = (key: SectionKey) => (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedRef.current && draggedRef.current !== key) setHoverKey(key);
  };

  const handleDragLeave = () => setHoverKey(null);

  const handleDrop = (key: SectionKey) => (e: React.DragEvent) => {
    e.preventDefault();
    const dragged = draggedRef.current;
    setHoverKey(null);
    draggedRef.current = null;
    if (!dragged || dragged === key) return;
    setOrder(prev => {
      const next: SectionKey[] = [...prev];
      const di = next.indexOf(dragged);
      const tj = next.indexOf(key);
      if (di === -1 || tj === -1) return prev;
      [next[di], next[tj]] = [next[tj], next[di]];
      return next;
    });
  };

  return (
    <div className="h-full overflow-y-auto bg-canvas">
      {/* Page header */}
      <div className="border-b border-canvas-border bg-canvas-elevated">
        <div className="max-w-6xl mx-auto px-8 pt-8 pb-6">
          <div className="font-mono text-[11px] text-ink-500 mb-2 tracking-tight">Home</div>
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
            className="flex items-end justify-between"
          >
            <div>
              <h1 className="font-display text-[40px] font-[420] tracking-tight text-ink-900 leading-[1.1] mb-2">
                Good morning, Auditor.
              </h1>
              <p className="text-[14px] text-ink-500 leading-relaxed">Here is your FY26 audit landscape at a glance.</p>
            </div>

            <div className="relative">
              <button
                onClick={() => setPeriodOpen(p => !p)}
                className="flex items-center gap-2 px-3 h-10 border border-canvas-border bg-canvas-elevated rounded-md text-[13px] text-ink-700 hover:border-brand-200 transition-colors cursor-pointer"
              >
                <Calendar size={14} className="text-ink-500" />
                <span className="font-medium">{period}</span>
                <ChevronDown size={14} className={`transition-transform ${periodOpen ? 'rotate-180' : ''}`} />
              </button>
              {periodOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setPeriodOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 w-44 z-20 bg-canvas-elevated border border-canvas-border rounded-md py-1 shadow-md">
                    {PERIODS.map(p => (
                      <button
                        key={p}
                        onClick={() => { setPeriod(p); setPeriodOpen(false); }}
                        className={`w-full text-left px-3 py-1.5 text-[13px] cursor-pointer transition-colors ${
                          p === period ? 'text-brand-700 font-semibold bg-brand-50' : 'text-ink-700 hover:bg-paper-50'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-6xl mx-auto px-8 py-8 space-y-8">
        {!dismissed && <QuickActionPanel setView={setView} onDismiss={dismiss} />}
        {dismissed && (
          <button
            onClick={() => { setDismissed(false); localStorage.removeItem(ONBOARDING_DISMISSED_KEY); }}
            className="inline-flex items-center gap-1.5 text-[12px] text-ink-500 hover:text-brand-700 transition-colors cursor-pointer"
          >
            <Plus size={12} />
            Restore onboarding
          </button>
        )}

        {order.map((key, idx) => (
          <DraggableSection
            key={key}
            dragKey={key}
            index={idx}
            isDraggedOver={hoverKey === key}
            onDragStart={handleDragStart(key)}
            onDragOver={handleDragOver(key)}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop(key)}
          >
            {sectionFor(key)}
          </DraggableSection>
        ))}

        <div className="text-[11px] text-ink-400 text-center pt-4 pb-2">
          Hover a section to drag it. The new order persists across reloads.
        </div>
      </div>
    </div>
  );
}
