import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, Search, Layers, FileText, Database, Upload, Check, Mail, Plus, Loader2,
} from 'lucide-react';
import { useToast } from '../shared/Toast';
import {
  SEED, INTEGRATED_TYPES, TYPE_META, formatDate,
  type DataSource,
} from '../data-sources/sources';

// ─── Selected attachment shape ───────────────────────────────────────────────
// Two flavours of selection that the chat composer can show as chips:
//  - source: a registered data source (file / DB / API / cloud / session)
//  - upload: a fresh file the user just dropped in via the Upload tab
export type AttachmentSelection =
  | { kind: 'source'; sourceId: string; name: string; subtype: string; type: DataSource['type'] }
  | { kind: 'upload'; localId: string; name: string; sizeBytes: number };

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: (selections: AttachmentSelection[]) => void;
}

type TabId = 'all' | 'file' | 'integrated' | 'upload';

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'upload',     label: 'Upload',   icon: Upload },
  { id: 'all',        label: 'All Data', icon: Layers },
  { id: 'file',       label: 'Files',    icon: FileText },
  { id: 'integrated', label: 'DB',       icon: Database },
];

export default function DataPickerModal({ open, onClose, onConfirm }: Props) {
  const { addToast } = useToast();
  const [tab, setTab] = useState<TabId>('upload');
  const [search, setSearch] = useState('');
  // Multi-select state — keyed by source id (for source rows) or local upload id.
  const [selectedSourceIds, setSelectedSourceIds] = useState<Set<string>>(new Set());
  const [pendingUploads, setPendingUploads] = useState<Array<{ localId: string; name: string; sizeBytes: number; progress: number }>>([]);

  // Reset transient state when the modal opens fresh — Upload tab is the
  // primary action, so it's the default landing.
  useEffect(() => {
    if (open) {
      setTab('upload');
      setSearch('');
      setSelectedSourceIds(new Set());
      setPendingUploads([]);
    }
  }, [open]);

  const tabCounts = useMemo<Record<TabId, number>>(() => ({
    all:        SEED.length,
    file:       SEED.filter(d => d.type === 'file').length,
    integrated: SEED.filter(d => INTEGRATED_TYPES.includes(d.type)).length,
    upload:     pendingUploads.length,
  }), [pendingUploads.length]);

  const visibleSources = useMemo(() => {
    return SEED
      .filter(d => {
        if (tab === 'all') return true;
        if (tab === 'file') return d.type === 'file';
        if (tab === 'integrated') return INTEGRATED_TYPES.includes(d.type);
        return false; // upload tab handles its own list
      })
      .filter(d => !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.subtype.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [tab, search]);

  // Only fully-uploaded files count toward the Attach total — in-flight files
  // shouldn't be attachable until they finish.
  const readyUploads = pendingUploads.filter(u => u.progress >= 100);
  const totalSelected = selectedSourceIds.size + readyUploads.length;
  const inFlightCount = pendingUploads.length - readyUploads.length;

  const toggleSource = (id: string) => {
    setSelectedSourceIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleConfirm = () => {
    const sourceSelections: AttachmentSelection[] = SEED
      .filter(s => selectedSourceIds.has(s.id))
      .map(s => ({ kind: 'source' as const, sourceId: s.id, name: s.name, subtype: s.subtype, type: s.type }));
    const uploadSelections: AttachmentSelection[] = readyUploads
      .map(u => ({ kind: 'upload' as const, localId: u.localId, name: u.name, sizeBytes: u.sizeBytes }));
    onConfirm([...sourceSelections, ...uploadSelections]);
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true" aria-labelledby="dpicker-title">
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-text/30 backdrop-blur-[3px]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.2, 0, 0, 1] }}
            className="relative w-[820px] max-w-[94vw] h-[600px] max-h-[88vh] bg-white rounded-2xl shadow-2xl border border-border-light flex flex-col overflow-hidden"
          >
            {/* Header — title + search + close, mimics Google Drive's "Open a file" pattern */}
            <div className="flex items-center gap-3 px-5 py-3 border-b border-border-light">
              <h2 id="dpicker-title" className="text-[15px] font-semibold text-text shrink-0">Add data</h2>
              <div className="relative flex-1 max-w-md ml-2">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted/60" />
                <input
                  type="text"
                  placeholder={tab === 'upload' ? 'Drop files below to upload…' : 'Search sources…'}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  disabled={tab === 'upload'}
                  className="w-full pl-9 pr-3 h-9 rounded-md border border-border-light bg-white text-[13px] text-text placeholder:text-text-muted/60 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:bg-paper-50 disabled:text-text-muted transition-colors"
                />
              </div>
              <div className="ml-auto flex items-center gap-1">
                <button
                  onClick={onClose}
                  className="p-1.5 text-text-muted hover:text-text rounded-md hover:bg-surface-2 transition-colors cursor-pointer"
                  aria-label="Close picker"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Tabs row */}
            <div className="flex items-center gap-0 px-5 border-b border-border-light">
              {TABS.map(t => {
                const Icon = t.icon;
                const isActive = tab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`relative flex items-center gap-1.5 px-3.5 h-10 text-[12.5px] font-medium transition-colors cursor-pointer ${
                      isActive ? 'text-primary' : 'text-text-muted hover:text-text'
                    }`}
                  >
                    <Icon size={13} />
                    {t.label}
                    {t.id !== 'upload' && (
                      <span className={`tabular-nums text-[11px] ${isActive ? 'text-primary' : 'text-text-muted/60'}`}>
                        {tabCounts[t.id]}
                      </span>
                    )}
                    {isActive && (
                      <motion.div
                        layoutId="dpicker-tab-bar"
                        className="absolute left-0 right-0 -bottom-px h-[2px] bg-primary"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Body — tab-aware */}
            <div className="flex-1 overflow-y-auto">
              {tab === 'upload' ? (
                <UploadPanel
                  pendingUploads={pendingUploads}
                  setPendingUploads={setPendingUploads}
                />
              ) : (
                <SourceList
                  sources={visibleSources}
                  selectedIds={selectedSourceIds}
                  onToggle={toggleSource}
                  search={search}
                  showRequestIntegration={tab === 'integrated'}
                  onRequestIntegration={() => addToast({ type: 'info', message: 'Opening request form…' })}
                />
              )}
            </div>

            {/* Footer — selection count + Attach CTA */}
            <div className="border-t border-border-light px-5 py-3 flex items-center justify-between bg-surface-2/60">
              <div className="text-[12px] text-text-muted tabular-nums flex items-center gap-2">
                {totalSelected === 0 && inFlightCount === 0 && (
                  <>Pick sources or files to attach to your message.</>
                )}
                {totalSelected > 0 && (
                  <span><span className="font-semibold text-text-secondary">{totalSelected}</span> {totalSelected === 1 ? 'item' : 'items'} selected</span>
                )}
                {inFlightCount > 0 && (
                  <span className="inline-flex items-center gap-1 text-primary">
                    <Loader2 size={11} className="animate-spin" />
                    {inFlightCount} uploading…
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="px-3 h-9 rounded-md text-[12.5px] font-medium text-text-muted hover:text-text hover:bg-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={totalSelected === 0}
                  className="flex items-center gap-1.5 px-4 h-9 rounded-md bg-primary hover:bg-primary-hover active:bg-primary-hover disabled:bg-surface-2 disabled:text-text-muted disabled:cursor-not-allowed text-white text-[12.5px] font-semibold transition-colors cursor-pointer"
                >
                  <Check size={13} />
                  {totalSelected > 0 ? `Attach ${totalSelected}` : 'Attach'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ─── Source list — used by All / Files / DB tabs ─────────────────────────────

interface SourceListProps {
  sources: DataSource[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  search: string;
  showRequestIntegration: boolean;
  onRequestIntegration: () => void;
}

function SourceList({ sources, selectedIds, onToggle, search, showRequestIntegration, onRequestIntegration }: SourceListProps) {
  if (sources.length === 0) {
    return (
      <div className="text-center py-16 px-6">
        <Search size={24} className="mx-auto text-text-muted/60 mb-3" />
        <p className="text-[13px] text-text-muted">
          {search ? `No sources match "${search}".` : 'No sources available.'}
        </p>
        {showRequestIntegration && !search && (
          <a
            href="mailto:support@irame.ai?subject=Database%20integration%20request"
            onClick={onRequestIntegration}
            className="inline-flex items-center gap-2 mt-4 px-3 h-9 rounded-md bg-primary hover:bg-primary-hover text-white text-[12.5px] font-semibold transition-colors cursor-pointer"
          >
            <Plus size={13} />
            Request a DB integration
          </a>
        )}
      </div>
    );
  }

  return (
    <div>
      <ul className="divide-y divide-border-light">
        {sources.map(s => (
          <SourceRow
            key={s.id}
            source={s}
            selected={selectedIds.has(s.id)}
            onToggle={() => onToggle(s.id)}
          />
        ))}
      </ul>

      {showRequestIntegration && (
        <div className="px-5 py-4 border-t border-border-light bg-surface-2/60 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <Mail size={13} className="text-text-muted shrink-0" />
            <span className="text-[12px] text-text-muted truncate">
              Need another source? IT can wire it up.
            </span>
          </div>
          <a
            href="mailto:support@irame.ai?subject=Database%20integration%20request"
            onClick={onRequestIntegration}
            className="inline-flex items-center gap-1.5 px-3 h-8 rounded-md border border-border-light bg-white text-[12px] font-semibold text-text-secondary hover:border-primary-light transition-colors cursor-pointer shrink-0"
          >
            <Plus size={12} />
            Request a DB integration
          </a>
        </div>
      )}
    </div>
  );
}

function SourceRow({ source, selected, onToggle }: { source: DataSource; selected: boolean; onToggle: () => void }) {
  const { icon: Icon, tone, label: typeLabel } = TYPE_META[source.type];
  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        className={`w-full flex items-center gap-3 px-5 py-3 text-left transition-colors cursor-pointer ${
          selected ? 'bg-primary-xlight' : 'hover:bg-surface-2'
        }`}
        aria-pressed={selected}
      >
        {/* Checkbox */}
        <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-all ${
          selected ? 'bg-primary border-primary' : 'bg-white border-border-light'
        }`}>
          {selected && <Check size={11} className="text-white" />}
        </div>

        {/* Type-tinted icon tile */}
        <div className={`w-9 h-9 rounded-md flex items-center justify-center shrink-0 ${tone}`}>
          <Icon size={15} />
        </div>

        {/* Name + meta */}
        <div className="flex-1 min-w-0">
          <div className={`text-[13px] font-medium truncate ${selected ? 'text-primary' : 'text-text'}`}>
            {source.name}
          </div>
          <div className="text-[11px] text-text-muted mt-0.5 tabular-nums truncate">
            {source.subtype} <span className="text-text-muted/60">· {formatDate(source.createdAt)}</span>
          </div>
        </div>

        {/* Type label pill (subtle, right-aligned) */}
        <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-semibold text-text-muted bg-surface-2">
          {typeLabel}
        </span>
      </button>
    </li>
  );
}

// ─── Upload panel — drag/drop + native file picker ──────────────────────────

interface UploadPanelProps {
  pendingUploads: Array<{ localId: string; name: string; sizeBytes: number; progress: number }>;
  setPendingUploads: React.Dispatch<React.SetStateAction<Array<{ localId: string; name: string; sizeBytes: number; progress: number }>>>;
}

function UploadPanel({ pendingUploads, setPendingUploads }: UploadPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const incoming = Array.from(fileList).map((f, i) => ({
      localId: `up-${Date.now()}-${i}`,
      name: f.name,
      sizeBytes: f.size,
      progress: 0,
    }));
    setPendingUploads(prev => [...incoming, ...prev]);

    // Drive progress per file independently. Mirrors the loader pattern from
    // DataSourceDetailView so the chat-side upload feels the same.
    incoming.forEach(uf => {
      const tickMs = 100;
      const step = 5 + Math.round(Math.random() * 7); // 5–12% per tick → ~1.5s total
      const t = setInterval(() => {
        setPendingUploads(prev => {
          const next = prev.map(p => p.localId === uf.localId
            ? { ...p, progress: Math.min(100, p.progress + step) }
            : p
          );
          const updated = next.find(p => p.localId === uf.localId);
          if (updated && updated.progress >= 100) clearInterval(t);
          return next;
        });
      }, tickMs);
    });
  };

  const removeUpload = (id: string) => {
    setPendingUploads(prev => prev.filter(u => u.localId !== id));
  };

  return (
    <div className="p-6 space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`rounded-xl border-2 border-dashed text-center px-6 py-12 transition-colors ${
          isDragging ? 'border-primary bg-primary-xlight' : 'border-border-light bg-surface-2/60'
        }`}
      >
        <Upload size={28} className={`mx-auto mb-3 ${isDragging ? 'text-primary' : 'text-text-muted/60'}`} />
        <p className="text-[14px] text-text-secondary font-medium">Drop files here</p>
        <p className="text-[12px] text-text-muted mt-1">or pick from your computer</p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-2 mt-4 px-3 h-9 rounded-md bg-primary hover:bg-primary-hover active:bg-primary-hover text-white text-[12.5px] font-semibold transition-colors cursor-pointer"
        >
          <Upload size={13} />
          Choose files
        </button>
        <p className="text-[11px] text-text-muted/60 mt-3">CSV · Excel · PDF · ≤ 50 MB each</p>
      </div>

      {/* Pending uploads list — progress bar per file, "Ready" pill when done */}
      {pendingUploads.length > 0 && (
        <div className="rounded-xl border border-border-light bg-white overflow-hidden">
          <div className="px-4 py-2 border-b border-border-light bg-surface-2/60 flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">
              Uploads · {pendingUploads.length}
            </span>
            {pendingUploads.some(u => u.progress < 100) && (
              <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-primary">
                <Loader2 size={10} className="animate-spin" />
                Uploading {pendingUploads.filter(u => u.progress < 100).length}…
              </span>
            )}
          </div>
          <ul className="divide-y divide-border-light">
            {pendingUploads.map(u => {
              const isDone = u.progress >= 100;
              return (
                <li key={u.localId} className="flex items-center gap-3 px-4 py-3">
                  <FileText size={14} className={`shrink-0 ${isDone ? 'text-primary' : 'text-text-muted/60'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="text-[13px] text-text truncate flex-1 min-w-0">{u.name}</div>
                      {isDone ? (
                        <span className="shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10.5px] font-semibold text-compliant bg-compliant-50">
                          <Check size={10} />
                          Ready
                        </span>
                      ) : (
                        <span className="shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10.5px] font-semibold text-primary bg-primary-xlight">
                          <Loader2 size={10} className="animate-spin" />
                          {u.progress}%
                        </span>
                      )}
                    </div>
                    {/* Progress bar — visible until upload completes */}
                    {!isDone && (
                      <div className="mt-1.5 h-1.5 rounded-full bg-surface-2 overflow-hidden">
                        <motion.div
                          className="h-full bg-primary"
                          initial={{ width: 0 }}
                          animate={{ width: `${u.progress}%` }}
                          transition={{ duration: 0.18, ease: 'linear' }}
                        />
                      </div>
                    )}
                    <div className={`text-[11px] tabular-nums mt-${isDone ? '0.5' : '1'} text-text-muted`}>
                      {formatBytesShort(u.sizeBytes)}
                    </div>
                  </div>
                  <button
                    onClick={() => removeUpload(u.localId)}
                    className="p-1.5 text-text-muted hover:text-risk hover:bg-surface-2 rounded-md transition-colors cursor-pointer shrink-0"
                    aria-label={`${isDone ? 'Remove' : 'Cancel'} ${u.name}`}
                  >
                    <X size={13} />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

const KB = 1024;
const MB = KB * 1024;
function formatBytesShort(bytes: number): string {
  if (bytes < KB) return `${bytes} B`;
  if (bytes < MB) return `${(bytes / KB).toFixed(1)} KB`;
  return `${(bytes / MB).toFixed(1)} MB`;
}
