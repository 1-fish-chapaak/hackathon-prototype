import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, Play, Upload, FileText, Calendar,
  Building2, Square, Download,
  LayoutDashboard, AlertTriangle, CheckCircle2,
  Clock, Hash, Eye, Loader2, ChevronDown,
  X, File, Percent, Users, TrendingUp
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────
interface WorkflowExecutorProps {
  workflowId: string;
  onBack: () => void;
}

type ExecutionPhase = 'idle' | 'running' | 'complete';

interface UploadSlot {
  id: string;
  label: string;
  description: string;
  accept: string;
  required: boolean;
  file: File | null;
}

interface ExecutionStep {
  label: string;
  duration: number;
}

interface ResultRow {
  invoiceNo: string;
  vendor: string;
  amount: string;
  duplicateGroup: string;
  confidence: number;
}

interface PastRun {
  id: string;
  date: string;
  findings: number;
  status: 'completed' | 'warning' | 'failed';
  duration: string;
}

// ─── Mock Data ───────────────────────────────────────────

const WORKFLOW_META = {
  name: 'Invoice Duplicate Detection',
  category: 'Accounts Payable',
  version: 'v3.2',
  status: 'active' as const,
};

const EXECUTION_STEPS: ExecutionStep[] = [
  { label: 'Loading data sources...', duration: 800 },
  { label: 'Matching records against vendor master...', duration: 900 },
  { label: 'Running fuzzy duplicate analysis...', duration: 800 },
  { label: 'Scoring & generating report...', duration: 500 },
];

const RESULTS_DATA: ResultRow[] = [
  { invoiceNo: 'INV-2026-4871', vendor: 'Apex Industrial Supplies', amount: '$14,250.00', duplicateGroup: 'DG-001', confidence: 97 },
  { invoiceNo: 'INV-2026-4872', vendor: 'Apex Industrial Supplies', amount: '$14,250.00', duplicateGroup: 'DG-001', confidence: 97 },
  { invoiceNo: 'INV-2026-5033', vendor: 'TechCore Solutions Ltd', amount: '$8,920.50', duplicateGroup: 'DG-002', confidence: 91 },
  { invoiceNo: 'INV-2026-5034', vendor: 'Tech Core Solutions', amount: '$8,920.50', duplicateGroup: 'DG-002', confidence: 88 },
  { invoiceNo: 'INV-2026-5201', vendor: 'Global Logistics Inc.', amount: '$23,100.00', duplicateGroup: 'DG-003', confidence: 94 },
  { invoiceNo: 'INV-2026-5202', vendor: 'Global Logistics Inc', amount: '$23,100.00', duplicateGroup: 'DG-003', confidence: 94 },
  { invoiceNo: 'INV-2026-5510', vendor: 'Meridian Office Supplies', amount: '$3,475.25', duplicateGroup: 'DG-004', confidence: 82 },
  { invoiceNo: 'INV-2026-5515', vendor: 'Meridian Office Supply Co', amount: '$3,475.25', duplicateGroup: 'DG-004', confidence: 79 },
];

const PAST_RUNS: PastRun[] = [
  { id: 'RUN-047', date: 'Apr 4, 2026', findings: 6, status: 'completed', duration: '3.1s' },
  { id: 'RUN-046', date: 'Apr 2, 2026', findings: 3, status: 'completed', duration: '2.8s' },
  { id: 'RUN-045', date: 'Mar 30, 2026', findings: 11, status: 'warning', duration: '4.2s' },
  { id: 'RUN-044', date: 'Mar 27, 2026', findings: 2, status: 'completed', duration: '2.5s' },
  { id: 'RUN-043', date: 'Mar 25, 2026', findings: 0, status: 'completed', duration: '2.1s' },
];

// ─── Sub-components ──────────────────────────────────────

function ConfidenceChip({ value }: { value: number }) {
  const color =
    value >= 90
      ? 'bg-danger-bg text-danger'
      : value >= 80
        ? 'bg-warning-bg text-warning'
        : 'bg-surface-2 text-text-muted';
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold font-mono ${color}`}>
      {value}%
    </span>
  );
}

function StatusBadge({ status }: { status: PastRun['status'] }) {
  const map = {
    completed: { bg: 'bg-success-bg text-success', label: 'DONE' },
    warning: { bg: 'bg-warning-bg text-warning', label: 'WARN' },
    failed: { bg: 'bg-danger-bg text-danger', label: 'FAIL' },
  };
  const s = map[status];
  return (
    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${s.bg}`}>
      {s.label}
    </span>
  );
}

function FileDropZone({
  slot,
  onFileDrop,
  onRemove,
}: {
  slot: UploadSlot;
  onFileDrop: (id: string, file: File) => void;
  onRemove: (id: string) => void;
}) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) onFileDrop(slot.id, file);
    },
    [slot.id, onFileDrop],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) onFileDrop(slot.id, file);
    },
    [slot.id, onFileDrop],
  );

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => !slot.file && inputRef.current?.click()}
      className={`relative rounded-xl border-2 border-dashed p-5 text-center transition-all duration-200 cursor-pointer group ${
        slot.file
          ? 'border-primary/30 bg-primary-xlight/40'
          : dragOver
            ? 'border-primary bg-primary-xlight/60 scale-[1.01]'
            : 'border-border-light bg-surface-2/50 hover:border-primary/30 hover:bg-primary-xlight/20'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={slot.accept}
        onChange={handleChange}
        className="hidden"
      />

      {slot.file ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <File size={16} className="text-primary" />
            </div>
            <div className="text-left">
              <div className="text-[13px] font-medium text-text">{slot.file.name}</div>
              <div className="text-[11px] text-text-muted">
                {(slot.file.size / 1024).toFixed(1)} KB
              </div>
            </div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(slot.id); }}
            className="w-7 h-7 rounded-lg bg-surface-3 hover:bg-danger-bg text-text-muted hover:text-danger flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <>
          <div className="w-10 h-10 rounded-xl bg-surface-3 group-hover:bg-primary/10 flex items-center justify-center mx-auto mb-3 transition-colors">
            <Upload size={18} className="text-text-muted group-hover:text-primary transition-colors" />
          </div>
          <div className="text-[13px] font-medium text-text mb-1">{slot.label}</div>
          <div className="text-[11px] text-text-muted mb-2">{slot.description}</div>
          <div className="text-[10px] text-text-muted/60">
            Drop file here or <span className="text-primary font-medium">browse</span>
          </div>
          {slot.required && (
            <span className="absolute top-3 right-3 text-[9px] font-bold text-danger uppercase tracking-wider">Required</span>
          )}
        </>
      )}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────

export default function WorkflowExecutor({ workflowId, onBack }: WorkflowExecutorProps) {
  // Execution state
  const [phase, setPhase] = useState<ExecutionPhase>('idle');
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // File upload state
  const [uploads, setUploads] = useState<UploadSlot[]>([
    {
      id: 'invoices',
      label: 'Invoice Register',
      description: 'CSV or Excel file with invoice data',
      accept: '.csv,.xlsx,.xls',
      required: true,
      file: null,
    },
    {
      id: 'vendors',
      label: 'Vendor Master',
      description: 'Vendor list for cross-referencing',
      accept: '.csv,.xlsx,.xls',
      required: false,
      file: null,
    },
  ]);

  // Parameter state
  const [threshold, setThreshold] = useState('75');
  const [dateRange, setDateRange] = useState({ from: '2026-01-01', to: '2026-03-31' });
  const [companyCode, setCompanyCode] = useState('CC-1000');
  const [companyOpen, setCompanyOpen] = useState(false);

  const companyCodes = ['CC-1000', 'CC-2000', 'CC-3000', 'CC-4500', 'CC-7000'];

  // File handlers
  const handleFileDrop = useCallback((id: string, file: File) => {
    setUploads((prev) => prev.map((s) => (s.id === id ? { ...s, file } : s)));
  }, []);

  const handleFileRemove = useCallback((id: string) => {
    setUploads((prev) => prev.map((s) => (s.id === id ? { ...s, file: null } : s)));
  }, []);

  // Execution logic
  const startExecution = useCallback(() => {
    setPhase('running');
    setCurrentStep(0);
    setProgress(0);

    let step = 0;
    const totalDuration = EXECUTION_STEPS.reduce((a, s) => a + s.duration, 0);
    let elapsed = 0;

    const advance = () => {
      if (step < EXECUTION_STEPS.length) {
        setCurrentStep(step);
        elapsed += EXECUTION_STEPS[step].duration;
        setProgress(Math.round((elapsed / totalDuration) * 100));
        step++;
        timerRef.current = setTimeout(advance, EXECUTION_STEPS[step - 1].duration);
      } else {
        setPhase('complete');
        setProgress(100);
      }
    };

    advance();
  }, []);

  const stopExecution = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setPhase('idle');
    setCurrentStep(0);
    setProgress(0);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // ─── Glass card style (from WorkflowDetail pattern) ────
  const glassStyle = {
    background: 'rgba(255,255,255,0.6)',
    backdropFilter: 'blur(20px)',
    boxShadow: '0 2px 12px rgba(106,18,205,0.02), inset 0 1px 0 rgba(255,255,255,0.6)',
  };

  return (
    <div className="h-full overflow-y-auto bg-white bg-mesh-gradient relative">
      <div className="px-6 py-8 relative">
        {/* ─── Back Button ─── */}
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-primary mb-4 transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} />
          Workflows
        </button>

        {/* ─── Header ─── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="glass-card rounded-2xl p-6 mb-8 relative overflow-hidden"
        >
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-gradient-to-br from-primary/5 to-transparent rounded-full pointer-events-none" />

          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 text-[11px] text-text-muted mb-2">
                <div className="flex items-center gap-1 text-success font-semibold uppercase tracking-wider">
                  <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                  {WORKFLOW_META.status === 'active' ? 'Active' : 'Inactive'}
                </div>
                <span className="font-mono">{workflowId.toUpperCase()}</span>
              </div>
              <h1 className="text-xl font-bold text-text tracking-tight mb-1">{WORKFLOW_META.name}</h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  {WORKFLOW_META.category}
                </span>
                <span className="text-[10px] font-semibold text-text-muted bg-surface-3 px-2 py-0.5 rounded-full font-mono">
                  {WORKFLOW_META.version}
                </span>
              </div>
            </div>

            {/* Execution status indicator (only when running/complete) */}
            <AnimatePresence>
              {phase === 'running' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex items-center gap-2 bg-warning-bg text-warning px-3 py-1.5 rounded-lg"
                >
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                    <Loader2 size={13} />
                  </motion.div>
                  <span className="text-[12px] font-semibold">Executing...</span>
                </motion.div>
              )}
              {phase === 'complete' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex items-center gap-2 bg-success-bg text-success px-3 py-1.5 rounded-lg"
                >
                  <CheckCircle2 size={13} />
                  <span className="text-[12px] font-semibold">Complete</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* ─── Input Section ─── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="rounded-2xl border border-border-light p-6 mb-8"
          style={glassStyle}
        >
          <h2 className="text-[13px] font-bold text-text uppercase tracking-wider mb-5 flex items-center gap-2">
            <FileText size={14} className="text-primary" />
            Input Configuration
          </h2>

          {/* File Uploads */}
          <div className="mb-6">
            <div className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-3">
              Data Sources
            </div>
            <div className="grid grid-cols-2 gap-4">
              {uploads.map((slot) => (
                <FileDropZone
                  key={slot.id}
                  slot={slot}
                  onFileDrop={handleFileDrop}
                  onRemove={handleFileRemove}
                />
              ))}
            </div>
          </div>

          {/* Parameters */}
          <div className="mb-6">
            <div className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-3">
              Parameters
            </div>
            <div className="grid grid-cols-3 gap-4">
              {/* Threshold */}
              <div>
                <label className="text-[11px] font-semibold text-text block mb-1.5 flex items-center gap-1.5">
                  <Percent size={11} className="text-primary" />
                  Match Threshold
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={threshold}
                    onChange={(e) => setThreshold(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-border-light text-[13px] font-mono text-text bg-white focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-text-muted">%</span>
                </div>
              </div>

              {/* Date Range */}
              <div>
                <label className="text-[11px] font-semibold text-text block mb-1.5 flex items-center gap-1.5">
                  <Calendar size={11} className="text-primary" />
                  Date Range
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={dateRange.from}
                    onChange={(e) => setDateRange((p) => ({ ...p, from: e.target.value }))}
                    className="flex-1 px-2.5 py-2.5 rounded-xl border border-border-light text-[12px] font-mono text-text bg-white focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
                  />
                  <input
                    type="date"
                    value={dateRange.to}
                    onChange={(e) => setDateRange((p) => ({ ...p, to: e.target.value }))}
                    className="flex-1 px-2.5 py-2.5 rounded-xl border border-border-light text-[12px] font-mono text-text bg-white focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
                  />
                </div>
              </div>

              {/* Company Code */}
              <div>
                <label className="text-[11px] font-semibold text-text block mb-1.5 flex items-center gap-1.5">
                  <Building2 size={11} className="text-primary" />
                  Company Code
                </label>
                <div className="relative">
                  <button
                    onClick={() => setCompanyOpen(!companyOpen)}
                    className="w-full px-3 py-2.5 rounded-xl border border-border-light text-[13px] font-mono text-text bg-white flex items-center justify-between hover:border-primary/30 transition-colors cursor-pointer"
                  >
                    {companyCode}
                    <ChevronDown size={14} className={`text-text-muted transition-transform ${companyOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {companyOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.15 }}
                        className="absolute z-20 top-full mt-1 w-full bg-white rounded-xl border border-border-light shadow-lg overflow-hidden"
                      >
                        {companyCodes.map((code) => (
                          <button
                            key={code}
                            onClick={() => { setCompanyCode(code); setCompanyOpen(false); }}
                            className={`w-full px-3 py-2 text-left text-[12px] font-mono hover:bg-primary-xlight transition-colors cursor-pointer ${
                              code === companyCode ? 'text-primary font-semibold bg-primary-xlight/50' : 'text-text'
                            }`}
                          >
                            {code}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>

          {/* Execute / Stop Button */}
          <div className="flex items-center gap-3">
            {phase === 'running' ? (
              <button
                onClick={stopExecution}
                className="flex items-center gap-2 px-5 py-2.5 bg-danger hover:bg-red-700 text-white rounded-xl text-[13px] font-semibold transition-colors cursor-pointer"
              >
                <Square size={14} />
                Stop Execution
              </button>
            ) : (
              <button
                onClick={startExecution}
                disabled={phase !== 'idle'}
                className="btn-primary flex items-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-semibold"
              >
                <Play size={14} />
                Execute Workflow
              </button>
            )}

            {phase === 'complete' && (
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-[12px] text-success font-medium flex items-center gap-1.5"
              >
                <CheckCircle2 size={13} />
                Execution completed in 3.0s
              </motion.span>
            )}
          </div>
        </motion.div>

        {/* ─── Execution Progress ─── */}
        <AnimatePresence>
          {phase === 'running' && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 32 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="rounded-2xl border border-primary/20 p-6 bg-primary-xlight/30" style={{ backdropFilter: 'blur(20px)' }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[13px] font-bold text-text flex items-center gap-2">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}>
                      <Loader2 size={15} className="text-primary" />
                    </motion.div>
                    Running Workflow
                  </h3>
                  <span className="text-[12px] font-mono font-bold text-primary">{progress}%</span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 rounded-full bg-primary/10 mb-5 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-primary-medium"
                    initial={{ width: '0%' }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                  />
                </div>

                {/* Step indicators */}
                <div className="space-y-2">
                  {EXECUTION_STEPS.map((step, i) => {
                    const isDone = i < currentStep;
                    const isCurrent = i === currentStep;
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={`flex items-center gap-3 py-2 px-3 rounded-lg transition-colors ${
                          isCurrent ? 'bg-white/60' : ''
                        }`}
                      >
                        <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0">
                          {isDone ? (
                            <CheckCircle2 size={16} className="text-success" />
                          ) : isCurrent ? (
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                              <Loader2 size={16} className="text-primary" />
                            </motion.div>
                          ) : (
                            <div className="w-4 h-4 rounded-full border-2 border-border-light" />
                          )}
                        </div>
                        <span className={`text-[12px] ${
                          isDone ? 'text-text-muted line-through' : isCurrent ? 'text-text font-semibold' : 'text-text-muted'
                        }`}>
                          Step {i + 1}/{EXECUTION_STEPS.length}: {step.label}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Results Section ─── */}
        <AnimatePresence>
          {phase === 'complete' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="mb-8"
            >
              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { label: 'Records Processed', value: '4,521', icon: Users, color: 'bg-primary/10 text-primary', note: 'Invoice register + vendor master' },
                  { label: 'Flags Raised', value: '8', icon: AlertTriangle, color: 'bg-warning-bg text-warning', note: '4 duplicate groups detected' },
                  { label: 'Execution Duration', value: '3.0s', icon: Clock, color: 'bg-success-bg text-success', note: '12% faster than avg' },
                ].map((card) => (
                  <motion.div
                    key={card.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-surface-2 border border-border-light rounded-xl p-4 hover:shadow-md hover:border-primary/20 transition-all duration-300 group cursor-default"
                  >
                    <div className={`w-7 h-7 rounded-lg ${card.color} flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform duration-300`}>
                      <card.icon size={14} />
                    </div>
                    <div className="text-[9px] text-text-muted uppercase tracking-wider mb-1">{card.label}</div>
                    <div className="text-2xl font-bold font-mono text-text leading-none mb-1">{card.value}</div>
                    <div className="text-[11px] text-text-secondary">{card.note}</div>
                  </motion.div>
                ))}
              </div>

              {/* Results Table */}
              <div className="rounded-2xl border border-border-light overflow-hidden mb-5" style={glassStyle}>
                <div className="flex items-center justify-between px-5 py-4 border-b border-border-light">
                  <h3 className="text-[13px] font-bold text-text flex items-center gap-2">
                    <TrendingUp size={14} className="text-primary" />
                    Duplicate Invoice Matches
                  </h3>
                  <span className="text-[11px] text-text-muted font-mono">{RESULTS_DATA.length} records</span>
                </div>

                <div className="overflow-x-auto">
                  {/* Table header */}
                  <div className="grid grid-cols-[140px_1fr_120px_110px_90px] gap-3 px-5 py-3 bg-surface-2 border-b border-border-light min-w-[600px]">
                    {['Invoice #', 'Vendor', 'Amount', 'Dup. Group', 'Confidence'].map((h) => (
                      <span key={h} className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{h}</span>
                    ))}
                  </div>

                  {/* Table rows */}
                  {RESULTS_DATA.map((row, i) => (
                    <motion.div
                      key={row.invoiceNo}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 + i * 0.04 }}
                      className="grid grid-cols-[140px_1fr_120px_110px_90px] gap-3 px-5 py-3.5 border-b border-border-light last:border-0 hover:bg-primary-xlight/30 transition-colors items-center min-w-[600px]"
                    >
                      <span className="text-[12px] font-mono text-primary font-medium">{row.invoiceNo}</span>
                      <span className="text-[12px] text-text truncate">{row.vendor}</span>
                      <span className="text-[12px] font-mono text-text font-medium">{row.amount}</span>
                      <span className="text-[11px] font-mono text-text-muted bg-surface-2 px-2 py-0.5 rounded w-fit">{row.duplicateGroup}</span>
                      <ConfidenceChip value={row.confidence} />
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-[12px] font-semibold transition-colors cursor-pointer">
                  <Download size={13} />
                  Download CSV
                </button>
                <button className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-xl text-[12px] font-medium text-text-secondary hover:bg-surface-2 hover:border-primary/30 transition-colors cursor-pointer">
                  <LayoutDashboard size={13} />
                  Add to Dashboard
                </button>
                <button className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-xl text-[12px] font-medium text-text-secondary hover:bg-surface-2 hover:border-primary/30 transition-colors cursor-pointer">
                  <AlertTriangle size={13} />
                  Create Exceptions
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Past Runs ─── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="rounded-2xl border border-border-light overflow-hidden mb-8"
          style={glassStyle}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-border-light">
            <h3 className="text-[13px] font-bold text-text flex items-center gap-2">
              <Clock size={14} className="text-primary" />
              Past Runs
            </h3>
            <span className="text-[11px] text-text-muted font-mono">{PAST_RUNS.length} runs</span>
          </div>

          {/* Table header */}
          <div className="grid grid-cols-[90px_1fr_90px_80px_80px_70px] gap-3 px-5 py-3 bg-surface-2 border-b border-border-light">
            {['Run', 'Date', 'Findings', 'Status', 'Duration', ''].map((h) => (
              <span key={h || 'action'} className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{h}</span>
            ))}
          </div>

          {/* Rows */}
          {PAST_RUNS.map((run, i) => (
            <motion.div
              key={run.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.04 }}
              className="grid grid-cols-[90px_1fr_90px_80px_80px_70px] gap-3 px-5 py-3.5 border-b border-border-light last:border-0 hover:bg-primary-xlight/30 transition-colors items-center"
            >
              <span className="text-[12px] font-mono text-primary font-medium">{run.id}</span>
              <span className="text-[12px] font-mono text-text-secondary">{run.date}</span>
              <div className="flex items-center gap-1.5">
                <Hash size={11} className="text-text-muted" />
                <span className="text-[12px] font-mono text-text font-medium">{run.findings}</span>
              </div>
              <StatusBadge status={run.status} />
              <span className="text-[12px] font-mono text-text-muted">{run.duration}</span>
              <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border-light text-[11px] font-medium text-text-secondary hover:bg-surface-2 hover:border-primary/30 transition-colors cursor-pointer">
                <Eye size={11} />
                View
              </button>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
