import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Sparkles,
  Play,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronDown,
  Pencil,
  Trash2,
  Check,
  ArrowRight,
  ListFilter,
  X,
  Calendar,
  Loader2,
  FileText,
  UploadCloud,
  Database,
  ChevronUp,
  AlertTriangle,
  Upload,
  Minus,
} from 'lucide-react';
import { DATA_SOURCES } from '../../data/mockData';
import { useToast } from '../shared/Toast';
import { useBulkRunProgress } from '../shared/BulkRunProgress';

const FREQUENCIES = ['Hourly', 'Daily', 'Weekly', 'Monthly'] as const;
type Frequency = typeof FREQUENCIES[number];

const TRIGGERS = ['Schedule', 'Data Change', 'Manual'] as const;
type Trigger = typeof TRIGGERS[number];

const RETRIES = ['Off', '1x', '3x', '5x'] as const;
type Retry = typeof RETRIES[number];

// Mock "backend" response — required files for the bulk run
const REQUIRED_FILES = [
  {
    name: 'AP Invoice Register',
    format: 'CSV',
    required: true,
    description: 'Period export of posted invoices — invoice number, vendor, amount, date, GL account, entered-by user.',
  },
  {
    name: 'Vendor Master',
    format: 'CSV',
    required: true,
    description: 'Active vendor master snapshot used to validate every invoice vendor against the approved list.',
  },
  {
    name: 'GL Trial Balance',
    format: 'CSV',
    required: true,
    description: 'Period-end trial balance export — ties AP postings back to the general ledger for reconciliation.',
  },
];

// Columns present in each uploaded source file (dummy — what the CSV "contains")
const AVAILABLE_COLUMNS = [
  'invoice_no', 'inv_date', 'amount_before_tax', 'amount_after_tax',
  'vendor_id', 'vendor_name', 'pan', 'gstin_no', 'hsn_code',
  'pmt_block', 'acct_no', 'ifsc', 'currency',
];

type ColumnMatchConfidence = 'exact' | 'fuzzy' | 'missing';

type ColumnMapping = {
  required: string;
  matched: string | null;
  confidence: ColumnMatchConfidence;
};

type ReviewWorkflowStatus = 'mapped' | 'column' | 'file' | 'notmapped' | 'dropped';

type ReviewWorkflow = {
  id: string;
  code: string;
  name: string;
  status: ReviewWorkflowStatus;
  prevStatus?: Exclude<ReviewWorkflowStatus, 'dropped'>;
  runtime: number;
  mappedFiles?: string[];
  fileError?: string;
  missingFiles?: string[];
  columns?: ColumnMapping[];
  hasOverrides?: boolean;
};

const DEMO_REVIEW_WORKFLOWS: ReviewWorkflow[] = [
  {
    id: 'rw-1',
    code: 'P2P-001',
    name: '3-Way Match (PO · GRN · Invoice)',
    status: 'mapped',
    runtime: 4.2,
    mappedFiles: ['po_dump_q3.sql', 'grn_records.json', 'invoice_batch_sep2026.pdf'],
  },
  {
    id: 'rw-2',
    code: 'P2P-002',
    name: 'Invoice Duplicate Detection',
    status: 'column',
    runtime: 2.8,
    mappedFiles: ['invoice_batch_sep2026.pdf', 'vendor_master_v3.xlsx'],
    columns: [
      { required: 'Invoice_Number', matched: 'invoice_no', confidence: 'exact' },
      { required: 'Vendor_GSTIN', matched: null, confidence: 'missing' },
      { required: 'Invoice_Date', matched: 'inv_date', confidence: 'exact' },
      { required: 'Taxable_Amount', matched: 'amount_before_tax', confidence: 'fuzzy' },
      { required: 'Vendor_Code', matched: 'vendor_id', confidence: 'fuzzy' },
    ],
  },
  {
    id: 'rw-3',
    code: 'VDR-014',
    name: 'Vendor Risk Score',
    status: 'file',
    runtime: 3.5,
    fileError: 'Expected: vendor_risk_signals dataset. Got: GRN_Records.json (schema mismatch)',
  },
  {
    id: 'rw-4',
    code: 'GL-009',
    name: 'GL Anomaly Detection',
    status: 'mapped',
    runtime: 5.1,
    mappedFiles: ['gl_q3_2026.csv'],
  },
  {
    id: 'rw-5',
    code: 'P2P-007',
    name: 'PO-GRN Quantity Reconciliation',
    status: 'mapped',
    runtime: 3.0,
    mappedFiles: ['po_dump_q3.sql', 'grn_records.json'],
  },
  {
    id: 'rw-6',
    code: 'TAX-003',
    name: 'TDS Compliance (194Q · 194C)',
    status: 'notmapped',
    runtime: 2.4,
    missingFiles: ['TDS Deduction Register'],
  },
  {
    id: 'rw-7',
    code: 'P2P-012',
    name: 'Payment Block Review',
    status: 'column',
    runtime: 2.2,
    mappedFiles: ['vendor_master_v3.xlsx', 'invoice_batch_sep2026.pdf'],
    columns: [
      { required: 'Vendor_Bank_Account', matched: 'acct_no', confidence: 'fuzzy' },
      { required: 'Block_Indicator', matched: 'pmt_block', confidence: 'fuzzy' },
      { required: 'IFSC_Code', matched: 'ifsc', confidence: 'exact' },
    ],
  },
  {
    id: 'rw-8',
    code: 'GL-018',
    name: 'Period-End Accrual Check',
    status: 'notmapped',
    runtime: 1.8,
    missingFiles: ['Accrual Schedule'],
  },
];

type UploadedFile = {
  id: string;
  name: string;
  size: number;
  error?: string;
};

function humanSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function makeUploaded(files: File[]): UploadedFile[] {
  const stamp = Date.now();
  return files.map((file, idx) => ({
    id: `${file.name}-${file.size}-${stamp}-${idx}`,
    name: file.name,
    size: file.size,
    error: /\.(dmg|exe)$/i.test(file.name) ? 'Request failed with status code 500' : undefined,
  }));
}

const SEED_UPLOADED_FILES: UploadedFile[] = [
  { id: 'seed-gl', name: 'gl_q3_2026.csv', size: Math.round(12.4 * 1024 * 1024) },
  { id: 'seed-invoice', name: 'invoice_batch_sep2026.pdf', size: Math.round(48.1 * 1024 * 1024) },
  { id: 'seed-vendor', name: 'vendor_master_v3.xlsx', size: Math.round(2.8 * 1024 * 1024) },
  { id: 'seed-po', name: 'po_dump_q3.sql', size: Math.round(8.2 * 1024 * 1024) },
  { id: 'seed-grn', name: 'grn_records.json', size: Math.round(4.7 * 1024 * 1024) },
];

interface Props {
  onCreateWorkflow: () => void;
  onSelectWorkflow: (id: string) => void;
}

export type LibraryWorkflow = {
  id: string;
  name: string;
  description: string;
  tags: string[];
  businessProcess: string;
  controlId: string;
};

export const LIBRARY_WORKFLOWS: LibraryWorkflow[] = [
  {
    id: 'lw-001',
    name: 'Identify Higher Share of Business Awarded to Higher Price Vendors (Monthly Analysis)',
    description: 'Identify Higher Share of Business Awarded to Higher Price Vendors (Monthly Analysis)',
    tags: ['p2p', 'pay to procure'],
    businessProcess: 'P2P',
    controlId: 'CTRL-001',
  },
  {
    id: 'lw-002',
    name: 'To check whether same material sold at different rates to same customer',
    description: 'To check whether same material sold at different rates to same customer where later invoice unit rate is lower than the earlier one for the same material.',
    tags: ['O2C'],
    businessProcess: 'Finance',
    controlId: 'CTRL-001',
  },
  {
    id: 'lw-003',
    name: 'Total Inventory by Community and Rev Status - 4',
    description: 'This workflow processes the inventory data to categorize revenue status, revenue type, bedroom buckets, price points, and community segments.',
    tags: ['INV'],
    businessProcess: 'Apollo Types',
    controlId: 'CTRL-002',
  },
  {
    id: 'lw-004',
    name: '"Invoice received by emaar" date should not be less than the invoice date',
    description: '"Invoice received by emaar" date should not be less than the invoice date',
    tags: ['P2P'],
    businessProcess: 'Birla Group',
    controlId: 'CTRL-002',
  },
  {
    id: 'lw-005',
    name: '"Invoice received by emaar" date should not be less than the invoice date',
    description: '"Invoice received by emaar" date should not be less than the invoice date',
    tags: ['P2P'],
    businessProcess: 'P2P',
    controlId: 'CTRL-003',
  },
  {
    id: 'lw-006',
    name: '2 way or 3 way match',
    description: '2 way/ 3 way match',
    tags: ['P2P'],
    businessProcess: 'Finance',
    controlId: 'CTRL-003',
  },
  {
    id: 'lw-007',
    name: 'Access Session Duration Analysis',
    description: "Calculates duration between access 'IN' and 'OUT' events per code to audit session lengths and identify anomalies.",
    tags: [],
    businessProcess: 'Apollo Types',
    controlId: 'CTRL-004',
  },
  {
    id: 'lw-008',
    name: 'Accounting Document Reconciliation Report',
    description: 'Consolidates and filters SAP BKPF header entries to reconcile unique accounting documents by latest entry date.',
    tags: [],
    businessProcess: 'Birla Group',
    controlId: 'CTRL-005',
  },
  {
    id: 'lw-009',
    name: 'Accounts Payable Aging Analysis',
    description: 'Presents payables across aging buckets to identify overdue liabilities and support cash flow management.',
    tags: ['test'],
    businessProcess: 'P2P',
    controlId: 'CTRL-005',
  },
  {
    id: 'lw-010',
    name: 'Duplicate Invoice Detection',
    description: 'Scans incoming invoices against historical data to flag potential duplicates before payment processing.',
    tags: ['P2P', 'fraud'],
    businessProcess: 'Finance',
    controlId: 'CTRL-006',
  },
];

const TOTAL_PAGES = 144;

export default function WorkflowLibraryView({ onCreateWorkflow, onSelectWorkflow }: Props) {
  const { addToast } = useToast();
  const [search, setSearch] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [rowsDropdownOpen, setRowsDropdownOpen] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bpFilter, setBpFilter] = useState<Set<string>>(new Set());
  const [tagFilter, setTagFilter] = useState<Set<string>>(new Set());
  const [activeFilter, setActiveFilter] = useState<'bp' | 'tags' | null>(null);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);

  const selectedWorkflows = useMemo(
    () => LIBRARY_WORKFLOWS.filter(w => selectedIds.has(w.id)),
    [selectedIds]
  );

  const bpOptions = useMemo(() => {
    const s = new Set<string>();
    LIBRARY_WORKFLOWS.forEach(w => s.add(w.businessProcess));
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, []);

  const tagOptions = useMemo(() => {
    const s = new Set<string>();
    LIBRARY_WORKFLOWS.forEach(w => w.tags.forEach(t => s.add(t)));
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return LIBRARY_WORKFLOWS.filter(w => {
      if (q && !w.name.toLowerCase().includes(q) && !w.description.toLowerCase().includes(q)) return false;
      if (bpFilter.size > 0 && !bpFilter.has(w.businessProcess)) return false;
      if (tagFilter.size > 0 && !w.tags.some(t => tagFilter.has(t))) return false;
      return true;
    });
  }, [search, bpFilter, tagFilter]);

  const allVisibleSelected = filtered.length > 0 && filtered.every(w => selectedIds.has(w.id));
  const someVisibleSelected = filtered.some(w => selectedIds.has(w.id));

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAllVisible = () => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        filtered.forEach(w => next.delete(w.id));
      } else {
        filtered.forEach(w => next.add(w.id));
      }
      return next;
    });
  };

  const enterBulkMode = () => {
    setBulkMode(true);
    setSelectedIds(new Set());
  };

  const exitBulkMode = () => {
    setBulkMode(false);
    setSelectedIds(new Set());
  };

  const handleContinue = () => {
    if (selectedIds.size === 0) return;
    setBulkModalOpen(true);
  };

  const handleModalClose = () => {
    setBulkModalOpen(false);
  };

  const handleModalContinue = (data: {
    auditName: string;
    auditDescription: string;
    frequency: Frequency;
    triggerOn: Trigger;
    runTime: string;
    retry: Retry;
  }) => {
    void data;
    setBulkModalOpen(false);
    exitBulkMode();
  };

  const handleRowClick = (id: string) => {
    if (bulkMode) {
      toggleSelect(id);
    } else {
      onSelectWorkflow(id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: [0.22, 0.68, 0, 1] }}
      className="h-full w-full bg-white flex flex-col overflow-hidden px-[180px]"
    >
      {/* Header */}
      <div className="pt-8 pb-5">
        <div className="font-mono text-[11px] text-ink-500 mb-2 tracking-tight">
          Workflow Library
        </div>
        <h1 className="font-display text-[34px] font-[420] tracking-tight text-ink-900 leading-[1.15]">
          Workflow Library
        </h1>
        <p className="text-[14px] text-ink-500 mt-1">
          Browse the workflow catalog and add the ones relevant to your audit.
        </p>
      </div>

      {/* Search + Create */}
      <div className=" pb-5 flex items-center gap-3">
          <div className="relative w-[400px]">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search workflow.."
              className="w-full pl-10 pr-4 h-10 rounded-md border border-border bg-white text-[13px] outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
            />
          </div>
          {bulkMode && (
            <span className="text-[13px] text-text-secondary">
              <span className="font-semibold text-text">{selectedIds.size}</span> selected
            </span>
          )}
          <div className="ml-auto flex items-center gap-3">
            {!bulkMode && (
              <button
                onClick={enterBulkMode}
                className="flex items-center gap-2 px-4 h-10 rounded-md bg-white text-text border border-border text-[13px] font-semibold hover:bg-surface-2 transition-colors cursor-pointer"
              >
                <Play size={14} />
                Bulk Run
              </button>
            )}
            <button
              onClick={onCreateWorkflow}
              className="flex items-center gap-2 px-4 h-10 rounded-md bg-primary-xlight text-primary border border-primary/15 text-[13px] font-semibold hover:bg-primary/10 transition-colors cursor-pointer"
            >
              <Sparkles size={14} />
              Create Workflow
            </button>
          </div>
        </div>

        {/* Table */}
        {/*
          DESIGN UPDATE — enterprise-minimal table refinements.
          To revert: restore the commented-out classNames marked with "ORIG:" below.
          Changes:
            1. thead background: bg-surface-2 → bg-white + border-b
            2. th labels: 13px semibold → 11px uppercase tracking-wider muted
            3. Control ID badge: filled pill → plain mono muted text
            4. Tags: purple → neutral gray chips
            5. Actions column: always visible → reveal on row hover
            6. Row hover: bg-surface-2/50 → bg-surface-2/40
        */}
        <div className="flex-1 overflow-auto border-t border-border-light">
          <table className="w-full border-collapse">
            {/* ORIG: <thead className="bg-surface-2 sticky top-0 z-10"> */}
            <thead className="bg-white sticky top-0 z-10 border-b border-border-light">
              <tr>
                {bulkMode && (
                  <th className="pl-4 pr-2 py-3.5 w-[56px]">
                    <Checkbox
                      checked={allVisibleSelected}
                      indeterminate={!allVisibleSelected && someVisibleSelected}
                      onChange={toggleSelectAllVisible}
                      ariaLabel="Select all workflows on this page"
                    />
                  </th>
                )}
                {/* ORIG th classes below: "px-4 py-3.5 text-left text-[13px] font-semibold text-text ..." */}
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-text-muted w-[320px]">Workflow Name</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-text-muted">Workflow Description</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-text-muted w-[170px]">
                  <div className="relative inline-flex items-center gap-1.5">
                    Business Process
                    <FilterIconButton
                      active={bpFilter.size > 0}
                      open={activeFilter === 'bp'}
                      onClick={() => setActiveFilter(activeFilter === 'bp' ? null : 'bp')}
                      label="Filter by business process"
                    />
                    {activeFilter === 'bp' && (
                      <FilterDropdown
                        options={bpOptions}
                        selected={bpFilter}
                        onApply={(next) => { setBpFilter(next); setActiveFilter(null); setPage(1); }}
                        onClose={() => setActiveFilter(null)}
                      />
                    )}
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-text-muted w-[200px]">
                  <div className="relative inline-flex items-center gap-1.5">
                    Tags
                    <FilterIconButton
                      active={tagFilter.size > 0}
                      open={activeFilter === 'tags'}
                      onClick={() => setActiveFilter(activeFilter === 'tags' ? null : 'tags')}
                      label="Filter by tag"
                    />
                    {activeFilter === 'tags' && (
                      <FilterDropdown
                        options={tagOptions}
                        selected={tagFilter}
                        onApply={(next) => { setTagFilter(next); setActiveFilter(null); setPage(1); }}
                        onClose={() => setActiveFilter(null)}
                      />
                    )}
                  </div>
                </th>
                <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-text-muted w-[140px]" aria-label="Actions"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={bulkMode ? 6 : 5} className="px-6 py-16 text-center text-[13px] text-text-muted">
                    No workflows match "{search}"
                  </td>
                </tr>
              ) : (
                filtered.map(wf => {
                  const isSelected = selectedIds.has(wf.id);
                  return (
                    // ORIG tr className (hover was bg-surface-2/50):
                    //   `border-t border-border-light transition-colors cursor-pointer ${
                    //     bulkMode && isSelected ? 'bg-primary-xlight/50 hover:bg-primary-xlight/70' : 'hover:bg-surface-2/50'
                    //   }`
                    <tr
                      key={wf.id}
                      onClick={() => handleRowClick(wf.id)}
                      className={`border-t border-border-light transition-colors cursor-pointer ${
                        bulkMode && isSelected ? 'bg-primary-xlight/50 hover:bg-primary-xlight/70' : 'hover:bg-surface-2/40'
                      }`}
                    >
                      {bulkMode && (
                        <td className="pl-4 pr-2 py-4 align-top">
                          <Checkbox
                            checked={isSelected}
                            onChange={() => toggleSelect(wf.id)}
                            ariaLabel={`Select ${wf.name}`}
                          />
                        </td>
                      )}
                      <td className="px-4 py-4 align-top w-[320px]">
                        <div className="flex flex-col gap-1.5 w-full min-w-0">
                          <span className="text-[13px] text-text font-medium line-clamp-2">{wf.name}</span>
                          {/* ORIG: <span className="inline-flex items-center self-start px-2 py-0.5 rounded-md bg-surface-2 border border-border-light text-ink-700 text-[11px] font-mono font-semibold tracking-tight"> */}
                          <span className="self-start text-[11px] font-mono text-ink-500 tracking-tight">
                            {wf.controlId}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 align-top text-[13px] text-text-secondary max-w-[520px]">
                        <span className="line-clamp-2">{wf.description}</span>
                      </td>
                      <td className="px-4 py-4 align-top text-[13px] text-text-secondary">
                        {wf.businessProcess}
                      </td>
                      <td className="px-4 py-4 align-top">
                        <div className="flex flex-wrap gap-1.5">
                          {wf.tags.map(t => (
                            // ORIG chip: "inline-flex items-center px-2 py-0.5 rounded-md bg-primary-xlight text-primary text-[12px] font-semibold"
                            <span
                              key={t}
                              className="inline-flex items-center px-2 py-0.5 rounded-md bg-surface-2 border border-border-light text-ink-700 text-[12px] font-medium"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className={`px-4 py-4 align-top ${bulkMode ? 'pointer-events-none opacity-40' : ''}`}>
                        <div className="flex items-center justify-end gap-1">
                          <ActionIconButton
                            label="Run workflow"
                            disabled={bulkMode}
                            onClick={() => addToast({ message: `Running "${wf.name}"…`, type: 'success' })}
                          >
                            <Play size={14} />
                          </ActionIconButton>
                          <ActionIconButton
                            label="Edit"
                            disabled={bulkMode}
                            onClick={() => addToast({ message: `Editing "${wf.name}"`, type: 'success' })}
                          >
                            <Pencil size={14} />
                          </ActionIconButton>
                          <ActionIconButton
                            label="Delete"
                            disabled={bulkMode}
                            onClick={() => addToast({ message: `Deleted "${wf.name}"`, type: 'success' })}
                          >
                            <Trash2 size={14} />
                          </ActionIconButton>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      {/* Bulk action bar */}
      {bulkMode && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.16 }}
          className="flex items-center justify-between py-3 px-4 border-t border-border-light bg-white"
        >
          <button
            onClick={exitBulkMode}
            className="px-4 h-9 rounded-md bg-white text-text border border-border text-[13px] font-semibold hover:bg-surface-2 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleContinue}
            disabled={selectedIds.size === 0}
            className="flex items-center gap-2 px-4 h-9 rounded-md bg-primary text-white text-[13px] font-semibold hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            Continue
            <ArrowRight size={14} />
          </button>
        </motion.div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between  py-4 border-t border-border-light bg-white">
          <div className="flex items-center gap-2">
            <span className="text-[13px] text-text-secondary">Rows per page:</span>
            <div className="relative">
              <button
                onClick={() => setRowsDropdownOpen(p => !p)}
                className="flex items-center gap-1.5 pl-3 pr-2 h-8 rounded-md border border-border text-[13px] text-text bg-white hover:border-primary/40 transition-colors cursor-pointer"
              >
                {rowsPerPage}
                <ChevronDown size={12} className={`text-text-muted transition-transform ${rowsDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {rowsDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setRowsDropdownOpen(false)} />
                  <div className="absolute bottom-full mb-1 left-0 w-20 bg-white border border-border-light rounded-lg shadow-lg z-50 overflow-hidden">
                    {[10, 25, 50, 100].map(n => (
                      <button
                        key={n}
                        onClick={() => { setRowsPerPage(n); setRowsDropdownOpen(false); setPage(1); }}
                        className={`w-full text-left px-3 py-1.5 text-[13px] hover:bg-primary-xlight transition-colors cursor-pointer ${
                          n === rowsPerPage ? 'text-primary font-semibold' : 'text-text'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[13px] text-text-secondary">Page {page} of {TOTAL_PAGES}</span>
            <div className="flex items-center gap-1">
              <PaginationButton onClick={() => setPage(1)} disabled={page === 1}>
                <ChevronsLeft size={14} />
              </PaginationButton>
              <PaginationButton onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                <ChevronLeft size={14} />
              </PaginationButton>
              <PaginationButton onClick={() => setPage(p => Math.min(TOTAL_PAGES, p + 1))} disabled={page === TOTAL_PAGES}>
                <ChevronRight size={14} />
              </PaginationButton>
              <PaginationButton onClick={() => setPage(TOTAL_PAGES)} disabled={page === TOTAL_PAGES}>
                <ChevronsRight size={14} />
              </PaginationButton>
            </div>
          </div>
        </div>

      {/* Bulk Execute Modal */}
      <AnimatePresence>
        {bulkModalOpen && (
          <BulkExecuteModal
            selectedWorkflows={selectedWorkflows}
            onClose={handleModalClose}
            onContinue={handleModalContinue}
          />
        )}
      </AnimatePresence>

    </motion.div>
  );
}

function Checkbox({
  checked,
  indeterminate,
  onChange,
  ariaLabel,
}: {
  checked: boolean;
  indeterminate?: boolean;
  onChange: () => void;
  ariaLabel: string;
}) {
  const showMark = checked || indeterminate;
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={indeterminate ? 'mixed' : checked}
      aria-label={ariaLabel}
      onClick={e => { e.stopPropagation(); onChange(); }}
      className={`w-4 h-4 rounded border flex items-center justify-center transition-colors cursor-pointer ${
        showMark ? 'bg-primary border-primary' : 'bg-white border-border hover:border-primary/60'
      }`}
    >
      {checked && !indeterminate && <Check size={12} className="text-white" strokeWidth={3} />}
      {indeterminate && <div className="w-2 h-[2px] bg-white rounded-sm" />}
    </button>
  );
}

function ActionIconButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="relative group">
      <button
        type="button"
        aria-label={label}
        disabled={disabled}
        onClick={e => { e.stopPropagation(); onClick(); }}
        className="w-8 h-8 rounded-md flex items-center justify-center text-text-muted hover:bg-surface-2 hover:text-text cursor-pointer transition-colors disabled:cursor-not-allowed"
      >
        {children}
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 rounded-md bg-ink-900 text-white text-[11px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-30 shadow-md"
      >
        {label}
      </span>
    </div>
  );
}

function FilterIconButton({
  active,
  open,
  onClick,
  label,
}: {
  active: boolean;
  open: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-haspopup="listbox"
      aria-expanded={open}
      onClick={onClick}
      className={`w-6 h-6 rounded flex items-center justify-center transition-colors cursor-pointer ${
        active || open
          ? 'bg-primary-xlight text-primary'
          : 'text-text-muted hover:bg-surface-3 hover:text-text'
      }`}
    >
      <ListFilter size={12} />
    </button>
  );
}

function FilterDropdown({
  options,
  selected,
  onApply,
  onClose,
}: {
  options: string[];
  selected: Set<string>;
  onApply: (next: Set<string>) => void;
  onClose: () => void;
}) {
  const [pending, setPending] = useState<Set<string>>(new Set(selected));

  useEffect(() => {
    setPending(new Set(selected));
  }, [selected]);

  const allSelected = options.length > 0 && options.every(o => pending.has(o));

  const togglePending = (value: string) => {
    setPending(prev => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  };

  const toggleAll = () => {
    setPending(prev => {
      if (options.every(o => prev.has(o))) return new Set();
      return new Set(options);
    });
  };

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute top-full mt-2 left-0 z-50 w-[260px] bg-white border border-border-light rounded-lg shadow-lg overflow-hidden">
        <div className="max-h-[320px] overflow-auto">
          <label className="flex items-center gap-2.5 px-3 py-2.5 cursor-pointer hover:bg-surface-2 border-b border-border-light">
            <Checkbox checked={allSelected} onChange={toggleAll} ariaLabel="Select all" />
            <span className="text-[13px] font-semibold text-text">Select All</span>
          </label>
          {options.map(opt => (
            <label
              key={opt}
              className="flex items-center gap-2.5 px-3 py-2 cursor-pointer hover:bg-surface-2"
            >
              <Checkbox
                checked={pending.has(opt)}
                onChange={() => togglePending(opt)}
                ariaLabel={opt}
              />
              <span className="text-[13px] text-text">{opt}</span>
            </label>
          ))}
        </div>
        <div className="flex items-center justify-between gap-2 px-3 py-2.5 border-t border-border-light bg-white">
          <button
            type="button"
            onClick={() => setPending(new Set())}
            disabled={pending.size === 0}
            className="px-3 h-8 rounded-md text-[13px] font-semibold text-text-muted hover:text-text disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => onApply(pending)}
            className="px-4 h-8 rounded-md bg-primary text-white text-[13px] font-semibold hover:bg-primary-hover transition-colors cursor-pointer"
          >
            Apply
          </button>
        </div>
      </div>
    </>
  );
}

function PaginationButton({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-8 h-8 rounded-md flex items-center justify-center text-text-secondary hover:bg-surface-2 hover:text-text disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
    >
      {children}
    </button>
  );
}

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3.5 h-8 rounded-lg text-[12.5px] font-semibold transition-colors cursor-pointer ${
        active
          ? 'bg-primary text-white hover:bg-primary-hover'
          : 'bg-white text-text-muted border border-border-light hover:border-primary/30 hover:text-text'
      }`}
    >
      {children}
    </button>
  );
}

// ─── Bulk Execute Modal (Step 1 — Select Workflows) ───
function BulkExecuteModal({
  selectedWorkflows,
  onClose,
  onContinue,
}: {
  selectedWorkflows: LibraryWorkflow[];
  onClose: () => void;
  onContinue: (data: {
    auditName: string;
    auditDescription: string;
    frequency: Frequency;
    triggerOn: Trigger;
    runTime: string;
    retry: Retry;
  }) => void;
}) {
  const { addToast } = useToast();
  const { startBulkRun } = useBulkRunProgress();
  const [modalDeselected, setModalDeselected] = useState<Set<string>>(new Set());
  const [auditName, setAuditName] = useState('Q3-P2P');
  const [auditDescription, setAuditDescription] = useState('');
  const [frequency, setFrequency] = useState<Frequency>('Daily');
  const [triggerOn, setTriggerOn] = useState<Trigger>('Schedule');
  const [runTime, setRunTime] = useState('06:00');
  const [retry, setRetry] = useState<Retry>('3x');
  const [isFetching, setIsFetching] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  // Step 2 state
  const [requiredFilesOpen, setRequiredFilesOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(true);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>(SEED_UPLOADED_FILES);
  const [selectedUploadIds, setSelectedUploadIds] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dsSearch, setDsSearch] = useState('');
  const [linkedSourceIds, setLinkedSourceIds] = useState<Set<string>>(new Set());
  // Step 2 — sub-view: first upload, then review
  const [step2View, setStep2View] = useState<'upload' | 'review'>('upload');
  const [uploadModeTab, setUploadModeTab] = useState<'upload' | 'existing'>('upload');
  // Step 2 — Review state
  const [reviewFilter, setReviewFilter] = useState<'all' | ReviewWorkflowStatus>('all');
  const [reviewWorkflows, setReviewWorkflows] = useState<ReviewWorkflow[]>(DEMO_REVIEW_WORKFLOWS);
  const [expandedReviewId, setExpandedReviewId] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isFetching) onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, isFetching]);

  const activeWorkflows = selectedWorkflows.filter(w => !modalDeselected.has(w.id));
  const uniqueBps = Array.from(new Set(activeWorkflows.map(w => w.businessProcess)));
  const isSingleBp = uniqueBps.length === 1;
  const isMultipleBps = uniqueBps.length > 1;
  const hasAuditName = auditName.trim().length > 0;
  const hasWorkflows = activeWorkflows.length > 0;
  const canContinue = hasWorkflows && hasAuditName && isSingleBp;

  const toggleWorkflow = (id: string) => {
    setModalDeselected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSubmit = () => {
    if (isMultipleBps) {
      addToast({
        type: 'error',
        message: 'Bulk run is possible only when all workflows belong to a single business process.',
      });
      return;
    }
    if (!hasWorkflows || !hasAuditName) return;
    setIsFetching(true);
    window.setTimeout(() => {
      setIsFetching(false);
      setStep2View('upload');
      setStep(2);
    }, 2200);
  };

  const handleStep2Continue = () => {
    if (uploadedFiles.length === 0 && linkedSourceIds.size === 0) {
      addToast({
        type: 'error',
        message: 'Upload files or link an existing data source before continuing.',
      });
      return;
    }
    const failedFiles = uploadedFiles.filter(u => u.error).length;
    if (failedFiles > 0) {
      addToast({
        type: 'error',
        message: `${failedFiles} of ${uploadedFiles.length} file${uploadedFiles.length === 1 ? '' : 's'} failed to upload. Delete or resolve them before continuing.`,
      });
      return;
    }
    const active = reviewWorkflows.filter(rw => rw.status === 'mapped' || rw.status === 'column').length;
    if (active === 0) {
      addToast({
        type: 'error',
        message: 'No workflows are ready to run. Resolve mappings or restore at least one workflow.',
      });
      return;
    }
    setStep(3);
  };

  const handleStep3Execute = () => {
    const activeRunWorkflows = reviewWorkflows
      .filter(rw => rw.status === 'mapped' || rw.status === 'column')
      .map(rw => ({ id: rw.id, name: rw.name }));
    startBulkRun({
      name: auditName.trim() || 'Bulk Run',
      workflows: activeRunWorkflows,
    });
    onContinue({
      auditName: auditName.trim(),
      auditDescription: auditDescription.trim(),
      frequency,
      triggerOn,
      runTime,
      retry,
    });
  };

  const handleFileDrop = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      setUploadedFiles(prev => [...prev, ...makeUploaded(files)]);
      setLinkedSourceIds(new Set());
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length > 0) {
      setUploadedFiles(prev => [...prev, ...makeUploaded(files)]);
      setLinkedSourceIds(new Set());
    }
    e.target.value = '';
  };

  const removeUpload = (id: string) => {
    setUploadedFiles(prev => prev.filter(u => u.id !== id));
    setSelectedUploadIds(prev => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const toggleUploadSelection = (id: string) => {
    setSelectedUploadIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const allUploadsSelected = uploadedFiles.length > 0 && selectedUploadIds.size === uploadedFiles.length;

  const toggleSelectAllUploads = () => {
    if (allUploadsSelected) {
      setSelectedUploadIds(new Set());
    } else {
      setSelectedUploadIds(new Set(uploadedFiles.map(u => u.id)));
    }
  };

  const switchToChooseExisting = () => {
    setUploadedFiles([]);
    setSelectedUploadIds(new Set());
    setUploadModeTab('existing');
  };

  const triggerUpload = () => fileInputRef.current?.click();

  const toggleDataSource = (id: string) => {
    setLinkedSourceIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    if (uploadedFiles.length > 0) {
      setUploadedFiles([]);
      setSelectedUploadIds(new Set());
    }
  };

  const filteredDataSources = DATA_SOURCES.filter(ds =>
    ds.name.toLowerCase().includes(dsSearch.trim().toLowerCase())
  );

  const hasUpload = uploadedFiles.length > 0 || linkedSourceIds.size > 0;

  const reviewCounts = useMemo(() => {
    const base = {
      all: reviewWorkflows.length,
      mapped: 0,
      column: 0,
      file: 0,
      notmapped: 0,
      dropped: 0,
      active: 0,
    };
    for (const rw of reviewWorkflows) {
      base[rw.status] += 1;
      if (rw.status === 'mapped' || rw.status === 'column') base.active += 1;
    }
    return base;
  }, [reviewWorkflows]);

  const filteredReviewWorkflows = useMemo(() => {
    if (reviewFilter === 'all') return reviewWorkflows;
    return reviewWorkflows.filter(rw => rw.status === reviewFilter);
  }, [reviewFilter, reviewWorkflows]);

  const dropReviewWorkflow = (id: string) => {
    setReviewWorkflows(prev =>
      prev.map(rw =>
        rw.id === id && rw.status !== 'dropped'
          ? { ...rw, status: 'dropped', prevStatus: rw.status }
          : rw
      )
    );
    setExpandedReviewId(prev => (prev === id ? null : prev));
  };

  const restoreReviewWorkflow = (id: string) => {
    setReviewWorkflows(prev =>
      prev.map(rw =>
        rw.id === id && rw.status === 'dropped'
          ? { ...rw, status: rw.prevStatus ?? 'mapped', prevStatus: undefined }
          : rw
      )
    );
  };

  const updateReviewColumn = (wfId: string, idx: number, value: string) => {
    setReviewWorkflows(prev =>
      prev.map(rw => {
        if (rw.id !== wfId || !rw.columns) return rw;
        const next = rw.columns.map((c, i) => {
          if (i !== idx) return c;
          if (!value) return { ...c, matched: null, confidence: 'missing' as ColumnMatchConfidence };
          return {
            ...c,
            matched: value,
            confidence: c.confidence === 'missing' ? ('fuzzy' as ColumnMatchConfidence) : c.confidence,
          };
        });
        return { ...rw, columns: next };
      })
    );
  };

  const confirmReviewColumns = (wfId: string) => {
    setReviewWorkflows(prev =>
      prev.map(rw => {
        if (rw.id !== wfId || !rw.columns) return rw;
        const allResolved = rw.columns.every(c => c.confidence !== 'missing');
        if (!allResolved) return rw;
        return { ...rw, status: 'mapped', hasOverrides: true };
      })
    );
    setExpandedReviewId(null);
  };

  const toggleReviewExpand = (id: string) => {
    setExpandedReviewId(prev => (prev === id ? null : id));
  };

  const step2CanContinue = hasUpload && reviewCounts.active > 0;

  const stepState = (n: 1 | 2 | 3): 'active' | 'done' | 'pending' => {
    if (n < step) return 'done';
    if (n === step) return 'active';
    return 'pending';
  };
  const STEPS = [
    { n: 1, label: 'Select Workflows', state: stepState(1) },
    { n: 2, label: 'Configure Data Source', state: stepState(2) },
    { n: 3, label: 'Bulk Execute', state: stepState(3) },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={{ duration: 0.18 }}
        role="dialog"
        aria-modal="true"
        aria-label="Bulk Execute"
        className="relative bg-white rounded-2xl shadow-2xl w-[720px] h-[680px] max-h-[90vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-border-light flex items-center justify-between shrink-0">
          <h3 className="text-[16px] font-semibold text-text">Bulk Execute</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-surface-2 rounded-md transition-colors cursor-pointer" aria-label="Close">
            <X size={16} className="text-text-muted" />
          </button>
        </div>

        {/* Stepper — hidden while the loader is shown */}
        {!isFetching && (
        <div className="px-6 py-4 border-b border-border-light shrink-0 flex items-center gap-4">
          {STEPS.map((s, idx) => (
            <div key={s.n} className="flex items-center gap-4 flex-1">
              <div className="flex items-center gap-2.5">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-semibold ${
                  s.state === 'active'
                    ? 'bg-primary text-white'
                    : s.state === 'done'
                      ? 'bg-primary/15 text-primary'
                      : 'bg-surface-2 text-text-muted'
                }`}>
                  {s.state === 'done' ? <Check size={13} strokeWidth={3} /> : s.n}
                </div>
                <span className={`text-[13px] ${
                  s.state === 'active' ? 'text-text font-semibold' : s.state === 'done' ? 'text-text' : 'text-text-muted'
                }`}>
                  {s.label}
                </span>
              </div>
              {idx < STEPS.length - 1 && <div className="flex-1 h-px bg-border-light" />}
            </div>
          ))}
        </div>
        )}

        {isFetching ? (
          <FetchingFilesLoader workflowCount={activeWorkflows.length} />
        ) : step === 1 ? (
        <>
        {/* Body — Step 1 */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Business Process */}
          <div>
            <label className="block text-[12px] font-semibold text-text mb-1.5">Business Process</label>
            {isSingleBp && (
              <div className="px-3 py-2.5 rounded-md border border-border-light bg-surface-2 text-[13px] text-text">
                {uniqueBps[0]}
              </div>
            )}
            {isMultipleBps && (
              <div className="px-3 py-2.5 rounded-md border border-risk/40 bg-risk/5 text-[12.5px] text-risk-700 leading-relaxed">
                Multiple business processes in selection ({uniqueBps.join(', ')}). Bulk run requires all workflows to belong to a single business process.
              </div>
            )}
            {!hasWorkflows && (
              <div className="px-3 py-2.5 rounded-md border border-border-light bg-surface-2 text-[13px] text-text-muted">
                No workflows selected
              </div>
            )}
          </div>

          {/* Selected Workflows */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <label className="text-[12px] font-semibold text-text">Selected Workflows</label>
              <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-primary text-white text-[11px] font-semibold">
                {activeWorkflows.length}
              </span>
              {selectedWorkflows.length > activeWorkflows.length && (
                <span className="text-[11px] text-text-muted">
                  ({selectedWorkflows.length - activeWorkflows.length} deselected)
                </span>
              )}
            </div>
            <div className="border border-border-light rounded-md divide-y divide-border-light overflow-hidden max-h-[240px] overflow-y-auto">
              {selectedWorkflows.map(w => {
                const checked = !modalDeselected.has(w.id);
                return (
                  <label
                    key={w.id}
                    className="flex items-start gap-3 px-3 py-2.5 cursor-pointer hover:bg-surface-2/60 transition-colors"
                  >
                    <span className="pt-0.5">
                      <Checkbox
                        checked={checked}
                        onChange={() => toggleWorkflow(w.id)}
                        ariaLabel={`Toggle ${w.name}`}
                      />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className={`text-[13px] font-medium ${checked ? 'text-text' : 'text-text-muted line-through'}`}>
                        {w.name}
                      </div>
                      <div className="text-[11px] text-text-muted mt-0.5">
                        {w.businessProcess} · {w.controlId}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Audit Details */}
          <div>
            <div className="text-[12px] font-semibold text-text mb-2">Audit Details</div>
            <div className="space-y-3">
              <div>
                <label className="block text-[12px] font-medium text-text-secondary mb-1">
                  Audit Name <span className="text-risk">*</span>
                </label>
                <input
                  value={auditName}
                  onChange={e => setAuditName(e.target.value)}
                  placeholder="Enter audit name"
                  className="w-full px-3 py-2.5 rounded-md border border-border-light text-[13px] text-text placeholder:text-text-muted/60 outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-text-secondary mb-1">Audit Description</label>
                <textarea
                  value={auditDescription}
                  onChange={e => setAuditDescription(e.target.value)}
                  placeholder="Describe the purpose or scope of this audit"
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-md border border-border-light text-[13px] text-text placeholder:text-text-muted/60 outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* Schedule & Triggers */}
          <div className="rounded-lg border border-border-light bg-surface-2/40 p-4">
            <div className="flex items-center gap-2 mb-4">
              <Calendar size={14} className="text-primary" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                Schedule &amp; Triggers
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              {/* Frequency */}
              <div>
                <label className="block text-[12px] font-semibold text-text mb-2">Frequency</label>
                <div className="flex flex-wrap gap-2">
                  {FREQUENCIES.map(f => (
                    <Pill
                      key={f}
                      active={frequency === f}
                      onClick={() => setFrequency(f)}
                    >
                      {f}
                    </Pill>
                  ))}
                </div>
              </div>
              {/* Run Time */}
              <div>
                <label className="block text-[12px] font-semibold text-text mb-2">Run Time</label>
                <input
                  type="time"
                  value={runTime}
                  onChange={e => setRunTime(e.target.value)}
                  disabled={triggerOn === 'Manual'}
                  className="w-full px-3 py-2 rounded-md border border-border-light text-[13px] text-text bg-white outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              {/* Trigger On */}
              <div>
                <label className="block text-[12px] font-semibold text-text mb-2">Trigger On</label>
                <div className="flex flex-wrap gap-2">
                  {TRIGGERS.map(t => (
                    <Pill
                      key={t}
                      active={triggerOn === t}
                      onClick={() => setTriggerOn(t)}
                    >
                      {t}
                    </Pill>
                  ))}
                </div>
              </div>
              {/* Retry on Failure */}
              <div>
                <label className="block text-[12px] font-semibold text-text mb-2">Retry on Failure</label>
                <div className="flex flex-wrap gap-2">
                  {RETRIES.map(r => (
                    <Pill
                      key={r}
                      active={retry === r}
                      onClick={() => setRetry(r)}
                    >
                      {r}
                    </Pill>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border-light flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="px-4 h-9 rounded-md bg-white text-text border border-border text-[13px] font-semibold hover:bg-surface-2 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            aria-disabled={!canContinue && !isMultipleBps}
            className={`flex items-center gap-2 px-4 h-9 rounded-md text-white text-[13px] font-semibold transition-colors ${
              canContinue
                ? 'bg-primary hover:bg-primary-hover cursor-pointer'
                : 'bg-primary/40 cursor-not-allowed'
            }`}
          >
            Continue
            <ArrowRight size={14} />
          </button>
        </div>
        </>
        ) : step === 2 ? (
        <>
        {/* Body — Step 2 */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {step2View === 'upload' && (
          <>
          {/* Required Files */}
          <div className="rounded-lg border border-border-light bg-white">
            <button
              type="button"
              onClick={() => setRequiredFilesOpen(p => !p)}
              className="w-full flex items-center justify-between px-4 py-3 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <FileText size={14} className="text-primary" />
                <span className="text-[13px] font-semibold text-text">Required Files</span>
                <span className="text-[12px] text-text-muted">
                  {REQUIRED_FILES.filter(f => f.required).length} required · {REQUIRED_FILES.length} total
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[12px] text-text-muted">
                Click to {requiredFilesOpen ? 'collapse' : 'expand'}
                {requiredFilesOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </div>
            </button>
            {requiredFilesOpen && (
              <div className="px-4 pb-4 grid grid-cols-2 gap-3 border-t border-border-light pt-3">
                {REQUIRED_FILES.map(file => (
                  <div
                    key={file.name}
                    className="p-3 rounded-md border border-border-light bg-surface-2/30"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[13px] font-semibold text-text">{file.name}</span>
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded border border-border-light bg-white text-[10px] font-mono font-semibold text-ink-700">
                        {file.format}
                      </span>
                      {file.required && (
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-risk">
                          Required
                        </span>
                      )}
                    </div>
                    <div className="text-[12px] text-text-secondary leading-relaxed">{file.description}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upload data files */}
          <div className="rounded-lg border border-border-light bg-white">
            <button
              type="button"
              onClick={() => setUploadOpen(p => !p)}
              className="w-full flex items-start justify-between px-4 py-3 cursor-pointer"
            >
              <div className="text-left">
                <div className="text-[13px] font-semibold text-text">Upload data files</div>
                <div className="text-[12px] text-text-muted">
                  Upload the files required for this workflow, then hit Continue.
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-[12px] text-text-muted shrink-0 pt-0.5">
                Click to {uploadOpen ? 'collapse' : 'expand'}
                {uploadOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </div>
            </button>
            {uploadOpen && (
              <div className="px-4 pb-4 border-t border-border-light pt-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  accept=".csv,.pdf,.png,.jpg,.jpeg,.xlsx"
                />

                {uploadedFiles.length === 0 ? (
                  <div>
                    {/* Mode tabs */}
                    <div className="flex items-center gap-2 mb-3">
                      <button
                        type="button"
                        onClick={() => setUploadModeTab('upload')}
                        className={`inline-flex items-center gap-1.5 h-9 px-4 rounded-md border text-[12.5px] font-semibold transition-colors cursor-pointer ${
                          uploadModeTab === 'upload'
                            ? 'bg-primary border-primary text-white'
                            : 'bg-white border-primary/30 text-primary hover:bg-primary/5'
                        }`}
                      >
                        <Upload size={13} />
                        Upload
                      </button>
                      <button
                        type="button"
                        onClick={() => setUploadModeTab('existing')}
                        className={`inline-flex items-center gap-1.5 h-9 px-4 rounded-md border text-[12.5px] font-semibold transition-colors cursor-pointer ${
                          uploadModeTab === 'existing'
                            ? 'bg-primary border-primary text-white'
                            : 'bg-white border-primary/30 text-primary hover:bg-primary/5'
                        }`}
                      >
                        <Database size={13} />
                        Choose Existing
                      </button>
                    </div>

                    {uploadModeTab === 'upload' ? (
                      <div
                        onClick={triggerUpload}
                        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleFileDrop}
                        className={`flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed cursor-pointer transition-colors min-h-[220px] px-4 py-8 ${
                          isDragging
                            ? 'border-primary bg-primary/5'
                            : 'border-primary/30 bg-primary-xlight/40 hover:border-primary/50 hover:bg-primary/5'
                        }`}
                      >
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <UploadCloud size={22} className="text-primary" />
                        </div>
                        <div className="text-center">
                          <div className="text-[13px] font-semibold text-text">Drop files here or click to upload</div>
                          <div className="text-[12px] text-text-muted mt-1">
                            CSV, PDF, images — any data files for this workflow
                          </div>
                          <div className="text-[11px] text-text-muted/80 mt-2">Auto-mapped to required inputs</div>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-lg border border-border-light bg-white p-3 flex flex-col min-h-[220px]">
                        <div className="relative mb-2">
                          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                          <input
                            value={dsSearch}
                            onChange={e => setDsSearch(e.target.value)}
                            placeholder="Search data sources..."
                            className="w-full pl-8 pr-3 h-8 rounded-md border border-border-light text-[12px] text-text bg-white outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
                          />
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
                          {filteredDataSources.length === 0 ? (
                            <div className="text-[12px] text-text-muted text-center py-4">No data sources match.</div>
                          ) : (
                            filteredDataSources.map(ds => {
                              const isLinked = linkedSourceIds.has(ds.id);
                              return (
                                <button
                                  key={ds.id}
                                  type="button"
                                  role="checkbox"
                                  aria-checked={isLinked}
                                  onClick={() => toggleDataSource(ds.id)}
                                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md border transition-colors cursor-pointer text-left ${
                                    isLinked
                                      ? 'border-primary bg-primary/5'
                                      : 'border-border-light hover:border-primary/30 hover:bg-surface-2'
                                  }`}
                                >
                                  <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                                    <Database size={13} className="text-primary" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-[12.5px] font-semibold text-text truncate">{ds.name}</div>
                                    <div className="text-[11px] text-text-muted truncate">
                                      {ds.records} records · last sync {ds.lastSync}
                                    </div>
                                  </div>
                                  <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                                    isLinked ? 'border-primary bg-primary text-white' : 'border-border bg-white text-transparent'
                                  }`}>
                                    <Check size={11} strokeWidth={3} />
                                  </span>
                                </button>
                              );
                            })
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <UploadedFilesPanel
                    files={uploadedFiles}
                    selectedIds={selectedUploadIds}
                    allSelected={allUploadsSelected}
                    onToggleAll={toggleSelectAllUploads}
                    onToggleOne={toggleUploadSelection}
                    onRemove={removeUpload}
                    onUploadMore={triggerUpload}
                    onChooseExisting={switchToChooseExisting}
                  />
                )}
              </div>
            )}
          </div>

          </>
          )}

          {/* Workflow Mapping — Step 2b, appears after user hits Continue on upload view */}
          {step2View === 'review' && (
            <div className="rounded-lg border border-border-light bg-white">
              {/* Header */}
              <div className="px-4 pt-4 pb-3">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <div className="text-[13px] font-semibold text-text">Workflow Mapping</div>
                    <div className="text-[11.5px] text-text-muted mt-0.5">
                      Auto-mapped {reviewCounts.mapped} of {reviewCounts.all} workflows. Review issues below, fix column mappings, or drop workflows from this run.
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] shrink-0 pt-0.5">
                    <Sparkles size={12} className="text-primary" />
                    <span className="text-primary font-medium">Auto-mapping complete</span>
                  </div>
                </div>

                {/* Filter chips */}
                <div className="flex flex-wrap gap-1.5 pb-3 border-b border-border-light">
                  {([
                    { key: 'all',       label: 'All',           dot: null,             count: reviewCounts.all },
                    { key: 'mapped',    label: 'Mapped',        dot: 'bg-compliant',   count: reviewCounts.mapped },
                    { key: 'column',    label: 'Column Issues', dot: 'bg-mitigated',   count: reviewCounts.column },
                    { key: 'file',      label: 'File Issues',   dot: 'bg-risk',        count: reviewCounts.file },
                    { key: 'notmapped', label: 'Not Mapped',    dot: 'bg-text-muted',  count: reviewCounts.notmapped },
                    ...(reviewCounts.dropped > 0
                      ? [{ key: 'dropped' as const, label: 'Dropped', dot: 'bg-text', count: reviewCounts.dropped }]
                      : []),
                  ] as const).map(chip => {
                    const active = reviewFilter === chip.key;
                    return (
                      <button
                        key={chip.key}
                        type="button"
                        onClick={() => setReviewFilter(chip.key)}
                        className={`inline-flex items-center gap-1.5 h-7 px-3 rounded-full border text-[11.5px] font-medium transition-colors cursor-pointer ${
                          active
                            ? 'border-text bg-text text-white'
                            : 'border-border-light bg-white text-text-muted hover:border-border hover:text-text'
                        }`}
                      >
                        {chip.dot && <span className={`w-1.5 h-1.5 rounded-full ${chip.dot}`} />}
                        {chip.label}
                        <span className={`font-mono text-[10.5px] ${active ? 'opacity-70' : 'opacity-60'}`}>
                          {chip.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Workflow rows */}
              <div className="px-4 pb-4 space-y-2">
                {filteredReviewWorkflows.length === 0 ? (
                  <div className="text-[12px] text-text-muted text-center py-12">
                    No workflows match this filter.
                  </div>
                ) : (
                  filteredReviewWorkflows.map(rw => {
                    const isExpanded = expandedReviewId === rw.id;
                    const isDropped = rw.status === 'dropped';
                    const hasMissing = rw.columns?.some(c => c.confidence === 'missing') ?? false;
                    return (
                      <div
                        key={rw.id}
                        className={`rounded-xl border overflow-hidden transition-colors ${
                          isDropped
                            ? 'border-border-light bg-surface-2/60 opacity-60'
                            : 'border-border-light bg-white hover:border-border'
                        }`}
                      >
                        <div className="flex items-center gap-3 px-4 py-3">
                          <div className="font-mono text-[11px] text-text-muted/70 w-16 shrink-0">{rw.code}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className={`text-[12.5px] font-medium truncate ${isDropped ? 'text-text-muted line-through' : 'text-text'}`}>
                                {rw.name}
                              </span>
                              <ReviewStatusChip status={rw.status} />
                            </div>
                            <div className="text-[11px] text-text-muted truncate">
                              {(rw.status === 'mapped' || rw.status === 'column') && rw.mappedFiles && rw.mappedFiles.length > 0 ? (
                                <span className="font-mono">{rw.mappedFiles.join(' · ')}</span>
                              ) : rw.status === 'file' ? (
                                <span className="text-risk">{rw.fileError}</span>
                              ) : rw.status === 'notmapped' ? (
                                <span>Missing: {(rw.missingFiles ?? []).join(', ')}</span>
                              ) : isDropped ? (
                                <span className="italic">Excluded from this run</span>
                              ) : null}
                            </div>
                          </div>

                          {/* Action buttons */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            {isDropped ? (
                              <ReviewActionButton variant="primary" onClick={() => restoreReviewWorkflow(rw.id)}>
                                Restore
                              </ReviewActionButton>
                            ) : rw.status === 'mapped' ? (
                              <ReviewActionButton variant="danger" onClick={() => dropReviewWorkflow(rw.id)}>
                                Drop
                              </ReviewActionButton>
                            ) : rw.status === 'column' ? (
                              <>
                                <ReviewActionButton variant="primary" onClick={() => toggleReviewExpand(rw.id)}>
                                  {isExpanded ? 'Collapse' : hasMissing ? 'Fix Columns' : 'Review Columns'}
                                </ReviewActionButton>
                                <ReviewActionButton variant="danger" onClick={() => dropReviewWorkflow(rw.id)}>
                                  Drop
                                </ReviewActionButton>
                              </>
                            ) : rw.status === 'file' ? (
                              <>
                                <ReviewActionButton variant="primary" onClick={() => setStep2View('upload')}>
                                  Re-upload
                                </ReviewActionButton>
                                <ReviewActionButton variant="danger" onClick={() => dropReviewWorkflow(rw.id)}>
                                  Drop
                                </ReviewActionButton>
                              </>
                            ) : rw.status === 'notmapped' ? (
                              <>
                                <ReviewActionButton variant="primary" onClick={() => setStep2View('upload')}>
                                  Upload
                                </ReviewActionButton>
                                <ReviewActionButton variant="danger" onClick={() => dropReviewWorkflow(rw.id)}>
                                  Drop
                                </ReviewActionButton>
                              </>
                            ) : null}
                          </div>
                        </div>

                        {isExpanded && rw.status === 'column' && rw.columns && (
                          <ReviewColumnMapper
                            columns={rw.columns}
                            onUpdate={(idx, value) => updateReviewColumn(rw.id, idx, value)}
                            onConfirm={() => confirmReviewColumns(rw.id)}
                          />
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer — Step 2 */}
        <div className="px-6 py-4 border-t border-border-light flex items-center justify-between shrink-0">
          <button
            onClick={() => {
              if (step2View === 'review') setStep2View('upload');
              else setStep(1);
            }}
            className="px-4 h-9 rounded-md bg-white text-text border border-border text-[13px] font-semibold hover:bg-surface-2 transition-colors cursor-pointer"
          >
            Back
          </button>
          {step2View === 'upload' ? (
            <button
              onClick={() => {
                if (!hasUpload) {
                  addToast({
                    type: 'error',
                    message: 'Upload files or link an existing data source before continuing.',
                  });
                  return;
                }
                setStep2View('review');
              }}
              aria-disabled={!hasUpload}
              className={`flex items-center gap-2 px-4 h-9 rounded-md text-white text-[13px] font-semibold transition-colors ${
                hasUpload
                  ? 'bg-primary hover:bg-primary-hover cursor-pointer'
                  : 'bg-primary/40 cursor-not-allowed'
              }`}
            >
              Continue
              <ArrowRight size={14} />
            </button>
          ) : (
            <button
              onClick={handleStep2Continue}
              aria-disabled={!step2CanContinue}
              className={`flex items-center gap-2 px-4 h-9 rounded-md text-white text-[13px] font-semibold transition-colors ${
                step2CanContinue
                  ? 'bg-primary hover:bg-primary-hover cursor-pointer'
                  : 'bg-primary/40 cursor-not-allowed'
              }`}
            >
              Continue
              <ArrowRight size={14} />
            </button>
          )}
        </div>
        </>
        ) : (
        <Step3ReviewExecute
          auditName={auditName}
          reviewWorkflows={reviewWorkflows}
          uploadedCount={uploadedFiles.length}
          onBack={() => { setStep(2); setStep2View('review'); }}
          onExecute={handleStep3Execute}
        />
        )}
      </motion.div>
    </motion.div>
  );
}

// ─── Loader while "backend" fetches common required files ───
function FetchingFilesLoader({ workflowCount }: { workflowCount: number }) {
  const steps = [
    'Scanning selected workflows',
    'Identifying common required files',
    'Preparing configuration',
  ];
  const [stepIdx, setStepIdx] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setStepIdx(prev => Math.min(prev + 1, steps.length - 1));
    }, 650);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8 py-16">
      <div className="relative w-14 h-14 mb-5">
        <span className="absolute inset-0 rounded-full bg-primary/10" />
        <span className="absolute inset-0 flex items-center justify-center">
          <Loader2 size={28} className="text-primary animate-spin" />
        </span>
      </div>
      <div className="text-[15px] font-semibold text-text mb-1.5">Fetching required files</div>
      <div className="text-[13px] text-text-secondary mb-6 text-center max-w-[380px]">
        Identifying the data sources and files common to your {workflowCount} selected workflow{workflowCount === 1 ? '' : 's'}.
      </div>
      <div className="w-full max-w-[360px] space-y-2">
        {steps.map((s, i) => {
          const done = i < stepIdx;
          const active = i === stepIdx;
          return (
            <div key={s} className="flex items-center gap-2.5 text-[12.5px]">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                done ? 'bg-primary text-white' : active ? 'bg-primary/15 text-primary' : 'bg-surface-2 text-text-muted'
              }`}>
                {done ? <Check size={10} strokeWidth={3} /> : active ? <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> : null}
              </div>
              <span className={done ? 'text-text' : active ? 'text-text font-medium' : 'text-text-muted'}>
                {s}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function UploadedFilesPanel({
  files,
  selectedIds,
  allSelected,
  onToggleAll,
  onToggleOne,
  onRemove,
  onUploadMore,
  onChooseExisting,
}: {
  files: UploadedFile[];
  selectedIds: Set<string>;
  allSelected: boolean;
  onToggleAll: () => void;
  onToggleOne: (id: string) => void;
  onRemove: (id: string) => void;
  onUploadMore: () => void;
  onChooseExisting: () => void;
}) {
  const failed = files.filter(u => u.error).length;
  const someSelected = selectedIds.size > 0 && !allSelected;
  return (
    <div className="rounded-lg border border-border-light bg-white">
      <div className="flex items-center gap-3 px-3 py-2.5 border-b border-border-light">
        <button
          type="button"
          onClick={onToggleAll}
          aria-label={allSelected ? 'Deselect all files' : 'Select all files'}
          className="flex items-center gap-0.5 rounded-md border border-border-light px-1.5 py-1 hover:border-primary/40 hover:bg-surface-2 transition-colors cursor-pointer"
        >
          <span className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
            allSelected
              ? 'border-primary bg-primary text-white'
              : someSelected
                ? 'border-primary bg-primary/20 text-primary'
                : 'border-border bg-white text-transparent'
          }`}>
            {allSelected
              ? <Check size={11} strokeWidth={3} />
              : someSelected
                ? <span className="w-1.5 h-0.5 rounded-sm bg-primary" />
                : <Check size={11} strokeWidth={3} />}
          </span>
          <ChevronDown size={12} className="text-text-muted" />
        </button>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-[13px] font-semibold text-text">Files Uploaded</span>
          {failed > 0 && (
            <div className="flex items-center gap-1 text-[11.5px] text-risk min-w-0">
              <AlertTriangle size={12} className="shrink-0" />
              <span className="truncate">
                {failed} of {files.length} file{files.length === 1 ? '' : 's'} failed - delete or resolve to continue
              </span>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={onUploadMore}
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md bg-primary text-white text-[12px] font-semibold hover:bg-primary/90 transition-colors cursor-pointer"
        >
          <Upload size={13} />
          Upload
        </button>
        <button
          type="button"
          onClick={onChooseExisting}
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-primary/40 text-primary bg-white text-[12px] font-semibold hover:bg-primary/5 transition-colors cursor-pointer"
        >
          <Database size={13} />
          Choose Existing
        </button>
      </div>
      <div className="divide-y divide-border-light">
        {files.map(u => {
          const isSelected = selectedIds.has(u.id);
          return (
            <div key={u.id} className="flex items-center gap-3 px-3 py-2.5">
              <button
                type="button"
                role="checkbox"
                aria-checked={isSelected}
                onClick={() => onToggleOne(u.id)}
                aria-label={isSelected ? `Deselect ${u.name}` : `Select ${u.name}`}
                className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                  isSelected ? 'border-primary bg-primary text-white' : 'border-border bg-white text-transparent hover:border-primary/40'
                }`}
              >
                <Check size={11} strokeWidth={3} />
              </button>
              <div className="flex-1 min-w-0">
                <div className="text-[12.5px] font-semibold text-text truncate">{u.name}</div>
                <div className="text-[11px] text-text-muted">{humanSize(u.size)}</div>
              </div>
              {u.error && (
                <div className="flex items-center gap-1.5 text-[11.5px] text-risk shrink-0">
                  <AlertTriangle size={12} />
                  <span>{u.error}</span>
                </div>
              )}
              <button
                type="button"
                onClick={() => onRemove(u.id)}
                aria-label={`Remove ${u.name}`}
                className="p-1 text-text-muted hover:text-risk transition-colors cursor-pointer shrink-0"
              >
                <Trash2 size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ReviewStatusChip({ status }: { status: ReviewWorkflowStatus }) {
  const base = 'inline-flex items-center gap-1 px-2 h-5 rounded-full text-[10.5px] font-medium tracking-wide shrink-0 border';
  switch (status) {
    case 'mapped':
      return (
        <span className={`${base} bg-compliant-50 text-compliant-700 border-compliant/25`}>
          <Check size={10} strokeWidth={3} />
          Mapped
        </span>
      );
    case 'column':
      return (
        <span className={`${base} bg-mitigated-50 text-mitigated-700 border-mitigated/30`}>
          <AlertTriangle size={10} strokeWidth={2.5} />
          Column Mismatch
        </span>
      );
    case 'file':
      return (
        <span className={`${base} bg-risk/10 text-risk border-risk/30`}>
          <X size={10} strokeWidth={2.5} />
          File Mismatch
        </span>
      );
    case 'notmapped':
      return (
        <span className={`${base} bg-surface-2 text-text-muted border-border-light`}>
          <Minus size={10} strokeWidth={2.5} />
          Not Mapped
        </span>
      );
    case 'dropped':
      return (
        <span className={`${base} bg-text text-white border-text`}>
          Dropped from run
        </span>
      );
  }
}

function ReviewActionButton({
  variant,
  onClick,
  children,
}: {
  variant: 'primary' | 'danger';
  onClick: () => void;
  children: React.ReactNode;
}) {
  const cls =
    variant === 'primary'
      ? 'border-primary/25 text-primary bg-white hover:bg-primary/5'
      : 'border-border-light text-text-muted bg-white hover:text-risk hover:border-risk/30 hover:bg-risk/5';
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center px-2.5 h-7 rounded-md border text-[11.5px] font-medium transition-colors cursor-pointer ${cls}`}
    >
      {children}
    </button>
  );
}

function ReviewColumnMapper({
  columns,
  onUpdate,
  onConfirm,
}: {
  columns: ColumnMapping[];
  onUpdate: (idx: number, value: string) => void;
  onConfirm: () => void;
}) {
  const resolved = columns.filter(c => c.confidence !== 'missing').length;
  const missingCount = columns.length - resolved;
  const allResolved = missingCount === 0;
  return (
    <div className="border-t border-dashed border-border-light bg-surface-2/40 px-4 py-3.5">
      <div className="flex items-start justify-between mb-3 gap-3">
        <div className="min-w-0">
          <div className="text-[11.5px] font-semibold text-text">Column Mapping</div>
          <div className="text-[10.5px] text-text-muted mt-0.5">
            Map required schema columns to columns found in uploaded file. Fuzzy matches are auto-applied — verify or override.
          </div>
        </div>
        <div className="text-[10.5px] font-mono text-text-muted shrink-0">
          {resolved}/{columns.length} resolved
        </div>
      </div>

      <div className="rounded-lg border border-border-light bg-white p-3">
        <div className="grid grid-cols-[1fr_18px_1fr_60px] gap-3 text-[9.5px] uppercase tracking-wider text-text-muted/80 font-semibold pb-1.5 border-b border-border-light">
          <div>Required Column</div>
          <div></div>
          <div>Source Column</div>
          <div className="text-right">Match</div>
        </div>
        {columns.map((c, idx) => (
          <div
            key={`${c.required}-${idx}`}
            className="grid grid-cols-[1fr_18px_1fr_60px] gap-3 items-center py-2 border-b border-border-light/60 last:border-b-0"
          >
            <div className="text-[12px] font-mono text-text truncate">{c.required}</div>
            <ArrowRight size={12} className="text-text-muted/50" />
            <select
              value={c.matched ?? ''}
              onChange={e => onUpdate(idx, e.target.value)}
              className={`min-w-0 px-2 h-7 rounded-md border text-[11.5px] font-mono outline-none transition-colors cursor-pointer ${
                c.confidence === 'missing'
                  ? 'border-risk/40 bg-risk/5 text-risk'
                  : 'border-border-light bg-white text-text focus:border-primary/40 focus:ring-2 focus:ring-primary/10'
              }`}
            >
              {c.confidence === 'missing' && <option value="">— Select column —</option>}
              {AVAILABLE_COLUMNS.map(ac => (
                <option key={ac} value={ac}>{ac}</option>
              ))}
            </select>
            <div className="flex justify-end">
              {c.confidence === 'exact' && (
                <span className="inline-flex items-center px-1.5 h-5 rounded text-[9.5px] font-medium bg-compliant-50 text-compliant-700 border border-compliant/25">
                  exact
                </span>
              )}
              {c.confidence === 'fuzzy' && (
                <span className="inline-flex items-center px-1.5 h-5 rounded text-[9.5px] font-medium bg-mitigated-50 text-mitigated-700 border border-mitigated/30">
                  fuzzy
                </span>
              )}
              {c.confidence === 'missing' && (
                <span className="inline-flex items-center px-1.5 h-5 rounded text-[9.5px] font-medium bg-risk/10 text-risk border border-risk/30">
                  missing
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-3 gap-3">
        <div className="text-[10.5px] flex items-center gap-1.5 min-w-0">
          {allResolved ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-compliant" />
              <span className="text-text-muted">All required columns mapped — workflow will run with overrides</span>
            </>
          ) : (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-risk" />
              <span className="text-text-muted">
                {missingCount} column{missingCount === 1 ? '' : 's'} still need mapping to proceed
              </span>
            </>
          )}
        </div>
        <button
          type="button"
          onClick={onConfirm}
          disabled={!allResolved}
          className={`inline-flex items-center px-2.5 h-7 rounded-md border text-[11.5px] font-medium transition-colors shrink-0 ${
            allResolved
              ? 'border-primary/25 text-primary bg-white hover:bg-primary/5 cursor-pointer'
              : 'border-border-light text-text-muted/50 bg-white cursor-not-allowed'
          }`}
        >
          {allResolved ? 'Confirm Mapping' : 'Apply & Close'}
        </button>
      </div>
    </div>
  );
}

function Step3ReviewExecute({
  auditName,
  reviewWorkflows,
  uploadedCount,
  onBack,
  onExecute,
}: {
  auditName: string;
  reviewWorkflows: ReviewWorkflow[];
  uploadedCount: number;
  onBack: () => void;
  onExecute: () => void;
}) {
  const active = reviewWorkflows.filter(rw => rw.status === 'mapped' || rw.status === 'column');
  const skipped = reviewWorkflows.filter(rw => rw.status === 'dropped' || rw.status === 'file' || rw.status === 'notmapped');
  const totalRuntime = active.reduce((s, w) => s + w.runtime, 0);
  const maxRuntime = active.reduce((m, w) => Math.max(m, w.runtime), 0);
  const estRuntime = active.length > 0 ? maxRuntime + totalRuntime / 3 : 0;
  const overrides = reviewWorkflows.filter(rw => rw.hasOverrides && rw.status !== 'dropped');
  const today = new Date().toISOString().slice(0, 10);
  const reportName = `${auditName.trim() || 'BulkRun'}_${today}_BulkReport`;

  const skipReason = (rw: ReviewWorkflow) => {
    if (rw.status === 'dropped') return 'Dropped by user';
    if (rw.status === 'file') return 'File schema mismatch';
    if (rw.status === 'notmapped') return 'No file mapped';
    return '';
  };

  return (
    <>
      <div className="flex-1 overflow-y-auto px-6 py-5">
        <div className="mb-5">
          <div className="text-[10.5px] font-semibold uppercase tracking-wider text-primary mb-1">Final Review</div>
          <h3 className="text-[16px] font-semibold text-text">
            Ready to execute <span className="text-primary font-mono">{auditName.trim() || 'BulkRun'}</span>
          </h3>
          <p className="text-[12px] text-text-muted mt-1">
            Review the run summary below. Once executed, audit trail will be locked and results will be available in your engagement dashboard.
          </p>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-4">
          <Step3StatCard label="Workflows Running" value={String(active.length)} />
          <Step3StatCard label="Source Files" value={String(uploadedCount)} />
          <Step3StatCard label="Est. Runtime" value={`~${estRuntime.toFixed(1)}`} suffix="min" />
          <Step3StatCard label="Skipped / Dropped" value={String(skipped.length)} muted={skipped.length > 0} />
        </div>

        <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 mb-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary text-white flex items-center justify-center shrink-0">
            <FileText size={15} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-medium text-text-muted">Final Report</div>
            <div className="font-mono text-[13px] text-primary font-semibold truncate">{reportName}.xlsx</div>
            <div className="text-[11px] text-text-muted mt-0.5 truncate">
              Consolidated report with per-workflow sheets · exceptions flagged · linked back to RACM controls
            </div>
          </div>
          <button
            type="button"
            className="inline-flex items-center px-2.5 h-7 rounded-md border border-border-light bg-white text-[11.5px] font-medium text-text hover:bg-surface-2 transition-colors cursor-pointer shrink-0"
          >
            Rename
          </button>
        </div>

        {overrides.length > 0 && (
          <details className="mb-4 rounded-xl overflow-hidden border border-mitigated/30 bg-mitigated-50">
            <summary className="cursor-pointer p-3 flex items-center gap-2 text-[12px] font-medium text-mitigated-700">
              <AlertTriangle size={13} />
              <span className="flex-1">
                {overrides.length} workflow{overrides.length > 1 ? 's have' : ' has'} column overrides applied
              </span>
              <ChevronDown size={13} />
            </summary>
            <div className="px-3 pb-3 space-y-2 bg-white">
              {overrides.map(w => (
                <div key={w.id} className="pt-2.5 border-t border-border-light first:border-t-0">
                  <div className="text-[12.5px] font-medium text-text mb-1.5">
                    {w.name}
                    <span className="font-mono text-[10.5px] text-text-muted ml-1.5">{w.code}</span>
                  </div>
                  <div className="space-y-0.5">
                    {(w.columns ?? []).filter(c => c.confidence !== 'missing').map((c, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-[11px] font-mono">
                        <span className="text-text w-40 truncate">{c.required}</span>
                        <ArrowRight size={10} className="text-text-muted/60 shrink-0" />
                        <span className="text-primary truncate">{c.matched}</span>
                        <span className={`ml-auto inline-flex items-center px-1.5 h-4 rounded text-[9.5px] font-medium border ${
                          c.confidence === 'fuzzy'
                            ? 'bg-mitigated-50 text-mitigated-700 border-mitigated/30'
                            : 'bg-compliant-50 text-compliant-700 border-compliant/25'
                        }`}>
                          {c.confidence}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </details>
        )}

        <div className="mb-4">
          <div className="text-[10.5px] font-semibold uppercase tracking-wider text-text-muted mb-2">
            Running ({active.length})
          </div>
          <div className="rounded-xl border border-border-light bg-white divide-y divide-border-light overflow-hidden">
            {active.map(w => (
              <div key={w.id} className="flex items-center gap-3 px-4 py-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-compliant shrink-0" />
                <div className="font-mono text-[11px] text-text-muted/70 w-16 shrink-0">{w.code}</div>
                <div className="flex-1 text-[12.5px] text-text truncate">{w.name}</div>
                {w.hasOverrides && (
                  <span className="inline-flex items-center px-1.5 h-5 rounded text-[9.5px] font-medium bg-mitigated-50 text-mitigated-700 border border-mitigated/30 shrink-0">
                    overrides
                  </span>
                )}
                <div className="text-[11px] text-text-muted font-mono w-16 text-right shrink-0">~{w.runtime.toFixed(1)} min</div>
              </div>
            ))}
          </div>
        </div>

        {skipped.length > 0 && (
          <div>
            <div className="text-[10.5px] font-semibold uppercase tracking-wider text-text-muted mb-2">
              Skipped ({skipped.length})
            </div>
            <div className="rounded-xl border border-border-light bg-surface-2/40 divide-y divide-border-light/60 overflow-hidden">
              {skipped.map(w => (
                <div key={w.id} className="flex items-center gap-3 px-4 py-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-text-muted/60 shrink-0" />
                  <div className="font-mono text-[11px] text-text-muted/70 w-16 shrink-0">{w.code}</div>
                  <div className="flex-1 text-[12.5px] text-text-muted line-through truncate">{w.name}</div>
                  <div className="text-[11px] text-text-muted italic shrink-0">{skipReason(w)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="px-6 py-4 border-t border-border-light flex items-center justify-between shrink-0">
        <div className="text-[11.5px] text-text-muted">
          Ready · {active.length} workflow{active.length === 1 ? '' : 's'} · ~{estRuntime.toFixed(1)} min
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="px-4 h-9 rounded-md bg-white text-text border border-border text-[13px] font-semibold hover:bg-surface-2 transition-colors cursor-pointer"
          >
            Back
          </button>
          <button
            type="button"
            onClick={onExecute}
            disabled={active.length === 0}
            className={`flex items-center gap-2 px-4 h-9 rounded-md text-white text-[13px] font-semibold transition-colors ${
              active.length > 0 ? 'bg-primary hover:bg-primary-hover cursor-pointer' : 'bg-primary/40 cursor-not-allowed'
            }`}
          >
            Execute Bulk Run
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </>
  );
}

function Step3StatCard({
  label,
  value,
  suffix,
  muted,
}: {
  label: string;
  value: string;
  suffix?: string;
  muted?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border-light bg-white p-4">
      <div className={`font-mono text-[26px] font-medium leading-none tracking-tight ${muted ? 'text-text-muted' : 'text-text'}`}>
        {value}
        {suffix && <span className="text-[13px] text-text-muted ml-1 font-medium">{suffix}</span>}
      </div>
      <div className="text-[10px] font-semibold uppercase tracking-wider text-text-muted mt-2">{label}</div>
    </div>
  );
}
