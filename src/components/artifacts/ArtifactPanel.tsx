import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, ChevronDown, FileCode,
  Database, BarChart3, Table2, Sparkles, Copy, Download,
  Maximize2, ArrowRight, AlertTriangle, FileText, Share2
} from 'lucide-react';
import type { ArtifactTab } from '../../hooks/useAppState';

interface ArtifactPanelProps {
  activeTab: ArtifactTab;
  setActiveTab: (t: ArtifactTab) => void;
  onClose: () => void;
  onManageExceptions?: () => void;
  onAddToReport?: () => void;
  onShareResults?: () => void;
}

const TABS: { id: ArtifactTab; label: string; icon: React.ElementType }[] = [
  { id: 'plan', label: 'Plan', icon: Sparkles },
  { id: 'code', label: 'Code', icon: FileCode },
  { id: 'sources', label: 'Sources', icon: Database },
  { id: 'result', label: 'Result', icon: BarChart3 },
];

function CollapsibleSection({ title, icon: Icon, defaultOpen = true, children }: { title: string; icon: React.ElementType; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-border-light rounded-xl bg-white overflow-hidden">
      <button
        onClick={() => setOpen(p => !p)}
        aria-expanded={open}
        className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-text hover:bg-gray-50 transition-colors cursor-pointer"
      >
        <Icon size={14} className="text-primary" />
        <span className="flex-1 text-left">{title}</span>
        <ChevronDown size={14} className={`text-text-muted transition-transform ${open ? '' : '-rotate-90'}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-border-light">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PlanTab() {
  const steps = [
    { step: 1, title: 'Parse user query', desc: 'Identified intent: risk analysis query for P2P process', status: 'done' },
    { step: 2, title: 'Identify data sources', desc: 'Selected: SAP ERP AP Module, Vendor Master Data', status: 'done' },
    { step: 3, title: 'Generate query plan', desc: 'Built SQL joins across 3 tables with risk severity filter', status: 'done' },
    { step: 4, title: 'Execute query', desc: 'Processed 1.2M records, filtered to 9 matching risks', status: 'done' },
    { step: 5, title: 'Format results', desc: 'Generated table view with severity indicators and control mapping', status: 'done' },
  ];

  return (
    <div className="space-y-3 pt-4">
      <CollapsibleSection title="Query Execution Plan" icon={Sparkles}>
        <div className="space-y-3 pt-3">
          {steps.map((s, i) => (
            <div key={s.step} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                  s.status === 'done' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {s.step}
                </div>
                {i < steps.length - 1 && <div className="w-px h-full bg-border-light mt-1" />}
              </div>
              <div className="pb-3">
                <div className="text-[13px] font-medium text-text">{s.title}</div>
                <div className="text-[11.5px] text-text-muted mt-0.5">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </CollapsibleSection>
    </div>
  );
}

function CodeTab() {
  const sql = `SELECT
  r.id AS risk_id,
  r.name AS risk_name,
  r.severity,
  COUNT(c.id) AS control_count,
  SUM(CASE WHEN c.is_key THEN 1 ELSE 0 END) AS key_controls
FROM risks r
LEFT JOIN controls c ON c.risk_id = r.id
WHERE r.bp_id = 'p2p'
  AND r.severity IN ('critical', 'high')
GROUP BY r.id, r.name, r.severity
ORDER BY
  CASE r.severity
    WHEN 'critical' THEN 1
    WHEN 'high' THEN 2
  END;`;

  return (
    <div className="space-y-3 pt-4">
      <CollapsibleSection title="Generated SQL Query" icon={FileCode}>
        <div className="mt-3 relative">
          <pre className="bg-gray-950 text-gray-200 rounded-lg p-4 text-[12px] font-mono overflow-x-auto leading-relaxed">
            <code>{sql}</code>
          </pre>
          <button className="absolute top-2 right-2 p-1.5 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded-md transition-colors cursor-pointer">
            <Copy size={12} />
          </button>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Execution Stats" icon={BarChart3} defaultOpen={false}>
        <div className="grid grid-cols-3 gap-3 pt-3">
          <div className="bg-surface-2 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-text">1.2M</div>
            <div className="text-[10px] text-text-muted uppercase tracking-wider">Records Scanned</div>
          </div>
          <div className="bg-surface-2 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-text">0.3s</div>
            <div className="text-[10px] text-text-muted uppercase tracking-wider">Query Time</div>
          </div>
          <div className="bg-surface-2 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-text">9</div>
            <div className="text-[10px] text-text-muted uppercase tracking-wider">Results</div>
          </div>
        </div>
      </CollapsibleSection>
    </div>
  );
}

function SourcesTab() {
  const sources = [
    { name: 'SAP ERP — AP Module', type: 'SQL Database', records: '1.2M rows', tables: ['risks', 'controls', 'risk_control_map'] },
    { name: 'Vendor Master Data', type: 'CSV File', records: '892 vendors', tables: ['vendor_master.csv'] },
  ];

  return (
    <div className="space-y-3 pt-4">
      {sources.map((src, i) => (
        <CollapsibleSection key={i} title={src.name} icon={Database}>
          <div className="pt-3 space-y-2">
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-text-muted">Type</span>
              <span className="text-text font-medium">{src.type}</span>
            </div>
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-text-muted">Records</span>
              <span className="text-text font-medium">{src.records}</span>
            </div>
            <div className="text-[12px] text-text-muted mt-2">Tables/Files used:</div>
            <div className="flex flex-wrap gap-1.5">
              {src.tables.map(t => (
                <span key={t} className="text-[11px] bg-primary-xlight text-primary px-2 py-0.5 rounded font-mono">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </CollapsibleSection>
      ))}
    </div>
  );
}

function ResultTab({ onManageExceptions, onAddToReport, onShareResults }: {
  onManageExceptions?: () => void;
  onAddToReport?: () => void;
  onShareResults?: () => void;
}) {
  const risks = [
    { id: 'RSK-001', name: 'Unauthorized vendor payments', severity: 'high', controls: 3, keyControls: 1, status: 'open' },
    { id: 'RSK-002', name: 'Duplicate invoices leading to overpayment', severity: 'high', controls: 4, keyControls: 2, status: 'mitigated' },
    { id: 'RSK-004', name: 'Fictitious vendor registration', severity: 'critical', controls: 0, keyControls: 0, status: 'open' },
    { id: 'RSK-007', name: 'Malware infection via vendor portals', severity: 'high', controls: 0, keyControls: 0, status: 'open' },
    { id: 'RSK-008', name: 'SOD violation in Accounts Payable', severity: 'critical', controls: 3, keyControls: 1, status: 'open' },
  ];

  const severityColor: Record<string, string> = {
    critical: 'bg-red-100 text-red-700',
    high: 'bg-orange-100 text-orange-700',
  };

  const statusColor: Record<string, string> = {
    open: 'text-red-600',
    mitigated: 'text-green-600',
  };

  return (
    <div className="space-y-3 pt-4">
      <CollapsibleSection title="Query Results — 5 High/Critical Risks" icon={Table2}>
        <div className="pt-3">
          <div className="overflow-x-auto rounded-lg border border-border-light">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="bg-surface-2">
                  <th className="text-left px-3 py-2 font-semibold text-text-secondary">ID</th>
                  <th className="text-left px-3 py-2 font-semibold text-text-secondary">Risk</th>
                  <th className="text-left px-3 py-2 font-semibold text-text-secondary">Severity</th>
                  <th className="text-center px-3 py-2 font-semibold text-text-secondary">Controls</th>
                  <th className="text-left px-3 py-2 font-semibold text-text-secondary">Status</th>
                </tr>
              </thead>
              <tbody>
                {risks.map((r, i) => (
                  <tr key={r.id} className={`border-t border-border-light hover:bg-primary-xlight/50 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-surface-2/50'}`}>
                    <td className="px-3 py-2.5 font-mono text-text-muted">{r.id}</td>
                    <td className="px-3 py-2.5 text-text font-medium">{r.name}</td>
                    <td className="px-3 py-2.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${severityColor[r.severity]}`}>
                        {r.severity}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-center text-text">
                      {r.controls} <span className="text-text-muted">({r.keyControls} key)</span>
                    </td>
                    <td className={`px-3 py-2.5 font-medium capitalize ${statusColor[r.status]}`}>{r.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Summary Insight" icon={Sparkles} defaultOpen={false}>
        <div className="pt-3 text-[12.5px] text-text leading-relaxed">
          <p>Found <strong>5 high/critical risks</strong> in the P2P process. <strong>2 risks</strong> (RSK-004, RSK-007) have <strong>zero controls</strong> mapped — these represent the highest exposure. RSK-008 (SOD violation) has controls but requires immediate attention due to critical severity.</p>
          <div className="mt-3 flex gap-2">
            <button className="text-[11px] text-primary font-semibold flex items-center gap-1 hover:underline cursor-pointer" id="artifact-add-report">
              Add to Report <ArrowRight size={10} />
            </button>
            <button className="text-[11px] text-primary font-semibold flex items-center gap-1 hover:underline cursor-pointer">
              Add to Dashboard <ArrowRight size={10} />
            </button>
          </div>
        </div>
      </CollapsibleSection>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-2">
        {onAddToReport && (
          <button
            onClick={onAddToReport}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 border border-border-light rounded-xl text-[11px] font-semibold text-text-secondary hover:border-primary/30 hover:text-primary hover:bg-primary-xlight/50 transition-all cursor-pointer"
          >
            <FileText size={12} />
            Add to Report
          </button>
        )}
        {onManageExceptions && (
          <button
            onClick={onManageExceptions}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl text-[11px] font-semibold hover:from-orange-600 hover:to-amber-600 transition-all cursor-pointer shadow-sm"
          >
            <AlertTriangle size={12} />
            Manage Exceptions
          </button>
        )}
        {onShareResults && (
          <button
            onClick={onShareResults}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 border border-border-light rounded-xl text-[11px] font-semibold text-text-secondary hover:border-primary/30 hover:text-primary hover:bg-primary-xlight/50 transition-all cursor-pointer"
          >
            <Share2 size={12} />
          </button>
        )}
      </div>
    </div>
  );
}

export default function ArtifactPanel({ activeTab, setActiveTab, onClose, onManageExceptions, onAddToReport, onShareResults }: ArtifactPanelProps) {
  return (
    <motion.div
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 440, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="h-full bg-surface-2 border-l border-border-light flex flex-col overflow-hidden shrink-0"
    >
      {/* Header */}
      <div className="h-12 border-b border-border-light bg-white flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-1">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-primary/10 text-primary'
                  : 'text-text-muted hover:text-text-secondary hover:bg-gray-50'
              }`}
            >
              <tab.icon size={13} />
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <button className="p-1.5 text-text-muted hover:text-text-secondary rounded-md hover:bg-gray-50 transition-colors cursor-pointer">
            <Download size={14} />
          </button>
          <button className="p-1.5 text-text-muted hover:text-text-secondary rounded-md hover:bg-gray-50 transition-colors cursor-pointer">
            <Maximize2 size={14} />
          </button>
          <button onClick={onClose} className="p-1.5 text-text-muted hover:text-text-secondary rounded-md hover:bg-gray-50 transition-colors cursor-pointer">
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === 'plan' && <PlanTab />}
            {activeTab === 'code' && <CodeTab />}
            {activeTab === 'sources' && <SourcesTab />}
            {activeTab === 'result' && <ResultTab onManageExceptions={onManageExceptions} onAddToReport={onAddToReport} onShareResults={onShareResults} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
