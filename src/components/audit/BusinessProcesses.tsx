import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, Plus, Upload, Sparkles,
  ChevronRight, ChevronDown,
  ArrowLeft, ArrowRight,
  Building2, Briefcase, Calendar, Users
} from 'lucide-react';
import { BUSINESS_PROCESSES, SOPS, RACMS, RISKS, CONTROLS, WORKFLOWS, ENGAGEMENTS } from '../../data/mockData';
import { CardContainer, CardBody, CardItem } from '../shared/3DCard';
import Orb from '../shared/Orb';
import { useToast } from '../shared/Toast';
import RacmListTable from './RacmListTable';
import RiskRegister from './RiskRegister';
import ControlLibraryView from '../governance/ControlLibraryView';
import WorkflowLibraryView from '../workflow/WorkflowLibraryView';

interface Props {
  selectedBPId: string | null;
  onSelectBP: (id: string | null) => void;
  onOpenEngagement?: (engagementId: string) => void;
}

type HubTabId = 'engagements' | 'business-processes';

const HUB_TABS: { id: HubTabId; label: string; icon: React.ElementType }[] = [
  { id: 'engagements',        label: 'Engagements',       icon: Briefcase },
  { id: 'business-processes', label: 'Business processes', icon: Building2 },
];


/* ─── Upload SOP Modal ─── */
function UploadSOPModal({ onClose }: { onClose: () => void }) {
  const { addToast } = useToast();
  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/30 backdrop-blur-sm" onClick={onClose}>
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-2xl shadow-xl border border-canvas-border w-full max-w-[440px] p-6" onClick={e => e.stopPropagation()}>
          <h2 className="text-[16px] font-bold text-text mb-2">Upload SOP</h2>
          <p className="text-[12px] text-text-muted mb-4">Upload a process document (.pdf, .docx, .xlsx) to extract risks and controls.</p>
          <div className="border-2 border-dashed border-border rounded-xl p-8 text-center mb-4">
            <Upload size={24} className="mx-auto text-gray-300 mb-2" />
            <div className="text-[12px] text-text-muted">Drag & drop or click to browse</div>
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 rounded-lg border border-border text-[13px] font-medium text-text-secondary hover:bg-gray-50 cursor-pointer">Cancel</button>
            <button onClick={() => { addToast({ message: 'SOP uploaded — processing...', type: 'success' }); onClose(); }}
              className="px-4 py-2 rounded-lg bg-primary text-white text-[13px] font-semibold hover:bg-primary/90 cursor-pointer">Upload</button>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}

/* ─── BP Detail View ─── */
function BPDetailView({ bp, onBack }: {
  bp: typeof BUSINESS_PROCESSES[0]; onBack: () => void;
}) {
  const [tab, setTab] = useState<'sop' | 'racm' | 'risks' | 'controls' | 'workflows'>('sop');
  const [uploadModal, setUploadModal] = useState(false);
  const { addToast } = useToast();

  // ─── Data: single query per entity, filtered by business_process_id ───
  const bpRacms = RACMS.filter(r => r.bpId === bp.id);
  const bpSops = SOPS.filter(s => s.bpId === bp.id);
  const bpWfs = WORKFLOWS.filter(w => w.bpId === bp.id);
  const bpRisks = RISKS.filter(r => r.bpId === bp.id);
  const bpRiskIds = new Set(bpRisks.map(r => r.id));
  const bpControls = CONTROLS.filter(c => bpRiskIds.has(c.riskId));
  const bpEngagements = useMemo(() => ENGAGEMENTS.filter(e => e.bps.includes(bp.id)), [bp.id]);

  // No separate status logic — RACM uses racmStateEngine, risks use RiskRegister lifecycle,
  // controls use ControlLibraryView status, workflows use WorkflowLibraryView status.

  const tabs = [
    { id: 'sop' as const,       label: 'SOP',             count: bpSops.length },
    { id: 'racm' as const,      label: 'RACM',            count: bpRacms.length },
    { id: 'risks' as const,     label: 'Risk Register',   count: bpRisks.length },
    { id: 'controls' as const,  label: 'Control Library', count: bpControls.length },
    { id: 'workflows' as const, label: 'Workflows',       count: bpWfs.length },
  ];

  return (
    <div className="h-full overflow-y-auto bg-surface-2">
      <AnimatePresence>
        {uploadModal && <UploadSOPModal onClose={() => setUploadModal(false)} />}
      </AnimatePresence>

      <div className="px-10 py-6">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-primary mb-4 transition-colors">
          <ArrowLeft size={14} />
          Business Processes
        </button>

        {/* BP Header — metadata always visible above tabs */}
        <div className="bg-white rounded-2xl border border-border-light p-6 mb-6 ai-card">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: bp.color + '1a' }}>
              <span className="text-sm font-bold" style={{ color: bp.color }}>{bp.abbr}</span>
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-text">{bp.name}</h1>
              <p className="text-[12px] text-text-muted">Business Process · FY 2025--26</p>
            </div>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[12px] font-semibold ${
              bp.coverage >= 80 ? 'bg-emerald-50 text-emerald-700' : bp.coverage >= 50 ? 'bg-amber-50 text-amber-700' : 'bg-gray-100 text-gray-600'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${bp.coverage >= 80 ? 'bg-emerald-500' : bp.coverage >= 50 ? 'bg-amber-500' : 'bg-gray-400'}`} />
              Active
            </span>
          </div>

          {/* Process Metadata — always visible */}
          <div className="flex items-center gap-6 mb-4 pb-4 border-b border-border-light">
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-bold text-text-muted">Owner:</span>
              <span className="text-[12px] font-medium text-text">Tushar Goel</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-bold text-text-muted">Status:</span>
              <span className="inline-flex items-center gap-1.5 bg-success-bg text-compliant-700 px-2.5 py-0.5 rounded-full text-[12px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-success" />
                Active
              </span>
            </div>
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-[12px] font-bold text-text-muted shrink-0">Description:</span>
              <span className="text-[12px] text-text-secondary truncate">End-to-end {bp.name.toLowerCase()} process covering all related risks, controls, and compliance workflows.</span>
            </div>
          </div>

          {/* Clickable metric cards */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { l: 'RACMs', v: bpRacms.length, tab: 'racm' as const },
              { l: 'Risks', v: bp.risks, tab: 'risks' as const },
              { l: 'Controls', v: bp.controls, tab: 'controls' as const },
              { l: 'Workflows', v: bpWfs.length, tab: 'workflows' as const },
            ].map((s, i) => (
              <motion.div
                key={s.l}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setTab(s.tab)}
                className="text-center p-4 rounded-xl bg-surface-2/80 border border-border-light/50 cursor-pointer hover:border-primary/20 hover:shadow-sm transition-all"
              >
                <div className="text-xl font-bold text-text leading-none mb-1">{s.v}</div>
                <div className="text-[12px] text-text-muted font-medium">{s.l}</div>
              </motion.div>
            ))}
          </div>

        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-border mb-6">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors ${
                tab === t.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-muted hover:text-text-secondary'
              }`}
            >
              <span className="flex items-center gap-2">
                {t.label}
                {t.count != null && (
                  <span className={`text-[12px] font-bold px-1.5 py-0.5 rounded-full ${
                    tab === t.id ? 'bg-primary/10 text-primary' : 'bg-paper-50 text-ink-500'
                  }`}>{t.count}</span>
                )}
              </span>
            </button>
          ))}
        </div>

        {/* SOP Tab */}
        {tab === 'sop' && (
          <div>
            {/* Upload CTA */}
            <div onClick={() => setUploadModal(true)} className="border-2 border-dashed border-border-light rounded-xl p-5 text-center cursor-pointer mb-5 bg-white hover:bg-gray-50/50 transition-colors">
              <div className="text-[13px] font-semibold text-text">Upload a new SOP</div>
              <div className="text-[11px] text-text-muted mt-0.5">Upload a process document to extract risks and controls</div>
            </div>

            {/* SOP Table */}
            {bpSops.length === 0 ? (
              <div className="glass-card rounded-xl p-8 text-center text-[12px] text-text-muted">
                No SOPs uploaded yet — upload one above to get started.
              </div>
            ) : (
              <div className="glass-card rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-[12px]">
                    <thead>
                      <tr className="border-b border-border bg-surface-2/50">
                        {['SOP Name', 'Version', 'Status', 'Risks', 'Controls', 'Uploaded', 'Action'].map(h => (
                          <th key={h} className="px-3 py-2.5 text-left text-[10px] font-semibold text-text-muted uppercase tracking-wide whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {bpSops.map((sop, i) => {
                        const linkedRacm = bpRacms.find(r => r.id === sop.racmId);
                        return (
                          <motion.tr key={sop.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                            className="border-b border-border/50 hover:bg-gray-50/60 transition-colors">
                            <td className="px-3 py-3">
                              <span className="text-[12px] font-medium text-text">{sop.name}</span>
                            </td>
                            <td className="px-3 py-3">
                              <span className="text-[11px] font-mono text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded">{sop.version}</span>
                            </td>
                            <td className="px-3 py-3">
                              <span className={`px-2 h-5 rounded-full text-[9px] font-semibold inline-flex items-center ${
                                sop.status === 'processed' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
                              }`}>{sop.status === 'processed' ? 'Processed' : sop.status}</span>
                            </td>
                            <td className="px-3 py-3">
                              <span className="text-[12px] font-semibold text-text tabular-nums">{sop.risks}</span>
                            </td>
                            <td className="px-3 py-3">
                              <span className="text-[12px] font-semibold text-text tabular-nums">{sop.controls}</span>
                            </td>
                            <td className="px-3 py-3">
                              <span className="text-[11px] text-gray-400">{sop.by} · {sop.at}</span>
                            </td>
                            <td className="px-3 py-3">
                              {linkedRacm ? (
                                <button onClick={() => setTab('racm')}
                                  className="px-2 py-1 rounded-lg text-[10px] font-bold text-primary bg-primary/10 hover:bg-primary/20 cursor-pointer transition-colors inline-flex items-center gap-1">
                                  View RACM<ChevronRight size={8} />
                                </button>
                              ) : (
                                <span className="text-[10px] text-gray-400">No RACM linked</span>
                              )}
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="flex items-center justify-between px-4 py-2.5 border-t border-border bg-surface-2/30">
                  <span className="text-[11px] text-text-muted">{bpSops.length} SOP{bpSops.length !== 1 ? 's' : ''}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* RACM Tab — filtered RACM list table */}
        {tab === 'racm' && (
          <RacmListTable processFilter={bp.abbr} />
        )}

        {/* Risk Register Tab — embedded RiskRegister filtered by process */}
        {tab === 'risks' && (
          <div className="-mx-10 -mb-6">
            <RiskRegister processFilter={bp.abbr} />
          </div>
        )}

        {/* Control Library Tab — embedded ControlLibraryView filtered by process */}
        {tab === 'controls' && (
          <div className="-mx-10 -mb-6">
            <ControlLibraryView processFilter={bp.abbr} />
          </div>
        )}

        {/* Workflows Tab — embedded WorkflowLibraryView filtered by process */}
        {tab === 'workflows' && (
          <div className="-mx-10 -mb-6">
            <WorkflowLibraryView processFilter={bp.abbr} />
          </div>
        )}

      </div>
    </div>
  );
}

/* REMOVED: old inline RACM / Risks / Controls / Workflows tab content */
/* These tabs now embed existing module components directly */

// ─── kept for reference: old code boundary ───
const __OLD_INLINE_TABS_REMOVED__ = null; void __OLD_INLINE_TABS_REMOVED__;
// The following inline tab code (RACM sub-process accordions, risk health donuts,
// control tables, workflow cards) has been replaced by embedding:
// - AuditPlanningView (embedded mode) for RACM
// - RiskRegister for Risk Register
// - ControlLibraryView for Control Library
// - WorkflowLibraryView for Workflows

/* ─── Business Processes List ─── */
export default function BusinessProcesses({ selectedBPId, onSelectBP, onOpenEngagement }: Props) {
  const [tab, setTab] = useState<HubTabId>('engagements');
  const [search, setSearch] = useState('');
  const { addToast } = useToast();

  if (selectedBPId) {
    const bp = BUSINESS_PROCESSES.find(b => b.id === selectedBPId);
    if (bp) return <BPDetailView bp={bp} onBack={() => onSelectBP(null)} />;
  }

  const activeTabLabel = HUB_TABS.find(t => t.id === tab)!.label;

  // Filtered counts + lists per tab
  const lcSearch = search.trim().toLowerCase();
  const filteredEngagements = ENGAGEMENTS.filter(e => {
    if (!lcSearch) return true;
    return e.name.toLowerCase().includes(lcSearch) || e.owner.toLowerCase().includes(lcSearch) || e.type.toLowerCase().includes(lcSearch);
  });
  const filteredBPs = BUSINESS_PROCESSES.filter(b => {
    if (!lcSearch) return true;
    return b.name.toLowerCase().includes(lcSearch) || b.abbr.toLowerCase().includes(lcSearch);
  });

  const newButtonLabel = tab === 'engagements' ? 'New engagement' : 'Add process';
  const onNewClick = () => addToast({
    type: 'info',
    message: tab === 'engagements'
      ? 'New engagement wizard — coming soon.'
      : 'Add process wizard — coming soon.',
  });

  return (
    <div className="h-full overflow-y-auto bg-white bg-mesh-gradient relative">
      <Orb hoverIntensity={0.06} rotateOnHover hue={275} opacity={0.05} />

      <div className="p-8 relative">
        {/* Header */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary to-primary-medium text-white">
                <Building2 size={16} />
              </div>
              <h1 className="text-xl font-bold text-text">Process Hub</h1>
            </div>
            <p className="text-sm text-text-secondary mt-1 ml-9">
              {tab === 'engagements'
                ? 'Active and historical audit engagements across your business.'
                : 'End-to-end business processes with linked SOPs, RACMs, controls and workflows.'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onNewClick}
              className="flex items-center gap-1.5 px-3 py-2 border border-primary/30 bg-primary/5 rounded-lg text-[12px] font-medium text-primary hover:bg-primary/10 transition-colors cursor-pointer"
            >
              <Plus size={13} />
              {newButtonLabel}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center border-b border-border-light mb-4">
          {HUB_TABS.map(t => {
            const Icon = t.icon;
            const isActive = tab === t.id;
            const count = t.id === 'engagements' ? ENGAGEMENTS.length : BUSINESS_PROCESSES.length;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors cursor-pointer ${
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-text-muted hover:text-text-secondary'
                }`}
              >
                <Icon size={14} />
                {t.label}
                <span className={`tabular-nums text-[11px] ${isActive ? 'text-primary' : 'text-text-muted'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder={`Search ${activeTabLabel.toLowerCase()}…`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 h-9 rounded-md border border-border-light bg-white text-[13px] text-text placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        {/* Tab content */}
        <div>
        <AnimatePresence mode="wait">
          {tab === 'engagements' ? (
            <motion.div
              key="engagements"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="grid grid-cols-2 gap-5"
            >
              {filteredEngagements.map((e, i) => (
                <EngagementCard
                  key={e.id}
                  eng={e}
                  index={i}
                  onOpen={() => onOpenEngagement?.(e.id)}
                />
              ))}
              {filteredEngagements.length === 0 && (
                <div className="col-span-2 text-center py-16 text-[13px] text-text-muted">
                  No engagements match "{search}".
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="bps"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
            >
              {/* AI Insight Banner */}
              <div className="bg-gradient-to-r from-primary-xlight via-white to-primary-xlight rounded-2xl border border-primary/10 p-5 mb-6 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-medium flex items-center justify-center shrink-0">
                  <Sparkles size={18} className="text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-[13px] font-semibold text-text">AI Coverage Analysis</div>
                  <div className="text-[12px] text-text-secondary mt-0.5">
                    2 processes are below 60% control coverage. <span className="text-primary font-semibold cursor-pointer hover:underline">View recommendations</span>
                  </div>
                </div>
                <div className="flex gap-4 shrink-0">
                  <div className="text-center">
                    <div className="text-lg font-bold font-mono text-text">{BUSINESS_PROCESSES.length}</div>
                    <div className="text-[12px] text-text-muted">Processes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold font-mono text-primary">{Math.round(BUSINESS_PROCESSES.reduce((s, b) => s + b.coverage, 0) / BUSINESS_PROCESSES.length)}%</div>
                    <div className="text-[12px] text-text-muted">Avg Coverage</div>
                  </div>
                </div>
              </div>

              {/* BP Cards — 3D Hover */}
              <div className="grid grid-cols-2 gap-5">
                {filteredBPs.map((bp, i) => (
                  <motion.div
                    key={bp.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <CardContainer containerClassName="w-full">
                      <CardBody
                        className="bg-white rounded-2xl border border-border-light p-6 cursor-pointer hover:shadow-primary/5 hover:border-primary/20 active:scale-[0.998] transition-all duration-300 group relative overflow-hidden"
                      >
                        {/* Accent gradient orb */}
                        <div
                          className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-[0.07] blur-2xl pointer-events-none"
                          style={{ background: bp.color }}
                        />
                        <div
                          className="absolute bottom-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ background: `linear-gradient(90deg, ${bp.color}, ${bp.color}80, transparent)` }}
                        />

                        <div onClick={() => onSelectBP(bp.id)} className="relative">
                          <CardItem translateZ={40}>
                            <div className="flex items-center gap-3 mb-5">
                              <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-sm transition-transform duration-300" style={{ background: bp.color + '1a' }}>
                                <span className="text-sm font-bold" style={{ color: bp.color }}>{bp.abbr}</span>
                              </div>
                              <div className="flex-1">
                                <div className="text-[15px] font-semibold text-text group-hover:text-primary transition-colors">{bp.name}</div>
                                <div className="text-[12px] text-text-muted">FY 2025–26</div>
                              </div>
                              <ChevronRight size={15} className="text-text-muted opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                            </div>
                          </CardItem>

                          <CardItem translateZ={25}>
                            <div className="grid grid-cols-4 gap-3 mb-5">
                              {[
                                { l: 'Risks', v: bp.risks, c: '#dc2626' },
                                { l: 'Controls', v: bp.controls, c: '#0284c7' },
                                { l: 'SOPs', v: bp.sops, c: '#16a34a' },
                                { l: 'Workflows', v: bp.workflows, c: '#d97706' },
                              ].map(s => (
                                <div key={s.l} className="text-center p-2 rounded-lg bg-surface-2/80 border border-border-light/50">
                                  <div className="text-lg font-bold text-text leading-none mb-0.5">{s.v}</div>
                                  <div className="text-[12px] text-text-muted font-medium">{s.l}</div>
                                </div>
                              ))}
                            </div>
                          </CardItem>

                          <CardItem translateZ={15}>
                            <div className="flex items-center gap-3">
                              <div className="flex-1 h-2.5 bg-border-light rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${bp.coverage}%` }}
                                  transition={{ duration: 0.8, delay: 0.2 + i * 0.1 }}
                                  className="h-full rounded-full"
                                  style={{ background: `linear-gradient(90deg, ${bp.color}, ${bp.color}cc)` }}
                                />
                              </div>
                              <span className="text-[13px] font-bold font-mono" style={{ color: bp.color }}>{bp.coverage}%</span>
                            </div>
                          </CardItem>
                        </div>
                      </CardBody>
                    </CardContainer>
                  </motion.div>
                ))}
                {filteredBPs.length === 0 && (
                  <div className="col-span-2 text-center py-16 text-[13px] text-text-muted">
                    No business processes match "{search}".
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/* ─── Engagement Card (used by Engagements tab) ─── */
function EngagementCard({ eng, index, onOpen }: { eng: typeof ENGAGEMENTS[0]; index: number; onOpen: () => void }) {
  const statusTone =
    eng.status === 'active'   ? { bg: 'bg-evidence-50', text: 'text-evidence-700', label: 'In fieldwork' } :
    eng.status === 'complete' ? { bg: 'bg-compliant-50', text: 'text-compliant-700', label: 'Closed' } :
    eng.status === 'draft'    ? { bg: 'bg-paper-100',   text: 'text-ink-600',      label: 'Planned' } :
                                { bg: 'bg-paper-100',   text: 'text-ink-600',      label: eng.status };

  const progressPct = eng.controls > 0 ? Math.round((eng.tested / eng.controls) * 100) : 0;
  const effectivePct = eng.tested > 0 ? Math.round((eng.effective / eng.tested) * 100) : 0;

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      onClick={onOpen}
      className="text-left group relative bg-white rounded-2xl border border-border-light p-6 hover:border-primary/20 hover:shadow-sm transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between gap-3 mb-5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-primary-xlight flex items-center justify-center shrink-0">
            <Briefcase size={18} className="text-primary" />
          </div>
          <div className="min-w-0">
            <div className="text-[15px] font-semibold text-text group-hover:text-primary transition-colors truncate">{eng.name}</div>
            <div className="text-[12px] text-text-muted mt-0.5 flex items-center gap-2">
              <span className="font-mono">{eng.id.toUpperCase()}</span>
              <span className="text-text-muted/50">·</span>
              <span>{eng.type}</span>
            </div>
          </div>
        </div>
        <span className={`inline-flex items-center px-2 h-6 rounded-full text-[11px] font-semibold whitespace-nowrap ${statusTone.bg} ${statusTone.text}`}>
          {statusTone.label}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="rounded-lg bg-surface-2/80 border border-border-light/50 p-2.5">
          <div className="text-[18px] font-semibold text-text tabular-nums leading-none mb-1">{eng.controls}</div>
          <div className="text-[11px] text-text-muted">Controls</div>
        </div>
        <div className="rounded-lg bg-surface-2/80 border border-border-light/50 p-2.5">
          <div className="text-[18px] font-semibold text-text tabular-nums leading-none mb-1">{eng.tested}</div>
          <div className="text-[11px] text-text-muted">Tested</div>
        </div>
        <div className="rounded-lg bg-surface-2/80 border border-border-light/50 p-2.5">
          <div className={`text-[18px] font-semibold tabular-nums leading-none mb-1 ${eng.deficiencies > 0 ? 'text-risk-700' : 'text-text'}`}>{eng.deficiencies}</div>
          <div className="text-[11px] text-text-muted">Deficiencies</div>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-1.5 bg-surface-2 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.6, delay: 0.15 + index * 0.05 }}
            className="h-full rounded-full bg-primary"
          />
        </div>
        <span className="text-[12px] font-semibold text-text-secondary tabular-nums">{progressPct}%</span>
      </div>

      <div className="flex items-center justify-between text-[12px] text-text-muted">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5"><Users size={11} />{eng.owner}</span>
          <span className="text-text-muted/50">·</span>
          <span className="flex items-center gap-1.5"><Calendar size={11} />{eng.start} – {eng.end}</span>
        </div>
        {eng.tested > 0 && (
          <span className="font-mono text-[11px]">{effectivePct}% effective</span>
        )}
      </div>
    </motion.button>
  );
}
