// ─── Business Processes ───
export const BUSINESS_PROCESSES = [
  { id: "p2p", name: "Procure to Pay", abbr: "P2P", color: "#6a12cd", risks: 9, controls: 24, coverage: 72, sops: 2, workflows: 5 },
  { id: "o2c", name: "Order to Cash", abbr: "O2C", color: "#0284c7", risks: 7, controls: 18, coverage: 58, sops: 1, workflows: 3 },
  { id: "s2c", name: "Source to Contract", abbr: "S2C", color: "#059669", risks: 5, controls: 14, coverage: 40, sops: 0, workflows: 4 },
  { id: "r2r", name: "Record to Report", abbr: "R2R", color: "#d97706", risks: 11, controls: 31, coverage: 85, sops: 3, workflows: 7 },
];

// ─── SOPs ───
export const SOPS = [
  { id: "sop-001", bpId: "p2p", name: "Vendor Payment SOP", version: "v2.1", by: "Tushar Goel", at: "Mar 10, 2026", racmId: "RACM-001", risks: 9, controls: 24, status: "processed" },
  { id: "sop-002", bpId: "p2p", name: "Purchase Order SOP", version: "v1.3", by: "Deepak Bansal", at: "Feb 5, 2026", racmId: "RACM-002", risks: 6, controls: 18, status: "processed" },
  { id: "sop-003", bpId: "o2c", name: "Invoice Management SOP", version: "v1.0", by: "Neha Joshi", at: "Jan 20, 2026", racmId: "RACM-003", risks: 7, controls: 18, status: "processed" },
  { id: "sop-004", bpId: "r2r", name: "Financial Close SOP", version: "v3.0", by: "Karan Mehta", at: "Dec 15, 2025", racmId: "RACM-004", risks: 11, controls: 31, status: "processed" },
  { id: "sop-005", bpId: "r2r", name: "GL Reconciliation SOP", version: "v1.2", by: "Sneha Desai", at: "Jan 10, 2026", racmId: "RACM-005", risks: 5, controls: 15, status: "processed" },
];

// ─── RACMs ───
export const RACMS = [
  { id: "RACM-001", bpId: "p2p", name: "FY26 P2P — Vendor Payment", fw: "SOX", status: "active", owner: "Tushar Goel", lastRun: "Mar 18, 2026", sopId: "sop-001" },
  { id: "RACM-002", bpId: "p2p", name: "FY26 P2P — Purchase Order", fw: "Internal", status: "draft", owner: "Deepak Bansal", lastRun: "Mar 5, 2026", sopId: "sop-002" },
  { id: "RACM-003", bpId: "o2c", name: "FY26 O2C — Invoice Mgmt", fw: "Key Control", status: "active", owner: "Neha Joshi", lastRun: "Mar 20, 2026", sopId: "sop-003" },
  { id: "RACM-004", bpId: "r2r", name: "FY26 R2R — Financial Close", fw: "SOX", status: "active", owner: "Karan Mehta", lastRun: "Mar 15, 2026", sopId: "sop-004" },
  { id: "RACM-005", bpId: "r2r", name: "FY26 R2R — GL Reconciliation", fw: "ITGC", status: "active", owner: "Sneha Desai", lastRun: "Feb 28, 2026", sopId: "sop-005" },
  { id: "RACM-006", bpId: "s2c", name: "FY26 S2C — Contract Review", fw: "Internal", status: "draft", owner: "Rohan Patel", lastRun: "—", sopId: null },
];

// ─── Risks ───
export const RISKS = [
  { id: "RSK-001", name: "Unauthorized vendor payments processed without approval", ctls: 3, keyCtls: 1, lastUpdated: "Mar 18, 2026", severity: "high", bpId: "p2p", status: "open" },
  { id: "RSK-002", name: "Duplicate invoices leading to overpayment", ctls: 4, keyCtls: 2, lastUpdated: "Mar 15, 2026", severity: "high", bpId: "p2p", status: "mitigated" },
  { id: "RSK-003", name: "Vendor master data manipulation by unauthorized users", ctls: 2, keyCtls: 1, lastUpdated: "Mar 10, 2026", severity: "medium", bpId: "p2p", status: "open" },
  { id: "RSK-004", name: "Fictitious vendor registration bypassing approval", ctls: 0, keyCtls: 0, lastUpdated: null, severity: "critical", bpId: "p2p", status: "open" },
  { id: "RSK-005", name: "Unauthorized changes to payment terms", ctls: 1, keyCtls: 0, lastUpdated: "Feb 20, 2026", severity: "medium", bpId: "p2p", status: "mitigated" },
  { id: "RSK-006", name: "Late payment causing contractual penalty exposure", ctls: 2, keyCtls: 0, lastUpdated: "Feb 15, 2026", severity: "low", bpId: "o2c", status: "mitigated" },
  { id: "RSK-007", name: "Malware infection via vendor portals", ctls: 0, keyCtls: 0, lastUpdated: null, severity: "high", bpId: "s2c", status: "open" },
  { id: "RSK-008", name: "Segregation of duties violation in Accounts Payable", ctls: 3, keyCtls: 1, lastUpdated: "Jan 30, 2026", severity: "critical", bpId: "p2p", status: "open" },
  { id: "RSK-009", name: "Third-party vendor access without proper controls", ctls: 0, keyCtls: 0, lastUpdated: null, severity: "high", bpId: "s2c", status: "open" },
  { id: "RSK-010", name: "Revenue recognition timing manipulation", ctls: 2, keyCtls: 1, lastUpdated: "Mar 19, 2026", severity: "high", bpId: "o2c", status: "open" },
  { id: "RSK-011", name: "Incorrect period-end journal entries", ctls: 3, keyCtls: 2, lastUpdated: "Mar 17, 2026", severity: "medium", bpId: "r2r", status: "mitigated" },
  { id: "RSK-012", name: "GL balance discrepancy across subsidiaries", ctls: 2, keyCtls: 1, lastUpdated: "Feb 28, 2026", severity: "high", bpId: "r2r", status: "open" },
];

// ─── Controls ───
export const CONTROLS = [
  { id: "CTR-001", name: "Three-way PO/GRN/Invoice matching", desc: "System-enforced matching before payment release", isKey: true, riskId: "RSK-001", status: "effective" },
  { id: "CTR-002", name: "Dual approval for payments above threshold", desc: "Two-level manager approval for payments > 10L", isKey: true, riskId: "RSK-001", status: "effective" },
  { id: "CTR-003", name: "Vendor master change notification", desc: "Email alerts to finance head on any vendor master update", isKey: false, riskId: "RSK-003", status: "effective" },
  { id: "CTR-004", name: "Privileged Access Review", desc: "Quarterly review of all AP module access rights", isKey: false, riskId: "RSK-008", status: "ineffective" },
  { id: "CTR-005", name: "Duplicate invoice detection workflow", desc: "Automated duplicate detection before payment processing", isKey: true, riskId: "RSK-002", status: "effective" },
  { id: "CTR-006", name: "SOD violation detector real-time", desc: "Real-time segregation of duties conflict checker", isKey: false, riskId: "RSK-008", status: "not-tested" },
  { id: "CTR-007", name: "Revenue recognition compliance check", desc: "Automated check against ASC 606 criteria", isKey: true, riskId: "RSK-010", status: "effective" },
  { id: "CTR-008", name: "Journal entry anomaly detector", desc: "AI-powered anomaly detection on journal entries", isKey: true, riskId: "RSK-011", status: "effective" },
];

// ─── Engagements ───
export const ENGAGEMENTS = [
  { id: "eng-001", name: "FY26 SOX Audit", type: "SOX", status: "active", bps: ["p2p", "o2c", "r2r"], owner: "Karan Mehta", start: "Jan 1, 2026", end: "Mar 31, 2026", controls: 24, tested: 14, effective: 11, deficiencies: 2 },
  { id: "eng-002", name: "FY26 IFC Assessment", type: "IFC", status: "draft", bps: ["p2p", "s2c"], owner: "Sneha Desai", start: "Apr 1, 2026", end: "Jun 30, 2026", controls: 18, tested: 0, effective: 0, deficiencies: 0 },
  { id: "eng-003", name: "FY25 SOX Audit", type: "SOX", status: "complete", bps: ["p2p", "o2c", "s2c", "r2r"], owner: "Abhinav S", start: "Jan 1, 2025", end: "Mar 31, 2025", controls: 38, tested: 38, effective: 34, deficiencies: 4 },
];

// ─── Engagement Controls (Audit Execution) ───
export const ENGAGEMENT_CONTROLS = [
  { id: "ec-001", engId: "eng-001", racm: "P2P Vendor Payment", risk: "Unauthorized vendor payments", control: "Three-way PO/GRN/Invoice matching", isKey: true, assignee: "Tushar Goel", wt: "effective", de: "effective", oe: "in-progress", evidence: 3 },
  { id: "ec-002", engId: "eng-001", racm: "P2P Vendor Payment", risk: "Duplicate payments", control: "Duplicate invoice detection workflow", isKey: true, assignee: "Deepak Bansal", wt: "effective", de: "effective", oe: "effective", evidence: 5 },
  { id: "ec-003", engId: "eng-001", racm: "P2P Purchase Order", risk: "Unauthorized PO creation", control: "PO dual sign-off approval workflow", isKey: false, assignee: "Neha Joshi", wt: "effective", de: "effective", oe: "not-started", evidence: 0 },
  { id: "ec-004", engId: "eng-001", racm: "O2C Invoice Mgmt", risk: "Revenue recognition timing", control: "Revenue recognition compliance check", isKey: true, assignee: "Karan Mehta", wt: "in-progress", de: "not-started", oe: "not-started", evidence: 1 },
  { id: "ec-005", engId: "eng-001", racm: "O2C Invoice Mgmt", risk: "Credit limit breach", control: "Automated credit limit monitoring", isKey: false, assignee: "Sneha Desai", wt: "effective", de: "ineffective", oe: "not-started", evidence: 2 },
  { id: "ec-006", engId: "eng-001", racm: "R2R Financial Close", risk: "Incorrect period-end entries", control: "Journal entry management review", isKey: true, assignee: "Rohan Patel", wt: "effective", de: "effective", oe: "effective", evidence: 4 },
  { id: "ec-007", engId: "eng-001", racm: "R2R Financial Close", risk: "GL balance discrepancy", control: "GL reconciliation — monthly auto", isKey: true, assignee: "Priya Singh", wt: "effective", de: "effective", oe: "in-progress", evidence: 2 },
  { id: "ec-008", engId: "eng-001", racm: "P2P Vendor Payment", risk: "SOD violation in AP", control: "SOD violation detector real-time", isKey: false, assignee: "Tushar Goel", wt: "not-started", de: "not-started", oe: "not-started", evidence: 0 },
];

// ─── Deficiencies ───
export const DEFICIENCIES = [
  { id: "def-001", finding: "Automated credit limit monitoring failed for 3 high-value customers in Q4 FY26", severity: "SD", control: "Automated credit limit monitoring", assignee: "Sneha Desai", status: "open", due: "Apr 15, 2026" },
  { id: "def-002", finding: "Journal entry approval override used 7 times without adequate documentation during Dec 2025", severity: "MW", control: "Journal entry management review", assignee: "Rohan Patel", status: "in-progress", due: "Mar 31, 2026" },
  { id: "def-003", finding: "SOD violation identified between AP entry and payment approval roles for 2 users", severity: "CD", control: "SOD violation detector real-time", assignee: "Karan Mehta", status: "resolved", due: "Feb 28, 2026" },
];

// ─── Workflows (Pre-built) ───
export const WORKFLOWS = [
  { id: "wf-001", name: "Duplicate Invoice Detector", desc: "Scans incoming invoices against historical data to flag potential duplicates before payment processing", bpId: "p2p", type: "Detection", lastRun: "Mar 18, 2026", runs: 12, status: "active", steps: ["Ingest invoice data", "Normalize fields", "Fuzzy match against history", "Score duplicates", "Flag & notify AP team"] },
  { id: "wf-002", name: "Vendor Master Change Monitor", desc: "Monitors all changes to vendor master data and alerts compliance team of unauthorized modifications", bpId: "p2p", type: "Monitoring", lastRun: "Mar 20, 2026", runs: 8, status: "active", steps: ["Listen to change events", "Classify change type", "Check authorization", "Generate alert", "Log audit trail"] },
  { id: "wf-003", name: "High-Value Payment Flagging", desc: "Automatically flags payments exceeding threshold amounts for additional review", bpId: "p2p", type: "Detection", lastRun: "Mar 12, 2026", runs: 6, status: "active", steps: ["Monitor payment queue", "Apply threshold rules", "Enrich with vendor data", "Route for approval", "Release or hold"] },
  { id: "wf-004", name: "Revenue Recognition Checker", desc: "Validates revenue recognition against ASC 606 criteria for compliance", bpId: "o2c", type: "Compliance", lastRun: "Mar 19, 2026", runs: 4, status: "active", steps: ["Extract revenue entries", "Map to ASC 606 criteria", "Validate timing", "Check completeness", "Generate compliance report"] },
  { id: "wf-005", name: "Journal Entry Anomaly Detector", desc: "Uses AI/ML to detect unusual journal entry patterns that may indicate fraud or errors", bpId: "r2r", type: "Detection", lastRun: "Mar 17, 2026", runs: 22, status: "active", steps: ["Collect journal entries", "Feature extraction", "Run anomaly model", "Score entries", "Alert reviewers"] },
  { id: "wf-006", name: "Contract Expiry Alert", desc: "Tracks contract expiration dates and sends proactive alerts to stakeholders", bpId: "s2c", type: "Monitoring", lastRun: "Mar 5, 2026", runs: 3, status: "active", steps: ["Scan contract database", "Calculate days to expiry", "Apply alert rules", "Notify stakeholders", "Log actions"] },
  { id: "wf-007", name: "Three-Way PO Match", desc: "Automated matching of Purchase Order, Goods Receipt Note, and Invoice for payment validation", bpId: "p2p", type: "Reconciliation", lastRun: "Mar 15, 2026", runs: 45, status: "active", steps: ["Fetch PO details", "Match GRN", "Match Invoice", "Validate tolerances", "Auto-approve or escalate"] },
  { id: "wf-008", name: "SOD Violation Detector", desc: "Real-time segregation of duties conflict detection across all business processes", bpId: "p2p", type: "Compliance", lastRun: "Mar 1, 2026", runs: 15, status: "active", steps: ["Load role matrix", "Map user permissions", "Detect conflicts", "Assess risk level", "Generate violation report"] },
];

// ─── Report Templates ───
export const REPORT_TEMPLATES = [
  { id: "rt-001", name: "SOX Compliance Report", desc: "Comprehensive SOX compliance status with control testing results", category: "Compliance", icon: "shield", sections: [
    { name: 'Executive Summary', icon: 'file-text' },
    { name: 'Scope & Objectives', icon: 'file-text' },
    { name: 'Control Testing Results', icon: 'check-circle' },
    { name: 'Deficiency Analysis', icon: 'alert-triangle' },
    { name: 'Remediation Status', icon: 'shield' },
    { name: 'Appendix', icon: 'file-text' },
  ]},
  { id: "rt-002", name: "Risk Assessment Summary", desc: "Overview of all identified risks, their ratings, and mitigation status", category: "Risk", icon: "alert-triangle", sections: [
    { name: 'Executive Summary', icon: 'file-text' },
    { name: 'Risk Identification', icon: 'alert-triangle' },
    { name: 'Risk Matrix', icon: 'shield' },
    { name: 'Mitigation Strategies', icon: 'check-circle' },
    { name: 'Trend Analysis', icon: 'trending-up' },
    { name: 'Recommendations', icon: 'file-text' },
  ]},
  { id: "rt-003", name: "Control Effectiveness Report", desc: "Detailed analysis of control effectiveness across all business processes", category: "Controls", icon: "check-circle", sections: [
    { name: 'Executive Summary', icon: 'file-text' },
    { name: 'Control Environment Overview', icon: 'shield' },
    { name: 'Testing Methodology', icon: 'file-text' },
    { name: 'Effectiveness Ratings', icon: 'check-circle' },
    { name: 'Gap Analysis', icon: 'alert-triangle' },
    { name: 'Improvement Plan', icon: 'trending-up' },
  ]},
  { id: "rt-004", name: "Workflow Analytics Report", desc: "Performance metrics and insights from automated workflow executions", category: "Analytics", icon: "bar-chart", sections: [
    { name: 'Executive Summary', icon: 'file-text' },
    { name: 'Workflow Performance Metrics', icon: 'bar-chart' },
    { name: 'Exception Trends', icon: 'trending-up' },
    { name: 'Processing Efficiency', icon: 'check-circle' },
    { name: 'Anomaly Detection Results', icon: 'alert-triangle' },
    { name: 'Recommendations', icon: 'file-text' },
  ]},
  { id: "rt-005", name: "Deficiency Tracker", desc: "Status of all identified deficiencies with remediation progress", category: "Audit", icon: "file-text", sections: [
    { name: 'Executive Summary', icon: 'file-text' },
    { name: 'Key Findings', icon: 'alert-triangle' },
    { name: 'Deficiency Details', icon: 'shield' },
    { name: 'Remediation Progress', icon: 'check-circle' },
    { name: 'Timeline & Milestones', icon: 'trending-up' },
    { name: 'Appendix', icon: 'file-text' },
  ]},
  { id: "rt-006", name: "Executive Dashboard Export", desc: "Board-ready summary of GRC posture and key metrics", category: "Executive", icon: "trending-up", sections: [
    { name: 'Executive Summary', icon: 'file-text' },
    { name: 'Key Metrics Dashboard', icon: 'bar-chart' },
    { name: 'Risk Heatmap', icon: 'alert-triangle' },
    { name: 'Compliance Scorecard', icon: 'shield' },
    { name: 'Strategic Recommendations', icon: 'check-circle' },
    { name: 'Outlook & Next Steps', icon: 'trending-up' },
  ]},
  { id: "rt-007", name: "Action Taken Report", desc: "Summary of exception actions, risk owner responses, and resolution status", category: "Audit", icon: "clipboard-check", sections: [
    { name: 'Executive Summary', icon: 'file-text' },
    { name: 'Exception Overview', icon: 'alert-triangle' },
    { name: 'Actions Taken', icon: 'check-circle' },
    { name: 'Risk Owner Responses', icon: 'shield' },
    { name: 'Resolution Status', icon: 'clipboard-check' },
    { name: 'Pending Items', icon: 'file-text' },
  ]},
];

// ─── Generated Reports ───
export const GENERATED_REPORTS = [
  { id: "gr-001", templateId: "rt-001", name: "FY26 Q1 SOX Compliance Report", generatedBy: "Karan Mehta", generatedAt: "Mar 20, 2026", status: "final", pages: 24 },
  { id: "gr-002", templateId: "rt-002", name: "P2P Risk Assessment — March 2026", generatedBy: "Tushar Goel", generatedAt: "Mar 18, 2026", status: "draft", pages: 12 },
  { id: "gr-003", templateId: "rt-004", name: "Workflow Performance — Feb 2026", generatedBy: "AI Copilot", generatedAt: "Mar 1, 2026", status: "final", pages: 8 },
];

// ─── Data Sources ───
export const DATA_SOURCES = [
  { id: "ds-001", name: "SAP ERP — AP Module", type: "sql", status: "connected", lastSync: "Mar 20, 2026", records: "1.2M" },
  { id: "ds-002", name: "Invoice Archive 2026", type: "pdf", status: "connected", lastSync: "Mar 19, 2026", records: "4,521" },
  { id: "ds-003", name: "Vendor Master Data", type: "csv", status: "connected", lastSync: "Mar 20, 2026", records: "892" },
  { id: "ds-004", name: "GL Transaction History", type: "sql", status: "connected", lastSync: "Mar 18, 2026", records: "3.8M" },
  { id: "ds-005", name: "Contract Repository", type: "pdf", status: "disconnected", lastSync: "Feb 15, 2026", records: "234" },
];

// ─── Chat History ───
export const CHAT_HISTORY = [
  { id: "ch-001", title: "P2P Risk Analysis", preview: "Show me all high-severity risks in P2P...", timestamp: "Mar 20, 2026", messages: 8 },
  { id: "ch-002", title: "Duplicate Invoice Workflow", preview: "Build a workflow to detect duplicate invoices...", timestamp: "Mar 19, 2026", messages: 12 },
  { id: "ch-003", title: "SOX Compliance Status", preview: "What's the current SOX compliance status...", timestamp: "Mar 18, 2026", messages: 5 },
  { id: "ch-004", title: "Control Effectiveness Query", preview: "Which controls are marked ineffective...", timestamp: "Mar 17, 2026", messages: 6 },
  { id: "ch-005", title: "Journal Entry Anomalies", preview: "Run the journal entry anomaly detector...", timestamp: "Mar 15, 2026", messages: 15 },
];

// ─── Pre-built Chat Conversations ───
export const CHAT_CONVERSATIONS: Record<string, Array<{ role: 'user' | 'assistant'; text: string }>> = {
  'ch-001': [
    { role: 'user', text: 'Show me all high-severity risks in P2P process' },
    { role: 'assistant', text: '**P2P High-Severity Risks Found: 3**\n\nI\'ve analyzed your P2P risk register and identified 3 high-severity risks:\n\n• **RSK-001** — Unauthorized vendor payments processed without approval (3 controls mapped)\n• **RSK-002** — Duplicate invoices leading to overpayment (4 controls, 2 key)\n• **RSK-008** — Segregation of duties violation in AP (3 controls, 1 key)\n\nRSK-008 is the most concerning — the SOD violation detector control (CTR-006) remains untested.' },
    { role: 'user', text: 'What controls cover RSK-008?' },
    { role: 'assistant', text: '**Controls for RSK-008 (SOD Violation):**\n\n1. **CTR-004** — Privileged Access Review (quarterly) → Status: **Ineffective** ⚠️\n2. **CTR-006** — SOD Violation Detector Real-time → Status: **Not Tested**\n3. **CTR-002** — Dual Approval for Payments > 10L → Status: **Effective** ✓\n\n**Recommendation:** Prioritize testing CTR-006 and remediating CTR-004. The privileged access review failed because scope was limited to AP module only — expand to include all financial modules.' },
  ],
  'ch-002': [
    { role: 'user', text: 'Build a workflow to detect duplicate invoices across all vendors' },
    { role: 'assistant', text: 'I\'ll build a Duplicate Invoice Detector workflow. Let me configure the steps based on your requirements.\n\n**Workflow: Duplicate Invoice Detector v4**\n\n📊 Connected to: SAP ERP AP Module (1.2M records)\n🔍 Detection: Fuzzy match with 5% tolerance\n⚡ Processing: AI-powered pattern detection\n\nThe workflow is ready and saved to your library with 5 execution steps.' },
  ],
  'ch-003': [
    { role: 'user', text: 'What\'s the current SOX compliance status?' },
    { role: 'assistant', text: '**FY26 SOX Audit — Status Overview**\n\n📊 **Overall Progress: 58%** (14 of 24 controls tested)\n\n• **Effective:** 11 controls (79%)\n• **Ineffective:** 1 control (CTR-004 — Privileged Access Review)\n• **Not Tested:** 10 controls remaining\n• **Deficiencies Found:** 2 (1 Significant Deficiency, 1 Material Weakness)\n\n⚠️ **Critical Items:**\n- DEF-002 (Material Weakness): Journal entry approval override used 7 times without documentation — due Mar 31\n- 10 controls still pending testing before quarter-end\n\n**Recommendation:** Focus testing resources on remaining P2P and S2C controls. The Mar 31 deadline for DEF-002 remediation is at risk.' },
  ],
  'ch-004': [
    { role: 'user', text: 'Which controls are marked ineffective?' },
    { role: 'assistant', text: '**Ineffective Controls Report**\n\n1 control is currently marked ineffective:\n\n🔴 **CTR-004 — Privileged Access Review**\n- Risk: RSK-008 (SOD Violation in AP)\n- Engagement: FY26 SOX Audit\n- Assignee: Tushar Goel\n- Issue: Quarterly review scope limited to AP module; did not cover AR and GL modules\n- Deficiency: DEF-003 (Control Deficiency) — Resolved Feb 28, 2026\n\n**Additionally, 2 controls are Not Tested:**\n- CTR-006 — SOD Violation Detector (assigned to Tushar Goel)\n- 1 control in O2C process (PO dual sign-off pending)\n\n**Action:** Schedule CTR-006 testing this week to maintain SOX timeline.' },
  ],
  'ch-005': [
    { role: 'user', text: 'Run the journal entry anomaly detector and show me the results' },
    { role: 'assistant', text: '**Journal Entry Anomaly Detector — Results**\n\nScanned 3.8M GL transactions from R2R process.\n\n📊 **Summary:**\n- Records Analyzed: 3,847,231\n- Anomalies Detected: 23\n- Critical Anomalies: 3\n- Processing Time: 1.8s\n\n🔴 **Critical Findings:**\n1. 7 journal entries with approval overrides in Dec 2025 (linked to DEF-002)\n2. Unusual round-number entries totaling ₹4.2Cr posted at month-end\n3. 2 entries posted by user with revoked access (access not properly terminated)\n\n**Impact Score: 88/100**\nThis is a high-impact finding. Recommend immediate review of the 3 critical anomalies and escalation to the audit committee.' },
  ],
};

// ─── Exception Data (Duplicate Invoice Detection) ───
export const EXCEPTION_DATA = [
  { id: 'EXC-001', invoiceNo: 'INV-2026-4521', vendor: 'Acme Corp', amount: 45200, matchScore: 96, originalInvoice: 'INV-2026-3102', status: 'unassigned' as const, assignee: null as string | null, actionTaken: null as string | null, riskOwner: null as string | null, notificationSent: false },
  { id: 'EXC-002', invoiceNo: 'INV-2026-4533', vendor: 'Global Supplies Ltd', amount: 128750, matchScore: 92, originalInvoice: 'INV-2026-2987', status: 'unassigned' as const, assignee: null as string | null, actionTaken: null as string | null, riskOwner: null as string | null, notificationSent: false },
  { id: 'EXC-003', invoiceNo: 'INV-2026-4558', vendor: 'TechVendor Inc', amount: 67400, matchScore: 88, originalInvoice: 'INV-2026-3241', status: 'assigned' as const, assignee: 'Tushar Goel', actionTaken: null as string | null, riskOwner: 'ro-001', notificationSent: true },
  { id: 'EXC-004', invoiceNo: 'INV-2026-4571', vendor: 'Acme Corp', amount: 23100, matchScore: 94, originalInvoice: 'INV-2026-3455', status: 'in-progress' as const, assignee: 'Deepak Bansal', actionTaken: 'Under investigation', riskOwner: 'ro-002', notificationSent: true },
  { id: 'EXC-005', invoiceNo: 'INV-2026-4589', vendor: 'Pinnacle Services', amount: 89600, matchScore: 78, originalInvoice: 'INV-2026-3012', status: 'resolved' as const, assignee: 'Neha Joshi', actionTaken: 'Confirmed duplicate — payment blocked', riskOwner: 'ro-003', notificationSent: true },
  { id: 'EXC-006', invoiceNo: 'INV-2026-4602', vendor: 'Atlas Manufacturing', amount: 156300, matchScore: 85, originalInvoice: 'INV-2026-2876', status: 'unassigned' as const, assignee: null as string | null, actionTaken: null as string | null, riskOwner: null as string | null, notificationSent: false },
  { id: 'EXC-007', invoiceNo: 'INV-2026-4618', vendor: 'Global Supplies Ltd', amount: 34500, matchScore: 91, originalInvoice: 'INV-2026-3189', status: 'unassigned' as const, assignee: null as string | null, actionTaken: null as string | null, riskOwner: null as string | null, notificationSent: false },
  { id: 'EXC-008', invoiceNo: 'INV-2026-4635', vendor: 'TechVendor Inc', amount: 71800, matchScore: 82, originalInvoice: 'INV-2026-3367', status: 'notified' as const, assignee: 'Karan Mehta', actionTaken: null as string | null, riskOwner: 'ro-004', notificationSent: true },
];

// ─── Risk Owners ───
export const RISK_OWNERS = [
  { id: 'ro-001', name: 'Tushar Goel', role: 'AP Manager', email: 'tushar.goel@company.com', initials: 'TG' },
  { id: 'ro-002', name: 'Deepak Bansal', role: 'Finance Controller', email: 'deepak.bansal@company.com', initials: 'DB' },
  { id: 'ro-003', name: 'Neha Joshi', role: 'Compliance Lead', email: 'neha.joshi@company.com', initials: 'NJ' },
  { id: 'ro-004', name: 'Karan Mehta', role: 'Audit Manager', email: 'karan.mehta@company.com', initials: 'KM' },
  { id: 'ro-005', name: 'Sneha Desai', role: 'Risk Analyst', email: 'sneha.desai@company.com', initials: 'SD' },
];

// ─── Action Taken Data ───
export const ACTION_TAKEN_DATA = [
  { exceptionId: 'EXC-005', action: 'Investigated invoice trail — confirmed duplicate submission by vendor', actionBy: 'Neha Joshi', actionDate: 'Mar 22, 2026', resolution: 'Payment blocked, vendor notified' },
  { exceptionId: 'EXC-004', action: 'Cross-referenced with PO and GRN records', actionBy: 'Deepak Bansal', actionDate: 'Mar 23, 2026', resolution: 'Under review — awaiting vendor response' },
  { exceptionId: 'EXC-003', action: 'Verified against historical payment records', actionBy: 'Tushar Goel', actionDate: 'Mar 21, 2026', resolution: 'Escalated to vendor management' },
  { exceptionId: 'EXC-008', action: 'Initial review completed', actionBy: 'Karan Mehta', actionDate: 'Mar 24, 2026', resolution: 'Pending detailed analysis' },
];

// ─── Email Template ───
export const EMAIL_TEMPLATE = {
  subject: 'Action Required: Duplicate Invoice Exception Assigned',
  from: 'Auditify Copilot <noreply@auditify.ai>',
  body: (recipientName: string, exceptionId: string, invoiceNo: string, vendor: string, amount: number) => `
Dear ${recipientName},

A duplicate invoice exception has been assigned to you for review and action.

Exception Details:
• Exception ID: ${exceptionId}
• Invoice: ${invoiceNo}
• Vendor: ${vendor}
• Amount: $${amount.toLocaleString()}

Please review the flagged transaction and take appropriate action within 48 hours.

Actions Required:
1. Review the invoice against the original transaction
2. Verify with the vendor if necessary
3. Approve, block, or escalate the payment
4. Document your findings in Auditify

Access the exception directly:
https://auditify.ai/exceptions/${exceptionId}

Best regards,
Auditify Copilot
Automated Audit Intelligence Platform
  `.trim(),
};

// ─── Power BI Dashboards ───
export const POWER_BI_DASHBOARDS = [
  { id: 'pbi-001', name: 'Finance Overview FY26', workspace: 'Corporate Finance', tiles: 6, lastRefresh: 'Mar 20, 2026', selected: false },
  { id: 'pbi-002', name: 'Vendor Spend Analysis', workspace: 'Procurement', tiles: 8, lastRefresh: 'Mar 19, 2026', selected: false },
  { id: 'pbi-003', name: 'Compliance Scorecard', workspace: 'Risk & Compliance', tiles: 5, lastRefresh: 'Mar 18, 2026', selected: false },
  { id: 'pbi-004', name: 'AP Aging Report', workspace: 'Corporate Finance', tiles: 4, lastRefresh: 'Mar 22, 2026', selected: false },
];

// ─── Clarification Steps (Duplicate Invoice Query) ───
export const CLARIFICATION_STEPS = [
  {
    stage: 1,
    question: "I'll analyze your invoice data for duplicates. First — what date range should I cover?",
    options: ['Last 30 days', 'Last 90 days', 'Full FY26', 'Custom range'],
    fillPercent: 25,
    category: 'Intent',
  },
  {
    stage: 2,
    question: 'What tolerance threshold for amount matching? Some duplicates may have slight variations.',
    options: ['Exact match only', '± 1% tolerance', '± 5% tolerance'],
    fillPercent: 50,
    category: 'Data',
  },
  {
    stage: 3,
    question: 'Which vendor scope should I analyze?',
    options: ['All vendors', 'Top 50 by spend', 'Flagged vendors only', 'Specific vendor'],
    fillPercent: 75,
    category: 'Logic',
  },
  {
    stage: 4,
    question: 'What matching logic should I use to detect duplicates?',
    options: ['Invoice number + amount', 'Fuzzy match all fields', 'AI-powered pattern detection'],
    fillPercent: 100,
    category: 'Ready',
  },
];

// ─── Workflow Build Clarification Steps ───
export const WORKFLOW_CLARIFICATION_STEPS = [
  {
    stage: 1,
    question: "I'll build this workflow for you. First — which data source should I connect to?",
    options: ['SAP ERP — AP Module', 'CSV / Excel Upload', 'Multiple Sources (SAP + CSV)', 'Custom Database'],
    fillPercent: 20,
    category: 'Data Source',
    canvasSection: 'overview',
  },
  {
    stage: 2,
    question: 'What specific pattern should the workflow detect?',
    options: ['Duplicate invoices (same vendor + amount)', 'Anomalous payment amounts', 'Unauthorized vendor changes', 'SOD violations'],
    fillPercent: 40,
    category: 'Detection Logic',
    canvasSection: 'steps',
  },
  {
    stage: 3,
    question: 'What business rules and thresholds should I apply?',
    options: ['Fuzzy match with 5% tolerance', 'Exact match only', 'AI-powered pattern detection', 'Custom rules (amount > 10L)'],
    fillPercent: 60,
    category: 'Rules',
    canvasSection: 'suggestions',
  },
  {
    stage: 4,
    question: 'Confirm the input and output fields for this workflow:',
    options: ['Use recommended I/O fields', 'Add vendor category filter', 'Include historical comparison', 'Custom fields'],
    fillPercent: 80,
    category: 'Input / Output',
    canvasSection: 'io',
  },
  {
    stage: 5,
    question: 'Here\'s the AI-recommended output screen for your workflow. Should I finalize this layout?',
    options: ['Looks great — finalize', 'Switch to dashboard layout', 'Switch to chat-based layout', 'Customize further'],
    fillPercent: 100,
    category: 'Output Layout',
    canvasSection: 'preview',
  },
];

// ─── Workflow Assumptions per Clarification Step ───
export const WORKFLOW_ASSUMPTIONS: Record<number, string[]> = {
  1: ['Connecting via read-only access', 'Using production dataset (not staging)', 'Default timeout: 30 seconds'],
  2: ['Matching on invoice number + vendor + amount fields', 'Excluding voided invoices', 'Looking back 12 months for historical matches'],
  3: ['Tolerance applies to amount field only', 'Vendor name matching uses exact match', 'Currency conversion handled by source system'],
  4: ['Date format: DD-MMM-YYYY', 'Amount includes tax', 'Output sorted by match score descending'],
  5: ['Standard layout selected', 'Results auto-refresh on new data', 'Max 100 rows per page in output table'],
};

// ─── Dashboard Widgets ───
export const DASHBOARD_WIDGETS = [
  { id: "dw-001", type: "kpi", title: "Total Risks", value: 12, change: "+2", trend: "up" },
  { id: "dw-002", type: "kpi", title: "Controls Tested", value: 14, total: 24, change: "+3", trend: "up" },
  { id: "dw-003", type: "kpi", title: "Deficiencies Open", value: 2, change: "-1", trend: "down" },
  { id: "dw-004", type: "kpi", title: "Workflow Runs (MTD)", value: 156, change: "+23", trend: "up" },
  { id: "dw-005", type: "donut", title: "Risk by Severity", data: { critical: 2, high: 5, medium: 3, low: 2 } },
  { id: "dw-006", type: "bar", title: "Control Effectiveness", data: { effective: 11, ineffective: 1, "not-tested": 2 } },
  { id: "dw-007", type: "progress", title: "Audit Progress — FY26 SOX", value: 58 },
  { id: "dw-008", type: "list", title: "Recent Workflow Runs", items: ["Duplicate Invoice Detector — 2h ago", "Vendor Master Monitor — 4h ago", "Journal Entry Anomaly — 1d ago"] },
];

// ─── SOP Process Flows ───
export const SOP_FLOWS: Record<string, Array<{ id: string; label: string; type: 'start' | 'process' | 'decision' | 'end'; next?: string[] }>> = {
  'sop-001': [ // Vendor Payment SOP - P2P
    { id: 's1', label: 'Invoice received\nvia AP portal', type: 'start', next: ['s2'] },
    { id: 's2', label: 'OCR scan &\ndata extraction', type: 'process', next: ['s3'] },
    { id: 's3', label: 'Three-way match\nPO ↔ GRN ↔ Invoice', type: 'process', next: ['s4'] },
    { id: 's4', label: 'Match within\n5% tolerance?', type: 'decision', next: ['s5', 's6'] },
    { id: 's5', label: 'Auto-route to\nL1 Approver\n(< ₹10L)', type: 'process', next: ['s7'] },
    { id: 's6', label: 'Flag for AP\nManager review', type: 'process', next: ['s8'] },
    { id: 's7', label: 'L2 Approval\nrequired?\n(> ₹10L)', type: 'decision', next: ['s9', 's10'] },
    { id: 's8', label: 'Manual\nresolution &\nvendor callback', type: 'process', next: ['s3'] },
    { id: 's9', label: 'Finance Controller\nsign-off', type: 'process', next: ['s10'] },
    { id: 's10', label: 'Schedule payment\nin next batch run', type: 'process', next: ['s11'] },
    { id: 's11', label: 'Payment released\n& posted to GL', type: 'end' },
  ],
  'sop-002': [ // Purchase Order SOP - P2P
    { id: 's1', label: 'Purchase\nrequisition (PR)\nraised by dept', type: 'start', next: ['s2'] },
    { id: 's2', label: 'Budget availability\ncheck in SAP', type: 'process', next: ['s3'] },
    { id: 's3', label: 'Budget\nsufficient?', type: 'decision', next: ['s4', 's5'] },
    { id: 's4', label: 'Auto-generate PO\nfrom approved PR', type: 'process', next: ['s6'] },
    { id: 's5', label: 'Route to Dept Head\nfor budget override', type: 'process', next: ['s7'] },
    { id: 's6', label: 'Vendor selection\nfrom approved\nvendor list (AVL)', type: 'process', next: ['s8'] },
    { id: 's7', label: 'Override\napproved?', type: 'decision', next: ['s4', 's9'] },
    { id: 's8', label: 'PO dispatched\nto vendor via EDI', type: 'process', next: ['s10'] },
    { id: 's9', label: 'PR rejected —\nrequestor notified', type: 'end' },
    { id: 's10', label: 'GRN created on\ngoods receipt', type: 'end' },
  ],
  'sop-003': [ // Invoice Management SOP - O2C
    { id: 's1', label: 'Sales order\nconfirmed in CRM', type: 'start', next: ['s2'] },
    { id: 's2', label: 'Delivery &\nshipping confirmed', type: 'process', next: ['s3'] },
    { id: 's3', label: 'Auto-generate\ninvoice from SO', type: 'process', next: ['s4'] },
    { id: 's4', label: 'Customer credit\nlimit check', type: 'decision', next: ['s5', 's6'] },
    { id: 's5', label: 'Invoice sent\nto customer\nvia e-invoicing', type: 'process', next: ['s7'] },
    { id: 's6', label: 'Hold & route to\nCredit Manager', type: 'process', next: ['s8'] },
    { id: 's7', label: 'Payment\nreceived within\nterms?', type: 'decision', next: ['s9', 's10'] },
    { id: 's8', label: 'Credit decision:\napprove / reject', type: 'decision', next: ['s5', 's11'] },
    { id: 's9', label: 'Cash applied &\nreconciled in AR', type: 'end' },
    { id: 's10', label: 'Dunning notice\nsent (30/60/90)', type: 'process', next: ['s7'] },
    { id: 's11', label: 'Order cancelled\n& customer notified', type: 'end' },
  ],
  'sop-004': [ // Financial Close SOP - R2R
    { id: 's1', label: 'Period-end\ncutoff triggered\n(T+0)', type: 'start', next: ['s2'] },
    { id: 's2', label: 'Sub-ledger\npostings frozen\n(AP/AR/FA)', type: 'process', next: ['s3'] },
    { id: 's3', label: 'Inter-company\nelimination entries', type: 'process', next: ['s4'] },
    { id: 's4', label: 'Sub-ledger to\nGL reconciliation', type: 'process', next: ['s5'] },
    { id: 's5', label: 'All accounts\nbalanced?', type: 'decision', next: ['s6', 's7'] },
    { id: 's6', label: 'Management\nreview & topside\nadjustments', type: 'process', next: ['s8'] },
    { id: 's7', label: 'Investigate &\npost adjusting\njournal entries', type: 'process', next: ['s4'] },
    { id: 's8', label: 'Financial\nstatements\ngenerated', type: 'process', next: ['s9'] },
    { id: 's9', label: 'CFO sign-off\n& period closed', type: 'end' },
  ],
  'sop-005': [ // GL Reconciliation SOP - R2R
    { id: 's1', label: 'Month-end\ntrigger (T+1)', type: 'start', next: ['s2'] },
    { id: 's2', label: 'Extract GL trial\nbalance per entity', type: 'process', next: ['s3'] },
    { id: 's3', label: 'Auto-reconcile\nmatching entries\nacross subsidiaries', type: 'process', next: ['s4'] },
    { id: 's4', label: 'Variances\nexceed ₹50K\nthreshold?', type: 'decision', next: ['s5', 's6'] },
    { id: 's5', label: 'Flag & assign to\naccountant for\ninvestigation', type: 'process', next: ['s7'] },
    { id: 's6', label: 'Auto-certify\nreconciliation', type: 'process', next: ['s8'] },
    { id: 's7', label: 'Root cause\nidentified &\ncorrection posted?', type: 'decision', next: ['s6', 's9'] },
    { id: 's8', label: 'Manager sign-off\non reconciliation', type: 'process', next: ['s10'] },
    { id: 's9', label: 'Escalate to\nFinance Controller', type: 'process', next: ['s7'] },
    { id: 's10', label: 'Reconciliation\ncomplete &\narchived', type: 'end' },
  ],
};

// ─── SOP AI Recommendations ───
export const SOP_AI_RECOMMENDATIONS: Record<string, Array<{ type: 'improve' | 'add' | 'remove' | 'update'; text: string; impact: 'high' | 'medium' | 'low'; }>> = {
  'sop-001': [
    { type: 'add', text: 'Add automated vendor bank account verification step before payment release', impact: 'high' },
    { type: 'improve', text: 'Reduce three-way match tolerance from 5% to 2% for vendors with prior duplicates', impact: 'high' },
    { type: 'update', text: 'Update escalation matrix — current approval threshold (10L) has not been revised since FY24', impact: 'medium' },
  ],
  'sop-002': [
    { type: 'add', text: 'Include segregation of duties check between PO creator and approver', impact: 'high' },
    { type: 'improve', text: 'Add real-time budget utilization dashboard visibility during PO creation', impact: 'medium' },
  ],
  'sop-003': [
    { type: 'improve', text: 'Implement automated credit scoring refresh for repeat customers', impact: 'high' },
    { type: 'add', text: 'Add dispute resolution workflow for rejected invoices', impact: 'medium' },
  ],
  'sop-004': [
    { type: 'remove', text: 'Remove manual reconciliation step — automated sub-ledger reconciliation covers 98% of cases', impact: 'medium' },
    { type: 'update', text: 'Revise close timeline from T+5 to T+3 days per new corporate directive', impact: 'high' },
  ],
  'sop-005': [
    { type: 'add', text: 'Add inter-company elimination check for cross-subsidiary entries', impact: 'high' },
    { type: 'improve', text: 'Replace threshold-based variance detection with AI anomaly detection', impact: 'medium' },
  ],
};
