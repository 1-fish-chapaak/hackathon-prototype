import { useState } from 'react';
import {
  ListChecks,
  Table2,
  FileOutput,
  Check,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import type { WorkflowDraft } from './types';

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

function InputConfigSection({ workflow }: { workflow: WorkflowDraft | null }) {
  if (!workflow) return <PlanSection workflow={null} />;
  return (
    <div className="rounded-xl border border-canvas-border bg-canvas-elevated p-4">
      <div className="text-[10px] font-bold uppercase tracking-wider text-ink-400 mb-3">
        Input Configuration
      </div>
      <ul className="space-y-2">
        {workflow.inputs.map((input) => (
          <li
            key={input.id}
            className="rounded-lg border border-canvas-border bg-canvas p-2.5"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11.5px] font-semibold text-ink-800 truncate">
                {input.name}
              </span>
              <span className="text-[9.5px] uppercase tracking-wider font-bold rounded-full px-1.5 py-0.5 bg-brand-50 text-brand-700">
                {input.type}
              </span>
              {input.required ? (
                <span className="text-[9.5px] uppercase tracking-wider font-bold rounded-full px-1.5 py-0.5 bg-risk-50 text-risk-700">
                  Required
                </span>
              ) : null}
            </div>
            {input.columns && input.columns.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {input.columns.map((c) => (
                  <span
                    key={c}
                    className="text-[10px] text-ink-600 bg-white border border-canvas-border rounded px-1.5 py-0.5"
                  >
                    {c}
                  </span>
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
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
