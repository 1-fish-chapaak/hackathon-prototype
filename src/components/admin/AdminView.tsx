import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users, Shield, Settings, Plug, ScrollText,
  UserPlus, Clock, CheckCircle2, Mail,
  Construction,
} from 'lucide-react';

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
  initials: string;
  email: string;
  role: string;
  roleColor: string;
  team: string;
  status: 'Active' | 'Invited';
  lastLogin: string;
}

const mockUsers: MockUser[] = [
  {
    name: 'John Doe',
    initials: 'JD',
    email: 'john@company.com',
    role: 'Lead Auditor',
    roleColor: 'bg-brand-50 text-brand-700 border-brand-100',
    team: 'SOX Audit Team',
    status: 'Active',
    lastLogin: 'Today',
  },
  {
    name: 'Sarah Miller',
    initials: 'SM',
    email: 'sarah@company.com',
    role: 'Staff Auditor',
    roleColor: 'bg-evidence-50 text-evidence-700 border-evidence-50',
    team: 'SOX Audit Team',
    status: 'Active',
    lastLogin: 'Yesterday',
  },
  {
    name: 'Mike Ross',
    initials: 'MR',
    email: 'mike@company.com',
    role: 'Audit Manager',
    roleColor: 'bg-compliant-50 text-compliant-700 border-compliant-50',
    team: 'Management',
    status: 'Active',
    lastLogin: 'Mar 28',
  },
  {
    name: 'Jane Chen',
    initials: 'JC',
    email: 'jane@company.com',
    role: 'Staff Auditor',
    roleColor: 'bg-evidence-50 text-evidence-700 border-evidence-50',
    team: 'IFC Team',
    status: 'Active',
    lastLogin: 'Mar 27',
  },
  {
    name: 'Alex Kumar',
    initials: 'AK',
    email: 'alex@company.com',
    role: 'External Auditor',
    roleColor: 'bg-mitigated-50 text-mitigated-700 border-mitigated-50',
    team: '\u2014',
    status: 'Invited',
    lastLogin: '\u2014',
  },
];

const avatarTones = [
  'bg-brand-600',
  'bg-evidence',
  'bg-compliant',
  'bg-mitigated',
  'bg-high',
];

function UsersTab() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Actions + Stats */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brand-50 border border-violet-100">
            <Users size={13} className="text-brand-600" />
            <span className="text-[12px] font-semibold text-brand-700">Total Users: 12</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-compliant-50 border border-compliant-50">
            <CheckCircle2 size={13} className="text-compliant" />
            <span className="text-[12px] font-semibold text-compliant-700">Active: 10</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-mitigated-50 border border-mitigated-50">
            <Mail size={13} className="text-mitigated-700" />
            <span className="text-[12px] font-semibold text-mitigated-700">Invited: 2</span>
          </div>
        </div>

        <button className="flex items-center gap-2 px-4 h-10 rounded-md bg-brand-600 text-white text-[13px] font-semibold hover:bg-brand-500 transition-colors cursor-pointer">
          <UserPlus size={14} />
          Invite user
        </button>
      </div>

      {/* Table */}
      <div className="bg-canvas-elevated rounded-xl border border-canvas-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-canvas-border bg-paper-50">
              <th className="text-left px-6 py-3 text-[12px] font-semibold text-ink-500">User</th>
              <th className="text-left px-6 py-3 text-[12px] font-semibold text-ink-500">Email</th>
              <th className="text-left px-6 py-3 text-[12px] font-semibold text-ink-500">Role</th>
              <th className="text-left px-6 py-3 text-[12px] font-semibold text-ink-500">Team</th>
              <th className="text-left px-6 py-3 text-[12px] font-semibold text-ink-500">Status</th>
              <th className="text-left px-6 py-3 text-[12px] font-semibold text-ink-500">Last login</th>
            </tr>
          </thead>
          <tbody>
            {mockUsers.map((user, i) => (
              <motion.tr
                key={user.email}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.05 + i * 0.05 }}
                className="border-b border-border-light/40 last:border-0 hover:bg-brand-50/30 transition-colors"
              >
                {/* User */}
                <td className="px-10 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full ${avatarTones[i % avatarTones.length]} flex items-center justify-center`}>
                      <span className="text-[12px] font-bold text-white">{user.initials}</span>
                    </div>
                    <span className="text-[13px] font-semibold text-text">{user.name}</span>
                  </div>
                </td>

                {/* Email */}
                <td className="px-10 py-4">
                  <span className="text-[12.5px] text-text-secondary">{user.email}</span>
                </td>

                {/* Role */}
                <td className="px-10 py-4">
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[12px] font-semibold border ${user.roleColor}`}>
                    {user.role}
                  </span>
                </td>

                {/* Team */}
                <td className="px-10 py-4">
                  <span className="text-[12.5px] text-text-secondary">{user.team}</span>
                </td>

                {/* Status */}
                <td className="px-10 py-4">
                  {user.status === 'Active' ? (
                    <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-compliant">
                      <span className="w-1.5 h-1.5 rounded-full bg-compliant animate-pulse" />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-mitigated-700">
                      <Clock size={11} />
                      Invited
                    </span>
                  )}
                </td>

                {/* Last Login */}
                <td className="px-10 py-4">
                  <span className="text-[12.5px] text-text-muted">{user.lastLogin}</span>
                </td>
              </motion.tr>
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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center justify-center py-24"
    >
      <div className="w-16 h-16 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center mb-5">
        <Icon size={28} className="text-brand-700" />
      </div>
      <h3 className="text-[18px] font-semibold text-ink-800 mb-2">{tab.label}</h3>
      <p className="text-[13px] text-ink-500 mb-4">This section is under development.</p>
      <div className="flex items-center gap-2 px-3 h-8 rounded-md bg-brand-50 border border-brand-100">
        <Construction size={14} className="text-brand-700" />
        <span className="text-[12px] font-semibold text-brand-700">Coming soon</span>
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
      {/* Hero */}
      <div className="border-b border-canvas-border bg-canvas-elevated">
        <div className="p-8">
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
          >
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center">
                <Settings size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-[28px] font-semibold text-ink-900">
                  Administration
                </h1>
                <p className="text-[14px] text-ink-500 leading-relaxed">
                  Manage users, teams, roles, and platform settings.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.05, ease: [0.2, 0, 0, 1] }}
            className="mt-6 flex items-center gap-1 bg-paper-50 rounded-lg border border-canvas-border p-1 w-fit"
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setCurrentTab(tab.id)}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-md text-[12.5px] font-semibold transition-colors cursor-pointer ${
                    isActive
                      ? 'text-brand-700'
                      : 'text-ink-500 hover:text-ink-700'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="admin-tab-bg"
                      className="absolute inset-0 bg-canvas-elevated rounded-md border border-canvas-border"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <Icon size={14} />
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </motion.div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-8">
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
