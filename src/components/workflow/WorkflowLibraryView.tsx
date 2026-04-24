import { useEffect, useMemo, useState } from 'react';
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
} from 'lucide-react';
import { DATA_SOURCES } from '../../data/mockData';
import { useToast } from '../shared/Toast';

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
const FILE_SOURCE_COLUMNS: Record<string, string[]> = {
  'AP Invoice Register': ['invoice_no', 'vendor_id', 'amount', 'invoice_date', 'gl_account_code', 'entered_by_user', 'post_status', 'payment_terms'],
  'Vendor Master': ['vendor_id', 'vendor_name', 'approval_status', 'payment_terms', 'country_iso', 'tax_id'],
  'GL Trial Balance': ['account_number', 'period_end_date', 'debit_amount', 'credit_amount', 'currency_code', 'cost_center'],
};

type MapStatus = 'exact' | 'fuzzy' | 'missing';
type ExpectedColumn = { file: string; expected: string; autoMatch: string | null; autoStatus: MapStatus };

// Deterministic expected-column set per workflow (dummy for the bulk-mapping review)
function expectedColumnsFor(wf: LibraryWorkflow): ExpectedColumn[] {
  switch (wf.businessProcess) {
    case 'P2P':
      return [
        { file: 'AP Invoice Register', expected: 'Invoice Number', autoMatch: 'invoice_no', autoStatus: 'exact' },
        { file: 'AP Invoice Register', expected: 'Vendor ID', autoMatch: 'vendor_id', autoStatus: 'exact' },
        { file: 'AP Invoice Register', expected: 'Invoice Amount', autoMatch: 'amount', autoStatus: 'fuzzy' },
        { file: 'Vendor Master', expected: 'Approved Vendor Flag', autoMatch: 'approval_status', autoStatus: 'fuzzy' },
        { file: 'AP Invoice Register', expected: 'Three-way Match Ref', autoMatch: null, autoStatus: 'missing' },
      ];
    case 'Finance':
      return [
        { file: 'GL Trial Balance', expected: 'Account Number', autoMatch: 'account_number', autoStatus: 'exact' },
        { file: 'GL Trial Balance', expected: 'Period End', autoMatch: 'period_end_date', autoStatus: 'fuzzy' },
        { file: 'GL Trial Balance', expected: 'Debit Amount', autoMatch: 'debit_amount', autoStatus: 'exact' },
        { file: 'GL Trial Balance', expected: 'Credit Amount', autoMatch: 'credit_amount', autoStatus: 'exact' },
        { file: 'AP Invoice Register', expected: 'Invoice Date', autoMatch: 'invoice_date', autoStatus: 'exact' },
      ];
    default:
      return [
        { file: 'AP Invoice Register', expected: 'Entered By', autoMatch: 'entered_by_user', autoStatus: 'fuzzy' },
        { file: 'AP Invoice Register', expected: 'Post Status', autoMatch: 'post_status', autoStatus: 'exact' },
        { file: 'Vendor Master', expected: 'Vendor Name', autoMatch: 'vendor_name', autoStatus: 'exact' },
        { file: 'Vendor Master', expected: 'Country', autoMatch: 'country_iso', autoStatus: 'fuzzy' },
      ];
  }
}

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
    addToast({ type: 'success', message: `"${data.auditName}" captured. Data Source step coming next.` });
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
  const [modalDeselected, setModalDeselected] = useState<Set<string>>(new Set());
  const [auditName, setAuditName] = useState('');
  const [auditDescription, setAuditDescription] = useState('');
  const [frequency, setFrequency] = useState<Frequency>('Daily');
  const [triggerOn, setTriggerOn] = useState<Trigger>('Schedule');
  const [runTime, setRunTime] = useState('06:00');
  const [retry, setRetry] = useState<Retry>('3x');
  const [isFetching, setIsFetching] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  // Step 2 state
  const [requiredFilesOpen, setRequiredFilesOpen] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(true);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dsSearch, setDsSearch] = useState('');
  const [linkedSourceId, setLinkedSourceId] = useState<string | null>(null);
  // Step 2 — Review state
  const [reviewFilter, setReviewFilter] = useState<'all' | 'mapped' | 'attention' | 'removed'>('all');
  const [expandedWfId, setExpandedWfId] = useState<string | null>(null);
  const [columnMappings, setColumnMappings] = useState<Record<string, Record<string, string>>>({});

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
      setStep(2);
    }, 2200);
  };

  const handleStep2Continue = () => {
    if (uploadedFiles.length === 0 && !linkedSourceId) {
      addToast({
        type: 'error',
        message: 'Upload files or link an existing data source before continuing.',
      });
      return;
    }
    const attention = workflowReview.filter(r => r.status === 'attention').length;
    if (attention > 0) {
      addToast({
        type: 'error',
        message: `${attention} workflow${attention === 1 ? '' : 's'} still need column mapping. Resolve or remove them before continuing.`,
      });
      return;
    }
    const mapped = workflowReview.filter(r => r.status === 'mapped').length;
    if (mapped === 0) {
      addToast({
        type: 'error',
        message: 'No workflows are ready to run. Map at least one workflow.',
      });
      return;
    }
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
      setUploadedFiles(prev => [...prev, ...files]);
      setLinkedSourceId(null);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length > 0) {
      setUploadedFiles(prev => [...prev, ...files]);
      setLinkedSourceId(null);
    }
    e.target.value = '';
  };

  const removeUpload = (idx: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const pickDataSource = (id: string) => {
    setLinkedSourceId(id);
    setUploadedFiles([]);
  };

  const filteredDataSources = DATA_SOURCES.filter(ds =>
    ds.name.toLowerCase().includes(dsSearch.trim().toLowerCase())
  );

  const hasUpload = uploadedFiles.length > 0 || linkedSourceId !== null;

  // Per-workflow review data — resolves current column mapping and overall status
  const workflowReview = useMemo(() => {
    return selectedWorkflows.map(wf => {
      const expected = expectedColumnsFor(wf);
      const resolved = expected.map(ec => {
        const override = columnMappings[wf.id]?.[ec.expected];
        const current = override !== undefined ? override : (ec.autoMatch ?? '');
        let currentStatus: MapStatus;
        if (!current) currentStatus = 'missing';
        else if (current === ec.autoMatch) currentStatus = ec.autoStatus === 'exact' ? 'exact' : 'fuzzy';
        else currentStatus = 'fuzzy';
        return { ...ec, current, currentStatus };
      });
      const missingCount = resolved.filter(r => !r.current).length;
      const removed = modalDeselected.has(wf.id);
      const status: 'mapped' | 'attention' | 'removed' = removed
        ? 'removed'
        : missingCount === 0
        ? 'mapped'
        : 'attention';
      return { wf, expected: resolved, status, missingCount };
    });
  }, [selectedWorkflows, columnMappings, modalDeselected]);

  const reviewCounts = useMemo(() => ({
    all: workflowReview.length,
    mapped: workflowReview.filter(r => r.status === 'mapped').length,
    attention: workflowReview.filter(r => r.status === 'attention').length,
    removed: workflowReview.filter(r => r.status === 'removed').length,
  }), [workflowReview]);

  const filteredReview = useMemo(() => {
    if (reviewFilter === 'all') return workflowReview;
    return workflowReview.filter(r => r.status === reviewFilter);
  }, [reviewFilter, workflowReview]);

  const setColumnMapping = (wfId: string, expected: string, source: string) => {
    setColumnMappings(prev => ({
      ...prev,
      [wfId]: { ...(prev[wfId] ?? {}), [expected]: source },
    }));
  };

  const removeFromBulkRun = (wfId: string) => {
    setModalDeselected(prev => {
      const next = new Set(prev);
      next.add(wfId);
      return next;
    });
    setExpandedWfId(prev => (prev === wfId ? null : prev));
  };

  const restoreToBulkRun = (wfId: string) => {
    setModalDeselected(prev => {
      const next = new Set(prev);
      next.delete(wfId);
      return next;
    });
  };

  const step2CanContinue = hasUpload && reviewCounts.attention === 0 && reviewCounts.mapped > 0;

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
        className="relative bg-white rounded-2xl shadow-2xl w-[720px] max-h-[85vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-border-light flex items-center justify-between shrink-0">
          <h3 className="text-[16px] font-semibold text-text">Bulk Execute</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-surface-2 rounded-md transition-colors cursor-pointer" aria-label="Close">
            <X size={16} className="text-text-muted" />
          </button>
        </div>

        {/* Stepper */}
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
        ) : (
        <>
        {/* Body — Step 2 */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
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
              <div className="px-4 pb-4 grid grid-cols-2 gap-3 border-t border-border-light pt-3">
                {/* Dropzone */}
                <label
                  onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleFileDrop}
                  className={`flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed cursor-pointer transition-colors min-h-[220px] px-4 py-6 ${
                    isDragging
                      ? 'border-primary bg-primary/5'
                      : 'border-primary/30 bg-primary-xlight/40 hover:border-primary/50 hover:bg-primary/5'
                  }`}
                >
                  <input
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".csv,.pdf,.png,.jpg,.jpeg,.xlsx"
                  />
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
                  {uploadedFiles.length > 0 && (
                    <div className="w-full mt-1 space-y-1.5">
                      {uploadedFiles.map((f, i) => (
                        <div
                          key={`${f.name}-${i}`}
                          className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-white border border-border-light"
                        >
                          <FileText size={12} className="text-text-muted shrink-0" />
                          <span className="flex-1 min-w-0 truncate text-[12px] text-text">{f.name}</span>
                          <button
                            type="button"
                            onClick={e => { e.preventDefault(); removeUpload(i); }}
                            className="p-0.5 text-text-muted hover:text-risk transition-colors cursor-pointer"
                            aria-label={`Remove ${f.name}`}
                          >
                            <X size={11} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </label>

                {/* Existing data sources */}
                <div className="rounded-lg border border-border-light bg-white p-3 flex flex-col min-h-[220px]">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-text-muted text-center mb-2">
                    Or link from existing data source
                  </div>
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
                        const isLinked = linkedSourceId === ds.id;
                        return (
                          <button
                            key={ds.id}
                            type="button"
                            onClick={() => pickDataSource(ds.id)}
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
                            <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                              isLinked ? 'border-primary' : 'border-border'
                            }`}>
                              {isLinked && <span className="w-2 h-2 rounded-full bg-primary" />}
                            </span>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Review mapping — appears after upload or data-source link */}
          {hasUpload && (
            <div className="rounded-lg border border-border-light bg-white">
              {/* Header + stats */}
              <div className="px-4 pt-3 pb-3 border-b border-border-light">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[13px] font-semibold text-text">Review data source mapping</div>
                    <div className="text-[11.5px] text-text-muted mt-0.5">
                      {linkedSourceId
                        ? `Linked to ${DATA_SOURCES.find(d => d.id === linkedSourceId)?.name ?? 'source'}`
                        : `${uploadedFiles.length} file${uploadedFiles.length === 1 ? '' : 's'} uploaded · auto-matched to required inputs`}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-3">
                  <div className="rounded-md border border-compliant/25 bg-compliant-50 px-3 py-2">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-compliant-700">Ready to run</div>
                    <div className="text-[18px] font-semibold text-compliant-700 leading-tight mt-0.5">
                      {reviewCounts.mapped}<span className="text-[12px] text-compliant-700/70 font-medium"> / {reviewCounts.all}</span>
                    </div>
                  </div>
                  <div className={`rounded-md border px-3 py-2 ${reviewCounts.attention > 0 ? 'border-mitigated/30 bg-mitigated-50' : 'border-border-light bg-surface-2/40'}`}>
                    <div className={`text-[10px] font-semibold uppercase tracking-wider ${reviewCounts.attention > 0 ? 'text-mitigated-700' : 'text-text-muted'}`}>Needs attention</div>
                    <div className={`text-[18px] font-semibold leading-tight mt-0.5 ${reviewCounts.attention > 0 ? 'text-mitigated-700' : 'text-text'}`}>
                      {reviewCounts.attention}
                    </div>
                  </div>
                  <div className="rounded-md border border-border-light bg-surface-2/40 px-3 py-2">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">Removed</div>
                    <div className="text-[18px] font-semibold text-text leading-tight mt-0.5">{reviewCounts.removed}</div>
                  </div>
                </div>

                {/* Filter chips */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {([
                    { key: 'all', label: 'All', count: reviewCounts.all },
                    { key: 'mapped', label: 'Mapped', count: reviewCounts.mapped },
                    { key: 'attention', label: 'Needs attention', count: reviewCounts.attention },
                    { key: 'removed', label: 'Removed', count: reviewCounts.removed },
                  ] as const).map(f => {
                    const active = reviewFilter === f.key;
                    return (
                      <button
                        key={f.key}
                        type="button"
                        onClick={() => setReviewFilter(f.key)}
                        className={`inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full border text-[11.5px] font-medium transition-colors cursor-pointer ${
                          active
                            ? 'border-primary bg-primary text-white'
                            : 'border-border-light bg-white text-text-muted hover:border-primary/30 hover:text-text'
                        }`}
                      >
                        {f.label}
                        <span className={`inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full text-[10px] font-semibold ${
                          active ? 'bg-white/25 text-white' : 'bg-surface-2 text-text-muted'
                        }`}>
                          {f.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Source file tiles */}
              <div className="px-4 pt-3">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-text-muted mb-2">Source files</div>
                <div className="flex flex-wrap gap-1.5">
                  {REQUIRED_FILES.map(f => (
                    <div
                      key={f.name}
                      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md border border-border-light bg-surface-2/40"
                    >
                      <FileText size={11} className="text-text-muted" />
                      <span className="text-[11.5px] font-medium text-text">{f.name}</span>
                      <span className="text-[10px] font-mono text-text-muted">{f.format}</span>
                      <span className="inline-flex items-center gap-0.5 text-[9.5px] font-semibold uppercase tracking-wide text-compliant-700">
                        <Check size={9} strokeWidth={3} />
                        Mapped
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Workflow rows */}
              <div className="p-4 space-y-1.5">
                {filteredReview.length === 0 ? (
                  <div className="text-[12px] text-text-muted text-center py-6">
                    No workflows match this filter.
                  </div>
                ) : (
                  filteredReview.map(({ wf, expected, status }) => {
                    const expanded = expandedWfId === wf.id;
                    const isRemoved = status === 'removed';
                    return (
                      <div
                        key={wf.id}
                        className={`rounded-md border overflow-hidden transition-colors ${
                          isRemoved ? 'border-border-light bg-surface-2/40' : 'border-border-light bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-2 px-3 py-2">
                          <button
                            type="button"
                            onClick={() => !isRemoved && setExpandedWfId(prev => (prev === wf.id ? null : wf.id))}
                            disabled={isRemoved}
                            className={`p-0.5 transition-colors ${
                              isRemoved
                                ? 'text-text-muted/40 cursor-not-allowed'
                                : 'text-text-muted hover:text-text cursor-pointer'
                            }`}
                            aria-label={expanded ? 'Collapse mapper' : 'Expand mapper'}
                          >
                            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className={`text-[12.5px] font-semibold truncate ${
                              isRemoved ? 'text-text-muted line-through' : 'text-text'
                            }`}>
                              {wf.name}
                            </div>
                            <div className="text-[10.5px] text-text-muted truncate">
                              {wf.businessProcess} · <span className="font-mono">{wf.controlId}</span>
                            </div>
                          </div>
                          {/* Status chip */}
                          {status === 'mapped' && (
                            <span className="inline-flex items-center gap-1 px-1.5 h-5 rounded text-[10px] font-semibold uppercase tracking-wide bg-compliant-50 text-compliant-700 border border-compliant/25">
                              <Check size={9} strokeWidth={3} />
                              Mapped
                            </span>
                          )}
                          {status === 'attention' && (
                            <span className="inline-flex items-center gap-1 px-1.5 h-5 rounded text-[10px] font-semibold uppercase tracking-wide bg-mitigated-50 text-mitigated-700 border border-mitigated/30">
                              Needs Attention
                            </span>
                          )}
                          {status === 'removed' && (
                            <span className="inline-flex items-center gap-1 px-1.5 h-5 rounded text-[10px] font-semibold uppercase tracking-wide bg-surface-2 text-text-muted border border-border-light">
                              Removed
                            </span>
                          )}
                          {/* Remove / Restore */}
                          {isRemoved ? (
                            <button
                              type="button"
                              onClick={() => restoreToBulkRun(wf.id)}
                              className="px-2 h-6 rounded-md text-[11px] font-semibold text-primary bg-primary/10 hover:bg-primary/20 transition-colors cursor-pointer shrink-0"
                            >
                              Restore
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => removeFromBulkRun(wf.id)}
                              className="px-2 h-6 rounded-md text-[11px] font-semibold text-text-muted border border-border-light bg-white hover:text-risk hover:border-risk/30 hover:bg-risk/5 transition-colors cursor-pointer shrink-0"
                            >
                              Remove
                            </button>
                          )}
                        </div>

                        {expanded && !isRemoved && (
                          <div className="border-t border-border-light bg-surface-2/30 px-3 py-2.5 space-y-1.5">
                            <div className="text-[10px] font-semibold uppercase tracking-wider text-text-muted mb-1">
                              Map expected columns
                            </div>
                            {expected.map(ec => (
                              <div key={ec.expected} className="flex items-center gap-2">
                                <div className="w-[180px] min-w-0 shrink-0">
                                  <div className="text-[12px] font-medium text-text truncate">{ec.expected}</div>
                                  <div className="text-[10px] text-text-muted truncate">{ec.file}</div>
                                </div>
                                <ArrowRight size={11} className="text-text-muted shrink-0" />
                                <select
                                  value={ec.current}
                                  onChange={e => setColumnMapping(wf.id, ec.expected, e.target.value)}
                                  className="flex-1 min-w-0 px-2 h-7 rounded-md border border-border-light text-[11.5px] text-text bg-white font-mono outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all cursor-pointer"
                                >
                                  <option value="">— Not mapped —</option>
                                  {(FILE_SOURCE_COLUMNS[ec.file] ?? []).map(sc => (
                                    <option key={sc} value={sc}>{sc}</option>
                                  ))}
                                </select>
                                {ec.currentStatus === 'exact' && (
                                  <span className="inline-flex items-center px-1.5 h-5 rounded text-[9.5px] font-semibold uppercase tracking-wide bg-compliant-50 text-compliant-700 border border-compliant/25 shrink-0 w-[58px] justify-center">
                                    Exact
                                  </span>
                                )}
                                {ec.currentStatus === 'fuzzy' && (
                                  <span className="inline-flex items-center px-1.5 h-5 rounded text-[9.5px] font-semibold uppercase tracking-wide bg-mitigated-50 text-mitigated-700 border border-mitigated/30 shrink-0 w-[58px] justify-center">
                                    Fuzzy
                                  </span>
                                )}
                                {ec.currentStatus === 'missing' && (
                                  <span className="inline-flex items-center px-1.5 h-5 rounded text-[9.5px] font-semibold uppercase tracking-wide bg-risk/10 text-risk border border-risk/30 shrink-0 w-[58px] justify-center">
                                    Missing
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
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
            onClick={() => setStep(1)}
            className="px-4 h-9 rounded-md bg-white text-text border border-border text-[13px] font-semibold hover:bg-surface-2 transition-colors cursor-pointer"
          >
            Back
          </button>
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
        </div>
        </>
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
