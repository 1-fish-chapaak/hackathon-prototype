export type ColumnRole = 'join_key' | 'compare' | 'filter' | 'output';
export type StepType =
  | 'extract'
  | 'analyze'
  | 'compare'
  | 'flag'
  | 'summarize'
  | 'calculate'
  | 'validate';
export type OutputType = 'flags' | 'table' | 'summary';
export type InputType = 'csv' | 'pdf' | 'sql' | 'image';

export interface InputSpec {
  id: string;
  name: string;
  type: InputType;
  description: string;
  required: boolean;
  multiple?: boolean;
  columns?: string[];
}

export interface StepSpec {
  id: string;
  name: string;
  description: string;
  type: StepType;
  dataFiles: string[];
}

export interface OutputSpec {
  type: OutputType;
  title: string;
  description: string;
}

export interface WorkflowDraft {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  logicPrompt: string;
  inputs: InputSpec[];
  steps: StepSpec[];
  output: OutputSpec;
}

export type UploadedFile = { name: string; size: number };
export type JourneyFiles = Record<string, UploadedFile[]>;

// mappings keyed as: stepId -> inputId -> [{ column, role }]
export type StepMapping = Record<string, { column: string; role: ColumnRole }[]>;
export type JourneyMappings = Record<string, StepMapping>;

export interface RunResult {
  outputType: OutputType;
  title: string;
  description: string;
  stats: { label: string; value: string; tone: 'primary' | 'risk' | 'warning' | 'ok' }[];
  columns: string[];
  rows: { cells: string[]; status: 'flagged' | 'warning' | 'ok' }[];
}

// ── Column alignment (Step 3: Map Data) ────────────────────────────────

export type ColumnDType = 'STRING' | 'DECIMAL' | 'INT' | 'TIMESTAMP' | 'BOOL';

export interface ColumnTypePair {
  name: string;
  dtype: ColumnDType;
}

export interface ColumnAlignment {
  id: string;
  source: ColumnTypePair;
  target: ColumnTypePair | null;
  confidence: number; // 0-100
  breakdown: {
    nameSimilarity: number;
    typeCompatibility: number;
    statisticalProfile: number;
    semanticSimilarity: number;
  };
  explanation: string;
  reason: 'unmapped' | 'low_confidence' | 'type_mismatch' | null;
}

export type JourneyAlignments = Record<string, ColumnAlignment[]>;

// ── Right-panel Input Config state (tolerance rules + notes) ───────────

export type ToleranceRuleId = 'amount' | 'date' | 'text';

export interface ToleranceRule {
  id: ToleranceRuleId;
  label: string;
  description: string;
  severity: 'Strict' | 'Moderate' | 'Relaxed';
  enabled: boolean;
}

export interface InputNote {
  id: string;
  name: string;
  description: string;
  aiSuggested: boolean;
  enabled: boolean;
}
