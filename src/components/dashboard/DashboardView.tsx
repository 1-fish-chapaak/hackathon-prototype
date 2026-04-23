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
  MoreVertical, Edit, Trash2, ChevronUp, Eye, EyeOff
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

function ExpandedWidgetModal({ open, onClose, title, subtitle, children }: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.2 }}
            className="bg-canvas-elevated rounded-xl border border-canvas-border shadow-xl w-[90vw] max-w-[900px] max-h-[85vh] overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-canvas-border">
              <div>
                <h2 className="text-[15px] font-semibold text-ink-900">{title}</h2>
                {subtitle && <p className="text-[12px] text-ink-500 mt-0.5">{subtitle}</p>}
              </div>
              <button
                onClick={onClose}
                className="flex items-center justify-center size-8 rounded-lg hover:bg-surface-2 transition-colors cursor-pointer"
              >
                <X size={16} className="text-ink-500" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 px-6 pt-3 border-b border-canvas-border">
              {['Visualization', 'Records', 'Summary'].map((tab, i) => (
                <button
                  key={tab}
                  className={`px-3 py-2 text-[12px] font-medium border-b-2 transition-colors cursor-pointer ${
                    i === 0
                      ? 'border-brand-600 text-brand-700'
                      : 'border-transparent text-ink-500 hover:text-ink-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-6">
              {children}
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
      <div className="flex items-center justify-between px-5 pt-5 pb-2">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-ink-900 truncate">{title}</h3>
          {subtitle && <p className="text-[11px] text-ink-500 mt-0.5 truncate">{subtitle}</p>}
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
      <div className="px-5 pb-5">
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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
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
  const [isExporting, setIsExporting] = useState(false);
  const [expandedWidget, setExpandedWidget] = useState<{ title: string; subtitle?: string } | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filterDateRange, setFilterDateRange] = useState('last-30-days');
  const [filterStatus, setFilterStatus] = useState<string[]>([]);
  const [filterRisk, setFilterRisk] = useState<string[]>([]);
  const [filterDepartment, setFilterDepartment] = useState<string[]>([]);

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

  const dashboard = DASHBOARDS.find(d => d.id === activeId)!;

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

                  {/* Auto refresh toggle */}
                  <button
                    onClick={() => {
                      setAutoRefresh(!autoRefresh);
                      addToast({ message: `Auto refresh ${!autoRefresh ? 'enabled' : 'disabled'}`, type: 'info' });
                    }}
                    className={`flex items-center gap-1.5 px-3 h-9 rounded-lg text-[12px] font-medium transition-colors cursor-pointer border ${
                      autoRefresh
                        ? 'border-brand-200 bg-brand-50 text-brand-700'
                        : 'border-canvas-border bg-canvas-elevated text-ink-500 hover:border-brand-200'
                    }`}
                  >
                    <Clock size={13} />
                    Auto refresh: {autoRefresh ? 'On' : 'Off'}
                  </button>

                  {/* Divider */}
                  <div className="w-px h-5 bg-canvas-border" />

                  {/* + Add Widget — primary CTA */}
                  <button
                    onClick={() => addToast({ message: 'Widget picker opening.', type: 'info' })}
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

            {/* Charts row — Interactive Widget Cards */}
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
                <WidgetCard
                  title={dashboard.donut.title}
                  subtitle="Distribution breakdown"
                  addToast={addToast}
                  onExpand={() => setExpandedWidget({ title: dashboard.donut!.title, subtitle: 'Distribution breakdown' })}
                  onEdit={() => addToast({ message: 'Edit widget opening.', type: 'info' })}
                  onDelete={() => addToast({ message: 'Widget deleted.', type: 'info' })}
                  onFilter={() => addToast({ message: 'Widget filter opening.', type: 'info' })}
                >
                  {/* Donut chart content */}
                  <div className="flex items-center gap-6">
                    <div className="relative shrink-0">
                      <svg width="110" height="110" viewBox="0 0 100 100">
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
                                key={s.label}
                                cx="50" cy="50" r="40" fill="none"
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
                    </div>
                    <div className="space-y-2 flex-1 min-w-0">
                      {dashboard.donut!.segments.map(s => (
                        <div key={s.label} className="flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
                            <span className="text-[12px] text-ink-600 truncate">{s.label}</span>
                          </div>
                          <span className="text-[12px] font-semibold text-ink-900 shrink-0 ml-2">
                            {dashboard.donut!.segments.reduce((a, s) => a + s.value, 0) > 100 ? s.value : `${s.value}%`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </WidgetCard>
              )}
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
                  {/* Bar chart content */}
                  <div className="flex items-end gap-2 h-36">
                    {dashboard.bars!.data.map((d, i) => {
                      const max = Math.max(...dashboard.bars!.data.map(dd => dd.value));
                      const height = (d.value / max) * 100;
                      return (
                        <div key={d.label} className="flex-1 flex flex-col items-center gap-1">
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
              {dashboard.progress && (
                <WidgetCard
                  title={dashboard.progress.title}
                  subtitle="Completion rates"
                  addToast={addToast}
                  onExpand={() => setExpandedWidget({ title: dashboard.progress!.title, subtitle: 'Completion rates' })}
                  onEdit={() => addToast({ message: 'Edit widget opening.', type: 'info' })}
                  onDelete={() => addToast({ message: 'Widget deleted.', type: 'info' })}
                  onFilter={() => addToast({ message: 'Widget filter opening.', type: 'info' })}
                >
                  {/* Progress chart content */}
                  <div className="space-y-3">
                    {dashboard.progress!.data.map((d, i) => (
                      <div key={d.label}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[12px] text-ink-600">{d.label}</span>
                          <span className="text-[12px] font-semibold text-ink-900">{d.value}%</span>
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
                </WidgetCard>
              )}
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
    </div>
  );
}
