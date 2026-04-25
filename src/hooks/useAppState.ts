import { useState, useCallback } from 'react';
import type { WorkflowTypeId } from '../data/mockData';

export type View =
  | 'home'
  | 'recents'
  | 'chat'
  | 'workflow-templates'
  | 'workflow-detail'
  | 'workflow-library'
  | 'workflow-executor'
  // Governance
  | 'business-processes'
  | 'bp-detail'
  | 'governance-racm'
  | 'governance-racm-detail'
  | 'governance-racm-generate'
  | 'governance-controls'
  | 'governance-control-detail'
  | 'audit-risk-register'
  | 'audit-planning'
  // Execution
  | 'audit-execution'
  | 'engagement-detail'
  | 'execution-testing'
  | 'execution-evidence'
  // Intelligence
  | 'dashboards'
  | 'reports'
  | 'report-history'
  | 'report-builder'
  | 'ai-concierge'
  | 'ai-concierge-forensics'
  | 'ai-concierge-table-extractor'
  | 'ai-concierge-workflow-builder'
  | 'findings'
  // System
  | 'configuration'
  | 'data-sources'
  | 'knowledge-hub'
  | 'admin-users'
  | 'admin-roles'
  | 'admin-settings'
  | 'admin-integrations'
  | 'admin-logs'
  // One-Click Audit
  | 'one-click-audit'
  // Case Management
  | 'manage-exceptions'
  // Chat trash
  | 'chat-trash';

export type ChatMode = 'chat' | 'workflow';
export type ExceptionRole = 'risk-owner' | 'auditor';
export type ArtifactTab = 'plan' | 'code' | 'sources' | 'flow' | 'preview';
export type ArtifactMode = 'query' | 'workflow';
export type ExecutionPanel = 'working-paper' | 'workflow-execution' | 'traceability' | null;

export interface AppState {
  view: View;
  sidebarExpanded: boolean;
  chatMode: ChatMode;
  activeArtifactTab: ArtifactTab;
  artifactMode: ArtifactMode;
  showArtifacts: boolean;
  showChatHistory: boolean;
  selectedWorkflowId: string | null;
  selectedBPId: string | null;
  selectedEngagementId: string | null;
  selectedRiskId: string | null;
  // Modal states
  showExceptionModal: boolean;
  showEmailPreviewModal: boolean;
  showShareModal: boolean;
  showPowerBIWizard: boolean;
  shareContext: { type: 'report' | 'dashboard' | 'workflow-output'; id: string } | null;
  emailPreviewRecipient: string | null;
  // Report builder
  reportBuilderContext: 'new' | 'action-report' | 'from-template' | null;
  // Unified workflow canvas
  workflowCanvasStage: number; // 0=waiting, 1=input, 2=output, 3=preview
  workflowType: WorkflowTypeId | null;
  // Chat initial context (for workflow mode entry)
  chatInitialQuery: string | null;
  chatWorkflowContext: { templateId?: string; workflowId?: string } | null;
  // Selected chat to load into ChatView (e.g. from Recents); null = fresh chat
  selectedChatId: string | null;
  // Query assumptions
  queryAssumptions: string[];
  // Execution panels
  executionPanel: ExecutionPanel;
  executionPanelControlId: string | null;
  // Manage Exceptions (Case Mgmt) active role
  exceptionRole: ExceptionRole;
}

const getInitialView = (): View => {
  if (typeof window === 'undefined') return 'home';
  const params = new URLSearchParams(window.location.search);
  const v = params.get('view');
  if (v === 'reports') return 'reports';
  if (v === 'manage-exceptions') return 'manage-exceptions';
  return 'home';
};

const INITIAL_STATE: AppState = {
  view: getInitialView(),
  sidebarExpanded: false,
  chatMode: 'chat',
  activeArtifactTab: 'plan',
  artifactMode: 'query',
  showArtifacts: false,
  showChatHistory: false,
  selectedWorkflowId: null,
  selectedBPId: null,
  selectedEngagementId: null,
  selectedRiskId: null,
  showExceptionModal: false,
  showEmailPreviewModal: false,
  showShareModal: false,
  showPowerBIWizard: false,
  shareContext: null,
  emailPreviewRecipient: null,
  reportBuilderContext: null,
  workflowCanvasStage: 0,
  workflowType: null,
  chatInitialQuery: null,
  chatWorkflowContext: null,
  selectedChatId: null,
  queryAssumptions: [],
  executionPanel: null,
  executionPanelControlId: null,
  exceptionRole: 'risk-owner',
};

export function useAppState() {
  const [state, setState] = useState<AppState>(INITIAL_STATE);

  const setView = useCallback((view: View) => {
    setState(prev => ({ ...prev, view, showChatHistory: false }));
  }, []);

  const toggleSidebar = useCallback(() => {
    setState(prev => ({ ...prev, sidebarExpanded: !prev.sidebarExpanded }));
  }, []);

  const setSidebarExpanded = useCallback((expanded: boolean) => {
    setState(prev => ({ ...prev, sidebarExpanded: expanded }));
  }, []);

  const setActiveArtifactTab = useCallback((tab: ArtifactTab) => {
    setState(prev => ({ ...prev, activeArtifactTab: tab }));
  }, []);

  const setArtifactMode = useCallback((mode: ArtifactMode) => {
    setState(prev => ({ ...prev, artifactMode: mode }));
  }, []);

  const setShowArtifacts = useCallback((show: boolean) => {
    setState(prev => ({ ...prev, showArtifacts: show }));
  }, []);

  const toggleChatHistory = useCallback(() => {
    setState(prev => ({ ...prev, showChatHistory: !prev.showChatHistory }));
  }, []);

  const setSelectedWorkflow = useCallback((id: string | null) => {
    setState(prev => ({ ...prev, selectedWorkflowId: id, view: id ? 'workflow-detail' : 'workflow-templates' }));
  }, []);

  const setSelectedBP = useCallback((id: string | null) => {
    setState(prev => ({ ...prev, selectedBPId: id, view: id ? 'bp-detail' : 'business-processes' }));
  }, []);

  const setSelectedEngagement = useCallback((id: string | null) => {
    setState(prev => ({ ...prev, selectedEngagementId: id }));
  }, []);

  const openAuditExecution = useCallback((engagementId: string) => {
    setState(prev => ({ ...prev, view: 'audit-execution' as View, selectedEngagementId: engagementId }));
  }, []);

  // Modal controls
  const setShowExceptionModal = useCallback((show: boolean) => {
    setState(prev => ({ ...prev, showExceptionModal: show }));
  }, []);

  const setShowEmailPreviewModal = useCallback((show: boolean, recipient?: string | null) => {
    setState(prev => ({ ...prev, showEmailPreviewModal: show, emailPreviewRecipient: recipient ?? null }));
  }, []);

  const setShowShareModal = useCallback((show: boolean, context?: AppState['shareContext']) => {
    setState(prev => ({ ...prev, showShareModal: show, shareContext: context ?? null }));
  }, []);

  const setShowPowerBIWizard = useCallback((show: boolean) => {
    setState(prev => ({ ...prev, showPowerBIWizard: show }));
  }, []);

  const openReportBuilder = useCallback((context: AppState['reportBuilderContext']) => {
    setState(prev => ({ ...prev, view: 'report-builder', reportBuilderContext: context }));
  }, []);

  // Unified workflow canvas
  const setWorkflowCanvasStage = useCallback((stage: number) => {
    setState(prev => ({ ...prev, workflowCanvasStage: stage }));
  }, []);

  const setWorkflowType = useCallback((type: WorkflowTypeId | null) => {
    setState(prev => ({ ...prev, workflowType: type }));
  }, []);

  const setChatInitialQuery = useCallback((query: string | null) => {
    setState(prev => ({ ...prev, chatInitialQuery: query }));
  }, []);

  const openChat = useCallback((chatId: string | null) => {
    setState(prev => ({ ...prev, view: 'chat' as View, selectedChatId: chatId, showChatHistory: false }));
  }, []);

  const setSelectedChatId = useCallback((id: string | null) => {
    setState(prev => ({ ...prev, selectedChatId: id }));
  }, []);

  const setQueryAssumptions = useCallback((assumptions: string[]) => {
    setState(prev => ({ ...prev, queryAssumptions: assumptions }));
  }, []);

  const enterWorkflowMode = useCallback((context?: { templateId?: string; workflowId?: string }) => {
    setState(prev => ({
      ...prev,
      view: 'chat' as View,
      chatMode: 'workflow' as ChatMode,
      artifactMode: 'workflow' as ArtifactMode,
      showArtifacts: true,
      chatWorkflowContext: context ?? null,
    }));
  }, []);

  const openWorkflowExecutor = useCallback((workflowId: string) => {
    setState(prev => ({ ...prev, view: 'workflow-executor' as View, selectedWorkflowId: workflowId }));
  }, []);

  const openExecutionPanel = useCallback((panel: ExecutionPanel, controlId?: string) => {
    setState(prev => ({ ...prev, executionPanel: panel, executionPanelControlId: controlId ?? null }));
  }, []);

  const closeExecutionPanel = useCallback(() => {
    setState(prev => ({ ...prev, executionPanel: null, executionPanelControlId: null }));
  }, []);

  const setExceptionRole = useCallback((role: ExceptionRole) => {
    setState(prev => ({ ...prev, exceptionRole: role }));
  }, []);

  return {
    state,
    setView,
    toggleSidebar,
    setSidebarExpanded,
    setActiveArtifactTab,
    setArtifactMode,
    setShowArtifacts,
    toggleChatHistory,
    setSelectedWorkflow,
    setSelectedBP,
    setShowExceptionModal,
    setShowEmailPreviewModal,
    setShowShareModal,
    setShowPowerBIWizard,
    openReportBuilder,
    setWorkflowCanvasStage,
    setWorkflowType,
    setChatInitialQuery,
    setQueryAssumptions,
    enterWorkflowMode,
    openWorkflowExecutor,
    openAuditExecution,
    openChat,
    setSelectedChatId,
    openExecutionPanel,
    closeExecutionPanel,
    setExceptionRole,
  };
}
