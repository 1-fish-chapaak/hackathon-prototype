import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, Clock, Plus, ChevronDown, LayoutGrid, MoreVertical,
  Trash2, Check, Download, Share2, X
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
  onDashboardClick: (dashboardId: string) => void;
  onImportPowerBI?: () => void;
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

export default function DashboardListPage({ onDashboardClick, onImportPowerBI }: DashboardListPageProps) {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<'my' | 'shared'>('my');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('recently');
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [myDashboards, setMyDashboards] = useState(MY_DASHBOARDS);
  const [sharedDashboards, setSharedDashboards] = useState(SHARED_DASHBOARDS);

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
      setMyDashboards(prev => prev.filter(d => d.id !== id));
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
                onClick={() => addToast({ message: 'Create dashboard flow coming soon.', type: 'info' })}
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
    </div>
  );
}
