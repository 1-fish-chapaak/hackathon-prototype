import { useMemo, useRef, useState } from 'react';
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
import type { WorkflowDraft, JourneyFiles, UploadedFile, InputSpec } from './types';
import { DATA_SOURCES } from '../../data/mockData';

interface Props {
  workflow: WorkflowDraft;
  files: JourneyFiles;
  setFiles: (f: JourneyFiles) => void;
  onLinkSource?: (sourceName: string, inputName: string) => void;
  onFocusInput?: (input: InputSpec) => void;
  focusedInputId?: string | null;
}

function humanSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function StepUploadFiles({
  workflow,
  files,
  setFiles,
  onLinkSource,
  onFocusInput,
  focusedInputId,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [requiredOpen, setRequiredOpen] = useState(false);
  const [search, setSearch] = useState('');

  const pickTargetInputId = (current: JourneyFiles): string => {
    const reqInputs = workflow.inputs.filter((i) => i.required);
    for (const inp of reqInputs) {
      if ((current[inp.id] ?? []).length === 0) return inp.id;
    }
    return workflow.inputs[0]?.id ?? '';
  };

  const handlePick = (picked: FileList | null) => {
    if (!picked || picked.length === 0) return;
    const filesArr = Array.from(picked);
    const next = { ...files };
    for (const f of filesArr) {
      const target = pickTargetInputId(next);
      if (!target) continue;
      const added: UploadedFile = { name: f.name, size: f.size };
      next[target] = [...(next[target] ?? []), added];
    }
    setFiles(next);
  };

  const handleRemove = (inputId: string, index: number) => {
    const existing = files[inputId] ?? [];
    const next = existing.filter((_, i) => i !== index);
    setFiles({ ...files, [inputId]: next });
  };

  const totalCount = Object.values(files).reduce((n, arr) => n + arr.length, 0);

  const allFiles = useMemo(() => {
    const rows: {
      file: UploadedFile;
      inputId: string;
      inputName: string;
      index: number;
    }[] = [];
    for (const input of workflow.inputs) {
      const arr = files[input.id] ?? [];
      arr.forEach((file, index) => {
        rows.push({ file, inputId: input.id, inputName: input.name, index });
      });
    }
    return rows;
  }, [files, workflow.inputs]);

  const filteredSources = DATA_SOURCES.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()),
  );

  const linkedSourceNames = useMemo(
    () =>
      new Set(
        Object.values(files)
          .flat()
          .filter((f) => f.linkedSource)
          .map((f) => f.name),
      ),
    [files],
  );

  const toggleSource = (sourceName: string) => {
    if (linkedSourceNames.has(sourceName)) {
      const next: JourneyFiles = {};
      for (const [inputId, arr] of Object.entries(files)) {
        next[inputId] = arr.filter(
          (f) => !(f.linkedSource && f.name === sourceName),
        );
      }
      setFiles(next);
      return;
    }
    const target = pickTargetInputId(files);
    if (!target) return;
    const targetInput = workflow.inputs.find((i) => i.id === target);
    const existing = files[target] ?? [];
    const added: UploadedFile = { name: sourceName, size: 0, linkedSource: true };
    setFiles({ ...files, [target]: [...existing, added] });
    if (targetInput) onLinkSource?.(sourceName, targetInput.name);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-4"
    >
      {/* Add Files */}
      <section className="rounded-xl border border-canvas-border bg-canvas-elevated p-4">
        <div className="flex items-center gap-2 mb-3">
          <UploadCloud size={14} className="text-brand-600" />
          <span className="text-[13px] font-semibold text-ink-800">Add Files</span>
          <span className="text-[12px] text-ink-400 rounded-full bg-canvas px-2 py-0.5 border border-canvas-border">
            {totalCount}
          </span>
        </div>

        {allFiles.length > 0 ? (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
            {allFiles.map(({ file, inputId, inputName, index }) => (
              <li
                key={`${inputId}-${file.name}-${index}`}
                className="flex items-center gap-2.5 bg-canvas rounded-lg border border-canvas-border px-3 py-2"
              >
                <div className="w-7 h-7 rounded-md bg-brand-50 flex items-center justify-center shrink-0">
                  {file.linkedSource ? (
                    <Database size={13} className="text-brand-600" />
                  ) : (
                    <FileIcon size={13} className="text-brand-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12.5px] font-semibold text-ink-800 truncate">
                    {file.name}
                  </div>
                  <div className="text-[11.5px] text-ink-400 truncate">
                    {file.linkedSource ? 'Linked from data source' : humanSize(file.size)}
                  </div>
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-wide rounded-md bg-canvas-elevated border border-canvas-border text-ink-500 px-1.5 py-0.5 shrink-0 max-w-[130px] truncate">
                  {inputName}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemove(inputId, index)}
                  className="text-ink-400 hover:text-risk transition-colors cursor-pointer shrink-0"
                  aria-label={`Remove ${file.name}`}
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
          multiple
          onChange={(e) => {
            handlePick(e.target.files);
            e.target.value = '';
          }}
        />
      </section>

      {/* CHOOSE FROM EXISTING DATA FILES */}
      <section className="rounded-xl border border-canvas-border bg-canvas-elevated p-4">
        <div className="text-center text-[12px] font-bold text-ink-400 mb-3">
          Choose from existing data files
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
            const selected = linkedSourceNames.has(s.name);
            return (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => toggleSource(s.name)}
                  aria-pressed={selected}
                  className={[
                    'w-full text-left relative rounded-lg border px-3 py-2 transition-colors cursor-pointer',
                    selected
                      ? 'border-brand-400 bg-brand-50/60 ring-1 ring-brand-200/60'
                      : 'border-canvas-border bg-canvas hover:bg-brand-50/40 hover:border-brand-300',
                  ].join(' ')}
                >
                  <div className="flex items-center gap-2 mb-0.5 pr-6">
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
                  <span
                    className={[
                      'absolute top-2 right-2 w-4 h-4 rounded-md flex items-center justify-center transition-all',
                      selected
                        ? 'bg-brand-600 text-white'
                        : 'bg-canvas border border-canvas-border text-transparent',
                    ].join(' ')}
                    aria-hidden="true"
                  >
                    <Check size={10} strokeWidth={3} />
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Required Files (collapsible) — only after user adds files */}
      {totalCount > 0 && (
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
        {!requiredOpen ? (
          <div className="px-4 pb-4 flex flex-wrap gap-2">
            {workflow.inputs.map((input) => {
              const uploaded = (files[input.id] ?? []).length;
              const isFocused = focusedInputId === input.id;
              return (
                <button
                  key={input.id}
                  type="button"
                  onClick={() => onFocusInput?.(input)}
                  className={[
                    'inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-[12px] font-semibold border transition-colors cursor-pointer',
                    isFocused
                      ? 'bg-brand-50 border-brand-400 text-brand-700 ring-1 ring-brand-200/70'
                      : uploaded > 0
                        ? 'bg-compliant-50 border-compliant/30 text-compliant-700 hover:border-compliant/60'
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
        ) : (
          <div className="px-4 pb-4 flex flex-col gap-2">
            {workflow.inputs.map((input) => {
              const uploaded = (files[input.id] ?? []).length;
              const isFocused = focusedInputId === input.id;
              return (
                <button
                  key={input.id}
                  type="button"
                  onClick={() => onFocusInput?.(input)}
                  className={[
                    'w-full text-left rounded-lg border px-3 py-2.5 transition-colors cursor-pointer',
                    isFocused
                      ? 'border-brand-400 bg-brand-50/60 ring-1 ring-brand-200/70'
                      : uploaded > 0
                        ? 'bg-compliant-50/40 border-compliant/30 hover:border-compliant/60'
                        : 'bg-canvas border-canvas-border hover:border-brand-300',
                  ].join(' ')}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[12.5px] font-semibold text-ink-800">
                      {input.name}
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-wide text-ink-500">
                      {input.type}
                    </span>
                    {uploaded > 0 ? (
                      <span className="text-[11px] font-semibold rounded-full bg-compliant/15 px-1.5 py-0.5 text-compliant-700">
                        {uploaded} added
                      </span>
                    ) : input.required ? (
                      <span className="text-[9.5px] font-bold text-risk">
                        Required
                      </span>
                    ) : null}
                  </div>
                  {input.description && (
                    <p className="text-[12px] text-ink-500 leading-snug mb-2">
                      {input.description}
                    </p>
                  )}
                  {input.columns && input.columns.length > 0 && (
                    <div>
                      <div className="text-[10.5px] font-bold uppercase tracking-wider text-ink-400 mb-1">
                        Required columns
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {input.columns.map((col) => (
                          <span
                            key={col}
                            className="inline-flex items-center rounded-md border border-canvas-border bg-canvas-elevated px-1.5 py-0.5 text-[11px] font-mono text-ink-700"
                          >
                            {col}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </section>
      )}
    </motion.div>
  );
}
