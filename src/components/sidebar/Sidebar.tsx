import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageSquare, Workflow, Database, LayoutDashboard,
  FileBarChart, ChevronDown, PanelLeft,
  AlertTriangle, Sparkles, Building2, Home, Calendar,
  Shield, Search as SearchIcon, Settings, Clock, Check,
  Wand2, MoreHorizontal, LogOut, HelpCircle, ExternalLink,
  ClipboardCheck, FileText, Target
} from 'lucide-react';
import type { View } from '../../hooks/useAppState';

interface SidebarProps {
  view: View;
  setView: (v: View) => void;
  expanded: boolean;
  toggleSidebar: () => void;
  setSidebarExpanded: (v: boolean) => void;
}

/* ── Flat nav item ── */
function NavItem({ icon: Icon, label, active, expanded, onClick, badge }: {
  icon: React.ElementType; label: string; active: boolean; expanded: boolean; onClick: () => void; badge?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={!expanded ? label : undefined}
      className={`
        flex items-center gap-2.5 rounded-lg transition-colors duration-150 relative cursor-pointer
        ${expanded ? 'w-full h-8 px-3.5' : 'w-8 h-8 mx-auto px-0 justify-center'}
        ${active
          ? 'bg-sidebar-surface-active text-sidebar-accent font-semibold'
          : 'text-sidebar-text hover:bg-sidebar-surface-hover hover:text-sidebar-accent'
        }
      `}
    >
      {active && (
        <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-sidebar-accent rounded-r-lg" />
      )}
      <Icon size={18} className="shrink-0" />
      <AnimatePresence>
        {expanded && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.15 }}
            className="text-[14px] leading-[20px] truncate overflow-hidden whitespace-nowrap"
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
            className="ml-auto text-[12px] font-semibold bg-sidebar-accent text-brand-600 px-[7px] py-[2px] rounded-full tabular-nums"
          >
            {badge}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

/* ── Section divider with optional label ── */
function Divider({ label, expanded }: { label?: string; expanded: boolean }) {
  if (!expanded || !label) {
    return (
      <div className="mx-0 py-[13.5px]">
        <div className="h-px bg-sidebar-border" />
      </div>
    );
  }
  return (
    <div className="px-3.5 py-2">
      <span className="text-[12px] leading-[16px] font-medium uppercase text-white/60">{label}</span>
    </div>
  );
}

const TEAMS = [
  { id: 'irame-5', name: 'Irame 5' },
  { id: 'test', name: 'test' },
  { id: 'irame-india', name: 'Irame India' },
];

export default function Sidebar({ view, setView, expanded, toggleSidebar }: SidebarProps) {
  const [hoverExpanded, setHoverExpanded] = useState(false);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [teamOpen, setTeamOpen] = useState(false);
  const [activeTeam, setActiveTeam] = useState('irame-5');
  const [teamSearch, setTeamSearch] = useState('');
  const teamRef = useRef<HTMLDivElement>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [signOutConfirm, setSignOutConfirm] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!teamOpen) return;
    const close = (e: MouseEvent) => {
      if (teamRef.current && !teamRef.current.contains(e.target as Node)) setTeamOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [teamOpen]);

  useEffect(() => {
    if (!userMenuOpen) return;
    const close = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [userMenuOpen]);

  const filteredTeams = TEAMS.filter(t => t.name.toLowerCase().includes(teamSearch.toLowerCase()));

  const isExpanded = expanded || hoverExpanded;

  const handleMouseEnter = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    if (!expanded) {
      hoverTimerRef.current = setTimeout(() => setHoverExpanded(true), 200);
    }
  };

  const handleMouseLeave = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    if (!expanded) {
      hoverTimerRef.current = setTimeout(() => setHoverExpanded(false), 250);
    }
  };

  /* View group helpers for active detection */
  const workflowViews: View[] = ['workflow-templates', 'workflow-detail', 'workflow-library', 'workflow-executor'];
  const aiConciergeViews: View[] = ['ai-concierge', 'ai-concierge-forensics', 'ai-concierge-table-extractor'];
  const adminViews: View[] = ['admin-users', 'admin-roles', 'admin-settings', 'admin-integrations', 'admin-logs'];

  return (
    <motion.div
      animate={{ width: isExpanded ? 256 : 64 }}
      transition={{
        duration: 0.28,
        // ease: [0.22, 1, 0.36, 1],
      }}
      className="h-full bg-sidebar-bg noise-texture flex flex-col shrink-0 overflow-hidden z-50"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* ── Logo row + team switcher ── */}
      <div className={`border-b border-sidebar-border shrink-0 relative h-[59px] flex items-center ${isExpanded ? 'px-4' : 'px-0 justify-center'}`} ref={teamRef}>
        <div className={`flex items-center ${isExpanded ? 'gap-3' : 'justify-center'}`}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-400 flex items-center justify-center shrink-0" style={{ boxShadow: '0 2px 8px rgb(106 18 205 / 0.30)' }}>
            <Sparkles size={14} className="text-white" />
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
                <div className="text-[14px] font-bold text-sidebar-accent leading-tight whitespace-nowrap">IRAME.AI</div>
                <button
                  onClick={() => { setTeamOpen(p => !p); setTeamSearch(''); }}
                  className="text-[12px] text-white font-medium whitespace-nowrap flex items-center gap-1 hover:text-sidebar-text transition-colors cursor-pointer"
                >
                  Audit Intelligence
                  <ChevronDown size={8} className={`text-white transition-transform duration-150 ${teamOpen ? 'rotate-180' : ''}`} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Team switcher dropdown */}
        <AnimatePresence>
          {teamOpen && isExpanded && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={{ duration: 0.15, ease: [0.22, 0.68, 0, 1] }}
              className="absolute left-3 right-3 top-full mt-0 rounded-xl z-50 overflow-hidden border border-white/[0.12] bg-sidebar-bg shadow-2xl"
            >
              {/* Search */}
              <div className="p-3">
                <div
                  className="flex items-center gap-2.5 px-3.5 h-10 rounded-lg text-[13px]"
                  style={{
                    border: '1px solid rgba(163, 102, 240, 0.35)',
                    background: 'rgba(163, 102, 240, 0.08)',
                  }}
                >
                  <SearchIcon size={14} className="text-white shrink-0" />
                  <input
                    type="text"
                    placeholder="Search Team"
                    value={teamSearch}
                    onChange={e => setTeamSearch(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-white placeholder:text-white/60 text-[13px]"
                    style={{ boxShadow: 'none' }}
                    autoFocus
                  />
                </div>
              </div>

              <div className="h-px bg-white/[0.08]" />

              {/* Team list */}
              <div className="py-1.5 max-h-[220px] overflow-y-auto">
                {filteredTeams.map(team => {
                  const isActive = activeTeam === team.id;
                  return (
                    <button
                      key={team.id}
                      onClick={() => { setActiveTeam(team.id); setTeamOpen(false); }}
                      className={`w-full flex items-center justify-between px-4 py-3 text-[14px] transition-colors duration-100 cursor-pointer ${isActive ? 'text-white' : 'text-white hover:bg-white/[0.05]'}`}
                    >
                      <span style={{ fontWeight: isActive ? 600 : 400 }}>{team.name}</span>
                      {isActive ? (
                        <div className="w-[22px] h-[22px] rounded-full bg-brand-400 flex items-center justify-center">
                          <Check size={12} className="text-white" strokeWidth={2.5} />
                        </div>
                      ) : (
                        <div className="w-[22px] h-[22px] rounded-full border-[1.5px] border-white/20" />
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Navigation ── */}
      <nav className={`flex-1 overflow-y-auto overflow-x-hidden py-2 ${isExpanded ? 'px-2' : 'px-0'}`}>
        <div className="space-y-0.5">

          {/* Top actions */}
          <NavItem icon={MessageSquare} label="Ask IRA" active={view === 'chat' || view === 'chat-trash'} expanded={isExpanded} onClick={() => setView('chat')} />

          {/* Primary */}
          <NavItem icon={Home} label="Home" active={view === 'home'} expanded={isExpanded} onClick={() => setView('home')} />
          <NavItem icon={Clock} label="Recents" active={view === 'recents'} expanded={isExpanded} onClick={() => setView('recents')} />

          {/* ── PROGRAMS ── */}
          <Divider label="Programs" expanded={isExpanded} />

          <NavItem icon={Calendar} label="Planning" active={view === 'audit-planning'} expanded={isExpanded} onClick={() => setView('audit-planning')} />
          <NavItem icon={Building2} label="Process Hub" active={view === 'business-processes' || view === 'bp-detail'} expanded={isExpanded} onClick={() => setView('business-processes')} />
          <NavItem icon={AlertTriangle} label="Risk Register" active={view === 'audit-risk-register'} expanded={isExpanded} onClick={() => setView('audit-risk-register')} badge="14" />
          <NavItem icon={Shield} label="Control Library" active={view === 'governance-controls' || view === 'governance-control-detail'} expanded={isExpanded} onClick={() => setView('governance-controls')} />

          {/* ── GLOBAL ── */}
          <Divider label="Global" expanded={isExpanded} />

          <NavItem icon={LayoutDashboard} label="Dashboard" active={view === 'dashboards'} expanded={isExpanded} onClick={() => setView('dashboards')} />
          <NavItem icon={FileBarChart} label="Report" active={view === 'reports' || view === 'report-history' || view === 'report-builder'} expanded={isExpanded} onClick={() => setView('reports')} />
          <NavItem icon={Workflow} label="Workflow Library" active={workflowViews.includes(view)} expanded={isExpanded} onClick={() => setView('workflow-library')} />
          <NavItem icon={Wand2} label="AI Concierge" active={aiConciergeViews.includes(view)} expanded={isExpanded} onClick={() => setView('ai-concierge')} />

          {/* ── SYSTEM ── */}
          <Divider label="System" expanded={isExpanded} />

          <NavItem icon={Database} label="Knowledge Hub" active={view === 'knowledge-hub' || view === 'data-sources' || view === 'configuration'} expanded={isExpanded} onClick={() => setView('knowledge-hub')} />
          <NavItem icon={Settings} label="Admin" active={adminViews.includes(view)} expanded={isExpanded} onClick={() => setView('admin-users')} />

        </div>
      </nav>

      {/* ── User profile ── */}
      <div className={`border-t border-sidebar-border shrink-0 relative py-3 ${isExpanded ? 'px-3' : 'px-0'}`} ref={userMenuRef}>
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg bg-sidebar-surface border border-sidebar-border cursor-pointer hover:bg-sidebar-surface-hover transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center text-[12px] font-bold text-brand-600 shrink-0">
                JD
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-sidebar-accent truncate">John Doe</div>
                <div className="text-[12px] text-white truncate">Lead Auditor</div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setUserMenuOpen(p => !p); setSignOutConfirm(false); setHelpOpen(false); }}
                className="p-1 rounded-md hover:bg-white/[0.08] transition-colors text-white hover:text-sidebar-text cursor-pointer"
              >
                <MoreHorizontal size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* User menu dropdown */}
        <AnimatePresence>
          {userMenuOpen && isExpanded && (
            <motion.div
              initial={{ opacity: 0, y: 4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.98 }}
              transition={{ duration: 0.12 }}
              className="absolute left-3 right-3 bottom-full mb-0 rounded-xl z-50 overflow-hidden border border-white/[0.12] bg-sidebar-bg shadow-2xl"
            >
              {signOutConfirm ? (
                <div className="p-4">
                  <div className="text-[13px] font-semibold text-white mb-1">Sign out?</div>
                  <div className="text-[12px] text-white/50 mb-4">You'll need to sign in again to access your workspace.</div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSignOutConfirm(false)}
                      className="flex-1 px-3 py-2 rounded-lg text-[13px] font-medium text-white/80 border border-white/[0.12] hover:bg-white/[0.06] transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => { setSignOutConfirm(false); setUserMenuOpen(false); }}
                      className="flex-1 px-3 py-2 rounded-lg text-[13px] font-medium text-white bg-risk hover:bg-risk-700 transition-colors cursor-pointer"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="py-1.5">
                    <div className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-white cursor-not-allowed">
                      <Building2 size={14} className="text-white" />
                      Irame Labs Pvt Ltd
                    </div>
                    <button
                      onClick={() => setHelpOpen(p => !p)}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                    >
                      <HelpCircle size={14} className="text-white" />
                      <span className="flex-1 text-left">Help & Support</span>
                      <ChevronDown size={12} className={`text-white transition-transform duration-150 ${helpOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {helpOpen && (
                      <>
                        <div className="h-px mx-3 bg-white/[0.08]" />
                        <div className="py-1">
                          {[
                            { label: 'Get Started', url: 'https://irame.ai/get-started' },
                            { label: 'Term of Use', url: 'https://irame.ai/terms' },
                            { label: 'Privacy Policy', url: 'https://irame.ai/privacy' },
                          ].map(item => (
                            <button
                              key={item.label}
                              onClick={() => { setUserMenuOpen(false); setHelpOpen(false); window.open(item.url, '_blank'); }}
                              className="w-full flex items-center justify-between px-4 py-2.5 text-[13px] text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                            >
                              {item.label}
                              <ExternalLink size={12} className="text-white" />
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                    <div className="h-px mx-3 my-1 bg-white/[0.08]" />
                    <button
                      onClick={() => setSignOutConfirm(true)}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-red-400 hover:bg-white/[0.06] hover:text-red-300 transition-colors cursor-pointer"
                    >
                      <LogOut size={14} />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {!isExpanded && (
          <button
            onClick={toggleSidebar}
            className="w-full flex items-center justify-center text-white hover:text-sidebar-text transition-colors p-1.5 rounded-lg hover:bg-sidebar-surface-hover cursor-pointer"
            title="Expand"
            aria-label="Expand sidebar"
          >
            <PanelLeft size={15} />
          </button>
        )}
      </div>
    </motion.div>
  );
}
