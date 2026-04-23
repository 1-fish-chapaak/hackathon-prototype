import { useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  UploadCloud,
  File as FileIcon,
  X,
  Database,
  Search,
  ChevronDown,
  ChevronUp,
  Check,
} from 'lucide-react';
import type { WorkflowDraft, JourneyFiles, UploadedFile } from './types';
import { DATA_SOURCES } from '../../data/mockData';

interface Props {
  workflow: WorkflowDraft;
  files: JourneyFiles;
  setFiles: (f: JourneyFiles) => void;
}

/* Use a dedicated bucket for linked data-source files */
const LINKED_KEY = '__linked__';

export default function StepUploadFiles({ workflow, files, setFiles }: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [requiredOpen, setRequiredOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedSources, setSelectedSources] = useState<Set<string>>(new Set());

  /* ---- file pick / remove (for real uploads, stored under first input) ---- */
  const handlePick = (picked: FileList | null) => {
    if (!picked || picked.length === 0) return;
    const inputId = workflow.inputs[0]?.id ?? '_default';
    const existing = files[inputId] ?? [];
    const next: UploadedFile[] = [
      ...existing,
      ...Array.from(picked).map((f) => ({ name: f.name, size: f.size })),
    ];
    setFiles({ ...files, [inputId]: next });
  };

  const handleRemoveFile = (inputId: string, index: number) => {
    const existing = files[inputId] ?? [];
    const next = existing.filter((_, i) => i !== index);
    setFiles({ ...files, [inputId]: next });
  };

  /* ---- data-source link / unlink ---- */
  const toggleSource = (sourceId: string, sourceName: string) => {
    setSelectedSources((prev) => {
      const next = new Set(prev);
      if (next.has(sourceId)) {
        next.delete(sourceId);
        // remove from linked bucket
        const existing = files[LINKED_KEY] ?? [];
        setFiles({
          ...files,
          [LINKED_KEY]: existing.filter((f) => f.name !== sourceName),
        });
      } else {
        next.add(sourceId);
        // add to linked bucket
        const existing = files[LINKED_KEY] ?? [];
        setFiles({
          ...files,
          [LINKED_KEY]: [...existing, { name: sourceName, size: 0, linkedSource: true }],
        });
      }
      return next;
    });
  };

  const handleRemoveLinked = (index: number) => {
    const existing = files[LINKED_KEY] ?? [];
    const removed = existing[index];
    if (removed) {
      // deselect the matching data source
      const ds = DATA_SOURCES.find((d) => d.name === removed.name);
      if (ds) setSelectedSources((prev) => { const n = new Set(prev); n.delete(ds.id); return n; });
    }
    setFiles({ ...files, [LINKED_KEY]: existing.filter((_, i) => i !== index) });
  };

  /* ---- collect all files for display ---- */
  const allFiles: { name: string; size: number; linked?: boolean; inputId: string; idx: number }[] = [];
  for (const [inputId, arr] of Object.entries(files)) {
    arr.forEach((f, idx) => {
      allFiles.push({
        name: f.name,
        size: f.size,
        linked: inputId === LINKED_KEY || (f as any).linkedSource,
        inputId,
        idx,
      });
    });
  }

  const filteredSources = DATA_SOURCES.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()),
  );

  const requiredInputs = workflow.inputs.filter((i) => i.required);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-4"
    >
      {/* Required Files (collapsible) */}
      <section className="rounded-xl border border-canvas-border bg-canvas-elevated">
        <button
          type="button"
          onClick={() => setRequiredOpen((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <FileIcon size={14} className="text-brand-600" />
            <span className="text-[13px] font-semibold text-ink-800">Required Files</span>
          </div>
          <span className="text-[11px] text-ink-500 inline-flex items-center gap-1">
            {requiredOpen ? 'Click to Collapse' : 'Click to Expand'}
            {requiredOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </span>
        </button>

        {/* Collapsed: name + type badges in a row */}
        {!requiredOpen && (
          <div className="px-4 pb-4 flex flex-wrap gap-2">
            {requiredInputs.map((input) => (
              <div
                key={input.id}
                className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-[12px] font-semibold border bg-canvas border-canvas-border text-ink-700"
              >
                {input.name}
                <span className="text-[10px] uppercase tracking-wider font-bold opacity-60">
                  {input.type}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Expanded: 2-column grid with descriptions */}
        {requiredOpen && (
          <div className="px-4 pb-4">
            <div className="border-t border-canvas-border mb-3" />
            <div className="grid grid-cols-2 gap-3">
              {requiredInputs.map((input) => (
                <div
                  key={input.id}
                  className="rounded-xl border border-canvas-border bg-canvas p-3"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[12.5px] font-semibold text-ink-800">{input.name}</span>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-ink-400 bg-canvas-elevated px-1.5 py-0.5 rounded">
                      {input.type}
                    </span>
                  </div>
                  <p className="text-[11px] text-ink-400 leading-snug">{input.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Add Files */}
      <section className="rounded-xl border border-canvas-border bg-canvas-elevated p-4">
        <div className="flex items-center gap-2 mb-3">
          <UploadCloud size={14} className="text-brand-600" />
          <span className="text-[13px] font-semibold text-ink-800">Add Files</span>
          {allFiles.length > 0 && (
            <span className="text-[10.5px] text-white rounded-full bg-brand-600 px-2 py-0.5 font-bold">
              {allFiles.length}
            </span>
          )}
        </div>

        {/* Files in 2-column grid */}
        {allFiles.length > 0 ? (
          <div className="grid grid-cols-2 gap-2 mb-3">
            {allFiles.map((f, i) => (
              <div
                key={`${f.name}-${i}`}
                className="flex items-center gap-2 bg-canvas rounded-xl border border-canvas-border px-3 py-2.5"
              >
                <FileIcon size={14} className="text-ink-400 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-medium text-ink-800 truncate">{f.name}</p>
                  {f.linked && (
                    <p className="text-[10px] text-ink-400 truncate">Linked from data source</p>
                  )}
                </div>
                <span className="text-[9px] uppercase tracking-wider font-bold text-ink-400 bg-canvas-elevated px-1.5 py-0.5 rounded shrink-0">
                  {f.name.split('.').pop()?.toUpperCase() || 'FILE'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (f.linked) handleRemoveLinked(f.idx);
                    else handleRemoveFile(f.inputId, f.idx);
                  }}
                  className="text-ink-400 hover:text-risk transition-colors cursor-pointer shrink-0"
                  aria-label={`Remove ${f.name}`}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-canvas-border bg-canvas py-3 px-4 text-center text-[11.5px] text-ink-400 mb-3">
            No files added yet. Drop files below or link an existing data source.
          </div>
        )}

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full rounded-xl border border-dashed border-brand-300 bg-brand-50/50 hover:bg-brand-50 transition-colors py-10 flex flex-col items-center gap-2 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center">
            <UploadCloud size={18} />
          </div>
          <div className="text-[13px] font-semibold text-ink-800">
            Drop files here or click to upload
          </div>
          <div className="text-[11px] text-ink-500">
            CSV, PDF, images — any data files for this workflow
          </div>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          hidden
          multiple
          onChange={(e) => {
            handlePick(e.target.files);
            e.target.value = '';
          }}
        />
      </section>

      {/* OR LINK FROM EXISTING DATA SOURCE */}
      <section className="rounded-xl border border-canvas-border bg-canvas-elevated p-4">
        <div className="text-center text-[10px] font-bold uppercase tracking-wider text-ink-400 mb-3">
          Or link from existing data source
        </div>
        <div className="relative mb-3">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search data sources…"
            className="w-full rounded-lg border border-canvas-border bg-canvas px-9 py-2 text-[12.5px] text-ink-800 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600/30 transition-all"
          />
        </div>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {filteredSources.map((s) => {
            const isSelected = selectedSources.has(s.id);
            return (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => toggleSource(s.id, s.name)}
                  className={[
                    'w-full text-left group rounded-lg border px-3 py-2 transition-all cursor-pointer',
                    isSelected
                      ? 'border-brand-400 bg-brand-50 ring-2 ring-brand-200'
                      : 'border-canvas-border bg-canvas hover:bg-brand-50/40 hover:border-brand-300',
                  ].join(' ')}
                >
                  <div className="flex items-center gap-2 mb-0.5">
                    <div className="w-6 h-6 rounded-md bg-brand-50 flex items-center justify-center shrink-0">
                      <Database size={12} className="text-brand-600" />
                    </div>
                    <span className="text-[12.5px] font-semibold text-ink-800 truncate flex-1">
                      {s.name}
                    </span>
                    {isSelected && (
                      <Check size={14} className="text-brand-600 shrink-0" />
                    )}
                  </div>
                  <div className="text-[10.5px] text-ink-400 ml-8">
                    {s.records} records · last sync {s.lastSync}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </motion.div>
  );
}
