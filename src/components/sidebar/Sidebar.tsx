import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageSquare, Workflow, Database, LayoutDashboard,
  FileBarChart, ChevronDown, PanelLeftClose, PanelLeft,
  AlertTriangle, ClipboardCheck, Sparkles, Building2, Home, Plus, Calendar,
  Shield, Zap, BookOpen, FileSearch, Settings, Users, Lock, Link2, ScrollText,
  Table2, Command,
  TestTube, FolderOpen, Wand2, AlertOctagon
} from 'lucide-react';
import type { View } from '../../hooks/useAppState';

interface SidebarProps {
  view: View;
  setView: (v: View) => void;
  expanded: boolean;
  toggleSidebar: () => void;
  setSidebarExpanded: (v: boolean) => void;
}

function NavItem({ icon: Icon, label, active, expanded, onClick, badge }: {
  icon: React.ElementType; label: string; active: boolean; expanded: boolean; onClick: () => void; badge?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={!expanded ? label : undefined}
      className={`
        w-full flex items-center gap-2.5 rounded-md transition-colors duration-200 relative group cursor-pointer
        ${expanded ? 'px-3 py-2' : 'px-0 py-2.5 justify-center'}
        ${active
          ? 'bg-sidebar-surface-active text-sidebar-accent font-semibold'
          : 'text-sidebar-text-dim hover:bg-sidebar-surface-hover hover:text-sidebar-text'
        }
      `}
    >
      {active && expanded && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-sidebar-accent rounded-r-full" />
      )}
      <Icon size={17} className="shrink-0" />
      <AnimatePresence>
        {expanded && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.15 }}
            className="text-[13px] truncate overflow-hidden whitespace-nowrap"
            style={{ fontWeight: active ? 600 : 520 }}
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {expanded && badge && (
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.12 }}
            className="ml-auto text-[10px] font-semibold bg-sidebar-surface text-sidebar-text-dim px-1.5 py-0.5 rounded-full tabular-nums"
          >
            {badge}
          </motion.span>
        )}
      </AnimatePresence>
      {!expanded && active && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-sidebar-accent rounded-r-full" />
      )}
    </button>
  );
}

function SubNavItem({ label, active, onClick, icon: Icon }: {
  label: string; active: boolean; onClick: () => void; icon?: React.ElementType;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[12.5px] transition-colors cursor-pointer ${
        active
          ? 'text-sidebar-accent font-semibold bg-sidebar-surface-active'
          : 'text-sidebar-text-muted hover:text-sidebar-text hover:bg-sidebar-surface-hover'
      }`}
    >
      {Icon && <Icon size={13} />}
      {label}
    </button>
  );
}

function SectionLabel({ label, expanded }: { label: string; expanded: boolean }) {
  if (!expanded) return <div className="h-px bg-sidebar-border my-2 mx-2" />;
  return (
    <div className="px-3 pt-4 pb-1">
      <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-sidebar-text-muted">{label}</span>
    </div>
  );
}

function ExpandableSection({ icon: Icon, label, active, expanded, open, onToggle, onExpand, children }: {
  icon: React.ElementType; label: string; active: boolean; expanded: boolean; open: boolean;
  onToggle: () => void; onExpand: () => void; children: React.ReactNode;
}) {
  return (
    <div>
      <button
        onClick={() => {
          if (expanded) { onToggle(); }
          else { onExpand(); }
        }}
        title={!expanded ? label : undefined}
        className={`
          w-full flex items-center gap-2.5 rounded-md transition-colors duration-200 cursor-pointer relative
          ${expanded ? 'px-3 py-2' : 'px-0 py-2.5 justify-center'}
          ${active
            ? 'bg-sidebar-surface-active text-sidebar-accent font-semibold'
            : 'text-sidebar-text-dim hover:bg-sidebar-surface-hover hover:text-sidebar-text'}
        `}
      >
        {active && expanded && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-sidebar-accent rounded-r-full" />
        )}
        <Icon size={17} className="shrink-0" />
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-center flex-1 gap-1 overflow-hidden"
            >
              <span className="text-[13px] flex-1 text-left whitespace-nowrap">{label}</span>
              <ChevronDown size={12} className={`transition-transform duration-200 ${open ? '' : '-rotate-90'}`} />
            </motion.div>
          )}
        </AnimatePresence>
        {!expanded && active && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-sidebar-accent rounded-r-full" />
        )}
      </button>
      <AnimatePresence>
        {expanded && open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="ml-5 pl-3 border-l border-sidebar-border space-y-0.5 py-1">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Sidebar({ view, setView, expanded, toggleSidebar, setSidebarExpanded }: SidebarProps) {
  const [governanceOpen, setGovernanceOpen] = useState(true);
  const [executionOpen, setExecutionOpen] = useState(true);
  const [aiConciergeOpen, setAiConciergeOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [hoverExpanded, setHoverExpanded] = useState(false);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const governanceViews: View[] = ['business-processes', 'bp-detail', 'governance-racm', 'governance-racm-detail', 'governance-racm-generate', 'governance-controls', 'governance-control-detail', 'audit-risk-register', 'audit-planning'];
  const executionViews: View[] = ['audit-execution', 'execution-testing', 'execution-evidence', 'findings', 'one-click-audit'];
  const workflowViews: View[] = ['workflow-templates', 'workflow-detail', 'workflow-library', 'workflow-executor'];
  const aiConciergeViews: View[] = ['ai-concierge', 'ai-concierge-forensics', 'ai-concierge-table-extractor'];
  const adminViews: View[] = ['admin-users', 'admin-roles', 'admin-settings', 'admin-integrations', 'admin-logs'];

  const isGovernanceView = governanceViews.includes(view);
  const isExecutionView = executionViews.includes(view);
  const isWorkflowView = workflowViews.includes(view);
  const isAiConciergeView = aiConciergeViews.includes(view);
  const isAdminView = adminViews.includes(view);

  const isExpanded = expanded || hoverExpanded;

  const handleMouseEnter = () => {
    if (!expanded) {
      hoverTimerRef.current = setTimeout(() => setHoverExpanded(true), 200);
    }
  };

  const handleMouseLeave = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    if (!expanded) setHoverExpanded(false);
  };

  return (
    <motion.div
      animate={{ width: isExpanded ? 256 : 64 }}
      transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
      className="h-full bg-sidebar-bg noise-texture flex flex-col shrink-0 overflow-hidden z-50"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Brand */}
      <div className={`border-b border-sidebar-border shrink-0 ${isExpanded ? 'px-4 py-4' : 'px-2 py-3'}`}>
        <div className={`flex items-center ${isExpanded ? 'gap-3' : 'justify-center'}`}>
          <div className="w-8 h-8 rounded-md bg-sidebar-surface-active flex items-center justify-center shrink-0">
            <Sparkles size={15} className="text-sidebar-accent" />
          </div>
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden"
              >
                <div className="text-[14px] font-semibold text-sidebar-accent leading-tight tracking-tight whitespace-nowrap">IRAME.AI</div>
                <div className="text-[10.5px] text-sidebar-text-muted whitespace-nowrap">Audit Intelligence</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Command palette hint */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-3 pt-3 pb-1"
          >
            <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-sidebar-surface text-sidebar-text-muted text-[12px] cursor-pointer hover:bg-sidebar-surface-hover hover:text-sidebar-text transition-colors">
              <Command size={13} />
              <span className="flex-1">Search or ask IRA…</span>
              <kbd className="text-[10px] bg-sidebar-surface-active px-1.5 py-0.5 rounded font-mono text-sidebar-text-dim">⌘K</kbd>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Chat — primary signal */}
      <div className={`shrink-0 ${isExpanded ? 'px-3 pt-2 pb-1' : 'px-1.5 pt-3 pb-1'}`}>
        <button
          onClick={() => setView('chat')}
          className={`w-full flex items-center gap-2 rounded-md transition-colors cursor-pointer text-[13px] font-semibold
            ${isExpanded
              ? 'px-3 py-2.5 bg-brand-600 hover:bg-brand-500 active:bg-brand-800 text-white'
              : 'justify-center py-2.5 bg-brand-600 hover:bg-brand-500 text-white'}
          `}
        >
          <Plus size={15} />
          <AnimatePresence>
            {isExpanded && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.12 }}
                className="whitespace-nowrap overflow-hidden"
              >
                New Chat
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Navigation */}
      <nav className={`flex-1 overflow-y-auto overflow-x-hidden ${isExpanded ? 'px-2.5 py-2' : 'px-1.5 py-3'}`}>
        <div className="space-y-0.5">
          {/* Primary */}
          <NavItem icon={Home} label="Home" active={view === 'home'} expanded={isExpanded} onClick={() => setView('home')} />
          <NavItem icon={MessageSquare} label="IRA AI" active={view === 'chat' || view === 'chat-trash'} expanded={isExpanded} onClick={() => setView('chat')} />

          {/* Audit Lifecycle */}
          <SectionLabel label="Audit Lifecycle" expanded={isExpanded} />

          <ExpandableSection
            icon={Shield}
            label="Governance"
            active={isGovernanceView}
            expanded={isExpanded}
            open={governanceOpen}
            onToggle={() => setGovernanceOpen(p => !p)}
            onExpand={() => { setSidebarExpanded(true); setGovernanceOpen(true); }}
          >
            <SubNavItem icon={Building2} label="Business Processes" active={view === 'business-processes' || view === 'bp-detail'} onClick={() => setView('business-processes')} />
            <SubNavItem icon={BookOpen} label="RACM" active={view === 'governance-racm' || view === 'governance-racm-detail'} onClick={() => setView('governance-racm')} />
            <SubNavItem icon={Shield} label="Control Library" active={view === 'governance-controls' || view === 'governance-control-detail'} onClick={() => setView('governance-controls')} />
            <SubNavItem icon={AlertTriangle} label="Risk Register" active={view === 'audit-risk-register'} onClick={() => setView('audit-risk-register')} />
            <SubNavItem icon={Calendar} label="Audit Planning" active={view === 'audit-planning'} onClick={() => setView('audit-planning')} />
          </ExpandableSection>

          <ExpandableSection
            icon={Zap}
            label="Execution"
            active={isExecutionView}
            expanded={isExpanded}
            open={executionOpen}
            onToggle={() => setExecutionOpen(p => !p)}
            onExpand={() => { setSidebarExpanded(true); setExecutionOpen(true); }}
          >
            <SubNavItem icon={ClipboardCheck} label="Engagements" active={view === 'audit-execution'} onClick={() => setView('audit-execution')} />
            <SubNavItem icon={TestTube} label="Control Testing" active={view === 'execution-testing'} onClick={() => setView('execution-testing')} />
            <SubNavItem icon={FolderOpen} label="Evidence & Workpapers" active={view === 'execution-evidence'} onClick={() => setView('execution-evidence')} />
            <SubNavItem icon={AlertOctagon} label="Findings" active={view === 'findings'} onClick={() => setView('findings')} />
          </ExpandableSection>

          <NavItem icon={Workflow} label="Workflows" active={isWorkflowView} expanded={isExpanded} onClick={() => setView('workflow-templates')} badge="8" />

          {/* Intelligence */}
          <SectionLabel label="Intelligence" expanded={isExpanded} />

          <NavItem icon={LayoutDashboard} label="Dashboards" active={view === 'dashboards'} expanded={isExpanded} onClick={() => setView('dashboards')} />
          <NavItem icon={FileBarChart} label="Reports" active={view === 'reports' || view === 'report-history' || view === 'report-builder'} expanded={isExpanded} onClick={() => setView('reports')} />

          <ExpandableSection
            icon={Wand2}
            label="AI Concierge"
            active={isAiConciergeView}
            expanded={isExpanded}
            open={aiConciergeOpen}
            onToggle={() => setAiConciergeOpen(p => !p)}
            onExpand={() => { setSidebarExpanded(true); setAiConciergeOpen(true); }}
          >
            <SubNavItem icon={FileSearch} label="Document Forensics" active={view === 'ai-concierge-forensics'} onClick={() => setView('ai-concierge-forensics')} />
            <SubNavItem icon={Table2} label="Table Extractor" active={view === 'ai-concierge-table-extractor'} onClick={() => setView('ai-concierge-table-extractor')} />
          </ExpandableSection>

          {/* System */}
          <SectionLabel label="System" expanded={isExpanded} />

          <NavItem icon={Database} label="Configuration" active={view === 'data-sources' || view === 'configuration'} expanded={isExpanded} onClick={() => setView('data-sources')} />

          <ExpandableSection
            icon={Settings}
            label="Admin"
            active={isAdminView}
            expanded={isExpanded}
            open={adminOpen}
            onToggle={() => setAdminOpen(p => !p)}
            onExpand={() => { setSidebarExpanded(true); setAdminOpen(true); }}
          >
            <SubNavItem icon={Users} label="Users & Teams" active={view === 'admin-users'} onClick={() => setView('admin-users')} />
            <SubNavItem icon={Lock} label="Roles & Permissions" active={view === 'admin-roles'} onClick={() => setView('admin-roles')} />
            <SubNavItem icon={Settings} label="System Settings" active={view === 'admin-settings'} onClick={() => setView('admin-settings')} />
            <SubNavItem icon={Link2} label="Integrations" active={view === 'admin-integrations'} onClick={() => setView('admin-integrations')} />
            <SubNavItem icon={ScrollText} label="Audit Logs" active={view === 'admin-logs'} onClick={() => setView('admin-logs')} />
          </ExpandableSection>
        </div>
      </nav>

      {/* User Profile + Footer */}
      <div className={`border-t border-sidebar-border shrink-0 ${isExpanded ? 'px-3 py-3' : 'px-2 py-2'}`}>
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2.5 px-2 py-2 mb-2 rounded-md hover:bg-sidebar-surface-hover cursor-pointer transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center text-[11px] font-semibold text-white shrink-0">
                JD
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-medium text-sidebar-text truncate">John Doe</div>
                <div className="text-[10px] text-sidebar-text-muted truncate">Lead Auditor</div>
              </div>
              <span className="text-white/[0.45] text-[14px]">⋯</span>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center gap-2 text-sidebar-text-muted hover:text-sidebar-text transition-colors p-1.5 rounded-md hover:bg-sidebar-surface-hover cursor-pointer"
          title={isExpanded ? 'Collapse' : 'Expand'}
          aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {isExpanded ? <PanelLeftClose size={15} /> : <PanelLeft size={15} />}
          <AnimatePresence>
            {isExpanded && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.12 }}
                className="text-[11px] overflow-hidden whitespace-nowrap"
              >
                Collapse
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.div>
  );
}
