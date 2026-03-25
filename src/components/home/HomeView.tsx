import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Workflow, MessageSquare, FileBarChart, LayoutDashboard,
  ArrowRight, TrendingUp, TrendingDown,
  AlertTriangle, Shield, CheckCircle2, Clock, Zap, Activity,
  ChevronDown, Lightbulb, ShieldCheck
} from 'lucide-react';
import type { View } from '../../hooks/useAppState';
import Orb from '../shared/Orb';
import FloatingLines from '../shared/FloatingLines';

interface Props {
  setView: (v: View) => void;
}

function GaugeChart({ value, max, label, color, size = 80 }: { value: number; max: number; label: string; color: string; size?: number }) {
  const pct = (value / max) * 100;
  const r = (size - 12) / 2;
  const circ = Math.PI * r;
  const dash = (pct / 100) * circ;

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size / 2 + 8} viewBox={`0 0 ${size} ${size / 2 + 8}`}>
        <path
          d={`M 6 ${size / 2} A ${r} ${r} 0 0 1 ${size - 6} ${size / 2}`}
          fill="none" stroke="#f1edf9" strokeWidth="8" strokeLinecap="round"
        />
        <motion.path
          d={`M 6 ${size / 2} A ${r} ${r} 0 0 1 ${size - 6} ${size / 2}`}
          fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
          initial={{ strokeDasharray: `0 ${circ}` }}
          animate={{ strokeDasharray: `${dash} ${circ - dash}` }}
          transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
        />
        <text x={size / 2} y={size / 2 - 2} textAnchor="middle" fontSize="18" fontWeight="700" fill="#0e0b1e">{value}</text>
      </svg>
      <div className="text-[10px] text-text-muted uppercase tracking-wider mt-1">{label}</div>
    </div>
  );
}

function MiniDonut({ data, colors, size = 56 }: { data: number[]; colors: string[]; size?: number }) {
  const total = data.reduce((a, b) => a + b, 0);
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  let offset = 0;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {data.map((val, i) => {
        const pct = (val / total) * circ;
        const seg = (
          <circle
            key={i} cx={size / 2} cy={size / 2} r={r}
            fill="none" stroke={colors[i]} strokeWidth="6"
            strokeDasharray={`${pct} ${circ - pct}`}
            strokeDashoffset={-offset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        );
        offset += pct;
        return seg;
      })}
      <text x={size / 2} y={size / 2 + 1} textAnchor="middle" fontSize="11" fontWeight="700" fill="#0e0b1e">{total}</text>
      <text x={size / 2} y={size / 2 + 10} textAnchor="middle" fontSize="7" fill="#9e96b8">total</text>
    </svg>
  );
}

export default function HomeView({ setView }: Props) {
  const [dateRange, setDateRange] = useState('Last 30 days');
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);
  const [showProTip, setShowProTip] = useState(false);

  useEffect(() => {
    if (!dateDropdownOpen) return;
    const close = () => setDateDropdownOpen(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [dateDropdownOpen]);

  useEffect(() => {
    const t = setTimeout(() => setShowProTip(true), 2000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="h-full overflow-y-auto bg-white relative">
      {/* Hero banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#faf5ff] via-white to-[#f0e6fb]">
        <FloatingLines
          enabledWaves={['top', 'middle']}
          lineCount={4}
          lineDistance={6}
          bendRadius={4}
          bendStrength={-0.3}
          interactive={true}
          parallax={true}
          color="#6a12cd"
          opacity={0.05}
        />
        <div className="relative max-w-6xl mx-auto px-8 py-10">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-3xl font-bold tracking-tight mb-1">
              <span className="ai-gradient-text">Hello, Auditor</span>
            </h1>
            <p className="text-[15px] text-text-secondary mb-5">Ready to automate your next audit?</p>
            <button
              onClick={() => setView('chat')}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-primary-medium hover:from-primary-hover hover:to-primary text-white rounded-xl text-[13px] font-semibold shadow-lg shadow-primary/20 transition-all cursor-pointer"
            >
              <MessageSquare size={15} />
              Start new Chat
            </button>
            <AnimatePresence>
              {showProTip && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-4 flex items-center gap-2 text-[11px] text-text-muted"
                >
                  <Lightbulb size={12} className="text-primary/60" />
                  <span>Pro tip: Try &quot;Find duplicate invoices&quot; or &quot;Build a vendor payment workflow&quot;</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-10 py-10 relative">
        <Orb hoverIntensity={0.05} rotateOnHover hue={275} opacity={0.04} />

        {/* Dashboard header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[15px] font-semibold text-text">Dashboard</h2>
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setDateDropdownOpen(p => !p); }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-white/80 backdrop-blur-sm text-[12px] text-text-secondary hover:border-primary/30 transition-all cursor-pointer"
            >
              {dateRange}
              <ChevronDown size={12} className={`transition-transform ${dateDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {dateDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.98 }}
                  transition={{ duration: 0.12 }}
                  className="absolute right-0 top-full mt-1 bg-white/90 backdrop-blur-xl border border-border-light rounded-xl shadow-lg overflow-hidden z-20 min-w-[140px]"
                >
                  {['Last 30 days', 'Last 7 days', 'This quarter', 'This year'].map(opt => (
                    <button
                      key={opt}
                      onClick={() => { setDateRange(opt); setDateDropdownOpen(false); }}
                      className={`w-full text-left px-3 py-2 text-[12px] transition-colors cursor-pointer ${
                        dateRange === opt ? 'bg-primary/10 text-primary font-semibold' : 'text-text-secondary hover:bg-surface-2'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Workflows', desc: 'Active audit workflows', value: 8, max: 12, icon: Workflow, color: 'text-primary bg-primary-xlight', trend: '+2', up: true },
            { label: 'Sessions', desc: 'Chat sessions created', value: 5, max: 10, icon: MessageSquare, color: 'text-blue-600 bg-blue-50', trend: '+3', up: true },
            { label: 'Reports', desc: 'Reports generated', value: 3, max: 8, icon: FileBarChart, color: 'text-emerald-600 bg-emerald-50', trend: '-1', up: false },
            { label: 'Dashboards', desc: 'Dashboards available', value: 4, max: 6, icon: LayoutDashboard, color: 'text-orange-600 bg-orange-50', trend: '+1', up: true },
          ].map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.06 }}
              className="glass-card rounded-2xl p-5 cursor-pointer group hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300"
              onClick={() => {
                if (kpi.label === 'Workflows') setView('workflow-templates');
                if (kpi.label === 'Reports') setView('reports');
                if (kpi.label === 'Dashboards') setView('dashboards');
                if (kpi.label === 'Sessions') setView('chat');
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-[13px] font-semibold text-text">{kpi.label}</div>
                  <div className="text-[10px] text-text-muted mt-0.5">{kpi.desc}</div>
                </div>
                <div className={`p-2 rounded-lg ${kpi.color} group-hover:scale-110 transition-transform duration-300`}>
                  <kpi.icon size={16} />
                </div>
              </div>
              <div className="flex items-end justify-between">
                <div className="text-3xl font-bold font-mono text-text leading-none">{kpi.value}</div>
                <div className={`flex items-center gap-0.5 text-[11px] font-semibold ${kpi.up ? 'text-green-600' : 'text-red-600'}`}>
                  {kpi.up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                  {kpi.trend}
                </div>
              </div>
              {/* Progress bar */}
              <div className="mt-3 h-1.5 bg-surface-3 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((kpi.value / kpi.max) * 100, 100)}%` }}
                  transition={{ duration: 0.8, delay: 0.3 + i * 0.1 }}
                  className="h-full bg-gradient-to-r from-primary to-primary-medium rounded-full"
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Visual charts row */}
        <div className="grid grid-cols-3 gap-5 mb-6">
          {/* Risk Severity Gauge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card rounded-2xl p-5 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group"
          >
            <h3 className="text-[13px] font-semibold text-text mb-4 flex items-center gap-2">
              <AlertTriangle size={14} className="text-orange-500" />
              Risk Overview
            </h3>
            <div className="flex items-center justify-around">
              <GaugeChart value={2} max={12} label="Critical" color="#dc2626" />
              <GaugeChart value={5} max={12} label="High" color="#ea580c" />
              <GaugeChart value={3} max={12} label="Medium" color="#d97706" />
            </div>
            <div className="mt-4 text-center">
              <span className="text-[11px] text-text-muted">12 total risks across 4 processes</span>
            </div>
          </motion.div>

          {/* Control Coverage Donut */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card rounded-2xl p-5 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group"
          >
            <h3 className="text-[13px] font-semibold text-text mb-4 flex items-center gap-2">
              <Shield size={14} className="text-blue-500" />
              Control Effectiveness
            </h3>
            <div className="flex items-center gap-5">
              <MiniDonut data={[11, 1, 2]} colors={['#16a34a', '#dc2626', '#9e96b8']} size={80} />
              <div className="space-y-2 flex-1">
                {[
                  { label: 'Effective', value: 11, color: '#16a34a' },
                  { label: 'Ineffective', value: 1, color: '#dc2626' },
                  { label: 'Not Tested', value: 2, color: '#9e96b8' },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                      <span className="text-[11px] text-text-secondary">{item.label}</span>
                    </div>
                    <span className="text-[12px] font-bold text-text">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Audit Progress */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="glass-card rounded-2xl p-5 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group"
          >
            <h3 className="text-[13px] font-semibold text-text mb-4 flex items-center gap-2">
              <CheckCircle2 size={14} className="text-green-500" />
              Audit Progress
            </h3>
            <div className="text-center mb-3">
              <svg width="100" height="100" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#f1edf9" strokeWidth="10" />
                <motion.circle
                  cx="50" cy="50" r="40" fill="none" stroke="#6a12cd" strokeWidth="10"
                  initial={{ strokeDasharray: '0 251' }}
                  animate={{ strokeDasharray: '146 105' }}
                  transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
                  strokeLinecap="round" transform="rotate(-90 50 50)"
                />
                <text x="50" y="47" textAnchor="middle" fontSize="20" fontWeight="700" fill="#0e0b1e">58%</text>
                <text x="50" y="60" textAnchor="middle" fontSize="8" fill="#9e96b8">Complete</text>
              </svg>
            </div>
            <div className="text-[12px] text-text-secondary text-center">FY26 SOX Audit</div>
            <div className="text-[10px] text-text-muted text-center mt-0.5">14 of 24 controls tested</div>
          </motion.div>
        </div>

        {/* Audit Progress Overview */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }} className="glass-card rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck size={15} className="text-primary" />
              <h3 className="text-[13px] font-semibold text-text">Company Audit Posture — FY26</h3>
            </div>
            <span className="text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-bold">On Track</span>
          </div>

          {/* Process progress bars */}
          <div className="space-y-3">
            {[
              { process: 'Procure to Pay (P2P)', progress: 72, controls: '17/24', status: 'active', color: '#6a12cd' },
              { process: 'Order to Cash (O2C)', progress: 44, controls: '8/18', status: 'active', color: '#0284c7' },
              { process: 'Record to Report (R2R)', progress: 85, controls: '26/31', status: 'active', color: '#d97706' },
              { process: 'Source to Contract (S2C)', progress: 21, controls: '3/14', status: 'planned', color: '#059669' },
            ].map((p, i) => (
              <motion.div key={p.process} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 + i * 0.05 }}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-medium text-text">{p.process}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                      p.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'
                    }`}>{p.status}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-text-muted">{p.controls} controls</span>
                    <span className="text-[12px] font-bold font-mono text-text">{p.progress}%</span>
                  </div>
                </div>
                <div className="h-2 bg-surface-3 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${p.progress}%` }}
                    transition={{ duration: 0.8, delay: 0.8 + i * 0.1 }}
                    className="h-full rounded-full"
                    style={{ background: p.color }}
                  />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Summary stats */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-border-light">
            <div className="flex items-center gap-4">
              <div className="text-[11px] text-text-muted"><span className="font-bold text-text">54</span> of <span className="font-bold text-text">87</span> controls tested</div>
              <div className="text-[11px] text-text-muted"><span className="font-bold text-danger">2</span> deficiencies open</div>
              <div className="text-[11px] text-text-muted"><span className="font-bold text-success">48</span> controls effective</div>
            </div>
            <button onClick={() => setView('audit-planning')} className="text-[11px] text-primary font-medium hover:underline cursor-pointer flex items-center gap-1">
              View Audit Plan <ArrowRight size={10} />
            </button>
          </div>
        </motion.div>

        {/* Workflow status bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="glass-card rounded-2xl p-4 mb-6"
        >
          <div className="flex items-center justify-around">
            {[
              { icon: CheckCircle2, label: 'Planned Workflows', value: 1887, color: 'text-blue-600' },
              { icon: Clock, label: 'Pending Workflows', value: 1785, color: 'text-orange-600' },
              { icon: AlertTriangle, label: 'Exceptions Raised', value: 75, color: 'text-red-600' },
              { icon: Zap, label: 'Adhoc Runs', value: 12, color: 'text-green-600' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-2.5 px-4">
                <item.icon size={14} className={item.color} />
                <div>
                  <div className="text-[12px] font-bold text-text">{item.value.toLocaleString()}</div>
                  <div className="text-[10px] text-text-muted">{item.label}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent activity */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[15px] font-semibold text-text">Recent Activity</h2>
            <button onClick={() => setView('dashboards')} className="text-[11px] text-primary font-medium hover:underline cursor-pointer flex items-center gap-1">
              View all <ArrowRight size={10} />
            </button>
          </div>
          <div className="space-y-2">
            {[
              { icon: CheckCircle2, text: 'Duplicate Invoice Detector completed', time: '2h ago', color: 'text-green-500' },
              { icon: AlertTriangle, text: 'New deficiency flagged in R2R process', time: '4h ago', color: 'text-orange-500' },
              { icon: Zap, text: 'Vendor Master Monitor triggered alert', time: '6h ago', color: 'text-blue-500' },
              { icon: Activity, text: 'FY26 SOX Audit — 3 controls tested', time: '1d ago', color: 'text-purple-500' },
            ].map((a, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + i * 0.05 }}
                className="flex items-center gap-3 p-3 rounded-xl glass-card cursor-pointer hover:shadow-md hover:shadow-primary/5 hover:border-primary/15 active:scale-[0.995] transition-all duration-200"
              >
                <a.icon size={14} className={a.color} />
                <span className="text-[12.5px] text-text flex-1">{a.text}</span>
                <span className="text-[11px] text-text-muted shrink-0">{a.time}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
