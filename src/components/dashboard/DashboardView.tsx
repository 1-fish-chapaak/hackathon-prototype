import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlertTriangle, Shield, Activity, TrendingUp, TrendingDown,
  Plus, Settings, Maximize2, FileText, DollarSign,
  XCircle, Clock, Sparkles, RefreshCw, ChevronDown,
  ShoppingCart, CreditCard, BarChart3,
  Package, Receipt, Handshake, ShieldCheck,
  Send, X, Mail, Copy, CheckCircle2
} from 'lucide-react';
import Orb from '../shared/Orb';
import { useToast } from '../shared/Toast';

// ─── Types ──────────────────────────────────────────────────────────────────

type DashboardId = 'p2p' | 'o2c' | 's2c' | 'grc';

interface KpiDef {
  title: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down';
  icon: React.ElementType;
  color: string;
}

interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

interface BarDatum {
  label: string;
  value: number;
}

interface ProgressDatum {
  label: string;
  value: number;
  color: string;
}

interface TableRow {
  cells: string[];
}

interface DashboardDef {
  id: DashboardId;
  name: string;
  icon: React.ElementType;
  accent: string;         // tailwind gradient from
  accentHue: number;      // for Orb
  subtitle: string;
  kpis: KpiDef[];
  donut?: { title: string; segments: DonutSegment[]; centerLabel?: string };
  bars?: { title: string; data: BarDatum[]; color: string };
  progress?: { title: string; data: ProgressDatum[] };
  lineTrend?: { title: string; data: number[]; labels: string[]; color: string };
  table: { title: string; headers: string[]; rows: TableRow[] };
}

// ─── Dashboard Data ─────────────────────────────────────────────────────────

const DASHBOARDS: DashboardDef[] = [
  {
    id: 'p2p',
    name: 'Procurement (P2P)',
    icon: ShoppingCart,
    accent: 'from-blue-500 to-cyan-500',
    accentHue: 210,
    subtitle: 'Procure-to-Pay analytics',
    kpis: [
      { title: 'Invoices Processed', value: '12,450', change: '+8.2%', trend: 'up', icon: Receipt, color: 'text-blue-600 bg-blue-50' },
      { title: 'Duplicate Flags', value: 23, change: '-12%', trend: 'down', icon: AlertTriangle, color: 'text-orange-600 bg-orange-50' },
      { title: 'Avg Processing Time', value: '1.8 days', change: '-0.3d', trend: 'down', icon: Clock, color: 'text-cyan-600 bg-cyan-50' },
      { title: 'Compliance Rate', value: '94.2%', change: '+1.4%', trend: 'up', icon: Shield, color: 'text-green-600 bg-green-50' },
    ],
    donut: {
      title: 'Invoice Status',
      centerLabel: '12.4K',
      segments: [
        { label: 'Processed', value: 85, color: '#3b82f6' },
        { label: 'Pending', value: 10, color: '#f59e0b' },
        { label: 'Flagged', value: 5, color: '#ef4444' },
      ],
    },
    bars: {
      title: 'Monthly Invoice Volume',
      color: '#3b82f6',
      data: [
        { label: 'Oct', value: 1820 },
        { label: 'Nov', value: 2150 },
        { label: 'Dec', value: 1940 },
        { label: 'Jan', value: 2380 },
        { label: 'Feb', value: 2100 },
        { label: 'Mar', value: 2060 },
      ],
    },
    table: {
      title: 'Top 5 Vendors by Spend',
      headers: ['Vendor', 'Invoices', 'Total Spend', 'Status'],
      rows: [
        { cells: ['Acme Corp', '1,245', '$4.2M', 'Active'] },
        { cells: ['Global Supplies Inc', '892', '$3.8M', 'Active'] },
        { cells: ['TechParts Ltd', '634', '$2.1M', 'Review'] },
        { cells: ['Office Essentials', '521', '$1.7M', 'Active'] },
        { cells: ['FastShip Logistics', '489', '$1.4M', 'Active'] },
      ],
    },
  },
  {
    id: 'o2c',
    name: 'Order to Cash (O2C)',
    icon: CreditCard,
    accent: 'from-emerald-500 to-teal-500',
    accentHue: 160,
    subtitle: 'Revenue & collections overview',
    kpis: [
      { title: 'Orders Fulfilled', value: '8,920', change: '+5.1%', trend: 'up', icon: Package, color: 'text-emerald-600 bg-emerald-50' },
      { title: 'Revenue Recognized', value: '$42.5M', change: '+12%', trend: 'up', icon: DollarSign, color: 'text-green-600 bg-green-50' },
      { title: 'Disputed', value: 34, change: '+3', trend: 'up', icon: AlertTriangle, color: 'text-orange-600 bg-orange-50' },
      { title: 'DSO', value: '38 days', change: '-2d', trend: 'down', icon: Clock, color: 'text-teal-600 bg-teal-50' },
    ],
    donut: {
      title: 'Revenue by Region',
      centerLabel: '$42.5M',
      segments: [
        { label: 'North America', value: 45, color: '#10b981' },
        { label: 'Europe', value: 28, color: '#06b6d4' },
        { label: 'APAC', value: 18, color: '#8b5cf6' },
        { label: 'LATAM', value: 9, color: '#f59e0b' },
      ],
    },
    bars: {
      title: 'Monthly Collections ($M)',
      color: '#10b981',
      data: [
        { label: 'Oct', value: 6.2 },
        { label: 'Nov', value: 7.1 },
        { label: 'Dec', value: 5.8 },
        { label: 'Jan', value: 7.9 },
        { label: 'Feb', value: 8.3 },
        { label: 'Mar', value: 7.2 },
      ],
    },
    table: {
      title: 'Top Customers by Revenue',
      headers: ['Customer', 'Orders', 'Revenue', 'DSO'],
      rows: [
        { cells: ['Enterprise Co', '342', '$8.4M', '32d'] },
        { cells: ['MegaCorp LLC', '278', '$6.2M', '41d'] },
        { cells: ['Summit Group', '215', '$5.1M', '28d'] },
        { cells: ['Pinnacle Inc', '198', '$4.3M', '45d'] },
        { cells: ['Atlas Partners', '167', '$3.7M', '35d'] },
      ],
    },
  },
  {
    id: 's2c',
    name: 'Source to Contract (S2C)',
    icon: Handshake,
    accent: 'from-violet-500 to-purple-500',
    accentHue: 275,
    subtitle: 'Sourcing & contract management',
    kpis: [
      { title: 'Active Contracts', value: 234, change: '+18', trend: 'up', icon: FileText, color: 'text-violet-600 bg-violet-50' },
      { title: 'Expiring Soon', value: 12, change: '+4', trend: 'up', icon: Clock, color: 'text-orange-600 bg-orange-50' },
      { title: 'Vendor Score', value: '87%', change: '+2.3%', trend: 'up', icon: BarChart3, color: 'text-purple-600 bg-purple-50' },
      { title: 'Savings Realized', value: '$2.1M', change: '+$340K', trend: 'up', icon: DollarSign, color: 'text-green-600 bg-green-50' },
    ],
    bars: {
      title: 'Contract Value by Category',
      color: '#8b5cf6',
      data: [
        { label: 'IT', value: 8.2 },
        { label: 'MRO', value: 5.4 },
        { label: 'Logistics', value: 4.1 },
        { label: 'Prof. Svc', value: 3.6 },
        { label: 'Raw Mat.', value: 6.8 },
        { label: 'Facilities', value: 2.9 },
      ],
    },
    progress: {
      title: 'Vendor Compliance Scores',
      data: [
        { label: 'Acme Corp', value: 94, color: '#16a34a' },
        { label: 'Global Supplies', value: 87, color: '#8b5cf6' },
        { label: 'TechParts Ltd', value: 72, color: '#f59e0b' },
        { label: 'Office Essentials', value: 91, color: '#16a34a' },
        { label: 'FastShip', value: 65, color: '#ef4444' },
      ],
    },
    table: {
      title: 'Contracts Expiring Soon',
      headers: ['Contract', 'Vendor', 'Value', 'Expires'],
      rows: [
        { cells: ['MSA-2024-081', 'TechParts Ltd', '$1.2M', 'Apr 12'] },
        { cells: ['SOW-2024-156', 'CloudHost Inc', '$890K', 'Apr 18'] },
        { cells: ['MSA-2023-042', 'DataPipe Co', '$2.4M', 'Apr 30'] },
        { cells: ['PO-2024-923', 'PrintWorks', '$340K', 'May 05'] },
        { cells: ['SOW-2024-201', 'SecureNet', '$1.8M', 'May 14'] },
      ],
    },
  },
  {
    id: 'grc',
    name: 'GRC Overview',
    icon: ShieldCheck,
    accent: 'from-rose-500 to-pink-500',
    accentHue: 340,
    subtitle: 'Governance, risk & compliance',
    kpis: [
      { title: 'Total Risks', value: 12, change: '+2', trend: 'up', icon: AlertTriangle, color: 'text-rose-600 bg-rose-50' },
      { title: 'Controls Tested', value: '14/24', change: '+3', trend: 'up', icon: Shield, color: 'text-blue-600 bg-blue-50' },
      { title: 'Deficiencies', value: 2, change: '-1', trend: 'down', icon: XCircle, color: 'text-red-600 bg-red-50' },
      { title: 'Workflow Runs', value: 156, change: '+23', trend: 'up', icon: Activity, color: 'text-pink-600 bg-pink-50' },
    ],
    donut: {
      title: 'Risk Severity Distribution',
      centerLabel: '12',
      segments: [
        { label: 'Critical', value: 2, color: '#dc2626' },
        { label: 'High', value: 5, color: '#ea580c' },
        { label: 'Medium', value: 3, color: '#d97706' },
        { label: 'Low', value: 2, color: '#16a34a' },
      ],
    },
    bars: {
      title: 'Control Effectiveness',
      color: '#e11d48',
      data: [
        { label: 'Access', value: 92 },
        { label: 'Change', value: 85 },
        { label: 'SOD', value: 78 },
        { label: 'Recon', value: 95 },
        { label: 'Report', value: 88 },
        { label: 'Auth', value: 70 },
      ],
    },
    progress: {
      title: 'Audit Completion',
      data: [
        { label: 'SOX FY26', value: 58, color: '#e11d48' },
        { label: 'Internal Audit Q1', value: 82, color: '#16a34a' },
        { label: 'Vendor Audit', value: 35, color: '#f59e0b' },
      ],
    },
    table: {
      title: 'Recent Risk Items',
      headers: ['Risk', 'Severity', 'Owner', 'Status'],
      rows: [
        { cells: ['SOD Violation - AP', 'Critical', 'J. Martinez', 'Open'] },
        { cells: ['Unmatched 3-Way', 'High', 'S. Chen', 'In Review'] },
        { cells: ['Late Reconciliation', 'High', 'A. Patel', 'Mitigating'] },
        { cells: ['Access Creep - GL', 'Medium', 'R. Kim', 'Open'] },
        { cells: ['Manual Journal Entries', 'Medium', 'L. Wong', 'Monitoring'] },
      ],
    },
  },
];

// ─── Daily Digest Data ───────────────────────────────────────────────────────

const DAILY_DIGESTS: Record<DashboardId, Array<{ type: 'change' | 'alert' | 'improvement' | 'new'; text: string; time: string }>> = {
  p2p: [
    { type: 'alert', text: '3 new duplicate invoice flags detected overnight — Acme Corp (2), Global Supplies (1)', time: '6h ago' },
    { type: 'change', text: 'Compliance rate improved from 93.1% to 94.2% after vendor master cleanup', time: '12h ago' },
    { type: 'improvement', text: 'Average processing time dropped to 1.8 days (was 2.1 days last week)', time: '1d ago' },
    { type: 'new', text: 'New vendor "Atlas Manufacturing" onboarded — pending KYC verification', time: '1d ago' },
  ],
  o2c: [
    { type: 'alert', text: '2 high-value invoices ($180K+) pending approval beyond SLA', time: '3h ago' },
    { type: 'change', text: 'DSO improved from 42 to 38 days after collection drive', time: '8h ago' },
    { type: 'improvement', text: 'Disputed orders down 15% vs last month', time: '1d ago' },
    { type: 'new', text: 'Revenue recognition check flagged 1 timing discrepancy in Q4 entries', time: '2d ago' },
  ],
  s2c: [
    { type: 'alert', text: '4 contracts expiring within 30 days — 2 are high-value (>$500K)', time: '4h ago' },
    { type: 'change', text: 'Vendor risk scores updated — 3 vendors downgraded to Medium', time: '1d ago' },
    { type: 'improvement', text: 'Cost savings tracking: $2.8M realized YTD vs $2.4M target', time: '1d ago' },
    { type: 'new', text: 'New compliance clause added to template contracts per legal directive', time: '3d ago' },
  ],
  grc: [
    { type: 'alert', text: 'DEF-002 remediation due in 6 days — currently "in progress" status', time: '2h ago' },
    { type: 'change', text: '3 controls tested since yesterday — SOX progress now at 58%', time: '6h ago' },
    { type: 'improvement', text: 'Workflow automation saved 45 person-hours this month', time: '1d ago' },
    { type: 'new', text: 'New risk RSK-012 identified in R2R process — GL balance discrepancy', time: '2d ago' },
  ],
};

// ─── AI Summaries for each dashboard ────────────────────────────────────────

const DASHBOARD_SUMMARIES: Record<DashboardId, string> = {
  p2p: "P2P saw 3 new duplicate flags overnight (Acme Corp & Global Supplies), but compliance rate improved to 94.2% after vendor master cleanup. Processing time is trending down to 1.8 days. One new vendor (Atlas Manufacturing) is pending KYC — recommend expediting before next payment batch.",
  o2c: "2 high-value invoices ($180K+) exceeded SLA for approval — escalation needed. DSO improved to 38 days after collection drive. Revenue recognition check flagged a Q4 timing discrepancy that needs review before close. Disputed orders down 15% — positive trend continuing.",
  s2c: "4 contracts expiring within 30 days, 2 are high-value (>$500K) — renegotiation must start this week. Cost savings are tracking ahead at $2.8M vs $2.4M target. 3 vendors downgraded to Medium risk after score refresh. Legal added new compliance clause to templates.",
  grc: "Material weakness DEF-002 is 6 days from deadline — remediation evidence pending. SOX progress moved to 58% after 3 controls tested yesterday. Workflow automation saved 45 person-hours this month. New risk RSK-012 identified in R2R — GL balance discrepancy across subsidiaries.",
};

const SHARE_EMAIL_TEMPLATES: Record<DashboardId, { subject: string; body: string }> = {
  p2p: {
    subject: 'P2P Audit Alert Summary — Action Required',
    body: `Hi Team,\n\nHere's today's P2P audit summary from Auditify Copilot:\n\n🔴 ALERTS\n• 3 new duplicate invoice flags detected overnight — Acme Corp (2), Global Supplies (1)\n• New vendor "Atlas Manufacturing" onboarded — KYC verification pending\n\n✅ IMPROVEMENTS\n• Compliance rate improved from 93.1% → 94.2%\n• Avg processing time dropped to 1.8 days (was 2.1 days)\n\n📊 KEY METRICS\n• Invoices processed: 12,450 (+8.2%)\n• Duplicate flags: 23 (-12%)\n• Compliance rate: 94.2% (+1.4%)\n\n⚡ RECOMMENDED ACTIONS\n1. Review & assign the 3 new duplicate flags before payment batch\n2. Expedite KYC verification for Atlas Manufacturing\n3. Continue vendor master data cleanup — showing strong results\n\nGenerated by Auditify Copilot — AI-Powered Internal Audit Platform`,
  },
  o2c: {
    subject: 'O2C Audit Alert Summary — 2 SLA Breaches',
    body: `Hi Team,\n\nHere's today's O2C audit summary from Auditify Copilot:\n\n🔴 ALERTS\n• 2 high-value invoices ($180K+) pending approval beyond SLA\n• Revenue recognition timing discrepancy flagged in Q4 entries\n\n✅ IMPROVEMENTS\n• DSO improved from 42 → 38 days\n• Disputed orders down 15% vs last month\n\n⚡ RECOMMENDED ACTIONS\n1. Escalate the 2 SLA-breached invoices immediately\n2. Review the Q4 revenue timing discrepancy before period close\n3. Continue collection drive momentum\n\nGenerated by Auditify Copilot`,
  },
  s2c: {
    subject: 'S2C Alert — 4 Contracts Expiring Within 30 Days',
    body: `Hi Team,\n\nHere's today's S2C audit summary from Auditify Copilot:\n\n🔴 ALERTS\n• 4 contracts expiring within 30 days — 2 high-value (>$500K)\n• 3 vendors downgraded to Medium risk\n\n✅ IMPROVEMENTS\n• Cost savings: $2.8M realized vs $2.4M target (117%)\n• New compliance clause added to contract templates\n\n⚡ RECOMMENDED ACTIONS\n1. Start renegotiation on the 2 high-value expiring contracts this week\n2. Review the 3 downgraded vendors' risk mitigation plans\n\nGenerated by Auditify Copilot`,
  },
  grc: {
    subject: 'GRC Alert — DEF-002 Remediation Due in 6 Days',
    body: `Hi Team,\n\nHere's today's GRC audit summary from Auditify Copilot:\n\n🔴 CRITICAL\n• Material weakness DEF-002 remediation due in 6 days\n• New risk RSK-012 identified — GL balance discrepancy\n\n📊 PROGRESS\n• SOX audit progress: 58% (14/24 controls tested)\n• 3 controls tested since yesterday\n• Workflow automation saved 45 person-hours this month\n\n⚡ RECOMMENDED ACTIONS\n1. Escalate DEF-002 to ensure Mar 31 deadline is met\n2. Assign controls for RSK-012 in R2R process\n3. Prioritize remaining 10 untested controls\n\nGenerated by Auditify Copilot`,
  },
};

// ─── Alerts Panel Component ─────────────────────────────────────────────────

function AlertsPanel({ dashboardId }: { dashboardId: DashboardId }) {
  const { addToast } = useToast();
  const [expanded, setExpanded] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [emailGenerating, setEmailGenerating] = useState(false);
  const [emailGenerated, setEmailGenerated] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);
  const [recipient, setRecipient] = useState('');
  const items = DAILY_DIGESTS[dashboardId];
  const summary = DASHBOARD_SUMMARIES[dashboardId];
  const alertCount = items.filter(i => i.type === 'alert').length;

  const typeIcons = { change: RefreshCw, alert: AlertTriangle, improvement: TrendingUp, new: Plus };
  const typeColors = {
    change: 'text-blue-600 bg-blue-50',
    alert: 'text-orange-600 bg-orange-50',
    improvement: 'text-green-600 bg-green-50',
    new: 'text-purple-600 bg-purple-50'
  };

  const handleShareClick = () => {
    setShowShareModal(true);
    setEmailGenerated(false);
    setEmailGenerating(false);
    setEmailCopied(false);
    setRecipient('');
  };

  const handleGenerateEmail = () => {
    setEmailGenerating(true);
    setTimeout(() => {
      setEmailGenerating(false);
      setEmailGenerated(true);
    }, 2000);
  };

  const handleSendEmail = () => {
    setShowShareModal(false);
    addToast({ message: `Alert summary sent to ${recipient || 'team'}`, type: 'success' });
  };

  const handleCopyEmail = () => {
    setEmailCopied(true);
    addToast({ message: 'Email content copied to clipboard', type: 'success' });
    setTimeout(() => setEmailCopied(false), 2000);
  };

  const emailTemplate = SHARE_EMAIL_TEMPLATES[dashboardId];

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl mb-5 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border-light/50">
          <button onClick={() => setExpanded(p => !p)} className="flex items-center gap-2 cursor-pointer">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary to-primary-medium">
              <Sparkles size={13} className="text-white" />
            </div>
            <span className="text-[13px] font-semibold text-text">Alerts & Daily Digest</span>
            {alertCount > 0 && <span className="text-[12px] bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-bold">{alertCount} alert{alertCount > 1 ? 's' : ''}</span>}
            <span className="text-[12px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">AI Summary</span>
            <ChevronDown size={14} className={`text-text-muted transition-transform ${expanded ? '' : '-rotate-90'}`} />
          </button>
          <button onClick={handleShareClick} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-primary bg-primary/10 hover:bg-primary/20 transition-colors cursor-pointer">
            <Send size={11} /> Share with Team
          </button>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
              {/* AI Summary */}
              <div className="px-5 pt-4 pb-3">
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-primary-xlight/60 via-white to-primary-xlight/40 border border-primary/10">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Sparkles size={11} className="text-primary" />
                    <span className="text-[12px] font-bold text-primary uppercaser">AI Summary</span>
                  </div>
                  <p className="text-[12px] text-text leading-relaxed">{summary}</p>
                </div>
              </div>

              {/* Alert items */}
              <div className="px-5 pb-4 space-y-2">
                {items.map((item, i) => {
                  const Icon = typeIcons[item.type];
                  const color = typeColors[item.type];
                  return (
                    <motion.div key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                      className={`flex items-start gap-2.5 p-2.5 rounded-xl transition-colors ${item.type === 'alert' ? 'bg-orange-50/50 border border-high/50' : 'hover:bg-surface-2'}`}>
                      <div className={`p-1.5 rounded-lg shrink-0 ${color}`}><Icon size={12} /></div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] text-text leading-relaxed">{item.text}</div>
                        <div className="text-[12px] text-text-muted mt-0.5">{item.time}</div>
                      </div>
                      {item.type === 'alert' && (
                        <span className="text-[12px] font-bold text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded-full shrink-0">Action needed</span>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Share Email Modal */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowShareModal(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-2xl shadow-2xl w-[560px] max-h-[85vh] overflow-hidden flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="px-5 py-4 border-b border-border-light flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-primary/10 text-primary rounded-xl"><Mail size={16} /></div>
                  <div>
                    <h3 className="text-[15px] font-semibold text-text">Share Alert Summary</h3>
                    <p className="text-[12px] text-text-muted">AI-generated email ready to send</p>
                  </div>
                </div>
                <button onClick={() => setShowShareModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                  <X size={16} className="text-text-muted" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {/* Recipient */}
                <div>
                  <label className="text-[12px] font-semibold text-text-muted uppercaser block mb-1.5">Send to</label>
                  <input
                    value={recipient}
                    onChange={e => setRecipient(e.target.value)}
                    placeholder="e.g., karan.mehta@company.com, sneha.desai@company.com"
                    className="w-full px-3 py-2.5 rounded-xl border border-border-light text-[13px] text-text focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
                  />
                </div>

                {/* Generate button */}
                {!emailGenerated && !emailGenerating && (
                  <button onClick={handleGenerateEmail}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-brand-600 hover:bg-brand-500 active:bg-brand-800 text-white rounded-lg text-[13px] font-semibold transition-all cursor-pointer">
                    <Sparkles size={15} /> Generate AI Email
                  </button>
                )}

                {/* Generating animation */}
                {emailGenerating && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 text-center">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }} className="inline-block mb-3">
                      <Sparkles size={24} className="text-primary" />
                    </motion.div>
                    <div className="text-[13px] font-medium text-text mb-1">Generating email content...</div>
                    <div className="text-[12px] text-text-muted">Summarizing alerts, metrics, and recommended actions</div>
                    {/* Progress bar */}
                    <div className="mt-3 h-1.5 bg-surface-3 rounded-full overflow-hidden max-w-xs mx-auto">
                      <motion.div initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: 2, ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-primary to-primary-medium rounded-full" />
                    </div>
                  </motion.div>
                )}

                {/* Generated email preview */}
                {emailGenerated && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-[12px] font-semibold text-text-muted uppercaser">Generated Email</label>
                      <button onClick={handleCopyEmail} className="flex items-center gap-1 text-[12px] font-medium text-primary hover:underline cursor-pointer">
                        {emailCopied ? <><CheckCircle2 size={10} /> Copied!</> : <><Copy size={10} /> Copy</>}
                      </button>
                    </div>
                    {/* Subject */}
                    <div className="px-3 py-2 bg-surface-2 rounded-t-xl border border-border-light border-b-0">
                      <span className="text-[12px] text-text-muted font-medium">Subject: </span>
                      <span className="text-[12px] font-semibold text-text">{emailTemplate.subject}</span>
                    </div>
                    {/* Body */}
                    <div className="px-4 py-3 bg-white rounded-b-xl border border-border-light max-h-[250px] overflow-y-auto">
                      <pre className="text-[12px] text-text leading-relaxed whitespace-pre-wrap font-sans">{emailTemplate.body}</pre>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Modal Footer */}
              {emailGenerated && (
                <div className="px-5 py-4 border-t border-border-light flex items-center justify-between shrink-0">
                  <button onClick={() => { setEmailGenerated(false); setEmailGenerating(false); }}
                    className="px-4 py-2 text-[12px] font-medium text-text-secondary hover:bg-surface-2 rounded-lg transition-colors cursor-pointer">
                    Regenerate
                  </button>
                  <button onClick={handleSendEmail}
                    className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-500 active:bg-brand-800 text-white rounded-lg text-[13px] font-semibold transition-all cursor-pointer">
                    <Send size={13} /> Send Email
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="flex h-full animate-pulse">
      <div className="w-[200px] shrink-0 p-4 space-y-3">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-10 skeleton skeleton-card rounded-lg" />)}
      </div>
      <div className="flex-1 px-8 py-8">
        <div className="h-6 w-48 skeleton skeleton-title mb-2" />
        <div className="h-4 w-64 skeleton skeleton-text mb-6" />
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-24 skeleton skeleton-card" />)}
        </div>
        <div className="grid grid-cols-2 gap-4 mb-6">
          {[1, 2].map(i => <div key={i} className="h-56 skeleton skeleton-card" />)}
        </div>
        <div className="h-48 skeleton skeleton-card" />
      </div>
    </div>
  );
}

// ─── Donut Chart ─────────────────────────────────────────────────────────────

function DonutChart({ title, segments, centerLabel, onExpand }: { title: string; segments: DonutSegment[]; centerLabel?: string; onExpand?: () => void }) {
  const total = segments.reduce((a, s) => a + s.value, 0);
  let offset = 0;
  const arcs = segments.map(s => {
    const pct = (s.value / total) * 100;
    const dashArray = `${pct * 2.51327} ${251.327 - pct * 2.51327}`;
    const dashOffset = -offset * 2.51327;
    offset += pct;
    return { ...s, pct, dashArray, dashOffset };
  });

  return (
    <div className="glass-card rounded-xl p-5 transition-all duration-150 group">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-text">{title}</h3>
        <button onClick={onExpand} className="p-1.5 rounded-md hover:bg-gray-50 transition-colors cursor-pointer">
          <Maximize2 size={12} className="text-text-muted hover:text-text-secondary" />
        </button>
      </div>
      <div className="flex items-center gap-6">
        <div className="relative shrink-0">
          <svg width="110" height="110" viewBox="0 0 100 100">
            {arcs.map(s => (
              <motion.circle
                key={s.label}
                cx="50" cy="50" r="40"
                fill="none"
                stroke={s.color}
                strokeWidth="10"
                strokeDasharray={s.dashArray}
                strokeDashoffset={s.dashOffset}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              />
            ))}
            {centerLabel && (
              <>
                <text x="50" y="48" textAnchor="middle" className="fill-text font-bold" fontSize="16">{centerLabel}</text>
                <text x="50" y="62" textAnchor="middle" className="fill-text-muted" fontSize="9">Total</text>
              </>
            )}
          </svg>
        </div>
        <div className="space-y-2 flex-1 min-w-0">
          {segments.map(s => (
            <div key={s.label} className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
                <span className="text-[12px] text-text-secondary truncate">{s.label}</span>
              </div>
              <span className="text-[12px] font-semibold text-text shrink-0 ml-2">
                {total > 100 ? s.value : `${s.value}%`}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Bar Chart ───────────────────────────────────────────────────────────────

function BarChart({ title, data, color, onExpand }: { title: string; data: BarDatum[]; color: string; onExpand?: () => void }) {
  const max = Math.max(...data.map(d => d.value));

  return (
    <div className="glass-card rounded-xl p-5 transition-all duration-150 group">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-text">{title}</h3>
        <button onClick={onExpand} className="p-1.5 rounded-md hover:bg-gray-50 transition-colors cursor-pointer">
          <Maximize2 size={12} className="text-text-muted hover:text-text-secondary" />
        </button>
      </div>
      <div className="flex items-end gap-2 h-36">
        {data.map((d, i) => {
          const height = (d.value / max) * 100;
          return (
            <div key={d.label} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[12px] text-text-muted font-medium">
                {typeof d.value === 'number' && d.value >= 1000
                  ? `${(d.value / 1000).toFixed(1)}K`
                  : d.value}
              </span>
              <motion.div
                className="w-full rounded-t-md min-h-[4px]"
                style={{ background: color }}
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ duration: 0.5, delay: i * 0.06, ease: 'easeOut' }}
              />
              <span className="text-[12px] text-text-muted">{d.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Progress Bars ───────────────────────────────────────────────────────────

function ProgressChart({ title, data, onExpand }: { title: string; data: ProgressDatum[]; onExpand?: () => void }) {
  return (
    <div className="glass-card rounded-xl p-5 transition-all duration-150 group">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-text">{title}</h3>
        <button onClick={onExpand} className="p-1.5 rounded-md hover:bg-gray-50 transition-colors cursor-pointer">
          <Maximize2 size={12} className="text-text-muted hover:text-text-secondary" />
        </button>
      </div>
      <div className="space-y-3">
        {data.map((d, i) => (
          <div key={d.label}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[12px] text-text-secondary">{d.label}</span>
              <span className="text-[12px] font-semibold text-text">{d.value}%</span>
            </div>
            <div className="h-2 bg-surface-3 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${d.value}%` }}
                transition={{ duration: 0.6, delay: 0.15 + i * 0.08 }}
                className="h-full rounded-full"
                style={{ background: d.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Mini Table ──────────────────────────────────────────────────────────────

function MiniTable({ title, headers, rows }: { title: string; headers: string[]; rows: TableRow[] }) {
  return (
    <div className="glass-card rounded-xl p-5 transition-all duration-150 group">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-text">{title}</h3>
        <button className="text-[12px] text-primary font-medium hover:underline cursor-pointer">View all</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border">
              {headers.map(h => (
                <th key={h} className="text-[12px] text-text-muted uppercaser font-medium pb-2 pr-4">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <motion.tr
                key={i}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.04 }}
                className="border-b border-border/50 last:border-0 hover:bg-primary-xlight/50 transition-colors cursor-pointer"
              >
                {row.cells.map((cell, j) => (
                  <td key={j} className={`text-[12.5px] py-2.5 pr-4 ${j === 0 ? 'font-medium text-text' : 'text-text-secondary'}`}>
                    {cell}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────

function Sidebar({ dashboards, activeId, onSelect }: {
  dashboards: DashboardDef[];
  activeId: DashboardId;
  onSelect: (id: DashboardId) => void;
}) {
  return (
    <div className="w-[200px] shrink-0 border-r border-border bg-surface-1/50 overflow-y-auto flex flex-col">
      <div className="px-4 pt-5 pb-3">
        <div className="text-[12px] text-text-muted uppercasest font-semibold">Dashboards</div>
      </div>
      <nav className="flex-1 px-2 pb-4 space-y-1">
        {dashboards.map(d => {
          const isActive = d.id === activeId;
          return (
            <button
              key={d.id}
              onClick={() => onSelect(d.id)}
              className={`
                w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-[13px] font-medium active:scale-[0.97] transition-all duration-200 cursor-pointer
                ${isActive
                  ? 'bg-primary/10 text-primary shadow-sm'
                  : 'text-text-secondary hover:bg-surface-2 hover:text-text'
                }
              `}
            >
              <d.icon size={15} className={isActive ? 'text-primary' : 'text-text-muted'} />
              <span className="truncate">{d.name}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

interface DashboardProps {
  onImportPowerBI?: () => void;
  onShare?: () => void;
}

export default function DashboardView({ onImportPowerBI, onShare }: DashboardProps = {}) {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<DashboardId>('p2p');

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const handleSelect = useCallback((id: DashboardId) => {
    setActiveId(id);
  }, []);

  if (loading) return <DashboardSkeleton />;

  const dashboard = DASHBOARDS.find(d => d.id === activeId)!;

  return (
    <div className="h-full flex bg-canvas relative overflow-hidden">
      <Orb hoverIntensity={0.09} rotateOnHover hue={dashboard.accentHue} opacity={0.08} />

      {/* Sidebar */}
      <Sidebar dashboards={DASHBOARDS} activeId={activeId} onSelect={handleSelect} />

      {/* Main content */}
      <div className="flex-1 overflow-y-auto relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={dashboard.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="px-10 py-8"
          >
            {/* Page header — Editorial: breadcrumb · serif title · context · actions */}
            <div className="mb-6">
              <div className="font-mono text-[12px] text-ink-500 mb-2">Dashboards · {dashboard.name}</div>
              <div className="flex items-end justify-between">
                <div>
                  <h1 className="font-display text-[34px] font-[420] text-ink-900 leading-[1.15]">{dashboard.name}</h1>
                  <p className="text-[13px] text-ink-500 mt-1">{dashboard.subtitle}</p>
                </div>
                <div className="flex items-center gap-2">
                  {onImportPowerBI && (
                    <button onClick={onImportPowerBI} className="flex items-center gap-2 px-3 h-10 border border-canvas-border bg-canvas-elevated rounded-md text-[13px] text-ink-700 hover:border-brand-200 transition-colors cursor-pointer">
                      <Maximize2 size={14} />
                      Import from Power BI
                    </button>
                  )}
                  {onShare && (
                    <button onClick={onShare} className="flex items-center gap-2 px-3 h-10 border border-canvas-border bg-canvas-elevated rounded-md text-[13px] text-ink-700 hover:border-brand-200 transition-colors cursor-pointer">
                      <Settings size={14} />
                      Share
                    </button>
                  )}
                  <button onClick={() => addToast({ message: 'Dashboard customization panel opening.', type: 'info' })} className="flex items-center gap-2 px-3 h-10 border border-canvas-border bg-canvas-elevated rounded-md text-[13px] text-ink-700 hover:border-brand-200 transition-colors cursor-pointer">
                    <Settings size={14} />
                    Customize
                  </button>
                  <button onClick={() => addToast({ message: 'Widget picker opening.', type: 'info' })} className="flex items-center gap-2 px-4 h-10 bg-brand-600 hover:bg-brand-500 active:bg-brand-800 text-white rounded-md text-[13px] font-semibold transition-colors cursor-pointer">
                    <Plus size={14} />
                    Add widget
                  </button>
                </div>
              </div>
            </div>

            {/* AI Insight — editorial prose surface */}
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-canvas-elevated rounded-xl border border-brand-200 p-5 mb-6"
            >
              <div className="font-mono text-[12px] text-ink-500 mb-2 tabular-nums">IRA · insight · {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
              <div className="flex-1">
                <div className="text-[15px] leading-[1.6] text-ink-800 max-w-[66ch]">
                  {dashboard.id === 'p2p' && '23 potential duplicate invoices detected this month. 3 vendors show spend anomalies exceeding 2-sigma threshold.'}
                  {dashboard.id === 'o2c' && 'DSO improved by 2 days. 5 customers account for 65% of outstanding receivables. Dispute rate trending upward in APAC region.'}
                  {dashboard.id === 's2c' && '12 contracts expire within 30 days. Vendor TechParts Ltd compliance score dropped below 75% threshold.'}
                  {dashboard.id === 'grc' && '2 critical risks in P2P have zero controls mapped. SOD violation detected in AP module.'}
                  <a className="text-brand-700 font-semibold cursor-pointer hover:underline ml-1">Take action.</a>
                </div>
              </div>
            </motion.div>

            {/* AI Daily Digest */}
            <AlertsPanel dashboardId={activeId} />

            {/* KPIs — Colorful Bento Grid */}
            {(() => {
              const COMPLIANCE_DATA = [88, 89, 87, 90, 91, 89, 92, 91, 93, 92, 94, 94.2];
              const compMax = Math.max(...COMPLIANCE_DATA);
              const compMin = Math.min(...COMPLIANCE_DATA);
              const RISK_BARS = [45, 52, 48, 55, 50, 60, 65];
              const riskMax = Math.max(...RISK_BARS);
              const SAVINGS_BARS = [8, 12, 10, 15, 18, 20, 24];
              const savMax = Math.max(...SAVINGS_BARS);
              return (
                <div className="grid grid-cols-12 grid-rows-2 gap-3 mb-6" style={{ gridAutoRows: 'minmax(0, 1fr)' }}>
                  {/* ── FY26 Compliance Score — spans left 5 cols, 2 rows ── */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="col-span-5 row-span-2 rounded-2xl p-6 flex flex-col justify-between cursor-default border border-canvas-border bg-white relative overflow-hidden"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[12px] font-semibold text-brand-600">FY26</span>
                        <div className="flex items-center gap-1 text-[12px] font-semibold text-emerald-600">
                          <TrendingUp size={11} />
                          +12.4%
                        </div>
                      </div>
                      <div className="text-[48px] font-extrabold leading-none text-text">94.2%</div>
                      <p className="text-[13px] text-text-muted mt-2 leading-relaxed max-w-[280px]">
                        Compliance score driven by automated controls and continuous monitoring across 4 business processes.
                      </p>
                    </div>
                    {/* Purple area chart */}
                    <svg width="100%" height="120" viewBox="0 0 240 120" preserveAspectRatio="none" className="mt-4">
                      <defs>
                        <linearGradient id="compFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#8838DE" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#8838DE" stopOpacity="0.02" />
                        </linearGradient>
                      </defs>
                      <polyline
                        points={`0,120 ${COMPLIANCE_DATA.map((v, j) => `${j * (240 / (COMPLIANCE_DATA.length - 1))},${120 - ((v - compMin) / (compMax - compMin)) * 100}`).join(' ')} 240,120`}
                        fill="url(#compFill)" stroke="none"
                      />
                      <polyline
                        points={COMPLIANCE_DATA.map((v, j) => `${j * (240 / (COMPLIANCE_DATA.length - 1))},${120 - ((v - compMin) / (compMax - compMin)) * 100}`).join(' ')}
                        fill="none" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                      />
                    </svg>
                  </motion.div>

                  {/* ── Money at Risk — top middle ── */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                    className="col-span-4 rounded-2xl p-5 flex flex-col justify-between cursor-default border"
                    style={{ background: '#FFF9EB', borderColor: '#F5E6C0' }}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: '#F59E0B' }}>
                          <DollarSign size={13} className="text-white" />
                        </div>
                        <span className="text-[12px] font-semibold" style={{ color: '#92400E' }}>Money at Risk</span>
                      </div>
                      <div className="text-[32px] font-extrabold leading-none" style={{ color: '#1C1917' }}>{'\u20B9'}6.16L</div>
                      <div className="flex items-center gap-1.5 mt-2 text-[12px] font-semibold text-red-600">
                        <TrendingDown size={10} />
                        -{'\u20B9'}2.1L <span className="text-text-muted font-normal">vs last quarter</span>
                      </div>
                    </div>
                    {/* Mini bar chart */}
                    <div className="flex items-end gap-1.5 h-7 mt-3">
                      {RISK_BARS.map((v, j) => (
                        <motion.div key={j} initial={{ height: 0 }} animate={{ height: `${(v / riskMax) * 100}%` }} transition={{ delay: 0.25 + j * 0.04, duration: 0.3 }}
                          className="flex-1 rounded-sm min-h-[3px]" style={{ background: j >= RISK_BARS.length - 1 ? '#7C3AED' : 'rgba(124,58,237,0.2)' }} />
                      ))}
                    </div>
                  </motion.div>

                  {/* ── SOX Deadline — top right ── */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className="col-span-3 rounded-2xl p-5 flex flex-col justify-between cursor-default border"
                    style={{ background: '#F3EAFF', borderColor: '#DBC4F7' }}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: '#8838DE' }}>
                          <Clock size={13} className="text-white" />
                        </div>
                        <span className="text-[12px] font-semibold text-brand-700">SOX Deadline</span>
                      </div>
                      <div className="text-[40px] font-extrabold leading-none text-brand-700">6</div>
                      <div className="text-[13px] font-semibold text-brand-600 mt-1">Days remaining</div>
                    </div>
                    {/* Dot grid */}
                    <div className="grid grid-cols-6 gap-1.5 mt-3">
                      {Array.from({ length: 24 }).map((_, j) => (
                        <div key={j} className="w-2 h-2 rounded-full" style={{ background: j < 18 ? '#A366F0' : 'rgba(163,102,240,0.2)' }} />
                      ))}
                    </div>
                  </motion.div>

                  {/* ── Open Exceptions — bottom middle ── */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                    className="col-span-4 rounded-2xl p-5 flex flex-col justify-between cursor-default border"
                    style={{ background: '#FFF9EB', borderColor: '#F5E6C0' }}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: '#EF4444' }}>
                          <AlertTriangle size={13} className="text-white" />
                        </div>
                        <span className="text-[12px] font-semibold" style={{ color: '#92400E' }}>Open Exceptions</span>
                        <span className="ml-auto text-[12px] text-text-muted font-medium">This week</span>
                      </div>
                      <div className="text-[40px] font-extrabold leading-none" style={{ color: '#1C1917' }}>7</div>
                      <div className="text-[12px] text-text-muted mt-1.5">3 unassigned, 4 in progress</div>
                    </div>
                    <div className="flex items-center gap-1.5 mt-2 text-[12px] font-semibold text-red-600">
                      <TrendingUp size={10} />
                      +2 <span className="text-text-muted font-normal">this week</span>
                    </div>
                  </motion.div>

                  {/* ── Savings YTD — bottom right ── */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="col-span-3 rounded-2xl p-5 flex flex-col justify-between cursor-default border"
                    style={{ background: '#ECFDF5', borderColor: '#A7F3D0' }}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: '#16A34A' }}>
                          <Activity size={13} className="text-white" />
                        </div>
                        <span className="text-[12px] font-semibold text-emerald-700">Savings YTD</span>
                      </div>
                      <div className="text-[36px] font-extrabold leading-none text-emerald-700">{'\u20B9'}24L</div>
                      <div className="text-[12px] text-emerald-600/70 mt-1.5">Cost avoided via AI workflows</div>
                    </div>
                    {/* Green bar chart */}
                    <div className="flex items-end gap-1.5 h-8 mt-2">
                      {SAVINGS_BARS.map((v, j) => (
                        <motion.div key={j} initial={{ height: 0 }} animate={{ height: `${(v / savMax) * 100}%` }} transition={{ delay: 0.35 + j * 0.04, duration: 0.3 }}
                          className="flex-1 rounded-sm min-h-[3px]" style={{ background: j >= SAVINGS_BARS.length - 2 ? '#16A34A' : 'rgba(22,163,74,0.18)' }} />
                      ))}
                    </div>
                  </motion.div>
                </div>
              );
            })()}

            {/* Charts row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className={`grid gap-4 mb-6 ${
                dashboard.donut && dashboard.bars && dashboard.progress
                  ? 'grid-cols-3'
                  : dashboard.donut && dashboard.bars
                    ? 'grid-cols-2'
                    : dashboard.bars && dashboard.progress
                      ? 'grid-cols-2'
                      : 'grid-cols-1'
              }`}
            >
              {dashboard.donut && (
                <DonutChart
                  title={dashboard.donut.title}
                  segments={dashboard.donut.segments}
                  centerLabel={dashboard.donut.centerLabel}
                  onExpand={() => addToast({ message: 'Chart expanded to fullscreen', type: 'info' })}
                />
              )}
              {dashboard.bars && (
                <BarChart
                  title={dashboard.bars.title}
                  data={dashboard.bars.data}
                  color={dashboard.bars.color}
                  onExpand={() => addToast({ message: 'Chart expanded to fullscreen', type: 'info' })}
                />
              )}
              {dashboard.progress && (
                <ProgressChart
                  title={dashboard.progress.title}
                  data={dashboard.progress.data}
                  onExpand={() => addToast({ message: 'Chart expanded to fullscreen', type: 'info' })}
                />
              )}
            </motion.div>

            {/* Table */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
            >
              <MiniTable
                title={dashboard.table.title}
                headers={dashboard.table.headers}
                rows={dashboard.table.rows}
              />
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
