import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Database, FileText, Globe, Cloud, MessageSquare, Layers,
  Search, Upload, MoreHorizontal, ArrowUpDown, ChevronDown, Plus,
} from 'lucide-react';
import { useToast } from '../shared/Toast';

// ─── Source shape & seed data ────────────────────────────────────────────────

type SourceType = 'file' | 'database' | 'api' | 'cloud' | 'session';

interface DataSource {
  id: string;
  name: string;
  type: SourceType;
  /** Sub-detail shown under the name (file format, db engine, api method, cloud provider, etc.) */
  subtype: string;
  createdAt: string; // ISO date
}

const TODAY = new Date('2026-04-23');
const dayOffset = (n: number) => {
  const d = new Date(TODAY);
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};

const SEED: DataSource[] = [
  // ── Files (manual uploads) ──
  { id: 'f-01', name: 'AI_Fare Audit',                         type: 'file', subtype: 'XLSX · 12.4 MB', createdAt: dayOffset(0) },
  { id: 'f-02', name: 'PWC Status',                            type: 'file', subtype: 'PDF · 2.1 MB',   createdAt: dayOffset(0) },
  { id: 'f-03', name: 'Emaar Extraction',                      type: 'file', subtype: 'CSV · 4.8 MB',   createdAt: dayOffset(3) },
  { id: 'f-04', name: 'Emaar Payment Extraction',              type: 'file', subtype: 'XLSX · 6.2 MB',  createdAt: dayOffset(3) },
  { id: 'f-05', name: 'Loan Details Extraction',               type: 'file', subtype: 'PDF · 8.7 MB',   createdAt: dayOffset(3) },
  { id: 'f-06', name: 'Import Remittance — Bank Demo',         type: 'file', subtype: 'CSV · 1.4 MB',   createdAt: dayOffset(3) },
  { id: 'f-07', name: 'Media Demo',                            type: 'file', subtype: 'XLSX · 9.1 MB',  createdAt: dayOffset(6) },
  { id: 'f-08', name: 'Demo Invoice Data 1604',                type: 'file', subtype: 'CSV · 3.3 MB',   createdAt: dayOffset(7) },
  { id: 'f-09', name: 'Demo Agreements',                       type: 'file', subtype: 'PDF · 11.2 MB',  createdAt: dayOffset(7) },
  { id: 'f-10', name: 'MB5B Demo',                             type: 'file', subtype: 'XLSX · 5.7 MB',  createdAt: dayOffset(7) },
  { id: 'f-11', name: 'Air India HR KPI — Dummy Employees',    type: 'file', subtype: 'CSV · 2.9 MB',   createdAt: dayOffset(8) },
  { id: 'f-12', name: 'NSE Agreement Sample',                  type: 'file', subtype: 'PDF · 4.4 MB',   createdAt: dayOffset(9) },
  { id: 'f-13', name: 'NSE AP Analytics',                      type: 'file', subtype: 'XLSX · 7.6 MB',  createdAt: dayOffset(9) },
  { id: 'f-14', name: 'NSE Position Limits Monitoring',        type: 'file', subtype: 'CSV · 1.8 MB',   createdAt: dayOffset(11) },
  { id: 'f-15', name: 'NSE Penalty on Shortfall Margin',       type: 'file', subtype: 'XLSX · 3.5 MB',  createdAt: dayOffset(11) },
  { id: 'f-16', name: 'Air India HR KPI — Bills vs Reimbursement', type: 'file', subtype: 'XLSX · 6.0 MB', createdAt: dayOffset(13) },

  // ── Databases ──
  { id: 'db-01', name: 'SAP ERP — AP Module',     type: 'database', subtype: 'Oracle · 1.2M rows', createdAt: dayOffset(0) },
  { id: 'db-02', name: 'Vendor Master',           type: 'database', subtype: 'PostgreSQL · 892 rows', createdAt: dayOffset(2) },
  { id: 'db-03', name: 'GL Transaction History',  type: 'database', subtype: 'Snowflake · 3.8M rows', createdAt: dayOffset(5) },
  { id: 'db-04', name: 'Workday HRIS',            type: 'database', subtype: 'PostgreSQL · 234 rows', createdAt: dayOffset(10) },

  // ── APIs ──
  { id: 'api-01', name: 'Workday Access Events',         type: 'api', subtype: 'REST · OAuth2',     createdAt: dayOffset(2) },
  { id: 'api-02', name: 'NetSuite Vendors',              type: 'api', subtype: 'REST · API Key',    createdAt: dayOffset(6) },
  { id: 'api-03', name: 'JIRA Audit Issues',             type: 'api', subtype: 'REST · OAuth2',     createdAt: dayOffset(12) },

  // ── Cloud ──
  { id: 'cl-01', name: 'S3 — auditify-evidence-bucket',  type: 'cloud', subtype: 'AWS S3',          createdAt: dayOffset(0) },
  { id: 'cl-02', name: 'Google Drive — Q1 Workpapers',   type: 'cloud', subtype: 'Google Drive',    createdAt: dayOffset(4) },
  { id: 'cl-03', name: 'SharePoint — Audit Library',     type: 'cloud', subtype: 'Microsoft 365',   createdAt: dayOffset(15) },

  // ── Session files (chat-attached) ──
  { id: 'sf-01', name: 'IRA chat — JE anomaly samples',  type: 'session', subtype: 'CSV · linked to ch-005', createdAt: dayOffset(0) },
  { id: 'sf-02', name: 'IRA chat — Vendor concentration', type: 'session', subtype: 'XLSX · linked to ch-002', createdAt: dayOffset(2) },
  { id: 'sf-03', name: 'IRA chat — SOX deficiencies',    type: 'session', subtype: 'PDF · linked to ch-003',  createdAt: dayOffset(8) },
  { id: 'sf-04', name: 'IRA chat — Privileged access',   type: 'session', subtype: 'CSV · linked to ch-001',  createdAt: dayOffset(14) },
];

// ─── Tab definitions ─────────────────────────────────────────────────────────

type TabId = 'all' | 'file' | 'integrated';

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'all',        label: 'All',            icon: Layers },
  { id: 'file',       label: 'Files',          icon: FileText },
  { id: 'integrated', label: 'Integrated DBs', icon: Database },
];

const INTEGRATED_TYPES: SourceType[] = ['database', 'api', 'cloud', 'session'];

const TYPE_META: Record<SourceType, { icon: React.ElementType; tone: string }> = {
  file:     { icon: FileText,       tone: 'text-brand-700 bg-brand-50' },
  database: { icon: Database,       tone: 'text-evidence-700 bg-evidence-50' },
  api:      { icon: Globe,          tone: 'text-mitigated-700 bg-mitigated-50' },
  cloud:    { icon: Cloud,          tone: 'text-compliant-700 bg-compliant-50' },
  session:  { icon: MessageSquare,  tone: 'text-ink-700 bg-paper-100' },
};

// ─── Time bucketing ──────────────────────────────────────────────────────────

const DAY_MS = 24 * 60 * 60 * 1000;

interface Bucket { id: string; label: string; items: DataSource[]; }

function bucketByDate(items: DataSource[]): Bucket[] {
  const buckets: Bucket[] = [
    { id: 'today',   label: 'Today',       items: [] },
    { id: 'week',    label: 'Last 7 days', items: [] },
    { id: 'earlier', label: 'Earlier',     items: [] },
  ];
  items.forEach(d => {
    const created = new Date(d.createdAt);
    const ageMs = TODAY.getTime() - created.getTime();
    if (created.toDateString() === TODAY.toDateString()) buckets[0].items.push(d);
    else if (ageMs < 7 * DAY_MS) buckets[1].items.push(d);
    else buckets[2].items.push(d);
  });
  return buckets.filter(b => b.items.length > 0);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ─── Source card ─────────────────────────────────────────────────────────────

function SourceCard({ source, onMenu }: { source: DataSource; onMenu: () => void }) {
  const { icon: Icon, tone } = TYPE_META[source.type];
  return (
    <button
      type="button"
      className="group flex items-center gap-3 px-4 h-16 rounded-lg bg-canvas-elevated border border-canvas-border hover:border-brand-200 hover:bg-brand-50/30 transition-colors cursor-pointer text-left"
    >
      <div className={`w-9 h-9 rounded-md flex items-center justify-center shrink-0 ${tone}`}>
        <Icon size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-semibold text-ink-900 truncate">{source.name}</div>
        <div className="text-[11px] text-ink-500 mt-0.5 tabular-nums truncate">
          {source.subtype} · <span className="text-ink-400">{formatDate(source.createdAt)}</span>
        </div>
      </div>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onMenu(); }}
        className="p-1 rounded-md text-ink-400 hover:text-ink-700 hover:bg-paper-50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shrink-0"
        aria-label="Source actions"
      >
        <MoreHorizontal size={16} />
      </button>
    </button>
  );
}

// ─── DataSourcesView ─────────────────────────────────────────────────────────

type SortDir = 'newest' | 'oldest';

export default function DataSourcesView() {
  const { addToast } = useToast();
  const [tab, setTab] = useState<TabId>('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortDir>('newest');
  const [sortOpen, setSortOpen] = useState(false);

  const tabCounts = useMemo<Record<TabId, number>>(() => ({
    all:        SEED.length,
    file:       SEED.filter(d => d.type === 'file').length,
    integrated: SEED.filter(d => INTEGRATED_TYPES.includes(d.type)).length,
  }), []);

  const visible = useMemo(() => {
    const filtered = SEED
      .filter(d => {
        if (tab === 'all') return true;
        if (tab === 'file') return d.type === 'file';
        return INTEGRATED_TYPES.includes(d.type);
      })
      .filter(d => !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.subtype.toLowerCase().includes(search.toLowerCase()));
    const dir = sort === 'newest' ? -1 : 1;
    return filtered.sort((a, b) => dir * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()));
  }, [tab, search, sort]);

  const buckets = sort === 'newest' ? bucketByDate(visible) : null;

  return (
    <div className="space-y-6">
      {/* ── Sub-section header: pill-segmented sub-tabs + actions ── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Pill-segmented sub-tabs (distinct from the outer Knowledge Hub tabs) */}
        <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-paper-50 border border-canvas-border">
          {TABS.map(t => {
            const Icon = t.icon;
            const isActive = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`relative flex items-center gap-1.5 px-3 h-8 rounded-md text-[12.5px] font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-canvas-elevated text-brand-700 shadow-sm'
                    : 'text-ink-500 hover:text-ink-700'
                }`}
              >
                <Icon size={13} />
                {t.label}
                <span className={`tabular-nums text-[11px] ${isActive ? 'text-brand-600' : 'text-ink-400'}`}>{tabCounts[t.id]}</span>
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => addToast({ message: 'Upload dialog opening.', type: 'info' })}
            className="flex items-center gap-2 px-3 h-9 rounded-md border border-canvas-border bg-canvas-elevated text-[13px] font-medium text-ink-700 hover:border-brand-200 transition-colors cursor-pointer"
          >
            <Upload size={13} />
            Upload file
          </button>
          <button
            onClick={() => addToast({ message: 'Connect source wizard starting.', type: 'info' })}
            className="flex items-center gap-2 px-4 h-9 rounded-md bg-brand-600 hover:bg-brand-500 active:bg-brand-800 text-white text-[13px] font-semibold transition-colors cursor-pointer"
          >
            <Plus size={13} />
            Connect source
          </button>
        </div>
      </div>

      {/* ── Search + sort toolbar ── */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            placeholder={`Search ${tab === 'all' ? 'all sources' : TABS.find(t => t.id === tab)!.label.toLowerCase()}…`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 h-9 rounded-md border border-canvas-border bg-canvas-elevated text-[12px] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-brand-600 transition-colors"
          />
        </div>

        <div className="relative">
          <button
            onClick={() => setSortOpen(p => !p)}
            className="flex items-center gap-1.5 px-3 h-9 rounded-md border border-canvas-border bg-canvas-elevated text-[12px] font-medium text-ink-700 hover:border-brand-200 transition-colors cursor-pointer"
          >
            <ArrowUpDown size={12} />
            {sort === 'newest' ? 'Newest first' : 'Oldest first'}
            <ChevronDown size={12} className={`text-ink-400 transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
          </button>
          {sortOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setSortOpen(false)} />
              <div className="absolute right-0 top-full mt-1 w-40 z-20 bg-canvas-elevated border border-canvas-border rounded-md py-1 shadow-md">
                {(['newest', 'oldest'] as SortDir[]).map(s => (
                  <button
                    key={s}
                    onClick={() => { setSort(s); setSortOpen(false); }}
                    className={`w-full text-left px-3 py-1.5 text-[13px] cursor-pointer transition-colors ${
                      s === sort ? 'text-brand-700 font-semibold bg-brand-50' : 'text-ink-700 hover:bg-paper-50'
                    }`}
                  >
                    {s === 'newest' ? 'Newest first' : 'Oldest first'}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab + sort + (search ? '+search' : '')}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15, ease: [0.2, 0, 0, 1] }}
          className="space-y-6"
        >
          {visible.length === 0 && (
            <div className="text-center py-16 rounded-xl border border-dashed border-canvas-border bg-canvas-elevated">
              <Database size={28} className="mx-auto text-ink-400 mb-3" />
              <p className="text-[14px] text-ink-500">
                {search ? `No sources match "${search}".` : 'No sources connected yet.'}
              </p>
            </div>
          )}

          {buckets ? (
            buckets.map(b => (
              <div key={b.id}>
                <div className="text-[12px] font-medium text-ink-500 mb-2 tabular-nums">
                  {b.label} <span className="text-ink-400">· {b.items.length}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {b.items.map(d => (
                    <SourceCard key={d.id} source={d} onMenu={() => addToast({ message: `Actions for "${d.name}".`, type: 'info' })} />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {visible.map(d => (
                <SourceCard key={d.id} source={d} onMenu={() => addToast({ message: `Actions for "${d.name}".`, type: 'info' })} />
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
