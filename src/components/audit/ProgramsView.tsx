import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Building2, Calendar, Layers, Search, Info,
  ChevronRight, Columns
} from 'lucide-react';
import { BUSINESS_PROCESSES, RACMS } from '../../data/mockData';
import Orb from '../shared/Orb';

// ─── Engagement data (mirrors AuditPlanningView) ────────────────────────────

type ProcessType = 'P2P' | 'O2C' | 'R2R' | 'S2C' | 'Cross';
type EngagementStatus = 'draft' | 'planned' | 'frozen' | 'signed-off' | 'active' | 'in-progress' | 'pending-review' | 'closed';

interface PlanEngagement {
  id: string;
  name: string;
  auditType: string;
  businessProcess: ProcessType;
  owner: string;
  status: EngagementStatus;
  controls: number;
  controlsTested: number;
  controlsFailed: number;
  isOverdue: boolean;
  color: string;
}

const PLAN_ENGAGEMENTS: PlanEngagement[] = [
  { id: 'ap-1', name: 'P2P — SOX Audit', auditType: 'SOX', businessProcess: 'P2P', owner: 'Tushar Goel', status: 'active', controls: 24, controlsTested: 18, controlsFailed: 2, isOverdue: false, color: '#6a12cd' },
  { id: 'ap-2', name: 'O2C — SOX Audit', auditType: 'SOX', businessProcess: 'O2C', owner: 'Neha Joshi', status: 'active', controls: 18, controlsTested: 8, controlsFailed: 0, isOverdue: false, color: '#0284c7' },
  { id: 'ap-3', name: 'R2R — SOX Audit', auditType: 'SOX', businessProcess: 'R2R', owner: 'Karan Mehta', status: 'in-progress', controls: 31, controlsTested: 26, controlsFailed: 3, isOverdue: true, color: '#d97706' },
  { id: 'ap-4', name: 'S2C — Contract Review', auditType: 'Internal', businessProcess: 'S2C', owner: 'Rohan Patel', status: 'planned', controls: 14, controlsTested: 0, controlsFailed: 0, isOverdue: false, color: '#059669' },
  { id: 'ap-5', name: 'P2P — IFC Assessment', auditType: 'IFC', businessProcess: 'P2P', owner: 'Sneha Desai', status: 'planned', controls: 18, controlsTested: 0, controlsFailed: 0, isOverdue: false, color: '#6a12cd' },
  { id: 'ap-6', name: 'IT General Controls', auditType: 'ITGC', businessProcess: 'Cross', owner: 'Deepak Bansal', status: 'active', controls: 15, controlsTested: 9, controlsFailed: 0, isOverdue: false, color: '#7c3aed' },
  { id: 'ap-7', name: 'Vendor Risk Assessment', auditType: 'Risk', businessProcess: 'P2P', owner: 'Priya Singh', status: 'draft', controls: 8, controlsTested: 0, controlsFailed: 0, isOverdue: false, color: '#dc2626' },
  { id: 'ap-8', name: 'Year-End Close Review', auditType: 'SOX', businessProcess: 'R2R', owner: 'Karan Mehta', status: 'planned', controls: 12, controlsTested: 0, controlsFailed: 0, isOverdue: false, color: '#d97706' },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

function isExecutionPhase(s: EngagementStatus): boolean {
  return ['active', 'in-progress', 'pending-review', 'closed'].includes(s);
}

function statusLabel(s: EngagementStatus): string {
  const map: Record<EngagementStatus, string> = {
    draft: 'Draft', planned: 'Planned', frozen: 'Frozen', 'signed-off': 'Signed Off',
    active: 'Active', 'in-progress': 'In Progress', 'pending-review': 'Pending Review', closed: 'Closed',
  };
  return map[s];
}

function statusCls(s: EngagementStatus): string {
  const map: Record<EngagementStatus, string> = {
    draft: 'bg-draft-50 text-draft-700',
    planned: 'bg-evidence-50 text-evidence-700',
    frozen: 'bg-brand-50 text-brand-700',
    'signed-off': 'bg-compliant-50 text-compliant-700',
    active: 'bg-compliant-50 text-compliant-700',
    'in-progress': 'bg-evidence-50 text-evidence-700',
    'pending-review': 'bg-high-50 text-high-700',
    closed: 'bg-draft-50 text-draft-700',
  };
  return map[s];
}

function actionForEngagement(eng: PlanEngagement): { label: string; cls: string } {
  if (isExecutionPhase(eng.status)) {
    if (eng.controlsFailed > 0) return { label: 'View Failed', cls: 'bg-risk-50 text-risk-700 hover:bg-risk-50/80' };
    if (eng.controlsTested < eng.controls) return { label: 'Continue Testing', cls: 'bg-evidence-50 text-evidence-700 hover:bg-evidence-50/80' };
    return { label: 'View Execution', cls: 'bg-primary/10 text-primary hover:bg-primary/15' };
  }
  if (eng.status === 'draft') return { label: 'Configure', cls: 'bg-draft-50 text-draft-700 hover:bg-draft-50/80' };
  return { label: 'Activate', cls: 'bg-brand-50 text-brand-700 hover:bg-brand-50/80' };
}

const PROCESS_COLORS: Record<string, string> = {
  P2P: '#6a12cd', O2C: '#0284c7', R2R: '#d97706', S2C: '#059669', Cross: '#7c3aed',
};

function racmsForProcess(bpId: string) { return RACMS.filter(r => r.bpId === bpId).length; }
function engagementsForProcess(abbr: string) { return PLAN_ENGAGEMENTS.filter(e => e.businessProcess === abbr).length; }

// ─── Types ──────────────────────────────────────────────────────────────────

type ViewMode = 'processes' | 'engagements' | 'split';

interface Props {
  selectedBPId: string | null;
  onSelectBP: (id: string | null) => void;
  onNavigateToExecution?: (engagementId: string) => void;
  initialTab?: ViewMode;
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function ProgramsView({ onSelectBP, onNavigateToExecution, initialTab = 'processes' }: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>(initialTab);
  const [search, setSearch] = useState('');
  const [splitSelectedProcess, setSplitSelectedProcess] = useState<string | null>(null);

  // Filtered data
  const q = search.toLowerCase();

  const filteredProcesses = BUSINESS_PROCESSES.filter(bp =>
    !q || bp.name.toLowerCase().includes(q) || bp.abbr.toLowerCase().includes(q)
  );

  const filteredEngagements = PLAN_ENGAGEMENTS.filter(e =>
    !q || e.name.toLowerCase().includes(q) || e.auditType.toLowerCase().includes(q) || e.owner.toLowerCase().includes(q)
  );

  // Split view: engagements filtered by selected process
  const selectedBP = splitSelectedProcess ? BUSINESS_PROCESSES.find(b => b.id === splitSelectedProcess) : null;
  const splitEngagements = selectedBP
    ? PLAN_ENGAGEMENTS.filter(e => e.businessProcess === selectedBP.abbr)
    : PLAN_ENGAGEMENTS;

  const viewModes: { id: ViewMode; label: string; icon: React.ElementType }[] = [
    { id: 'processes', label: 'Process View', icon: Building2 },
    { id: 'engagements', label: 'Engagement View', icon: Calendar },
    { id: 'split', label: 'Split View', icon: Columns },
  ];

  // ─── Shared sub-renderers ─────────────────────────────────────────────────

  function renderEngagementRows(engagements: PlanEngagement[], compact = false) {
    return engagements.map((eng, i) => {
      const active = isExecutionPhase(eng.status);
      const progress = eng.controls > 0 ? Math.round((eng.controlsTested / eng.controls) * 100) : 0;
      const processColor = PROCESS_COLORS[eng.businessProcess] || '#6B5D82';
      const action = actionForEngagement(eng);

      return (
        <motion.tr
          key={eng.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.02 }}
          onClick={() => { if (active && onNavigateToExecution) onNavigateToExecution(eng.id); }}
          className={`border-b border-border/50 hover:bg-brand-50/30 transition-colors cursor-pointer ${eng.isOverdue ? 'border-l-[3px] border-l-risk' : ''}`}
        >
          <td className={compact ? 'px-3 py-2.5' : 'px-4 py-3'}>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: eng.color, opacity: active ? 1 : 0.4 }} />
              <span className="text-[12px] font-medium text-text truncate">{eng.name}</span>
              {eng.isOverdue && <span className="px-1 h-4 rounded text-[8px] font-bold bg-risk-50 text-risk-700 inline-flex items-center animate-pulse shrink-0">OD</span>}
            </div>
          </td>
          <td className={compact ? 'px-3 py-2.5' : 'px-4 py-3'}>
            <span className="px-2 h-5 rounded-full text-[9px] font-semibold bg-brand-50 text-brand-700 inline-flex items-center">{eng.auditType}</span>
          </td>
          {!compact && (
            <td className="px-4 py-3">
              <span
                className="px-2 h-5 rounded-full text-[10px] font-bold border inline-flex items-center gap-1"
                style={{ background: `${processColor}10`, color: processColor, borderColor: `${processColor}30` }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: processColor }} />
                {eng.businessProcess}
              </span>
            </td>
          )}
          {!compact && (
            <td className="px-4 py-3">
              <span className="text-[11px] text-text-secondary">{eng.owner.split(' ')[0]}</span>
            </td>
          )}
          <td className={compact ? 'px-3 py-2.5' : 'px-4 py-3'}>
            {active ? (
              <div className="flex items-center gap-2 min-w-[70px]">
                <div className="flex-1 h-1.5 bg-surface-3 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${progress}%`, background: eng.color }} />
                </div>
                <span className="text-[10px] font-bold tabular-nums text-text-muted w-7 text-right">{progress}%</span>
              </div>
            ) : <span className="text-ink-300 text-[10px]">—</span>}
          </td>
          <td className={compact ? 'px-3 py-2.5' : 'px-4 py-3'}>
            <span className={`px-2 h-5 rounded-full text-[9px] font-semibold inline-flex items-center ${statusCls(eng.status)}`}>
              {statusLabel(eng.status)}
            </span>
          </td>
          <td className={compact ? 'px-3 py-2.5' : 'px-4 py-3'}>
            <span className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors inline-flex items-center gap-1 ${action.cls}`}>
              {action.label} <ChevronRight size={9} />
            </span>
          </td>
        </motion.tr>
      );
    });
  }

  return (
    <div className="h-full overflow-y-auto bg-white bg-mesh-gradient relative">
      <Orb hoverIntensity={0.06} rotateOnHover hue={275} opacity={0.05} />

      <div className="p-8 relative">
        {/* Header */}
        <div className="flex items-end justify-between mb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary to-primary-medium text-white">
                <Layers size={16} />
              </div>
              <h1 className="text-xl font-bold text-text">Programs</h1>
            </div>
            <p className="text-sm text-text-secondary mt-1 ml-9">Manage business processes, RACMs, and audit engagements in one place.</p>
          </div>
        </div>

        {/* Tabs + Search */}
        <div className="flex items-center justify-between border-b border-border-light mb-5">
          <div className="flex items-center">
            {viewModes.map(vm => (
              <button
                key={vm.id}
                onClick={() => { setViewMode(vm.id); setSearch(''); }}
                className={`flex items-center gap-1.5 px-5 py-2.5 text-[13px] font-medium border-b-2 transition-colors cursor-pointer ${
                  viewMode === vm.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-text-muted hover:text-text-secondary'
                }`}
              >
                <vm.icon size={14} />
                {vm.label}
              </button>
            ))}
          </div>

          {viewMode !== 'split' && (
            <div className="relative mb-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder={viewMode === 'processes' ? 'Search processes...' : 'Search engagements...'}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-3 py-2 text-[12px] border border-border rounded-lg bg-white text-text placeholder:text-text-muted outline-none focus:border-primary/40 transition-colors w-56"
              />
            </div>
          )}
        </div>

        {/* ── Process View ── */}
        {viewMode === 'processes' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }}>
            {filteredProcesses.length === 0 ? (
              <div className="glass-card rounded-xl p-12 text-center">
                <Building2 size={32} className="text-text-muted mx-auto mb-3" />
                <p className="text-[14px] font-semibold text-text mb-1">No processes found</p>
                <p className="text-[12px] text-text-muted">Try adjusting your search.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredProcesses.map((bp, i) => (
                  <motion.div
                    key={bp.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 + i * 0.04 }}
                    onClick={() => onSelectBP(bp.id)}
                    className="glass-card rounded-2xl p-5 hover:border-primary/20 hover:shadow-sm transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-[13px] font-bold" style={{ background: bp.color }}>
                          {bp.abbr}
                        </div>
                        <div>
                          <div className="text-[14px] font-semibold text-text">{bp.name}</div>
                          <div className="text-[11px] text-text-muted">{bp.abbr}</div>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-text-muted group-hover:text-primary transition-colors" />
                    </div>
                    <div className="grid grid-cols-5 gap-3">
                      {[
                        { label: 'Risks', value: bp.risks },
                        { label: 'Controls', value: bp.controls },
                        { label: 'RACMs', value: racmsForProcess(bp.id) },
                        { label: 'Engagements', value: engagementsForProcess(bp.abbr) },
                      ].map(m => (
                        <div key={m.label} className="text-center">
                          <div className="text-[15px] font-bold text-text">{m.value}</div>
                          <div className="text-[10px] text-text-muted">{m.label}</div>
                        </div>
                      ))}
                      <div className="text-center">
                        <div className={`text-[15px] font-bold ${bp.coverage >= 70 ? 'text-compliant-700' : bp.coverage >= 50 ? 'text-mitigated-700' : 'text-risk-700'}`}>{bp.coverage}%</div>
                        <div className="text-[10px] text-text-muted">Coverage</div>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="h-1.5 bg-surface-3 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${bp.coverage}%`, background: bp.color }} />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ── Engagement View ── */}
        {viewMode === 'engagements' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }}>
            {filteredEngagements.length === 0 ? (
              <div className="glass-card rounded-xl p-12 text-center">
                <Calendar size={32} className="text-text-muted mx-auto mb-3" />
                <p className="text-[14px] font-semibold text-text mb-1">No engagements found</p>
                <p className="text-[12px] text-text-muted">Try adjusting your search.</p>
              </div>
            ) : (
              <div className="glass-card rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-[12px]">
                    <thead>
                      <tr className="border-b border-border bg-surface-2/50">
                        {['Engagement', 'Type', 'Primary Process', 'Owner', 'Progress', 'Status', 'Action'].map(h => (
                          <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold text-text-muted uppercase tracking-wide whitespace-nowrap">
                            {h === 'Primary Process' ? (
                              <span className="group relative inline-flex items-center gap-1 cursor-help">
                                {h}
                                <Info size={9} className="text-text-muted/50" />
                                <span className="absolute left-0 top-full mt-1.5 z-50 hidden group-hover:block w-[220px] px-2.5 py-2 rounded-lg bg-ink-900 text-white text-[10px] font-normal normal-case tracking-normal leading-snug shadow-lg">
                                  Used for planning, ownership, and filtering. Execution scope comes from linked RACM snapshot.
                                </span>
                              </span>
                            ) : h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {renderEngagementRows(filteredEngagements)}
                    </tbody>
                  </table>
                </div>
                <div className="flex items-center justify-between px-4 py-2.5 border-t border-border bg-surface-2/30">
                  <span className="text-[11px] text-text-muted">{filteredEngagements.length} of {PLAN_ENGAGEMENTS.length} engagements</span>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ── Split View ── */}
        {viewMode === 'split' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }}>
            <div className="flex gap-5" style={{ minHeight: 420 }}>
              {/* Left panel — Process cards */}
              <div className="w-[320px] shrink-0 space-y-2.5">
                <div className="text-[11px] font-bold text-text-muted uppercase tracking-wide px-1 mb-1">Business Processes</div>
                {BUSINESS_PROCESSES.map((bp, i) => {
                  const isSelected = splitSelectedProcess === bp.id;
                  const engCount = engagementsForProcess(bp.abbr);

                  return (
                    <motion.div
                      key={bp.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.04 + i * 0.03 }}
                      onClick={() => setSplitSelectedProcess(isSelected ? null : bp.id)}
                      className={`glass-card rounded-xl p-4 transition-all cursor-pointer ${
                        isSelected
                          ? 'ring-2 ring-primary/30 border-primary/20 shadow-sm'
                          : 'hover:border-primary/15'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-[12px] font-bold"
                          style={{ background: bp.color }}
                        >
                          {bp.abbr}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] font-semibold text-text">{bp.name}</div>
                          <div className="text-[10px] text-text-muted">{engCount} engagement{engCount !== 1 ? 's' : ''}</div>
                        </div>
                        <div className={`text-[14px] font-bold tabular-nums ${bp.coverage >= 70 ? 'text-compliant-700' : bp.coverage >= 50 ? 'text-mitigated-700' : 'text-risk-700'}`}>
                          {bp.coverage}%
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-[10px] text-text-muted">
                        <span>{bp.risks} risks</span>
                        <span>{bp.controls} controls</span>
                        <span>{racmsForProcess(bp.id)} RACMs</span>
                      </div>
                      <div className="mt-2.5">
                        <div className="h-1 bg-surface-3 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${bp.coverage}%`, background: bp.color }} />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Right panel — Engagements */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between px-1 mb-1">
                  <div className="text-[11px] font-bold text-text-muted uppercase tracking-wide">
                    {selectedBP ? (
                      <>
                        <span style={{ color: selectedBP.color }}>{selectedBP.abbr}</span>
                        <span className="mx-1.5 text-border">—</span>
                        Engagements
                        <span className="ml-1.5 font-normal normal-case text-text-muted">({splitEngagements.length})</span>
                      </>
                    ) : (
                      <>All Engagements<span className="ml-1.5 font-normal normal-case text-text-muted">({splitEngagements.length})</span></>
                    )}
                  </div>
                  {splitSelectedProcess && (
                    <button
                      onClick={() => setSplitSelectedProcess(null)}
                      className="text-[10px] font-semibold text-text-muted hover:text-primary cursor-pointer"
                    >
                      Show all
                    </button>
                  )}
                </div>

                <AnimatePresence mode="wait">
                  {splitEngagements.length === 0 ? (
                    <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="glass-card rounded-xl p-10 text-center">
                      <Calendar size={28} className="text-text-muted mx-auto mb-2" />
                      <p className="text-[13px] font-semibold text-text mb-1">No engagements</p>
                      <p className="text-[11px] text-text-muted">No engagements are linked to {selectedBP?.abbr || 'this process'}.</p>
                    </motion.div>
                  ) : (
                    <motion.div key={splitSelectedProcess || 'all'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}>
                      <div className="glass-card rounded-xl overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-[12px]">
                            <thead>
                              <tr className="border-b border-border bg-surface-2/50">
                                {['Engagement', 'Framework', 'Progress', 'Status', 'Next Action'].map(h => (
                                  <th key={h} className="px-3 py-2.5 text-left text-[10px] font-semibold text-text-muted uppercase tracking-wide whitespace-nowrap">{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {renderEngagementRows(splitEngagements, true)}
                            </tbody>
                          </table>
                        </div>
                        <div className="px-3 py-2 border-t border-border bg-surface-2/30">
                          <span className="text-[10px] text-text-muted">{splitEngagements.length} engagement{splitEngagements.length !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
