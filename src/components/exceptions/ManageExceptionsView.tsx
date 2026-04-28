import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  AlertTriangle,
  Tag,
  Clock,
  CheckCircle2,
  Bell,
  Activity,
  FlaskConical,
  FileBarChart,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { GRC_EXCEPTIONS } from '../../data/mockData';
import { REPORT_QUERIES_ATR } from '../../data/reportQueries';
import type { ExceptionRole } from '../../hooks/useAppState';
import {
  ReviewClassificationDrawer,
  ReviewCaseDrawer,
  BulkActionGroupModal,
  ClassifyExceptionDrawer,
} from './ReviewDrawers';
import ActionHubView from './ActionHubView';
import ExceptionsTable from './ExceptionsTable';
import SampleDataModal, { type SampleDataPayload } from './SampleDataModal';
import BulkClassifyModal from './BulkClassifyModal';
import ActivityTimelineDrawer from './ActivityTimelineDrawer';
import { useToast } from '../shared/Toast';

type DrawerState =
  | { type: 'classification'; exceptionId: string }
  | { type: 'action'; exceptionId: string }
  | { type: 'classify'; exceptionId: string }
  | null;

interface ManageExceptionsViewProps {
  role: ExceptionRole;
  setRole: (role: ExceptionRole) => void;
  onBack: () => void;
  embedded?: boolean;
}

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
  active,
  onClick,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  tone: 'default' | 'info' | 'warning' | 'alert';
  active?: boolean;
  onClick?: () => void;
}) {
  const toneStyles = {
    default: { bg: 'bg-canvas-elevated', border: 'border-canvas-border', iconBg: 'bg-[#F4F2F7]', iconColor: 'text-ink-500', valueColor: 'text-ink-900' },
    info:    { bg: 'bg-brand-50/70',     border: 'border-brand-100',    iconBg: 'bg-brand-100',  iconColor: 'text-brand-700', valueColor: 'text-brand-700' },
    warning: { bg: 'bg-mitigated-50/60', border: 'border-mitigated-50', iconBg: 'bg-mitigated-50',iconColor: 'text-mitigated-700', valueColor: 'text-mitigated-700' },
    alert:   { bg: 'bg-high-50/60',      border: 'border-high-50',      iconBg: 'bg-high-50',    iconColor: 'text-high-700', valueColor: 'text-high-700' },
  }[tone];

  const interactive = Boolean(onClick);
  const activeRing = active ? 'ring-2 ring-brand-600 ring-offset-1' : '';
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!interactive}
      className={`${toneStyles.bg} border ${toneStyles.border} rounded-[12px] p-4 flex items-start justify-between text-left ${activeRing} ${
        interactive ? 'cursor-pointer hover:border-brand-300 transition-colors' : 'cursor-default'
      }`}
      aria-pressed={interactive ? !!active : undefined}
    >
      <div>
        <div className="text-[12px] text-ink-500 mb-2">{label}</div>
        <div className={`text-[28px] leading-none font-semibold tabular-nums ${toneStyles.valueColor}`}>{value}</div>
      </div>
      <div className={`w-8 h-8 ${toneStyles.iconBg} ${toneStyles.iconColor} rounded-full flex items-center justify-center shrink-0`}>
        <Icon size={16} strokeWidth={1.75} />
      </div>
    </button>
  );
}

function InlineStatTile({
  label,
  value,
  icon: Icon,
  tone,
  active,
  onClick,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  tone: 'default' | 'info' | 'warning' | 'alert';
  active?: boolean;
  onClick?: () => void;
}) {
  const toneStyles = {
    default: { iconBg: 'bg-[#F4F2F7]',     iconColor: 'text-ink-500',       valueColor: 'text-ink-900' },
    info:    { iconBg: 'bg-brand-100',     iconColor: 'text-brand-700',     valueColor: 'text-brand-700' },
    warning: { iconBg: 'bg-mitigated-50',  iconColor: 'text-mitigated-700', valueColor: 'text-mitigated-700' },
    alert:   { iconBg: 'bg-high-50',       iconColor: 'text-high-700',      valueColor: 'text-high-700' },
  }[tone];
  const activeRing = active ? 'ring-2 ring-brand-600 ring-offset-1' : '';
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-3 p-2 rounded-[10px] text-left cursor-pointer hover:bg-[#F4F2F7] transition-colors ${activeRing}`}
      aria-pressed={!!active}
    >
      <div className={`w-9 h-9 ${toneStyles.iconBg} ${toneStyles.iconColor} rounded-full flex items-center justify-center shrink-0`}>
        <Icon size={16} strokeWidth={1.75} />
      </div>
      <div>
        <div className={`text-[22px] leading-none font-semibold tabular-nums ${toneStyles.valueColor} mb-1`}>{value}</div>
        <div className="text-[11px] text-ink-500 tracking-wide">{label}</div>
      </div>
    </button>
  );
}

function RoleToggle({ role, setRole }: { role: ExceptionRole; setRole: (r: ExceptionRole) => void }) {
  return (
    <div className="flex items-center gap-1 p-1 bg-canvas-elevated border border-canvas-border rounded-full">
      <button
        onClick={() => setRole('risk-owner')}
        className={`flex items-center gap-1.5 px-3 h-7 text-[12px] font-medium rounded-full transition-colors cursor-pointer ${
          role === 'risk-owner' ? 'bg-brand-50 text-brand-700' : 'text-ink-500 hover:text-ink-700'
        }`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${role === 'risk-owner' ? 'bg-brand-600' : 'bg-ink-300'}`} />
        Risk Owner
      </button>
      <button
        onClick={() => setRole('auditor')}
        className={`flex items-center gap-1.5 px-3 h-7 text-[12px] font-medium rounded-full transition-colors cursor-pointer ${
          role === 'auditor' ? 'bg-brand-50 text-brand-700' : 'text-ink-500 hover:text-ink-700'
        }`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${role === 'auditor' ? 'bg-brand-600' : 'bg-ink-300'}`} />
        Auditor
      </button>
    </div>
  );
}

export default function ManageExceptionsView({ role, setRole, onBack, embedded = false }: ManageExceptionsViewProps) {
  const [activeNav, setActiveNav] = useState<'exceptions' | 'action-hub'>('exceptions');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [drawer, setDrawer] = useState<DrawerState>(null);
  const [bulkModalId, setBulkModalId] = useState<string | null>(null);
  const [sampleModalOpen, setSampleModalOpen] = useState(false);
  const [sampleCountLeft, setSampleCountLeft] = useState(5);
  const [sampleSheets, setSampleSheets] = useState<{ id: string; name: string; payload: SampleDataPayload }[]>([]);
  const [activeSheetId, setActiveSheetId] = useState<string>('all');
  const [activityDrawerOpen, setActivityDrawerOpen] = useState(false);
  const { addToast } = useToast();
  const [bulkClassifyOpen, setBulkClassifyOpen] = useState(false);
  const [nextActionableNum, setNextActionableNum] = useState(2);
  const [atrExpanded, setAtrExpanded] = useState(false);

  const sourceQuery = useMemo(() => {
    if (typeof window === 'undefined') return null;
    const fromId = new URLSearchParams(window.location.search).get('from');
    if (!fromId) return null;
    return REPORT_QUERIES_ATR[fromId] ? { id: fromId, ...REPORT_QUERIES_ATR[fromId] } : null;
  }, []);

  const exceptions = GRC_EXCEPTIONS;

  const drawerException = useMemo(
    () => (drawer ? exceptions.find(e => e.id === drawer.exceptionId) ?? null : null),
    [drawer, exceptions],
  );

  const stats = useMemo(() => {
    const total = exceptions.length;
    const classified = exceptions.filter(e => e.classification !== 'Unclassified').length;
    const unclassified = exceptions.filter(e => e.classification === 'Unclassified').length;
    const actionReviewPending = exceptions.filter(e => e.actionReview === 'Pending' && e.classification !== 'Unclassified').length;
    return { total, classified, unclassified, actionReviewPending };
  }, [exceptions]);

  // KPI-driven filter — clicking a tile narrows the table; clicking the active tile clears.
  type KpiFilter = 'total' | 'classified' | 'unclassified' | 'actionReviewPending' | null;
  const [kpiFilter, setKpiFilter] = useState<KpiFilter>(null);

  // Sample-sheet view — narrows rows to the configured sample/filter rules.
  const sheetExceptions = useMemo(() => {
    if (activeSheetId === 'all') return exceptions;
    const sheet = sampleSheets.find(s => s.id === activeSheetId);
    if (!sheet) return exceptions;
    const { mode, filterRows, samplePct } = sheet.payload;
    if (mode === 'sample' && typeof samplePct === 'number') {
      const n = Math.max(1, Math.ceil((exceptions.length * samplePct) / 100));
      const seed = sheet.id.split('').reduce((s, c) => s + c.charCodeAt(0), 0);
      const start = seed % Math.max(1, exceptions.length);
      return Array.from({ length: n }, (_, i) => exceptions[(start + i) % exceptions.length]);
    }
    if (mode === 'filter' && filterRows) {
      const valid = filterRows.filter(r => r.columnKey && r.condition);
      if (valid.length === 0) return exceptions;
      const ratio = Math.max(0.25, 1 - valid.length * 0.25);
      const n = Math.max(1, Math.ceil(exceptions.length * ratio));
      const seed = sheet.id.split('').reduce((s, c) => s + c.charCodeAt(0), 0);
      return [...exceptions]
        .sort((a, b) => ((a.id.charCodeAt((seed) % a.id.length) || 0) - (b.id.charCodeAt((seed) % b.id.length) || 0)))
        .slice(0, n);
    }
    return exceptions;
  }, [exceptions, activeSheetId, sampleSheets]);

  const visibleExceptions = useMemo(() => {
    switch (kpiFilter) {
      case 'classified':           return sheetExceptions.filter(e => e.classification !== 'Unclassified');
      case 'unclassified':         return sheetExceptions.filter(e => e.classification === 'Unclassified');
      case 'actionReviewPending':  return sheetExceptions.filter(e => e.actionReview === 'Pending' && e.classification !== 'Unclassified');
      default:                     return sheetExceptions;
    }
  }, [sheetExceptions, kpiFilter]);
  const toggleKpiFilter = (k: Exclude<KpiFilter, null>) => setKpiFilter(prev => (prev === k ? null : k));

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };


  const notificationCount = role === 'risk-owner' ? 5 : 3;

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-canvas">
      {/* Top chrome — own header for Case Mgmt sub-app */}
      <header className="shrink-0 h-[60px] px-6 flex items-center gap-4 bg-canvas-elevated border-b border-canvas-border">
        {!embedded && (
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-[12px] text-ink-500 hover:text-brand-700 transition-colors cursor-pointer pr-2 border-r border-canvas-border mr-1"
            aria-label="Back to reports"
          >
            <ArrowLeft size={14} />
            Back
          </button>
        )}

        <nav className="flex items-center gap-1">
          <button
            onClick={() => setActiveNav('exceptions')}
            className={`flex items-center gap-2 h-9 px-3.5 text-[13px] font-medium rounded-[8px] transition-colors cursor-pointer ${
              activeNav === 'exceptions' ? 'bg-brand-50 text-brand-700' : 'text-ink-500 hover:text-ink-700 hover:bg-[#F4F2F7]'
            }`}
          >
            <Layers size={15} />
            Exceptions
          </button>
          <button
            onClick={() => setActiveNav('action-hub')}
            className={`flex items-center gap-2 h-9 px-3.5 text-[13px] font-medium rounded-[8px] transition-colors cursor-pointer ${
              activeNav === 'action-hub' ? 'bg-brand-50 text-brand-700' : 'text-ink-500 hover:text-ink-700 hover:bg-[#F4F2F7]'
            }`}
          >
            <FileBarChart size={15} />
            Action Hub
          </button>
        </nav>

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActivityDrawerOpen(true)}
            className="w-9 h-9 rounded-full flex items-center justify-center text-ink-500 hover:text-brand-700 hover:bg-brand-50 cursor-pointer"
            aria-label="Activity timeline"
          >
            <Activity size={16} />
          </button>
          <button className="relative w-9 h-9 rounded-full flex items-center justify-center text-ink-500 hover:text-brand-700 hover:bg-brand-50 cursor-pointer" aria-label="Notifications">
            <Bell size={16} />
            <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-risk text-white text-[10px] font-semibold flex items-center justify-center tabular-nums">
              {notificationCount}
            </span>
          </button>
          <RoleToggle role={role} setRole={setRole} />
        </div>
      </header>

      {activeNav === 'action-hub' ? (
        <ActionHubView />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="flex-1 overflow-auto"
        >
          <div className="px-8 py-6 max-w-[1600px] mx-auto min-h-full flex flex-col">
            {/* Title row */}
            <div className="flex items-center justify-between mb-5">
              <h1 className="font-display text-[26px] text-ink-900 font-semibold tracking-tight">Manage Exceptions</h1>
            </div>

            {sourceQuery ? (
              <div className="mb-6 bg-canvas-elevated border border-canvas-border rounded-[10px] overflow-hidden">
                {/* KPI strip */}
                <div className="grid grid-cols-4 gap-3 px-6 py-5">
                  <InlineStatTile label="Total Exceptions"        value={stats.total}                tone="default" icon={AlertTriangle} active={kpiFilter === null}                onClick={() => setKpiFilter(null)} />
                  <InlineStatTile label="Exceptions Classified"   value={stats.classified}           tone="info"    icon={Tag}            active={kpiFilter === 'classified'}          onClick={() => toggleKpiFilter('classified')} />
                  <InlineStatTile label="Unclassified Exceptions" value={stats.unclassified}         tone="warning" icon={Clock}          active={kpiFilter === 'unclassified'}        onClick={() => toggleKpiFilter('unclassified')} />
                  <InlineStatTile label="Action Review Pending"   value={stats.actionReviewPending}  tone="alert"   icon={CheckCircle2}   active={kpiFilter === 'actionReviewPending'} onClick={() => toggleKpiFilter('actionReviewPending')} />
                </div>
                {/* Divider + source query ATR */}
                <div className="px-6 py-5 border-t border-canvas-border">
                  <div className="flex items-center gap-2 mb-3 text-[11px]">
                    <span className="font-bold text-brand-700 uppercase tracking-wider">Query · {sourceQuery.id}</span>
                  </div>
                  <button
                    onClick={() => setAtrExpanded(p => !p)}
                    className="flex items-start gap-2 text-left w-full mb-4 cursor-pointer focus:outline-none focus-visible:outline-none focus:ring-0 group"
                  >
                    <motion.span
                      animate={{ rotate: atrExpanded ? 0 : -90 }}
                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                      className="inline-flex mt-1 text-brand-700"
                    >
                      <ChevronDown size={14} />
                    </motion.span>
                    <p className="text-[14px] text-ink-700 leading-relaxed transition-colors group-hover:text-ink-900">
                      {sourceQuery.title}
                    </p>
                  </button>
                  <p className="text-[13px] text-ink-500 leading-relaxed">{sourceQuery.summary}</p>
                </div>
                <AnimatePresence initial={false}>
                  {atrExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 border-t border-canvas-border pt-5">
                        <div className="space-y-6">
                          {[
                            { title: 'Findings', items: sourceQuery.findings },
                            { title: 'Observations', items: sourceQuery.observations },
                          ].map(section => (
                            <div key={section.title}>
                              <h4 className="text-[11px] font-bold text-ink-500 uppercase tracking-wider mb-3">{section.title}</h4>
                              <ul className="space-y-2.5">
                                {section.items.map((item, i) => (
                                  <motion.li
                                    key={i}
                                    initial={{ opacity: 0, x: -4 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.08 + i * 0.05, duration: 0.3 }}
                                    className="flex gap-2.5 text-[13px] text-ink-700 leading-relaxed"
                                  >
                                    <div className="w-1 h-1 rounded-full mt-2 shrink-0 bg-brand-600/60" />
                                    {item}
                                  </motion.li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-4 mb-6">
                <StatCard label="Total Exceptions"        value={stats.total}                tone="default" icon={AlertTriangle} active={kpiFilter === null}                onClick={() => setKpiFilter(null)} />
                <StatCard label="Exceptions Classified"   value={stats.classified}           tone="info"    icon={Tag}            active={kpiFilter === 'classified'}          onClick={() => toggleKpiFilter('classified')} />
                <StatCard label="Unclassified Exceptions" value={stats.unclassified}         tone="warning" icon={Clock}          active={kpiFilter === 'unclassified'}        onClick={() => toggleKpiFilter('unclassified')} />
                <StatCard label="Action Review Pending"   value={stats.actionReviewPending}  tone="alert"   icon={CheckCircle2}   active={kpiFilter === 'actionReviewPending'} onClick={() => toggleKpiFilter('actionReviewPending')} />
              </div>
            )}

            {/* Table card */}
            <ExceptionsTable
              exceptions={visibleExceptions}
              role={role}
              selected={selected}
              onToggleSelect={toggleSelect}
              onToggleAll={(ids) => {
                const allSelected = ids.every(id => selected.has(id));
                if (allSelected) {
                  setSelected(prev => {
                    const next = new Set(prev);
                    ids.forEach(id => next.delete(id));
                    return next;
                  });
                } else {
                  setSelected(prev => {
                    const next = new Set(prev);
                    ids.forEach(id => next.add(id));
                    return next;
                  });
                }
              }}
              onOpenClassification={(ex) => {
                if (role === 'risk-owner' && ex.classification === 'Unclassified') {
                  setDrawer({ type: 'classify', exceptionId: ex.id });
                } else {
                  setDrawer({ type: 'classification', exceptionId: ex.id });
                }
              }}
              onOpenAction={(ex) => setDrawer({ type: 'action', exceptionId: ex.id })}
              onOpenActionable={(bulkId) => setBulkModalId(bulkId)}
              headerLeading={
                role === 'risk-owner' ? (
                  <button
                    disabled={selected.size === 0}
                    onClick={() => setBulkClassifyOpen(true)}
                    title={selected.size === 0 ? 'Select cases first' : `Bulk classify ${selected.size} selected case${selected.size === 1 ? '' : 's'}`}
                    className={`flex items-center gap-1.5 h-8 px-2.5 text-[12px] font-medium rounded-[8px] border transition-colors ${
                      selected.size === 0
                        ? 'text-ink-400 bg-canvas-elevated border-canvas-border cursor-not-allowed'
                        : 'text-white bg-brand-600 border-brand-600 hover:bg-brand-500 cursor-pointer'
                    }`}
                  >
                    <Tag size={13} />
                    Bulk Classify
                    {selected.size > 0 && (
                      <span className="inline-flex items-center h-5 min-w-5 px-1 text-[10.5px] font-semibold bg-white/20 rounded-full tabular-nums">
                        {selected.size}
                      </span>
                    )}
                  </button>
                ) : null
              }
              headerExtras={
                <button
                  onClick={() => setSampleModalOpen(true)}
                  className="flex items-center gap-1.5 h-8 px-2.5 text-[12px] text-ink-600 bg-canvas-elevated border border-canvas-border rounded-[8px] hover:border-brand-200 cursor-pointer"
                >
                  <FlaskConical size={13} />
                  Sample Data
                </button>
              }
              sampleSheets={sampleSheets}
              activeSheetId={activeSheetId}
              onChangeSheet={setActiveSheetId}
            />
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {drawer?.type === 'classify' && drawerException && (
          <ClassifyExceptionDrawer
            key="classify-drawer"
            exception={drawerException}
            onClose={() => setDrawer(null)}
            onSave={() => setDrawer(null)}
          />
        )}
        {drawer?.type === 'classification' && drawerException && (
          <ReviewClassificationDrawer
            key="classification-drawer"
            exception={drawerException}
            role={role}
            onClose={() => setDrawer(null)}
            onDecision={() => setDrawer(null)}
          />
        )}
        {drawer?.type === 'action' && drawerException && (
          <ReviewCaseDrawer
            key="action-drawer"
            exception={drawerException}
            role={role}
            onClose={() => setDrawer(null)}
            onDecision={() => setDrawer(null)}
            onViewBulk={(bulkId) => setBulkModalId(bulkId)}
          />
        )}
        {bulkModalId && (
          <BulkActionGroupModal
            key="bulk-modal"
            bulkId={bulkModalId}
            onClose={() => setBulkModalId(null)}
          />
        )}
        {sampleModalOpen && (
          <SampleDataModal
            key="sample-modal"
            defaultName={`Sample Data ${6 - sampleCountLeft}`}
            availableCount={sampleCountLeft}
            totalCount={5}
            onClose={() => setSampleModalOpen(false)}
            onCreate={(payload) => {
              const id = `sheet-${Date.now()}`;
              setSampleSheets(prev => [...prev, { id, name: payload.name, payload }]);
              setActiveSheetId(id);
              setSampleCountLeft(c => Math.max(0, c - 1));
              setSampleModalOpen(false);
              addToast({ type: 'success', message: `Sample sheet "${payload.name}" has been created successfully` });
            }}
          />
        )}
        {bulkClassifyOpen && (
          <BulkClassifyModal
            key="bulk-classify-modal"
            selectedCases={exceptions.filter(e => selected.has(e.id))}
            actionableId={`ACT${String(nextActionableNum).padStart(3, '0')}`}
            onClose={() => setBulkClassifyOpen(false)}
            onApply={() => {
              setNextActionableNum(n => n + 1);
              setSelected(new Set());
              setBulkClassifyOpen(false);
            }}
          />
        )}
        {activityDrawerOpen && (
          <ActivityTimelineDrawer
            key="activity-timeline-drawer"
            onClose={() => setActivityDrawerOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

