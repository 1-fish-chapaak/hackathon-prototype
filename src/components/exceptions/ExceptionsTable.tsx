import { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  Eye,
  Filter,
  GripVertical,
  MoreVertical,
  Pin,
  PinOff,
  Search,
  Tag,
  X,
  Check,
} from 'lucide-react';
import type {
  GrcException,
  GrcExceptionSeverity,
  GrcExceptionStatus,
  GrcExceptionClassification,
  GrcReviewStatus,
} from '../../data/mockData';
import type { ExceptionRole } from '../../hooks/useAppState';

// ─── Tokens ───
const SEVERITY_STYLE: Record<GrcExceptionSeverity, string> = {
  High:   'bg-high-50 text-high-700',
  Medium: 'bg-mitigated-50 text-mitigated-700',
  Low:    'bg-compliant-50 text-compliant-700',
};
const STATUS_STYLE: Record<GrcExceptionStatus, string> = {
  Open:           'bg-evidence-50 text-evidence-700',
  'Under Review': 'bg-mitigated-50 text-mitigated-700',
  Closed:         'bg-compliant-50 text-compliant-700',
};
const CLASSIFICATION_STYLE: Record<GrcExceptionClassification, string> = {
  Unclassified:                'bg-[#F4F2F7] text-ink-600',
  'Design Deficiency':         'bg-high-50 text-high-700',
  'System Deficiency':         'bg-risk-50 text-risk-700',
  'Procedural Non-Compliance': 'bg-brand-50 text-brand-700',
  'Business as Usual':         'bg-compliant-50 text-compliant-700',
  'False Positive':            'bg-[#EEEEF1] text-ink-600',
};
const REVIEW_STYLE: Record<GrcReviewStatus, string> = {
  Pending:     'bg-mitigated-50 text-mitigated-700',
  Approved:    'bg-compliant-50 text-compliant-700',
  Rejected:    'bg-risk-50 text-risk-700',
  Implemented: 'bg-compliant-50 text-compliant-700',
};

function Pill({ children, className }: { children: React.ReactNode; className: string }) {
  return (
    <span className={`inline-flex items-center h-6 px-2.5 text-[11px] font-medium rounded-full whitespace-nowrap ${className}`}>
      {children}
    </span>
  );
}

function PrimaryButton({ children, icon, onClick }: { children: React.ReactNode; icon?: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 h-7 px-3 text-[11.5px] font-semibold text-white bg-brand-600 rounded-[7px] hover:bg-brand-500 transition-colors cursor-pointer whitespace-nowrap"
    >
      {icon}
      {children}
    </button>
  );
}

function GhostButton({ children, icon, onClick }: { children: React.ReactNode; icon?: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 h-7 px-3 text-[11.5px] font-medium text-ink-700 bg-canvas-elevated border border-canvas-border rounded-[7px] hover:border-brand-200 hover:text-brand-700 transition-colors cursor-pointer whitespace-nowrap"
    >
      {icon}
      {children}
    </button>
  );
}

// ─── Column types ───
export type ColumnKey =
  | 'select'
  | 'id'
  | 'riskCategory'
  | 'severity'
  | 'status'
  | 'classification'
  | 'classReview'
  | 'actionReview'
  | 'lastUpdated'
  | 'classify'
  | 'action';

type PinSide = 'left' | 'right' | null;
type FilterValue = string[]; // multi-select; single-value search uses a single-item array.

interface ColumnDef {
  key: ColumnKey;
  label: string;
  alwaysVisible?: boolean;     // cannot be hidden
  alwaysPinned?: PinSide;      // fixed pin position
  draggable?: boolean;
  filterable?: boolean;
  filterOptions?: string[];
  filterMode?: 'multi' | 'text';
  accessor?: (ex: GrcException) => string;
  align?: 'left' | 'center';
  minWidth?: number;
}

const ALL_SEVERITIES: GrcExceptionSeverity[] = ['High', 'Medium', 'Low'];
const ALL_STATUSES:   GrcExceptionStatus[]   = ['Open', 'Under Review', 'Closed'];
const ALL_CLASSIFICATIONS: GrcExceptionClassification[] = [
  'Unclassified', 'Design Deficiency', 'System Deficiency', 'Procedural Non-Compliance', 'Business as Usual', 'False Positive',
];
const ALL_REVIEWS: GrcReviewStatus[] = ['Pending', 'Approved', 'Rejected', 'Implemented'];

function buildColumnDefs(role: ExceptionRole, riskCategories: string[]): ColumnDef[] {
  const base: ColumnDef[] = [
    { key: 'select',         label: '',               alwaysVisible: true,  alwaysPinned: 'left',  draggable: false, minWidth: 40 },
    { key: 'id',             label: 'Exception ID',   alwaysVisible: true,  draggable: true, filterable: true, filterMode: 'text', accessor: (e) => e.id },
    { key: 'riskCategory',   label: 'Risk Category',  draggable: true, filterable: true, filterMode: 'multi', filterOptions: riskCategories, accessor: (e) => e.riskCategory },
    { key: 'severity',       label: 'Severity',       draggable: true, filterable: true, filterMode: 'multi', filterOptions: ALL_SEVERITIES, accessor: (e) => e.severity },
    { key: 'status',         label: 'Status',         draggable: true, filterable: true, filterMode: 'multi', filterOptions: ALL_STATUSES, accessor: (e) => e.status },
    { key: 'classification', label: 'Classification', draggable: true, filterable: true, filterMode: 'multi', filterOptions: ALL_CLASSIFICATIONS, accessor: (e) => e.classification },
    { key: 'classReview',    label: 'Class. Review',  draggable: true, filterable: true, filterMode: 'multi', filterOptions: ALL_REVIEWS, accessor: (e) => e.classificationReview },
    { key: 'actionReview',   label: 'Action Review',  draggable: true, filterable: true, filterMode: 'multi', filterOptions: ALL_REVIEWS, accessor: (e) => e.actionReview },
    { key: 'lastUpdated',    label: 'Last Updated',   draggable: true, filterable: false, accessor: (e) => e.lastUpdated },
    { key: 'classify',       label: 'Classify',       alwaysVisible: true, alwaysPinned: 'right', draggable: false, align: 'center', minWidth: 150 },
  ];
  if (role === 'auditor') {
    base.push({ key: 'action', label: 'Action', alwaysVisible: true, alwaysPinned: 'right', draggable: false, align: 'center', minWidth: 150 });
  }
  return base;
}

// ─── Popover ───
function useOutsideClick<T extends HTMLElement>(onOutside: () => void) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const handler = (ev: MouseEvent) => {
      if (ref.current && !ref.current.contains(ev.target as Node)) onOutside();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onOutside]);
  return ref;
}

function Popover({
  open,
  onClose,
  children,
  className = '',
  align = 'start',
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  align?: 'start' | 'end';
}) {
  const ref = useOutsideClick<HTMLDivElement>(onClose);
  if (!open) return null;
  return (
    <div
      ref={ref}
      className={`absolute z-20 mt-1 bg-canvas-elevated border border-canvas-border rounded-[10px] shadow-xl ${
        align === 'end' ? 'right-0' : 'left-0'
      } ${className}`}
    >
      {children}
    </div>
  );
}

// ─── Columns toggle ───
function ColumnsToggle({
  columns,
  visibility,
  onVisibilityChange,
  onReset,
}: {
  columns: ColumnDef[];
  visibility: Record<ColumnKey, boolean>;
  onVisibilityChange: (key: ColumnKey, visible: boolean) => void;
  onReset: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 h-8 px-2.5 text-[12px] text-ink-600 bg-canvas-elevated border border-canvas-border rounded-[8px] hover:border-brand-200 cursor-pointer"
      >
        <Eye size={13} />
        Columns
      </button>
      <Popover open={open} onClose={() => setOpen(false)} align="end" className="w-[240px] py-1.5">
        <div className="px-3 py-2 border-b border-canvas-border flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-ink-500">Show columns</span>
          <button onClick={onReset} className="text-[11px] text-brand-700 hover:text-brand-600 cursor-pointer">Reset</button>
        </div>
        <ul className="py-1 max-h-[320px] overflow-y-auto">
          {columns.filter(c => c.label !== '').map(col => {
            const disabled = !!col.alwaysVisible;
            const checked = visibility[col.key];
            return (
              <li key={col.key}>
                <label
                  className={`flex items-center gap-2 px-3 py-1.5 text-[12.5px] ${
                    disabled ? 'text-ink-400 cursor-not-allowed' : 'text-ink-800 hover:bg-[#FAFAFB] cursor-pointer'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={disabled}
                    onChange={(e) => onVisibilityChange(col.key, e.target.checked)}
                    className="accent-brand-600 cursor-pointer"
                  />
                  {col.label}
                  {disabled && <span className="ml-auto text-[10px] text-ink-400">locked</span>}
                </label>
              </li>
            );
          })}
        </ul>
      </Popover>
    </div>
  );
}

// ─── Column header menu (filter + pin) ───
function HeaderMenu({
  col,
  filterValue,
  onFilterChange,
  pin,
  onPin,
}: {
  col: ColumnDef;
  filterValue: FilterValue;
  onFilterChange: (v: FilterValue) => void;
  pin: PinSide;
  onPin: (side: PinSide) => void;
}) {
  const [open, setOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const hasFilter = filterValue.length > 0;

  if (col.alwaysPinned) {
    return null;
  }

  return (
    <div className="relative inline-flex items-center gap-1 ml-auto">
      {col.filterable && (
        <div className="relative">
          <button
            onClick={() => { setFilterOpen(o => !o); setOpen(false); }}
            className={`w-5 h-5 flex items-center justify-center rounded cursor-pointer ${
              hasFilter ? 'text-brand-700 bg-brand-50' : 'text-ink-400 hover:text-brand-700 hover:bg-[#F4F2F7]'
            }`}
            aria-label={`Filter ${col.label}`}
          >
            <Filter size={11} />
          </button>
          <Popover
            open={filterOpen}
            onClose={() => setFilterOpen(false)}
            align="end"
            className="w-[220px] py-1.5 normal-case tracking-normal"
          >
            {col.filterMode === 'text' ? (
              <div className="p-2">
                <div className="relative">
                  <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-ink-400" />
                  <input
                    value={filterValue[0] ?? ''}
                    onChange={(e) => onFilterChange(e.target.value ? [e.target.value] : [])}
                    placeholder={`Search ${col.label.toLowerCase()}...`}
                    className="w-full h-8 pl-7 pr-2 text-[12px] bg-canvas-elevated border border-canvas-border rounded-[6px] focus:outline-none focus:border-brand-600"
                  />
                </div>
                {hasFilter && (
                  <button
                    onClick={() => onFilterChange([])}
                    className="mt-1.5 w-full text-[11px] text-ink-500 hover:text-brand-700 cursor-pointer text-left"
                  >
                    Clear filter
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="px-3 py-1.5 border-b border-canvas-border flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-ink-500">Filter</span>
                  {hasFilter && (
                    <button onClick={() => onFilterChange([])} className="text-[11px] text-brand-700 hover:text-brand-600 cursor-pointer">
                      Clear
                    </button>
                  )}
                </div>
                <ul className="py-1 max-h-[260px] overflow-y-auto">
                  {(col.filterOptions ?? []).map(opt => {
                    const checked = filterValue.includes(opt);
                    return (
                      <li key={opt}>
                        <label className="flex items-center gap-2 px-3 py-1.5 text-[12.5px] text-ink-800 hover:bg-[#FAFAFB] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => {
                              onFilterChange(
                                checked ? filterValue.filter(v => v !== opt) : [...filterValue, opt]
                              );
                            }}
                            className="accent-brand-600 cursor-pointer"
                          />
                          {opt}
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </Popover>
        </div>
      )}
      <div className="relative">
        <button
          onClick={() => { setOpen(o => !o); setFilterOpen(false); }}
          className="w-5 h-5 flex items-center justify-center rounded text-ink-400 hover:text-brand-700 hover:bg-[#F4F2F7] cursor-pointer"
          aria-label={`More options for ${col.label}`}
        >
          <MoreVertical size={11} />
        </button>
        <Popover open={open} onClose={() => setOpen(false)} align="end" className="w-[180px] py-1 normal-case tracking-normal">
          <button
            onClick={() => { onPin('left'); setOpen(false); }}
            className={`flex items-center gap-2 w-full text-left px-3 py-2 text-[12.5px] hover:bg-[#FAFAFB] cursor-pointer ${pin === 'left' ? 'text-brand-700' : 'text-ink-800'}`}
          >
            <Pin size={13} className="-rotate-45" />
            Pin to left
            {pin === 'left' && <Check size={13} className="ml-auto" />}
          </button>
          <button
            onClick={() => { onPin('right'); setOpen(false); }}
            className={`flex items-center gap-2 w-full text-left px-3 py-2 text-[12.5px] hover:bg-[#FAFAFB] cursor-pointer ${pin === 'right' ? 'text-brand-700' : 'text-ink-800'}`}
          >
            <Pin size={13} className="rotate-45" />
            Pin to right
            {pin === 'right' && <Check size={13} className="ml-auto" />}
          </button>
          {pin && (
            <button
              onClick={() => { onPin(null); setOpen(false); }}
              className="flex items-center gap-2 w-full text-left px-3 py-2 text-[12.5px] text-ink-800 hover:bg-[#FAFAFB] cursor-pointer border-t border-canvas-border"
            >
              <PinOff size={13} />
              Unpin
            </button>
          )}
        </Popover>
      </div>
    </div>
  );
}

// ─── Cell rendering ───
function renderCell(
  col: ColumnKey,
  ex: GrcException,
  role: ExceptionRole,
  selected: boolean,
  onToggleSelect: () => void,
  onOpenClassification: () => void,
  onOpenAction: () => void,
): React.ReactNode {
  const isOverdue = ex.flags?.includes('Overdue');
  const isBulk = ex.flags?.includes('Bulk');

  switch (col) {
    case 'select':
      return (
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggleSelect}
          className="accent-brand-600 cursor-pointer"
          aria-label={`Select ${ex.id}`}
        />
      );
    case 'id':
      return (
        <div className="flex flex-col gap-1">
          <button className="text-brand-700 font-medium text-[12.5px] font-mono hover:underline cursor-pointer text-left">
            {ex.id}
          </button>
          {(isOverdue || isBulk) && (
            <div className="flex items-center gap-1">
              {isOverdue && (
                <span className="inline-flex items-center gap-1 h-5 px-2 text-[10px] font-medium bg-risk-50 text-risk-700 rounded-full">
                  <AlertTriangle size={9} />
                  Overdue
                </span>
              )}
              {isBulk && (
                <span className="inline-flex items-center h-5 px-2 text-[10px] font-medium bg-brand-50 text-brand-700 rounded-full">
                  Bulk
                </span>
              )}
            </div>
          )}
        </div>
      );
    case 'riskCategory':
      return <span className="text-ink-800 text-[12.5px]">{ex.riskCategory}</span>;
    case 'severity':
      return <Pill className={SEVERITY_STYLE[ex.severity]}>{ex.severity}</Pill>;
    case 'status':
      return <Pill className={STATUS_STYLE[ex.status]}>{ex.status}</Pill>;
    case 'classification':
      return <Pill className={CLASSIFICATION_STYLE[ex.classification]}>{ex.classification}</Pill>;
    case 'classReview':
      return <Pill className={REVIEW_STYLE[ex.classificationReview]}>{ex.classificationReview}</Pill>;
    case 'actionReview':
      return <Pill className={REVIEW_STYLE[ex.actionReview]}>{ex.actionReview}</Pill>;
    case 'lastUpdated':
      return <span className="text-ink-500 text-[11.5px] tabular-nums whitespace-nowrap">{ex.lastUpdated}</span>;
    case 'classify': {
      if (role === 'risk-owner') {
        return ex.classification === 'Unclassified' ? (
          <PrimaryButton icon={<Tag size={12} />} onClick={onOpenClassification}>Classify</PrimaryButton>
        ) : (
          <GhostButton icon={<Eye size={12} />} onClick={onOpenClassification}>View</GhostButton>
        );
      }
      return ex.classificationReview === 'Pending' && ex.classification !== 'Unclassified' ? (
        <PrimaryButton icon={<Tag size={12} />} onClick={onOpenClassification}>Review Classification</PrimaryButton>
      ) : (
        <GhostButton icon={<Eye size={12} />} onClick={onOpenClassification}>View</GhostButton>
      );
    }
    case 'action': {
      if (role === 'risk-owner') {
        return <GhostButton icon={<Eye size={12} />} onClick={onOpenAction}>View</GhostButton>;
      }
      return ex.actionReview === 'Pending' && ex.classification !== 'Unclassified' ? (
        <PrimaryButton icon={<ArrowLeft size={12} className="rotate-180" />} onClick={onOpenAction}>Review Action</PrimaryButton>
      ) : (
        <GhostButton icon={<Eye size={12} />} onClick={onOpenAction}>View</GhostButton>
      );
    }
  }
}

// ─── Main table ───
export interface ExceptionsTableProps {
  exceptions: GrcException[];
  role: ExceptionRole;
  selected: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleAll: (allIds: string[]) => void;
  onOpenClassification: (ex: GrcException) => void;
  onOpenAction: (ex: GrcException) => void;
  headerExtras?: React.ReactNode;
}

type VisibilityMap = Record<ColumnKey, boolean>;
type PinsMap = Record<ColumnKey, PinSide>;
type FiltersMap = Record<ColumnKey, FilterValue>;

export default function ExceptionsTable({
  exceptions,
  role,
  selected,
  onToggleSelect,
  onToggleAll,
  onOpenClassification,
  onOpenAction,
  headerExtras,
}: ExceptionsTableProps) {
  const riskCategories = useMemo(
    () => Array.from(new Set(exceptions.map(e => e.riskCategory))).sort(),
    [exceptions],
  );
  const defs = useMemo(() => buildColumnDefs(role, riskCategories), [role, riskCategories]);
  const defByKey = useMemo(() => Object.fromEntries(defs.map(d => [d.key, d])) as Record<ColumnKey, ColumnDef>, [defs]);

  const defaultOrder = useMemo(() => defs.map(d => d.key), [defs]);
  const defaultVisibility = useMemo(() => {
    const v = {} as VisibilityMap;
    defs.forEach(d => { v[d.key] = true; });
    return v;
  }, [defs]);
  const defaultPins = useMemo(() => {
    const p = {} as PinsMap;
    defs.forEach(d => { p[d.key] = d.alwaysPinned ?? null; });
    return p;
  }, [defs]);
  const emptyFilters = useMemo(() => {
    const f = {} as FiltersMap;
    defs.forEach(d => { f[d.key] = []; });
    return f;
  }, [defs]);

  const [order, setOrder] = useState<ColumnKey[]>(defaultOrder);
  const [visibility, setVisibility] = useState<VisibilityMap>(defaultVisibility);
  const [pins, setPins] = useState<PinsMap>(defaultPins);
  const [filters, setFilters] = useState<FiltersMap>(emptyFilters);

  // Keep order/visibility/pins consistent when role changes (e.g. Auditor adds 'action' column).
  useEffect(() => {
    setOrder(prev => {
      const known = new Set(prev);
      const missing = defaultOrder.filter(k => !known.has(k));
      const trimmed = prev.filter(k => defaultOrder.includes(k));
      return [...trimmed, ...missing];
    });
    setVisibility(prev => {
      const next = { ...defaultVisibility };
      defaultOrder.forEach(k => { if (prev[k] !== undefined) next[k] = prev[k]; });
      return next;
    });
    setPins(prev => {
      const next = { ...defaultPins };
      defaultOrder.forEach(k => {
        const def = defByKey[k];
        next[k] = def.alwaysPinned ?? prev[k] ?? null;
      });
      return next;
    });
    setFilters(prev => {
      const next = { ...emptyFilters };
      defaultOrder.forEach(k => { if (prev[k] !== undefined) next[k] = prev[k]; });
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const resetVisibility = useCallback(() => setVisibility(defaultVisibility), [defaultVisibility]);

  // Drag-and-drop ordering (only among unpinned, non-locked columns).
  const [draggingKey, setDraggingKey] = useState<ColumnKey | null>(null);
  const [dropTargetKey, setDropTargetKey] = useState<ColumnKey | null>(null);

  const handleDragStart = (key: ColumnKey) => (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', key);
    setDraggingKey(key);
  };
  const handleDragOver = (key: ColumnKey) => (e: React.DragEvent) => {
    if (!draggingKey || draggingKey === key) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropTargetKey(key);
  };
  const handleDrop = (key: ColumnKey) => (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggingKey || draggingKey === key) {
      setDraggingKey(null); setDropTargetKey(null); return;
    }
    setOrder(prev => {
      const next = prev.filter(k => k !== draggingKey);
      const targetIdx = next.indexOf(key);
      if (targetIdx === -1) return prev;
      next.splice(targetIdx, 0, draggingKey);
      return next;
    });
    setDraggingKey(null); setDropTargetKey(null);
  };
  const handleDragEnd = () => { setDraggingKey(null); setDropTargetKey(null); };

  // Filter rows against active filters.
  const filteredExceptions = useMemo(() => {
    return exceptions.filter(ex => {
      for (const k of defaultOrder) {
        const def = defByKey[k];
        if (!def.filterable) continue;
        const value = filters[k];
        if (!value.length) continue;
        const actual = def.accessor?.(ex) ?? '';
        if (def.filterMode === 'text') {
          if (!actual.toLowerCase().includes(String(value[0]).toLowerCase())) return false;
        } else {
          if (!value.includes(actual)) return false;
        }
      }
      return true;
    });
  }, [exceptions, filters, defByKey, defaultOrder]);

  const allIds = useMemo(() => filteredExceptions.map(e => e.id), [filteredExceptions]);
  const allSelected = allIds.length > 0 && allIds.every(id => selected.has(id));

  // Compose render order: left-pinned (in order) → unpinned (in order) → right-pinned (in order).
  const renderOrder = useMemo(() => {
    const visible = order.filter(k => visibility[k]);
    const left = visible.filter(k => pins[k] === 'left');
    const right = visible.filter(k => pins[k] === 'right');
    const middle = visible.filter(k => !pins[k]);
    return [...left, ...middle, ...right];
  }, [order, visibility, pins]);

  const activeFilterCount = useMemo(
    () => Object.values(filters).reduce((sum, v) => sum + (v.length > 0 ? 1 : 0), 0),
    [filters],
  );

  return (
    <div className="bg-canvas-elevated border border-canvas-border rounded-[12px] overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-canvas-border gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-[13px] font-medium text-ink-700 tabular-nums">
            {filteredExceptions.length}{filteredExceptions.length !== exceptions.length ? ` / ${exceptions.length}` : ''} Exceptions
          </span>
          {activeFilterCount > 0 && (
            <button
              onClick={() => setFilters(emptyFilters)}
              className="inline-flex items-center gap-1.5 h-6 px-2 text-[11px] font-medium bg-brand-50 text-brand-700 rounded-full hover:bg-brand-100 cursor-pointer"
            >
              <Filter size={10} />
              {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''}
              <X size={10} />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <ColumnsToggle
            columns={defs}
            visibility={visibility}
            onVisibilityChange={(k, v) => setVisibility(prev => ({ ...prev, [k]: v }))}
            onReset={resetVisibility}
          />
          {headerExtras}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-[12.5px]">
          <thead>
            <tr className="bg-[#FAFAFB] border-b border-canvas-border text-left text-ink-500 uppercase tracking-wider">
              {renderOrder.map((key) => {
                const def = defByKey[key];
                const pinned = pins[key];
                const isDragTarget = dropTargetKey === key;
                const isDragging = draggingKey === key;
                const stickyStyle: React.CSSProperties = pinned
                  ? {
                      position: 'sticky',
                      [pinned === 'left' ? 'left' : 'right']: 0,
                      zIndex: 5,
                      background: '#FAFAFB',
                      boxShadow: pinned === 'left' ? '1px 0 0 var(--color-canvas-border)' : '-1px 0 0 var(--color-canvas-border)',
                    }
                  : {};
                return (
                  <th
                    key={key}
                    style={{ ...stickyStyle, minWidth: def.minWidth }}
                    draggable={def.draggable && !pinned}
                    onDragStart={def.draggable && !pinned ? handleDragStart(key) : undefined}
                    onDragOver={def.draggable && !pinned ? handleDragOver(key) : undefined}
                    onDrop={def.draggable && !pinned ? handleDrop(key) : undefined}
                    onDragEnd={handleDragEnd}
                    className={`px-3 py-3 font-medium text-[10.5px] align-middle transition-colors ${
                      def.align === 'center' ? 'text-center' : ''
                    } ${isDragTarget ? 'bg-brand-50' : ''} ${isDragging ? 'opacity-50' : ''}`}
                  >
                    <div className={`flex items-center gap-1 ${def.align === 'center' ? 'justify-center' : ''}`}>
                      {def.draggable && !pinned && (
                        <GripVertical size={11} className="text-ink-300 shrink-0 cursor-grab active:cursor-grabbing" />
                      )}
                      <span className="whitespace-nowrap">{def.label}</span>
                      {pinned && (
                        <Pin size={9} className={`text-brand-600 shrink-0 ${pinned === 'left' ? '-rotate-45' : 'rotate-45'}`} />
                      )}
                      {def.filterable || !def.alwaysPinned ? (
                        <HeaderMenu
                          col={def}
                          filterValue={filters[key] ?? []}
                          onFilterChange={(v) => setFilters(prev => ({ ...prev, [key]: v }))}
                          pin={pinned}
                          onPin={(side) => setPins(prev => ({ ...prev, [key]: side }))}
                        />
                      ) : null}
                      {key === 'select' && (
                        <input
                          type="checkbox"
                          checked={allSelected}
                          onChange={() => onToggleAll(allIds)}
                          className="accent-brand-600 cursor-pointer"
                          aria-label="Select all"
                        />
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {filteredExceptions.length === 0 ? (
              <tr>
                <td colSpan={renderOrder.length} className="px-6 py-10 text-center text-[13px] text-ink-500">
                  No exceptions match the active filters.
                </td>
              </tr>
            ) : (
              filteredExceptions.map((ex) => {
                const isOverdue = ex.flags?.includes('Overdue');
                const sel = selected.has(ex.id);
                const rowBg = isOverdue ? 'bg-risk-50/40' : sel ? 'bg-brand-50/60' : 'hover:bg-[#FAFAFB]';
                const rowBgForPin = isOverdue ? '#FEF3F2' : sel ? 'rgba(247,240,255,0.96)' : '#FFFFFF';
                return (
                  <tr key={ex.id} className={`border-b border-canvas-border last:border-b-0 transition-colors ${rowBg}`}>
                    {renderOrder.map((key) => {
                      const def = defByKey[key];
                      const pinned = pins[key];
                      const stickyStyle: React.CSSProperties = pinned
                        ? {
                            position: 'sticky',
                            [pinned === 'left' ? 'left' : 'right']: 0,
                            zIndex: 4,
                            background: rowBgForPin,
                            boxShadow: pinned === 'left' ? '1px 0 0 var(--color-canvas-border)' : '-1px 0 0 var(--color-canvas-border)',
                          }
                        : {};
                      return (
                        <td
                          key={key}
                          style={{ ...stickyStyle, minWidth: def.minWidth }}
                          className={`px-3 py-3 align-middle ${def.align === 'center' ? 'text-center' : ''} ${key === 'id' ? 'align-top' : ''}`}
                        >
                          {renderCell(
                            key,
                            ex,
                            role,
                            sel,
                            () => onToggleSelect(ex.id),
                            () => onOpenClassification(ex),
                            () => onOpenAction(ex),
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
