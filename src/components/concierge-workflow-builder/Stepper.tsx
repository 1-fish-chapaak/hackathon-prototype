import { Pencil, Upload, Link2, Play, Check } from 'lucide-react';

export type JourneyStep = 1 | 2 | 3 | 4;

const STEPS: { id: JourneyStep; label: string; icon: typeof Pencil }[] = [
  { id: 1, label: 'Write Prompt', icon: Pencil },
  { id: 2, label: 'Upload Files', icon: Upload },
  { id: 3, label: 'Map Data', icon: Link2 },
  { id: 4, label: 'Review & Run', icon: Play },
];

interface Props {
  current: JourneyStep;
  completed: Set<JourneyStep>;
  onJump?: (step: JourneyStep) => void;
}

export default function Stepper({ current, completed, onJump }: Props) {
  return (
    <ol className="flex items-center gap-3 w-full">
      {STEPS.map((s, i) => {
        const isCurrent = s.id === current;
        const isDone = completed.has(s.id);
        const Icon = isDone ? Check : s.icon;
        const isJumpable = isDone || s.id < current;

        return (
          <li key={s.id} className="flex items-center gap-3 flex-1 min-w-0">
            <button
              type="button"
              disabled={!isJumpable && !isCurrent}
              onClick={() => isJumpable && onJump?.(s.id)}
              className={[
                'flex items-center gap-2.5 rounded-full px-3 py-1.5 transition-colors text-left min-w-0',
                isCurrent
                  ? 'bg-brand-600 text-white shadow-sm'
                  : isDone
                    ? 'bg-brand-50 text-brand-700 hover:bg-brand-100 cursor-pointer'
                    : 'bg-canvas text-ink-400 border border-canvas-border cursor-not-allowed',
              ].join(' ')}
            >
              <span
                className={[
                  'w-6 h-6 rounded-full flex items-center justify-center shrink-0',
                  isCurrent
                    ? 'bg-white/20'
                    : isDone
                      ? 'bg-brand-600 text-white'
                      : 'bg-white border border-canvas-border',
                ].join(' ')}
              >
                <Icon size={13} className={isDone && !isCurrent ? 'text-white' : ''} />
              </span>
              <span className="text-[12.5px] font-semibold truncate">
                <span className="opacity-70 mr-1">{s.id}.</span>
                {s.label}
              </span>
            </button>
            {i < STEPS.length - 1 && (
              <span
                className={[
                  'h-px flex-1 min-w-[12px]',
                  isDone ? 'bg-brand-300' : 'bg-canvas-border',
                ].join(' ')}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
