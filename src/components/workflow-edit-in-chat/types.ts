export interface EditClarificationStep {
  id: string;
  question: string;
  options: string[];
  shortLabel: string;
  // Tab in the right workspace this answer most affects.
  highlightTab: 'input' | 'plan' | 'output' | 'preview';
}

export interface EditChatMessage {
  id: string;
  role: 'user' | 'ira';
  text?: string;
  // Optional rich blocks
  linkedSources?: { source: string; target: string }[];
  mappings?: { name: string; from: string; cols: string[]; ofTotal: number }[];
  showConfirmProceed?: boolean;
  showViewWorkspace?: boolean;
}

export type EditWorkspaceTab = 'input' | 'plan' | 'output' | 'preview';
