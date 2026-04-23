import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, Calendar, Shield, Users, ShieldCheck, AlertTriangle,
  Clock, CheckCircle2, XCircle, Search, ChevronRight, Workflow,
  FileText, Zap, Eye, Target, BarChart3, Play, Copy, Filter
} from 'lucide-react';
import Orb from '../shared/Orb';

// ─── Types ───────────────────────────────────────────────────────────────────

type ControlStatus = 'not-started' | 'population-pending' | 'in-progress' | 'pending-review' | 'effective' | 'partially-effective' | 'ineffective';

interface EngagementControl {
  id: string;
  controlId: string;
  controlName: string;
  domain: string;
  isKey: boolean;
  status: ControlStatus;
  workflowName: string;
  workflowVersion: string;
  attributeCount: number;
  sampleCount: number;
  samplesTested: number;
  exceptions: number;
  result: 'Effective' | 'Partially Effective' | 'Ineffective' | 'Pending' | '';
  lastUpdated: string;
  assignee: string;
  evidenceCount: number;
}

interface EngagementMeta {
  id: string;
  name: string;
  auditType: string;
  framework: string;
  auditPeriodStart: string;
  auditPeriodEnd: string;
  plannedStart: string;
  plannedEnd: string;
  actualStart: string;
  owner: string;
  reviewer: string;
  description: string;
  racmVersion: string;
  snapshotId: string;
  status: string;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const ENGAGEMENT: EngagementMeta = {
  id: 'ap-1',
  name: 'P2P — SOX Audit FY26',
  auditType: 'SOX',
  framework: 'COSO',
  auditPeriodStart: 'Apr 1, 2025',
  auditPeriodEnd: 'Mar 31, 2026',
  plannedStart: 'Apr 1, 2025',
  plannedEnd: 'Jun 30, 2025',
  actualStart: 'Apr 5, 2025',
  owner: 'Tushar Goel',
  reviewer: 'Karan Mehta',
  description: 'Comprehensive SOX audit covering AP, PO, and vendor master controls with focus on segregation of duties and transaction authorization.',
  racmVersion: 'RACM v2.1',
  snapshotId: 'snap-001',
  status: 'Active',
};

const CONTROLS: EngagementControl[] = [
  {
    id: 'ec-001', controlId: 'CTR-003', controlName: 'Three-way PO/GRN/Invoice matching',
    domain: 'P2P — Vendor Payment', isKey: true, status: 'in-progress',
    workflowName: 'Three-Way PO Match', workflowVersion: 'v2.0', attributeCount: 5,
    sampleCount: 40, samplesTested: 32, exceptions: 3,
    result: 'Pending', lastUpdated: 'Apr 18, 2026', assignee: 'Tushar Goel', evidenceCount: 5,
  },
  {
    id: 'ec-002', controlId: 'CTR-005', controlName: 'Duplicate invoice detection workflow',
    domain: 'P2P — Vendor Payment', isKey: true, status: 'effective',
    workflowName: 'Duplicate Invoice Detector', workflowVersion: 'v1.4', attributeCount: 4,
    sampleCount: 25, samplesTested: 25, exceptions: 0,
    result: 'Effective', lastUpdated: 'Apr 15, 2026', assignee: 'Deepak Bansal', evidenceCount: 3,
  },
  {
    id: 'ec-003', controlId: 'CTR-001', controlName: 'PO dual sign-off approval workflow',
    domain: 'P2P — Purchase Order', isKey: false, status: 'pending-review',
    workflowName: 'PO Approval Validator', workflowVersion: 'v1.2', attributeCount: 3,
    sampleCount: 20, samplesTested: 20, exceptions: 1,
    result: 'Pending', lastUpdated: 'Apr 16, 2026', assignee: 'Neha Joshi', evidenceCount: 4,
  },
  {
    id: 'ec-004', controlId: 'CTR-007', controlName: 'Revenue recognition compliance check',
    domain: 'O2C — Invoice Mgmt', isKey: true, status: 'population-pending',
    workflowName: 'Revenue Recognition Checker', workflowVersion: 'v1.0', attributeCount: 4,
    sampleCount: 0, samplesTested: 0, exceptions: 0,
    result: '', lastUpdated: 'Apr 10, 2026', assignee: 'Karan Mehta', evidenceCount: 0,
  },
  {
    id: 'ec-005', controlId: 'CTR-002', controlName: 'Automated credit limit monitoring',
    domain: 'O2C — Invoice Mgmt', isKey: false, status: 'ineffective',
    workflowName: 'Credit Limit Validation', workflowVersion: 'v2.1', attributeCount: 4,
    sampleCount: 25, samplesTested: 25, exceptions: 3,
    result: 'Ineffective', lastUpdated: 'Apr 14, 2026', assignee: 'Sneha Desai', evidenceCount: 2,
  },
  {
    id: 'ec-006', controlId: 'CTR-008', controlName: 'Journal entry management review',
    domain: 'R2R — Financial Close', isKey: true, status: 'effective',
    workflowName: 'Journal Entry Anomaly Detector', workflowVersion: 'v3.0', attributeCount: 5,
    sampleCount: 30, samplesTested: 30, exceptions: 0,
    result: 'Effective', lastUpdated: 'Apr 12, 2026', assignee: 'Rohan Patel', evidenceCount: 4,
  },
  {
    id: 'ec-007', controlId: 'CTR-004', controlName: 'GL reconciliation — monthly auto',
    domain: 'R2R — Financial Close', isKey: true, status: 'in-progress',
    workflowName: 'GL Reconciliation', workflowVersion: 'v1.5', attributeCount: 3,
    sampleCount: 15, samplesTested: 8, exceptions: 0,
    result: 'Pending', lastUpdated: 'Apr 17, 2026', assignee: 'Priya Singh', evidenceCount: 2,
  },
  {
    id: 'ec-008', controlId: 'CTR-006', controlName: 'SOD violation detector real-time',
    domain: 'P2P — Vendor Payment', isKey: false, status: 'not-started',
    workflowName: 'SOD Violation Detector', workflowVersion: 'v1.1', attributeCount: 4,
    sampleCount: 0, samplesTested: 0, exceptions: 0,
    result: '', lastUpdated: '—', assignee: 'Tushar Goel', evidenceCount: 0,
  },
];

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

  const domains = ['All', ...Array.from(new Set(CONTROLS.map(c => c.domain)))];

  const filtered = CONTROLS.filter(c => {
    if (domainFilter !== 'All' && c.domain !== domainFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return c.controlId.toLowerCase().includes(q) || c.controlName.toLowerCase().includes(q) || c.domain.toLowerCase().includes(q) || c.assignee.toLowerCase().includes(q);
    }
    return true;
  });

  // KPI calculations
  const totalControls = CONTROLS.length;
  const keyControls = CONTROLS.filter(c => c.isKey).length;
  const wip = CONTROLS.filter(c => ['in-progress', 'population-pending'].includes(c.status)).length;
  const pendingReview = CONTROLS.filter(c => c.status === 'pending-review').length;
  const concluded = CONTROLS.filter(c => ['effective', 'partially-effective', 'ineffective'].includes(c.status)).length;
  const deficient = CONTROLS.filter(c => c.status === 'ineffective' || c.exceptions > 0).length;

  return (
    <div className="h-full overflow-y-auto bg-white bg-mesh-gradient relative">
      <Orb hoverIntensity={0.06} rotateOnHover hue={275} opacity={0.05} />

      <div className="p-8 relative">
        {/* Back + Header */}
        <button onClick={onBack} className="flex items-center gap-1.5 text-[12px] text-text-muted hover:text-primary font-medium mb-4 cursor-pointer transition-colors">
          <ArrowLeft size={14} />
          Back to Planning
        </button>

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
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
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

        {/* Filters + Search */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-bold text-text-muted">Domain:</span>
            <div className="flex gap-1">
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
              className="w-full pl-8 pr-3 py-2 text-[12px] bg-white border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all placeholder:text-text-muted"
            />
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
                {filtered.map((row, i) => (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    onClick={() => onOpenControl(row.id)}
                    className="border-b border-border/50 hover:bg-brand-50/30 transition-colors cursor-pointer group"
                  >
                    <td className="px-4 py-3">
                      <div>
                        <span className="text-[10px] font-mono text-text-muted">{row.controlId}</span>
                        <div className="text-[12px] font-medium text-text">{row.controlName}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[11px] text-text-secondary">{row.domain}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {row.isKey ? (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-mitigated-50 text-mitigated-700 text-[10px] font-bold">K</span>
                      ) : <span className="text-ink-300">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Workflow size={10} className="text-brand-500 shrink-0" />
                        <div>
                          <span className="text-[11px] font-medium text-brand-700">{row.workflowName}</span>
                          <span className="text-[10px] text-text-muted ml-1">{row.workflowVersion} · {row.attributeCount} attrs</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill status={row.status} />
                    </td>
                    <td className="px-4 py-3">
                      {row.sampleCount > 0 ? (
                        <span className="text-[12px] tabular-nums text-text-secondary">
                          {row.samplesTested}/{row.sampleCount}
                        </span>
                      ) : <span className="text-ink-300 text-[11px]">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      {row.exceptions > 0 ? (
                        <span className="text-[12px] font-semibold text-risk-700 tabular-nums">{row.exceptions}</span>
                      ) : <span className="text-ink-300 text-[11px]">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <ResultPill result={row.result} />
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[11px] text-text-muted">{row.lastUpdated}</span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-surface-2/30">
            <span className="text-[11px] text-text-muted">Showing {filtered.length} of {CONTROLS.length} controls</span>
          </div>
        </div>
      </div>
    </div>
  );
}
