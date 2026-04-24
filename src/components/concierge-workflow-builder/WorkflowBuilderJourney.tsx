import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowLeft,
  MessageSquare,
  Play,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { type JourneyStep } from './Stepper';
import StepWritePrompt from './StepWritePrompt';
import StepUploadFiles from './StepUploadFiles';
import StepMapData from './StepMapData';
import StepReviewRun from './StepReviewRun';
import StepOutputView from './StepOutputView';
import AIAssistantPanel, { type ChatMessage, type ContextChip, type PrimaryAction, type QuickReply, type ToleranceCardState } from './AIAssistantPanel';
// import PlanPanel from './PlanPanel'; // right-side panel disabled — kept for future use
import GuideMeModal from './GuideMeModal';
import ClarificationPanel from './ClarificationPanel';
import { SAMPLE_WORKFLOWS } from './sampleWorkflows';
import { generateWorkflow, getClarifyQuestions, runWorkflow, seedAlignments } from './mockApi';
import type {
  ClarifyAnswers,
  ClarifyQuestion,
  InputSpec,
  JourneyAlignments,
  JourneyFiles,
  JourneyMappings,
  RunResult,
  WorkflowDraft,
} from './types';

interface Props {
  onBack: () => void;
}

const STEP_META: Record<JourneyStep, { title: string; action: string }> = {
  1: { title: 'Describe your workflow', action: 'Generate' },
  2: { title: 'Upload Data Files', action: 'Verify with Ira' },
  3: { title: 'Data Mapping', action: 'Confirm & Proceed' },
  4: { title: 'Review & Run', action: 'Run Workflow' },
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
  const [chatCollapsed, setChatCollapsed] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [clarifying, setClarifying] = useState(false);
  const [clarifyQuestions, setClarifyQuestions] = useState<ClarifyQuestion[]>([]);
  const [clarifyAnswers, setClarifyAnswers] = useState<ClarifyAnswers>({});
  const [clarifyIndex, setClarifyIndex] = useState(0);
  const [focusedInput, setFocusedInput] = useState<InputSpec | null>(null);
  const [mapExpandedId, setMapExpandedId] = useState<string | null>(null);
  const [mapSeededFor, setMapSeededFor] = useState<string | null>(null);
  const [reviewExpandedSource, setReviewExpandedSource] = useState<string | null>(null);
  const DEFAULT_TOLERANCE: ToleranceCardState = {
    mode: 'percentage',
    percentage: 5,
    absolute: 500,
    enabled: true,
  };
  const [tolerance, setTolerance] = useState<ToleranceCardState>(DEFAULT_TOLERANCE);
  const [toleranceCardId, setToleranceCardId] = useState<string | null>(null);
  // const [rightOpen, setRightOpen] = useState(true); // right-side panel disabled — kept for future use

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

  const pushUser = useCallback((text: string) => {
    setMessages((m) => [...m, { id: nextMsgId(), role: 'user', text }]);
  }, []);

  const pushEvent = useCallback(
    (text: string, tone: 'link' | 'info' | 'success' = 'link') => {
      setMessages((m) => [...m, { id: nextMsgId(), role: 'event', text, tone }]);
    },
    [],
  );

  const pushAssistantAfterDelay = useCallback(
    (text: string, delay = 500) => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        pushAssistant(text);
      }, delay);
    },
    [pushAssistant],
  );

  const applyWorkflow = useCallback(
    (
      draft: WorkflowDraft,
      howArrived: 'prompt' | 'template' | 'guide',
      userPrompt?: string,
    ) => {
      setWorkflow(draft);
      setFiles({});
      setMappings({});
      setAlignments(seedAlignments(draft));
      setResult(null);
      const questions = getClarifyQuestions(draft);
      setClarifyQuestions(questions);
      setClarifyAnswers({});
      setClarifyIndex(0);
      setClarifying(true);
      const intro =
        howArrived === 'guide'
          ? `I've pre-filled the prompt for **${draft.name}** and built the workflow. Before I begin, a few quick clarifications — pick what fits on the right.`
          : howArrived === 'template'
            ? `Starting from the **${draft.name}** template. Before I begin, a few quick clarifications — pick what fits on the right.`
            : `I've analyzed your prompt and built the **${draft.name}** workflow. Before I begin, a few quick clarifications — pick what fits on the right.`;
      const seed: ChatMessage[] = [];
      // Preserve the user's originating input as the first message in history.
      if (userPrompt && userPrompt.trim()) {
        seed.push({ id: nextMsgId(), role: 'user', text: userPrompt.trim() });
      } else if (howArrived === 'template') {
        seed.push({
          id: nextMsgId(),
          role: 'user',
          text: `Use the **${draft.name}** template.`,
        });
      }
      seed.push({ id: nextMsgId(), role: 'assistant', text: intro });
      setMessages(seed);
      setStep(2);
    },
    [],
  );

  const finishClarifying = useCallback(
    (assistantText: string) => {
      setClarifying(false);
      pushAssistantAfterDelay(assistantText, 400);
    },
    [pushAssistantAfterDelay],
  );

  const handleClarifyAnswer = useCallback(
    (questionId: string, answer: string) => {
      pushUser(answer);
      setClarifyAnswers((prev) => ({ ...prev, [questionId]: answer }));
      const nextIdx = clarifyIndex + 1;
      if (nextIdx >= clarifyQuestions.length) {
        finishClarifying(
          'Got it — locked those in. Upload the required data files in the centre so I can map them.',
        );
      } else {
        setClarifyIndex(nextIdx);
      }
    },
    [clarifyIndex, clarifyQuestions.length, pushUser, finishClarifying],
  );

  const handleClarifySkip = useCallback(
    (questionId: string) => {
      setClarifyAnswers((prev) => ({ ...prev, [questionId]: '' }));
      const nextIdx = clarifyIndex + 1;
      if (nextIdx >= clarifyQuestions.length) {
        finishClarifying(
          "OK, proceeding with defaults where you skipped. Upload the required data files in the centre so I can map them.",
        );
      } else {
        setClarifyIndex(nextIdx);
      }
    },
    [clarifyIndex, clarifyQuestions.length, finishClarifying],
  );

  const handleGenerate = useCallback(() => {
    if (!prompt.trim()) return;
    const draft = generateWorkflow(prompt);
    applyWorkflow(draft, 'prompt', prompt);
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

  const executeRun = useCallback(
    async (t: ToleranceCardState) => {
      if (!workflow) return;
      const summary = t.enabled
        ? t.mode === 'percentage'
          ? `±${t.percentage}%`
          : `±$${t.absolute.toLocaleString()}`
        : 'off';
      pushUser(`Run the workflow with tolerance **${summary}**.`);
      setRunning(true);
      setChatCollapsed(true);
      pushAssistantAfterDelay(
        `Running with Amount tolerance **${summary}**…`,
        300,
      );
      try {
        const r = await runWorkflow(workflow, files, mappings);
        setResult(r);
        pushAssistantAfterDelay(
          `Finished. The **${r.title}** is ready — ${r.rows.length} rows, ${r.stats[0]?.value ?? ''} records scanned.`,
          300,
        );
      } finally {
        setRunning(false);
      }
    },
    [workflow, files, mappings, pushAssistantAfterDelay, pushUser],
  );

  const showToleranceCard = useCallback(() => {
    if (toleranceCardId) return;
    const id = nextMsgId();
    setToleranceCardId(id);
    pushAssistantAfterDelay(
      'Before I run — tweak the tolerance rule if you like, or proceed with the default.',
      300,
    );
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        { id, role: 'card', text: '', cardType: 'tolerance' },
      ]);
    }, 600);
  }, [toleranceCardId, pushAssistantAfterDelay]);

  const handleTopAction = useCallback(() => {
    if (step === 2) {
      pushUser(STEP_META[2].action);
      setStep(3);
    } else if (step === 3) {
      pushUser(STEP_META[3].action);
      setStep(4);
    } else if (step === 4) {
      showToleranceCard();
    }
  }, [step, showToleranceCard, pushUser]);

  const topActionEnabled = useMemo(() => {
    if (step === 2)
      return !!workflow && workflow.inputs.filter((i) => i.required).every((i) => (files[i.id] ?? []).length > 0);
    if (step === 3) return true;
    if (step === 4) return !running;
    return false;
  }, [step, workflow, files, running]);

  const primaryAction: PrimaryAction | undefined = useMemo(() => {
    if (step === 1) return undefined;
    if (step === 4 && (running || result)) return undefined;
    if (step === 4 && toleranceCardId) return undefined;
    const enabled = topActionEnabled;
    let hint: string | undefined;
    if (step === 2 && workflow && !enabled) {
      const missing = workflow.inputs.filter(
        (i) => i.required && (files[i.id] ?? []).length === 0,
      );
      if (missing.length > 0) {
        hint = `Add ${missing.length} more ${missing.length === 1 ? 'file' : 'files'} to continue`;
      }
    }
    return {
      label: STEP_META[step].action,
      icon: step === 4 ? <Play size={13} /> : <ShieldCheck size={13} />,
      enabled,
      onClick: handleTopAction,
      hint,
    };
  }, [step, workflow, files, running, result, topActionEnabled, handleTopAction, toleranceCardId]);

  // Seed Step 3 expansion to the first input on first entry per workflow.
  // After that, leave it alone so the user can collapse all sections.
  useEffect(() => {
    if (step !== 3 || !workflow) return;
    if (mapSeededFor === workflow.id) return;
    setMapExpandedId(workflow.inputs[0]?.id ?? null);
    setMapSeededFor(workflow.id);
  }, [step, workflow, mapSeededFor]);

  const mapFocusedInput = useMemo(() => {
    if (step !== 3 || !workflow || !mapExpandedId) return null;
    return workflow.inputs.find((i) => i.id === mapExpandedId) ?? null;
  }, [step, workflow, mapExpandedId]);

  const reviewFocusedStep = useMemo(() => {
    if (step !== 4 || !workflow || !reviewExpandedSource) return null;
    const stepId = reviewExpandedSource.split(':')[0];
    return workflow.steps.find((s) => s.id === stepId) ?? null;
  }, [step, workflow, reviewExpandedSource]);

  const rawQuickReplies: QuickReply[] | undefined = useMemo(() => {
    if (step === 2 && workflow && focusedInput) {
      const cols = focusedInput.columns ?? [];
      const colsText = cols.length
        ? cols.map((c) => `• ${c}`).join('\n')
        : 'No specific columns listed for this input.';
      return [
        {
          id: 'focus-cols',
          label: `What columns does ${focusedInput.name} need?`,
          emphasis: 'outline',
          onClick: () =>
            pushAssistantAfterDelay(
              `**${focusedInput.name}** expects these columns:\n${colsText}`,
              400,
            ),
        },
        {
          id: 'focus-link',
          label: `Link a data source for ${focusedInput.name}`,
          emphasis: 'outline',
          onClick: () =>
            pushAssistantAfterDelay(
              `Scroll to **Choose from existing data files** and pick a source — it will be linked to **${focusedInput.name}** automatically.`,
              400,
            ),
        },
        {
          id: 'focus-sample',
          label: `Show a sample ${focusedInput.type.toUpperCase()} format`,
          emphasis: 'outline',
          onClick: () =>
            pushAssistantAfterDelay(
              `A typical **${focusedInput.name}** file is a ${focusedInput.type.toUpperCase()} with ${cols.length || 'the'} columns in the first row, followed by data rows.${focusedInput.description ? `\n\n${focusedInput.description}` : ''}`,
              400,
            ),
        },
      ];
    }
    if (step === 3 && mapFocusedInput) {
      const mapped = (alignments[mapFocusedInput.id] ?? []).filter((a) => !!a.target).length;
      const total = (alignments[mapFocusedInput.id] ?? []).length || mapFocusedInput.columns?.length || 0;
      return [
        {
          id: 'map-fix',
          label: 'Fix low-confidence columns',
          emphasis: 'outline',
          onClick: () =>
            pushAssistantAfterDelay(
              `For **${mapFocusedInput.name}**, I'll surface the lowest-confidence mappings and suggest replacements. Review each one in the table on the right.`,
              400,
            ),
        },
        {
          id: 'map-suggest',
          label: 'Suggest column mappings',
          emphasis: 'outline',
          onClick: () =>
            pushAssistantAfterDelay(
              `**${mapFocusedInput.name}** currently has ${mapped}/${total} columns mapped. I'll re-run AI suggestions for the unmapped ones.`,
              400,
            ),
        },
        {
          id: 'map-explain',
          label: 'Explain mapping logic',
          emphasis: 'outline',
          onClick: () =>
            pushAssistantAfterDelay(
              `Mappings are scored on name similarity, type compatibility, statistical profile, and semantic similarity. Highest-confidence pairs auto-map; the rest stay editable.`,
              400,
            ),
        },
      ];
    }
    if (step === 4 && reviewFocusedStep) {
      return [
        {
          id: 'review-quality',
          label: 'Check data quality',
          emphasis: 'outline',
          onClick: () =>
            pushAssistantAfterDelay(
              `Running data-quality checks for **${reviewFocusedStep.name}** — null ratios, duplicates, and out-of-range values across all linked sources.`,
              400,
            ),
        },
        {
          id: 'review-preview',
          label: 'Preview schema',
          emphasis: 'outline',
          onClick: () =>
            pushAssistantAfterDelay(
              `**${reviewFocusedStep.name}** uses ${reviewFocusedStep.dataFiles.length} data source${reviewFocusedStep.dataFiles.length === 1 ? '' : 's'}. Expand a source on the right to see its column roles.`,
              400,
            ),
        },
        {
          id: 'review-explain',
          label: 'Explain extraction logic',
          emphasis: 'outline',
          onClick: () =>
            pushAssistantAfterDelay(
              `**${reviewFocusedStep.name}** (${reviewFocusedStep.type}) — ${reviewFocusedStep.description}`,
              400,
            ),
        },
      ];
    }
    return undefined;
  }, [
    step,
    workflow,
    focusedInput,
    mapFocusedInput,
    reviewFocusedStep,
    alignments,
    pushAssistantAfterDelay,
  ]);

  const contextChip: ContextChip | undefined = useMemo(() => {
    if (step === 2 && focusedInput) {
      const uploaded = (files[focusedInput.id] ?? []).length;
      const subtitleBits: string[] = [focusedInput.type.toUpperCase()];
      if (focusedInput.required) subtitleBits.push('Required');
      subtitleBits.push(uploaded > 0 ? `${uploaded} added` : 'No file yet');
      return {
        title: focusedInput.name,
        subtitle: subtitleBits.join(' · '),
        onDismiss: () => setFocusedInput(null),
      };
    }
    if (step === 3 && mapFocusedInput) {
      const list = alignments[mapFocusedInput.id] ?? [];
      const mapped = list.filter((a) => !!a.target).length;
      const total = list.length || mapFocusedInput.columns?.length || 0;
      const matchPct = list.length
        ? Math.round(list.reduce((n, a) => n + a.confidence, 0) / list.length)
        : 0;
      return {
        title: mapFocusedInput.name,
        subtitle: `${mapped}/${total} columns mapped · ${matchPct}% match`,
        onDismiss: () => setMapExpandedId(null),
      };
    }
    if (step === 4 && reviewFocusedStep && workflow) {
      const idx = workflow.steps.findIndex((s) => s.id === reviewFocusedStep.id);
      return {
        title: reviewFocusedStep.name,
        subtitle: `Step ${idx + 1} · ${reviewFocusedStep.type}`,
        onDismiss: () => setReviewExpandedSource(null),
      };
    }
    return undefined;
  }, [step, focusedInput, mapFocusedInput, reviewFocusedStep, workflow, files, alignments]);

  const chatPlaceholder = useMemo(() => {
    if (step === 2 && focusedInput) return `Ask about ${focusedInput.name}…`;
    if (step === 3 && mapFocusedInput) return `Ask about Data Mapping…`;
    if (step === 4 && reviewFocusedStep) return `Ask about ${reviewFocusedStep.name}…`;
    return undefined;
  }, [step, focusedInput, mapFocusedInput, reviewFocusedStep]);

  // Wrap every quick reply so the user's selection is recorded in chat history
  // before the underlying action fires.
  const quickRepliesForStep: QuickReply[] | undefined = useMemo(() => {
    if (!rawQuickReplies) return undefined;
    return rawQuickReplies.map((r) => ({
      ...r,
      onClick: () => {
        pushUser(r.label);
        r.onClick();
      },
    }));
  }, [rawQuickReplies, pushUser]);

  const toleranceCardProps = useMemo(
    () => ({
      state: tolerance,
      onChange: (next: ToleranceCardState) => setTolerance(next),
      onRun: (next: ToleranceCardState) => {
        setTolerance(next);
        executeRun(next);
      },
      onReset: () => setTolerance(DEFAULT_TOLERANCE),
      running,
      locked: running || !!result,
    }),
    // DEFAULT_TOLERANCE is stable-shape; excluding it avoids unstable-identity churn.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tolerance, running, result, executeRun],
  );

  const handleUserSend = useCallback(
    (text: string) => {
      pushUser(text);
      pushAssistantAfterDelay(
        `Noted — “${text.slice(0, 80)}${text.length > 80 ? '…' : ''}”. I've kept that in mind for the current step.`,
        600,
      );
    },
    [pushUser, pushAssistantAfterDelay],
  );

  return (
    <div className="flex flex-col h-full bg-canvas">
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
          <div className="px-6 pt-4">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-ink-500 hover:text-brand-600 transition-colors cursor-pointer"
            >
              <ArrowLeft size={14} />
              Back to AI Concierge
            </button>
          </div>
          <StepWritePrompt
            prompt={prompt}
            setPrompt={setPrompt}
            onGenerate={handleGenerate}
            onPickTemplate={handlePickTemplate}
            onOpenGuideMe={() => setGuideMeOpen(true)}
          />
        </motion.div>
      ) : step === 4 && workflow && (running || result) ? (
        /* Step 4 output view — chat collapsible, output config on right */
        <div className="flex-1 min-h-0 flex">
          {chatCollapsed ? (
            <button
              type="button"
              onClick={() => setChatCollapsed(false)}
              aria-label="Expand chat"
              className="shrink-0 w-12 border-r border-canvas-border bg-canvas-elevated flex flex-col items-center pt-3 gap-2 hover:bg-canvas cursor-pointer transition-colors"
            >
              <span className="w-9 h-9 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
                <MessageSquare size={16} />
              </span>
            </button>
          ) : (
            <div className="shrink-0 w-[360px] relative flex">
              <AIAssistantPanel
                step={step}
                stepTitle={STEP_META[step].title}
                workflowName={workflow.name}
                messages={messages}
                quickReplies={quickRepliesForStep}
                contextChip={contextChip}
                primaryAction={primaryAction}
                placeholder={chatPlaceholder}
                onSend={handleUserSend}
                onOpenGuideMe={() => setGuideMeOpen(true)}
                input={chatInput}
                setInput={setChatInput}
                completed={completed}
                onJump={(s) => {
                  if (s <= step || completed.has(s)) setStep(s);
                }}
                onBack={onBack}
                isTyping={isTyping}
                toleranceCard={toleranceCardProps}
              />
              <button
                type="button"
                onClick={() => setChatCollapsed(true)}
                aria-label="Collapse chat"
                className="absolute top-2.5 right-2 w-7 h-7 rounded-md hover:bg-canvas text-ink-500 hover:text-brand-600 flex items-center justify-center cursor-pointer transition-colors"
              >
                <ArrowLeft size={13} />
              </button>
            </div>
          )}
          <StepOutputView workflow={workflow} result={result} running={running} />
        </div>
      ) : (
        /* Steps 2–4 (pre-run) — clarification full-width; once answered,
           chat slides in from the left and canvas from the right */
        <div className="flex-1 min-h-0 relative overflow-hidden">
          <AnimatePresence initial={false}>
            {!clarifying && (
              <motion.div
                key="journey"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 flex"
              >
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: 0 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="w-[40%] shrink-0 h-full"
                >
                  <AIAssistantPanel
                    step={step}
                    stepTitle={STEP_META[step].title}
                    workflowName={workflow?.name}
                    messages={messages}
                    quickReplies={quickRepliesForStep}
                    contextChip={contextChip}
                    primaryAction={primaryAction}
                    placeholder={chatPlaceholder}
                    onSend={handleUserSend}
                    onOpenGuideMe={() => setGuideMeOpen(true)}
                    input={chatInput}
                    setInput={setChatInput}
                    completed={completed}
                    onJump={(s) => {
                      if (s <= step || completed.has(s)) setStep(s);
                    }}
                    onBack={onBack}
                    isTyping={isTyping}
                    toleranceCard={toleranceCardProps}
                  />
                </motion.div>

                <motion.main
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="w-[60%] shrink-0 h-full overflow-hidden"
                >
                  <div className="h-full min-h-0 overflow-y-auto bg-canvas flex flex-col">
                  <div className="flex-1 min-h-0 overflow-y-auto p-5">
                    <div className="max-w-[780px] mx-auto">
                      {step === 2 && workflow && (
                        <StepUploadFiles
                          workflow={workflow}
                          files={files}
                          setFiles={setFiles}
                          onLinkSource={(sourceName, inputName) => {
                            pushEvent(
                              `Linked **${sourceName}** → **${inputName}**`,
                              'link',
                            );
                          }}
                          onFocusInput={(input) => {
                            setFocusedInput((prev) =>
                              prev?.id === input.id ? null : input,
                            );
                          }}
                          focusedInputId={focusedInput?.id ?? null}
                        />
                      )}
                      {step === 3 && workflow && (
                        <StepMapData
                          workflow={workflow}
                          files={files}
                          setFiles={setFiles}
                          alignments={alignments}
                          expandedInputId={mapExpandedId}
                          onToggleExpand={(id) =>
                            setMapExpandedId((prev) => (prev === id ? null : id))
                          }
                        />
                      )}
                      {step === 4 && workflow && (
                        <StepReviewRun
                          workflow={workflow}
                          setWorkflow={setWorkflow}
                          files={files}
                          mappings={mappings}
                          setMappings={setMappings}
                          running={running}
                          result={result}
                          expandedSource={reviewExpandedSource}
                          setExpandedSource={setReviewExpandedSource}
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
                  </div>
                </div>
                </motion.main>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Clarification — full-width view while clarifying */}
          <AnimatePresence>
            {clarifying && step === 2 && workflow && (
              <motion.div
                key="clarify"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: 12 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 z-10 bg-canvas"
              >
                <ClarificationPanel
                  questions={clarifyQuestions}
                  index={clarifyIndex}
                  answers={clarifyAnswers}
                  onAnswer={handleClarifyAnswer}
                  onSkip={handleClarifySkip}
                  onBack={onBack}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Right-side PlanPanel disabled — kept for future use
          <PlanPanel
            workflow={workflow}
            step={step}
            open={rightOpen}
            onToggleOpen={() => setRightOpen((v) => !v)}
          />
          */}
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
