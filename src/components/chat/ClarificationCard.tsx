import { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  X,
  ArrowRight,
  Pencil,
  Send,
  Check,
} from 'lucide-react';

interface ClarificationCardProps {
  questions: Array<{
    question: string;
    options: string[];
  }>;
  onComplete: (answers: Record<number, string>) => void;
  onSkipAll: () => void;
}

export default function ClarificationCard({
  questions,
  onComplete,
  onSkipAll,
}: ClarificationCardProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [customMode, setCustomMode] = useState(false);
  const [customText, setCustomText] = useState('');

  const total = questions.length;
  const current = questions[currentPage];

  const goTo = useCallback((page: number) => {
    setCurrentPage(page);
    setCustomMode(false);
    setCustomText('');
  }, []);

  const handleOptionClick = (option: string) => {
    setAnswers(prev => ({ ...prev, [currentPage]: option }));
    // Auto-advance to next question after brief delay
    if (currentPage < total - 1) {
      setTimeout(() => goTo(currentPage + 1), 300);
    }
  };

  const handleCustomSubmit = () => {
    const text = customText.trim();
    if (text) {
      setAnswers(prev => ({ ...prev, [currentPage]: text }));
      setCustomMode(false);
      setCustomText('');
      if (currentPage < total - 1) {
        setTimeout(() => goTo(currentPage + 1), 300);
      }
    }
  };

  const handleSkip = () => {
    if (currentPage < total - 1) {
      goTo(currentPage + 1);
    } else {
      onComplete(answers);
    }
  };

  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount >= total;

  return (
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 30, opacity: 0 }}
      transition={{ type: 'spring', damping: 30, stiffness: 350 }}
      className="glass-card-strong rounded-t-2xl rounded-b-none border border-b-0 border-primary/10 overflow-hidden"
    >
      {/* Header: question + pagination + close */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2.5">
        <h3 className="text-[14px] font-semibold text-text leading-snug flex-1 pr-4">
          {current.question}
        </h3>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            disabled={currentPage === 0}
            onClick={() => goTo(currentPage - 1)}
            className="p-1 rounded-md text-text-muted hover:text-text-secondary disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-[12px] text-text-muted font-medium min-w-[40px] text-center">
            {currentPage + 1} of {total}
          </span>
          <button
            disabled={currentPage === total - 1}
            onClick={() => goTo(currentPage + 1)}
            className="p-1 rounded-md text-text-muted hover:text-text-secondary disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            <ChevronRight size={16} />
          </button>
          <button
            onClick={onSkipAll}
            className="p-1 ml-1 rounded-md text-text-muted/40 hover:text-text-secondary cursor-pointer transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Options */}
      <div className="px-5 pb-3 space-y-1.5">
        {current.options.map((option, idx) => {
          const isSelected = answers[currentPage] === option;
          return (
            <button
              key={`${currentPage}-${idx}`}
              onClick={() => handleOptionClick(option)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-[13px] font-medium transition-all cursor-pointer ${
                isSelected
                  ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm'
                  : 'bg-surface-2/60 text-text-secondary border border-transparent hover:bg-surface-2 hover:border-border-light'
              }`}
            >
              <span
                className={`flex items-center justify-center w-6 h-6 rounded-lg text-[12px] font-bold shrink-0 ${
                  isSelected
                    ? 'bg-primary text-white'
                    : 'bg-white text-text-muted border border-border-light'
                }`}
              >
                {isSelected ? <Check size={12} /> : idx + 1}
              </span>
              <span className="flex-1">{option}</span>
              {isSelected && <ArrowRight size={14} className="text-primary shrink-0" />}
            </button>
          );
        })}

        {/* Something else */}
        {!customMode ? (
          <button
            onClick={() => setCustomMode(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-[13px] text-text-muted hover:text-text-secondary hover:bg-surface-2/60 transition-all cursor-pointer border border-transparent"
          >
            <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-white border border-border-light shrink-0">
              <Pencil size={11} className="text-text-muted" />
            </span>
            <span>Something else</span>
          </button>
        ) : (
          <div className="flex gap-2 px-1 pt-1">
            <input
              type="text"
              value={customText}
              onChange={e => setCustomText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleCustomSubmit(); }}
              placeholder="Type your answer..."
              autoFocus
              className="flex-1 px-3 py-2.5 rounded-xl border border-border-light bg-white text-[13px] text-text placeholder:text-text-muted focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
            />
            <button
              onClick={handleCustomSubmit}
              disabled={!customText.trim()}
              className="px-3 py-2.5 rounded-xl bg-primary text-white disabled:opacity-30 cursor-pointer hover:bg-primary-hover transition-colors"
            >
              <Send size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-5 pb-3 pt-1">
        {/* Submit button */}
        <div>
          {(allAnswered || (currentPage === total - 1 && answeredCount > 0)) && (
            <motion.button
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => onComplete(answers)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-[12px] font-semibold hover:bg-primary-hover transition-colors cursor-pointer shadow-sm"
            >
              Submit {answeredCount} answer{answeredCount > 1 ? 's' : ''} <ArrowRight size={12} />
            </motion.button>
          )}
        </div>
        <button
          onClick={handleSkip}
          className="px-3 py-1.5 rounded-lg text-[12px] font-medium text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
        >
          Skip
        </button>
      </div>
    </motion.div>
  );
}
