import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, Plus, Upload, Link2,
  Clock, Play, ArrowUpRight,
  ChevronRight, ChevronDown, Sparkles, FileSpreadsheet, X, Check,
  ArrowLeft, Shield, Workflow, CheckCircle2,
  ArrowRight, TrendingUp, RefreshCw, GitBranch, Network,
  Zap, Eye, Calendar
} from 'lucide-react';
import { BUSINESS_PROCESSES, SOPS, RACMS, RISKS, CONTROLS, WORKFLOWS, SOP_FLOWS, SOP_AI_RECOMMENDATIONS } from '../../data/mockData';
import { StatusBadge, SeverityBadge, FrameworkBadge, TypeBadge, Avatar } from '../shared/StatusBadge';
import { CardContainer, CardBody, CardItem } from '../shared/3DCard';
import Orb from '../shared/Orb';
import { useToast } from '../shared/Toast';

interface Props {
  selectedBPId: string | null;
  onSelectBP: (id: string | null) => void;
}

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

/* ─── BP Detail View ─── */
function BPDetailView({ bp, onBack }: {
  bp: typeof BUSINESS_PROCESSES[0]; onBack: () => void;
}) {
  type BPTab = 'sop' | 'racm' | 'workflows' | 'risks' | 'engagements';
  const [tab, setTab] = useState<BPTab>('sop');
  const [linkModal, setLinkModal] = useState<typeof RISKS[0] | null>(null);
  const [uploadModal, setUploadModal] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedWorkflows, setSelectedWorkflows] = useState<Set<string>>(new Set());
  const [sopVisuals, setSopVisuals] = useState<Record<string, 'flow' | 'map' | null>>({});
  const [racmFilterTag, setRacmFilterTag] = useState<string>('all');
  const [showCreateEngagement, setShowCreateEngagement] = useState(false);
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

  // Engagement data for this process
  type EngStatus = 'draft' | 'planned' | 'active' | 'in-progress' | 'pending-review' | 'closed';
  interface BPEngagement {
    id: string; name: string; auditType: string; framework: string;
    racmVersion: string; auditPeriod: string; owner: string;
    status: EngStatus; controls: number; controlsTested: number;
    controlsFailed: number; isOverdue: boolean; color: string;
  }

  const ALL_BP_ENGAGEMENTS: BPEngagement[] = [
    { id: 'ap-1', name: 'P2P — SOX Audit', auditType: 'SOX', framework: 'COSO', racmVersion: 'RACM v2.1', auditPeriod: 'Apr 2025 — Mar 2026', owner: 'Tushar Goel', status: 'active', controls: 24, controlsTested: 18, controlsFailed: 2, isOverdue: false, color: '#6a12cd' },
    { id: 'ap-2', name: 'O2C — SOX Audit', auditType: 'SOX', framework: 'COSO', racmVersion: 'RACM v2.1', auditPeriod: 'Apr 2025 — Mar 2026', owner: 'Neha Joshi', status: 'active', controls: 18, controlsTested: 8, controlsFailed: 0, isOverdue: false, color: '#0284c7' },
    { id: 'ap-3', name: 'R2R — SOX Audit', auditType: 'SOX', framework: 'COSO', racmVersion: 'RACM v2.1', auditPeriod: 'Apr 2025 — Mar 2026', owner: 'Karan Mehta', status: 'in-progress', controls: 31, controlsTested: 26, controlsFailed: 3, isOverdue: true, color: '#d97706' },
    { id: 'ap-4', name: 'S2C — Contract Review', auditType: 'Internal', framework: 'Custom', racmVersion: 'RACM v1.8', auditPeriod: 'Apr 2025 — Mar 2026', owner: 'Rohan Patel', status: 'planned', controls: 14, controlsTested: 0, controlsFailed: 0, isOverdue: false, color: '#059669' },
    { id: 'ap-5', name: 'P2P — IFC Assessment', auditType: 'IFC', framework: 'COBIT', racmVersion: 'RACM v2.0', auditPeriod: 'Apr 2025 — Mar 2026', owner: 'Sneha Desai', status: 'planned', controls: 18, controlsTested: 0, controlsFailed: 0, isOverdue: false, color: '#6a12cd' },
    { id: 'ap-6', name: 'IT General Controls', auditType: 'ITGC', framework: 'ISO 27001', racmVersion: 'RACM v2.1', auditPeriod: 'Apr 2025 — Mar 2026', owner: 'Deepak Bansal', status: 'active', controls: 15, controlsTested: 9, controlsFailed: 0, isOverdue: false, color: '#7c3aed' },
    { id: 'ap-7', name: 'Vendor Risk Assessment', auditType: 'Risk', framework: 'NIST', racmVersion: 'RACM v1.9', auditPeriod: 'Apr 2025 — Mar 2026', owner: 'Priya Singh', status: 'draft', controls: 8, controlsTested: 0, controlsFailed: 0, isOverdue: false, color: '#dc2626' },
    { id: 'ap-8', name: 'Year-End Close Review', auditType: 'SOX', framework: 'COSO', racmVersion: 'RACM v2.1', auditPeriod: 'Apr 2025 — Mar 2026', owner: 'Karan Mehta', status: 'planned', controls: 12, controlsTested: 0, controlsFailed: 0, isOverdue: false, color: '#d97706' },
  ];

  // Map process id to abbreviation for filtering
  const BP_ABBR_MAP: Record<string, string> = { p2p: 'P2P', o2c: 'O2C', r2r: 'R2R', s2c: 'S2C' };
  const bpAbbr = BP_ABBR_MAP[bp.id] || bp.abbr;

  // Engagements where this process is the primary process
  const ENG_PROCESS_MAP: Record<string, string> = {
    'ap-1': 'P2P', 'ap-2': 'O2C', 'ap-3': 'R2R', 'ap-4': 'S2C',
    'ap-5': 'P2P', 'ap-6': 'Cross', 'ap-7': 'P2P', 'ap-8': 'R2R',
  };
  const bpEngagements = ALL_BP_ENGAGEMENTS.filter(e => ENG_PROCESS_MAP[e.id] === bpAbbr);

  function engStatusLabel(s: EngStatus): string {
    return ({ draft: 'Draft', planned: 'Planned', active: 'Active', 'in-progress': 'In Progress', 'pending-review': 'Pending Review', closed: 'Closed' })[s];
  }
  function engStatusCls(s: EngStatus): string {
    return ({
      draft: 'bg-draft-50 text-draft-700', planned: 'bg-evidence-50 text-evidence-700',
      active: 'bg-compliant-50 text-compliant-700', 'in-progress': 'bg-evidence-50 text-evidence-700',
      'pending-review': 'bg-high-50 text-high-700', closed: 'bg-draft-50 text-draft-700',
    })[s];
  }
  function isEngActive(s: EngStatus): boolean {
    return ['active', 'in-progress', 'pending-review', 'closed'].includes(s);
  }

  const tabs: { id: BPTab; label: string; count: number }[] = [
    { id: 'sop', label: 'SOP', count: bpSops.length },
    { id: 'racm', label: 'RACM', count: bpRacms.length },
    { id: 'workflows', label: 'Workflows', count: bpWfs.length },
    { id: 'risks', label: 'Risks', count: bpRisks.length },
    { id: 'engagements', label: 'Engagements', count: bpEngagements.length },
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
              { l: 'Engagements', v: bpEngagements.length, tab: 'engagements' as const },
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

            <div className="space-y-3">
              {bpSops.map((sop, i) => {
                const linked = bpRacms.find(r => r.id === sop.racmId);
                const activeVisual = sopVisuals[sop.id] || null;
                const flowSteps = SOP_FLOWS[sop.id];
                return (
                  <motion.div
                    key={sop.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white rounded-xl border border-border-light p-5 ai-card hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-success-bg flex items-center justify-center shrink-0">
                        <FileSpreadsheet size={18} className="text-success" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[13px] font-semibold text-text">{sop.name}</span>
                          <span className="text-[12px] font-bold bg-paper-50 text-text-muted px-1.5 py-0.5 rounded">{sop.version}</span>
                          <StatusBadge status={sop.status} />
                        </div>
                        <div className="text-[12px] text-text-muted">
                          Uploaded by {sop.by} · {sop.at} · {sop.risks} risks · {sop.controls} controls extracted
                        </div>
                      </div>
                      {linked ? (
                        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-light text-primary rounded-lg text-[12px] font-semibold hover:bg-primary/15 transition-colors">
                          <Link2 size={12} />
                          View RACM
                        </button>
                      ) : (
                        <button className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg text-[12px] font-medium text-text-secondary hover:bg-paper-50 transition-colors">
                          <Plus size={12} />
                          Generate RACM
                        </button>
                      )}
                    </div>

                    {/* Visualization Toggle Buttons */}
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border-light">
                      {flowSteps && (
                        <button
                          onClick={() => toggleSopVisual(sop.id, 'flow')}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors ${
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
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors ${
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
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* RACM Tab */}
        {tab === 'racm' && (
          <div>
            <div className="flex gap-3 mb-4">
              <div className="flex-1 relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input placeholder="Search RACMs..." className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-white text-[13px] outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10" />
              </div>
              <button className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-[13px] font-semibold hover:bg-primary-hover transition-colors">
                <Plus size={14} />
                Create RACM
              </button>
            </div>

            <div className="bg-white rounded-xl border border-border-light overflow-hidden">
              <table className="w-full text-[12.5px]">
                <thead>
                  <tr className="bg-surface-2 border-b border-border-light">
                    <th className="text-left px-4 py-3 font-semibold text-text-secondary">RACM</th>
                    <th className="text-left px-3 py-3 font-semibold text-text-secondary">Framework</th>
                    <th className="text-left px-3 py-3 font-semibold text-text-secondary">Status</th>
                    <th className="text-left px-3 py-3 font-semibold text-text-secondary">Owner</th>
                    <th className="text-left px-3 py-3 font-semibold text-text-secondary">Last Run</th>
                  </tr>
                </thead>
                <tbody>
                  {bpRacms.map((r, i) => {
                    return (
                      <motion.tr
                        key={r.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.04 }}
                        className="border-b border-border-light last:border-0 hover:bg-primary-xlight/50 transition-colors cursor-pointer group"
                      >
                        <td className="px-4 py-3" colSpan={5}>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="text-[13px] font-medium text-text group-hover:text-primary transition-colors">{r.name}</div>
                              <div className="text-[12px] text-text-muted">{r.id}{r.sopId && <span className="text-primary"> · SOP linked</span>}</div>
                            </div>
                            <div className="shrink-0"><FrameworkBadge fw={r.fw} /></div>
                            <div className="shrink-0"><StatusBadge status={r.status} /></div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <Avatar name={r.owner} size={20} />
                              <span className="text-text-secondary text-[12px]">{r.owner.split(' ')[0]}</span>
                            </div>
                            <div className="text-text-muted text-[12px] flex items-center gap-1 shrink-0">
                              <Clock size={11} />
                              {r.lastRun}
                            </div>
                          </div>
                          {/* Linked Workflows */}
                          <RACMWorkflowPanel bpId={r.bpId} />

                          {/* AI Recommended Controls */}
                          {RACM_RECOMMENDED_CONTROLS[r.id] && (
                            <div className="mt-3 p-3 bg-gradient-to-r from-primary-xlight/50 to-white rounded-xl border border-primary/10">
                              <div className="flex items-center gap-1.5 mb-2">
                                <Sparkles size={12} className="text-primary" />
                                <span className="text-[12px] font-bold text-primary">AI Recommended Controls</span>
                              </div>
                              <div className="space-y-2">
                                {RACM_RECOMMENDED_CONTROLS[r.id].map((rec, idx) => (
                                  <div key={idx} className="flex items-start gap-2.5 p-2 rounded-lg bg-white/80 border border-border-light hover:shadow-sm transition-all">
                                    <div className={`p-1 rounded-md shrink-0 ${
                                      rec.type === 'automated' ? 'bg-evidence-50 text-evidence-700' :
                                      rec.type === 'detective' ? 'bg-mitigated-50 text-mitigated-700' :
                                      'bg-compliant-50 text-compliant-700'
                                    }`}>
                                      {rec.type === 'automated' ? <Zap size={10} /> : rec.type === 'detective' ? <Eye size={10} /> : <Shield size={10} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="text-[12px] font-medium text-text">{rec.control}</div>
                                      <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[12px] text-text-muted">Mitigates: {rec.risk}</span>
                                        <span className={`text-[12px] font-bold px-1.5 py-0.5 rounded-full ${
                                          rec.type === 'automated' ? 'bg-evidence-50 text-evidence-700' :
                                          rec.type === 'detective' ? 'bg-mitigated-50 text-mitigated-700' :
                                          'bg-compliant-50 text-compliant-700'
                                        }`}>{rec.type}</span>
                                      </div>
                                    </div>
                                    <div className="shrink-0 text-right">
                                      <div className="text-[12px] font-bold text-primary">{rec.confidence}%</div>
                                      <div className="w-12 h-1 bg-surface-3 rounded-full overflow-hidden mt-0.5">
                                        <div className="h-full bg-primary rounded-full" style={{ width: `${rec.confidence}%` }} />
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* Workflows Tab */}
        {tab === 'workflows' && (
          <div>
            {/* RACM tag filter chips */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[12px] font-bold text-text-muted shrink-0">RACM Filter:</span>
              <button
                onClick={() => setRacmFilterTag('all')}
                className={`px-2.5 py-1 rounded-full text-[12px] font-semibold transition-all cursor-pointer ${
                  racmFilterTag === 'all' ? 'bg-primary text-white shadow-sm' : 'bg-surface-2 text-text-muted hover:bg-primary/10 hover:text-primary'
                }`}
              >
                All
              </button>
              {bpRacms.map(r => (
                <button
                  key={r.id}
                  onClick={() => setRacmFilterTag(racmFilterTag === r.id ? 'all' : r.id)}
                  className={`px-2.5 py-1 rounded-full text-[12px] font-semibold transition-all cursor-pointer ${
                    racmFilterTag === r.id ? 'bg-primary text-white shadow-sm' : 'bg-surface-2 text-text-muted hover:bg-primary/10 hover:text-primary'
                  }`}
                >
                  {r.id}
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-[13px] text-text-secondary">Workflows for {bp.name}{racmFilterTag !== 'all' ? ` (filtered by ${racmFilterTag})` : ''}</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setBulkMode(!bulkMode); setSelectedWorkflows(new Set()); }}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-semibold transition-colors ${
                    bulkMode
                      ? 'bg-high-50 text-high-700 hover:bg-high-50'
                      : 'border border-border text-text-secondary hover:bg-paper-50'
                  }`}
                >
                  <CheckCircle2 size={13} />
                  {bulkMode ? 'Exit Bulk Mode' : 'Bulk Run'}
                </button>
                <button className="flex items-center gap-1.5 px-3 py-2 bg-primary text-white rounded-lg text-[12px] font-semibold hover:bg-primary-hover">
                  <Plus size={13} />
                  Create Workflow
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {bpWfs.map((wf, i) => (
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
        )}

        {/* Risks Tab */}
        {tab === 'risks' && (
          <div>
            <p className="text-[13px] text-text-secondary mb-4">Risks identified for {bp.name}</p>
            <div className="bg-white rounded-xl border border-border-light overflow-hidden">
              <table className="w-full text-[12.5px]">
                <thead>
                  <tr className="bg-surface-2 border-b border-border-light">
                    <th className="text-left px-4 py-3 font-semibold text-text-secondary">Risk ID</th>
                    <th className="text-left px-3 py-3 font-semibold text-text-secondary">Description</th>
                    <th className="text-left px-3 py-3 font-semibold text-text-secondary">Severity</th>
                    <th className="text-left px-3 py-3 font-semibold text-text-secondary">Controls</th>
                    <th className="text-left px-3 py-3 font-semibold text-text-secondary">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bpRisks.map((risk, i) => (
                    <motion.tr
                      key={risk.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.04 }}
                      className="border-b border-border-light last:border-0 hover:bg-primary-xlight/50 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3 font-mono text-text-muted text-[12px]">{risk.id}</td>
                      <td className="px-3 py-3">
                        <div className="text-[13px] font-medium text-text truncate max-w-[280px]">{risk.name}</div>
                      </td>
                      <td className="px-3 py-3">
                        <SeverityBadge severity={risk.severity} />
                      </td>
                      <td className="px-3 py-3">
                        <span className="text-[12px] text-text">{risk.ctls} <span className="text-text-muted">({risk.keyCtls} key)</span></span>
                      </td>
                      <td className="px-3 py-3">
                        <StatusBadge status={risk.status} />
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
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
          </div>
        )}

        {/* Engagements Tab */}
        {tab === 'engagements' && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[13px] text-text-secondary">
                Related engagements for <span className="font-semibold text-text">{bp.name}</span>
              </p>
              <button
                onClick={() => setShowCreateEngagement(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-[12px] font-semibold transition-colors cursor-pointer"
              >
                <Plus size={13} />
                Create Engagement
              </button>
            </div>
            <p className="text-[11px] text-text-muted mb-4">Shows engagements where this process is the primary planning context.</p>

            {bpEngagements.length === 0 ? (
              <div className="bg-white rounded-xl border border-border-light p-10 text-center">
                <Calendar size={28} className="text-text-muted mx-auto mb-2" />
                <p className="text-[14px] font-semibold text-text mb-1">No engagements yet</p>
                <p className="text-[12px] text-text-muted mb-4">Create an engagement to start testing controls for {bp.name}.</p>
                <button
                  onClick={() => setShowCreateEngagement(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-[12px] font-semibold transition-colors cursor-pointer"
                >
                  <Plus size={13} />
                  Create Engagement for {bp.abbr}
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-border-light overflow-hidden">
                <table className="w-full text-[12.5px]">
                  <thead>
                    <tr className="bg-surface-2 border-b border-border-light">
                      <th className="text-left px-4 py-3 font-semibold text-text-secondary">Engagement</th>
                      <th className="text-left px-3 py-3 font-semibold text-text-secondary">Type / Framework</th>
                      <th className="text-left px-3 py-3 font-semibold text-text-secondary">Linked RACM</th>
                      <th className="text-left px-3 py-3 font-semibold text-text-secondary">Audit Period</th>
                      <th className="text-left px-3 py-3 font-semibold text-text-secondary">Owner</th>
                      <th className="text-left px-3 py-3 font-semibold text-text-secondary">Progress</th>
                      <th className="text-left px-3 py-3 font-semibold text-text-secondary">Status</th>
                      <th className="text-left px-3 py-3 font-semibold text-text-secondary">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bpEngagements.map((eng, i) => {
                      const active = isEngActive(eng.status);
                      const progress = eng.controls > 0 ? Math.round((eng.controlsTested / eng.controls) * 100) : 0;

                      return (
                        <motion.tr
                          key={eng.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.04 }}
                          className={`border-b border-border-light last:border-0 hover:bg-primary-xlight/50 transition-colors cursor-pointer ${eng.isOverdue ? 'border-l-[3px] border-l-risk' : ''}`}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: eng.color, opacity: active ? 1 : 0.4 }} />
                              <span className="text-[13px] font-medium text-text">{eng.name}</span>
                              {eng.isOverdue && <span className="px-1 h-4 rounded text-[8px] font-bold bg-risk-50 text-risk-700 inline-flex items-center animate-pulse shrink-0">OD</span>}
                            </div>
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-1.5">
                              <span className="px-2 h-5 rounded-full text-[9px] font-semibold bg-brand-50 text-brand-700 inline-flex items-center">{eng.auditType}</span>
                              <span className="text-[10px] text-text-muted">{eng.framework}</span>
                            </div>
                          </td>
                          <td className="px-3 py-3">
                            <span className="text-[12px] text-primary font-medium">{eng.racmVersion}</span>
                          </td>
                          <td className="px-3 py-3">
                            <span className="text-[11px] text-text-muted">{eng.auditPeriod}</span>
                          </td>
                          <td className="px-3 py-3">
                            <span className="text-[12px] text-text-secondary">{eng.owner}</span>
                          </td>
                          <td className="px-3 py-3">
                            {active ? (
                              <div className="flex items-center gap-2 min-w-[80px]">
                                <div className="flex-1 h-1.5 bg-surface-3 rounded-full overflow-hidden">
                                  <div className="h-full rounded-full" style={{ width: `${progress}%`, background: eng.color }} />
                                </div>
                                <span className="text-[10px] font-bold tabular-nums text-text-muted w-7 text-right">{progress}%</span>
                              </div>
                            ) : <span className="text-ink-300 text-[10px]">—</span>}
                          </td>
                          <td className="px-3 py-3">
                            <span className={`px-2 h-5 rounded-full text-[9px] font-semibold inline-flex items-center ${engStatusCls(eng.status)}`}>
                              {engStatusLabel(eng.status)}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            {active ? (
                              <span className="px-2 py-1 rounded-lg text-[10px] font-bold text-primary bg-primary/10 hover:bg-primary/15 cursor-pointer transition-colors inline-flex items-center gap-1">
                                View <ChevronRight size={9} />
                              </span>
                            ) : (
                              <span className="px-2 py-1 rounded-lg text-[10px] font-bold text-brand-700 bg-brand-50 hover:bg-brand-50/80 cursor-pointer transition-colors inline-flex items-center gap-1">
                                {eng.status === 'draft' ? 'Configure' : 'Activate'} <ChevronRight size={9} />
                              </span>
                            )}
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {bpEngagements.length > 0 && (
              <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-primary-xlight via-white to-primary-xlight border border-primary/10">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles size={13} className="text-primary" />
                  <span className="text-[12px] font-bold text-text">Scope Reminder</span>
                </div>
                <p className="text-[12px] text-text-secondary">
                  Primary Process is used for planning and filtering. Execution scope comes from the linked RACM snapshot, not the process assignment.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Create Engagement Drawer */}
        <AnimatePresence>
          {showCreateEngagement && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
                onClick={() => setShowCreateEngagement(false)}
              />
              <motion.div
                initial={{ x: 440 }}
                animate={{ x: 0 }}
                exit={{ x: 440 }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="fixed right-0 top-0 bottom-0 w-[420px] z-50 bg-white border-l border-border-light shadow-2xl overflow-y-auto"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-[15px] font-bold text-text">Create Engagement</h3>
                    <button onClick={() => setShowCreateEngagement(false)} className="p-1.5 rounded-lg hover:bg-surface-2 transition-colors cursor-pointer">
                      <X size={16} className="text-text-muted" />
                    </button>
                  </div>

                  {/* Pre-filled process */}
                  <div className="mb-4">
                    <label className="text-[12px] font-semibold text-text-muted block mb-1.5">Primary Business Process</label>
                    <div className="flex items-center gap-2.5 px-3 py-2.5 border border-primary/30 bg-primary-xlight/30 rounded-lg">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[10px] font-bold" style={{ background: bp.color }}>
                        {bp.abbr}
                      </div>
                      <div>
                        <div className="text-[13px] font-semibold text-text">{bp.name}</div>
                        <div className="text-[10px] text-text-muted">Pre-filled from current process</div>
                      </div>
                    </div>
                  </div>

                  {/* RACM Version */}
                  <div className="mb-4">
                    <label className="text-[12px] font-semibold text-text-muted block mb-1.5">RACM Version *</label>
                    <select className="w-full px-3 py-2.5 border border-border rounded-lg text-[13px] text-text bg-white outline-none focus:border-primary/40 cursor-pointer">
                      <option value="">Select RACM version...</option>
                      {bpRacms.map(r => (
                        <option key={r.id} value={r.id}>{r.name} ({r.fw})</option>
                      ))}
                    </select>
                  </div>

                  {/* Engagement Name */}
                  <div className="mb-4">
                    <label className="text-[12px] font-semibold text-text-muted block mb-1.5">Engagement Name *</label>
                    <input
                      type="text"
                      placeholder={`e.g. ${bp.abbr} — SOX Audit FY27`}
                      className="w-full px-3 py-2.5 border border-border rounded-lg text-[13px] text-text placeholder:text-text-muted outline-none focus:border-primary/40"
                    />
                  </div>

                  {/* Framework */}
                  <div className="mb-4">
                    <label className="text-[12px] font-semibold text-text-muted block mb-1.5">Framework *</label>
                    <select className="w-full px-3 py-2.5 border border-border rounded-lg text-[13px] text-text bg-white outline-none focus:border-primary/40 cursor-pointer">
                      <option value="">Select framework...</option>
                      <option value="COSO">COSO</option>
                      <option value="COBIT">COBIT</option>
                      <option value="ISO 27001">ISO 27001</option>
                      <option value="NIST">NIST</option>
                      <option value="Custom">Custom</option>
                    </select>
                  </div>

                  {/* Audit Type */}
                  <div className="mb-4">
                    <label className="text-[12px] font-semibold text-text-muted block mb-1.5">Audit Type *</label>
                    <select className="w-full px-3 py-2.5 border border-border rounded-lg text-[13px] text-text bg-white outline-none focus:border-primary/40 cursor-pointer">
                      <option value="">Select type...</option>
                      <option value="SOX">SOX</option>
                      <option value="IFC">IFC</option>
                      <option value="ITGC">ITGC</option>
                      <option value="Internal">Internal</option>
                      <option value="Risk">Risk</option>
                    </select>
                  </div>

                  {/* Audit Period */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <label className="text-[12px] font-semibold text-text-muted block mb-1.5">Period Start *</label>
                      <input type="date" className="w-full px-3 py-2.5 border border-border rounded-lg text-[13px] text-text outline-none focus:border-primary/40" />
                    </div>
                    <div>
                      <label className="text-[12px] font-semibold text-text-muted block mb-1.5">Period End *</label>
                      <input type="date" className="w-full px-3 py-2.5 border border-border rounded-lg text-[13px] text-text outline-none focus:border-primary/40" />
                    </div>
                  </div>

                  {/* Owner */}
                  <div className="mb-4">
                    <label className="text-[12px] font-semibold text-text-muted block mb-1.5">Owner *</label>
                    <select className="w-full px-3 py-2.5 border border-border rounded-lg text-[13px] text-text bg-white outline-none focus:border-primary/40 cursor-pointer">
                      <option value="">Select owner...</option>
                      <option>Tushar Goel</option>
                      <option>Deepak Bansal</option>
                      <option>Neha Joshi</option>
                      <option>Karan Mehta</option>
                      <option>Sneha Desai</option>
                      <option>Rohan Patel</option>
                      <option>Priya Singh</option>
                    </select>
                  </div>

                  {/* Reviewer */}
                  <div className="mb-6">
                    <label className="text-[12px] font-semibold text-text-muted block mb-1.5">Reviewer</label>
                    <select className="w-full px-3 py-2.5 border border-border rounded-lg text-[13px] text-text bg-white outline-none focus:border-primary/40 cursor-pointer">
                      <option value="">Select reviewer...</option>
                      <option>Tushar Goel</option>
                      <option>Deepak Bansal</option>
                      <option>Neha Joshi</option>
                      <option>Karan Mehta</option>
                      <option>Sneha Desai</option>
                      <option>Abhinav S</option>
                    </select>
                  </div>

                  {/* Scope note */}
                  <div className="p-3 rounded-lg bg-surface-2/60 border border-border/50 mb-6">
                    <p className="text-[11px] text-text-muted leading-relaxed">
                      Execution scope will come from the selected RACM version. The primary process ({bp.abbr}) is used for planning and filtering only.
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        addToast({ message: `Engagement created for ${bp.name}`, type: 'success' });
                        setShowCreateEngagement(false);
                      }}
                      className="flex-1 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-[13px] font-semibold transition-colors cursor-pointer"
                    >
                      Create Engagement
                    </button>
                    <button
                      onClick={() => setShowCreateEngagement(false)}
                      className="px-4 py-2.5 border border-border rounded-lg text-[13px] text-text-secondary hover:bg-surface-2 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ─── Business Processes List ─── */
export default function BusinessProcesses({ selectedBPId, onSelectBP }: Props) {
  if (selectedBPId) {
    const bp = BUSINESS_PROCESSES.find(b => b.id === selectedBPId);
    if (bp) return <BPDetailView bp={bp} onBack={() => onSelectBP(null)} />;
  }

  return (
    <div className="h-full overflow-y-auto bg-white bg-mesh-gradient relative">
      <Orb hoverIntensity={0.09} rotateOnHover hue={275} opacity={0.08} />
      <div className="p-8 relative">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-text">Business Processes</h1>
            <p className="text-sm text-text-secondary mt-1">Manage processes, SOPs, RACMs, and control mappings</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-[13px] font-semibold transition-colors">
            <Plus size={14} />
            Add Process
          </button>
        </div>

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
          {BUSINESS_PROCESSES.map((bp, i) => (
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
        </div>
      </div>
    </div>
  );
}
