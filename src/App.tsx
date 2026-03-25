import { useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useAppState } from './hooks/useAppState';
import { ToastProvider } from './components/shared/Toast';
import Sidebar from './components/sidebar/Sidebar';
import ChatView from './components/chat/ChatView';
import ArtifactPanel from './components/artifacts/ArtifactPanel';
import WorkflowBuilderCanvas from './components/artifacts/WorkflowBuilderCanvas';
import WorkflowTemplates from './components/workflow/WorkflowTemplates';
import WorkflowDetail from './components/workflow/WorkflowDetail';
import BusinessProcesses from './components/audit/BusinessProcesses';
import RiskRegister from './components/audit/RiskRegister';
import AuditExecution from './components/audit/AuditExecution';
import DashboardView from './components/dashboard/DashboardView';
import ReportsView from './components/reports/ReportsView';
import DataSourcesView from './components/data-sources/DataSourcesView';
import HomeView from './components/home/HomeView';
import ExceptionManagementModal from './components/modals/ExceptionManagementModal';
import EmailPreviewModal from './components/modals/EmailPreviewModal';
import ShareModal from './components/modals/ShareModal';
import PowerBIImportWizard from './components/modals/PowerBIImportWizard';
import ReportBuilder from './components/reports/ReportBuilder';

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
    setShowExceptionModal,
    setShowEmailPreviewModal,
    setShowShareModal,
    setShowPowerBIWizard,
    openReportBuilder,
    setWorkflowBuildStage,
    setWorkflowUiEnhancements,
  } = useAppState();

  const mainScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTop = 0;
    }
  }, [state.view]);

  const handleAskAboutRisk = (_riskId: string) => {
    setView('chat');
  };

  const handleAskAboutControl = (_controlId: string) => {
    setView('chat');
  };

  const renderArtifactPanel = () => {
    if (!state.showArtifacts) return null;

    if (state.artifactMode === 'workflow') {
      return (
        <WorkflowBuilderCanvas
          onClose={() => setShowArtifacts(false)}
          buildStage={state.workflowBuildStage}
          uiEnhancements={state.workflowUiEnhancements}
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
    switch (state.view) {
      case 'home':
        return <HomeView setView={setView} />;

      case 'chat':
        return (
          <div className="flex flex-1 h-full overflow-hidden">
            <ChatView
              showChatHistory={state.showChatHistory}
              toggleChatHistory={toggleChatHistory}
              setShowArtifacts={setShowArtifacts}
              setActiveArtifactTab={setActiveArtifactTab}
              setArtifactMode={setArtifactMode}
              setWorkflowBuildStage={setWorkflowBuildStage}
              setWorkflowUiEnhancements={setWorkflowUiEnhancements}
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
            onBuildNew={() => setView('chat')}
          />
        );

      case 'workflow-detail':
        return (
          <WorkflowDetail
            workflowId={state.selectedWorkflowId!}
            onBack={() => setSelectedWorkflow(null)}
            onViewDashboard={() => setView('dashboards')}
            onGenerateReport={() => openReportBuilder('new')}
          />
        );

      case 'workflow-library':
        return (
          <WorkflowTemplates
            onSelectWorkflow={(id) => setSelectedWorkflow(id)}
            onBuildNew={() => setView('chat')}
          />
        );

      case 'business-processes':
      case 'bp-detail':
        return (
          <BusinessProcesses
            selectedBPId={state.selectedBPId}
            onSelectBP={setSelectedBP}
          />
        );

      case 'audit-risk-register':
        return (
          <RiskRegister
            onAskAboutRisk={handleAskAboutRisk}
            onRunWorkflow={(id) => setSelectedWorkflow(id)}
          />
        );

      case 'audit-execution':
        return <AuditExecution onAskAboutControl={handleAskAboutControl} />;

      case 'dashboards':
        return (
          <DashboardView
            onImportPowerBI={() => setShowPowerBIWizard(true)}
            onShare={() => setShowShareModal(true, { type: 'dashboard', id: 'dash-1' })}
          />
        );

      case 'reports':
      case 'report-history':
        return (
          <ReportsView
            onOpenBuilder={() => openReportBuilder('new')}
            onShare={(id) => setShowShareModal(true, { type: 'report', id })}
          />
        );

      case 'report-builder':
        return (
          <ReportBuilder
            context={state.reportBuilderContext}
            onBack={() => setView('reports')}
          />
        );

      case 'data-sources':
        return <DataSourcesView />;

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
      <div className="flex h-screen w-full bg-white overflow-hidden">
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
      </div>
    </ToastProvider>
  );
}
