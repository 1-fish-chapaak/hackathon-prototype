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
} from 'lucide-react';
import { GRC_EXCEPTIONS } from '../../data/mockData';
import type { ExceptionRole } from '../../hooks/useAppState';
import {
  ReviewClassificationDrawer,
  ReviewCaseDrawer,
  BulkActionGroupModal,
  ClassifyExceptionDrawer,
} from './ReviewDrawers';
import ActionHubView from './ActionHubView';
import ExceptionsTable from './ExceptionsTable';
import SampleDataModal from './SampleDataModal';
import BulkClassifyModal from './BulkClassifyModal';

type DrawerState =
  | { type: 'classification'; exceptionId: string }
  | { type: 'action'; exceptionId: string }
  | { type: 'classify'; exceptionId: string }
  | null;

interface ManageExceptionsViewProps {
  role: ExceptionRole;
  setRole: (role: ExceptionRole) => void;
  onBack: () => void;
}

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  tone: 'default' | 'info' | 'warning' | 'alert';
}) {
  const toneStyles = {
    default: { bg: 'bg-canvas-elevated', border: 'border-canvas-border', iconBg: 'bg-[#F4F2F7]', iconColor: 'text-ink-500', valueColor: 'text-ink-900' },
    info:    { bg: 'bg-brand-50/70',     border: 'border-brand-100',    iconBg: 'bg-brand-100',  iconColor: 'text-brand-700', valueColor: 'text-brand-700' },
    warning: { bg: 'bg-mitigated-50/60', border: 'border-mitigated-50', iconBg: 'bg-mitigated-50',iconColor: 'text-mitigated-700', valueColor: 'text-mitigated-700' },
    alert:   { bg: 'bg-high-50/60',      border: 'border-high-50',      iconBg: 'bg-high-50',    iconColor: 'text-high-700', valueColor: 'text-high-700' },
  }[tone];

  return (
    <div className={`${toneStyles.bg} border ${toneStyles.border} rounded-[12px] p-4 flex items-start justify-between`}>
      <div>
        <div className="text-[12px] text-ink-500 mb-2">{label}</div>
        <div className={`text-[28px] leading-none font-semibold tabular-nums ${toneStyles.valueColor}`}>{value}</div>
      </div>
      <div className={`w-8 h-8 ${toneStyles.iconBg} ${toneStyles.iconColor} rounded-full flex items-center justify-center shrink-0`}>
        <Icon size={16} strokeWidth={1.75} />
      </div>
    </div>
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

export default function ManageExceptionsView({ role, setRole, onBack }: ManageExceptionsViewProps) {
  const [activeNav, setActiveNav] = useState<'exceptions' | 'action-hub'>('exceptions');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [drawer, setDrawer] = useState<DrawerState>(null);
  const [bulkModalId, setBulkModalId] = useState<string | null>(null);
  const [sampleModalOpen, setSampleModalOpen] = useState(false);
  const [sampleCountLeft, setSampleCountLeft] = useState(5);
  const [bulkClassifyOpen, setBulkClassifyOpen] = useState(false);
  const [nextActionableNum, setNextActionableNum] = useState(2);

  const exceptions = GRC_EXCEPTIONS;

  const drawerException = useMemo(
    () => (drawer ? exceptions.find(e => e.id === drawer.exceptionId) ?? null : null),
    [drawer, exceptions],
  );

  const stats = useMemo(() => {
    const total = exceptions.length;
    const classified = exceptions.filter(e => e.classification !== 'Unclassified').length;
    const classReviewPending = exceptions.filter(e => e.classificationReview === 'Pending').length;
    const actionReviewPending = exceptions.filter(e => e.actionReview === 'Pending' && e.classification !== 'Unclassified').length;
    return { total, classified, classReviewPending, actionReviewPending };
  }, [exceptions]);

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
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-[12px] text-ink-500 hover:text-brand-700 transition-colors cursor-pointer pr-2 border-r border-canvas-border mr-1"
          aria-label="Back to reports"
        >
          <ArrowLeft size={14} />
          Back
        </button>

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
          <button className="w-9 h-9 rounded-full flex items-center justify-center text-ink-500 hover:text-brand-700 hover:bg-brand-50 cursor-pointer" aria-label="Activity">
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
          <div className="px-8 py-6 max-w-[1600px] mx-auto">
            {/* Title row */}
            <div className="flex items-center justify-between mb-5">
              <h1 className="font-display text-[26px] text-ink-900 font-semibold tracking-tight">Manage Exceptions</h1>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <StatCard label="Total Exceptions" value={stats.total} icon={AlertTriangle} tone="default" />
              <StatCard label="Exceptions Classified" value={stats.classified} icon={Tag} tone="info" />
              <StatCard label="Classification Review Pending" value={stats.classReviewPending} icon={Clock} tone="warning" />
              <StatCard label="Action Review Pending" value={stats.actionReviewPending} icon={CheckCircle2} tone="alert" />
            </div>

            {/* Table card */}
            <ExceptionsTable
              exceptions={exceptions}
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
            onClose={() => setDrawer(null)}
            onDecision={() => setDrawer(null)}
          />
        )}
        {drawer?.type === 'action' && drawerException && (
          <ReviewCaseDrawer
            key="action-drawer"
            exception={drawerException}
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
            onAcceptAll={() => setBulkModalId(null)}
            onRejectAll={() => setBulkModalId(null)}
          />
        )}
        {sampleModalOpen && (
          <SampleDataModal
            key="sample-modal"
            defaultName={`Sample Data ${6 - sampleCountLeft}`}
            availableCount={sampleCountLeft}
            totalCount={5}
            onClose={() => setSampleModalOpen(false)}
            onCreate={() => {
              setSampleCountLeft(c => Math.max(0, c - 1));
              setSampleModalOpen(false);
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
      </AnimatePresence>
    </div>
  );
}

