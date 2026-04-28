import { useCallback, useMemo, useState } from 'react';
import { ArrowLeft, ShieldCheck, Sparkles } from 'lucide-react';
import { WORKFLOWS } from '../../data/mockData';
import EditClarificationStage from './EditClarificationStage';
import EditChatPanel from './EditChatPanel';
import EditConfigPanel from './EditConfigPanel';
import EditCanvas from './EditCanvas';
import type { EditChatMessage, EditClarificationStep, EditWorkspaceTab } from './types';

interface Props {
  workflowId: string;
  onBack: () => void;
}

const CLARIFICATION_STEPS: EditClarificationStep[] = [
  {
    id: 'date-range',
    question: 'First — what date range should I cover?',
    options: ['Last 30 days', 'Last 90 days', 'Full FY26', 'Custom range'],
    shortLabel: 'Date range',
    highlightTab: 'input',
  },
  {
    id: 'sources',
    question: 'Which data sources should I edit on this run?',
    options: [
      'All linked sources',
      'Only ERP modules',
      'Only file uploads',
      'Pick individually in the editor',
    ],
    shortLabel: 'Sources',
    highlightTab: 'input',
  },
  {
    id: 'thresholds',
    question: 'Adjust matching thresholds?',
    options: [
      'Keep current (5% tolerance)',
      'Tighten to 1%',
      'Loosen to 10%',
      'Switch to exact match only',
    ],
    shortLabel: 'Thresholds',
    highlightTab: 'plan',
  },
  {
    id: 'output',
    question: 'Anything to change about the output?',
    options: [
      'Keep current columns + layout',
      'Add variance + status columns',
      'Switch to dashboard layout',
      'Re-route delivery (Slack / email)',
    ],
    shortLabel: 'Output',
    highlightTab: 'output',
  },
];

let _msgCounter = 0;
const nextMsgId = () => `edit-${++_msgCounter}`;

export default function WorkflowEditInChatJourney({ workflowId, onBack }: Props) {
  const wf = WORKFLOWS.find((w) => w.id === workflowId);
  const workflowName = wf?.name ?? 'Workflow';

  const [phase, setPhase] = useState<'clarify' | 'editor'>('clarify');
  const [chatInput, setChatInput] = useState('');
  const [rightOpen, setRightOpen] = useState(true);
  const [editorActiveTab, setEditorActiveTab] = useState<EditWorkspaceTab>('input');

  const initialMessages = useMemo<EditChatMessage[]>(
    () => buildInitialMessages(workflowName),
    [workflowName],
  );
  const [messages, setMessages] = useState<EditChatMessage[]>(initialMessages);

  const handleClarificationsComplete = useCallback(
    (a: Record<number, string>) => {
      // Determine which tab to land on based on answered focus areas.
      const focus = CLARIFICATION_STEPS.reduce<EditWorkspaceTab>((acc, step, idx) => {
        if (a[idx]) return step.highlightTab;
        return acc;
      }, 'input');
      setEditorActiveTab(focus);

      // Synthesize a recap message at the top of the editor chat so the
      // editor is grounded in what the user just chose.
      const summary = CLARIFICATION_STEPS.map((s, i) => {
        const ans = a[i];
        if (!ans) return null;
        return `• **${s.shortLabel}:** ${ans}`;
      })
        .filter(Boolean)
        .join('\n');

      const recap: EditChatMessage = {
        id: nextMsgId(),
        role: 'ira',
        text:
          summary.length > 0
            ? `Locked in your edit scope:\n${summary}\n\nI&apos;ve opened the workspace on the right — adjust anything inline, then hit **Confirm & Proceed**.`
            : 'Skipped the quick check — opening the editor with current settings. Adjust anything on the right and hit **Confirm & Proceed** when ready.',
      };
      setMessages([recap, ...initialMessages]);
      setPhase('editor');
    },
    [initialMessages],
  );

  const handleSend = useCallback((text: string) => {
    setMessages((prev) => [
      ...prev,
      { id: nextMsgId(), role: 'user', text },
      {
        id: nextMsgId(),
        role: 'ira',
        text: `Noted — “${text.slice(0, 80)}${text.length > 80 ? '…' : ''}”. I&apos;ve reflected that in the workspace on the right.`,
      },
    ]);
  }, []);

  const handleConfirmProceed = useCallback(() => {
    setMessages((prev) => [
      ...prev,
      {
        id: nextMsgId(),
        role: 'ira',
        text: `Saved your edits to **${workflowName}**. The workflow is ready — open the executor when you want to run it.`,
      },
    ]);
  }, [workflowName]);

  if (!wf) {
    return (
      <div className="flex flex-col h-full items-center justify-center bg-canvas">
        <div className="text-[14px] font-semibold text-ink-800 mb-2">Workflow not found</div>
        <button
          type="button"
          onClick={onBack}
          className="text-[12.5px] text-brand-700 hover:text-brand-500 cursor-pointer"
        >
          ← Back
        </button>
      </div>
    );
  }

  if (phase === 'clarify') {
    return (
      <div className="flex flex-col h-full bg-canvas">
        <EditClarificationStage
          workflowName={workflowName}
          steps={CLARIFICATION_STEPS}
          onBack={onBack}
          onComplete={handleClarificationsComplete}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-canvas">
      {/* Header */}
      <header className="h-14 shrink-0 border-b border-canvas-border bg-canvas-elevated flex items-center justify-between px-4 gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-ink-500 hover:text-brand-600 transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} />
            Back to Workflow
          </button>
          <span className="h-5 w-px bg-canvas-border" />
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shrink-0">
            <Sparkles size={15} className="text-white" />
          </div>
          <div className="min-w-0">
            <div className="text-[14px] font-semibold text-ink-800 tracking-tight truncate">
              Edit in Chat
            </div>
            <div className="text-[11px] text-ink-500 truncate">{workflowName}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleConfirmProceed}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-[12.5px] font-semibold px-3 py-1.5 transition-colors cursor-pointer"
          >
            <ShieldCheck size={13} />
            Save edits
          </button>
        </div>
      </header>

      {/* Body — 3 columns */}
      <div
        className="flex-1 min-h-0 grid transition-[grid-template-columns] duration-300"
        style={{
          gridTemplateColumns: rightOpen ? '30% 1fr 28%' : '30% 1fr 48px',
        }}
      >
        <EditChatPanel
          workflowName={workflowName}
          messages={messages}
          input={chatInput}
          setInput={setChatInput}
          onSend={handleSend}
          onConfirmProceed={handleConfirmProceed}
          onViewWorkspace={() => setRightOpen(true)}
        />

        <EditCanvas />

        <EditConfigPanel
          initialTab={editorActiveTab}
          open={rightOpen}
          onToggleOpen={() => setRightOpen((v) => !v)}
        />
      </div>
    </div>
  );
}

function buildInitialMessages(workflowName: string): EditChatMessage[] {
  return [
    {
      id: nextMsgId(),
      role: 'ira',
      text: `Re-opened **${workflowName}** for editing. Below is the current configuration — change anything in the workspace on the right, then hit **Confirm & Proceed** to save.`,
    },
    {
      id: nextMsgId(),
      role: 'ira',
      text: 'Drop the required data files into the upload window so I can map them.',
      linkedSources: [
        { source: 'SAP ERP — AP Module', target: 'Invoices' },
        { source: 'GL Transaction History', target: 'Purchase Orders' },
        { source: 'Vendor Master Data', target: 'Contracts Register' },
      ],
      showViewWorkspace: true,
    },
    {
      id: nextMsgId(),
      role: 'ira',
      text: 'Files verified — moving to data mapping.',
    },
    {
      id: nextMsgId(),
      role: 'ira',
      mappings: [
        {
          name: 'Invoices',
          from: 'SAP ERP — AP Module',
          cols: ['Invoice No', 'Vendor', 'PO Ref', 'Amount', 'Line Item', 'Invoice Date'],
          ofTotal: 6,
        },
        {
          name: 'Purchase Orders',
          from: 'GL Transaction History',
          cols: ['PO No', 'Vendor', 'Contract Ref', 'Amount', 'Line Item', 'Status'],
          ofTotal: 6,
        },
        {
          name: 'Contracts Register',
          from: 'Vendor Master Data',
          cols: ['Contract Ref', 'Vendor', 'Scope', 'Cap', 'End Date'],
          ofTotal: 5,
        },
      ],
      showConfirmProceed: true,
      showViewWorkspace: true,
    },
  ];
}
