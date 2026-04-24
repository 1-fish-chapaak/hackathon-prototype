import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlertTriangle, Shield, Activity, TrendingUp, TrendingDown,
  Plus, Settings, Maximize2, FileText, DollarSign,
  XCircle, Clock, Sparkles, RefreshCw, ChevronDown,
  ShoppingCart, CreditCard, BarChart3,
  Package, Receipt, Handshake, ShieldCheck,
  Send, X, Mail, Copy, CheckCircle2, ArrowLeft,
  Download, Filter, Share2, Loader2,
  MoreVertical, Edit, Trash2, ChevronUp, Eye, EyeOff,
  Search, LineChart, AreaChart, ListChecks
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
      { title: 'Invoices Processed', value: '12,450', change: '+8.2%', trend: 'up', icon: Receipt, color: 'text-evidence-700 bg-evidence-50' },
      { title: 'Duplicate Flags', value: 23, change: '-12%', trend: 'down', icon: AlertTriangle, color: 'text-high-700 bg-high-50' },
      { title: 'Avg Processing Time', value: '1.8 days', change: '-0.3d', trend: 'down', icon: Clock, color: 'text-cyan-600 bg-cyan-50' },
      { title: 'Compliance Rate', value: '94.2%', change: '+1.4%', trend: 'up', icon: Shield, color: 'text-compliant bg-compliant-50' },
    ],
    donut: {
      title: 'Invoice Status',
      centerLabel: '12.4K',
      segments: [
        { label: 'Processed', value: 85, color: 'var(--color-evidence)' },
        { label: 'Pending', value: 10, color: 'var(--color-mitigated)' },
        { label: 'Flagged', value: 5, color: 'var(--color-risk)' },
      ],
    },
    bars: {
      title: 'Monthly Invoice Volume',
      color: 'var(--color-evidence)',
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
      { title: 'Orders Fulfilled', value: '8,920', change: '+5.1%', trend: 'up', icon: Package, color: 'text-compliant bg-compliant-50' },
      { title: 'Revenue Recognized', value: '$42.5M', change: '+12%', trend: 'up', icon: DollarSign, color: 'text-compliant bg-compliant-50' },
      { title: 'Disputed', value: 34, change: '+3', trend: 'up', icon: AlertTriangle, color: 'text-high-700 bg-high-50' },
      { title: 'DSO', value: '38 days', change: '-2d', trend: 'down', icon: Clock, color: 'text-teal-600 bg-teal-50' },
    ],
    donut: {
      title: 'Revenue by Region',
      centerLabel: '$42.5M',
      segments: [
        { label: 'North America', value: 45, color: 'var(--color-compliant)' },
        { label: 'Europe', value: 28, color: 'var(--color-evidence)' },
        { label: 'APAC', value: 18, color: 'var(--color-brand-500)' },
        { label: 'LATAM', value: 9, color: 'var(--color-mitigated)' },
      ],
    },
    bars: {
      title: 'Monthly Collections ($M)',
      color: 'var(--color-compliant)',
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
      { title: 'Expiring Soon', value: 12, change: '+4', trend: 'up', icon: Clock, color: 'text-high-700 bg-high-50' },
      { title: 'Vendor Score', value: '87%', change: '+2.3%', trend: 'up', icon: BarChart3, color: 'text-purple-600 bg-purple-50' },
      { title: 'Savings Realized', value: '$2.1M', change: '+$340K', trend: 'up', icon: DollarSign, color: 'text-compliant bg-compliant-50' },
    ],
    bars: {
      title: 'Contract Value by Category',
      color: 'var(--color-brand-500)',
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
        { label: 'Acme Corp', value: 94, color: 'var(--color-compliant)' },
        { label: 'Global Supplies', value: 87, color: 'var(--color-brand-500)' },
        { label: 'TechParts Ltd', value: 72, color: 'var(--color-mitigated)' },
        { label: 'Office Essentials', value: 91, color: 'var(--color-compliant)' },
        { label: 'FastShip', value: 65, color: 'var(--color-risk)' },
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
      { title: 'Total Risks', value: 12, change: '+2', trend: 'up', icon: AlertTriangle, color: 'text-risk-700 bg-risk-50' },
      { title: 'Controls Tested', value: '14/24', change: '+3', trend: 'up', icon: Shield, color: 'text-evidence-700 bg-evidence-50' },
      { title: 'Deficiencies', value: 2, change: '-1', trend: 'down', icon: XCircle, color: 'text-risk-700 bg-risk-50' },
      { title: 'Workflow Runs', value: 156, change: '+23', trend: 'up', icon: Activity, color: 'text-pink-600 bg-pink-50' },
    ],
    donut: {
      title: 'Risk Severity Distribution',
      centerLabel: '12',
      segments: [
        { label: 'Critical', value: 2, color: 'var(--color-risk)' },
        { label: 'High', value: 5, color: 'var(--color-high)' },
        { label: 'Medium', value: 3, color: 'var(--color-mitigated)' },
        { label: 'Low', value: 2, color: 'var(--color-compliant)' },
      ],
    },
    bars: {
      title: 'Control Effectiveness',
      color: 'var(--color-risk)',
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
        { label: 'SOX FY26', value: 58, color: 'var(--color-risk)' },
        { label: 'Internal Audit Q1', value: 82, color: 'var(--color-compliant)' },
        { label: 'Vendor Audit', value: 35, color: 'var(--color-mitigated)' },
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
    body: `Hi Team,\n\nHere's today's P2P audit summary from Auditify Copilot:\n\nALERTS\n• 3 new duplicate invoice flags detected overnight — Acme Corp (2), Global Supplies (1)\n• New vendor "Atlas Manufacturing" onboarded — KYC verification pending\n\nIMPROVEMENTS\n• Compliance rate improved from 93.1% → 94.2%\n• Avg processing time dropped to 1.8 days (was 2.1 days)\n\nKEY METRICS\n• Invoices processed: 12,450 (+8.2%)\n• Duplicate flags: 23 (-12%)\n• Compliance rate: 94.2% (+1.4%)\n\nRECOMMENDED ACTIONS\n1. Review & assign the 3 new duplicate flags before payment batch\n2. Expedite KYC verification for Atlas Manufacturing\n3. Continue vendor master data cleanup — showing strong results\n\nGenerated by Auditify Copilot — AI-Powered Internal Audit Platform`,
  },
  o2c: {
    subject: 'O2C Audit Alert Summary — 2 SLA Breaches',
    body: `Hi Team,\n\nHere's today's O2C audit summary from Auditify Copilot:\n\nALERTS\n• 2 high-value invoices ($180K+) pending approval beyond SLA\n• Revenue recognition timing discrepancy flagged in Q4 entries\n\nIMPROVEMENTS\n• DSO improved from 42 → 38 days\n• Disputed orders down 15% vs last month\n\nRECOMMENDED ACTIONS\n1. Escalate the 2 SLA-breached invoices immediately\n2. Review the Q4 revenue timing discrepancy before period close\n3. Continue collection drive momentum\n\nGenerated by Auditify Copilot`,
  },
  s2c: {
    subject: 'S2C Alert — 4 Contracts Expiring Within 30 Days',
    body: `Hi Team,\n\nHere's today's S2C audit summary from Auditify Copilot:\n\nALERTS\n• 4 contracts expiring within 30 days — 2 high-value (>$500K)\n• 3 vendors downgraded to Medium risk\n\nIMPROVEMENTS\n• Cost savings: $2.8M realized vs $2.4M target (117%)\n• New compliance clause added to contract templates\n\nRECOMMENDED ACTIONS\n1. Start renegotiation on the 2 high-value expiring contracts this week\n2. Review the 3 downgraded vendors' risk mitigation plans\n\nGenerated by Auditify Copilot`,
  },
  grc: {
    subject: 'GRC Alert — DEF-002 Remediation Due in 6 Days',
    body: `Hi Team,\n\nHere's today's GRC audit summary from Auditify Copilot:\n\nCRITICAL\n• Material weakness DEF-002 remediation due in 6 days\n• New risk RSK-012 identified — GL balance discrepancy\n\nPROGRESS\n• SOX audit progress: 58% (14/24 controls tested)\n• 3 controls tested since yesterday\n• Workflow automation saved 45 person-hours this month\n\nRECOMMENDED ACTIONS\n1. Escalate DEF-002 to ensure Mar 31 deadline is met\n2. Assign controls for RSK-012 in R2R process\n3. Prioritize remaining 10 untested controls\n\nGenerated by Auditify Copilot`,
  },
};

// ─── Alerts Panel Component ─────────────────────────────────────────────────

function IRAInlineSummary({ dashboardId }: { dashboardId: DashboardId }) {
  const [summary, setSummary] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const text = AI_SUMMARIES[dashboardId];
      setSummary(text);
      setEditedText(text);
      setIsGenerating(false);
    }, 1500);
  };

  const handleTextClick = () => {
    if (!isGenerating) {
      setIsEditing(true);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (editedText !== summary) {
      setSummary(editedText);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleBlur(); }
    if (e.key === 'Escape') { setEditedText(summary); setIsEditing(false); }
  };

  // Empty / generate state
  if (!summary && !isGenerating) {
    return (
      <div className="px-5 pt-4 pb-3">
        <div className="p-4 rounded-xl border border-brand-100 bg-canvas-elevated">
          <button
            onClick={handleGenerate}
            className="flex items-center gap-2 text-brand-600 hover:text-brand-700 transition-colors cursor-pointer text-[13px] font-medium"
          >
            <Sparkles size={14} className="text-brand-500" />
            Generate AI Summary
          </button>
        </div>
      </div>
    );
  }

  // Generating state
  if (isGenerating) {
    return (
      <div className="px-5 pt-4 pb-3">
        <div className="p-4 rounded-xl border border-brand-200 bg-canvas-elevated">
          <div className="flex items-center gap-3">
            <Sparkles size={14} className="text-brand-500 animate-pulse" />
            <div className="flex items-center gap-2">
              <div className="h-1 w-32 bg-brand-100 rounded-full overflow-hidden">
                <motion.div className="h-full bg-brand-500 rounded-full" initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: 1.5, ease: 'easeInOut' }} />
              </div>
              <span className="text-[12px] text-ink-500">Generating summary...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Generated — IRA SUMMARY card
  return (
    <div className="px-5 pt-4 pb-3">
      <div className="p-5 rounded-xl border border-brand-200 bg-canvas-elevated">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-brand-50">
              <Sparkles size={13} className="text-brand-600" />
            </div>
            <span className="text-[12px] font-bold text-brand-700 uppercase tracking-wide">IRA Summary</span>
          </div>
          <button onClick={handleGenerate} className="p-1.5 rounded-lg hover:bg-brand-50 transition-colors cursor-pointer" title="Regenerate">
            <Sparkles size={13} className="text-brand-500" />
          </button>
        </div>
        {isEditing ? (
          <textarea
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            autoFocus
            className="w-full text-[13px] leading-[1.65] text-ink-800 bg-transparent border border-brand-200 rounded-lg p-2 resize-none outline-none focus:border-brand-400 transition-colors"
            rows={3}
          />
        ) : (
          <p onClick={handleTextClick} className="text-[13px] leading-[1.65] text-ink-800 cursor-text hover:bg-brand-50/50 rounded-lg transition-colors">
            {summary}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── IRA Summary texts per dashboard ────────────────────────────────────────

const AI_SUMMARIES: Record<DashboardId, string> = {
  p2p: 'P2P saw 3 new duplicate flags overnight (Acme Corp & Global Supplies), but compliance rate improved to 94.2% after vendor master cleanup. Processing time is trending down to 1.8 days. One new vendor (Atlas Manufacturing) is pending KYC — recommend expediting before next payment batch.',
  o2c: 'DSO improved by 2 days to 38 days. 5 customers account for 65% of outstanding receivables totalling ₹4.2Cr. Dispute rate trending upward in APAC region — 12 new disputes this week. Cash application automation rate hit 91%.',
  s2c: '12 contracts expire within 30 days across 3 business units. Vendor TechParts Ltd compliance score dropped below 75% threshold. 4 contracts pending legal review — recommend prioritizing the ₹2.1Cr IT services renewal.',
  grc: '2 critical risks in P2P have zero controls mapped. SOD violation detected in AP module — user JSmith has both invoice approval and payment release access. 3 audit findings from Q1 remain open past remediation deadline.',
};

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
    change: 'text-evidence-700 bg-evidence-50',
    alert: 'text-high-700 bg-high-50',
    improvement: 'text-compliant bg-compliant-50',
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
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-light/50">
          <button onClick={() => setExpanded(p => !p)} className="flex items-center gap-2 cursor-pointer">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary to-primary-medium">
              <Sparkles size={13} className="text-white" />
            </div>
            <span className="text-[13px] font-semibold text-text">Alerts & Daily Digest</span>
            {alertCount > 0 && <span className="text-[12px] bg-risk-50 text-risk-700 px-2 py-0.5 rounded-full font-bold">{alertCount} alert{alertCount > 1 ? 's' : ''}</span>}
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
              {/* IRA Summary — matches Working folder design */}
              <IRAInlineSummary dashboardId={dashboardId} />

              {/* Alert items */}
              <div className="px-5 pb-4 space-y-2">
                {items.map((item, i) => {
                  const Icon = typeIcons[item.type];
                  const color = typeColors[item.type];
                  return (
                    <motion.div key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                      className={`flex items-start gap-2.5 p-2.5 rounded-xl transition-colors ${item.type === 'alert' ? 'bg-high-50/50 border border-high/50' : 'hover:bg-surface-2'}`}>
                      <div className={`p-1.5 rounded-lg shrink-0 ${color}`}><Icon size={12} /></div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] text-text leading-relaxed">{item.text}</div>
                        <div className="text-[12px] text-text-muted mt-0.5">{item.time}</div>
                      </div>
                      {item.type === 'alert' && (
                        <span className="text-[12px] font-bold text-high-700 bg-high-50 px-1.5 py-0.5 rounded-full shrink-0">Action needed</span>
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
                  <label className="text-[12px] font-semibold text-text-muted block mb-1.5">Send to</label>
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
                      <label className="text-[12px] font-semibold text-text-muted">Generated Email</label>
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

// ─── Drop Zone Component ─────────────────────────────────────────────────────

function DropZone({ label, placeholder, active, onDragOver, onDragLeave, onDrop, fields, getLabel, onRemove, showAgg, yAggs, aggDropdownOpen, setAggDropdownOpen, setYAggs, className }: {
  label: string;
  placeholder: string;
  active: boolean;
  onDragOver: () => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  fields: string[];
  getLabel: (id: string) => string;
  onRemove: (id: string) => void;
  showAgg?: boolean;
  yAggs?: Record<string, string>;
  aggDropdownOpen?: string | null;
  setAggDropdownOpen?: (v: string | null) => void;
  setYAggs?: (fn: (prev: Record<string, string>) => Record<string, string>) => void;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border-2 border-dashed p-3 transition-colors ${
        active ? 'border-brand-400 bg-brand-50' : 'border-canvas-border bg-canvas-elevated'
      } ${className || ''}`}
      onDragOver={e => { e.preventDefault(); onDragOver(); }}
      onDragLeave={onDragLeave}
      onDrop={e => { e.preventDefault(); onDrop(e); }}
    >
      {label && <div className="text-[11px] font-bold uppercase tracking-wider text-ink-500 mb-2">{label}</div>}
      {fields.length === 0 ? (
        <div className="flex items-center gap-2 min-h-[32px]">
          <svg className="size-3.5 text-ink-300" viewBox="0 0 12 12" fill="currentColor">
            <circle cx="4" cy="3" r="1" /><circle cx="8" cy="3" r="1" />
            <circle cx="4" cy="6" r="1" /><circle cx="8" cy="6" r="1" />
            <circle cx="4" cy="9" r="1" /><circle cx="8" cy="9" r="1" />
          </svg>
          <span className="text-[11px] text-ink-400">{placeholder}</span>
        </div>
      ) : (
        <div className="space-y-1.5">
          {fields.map(id => (
            <div key={id} className="flex items-center justify-between bg-brand-50 border border-brand-200 rounded-md px-2.5 py-1.5">
              <span className="text-[12px] font-medium text-brand-700">{getLabel(id)}</span>
              <div className="flex items-center gap-1.5">
                {showAgg && yAggs && setAggDropdownOpen && setYAggs && (
                  <div className="relative">
                    <button
                      onClick={() => setAggDropdownOpen(aggDropdownOpen === id ? null : id)}
                      className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-white border border-brand-200 text-[10px] font-bold text-brand-600 cursor-pointer hover:bg-brand-50"
                    >
                      {AGG_OPTIONS.find(a => a.value === (yAggs[id] || 'count_d'))?.symbol || '#'}
                      <ChevronDown size={9} />
                    </button>
                    {aggDropdownOpen === id && (
                      <>
                        <div className="fixed inset-0 z-30" onClick={() => setAggDropdownOpen(null)} />
                        <div className="absolute top-full right-0 mt-1 z-40 bg-canvas-elevated border border-canvas-border rounded-lg shadow-xl py-1 min-w-[120px]">
                          {AGG_OPTIONS.map(a => (
                            <button
                              key={a.value}
                              onClick={() => { setYAggs(prev => ({ ...prev, [id]: a.value })); setAggDropdownOpen(null); }}
                              className={`w-full flex items-center gap-2 px-3 py-1.5 text-[11px] transition-colors cursor-pointer ${
                                yAggs[id] === a.value ? 'text-brand-700 bg-brand-50' : 'text-ink-600 hover:bg-surface-2'
                              }`}
                            >
                              <span className="w-4 text-center font-bold">{a.symbol}</span>
                              {a.label}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
                <button onClick={() => onRemove(id)} className="text-ink-400 hover:text-red-500 cursor-pointer"><X size={12} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Format Section Helpers ──────────────────────────────────────────────────

function FmtSection({ title, icon, open, onToggle, children }: {
  title: string; icon: React.ReactNode; open: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <div className="bg-canvas-elevated rounded-lg border border-canvas-border overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-2.5 bg-brand-50/30 border-b border-canvas-border/50 hover:bg-brand-50 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <span className="text-brand-600">{icon}</span>
          <span className="text-[11px] font-bold uppercase tracking-wider text-ink-700">{title}</span>
        </div>
        <ChevronDown size={14} className={`text-brand-600 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.15 }} className="overflow-hidden">
            <div className="p-3 bg-surface-2/30">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function BIUButtons({ bold, italic, underline, onBold, onItalic, onUnderline }: {
  bold: boolean; italic: boolean; underline: boolean;
  onBold: () => void; onItalic: () => void; onUnderline: () => void;
}) {
  return (
    <div className="flex items-center bg-canvas-elevated rounded-md border border-canvas-border overflow-hidden">
      {[
        { label: 'Bold', active: bold, onClick: onBold, cls: 'font-bold' },
        { label: 'Italic', active: italic, onClick: onItalic, cls: 'italic' },
        { label: 'Underline', active: underline, onClick: onUnderline, cls: 'underline' },
      ].map((btn, i) => (
        <button
          key={btn.label}
          onClick={btn.onClick}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 transition-colors cursor-pointer ${i < 2 ? 'border-r border-canvas-border' : ''} ${
            btn.active ? 'bg-brand-600 text-white' : 'text-ink-600 hover:bg-brand-50'
          }`}
        >
          <span className={`text-[12px] ${btn.cls}`}>{btn.label.charAt(0)}</span>
          <span className="text-[10px] font-medium">{btn.label}</span>
        </button>
      ))}
    </div>
  );
}

// ─── Add Widget Modal ────────────────────────────────────────────────────────

interface ChartTypeDef {
  id: string;
  title: string;
  icon: React.ElementType;
}

const CHART_TYPES: ChartTypeDef[] = [
  { id: 'kpi', title: 'KPI Cards', icon: BarChart3 },
  { id: 'pie', title: 'Pie Chart', icon: BarChart3 },
  { id: 'line', title: 'Line Chart', icon: LineChart },
  { id: 'area', title: 'Area Chart', icon: AreaChart },
  { id: 'stacked-bar', title: 'Stacked Bar Chart', icon: BarChart3 },
  { id: 'clustered-bar', title: 'Clustered Bar Chart', icon: BarChart3 },
  { id: 'clustered-col', title: 'Clustered Column Chart', icon: BarChart3 },
  { id: 'stacked-col', title: 'Stacked Column Chart', icon: BarChart3 },
  { id: 'line-clustered', title: 'Line & Clustered Column', icon: LineChart },
  { id: 'line-stacked', title: 'Line & Stacked Column', icon: LineChart },
  { id: 'scatter', title: 'Scatter Chart', icon: TrendingUp },
  { id: 'waterfall', title: 'Waterfall Chart', icon: TrendingUp },
  { id: 'table', title: 'Table', icon: FileText },
];

interface DragField {
  id: string;
  label: string;
  kind: 'dimension' | 'measure';
  group: string;
}

const DRAG_FIELDS: DragField[] = [
  { id: 'date', label: 'Date', kind: 'dimension', group: 'Time' },
  { id: 'month', label: 'Month', kind: 'dimension', group: 'Time' },
  { id: 'week', label: 'Week', kind: 'dimension', group: 'Time' },
  { id: 'region', label: 'Region', kind: 'dimension', group: 'Geography' },
  { id: 'state', label: 'State', kind: 'dimension', group: 'Geography' },
  { id: 'vendor', label: 'Vendor Name', kind: 'dimension', group: 'Entity' },
  { id: 'status', label: 'Status', kind: 'dimension', group: 'Entity' },
  { id: 'category', label: 'Categories', kind: 'dimension', group: 'Entity' },
  { id: 'department', label: 'Department', kind: 'dimension', group: 'Entity' },
  { id: 'inv_amount', label: 'Invoice Amount (₹)', kind: 'measure', group: 'Financial' },
  { id: 'risk_amt', label: 'Amount at Risk (₹)', kind: 'measure', group: 'Financial' },
  { id: 'dup_count', label: 'Duplicate Count', kind: 'measure', group: 'Performance' },
  { id: 'dup_score', label: 'Duplicate Score (%)', kind: 'measure', group: 'Performance' },
  { id: 'inv_scanned', label: 'Invoices Scanned', kind: 'measure', group: 'Performance' },
  { id: 'accuracy', label: 'Detection Accuracy (%)', kind: 'measure', group: 'Performance' },
  { id: 'proc_time', label: 'Processing Time (d)', kind: 'measure', group: 'Performance' },
];

const AGG_OPTIONS = [
  { value: 'sum', label: 'Sum', symbol: 'Σ' },
  { value: 'average', label: 'Average', symbol: 'x̄' },
  { value: 'count', label: 'Count', symbol: 'n' },
  { value: 'count_d', label: 'Count Distinct', symbol: '#' },
  { value: 'min', label: 'Min', symbol: '↓' },
  { value: 'max', label: 'Max', symbol: '↑' },
];

function AddWidgetModal({ open, onClose, addToast }: {
  open: boolean;
  onClose: () => void;
  addToast: (t: { message: string; type: string }) => void;
}) {
  const [selectedChart, setSelectedChart] = useState<ChartTypeDef | null>(null);
  const [chartTypeCollapsed, setChartTypeCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'data' | 'format'>('data');
  const [fieldSearch, setFieldSearch] = useState('');
  const [xFields, setXFields] = useState<string[]>([]);
  const [yFields, setYFields] = useState<string[]>([]);
  const [yAggs, setYAggs] = useState<Record<string, string>>({});
  const [widgetName, setWidgetName] = useState('');
  const [widgetDesc, setWidgetDesc] = useState('');
  const [file1Open, setFile1Open] = useState(true);
  const [file2Open, setFile2Open] = useState(false);
  const [dragOver, setDragOver] = useState<'x' | 'y' | 'yindex' | 'legend' | null>(null);
  const [yIndexFields, setYIndexFields] = useState<string[]>([]);
  const [legendFields, setLegendFields] = useState<string[]>([]);
  const [aggDropdownOpen, setAggDropdownOpen] = useState<string | null>(null);
  // Customize tab state
  const [selectedBaseColor, setSelectedBaseColor] = useState('#6a12cd');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [generalOpen, setGeneralOpen] = useState(true);
  const [xAxisFmtOpen, setXAxisFmtOpen] = useState(false);
  const [yAxisFmtOpen, setYAxisFmtOpen] = useState(false);
  const [legendsFmtOpen, setLegendsFmtOpen] = useState(false);
  const [dataLabelsFmtOpen, setDataLabelsFmtOpen] = useState(false);
  const [rangeFmtOpen, setRangeFmtOpen] = useState(false);
  const [condFmtOpen, setCondFmtOpen] = useState(false);
  const [seriesFmtOpen, setSeriesFmtOpen] = useState(false);
  const [xAxisTitle, setXAxisTitle] = useState('');
  const [yAxisTitle, setYAxisTitle] = useState('');
  const [xBold, setXBold] = useState(false);
  const [xItalic, setXItalic] = useState(false);
  const [xUnder, setXUnder] = useState(false);
  const [yBold, setYBold] = useState(false);
  const [yItalic, setYItalic] = useState(false);
  const [yUnder, setYUnder] = useState(false);
  const [legendPos, setLegendPos] = useState('bottom');
  const [showLegendToggle, setShowLegendToggle] = useState(true);
  const [rangeMin, setRangeMin] = useState('');
  const [rangeMax, setRangeMax] = useState('');
  const [autoScale, setAutoScale] = useState(true);
  const [dataLabelShow, setDataLabelShow] = useState(true);
  const [yIndexFmtOpen, setYIndexFmtOpen] = useState(false);
  const [yIndexTitle, setYIndexTitle] = useState('');
  const [yIdxBold, setYIdxBold] = useState(false);
  const [yIdxItalic, setYIdxItalic] = useState(false);
  const [yIdxUnder, setYIdxUnder] = useState(false);
  const [yIndexRangeFmtOpen, setYIndexRangeFmtOpen] = useState(false);
  const [yIndexRangeMin, setYIndexRangeMin] = useState('');
  const [yIndexRangeMax, setYIndexRangeMax] = useState('');
  const [yIndexInvert, setYIndexInvert] = useState(true);
  const [condRules, setCondRules] = useState([{ id: '1', field: '', condition: 'greater', value: '', color: '#ef4444' }]);

  // Reset on open
  useEffect(() => {
    if (open) {
      setSelectedChart(null);
      setActiveTab('data');
      setXFields([]);
      setYFields([]);
      setYIndexFields([]);
      setLegendFields([]);
      setYAggs({});
      setWidgetName('');
      setWidgetDesc('');
      setFieldSearch('');
    }
  }, [open]);

  const filteredFields = DRAG_FIELDS.filter(f =>
    f.label.toLowerCase().includes(fieldSearch.toLowerCase())
  );
  const dimensionFields = filteredFields.filter(f => f.kind === 'dimension');
  const measureFields = filteredFields.filter(f => f.kind === 'measure');

  const handleDrop = (zone: 'x' | 'y' | 'yindex' | 'legend', e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(null);
    const fieldId = e.dataTransfer.getData('fieldId');
    if (!fieldId) return;
    if (zone === 'x') {
      if (xFields.length >= 3 || xFields.includes(fieldId)) return;
      setXFields(prev => [...prev, fieldId]);
    } else if (zone === 'y') {
      if (yFields.length >= 3 || yFields.includes(fieldId)) return;
      setYFields(prev => [...prev, fieldId]);
      setYAggs(prev => ({ ...prev, [fieldId]: 'count_d' }));
    } else if (zone === 'yindex') {
      if (yIndexFields.length >= 3 || yIndexFields.includes(fieldId)) return;
      setYIndexFields(prev => [...prev, fieldId]);
    } else if (zone === 'legend') {
      if (legendFields.length >= 3 || legendFields.includes(fieldId)) return;
      setLegendFields(prev => [...prev, fieldId]);
    }
  };

  const removeXField = (id: string) => setXFields(prev => prev.filter(f => f !== id));
  const removeYField = (id: string) => {
    setYFields(prev => prev.filter(f => f !== id));
    setYAggs(prev => { const n = { ...prev }; delete n[id]; return n; });
  };
  const removeYIndexField = (id: string) => setYIndexFields(prev => prev.filter(f => f !== id));
  const removeLegendField = (id: string) => setLegendFields(prev => prev.filter(f => f !== id));

  // Dynamic labels per chart type
  const getAxisLabels = () => {
    if (!selectedChart) return { x: 'X - Axis', y: 'Y - Axis' };
    const id = selectedChart.id;
    if (id === 'kpi') return { x: 'Trend', y: 'Value' };
    if (id === 'pie') return { x: 'Legend', y: 'Values' };
    if (id === 'stacked-bar' || id === 'clustered-bar') return { x: 'Y - Axis', y: 'X - Axis' };
    if (id === 'table') return { x: 'Columns', y: 'Columns' };
    return { x: 'X - Axis', y: 'Y - Axis' };
  };
  const axisLabels = getAxisLabels();
  const showYIndex = selectedChart && (selectedChart.id === 'clustered-col' || selectedChart.id === 'line' || selectedChart.id === 'waterfall');
  const showLegend = selectedChart && selectedChart.id !== 'kpi';

  const getFieldLabel = (id: string) => DRAG_FIELDS.find(f => f.id === id)?.label || id;

  const handleAdd = () => {
    addToast({ message: `${selectedChart?.title || 'Widget'} added to dashboard`, type: 'success' });
    onClose();
  };

  // Simple preview chart based on selected type
  // Preview data
  const PV_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const PV_ACTUAL = [93, 95, 96, 95.5, 97, 97.5];
  const PV_TARGET = [95.5, 96, 96.5, 97, 97.5, 98];
  const PV_BARS = [
    { l: 'Jan', d: 45, r: 42, p: 3 }, { l: 'Feb', d: 52, r: 48, p: 4 }, { l: 'Mar', d: 38, r: 35, p: 3 },
    { l: 'Apr', d: 61, r: 55, p: 6 }, { l: 'May', d: 48, r: 46, p: 2 }, { l: 'Jun', d: 55, r: 50, p: 5 },
  ];
  const PV_PIE = [
    { label: 'Exact Match', value: 40, color: '#7C3AED' },
    { label: 'Vendor Match', value: 25, color: '#0369A1' },
    { label: 'PO Match', value: 18, color: '#B45309' },
    { label: 'ML Detection', value: 12, color: '#15803D' },
    { label: 'Manual Flag', value: 5, color: '#B42318' },
  ];
  const PV_SCATTER = [
    [40,160],[80,120],[130,90],[170,140],[220,60],[260,110],[310,80],[350,130],[100,50],[200,100],[280,70],[150,150],
  ];
  const PV_WATERFALL = [
    { l: 'Revenue', v: 90, type: 'up' }, { l: 'COGS', v: -30, type: 'down' }, { l: 'Gross', v: 60, type: 'total' },
    { l: 'OpEx', v: -20, type: 'down' }, { l: 'Tax', v: -8, type: 'down' }, { l: 'Net', v: 32, type: 'total' },
  ];
  const PV_TABLE_ROWS = [
    ['INV-005790', 'Acme Global', '₹11,853', 'Pending', 'High'],
    ['INV-025832', 'Korean Tech', '₹4,564', 'Review', 'Medium'],
    ['INV-007194', '3tones Letter', '₹3,835', 'Resolved', 'Low'],
    ['INV-040083', 'Chintamani', '₹3,410', 'Pending', 'High'],
    ['INV-027203', 'M Cargo', '₹1,457', 'Resolved', 'Low'],
  ];

  const hasFields = xFields.length > 0 || yFields.length > 0;
  const xLabel = xFields.length > 0 ? getFieldLabel(xFields[0]) : '';
  const yLabel = yFields.length > 0 ? getFieldLabel(yFields[0]) : '';
  const axisCaption = hasFields ? `${yLabel || 'Y-Axis'} by ${xLabel || 'X-Axis'}` : '';

  // Shared axis + legend footer
  const AxisFooter = ({ labels, legend }: { labels: string[]; legend?: { label: string; color: string; dashed?: boolean }[] }) => (
    <div className="mt-2">
      {/* X-axis data labels */}
      {labels.length > 0 && (
        <div className="flex justify-between text-[10px] text-ink-400 px-1">
          {labels.map(l => <span key={l}>{l}</span>)}
        </div>
      )}
      {/* X-axis title */}
      {xLabel && (
        <div className="text-center mt-1.5">
          <span className="text-[10px] font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded">{xLabel}</span>
        </div>
      )}
      {/* Legend */}
      {legend && (
        <div className="flex items-center justify-center gap-4 mt-2.5">
          {legend.map(lg => (
            <div key={lg.label} className="flex items-center gap-1.5">
              {lg.dashed ? (
                <svg width="16" height="2"><line x1="0" y1="1" x2="16" y2="1" stroke={lg.color} strokeWidth="2" strokeDasharray="3 2" /></svg>
              ) : (
                <div className="w-3 h-2 rounded-sm" style={{ background: lg.color }} />
              )}
              <span className="text-[10px] text-ink-500">{lg.label}</span>
            </div>
          ))}
        </div>
      )}
      {/* Caption: "Y by X" */}
      {axisCaption && <div className="text-[10px] text-ink-400 text-center mt-2">{axisCaption}</div>}
    </div>
  );

  const renderPreview = () => {
    if (!selectedChart) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-ink-400">
          <BarChart3 size={48} className="mb-3 opacity-30" />
          <p className="text-[14px] font-medium">Select a chart type to preview</p>
          <p className="text-[12px] mt-1">Drag fields to X and Y axes to configure</p>
        </div>
      );
    }

    const W = 480, H = 240;
    const id = selectedChart.id;

    // ── KPI Cards ──
    if (id === 'kpi') {
      return (
        <div className="flex items-center justify-center h-full gap-5">
          {[
            { label: yLabel || 'Invoices Scanned', value: '12,450', change: '+8.2%', spark: [30,45,38,52,48,60,55,68] },
            { label: 'Compliance Rate', value: '94.2%', change: '+1.4%', spark: [80,82,81,85,88,87,90,94] },
          ].map((kpi, i) => (
            <div key={i} className="bg-canvas-elevated border border-canvas-border rounded-xl p-5 min-w-[200px]">
              <p className="text-[11px] text-ink-500 font-medium uppercase tracking-wider mb-1">{kpi.label}</p>
              <p className="text-[32px] font-bold text-ink-900 leading-none">{kpi.value}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[11px] text-compliant font-semibold flex items-center gap-0.5"><TrendingUp size={10} />{kpi.change}</span>
                <svg width="60" height="20" viewBox="0 0 60 20">
                  <polyline points={kpi.spark.map((v,j) => `${j*(60/(kpi.spark.length-1))},${20-((v-Math.min(...kpi.spark))/(Math.max(...kpi.spark)-Math.min(...kpi.spark)))*18}`).join(' ')} fill="none" stroke="var(--color-brand-400)" strokeWidth="1.5" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      );
    }

    // ── Pie / Donut ──
    if (id === 'pie') {
      const total = PV_PIE.reduce((a, s) => a + s.value, 0);
      let off = 0;
      return (
        <div className="flex items-center justify-center gap-10 h-full">
          <svg width="180" height="180" viewBox="0 0 100 100">
            {PV_PIE.map(s => {
              const pct = (s.value / total) * 100;
              const da = `${pct * 2.51327} ${251.327 - pct * 2.51327}`;
              const doff = -off * 2.51327;
              off += pct;
              return <circle key={s.label} cx="50" cy="50" r="38" fill="none" stroke={s.color} strokeWidth="12" strokeDasharray={da} strokeDashoffset={doff} strokeLinecap="round" transform="rotate(-90 50 50)" />;
            })}
            <text x="50" y="47" textAnchor="middle" className="fill-ink-900 font-bold" fontSize="16">{total}</text>
            <text x="50" y="59" textAnchor="middle" className="fill-ink-500" fontSize="8">Total</text>
          </svg>
          <div className="space-y-2.5">
            {PV_PIE.map(s => (
              <div key={s.label} className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ background: s.color }} />
                <span className="text-[12px] text-ink-700 w-24">{s.label}</span>
                <span className="text-[13px] font-bold text-ink-900">{s.value}%</span>
              </div>
            ))}
          </div>
          {axisCaption && <div className="absolute bottom-3 left-0 right-0 text-center text-[10px] text-ink-400">{axisCaption}</div>}
        </div>
      );
    }

    // ── Line Chart ──
    if (id === 'line') {
      const aMax = Math.max(...PV_ACTUAL, ...PV_TARGET);
      const pts = (data: number[]) => data.map((v, i) => `${40 + i * ((W-80)/(data.length-1))},${H - 30 - ((v - 85) / (aMax - 85)) * (H - 60)}`).join(' ');
      return (
        <div className="flex flex-col justify-center h-full px-4 relative">
          {/* Y axis label */}
          {yLabel && (
            <div className="absolute -left-1 top-1/2 -translate-y-1/2 -rotate-90 origin-center">
              <span className="text-[9px] font-semibold text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded whitespace-nowrap">{yLabel}</span>
            </div>
          )}
          {/* Y axis values */}
          <div className="absolute left-4 top-4 bottom-10 flex flex-col justify-between text-[9px] text-ink-400">
            {[98, 96, 94, 92].map(v => <span key={v}>{v}%</span>)}
          </div>
          <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
            {/* Grid lines */}
            {[0.2, 0.4, 0.6, 0.8].map(p => <line key={p} x1="40" y1={H - 30 - p * (H-60)} x2={W-10} y2={H - 30 - p * (H-60)} stroke="var(--color-canvas-border)" strokeWidth="0.5" />)}
            {/* Target dashed */}
            <polyline points={pts(PV_TARGET)} fill="none" stroke="var(--color-evidence)" strokeWidth="2" strokeDasharray="6 3" strokeLinecap="round" />
            {/* Actual solid */}
            <polyline points={pts(PV_ACTUAL)} fill="none" stroke="var(--color-brand-500)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            {PV_ACTUAL.map((v, i) => <circle key={i} cx={40 + i * ((W-80)/(PV_ACTUAL.length-1))} cy={H - 30 - ((v - 85) / (aMax - 85)) * (H - 60)} r="4" fill="var(--color-brand-600)" stroke="white" strokeWidth="2" />)}
          </svg>
          <AxisFooter labels={PV_LABELS} legend={[{ label: 'Actual', color: '#7C3AED' }, { label: 'Target', color: '#0369A1', dashed: true }]} />
        </div>
      );
    }

    // ── Area Chart ──
    if (id === 'area') {
      const aMax = Math.max(...PV_ACTUAL, ...PV_TARGET);
      const toY = (v: number) => H - 30 - ((v - 85) / (aMax - 85)) * (H - 60);
      const pts = PV_ACTUAL.map((v, i) => `${40 + i * ((W-80)/(PV_ACTUAL.length-1))},${toY(v)}`).join(' ');
      return (
        <div className="flex flex-col justify-center h-full px-4 relative">
          <div className="absolute left-4 top-4 bottom-10 flex flex-col justify-between text-[9px] text-ink-400">
            {[98, 96, 94, 92].map(v => <span key={v}>{v}%</span>)}
          </div>
          <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
            <defs><linearGradient id="aGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7C3AED" stopOpacity="0.18" /><stop offset="100%" stopColor="#7C3AED" stopOpacity="0.02" /></linearGradient></defs>
            {[0.2, 0.4, 0.6, 0.8].map(p => <line key={p} x1="40" y1={H - 30 - p * (H-60)} x2={W-10} y2={H - 30 - p * (H-60)} stroke="var(--color-canvas-border)" strokeWidth="0.5" />)}
            <polyline points={`40,${H-30} ${pts} ${W-10},${H-30}`} fill="url(#aGrad)" />
            <polyline points={PV_TARGET.map((v, i) => `${40 + i * ((W-80)/(PV_TARGET.length-1))},${toY(v)}`).join(' ')} fill="none" stroke="var(--color-evidence)" strokeWidth="2" strokeDasharray="6 3" />
            <polyline points={pts} fill="none" stroke="var(--color-brand-500)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            {PV_ACTUAL.map((v, i) => <circle key={i} cx={40 + i * ((W-80)/(PV_ACTUAL.length-1))} cy={toY(v)} r="4" fill="var(--color-brand-600)" stroke="white" strokeWidth="2" />)}
          </svg>
          <AxisFooter labels={PV_LABELS} legend={[{ label: 'Actual', color: '#7C3AED' }, { label: 'Target', color: '#0369A1', dashed: true }]} />
        </div>
      );
    }

    // ── Stacked Bar (horizontal) ──
    if (id === 'stacked-bar') {
      const bMax = Math.max(...PV_BARS.map(b => b.d));
      return (
        <div className="flex flex-col justify-center h-full px-6">
          <div className="space-y-3">
            {PV_BARS.map(b => (
              <div key={b.l} className="flex items-center gap-3">
                <span className="text-[11px] text-ink-500 w-8 text-right">{b.l}</span>
                <div className="flex-1 flex h-5 rounded overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${(b.r / bMax) * 100}%` }} transition={{ duration: 0.5 }} className="h-full" style={{ background: '#7C3AED' }} />
                  <motion.div initial={{ width: 0 }} animate={{ width: `${(b.p / bMax) * 100}%` }} transition={{ duration: 0.5, delay: 0.1 }} className="h-full" style={{ background: '#0369A1' }} />
                </div>
                <span className="text-[10px] text-ink-500 w-6">{b.d}</span>
              </div>
            ))}
          </div>
          <AxisFooter labels={[]} legend={[{ label: 'Resolved', color: '#7C3AED' }, { label: 'Pending', color: '#0369A1' }]} />
        </div>
      );
    }

    // ── Clustered Bar (horizontal) ──
    if (id === 'clustered-bar') {
      const bMax = Math.max(...PV_BARS.map(b => b.d));
      return (
        <div className="flex flex-col justify-center h-full px-6">
          <div className="space-y-2">
            {PV_BARS.map(b => (
              <div key={b.l} className="flex items-center gap-3">
                <span className="text-[11px] text-ink-500 w-8 text-right">{b.l}</span>
                <div className="flex-1 space-y-1">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${(b.d / bMax) * 100}%` }} transition={{ duration: 0.5 }} className="h-3 rounded" style={{ background: '#7C3AED' }} />
                  <motion.div initial={{ width: 0 }} animate={{ width: `${(b.r / bMax) * 100}%` }} transition={{ duration: 0.5, delay: 0.05 }} className="h-3 rounded" style={{ background: '#0369A1' }} />
                </div>
              </div>
            ))}
          </div>
          <AxisFooter labels={[]} legend={[{ label: 'Duplicates', color: '#7C3AED' }, { label: 'Resolved', color: '#0369A1' }]} />
        </div>
      );
    }

    // ── Clustered Column (vertical grouped) ──
    if (id === 'clustered-col') {
      const bMax = Math.max(...PV_BARS.map(b => b.d));
      return (
        <div className="flex flex-col justify-end h-full px-4 pb-2">
          <div className="flex items-end gap-3 flex-1">
            {PV_BARS.map((b, i) => (
              <div key={b.l} className="flex-1 flex items-end gap-0.5 justify-center" style={{ height: '100%' }}>
                <motion.div initial={{ height: 0 }} animate={{ height: `${(b.d / bMax) * 85}%` }} transition={{ duration: 0.4, delay: i * 0.04 }} className="w-3 rounded-t" style={{ background: '#7C3AED' }} />
                <motion.div initial={{ height: 0 }} animate={{ height: `${(b.r / bMax) * 85}%` }} transition={{ duration: 0.4, delay: i * 0.04 + 0.05 }} className="w-3 rounded-t" style={{ background: '#0369A1' }} />
                <motion.div initial={{ height: 0 }} animate={{ height: `${(b.p / bMax) * 85}%` }} transition={{ duration: 0.4, delay: i * 0.04 + 0.1 }} className="w-3 rounded-t min-h-[2px]" style={{ background: '#B45309' }} />
              </div>
            ))}
          </div>
          <AxisFooter labels={PV_LABELS} legend={[{ label: 'Duplicates', color: '#7C3AED' }, { label: 'Resolved', color: '#0369A1' }, { label: 'Pending', color: '#B45309' }]} />
        </div>
      );
    }

    // ── Stacked Column (vertical stacked) ──
    if (id === 'stacked-col') {
      const bMax = Math.max(...PV_BARS.map(b => b.d));
      return (
        <div className="flex flex-col justify-end h-full px-4 pb-2">
          <div className="flex items-end gap-4 flex-1">
            {PV_BARS.map((b, i) => (
              <div key={b.l} className="flex-1 flex flex-col-reverse items-center" style={{ height: '100%' }}>
                <motion.div initial={{ height: 0 }} animate={{ height: `${(b.r / bMax) * 80}%` }} transition={{ duration: 0.4, delay: i * 0.04 }} className="w-8 rounded-b" style={{ background: '#7C3AED' }} />
                <motion.div initial={{ height: 0 }} animate={{ height: `${(b.p / bMax) * 80}%` }} transition={{ duration: 0.4, delay: i * 0.04 + 0.1 }} className="w-8 rounded-t min-h-[2px]" style={{ background: '#B45309' }} />
              </div>
            ))}
          </div>
          <AxisFooter labels={PV_LABELS} legend={[{ label: 'Resolved', color: '#7C3AED' }, { label: 'Pending', color: '#B45309' }]} />
        </div>
      );
    }

    // ── Line & Clustered Column ──
    if (id === 'line-clustered') {
      const bMax = Math.max(...PV_BARS.map(b => b.d));
      const lnPts = PV_BARS.map((b, i) => `${40 + i * ((W-80)/(PV_BARS.length-1))},${H - 30 - (b.r / bMax) * (H-60)}`).join(' ');
      return (
        <div className="flex flex-col justify-end h-full px-4 pb-2 relative">
          <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} className="absolute inset-0" style={{ top: 0 }}>
            <polyline points={lnPts} fill="none" stroke="var(--color-compliant)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            {PV_BARS.map((b, i) => <circle key={i} cx={40 + i * ((W-80)/(PV_BARS.length-1))} cy={H - 30 - (b.r / bMax) * (H-60)} r="3.5" fill="var(--color-compliant)" stroke="white" strokeWidth="2" />)}
          </svg>
          <div className="flex items-end gap-4 flex-1 relative z-10">
            {PV_BARS.map((b, i) => (
              <div key={b.l} className="flex-1 flex flex-col items-center gap-1">
                <motion.div initial={{ height: 0 }} animate={{ height: `${(b.d / bMax) * 70}%` }} transition={{ duration: 0.4, delay: i * 0.04 }} className="w-7 rounded-t min-h-[3px]" style={{ background: '#7C3AED' }} />
              </div>
            ))}
          </div>
          <AxisFooter labels={PV_LABELS} legend={[{ label: 'Volume', color: '#7C3AED' }, { label: 'Trend', color: '#15803D' }]} />
        </div>
      );
    }

    // ── Scatter ──
    if (id === 'scatter') {
      return (
        <div className="flex flex-col justify-center h-full px-4 relative">
          <div className="absolute left-4 top-4 bottom-10 flex flex-col justify-between text-[9px] text-ink-400">
            {['High', '', 'Med', '', 'Low'].map((v,i) => <span key={i}>{v}</span>)}
          </div>
          <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`}>
            {/* Grid */}
            {[0.25, 0.5, 0.75].map(p => <line key={p} x1="40" y1={p * H} x2={W-10} y2={p * H} stroke="var(--color-canvas-border)" strokeWidth="0.5" />)}
            {[0.25, 0.5, 0.75].map(p => <line key={p} x1={40 + p * (W-50)} y1="10" x2={40 + p * (W-50)} y2={H-10} stroke="var(--color-canvas-border)" strokeWidth="0.5" />)}
            {PV_SCATTER.map(([x, y], i) => (
              <motion.circle key={i} cx={x} cy={y} r="6" fill="var(--color-brand-500)" fillOpacity="0.6" stroke="var(--color-brand-600)" strokeWidth="1.5"
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.04, type: 'spring' }} />
            ))}
          </svg>
          <AxisFooter labels={[]} legend={[{ label: 'Data Points', color: '#7C3AED' }]} />
        </div>
      );
    }

    // ── Waterfall ──
    if (id === 'waterfall') {
      let cumulative = 0;
      const wfData = PV_WATERFALL.map(w => {
        const start = w.type === 'total' ? 0 : cumulative;
        cumulative = w.type === 'total' ? w.v : cumulative + w.v;
        return { ...w, start, end: cumulative };
      });
      const wfMax = Math.max(...wfData.map(d => Math.max(d.start, d.end)));
      return (
        <div className="flex flex-col justify-end h-full px-6 pb-2">
          <div className="flex items-end gap-4 flex-1">
            {wfData.map((d, i) => {
              const bottom = (Math.min(d.start, d.end) / wfMax) * 70;
              const height = (Math.abs(d.end - d.start) / wfMax) * 70;
              const color = d.type === 'total' ? '#7C3AED' : d.type === 'up' ? '#15803D' : '#B42318';
              return (
                <div key={d.l} className="flex-1 flex flex-col items-center relative" style={{ height: '100%' }}>
                  <div className="flex-1" />
                  <motion.div
                    initial={{ height: 0 }} animate={{ height: `${height}%` }} transition={{ duration: 0.4, delay: i * 0.06 }}
                    className="w-10 rounded-t"
                    style={{ background: color, marginBottom: `${bottom}%` }}
                  />
                </div>
              );
            })}
          </div>
          <AxisFooter labels={PV_WATERFALL.map(w => w.l)} legend={[{ label: 'Increase', color: '#15803D' }, { label: 'Decrease', color: '#B42318' }, { label: 'Total', color: '#7C3AED' }]} />
        </div>
      );
    }

    // ── Table ──
    if (id === 'table') {
      return (
        <div className="flex flex-col h-full p-2">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-canvas-border">
                {['Invoice ID', 'Vendor', 'Amount', 'Status', 'Risk'].map(h => (
                  <th key={h} className="text-[11px] font-bold text-ink-500 uppercase tracking-wider px-3 py-2.5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PV_TABLE_ROWS.map((row, i) => (
                <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="border-b border-canvas-border/50 hover:bg-brand-50/30">
                  <td className="px-3 py-2.5 text-[12px] font-semibold text-brand-700">{row[0]}</td>
                  <td className="px-3 py-2.5 text-[12px] text-ink-700">{row[1]}</td>
                  <td className="px-3 py-2.5 text-[12px] font-medium text-ink-900">{row[2]}</td>
                  <td className="px-3 py-2.5"><span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${row[3] === 'Resolved' ? 'bg-green-50 text-green-700' : row[3] === 'Pending' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'}`}>{row[3]}</span></td>
                  <td className="px-3 py-2.5"><span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${row[4] === 'High' ? 'bg-red-50 text-red-700' : row[4] === 'Medium' ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700'}`}>{row[4]}</span></td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {axisCaption && <div className="text-[10px] text-ink-400 text-center mt-3">{axisCaption}</div>}
        </div>
      );
    }

    // ── Default fallback (any remaining bar variants) ──
    const bMax = Math.max(...PV_BARS.map(b => b.d));
    return (
      <div className="flex flex-col justify-end h-full px-4 pb-2">
        <div className="flex items-end gap-4 flex-1">
          {PV_BARS.map((b, i) => (
            <div key={b.l} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] text-ink-500">{b.d}</span>
              <motion.div initial={{ height: 0 }} animate={{ height: `${(b.d / bMax) * 80}%` }} transition={{ duration: 0.4, delay: i * 0.04 }} className="w-full rounded-t min-h-[3px]" style={{ background: '#7C3AED' }} />
            </div>
          ))}
        </div>
        <AxisFooter labels={PV_LABELS} legend={[{ label: 'Duplicates', color: '#7C3AED' }, { label: 'Resolved', color: '#0369A1' }, { label: 'Pending', color: '#B45309' }]} />
      </div>
    );
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.2 }}
            className="relative bg-canvas-elevated rounded-xl border border-canvas-border shadow-2xl flex flex-col overflow-hidden"
            style={{ width: 'min(1200px, 96vw)', height: 'min(775px, 92vh)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="shrink-0 flex items-center justify-between px-6 py-3 border-b border-canvas-border">
              <div className="flex items-center gap-2.5">
                <div className="bg-brand-50 rounded-lg size-7 flex items-center justify-center">
                  <BarChart3 size={14} className="text-brand-600" />
                </div>
                <span className="text-[15px] font-semibold text-ink-900">Add New Widget</span>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-2 transition-colors cursor-pointer">
                <X size={18} className="text-ink-500" />
              </button>
            </div>

            {/* Body — two columns */}
            <div className="flex flex-1 overflow-hidden min-h-0">
              {/* Left — Drop Zones + Preview */}
              <div className="flex-1 flex flex-col bg-surface-2/30 p-5 min-w-0 order-1 overflow-y-auto">
                {/* Drop Zones — row layout with left labels */}
                <div className="space-y-3 mb-4">
                  {/* Row 1: X-Axis */}
                  <div className="flex items-center gap-4">
                    <div className="w-[70px] shrink-0">
                      <span className="text-[12px] font-bold text-ink-700">{axisLabels.x}</span>
                    </div>
                    <DropZone
                      label=""
                      placeholder={selectedChart?.id === 'table' ? 'Drop columns here' : 'Drop a field here'}
                      active={dragOver === 'x'}
                      onDragOver={() => setDragOver('x')}
                      onDragLeave={() => setDragOver(null)}
                      onDrop={e => handleDrop('x', e)}
                      fields={xFields}
                      getLabel={getFieldLabel}
                      onRemove={removeXField}
                      className="flex-1"
                    />
                  </div>

                  {/* Row 2: Y-Axis + Y-Index */}
                  <div className="flex items-center gap-4">
                    <div className="w-[70px] shrink-0">
                      <span className="text-[12px] font-bold text-ink-700">{axisLabels.y}</span>
                    </div>
                    <div className="flex-1 flex gap-3">
                      <DropZone
                        label=""
                        placeholder="Drop a field here"
                        active={dragOver === 'y'}
                        onDragOver={() => setDragOver('y')}
                        onDragLeave={() => setDragOver(null)}
                        onDrop={e => handleDrop('y', e)}
                        fields={yFields}
                        getLabel={getFieldLabel}
                        onRemove={removeYField}
                        showAgg
                        yAggs={yAggs}
                        aggDropdownOpen={aggDropdownOpen}
                        setAggDropdownOpen={setAggDropdownOpen}
                        setYAggs={setYAggs}
                        className="flex-1"
                      />
                      {showYIndex && (
                        <DropZone
                          label=""
                          placeholder="Y-axis Index"
                          active={dragOver === 'yindex'}
                          onDragOver={() => setDragOver('yindex')}
                          onDragLeave={() => setDragOver(null)}
                          onDrop={e => handleDrop('yindex', e)}
                          fields={yIndexFields}
                          getLabel={getFieldLabel}
                          onRemove={removeYIndexField}
                          className="flex-1"
                        />
                      )}
                    </div>
                  </div>

                  {/* Suggestion banner */}
                  {(yFields.length >= 2 || yIndexFields.length > 0) && (
                    <div className="flex items-center gap-3 px-4 py-2.5 bg-surface-2 rounded-lg ml-[86px]">
                      <Sparkles size={14} className="text-brand-600 shrink-0" />
                      <div className="flex items-center gap-1.5">
                        {[
                          { id: 'clustered-col', label: 'Bar', icon: BarChart3 },
                          { id: 'line', label: 'Line', icon: LineChart },
                          { id: 'area', label: 'Area', icon: AreaChart },
                        ].map(s => (
                          <button
                            key={s.id}
                            onClick={() => { const ct = CHART_TYPES.find(c => c.id === s.id); if (ct) setSelectedChart(ct); }}
                            className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium cursor-pointer transition-colors ${
                              selectedChart?.id === s.id ? 'bg-brand-600 text-white' : 'text-ink-600 hover:bg-brand-50'
                            }`}
                          >
                            <s.icon size={11} /> {s.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Row 3: Legends */}
                  {showLegend && (
                    <div className="flex items-center gap-4">
                      <div className="w-[70px] shrink-0">
                        <span className="text-[12px] font-bold text-ink-700">Legends</span>
                      </div>
                      <DropZone
                        label=""
                        placeholder="Drop a field here"
                        active={dragOver === 'legend'}
                        onDragOver={() => setDragOver('legend')}
                        onDragLeave={() => setDragOver(null)}
                        onDrop={e => handleDrop('legend', e)}
                        fields={legendFields}
                        getLabel={getFieldLabel}
                        onRemove={removeLegendField}
                        className="flex-1"
                      />
                    </div>
                  )}
                </div>

                {/* Preview */}
                <div className="flex-1 bg-canvas-elevated rounded-xl border border-canvas-border overflow-hidden flex flex-col min-h-[300px]">
                  <div className="px-5 py-3 border-b border-canvas-border/50 flex items-center justify-between">
                    <span className="text-[12px] font-semibold text-ink-500 uppercase tracking-wider">Preview</span>
                    {selectedChart && <span className="text-[12px] text-brand-600 font-medium">{selectedChart.title}</span>}
                  </div>
                  <div className="flex-1 p-4">
                    {renderPreview()}
                  </div>
                </div>
              </div>

              {/* Right — Sidebar config */}
              <div className="w-[340px] shrink-0 border-l border-canvas-border flex flex-col overflow-hidden order-2 bg-surface-2/20">
                {/* Tab switcher */}
                <div className="shrink-0 border-b border-canvas-border px-3 py-1.5">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveTab('data')}
                      className={`flex-1 flex items-center justify-center gap-2 font-medium rounded-md px-4 py-1.5 text-[13px] transition-colors cursor-pointer ${
                        activeTab === 'data' ? 'text-brand-700 bg-brand-50' : 'text-ink-600 hover:bg-surface-2'
                      }`}
                    >
                      <Settings size={14} />
                      Data Source
                    </button>
                    <button
                      onClick={() => setActiveTab('format')}
                      className={`flex-1 flex items-center justify-center gap-2 font-medium rounded-md px-4 py-1.5 text-[13px] transition-colors cursor-pointer ${
                        activeTab === 'format' ? 'text-brand-700 bg-brand-50' : 'text-ink-600 hover:bg-surface-2'
                      }`}
                    >
                      <Settings size={14} />
                      Customize
                    </button>
                  </div>
                </div>

                {/* Scrollable config content */}
                <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3">
                  {activeTab === 'data' && (
                    <>
                      {/* Chart Type Section */}
                      <div className="bg-canvas-elevated rounded-lg border border-canvas-border overflow-hidden">
                        <button
                          onClick={() => setChartTypeCollapsed(!chartTypeCollapsed)}
                          className="w-full flex items-center justify-between px-3 py-2.5 bg-brand-50/50 border-b border-canvas-border/50 hover:bg-brand-50 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <BarChart3 size={12} className="text-brand-600" />
                            <span className="text-[11px] font-bold uppercase tracking-wider text-ink-700">
                              {selectedChart ? selectedChart.title : 'Chart Type'}
                            </span>
                          </div>
                          <ChevronDown size={14} className={`text-brand-600 transition-transform ${chartTypeCollapsed ? '' : 'rotate-180'}`} />
                        </button>
                        {!chartTypeCollapsed && (
                          <div className="max-h-[280px] overflow-y-auto py-1">
                            {CHART_TYPES.map(ct => (
                              <button
                                key={ct.id}
                                onClick={() => setSelectedChart(ct)}
                                className={`w-full flex items-center gap-2.5 px-3 py-2 text-[12px] transition-colors cursor-pointer ${
                                  selectedChart?.id === ct.id ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-ink-700 hover:bg-surface-2'
                                }`}
                              >
                                <ct.icon size={14} className={selectedChart?.id === ct.id ? 'text-brand-600' : 'text-ink-400'} />
                                {ct.title}
                                {selectedChart?.id === ct.id && <CheckCircle2 size={13} className="ml-auto text-brand-600" />}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Data Source Section */}
                      <div className="bg-canvas-elevated rounded-lg border border-canvas-border overflow-hidden">
                        <div className="flex items-center justify-between px-3 py-2.5 bg-brand-50/50 border-b border-canvas-border/50">
                          <div className="flex items-center gap-2">
                            <FileText size={12} className="text-brand-600" />
                            <span className="text-[11px] font-bold uppercase tracking-wider text-ink-700">Data Source</span>
                          </div>
                          <button className="bg-brand-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded cursor-pointer hover:bg-brand-500 transition-colors">
                            Add Data
                          </button>
                        </div>

                        {/* Search */}
                        <div className="px-2.5 pt-2.5 pb-2">
                          <div className="relative">
                            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-400" />
                            <input
                              type="text"
                              placeholder="Search fields..."
                              value={fieldSearch}
                              onChange={e => setFieldSearch(e.target.value)}
                              className="w-full h-8 pl-8 pr-3 bg-canvas-elevated border border-canvas-border rounded-md text-[12px] text-ink-800 placeholder:text-ink-400 outline-none focus:border-brand-400 transition-colors"
                            />
                          </div>
                        </div>

                        {/* File 1: Dimensions */}
                        <div className="mx-2.5 mb-2 bg-canvas-elevated rounded-md border border-canvas-border overflow-hidden">
                          <button
                            onClick={() => setFile1Open(!file1Open)}
                            className="w-full flex items-center justify-between px-2.5 py-2 bg-brand-50/30 border-b border-canvas-border/50 hover:bg-brand-50 transition-colors cursor-pointer"
                          >
                            <div className="flex items-center gap-1.5">
                              <FileText size={12} className="text-brand-600" />
                              <span className="text-[11px] font-semibold text-ink-800">Invoice_Master.xlsx</span>
                            </div>
                            <ChevronDown size={12} className={`text-brand-600 transition-transform ${file1Open ? 'rotate-180' : ''}`} />
                          </button>
                          {file1Open && (
                            <div className="px-1.5 py-1">
                              {dimensionFields.map(f => (
                                <div
                                  key={f.id}
                                  draggable
                                  onDragStart={e => { e.dataTransfer.effectAllowed = 'copy'; e.dataTransfer.setData('fieldId', f.id); }}
                                  className="flex items-center gap-2 px-2 py-1.5 rounded cursor-grab hover:bg-brand-50/50 transition-colors active:cursor-grabbing"
                                >
                                  <svg className="shrink-0 size-3 text-ink-300" viewBox="0 0 12 12" fill="currentColor">
                                    <circle cx="4" cy="3" r="1" /><circle cx="8" cy="3" r="1" />
                                    <circle cx="4" cy="6" r="1" /><circle cx="8" cy="6" r="1" />
                                    <circle cx="4" cy="9" r="1" /><circle cx="8" cy="9" r="1" />
                                  </svg>
                                  <span className="text-[12px] text-ink-700">{f.label}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* File 2: Measures */}
                        <div className="mx-2.5 mb-2.5 bg-canvas-elevated rounded-md border border-canvas-border overflow-hidden">
                          <button
                            onClick={() => setFile2Open(!file2Open)}
                            className="w-full flex items-center justify-between px-2.5 py-2 bg-brand-50/30 border-b border-canvas-border/50 hover:bg-brand-50 transition-colors cursor-pointer"
                          >
                            <div className="flex items-center gap-1.5">
                              <FileText size={12} className="text-brand-600" />
                              <span className="text-[11px] font-semibold text-ink-800">Vendor_Finance.xlsx</span>
                            </div>
                            <ChevronDown size={12} className={`text-brand-600 transition-transform ${file2Open ? 'rotate-180' : ''}`} />
                          </button>
                          {file2Open && (
                            <div className="px-1.5 py-1">
                              {measureFields.map(f => (
                                <div
                                  key={f.id}
                                  draggable
                                  onDragStart={e => { e.dataTransfer.effectAllowed = 'copy'; e.dataTransfer.setData('fieldId', f.id); }}
                                  className="flex items-center gap-2 px-2 py-1.5 rounded cursor-grab hover:bg-brand-50/50 transition-colors active:cursor-grabbing"
                                >
                                  <svg className="shrink-0 size-3 text-ink-300" viewBox="0 0 12 12" fill="currentColor">
                                    <circle cx="4" cy="3" r="1" /><circle cx="8" cy="3" r="1" />
                                    <circle cx="4" cy="6" r="1" /><circle cx="8" cy="6" r="1" />
                                    <circle cx="4" cy="9" r="1" /><circle cx="8" cy="9" r="1" />
                                  </svg>
                                  <span className="text-[12px] text-ink-700">{f.label}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Widget Info */}
                      <div className="space-y-2.5">
                        <input
                          type="text"
                          value={widgetName}
                          onChange={e => setWidgetName(e.target.value)}
                          placeholder="Widget name"
                          className="w-full px-3 py-2 text-[12px] border border-canvas-border rounded-lg bg-canvas-elevated text-ink-800 placeholder:text-ink-400 outline-none focus:border-brand-400 transition-colors"
                        />
                        <input
                          type="text"
                          value={widgetDesc}
                          onChange={e => setWidgetDesc(e.target.value)}
                          placeholder="Description (optional)"
                          className="w-full px-3 py-2 text-[12px] border border-canvas-border rounded-lg bg-canvas-elevated text-ink-800 placeholder:text-ink-400 outline-none focus:border-brand-400 transition-colors"
                        />
                      </div>
                    </>
                  )}

                  {activeTab === 'format' && (
                    <div className="space-y-3">
                      {/* 1. General — Color + B/I/U */}
                      <FmtSection title="General" icon={<Settings size={12} />} open={generalOpen} onToggle={() => setGeneralOpen(!generalOpen)}>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            {['#6a12cd', '#3b82f6', '#0ea5e9', '#06b6d4', '#14b8a6', '#10b981', '#84cc16', '#f59e0b', '#f97316'].map(c => (
                              <button
                                key={c}
                                onClick={() => setSelectedBaseColor(c)}
                                className={`size-7 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                                  selectedBaseColor === c ? 'ring-2 ring-brand-600 ring-offset-2' : 'hover:ring-2 hover:ring-brand-400/40 hover:ring-offset-2'
                                }`}
                                style={{ background: c }}
                              >
                                {selectedBaseColor === c && (
                                  <svg viewBox="0 0 12 12" fill="none" className="size-3.5"><path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                )}
                              </button>
                            ))}
                            {/* Hex display */}
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-canvas-elevated border border-canvas-border rounded-md">
                              <div className="size-3 rounded-sm" style={{ background: selectedBaseColor }} />
                              <span className="text-[11px] font-medium text-ink-700 uppercase">{selectedBaseColor}</span>
                            </div>
                          </div>
                          <BIUButtons bold={isBold} italic={isItalic} underline={isUnderline} onBold={() => setIsBold(!isBold)} onItalic={() => setIsItalic(!isItalic)} onUnderline={() => setIsUnderline(!isUnderline)} />
                        </div>
                      </FmtSection>

                      {/* 2. X Axis */}
                      <FmtSection title="X Axis" icon={<TrendingUp size={12} />} open={xAxisFmtOpen} onToggle={() => setXAxisFmtOpen(!xAxisFmtOpen)}>
                        <div className="space-y-3">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-medium text-ink-600">Title</label>
                            <input type="text" value={xAxisTitle} onChange={e => setXAxisTitle(e.target.value)} placeholder="Enter X Axis Title" className="w-full px-3 py-2 text-[12px] bg-canvas-elevated border border-canvas-border rounded-lg text-ink-800 placeholder:text-ink-400 outline-none focus:border-brand-400 transition-colors" />
                          </div>
                          <BIUButtons bold={xBold} italic={xItalic} underline={xUnder} onBold={() => setXBold(!xBold)} onItalic={() => setXItalic(!xItalic)} onUnderline={() => setXUnder(!xUnder)} />
                        </div>
                      </FmtSection>

                      {/* 3. Y Axis */}
                      <FmtSection title="Y Axis" icon={<TrendingDown size={12} />} open={yAxisFmtOpen} onToggle={() => setYAxisFmtOpen(!yAxisFmtOpen)}>
                        <div className="space-y-3">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-medium text-ink-600">Title</label>
                            <input type="text" value={yAxisTitle} onChange={e => setYAxisTitle(e.target.value)} placeholder="Enter Y Axis Title" className="w-full px-3 py-2 text-[12px] bg-canvas-elevated border border-canvas-border rounded-lg text-ink-800 placeholder:text-ink-400 outline-none focus:border-brand-400 transition-colors" />
                          </div>
                          <BIUButtons bold={yBold} italic={yItalic} underline={yUnder} onBold={() => setYBold(!yBold)} onItalic={() => setYItalic(!yItalic)} onUnderline={() => setYUnder(!yUnder)} />
                        </div>
                      </FmtSection>

                      {/* 3b. Y-axis Index — only for clustered-col, line, waterfall */}
                      {showYIndex && (
                        <FmtSection title="Y-axis Index" icon={<TrendingDown size={12} />} open={yIndexFmtOpen} onToggle={() => setYIndexFmtOpen(!yIndexFmtOpen)}>
                          <div className="space-y-3">
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[11px] font-medium text-ink-600">Title</label>
                              <input type="text" value={yIndexTitle} onChange={e => setYIndexTitle(e.target.value)} placeholder="Enter Y-axis Index Title" className="w-full px-3 py-2 text-[12px] bg-canvas-elevated border border-canvas-border rounded-lg text-ink-800 placeholder:text-ink-400 outline-none focus:border-brand-400 transition-colors" />
                            </div>
                            <BIUButtons bold={yIdxBold} italic={yIdxItalic} underline={yIdxUnder} onBold={() => setYIdxBold(!yIdxBold)} onItalic={() => setYIdxItalic(!yIdxItalic)} onUnderline={() => setYIdxUnder(!yIdxUnder)} />
                          </div>
                        </FmtSection>
                      )}

                      {/* 4. Legend */}
                      <FmtSection title="Legend" icon={<FileText size={12} />} open={legendsFmtOpen} onToggle={() => setLegendsFmtOpen(!legendsFmtOpen)}>
                        <div className="space-y-3">
                          {/* Position dropdown */}
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-semibold text-ink-700">Position</label>
                            <select value={legendPos} onChange={e => setLegendPos(e.target.value)} className="w-full px-3 py-2 text-[12px] bg-canvas-elevated border border-canvas-border rounded-lg text-ink-800 outline-none focus:border-brand-400 cursor-pointer appearance-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M3 5L6 8L9 5' stroke='%239CA3AF' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}>
                              <option value="top">Top</option>
                              <option value="right">Right</option>
                              <option value="bottom">Bottom</option>
                              <option value="left">Left</option>
                            </select>
                          </div>
                          {/* Legend Format + Text Color */}
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[11px] font-semibold text-ink-700">Legend Format</label>
                              <div className="flex items-center bg-canvas-elevated rounded-md border border-canvas-border overflow-hidden">
                                <button onClick={() => setIsBold(!isBold)} className={`flex-1 flex items-center justify-center px-3 py-2 border-r border-canvas-border transition-colors cursor-pointer ${isBold ? 'bg-brand-600 text-white' : 'text-ink-600 hover:bg-brand-50'}`}>
                                  <span className="text-[12px] font-bold">B</span>
                                </button>
                                <button onClick={() => setIsItalic(!isItalic)} className={`flex-1 flex items-center justify-center px-3 py-2 transition-colors cursor-pointer ${isItalic ? 'bg-brand-600 text-white' : 'text-ink-600 hover:bg-brand-50'}`}>
                                  <span className="text-[12px] italic">I</span>
                                </button>
                              </div>
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[11px] font-semibold text-ink-700">Text Color</label>
                              <div className="flex items-center gap-2 px-3 py-1.5 bg-canvas-elevated border border-canvas-border rounded-lg cursor-pointer">
                                <div className="size-4 rounded-sm border border-canvas-border" style={{ background: selectedBaseColor }} />
                                <span className="text-[11px] font-medium text-ink-700 flex-1 uppercase">{selectedBaseColor}</span>
                                <ChevronDown size={12} className="text-ink-400" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </FmtSection>

                      {/* 5. Data Labels — toggle in header, no content */}
                      <div className="bg-canvas-elevated rounded-lg border border-canvas-border overflow-hidden">
                        <div className="flex items-center justify-between px-3 py-2.5 bg-brand-50/30">
                          <div className="flex items-center gap-2">
                            <span className="text-brand-600"><FileText size={12} /></span>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-ink-700">Data Labels</span>
                          </div>
                          <button onClick={() => setDataLabelShow(!dataLabelShow)} className={`relative w-9 h-5 rounded-full transition-colors cursor-pointer ${dataLabelShow ? 'bg-brand-600' : 'bg-ink-200'}`}>
                            <div className={`absolute top-0.5 size-4 bg-white rounded-full shadow transition-all ${dataLabelShow ? 'left-[18px]' : 'left-0.5'}`} />
                          </button>
                        </div>
                      </div>

                      {/* 6. Range (Y Axis) */}
                      <FmtSection title="Range (Y Axis)" icon={<TrendingDown size={12} />} open={rangeFmtOpen} onToggle={() => setRangeFmtOpen(!rangeFmtOpen)}>
                        <div className="space-y-3">
                          {/* Min / Max always visible */}
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[12px] font-medium text-ink-700">Minimum</label>
                              <input type="text" value={rangeMin} onChange={e => setRangeMin(e.target.value)} placeholder="Auto" className="w-full px-3 py-2 text-[12px] bg-canvas-elevated border border-canvas-border rounded-lg text-ink-800 placeholder:text-ink-400 outline-none focus:border-brand-400 transition-colors" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[12px] font-medium text-ink-700">Maximum</label>
                              <input type="text" value={rangeMax} onChange={e => setRangeMax(e.target.value)} placeholder="Auto" className="w-full px-3 py-2 text-[12px] bg-canvas-elevated border border-canvas-border rounded-lg text-ink-800 placeholder:text-ink-400 outline-none focus:border-brand-400 transition-colors" />
                            </div>
                          </div>
                          {/* Invert Range toggle */}
                          <div className="flex items-center justify-between">
                            <span className="text-[12px] font-medium text-ink-700">Invert Range</span>
                            <button onClick={() => setAutoScale(!autoScale)} className={`relative w-9 h-5 rounded-full transition-colors cursor-pointer ${autoScale ? 'bg-brand-600' : 'bg-ink-200'}`}>
                              <div className={`absolute top-0.5 size-4 bg-white rounded-full shadow transition-all ${autoScale ? 'left-[18px]' : 'left-0.5'}`} />
                            </button>
                          </div>
                        </div>
                      </FmtSection>

                      {/* 6b. Y-axis Index Range — only for clustered-col, line, waterfall */}
                      {showYIndex && (
                        <FmtSection title="Range (Y-axis Index)" icon={<TrendingDown size={12} />} open={yIndexRangeFmtOpen} onToggle={() => setYIndexRangeFmtOpen(!yIndexRangeFmtOpen)}>
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                              <div className="flex flex-col gap-1.5">
                                <label className="text-[12px] font-medium text-ink-700">Minimum</label>
                                <input type="text" value={yIndexRangeMin} onChange={e => setYIndexRangeMin(e.target.value)} placeholder="Auto" className="w-full px-3 py-2 text-[12px] bg-canvas-elevated border border-canvas-border rounded-lg text-ink-800 placeholder:text-ink-400 outline-none focus:border-brand-400 transition-colors" />
                              </div>
                              <div className="flex flex-col gap-1.5">
                                <label className="text-[12px] font-medium text-ink-700">Maximum</label>
                                <input type="text" value={yIndexRangeMax} onChange={e => setYIndexRangeMax(e.target.value)} placeholder="Auto" className="w-full px-3 py-2 text-[12px] bg-canvas-elevated border border-canvas-border rounded-lg text-ink-800 placeholder:text-ink-400 outline-none focus:border-brand-400 transition-colors" />
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-[12px] font-medium text-ink-700">Invert Range</span>
                              <button onClick={() => setYIndexInvert(!yIndexInvert)} className={`relative w-9 h-5 rounded-full transition-colors cursor-pointer ${yIndexInvert ? 'bg-brand-600' : 'bg-ink-200'}`}>
                                <div className={`absolute top-0.5 size-4 bg-white rounded-full shadow transition-all ${yIndexInvert ? 'left-[18px]' : 'left-0.5'}`} />
                              </button>
                            </div>
                          </div>
                        </FmtSection>
                      )}

                      {/* 7. Conditional Formatting — full rule builder */}
                      <FmtSection title="Conditional Formatting" icon={<AlertTriangle size={12} />} open={condFmtOpen} onToggle={() => setCondFmtOpen(!condFmtOpen)}>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[12px] font-bold text-brand-700">Rules</span>
                            <span className="text-[11px] text-ink-500">{condRules.length} active</span>
                          </div>

                          {condRules.map((rule, idx) => (
                            <div key={rule.id} className="bg-canvas-elevated border border-canvas-border rounded-xl p-3.5 space-y-3 relative">
                              <div className="flex items-center justify-between">
                                <span className="text-[12px] font-bold text-ink-800">Rule {idx + 1}</span>
                                {condRules.length > 1 && (
                                  <button onClick={() => setCondRules(prev => prev.filter(r => r.id !== rule.id))} className="p-1 rounded hover:bg-red-50 cursor-pointer"><X size={12} className="text-ink-400 hover:text-red-500" /></button>
                                )}
                              </div>

                              {/* Evaluate Field */}
                              <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-ink-700">Evaluate Field</label>
                                <select value={rule.field} onChange={e => setCondRules(prev => prev.map(r => r.id === rule.id ? { ...r, field: e.target.value } : r))} className="w-full px-3 py-2 text-[12px] bg-surface-2/50 border border-canvas-border rounded-lg text-ink-800 outline-none focus:border-brand-400 cursor-pointer appearance-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M3 5L6 8L9 5' stroke='%239CA3AF' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}>
                                  <option value="">Select field to evaluate...</option>
                                  {xFields.length > 0 && <optgroup label="X-Axis">{xFields.map(f => <option key={f} value={f}>{getFieldLabel(f)}</option>)}</optgroup>}
                                  {yFields.length > 0 && <optgroup label="Y-Axis">{yFields.map(f => <option key={f} value={f}>{getFieldLabel(f)}</option>)}</optgroup>}
                                  {xFields.length === 0 && yFields.length === 0 && <>
                                    <option value="inv_amount">Invoice Amount (₹)</option>
                                    <option value="dup_count">Duplicate Count</option>
                                    <option value="dup_score">Duplicate Score (%)</option>
                                    <option value="risk_amt">Amount at Risk (₹)</option>
                                  </>}
                                </select>
                              </div>

                              {/* Condition */}
                              <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-ink-700">Condition</label>
                                <select value={rule.condition} onChange={e => setCondRules(prev => prev.map(r => r.id === rule.id ? { ...r, condition: e.target.value } : r))} className="w-full px-3 py-2 text-[12px] bg-surface-2/50 border border-canvas-border rounded-lg text-ink-800 outline-none focus:border-brand-400 cursor-pointer appearance-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M3 5L6 8L9 5' stroke='%239CA3AF' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}>
                                  <option value="isNull">Is null</option>
                                  <option value="isNotNull">Is not null</option>
                                  <option value="greater">Greater than</option>
                                  <option value="greaterEqual">Greater than or equal</option>
                                  <option value="less">Less than</option>
                                  <option value="lessEqual">Less than or equal</option>
                                  <option value="equal">Is equal to</option>
                                  <option value="notEqual">Is not equal</option>
                                  <option value="between">Is between</option>
                                  <option value="contains">Contains</option>
                                  <option value="notContain">Does not contain</option>
                                </select>
                              </div>

                              {/* Value + Color */}
                              <div className="grid grid-cols-2 gap-2.5">
                                <div className="space-y-1.5">
                                  <label className="text-[11px] font-bold text-ink-700">Value</label>
                                  <input type="text" value={rule.value} onChange={e => setCondRules(prev => prev.map(r => r.id === rule.id ? { ...r, value: e.target.value } : r))} placeholder="Enter value" className="w-full px-3 py-2 text-[12px] bg-surface-2/50 border border-canvas-border rounded-lg text-ink-800 placeholder:text-ink-400 outline-none focus:border-brand-400" />
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-[11px] font-bold text-ink-700">Color</label>
                                  <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-2/50 border border-canvas-border rounded-lg">
                                    <div className="size-5 rounded shrink-0 border border-canvas-border" style={{ background: rule.color }} />
                                    <span className="text-[11px] font-medium text-ink-700 uppercase flex-1">{rule.color}</span>
                                    <ChevronDown size={12} className="text-ink-400" />
                                  </div>
                                  {/* Color swatches row */}
                                  <div className="flex gap-1.5 mt-1.5">
                                    {['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#6a12cd', '#ec4899'].map(c => (
                                      <button
                                        key={c}
                                        onClick={() => setCondRules(prev => prev.map(r => r.id === rule.id ? { ...r, color: c } : r))}
                                        className={`size-5 rounded-full flex items-center justify-center cursor-pointer transition-all shrink-0 ${rule.color === c ? 'ring-2 ring-brand-600 ring-offset-1' : 'hover:ring-2 hover:ring-ink-300 hover:ring-offset-1'}`}
                                        style={{ background: c }}
                                      >
                                        {rule.color === c && <svg viewBox="0 0 12 12" fill="none" className="size-2.5"><path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}

                          <button
                            onClick={() => setCondRules(prev => [...prev, { id: String(Date.now()), field: '', condition: 'greater', value: '', color: '#ef4444' }])}
                            className="w-full flex items-center justify-center gap-2 px-3 py-3 border-2 border-dashed border-brand-300 rounded-xl text-[12px] font-semibold text-brand-600 hover:bg-brand-50 transition-colors cursor-pointer"
                          >
                            <Plus size={14} /> Add Condition
                          </button>
                        </div>
                      </FmtSection>

                      {/* 8. Customize Data Colors */}
                      <FmtSection title="Customize Data Colors" icon={<BarChart3 size={12} />} open={seriesFmtOpen} onToggle={() => setSeriesFmtOpen(!seriesFmtOpen)}>
                        <div className="space-y-3">
                          {/* Categories dropdown */}
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[12px] font-semibold text-ink-700">Categories</label>
                            <select className="w-full px-3 py-2 text-[12px] bg-canvas-elevated border border-canvas-border rounded-lg text-ink-800 outline-none focus:border-brand-400 cursor-pointer appearance-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M3 5L6 8L9 5' stroke='%239CA3AF' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}>
                              <option value="">{yFields.length > 0 ? 'Select a series...' : 'No series available'}</option>
                              {yFields.map(f => <option key={f} value={f}>{getFieldLabel(f)}</option>)}
                            </select>
                          </div>
                          {/* Color + Spacing */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[11px] font-semibold text-ink-700">Color</label>
                              <div className="flex items-center gap-2 px-3 py-1.5 bg-canvas-elevated border border-canvas-border rounded-lg cursor-pointer">
                                <div className="size-5 rounded shrink-0 border border-canvas-border" style={{ background: selectedBaseColor }} />
                                <span className="text-[11px] font-medium text-ink-700 flex-1">
                                  {{'#6a12cd':'Purple','#0ea5e9':'Blue','#10b981':'Green','#f59e0b':'Orange','#ef4444':'Red','#ec4899':'Pink','#8b5cf6':'Violet','#14b8a6':'Teal','#f97316':'Orange Red'}[selectedBaseColor] || 'Purple'}
                                </span>
                                <ChevronDown size={12} className="text-ink-400" />
                              </div>
                              <div className="flex gap-1.5 mt-1">
                                {[{c:'#6a12cd',n:'Purple'},{c:'#0ea5e9',n:'Blue'},{c:'#10b981',n:'Green'},{c:'#f59e0b',n:'Orange'},{c:'#ef4444',n:'Red'},{c:'#ec4899',n:'Pink'},{c:'#8b5cf6',n:'Violet'},{c:'#14b8a6',n:'Teal'},{c:'#f97316',n:'OrangeRed'}].map(({c}) => (
                                  <button
                                    key={c}
                                    onClick={() => setSelectedBaseColor(c)}
                                    className={`size-5 rounded-full flex items-center justify-center cursor-pointer transition-all shrink-0 ${selectedBaseColor === c ? 'ring-2 ring-brand-600 ring-offset-1' : 'hover:ring-2 hover:ring-ink-300 hover:ring-offset-1'}`}
                                    style={{ background: c }}
                                  >
                                    {selectedBaseColor === c && <svg viewBox="0 0 12 12" fill="none" className="size-2.5"><path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[11px] font-semibold text-ink-700">Spacing</label>
                              <select className="w-full px-3 py-2 text-[12px] bg-canvas-elevated border border-canvas-border rounded-lg text-ink-800 outline-none focus:border-brand-400 cursor-pointer appearance-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M3 5L6 8L9 5' stroke='%239CA3AF' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}>
                                <option value="0">0%</option>
                                <option value="10">10%</option>
                                <option value="20">20%</option>
                                <option value="30">30%</option>
                                <option value="40">40%</option>
                                <option value="50">50%</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </FmtSection>
                    </div>
                  )}
                </div>

                {/* Footer — Add button */}
                <div className="shrink-0 border-t border-canvas-border px-4 py-3">
                  <button
                    onClick={handleAdd}
                    disabled={!selectedChart}
                    className="w-full py-2.5 bg-brand-600 hover:bg-brand-500 disabled:bg-ink-200 text-white rounded-lg text-[13px] font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed"
                  >
                    Add to Dashboard
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Filter Panel ───────────────────────────────────────────────────────────

const DATE_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: 'last-7-days', label: 'Last 7 Days' },
  { value: 'last-30-days', label: 'Last 30 Days' },
  { value: 'last-quarter', label: 'Last Quarter' },
  { value: 'last-year', label: 'Last Year' },
];

const STATUS_FILTER_OPTIONS = ['Compliant', 'Non-Compliant', 'Under Review', 'Pending', 'Flagged'];
const RISK_FILTER_OPTIONS = ['Critical', 'High', 'Medium', 'Low'];
const DEPT_FILTER_OPTIONS = ['Finance', 'Procurement', 'IT', 'Legal', 'Operations', 'HR', 'Sales'];

function FilterSection({ title, icon, isActive, onClear, children, defaultOpen = true }: {
  title: string;
  icon: React.ReactNode;
  isActive?: boolean;
  onClear?: () => void;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`rounded-xl border transition-all overflow-hidden ${isActive ? 'border-brand-200 bg-brand-50/50' : 'border-canvas-border bg-canvas-elevated'}`}>
      <button
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-surface-2 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <span className={isActive ? 'text-brand-600' : 'text-ink-400'}>{icon}</span>
          <span className={`text-[11px] font-bold uppercase tracking-wider ${isActive ? 'text-brand-700' : 'text-ink-500'}`}>{title}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {isActive && onClear && (
            <button
              onClick={(e) => { e.stopPropagation(); onClear(); }}
              className="text-[11px] font-semibold text-ink-400 hover:text-brand-600 px-1.5 py-0.5 rounded hover:bg-brand-50 transition-colors cursor-pointer"
            >Clear</button>
          )}
          <ChevronDown size={13} className={`text-ink-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3 pt-1">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CheckboxItem({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-surface-2 transition-colors cursor-pointer text-left"
    >
      <div className={`size-4 rounded border-[1.5px] flex items-center justify-center shrink-0 transition-colors ${
        checked ? 'border-brand-600 bg-brand-600' : 'border-ink-300 bg-white'
      }`}>
        {checked && (
          <svg viewBox="0 0 12 12" fill="none" className="size-2.5">
            <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <span className={`text-[12px] ${checked ? 'text-ink-900 font-medium' : 'text-ink-600'}`}>{label}</span>
    </button>
  );
}

function FilterPanel({
  open, onClose,
  dateRange, onDateRangeChange,
  status, onStatusChange,
  risk, onRiskChange,
  department, onDepartmentChange,
  onResetAll,
}: {
  open: boolean;
  onClose: () => void;
  dateRange: string;
  onDateRangeChange: (v: string) => void;
  status: string[];
  onStatusChange: (v: string[]) => void;
  risk: string[];
  onRiskChange: (v: string[]) => void;
  department: string[];
  onDepartmentChange: (v: string[]) => void;
  onResetAll: () => void;
}) {
  const toggleItem = (arr: string[], item: string) =>
    arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item];

  const hasAny = dateRange !== 'last-30-days' || status.length > 0 || risk.length > 0 || department.length > 0;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/10"
            onClick={onClose}
          />
          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-[340px] z-50 bg-canvas border-l border-canvas-border shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-canvas-border shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-brand-50">
                  <Filter size={14} className="text-brand-600" />
                </div>
                <span className="text-[14px] font-semibold text-ink-900">Filters</span>
              </div>
              <div className="flex items-center gap-2">
                {hasAny && (
                  <button onClick={onResetAll} className="text-[11px] font-semibold text-ink-400 hover:text-brand-600 px-2 py-1 rounded-lg hover:bg-brand-50 transition-colors cursor-pointer">
                    Reset all
                  </button>
                )}
                <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-2 transition-colors cursor-pointer">
                  <X size={16} className="text-ink-500" />
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {/* Date Range */}
              <FilterSection
                title="Date Range"
                icon={<Clock size={14} />}
                isActive={dateRange !== 'last-30-days'}
                onClear={() => onDateRangeChange('last-30-days')}
              >
                <div className="space-y-0.5">
                  {DATE_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => onDateRangeChange(opt.value)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[12px] transition-colors cursor-pointer ${
                        dateRange === opt.value
                          ? 'bg-brand-600 text-white font-medium'
                          : 'text-ink-600 hover:bg-surface-2'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </FilterSection>

              {/* Status */}
              <FilterSection
                title="Status"
                icon={<Shield size={14} />}
                isActive={status.length > 0}
                onClear={() => onStatusChange([])}
              >
                <div className="space-y-0.5">
                  {STATUS_FILTER_OPTIONS.map(opt => (
                    <CheckboxItem
                      key={opt}
                      label={opt}
                      checked={status.includes(opt)}
                      onChange={() => onStatusChange(toggleItem(status, opt))}
                    />
                  ))}
                </div>
              </FilterSection>

              {/* Risk Level */}
              <FilterSection
                title="Risk Level"
                icon={<AlertTriangle size={14} />}
                isActive={risk.length > 0}
                onClear={() => onRiskChange([])}
              >
                <div className="space-y-0.5">
                  {RISK_FILTER_OPTIONS.map(opt => (
                    <CheckboxItem
                      key={opt}
                      label={opt}
                      checked={risk.includes(opt)}
                      onChange={() => onRiskChange(toggleItem(risk, opt))}
                    />
                  ))}
                </div>
              </FilterSection>

              {/* Department */}
              <FilterSection
                title="Department"
                icon={<Package size={14} />}
                isActive={department.length > 0}
                onClear={() => onDepartmentChange([])}
                defaultOpen={false}
              >
                <div className="space-y-0.5">
                  {DEPT_FILTER_OPTIONS.map(opt => (
                    <CheckboxItem
                      key={opt}
                      label={opt}
                      checked={department.includes(opt)}
                      onChange={() => onDepartmentChange(toggleItem(department, opt))}
                    />
                  ))}
                </div>
              </FilterSection>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Drill Icons ────────────────────────────────────────────────────────────

function IconDrillUp() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="size-4">
      <path d="M8 12V4" /><path d="M5 7L8 4L11 7" />
    </svg>
  );
}

function IconDrillDown() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="size-4">
      <path d="M8 4V12" /><path d="M5 9L8 12L11 9" />
    </svg>
  );
}

// ─── Widget Toolbar Button ──────────────────────────────────────────────────

function ToolbarBtn({ children, onClick, disabled = false, active = false, tip }: {
  children: React.ReactNode;
  onClick: (e: React.MouseEvent) => void;
  disabled?: boolean;
  active?: boolean;
  tip: string;
}) {
  return (
    <button
      onClick={disabled ? undefined : (e) => { e.stopPropagation(); onClick(e); }}
      disabled={disabled}
      title={tip}
      className={`flex items-center justify-center size-[28px] rounded-md transition-all duration-100 cursor-pointer
        ${disabled ? 'text-ink-300 cursor-not-allowed' : active ? 'bg-brand-600 text-white' : 'text-ink-400 hover:bg-brand-50 hover:text-brand-600'}
      `}
    >
      {children}
    </button>
  );
}

// ─── Expanded Widget Modal ──────────────────────────────────────────────────

// ─── Expanded Modal Data ─────────────────────────────────────────────────────

const EXPANDED_RECORDS = [
  { id: 'INV-005790', vendor: 'Acme Global Imaging', amount: '₹11,853', date: '20-Mar-25', status: 'Pending Review', department: 'Operations', risk: 'High', match: 'INV-005791' },
  { id: 'INV-025832', vendor: 'Korean Technologies', amount: '₹4,564', date: '15-Dec-24', status: 'Under Review', department: 'Procurement', risk: 'Medium', match: 'INV-025831' },
  { id: 'INV-007194', vendor: '3tones Letter Co.', amount: '₹3,835', date: '31-Dec-24', status: 'Resolved', department: 'Finance', risk: 'Low', match: 'None' },
  { id: 'INV-040083', vendor: 'Chintamani Paper Products', amount: '₹3,410', date: '13-Dec-24', status: 'Pending Review', department: 'Operations', risk: 'High', match: 'INV-040082' },
  { id: 'INV-027203', vendor: 'M Cargo Logistics', amount: '₹1,457', date: '12-Jan-25', status: 'Auto-Resolved', department: 'Logistics', risk: 'Low', match: 'None' },
  { id: 'INV-031456', vendor: 'TechParts Ltd', amount: '₹8,920', date: '05-Feb-25', status: 'Flagged', department: 'IT', risk: 'Critical', match: 'INV-031455' },
  { id: 'INV-018927', vendor: 'Global Supplies Inc', amount: '₹6,340', date: '22-Jan-25', status: 'Resolved', department: 'Procurement', risk: 'Low', match: 'INV-018926' },
  { id: 'INV-044521', vendor: 'Atlas Manufacturing', amount: '₹15,200', date: '18-Mar-25', status: 'Under Review', department: 'Finance', risk: 'High', match: 'INV-044520' },
];

const STATUS_COLORS: Record<string, string> = {
  'Pending Review': 'bg-amber-50 text-amber-700 border-amber-200',
  'Under Review': 'bg-blue-50 text-blue-700 border-blue-200',
  'Resolved': 'bg-green-50 text-green-700 border-green-200',
  'Auto-Resolved': 'bg-green-50 text-green-700 border-green-200',
  'Flagged': 'bg-red-50 text-red-700 border-red-200',
};

const RISK_COLORS: Record<string, string> = {
  'Critical': 'bg-red-50 text-red-700',
  'High': 'bg-orange-50 text-orange-700',
  'Medium': 'bg-amber-50 text-amber-700',
  'Low': 'bg-green-50 text-green-700',
};

const TIME_PERIODS = ['Today', '7D', '30D', '3M', '6M', '12M'];

function ExpandedWidgetModal({ open, onClose, title, subtitle, children }: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const [activeTab, setActiveTab] = useState<'visualization' | 'records' | 'summary'>('visualization');
  const [timePeriod, setTimePeriod] = useState('30D');
  const [chartType, setChartType] = useState<'line' | 'bar' | 'area'>('bar');
  const [chartTypeOpen, setChartTypeOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { addToast } = useToast();

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setActiveTab('visualization');
      setSearchQuery('');
      setTimePeriod('30D');
    }
  }, [open]);

  const filteredRecords = EXPANDED_RECORDS.filter(r => {
    if (!searchQuery) return true;
    return r.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.department.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (!open) return null;

  const tabIcons = { visualization: BarChart3, records: FileText, summary: ListChecks };
  const tabLabels = { visualization: 'Visualization', records: 'Detailed Records', summary: 'Summary' };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.2 }}
            className="relative bg-canvas-elevated rounded-2xl border border-canvas-border shadow-2xl flex flex-col overflow-hidden"
            style={{ width: 'calc(100vw - 64px)', height: 'calc(100vh - 64px)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* ── Header with tabs ── */}
            <div className="border-b border-canvas-border bg-canvas-elevated shrink-0">
              <div className="flex items-center justify-between px-5 pt-2 pb-0">
                {/* Tabs left */}
                <div className="flex items-center gap-0">
                  {(['visualization', 'records', 'summary'] as const).map(tab => {
                    const Icon = tabIcons[tab];
                    const isActive = activeTab === tab;
                    return (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex items-center gap-1.5 px-3 py-2.5 text-[12px] font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                          isActive ? 'border-brand-600 text-brand-700' : 'border-transparent text-ink-500 hover:text-ink-700'
                        }`}
                      >
                        <Icon size={14} />
                        {tabLabels[tab]}
                      </button>
                    );
                  })}
                </div>

                {/* Actions right */}
                <div className="flex items-center gap-1.5">
                  <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-2 transition-colors cursor-pointer">
                    <X size={18} className="text-ink-500" />
                  </button>
                </div>
              </div>

              {/* Visualization sub-bar */}
              {activeTab === 'visualization' && (
                <div className="flex items-center px-4 py-0 border-t border-canvas-border/50">
                  {/* Left — prev/next arrows */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button className="size-8 flex items-center justify-center rounded border border-canvas-border bg-canvas-elevated hover:bg-surface-2 transition-colors cursor-pointer" title="Previous widget">
                      <ChevronDown size={16} className="text-ink-700 rotate-90" />
                    </button>
                    <button className="size-8 flex items-center justify-center rounded border border-canvas-border bg-canvas-elevated hover:bg-surface-2 transition-colors cursor-pointer" title="Next widget">
                      <ChevronDown size={16} className="text-ink-700 -rotate-90" />
                    </button>
                  </div>

                  {/* Center — title */}
                  <div className="flex-1 flex items-center justify-center">
                    <span className="text-[13px] font-semibold text-ink-900">{title}</span>
                  </div>

                  {/* Right — drill + chart type + filter + settings */}
                  <div className="flex items-center shrink-0">
                    {/* Drill up */}
                    <button onClick={() => addToast({ message: 'Drilled up', type: 'info' })} className="p-2.5 text-ink-400 hover:text-ink-700 hover:bg-surface-2 transition-colors cursor-pointer" title="Drill up">
                      <IconDrillUp />
                    </button>
                    {/* Drill down */}
                    <button onClick={() => addToast({ message: 'Drill down', type: 'info' })} className="p-2.5 text-ink-400 hover:text-ink-700 hover:bg-surface-2 transition-colors cursor-pointer" title="Drill down">
                      <IconDrillDown />
                    </button>
                    {/* Double drill */}
                    <button onClick={() => addToast({ message: 'Double drill', type: 'info' })} className="p-2.5 text-ink-400 hover:text-ink-700 hover:bg-surface-2 transition-colors cursor-pointer" title="Double drill">
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="size-4">
                        <path d="M5 3V8" /><path d="M3 6L5 8L7 6" />
                        <path d="M11 3V8" /><path d="M9 6L11 8L13 6" />
                        <path d="M4 11h8" />
                      </svg>
                    </button>

                    {/* Divider */}
                    <div className="w-px h-8 bg-canvas-border mx-2" />

                    {/* Chart type dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => setChartTypeOpen(!chartTypeOpen)}
                        className="flex items-center gap-2 px-3 py-2.5 text-[13px] font-medium text-ink-700 hover:bg-surface-2 transition-colors cursor-pointer"
                      >
                        {chartType === 'line' ? <LineChart size={15} /> : chartType === 'area' ? <AreaChart size={15} /> : <BarChart3 size={15} />}
                        <span>{chartType === 'line' ? 'Line Chart' : chartType === 'area' ? 'Area Chart' : 'Bar Chart'}</span>
                        <ChevronDown size={13} className="text-ink-400" />
                      </button>
                      {chartTypeOpen && (
                        <>
                          <div className="fixed inset-0 z-30" onClick={() => setChartTypeOpen(false)} />
                          <div className="absolute top-full right-0 mt-1 z-40 bg-canvas-elevated border border-canvas-border rounded-xl shadow-xl py-1 min-w-[150px]">
                            {([['line', 'Line Chart', LineChart], ['bar', 'Bar Chart', BarChart3], ['area', 'Area Chart', AreaChart]] as const).map(([type, label, Icon]) => (
                              <button
                                key={type}
                                onClick={() => { setChartType(type as any); setChartTypeOpen(false); addToast({ message: `Chart type: ${label}`, type: 'info' }); }}
                                className={`w-full flex items-center gap-2.5 px-4 py-2 text-[13px] transition-colors cursor-pointer ${
                                  chartType === type ? 'text-brand-700 bg-brand-50' : 'text-ink-600 hover:bg-surface-2'
                                }`}
                              >
                                <Icon size={14} /> {label}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Divider */}
                    <div className="w-px h-8 bg-canvas-border mx-2" />

                    {/* Filter */}
                    <button onClick={() => addToast({ message: 'Filters', type: 'info' })} className="flex items-center gap-1.5 px-3 py-2.5 text-[13px] font-medium text-ink-500 hover:text-ink-700 hover:bg-surface-2 transition-colors cursor-pointer">
                      <Filter size={15} />
                      <span>Filter</span>
                    </button>

                    {/* Divider */}
                    <div className="w-px h-8 bg-canvas-border mx-2" />

                    {/* Settings */}
                    <button onClick={() => addToast({ message: 'Settings', type: 'info' })} className="p-2.5 text-ink-400 hover:text-ink-700 hover:bg-surface-2 transition-colors cursor-pointer" title="Settings">
                      <Settings size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ── Content ── */}
            <div className="flex-1 overflow-auto">
              <AnimatePresence mode="wait">
                {/* VISUALIZATION */}
                {activeTab === 'visualization' && (
                  <motion.div key="viz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-5 h-full">
                    <div className="bg-canvas-elevated rounded-xl border border-canvas-border p-6 h-full min-h-[500px] flex flex-col">
                      {children}
                    </div>
                  </motion.div>
                )}

                {/* RECORDS */}
                {activeTab === 'records' && (
                  <motion.div key="records" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-5">
                    {/* Search */}
                    <div className="relative mb-4">
                      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                      <input
                        type="text"
                        placeholder="Search by invoice, vendor, department..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 text-[13px] border border-canvas-border rounded-lg bg-canvas-elevated focus:outline-none focus:border-brand-400 transition-colors"
                      />
                    </div>

                    {/* Table */}
                    <div className="bg-canvas-elevated rounded-xl border border-canvas-border overflow-hidden">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-canvas-border bg-surface-2/50">
                            {['Invoice ID', 'Vendor', 'Amount', 'Date', 'Status', 'Department', 'Risk', 'Duplicate Match'].map(h => (
                              <th key={h} className="text-[11px] font-bold text-ink-500 uppercase tracking-wider px-4 py-3">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {filteredRecords.map((r, i) => (
                            <motion.tr
                              key={r.id}
                              initial={{ opacity: 0, y: 4 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.03 }}
                              className="border-b border-canvas-border/50 last:border-0 hover:bg-brand-50/30 transition-colors cursor-pointer"
                            >
                              <td className="px-4 py-3 text-[12px] font-semibold text-brand-700">{r.id}</td>
                              <td className="px-4 py-3 text-[12px] text-ink-800">{r.vendor}</td>
                              <td className="px-4 py-3 text-[12px] font-medium text-ink-900">{r.amount}</td>
                              <td className="px-4 py-3 text-[12px] text-ink-600">{r.date}</td>
                              <td className="px-4 py-3">
                                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${STATUS_COLORS[r.status] || 'bg-gray-50 text-gray-600'}`}>
                                  {r.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-[12px] text-ink-600">{r.department}</td>
                              <td className="px-4 py-3">
                                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${RISK_COLORS[r.risk] || ''}`}>
                                  {r.risk}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-[12px] text-ink-500 font-mono">{r.match}</td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                )}

                {/* SUMMARY — structured report */}
                {activeTab === 'summary' && (
                  <motion.div key="summary" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col min-h-0 p-6">
                    <div className="flex-1 overflow-y-auto pr-2">
                      <div className="bg-brand-50/60 rounded-xl p-8 space-y-8">
                        {/* Query */}
                        <div>
                          <div className="flex items-center justify-between gap-3 mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-1 h-6 bg-brand-600 rounded-full" />
                              <h3 className="text-[14px] font-semibold text-ink-900">Query</h3>
                            </div>
                            <button className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-[12px] rounded-lg transition-colors cursor-pointer font-medium">
                              Ask IRA
                              <Send size={13} className="-rotate-45" />
                            </button>
                          </div>
                          <p className="text-[13px] text-ink-700 leading-[1.7]">
                            Analyze the current compliance posture across all business processes. Identify key risk areas, control gaps, and provide actionable recommendations for the audit committee.
                          </p>
                        </div>

                        {/* Answer */}
                        <div>
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-1 h-6 bg-brand-600 rounded-full" />
                            <h3 className="text-[14px] font-semibold text-ink-900">Answer</h3>
                          </div>
                          <div className="space-y-3">
                            {[
                              'The analysis reveals that P2P compliance has improved to 94.2% following the vendor master cleanup, but 3 new duplicate flags from Acme Corp & Global Supplies require immediate attention.',
                              'Processing time is trending favorably at 1.8 days, down from 2.3 days last quarter, indicating operational efficiency gains from the automated detection workflows.',
                              'One new vendor (Atlas Manufacturing) is pending KYC verification — expediting this before the next payment batch would prevent processing delays estimated at ₹2.1L.',
                              'SOD violations detected in the AP module represent the highest-priority remediation item, as user JSmith currently has both invoice approval and payment release access.',
                            ].map((text, i) => (
                              <div key={i} className="flex gap-3">
                                <span className="flex-shrink-0 w-1.5 h-1.5 bg-brand-600 rounded-full mt-2" />
                                <p className="text-[13px] text-ink-700 leading-[1.7] flex-1">{text}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Observations */}
                        <div>
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-1 h-6 bg-brand-600 rounded-full" />
                            <h3 className="text-[14px] font-semibold text-ink-900">Observations</h3>
                          </div>
                          <div className="space-y-3">
                            {[
                              '2 critical risks in P2P have zero controls mapped, creating a compliance gap that should be addressed before the next SOX review cycle in 6 days.',
                              'The correlation between vendor onboarding speed and duplicate invoice flags suggests that expedited KYC processes may inadvertently reduce detection accuracy.',
                              'Regional performance varies significantly — APAC dispute rates are trending upward while EMEA shows consistent improvement, suggesting localized strategies would yield better results.',
                              '3 audit findings from Q1 remain open past their remediation deadline, which could impact the overall compliance score if not resolved within the current reporting period.',
                            ].map((text, i) => (
                              <div key={i} className="flex gap-3">
                                <span className="flex-shrink-0 w-1.5 h-1.5 bg-brand-600 rounded-full mt-2" />
                                <p className="text-[13px] text-ink-700 leading-[1.7] flex-1">{text}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Widget Card ────────────────────────────────────────────────────────────

function WidgetCard({
  title,
  subtitle,
  children,
  onExpand,
  onEdit,
  onDelete,
  onFilter,
  addToast,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onExpand?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onFilter?: () => void;
  addToast: (t: { message: string; type: string }) => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [drillLevel, setDrillLevel] = useState(0);
  const [drillModeActive, setDrillModeActive] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleDrillUp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (drillLevel <= 0) {
      addToast({ message: 'Already at top level', type: 'info' });
      return;
    }
    setDrillLevel(prev => prev - 1);
    setDrillModeActive(false);
    addToast({ message: 'Drilled up', type: 'success' });
  };

  const handleDrillDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (drillLevel >= 2) {
      addToast({ message: 'Already at deepest level', type: 'info' });
      return;
    }
    if (!drillModeActive) {
      setDrillModeActive(true);
      addToast({ message: 'Drill mode ON — click a data point to drill', type: 'success' });
    } else {
      setDrillModeActive(false);
      addToast({ message: 'Drill mode OFF', type: 'info' });
    }
  };

  return (
    <div
      className="glass-card rounded-xl transition-all duration-150 group relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setShowMenu(false); }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-6 pb-2">
        <div className="min-w-0 flex-1">
          <h3 className="text-[15px] font-semibold text-ink-900 truncate">{title}</h3>
          {subtitle && <p className="text-[12px] text-ink-500 mt-1 truncate">{subtitle}</p>}
        </div>

        {/* Toolbar — visible on hover */}
        <div
          className={`flex items-center gap-0.5 bg-canvas-elevated border border-canvas-border rounded-lg px-0.5 py-0.5 transition-opacity duration-150 ${
            hovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* Drill Up */}
          <ToolbarBtn onClick={handleDrillUp} disabled={drillLevel <= 0} tip="Drill up">
            <IconDrillUp />
          </ToolbarBtn>

          {/* Drill Down */}
          <ToolbarBtn onClick={handleDrillDown} active={drillModeActive} disabled={drillLevel >= 2} tip={drillLevel >= 2 ? 'Already at deepest level' : 'Drill down'}>
            <IconDrillDown />
          </ToolbarBtn>

          {/* Filter */}
          <ToolbarBtn onClick={(e) => { e.stopPropagation(); onFilter?.(); }} tip="Widget filters">
            <Filter size={13} />
          </ToolbarBtn>

          {/* 3-dot menu */}
          <div className="relative">
            <ToolbarBtn
              onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
              active={showMenu}
              tip="More options"
            >
              <MoreVertical size={13} />
            </ToolbarBtn>

            {showMenu && (
              <>
                <div className="fixed inset-0 z-30" onClick={(e) => { e.stopPropagation(); setShowMenu(false); }} />
                <div className="absolute top-full right-0 z-40 mt-1 w-[140px] bg-canvas-elevated border border-canvas-border rounded-lg shadow-xl py-1">
                  {onExpand && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowMenu(false); onExpand(); }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[12px] text-ink-700 hover:bg-brand-50 hover:text-brand-600 transition-colors text-left cursor-pointer"
                    >
                      <Maximize2 size={13} />
                      Expand
                    </button>
                  )}
                  {onEdit && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowMenu(false); onEdit(); }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[12px] text-ink-700 hover:bg-brand-50 hover:text-brand-600 transition-colors text-left cursor-pointer"
                    >
                      <Edit size={13} />
                      Edit Widget
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowMenu(false); onDelete(); }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[12px] text-ink-700 hover:bg-red-50 hover:text-red-600 transition-colors text-left cursor-pointer"
                    >
                      <Trash2 size={13} />
                      Delete Widget
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Chart content */}
      <div className="px-6 pb-6 flex-1">
        {children}
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
                <th key={h} className="text-[12px] text-text-muted font-medium pb-2 pr-4">{h}</th>
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
        <div className="text-[12px] text-text-muted font-semibold">Dashboards</div>
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
  initialDashboardId?: string | null;
  onBack?: () => void;
  onImportPowerBI?: () => void;
  onShare?: () => void;
}

export default function DashboardView({ initialDashboardId, onBack, onImportPowerBI, onShare }: DashboardProps = {}) {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<DashboardId>(
    (initialDashboardId as DashboardId) && DASHBOARDS.some(d => d.id === initialDashboardId)
      ? (initialDashboardId as DashboardId)
      : 'p2p'
  );

  // Action bar state
  const [lastRefreshTime, setLastRefreshTime] = useState('2 mins ago');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [autoRefreshFrequency, setAutoRefreshFrequency] = useState('Off');
  const [showFrequencyDropdown, setShowFrequencyDropdown] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [expandedWidget, setExpandedWidget] = useState<{ title: string; subtitle?: string } | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filterDateRange, setFilterDateRange] = useState('last-30-days');
  const [filterStatus, setFilterStatus] = useState<string[]>([]);
  const [filterRisk, setFilterRisk] = useState<string[]>([]);
  const [filterDepartment, setFilterDepartment] = useState<string[]>([]);
  const [addWidgetOpen, setAddWidgetOpen] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  // Recalculate active filter count
  useEffect(() => {
    let n = 0;
    if (filterDateRange !== 'last-30-days') n++;
    if (filterStatus.length > 0) n++;
    if (filterRisk.length > 0) n++;
    if (filterDepartment.length > 0) n++;
    setActiveFiltersCount(n);
  }, [filterDateRange, filterStatus, filterRisk, filterDepartment]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastRefreshTime('Just now');
      addToast({ message: 'Dashboard refreshed', type: 'success' });
      setTimeout(() => setLastRefreshTime('1 min ago'), 60000);
    }, 800);
  };

  const handleExport = () => {
    if (isExporting) return;
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      addToast({ message: 'Exported as PDF', type: 'success' });
    }, 2000);
  };

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const handleSelect = useCallback((id: DashboardId) => {
    setActiveId(id);
  }, []);

  if (loading) return <DashboardSkeleton />;

  const dashboard = DASHBOARDS.find(d => d.id === activeId) || DASHBOARDS[0];

  return (
    <div className="h-full flex bg-canvas relative overflow-hidden">
      <Orb hoverIntensity={0.09} rotateOnHover hue={dashboard.accentHue} opacity={0.08} />

      {/* Sidebar removed — dashboard switching handled via list page */}

      {/* Main content */}
      <div className="flex-1 overflow-y-auto relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={dashboard.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="p-8"
          >
            {/* Page header — Editorial: breadcrumb · serif title · context · actions */}
            <div className="mb-6">
              <div className="font-mono text-[12px] text-ink-500 mb-2 flex items-center gap-1">
                {onBack && (
                  <button onClick={onBack} className="inline-flex items-center gap-1 hover:text-brand-600 transition-colors cursor-pointer">
                    <ArrowLeft size={12} />
                    Dashboards
                  </button>
                )}
                {onBack && <span>·</span>}
                {!onBack && <span>Dashboards · </span>}
                {dashboard.name}
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <h1 className="font-display text-[34px] font-[420] text-ink-900 leading-[1.15]">{dashboard.name}</h1>
                  <p className="text-[13px] text-ink-500 mt-1">{dashboard.subtitle}</p>
                </div>
                <div className="flex items-center gap-2">
                  {/* Refreshed indicator */}
                  <button
                    onClick={handleRefresh}
                    className="flex items-center gap-1.5 px-3 h-9 border border-canvas-border bg-canvas-elevated rounded-lg text-[12px] text-ink-500 hover:border-brand-200 transition-colors cursor-pointer"
                    title="Click to refresh"
                  >
                    <RefreshCw size={13} className={isRefreshing ? 'animate-spin text-brand-600' : ''} />
                    <span className="tabular-nums">Refreshed {lastRefreshTime}</span>
                  </button>

                  {/* Auto refresh with frequency dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setShowFrequencyDropdown(!showFrequencyDropdown)}
                      className={`flex items-center gap-1.5 px-3 h-9 rounded-full text-[12px] font-medium transition-colors cursor-pointer border shadow-sm ${
                        autoRefreshFrequency !== 'Off'
                          ? 'border-brand-300 bg-brand-50 text-brand-700'
                          : 'border-canvas-border bg-canvas-elevated text-ink-500 hover:border-brand-200'
                      }`}
                    >
                      <Clock size={13} />
                      Auto refresh: {autoRefreshFrequency !== 'Off' ? 'On' : 'Off'}
                    </button>
                    {showFrequencyDropdown && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowFrequencyDropdown(false)} />
                        <div className="absolute top-full left-0 mt-2 w-48 bg-canvas-elevated border border-canvas-border rounded-lg shadow-xl py-1.5 z-50">
                          {['Off', 'Daily', 'Weekly', 'Biweekly', 'Monthly', 'Quarterly', 'Semi-Annually', 'Annually'].map(freq => (
                            <button
                              key={freq}
                              onClick={() => {
                                setAutoRefreshFrequency(freq);
                                setAutoRefresh(freq !== 'Off');
                                setShowFrequencyDropdown(false);
                                addToast({ message: freq === 'Off' ? 'Auto refresh disabled' : `Auto refresh set to ${freq}`, type: 'info' });
                              }}
                              className={`w-full flex items-center justify-between px-4 py-2 text-[13px] transition-colors cursor-pointer ${
                                autoRefreshFrequency === freq
                                  ? 'bg-brand-50 text-brand-700 font-medium'
                                  : 'text-ink-700 hover:bg-brand-50 hover:text-brand-700'
                              }`}
                            >
                              {freq}
                              {autoRefreshFrequency === freq && (
                                <CheckCircle2 size={14} className="text-brand-600" />
                              )}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Divider */}
                  <div className="w-px h-5 bg-canvas-border" />

                  {/* + Add Widget — primary CTA */}
                  <button
                    onClick={() => setAddWidgetOpen(true)}
                    className="flex items-center gap-1.5 px-4 h-9 bg-brand-600 hover:bg-brand-500 active:bg-brand-800 text-white rounded-lg text-[12px] font-semibold transition-colors cursor-pointer"
                  >
                    <Plus size={14} />
                    Add Widget
                  </button>

                  {/* Download */}
                  <button
                    onClick={handleExport}
                    disabled={isExporting}
                    className="flex items-center justify-center size-9 border border-canvas-border bg-canvas-elevated rounded-lg text-ink-500 hover:text-brand-600 hover:border-brand-200 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    title="Export as PDF"
                  >
                    {isExporting ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
                  </button>

                  {/* Filter */}
                  <button
                    onClick={() => setFiltersOpen(!filtersOpen)}
                    className={`flex items-center gap-1.5 px-2.5 h-9 rounded-lg text-[12px] font-medium transition-colors cursor-pointer border ${
                      activeFiltersCount > 0
                        ? 'border-brand-200 bg-brand-50 text-brand-700'
                        : 'border-canvas-border bg-canvas-elevated text-ink-500 hover:text-brand-600 hover:border-brand-200'
                    }`}
                    title="Filters"
                  >
                    <Filter size={15} />
                    {activeFiltersCount > 0 && <span className="tabular-nums">{activeFiltersCount}</span>}
                  </button>

                  {/* Share */}
                  <button
                    onClick={() => onShare ? onShare() : addToast({ message: 'Share dialog opening.', type: 'info' })}
                    className="flex items-center gap-1.5 px-2.5 h-9 border border-canvas-border bg-canvas-elevated rounded-lg text-ink-500 hover:text-brand-600 hover:border-brand-200 transition-colors cursor-pointer text-[12px] font-medium"
                    title="Share"
                  >
                    <Share2 size={15} />
                    <span className="hidden sm:inline">Share</span>
                  </button>

                  {/* Fullscreen */}
                  <button
                    onClick={() => {
                      setIsFullScreen(!isFullScreen);
                      addToast({ message: isFullScreen ? 'Exited fullscreen' : 'Entered fullscreen', type: 'info' });
                    }}
                    className="flex items-center justify-center size-9 border border-canvas-border bg-canvas-elevated rounded-lg text-ink-500 hover:text-brand-600 hover:border-brand-200 transition-colors cursor-pointer"
                    title={isFullScreen ? 'Exit fullscreen' : 'Fullscreen'}
                  >
                    <Maximize2 size={15} />
                  </button>
                </div>
              </div>
            </div>

            {/* AI Summary — Generate / View / Edit */}
            {/* Alerts & Daily Digest */}
            <AlertsPanel dashboardId={activeId} />

            {/* Charts — 2×2 grid of big widget cards */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6"
              style={{ gridAutoRows: 'minmax(420px, auto)' }}
            >
              {/* Widget 1 — Donut / Distribution */}
              {dashboard.donut && (
                <WidgetCard
                  title={dashboard.donut.title}
                  subtitle="Distribution breakdown"
                  addToast={addToast}
                  onExpand={() => setExpandedWidget({ title: dashboard.donut!.title, subtitle: 'Distribution breakdown' })}
                  onEdit={() => addToast({ message: 'Edit widget opening.', type: 'info' })}
                  onDelete={() => addToast({ message: 'Widget deleted.', type: 'info' })}
                  onFilter={() => addToast({ message: 'Widget filter opening.', type: 'info' })}
                >
                  <div className="flex items-center gap-10 py-10 px-4">
                    <div className="relative shrink-0">
                      <svg width="180" height="180" viewBox="0 0 100 100">
                        {(() => {
                          const segs = dashboard.donut!.segments;
                          const total = segs.reduce((a, s) => a + s.value, 0);
                          let offset = 0;
                          return segs.map(s => {
                            const pct = (s.value / total) * 100;
                            const dashArray = `${pct * 2.51327} ${251.327 - pct * 2.51327}`;
                            const dashOffset = -offset * 2.51327;
                            offset += pct;
                            return (
                              <motion.circle
                                key={s.label} cx="50" cy="50" r="40" fill="none"
                                stroke={s.color} strokeWidth="10"
                                strokeDasharray={dashArray} strokeDashoffset={dashOffset}
                                strokeLinecap="round" transform="rotate(-90 50 50)"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
                              />
                            );
                          });
                        })()}
                        {dashboard.donut!.centerLabel && (
                          <>
                            <text x="50" y="46" textAnchor="middle" className="fill-ink-900 font-bold" fontSize="18">{dashboard.donut!.centerLabel}</text>
                            <text x="50" y="60" textAnchor="middle" className="fill-ink-500" fontSize="9">Total</text>
                          </>
                        )}
                      </svg>
                    </div>
                    <div className="space-y-3 flex-1 min-w-0">
                      {dashboard.donut!.segments.map(s => (
                        <div key={s.label} className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-3 h-3 rounded-full shrink-0" style={{ background: s.color }} />
                            <span className="text-[13px] text-ink-700">{s.label}</span>
                          </div>
                          <span className="text-[14px] font-bold text-ink-900 shrink-0 ml-3">
                            {dashboard.donut!.segments.reduce((a, s) => a + s.value, 0) > 100 ? s.value : `${s.value}%`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </WidgetCard>
              )}

              {/* Widget 2 — Bar Chart */}
              {dashboard.bars && (
                <WidgetCard
                  title={dashboard.bars.title}
                  subtitle="Trend analysis"
                  addToast={addToast}
                  onExpand={() => setExpandedWidget({ title: dashboard.bars!.title, subtitle: 'Trend analysis' })}
                  onEdit={() => addToast({ message: 'Edit widget opening.', type: 'info' })}
                  onDelete={() => addToast({ message: 'Widget deleted.', type: 'info' })}
                  onFilter={() => addToast({ message: 'Widget filter opening.', type: 'info' })}
                >
                  <div className="flex items-end gap-3 pt-6" style={{ height: '280px' }}>
                    {dashboard.bars!.data.map((d, i) => {
                      const max = Math.max(...dashboard.bars!.data.map(dd => dd.value));
                      const height = (d.value / max) * 100;
                      return (
                        <div key={d.label} className="flex-1 flex flex-col items-center gap-1.5">
                          <span className="text-[12px] text-ink-500 font-medium">
                            {d.value >= 1000 ? `${(d.value / 1000).toFixed(1)}K` : d.value}
                          </span>
                          <motion.div
                            className="w-full rounded-t-md min-h-[4px]"
                            style={{ background: dashboard.bars!.color }}
                            initial={{ height: 0 }}
                            animate={{ height: `${height}%` }}
                            transition={{ duration: 0.5, delay: i * 0.06, ease: 'easeOut' }}
                          />
                          <span className="text-[12px] text-ink-500">{d.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </WidgetCard>
              )}

              {/* Widget 3 — Progress / Compliance Rates */}
              {dashboard.progress ? (
                <WidgetCard
                  title={dashboard.progress.title}
                  subtitle="Completion rates"
                  addToast={addToast}
                  onExpand={() => setExpandedWidget({ title: dashboard.progress!.title, subtitle: 'Completion rates' })}
                  onEdit={() => addToast({ message: 'Edit widget opening.', type: 'info' })}
                  onDelete={() => addToast({ message: 'Widget deleted.', type: 'info' })}
                  onFilter={() => addToast({ message: 'Widget filter opening.', type: 'info' })}
                >
                  <div className="space-y-5 py-8 px-2">
                    {dashboard.progress!.data.map((d, i) => (
                      <div key={d.label}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[13px] text-ink-700">{d.label}</span>
                          <span className="text-[13px] font-bold text-ink-900">{d.value}%</span>
                        </div>
                        <div className="h-2.5 bg-surface-3 rounded-full overflow-hidden">
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
                </WidgetCard>
              ) : (
                <WidgetCard
                  title="Detection Accuracy"
                  subtitle="ML model performance vs targets"
                  addToast={addToast}
                  onExpand={() => setExpandedWidget({ title: 'Detection Accuracy', subtitle: 'ML model performance vs targets' })}
                  onEdit={() => addToast({ message: 'Edit widget opening.', type: 'info' })}
                  onDelete={() => addToast({ message: 'Widget deleted.', type: 'info' })}
                  onFilter={() => addToast({ message: 'Widget filter opening.', type: 'info' })}
                >
                  <div className="py-8 px-2">
                    <svg width="100%" height="260" viewBox="0 0 400 260" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--color-brand-500)" stopOpacity="0.15" />
                          <stop offset="100%" stopColor="var(--color-brand-500)" stopOpacity="0.02" />
                        </linearGradient>
                      </defs>
                      <polyline points="0,260 0,200 57,160 114,180 171,120 228,140 285,80 342,100 400,40 400,260" fill="url(#areaGrad)" />
                      <polyline points="0,200 57,160 114,180 171,120 228,140 285,80 342,100 400,40" fill="none" stroke="var(--color-brand-500)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      {[0, 57, 114, 171, 228, 285, 342, 400].map((x, i) => (
                        <circle key={i} cx={x} cy={[200,160,180,120,140,80,100,40][i]} r="4" fill="var(--color-brand-600)" stroke="white" strokeWidth="2" />
                      ))}
                    </svg>
                    <div className="flex justify-between text-[11px] text-ink-500 mt-2 px-1">
                      {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'].map(m => <span key={m}>{m}</span>)}
                    </div>
                  </div>
                </WidgetCard>
              )}

              {/* Widget 4 — Line Trend / Processing Analytics */}
              <WidgetCard
                title={dashboard.lineTrend?.title || 'Processing Analytics'}
                subtitle={dashboard.lineTrend ? 'Performance over time' : 'Invoice processing & detection'}
                addToast={addToast}
                onExpand={() => setExpandedWidget({ title: dashboard.lineTrend?.title || 'Processing Analytics', subtitle: 'Performance over time' })}
                onEdit={() => addToast({ message: 'Edit widget opening.', type: 'info' })}
                onDelete={() => addToast({ message: 'Widget deleted.', type: 'info' })}
                onFilter={() => addToast({ message: 'Widget filter opening.', type: 'info' })}
              >
                <div className="py-8 px-2">
                  {(() => {
                    const data = dashboard.lineTrend?.data || [85, 78, 92, 88, 95, 91, 87, 93, 89, 96, 94, 98];
                    const labels = dashboard.lineTrend?.labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    const color = dashboard.lineTrend?.color || 'var(--color-compliant)';
                    const max = Math.max(...data);
                    const min = Math.min(...data);
                    const range = max - min || 1;
                    const w = 400;
                    const h = 260;
                    const points = data.map((v, i) => `${i * (w / (data.length - 1))},${h - ((v - min) / range) * (h - 20) - 10}`).join(' ');
                    return (
                      <>
                        <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={color} stopOpacity="0.12" />
                              <stop offset="100%" stopColor={color} stopOpacity="0.01" />
                            </linearGradient>
                          </defs>
                          <polyline points={`0,${h} ${points} ${w},${h}`} fill="url(#lineGrad)" />
                          <polyline points={points} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                          {data.map((v, i) => (
                            <circle key={i} cx={i * (w / (data.length - 1))} cy={h - ((v - min) / range) * (h - 20) - 10} r="3.5" fill={color} stroke="white" strokeWidth="2" />
                          ))}
                        </svg>
                        <div className="flex justify-between text-[11px] text-ink-500 mt-2 px-1">
                          {labels.map(l => <span key={l}>{l}</span>)}
                        </div>
                      </>
                    );
                  })()}
                </div>
              </WidgetCard>
            </motion.div>

            {/* Table — wrapped in WidgetCard */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
            >
              <WidgetCard
                title={dashboard.table.title}
                subtitle="Detailed records"
                addToast={addToast}
                onExpand={() => setExpandedWidget({ title: dashboard.table.title, subtitle: 'Detailed records' })}
                onEdit={() => addToast({ message: 'Edit widget opening.', type: 'info' })}
                onDelete={() => addToast({ message: 'Widget deleted.', type: 'info' })}
                onFilter={() => addToast({ message: 'Widget filter opening.', type: 'info' })}
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-canvas-border">
                        {dashboard.table.headers.map(h => (
                          <th key={h} className="text-[12px] text-ink-500 font-medium pb-2 pr-4">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {dashboard.table.rows.map((row, i) => (
                        <motion.tr
                          key={i}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 + i * 0.04 }}
                          className="border-b border-canvas-border/50 last:border-0 hover:bg-brand-50/50 transition-colors cursor-pointer"
                        >
                          {row.cells.map((cell, j) => (
                            <td key={j} className={`text-[12.5px] py-2.5 pr-4 ${j === 0 ? 'font-medium text-ink-900' : 'text-ink-600'}`}>
                              {cell}
                            </td>
                          ))}
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </WidgetCard>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Expanded Widget Modal */}
      <ExpandedWidgetModal
        open={!!expandedWidget}
        onClose={() => setExpandedWidget(null)}
        title={expandedWidget?.title ?? ''}
        subtitle={expandedWidget?.subtitle}
      >
        {/* Visualization tab content — show the same chart type enlarged */}
        {expandedWidget && dashboard.bars && expandedWidget.title === dashboard.bars.title && (
          <div className="flex items-end gap-3 h-64">
            {dashboard.bars.data.map((d, i) => {
              const max = Math.max(...dashboard.bars!.data.map(dd => dd.value));
              const height = (d.value / max) * 100;
              return (
                <div key={d.label} className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-[13px] text-ink-500 font-medium">
                    {d.value >= 1000 ? `${(d.value / 1000).toFixed(1)}K` : d.value}
                  </span>
                  <motion.div
                    className="w-full rounded-t-md min-h-[4px]"
                    style={{ background: dashboard.bars!.color }}
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ duration: 0.5, delay: i * 0.06, ease: 'easeOut' }}
                  />
                  <span className="text-[13px] text-ink-500">{d.label}</span>
                </div>
              );
            })}
          </div>
        )}
        {expandedWidget && dashboard.donut && expandedWidget.title === dashboard.donut.title && (
          <div className="flex items-center justify-center gap-10 py-6">
            <svg width="200" height="200" viewBox="0 0 100 100">
              {(() => {
                const segs = dashboard.donut!.segments;
                const total = segs.reduce((a, s) => a + s.value, 0);
                let offset = 0;
                return segs.map(s => {
                  const pct = (s.value / total) * 100;
                  const dashArray = `${pct * 2.51327} ${251.327 - pct * 2.51327}`;
                  const dashOffset = -offset * 2.51327;
                  offset += pct;
                  return (
                    <motion.circle
                      key={s.label} cx="50" cy="50" r="40" fill="none"
                      stroke={s.color} strokeWidth="10"
                      strokeDasharray={dashArray} strokeDashoffset={dashOffset}
                      strokeLinecap="round" transform="rotate(-90 50 50)"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
                    />
                  );
                });
              })()}
              {dashboard.donut!.centerLabel && (
                <>
                  <text x="50" y="48" textAnchor="middle" className="fill-ink-900 font-bold" fontSize="16">{dashboard.donut!.centerLabel}</text>
                  <text x="50" y="62" textAnchor="middle" className="fill-ink-500" fontSize="9">Total</text>
                </>
              )}
            </svg>
            <div className="space-y-3">
              {dashboard.donut!.segments.map(s => (
                <div key={s.label} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ background: s.color }} />
                  <span className="text-[13px] text-ink-600">{s.label}</span>
                  <span className="text-[13px] font-semibold text-ink-900 ml-auto">{s.value}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {expandedWidget && dashboard.progress && expandedWidget.title === dashboard.progress.title && (
          <div className="space-y-4 py-4">
            {dashboard.progress.data.map((d, i) => (
              <div key={d.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[13px] text-ink-600">{d.label}</span>
                  <span className="text-[13px] font-semibold text-ink-900">{d.value}%</span>
                </div>
                <div className="h-3 bg-surface-3 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${d.value}%` }}
                    transition={{ duration: 0.6, delay: i * 0.08 }}
                    className="h-full rounded-full"
                    style={{ background: d.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
        {expandedWidget && expandedWidget.title === dashboard.table.title && (
          <div className="overflow-x-auto py-2">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-canvas-border">
                  {dashboard.table.headers.map(h => (
                    <th key={h} className="text-[13px] text-ink-500 font-medium pb-3 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dashboard.table.rows.map((row, i) => (
                  <motion.tr
                    key={i}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-canvas-border/50 last:border-0 hover:bg-brand-50/50 transition-colors cursor-pointer"
                  >
                    {row.cells.map((cell, j) => (
                      <td key={j} className={`text-[13px] py-3 pr-4 ${j === 0 ? 'font-medium text-ink-900' : 'text-ink-600'}`}>
                        {cell}
                      </td>
                    ))}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ExpandedWidgetModal>

      {/* Filter Panel */}
      <FilterPanel
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        dateRange={filterDateRange}
        onDateRangeChange={setFilterDateRange}
        status={filterStatus}
        onStatusChange={setFilterStatus}
        risk={filterRisk}
        onRiskChange={setFilterRisk}
        department={filterDepartment}
        onDepartmentChange={setFilterDepartment}
        onResetAll={() => {
          setFilterDateRange('last-30-days');
          setFilterStatus([]);
          setFilterRisk([]);
          setFilterDepartment([]);
        }}
      />

      {/* Add Widget Modal */}
      <AddWidgetModal
        open={addWidgetOpen}
        onClose={() => setAddWidgetOpen(false)}
        addToast={addToast}
      />
    </div>
  );
}
