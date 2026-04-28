import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, Plus, Upload, Link2,
  Clock, Play, ArrowUpRight,
  ChevronRight, ChevronDown, Sparkles, FileSpreadsheet, X, Check,
  ArrowLeft, Shield, Workflow, CheckCircle2,
  ArrowRight, TrendingUp, RefreshCw, GitBranch, Network,
  Zap, Eye, Building2, Briefcase, Users, Calendar
} from 'lucide-react';
import { BUSINESS_PROCESSES, SOPS, RACMS, RISKS, CONTROLS, WORKFLOWS, SOP_FLOWS, SOP_AI_RECOMMENDATIONS, ENGAGEMENTS } from '../../data/mockData';
import { StatusBadge, SeverityBadge, FrameworkBadge, TypeBadge, Avatar } from '../shared/StatusBadge';
import { CardContainer, CardBody, CardItem } from '../shared/3DCard';
import Orb from '../shared/Orb';
import { useToast } from '../shared/Toast';

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

/* ─── Link Controls Modal ─── */
function LinkControlsModal({ risk, onClose }: { risk: typeof RISKS[0]; onClose: () => void }) {
  const [selected, setSelected] = useState<Set<string>>(
    new Set(CONTROLS.filter(c => c.riskId === risk.id).map(c => c.id))
  );

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-end">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ x: 400, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 400, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-[400px] h-full bg-white shadow-2xl overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b border-border-light px-6 py-4 z-10">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-bold text-text">Link Controls</h2>
            <button onClick={onClose} className="p-1.5 hover:bg-paper-50 rounded-lg transition-colors">
              <X size={16} className="text-text-muted" />
            </button>
          </div>
          <p className="text-[12px] text-text-muted">Select controls to mitigate this risk</p>
          <div className="mt-3 p-3 rounded-xl bg-primary-xlight border border-primary/10">
            <div className="text-[12px] text-primary font-bold mb-1">Risk</div>
            <div className="text-[13px] font-medium text-text">{risk.name}</div>
            <div className="text-[12px] text-text-muted mt-1">{risk.id} · <SeverityBadge severity={risk.severity} /></div>
          </div>
        </div>

        <div className="px-10 py-4 space-y-2">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={13} className="text-primary" />
            <span className="text-[12px] font-semibold text-primary">AI Suggested Controls</span>
          </div>

          {CONTROLS.map(ctl => {
            const isSelected = selected.has(ctl.id);
            return (
              <motion.div
                key={ctl.id}
                layout
                onClick={() => toggle(ctl.id)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ai-card ${
                  isSelected
                    ? 'border-primary bg-primary-xlight shadow-sm'
                    : 'border-border-light bg-white hover:border-primary/20'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                    isSelected ? 'border-primary bg-primary' : 'border-gray-300'
                  }`}>
                    {isSelected && <Check size={12} className="text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[13px] font-semibold text-text">{ctl.name}</span>
                      {ctl.isKey && (
                        <span className="text-[12px] font-medium bg-mitigated-50 text-mitigated-700 px-2 h-5 inline-flex items-center rounded-full">Key</span>
                      )}
                    </div>
                    <p className="text-[12px] text-text-muted leading-relaxed">{ctl.desc}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[12px] font-mono text-text-muted/60">{ctl.id}</span>
                      <StatusBadge status={ctl.status} />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="sticky bottom-0 bg-white border-t border-border-light px-6 py-4 flex items-center justify-between">
          <span className="text-[12px] text-text-muted">{selected.size} controls selected</span>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="px-4 py-2 border border-border rounded-lg text-[13px] font-medium text-text-secondary hover:bg-paper-50 transition-colors">
              Cancel
            </button>
            <button onClick={onClose} className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-[13px] font-semibold transition-colors flex items-center gap-1.5">
              <Check size={14} />
              Save Links
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Upload SOP Modal ─── */
function UploadSOPModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative bg-white rounded-2xl shadow-2xl w-[560px] overflow-hidden"
      >
        <div className="px-10 py-5 border-b border-border-light">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-text">Upload SOP</h2>
            <button onClick={onClose} className="p-1.5 hover:bg-paper-50 rounded-lg"><X size={16} className="text-text-muted" /></button>
          </div>
          <p className="text-[12px] text-text-muted mt-1">AI will automatically scaffold a RACM from the uploaded document</p>
        </div>

        <div className="p-6">
          <div className="border-2 border-dashed border-primary/30 rounded-2xl p-10 text-center bg-primary-xlight/30 hover:bg-primary-xlight/50 transition-colors cursor-pointer">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Upload size={22} className="text-primary" />
            </div>
            <div className="text-[14px] font-semibold text-text mb-1">Drop your SOP file here</div>
            <div className="text-[12px] text-text-muted">PDF, DOCX up to 50MB</div>
            <div className="mt-4 flex items-center justify-center gap-2">
              <Sparkles size={13} className="text-primary" />
              <span className="text-[12px] text-primary font-semibold">AI will extract risks and controls automatically</span>
            </div>
          </div>
        </div>

        <div className="px-10 py-4 border-t border-border-light flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 border border-border rounded-lg text-[13px] text-text-secondary hover:bg-paper-50">Cancel</button>
          <button onClick={onClose} className="px-4 py-2 bg-primary text-white rounded-lg text-[13px] font-semibold hover:bg-primary-hover flex items-center gap-1.5">
            <Upload size={14} />
            Upload & Process
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── SOP Flow Chart ─── */
function SOPFlowChart({ steps }: { steps: typeof SOP_FLOWS[string] }) {
  const nodeStyles: Record<string, string> = {
    start: 'bg-compliant-50 border-compliant text-compliant-700',
    process: 'bg-evidence-50 border-blue-300 text-evidence-700',
    decision: 'bg-mitigated-50 border-mitigated text-mitigated-700',
    end: 'bg-risk-50 border-risk text-risk-700',
  };
  const nodeShapes: Record<string, string> = {
    start: 'rounded-full px-4 py-2',
    process: 'rounded-xl px-4 py-2.5',
    decision: 'rounded-xl px-4 py-2.5',
    end: 'rounded-full px-4 py-2',
  };
  const nodeIcons: Record<string, string> = {
    start: 'bg-compliant',
    process: 'bg-evidence',
    decision: 'bg-mitigated',
    end: 'bg-risk',
  };

  return (
    <div className="flex flex-col items-center gap-1 py-4">
      {steps.map((step, i) => (
        <div key={step.id} className="flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.08 }}
            className={`border-2 ${nodeStyles[step.type]} ${nodeShapes[step.type]} text-[12px] font-semibold text-center min-w-[120px] shadow-sm relative`}
          >
            {step.type === 'decision' && (
              <div className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ${nodeIcons[step.type]} ring-2 ring-white`} />
            )}
            {step.label.split('\n').map((line, j) => <div key={j}>{line}</div>)}
          </motion.div>
          {i < steps.length - 1 && (
            <div className="flex flex-col items-center">
              <div className="w-px h-4 bg-gray-300" />
              <ChevronDown size={12} className="text-ink-500 -mt-1" />
            </div>
          )}
          {step.type === 'decision' && step.next && step.next.length > 1 && (
            <div className="flex items-center gap-1 -mt-1 mb-1">
              <span className="text-[12px] text-compliant-700 font-bold">Yes</span>
              <span className="text-[12px] text-ink-500 mx-2">|</span>
              <span className="text-[12px] text-risk-700 font-bold">No</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ─── SOP Relationship Map ─── */
function SOPRelationshipMap({ sopId, bpId }: { sopId: string; bpId: string }) {
  const sop = SOPS.find(s => s.id === sopId);
  const relatedRacms = RACMS.filter(r => r.sopId === sopId);
  const relatedRisks = RISKS.filter(r => r.bpId === bpId).slice(0, 4);
  const relatedControls = CONTROLS.filter(c => relatedRisks.some(r => r.id === c.riskId)).slice(0, 4);

  return (
    <div className="flex items-start gap-4 overflow-x-auto py-4 px-2">
      {/* SOP */}
      <div className="flex flex-col items-center shrink-0 min-w-[120px]">
        <div className="px-3 py-2.5 bg-primary/10 border border-primary/20 rounded-xl text-center w-full">
          <div className="text-[12px] font-bold text-primary mb-0.5">SOP</div>
          <div className="text-[12px] font-semibold text-text leading-tight">{sop?.name || sopId}</div>
        </div>
      </div>
      <div className="flex items-center self-center shrink-0"><ArrowRight size={16} className="text-text-muted" /></div>
      {/* RACMs */}
      <div className="flex flex-col gap-1.5 shrink-0 min-w-[130px]">
        <div className="text-[12px] font-bold text-text-muted">RACMs</div>
        {relatedRacms.length > 0 ? relatedRacms.map(r => (
          <div key={r.id} className="px-2.5 py-1.5 bg-evidence-50 border border-evidence rounded-lg">
            <div className="text-[12px] font-semibold text-evidence-700">{r.id}</div>
            <div className="text-[12px] text-evidence-700 truncate">{r.name}</div>
          </div>
        )) : <div className="text-[12px] text-text-muted italic">None linked</div>}
      </div>
      <div className="flex items-center self-center shrink-0"><ArrowRight size={16} className="text-text-muted" /></div>
      {/* Risks */}
      <div className="flex flex-col gap-1.5 shrink-0 min-w-[140px]">
        <div className="text-[12px] font-bold text-text-muted">Risks</div>
        {relatedRisks.map(r => (
          <div key={r.id} className="px-2.5 py-1.5 bg-high-50 border border-high rounded-lg">
            <div className="text-[12px] font-semibold text-high-700">{r.id}</div>
            <div className="text-[12px] text-high-700 leading-tight truncate max-w-[130px]">{r.name.split(' ').slice(0, 4).join(' ')}...</div>
          </div>
        ))}
      </div>
      <div className="flex items-center self-center shrink-0"><ArrowRight size={16} className="text-text-muted" /></div>
      {/* Controls */}
      <div className="flex flex-col gap-1.5 shrink-0 min-w-[140px]">
        <div className="text-[12px] font-bold text-text-muted">Controls</div>
        {relatedControls.map(c => (
          <div key={c.id} className="px-2.5 py-1.5 bg-compliant-50 border border-compliant rounded-lg">
            <div className="text-[12px] font-semibold text-compliant-700">{c.id}</div>
            <div className="text-[12px] text-compliant-700 leading-tight truncate max-w-[130px]">{c.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── SOP AI Recommendations ─── */
function SOPAIRecommendations({ sopId }: { sopId: string }) {
  const recommendations = SOP_AI_RECOMMENDATIONS[sopId] || [];
  const [expanded, setExpanded] = useState(false);

  if (recommendations.length === 0) return null;

  const typeConfig: Record<string, { icon: typeof Plus; bg: string; text: string }> = {
    add: { icon: Plus, bg: 'bg-compliant-50 text-compliant-700', text: 'text-compliant-700' },
    improve: { icon: TrendingUp, bg: 'bg-evidence-50 text-evidence-700', text: 'text-evidence-700' },
    remove: { icon: X, bg: 'bg-risk-50 text-risk-700', text: 'text-risk-700' },
    update: { icon: RefreshCw, bg: 'bg-mitigated-50 text-mitigated-700', text: 'text-mitigated-700' },
  };

  const impactColors: Record<string, string> = {
    high: 'text-risk-700',
    medium: 'text-mitigated-700',
    low: 'text-compliant-700',
  };

  return (
    <div className="mt-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-[12px] font-semibold text-primary hover:underline"
      >
        <Sparkles size={13} className="text-primary" />
        AI Recommendations
        <span className="text-[12px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">{recommendations.length}</span>
        <ChevronDown size={12} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-2 mt-3">
              {recommendations.map((rec, i) => {
                const config = typeConfig[rec.type];
                const TypeIcon = config.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-start gap-2.5 p-3 rounded-xl bg-paper-50 border border-gray-200"
                  >
                    <div className={`p-1.5 rounded-lg shrink-0 ${config.bg}`}>
                      <TypeIcon size={12} />
                    </div>
                    <div className="flex-1">
                      <div className="text-[12px] text-ink-500 leading-relaxed">{rec.text}</div>
                      <div className={`text-[12px] font-bold mt-1 ${impactColors[rec.impact]}`}>
                        {rec.impact} impact
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Generate expanded workflow list for demo — simulates 100+ workflows per process
const getExpandedWorkflows = (bpId: string) => {
  const real = WORKFLOWS.filter(w => w.bpId === bpId);
  const types = ['Detection', 'Monitoring', 'Compliance', 'Reconciliation'];
  const statuses = ['active', 'active', 'active', 'paused', 'draft'] as const;
  const names = [
    'Payment Velocity Monitor', 'Threshold Breach Detector', 'Aging Analysis Runner',
    'Approval Chain Validator', 'Bank Account Change Tracker', 'Credit Note Reconciler',
    'Debit Memo Matcher', 'Early Payment Discount Tracker', 'Foreign Currency Validator',
    'GRN Mismatch Detector', 'Holdback Payment Monitor', 'Invoice Aging Alert',
    'Journal Posting Validator', 'KPI Threshold Monitor', 'Late Payment Predictor',
    'Manual Entry Detector', 'Negative Balance Flagger', 'Orphan PO Detector',
    'Payment Terms Validator', 'Queue Priority Analyzer', 'Receipt Matching Engine',
    'Settlement Delay Tracker', 'Tax Compliance Checker', 'Unmatched Receipt Finder',
    'Vendor Duplicate Scanner', 'Withholding Tax Validator', 'Year-End Accrual Checker',
    'Zero Value Invoice Flagger', 'Abnormal Transaction Sizer', 'Budget Overrun Detector',
  ];
  const extra = names.map((name, i) => ({
    id: `wf-gen-${bpId}-${i}`,
    name,
    desc: `Automated ${name.toLowerCase()} for ${bpId.toUpperCase()} process`,
    bpId,
    type: types[i % types.length],
    lastRun: `Mar ${20 - (i % 15)}, 2026`,
    runs: Math.floor(Math.random() * 50) + 1,
    status: statuses[i % statuses.length],
    steps: ['Ingest', 'Process', 'Analyze', 'Report', 'Notify'],
  }));
  return [...real, ...extra];
};

const RACM_RECOMMENDED_CONTROLS: Record<string, Array<{ control: string; risk: string; confidence: number; type: 'automated' | 'manual' | 'detective' }>> = {
  'RACM-001': [
    { control: 'Automated bank account verification before payment', risk: 'Unauthorized payments', confidence: 94, type: 'automated' },
    { control: 'Real-time vendor master change alerts', risk: 'Vendor data manipulation', confidence: 88, type: 'detective' },
  ],
  'RACM-002': [
    { control: 'Budget-to-PO automated threshold check', risk: 'Budget overrun', confidence: 91, type: 'automated' },
    { control: 'Segregation of duties — PO creator vs approver', risk: 'Unauthorized PO', confidence: 96, type: 'manual' },
  ],
  'RACM-003': [
    { control: 'Automated credit scoring refresh on repeat orders', risk: 'Credit limit breach', confidence: 85, type: 'automated' },
    { control: 'Revenue recognition timing validation', risk: 'Revenue misstatement', confidence: 92, type: 'detective' },
  ],
  'RACM-004': [
    { control: 'Automated sub-ledger to GL reconciliation', risk: 'GL discrepancy', confidence: 97, type: 'automated' },
    { control: 'Journal entry anomaly detection (AI-powered)', risk: 'Fraudulent entries', confidence: 89, type: 'detective' },
  ],
  'RACM-005': [
    { control: 'Inter-company elimination automated check', risk: 'Subsidiary discrepancies', confidence: 93, type: 'automated' },
    { control: 'Month-end variance threshold alerting', risk: 'Reconciliation gaps', confidence: 87, type: 'detective' },
  ],
  'RACM-006': [
    { control: 'Contract expiry proactive alerting (90/60/30 days)', risk: 'Missed renewals', confidence: 95, type: 'automated' },
    { control: 'Vendor compliance document verification workflow', risk: 'Non-compliant vendors', confidence: 90, type: 'manual' },
  ],
};

/* ─── RACM Workflow Panel (collapsible, searchable, paginated) ─── */
function RACMWorkflowPanel({ bpId }: { bpId: string }) {
  const [expanded, setExpanded] = useState(false);
  const [search, setSearch] = useState('');
  const [showCount, setShowCount] = useState(5);

  const allWorkflows = getExpandedWorkflows(bpId);
  const filtered = search
    ? allWorkflows.filter(w => w.name.toLowerCase().includes(search.toLowerCase()))
    : allWorkflows;
  const visible = filtered.slice(0, showCount);
  const hasMore = filtered.length > showCount;

  return (
    <div className="mt-3">
      <button onClick={() => setExpanded(p => !p)} className="flex items-center gap-2 text-[12px] font-semibold text-primary cursor-pointer hover:underline">
        <Workflow size={12} />
        {allWorkflows.length} Linked Workflows
        <ChevronDown size={11} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            {/* Search */}
            <div className="relative mt-2 mb-2">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                value={search}
                onChange={e => { setSearch(e.target.value); setShowCount(5); }}
                placeholder="Search workflows..."
                className="w-full pl-7 pr-3 py-1.5 rounded-lg border border-border-light text-[12px] focus:outline-none focus:border-primary/40 transition-all bg-white"
              />
              {search && <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2"><X size={10} className="text-text-muted" /></button>}
            </div>

            {/* Results count */}
            <div className="text-[12px] text-text-muted mb-1.5">{filtered.length} workflow{filtered.length !== 1 ? 's' : ''} found</div>

            {/* Workflow list */}
            <div className="space-y-1 max-h-[200px] overflow-y-auto">
              {visible.map(wf => (
                <div key={wf.id} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-primary-xlight/50 transition-colors cursor-pointer group">
                  <Workflow size={10} className="text-primary/60 shrink-0" />
                  <span className="text-[12px] text-text group-hover:text-primary transition-colors flex-1 truncate">{wf.name}</span>
                  <span className={`text-[12px] font-bold px-1.5 py-0.5 rounded-full ${
                    wf.status === 'active' ? 'bg-compliant-50 text-compliant-700' : wf.status === 'paused' ? 'bg-mitigated-50 text-mitigated-700' : 'bg-paper-50 text-ink-500'
                  }`}>{wf.status}</span>
                  <span className="text-[12px] text-text-muted">{wf.runs} runs</span>
                </div>
              ))}
            </div>

            {/* Load more */}
            {hasMore && (
              <button onClick={() => setShowCount(p => p + 10)} className="w-full text-center text-[12px] text-primary font-medium py-1.5 hover:underline cursor-pointer mt-1">
                Show more ({filtered.length - showCount} remaining)
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Sub-process helpers (each SOP defines a sub-process) ─── */

interface SubProcess {
  id: string;       // = sop.id
  name: string;     // SOP name minus " SOP" suffix
  sopId: string;
  racmId: string | null;
}

function deriveSubProcesses(bpId: string): SubProcess[] {
  return SOPS.filter(s => s.bpId === bpId).map(sop => ({
    id: sop.id,
    name: sop.name.replace(/\s*SOP$/i, '').trim(),
    sopId: sop.id,
    racmId: sop.racmId,
  }));
}

// Round-robin partition: stable assignment of items across sub-processes by index.
function partitionByIndex<T>(items: T[], subProcesses: SubProcess[]): Map<string, T[]> {
  const result = new Map<string, T[]>();
  subProcesses.forEach(sp => result.set(sp.id, []));
  if (subProcesses.length === 0) return result;
  items.forEach((item, idx) => {
    const sp = subProcesses[idx % subProcesses.length];
    result.get(sp.id)!.push(item);
  });
  return result;
}

/* ─── Sub-process accordion (used inside every BP detail tab) ─── */
function SubProcessAccordion({
  sp, count, defaultOpen = true, children,
}: {
  sp: SubProcess; count: number; defaultOpen?: boolean; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-border-light bg-white overflow-hidden mb-3">
      <button
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-paper-50/60 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <ChevronDown size={14} className={`text-text-muted transition-transform shrink-0 ${open ? '' : '-rotate-90'}`} />
          <span className="text-[13px] font-semibold text-text truncate">{sp.name}</span>
          <span className="text-[11px] text-text-muted tabular-nums shrink-0">{count}</span>
        </div>
        <span className="text-[11px] font-mono text-text-muted shrink-0">{sp.sopId.toUpperCase()}</span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-border-light"
          >
            <div className="p-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Link/unlink chip primitive ─── */
function LinkChip({
  label, sublabel, onUnlink, tone = 'brand',
}: {
  label: string; sublabel?: string; onUnlink: () => void; tone?: 'brand' | 'evidence' | 'compliant';
}) {
  const tones: Record<string, string> = {
    brand:     'bg-brand-50 text-brand-700 border-brand-100',
    evidence:  'bg-evidence-50 text-evidence-700 border-evidence-50',
    compliant: 'bg-compliant-50 text-compliant-700 border-compliant-50',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 pl-2 pr-1 h-6 rounded-full border text-[11px] font-medium ${tones[tone]}`}>
      <span className="truncate max-w-[180px]">{label}{sublabel && <span className="opacity-60"> · {sublabel}</span>}</span>
      <button
        onClick={(e) => { e.stopPropagation(); onUnlink(); }}
        aria-label={`Unlink ${label}`}
        className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-black/5 transition-colors cursor-pointer"
      >
        <X size={10} />
      </button>
    </span>
  );
}

/* ─── Risk health donut (compact SVG) ─── */
const HEALTH_TONES = {
  healthy:   { stroke: '#15803D', bg: 'bg-compliant-50', text: 'text-compliant-700', label: 'Healthy' },
  unhealthy: { stroke: '#B42318', bg: 'bg-risk-50',      text: 'text-risk-700',      label: 'Not healthy' },
  untested:  { stroke: '#6B5D82', bg: 'bg-paper-100',    text: 'text-ink-600',       label: 'Untested' },
} as const;

function RiskHealthDonut({ data }: { data: { healthy: number; unhealthy: number; untested: number } }) {
  const total = data.healthy + data.unhealthy + data.untested;
  const r = 38, c = 2 * Math.PI * r;
  const segs = (['healthy', 'unhealthy', 'untested'] as const).map(k => ({ k, v: data[k] }));
  let offset = 0;
  return (
    <div className="flex items-center gap-5">
      <div className="relative">
        <svg width={100} height={100} viewBox="0 0 100 100" className="-rotate-90">
          <circle cx={50} cy={50} r={r} fill="none" stroke="#F0EAF6" strokeWidth={12} />
          {total > 0 && segs.map(s => {
            const len = (s.v / total) * c;
            const dasharray = `${len} ${c - len}`;
            const cs = (
              <circle
                key={s.k}
                cx={50} cy={50} r={r}
                fill="none"
                stroke={HEALTH_TONES[s.k].stroke}
                strokeWidth={12}
                strokeDasharray={dasharray}
                strokeDashoffset={-offset}
              />
            );
            offset += len;
            return cs;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-[20px] font-semibold tabular-nums text-ink-900 leading-none">{total}</div>
          <div className="text-[10px] text-text-muted uppercase tracking-wide">Risks</div>
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        {segs.map(s => (
          <div key={s.k} className="flex items-center gap-2 text-[12px]">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: HEALTH_TONES[s.k].stroke }} />
            <span className="text-ink-700 w-[80px]">{HEALTH_TONES[s.k].label}</span>
            <span className="font-mono tabular-nums text-ink-900">{s.v}</span>
            <span className="text-text-muted">({total > 0 ? Math.round((s.v / total) * 100) : 0}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Sub-process × health heatmap ─── */
function RiskHealthHeatmap({
  rows,
}: {
  rows: { spName: string; healthy: number; unhealthy: number; untested: number }[];
}) {
  const max = Math.max(1, ...rows.flatMap(r => [r.healthy, r.unhealthy, r.untested]));
  const cellTone = (k: 'healthy' | 'unhealthy' | 'untested', v: number) => {
    const intensity = v / max; // 0–1
    const baseAlpha = v === 0 ? 0.06 : 0.18 + intensity * 0.62;
    const colour: Record<typeof k, string> = {
      healthy:   `rgba(21,128,61,${baseAlpha})`,
      unhealthy: `rgba(180,35,24,${baseAlpha})`,
      untested:  `rgba(107,93,130,${baseAlpha})`,
    };
    return colour[k];
  };

  return (
    <div className="overflow-hidden rounded-lg border border-border-light bg-white">
      <table className="w-full text-[12px]">
        <thead>
          <tr className="bg-paper-50/60 border-b border-border-light">
            <th className="text-left px-3 py-2 font-semibold text-text-secondary">Sub-process</th>
            <th className="text-center px-3 py-2 font-semibold text-compliant-700">Healthy</th>
            <th className="text-center px-3 py-2 font-semibold text-risk-700">Not healthy</th>
            <th className="text-center px-3 py-2 font-semibold text-ink-600">Untested</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.spName} className="border-b border-border-light last:border-0">
              <td className="px-3 py-2 font-medium text-text">{r.spName}</td>
              {(['healthy', 'unhealthy', 'untested'] as const).map(k => (
                <td key={k} className="px-3 py-2">
                  <div
                    className="inline-flex items-center justify-center w-full h-7 rounded font-mono tabular-nums text-[12.5px] text-ink-900"
                    style={{ background: cellTone(k, r[k]) }}
                  >
                    {r[k]}
                  </div>
                </td>
              ))}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={4} className="px-3 py-6 text-center text-text-muted">No sub-processes yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Compact multi-status pill ─── */
function StatusPillSm({ tone, label }: { tone: 'compliant' | 'risk' | 'mitigated' | 'evidence' | 'draft' | 'brand'; label: string }) {
  const map: Record<string, string> = {
    compliant: 'bg-compliant-50 text-compliant-700',
    risk:      'bg-risk-50 text-risk-700',
    mitigated: 'bg-mitigated-50 text-mitigated-700',
    evidence:  'bg-evidence-50 text-evidence-700',
    draft:     'bg-paper-100 text-ink-600',
    brand:     'bg-brand-50 text-brand-700',
  };
  return (
    <span className={`inline-flex items-center px-2 h-5 rounded-full text-[11px] font-semibold whitespace-nowrap ${map[tone]}`}>
      {label}
    </span>
  );
}

/* ─── Add-link picker (popover-style) ─── */
function AddLinkPicker<T extends { id: string; name: string }>({
  options, onPick, label = '+ Link',
}: {
  options: T[]; onPick: (id: string) => void; label?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative inline-block">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}
        className="inline-flex items-center gap-1 h-6 px-2 rounded-full border border-dashed border-border text-[11px] font-medium text-text-muted hover:border-primary/40 hover:text-primary transition-colors cursor-pointer"
      >
        {label}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute z-50 left-0 mt-1 w-64 rounded-lg border border-border-light bg-white shadow-md overflow-hidden">
            {options.length === 0 ? (
              <div className="px-3 py-3 text-[12px] text-text-muted">Nothing left to link.</div>
            ) : (
              options.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => { onPick(opt.id); setOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-[12.5px] text-text hover:bg-paper-50 transition-colors cursor-pointer"
                >
                  <Plus size={11} className="text-text-muted shrink-0" />
                  <span className="font-mono text-[11px] text-text-muted shrink-0">{opt.id}</span>
                  <span className="truncate">{opt.name}</span>
                </button>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

/* ─── BP Detail View ─── */
function BPDetailView({ bp, onBack }: {
  bp: typeof BUSINESS_PROCESSES[0]; onBack: () => void;
}) {
  const [tab, setTab] = useState<'sop' | 'racm' | 'risks' | 'controls' | 'workflows'>('sop');
  const [linkModal, setLinkModal] = useState<typeof RISKS[0] | null>(null);
  const [uploadModal, setUploadModal] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedWorkflows, setSelectedWorkflows] = useState<Set<string>>(new Set());
  const [sopVisuals, setSopVisuals] = useState<Record<string, 'flow' | 'map' | null>>({});
  const [racmFilterTag, setRacmFilterTag] = useState<string>('all');
  const [controlEngagementFilter, setControlEngagementFilter] = useState<string>('all');
  const [wfRacmFilter, setWfRacmFilter] = useState<string>('all');
  const [wfSopFilter, setWfSopFilter] = useState<string>('all');
  const [wfSpFilter, setWfSpFilter] = useState<string>('all');
  const { addToast } = useToast();

  const toggleSopVisual = (sopId: string, type: 'flow' | 'map') => {
    setSopVisuals(prev => ({ ...prev, [sopId]: prev[sopId] === type ? null : type }));
  };

  const toggleWorkflow = (id: string) => {
    setSelectedWorkflows(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleBulkRun = () => {
    const count = selectedWorkflows.size;
    addToast({ message: `Running ${count} workflows...`, type: 'info' });
    setTimeout(() => {
      addToast({ message: 'All workflows completed. Generating report...', type: 'success' });
      setTimeout(() => {
        addToast({ message: 'Report generated — view in Reports', type: 'success' });
        setBulkMode(false);
        setSelectedWorkflows(new Set());
      }, 1000);
    }, 2000);
  };

  const bpRacms = RACMS.filter(r => r.bpId === bp.id);
  const bpSops = SOPS.filter(s => s.bpId === bp.id);
  const bpWfs = WORKFLOWS.filter(w => w.bpId === bp.id);
  const bpRisks = RISKS.filter(r => r.bpId === bp.id);
  const bpRiskIds = new Set(bpRisks.map(r => r.id));
  const bpControls = CONTROLS.filter(c => bpRiskIds.has(c.riskId));

  // ─── Sub-process model + per-tab partition ───
  const subProcesses = useMemo(() => deriveSubProcesses(bp.id), [bp.id]);

  const risksBySP = useMemo(() => partitionByIndex(bpRisks, subProcesses), [bpRisks, subProcesses]);

  // Each control inherits its sub-process from its linked risk's assignment
  const riskToSP = useMemo(() => {
    const map = new Map<string, string>();
    if (subProcesses.length === 0) return map;
    bpRisks.forEach((r, idx) => map.set(r.id, subProcesses[idx % subProcesses.length].id));
    return map;
  }, [bpRisks, subProcesses]);

  const controlsBySP = useMemo(() => {
    const map = new Map<string, typeof bpControls>(subProcesses.map(sp => [sp.id, []]));
    bpControls.forEach(c => {
      const spId = riskToSP.get(c.riskId);
      if (spId && map.has(spId)) map.get(spId)!.push(c);
    });
    return map;
  }, [bpControls, riskToSP, subProcesses]);

  // ─── Mock derivations: risk health, version + multi-status, engagement assignment ───
  const RACM_VERSIONS = ['v2.1', 'v1.8', 'v3.0', 'v1.0'];
  const CTL_VERSIONS  = ['v2.0', 'v1.3', 'v1.0', 'v3.1', 'v2.5', 'v1.7', 'v1.1', 'v2.2'];
  const TEST_RESULTS  = ['Passed', 'Failing', 'Not run']     as const;
  const APPROVALS     = ['Approved', 'Pending review', 'Changes requested'] as const;
  const COVERAGE      = ['Full', 'Partial', 'Spot-check']    as const;
  type Health = 'healthy' | 'unhealthy' | 'untested';

  function getRiskHealth(risk: typeof bpRisks[0]): Health {
    if (risk.ctls === 0) return 'untested';
    if (risk.status === 'mitigated') return 'healthy';
    return 'unhealthy';
  }

  function getRacmMeta(racm: typeof bpRacms[0]) {
    const idx = bpRacms.findIndex(r => r.id === racm.id);
    return {
      version:  RACM_VERSIONS[idx % RACM_VERSIONS.length],
      lastTest: TEST_RESULTS[idx % TEST_RESULTS.length],
      approval: APPROVALS[(idx * 2 + 1) % APPROVALS.length],
    };
  }

  function getControlMeta(ctl: typeof bpControls[0]) {
    const idx = bpControls.findIndex(c => c.id === ctl.id);
    return {
      version:  CTL_VERSIONS[idx % CTL_VERSIONS.length],
      lastTest: TEST_RESULTS[idx % TEST_RESULTS.length],
      coverage: COVERAGE[(idx * 3) % COVERAGE.length],
    };
  }

  // Each control deterministically belongs to a subset of engagements that include this BP.
  const bpEngagements = useMemo(() => ENGAGEMENTS.filter(e => e.bps.includes(bp.id)), [bp.id]);
  function getControlEngagementIds(ctl: typeof bpControls[0]): string[] {
    if (bpEngagements.length === 0) return [];
    const idx = bpControls.findIndex(c => c.id === ctl.id);
    // Round-robin: each control belongs to ⌈half⌉ + 1 of the BP's engagements (deterministic, varied)
    return bpEngagements
      .filter((_, ei) => (idx + ei) % 2 === 0 || idx % bpEngagements.length === ei)
      .map(e => e.id);
  }

  // Workflow → sub-process (round-robin) and RACM (via the sub-process's RACM)
  function getWorkflowSubProcessId(wf: typeof bpWfs[0]): string | null {
    if (subProcesses.length === 0) return null;
    const idx = bpWfs.findIndex(w => w.id === wf.id);
    return subProcesses[idx % subProcesses.length].id;
  }
  function getWorkflowRacmId(wf: typeof bpWfs[0]): string | null {
    const spId = getWorkflowSubProcessId(wf);
    if (!spId) return null;
    return subProcesses.find(sp => sp.id === spId)?.racmId ?? null;
  }
  function getWorkflowSopId(wf: typeof bpWfs[0]): string | null {
    return getWorkflowSubProcessId(wf); // sub-process id == sop id
  }

  // ─── Mocked link/unlink session state ───
  // SOP → RACM (1:1, may be unlinked)
  const [sopRacmLinks, setSopRacmLinks] = useState<Record<string, string | null>>(() => {
    const init: Record<string, string | null> = {};
    bpSops.forEach(s => { init[s.id] = s.racmId; });
    return init;
  });

  // RACM → controls (many controls per RACM, partitioned from BP controls by round-robin)
  const [racmControlLinks, setRacmControlLinks] = useState<Record<string, Set<string>>>(() => {
    const init: Record<string, Set<string>> = {};
    bpRacms.forEach((r, ri) => {
      init[r.id] = new Set(
        bpControls.filter((_, ci) => bpRacms.length > 0 && ci % bpRacms.length === ri).map(c => c.id)
      );
    });
    return init;
  });

  // Control → workflows (many workflows per control, round-robin)
  const [controlWorkflowLinks, setControlWorkflowLinks] = useState<Record<string, Set<string>>>(() => {
    const init: Record<string, Set<string>> = {};
    bpControls.forEach((c, ci) => {
      init[c.id] = new Set(bpWfs.length > 0 ? [bpWfs[ci % bpWfs.length].id] : []);
    });
    return init;
  });

  // ─── Link/unlink handlers ───
  const linkRacmToSop = (sopId: string, racmId: string) => {
    setSopRacmLinks(prev => ({ ...prev, [sopId]: racmId }));
    const racm = bpRacms.find(r => r.id === racmId);
    addToast({ type: 'success', message: `Linked ${racm?.name ?? racmId} to ${bpSops.find(s => s.id === sopId)?.name ?? sopId}` });
  };
  const unlinkRacmFromSop = (sopId: string) => {
    setSopRacmLinks(prev => ({ ...prev, [sopId]: null }));
    addToast({ type: 'info', message: 'RACM unlinked.' });
  };

  const linkControlToRacm = (racmId: string, controlId: string) => {
    setRacmControlLinks(prev => {
      const next = { ...prev };
      next[racmId] = new Set(prev[racmId] ?? []);
      next[racmId].add(controlId);
      return next;
    });
    addToast({ type: 'success', message: `Control ${controlId} linked.` });
  };
  const unlinkControlFromRacm = (racmId: string, controlId: string) => {
    setRacmControlLinks(prev => {
      const next = { ...prev };
      next[racmId] = new Set(prev[racmId] ?? []);
      next[racmId].delete(controlId);
      return next;
    });
    addToast({ type: 'info', message: `Control ${controlId} unlinked.` });
  };

  const linkWorkflowToControl = (controlId: string, workflowId: string) => {
    setControlWorkflowLinks(prev => {
      const next = { ...prev };
      next[controlId] = new Set(prev[controlId] ?? []);
      next[controlId].add(workflowId);
      return next;
    });
    addToast({ type: 'success', message: `Workflow linked to ${controlId}.` });
  };
  const unlinkWorkflowFromControl = (controlId: string, workflowId: string) => {
    setControlWorkflowLinks(prev => {
      const next = { ...prev };
      next[controlId] = new Set(prev[controlId] ?? []);
      next[controlId].delete(workflowId);
      return next;
    });
    addToast({ type: 'info', message: `Workflow unlinked from ${controlId}.` });
  };

  const tabs = [
    { id: 'sop' as const,       label: 'SOP',             count: bpSops.length },
    { id: 'racm' as const,      label: 'RACM',            count: bpRacms.length },
    { id: 'risks' as const,     label: 'Risk register',   count: bpRisks.length },
    { id: 'controls' as const,  label: 'Control library', count: bpControls.length },
    { id: 'workflows' as const, label: 'Workflows',       count: bpWfs.length },
  ];

  return (
    <div className="h-full overflow-y-auto bg-surface-2">
      <AnimatePresence>
        {linkModal && <LinkControlsModal risk={linkModal} onClose={() => setLinkModal(null)} />}
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
            <div className="flex gap-2">
              <button onClick={() => setUploadModal(true)} className="flex items-center gap-1.5 px-3 py-2 border border-border rounded-lg text-[12px] font-medium text-text-secondary hover:bg-paper-50 transition-colors">
                <Upload size={13} />
                Upload SOP
              </button>
              <button className="flex items-center gap-1.5 px-3 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-[12px] font-semibold transition-colors">
                <Plus size={13} />
                Create RACM
              </button>
            </div>
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
              { l: 'Controls', v: bp.controls, tab: 'racm' as const },
              { l: 'Engagements', v: bpEngagements.length, tab: 'sop' as const },
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

          {/* Coverage bar */}
          <div className="mt-4 flex items-center gap-3">
            <div className="flex-1 h-2 bg-border-light rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${bp.coverage}%` }}
                transition={{ duration: 0.8 }}
                className="h-full rounded-full"
                style={{ background: bp.color }}
              />
            </div>
            <span className="text-[12px] font-bold font-mono shrink-0" style={{ color: bp.color }}>{bp.coverage}% coverage</span>
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
            <div onClick={() => setUploadModal(true)} className="border-2 border-dashed border-primary/20 rounded-2xl p-6 text-center cursor-pointer mb-6 bg-primary-xlight/20 hover:bg-primary-xlight/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Upload size={18} className="text-primary" />
              </div>
              <div className="text-[14px] font-bold text-text mb-1">Upload a new SOP</div>
              <div className="text-[12px] text-text-muted flex items-center justify-center gap-1.5">
                <Sparkles size={11} className="text-primary" />
                AI will automatically scaffold a RACM from the uploaded document
              </div>
            </div>

            {subProcesses.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border-light bg-white p-8 text-center text-[13px] text-text-muted">
                No SOPs uploaded yet — upload one above to define your first sub-process.
              </div>
            ) : (
              subProcesses.map(sp => {
                const sop = bpSops.find(s => s.id === sp.sopId);
                if (!sop) return null;
                const linkedRacmId = sopRacmLinks[sop.id];
                const linkedRacm = linkedRacmId ? bpRacms.find(r => r.id === linkedRacmId) : null;
                const unlinkedRacms = bpRacms.filter(r => !Object.values(sopRacmLinks).includes(r.id));
                const activeVisual = sopVisuals[sop.id] || null;
                const flowSteps = SOP_FLOWS[sop.id];

                return (
                  <SubProcessAccordion key={sp.id} sp={sp} count={1}>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-success-bg flex items-center justify-center shrink-0">
                        <FileSpreadsheet size={18} className="text-success" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-[13px] font-semibold text-text">{sop.name}</span>
                          <span className="text-[12px] font-bold bg-paper-50 text-text-muted px-1.5 py-0.5 rounded">{sop.version}</span>
                          <StatusBadge status={sop.status} />
                        </div>
                        <div className="text-[12px] text-text-muted">
                          Uploaded by {sop.by} · {sop.at} · {sop.risks} risks · {sop.controls} controls extracted
                        </div>
                      </div>
                    </div>

                    {/* Linked RACM chip OR prominent CTA */}
                    {linkedRacm ? (
                      <div className="mt-3 pt-3 border-t border-border-light flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-bold uppercase tracking-wide text-text-muted mr-1">RACM</span>
                        <LinkChip
                          label={linkedRacm.name}
                          sublabel={linkedRacm.id}
                          onUnlink={() => unlinkRacmFromSop(sop.id)}
                          tone="brand"
                        />
                        {unlinkedRacms.length > 0 && (
                          <span className="text-[11px] text-text-muted ml-1">or</span>
                        )}
                        {unlinkedRacms.length > 0 && (
                          <AddLinkPicker
                            options={unlinkedRacms.map(r => ({ id: r.id, name: r.name }))}
                            onPick={(racmId) => linkRacmToSop(sop.id, racmId)}
                            label="+ Link another"
                          />
                        )}
                      </div>
                    ) : (
                      <div className="mt-3 pt-3 border-t border-border-light">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles size={13} className="text-mitigated-700" />
                          <span className="text-[12.5px] font-semibold text-text">No RACM linked yet</span>
                        </div>
                        <p className="text-[12px] text-text-muted mb-3">
                          Generate a Risk &amp; Control Matrix from this SOP to start tracking risks and controls.
                        </p>
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => {
                              const newId = `RACM-NEW-${Date.now().toString(36).toUpperCase().slice(-4)}`;
                              addToast({ type: 'success', message: `RACM extracted from ${sop.name} via AI.` });
                              setSopRacmLinks(prev => ({ ...prev, [sop.id]: newId }));
                            }}
                            className="inline-flex items-center gap-1.5 px-3.5 h-9 rounded-md bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white text-[12.5px] font-semibold shadow-sm transition-colors cursor-pointer"
                          >
                            <Sparkles size={13} />
                            Extract with AI
                          </button>
                          <button
                            onClick={() => addToast({ type: 'info', message: 'RACM upload — drop your .xlsx to process.' })}
                            className="inline-flex items-center gap-1.5 px-3.5 h-9 rounded-md border border-border-light bg-white hover:border-brand-300 text-text text-[12.5px] font-semibold transition-colors cursor-pointer"
                          >
                            <Upload size={13} />
                            Upload RACM file
                          </button>
                          {unlinkedRacms.length > 0 && (
                            <>
                              <span className="text-[11px] text-text-muted ml-1">or pick existing</span>
                              <AddLinkPicker
                                options={unlinkedRacms.map(r => ({ id: r.id, name: r.name }))}
                                onPick={(racmId) => linkRacmToSop(sop.id, racmId)}
                                label="+ Link RACM"
                              />
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Visualization Toggle Buttons */}
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border-light">
                      {flowSteps && (
                        <button
                          onClick={() => toggleSopVisual(sop.id, 'flow')}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors cursor-pointer ${
                            activeVisual === 'flow'
                              ? 'bg-primary/10 text-primary border border-primary/20'
                              : 'bg-paper-50 text-ink-500 border border-gray-200 hover:bg-paper-50'
                          }`}
                        >
                          <GitBranch size={12} />
                          Process Flow
                        </button>
                      )}
                      <button
                        onClick={() => toggleSopVisual(sop.id, 'map')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors cursor-pointer ${
                          activeVisual === 'map'
                            ? 'bg-primary/10 text-primary border border-primary/20'
                            : 'bg-paper-50 text-ink-500 border border-gray-200 hover:bg-paper-50'
                        }`}
                      >
                        <Network size={12} />
                        Relationship Map
                      </button>
                    </div>

                    {/* Inline Visualizations */}
                    <AnimatePresence>
                      {activeVisual === 'flow' && flowSteps && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-3 pt-3 border-t border-border-light">
                            <div className="text-[12px] font-bold text-ink-500 mb-2">Process Flow</div>
                            <div className="bg-paper-50 rounded-xl p-4 border border-gray-200">
                              <SOPFlowChart steps={flowSteps} />
                            </div>
                          </div>
                        </motion.div>
                      )}
                      {activeVisual === 'map' && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-3 pt-3 border-t border-border-light">
                            <div className="text-[12px] font-bold text-ink-500 mb-2">Relationship Map</div>
                            <div className="bg-paper-50 rounded-xl p-4 border border-gray-200">
                              <SOPRelationshipMap sopId={sop.id} bpId={sop.bpId} />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* AI Recommendations */}
                    <SOPAIRecommendations sopId={sop.id} />
                  </SubProcessAccordion>
                );
              })
            )}
          </div>
        )}

        {/* RACM Tab */}
        {tab === 'racm' && (
          <div>
            {subProcesses.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border-light bg-white p-8 text-center text-[13px] text-text-muted">
                Upload an SOP first — RACMs are generated per sub-process.
              </div>
            ) : (
              subProcesses.map(sp => {
                const racm = bpRacms.find(r => r.id === sp.racmId);
                if (!racm) {
                  return (
                    <SubProcessAccordion key={sp.id} sp={sp} count={0}>
                      <div className="text-[12.5px] text-text-muted">No RACM generated yet for this sub-process.</div>
                    </SubProcessAccordion>
                  );
                }
                const linkedControlIds = racmControlLinks[racm.id] ?? new Set<string>();
                const linkedControls = bpControls.filter(c => linkedControlIds.has(c.id));
                const unlinkedControls = bpControls.filter(c => !linkedControlIds.has(c.id));

                const racmMeta = getRacmMeta(racm);
                return (
                  <SubProcessAccordion key={sp.id} sp={sp} count={linkedControls.length}>
                    {/* RACM header line */}
                    <div className="flex items-start justify-between gap-3 mb-3 pb-3 border-b border-border-light">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[13px] font-medium text-text">{racm.name}</span>
                          <span className="text-[11px] font-bold bg-paper-50 text-text-muted px-1.5 py-0.5 rounded">{racmMeta.version}</span>
                        </div>
                        <div className="text-[11px] text-text-muted font-mono mt-0.5">{racm.id}</div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap shrink-0">
                        <FrameworkBadge fw={racm.fw} />
                        <StatusPillSm tone={racm.status === 'active' ? 'compliant' : 'draft'} label={`Lifecycle · ${racm.status}`} />
                        <StatusPillSm
                          tone={racmMeta.lastTest === 'Passed' ? 'compliant' : racmMeta.lastTest === 'Failing' ? 'risk' : 'draft'}
                          label={`Last test · ${racmMeta.lastTest}`}
                        />
                        <StatusPillSm
                          tone={racmMeta.approval === 'Approved' ? 'compliant' : racmMeta.approval === 'Pending review' ? 'mitigated' : 'risk'}
                          label={`Approval · ${racmMeta.approval}`}
                        />
                      </div>
                    </div>

                    {/* Risk → Control table */}
                    <div className="overflow-hidden rounded-lg border border-border-light">
                      <table className="w-full text-[12.5px]">
                        <thead>
                          <tr className="bg-paper-50/60 border-b border-border-light">
                            <th className="text-left px-3 py-2 font-semibold text-text-secondary">Risk</th>
                            <th className="text-left px-3 py-2 font-semibold text-text-secondary">Control</th>
                            <th className="text-left px-3 py-2 font-semibold text-text-secondary">Status</th>
                            <th className="text-right px-3 py-2 font-semibold text-text-secondary w-16"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {linkedControls.length === 0 && (
                            <tr>
                              <td colSpan={4} className="px-3 py-6 text-center text-text-muted text-[12.5px]">
                                No controls linked to this RACM yet.
                              </td>
                            </tr>
                          )}
                          {linkedControls.map(ctl => {
                            const linkedRisk = bpRisks.find(r => r.id === ctl.riskId);
                            return (
                              <tr key={ctl.id} className="border-b border-border-light last:border-0 hover:bg-primary-xlight/30 transition-colors">
                                <td className="px-3 py-2.5">
                                  {linkedRisk ? (
                                    <div className="flex flex-col">
                                      <span className="font-mono text-[11px] text-text-muted">{linkedRisk.id}</span>
                                      <span className="text-[12.5px] text-text truncate max-w-[240px]">{linkedRisk.name}</span>
                                    </div>
                                  ) : (
                                    <span className="text-text-muted">—</span>
                                  )}
                                </td>
                                <td className="px-3 py-2.5">
                                  <div className="flex flex-col">
                                    <span className="font-mono text-[11px] text-text-muted">{ctl.id}</span>
                                    <span className="text-[12.5px] text-text">{ctl.name}</span>
                                  </div>
                                </td>
                                <td className="px-3 py-2.5"><StatusBadge status={ctl.status} /></td>
                                <td className="px-3 py-2.5 text-right">
                                  <button
                                    onClick={() => unlinkControlFromRacm(racm.id, ctl.id)}
                                    aria-label={`Unlink ${ctl.id}`}
                                    className="p-1 rounded-md text-text-muted hover:text-risk hover:bg-risk-50/40 transition-colors cursor-pointer"
                                  >
                                    <X size={13} />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* + Link control row */}
                    <div className="mt-3">
                      <AddLinkPicker
                        options={unlinkedControls.map(c => ({ id: c.id, name: c.name }))}
                        onPick={(controlId) => linkControlToRacm(racm.id, controlId)}
                        label="+ Link control"
                      />
                    </div>
                  </SubProcessAccordion>
                );
              })
            )}
          </div>
        )}

        {/* Workflows Tab */}
        {tab === 'workflows' && (() => {
          const filteredWfs = bpWfs.filter(wf => {
            if (wfSpFilter   !== 'all' && getWorkflowSubProcessId(wf) !== wfSpFilter)   return false;
            if (wfRacmFilter !== 'all' && getWorkflowRacmId(wf)       !== wfRacmFilter) return false;
            if (wfSopFilter  !== 'all' && getWorkflowSopId(wf)        !== wfSopFilter)  return false;
            // Legacy chip filter (RACM ID) still respected if set
            if (racmFilterTag !== 'all' && getWorkflowRacmId(wf) !== racmFilterTag)     return false;
            return true;
          });
          const anyFilterActive = wfSpFilter !== 'all' || wfRacmFilter !== 'all' || wfSopFilter !== 'all' || racmFilterTag !== 'all';

          return (
          <div>
            {/* Filters */}
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">Filter</span>
              <select
                value={wfSpFilter}
                onChange={(e) => setWfSpFilter(e.target.value)}
                className="h-8 px-3 rounded-md border border-border-light bg-white text-[12.5px] text-text focus:outline-none focus:border-brand-600 cursor-pointer"
              >
                <option value="all">All sub-processes</option>
                {subProcesses.map(sp => (
                  <option key={sp.id} value={sp.id}>{sp.name}</option>
                ))}
              </select>
              <select
                value={wfRacmFilter}
                onChange={(e) => { setWfRacmFilter(e.target.value); setRacmFilterTag('all'); }}
                className="h-8 px-3 rounded-md border border-border-light bg-white text-[12.5px] text-text focus:outline-none focus:border-brand-600 cursor-pointer"
              >
                <option value="all">All RACMs</option>
                {bpRacms.map(r => (
                  <option key={r.id} value={r.id}>{r.id} — {r.name}</option>
                ))}
              </select>
              <select
                value={wfSopFilter}
                onChange={(e) => setWfSopFilter(e.target.value)}
                className="h-8 px-3 rounded-md border border-border-light bg-white text-[12.5px] text-text focus:outline-none focus:border-brand-600 cursor-pointer"
              >
                <option value="all">All SOPs</option>
                {bpSops.map(s => (
                  <option key={s.id} value={s.id}>{s.name} {s.version}</option>
                ))}
              </select>
              {anyFilterActive && (
                <button
                  onClick={() => { setWfSpFilter('all'); setWfRacmFilter('all'); setWfSopFilter('all'); setRacmFilterTag('all'); }}
                  className="text-[11.5px] text-text-muted hover:text-text-secondary cursor-pointer"
                >
                  Clear all
                </button>
              )}
            </div>

            <div className="flex items-center justify-between mb-4">
              <p className="text-[13px] text-text-secondary">Workflows for {bp.name} ({filteredWfs.length} of {bpWfs.length})</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setBulkMode(!bulkMode); setSelectedWorkflows(new Set()); }}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-semibold transition-colors cursor-pointer ${
                    bulkMode
                      ? 'bg-high-50 text-high-700 hover:bg-high-50'
                      : 'border border-border text-text-secondary hover:bg-paper-50'
                  }`}
                >
                  <CheckCircle2 size={13} />
                  {bulkMode ? 'Exit Bulk Mode' : 'Bulk Run'}
                </button>
                <button className="flex items-center gap-1.5 px-3 py-2 bg-primary text-white rounded-lg text-[12px] font-semibold hover:bg-primary-hover cursor-pointer">
                  <Plus size={13} />
                  Create Workflow
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {filteredWfs.map((wf, i) => (
                <motion.div
                  key={wf.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => bulkMode && toggleWorkflow(wf.id)}
                  className={`bg-white rounded-xl border p-5 ai-card hover:shadow-primary/5 hover:border-primary/20 active:scale-[0.998] transition-all duration-300 group ${
                    bulkMode && selectedWorkflows.has(wf.id)
                      ? 'border-primary bg-primary-xlight/30'
                      : 'border-border-light'
                  } ${bulkMode ? 'cursor-pointer' : ''}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      {bulkMode && (
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                          selectedWorkflows.has(wf.id) ? 'bg-primary border-primary' : 'border-border bg-white'
                        }`}>
                          {selectedWorkflows.has(wf.id) && <CheckCircle2 size={12} className="text-white" />}
                        </div>
                      )}
                      <div>
                        <div className="text-[14px] font-semibold text-text group-hover:text-primary transition-colors mb-1.5">{wf.name}</div>
                        <div className="flex items-center gap-2">
                          <TypeBadge type={wf.type} />
                          <StatusBadge status={wf.status} />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[12px] text-text-muted mb-3">
                    <div className="flex items-center gap-1"><Clock size={10} />{wf.lastRun}</div>
                    <div className="flex items-center gap-1">{wf.runs} runs</div>
                  </div>
                  {!bulkMode && (
                    <div className="flex gap-2">
                      <button onClick={() => addToast({ message: 'Initializing workflow run...', type: 'success' })} className="flex items-center gap-1 px-3 py-1.5 bg-primary-light text-primary rounded-lg text-[12px] font-semibold hover:bg-primary/15">
                        <Play size={10} />
                        Run Now
                      </button>
                      <button className="flex items-center gap-1 px-3 py-1.5 border border-border rounded-lg text-[12px] font-medium text-text-secondary hover:bg-paper-50">
                        <ArrowUpRight size={10} />
                        Promote to Control
                      </button>
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Add new card */}
              <div className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-primary/30 hover:bg-primary-xlight/20 transition-all min-h-[180px]">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                  <Plus size={16} className="text-primary" />
                </div>
                <div className="text-[13px] font-semibold text-text">New Workflow</div>
                <div className="text-[12px] text-text-muted">Or import from library</div>
              </div>
            </div>

            {/* Bulk Run Floating Action Bar */}
            <AnimatePresence>
              {bulkMode && selectedWorkflows.size > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 glass-card-strong rounded-2xl px-6 py-3 flex items-center gap-4 shadow-2xl"
                >
                  <span className="text-[13px] font-semibold text-text">{selectedWorkflows.size} workflow{selectedWorkflows.size > 1 ? 's' : ''} selected</span>
                  <button onClick={handleBulkRun} className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-[12px] font-semibold transition-colors cursor-pointer flex items-center gap-1.5">
                    <Play size={13} /> Run Selected
                  </button>
                  <button onClick={() => { setBulkMode(false); setSelectedWorkflows(new Set()); }} className="px-3 py-2 text-[12px] text-text-muted hover:text-text-secondary cursor-pointer">
                    Cancel
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          );
        })()}

        {/* Risks Tab */}
        {tab === 'risks' && (() => {
          const totalHealth = bpRisks.reduce(
            (acc, r) => {
              const h = getRiskHealth(r);
              acc[h]++;
              return acc;
            },
            { healthy: 0, unhealthy: 0, untested: 0 } as { healthy: number; unhealthy: number; untested: number }
          );
          const heatmapRows = subProcesses.map(sp => {
            const risksInSP = risksBySP.get(sp.id) ?? [];
            const totals = { healthy: 0, unhealthy: 0, untested: 0 };
            risksInSP.forEach(r => { totals[getRiskHealth(r)]++; });
            return { spName: sp.name, ...totals };
          });

          return (
          <div>
            {subProcesses.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border-light bg-white p-8 text-center text-[13px] text-text-muted">
                Upload an SOP first — risks are grouped by sub-process.
              </div>
            ) : (
              <>
                {/* Health overview — donut + heatmap */}
                <div className="grid grid-cols-[auto_1fr] gap-4 mb-5">
                  <div className="rounded-xl border border-border-light bg-white p-4">
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-text-muted mb-3">Last-run health</div>
                    <RiskHealthDonut data={totalHealth} />
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-text-muted mb-2">By sub-process</div>
                    <RiskHealthHeatmap rows={heatmapRows} />
                  </div>
                </div>

                {subProcesses.map(sp => {
                  const risksInSP = risksBySP.get(sp.id) ?? [];
                  return (
                    <SubProcessAccordion key={sp.id} sp={sp} count={risksInSP.length}>
                      {risksInSP.length === 0 ? (
                        <div className="text-[12.5px] text-text-muted py-2">No risks in this sub-process yet.</div>
                      ) : (
                        <div className="overflow-hidden rounded-lg border border-border-light">
                          <table className="w-full text-[12.5px]">
                            <thead>
                              <tr className="bg-paper-50/60 border-b border-border-light">
                                <th className="text-left px-3 py-2 font-semibold text-text-secondary">Risk ID</th>
                                <th className="text-left px-3 py-2 font-semibold text-text-secondary">Description</th>
                                <th className="text-left px-3 py-2 font-semibold text-text-secondary">Severity</th>
                                <th className="text-left px-3 py-2 font-semibold text-text-secondary">Controls</th>
                                <th className="text-left px-3 py-2 font-semibold text-text-secondary">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {risksInSP.map(risk => (
                                <tr key={risk.id} className="border-b border-border-light last:border-0 hover:bg-primary-xlight/30 transition-colors">
                                  <td className="px-3 py-2.5 font-mono text-text-muted text-[12px]">{risk.id}</td>
                                  <td className="px-3 py-2.5">
                                    <div className="text-[12.5px] font-medium text-text truncate max-w-[320px]">{risk.name}</div>
                                  </td>
                                  <td className="px-3 py-2.5"><SeverityBadge severity={risk.severity} /></td>
                                  <td className="px-3 py-2.5">
                                    <span className="text-[12px] text-text">{risk.ctls} <span className="text-text-muted">({risk.keyCtls} key)</span></span>
                                  </td>
                                  <td className="px-3 py-2.5"><StatusBadge status={risk.status} /></td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </SubProcessAccordion>
                  );
                })}
                {bpRisks.filter(r => r.ctls === 0).length > 0 && (
                  <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-primary-xlight via-white to-primary-xlight border border-primary/10">
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles size={13} className="text-primary" />
                      <span className="text-[12px] font-bold text-text">AI Insight</span>
                    </div>
                    <p className="text-[12px] text-text-secondary">
                      {bpRisks.filter(r => r.ctls === 0).length} risks have no controls mapped. Consider auto-suggesting controls for these risks.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
          );
        })()}

        {/* Control Library Tab */}
        {tab === 'controls' && (
          <div>
            {subProcesses.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border-light bg-white p-8 text-center text-[13px] text-text-muted">
                Upload an SOP first — controls are grouped by sub-process.
              </div>
            ) : (
              <>
                {/* Engagement filter */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">Engagement</span>
                  <select
                    value={controlEngagementFilter}
                    onChange={(e) => setControlEngagementFilter(e.target.value)}
                    className="h-8 px-3 rounded-md border border-border-light bg-white text-[12.5px] text-text focus:outline-none focus:border-brand-600 cursor-pointer"
                  >
                    <option value="all">All engagements</option>
                    {bpEngagements.map(e => (
                      <option key={e.id} value={e.id}>{e.name} ({e.id.toUpperCase()})</option>
                    ))}
                  </select>
                  {controlEngagementFilter !== 'all' && (
                    <button
                      onClick={() => setControlEngagementFilter('all')}
                      className="text-[11.5px] text-text-muted hover:text-text-secondary cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {subProcesses.map(sp => {
                  const allInSP = controlsBySP.get(sp.id) ?? [];
                  const controlsInSP = controlEngagementFilter === 'all'
                    ? allInSP
                    : allInSP.filter(c => getControlEngagementIds(c).includes(controlEngagementFilter));
                  return (
                    <SubProcessAccordion key={sp.id} sp={sp} count={controlsInSP.length}>
                      {controlsInSP.length === 0 ? (
                        <div className="text-[12.5px] text-text-muted py-2">
                          {allInSP.length === 0 ? 'No controls in this sub-process yet.' : 'No controls match the selected engagement filter.'}
                        </div>
                      ) : (
                        <div className="overflow-hidden rounded-lg border border-border-light">
                          <table className="w-full text-[12.5px]">
                            <thead>
                              <tr className="bg-paper-50/60 border-b border-border-light">
                                <th className="text-left px-3 py-2 font-semibold text-text-secondary">Control</th>
                                <th className="text-left px-3 py-2 font-semibold text-text-secondary">Type</th>
                                <th className="text-left px-3 py-2 font-semibold text-text-secondary">Risk linked</th>
                                <th className="text-left px-3 py-2 font-semibold text-text-secondary">Status</th>
                                <th className="text-left px-3 py-2 font-semibold text-text-secondary">Workflows</th>
                              </tr>
                            </thead>
                            <tbody>
                              {controlsInSP.map(ctl => {
                                const linkedRisk = bpRisks.find(r => r.id === ctl.riskId);
                                const linkedWfIds = controlWorkflowLinks[ctl.id] ?? new Set<string>();
                                const linkedWfs = bpWfs.filter(w => linkedWfIds.has(w.id));
                                const unlinkedWfs = bpWfs.filter(w => !linkedWfIds.has(w.id));
                                const ctlMeta = getControlMeta(ctl);
                                const ctlEngs = getControlEngagementIds(ctl);
                                return (
                                  <tr key={ctl.id} className="border-b border-border-light last:border-0 hover:bg-primary-xlight/30 transition-colors align-top">
                                    <td className="px-3 py-2.5">
                                      <div className="flex items-center gap-2">
                                        <span className="font-mono text-[11px] text-text-muted">{ctl.id}</span>
                                        <span className="text-[10px] font-bold bg-paper-50 text-text-muted px-1.5 py-0.5 rounded">{ctlMeta.version}</span>
                                      </div>
                                      <div className="text-[12.5px] font-medium text-text">{ctl.name}</div>
                                      <div className="text-[11.5px] text-text-muted truncate max-w-[280px]">{ctl.desc}</div>
                                      {ctlEngs.length > 0 && (
                                        <div className="flex flex-wrap items-center gap-1 mt-1">
                                          {ctlEngs.map(eid => (
                                            <span key={eid} className="text-[10.5px] font-mono px-1.5 py-0.5 rounded bg-evidence-50 text-evidence-700">
                                              {eid.toUpperCase()}
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                    </td>
                                    <td className="px-3 py-2.5 whitespace-nowrap">
                                      <span className={`inline-flex items-center px-2 h-5 rounded-full text-[11px] font-semibold ${
                                        ctl.isKey ? 'bg-brand-50 text-brand-700' : 'bg-paper-100 text-ink-600'
                                      }`}>
                                        {ctl.isKey ? 'Key' : 'Standard'}
                                      </span>
                                    </td>
                                    <td className="px-3 py-2.5">
                                      {linkedRisk ? (
                                        <div className="flex flex-col">
                                          <span className="font-mono text-[11px] text-text-muted">{linkedRisk.id}</span>
                                          <span className="text-[12px] text-text truncate max-w-[200px]">{linkedRisk.name}</span>
                                        </div>
                                      ) : (
                                        <span className="text-text-muted text-[12px]">—</span>
                                      )}
                                    </td>
                                    <td className="px-3 py-2.5">
                                      <div className="flex flex-col gap-1">
                                        <StatusBadge status={ctl.status} />
                                        <div className="flex flex-wrap gap-1">
                                          <StatusPillSm
                                            tone={ctlMeta.lastTest === 'Passed' ? 'compliant' : ctlMeta.lastTest === 'Failing' ? 'risk' : 'draft'}
                                            label={ctlMeta.lastTest}
                                          />
                                          <StatusPillSm
                                            tone={ctlMeta.coverage === 'Full' ? 'compliant' : ctlMeta.coverage === 'Partial' ? 'mitigated' : 'draft'}
                                            label={ctlMeta.coverage}
                                          />
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-3 py-2.5">
                                      <div className="flex flex-wrap items-center gap-1.5 max-w-[260px]">
                                        {linkedWfs.map(wf => (
                                          <LinkChip
                                            key={wf.id}
                                            label={wf.name}
                                            onUnlink={() => unlinkWorkflowFromControl(ctl.id, wf.id)}
                                            tone="evidence"
                                          />
                                        ))}
                                        {unlinkedWfs.length > 0 && (
                                          <AddLinkPicker
                                            options={unlinkedWfs.map(w => ({ id: w.id, name: w.name }))}
                                            onPick={(wfId) => linkWorkflowToControl(ctl.id, wfId)}
                                            label="+ Workflow"
                                          />
                                        )}
                                        {linkedWfs.length === 0 && unlinkedWfs.length === 0 && (
                                          <span className="text-text-muted text-[11.5px]">No workflows in this BP.</span>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </SubProcessAccordion>
                  );
                })}
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

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
