import { useRef, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { useAppState } from './hooks/useAppState';
import { ToastProvider } from './components/shared/Toast';
import { BulkRunProgressProvider } from './components/shared/BulkRunProgress';
import Sidebar from './components/sidebar/Sidebar';
import ChatView from './components/chat/ChatView';
import ArtifactPanel from './components/artifacts/ArtifactPanel';
import WorkflowBuilderCanvas from './components/artifacts/WorkflowBuilderCanvas';
import WorkflowTemplates from './components/workflow/WorkflowTemplates';
import WorkflowDetail from './components/workflow/WorkflowDetail';
import WorkflowLibraryView from './components/workflow/WorkflowLibraryView';
import BusinessProcesses from './components/audit/BusinessProcesses';
import RiskRegister from './components/audit/RiskRegister';
import AuditExecution from './components/audit/AuditExecution';
import DashboardView from './components/dashboard/DashboardView';
import DashboardListPage from './components/dashboard/DashboardListPage';
import ReportsView from './components/reports/ReportsView';
import HomeView from './components/home/HomeView';
import RecentsView from './components/recents/RecentsView';
import KnowledgeHubView from './components/knowledge/KnowledgeHubView';
import ExceptionManagementModal from './components/modals/ExceptionManagementModal';
import EmailPreviewModal from './components/modals/EmailPreviewModal';
import ShareModal from './components/modals/ShareModal';
import PowerBIImportWizard from './components/modals/PowerBIImportWizard';
import ReportBuilder from './components/reports/ReportBuilder';
import AuditPlanningView from './components/audit/AuditPlanningView';
// New pages
import RACMView from './components/governance/RACMView';
import ControlLibraryView from './components/governance/ControlLibraryView';
import ControlTestingView from './components/execution/ControlTestingView';
import EvidenceView from './components/execution/EvidenceView';
import AIConciergeView from './components/intelligence/AIConciergeView';
import WorkflowBuilderJourney from './components/concierge-workflow-builder/WorkflowBuilderJourney';
import AdminView from './components/admin/AdminView';
import FindingsView from './components/execution/FindingsView';
import WorkflowExecutor from './components/workflow/WorkflowExecutor';
import EngagementDetailView from './components/engagement/EngagementDetailView';
import ControlDetailDrawer from './components/engagement/ControlDetailDrawer';
import ManageExceptionsView from './components/exceptions/ManageExceptionsView';
import WorkingPaperPanel from './components/execution/WorkingPaperPanel';
import WorkflowExecutionPanel from './components/execution/WorkflowExecutionPanel';
import TraceabilityPanel from './components/execution/TraceabilityPanel';

export default function App() {
  const {
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
    openAuditExecution,
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
    openChat,
    setSelectedChatId,
    openDashboard,
    saveDashboardWidgets,
    addCreatedDashboard,
    deleteCreatedDashboard,
    openExecutionPanel,
    closeExecutionPanel,
    setExceptionRole,
  } = useAppState();

  const mainScrollRef = useRef<HTMLDivElement>(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [controlDrawerId, setControlDrawerId] = useState<string | null>(null);
  const [engagementBackView, setEngagementBackView] = useState<'audit-planning' | 'business-processes'>('audit-planning');

  useEffect(() => {
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTop = 0;
    }
  }, [state.view]);

  useEffect(() => {
    if (state.view === 'chat' || state.view === 'home') return;
    setViewLoading(true);
    const t = setTimeout(() => setViewLoading(false), 400);
    return () => clearTimeout(t);
  }, [state.view]);

  // Ask AI removed from all pages per PRD 2026-04-06 decision
  // IRA AI is accessed exclusively via sidebar navigation to /chat

  const renderArtifactPanel = () => {
    if (!state.showArtifacts) return null;

    if (state.artifactMode === 'workflow') {
      return (
        <WorkflowBuilderCanvas
          onClose={() => setShowArtifacts(false)}
          workflowType={state.workflowType ?? undefined}
        />
      );
    }

    return (
      <ArtifactPanel
        activeTab={state.activeArtifactTab}
        setActiveTab={setActiveArtifactTab}
        onClose={() => setShowArtifacts(false)}
        onManageExceptions={() => setShowExceptionModal(true)}
        onAddToReport={() => openReportBuilder('new')}
        onShareResults={() => setShowShareModal(true, { type: 'workflow-output', id: 'result-1' })}
      />
    );
  };

  const renderMainView = () => {
    if (viewLoading) {
      return (
        <div className="h-full flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
              <Sparkles size={24} className="text-brand-600" />
            </motion.div>
            <span className="text-[13px] text-ink-500">Loading…</span>
          </div>
        </div>
      );
    }

    switch (state.view) {
      case 'home':
        return <HomeView setView={setView} />;

      case 'recents':
        return <RecentsView setView={setView} openChat={openChat} openWorkflowExecutor={openWorkflowExecutor} />;

      case 'chat':
        return (
          <div className="flex flex-1 h-full overflow-hidden">
            <ChatView
              showChatHistory={state.showChatHistory}
              toggleChatHistory={toggleChatHistory}
              setShowArtifacts={setShowArtifacts}
              setActiveArtifactTab={setActiveArtifactTab}
              setArtifactMode={setArtifactMode}
              setWorkflowCanvasStage={setWorkflowCanvasStage}
              setWorkflowType={setWorkflowType}
              setQueryAssumptions={setQueryAssumptions}
              initialQuery={state.chatInitialQuery ?? undefined}
              onInitialQueryProcessed={() => setChatInitialQuery(null)}
              selectedChatId={state.selectedChatId}
              onChatLoaded={() => setSelectedChatId(null)}
              setView={setView}
            />
            <AnimatePresence>
              {renderArtifactPanel()}
            </AnimatePresence>
          </div>
        );

      case 'workflow-templates':
        return (
          <WorkflowTemplates
            onSelectWorkflow={(id) => setSelectedWorkflow(id)}
            onBuildNew={() => enterWorkflowMode()}
            onRunWorkflow={(id) => openWorkflowExecutor(id)}
          />
        );

      case 'workflow-detail': {
        const fromLibrary = state.selectedWorkflowId?.startsWith('lw-');
        return (
          <WorkflowDetail
            workflowId={state.selectedWorkflowId!}
            onBack={() => fromLibrary ? setView('workflow-library') : setSelectedWorkflow(null)}
            onViewDashboard={() => setView('dashboards')}
            onGenerateReport={() => openReportBuilder('new')}
            onOpenExecutor={() => openWorkflowExecutor(state.selectedWorkflowId!)}
            onEditInChat={() => enterWorkflowMode({ workflowId: state.selectedWorkflowId! })}
          />
        );
      }

      case 'workflow-library':
        return (
          <WorkflowLibraryView
            onCreateWorkflow={() => enterWorkflowMode()}
            onSelectWorkflow={(id) => setSelectedWorkflow(id)}
          />
        );

      case 'workflow-executor':
        return (
          <WorkflowExecutor
            workflowId={state.selectedWorkflowId!}
            onBack={() => setSelectedWorkflow(null)}
          />
        );

      case 'business-processes':
      case 'bp-detail':
        return (
          <BusinessProcesses
            selectedBPId={state.selectedBPId}
            onSelectBP={setSelectedBP}
            onOpenEngagement={(engId) => {
              setEngagementBackView('business-processes');
              openAuditExecution(engId);
              setView('engagement-detail' as any);
            }}
          />
        );

      case 'audit-risk-register':
        return (
          <RiskRegister
            onRunWorkflow={(id) => setSelectedWorkflow(id)}
          />
        );

      case 'audit-execution':
        return <AuditExecution />;

      case 'engagement-detail':
        return (
          <EngagementDetailView
            engagementId={state.selectedEngagementId ?? undefined}
            onBack={() => setView(engagementBackView)}
            onOpenControl={(controlId) => setControlDrawerId(controlId)}
          />
        );

      case 'dashboards':
        return (
          <DashboardListPage
            onDashboardClick={(id, customFields) => openDashboard(id, customFields)}
            onImportPowerBI={() => setShowPowerBIWizard(true)}
            createdDashboards={state.createdDashboards}
            onCreateDashboard={addCreatedDashboard}
            onDeleteDashboard={deleteCreatedDashboard}
          />
        );

      case 'dashboard-detail':
        return (
          <DashboardView
            initialDashboardId={state.selectedDashboardId}
            initialDashboardName={state.createdDashboards.find(d => d.id === state.selectedDashboardId)?.name}
            initialCustomFields={state.dashboardCustomFields}
            savedWidgets={state.dashboardWidgets[state.selectedDashboardId || ''] || []}
            onSaveWidgets={(widgets) => saveDashboardWidgets(state.selectedDashboardId || '', widgets)}
            onBack={() => setView('dashboards')}
            onImportPowerBI={() => setShowPowerBIWizard(true)}
            onShare={() => setShowShareModal(true, { type: 'dashboard', id: state.selectedDashboardId || 'dash-1' })}
          />
        );

      case 'reports':
      case 'report-history':
        return (
          <ReportsView
            onOpenBuilder={() => openReportBuilder('new')}
            onShare={(id) => setShowShareModal(true, { type: 'report', id })}
            onManageExceptions={() => setView('manage-exceptions')}
          />
        );

      case 'manage-exceptions':
        return (
          <ManageExceptionsView
            role={state.exceptionRole}
            setRole={setExceptionRole}
            onBack={() => setView('reports')}
          />
        );

      case 'report-builder':
        return (
          <ReportBuilder
            context={state.reportBuilderContext}
            onBack={() => setView('reports')}
          />
        );

      case 'audit-planning':
        return <AuditPlanningView onNavigateToExecution={(engId) => {
          setEngagementBackView('audit-planning');
          openAuditExecution(engId);
          setView('engagement-detail' as any);
        }} />;

      case 'knowledge-hub':
        return <KnowledgeHubView />;

      case 'data-sources':
      case 'configuration':
        // Legacy routes — all roads now go through Knowledge Hub so users
        // never land on a headerless orphan DataSourcesView.
        return <KnowledgeHubView />;

      // Governance — new pages
      case 'governance-racm':
      case 'governance-racm-detail':
      case 'governance-racm-generate':
        return <RACMView />;

      case 'governance-controls':
      case 'governance-control-detail':
        return <ControlLibraryView />;

      // Execution — new pages
      case 'execution-testing':
        return (
          <ControlTestingView
            onOpenWorkingPaper={(id) => openExecutionPanel('working-paper', id)}
            onOpenWorkflow={(id) => openExecutionPanel('workflow-execution', id)}
            onOpenTrace={(id) => openExecutionPanel('traceability', id)}
          />
        );

      case 'execution-evidence':
        return (
          <EvidenceView
            onOpenWorkingPaper={(id) => openExecutionPanel('working-paper', id)}
            onOpenWorkflow={(id) => openExecutionPanel('workflow-execution', id)}
            onOpenTrace={(id) => openExecutionPanel('traceability', id)}
          />
        );

      // Intelligence — AI Concierge
      case 'ai-concierge':
      case 'ai-concierge-forensics':
      case 'ai-concierge-table-extractor':
        return <AIConciergeView setView={setView} />;

      case 'ai-concierge-workflow-builder':
        return <WorkflowBuilderJourney onBack={() => setView('ai-concierge')} />;

      // Execution — Findings
      case 'findings':
        return (
          <FindingsView
            onOpenWorkingPaper={(id) => openExecutionPanel('working-paper', id)}
            onOpenWorkflow={(id) => openExecutionPanel('workflow-execution', id)}
            onOpenTrace={(id) => openExecutionPanel('traceability', id)}
          />
        );

      // Admin
      case 'admin-users':
        return <AdminView activeTab="users" />;
      case 'admin-roles':
        return <AdminView activeTab="roles" />;
      case 'admin-settings':
        return <AdminView activeTab="settings" />;
      case 'admin-integrations':
        return <AdminView activeTab="integrations" />;
      case 'admin-logs':
        return <AdminView activeTab="logs" />;

      default:
        return (
          <ChatView
            showChatHistory={state.showChatHistory}
            toggleChatHistory={toggleChatHistory}
            setShowArtifacts={setShowArtifacts}
            setActiveArtifactTab={setActiveArtifactTab}
            setArtifactMode={setArtifactMode}
          />
        );
    }
  };

  return (
    <ToastProvider>
      <BulkRunProgressProvider>
      <div className="flex h-screen w-full bg-canvas overflow-hidden">
        <Sidebar
          view={state.view}
          setView={setView}
          expanded={state.sidebarExpanded}
          toggleSidebar={toggleSidebar}
          setSidebarExpanded={setSidebarExpanded}
        />
        <main ref={mainScrollRef} className="flex-1 flex flex-col overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={state.view}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="flex-1 flex flex-col overflow-hidden"
            >
              {renderMainView()}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Modal Layer */}
        <AnimatePresence>
          {state.showExceptionModal && (
            <ExceptionManagementModal
              onClose={() => setShowExceptionModal(false)}
              onGenerateReport={() => { setShowExceptionModal(false); openReportBuilder('action-report'); }}
              onViewEmail={(recipient) => setShowEmailPreviewModal(true, recipient)}
            />
          )}
          {state.showEmailPreviewModal && (
            <EmailPreviewModal
              recipientName={state.emailPreviewRecipient}
              onClose={() => setShowEmailPreviewModal(false)}
            />
          )}
          {state.showShareModal && (
            <ShareModal onClose={() => setShowShareModal(false)} />
          )}
          {state.showPowerBIWizard && (
            <PowerBIImportWizard onClose={() => setShowPowerBIWizard(false)} />
          )}
        </AnimatePresence>

        {/* Execution Panels */}
        <AnimatePresence>
          {state.executionPanel === 'working-paper' && (
            <WorkingPaperPanel
              controlId={state.executionPanelControlId ?? undefined}
              onClose={closeExecutionPanel}
              onViewWorkflow={() => openExecutionPanel('workflow-execution', state.executionPanelControlId ?? undefined)}
              onViewTrace={() => openExecutionPanel('traceability', state.executionPanelControlId ?? undefined)}
            />
          )}
          {state.executionPanel === 'workflow-execution' && (
            <WorkflowExecutionPanel
              controlId={state.executionPanelControlId ?? undefined}
              onClose={closeExecutionPanel}
              onViewWorkingPaper={() => openExecutionPanel('working-paper', state.executionPanelControlId ?? undefined)}
              onViewTrace={() => openExecutionPanel('traceability', state.executionPanelControlId ?? undefined)}
            />
          )}
          {state.executionPanel === 'traceability' && (
            <TraceabilityPanel
              controlId={state.executionPanelControlId ?? undefined}
              onClose={closeExecutionPanel}
              onOpenWorkingPaper={() => openExecutionPanel('working-paper', state.executionPanelControlId ?? undefined)}
              onOpenWorkflow={() => openExecutionPanel('workflow-execution', state.executionPanelControlId ?? undefined)}
            />
          )}
        </AnimatePresence>

        {/* Control Detail Drawer */}
        <AnimatePresence>
          {controlDrawerId && (
            <ControlDetailDrawer
              controlId={controlDrawerId}
              onClose={() => setControlDrawerId(null)}
            />
          )}
        </AnimatePresence>
      </div>
      </BulkRunProgressProvider>
    </ToastProvider>
  );
}
