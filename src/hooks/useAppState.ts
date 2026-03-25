import { useState, useCallback } from 'react';

export type View =
  | 'home'
  | 'chat'
  | 'workflow-builder'
  | 'workflow-templates'
  | 'workflow-detail'
  | 'workflow-library'
  | 'business-processes'
  | 'bp-detail'
  | 'audit-risk-register'
  | 'audit-execution'
  | 'data-sources'
  | 'dashboards'
  | 'reports'
  | 'report-history'
  | 'report-builder'
  | 'audit-planning';

export type ChatMode = 'chat' | 'builder';
export type ArtifactTab = 'plan' | 'code' | 'sources' | 'result';
export type ArtifactMode = 'query' | 'workflow';

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
  // Workflow build stage (0=none, 1-5=progressive build)
  workflowBuildStage: number;
  workflowUiEnhancements: string[];
  // Chat initial query (from Ask AI actions)
  chatInitialQuery: string | null;
}

const INITIAL_STATE: AppState = {
  view: 'home',
  sidebarExpanded: false,
  chatMode: 'chat',
  activeArtifactTab: 'result',
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
  workflowBuildStage: 0,
  workflowUiEnhancements: [],
  chatInitialQuery: null,
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

  const setWorkflowBuildStage = useCallback((stage: number) => {
    setState(prev => ({ ...prev, workflowBuildStage: stage }));
  }, []);

  const setWorkflowUiEnhancements = useCallback((enhancements: string[]) => {
    setState(prev => ({ ...prev, workflowUiEnhancements: enhancements }));
  }, []);

  const setChatInitialQuery = useCallback((query: string | null) => {
    setState(prev => ({ ...prev, chatInitialQuery: query }));
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
    setWorkflowBuildStage,
    setWorkflowUiEnhancements,
    setChatInitialQuery,
  };
}
