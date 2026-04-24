import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, Calendar, Shield, Users, ShieldCheck, AlertTriangle,
  Clock, CheckCircle2, XCircle, Search, Workflow,
  FileText, Zap, Eye, Target, Copy, ChevronRight,
  Upload, Database, X, Play, Lock, BarChart3, Paperclip,
  Settings, ArrowRight
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

function isConcluded(s: ControlStatus): boolean {
  return ['effective', 'partially-effective', 'ineffective'].includes(s);
}

// ─── Action logic per control ────────────────────────────────────────────────

function getControlAction(ctrl: ControlDetail): { label: string; icon: React.ElementType; cls: string } {
  if (ctrl.status === 'not-started' && ctrl.populationStatus === 'none')
    return { label: 'Upload Population', icon: Upload, cls: 'bg-primary/10 text-primary hover:bg-primary/20' };
  if (ctrl.status === 'not-started' || ctrl.status === 'population-pending')
    return { label: 'Generate Samples', icon: Database, cls: 'bg-primary/10 text-primary hover:bg-primary/20' };
  if (ctrl.status === 'in-progress' && ctrl.samples.some(s => s.status === 'not-tested'))
    return { label: 'Continue Testing', icon: Target, cls: 'bg-evidence-50 text-evidence-700 hover:bg-evidence-50/80' };
  if (ctrl.status === 'in-progress' && ctrl.samples.every(s => s.status !== 'not-tested'))
    return { label: 'Submit Review', icon: Eye, cls: 'bg-brand-50 text-brand-700 hover:bg-brand-50/80' };
  if (ctrl.status === 'pending-review')
    return { label: 'Review', icon: Eye, cls: 'bg-mitigated-50 text-mitigated-700 hover:bg-mitigated-50/80' };
  if (isConcluded(ctrl.status))
    return { label: 'View', icon: Eye, cls: 'bg-surface-2 text-text-muted hover:bg-surface-2/80' };
  return { label: 'Open', icon: ChevronRight, cls: 'bg-surface-2 text-text-muted hover:bg-surface-2/80' };
}

type TabId = 'controls' | 'review-queue' | 'findings';
type StatusFilter = 'all' | 'not-started' | 'in-progress' | 'pending-review' | 'concluded' | 'failed';

// ─── Component ───────────────────────────────────────────────────────────────

// Reset controls to clean Not Started state for fresh engagements
function resetControlsToClean(controls: ControlDetail[]): ControlDetail[] {
  return controls.map(c => ({
    ...c,
    status: 'not-started' as ControlStatus,
    result: '' as const,
    conclusion: '',
    populationStatus: 'none' as const,
    populationSize: 0,
    populationSource: '',
    samplingMethod: '',
    samples: [],
    sampleCount: 0,
    samplesTested: 0,
    exceptions: 0,
    evidenceCount: 0,
    lastUpdated: '—',
    testingRound: 0,
    workingPaper: { ...c.workingPaper, rounds: [], comments: [] },
    auditTrail: [],
  }));
}

interface Props {
  engagementId?: string;
  freshActivation?: boolean;
  onBack: () => void;
  onOpenControl: (controlId: string) => void;
}

export default function EngagementDetailView({ engagementId, freshActivation, onBack, onOpenControl }: Props) {
  const eng = ENGAGEMENT;

  // Use clean controls for fresh activations, seeded data for demo engagement
  const isDemoEngagement = engagementId === 'ap-1' || engagementId === 'eng-sox-fy26' || !engagementId;
  const sourceControls = (freshActivation && !isDemoEngagement) ? resetControlsToClean(CONTROLS) : CONTROLS;

  const [search, setSearch] = useState('');
  const [domainFilter, setDomainFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [activeTab, setActiveTab] = useState<TabId>('controls');
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [showCloseModal, setShowCloseModal] = useState(false);

  const domains = ['All', ...Array.from(new Set(sourceControls.map(c => c.domain)))];

  const filteredControls = sourceControls.filter(c => {
    if (domainFilter !== 'All' && c.domain !== domainFilter) return false;
    if (statusFilter !== 'all') {
      if (statusFilter === 'not-started' && c.status !== 'not-started' && c.status !== 'population-pending') return false;
      if (statusFilter === 'in-progress' && c.status !== 'in-progress') return false;
      if (statusFilter === 'pending-review' && c.status !== 'pending-review') return false;
      if (statusFilter === 'concluded' && !isConcluded(c.status)) return false;
      if (statusFilter === 'failed' && c.status !== 'ineffective') return false;
    }
    if (search) {
      const q = search.toLowerCase();
      return c.controlId.toLowerCase().includes(q) || c.controlName.toLowerCase().includes(q) || c.domain.toLowerCase().includes(q) || c.assignee.toLowerCase().includes(q) || c.workflowName.toLowerCase().includes(q);
    }
    return true;
  });

  // KPIs
  const totalControls = sourceControls.length;
  const readyControls = sourceControls.filter(c => c.status === 'not-started' && c.populationStatus === 'none').length;
  const populationPending = sourceControls.filter(c => c.status === 'population-pending' || (c.status === 'not-started' && c.populationStatus !== 'none')).length;
  const wip = sourceControls.filter(c => c.status === 'in-progress').length;
  const pendingReview = sourceControls.filter(c => c.status === 'pending-review').length;
  const concluded = sourceControls.filter(c => isConcluded(c.status)).length;
  const deficient = sourceControls.filter(c => c.status === 'ineffective').length;

  // Progress
  const progressPct = totalControls > 0 ? Math.round((concluded / totalControls) * 100) : 0;
  const canClose = concluded === totalControls && totalControls > 0 && pendingReview === 0;

  // Reviewer queue
  const reviewQueue = sourceControls.filter(c => c.status === 'pending-review');

  // Next Best Actions
  const nextActions: { label: string; desc: string; icon: React.ElementType; cls: string; count: number }[] = [];
  if (readyControls > 0) nextActions.push({ label: 'Upload Population', desc: `${readyControls} controls awaiting population data`, icon: Upload, cls: 'text-primary border-primary/20 bg-primary/5 hover:bg-primary/10', count: readyControls });
  if (populationPending > 0) nextActions.push({ label: 'Generate Samples', desc: `${populationPending} controls with population ready`, icon: Database, cls: 'text-brand-700 border-brand/20 bg-brand-50/50 hover:bg-brand-50', count: populationPending });
  if (wip > 0) nextActions.push({ label: 'Continue Testing', desc: `${wip} controls with testing in progress`, icon: Target, cls: 'text-evidence-700 border-evidence/20 bg-evidence-50/50 hover:bg-evidence-50', count: wip });
  if (pendingReview > 0) nextActions.push({ label: 'Review Pending', desc: `${pendingReview} controls awaiting reviewer approval`, icon: Eye, cls: 'text-mitigated-700 border-mitigated/20 bg-mitigated-50/50 hover:bg-mitigated-50', count: pendingReview });
  if (deficient > 0) nextActions.push({ label: 'Address Failures', desc: `${deficient} controls concluded as ineffective`, icon: AlertTriangle, cls: 'text-risk-700 border-risk/20 bg-risk-50/50 hover:bg-risk-50', count: deficient });

  return (
    <div className="h-full overflow-y-auto bg-white bg-mesh-gradient relative">
      <Orb hoverIntensity={0.06} rotateOnHover hue={275} opacity={0.05} />

      <div className="p-8 relative">
        {/* Back */}
        <button onClick={onBack} className="flex items-center gap-1.5 text-[12px] text-text-muted hover:text-primary font-medium mb-4 cursor-pointer transition-colors">
          <ArrowLeft size={14} />Back to Planning
        </button>

        {/* ── HEADER ── */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-bold text-text">{eng.name}</h1>
              <span className="px-2.5 h-6 rounded-full text-[11px] font-semibold bg-compliant-50 text-compliant-700 inline-flex items-center">{eng.status}</span>
            </div>
            <p className="text-[13px] text-text-secondary mt-1 max-w-2xl">{eng.description}</p>
          </div>
          {canClose && (
            <button onClick={() => setShowCloseModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary to-primary-medium hover:brightness-110 text-white rounded-xl text-[12px] font-bold transition-all cursor-pointer shrink-0">
              <Lock size={14} />Close Engagement
            </button>
          )}
        </div>

        {/* ── METADATA STRIP ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 mb-6">
          {[
            { label: 'Audit Type', value: eng.auditType, icon: Shield },
            { label: 'Framework', value: eng.framework, icon: Target },
            { label: 'Audit Period', value: `${eng.auditPeriodStart} — ${eng.auditPeriodEnd}`, icon: Calendar },
            { label: 'RACM Version', value: eng.racmVersion, icon: FileText },
            { label: 'Snapshot', value: eng.snapshotId, icon: Copy },
            { label: 'Owner', value: eng.owner, icon: Users },
            { label: 'Reviewer', value: eng.reviewer, icon: Eye },
            { label: 'Activated', value: eng.activatedAt, icon: Zap },
          ].map(m => (
            <div key={m.label} className="glass-card rounded-xl p-2.5">
              <div className="flex items-center gap-1 mb-0.5"><m.icon size={10} className="text-text-muted" /><span className="text-[9px] font-semibold text-text-muted uppercase">{m.label}</span></div>
              <div className="text-[11px] font-medium text-text truncate" title={m.value}>{m.value}</div>
            </div>
          ))}
        </div>

        {/* ── FIRST-TIME ONBOARDING ── */}
        {showOnboarding && sourceControls.every(c => c.status === 'not-started' || c.status === 'population-pending') && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <div className="rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/[0.03] to-brand-50/30 p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-primary-medium"><Play size={16} className="text-white" /></div>
                  <div>
                    <h3 className="text-[14px] font-bold text-text">Welcome to Your Audit Workspace</h3>
                    <p className="text-[12px] text-text-muted mt-0.5">Engagement activated by {eng.activatedBy}. Follow these steps to begin.</p>
                  </div>
                </div>
                <button onClick={() => setShowOnboarding(false)} className="p-1.5 rounded-lg hover:bg-surface-2 cursor-pointer"><X size={14} className="text-text-muted" /></button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { step: 1, icon: Upload, label: 'Upload Population', desc: 'Upload data source for each control.', color: 'text-evidence-700 bg-evidence-50' },
                  { step: 2, icon: Database, label: 'Generate Samples', desc: 'Select sampling method and generate samples.', color: 'text-brand-700 bg-brand-50' },
                  { step: 3, icon: Target, label: 'Start Testing', desc: 'Evaluate samples against workflow attributes.', color: 'text-compliant-700 bg-compliant-50' },
                ].map(s => (
                  <div key={s.step} className="glass-card rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white bg-gradient-to-br from-primary to-primary-medium">{s.step}</div>
                      <div className={`p-1 rounded-lg ${s.color}`}><s.icon size={12} /></div>
                    </div>
                    <p className="text-[12px] font-semibold text-text mb-1">{s.label}</p>
                    <p className="text-[10px] text-text-muted leading-relaxed">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Not Configured Warning — when all controls are not-started and have no population */}
        {!showOnboarding && sourceControls.every(c => c.status === 'not-started') && sourceControls.every(c => c.populationStatus === 'none') && (
          <div className="mb-6 rounded-xl border-2 border-high/20 bg-high-50/20 p-4">
            <div className="flex items-center gap-3">
              <Settings size={18} className="text-high-700" />
              <div>
                <p className="text-[13px] font-semibold text-high-700">Engagement activated, but controls need configuration</p>
                <p className="text-[11px] text-high-700/80 mt-0.5">All {sourceControls.length} controls are awaiting population data and workflow configuration before execution can begin. Click any control below to start.</p>
              </div>
            </div>
          </div>
        )}

        {/* ── EXECUTION PROGRESS ── */}
        <div className="glass-card rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2"><BarChart3 size={14} className="text-primary" /><span className="text-[13px] font-semibold text-text">Execution Progress</span></div>
            <span className="text-[14px] font-bold text-primary tabular-nums">{progressPct}%</span>
          </div>
          <div className="h-2.5 bg-surface-3 rounded-full overflow-hidden mb-3">
            <motion.div initial={{ width: 0 }} animate={{ width: `${progressPct}%` }} transition={{ duration: 0.8 }} className="h-full rounded-full bg-gradient-to-r from-primary to-primary-medium" />
          </div>
          <div className="flex items-center gap-4 text-[11px] flex-wrap">
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-draft" /><span className="text-text-muted">Ready <strong className="text-text">{readyControls}</strong></span></div>
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-high" /><span className="text-text-muted">Pop. Pending <strong className="text-text">{populationPending}</strong></span></div>
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-evidence" /><span className="text-text-muted">In Progress <strong className="text-text">{wip}</strong></span></div>
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-mitigated" /><span className="text-text-muted">Pending Review <strong className="text-text">{pendingReview}</strong></span></div>
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-compliant" /><span className="text-text-muted">Concluded <strong className="text-text">{concluded}</strong></span></div>
            {deficient > 0 && <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-risk" /><span className="text-text-muted">Failed <strong className="text-risk-700">{deficient}</strong></span></div>}
          </div>
        </div>

        {/* ── EXECUTION KPI CARDS ── */}
        <div className="grid grid-cols-6 gap-3 mb-6">
          {[
            { label: 'Total Controls', value: totalControls, color: 'text-text' },
            { label: 'Ready', value: readyControls, color: 'text-brand-700' },
            { label: 'In Progress', value: wip, color: 'text-evidence-700' },
            { label: 'Pending Review', value: pendingReview, color: 'text-mitigated-700' },
            { label: 'Concluded', value: concluded, color: 'text-compliant-700' },
            { label: 'Failed', value: deficient, color: 'text-risk-700' },
          ].map(kpi => (
            <div key={kpi.label} className="glass-card rounded-xl p-3 text-center">
              <div className={`text-xl font-bold tabular-nums ${kpi.color}`}>{kpi.value}</div>
              <div className="text-[11px] text-text-muted mt-0.5">{kpi.label}</div>
            </div>
          ))}
        </div>

        {/* ── NEXT BEST ACTIONS ── */}
        {nextActions.length > 0 && (
          <div className="mb-6">
            <h3 className="text-[13px] font-semibold text-text mb-3 flex items-center gap-2"><Zap size={14} className="text-primary" />Next Best Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {nextActions.map(action => (
                <div key={action.label} className={`flex items-center gap-3 p-3.5 rounded-xl border transition-colors cursor-pointer ${action.cls}`}>
                  <div className="p-2 rounded-lg bg-white/60 shrink-0"><action.icon size={16} /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[12px] font-semibold">{action.label}</p>
                      <span className="text-[10px] font-bold bg-white/60 px-1.5 py-0.5 rounded-full tabular-nums">{action.count}</span>
                    </div>
                    <p className="text-[10px] opacity-80 mt-0.5">{action.desc}</p>
                  </div>
                  <ArrowRight size={14} className="shrink-0 opacity-50" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TABS ── */}
        <div className="flex items-center border-b border-border-light mb-4">
          <button onClick={() => setActiveTab('controls')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors cursor-pointer ${activeTab === 'controls' ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text-secondary'}`}>
            <ShieldCheck size={14} />Controls
            <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === 'controls' ? 'bg-primary/10 text-primary' : 'bg-paper-50 text-ink-500'}`}>{sourceControls.length}</span>
          </button>
          <button onClick={() => setActiveTab('review-queue')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors cursor-pointer ${activeTab === 'review-queue' ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text-secondary'}`}>
            <Eye size={14} />Review Queue
            {pendingReview > 0 && <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full bg-mitigated-50 text-mitigated-700">{pendingReview}</span>}
          </button>
          <button onClick={() => setActiveTab('findings')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors cursor-pointer ${activeTab === 'findings' ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text-secondary'}`}>
            <AlertTriangle size={14} />Findings
            {FINDINGS.length > 0 && <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full bg-risk-50 text-risk-700">{FINDINGS.length}</span>}
          </button>
        </div>

        {/* ══ CONTROLS TAB ══ */}
        {activeTab === 'controls' && (
          <>
            {/* Filters */}
            <div className="flex items-center gap-4 mb-4 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-bold text-text-muted">Status:</span>
                <div className="flex gap-1 flex-wrap">
                  {([['all', 'All'], ['not-started', 'Ready'], ['in-progress', 'In Progress'], ['pending-review', 'Review'], ['concluded', 'Concluded'], ['failed', 'Failed']] as [StatusFilter, string][]).map(([key, label]) => (
                    <button key={key} onClick={() => setStatusFilter(key)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${statusFilter === key ? 'bg-primary text-white' : 'bg-surface-2 text-text-muted hover:bg-primary/10 hover:text-primary'}`}>{label}</button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-bold text-text-muted">Domain:</span>
                <div className="flex gap-1 flex-wrap">
                  {domains.map(d => (
                    <button key={d} onClick={() => setDomainFilter(d)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${domainFilter === d ? 'bg-primary text-white' : 'bg-surface-2 text-text-muted hover:bg-primary/10 hover:text-primary'}`}>{d}</button>
                  ))}
                </div>
              </div>
              <div className="flex-1" />
              <div className="relative w-52">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-[12px] bg-white border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all placeholder:text-text-muted" />
              </div>
            </div>

            {/* Controls Execution Table */}
            <div className="glass-card rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="border-b border-border bg-surface-2/50">
                      {['Control', 'Process', 'Key', 'Workflow', 'Execution Status', 'Population', 'Samples', 'Evidence', 'Reviewer', 'Action'].map(h => (
                        <th key={h} className="px-3 py-3 text-left text-[10px] font-semibold text-text-muted uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredControls.map((row, i) => {
                      const action = getControlAction(row);
                      const samplesWithEvidence = row.samples.filter(s => s.evidenceFiles.length > 0).length;
                      const evidencePct = row.samples.length > 0 ? Math.round((samplesWithEvidence / row.samples.length) * 100) : 0;
                      const popLabel = row.populationStatus === 'snapshot-created' ? 'Locked' : row.populationStatus === 'uploaded' ? 'Uploaded' : 'None';
                      const popCls = row.populationStatus === 'snapshot-created' ? 'text-compliant-700' : row.populationStatus === 'uploaded' ? 'text-evidence-700' : 'text-ink-400';

                      return (
                        <motion.tr key={row.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                          onClick={() => onOpenControl(row.id)}
                          className="border-b border-border/50 hover:bg-brand-50/30 transition-colors cursor-pointer group">
                          <td className="px-3 py-3">
                            <span className="text-[10px] font-mono text-text-muted">{row.controlId}</span>
                            <div className="text-[12px] font-medium text-text max-w-[160px] truncate">{row.controlName}</div>
                          </td>
                          <td className="px-3 py-3"><span className="text-[11px] text-text-secondary">{row.domain}</span></td>
                          <td className="px-3 py-3 text-center">
                            {row.isKey ? <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-mitigated-50 text-mitigated-700 text-[10px] font-bold">K</span> : <span className="text-ink-300">—</span>}
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-1">
                              <Workflow size={10} className="text-brand-500 shrink-0" />
                              <span className="text-[10px] font-medium text-brand-700 truncate max-w-[90px]">{row.workflowName}</span>
                            </div>
                            <span className="text-[9px] text-text-muted">{row.workflowVersion} · {row.workflowAttributes.length} attrs</span>
                          </td>
                          <td className="px-3 py-3"><StatusPill status={row.status} /></td>
                          <td className="px-3 py-3"><span className={`text-[11px] font-semibold ${popCls}`}>{popLabel}</span></td>
                          <td className="px-3 py-3">
                            {row.sampleCount > 0 ? <span className="text-[11px] tabular-nums text-text-secondary">{row.samplesTested}/{row.sampleCount}</span> : <span className="text-ink-300 text-[10px]">—</span>}
                          </td>
                          <td className="px-3 py-3">
                            {row.samples.length > 0 ? (
                              <span className={`text-[10px] font-bold ${evidencePct === 100 ? 'text-compliant-700' : evidencePct > 0 ? 'text-high-700' : 'text-ink-400'}`}>{evidencePct}%</span>
                            ) : <span className="text-ink-300 text-[10px]">—</span>}
                          </td>
                          <td className="px-3 py-3">
                            {row.workingPaper.rounds.some(r => r.reviewerStatus === 'approved')
                              ? <span className="text-[10px] font-bold text-compliant-700">Approved</span>
                              : row.status === 'pending-review'
                                ? <span className="text-[10px] font-bold text-mitigated-700">Pending</span>
                                : <span className="text-ink-300 text-[10px]">—</span>}
                          </td>
                          <td className="px-3 py-3">
                            <span className={`text-[10px] font-bold px-2 py-1 rounded-lg cursor-pointer transition-colors inline-flex items-center gap-1 ${action.cls}`}>
                              <action.icon size={10} />{action.label}
                            </span>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-surface-2/30">
                <span className="text-[11px] text-text-muted">Showing {filteredControls.length} of {sourceControls.length} controls</span>
              </div>
            </div>
          </>
        )}

        {/* ══ REVIEW QUEUE TAB ══ */}
        {activeTab === 'review-queue' && (
          <div>
            {reviewQueue.length === 0 ? (
              <div className="text-center py-16">
                <CheckCircle2 size={32} className="text-compliant mx-auto mb-3" />
                <p className="text-[14px] font-semibold text-text">No pending reviews</p>
                <p className="text-[12px] text-text-muted mt-1">All submitted controls have been reviewed.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="glass-card rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div><span className="text-[11px] font-bold text-text-muted uppercase">Reviewer</span><p className="text-[13px] font-semibold text-text">{eng.reviewer}</p></div>
                    <div className="flex items-center gap-4">
                      <div className="text-center"><div className="text-lg font-bold text-mitigated-700 tabular-nums">{reviewQueue.length}</div><div className="text-[10px] text-text-muted">Pending</div></div>
                      <div className="text-center"><div className="text-lg font-bold text-risk-700 tabular-nums">{reviewQueue.filter(c => c.exceptions > 0).length}</div><div className="text-[10px] text-text-muted">Exceptions</div></div>
                    </div>
                  </div>
                </div>
                {reviewQueue.map(ctrl => {
                  const passed = ctrl.samples.filter(s => s.status === 'pass').length;
                  const failed = ctrl.samples.filter(s => s.status === 'fail' || s.status === 'exception').length;
                  return (
                    <div key={ctrl.id} className={`glass-card rounded-xl p-5 ${ctrl.exceptions > 0 ? 'border-l-4 border-l-risk' : ''}`}>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-mono text-text-muted">{ctrl.controlId}</span>
                            {ctrl.isKey && <span className="px-1.5 h-4 rounded text-[9px] font-bold bg-mitigated-50 text-mitigated-700 inline-flex items-center">KEY</span>}
                            {ctrl.exceptions > 0 && <span className="px-1.5 h-4 rounded text-[9px] font-bold bg-risk-50 text-risk-700 inline-flex items-center">{ctrl.exceptions} EXCEPTIONS</span>}
                          </div>
                          <h3 className="text-[13px] font-semibold text-text">{ctrl.controlName}</h3>
                          <span className="text-[11px] text-text-muted">Submitted by {ctrl.assignee}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-2 mb-3">
                        <div className="text-center p-2 rounded-lg bg-surface-2/50"><div className="text-[14px] font-bold text-text tabular-nums">{ctrl.samplesTested}/{ctrl.sampleCount}</div><div className="text-[9px] text-text-muted">Samples</div></div>
                        <div className="text-center p-2 rounded-lg bg-surface-2/50"><div className="text-[14px] font-bold text-compliant-700 tabular-nums">{passed}</div><div className="text-[9px] text-text-muted">Passed</div></div>
                        <div className="text-center p-2 rounded-lg bg-surface-2/50"><div className={`text-[14px] font-bold tabular-nums ${failed > 0 ? 'text-risk-700' : 'text-text-muted'}`}>{failed}</div><div className="text-[9px] text-text-muted">Failed</div></div>
                        <div className="text-center p-2 rounded-lg bg-surface-2/50"><div className="text-[14px] font-bold text-text tabular-nums">{ctrl.evidenceCount}</div><div className="text-[9px] text-text-muted">Evidence</div></div>
                      </div>
                      {ctrl.conclusion && <div className="p-3 bg-surface-2/40 rounded-lg mb-3"><span className="text-[10px] font-bold text-text-muted uppercase">Tester Conclusion</span><p className="text-[12px] text-text-secondary mt-0.5">{ctrl.conclusion}</p></div>}
                      <div className="flex items-center gap-3">
                        <button onClick={() => onOpenControl(ctrl.id)} className="flex items-center gap-1.5 px-3 py-2 bg-primary/10 text-primary rounded-lg text-[11px] font-semibold hover:bg-primary/20 transition-colors cursor-pointer"><Eye size={12} />Review Detail</button>
                        <button className="flex items-center gap-1.5 px-3 py-2 bg-compliant hover:brightness-110 text-white rounded-lg text-[11px] font-semibold transition-all cursor-pointer"><CheckCircle2 size={12} />Approve</button>
                        <button className="flex items-center gap-1.5 px-3 py-2 border border-risk text-risk-700 hover:bg-risk-50 rounded-lg text-[11px] font-semibold transition-all cursor-pointer"><XCircle size={12} />Reject</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ══ FINDINGS TAB ══ */}
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
                    onClick={() => { const ctrl = sourceControls.find(c => c.controlId === f.controlId); if (ctrl) onOpenControl(ctrl.id); }}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-mono font-bold text-risk-700">{f.id}</span>
                        <span className={`px-2.5 h-6 rounded-full text-[11px] font-semibold inline-flex items-center ${f.severity === 'Material Weakness' ? 'bg-risk-50 text-risk-700' : f.severity === 'Significant Deficiency' ? 'bg-high-50 text-high-700' : 'bg-mitigated-50 text-mitigated-700'}`}>{f.severity}</span>
                        <span className={`px-2.5 h-6 rounded-full text-[11px] font-semibold inline-flex items-center ${f.status === 'Open' ? 'bg-risk-50 text-risk-700' : 'bg-compliant-50 text-compliant-700'}`}>{f.status}</span>
                      </div>
                      <span className="text-[11px] text-text-muted">Due: {f.remediationDueDate}</span>
                    </div>
                    <h3 className="text-[13px] font-semibold text-text mb-2">{f.title}</h3>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div><span className="text-text-muted">Control: </span><span className="text-text font-medium">{f.controlName}</span></div>
                      <div><span className="text-text-muted">Owner: </span><span className="text-text font-medium">{f.owner}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── CLOSE ENGAGEMENT MODAL ── */}
      <AnimatePresence>
        {showCloseModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm" onClick={() => setShowCloseModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setShowCloseModal(false)}>
              <div className="bg-white rounded-2xl shadow-2xl border border-border-light max-w-md w-full mx-4 p-6" onClick={e => e.stopPropagation()}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-primary-medium"><Lock size={16} className="text-white" /></div>
                  <h3 className="text-[15px] font-bold text-text">Close Engagement</h3>
                </div>
                <div className="space-y-2 mb-5">
                  {[
                    { icon: Lock, label: 'Lock engagement permanently', desc: 'No further testing or evidence changes' },
                    { icon: FileText, label: 'Generate final working papers', desc: 'System compiles all round data and conclusions' },
                    { icon: Database, label: 'Freeze all execution data', desc: 'Samples, evidence, and results become immutable' },
                  ].map((step, i) => (
                    <motion.div key={step.label} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-surface-2/50">
                      <div className="p-1.5 rounded-lg bg-brand-50 text-brand-700 shrink-0"><step.icon size={13} /></div>
                      <div><p className="text-[12px] font-semibold text-text">{step.label}</p><p className="text-[10px] text-text-muted">{step.desc}</p></div>
                    </motion.div>
                  ))}
                </div>
                <div className="p-3 bg-surface-2 rounded-xl mb-5 text-[12px] space-y-1">
                  <div className="flex justify-between"><span className="text-text-muted">Concluded</span><span className="font-semibold text-compliant-700">{concluded}/{totalControls}</span></div>
                  <div className="flex justify-between"><span className="text-text-muted">Effective</span><span className="font-semibold text-compliant-700">{sourceControls.filter(c => c.status === 'effective').length}</span></div>
                  <div className="flex justify-between"><span className="text-text-muted">Ineffective</span><span className="font-semibold text-risk-700">{deficient}</span></div>
                  <div className="flex justify-between"><span className="text-text-muted">Findings</span><span className="font-semibold text-text">{FINDINGS.length}</span></div>
                </div>
                <div className="flex items-center gap-3 justify-end">
                  <button onClick={() => setShowCloseModal(false)} className="px-4 py-2 border border-border rounded-lg text-[12px] font-medium text-text-secondary hover:bg-surface-2 transition-colors cursor-pointer">Cancel</button>
                  <button onClick={() => setShowCloseModal(false)} className="px-5 py-2.5 bg-gradient-to-r from-primary to-primary-medium hover:brightness-110 text-white rounded-xl text-[12px] font-bold transition-all cursor-pointer flex items-center gap-2"><Lock size={13} />Close Engagement</button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
