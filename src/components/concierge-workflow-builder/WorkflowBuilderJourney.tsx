import { useCallback, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Workflow } from 'lucide-react';
import Stepper, { type JourneyStep } from './Stepper';
import StepWritePrompt from './StepWritePrompt';
import StepUploadFiles from './StepUploadFiles';
import StepMapData from './StepMapData';
import StepReviewRun from './StepReviewRun';
import { SAMPLE_WORKFLOWS } from './sampleWorkflows';
import { generateWorkflow, runWorkflow } from './mockApi';
import type { JourneyFiles, JourneyMappings, RunResult, WorkflowDraft } from './types';

interface Props {
  onBack: () => void;
}

export default function WorkflowBuilderJourney({ onBack }: Props) {
  const [step, setStep] = useState<JourneyStep>(1);
  const [prompt, setPrompt] = useState('');
  const [workflow, setWorkflow] = useState<WorkflowDraft | null>(null);
  const [files, setFiles] = useState<JourneyFiles>({});
  const [mappings, setMappings] = useState<JourneyMappings>({});
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);

  const completed = useMemo(() => {
    const done = new Set<JourneyStep>();
    if (workflow) done.add(1);
    if (workflow && workflow.inputs.filter((i) => i.required).every((i) => (files[i.id] ?? []).length > 0)) {
      done.add(2);
    }
    if (Object.keys(mappings).length > 0) done.add(3);
    if (result) done.add(4);
    return done;
  }, [workflow, files, mappings, result]);

  const handleGenerate = useCallback(() => {
    const draft = generateWorkflow(prompt);
    setWorkflow(draft);
    setFiles({});
    setMappings({});
    setResult(null);
    setStep(2);
  }, [prompt]);

  const handlePickTemplate = useCallback((id: string) => {
    const template = SAMPLE_WORKFLOWS.find((w) => w.id === id);
    if (!template) return;
    setWorkflow({ ...template, id: `draft-${Date.now()}`, logicPrompt: template.logicPrompt });
    setPrompt(template.logicPrompt);
    setFiles({});
    setMappings({});
    setResult(null);
    setStep(2);
  }, []);

  const handleRun = useCallback(async () => {
    if (!workflow) return;
    setRunning(true);
    try {
      const r = await runWorkflow(workflow, files, mappings);
      setResult(r);
    } finally {
      setRunning(false);
    }
  }, [workflow, files, mappings]);

  const handleRestart = useCallback(() => {
    setWorkflow(null);
    setPrompt('');
    setFiles({});
    setMappings({});
    setResult(null);
    setStep(1);
  }, []);

  return (
    <div
      className="h-full overflow-y-auto relative"
      style={{ background: 'linear-gradient(180deg, #f8f5ff 0%, #fafafa 280px)' }}
    >
      {/* Header */}
      <div className="px-6 pt-8 pb-4">
        <motion.button
          type="button"
          onClick={onBack}
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-ink-500 hover:text-brand-600 transition-colors cursor-pointer mb-3"
        >
          <ArrowLeft size={14} />
          Back to AI Concierge
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-3 mb-4"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Workflow size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-[22px] font-extrabold tracking-tight text-ink-800">
              Workflow Builder
            </h1>
            <p className="text-[12.5px] text-ink-500 leading-relaxed">
              Four steps: write a prompt, upload data, map columns, run. Mocked end-to-end.
            </p>
          </div>
        </motion.div>

        <div className="rounded-2xl border border-canvas-border bg-canvas-elevated p-3">
          <Stepper
            current={step}
            completed={completed}
            onJump={(s) => {
              // Allow jumping back to completed or earlier steps only
              if (s <= step || completed.has(s)) setStep(s);
            }}
          />
        </div>
      </div>

      {/* Step body */}
      <div className="px-6 pb-12">
        {step === 1 && (
          <StepWritePrompt
            prompt={prompt}
            setPrompt={setPrompt}
            onNext={handleGenerate}
            onPickTemplate={handlePickTemplate}
          />
        )}

        {step === 2 && workflow && (
          <StepUploadFiles
            workflow={workflow}
            files={files}
            setFiles={setFiles}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}

        {step === 3 && workflow && (
          <StepMapData
            workflow={workflow}
            mappings={mappings}
            setMappings={setMappings}
            onNext={() => setStep(4)}
            onBack={() => setStep(2)}
          />
        )}

        {step === 4 && workflow && (
          <StepReviewRun
            workflow={workflow}
            files={files}
            mappings={mappings}
            running={running}
            result={result}
            onRun={handleRun}
            onBack={() => setStep(3)}
            onRestart={handleRestart}
          />
        )}
      </div>
    </div>
  );
}
