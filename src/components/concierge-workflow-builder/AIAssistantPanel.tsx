import { useEffect, useRef } from 'react';
import { Plus, Send, Sparkles, Bot } from 'lucide-react';
import type { JourneyStep } from './Stepper';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

export interface QuickReply {
  id: string;
  label: string;
  emphasis?: 'filled' | 'outline';
  onClick: () => void;
}

interface Props {
  step: JourneyStep;
  workflowName?: string;
  messages: ChatMessage[];
  quickReplies?: QuickReply[];
  onSend: (text: string) => void;
  onOpenGuideMe: () => void;
  input: string;
  setInput: (v: string) => void;
}

const STEPS: { id: JourneyStep; label: string }[] = [
  { id: 1, label: 'Write Prompt' },
  { id: 2, label: 'Upload Files' },
  { id: 3, label: 'Map Data' },
  { id: 4, label: 'Review & Run' },
];

export default function AIAssistantPanel({
  step,
  messages,
  quickReplies,
  onSend,
  onOpenGuideMe,
  input,
  setInput,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, quickReplies]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    onSend(text);
    setInput('');
  };

  return (
    <aside className="flex flex-col h-full bg-canvas-elevated border-r border-canvas-border min-h-0">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-canvas-border shrink-0">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center">
            <Sparkles size={15} className="text-white" />
          </div>
          <div>
            <div className="text-[13px] font-semibold text-ink-800 leading-tight">AI Assistant</div>
            <div className="text-[11px] text-ink-400 leading-tight">Guided workflow setup</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {STEPS.map((s, i) => {
            const isDone = s.id < step;
            const isActive = s.id === step;
            return (
              <div key={s.id} className="flex items-center flex-1">
                <span
                  className={[
                    'w-2.5 h-2.5 rounded-full shrink-0',
                    isActive ? 'bg-brand-600' : isDone ? 'bg-compliant' : 'bg-brand-200',
                  ].join(' ')}
                />
                {i < STEPS.length - 1 && (
                  <span
                    className={`h-[2px] flex-1 rounded-full ml-1 ${
                      isDone ? 'bg-compliant/40' : 'bg-brand-200/60'
                    }`}
                  />
                )}
              </div>
            );
          })}
          <span className="text-[11px] font-semibold text-brand-700 ml-2 whitespace-nowrap">
            {STEPS.find((s) => s.id === step)?.label}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {messages.map((m) => (
          <div key={m.id} className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            {m.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                <Bot size={13} />
              </div>
            )}
            <div
              className={[
                'max-w-[88%] rounded-2xl px-3 py-2 text-[12.5px] leading-relaxed',
                m.role === 'user'
                  ? 'bg-brand-600 text-white rounded-br-sm'
                  : 'bg-canvas text-ink-800 rounded-bl-sm',
              ].join(' ')}
              dangerouslySetInnerHTML={{ __html: renderInline(m.text, m.role) }}
            />
          </div>
        ))}

        {quickReplies && quickReplies.length > 0 && (
          <div className="flex flex-wrap gap-2 pl-9">
            {quickReplies.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={r.onClick}
                className={[
                  'rounded-full text-[12px] font-semibold px-3 py-1.5 transition-colors cursor-pointer',
                  r.emphasis === 'filled'
                    ? 'bg-brand-600 hover:bg-brand-500 text-white'
                    : 'bg-white border border-brand-300 text-brand-700 hover:bg-brand-50',
                ].join(' ')}
              >
                {r.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-canvas-border shrink-0">
        <div className="rounded-xl border border-canvas-border bg-canvas px-3 py-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            rows={2}
            placeholder="Describe what you need…"
            className="w-full bg-transparent resize-none text-[12.5px] text-ink-800 placeholder:text-ink-400 focus:outline-none"
          />
          <div className="flex items-center justify-between pt-1.5">
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="w-7 h-7 rounded-lg text-ink-500 hover:bg-brand-50 hover:text-brand-600 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Attach"
              >
                <Plus size={14} />
              </button>
              <button
                type="button"
                onClick={onOpenGuideMe}
                className="inline-flex items-center gap-1 rounded-full bg-brand-50 hover:bg-brand-100 text-brand-700 text-[11.5px] font-semibold px-2.5 py-1 transition-colors cursor-pointer"
              >
                <Sparkles size={12} />
                Guide me
              </button>
            </div>
            <button
              type="button"
              onClick={handleSend}
              disabled={!input.trim()}
              className={[
                'w-7 h-7 rounded-lg flex items-center justify-center transition-colors',
                input.trim()
                  ? 'bg-brand-600 hover:bg-brand-500 text-white cursor-pointer'
                  : 'bg-canvas-border text-ink-400 cursor-not-allowed',
              ].join(' ')}
              aria-label="Send"
            >
              <Send size={13} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

function renderInline(text: string, role: ChatMessage['role']): string {
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  const boldClass = role === 'user' ? 'font-semibold' : 'font-semibold text-brand-700';
  return escaped
    .replace(/\*\*([^*]+)\*\*/g, `<strong class="${boldClass}">$1</strong>`)
    .replace(/\n/g, '<br />');
}
