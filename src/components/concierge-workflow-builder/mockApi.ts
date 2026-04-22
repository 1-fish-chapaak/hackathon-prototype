import type { RunResult, WorkflowDraft, JourneyFiles, JourneyMappings } from './types';
import { SAMPLE_WORKFLOWS } from './sampleWorkflows';

// Pick the sample that best matches the prompt, then override logicPrompt with
// the user's actual text so the downstream UI shows their intent.
export function generateWorkflow(prompt: string): WorkflowDraft {
  const p = prompt.toLowerCase();
  const scored = SAMPLE_WORKFLOWS.map((w) => {
    const haystack = [w.name, w.description, w.category, ...w.tags].join(' ').toLowerCase();
    const score = haystack.split(/\s+/).reduce((s, word) => (word && p.includes(word) ? s + 1 : s), 0);
    return { w, score };
  }).sort((a, b) => b.score - a.score);

  const base = scored[0].score > 0 ? scored[0].w : SAMPLE_WORKFLOWS[0];
  return {
    ...base,
    id: `draft-${Date.now()}`,
    logicPrompt: prompt.trim() || base.logicPrompt,
  };
}

export async function runWorkflow(
  workflow: WorkflowDraft,
  files: JourneyFiles,
  mappings: JourneyMappings,
): Promise<RunResult> {
  await new Promise((r) => setTimeout(r, 1200));

  const fileCount = Object.values(files).reduce((n, arr) => n + arr.length, 0);
  const mappingCount = Object.values(mappings).reduce(
    (n, step) => n + Object.values(step).reduce((m, list) => m + list.length, 0),
    0,
  );

  if (workflow.output.type === 'flags') {
    return {
      outputType: 'flags',
      title: workflow.output.title,
      description: workflow.output.description,
      stats: [
        { label: 'Records Scanned', value: `${12_000 + fileCount * 125}`, tone: 'primary' },
        { label: 'Flags', value: '8', tone: 'risk' },
        { label: 'Amount at Risk', value: '₹6.16L', tone: 'warning' },
        { label: 'Confidence', value: mappingCount > 0 ? '94%' : '72%', tone: 'ok' },
      ],
      columns: ['Invoice', 'Vendor', 'Amount', 'Issue', 'Severity'],
      rows: [
        { cells: ['INV-4521', 'Acme Corp', '₹45,200', 'Duplicate of INV-3102', 'Critical'], status: 'flagged' },
        { cells: ['INV-4533', 'Global Supplies', '₹1,28,750', 'No matching PO', 'High'], status: 'flagged' },
        { cells: ['INV-4558', 'TechVendor', '₹67,400', 'Out-of-scope line', 'Medium'], status: 'warning' },
        { cells: ['INV-4589', 'Pinnacle', '₹89,600', 'Off-policy GL code', 'Medium'], status: 'warning' },
        { cells: ['INV-4612', 'Atlas Mfg', '₹23,100', 'Clean', 'Low'], status: 'ok' },
      ],
    };
  }

  if (workflow.output.type === 'table') {
    return {
      outputType: 'table',
      title: workflow.output.title,
      description: workflow.output.description,
      stats: [
        { label: 'Accounts Reconciled', value: '1,089 / 1,247', tone: 'ok' },
        { label: 'Variance Detected', value: '98', tone: 'warning' },
        { label: 'Unmatched', value: '60', tone: 'risk' },
        { label: 'Total Variance', value: '₹2.47L', tone: 'primary' },
      ],
      columns: ['Account', 'TB Balance', 'GL Total', 'Variance', 'Status'],
      rows: [
        { cells: ['1001-Cash', '₹12,45,200', '₹12,45,200', '₹0', 'Matched'], status: 'ok' },
        { cells: ['1200-AR', '₹8,32,750', '₹8,35,200', '₹2,450', 'Variance'], status: 'warning' },
        { cells: ['2100-AP', '₹6,67,400', '₹6,67,400', '₹0', 'Matched'], status: 'ok' },
        { cells: ['5100-Opex', '₹4,23,100', '₹3,89,600', '₹33,500', 'Variance'], status: 'warning' },
        { cells: ['1500-Inventory', '₹9,89,600', '—', '—', 'Unmatched'], status: 'flagged' },
      ],
    };
  }

  return {
    outputType: 'summary',
    title: workflow.output.title,
    description: workflow.output.description,
    stats: [
      { label: 'Steps Completed', value: `${workflow.steps.length}`, tone: 'primary' },
      { label: 'Records Processed', value: '8,412', tone: 'ok' },
      { label: 'Findings', value: '14', tone: 'warning' },
    ],
    columns: ['Finding', 'Category', 'Evidence'],
    rows: [
      { cells: ['Vendor master drift detected', 'Governance', '3 entries'], status: 'warning' },
      { cells: ['Invoice posting outside office hours', 'Controls', '12 entries'], status: 'warning' },
      { cells: ['GL variance within tolerance', 'Recon', '0 entries'], status: 'ok' },
    ],
  };
}
