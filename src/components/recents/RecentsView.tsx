import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageSquare, Workflow, Star, Search, Filter, Plus, Clock,
} from 'lucide-react';
import type { View } from '../../hooks/useAppState';
import { CHAT_HISTORY, WORKFLOWS } from '../../data/mockData';

interface Props {
  setView: (v: View) => void;
}

type TabId = 'chats' | 'workflows' | 'favourites';

const FAVES_KEY = 'recents.favourites.v1';

interface Tab {
  id: TabId;
  label: string;
  icon: typeof MessageSquare;
}

const TABS: Tab[] = [
  { id: 'chats',      label: 'Chats',         icon: MessageSquare },
  { id: 'workflows',  label: 'Workflow runs', icon: Workflow },
  { id: 'favourites', label: 'Favourites',    icon: Star },
];

// ─── Time helpers ────────────────────────────────────────────────────────────
// Today (mocked at 2026-04-23 to match the rest of the app's mock anchor).

const NOW = new Date('2026-04-23T04:30:00');
const DAY_MS = 24 * 60 * 60 * 1000;

function formatRelative(isoOrLabel: string): string {
  // Existing mocks store strings like "Mar 20, 2026". Parse if possible.
  const d = new Date(isoOrLabel);
  if (Number.isNaN(d.getTime())) return isoOrLabel;

  const diff = NOW.getTime() - d.getTime();

  if (diff < DAY_MS && d.toDateString() === NOW.toDateString()) {
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase();
  }
  if (diff < 7 * DAY_MS) {
    return d.toLocaleDateString('en-US', { weekday: 'short' });
  }
  if (d.getFullYear() === NOW.getFullYear()) {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ─── Synthesised recents data ────────────────────────────────────────────────
// CHAT_HISTORY only has 5 items — pad with a few synthetic ones so the page
// reads like the screenshot (~15 rows). All anchored to NOW.

interface ChatRow { id: string; title: string; ts: Date; }
interface WorkflowRunRow { id: string; wfId: string; wfName: string; ts: Date; status: 'success' | 'pending' | 'failed'; rows: number; }

function buildChatRows(): ChatRow[] {
  const synthetic: { title: string; offset: number }[] = [
    { title: 'Auditor journey hackathon vision', offset: 1 * DAY_MS },
    { title: 'Audit platform architecture redesign', offset: 1 * DAY_MS + 2 * 3600_000 },
    { title: 'Convert iFrame branded PDF to Word document', offset: 1 * DAY_MS + 5 * 3600_000 },
    { title: 'Amazon TRC compliance dashboard prototype showcase', offset: 1 * DAY_MS + 7 * 3600_000 },
    { title: 'Client demo with iFrame vendor folders', offset: 2 * DAY_MS },
    { title: 'Databricks workspace data migration planning', offset: 3 * DAY_MS },
    { title: 'Convert to Word file', offset: 3 * DAY_MS + 4 * 3600_000 },
    { title: 'Querying SAP data lake for analytics', offset: 3 * DAY_MS + 6 * 3600_000 },
    { title: 'Numerical range notation', offset: 4 * DAY_MS },
  ];
  const real: ChatRow[] = CHAT_HISTORY.map(c => ({
    id: c.id,
    title: c.title,
    ts: new Date(c.timestamp),
  }));
  const synth: ChatRow[] = synthetic.map((s, i) => ({
    id: `ch-syn-${i}`,
    title: s.title,
    ts: new Date(NOW.getTime() - s.offset),
  }));
  return [...synth, ...real].sort((a, b) => b.ts.getTime() - a.ts.getTime());
}

function buildWorkflowRunRows(): WorkflowRunRow[] {
  // For each workflow, synth 2 recent runs at fictional times.
  const rows: WorkflowRunRow[] = [];
  WORKFLOWS.forEach((wf, i) => {
    for (let r = 0; r < 2; r++) {
      const offsetH = (i * 5 + r * 17) % 96; // spread runs across last 4 days
      const ts = new Date(NOW.getTime() - offsetH * 3600_000);
      const status: WorkflowRunRow['status'] =
        r === 0 && i % 5 === 4 ? 'failed' :
        r === 0 && i % 4 === 3 ? 'pending' :
        'success';
      rows.push({
        id: `${wf.id}-run-${r}`,
        wfId: wf.id,
        wfName: wf.name,
        ts,
        status,
        rows: 200 + ((i * 137 + r * 53) % 1800),
      });
    }
  });
  return rows.sort((a, b) => b.ts.getTime() - a.ts.getTime());
}

const STATUS_TONE: Record<WorkflowRunRow['status'], { label: string; cls: string }> = {
  success: { label: 'Succeeded', cls: 'bg-compliant-50 text-compliant-700' },
  pending: { label: 'Pending',   cls: 'bg-mitigated-50 text-mitigated-700' },
  failed:  { label: 'Failed',    cls: 'bg-risk-50 text-risk-700' },
};

// ─── Star (favourite) ────────────────────────────────────────────────────────

function FavToggle({ on, onClick }: { on: boolean; onClick: (e: React.MouseEvent) => void }) {
  return (
    <button
      onClick={onClick}
      className={`p-1 rounded-md transition-colors cursor-pointer ${
        on ? 'text-mitigated-700' : 'text-ink-400 hover:text-ink-700 opacity-0 group-hover:opacity-100'
      }`}
      aria-label={on ? 'Remove from favourites' : 'Add to favourites'}
      title={on ? 'Remove from favourites' : 'Add to favourites'}
    >
      <Star size={14} fill={on ? 'currentColor' : 'none'} strokeWidth={2} />
    </button>
  );
}

// ─── Row primitive ───────────────────────────────────────────────────────────

interface RowProps {
  icon: React.ElementType;
  title: string;
  meta?: string;
  trailing?: React.ReactNode;
  ts: Date;
  onClick?: () => void;
  fav: boolean;
  onToggleFav: (e: React.MouseEvent) => void;
}

function RecentRow({ icon: Icon, title, meta, trailing, ts, onClick, fav, onToggleFav }: RowProps) {
  return (
    <button
      onClick={onClick}
      className="group w-full flex items-center gap-3 px-4 h-12 text-left rounded-md hover:bg-brand-50/50 transition-colors cursor-pointer"
    >
      <Icon size={15} className="text-ink-400 shrink-0" />
      <div className="flex-1 min-w-0 flex items-baseline gap-3">
        <span className="text-[14px] text-ink-800 truncate">{title}</span>
        {meta && <span className="text-[12px] text-ink-500 truncate hidden md:inline">{meta}</span>}
      </div>
      {trailing}
      <FavToggle on={fav} onClick={onToggleFav} />
      <span className="text-[12px] text-ink-500 tabular-nums w-20 text-right shrink-0">{formatRelative(ts.toISOString())}</span>
    </button>
  );
}

// ─── RecentsView ─────────────────────────────────────────────────────────────

export default function RecentsView({ setView }: Props) {
  const [tab, setTab] = useState<TabId>('chats');
  const [search, setSearch] = useState('');

  const [favourites, setFavourites] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem(FAVES_KEY) || '[]')); }
    catch { return new Set(); }
  });
  useEffect(() => { localStorage.setItem(FAVES_KEY, JSON.stringify(Array.from(favourites))); }, [favourites]);

  const toggleFav = (id: string) => (e: React.MouseEvent) => {
    e.stopPropagation();
    setFavourites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const chatRows = useMemo(buildChatRows, []);
  const workflowRows = useMemo(buildWorkflowRunRows, []);

  const filteredChats = chatRows.filter(c => !search || c.title.toLowerCase().includes(search.toLowerCase()));
  const filteredWorkflows = workflowRows.filter(w => !search || w.wfName.toLowerCase().includes(search.toLowerCase()));

  const favouriteEntries = [
    ...chatRows.filter(c => favourites.has(c.id)).map(c => ({ kind: 'chat' as const, row: c })),
    ...workflowRows.filter(w => favourites.has(w.id)).map(w => ({ kind: 'workflow' as const, row: w })),
  ].sort((a, b) => b.row.ts.getTime() - a.row.ts.getTime());

  const newButtonLabel = tab === 'chats' ? 'New chat' : tab === 'workflows' ? 'New run' : null;
  const onNewClick = () => {
    if (tab === 'chats') setView('chat');
    if (tab === 'workflows') setView('workflow-templates');
  };

  return (
    <div className="h-full overflow-y-auto bg-canvas">
      {/* Page header */}
      <div className="border-b border-canvas-border bg-canvas-elevated">
        <div className="max-w-6xl mx-auto px-8 pt-8 pb-0">
          <div className="font-mono text-[11px] text-ink-500 mb-2 tracking-tight">
            Recents · {TABS.find(t => t.id === tab)!.label}
          </div>

          <div className="flex items-end justify-between mb-6">
            <div>
              <h1 className="font-display text-[40px] font-[420] tracking-tight text-ink-900 leading-[1.1]">
                {TABS.find(t => t.id === tab)!.label}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <button className="p-2 rounded-md border border-canvas-border bg-canvas-elevated text-ink-500 hover:text-ink-800 hover:border-brand-200 transition-colors cursor-pointer" title="Filter">
                <Filter size={14} />
              </button>
              <button className="p-2 rounded-md border border-canvas-border bg-canvas-elevated text-ink-500 hover:text-ink-800 hover:border-brand-200 transition-colors cursor-pointer" title="Search">
                <Search size={14} />
              </button>
              {newButtonLabel && (
                <button
                  onClick={onNewClick}
                  className="flex items-center gap-2 px-4 h-10 rounded-md bg-brand-600 hover:bg-brand-500 active:bg-brand-800 text-white text-[13px] font-semibold transition-colors cursor-pointer"
                >
                  <Plus size={14} />
                  {newButtonLabel}
                </button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-0 border-b border-transparent -mb-px">
            {TABS.map(t => {
              const Icon = t.icon;
              const isActive = tab === t.id;
              const count = t.id === 'favourites' ? favourites.size : t.id === 'chats' ? chatRows.length : workflowRows.length;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`relative flex items-center gap-2 px-4 h-11 text-[13px] font-medium transition-colors cursor-pointer ${
                    isActive ? 'text-brand-700' : 'text-ink-500 hover:text-ink-700'
                  }`}
                >
                  <Icon size={14} />
                  {t.label}
                  <span className={`tabular-nums text-[11px] ${isActive ? 'text-brand-600' : 'text-ink-400'}`}>
                    {count}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="recents-tab-bar"
                      className="absolute left-0 right-0 -bottom-px h-[2px] bg-brand-600"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Search field (always visible, not the icon-only one above) */}
      <div className="max-w-6xl mx-auto px-8 pt-6">
        <div className="relative max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            placeholder={`Search ${TABS.find(t => t.id === tab)!.label.toLowerCase()}…`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 h-9 rounded-md border border-canvas-border bg-canvas-elevated text-[13px] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-brand-600 transition-colors"
          />
        </div>
      </div>

      {/* Body */}
      <div className="max-w-6xl mx-auto px-8 py-6">
        <AnimatePresence mode="wait">
          {tab === 'chats' && (
            <motion.div
              key="chats"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
              className="space-y-0.5"
            >
              {filteredChats.map(c => (
                <RecentRow
                  key={c.id}
                  icon={MessageSquare}
                  title={c.title}
                  ts={c.ts}
                  onClick={() => setView('chat')}
                  fav={favourites.has(c.id)}
                  onToggleFav={toggleFav(c.id)}
                />
              ))}
              {filteredChats.length === 0 && <EmptyState label="chats" />}
            </motion.div>
          )}

          {tab === 'workflows' && (
            <motion.div
              key="workflows"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
              className="space-y-0.5"
            >
              {filteredWorkflows.map(w => {
                const tone = STATUS_TONE[w.status];
                return (
                  <RecentRow
                    key={w.id}
                    icon={Workflow}
                    title={w.wfName}
                    meta={`${w.rows.toLocaleString()} rows scanned`}
                    trailing={
                      <span className={`inline-flex items-center px-2.5 h-6 rounded-full text-[12px] font-medium whitespace-nowrap ${tone.cls}`}>
                        {tone.label}
                      </span>
                    }
                    ts={w.ts}
                    onClick={() => setView('workflow-templates')}
                    fav={favourites.has(w.id)}
                    onToggleFav={toggleFav(w.id)}
                  />
                );
              })}
              {filteredWorkflows.length === 0 && <EmptyState label="workflow runs" />}
            </motion.div>
          )}

          {tab === 'favourites' && (
            <motion.div
              key="favourites"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
              className="space-y-0.5"
            >
              {favouriteEntries.length === 0 && (
                <div className="text-center py-16">
                  <Star size={28} className="mx-auto text-ink-400 mb-3" />
                  <p className="text-[14px] text-ink-500 mb-1">No favourites yet.</p>
                  <p className="text-[12px] text-ink-400">Hover any chat or workflow run and click the star to pin it here.</p>
                </div>
              )}
              {favouriteEntries.map(e => {
                if (e.kind === 'chat') {
                  return (
                    <RecentRow
                      key={e.row.id}
                      icon={MessageSquare}
                      title={e.row.title}
                      ts={e.row.ts}
                      onClick={() => setView('chat')}
                      fav={true}
                      onToggleFav={toggleFav(e.row.id)}
                    />
                  );
                }
                const tone = STATUS_TONE[e.row.status];
                return (
                  <RecentRow
                    key={e.row.id}
                    icon={Workflow}
                    title={e.row.wfName}
                    meta={`${e.row.rows.toLocaleString()} rows`}
                    trailing={
                      <span className={`inline-flex items-center px-2.5 h-6 rounded-full text-[12px] font-medium whitespace-nowrap ${tone.cls}`}>
                        {tone.label}
                      </span>
                    }
                    ts={e.row.ts}
                    onClick={() => setView('workflow-templates')}
                    fav={true}
                    onToggleFav={toggleFav(e.row.id)}
                  />
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="text-[11px] text-ink-400 text-center pt-8 pb-4 flex items-center justify-center gap-1.5">
          <Clock size={11} />
          Times shown relative to today (mock anchor 2026-04-23).
        </div>
      </div>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="text-center py-16">
      <Search size={28} className="mx-auto text-ink-400 mb-3" />
      <p className="text-[14px] text-ink-500">No {label} match your search.</p>
    </div>
  );
}
