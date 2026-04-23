import { useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText,
  ShieldCheck,
  AlertTriangle,
  Tag,
  ClipboardList,
  Clock,
  CheckCircle2,
  ArrowRight,
  ChevronDown,
  BarChart3,
  Activity,
  Paperclip,
} from 'lucide-react';
import {
  ACTION_HUB_SUMMARY,
  ACTION_HUB_TIMELINE,
  GRC_EXCEPTIONS,
  type ActionHubEvent,
  type ActionHubActorRole,
  type GrcException,
} from '../../data/mockData';
import ExceptionStatusTracker from './ExceptionStatusTracker';
import ExceptionListDrawer from './ExceptionListDrawer';

type DrillPreset = {
  key: string;
  title: string;
  subtitle: string;
  ids: string[];
};

const PRESETS: Record<string, { title: string; subtitle: string; ids: string[] | 'all' | ((ex: GrcException) => boolean) }> = {
  total:             { title: 'Total Exceptions',    subtitle: 'All flagged exceptions',                          ids: 'all' },
  classified:        { title: 'Classified',          subtitle: 'Exceptions with a Risk Owner classification',     ids: ['EX-2024-001','EX-2024-003','EX-2024-004','EX-2024-005','EX-2024-006','EX-2024-008','EX-2024-010','EX-2024-011','EX-2024-012','EX-2024-014'] },
  actionPlans:       { title: 'Action Plans',        subtitle: 'Exceptions with an action plan documented',       ids: ['EX-2024-001','EX-2024-003','EX-2024-004','EX-2024-006','EX-2024-010','EX-2024-012'] },
  underReview:       { title: 'Under Review',        subtitle: 'Awaiting auditor review',                         ids: (ex) => ex.status === 'Under Review' },
  resolved:          { title: 'Resolved',            subtitle: 'Closed exceptions',                               ids: ['EX-2024-003','EX-2024-006','EX-2024-010'] },
  overdue:           { title: 'Overdue',             subtitle: 'Past action due date, not yet resolved',          ids: (ex) => ex.flags?.includes('Overdue') ?? false },
  // Risk Owner tiles
  roClassifications:   { title: 'Classifications',       subtitle: 'Exceptions classified by Risk Owner',            ids: ['EX-2024-001','EX-2024-003','EX-2024-004','EX-2024-005','EX-2024-006','EX-2024-008','EX-2024-010','EX-2024-011','EX-2024-012','EX-2024-014'] },
  roActionPlansFiled:  { title: 'Action Plans Filed',    subtitle: 'Action plans submitted by Risk Owner',           ids: ['EX-2024-001','EX-2024-003','EX-2024-004','EX-2024-006','EX-2024-010','EX-2024-012'] },
  roBulkActions:       { title: 'Bulk Actions',          subtitle: 'Exceptions grouped under a bulk action',         ids: (ex) => Boolean(ex.bulkId) },
  roIndividualActions: { title: 'Individual Actions',    subtitle: 'Non-bulk actions submitted by Risk Owner',       ids: ['EX-2024-001','EX-2024-006','EX-2024-010','EX-2024-012'] },
  // Auditor tiles
  auReviewsPerformed:  { title: 'Reviews Performed',     subtitle: 'Exceptions reviewed by Auditor',                 ids: ['EX-2024-001','EX-2024-003','EX-2024-006','EX-2024-010','EX-2024-012'] },
  auApproved:          { title: 'Approved / Accepted',   subtitle: 'Action plans approved by Auditor',               ids: ['EX-2024-003','EX-2024-010'] },
  auRejected:          { title: 'Rejected',              subtitle: 'Action plans rejected by Auditor',               ids: ['EX-2024-012'] },
  auCasesClosed:       { title: 'Cases Closed',          subtitle: 'Cases finalized by Auditor',                     ids: ['EX-2024-003','EX-2024-006','EX-2024-010'] },
};

function resolvePreset(key: string): DrillPreset | null {
  const p = PRESETS[key];
  if (!p) return null;
  let ids: string[];
  if (p.ids === 'all') ids = GRC_EXCEPTIONS.map(e => e.id);
  else if (Array.isArray(p.ids)) ids = p.ids;
  else ids = GRC_EXCEPTIONS.filter(p.ids).map(e => e.id);
  return { key, title: p.title, subtitle: p.subtitle, ids };
}

type BreakdownTone = 'high' | 'risk' | 'brand' | 'compliant' | 'draft';
type PersonaTileTone = 'brand' | 'compliant' | 'risk' | 'evidence';

const BREAKDOWN_BAR: Record<BreakdownTone, string> = {
  high:      'bg-high',
  risk:      'bg-[#F07A74]',
  brand:     'bg-brand-400',
  compliant: 'bg-[#22C55E]',
  draft:     'bg-ink-300',
};

const BREAKDOWN_LABEL: Record<BreakdownTone, string> = {
  high:      'text-high-700',
  risk:      'text-risk',
  brand:     'text-brand-700',
  compliant: 'text-compliant-700',
  draft:     'text-ink-700',
};

const PERSONA_TILE_VALUE: Record<PersonaTileTone, string> = {
  brand:     'text-brand-700',
  compliant: 'text-compliant-700',
  risk:      'text-risk',
  evidence:  'text-evidence-700',
};

const ROLE_AVATAR: Record<ActionHubActorRole, { initials: string; bg: string; fg: string }> = {
  'Risk Owner': { initials: 'RO', bg: 'bg-brand-100',    fg: 'text-brand-700' },
  'Auditor':    { initials: 'AU', bg: 'bg-[#EDE4FA]',   fg: 'text-brand-700' },
  'Ira (AI)':   { initials: 'AI', bg: 'bg-compliant-50', fg: 'text-compliant-700' },
  'System':     { initials: 'SY', bg: 'bg-[#EEEEF1]',   fg: 'text-ink-600' },
};

const ROLE_DOT: Record<ActionHubActorRole, string> = {
  'Risk Owner': 'bg-brand-600',
  'Auditor':    'bg-brand-400',
  'Ira (AI)':   'bg-compliant',
  'System':     'bg-ink-300',
};

function CollapsibleSection({
  icon: Icon,
  title,
  subtitle,
  badge,
  defaultOpen = true,
  children,
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="bg-canvas-elevated border border-canvas-border rounded-[12px] overflow-hidden mb-4">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 cursor-pointer text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-[8px] bg-[#F4F2F7] text-ink-600 flex items-center justify-center">
            <Icon size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-[14px] font-semibold text-ink-900">{title}</h3>
              {badge}
            </div>
            {subtitle && <p className="text-[12px] text-ink-500 mt-0.5">{subtitle}</p>}
          </div>
        </div>
        <ChevronDown size={16} className={`text-ink-500 transition-transform ${open ? '' : '-rotate-90'}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-canvas-border pt-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function CircularProgress({ pct, size = 64, stroke = 5, label }: { pct: number; size?: number; stroke?: number; label?: string }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;
  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--color-canvas-border)" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="var(--color-brand-600)"
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-[13px] font-semibold text-brand-700 tabular-nums">
        {label ?? `${pct}%`}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
  icon: Icon,
  navigable,
  onClick,
}: {
  label: string;
  value: number;
  tone: 'default' | 'brand' | 'evidence' | 'mitigated' | 'compliant' | 'risk';
  icon: React.ElementType;
  navigable?: boolean;
  onClick?: () => void;
}) {
  const tones = {
    default:   { bg: 'bg-canvas-elevated', border: 'border-canvas-border', iconBg: 'bg-[#F4F2F7]',    iconColor: 'text-ink-500',       valueColor: 'text-ink-900' },
    brand:     { bg: 'bg-brand-50/70',     border: 'border-brand-100',     iconBg: 'bg-brand-100',    iconColor: 'text-brand-700',     valueColor: 'text-brand-700' },
    evidence:  { bg: 'bg-evidence-50/60',  border: 'border-evidence-50',   iconBg: 'bg-evidence-50',  iconColor: 'text-evidence-700',  valueColor: 'text-evidence-700' },
    mitigated: { bg: 'bg-mitigated-50/60', border: 'border-mitigated-50',  iconBg: 'bg-mitigated-50', iconColor: 'text-mitigated-700', valueColor: 'text-mitigated-700' },
    compliant: { bg: 'bg-compliant-50/60', border: 'border-compliant-50',  iconBg: 'bg-compliant-50', iconColor: 'text-compliant-700', valueColor: 'text-compliant-700' },
    risk:      { bg: 'bg-risk-50/60',      border: 'border-risk-50',       iconBg: 'bg-risk-50',      iconColor: 'text-risk-700',      valueColor: 'text-risk-700' },
  }[tone];

  const interactive = Boolean(onClick);
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!interactive}
      className={`${tones.bg} border ${tones.border} rounded-[12px] p-4 flex flex-col justify-between min-h-[110px] text-left transition-colors ${
        interactive ? 'cursor-pointer hover:border-brand-300' : 'cursor-default'
      }`}
    >
      <div className="flex items-start justify-between w-full">
        <div className="text-[12px] text-ink-500">{label}</div>
        <div className={`w-7 h-7 ${tones.iconBg} ${tones.iconColor} rounded-full flex items-center justify-center shrink-0`}>
          <Icon size={14} strokeWidth={1.75} />
        </div>
      </div>
      <div className="flex items-end justify-between w-full">
        <div className={`text-[28px] leading-none font-semibold tabular-nums ${tones.valueColor}`}>{value}</div>
        {navigable && <ArrowRight size={14} className="text-ink-400" />}
      </div>
    </button>
  );
}

function PersonaCard({
  name,
  initials,
  role,
  totalActions,
  tiles,
  onTileClick,
}: {
  name: string;
  initials: string;
  role: 'Risk Owner' | 'Auditor';
  totalActions: number;
  tiles: { label: string; value: number; tone: PersonaTileTone; presetKey?: string }[];
  onTileClick?: (presetKey: string) => void;
}) {
  const avatarStyle = role === 'Risk Owner'
    ? { bg: 'bg-brand-100',  fg: 'text-brand-700' }
    : { bg: 'bg-[#EDE4FA]', fg: 'text-brand-700' };
  return (
    <div className="bg-canvas-elevated border border-canvas-border rounded-[12px] p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-[8px] ${avatarStyle.bg} ${avatarStyle.fg} flex items-center justify-center font-semibold text-[13px]`}>
            {initials}
          </div>
          <div>
            <div className="text-[15px] font-semibold text-ink-900 leading-tight">{name}</div>
            <div className="text-[12px] text-ink-500">{role}</div>
          </div>
        </div>
        <span className="inline-flex items-center h-6 px-2.5 text-[11px] font-medium bg-brand-50 text-brand-700 rounded-full tabular-nums">
          {totalActions} total actions
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {tiles.map((t) => (
          <button
            key={t.label}
            onClick={() => t.presetKey && onTileClick?.(t.presetKey)}
            className="border border-canvas-border rounded-[10px] p-3 text-left hover:border-brand-200 hover:bg-[#FAFAFB] transition-colors cursor-pointer flex items-start justify-between"
          >
            <div>
              <div className={`text-[24px] leading-none font-semibold tabular-nums ${PERSONA_TILE_VALUE[t.tone]}`}>{t.value}</div>
              <div className="text-[12px] text-ink-500 mt-2">{t.label}</div>
            </div>
            <ArrowRight size={13} className="text-ink-400 mt-0.5" />
          </button>
        ))}
      </div>
    </div>
  );
}

function BreakdownBar({
  row,
  maxCount,
}: {
  row: { label: string; count: number; tone: BreakdownTone; underline?: boolean };
  maxCount: number;
}) {
  const pct = Math.max(6, (row.count / maxCount) * 100);
  return (
    <button className="group grid grid-cols-[200px_1fr_auto_auto] items-center gap-4 py-2.5 w-full text-left cursor-pointer">
      <span className={`text-[13px] font-medium ${BREAKDOWN_LABEL[row.tone]} ${row.underline ? 'underline underline-offset-4' : ''}`}>
        {row.label}
      </span>
      <div className="h-2 rounded-full bg-[#EEEEF1] overflow-hidden">
        <div
          className={`h-full rounded-full ${BREAKDOWN_BAR[row.tone]}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[13px] font-semibold text-ink-800 tabular-nums w-4 text-right">{row.count}</span>
      <ArrowRight size={13} className="text-ink-400 group-hover:text-brand-700" />
    </button>
  );
}

function TimelineEntry({ event }: { event: ActionHubEvent }) {
  const avatar = ROLE_AVATAR[event.role];
  const dot = ROLE_DOT[event.role];
  return (
    <li className="relative flex gap-3 py-3">
      <div className={`shrink-0 w-8 h-8 rounded-full ${avatar.bg} ${avatar.fg} flex items-center justify-center text-[10px] font-semibold tracking-wider`}>
        {avatar.initials}
      </div>
      <div className="flex-1 min-w-0 pr-6">
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <span className="text-[13px] text-ink-900 font-medium leading-snug">{event.message}</span>
          {event.exceptionId && event.exceptionId !== '—' && (
            <span className="inline-flex items-center h-5 px-2 text-[10.5px] font-medium bg-brand-50 text-brand-700 rounded-full font-mono">
              {event.exceptionId}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-[11.5px] text-ink-500">
          <span>{event.actor} <span className="text-ink-400">[{event.role}]</span></span>
          <span className="text-ink-300">·</span>
          <span className="tabular-nums">{event.time}</span>
          <span className="text-ink-300">·</span>
          <em className="not-italic">{event.relative}</em>
        </div>
        {event.comment && (
          <p className="mt-1.5 text-[12px] italic text-ink-500 leading-relaxed">{event.comment}</p>
        )}
        {event.attachment && (
          <button className="mt-2 inline-flex items-center gap-1.5 text-[11.5px] text-ink-600 hover:text-brand-700 cursor-pointer">
            <Paperclip size={11} />
            {event.attachment.name}
          </button>
        )}
      </div>
      <span className={`absolute top-4 right-0 w-2 h-2 rounded-full ${dot}`} aria-hidden="true" />
    </li>
  );
}

export default function ActionHubView() {
  const s = ACTION_HUB_SUMMARY;
  const timeline = ACTION_HUB_TIMELINE;
  const maxBreakdown = useMemo(() => Math.max(...s.classificationBreakdown.rows.map(r => r.count)), [s]);

  const [openPresetKey, setOpenPresetKey] = useState<string | null>(null);
  const openPreset = openPresetKey ? resolvePreset(openPresetKey) : null;
  const presetExceptions = useMemo(
    () => (openPreset ? openPreset.ids.map(id => GRC_EXCEPTIONS.find(e => e.id === id)).filter(Boolean) as GrcException[] : []),
    [openPreset],
  );
  const openDrawer = useCallback((key: string) => setOpenPresetKey(key), []);

  const roTiles = s.riskOwner.tiles.map((t, i) => ({
    ...t,
    presetKey: ['roClassifications', 'roActionPlansFiled', 'roBulkActions', 'roIndividualActions'][i],
  }));
  const auTiles = s.auditor.tiles.map((t, i) => ({
    ...t,
    presetKey: ['auReviewsPerformed', 'auApproved', 'auRejected', 'auCasesClosed'][i],
  }));

  // Group timeline events by date preserving order.
  const grouped = useMemo(() => {
    const groups: { date: string; events: ActionHubEvent[] }[] = [];
    timeline.forEach(ev => {
      const last = groups[groups.length - 1];
      if (last && last.date === ev.date) last.events.push(ev);
      else groups.push({ date: ev.date, events: [ev] });
    });
    return groups;
  }, [timeline]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex-1 overflow-auto"
    >
      <div className="px-8 py-6 max-w-[1600px] mx-auto">
        {/* Title row */}
        <div className="flex items-start justify-between gap-6 mb-5">
          <div>
            <h1 className="font-display text-[26px] text-ink-900 font-semibold tracking-tight">Action Hub</h1>
            <p className="text-[12.5px] text-ink-500 mt-1">
              Audit Period: <span className="font-semibold text-ink-800">{s.auditPeriod}</span>
              <span className="text-ink-300 mx-2">·</span>
              Viewed by: <span className="font-semibold text-ink-800">{s.viewedBy}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 bg-brand-50/70 border border-brand-100 rounded-[12px] px-4 py-2.5">
              <CircularProgress pct={s.reportHealthPct} size={48} stroke={4} label={`${s.reportHealthPct}%`} />
              <div className="leading-tight">
                <div className="text-[11px] text-ink-500">Report Health</div>
                <div className="text-[14px] font-semibold text-ink-900">{s.reportHealthLabel}</div>
              </div>
            </div>
            <button className="h-11 px-4 inline-flex items-center gap-2 text-[13px] font-semibold text-white bg-brand-600 hover:bg-brand-500 rounded-[8px] cursor-pointer transition-colors">
              <FileText size={15} />
              Generate ATR
            </button>
          </div>
        </div>

        {/* ATR Readiness Check */}
        <div className="bg-canvas-elevated border border-canvas-border rounded-[12px] p-5 mb-4">
          <div className="flex items-center gap-4 mb-4">
            <CircularProgress pct={s.atrReadiness.overallPct} size={56} stroke={5} label={`${s.atrReadiness.overallPct}%`} />
            <div className="flex-1 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-brand-700" />
                <h3 className="text-[14px] font-semibold text-ink-900">ATR Readiness Check</h3>
              </div>
              <span className="inline-flex items-center h-6 px-2.5 text-[11px] font-medium bg-[#F4F2F7] text-ink-600 rounded-full tabular-nums">
                {s.atrReadiness.completedSteps}/{s.atrReadiness.totalSteps} complete
              </span>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-5">
            {s.atrReadiness.steps.map(step => {
              const pct = (step.current / step.total) * 100;
              return (
                <div key={step.id}>
                  <div className="text-[12px] text-ink-700 mb-2">{step.label}</div>
                  <div className="h-1.5 rounded-full bg-[#EEEEF1] overflow-hidden mb-1.5">
                    <div className="h-full rounded-full bg-mitigated" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="text-[11px] text-ink-500 tabular-nums">{step.current}/{step.total}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Overdue banner */}
        {s.overdue.length > 0 && (
          <button
            onClick={() => openDrawer('overdue')}
            className="w-full flex items-center gap-4 bg-risk-50 border border-risk-50 rounded-[12px] p-4 mb-5 text-left hover:bg-risk-50/80 cursor-pointer transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-risk-50 border border-risk/30 text-risk flex items-center justify-center shrink-0">
              <AlertTriangle size={16} />
            </div>
            <div className="flex-1">
              <div className="text-[14px] font-semibold text-risk-700 mb-1.5">
                {s.overdue.length} Overdue Cases — Immediate Attention Required
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {s.overdue.map(c => (
                  <span
                    key={c.id}
                    className="inline-flex items-center gap-1.5 h-6 px-2.5 text-[11px] font-medium bg-canvas-elevated border border-risk/20 text-ink-700 rounded-full"
                  >
                    <span className="font-mono text-ink-700">{c.id}</span>
                    <span className="text-ink-300">·</span>
                    <span className="text-risk-700">{c.overdueLabel}</span>
                  </span>
                ))}
              </div>
            </div>
            <ArrowRight size={16} className="text-risk-700 shrink-0" />
          </button>
        )}

        {/* Count stats */}
        <div className="grid grid-cols-6 gap-3 mb-5">
          <StatCard label="Total Exceptions" value={s.counts.total}        tone="default"   icon={AlertTriangle}  onClick={() => openDrawer('total')} />
          <StatCard label="Classified"       value={s.counts.classified}   tone="brand"     icon={Tag}            navigable onClick={() => openDrawer('classified')} />
          <StatCard label="Action Plans"     value={s.counts.actionPlans}  tone="evidence"  icon={ClipboardList}  navigable onClick={() => openDrawer('actionPlans')} />
          <StatCard label="Under Review"     value={s.counts.underReview}  tone="mitigated" icon={Clock}          navigable onClick={() => openDrawer('underReview')} />
          <StatCard label="Resolved"         value={s.counts.resolved}     tone="compliant" icon={CheckCircle2}   navigable onClick={() => openDrawer('resolved')} />
          <StatCard label="Overdue"          value={s.counts.overdue}      tone="risk"      icon={AlertTriangle}  navigable onClick={() => openDrawer('overdue')} />
        </div>

        {/* Persona split */}
        <div className="grid grid-cols-2 gap-4 mb-5">
          <PersonaCard
            name={s.riskOwner.name}
            initials={s.riskOwner.initials}
            role="Risk Owner"
            totalActions={s.riskOwner.totalActions}
            tiles={roTiles}
            onTileClick={openDrawer}
          />
          <PersonaCard
            name={s.auditor.name}
            initials={s.auditor.initials}
            role="Auditor"
            totalActions={s.auditor.totalActions}
            tiles={auTiles}
            onTileClick={openDrawer}
          />
        </div>

        {/* Exception Status Tracker */}
        <ExceptionStatusTracker />

        {/* Classification Breakdown */}
        <CollapsibleSection
          icon={BarChart3}
          title="Classification Breakdown"
          subtitle={`${s.classificationBreakdown.classified} classified · ${s.classificationBreakdown.unclassified} unclassified · ${s.classificationBreakdown.bulk} bulk · ${s.classificationBreakdown.individual} individual`}
        >
          <div className="divide-y divide-canvas-border">
            {s.classificationBreakdown.rows.map(row => (
              <BreakdownBar key={row.label} row={row} maxCount={maxBreakdown} />
            ))}
          </div>
        </CollapsibleSection>

        {/* Activity Timeline */}
        <CollapsibleSection
          icon={Activity}
          title="Activity Timeline"
          subtitle="Chronological log of every action across all exceptions"
          badge={
            <span className="inline-flex items-center h-5 px-2 text-[11px] font-medium bg-[#F4F2F7] text-ink-600 rounded-full tabular-nums">
              {timeline.length}
            </span>
          }
        >
          <div className="max-h-[560px] overflow-y-auto pr-1">
            {grouped.map(group => (
              <div key={group.date} className="relative">
                <div className="sticky top-0 z-10 bg-canvas-elevated flex items-center justify-between py-2 border-b border-canvas-border">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">{group.date}</span>
                  <span className="text-[11px] text-ink-400 tabular-nums">
                    {group.events.length} {group.events.length === 1 ? 'event' : 'events'}
                  </span>
                </div>
                <ol className="divide-y divide-canvas-border">
                  {group.events.map(ev => (
                    <TimelineEntry key={ev.id} event={ev} />
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      </div>

      <AnimatePresence>
        {openPreset && (
          <ExceptionListDrawer
            key={openPreset.key}
            title={openPreset.title}
            subtitle={openPreset.subtitle}
            exceptions={presetExceptions}
            onClose={() => setOpenPresetKey(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
