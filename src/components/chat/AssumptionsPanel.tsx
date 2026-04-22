import { motion } from 'motion/react';
import { AlertTriangle, Check, Play } from 'lucide-react';

interface AssumptionsPanelProps {
  answers: Record<number, string>;
  assumptions: string[];
  onConfirm: () => void;
}

export default function AssumptionsPanel({
  answers,
  assumptions,
  onConfirm,
}: AssumptionsPanelProps) {
  const answerEntries = Object.entries(answers);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ type: 'spring', damping: 26, stiffness: 300 }}
      className="rounded-2xl border border-amber-200/60 bg-white/80 backdrop-blur-sm shadow-sm overflow-hidden"
    >
      {/* Amber left accent bar */}
      <div className="flex">
        <div className="w-1 shrink-0 bg-amber-400 rounded-l-2xl" />

        <div className="flex-1 p-5">
          {/* Header */}
          <div className="flex items-center gap-2.5 mb-4">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-100">
              <AlertTriangle size={15} className="text-amber-600" />
            </div>
            <span className="text-[14px] font-semibold text-text">
              Assumptions
            </span>
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[11px] font-bold">
              {assumptions.length}
            </span>
          </div>

          {/* Confirmed answers */}
          {answerEntries.length > 0 && (
            <div className="mb-4">
              <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2">
                Confirmed
              </p>
              <div className="space-y-2">
                {answerEntries.map(([key, value]) => (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Number(key) * 0.08 }}
                    className="flex items-start gap-2.5 px-3 py-2 rounded-lg bg-emerald-50/60"
                  >
                    <div className="flex items-center justify-center w-4.5 h-4.5 rounded-full bg-emerald-500 mt-0.5 shrink-0">
                      <Check size={10} className="text-white" strokeWidth={3} />
                    </div>
                    <span className="text-[13px] text-text leading-snug">
                      {value}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Assumptions list */}
          <div className="mb-4">
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2">
              AI will assume
            </p>
            <div className="space-y-2">
              {assumptions.map((assumption, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + idx * 0.08 }}
                  className="flex items-start gap-2.5 px-3 py-2 rounded-lg bg-amber-50/60"
                >
                  <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                  <span className="text-[13px] text-text leading-snug">
                    {assumption}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Confirm button */}
          <button
            onClick={onConfirm}
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-primary text-white text-[13px] font-semibold hover:bg-primary-hover transition-colors cursor-pointer shadow-sm"
          >
            <Play size={14} fill="currentColor" />
            Confirm &amp; Execute
          </button>
        </div>
      </div>
    </motion.div>
  );
}
