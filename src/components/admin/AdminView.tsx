import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users, Shield, Settings, Plug, ScrollText,
  UserPlus, Clock, CheckCircle2, Mail,
  Construction,
} from 'lucide-react';
import FloatingLines from '../shared/FloatingLines';

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
    roleColor: 'bg-violet-100 text-violet-700 border-violet-200',
    team: 'SOX Audit Team',
    status: 'Active',
    lastLogin: 'Today',
  },
  {
    name: 'Sarah Miller',
    initials: 'SM',
    email: 'sarah@company.com',
    role: 'Staff Auditor',
    roleColor: 'bg-blue-100 text-blue-700 border-blue-200',
    team: 'SOX Audit Team',
    status: 'Active',
    lastLogin: 'Yesterday',
  },
  {
    name: 'Mike Ross',
    initials: 'MR',
    email: 'mike@company.com',
    role: 'Audit Manager',
    roleColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    team: 'Management',
    status: 'Active',
    lastLogin: 'Mar 28',
  },
  {
    name: 'Jane Chen',
    initials: 'JC',
    email: 'jane@company.com',
    role: 'Staff Auditor',
    roleColor: 'bg-blue-100 text-blue-700 border-blue-200',
    team: 'IFC Team',
    status: 'Active',
    lastLogin: 'Mar 27',
  },
  {
    name: 'Alex Kumar',
    initials: 'AK',
    email: 'alex@company.com',
    role: 'External Auditor',
    roleColor: 'bg-amber-100 text-amber-700 border-amber-200',
    team: '\u2014',
    status: 'Invited',
    lastLogin: '\u2014',
  },
];

const avatarGradients = [
  'from-violet-500 to-purple-600',
  'from-sky-500 to-blue-600',
  'from-emerald-500 to-teal-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600',
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
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-violet-50 border border-violet-100">
            <Users size={13} className="text-violet-600" />
            <span className="text-[12px] font-semibold text-violet-700">Total Users: 12</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100">
            <CheckCircle2 size={13} className="text-emerald-600" />
            <span className="text-[12px] font-semibold text-emerald-700">Active: 10</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-100">
            <Mail size={13} className="text-amber-600" />
            <span className="text-[12px] font-semibold text-amber-700">Invited: 2</span>
          </div>
        </div>

        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white text-[13px] font-semibold shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 hover:scale-[1.02] transition-all cursor-pointer">
          <UserPlus size={14} />
          Invite User
        </button>
      </div>

      {/* Table */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/60 shadow-sm overflow-hidden"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.02)' }}
      >
        <table className="w-full">
          <thead>
            <tr className="border-b border-border-light/60">
              <th className="text-left px-6 py-3.5 text-[12px] font-semibold text-text-muted uppercaser">User</th>
              <th className="text-left px-6 py-3.5 text-[12px] font-semibold text-text-muted uppercaser">Email</th>
              <th className="text-left px-6 py-3.5 text-[12px] font-semibold text-text-muted uppercaser">Role</th>
              <th className="text-left px-6 py-3.5 text-[12px] font-semibold text-text-muted uppercaser">Team</th>
              <th className="text-left px-6 py-3.5 text-[12px] font-semibold text-text-muted uppercaser">Status</th>
              <th className="text-left px-6 py-3.5 text-[12px] font-semibold text-text-muted uppercaser">Last Login</th>
            </tr>
          </thead>
          <tbody>
            {mockUsers.map((user, i) => (
              <motion.tr
                key={user.email}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.05 + i * 0.05 }}
                className="border-b border-border-light/40 last:border-0 hover:bg-violet-50/30 transition-colors"
              >
                {/* User */}
                <td className="px-10 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatarGradients[i]} flex items-center justify-center shadow-sm`}>
                      <span className="text-[12px] font-bold text-white">{user.initials}</span>
                    </div>
                    <span className="text-[13px] font-semibold text-text">{user.name}</span>
                  </div>
                </td>

                {/* Email */}
                <td className="px-10 py-3.5">
                  <span className="text-[12.5px] text-text-secondary">{user.email}</span>
                </td>

                {/* Role */}
                <td className="px-10 py-3.5">
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[12px] font-semibold border ${user.roleColor}`}>
                    {user.role}
                  </span>
                </td>

                {/* Team */}
                <td className="px-10 py-3.5">
                  <span className="text-[12.5px] text-text-secondary">{user.team}</span>
                </td>

                {/* Status */}
                <td className="px-10 py-3.5">
                  {user.status === 'Active' ? (
                    <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-emerald-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-amber-600">
                      <Clock size={11} />
                      Invited
                    </span>
                  )}
                </td>

                {/* Last Login */}
                <td className="px-10 py-3.5">
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
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 border border-violet-200/40 flex items-center justify-center mb-5 shadow-lg shadow-violet-500/10"
      >
        <Icon size={28} className="text-violet-500" />
      </motion.div>
      <h3 className="text-[18px] font-bold text-text mb-2">{tab.label}</h3>
      <p className="text-[13px] text-text-muted mb-4">This section is under development</p>
      <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-50 border border-violet-100">
        <Construction size={14} className="text-violet-500" />
        <span className="text-[12px] font-semibold text-violet-600">Coming Soon</span>
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
    <div className="h-full overflow-y-auto relative" style={{ background: 'linear-gradient(180deg, #f8f5ff 0%, #fafafa 300px)' }}>
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#f3ecff] via-[#faf8ff] to-[#eee8f9]" />
        <FloatingLines enabledWaves={['top', 'middle']} lineCount={4} lineDistance={6} bendRadius={4} bendStrength={-0.3} interactive={true} parallax={true} color="#6a12cd" opacity={0.04} />

        <div className="relative px-6 pt-10 pb-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <Settings size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-[28px] font-extrabold">
                  <span className="ai-gradient-text">Administration</span>
                </h1>
                <p className="text-[14px] text-text-secondary leading-relaxed">
                  Manage users, teams, roles, and platform settings
                </p>
              </div>
            </div>
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 flex items-center gap-1 bg-white/60 backdrop-blur-xl rounded-xl border border-white/70 p-1 shadow-sm w-fit"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.02)' }}
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setCurrentTab(tab.id)}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-[12.5px] font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'text-violet-700'
                      : 'text-text-muted hover:text-text-secondary hover:bg-white/60'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="admin-tab-bg"
                      className="absolute inset-0 bg-white rounded-lg shadow-sm border border-violet-100/60"
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
      <div className="px-10 pb-12 pt-2">
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
