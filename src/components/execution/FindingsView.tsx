import { useState } from 'react';
import {
  Search, ChevronDown, ChevronRight, AlertTriangle, Clock,
  CheckCircle2, AlertOctagon, ExternalLink, Bell, ArrowUpRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Orb from '../shared/Orb';

type FilterKey = 'all' | 'open' | 'in-remediation' | 'overdue' | 'closed';

const FILTERS: { key: FilterKey; label: string; count: number }[] = [
  { key: 'all', label: 'All', count: 47 },
  { key: 'open', label: 'Open', count: 12 },
  { key: 'in-remediation', label: 'In Remediation', count: 18 },
  { key: 'overdue', label: 'Overdue', count: 5 },
  { key: 'closed', label: 'Closed', count: 12 },
];

type Severity = 'Material Weakness' | 'Significant Deficiency' | 'Control Deficiency';
type Status = 'Open' | 'In Remediation' | 'Overdue' | 'Closed';

interface Finding {
  id: string;
  title: string;
  engagement: string;
  control: string;
  severity: Severity;
  status: Status;
  owner: string;
  dueDate: string;
  aging: string;
  remediationPlan: string;
  timeline: string;
  evidenceLinks: string[];
}

const FINDINGS: Finding[] = [
  {
    id: 'DEF-001',
    title: 'Duplicate vendor payments detected',
    engagement: 'ENG-2026-001',
    control: 'C-003',
    severity: 'Material Weakness',
    status: 'In Remediation',
    owner: 'Mike Ross',
    dueDate: 'Apr 15, 2026',
    aging: '12 days',
    remediationPlan: 'Implement automated duplicate detection rules in SAP. Configure 3-way match validation for all payments above $10K threshold.',
    timeline: 'Phase 1 complete (rule definition). Phase 2 in progress (UAT testing). Expected go-live: Apr 10, 2026.',
    evidenceLinks: ['DUP-ANALYSIS-Q1.xlsx', 'SAP-CONFIG-CHANGE.pdf', 'UAT-RESULTS-DRAFT.docx'],
  },
  {
    id: 'DEF-002',
    title: 'Missing approval for $50K+ payments',
    engagement: 'ENG-2026-001',
    control: 'C-001',
    severity: 'Significant Deficiency',
    status: 'Open',
    owner: 'Sarah Miller',
    dueDate: 'Apr 20, 2026',
    aging: '8 days',
    remediationPlan: 'Update workflow approval matrix to enforce dual-approval for payments exceeding $50K. Add system-level block for unapproved transactions.',
    timeline: 'Pending CFO sign-off on updated approval matrix. Target implementation: Apr 15, 2026.',
    evidenceLinks: ['APPROVAL-MATRIX-v2.xlsx', 'PAYMENT-EXCEPTIONS-LOG.pdf'],
  },
  {
    id: 'DEF-003',
    title: 'Vendor bank details changed without verification',
    engagement: 'ENG-2026-001',
    control: 'C-002',
    severity: 'Control Deficiency',
    status: 'Overdue',
    owner: 'Jane Chen',
    dueDate: 'Mar 15, 2026',
    aging: '45 days',
    remediationPlan: 'Implement callback verification process for all vendor bank detail changes. Require secondary authorization from Treasury team.',
    timeline: 'Originally due Mar 15. Escalated to VP Finance on Mar 25. Revised plan pending.',
    evidenceLinks: ['VENDOR-CHANGES-AUDIT.xlsx', 'ESCALATION-EMAIL.msg'],
  },
  {
    id: 'DEF-004',
    title: 'SOD violation in payment processing',
    engagement: 'ENG-2026-001',
    control: 'C-005',
    severity: 'Significant Deficiency',
    status: 'In Remediation',
    owner: 'Alex Kumar',
    dueDate: 'Apr 30, 2026',
    aging: '5 days',
    remediationPlan: 'Reconfigure SAP role assignments to enforce segregation between payment creation and approval. Remove conflicting access for 3 identified users.',
    timeline: 'Access review complete. Role redesign in progress with IT Security. Go-live scheduled: Apr 25, 2026.',
    evidenceLinks: ['SOD-CONFLICT-REPORT.pdf', 'ROLE-REDESIGN-PLAN.xlsx', 'ACCESS-REVIEW-Q1.pdf'],
  },
  {
    id: 'DEF-005',
    title: 'Revenue recognized before delivery confirmation',
    engagement: 'ENG-2026-002',
    control: 'C-004',
    severity: 'Material Weakness',
    status: 'Open',
    owner: 'Mike Ross',
    dueDate: 'May 1, 2026',
    aging: '3 days',
    remediationPlan: 'Implement system control linking revenue recognition to delivery confirmation in ERP. Add automated hold for shipments without POD.',
    timeline: 'Requirements gathering phase. Business case submitted to Steering Committee.',
    evidenceLinks: ['REV-REC-ANALYSIS.xlsx'],
  },
  {
    id: 'DEF-006',
    title: 'Access recertification not completed Q4',
    engagement: 'ENG-2026-001',
    control: 'C-005',
    severity: 'Control Deficiency',
    status: 'Closed',
    owner: 'John Doe',
    dueDate: 'Feb 28, 2026',
    aging: '-',
    remediationPlan: 'Completed quarterly access recertification for all critical systems. Implemented automated reminder workflow for future cycles.',
    timeline: 'Recertification completed Feb 26. Automated reminders configured Mar 5. Verified by Internal Audit Mar 10.',
    evidenceLinks: ['ACCESS-RECERT-Q4.pdf', 'AUTOMATED-WORKFLOW-CONFIG.pdf', 'AUDIT-SIGNOFF.pdf'],
  },
];

function SeverityBadge({ severity }: { severity: Severity }) {
  const map: Record<Severity, { bg: string; text: string }> = {
    'Material Weakness': { bg: 'bg-red-50 border-red-200', text: 'text-red-700' },
    'Significant Deficiency': { bg: 'bg-orange-50 border-orange-200', text: 'text-orange-700' },
    'Control Deficiency': { bg: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-700' },
  };
  const s = map[severity];
  return (
    <span className={`inline-flex items-center gap-1 ${s.bg} ${s.text} border px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap`}>
      <AlertTriangle size={10} />
      {severity}
    </span>
  );
}

function StatusBadge({ status }: { status: Status }) {
  const map: Record<Status, { bg: string; text: string; icon: React.ReactNode; pulse?: boolean }> = {
    'Open': { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', icon: <AlertOctagon size={10} /> },
    'In Remediation': { bg: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-700', icon: <Clock size={10} /> },
    'Overdue': { bg: 'bg-red-50 border-red-200', text: 'text-red-700', icon: <AlertTriangle size={10} />, pulse: true },
    'Closed': { bg: 'bg-green-50 border-green-200', text: 'text-green-700', icon: <CheckCircle2 size={10} /> },
  };
  const s = map[status];
  return (
    <span className={`inline-flex items-center gap-1 ${s.bg} ${s.text} border px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${s.pulse ? 'animate-pulse' : ''}`}>
      {s.icon}
      {status}
    </span>
  );
}

export default function FindingsView() {
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [search, setSearch] = useState('');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const filtered = FINDINGS.filter(f => {
    if (search) {
      const q = search.toLowerCase();
      if (
        !f.id.toLowerCase().includes(q) &&
        !f.title.toLowerCase().includes(q) &&
        !f.engagement.toLowerCase().includes(q) &&
        !f.owner.toLowerCase().includes(q)
      ) return false;
    }
    if (activeFilter === 'all') return true;
    if (activeFilter === 'open') return f.status === 'Open';
    if (activeFilter === 'in-remediation') return f.status === 'In Remediation';
    if (activeFilter === 'overdue') return f.status === 'Overdue';
    if (activeFilter === 'closed') return f.status === 'Closed';
    return true;
  });

  return (
    <div className="h-full overflow-y-auto bg-white bg-mesh-gradient relative">
      <Orb hoverIntensity={0.09} rotateOnHover hue={350} opacity={0.08} />
      <div className="max-w-7xl mx-auto px-8 py-8 relative">
        {/* Header */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-text tracking-tight">Findings & Issues</h1>
            <p className="text-sm text-text-secondary mt-1">Track audit findings, remediation, and closure across all engagements</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          {[
            { label: 'Total Findings', value: '47', color: 'text-text' },
            { label: 'Open', value: '12', color: 'text-blue-600' },
            { label: 'In Remediation', value: '18', color: 'text-yellow-600' },
            { label: 'Overdue', value: '5', color: 'text-red-600' },
            { label: 'Closed', value: '12', color: 'text-green-600' },
          ].map(card => (
            <div key={card.label} className="bg-white rounded-xl border border-border-light p-3 text-center hover:shadow-md transition-all duration-200">
              <div className={`text-xl font-bold ${card.color}`}>{card.value}</div>
              <div className="text-[10px] text-text-muted uppercase tracking-wider">{card.label}</div>
            </div>
          ))}
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
                  : 'border-border-light bg-white text-text-secondary hover:shadow-md hover:border-primary/20 active:scale-[0.98]'
              }`}
            >
              {f.label}
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                activeFilter === f.key ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-500'
              }`}>
                {f.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search findings by ID, title, engagement, or owner..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-[13px] bg-white border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all placeholder:text-text-muted"
          />
        </div>

        {/* Findings Table */}
        <div className="bg-white rounded-xl border border-border-light overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-border-light bg-surface-2/50">
                  {['', 'Finding ID', 'Title', 'Engagement', 'Control', 'Severity', 'Status', 'Owner', 'Due Date', 'Aging'].map(h => (
                    <th key={h} className="px-3 py-3 text-left text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filtered.map((row, i) => {
                    const isOverdue = row.status === 'Overdue';
                    const isClosed = row.status === 'Closed';
                    const isExpanded = expandedRow === row.id;

                    return (
                      <motion.tr
                        key={row.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2, delay: i * 0.03 }}
                        className={`border-b border-border-light/60 hover:bg-surface-2/40 transition-colors group cursor-pointer ${isOverdue ? 'border-l-[3px] border-l-red-400' : ''}`}
                        onClick={() => setExpandedRow(isExpanded ? null : row.id)}
                      >
                        <td className="px-3 py-3 w-6">
                          <ChevronDown
                            size={12}
                            className={`text-text-muted transition-transform duration-200 ${isExpanded ? '' : '-rotate-90'}`}
                          />
                        </td>
                        <td className="px-3 py-3">
                          <span className="font-mono text-[11px] text-primary font-semibold">{row.id}</span>
                        </td>
                        <td className="px-3 py-3">
                          <span className="text-text font-medium text-[12px] max-w-[220px] truncate block">{row.title}</span>
                        </td>
                        <td className="px-3 py-3">
                          <span className="text-text-secondary font-mono text-[10px] bg-gray-50 px-1.5 py-0.5 rounded">{row.engagement}</span>
                        </td>
                        <td className="px-3 py-3">
                          <span className="text-text-secondary font-mono text-[10px] bg-gray-50 px-1.5 py-0.5 rounded">{row.control}</span>
                        </td>
                        <td className="px-3 py-3">
                          <SeverityBadge severity={row.severity} />
                        </td>
                        <td className="px-3 py-3">
                          <StatusBadge status={row.status} />
                        </td>
                        <td className="px-3 py-3">
                          <span className="text-text-secondary text-[11px] font-medium">{row.owner}</span>
                        </td>
                        <td className="px-3 py-3">
                          <span className="text-text-secondary text-[11px]">{row.dueDate}</span>
                        </td>
                        <td className="px-3 py-3">
                          <span className={`text-[11px] font-semibold ${isOverdue ? 'text-red-600' : isClosed ? 'text-gray-400' : 'text-text-secondary'}`}>
                            {row.aging}
                          </span>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>

            {/* Expanded Row Details - rendered outside table for proper layout */}
            <AnimatePresence>
              {filtered.map(row => {
                if (expandedRow !== row.id) return null;
                return (
                  <motion.div
                    key={`detail-${row.id}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden border-b border-border-light bg-surface-2/30"
                  >
                    <div className="px-6 py-5 grid grid-cols-3 gap-6">
                      {/* Remediation Plan */}
                      <div>
                        <h4 className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-2">Remediation Plan</h4>
                        <p className="text-[12px] text-text-secondary leading-relaxed">{row.remediationPlan}</p>
                      </div>

                      {/* Timeline */}
                      <div>
                        <h4 className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-2">Timeline</h4>
                        <p className="text-[12px] text-text-secondary leading-relaxed">{row.timeline}</p>
                      </div>

                      {/* Evidence & Actions */}
                      <div>
                        <h4 className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-2">Evidence Links</h4>
                        <div className="space-y-1.5 mb-4">
                          {row.evidenceLinks.map(link => (
                            <div key={link} className="flex items-center gap-1.5 text-[11px] text-primary hover:underline cursor-pointer">
                              <ExternalLink size={10} />
                              {link}
                            </div>
                          ))}
                        </div>

                        <h4 className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-2">Actions</h4>
                        <div className="flex flex-wrap gap-2">
                          <button className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-primary/20 bg-primary/5 text-primary text-[10px] font-semibold hover:bg-primary/10 transition-all cursor-pointer">
                            <ArrowUpRight size={10} />
                            View in Engagement
                          </button>
                          <button className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-amber-200 bg-amber-50 text-amber-700 text-[10px] font-semibold hover:bg-amber-100 transition-all cursor-pointer">
                            <Bell size={10} />
                            Send Reminder
                          </button>
                          <button className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-red-200 bg-red-50 text-red-700 text-[10px] font-semibold hover:bg-red-100 transition-all cursor-pointer">
                            <AlertTriangle size={10} />
                            Escalate
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Table Footer */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-border-light bg-surface-2/30">
            <span className="text-[11px] text-text-muted">
              Showing {filtered.length} of {FINDINGS.length} findings
            </span>
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-text-muted">Page 1 of 1</span>
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
