import { useEffect, useRef } from 'react';
import { Bot, Link2, Send, ShieldCheck, Sparkles, Workflow } from 'lucide-react';
import type { EditChatMessage } from './types';

interface Props {
  workflowName: string;
  messages: EditChatMessage[];
  input: string;
  setInput: (v: string) => void;
  onSend: (text: string) => void;
  onConfirmProceed: () => void;
  onViewWorkspace: () => void;
}

export default function EditChatPanel({
  workflowName,
  messages,
  input,
  setInput,
  onSend,
  onConfirmProceed,
  onViewWorkspace,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

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
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center">
            <Workflow size={15} className="text-white" />
          </div>
          <div className="min-w-0">
            <div className="text-[13px] font-semibold text-ink-800 leading-tight truncate">
              Editing — {workflowName}
            </div>
            <div className="text-[12px] text-ink-400 leading-tight">Chat-based edit session</div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.map((m) => (
          <ChatBubble
            key={m.id}
            msg={m}
            onConfirmProceed={onConfirmProceed}
            onViewWorkspace={onViewWorkspace}
          />
        ))}
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
          <div className="flex items-center justify-end pt-1.5">
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

function ChatBubble({
  msg,
  onConfirmProceed,
  onViewWorkspace,
}: {
  msg: EditChatMessage;
  onConfirmProceed: () => void;
  onViewWorkspace: () => void;
}) {
  if (msg.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[88%] rounded-2xl rounded-br-sm bg-brand-600 text-white text-[12.5px] leading-relaxed px-3 py-2">
          {msg.text}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1.5 text-[10.5px] font-bold uppercase tracking-wider text-ink-400">
        <Bot size={11} className="text-brand-600" />
        IRA
      </div>
      <div className="space-y-2">
        {msg.text && (
          <div className="text-[12.5px] leading-relaxed text-ink-800">
            {renderRich(msg.text)}
          </div>
        )}

        {msg.linkedSources && msg.linkedSources.length > 0 && (
          <ul className="space-y-1">
            {msg.linkedSources.map((l, i) => (
              <li key={i} className="flex items-center gap-2 text-[12px] text-ink-700">
                <Link2 size={11} className="text-brand-500 shrink-0" />
                <span>
                  Linked <strong className="font-semibold text-ink-900">{l.source}</strong>
                  <span className="mx-1.5 text-ink-400">→</span>
                  <strong className="font-semibold text-ink-900">{l.target}</strong>
                </span>
              </li>
            ))}
          </ul>
        )}

        {msg.mappings && msg.mappings.length > 0 && (
          <div className="space-y-2">
            {msg.mappings.map((mp, i) => (
              <div
                key={i}
                className="rounded-xl border border-canvas-border bg-white px-3 py-2.5"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="min-w-0 flex items-center gap-1.5">
                    <span className="text-[12.5px] font-semibold text-ink-900 truncate">
                      {mp.name}
                    </span>
                    <span className="text-ink-300">←</span>
                    <span className="text-[11.5px] text-ink-500 truncate">{mp.from}</span>
                  </div>
                  <span className="text-[10.5px] font-semibold text-ink-400 tabular-nums shrink-0">
                    {mp.cols.length} of {mp.ofTotal} cols
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {mp.cols.map((c) => (
                    <span
                      key={c}
                      className="text-[11px] font-medium px-1.5 py-0.5 rounded-md bg-brand-50 text-brand-700"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {(msg.showConfirmProceed || msg.showViewWorkspace) && (
          <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
            {msg.showConfirmProceed ? (
              <button
                type="button"
                onClick={onConfirmProceed}
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-[12.5px] font-semibold px-3.5 py-2 transition-colors cursor-pointer"
              >
                <ShieldCheck size={13} />
                Confirm &amp; Proceed
              </button>
            ) : (
              <span />
            )}
            {msg.showViewWorkspace && (
              <button
                type="button"
                onClick={onViewWorkspace}
                className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-canvas-border hover:border-brand-300 hover:text-brand-700 text-ink-600 text-[12px] font-semibold px-3 py-2 transition-colors cursor-pointer"
              >
                <Sparkles size={12} />
                View Workspace
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Lightweight markdown-ish: **bold** only.
function renderRich(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-ink-900">
          {p.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{p}</span>;
  });
}
