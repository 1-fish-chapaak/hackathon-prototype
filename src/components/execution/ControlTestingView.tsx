import { useState } from 'react';
import {
  Search, Filter, ChevronRight,
  ArrowRight, Workflow,
  Shield, Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Orb from '../shared/Orb';

interface Props {
  onAskAI?: (id: string) => void;
  onOpenWorkingPaper?: (controlId: string) => void;
  onOpenWorkflow?: (controlId: string) => void;
  onOpenTrace?: (controlId: string) => void;
}

type FilterKey = 'all' | 'action' | 'progress' | 'complete' | 'exceptions';

const FILTERS: { key: FilterKey; label: string; count: number }[] = [
  { key: 'all', label: 'All', count: 45 },
  { key: 'action', label: 'Action Required', count: 12 },
  { key: 'progress', label: 'In Progress', count: 8 },
  { key: 'complete', label: 'Complete', count: 20 },
  { key: 'exceptions', label: 'Exceptions', count: 5 },
];

interface ControlRow {
  id: string;
  control: string;
  engagement: string;
  workflowName: string;
  workflowVersion: string;
  attributeCount: number;
  population: string;
  populationStatus: 'received' | 'validated' | 'requested';
  sample: string;
  evidence: string;
  evidenceStatus: 'complete' | 'partial' | 'none';
  testing: 'Complete' | 'In Progress' | 'Not Started';
  reviewer: string;
  conclusion: 'Effective' | 'Ineffective' | 'Exception' | 'Pending' | '';
  nextAction: string;
  nextActionType: 'success' | 'warning' | 'primary' | 'danger' | 'default';
}

const CONTROLS: ControlRow[] = [
  {
    id: 'C-001', control: 'Credit Limit', engagement: 'ENG-2026-001',
    workflowName: 'Credit Limit Validation', workflowVersion: 'v2.1', attributeCount: 4,
    population: 'Received (1,247)', populationStatus: 'received',
    sample: 'Selected (25)', evidence: 'Complete (3/3)', evidenceStatus: 'complete',
    testing: 'Complete', reviewer: 'Sarah M.', conclusion: 'Effective',
    nextAction: 'View Results', nextActionType: 'success',
  },
  {
    id: 'C-002', control: 'Vendor Review', engagement: 'ENG-2026-001',
    workflowName: 'Vendor Master Validation', workflowVersion: 'v1.3', attributeCount: 3,
    population: 'Received (892)', populationStatus: 'received',
    sample: 'Selected (30)', evidence: 'Partial (2/4)', evidenceStatus: 'partial',
    testing: 'In Progress', reviewer: '-', conclusion: 'Pending',
    nextAction: 'Request Evidence', nextActionType: 'warning',
  },
  {
    id: 'C-003', control: '3-Way Match', engagement: 'ENG-2026-001',
    workflowName: '3-Way PO Match', workflowVersion: 'v2.0', attributeCount: 5,
    population: 'Validated (3,891)', populationStatus: 'validated',
    sample: 'Selected (40)', evidence: 'Complete (5/5)', evidenceStatus: 'complete',
    testing: 'Complete', reviewer: 'Mike R.', conclusion: 'Exception',
    nextAction: 'Review Testing', nextActionType: 'danger',
  },
  {
    id: 'C-004', control: 'JE Review', engagement: 'ENG-2026-002',
    workflowName: 'Revenue Recognition', workflowVersion: 'v1.0', attributeCount: 3,
    population: 'Requested', populationStatus: 'requested',
    sample: '-', evidence: '-', evidenceStatus: 'none',
    testing: 'Not Started', reviewer: '-', conclusion: '',
    nextAction: 'Request Population', nextActionType: 'default',
  },
  {
    id: 'C-005', control: 'Access Recert', engagement: 'ENG-2026-001',
    workflowName: 'Access Review', workflowVersion: 'v1.1', attributeCount: 4,
    population: 'Received (234)', populationStatus: 'received',
    sample: 'Selected (15)', evidence: 'Complete (2/2)', evidenceStatus: 'complete',
    testing: 'Complete', reviewer: 'Sarah M.', conclusion: 'Ineffective',
    nextAction: 'Submit for Review', nextActionType: 'primary',
  },
];

function TestingBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    'Complete': 'bg-compliant-50 text-compliant-700',
    'In Progress': 'bg-evidence-50 text-evidence-700',
    'Not Started': 'bg-paper-100 text-ink-500',
  };
  return (
    <span className={`inline-flex items-center px-2 h-6 rounded-full text-[12px] font-medium whitespace-nowrap ${map[status] ?? map['Not Started']}`}>
      {status}
    </span>
  );
}

function ConclusionBadge({ conclusion }: { conclusion: string }) {
  if (!conclusion) return <span className="text-ink-400 text-[12px]">—</span>;
  const map: Record<string, string> = {
    'Effective': 'bg-compliant-50 text-compliant-700',
    'Ineffective': 'bg-risk-50 text-risk-700',
    'Exception': 'bg-mitigated-50 text-mitigated-700',
    'Pending': 'bg-paper-100 text-ink-500',
  };
  return (
    <span className={`inline-flex items-center px-2 h-6 rounded-full text-[12px] font-medium whitespace-nowrap ${map[conclusion] ?? map['Pending']}`}>
      {conclusion}
    </span>
  );
}

function EvidenceBadge({ label, status }: { label: string; status: 'complete' | 'partial' | 'none' }) {
  if (label === '-') return <span className="text-ink-400 text-[12px]">—</span>;
  const colors = {
    complete: 'text-compliant',
    partial: 'text-mitigated-700',
    none: 'text-ink-400',
  };
  return <span className={`text-[12px] font-medium tabular-nums ${colors[status]}`}>{label}</span>;
}

function ActionButton({ label, type, onClick }: { label: string; type: string; onClick?: () => void }) {
  const styles: Record<string, string> = {
    success: 'bg-canvas-elevated border-canvas-border text-ink-700 hover:bg-compliant-50 hover:text-compliant-700 hover:border-compliant-50',
    warning: 'bg-canvas-elevated border-canvas-border text-ink-700 hover:bg-mitigated-50 hover:text-mitigated-700 hover:border-mitigated-50',
    primary: 'bg-brand-600 border-brand-600 text-white hover:bg-brand-500 hover:border-brand-500',
    danger: 'bg-canvas-elevated border-canvas-border text-ink-700 hover:bg-risk hover:text-white hover:border-risk',
    default: 'bg-canvas-elevated border-canvas-border text-ink-600 hover:border-brand-200 hover:text-ink-800',
  };
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[12px] font-semibold transition-colors cursor-pointer ${styles[type] || styles.default}`}
    >
      {label}
      <ArrowRight size={10} />
    </button>
  );
}

export default function ControlTestingView({ onOpenWorkingPaper, onOpenWorkflow, onOpenTrace }: Props) {
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [search, setSearch] = useState('');

  const filtered = CONTROLS.filter(c => {
    if (search) {
      const q = search.toLowerCase();
      if (!c.id.toLowerCase().includes(q) && !c.control.toLowerCase().includes(q) && !c.engagement.toLowerCase().includes(q) && !c.workflowName.toLowerCase().includes(q)) return false;
    }
    if (activeFilter === 'all') return true;
    if (activeFilter === 'action') return c.testing === 'Not Started' || c.evidenceStatus === 'partial';
    if (activeFilter === 'progress') return c.testing === 'In Progress';
    if (activeFilter === 'complete') return c.testing === 'Complete' && c.conclusion === 'Effective';
    if (activeFilter === 'exceptions') return c.conclusion === 'Exception' || c.conclusion === 'Ineffective';
    return true;
  });

  return (
    <div className="h-full overflow-y-auto bg-white bg-mesh-gradient relative">
      <Orb hoverIntensity={0.09} rotateOnHover hue={210} opacity={0.08} />
      <div className="p-8 relative">
        {/* Header */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-text">Control Testing</h1>
            <p className="text-sm text-text-secondary mt-1">Execute testing, manage evidence, and document conclusions.</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-[13px] font-semibold transition-colors cursor-pointer">
              <Filter size={14} />
              Advanced Filters
            </button>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2 mb-6">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-[12px] font-medium transition-all cursor-pointer ${
                activeFilter === f.key
                  ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary/20'
                  : 'border-border-light bg-white text-text-secondary hover:border-primary/20 active:scale-[0.98]'
              }`}
            >
              {f.label}
              <span className={`text-[12px] font-bold px-1.5 py-0.5 rounded-full ${
                activeFilter === f.key ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-500'
              }`}>
                {f.count}
              </span>
            </button>
          ))}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          {[
            { label: 'Total Controls', value: '45', color: 'text-text' },
            { label: 'Tested', value: '28', color: 'text-info' },
            { label: 'Effective', value: '20', color: 'text-success' },
            { label: 'Exceptions', value: '5', color: 'text-danger' },
            { label: 'Completion', value: '62%', color: 'text-primary', progress: 62 },
          ].map(card => (
            <div key={card.label} className="bg-white rounded-xl border border-border-light p-3 text-center transition-all duration-200">
              <div className={`text-xl font-bold ${card.color}`}>{card.value}</div>
              <div className="text-[12px] text-text-muted">{card.label}</div>
              {card.progress !== undefined && (
                <div className="mt-1.5 h-1.5 bg-border-light rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${card.progress}%` }} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search controls by ID, name, engagement, or workflow..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-[13px] bg-white border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all placeholder:text-text-muted"
          />
        </div>

        {/* Pipeline Table */}
        <div className="bg-white rounded-xl border border-border-light overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-border-light bg-surface-2/50">
                  {['Control', 'Engagement', 'Workflow', 'Population', 'Sample', 'Evidence', 'Testing', 'Conclusion', 'Next Action', ''].map(h => (
                    <th key={h} className="px-3 py-3 text-left text-[12px] font-semibold text-text-muted">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filtered.map((row, i) => (
                    <motion.tr
                      key={row.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2, delay: i * 0.03 }}
                      className="border-b border-border-light/60 hover:bg-surface-2/40 transition-colors group"
                    >
                      <td className="px-3 py-3">
                        <div className="flex flex-col">
                          <span className="font-mono text-[12px] text-text-muted">{row.id}</span>
                          <span className="text-text font-medium text-[12px]">{row.control}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span className="text-text-secondary font-mono text-[12px] bg-gray-50 px-1.5 py-0.5 rounded">{row.engagement}</span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1">
                            <Workflow size={10} className="text-indigo-500" />
                            <span className="text-[11px] text-indigo-700 font-medium">{row.workflowName}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-text-muted font-mono">{row.workflowVersion}</span>
                            <span className="text-[10px] text-text-muted">&middot;</span>
                            <span className="text-[10px] text-text-muted">{row.attributeCount} attrs</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`text-[12px] font-medium ${
                          row.populationStatus === 'validated' ? 'text-compliant' :
                          row.populationStatus === 'received' ? 'text-evidence-700' :
                          'text-gray-400'
                        }`}>
                          {row.population}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`text-[12px] ${row.sample === '-' ? 'text-gray-300' : 'text-text-secondary'}`}>
                          {row.sample}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <EvidenceBadge label={row.evidence} status={row.evidenceStatus} />
                      </td>
                      <td className="px-3 py-3">
                        <TestingBadge status={row.testing} />
                      </td>
                      <td className="px-3 py-3">
                        <ConclusionBadge conclusion={row.conclusion} />
                      </td>
                      <td className="px-3 py-3">
                        <ActionButton label={row.nextAction} type={row.nextActionType} />
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => onOpenWorkingPaper?.(row.id)}
                            className="p-1 rounded hover:bg-indigo-50 text-text-muted hover:text-indigo-600 cursor-pointer transition-colors"
                            title="Working Paper"
                          >
                            <Database size={12} />
                          </button>
                          <button
                            onClick={() => onOpenWorkflow?.(row.id)}
                            className="p-1 rounded hover:bg-violet-50 text-text-muted hover:text-violet-600 cursor-pointer transition-colors"
                            title="Workflow"
                          >
                            <Workflow size={12} />
                          </button>
                          <button
                            onClick={() => onOpenTrace?.(row.id)}
                            className="p-1 rounded hover:bg-purple-50 text-text-muted hover:text-purple-600 cursor-pointer transition-colors"
                            title="Trace"
                          >
                            <Shield size={12} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-border-light bg-surface-2/30">
            <span className="text-[12px] text-text-muted">
              Showing {filtered.length} of {CONTROLS.length} controls
            </span>
            <div className="flex items-center gap-1">
              <span className="text-[12px] text-text-muted">Page 1 of 1</span>
              <button className="p-1 rounded hover:bg-gray-100 text-text-muted cursor-pointer">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
