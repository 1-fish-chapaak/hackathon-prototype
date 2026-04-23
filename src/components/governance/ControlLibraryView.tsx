import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  Plus,
  Download,
  Filter,
  Star,
  ArrowRight,
} from 'lucide-react';
import SmartTable from '../shared/SmartTable';
import Orb from '../shared/Orb';
import { useToast } from '../shared/Toast';

interface Props {
  /* no external props needed */
}

interface ControlRow {
  id: string;
  controlId: string;
  name: string;
  domain: string;
  type: 'Manual' | 'Automated' | 'IT Dependent';
  keyControl: boolean;
  usage: string;
  usageCount: number;
  status: 'Active' | 'Failed' | 'Draft';
}

const MOCK_CONTROLS: ControlRow[] = [
  { id: 'C-001', controlId: 'C-001', name: 'Credit Limit Approval', domain: 'Financial', type: 'Manual', keyControl: true, usage: '3 RACMs', usageCount: 3, status: 'Active' },
  { id: 'C-002', controlId: 'C-002', name: 'Vendor Onboarding Review', domain: 'P2P', type: 'Manual', keyControl: true, usage: '2 RACMs', usageCount: 2, status: 'Active' },
  { id: 'C-003', controlId: 'C-003', name: 'Automated 3-Way Match', domain: 'P2P', type: 'Automated', keyControl: true, usage: '4 RACMs', usageCount: 4, status: 'Active' },
  { id: 'C-004', controlId: 'C-004', name: 'Journal Entry Review', domain: 'R2R', type: 'Manual', keyControl: false, usage: '2 RACMs', usageCount: 2, status: 'Active' },
  { id: 'C-005', controlId: 'C-005', name: 'Access Recertification', domain: 'IT', type: 'IT Dependent', keyControl: true, usage: '1 RACM', usageCount: 1, status: 'Failed' },
  { id: 'C-006', controlId: 'C-006', name: 'Bank Reconciliation', domain: 'Financial', type: 'Manual', keyControl: false, usage: '2 RACMs', usageCount: 2, status: 'Draft' },
];

const TYPE_STYLES: Record<string, { bg: string; text: string }> = {
  Automated: { bg: 'bg-blue-100', text: 'text-blue-800' },
  Manual: { bg: 'bg-gray-100', text: 'text-gray-700' },
  'IT Dependent': { bg: 'bg-purple-100', text: 'text-purple-800' },
};

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  Active: { bg: 'bg-success-bg', text: 'text-green-800', dot: 'bg-success' },
  Failed: { bg: 'bg-danger-bg', text: 'text-red-800', dot: 'bg-danger' },
  Draft: { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' },
};

export default function ControlLibraryView({}: Props) {
  const { addToast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filtered = MOCK_CONTROLS.filter(c => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (typeFilter !== 'all' && c.type !== typeFilter) return false;
    return true;
  });

  const keyCount = MOCK_CONTROLS.filter(c => c.keyControl).length;
  const autoCount = MOCK_CONTROLS.filter(c => c.type === 'Automated').length;
  const totalCount = MOCK_CONTROLS.length;

  return (
    <div className="h-full overflow-y-auto bg-white bg-mesh-gradient relative">
      <Orb hoverIntensity={0.09} rotateOnHover hue={275} opacity={0.08} />
      <div className="px-6 py-8 relative">
        {/* Header */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-text tracking-tight">Control Library</h1>
            <p className="text-sm text-text-secondary mt-1">Centralized repository of all mitigating controls.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => addToast({ message: 'Control library exported as CSV', type: 'success' })}
              className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg text-[13px] text-text-secondary hover:bg-white transition-colors cursor-pointer"
            >
              <Download size={14} />
              Export
            </button>
            <button
              onClick={() => addToast({ message: 'New control template created — complete the details to save', type: 'info' })}
              className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-[13px] font-semibold transition-colors cursor-pointer"
            >
              <Plus size={14} />
              New Control
            </button>
          </div>
        </div>

        {/* AI Insight */}
        <div className="bg-gradient-to-r from-primary-xlight via-white to-primary-xlight rounded-2xl border border-primary/10 p-4 mb-6 flex items-center gap-4 ai-shimmer">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-medium flex items-center justify-center shrink-0 ai-pulse-ring">
            <Sparkles size={16} className="text-white" />
          </div>
          <div className="flex-1">
            <div className="text-[12.5px] font-semibold text-text">Control Health Summary</div>
            <div className="text-[11.5px] text-text-secondary mt-0.5">
              1 key control has failed testing and requires remediation. 1 control is still in draft.
              <span className="text-primary font-semibold cursor-pointer hover:underline ml-1">Review findings</span>
            </div>
          </div>
        </div>

        {/* Summary badges */}
        <div className="flex items-center gap-3 mb-6">
          {[
            { label: 'Key Controls', count: keyCount, bg: 'bg-amber-50', text: 'text-amber-800', dot: 'bg-amber-400' },
            { label: 'Automated', count: autoCount, bg: 'bg-blue-50', text: 'text-blue-800', dot: 'bg-blue-400' },
            { label: 'Total', count: totalCount, bg: 'bg-gray-50', text: 'text-gray-700', dot: 'bg-gray-400' },
          ].map((badge, i) => (
            <motion.div
              key={badge.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-transparent ${badge.bg} ${badge.text}`}
            >
              <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
              <span className="text-[12.5px] font-semibold">{badge.label}: {badge.count}</span>
            </motion.div>
          ))}
        </div>

        {/* Table */}
        <SmartTable
          data={filtered as unknown as Record<string, unknown>[]}
          keyField="id"
          searchPlaceholder="Search controls..."
          searchKeys={['controlId', 'name', 'domain']}
          pageSize={10}
          headerExtra={
            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-border bg-white text-[12px] text-text-secondary outline-none focus:border-primary/40 cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="Active">Active</option>
                <option value="Failed">Failed</option>
                <option value="Draft">Draft</option>
              </select>
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-border bg-white text-[12px] text-text-secondary outline-none focus:border-primary/40 cursor-pointer"
              >
                <option value="all">All Types</option>
                <option value="Manual">Manual</option>
                <option value="Automated">Automated</option>
                <option value="IT Dependent">IT Dependent</option>
              </select>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-white text-[12px] text-text-secondary hover:bg-surface-2 cursor-pointer transition-colors">
                <Filter size={12} />
                Filters
              </button>
            </div>
          }
          expandable={(item) => {
            const ctrl = item as unknown as ControlRow;
            return (
              <div className="flex items-center gap-4">
                <div className="text-[12px] text-text-secondary leading-relaxed flex-1">
                  <span className="font-semibold text-text">Domain: </span>{ctrl.domain}
                  <span className="text-text-muted ml-3">Type: {ctrl.type}</span>
                  <span className="text-text-muted ml-3">Used in {ctrl.usage}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                </div>
              </div>
            );
          }}
          columns={[
            {
              key: 'controlId',
              label: 'Control ID',
              width: '90px',
              render: (item) => (
                <span className="font-mono text-text-muted text-[11px]">{String(item.controlId)}</span>
              ),
            },
            {
              key: 'name',
              label: 'Control Name',
              render: (item) => {
                const ctrl = item as unknown as ControlRow;
                return (
                  <div className="text-text font-medium">{ctrl.name}</div>
                );
              },
            },
            {
              key: 'domain',
              label: 'Domain',
              width: '90px',
              render: (item) => {
                const ctrl = item as unknown as ControlRow;
                const domainColors: Record<string, string> = { Financial: '#6a12cd', P2P: '#0284c7', R2R: '#d97706', IT: '#16a34a' };
                return (
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: domainColors[ctrl.domain] || '#888' }} />
                    <span className="text-text-secondary text-[11px] font-medium">{ctrl.domain}</span>
                  </span>
                );
              },
            },
            {
              key: 'type',
              label: 'Type',
              width: '110px',
              render: (item) => {
                const ctrl = item as unknown as ControlRow;
                const t = TYPE_STYLES[ctrl.type];
                return (
                  <span className={`inline-flex items-center ${t.bg} ${t.text} px-2.5 py-0.5 rounded text-[11px] font-bold whitespace-nowrap`}>
                    {ctrl.type}
                  </span>
                );
              },
            },
            {
              key: 'keyControl',
              label: 'Key Control',
              width: '100px',
              align: 'center',
              render: (item) => {
                const ctrl = item as unknown as ControlRow;
                if (ctrl.keyControl) {
                  return (
                    <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded text-[11px] font-semibold">
                      <Star size={10} className="fill-amber-400 text-amber-400" />
                      Key
                    </span>
                  );
                }
                return (
                  <span className="inline-flex items-center bg-gray-50 text-gray-500 px-2 py-0.5 rounded text-[11px] font-medium">
                    Non-Key
                  </span>
                );
              },
            },
            {
              key: 'usageCount',
              label: 'Usage',
              width: '90px',
              align: 'center',
              render: (item) => {
                const ctrl = item as unknown as ControlRow;
                return <span className="text-[12px] text-text-secondary">{ctrl.usage}</span>;
              },
            },
            {
              key: 'status',
              label: 'Status',
              width: '100px',
              render: (item) => {
                const ctrl = item as unknown as ControlRow;
                const s = STATUS_STYLES[ctrl.status];
                return (
                  <span className={`inline-flex items-center gap-1.5 ${s.bg} ${s.text} px-2.5 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                    {ctrl.status}
                  </span>
                );
              },
            },
          ]}
        />

        {/* AI Footer */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6"
        >
          <div className="rounded-xl border border-primary/15 bg-gradient-to-br from-primary-xlight/60 via-white to-primary-xlight/30 p-5">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="p-1.5 bg-primary/10 rounded-lg">
                <Sparkles size={14} className="text-primary" />
              </div>
              <div>
                <h3 className="text-[13px] font-semibold text-text">AI Control Recommendations</h3>
                <p className="text-[10.5px] text-text-muted mt-0.5">Access Recertification (C-005) has failed -- AI suggests remediation steps</p>
              </div>
            </div>
            <div className="flex justify-center">
              <button className="flex items-center gap-1.5 text-[11px] text-primary font-semibold hover:underline cursor-pointer">
                View remediation plan
                <ArrowRight size={10} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
