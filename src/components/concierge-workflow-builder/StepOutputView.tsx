import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Zap,
  Download,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
  Search,
  Sparkles,
  PanelRightOpen,
  PanelRightClose,
  Mail,
  MessageCircle,
  Database,
  Globe,
  FileText,
  Loader2,
  AlertOctagon,
  Check,
} from 'lucide-react';
import type { WorkflowDraft, RunResult } from './types';

interface Props {
  workflow: WorkflowDraft;
  result: RunResult | null;
  running: boolean;
}

const TABS = ['Editor', 'Output', 'Analytics', 'Manager'] as const;
const CONFIG_TABS = ['Plan', 'Input Config', 'Output Config'] as const;
type MainTab = (typeof TABS)[number];
type ConfigTab = (typeof CONFIG_TABS)[number];
type LayoutMode = 'Table' | 'Dashboard' | 'Summary';

const ROW_TONE: Record<'flagged' | 'warning' | 'ok', string> = {
  flagged: 'bg-risk-50 border-l-2 border-risk',
  warning: 'bg-mitigated-50 border-l-2 border-mitigated',
  ok: 'bg-compliant-50 border-l-2 border-compliant',
};
const ROW_ICON = { flagged: AlertOctagon, warning: AlertTriangle, ok: CheckCircle2 } as const;
const ROW_ICON_TONE: Record<'flagged' | 'warning' | 'ok', string> = {
  flagged: 'text-risk',
  warning: 'text-mitigated',
  ok: 'text-compliant',
};

export default function StepOutputView({ workflow, result, running }: Props) {
  const [activeTab, setActiveTab] = useState<MainTab>('Output');
  const [configOpen, setConfigOpen] = useState(false);
  const [configTab, setConfigTab] = useState<ConfigTab>('Output Config');
  const [layout, setLayout] = useState<LayoutMode>('Dashboard');
  const [kpis, setKpis] = useState({
    totalRecords: true,
    duplicates: true,
    amountAtRisk: true,
    comparison: false,
    trend: false,
  });

  if (running && !result) {
    return (
      <main className="flex-1 min-h-0 flex items-center justify-center bg-canvas">
        <div className="flex flex-col items-center gap-3 text-center">
          <Loader2 size={28} className="animate-spin text-brand-600" />
          <div className="text-[14px] font-semibold text-ink-800">
            Running {workflow.name}…
          </div>
          <div className="text-[12px] text-ink-500 max-w-sm">
            Ingesting, validating, and generating your output.
          </div>
        </div>
      </main>
    );
  }

  if (!result) return null;

  const insights = [
    {
      id: 'duplicate',
      title: 'Duplicate Detection',
      icon: Sparkles,
      iconBg: 'bg-brand-50',
      iconColor: 'text-brand-600',
      body: (
        <>
          <b className="text-brand-700">8 potential duplicates</b> identified across 3 vendors. Highest
          confidence pair: INV-4521 vs INV-3102 (Acme Corp) with 96% field similarity.
        </>
      ),
      priority: 'High Priority',
      priorityColor: 'bg-risk-50 text-risk-700',
    },
    {
      id: 'mtow',
      title: 'MTOW Weight Discrepancies',
      icon: AlertTriangle,
      iconBg: 'bg-mitigated-50',
      iconColor: 'text-mitigated',
      body: (
        <>
          <b className="text-brand-700">12 invoices</b> show MTOW values exceeding the certified
          maximum by &gt;5%. Average overcharge per invoice: <b className="text-brand-700">$3,847</b>.
        </>
      ),
      priority: 'Medium Priority',
      priorityColor: 'bg-mitigated-50 text-mitigated',
    },
    {
      id: 'rate',
      title: 'Rate Compliance',
      icon: BarChart3,
      iconBg: 'bg-compliant-50',
      iconColor: 'text-compliant',
      body: (
        <>
          <b className="text-brand-700">97.3%</b> of terminal charges align with the YYZ Rate Master.
          Remaining 2.7% used outdated rate tiers from Q2 2024.
        </>
      ),
      priority: 'On Track',
      priorityColor: 'bg-compliant-50 text-compliant-700',
    },
    {
      id: 'vendor',
      title: 'Vendor Concentration Risk',
      icon: Search,
      iconBg: 'bg-brand-50',
      iconColor: 'text-brand-600',
      body: (
        <>
          <b className="text-brand-700">68%</b> of flagged invoices originate from 2 vendors (Acme
          Corp, GlobalFlight). Targeted vendor auditing may yield higher returns.
        </>
      ),
      priority: 'Insight',
      priorityColor: 'bg-brand-50 text-brand-700',
    },
  ];

  return (
    <div className="flex-1 min-w-0 min-h-0 flex">
      {/* Main content */}
      <main className="flex-1 min-w-0 flex flex-col overflow-hidden bg-canvas">
        {/* Top tabs bar */}
        <header className="shrink-0 border-b border-canvas-border bg-canvas-elevated h-12 flex items-center justify-between px-4">
          <nav className="flex items-center gap-1">
            {TABS.map((t) => {
              const active = activeTab === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setActiveTab(t)}
                  className={[
                    'text-[13px] font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer',
                    active
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-ink-600 hover:bg-canvas',
                  ].join(' ')}
                >
                  {t}
                </button>
              );
            })}
          </nav>
          {!configOpen && (
            <button
              type="button"
              onClick={() => setConfigOpen(true)}
              className="w-8 h-8 rounded-lg hover:bg-canvas text-ink-500 hover:text-brand-600 flex items-center justify-center cursor-pointer transition-colors"
              aria-label="Open output config"
            >
              <PanelRightOpen size={15} />
            </button>
          )}
        </header>

        {/* Scrollable content */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="max-w-[960px] mx-auto px-6 py-5"
          >
            {/* Header row */}
            <div className="flex items-start gap-3 mb-5">
              <div className="w-11 h-11 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                <Zap size={18} className="text-brand-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-[20px] font-semibold text-ink-900 tracking-tight leading-tight">
                  {workflow.name}
                </h1>
                <div className="flex items-center gap-3 flex-wrap mt-1">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-compliant-700 bg-compliant-50 rounded-full px-2 py-0.5">
                    <CheckCircle2 size={11} />
                    RUN SUCCESSFUL
                  </span>
                  <span className="text-[12px] text-ink-400">RUN ID: RWF-4407-B</span>
                  <span className="text-[12px] text-ink-400">
                    {(28_345_840).toLocaleString()} records
                  </span>
                </div>
              </div>
              <button
                type="button"
                aria-label="Download"
                className="w-9 h-9 rounded-lg border border-canvas-border text-ink-600 hover:bg-canvas-elevated flex items-center justify-center cursor-pointer transition-colors"
              >
                <Download size={15} />
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-[13px] font-semibold px-4 py-2 cursor-pointer transition-colors"
              >
                <Download size={14} />
                Export Report
              </button>
            </div>

            {/* KPI cards */}
            <div className="grid grid-cols-4 gap-3 mb-5">
              <KPICard
                label="TOTAL INVOICES"
                value="1,129"
                delta="+13%"
                deltaTone="ok"
              />
              <KPICard
                label="CRITICAL FLAGS"
                value="3"
                valueTone="risk"
                delta="+2"
                deltaTone="risk"
              />
              <KPICard
                label="AUDIT ACCURACY"
                value="99.4%"
                valueTone="ok"
                delta="+8.2%"
                deltaTone="ok"
              />
              <KPICard
                label="POTENTIAL SAVINGS"
                value="$42.5k"
                delta="New"
                deltaTone="neutral"
              />
            </div>

            {/* AI Summary */}
            <section className="rounded-xl bg-brand-50/50 border border-brand-100 p-4 mb-6">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-brand-700 bg-white/80 border border-brand-100 rounded-full px-2 py-1 mb-2">
                <Sparkles size={11} />
                AI SUMMARY
              </div>
              <p className="text-[13px] text-ink-700 leading-relaxed">
                Scanned <b className="text-brand-700">12,450 invoices</b> against 6-month
                history. Identified <b className="text-brand-700">8 potential duplicates</b>{' '}
                totalling <b className="text-brand-700">₹6.10L at risk</b>. Highest confidence
                match: INV-4521 vs INV-3102 (Acme Corp, 96% match).{' '}
                <b className="text-brand-700">3 invoices</b> from the same vendor within 48
                hours flagged as suspicious. False positive rate: 4.2% (down from 6.5% last
                run). Recommend immediate review of the 3 critical-severity flags before next
                payment batch.
              </p>
            </section>

            {/* Key Observations */}
            <h2 className="text-[16px] font-semibold text-ink-900 mb-3">
              Key Observations &amp; Insights
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
              {insights.map((o) => {
                const Icon = o.icon;
                return (
                  <div
                    key={o.id}
                    className="rounded-xl border border-canvas-border bg-canvas-elevated p-4"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className={`w-7 h-7 rounded-lg ${o.iconBg} ${o.iconColor} flex items-center justify-center shrink-0`}
                      >
                        <Icon size={14} />
                      </div>
                      <div className="text-[14px] font-semibold text-ink-800">{o.title}</div>
                    </div>
                    <p className="text-[12.5px] text-ink-600 leading-relaxed mb-3">{o.body}</p>
                    <span
                      className={`inline-flex items-center text-[11px] font-semibold rounded-md px-2 py-0.5 ${o.priorityColor}`}
                    >
                      {o.priority}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Audit Report */}
            <h2 className="text-[16px] font-semibold text-ink-900 mb-3">Audit Report</h2>
            <div className="rounded-xl border border-canvas-border bg-canvas-elevated overflow-hidden">
              <div className="flex items-baseline justify-between gap-4 px-4 pt-3 pb-2">
                <div className="text-[13px] font-semibold text-ink-800">{result.title}</div>
                <span className="text-[11px] text-ink-400 font-bold uppercase tracking-wider">
                  {result.outputType}
                </span>
              </div>
              <table className="w-full text-[12px]">
                <thead className="bg-canvas text-ink-500 border-y border-canvas-border">
                  <tr>
                    <th className="w-7"></th>
                    {result.columns.map((c) => (
                      <th
                        key={c}
                        className="text-left font-semibold px-2.5 py-1.5 whitespace-nowrap"
                      >
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((r, i) => {
                    const Icon = ROW_ICON[r.status];
                    return (
                      <tr
                        key={i}
                        className={`${ROW_TONE[r.status]} ${i === 0 ? '' : 'border-t border-canvas-border'}`}
                      >
                        <td className="px-2 py-1.5 align-middle">
                          <Icon size={13} className={ROW_ICON_TONE[r.status]} />
                        </td>
                        {r.cells.map((cell, j) => (
                          <td
                            key={j}
                            className="px-2.5 py-1.5 text-ink-800 whitespace-nowrap"
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
          </motion.div>
        </div>
      </main>

      {/* Right-side config rail / panel */}
      <AnimatePresence initial={false}>
        {configOpen ? (
          <motion.aside
            key="cfg-open"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="shrink-0 overflow-hidden border-l border-canvas-border bg-canvas-elevated"
          >
            <div className="w-[320px] h-full flex flex-col min-h-0">
              {/* Tabs */}
              <div className="shrink-0 border-b border-canvas-border flex items-center justify-between px-3 h-12">
                <nav className="flex items-center gap-3">
                  {CONFIG_TABS.map((t) => {
                    const active = configTab === t;
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setConfigTab(t)}
                        className={[
                          'text-[12.5px] font-semibold py-1 border-b-2 transition-colors cursor-pointer',
                          active
                            ? 'text-brand-700 border-brand-600'
                            : 'text-ink-500 border-transparent hover:text-ink-800',
                        ].join(' ')}
                      >
                        {t}
                      </button>
                    );
                  })}
                </nav>
                <button
                  type="button"
                  onClick={() => setConfigOpen(false)}
                  aria-label="Collapse config"
                  className="w-7 h-7 rounded-md hover:bg-canvas text-ink-500 hover:text-brand-600 flex items-center justify-center cursor-pointer transition-colors"
                >
                  <PanelRightClose size={14} />
                </button>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-3">
                {configTab === 'Output Config' && (
                  <>
                    {/* Dashboard KPIs */}
                    <section className="rounded-lg border border-canvas-border bg-canvas p-3">
                      <div className="text-[13px] font-semibold text-ink-800 mb-2">
                        Dashboard KPIs
                      </div>
                      <div className="space-y-1.5">
                        <CheckRow
                          checked={kpis.totalRecords}
                          onToggle={() =>
                            setKpis((k) => ({ ...k, totalRecords: !k.totalRecords }))
                          }
                          label="Total Records Scanned"
                        />
                        <CheckRow
                          checked={kpis.duplicates}
                          onToggle={() =>
                            setKpis((k) => ({ ...k, duplicates: !k.duplicates }))
                          }
                          label="Duplicates Found"
                        />
                        <CheckRow
                          checked={kpis.amountAtRisk}
                          onToggle={() =>
                            setKpis((k) => ({ ...k, amountAtRisk: !k.amountAtRisk }))
                          }
                          label="Amount at Risk"
                        />
                        <CheckRow
                          checked={kpis.comparison}
                          onToggle={() =>
                            setKpis((k) => ({ ...k, comparison: !k.comparison }))
                          }
                          label="Comparison vs Last Run"
                          badge="DELTA"
                          badgeColor="bg-mitigated-50 text-mitigated"
                        />
                        <CheckRow
                          checked={kpis.trend}
                          onToggle={() =>
                            setKpis((k) => ({ ...k, trend: !k.trend }))
                          }
                          label="Duplicate Trend (30 days)"
                        />
                      </div>
                    </section>

                    {/* Output Layout */}
                    <section className="rounded-lg border border-canvas-border bg-canvas p-3">
                      <div className="text-[13px] font-semibold text-ink-800 mb-2">
                        Output Layout
                      </div>
                      <div className="grid grid-cols-3 gap-1.5 mb-3">
                        {(['Table', 'Dashboard', 'Summary'] as const).map((m) => {
                          const active = layout === m;
                          return (
                            <button
                              key={m}
                              type="button"
                              onClick={() => setLayout(m)}
                              className={[
                                'text-[12px] font-semibold rounded-md px-2 py-1.5 border transition-colors cursor-pointer',
                                active
                                  ? 'border-brand-400 bg-brand-50 text-brand-700'
                                  : 'border-canvas-border bg-canvas-elevated text-ink-600 hover:border-brand-300',
                              ].join(' ')}
                            >
                              {active && <CheckCircle2 size={11} className="inline mr-1" />}
                              {m}
                            </button>
                          );
                        })}
                      </div>
                      <DashboardPreview />
                    </section>

                    {/* Delivery & Routing */}
                    <section className="rounded-lg border border-canvas-border bg-canvas p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-800">
                          <Sparkles size={13} className="text-brand-600" />
                          Delivery &amp; Routing
                        </div>
                        <span className="text-[10px] font-bold rounded-md bg-brand-50 text-brand-700 px-1.5 py-0.5">
                          NEW
                        </span>
                      </div>
                      <p className="text-[12px] text-ink-600 leading-relaxed bg-brand-50/40 border border-brand-100 rounded-md p-2 mb-2">
                        Most AP teams route critical findings to Slack and email a summary to
                        leadership. Configure once, auto-deliver on every run.
                      </p>
                      <div className="text-[10px] font-bold text-ink-400 tracking-wider mb-1.5">
                        AFTER EXECUTION, SEND RESULTS TO:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        <ChannelChip icon={Mail} label="Email digest" />
                        <ChannelChip icon={MessageCircle} label="Slack channel" />
                        <ChannelChip icon={Database} label="ERP push" />
                        <ChannelChip icon={Globe} label="Webhook" />
                        <ChannelChip icon={FileText} label="Auto-export CSV" />
                      </div>
                    </section>
                  </>
                )}

                {configTab === 'Plan' && (
                  <div className="rounded-lg border border-dashed border-canvas-border bg-canvas p-4 text-center text-[12px] text-ink-400">
                    Execution plan summary appears here.
                  </div>
                )}
                {configTab === 'Input Config' && (
                  <div className="rounded-lg border border-dashed border-canvas-border bg-canvas p-4 text-center text-[12px] text-ink-400">
                    Input configuration controls appear here.
                  </div>
                )}
              </div>
            </div>
          </motion.aside>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function KPICard({
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
    <div className="rounded-xl border border-canvas-border bg-canvas-elevated p-3.5">
      <div className="text-[10.5px] font-bold text-ink-400 tracking-wider">{label}</div>
      <div className="flex items-baseline gap-2 mt-1">
        <div className={`text-[22px] font-bold ${valueColor} leading-none`}>{value}</div>
        {delta && (
          <span
            className={`text-[10.5px] font-bold rounded-md px-1.5 py-0.5 ${deltaColor}`}
          >
            {delta}
          </span>
        )}
      </div>
    </div>
  );
}

function CheckRow({
  checked,
  onToggle,
  label,
  badge,
  badgeColor,
}: {
  checked: boolean;
  onToggle: () => void;
  label: string;
  badge?: string;
  badgeColor?: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-center gap-2 text-left rounded-md px-1.5 py-1 hover:bg-canvas-elevated cursor-pointer transition-colors"
    >
      <span
        className={[
          'w-4 h-4 rounded-md flex items-center justify-center shrink-0 transition-colors',
          checked
            ? 'bg-brand-600 text-white'
            : 'border border-canvas-border bg-canvas-elevated',
        ].join(' ')}
      >
        {checked && <Check size={11} strokeWidth={3} />}
      </span>
      <span className="flex-1 text-[12.5px] text-ink-700">{label}</span>
      {badge && (
        <span
          className={`text-[9.5px] font-bold rounded-md px-1.5 py-0.5 ${badgeColor}`}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

function ChannelChip({
  icon: Icon,
  label,
}: {
  icon: typeof Mail;
  label: string;
}) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1.5 rounded-md border border-canvas-border bg-canvas-elevated text-ink-700 text-[11.5px] font-semibold px-2 py-1 hover:border-brand-300 cursor-pointer transition-colors"
    >
      <Icon size={11} />
      {label}
    </button>
  );
}

function DashboardPreview() {
  return (
    <div className="rounded-md border border-canvas-border bg-canvas-elevated p-2">
      <div className="grid grid-cols-4 gap-1 mb-1.5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-5 rounded-sm bg-brand-100/70" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-1">
        <div className="h-14 rounded-sm bg-brand-50 flex items-center justify-center">
          <svg
            width="60"
            height="30"
            viewBox="0 0 60 30"
            className="text-brand-500"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M2 22 L14 14 L26 18 L38 6 L50 10 L58 4" />
          </svg>
        </div>
        <div className="h-14 rounded-sm bg-brand-50 flex items-center justify-center">
          <div className="w-7 h-7 rounded-full border-[3px] border-brand-400" />
        </div>
      </div>
    </div>
  );
}
