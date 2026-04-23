import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Lock, CheckCircle2, Flag, Target, Calendar,
  Users, ShieldCheck, ClipboardList, LayoutGrid,
  X, ChevronDown, Plus, AlertTriangle,
  DollarSign, Zap, ArrowRight,
  Play, Copy
} from 'lucide-react';
import Orb from '../shared/Orb';
import { useToast } from '../shared/Toast';

// ─── Types (Finalized Engagement Model) ──────────────────────────────────────

type EngagementLifecycle = 'draft' | 'planned' | 'frozen' | 'signed-off' | 'active' | 'in-progress' | 'pending-review' | 'closed';
type AuditType = 'SOX' | 'IFC' | 'ITGC' | 'Internal' | 'Risk';
type FrameworkType = 'COSO' | 'COBIT' | 'ISO 27001' | 'NIST' | 'Custom';
type ProcessType = 'P2P' | 'O2C' | 'R2R' | 'S2C' | 'Cross';
type PriorityLevel = 'Critical' | 'High' | 'Medium' | 'Low';
type TabId = 'timeline' | 'resources' | 'risk-matrix' | 'budget';

interface AuditEngagement {
  id: string;
  name: string;
  auditType: AuditType;
  framework: FrameworkType;
  auditPeriodStart: string;
  auditPeriodEnd: string;
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartDate: string;
  actualEndDate: string;
  owner: string;
  reviewer: string;
  description: string;
  sourceRacmVersionId: string;
  engagementSnapshotId: string | null;
  businessProcess: ProcessType;
  status: EngagementLifecycle;
  controls: number;
  plannedHours: number;
  priority: PriorityLevel;
  riskScore: number;
  // Gantt positioning (relative to FY months)
  start: number;
  duration: number;
  color: string;
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
const FRAMEWORKS: FrameworkType[] = ['COSO', 'COBIT', 'ISO 27001', 'NIST', 'Custom'];
const PRIORITIES: PriorityLevel[] = ['Critical', 'High', 'Medium', 'Low'];

const RACM_VERSIONS = [
  { id: 'racm-v2.1', label: 'RACM v2.1 (Current — Feb 2026)' },
  { id: 'racm-v2.0', label: 'RACM v2.0 (Nov 2025)' },
  { id: 'racm-v1.9', label: 'RACM v1.9 (Aug 2025)' },
  { id: 'racm-v1.8', label: 'RACM v1.8 (May 2025)' },
];

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
  {
    id: 'ap-1', name: 'P2P — SOX Audit', auditType: 'SOX', framework: 'COSO', businessProcess: 'P2P',
    auditPeriodStart: '2025-04-01', auditPeriodEnd: '2026-03-31',
    plannedStartDate: '2025-04-01', plannedEndDate: '2025-06-30',
    actualStartDate: '2025-04-05', actualEndDate: '',
    owner: 'Tushar Goel', reviewer: 'Karan Mehta',
    description: 'Comprehensive SOX audit covering AP, PO, and vendor master controls with focus on segregation of duties and transaction authorization.',
    sourceRacmVersionId: 'racm-v2.1', engagementSnapshotId: 'snap-001',
    status: 'active', controls: 24, plannedHours: 480, priority: 'Critical', riskScore: 85,
    start: 0, duration: 3, color: '#6a12cd',
  },
  {
    id: 'ap-2', name: 'O2C — SOX Audit', auditType: 'SOX', framework: 'COSO', businessProcess: 'O2C',
    auditPeriodStart: '2025-04-01', auditPeriodEnd: '2026-03-31',
    plannedStartDate: '2025-05-01', plannedEndDate: '2025-07-31',
    actualStartDate: '2025-05-02', actualEndDate: '',
    owner: 'Neha Joshi', reviewer: 'Sneha Desai',
    description: 'SOX compliance audit for Order-to-Cash process including revenue recognition and AR controls.',
    sourceRacmVersionId: 'racm-v2.1', engagementSnapshotId: 'snap-002',
    status: 'active', controls: 18, plannedHours: 360, priority: 'High', riskScore: 72,
    start: 1, duration: 3, color: '#0284c7',
  },
  {
    id: 'ap-3', name: 'R2R — SOX Audit', auditType: 'SOX', framework: 'COSO', businessProcess: 'R2R',
    auditPeriodStart: '2025-04-01', auditPeriodEnd: '2026-03-31',
    plannedStartDate: '2025-04-01', plannedEndDate: '2025-08-31',
    actualStartDate: '2025-04-03', actualEndDate: '',
    owner: 'Karan Mehta', reviewer: 'Abhinav S',
    description: 'Record-to-Report SOX audit covering journal entries, reconciliations, and financial close processes.',
    sourceRacmVersionId: 'racm-v2.1', engagementSnapshotId: 'snap-003',
    status: 'in-progress', controls: 31, plannedHours: 520, priority: 'Critical', riskScore: 90,
    start: 0, duration: 5, color: '#d97706',
  },
  {
    id: 'ap-4', name: 'S2C — Contract Review', auditType: 'Internal', framework: 'Custom', businessProcess: 'S2C',
    auditPeriodStart: '2025-04-01', auditPeriodEnd: '2026-03-31',
    plannedStartDate: '2025-07-01', plannedEndDate: '2025-09-30',
    actualStartDate: '', actualEndDate: '',
    owner: 'Rohan Patel', reviewer: 'Priya Singh',
    description: 'Internal audit of Source-to-Contract process focusing on new contract lifecycle and vendor management.',
    sourceRacmVersionId: 'racm-v1.8', engagementSnapshotId: null,
    status: 'planned', controls: 14, plannedHours: 240, priority: 'Medium', riskScore: 45,
    start: 3, duration: 3, color: '#059669',
  },
  {
    id: 'ap-5', name: 'P2P — IFC Assessment', auditType: 'IFC', framework: 'COBIT', businessProcess: 'P2P',
    auditPeriodStart: '2025-04-01', auditPeriodEnd: '2026-03-31',
    plannedStartDate: '2025-08-01', plannedEndDate: '2025-10-31',
    actualStartDate: '', actualEndDate: '',
    owner: 'Sneha Desai', reviewer: 'Karan Mehta',
    description: 'Internal Financial Controls assessment for Procure-to-Pay process using COBIT framework.',
    sourceRacmVersionId: 'racm-v2.0', engagementSnapshotId: null,
    status: 'planned', controls: 18, plannedHours: 300, priority: 'High', riskScore: 68,
    start: 4, duration: 3, color: '#6a12cd',
  },
  {
    id: 'ap-6', name: 'IT General Controls', auditType: 'ITGC', framework: 'ISO 27001', businessProcess: 'Cross',
    auditPeriodStart: '2025-04-01', auditPeriodEnd: '2026-03-31',
    plannedStartDate: '2025-06-01', plannedEndDate: '2026-01-31',
    actualStartDate: '2025-06-03', actualEndDate: '',
    owner: 'Deepak Bansal', reviewer: 'Tushar Goel',
    description: 'IT General Controls audit covering access management, change management, operations, and SDLC controls.',
    sourceRacmVersionId: 'racm-v2.1', engagementSnapshotId: 'snap-006',
    status: 'active', controls: 15, plannedHours: 640, priority: 'Critical', riskScore: 82,
    start: 2, duration: 8, color: '#7c3aed',
  },
  {
    id: 'ap-7', name: 'Vendor Risk Assessment', auditType: 'Risk', framework: 'NIST', businessProcess: 'P2P',
    auditPeriodStart: '2025-04-01', auditPeriodEnd: '2026-03-31',
    plannedStartDate: '2025-10-01', plannedEndDate: '2025-11-30',
    actualStartDate: '', actualEndDate: '',
    owner: 'Priya Singh', reviewer: 'Neha Joshi',
    description: 'Third-party vendor risk assessment focusing on vendor master data and procurement controls.',
    sourceRacmVersionId: 'racm-v1.9', engagementSnapshotId: null,
    status: 'draft', controls: 8, plannedHours: 160, priority: 'Medium', riskScore: 55,
    start: 6, duration: 2, color: '#dc2626',
  },
  {
    id: 'ap-8', name: 'Year-End Close Review', auditType: 'SOX', framework: 'COSO', businessProcess: 'R2R',
    auditPeriodStart: '2025-04-01', auditPeriodEnd: '2026-03-31',
    plannedStartDate: '2026-01-01', plannedEndDate: '2026-02-28',
    actualStartDate: '', actualEndDate: '',
    owner: 'Karan Mehta', reviewer: 'Abhinav S',
    description: 'Year-end closing procedures and adjustments review for SOX compliance.',
    sourceRacmVersionId: 'racm-v2.1', engagementSnapshotId: null,
    status: 'planned', controls: 12, plannedHours: 200, priority: 'High', riskScore: 60,
    start: 9, duration: 2, color: '#d97706',
  },
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

function getCurrentMonth(): number { return 11; }

function formatDate(d: string): string {
  if (!d) return '—';
  const dt = new Date(d);
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ─── Lifecycle helpers ───────────────────────────────────────────────────────

const LIFECYCLE_ORDER: EngagementLifecycle[] = ['draft', 'planned', 'frozen', 'signed-off', 'active', 'in-progress', 'pending-review', 'closed'];

function lifecycleLabel(s: EngagementLifecycle): string {
  const map: Record<EngagementLifecycle, string> = {
    'draft': 'Draft', 'planned': 'Planned', 'frozen': 'Frozen', 'signed-off': 'Signed Off',
    'active': 'Active', 'in-progress': 'In Progress', 'pending-review': 'Pending Review', 'closed': 'Closed',
  };
  return map[s];
}

function lifecycleTone(s: EngagementLifecycle): string {
  const map: Record<EngagementLifecycle, string> = {
    'draft': 'bg-draft-50 text-draft-700',
    'planned': 'bg-evidence-50 text-evidence-700',
    'frozen': 'bg-brand-50 text-brand-700',
    'signed-off': 'bg-compliant-50 text-compliant-700',
    'active': 'bg-compliant-50 text-compliant-700',
    'in-progress': 'bg-evidence-50 text-evidence-700',
    'pending-review': 'bg-high-50 text-high-700',
    'closed': 'bg-draft-50 text-draft-700',
  };
  return map[s];
}

function isExecutionPhase(s: EngagementLifecycle): boolean {
  return ['active', 'in-progress', 'pending-review', 'closed'].includes(s);
}

// ─── Custom Dropdown ─────────────────────────────────────────────────────────

function Dropdown<T extends string>({
  label, value, options, onChange, disabled = false, renderOption,
}: {
  label: string; value: T; options: T[]; onChange: (val: T) => void;
  disabled?: boolean; renderOption?: (opt: T) => React.ReactNode;
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
      <label className="text-[12px] font-semibold text-text-muted block mb-1.5">{label}</label>
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
      className="glass-card rounded-2xl p-5 hover:border-primary/20 transition-all duration-300 cursor-default"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg ${color} transition-transform duration-300`}>
          <Icon size={16} />
        </div>
      </div>
      <div className="text-2xl font-bold text-text">{value}</div>
      <div className="text-[12px] text-text-muted mt-1">{label}</div>
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
      <div className="glass-card-strong rounded-xl p-3 shadow-xl min-w-[240px]">
        <div className="text-[12px] font-bold text-text mb-1.5">{item.name}</div>
        <div className="space-y-1">
          <div className="flex justify-between text-[12px]">
            <span className="text-text-muted">Type / Framework</span>
            <span className="text-text font-medium">{item.auditType} / {item.framework}</span>
          </div>
          <div className="flex justify-between text-[12px]">
            <span className="text-text-muted">Owner</span>
            <span className="text-text font-medium">{item.owner}</span>
          </div>
          <div className="flex justify-between text-[12px]">
            <span className="text-text-muted">Duration</span>
            <span className="text-text font-medium">{item.duration} months ({startMonth} — {endMonth})</span>
          </div>
          <div className="flex justify-between text-[12px]">
            <span className="text-text-muted">Controls</span>
            <span className="text-text font-medium">{item.controls}</span>
          </div>
          <div className="flex justify-between text-[12px]">
            <span className="text-text-muted">RACM Version</span>
            <span className="text-text font-medium">{item.sourceRacmVersionId}</span>
          </div>
          <div className="flex justify-between text-[12px]">
            <span className="text-text-muted">Status</span>
            <span className={`font-bold px-1.5 py-0.5 rounded-full ${lifecycleTone(item.status)}`}>{lifecycleLabel(item.status)}</span>
          </div>
          <div className="flex justify-between text-[12px]">
            <span className="text-text-muted">Priority</span>
            <span className={`font-bold ${
              item.priority === 'Critical' ? 'text-risk-700' :
              item.priority === 'High' ? 'text-high-700' :
              item.priority === 'Medium' ? 'text-mitigated-700' :
              'text-compliant-700'
            }`}>{item.priority}</span>
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
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const filtered = items.filter(item => {
    if (processFilter !== 'All' && item.businessProcess !== processFilter) return false;
    if (statusFilter !== 'All') {
      if (statusFilter === 'Active' && !isExecutionPhase(item.status)) return false;
      if (statusFilter === 'Planned' && !['draft', 'planned', 'frozen', 'signed-off'].includes(item.status)) return false;
    }
    return true;
  });

  return (
    <div className="glass-card rounded-2xl p-5 overflow-hidden">
      <div className="relative">
        {/* Month headers */}
        <div className="flex border-b border-border-light pb-2 mb-3">
          {MONTHS.map((m, i) => (
            <div
              key={m}
              className={`flex-1 text-center text-[12px] font-semibold ${
                i === currentMonth ? 'text-primary' : 'text-text-muted'
              }`}
            >
              {m}
            </div>
          ))}
        </div>

        {/* Current month indicator */}
        <div
          className="absolute top-0 bottom-0 w-px bg-primary/30 z-10"
          style={{ left: `${((currentMonth + 0.8) / totalMonths) * 100}%` }}
        >
          <div className="absolute -top-1 -translate-x-1/2 w-2 h-2 rounded-full bg-primary" />
        </div>

        {/* Bars */}
        <div className="space-y-2 relative">
          {filtered.map((item, idx) => (
            <div key={item.id} className="relative h-9 flex items-center">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(item.duration / totalMonths) * 100}%` }}
                transition={{ duration: 0.6, delay: 0.2 + idx * 0.05 }}
                className={`absolute h-7 rounded-lg shadow-sm flex items-center px-2 transition-all ${
                  frozen ? 'cursor-pointer' : 'cursor-pointer hover:shadow-md hover:brightness-110'
                }`}
                style={{
                  left: `${(item.start / totalMonths) * 100}%`,
                  background: `linear-gradient(135deg, ${item.color}dd, ${item.color}99)`,
                }}
                onClick={() => onClickEngagement(item)}
                onMouseEnter={(e) => {
                  setHoveredItem(item);
                  setMousePos({ x: e.clientX, y: e.clientY });
                }}
                onMouseMove={(e) => setMousePos({ x: e.clientX, y: e.clientY })}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <span className="text-white text-[12px] font-semibold truncate drop-shadow-sm">
                  {item.name}
                </span>
                {item.engagementSnapshotId && (
                  <div className="ml-auto shrink-0 w-4 h-4 rounded-full bg-white/30 flex items-center justify-center" title="Snapshot created">
                    <Copy size={8} className="text-white" />
                  </div>
                )}
              </motion.div>
            </div>
          ))}
        </div>
      </div>

      {/* Tooltip */}
      <AnimatePresence>
        {hoveredItem && <GanttTooltip item={hoveredItem} position={mousePos} />}
      </AnimatePresence>
    </div>
  );
}

// ─── Milestones ──────────────────────────────────────────────────────────────

function MilestonesStrip() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-3">
      <div className="glass-card rounded-2xl px-5 py-3">
        <div className="flex items-center">
          {MILESTONES.map((ms, i) => {
            const Icon = ms.icon;
            return (
              <div key={ms.label} className="flex items-center" style={{ marginLeft: i === 0 ? `${(ms.month / 12) * 100}%` : `${((ms.month - MILESTONES[i - 1].month) / 12) * 100 - 3}%` }}>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-primary/5 border border-primary/10">
                  <Icon size={11} className="text-primary" />
                  <span className="text-[12px] font-medium text-primary whitespace-nowrap">{ms.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Lifecycle Stepper ───────────────────────────────────────────────────────

function LifecycleStepper({ status }: { status: EngagementLifecycle }) {
  const planningSteps: EngagementLifecycle[] = ['draft', 'planned', 'frozen', 'signed-off'];
  const executionSteps: EngagementLifecycle[] = ['active', 'in-progress', 'pending-review', 'closed'];
  const currentIdx = LIFECYCLE_ORDER.indexOf(status);

  return (
    <div className="mb-4">
      <div className="text-[10px] font-bold text-text-muted uppercase mb-2">Lifecycle</div>
      <div className="flex gap-1">
        {[...planningSteps, ...executionSteps].map((step, i) => {
          const isActive = step === status;
          const isPast = LIFECYCLE_ORDER.indexOf(step) < currentIdx;

          return (
            <div key={step} className="flex items-center gap-1">
              {i === 4 && <div className="w-px h-5 bg-border-light mx-1" />}
              <div className={`px-2 py-1 rounded-md text-[10px] font-semibold transition-all ${
                isActive ? lifecycleTone(step) + ' ring-1 ring-current/20' :
                isPast ? 'bg-compliant-50/60 text-compliant-700/60' :
                'bg-paper-50 text-ink-400'
              }`}>
                {lifecycleLabel(step)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Engagement Drawer (Upgraded) ────────────────────────────────────────────

function EngagementDrawer({
  engagement, isCreate, frozen, onClose, onSave, onDelete, onActivate, onViewExecution,
}: {
  engagement: AuditEngagement;
  isCreate: boolean;
  frozen: boolean;
  onClose: () => void;
  onSave: (updated: AuditEngagement) => void;
  onDelete: (id: string) => void;
  onActivate: (id: string) => void;
  onViewExecution?: (id: string) => void;
}) {
  const [form, setForm] = useState<AuditEngagement>({ ...engagement });

  const update = <K extends keyof AuditEngagement>(key: K, value: AuditEngagement[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const readOnly = frozen && !isCreate;
  const canActivate = form.status === 'signed-off' && !isCreate;
  const isInExecution = isExecutionPhase(form.status);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ x: 480 }}
        animate={{ x: 0 }}
        exit={{ x: 480 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed right-0 top-0 bottom-0 w-[460px] z-50 glass-card-strong border-l border-border-light shadow-2xl overflow-y-auto"
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[15px] font-bold text-text">
              {isCreate ? 'Create Engagement' : isInExecution ? 'Engagement Detail' : 'Edit Engagement'}
            </h3>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-2 transition-colors cursor-pointer">
              <X size={16} className="text-text-muted" />
            </button>
          </div>

          {/* Lifecycle stepper */}
          {!isCreate && <LifecycleStepper status={form.status} />}

          {/* Frozen banner */}
          {readOnly && !isInExecution && (
            <div className="flex items-center gap-2.5 p-3 bg-evidence-50 rounded-xl mb-4 border border-evidence">
              <Lock size={14} className="text-evidence-700 shrink-0" />
              <span className="text-[12px] text-evidence-700 font-medium">Plan is frozen — fields are read-only.</span>
            </div>
          )}

          {/* Execution banner */}
          {isInExecution && (
            <div className="flex items-center justify-between p-3 bg-compliant-50 rounded-xl mb-4 border border-compliant">
              <div className="flex items-center gap-2.5">
                <Play size={14} className="text-compliant-700 shrink-0" />
                <div>
                  <span className="text-[12px] text-compliant-700 font-semibold block">In Execution</span>
                  <span className="text-[11px] text-compliant-700/80">Snapshot: {form.engagementSnapshotId || '—'}</span>
                </div>
              </div>
              {onViewExecution && (
                <button onClick={() => onViewExecution(form.id)} className="px-3 py-1.5 bg-compliant hover:brightness-110 text-white rounded-lg text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1.5">
                  <ArrowRight size={11} />
                  Open Hub
                </button>
              )}
            </div>
          )}

          {/* Activation CTA */}
          {canActivate && (
            <button
              onClick={() => onActivate(form.id)}
              className="w-full flex items-center justify-center gap-2 py-3 mb-4 bg-gradient-to-r from-primary to-primary-medium hover:brightness-110 text-white rounded-xl text-[13px] font-bold transition-all cursor-pointer"
            >
              <Zap size={14} />
              Activate Engagement
            </button>
          )}

          {/* ── Fields ── */}
          <div className="space-y-0">
            {/* Name */}
            <div className="mb-3">
              <label className="text-[12px] font-semibold text-text-muted block mb-1.5">Engagement Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                disabled={readOnly || isInExecution}
                placeholder="e.g., P2P — SOX Audit FY26"
                className={`w-full px-3 py-2.5 border border-border rounded-lg text-[13px] text-text focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all ${
                  (readOnly || isInExecution) ? 'bg-surface-2 text-text-muted cursor-not-allowed' : 'bg-white'
                }`}
              />
            </div>

            {/* Audit Type & Framework side by side */}
            <div className="grid grid-cols-2 gap-3">
              <Dropdown<AuditType>
                label="Audit Type *"
                value={form.auditType}
                options={AUDIT_TYPES}
                onChange={(v) => update('auditType', v)}
                disabled={readOnly || isInExecution}
              />
              <Dropdown<FrameworkType>
                label="Framework *"
                value={form.framework}
                options={FRAMEWORKS}
                onChange={(v) => update('framework', v)}
                disabled={readOnly || isInExecution}
              />
            </div>

            {/* Business Process */}
            <Dropdown<ProcessType>
              label="Business Process *"
              value={form.businessProcess}
              options={PROCESSES}
              onChange={(v) => update('businessProcess', v)}
              disabled={readOnly || isInExecution}
            />

            {/* Audit Period */}
            <div className="grid grid-cols-2 gap-3">
              <div className="mb-3">
                <label className="text-[12px] font-semibold text-text-muted block mb-1.5">Audit Period Start *</label>
                <input type="date" value={form.auditPeriodStart} onChange={e => update('auditPeriodStart', e.target.value)}
                  disabled={readOnly || isInExecution}
                  className={`w-full px-3 py-2.5 border border-border rounded-lg text-[13px] text-text focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all ${(readOnly || isInExecution) ? 'bg-surface-2 text-text-muted cursor-not-allowed' : 'bg-white'}`}
                />
              </div>
              <div className="mb-3">
                <label className="text-[12px] font-semibold text-text-muted block mb-1.5">Audit Period End *</label>
                <input type="date" value={form.auditPeriodEnd} onChange={e => update('auditPeriodEnd', e.target.value)}
                  disabled={readOnly || isInExecution}
                  className={`w-full px-3 py-2.5 border border-border rounded-lg text-[13px] text-text focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all ${(readOnly || isInExecution) ? 'bg-surface-2 text-text-muted cursor-not-allowed' : 'bg-white'}`}
                />
              </div>
            </div>

            {/* Planned Start/End */}
            <div className="grid grid-cols-2 gap-3">
              <div className="mb-3">
                <label className="text-[12px] font-semibold text-text-muted block mb-1.5">Planned Start *</label>
                <input type="date" value={form.plannedStartDate} onChange={e => update('plannedStartDate', e.target.value)}
                  disabled={readOnly || isInExecution}
                  className={`w-full px-3 py-2.5 border border-border rounded-lg text-[13px] text-text focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all ${(readOnly || isInExecution) ? 'bg-surface-2 text-text-muted cursor-not-allowed' : 'bg-white'}`}
                />
              </div>
              <div className="mb-3">
                <label className="text-[12px] font-semibold text-text-muted block mb-1.5">Planned End *</label>
                <input type="date" value={form.plannedEndDate} onChange={e => update('plannedEndDate', e.target.value)}
                  disabled={readOnly || isInExecution}
                  className={`w-full px-3 py-2.5 border border-border rounded-lg text-[13px] text-text focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all ${(readOnly || isInExecution) ? 'bg-surface-2 text-text-muted cursor-not-allowed' : 'bg-white'}`}
                />
              </div>
            </div>

            {/* Actual dates (read-only, shown only in execution) */}
            {isInExecution && (
              <div className="grid grid-cols-2 gap-3">
                <div className="mb-3">
                  <label className="text-[12px] font-semibold text-text-muted block mb-1.5">Actual Start</label>
                  <div className="px-3 py-2.5 border border-border rounded-lg text-[13px] bg-surface-2 text-text-secondary">
                    {formatDate(form.actualStartDate)}
                  </div>
                </div>
                <div className="mb-3">
                  <label className="text-[12px] font-semibold text-text-muted block mb-1.5">Actual End</label>
                  <div className="px-3 py-2.5 border border-border rounded-lg text-[13px] bg-surface-2 text-text-secondary">
                    {formatDate(form.actualEndDate)}
                  </div>
                </div>
              </div>
            )}

            {/* Owner & Reviewer */}
            <div className="grid grid-cols-2 gap-3">
              <Dropdown<string>
                label="Owner *"
                value={form.owner}
                options={TEAM_MEMBERS.map(m => m.name)}
                onChange={(v) => update('owner', v)}
                disabled={readOnly || isInExecution}
              />
              <Dropdown<string>
                label="Reviewer *"
                value={form.reviewer}
                options={[...TEAM_MEMBERS.map(m => m.name), 'Abhinav S']}
                onChange={(v) => update('reviewer', v)}
                disabled={readOnly || isInExecution}
              />
            </div>

            {/* RACM Version */}
            <div className="mb-3">
              <label className="text-[12px] font-semibold text-text-muted block mb-1.5">RACM Version *</label>
              <div className="relative">
                <Dropdown<string>
                  label=""
                  value={RACM_VERSIONS.find(r => r.id === form.sourceRacmVersionId)?.label || form.sourceRacmVersionId}
                  options={RACM_VERSIONS.map(r => r.label)}
                  onChange={(v) => {
                    const found = RACM_VERSIONS.find(r => r.label === v);
                    if (found) update('sourceRacmVersionId', found.id);
                  }}
                  disabled={readOnly || isInExecution}
                />
              </div>
            </div>

            {/* Snapshot info (if exists) */}
            {form.engagementSnapshotId && (
              <div className="mb-3 p-3 bg-brand-50/50 rounded-xl border border-brand-100">
                <div className="flex items-center gap-2 mb-1">
                  <Copy size={12} className="text-brand-600" />
                  <span className="text-[11px] font-bold text-brand-700 uppercase">Engagement Snapshot</span>
                </div>
                <div className="text-[12px] text-brand-700 font-mono">{form.engagementSnapshotId}</div>
                <div className="text-[11px] text-brand-600 mt-0.5">Immutable copy of RACM {form.sourceRacmVersionId} created at activation</div>
              </div>
            )}

            {/* Gantt positioning */}
            <div className="grid grid-cols-2 gap-3">
              <Dropdown<string>
                label="Start Month"
                value={MONTHS[form.start]}
                options={MONTHS}
                onChange={(v) => update('start', MONTHS.indexOf(v))}
                disabled={readOnly || isInExecution}
              />
              <div className="mb-3">
                <label className="text-[12px] font-semibold text-text-muted block mb-1.5">Duration (months)</label>
                <input type="number" min={1} max={12} value={form.duration}
                  onChange={(e) => update('duration', Math.max(1, Math.min(12, parseInt(e.target.value) || 1)))}
                  disabled={readOnly || isInExecution}
                  className={`w-full px-3 py-2.5 border border-border rounded-lg text-[13px] text-text focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all ${(readOnly || isInExecution) ? 'bg-surface-2 text-text-muted cursor-not-allowed' : 'bg-white'}`}
                />
              </div>
            </div>

            {/* Priority & Risk Score */}
            <div className="grid grid-cols-2 gap-3">
              <Dropdown<PriorityLevel>
                label="Priority"
                value={form.priority}
                options={PRIORITIES}
                onChange={(v) => update('priority', v)}
                disabled={readOnly || isInExecution}
                renderOption={(opt) => (
                  <span className={`font-semibold ${
                    opt === 'Critical' ? 'text-risk-700' : opt === 'High' ? 'text-high-700' :
                    opt === 'Medium' ? 'text-mitigated-700' : 'text-compliant-700'
                  }`}>{opt}</span>
                )}
              />
              <div className="mb-3">
                <label className="text-[12px] font-semibold text-text-muted block mb-1.5">Risk Score (1-100)</label>
                <input type="number" min={1} max={100} value={form.riskScore}
                  onChange={(e) => update('riskScore', Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                  disabled={readOnly || isInExecution}
                  className={`w-full px-3 py-2.5 border border-border rounded-lg text-[13px] text-text focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all ${(readOnly || isInExecution) ? 'bg-surface-2 text-text-muted cursor-not-allowed' : 'bg-white'}`}
                />
              </div>
            </div>

            {/* Description */}
            <div className="mb-3">
              <label className="text-[12px] font-semibold text-text-muted block mb-1.5">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
                disabled={readOnly || isInExecution}
                placeholder="Describe the scope and objectives of this engagement..."
                className={`w-full px-3 py-2.5 border border-border rounded-lg text-[13px] text-text focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all resize-none h-24 ${
                  (readOnly || isInExecution) ? 'bg-surface-2 text-text-muted cursor-not-allowed' : 'bg-white placeholder:text-text-muted/50'
                }`}
              />
            </div>
          </div>

          {/* Actions */}
          {!(readOnly || isInExecution) && (
            <div className="mt-5 pt-4 border-t border-border-light">
              <button
                onClick={() => onSave(form)}
                className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-[13px] font-semibold transition-colors cursor-pointer mb-3"
              >
                {isCreate ? 'Create Engagement' : 'Save Changes'}
              </button>
              {!isCreate && (
                <button
                  onClick={() => onDelete(form.id)}
                  className="w-full py-2 text-risk-700 hover:bg-risk-50 rounded-xl text-[12px] font-medium transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  Remove from Plan
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

interface Props {
  onNavigateToExecution?: (engagementId: string) => void;
}

export default function AuditPlanningView({ onNavigateToExecution }: Props) {
  const { addToast } = useToast();
  const [plan, setPlan] = useState<AuditEngagement[]>(INITIAL_AUDIT_PLAN);
  const [planFrozen, setPlanFrozen] = useState(false);
  const [signedOff, setSignedOff] = useState(false);
  const [showFreezeModal, setShowFreezeModal] = useState(false);
  const [showSignOffModal, setShowSignOffModal] = useState(false);
  const [showActivateModal, setShowActivateModal] = useState<string | null>(null);
  const [selectedSigner, setSelectedSigner] = useState(SIGNERS[0]);
  const [signOffComment, setSignOffComment] = useState('');
  const [signerDropdownOpen, setSignerDropdownOpen] = useState(false);

  const [activeTab, setActiveTab] = useState<TabId>('timeline');
  const [processFilter, setProcessFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const [drawerEngagement, setDrawerEngagement] = useState<AuditEngagement | null>(null);
  const [drawerIsCreate, setDrawerIsCreate] = useState(false);

  const handleFreeze = () => setShowFreezeModal(true);

  const confirmFreeze = () => {
    setPlanFrozen(true);
    // Move all draft/planned engagements to frozen
    setPlan(prev => prev.map(p =>
      ['draft', 'planned'].includes(p.status) ? { ...p, status: 'frozen' as EngagementLifecycle } : p
    ));
    setShowFreezeModal(false);
    addToast({ type: 'success', message: 'Audit plan frozen — scheduling locked' });
  };

  const handleSignOff = () => {
    if (signedOff) return;
    setShowSignOffModal(true);
  };

  const confirmSignOff = () => {
    setSignedOff(true);
    // Move frozen engagements to signed-off
    setPlan(prev => prev.map(p =>
      p.status === 'frozen' ? { ...p, status: 'signed-off' as EngagementLifecycle } : p
    ));
    setShowSignOffModal(false);
    setSignOffComment('');
    addToast({ type: 'success', message: 'Audit plan signed off — engagements ready for activation' });
  };

  const handleActivate = (id: string) => {
    setShowActivateModal(id);
  };

  const confirmActivate = () => {
    if (!showActivateModal) return;
    const engId = showActivateModal;
    const snapshotId = `snap-${Date.now().toString(36)}`;
    setPlan(prev => prev.map(p =>
      p.id === engId ? {
        ...p,
        status: 'active' as EngagementLifecycle,
        engagementSnapshotId: snapshotId,
        actualStartDate: new Date().toISOString().split('T')[0],
      } : p
    ));
    setShowActivateModal(null);
    setDrawerEngagement(null);
    addToast({ type: 'success', message: `Engagement activated — immutable snapshot ${snapshotId} created` });
    // Navigate to engagement execution hub
    if (onNavigateToExecution) {
      setTimeout(() => onNavigateToExecution(engId), 600);
    }
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
      auditType: 'SOX',
      framework: 'COSO',
      businessProcess: 'P2P',
      auditPeriodStart: '2025-04-01',
      auditPeriodEnd: '2026-03-31',
      plannedStartDate: '',
      plannedEndDate: '',
      actualStartDate: '',
      actualEndDate: '',
      owner: TEAM_MEMBERS[0].name,
      reviewer: TEAM_MEMBERS[3].name,
      description: '',
      sourceRacmVersionId: 'racm-v2.1',
      engagementSnapshotId: null,
      status: 'draft',
      controls: 0,
      plannedHours: 0,
      priority: 'Medium',
      riskScore: 50,
      start: 0,
      duration: 3,
      color: COLOR_PALETTE[colorIdx],
    });
    setDrawerIsCreate(true);
  };

  const handleSaveEngagement = (updated: AuditEngagement) => {
    if (drawerIsCreate) {
      setPlan(prev => [...prev, updated]);
      addToast({ type: 'success', message: `"${updated.name}" created as Draft` });
    } else {
      setPlan(prev => prev.map(p => p.id === updated.id ? updated : p));
      addToast({ type: 'success', message: `"${updated.name}" updated` });
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
  const uniqueProcesses = new Set(plan.map(a => a.businessProcess)).size;
  const activeCount = plan.filter(p => isExecutionPhase(p.status)).length;

  const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: 'timeline', label: 'Timeline', icon: Calendar },
    { id: 'resources', label: 'Resources', icon: Users },
    { id: 'risk-matrix', label: 'Risk Matrix', icon: AlertTriangle },
    { id: 'budget', label: 'Budget', icon: DollarSign },
  ];

  const processFilterOptions = ['All', ...PROCESSES];
  const statusFilterOptions = ['All', 'Active', 'Planned'];

  return (
    <div className="h-full overflow-y-auto bg-white bg-mesh-gradient relative">
      <Orb hoverIntensity={0.06} rotateOnHover hue={275} opacity={0.05} />

      <div className="p-8 relative">
        {/* Header */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary to-primary-medium text-white">
                <Calendar size={16} />
              </div>
              <h1 className="text-xl font-bold text-text">Audit Planning</h1>
            </div>
            <p className="text-sm text-text-secondary mt-1 ml-9">FY26 Annual Audit Plan — April 2025 to March 2026</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={openCreateDrawer}
              disabled={planFrozen && !signedOff}
              className="flex items-center gap-1.5 px-3 py-2 border border-primary/30 bg-primary/5 rounded-lg text-[12px] font-medium text-primary hover:bg-primary/10 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus size={13} />
              Add Engagement
            </button>
            {planFrozen ? (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-evidence-50 border border-evidence rounded-lg">
                <Lock size={13} className="text-evidence-700" />
                <span className="text-[12px] font-semibold text-evidence-700">Plan Frozen</span>
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
              disabled={!planFrozen}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-semibold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                signedOff
                  ? 'bg-compliant text-white'
                  : 'bg-primary hover:bg-primary-hover text-white'
              }`}
            >
              <CheckCircle2 size={13} />
              {signedOff ? 'Signed Off' : 'Sign Off'}
            </button>
          </div>
        </div>

        {/* Lifecycle Banner */}
        <div className="flex items-center gap-4 mb-6 p-3 rounded-xl bg-surface-2/50 border border-border-light">
          <div className="text-[11px] font-bold text-text-muted uppercase shrink-0">Plan Status:</div>
          {['Draft', 'Planned', 'Frozen', 'Signed Off', 'Activated'].map((step, i) => {
            const isDone = (i === 0) || (i === 1) || (i === 2 && planFrozen) || (i === 3 && signedOff) || (i === 4 && plan.some(p => isExecutionPhase(p.status)));
            const isCurrent = (i === 0 && !planFrozen && !signedOff) ||
                             (i === 2 && planFrozen && !signedOff) ||
                             (i === 3 && signedOff && !plan.some(p => p.status === 'active')) ||
                             (i === 4 && plan.some(p => isExecutionPhase(p.status)));
            return (
              <div key={step} className="flex items-center gap-2">
                {i > 0 && <ArrowRight size={10} className="text-text-muted/40" />}
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold ${
                  isCurrent ? 'bg-primary text-white' :
                  isDone ? 'bg-compliant-50 text-compliant-700' :
                  'bg-paper-50 text-ink-400'
                }`}>
                  {isDone && !isCurrent && <CheckCircle2 size={10} />}
                  {step}
                </div>
              </div>
            );
          })}
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <KpiCard label="Total Engagements" value={plan.length} icon={ClipboardList} color="text-primary bg-primary-xlight" index={0} />
          <KpiCard label="Processes Covered" value={uniqueProcesses} icon={LayoutGrid} color="text-evidence-700 bg-evidence-50" index={1} />
          <KpiCard label="Total Controls" value={totalControls} icon={ShieldCheck} color="text-compliant-700 bg-compliant-50" index={2} />
          <KpiCard label="In Execution" value={activeCount} icon={Zap} color="text-high-700 bg-high-50" index={3} />
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
                  <span className="ml-1 text-[12px] font-bold px-1.5 py-0.5 rounded-full bg-paper-50 text-ink-500">v2</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Filters */}
        {activeTab === 'timeline' && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-bold text-text-muted">Process:</span>
              <div className="flex gap-1">
                {processFilterOptions.map(opt => (
                  <button key={opt} onClick={() => setProcessFilter(opt)}
                    className={`px-2.5 py-1 rounded-full text-[12px] font-semibold transition-all cursor-pointer ${
                      processFilter === opt ? 'bg-primary text-white shadow-sm' : 'bg-surface-2 text-text-muted hover:bg-primary/10 hover:text-primary'
                    }`}>{opt}</button>
                ))}
              </div>
            </div>
            <div className="w-px h-5 bg-border-light" />
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-bold text-text-muted">Status:</span>
              <div className="flex gap-1">
                {statusFilterOptions.map(opt => (
                  <button key={opt} onClick={() => setStatusFilter(opt)}
                    className={`px-2.5 py-1 rounded-full text-[12px] font-semibold transition-all cursor-pointer ${
                      statusFilter === opt ? 'bg-primary text-white shadow-sm' : 'bg-surface-2 text-text-muted hover:bg-primary/10 hover:text-primary'
                    }`}>{opt}</button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'timeline' && (
            <motion.div key="timeline" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              <GanttChart items={plan} frozen={planFrozen} onClickEngagement={openEditDrawer} processFilter={processFilter} statusFilter={statusFilter} />
              <MilestonesStrip />

              {/* Current Execution Progress */}
              {plan.some(p => isExecutionPhase(p.status)) && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="mt-6">
                  <h2 className="text-[15px] font-semibold text-text mb-3">Execution Progress</h2>
                  <div className="glass-card rounded-2xl p-5">
                    <div className="space-y-4">
                      {plan.filter(p => isExecutionPhase(p.status)).map((eng, i) => {
                        const progressMap: Record<string, number> = { 'ap-1': 72, 'ap-2': 44, 'ap-3': 85, 'ap-6': 60 };
                        const progress = progressMap[eng.id] || 0;
                        const tested = Math.round((progress / 100) * eng.controls);

                        return (
                          <div key={eng.id}>
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ background: eng.color }} />
                                <span className="text-[12px] font-medium text-text">{eng.name}</span>
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${lifecycleTone(eng.status)}`}>
                                  {lifecycleLabel(eng.status)}
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-[12px] text-text-muted">{tested}/{eng.controls} controls</span>
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
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sign-off History */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="mt-6">
          <h2 className="text-[15px] font-semibold text-text mb-3">Sign-off History</h2>
          <div className="glass-card rounded-2xl overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-[12px] text-text-muted font-medium px-5 py-3">Name</th>
                  <th className="text-[12px] text-text-muted font-medium px-5 py-3">Role</th>
                  <th className="text-[12px] text-text-muted font-medium px-5 py-3">Action</th>
                  <th className="text-[12px] text-text-muted font-medium px-5 py-3">Date</th>
                  <th className="text-[12px] text-text-muted font-medium px-5 py-3">Status</th>
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
                      <span className={`text-[12px] font-bold px-2 py-1 rounded-full ${
                        entry.status === 'completed'
                          ? 'bg-compliant-50 text-compliant-700'
                          : signedOff && entry.action === 'Final Sign-Off'
                            ? 'bg-compliant-50 text-compliant-700'
                            : 'bg-high-50 text-high-700'
                      }`}>
                        {entry.status === 'completed' ? 'Completed' : signedOff && entry.action === 'Final Sign-Off' ? 'Completed' : 'Pending'}
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
            onActivate={handleActivate}
            onViewExecution={onNavigateToExecution ? (id) => { setDrawerEngagement(null); onNavigateToExecution(id); } : undefined}
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
                <div>
                  <p className="text-[13px] text-evidence-700 font-semibold">This will lock all scheduling changes.</p>
                  <p className="text-[12px] text-evidence-700/80 mt-1">All Draft and Planned engagements will move to Frozen state. You'll need to sign off before activating any engagement.</p>
                </div>
              </div>
              <div className="flex items-center gap-3 justify-end">
                <button onClick={() => setShowFreezeModal(false)} className="px-4 py-2 border border-border rounded-lg text-[12px] font-medium text-text-secondary hover:bg-surface-2 transition-colors cursor-pointer">Cancel</button>
                <button onClick={confirmFreeze} className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-[12px] font-semibold transition-colors cursor-pointer">Freeze Plan</button>
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
              <div className="flex items-start gap-3 p-3 bg-compliant-50 rounded-xl mb-4">
                <CheckCircle2 size={16} className="text-compliant-700 mt-0.5 shrink-0" />
                <p className="text-[12px] text-compliant-700">This is planning approval only. It does not approve test results or findings. After sign-off, individual engagements can be activated for execution.</p>
              </div>
              <div className="mb-4">
                <label className="text-[12px] font-semibold text-text-muted block mb-1.5">Signer</label>
                <div className="relative">
                  <button onClick={() => setSignerDropdownOpen(p => !p)}
                    className="w-full flex items-center justify-between px-3 py-2.5 border border-border rounded-lg text-[13px] text-text hover:border-primary/30 transition-colors cursor-pointer bg-white">
                    {selectedSigner}
                    <ChevronDown size={14} className={`text-text-muted transition-transform ${signerDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {signerDropdownOpen && (
                      <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.12 }}
                        className="absolute left-0 right-0 top-full mt-1 bg-white border border-border-light rounded-xl shadow-lg overflow-hidden z-10">
                        {SIGNERS.map(s => (
                          <button key={s} onClick={() => { setSelectedSigner(s); setSignerDropdownOpen(false); }}
                            className={`w-full text-left px-3 py-2 text-[12px] transition-colors cursor-pointer ${selectedSigner === s ? 'bg-primary/10 text-primary font-semibold' : 'text-text-secondary hover:bg-surface-2'}`}>{s}</button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              <div className="mb-5">
                <label className="text-[12px] font-semibold text-text-muted block mb-1.5">Comments</label>
                <textarea value={signOffComment} onChange={(e) => setSignOffComment(e.target.value)}
                  placeholder="Optional comments..."
                  className="w-full px-3 py-2.5 border border-border rounded-lg text-[13px] text-text placeholder:text-text-muted/50 focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all resize-none h-20"
                />
              </div>
              <div className="flex items-center gap-3 justify-end">
                <button onClick={() => setShowSignOffModal(false)} className="px-4 py-2 border border-border rounded-lg text-[12px] font-medium text-text-secondary hover:bg-surface-2 transition-colors cursor-pointer">Cancel</button>
                <button onClick={confirmSignOff} className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-[12px] font-semibold transition-colors cursor-pointer">Submit Sign-Off</button>
              </div>
            </div>
          </ModalBackdrop>
        )}
      </AnimatePresence>

      {/* Activation Modal */}
      <AnimatePresence>
        {showActivateModal && (
          <ModalBackdrop onClose={() => setShowActivateModal(null)}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[15px] font-bold text-text">Activate Engagement</h3>
                <button onClick={() => setShowActivateModal(null)} className="p-1 rounded-md hover:bg-surface-2 transition-colors cursor-pointer">
                  <X size={16} className="text-text-muted" />
                </button>
              </div>
              <div className="flex items-start gap-3 p-3 bg-brand-50 rounded-xl mb-4">
                <Zap size={16} className="text-brand-700 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[13px] text-brand-700 font-semibold">This will create an immutable Engagement Snapshot.</p>
                  <p className="text-[12px] text-brand-700/80 mt-1">
                    A point-in-time copy of the linked RACM version will be created. All execution (testing, evidence, findings) will run against this snapshot, not the live RACM. The engagement object itself is not duplicated.
                  </p>
                </div>
              </div>
              <div className="p-3 bg-surface-2 rounded-xl mb-5">
                <div className="text-[12px] space-y-1">
                  <div className="flex justify-between"><span className="text-text-muted">Engagement</span><span className="font-medium text-text">{plan.find(p => p.id === showActivateModal)?.name}</span></div>
                  <div className="flex justify-between"><span className="text-text-muted">RACM Version</span><span className="font-medium text-text">{plan.find(p => p.id === showActivateModal)?.sourceRacmVersionId}</span></div>
                  <div className="flex justify-between"><span className="text-text-muted">Controls</span><span className="font-medium text-text">{plan.find(p => p.id === showActivateModal)?.controls}</span></div>
                </div>
              </div>
              <div className="flex items-center gap-3 justify-end">
                <button onClick={() => setShowActivateModal(null)} className="px-4 py-2 border border-border rounded-lg text-[12px] font-medium text-text-secondary hover:bg-surface-2 transition-colors cursor-pointer">Cancel</button>
                <button onClick={confirmActivate} className="px-4 py-2 bg-gradient-to-r from-primary to-primary-medium hover:brightness-110 text-white rounded-lg text-[12px] font-semibold transition-all cursor-pointer flex items-center gap-1.5">
                  <Zap size={13} />
                  Activate & Create Snapshot
                </button>
              </div>
            </div>
          </ModalBackdrop>
        )}
      </AnimatePresence>
    </div>
  );
}
