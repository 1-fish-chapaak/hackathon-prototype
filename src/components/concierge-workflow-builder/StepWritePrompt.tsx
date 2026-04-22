import { motion } from 'motion/react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { SAMPLE_WORKFLOWS } from './sampleWorkflows';

interface Props {
  prompt: string;
  setPrompt: (v: string) => void;
  onNext: () => void;
  onPickTemplate: (id: string) => void;
}

export default function StepWritePrompt({ prompt, setPrompt, onNext, onPickTemplate }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Prompt */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="lg:col-span-3 rounded-2xl border border-canvas-border bg-canvas-elevated p-6"
      >
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={14} className="text-brand-600" />
          <h3 className="text-[13px] font-semibold text-ink-800 tracking-tight">
            Describe the audit workflow you want to build
          </h3>
        </div>
        <p className="text-[12px] text-ink-500 mb-4 leading-relaxed">
          Plain English is fine. Name the records to reconcile, the checks to run, and what
          should be flagged. IRA will draft the inputs, steps, and output.
        </p>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={6}
          placeholder={'e.g. "Reconcile our vendor invoices against open POs and flag duplicates or off-policy coding."'}
          className="w-full rounded-xl border border-canvas-border bg-canvas p-3 text-[13px] text-ink-800 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600/30 transition-all resize-none"
        />
        <div className="flex items-center justify-between mt-4">
          <span className="text-[11.5px] text-ink-400">
            {prompt.trim().length > 0 ? `${prompt.trim().length} characters` : 'Prompt is optional if you pick a template'}
          </span>
          <button
            type="button"
            onClick={onNext}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-[13px] font-semibold px-4 py-2 transition-colors cursor-pointer"
          >
            Generate workflow
            <ArrowRight size={14} />
          </button>
        </div>
      </motion.div>

      {/* Templates */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.08 }}
        className="lg:col-span-2 rounded-2xl border border-canvas-border bg-canvas-elevated p-6"
      >
        <h3 className="text-[13px] font-semibold text-ink-800 tracking-tight mb-1">
          Start from a template
        </h3>
        <p className="text-[12px] text-ink-500 mb-4 leading-relaxed">
          Three pre-built audit templates. Pick one and skip straight to upload.
        </p>
        <ul className="flex flex-col gap-2">
          {SAMPLE_WORKFLOWS.map((w) => (
            <li key={w.id}>
              <button
                type="button"
                onClick={() => onPickTemplate(w.id)}
                className="w-full text-left rounded-xl border border-canvas-border bg-canvas hover:bg-brand-50 hover:border-brand-300 px-3.5 py-3 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[13px] font-semibold text-ink-800 truncate">{w.name}</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-brand-600 shrink-0">
                    {w.category}
                  </span>
                </div>
                <p className="text-[11.5px] text-ink-500 leading-relaxed line-clamp-2">
                  {w.description}
                </p>
              </button>
            </li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
}
