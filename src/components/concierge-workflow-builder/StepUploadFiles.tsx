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
} from 'lucide-react';
import type { WorkflowDraft, JourneyFiles, UploadedFile } from './types';
import { DATA_SOURCES } from '../../data/mockData';

interface Props {
  workflow: WorkflowDraft;
  files: JourneyFiles;
  setFiles: (f: JourneyFiles) => void;
}

function humanSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function StepUploadFiles({ workflow, files, setFiles }: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [requiredOpen, setRequiredOpen] = useState(true);
  const [search, setSearch] = useState('');
  const [activeInputId, setActiveInputId] = useState<string>(
    workflow.inputs[0]?.id ?? '',
  );

  const handlePick = (inputId: string, picked: FileList | null) => {
    if (!picked || picked.length === 0) return;
    const existing = files[inputId] ?? [];
    const next: UploadedFile[] = [
      ...existing,
      ...Array.from(picked).map((f) => ({ name: f.name, size: f.size })),
    ];
    setFiles({ ...files, [inputId]: next });
  };

  const handleRemove = (inputId: string, index: number) => {
    const existing = files[inputId] ?? [];
    const next = existing.filter((_, i) => i !== index);
    setFiles({ ...files, [inputId]: next });
  };

  const totalCount = Object.values(files).reduce((n, arr) => n + arr.length, 0);
  const activeInput = workflow.inputs.find((i) => i.id === activeInputId);
  const activeList = activeInput ? (files[activeInput.id] ?? []) : [];

  const filteredSources = DATA_SOURCES.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()),
  );

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
            <span className="text-[12px] text-ink-400">
              {workflow.inputs.filter((i) => i.required).length} required ·{' '}
              {workflow.inputs.length} total
            </span>
          </div>
          <span className="text-[12px] text-ink-500 inline-flex items-center gap-1">
            {requiredOpen ? 'Click to collapse' : 'Click to expand'}
            {requiredOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </span>
        </button>
        {requiredOpen && (
          <div className="px-4 pb-4 flex flex-wrap gap-2">
            {workflow.inputs.map((input) => {
              const uploaded = (files[input.id] ?? []).length;
              const isActive = input.id === activeInputId;
              return (
                <button
                  key={input.id}
                  type="button"
                  onClick={() => setActiveInputId(input.id)}
                  className={[
                    'inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-colors cursor-pointer border',
                    isActive
                      ? 'bg-brand-50 border-brand-300 text-brand-700'
                      : uploaded > 0
                        ? 'bg-compliant-50 border-compliant/30 text-compliant-700'
                        : 'bg-canvas border-canvas-border text-ink-700 hover:border-brand-300',
                  ].join(' ')}
                >
                  {input.name}
                  <span className="text-[12px] font-bold opacity-70">
                    {input.type}
                  </span>
                  {uploaded > 0 && (
                    <span className="text-[12px] rounded-full bg-white/70 px-1.5 py-0.5 text-compliant-700">
                      {uploaded}
                    </span>
                  )}
                  {input.required && uploaded === 0 && (
                    <span className="text-[9.5px] font-bold text-risk">
                      Required
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* Add Files */}
      <section className="rounded-xl border border-canvas-border bg-canvas-elevated p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <UploadCloud size={14} className="text-brand-600" />
            <span className="text-[13px] font-semibold text-ink-800">Add Files</span>
            <span className="text-[12px] text-ink-400 rounded-full bg-canvas px-2 py-0.5 border border-canvas-border">
              {totalCount}
            </span>
          </div>
          {activeInput && (
            <span className="text-[12px] text-ink-500">
              Uploading to <strong className="text-brand-700">{activeInput.name}</strong>
            </span>
          )}
        </div>

        {activeInput && activeList.length > 0 ? (
          <ul className="flex flex-col gap-1.5 mb-3">
            {activeList.map((f, i) => (
              <li
                key={`${f.name}-${i}`}
                className="flex items-center gap-2 bg-canvas rounded-lg border border-canvas-border px-3 py-2"
              >
                <FileIcon size={14} className="text-brand-600 shrink-0" />
                <span className="text-[12.5px] text-ink-800 truncate flex-1">{f.name}</span>
                <span className="text-[12px] text-ink-400 shrink-0">{humanSize(f.size)}</span>
                <button
                  type="button"
                  onClick={() => handleRemove(activeInput.id, i)}
                  className="text-ink-400 hover:text-risk transition-colors cursor-pointer"
                  aria-label={`Remove ${f.name}`}
                >
                  <X size={14} />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-xl border border-canvas-border bg-canvas py-3 px-4 text-center text-[12px] text-ink-400 mb-3">
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
          <div className="text-[12px] text-ink-500">
            CSV, PDF, images — any data files for this workflow
          </div>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          hidden
          multiple={activeInput?.multiple}
          onChange={(e) => {
            if (activeInput) handlePick(activeInput.id, e.target.files);
            e.target.value = '';
          }}
        />
      </section>

      {/* OR LINK FROM EXISTING DATA SOURCE */}
      <section className="rounded-xl border border-canvas-border bg-canvas-elevated p-4">
        <div className="text-center text-[12px] font-bold text-ink-400 mb-3">
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
          {filteredSources.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                className="w-full text-left group rounded-lg border border-canvas-border bg-canvas hover:bg-brand-50/40 hover:border-brand-300 px-3 py-2 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 mb-0.5">
                  <div className="w-6 h-6 rounded-md bg-brand-50 flex items-center justify-center shrink-0">
                    <Database size={12} className="text-brand-600" />
                  </div>
                  <span className="text-[12.5px] font-semibold text-ink-800 truncate">
                    {s.name}
                  </span>
                </div>
                <div className="text-[12px] text-ink-400 ml-8">
                  {s.records} records · last sync {s.lastSync}
                </div>
              </button>
            </li>
          ))}
        </ul>
      </section>
    </motion.div>
  );
}
