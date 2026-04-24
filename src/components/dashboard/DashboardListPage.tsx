import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, Clock, Plus, ChevronDown, LayoutGrid, MoreVertical,
  Trash2, Check, Download, Share2, X, MessageSquare, Upload, Database, CloudUpload
} from 'lucide-react';
import { useToast } from '../shared/Toast';

// ─── Types ──────────────────────────────────────────────────────────────────

interface Dashboard {
  id: string;
  name: string;
  description: string;
  timeAgo: string;
  creator: string;
  accent: string;
  sharedBy?: string;
}

type SortOption = 'recently' | 'oldest' | 'nameAZ' | 'nameZA';

interface DashboardListPageProps {
  onDashboardClick: (dashboardId: string, customFields?: string[]) => void;
  onImportPowerBI?: () => void;
  createdDashboards?: Dashboard[];
  onCreateDashboard?: (dashboard: Dashboard) => void;
  onDeleteDashboard?: (id: string) => void;
}

// ─── Data ───────────────────────────────────────────────────────────────────

const MY_DASHBOARDS: Dashboard[] = [
  {
    id: 'p2p',
    name: 'Procurement (P2P)',
    description: 'Procure-to-Pay analytics — invoice processing, duplicate flags, compliance rate, and vendor spend tracking.',
    timeAgo: '2 hours ago',
    creator: 'You',
    accent: 'bg-brand-50 text-brand-700',
  },
  {
    id: 'grc',
    name: 'GRC Overview',
    description: 'Governance, risk & compliance — total risks, controls tested, deficiencies, and workflow automation.',
    timeAgo: '3 hours ago',
    creator: 'You',
    accent: 'bg-brand-50 text-brand-700',
  },
  {
    id: 'o2c',
    name: 'Order to Cash (O2C)',
    description: 'Revenue & collections overview — orders fulfilled, revenue recognized, DSO, and customer insights.',
    timeAgo: '5 hours ago',
    creator: 'You',
    accent: 'bg-brand-50 text-brand-700',
  },
  {
    id: 's2c',
    name: 'Source to Contract (S2C)',
    description: 'Sourcing & contract management — active contracts, vendor scores, savings realized, and expiry tracking.',
    timeAgo: '1 day ago',
    creator: 'You',
    accent: 'bg-brand-50 text-brand-700',
  },
];

const SHARED_DASHBOARDS: Dashboard[] = [
  {
    id: 'shared-1',
    name: 'Vendor Risk Assessment',
    description: 'Evaluation of vendor risk profiles across all business units.',
    timeAgo: '4 hours ago',
    creator: 'Sarah Johnson',
    accent: 'bg-brand-50 text-brand-700',
    sharedBy: 'Sarah Johnson',
  },
  {
    id: 'shared-2',
    name: 'SOX Compliance Tracker',
    description: 'End-to-end SOX compliance progress and control testing status.',
    timeAgo: '1 day ago',
    creator: 'Michael Chen',
    accent: 'bg-brand-50 text-brand-700',
    sharedBy: 'Michael Chen',
  },
  {
    id: 'shared-3',
    name: 'AP Duplicate Detection',
    description: 'Automated duplicate invoice detection across accounts payable.',
    timeAgo: '2 days ago',
    creator: 'David Martinez',
    accent: 'bg-brand-50 text-brand-700',
    sharedBy: 'David Martinez',
  },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

function parseTimeAgo(timeAgo: string): number {
  const match = timeAgo.match(/(\d+)\s*(minute|hour|day)/);
  if (!match) return 0;
  const value = parseInt(match[1]);
  const unit = match[2];
  if (unit === 'day') return value * 1440;
  if (unit === 'hour') return value * 60;
  return value;
}

const SORT_LABELS: Record<SortOption, string> = {
  recently: 'Recently Updated',
  oldest: 'Oldest Updated',
  nameAZ: 'Name A–Z',
  nameZA: 'Name Z–A',
};

// ─── Component ──────────────────────────────────────────────────────────────

// ─── Query data ─────────────────────────────────────────────────────────────

const QUERY_SESSIONS = [
  { group: 'TODAY', items: [
    'What are the top 5 performing categories?',
    'Compare year-over-year growth across all states',
  ]},
  { group: 'YESTERDAY', items: [
    'Show customer acquisition cost by channel',
    'What is the average order value by product category?',
  ]},
  { group: 'LAST 7 DAYS', items: [
    'Analyze revenue trends for the last 12 months',
    'Which sales person has the highest conversion rate?',
    'Show me the distribution of products across different regions',
    'What is the total revenue by country?',
    'Compare Q1 vs Q2 performance metrics',
  ]},
];

// ─── Create Dashboard Modal ─────────────────────────────────────────────────

type CreateStep = 'details' | 'source' | 'query' | 'upload' | 'navigator';

function CreateDashboardModal({ open, onClose, onCreate }: {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string, description: string, customFields?: string[]) => void;
}) {
  const [step, setStep] = useState<CreateStep>('details');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedSource, setSelectedSource] = useState<'query' | 'upload' | 'sql' | null>(null);
  const [querySearch, setQuerySearch] = useState('');
  const [selectedQuery, setSelectedQuery] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [selectedSheets, setSelectedSheets] = useState<string[]>(['Sheet 1']);
  const [activeSheet, setActiveSheet] = useState('Sheet 1');
  const [parsedHeaders, setParsedHeaders] = useState<string[]>([]);
  const [parsedRows, setParsedRows] = useState<string[][]>([]);
  const [sheetNames, setSheetNames] = useState<string[]>(['Sheet 1']);

  // Reset on open
  if (!open) return null;

  const handleClose = () => {
    setStep('details');
    setName('');
    setDescription('');
    setSelectedSource(null);
    setQuerySearch('');
    setSelectedQuery(null);
    setUploadedFile(null);
    setDragging(false);
    onClose();
  };

  const handleCreate = (withFields?: boolean) => {
    onCreate(name, description, withFields ? parsedHeaders : undefined);
    handleClose();
  };

  const stepLabels: Record<CreateStep, string> = { details: 'Step 1 of 3', source: 'Step 2 of 3', query: 'Step 3 of 3', upload: 'Step 3 of 3', navigator: '' };
  const stepTitles: Record<CreateStep, string> = { details: 'Dashboard Details', source: 'Choose Data Source', query: 'Select Query', upload: 'Upload Dataset', navigator: 'Navigator' };
  const stepLabel = stepLabels[step];
  const stepTitle = stepTitles[step];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          onClick={handleClose}
        >
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.2 }}
            className={`relative bg-canvas-elevated rounded-2xl border border-canvas-border shadow-2xl flex flex-col overflow-hidden max-h-[85vh] ${
              step === 'navigator' ? 'w-[1100px]' : 'w-[680px]'
            }`}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-7 py-5 border-b border-canvas-border">
              <div>
                <h2 className="text-[16px] font-bold text-ink-900">{stepTitle}</h2>
                <p className="text-[12px] text-ink-500 mt-0.5">{stepLabel}</p>
              </div>
              <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-surface-2 transition-colors cursor-pointer">
                <X size={20} className="text-ink-400" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-7 py-6">
              <AnimatePresence mode="wait">
                {/* ── Step 1: Details ── */}
                {step === 'details' && (
                  <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.15 }} className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-[13px] font-bold text-ink-800">Dashboard Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="e.g., Q3 Financial Overview"
                        autoFocus
                        className="w-full px-4 py-3 text-[14px] border-2 border-canvas-border rounded-xl text-ink-800 placeholder:text-ink-400 outline-none focus:border-brand-500 transition-colors bg-canvas-elevated"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[13px] font-bold text-ink-800">
                        Description <span className="font-normal text-ink-400">(Optional)</span>
                      </label>
                      <textarea
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="Briefly describe the purpose of this dashboard..."
                        rows={4}
                        className="w-full px-4 py-3 text-[14px] border border-canvas-border rounded-xl text-ink-800 placeholder:text-ink-400 outline-none focus:border-brand-400 transition-colors bg-canvas-elevated resize-none"
                      />
                    </div>
                  </motion.div>
                )}

                {/* ── Step 2: Choose Data Source ── */}
                {step === 'source' && (
                  <motion.div key="source" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.15 }}>
                    <p className="text-[14px] text-ink-600 mb-5">How would you like to populate your dashboard?</p>
                    <div className="grid grid-cols-3 gap-4">
                      {/* Start from Query */}
                      <button
                        onClick={() => setSelectedSource('query')}
                        className={`flex flex-col items-start p-5 rounded-xl border-2 transition-all cursor-pointer text-left ${
                          selectedSource === 'query' ? 'border-brand-500 bg-brand-50/50' : 'border-canvas-border bg-canvas-elevated hover:border-brand-200'
                        }`}
                      >
                        <div className="size-10 rounded-xl bg-brand-100 flex items-center justify-center mb-4">
                          <MessageSquare size={18} className="text-brand-600" />
                        </div>
                        <span className="text-[13px] font-bold text-ink-900 mb-1">Start from Query</span>
                        <span className="text-[11px] text-ink-500 leading-relaxed">Create a dashboard from an existing Q&A session.</span>
                      </button>

                      {/* Choose your data source */}
                      <button
                        onClick={() => setSelectedSource('upload')}
                        className={`flex flex-col items-start p-5 rounded-xl border-2 transition-all cursor-pointer text-left ${
                          selectedSource === 'upload' ? 'border-brand-500 bg-brand-50/50' : 'border-canvas-border bg-canvas-elevated hover:border-brand-200'
                        }`}
                      >
                        <div className="size-10 rounded-xl bg-green-100 flex items-center justify-center mb-4">
                          <Upload size={18} className="text-green-600" />
                        </div>
                        <span className="text-[13px] font-bold text-ink-900 mb-1">Choose your data source</span>
                        <span className="text-[11px] text-ink-500 leading-relaxed">Upload a file from your computer or select an existing dataset to get started.</span>
                      </button>

                      {/* Connect SQL Server — Coming Soon */}
                      <div className="flex flex-col items-start p-5 rounded-xl border-2 border-canvas-border bg-surface-2/50 opacity-60 relative">
                        <span className="absolute top-3 right-3 text-[10px] font-bold text-ink-400 bg-surface-2 px-2 py-0.5 rounded-full">Coming Soon</span>
                        <div className="size-10 rounded-xl bg-surface-2 flex items-center justify-center mb-4">
                          <Database size={18} className="text-ink-400" />
                        </div>
                        <span className="text-[13px] font-bold text-ink-500 mb-1">Connect SQL Server</span>
                        <span className="text-[11px] text-ink-400 leading-relaxed">Connect directly to your SQL database for real-time data sync.</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ── Step 3A: Select Query ── */}
                {step === 'query' && (
                  <motion.div key="query" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.15 }}>
                    {/* Search + New Query */}
                    <div className="flex items-center gap-3 mb-5">
                      <div className="flex-1 relative">
                        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
                        <input
                          type="text"
                          value={querySearch}
                          onChange={e => setQuerySearch(e.target.value)}
                          placeholder="Search query sessions"
                          className="w-full pl-10 pr-4 py-2.5 text-[13px] border border-canvas-border rounded-xl bg-canvas-elevated text-ink-800 placeholder:text-ink-400 outline-none focus:border-brand-400 transition-colors"
                        />
                      </div>
                      <button className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-[13px] font-semibold rounded-xl transition-colors cursor-pointer">
                        New Query
                      </button>
                    </div>

                    {/* Query list */}
                    <div className="space-y-4 max-h-[400px] overflow-y-auto">
                      {QUERY_SESSIONS.map(group => {
                        const filtered = group.items.filter(q => q.toLowerCase().includes(querySearch.toLowerCase()));
                        if (filtered.length === 0) return null;
                        return (
                          <div key={group.group}>
                            <div className="text-[11px] font-bold text-ink-500 uppercase tracking-wider mb-2">{group.group}</div>
                            <div className="space-y-2">
                              {filtered.map(q => (
                                <button
                                  key={q}
                                  onClick={() => setSelectedQuery(q)}
                                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all cursor-pointer text-left ${
                                    selectedQuery === q ? 'border-brand-500 bg-brand-50' : 'border-canvas-border bg-canvas-elevated hover:border-brand-200'
                                  }`}
                                >
                                  <MessageSquare size={14} className={selectedQuery === q ? 'text-brand-600' : 'text-ink-400'} />
                                  <span className={`text-[13px] ${selectedQuery === q ? 'text-brand-700 font-medium' : 'text-ink-700'}`}>{q}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* ── Step 3B: Upload Dataset ── */}
                {step === 'upload' && (
                  <motion.div key="upload" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.15 }}>
                    <input
                      id="create-dash-file-input"
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      className="hidden"
                      onChange={e => { const f = e.target.files?.[0]; if (f) setUploadedFile(f); }}
                    />
                    <div
                      onDragOver={e => { e.preventDefault(); setDragging(true); }}
                      onDragLeave={() => setDragging(false)}
                      onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) setUploadedFile(f); }}
                      onClick={() => !uploadedFile && document.getElementById('create-dash-file-input')?.click()}
                      className={`border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center text-center transition-all ${
                        dragging
                          ? 'border-brand-500 bg-brand-50'
                          : uploadedFile
                            ? 'border-compliant bg-green-50/30 cursor-default'
                            : 'border-brand-300 bg-brand-50/30 cursor-pointer hover:border-brand-400 hover:bg-brand-50/50'
                      }`}
                    >
                      <div className={`size-16 rounded-full flex items-center justify-center mb-5 shadow-sm ${
                        uploadedFile ? 'bg-green-100' : 'bg-white border border-canvas-border'
                      }`}>
                        <CloudUpload size={28} className={uploadedFile ? 'text-green-600' : 'text-brand-500'} />
                      </div>

                      {uploadedFile ? (
                        <div>
                          <h3 className="text-[15px] font-bold text-ink-900 mb-1">{uploadedFile.name}</h3>
                          <p className="text-[13px] text-compliant font-medium mb-1">
                            {(uploadedFile.size / 1024).toFixed(1)} KB — File ready to upload
                          </p>
                          <button
                            onClick={e => { e.stopPropagation(); setUploadedFile(null); }}
                            className="text-[12px] text-ink-400 hover:text-red-500 transition-colors cursor-pointer mt-1"
                          >
                            Remove file
                          </button>
                        </div>
                      ) : (
                        <>
                          <h3 className="text-[15px] font-bold text-ink-900 mb-2">Upload Dataset</h3>
                          <p className="text-[13px] text-ink-500 mb-6 max-w-[360px]">
                            Drag and drop your .xlsx or .csv file here, or click to browse.
                          </p>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={e => e.stopPropagation()}
                              className="px-5 py-2.5 border-2 border-brand-500 text-brand-600 text-[13px] font-semibold rounded-xl hover:bg-brand-50 transition-colors cursor-pointer"
                            >
                              Choose Existing
                            </button>
                            <button
                              onClick={e => { e.stopPropagation(); document.getElementById('create-dash-file-input')?.click(); }}
                              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-[13px] font-semibold rounded-xl transition-colors cursor-pointer"
                            >
                              Browse Files
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* ── Step 4: Navigator — real parsed data ── */}
                {step === 'navigator' && (
                  <motion.div key="navigator" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.15 }} className="flex gap-0 -mx-7 -my-6" style={{ height: '520px' }}>
                    {/* Left sidebar — file tree */}
                    <div className="w-[280px] shrink-0 border-r border-canvas-border flex flex-col overflow-hidden">
                      <div className="px-4 pt-4 pb-3 shrink-0">
                        <div className="relative">
                          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                          <input type="text" placeholder="Search" className="w-full pl-9 pr-3 py-2 text-[13px] border border-canvas-border rounded-lg bg-canvas-elevated text-ink-800 placeholder:text-ink-400 outline-none focus:border-brand-400" />
                        </div>
                      </div>
                      <div className="flex-1 overflow-y-auto px-4 pb-4">
                        {/* Uploaded file */}
                        <div className="mb-2">
                          <div className="flex items-center gap-2 py-1.5 cursor-pointer">
                            <ChevronDown size={14} className="text-ink-400" />
                            <LayoutGrid size={14} className="text-brand-600" />
                            <span className="text-[12px] font-medium text-brand-700 truncate max-w-[180px] block" title={uploadedFile?.name}>{uploadedFile?.name || 'Uploaded_Data.xlsx'}</span>
                          </div>
                          <div className="pl-6 space-y-0.5">
                            {sheetNames.map(sheet => {
                              const isSelected = selectedSheets.includes(sheet);
                              return (
                                <button
                                  key={sheet}
                                  onClick={() => {
                                    setActiveSheet(sheet);
                                    setSelectedSheets(prev => prev.includes(sheet) ? prev.filter(s => s !== sheet) : [...prev, sheet]);
                                  }}
                                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                                    activeSheet === sheet ? 'bg-brand-50 text-brand-700' : 'text-ink-700 hover:bg-surface-2'
                                  }`}
                                >
                                  <div className={`size-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'bg-brand-600 border-brand-600' : 'border-ink-300 bg-white'}`}>
                                    {isSelected && <svg viewBox="0 0 12 12" fill="none" className="size-2.5"><path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                                  </div>
                                  <LayoutGrid size={13} className="text-ink-400 shrink-0" />
                                  <span className="text-[12px] truncate" title={sheet}>{sheet}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right — real data preview table with both scrolls */}
                    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                      <div className="px-5 py-3 border-b border-canvas-border shrink-0">
                        <span className="text-[14px] font-semibold text-ink-900">{activeSheet}</span>
                        <span className="text-[12px] text-ink-500 ml-2">({parsedRows.length} rows)</span>
                      </div>
                      <div className="flex-1 overflow-auto">
                        {parsedHeaders.length > 0 ? (
                          <table className="text-left" style={{ minWidth: `${parsedHeaders.length * 180}px` }}>
                            <thead className="sticky top-0 bg-brand-50/70 z-10">
                              <tr>
                                {parsedHeaders.map((h, i) => (
                                  <th key={i} className="text-[11px] font-bold text-brand-800 uppercase tracking-wider px-5 py-3 border-b border-brand-200 whitespace-nowrap">{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {parsedRows.map((row, i) => (
                                <tr key={i} className="border-b border-canvas-border/50 hover:bg-brand-50/20 transition-colors">
                                  {row.map((cell, j) => (
                                    <td key={j} className={`px-5 py-2.5 text-[13px] whitespace-nowrap ${j === 0 ? 'font-semibold text-ink-900' : 'text-ink-700'}`}>{cell}</td>
                                  ))}
                                  {/* Pad if row has fewer cells than headers */}
                                  {row.length < parsedHeaders.length && Array.from({ length: parsedHeaders.length - row.length }).map((_, k) => (
                                    <td key={`pad-${k}`} className="px-5 py-2.5 text-[13px] text-ink-400">—</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <div className="flex items-center justify-center h-full text-ink-400">
                            <p className="text-[13px]">No data to preview. Upload a CSV or XLSX file.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-7 py-4 border-t border-canvas-border">
              {step === 'details' && (
                <button
                  onClick={() => { if (name.trim()) setStep('source'); }}
                  disabled={!name.trim()}
                  className={`px-6 py-2.5 rounded-xl text-[13px] font-semibold transition-colors cursor-pointer ${
                    name.trim() ? 'bg-brand-600 hover:bg-brand-500 text-white' : 'bg-ink-100 text-ink-400 cursor-not-allowed'
                  }`}
                >
                  Next Step
                </button>
              )}
              {step === 'source' && (
                <>
                  <button onClick={() => setStep('details')} className="px-5 py-2.5 text-[13px] font-semibold text-ink-600 hover:text-ink-800 transition-colors cursor-pointer">
                    Back
                  </button>
                  <button
                    onClick={() => {
                      if (selectedSource === 'query') setStep('query');
                      else if (selectedSource === 'upload') setStep('upload');
                      else handleCreate();
                    }}
                    disabled={!selectedSource}
                    className={`px-6 py-2.5 rounded-xl text-[13px] font-semibold transition-colors cursor-pointer ${
                      selectedSource ? 'bg-brand-600 hover:bg-brand-500 text-white' : 'bg-ink-100 text-ink-400 cursor-not-allowed'
                    }`}
                  >
                    {selectedSource === 'query' || selectedSource === 'upload' ? 'Next Step' : 'Create Dashboard'}
                  </button>
                </>
              )}
              {step === 'query' && (
                <>
                  <button onClick={() => setStep('source')} className="px-5 py-2.5 text-[13px] font-semibold text-ink-600 hover:text-ink-800 transition-colors cursor-pointer">
                    Back
                  </button>
                  <button
                    onClick={() => handleCreate()}
                    disabled={!selectedQuery}
                    className={`px-6 py-2.5 rounded-xl text-[13px] font-semibold transition-colors cursor-pointer ${
                      selectedQuery ? 'bg-brand-600 hover:bg-brand-500 text-white' : 'bg-ink-100 text-ink-400 cursor-not-allowed'
                    }`}
                  >
                    Create Dashboard
                  </button>
                </>
              )}
              {step === 'upload' && (
                <>
                  <button onClick={() => { setUploadedFile(null); setStep('source'); }} className="px-5 py-2.5 text-[13px] font-semibold text-ink-600 hover:text-ink-800 transition-colors cursor-pointer">
                    Back
                  </button>
                  <button
                    onClick={() => {
                      if (uploadedFile) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                          const text = e.target?.result as string;
                          if (!text) return;
                          const lines = text.split('\n').filter(l => l.trim());
                          if (lines.length === 0) return;
                          // Parse CSV (handle quoted values)
                          const parseLine = (line: string) => {
                            const cells: string[] = [];
                            let current = '';
                            let inQuote = false;
                            for (const ch of line) {
                              if (ch === '"') { inQuote = !inQuote; }
                              else if (ch === ',' && !inQuote) { cells.push(current.trim()); current = ''; }
                              else { current += ch; }
                            }
                            cells.push(current.trim());
                            return cells;
                          };
                          const headers = parseLine(lines[0]);
                          const rows = lines.slice(1, 51).map(parseLine); // Max 50 rows
                          setParsedHeaders(headers);
                          setParsedRows(rows);
                          const fname = uploadedFile.name.replace(/\.[^.]+$/, '');
                          setSheetNames([fname]);
                          setActiveSheet(fname);
                          setSelectedSheets([fname]);
                        };
                        reader.readAsText(uploadedFile);
                      }
                      setStep('navigator');
                    }}
                    disabled={!uploadedFile}
                    className={`px-6 py-2.5 rounded-xl text-[13px] font-semibold transition-colors cursor-pointer ${
                      uploadedFile ? 'bg-brand-600 hover:bg-brand-500 text-white' : 'bg-ink-100 text-ink-400 cursor-not-allowed'
                    }`}
                  >
                    Review Data
                  </button>
                </>
              )}
              {step === 'navigator' && (
                <>
                  <span className="text-[12px] text-ink-500 mr-auto">{selectedSheets.length} sheet(s) selected</span>
                  <button onClick={() => setStep('upload')} className="px-5 py-2.5 text-[13px] font-semibold text-ink-600 hover:text-ink-800 transition-colors cursor-pointer border border-canvas-border rounded-xl">
                    Back
                  </button>
                  <button
                    onClick={() => handleCreate(true)}
                    className="px-8 py-2.5 rounded-xl text-[13px] font-semibold bg-brand-600 hover:bg-brand-500 text-white transition-colors cursor-pointer"
                  >
                    Load
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function DashboardListPage({ onDashboardClick, onImportPowerBI, createdDashboards = [], onCreateDashboard, onDeleteDashboard }: DashboardListPageProps) {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<'my' | 'shared'>('my');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('recently');
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const myDashboards = [...createdDashboards, ...MY_DASHBOARDS];
  const [sharedDashboards, setSharedDashboards] = useState(SHARED_DASHBOARDS);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const currentDashboards = activeTab === 'my' ? myDashboards : sharedDashboards;

  const filteredDashboards = currentDashboards
    .filter(d =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortOption) {
        case 'recently': return parseTimeAgo(a.timeAgo) - parseTimeAgo(b.timeAgo);
        case 'oldest': return parseTimeAgo(b.timeAgo) - parseTimeAgo(a.timeAgo);
        case 'nameAZ': return a.name.localeCompare(b.name);
        case 'nameZA': return b.name.localeCompare(a.name);
        default: return 0;
      }
    });

  const handleDelete = (id: string) => {
    if (activeTab === 'my') {
      onDeleteDashboard?.(id);
    } else {
      setSharedDashboards(prev => prev.filter(d => d.id !== id));
    }
    setDeleteConfirmId(null);
    setOpenMenuId(null);
    addToast({ message: 'Dashboard deleted', type: 'success' });
  };

  return (
    <div className="h-full overflow-y-auto bg-canvas">
      <div className="max-w-[1200px] mx-auto px-8 py-8">

        {/* ── Header ── */}
        <div className="mb-6">
          <div className="font-mono text-[12px] text-ink-500 mb-2">Intelligence · Dashboards</div>
          <div className="flex items-end justify-between">
            <div>
              <h1 className="font-display text-[34px] font-[420] text-ink-900 leading-[1.15]">Dashboards</h1>
              <p className="text-[13px] text-ink-500 mt-1">Manage and access all analytics dashboards</p>
            </div>
            <div className="flex items-center gap-2">
              {onImportPowerBI && (
                <button
                  onClick={onImportPowerBI}
                  className="flex items-center gap-2 px-3 h-10 border border-canvas-border bg-canvas-elevated rounded-md text-[13px] text-ink-700 hover:border-brand-200 transition-colors cursor-pointer"
                >
                  <Download size={14} />
                  Import Power BI
                </button>
              )}
              <button
                onClick={() => setCreateModalOpen(true)}
                className="flex items-center gap-2 px-4 h-10 bg-brand-600 hover:bg-brand-500 active:bg-brand-800 text-white rounded-md text-[13px] font-semibold transition-colors cursor-pointer"
              >
                <Plus size={14} />
                Create Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-6 border-b border-canvas-border mb-5">
          {(['my', 'shared'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-[13px] font-semibold relative transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === tab ? 'text-brand-700' : 'text-ink-500 hover:text-ink-700'
              }`}
            >
              {tab === 'my' ? 'My Dashboards' : 'Shared with Me'}
              {activeTab === tab && (
                <motion.div layoutId="dash-tab-underline" className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-600 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* ── Search & Sort ── */}
        <div className="flex items-center justify-between gap-4 mb-5">
          <div className="flex-1 max-w-sm relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              type="text"
              placeholder="Search dashboards..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-canvas-border rounded-md text-[13px] text-ink-800 placeholder:text-ink-400 bg-canvas-elevated focus:outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100 transition-all"
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setSortMenuOpen(!sortMenuOpen)}
              className="flex items-center gap-2 px-3 h-9 border border-canvas-border bg-canvas-elevated rounded-md text-[13px] text-ink-700 hover:border-brand-200 transition-colors cursor-pointer"
            >
              {SORT_LABELS[sortOption]}
              <ChevronDown size={14} />
            </button>
            {sortMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setSortMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-1 bg-canvas-elevated border border-canvas-border rounded-lg shadow-sm py-1 z-20 min-w-[180px]">
                  {(Object.keys(SORT_LABELS) as SortOption[]).map(option => (
                    <button
                      key={option}
                      onClick={() => { setSortOption(option); setSortMenuOpen(false); }}
                      className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-brand-50 text-[13px] text-ink-700 transition-colors cursor-pointer"
                    >
                      {sortOption === option ? <Check size={14} className="text-brand-600" /> : <div className="w-[14px]" />}
                      <span className={sortOption === option ? 'text-brand-700 font-medium' : ''}>{SORT_LABELS[option]}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Dashboard Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredDashboards.map((dashboard, i) => (
              <motion.div
                key={dashboard.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => onDashboardClick(dashboard.id)}
                className="glass-card rounded-xl p-5 cursor-pointer group relative flex flex-col"
              >
                {/* Context menu trigger */}
                <div className="absolute top-4 right-4 z-10">
                  <button
                    onClick={e => { e.stopPropagation(); setOpenMenuId(openMenuId === dashboard.id ? null : dashboard.id); }}
                    className="p-1 rounded-md hover:bg-brand-50 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                  >
                    <MoreVertical size={16} className="text-ink-500" />
                  </button>
                  {openMenuId === dashboard.id && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={e => { e.stopPropagation(); setOpenMenuId(null); }} />
                      <div className="absolute right-0 top-full mt-1 bg-canvas-elevated border border-canvas-border rounded-lg shadow-sm py-1 z-20 min-w-[140px]">
                        <button
                          onClick={e => { e.stopPropagation(); addToast({ message: 'Share modal opening.', type: 'info' }); setOpenMenuId(null); }}
                          className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-brand-50 text-[13px] text-ink-700 transition-colors cursor-pointer"
                        >
                          <Share2 size={14} /> Share
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); addToast({ message: 'Dashboard exported.', type: 'success' }); setOpenMenuId(null); }}
                          className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-brand-50 text-[13px] text-ink-700 transition-colors cursor-pointer"
                        >
                          <Download size={14} /> Download
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); setDeleteConfirmId(dashboard.id); setOpenMenuId(null); }}
                          className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-risk-50 text-risk-700 text-[13px] transition-colors cursor-pointer"
                        >
                          <Trash2 size={14} /> {activeTab === 'shared' ? 'Remove' : 'Delete'}
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* Icon */}
                <div className="mb-4">
                  <div className={`inline-flex p-2.5 rounded-lg ${dashboard.accent}`}>
                    <LayoutGrid size={18} />
                  </div>
                </div>

                {/* Title & Description */}
                <div className="mb-4 flex-1">
                  <h3 className="text-[15px] font-semibold text-ink-900 group-hover:text-brand-700 transition-colors mb-1.5">
                    {dashboard.name}
                  </h3>
                  <p className="text-[12px] text-ink-500 leading-relaxed line-clamp-2">
                    {dashboard.description}
                  </p>
                </div>

                {/* Shared by */}
                {dashboard.sharedBy && (
                  <div className="text-[11px] text-ink-400 mb-3">
                    Shared by <span className="font-medium text-ink-600">{dashboard.sharedBy}</span>
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-canvas-border mt-auto">
                  <div className="flex items-center gap-1.5">
                    <Clock size={13} className="text-ink-400" />
                    <span className="text-[12px] text-ink-400">{dashboard.timeAgo}</span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[12px] font-semibold text-brand-600">Open</span>
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <path d="M6 12L10 8L6 4" stroke="currentColor" className="text-brand-600" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty state */}
        {filteredDashboards.length === 0 && (
          <div className="text-center py-16">
            <LayoutGrid size={40} className="text-ink-300 mx-auto mb-3" />
            <p className="text-[14px] text-ink-500 font-medium">No dashboards found</p>
            <p className="text-[12px] text-ink-400 mt-1">Try a different search term or create a new dashboard.</p>
          </div>
        )}
      </div>

      {/* ── Delete Confirmation ── */}
      <AnimatePresence>
        {deleteConfirmId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setDeleteConfirmId(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-canvas-elevated rounded-xl border border-canvas-border p-6 max-w-md w-full mx-4"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[15px] font-semibold text-ink-900">
                  {activeTab === 'shared' ? 'Remove Dashboard' : 'Delete Dashboard'}
                </h3>
                <button onClick={() => setDeleteConfirmId(null)} className="p-1 hover:bg-brand-50 rounded-md transition-colors cursor-pointer">
                  <X size={16} className="text-ink-500" />
                </button>
              </div>
              <p className="text-[13px] text-ink-500 mb-6">
                Are you sure you want to {activeTab === 'shared' ? 'remove' : 'delete'}{' '}
                <span className="font-semibold text-ink-800">
                  "{currentDashboards.find(d => d.id === deleteConfirmId)?.name}"
                </span>
                ? {activeTab === 'my' && 'This action cannot be undone.'}
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-4 py-2 border border-canvas-border rounded-md text-[13px] text-ink-700 hover:border-brand-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirmId)}
                  className="px-4 py-2 bg-risk text-white rounded-md text-[13px] font-semibold hover:bg-risk/90 transition-colors cursor-pointer"
                >
                  {activeTab === 'shared' ? 'Remove' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Dashboard Modal */}
      <CreateDashboardModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreate={(name, desc, customFields) => {
          const newId = `custom-${Date.now()}`;
          const newDashboard = {
            id: newId,
            name,
            description: desc || 'Custom dashboard',
            timeAgo: 'Just now',
            creator: 'You',
            accent: 'bg-brand-50 text-brand-700',
          };
          onCreateDashboard?.(newDashboard);
          addToast({ message: `Dashboard "${name}" created`, type: 'success' });
          onDashboardClick(newId, customFields);
        }}
      />
    </div>
  );
}
