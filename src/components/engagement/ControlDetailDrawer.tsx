import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, ChevronRight, ChevronDown, CheckCircle2, AlertTriangle,
  Database, FileText, Workflow, Target,
  Eye, ArrowRight, XCircle, ArrowLeft, Users,
  Paperclip, Send, Lock, Zap, CloudUpload
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

type TestingStep = 'overview' | 'population' | 'evidence' | 'testing' | 'review' | 'conclusion';

interface WorkflowAttribute {
  id: string;
  name: string;
  description: string;
  requiredEvidence: string;
}

interface SampleItem {
  id: string;
  label: string;
  referenceId: string;
  status: 'not-tested' | 'pass' | 'fail' | 'exception';
  attributes: Record<string, 'pass' | 'fail' | 'na' | 'pending'>;
  evidenceFiles: string[];
}

interface ControlDetail {
  id: string;
  controlId: string;
  controlName: string;
  domain: string;
  isKey: boolean;
  objective: string;
  description: string;
  frequency: string;
  controlOwner: string;
  assertions: string[];
  workflowName: string;
  workflowVersion: string;
  workflowAttributes: WorkflowAttribute[];
  populationRequired: boolean;
  populationStatus: 'none' | 'uploaded' | 'snapshot-created';
  populationSize: number;
  populationSource: string;
  samplingMethod: string;
  samples: SampleItem[];
  testingRound: number;
  assignee: string;
  reviewer: string;
  status: string;
  conclusion: string;
}

// ─── Mock ────────────────────────────────────────────────────────────────────

const MOCK_CONTROL: ControlDetail = {
  id: 'ec-001',
  controlId: 'CTR-003',
  controlName: 'Three-way PO/GRN/Invoice matching',
  domain: 'P2P — Vendor Payment',
  isKey: true,
  objective: 'Ensure all vendor payments are validated through a three-way match of Purchase Order, Goods Receipt Note, and Invoice before disbursement.',
  description: 'Management reviews and approves payment processing through automated matching of PO, GRN, and Invoice documents. Mismatches are escalated for manual review.',
  frequency: 'Per transaction',
  controlOwner: 'AP Manager',
  assertions: ['Completeness', 'Accuracy', 'Authorization', 'Valuation'],
  workflowName: 'Three-Way PO Match',
  workflowVersion: 'v2.0',
  workflowAttributes: [
    { id: 'attr-1', name: 'PO Existence', description: 'Verify that a valid PO exists for the invoice', requiredEvidence: 'PO document or system screenshot' },
    { id: 'attr-2', name: 'GRN Match', description: 'Confirm goods receipt matches PO quantity and description', requiredEvidence: 'GRN document' },
    { id: 'attr-3', name: 'Invoice Match', description: 'Validate invoice amount matches PO and GRN within tolerance', requiredEvidence: 'Invoice document' },
    { id: 'attr-4', name: 'Tolerance Check', description: 'Verify variance is within $500 or 2% threshold', requiredEvidence: 'Tolerance report' },
    { id: 'attr-5', name: 'Approval Authorization', description: 'Confirm appropriate approval for payment release', requiredEvidence: 'Approval email or system log' },
  ],
  populationRequired: true,
  populationStatus: 'snapshot-created',
  populationSize: 3891,
  populationSource: 'SAP ERP — AP Transactions Q1-Q3 FY26',
  samplingMethod: 'Statistical — MUS (Monetary Unit Sampling)',
  samples: [
    { id: 's-001', label: 'INV-2025-4521', referenceId: 'PO-88901', status: 'pass', attributes: { 'attr-1': 'pass', 'attr-2': 'pass', 'attr-3': 'pass', 'attr-4': 'pass', 'attr-5': 'pass' }, evidenceFiles: ['po_88901.pdf', 'grn_88901.pdf', 'inv_4521.pdf'] },
    { id: 's-002', label: 'INV-2025-4522', referenceId: 'PO-88902', status: 'pass', attributes: { 'attr-1': 'pass', 'attr-2': 'pass', 'attr-3': 'pass', 'attr-4': 'pass', 'attr-5': 'pass' }, evidenceFiles: ['po_88902.pdf', 'inv_4522.pdf'] },
    { id: 's-003', label: 'INV-2025-4523', referenceId: 'PO-88903', status: 'fail', attributes: { 'attr-1': 'pass', 'attr-2': 'pass', 'attr-3': 'fail', 'attr-4': 'fail', 'attr-5': 'pass' }, evidenceFiles: ['po_88903.pdf', 'inv_4523.pdf', 'exception_note.pdf'] },
    { id: 's-004', label: 'INV-2025-4524', referenceId: 'PO-88904', status: 'pass', attributes: { 'attr-1': 'pass', 'attr-2': 'pass', 'attr-3': 'pass', 'attr-4': 'pass', 'attr-5': 'pass' }, evidenceFiles: ['po_88904.pdf', 'grn_88904.pdf'] },
    { id: 's-005', label: 'INV-2025-4525', referenceId: 'PO-88905', status: 'exception', attributes: { 'attr-1': 'pass', 'attr-2': 'fail', 'attr-3': 'pending', 'attr-4': 'pending', 'attr-5': 'pending' }, evidenceFiles: ['po_88905.pdf'] },
    { id: 's-006', label: 'INV-2025-4526', referenceId: 'PO-88906', status: 'pass', attributes: { 'attr-1': 'pass', 'attr-2': 'pass', 'attr-3': 'pass', 'attr-4': 'pass', 'attr-5': 'pass' }, evidenceFiles: ['po_88906.pdf', 'grn_88906.pdf', 'inv_4526.pdf'] },
    { id: 's-007', label: 'INV-2025-4527', referenceId: 'PO-88907', status: 'not-tested', attributes: { 'attr-1': 'pending', 'attr-2': 'pending', 'attr-3': 'pending', 'attr-4': 'pending', 'attr-5': 'pending' }, evidenceFiles: [] },
    { id: 's-008', label: 'INV-2025-4528', referenceId: 'PO-88908', status: 'not-tested', attributes: { 'attr-1': 'pending', 'attr-2': 'pending', 'attr-3': 'pending', 'attr-4': 'pending', 'attr-5': 'pending' }, evidenceFiles: [] },
  ],
  testingRound: 1,
  assignee: 'Tushar Goel',
  reviewer: 'Karan Mehta',
  status: 'in-progress',
  conclusion: '',
};

// ─── Small components ────────────────────────────────────────────────────────

function AttrResultChip({ result }: { result: string }) {
  const map: Record<string, { cls: string; label: string }> = {
    pass: { cls: 'bg-compliant-50 text-compliant-700', label: 'Pass' },
    fail: { cls: 'bg-risk-50 text-risk-700', label: 'Fail' },
    pending: { cls: 'bg-draft-50 text-draft-700', label: 'Pending' },
    na: { cls: 'bg-paper-50 text-ink-400', label: 'N/A' },
  };
  const s = map[result] || map.pending;
  return <span className={`inline-flex items-center px-2 h-5 rounded text-[10px] font-bold ${s.cls}`}>{s.label}</span>;
}

function SampleStatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    'pass': 'bg-compliant',
    'fail': 'bg-risk',
    'exception': 'bg-high',
    'not-tested': 'bg-ink-300',
  };
  return <div className={`w-2.5 h-2.5 rounded-full ${colors[status] || 'bg-ink-300'}`} />;
}

function StepIndicator({ steps, current, onStep }: { steps: { id: TestingStep; label: string; icon: React.ElementType }[]; current: TestingStep; onStep: (s: TestingStep) => void }) {
  const currentIdx = steps.findIndex(s => s.id === current);
  return (
    <div className="flex items-center gap-1 py-3 px-4 border-b border-border-light bg-surface-2/30 overflow-x-auto">
      {steps.map((step, i) => {
        const Icon = step.icon;
        const isActive = step.id === current;
        const isPast = i < currentIdx;
        return (
          <div key={step.id} className="flex items-center gap-1 shrink-0">
            {i > 0 && <ChevronRight size={10} className="text-ink-300 mx-0.5" />}
            <button
              onClick={() => onStep(step.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                isActive ? 'bg-primary text-white' :
                isPast ? 'bg-compliant-50 text-compliant-700' :
                'text-ink-500 hover:bg-surface-2'
              }`}
            >
              {isPast ? <CheckCircle2 size={11} /> : <Icon size={11} />}
              {step.label}
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ─── Step Content Panels ─────────────────────────────────────────────────────

function OverviewStep({ ctrl }: { ctrl: ControlDetail }) {
  const [workflowOpen, setWorkflowOpen] = useState(false);

  return (
    <div className="space-y-5">
      {/* Control Info */}
      <div>
        <h4 className="text-[11px] font-bold text-text-muted uppercase mb-2">Control Overview</h4>
        <div className="glass-card rounded-xl p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><span className="text-[10px] text-text-muted uppercase">Control ID</span><p className="text-[12px] font-mono text-text">{ctrl.controlId}</p></div>
            <div><span className="text-[10px] text-text-muted uppercase">Domain</span><p className="text-[12px] text-text">{ctrl.domain}</p></div>
            <div><span className="text-[10px] text-text-muted uppercase">Frequency</span><p className="text-[12px] text-text">{ctrl.frequency}</p></div>
            <div><span className="text-[10px] text-text-muted uppercase">Control Owner</span><p className="text-[12px] text-text">{ctrl.controlOwner}</p></div>
          </div>
          <div><span className="text-[10px] text-text-muted uppercase">Objective</span><p className="text-[12px] text-text-secondary leading-relaxed mt-0.5">{ctrl.objective}</p></div>
          <div><span className="text-[10px] text-text-muted uppercase">Description</span><p className="text-[12px] text-text-secondary leading-relaxed mt-0.5">{ctrl.description}</p></div>
        </div>
      </div>

      {/* Classification */}
      <div>
        <h4 className="text-[11px] font-bold text-text-muted uppercase mb-2">Classification</h4>
        <div className="flex flex-wrap gap-2">
          {ctrl.isKey && <span className="px-2.5 h-6 rounded-full text-[11px] font-semibold bg-mitigated-50 text-mitigated-700 inline-flex items-center">Key Control</span>}
          {ctrl.assertions.map(a => (
            <span key={a} className="px-2.5 h-6 rounded-full text-[11px] font-medium bg-brand-50 text-brand-700 inline-flex items-center">{a}</span>
          ))}
        </div>
      </div>

      {/* Workflow / Test Script */}
      <div>
        <h4 className="text-[11px] font-bold text-text-muted uppercase mb-2">Workflow / Test Script</h4>
        <div className="glass-card rounded-xl overflow-hidden">
          <button onClick={() => setWorkflowOpen(!workflowOpen)} className="w-full flex items-center justify-between p-4 cursor-pointer hover:bg-surface-2/30 transition-colors">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-brand-50"><Workflow size={14} className="text-brand-600" /></div>
              <div className="text-left">
                <p className="text-[12px] font-semibold text-brand-700">{ctrl.workflowName}</p>
                <p className="text-[10px] text-text-muted">{ctrl.workflowVersion} · {ctrl.workflowAttributes.length} attributes · Round {ctrl.testingRound}</p>
              </div>
            </div>
            <ChevronDown size={14} className={`text-text-muted transition-transform ${workflowOpen ? 'rotate-180' : ''}`} />
          </button>
          {workflowOpen && (
            <div className="border-t border-border-light px-4 pb-4 pt-3 space-y-2">
              {ctrl.workflowAttributes.map((attr, i) => (
                <div key={attr.id} className="flex items-start gap-3 p-2.5 rounded-lg bg-surface-2/40">
                  <span className="text-[10px] font-bold text-text-muted mt-0.5 shrink-0 w-5">#{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium text-text">{attr.name}</p>
                    <p className="text-[11px] text-text-muted mt-0.5">{attr.description}</p>
                    <p className="text-[10px] text-brand-600 mt-1 flex items-center gap-1"><FileText size={9} /> Evidence: {attr.requiredEvidence}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-card rounded-xl p-3 text-center">
          <div className="text-lg font-bold text-text tabular-nums">{ctrl.samples.filter(s => s.status !== 'not-tested').length}/{ctrl.samples.length}</div>
          <div className="text-[10px] text-text-muted">Samples Tested</div>
        </div>
        <div className="glass-card rounded-xl p-3 text-center">
          <div className="text-lg font-bold text-risk-700 tabular-nums">{ctrl.samples.filter(s => s.status === 'fail' || s.status === 'exception').length}</div>
          <div className="text-[10px] text-text-muted">Exceptions</div>
        </div>
        <div className="glass-card rounded-xl p-3 text-center">
          <div className="text-lg font-bold text-evidence-700 tabular-nums">{ctrl.samples.reduce((sum, s) => sum + s.evidenceFiles.length, 0)}</div>
          <div className="text-[10px] text-text-muted">Evidence Items</div>
        </div>
      </div>
    </div>
  );
}

function PopulationStep({ ctrl }: { ctrl: ControlDetail }) {
  return (
    <div className="space-y-5">
      <div>
        <h4 className="text-[11px] font-bold text-text-muted uppercase mb-2">Population & Sampling</h4>

        {/* Population Info */}
        <div className="glass-card rounded-xl p-4 space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database size={14} className="text-brand-600" />
              <span className="text-[13px] font-semibold text-text">Population</span>
            </div>
            <span className={`px-2.5 h-6 rounded-full text-[11px] font-semibold inline-flex items-center ${
              ctrl.populationStatus === 'snapshot-created' ? 'bg-compliant-50 text-compliant-700' :
              ctrl.populationStatus === 'uploaded' ? 'bg-evidence-50 text-evidence-700' :
              'bg-draft-50 text-draft-700'
            }`}>
              {ctrl.populationStatus === 'snapshot-created' ? 'Snapshot Locked' : ctrl.populationStatus === 'uploaded' ? 'Uploaded' : 'Not Uploaded'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div><span className="text-[10px] text-text-muted uppercase">Source</span><p className="text-[12px] text-text">{ctrl.populationSource || '—'}</p></div>
            <div><span className="text-[10px] text-text-muted uppercase">Records</span><p className="text-[12px] font-mono text-text">{ctrl.populationSize > 0 ? ctrl.populationSize.toLocaleString() : '—'}</p></div>
            <div><span className="text-[10px] text-text-muted uppercase">Sampling Method</span><p className="text-[12px] text-text">{ctrl.samplingMethod || '—'}</p></div>
            <div><span className="text-[10px] text-text-muted uppercase">Sample Size</span><p className="text-[12px] font-mono text-text">{ctrl.samples.length}</p></div>
          </div>

          {ctrl.populationStatus === 'snapshot-created' && (
            <div className="flex items-center gap-2 p-2.5 bg-brand-50/50 rounded-lg border border-brand-100 mt-2">
              <Lock size={11} className="text-brand-600 shrink-0" />
              <span className="text-[11px] text-brand-700">Population snapshot is immutable. Samples reference this exact snapshot.</span>
            </div>
          )}
        </div>

        {/* Upload Zone (when no population) */}
        {ctrl.populationStatus === 'none' && (
          <div className="border-2 border-dashed border-border-light rounded-xl p-8 text-center hover:border-primary/30 transition-colors">
            <CloudUpload size={24} className="text-text-muted mx-auto mb-2" />
            <p className="text-[13px] font-medium text-text">Upload population dataset</p>
            <p className="text-[11px] text-text-muted mt-1">CSV, XLSX — or connect to a data source</p>
            <button className="mt-3 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-[12px] font-semibold transition-colors cursor-pointer">
              Upload File
            </button>
          </div>
        )}

        {/* Sampling Controls */}
        {ctrl.populationStatus !== 'none' && (
          <div className="glass-card rounded-xl p-4">
            <h5 className="text-[11px] font-bold text-text-muted uppercase mb-2">Sampling Configuration</h5>
            <div className="flex gap-2 mb-3">
              {['Statistical — MUS', 'Statistical — Random', 'Judgmental', 'Haphazard'].map(m => (
                <span key={m} className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium cursor-pointer transition-all ${
                  ctrl.samplingMethod === m ? 'bg-primary text-white' : 'bg-surface-2 text-text-muted hover:bg-primary/10'
                }`}>{m}</span>
              ))}
            </div>
            <button className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-[12px] font-semibold transition-colors cursor-pointer flex items-center gap-1.5">
              <Zap size={12} />
              Generate Samples
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function EvidenceStep({ ctrl }: { ctrl: ControlDetail }) {
  const totalEvidence = ctrl.samples.reduce((sum, s) => sum + s.evidenceFiles.length, 0);
  const samplesWithEvidence = ctrl.samples.filter(s => s.evidenceFiles.length > 0).length;

  return (
    <div className="space-y-5">
      <div>
        <h4 className="text-[11px] font-bold text-text-muted uppercase mb-2">Evidence Collection</h4>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="glass-card rounded-xl p-3 text-center">
            <div className="text-lg font-bold text-text tabular-nums">{totalEvidence}</div>
            <div className="text-[10px] text-text-muted">Total Files</div>
          </div>
          <div className="glass-card rounded-xl p-3 text-center">
            <div className="text-lg font-bold text-compliant-700 tabular-nums">{samplesWithEvidence}</div>
            <div className="text-[10px] text-text-muted">Samples w/ Evidence</div>
          </div>
          <div className="glass-card rounded-xl p-3 text-center">
            <div className="text-lg font-bold text-high-700 tabular-nums">{ctrl.samples.length - samplesWithEvidence}</div>
            <div className="text-[10px] text-text-muted">Missing Evidence</div>
          </div>
        </div>

        {/* Upload Zone */}
        <div className="border-2 border-dashed border-border-light rounded-xl p-6 text-center hover:border-primary/30 transition-colors mb-4">
          <CloudUpload size={20} className="text-text-muted mx-auto mb-1.5" />
          <p className="text-[12px] font-medium text-text">Drop evidence files or <span className="text-primary cursor-pointer">browse</span></p>
          <p className="text-[10px] text-text-muted mt-0.5">Files will be auto-matched to samples when possible</p>
        </div>

        {/* Per-sample evidence checklist */}
        <div className="space-y-2">
          {ctrl.samples.map(sample => (
            <div key={sample.id} className="glass-card rounded-lg p-3">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <SampleStatusDot status={sample.status} />
                  <span className="text-[12px] font-medium text-text">{sample.label}</span>
                  <span className="text-[10px] font-mono text-text-muted">{sample.referenceId}</span>
                </div>
                <span className={`text-[10px] font-bold ${sample.evidenceFiles.length > 0 ? 'text-compliant-700' : 'text-high-700'}`}>
                  {sample.evidenceFiles.length > 0 ? `${sample.evidenceFiles.length} files` : 'No evidence'}
                </span>
              </div>
              {sample.evidenceFiles.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {sample.evidenceFiles.map(f => (
                    <span key={f} className="inline-flex items-center gap-1 text-[10px] font-medium text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-100">
                      <Paperclip size={8} />{f}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TestingStep_({ ctrl }: { ctrl: ControlDetail }) {
  const [selectedSample, setSelectedSample] = useState(ctrl.samples[0]?.id || '');
  const sample = ctrl.samples.find(s => s.id === selectedSample);

  return (
    <div className="space-y-4">
      <h4 className="text-[11px] font-bold text-text-muted uppercase mb-2">Attribute Testing</h4>

      {/* Workflow summary bar */}
      <div className="flex items-center gap-2 p-2.5 bg-brand-50/50 rounded-lg border border-brand-100">
        <Workflow size={12} className="text-brand-600" />
        <span className="text-[11px] text-brand-700 font-medium">{ctrl.workflowName} {ctrl.workflowVersion}</span>
        <span className="text-[10px] text-brand-600">{ctrl.workflowAttributes.length} attributes</span>
      </div>

      <div className="flex gap-4">
        {/* Sample Navigator (left) */}
        <div className="w-48 shrink-0">
          <div className="text-[10px] font-bold text-text-muted uppercase mb-2">Samples</div>
          <div className="space-y-1 max-h-[400px] overflow-y-auto">
            {ctrl.samples.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedSample(s.id)}
                className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left text-[11px] transition-all cursor-pointer ${
                  selectedSample === s.id ? 'bg-primary/10 text-primary font-semibold ring-1 ring-primary/20' : 'hover:bg-surface-2 text-text-secondary'
                }`}
              >
                <SampleStatusDot status={s.status} />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{s.label}</div>
                  <div className="text-[10px] text-text-muted truncate">{s.referenceId}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Attribute Evaluation (right) */}
        <div className="flex-1 min-w-0">
          {sample ? (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="text-[13px] font-semibold text-text">{sample.label}</span>
                  <span className="text-[11px] text-text-muted ml-2">{sample.referenceId}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-text-muted">Evidence:</span>
                  <span className="text-[10px] font-bold text-brand-700">{sample.evidenceFiles.length} files</span>
                </div>
              </div>

              <div className="space-y-2">
                {ctrl.workflowAttributes.map((attr) => {
                  const result = sample.attributes[attr.id] || 'pending';
                  return (
                    <div key={attr.id} className="glass-card rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[12px] font-medium text-text">{attr.name}</span>
                        <AttrResultChip result={result} />
                      </div>
                      <p className="text-[10px] text-text-muted mb-2">{attr.description}</p>
                      <div className="flex gap-1">
                        {['pass', 'fail', 'na'].map(r => (
                          <button key={r} className={`px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer transition-all ${
                            result === r ? (
                              r === 'pass' ? 'bg-compliant text-white' :
                              r === 'fail' ? 'bg-risk text-white' :
                              'bg-ink-500 text-white'
                            ) : 'bg-surface-2 text-text-muted hover:bg-primary/10'
                          }`}>{r.toUpperCase()}</button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-text-muted text-[13px]">Select a sample to begin testing</div>
          )}
        </div>
      </div>
    </div>
  );
}

function ReviewStep({ ctrl }: { ctrl: ControlDetail }) {
  const tested = ctrl.samples.filter(s => s.status !== 'not-tested').length;
  const passed = ctrl.samples.filter(s => s.status === 'pass').length;
  const failed = ctrl.samples.filter(s => s.status === 'fail' || s.status === 'exception').length;

  return (
    <div className="space-y-5">
      <h4 className="text-[11px] font-bold text-text-muted uppercase mb-2">Review & Approval</h4>

      {/* Submission Info */}
      <div className="glass-card rounded-xl p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div><span className="text-[10px] text-text-muted uppercase">Submitted By</span><p className="text-[12px] font-medium text-text">{ctrl.assignee}</p></div>
          <div><span className="text-[10px] text-text-muted uppercase">Reviewer</span><p className="text-[12px] font-medium text-text">{ctrl.reviewer}</p></div>
          <div><span className="text-[10px] text-text-muted uppercase">Testing Round</span><p className="text-[12px] text-text">Round {ctrl.testingRound}</p></div>
          <div><span className="text-[10px] text-text-muted uppercase">Workflow</span><p className="text-[12px] text-brand-700">{ctrl.workflowName} {ctrl.workflowVersion}</p></div>
        </div>
      </div>

      {/* Testing Summary */}
      <div>
        <h5 className="text-[11px] font-bold text-text-muted uppercase mb-2">Testing Summary</h5>
        <div className="grid grid-cols-4 gap-3">
          <div className="glass-card rounded-xl p-3 text-center">
            <div className="text-lg font-bold text-text tabular-nums">{tested}/{ctrl.samples.length}</div>
            <div className="text-[10px] text-text-muted">Tested</div>
          </div>
          <div className="glass-card rounded-xl p-3 text-center">
            <div className="text-lg font-bold text-compliant-700 tabular-nums">{passed}</div>
            <div className="text-[10px] text-text-muted">Passed</div>
          </div>
          <div className="glass-card rounded-xl p-3 text-center">
            <div className="text-lg font-bold text-risk-700 tabular-nums">{failed}</div>
            <div className="text-[10px] text-text-muted">Failed / Exceptions</div>
          </div>
          <div className="glass-card rounded-xl p-3 text-center">
            <div className="text-lg font-bold text-text tabular-nums">{ctrl.samples.reduce((sum, s) => sum + s.evidenceFiles.length, 0)}</div>
            <div className="text-[10px] text-text-muted">Evidence Items</div>
          </div>
        </div>
      </div>

      {/* Attribute Performance */}
      <div>
        <h5 className="text-[11px] font-bold text-text-muted uppercase mb-2">Attribute Performance</h5>
        <div className="space-y-1.5">
          {ctrl.workflowAttributes.map(attr => {
            const passCount = ctrl.samples.filter(s => s.attributes[attr.id] === 'pass').length;
            const failCount = ctrl.samples.filter(s => s.attributes[attr.id] === 'fail').length;
            const rate = tested > 0 ? Math.round((passCount / tested) * 100) : 0;
            return (
              <div key={attr.id} className="flex items-center justify-between p-2.5 rounded-lg bg-surface-2/40">
                <span className="text-[12px] font-medium text-text">{attr.name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-compliant-700 font-bold">{passCount}P</span>
                  {failCount > 0 && <span className="text-[10px] text-risk-700 font-bold">{failCount}F</span>}
                  <div className="w-16 h-1.5 bg-surface-3 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-compliant" style={{ width: `${rate}%` }} />
                  </div>
                  <span className="text-[10px] font-mono text-text-muted w-8 text-right">{rate}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reviewer Actions */}
      <div className="flex gap-3">
        <button className="flex-1 py-2.5 bg-compliant hover:brightness-110 text-white rounded-xl text-[12px] font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5">
          <CheckCircle2 size={13} />
          Approve
        </button>
        <button className="flex-1 py-2.5 border border-risk text-risk-700 hover:bg-risk-50 rounded-xl text-[12px] font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5">
          <XCircle size={13} />
          Reject
        </button>
      </div>
    </div>
  );
}

function ConclusionStep({ ctrl }: { ctrl: ControlDetail }) {
  const [selected, setSelected] = useState(ctrl.conclusion || '');

  return (
    <div className="space-y-5">
      <h4 className="text-[11px] font-bold text-text-muted uppercase mb-2">Control Conclusion</h4>

      {/* Conclusion Options */}
      <div className="space-y-2">
        {[
          { value: 'Effective', desc: 'Control is operating effectively. No exceptions or deficiencies identified.', cls: 'border-compliant bg-compliant-50/30', activeCls: 'ring-2 ring-compliant border-compliant' },
          { value: 'Partially Effective', desc: 'Control has minor exceptions that do not represent a significant deficiency.', cls: 'border-high bg-high-50/30', activeCls: 'ring-2 ring-high border-high' },
          { value: 'Ineffective', desc: 'Control failed. One or more significant deficiencies identified requiring remediation.', cls: 'border-risk bg-risk-50/30', activeCls: 'ring-2 ring-risk border-risk' },
        ].map(opt => (
          <button
            key={opt.value}
            onClick={() => setSelected(opt.value)}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all cursor-pointer ${
              selected === opt.value ? opt.activeCls : 'border-border-light hover:border-primary/20'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              {selected === opt.value ? <CheckCircle2 size={14} className="text-current" /> : <div className="w-3.5 h-3.5 rounded-full border-2 border-ink-300" />}
              <span className="text-[13px] font-semibold text-text">{opt.value}</span>
            </div>
            <p className="text-[11px] text-text-muted ml-5.5 pl-0.5">{opt.desc}</p>
          </button>
        ))}
      </div>

      {/* Linked Deficiency */}
      {selected === 'Ineffective' && (
        <div className="glass-card rounded-xl p-4 border-l-4 border-risk">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={13} className="text-risk-700" />
            <span className="text-[12px] font-bold text-risk-700">Deficiency Required</span>
          </div>
          <p className="text-[11px] text-text-muted mb-3">An ineffective conclusion requires a linked finding/deficiency with severity classification.</p>
          <button className="px-4 py-2 bg-risk hover:brightness-110 text-white rounded-lg text-[12px] font-semibold transition-all cursor-pointer flex items-center gap-1.5">
            <AlertTriangle size={12} />
            Create Finding
          </button>
        </div>
      )}

      {/* Submit */}
      {selected && (
        <button className="w-full py-3 bg-primary hover:bg-primary-hover text-white rounded-xl text-[13px] font-bold transition-colors cursor-pointer flex items-center justify-center gap-2">
          <Send size={14} />
          Submit Conclusion
        </button>
      )}
    </div>
  );
}

// ─── Main Drawer ─────────────────────────────────────────────────────────────

interface Props {
  controlId: string;
  onClose: () => void;
}

export default function ControlDetailDrawer({ onClose }: Props) {
  const ctrl = MOCK_CONTROL; // In production, look up by controlId
  const [activeStep, setActiveStep] = useState<TestingStep>('overview');

  const steps: { id: TestingStep; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'population', label: 'Population', icon: Database },
    { id: 'evidence', label: 'Evidence', icon: FileText },
    { id: 'testing', label: 'Testing', icon: Target },
    { id: 'review', label: 'Review', icon: Users },
    { id: 'conclusion', label: 'Conclusion', icon: CheckCircle2 },
  ];

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed right-0 top-0 bottom-0 w-[640px] z-50 bg-white border-l border-border-light shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-light">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-text-muted">{ctrl.controlId}</span>
              {ctrl.isKey && <span className="px-1.5 h-4 rounded text-[9px] font-bold bg-mitigated-50 text-mitigated-700 inline-flex items-center">KEY</span>}
            </div>
            <h2 className="text-[14px] font-bold text-text truncate">{ctrl.controlName}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] text-text-muted">{ctrl.domain}</span>
              <span className="text-ink-300">·</span>
              <span className="text-[11px] text-brand-700 font-medium">{ctrl.workflowName} {ctrl.workflowVersion}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-2 transition-colors cursor-pointer shrink-0 ml-3">
            <X size={16} className="text-text-muted" />
          </button>
        </div>

        {/* Step Indicator */}
        <StepIndicator steps={steps} current={activeStep} onStep={setActiveStep} />

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              {activeStep === 'overview' && <OverviewStep ctrl={ctrl} />}
              {activeStep === 'population' && <PopulationStep ctrl={ctrl} />}
              {activeStep === 'evidence' && <EvidenceStep ctrl={ctrl} />}
              {activeStep === 'testing' && <TestingStep_ ctrl={ctrl} />}
              {activeStep === 'review' && <ReviewStep ctrl={ctrl} />}
              {activeStep === 'conclusion' && <ConclusionStep ctrl={ctrl} />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-border-light bg-surface-2/30">
          <button
            onClick={() => {
              const idx = steps.findIndex(s => s.id === activeStep);
              if (idx > 0) setActiveStep(steps[idx - 1].id);
            }}
            disabled={activeStep === 'overview'}
            className="flex items-center gap-1.5 px-3 py-2 text-[12px] font-medium text-text-secondary hover:text-primary transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ArrowLeft size={12} />
            Previous
          </button>
          <div className="text-[11px] text-text-muted">
            {steps.findIndex(s => s.id === activeStep) + 1} of {steps.length}
          </div>
          {activeStep !== 'conclusion' ? (
            <button
              onClick={() => {
                const idx = steps.findIndex(s => s.id === activeStep);
                if (idx < steps.length - 1) setActiveStep(steps[idx + 1].id);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-[12px] font-semibold transition-colors cursor-pointer"
            >
              Next
              <ArrowRight size={12} />
            </button>
          ) : (
            <button className="flex items-center gap-1.5 px-4 py-2 bg-compliant hover:brightness-110 text-white rounded-lg text-[12px] font-semibold transition-all cursor-pointer">
              <CheckCircle2 size={12} />
              Finalize
            </button>
          )}
        </div>
      </motion.div>
    </>
  );
}
