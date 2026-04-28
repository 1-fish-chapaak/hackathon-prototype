// ─── RACM Derived State Engine ─────────────────────────────────────────────
// Single source of truth for all RACM status, readiness, and action.
// UI MUST NEVER store or hardcode these — always compute via this engine.

// ─── Types ─────────────────────────────────────────────────────────────────

export type RacmStatus = 'Draft' | 'Working' | 'Active' | 'Locked';

export type RacmReadiness =
  | 'Needs Setup'
  | 'Needs Mapping'
  | 'Needs Key Controls'
  | 'Needs Workflow Setup'
  | 'Needs Attributes'
  | 'Ready to Validate'
  | 'Ready';

export type RacmAction =
  | 'Setup'
  | 'Map'
  | 'Continue Setup'
  | 'Configure'
  | 'Validate'
  | 'View';

export interface RacmChecks {
  hasRisks: boolean;
  allRisksMapped: boolean;
  hasKeyControls: boolean;
  allControlsHaveWorkflows: boolean;
  allWorkflowsHaveAttributes: boolean;
  isValidated: boolean;
  isLocked: boolean;
}

export interface ComputedRacmState {
  status: RacmStatus;
  readiness: RacmReadiness;
  action: RacmAction;
  checks: RacmChecks;
}

// ─── Summary-level computation (RACM list table) ──────────────────────────

export interface RacmSummaryInput {
  risks: number;
  controls: number;
  mappedRisks: number;
  unmappedRisks: number;
  keyControls: number;
  workflowCoverage: number;       // % of controls with workflows (0–100)
  attributesCoverage: number;     // % of workflows with attributes (0–100)
  isValidated: boolean;
  linkedToEngagement: boolean;
}

export function computeRacmState(input: RacmSummaryInput): ComputedRacmState {
  const checks: RacmChecks = {
    hasRisks: input.risks > 0,
    allRisksMapped: input.risks > 0 && input.unmappedRisks === 0,
    hasKeyControls: input.keyControls > 0,
    allControlsHaveWorkflows: input.controls > 0 && input.workflowCoverage >= 100,
    allWorkflowsHaveAttributes: input.controls > 0 && input.attributesCoverage >= 100,
    isValidated: input.isValidated,
    isLocked: input.linkedToEngagement,
  };

  return {
    status: deriveStatus(checks),
    readiness: deriveReadiness(checks),
    action: deriveAction(checks),
    checks,
  };
}

// ─── Detail-level computation (mapping workspace) ─────────────────────────

export interface RiskDetailInput {
  id: string;
  controls: {
    id: string;
    isKey: boolean;
    workflowLinked: boolean;
    workflows?: {
      attributes: { id: string }[];
    }[];
  }[];
}

export function computeRacmStateFromRisks(
  risks: RiskDetailInput[],
  isValidated: boolean,
  isLocked: boolean,
): ComputedRacmState {
  const allControls = risks.flatMap(r => r.controls);
  const allWorkflows = allControls.flatMap(c => c.workflows || []);

  const checks: RacmChecks = {
    hasRisks: risks.length > 0,
    allRisksMapped: risks.length > 0 && risks.every(r => r.controls.length > 0),
    hasKeyControls: allControls.some(c => c.isKey),
    allControlsHaveWorkflows: allControls.length > 0 && allControls.every(c => c.workflowLinked && (c.workflows || []).length > 0),
    allWorkflowsHaveAttributes: allWorkflows.length > 0 && allWorkflows.every(w => w.attributes.length > 0),
    isValidated,
    isLocked,
  };

  return {
    status: deriveStatus(checks),
    readiness: deriveReadiness(checks),
    action: deriveAction(checks),
    checks,
  };
}

// ─── Core derivation logic (shared) ───────────────────────────────────────

function deriveStatus(checks: RacmChecks): RacmStatus {
  if (checks.isLocked) return 'Locked';
  if (checks.isValidated) return 'Active';
  if (checks.hasRisks) return 'Working';
  return 'Draft';
}

function deriveReadiness(checks: RacmChecks): RacmReadiness {
  // Priority-based — first fail wins
  if (!checks.hasRisks) return 'Needs Setup';
  if (!checks.allRisksMapped) return 'Needs Mapping';
  if (!checks.hasKeyControls) return 'Needs Key Controls';
  if (!checks.allControlsHaveWorkflows) return 'Needs Workflow Setup';
  if (!checks.allWorkflowsHaveAttributes) return 'Needs Attributes';
  if (!checks.isValidated) return 'Ready to Validate';
  return 'Ready';
}

function deriveAction(checks: RacmChecks): RacmAction {
  if (checks.isLocked) return 'View';
  const readiness = deriveReadiness(checks);
  const actionMap: Record<RacmReadiness, RacmAction> = {
    'Needs Setup': 'Setup',
    'Needs Mapping': 'Map',
    'Needs Key Controls': 'Continue Setup',
    'Needs Workflow Setup': 'Configure',
    'Needs Attributes': 'Configure',
    'Ready to Validate': 'Validate',
    'Ready': 'View',
  };
  return actionMap[readiness];
}

// ─── Style maps (single source for UI rendering) ─────────────────────────

export const RACM_STATUS_STYLES: Record<RacmStatus, string> = {
  Draft: 'bg-gray-100 text-gray-600',
  Working: 'bg-blue-50 text-blue-700',
  Active: 'bg-emerald-50 text-emerald-700',
  Locked: 'bg-purple-50 text-purple-700',
};

export const RACM_READINESS_STYLES: Record<RacmReadiness, string> = {
  'Needs Setup': 'bg-gray-100 text-gray-600',
  'Needs Mapping': 'bg-amber-50 text-amber-700',
  'Needs Key Controls': 'bg-amber-50 text-amber-600',
  'Needs Workflow Setup': 'bg-amber-50 text-amber-600',
  'Needs Attributes': 'bg-amber-50 text-amber-600',
  'Ready to Validate': 'bg-blue-50 text-blue-600',
  'Ready': 'bg-emerald-50 text-emerald-700',
};

export const RACM_ACTION_STYLES: Record<RacmAction, string> = {
  Setup: 'bg-gray-100 text-gray-600 hover:bg-gray-200/70',
  Map: 'bg-primary/10 text-primary hover:bg-primary/20',
  'Continue Setup': 'bg-amber-50 text-amber-700 hover:bg-amber-100/70',
  Configure: 'bg-blue-50 text-blue-700 hover:bg-blue-100/70',
  Validate: 'bg-primary text-white hover:bg-primary/90',
  View: 'bg-gray-100 text-gray-600 hover:bg-gray-200/70',
};
