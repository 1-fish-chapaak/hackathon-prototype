import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageSquare, Workflow, Database, LayoutDashboard,
  FileBarChart, ChevronDown, PanelLeft,
  AlertTriangle, Sparkles, Building2, Home, Calendar,
  Shield, Search as SearchIcon, Settings, Clock, Check,
  Wand2
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
        w-full flex items-center gap-2.5 rounded-lg transition-colors duration-150 relative cursor-pointer
        ${expanded ? 'h-9 px-3.5' : 'h-10 px-0 justify-center'}
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
            className="text-[13.5px] truncate overflow-hidden whitespace-nowrap"
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
            className="ml-auto text-[10.5px] font-semibold bg-sidebar-accent text-brand-600 px-[7px] py-[2px] rounded-full tabular-nums"
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
  if (!expanded || !label) return <div className="h-px bg-sidebar-border my-2 mx-3" />;
  return (
    <div className="px-3.5 pt-2 pb-1">
      <span className="text-[10px] font-medium uppercase tracking-normal text-sidebar-text-dim">{label}</span>
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

  useEffect(() => {
    if (!teamOpen) return;
    const close = (e: MouseEvent) => {
      if (teamRef.current && !teamRef.current.contains(e.target as Node)) setTeamOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [teamOpen]);

  const filteredTeams = TEAMS.filter(t => t.name.toLowerCase().includes(teamSearch.toLowerCase()));

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

  /* View group helpers for active detection */
  const workflowViews: View[] = ['workflow-templates', 'workflow-detail', 'workflow-library', 'workflow-executor'];
  const aiConciergeViews: View[] = ['ai-concierge', 'ai-concierge-forensics', 'ai-concierge-table-extractor'];
  const adminViews: View[] = ['admin-users', 'admin-roles', 'admin-settings', 'admin-integrations', 'admin-logs'];

  return (
    <motion.div
      animate={{ width: isExpanded ? 256 : 64 }}
      transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
      className="h-full bg-sidebar-bg noise-texture flex flex-col shrink-0 overflow-hidden z-50"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* ── Logo row + team switcher ── */}
      <div className={`border-b border-sidebar-border shrink-0 relative ${isExpanded ? 'px-4 pt-[18px] pb-4' : 'px-2 py-3'}`} ref={teamRef}>
        <div className={`flex items-center ${isExpanded ? 'gap-3' : 'justify-center'}`}>
          <div className="w-[30px] h-[30px] rounded-lg bg-gradient-to-br from-brand-500 to-brand-400 flex items-center justify-center shrink-0" style={{ boxShadow: '0 2px 8px rgb(106 18 205 / 0.30)' }}>
            <Sparkles size={12} className="text-white" />
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
                <div className="text-[14px] font-bold text-sidebar-accent leading-tight tracking-normal whitespace-nowrap">IRAME.AI</div>
                <button
                  onClick={() => { setTeamOpen(p => !p); setTeamSearch(''); }}
                  className="text-[12px] text-sidebar-text-dim font-medium whitespace-nowrap flex items-center gap-1 hover:text-sidebar-text transition-colors cursor-pointer"
                >
                  Audit Intelligence
                  <ChevronDown size={8} className={`text-sidebar-text-muted transition-transform duration-150 ${teamOpen ? 'rotate-180' : ''}`} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Team switcher dropdown */}
        <AnimatePresence>
          {teamOpen && isExpanded && (
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={{ duration: 0.12 }}
              className="absolute left-3 right-3 top-full mt-1 rounded-xl shadow-2xl z-50 overflow-hidden"
              style={{
                background: 'linear-gradient(180deg, #1E0B3B 0%, #170330 100%)',
                border: '1px solid rgba(163, 102, 240, 0.18)',
                boxShadow: '0 8px 32px rgba(23, 3, 48, 0.6), 0 0 0 1px rgba(163, 102, 240, 0.08)',
              }}
            >
              {/* Search */}
              <div className="p-3">
                <div
                  className="flex items-center gap-2.5 px-3.5 h-10 rounded-lg text-[13px] transition-colors"
                  style={{
                    border: '1.5px solid rgba(163, 102, 240, 0.45)',
                    background: 'rgba(163, 102, 240, 0.06)',
                    boxShadow: '0 0 12px rgba(163, 102, 240, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.03)',
                  }}
                >
                  <SearchIcon size={15} className="text-brand-400/60 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search Team"
                    value={teamSearch}
                    onChange={e => setTeamSearch(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-white placeholder:text-white/40 text-[13px]"
                    style={{ boxShadow: 'none' }}
                    autoFocus
                  />
                </div>
              </div>

              <div className="h-px mx-3" style={{ background: 'linear-gradient(90deg, transparent, rgba(163, 102, 240, 0.2), transparent)' }} />

              {/* Team list */}
              <div className="py-1.5 max-h-[220px] overflow-y-auto">
                {filteredTeams.map(team => (
                  <button
                    key={team.id}
                    onClick={() => { setActiveTeam(team.id); setTeamOpen(false); }}
                    className="w-full flex items-center justify-between px-4 py-3 text-[14px] text-white/90 hover:bg-white/[0.06] transition-colors cursor-pointer"
                  >
                    <span style={{ fontWeight: activeTeam === team.id ? 600 : 400 }}>{team.name}</span>
                    {activeTeam === team.id ? (
                      <div className="w-[22px] h-[22px] rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #A366F0, #8838DE)', boxShadow: '0 2px 8px rgba(163, 102, 240, 0.4)' }}>
                        <Check size={12} className="text-white" strokeWidth={2.5} />
                      </div>
                    ) : (
                      <div className="w-[22px] h-[22px] rounded-full border-[1.5px] border-white/20" />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Navigation ── */}
      <nav className={`flex-1 overflow-y-auto overflow-x-hidden ${isExpanded ? 'px-2 py-2' : 'px-1.5 py-3'}`}>
        <div className="space-y-0.5">

          {/* Top actions */}
          <NavItem icon={MessageSquare} label="Ask IRA" active={view === 'chat' || view === 'chat-trash'} expanded={isExpanded} onClick={() => setView('chat')} />
          <NavItem icon={SearchIcon} label="Search" active={false} expanded={isExpanded} onClick={() => setView('chat')} />

          {/* Primary */}
          <NavItem icon={Home} label="Home" active={view === 'home'} expanded={isExpanded} onClick={() => setView('home')} />
          <NavItem icon={Clock} label="Recents" active={false} expanded={isExpanded} onClick={() => setView('home')} />

          {/* ── PROGRAMS ── */}
          <Divider label="Programs" expanded={isExpanded} />

          <NavItem icon={Calendar} label="Planning" active={view === 'audit-planning'} expanded={isExpanded} onClick={() => setView('audit-planning')} />
          <NavItem icon={Building2} label="Process Hub" active={view === 'business-processes' || view === 'bp-detail'} expanded={isExpanded} onClick={() => setView('business-processes')} />
          <NavItem icon={AlertTriangle} label="Risk Register" active={view === 'audit-risk-register'} expanded={isExpanded} onClick={() => setView('audit-risk-register')} badge="14" />
          <NavItem icon={Shield} label="Control Library" active={view === 'governance-controls' || view === 'governance-control-detail'} expanded={isExpanded} onClick={() => setView('governance-controls')} />

          {/* ── Main nav (no label, just divider) ── */}
          <Divider expanded={isExpanded} />

          <NavItem icon={LayoutDashboard} label="Dashboard" active={view === 'dashboards'} expanded={isExpanded} onClick={() => setView('dashboards')} />
          <NavItem icon={FileBarChart} label="Report" active={view === 'reports' || view === 'report-history' || view === 'report-builder'} expanded={isExpanded} onClick={() => setView('reports')} />
          <NavItem icon={Workflow} label="Workflow Library" active={workflowViews.includes(view)} expanded={isExpanded} onClick={() => setView('workflow-templates')} />
          <NavItem icon={Wand2} label="AI Concierge" active={aiConciergeViews.includes(view)} expanded={isExpanded} onClick={() => setView('ai-concierge')} />

          {/* ── Bottom nav ── */}
          <Divider expanded={isExpanded} />

          <NavItem icon={Database} label="Configuration" active={view === 'data-sources' || view === 'configuration'} expanded={isExpanded} onClick={() => setView('data-sources')} />
          <NavItem icon={Settings} label="Admin" active={adminViews.includes(view)} expanded={isExpanded} onClick={() => setView('admin-users')} />

        </div>
      </nav>

      {/* ── User profile ── */}
      <div className={`border-t border-sidebar-border shrink-0 ${isExpanded ? 'px-3 py-3' : 'px-2 py-2'}`}>
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg bg-sidebar-surface border border-sidebar-border cursor-pointer hover:bg-sidebar-surface-hover transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center text-[11px] font-bold text-brand-600 shrink-0">
                JD
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-sidebar-accent truncate">John Doe</div>
                <div className="text-[11px] text-sidebar-text-dim truncate">Lead Auditor</div>
              </div>
              <span className="text-sidebar-text-muted text-[14px]">⋯</span>
            </motion.div>
          )}
        </AnimatePresence>

        {!isExpanded && (
          <button
            onClick={toggleSidebar}
            className="w-full flex items-center justify-center text-sidebar-text-muted hover:text-sidebar-text transition-colors p-1.5 rounded-lg hover:bg-sidebar-surface-hover cursor-pointer"
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
