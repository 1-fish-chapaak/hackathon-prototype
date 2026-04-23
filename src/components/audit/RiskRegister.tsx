import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  Download, Plus, Lightbulb, Shield, ArrowRight
} from 'lucide-react';
import { RISKS, BUSINESS_PROCESSES } from '../../data/mockData';
import { StatusBadge, SeverityBadge } from '../shared/StatusBadge';
import SmartTable from '../shared/SmartTable';
import Orb from '../shared/Orb';
import { useToast } from '../shared/Toast';

interface Props {
  onRunWorkflow?: (workflowId: string) => void;
}

const AI_RECOMMENDED_CONTROLS = [
  { riskId: 'RSK-004', riskName: 'Fictitious vendor registration', control: 'Vendor verification workflow with govt ID validation', confidence: 94 },
  { riskId: 'RSK-007', riskName: 'Malware via vendor portals', control: 'Automated URL scanning & sandbox file inspection', confidence: 87 },
  { riskId: 'RSK-009', riskName: 'Third-party vendor access', control: 'Just-in-time access provisioning with auto-expiry', confidence: 91 },
];

export default function RiskRegister({ onRunWorkflow }: Props) {
  const { addToast } = useToast();
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  // Recommendations are always visible inline

  const filtered = RISKS.filter(r => {
    if (severityFilter !== 'all' && r.severity !== severityFilter) return false;
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    return true;
  });

  const severityCounts = {
    critical: RISKS.filter(r => r.severity === 'critical').length,
    high: RISKS.filter(r => r.severity === 'high').length,
    medium: RISKS.filter(r => r.severity === 'medium').length,
    low: RISKS.filter(r => r.severity === 'low').length,
  };

  return (
    <div className="h-full overflow-y-auto bg-white bg-mesh-gradient relative">
      <Orb hoverIntensity={0.09} rotateOnHover hue={275} opacity={0.08} />
      <div className="p-8 relative">
        {/* Header */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-text">Risk Register</h1>
            <p className="text-sm text-text-secondary mt-1">{RISKS.length} risks across {BUSINESS_PROCESSES.length} business processes</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => addToast({ message: 'Risk register exported as CSV', type: 'success' })} className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg text-[13px] text-text-secondary hover:bg-white transition-colors cursor-pointer">
              <Download size={14} />
              Export
            </button>
            <button onClick={() => addToast({ message: 'New risk template created — complete the details to save', type: 'info' })} className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-[13px] font-semibold transition-colors cursor-pointer">
              <Plus size={14} />
              Add Risk
            </button>
          </div>
        </div>

        {/* AI Insight */}
        <div className="bg-gradient-to-r from-primary-xlight via-white to-primary-xlight rounded-2xl border border-primary/10 p-4 mb-6 flex items-center gap-4">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-medium flex items-center justify-center shrink-0">
            <Sparkles size={16} className="text-white" />
          </div>
          <div className="flex-1">
            <div className="text-[12.5px] font-semibold text-text">AI Risk Analysis</div>
            <div className="text-[12px] text-text-secondary mt-0.5">
              {RISKS.filter(r => r.ctls === 0).length} risks have no controls mapped. {RISKS.filter(r => r.severity === 'critical').length} critical risks require immediate attention.
              <span className="text-primary font-semibold cursor-pointer hover:underline ml-1">Auto-suggest controls</span>
            </div>
          </div>
        </div>

        {/* Severity summary */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {Object.entries(severityCounts).map(([sev, count], i) => {
            const colors: Record<string, string> = {
              critical: 'border-risk bg-risk-50',
              high: 'border-high bg-high-50',
              medium: 'border-mitigated bg-mitigated-50',
              low: 'border-compliant bg-compliant-50',
            };
            const textColors: Record<string, string> = {
              critical: 'text-risk-700',
              high: 'text-high-700',
              medium: 'text-mitigated-700',
              low: 'text-compliant-700',
            };
            return (
              <motion.div
                key={sev}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSeverityFilter(severityFilter === sev ? 'all' : sev)}
                className={`rounded-xl border p-4 cursor-pointer transition-all hover:shadow-sm ${
                  severityFilter === sev ? `${colors[sev]} ring-2 ring-offset-1 ring-current` : colors[sev]
                }`}
              >
                <div className={`text-2xl font-bold ${textColors[sev]}`}>{count}</div>
                <div className="text-[12px] text-text-secondary mt-0.5 capitalize">{sev}</div>
              </motion.div>
            );
          })}
        </div>

        {/* Table */}
        <SmartTable
          data={filtered as Record<string, unknown>[]}
          keyField="id"
          searchPlaceholder="Search risks..."
          searchKeys={['id', 'name']}
          pageSize={8}
          headerExtra={
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-border bg-white text-[12px] text-text-secondary outline-none focus:border-primary/40 cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="mitigated">Mitigated</option>
            </select>
          }
          expandable={(item) => {
            const risk = item as unknown as typeof RISKS[0];
            return (
              <div className="flex items-center gap-4">
                <div className="text-[12px] text-text-secondary leading-relaxed flex-1">
                  <span className="font-semibold text-text">Full description: </span>
                  {risk.name}
                  {risk.lastUpdated && <span className="text-text-muted ml-2">Last updated: {risk.lastUpdated}</span>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {risk.bpId === 'p2p' && onRunWorkflow && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onRunWorkflow('wf-001'); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-compliant-50 hover:bg-compliant-50/80 text-compliant-700 text-[12px] font-semibold rounded-lg cursor-pointer"
                    >
                      <ArrowRight size={12} />
                      Run Workflow
                    </button>
                  )}
                </div>
              </div>
            );
          }}
          columns={[
            { key: 'id', label: 'Risk ID', width: '90px', render: (item) => (
              <span className="font-mono text-text-muted text-[12px]">{String(item.id)}</span>
            )},
            { key: 'name', label: 'Description', render: (item) => {
              const risk = item as unknown as typeof RISKS[0];
              return (
                <div>
                  <div className="text-text font-medium truncate max-w-[280px]">{risk.name}</div>
                  {risk.lastUpdated && <div className="text-[12px] text-text-muted mt-0.5">Updated {risk.lastUpdated}</div>}
                </div>
              );
            }},
            { key: 'severity', label: 'Severity', width: '100px', render: (item) => (
              <SeverityBadge severity={String(item.severity)} />
            )},
            { key: 'bpId', label: 'Process', width: '80px', render: (item) => {
              const bp = BUSINESS_PROCESSES.find(b => b.id === item.bpId);
              return (
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: bp?.color }} />
                  <span className="text-text-secondary text-[12px]">{bp?.abbr}</span>
                </span>
              );
            }},
            { key: 'ctls', label: 'Controls', align: 'center', width: '90px', render: (item) => {
              const risk = item as unknown as typeof RISKS[0];
              return <span>{risk.ctls} <span className="text-text-muted">({risk.keyCtls} key)</span></span>;
            }},
            { key: 'status', label: 'Status', width: '100px', render: (item) => (
              <StatusBadge status={String(item.status)} />
            )},
          ]}
        />

        {/* AI Risk Analysis — Always Visible Inline */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6"
        >
          <div className="rounded-xl border border-primary/15 bg-gradient-to-br from-primary-xlight/60 via-white to-primary-xlight/30 p-5">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-1.5 bg-primary/10 rounded-lg">
                <Lightbulb size={14} className="text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-[13px] font-semibold text-text">AI Risk Analysis &amp; Recommendations</h3>
                <p className="text-[12px] text-text-muted mt-0.5">{AI_RECOMMENDED_CONTROLS.length} risks with zero controls — AI suggests mitigations</p>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-primary/5 border border-primary/10 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-compliant animate-pulse" />
                <span className="text-[12px] font-semibold text-text-muted">Auto-refreshes when risks or controls change</span>
              </div>
            </div>
            <div className="space-y-2.5">
              {AI_RECOMMENDED_CONTROLS.map((rec, i) => (
                <motion.div
                  key={rec.riskId}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                  className="flex items-start gap-3 p-4 rounded-xl bg-white border border-border-light hover:border-primary/20 hover:shadow-sm transition-all group"
                >
                  <div className="p-1.5 bg-primary/5 rounded-lg text-primary shrink-0 mt-0.5">
                    <Shield size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[12px] font-mono font-bold text-primary">{rec.riskId}</span>
                      <span className="text-[12px] font-medium text-text">Recommend mapping control</span>
                    </div>
                    <div className="text-[12.5px] font-medium text-text">{rec.control}</div>
                    <div className="text-[12px] text-text-muted mt-1">Mitigates: {rec.riskName}</div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex items-center gap-1">
                        <Sparkles size={9} className="text-primary" />
                        <span className="text-[12px] font-semibold text-primary">{rec.confidence}% confidence</span>
                      </div>
                      <div className="h-1 flex-1 max-w-[60px] bg-surface-3 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${rec.confidence}%` }} />
                      </div>
                    </div>
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 px-2.5 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-[12px] font-semibold rounded-lg cursor-pointer shrink-0">
                    <Plus size={10} />
                    Add
                  </button>
                </motion.div>
              ))}
            </div>
            <div className="mt-3 flex justify-center">
              <button className="flex items-center gap-1.5 text-[12px] text-primary font-semibold hover:underline cursor-pointer">
                View all recommendations
                <ArrowRight size={10} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
