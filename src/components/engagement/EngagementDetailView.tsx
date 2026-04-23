import { useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft, Calendar, Shield, Users, ShieldCheck, AlertTriangle,
  Clock, CheckCircle2, XCircle, Search, Workflow,
  FileText, Zap, Eye, Target, Copy, ChevronRight
} from 'lucide-react';
import Orb from '../shared/Orb';
import { ENGAGEMENT, CONTROLS, FINDINGS, type ControlDetail, type ControlStatus, type Finding } from './engagementData';

// ─── Status helpers ──────────────────────────────────────────────────────────

function StatusPill({ status }: { status: ControlStatus }) {
  const map: Record<ControlStatus, { label: string; cls: string }> = {
    'not-started':        { label: 'Not Started',        cls: 'bg-draft-50 text-draft-700' },
    'population-pending': { label: 'Population Pending', cls: 'bg-high-50 text-high-700' },
    'in-progress':        { label: 'In Progress',        cls: 'bg-evidence-50 text-evidence-700' },
    'pending-review':     { label: 'Pending Review',     cls: 'bg-mitigated-50 text-mitigated-700' },
    'effective':          { label: 'Effective',           cls: 'bg-compliant-50 text-compliant-700' },
    'partially-effective':{ label: 'Partial',             cls: 'bg-high-50 text-high-700' },
    'ineffective':        { label: 'Ineffective',         cls: 'bg-risk-50 text-risk-700' },
  };
  const s = map[status] || map['not-started'];
  return <span className={`inline-flex items-center px-2.5 h-6 rounded-full text-[11px] font-semibold whitespace-nowrap ${s.cls}`}>{s.label}</span>;
}

function ResultPill({ result }: { result: string }) {
  if (!result) return <span className="text-ink-400 text-[11px]">—</span>;
  const map: Record<string, string> = {
    'Effective': 'bg-compliant-50 text-compliant-700',
    'Partially Effective': 'bg-high-50 text-high-700',
    'Ineffective': 'bg-risk-50 text-risk-700',
    'Pending': 'bg-draft-50 text-draft-700',
  };
  return <span className={`inline-flex items-center px-2.5 h-6 rounded-full text-[11px] font-semibold whitespace-nowrap ${map[result] || map['Pending']}`}>{result}</span>;
}

type TabId = 'controls' | 'findings';

// ─── Component ───────────────────────────────────────────────────────────────

interface Props {
  engagementId?: string;
  onBack: () => void;
  onOpenControl: (controlId: string) => void;
}

export default function EngagementDetailView({ onBack, onOpenControl }: Props) {
  const eng = ENGAGEMENT;
  const [search, setSearch] = useState('');
  const [domainFilter, setDomainFilter] = useState('All');
  const [activeTab, setActiveTab] = useState<TabId>('controls');

  const domains = ['All', ...Array.from(new Set(CONTROLS.map(c => c.domain)))];

  const filteredControls = CONTROLS.filter(c => {
    if (domainFilter !== 'All' && c.domain !== domainFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return c.controlId.toLowerCase().includes(q) || c.controlName.toLowerCase().includes(q) || c.domain.toLowerCase().includes(q) || c.assignee.toLowerCase().includes(q) || c.workflowName.toLowerCase().includes(q);
    }
    return true;
  });

  // KPIs from real data
  const totalControls = CONTROLS.length;
  const keyControls = CONTROLS.filter(c => c.isKey).length;
  const wip = CONTROLS.filter(c => ['in-progress', 'population-pending'].includes(c.status)).length;
  const pendingReview = CONTROLS.filter(c => c.status === 'pending-review').length;
  const concluded = CONTROLS.filter(c => ['effective', 'partially-effective', 'ineffective'].includes(c.status)).length;
  const deficient = CONTROLS.filter(c => c.status === 'ineffective').length;

  return (
    <div className="h-full overflow-y-auto bg-white bg-mesh-gradient relative">
      <Orb hoverIntensity={0.06} rotateOnHover hue={275} opacity={0.05} />

      <div className="p-8 relative">
        {/* Back */}
        <button onClick={onBack} className="flex items-center gap-1.5 text-[12px] text-text-muted hover:text-primary font-medium mb-4 cursor-pointer transition-colors">
          <ArrowLeft size={14} />Back to Planning
        </button>

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-bold text-text">{eng.name}</h1>
              <span className="px-2.5 h-6 rounded-full text-[11px] font-semibold bg-compliant-50 text-compliant-700 inline-flex items-center">{eng.status}</span>
            </div>
            <p className="text-[13px] text-text-secondary mt-1 max-w-2xl">{eng.description}</p>
          </div>
        </div>

        {/* Metadata Strip */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {[
            { label: 'Audit Type', value: eng.auditType, icon: Shield },
            { label: 'Framework', value: eng.framework, icon: Target },
            { label: 'Audit Period', value: `${eng.auditPeriodStart} — ${eng.auditPeriodEnd}`, icon: Calendar },
            { label: 'Owner / Reviewer', value: `${eng.owner} / ${eng.reviewer}`, icon: Users },
            { label: 'RACM Version', value: eng.racmVersion, icon: FileText },
            { label: 'Snapshot', value: eng.snapshotId, icon: Copy },
          ].map(m => (
            <div key={m.label} className="glass-card rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <m.icon size={11} className="text-text-muted" />
                <span className="text-[10px] font-semibold text-text-muted uppercase">{m.label}</span>
              </div>
              <div className="text-[12px] font-medium text-text truncate" title={m.value}>{m.value}</div>
            </div>
          ))}
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-6 gap-3 mb-6">
          {[
            { label: 'Total Controls', value: totalControls, color: 'text-text' },
            { label: 'Key Controls', value: keyControls, color: 'text-brand-700' },
            { label: 'Work In Progress', value: wip, color: 'text-evidence-700' },
            { label: 'Pending Review', value: pendingReview, color: 'text-mitigated-700' },
            { label: 'Concluded', value: concluded, color: 'text-compliant-700' },
            { label: 'Deficient', value: deficient, color: 'text-risk-700' },
          ].map(kpi => (
            <div key={kpi.label} className="glass-card rounded-xl p-3 text-center">
              <div className={`text-xl font-bold tabular-nums ${kpi.color}`}>{kpi.value}</div>
              <div className="text-[11px] text-text-muted mt-0.5">{kpi.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center border-b border-border-light mb-4">
          <button onClick={() => setActiveTab('controls')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === 'controls' ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text-secondary'
            }`}>
            <ShieldCheck size={14} />Controls
            <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === 'controls' ? 'bg-primary/10 text-primary' : 'bg-paper-50 text-ink-500'}`}>{CONTROLS.length}</span>
          </button>
          <button onClick={() => setActiveTab('findings')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === 'findings' ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text-secondary'
            }`}>
            <AlertTriangle size={14} />Findings
            {FINDINGS.length > 0 && (
              <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === 'findings' ? 'bg-risk-50 text-risk-700' : 'bg-risk-50 text-risk-700'}`}>{FINDINGS.length}</span>
            )}
          </button>
        </div>

        {/* ── CONTROLS TAB ── */}
        {activeTab === 'controls' && (
          <>
            {/* Filters + Search */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-bold text-text-muted">Domain:</span>
                <div className="flex gap-1 flex-wrap">
                  {domains.map(d => (
                    <button key={d} onClick={() => setDomainFilter(d)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                        domainFilter === d ? 'bg-primary text-white' : 'bg-surface-2 text-text-muted hover:bg-primary/10 hover:text-primary'
                      }`}>{d}</button>
                  ))}
                </div>
              </div>
              <div className="flex-1" />
              <div className="relative w-64">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input type="text" placeholder="Search controls..." value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-[12px] bg-white border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all placeholder:text-text-muted" />
              </div>
            </div>

            {/* Controls Table */}
            <div className="glass-card rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="border-b border-border bg-surface-2/50">
                      {['Control', 'Domain / Process', 'Key', 'Workflow', 'Status', 'Samples', 'Exceptions', 'Result', 'Updated'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-text-muted uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredControls.map((row, i) => (
                      <motion.tr key={row.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                        onClick={() => onOpenControl(row.id)}
                        className="border-b border-border/50 hover:bg-brand-50/30 transition-colors cursor-pointer group">
                        <td className="px-4 py-3">
                          <div>
                            <span className="text-[10px] font-mono text-text-muted">{row.controlId}</span>
                            <div className="text-[12px] font-medium text-text">{row.controlName}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3"><span className="text-[11px] text-text-secondary">{row.domain}</span></td>
                        <td className="px-4 py-3 text-center">
                          {row.isKey ? <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-mitigated-50 text-mitigated-700 text-[10px] font-bold">K</span> : <span className="text-ink-300">—</span>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <Workflow size={10} className="text-brand-500 shrink-0" />
                            <div>
                              <span className="text-[11px] font-medium text-brand-700">{row.workflowName}</span>
                              <span className="text-[10px] text-text-muted ml-1">{row.workflowVersion} · {row.workflowAttributes.length} attrs</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3"><StatusPill status={row.status} /></td>
                        <td className="px-4 py-3">
                          {row.sampleCount > 0 ? <span className="text-[12px] tabular-nums text-text-secondary">{row.samplesTested}/{row.sampleCount}</span> : <span className="text-ink-300 text-[11px]">—</span>}
                        </td>
                        <td className="px-4 py-3">
                          {row.exceptions > 0 ? <span className="text-[12px] font-semibold text-risk-700 tabular-nums">{row.exceptions}</span> : <span className="text-ink-300 text-[11px]">—</span>}
                        </td>
                        <td className="px-4 py-3"><ResultPill result={row.result} /></td>
                        <td className="px-4 py-3"><span className="text-[11px] text-text-muted">{row.lastUpdated}</span></td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-surface-2/30">
                <span className="text-[11px] text-text-muted">Showing {filteredControls.length} of {CONTROLS.length} controls</span>
              </div>
            </div>
          </>
        )}

        {/* ── FINDINGS TAB ── */}
        {activeTab === 'findings' && (
          <div>
            {FINDINGS.length === 0 ? (
              <div className="text-center py-16">
                <CheckCircle2 size={32} className="text-compliant mx-auto mb-3" />
                <p className="text-[14px] font-semibold text-text">No findings raised</p>
                <p className="text-[12px] text-text-muted mt-1">Findings are created when a control is concluded as ineffective.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {FINDINGS.map(f => (
                  <div key={f.id} className="glass-card rounded-xl p-5 border-l-4 border-risk hover:border-risk/80 transition-colors cursor-pointer"
                    onClick={() => {
                      const ctrl = CONTROLS.find(c => c.controlId === f.controlId);
                      if (ctrl) onOpenControl(ctrl.id);
                    }}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-mono font-bold text-risk-700">{f.id}</span>
                        <span className={`px-2.5 h-6 rounded-full text-[11px] font-semibold inline-flex items-center ${
                          f.severity === 'Material Weakness' ? 'bg-risk-50 text-risk-700' :
                          f.severity === 'Significant Deficiency' ? 'bg-high-50 text-high-700' :
                          'bg-mitigated-50 text-mitigated-700'
                        }`}>{f.severity}</span>
                        <span className={`px-2.5 h-6 rounded-full text-[11px] font-semibold inline-flex items-center ${
                          f.status === 'Open' ? 'bg-risk-50 text-risk-700' : f.status === 'In Remediation' ? 'bg-high-50 text-high-700' : 'bg-compliant-50 text-compliant-700'
                        }`}>{f.status}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] text-text-muted">Due: {f.remediationDueDate}</span>
                        <ChevronRight size={14} className="text-text-muted" />
                      </div>
                    </div>
                    <h3 className="text-[13px] font-semibold text-text mb-2">{f.title}</h3>
                    <div className="grid grid-cols-2 gap-3 text-[11px]">
                      <div><span className="text-text-muted">Control: </span><span className="text-text font-medium">{f.controlName}</span></div>
                      <div><span className="text-text-muted">Failed Attribute: </span><span className="text-text font-medium">{f.failedAttribute}</span></div>
                      <div><span className="text-text-muted">Owner: </span><span className="text-text font-medium">{f.owner}</span></div>
                      <div><span className="text-text-muted">Raised by: </span><span className="text-text font-medium">{f.raisedBy} on {f.raisedDate}</span></div>
                    </div>
                    <div className="mt-2 text-[11px]">
                      <span className="text-text-muted">Failed Samples: </span>
                      <span className="text-text-secondary">{f.failedSamples.join(', ')}</span>
                    </div>
                    <div className="mt-1 text-[11px]">
                      <span className="text-text-muted">Root Cause: </span>
                      <span className="text-text-secondary">{f.rootCause}</span>
                    </div>
                    {/* Evidence trace */}
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {f.evidenceRefs.map(e => (
                        <span key={e} className="inline-flex items-center gap-1 text-[10px] text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-100">
                          <FileText size={8} />{e}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
