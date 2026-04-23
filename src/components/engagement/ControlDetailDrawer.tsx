import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, ChevronRight, ChevronDown, CheckCircle2, Clock, AlertTriangle,
  Database, FileText, Shield, Workflow, Target,
  Eye, ArrowRight, XCircle, ArrowLeft, Users,
  Paperclip, Send, Lock, Zap, CloudUpload, MessageSquare, Copy
} from 'lucide-react';
import { getControlById, FINDINGS, type ControlDetail, type SampleItem, type Finding } from './engagementData';

// ─── Types ───────────────────────────────────────────────────────────────────

type TestingStep = 'overview' | 'population' | 'evidence' | 'testing' | 'review' | 'working-paper' | 'conclusion';

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
    'pass': 'bg-compliant', 'fail': 'bg-risk', 'exception': 'bg-high', 'not-tested': 'bg-ink-300',
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
            <button onClick={() => onStep(step.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                isActive ? 'bg-primary text-white' : isPast ? 'bg-compliant-50 text-compliant-700' : 'text-ink-500 hover:bg-surface-2'
              }`}>
              {isPast ? <CheckCircle2 size={11} /> : <Icon size={11} />}
              {step.label}
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ─── OVERVIEW STEP ───────────────────────────────────────────────────────────

function OverviewStep({ ctrl }: { ctrl: ControlDetail }) {
  const [workflowOpen, setWorkflowOpen] = useState(false);
  const tested = ctrl.samples.filter(s => s.status !== 'not-tested').length;

  return (
    <div className="space-y-5">
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
        </div>
      </div>

      <div>
        <h4 className="text-[11px] font-bold text-text-muted uppercase mb-2">Classification & Assertions</h4>
        <div className="flex flex-wrap gap-2">
          {ctrl.isKey && <span className="px-2.5 h-6 rounded-full text-[11px] font-semibold bg-mitigated-50 text-mitigated-700 inline-flex items-center">Key Control</span>}
          {ctrl.assertions.map(a => (
            <span key={a} className="px-2.5 h-6 rounded-full text-[11px] font-medium bg-brand-50 text-brand-700 inline-flex items-center">{a}</span>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-[11px] font-bold text-text-muted uppercase mb-2">Workflow / Test Script</h4>
        <div className="glass-card rounded-xl overflow-hidden">
          <button onClick={() => setWorkflowOpen(!workflowOpen)} className="w-full flex items-center justify-between p-4 cursor-pointer hover:bg-surface-2/30 transition-colors">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-brand-50"><Workflow size={14} className="text-brand-600" /></div>
              <div className="text-left">
                <p className="text-[12px] font-semibold text-brand-700">{ctrl.workflowName}</p>
                <p className="text-[10px] text-text-muted">{ctrl.workflowVersion} · {ctrl.workflowAttributes.length} attributes · Round {ctrl.testingRound || '—'}</p>
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
                    <p className="text-[10px] text-brand-600 mt-1 flex items-center gap-1"><FileText size={9} /> {attr.requiredEvidence}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="glass-card rounded-xl p-3 text-center">
          <div className="text-lg font-bold text-text tabular-nums">{tested}/{ctrl.samples.length}</div>
          <div className="text-[10px] text-text-muted">Samples Tested</div>
        </div>
        <div className="glass-card rounded-xl p-3 text-center">
          <div className="text-lg font-bold text-risk-700 tabular-nums">{ctrl.exceptions}</div>
          <div className="text-[10px] text-text-muted">Exceptions</div>
        </div>
        <div className="glass-card rounded-xl p-3 text-center">
          <div className="text-lg font-bold text-evidence-700 tabular-nums">{ctrl.evidenceCount}</div>
          <div className="text-[10px] text-text-muted">Evidence Items</div>
        </div>
      </div>
    </div>
  );
}

// ─── POPULATION STEP ─────────────────────────────────────────────────────────

function PopulationStep({ ctrl }: { ctrl: ControlDetail }) {
  return (
    <div className="space-y-5">
      <h4 className="text-[11px] font-bold text-text-muted uppercase mb-2">Population & Sampling</h4>
      <div className="glass-card rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2"><Database size={14} className="text-brand-600" /><span className="text-[13px] font-semibold text-text">Population</span></div>
          <span className={`px-2.5 h-6 rounded-full text-[11px] font-semibold inline-flex items-center ${
            ctrl.populationStatus === 'snapshot-created' ? 'bg-compliant-50 text-compliant-700' :
            ctrl.populationStatus === 'uploaded' ? 'bg-evidence-50 text-evidence-700' : 'bg-draft-50 text-draft-700'
          }`}>{ctrl.populationStatus === 'snapshot-created' ? 'Snapshot Locked' : ctrl.populationStatus === 'uploaded' ? 'Uploaded' : 'Not Uploaded'}</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><span className="text-[10px] text-text-muted uppercase">Source</span><p className="text-[12px] text-text">{ctrl.populationSource || '—'}</p></div>
          <div><span className="text-[10px] text-text-muted uppercase">Records</span><p className="text-[12px] font-mono text-text">{ctrl.populationSize > 0 ? ctrl.populationSize.toLocaleString() : '—'}</p></div>
          <div><span className="text-[10px] text-text-muted uppercase">Sampling Method</span><p className="text-[12px] text-text">{ctrl.samplingMethod || '—'}</p></div>
          <div><span className="text-[10px] text-text-muted uppercase">Sample Size</span><p className="text-[12px] font-mono text-text">{ctrl.samples.length || '—'}</p></div>
        </div>
        {ctrl.populationStatus === 'snapshot-created' && (
          <div className="flex items-center gap-2 p-2.5 bg-brand-50/50 rounded-lg border border-brand-100">
            <Lock size={11} className="text-brand-600 shrink-0" />
            <span className="text-[11px] text-brand-700">Population snapshot is immutable. Samples reference this exact snapshot.</span>
          </div>
        )}
      </div>
      {ctrl.populationStatus === 'none' && (
        <div className="border-2 border-dashed border-border-light rounded-xl p-8 text-center hover:border-primary/30 transition-colors">
          <CloudUpload size={24} className="text-text-muted mx-auto mb-2" />
          <p className="text-[13px] font-medium text-text">Upload population dataset</p>
          <p className="text-[11px] text-text-muted mt-1">CSV, XLSX — or connect to a data source</p>
          <button className="mt-3 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-[12px] font-semibold transition-colors cursor-pointer">Upload File</button>
        </div>
      )}
      {ctrl.populationStatus === 'uploaded' && (
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
            <Zap size={12} />Create Snapshot & Generate Samples
          </button>
        </div>
      )}
    </div>
  );
}

// ─── EVIDENCE STEP ───────────────────────────────────────────────────────────

function EvidenceStep({ ctrl }: { ctrl: ControlDetail }) {
  const totalEvidence = ctrl.samples.reduce((sum, s) => sum + s.evidenceFiles.length, 0);
  const samplesWithEvidence = ctrl.samples.filter(s => s.evidenceFiles.length > 0).length;

  return (
    <div className="space-y-5">
      <h4 className="text-[11px] font-bold text-text-muted uppercase mb-2">Evidence Collection</h4>
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
          <div className="text-[10px] text-text-muted">Missing</div>
        </div>
      </div>
      {ctrl.samples.length > 0 && (
        <div className="border-2 border-dashed border-border-light rounded-xl p-5 text-center hover:border-primary/30 transition-colors mb-4">
          <CloudUpload size={18} className="text-text-muted mx-auto mb-1" />
          <p className="text-[12px] font-medium text-text">Drop evidence files or <span className="text-primary cursor-pointer">browse</span></p>
          <p className="text-[10px] text-text-muted mt-0.5">Files auto-matched to samples when possible</p>
        </div>
      )}
      <div className="space-y-2">
        {ctrl.samples.map(sample => (
          <div key={sample.id} className="glass-card rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <SampleStatusDot status={sample.status} />
                <span className="text-[12px] font-medium text-text">{sample.label}</span>
                <span className="text-[10px] font-mono text-text-muted">{sample.referenceId}</span>
                <span className="text-[10px] text-text-muted">{sample.amount}</span>
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
  );
}

// ─── TESTING STEP ────────────────────────────────────────────────────────────

function TestingStepContent({ ctrl }: { ctrl: ControlDetail }) {
  const [selectedSample, setSelectedSample] = useState(ctrl.samples[0]?.id || '');
  const sample = ctrl.samples.find(s => s.id === selectedSample);

  if (ctrl.samples.length === 0) {
    return <div className="text-center py-12 text-text-muted text-[13px]">No samples generated yet. Complete the Population step first.</div>;
  }

  return (
    <div className="space-y-4">
      <h4 className="text-[11px] font-bold text-text-muted uppercase mb-2">Attribute Testing</h4>
      <div className="flex items-center gap-2 p-2.5 bg-brand-50/50 rounded-lg border border-brand-100">
        <Workflow size={12} className="text-brand-600" />
        <span className="text-[11px] text-brand-700 font-medium">{ctrl.workflowName} {ctrl.workflowVersion}</span>
        <span className="text-[10px] text-brand-600">· {ctrl.workflowAttributes.length} attributes</span>
      </div>
      <div className="flex gap-4">
        <div className="w-44 shrink-0">
          <div className="text-[10px] font-bold text-text-muted uppercase mb-2">Samples ({ctrl.samples.filter(s => s.status !== 'not-tested').length}/{ctrl.samples.length})</div>
          <div className="space-y-1 max-h-[400px] overflow-y-auto">
            {ctrl.samples.map(s => (
              <button key={s.id} onClick={() => setSelectedSample(s.id)}
                className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left text-[11px] transition-all cursor-pointer ${
                  selectedSample === s.id ? 'bg-primary/10 text-primary font-semibold ring-1 ring-primary/20' : 'hover:bg-surface-2 text-text-secondary'
                }`}>
                <SampleStatusDot status={s.status} />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{s.label}</div>
                  <div className="text-[10px] text-text-muted truncate">{s.amount}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          {sample ? (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="text-[13px] font-semibold text-text">{sample.label}</span>
                  <span className="text-[11px] text-text-muted ml-2">{sample.referenceId} · {sample.amount}</span>
                </div>
                <span className="text-[10px] font-bold text-brand-700">{sample.evidenceFiles.length} evidence files</span>
              </div>
              <div className="space-y-2">
                {ctrl.workflowAttributes.map(attr => {
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
                            result === r ? (r === 'pass' ? 'bg-compliant text-white' : r === 'fail' ? 'bg-risk text-white' : 'bg-ink-500 text-white')
                            : 'bg-surface-2 text-text-muted hover:bg-primary/10'
                          }`}>{r.toUpperCase()}</button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : <div className="text-center py-12 text-text-muted text-[13px]">Select a sample</div>}
        </div>
      </div>
    </div>
  );
}

// ─── WORKING PAPER STEP ──────────────────────────────────────────────────────

function WorkingPaperStep({ ctrl }: { ctrl: ControlDetail }) {
  const wp = ctrl.workingPaper;
  const [newComment, setNewComment] = useState('');
  const [expandedRound, setExpandedRound] = useState<number | null>(wp.rounds.length > 0 ? wp.rounds[wp.rounds.length - 1].round : null);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h4 className="text-[11px] font-bold text-text-muted uppercase">Working Paper</h4>
        <span className="text-[10px] text-text-muted">System-generated · Append-only</span>
      </div>

      {/* Control & Workflow header */}
      <div className="glass-card rounded-xl p-4">
        <div className="grid grid-cols-2 gap-3">
          <div><span className="text-[10px] text-text-muted uppercase">Test Instance</span><p className="text-[12px] font-mono text-text">{wp.testInstanceId}</p></div>
          <div><span className="text-[10px] text-text-muted uppercase">Control</span><p className="text-[12px] text-text">{wp.controlName}</p></div>
          <div><span className="text-[10px] text-text-muted uppercase">Workflow</span><p className="text-[12px] text-brand-700">{wp.workflowName} {wp.workflowVersion}</p></div>
          <div><span className="text-[10px] text-text-muted uppercase">Rounds</span><p className="text-[12px] text-text">{wp.rounds.length || 'None yet'}</p></div>
        </div>
      </div>

      {/* Rounds */}
      {wp.rounds.length === 0 ? (
        <div className="text-center py-8 text-text-muted text-[12px]">No testing rounds recorded yet. Complete testing to generate working paper entries.</div>
      ) : (
        <div className="space-y-3">
          {wp.rounds.map(round => {
            const isExpanded = expandedRound === round.round;
            const isLocked = round.status === 'complete';
            return (
              <div key={round.round} className={`glass-card rounded-xl overflow-hidden ${isLocked ? '' : 'border-primary/20'}`}>
                <button onClick={() => setExpandedRound(isExpanded ? null : round.round)}
                  className="w-full flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-surface-2/30 transition-colors">
                  <div className="flex items-center gap-3">
                    {isExpanded ? <ChevronDown size={12} className="text-text-muted" /> : <ChevronRight size={12} className="text-text-muted" />}
                    <span className="text-[12px] font-bold text-text">Round {round.round}</span>
                    {isLocked && <Lock size={10} className="text-ink-400" />}
                    <span className="text-[11px] text-text-muted">{round.date} · {round.tester}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {round.reviewerStatus === 'approved' && <span className="text-[10px] font-bold bg-compliant-50 text-compliant-700 px-2 py-0.5 rounded-full">Approved</span>}
                    {round.reviewerStatus === 'pending' && <span className="text-[10px] font-bold bg-high-50 text-high-700 px-2 py-0.5 rounded-full">Pending Review</span>}
                    {round.reviewerStatus === 'rejected' && <span className="text-[10px] font-bold bg-risk-50 text-risk-700 px-2 py-0.5 rounded-full">Rejected</span>}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isLocked ? 'bg-compliant-50 text-compliant-700' : 'bg-evidence-50 text-evidence-700'}`}>
                      {isLocked ? 'Complete' : 'In Progress'}
                    </span>
                  </div>
                </button>
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-border-light/60 pt-3 space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                      <div><span className="text-[10px] text-text-muted uppercase">Population</span><p className="text-[12px] tabular-nums text-text">{round.populationSize.toLocaleString()}</p></div>
                      <div><span className="text-[10px] text-text-muted uppercase">Sample Size</span><p className="text-[12px] tabular-nums text-text">{round.sampleSize}</p></div>
                      <div><span className="text-[10px] text-text-muted uppercase">Tester</span><p className="text-[12px] text-text">{round.tester}</p></div>
                    </div>
                    {/* Attribute Results */}
                    <div>
                      <span className="text-[10px] font-bold text-text-muted uppercase">Attribute Results</span>
                      <div className="mt-1.5 space-y-1">
                        {round.attributeResults.map(ar => {
                          const attr = ctrl.workflowAttributes.find(a => a.id === ar.attrId);
                          const total = ar.passCount + ar.failCount + ar.naCount;
                          const rate = total > 0 ? Math.round((ar.passCount / total) * 100) : 0;
                          return (
                            <div key={ar.attrId} className="flex items-center justify-between p-2 rounded-lg bg-surface-2/40">
                              <span className="text-[11px] font-medium text-text">{attr?.name || ar.attrId}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-compliant-700 font-bold">{ar.passCount}P</span>
                                {ar.failCount > 0 && <span className="text-[10px] text-risk-700 font-bold">{ar.failCount}F</span>}
                                {ar.naCount > 0 && <span className="text-[10px] text-ink-400 font-bold">{ar.naCount}NA</span>}
                                <div className="w-12 h-1.5 bg-surface-3 rounded-full overflow-hidden"><div className="h-full rounded-full bg-compliant" style={{ width: `${rate}%` }} /></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    {/* Evidence Refs */}
                    {round.evidenceRefs.length > 0 && (
                      <div>
                        <span className="text-[10px] font-bold text-text-muted uppercase">Evidence References</span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {round.evidenceRefs.map(r => (
                            <span key={r} className="inline-flex items-center gap-1 text-[10px] text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-100"><Paperclip size={8} />{r}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* Conclusion */}
                    {round.conclusion && (
                      <div>
                        <span className="text-[10px] font-bold text-text-muted uppercase">Round Conclusion</span>
                        <p className="text-[12px] text-text-secondary mt-1 p-2.5 rounded-lg bg-surface-2/60 leading-relaxed">{round.conclusion}</p>
                      </div>
                    )}
                    {/* Reviewer Notes */}
                    {round.reviewerNotes && (
                      <div>
                        <span className="text-[10px] font-bold text-text-muted uppercase">Reviewer Notes</span>
                        <p className="text-[12px] text-text-secondary mt-1 p-2.5 rounded-lg bg-evidence-50/40 border border-evidence-50 leading-relaxed">
                          <MessageSquare size={10} className="inline mr-1 text-evidence-700" />{round.reviewerNotes}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Comments */}
      {wp.comments.length > 0 && (
        <div>
          <h5 className="text-[11px] font-bold text-text-muted uppercase mb-2">Comments & Notes</h5>
          <div className="space-y-2 mb-3">
            {wp.comments.map((c, i) => (
              <div key={i} className={`p-2.5 rounded-lg ${c.role === 'Reviewer' ? 'bg-evidence-50/40 border border-evidence-50' : 'bg-surface-2/40 border border-border-light/60'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-bold text-text">{c.author}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${c.role === 'Reviewer' ? 'bg-evidence-50 text-evidence-700' : 'bg-brand-50 text-brand-700'}`}>{c.role}</span>
                  <span className="text-[10px] text-text-muted">{c.date}</span>
                </div>
                <p className="text-[12px] text-text-secondary leading-relaxed">{c.text}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input type="text" placeholder="Add a comment..." value={newComment} onChange={e => setNewComment(e.target.value)}
              className="flex-1 px-3 py-2 text-[12px] border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all placeholder:text-text-muted" />
            <button className="flex items-center gap-1 px-3 py-2 bg-primary text-white rounded-lg text-[12px] font-semibold hover:bg-primary-hover transition-colors cursor-pointer"><Send size={12} /></button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── REVIEW STEP ─────────────────────────────────────────────────────────────

function ReviewStep({ ctrl }: { ctrl: ControlDetail }) {
  const tested = ctrl.samples.filter(s => s.status !== 'not-tested').length;
  const passed = ctrl.samples.filter(s => s.status === 'pass').length;
  const failed = ctrl.samples.filter(s => s.status === 'fail' || s.status === 'exception').length;
  const isSameUser = ctrl.assignee === ctrl.reviewer;

  return (
    <div className="space-y-5">
      <h4 className="text-[11px] font-bold text-text-muted uppercase mb-2">Review & Approval</h4>

      {isSameUser && (
        <div className="flex items-center gap-2.5 p-3 bg-risk-50 rounded-xl border border-risk">
          <AlertTriangle size={14} className="text-risk-700 shrink-0" />
          <span className="text-[12px] text-risk-700 font-medium">Conflict: Tester and reviewer are the same person. Independent review is required for SOX engagements.</span>
        </div>
      )}

      <div className="glass-card rounded-xl p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div><span className="text-[10px] text-text-muted uppercase">Submitted By</span><p className="text-[12px] font-medium text-text">{ctrl.assignee}</p></div>
          <div><span className="text-[10px] text-text-muted uppercase">Reviewer</span><p className="text-[12px] font-medium text-text">{ctrl.reviewer}</p></div>
          <div><span className="text-[10px] text-text-muted uppercase">Testing Round</span><p className="text-[12px] text-text">Round {ctrl.testingRound}</p></div>
          <div><span className="text-[10px] text-text-muted uppercase">Workflow</span><p className="text-[12px] text-brand-700">{ctrl.workflowName} {ctrl.workflowVersion}</p></div>
        </div>
        {ctrl.conclusion && (
          <div><span className="text-[10px] text-text-muted uppercase">Tester Conclusion</span><p className="text-[12px] text-text-secondary mt-0.5 leading-relaxed">{ctrl.conclusion}</p></div>
        )}
      </div>

      <div className="grid grid-cols-4 gap-3">
        <div className="glass-card rounded-xl p-3 text-center"><div className="text-lg font-bold text-text tabular-nums">{tested}/{ctrl.samples.length}</div><div className="text-[10px] text-text-muted">Tested</div></div>
        <div className="glass-card rounded-xl p-3 text-center"><div className="text-lg font-bold text-compliant-700 tabular-nums">{passed}</div><div className="text-[10px] text-text-muted">Passed</div></div>
        <div className="glass-card rounded-xl p-3 text-center"><div className="text-lg font-bold text-risk-700 tabular-nums">{failed}</div><div className="text-[10px] text-text-muted">Failed</div></div>
        <div className="glass-card rounded-xl p-3 text-center"><div className="text-lg font-bold text-text tabular-nums">{ctrl.evidenceCount}</div><div className="text-[10px] text-text-muted">Evidence</div></div>
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
                  <div className="w-16 h-1.5 bg-surface-3 rounded-full overflow-hidden"><div className="h-full rounded-full bg-compliant" style={{ width: `${rate}%` }} /></div>
                  <span className="text-[10px] font-mono text-text-muted w-8 text-right">{rate}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Audit Trail */}
      <div>
        <h5 className="text-[11px] font-bold text-text-muted uppercase mb-2">Audit Trail</h5>
        <div className="space-y-1">
          {ctrl.auditTrail.map((entry, i) => (
            <div key={i} className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-surface-2/30 transition-colors">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-400 mt-1.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-text">{entry.actor}</span>
                  <span className="text-[10px] text-text-muted">{entry.timestamp}</span>
                </div>
                <p className="text-[11px] text-text-muted">{entry.action}: {entry.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reviewer Actions */}
      {ctrl.status === 'pending-review' && !isSameUser && (
        <div className="flex gap-3">
          <button className="flex-1 py-2.5 bg-compliant hover:brightness-110 text-white rounded-xl text-[12px] font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5">
            <CheckCircle2 size={13} />Approve
          </button>
          <button className="flex-1 py-2.5 border border-risk text-risk-700 hover:bg-risk-50 rounded-xl text-[12px] font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5">
            <XCircle size={13} />Reject
          </button>
        </div>
      )}

      {ctrl.workingPaper.rounds.some(r => r.reviewerStatus === 'approved') && (
        <div className="flex items-center gap-2 p-3 bg-compliant-50 rounded-xl border border-compliant">
          <CheckCircle2 size={14} className="text-compliant-700" />
          <span className="text-[12px] text-compliant-700 font-semibold">Review approved by {ctrl.reviewer}</span>
        </div>
      )}
    </div>
  );
}

// ─── CONCLUSION STEP ─────────────────────────────────────────────────────────

function ConclusionStep({ ctrl }: { ctrl: ControlDetail }) {
  const [selected, setSelected] = useState(ctrl.result || '');
  const linkedFindings = FINDINGS.filter(f => f.controlId === ctrl.controlId);

  return (
    <div className="space-y-5">
      <h4 className="text-[11px] font-bold text-text-muted uppercase mb-2">Control Conclusion</h4>

      {/* Current conclusion if exists */}
      {ctrl.result && (
        <div className={`p-4 rounded-xl border-2 ${
          ctrl.result === 'Effective' ? 'border-compliant bg-compliant-50/30' :
          ctrl.result === 'Partially Effective' ? 'border-high bg-high-50/30' :
          'border-risk bg-risk-50/30'
        }`}>
          <div className="flex items-center gap-2 mb-1">
            {ctrl.result === 'Effective' ? <CheckCircle2 size={14} className="text-compliant-700" /> :
             ctrl.result === 'Ineffective' ? <XCircle size={14} className="text-risk-700" /> :
             <AlertTriangle size={14} className="text-high-700" />}
            <span className="text-[13px] font-bold text-text">{ctrl.result}</span>
          </div>
          <p className="text-[12px] text-text-secondary leading-relaxed ml-5">{ctrl.conclusion}</p>
        </div>
      )}

      {/* Conclusion options (editable only if not yet concluded) */}
      {!ctrl.result && (
        <div className="space-y-2">
          {[
            { value: 'Effective', desc: 'Control is operating effectively. No exceptions or deficiencies.', cls: 'border-compliant', activeCls: 'ring-2 ring-compliant border-compliant bg-compliant-50/30' },
            { value: 'Partially Effective', desc: 'Minor exceptions that do not represent a significant deficiency.', cls: 'border-high', activeCls: 'ring-2 ring-high border-high bg-high-50/30' },
            { value: 'Ineffective', desc: 'Significant deficiency identified requiring remediation.', cls: 'border-risk', activeCls: 'ring-2 ring-risk border-risk bg-risk-50/30' },
          ].map(opt => (
            <button key={opt.value} onClick={() => setSelected(opt.value)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all cursor-pointer ${selected === opt.value ? opt.activeCls : 'border-border-light hover:border-primary/20'}`}>
              <div className="flex items-center gap-2 mb-1">
                {selected === opt.value ? <CheckCircle2 size={14} /> : <div className="w-3.5 h-3.5 rounded-full border-2 border-ink-300" />}
                <span className="text-[13px] font-semibold text-text">{opt.value}</span>
              </div>
              <p className="text-[11px] text-text-muted ml-6">{opt.desc}</p>
            </button>
          ))}
        </div>
      )}

      {/* Linked Findings */}
      {linkedFindings.length > 0 && (
        <div>
          <h5 className="text-[11px] font-bold text-text-muted uppercase mb-2">Linked Findings / Deficiencies</h5>
          {linkedFindings.map(f => (
            <div key={f.id} className="glass-card rounded-xl p-4 border-l-4 border-risk mb-2">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-mono font-bold text-risk-700">{f.id}</span>
                  <span className={`px-2 h-5 rounded-full text-[10px] font-bold inline-flex items-center ${
                    f.severity === 'Material Weakness' ? 'bg-risk-50 text-risk-700' :
                    f.severity === 'Significant Deficiency' ? 'bg-high-50 text-high-700' :
                    'bg-mitigated-50 text-mitigated-700'
                  }`}>{f.severity}</span>
                  <span className={`px-2 h-5 rounded-full text-[10px] font-bold inline-flex items-center ${
                    f.status === 'Open' ? 'bg-risk-50 text-risk-700' : f.status === 'In Remediation' ? 'bg-high-50 text-high-700' : 'bg-compliant-50 text-compliant-700'
                  }`}>{f.status}</span>
                </div>
                <span className="text-[10px] text-text-muted">Due: {f.remediationDueDate}</span>
              </div>
              <p className="text-[12px] font-medium text-text mb-1">{f.title}</p>
              <p className="text-[11px] text-text-muted mb-2">Failed: {f.failedAttribute}</p>
              <div className="text-[11px] text-text-muted">
                <span className="font-semibold">Samples: </span>{f.failedSamples.join(', ')}
              </div>
              <div className="text-[11px] text-text-muted mt-1">
                <span className="font-semibold">Root cause: </span>{f.rootCause}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Finding CTA */}
      {(selected === 'Ineffective' || ctrl.result === 'Ineffective') && linkedFindings.length === 0 && (
        <div className="glass-card rounded-xl p-4 border-l-4 border-risk">
          <div className="flex items-center gap-2 mb-2"><AlertTriangle size={13} className="text-risk-700" /><span className="text-[12px] font-bold text-risk-700">Deficiency Required</span></div>
          <p className="text-[11px] text-text-muted mb-3">An ineffective conclusion requires a linked finding with severity classification.</p>
          <button className="px-4 py-2 bg-risk hover:brightness-110 text-white rounded-lg text-[12px] font-semibold transition-all cursor-pointer flex items-center gap-1.5">
            <AlertTriangle size={12} />Create Finding
          </button>
        </div>
      )}

      {!ctrl.result && selected && (
        <button className="w-full py-3 bg-primary hover:bg-primary-hover text-white rounded-xl text-[13px] font-bold transition-colors cursor-pointer flex items-center justify-center gap-2">
          <Send size={14} />Submit Conclusion
        </button>
      )}
    </div>
  );
}

// ─── MAIN DRAWER ─────────────────────────────────────────────────────────────

interface Props {
  controlId: string;
  onClose: () => void;
}

export default function ControlDetailDrawer({ controlId, onClose }: Props) {
  const ctrl = getControlById(controlId) || getControlById('ec-001')!;
  const [activeStep, setActiveStep] = useState<TestingStep>('overview');

  const steps: { id: TestingStep; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'population', label: 'Population', icon: Database },
    { id: 'evidence', label: 'Evidence', icon: FileText },
    { id: 'testing', label: 'Testing', icon: Target },
    { id: 'working-paper', label: 'Working Paper', icon: Copy },
    { id: 'review', label: 'Review', icon: Users },
    { id: 'conclusion', label: 'Conclusion', icon: CheckCircle2 },
  ];

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed right-0 top-0 bottom-0 w-[660px] z-50 bg-white border-l border-border-light shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-light">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-text-muted">{ctrl.controlId}</span>
              {ctrl.isKey && <span className="px-1.5 h-4 rounded text-[9px] font-bold bg-mitigated-50 text-mitigated-700 inline-flex items-center">KEY</span>}
              {ctrl.result && (
                <span className={`px-2 h-5 rounded-full text-[10px] font-bold inline-flex items-center ${
                  ctrl.result === 'Effective' ? 'bg-compliant-50 text-compliant-700' :
                  ctrl.result === 'Ineffective' ? 'bg-risk-50 text-risk-700' :
                  ctrl.result === 'Partially Effective' ? 'bg-high-50 text-high-700' :
                  'bg-draft-50 text-draft-700'
                }`}>{ctrl.result || ctrl.status}</span>
              )}
            </div>
            <h2 className="text-[14px] font-bold text-text truncate">{ctrl.controlName}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] text-text-muted">{ctrl.domain}</span>
              <span className="text-ink-300">·</span>
              <Workflow size={10} className="text-brand-500" />
              <span className="text-[11px] text-brand-700 font-medium">{ctrl.workflowName} {ctrl.workflowVersion}</span>
              <span className="text-ink-300">·</span>
              <span className="text-[11px] text-text-muted">{ctrl.assignee} → {ctrl.reviewer}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-2 transition-colors cursor-pointer shrink-0 ml-3"><X size={16} className="text-text-muted" /></button>
        </div>

        <StepIndicator steps={steps} current={activeStep} onStep={setActiveStep} />

        <div className="flex-1 overflow-y-auto p-5">
          <AnimatePresence mode="wait">
            <motion.div key={activeStep} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>
              {activeStep === 'overview' && <OverviewStep ctrl={ctrl} />}
              {activeStep === 'population' && <PopulationStep ctrl={ctrl} />}
              {activeStep === 'evidence' && <EvidenceStep ctrl={ctrl} />}
              {activeStep === 'testing' && <TestingStepContent ctrl={ctrl} />}
              {activeStep === 'working-paper' && <WorkingPaperStep ctrl={ctrl} />}
              {activeStep === 'review' && <ReviewStep ctrl={ctrl} />}
              {activeStep === 'conclusion' && <ConclusionStep ctrl={ctrl} />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-border-light bg-surface-2/30">
          <button onClick={() => { const idx = steps.findIndex(s => s.id === activeStep); if (idx > 0) setActiveStep(steps[idx - 1].id); }}
            disabled={activeStep === 'overview'}
            className="flex items-center gap-1.5 px-3 py-2 text-[12px] font-medium text-text-secondary hover:text-primary transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed">
            <ArrowLeft size={12} />Previous
          </button>
          <div className="text-[11px] text-text-muted">{steps.findIndex(s => s.id === activeStep) + 1} of {steps.length}</div>
          {activeStep !== 'conclusion' ? (
            <button onClick={() => { const idx = steps.findIndex(s => s.id === activeStep); if (idx < steps.length - 1) setActiveStep(steps[idx + 1].id); }}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-[12px] font-semibold transition-colors cursor-pointer">
              Next<ArrowRight size={12} />
            </button>
          ) : (
            <button className="flex items-center gap-1.5 px-4 py-2 bg-compliant hover:brightness-110 text-white rounded-lg text-[12px] font-semibold transition-all cursor-pointer">
              <CheckCircle2 size={12} />Finalize
            </button>
          )}
        </div>
      </motion.div>
    </>
  );
}
