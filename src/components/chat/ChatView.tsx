import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Send, Paperclip, Sparkles, History, X, FileText,
  Workflow, ShieldCheck, BarChart3, Search, ChevronDown,
  MessageSquare, ArrowRight, ArrowRightLeft, Mic, Plus, Lightbulb, Zap,
  SlidersHorizontal, Target, Code2, Database, Save, CheckCircle
} from 'lucide-react';
import { CHAT_HISTORY, CHAT_CONVERSATIONS, CLARIFICATION_STEPS } from '../../data/mockData';
import type { WorkflowTypeId } from '../../data/mockData';
import type { ArtifactTab } from '../../hooks/useAppState';
import { TextShimmer } from '../shared/TextShimmer';
import { AuditifyHelloEffect } from '../shared/HelloEffect';
import BorderGlow from '../shared/BorderGlow';
import FloatingLines from '../shared/FloatingLines';
// Persona removed — Rive WebGL crashes in some browsers
import ClarificationCard from './ClarificationCard';
import AssumptionsPanel from './AssumptionsPanel';
import ProgressiveLoader from './ProgressiveLoader';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  thinking?: string[];
  hasArtifact?: boolean;
  artifactType?: 'workflow' | 'query' | 'report';
  followUps?: string[];
  timestamp: Date;
  // Rich inline components
  richType?: 'summary-kpi' | 'threshold-control' | 'save-workflow-prompt';
  richData?: Record<string, unknown>;
}

interface ChatViewProps {
  showChatHistory: boolean;
  toggleChatHistory: () => void;
  setShowArtifacts: (v: boolean) => void;
  setActiveArtifactTab: (t: ArtifactTab) => void;
  setArtifactMode: (m: 'query' | 'workflow') => void;
  setWorkflowCanvasStage?: (stage: number) => void;
  setWorkflowType?: (type: WorkflowTypeId | null) => void;
  setQueryAssumptions?: (assumptions: string[]) => void;
  initialQuery?: string;
  onInitialQueryProcessed?: () => void;
}

type DetailedQueryType = 'duplicate-invoice' | 'workflow' | 'reconciliation' | 'sox-compliance' | 'vendor-spend' | 'uncontrolled-risks' | 'control-effectiveness' | 'generic';

const classifyDetailedQuery = (msg: string): DetailedQueryType => {
  const lower = msg.toLowerCase();
  // Reconciliation (check before workflow since "build a reconciliation" should match reconciliation)
  if (lower.includes('reconciliation') || lower.includes('three-way') || lower.includes('3-way') || lower.includes('po match')) {
    return 'reconciliation';
  }
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

const DETAILED_QUERY_CONFIG: Record<Exclude<DetailedQueryType, 'duplicate-invoice' | 'workflow' | 'reconciliation'>, {
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
  { icon: ArrowRightLeft, label: 'Run 3-way reconciliation', color: 'from-teal-500 to-emerald-500' },
];

const QUERY_FOLLOWUPS = [
  'Show me the trend over the last 6 months',
  'Which controls can mitigate these risks?',
  'Generate a compliance report from these results',
  'Build a monitoring workflow for these risks',
  'Compare this against last quarter\'s assessment',
];

const RECOMMENDED_WORKFLOWS = [
  { label: 'Three-Way PO Reconciliation', desc: 'Match PO, GRN & Invoice data with freeze options', icon: ArrowRightLeft, color: 'text-teal-600 bg-teal-50' },
  { label: 'Payment Anomaly Detector', desc: 'ML-based unusual payment pattern detection', icon: Zap, color: 'text-orange-600 bg-orange-50' },
  { label: 'Audit Evidence Collector', desc: 'Auto-gather evidence for control testing', icon: BarChart3, color: 'text-green-600 bg-green-50' },
];

const LOADING_STEPS = [
  { label: 'Generating execution plan...', title: 'Execution Plan', content: '5-step query plan: Ingest → Normalize → Match → Score → Flag', icon: Target, type: 'plan' as const },
  { label: 'Writing SQL query...', title: 'Generated Query', content: 'SELECT inv.*, similarity_score(...) AS match_pct FROM invoices inv JOIN ...', icon: Code2, type: 'code' as const },
  { label: 'Connecting data sources...', title: 'Data Sources', content: 'SAP ERP AP Module (1.2M rows), Vendor Master (892), Invoice Archive (4,521)', icon: Database, type: 'sources' as const },
  { label: 'Processing 1.2M records...', title: 'Results', content: '8 potential duplicates found totaling ₹6.16L. Highest match: 96%', icon: BarChart3, type: 'result' as const },
];

const WORKFLOW_TYPE_NAMES: Record<WorkflowTypeId, string> = {
  reconciliation: 'Three-Way Reconciliation',
  detection: 'Duplicate Detection',
  monitoring: 'Vendor Master Monitoring',
  compliance: 'Segregation of Duties Compliance',
};

const detectWorkflowType = (msg: string): WorkflowTypeId => {
  const lower = msg.toLowerCase();
  if (lower.includes('reconciliation') || lower.includes('3-way') || lower.includes('po match')) return 'reconciliation';
  if (lower.includes('duplicate') || lower.includes('detection')) return 'detection';
  if (lower.includes('monitor') || lower.includes('vendor master') || lower.includes('change')) return 'monitoring';
  if (lower.includes('sod') || lower.includes('segregation') || lower.includes('compliance')) return 'compliance';
  return 'detection';
};

function SaveWorkflowButton() {
  const [saved, setSaved] = useState(false);
  if (saved) {
    return (
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="flex items-center gap-1.5 px-3 py-2 bg-green-50 text-green-600 rounded-lg text-[11px] font-semibold">
        <CheckCircle size={12} /> Saved to Library
      </motion.div>
    );
  }
  return (
    <button onClick={() => setSaved(true)} className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-[11px] font-semibold transition-colors cursor-pointer">
      <Save size={12} /> Save to Library
    </button>
  );
}

export default function ChatView({ showChatHistory, toggleChatHistory, setShowArtifacts, setActiveArtifactTab, setArtifactMode, setWorkflowType, setQueryAssumptions, initialQuery, onInitialQueryProcessed }: ChatViewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [thinkingSteps, setThinkingSteps] = useState<string[]>([]);
  const [thinkingExpanded, setThinkingExpanded] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const processingRef = useRef(false);

  // New flow state
  const [showClarificationCard, setShowClarificationCard] = useState(false);
  const [clarificationQuestions, setClarificationQuestions] = useState<Array<{ question: string; options: string[] }>>([]);
  const [showAssumptions, setShowAssumptions] = useState(false);
  const [currentAssumptions, setCurrentAssumptions] = useState<string[]>([]);
  const [clarificationAnswers, setClarificationAnswers] = useState<Record<number, string>>({});
  const [showProgressiveLoader, setShowProgressiveLoader] = useState(false);

  // Workflow build flow state
  const [workflowBuildPhase, setWorkflowBuildPhase] = useState(0); // 0=idle, 1=asking-files, 2=asking-logic, 3=confirming, 4=input-config, 5=freeze-confirm, 6=output-config, 7=save
  const [currentWorkflowType, setCurrentWorkflowType] = useState<WorkflowTypeId | null>(null);

  // Track which query flow triggered the progressive loader
  const activeQueryFlowRef = useRef<'duplicate-invoice' | 'other' | null>(null);
  const activeQueryConfigRef = useRef<typeof DETAILED_QUERY_CONFIG['sox-compliance'] | null>(null);

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
  }, [messages, isTyping, thinkingSteps, showClarificationCard, showAssumptions, showProgressiveLoader]);

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

  // ─── Query Clarification Complete Handler ───
  const handleQueryClarificationComplete = (answers: Record<number, string>) => {
    setClarificationAnswers(answers);

    // Add summary message
    const answerEntries = Object.entries(answers);
    if (answerEntries.length > 0) {
      const summaryLines = answerEntries.map(([, value]) => `• ${value}`).join('\n');
      setMessages(prev => [...prev, {
        id: `msg-clarification-summary-${Date.now()}`,
        role: 'assistant',
        text: `Got it! Here's what I'll use:\n\n${summaryLines}`,
        timestamp: new Date(),
      }]);
    }

    // Generate assumptions
    const assumptions = [
      'Excluding voided invoices',
      'Currency conversion at booking rate',
      'Looking back 12 months for duplicates',
      'Results sorted by match score (descending)',
    ];
    setCurrentAssumptions(assumptions);
    setQueryAssumptions?.(assumptions);
    setShowAssumptions(true);
  };

  // ─── Workflow Clarification Complete Handler ───
  const handleWorkflowClarificationComplete = (answers: Record<number, string>) => {
    setShowClarificationCard(false);

    if (workflowBuildPhase === 1) {
      // Phase 1 complete — summarize and move to Phase 2 (logic)
      const format = answers[0] || 'Mixed sources';
      const count = answers[1] || '3+ sources';
      setMessages(prev => [...prev, {
        id: `msg-wf-files-summary-${Date.now()}`,
        role: 'assistant',
        text: `Got it — **${format}** with **${count}**. Now let me understand the matching logic.`,
        timestamp: new Date(),
      }]);
      setWorkflowBuildPhase(2);

      // Show logic clarification card after brief delay
      schedule(() => {
        setClarificationQuestions([
          { question: 'What matching logic should I use?', options: ['Exact field matching', 'Fuzzy match with tolerance', 'AI-powered pattern detection', 'Custom rules (I\'ll define)'] },
          { question: 'What should happen with mismatches?', options: ['Flag for manual review', 'Auto-reject and notify', 'Quarantine for investigation', 'Score and prioritize'] },
        ]);
        setShowClarificationCard(true);
      }, 800);
    }
    else if (workflowBuildPhase === 2) {
      // Phase 2 complete — summarize and wait for user confirmation before opening canvas
      const logic = answers[0] || 'Fuzzy match';
      const action = answers[1] || 'Flag for review';
      setMessages(prev => [...prev, {
        id: `msg-wf-logic-summary-${Date.now()}`,
        role: 'assistant',
        text: `Perfect — **${logic}** with **${action}** for mismatches.\n\nHere's what I'll build:\n\n• **Data sources:** Mixed format (SQL + file upload)\n• **Matching:** ${logic}\n• **Mismatches:** ${action}\n\nShall I open the workflow canvas and configure the inputs? Type **"go"** or **"looks good"** to proceed.`,
        timestamp: new Date(),
        followUps: ['Looks good, build it', 'Change the matching logic', 'Add more data sources'],
      }]);
      setWorkflowBuildPhase(3);
    }
  };

  // ─── Clarification Card Complete Router ───
  const handleClarificationCardComplete = (answers: Record<number, string>) => {
    setShowClarificationCard(false);
    setClarificationAnswers(answers);

    if (workflowBuildPhase > 0) {
      handleWorkflowClarificationComplete(answers);
    } else {
      handleQueryClarificationComplete(answers);
    }
  };

  // ─── Assumptions Confirmed Handler ───
  const handleAssumptionsConfirmed = () => {
    setShowAssumptions(false);
    activeQueryFlowRef.current = 'duplicate-invoice';

    // Add starting message
    setMessages(prev => [...prev, {
      id: `msg-starting-analysis-${Date.now()}`,
      role: 'assistant',
      text: "Starting analysis...",
      timestamp: new Date(),
    }]);

    // Show progressive loader
    setShowProgressiveLoader(true);

    // Open artifact panel in query mode
    setArtifactMode('query');
    setShowArtifacts(true);
    setActiveArtifactTab('plan');
  };

  // ─── Progressive Loading Complete Handler ───
  const handleProgressiveLoadingComplete = () => {
    setShowProgressiveLoader(false);
    setActiveArtifactTab('result');

    if (activeQueryFlowRef.current === 'other' && activeQueryConfigRef.current) {
      // "Other query type" flow — show type-specific KPIs and follow-ups
      const config = activeQueryConfigRef.current;
      setMessages(prev => [...prev, {
        id: `msg-result-kpi-${Date.now()}`,
        role: 'assistant',
        text: '',
        timestamp: new Date(),
        richType: 'summary-kpi',
        richData: { kpis: config.kpis },
      }]);

      schedule(() => {
        setMessages(prev => [...prev, {
          id: `msg-insights-${Date.now()}`,
          role: 'assistant',
          text: config.insightsText,
          hasArtifact: true,
          artifactType: 'query',
          timestamp: new Date(),
        }]);
      }, 600);

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
      }, 1100);

      activeQueryFlowRef.current = null;
      activeQueryConfigRef.current = null;
    } else {
      // Duplicate-invoice flow — original behavior
      const shuffled = [...QUERY_FOLLOWUPS].sort(() => Math.random() - 0.5);
      setMessages(prev => [...prev, {
        id: `msg-final-result-${Date.now()}`,
        role: 'assistant',
        text: "Analysis complete! I've identified 8 potential duplicate invoices across your vendor payments. The artifact panel shows the full execution plan, SQL query, data sources, and detailed results table with match scores.",
        hasArtifact: true,
        artifactType: 'query',
        followUps: shuffled.slice(0, 3),
        timestamp: new Date(),
      }]);
      activeQueryFlowRef.current = null;
    }
  };

  // ─── Query Clarification Flow (duplicate-invoice) ───
  const startQueryClarificationFlow = () => {
    clearTimers();
    setIsTyping(true);
    setThinkingSteps([]);

    // Brief thinking animation
    schedule(() => {
      setIsTyping(false);
      // Add ambiguity message
      setMessages(prev => [...prev, {
        id: `msg-ambiguity-${Date.now()}`,
        role: 'assistant',
        text: "Identified ambiguity in your query. A few quick questions before I dive in:",
        timestamp: new Date(),
      }]);

      // Set clarification questions from CLARIFICATION_STEPS
      const questions = CLARIFICATION_STEPS.map(step => ({
        question: step.question,
        options: step.options,
      }));
      setClarificationQuestions(questions);
      setShowClarificationCard(true);
    }, 1000);
  };

  // ─── Conversational Workflow Flow ───
  const startConversationalWorkflowFlow = (userMsg: string) => {
    clearTimers();
    const wfType = detectWorkflowType(userMsg);
    const wfName = WORKFLOW_TYPE_NAMES[wfType];
    setCurrentWorkflowType(wfType);
    setWorkflowBuildPhase(1);

    // Brief thinking animation
    setIsTyping(true);
    schedule(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: `msg-wf-intro-${Date.now()}`,
        role: 'assistant',
        text: `Great, I'll help you build a **${wfName}** workflow. Let me understand your data sources first.`,
        timestamp: new Date(),
      }]);
      // Show file type clarification card
      setClarificationQuestions([
        { question: 'What data format are your source files?', options: ['CSV / Excel upload', 'Direct SQL connection', 'User uploads in chat', 'Mixed (SQL + file upload)'] },
        { question: 'How many data sources will this workflow need?', options: ['1 source (single file)', '2 sources (input + reference)', '3+ sources (multi-way match)', 'Not sure \u2014 recommend for me'] },
      ]);
      setShowClarificationCard(true);
    }, 1200);
  };

  // ─── Open Canvas After User Confirms (workflow phase 3) ───
  const openCanvasAfterConfirmation = () => {
    setIsTyping(true);
    schedule(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: `msg-wf-opening-canvas-${Date.now()}`,
        role: 'assistant',
        text: `Setting up your workflow canvas now...`,
        timestamp: new Date(),
      }]);
    }, 600);

    schedule(() => {
      setArtifactMode('workflow');
      setWorkflowType?.(currentWorkflowType);
      setShowArtifacts(true);
    }, 1200);

    schedule(() => {
      setMessages(prev => [...prev, {
        id: `msg-wf-canvas-ready-${Date.now()}`,
        role: 'assistant',
        text: `I've configured the input sources based on your selections. Review and customize the input configuration in the canvas.\n\nTake your time — click **'Confirm Inputs'** when ready.`,
        timestamp: new Date(),
      }]);
      setWorkflowBuildPhase(4);
    }, 2500);

    // Tip messages
    const freezeHintId = 'msg-wf-freeze-hint';
    schedule(() => {
      setMessages(prev => {
        if (prev.some(m => m.id === freezeHintId)) return prev;
        return [...prev, {
          id: freezeHintId,
          role: 'assistant' as const,
          text: `**Tip:** I've frozen the **Vendor Master Data** by default (last refreshed Mar 20). Toggle freeze on any other source that doesn't change between runs.`,
          timestamp: new Date(),
        }];
      });
    }, 8000);

    schedule(() => {
      setMessages(prev => {
        if (prev.some(m => m.id === 'msg-wf-save-prompt')) return prev;
        return [...prev, {
          id: 'msg-wf-save-prompt',
          role: 'assistant' as const,
          text: '',
          richType: 'save-workflow-prompt',
          timestamp: new Date(),
        }];
      });
    }, 20000);
  };

  const simulateResponse = (userMsg: string) => {
    clearTimers();

    // If workflow is awaiting user confirmation (phase 3), any positive reply opens canvas
    if (workflowBuildPhase === 3) {
      openCanvasAfterConfirmation();
      return;
    }

    const detailedType = classifyDetailedQuery(userMsg);

    // Reconciliation queries → workflow flow
    if (detailedType === 'reconciliation') {
      startConversationalWorkflowFlow(userMsg);
      return;
    }

    // Workflow queries → workflow flow
    if (detailedType === 'workflow') {
      startConversationalWorkflowFlow(userMsg);
      return;
    }

    // Duplicate invoice query → query clarification flow
    if (detailedType === 'duplicate-invoice') {
      startQueryClarificationFlow();
      return;
    }

    // All other query types — thinking steps → progressive loading (Plan → Code → Sources → Result)
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

    // After thinking completes — show response + start progressive loading
    schedule(() => {
      setMessages(prev => [...prev, {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        text: config.responseText,
        timestamp: new Date(),
        thinking: [...thinkingList],
      }]);
      setIsTyping(false);
      setThinkingSteps([]);

      // Store config so handleProgressiveLoadingComplete can use type-specific data
      activeQueryFlowRef.current = 'other';
      activeQueryConfigRef.current = config;

      // Start progressive loading — loader in chat drives tab switching via onTabClick
      setShowProgressiveLoader(true);

      // Open artifact panel with plan tab first
      setArtifactMode('query');
      setShowArtifacts(true);
      setActiveArtifactTab('plan');
    }, totalThinkingTime);
    // ProgressiveLoader will fire onComplete → handleProgressiveLoadingComplete handles the rest
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
                    setShowClarificationCard(false);
                    setShowAssumptions(false);
                    setShowProgressiveLoader(false);
                    setIsTyping(false);
                    setThinkingSteps([]);
                    setWorkflowBuildPhase(0);
                    setCurrentWorkflowType(null);
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
              onClick={() => { setMessages([]); setInput(''); setShowClarificationCard(false); setShowAssumptions(false); setShowProgressiveLoader(false); setWorkflowBuildPhase(0); setCurrentWorkflowType(null); clearTimers(); }}
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
                    {msg.role === 'assistant' && !msg.richType && (
                      <div className="mb-1.5 font-mono text-[11px] text-ink-500 tabular-nums">
                        IRA · responding
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
                    ) : msg.richType === 'save-workflow-prompt' ? (
                      <div className="ml-12 mt-1">
                        <div className="glass-card rounded-xl p-4 border border-primary/10 max-w-md">
                          <div className="flex items-center gap-2 mb-2">
                            <Save size={13} className="text-primary" />
                            <span className="text-[12px] font-semibold text-text">Save Workflow</span>
                          </div>
                          <p className="text-[11px] text-text-muted mb-3">Ready to save this workflow to your library for recurring use?</p>
                          <div className="flex gap-2">
                            <SaveWorkflowButton />
                            <button className="px-3 py-2 text-[11px] font-medium text-text-muted hover:text-text-secondary hover:bg-surface-2 rounded-lg transition-colors cursor-pointer">
                              Continue editing
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : msg.text ? (
                      msg.role === 'user' ? (
                        <div className="px-4 py-3 rounded-2xl rounded-br-sm bg-brand-600 text-white text-[13.5px] leading-relaxed">
                          {msg.text}
                        </div>
                      ) : (
                        // Editorial: AI response is prose, not a bubble. No border, no shadow, no avatar gutter.
                        <div className="text-[15px] leading-[1.65] text-ink-800 max-w-[66ch]">
                          {msg.text}
                        </div>
                      )
                    ) : null}

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

            {/* Thinking animation */}
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
                        <div className="inline-flex items-center gap-1.5 px-1 py-2">
                          <div className="flex gap-1.5 items-center h-5">
                            <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} className="w-1.5 h-1.5 rounded-full bg-brand-400" />
                            <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }} className="w-1.5 h-1.5 rounded-full bg-brand-400" />
                            <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }} className="w-1.5 h-1.5 rounded-full bg-brand-400" />
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

          {/* Clarification Card — moved to input area */}

          {/* Assumptions Panel */}
          <AnimatePresence>
            {showAssumptions && (
              <div className="px-6 pb-4">
                <AssumptionsPanel
                  answers={clarificationAnswers}
                  assumptions={currentAssumptions}
                  onConfirm={handleAssumptionsConfirmed}
                />
              </div>
            )}
          </AnimatePresence>

          {/* Progressive Loader */}
          <AnimatePresence>
            {showProgressiveLoader && (
              <div className="px-6 pb-4">
                <ProgressiveLoader
                  steps={LOADING_STEPS}
                  onComplete={handleProgressiveLoadingComplete}
                  onTabClick={(tab) => setActiveArtifactTab(tab as ArtifactTab)}
                />
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Input area — clarification card sits on top, connected */}
        <div className="shrink-0 px-4 sm:px-6 pb-5 max-w-3xl mx-auto w-full">
          {/* Clarification Card — joined to input box */}
          <AnimatePresence>
            {showClarificationCard && (
              <div className="mb-0">
                <ClarificationCard
                  questions={clarificationQuestions}
                  onComplete={handleClarificationCardComplete}
                  onSkipAll={() => {
                    setShowClarificationCard(false);
                    if (workflowBuildPhase > 0) {
                      handleWorkflowClarificationComplete({});
                    } else {
                      handleQueryClarificationComplete({});
                    }
                  }}
                />
              </div>
            )}
          </AnimatePresence>
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
                placeholder="Ask anything or describe a workflow to build..."
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
