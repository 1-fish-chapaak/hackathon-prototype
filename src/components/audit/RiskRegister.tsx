import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles, Download, ExternalLink, AlertTriangle, Shield,
  ChevronDown, ChevronRight, Info, Eye, FileText, Plus,
  Link2, CheckCircle2, XCircle, Clock, Search, Filter,
  ArrowRight, ShieldCheck, Layers, Activity
} from 'lucide-react';
import { RISKS, CONTROLS, BUSINESS_PROCESSES, RACMS, ENGAGEMENTS } from '../../data/mockData';
import { SeverityBadge } from '../shared/StatusBadge';
import Orb from '../shared/Orb';
import { useToast } from '../shared/Toast';

// ─── Types ──────────────────────────────────────────────────────────────────

type DerivedStatus = 'stable' | 'at-risk' | 'unvalidated' | 'needs-mapping' | 'partially-covered';
type ProcessFilter = 'All' | 'P2P' | 'O2C' | 'R2R' | 'S2C' | 'ITGC' | 'Cross';
type RacmFilter = string;
type FrameworkFilter = 'All' | 'SOX' | 'IFC' | 'Internal' | 'Compliance';
type StatusFilter = 'All' | 'stable' | 'at-risk' | 'unvalidated' | 'needs-mapping' | 'partially-covered';
type CoverageFilter = 'All' | 'has-key' | 'no-key' | 'no-controls';
type SeverityFilter = 'All' | 'critical' | 'high' | 'medium' | 'low';

interface EnrichedRisk {
  id: string;
  name: string;
  severity: string;
  bpId: string;
  bpAbbr: string;
  bpColor: string;
  racmId: string;
  racmName: string;
  racmVersion: string;
  framework: string;
  ctls: number;
  keyCtls: number;
  mappedControls: typeof CONTROLS[number][];
  derivedStatus: DerivedStatus;
  latestEngagement: string | null;
  lastTested: string | null;
}

// ─── Derive risk status from control data ───────────────────────────────────

function deriveStatus(risk: typeof RISKS[number], controls: typeof CONTROLS): DerivedStatus {
  const mapped = controls.filter(c => c.riskId === risk.id);
  if (mapped.length === 0) return 'needs-mapping';

  const keyControls = mapped.filter(c => c.isKey);
  if (keyControls.length === 0) return 'partially-covered';

  const hasIneffective = keyControls.some(c => c.status === 'ineffective');
  if (hasIneffective) return 'at-risk';

  const allTested = keyControls.every(c => c.status === 'effective');
  if (allTested) return 'stable';

  return 'unvalidated';
}

function getLatestEngagement(risk: typeof RISKS[number]): { name: string; date: string } | null {
  // Match risk to engagement via business process
  const activeEng = ENGAGEMENTS.find(e =>
    e.status === 'active' && e.bps.includes(risk.bpId)
  );
  if (activeEng) return { name: activeEng.name, date: activeEng.start };

  const completeEng = ENGAGEMENTS.find(e =>
    e.status === 'complete' && e.bps.includes(risk.bpId)
  );
  if (completeEng) return { name: completeEng.name, date: completeEng.start };

  return null;
}

// ─── Enrich risks with RACM data ────────────────────────────────────────────

function enrichRisks(): EnrichedRisk[] {
  return RISKS.map(risk => {
    const bp = BUSINESS_PROCESSES.find(b => b.id === risk.bpId);
    const racm = RACMS.find(r => r.bpId === risk.bpId && r.status === 'active') || RACMS.find(r => r.bpId === risk.bpId);
    const mapped = CONTROLS.filter(c => c.riskId === risk.id);
    const engagement = getLatestEngagement(risk);

    return {
      id: risk.id,
      name: risk.name,
      severity: risk.severity,
      bpId: risk.bpId,
      bpAbbr: bp?.abbr || risk.bpId.toUpperCase(),
      bpColor: bp?.color || '#6B5D82',
      racmId: racm?.id || '—',
      racmName: racm?.name || 'No RACM',
      racmVersion: racm ? 'v2.1' : '—',
      framework: racm?.fw || '—',
      ctls: mapped.length,
      keyCtls: mapped.filter(c => c.isKey).length,
      mappedControls: mapped,
      derivedStatus: deriveStatus(risk, CONTROLS),
      latestEngagement: engagement?.name || null,
      lastTested: engagement?.date || null,
    };
  });
}

// ─── Status badge rendering ─────────────────────────────────────────────────

const STATUS_CONFIG: Record<DerivedStatus, { label: string; cls: string; icon: React.ElementType }> = {
  'stable':            { label: 'Stable',            cls: 'bg-compliant-50 text-compliant-700', icon: CheckCircle2 },
  'at-risk':           { label: 'At Risk',           cls: 'bg-risk-50 text-risk-700',           icon: AlertTriangle },
  'unvalidated':       { label: 'Unvalidated',       cls: 'bg-draft-50 text-draft-700',         icon: Clock },
  'needs-mapping':     { label: 'Needs Mapping',     cls: 'bg-high-50 text-high-700',           icon: Link2 },
  'partially-covered': { label: 'Partially Covered', cls: 'bg-mitigated-50 text-mitigated-700', icon: Layers },
};

function DerivedStatusBadge({ status }: { status: DerivedStatus }) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 h-5 rounded-full text-[10px] font-semibold ${cfg.cls}`}>
      <Icon size={10} />
      {cfg.label}
    </span>
  );
}

// ─── Process badge ──────────────────────────────────────────────────────────

function ProcessBadge({ abbr, color }: { abbr: string; color: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 h-5 rounded-full text-[10px] font-bold border"
      style={{ background: `${color}10`, color, borderColor: `${color}30` }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
      {abbr}
    </span>
  );
}

// ─── KPI Card ───────────────────────────────────────────────────────────────

function KpiCard({ label, value, icon: Icon, color, index, active, onClick }: {
  label: string; value: number; icon: React.ElementType; color: string; index: number;
  active?: boolean; onClick?: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 + index * 0.04 }}
      onClick={onClick}
      className={`glass-card rounded-2xl p-4 transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:border-primary/20' : 'cursor-default'
      } ${active ? 'ring-2 ring-primary/30 border-primary/20' : ''}`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className={`p-1.5 rounded-lg ${color}`}>
          <Icon size={14} />
        </div>
      </div>
      <div className="text-2xl font-bold text-text">{value}</div>
      <div className="text-[11px] text-text-muted mt-0.5">{label}</div>
    </motion.div>
  );
}

// ─── Expanded Row Content ───────────────────────────────────────────────────

function ExpandedRiskRow({ risk, onNavigate }: { risk: EnrichedRisk; onNavigate: (view: string) => void }) {
  const mappedControls = risk.mappedControls;

  const engHistory = ENGAGEMENTS.filter(e => e.bps.includes(risk.bpId)).map(e => ({
    name: e.name,
    period: `${e.start} — ${e.end}`,
    testedControls: e.tested,
    status: e.status,
    owner: e.owner,
  }));

  const recommendations: { text: string; action: string; target: string }[] = [];
  if (risk.derivedStatus === 'needs-mapping') {
    recommendations.push({ text: 'Map controls to this risk in RACM', action: 'Open RACM Mapping', target: 'governance-racm' });
  }
  if (risk.derivedStatus === 'partially-covered') {
    recommendations.push({ text: 'Designate a key control for this risk', action: 'Open RACM Mapping', target: 'governance-racm' });
  }
  if (risk.derivedStatus === 'at-risk') {
    recommendations.push({ text: 'Review failed key controls', action: 'View Failed Controls', target: 'governance-controls' });
  }
  if (risk.derivedStatus === 'unvalidated') {
    recommendations.push({ text: 'Create or activate an engagement to test controls', action: 'View Engagements', target: 'audit-planning' });
  }
  if (mappedControls.some(c => c.status === 'not-tested')) {
    recommendations.push({ text: 'Untested controls exist — schedule testing', action: 'View Engagements', target: 'audit-planning' });
  }

  return (
    <div className="px-6 py-5 bg-surface-2/30 border-t border-border/30">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left — Risk Context + Mapped Controls */}
        <div className="space-y-5">
          {/* Risk Context */}
          <div>
            <h4 className="text-[11px] font-bold text-text-muted uppercase tracking-wide mb-2">Risk Context</h4>
            <div className="glass-card rounded-xl p-4 space-y-2">
              <div className="text-[12px] text-text leading-relaxed">{risk.name}</div>
              <div className="flex items-center gap-4 pt-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-text-muted">Process:</span>
                  <ProcessBadge abbr={risk.bpAbbr} color={risk.bpColor} />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-text-muted">RACM:</span>
                  <button onClick={() => onNavigate('governance-racm')} className="text-[10px] font-semibold text-primary hover:underline cursor-pointer">{risk.racmName}</button>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-text-muted">Severity:</span>
                  <SeverityBadge severity={risk.severity} />
                </div>
              </div>
            </div>
          </div>

          {/* Mapped Controls */}
          <div>
            <h4 className="text-[11px] font-bold text-text-muted uppercase tracking-wide mb-2">
              Mapped Controls ({mappedControls.length})
            </h4>
            {mappedControls.length === 0 ? (
              <div className="glass-card rounded-xl p-4 text-center">
                <Link2 size={20} className="text-text-muted mx-auto mb-2" />
                <p className="text-[12px] text-text-muted">This risk is not mapped to any controls.</p>
                <button onClick={() => onNavigate('governance-racm')} className="mt-2 text-[11px] font-semibold text-primary hover:underline cursor-pointer">
                  Open RACM mapping to add controls
                </button>
              </div>
            ) : (
              <div className="glass-card rounded-xl overflow-hidden">
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className="border-b border-border bg-surface-2/50">
                      {['Control ID', 'Name', 'Key', 'Status', 'Action'].map(h => (
                        <th key={h} className="px-3 py-2 text-left text-[9px] font-semibold text-text-muted uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {mappedControls.map(ctrl => (
                      <tr key={ctrl.id} className="border-b border-border/30 hover:bg-white/50">
                        <td className="px-3 py-2">
                          <button onClick={() => onNavigate('governance-controls')} className="font-mono text-primary hover:underline cursor-pointer">{ctrl.id}</button>
                        </td>
                        <td className="px-3 py-2 text-text max-w-[180px] truncate">{ctrl.name}</td>
                        <td className="px-3 py-2">
                          {ctrl.isKey ? (
                            <span className="px-1.5 h-4 rounded text-[9px] font-bold bg-high-50 text-high-700 inline-flex items-center">Key</span>
                          ) : (
                            <span className="text-text-muted">—</span>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <span className={`px-2 h-5 rounded-full text-[9px] font-semibold inline-flex items-center ${
                            ctrl.status === 'effective' ? 'bg-compliant-50 text-compliant-700' :
                            ctrl.status === 'ineffective' ? 'bg-risk-50 text-risk-700' :
                            'bg-draft-50 text-draft-700'
                          }`}>
                            {ctrl.status === 'effective' ? 'Effective' : ctrl.status === 'ineffective' ? 'Ineffective' : 'Not Tested'}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <button onClick={() => onNavigate('governance-controls')} className="text-[10px] font-semibold text-primary hover:underline cursor-pointer flex items-center gap-0.5">
                            View <ChevronRight size={9} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right — Engagement History + Recommendations */}
        <div className="space-y-5">
          {/* Engagement History */}
          <div>
            <h4 className="text-[11px] font-bold text-text-muted uppercase tracking-wide mb-2">Engagement History</h4>
            {engHistory.length === 0 ? (
              <div className="glass-card rounded-xl p-4 text-center">
                <FileText size={20} className="text-text-muted mx-auto mb-2" />
                <p className="text-[12px] text-text-muted">No engagements have tested this risk.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {engHistory.map((eng, i) => (
                  <div key={i} className="glass-card rounded-xl p-3 hover:border-primary/15 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <button onClick={() => onNavigate('engagement-detail')} className="text-[12px] font-semibold text-primary hover:underline cursor-pointer">{eng.name}</button>
                      <span className={`px-2 h-4 rounded-full text-[9px] font-semibold ${
                        eng.status === 'active' ? 'bg-compliant-50 text-compliant-700' :
                        eng.status === 'complete' ? 'bg-evidence-50 text-evidence-700' :
                        'bg-draft-50 text-draft-700'
                      }`}>{eng.status === 'active' ? 'Active' : eng.status === 'complete' ? 'Complete' : 'Draft'}</span>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] text-text-muted">
                      <span>{eng.period}</span>
                      <span>{eng.testedControls} controls tested</span>
                      <span>{eng.owner}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recommended Next Actions */}
          {recommendations.length > 0 && (
            <div>
              <h4 className="text-[11px] font-bold text-text-muted uppercase tracking-wide mb-2">Recommended Next Actions</h4>
              <div className="space-y-1.5">
                {recommendations.map((rec, i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-primary/[0.03] border border-primary/8 hover:border-primary/15 transition-colors">
                    <Sparkles size={12} className="text-primary shrink-0" />
                    <span className="text-[11px] text-text flex-1">{rec.text}</span>
                    <button
                      onClick={() => onNavigate(rec.target)}
                      className="text-[10px] font-semibold text-primary hover:underline cursor-pointer flex items-center gap-0.5 shrink-0"
                    >
                      {rec.action} <ChevronRight size={9} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

interface Props {
  onRunWorkflow?: (workflowId: string) => void;
  onNavigate?: (view: string) => void;
}

export default function RiskRegister({ onNavigate }: Props) {
  const { addToast } = useToast();

  // Enriched data
  const allRisks = enrichRisks();

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [processFilter, setProcessFilter] = useState<ProcessFilter>('All');
  const [racmFilter, setRacmFilter] = useState<RacmFilter>('All');
  const [frameworkFilter, setFrameworkFilter] = useState<FrameworkFilter>('All');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [coverageFilter, setCoverageFilter] = useState<CoverageFilter>('All');
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('All');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const navigate = (view: string) => {
    if (onNavigate) onNavigate(view);
  };

  // Apply filters
  const filtered = allRisks.filter(r => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!r.id.toLowerCase().includes(q) && !r.name.toLowerCase().includes(q)) return false;
    }
    if (processFilter !== 'All' && r.bpAbbr !== processFilter) return false;
    if (racmFilter !== 'All' && r.racmId !== racmFilter) return false;
    if (frameworkFilter !== 'All' && r.framework !== frameworkFilter) return false;
    if (statusFilter !== 'All' && r.derivedStatus !== statusFilter) return false;
    if (severityFilter !== 'All' && r.severity !== severityFilter) return false;
    if (coverageFilter === 'has-key' && r.keyCtls === 0) return false;
    if (coverageFilter === 'no-key' && (r.keyCtls > 0 || r.ctls === 0)) return false;
    if (coverageFilter === 'no-controls' && r.ctls > 0) return false;
    return true;
  });

  // KPI counts
  const kpis = {
    total: allRisks.length,
    atRisk: allRisks.filter(r => r.derivedStatus === 'at-risk').length,
    stable: allRisks.filter(r => r.derivedStatus === 'stable').length,
    unvalidated: allRisks.filter(r => r.derivedStatus === 'unvalidated').length,
    needsMapping: allRisks.filter(r => r.derivedStatus === 'needs-mapping').length,
  };

  // AI insight
  const needsMappingCount = kpis.needsMapping;
  const atRiskCount = kpis.atRisk;
  const partiallyCoveredCount = allRisks.filter(r => r.derivedStatus === 'partially-covered').length;

  // RACM filter options
  const racmOptions = ['All', ...RACMS.map(r => r.id)];

  // Action column logic
  const getAction = (risk: EnrichedRisk): { label: string; cls: string; target: string } => {
    switch (risk.derivedStatus) {
      case 'needs-mapping': return { label: 'Open RACM Mapping', cls: 'bg-high-50 text-high-700 hover:bg-high-50/80', target: 'governance-racm' };
      case 'at-risk': return { label: 'View Failed Controls', cls: 'bg-risk-50 text-risk-700 hover:bg-risk-50/80', target: 'governance-controls' };
      case 'unvalidated': return { label: 'View Engagements', cls: 'bg-draft-50 text-draft-700 hover:bg-draft-50/80', target: 'audit-planning' };
      case 'partially-covered': return { label: 'Open RACM Mapping', cls: 'bg-mitigated-50 text-mitigated-700 hover:bg-mitigated-50/80', target: 'governance-racm' };
      default: return { label: 'View Details', cls: 'bg-primary/10 text-primary hover:bg-primary/15', target: 'governance-controls' };
    }
  };

  const hasActiveFilters = processFilter !== 'All' || racmFilter !== 'All' || frameworkFilter !== 'All' || statusFilter !== 'All' || coverageFilter !== 'All' || severityFilter !== 'All';

  const clearAllFilters = () => {
    setProcessFilter('All');
    setRacmFilter('All');
    setFrameworkFilter('All');
    setStatusFilter('All');
    setCoverageFilter('All');
    setSeverityFilter('All');
    setSearchQuery('');
  };

  return (
    <div className="h-full overflow-y-auto bg-white bg-mesh-gradient relative">
      <Orb hoverIntensity={0.06} rotateOnHover hue={275} opacity={0.05} />

      <div className="p-8 relative">
        {/* Header */}
        <div className="flex items-end justify-between mb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary to-primary-medium text-white">
                <AlertTriangle size={16} />
              </div>
              <h1 className="text-xl font-bold text-text">Risks</h1>
            </div>
            <p className="text-sm text-text-secondary mt-1 ml-9">Aggregated risk view across RACMs and business processes</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => addToast({ message: 'Risk data exported as CSV', type: 'success' })}
              className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg text-[13px] text-text-secondary hover:bg-white transition-colors cursor-pointer"
            >
              <Download size={14} />
              Export
            </button>
            <button
              onClick={() => navigate('governance-racm')}
              className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-[13px] font-semibold transition-colors cursor-pointer"
            >
              <ExternalLink size={14} />
              Create / Edit in RACM
            </button>
          </div>
        </div>

        {/* Helper text */}
        <div className="flex items-start gap-2 mb-5 px-1">
          <Info size={13} className="text-primary/50 shrink-0 mt-0.5" />
          <p className="text-[11px] text-text-muted leading-relaxed">
            Risks shown here come from <span className="font-semibold text-text-secondary">RACM mappings</span>. Create, edit, and map risks inside RACM. This page summarizes coverage and execution status.
          </p>
        </div>

        {/* AI Insight Banner */}
        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="bg-gradient-to-r from-primary-xlight via-white to-primary-xlight rounded-2xl border border-primary/10 p-4 mb-6 flex items-center gap-4">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-medium flex items-center justify-center shrink-0">
              <Sparkles size={16} className="text-white" />
            </div>
            <div className="flex-1">
              <div className="text-[12.5px] font-semibold text-text">RACM Risk Coverage Analysis</div>
              <div className="text-[12px] text-text-secondary mt-0.5">
                {needsMappingCount > 0 && <>{needsMappingCount} risk{needsMappingCount !== 1 ? 's have' : ' has'} no mapped controls. </>}
                {atRiskCount > 0 && <>{atRiskCount} risk{atRiskCount !== 1 ? 's are' : ' is'} At Risk due to failed key controls. </>}
                {partiallyCoveredCount > 0 && <>{partiallyCoveredCount} risk{partiallyCoveredCount !== 1 ? 's have' : ' has'} no key control designated. </>}
                {needsMappingCount > 0 || atRiskCount > 0 ? (
                  <button onClick={() => navigate('governance-racm')} className="text-primary font-semibold hover:underline cursor-pointer ml-0.5">
                    Review RACM mappings
                  </button>
                ) : (
                  <span className="text-compliant-700 font-semibold">All risks have mapped controls.</span>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* KPI Cards */}
        <div className="grid grid-cols-5 gap-3 mb-6">
          <KpiCard label="Total Risks" value={kpis.total} icon={Layers} color="text-primary bg-primary-xlight" index={0} />
          <KpiCard
            label="At Risk" value={kpis.atRisk} icon={AlertTriangle} color="text-risk-700 bg-risk-50" index={1}
            active={statusFilter === 'at-risk'}
            onClick={() => setStatusFilter(statusFilter === 'at-risk' ? 'All' : 'at-risk')}
          />
          <KpiCard
            label="Stable" value={kpis.stable} icon={CheckCircle2} color="text-compliant-700 bg-compliant-50" index={2}
            active={statusFilter === 'stable'}
            onClick={() => setStatusFilter(statusFilter === 'stable' ? 'All' : 'stable')}
          />
          <KpiCard
            label="Unvalidated" value={kpis.unvalidated} icon={Clock} color="text-draft-700 bg-draft-50" index={3}
            active={statusFilter === 'unvalidated'}
            onClick={() => setStatusFilter(statusFilter === 'unvalidated' ? 'All' : 'unvalidated')}
          />
          <KpiCard
            label="Needs Mapping" value={kpis.needsMapping} icon={Link2} color="text-high-700 bg-high-50" index={4}
            active={statusFilter === 'needs-mapping'}
            onClick={() => setStatusFilter(statusFilter === 'needs-mapping' ? 'All' : 'needs-mapping')}
          />
        </div>

        {/* Search + Filter Bar */}
        <div className="flex items-center gap-3 mb-3">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search by Risk ID or description..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-[12px] border border-border rounded-lg bg-white text-text placeholder:text-text-muted outline-none focus:border-primary/40 transition-colors"
            />
          </div>

          {/* Process filter pills */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-text-muted uppercase">Process:</span>
            {(['All', 'P2P', 'O2C', 'R2R', 'S2C'] as ProcessFilter[]).map(p => (
              <button key={p} onClick={() => setProcessFilter(p)}
                className={`px-2 py-1 rounded-full text-[10px] font-semibold transition-all cursor-pointer ${
                  processFilter === p ? 'bg-primary text-white' : 'bg-surface-2 text-text-muted hover:bg-primary/10 hover:text-primary'
                }`}>{p}</button>
            ))}
          </div>

          <div className="w-px h-5 bg-border-light" />

          {/* More Filters toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
              showFilters || hasActiveFilters ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-surface-2 text-text-muted hover:bg-primary/10 hover:text-primary'
            }`}
          >
            <Filter size={12} />
            Filters
            {hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
          </button>

          {hasActiveFilters && (
            <button onClick={clearAllFilters} className="text-[10px] font-semibold text-text-muted hover:text-primary cursor-pointer">
              Clear all
            </button>
          )}
        </div>

        {/* Extended Filters Row */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-4 mb-4 flex-wrap px-1 py-2 rounded-xl bg-surface-2/40 border border-border/50">
                {/* RACM Version */}
                <div className="flex items-center gap-1.5 pl-3">
                  <span className="text-[10px] font-bold text-text-muted uppercase">RACM:</span>
                  <select value={racmFilter} onChange={e => setRacmFilter(e.target.value)}
                    className="px-2 py-1 rounded-lg border border-border bg-white text-[11px] text-text outline-none focus:border-primary/40 cursor-pointer">
                    {racmOptions.map(o => (
                      <option key={o} value={o}>{o === 'All' ? 'All RACMs' : RACMS.find(r => r.id === o)?.name || o}</option>
                    ))}
                  </select>
                </div>

                <div className="w-px h-4 bg-border-light" />

                {/* Framework */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-text-muted uppercase">Framework:</span>
                  {(['All', 'SOX', 'IFC', 'Internal'] as FrameworkFilter[]).map(f => (
                    <button key={f} onClick={() => setFrameworkFilter(f)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold transition-all cursor-pointer ${
                        frameworkFilter === f ? 'bg-evidence-700 text-white' : 'bg-white text-text-muted hover:bg-evidence-50 hover:text-evidence-700 border border-border/50'
                      }`}>{f}</button>
                  ))}
                </div>

                <div className="w-px h-4 bg-border-light" />

                {/* Coverage */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-text-muted uppercase">Coverage:</span>
                  {([
                    { key: 'All', label: 'All' },
                    { key: 'has-key', label: 'Has Key Control' },
                    { key: 'no-key', label: 'No Key Control' },
                    { key: 'no-controls', label: 'No Controls' },
                  ] as { key: CoverageFilter; label: string }[]).map(c => (
                    <button key={c.key} onClick={() => setCoverageFilter(c.key)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold transition-all cursor-pointer ${
                        coverageFilter === c.key ? 'bg-mitigated-700 text-white' : 'bg-white text-text-muted hover:bg-mitigated-50 hover:text-mitigated-700 border border-border/50'
                      }`}>{c.label}</button>
                  ))}
                </div>

                <div className="w-px h-4 bg-border-light" />

                {/* Severity */}
                <div className="flex items-center gap-1.5 pr-3">
                  <span className="text-[10px] font-bold text-text-muted uppercase">Severity:</span>
                  {(['All', 'critical', 'high', 'medium', 'low'] as SeverityFilter[]).map(s => (
                    <button key={s} onClick={() => setSeverityFilter(s)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold transition-all cursor-pointer capitalize ${
                        severityFilter === s ? 'bg-primary text-white' : 'bg-white text-text-muted hover:bg-primary/10 hover:text-primary border border-border/50'
                      }`}>{s}</button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Risk Table */}
        {filtered.length === 0 ? (
          <div className="glass-card rounded-xl p-12 text-center">
            <AlertTriangle size={32} className="text-text-muted mx-auto mb-3" />
            <p className="text-[14px] font-semibold text-text mb-1">
              {allRisks.length === 0 ? 'No RACM has been created yet' : 'No risks found'}
            </p>
            <p className="text-[12px] text-text-muted max-w-sm mx-auto">
              {allRisks.length === 0
                ? 'Create a RACM to start defining risks and controls.'
                : 'No risks match the selected filters. Try adjusting your filters above.'}
            </p>
            {allRisks.length === 0 && (
              <button onClick={() => navigate('governance-racm')} className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-[12px] font-semibold transition-colors cursor-pointer">
                <Plus size={13} />
                Create RACM
              </button>
            )}
          </div>
        ) : (
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-border bg-surface-2/50">
                    <th className="px-3 py-2.5 text-left text-[10px] font-semibold text-text-muted uppercase tracking-wide w-6" />
                    {[
                      { key: 'id', label: 'Risk ID' },
                      { key: 'name', label: 'Risk Description' },
                      { key: 'bp', label: 'Business Process' },
                      { key: 'racm', label: 'RACM / Version' },
                      { key: 'severity', label: 'Severity' },
                      { key: 'controls', label: 'Mapped Controls' },
                      { key: 'engagement', label: 'Latest Engagement' },
                      { key: 'tested', label: 'Last Tested' },
                      { key: 'status', label: 'Derived Status', tooltip: 'Derived from key control testing outcomes' },
                      { key: 'action', label: 'Action' },
                    ].map(col => (
                      <th key={col.key} className="px-3 py-2.5 text-left text-[10px] font-semibold text-text-muted uppercase tracking-wide whitespace-nowrap">
                        {col.tooltip ? (
                          <span className="group relative inline-flex items-center gap-1 cursor-help">
                            {col.label}
                            <Info size={9} className="text-text-muted/50" />
                            <span className="absolute left-0 top-full mt-1.5 z-50 hidden group-hover:block w-[200px] px-2.5 py-2 rounded-lg bg-ink-900 text-white text-[10px] font-normal normal-case tracking-normal leading-snug shadow-lg">
                              {col.tooltip}
                            </span>
                          </span>
                        ) : col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((risk, i) => {
                    const isExpanded = expandedRow === risk.id;
                    const action = getAction(risk);

                    return (
                      <motion.tbody key={risk.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.015 }}>
                        <tr
                          onClick={() => setExpandedRow(isExpanded ? null : risk.id)}
                          className={`border-b border-border/50 hover:bg-brand-50/30 transition-colors cursor-pointer group ${
                            risk.derivedStatus === 'at-risk' ? 'border-l-[3px] border-l-risk' :
                            risk.derivedStatus === 'needs-mapping' ? 'border-l-[3px] border-l-high' : ''
                          }`}
                        >
                          {/* Expand chevron */}
                          <td className="px-2 py-2.5 w-6">
                            <ChevronRight size={12} className={`text-text-muted transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                          </td>

                          {/* Risk ID */}
                          <td className="px-3 py-2.5">
                            <span className="font-mono text-[11px] text-primary font-semibold">{risk.id}</span>
                          </td>

                          {/* Description */}
                          <td className="px-3 py-2.5">
                            <span className="text-[12px] text-text font-medium max-w-[220px] truncate block">{risk.name}</span>
                          </td>

                          {/* Business Process */}
                          <td className="px-3 py-2.5">
                            <ProcessBadge abbr={risk.bpAbbr} color={risk.bpColor} />
                          </td>

                          {/* RACM / Version */}
                          <td className="px-3 py-2.5">
                            <div>
                              <button onClick={e => { e.stopPropagation(); navigate('governance-racm'); }} className="text-[11px] font-medium text-primary hover:underline cursor-pointer truncate block max-w-[140px]">
                                {risk.racmId}
                              </button>
                              <span className="text-[10px] text-text-muted">{risk.racmVersion}</span>
                            </div>
                          </td>

                          {/* Severity */}
                          <td className="px-3 py-2.5">
                            <SeverityBadge severity={risk.severity} />
                          </td>

                          {/* Mapped Controls */}
                          <td className="px-3 py-2.5">
                            {risk.ctls > 0 ? (
                              <span className="text-[11px] text-text">
                                {risk.ctls} control{risk.ctls !== 1 ? 's' : ''}
                                {risk.keyCtls > 0 && <span className="text-text-muted"> · {risk.keyCtls} key</span>}
                              </span>
                            ) : (
                              <span className="text-[11px] text-high-700 font-medium">None</span>
                            )}
                          </td>

                          {/* Latest Engagement */}
                          <td className="px-3 py-2.5">
                            {risk.latestEngagement ? (
                              <button onClick={e => { e.stopPropagation(); navigate('engagement-detail'); }}
                                className="text-[11px] text-primary hover:underline cursor-pointer truncate block max-w-[120px]">
                                {risk.latestEngagement}
                              </button>
                            ) : (
                              <span className="text-[11px] text-text-muted">Not tested</span>
                            )}
                          </td>

                          {/* Last Tested */}
                          <td className="px-3 py-2.5">
                            <span className="text-[11px] text-text-muted">{risk.lastTested || '—'}</span>
                          </td>

                          {/* Derived Status */}
                          <td className="px-3 py-2.5">
                            <DerivedStatusBadge status={risk.derivedStatus} />
                          </td>

                          {/* Action */}
                          <td className="px-3 py-2.5">
                            <button
                              onClick={e => { e.stopPropagation(); navigate(action.target); }}
                              className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors inline-flex items-center gap-1 ${action.cls}`}
                            >
                              {action.label}
                              <ChevronRight size={9} />
                            </button>
                          </td>
                        </tr>

                        {/* Expanded content */}
                        {isExpanded && (
                          <tr>
                            <td colSpan={12}>
                              <ExpandedRiskRow risk={risk} onNavigate={navigate} />
                            </td>
                          </tr>
                        )}
                      </motion.tbody>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-2.5 border-t border-border bg-surface-2/30">
              <span className="text-[11px] text-text-muted">{filtered.length} of {allRisks.length} risks</span>
              {hasActiveFilters && (
                <span className="text-[10px] text-text-muted">Filters active — showing filtered results</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
