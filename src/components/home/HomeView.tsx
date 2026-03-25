import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageSquare, ArrowRight, TrendingUp, TrendingDown,
  AlertTriangle, Shield, CheckCircle2, Clock, Zap, Activity,
  ChevronDown, Lightbulb, DollarSign, Users, Calendar,
  FileWarning, ShieldAlert, Target, Eye, Ban, Sparkles,
  ChevronRight, ExternalLink
} from 'lucide-react';
import type { View } from '../../hooks/useAppState';
import Orb from '../shared/Orb';
import FloatingLines from '../shared/FloatingLines';

interface Props {
  setView: (v: View) => void;
}

function MiniDonut({ data, colors, size = 64 }: { data: number[]; colors: string[]; size?: number }) {
  const total = data.reduce((a, b) => a + b, 0);
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {data.map((val, i) => {
        const pct = (val / total) * circ;
        const seg = (
          <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={colors[i]} strokeWidth="7"
            strokeDasharray={`${pct} ${circ - pct}`} strokeDashoffset={-offset} strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`} />
        );
        offset += pct;
        return seg;
      })}
    </svg>
  );
}

function MiniTrend({ data, color, width = 72, height = 28 }: { data: number[]; color: string; width?: number; height?: number }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const points = data.map((v, i) => `${(i / (data.length - 1)) * width},${height - ((v - min) / (max - min || 1)) * height}`).join(' ');
  const fillPoints = `0,${height} ${points} ${width},${height}`;
  return (
    <svg width={width} height={height}>
      <polygon fill={`${color}15`} points={fillPoints} />
      <polyline fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" points={points} />
    </svg>
  );
}

export default function HomeView({ setView }: Props) {
  const [dateRange, setDateRange] = useState('This quarter');
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);
  const [showProTip, setShowProTip] = useState(false);
  const [attentionExpanded, setAttentionExpanded] = useState(true);

  useEffect(() => {
    if (!dateDropdownOpen) return;
    const close = () => setDateDropdownOpen(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [dateDropdownOpen]);

  useEffect(() => {
    const t = setTimeout(() => setShowProTip(true), 2500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="h-full overflow-y-auto bg-white relative">
      {/* Hero banner — compact, action-oriented */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#faf5ff] via-white to-[#f0e6fb]">
        <FloatingLines enabledWaves={['top', 'middle']} lineCount={4} lineDistance={6} bendRadius={4} bendStrength={-0.3} interactive={true} parallax={true} color="#6a12cd" opacity={0.05} />
        <div className="relative max-w-6xl mx-auto px-8 py-8">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex items-end justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight mb-0.5">
                <span className="ai-gradient-text">Good morning, Auditor</span>
              </h1>
              <p className="text-[14px] text-text-secondary">Here&apos;s your FY26 audit landscape at a glance</p>
              <AnimatePresence>
                {showProTip && (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-2 flex items-center gap-2 text-[11px] text-text-muted">
                    <Lightbulb size={11} className="text-primary/60" />
                    <span>Try: &quot;What risks need attention this week?&quot; or &quot;Build a vendor payment workflow&quot;</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="flex items-center gap-2.5">
              <button onClick={() => setView('chat')} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-primary-medium hover:from-primary-hover hover:to-primary text-white rounded-xl text-[13px] font-semibold shadow-lg shadow-primary/20 transition-all cursor-pointer">
                <MessageSquare size={14} /> Ask AI Copilot
              </button>
              <div className="relative">
                <button onClick={(e) => { e.stopPropagation(); setDateDropdownOpen(p => !p); }} className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-border bg-white/80 backdrop-blur-sm text-[12px] text-text-secondary hover:border-primary/30 transition-all cursor-pointer">
                  {dateRange}
                  <ChevronDown size={12} className={`transition-transform ${dateDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {dateDropdownOpen && (
                    <motion.div initial={{ opacity: 0, y: -4, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -4, scale: 0.98 }} transition={{ duration: 0.12 }} className="absolute right-0 top-full mt-1 bg-white/90 backdrop-blur-xl border border-border-light rounded-xl shadow-lg overflow-hidden z-20 min-w-[140px]">
                      {['This week', 'This month', 'This quarter', 'This year'].map(opt => (
                        <button key={opt} onClick={() => { setDateRange(opt); setDateDropdownOpen(false); }} className={`w-full text-left px-3 py-2 text-[12px] transition-colors cursor-pointer ${dateRange === opt ? 'bg-primary/10 text-primary font-semibold' : 'text-text-secondary hover:bg-surface-2'}`}>{opt}</button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-8 relative">
        <Orb hoverIntensity={0.05} rotateOnHover hue={275} opacity={0.04} />

        {/* ─── ROW 1: Financial Impact KPIs (what CFO cares about) ─── */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Money at Risk', value: '₹6.16L', desc: 'Flagged duplicate payments', icon: DollarSign, color: 'text-red-600 bg-red-50', trend: '-₹2.1L', up: true, trendColor: 'text-green-600', sparkData: [8.2, 7.5, 6.8, 7.1, 6.5, 6.16], sparkColor: '#16a34a', accent: '#dc2626', accentBg: 'rgba(220,38,38,0.03)', onClick: () => setView('chat') },
            { label: 'Open Exceptions', value: '7', desc: '3 unassigned, 4 in progress', icon: FileWarning, color: 'text-orange-600 bg-orange-50', trend: '+2', up: false, trendColor: 'text-red-600', sparkData: [3, 4, 5, 4, 5, 7], sparkColor: '#dc2626', accent: '#ea580c', accentBg: 'rgba(234,88,12,0.03)', onClick: () => setView('reports') },
            { label: 'Compliance Score', value: '94.2%', desc: 'Across all business processes', icon: Shield, color: 'text-green-600 bg-green-50', trend: '+1.4%', up: true, trendColor: 'text-green-600', sparkData: [89, 90, 91, 92, 93, 94.2], sparkColor: '#16a34a', accent: '#16a34a', accentBg: 'rgba(22,163,74,0.03)', onClick: () => setView('dashboards') },
            { label: 'Automation Savings', value: '₹24L', desc: 'Cost avoided via workflows YTD', icon: Zap, color: 'text-primary bg-primary-xlight', trend: '+₹8L', up: true, trendColor: 'text-green-600', sparkData: [4, 8, 12, 16, 20, 24], sparkColor: '#6a12cd', accent: '#6a12cd', accentBg: 'rgba(106,18,205,0.03)', onClick: () => setView('workflow-templates') },
          ].map((kpi, i) => (
            <motion.div key={kpi.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.06 }}
              onClick={kpi.onClick}
              className="card-kpi card-nav rounded-2xl p-5 group"
              style={{ '--accent': kpi.accent, '--accent-bg': kpi.accentBg } as React.CSSProperties}>
              <div className="relative flex items-start justify-between mb-2">
                <div className={`p-2 rounded-lg ${kpi.color} group-hover:scale-110 transition-transform duration-300`}>
                  <kpi.icon size={16} />
                </div>
                <MiniTrend data={kpi.sparkData} color={kpi.sparkColor} />
              </div>
              <div className="relative text-2xl font-bold font-mono text-text leading-none mb-0.5">{kpi.value}</div>
              <div className="relative text-[11px] text-text-muted mb-1">{kpi.desc}</div>
              <div className={`relative flex items-center gap-0.5 text-[11px] font-semibold ${kpi.trendColor}`}>
                {kpi.up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                {kpi.trend} vs last quarter
              </div>
            </motion.div>
          ))}
        </div>

        {/* ─── ROW 2: Needs Your Attention (actionable items) ─── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass-card rounded-2xl mb-6 overflow-hidden">
          <button onClick={() => setAttentionExpanded(p => !p)} className="w-full flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-surface-2/50 transition-colors">
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[14px] font-semibold text-text">Needs Your Attention</span>
              <span className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-bold">5 items</span>
            </div>
            <ChevronDown size={14} className={`text-text-muted transition-transform ${attentionExpanded ? '' : '-rotate-90'}`} />
          </button>
          <AnimatePresence>
            {attentionExpanded && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                <div className="px-5 pb-4 space-y-2">
                  {[
                    { icon: ShieldAlert, severity: 'critical', text: 'Material weakness DEF-002 remediation due in 6 days', detail: 'Journal entry approval override — 7 instances undocumented', action: 'Review', actionView: 'audit-execution' as View, color: 'text-red-600 bg-red-50 border-red-200' },
                    { icon: Ban, severity: 'critical', text: '2 critical risks have zero controls mapped', detail: 'RSK-004 (Fictitious vendors), RSK-007 (Malware via portals)', action: 'Assign Controls', actionView: 'audit-risk-register' as View, color: 'text-red-600 bg-red-50 border-red-200' },
                    { icon: Clock, severity: 'high', text: '3 exceptions unassigned for 48+ hours', detail: 'EXC-001 ($45K), EXC-006 ($156K), EXC-007 ($34K) — total $235K at risk', action: 'Assign', actionView: 'reports' as View, color: 'text-orange-600 bg-orange-50 border-orange-200' },
                    { icon: AlertTriangle, severity: 'high', text: '4 contracts expiring within 30 days', detail: '2 high-value (>$500K) — vendor renegotiation needed', action: 'View', actionView: 'dashboards' as View, color: 'text-orange-600 bg-orange-50 border-orange-200' },
                    { icon: Users, severity: 'medium', text: 'Tushar Goel over-allocated in April (120% capacity)', detail: 'Assigned to P2P SOX + IFC Assessment simultaneously', action: 'Rebalance', actionView: 'audit-planning' as View, color: 'text-amber-600 bg-amber-50 border-amber-200' },
                  ].map((item, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.04 }}
                      className={`flex items-start gap-3 p-3 rounded-xl border ${item.color} ${item.severity === 'critical' ? 'card-alert-critical' : item.severity === 'high' ? 'card-alert-high' : 'card-alert-medium'} hover:shadow-md transition-all cursor-pointer group`}
                      onClick={() => setView(item.actionView)}>
                      <div className={`p-1.5 rounded-lg shrink-0 ${item.color.split(' ').slice(0, 2).join(' ')}`}>
                        <item.icon size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] font-semibold text-text leading-tight">{item.text}</div>
                        <div className="text-[11px] text-text-muted mt-0.5 leading-relaxed">{item.detail}</div>
                      </div>
                      <button className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-primary bg-primary/10 hover:bg-primary/20 transition-colors opacity-0 group-hover:opacity-100">
                        {item.action} <ArrowRight size={10} />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ─── ROW 3: Audit Progress + Risk Heatmap side by side ─── */}
        <div className="grid grid-cols-5 gap-5 mb-6">
          {/* Audit completion by process — 3 cols */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="col-span-3 card-content rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[13px] font-semibold text-text flex items-center gap-2">
                <Target size={14} className="text-primary" /> FY26 Audit Progress by Process
              </h3>
              <button onClick={() => setView('audit-planning')} className="text-[11px] text-primary font-medium hover:underline cursor-pointer flex items-center gap-1">
                Full Plan <ExternalLink size={9} />
              </button>
            </div>
            <div className="space-y-4">
              {[
                { name: 'Procure to Pay', abbr: 'P2P', progress: 72, tested: 17, total: 24, deficiencies: 1, color: '#6a12cd', deadline: 'Mar 31' },
                { name: 'Order to Cash', abbr: 'O2C', progress: 44, tested: 8, total: 18, deficiencies: 0, color: '#0284c7', deadline: 'Mar 31' },
                { name: 'Record to Report', abbr: 'R2R', progress: 85, tested: 26, total: 31, deficiencies: 1, color: '#d97706', deadline: 'Mar 31' },
                { name: 'Source to Contract', abbr: 'S2C', progress: 21, tested: 3, total: 14, deficiencies: 0, color: '#059669', deadline: 'Jun 30' },
              ].map((p, i) => (
                <motion.div key={p.abbr} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 + i * 0.05 }}
                  className="group cursor-pointer" onClick={() => setView('business-processes')}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold text-white" style={{ background: p.color }}>{p.abbr}</div>
                      <div>
                        <span className="text-[12px] font-medium text-text group-hover:text-primary transition-colors">{p.name}</span>
                        <span className="text-[10px] text-text-muted ml-2">{p.tested}/{p.total} controls</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {p.deficiencies > 0 && (
                        <span className="text-[9px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full">{p.deficiencies} deficiency</span>
                      )}
                      <span className="text-[10px] text-text-muted">Due {p.deadline}</span>
                      <span className="text-[13px] font-bold font-mono text-text w-10 text-right">{p.progress}%</span>
                    </div>
                  </div>
                  <div className="h-2 bg-surface-3 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${p.progress}%` }} transition={{ duration: 0.8, delay: 0.6 + i * 0.1 }}
                      className="h-full rounded-full" style={{ background: p.color }} />
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-border-light flex items-center justify-between">
              <div className="flex items-center gap-1">
                <span className="text-[13px] font-bold text-text">Overall:</span>
                <span className="text-[13px] font-bold text-primary font-mono">58%</span>
                <span className="text-[11px] text-text-muted ml-1">— 54 of 87 controls tested</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-medium text-green-600">
                <TrendingUp size={11} /> On track for Q1 filing
              </div>
            </div>
          </motion.div>

          {/* Risk Exposure Summary — 2 cols */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
            className="col-span-2 card-content rounded-2xl p-5">
            <h3 className="text-[13px] font-semibold text-text mb-4 flex items-center gap-2">
              <AlertTriangle size={14} className="text-orange-500" /> Risk Exposure
            </h3>
            <div className="flex items-center gap-4 mb-4">
              <MiniDonut data={[2, 5, 3, 2]} colors={['#dc2626', '#ea580c', '#d97706', '#16a34a']} size={72} />
              <div className="space-y-1.5 flex-1">
                {[
                  { label: 'Critical', value: 2, color: '#dc2626', detail: '0 controls mapped' },
                  { label: 'High', value: 5, color: '#ea580c', detail: '3 partially mitigated' },
                  { label: 'Medium', value: 3, color: '#d97706', detail: 'All mitigated' },
                  { label: 'Low', value: 2, color: '#16a34a', detail: 'All mitigated' },
                ].map(r => (
                  <div key={r.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: r.color }} />
                      <span className="text-[11px] text-text-secondary">{r.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-text-muted">{r.detail}</span>
                      <span className="text-[12px] font-bold text-text w-4 text-right">{r.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Uncontrolled risks callout */}
            <div className="p-3 rounded-xl bg-red-50/80 border border-red-200/60">
              <div className="flex items-center gap-1.5 mb-1">
                <ShieldAlert size={12} className="text-red-500" />
                <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider">Uncontrolled Risks</span>
              </div>
              <div className="text-[11px] text-red-800 leading-relaxed">
                <strong>RSK-004</strong> Fictitious vendor registration & <strong>RSK-007</strong> Malware via vendor portals have zero controls. Estimated exposure: <strong>₹18L</strong>.
              </div>
              <button onClick={() => setView('audit-risk-register')} className="mt-2 text-[10px] font-semibold text-red-600 hover:underline cursor-pointer flex items-center gap-1">
                Assign controls <ArrowRight size={9} />
              </button>
            </div>
            <button onClick={() => setView('audit-risk-register')} className="mt-3 text-[11px] text-primary font-medium hover:underline cursor-pointer flex items-center gap-1 justify-end w-full">
              Full Risk Register <ChevronRight size={10} />
            </button>
          </motion.div>
        </div>

        {/* ─── ROW 4: AI Insights + Upcoming Deadlines ─── */}
        <div className="grid grid-cols-2 gap-5 mb-6">
          {/* AI Insights */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}
            className="card-content rounded-2xl p-5">
            <h3 className="text-[13px] font-semibold text-text mb-3 flex items-center gap-2">
              <Sparkles size={14} className="text-primary" /> AI Insights
              <span className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">Updated 2h ago</span>
            </h3>
            <div className="space-y-2.5">
              {[
                { icon: DollarSign, text: 'Duplicate invoice detection saved ₹2.4L this month. 3 invoices from Acme Corp blocked before payment.', color: 'text-green-600 bg-green-50', actionLabel: 'View savings', actionView: 'workflow-templates' as View },
                { icon: Eye, text: 'Vendor Master Monitor detected 2 unauthorized bank account changes. Both flagged before payment release.', color: 'text-blue-600 bg-blue-50', actionLabel: 'View alerts', actionView: 'dashboards' as View },
                { icon: Activity, text: 'R2R process is 85% complete — ahead of schedule. Recommend reallocating Karan Mehta to S2C which is lagging (21%).', color: 'text-purple-600 bg-purple-50', actionLabel: 'Adjust plan', actionView: 'audit-planning' as View },
                { icon: TrendingDown, text: 'False positive rate in fraud detection dropped from 6.5% to 4.2% after model retrain. Auditor review time reduced by 35%.', color: 'text-emerald-600 bg-emerald-50', actionLabel: 'View metrics', actionView: 'workflow-templates' as View },
              ].map((insight, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 + i * 0.04 }}
                  className="flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-surface-2 transition-colors cursor-pointer group"
                  onClick={() => setView(insight.actionView)}>
                  <div className={`p-1.5 rounded-lg shrink-0 ${insight.color}`}><insight.icon size={12} /></div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11.5px] text-text leading-relaxed">{insight.text}</div>
                    <span className="text-[10px] text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 mt-0.5">
                      {insight.actionLabel} <ArrowRight size={8} />
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Upcoming Deadlines + Team Snapshot */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
            className="card-content rounded-2xl p-5">
            <h3 className="text-[13px] font-semibold text-text mb-3 flex items-center gap-2">
              <Calendar size={14} className="text-orange-500" /> Deadlines & Milestones
            </h3>
            <div className="space-y-2">
              {[
                { label: 'DEF-002 Remediation Due', date: 'Mar 31, 2026', daysLeft: 6, severity: 'critical', owner: 'Rohan Patel' },
                { label: 'FY26 SOX Audit Completion', date: 'Mar 31, 2026', daysLeft: 6, severity: 'high', owner: 'Karan Mehta' },
                { label: 'Q1 Audit Committee Report', date: 'Apr 10, 2026', daysLeft: 16, severity: 'high', owner: 'Abhinav S' },
                { label: 'S2C Contract Review Kickoff', date: 'Apr 15, 2026', daysLeft: 21, severity: 'medium', owner: 'Rohan Patel' },
                { label: 'IFC Assessment Start', date: 'Apr 1, 2026', daysLeft: 7, severity: 'medium', owner: 'Sneha Desai' },
              ].map((d, i) => {
                const urgencyColor = d.daysLeft <= 7 ? 'text-red-600 bg-red-50' : d.daysLeft <= 14 ? 'text-orange-600 bg-orange-50' : 'text-text-muted bg-surface-2';
                return (
                  <motion.div key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.75 + i * 0.04 }}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-surface-2/80 transition-colors">
                    <div className={`text-[11px] font-bold px-2 py-1 rounded-lg shrink-0 font-mono ${urgencyColor}`}>
                      {d.daysLeft}d
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-medium text-text leading-tight">{d.label}</div>
                      <div className="text-[10px] text-text-muted">{d.owner} · {d.date}</div>
                    </div>
                    {d.daysLeft <= 7 && <Clock size={13} className="text-red-400 animate-pulse shrink-0" />}
                  </motion.div>
                );
              })}
            </div>
            <button onClick={() => setView('audit-planning')} className="mt-3 w-full text-center text-[11px] text-primary font-medium hover:underline cursor-pointer flex items-center gap-1 justify-center">
              View Full Audit Calendar <ArrowRight size={10} />
            </button>
          </motion.div>
        </div>

        {/* ─── ROW 5: Quick Stats Bar + Recent Activity ─── */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
          className="glass-card rounded-2xl p-4 mb-6">
          <div className="flex items-center justify-around">
            {[
              { icon: CheckCircle2, label: 'Controls Effective', value: '48/54', pct: '89%', color: 'text-green-600' },
              { icon: Shield, label: 'Deficiencies Open', value: '2', pct: '', color: 'text-red-600' },
              { icon: Zap, label: 'Workflows Active', value: '8', pct: '115 runs', color: 'text-primary' },
              { icon: Activity, label: 'Exceptions Resolved', value: '5/8', pct: '63%', color: 'text-blue-600' },
              { icon: Users, label: 'Team Utilization', value: '74%', pct: '5 of 7', color: 'text-orange-600' },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-2.5 px-3">
                <s.icon size={14} className={s.color} />
                <div>
                  <div className="text-[12px] font-bold text-text">{s.value} <span className="text-[10px] font-normal text-text-muted">{s.pct}</span></div>
                  <div className="text-[10px] text-text-muted">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Pending Workflow Runs */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.83 }} className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[14px] font-semibold text-text flex items-center gap-2">
              <Clock size={13} className="text-orange-500" /> Pending Workflow Runs
            </h2>
            <button onClick={() => setView('workflow-templates')} className="text-[11px] text-primary font-medium hover:underline cursor-pointer flex items-center gap-1">
              View all <ArrowRight size={10} />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { name: 'SOD Violation Detector', time: 'Scheduled — Today 6 PM', type: 'Compliance', status: 'queued', color: '#7c3aed' },
              { name: 'Three-Way PO Match', time: 'Scheduled — Tomorrow 6 AM', type: 'Reconciliation', status: 'queued', color: '#0284c7' },
              { name: 'Contract Expiry Alert', time: 'Scheduled — Mar 28', type: 'Monitoring', status: 'pending-data', color: '#059669' },
            ].map((w, i) => (
              <motion.div key={w.name} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.85 + i * 0.04 }}
                onClick={() => setView('workflow-templates')}
                className="glass-card card-nav rounded-2xl p-4 group">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full dot-breathe" style={{ background: w.color }} />
                  <span className="text-[12px] font-semibold text-text group-hover:text-primary transition-colors truncate">{w.name}</span>
                </div>
                <div className="text-[10.5px] text-text-muted mb-2">{w.time}</div>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-text-muted bg-surface-2 px-1.5 py-0.5 rounded-full">{w.type}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${w.status === 'queued' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
                    {w.status === 'queued' ? 'Queued' : 'Waiting for data'}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[14px] font-semibold text-text">Recent Activity</h2>
            <button onClick={() => setView('dashboards')} className="text-[11px] text-primary font-medium hover:underline cursor-pointer flex items-center gap-1">
              View all <ArrowRight size={10} />
            </button>
          </div>
          <div className="space-y-2">
            {[
              { icon: CheckCircle2, text: 'Duplicate Invoice Detector blocked ₹45K payment to Acme Corp', time: '2h ago', color: 'text-green-500' },
              { icon: AlertTriangle, text: 'Material weakness DEF-002: Rohan Patel submitted remediation evidence', time: '4h ago', color: 'text-orange-500' },
              { icon: Zap, text: 'Vendor Master Monitor: 2 unauthorized bank changes detected & blocked', time: '6h ago', color: 'text-blue-500' },
              { icon: Shield, text: 'R2R — 3 more controls tested (CTR-007, CTR-008 effective; CTR-006 pending)', time: '1d ago', color: 'text-purple-500' },
              { icon: Users, text: 'Sneha Desai signed off on Risk Assessment Review for FY26 plan', time: '1d ago', color: 'text-emerald-500' },
            ].map((a, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 + i * 0.04 }}
                className="flex items-center gap-3 p-3 rounded-xl feed-item cursor-pointer active:scale-[0.995]"
                <a.icon size={14} className={a.color} />
                <span className="text-[12px] text-text flex-1">{a.text}</span>
                <span className="text-[10px] text-text-muted shrink-0">{a.time}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
