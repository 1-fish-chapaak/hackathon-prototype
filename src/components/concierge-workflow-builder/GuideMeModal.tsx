import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Briefcase,
  Users,
  Shield,
  Scale,
  Cog,
  BookOpen,
  Wallet,
  ArrowRight,
} from 'lucide-react';

interface Task {
  id: string;
  name: string;
  desc: string;
  basePrompt: string;
}

interface Domain {
  id: string;
  name: string;
  icon: typeof Briefcase;
  color: string;
  tasks: Task[];
}

const DOMAINS: Domain[] = [
  {
    id: 'finance',
    name: 'Finance',
    icon: Wallet,
    color: 'from-violet-500 to-fuchsia-600',
    tasks: [
      {
        id: 'ap-audit',
        name: 'Invoice Verification & AP Audit',
        desc: 'Detect duplicates, vendor-master anomalies, and off-policy GL coding.',
        basePrompt:
          'Audit AP invoices for the period. Flag duplicates (vendor + amount + date), unknown or inactive vendors, and GL codings that violate the expense policy matrix.',
      },
      {
        id: 'tb-recon',
        name: 'Trial Balance Reconciliation',
        desc: 'Tie TB to GL, reconcile cash to bank statements.',
        basePrompt:
          'Reconcile the trial balance against GL posting detail for the period. For cash accounts, reconcile to bank statements. Flag variances above tolerance.',
      },
      {
        id: 'rev-rec',
        name: 'Revenue Recognition',
        desc: 'Validate timing and completeness against ASC 606.',
        basePrompt:
          'Extract revenue entries and validate against ASC 606 criteria — performance obligation, transaction price, allocation, timing. Flag violations.',
      },
    ],
  },
  {
    id: 'procurement',
    name: 'Procurement',
    icon: Briefcase,
    color: 'from-sky-500 to-indigo-600',
    tasks: [
      {
        id: 'three-way-match',
        name: 'Three-Way Match',
        desc: 'Match PO, GRN, and Invoice with tolerance.',
        basePrompt:
          'Match Purchase Orders to Goods Receipt Notes and Vendor Invoices on quantity and amount. Apply 5% tolerance. Flag variances and orphan records.',
      },
      {
        id: 'contract-compliance',
        name: 'Vendor Contract Compliance',
        desc: 'Detect out-of-scope invoice spend vs signed contracts.',
        basePrompt:
          'Tie invoices to POs and POs to signed contracts. For each invoice line, confirm the line is within the active contract scope and cap. Flag anything out of scope.',
      },
    ],
  },
  {
    id: 'hr',
    name: 'HR',
    icon: Users,
    color: 'from-emerald-500 to-teal-600',
    tasks: [
      {
        id: 'payroll-integrity',
        name: 'Payroll Integrity',
        desc: 'Ghost employees, excessive overtime, duplicate bank accounts.',
        basePrompt:
          'Audit payroll runs for ghost employees (no HR master record), excessive overtime (>150% baseline), and duplicate bank account numbers across employees.',
      },
      {
        id: 'expense-compliance',
        name: 'T&E Expense Compliance',
        desc: 'Policy-threshold breaches, split transactions, weekend charges.',
        basePrompt:
          'Review T&E expense claims. Flag claims above policy thresholds without pre-approval, split transactions designed to evade thresholds, and out-of-policy categories (e.g. weekend personal charges).',
      },
    ],
  },
  {
    id: 'risk',
    name: 'Risk',
    icon: Shield,
    color: 'from-rose-500 to-pink-600',
    tasks: [
      {
        id: 'sod',
        name: 'Segregation of Duties',
        desc: 'Detect user role conflicts across P2P and R2R.',
        basePrompt:
          'Scan user role assignments against the SOD rule matrix. Flag any user with conflicting role pairs (e.g. Create PO + Approve PO).',
      },
      {
        id: 'vendor-master-changes',
        name: 'Vendor Master Change Monitor',
        desc: 'Flag unauthorized bank-account and address changes.',
        basePrompt:
          'Monitor vendor-master change logs. Flag changes to bank-account, address, or payment-terms fields made by unauthorized users.',
      },
    ],
  },
  {
    id: 'compliance',
    name: 'Compliance',
    icon: Scale,
    color: 'from-amber-500 to-orange-600',
    tasks: [
      {
        id: 'sox',
        name: 'SOX Control Testing',
        desc: 'Sample-based testing of in-scope SOX controls.',
        basePrompt:
          'Pick a statistically valid sample per SOX control, test each, and produce pass/fail with evidence references.',
      },
    ],
  },
  {
    id: 'it',
    name: 'IT / Operations',
    icon: Cog,
    color: 'from-slate-500 to-zinc-600',
    tasks: [
      {
        id: 'access-review',
        name: 'Privileged Access Review',
        desc: 'Quarterly review of privileged-account assignments.',
        basePrompt:
          'Review privileged-account assignments against the approved matrix. Flag accounts with privileges no longer justified by role.',
      },
    ],
  },
  {
    id: 'legal',
    name: 'Legal / General',
    icon: BookOpen,
    color: 'from-fuchsia-500 to-purple-600',
    tasks: [
      {
        id: 'contract-repo',
        name: 'Contract Repository Integrity',
        desc: 'Missing signatures, expired terms, orphan amendments.',
        basePrompt:
          'Scan the contract repository for missing signatures, expired end-dates, and amendments without a parent contract.',
      },
    ],
  },
];

interface Props {
  open: boolean;
  onClose: () => void;
  onPick: (prompt: string, taskName: string) => void;
}

export default function GuideMeModal({ open, onClose, onPick }: Props) {
  const [domainId, setDomainId] = useState<string>(DOMAINS[0].id);
  const domain = DOMAINS.find((d) => d.id === domainId) ?? DOMAINS[0];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-ink-900/40 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-[880px] max-h-[82vh] rounded-2xl bg-canvas-elevated border border-canvas-border shadow-2xl flex flex-col overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-canvas-border">
                <div>
                  <h2 className="text-[16px] font-semibold text-ink-800 tracking-tight">
                    Guide me — pick an audit task
                  </h2>
                  <p className="text-[12px] text-ink-500 leading-relaxed">
                    Choose a domain, then a task. The prompt will be pre-filled.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg text-ink-500 hover:bg-canvas flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex-1 overflow-hidden grid grid-cols-[220px_1fr]">
                <nav className="border-r border-canvas-border overflow-y-auto p-2 bg-canvas">
                  {DOMAINS.map((d) => {
                    const Icon = d.icon;
                    const active = d.id === domainId;
                    return (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => setDomainId(d.id)}
                        className={[
                          'w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[12.5px] font-semibold transition-colors cursor-pointer',
                          active
                            ? 'bg-brand-50 text-brand-700'
                            : 'text-ink-600 hover:bg-canvas-elevated',
                        ].join(' ')}
                      >
                        <span
                          className={`w-7 h-7 rounded-lg bg-gradient-to-br ${d.color} flex items-center justify-center shrink-0`}
                        >
                          <Icon size={13} className="text-white" />
                        </span>
                        {d.name}
                        <span className="ml-auto text-[10px] text-ink-400 font-normal">
                          {d.tasks.length}
                        </span>
                      </button>
                    );
                  })}
                </nav>

                <div className="overflow-y-auto p-4">
                  <ul className="flex flex-col gap-2">
                    {domain.tasks.map((t) => (
                      <li key={t.id}>
                        <button
                          type="button"
                          onClick={() => {
                            onPick(t.basePrompt, t.name);
                            onClose();
                          }}
                          className="w-full text-left group rounded-xl border border-canvas-border bg-canvas-elevated hover:border-brand-300 hover:bg-brand-50/40 transition-colors p-3.5 cursor-pointer"
                        >
                          <div className="flex items-center justify-between gap-3 mb-1">
                            <span className="text-[13px] font-semibold text-ink-800">
                              {t.name}
                            </span>
                            <ArrowRight
                              size={14}
                              className="text-ink-400 group-hover:text-brand-600 transition-colors"
                            />
                          </div>
                          <p className="text-[12px] text-ink-500 leading-relaxed mb-2">
                            {t.desc}
                          </p>
                          <p className="text-[11px] text-ink-600 italic leading-relaxed line-clamp-2">
                            “{t.basePrompt}”
                          </p>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
