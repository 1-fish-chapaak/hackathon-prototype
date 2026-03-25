import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Send, Paperclip, Sparkles, History, X, FileText,
  Workflow, ShieldCheck, BarChart3, Search, ChevronDown,
  MessageSquare, ArrowRight, Mic, Plus, Lightbulb, Zap,
  Save, Monitor, Layout, CheckCircle, AlertTriangle, SlidersHorizontal
} from 'lucide-react';
import { CHAT_HISTORY, CHAT_CONVERSATIONS, CLARIFICATION_STEPS, WORKFLOW_CLARIFICATION_STEPS, WORKFLOW_ASSUMPTIONS } from '../../data/mockData';
import type { ArtifactTab } from '../../hooks/useAppState';
import { TextShimmer } from '../shared/TextShimmer';
import { AuditifyHelloEffect } from '../shared/HelloEffect';
import BorderGlow from '../shared/BorderGlow';
import FloatingLines from '../shared/FloatingLines';
// AIPersona removed — Rive WebGL crashes in headless/some browsers
import LiquidFillGraphic from './LiquidFillGraphic';
import ComponentLoader from '../shared/ComponentLoader';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  thinking?: string[];
  hasArtifact?: boolean;
  artifactType?: 'workflow' | 'query' | 'report';
  followUps?: string[];
  timestamp: Date;
  clarificationOptions?: string[];
  isComponentResult?: boolean;
  componentType?: 'plan' | 'code' | 'sources' | 'result';
  // Rich inline components
  richType?: 'summary-kpi' | 'threshold-control' | 'save-workflow' | 'layout-switcher' | 'ui-recommendations';
  richData?: Record<string, unknown>;
}

interface ChatViewProps {
  showChatHistory: boolean;
  toggleChatHistory: () => void;
  setShowArtifacts: (v: boolean) => void;
  setActiveArtifactTab: (t: ArtifactTab) => void;
  setArtifactMode: (m: 'query' | 'workflow') => void;
  setWorkflowBuildStage?: (stage: number) => void;
  setWorkflowUiEnhancements?: (enhancements: string[]) => void;
  initialQuery?: string;
  onInitialQueryProcessed?: () => void;
}

type DetailedQueryType = 'duplicate-invoice' | 'workflow' | 'sox-compliance' | 'vendor-spend' | 'uncontrolled-risks' | 'control-effectiveness' | 'generic';

const classifyDetailedQuery = (msg: string): DetailedQueryType => {
  const lower = msg.toLowerCase();
  // Workflow
  if (lower.includes('workflow') || lower.includes('build a') || lower.includes('build me') || lower.includes('create a') || lower.includes('design a')) {
    return 'workflow';
  }
  // Duplicate invoice
  if ((lower.includes('duplicate') && lower.includes('invoice')) || (lower.includes('duplicate') && lower.includes('detect'))) {
    return 'duplicate-invoice';
  }
  // SOX compliance
  if (lower.includes('sox') || (lower.includes('compliance') && (lower.includes('status') || lower.includes('audit') || lower.includes('report') || lower.includes('progress')))) {
    return 'sox-compliance';
  }
  // Vendor spend
  if (lower.includes('vendor spend') || lower.includes('vendor analysis') || lower.includes('top vendor') || lower.includes('vendor concentration') || lower.includes('spend analysis')) {
    return 'vendor-spend';
  }
  // Uncontrolled risks
  if (lower.includes('uncontrolled risk') || lower.includes('risks without control') || lower.includes('no controls') || lower.includes('zero controls') || lower.includes('unmapped risk')) {
    return 'uncontrolled-risks';
  }
  // Control effectiveness
  if (lower.includes('control effectiveness') || lower.includes('ineffective control') || lower.includes('control performance') || lower.includes('effectiveness rate')) {
    return 'control-effectiveness';
  }
  return 'generic';
};

const DETAILED_QUERY_CONFIG: Record<Exclude<DetailedQueryType, 'duplicate-invoice' | 'workflow'>, {
  thinking: string[];
  responseText: string;
  insightsText: string;
  kpis: { label: string; value: string; color: string }[];
  followUps: string[];
}> = {
  'sox-compliance': {
    thinking: [
      'Analyzing SOX compliance scope...',
      'Querying control testing results...',
      'Evaluating deficiency classifications...',
      'Cross-referencing PCAOB standards...',
      'Compiling compliance dashboard...',
    ],
    responseText: "Here's your current SOX audit status. The assessment is 58% complete with 14 of 24 controls tested so far. 2 deficiencies have been identified that require remediation before the reporting deadline.",
    insightsText: "**Key Insights:** 2 material weaknesses identified in IT General Controls (ITGC-003, ITGC-007). Revenue recognition controls (SOX-RC-01) passed with no exceptions. Segregation of duties testing is pending for 4 remaining controls. Recommend escalating ITGC remediation to meet Q2 deadline.",
    kpis: [
      { label: 'Controls Tested', value: '14/24', color: 'text-blue-600' },
      { label: 'Completion', value: '58%', color: 'text-primary' },
      { label: 'Deficiencies', value: '2', color: 'text-red-600' },
      { label: 'On Track', value: 'At Risk', color: 'text-orange-600' },
    ],
    followUps: [
      'Show details on the 2 deficiencies found',
      'Which controls are still pending testing?',
      'Generate a SOX status report for the audit committee',
      'What is the remediation timeline for ITGC issues?',
      'Compare progress against last year\'s SOX timeline',
    ],
  },
  'vendor-spend': {
    thinking: [
      'Querying vendor master data...',
      'Aggregating spend by vendor...',
      'Calculating concentration risk metrics...',
      'Identifying single-source dependencies...',
      'Generating vendor analysis...',
    ],
    responseText: "I've analyzed vendor spend across all business units. Your top 5 vendors account for 67% of total procurement spend, indicating moderate concentration risk. Here's the breakdown:",
    insightsText: "**Key Insights:** Acme Corp ($4.2M, 23% of spend) is the largest vendor with no secondary source. 3 vendors have contracts expiring within 60 days. Vendor VND-0042 (TechServ Ltd) shows a 340% spend increase YoY — flagged for review. Recommend diversifying supply chain for critical categories.",
    kpis: [
      { label: 'Total Spend', value: '$18.4M', color: 'text-text' },
      { label: 'Top 5 Share', value: '67%', color: 'text-orange-600' },
      { label: 'Active Vendors', value: '892', color: 'text-blue-600' },
      { label: 'High Risk', value: '3', color: 'text-red-600' },
    ],
    followUps: [
      'Show the full vendor concentration breakdown',
      'Which vendors have contracts expiring soon?',
      'Flag vendors with unusual spend increases',
      'Build a vendor risk monitoring workflow',
      'Compare vendor spend against budget allocations',
    ],
  },
  'uncontrolled-risks': {
    thinking: [
      'Scanning risk register...',
      'Cross-referencing control mappings...',
      'Identifying gaps in coverage...',
      'Evaluating residual risk exposure...',
      'Compiling uncontrolled risk report...',
    ],
    responseText: "I've identified 3 risks with zero controls mapped: RSK-004 (Unauthorized vendor payments), RSK-007 (Data exfiltration via API), and RSK-009 (Segregation of duties bypass). These represent your highest exposure areas.",
    insightsText: "**Key Insights:** RSK-004 has been uncontrolled for 120+ days and is rated Critical severity. RSK-007 was added last quarter after a penetration test finding. RSK-009 was previously controlled by CTR-011 which was retired in Jan 2026. Recommend immediate control mapping for all three — combined inherent risk exposure is $2.1M.",
    kpis: [
      { label: 'Uncontrolled', value: '3', color: 'text-red-600' },
      { label: 'Critical', value: '1', color: 'text-red-600' },
      { label: 'Exposure', value: '$2.1M', color: 'text-orange-600' },
      { label: 'Avg Days Open', value: '87', color: 'text-orange-600' },
    ],
    followUps: [
      'Suggest controls for RSK-004',
      'Show the full risk register with control gaps',
      'What controls were previously mapped to these risks?',
      'Escalate uncontrolled risks to the risk committee',
      'Build an automated control gap monitoring workflow',
    ],
  },
  'control-effectiveness': {
    thinking: [
      'Pulling control testing results...',
      'Computing effectiveness scores...',
      'Identifying underperforming controls...',
      'Analyzing failure patterns...',
      'Generating effectiveness report...',
    ],
    responseText: "Control effectiveness analysis complete. Your overall effectiveness rate is 79% across 42 active controls. CTR-004 (Three-way match verification) is rated Ineffective with a 34% pass rate in the last testing cycle.",
    insightsText: "**Key Insights:** CTR-004 failed 19 of 29 test samples — root cause is manual override by AP clerks. CTR-012 (Access review) dropped from 95% to 71% effectiveness this quarter. 6 controls are rated Needs Improvement. Top performing: CTR-001 (automated bank reconciliation) at 99% effectiveness. Recommend automating CTR-004 to eliminate manual bypass.",
    kpis: [
      { label: 'Overall Rate', value: '79%', color: 'text-blue-600' },
      { label: 'Ineffective', value: '1', color: 'text-red-600' },
      { label: 'Needs Improvement', value: '6', color: 'text-orange-600' },
      { label: 'Effective', value: '35', color: 'text-green-600' },
    ],
    followUps: [
      'Show details on CTR-004 failures',
      'What is causing the decline in CTR-012?',
      'Recommend automation options for manual controls',
      'Compare effectiveness rates quarter over quarter',
      'Generate a control effectiveness report for management',
    ],
  },
  'generic': {
    thinking: [
      'Analyzing query...',
      'Identifying relevant data sources...',
      'Querying SAP ERP — AP Module...',
      'Processing 1.2M records...',
      'Generating results...',
    ],
    responseText: "I found the relevant data from your connected sources. Here's a summary:",
    insightsText: "**Key Insights:** 2 risks (RSK-004, RSK-007) have zero controls mapped — highest exposure. RSK-008 (SOD violation) has controls but requires immediate attention due to critical severity. Recommend prioritizing control mapping for uncontrolled risks and scheduling a focused review of AP segregation of duties.",
    kpis: [
      { label: 'Records Scanned', value: '1.2M', color: 'text-text' },
      { label: 'Risks Found', value: '5', color: 'text-orange-600' },
      { label: 'Critical', value: '2', color: 'text-red-600' },
      { label: 'Uncontrolled', value: '2', color: 'text-red-600' },
    ],
    followUps: [
      'Show me the trend over the last 6 months',
      'Which controls can mitigate these risks?',
      'Generate a compliance report from these results',
      'Build a monitoring workflow for these risks',
      'Compare this against last quarter\'s assessment',
    ],
  },
};

const QUICK_ACTIONS = [
  { icon: Workflow, label: 'Build a workflow', color: 'from-purple-500 to-violet-600' },
  { icon: ShieldCheck, label: 'Run audit query', color: 'from-blue-500 to-cyan-500' },
  { icon: BarChart3, label: 'Generate report', color: 'from-emerald-500 to-teal-500' },
  { icon: Search, label: 'Search risk register', color: 'from-orange-500 to-amber-500' },
];

// DEMO_THINKING_WORKFLOW removed — workflow now uses clarification flow

const DEMO_THINKING_QUERY = [
  'Analyzing query...',
  'Identifying relevant data sources...',
  'Querying SAP ERP — AP Module...',
  'Processing 1.2M records...',
  'Generating results...',
];

// WORKFLOW_FOLLOWUPS removed — workflow now uses UI recommendations flow

const QUERY_FOLLOWUPS = [
  'Show me the trend over the last 6 months',
  'Which controls can mitigate these risks?',
  'Generate a compliance report from these results',
  'Build a monitoring workflow for these risks',
  'Compare this against last quarter\'s assessment',
];

const RECOMMENDED_WORKFLOWS = [
  { label: 'Vendor Onboarding Validator', desc: 'Verify new vendor documents & compliance', icon: ShieldCheck, color: 'text-blue-600 bg-blue-50' },
  { label: 'Payment Anomaly Detector', desc: 'ML-based unusual payment pattern detection', icon: Zap, color: 'text-orange-600 bg-orange-50' },
  { label: 'Audit Evidence Collector', desc: 'Auto-gather evidence for control testing', icon: BarChart3, color: 'text-green-600 bg-green-50' },
];

// Save workflow card with confirmation
function SaveWorkflowCard() {
  const [saved, setSaved] = useState(false);
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="ml-7">
      <div className="glass-card rounded-xl p-4">
        {saved ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center justify-center gap-3 py-2">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 12 }}>
              <CheckCircle size={22} className="text-green-500" />
            </motion.div>
            <div>
              <div className="text-[13px] font-semibold text-text">Workflow added to library!</div>
              <div className="text-[11px] text-text-muted">Saved as "Duplicate Invoice Detector v4"</div>
            </div>
          </motion.div>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <button onClick={() => setSaved(true)} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-primary to-primary-medium hover:from-primary-hover hover:to-primary text-white rounded-xl text-[13px] font-semibold transition-all cursor-pointer shadow-md shadow-primary/20">
                <Save size={15} /> Save to Workflow Library
              </button>
              <button className="flex items-center justify-center gap-2 px-4 py-3 border border-border rounded-xl text-[13px] font-medium text-text-secondary hover:bg-white transition-colors cursor-pointer">
                <AlertTriangle size={14} /> Test Run
              </button>
            </div>
            <p className="text-[10px] text-text-muted text-center mt-2">Workflow will be saved as "Duplicate Invoice Detector v4"</p>
          </>
        )}
      </div>
    </motion.div>
  );
}

// Layout switcher with prominent UI
function LayoutSwitcherCard() {
  const [selected, setSelected] = useState('Standard');
  const [tolerance, setTolerance] = useState('5');
  const layouts = [
    { label: 'Standard', desc: 'Form + Results table', icon: Layout },
    { label: 'Dashboard', desc: 'KPIs + Charts + Table', icon: BarChart3 },
    { label: 'Conversational', desc: 'Chat + Side results', icon: MessageSquare },
  ];
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="ml-7">
      <div className="glass-card rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Monitor size={14} className="text-primary" />
          <span className="text-[12px] font-semibold text-text">Customize Output</span>
          <span className="text-[9px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
            <Sparkles size={7} /> AI Recommended
          </span>
        </div>
        {/* Layout options */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {layouts.map(layout => (
            <button key={layout.label} onClick={() => setSelected(layout.label)} className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${selected === layout.label ? 'border-primary bg-primary/5 shadow-sm' : 'border-border-light hover:border-primary/30'}`}>
              <div className={`w-8 h-8 rounded-lg mb-2 flex items-center justify-center ${selected === layout.label ? 'bg-primary/10' : 'bg-surface-2'}`}>
                <layout.icon size={16} className={selected === layout.label ? 'text-primary' : 'text-text-muted'} />
              </div>
              <div className={`text-[11px] font-semibold ${selected === layout.label ? 'text-primary' : 'text-text'}`}>{layout.label}</div>
              <div className="text-[9px] text-text-muted">{layout.desc}</div>
              {selected === layout.label && <div className="text-[8px] text-primary font-bold mt-1.5 flex items-center gap-0.5"><CheckCircle size={8} /> Active</div>}
            </button>
          ))}
        </div>
        {/* Threshold input */}
        <div className="p-3 rounded-lg bg-surface-2 border border-border-light">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-text flex items-center gap-1.5"><SlidersHorizontal size={12} className="text-primary" /> Match Tolerance</span>
            <div className="flex items-center gap-1">
              <input type="number" value={tolerance} onChange={e => setTolerance(e.target.value)} className="w-12 text-center text-[12px] font-bold text-primary bg-white border border-primary/20 rounded-lg py-1 focus:outline-none focus:border-primary" />
              <span className="text-[11px] text-text-muted font-medium">%</span>
            </div>
          </div>
          <div className="h-1.5 bg-surface-3 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary/60 to-primary rounded-full transition-all" style={{ width: `${Math.min(Number(tolerance) * 10, 100)}%` }} />
          </div>
          <div className="flex justify-between text-[8px] text-text-muted mt-1"><span>Exact</span><span>5%</span><span>10%</span></div>
        </div>
      </div>
    </motion.div>
  );
}

// UI Recommendations + Freeze + Save card for workflow build
function UIRecommendationsCard({ onEnhancementsApplied }: { onEnhancementsApplied?: (enhancements: string[]) => void }) {
  const [phase, setPhase] = useState<'recommend' | 'frozen' | 'saving' | 'saved'>('recommend');

  const recommendations = [
    { label: 'Add severity color coding to results table', key: 'severity' },
    { label: 'Include export buttons (PDF, Excel) on output', key: 'export' },
    { label: 'Add date range filter to input form', key: 'date' },
  ];

  const [applied, setApplied] = useState<Set<number>>(new Set());

  const toggleApply = (i: number) => {
    setApplied(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  };

  const handleFreeze = () => {
    const appliedLabels = recommendations.filter((_, i) => applied.has(i)).map(r => r.label);
    onEnhancementsApplied?.(appliedLabels);
    setPhase('frozen');
  };

  const handleSave = () => {
    setPhase('saving');
    setTimeout(() => {
      setPhase('saved');
    }, 1200);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="ml-7 space-y-3">
      {/* Recommendations */}
      {phase === 'recommend' && (
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={14} className="text-primary" />
            <span className="text-[12px] font-semibold text-text">Recommended UI Changes</span>
          </div>
          <div className="space-y-2 mb-4">
            {recommendations.map((rec, i) => (
              <button
                key={i}
                onClick={() => toggleApply(i)}
                className={`w-full flex items-center gap-3 p-2.5 rounded-lg border text-left transition-all cursor-pointer text-[12px] ${
                  applied.has(i) ? 'border-primary bg-primary/5 text-primary' : 'border-border-light hover:border-primary/30 text-text-secondary'
                }`}
              >
                <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${applied.has(i) ? 'bg-primary text-white' : 'bg-surface-2'}`}>
                  {applied.has(i) ? <CheckCircle size={12} /> : <Plus size={12} className="text-text-muted" />}
                </div>
                {rec.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={handleFreeze} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-primary to-primary-medium text-white rounded-xl text-[12px] font-semibold hover:from-primary-hover hover:to-primary transition-all cursor-pointer">
              {applied.size > 0 ? `Apply ${applied.size} changes & Freeze` : 'Keep as is & Freeze'}
            </button>
          </div>
        </div>
      )}

      {/* Frozen state */}
      {phase === 'frozen' && (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle size={14} className="text-green-500" />
              <span className="text-[12px] font-semibold text-text">Layout Frozen</span>
              {applied.size > 0 && <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">{applied.size} changes applied</span>}
            </div>
            <p className="text-[11px] text-text-muted mb-3">Output layout is locked. Save this workflow to your library.</p>
            <button onClick={handleSave} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-primary to-primary-medium hover:from-primary-hover hover:to-primary text-white rounded-xl text-[13px] font-semibold transition-all cursor-pointer shadow-md shadow-primary/20">
              <Save size={15} /> Save Workflow to Library
            </button>
          </div>
        </motion.div>
      )}

      {/* Saving */}
      {phase === 'saving' && (
        <div className="glass-card rounded-xl p-4 flex items-center justify-center gap-3 py-6">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
            <Sparkles size={18} className="text-primary" />
          </motion.div>
          <span className="text-[13px] font-medium text-text-secondary">Saving workflow...</span>
        </div>
      )}

      {/* Saved with redirect */}
      {phase === 'saved' && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 12 }}>
                <CheckCircle size={22} className="text-green-500" />
              </motion.div>
              <div>
                <div className="text-[13px] font-semibold text-text">Workflow saved to library!</div>
                <div className="text-[11px] text-text-muted">Duplicate Invoice Detector v4 — Ready to run</div>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-[11px] font-semibold text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors cursor-pointer">
                <ArrowRight size={12} /> View in Workflow Library
              </button>
              <button className="flex items-center justify-center gap-1.5 px-3 py-2 text-[11px] font-medium text-text-secondary hover:bg-gray-50 rounded-lg transition-colors cursor-pointer border border-border-light">
                <BarChart3 size={12} /> Add to Dashboard
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

const COMPONENT_LOADING_MESSAGES = [
  { type: 'plan' as const, title: 'Execution Plan', text: '5-step query plan generated. Scanning SAP ERP AP Module with fuzzy match logic across selected vendor scope.' },
  { type: 'code' as const, title: 'Generated SQL', text: 'SELECT inv.*, h.invoice_no AS original, similarity_score(inv.amount, h.amount, inv.vendor_id, h.vendor_id) AS match_pct FROM invoices inv JOIN invoice_history h ON ...' },
  { type: 'sources' as const, title: 'Data Sources', text: 'Connected: SAP ERP AP Module (1.2M rows), Vendor Master Data (892 vendors), Invoice Archive 2026 (4,521 records)' },
  { type: 'result' as const, title: 'Results', text: 'Found 8 potential duplicate invoices totaling $616,650. Highest match: INV-2026-4521 (96% match to INV-2026-3102, Acme Corp, $45,200).' },
];

export default function ChatView({ showChatHistory, toggleChatHistory, setShowArtifacts, setActiveArtifactTab, setArtifactMode, setWorkflowBuildStage, setWorkflowUiEnhancements, initialQuery, onInitialQueryProcessed }: ChatViewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [thinkingSteps, setThinkingSteps] = useState<string[]>([]);
  const [thinkingExpanded, setThinkingExpanded] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const processingRef = useRef(false);
  // Clarification mode state (query)
  const [clarificationMode, setClarificationMode] = useState(false);
  const [clarificationStep, setClarificationStep] = useState(0);
  const [liquidFillPercent, setLiquidFillPercent] = useState(0);
  const [liquidStage, setLiquidStage] = useState('');
  const [, setShowComponentLoading] = useState(false);
  const [loadedComponents, setLoadedComponents] = useState<Set<string>>(new Set());
  // Workflow build clarification state
  const [workflowClarificationMode, setWorkflowClarificationMode] = useState(false);
  const [workflowClarificationStep, setWorkflowClarificationStep] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isUserScrolledUp = useRef(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const threshold = 100;
    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    isUserScrolledUp.current = distanceFromBottom > threshold;
  }, []);

  useEffect(() => {
    if (!isUserScrolledUp.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, thinkingSteps, liquidFillPercent, loadedComponents.size]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach(t => clearTimeout(t));
    };
  }, []);

  // Support for "Ask AI about risk" context — auto-send initialQuery when it appears
  useEffect(() => {
    if (initialQuery) {
      setMessages(prev => [...prev, { id: `msg-${Date.now()}`, role: 'user', text: initialQuery, timestamp: new Date() }]);
      simulateResponse(initialQuery);
      onInitialQueryProcessed?.();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  const isDuplicateInvoiceQuery = (msg: string): boolean => {
    const lower = msg.toLowerCase();
    return (lower.includes('duplicate') && lower.includes('invoice')) ||
           (lower.includes('duplicate') && lower.includes('detect')) ||
           lower.includes('duplicate invoice');
  };

  const classifyQuery = (msg: string): 'workflow' | 'query' => {
    const lower = msg.toLowerCase();
    if (lower.includes('workflow') || lower.includes('build a') || lower.includes('build me') || lower.includes('create a') || lower.includes('design a')) {
      return 'workflow';
    }
    return 'query';
  };

  const startClarificationFlow = () => {
    clearTimers();
    setClarificationMode(true);
    setClarificationStep(0);
    setLiquidFillPercent(0);
    setLiquidStage('Intent');

    schedule(() => {
      const step = CLARIFICATION_STEPS[0];
      setMessages(prev => [...prev, {
        id: `msg-clarify-0`,
        role: 'assistant',
        text: step.question,
        clarificationOptions: step.options,
        timestamp: new Date(),
      }]);
    }, 600);
  };

  const handleClarificationOptionClick = (option: string) => {
    if (processingRef.current) return;
    processingRef.current = true;
    setTimeout(() => { processingRef.current = false; }, 1500);
    clearTimers();

    // Add user's selection as message
    setMessages(prev => [...prev, {
      id: `msg-${Date.now()}`,
      role: 'user',
      text: option,
      timestamp: new Date(),
    }]);

    const currentStep = CLARIFICATION_STEPS[clarificationStep];
    setLiquidFillPercent(currentStep.fillPercent);
    setLiquidStage(currentStep.category);

    const nextStep = clarificationStep + 1;

    if (nextStep < CLARIFICATION_STEPS.length) {
      setClarificationStep(nextStep);
      schedule(() => {
        const next = CLARIFICATION_STEPS[nextStep];
        setMessages(prev => [...prev, {
          id: `msg-clarify-${nextStep}`,
          role: 'assistant',
          text: next.question,
          clarificationOptions: next.options,
          timestamp: new Date(),
        }]);
      }, 800);
    } else {
      // All clarifications done — component-by-component loading
      setClarificationMode(false);
      setLoadedComponents(new Set());

      // Clarification summary
      schedule(() => {
        setMessages(prev => [...prev, {
          id: `msg-clarification-summary`,
          role: 'assistant',
          text: `**Configuration Summary**\n\n` +
            `Date Range: Full FY26\n` +
            `Tolerance: +/- 5%\n` +
            `Vendor Scope: All vendors\n` +
            `Match Logic: Fuzzy match all fields\n\n` +
            `**Assumptions:**\n` +
            `- Excluding voided invoices\n` +
            `- Currency conversion at booking rate\n` +
            `- Looking back 12 months for duplicates\n` +
            `- Results sorted by match score (descending)`,
          timestamp: new Date(),
        }]);
      }, 300);

      schedule(() => {
        setMessages(prev => [...prev, {
          id: `msg-analyzing`,
          role: 'assistant',
          text: "All parameters confirmed. Running duplicate invoice analysis now...",
          timestamp: new Date(),
        }]);
      }, 900);

      // Progressive component loading
      COMPONENT_LOADING_MESSAGES.forEach((comp, i) => {
        schedule(() => {
          setLoadedComponents(prev => new Set([...prev, comp.type]));
          setMessages(prev => [...prev, {
            id: `msg-component-${comp.type}`,
            role: 'assistant',
            text: `**${comp.title}**\n${comp.text}`,
            timestamp: new Date(),
            isComponentResult: true,
            componentType: comp.type,
          }]);
        }, 1700 + i * 800);
      });

      // Final answer
      const finalDelay = 1700 + COMPONENT_LOADING_MESSAGES.length * 800 + 600;
      schedule(() => {
        const shuffled = [...QUERY_FOLLOWUPS].sort(() => Math.random() - 0.5);
        setMessages(prev => [...prev, {
          id: `msg-final-result`,
          role: 'assistant',
          text: "Analysis complete! I've identified 8 potential duplicate invoices across your vendor payments. The artifact panel shows the full execution plan, SQL query, data sources, and detailed results table with match scores.",
          hasArtifact: true,
          artifactType: 'query',
          followUps: shuffled.slice(0, 3),
          timestamp: new Date(),
        }]);
        setLiquidFillPercent(0);
        setArtifactMode('query');
        setShowArtifacts(true);
        setActiveArtifactTab('result');
      }, finalDelay);
    }
  };

  // Clear all pending timers
  const clearTimers = () => {
    timersRef.current.forEach(t => clearTimeout(t));
    timersRef.current = [];
  };

  // Schedule a callback after ms — stored in ref for cleanup
  const schedule = (fn: () => void, ms: number) => {
    const t = setTimeout(fn, ms);
    timersRef.current.push(t);
  };

  // Start workflow build with 5-stage clarification
  const startWorkflowBuildFlow = () => {
    clearTimers();
    setWorkflowClarificationMode(true);
    setWorkflowClarificationStep(0);

    // Open canvas in build mode (stage 0)
    setArtifactMode('workflow');
    setShowArtifacts(true);
    if (setWorkflowBuildStage) setWorkflowBuildStage(0);

    // Show first clarification question
    schedule(() => {
      const step = WORKFLOW_CLARIFICATION_STEPS[0];
      setMessages(prev => [...prev, {
        id: `msg-wf-clarify-0`,
        role: 'assistant',
        text: step.question,
        clarificationOptions: step.options,
        timestamp: new Date(),
      }]);
    }, 600);
  };

  const handleWorkflowClarificationClick = (option: string) => {
    if (processingRef.current) return;
    processingRef.current = true;
    setTimeout(() => { processingRef.current = false; }, 1500);
    clearTimers();

    // Add user's selection as message
    setMessages(prev => [...prev, {
      id: `msg-${Date.now()}`,
      role: 'user',
      text: option,
      timestamp: new Date(),
    }]);

    const currentStep = WORKFLOW_CLARIFICATION_STEPS[workflowClarificationStep];

    // Update canvas stage — each answer reveals a new section
    if (setWorkflowBuildStage) setWorkflowBuildStage(currentStep.stage);

    const nextStep = workflowClarificationStep + 1;

    if (nextStep < WORKFLOW_CLARIFICATION_STEPS.length) {
      setWorkflowClarificationStep(nextStep);
      schedule(() => {
        const next = WORKFLOW_CLARIFICATION_STEPS[nextStep];
        setMessages(prev => [...prev, {
          id: `msg-wf-clarify-${nextStep}`,
          role: 'assistant',
          text: next.question,
          clarificationOptions: next.options,
          timestamp: new Date(),
        }]);
      }, 800);
    } else {
      // Stage 5 complete — canvas expands, show UI customization flow
      setWorkflowClarificationMode(false);
      if (setWorkflowBuildStage) setWorkflowBuildStage(5);

      // Workflow clarification summary with all 5 steps + assumptions
      schedule(() => {
        const summaryLines = WORKFLOW_CLARIFICATION_STEPS.map((step, i) => {
          const assumptions = WORKFLOW_ASSUMPTIONS[i + 1] || [];
          return `**Step ${i + 1} - ${step.category}:** ${step.options[0]}\n` +
            (assumptions.length > 0 ? assumptions.map(a => `  - ${a}`).join('\n') : '');
        }).join('\n\n');

        setMessages(prev => [...prev, {
          id: `msg-wf-clarification-summary`,
          role: 'assistant',
          text: `**Workflow Configuration Summary**\n\n${summaryLines}`,
          timestamp: new Date(),
        }]);
      }, 200);

      // 1. Canvas expanded message
      schedule(() => {
        setMessages(prev => [...prev, {
          id: `msg-wf-expanded`,
          role: 'assistant',
          text: "Canvas expanded with your AI-recommended output layout. Here are some suggested UI improvements:",
          timestamp: new Date(),
        }]);
      }, 700);

      // 2. Recommended UI changes
      schedule(() => {
        setMessages(prev => [...prev, {
          id: `msg-wf-ui-recs`,
          role: 'assistant',
          text: '',
          timestamp: new Date(),
          richType: 'ui-recommendations',
        }]);
      }, 1200);
    }
  };

  const simulateResponse = (userMsg: string) => {
    clearTimers();

    // If we're in workflow build mode, treat any text input as continuing the build
    if (workflowClarificationMode) {
      handleWorkflowClarificationClick(userMsg);
      return;
    }

    const detailedType = classifyDetailedQuery(userMsg);

    // Workflow queries → 5-stage build clarification
    if (detailedType === 'workflow') {
      startWorkflowBuildFlow();
      return;
    }

    // Duplicate invoice query → query clarification flow
    if (detailedType === 'duplicate-invoice') {
      startClarificationFlow();
      return;
    }

    // All other query types — thinking steps → result with type-specific content
    const config = DETAILED_QUERY_CONFIG[detailedType];
    const thinkingList = config.thinking;

    setIsTyping(true);
    setThinkingSteps([]);
    setThinkingExpanded(true);
    isUserScrolledUp.current = false;

    thinkingList.forEach((step, i) => {
      schedule(() => {
        setThinkingSteps(prev => [...prev, step]);
      }, 400 * (i + 1));
    });

    const totalThinkingTime = 400 * thinkingList.length + 400;

    // 1. Text response
    schedule(() => {
      setMessages(prev => [...prev, {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        text: config.responseText,
        hasArtifact: true,
        artifactType: 'query',
        timestamp: new Date(),
        thinking: [...thinkingList],
      }]);
      setIsTyping(false);
      setThinkingSteps([]);
      setArtifactMode('query');
      setShowArtifacts(true);
      setActiveArtifactTab('result');
    }, totalThinkingTime);

    // 2. Summary KPI cards in chat (type-specific)
    schedule(() => {
      setMessages(prev => [...prev, {
        id: `msg-summary-kpi-${Date.now()}`,
        role: 'assistant',
        text: '',
        timestamp: new Date(),
        richType: 'summary-kpi',
        richData: { kpis: config.kpis },
      }]);
    }, totalThinkingTime + 500);

    // 3. Textual summary insights (type-specific)
    schedule(() => {
      setMessages(prev => [...prev, {
        id: `msg-insights-${Date.now()}`,
        role: 'assistant',
        text: config.insightsText,
        timestamp: new Date(),
      }]);
    }, totalThinkingTime + 900);

    // 4. Threshold control with type-specific follow-ups
    schedule(() => {
      const shuffled = [...config.followUps].sort(() => Math.random() - 0.5);
      setMessages(prev => [...prev, {
        id: `msg-threshold-${Date.now()}`,
        role: 'assistant',
        text: '',
        timestamp: new Date(),
        richType: 'threshold-control',
        followUps: shuffled.slice(0, 3),
      }]);
    }, totalThinkingTime + 1000);
  };

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed && files.length === 0) return;
    let text = trimmed;
    if (files.length > 0) text += `\n[Attached: ${files.map(f => f.name).join(', ')}]`;
    setMessages(prev => [...prev, { id: `msg-${Date.now()}`, role: 'user', text, timestamp: new Date() }]);
    setInput('');
    setFiles([]);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    simulateResponse(text);
  };

  const handleFollowUpClick = (question: string) => {
    if (processingRef.current) return;
    processingRef.current = true;
    setMessages(prev => [...prev, { id: `msg-${Date.now()}`, role: 'user', text: question, timestamp: new Date() }]);
    simulateResponse(question);
    setTimeout(() => { processingRef.current = false; }, 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
  };

  const handleTextareaInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + 'px';
    }
  };

  const isEmpty = messages.length === 0;

  /* ────────────────────── CHAT HISTORY SIDEBAR ────────────────────── */
  const chatHistoryPanel = (
    <AnimatePresence>
      {showChatHistory && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 280, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="h-full bg-white border-r border-border-light overflow-hidden shrink-0"
        >
          <div className="p-4 border-b border-border-light flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text">Chat History</h3>
            <button onClick={toggleChatHistory} className="text-text-muted hover:text-text-secondary p-1 rounded-md hover:bg-gray-50 cursor-pointer">
              <X size={16} />
            </button>
          </div>
          <div className="p-3">
            <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-border text-[12.5px] text-primary font-medium hover:bg-primary-xlight transition-colors cursor-pointer">
              <Plus size={14} />
              New Chat
            </button>
          </div>
          <div className="overflow-y-auto flex-1" style={{ height: 'calc(100% - 110px)' }}>
            {CHAT_HISTORY.map(chat => (
              <button
                key={chat.id}
                className="w-full text-left px-4 py-3 border-b border-border-light hover:bg-primary-xlight/50 transition-colors group cursor-pointer"
                onClick={() => {
                  const convo = CHAT_CONVERSATIONS[chat.id];
                  if (convo) {
                    const msgs: ChatMessage[] = convo.map((m, idx) => ({
                      id: `history-${chat.id}-${idx}`,
                      role: m.role,
                      text: m.text,
                      timestamp: new Date(),
                    }));
                    setMessages(msgs);
                    // Reset any active flows
                    setClarificationMode(false);
                    setWorkflowClarificationMode(false);
                    setIsTyping(false);
                    setThinkingSteps([]);
                    clearTimers();
                  }
                }}
              >
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-md bg-primary/5 flex items-center justify-center shrink-0 mt-0.5">
                    <MessageSquare size={12} className="text-primary/60" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[13px] font-medium text-text truncate group-hover:text-primary transition-colors">{chat.title}</div>
                    <div className="text-[11px] text-text-muted truncate mt-0.5">{chat.preview}</div>
                    <div className="text-[10px] text-text-muted/60 mt-1">{chat.timestamp}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  /* ────────────────────── EMPTY STATE ────────────────────── */
  if (isEmpty) {
    return (
      <div style={{ display: 'flex', height: '100%', width: '100%' }}>
        {chatHistoryPanel}

        <div style={{
          flex: '1 1 0%',
          minWidth: 0,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: '#f8f9fc',
        }}
          className="bg-hero-pattern bg-grid-subtle relative"
        >
          <FloatingLines
            enabledWaves={['top', 'middle', 'bottom']}
            lineCount={5}
            lineDistance={5}
            bendRadius={5}
            bendStrength={-0.5}
            interactive={true}
            parallax={true}
            color="#6a12cd"
            opacity={0.06}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 20px' }} className="relative z-10">
            <button onClick={toggleChatHistory} className="p-2.5 text-text-muted hover:text-text-secondary hover:bg-gray-100 rounded-lg transition-colors cursor-pointer" aria-label="Chat History">
              <History size={18} />
            </button>
            <button className="p-2.5 text-text-muted hover:text-text-secondary hover:bg-gray-100 rounded-lg transition-colors cursor-pointer" aria-label="New Chat">
              <Plus size={18} />
            </button>
          </div>

          <div style={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'auto',
            padding: '0 24px 60px',
          }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              style={{ width: 720, maxWidth: '100%', textAlign: 'center' }}
            >
              <div className="mb-4">
                <AuditifyHelloEffect
                  className="text-primary h-14 mx-auto"
                  speed={0.7}
                />
              </div>

              <h1 style={{ fontSize: 34, fontWeight: 500, letterSpacing: '-0.02em', marginBottom: 8, color: 'rgba(14,11,30,0.85)' }}>
                Audit smarter.{' '}
                <TextShimmer as="span" className="font-bold" duration={3} spread={2}>
                  Not harder.
                </TextShimmer>
              </h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.5, duration: 0.6 }}
                className="text-[15px] text-text-muted mb-10"
              >
                Your AI copilot already knows what to look for. Just ask.
              </motion.p>

              <div className="ai-border ai-glow" style={{ marginBottom: 24 }}>
                <div style={{ position: 'relative', background: 'white', borderRadius: 18 }}>
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={e => { setInput(e.target.value); handleTextareaInput(); }}
                    onKeyDown={handleKeyDown}
                    placeholder="Describe a workflow and let Auditify do the rest"
                    style={{
                      width: '100%', background: 'transparent', border: 'none', outline: 'none',
                      resize: 'none', padding: '20px 20px 56px', fontSize: 15, minHeight: 100,
                      maxHeight: 200, borderRadius: 18, fontFamily: 'inherit', color: '#0e0b1e',
                      boxSizing: 'border-box',
                    }}
                    rows={2}
                  />
                  <div style={{ position: 'absolute', left: 12, bottom: 12, display: 'flex', gap: 4 }}>
                    <button className="p-2 text-text-muted/40 hover:text-primary hover:bg-primary-xlight rounded-lg transition-colors cursor-pointer" aria-label="Voice input">
                      <Mic size={18} />
                    </button>
                    <label className="cursor-pointer p-2 text-text-muted/40 hover:text-primary hover:bg-primary-xlight rounded-lg transition-colors" aria-label="Attach files">
                      <Plus size={18} />
                      <input type="file" multiple className="hidden" onChange={handleFileUpload} />
                    </label>
                  </div>
                  <div style={{ position: 'absolute', right: 12, bottom: 12 }}>
                    <button
                      onClick={handleSend}
                      disabled={!input.trim() && files.length === 0}
                      className="px-5 py-2.5 bg-gradient-to-r from-primary to-primary-medium hover:from-primary-hover hover:to-primary disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-[13px] font-semibold transition-all flex items-center gap-2 shadow-sm cursor-pointer"
                    >
                      <Sparkles size={14} />
                      I'm feeling lucky
                    </button>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 32 }}>
                {QUICK_ACTIONS.map((action, i) => (
                  <motion.button
                    key={action.label}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.08 }}
                    onClick={() => {
                      const text = action.label;
                      setMessages(prev => [...prev, { id: `msg-${Date.now()}`, role: 'user', text, timestamp: new Date() }]);
                      simulateResponse(text);
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-border-light bg-white hover:border-primary/30 hover:shadow-sm transition-all text-[13px] text-text-secondary hover:text-text cursor-pointer"
                  >
                    <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${action.color} flex items-center justify-center`}>
                      <action.icon size={11} className="text-white" />
                    </div>
                    {action.label}
                  </motion.button>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Lightbulb size={13} className="text-primary/60" />
                  <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">AI Recommended</span>
                </div>
                <div className="flex justify-center gap-4">
                  {RECOMMENDED_WORKFLOWS.map((rw, i) => (
                    <motion.div
                      key={rw.label}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 + i * 0.1 }}
                      className="flex-1 max-w-[220px]"
                    >
                      <BorderGlow
                        borderRadius={16}
                        glowRadius={35}
                        glowIntensity={1}
                        coneSpread={30}
                        edgeSensitivity={40}
                        backgroundColor="#ffffff"
                        colors={['#6a12cd', '#9b59d6', '#c084fc']}
                      >
                        <div
                          className="p-4 text-left cursor-pointer group rounded-2xl hover:shadow-sm transition-shadow"
                          onClick={() => {
                            const text = `Build a ${rw.label.toLowerCase()}`;
                            setMessages(prev => [...prev, { id: `msg-${Date.now()}`, role: 'user', text, timestamp: new Date() }]);
                            simulateResponse(text);
                          }}
                        >
                          <div className={`p-2 rounded-lg ${rw.color} w-fit mb-3`}>
                            <rw.icon size={15} />
                          </div>
                          <div className="text-[12.5px] font-semibold text-text group-hover:text-primary transition-colors leading-tight mb-1">{rw.label}</div>
                          <div className="text-[10.5px] text-text-muted leading-snug">{rw.desc}</div>
                          <div className="mt-3 flex items-center gap-1 text-[10px] text-primary/60 group-hover:text-primary transition-colors font-medium">
                            <Sparkles size={9} />
                            Click to build
                          </div>
                        </div>
                      </BorderGlow>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  /* ────────────────────── MESSAGES STATE ────────────────────── */
  return (
    <div className="flex h-full w-full" style={{ flex: '1 1 0%', minWidth: 0 }}>
      {chatHistoryPanel}
      <div className="flex flex-col h-full bg-white" style={{ flex: '1 1 0%', minWidth: 0 }}>
        {/* Top bar */}
        <div className="h-12 border-b border-border-light bg-white/80 backdrop-blur-sm flex items-center justify-between px-4 shrink-0 z-10">
          <div className="flex items-center gap-2">
            <button onClick={toggleChatHistory} className={`p-1.5 rounded-md transition-colors cursor-pointer ${showChatHistory ? 'bg-primary/10 text-primary' : 'text-text-muted hover:text-text-secondary hover:bg-gray-50'}`}>
              <History size={16} />
            </button>
            <span className="text-sm font-medium text-text">Chat</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setMessages([]); setInput(''); setClarificationMode(false); setLiquidFillPercent(0); setShowComponentLoading(false); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-light text-[11px] font-medium text-text-secondary hover:bg-white hover:border-primary/20 transition-all cursor-pointer"
            >
              <Plus size={12} />
              New Chat
            </button>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-primary/10 to-primary-medium/10 text-primary text-[11px] font-semibold">
              <Sparkles size={11} />
              AI Copilot
            </div>
          </div>
        </div>

        {/* Messages */}
        <div
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto"
        >
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
            <AnimatePresence initial={false}>
              {messages.map((msg, msgIdx) => (
                <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className="max-w-[85%]">
                    {msg.role === 'assistant' && !msg.isComponentResult && !msg.richType && (
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-5 h-5 rounded-md bg-gradient-to-br from-primary to-primary-medium flex items-center justify-center">
                          <Sparkles size={10} className="text-white" />
                        </div>
                        <span className="text-[11px] font-semibold text-text-muted">Auditify Copilot</span>
                      </div>
                    )}
                    {msg.role === 'assistant' && msg.thinking && (
                      <div className="mb-2 ml-7">
                        <button onClick={() => setThinkingExpanded(p => !p)} className="flex items-center gap-1.5 text-[11px] text-text-muted hover:text-text-secondary transition-colors cursor-pointer">
                          <ChevronDown size={12} className={`transition-transform ${thinkingExpanded ? '' : '-rotate-90'}`} />
                          <Sparkles size={10} className="text-primary/50" />
                          Thought for {msg.thinking.length} steps
                        </button>
                        <AnimatePresence>
                          {thinkingExpanded && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                              <div className="mt-1.5 pl-3 border-l-2 border-primary/15 space-y-1">
                                {msg.thinking.map((step, i) => (
                                  <div key={i} className="text-[11px] text-text-muted/70 flex items-center gap-1.5">
                                    <div className="w-1 h-1 rounded-full bg-primary/30" />
                                    {step}
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}

                    {/* Rich inline components */}
                    {msg.richType === 'summary-kpi' ? (
                      <div className="ml-7 grid grid-cols-4 gap-2">
                        {((msg.richData?.kpis as { label: string; value: string; color: string }[] | undefined) || [
                          { label: 'Records Scanned', value: '1.2M', color: 'text-text' },
                          { label: 'Risks Found', value: '5', color: 'text-orange-600' },
                          { label: 'Critical', value: '2', color: 'text-red-600' },
                          { label: 'Uncontrolled', value: '2', color: 'text-red-600' },
                        ]).map((kpi, ki) => (
                          <motion.div key={kpi.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: ki * 0.1 }}
                            className="glass-card rounded-xl p-3 text-center"
                          >
                            <div className={`text-lg font-bold ${kpi.color}`}>{kpi.value}</div>
                            <div className="text-[9px] text-text-muted uppercase tracking-wider mt-0.5">{kpi.label}</div>
                          </motion.div>
                        ))}
                      </div>
                    ) : msg.richType === 'threshold-control' ? (
                      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="ml-7">
                        <div className="glass-card rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <SlidersHorizontal size={14} className="text-primary" />
                            <span className="text-[12px] font-semibold text-text">Adjust Parameters</span>
                            <span className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">Interactive</span>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[11px] text-text-secondary">Severity Threshold</span>
                                <span className="text-[11px] font-bold text-primary">High+</span>
                              </div>
                              <div className="h-2 bg-surface-3 rounded-full overflow-hidden">
                                <div className="h-full w-3/4 bg-gradient-to-r from-green-400 via-yellow-400 to-red-500 rounded-full" />
                              </div>
                              <div className="flex justify-between text-[9px] text-text-muted mt-0.5">
                                <span>Low</span><span>Medium</span><span>High</span><span>Critical</span>
                              </div>
                            </div>
                            <div className="flex gap-3">
                              <div className="flex-1 flex items-center justify-between p-2 rounded-lg bg-surface-2">
                                <span className="text-[10px] text-text-secondary">Min Controls</span>
                                <span className="text-[11px] font-bold text-text bg-white px-2 py-0.5 rounded border border-border-light">0</span>
                              </div>
                              <div className="flex-1 flex items-center justify-between p-2 rounded-lg bg-surface-2">
                                <span className="text-[10px] text-text-secondary">Time Range</span>
                                <span className="text-[11px] font-bold text-text bg-white px-2 py-0.5 rounded border border-border-light">90 days</span>
                              </div>
                            </div>
                          </div>
                          <div className="mt-3 flex gap-2">
                            <button className="flex-1 text-[11px] font-semibold text-primary bg-primary/10 hover:bg-primary/20 rounded-lg py-2 transition-colors cursor-pointer">
                              Re-run with filters
                            </button>
                            <button className="text-[11px] font-medium text-text-muted hover:text-text-secondary px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                              Reset
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ) : msg.richType === 'layout-switcher' ? (
                      <LayoutSwitcherCard />
                    ) : msg.richType === 'ui-recommendations' ? (
                      <UIRecommendationsCard onEnhancementsApplied={setWorkflowUiEnhancements} />
                    ) : msg.richType === 'save-workflow' ? (
                      <SaveWorkflowCard />
                    ) : msg.isComponentResult ? (
                      <ComponentLoader delay={0} loaded={true} skeletonHeight={60}>
                        <div className="ml-7 px-4 py-3 rounded-xl border border-primary/10 bg-gradient-to-r from-primary-xlight/50 to-white shadow-sm">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-4 h-4 rounded bg-primary/10 flex items-center justify-center">
                              {msg.componentType === 'plan' && <Sparkles size={9} className="text-primary" />}
                              {msg.componentType === 'code' && <FileText size={9} className="text-primary" />}
                              {msg.componentType === 'sources' && <BarChart3 size={9} className="text-primary" />}
                              {msg.componentType === 'result' && <ShieldCheck size={9} className="text-primary" />}
                            </div>
                            <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                              {msg.componentType}
                            </span>
                          </div>
                          <div className="text-[12px] text-text-secondary leading-relaxed">
                            {msg.text.split('\n').map((line, i) => (
                              <span key={i}>
                                {line.startsWith('**') ? <strong className="text-text">{line.replace(/\*\*/g, '')}</strong> : line}
                                {i < msg.text.split('\n').length - 1 && <br />}
                              </span>
                            ))}
                          </div>
                        </div>
                      </ComponentLoader>
                    ) : msg.text ? (
                      <div className={`px-4 py-3 rounded-2xl text-[13.5px] leading-relaxed ${msg.role === 'user' ? 'bg-gradient-to-r from-primary to-primary-medium text-white rounded-br-sm shadow-md' : 'bg-white border border-border-light text-text rounded-bl-sm shadow-sm ml-7'}`}>
                        {msg.text}
                      </div>
                    ) : null}

                    {/* Clarification option chips — for both query and workflow modes */}
                    {msg.clarificationOptions && msgIdx === messages.length - 1 && (clarificationMode || workflowClarificationMode) && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mt-3 ml-7 flex flex-wrap gap-2"
                      >
                        {msg.clarificationOptions.map((option, i) => (
                          <motion.button
                            key={option}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 + i * 0.08 }}
                            onClick={() => workflowClarificationMode ? handleWorkflowClarificationClick(option) : handleClarificationOptionClick(option)}
                            className="px-3.5 py-2 rounded-xl border border-primary/20 bg-white text-[12px] font-medium text-text-secondary hover:bg-primary-xlight hover:border-primary/40 hover:text-primary transition-all cursor-pointer shadow-sm"
                          >
                            {option}
                          </motion.button>
                        ))}
                      </motion.div>
                    )}

                    {msg.hasArtifact && (
                      <button
                        onClick={() => { setShowArtifacts(true); setArtifactMode(msg.artifactType === 'workflow' ? 'workflow' : 'query'); setActiveArtifactTab('result'); }}
                        className="mt-2 ml-7 flex items-center gap-2 text-[12px] text-primary hover:text-primary-hover font-medium transition-colors group cursor-pointer"
                      >
                        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary/10 to-primary-medium/10 flex items-center justify-center">
                          <Sparkles size={11} className="text-primary" />
                        </div>
                        View {msg.artifactType === 'workflow' ? 'workflow canvas' : 'artifact'}
                        <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    )}

                    {/* AI Recommended Follow-up Questions */}
                    {msg.role === 'assistant' && msg.followUps && msg.followUps.length > 0 && msgIdx === messages.length - 1 && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mt-3 ml-7"
                      >
                        <div className="flex items-center gap-1.5 mb-2">
                          <Lightbulb size={11} className="text-primary/50" />
                          <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Suggested follow-ups</span>
                        </div>
                        <div className="flex flex-col gap-2">
                          {msg.followUps.map((q, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -6 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.4 + i * 0.1 }}
                            >
                              <BorderGlow
                                borderRadius={12}
                                glowRadius={25}
                                glowIntensity={0.9}
                                coneSpread={25}
                                edgeSensitivity={30}
                                backgroundColor="#ffffff"
                                colors={['#6a12cd', '#9b59d6', '#c084fc']}
                              >
                                <div
                                  className="flex items-center gap-2.5 px-3.5 py-2.5 cursor-pointer group rounded-xl"
                                  onClick={() => handleFollowUpClick(q)}
                                >
                                  <div className="w-5 h-5 rounded-md bg-primary/5 flex items-center justify-center shrink-0">
                                    <ArrowRight size={11} className="text-primary/50 group-hover:text-primary transition-colors" />
                                  </div>
                                  <span className="text-[12px] text-text-secondary group-hover:text-text transition-colors">{q}</span>
                                </div>
                              </BorderGlow>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Liquid Fill Graphic — shown during clarification mode */}
            <AnimatePresence>
              {clarificationMode && liquidFillPercent > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex justify-center py-4"
                >
                  <LiquidFillGraphic
                    fillPercent={liquidFillPercent}
                    currentStage={liquidStage}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {isTyping && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
                <div className="max-w-[85%]">
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 mt-0.5">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-medium flex items-center justify-center shadow-sm ai-pulse-ring-infinite">
                        <Sparkles size={14} className="text-white" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 pt-1">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[11px] font-semibold text-primary">Auditify Copilot</span>
                        <span className="text-[10px] text-text-muted">is thinking...</span>
                      </div>

                      {thinkingSteps.length > 0 && (
                        <div className="mb-2">
                          <div className="pl-3 border-l-2 border-primary/20 space-y-1">
                            {thinkingSteps.map((step, i) => (
                              <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="text-[11px] text-text-muted flex items-center gap-1.5">
                                <div className={`w-1.5 h-1.5 rounded-full ${i === thinkingSteps.length - 1 ? 'bg-primary' : 'bg-primary/30'}`} />
                                {step}
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}

                      {thinkingSteps.length === 0 && (
                        <div className="bg-white border border-border-light rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm ai-shimmer">
                          <div className="flex gap-1.5 items-center h-5">
                            <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} className="w-2 h-2 rounded-full bg-primary/30" />
                            <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }} className="w-2 h-2 rounded-full bg-primary/30" />
                            <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }} className="w-2 h-2 rounded-full bg-primary/30" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="shrink-0 px-4 sm:px-6 pb-5 max-w-3xl mx-auto w-full">
          {files.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {files.map((f, i) => (
                <div key={i} className="flex items-center gap-1 bg-primary-light text-primary text-[11px] px-2 py-1 rounded-md font-medium">
                  <FileText size={11} />
                  <span className="truncate max-w-[100px]">{f.name}</span>
                  <button onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))} className="hover:text-primary-hover ml-0.5 cursor-pointer"><X size={10} /></button>
                </div>
              ))}
            </div>
          )}
          <div className="ai-border ai-glow">
            <div className="relative bg-white rounded-[18px]">
              <textarea
                value={input}
                onChange={e => { setInput(e.target.value); handleTextareaInput(); }}
                onKeyDown={handleKeyDown}
                placeholder={clarificationMode ? "Or type your preference..." : "Ask anything or describe a workflow to build..."}
                className="w-full bg-transparent border-none outline-none resize-none py-3.5 pl-4 pr-28 text-[13.5px] text-text placeholder:text-text-muted min-h-[48px] max-h-[160px] rounded-[18px]"
                rows={1}
              />
              <div className="absolute right-2 bottom-2 flex items-center gap-1">
                <label className="cursor-pointer p-2 text-text-muted hover:text-primary hover:bg-primary-xlight rounded-lg transition-colors">
                  <Paperclip size={15} />
                  <input type="file" multiple className="hidden" onChange={handleFileUpload} />
                </label>
                <button onClick={handleSend} disabled={!input.trim() && files.length === 0} className="p-2 bg-gradient-to-r from-primary to-primary-medium hover:from-primary-hover hover:to-primary disabled:from-gray-200 disabled:to-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white rounded-xl transition-all cursor-pointer">
                  <Send size={15} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
