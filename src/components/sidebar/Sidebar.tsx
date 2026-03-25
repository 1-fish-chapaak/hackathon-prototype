import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageSquare, Workflow, ShieldCheck, Database, LayoutDashboard,
  FileBarChart, ChevronDown, PanelLeftClose, PanelLeft,
  AlertTriangle, ClipboardCheck, Sparkles, Building2, Library, Home, Plus, Calendar
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

export default function Sidebar({ view, setView, expanded, toggleSidebar, setSidebarExpanded }: SidebarProps) {
  const [auditOpen, setAuditOpen] = useState(true);
  const [hoverExpanded, setHoverExpanded] = useState(false);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const auditViews: View[] = ['business-processes', 'bp-detail', 'audit-risk-register', 'audit-execution', 'workflow-library', 'audit-planning'];
  const isAuditView = auditViews.includes(view);
  const isWorkflowView = view === 'workflow-builder' || view === 'workflow-templates' || view === 'workflow-detail';

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
      animate={{ width: isExpanded ? 240 : 64 }}
      transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
      className="h-full bg-[#1a0a2e] flex flex-col shrink-0 overflow-hidden z-50"
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
                <div className="text-[14px] font-bold text-white leading-tight tracking-tight whitespace-nowrap">Auditify</div>
                <div className="text-[10.5px] text-white/40 font-medium whitespace-nowrap">Copilot</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* New Chat button */}
      <div className={`shrink-0 ${isExpanded ? 'px-3 pt-3 pb-1' : 'px-1.5 pt-3 pb-1'}`}>
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

      {/* Nav */}
      <nav className={`flex-1 overflow-y-auto overflow-x-hidden ${isExpanded ? 'px-2.5 py-3' : 'px-1.5 py-3'}`}>
        <div className="space-y-0.5">
          {/* Home */}
          <NavItem icon={Home} label="Home" active={view === 'home'} expanded={isExpanded} onClick={() => setView('home')} />

          {/* Chat */}
          <NavItem icon={MessageSquare} label="Chat" active={view === 'chat'} expanded={isExpanded} onClick={() => setView('chat')} />

          {/* Workflows */}
          <NavItem icon={Workflow} label="Workflows" active={isWorkflowView} expanded={isExpanded} onClick={() => setView('workflow-templates')} badge="8" />

          {/* Audit Management - expandable */}
          <div>
            <button
              onClick={() => {
                if (isExpanded) { setAuditOpen(p => !p); }
                else { setSidebarExpanded(true); setAuditOpen(true); }
              }}
              title={!isExpanded ? 'Audit Management' : undefined}
              className={`
                w-full flex items-center gap-2.5 rounded-lg transition-all duration-150 cursor-pointer
                ${isExpanded ? 'px-3 py-2' : 'px-0 py-2.5 justify-center'}
                ${isAuditView ? 'bg-white/10 text-white font-semibold' : 'text-white/50 hover:bg-white/5 hover:text-white/80'}
              `}
            >
              <ShieldCheck size={17} className="shrink-0" />
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center flex-1 gap-1 overflow-hidden"
                  >
                    <span className="text-[13px] flex-1 text-left whitespace-nowrap">Audit</span>
                    <ChevronDown size={12} className={`transition-transform duration-200 ${auditOpen ? '' : '-rotate-90'}`} />
                  </motion.div>
                )}
              </AnimatePresence>
              {!isExpanded && isAuditView && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-white rounded-r-full" />
              )}
            </button>

            <AnimatePresence>
              {isExpanded && auditOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="overflow-hidden"
                >
                  <div className="ml-5 pl-3 border-l border-white/10 space-y-0.5 py-1">
                    <SubNavItem icon={Building2} label="Business Processes" active={view === 'business-processes' || view === 'bp-detail'} onClick={() => setView('business-processes')} />
                    <SubNavItem icon={AlertTriangle} label="Risk Register" active={view === 'audit-risk-register'} onClick={() => setView('audit-risk-register')} />
                    <SubNavItem icon={ClipboardCheck} label="Engagements" active={view === 'audit-execution'} onClick={() => setView('audit-execution')} />
                    <SubNavItem icon={Calendar} label="Audit Planning" active={view === 'audit-planning'} onClick={() => setView('audit-planning')} />
                    <SubNavItem icon={Library} label="Workflow Library" active={view === 'workflow-library'} onClick={() => setView('workflow-library')} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Data Sources */}
          <NavItem icon={Database} label="Data Sources" active={view === 'data-sources'} expanded={isExpanded} onClick={() => setView('data-sources')} />

          {/* Dashboards */}
          <NavItem icon={LayoutDashboard} label="Dashboards" active={view === 'dashboards'} expanded={isExpanded} onClick={() => setView('dashboards')} />

          {/* Reports */}
          <NavItem icon={FileBarChart} label="Reports" active={view === 'reports' || view === 'report-history' || view === 'report-builder'} expanded={isExpanded} onClick={() => setView('reports')} />
        </div>
      </nav>

      {/* Footer */}
      <div className={`border-t border-white/10 shrink-0 ${isExpanded ? 'px-3 py-3' : 'px-2 py-2'}`}>
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
