import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, CheckCircle, Play, Save, History, Undo,
  Database, ArrowRight, LayoutTemplate,
  Sparkles, Zap, ChevronDown, Monitor, Plus, Lightbulb,
  AlertTriangle, Shield, FileText, Check, Target, Cpu
} from 'lucide-react';
import { NoiseButton } from '../shared/NoiseButton';

interface Props {
  onClose: () => void;
  buildStage?: number; // 0-5, driven by chat clarifications
  uiEnhancements?: string[]; // list of applied UI enhancements from chat
}

const STAGE_LABELS = [
  { label: 'Data Source', icon: Database, color: '#c084fc' },
  { label: 'Detection', icon: Target, color: '#9b59d6' },
  { label: 'Rules', icon: Cpu, color: '#7c3aed' },
  { label: 'Input / Output', icon: ArrowRight, color: '#6a12cd' },
  { label: 'Output Layout', icon: Monitor, color: '#4c1d95' },
];

const DEMO_PURPOSE = 'Detect duplicate invoices across vendor payments by matching key fields against historical data, flagging potential duplicates before payment processing.';

const DEMO_STEPS = [
  'Ingest invoice data from SAP ERP',
  'Normalize fields (amount, date, vendor)',
  'Fuzzy match against historical records',
  'Score duplicate probability',
  'Flag & notify AP team',
];

const AI_SUGGESTED_STEPS = [
  { label: 'Add approval gate before notification', desc: 'Route high-risk duplicates for manager review', icon: Shield },
  { label: 'Archive processed invoices', desc: 'Move flagged records to audit log for compliance', icon: FileText },
  { label: 'Cross-vendor duplicate check', desc: 'Detect same invoice across different vendors', icon: AlertTriangle },
];

const DEMO_INPUTS = [
  { name: 'Invoice Data', type: 'file' },
  { name: 'Vendor ID', type: 'text' },
  { name: 'Date Range', type: 'date' },
];

const DEMO_OUTPUTS = [
  { name: 'Duplicate Report', type: 'table' },
  { name: 'Risk Score', type: 'number' },
  { name: 'Flagged Invoices', type: 'file' },
];

const VERSIONS = [
  { id: 'v3', time: 'Now', msg: 'Added output schema' },
  { id: 'v2', time: '2m ago', msg: 'Defined workflow steps' },
  { id: 'v1', time: '4m ago', msg: 'Initial state' },
];

export default function WorkflowBuilderCanvas({ onClose, buildStage = 5, uiEnhancements = [] }: Props) {
  const [versionOpen, setVersionOpen] = useState(false);
  const [showSavedBanner, setShowSavedBanner] = useState(false);

  const isBuilding = buildStage > 0 && buildStage < 5;
  const isComplete = buildStage >= 5;
  const fillPercent = buildStage * 20;
  const hasEnhancements = uiEnhancements.length > 0;
  const hasSeverityColors = uiEnhancements.some(e => e.includes('severity'));
  const hasExportButtons = uiEnhancements.some(e => e.includes('export'));
  const hasDateFilter = uiEnhancements.some(e => e.includes('date'));

  const handleSave = () => {
    setShowSavedBanner(true);
    setTimeout(() => setShowSavedBanner(false), 2500);
  };

  return (
    <motion.div
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: hasEnhancements ? 760 : isComplete ? 620 : 480, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="h-full bg-surface-2 border-l border-border-light flex flex-col overflow-hidden shrink-0 relative"
    >
      {/* Save Banner */}
      <AnimatePresence>
        {showSavedBanner && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-3 flex items-center justify-center gap-2 shadow-lg"
          >
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 12, delay: 0.1 }}>
              <Check size={18} />
            </motion.div>
            <span className="text-[13px] font-semibold">Workflow Saved Successfully</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Bar with Progress */}
      <div className="border-b border-border-light bg-white shrink-0">
        <div className="flex items-center justify-between px-3 h-11">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-primary" />
            <span className="text-[12px] font-semibold text-text">Workflow Canvas</span>
            {isBuilding && (
              <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full animate-pulse">
                Building...
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <div className="relative">
              <button onClick={() => setVersionOpen(p => !p)} className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-text-muted hover:text-text-secondary hover:bg-gray-50 rounded-md transition-colors cursor-pointer">
                <History size={12} /> v3 <ChevronDown size={10} />
              </button>
              <AnimatePresence>
                {versionOpen && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl border border-border-light shadow-lg z-50 p-2">
                    {VERSIONS.map((v, idx) => (
                      <button key={v.id} onClick={() => setVersionOpen(false)} className={`w-full text-left px-3 py-2 rounded-lg text-[11px] transition-colors cursor-pointer ${idx === 0 ? 'bg-primary/5 text-primary font-medium' : 'text-text-secondary hover:bg-gray-50'}`}>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">{v.id}</span>
                          <span className="text-text-muted text-[10px]">{v.time}</span>
                        </div>
                        <div className="text-[10px] mt-0.5 opacity-70">{v.msg}</div>
                        {idx > 0 && <div className="flex items-center gap-0.5 text-primary text-[10px] mt-1 font-medium"><Undo size={8} /> Restore</div>}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button onClick={onClose} className="p-1.5 text-text-muted hover:text-text-secondary rounded-md hover:bg-gray-50 cursor-pointer">
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Understanding Meter */}
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 mb-2">
            {STAGE_LABELS.map((stage, i) => {
              const filled = buildStage > i;
              const active = buildStage === i + 1;
              return (
                <div key={stage.label} className="flex items-center gap-1.5 flex-1">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold transition-all duration-300 ${
                    filled ? 'bg-primary text-white' : active ? 'bg-primary/20 text-primary ring-2 ring-primary/30' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {filled ? <CheckCircle size={12} /> : i + 1}
                  </div>
                  <span className={`text-[9px] font-medium truncate transition-colors ${active ? 'text-primary font-bold' : filled ? 'text-text' : 'text-text-muted'}`}>
                    {stage.label}
                  </span>
                  {i < STAGE_LABELS.length - 1 && <div className={`flex-1 h-px transition-colors ${filled ? 'bg-primary' : 'bg-border-light'}`} />}
                </div>
              );
            })}
          </div>
          {/* Progress bar */}
          <div className="h-1 bg-surface-3 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-primary-medium rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${fillPercent}%` }}
              transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            />
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">

          {/* Stage 0: Empty state */}
          {buildStage === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center mb-3">
                <Sparkles size={24} className="text-primary/40" />
              </div>
              <h4 className="text-[14px] font-semibold text-text mb-1">Waiting for input...</h4>
              <p className="text-[12px] text-text-muted max-w-[250px]">Describe a workflow in chat and I'll build it step by step.</p>
            </motion.div>
          )}

          {/* Stage 1+: Overview */}
          {buildStage >= 1 && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="bg-white p-4 rounded-xl border border-border-light shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-primary-xlight text-primary rounded-lg"><LayoutTemplate size={14} /></div>
                  <h2 className="text-[13px] font-semibold text-text">Overview</h2>
                  <div className="ml-auto flex items-center gap-1 text-[9px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                    <CheckCircle size={9} /> Inferred from chat
                  </div>
                </div>
                <p className="text-[12px] text-text-secondary leading-relaxed">{DEMO_PURPOSE}</p>
              </div>
            </motion.div>
          )}

          {/* Stage 2+: Execution Steps */}
          {buildStage >= 2 && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="bg-white rounded-xl border border-border-light shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border-light">
                  <Zap size={13} className="text-primary" />
                  <h2 className="text-[12px] font-semibold text-text">Execution Plan</h2>
                  <span className="text-[10px] text-text-muted ml-auto">{DEMO_STEPS.length} steps</span>
                </div>
                {DEMO_STEPS.map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-center gap-3 px-4 py-2.5 border-b border-border-light last:border-0 hover:bg-primary-xlight/30 transition-colors"
                  >
                    <span className="text-[11px] font-mono font-bold text-text-muted w-5 text-center">{i + 1}</span>
                    <div className="w-px h-4 bg-border-light" />
                    <span className="text-[12px] font-medium text-text flex-1">{step}</span>
                    <CheckCircle size={12} className="text-success shrink-0" />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Stage 3+: Inputs & Outputs */}
          {buildStage >= 3 && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-4 rounded-xl border border-border-light shadow-sm">
                  <div className="flex items-center gap-2 mb-2.5">
                    <div className="p-1 bg-blue-50 text-blue-600 rounded-md"><Database size={13} /></div>
                    <h2 className="text-[12px] font-semibold text-text">Inputs</h2>
                  </div>
                  <div className="space-y-1.5">
                    {DEMO_INPUTS.map((inp, i) => (
                      <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.1 }} className="flex items-center justify-between p-2 bg-surface-2 rounded-lg">
                        <span className="text-[11px] font-medium text-text">{inp.name}</span>
                        <span className="text-[9px] px-1.5 py-0.5 bg-white border border-border-light rounded text-text-muted uppercase tracking-wider font-bold">{inp.type}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-border-light shadow-sm">
                  <div className="flex items-center gap-2 mb-2.5">
                    <div className="p-1 bg-emerald-50 text-emerald-600 rounded-md"><ArrowRight size={13} /></div>
                    <h2 className="text-[12px] font-semibold text-text">Outputs</h2>
                  </div>
                  <div className="space-y-1.5">
                    {DEMO_OUTPUTS.map((out, i) => (
                      <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.1 }} className="flex items-center justify-between p-2 bg-surface-2 rounded-lg">
                        <span className="text-[11px] font-medium text-text">{out.name}</span>
                        <span className="text-[9px] px-1.5 py-0.5 bg-white border border-border-light rounded text-text-muted uppercase tracking-wider font-bold">{out.type}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Stage 5: Output Screen — expands further when enhanced */}
          {buildStage >= 5 && (
            <motion.div initial={{ opacity: 0, y: 12, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.6 }}>
              <div className={`bg-white rounded-xl border shadow-sm transition-all duration-500 ${hasEnhancements ? 'border-primary/20 p-5' : 'border-border-light p-4'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${hasEnhancements ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}><Monitor size={14} /></div>
                    <h2 className="text-[13px] font-semibold text-text">Output Preview</h2>
                    {hasEnhancements ? (
                      <span className="text-[9px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                        <CheckCircle size={8} /> {uiEnhancements.length} Enhancements Applied
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                        <Sparkles size={8} /> AI Recommended
                      </span>
                    )}
                  </div>
                </div>

                {/* Split-screen: Input Tab + Output Tab */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Input Form Preview */}
                  <div className={`border rounded-xl overflow-hidden transition-all ${hasEnhancements ? 'border-primary/15' : 'border-border-light'}`}>
                    <div className="bg-primary/5 px-3 py-1.5 border-b border-border-light flex items-center justify-between">
                      <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Input Screen</span>
                    </div>
                    <div className="p-3 space-y-2.5">
                      {DEMO_INPUTS.map((inp, i) => (
                        <div key={i}>
                          <div className="text-[9px] font-semibold text-text-muted uppercase tracking-wider mb-1">{inp.name}</div>
                          {inp.type === 'file' ? (
                            <div className="h-10 rounded-lg border border-dashed border-border flex items-center justify-center">
                              <span className="text-[9px] text-text-muted flex items-center gap-1"><Plus size={8} /> Drop {inp.name.toLowerCase()}</span>
                            </div>
                          ) : (
                            <div className="h-7 rounded-lg border border-border-light bg-surface-2 flex items-center px-2">
                              <div className="h-1.5 w-16 bg-text-muted/15 rounded" />
                            </div>
                          )}
                        </div>
                      ))}
                      {/* Date filter — shown when enhancement applied */}
                      {hasDateFilter && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="overflow-hidden">
                          <div className="text-[9px] font-semibold text-primary uppercase tracking-wider mb-1 flex items-center gap-1">
                            <Sparkles size={7} /> Date Range Filter <span className="text-[7px] bg-green-100 text-green-700 px-1 rounded">NEW</span>
                          </div>
                          <div className="flex gap-1.5">
                            <div className="flex-1 h-7 rounded-lg border border-primary/20 bg-primary/5 flex items-center px-2">
                              <div className="h-1.5 w-10 bg-primary/20 rounded" />
                            </div>
                            <div className="flex-1 h-7 rounded-lg border border-primary/20 bg-primary/5 flex items-center px-2">
                              <div className="h-1.5 w-10 bg-primary/20 rounded" />
                            </div>
                          </div>
                        </motion.div>
                      )}
                      <div className="flex justify-end pt-1">
                        <div className="h-6 w-16 bg-primary/20 rounded-lg flex items-center justify-center">
                          <span className="text-[8px] text-primary font-bold">Run</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Output Display Preview */}
                  <div className={`border rounded-xl overflow-hidden transition-all ${hasEnhancements ? 'border-primary/15' : 'border-border-light'}`}>
                    <div className="bg-emerald-50 px-3 py-1.5 border-b border-border-light flex items-center justify-between">
                      <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Output Screen</span>
                      {/* Export buttons — shown when enhancement applied */}
                      {hasExportButtons && (
                        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex gap-1">
                          <div className="text-[7px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                            <Sparkles size={6} /> PDF
                          </div>
                          <div className="text-[7px] font-bold text-green-700 bg-green-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                            <Sparkles size={6} /> Excel
                          </div>
                        </motion.div>
                      )}
                    </div>
                    <div className="p-3 space-y-2">
                      <div className="grid grid-cols-3 gap-1.5">
                        {['Scanned', 'Flagged', 'Score'].map((l, i) => (
                          <div key={l} className="bg-surface-2 rounded-lg p-1.5 text-center">
                            <div className={`text-[11px] font-bold font-mono ${i === 1 ? 'text-orange-500' : i === 2 ? 'text-green-500' : 'text-text'}`}>
                              {i === 0 ? '1.2K' : i === 1 ? '8' : '95'}
                            </div>
                            <div className="text-[7px] text-text-muted uppercase">{l}</div>
                          </div>
                        ))}
                      </div>
                      <div className="rounded-lg border border-border-light overflow-hidden">
                        <div className={`grid gap-0 bg-surface-2 px-2 py-1 ${hasSeverityColors ? 'grid-cols-5' : 'grid-cols-4'}`}>
                          {['ID', 'Invoice', 'Match', ...(hasSeverityColors ? ['Severity'] : []), 'Status'].map(h => (
                            <div key={h} className={`text-[7px] font-bold uppercase ${h === 'Severity' ? 'text-primary/60' : 'text-text-muted/40'}`}>{h}</div>
                          ))}
                        </div>
                        {[1, 2, 3].map(r => (
                          <div key={r} className={`grid gap-0 px-2 py-1.5 border-t border-border-light ${hasSeverityColors ? 'grid-cols-5' : 'grid-cols-4'}`}>
                            <div className="h-1.5 w-5 bg-text-muted/10 rounded" />
                            <div className="h-1.5 w-10 bg-text-muted/10 rounded" />
                            <div className={`h-1.5 w-7 rounded ${r === 1 ? 'bg-red-200' : r === 2 ? 'bg-orange-200' : 'bg-green-200'}`} />
                            {/* Severity column — only when enhancement applied */}
                            {hasSeverityColors && (
                              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center">
                                <div className={`h-3 px-1 rounded text-[5px] font-bold flex items-center ${
                                  r === 1 ? 'bg-red-100 text-red-700' : r === 2 ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                                }`}>
                                  {r === 1 ? 'HIGH' : r === 2 ? 'MED' : 'LOW'}
                                </div>
                              </motion.div>
                            )}
                            <div className="h-1.5 w-7 bg-text-muted/10 rounded" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhancement summary */}
                {hasEnhancements ? (
                  <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="mt-3 flex items-start gap-2 rounded-lg p-2.5 bg-green-50 border border-green-200">
                    <CheckCircle size={11} className="text-green-600 shrink-0 mt-0.5" />
                    <div className="text-[10.5px] text-green-800 leading-relaxed">
                      <span className="font-semibold">UI Enhanced:</span>{' '}
                      {uiEnhancements.join(' · ')}
                    </div>
                  </motion.div>
                ) : (
                  <div className="mt-3 flex items-start gap-2 rounded-lg p-2.5 bg-primary-xlight/50 border border-primary/10">
                    <Sparkles size={11} className="text-primary shrink-0 mt-0.5" />
                    <div className="text-[10.5px] text-text-secondary leading-relaxed">
                      <span className="font-semibold text-primary">AI recommended:</span>{' '}
                      Standard layout with KPI cards and results table.
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Actions — only show when complete */}
          {isComplete && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex gap-3 justify-center pb-2">
              <button className="flex items-center gap-1.5 px-5 py-2.5 border border-border rounded-xl text-[12px] font-medium text-text-secondary hover:bg-white transition-colors cursor-pointer">
                <Play size={13} /> Test Run
              </button>
              <NoiseButton containerClassName="rounded-xl" gradientColors={['rgb(106, 18, 205)', 'rgb(155, 89, 214)', 'rgb(192, 132, 252)']}>
                <span className="flex items-center gap-1.5 px-5 py-2.5 text-white text-[12px] font-semibold cursor-pointer" onClick={handleSave}>
                  <Save size={13} /> Save Workflow
                </span>
              </NoiseButton>
            </motion.div>
          )}

          {/* Building indicator when in progress */}
          {isBuilding && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center py-6">
              <div className="flex items-center gap-2 text-[12px] text-primary font-medium">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}>
                  <Sparkles size={14} />
                </motion.div>
                Waiting for next input from chat...
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
