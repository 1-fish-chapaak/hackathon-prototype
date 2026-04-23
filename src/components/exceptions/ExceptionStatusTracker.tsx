import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronRight, ShieldCheck, X } from 'lucide-react';
import {
  GRC_EXCEPTIONS,
  ACTION_HUB_TIMELINE,
  type GrcException,
  type GrcExceptionStatus,
  type GrcExceptionClassification,
  type GrcExceptionSeverity,
  type ActionHubEvent,
} from '../../data/mockData';

const STATUS_STYLE: Record<GrcExceptionStatus, string> = {
  Open:           'bg-[#EEEEF1] text-ink-600',
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

const SEVERITY_STYLE: Record<GrcExceptionSeverity, string> = {
  High:   'bg-high-50 text-high-700',
  Medium: 'bg-mitigated-50 text-mitigated-700',
  Low:    'bg-compliant-50 text-compliant-700',
};

function Pill({ children, className }: { children: React.ReactNode; className: string }) {
  return (
    <span className={`inline-flex items-center h-6 px-2.5 text-[11px] font-medium rounded-full whitespace-nowrap ${className}`}>
      {children}
    </span>
  );
}

interface Group {
  key: string;
  kind: 'bulk' | 'individual';
  label: React.ReactNode;
  exceptions: GrcException[];
}

function groupExceptions(exceptions: GrcException[]): Group[] {
  const groups: Group[] = [];
  const byBulk = new Map<string, GrcException[]>();
  const individuals: GrcException[] = [];

  exceptions.forEach(ex => {
    if (ex.bulkId) {
      const arr = byBulk.get(ex.bulkId) ?? [];
      arr.push(ex);
      byBulk.set(ex.bulkId, arr);
    } else {
      individuals.push(ex);
    }
  });

  byBulk.forEach((arr, bulkId) => {
    if (arr.length >= 2) {
      groups.push({
        key: bulkId,
        kind: 'bulk',
        label: (
          <span className="inline-flex items-center h-6 px-2.5 text-[12px] font-mono font-semibold bg-brand-50 text-brand-700 rounded-full">
            {bulkId}
          </span>
        ),
        exceptions: arr,
      });
    } else {
      individuals.push(...arr);
    }
  });

  if (individuals.length) {
    groups.push({
      key: 'individual',
      kind: 'individual',
      label: <span className="text-[13px] font-semibold text-ink-900">Individual Actions</span>,
      exceptions: individuals,
    });
  }

  return groups;
}

function lastActionFor(id: string, timeline: ActionHubEvent[]): { message: string; date: string } | null {
  const hit = timeline.find(ev => ev.exceptionId === id);
  return hit ? { message: hit.message, date: hit.date.replace(/ 2026$/, ' 26') } : null;
}

function statusPills(exceptions: GrcException[]) {
  const counts: Partial<Record<GrcExceptionStatus, number>> = {};
  exceptions.forEach(e => { counts[e.status] = (counts[e.status] ?? 0) + 1; });
  const order: GrcExceptionStatus[] = ['Open', 'Under Review', 'Closed'];
  return order
    .filter(s => counts[s])
    .map(s => <Pill key={s} className={STATUS_STYLE[s]}>{counts[s]} {s}</Pill>);
}

function idChipRow(ids: string[], max = 4) {
  const visible = ids.slice(0, max);
  const rest = ids.length - visible.length;
  return (
    <div className="flex items-center gap-1.5">
      {visible.map(id => (
        <span key={id} className="inline-flex items-center h-5 px-1.5 text-[10.5px] font-mono bg-[#F4F2F7] text-ink-500 rounded">
          #{id.replace('EX-2024-', '')}
        </span>
      ))}
      {rest > 0 && (
        <span className="text-[10.5px] font-medium text-ink-500 tabular-nums">+{rest}</span>
      )}
    </div>
  );
}

function AvatarChip({ name, initials }: { name: string; initials: string }) {
  return (
    <div className="inline-flex items-center gap-2">
      <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-[10px] font-semibold tracking-wider">
        {initials}
      </span>
      <span className="text-[12.5px] text-ink-800">{name}</span>
    </div>
  );
}

function truncate(text: string, n = 40) {
  return text.length > n ? text.slice(0, n).trimEnd() + '…' : text;
}

export default function ExceptionStatusTracker({
  exceptions = GRC_EXCEPTIONS,
}: { exceptions?: GrcException[] }) {
  const groups = useMemo(() => groupExceptions(exceptions), [exceptions]);

  const [sectionOpen, setSectionOpen] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [preview, setPreview] = useState<GrcException | null>(null);

  const toggle = (key: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  return (
    <>
      <section className="bg-canvas-elevated border border-canvas-border rounded-[12px] overflow-hidden mb-4">
        <button
          onClick={() => setSectionOpen(o => !o)}
          className="w-full flex items-center justify-between gap-3 px-5 py-4 cursor-pointer text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[8px] bg-[#F4F2F7] text-ink-600 flex items-center justify-center">
              <ShieldCheck size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-[14px] font-semibold text-ink-900">Exception Status Tracker</h3>
                <span className="inline-flex items-center h-5 px-2 text-[11px] font-medium bg-[#F4F2F7] text-ink-600 rounded-full tabular-nums">
                  {exceptions.length}
                </span>
              </div>
              <p className="text-[12px] text-ink-500 mt-0.5">Exceptions grouped by action ID — click a group to expand</p>
            </div>
          </div>
          <ChevronDown size={16} className={`text-ink-500 transition-transform ${sectionOpen ? '' : '-rotate-90'}`} />
        </button>

        <AnimatePresence initial={false}>
          {sectionOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
              className="overflow-hidden"
            >
              <div className="border-t border-canvas-border divide-y divide-canvas-border">
                {groups.map(group => {
                  const isOpen = expanded.has(group.key);
                  return (
                    <div key={group.key}>
                      <button
                        onClick={() => toggle(group.key)}
                        className="w-full flex items-center gap-3 px-5 py-3 cursor-pointer text-left hover:bg-[#FAFAFB]"
                      >
                        <span className="w-5 h-5 flex items-center justify-center text-ink-500">
                          {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </span>
                        {group.label}
                        <span className="text-[12px] text-ink-500 tabular-nums">{group.exceptions.length} exceptions</span>
                        <div className="flex items-center gap-1.5">{statusPills(group.exceptions)}</div>
                        <div className="flex-1" />
                        {!isOpen && idChipRow(group.exceptions.map(e => e.id))}
                      </button>
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.18, ease: [0.2, 0, 0, 1] }}
                            className="overflow-hidden"
                          >
                            <div className="px-2 pb-3">
                              <table className="w-full text-[12.5px]">
                                <thead>
                                  <tr className="text-left text-ink-500 uppercase tracking-wider">
                                    <th className="px-3 py-2 font-medium text-[10.5px]">Exception ID</th>
                                    <th className="px-3 py-2 font-medium text-[10.5px]">Risk Category</th>
                                    <th className="px-3 py-2 font-medium text-[10.5px]">Classification</th>
                                    <th className="px-3 py-2 font-medium text-[10.5px]">Status</th>
                                    <th className="px-3 py-2 font-medium text-[10.5px]">Assigned To</th>
                                    <th className="px-3 py-2 font-medium text-[10.5px]">Last Action</th>
                                    <th className="px-3 py-2 font-medium text-[10.5px] text-right">Updated</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {group.exceptions.map(ex => {
                                    const last = lastActionFor(ex.id, ACTION_HUB_TIMELINE);
                                    return (
                                      <tr
                                        key={ex.id}
                                        onClick={() => setPreview(ex)}
                                        className="border-t border-canvas-border hover:bg-brand-50/40 cursor-pointer transition-colors"
                                      >
                                        <td className="px-3 py-2.5 align-middle">
                                          <span className="text-brand-700 font-medium font-mono text-[12.5px]">{ex.id}</span>
                                        </td>
                                        <td className="px-3 py-2.5 align-middle text-ink-800">{ex.riskCategory}</td>
                                        <td className="px-3 py-2.5 align-middle">
                                          <Pill className={CLASSIFICATION_STYLE[ex.classification]}>{ex.classification}</Pill>
                                        </td>
                                        <td className="px-3 py-2.5 align-middle">
                                          <Pill className={STATUS_STYLE[ex.status]}>{ex.status}</Pill>
                                        </td>
                                        <td className="px-3 py-2.5 align-middle">
                                          <AvatarChip name={ex.assignedTo.name} initials={ex.assignedTo.initials} />
                                        </td>
                                        <td className="px-3 py-2.5 align-middle text-ink-600 text-[12px]">
                                          {last ? truncate(last.message, 42) : '—'}
                                        </td>
                                        <td className="px-3 py-2.5 align-middle text-right text-ink-500 text-[11.5px] tabular-nums whitespace-nowrap">
                                          {last?.date ?? ex.lastUpdated}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <AnimatePresence>
        {preview && <ExceptionPreviewDrawer exception={preview} onClose={() => setPreview(null)} />}
      </AnimatePresence>
    </>
  );
}

function ExceptionPreviewDrawer({ exception, onClose }: { exception: GrcException; onClose: () => void }) {
  const isBulk = Boolean(exception.bulkId);
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 bg-ink-900/40 backdrop-blur-[2px] z-40"
        onClick={onClose}
      />
      <motion.aside
        initial={{ x: 24, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 24, opacity: 0 }}
        transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
        className="fixed top-0 right-0 bottom-0 w-full max-w-[520px] bg-canvas-elevated shadow-xl border-l border-canvas-border flex flex-col z-50"
        role="dialog"
        aria-label={`Preview ${exception.id}`}
      >
        <header className="shrink-0 px-6 pt-5 pb-4 flex items-start justify-between gap-4 border-b border-canvas-border">
          <div>
            <h2 className="font-display text-[18px] font-semibold text-ink-900 tracking-tight font-mono">{exception.id}</h2>
            <p className="text-[12.5px] text-ink-500 mt-0.5 leading-snug">{exception.title}</p>
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
          <div className="border border-canvas-border rounded-[12px] p-4">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <Pill className="bg-brand-50 text-brand-700 font-mono">{exception.id}</Pill>
                {isBulk && <Pill className="bg-brand-50 text-brand-700">Bulk</Pill>}
              </div>
              <Pill className={SEVERITY_STYLE[exception.severity]}>{exception.severity}</Pill>
            </div>
            <h3 className="text-[14px] font-semibold text-ink-900 leading-snug mb-3">{exception.title}</h3>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Pill className={STATUS_STYLE[exception.status]}>{exception.status}</Pill>
                <Pill className={CLASSIFICATION_STYLE[exception.classification]}>{exception.classification}</Pill>
              </div>
              <span className="text-[12.5px] text-ink-700">{exception.assignedTo.name}</span>
            </div>
          </div>
        </div>
        <footer className="shrink-0 px-6 py-3 border-t border-canvas-border text-right text-[11.5px] text-ink-500">
          1 exception shown
        </footer>
      </motion.aside>
    </>
  );
}
