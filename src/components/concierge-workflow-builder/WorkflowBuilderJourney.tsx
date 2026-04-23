import { useCallback, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  CloudUpload,
  Link2,
  Play,
  ShieldCheck,
  Pencil,
  Sparkles,
} from 'lucide-react';
import Stepper, { type JourneyStep } from './Stepper';
import StepWritePrompt from './StepWritePrompt';
import StepUploadFiles from './StepUploadFiles';
import StepMapData from './StepMapData';
import StepReviewRun from './StepReviewRun';
import AIAssistantPanel, { type ChatMessage, type QuickReply } from './AIAssistantPanel';
import PlanPanel from './PlanPanel';
import GuideMeModal from './GuideMeModal';
import { SAMPLE_WORKFLOWS } from './sampleWorkflows';
import { generateWorkflow, runWorkflow, seedAlignments } from './mockApi';
import type {
  JourneyAlignments,
  JourneyFiles,
  JourneyMappings,
  RunResult,
  WorkflowDraft,
} from './types';

interface Props {
  onBack: () => void;
}

const STEP_META: Record<
  JourneyStep,
  { icon: typeof Pencil; title: string; action: string }
> = {
  1: { icon: Pencil, title: 'Describe your workflow', action: 'Generate' },
  2: { icon: CloudUpload, title: 'Upload Data Files', action: 'Verify with Ira' },
  3: { icon: Link2, title: 'Data Mapping', action: 'Confirm & Proceed' },
  4: { icon: Play, title: 'Review & Run', action: 'Run Workflow' },
};

let msgCounter = 0;
const nextMsgId = () => `m-${++msgCounter}`;

export default function WorkflowBuilderJourney({ onBack }: Props) {
  const [step, setStep] = useState<JourneyStep>(1);
  const [prompt, setPrompt] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [workflow, setWorkflow] = useState<WorkflowDraft | null>(null);
  const [files, setFiles] = useState<JourneyFiles>({});
  const [mappings, setMappings] = useState<JourneyMappings>({});
  const [alignments, setAlignments] = useState<JourneyAlignments>({});
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);
  const [guideMeOpen, setGuideMeOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(true);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: nextMsgId(),
      role: 'assistant',
      text: "Describe the audit workflow you want to build, or hit **Guide me** to start from a domain and task.",
    },
  ]);

  const completed = useMemo(() => {
    const done = new Set<JourneyStep>();
    if (workflow) done.add(1);
    if (
      workflow &&
      workflow.inputs
        .filter((i) => i.required)
        .every((i) => (files[i.id] ?? []).length > 0)
    )
      done.add(2);
    if (Object.keys(mappings).length > 0) done.add(3);
    if (result) done.add(4);
    return done;
  }, [workflow, files, mappings, result]);

  const pushAssistant = useCallback((text: string) => {
    setMessages((m) => [...m, { id: nextMsgId(), role: 'assistant', text }]);
  }, []);

  const applyWorkflow = useCallback(
    (draft: WorkflowDraft, howArrived: 'prompt' | 'template' | 'guide') => {
      setWorkflow(draft);
      setFiles({});
      setMappings({});
      setAlignments(seedAlignments(draft));
      setResult(null);
      const intro =
        howArrived === 'guide'
          ? `I've pre-filled the prompt for **${draft.name}** and built the workflow. Upload the required data files in the centre so I can map them.`
          : howArrived === 'template'
            ? `Starting from the **${draft.name}** template. Upload the required data files in the centre to continue.`
            : `I've analyzed your prompt and built the **${draft.name}** workflow. Upload the required data files in the centre section so I can begin the mapping process.`;
      setMessages([
        { id: nextMsgId(), role: 'assistant', text: intro },
      ]);
      setStep(2);
    },
    [],
  );

  const handleGenerate = useCallback(() => {
    if (!prompt.trim()) return;
    const draft = generateWorkflow(prompt);
    applyWorkflow(draft, 'prompt');
  }, [prompt, applyWorkflow]);

  const handlePickTemplate = useCallback(
    (id: string) => {
      const template = SAMPLE_WORKFLOWS.find((w) => w.id === id);
      if (!template) return;
      setPrompt(template.logicPrompt);
      applyWorkflow(
        { ...template, id: `draft-${Date.now()}` },
        'template',
      );
    },
    [applyWorkflow],
  );

  const handleGuideInsert = useCallback(
    (generatedPrompt: string) => {
      if (step === 1) {
        setPrompt(generatedPrompt);
      } else {
        setChatInput(generatedPrompt);
      }
    },
    [step],
  );

  const handleAutofillSamples = useCallback(() => {
    if (!workflow) return;
    const seeded: JourneyFiles = {};
    workflow.inputs.forEach((i) => {
      seeded[i.id] = [
        { name: `${i.name.toLowerCase().replace(/\s+/g, '_')}_sample.${i.type === 'pdf' ? 'pdf' : 'csv'}`, size: 42_000 + Math.floor(Math.random() * 120_000) },
      ];
    });
    setFiles(seeded);
    pushAssistant(
      `Auto-filled sample files for all ${workflow.inputs.length} inputs. Review and click **Verify with Ira** up top when ready.`,
    );
  }, [workflow, pushAssistant]);

  const handleRun = useCallback(async () => {
    if (!workflow) return;
    setRunning(true);
    pushAssistant('Running your workflow now…');
    try {
      const r = await runWorkflow(workflow, files, mappings);
      setResult(r);
      pushAssistant(
        `Finished. The **${r.title}** is ready — ${r.rows.length} rows, ${r.stats[0]?.value ?? ''} records scanned.`,
      );
    } finally {
      setRunning(false);
    }
  }, [workflow, files, mappings, pushAssistant]);

  const handleTopAction = useCallback(() => {
    if (step === 2) setStep(3);
    else if (step === 3) setStep(4);
    else if (step === 4) handleRun();
  }, [step, handleRun]);

  const topActionEnabled = useMemo(() => {
    if (step === 2)
      return !!workflow && workflow.inputs.filter((i) => i.required).every((i) => (files[i.id] ?? []).length > 0);
    if (step === 3) return true;
    if (step === 4) return !running;
    return false;
  }, [step, workflow, files, running]);

  const quickRepliesForStep: QuickReply[] | undefined = useMemo(() => {
    if (step === 2 && workflow) {
      return [
        { id: 'autofill', label: 'Auto-fill sample files', emphasis: 'filled', onClick: handleAutofillSamples },
        { id: 'manual', label: "I'll upload them myself", emphasis: 'outline', onClick: () => pushAssistant('OK, drop files into the centre when you are ready.') },
      ];
    }
    if (step === 4 && !running && !result) {
      return [{ id: 'run', label: 'Run the workflow now', emphasis: 'filled', onClick: handleRun }];
    }
    return undefined;
  }, [step, workflow, handleAutofillSamples, pushAssistant, running, result, handleRun]);

  const handleUserSend = useCallback(
    (text: string) => {
      setMessages((m) => [...m, { id: nextMsgId(), role: 'user', text }]);
      setTimeout(() => {
        pushAssistant(
          `Noted — “${text.slice(0, 80)}${text.length > 80 ? '…' : ''}”. I've kept that in mind for the current step.`,
        );
      }, 400);
    },
    [pushAssistant],
  );

  const TopIcon = STEP_META[step].icon;

  return (
    <div className="flex flex-col h-full bg-canvas">
      {/* Top bar */}
      <header className="h-14 shrink-0 border-b border-canvas-border bg-canvas-elevated flex items-center justify-between px-4 gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-ink-500 hover:text-brand-600 transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} />
            Back to AI Concierge
          </button>
          <span className="h-5 w-px bg-canvas-border" />
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shrink-0">
            <TopIcon size={15} className="text-white" />
          </div>
          <div className="min-w-0">
            <div className="text-[14px] font-semibold text-ink-800 tracking-tight truncate">
              Workflow Builder
            </div>
            <div className="text-[11px] text-ink-500 truncate">{STEP_META[step].title}</div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Stepper
            current={step}
            completed={completed}
            onJump={(s) => {
              if (s <= step || completed.has(s)) setStep(s);
            }}
          />
          {step > 1 && (
            <button
              type="button"
              onClick={handleTopAction}
              disabled={!topActionEnabled}
              className={[
                'inline-flex items-center gap-1.5 rounded-lg text-[12.5px] font-semibold px-3 py-1.5 transition-colors',
                topActionEnabled
                  ? 'bg-brand-600 hover:bg-brand-500 text-white cursor-pointer'
                  : 'bg-brand-100 text-brand-300 cursor-not-allowed',
              ].join(' ')}
            >
              {step === 4 ? <Play size={13} /> : <ShieldCheck size={13} />}
              {STEP_META[step].action}
            </button>
          )}
        </div>
      </header>

      {/* Body */}
      {step === 1 ? (
        <motion.div
          key="step-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="flex-1 overflow-y-auto"
          style={{
            background:
              'linear-gradient(180deg, #f8f5ff 0%, #fafafa 280px)',
          }}
        >
          <StepWritePrompt
            prompt={prompt}
            setPrompt={setPrompt}
            onGenerate={handleGenerate}
            onPickTemplate={handlePickTemplate}
            onOpenGuideMe={() => setGuideMeOpen(true)}
          />
        </motion.div>
      ) : (
        <div
          className="flex-1 min-h-0 grid transition-[grid-template-columns] duration-300"
          style={{
            gridTemplateColumns: rightOpen ? '30% 1fr 20%' : '30% 1fr 48px',
          }}
        >
          <AIAssistantPanel
            step={step}
            workflowName={workflow?.name}
            messages={messages}
            quickReplies={quickRepliesForStep}
            onSend={handleUserSend}
            onOpenGuideMe={() => setGuideMeOpen(true)}
            input={chatInput}
            setInput={setChatInput}
          />

          <main className="min-h-0 overflow-y-auto bg-canvas p-5">
            <div className="max-w-[780px] mx-auto">
              {step === 2 && workflow && (
                <StepUploadFiles workflow={workflow} files={files} setFiles={setFiles} />
              )}
              {step === 3 && workflow && (
                <StepMapData
                  workflow={workflow}
                  files={files}
                  setFiles={setFiles}
                  alignments={alignments}
                  setAlignments={setAlignments}
                />
              )}
              {step === 4 && workflow && (
                <StepReviewRun
                  workflow={workflow}
                  files={files}
                  mappings={mappings}
                  running={running}
                  result={result}
                />
              )}
              {!workflow && (
                <div className="rounded-2xl border border-dashed border-canvas-border bg-canvas-elevated p-10 text-center">
                  <Sparkles size={20} className="mx-auto text-brand-400 mb-2" />
                  <div className="text-[13px] font-semibold text-ink-800 mb-1">
                    No draft yet
                  </div>
                  <p className="text-[12px] text-ink-500 mb-4">
                    Head back to step 1 and generate a workflow from a prompt or template.
                  </p>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-[12px] font-semibold px-3 py-1.5 transition-colors cursor-pointer"
                  >
                    Back to prompt
                  </button>
                </div>
              )}
            </div>
          </main>

          <PlanPanel
            workflow={workflow}
            step={step}
            open={rightOpen}
            onToggleOpen={() => setRightOpen((v) => !v)}
          />
        </div>
      )}

      <GuideMeModal
        open={guideMeOpen}
        onClose={() => setGuideMeOpen(false)}
        onPick={(generatedPrompt) => handleGuideInsert(generatedPrompt)}
      />
    </div>
  );
}
