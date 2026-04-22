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
        w-full flex items-center gap-2.5 rounded-lg transition-all duration-150 relative group cursor-pointer
        ${expanded ? 'px-3 py-2' : 'px-0 py-2.5 justify-center'}
        ${active
          ? 'bg-white/10 text-white font-semibold'
          : 'text-white/50 hover:bg-white/5 hover:text-white/80'
        }
      `}
    >
      <Icon size={17} className="shrink-0" />
      <AnimatePresence>
        {expanded && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.15 }}
            className="text-[13px] truncate overflow-hidden whitespace-nowrap"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {expanded && badge && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.12 }}
            className="ml-auto text-[10px] font-bold bg-white/10 text-white/70 px-1.5 py-0.5 rounded-full"
          >
            {badge}
          </motion.span>
        )}
      </AnimatePresence>
      {!expanded && active && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-white rounded-r-full" />
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
          ? 'text-white font-semibold bg-white/10'
          : 'text-white/40 hover:text-white/70 hover:bg-white/5'
      }`}
    >
      {Icon && <Icon size={13} />}
      {label}
    </button>
  );
}

function SectionLabel({ label, expanded }: { label: string; expanded: boolean }) {
  if (!expanded) return <div className="h-px bg-white/5 my-2 mx-2" />;
  return (
    <div className="px-3 pt-4 pb-1">
      <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/25">{label}</span>
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
          w-full flex items-center gap-2.5 rounded-lg transition-all duration-150 cursor-pointer
          ${expanded ? 'px-3 py-2' : 'px-0 py-2.5 justify-center'}
          ${active ? 'bg-white/10 text-white font-semibold' : 'text-white/50 hover:bg-white/5 hover:text-white/80'}
        `}
      >
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
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-white rounded-r-full" />
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
            <div className="ml-5 pl-3 border-l border-white/10 space-y-0.5 py-1">
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
      transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
      className="h-full bg-gradient-to-b from-[#1e0c35] via-[#1a0a2e] to-[#140820] noise-texture flex flex-col shrink-0 overflow-hidden z-50"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Brand */}
      <div className={`border-b border-white/10 shrink-0 ${isExpanded ? 'px-4 py-4' : 'px-2 py-3'}`}>
        <div className={`flex items-center ${isExpanded ? 'gap-3' : 'justify-center'}`}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-medium flex items-center justify-center shrink-0 shadow-sm">
            <Sparkles size={15} className="text-white" />
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
                <div className="text-[14px] font-bold text-white leading-tight tracking-tight whitespace-nowrap">IRAME.AI</div>
                <div className="text-[10.5px] text-white/40 font-medium whitespace-nowrap">Audit Intelligence</div>
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
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/5 text-white/30 text-[12px] cursor-pointer hover:bg-white/8 hover:text-white/50 transition-colors">
              <Command size={13} />
              <span className="flex-1">Search or ask IRA...</span>
              <kbd className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Chat button */}
      <div className={`shrink-0 ${isExpanded ? 'px-3 pt-2 pb-1' : 'px-1.5 pt-3 pb-1'}`}>
        <button
          onClick={() => setView('chat')}
          className={`w-full flex items-center gap-2 rounded-lg transition-all cursor-pointer ${
            isExpanded ? 'px-3 py-2.5 bg-gradient-to-r from-primary to-primary-medium hover:from-primary-hover hover:to-primary text-white text-[13px] font-semibold shadow-lg shadow-primary/20' : 'justify-center py-2.5 bg-primary/20 hover:bg-primary/30 text-primary-medium'
          }`}
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
      <nav className={`flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-white/10 ${isExpanded ? 'px-2.5 py-2' : 'px-1.5 py-3'}`}>
        <div className="space-y-0.5">
          {/* ─── PRIMARY ─── */}
          <NavItem icon={Home} label="Home" active={view === 'home'} expanded={isExpanded} onClick={() => setView('home')} />
          <NavItem icon={MessageSquare} label="IRA AI" active={view === 'chat' || view === 'chat-trash'} expanded={isExpanded} onClick={() => setView('chat')} />

          {/* ─── AUDIT LIFECYCLE ─── */}
          <SectionLabel label="Audit Lifecycle" expanded={isExpanded} />

          {/* Governance */}
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

          {/* Execution */}
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

          {/* Workflows */}
          <NavItem icon={Workflow} label="Workflows" active={isWorkflowView} expanded={isExpanded} onClick={() => setView('workflow-templates')} badge="8" />

          {/* ─── INTELLIGENCE ─── */}
          <SectionLabel label="Intelligence" expanded={isExpanded} />

          <NavItem icon={LayoutDashboard} label="Dashboards" active={view === 'dashboards'} expanded={isExpanded} onClick={() => setView('dashboards')} />
          <NavItem icon={FileBarChart} label="Reports" active={view === 'reports' || view === 'report-history' || view === 'report-builder'} expanded={isExpanded} onClick={() => setView('reports')} />

          {/* AI Concierge */}
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

          {/* ─── SYSTEM ─── */}
          <SectionLabel label="System" expanded={isExpanded} />

          <NavItem icon={Database} label="Configuration" active={view === 'data-sources' || view === 'configuration'} expanded={isExpanded} onClick={() => setView('data-sources')} />

          {/* Admin */}
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
      <div className={`border-t border-white/10 shrink-0 ${isExpanded ? 'px-3 py-3' : 'px-2 py-2'}`}>
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2.5 px-2 py-2 mb-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-[11px] font-bold text-white shrink-0">
                JD
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-medium text-white/80 truncate">John Doe</div>
                <div className="text-[10px] text-white/30 truncate">Lead Auditor</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center gap-2 text-white/30 hover:text-white/60 transition-colors p-1.5 rounded-lg hover:bg-white/5 cursor-pointer"
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
