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
  Eye,
  FlaskConical,
  ChevronDown,
  FileBarChart,
  Layers,
  Columns3,
} from 'lucide-react';
import {
  GRC_EXCEPTIONS,
  type GrcException,
  type GrcExceptionSeverity,
  type GrcExceptionStatus,
  type GrcExceptionClassification,
  type GrcReviewStatus,
} from '../../data/mockData';
import type { ExceptionRole } from '../../hooks/useAppState';
import {
  ReviewClassificationDrawer,
  ReviewCaseDrawer,
  BulkActionGroupModal,
  ClassifyExceptionDrawer,
} from './ReviewDrawers';
import ActionHubView from './ActionHubView';

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

const SEVERITY_STYLE: Record<GrcExceptionSeverity, string> = {
  High:   'bg-high-50 text-high-700',
  Medium: 'bg-mitigated-50 text-mitigated-700',
  Low:    'bg-compliant-50 text-compliant-700',
};

const STATUS_STYLE: Record<GrcExceptionStatus, string> = {
  Open:           'bg-evidence-50 text-evidence-700',
  'Under Review': 'bg-mitigated-50 text-mitigated-700',
  Closed:         'bg-compliant-50 text-compliant-700',
};

const CLASSIFICATION_STYLE: Record<GrcExceptionClassification, string> = {
  Unclassified:                'bg-[#F4F2F7] text-ink-600',
  'Design Deficiency':         'bg-high-50 text-high-700',
  'System Deficiency':         'bg-risk-50 text-risk-700',
  'Procedural Non-Compliance': 'bg-brand-50 text-brand-700',
  'Business as Usual':         'bg-compliant-50 text-compliant-700',
  'False Positive':            'bg-[#EEEEF1] text-ink-600',
};

const REVIEW_STYLE: Record<GrcReviewStatus, string> = {
  Pending:     'bg-mitigated-50 text-mitigated-700',
  Approved:    'bg-compliant-50 text-compliant-700',
  Rejected:    'bg-risk-50 text-risk-700',
  Implemented: 'bg-compliant-50 text-compliant-700',
};

function Pill({ children, className }: { children: React.ReactNode; className: string }) {
  return (
    <span className={`inline-flex items-center h-6 px-2.5 text-[11px] font-medium rounded-full whitespace-nowrap ${className}`}>
      {children}
    </span>
  );
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

  const toggleAll = () => {
    setSelected(prev => (prev.size === exceptions.length ? new Set() : new Set(exceptions.map(e => e.id))));
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

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-[8px] bg-brand-600 text-white flex items-center justify-center font-semibold text-[13px] tracking-tight">
            ira
          </div>
          <span className="font-display text-[17px] text-ink-900 font-semibold tracking-tight">irame.ai</span>
          <span className="ml-1 inline-flex items-center h-6 px-2.5 text-[11px] font-medium bg-[#F4F2F7] text-ink-600 rounded-full">
            Case Mgmt
          </span>
        </div>

        <nav className="flex items-center gap-1 ml-6">
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
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1.5 h-9 px-3 text-[12px] font-medium text-ink-700 bg-canvas-elevated border border-canvas-border rounded-[8px] hover:border-brand-200 cursor-pointer">
                  <FlaskConical size={14} />
                  Sample Data
                </button>
                {role === 'risk-owner' && (
                  <button
                    disabled={selected.size === 0}
                    className={`flex items-center gap-1.5 h-9 px-3 text-[12px] font-medium rounded-[8px] border cursor-pointer ${
                      selected.size === 0
                        ? 'text-ink-400 bg-canvas-elevated border-canvas-border cursor-not-allowed'
                        : 'text-ink-700 bg-canvas-elevated border-canvas-border hover:border-brand-200'
                    }`}
                  >
                    Bulk Action
                    <ChevronDown size={13} />
                  </button>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <StatCard label="Total Exceptions" value={stats.total} icon={AlertTriangle} tone="default" />
              <StatCard label="Exceptions Classified" value={stats.classified} icon={Tag} tone="info" />
              <StatCard label="Classification Review Pending" value={stats.classReviewPending} icon={Clock} tone="warning" />
              <StatCard label="Action Review Pending" value={stats.actionReviewPending} icon={CheckCircle2} tone="alert" />
            </div>

            {/* Table card */}
            <div className="bg-canvas-elevated border border-canvas-border rounded-[12px] overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-canvas-border">
                <span className="text-[13px] font-medium text-ink-700 tabular-nums">{exceptions.length} Exceptions</span>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-1.5 h-8 px-2.5 text-[12px] text-ink-600 bg-canvas-elevated border border-canvas-border rounded-[8px] hover:border-brand-200 cursor-pointer">
                    <Eye size={13} />
                    Columns
                  </button>
                  <button className="flex items-center gap-1.5 h-8 px-2.5 text-[12px] text-ink-600 bg-canvas-elevated border border-canvas-border rounded-[8px] hover:border-brand-200 cursor-pointer">
                    <Columns3 size={13} />
                    Comfortable
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-[12.5px]">
                  <thead>
                    <tr className="bg-[#FAFAFB] border-b border-canvas-border text-left text-ink-500 uppercase tracking-wider">
                      <th className="w-10 px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selected.size === exceptions.length}
                          onChange={toggleAll}
                          className="accent-brand-600 cursor-pointer"
                          aria-label="Select all exceptions"
                        />
                      </th>
                      <th className="px-3 py-3 font-medium text-[10.5px]">Exception ID</th>
                      <th className="px-3 py-3 font-medium text-[10.5px]">Risk Category</th>
                      <th className="px-3 py-3 font-medium text-[10.5px]">Severity</th>
                      <th className="px-3 py-3 font-medium text-[10.5px]">Status</th>
                      <th className="px-3 py-3 font-medium text-[10.5px]">Classification</th>
                      <th className="px-3 py-3 font-medium text-[10.5px]">Class. Review</th>
                      <th className="px-3 py-3 font-medium text-[10.5px]">Action Review</th>
                      <th className="px-3 py-3 font-medium text-[10.5px]">Last Updated</th>
                      <th className="px-3 py-3 font-medium text-[10.5px] text-center">Classify</th>
                      {role === 'auditor' && (
                        <th className="px-3 py-3 font-medium text-[10.5px] text-center">Action</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {exceptions.map((ex) => (
                      <ExceptionRow
                        key={ex.id}
                        ex={ex}
                        role={role}
                        selected={selected.has(ex.id)}
                        onToggle={() => toggleSelect(ex.id)}
                        onOpenClassification={() => {
                          if (role === 'risk-owner' && ex.classification === 'Unclassified') {
                            setDrawer({ type: 'classify', exceptionId: ex.id });
                          } else {
                            setDrawer({ type: 'classification', exceptionId: ex.id });
                          }
                        }}
                        onOpenAction={() => setDrawer({ type: 'action', exceptionId: ex.id })}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
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
      </AnimatePresence>
    </div>
  );
}

function ExceptionRow({
  ex,
  role,
  selected,
  onToggle,
  onOpenClassification,
  onOpenAction,
}: {
  ex: GrcException;
  role: ExceptionRole;
  selected: boolean;
  onToggle: () => void;
  onOpenClassification: () => void;
  onOpenAction: () => void;
}) {
  const isOverdue = ex.flags?.includes('Overdue');
  const isBulk = ex.flags?.includes('Bulk');

  // Risk Owner rules: can Classify if Unclassified, else View.
  // Auditor rules: Review Classification if class. review Pending, else View.
  //                Review Action if action review Pending AND exception classified, else View.
  const rowBg = isOverdue ? 'bg-risk-50/40' : selected ? 'bg-brand-50/60' : 'hover:bg-[#FAFAFB]';

  const classifyButton = (() => {
    if (role === 'risk-owner') {
      return ex.classification === 'Unclassified' ? (
        <PrimaryButton icon={<Tag size={12} />} onClick={onOpenClassification}>Classify</PrimaryButton>
      ) : (
        <GhostButton icon={<Eye size={12} />} onClick={onOpenClassification}>View</GhostButton>
      );
    }
    // Auditor
    return ex.classificationReview === 'Pending' && ex.classification !== 'Unclassified' ? (
      <PrimaryButton icon={<Tag size={12} />} onClick={onOpenClassification}>Review Classification</PrimaryButton>
    ) : (
      <GhostButton icon={<Eye size={12} />} onClick={onOpenClassification}>View</GhostButton>
    );
  })();

  const actionButton = (() => {
    if (role === 'risk-owner') {
      return <GhostButton icon={<Eye size={12} />} onClick={onOpenAction}>View</GhostButton>;
    }
    return ex.actionReview === 'Pending' && ex.classification !== 'Unclassified' ? (
      <PrimaryButton icon={<ArrowLeft size={12} className="rotate-180" />} onClick={onOpenAction}>Review Action</PrimaryButton>
    ) : (
      <GhostButton icon={<Eye size={12} />} onClick={onOpenAction}>View</GhostButton>
    );
  })();

  return (
    <tr className={`border-b border-canvas-border last:border-b-0 transition-colors ${rowBg}`}>
      <td className="px-4 py-3 align-top">
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggle}
          className="accent-brand-600 cursor-pointer"
          aria-label={`Select ${ex.id}`}
        />
      </td>
      <td className="px-3 py-3 align-top">
        <div className="flex flex-col gap-1">
          <button className="text-brand-700 font-medium text-[12.5px] font-mono hover:underline cursor-pointer text-left">
            {ex.id}
          </button>
          <div className="flex items-center gap-1">
            {isOverdue && (
              <span className="inline-flex items-center gap-1 h-5 px-2 text-[10px] font-medium bg-risk-50 text-risk-700 rounded-full">
                <AlertTriangle size={9} />
                Overdue
              </span>
            )}
            {isBulk && (
              <span className="inline-flex items-center h-5 px-2 text-[10px] font-medium bg-brand-50 text-brand-700 rounded-full">
                Bulk
              </span>
            )}
          </div>
        </div>
      </td>
      <td className="px-3 py-3 align-middle text-ink-800 text-[12.5px]">{ex.riskCategory}</td>
      <td className="px-3 py-3 align-middle"><Pill className={SEVERITY_STYLE[ex.severity]}>{ex.severity}</Pill></td>
      <td className="px-3 py-3 align-middle"><Pill className={STATUS_STYLE[ex.status]}>{ex.status}</Pill></td>
      <td className="px-3 py-3 align-middle"><Pill className={CLASSIFICATION_STYLE[ex.classification]}>{ex.classification}</Pill></td>
      <td className="px-3 py-3 align-middle"><Pill className={REVIEW_STYLE[ex.classificationReview]}>{ex.classificationReview}</Pill></td>
      <td className="px-3 py-3 align-middle"><Pill className={REVIEW_STYLE[ex.actionReview]}>{ex.actionReview}</Pill></td>
      <td className="px-3 py-3 align-middle text-ink-500 text-[11.5px] tabular-nums whitespace-nowrap">{ex.lastUpdated}</td>
      <td className="px-3 py-3 align-middle text-center">{classifyButton}</td>
      {role === 'auditor' && (
        <td className="px-3 py-3 align-middle text-center">{actionButton}</td>
      )}
    </tr>
  );
}

function PrimaryButton({ children, icon, onClick }: { children: React.ReactNode; icon?: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 h-7 px-3 text-[11.5px] font-semibold text-white bg-brand-600 rounded-[7px] hover:bg-brand-500 transition-colors cursor-pointer whitespace-nowrap"
    >
      {icon}
      {children}
    </button>
  );
}

function GhostButton({ children, icon, onClick }: { children: React.ReactNode; icon?: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 h-7 px-3 text-[11.5px] font-medium text-ink-700 bg-canvas-elevated border border-canvas-border rounded-[7px] hover:border-brand-200 hover:text-brand-700 transition-colors cursor-pointer whitespace-nowrap"
    >
      {icon}
      {children}
    </button>
  );
}
