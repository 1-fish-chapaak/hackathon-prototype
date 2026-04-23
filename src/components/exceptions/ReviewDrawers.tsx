import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  X,
  Paperclip,
  Link as LinkIcon,
  ExternalLink,
  CheckCircle2,
  XCircle,
  ChevronDown,
  Calendar,
  FileText,
  User,
} from 'lucide-react';
import {
  GRC_CASE_DETAILS,
  GRC_BULK_ACTIONS,
  GRC_EXCEPTIONS,
  type GrcException,
  type GrcActivityEntry,
  type GrcActionStatus,
  type GrcExceptionClassification,
  type GrcExceptionSeverity,
  type GrcReviewStatus,
} from '../../data/mockData';

const CLASSIFICATION_STYLE: Record<GrcExceptionClassification, string> = {
  Unclassified:                'bg-[#F4F2F7] text-ink-600',
  'Design Deficiency':         'bg-high-50 text-high-700',
  'System Deficiency':         'bg-risk-50 text-risk-700',
  'Procedural Non-Compliance': 'bg-brand-50 text-brand-700',
  'Business as Usual':         'bg-compliant-50 text-compliant-700',
  'False Positive':            'bg-[#EEEEF1] text-ink-600',
};

const REVIEW_STYLE: Record<GrcReviewStatus, string> = {
  Pending:     'bg-[#EEEEF1] text-ink-600',
  Approved:    'bg-compliant-50 text-compliant-700',
  Rejected:    'bg-risk-50 text-risk-700',
  Implemented: 'bg-compliant-50 text-compliant-700',
};

const ACTION_STATUS_STYLE: Record<GrcActionStatus, string> = {
  Pending:                'bg-[#EEEEF1] text-ink-600',
  Implemented:            'bg-compliant-50 text-compliant-700',
  'Partially Implemented':'bg-mitigated-50 text-mitigated-700',
};

function Overlay({ onClick }: { onClick: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 bg-ink-900/40 backdrop-blur-[2px] z-40"
      onClick={onClick}
    />
  );
}

function DrawerShell({
  title,
  subtitle,
  onClose,
  children,
  footer,
  tabs,
  activeTab,
  onTabChange,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer: React.ReactNode;
  tabs?: string[];
  activeTab?: string;
  onTabChange?: (t: string) => void;
}) {
  return (
    <motion.aside
      initial={{ x: 24, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 24, opacity: 0 }}
      transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
      className="fixed top-0 right-0 bottom-0 w-full max-w-[560px] bg-canvas-elevated shadow-xl border-l border-canvas-border flex flex-col z-50"
      role="dialog"
      aria-label={title}
    >
      <header className="shrink-0 px-6 pt-5 pb-0 border-b border-canvas-border">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <h2 className="font-display text-[20px] font-semibold text-ink-900 tracking-tight">{title}</h2>
            {subtitle && <p className="text-[12.5px] text-ink-500 mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full text-ink-500 hover:text-ink-800 hover:bg-[#F4F2F7] flex items-center justify-center cursor-pointer"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>
        {tabs && (
          <div className="flex items-center gap-5 -mb-px">
            {tabs.map(t => {
              const active = t === activeTab;
              return (
                <button
                  key={t}
                  onClick={() => onTabChange?.(t)}
                  className={`pb-3 text-[13px] font-medium transition-colors cursor-pointer border-b-2 ${
                    active ? 'border-brand-600 text-brand-700' : 'border-transparent text-ink-500 hover:text-ink-700'
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        )}
      </header>
      <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
      <footer className="shrink-0 px-6 py-4 border-t border-canvas-border bg-canvas-elevated flex items-center gap-2">
        {footer}
      </footer>
    </motion.aside>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-500 mb-2">
      {children}
    </div>
  );
}

function Pill({ children, className }: { children: React.ReactNode; className: string }) {
  return (
    <span className={`inline-flex items-center h-6 px-2.5 text-[11px] font-medium rounded-full whitespace-nowrap ${className}`}>
      {children}
    </span>
  );
}

function FooterButtons({
  onCancel,
  onReject,
  onApprove,
}: {
  onCancel: () => void;
  onReject: () => void;
  onApprove: () => void;
}) {
  return (
    <>
      <button
        onClick={onCancel}
        className="flex-1 h-10 text-[13px] font-medium text-ink-700 bg-canvas-elevated border border-canvas-border rounded-[8px] hover:border-brand-200 transition-colors cursor-pointer"
      >
        Cancel
      </button>
      <button
        onClick={onReject}
        className="flex-1 h-10 text-[13px] font-semibold text-white bg-risk hover:bg-risk-700 rounded-[8px] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
      >
        <XCircle size={14} />
        Reject
      </button>
      <button
        onClick={onApprove}
        className="flex-1 h-10 text-[13px] font-semibold text-white bg-compliant hover:bg-compliant-700 rounded-[8px] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
      >
        <CheckCircle2 size={14} />
        Approve
      </button>
    </>
  );
}

function ActivityTimeline({ entries }: { entries: GrcActivityEntry[] }) {
  const [showMore, setShowMore] = useState(false);
  const visible = showMore ? entries : entries.slice(0, 3);
  const hiddenCount = entries.length - visible.length;

  return (
    <div>
      <SectionLabel>Activity Log</SectionLabel>
      <ol className="space-y-4">
        {visible.map((entry) => (
          <li key={entry.id} className="flex gap-3">
            <div className="shrink-0 w-7 h-7 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center">
              <User size={13} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3 mb-0.5">
                <div className="text-[12.5px] text-ink-800">
                  <span className="font-semibold">{entry.author}</span>{' '}
                  <span className="text-ink-500">[{entry.role}]</span>
                </div>
                <span className="text-[11px] text-ink-500 tabular-nums whitespace-nowrap">{entry.timestamp}</span>
              </div>
              <p className="text-[12.5px] text-ink-700 leading-snug">{entry.message}</p>
              {entry.comment && (
                <div className="mt-2 px-3 py-2 bg-[#FAFAFB] border border-canvas-border rounded-[8px] text-[12px] text-ink-700 leading-relaxed">
                  {entry.comment}
                </div>
              )}
              {entry.attachment && (
                <button className="mt-2 inline-flex items-center gap-1.5 h-6 px-2 bg-brand-50 text-brand-700 text-[11.5px] font-medium rounded-full hover:bg-brand-100 cursor-pointer">
                  <Paperclip size={11} />
                  {entry.attachment.name}
                </button>
              )}
            </div>
          </li>
        ))}
      </ol>
      {hiddenCount > 0 && !showMore && (
        <button
          onClick={() => setShowMore(true)}
          className="mt-4 inline-flex items-center gap-1 text-[12.5px] font-medium text-brand-700 hover:text-brand-600 cursor-pointer"
        >
          <ChevronDown size={13} />
          Show {hiddenCount} more
        </button>
      )}
    </div>
  );
}

// ─── Review Classification Drawer ───
export function ReviewClassificationDrawer({
  exception,
  onClose,
  onDecision,
}: {
  exception: GrcException;
  onClose: () => void;
  onDecision: (decision: 'approve' | 'reject') => void;
}) {
  const detail = GRC_CASE_DETAILS[exception.id];
  const [comment, setComment] = useState('');

  return (
    <>
      <Overlay onClick={onClose} />
      <DrawerShell
        title="Review Classification"
        onClose={onClose}
        footer={
          <FooterButtons
            onCancel={onClose}
            onReject={() => onDecision('reject')}
            onApprove={() => onDecision('approve')}
          />
        }
      >
        <div className="bg-brand-50/60 border border-brand-100 rounded-[12px] p-4 mb-5">
          <div className="text-[10.5px] font-semibold uppercase tracking-wider text-brand-700 mb-2">
            Classification to Review
          </div>
          <div className="mb-2">
            <Pill className={CLASSIFICATION_STYLE[exception.classification]}>
              {exception.classification}
            </Pill>
          </div>
          {detail && (
            <p className="text-[13px] italic text-ink-700 leading-relaxed">
              {detail.classificationJustification}
            </p>
          )}
        </div>

        <div className="mb-5">
          <label className="block text-[12.5px] font-semibold text-ink-800 mb-2">Comment</label>
          <div className="relative">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a review comment..."
              rows={4}
              className="w-full resize-none p-3 pr-10 bg-canvas-elevated border border-canvas-border rounded-[8px] text-[13px] text-ink-800 placeholder:text-ink-400 focus:outline-none focus:border-brand-600 focus:ring-4 focus:ring-brand-600/20"
            />
            <button
              type="button"
              className="absolute bottom-2 right-2 w-7 h-7 flex items-center justify-center text-ink-400 hover:text-brand-700 cursor-pointer"
              aria-label="Attach file"
            >
              <Paperclip size={14} />
            </button>
          </div>
        </div>

        {detail && <ActivityTimeline entries={detail.activityLog} />}
      </DrawerShell>
    </>
  );
}

// ─── Review Case Drawer (action review) ───
export function ReviewCaseDrawer({
  exception,
  onClose,
  onDecision,
  onViewBulk,
}: {
  exception: GrcException;
  onClose: () => void;
  onDecision: (decision: 'approve' | 'reject') => void;
  onViewBulk: (bulkId: string) => void;
}) {
  const detail = GRC_CASE_DETAILS[exception.id];
  const bulk = exception.bulkId ? GRC_BULK_ACTIONS[exception.bulkId] : null;
  const [activeTab, setActiveTab] = useState<'Case Details' | 'Activity Log'>('Case Details');
  const [actionStatus, setActionStatus] = useState<GrcActionStatus>(detail?.actionStatus ?? 'Pending');
  const [comment, setComment] = useState('');

  return (
    <>
      <Overlay onClick={onClose} />
      <DrawerShell
        title="Review Case"
        onClose={onClose}
        tabs={['Case Details', 'Activity Log']}
        activeTab={activeTab}
        onTabChange={(t) => setActiveTab(t as typeof activeTab)}
        footer={
          <FooterButtons
            onCancel={onClose}
            onReject={() => onDecision('reject')}
            onApprove={() => onDecision('approve')}
          />
        }
      >
        {activeTab === 'Case Details' ? (
          <>
            {bulk && (
              <div className="bg-brand-50/70 border border-brand-100 rounded-[12px] p-4 mb-5">
                <div className="flex items-center gap-2 text-[13px] font-semibold text-brand-700 mb-2">
                  <LinkIcon size={13} />
                  Part of Bulk Action
                </div>
                <div className="flex items-center gap-3 text-[12.5px] text-ink-700 mb-2">
                  <span>ID: <span className="font-mono font-semibold text-brand-700">{bulk.id}</span></span>
                  <span className="text-ink-300">|</span>
                  <span className="tabular-nums">{bulk.caseIds.length} cases grouped</span>
                </div>
                <button
                  onClick={() => onViewBulk(bulk.id)}
                  className="inline-flex items-center gap-1 text-[12.5px] font-medium text-brand-700 hover:text-brand-600 cursor-pointer"
                >
                  View all cases in this bulk action
                  <ExternalLink size={12} />
                </button>
              </div>
            )}

            <section className="border border-canvas-border rounded-[12px] p-4 mb-4">
              <SectionLabel>Classification</SectionLabel>
              <div className="mb-2">
                <Pill className={CLASSIFICATION_STYLE[exception.classification]}>
                  {exception.classification}
                </Pill>
              </div>
              {detail && (
                <p className="text-[12.5px] text-ink-700 leading-relaxed">
                  {detail.classificationJustification.replace(/^"|"$/g, '')}
                </p>
              )}
            </section>

            {detail && (
              <section className="border border-canvas-border rounded-[12px] p-4 mb-4">
                <SectionLabel>Action Submitted</SectionLabel>
                <h3 className="text-[14px] font-semibold text-ink-900 mb-1.5 leading-snug">
                  <FileText size={14} className="inline mr-1.5 text-ink-500 -mt-0.5" />
                  {detail.actionTitle}
                </h3>
                <div className="inline-flex items-center gap-1.5 text-[12px] text-brand-700 bg-brand-50 rounded-full px-2.5 h-6 mb-2">
                  <Calendar size={11} />
                  {detail.actionDueDate}
                </div>
                <p className="text-[12.5px] text-ink-700 leading-relaxed">{detail.actionDescription}</p>
              </section>
            )}

            <section className="border border-canvas-border rounded-[12px] p-4">
              <SectionLabel>Auditor Decision</SectionLabel>
              <div className="mb-4">
                <label className="block text-[12.5px] font-medium text-ink-800 mb-2">
                  Action Status <span className="text-risk">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Implemented', 'Partially Implemented'] as const).map((status) => {
                    const selected = actionStatus === status;
                    return (
                      <button
                        key={status}
                        onClick={() => setActionStatus(status)}
                        className={`h-10 text-[12.5px] font-medium rounded-[8px] border transition-colors cursor-pointer ${
                          selected
                            ? 'bg-brand-50 border-brand-600 text-brand-700'
                            : 'bg-canvas-elevated border-canvas-border text-ink-700 hover:border-brand-200'
                        }`}
                      >
                        {status}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="block text-[12.5px] font-medium text-ink-800 mb-2">Comment</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a review comment..."
                  rows={4}
                  className="w-full resize-none p-3 bg-canvas-elevated border border-canvas-border rounded-[8px] text-[13px] text-ink-800 placeholder:text-ink-400 focus:outline-none focus:border-brand-600 focus:ring-4 focus:ring-brand-600/20"
                />
              </div>
            </section>
          </>
        ) : (
          detail && <ActivityTimeline entries={detail.activityLog} />
        )}
      </DrawerShell>
    </>
  );
}

// ─── Classify Exception Drawer (Risk Owner) ───
const CLASSIFY_OPTIONS: string[] = [
  'Business as Usual',
  'False Positive',
  'Design Deficiency',
  'System Deficiency',
  'Procedural Non-Compliance',
];

const SEVERITY_TONE: Record<GrcExceptionSeverity, { base: string; active: string }> = {
  High:   { base: 'text-ink-700', active: 'bg-high-50 border-high text-high-700' },
  Medium: { base: 'text-ink-700', active: 'bg-mitigated-50 border-mitigated text-mitigated-700' },
  Low:    { base: 'text-ink-700', active: 'bg-compliant-50 border-compliant text-compliant-700' },
};

export function ClassifyExceptionDrawer({
  exception,
  onClose,
  onSave,
}: {
  exception: GrcException;
  onClose: () => void;
  onSave: (payload: { severity: GrcExceptionSeverity; classification: string; comment: string }) => void;
}) {
  const [severity, setSeverity] = useState<GrcExceptionSeverity>(exception.severity);
  const [classification, setClassification] = useState<string>('');
  const [comment, setComment] = useState('');

  const canSave = classification && comment.trim().length > 0;

  return (
    <>
      <Overlay onClick={onClose} />
      <DrawerShell
        title="Classify Exception"
        onClose={onClose}
        footer={
          <>
            <button
              onClick={onClose}
              className="h-10 px-5 text-[13px] font-medium text-ink-700 bg-canvas-elevated border border-canvas-border rounded-[8px] hover:border-brand-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <div className="flex-1" />
            <button
              onClick={() => canSave && onSave({ severity, classification, comment })}
              disabled={!canSave}
              className={`h-10 px-5 text-[13px] font-semibold rounded-[8px] transition-colors ${
                canSave
                  ? 'bg-brand-600 text-white hover:bg-brand-500 cursor-pointer'
                  : 'bg-brand-600/50 text-white/80 cursor-not-allowed'
              }`}
            >
              Save Classification
            </button>
          </>
        }
      >
        <div className="mb-5">
          <label className="block text-[12.5px] font-semibold text-ink-800 mb-2">Severity</label>
          <div className="grid grid-cols-3 gap-2">
            {(['High', 'Medium', 'Low'] as const).map((s) => {
              const selected = severity === s;
              const tone = SEVERITY_TONE[s];
              return (
                <button
                  key={s}
                  onClick={() => setSeverity(s)}
                  className={`h-10 text-[13px] font-medium rounded-[8px] border transition-colors cursor-pointer ${
                    selected ? tone.active : `bg-canvas-elevated border-canvas-border ${tone.base} hover:border-brand-200`
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mb-5">
          <label className="block text-[12.5px] font-semibold text-ink-800 mb-2">
            Classification <span className="text-risk">*</span>
          </label>
          <select
            value={classification}
            onChange={(e) => setClassification(e.target.value)}
            className="w-full h-10 px-3 bg-canvas-elevated border border-canvas-border rounded-[8px] text-[13px] text-ink-800 focus:outline-none focus:border-brand-600 focus:ring-4 focus:ring-brand-600/20 cursor-pointer"
          >
            <option value="">Select classification...</option>
            {CLASSIFY_OPTIONS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="mb-5">
          <label className="block text-[12.5px] font-semibold text-ink-800 mb-2">
            Comment <span className="text-risk">*</span>
          </label>
          <div className="relative">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Explain your classification rationale..."
              rows={5}
              className="w-full resize-none p-3 pr-10 bg-canvas-elevated border border-canvas-border rounded-[8px] text-[13px] text-ink-800 placeholder:text-ink-400 focus:outline-none focus:border-brand-600 focus:ring-4 focus:ring-brand-600/20"
            />
            <button
              type="button"
              className="absolute bottom-2 right-2 w-7 h-7 flex items-center justify-center text-ink-400 hover:text-brand-700 cursor-pointer"
              aria-label="Attach file"
            >
              <Paperclip size={14} />
            </button>
          </div>
        </div>

        <section className="border border-canvas-border rounded-[12px] p-4">
          <SectionLabel>Activity Log</SectionLabel>
          <div className="flex gap-3">
            <div className="shrink-0 w-7 h-7 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center">
              <User size={13} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3 mb-0.5">
                <div className="text-[12.5px] text-ink-800">
                  <span className="font-semibold">Ira</span>{' '}
                  <span className="text-ink-500">(AI)</span>
                </div>
                <span className="text-[11px] text-ink-500 tabular-nums whitespace-nowrap">18 Apr 2026, 18:00</span>
              </div>
              <p className="text-[12.5px] text-ink-700 leading-snug">
                Exception flagged by Ira (AI) with <span className="font-semibold text-brand-700 tabular-nums">94%</span> confidence
              </p>
            </div>
          </div>
        </section>
      </DrawerShell>
    </>
  );
}

// ─── Bulk Action Group Modal ───
export function BulkActionGroupModal({
  bulkId,
  onClose,
  onAcceptAll,
  onRejectAll,
}: {
  bulkId: string;
  onClose: () => void;
  onAcceptAll: () => void;
  onRejectAll: () => void;
}) {
  const bulk = GRC_BULK_ACTIONS[bulkId];
  const cases = useMemo(
    () => (bulk ? bulk.caseIds.map(id => GRC_EXCEPTIONS.find(e => e.id === id)).filter(Boolean) as GrcException[] : []),
    [bulk],
  );

  const underReviewCount = cases.filter(c => {
    const d = GRC_CASE_DETAILS[c.id];
    return d?.actionStatus === 'Partially Implemented' || d?.actionStatus === 'Implemented';
  }).length;

  if (!bulk) return null;

  return (
    <>
      <Overlay onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 8 }}
        transition={{ duration: 0.18, ease: [0.2, 0, 0, 1] }}
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] max-w-[92vw] bg-canvas-elevated rounded-[16px] shadow-xl border border-canvas-border z-[60] flex flex-col max-h-[82vh]"
        role="dialog"
        aria-label="Bulk Action Group"
      >
        <header className="shrink-0 px-6 py-5 flex items-start justify-between gap-4 border-b border-canvas-border">
          <div>
            <h2 className="font-display text-[20px] font-semibold text-ink-900 tracking-tight">Bulk Action Group</h2>
            <p className="text-[12.5px] text-ink-500 mt-0.5 font-mono tabular-nums">
              ID: {bulk.id} · {cases.length} cases
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full text-ink-500 hover:text-ink-800 hover:bg-[#F4F2F7] flex items-center justify-center cursor-pointer"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="border border-canvas-border rounded-[12px] overflow-hidden">
            <table className="w-full text-[12.5px]">
              <thead>
                <tr className="bg-[#FAFAFB] border-b border-canvas-border text-left text-ink-500 uppercase tracking-wider">
                  <th className="px-4 py-3 font-medium text-[10.5px]">Exception ID</th>
                  <th className="px-4 py-3 font-medium text-[10.5px]">Classification</th>
                  <th className="px-4 py-3 font-medium text-[10.5px]">Classification Review Status</th>
                  <th className="px-4 py-3 font-medium text-[10.5px]">Action Review Status</th>
                </tr>
              </thead>
              <tbody>
                {cases.map((c) => {
                  const d = GRC_CASE_DETAILS[c.id];
                  const actionStatus = d?.actionStatus ?? 'Pending';
                  return (
                    <tr key={c.id} className="border-b border-canvas-border last:border-b-0">
                      <td className="px-4 py-3 align-middle">
                        <span className="font-mono font-medium text-brand-700 text-[12.5px]">{c.id}</span>
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <Pill className={CLASSIFICATION_STYLE[c.classification]}>{c.classification}</Pill>
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <Pill className={REVIEW_STYLE[c.classificationReview]}>{c.classificationReview}</Pill>
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <Pill className={ACTION_STATUS_STYLE[actionStatus]}>
                          {actionStatus}
                        </Pill>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-5 border border-canvas-border rounded-[12px] p-4">
            <div className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-500 mb-3">
              Group Decision <span className="text-ink-400 normal-case tracking-normal">({underReviewCount} under review)</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={onAcceptAll}
                className="h-11 text-[13px] font-medium text-ink-800 bg-canvas-elevated border border-canvas-border rounded-[8px] hover:border-compliant hover:text-compliant-700 transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={15} />
                Accept All
              </button>
              <button
                onClick={onRejectAll}
                className="h-11 text-[13px] font-medium text-ink-800 bg-canvas-elevated border border-canvas-border rounded-[8px] hover:border-risk hover:text-risk-700 transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <XCircle size={15} />
                Reject All
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
