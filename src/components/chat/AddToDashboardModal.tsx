import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, BarChart3, Plus, Check, LayoutGrid,
  ChevronRight, Search, Users,
} from 'lucide-react';
import { SectionHeader, Checkbox, KpiPreviewRow, ChartPreviewRow, TablePreviewRow, toggleIn, setAll } from './WidgetPickerParts';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DashboardOption {
  id: string;
  name: string;
  description: string;
  accent: string;
  sharedBy?: string;
}

export interface AuditResultData {
  kpis: { label: string; value: string; color: string }[];
  charts: { id: string; label: string; data: { bucket: string; count: number; tone: string }[] }[];
  table: { columns: string[]; rows: string[][] };
}

export interface GranularSelection {
  kpis: string[];     // selected kpi labels
  charts: string[];   // selected chart ids
  columns: string[];  // selected column names
}

interface AddToDashboardModalProps {
  open: boolean;
  onClose: () => void;
  dashboards: DashboardOption[];
  /** IDs of dashboards this result is already added to */
  alreadyAddedIds?: string[];
  /** The actual result data — drives granular picker */
  resultData: AuditResultData;
  onConfirm: (payload: {
    dashboardId: string;
    dashboardName: string;
    isNew: boolean;
    newName?: string;
    newDescription?: string;
    selection: GranularSelection;
  }) => void;
}

// ─── Shared components imported from WidgetPickerParts.tsx ─────────────────────

// ─── Component ────────────────────────────────────────────────────────────────

export function AddToDashboardModal({
  open, onClose, dashboards, alreadyAddedIds = [], resultData, onConfirm,
}: AddToDashboardModalProps) {
  const [step, setStep] = useState<'pick' | 'widgets'>('pick');
  const [mode, setMode] = useState<'existing' | 'new'>('existing');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  // Granular selections — initialised from resultData
  const [selKpis, setSelKpis] = useState<Set<string>>(new Set((resultData?.kpis || []).map(k => k.label)));
  const [selCharts, setSelCharts] = useState<Set<string>>(new Set((resultData?.charts || []).map(c => c.id)));
  const [selCols, setSelCols] = useState<Set<string>>(new Set(resultData?.table?.columns || []));

  // Collapsed sections
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const reset = () => {
    setStep('pick');
    setMode('existing');
    setSelectedId(null);
    setSearch('');
    setNewName('');
    setNewDesc('');
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
    const dashboardId = isNew ? `custom-${Date.now()}` : selectedId!;
    const dashboardName = isNew ? newName.trim() : dashboards.find(d => d.id === selectedId)?.name || '';
    onConfirm({
      dashboardId,
      dashboardName,
      isNew,
      newName: isNew ? newName.trim() : undefined,
      newDescription: isNew ? newDesc.trim() : undefined,
      selection: {
        kpis: [...selKpis],
        charts: [...selCharts],
        columns: [...selCols],
      },
    });
    handleClose();
  };

  // Toggle helpers
  // Split dashboards into my + shared
  const myDashboards = useMemo(() => dashboards.filter(d => !d.sharedBy), [dashboards]);
  const sharedDashboards = useMemo(() => dashboards.filter(d => !!d.sharedBy), [dashboards]);

  const filterList = (list: DashboardOption[]) =>
    list.filter(d => d.name.toLowerCase().includes(search.toLowerCase()));

  if (!open) return null;

  const renderDashboardRow = (d: DashboardOption) => {
    const alreadyAdded = alreadyAddedIds.includes(d.id);
    return (
      <button
        key={d.id}
        disabled={alreadyAdded}
        onClick={() => !alreadyAdded && setSelectedId(d.id)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all text-left ${
          alreadyAdded
            ? 'border-canvas-border bg-paper-50 opacity-60 cursor-not-allowed'
            : selectedId === d.id
              ? 'border-brand-300 bg-brand-50/50 ring-1 ring-brand-200 cursor-pointer'
              : 'border-canvas-border hover:border-brand-200 hover:bg-paper-50 cursor-pointer'
        }`}
      >
        <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${d.accent || 'bg-brand-50 text-brand-700'}`}>
          {d.sharedBy ? <Users size={14} /> : <LayoutGrid size={14} />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-medium text-ink-800 truncate">{d.name}</div>
          <div className="text-[11px] text-ink-500 truncate">
            {d.sharedBy ? `Shared by ${d.sharedBy}` : d.description}
          </div>
        </div>
        {alreadyAdded ? (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-brand-50 text-brand-600 shrink-0">
            Already added
          </span>
        ) : selectedId === d.id ? (
          <div className="w-5 h-5 rounded-full bg-brand-600 flex items-center justify-center shrink-0">
            <Check size={12} className="text-white" />
          </div>
        ) : null}
      </button>
    );
  };

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
              <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
                <BarChart3 size={15} className="text-brand-700" />
              </div>
              <div>
                <h2 className="text-[15px] font-semibold text-ink-800">
                  {step === 'pick' ? 'Add to Dashboard' : 'Choose What to Add'}
                </h2>
                <p className="text-[11px] text-ink-500">
                  {step === 'pick' ? 'Choose a dashboard or create a new one' : 'Select individual KPIs, charts, and columns'}
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
                    Existing Dashboard
                  </button>
                  <button
                    onClick={() => setMode('new')}
                    className={`flex-1 text-[12px] font-semibold py-1.5 rounded-md transition-all cursor-pointer ${
                      mode === 'new' ? 'bg-white text-ink-800 shadow-sm' : 'text-ink-500 hover:text-ink-700'
                    }`}
                  >
                    <Plus size={12} className="inline mr-1 -mt-0.5" />
                    Create New
                  </button>
                </div>

                {mode === 'existing' ? (
                  <div className="space-y-3">
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                      <input
                        type="text" value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search dashboards..."
                        className="w-full h-9 pl-9 pr-3 rounded-lg border border-canvas-border bg-white text-[13px] text-ink-800 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-300 transition-all"
                      />
                    </div>

                    <div className="space-y-1.5 max-h-[320px] overflow-y-auto">
                      {/* My dashboards */}
                      {filterList(myDashboards).length > 0 && (
                        <>
                          <p className="text-[10px] font-bold text-ink-400 uppercase tracking-wider px-1 pt-1">My Dashboards</p>
                          {filterList(myDashboards).map(renderDashboardRow)}
                        </>
                      )}
                      {/* Shared dashboards */}
                      {filterList(sharedDashboards).length > 0 && (
                        <>
                          <p className="text-[10px] font-bold text-ink-400 uppercase tracking-wider px-1 pt-3">Shared with me</p>
                          {filterList(sharedDashboards).map(renderDashboardRow)}
                        </>
                      )}
                      {filterList(dashboards).length === 0 && (
                        <p className="text-[12px] text-ink-500 text-center py-6">No dashboards found</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="text-[12px] font-medium text-ink-700 mb-1 block">Dashboard Name</label>
                      <input
                        type="text" value={newName} onChange={e => setNewName(e.target.value)}
                        placeholder="e.g. Duplicate Invoice Analysis"
                        className="w-full h-9 px-3 rounded-lg border border-canvas-border bg-white text-[13px] text-ink-800 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-300 transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[12px] font-medium text-ink-700 mb-1 block">Description <span className="text-ink-400 font-normal">(optional)</span></label>
                      <textarea
                        value={newDesc} onChange={e => setNewDesc(e.target.value)}
                        placeholder="What this dashboard tracks..." rows={2}
                        className="w-full px-3 py-2 rounded-lg border border-canvas-border bg-white text-[13px] text-ink-800 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-300 transition-all resize-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Step 2: Granular widget picker with previews */
              <div className="space-y-5">
                {/* KPI Cards */}
                {resultData.kpis.length > 0 && (
                  <div className="space-y-1.5">
                    <SectionHeader
                      title="KPI Cards"
                      count={selKpis.size}
                      total={resultData.kpis.length}
                      collapsed={!!collapsed.kpis}
                      onToggle={() => setCollapsed(c => ({ ...c, kpis: !c.kpis }))}
                      onToggleAll={(all) => setAll(resultData.kpis.map(k => k.label), all, setSelKpis)}
                    />
                    {!collapsed.kpis && (
                      <div className="grid grid-cols-2 gap-1.5 pl-1">
                        {resultData.kpis.map(kpi => (
                          <KpiPreviewRow
                            key={kpi.label}
                            kpi={kpi}
                            checked={selKpis.has(kpi.label)}
                            onChange={() => toggleIn(selKpis, kpi.label, setSelKpis)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Charts */}
                {resultData.charts.length > 0 && (
                  <div className="space-y-1.5">
                    <SectionHeader
                      title="Charts"
                      count={selCharts.size}
                      total={resultData.charts.length}
                      collapsed={!!collapsed.charts}
                      onToggle={() => setCollapsed(c => ({ ...c, charts: !c.charts }))}
                      onToggleAll={(all) => setAll(resultData.charts.map(c => c.id), all, setSelCharts)}
                    />
                    {!collapsed.charts && (
                      <div className="grid grid-cols-2 gap-1.5 pl-1">
                        {resultData.charts.map(chart => (
                          <ChartPreviewRow
                            key={chart.id}
                            chart={chart}
                            checked={selCharts.has(chart.id)}
                            onChange={() => toggleIn(selCharts, chart.id, setSelCharts)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Results Table */}
                {resultData.table.columns.length > 0 && (
                  <div className="space-y-1.5">
                    <SectionHeader
                      title="Results Table"
                      count={selCols.size}
                      total={resultData.table.columns.length}
                      collapsed={!!collapsed.columns}
                      onToggle={() => setCollapsed(c => ({ ...c, columns: !c.columns }))}
                      onToggleAll={(all) => setAll(resultData.table.columns, all, setSelCols)}
                    />
                    {!collapsed.columns && (
                      <div className="pl-1">
                        <TablePreviewRow
                          columns={resultData.table.columns}
                          sampleRows={resultData.table.rows || []}
                          checked={selCols.size > 0}
                          onChange={() => setAll(resultData.table.columns, selCols.size === 0, setSelCols)}
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
            {step === 'widgets' ? (
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
                  onClick={() => setStep('widgets')}
                  className="inline-flex items-center gap-1 h-8 px-3.5 rounded-md bg-brand-600 hover:bg-brand-700 text-white text-[12px] font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  Next <ChevronRight size={13} />
                </button>
              ) : (
                <button
                  disabled={totalSelected === 0}
                  onClick={handleConfirm}
                  className="inline-flex items-center gap-1 h-8 px-3.5 rounded-md bg-brand-600 hover:bg-brand-700 text-white text-[12px] font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <BarChart3 size={13} /> Add to Dashboard
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
