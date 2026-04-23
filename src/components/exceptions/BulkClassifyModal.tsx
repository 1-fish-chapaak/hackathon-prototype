import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { X, Tag, ChevronDown, Calendar, Link as LinkIcon, Paperclip, User, ChevronDown as CaretDown } from 'lucide-react';
import {
  ACTION_HUB_TIMELINE,
  type GrcException,
  type GrcExceptionClassification,
  type ActionHubEvent,
  type ActionHubActorRole,
} from '../../data/mockData';

const ROLE_AVATAR: Record<ActionHubActorRole, { initials: string; bg: string; fg: string }> = {
  'Risk Owner': { initials: 'RO', bg: 'bg-brand-100',    fg: 'text-brand-700' },
  'Auditor':    { initials: 'AU', bg: 'bg-[#EDE4FA]',   fg: 'text-brand-700' },
  'Ira (AI)':   { initials: 'AI', bg: 'bg-compliant-50', fg: 'text-compliant-700' },
  'System':     { initials: 'SY', bg: 'bg-[#EEEEF1]',   fg: 'text-ink-600' },
};

const CLASSIFICATION_OPTIONS: GrcExceptionClassification[] = [
  'Design Deficiency',
  'System Deficiency',
  'Procedural Non-Compliance',
  'Business as Usual',
  'False Positive',
];

const ACTIONABLE_CLASSIFICATIONS: GrcExceptionClassification[] = [
  'Design Deficiency',
  'System Deficiency',
  'Procedural Non-Compliance',
];

const CLASSIFICATION_PILL: Record<GrcExceptionClassification, string> = {
  Unclassified:                'bg-[#F4F2F7] text-ink-600',
  'Design Deficiency':         'bg-high-50 text-high-700',
  'System Deficiency':         'bg-risk-50 text-risk-700',
  'Procedural Non-Compliance': 'bg-brand-50 text-brand-700',
  'Business as Usual':         'bg-compliant-50 text-compliant-700',
  'False Positive':            'bg-[#EEEEF1] text-ink-600',
};

export interface BulkClassifyPayload {
  actionableId: string;
  classification: GrcExceptionClassification;
  caseIds: string[];
  actionName?: string;
  actionTaken?: string;
  dueDate?: string;
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-[12.5px] font-medium text-ink-800 mb-1.5">
      {children}
      {required && <span className="text-risk ml-0.5">*</span>}
    </label>
  );
}

export default function BulkClassifyModal({
  selectedCases,
  actionableId,
  onClose,
  onApply,
}: {
  selectedCases: GrcException[];
  actionableId: string;
  onClose: () => void;
  onApply: (payload: BulkClassifyPayload) => void;
}) {
  const [classification, setClassification] = useState<GrcExceptionClassification | ''>('');
  const [actionName, setActionName] = useState('');
  const [actionTaken, setActionTaken] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [comment, setComment] = useState('');
  const [showAllActivity, setShowAllActivity] = useState(false);

  const selectedIds = useMemo(() => new Set(selectedCases.map(c => c.id)), [selectedCases]);
  const activity = useMemo<ActionHubEvent[]>(
    () => ACTION_HUB_TIMELINE.filter(ev => selectedIds.has(ev.exceptionId)),
    [selectedIds],
  );
  const visibleActivity = showAllActivity ? activity : activity.slice(0, 3);

  const requiresActionPlan = classification !== '' && ACTIONABLE_CLASSIFICATIONS.includes(classification);

  const canApply = useMemo(() => {
    if (!classification) return false;
    if (requiresActionPlan) {
      if (!actionName.trim() || !actionTaken.trim() || !dueDate) return false;
    }
    return true;
  }, [classification, requiresActionPlan, actionName, actionTaken, dueDate]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 bg-ink-900/40 backdrop-blur-[2px] z-50"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 8 }}
        transition={{ duration: 0.18, ease: [0.2, 0, 0, 1] }}
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[640px] max-w-[94vw] max-h-[92vh] bg-canvas-elevated rounded-[16px] shadow-xl border border-canvas-border z-[60] flex flex-col"
        role="dialog"
        aria-label="Bulk Classify"
      >
        {/* Header */}
        <header className="shrink-0 px-6 py-5 flex items-start justify-between gap-4 border-b border-canvas-border">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-[10px] bg-brand-50 text-brand-700 flex items-center justify-center shrink-0">
              <Tag size={18} />
            </div>
            <div>
              <h2 className="text-[17px] font-semibold text-ink-900 leading-tight">Bulk Classify</h2>
              <p className="text-[12.5px] text-ink-500 mt-1 leading-snug">
                Apply the same classification and action plan to{' '}
                <span className="font-semibold text-ink-800 tabular-nums">{selectedCases.length}</span>{' '}
                selected case{selectedCases.length === 1 ? '' : 's'}.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full text-ink-500 hover:text-ink-800 hover:bg-[#F4F2F7] flex items-center justify-center cursor-pointer shrink-0"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </header>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Actionable ID + Selected cases pill row */}
          <section className="bg-brand-50/60 border border-brand-100 rounded-[12px] p-4">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2 text-[12.5px] text-ink-700">
                <LinkIcon size={13} className="text-brand-700" />
                <span>Actionable ID</span>
              </div>
              <span className="font-mono text-[13px] font-semibold text-brand-700">{actionableId}</span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {selectedCases.map(c => (
                <span
                  key={c.id}
                  className="inline-flex items-center h-6 px-2 text-[11px] font-mono font-medium bg-canvas-elevated border border-canvas-border text-ink-700 rounded-full"
                >
                  {c.id}
                </span>
              ))}
            </div>
          </section>

          {/* Classification */}
          <div>
            <FieldLabel required>Select Classification</FieldLabel>
            <div className="relative">
              <select
                value={classification}
                onChange={(e) => setClassification(e.target.value as GrcExceptionClassification | '')}
                className="w-full h-10 pl-3 pr-9 bg-canvas-elevated border border-canvas-border rounded-[8px] text-[13px] text-ink-800 appearance-none focus:outline-none focus:border-brand-600 focus:ring-4 focus:ring-brand-600/20 cursor-pointer"
              >
                <option value="">Select classification…</option>
                {CLASSIFICATION_OPTIONS.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none" />
            </div>
            {classification && (
              <div className="mt-2">
                <span className={`inline-flex items-center h-6 px-2.5 text-[11px] font-medium rounded-full ${CLASSIFICATION_PILL[classification]}`}>
                  {classification}
                </span>
                {!requiresActionPlan && (
                  <span className="ml-2 text-[11.5px] text-ink-500">No action plan required.</span>
                )}
              </div>
            )}
          </div>

          {/* Conditional action-plan fields */}
          {requiresActionPlan && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
              className="space-y-4 border-t border-canvas-border pt-5"
            >
              <div>
                <FieldLabel required>Action Name</FieldLabel>
                <input
                  value={actionName}
                  onChange={(e) => setActionName(e.target.value)}
                  placeholder="e.g. MFA enforcement for executive accounts"
                  className="w-full h-10 px-3 bg-canvas-elevated border border-canvas-border rounded-[8px] text-[13px] text-ink-800 placeholder:text-ink-400 focus:outline-none focus:border-brand-600 focus:ring-4 focus:ring-brand-600/20"
                />
              </div>

              <div>
                <FieldLabel required>Action Taken</FieldLabel>
                <textarea
                  value={actionTaken}
                  onChange={(e) => setActionTaken(e.target.value)}
                  rows={4}
                  placeholder="Describe the remediation steps, evidence, and rollout plan…"
                  className="w-full resize-none p-3 bg-canvas-elevated border border-canvas-border rounded-[8px] text-[13px] text-ink-800 placeholder:text-ink-400 focus:outline-none focus:border-brand-600 focus:ring-4 focus:ring-brand-600/20"
                />
              </div>

              <div>
                <FieldLabel required>Due Date</FieldLabel>
                <div className="relative w-[220px]">
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full h-10 pl-3 pr-9 bg-canvas-elevated border border-canvas-border rounded-[8px] text-[13px] text-ink-800 focus:outline-none focus:border-brand-600 focus:ring-4 focus:ring-brand-600/20"
                  />
                  <Calendar size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none" />
                </div>
              </div>
            </motion.div>
          )}

          {/* Comment box with attachment */}
          <div>
            <FieldLabel>Comment</FieldLabel>
            <div className="relative">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment for this bulk classification..."
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

          {/* Activity Log */}
          <section className="border border-canvas-border rounded-[12px] p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-500">
                Activity Log
              </div>
              <span className="text-[11px] text-ink-500 tabular-nums">
                {activity.length} event{activity.length === 1 ? '' : 's'} across {selectedCases.length} case{selectedCases.length === 1 ? '' : 's'}
              </span>
            </div>
            {activity.length === 0 ? (
              <p className="text-[12.5px] text-ink-500">No prior activity for the selected cases.</p>
            ) : (
              <>
                <ol className="space-y-3">
                  {visibleActivity.map(ev => {
                    const avatar = ROLE_AVATAR[ev.role];
                    return (
                      <li key={ev.id} className="flex gap-3">
                        <div className={`shrink-0 w-7 h-7 rounded-full ${avatar.bg} ${avatar.fg} flex items-center justify-center`}>
                          {ev.role === 'Ira (AI)' ? (
                            <span className="text-[9.5px] font-semibold tracking-wider">AI</span>
                          ) : (
                            <User size={13} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3 mb-0.5">
                            <div className="text-[12.5px] text-ink-800">
                              <span className="font-semibold">{ev.actor}</span>{' '}
                              <span className="text-ink-500">[{ev.role}]</span>
                              <span className="ml-2 inline-flex items-center h-4 px-1.5 text-[10px] font-mono font-medium bg-brand-50 text-brand-700 rounded">
                                {ev.exceptionId}
                              </span>
                            </div>
                            <span className="text-[11px] text-ink-500 tabular-nums whitespace-nowrap">{ev.date} · {ev.time}</span>
                          </div>
                          <p className="text-[12.5px] text-ink-700 leading-snug">{ev.message}</p>
                          {ev.comment && (
                            <div className="mt-1.5 px-3 py-2 bg-[#FAFAFB] border border-canvas-border rounded-[8px] text-[12px] text-ink-700 leading-relaxed">
                              {ev.comment}
                            </div>
                          )}
                          {ev.attachment && (
                            <button className="mt-1.5 inline-flex items-center gap-1.5 h-6 px-2 bg-brand-50 text-brand-700 text-[11.5px] font-medium rounded-full hover:bg-brand-100 cursor-pointer">
                              <Paperclip size={11} />
                              {ev.attachment.name}
                            </button>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ol>
                {activity.length > 3 && (
                  <button
                    onClick={() => setShowAllActivity(v => !v)}
                    className="mt-3 inline-flex items-center gap-1 text-[12px] font-medium text-brand-700 hover:text-brand-600 cursor-pointer"
                  >
                    <CaretDown size={12} className={showAllActivity ? 'rotate-180' : ''} />
                    {showAllActivity ? 'Show less' : `Show ${activity.length - 3} more`}
                  </button>
                )}
              </>
            )}
          </section>
        </div>

        {/* Footer */}
        <footer className="shrink-0 px-6 py-4 border-t border-canvas-border flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="h-10 px-5 text-[13px] font-medium text-ink-700 bg-canvas-elevated border border-canvas-border rounded-[8px] hover:border-brand-200 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (!canApply) return;
              onApply({
                actionableId,
                classification: classification as GrcExceptionClassification,
                caseIds: selectedCases.map(c => c.id),
                actionName: requiresActionPlan ? actionName.trim() : undefined,
                actionTaken: requiresActionPlan ? actionTaken.trim() : undefined,
                dueDate: requiresActionPlan ? dueDate : undefined,
              });
            }}
            disabled={!canApply}
            className={`h-10 px-5 text-[13px] font-semibold rounded-[8px] transition-colors ${
              canApply
                ? 'bg-brand-600 text-white hover:bg-brand-500 cursor-pointer'
                : 'bg-brand-600/50 text-white/80 cursor-not-allowed'
            }`}
          >
            Apply to {selectedCases.length} case{selectedCases.length === 1 ? '' : 's'}
          </button>
        </footer>
      </motion.div>
    </>
  );
}
