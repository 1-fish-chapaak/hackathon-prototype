import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  ChevronLeft,
  Search,
  ClipboardList,
  Sparkles,
  Users,
  Shield,
  Wallet,
  FileText,
  RefreshCw,
  LayoutGrid,
  Lock,
  GraduationCap,
  type LucideIcon,
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
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  tasks: Task[];
}

const DOMAINS: Domain[] = [
  {
    id: 'finance',
    name: 'Finance & Accounting',
    icon: Wallet,
    iconColor: 'text-violet-600',
    iconBg: 'bg-violet-50',
    tasks: [
      {
        id: 'f1',
        name: 'Invoice Verification & AP Audit',
        desc: 'Catch duplicates, fictitious vendors, and coding errors',
        basePrompt:
          'Validate AP invoices against purchase orders and GL trial balance to detect duplicates and unapproved vendors',
      },
      {
        id: 'f2',
        name: 'T&E Expense Compliance',
        desc: 'Flag policy violations and duplicate expense claims',
        basePrompt:
          'Audit employee travel and expense reports for policy violations, duplicate submissions, and unusual spending patterns',
      },
      {
        id: 'f3',
        name: 'Payroll Integrity Audit',
        desc: 'Detect ghost employees and salary anomalies',
        basePrompt:
          'Cross-validate payroll disbursements against HR master records to detect ghost employees and salary anomalies',
      },
      {
        id: 'f4',
        name: 'GL Reconciliation',
        desc: 'Reconcile ledger entries with bank statements',
        basePrompt:
          'Reconcile general ledger entries with bank statements to flag unrecorded or misposted transactions',
      },
    ],
  },
  {
    id: 'hr',
    name: 'Human Resources',
    icon: Users,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-50',
    tasks: [
      {
        id: 'h1',
        name: 'Ghost Employee Detection',
        desc: 'Identify payroll entries with no active headcount match',
        basePrompt:
          'Detect ghost employees in payroll by cross-checking active headcount against biometric or access records',
      },
      {
        id: 'h2',
        name: 'Leave Abuse Audit',
        desc: 'Flag suspicious leave patterns and unverified claims',
        basePrompt:
          'Audit employee leave records for abuse patterns including Monday/Friday clustering and unverified medical certificates',
      },
      {
        id: 'h3',
        name: 'Hiring Compliance Check',
        desc: 'Validate hires against approved headcount and policy',
        basePrompt:
          'Verify hiring records against approved headcount limits and recruitment policy compliance requirements',
      },
    ],
  },
  {
    id: 'risk',
    name: 'Risk & Compliance',
    icon: Shield,
    iconColor: 'text-rose-600',
    iconBg: 'bg-rose-50',
    tasks: [
      {
        id: 'r1',
        name: 'SoD Breach Detector',
        desc: 'Find segregation of duties conflicts in access rights',
        basePrompt:
          'Detect segregation of duties breaches in user access rights and transaction approval workflows',
      },
      {
        id: 'r2',
        name: 'RACM Gap Analysis',
        desc: 'Identify control gaps against regulatory requirements',
        basePrompt:
          'Analyze risk and control matrix for control gaps and missing coverage against regulatory requirements',
      },
      {
        id: 'r3',
        name: 'AML Transaction Monitor',
        desc: 'Screen transactions for anti-money laundering red flags',
        basePrompt:
          'Screen financial transactions for anti-money laundering red flags including structuring and high-risk counterparties',
      },
    ],
  },
  {
    id: 'operations',
    name: 'Operations',
    icon: RefreshCw,
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-50',
    tasks: [
      {
        id: 'o1',
        name: 'Inventory Discrepancy Audit',
        desc: 'Reconcile physical stock against system records',
        basePrompt:
          'Reconcile physical inventory counts against system records and flag variances above defined thresholds',
      },
      {
        id: 'o2',
        name: 'Vendor Contract Compliance',
        desc: 'Detect overbilling and SLA breaches against contracts',
        basePrompt:
          'Review vendor invoices and delivery records against contract terms to detect overbilling and SLA violations',
      },
      {
        id: 'o3',
        name: 'Procurement PO Audit',
        desc: 'Validate purchase orders against budgets and policy',
        basePrompt:
          'Audit purchase orders against approved budgets and procurement policy for compliance and approval authority',
      },
    ],
  },
  {
    id: 'it',
    name: 'IT & Security',
    icon: Lock,
    iconColor: 'text-indigo-600',
    iconBg: 'bg-indigo-50',
    tasks: [
      {
        id: 'i1',
        name: 'User Access Review',
        desc: 'Flag terminated users and excess access rights',
        basePrompt:
          'Review active user accounts against HR data to identify excess permissions, dormant accounts, and terminated user access',
      },
      {
        id: 'i2',
        name: 'Privileged Access Audit',
        desc: 'Check admin accounts against least-privilege policy',
        basePrompt:
          'Audit privileged and admin accounts for compliance with least-privilege access policy and detect anomalous activity',
      },
    ],
  },
  {
    id: 'legal',
    name: 'Legal',
    icon: FileText,
    iconColor: 'text-teal-600',
    iconBg: 'bg-teal-50',
    tasks: [
      {
        id: 'l1',
        name: 'Contract Expiry Monitor',
        desc: 'Alert on contracts approaching renewal with no action',
        basePrompt:
          'Monitor contracts for upcoming expiry dates and flag those approaching renewal deadlines without confirmed action',
      },
      {
        id: 'l2',
        name: 'Clause Compliance Check',
        desc: 'Validate contracts against standard clause library',
        basePrompt:
          'Check vendor contracts against the standard clause library to identify missing or non-compliant provisions',
      },
    ],
  },
  {
    id: 'training',
    name: 'Training',
    icon: GraduationCap,
    iconColor: 'text-green-600',
    iconBg: 'bg-green-50',
    tasks: [
      {
        id: 'tr1',
        name: 'Training Completion Audit',
        desc: 'Verify mandatory training rates meet regulatory requirements',
        basePrompt:
          'Audit mandatory training completion rates by department against regulatory and policy requirements',
      },
      {
        id: 'tr2',
        name: 'Certification Validity Check',
        desc: 'Flag expired or expiring employee certifications',
        basePrompt:
          'Validate employee certifications for currency and flag those expiring or already lapsed by role requirement',
      },
    ],
  },
  {
    id: 'general',
    name: 'General',
    icon: LayoutGrid,
    iconColor: 'text-slate-600',
    iconBg: 'bg-slate-50',
    tasks: [
      {
        id: 'g1',
        name: 'Data Quality Audit',
        desc: 'Profile datasets for completeness and accuracy issues',
        basePrompt:
          'Audit a dataset for data quality issues including completeness gaps, inaccuracies, and consistency violations',
      },
      {
        id: 'g2',
        name: 'Exception Report Builder',
        desc: 'Build configurable anomaly reports from any dataset',
        basePrompt:
          'Build an exception report from a dataset using threshold-based anomaly detection to surface outliers and breaches',
      },
    ],
  },
];

interface Question {
  id: string;
  text: string;
  options: string[];
}

const QUESTIONS: Record<string, Question[]> = {
  f1: [
    { id: 'freq', text: 'How often do you run this audit?', options: ['Monthly', 'Quarterly', 'Ad-hoc'] },
    { id: 'concern', text: 'Primary detection goal?', options: ['Duplicate invoices', 'Fictitious vendors', 'Coding errors'] },
    { id: 'threshold', text: 'Flag threshold?', options: ['Any mismatch', '> $10,000', '> $100,000'] },
  ],
  f2: [
    { id: 'freq', text: 'Audit frequency?', options: ['Monthly', 'Quarterly', 'Per trip cycle'] },
    { id: 'concern', text: 'Primary concern?', options: ['Policy violations', 'Duplicate claims', 'Unusual patterns'] },
    { id: 'escalation', text: 'Escalation threshold?', options: ['Any violation', '> $5,000', 'Manager approval required'] },
  ],
  f3: [
    { id: 'period', text: 'Payroll period to audit?', options: ['Current month', 'Last quarter', 'Full year'] },
    { id: 'concern', text: 'Anomaly most concerned about?', options: ['Ghost employees', 'Salary overrides', 'Duplicate bank accounts'] },
    { id: 'source', text: 'Comparison source?', options: ['HR master only', 'Biometric only', 'Both'] },
  ],
  f4: [
    { id: 'period', text: 'Period to reconcile?', options: ['Monthly close', 'Quarterly', 'Year-end'] },
    { id: 'tolerance', text: 'Acceptable mismatch tolerance?', options: ['Zero tolerance', '< 0.1%', '< 1%'] },
    { id: 'output', text: 'Output format?', options: ['Exception list only', 'Full reconciliation', 'Summary dashboard'] },
  ],
  h1: [
    { id: 'source', text: 'Comparison source available?', options: ['Biometric records', 'Access card logs', 'Both'] },
    { id: 'period', text: 'Payroll period?', options: ['Current month', 'Last 3 months', 'Last 6 months'] },
    { id: 'threshold', text: 'Flag if absent from source for?', options: ['1 month', '3 months', '6+ months'] },
  ],
  h2: [
    { id: 'type', text: 'Leave type to focus on?', options: ['Sick leave', 'Casual leave', 'All types'] },
    { id: 'pattern', text: 'Pattern most concerning?', options: ['Mon/Fri clustering', 'Excessive frequency', 'Unverified medical'] },
    { id: 'scope', text: 'Department scope?', options: ['All departments', 'High-risk roles only', 'Specific team'] },
  ],
  h3: [
    { id: 'trigger', text: 'Audit trigger?', options: ['Post-hiring review', 'Annual check', 'Pre-audit'] },
    { id: 'focus', text: 'Most important to verify?', options: ['Headcount approval', 'Background checks', 'Document completeness'] },
    { id: 'volume', text: 'Approximate hiring volume?', options: ['< 50 hires', '50–200 hires', '200+ hires'] },
  ],
  r1: [
    { id: 'conflict', text: 'Most sensitive SoD conflict?', options: ['Post & approve', 'Request & approve', 'All conflicts'] },
    { id: 'scope', text: 'User scope?', options: ['All users', 'Finance users', 'Admin users only'] },
    { id: 'erp', text: 'ERP system?', options: ['SAP', 'Oracle', 'Other / Custom'] },
  ],
  r2: [
    { id: 'framework', text: 'Regulatory framework?', options: ['SOX', 'ISO 27001', 'Internal policy'] },
    { id: 'control', text: 'Control type focus?', options: ['Preventive controls', 'Detective controls', 'All controls'] },
    { id: 'severity', text: 'Gap severity to flag?', options: ['Any gap', 'High risk only', 'Critical controls only'] },
  ],
  r3: [
    { id: 'volume', text: 'Transaction volume?', options: ['< 1,000/day', '1K–10K/day', '10,000+/day'] },
    { id: 'flag', text: 'Primary red flag?', options: ['Structuring', 'Rapid movement', 'High-risk countries'] },
    { id: 'output', text: 'Reporting output?', options: ['STR format', 'Internal flag list', 'Both'] },
  ],
  o1: [
    { id: 'trigger', text: 'Audit trigger?', options: ['Monthly count', 'Year-end', 'Post stock movement'] },
    { id: 'threshold', text: 'Variance threshold to flag?', options: ['Any variance', '> 1%', '> 5%'] },
    { id: 'scope', text: 'Location scope?', options: ['Single warehouse', 'Multi-site', 'All locations'] },
  ],
  o2: [
    { id: 'focus', text: 'What are you checking?', options: ['Overbilling', 'SLA breaches', 'Both'] },
    { id: 'volume', text: 'Active vendor contracts?', options: ['< 50', '50–500', '500+'] },
    { id: 'output', text: 'Output needed?', options: ['Exception list', 'Full report', 'Executive summary'] },
  ],
  o3: [
    { id: 'focus', text: 'Policy focus?', options: ['Approval authority', 'Budget compliance', 'Both'] },
    { id: 'volume', text: 'Monthly PO volume?', options: ['< 100', '100–1,000', '1,000+'] },
    { id: 'threshold', text: 'Scrutiny threshold?', options: ['All POs', '> $100K', '> $1M'] },
  ],
  i1: [
    { id: 'scope', text: 'Access scope?', options: ['All systems', 'ERP only', 'Critical apps'] },
    { id: 'concern', text: 'Primary concern?', options: ['Terminated user access', 'Excess rights', 'Dormant accounts'] },
    { id: 'freq', text: 'Review frequency?', options: ['Quarterly', 'Semi-annual', 'Annual'] },
  ],
  i2: [
    { id: 'type', text: 'Privileged account type?', options: ['System admins', 'DB admins', 'All privileged'] },
    { id: 'standard', text: 'Compliance standard?', options: ['SOX', 'ISO 27001', 'Internal policy'] },
    { id: 'alert', text: 'Alert on?', options: ['Any deviation', 'New account additions', 'Role changes'] },
  ],
  l1: [
    { id: 'window', text: 'Alert window before expiry?', options: ['30 days', '60 days', '90 days'] },
    { id: 'type', text: 'Contract type?', options: ['Vendor contracts', 'Customer contracts', 'All contracts'] },
    { id: 'action', text: 'Action to trigger?', options: ['Renewal notification', 'Escalation to owner', 'Both'] },
  ],
  l2: [
    { id: 'library', text: 'Clause library to check against?', options: ['Company standard', 'Regulatory clauses', 'Both'] },
    { id: 'risk', text: 'Risk focus?', options: ['Missing clauses', 'Non-standard terms', 'Both'] },
    { id: 'output', text: 'Output format?', options: ['Gap report', 'Clause-level detail', 'Executive summary'] },
  ],
  tr1: [
    { id: 'regulator', text: 'Regulatory requirement?', options: ['SEC mandated', 'SOX mandated', 'Internal policy'] },
    { id: 'threshold', text: 'Minimum completion target?', options: ['100%', '90%+', '80%+'] },
    { id: 'scope', text: 'Department scope?', options: ['All departments', 'Compliance team', 'Operations only'] },
  ],
  tr2: [
    { id: 'type', text: 'Certification type?', options: ['Professional certs', 'Regulatory certs', 'Both'] },
    { id: 'window', text: 'Alert window before expiry?', options: ['30 days', '60 days', '90 days'] },
    { id: 'scope', text: 'Employee scope?', options: ['All employees', 'Critical roles only', 'New joiners'] },
  ],
  g1: [
    { id: 'dataset', text: 'Dataset type?', options: ['Transactional data', 'Master data', 'Both'] },
    { id: 'concern', text: 'Primary concern?', options: ['Completeness gaps', 'Inaccurate values', 'Consistency issues'] },
    { id: 'volume', text: 'Approximate row count?', options: ['< 10K rows', '10K–1M rows', '1M+ rows'] },
  ],
  g2: [
    { id: 'type', text: 'Anomaly type?', options: ['Threshold breach', 'Statistical outlier', 'Both'] },
    { id: 'format', text: 'Report format?', options: ['Summary only', 'Detailed breakdown', 'Drill-down by category'] },
    { id: 'threshold', text: 'Threshold type?', options: ['Fixed value', 'Percentage variance', 'Custom formula'] },
  ],
};

function buildPrompt(task: Task, questions: Question[], answers: string[]): string {
  const detailLines = questions
    .map((q, i) => {
      const ans = answers[i];
      return ans ? `${q.text.replace(/\?$/, '')} — ${ans}` : null;
    })
    .filter(Boolean);
  const detailSuffix = detailLines.length > 0 ? ` ${detailLines.join('. ')}.` : '';
  return `${task.basePrompt}.${detailSuffix}`;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onInsert: (prompt: string) => void;
}

const STEP_DOMAIN = 0;
const STEP_TASK = 1;
const STEP_DETAILS = 2;
const STEP_LABELS = ['Domain', 'Task', 'Specifics'];
const STEP_PROGRESS = [18, 55, 100];

export default function GuideMeModal({ open, onClose, onInsert }: Props) {
  const [step, setStep] = useState<number>(STEP_DOMAIN);
  const [domain, setDomain] = useState<Domain | null>(null);
  const [task, setTask] = useState<Task | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      setStep(STEP_DOMAIN);
      setDomain(null);
      setTask(null);
      setAnswers([]);
    }
  }, [open]);

  const questions = useMemo(
    () => (task ? (QUESTIONS[task.id] ?? []) : []),
    [task],
  );
  const answeredAll = answers.length >= questions.length && questions.length > 0;
  const generatedPrompt = answeredAll && task ? buildPrompt(task, questions, answers) : null;

  const handleAnswer = (idx: number, value: string) => {
    setAnswers((prev) => {
      const next = prev.slice(0, idx);
      next[idx] = value;
      return next;
    });
  };

  const handleSelectDomain = (d: Domain) => {
    setDomain(d);
    setTask(null);
    setAnswers([]);
    setStep(STEP_TASK);
  };

  const handleSelectTask = (t: Task) => {
    setTask(t);
    setAnswers([]);
    setStep(STEP_DETAILS);
  };

  const handleInsert = () => {
    if (!generatedPrompt) return;
    onInsert(generatedPrompt);
    onClose();
  };

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
            <div className="pointer-events-auto w-full max-w-[560px] h-[620px] rounded-2xl bg-canvas-elevated border border-canvas-border shadow-2xl flex flex-col overflow-hidden">
              {/* Header */}
              <div className="px-6 pt-5 pb-0 shrink-0">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <ClipboardList size={15} className="text-brand-600" />
                    <h2 className="text-[15px] font-semibold text-ink-800 tracking-tight">
                      Guided setup
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-8 h-8 rounded-lg text-ink-500 hover:bg-canvas flex items-center justify-center transition-colors cursor-pointer"
                    aria-label="Close"
                  >
                    <X size={15} />
                  </button>
                </div>

                {/* Stepper */}
                <div className="mt-4 flex items-center gap-0">
                  {STEP_LABELS.map((label, i) => (
                    <div key={label} className="flex items-center">
                      <div
                        className={[
                          'flex items-center gap-1.5',
                          i < step
                            ? 'text-brand-500'
                            : i === step
                              ? 'text-brand-700'
                              : 'text-ink-400',
                        ].join(' ')}
                      >
                        <span
                          className={[
                            'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0',
                            i < step
                              ? 'bg-brand-100 text-brand-600'
                              : i === step
                                ? 'bg-brand-600 text-white'
                                : 'bg-canvas text-ink-400',
                          ].join(' ')}
                        >
                          {i + 1}
                        </span>
                        <span
                          className={[
                            'text-[11px] font-semibold',
                            i === step
                              ? 'text-brand-700'
                              : i < step
                                ? 'text-brand-500'
                                : 'text-ink-400',
                          ].join(' ')}
                        >
                          {label}
                        </span>
                      </div>
                      {i < STEP_LABELS.length - 1 && (
                        <div
                          className={[
                            'mx-2 h-px w-6 shrink-0',
                            i < step ? 'bg-brand-400' : 'bg-canvas-border',
                          ].join(' ')}
                        />
                      )}
                    </div>
                  ))}
                </div>

                {/* Progress bar */}
                <div className="mt-3 h-[2px] bg-canvas rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-600 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${STEP_PROGRESS[step]}%` }}
                  />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-6 py-5">
                {step === STEP_DOMAIN && (
                  <DomainStep onSelect={handleSelectDomain} />
                )}
                {step === STEP_TASK && domain && (
                  <TaskStep
                    domain={domain}
                    onBack={() => setStep(STEP_DOMAIN)}
                    onSelect={handleSelectTask}
                  />
                )}
                {step === STEP_DETAILS && task && (
                  <DetailsStep
                    questions={questions}
                    answers={answers}
                    onAnswer={handleAnswer}
                    onBack={() => setStep(STEP_TASK)}
                    generatedPrompt={generatedPrompt}
                    onCancel={onClose}
                    onInsert={handleInsert}
                  />
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Step components ─────────────────────────────────────────────────────────

function DomainStep({ onSelect }: { onSelect: (d: Domain) => void }) {
  const [search, setSearch] = useState('');
  const filtered = DOMAINS.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[13px] text-ink-500">
        What area does this workflow belong to?
      </p>

      <div className="flex items-center gap-2 border border-canvas-border rounded-lg px-3 h-9 bg-canvas-elevated focus-within:border-brand-400 transition-colors">
        <Search size={13} className="text-ink-400 shrink-0" />
        <input
          type="text"
          placeholder="Search domains…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 text-[13px] bg-transparent outline-none text-ink-700 placeholder:text-ink-400"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch('')}
            className="text-ink-400 hover:text-ink-600 cursor-pointer"
            aria-label="Clear search"
          >
            <X size={12} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {filtered.length > 0 ? (
          filtered.map((d) => {
            const Icon = d.icon;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => onSelect(d)}
                className="group flex flex-col items-start gap-3 p-4 rounded-xl border border-canvas-border bg-canvas-elevated text-left hover:border-brand-400 hover:shadow-sm transition-all duration-150 cursor-pointer"
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${d.iconBg}`}
                >
                  <Icon size={15} className={d.iconColor} strokeWidth={1.75} />
                </div>
                <span className="text-[13px] font-semibold text-ink-800 leading-snug">
                  {d.name}
                </span>
              </button>
            );
          })
        ) : (
          <div className="col-span-2 text-center text-[13px] text-ink-400 py-8">
            No domains match “{search}”
          </div>
        )}
      </div>
    </div>
  );
}

function TaskStep({
  domain,
  onBack,
  onSelect,
}: {
  domain: Domain;
  onBack: () => void;
  onSelect: (t: Task) => void;
}) {
  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1 text-[12px] font-semibold text-brand-600 hover:text-brand-700 mb-4 transition-colors cursor-pointer"
      >
        <ChevronLeft size={13} />
        Back
      </button>
      <p className="text-[13px] text-ink-500 mb-1">
        Within{' '}
        <span className="font-semibold text-ink-700">{domain.name}</span>, what
        are you auditing?
      </p>
      <div className="grid grid-cols-2 gap-3 mt-4">
        {domain.tasks.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onSelect(t)}
            className="flex flex-col items-start gap-1.5 p-4 rounded-xl border border-canvas-border bg-canvas-elevated text-left hover:border-brand-400 hover:shadow-sm transition-all duration-150 cursor-pointer"
          >
            <span className="text-[13px] font-semibold text-ink-800 leading-snug">
              {t.name}
            </span>
            <span className="text-[12px] text-ink-400 leading-relaxed">
              {t.desc}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function DetailsStep({
  questions,
  answers,
  onAnswer,
  onBack,
  generatedPrompt,
  onCancel,
  onInsert,
}: {
  questions: Question[];
  answers: string[];
  onAnswer: (idx: number, value: string) => void;
  onBack: () => void;
  generatedPrompt: string | null;
  onCancel: () => void;
  onInsert: () => void;
}) {
  const answeredCount = answers.length;

  return (
    <div className="flex flex-col gap-5">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1 text-[12px] font-semibold text-brand-600 hover:text-brand-700 transition-colors self-start cursor-pointer"
      >
        <ChevronLeft size={13} />
        Back to tasks
      </button>

      {questions.map((q, idx) => {
        const isVisible = idx <= answeredCount;
        const selectedAns = answers[idx];
        if (!isVisible) return null;

        return (
          <motion.div
            key={q.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-2.5"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-md bg-brand-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                {String.fromCharCode(65 + idx)}
              </span>
              <span className="text-[13px] font-medium text-ink-700 bg-canvas rounded-lg px-3 py-2 leading-snug flex-1">
                {q.text}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 pl-8">
              {q.options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => onAnswer(idx, opt)}
                  className={[
                    'px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-all duration-150 cursor-pointer',
                    selectedAns === opt
                      ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                      : 'bg-canvas-elevated text-ink-600 border-canvas-border hover:border-brand-300 hover:text-brand-700',
                  ].join(' ')}
                >
                  {opt}
                </button>
              ))}
            </div>
          </motion.div>
        );
      })}

      {generatedPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="rounded-xl border border-brand-100 bg-brand-50/50"
        >
          <div className="px-4 pt-3 pb-2 border-b border-brand-100">
            <div className="flex items-center gap-1.5">
              <Sparkles size={13} className="text-brand-500" />
              <span className="text-[10px] font-bold text-brand-500 uppercase tracking-widest">
                Your generated prompt
              </span>
            </div>
          </div>
          <div className="px-4 py-3 max-h-[120px] overflow-y-auto">
            <p className="text-[12.5px] text-ink-700 leading-relaxed font-mono">
              {generatedPrompt}
            </p>
          </div>
          <div className="px-4 pb-4 pt-1 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-lg text-[13px] font-semibold text-ink-500 border border-canvas-border hover:bg-canvas transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onInsert}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 text-white text-[13px] font-semibold hover:bg-brand-500 transition-colors shadow-sm cursor-pointer"
            >
              Insert into chat
              <kbd className="text-[10px] bg-brand-500 rounded px-1 py-0.5 font-sans">
                ↵
              </kbd>
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
