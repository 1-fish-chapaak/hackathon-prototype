import { useState } from 'react';
import {
  Search, Upload, FileSpreadsheet, FileText, File,
  Download, Eye, Sparkles, Shield, TableProperties,
  ChevronRight, CloudUpload, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FileRow {
  id: string;
  name: string;
  source: string;
  type: string;
  linkedControls: string[];
  engagement: string;
  rows: string;
  size: string;
  status: 'Mapped' | 'Processed' | 'Pending Mapping' | 'Error';
  fileType: 'xlsx' | 'csv' | 'pdf';
  actions: string[];
}

const FILES: FileRow[] = [
  {
    id: 'f1',
    name: 'ap_transactions_q1.xlsx',
    source: 'SAP ERP',
    type: 'Population',
    linkedControls: ['C-001', 'C-003'],
    engagement: 'ENG-2026-001',
    rows: '1,247,832',
    size: '45.2 MB',
    status: 'Mapped',
    fileType: 'xlsx',
    actions: ['View', 'Download'],
  },
  {
    id: 'f2',
    name: 'vendor_master_2026.csv',
    source: 'Manual Upload',
    type: 'Master Data',
    linkedControls: ['C-002'],
    engagement: 'ENG-2026-001',
    rows: '892',
    size: '1.1 MB',
    status: 'Mapped',
    fileType: 'csv',
    actions: ['View', 'Download'],
  },
  {
    id: 'f3',
    name: 'credit_approvals_q1.pdf',
    source: 'Manual Upload',
    type: 'Evidence',
    linkedControls: ['C-001'],
    engagement: 'ENG-2026-001',
    rows: '-',
    size: '8.4 MB',
    status: 'Processed',
    fileType: 'pdf',
    actions: ['View', 'Forensics'],
  },
  {
    id: 'f4',
    name: 'change_logs_mar.xlsx',
    source: 'SAP ERP',
    type: 'Evidence',
    linkedControls: ['C-002'],
    engagement: 'ENG-2026-001',
    rows: '4,521',
    size: '2.3 MB',
    status: 'Pending Mapping',
    fileType: 'xlsx',
    actions: ['Map Schema'],
  },
  {
    id: 'f5',
    name: 'access_matrix.xlsx',
    source: 'Workday',
    type: 'IPE',
    linkedControls: ['C-005'],
    engagement: 'ENG-2026-001',
    rows: '234',
    size: '0.8 MB',
    status: 'Error',
    fileType: 'xlsx',
    actions: ['Re-upload'],
  },
];

function FileIcon({ type }: { type: 'xlsx' | 'csv' | 'pdf' }) {
  const config = {
    xlsx: { icon: FileSpreadsheet, color: 'text-compliant-700', bg: 'bg-compliant-50' },
    csv:  { icon: File,            color: 'text-evidence-700',  bg: 'bg-evidence-50' },
    pdf:  { icon: FileText,        color: 'text-risk-700',      bg: 'bg-risk-50' },
  };
  const c = config[type];
  const Icon = c.icon;
  return (
    <div className={`w-8 h-8 rounded-md ${c.bg} flex items-center justify-center`}>
      <Icon size={16} className={c.color} />
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  // Editorial: flat pill, no border, no icon. Always spelled out.
  const map: Record<string, string> = {
    'Mapped':          'bg-compliant-50 text-compliant-700',
    'Processed':       'bg-evidence-50 text-evidence-700',
    'Pending Mapping': 'bg-mitigated-50 text-mitigated-700',
    'Error':           'bg-risk-50 text-risk-700',
  };
  return (
    <span className={`inline-flex items-center px-2.5 h-6 rounded-full text-[12px] font-medium whitespace-nowrap ${map[status] || map['Pending Mapping']}`}>
      {status}
    </span>
  );
}

function ActionBtn({ label }: { label: string }) {
  const styles: Record<string, string> = {
    'View':       'text-ink-500 hover:text-brand-700',
    'Download':   'text-ink-500 hover:text-brand-700',
    'Forensics':  'text-brand-700 hover:bg-brand-50 bg-brand-50/60',
    'Map Schema': 'text-mitigated-700 hover:bg-mitigated-50 bg-mitigated-50/60',
    'Re-upload':  'text-risk-700 hover:bg-risk-50 bg-risk-50/60',
  };
  const icons: Record<string, React.ReactNode> = {
    'View': <Eye size={10} />,
    'Download': <Download size={10} />,
    'Forensics': <Shield size={10} />,
    'Map Schema': <TableProperties size={10} />,
    'Re-upload': <Upload size={10} />,
  };
  return (
    <button className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold transition-all cursor-pointer ${styles[label] || 'text-text-secondary hover:text-primary'}`}>
      {icons[label]}
      {label}
    </button>
  );
}

export default function EvidenceView() {
  const [search, setSearch] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const filtered = FILES.filter(f => {
    if (!search) return true;
    const q = search.toLowerCase();
    return f.name.toLowerCase().includes(q) || f.type.toLowerCase().includes(q) || f.source.toLowerCase().includes(q) || f.linkedControls.some(c => c.toLowerCase().includes(q));
  });

  return (
    <div className="h-full overflow-y-auto bg-canvas">
      <div className="max-w-7xl mx-auto px-8 py-8 relative">
        {/* Header */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-text tracking-tight">Evidence & Workpapers</h1>
            <p className="text-sm text-text-secondary mt-1">Manage uploaded populations, evidence, and master data.</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-2 border border-border-light bg-white text-text-secondary rounded-lg text-[12px] font-medium hover:shadow-md hover:border-primary/20 transition-all cursor-pointer">
              <Sparkles size={14} className="text-purple-500" />
              Analyze with AI
            </button>
            <button className="flex items-center gap-2 px-3 py-2 border border-border-light bg-white text-text-secondary rounded-lg text-[12px] font-medium hover:shadow-md hover:border-primary/20 transition-all cursor-pointer">
              <Shield size={14} className="text-indigo-500" />
              Check Forensics
            </button>
            <button className="flex items-center gap-2 px-3 py-2 border border-border-light bg-white text-text-secondary rounded-lg text-[12px] font-medium hover:shadow-md hover:border-primary/20 transition-all cursor-pointer">
              <TableProperties size={14} className="text-teal-500" />
              Extract Tables
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-[13px] font-semibold transition-colors cursor-pointer">
              <Upload size={14} />
              Upload File
            </button>
          </div>
        </div>

        {/* Drag & Drop Zone */}
        <motion.div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); }}
          animate={dragOver ? { scale: 1.01, borderColor: 'var(--color-primary)' } : { scale: 1 }}
          className={`relative mb-6 rounded-xl border-2 border-dashed transition-colors ${
            dragOver
              ? 'border-primary bg-primary/5'
              : 'border-border-light bg-surface-2/30 hover:border-primary/30'
          }`}
        >
          <div className="flex flex-col items-center justify-center py-8">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-colors ${
              dragOver ? 'bg-primary/10' : 'bg-gray-100'
            }`}>
              <CloudUpload size={24} className={dragOver ? 'text-primary' : 'text-text-muted'} />
            </div>
            <p className="text-[13px] font-medium text-text">
              Drop files here or{' '}
              <span className="text-primary cursor-pointer hover:underline">browse</span>
            </p>
            <p className="text-[11px] text-text-muted mt-1">
              Supports XLSX, CSV, PDF, XML up to 500 MB
            </p>
          </div>
          {dragOver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 rounded-xl bg-primary/5 pointer-events-none"
            />
          )}
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Files', value: '127', color: 'text-text' },
            { label: 'Mapped', value: '98', color: 'text-success' },
            { label: 'Pending', value: '21', color: 'text-warning' },
            { label: 'Errors', value: '8', color: 'text-danger' },
          ].map(card => (
            <div key={card.label} className="bg-white rounded-xl border border-border-light p-3 text-center hover:shadow-md transition-all duration-200">
              <div className={`text-xl font-bold ${card.color}`}>{card.value}</div>
              <div className="text-[10px] text-text-muted uppercase tracking-wider">{card.label}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search files by name, type, source, or linked control..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-[13px] bg-white border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all placeholder:text-text-muted"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text cursor-pointer">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-border-light overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-border-light bg-surface-2/50">
                  {['File Name', 'Source', 'Type', 'Linked Control', 'Engagement', 'Rows', 'Size', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-3 py-3 text-left text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filtered.map((row, i) => (
                    <motion.tr
                      key={row.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2, delay: i * 0.03 }}
                      className="border-b border-border-light/60 hover:bg-surface-2/40 transition-colors group"
                    >
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2.5">
                          <FileIcon type={row.fileType} />
                          <span className="text-text font-medium text-[12px]">{row.name}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`text-[11px] font-medium ${
                          row.source === 'Manual Upload' ? 'text-text-muted' : 'text-indigo-600'
                        }`}>
                          {row.source}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span className="text-[11px] text-text-secondary bg-gray-50 px-1.5 py-0.5 rounded font-medium">
                          {row.type}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex gap-1">
                          {row.linkedControls.map(c => (
                            <span key={c} className="text-[10px] font-mono text-primary bg-primary/5 px-1.5 py-0.5 rounded-md border border-primary/10">
                              {c}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span className="text-text-secondary font-mono text-[10px] bg-gray-50 px-1.5 py-0.5 rounded">
                          {row.engagement}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`text-[11px] tabular-nums ${row.rows === '-' ? 'text-gray-300' : 'text-text-secondary'}`}>
                          {row.rows}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span className="text-[11px] text-text-muted tabular-nums">{row.size}</span>
                      </td>
                      <td className="px-3 py-3">
                        <StatusBadge status={row.status} />
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-0.5">
                          {row.actions.map(action => (
                            <ActionBtn key={action} label={action} />
                          ))}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-border-light bg-surface-2/30">
            <span className="text-[11px] text-text-muted">
              Showing {filtered.length} of {FILES.length} files
            </span>
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-text-muted">Page 1 of 1</span>
              <button className="p-1 rounded hover:bg-gray-100 text-text-muted cursor-pointer">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
