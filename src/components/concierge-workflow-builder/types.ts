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
