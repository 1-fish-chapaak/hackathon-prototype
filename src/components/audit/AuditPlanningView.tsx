import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Lock, CheckCircle2, Flag, Target, Calendar,
  Users, ShieldCheck, ClipboardList, LayoutGrid,
  X, ChevronDown, Plus, Edit3, Trash2, AlertTriangle,
  DollarSign, BarChart3, Grid3X3, UserCheck,
  TrendingUp, Clock, Zap
} from 'lucide-react';
import Orb from '../shared/Orb';
import { useToast } from '../shared/Toast';

// ─── Types ───────────────────────────────────────────────────────────────────

type AuditStatus = 'planned' | 'active' | 'completed' | 'on-hold';
type AuditType = 'SOX' | 'IFC' | 'ITGC' | 'Internal' | 'Risk';
type ProcessType = 'P2P' | 'O2C' | 'R2R' | 'S2C' | 'Cross';
type PriorityLevel = 'Critical' | 'High' | 'Medium' | 'Low';
type TabId = 'timeline' | 'resources' | 'risk-matrix' | 'budget';

interface AuditEngagement {
  id: string;
  name: string;
  process: ProcessType;
  type: AuditType;
  owner: string;
  start: number;
  duration: number;
  color: string;
  status: AuditStatus;
  controls: number;
  plannedHours: number;
  priority: PriorityLevel;
  riskScore: number;
  notes: string;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  capacity: number;
  skills: string[];
}

// ─── Constants ───────────────────────────────────────────────────────────────

const COLOR_PALETTE = [
  '#6a12cd', '#0284c7', '#d97706', '#059669', '#7c3aed',
  '#dc2626', '#0891b2', '#c026d3', '#ea580c', '#4f46e5',
  '#16a34a', '#9333ea', '#e11d48', '#0d9488',
];

const MONTHS = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];

const PROCESSES: ProcessType[] = ['P2P', 'O2C', 'R2R', 'S2C', 'Cross'];
const AUDIT_TYPES: AuditType[] = ['SOX', 'IFC', 'ITGC', 'Internal', 'Risk'];
const STATUSES: AuditStatus[] = ['planned', 'active', 'completed', 'on-hold'];
const PRIORITIES: PriorityLevel[] = ['Critical', 'High', 'Medium', 'Low'];

const TEAM_MEMBERS: TeamMember[] = [
  { id: 'tm-1', name: 'Tushar Goel', role: 'Senior Auditor', avatar: 'TG', capacity: 160, skills: ['P2P', 'SOX', 'AP'] },
  { id: 'tm-2', name: 'Deepak Bansal', role: 'IT Audit Specialist', avatar: 'DB', capacity: 160, skills: ['ITGC', 'Security', 'Access'] },
  { id: 'tm-3', name: 'Neha Joshi', role: 'Senior Auditor', avatar: 'NJ', capacity: 160, skills: ['O2C', 'Revenue', 'SOX'] },
  { id: 'tm-4', name: 'Karan Mehta', role: 'Audit Manager', avatar: 'KM', capacity: 120, skills: ['SOX', 'R2R', 'Planning'] },
  { id: 'tm-5', name: 'Sneha Desai', role: 'Risk Analyst', avatar: 'SD', capacity: 160, skills: ['Risk', 'IFC', 'S2C'] },
  { id: 'tm-6', name: 'Rohan Patel', role: 'Staff Auditor', avatar: 'RP', capacity: 160, skills: ['S2C', 'Contracts', 'Vendor'] },
  { id: 'tm-7', name: 'Priya Singh', role: 'Staff Auditor', avatar: 'PS', capacity: 160, skills: ['P2P', 'Vendor', 'Risk'] },
];

const INITIAL_AUDIT_PLAN: AuditEngagement[] = [
  { id: 'ap-1', name: 'P2P — SOX Audit', process: 'P2P', type: 'SOX', owner: 'Tushar Goel', start: 0, duration: 3, color: '#6a12cd', status: 'active', controls: 24, plannedHours: 480, priority: 'Critical', riskScore: 85, notes: 'Covers AP, PO, and vendor master controls.' },
  { id: 'ap-2', name: 'O2C — SOX Audit', process: 'O2C', type: 'SOX', owner: 'Neha Joshi', start: 1, duration: 3, color: '#0284c7', status: 'active', controls: 18, plannedHours: 360, priority: 'High', riskScore: 72, notes: 'Revenue recognition and AR controls.' },
  { id: 'ap-3', name: 'R2R — SOX Audit', process: 'R2R', type: 'SOX', owner: 'Karan Mehta', start: 0, duration: 4, color: '#d97706', status: 'active', controls: 31, plannedHours: 520, priority: 'Critical', riskScore: 90, notes: 'Journal entries, reconciliations, close process.' },
  { id: 'ap-4', name: 'S2C — Contract Review', process: 'S2C', type: 'Internal', owner: 'Rohan Patel', start: 3, duration: 3, color: '#059669', status: 'planned', controls: 14, plannedHours: 240, priority: 'Medium', riskScore: 45, notes: 'New contract lifecycle review.' },
  { id: 'ap-5', name: 'P2P — IFC Assessment', process: 'P2P', type: 'IFC', owner: 'Sneha Desai', start: 4, duration: 3, color: '#6a12cd', status: 'planned', controls: 18, plannedHours: 300, priority: 'High', riskScore: 68, notes: 'Internal financial controls assessment for P2P.' },
  { id: 'ap-6', name: 'IT General Controls', process: 'Cross', type: 'ITGC', owner: 'Deepak Bansal', start: 2, duration: 6, color: '#7c3aed', status: 'active', controls: 15, plannedHours: 640, priority: 'Critical', riskScore: 82, notes: 'Access mgmt, change mgmt, operations, SDLC.' },
  { id: 'ap-7', name: 'Vendor Risk Assessment', process: 'P2P', type: 'Risk', owner: 'Priya Singh', start: 6, duration: 2, color: '#dc2626', status: 'planned', controls: 8, plannedHours: 160, priority: 'Medium', riskScore: 55, notes: 'Third-party vendor risk evaluation.' },
  { id: 'ap-8', name: 'Year-End Close Review', process: 'R2R', type: 'SOX', owner: 'Karan Mehta', start: 9, duration: 2, color: '#d97706', status: 'planned', controls: 12, plannedHours: 200, priority: 'High', riskScore: 60, notes: 'Year-end closing procedures and adjustments.' },
];

const MILESTONES = [
  { month: 2, label: 'Q1 Review', icon: Flag },
  { month: 5, label: 'Mid-Year Assessment', icon: Target },
  { month: 8, label: 'Q3 Review', icon: Flag },
  { month: 11, label: 'Year-End Close', icon: CheckCircle2 },
];

const SIGNOFF_LOG = [
  { name: 'Karan Mehta', role: 'Audit Manager', action: 'Plan Created', date: 'Jan 15, 2026', status: 'completed' as const },
  { name: 'Sneha Desai', role: 'Risk Lead', action: 'Risk Assessment Review', date: 'Feb 10, 2026', status: 'completed' as const },
  { name: 'Abhinav S', role: 'Audit Director', action: 'Final Sign-Off', date: 'Mar 1, 2026', status: 'pending' as const },
];

const SIGNERS = ['Karan Mehta', 'Sneha Desai', 'Abhinav S'];

const RESOURCE_ALLOCATION: Record<string, Record<number, number>> = {
  'Tushar Goel':  { 0: 80, 1: 80, 2: 60, 3: 0, 4: 40, 5: 40, 6: 80, 7: 40 },
  'Deepak Bansal': { 2: 60, 3: 80, 4: 80, 5: 80, 6: 60, 7: 60 },
  'Neha Joshi':   { 1: 80, 2: 80, 3: 60, 4: 0, 5: 0, 6: 0, 7: 40, 8: 40 },
  'Karan Mehta':  { 0: 60, 1: 60, 2: 80, 3: 40, 4: 0, 5: 20, 6: 20, 7: 20, 8: 20, 9: 60, 10: 60 },
  'Sneha Desai':  { 4: 80, 5: 80, 6: 60, 7: 0, 8: 40, 9: 40 },
  'Rohan Patel':  { 3: 60, 4: 60, 5: 60, 6: 0, 7: 40, 8: 40 },
  'Priya Singh':  { 6: 80, 7: 80, 8: 0, 9: 40, 10: 40 },
};

const ENGAGEMENT_RISKS = [
  { id: 'ap-1', name: 'P2P SOX', likelihood: 4, impact: 5, score: 20 },
  { id: 'ap-2', name: 'O2C SOX', likelihood: 3, impact: 4, score: 12 },
  { id: 'ap-3', name: 'R2R SOX', likelihood: 3, impact: 5, score: 15 },
  { id: 'ap-4', name: 'S2C Review', likelihood: 2, impact: 3, score: 6 },
  { id: 'ap-5', name: 'P2P IFC', likelihood: 3, impact: 3, score: 9 },
  { id: 'ap-6', name: 'ITGC', likelihood: 4, impact: 4, score: 16 },
  { id: 'ap-7', name: 'Vendor Risk', likelihood: 5, impact: 3, score: 15 },
  { id: 'ap-8', name: 'Year-End', likelihood: 2, impact: 4, score: 8 },
];

const BUDGET_DATA = [
  { id: 'ap-1', name: 'P2P — SOX Audit', plannedHours: 480, actualHours: 320, budget: 48000, spent: 32000, variance: -16000 },
  { id: 'ap-2', name: 'O2C — SOX Audit', plannedHours: 360, actualHours: 180, budget: 36000, spent: 18000, variance: -18000 },
  { id: 'ap-3', name: 'R2R — SOX Audit', plannedHours: 520, actualHours: 400, budget: 52000, spent: 40000, variance: -12000 },
  { id: 'ap-4', name: 'S2C — Contract Review', plannedHours: 240, actualHours: 0, budget: 24000, spent: 0, variance: -24000 },
  { id: 'ap-5', name: 'P2P — IFC Assessment', plannedHours: 300, actualHours: 0, budget: 30000, spent: 0, variance: -30000 },
  { id: 'ap-6', name: 'IT General Controls', plannedHours: 640, actualHours: 380, budget: 64000, spent: 38000, variance: -26000 },
  { id: 'ap-7', name: 'Vendor Risk Assessment', plannedHours: 160, actualHours: 0, budget: 16000, spent: 0, variance: -16000 },
  { id: 'ap-8', name: 'Year-End Close Review', plannedHours: 200, actualHours: 0, budget: 20000, spent: 0, variance: -20000 },
];

// FY26: Apr 2025 = 0, Mar 2026 = 11.
function getCurrentMonth(): number {
  return 11;
}

function getCurrentMonthProgress(): number {
  return 11 + 0.8;
}

// ─── Custom Dropdown ─────────────────────────────────────────────────────────

function Dropdown<T extends string>({
  label, value, options, onChange, disabled = false, renderOption,
}: {
  label: string;
  value: T;
  options: T[];
  onChange: (val: T) => void;
  disabled?: boolean;
  renderOption?: (opt: T) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="mb-3">
      <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block mb-1.5">{label}</label>
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setOpen(p => !p)}
          className={`w-full flex items-center justify-between px-3 py-2.5 border border-border rounded-lg text-[13px] transition-colors bg-white ${
            disabled ? 'bg-surface-2 text-text-muted cursor-not-allowed' : 'text-text hover:border-primary/30 cursor-pointer'
          }`}
        >
          <span>{renderOption ? renderOption(value) : value}</span>
          {!disabled && <ChevronDown size={14} className={`text-text-muted transition-transform ${open ? 'rotate-180' : ''}`} />}
        </button>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.12 }}
              className="absolute left-0 right-0 top-full mt-1 bg-white border border-border-light rounded-xl shadow-lg overflow-hidden z-50 max-h-48 overflow-y-auto"
            >
              {options.map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => { onChange(opt); setOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-[12px] transition-colors cursor-pointer ${
                    value === opt ? 'bg-primary/10 text-primary font-semibold' : 'text-text-secondary hover:bg-surface-2'
                  }`}
                >
                  {renderOption ? renderOption(opt) : opt}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── KPI Card ────────────────────────────────────────────────────────────────

function KpiCard({ label, value, icon: Icon, color, index }: {
  label: string; value: string | number; icon: React.ElementType; color: string; index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.06 }}
      className="glass-card rounded-2xl p-5 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300 group cursor-default"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg ${color} group-hover:scale-110 transition-transform duration-300`}>
          <Icon size={16} />
        </div>
      </div>
      <div className="text-2xl font-bold text-text">{value}</div>
      <div className="text-[11px] text-text-muted uppercase tracking-wider mt-1">{label}</div>
    </motion.div>
  );
}

// ─── Gantt Tooltip ───────────────────────────────────────────────────────────

function GanttTooltip({ item, position }: { item: AuditEngagement; position: { x: number; y: number } }) {
  const startMonth = MONTHS[item.start];
  const endMonth = MONTHS[(item.start + item.duration - 1) % 12];

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.1 }}
      className="fixed z-[60] pointer-events-none"
      style={{ left: position.x + 12, top: position.y - 8 }}
    >
      <div className="glass-card-strong rounded-xl p-3 shadow-xl min-w-[220px]">
        <div className="text-[12px] font-bold text-text mb-1.5">{item.name}</div>
        <div className="space-y-1">
          <div className="flex justify-between text-[10px]">
            <span className="text-text-muted">Owner</span>
            <span className="text-text font-medium">{item.owner}</span>
          </div>
          <div className="flex justify-between text-[10px]">
            <span className="text-text-muted">Duration</span>
            <span className="text-text font-medium">{item.duration} months ({startMonth} — {endMonth})</span>
          </div>
          <div className="flex justify-between text-[10px]">
            <span className="text-text-muted">Controls</span>
            <span className="text-text font-medium">{item.controls}</span>
          </div>
          <div className="flex justify-between text-[10px]">
            <span className="text-text-muted">Status</span>
            <span className={`font-bold px-1.5 py-0.5 rounded-full ${
              item.status === 'active' ? 'bg-compliant-50 text-compliant-700' :
              item.status === 'completed' ? 'bg-evidence-50 text-evidence-700' :
              item.status === 'on-hold' ? 'bg-high-50 text-high-700' :
              'bg-paper-50 text-ink-500'
            }`}>{item.status}</span>
          </div>
          <div className="flex justify-between text-[10px]">
            <span className="text-text-muted">Priority</span>
            <span className={`font-bold ${
              item.priority === 'Critical' ? 'text-risk-700' :
              item.priority === 'High' ? 'text-high-700' :
              item.priority === 'Medium' ? 'text-mitigated-700' :
              'text-compliant-700'
            }`}>{item.priority}</span>
          </div>
          <div className="flex justify-between text-[10px]">
            <span className="text-text-muted">Risk Score</span>
            <span className="text-text font-medium">{item.riskScore}/100</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Gantt Chart ─────────────────────────────────────────────────────────────

function GanttChart({
  items, frozen, onClickEngagement, processFilter, statusFilter,
}: {
  items: AuditEngagement[];
  frozen: boolean;
  onClickEngagement: (item: AuditEngagement) => void;
  processFilter: string;
  statusFilter: string;
}) {
  const totalMonths = 12;
  const currentMonth = getCurrentMonth();
  const [hoveredItem, setHoveredItem] = useState<AuditEngagement | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const filtered = items.filter(item => {
    if (processFilter !== 'All' && item.process !== processFilter) return false;
    if (statusFilter !== 'All' && item.status !== statusFilter.toLowerCase()) return false;
    return true;
  });

  const handleMouseMove = useCallback((e: React.MouseEvent, item: AuditEngagement) => {
    setTooltipPos({ x: e.clientX, y: e.clientY });
    setHoveredItem(item);
  }, []);

  return (
    <div className="glass-card rounded-2xl overflow-hidden relative">
      {frozen && (
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 px-2 py-1 bg-evidence-50/80 backdrop-blur-sm border border-evidence rounded-md">
          <Lock size={10} className="text-evidence-700" />
          <span className="text-[9px] font-semibold text-evidence-700">Locked</span>
        </div>
      )}

      {/* Header row */}
      <div className="flex border-b border-border-light">
        <div className="w-[280px] shrink-0 px-4 py-3 bg-surface-2 border-r border-border-light">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Engagement</span>
        </div>
        <div className="flex-1 flex">
          {MONTHS.map((m, i) => (
            <div
              key={m}
              className={`flex-1 px-2 py-3 text-center text-[10px] font-bold uppercase tracking-wider border-r border-border-light last:border-0 ${
                i === currentMonth ? 'bg-primary/5 text-primary' : 'bg-surface-2 text-text-muted'
              }`}
            >
              {m}
            </div>
          ))}
        </div>
      </div>

      {/* Rows */}
      {filtered.length === 0 ? (
        <div className="px-6 py-8 text-center text-[13px] text-text-muted">No engagements match the current filters.</div>
      ) : filtered.map((item, idx) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.05 }}
          className="flex border-b border-border-light last:border-0 hover:bg-primary-xlight/30 transition-colors group"
        >
          {/* Label */}
          <div
            className="w-[280px] shrink-0 px-4 py-3 border-r border-border-light cursor-pointer"
            onClick={() => onClickEngagement(item)}
          >
            <div className="text-[12px] font-semibold text-text group-hover:text-primary transition-colors flex items-center gap-1.5">
              {item.name}
              <Edit3 size={10} className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] text-text-muted">{item.owner}</span>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                item.status === 'active' ? 'bg-compliant-50 text-compliant-700' :
                item.status === 'completed' ? 'bg-evidence-50 text-evidence-700' :
                item.status === 'on-hold' ? 'bg-high-50 text-high-700' :
                'bg-paper-50 text-ink-500'
              }`}>{item.status}</span>
              <span className="text-[9px] text-text-muted">{item.controls} controls</span>
            </div>
          </div>

          {/* Bar area */}
          <div className="flex-1 relative py-2 flex items-center">
            <div className="absolute inset-0 flex">
              {MONTHS.map((_, i) => (
                <div key={i} className={`flex-1 border-r border-border-light/50 ${i === currentMonth ? 'bg-primary/[0.03]' : ''}`} />
              ))}
            </div>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(item.duration / totalMonths) * 100}%` }}
              transition={{ duration: 0.6, delay: 0.2 + idx * 0.05 }}
              className="absolute h-7 rounded-lg shadow-sm flex items-center px-2 cursor-pointer hover:shadow-md hover:brightness-110 transition-all"
              style={{
                left: `${(item.start / totalMonths) * 100}%`,
                background: `linear-gradient(135deg, ${item.color}dd, ${item.color}99)`,
              }}
              onClick={() => onClickEngagement(item)}
              onMouseMove={(e) => handleMouseMove(e, item)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <span className="text-[9px] font-bold text-white truncate">{item.type}</span>
            </motion.div>
          </div>
        </motion.div>
      ))}

      {/* Today marker */}
      <div
        className="absolute top-0 bottom-0 w-px bg-red-400 z-10 pointer-events-none"
        style={{
          left: `calc(280px + ((100% - 280px) * ${getCurrentMonthProgress() / 12}))`,
        }}
      >
        <div className="absolute -top-0 -translate-x-1/2 bg-red-400 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-b-md">
          Today
        </div>
      </div>

      {/* Tooltip */}
      <AnimatePresence>
        {hoveredItem && <GanttTooltip item={hoveredItem} position={tooltipPos} />}
      </AnimatePresence>
    </div>
  );
}

// ─── Milestones ──────────────────────────────────────────────────────────────

function MilestonesStrip() {
  const currentMonth = getCurrentMonth();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="glass-card rounded-2xl p-4 mt-4"
    >
      <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-3">Key Milestones</div>
      <div className="relative flex items-center">
        <div className="absolute left-0 right-0 h-px bg-border-light top-1/2" />
        <div className="flex-1 flex justify-between relative">
          {MILESTONES.map((ms, i) => {
            const isPast = ms.month <= currentMonth;
            return (
              <motion.div
                key={ms.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + i * 0.08 }}
                className="flex flex-col items-center gap-1.5 relative"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                  isPast
                    ? 'bg-compliant-50 border-green-300 text-compliant-700'
                    : 'bg-white border-border-light text-text-muted'
                } transition-colors`}>
                  <ms.icon size={13} />
                </div>
                <span className={`text-[10px] font-semibold ${isPast ? 'text-compliant-700' : 'text-text-muted'}`}>
                  {ms.label}
                </span>
                <span className="text-[9px] text-text-muted">{MONTHS[ms.month]}</span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Resources Tab ───────────────────────────────────────────────────────────

function ResourcesTab() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="space-y-6"
    >
      {/* Team Roster */}
      <div>
        <h3 className="text-[13px] font-bold text-text mb-3 flex items-center gap-2">
          <Users size={14} className="text-primary" />
          Team Roster
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {TEAM_MEMBERS.map((member, idx) => {
            const alloc = RESOURCE_ALLOCATION[member.name] || {};
            const totalHours = Object.values(alloc).reduce((s, h) => s + h, 0);
            const totalCapacity = member.capacity * 12;
            const utilization = Math.round((totalHours / totalCapacity) * 100);
            const barColor = utilization > 100 ? 'bg-risk-500' : utilization > 80 ? 'bg-mitigated-500' : 'bg-compliant-500';

            return (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * idx }}
                className="glass-card rounded-2xl p-4 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary-medium text-white flex items-center justify-center text-[11px] font-bold">
                    {member.avatar}
                  </div>
                  <div>
                    <div className="text-[12px] font-semibold text-text">{member.name}</div>
                    <div className="text-[10px] text-text-muted">{member.role}</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {member.skills.map(skill => (
                    <span key={skill} className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
                      {skill}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between text-[10px] mb-1.5">
                  <span className="text-text-muted">{totalHours}h / {totalCapacity}h</span>
                  <span className={`font-bold ${utilization > 100 ? 'text-risk-700' : utilization > 80 ? 'text-mitigated-700' : 'text-compliant-700'}`}>
                    {utilization}%
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-surface-2 overflow-hidden">
                  <div className={`h-full rounded-full ${barColor} transition-all duration-500`} style={{ width: `${Math.min(utilization, 100)}%` }} />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Resource Heatmap */}
      <div>
        <h3 className="text-[13px] font-bold text-text mb-3 flex items-center gap-2">
          <Grid3X3 size={14} className="text-primary" />
          Resource Heatmap
        </h3>
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-light">
                  <th className="text-[10px] font-bold text-text-muted uppercase tracking-wider px-4 py-3 text-left bg-surface-2 min-w-[160px]">Team Member</th>
                  {MONTHS.map(m => (
                    <th key={m} className="text-[10px] font-bold text-text-muted uppercase tracking-wider px-1 py-3 text-center bg-surface-2 min-w-[56px]">{m}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TEAM_MEMBERS.map((member, idx) => {
                  const alloc = RESOURCE_ALLOCATION[member.name] || {};
                  return (
                    <motion.tr
                      key={member.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.03 * idx }}
                      className="border-b border-border-light/50 last:border-0"
                    >
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-primary-medium text-white flex items-center justify-center text-[8px] font-bold shrink-0">
                            {member.avatar}
                          </div>
                          <span className="text-[11px] font-medium text-text">{member.name}</span>
                        </div>
                      </td>
                      {MONTHS.map((_, mIdx) => {
                        const hours = alloc[mIdx] || 0;
                        return (
                          <td key={mIdx} className="px-1 py-1.5">
                            <div className={`w-full h-8 rounded flex items-center justify-center text-[9px] font-bold ${
                              hours > 100 ? 'bg-risk-50 text-risk-700' :
                              hours > 60 ? 'bg-mitigated-50 text-mitigated-700' :
                              hours > 0 ? 'bg-compliant-50 text-compliant-700' :
                              'bg-surface-2 text-text-muted/30'
                            }`}>
                              {hours > 0 ? `${hours}h` : '\u2014'}
                            </div>
                          </td>
                        );
                      })}
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {/* Legend */}
          <div className="px-4 py-2.5 border-t border-border-light flex items-center gap-4">
            <span className="text-[9px] font-semibold text-text-muted uppercase tracking-wider">Legend:</span>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-compliant-50 border border-compliant" /><span className="text-[9px] text-text-muted">&lt; 40h (Available)</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-mitigated-50 border border-mitigated" /><span className="text-[9px] text-text-muted">40–80h (Loaded)</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-risk-50 border border-red-300" /><span className="text-[9px] text-text-muted">&gt; 100h (Overloaded)</span></div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Risk Matrix Tab ─────────────────────────────────────────────────────────

function RiskMatrixTab() {
  const gridColors: Record<string, string> = {};
  for (let l = 1; l <= 5; l++) {
    for (let i = 1; i <= 5; i++) {
      const score = l * i;
      gridColors[`${l}-${i}`] =
        score >= 15 ? 'bg-risk-50/80 border-risk' :
        score >= 10 ? 'bg-high-50/80 border-high' :
        score >= 5 ? 'bg-mitigated-50/80 border-mitigated' :
        'bg-compliant-50/80 border-compliant';
    }
  }

  const sorted = [...ENGAGEMENT_RISKS].sort((a, b) => b.score - a.score);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="space-y-6"
    >
      {/* 5×5 Matrix */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-[13px] font-bold text-text mb-4 flex items-center gap-2">
          <AlertTriangle size={14} className="text-primary" />
          Risk Heat Map — Likelihood vs Impact
        </h3>
        <div className="flex">
          {/* Y axis label */}
          <div className="flex flex-col items-center justify-center mr-2">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider [writing-mode:vertical-lr] rotate-180">
              Likelihood
            </span>
          </div>
          <div className="flex-1">
            {/* Grid */}
            <div className="grid grid-cols-5 gap-1.5">
              {[5, 4, 3, 2, 1].map(likelihood =>
                [1, 2, 3, 4, 5].map(impact => {
                  const cellKey = `${likelihood}-${impact}`;
                  const engagements = ENGAGEMENT_RISKS.filter(e => e.likelihood === likelihood && e.impact === impact);
                  return (
                    <div
                      key={cellKey}
                      className={`aspect-square rounded-xl border flex flex-col items-center justify-center gap-0.5 p-1 ${gridColors[cellKey]} transition-all hover:scale-105`}
                    >
                      {engagements.length > 0 ? engagements.map(e => (
                        <span key={e.id} className="text-[8px] font-bold bg-white/80 backdrop-blur-sm rounded px-1 py-0.5 text-text truncate max-w-full text-center shadow-sm">
                          {e.name}
                        </span>
                      )) : (
                        <span className="text-[8px] text-text-muted/30 font-medium">{likelihood * impact}</span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
            {/* X axis label */}
            <div className="flex justify-between mt-2 px-1">
              {[1, 2, 3, 4, 5].map(n => (
                <span key={n} className="text-[9px] font-semibold text-text-muted flex-1 text-center">{n}</span>
              ))}
            </div>
            <div className="text-center mt-1">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Impact</span>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border-light">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-compliant-50 border border-compliant" /><span className="text-[9px] text-text-muted">Low (1-4)</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-mitigated-50 border border-mitigated" /><span className="text-[9px] text-text-muted">Medium (5-9)</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-high-50 border border-high" /><span className="text-[9px] text-text-muted">High (10-14)</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-risk-50 border border-risk" /><span className="text-[9px] text-text-muted">Critical (15+)</span></div>
        </div>
      </div>

      {/* Sorted priority list */}
      <div className="glass-card rounded-2xl p-5">
        <h3 className="text-[13px] font-bold text-text mb-3 flex items-center gap-2">
          <TrendingUp size={14} className="text-primary" />
          Suggested Priority Order
        </h3>
        <div className="space-y-2">
          {sorted.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.03 * idx }}
              className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-surface-2 transition-colors"
            >
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold text-white ${
                idx === 0 ? 'bg-risk-500' : idx < 3 ? 'bg-high-500' : idx < 5 ? 'bg-mitigated-500' : 'bg-compliant-500'
              }`}>
                {idx + 1}
              </div>
              <div className="flex-1">
                <span className="text-[12px] font-semibold text-text">{item.name}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-[10px] text-text-muted">
                  L={item.likelihood} / I={item.impact}
                </div>
                <div className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  item.score >= 15 ? 'bg-risk-50 text-risk-700' :
                  item.score >= 10 ? 'bg-high-50 text-high-700' :
                  item.score >= 5 ? 'bg-mitigated-50 text-mitigated-700' :
                  'bg-compliant-50 text-compliant-700'
                }`}>
                  Score: {item.score}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Budget Tab ──────────────────────────────────────────────────────────────

function BudgetTab() {
  const totalBudget = BUDGET_DATA.reduce((s, b) => s + b.budget, 0);
  const totalSpent = BUDGET_DATA.reduce((s, b) => s + b.spent, 0);
  const remaining = totalBudget - totalSpent;
  const utilization = Math.round((totalSpent / totalBudget) * 100);

  const fmt = (n: number) => {
    if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
    return `$${n}`;
  };

  const budgetKpis = [
    { label: 'Total Budget', value: fmt(totalBudget), icon: DollarSign, color: 'text-primary bg-primary-xlight' },
    { label: 'Spent', value: fmt(totalSpent), icon: TrendingUp, color: 'text-evidence-700 bg-evidence-50' },
    { label: 'Remaining', value: fmt(remaining), icon: Clock, color: 'text-compliant-700 bg-compliant-50' },
    { label: 'Utilization', value: `${utilization}%`, icon: Zap, color: 'text-high-700 bg-high-50' },
  ];

  const maxBudget = Math.max(...BUDGET_DATA.map(b => b.budget));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="space-y-6"
    >
      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4">
        {budgetKpis.map((kpi, idx) => (
          <KpiCard key={kpi.label} label={kpi.label} value={kpi.value} icon={kpi.icon} color={kpi.color} index={idx} />
        ))}
      </div>

      {/* Budget Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border-light">
              {['Engagement', 'Planned Hrs', 'Actual Hrs', '% Complete', 'Budget', 'Spent', 'Variance'].map(col => (
                <th key={col} className="text-[10px] font-bold text-text-muted uppercase tracking-wider px-4 py-3 bg-surface-2">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {BUDGET_DATA.map((row, idx) => {
              const pct = row.plannedHours > 0 ? Math.round((row.actualHours / row.plannedHours) * 100) : 0;
              return (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.03 * idx }}
                  className="border-b border-border-light/50 last:border-0 hover:bg-primary-xlight/30 transition-colors"
                >
                  <td className="text-[12px] font-semibold text-text px-4 py-3">{row.name}</td>
                  <td className="text-[12px] text-text-secondary px-4 py-3">{row.plannedHours}</td>
                  <td className="text-[12px] text-text-secondary px-4 py-3">{row.actualHours}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-surface-2 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-text-muted">{pct}%</span>
                    </div>
                  </td>
                  <td className="text-[12px] text-text-secondary px-4 py-3">${row.budget.toLocaleString()}</td>
                  <td className="text-[12px] text-text-secondary px-4 py-3">${row.spent.toLocaleString()}</td>
                  <td className={`text-[12px] font-semibold px-4 py-3 ${row.variance < 0 ? 'text-compliant-700' : 'text-risk-700'}`}>
                    {row.variance < 0 ? '-' : '+'}${Math.abs(row.variance).toLocaleString()}
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Budget vs Actual bars */}
      <div className="glass-card rounded-2xl p-5">
        <h3 className="text-[13px] font-bold text-text mb-4 flex items-center gap-2">
          <BarChart3 size={14} className="text-primary" />
          Budget vs Actual
        </h3>
        <div className="space-y-3">
          {BUDGET_DATA.map((row, idx) => (
            <motion.div
              key={row.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.03 * idx }}
            >
              <div className="flex items-center gap-3 mb-1">
                <span className="text-[11px] font-medium text-text w-[180px] truncate">{row.name}</span>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="h-3 rounded-r bg-primary/30" style={{ width: `${(row.budget / maxBudget) * 100}%` }} />
                    <span className="text-[9px] text-text-muted whitespace-nowrap">{fmt(row.budget)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 rounded-r bg-primary" style={{ width: `${(row.spent / maxBudget) * 100}%` }} />
                    <span className="text-[9px] text-text-secondary font-semibold whitespace-nowrap">{fmt(row.spent)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="flex items-center gap-6 mt-4 pt-3 border-t border-border-light">
          <div className="flex items-center gap-1.5"><div className="w-4 h-2.5 rounded bg-primary/30" /><span className="text-[9px] text-text-muted">Planned Budget</span></div>
          <div className="flex items-center gap-1.5"><div className="w-4 h-2.5 rounded bg-primary" /><span className="text-[9px] text-text-muted">Actual Spend</span></div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Engagement Drawer ───────────────────────────────────────────────────────

function EngagementDrawer({
  engagement, isCreate, frozen, onClose, onSave, onDelete,
}: {
  engagement: AuditEngagement;
  isCreate: boolean;
  frozen: boolean;
  onClose: () => void;
  onSave: (updated: AuditEngagement) => void;
  onDelete: (id: string) => void;
}) {
  const [form, setForm] = useState<AuditEngagement>({ ...engagement });
  const [assignDropdownOpen, setAssignDropdownOpen] = useState(false);

  const update = <K extends keyof AuditEngagement>(key: K, value: AuditEngagement[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const readOnly = frozen && !isCreate;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Drawer */}
      <motion.div
        initial={{ x: 420 }}
        animate={{ x: 0 }}
        exit={{ x: 420 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed right-0 top-0 bottom-0 w-[400px] z-50 glass-card-strong border-l border-border-light shadow-2xl overflow-y-auto"
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[15px] font-bold text-text">
              {isCreate ? 'Add Engagement' : 'Edit Engagement'}
            </h3>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-2 transition-colors cursor-pointer">
              <X size={16} className="text-text-muted" />
            </button>
          </div>

          {/* Frozen banner */}
          {readOnly && (
            <div className="flex items-center gap-2.5 p-3 bg-evidence-50 rounded-xl mb-5 border border-evidence">
              <Lock size={14} className="text-evidence-700 shrink-0" />
              <span className="text-[12px] text-evidence-700 font-medium">Plan is frozen — fields are read-only.</span>
            </div>
          )}

          {/* Fields */}
          <div className="space-y-0">
            {/* Name */}
            <div className="mb-3">
              <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block mb-1.5">Engagement Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                disabled={readOnly}
                className={`w-full px-3 py-2.5 border border-border rounded-lg text-[13px] text-text focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all ${
                  readOnly ? 'bg-surface-2 text-text-muted cursor-not-allowed' : 'bg-white'
                }`}
              />
            </div>

            <Dropdown<ProcessType>
              label="Process"
              value={form.process}
              options={PROCESSES}
              onChange={(v) => update('process', v)}
              disabled={readOnly}
            />

            <Dropdown<AuditType>
              label="Audit Type"
              value={form.type}
              options={AUDIT_TYPES}
              onChange={(v) => update('type', v)}
              disabled={readOnly}
            />

            <Dropdown<AuditStatus>
              label="Status"
              value={form.status}
              options={STATUSES}
              onChange={(v) => update('status', v)}
              disabled={readOnly}
            />

            <Dropdown<string>
              label="Lead Auditor"
              value={form.owner}
              options={TEAM_MEMBERS.map(m => m.name)}
              onChange={(v) => update('owner', v)}
              disabled={readOnly}
            />

            <Dropdown<string>
              label="Start Month"
              value={MONTHS[form.start]}
              options={MONTHS}
              onChange={(v) => update('start', MONTHS.indexOf(v))}
              disabled={readOnly}
            />

            {/* Duration */}
            <div className="mb-3">
              <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block mb-1.5">Duration (months)</label>
              <input
                type="number"
                min={1}
                max={12}
                value={form.duration}
                onChange={(e) => update('duration', Math.max(1, Math.min(12, parseInt(e.target.value) || 1)))}
                disabled={readOnly}
                className={`w-full px-3 py-2.5 border border-border rounded-lg text-[13px] text-text focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all ${
                  readOnly ? 'bg-surface-2 text-text-muted cursor-not-allowed' : 'bg-white'
                }`}
              />
            </div>

            {/* Planned Hours */}
            <div className="mb-3">
              <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block mb-1.5">Planned Hours</label>
              <input
                type="number"
                min={0}
                value={form.plannedHours}
                onChange={(e) => update('plannedHours', Math.max(0, parseInt(e.target.value) || 0))}
                disabled={readOnly}
                className={`w-full px-3 py-2.5 border border-border rounded-lg text-[13px] text-text focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all ${
                  readOnly ? 'bg-surface-2 text-text-muted cursor-not-allowed' : 'bg-white'
                }`}
              />
            </div>

            <Dropdown<PriorityLevel>
              label="Priority"
              value={form.priority}
              options={PRIORITIES}
              onChange={(v) => update('priority', v)}
              disabled={readOnly}
              renderOption={(opt) => (
                <span className={`font-semibold ${
                  opt === 'Critical' ? 'text-risk-700' :
                  opt === 'High' ? 'text-high-700' :
                  opt === 'Medium' ? 'text-mitigated-700' :
                  'text-compliant-700'
                }`}>{opt}</span>
              )}
            />

            {/* Risk Score */}
            <div className="mb-3">
              <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block mb-1.5">Risk Score (1-100)</label>
              <input
                type="number"
                min={1}
                max={100}
                value={form.riskScore}
                onChange={(e) => update('riskScore', Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                disabled={readOnly}
                className={`w-full px-3 py-2.5 border border-border rounded-lg text-[13px] text-text focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all ${
                  readOnly ? 'bg-surface-2 text-text-muted cursor-not-allowed' : 'bg-white'
                }`}
              />
            </div>

            {/* Notes */}
            <div className="mb-3">
              <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block mb-1.5">Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => update('notes', e.target.value)}
                disabled={readOnly}
                placeholder="Additional notes..."
                className={`w-full px-3 py-2.5 border border-border rounded-lg text-[13px] text-text focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all resize-none h-20 ${
                  readOnly ? 'bg-surface-2 text-text-muted cursor-not-allowed' : 'bg-white placeholder:text-text-muted/50'
                }`}
              />
            </div>

            {/* Assign Resource */}
            {!readOnly && (
              <div className="mb-3">
                <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block mb-1.5">Assign Resource</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setAssignDropdownOpen(p => !p)}
                    className="w-full flex items-center justify-between px-3 py-2.5 border border-border rounded-lg text-[13px] text-text hover:border-primary/30 transition-colors cursor-pointer bg-white"
                  >
                    <span className="flex items-center gap-2">
                      <UserCheck size={13} className="text-primary" />
                      Assign team member...
                    </span>
                    <ChevronDown size={14} className={`text-text-muted transition-transform ${assignDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {assignDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.12 }}
                        className="absolute left-0 right-0 top-full mt-1 bg-white border border-border-light rounded-xl shadow-lg overflow-hidden z-50 max-h-60 overflow-y-auto"
                      >
                        {TEAM_MEMBERS.map(member => {
                          const hasSkillMatch = member.skills.some(s =>
                            s === form.process || s === form.type ||
                            form.name.toLowerCase().includes(s.toLowerCase())
                          );
                          return (
                            <button
                              key={member.id}
                              type="button"
                              onClick={() => {
                                update('owner', member.name);
                                setAssignDropdownOpen(false);
                              }}
                              className={`w-full text-left px-3 py-2.5 text-[12px] transition-colors cursor-pointer hover:bg-surface-2 ${
                                form.owner === member.name ? 'bg-primary/10' : ''
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-primary-medium text-white flex items-center justify-center text-[8px] font-bold">
                                    {member.avatar}
                                  </div>
                                  <div>
                                    <div className="text-[12px] font-medium text-text">{member.name}</div>
                                    <div className="text-[9px] text-text-muted">{member.role}</div>
                                  </div>
                                </div>
                                {hasSkillMatch && (
                                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-compliant-50 text-compliant-700">
                                    Skill Match
                                  </span>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          {!readOnly && (
            <div className="mt-6 pt-4 border-t border-border-light">
              <button
                onClick={() => onSave(form)}
                className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-[13px] font-semibold transition-colors cursor-pointer mb-3"
              >
                {isCreate ? 'Create Engagement' : 'Save Changes'}
              </button>
              {!isCreate && (
                <button
                  onClick={() => onDelete(form.id)}
                  className="w-full py-2 text-risk-700 hover:text-risk-700 hover:bg-risk-50 rounded-xl text-[12px] font-medium transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Trash2 size={13} />
                  Delete Engagement
                </button>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}

// ─── Modal Backdrop ──────────────────────────────────────────────────────────

function ModalBackdrop({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-2xl shadow-2xl border border-border-light max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function AuditPlanningView() {
  const { addToast } = useToast();
  const [plan, setPlan] = useState<AuditEngagement[]>(INITIAL_AUDIT_PLAN);
  const [planFrozen, setPlanFrozen] = useState(false);
  const [signedOff, setSignedOff] = useState(false);
  const [showFreezeModal, setShowFreezeModal] = useState(false);
  const [showSignOffModal, setShowSignOffModal] = useState(false);
  const [selectedSigner, setSelectedSigner] = useState(SIGNERS[0]);
  const [signOffComment, setSignOffComment] = useState('');
  const [signerDropdownOpen, setSignerDropdownOpen] = useState(false);

  const [activeTab, setActiveTab] = useState<TabId>('timeline');
  const [processFilter, setProcessFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Drawer state
  const [drawerEngagement, setDrawerEngagement] = useState<AuditEngagement | null>(null);
  const [drawerIsCreate, setDrawerIsCreate] = useState(false);

  const handleFreeze = () => setShowFreezeModal(true);

  const confirmFreeze = () => {
    setPlanFrozen(true);
    setShowFreezeModal(false);
    addToast({ type: 'success', message: 'Audit plan frozen successfully' });
  };

  const handleSignOff = () => {
    if (signedOff) return;
    setShowSignOffModal(true);
  };

  const confirmSignOff = () => {
    setSignedOff(true);
    setShowSignOffModal(false);
    setSignOffComment('');
    addToast({ type: 'success', message: 'Audit plan signed off successfully' });
  };

  const openEditDrawer = (item: AuditEngagement) => {
    setDrawerEngagement(item);
    setDrawerIsCreate(false);
  };

  const openCreateDrawer = () => {
    const newId = `ap-${Date.now()}`;
    const colorIdx = plan.length % COLOR_PALETTE.length;
    setDrawerEngagement({
      id: newId,
      name: '',
      process: 'P2P',
      type: 'SOX',
      owner: TEAM_MEMBERS[0].name,
      start: 0,
      duration: 3,
      color: COLOR_PALETTE[colorIdx],
      status: 'planned',
      controls: 0,
      plannedHours: 0,
      priority: 'Medium',
      riskScore: 50,
      notes: '',
    });
    setDrawerIsCreate(true);
  };

  const handleSaveEngagement = (updated: AuditEngagement) => {
    if (drawerIsCreate) {
      setPlan(prev => [...prev, updated]);
      addToast({ type: 'success', message: `"${updated.name}" created successfully` });
    } else {
      setPlan(prev => prev.map(p => p.id === updated.id ? updated : p));
      addToast({ type: 'success', message: `"${updated.name}" updated successfully` });
    }
    setDrawerEngagement(null);
  };

  const handleDeleteEngagement = (id: string) => {
    const item = plan.find(p => p.id === id);
    setPlan(prev => prev.filter(p => p.id !== id));
    addToast({ type: 'warning', message: `"${item?.name}" removed from plan` });
    setDrawerEngagement(null);
  };

  const totalControls = plan.reduce((sum, a) => sum + a.controls, 0);
  const uniqueProcesses = new Set(plan.map(a => a.process)).size;
  const uniqueOwners = new Set(plan.map(a => a.owner)).size;

  const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: 'timeline', label: 'Timeline', icon: Calendar },
    { id: 'resources', label: 'Resources', icon: Users },
    { id: 'risk-matrix', label: 'Risk Matrix', icon: AlertTriangle },
    { id: 'budget', label: 'Budget', icon: DollarSign },
  ];

  const processFilterOptions = ['All', ...PROCESSES];
  const statusFilterOptions = ['All', 'Active', 'Planned', 'Completed'];

  return (
    <div className="h-full overflow-y-auto bg-white bg-mesh-gradient relative">
      <Orb hoverIntensity={0.06} rotateOnHover hue={275} opacity={0.05} />

      <div className="max-w-6xl mx-auto px-8 py-8 relative">
        {/* Header */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary to-primary-medium text-white">
                <Calendar size={16} />
              </div>
              <h1 className="text-xl font-bold text-text tracking-tight">Audit Planning</h1>
            </div>
            <p className="text-sm text-text-secondary mt-1 ml-9">FY26 Annual Audit Plan — April 2025 to March 2026</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={openCreateDrawer}
              className="flex items-center gap-1.5 px-3 py-2 border border-primary/30 bg-primary/5 rounded-lg text-[12px] font-medium text-primary hover:bg-primary/10 transition-colors cursor-pointer"
            >
              <Plus size={13} />
              Add Engagement
            </button>
            {planFrozen ? (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-evidence-50 border border-evidence rounded-lg">
                <Lock size={13} className="text-evidence-700" />
                <span className="text-[12px] font-semibold text-evidence-700">Plan Frozen</span>
                <span className="text-[10px] text-evidence-700">by Karan Mehta — Mar 1, 2026</span>
              </div>
            ) : (
              <button
                onClick={handleFreeze}
                className="flex items-center gap-1.5 px-3 py-2 border border-border rounded-lg text-[12px] font-medium text-text-secondary hover:bg-white hover:border-primary/30 transition-colors cursor-pointer"
              >
                <Lock size={13} />
                Freeze Plan
              </button>
            )}
            <button
              onClick={handleSignOff}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-semibold transition-colors cursor-pointer ${
                signedOff
                  ? 'bg-green-600 text-white'
                  : 'bg-primary hover:bg-primary-hover text-white'
              }`}
            >
              <CheckCircle2 size={13} />
              {signedOff ? 'Signed Off' : 'Sign Off'}
            </button>
          </div>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <KpiCard label="Planned Engagements" value={plan.length} icon={ClipboardList} color="text-primary bg-primary-xlight" index={0} />
          <KpiCard label="Processes Covered" value={uniqueProcesses} icon={LayoutGrid} color="text-evidence-700 bg-evidence-50" index={1} />
          <KpiCard label="Total Controls" value={totalControls} icon={ShieldCheck} color="text-compliant-700 bg-compliant-50" index={2} />
          <KpiCard label="Team Members" value={uniqueOwners} icon={Users} color="text-high-700 bg-high-50" index={3} />
        </div>

        {/* Tabs */}
        <div className="flex items-center border-b border-border-light mb-4">
          {tabs.map(tab => {
            const isDisabled = tab.id !== 'timeline';
            return (
              <button
                key={tab.id}
                onClick={() => !isDisabled && setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary cursor-pointer'
                    : isDisabled
                      ? 'border-transparent text-text-muted/40 cursor-not-allowed'
                      : 'border-transparent text-text-muted hover:text-text-secondary cursor-pointer'
                }`}
              >
                <tab.icon size={14} className={isDisabled ? 'opacity-40' : ''} />
                <span className={isDisabled ? 'opacity-40' : ''}>{tab.label}</span>
                {isDisabled && (
                  <span className="ml-1 text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-paper-50 text-ink-500 uppercase tracking-wider">v2</span>
                )}
              </button>
            );
          })}
        </div>
        {/* v2 note */}
        <div className="text-[11px] text-text-muted mb-4 flex items-center gap-1.5">
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-paper-50 text-ink-500 uppercase">Note</span>
          Resources, Risk Matrix, and Budget tabs coming in v2
        </div>

        {/* Filters (show for timeline, resources, budget) */}
        {(activeTab === 'timeline' || activeTab === 'resources' || activeTab === 'budget') && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 mb-4"
          >
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Process:</span>
              <div className="flex gap-1">
                {processFilterOptions.map(opt => (
                  <button
                    key={opt}
                    onClick={() => setProcessFilter(opt)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all cursor-pointer ${
                      processFilter === opt
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-surface-2 text-text-muted hover:bg-primary/10 hover:text-primary'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            <div className="w-px h-5 bg-border-light" />
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Status:</span>
              <div className="flex gap-1">
                {statusFilterOptions.map(opt => (
                  <button
                    key={opt}
                    onClick={() => setStatusFilter(opt)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all cursor-pointer ${
                      statusFilter === opt
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-surface-2 text-text-muted hover:bg-primary/10 hover:text-primary'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'timeline' && (
            <motion.div
              key="timeline"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-3 text-[11px] text-text-muted">
                <Calendar size={12} className="text-primary/60" />
                <span>Timeline bars are draggable for Manager+ roles. Click an engagement to edit details.</span>
              </div>
              <GanttChart
                items={plan}
                frozen={planFrozen}
                onClickEngagement={openEditDrawer}
                processFilter={processFilter}
                statusFilter={statusFilter}
              />
              <MilestonesStrip />

              {/* Current Audit Progress */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="mt-6">
                <h2 className="text-[15px] font-semibold text-text mb-3">Current Progress</h2>
                <div className="glass-card rounded-2xl p-5">
                  <div className="space-y-4">
                    {plan.filter(p => p.status === 'active' || p.status === 'completed').map((eng, i) => {
                      // Mock progress based on status and position in year
                      const progressMap: Record<string, number> = {
                        'ap-1': 72, 'ap-2': 44, 'ap-3': 85, 'ap-6': 60,
                      };
                      const progress = progressMap[eng.id] || (eng.status === 'completed' ? 100 : 0);
                      const tested = Math.round((progress / 100) * eng.controls);

                      return (
                        <div key={eng.id}>
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <div className="w-2.5 h-2.5 rounded-full" style={{ background: eng.color }} />
                              <span className="text-[12px] font-medium text-text">{eng.name}</span>
                              <span className="text-[10px] text-text-muted">{eng.owner}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] text-text-muted">{tested}/{eng.controls} controls</span>
                              <span className="text-[12px] font-bold font-mono text-text">{progress}%</span>
                            </div>
                          </div>
                          <div className="h-2 bg-surface-3 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                              transition={{ duration: 0.8, delay: 0.2 + i * 0.1 }}
                              className="h-full rounded-full"
                              style={{ background: eng.color }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Overall */}
                  <div className="mt-4 pt-3 border-t border-border-light flex items-center justify-between">
                    <span className="text-[12px] font-semibold text-text">Overall FY26 Progress</span>
                    <span className="text-[14px] font-bold text-primary font-mono">62%</span>
                  </div>
                  <div className="h-2.5 bg-surface-3 rounded-full overflow-hidden mt-1.5">
                    <motion.div initial={{ width: 0 }} animate={{ width: '62%' }} transition={{ duration: 1, delay: 0.5 }} className="h-full rounded-full bg-gradient-to-r from-primary to-primary-medium" />
                  </div>
                </div>
              </motion.div>

            </motion.div>
          )}

          {activeTab === 'resources' && (
            <motion.div
              key="resources"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <ResourcesTab />
            </motion.div>
          )}

          {activeTab === 'risk-matrix' && (
            <motion.div
              key="risk-matrix"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <RiskMatrixTab />
            </motion.div>
          )}

          {activeTab === 'budget' && (
            <motion.div
              key="budget"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <BudgetTab />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sign-off History */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-6"
        >
          <h2 className="text-[15px] font-semibold text-text mb-3">Sign-off History</h2>
          <div className="glass-card rounded-2xl overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-[11px] text-text-muted uppercase tracking-wider font-medium px-5 py-3">Name</th>
                  <th className="text-[11px] text-text-muted uppercase tracking-wider font-medium px-5 py-3">Role</th>
                  <th className="text-[11px] text-text-muted uppercase tracking-wider font-medium px-5 py-3">Action</th>
                  <th className="text-[11px] text-text-muted uppercase tracking-wider font-medium px-5 py-3">Date</th>
                  <th className="text-[11px] text-text-muted uppercase tracking-wider font-medium px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {SIGNOFF_LOG.map((entry, i) => (
                  <motion.tr
                    key={entry.name}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 + i * 0.05 }}
                    className="border-b border-border/50 last:border-0 hover:bg-primary-xlight/50 transition-colors"
                  >
                    <td className="text-[12.5px] font-medium text-text px-5 py-3">{entry.name}</td>
                    <td className="text-[12.5px] text-text-secondary px-5 py-3">{entry.role}</td>
                    <td className="text-[12.5px] text-text-secondary px-5 py-3">{entry.action}</td>
                    <td className="text-[12.5px] text-text-secondary px-5 py-3">{entry.date}</td>
                    <td className="px-5 py-3">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                        entry.status === 'completed'
                          ? 'bg-compliant-50 text-compliant-700'
                          : signedOff && entry.action === 'Final Sign-Off'
                            ? 'bg-compliant-50 text-compliant-700'
                            : 'bg-high-50 text-high-700'
                      }`}>
                        {entry.status === 'completed'
                          ? 'Completed'
                          : signedOff && entry.action === 'Final Sign-Off'
                            ? 'Completed'
                            : 'Pending'}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      {/* Engagement Drawer */}
      <AnimatePresence>
        {drawerEngagement && (
          <EngagementDrawer
            engagement={drawerEngagement}
            isCreate={drawerIsCreate}
            frozen={planFrozen}
            onClose={() => setDrawerEngagement(null)}
            onSave={handleSaveEngagement}
            onDelete={handleDeleteEngagement}
          />
        )}
      </AnimatePresence>

      {/* Freeze Confirmation Modal */}
      <AnimatePresence>
        {showFreezeModal && (
          <ModalBackdrop onClose={() => setShowFreezeModal(false)}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[15px] font-bold text-text">Freeze Audit Plan</h3>
                <button onClick={() => setShowFreezeModal(false)} className="p-1 rounded-md hover:bg-surface-2 transition-colors cursor-pointer">
                  <X size={16} className="text-text-muted" />
                </button>
              </div>
              <div className="flex items-start gap-3 p-3 bg-evidence-50 rounded-xl mb-5">
                <Lock size={16} className="text-evidence-700 mt-0.5 shrink-0" />
                <p className="text-[13px] text-evidence-700">
                  Freeze the FY26 audit plan? This will lock all scheduling changes.
                </p>
              </div>
              <div className="flex items-center gap-3 justify-end">
                <button
                  onClick={() => setShowFreezeModal(false)}
                  className="px-4 py-2 border border-border rounded-lg text-[12px] font-medium text-text-secondary hover:bg-surface-2 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmFreeze}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[12px] font-semibold transition-colors cursor-pointer"
                >
                  Freeze Plan
                </button>
              </div>
            </div>
          </ModalBackdrop>
        )}
      </AnimatePresence>

      {/* Sign-Off Modal */}
      <AnimatePresence>
        {showSignOffModal && (
          <ModalBackdrop onClose={() => setShowSignOffModal(false)}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-[15px] font-bold text-text">Sign Off on FY26 Audit Plan</h3>
                <button onClick={() => setShowSignOffModal(false)} className="p-1 rounded-md hover:bg-surface-2 transition-colors cursor-pointer">
                  <X size={16} className="text-text-muted" />
                </button>
              </div>

              {/* Signer dropdown */}
              <div className="mb-4">
                <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block mb-1.5">Signer</label>
                <div className="relative">
                  <button
                    onClick={() => setSignerDropdownOpen(p => !p)}
                    className="w-full flex items-center justify-between px-3 py-2.5 border border-border rounded-lg text-[13px] text-text hover:border-primary/30 transition-colors cursor-pointer bg-white"
                  >
                    {selectedSigner}
                    <ChevronDown size={14} className={`text-text-muted transition-transform ${signerDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {signerDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.12 }}
                        className="absolute left-0 right-0 top-full mt-1 bg-white border border-border-light rounded-xl shadow-lg overflow-hidden z-10"
                      >
                        {SIGNERS.map(s => (
                          <button
                            key={s}
                            onClick={() => { setSelectedSigner(s); setSignerDropdownOpen(false); }}
                            className={`w-full text-left px-3 py-2 text-[12px] transition-colors cursor-pointer ${
                              selectedSigner === s ? 'bg-primary/10 text-primary font-semibold' : 'text-text-secondary hover:bg-surface-2'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Date */}
              <div className="mb-4">
                <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block mb-1.5">Date</label>
                <div className="px-3 py-2.5 border border-border rounded-lg text-[13px] text-text-secondary bg-surface-2">
                  March 25, 2026
                </div>
              </div>

              {/* Comments */}
              <div className="mb-5">
                <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block mb-1.5">Comments</label>
                <textarea
                  value={signOffComment}
                  onChange={(e) => setSignOffComment(e.target.value)}
                  placeholder="Optional comments..."
                  className="w-full px-3 py-2.5 border border-border rounded-lg text-[13px] text-text placeholder:text-text-muted/50 focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all resize-none h-20"
                />
              </div>

              <div className="flex items-center gap-3 justify-end">
                <button
                  onClick={() => setShowSignOffModal(false)}
                  className="px-4 py-2 border border-border rounded-lg text-[12px] font-medium text-text-secondary hover:bg-surface-2 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmSignOff}
                  className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-[12px] font-semibold transition-colors cursor-pointer"
                >
                  Submit Sign-Off
                </button>
              </div>
            </div>
          </ModalBackdrop>
        )}
      </AnimatePresence>
    </div>
  );
}
