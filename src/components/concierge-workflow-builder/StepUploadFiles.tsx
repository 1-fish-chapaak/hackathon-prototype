import { useRef } from 'react';
import { motion } from 'motion/react';
import { UploadCloud, File as FileIcon, X, ArrowRight, ArrowLeft } from 'lucide-react';
import type { WorkflowDraft, JourneyFiles, UploadedFile } from './types';

interface Props {
  workflow: WorkflowDraft;
  files: JourneyFiles;
  setFiles: (f: JourneyFiles) => void;
  onNext: () => void;
  onBack: () => void;
}

function humanSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function StepUploadFiles({ workflow, files, setFiles, onNext, onBack }: Props) {
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

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

  const requiredSatisfied = workflow.inputs
    .filter((i) => i.required)
    .every((i) => (files[i.id] ?? []).length > 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-2xl border border-canvas-border bg-canvas-elevated p-6"
    >
      <div className="flex items-start justify-between gap-6 mb-5">
        <div>
          <h3 className="text-[14px] font-semibold text-ink-800 tracking-tight mb-1">
            Upload the data this workflow needs
          </h3>
          <p className="text-[12.5px] text-ink-500 leading-relaxed max-w-xl">
            One slot per input the workflow expects. Drag-and-drop or click to browse. File
            contents aren't read — this is a prototype, so only the filename + size are kept.
          </p>
        </div>
        <div className="shrink-0 text-[11px] text-ink-400 bg-canvas rounded-full px-3 py-1 border border-canvas-border">
          {workflow.inputs.filter((i) => i.required).length} required · {workflow.inputs.length} total
        </div>
      </div>

      <ul className="flex flex-col gap-3">
        {workflow.inputs.map((input) => {
          const uploaded = files[input.id] ?? [];
          return (
            <li
              key={input.id}
              className="rounded-xl border border-canvas-border bg-canvas p-4"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[13px] font-semibold text-ink-800 truncate">
                      {input.name}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-brand-600">
                      {input.type}
                    </span>
                    {input.required ? (
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-risk">
                        Required
                      </span>
                    ) : (
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-ink-400">
                        Optional
                      </span>
                    )}
                  </div>
                  <p className="text-[11.5px] text-ink-500 leading-relaxed">
                    {input.description}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => inputRefs.current[input.id]?.click()}
                  className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-brand-600 text-brand-600 bg-white hover:bg-brand-50 text-[12px] font-semibold px-3 py-1.5 transition-colors cursor-pointer"
                >
                  <UploadCloud size={14} />
                  {uploaded.length > 0 ? 'Add more' : 'Upload'}
                </button>
                <input
                  ref={(el) => {
                    inputRefs.current[input.id] = el;
                  }}
                  type="file"
                  multiple={input.multiple}
                  hidden
                  onChange={(e) => {
                    handlePick(input.id, e.target.files);
                    e.target.value = '';
                  }}
                />
              </div>

              {uploaded.length === 0 ? (
                <div className="rounded-lg border border-dashed border-canvas-border bg-white py-4 text-center text-[11.5px] text-ink-400">
                  No file chosen yet.
                </div>
              ) : (
                <ul className="flex flex-col gap-1.5">
                  {uploaded.map((f, i) => (
                    <li
                      key={`${f.name}-${i}`}
                      className="flex items-center gap-2 bg-white rounded-lg border border-canvas-border px-3 py-2"
                    >
                      <FileIcon size={14} className="text-brand-600 shrink-0" />
                      <span className="text-[12.5px] text-ink-800 truncate flex-1">{f.name}</span>
                      <span className="text-[11px] text-ink-400 shrink-0">{humanSize(f.size)}</span>
                      <button
                        type="button"
                        onClick={() => handleRemove(input.id, i)}
                        className="text-ink-400 hover:text-risk transition-colors cursor-pointer"
                        aria-label={`Remove ${f.name}`}
                      >
                        <X size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>

      <div className="flex items-center justify-between mt-5">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 rounded-lg border border-canvas-border bg-white hover:bg-canvas text-[13px] font-semibold text-ink-600 px-4 py-2 transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} />
          Back
        </button>
        <button
          type="button"
          disabled={!requiredSatisfied}
          onClick={onNext}
          className={[
            'inline-flex items-center gap-1.5 rounded-lg text-[13px] font-semibold px-4 py-2 transition-colors',
            requiredSatisfied
              ? 'bg-brand-600 hover:bg-brand-500 text-white cursor-pointer'
              : 'bg-canvas text-ink-400 cursor-not-allowed border border-canvas-border',
          ].join(' ')}
        >
          {requiredSatisfied ? 'Continue to map data' : 'Upload required files to continue'}
          <ArrowRight size={14} />
        </button>
      </div>
    </motion.div>
  );
}
