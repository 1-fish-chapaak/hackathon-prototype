import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, FileText, Plus, Check, ChevronRight, Search, Lock,
} from 'lucide-react';
import type { AuditResultData, GranularSelection } from './AddToDashboardModal';
import { SectionHeader, Checkbox, KpiPreviewRow, ChartPreviewRow, TablePreviewRow, toggleIn, setAll } from './WidgetPickerParts';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ReportOption {
  id: string;
  name: string;
  status: 'draft' | 'final';
  generatedBy?: string;
}

interface AddToReportModalProps {
  open: boolean;
  onClose: () => void;
  reports: ReportOption[];
  alreadyAddedIds?: string[];
  resultData: AuditResultData;
  onConfirm: (payload: {
    reportId: string;
    reportName: string;
    isNew: boolean;
    newName?: string;
    selection: GranularSelection;
  }) => void;
}

// ─── Shared components imported from WidgetPickerParts.tsx ─────────────────────

const ACCENT = 'violet' as const;

// ─── Component ────────────────────────────────────────────────────────────────

export function AddToReportModal({
  open, onClose, reports, alreadyAddedIds = [], resultData, onConfirm,
}: AddToReportModalProps) {
  const [step, setStep] = useState<'pick' | 'sections'>('pick');
  const [mode, setMode] = useState<'existing' | 'new'>('existing');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [newName, setNewName] = useState('');

  // Granular selections
  const [selKpis, setSelKpis] = useState<Set<string>>(new Set((resultData?.kpis || []).map(k => k.label)));
  const [selCharts, setSelCharts] = useState<Set<string>>(new Set((resultData?.charts || []).map(c => c.id)));
  const [selCols, setSelCols] = useState<Set<string>>(new Set(resultData?.table?.columns || []));
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const reset = () => {
    setStep('pick');
    setMode('existing');
    setSelectedId(null);
    setSearch('');
    setNewName('');
    setSelKpis(new Set((resultData?.kpis || []).map(k => k.label)));
    setSelCharts(new Set((resultData?.charts || []).map(c => c.id)));
    setSelCols(new Set(resultData?.table?.columns || []));
    setCollapsed({});
  };

  const handleClose = () => { reset(); onClose(); };

  const canProceed = mode === 'new' ? newName.trim().length > 0 : selectedId !== null;
  const totalSelected = selKpis.size + selCharts.size + selCols.size;

  const handleConfirm = () => {
    const isNew = mode === 'new';
    const reportId = isNew ? `report-${Date.now()}` : selectedId!;
    const reportName = isNew ? newName.trim() : reports.find(r => r.id === selectedId)?.name || '';
    onConfirm({
      reportId,
      reportName,
      isNew,
      newName: isNew ? newName.trim() : undefined,
      selection: { kpis: [...selKpis], charts: [...selCharts], columns: [...selCols] },
    });
    handleClose();
  };

  const filtered = reports.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.2 }}
          className="relative w-[640px] max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-canvas-border overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-canvas-border">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
                <FileText size={15} className="text-violet-700" />
              </div>
              <div>
                <h2 className="text-[15px] font-semibold text-ink-800">
                  {step === 'pick' ? 'Add to Report' : 'Choose What to Include'}
                </h2>
                <p className="text-[11px] text-ink-500">
                  {step === 'pick' ? 'Choose a draft report or create a new one' : 'Select individual KPIs, charts, and columns'}
                </p>
              </div>
            </div>
            <button onClick={handleClose} className="p-1.5 text-ink-400 hover:text-ink-600 rounded-md hover:bg-paper-50 transition-colors cursor-pointer">
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {step === 'pick' ? (
              <div className="space-y-4">
                {/* Mode toggle */}
                <div className="flex gap-1.5 p-1 bg-paper-50 rounded-lg">
                  <button
                    onClick={() => setMode('existing')}
                    className={`flex-1 text-[12px] font-semibold py-1.5 rounded-md transition-all cursor-pointer ${
                      mode === 'existing' ? 'bg-white text-ink-800 shadow-sm' : 'text-ink-500 hover:text-ink-700'
                    }`}
                  >
                    Existing Report
                  </button>
                  <button
                    onClick={() => setMode('new')}
                    className={`flex-1 text-[12px] font-semibold py-1.5 rounded-md transition-all cursor-pointer ${
                      mode === 'new' ? 'bg-white text-ink-800 shadow-sm' : 'text-ink-500 hover:text-ink-700'
                    }`}
                  >
                    <Plus size={12} className="inline mr-1 -mt-0.5" />
                    New Draft
                  </button>
                </div>

                {mode === 'existing' ? (
                  <div className="space-y-3">
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                      <input
                        type="text" value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search reports..."
                        className="w-full h-9 pl-9 pr-3 rounded-lg border border-canvas-border bg-white text-[13px] text-ink-800 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-300 transition-all"
                      />
                    </div>

                    <div className="space-y-1.5 max-h-[320px] overflow-y-auto">
                      {filtered.length === 0 ? (
                        <p className="text-[12px] text-ink-500 text-center py-6">No reports found</p>
                      ) : (
                        filtered.map(r => {
                          const isFinal = r.status === 'final';
                          const alreadyAdded = alreadyAddedIds.includes(r.id);
                          const disabled = isFinal || alreadyAdded;
                          return (
                            <button
                              key={r.id}
                              disabled={disabled}
                              onClick={() => !disabled && setSelectedId(r.id)}
                              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all text-left ${
                                disabled
                                  ? 'border-canvas-border bg-paper-50 opacity-60 cursor-not-allowed'
                                  : selectedId === r.id
                                    ? 'border-violet-300 bg-violet-50/50 ring-1 ring-violet-200 cursor-pointer'
                                    : 'border-canvas-border hover:border-violet-200 hover:bg-paper-50 cursor-pointer'
                              }`}
                            >
                              <div className="w-8 h-8 rounded-md bg-violet-50 flex items-center justify-center shrink-0">
                                {isFinal ? <Lock size={14} className="text-ink-400" /> : <FileText size={14} className="text-violet-700" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-[13px] font-medium text-ink-800 truncate">{r.name}</div>
                                <div className="text-[11px] text-ink-500">
                                  {r.status === 'draft' ? 'Draft' : 'Final (locked)'}
                                  {r.generatedBy && ` by ${r.generatedBy}`}
                                </div>
                              </div>
                              {alreadyAdded ? (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-violet-50 text-violet-600 shrink-0">
                                  Already added
                                </span>
                              ) : (
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                                  isFinal ? 'bg-ink-100 text-ink-500' : 'bg-amber-50 text-amber-700'
                                }`}>
                                  {isFinal ? 'Locked' : 'Draft'}
                                </span>
                              )}
                              {selectedId === r.id && !disabled && (
                                <div className="w-5 h-5 rounded-full bg-violet-600 flex items-center justify-center shrink-0">
                                  <Check size={12} className="text-white" />
                                </div>
                              )}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="text-[12px] font-medium text-ink-700 mb-1 block">Report Name</label>
                      <input
                        type="text" value={newName} onChange={e => setNewName(e.target.value)}
                        placeholder="e.g. FY26 Q1 — Duplicate Invoice Findings"
                        className="w-full h-9 px-3 rounded-lg border border-canvas-border bg-white text-[13px] text-ink-800 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-300 transition-all"
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Step 2: Granular section picker with previews */
              <div className="space-y-5">
                {resultData.kpis.length > 0 && (
                  <div className="space-y-1.5">
                    <SectionHeader
                      title="KPI Cards" count={selKpis.size} total={resultData.kpis.length}
                      collapsed={!!collapsed.kpis}
                      onToggle={() => setCollapsed(c => ({ ...c, kpis: !c.kpis }))}
                      onToggleAll={(all) => setAll(resultData.kpis.map(k => k.label), all, setSelKpis)}
                      accent={ACCENT}
                    />
                    {!collapsed.kpis && (
                      <div className="grid grid-cols-2 gap-1.5 pl-1">
                        {resultData.kpis.map(kpi => (
                          <KpiPreviewRow
                            key={kpi.label} kpi={kpi}
                            checked={selKpis.has(kpi.label)}
                            onChange={() => toggleIn(selKpis, kpi.label, setSelKpis)}
                            accent={ACCENT}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {resultData.charts.length > 0 && (
                  <div className="space-y-1.5">
                    <SectionHeader
                      title="Charts" count={selCharts.size} total={resultData.charts.length}
                      collapsed={!!collapsed.charts}
                      onToggle={() => setCollapsed(c => ({ ...c, charts: !c.charts }))}
                      onToggleAll={(all) => setAll(resultData.charts.map(c => c.id), all, setSelCharts)}
                      accent={ACCENT}
                    />
                    {!collapsed.charts && (
                      <div className="grid grid-cols-2 gap-1.5 pl-1">
                        {resultData.charts.map(chart => (
                          <ChartPreviewRow
                            key={chart.id} chart={chart}
                            checked={selCharts.has(chart.id)}
                            onChange={() => toggleIn(selCharts, chart.id, setSelCharts)}
                            accent={ACCENT}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {resultData.table.columns.length > 0 && (
                  <div className="space-y-1.5">
                    <SectionHeader
                      title="Results Table" count={selCols.size} total={resultData.table.columns.length}
                      collapsed={!!collapsed.columns}
                      onToggle={() => setCollapsed(c => ({ ...c, columns: !c.columns }))}
                      onToggleAll={(all) => setAll(resultData.table.columns, all, setSelCols)}
                      accent={ACCENT}
                    />
                    {!collapsed.columns && (
                      <div className="pl-1">
                        <TablePreviewRow
                          columns={resultData.table.columns}
                          sampleRows={resultData.table.rows || []}
                          checked={selCols.size > 0}
                          onChange={() => setAll(resultData.table.columns, selCols.size === 0, setSelCols)}
                          accent={ACCENT}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-canvas-border bg-paper-50/50">
            {step === 'sections' ? (
              <button onClick={() => setStep('pick')} className="text-[12px] font-medium text-ink-500 hover:text-ink-700 cursor-pointer">
                Back
              </button>
            ) : <div />}
            <div className="flex items-center gap-2">
              <button onClick={handleClose} className="h-8 px-3 rounded-md text-[12px] font-semibold text-ink-600 hover:bg-paper-100 transition-colors cursor-pointer">
                Cancel
              </button>
              {step === 'pick' ? (
                <button
                  disabled={!canProceed}
                  onClick={() => setStep('sections')}
                  className="inline-flex items-center gap-1 h-8 px-3.5 rounded-md bg-violet-600 hover:bg-violet-700 text-white text-[12px] font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  Next <ChevronRight size={13} />
                </button>
              ) : (
                <button
                  disabled={totalSelected === 0}
                  onClick={handleConfirm}
                  className="inline-flex items-center gap-1 h-8 px-3.5 rounded-md bg-violet-600 hover:bg-violet-700 text-white text-[12px] font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <FileText size={13} /> Add to Report
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
