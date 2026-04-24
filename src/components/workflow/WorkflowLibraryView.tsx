import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
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
  Copy,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { useToast } from '../shared/Toast';
interface Props {
  onCreateWorkflow: () => void;
  onSelectWorkflow: (id: string) => void;
}

export type LibraryWorkflow = {
  id: string;
  name: string;
  description: string;
  tags: string[];
};

export const LIBRARY_WORKFLOWS: LibraryWorkflow[] = [
  {
    id: 'lw-001',
    name: 'Identify Higher Share of Business Awarded to Higher Price Vendors (Monthly Analysis)',
    description: 'Identify Higher Share of Business Awarded to Higher Price Vendors (Monthly Analysis)',
    tags: ['p2p', 'pay to procure'],
  },
  {
    id: 'lw-002',
    name: 'To check whether same material sold at different rates to same customer',
    description: 'To check whether same material sold at different rates to same customer where later invoice unit rate is lower than the earlier one for the same material.',
    tags: ['O2C'],
  },
  {
    id: 'lw-003',
    name: 'Total Inventory by Community and Rev Status - 4',
    description: 'This workflow processes the inventory data to categorize revenue status, revenue type, bedroom buckets, price points, and community segments.',
    tags: ['INV'],
  },
  {
    id: 'lw-004',
    name: '"Invoice received by emaar" date should not be less than the invoice date',
    description: '"Invoice received by emaar" date should not be less than the invoice date',
    tags: ['P2P'],
  },
  {
    id: 'lw-005',
    name: '"Invoice received by emaar" date should not be less than the invoice date',
    description: '"Invoice received by emaar" date should not be less than the invoice date',
    tags: ['P2P'],
  },
  {
    id: 'lw-006',
    name: '2 way or 3 way match',
    description: '2 way/ 3 way match',
    tags: ['P2P'],
  },
  {
    id: 'lw-007',
    name: 'Access Session Duration Analysis',
    description: "Calculates duration between access 'IN' and 'OUT' events per code to audit session lengths and identify anomalies.",
    tags: [],
  },
  {
    id: 'lw-008',
    name: 'Accounting Document Reconciliation Report',
    description: 'Consolidates and filters SAP BKPF header entries to reconcile unique accounting documents by latest entry date.',
    tags: [],
  },
  {
    id: 'lw-009',
    name: 'Accounts Payable Aging Analysis',
    description: 'Presents payables across aging buckets to identify overdue liabilities and support cash flow management.',
    tags: ['test'],
  },
  {
    id: 'lw-010',
    name: 'Duplicate Invoice Detection',
    description: 'Scans incoming invoices against historical data to flag potential duplicates before payment processing.',
    tags: ['P2P', 'fraud'],
  },
];

const TOTAL_PAGES = 144;

export default function WorkflowLibraryView({ onCreateWorkflow, onSelectWorkflow }: Props) {
  const { addToast } = useToast();
  const [search, setSearch] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [rowsDropdownOpen, setRowsDropdownOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!search.trim()) return LIBRARY_WORKFLOWS;
    const q = search.toLowerCase();
    return LIBRARY_WORKFLOWS.filter(
      w => w.name.toLowerCase().includes(q) || w.description.toLowerCase().includes(q),
    );
  }, [search]);

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
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search workflow.."
              className="w-full pl-10 pr-4 h-10 rounded-md border border-border bg-white text-[13px] outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
            />
          </div>
          <button
            onClick={() => addToast({ message: 'Running all workflows…', type: 'success' })}
            className="flex items-center gap-2 px-4 h-10 rounded-md bg-white text-text border border-border text-[13px] font-semibold hover:bg-surface-2 transition-colors cursor-pointer"
          >
            <Play size={14} />
            Bulk Run
          </button>
          <button
            onClick={onCreateWorkflow}
            className="flex items-center gap-2 px-4 h-10 rounded-md bg-primary-xlight text-primary border border-primary/15 text-[13px] font-semibold hover:bg-primary/10 transition-colors cursor-pointer"
          >
            <Sparkles size={14} />
            Create Workflow
          </button>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto border-t border-border-light">
          <table className="w-full border-collapse">
            <thead className="bg-surface-2 sticky top-0 z-10">
              <tr>
                <th className="pl-0 pr-4 py-3.5 text-left text-[13px] font-semibold text-text">Workflow Name</th>
                <th className="px-4 py-3.5 text-left text-[13px] font-semibold text-text">Workflow Description</th>
                <th className="px-4 py-3.5 text-left text-[13px] font-semibold text-text w-[220px]">Tags</th>
                <th className="px-4 py-3.5 text-right text-[13px] font-semibold text-text w-[180px]" aria-label="Actions"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center text-[13px] text-text-muted">
                    No workflows match "{search}"
                  </td>
                </tr>
              ) : (
                filtered.map(wf => {
                  return (
                    <tr
                      key={wf.id}
                      onClick={() => onSelectWorkflow(wf.id)}
                      className="border-t border-border-light transition-colors hover:bg-surface-2/50 cursor-pointer"
                    >
                      <td className="pl-0 pr-4 py-4 align-top text-[13px] text-text font-medium max-w-[320px]">
                        {wf.name}
                      </td>
                      <td className="px-4 py-4 align-top text-[13px] text-text-secondary max-w-[520px]">
                        <span className="line-clamp-2">{wf.description}</span>
                      </td>
                      <td className="px-4 py-4 align-top">
                        <div className="flex flex-wrap gap-1.5">
                          {wf.tags.map(t => (
                            <span
                              key={t}
                              className="inline-flex items-center px-2 py-0.5 rounded-md bg-primary-xlight text-primary text-[12px] font-semibold"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-4 align-top">
                        <div className="flex items-center justify-end gap-1">
                          <ActionIconButton
                            label="Edit"
                            onClick={() => addToast({ message: `Editing "${wf.name}"`, type: 'success' })}
                          >
                            <Pencil size={14} />
                          </ActionIconButton>
                          <ActionIconButton
                            label="Duplicate"
                            onClick={() => addToast({ message: `Duplicated "${wf.name}"`, type: 'success' })}
                          >
                            <Copy size={14} />
                          </ActionIconButton>
                          <ActionIconButton
                            label="Re-run"
                            onClick={() => addToast({ message: `Re-running "${wf.name}"`, type: 'success' })}
                          >
                            <RefreshCw size={14} />
                          </ActionIconButton>
                          <ActionIconButton
                            label="Delete"
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

    </motion.div>
  );
}

function ActionIconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={e => { e.stopPropagation(); onClick(); }}
      className="w-8 h-8 rounded-md flex items-center justify-center text-text-muted hover:bg-surface-2 hover:text-text cursor-pointer transition-colors"
    >
      {children}
    </button>
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
