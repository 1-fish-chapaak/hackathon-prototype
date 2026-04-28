import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ChevronRight, Pencil, Send, Check } from 'lucide-react';
import type { EditClarificationStep } from './types';

interface Props {
  workflowName: string;
  steps: EditClarificationStep[];
  onBack: () => void;
  onComplete: (answers: Record<number, string>) => void;
}

export default function EditClarificationStage({ workflowName, steps, onBack, onComplete }: Props) {
  const [currentPage, setCurrentPage] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [customMode, setCustomMode] = useState(false);
  const [customText, setCustomText] = useState('');

  const total = steps.length;
  const current = steps[currentPage];
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount >= total;

  // Keyboard nav: 1-9 select, ↑/↓ navigate, Enter complete-if-done, Esc skip
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (customMode) return;
      const num = parseInt(e.key, 10);
      if (!Number.isNaN(num) && num >= 1 && num <= current.options.length) {
        handleOptionClick(current.options[num - 1]);
        return;
      }
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        if (currentPage < total - 1) setCurrentPage(p => p + 1);
      }
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        if (currentPage > 0) setCurrentPage(p => p - 1);
      }
      if (e.key === 'Escape') {
        handleSkip();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, customMode, answers]);

  const advance = () => {
    if (currentPage < total - 1) {
      setCustomMode(false);
      setCustomText('');
      setTimeout(() => setCurrentPage(p => p + 1), 220);
    }
  };

  const handleOptionClick = (option: string) => {
    setAnswers(prev => ({ ...prev, [currentPage]: option }));
    advance();
  };

  const handleCustomSubmit = () => {
    const text = customText.trim();
    if (!text) return;
    setAnswers(prev => ({ ...prev, [currentPage]: text }));
    setCustomMode(false);
    setCustomText('');
    advance();
  };

  const handleSkip = () => {
    if (currentPage < total - 1) {
      setCurrentPage(p => p + 1);
    } else {
      onComplete(answers);
    }
  };

  return (
    <div
      className="flex-1 overflow-y-auto"
      style={{ background: 'linear-gradient(180deg, #f8f5ff 0%, #fafafa 280px)' }}
    >
      {/* Top breadcrumb */}
      <div className="px-8 pt-6">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-ink-500 hover:text-brand-600 transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} />
          Back to AI Concierge
        </button>
      </div>

      {/* Hero */}
      <div className="max-w-[860px] mx-auto px-8 pt-16 pb-10 text-center">
        <div className="inline-flex items-center gap-1.5 text-[12.5px] text-ink-500 mb-6">
          <ChevronRight size={13} />
          Identified ambiguity, asking for inputs
        </div>
        <h1 className="text-[34px] font-bold tracking-tight text-ink-900 leading-[1.15]">
          One quick check before I edit{' '}
          <span className="text-ink-700">— pick what fits, or type your own.</span>
        </h1>
        <p className="text-[13.5px] text-ink-500 mt-4">
          Editing <span className="font-semibold text-ink-700">{workflowName}</span>. I&apos;ll only
          touch the parts you confirm here.
        </p>
      </div>

      {/* Card pinned to bottom-ish */}
      <div className="max-w-[820px] mx-auto px-8 pb-16">
        <motion.div
          key={currentPage}
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', damping: 30, stiffness: 320 }}
          className="rounded-2xl bg-white border border-canvas-border overflow-hidden"
          style={{ boxShadow: '0 12px 40px rgba(106,18,205,0.06), 0 1px 0 rgba(255,255,255,0.6) inset' }}
        >
          {/* Header */}
          <div className="px-5 pt-4 pb-3 border-b border-canvas-border flex items-center justify-between gap-4">
            <h3 className="text-[15px] font-semibold text-ink-900 leading-snug truncate">
              {current.question}
            </h3>
            <span className="text-[12px] text-ink-400 font-semibold shrink-0 tabular-nums">
              {currentPage + 1} of {total}
            </span>
          </div>

          {/* Options */}
          <div className="py-2">
            {current.options.map((option, idx) => {
              const selected = answers[currentPage] === option;
              return (
                <button
                  key={`${currentPage}-${idx}`}
                  type="button"
                  onClick={() => handleOptionClick(option)}
                  className={[
                    'w-full flex items-center gap-3 px-5 py-3 text-left transition-colors cursor-pointer',
                    'border-t border-canvas-border first:border-t-0',
                    selected ? 'bg-brand-50/60' : 'hover:bg-canvas',
                  ].join(' ')}
                >
                  <span
                    className={[
                      'w-6 h-6 rounded-md flex items-center justify-center text-[11.5px] font-bold shrink-0',
                      selected
                        ? 'bg-brand-600 text-white'
                        : 'bg-brand-50 text-brand-700',
                    ].join(' ')}
                  >
                    {selected ? <Check size={11} /> : idx + 1}
                  </span>
                  <span className="flex-1 text-[13.5px] text-ink-800">{option}</span>
                  <ReturnArrowIcon dimmed={!selected} />
                </button>
              );
            })}

            {/* Something else */}
            {!customMode ? (
              <button
                type="button"
                onClick={() => setCustomMode(true)}
                className="w-full flex items-center gap-3 px-5 py-3 text-left transition-colors cursor-pointer border-t border-canvas-border hover:bg-canvas"
              >
                <span className="w-6 h-6 rounded-md flex items-center justify-center bg-canvas border border-canvas-border shrink-0">
                  <Pencil size={11} className="text-ink-400" />
                </span>
                <span className="flex-1 text-[13px] text-ink-400">Something else</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSkip();
                  }}
                  className="text-[12.5px] font-semibold text-ink-500 hover:text-ink-700 transition-colors px-2 py-1 cursor-pointer"
                >
                  Skip
                </button>
              </button>
            ) : (
              <div className="flex items-center gap-2 px-4 py-3 border-t border-canvas-border bg-canvas/40">
                <input
                  autoFocus
                  type="text"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCustomSubmit();
                    if (e.key === 'Escape') {
                      setCustomMode(false);
                      setCustomText('');
                    }
                  }}
                  placeholder="Type your own answer…"
                  className="flex-1 px-3 py-2 rounded-lg border border-canvas-border bg-white text-[13px] text-ink-800 placeholder:text-ink-400 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                />
                <button
                  type="button"
                  onClick={handleCustomSubmit}
                  disabled={!customText.trim()}
                  className={[
                    'px-3 py-2 rounded-lg flex items-center justify-center transition-colors',
                    customText.trim()
                      ? 'bg-brand-600 hover:bg-brand-500 text-white cursor-pointer'
                      : 'bg-canvas-border text-ink-400 cursor-not-allowed',
                  ].join(' ')}
                >
                  <Send size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCustomMode(false);
                    setCustomText('');
                  }}
                  className="text-[12.5px] text-ink-500 hover:text-ink-700 px-2 py-1 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Footer hints */}
        <div className="flex items-center justify-between mt-3 text-[11.5px] text-ink-400">
          <div className="flex items-center gap-3">
            <KbdHint label="↑↓" desc="navigate" />
            <KbdHint label="Enter" desc="select" />
            <KbdHint label="Esc" desc="skip" />
          </div>
          <div className="flex items-center gap-3">
            <span className="tabular-nums">
              {answeredCount} of {total} answered
            </span>
            {allAnswered && (
              <button
                type="button"
                onClick={() => onComplete(answers)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-[12px] font-semibold cursor-pointer transition-colors"
              >
                Open editor
                <ChevronRight size={12} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function KbdHint({ label, desc }: { label: string; desc: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="font-semibold text-ink-600">{label}</span>
      <span className="text-ink-400">to {desc}</span>
    </span>
  );
}

function ReturnArrowIcon({ dimmed }: { dimmed: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      className={dimmed ? 'text-ink-300' : 'text-brand-600'}
      fill="none"
    >
      <path
        d="M11 3v3a2 2 0 0 1-2 2H3m0 0 3 3m-3-3 3-3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
