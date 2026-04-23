import { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'motion/react';
import {
  Check, X, Calendar, ChevronDown, GripVertical, Sparkles,
  Workflow as WorkflowIcon, ShieldAlert, ClipboardCheck,
  ArrowRight, Plus, DollarSign, Clock, AlertTriangle, Activity,
  TrendingUp, TrendingDown, Shield,
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

  // Derived data from mock sources
  const defOpen = DEFICIENCIES.filter(d => d.status === 'open').length;
  const defInProgress = DEFICIENCIES.filter(d => d.status === 'in-progress').length;
  const defTotal = defOpen + defInProgress;
  const totalWorkflowRuns = WORKFLOWS.reduce((s, w) => s + w.runs, 0);

  // Sparkline data derived from real engagement progression
  const COMPLETION_TREND = active.map((_, i) => {
    const slice = active.slice(0, i + 1);
    const p = slice.reduce((s, e) => s + e.controls, 0);
    const e2 = slice.reduce((s, e) => s + e.tested, 0);
    return p > 0 ? Math.round((e2 / p) * 100) : 0;
  });
  // Pad to at least 8 points for a nice chart
  while (COMPLETION_TREND.length < 8) COMPLETION_TREND.unshift(Math.max(0, COMPLETION_TREND[0] - Math.floor(Math.random() * 5 + 2)));
  const compMax = Math.max(...COMPLETION_TREND);
  const compMin = Math.min(...COMPLETION_TREND);

  // Risk bars from severity distribution
  const riskBySev = ['low', 'low', 'medium', 'medium', 'high', 'high', 'critical'].map(
    sev => RISKS.filter(r => r.severity === sev).length
  );
  const riskBarMax = Math.max(...riskBySev, 1);

  // Workflow runs trend
  const wfSorted = [...WORKFLOWS].sort((a, b) => a.runs - b.runs);
  const wfBars = wfSorted.map(w => w.runs);
  const wfMax = Math.max(...wfBars, 1);

  return (
    <div>
      <div className="grid grid-cols-12 grid-rows-2 gap-3" style={{ gridAutoRows: 'minmax(0, 1fr)' }}>
        {/* ── FY26 Completion — left, spans 2 rows ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="col-span-5 row-span-2 rounded-2xl p-6 flex flex-col justify-between cursor-default border border-canvas-border bg-white relative overflow-hidden"
        >
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[12px] font-semibold text-brand-600">FY26</span>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                <TrendingUp size={11} />
                +{completionPct > 0 ? Math.round(completionPct * 0.13) : 0}%
              </div>
            </div>
            <div className="text-[48px] font-extrabold leading-none tracking-tight text-ink-900">{completionPct}%</div>
            <p className="text-[13px] text-ink-500 mt-2 leading-relaxed max-w-[280px]">
              {executed} of {planned} controls executed across {active.length} active engagements.
            </p>
          </div>
          <svg width="100%" height="120" viewBox="0 0 240 120" preserveAspectRatio="none" className="mt-4">
            <defs>
              <linearGradient id="homeCompFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8838DE" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#8838DE" stopOpacity="0.02" />
              </linearGradient>
            </defs>
            <polyline
              points={`0,120 ${COMPLETION_TREND.map((v, j) => `${j * (240 / (COMPLETION_TREND.length - 1))},${120 - (compMax === compMin ? 50 : ((v - compMin) / (compMax - compMin)) * 100)}`).join(' ')} 240,120`}
              fill="url(#homeCompFill)" stroke="none"
            />
            <polyline
              points={COMPLETION_TREND.map((v, j) => `${j * (240 / (COMPLETION_TREND.length - 1))},${120 - (compMax === compMin ? 50 : ((v - compMin) / (compMax - compMin)) * 100)}`).join(' ')}
              fill="none" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            />
          </svg>
        </motion.div>

        {/* ── Risk Overview — top middle ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="col-span-4 rounded-2xl p-5 flex flex-col justify-between cursor-default border"
          style={{ background: '#FFF9EB', borderColor: '#F5E6C0' }}
        >
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: '#F59E0B' }}>
                <AlertTriangle size={13} className="text-white" />
              </div>
              <span className="text-[12px] font-semibold" style={{ color: '#92400E' }}>Risk Overview</span>
            </div>
            <div className="text-[32px] font-extrabold leading-none tracking-tight" style={{ color: '#1C1917' }}>{riskTotal} risks</div>
            <div className="flex items-center gap-1.5 mt-2 text-[11px] font-semibold text-red-600">
              <Shield size={10} />
              {riskFailed} critical/high <span className="text-ink-500 font-normal">· {riskHealthy} mitigated</span>
            </div>
          </div>
          <div className="flex items-end gap-1.5 h-7 mt-3">
            {riskBySev.map((v, j) => (
              <motion.div key={j} initial={{ height: 0 }} animate={{ height: `${(v / riskBarMax) * 100}%` }} transition={{ delay: 0.25 + j * 0.04, duration: 0.3 }}
                className="flex-1 rounded-sm min-h-[3px]" style={{ background: j >= riskBySev.length - 1 ? '#EF4444' : 'rgba(239,68,68,0.18)' }} />
            ))}
          </div>
        </motion.div>

        {/* ── Controls — top right ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="col-span-3 rounded-2xl p-5 flex flex-col justify-between cursor-default border"
          style={{ background: '#F3EAFF', borderColor: '#DBC4F7' }}
        >
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: '#8838DE' }}>
                <Shield size={13} className="text-white" />
              </div>
              <span className="text-[12px] font-semibold text-brand-700">Controls</span>
            </div>
            <div className="text-[40px] font-extrabold leading-none tracking-tight text-brand-700">{ctlTotal}</div>
            <div className="text-[13px] font-semibold text-brand-600 mt-1">in library</div>
          </div>
          <div className="mt-3 space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-ink-500">{ctlPending} pending</span>
              <span className="font-semibold text-amber-600">{ctlOverdue} overdue</span>
            </div>
            <div className="h-1.5 rounded-full bg-brand-100 overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${((ctlTotal - ctlPending - ctlOverdue) / ctlTotal) * 100}%` }} transition={{ delay: 0.3, duration: 0.5 }}
                className="h-full rounded-full bg-brand-500" />
            </div>
          </div>
        </motion.div>

        {/* ── Deficiencies — bottom middle ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="col-span-4 rounded-2xl p-5 flex flex-col justify-between cursor-default border"
          style={{ background: '#FFF9EB', borderColor: '#F5E6C0' }}
        >
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: '#EF4444' }}>
                <ShieldAlert size={13} className="text-white" />
              </div>
              <span className="text-[12px] font-semibold" style={{ color: '#92400E' }}>Open Deficiencies</span>
              <span className="ml-auto text-[10px] text-ink-500 font-medium">Active</span>
            </div>
            <div className="text-[40px] font-extrabold leading-none tracking-tight" style={{ color: '#1C1917' }}>{defTotal}</div>
            <div className="text-[12px] text-ink-500 mt-1.5">{defOpen} open, {defInProgress} in progress</div>
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] font-semibold text-red-600">
            <AlertTriangle size={10} />
            {DEFICIENCIES.filter(d => d.severity === 'MW').length} material weakness
          </div>
        </motion.div>

        {/* ── Workflow Runs — bottom right ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="col-span-3 rounded-2xl p-5 flex flex-col justify-between cursor-default border"
          style={{ background: '#ECFDF5', borderColor: '#A7F3D0' }}
        >
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: '#16A34A' }}>
                <Activity size={13} className="text-white" />
              </div>
              <span className="text-[12px] font-semibold text-emerald-700">Workflow Runs</span>
            </div>
            <div className="text-[36px] font-extrabold leading-none tracking-tight text-emerald-700">{totalWorkflowRuns}</div>
            <div className="text-[12px] text-emerald-600/70 mt-1.5">{WORKFLOWS.length} active workflows</div>
          </div>
          <div className="flex items-end gap-1.5 h-8 mt-2">
            {wfBars.map((v, j) => (
              <motion.div key={j} initial={{ height: 0 }} animate={{ height: `${(v / wfMax) * 100}%` }} transition={{ delay: 0.35 + j * 0.04, duration: 0.3 }}
                className="flex-1 rounded-sm min-h-[3px]" style={{ background: j >= wfBars.length - 2 ? '#16A34A' : 'rgba(22,163,74,0.18)' }} />
            ))}
          </div>
        </motion.div>
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
    return ['health', 'queue'];
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
      <div className="border-b border-canvas-border bg-canvas-elevated relative overflow-hidden">
        {/* Subtle gradient accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1" style={{ background: 'linear-gradient(90deg, #8838DE, #A366F0, #16A34A, #F59E0B)' }} />
        <div className="px-6 pt-8 pb-6">
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
            className="flex items-end justify-between"
          >
            <div>
              <h1 className="text-[40px] tracking-tight leading-[1.1] mb-2">
                <span className="font-extrabold" style={{ background: 'linear-gradient(135deg, #8838DE, #6A12CD)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Good morning,</span>
                {' '}
                <span className="font-[420] text-ink-900">Auditor</span>
              </h1>
              <p className="text-[14px] text-ink-500 leading-relaxed">Here's your FY26 audit landscape at a glance</p>
              <div className="flex items-center gap-2 mt-3 text-[13px] text-ink-400">
                <Sparkles size={13} className="text-brand-400" />
                <span>Try: "What risks need attention this week?" or "Build a vendor payment workflow"</span>
              </div>
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
      <div className="px-6 py-8 space-y-8">
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

        {/* Add Widget */}
        <div className="flex justify-center pt-2 pb-4">
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-dashed border-brand-200 text-[13px] font-semibold text-brand-600 hover:bg-brand-50 hover:border-brand-300 transition-colors cursor-pointer">
            <Plus size={14} />
            Add Widget
          </button>
        </div>
      </div>
    </div>
  );
}
