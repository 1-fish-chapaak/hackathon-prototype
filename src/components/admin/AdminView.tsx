import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users, Shield, Settings, Plug, ScrollText,
  UserPlus, Construction,
} from 'lucide-react';
import { StatusBadge, Avatar } from '../shared/StatusBadge';

interface Props {
  activeTab?: string;
}

type TabId = 'users' | 'roles' | 'settings' | 'integrations' | 'logs';

interface Tab {
  id: TabId;
  label: string;
  icon: typeof Users;
}

const tabs: Tab[] = [
  { id: 'users', label: 'Users & Teams', icon: Users },
  { id: 'roles', label: 'Roles & Permissions', icon: Shield },
  { id: 'settings', label: 'System Settings', icon: Settings },
  { id: 'integrations', label: 'Integrations', icon: Plug },
  { id: 'logs', label: 'Audit Logs', icon: ScrollText },
];

interface MockUser {
  name: string;
  email: string;
  role: string;
  team: string;
  status: 'active' | 'invited';
  lastLogin: string;
}

const mockUsers: MockUser[] = [
  { name: 'John Doe',     email: 'john@company.com',   role: 'Lead Auditor',     team: 'SOX Audit Team', status: 'active',  lastLogin: 'Today' },
  { name: 'Sarah Miller', email: 'sarah@company.com',  role: 'Staff Auditor',    team: 'SOX Audit Team', status: 'active',  lastLogin: 'Yesterday' },
  { name: 'Mike Ross',    email: 'mike@company.com',   role: 'Audit Manager',    team: 'Management',     status: 'active',  lastLogin: 'Mar 28, 2026' },
  { name: 'Jane Chen',    email: 'jane@company.com',   role: 'Staff Auditor',    team: 'IFC Team',       status: 'active',  lastLogin: 'Mar 27, 2026' },
  { name: 'Alex Kumar',   email: 'alex@company.com',   role: 'External Auditor', team: '—',              status: 'invited', lastLogin: '—' },
];

function UsersTab() {
  const totalUsers = mockUsers.length;
  const activeUsers = mockUsers.filter(u => u.status === 'active').length;
  const invitedUsers = mockUsers.filter(u => u.status === 'invited').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
    >
      {/* Stats + primary action */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-6 tabular-nums text-[13px] text-ink-700">
          <span><span className="font-display text-[20px] font-[420] text-ink-900 mr-1.5">{totalUsers}</span>total users</span>
          <span><span className="font-display text-[20px] font-[420] text-compliant-700 mr-1.5">{activeUsers}</span>active</span>
          <span><span className="font-display text-[20px] font-[420] text-mitigated-700 mr-1.5">{invitedUsers}</span>invited</span>
        </div>

        <button className="flex items-center gap-2 px-4 h-10 rounded-md bg-brand-600 hover:bg-brand-500 active:bg-brand-800 text-white text-[13px] font-semibold transition-colors cursor-pointer">
          <UserPlus size={14} />
          Invite user
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-canvas-border bg-canvas-elevated overflow-hidden">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-canvas-border bg-paper-50/40">
              <th className="text-left px-4 h-10 text-[11px] font-semibold text-ink-500">User</th>
              <th className="text-left px-4 h-10 text-[11px] font-semibold text-ink-500">Email</th>
              <th className="text-left px-4 h-10 text-[11px] font-semibold text-ink-500">Role</th>
              <th className="text-left px-4 h-10 text-[11px] font-semibold text-ink-500">Team</th>
              <th className="text-left px-4 h-10 text-[11px] font-semibold text-ink-500">Status</th>
              <th className="text-left px-4 h-10 text-[11px] font-semibold text-ink-500">Last login</th>
            </tr>
          </thead>
          <tbody>
            {mockUsers.map((user, i) => (
              <tr
                key={user.email}
                className={`h-12 ${i > 0 ? 'border-t border-canvas-border' : ''} hover:bg-brand-50/40 transition-colors`}
              >
                <td className="px-4">
                  <div className="flex items-center gap-3">
                    <Avatar name={user.name} size={28} />
                    <span className="text-ink-900 font-medium">{user.name}</span>
                  </div>
                </td>
                <td className="px-4 text-ink-700">{user.email}</td>
                <td className="px-4 text-ink-700">{user.role}</td>
                <td className="px-4 text-ink-700">{user.team}</td>
                <td className="px-4"><StatusBadge status={user.status} /></td>
                <td className="px-4 text-ink-500 tabular-nums">{user.lastLogin}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

function ComingSoonTab({ tab }: { tab: Tab }) {
  const Icon = tab.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
      className="flex flex-col items-center justify-center py-24"
    >
      <div className="w-14 h-14 rounded-md bg-brand-50 flex items-center justify-center mb-5">
        <Icon size={26} className="text-brand-700" />
      </div>
      <h3 className="font-display text-[22px] font-[420] text-ink-900 mb-2">{tab.label}</h3>
      <p className="text-[13px] text-ink-500 mb-4">This section is under development.</p>
      <div className="inline-flex items-center gap-2 px-3 h-7 rounded-full bg-mitigated-50 text-mitigated-700 text-[12px] font-medium">
        <Construction size={12} />
        Coming soon
      </div>
    </motion.div>
  );
}

export default function AdminView({ activeTab }: Props) {
  const resolveInitialTab = (): TabId => {
    if (activeTab === 'roles') return 'roles';
    if (activeTab === 'settings') return 'settings';
    if (activeTab === 'integrations') return 'integrations';
    if (activeTab === 'logs') return 'logs';
    return 'users';
  };

  const [currentTab, setCurrentTab] = useState<TabId>(resolveInitialTab);
  const activeTabObj = tabs.find((t) => t.id === currentTab)!;

  return (
    <div className="h-full overflow-y-auto bg-canvas">
      {/* Page header — Editorial: breadcrumb · serif title · context · tabs */}
      <div className="border-b border-canvas-border bg-canvas-elevated">
        <div className="max-w-6xl mx-auto px-8 pt-8 pb-0">
          <div className="font-mono text-[11px] text-ink-500 mb-2 tracking-tight">Admin · {activeTabObj.label}</div>
          <h1 className="font-display text-[34px] font-[420] tracking-tight text-ink-900 leading-[1.15]">Administration</h1>
          <p className="text-[14px] text-ink-500 mt-1 mb-6">Manage users, teams, roles, and platform settings.</p>

          {/* Tabs */}
          <div className="flex items-center gap-0 border-b border-transparent -mb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setCurrentTab(tab.id)}
                  className={`relative flex items-center gap-2 px-4 h-11 text-[13px] font-medium transition-colors cursor-pointer ${
                    isActive ? 'text-brand-700' : 'text-ink-500 hover:text-ink-700'
                  }`}
                >
                  <Icon size={14} />
                  {tab.label}
                  {isActive && (
                    <motion.div
                      layoutId="admin-tab-bar"
                      className="absolute left-0 right-0 -bottom-px h-[2px] bg-brand-600"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="max-w-6xl mx-auto px-8 py-8">
        <AnimatePresence mode="wait">
          {currentTab === 'users' ? (
            <UsersTab key="users" />
          ) : (
            <ComingSoonTab key={currentTab} tab={activeTabObj} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
