import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlertTriangle, Shield, Activity, TrendingUp, TrendingDown,
  Plus, Settings, Maximize2, FileText, DollarSign,
  XCircle, Clock, Sparkles,
  ShoppingCart, CreditCard, BarChart3,
  Package, Receipt, Handshake, ShieldCheck
} from 'lucide-react';
import Orb from '../shared/Orb';

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

// ─── KPI Card ────────────────────────────────────────────────────────────────

function KpiCard({ title, value, change, trend, icon: Icon, color, index }: KpiDef & { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.05 }}
    >
      <div className="glass-card rounded-2xl p-5 group cursor-pointer">
        <div className="flex items-start justify-between mb-3">
          <div className={`p-2 rounded-lg ${color}`}>
            <Icon size={16} />
          </div>
        </div>
        <div className="text-2xl font-bold text-text">{value}</div>
        <div className="flex items-center justify-between mt-1">
          <div className="text-[11px] text-text-muted uppercase tracking-wider">{title}</div>
          <div className={`flex items-center gap-0.5 text-[11px] font-semibold ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {trend === 'up' ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {change}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Donut Chart ─────────────────────────────────────────────────────────────

function DonutChart({ title, segments, centerLabel }: { title: string; segments: DonutSegment[]; centerLabel?: string }) {
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
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-text">{title}</h3>
        <button className="p-1.5 rounded-md hover:bg-gray-50 transition-colors cursor-pointer">
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

function BarChart({ title, data, color }: { title: string; data: BarDatum[]; color: string }) {
  const max = Math.max(...data.map(d => d.value));

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-text">{title}</h3>
        <button className="p-1.5 rounded-md hover:bg-gray-50 transition-colors cursor-pointer">
          <Maximize2 size={12} className="text-text-muted hover:text-text-secondary" />
        </button>
      </div>
      <div className="flex items-end gap-2 h-36">
        {data.map((d, i) => {
          const height = (d.value / max) * 100;
          return (
            <div key={d.label} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] text-text-muted font-medium">
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
              <span className="text-[10px] text-text-muted">{d.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Progress Bars ───────────────────────────────────────────────────────────

function ProgressChart({ title, data }: { title: string; data: ProgressDatum[] }) {
  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-text">{title}</h3>
        <button className="p-1.5 rounded-md hover:bg-gray-50 transition-colors cursor-pointer">
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
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-text">{title}</h3>
        <button className="text-[11px] text-primary font-medium hover:underline cursor-pointer">View all</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border">
              {headers.map(h => (
                <th key={h} className="text-[11px] text-text-muted uppercase tracking-wider font-medium pb-2 pr-4">{h}</th>
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
                className="border-b border-border/50 last:border-0 hover:bg-surface-2 transition-colors cursor-pointer"
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
        <div className="text-[10px] text-text-muted uppercase tracking-widest font-semibold">Dashboards</div>
      </div>
      <nav className="flex-1 px-2 pb-4 space-y-1">
        {dashboards.map(d => {
          const isActive = d.id === activeId;
          return (
            <button
              key={d.id}
              onClick={() => onSelect(d.id)}
              className={`
                w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-[13px] font-medium transition-all cursor-pointer
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
    <div className="h-full flex bg-white bg-mesh-gradient relative overflow-hidden">
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
            className="max-w-6xl mx-auto px-8 py-8"
          >
            {/* Header */}
            <div className="flex items-end justify-between mb-6">
              <div>
                <div className="flex items-center gap-2.5">
                  <div className={`p-1.5 rounded-lg bg-gradient-to-br ${dashboard.accent} text-white`}>
                    <dashboard.icon size={16} />
                  </div>
                  <h1 className="text-xl font-bold text-text tracking-tight">{dashboard.name}</h1>
                </div>
                <p className="text-sm text-text-secondary mt-1 ml-9">{dashboard.subtitle}</p>
              </div>
              <div className="flex items-center gap-2">
                {onImportPowerBI && (
                  <button onClick={onImportPowerBI} className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg text-[13px] text-text-secondary hover:bg-white hover:border-primary/30 transition-colors cursor-pointer">
                    <Maximize2 size={14} />
                    Import from Power BI
                  </button>
                )}
                {onShare && (
                  <button onClick={onShare} className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg text-[13px] text-text-secondary hover:bg-white hover:border-primary/30 transition-colors cursor-pointer">
                    <Settings size={14} />
                    Share
                  </button>
                )}
                <button className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg text-[13px] text-text-secondary hover:bg-white transition-colors cursor-pointer">
                  <Settings size={14} />
                  Customize
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-[13px] font-semibold transition-colors cursor-pointer">
                  <Plus size={14} />
                  Add Widget
                </button>
              </div>
            </div>

            {/* AI Insight */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 }}
              className="bg-gradient-to-r from-primary-xlight via-white to-primary-xlight rounded-2xl border border-primary/10 p-4 mb-6 flex items-center gap-4 ai-shimmer"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-medium flex items-center justify-center shrink-0">
                <Sparkles size={16} className="text-white" />
              </div>
              <div className="flex-1">
                <div className="text-[12.5px] font-semibold text-text">AI Insight</div>
                <div className="text-[11.5px] text-text-secondary mt-0.5">
                  {dashboard.id === 'p2p' && '23 potential duplicate invoices detected this month. 3 vendors show spend anomalies exceeding 2-sigma threshold.'}
                  {dashboard.id === 'o2c' && 'DSO improved by 2 days. 5 customers account for 65% of outstanding receivables. Dispute rate trending upward in APAC region.'}
                  {dashboard.id === 's2c' && '12 contracts expire within 30 days. Vendor TechParts Ltd compliance score dropped below 75% threshold.'}
                  {dashboard.id === 'grc' && '2 critical risks in P2P have zero controls mapped. SOD violation detected in AP module.'}
                  <span className="text-primary font-semibold cursor-pointer hover:underline ml-1">Take action</span>
                </div>
              </div>
            </motion.div>

            {/* KPIs */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              {dashboard.kpis.map((kpi, i) => (
                <KpiCard key={kpi.title} {...kpi} index={i} />
              ))}
            </div>

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
                />
              )}
              {dashboard.bars && (
                <BarChart
                  title={dashboard.bars.title}
                  data={dashboard.bars.data}
                  color={dashboard.bars.color}
                />
              )}
              {dashboard.progress && (
                <ProgressChart
                  title={dashboard.progress.title}
                  data={dashboard.progress.data}
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
