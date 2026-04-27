import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, Search, Shield, AlertTriangle, CheckCircle2,
  Plus, X, Star, Link2, Trash2, Workflow, ChevronRight, ChevronDown,
  Clock, User, FileText, Eye, Paperclip, FileCheck, XCircle,
} from 'lucide-react';
import { useToast } from '../shared/Toast';

// ─── Types ──────────────────────────────────────────────────────────────────

interface RiskControlMapping {
  id: string;
  riskId: string;
  controlId: string;
  isKeyControl: boolean;
  createdBy: string;
  createdAt: string;
}

interface ControlAttribute {
  id: string;
  name: string;
  description: string;
  evidenceType: string;
  expectedResult: string;
  passLogic: string;
}

interface ControlWorkflow {
  id: string;
  name: string;
  version: string;
  status: 'Draft' | 'Ready' | 'Active';
  lastRun: string;
  dataRequired: boolean;
  attributes: ControlAttribute[];
}

interface MappedControl {
  id: string;
  name: string;
  description: string;
  isKey: boolean;
  automation: 'Manual' | 'Automated' | 'IT-dependent';
  nature: 'Preventive' | 'Detective' | 'Corrective';
  workflowLinked: boolean;
  workflowName: string;
  attributeCount: number;
  lastExecution: string;
  status: 'Effective' | 'Ineffective' | 'Not Tested' | 'Pending';
  owner?: string;
  labels?: string[];
  workflows?: ControlWorkflow[];
}

type ControlReadiness = 'Setup Incomplete' | 'Needs Attributes' | 'Ready';

function getControlReadiness(ctrl: MappedControl): ControlReadiness {
  if (!ctrl.workflowLinked || !ctrl.workflows || ctrl.workflows.length === 0) return 'Setup Incomplete';
  if (ctrl.workflows.every(w => w.attributes.length === 0)) return 'Needs Attributes';
  return 'Ready';
}

const READINESS_CLS: Record<ControlReadiness, string> = {
  'Setup Incomplete': 'bg-risk-50 text-risk-700',
  'Needs Attributes': 'bg-mitigated-50 text-mitigated-700',
  'Ready': 'bg-compliant-50 text-compliant-700',
};
const WF_STATUS_CLS: Record<string, string> = {
  Draft: 'bg-draft-50 text-draft-700',
  Ready: 'bg-evidence-50 text-evidence-700',
  Active: 'bg-compliant-50 text-compliant-700',
};

interface RiskItem {
  id: string;
  name: string;
  description: string;
  process: string;
  sourceRef: string;
  controls: MappedControl[];
  validationStatus: 'Unvalidated' | 'Stable' | 'At Risk';
  freshness: 'Up to Date' | 'Needs Re-execution';
}

type RiskFilter = 'all' | 'unmapped' | 'partial' | 'mapped' | 'at-risk' | 'unvalidated';

interface Props {
  onBack: () => void;
  onGoToExecution?: () => void;
}

// ─── Seed Data ──────────────────────────────────────────────────────────────

const CONTROL_LIBRARY: MappedControl[] = [
  { id: 'ctl-001', name: 'Three-Way PO/GRN/Invoice Matching', description: 'System-enforced three-way matching before payment release', isKey: true, automation: 'Automated', nature: 'Preventive', workflowLinked: true, workflowName: 'PO Validation Workflow v2.0', attributeCount: 5, lastExecution: 'Apr 12, 2026', status: 'Effective', owner: 'Rajiv Sharma', labels: ['SOX', 'P2P'],
    workflows: [
      { id: 'wf-pv', name: 'PO Validation Workflow', version: 'v2.0', status: 'Active', lastRun: 'Apr 12, 2026', dataRequired: true, attributes: [
        { id: 'a1', name: 'PO Existence', description: 'Verify approved PO exists for invoice', evidenceType: 'PO document', expectedResult: 'Approved PO present', passLogic: 'PO status = Approved AND amount matches' },
        { id: 'a2', name: 'Payment Approval', description: 'Confirm authorization per delegation matrix', evidenceType: 'Approval log', expectedResult: 'Dual approval documented', passLogic: 'Two approvals before release' },
      ]},
      { id: 'wf-grn', name: 'GRN Matching Workflow', version: 'v1.6', status: 'Active', lastRun: 'Apr 12, 2026', dataRequired: true, attributes: [
        { id: 'a3', name: 'GRN Match', description: 'Confirm GRN quantity matches PO', evidenceType: 'GRN document', expectedResult: 'Quantity within 5% tolerance', passLogic: 'GRN qty / PO qty variance ≤ 5%' },
      ]},
      { id: 'wf-inv', name: 'Invoice Match Workflow', version: 'v2.3', status: 'Active', lastRun: 'Apr 12, 2026', dataRequired: true, attributes: [
        { id: 'a4', name: 'Invoice Amount Match', description: 'Validate invoice matches PO and GRN', evidenceType: 'Invoice document', expectedResult: 'Amount within tolerance', passLogic: 'Invoice total within $500 or 2% of PO' },
        { id: 'a5', name: 'Tolerance Verification', description: 'Verify variance documented', evidenceType: 'Exception report', expectedResult: 'Variance approved', passLogic: 'Exception form signed if variance > threshold' },
      ]},
    ],
  },
  { id: 'ctl-002', name: 'Vendor Master Change Approval', description: 'Multi-level approval for vendor master data changes', isKey: true, automation: 'Manual', nature: 'Preventive', workflowLinked: true, workflowName: 'Vendor Change Monitor v1.1', attributeCount: 3, lastExecution: 'Apr 10, 2026', status: 'Effective', owner: 'Deepak Bansal', labels: ['SOX', 'P2P'],
    workflows: [{ id: 'wf-vcm', name: 'Vendor Change Monitor', version: 'v1.1', status: 'Active', lastRun: 'Apr 10, 2026', dataRequired: true, attributes: [
      { id: 'a6', name: 'Registration Complete', description: 'All required fields populated', evidenceType: 'Registration form', expectedResult: 'No blank mandatory fields', passLogic: 'All required fields have values' },
      { id: 'a7', name: 'Tax ID Verified', description: 'Tax ID validated against government DB', evidenceType: 'System log', expectedResult: 'ID validated', passLogic: 'Tax ID check returns valid' },
      { id: 'a8', name: 'Change Notification', description: 'Finance head notified of change', evidenceType: 'Email log', expectedResult: 'Notification sent within 24h', passLogic: 'Email timestamp < change timestamp + 24h' },
    ]}],
  },
  { id: 'ctl-003', name: 'Duplicate Invoice Detection', description: 'Automated scan of invoices against historical data', isKey: true, automation: 'Automated', nature: 'Detective', workflowLinked: true, workflowName: 'Duplicate Detector v1.4', attributeCount: 4, lastExecution: 'Apr 18, 2026', status: 'Pending', owner: 'Rajiv Sharma', labels: ['SOX', 'P2P'],
    workflows: [{ id: 'wf-dd', name: 'Duplicate Detector', version: 'v1.4', status: 'Active', lastRun: 'Apr 18, 2026', dataRequired: true, attributes: [
      { id: 'a9', name: 'Scan Executed', description: 'Duplicate scan ran before processing', evidenceType: 'System log', expectedResult: 'Scan log present', passLogic: 'Scan timestamp < payment timestamp' },
      { id: 'a10', name: 'Flag Resolved', description: 'Flagged duplicates reviewed', evidenceType: 'Approval log', expectedResult: 'Resolution documented', passLogic: 'Approver sign-off on flagged items' },
    ]}],
  },
  { id: 'ctl-004', name: 'High-Value Payment Review', description: 'Flagging and additional approval for payments exceeding threshold', isKey: true, automation: 'IT-dependent', nature: 'Preventive', workflowLinked: true, workflowName: 'Payment Flagging v2.0', attributeCount: 2, lastExecution: 'Apr 14, 2026', status: 'Effective', owner: 'Karan Mehta', labels: ['SOX'],
    workflows: [{ id: 'wf-pf', name: 'Payment Flagging', version: 'v2.0', status: 'Active', lastRun: 'Apr 14, 2026', dataRequired: true, attributes: [
      { id: 'a11', name: 'Threshold Applied', description: 'Payment correctly flagged per config', evidenceType: 'System log', expectedResult: 'Flagged if above threshold', passLogic: 'Amount > threshold → flag present' },
      { id: 'a12', name: 'Senior Approval', description: 'Additional approval obtained', evidenceType: 'Approval log', expectedResult: 'Senior approval before release', passLogic: 'Approval level ≥ required level' },
    ]}],
  },
  { id: 'ctl-005', name: 'SOD Violation Detection', description: 'Real-time segregation of duties conflict detection', isKey: true, automation: 'Automated', nature: 'Detective', workflowLinked: true, workflowName: 'SOD Detector v1.1', attributeCount: 4, lastExecution: '—', status: 'Not Tested', owner: 'IT Security', labels: ['ITGC'],
    workflows: [{ id: 'wf-sod', name: 'SOD Detector', version: 'v1.1', status: 'Ready', lastRun: '—', dataRequired: true, attributes: [
      { id: 'a13', name: 'Role Matrix Current', description: 'SOD rule matrix is current', evidenceType: 'Matrix export', expectedResult: 'Current version loaded', passLogic: 'Matrix version date within 90 days' },
      { id: 'a14', name: 'Conflicts Detected', description: 'Conflicts found and reported', evidenceType: 'Violation report', expectedResult: 'Report generated', passLogic: 'All known conflicts listed' },
    ]}],
  },
  { id: 'ctl-006', name: 'Revenue Recognition Compliance Check', description: 'ASC 606 validation on revenue transactions', isKey: true, automation: 'Automated', nature: 'Detective', workflowLinked: true, workflowName: 'Revenue Checker v2.3', attributeCount: 2, lastExecution: 'Apr 10, 2026', status: 'Effective', owner: 'Neha Joshi', labels: ['SOX', 'O2C'],
    workflows: [{ id: 'wf-rc', name: 'Revenue Checker', version: 'v2.3', status: 'Active', lastRun: 'Apr 10, 2026', dataRequired: true, attributes: [
      { id: 'a15', name: 'ASC 606 Mapped', description: 'All 5 steps evaluated', evidenceType: 'Compliance doc', expectedResult: 'Full evaluation documented', passLogic: 'All 5 ASC 606 steps have entries' },
      { id: 'a16', name: 'Timing Validated', description: 'Recognition matches obligation', evidenceType: 'Invoice', expectedResult: 'Date aligned', passLogic: 'Recognition date ≤ obligation completion' },
    ]}],
  },
  { id: 'ctl-007', name: 'Journal Entry Anomaly Review', description: 'AI-powered anomaly detection on journal entries', isKey: true, automation: 'Automated', nature: 'Detective', workflowLinked: true, workflowName: 'JE Analyzer v3.0', attributeCount: 2, lastExecution: 'Apr 16, 2026', status: 'Effective', owner: 'Rohan Patel', labels: ['SOX', 'R2R'],
    workflows: [{ id: 'wf-je', name: 'JE Analyzer', version: 'v3.0', status: 'Active', lastRun: 'Apr 16, 2026', dataRequired: true, attributes: [
      { id: 'a17', name: 'Model Executed', description: 'AI anomaly model ran on batch', evidenceType: 'System log', expectedResult: 'Execution log with scores', passLogic: 'Model output exists with timestamp' },
      { id: 'a18', name: 'Flagged Reviewed', description: 'High-score entries reviewed', evidenceType: 'Approval log', expectedResult: 'Review documented', passLogic: 'All scores > threshold have review notes' },
    ]}],
  },
  { id: 'ctl-008', name: 'Period-End Close Reconciliation', description: 'Monthly reconciliation of GL accounts', isKey: false, automation: 'Manual', nature: 'Detective', workflowLinked: false, workflowName: '', attributeCount: 0, lastExecution: '—', status: 'Not Tested', owner: 'Karan Mehta', labels: ['R2R'], workflows: [] },
  { id: 'ctl-009', name: 'Purchase Order Dual Sign-Off', description: 'Dual authorization for POs above threshold', isKey: false, automation: 'Manual', nature: 'Preventive', workflowLinked: false, workflowName: '', attributeCount: 0, lastExecution: '—', status: 'Not Tested', owner: 'Meera Patel', labels: ['P2P'], workflows: [] },
  { id: 'ctl-010', name: 'Credit Limit Override Approval', description: 'Review process for credit limit changes', isKey: false, automation: 'Manual', nature: 'Preventive', workflowLinked: false, workflowName: '', attributeCount: 0, lastExecution: '—', status: 'Not Tested', owner: 'Sneha Desai', labels: ['O2C'], workflows: [] },
];

const INITIAL_RISKS: RiskItem[] = [
  { id: 'rsk-001', name: 'Unauthorized vendor payments', description: 'Payments processed without proper PO or approval', process: 'P2P', sourceRef: 'Row 2', controls: [CONTROL_LIBRARY[0], CONTROL_LIBRARY[3]], validationStatus: 'Stable', freshness: 'Up to Date' },
  { id: 'rsk-002', name: 'Duplicate invoices processed', description: 'Same invoice paid twice due to weak detection', process: 'P2P', sourceRef: 'Row 3', controls: [CONTROL_LIBRARY[2]], validationStatus: 'At Risk', freshness: 'Needs Re-execution' },
  { id: 'rsk-003', name: 'Fictitious vendor registration', description: 'Vendor created without verification', process: 'P2P', sourceRef: 'Row 4', controls: [CONTROL_LIBRARY[1]], validationStatus: 'Stable', freshness: 'Up to Date' },
  { id: 'rsk-004', name: 'Unauthorized PO creation', description: 'POs above threshold without dual sign-off', process: 'P2P', sourceRef: 'Row 5', controls: [], validationStatus: 'Unvalidated', freshness: 'Needs Re-execution' },
  { id: 'rsk-005', name: 'SOD violation in AP', description: 'Same user creates and approves payment', process: 'P2P', sourceRef: 'Row 6', controls: [], validationStatus: 'Unvalidated', freshness: 'Needs Re-execution' },
  { id: 'rsk-006', name: 'Revenue recognition timing', description: 'Revenue recognized before obligation completion', process: 'O2C', sourceRef: 'Row 7', controls: [CONTROL_LIBRARY[5]], validationStatus: 'Stable', freshness: 'Up to Date' },
  { id: 'rsk-007', name: 'Incorrect journal entries', description: 'Manual JE posted without review', process: 'R2R', sourceRef: 'Row 8', controls: [CONTROL_LIBRARY[6]], validationStatus: 'Stable', freshness: 'Up to Date' },
  { id: 'rsk-008', name: 'GL balance discrepancy', description: 'Subsidiary balances do not reconcile', process: 'R2R', sourceRef: 'Row 9', controls: [], validationStatus: 'Unvalidated', freshness: 'Needs Re-execution' },
];

// ─── Styles ─────────────────────────────────────────────────────────────────

const VAL_CLS: Record<string, string> = {
  Stable: 'bg-compliant-50 text-compliant-700',
  'At Risk': 'bg-risk-50 text-risk-700',
  Unvalidated: 'bg-draft-50 text-draft-700',
};
const EXEC_CLS: Record<string, string> = {
  Effective: 'bg-compliant-50 text-compliant-700',
  Ineffective: 'bg-risk-50 text-risk-700',
  Pending: 'bg-mitigated-50 text-mitigated-700',
  'Not Tested': 'bg-draft-50 text-draft-700',
};
const AUTO_CLS: Record<string, string> = {
  Automated: 'bg-evidence-50 text-evidence-700',
  Manual: 'bg-gray-100 text-gray-700',
  'IT-dependent': 'bg-purple-100 text-purple-800',
};
const NATURE_CLS: Record<string, string> = {
  Preventive: 'bg-compliant-50 text-compliant-700',
  Detective: 'bg-evidence-50 text-evidence-700',
  Corrective: 'bg-mitigated-50 text-mitigated-700',
};

const inputCls = 'w-full px-3 py-2.5 border border-border rounded-lg text-[13px] text-text bg-white outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all';
const selectCls = inputCls + ' cursor-pointer appearance-none';
const labelCls = 'text-[12px] font-semibold text-text-muted block mb-1.5';

const BP_DOTS: Record<string, string> = { P2P: '#6a12cd', O2C: '#0284c7', R2R: '#d97706', S2C: '#059669', ITGC: '#16a34a' };

// ─── Component ──────────────────────────────────────────────────────────────

export default function RacmMappingWorkspace({ onBack, onGoToExecution }: Props) {
  const { addToast } = useToast();
  const [risks, setRisks] = useState<RiskItem[]>(INITIAL_RISKS);
  const [selectedRiskId, setSelectedRiskId] = useState<string>(INITIAL_RISKS[0].id);
  const [filter, setFilter] = useState<RiskFilter>('all');
  const [search, setSearch] = useState('');
  const [showLinkDrawer, setShowLinkDrawer] = useState(false);
  const [showCreateDrawer, setShowCreateDrawer] = useState(false);
  const [expandedControlId, setExpandedControlId] = useState<string | null>(null);
  const [linkWorkflowControlId, setLinkWorkflowControlId] = useState<string | null>(null);
  const [createWorkflowControlId, setCreateWorkflowControlId] = useState<string | null>(null);
  const [showValidateModal, setShowValidateModal] = useState(false);
  const [racmValidated, setRacmValidated] = useState(false);

  const selectedRisk = risks.find(r => r.id === selectedRiskId) || risks[0];

  // Resolve the control being linked/created for a workflow
  const linkWorkflowControl = linkWorkflowControlId
    ? selectedRisk.controls.find(c => c.id === linkWorkflowControlId) || null
    : null;
  const createWorkflowControl = createWorkflowControlId
    ? risks.flatMap(r => r.controls).find(c => c.id === createWorkflowControlId) || null
    : null;

  // Mapping status helper
  function getMappingLabel(r: RiskItem): string {
    if (r.controls.length === 0) return 'Unmapped';
    if (r.controls.some(c => !c.workflowLinked)) return 'Partially Mapped';
    return 'Mapped';
  }

  // Filtered risks
  const filteredRisks = useMemo(() => {
    let list = risks;
    if (filter === 'unmapped') list = list.filter(r => r.controls.length === 0);
    else if (filter === 'partial') list = list.filter(r => r.controls.length > 0 && r.controls.some(c => !c.workflowLinked));
    else if (filter === 'mapped') list = list.filter(r => r.controls.length > 0 && r.controls.every(c => c.workflowLinked));
    else if (filter === 'at-risk') list = list.filter(r => r.validationStatus === 'At Risk');
    else if (filter === 'unvalidated') list = list.filter(r => r.validationStatus === 'Unvalidated');

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(r => r.name.toLowerCase().includes(q) || r.id.toLowerCase().includes(q) || r.process.toLowerCase().includes(q));
    }
    return list;
  }, [risks, filter, search]);

  // Summary
  const totalRisks = risks.length;
  const unmappedCount = risks.filter(r => r.controls.length === 0).length;
  const mappedCount = risks.filter(r => r.controls.length > 0).length;

  // Handlers
  const handleLinkControl = (controlId: string) => {
    const ctrl = CONTROL_LIBRARY.find(c => c.id === controlId);
    if (!ctrl || !selectedRisk) return;
    if (selectedRisk.controls.some(c => c.id === controlId)) {
      addToast({ message: 'Control already mapped to this risk', type: 'warning' });
      return;
    }
    setRisks(prev => prev.map(r => r.id === selectedRisk.id ? {
      ...r, controls: [...r.controls, ctrl],
      validationStatus: r.validationStatus === 'Unvalidated' && ctrl.status === 'Effective' ? 'Stable' : r.validationStatus,
    } : r));
    setShowLinkDrawer(false);
    if (racmValidated) setRacmValidated(false);
    addToast({ message: `"${ctrl.name}" mapped to "${selectedRisk.name}"`, type: 'success' });
  };

  const handleRemoveControl = (controlId: string) => {
    setRisks(prev => prev.map(r => r.id === selectedRisk.id ? {
      ...r, controls: r.controls.filter(c => c.id !== controlId),
    } : r));
    if (racmValidated) setRacmValidated(false);
    addToast({ message: 'Control removed from risk mapping', type: 'info' });
  };

  const handleLinkWorkflowToControl = (controlId: string, wf: ControlWorkflow) => {
    setRisks(prev => prev.map(r => ({
      ...r,
      controls: r.controls.map(c => {
        if (c.id !== controlId) return c;
        const existing = c.workflows || [];
        if (existing.some(w => w.id === wf.id)) return c;
        const updated = [...existing, wf];
        return {
          ...c,
          workflows: updated,
          workflowLinked: true,
          workflowName: updated[0].name + ' ' + updated[0].version,
          attributeCount: updated.reduce((s, w) => s + w.attributes.length, 0),
        };
      }),
    })));
    setLinkWorkflowControlId(null);
    addToast({ message: `Workflow "${wf.name}" linked to control (Control Library updated)`, type: 'success' });
  };

  const handleCreateWorkflowForControl = (controlId: string, wf: ControlWorkflow) => {
    setRisks(prev => prev.map(r => ({
      ...r,
      controls: r.controls.map(c => {
        if (c.id !== controlId) return c;
        const existing = c.workflows || [];
        const updated = [...existing, wf];
        return {
          ...c,
          workflows: updated,
          workflowLinked: true,
          workflowName: updated[0].name + ' ' + updated[0].version,
          attributeCount: updated.reduce((s, w) => s + w.attributes.length, 0),
        };
      }),
    })));
    setCreateWorkflowControlId(null);
    addToast({ message: `Workflow "${wf.name}" created in Control Library and linked`, type: 'success' });
  };

  const handleToggleKey = (controlId: string) => {
    setRisks(prev => prev.map(r => r.id === selectedRisk.id ? {
      ...r, controls: r.controls.map(c => c.id === controlId ? { ...c, isKey: !c.isKey } : c),
    } : r));
  };

  const handleCreateControl = (ctrl: MappedControl) => {
    // Add to risk's controls
    setRisks(prev => prev.map(r => r.id === selectedRisk.id ? {
      ...r, controls: [...r.controls, ctrl],
    } : r));
    setShowCreateDrawer(false);
    addToast({ message: `"${ctrl.name}" created and mapped to "${selectedRisk.name}"`, type: 'success' });
  };

  // Progress breakdown
  const setupIncompleteCount = risks.filter(r => r.controls.length > 0 && r.controls.some(c => !c.workflowLinked)).length;
  const keyControlsExist = risks.some(r => r.controls.some(c => c.isKey));

  // Validation checks (mapping-focused, no workflow/evidence logic)
  const valChecks = [
    { label: 'All risks reviewed', done: true },
    { label: 'All risks mapped to at least one control', done: unmappedCount === 0 },
    { label: 'Key controls identified', done: keyControlsExist },
    { label: 'No unmapped risks remaining', done: unmappedCount === 0 },
  ];
  const allValPassed = valChecks.every(c => c.done);

  const handleValidate = () => {
    if (!allValPassed) return;
    setRacmValidated(true);
    setShowValidateModal(false);
    addToast({ message: 'RACM validated — status Active, ready for execution', type: 'success' });
  };


  const filters: { key: RiskFilter; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: risks.length },
    { key: 'unmapped', label: 'Unmapped', count: unmappedCount },
    { key: 'mapped', label: 'Mapped', count: mappedCount },
    { key: 'at-risk', label: 'At Risk', count: risks.filter(r => r.validationStatus === 'At Risk').length },
    { key: 'unvalidated', label: 'Unvalidated', count: risks.filter(r => r.validationStatus === 'Unvalidated').length },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <button onClick={onBack} className="flex items-center gap-1.5 text-[12px] text-text-muted hover:text-primary font-medium cursor-pointer transition-colors mb-2">
            <ArrowLeft size={14} />Back to RACM
          </button>
          <h3 className="text-[16px] font-bold text-text">Risk-Control Mapping</h3>
          <p className="text-[12px] text-text-muted mt-0.5">Map risks to reusable controls and verify workflow readiness before execution.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {racmValidated ? (
            <span className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-compliant-50 text-compliant-700 text-[12px] font-semibold"><CheckCircle2 size={14} />Validated</span>
          ) : (
            <button onClick={() => setShowValidateModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-[12px] font-semibold transition-colors cursor-pointer">
              <FileCheck size={13} />Validate RACM
            </button>
          )}
        </div>
      </div>

      {/* Validation warning */}
      {!racmValidated && (
        <div className="rounded-lg border border-mitigated/30 bg-mitigated-50/50 px-4 py-2.5 flex items-center gap-2.5">
          <AlertTriangle size={13} className="text-mitigated-700 shrink-0" />
          <span className="text-[11px] text-mitigated-700">RACM must be validated before execution. Complete mapping and click Validate RACM.</span>
        </div>
      )}

      {/* Guidance banner */}
      <div className="rounded-xl border border-primary/15 bg-gradient-to-r from-primary-xlight via-white to-primary-xlight p-3.5 flex items-center gap-3">
        <div className="p-1.5 rounded-lg bg-primary/10 shrink-0"><Shield size={14} className="text-primary" /></div>
        <div className="flex-1">
          <p className="text-[12px] font-semibold text-text">Map controls to risks to define how risks are mitigated.</p>
          <p className="text-[10px] text-text-muted mt-0.5">Select a risk on the left, then link or create controls on the right. Move risk-by-risk until all are covered.</p>
        </div>
        <span className="text-[12px] font-bold text-primary tabular-nums shrink-0">{mappedCount}/{totalRisks} mapped</span>
      </div>

      {/* Mapping progress */}
      <div className="glass-card rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[12px] font-semibold text-text">{mappedCount} of {totalRisks} risks mapped</span>
          <span className="text-[11px] text-text-muted tabular-nums">{Math.round((mappedCount / totalRisks) * 100)}%</span>
        </div>
        <div className="h-2 bg-surface-3 rounded-full overflow-hidden mb-3">
          <div className="h-full rounded-full bg-gradient-to-r from-primary to-primary-medium transition-all" style={{ width: `${Math.round((mappedCount / totalRisks) * 100)}%` }} />
        </div>
        <div className="flex items-center gap-4 text-[10px]">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-risk" /><span className="text-text-muted">Unmapped <strong className="text-text">{unmappedCount}</strong></span></span>
          {setupIncompleteCount > 0 && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-high" /><span className="text-text-muted">Setup Incomplete <strong className="text-text">{setupIncompleteCount}</strong></span></span>}
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-compliant" /><span className="text-text-muted">Mapped <strong className="text-text">{mappedCount}</strong></span></span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-1.5">
        {filters.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
              filter === f.key ? 'bg-primary text-white' : 'bg-surface-2 text-text-muted hover:bg-primary/10 hover:text-primary'
            }`}>{f.label} <span className="tabular-nums ml-0.5">{f.count}</span></button>
        ))}
      </div>

      {/* Split layout */}
      <div className="flex gap-4" style={{ minHeight: 500 }}>
        {/* ── Left: Risk list ── */}
        <div className="w-[320px] shrink-0 space-y-2">
          <div className="relative mb-2">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search risks..."
              className="w-full pl-8 pr-3 py-2 text-[12px] border border-border rounded-lg bg-white text-text placeholder:text-text-muted outline-none focus:border-primary/40 transition-all" />
          </div>

          <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
            {filteredRisks.map(risk => {
              const isSelected = risk.id === selectedRiskId;
              const mapping = getMappingLabel(risk);
              const dotColor = BP_DOTS[risk.process] || '#6B5D82';

              return (
                <motion.div key={risk.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  onClick={() => setSelectedRiskId(risk.id)}
                  className={`rounded-xl p-3 border cursor-pointer transition-all ${
                    isSelected ? 'border-primary/30 bg-primary-xlight/50 ring-1 ring-primary/20' : 'border-border hover:border-primary/15 bg-white'
                  }`}>
                  <div className="flex items-start justify-between mb-1.5">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="font-mono text-[10px] text-ink-400">{risk.id.toUpperCase()}</span>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: dotColor }} />
                        <span className="text-[10px] text-ink-400">{risk.process}</span>
                      </div>
                      <div className="text-[12px] font-medium text-text leading-snug">{risk.name}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] text-text-muted">{risk.controls.length} control{risk.controls.length !== 1 ? 's' : ''}</span>
                    <span className={`px-1.5 h-4 rounded text-[9px] font-bold inline-flex items-center ${VAL_CLS[risk.validationStatus]}`}>{risk.validationStatus}</span>
                    {risk.freshness === 'Needs Re-execution' && <span className="px-1.5 h-4 rounded text-[9px] font-bold bg-high-50 text-high-700 inline-flex items-center">Stale</span>}
                  </div>
                </motion.div>
              );
            })}
            {filteredRisks.length === 0 && (
              <div className="text-center py-8 text-[12px] text-text-muted">No risks match filter</div>
            )}
          </div>
        </div>

        {/* ── Right: Selected risk detail ── */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div key={selectedRisk.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.12 }}
              className="space-y-4">

              {/* Risk summary card */}
              <div className="glass-card rounded-xl p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-[11px] text-ink-500 bg-canvas px-1.5 py-0.5 rounded">{selectedRisk.id.toUpperCase()}</span>
                      <span className={`px-2 h-5 rounded-full text-[10px] font-semibold inline-flex items-center ${VAL_CLS[selectedRisk.validationStatus]}`}>{selectedRisk.validationStatus}</span>
                      <span className="inline-flex items-center gap-1 px-2 h-5 rounded-full text-[10px] font-medium" style={{ background: `${BP_DOTS[selectedRisk.process] || '#6B5D82'}15`, color: BP_DOTS[selectedRisk.process] || '#6B5D82' }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: BP_DOTS[selectedRisk.process] }} />{selectedRisk.process}
                      </span>
                      {selectedRisk.freshness === 'Needs Re-execution' && <span className="px-1.5 h-4 rounded text-[9px] font-bold bg-high-50 text-high-700 inline-flex items-center">Stale</span>}
                    </div>
                    <h3 className="text-[15px] font-bold text-text">{selectedRisk.name}</h3>
                    <p className="text-[12px] text-text-muted mt-0.5">{selectedRisk.description}</p>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-3 mt-3 pt-3 border-t border-border/40">
                  <div><span className="text-[9px] text-ink-400 uppercase">Source</span><div className="text-[11px] font-medium text-text mt-0.5">{selectedRisk.sourceRef}</div></div>
                  <div><span className="text-[9px] text-ink-400 uppercase">Freshness</span><div className={`text-[11px] font-medium mt-0.5 ${selectedRisk.freshness === 'Up to Date' ? 'text-compliant-700' : 'text-high-700'}`}>{selectedRisk.freshness}</div></div>
                  <div><span className="text-[9px] text-ink-400 uppercase">Controls</span><div className="text-[11px] font-medium text-text mt-0.5">{selectedRisk.controls.length} mapped</div></div>
                  <div><span className="text-[9px] text-ink-400 uppercase">Key Controls</span><div className="text-[11px] font-medium text-text mt-0.5">{selectedRisk.controls.filter(c => c.isKey).length}</div></div>
                </div>
              </div>

              {/* Action bar */}
              <div className="flex items-center gap-2">
                <button onClick={() => setShowLinkDrawer(true)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-[12px] font-semibold transition-colors cursor-pointer">
                  <Link2 size={13} />Link Existing Control
                </button>
                <button onClick={() => setShowCreateDrawer(true)}
                  className="flex items-center gap-1.5 px-3 py-2 border border-primary/30 bg-primary/5 rounded-lg text-[12px] font-medium text-primary hover:bg-primary/10 transition-colors cursor-pointer">
                  <Plus size={13} />Create New Control
                </button>
              </div>

              {/* Mapped controls — expandable cards */}
              {selectedRisk.controls.length === 0 ? (
                <div className="glass-card rounded-xl p-8 text-center">
                  <Shield size={32} className="mx-auto text-ink-300 mb-3" />
                  <p className="text-[14px] font-semibold text-ink-600 mb-1">No controls mapped yet</p>
                  <p className="text-[12.5px] text-ink-400 max-w-sm mx-auto mb-4">Link an existing control from the Control Library or create a new control to start protecting this risk.</p>
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={() => setShowLinkDrawer(true)} className="flex items-center gap-1.5 px-3 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-[12px] font-semibold transition-colors cursor-pointer"><Link2 size={12} />Link Control</button>
                    <button onClick={() => setShowCreateDrawer(true)} className="flex items-center gap-1.5 px-3 py-2 border border-primary/30 bg-primary/5 rounded-lg text-[12px] font-medium text-primary hover:bg-primary/10 transition-colors cursor-pointer"><Plus size={12} />Create Control</button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedRisk.controls.map(ctrl => {
                    const isExpanded = expandedControlId === ctrl.id;
                    const readiness = getControlReadiness(ctrl);
                    const wfs = ctrl.workflows || [];
                    const totalAttrs = wfs.reduce((s, w) => s + w.attributes.length, 0);

                    return (
                      <div key={ctrl.id} className="glass-card rounded-xl overflow-hidden">
                        {/* Control row — clickable header */}
                        <div className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${isExpanded ? 'bg-brand-50/20' : 'hover:bg-surface-2/30'}`}
                          onClick={() => setExpandedControlId(isExpanded ? null : ctrl.id)}>
                          <ChevronRight size={13} className={`text-ink-400 transition-transform shrink-0 ${isExpanded ? 'rotate-90' : ''}`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[12px] font-semibold text-text">{ctrl.name}</span>
                              {ctrl.isKey && <Star size={10} className="fill-mitigated text-mitigated shrink-0" />}
                              <span className={`px-1.5 h-4 rounded text-[9px] font-bold inline-flex items-center ${AUTO_CLS[ctrl.automation]}`}>{ctrl.automation}</span>
                              <span className={`px-1.5 h-4 rounded text-[9px] font-bold inline-flex items-center ${NATURE_CLS[ctrl.nature]}`}>{ctrl.nature}</span>
                            </div>
                            <div className="flex items-center gap-3 mt-0.5 text-[10px] text-ink-400">
                              <span>{wfs.length} workflow{wfs.length !== 1 ? 's' : ''}</span>
                              <span>{totalAttrs} attribute{totalAttrs !== 1 ? 's' : ''}</span>
                              {ctrl.owner && <span>{ctrl.owner}</span>}
                            </div>
                          </div>
                          <span className={`px-2 h-5 rounded-full text-[9px] font-semibold inline-flex items-center shrink-0 ${READINESS_CLS[readiness]}`}>{readiness}</span>
                          <span className={`px-1.5 h-4 rounded text-[9px] font-bold inline-flex items-center shrink-0 ${EXEC_CLS[ctrl.status]}`}>{ctrl.status}</span>
                          <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                            <button onClick={() => handleToggleKey(ctrl.id)} className="p-1 rounded-md hover:bg-mitigated-50 text-ink-400 hover:text-mitigated transition-colors cursor-pointer" title="Toggle key">
                              <Star size={11} className={ctrl.isKey ? 'fill-mitigated text-mitigated' : ''} />
                            </button>
                            <button onClick={() => handleRemoveControl(ctrl.id)} className="p-1 rounded-md hover:bg-risk-50 text-ink-400 hover:text-risk-700 transition-colors cursor-pointer" title="Remove">
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>

                        {/* Expanded detail */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.15 }}
                              className="overflow-hidden">
                              <div className="px-4 pb-4 pt-1 border-t border-border/50 space-y-4">

                                {/* Control details grid */}
                                <div className="grid grid-cols-3 gap-3 text-[11px]">
                                  <div><span className="text-ink-400 text-[10px]">Owner</span><div className="font-medium text-text mt-0.5">{ctrl.owner || '—'}</div></div>
                                  <div><span className="text-ink-400 text-[10px]">Execution Type</span><div className="font-medium text-text mt-0.5">{ctrl.automation}</div></div>
                                  <div><span className="text-ink-400 text-[10px]">Labels</span><div className="flex gap-1 mt-0.5">{(ctrl.labels || []).map(l => <span key={l} className="px-1.5 h-4 rounded text-[9px] font-medium bg-brand-50 text-brand-700 inline-flex items-center">{l}</span>)}</div></div>
                                </div>

                                {/* Workflows section */}
                                <div>
                                  <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-[11px] font-bold text-ink-500 uppercase tracking-wider">Linked Workflows ({wfs.length})</h4>
                                    <div className="flex items-center gap-2">
                                      <button onClick={() => setLinkWorkflowControlId(ctrl.id)}
                                        className="text-[10px] font-semibold text-brand-600 hover:underline cursor-pointer flex items-center gap-1"><Link2 size={9} />Link Workflow</button>
                                      <span className="text-ink-300">·</span>
                                      <button onClick={() => setCreateWorkflowControlId(ctrl.id)}
                                        className="text-[10px] font-semibold text-brand-600 hover:underline cursor-pointer flex items-center gap-1"><Plus size={9} />Create Workflow</button>
                                      {wfs.length > 0 && <>
                                        <span className="text-ink-300">·</span>
                                        <button onClick={() => addToast({ message: 'Open attribute editor for this workflow', type: 'info' })}
                                          className="text-[10px] font-semibold text-brand-600 hover:underline cursor-pointer flex items-center gap-1"><Paperclip size={9} />Manage Attributes</button>
                                      </>}
                                    </div>
                                  </div>

                                  {wfs.length === 0 ? (
                                    <div className="rounded-lg border border-risk/20 bg-risk-50/20 px-3 py-3 text-center">
                                      <Workflow size={16} className="mx-auto text-risk-700/50 mb-1" />
                                      <p className="text-[11px] font-medium text-risk-700">Setup incomplete — no workflow linked</p>
                                      <p className="text-[10px] text-risk-700/60 mb-2">Link or create a workflow to define test attributes.</p>
                                      <button onClick={() => setLinkWorkflowControlId(ctrl.id)}
                                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-white text-[10px] font-semibold hover:bg-primary-hover transition-colors cursor-pointer">
                                        <Link2 size={10} />Link Workflow
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="space-y-3">
                                      {wfs.map(wf => (
                                        <div key={wf.id} className="rounded-xl border border-border bg-white">
                                          {/* Workflow header */}
                                          <div className="flex items-center gap-3 px-3 py-2.5 border-b border-border/40">
                                            <Workflow size={13} className="text-brand-600 shrink-0" />
                                            <div className="flex-1 min-w-0">
                                              <div className="flex items-center gap-2">
                                                <span className="text-[12px] font-semibold text-text">{wf.name}</span>
                                                <span className="text-[10px] font-mono text-ink-400">{wf.version}</span>
                                                <span className={`px-1.5 h-4 rounded text-[9px] font-bold inline-flex items-center ${WF_STATUS_CLS[wf.status]}`}>{wf.status}</span>
                                              </div>
                                              <div className="flex items-center gap-3 text-[10px] text-ink-400 mt-0.5">
                                                <span>Last run: {wf.lastRun}</span>
                                                <span>Data required: {wf.dataRequired ? 'Yes' : 'No'}</span>
                                                <span>{wf.attributes.length} attribute{wf.attributes.length !== 1 ? 's' : ''}</span>
                                              </div>
                                            </div>
                                            <button onClick={() => addToast({ message: `View workflow: ${wf.name}`, type: 'info' })}
                                              className="text-[10px] font-semibold text-brand-600 hover:underline cursor-pointer flex items-center gap-1 shrink-0"><Eye size={10} />View</button>
                                          </div>

                                          {/* Attributes table */}
                                          {wf.attributes.length === 0 ? (
                                            <div className="px-3 py-3 text-center">
                                              <p className="text-[11px] text-mitigated-700 font-medium">Needs attributes — no test conditions defined</p>
                                              <button onClick={() => addToast({ message: 'Add attribute to workflow', type: 'info' })}
                                                className="mt-1 text-[10px] font-semibold text-brand-600 hover:underline cursor-pointer inline-flex items-center gap-1"><Plus size={9} />Add Attribute</button>
                                            </div>
                                          ) : (
                                            <div className="overflow-x-auto">
                                              <table className="w-full text-[10px]">
                                                <thead><tr className="bg-surface-2/30">
                                                  {['Attribute', 'Evidence Type', 'Expected Result', 'Pass/Fail Logic'].map(h =>
                                                    <th key={h} className="px-3 py-2 text-left text-[9px] font-semibold text-ink-400 uppercase">{h}</th>
                                                  )}
                                                </tr></thead>
                                                <tbody>{wf.attributes.map(attr => (
                                                  <tr key={attr.id} className="border-t border-border/30">
                                                    <td className="px-3 py-2">
                                                      <div className="text-[11px] font-medium text-text">{attr.name}</div>
                                                      <div className="text-[9.5px] text-ink-400">{attr.description}</div>
                                                    </td>
                                                    <td className="px-3 py-2">
                                                      <span className="inline-flex items-center gap-1 text-[10px] text-evidence-700"><Paperclip size={9} />{attr.evidenceType}</span>
                                                    </td>
                                                    <td className="px-3 py-2 text-[10px] text-text-secondary">{attr.expectedResult}</td>
                                                    <td className="px-3 py-2 text-[10px] text-ink-400 font-mono">{attr.passLogic}</td>
                                                  </tr>
                                                ))}</tbody>
                                              </table>
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>

                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Helper text */}
              <div className="rounded-lg border border-canvas-border bg-canvas px-3 py-2 flex items-start gap-2">
                <Shield size={11} className="text-ink-400 mt-0.5 shrink-0" />
                <span className="text-[10px] text-ink-400">Controls are reusable objects from the Control Library. Workflows and attributes define execution readiness. Mapping creates a risk → control relationship only.</span>
              </div>

              {/* ── Validated success state ── */}
              {racmValidated && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border-2 border-compliant/20 bg-gradient-to-br from-compliant-50/30 to-white p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2.5 rounded-xl bg-compliant"><CheckCircle2 size={18} className="text-white" /></div>
                    <div>
                      <h3 className="text-[15px] font-bold text-compliant-700">RACM is ready</h3>
                      <p className="text-[12px] text-compliant-700/70 mt-0.5">You can now proceed to execution. All risks are mapped and validated.</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="rounded-lg bg-white/80 border border-compliant/10 p-2.5 text-center">
                      <div className="text-lg font-bold text-text tabular-nums">{totalRisks}</div>
                      <div className="text-[10px] text-text-muted">Risks Validated</div>
                    </div>
                    <div className="rounded-lg bg-white/80 border border-compliant/10 p-2.5 text-center">
                      <div className="text-lg font-bold text-text tabular-nums">{mappedCount}</div>
                      <div className="text-[10px] text-text-muted">Controls Mapped</div>
                    </div>
                    <div className="rounded-lg bg-white/80 border border-compliant/10 p-2.5 text-center">
                      <div className="text-lg font-bold text-text tabular-nums">{risks.flatMap(r => r.controls).filter(c => c.isKey).length}</div>
                      <div className="text-[10px] text-text-muted">Key Controls</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {onGoToExecution && (
                      <button onClick={onGoToExecution}
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-compliant hover:bg-compliant-700 text-white rounded-lg text-[13px] font-semibold transition-colors cursor-pointer">
                        <ChevronRight size={14} />Go to Execution
                      </button>
                    )}
                    <button onClick={onBack}
                      className="px-4 py-2.5 border border-border rounded-lg text-[13px] font-medium text-text-secondary hover:bg-white transition-colors cursor-pointer">
                      Back to RACM List
                    </button>
                  </div>
                  <div className="mt-3 pt-3 border-t border-compliant/10">
                    <p className="text-[10px] text-compliant-700/50">RACM defines <strong>what</strong> should be executed. Execution defines <strong>how</strong> — using linked workflows, population data, and sample testing.</p>
                  </div>
                </motion.div>
              )}

              {/* ── RACM Readiness (shown when not yet validated) ── */}
              {!racmValidated && <RacmReadinessCard risks={risks} onGoToExecution={onGoToExecution} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ── Link Existing Control Drawer ── */}
      <AnimatePresence>
        {showLinkDrawer && (
          <LinkControlDrawer
            alreadyLinkedIds={selectedRisk.controls.map(c => c.id)}
            onClose={() => setShowLinkDrawer(false)}
            onLink={handleLinkControl}
          />
        )}
      </AnimatePresence>

      {/* ── Create New Control Drawer ── */}
      <AnimatePresence>
        {showCreateDrawer && (
          <CreateControlMiniDrawer
            onClose={() => setShowCreateDrawer(false)}
            onCreate={handleCreateControl}
            defaultProcess={selectedRisk.process}
          />
        )}
      </AnimatePresence>

      {/* ── Link Workflow to Control Drawer ── */}
      <AnimatePresence>
        {linkWorkflowControl && (
          <LinkWorkflowToControlDrawer
            control={linkWorkflowControl}
            onClose={() => setLinkWorkflowControlId(null)}
            onLink={(wf) => handleLinkWorkflowToControl(linkWorkflowControl.id, wf)}
          />
        )}
      </AnimatePresence>

      {/* ── Create Workflow Builder Drawer ── */}
      <AnimatePresence>
        {createWorkflowControl && (
          <CreateWorkflowBuilderDrawer
            control={createWorkflowControl}
            onClose={() => setCreateWorkflowControlId(null)}
            onCreate={(wf) => handleCreateWorkflowForControl(createWorkflowControl.id, wf)}
          />
        )}
      </AnimatePresence>

      {/* ── Validate RACM Modal ── */}
      <AnimatePresence>
        {showValidateModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/30 backdrop-blur-sm" onClick={() => setShowValidateModal(false)}>
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.2 }} className="bg-white rounded-2xl shadow-xl border border-canvas-border w-full max-w-[440px] p-6" onClick={e => e.stopPropagation()}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-xl bg-brand-50"><FileCheck size={20} className="text-brand-600" /></div>
                  <h2 className="text-[16px] font-bold text-text">Validate RACM</h2>
                </div>

                {/* Checklist */}
                <div className="space-y-2 mb-4">
                  {valChecks.map((c, i) => (
                    <div key={i} className="flex items-center gap-2.5 py-1">
                      {c.done
                        ? <CheckCircle2 size={15} className="text-compliant-700 shrink-0" />
                        : <XCircle size={15} className="text-risk-700 shrink-0" />}
                      <span className={`text-[13px] ${c.done ? 'text-text-secondary' : 'text-text font-semibold'}`}>{c.label}</span>
                    </div>
                  ))}
                </div>

                {/* Blocking errors */}
                {!allValPassed && (
                  <div className="rounded-lg border border-risk/20 bg-risk-50/30 px-3 py-2.5 mb-4">
                    <p className="text-[12px] font-semibold text-risk-700 mb-1">Validation blocked</p>
                    <ul className="space-y-0.5">
                      {valChecks.filter(c => !c.done).map((c, i) => (
                        <li key={i} className="text-[11px] text-risk-700/80 flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-risk-700/50 shrink-0" />{c.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {allValPassed && (
                  <div className="rounded-lg bg-surface-2/50 border border-border px-3 py-2.5 mb-4">
                    <p className="text-[12px] text-text leading-relaxed">All checks passed. Validating will set RACM status to <strong>Active</strong> and readiness to <strong>Ready for Execution</strong>.</p>
                  </div>
                )}

                {/* Summary */}
                <div className="grid grid-cols-3 gap-3 mb-4 text-center">
                  <div className="glass-card rounded-lg p-2"><div className="text-lg font-bold text-text">{totalRisks}</div><div className="text-[10px] text-text-muted">Risks</div></div>
                  <div className="glass-card rounded-lg p-2"><div className="text-lg font-bold text-text">{mappedCount}</div><div className="text-[10px] text-text-muted">Mapped</div></div>
                  <div className="glass-card rounded-lg p-2"><div className="text-lg font-bold text-text">{risks.flatMap(r => r.controls).filter(c => c.isKey).length}</div><div className="text-[10px] text-text-muted">Key Controls</div></div>
                </div>

                <div className="flex items-center gap-3">
                  <button onClick={handleValidate} disabled={!allValPassed}
                    className="flex-1 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-[13px] font-semibold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
                    {allValPassed ? 'Confirm & Validate' : 'Cannot Validate'}
                  </button>
                  <button onClick={() => setShowValidateModal(false)}
                    className="px-4 py-2.5 border border-border rounded-lg text-[13px] text-text-secondary hover:bg-surface-2 transition-colors cursor-pointer">
                    Cancel
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── RACM Readiness Card ────────────────────────────────────────────────────

type RacmReadinessState = 'Not Ready' | 'Needs Mapping' | 'Needs Workflow Setup' | 'Ready for Execution';

function RacmReadinessCard({ risks, onGoToExecution }: { risks: RiskItem[]; onGoToExecution?: () => void }) {
  const allControls = risks.flatMap(r => r.controls);

  const checks = [
    { label: 'Risks imported or created', done: risks.length > 0 },
    { label: 'All risks reviewed', done: true },
    { label: 'Required risks mapped to controls', done: risks.every(r => r.controls.length > 0) },
    { label: 'Key controls identified', done: allControls.some(c => c.isKey) },
    { label: 'Controls have workflows', done: allControls.length === 0 || allControls.every(c => c.workflowLinked) },
    { label: 'Workflows have attributes', done: allControls.length === 0 || allControls.filter(c => c.workflowLinked).every(c => (c.workflows || []).some(w => w.attributes.length > 0)) },
    { label: 'No setup-incomplete controls', done: allControls.every(c => c.workflowLinked) },
  ];

  const checksDone = checks.filter(c => c.done).length;

  // Derive state
  let readinessState: RacmReadinessState = 'Ready for Execution';
  if (risks.some(r => r.controls.length === 0)) readinessState = 'Needs Mapping';
  else if (allControls.some(c => !c.workflowLinked)) readinessState = 'Needs Workflow Setup';
  else if (allControls.some(c => (c.workflows || []).every(w => w.attributes.length === 0))) readinessState = 'Needs Workflow Setup';
  else if (!checks.every(c => c.done)) readinessState = 'Not Ready';

  const isReady = readinessState === 'Ready for Execution';

  const stateStyles: Record<RacmReadinessState, string> = {
    'Not Ready': 'bg-risk-50 text-risk-700',
    'Needs Mapping': 'bg-mitigated-50 text-mitigated-700',
    'Needs Workflow Setup': 'bg-high-50 text-high-700',
    'Ready for Execution': 'bg-compliant-50 text-compliant-700',
  };

  return (
    <div className={`rounded-xl border p-5 ${isReady ? 'border-compliant/20 bg-compliant-50/10' : 'border-border bg-white'}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FileText size={14} className={isReady ? 'text-compliant-700' : 'text-text-muted'} />
          <h4 className="text-[13px] font-bold text-text">RACM Readiness</h4>
          <span className={`px-2 h-5 rounded-full text-[10px] font-semibold inline-flex items-center ${stateStyles[readinessState]}`}>{readinessState}</span>
        </div>
        <span className="text-[11px] text-text-muted">{checksDone}/{checks.length}</span>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mb-4">
        {checks.map((c, i) => (
          <div key={i} className="flex items-center gap-2 py-0.5">
            {c.done
              ? <CheckCircle2 size={12} className="text-compliant-700 shrink-0" />
              : <AlertTriangle size={12} className="text-risk-700 shrink-0" />}
            <span className={`text-[11px] ${c.done ? 'text-text-secondary' : 'text-text font-medium'}`}>{c.label}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button onClick={() => { if (isReady && onGoToExecution) onGoToExecution(); }}
          disabled={!isReady}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-semibold transition-colors cursor-pointer ${
            isReady
              ? 'bg-compliant hover:bg-compliant-700 text-white'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}>
          <ChevronRight size={13} />Go to Execution
        </button>
        {!isReady && <span className="text-[10px] text-text-muted">Resolve remaining checks to proceed</span>}
      </div>

      <div className="mt-3 pt-3 border-t border-border/40">
        <p className="text-[10px] text-ink-400">RACM defines what should be executed. Execution will happen in the Execution tab using linked workflows and selected datasets.</p>
      </div>
    </div>
  );
}

// ─── Link Existing Control Drawer ───────────────────────────────────────────

function LinkControlDrawer({ alreadyLinkedIds, onClose, onLink }: {
  alreadyLinkedIds: string[]; onClose: () => void; onLink: (id: string) => void;
}) {
  const [search, setSearch] = useState('');
  const [processFilter, setProcessFilter] = useState('all');
  const [keyFilter, setKeyFilter] = useState('all');

  const available = CONTROL_LIBRARY.filter(c => !alreadyLinkedIds.includes(c.id));
  const filtered = available.filter(c => {
    if (processFilter !== 'all') return false; // simplified — all controls shown
    if (keyFilter === 'key' && !c.isKey) return false;
    if (keyFilter === 'non-key' && c.isKey) return false;
    if (search) {
      const q = search.toLowerCase();
      return c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
        className="fixed inset-0 bg-ink-900/40 backdrop-blur-[2px] z-40" onClick={onClose} />
      <motion.aside initial={{ x: 24, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 24, opacity: 0 }}
        transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
        className="fixed top-0 right-0 bottom-0 w-full max-w-[480px] bg-canvas-elevated shadow-xl border-l border-canvas-border flex flex-col z-50"
        role="dialog" aria-label="Link Control">
        <header className="shrink-0 px-6 pt-5 pb-4 border-b border-canvas-border">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2"><Link2 size={18} className="text-brand-600" /><h2 className="font-display text-[18px] font-semibold text-ink-900">Link Existing Control</h2></div>
              <p className="text-[12px] text-ink-500 mt-0.5">Search the Control Library to map a control to this risk.</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full text-ink-500 hover:text-ink-800 hover:bg-[#F4F2F7] flex items-center justify-center cursor-pointer"><X size={16} /></button>
          </div>
        </header>

        <div className="px-6 py-3 border-b border-canvas-border space-y-2">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search controls..."
              className="w-full pl-8 pr-3 py-2 rounded-lg border border-canvas-border bg-white text-[13px] placeholder:text-ink-400 outline-none focus:border-brand-500/60 transition-all" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold text-ink-500">Key:</span>
            {['all', 'key', 'non-key'].map(k => (
              <button key={k} onClick={() => setKeyFilter(k)}
                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold cursor-pointer transition-all ${keyFilter === k ? 'bg-brand-600 text-white' : 'bg-canvas text-ink-500 hover:bg-brand-50'}`}>
                {k === 'all' ? 'All' : k === 'key' ? 'Key' : 'Non-Key'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
          {filtered.length === 0 ? (
            <div className="text-center py-10 text-[12px] text-ink-400">No controls available</div>
          ) : filtered.map(ctrl => (
            <button key={ctrl.id} onClick={() => onLink(ctrl.id)}
              className="w-full text-left px-4 py-3 rounded-xl border border-canvas-border bg-white hover:bg-canvas hover:border-primary/20 transition-all cursor-pointer">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[12px] font-semibold text-text">{ctrl.name}</span>
                {ctrl.isKey && <Star size={10} className="fill-mitigated text-mitigated" />}
              </div>
              <p className="text-[10px] text-text-muted mb-1.5">{ctrl.description}</p>
              <div className="flex items-center gap-3 text-[9px] text-ink-400">
                <span className={`px-1.5 h-4 rounded font-bold inline-flex items-center ${AUTO_CLS[ctrl.automation]}`}>{ctrl.automation}</span>
                <span>{ctrl.workflowLinked ? ctrl.workflowName : 'No workflow'}</span>
                <span>{ctrl.attributeCount} attrs</span>
              </div>
            </button>
          ))}
        </div>

        <footer className="shrink-0 px-6 py-4 border-t border-canvas-border bg-canvas">
          <button onClick={onClose} className="w-full px-4 py-2.5 rounded-lg border border-canvas-border text-[13px] font-medium text-ink-600 hover:bg-canvas transition-colors cursor-pointer">Cancel</button>
        </footer>
      </motion.aside>
    </>
  );
}

// ─── Create New Control Mini Drawer ─────────────────────────────────────────

function CreateControlMiniDrawer({ onClose, onCreate, defaultProcess }: {
  onClose: () => void; onCreate: (ctrl: MappedControl) => void; defaultProcess: string;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [owner, setOwner] = useState('');
  const [isKey, setIsKey] = useState(false);
  const [automation, setAutomation] = useState<'Manual' | 'Automated' | 'IT-dependent'>('Manual');
  const [nature, setNature] = useState<'Preventive' | 'Detective' | 'Corrective'>('Preventive');

  const isValid = name.trim().length > 0;

  const handleCreate = () => {
    if (!isValid) return;
    onCreate({
      id: `ctl-new-${Date.now()}`, name, description, isKey, automation, nature,
      workflowLinked: false, workflowName: '', attributeCount: 0, lastExecution: '—', status: 'Not Tested',
    });
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
        className="fixed inset-0 bg-ink-900/40 backdrop-blur-[2px] z-40" onClick={onClose} />
      <motion.aside initial={{ x: 24, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 24, opacity: 0 }}
        transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
        className="fixed top-0 right-0 bottom-0 w-full max-w-[480px] bg-canvas-elevated shadow-xl border-l border-canvas-border flex flex-col z-50"
        role="dialog" aria-label="Create Control">
        <header className="shrink-0 px-6 pt-5 pb-4 border-b border-canvas-border">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2"><Shield size={18} className="text-brand-600" /><h2 className="font-display text-[18px] font-semibold text-ink-900">Create New Control</h2></div>
              <p className="text-[12px] text-ink-500 mt-0.5">Create and map to selected risk ({defaultProcess}).</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full text-ink-500 hover:text-ink-800 hover:bg-[#F4F2F7] flex items-center justify-center cursor-pointer"><X size={16} /></button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-0">
          <div className="mb-3"><label className={labelCls}>Control Name *</label><input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. PO Dual Sign-Off" className={inputCls} /></div>
          <div className="mb-3"><label className={labelCls}>Description</label><textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder="Describe the control..." className={inputCls + ' resize-none'} /></div>
          <div className="mb-3"><label className={labelCls}>Control Owner</label><input value={owner} onChange={e => setOwner(e.target.value)} placeholder="e.g. Rajiv Sharma" className={inputCls} /></div>

          <div className="mb-4">
            <label className={labelCls}>Key Control</label>
            <div className="flex gap-2">
              {[true, false].map(v => (
                <button key={String(v)} onClick={() => setIsKey(v)}
                  className={`px-4 py-2 rounded-lg border text-[12px] font-medium transition-all cursor-pointer ${isKey === v ? 'border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-500/20' : 'border-canvas-border bg-white text-ink-600 hover:bg-canvas'}`}>
                  {v ? '★ Key' : 'Non-Key'}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className={labelCls}>Automation Type</label>
            <div className="flex gap-2">
              {(['Manual', 'Automated', 'IT-dependent'] as const).map(v => (
                <button key={v} onClick={() => setAutomation(v)}
                  className={`px-3 py-2 rounded-lg border text-[12px] font-medium transition-all cursor-pointer ${automation === v ? 'border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-500/20' : 'border-canvas-border bg-white text-ink-600 hover:bg-canvas'}`}>{v}</button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className={labelCls}>Nature</label>
            <div className="flex gap-2">
              {(['Preventive', 'Detective', 'Corrective'] as const).map(v => (
                <button key={v} onClick={() => setNature(v)}
                  className={`px-3 py-2 rounded-lg border text-[12px] font-medium transition-all cursor-pointer ${nature === v ? 'border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-500/20' : 'border-canvas-border bg-white text-ink-600 hover:bg-canvas'}`}>{v}</button>
              ))}
            </div>
          </div>
        </div>

        <footer className="shrink-0 px-6 py-4 border-t border-canvas-border bg-canvas flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2.5 rounded-lg border border-canvas-border text-[13px] font-medium text-ink-600 hover:bg-canvas transition-colors cursor-pointer">Cancel</button>
          <button onClick={handleCreate} disabled={!isValid}
            className="px-5 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-[13px] font-semibold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
            Create & Map
          </button>
        </footer>
      </motion.aside>
    </>
  );
}

// ─── Link Workflow to Control Drawer ────────────────────────────────────────

const AVAILABLE_WORKFLOWS: ControlWorkflow[] = [
  { id: 'awf-001', name: 'PO Validation Workflow', version: 'v2.0', status: 'Active', lastRun: 'Apr 12, 2026', dataRequired: true, attributes: [
    { id: 'wa1', name: 'PO Existence', description: 'Verify approved PO', evidenceType: 'PO document', expectedResult: 'Approved PO present', passLogic: 'PO status = Approved' },
    { id: 'wa2', name: 'Payment Approval', description: 'Authorization check', evidenceType: 'Approval log', expectedResult: 'Dual approval', passLogic: 'Two approvals before release' },
  ]},
  { id: 'awf-002', name: 'GRN Matching Workflow', version: 'v1.6', status: 'Active', lastRun: 'Apr 12, 2026', dataRequired: true, attributes: [
    { id: 'wa3', name: 'GRN Match', description: 'Quantity matches PO', evidenceType: 'GRN document', expectedResult: 'Within 5% tolerance', passLogic: 'Variance ≤ 5%' },
  ]},
  { id: 'awf-003', name: 'Invoice Match Workflow', version: 'v2.3', status: 'Active', lastRun: 'Apr 12, 2026', dataRequired: true, attributes: [
    { id: 'wa4', name: 'Invoice Amount Match', description: 'Amount matches PO/GRN', evidenceType: 'Invoice document', expectedResult: 'Within tolerance', passLogic: 'Invoice ≤ PO ± $500/2%' },
    { id: 'wa5', name: 'Tolerance Verification', description: 'Variance documented', evidenceType: 'Exception report', expectedResult: 'Approved', passLogic: 'Exception form signed' },
  ]},
  { id: 'awf-004', name: 'Vendor Change Monitor', version: 'v1.1', status: 'Active', lastRun: 'Apr 10, 2026', dataRequired: true, attributes: [
    { id: 'wa6', name: 'Registration Complete', description: 'Required fields populated', evidenceType: 'Registration form', expectedResult: 'No blanks', passLogic: 'All required fields filled' },
    { id: 'wa7', name: 'Tax ID Verified', description: 'Government DB check', evidenceType: 'System log', expectedResult: 'Valid', passLogic: 'Tax ID returns valid' },
  ]},
  { id: 'awf-005', name: 'Duplicate Detector', version: 'v1.4', status: 'Active', lastRun: 'Apr 18, 2026', dataRequired: true, attributes: [
    { id: 'wa9', name: 'Scan Executed', description: 'Scan before processing', evidenceType: 'System log', expectedResult: 'Log present', passLogic: 'Scan < payment timestamp' },
  ]},
  { id: 'awf-006', name: 'SOD Detector', version: 'v1.1', status: 'Ready', lastRun: '—', dataRequired: true, attributes: [
    { id: 'wa11', name: 'Role Matrix Current', description: 'SOD rules current', evidenceType: 'Matrix export', expectedResult: 'Current version', passLogic: 'Date within 90 days' },
  ]},
  { id: 'awf-007', name: 'GL Reconciliation Workflow', version: 'v1.0', status: 'Draft', lastRun: '—', dataRequired: true, attributes: [] },
  { id: 'awf-008', name: 'Period Close Validator', version: 'v0.9', status: 'Draft', lastRun: '—', dataRequired: true, attributes: [
    { id: 'wa13', name: 'Balance Reconciled', description: 'GL balances match sub-ledger', evidenceType: 'Recon report', expectedResult: 'No variance', passLogic: 'GL = sub-ledger ± $100' },
  ]},
];

function LinkWorkflowToControlDrawer({ control, onClose, onLink }: {
  control: MappedControl;
  onClose: () => void;
  onLink: (wf: ControlWorkflow) => void;
}) {
  const [search, setSearch] = useState('');
  const alreadyLinkedIds = new Set((control.workflows || []).map(w => w.id));
  const available = AVAILABLE_WORKFLOWS.filter(w => !alreadyLinkedIds.has(w.id));
  const filtered = search ? available.filter(w => w.name.toLowerCase().includes(search.toLowerCase())) : available;

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
        className="fixed inset-0 bg-ink-900/40 backdrop-blur-[2px] z-40" onClick={onClose} />
      <motion.aside initial={{ x: 24, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 24, opacity: 0 }}
        transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
        className="fixed top-0 right-0 bottom-0 w-full max-w-[500px] bg-canvas-elevated shadow-xl border-l border-canvas-border flex flex-col z-50"
        role="dialog" aria-label="Link Workflow to Control">

        <header className="shrink-0 px-6 pt-5 pb-4 border-b border-canvas-border">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2"><Link2 size={18} className="text-brand-600" /><h2 className="font-display text-[18px] font-semibold text-ink-900">Link Workflow to Control</h2></div>
              <p className="text-[12px] text-ink-500 mt-1">Workflows are owned by the Control Library. Linking here updates the control object.</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full text-ink-500 hover:text-ink-800 hover:bg-[#F4F2F7] flex items-center justify-center cursor-pointer"><X size={16} /></button>
          </div>
          <div className="mt-3 rounded-lg border border-canvas-border bg-canvas px-3 py-2.5">
            <div className="flex items-center gap-2 mb-0.5">
              <Shield size={12} className="text-brand-600 shrink-0" />
              <span className="text-[12px] font-semibold text-text">{control.name}</span>
              {control.isKey && <Star size={9} className="fill-mitigated text-mitigated" />}
            </div>
            <p className="text-[10px] text-ink-400">{control.description}</p>
          </div>
        </header>

        <div className="px-6 py-3 border-b border-canvas-border">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search workflows..."
              className="w-full pl-8 pr-3 py-2 rounded-lg border border-canvas-border bg-white text-[13px] placeholder:text-ink-400 outline-none focus:border-brand-500/60 transition-all" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
          {filtered.length === 0 ? (
            <div className="text-center py-10">
              <Workflow size={28} className="mx-auto text-ink-300 mb-2" />
              <p className="text-[13px] font-semibold text-ink-600 mb-1">No workflows found</p>
              <p className="text-[11px] text-ink-400 mb-3">No matching workflows available in the Control Library.</p>
              <button onClick={() => { onClose(); }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary/30 text-[11px] font-semibold text-primary hover:bg-primary/5 transition-colors cursor-pointer">
                <Plus size={11} />Create Workflow
              </button>
            </div>
          ) : filtered.map(wf => (
            <div key={wf.id} className="rounded-xl border border-canvas-border bg-white hover:border-primary/20 hover:bg-primary-xlight/20 transition-all">
              <div className="px-4 py-3">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Workflow size={13} className="text-brand-600 shrink-0" />
                    <span className="text-[13px] font-semibold text-text">{wf.name}</span>
                    <span className="text-[10px] font-mono text-ink-400">{wf.version}</span>
                    <span className={`px-1.5 h-4 rounded text-[9px] font-bold inline-flex items-center ${WF_STATUS_CLS[wf.status]}`}>{wf.status}</span>
                  </div>
                  <button onClick={() => onLink(wf)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-[11px] font-semibold transition-colors cursor-pointer shrink-0">
                    <Link2 size={10} />Link
                  </button>
                </div>
                <div className="flex items-center gap-4 text-[10px] text-ink-400 mb-2">
                  <span>{wf.attributes.length} attribute{wf.attributes.length !== 1 ? 's' : ''}</span>
                  <span>Last run: {wf.lastRun}</span>
                  <span>Data: {wf.dataRequired ? 'Required' : 'No'}</span>
                </div>
                {wf.attributes.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {wf.attributes.map(a => <span key={a.id} className="px-1.5 h-4 rounded text-[9px] font-medium bg-brand-50 text-brand-700 inline-flex items-center">{a.name}</span>)}
                  </div>
                ) : (
                  <span className="text-[10px] text-mitigated-700 font-medium">No attributes configured yet</span>
                )}
              </div>
            </div>
          ))}
        </div>

        <footer className="shrink-0 px-6 py-4 border-t border-canvas-border bg-canvas">
          <div className="rounded-lg border border-canvas-border bg-surface-2/50 px-3 py-2 flex items-start gap-2 mb-3">
            <Shield size={11} className="text-ink-400 mt-0.5 shrink-0" />
            <span className="text-[9.5px] text-ink-400 leading-relaxed">Workflows belong to the Control Library. Linking here updates the control object, not the RACM mapping directly.</span>
          </div>
          <button onClick={onClose} className="w-full px-4 py-2.5 rounded-lg border border-canvas-border text-[13px] font-medium text-ink-600 hover:bg-canvas transition-colors cursor-pointer">Cancel</button>
        </footer>
      </motion.aside>
    </>
  );
}

// ─── Create Workflow Builder Drawer ─────────────────────────────────────────

function CreateWorkflowBuilderDrawer({ control, onClose, onCreate }: {
  control: MappedControl;
  onClose: () => void;
  onCreate: (wf: ControlWorkflow) => void;
}) {
  const { addToast } = useToast();
  const [mode, setMode] = useState<'choose' | 'builder' | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [version, setVersion] = useState('v1.0');
  const [dataRequired, setDataRequired] = useState(true);
  const [executionType, setExecutionType] = useState('Automated');
  const [owner, setOwner] = useState('');
  const [status, setStatus] = useState<'Draft' | 'Ready'>('Draft');

  // Attributes
  const [attrs, setAttrs] = useState<ControlAttribute[]>([]);
  const [showAttrForm, setShowAttrForm] = useState(false);
  const [editAttrIdx, setEditAttrIdx] = useState<number | null>(null);
  const [attrName, setAttrName] = useState('');
  const [attrDesc, setAttrDesc] = useState('');
  const [attrEvidence, setAttrEvidence] = useState('');
  const [attrExpected, setAttrExpected] = useState('');
  const [attrPassLogic, setAttrPassLogic] = useState('');
  const [attrRequired, setAttrRequired] = useState(true);

  const isValid = name.trim().length > 0;

  const resetAttrForm = () => { setAttrName(''); setAttrDesc(''); setAttrEvidence(''); setAttrExpected(''); setAttrPassLogic(''); setAttrRequired(true); setEditAttrIdx(null); setShowAttrForm(false); };

  const handleAddAttr = () => {
    if (!attrName.trim()) return;
    const attr: ControlAttribute = { id: `attr-new-${Date.now()}`, name: attrName, description: attrDesc, evidenceType: attrEvidence, expectedResult: attrExpected, passLogic: attrPassLogic };
    if (editAttrIdx !== null) {
      setAttrs(prev => prev.map((a, i) => i === editAttrIdx ? attr : a));
    } else {
      setAttrs(prev => [...prev, attr]);
    }
    resetAttrForm();
  };

  const handleEditAttr = (idx: number) => {
    const a = attrs[idx];
    setAttrName(a.name); setAttrDesc(a.description); setAttrEvidence(a.evidenceType); setAttrExpected(a.expectedResult); setAttrPassLogic(a.passLogic); setAttrRequired(true);
    setEditAttrIdx(idx); setShowAttrForm(true);
  };

  const handleDeleteAttr = (idx: number) => { setAttrs(prev => prev.filter((_, i) => i !== idx)); };

  const handleSave = () => {
    if (!isValid) return;
    onCreate({ id: `wf-new-${Date.now()}`, name, version, status: attrs.length > 0 ? 'Ready' : status, lastRun: '—', dataRequired, attributes: attrs });
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
        className="fixed inset-0 bg-ink-900/40 backdrop-blur-[2px] z-40" onClick={onClose} />
      <motion.aside initial={{ x: 24, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 24, opacity: 0 }}
        transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
        className="fixed top-0 right-0 bottom-0 w-full max-w-[560px] bg-canvas-elevated shadow-xl border-l border-canvas-border flex flex-col z-50"
        role="dialog" aria-label="Create Workflow">

        <header className="shrink-0 px-6 pt-5 pb-4 border-b border-canvas-border">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2"><Workflow size={18} className="text-brand-600" /><h2 className="font-display text-[18px] font-semibold text-ink-900">Create Workflow</h2></div>
              <p className="text-[12px] text-ink-500 mt-1">Created under <strong className="text-ink-700">{control.name}</strong> in the Control Library.</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full text-ink-500 hover:text-ink-800 hover:bg-[#F4F2F7] flex items-center justify-center cursor-pointer"><X size={16} /></button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <AnimatePresence mode="wait">
            {/* Mode selection */}
            {!mode && (
              <motion.div key="choose" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <p className="text-[13px] text-text-secondary">Choose how to build:</p>
                <div className="space-y-3">
                  <button onClick={() => setMode('builder')} className="w-full text-left px-4 py-4 rounded-xl border border-canvas-border bg-white hover:border-primary/20 hover:bg-primary-xlight/20 transition-all cursor-pointer">
                    <div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-brand-50"><Workflow size={18} className="text-brand-600" /></div><div><div className="text-[13px] font-semibold text-text">Workflow Builder</div><div className="text-[11px] text-text-muted mt-0.5">Define settings and attributes inline.</div></div><ChevronRight size={16} className="text-ink-300 ml-auto shrink-0" /></div>
                  </button>
                  <button onClick={() => { setMode('builder'); addToast({ message: 'Q&A flow — same builder with guided questions', type: 'info' }); }} className="w-full text-left px-4 py-4 rounded-xl border border-canvas-border bg-white hover:border-primary/20 hover:bg-primary-xlight/20 transition-all cursor-pointer">
                    <div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-evidence-50"><FileText size={18} className="text-evidence-700" /></div><div><div className="text-[13px] font-semibold text-text">Q&A Flow</div><div className="text-[11px] text-text-muted mt-0.5">Answer guided questions step by step.</div></div><ChevronRight size={16} className="text-ink-300 ml-auto shrink-0" /></div>
                  </button>
                </div>
              </motion.div>
            )}

            {/* Builder form */}
            {mode === 'builder' && (
              <motion.div key="builder" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} className="space-y-0">
                <button onClick={() => setMode(null)} className="flex items-center gap-1 text-[11px] text-text-muted hover:text-primary font-medium mb-3 cursor-pointer"><ArrowLeft size={12} />Back</button>
                <div className="mb-3"><label className={labelCls}>Workflow Name *</label><input value={name} onChange={e => setName(e.target.value)} placeholder={`e.g. ${control.name} Test Workflow`} className={inputCls} /></div>
                <div className="mb-3"><label className={labelCls}>Description</label><textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder="What does this workflow test?" className={inputCls + ' resize-none'} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="mb-3"><label className={labelCls}>Version</label><input value={version} onChange={e => setVersion(e.target.value)} className={inputCls + ' font-mono'} /></div>
                  <div className="mb-3"><label className={labelCls}>Owner</label><input value={owner} onChange={e => setOwner(e.target.value)} placeholder="e.g. Tushar Goel" className={inputCls} /></div>
                </div>
                <div className="mb-3">
                  <label className={labelCls}>Data Required</label>
                  <div className="flex gap-2">{[true, false].map(v => (<button key={String(v)} onClick={() => setDataRequired(v)} className={`px-3 py-1.5 rounded-lg border text-[12px] font-medium transition-all cursor-pointer ${dataRequired === v ? 'border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-500/20' : 'border-canvas-border bg-white text-ink-600 hover:bg-canvas'}`}>{v ? 'Yes' : 'No'}</button>))}</div>
                </div>
                <div className="mb-3">
                  <label className={labelCls}>Execution Type</label>
                  <div className="flex gap-2">{['Automated', 'Manual', 'Hybrid'].map(t => (<button key={t} onClick={() => setExecutionType(t)} className={`px-3 py-1.5 rounded-lg border text-[12px] font-medium transition-all cursor-pointer ${executionType === t ? 'border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-500/20' : 'border-canvas-border bg-white text-ink-600 hover:bg-canvas'}`}>{t}</button>))}</div>
                </div>

                {/* ── Attributes Section ── */}
                <div className="mt-5 pt-4 border-t border-border">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <label className={labelCls + ' mb-0'}>Test Attributes ({attrs.length})</label>
                      {attrs.length === 0 && <span className="px-1.5 h-4 rounded text-[9px] font-bold bg-mitigated-50 text-mitigated-700 inline-flex items-center">Needs Attributes</span>}
                      {attrs.length > 0 && <span className="px-1.5 h-4 rounded text-[9px] font-bold bg-compliant-50 text-compliant-700 inline-flex items-center">Ready</span>}
                    </div>
                    {!showAttrForm && <button onClick={() => { resetAttrForm(); setShowAttrForm(true); }} className="text-[11px] font-semibold text-brand-600 hover:underline cursor-pointer flex items-center gap-1"><Plus size={11} />Add Attribute</button>}
                  </div>

                  {/* Existing attributes */}
                  {attrs.length > 0 && (
                    <div className="space-y-1.5 mb-3">
                      {attrs.map((a, i) => (
                        <div key={a.id} className="flex items-start gap-2 px-3 py-2 rounded-lg border border-canvas-border bg-white">
                          <div className="flex-1 min-w-0">
                            <div className="text-[11px] font-medium text-text">{a.name}</div>
                            {a.description && <div className="text-[9.5px] text-ink-400 truncate">{a.description}</div>}
                            <div className="flex items-center gap-3 mt-1 text-[9px] text-ink-400">
                              {a.evidenceType && <span className="flex items-center gap-0.5"><Paperclip size={8} />{a.evidenceType}</span>}
                              {a.expectedResult && <span>Expected: {a.expectedResult}</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-0.5 shrink-0">
                            <button onClick={() => handleEditAttr(i)} className="p-1 rounded hover:bg-gray-100 text-ink-400 hover:text-ink-700 cursor-pointer"><Eye size={10} /></button>
                            <button onClick={() => handleDeleteAttr(i)} className="p-1 rounded hover:bg-risk-50 text-ink-400 hover:text-risk-700 cursor-pointer"><Trash2 size={10} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add/Edit attribute form */}
                  {showAttrForm && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="rounded-xl border border-brand-200 bg-brand-50/20 p-3 space-y-2 mb-3 overflow-hidden">
                      <div className="text-[11px] font-bold text-brand-700 mb-1">{editAttrIdx !== null ? 'Edit Attribute' : 'New Attribute'}</div>
                      <input value={attrName} onChange={e => setAttrName(e.target.value)} placeholder="Attribute name *" className="w-full px-2.5 py-1.5 rounded-lg border border-border text-[12px] text-text bg-white outline-none focus:border-brand-500/60" />
                      <input value={attrDesc} onChange={e => setAttrDesc(e.target.value)} placeholder="Description" className="w-full px-2.5 py-1.5 rounded-lg border border-border text-[12px] text-text bg-white outline-none focus:border-brand-500/60" />
                      <div className="grid grid-cols-2 gap-2">
                        <input value={attrEvidence} onChange={e => setAttrEvidence(e.target.value)} placeholder="Evidence type (e.g. PO doc)" className="px-2.5 py-1.5 rounded-lg border border-border text-[11px] text-text bg-white outline-none focus:border-brand-500/60" />
                        <input value={attrExpected} onChange={e => setAttrExpected(e.target.value)} placeholder="Expected result" className="px-2.5 py-1.5 rounded-lg border border-border text-[11px] text-text bg-white outline-none focus:border-brand-500/60" />
                      </div>
                      <input value={attrPassLogic} onChange={e => setAttrPassLogic(e.target.value)} placeholder="Pass/fail rule (e.g. Amount ≤ threshold)" className="w-full px-2.5 py-1.5 rounded-lg border border-border text-[11px] text-text bg-white outline-none focus:border-brand-500/60 font-mono" />
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex gap-1.5">{[true, false].map(v => (<button key={String(v)} onClick={() => setAttrRequired(v)} className={`px-2.5 py-1 rounded text-[10px] font-medium cursor-pointer ${attrRequired === v ? 'bg-brand-600 text-white' : 'bg-white border border-border text-ink-600'}`}>{v ? 'Required' : 'Optional'}</button>))}</div>
                        <div className="flex gap-1.5">
                          <button onClick={resetAttrForm} className="px-2.5 py-1 rounded text-[10px] font-medium text-ink-500 hover:bg-gray-100 cursor-pointer">Cancel</button>
                          <button onClick={handleAddAttr} disabled={!attrName.trim()} className="px-3 py-1 rounded bg-brand-600 text-white text-[10px] font-semibold cursor-pointer disabled:opacity-40">{editAttrIdx !== null ? 'Update' : 'Add'}</button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {attrs.length === 0 && !showAttrForm && (
                    <div className="rounded-lg border border-mitigated/20 bg-mitigated-50/20 px-3 py-2 text-[10px] text-mitigated-700">
                      No attributes yet. Add at least one test attribute for the workflow to be marked Ready.
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <footer className="shrink-0 px-6 py-4 border-t border-canvas-border bg-canvas flex items-center justify-between">
          <div className="text-[10px] text-ink-400">{attrs.length > 0 ? `${attrs.length} attribute${attrs.length !== 1 ? 's' : ''} → Ready` : 'No attributes → Needs Attributes'}</div>
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="px-4 py-2.5 rounded-lg border border-canvas-border text-[13px] font-medium text-ink-600 hover:bg-canvas transition-colors cursor-pointer">Cancel</button>
            {mode === 'builder' && (
              <button onClick={handleSave} disabled={!isValid}
                className="px-5 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-[13px] font-semibold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
                Create & Link Workflow
              </button>
            )}
          </div>
        </footer>
      </motion.aside>
    </>
  );
}
