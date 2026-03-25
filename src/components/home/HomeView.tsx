import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageSquare, ArrowRight, TrendingUp, TrendingDown,
  AlertTriangle, Shield, CheckCircle2, Clock, Zap, Activity,
  ChevronDown, Lightbulb, DollarSign, Users, Calendar,
  FileWarning, ShieldAlert, Target, Eye, Ban, Sparkles,
  ExternalLink
} from 'lucide-react';
import type { View } from '../../hooks/useAppState';
import Orb from '../shared/Orb';
import FloatingLines from '../shared/FloatingLines';

interface Props {
  setView: (v: View) => void;
}

/* ─── Sparkline with gradient fill ─── */
function Spark({ data, color, w = 80, h = 32 }: { data: number[]; color: string; w?: number; h?: number }) {
  const max = Math.max(...data), min = Math.min(...data);
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / (max - min || 1)) * (h - 4) - 2}`).join(' ');
  const id = `spark-${color.replace('#', '')}`;
  return (
    <svg width={w} height={h} className="shrink-0">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon fill={`url(#${id})`} points={`0,${h} ${pts} ${w},${h}`} />
      <polyline fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={pts} />
      {/* end dot */}
      {(() => { const last = pts.split(' ').pop()!.split(','); return <circle cx={last[0]} cy={last[1]} r="2.5" fill={color} />; })()}
    </svg>
  );
}

/* ─── Donut ─── */
function Donut({ data, colors, size = 68, thickness = 8 }: { data: number[]; colors: string[]; size?: number; thickness?: number }) {
  const total = data.reduce((a, b) => a + b, 0);
  const r = (size - thickness - 4) / 2;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {data.map((val, i) => {
        const pct = (val / total) * circ;
        const el = <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={colors[i]} strokeWidth={thickness}
          strokeDasharray={`${pct} ${circ - pct}`} strokeDashoffset={-offset} strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`} />;
        offset += pct;
        return el;
      })}
      <text x={size / 2} y={size / 2 + 1} textAnchor="middle" fontSize="14" fontWeight="800" fill="#0e0b1e">{total}</text>
      <text x={size / 2} y={size / 2 + 11} textAnchor="middle" fontSize="7" fill="#9e96b8">risks</text>
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

  useEffect(() => { const t = setTimeout(() => setShowProTip(true), 2500); return () => clearTimeout(t); }, []);

  const kpis = [
    { label: 'Money at Risk', value: '₹6.16L', sub: 'Flagged duplicate payments', icon: DollarSign, gradient: 'from-red-500/10 to-red-500/5', iconBg: 'bg-red-500/10 text-red-600', trend: '-₹2.1L', up: true, tc: 'text-green-600', spark: [8.2, 7.5, 6.8, 7.1, 6.5, 6.16], sc: '#16a34a', view: 'chat' as View },
    { label: 'Open Exceptions', value: '7', sub: '3 unassigned · 4 in progress', icon: FileWarning, gradient: 'from-orange-500/10 to-orange-500/5', iconBg: 'bg-orange-500/10 text-orange-600', trend: '+2 this week', up: false, tc: 'text-red-600', spark: [3, 4, 5, 4, 5, 7], sc: '#dc2626', view: 'reports' as View },
    { label: 'Compliance', value: '94.2%', sub: 'Across 4 business processes', icon: Shield, gradient: 'from-green-500/10 to-green-500/5', iconBg: 'bg-green-500/10 text-green-600', trend: '+1.4%', up: true, tc: 'text-green-600', spark: [89, 90, 91, 92, 93, 94.2], sc: '#16a34a', view: 'dashboards' as View },
    { label: 'Savings (YTD)', value: '₹24L', sub: 'Cost avoided via AI workflows', icon: Zap, gradient: 'from-violet-500/10 to-violet-500/5', iconBg: 'bg-violet-500/10 text-violet-600', trend: '+₹8L vs Q2', up: true, tc: 'text-green-600', spark: [4, 8, 12, 16, 20, 24], sc: '#7c3aed', view: 'workflow-templates' as View },
  ];

  const processes = [
    { name: 'Procure to Pay', abbr: 'P2P', pct: 72, tested: 17, total: 24, def: 1, color: '#6a12cd', due: 'Mar 31' },
    { name: 'Order to Cash', abbr: 'O2C', pct: 44, tested: 8, total: 18, def: 0, color: '#0284c7', due: 'Mar 31' },
    { name: 'Record to Report', abbr: 'R2R', pct: 85, tested: 26, total: 31, def: 1, color: '#d97706', due: 'Mar 31' },
    { name: 'Source to Contract', abbr: 'S2C', pct: 21, tested: 3, total: 14, def: 0, color: '#059669', due: 'Jun 30' },
  ];

  return (
    <div className="h-full overflow-y-auto relative" style={{ background: 'linear-gradient(180deg, #faf5ff 0%, #f8f9fc 180px, #ffffff 400px)' }}>
      {/* ─── Hero ─── */}
      <div className="relative overflow-hidden">
        <FloatingLines enabledWaves={['top', 'middle']} lineCount={5} lineDistance={5} bendRadius={4} bendStrength={-0.3} interactive parallax color="#6a12cd" opacity={0.04} />
        <div className="relative max-w-[1120px] mx-auto px-8 pt-7 pb-5">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-end justify-between">
            <div>
              <h1 className="text-[26px] font-bold tracking-tight leading-tight">
                <span className="ai-gradient-text">Good morning, Auditor</span>
              </h1>
              <p className="text-[13px] text-text-secondary mt-0.5">FY26 audit landscape — {dateRange.toLowerCase()}</p>
              <AnimatePresence>
                {showProTip && (
                  <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-2 flex items-center gap-1.5 text-[10.5px] text-text-muted">
                    <Lightbulb size={10} className="text-primary/50" />
                    Try: &quot;What risks need attention?&quot; · &quot;Build a vendor payment workflow&quot;
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setView('chat')} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-primary-medium hover:from-primary-hover hover:to-primary text-white rounded-xl text-[12.5px] font-semibold shadow-lg shadow-primary/15 transition-all cursor-pointer">
                <Sparkles size={13} /> Ask Copilot
              </button>
              <div className="relative">
                <button onClick={e => { e.stopPropagation(); setDateDropdownOpen(p => !p); }} className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-border/60 bg-white/60 backdrop-blur text-[11.5px] text-text-secondary hover:border-primary/20 transition-all cursor-pointer">
                  {dateRange} <ChevronDown size={11} className={`transition-transform ${dateDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {dateDropdownOpen && (
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.1 }} className="absolute right-0 top-full mt-1 bg-white/95 backdrop-blur-xl border border-border-light rounded-xl shadow-xl overflow-hidden z-20 min-w-[130px]">
                      {['This week', 'This month', 'This quarter', 'This year'].map(o => (
                        <button key={o} onClick={() => { setDateRange(o); setDateDropdownOpen(false); }} className={`w-full text-left px-3 py-2 text-[11px] cursor-pointer transition-colors ${dateRange === o ? 'bg-primary/10 text-primary font-semibold' : 'text-text-secondary hover:bg-surface-2'}`}>{o}</button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-[1120px] mx-auto px-8 pb-10 relative">
        <Orb hoverIntensity={0.04} rotateOnHover hue={275} opacity={0.03} />

        {/* ─── KPI Strip — full-bleed feel ─── */}
        <div className="grid grid-cols-4 gap-3 mb-5 -mt-1">
          {kpis.map((k, i) => (
            <motion.div key={k.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 + i * 0.05 }}
              onClick={() => setView(k.view)}
              className={`relative overflow-hidden rounded-2xl p-4 cursor-pointer group bg-gradient-to-br ${k.gradient} border border-white/60 hover:border-primary/15 transition-all duration-300`}
              style={{ boxShadow: '0 2px 12px rgba(106,18,205,0.03), 0 8px 32px rgba(0,0,0,0.02), inset 0 1px 0 rgba(255,255,255,0.8)' }}>
              {/* subtle inner glow */}
              <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-30 blur-2xl pointer-events-none" style={{ background: k.sc }} />
              <div className="relative flex items-start justify-between mb-3">
                <div className={`p-2 rounded-xl ${k.iconBg} group-hover:scale-110 transition-transform duration-300`}>
                  <k.icon size={15} />
                </div>
                <Spark data={k.spark} color={k.sc} />
              </div>
              <div className="relative">
                <div className="text-[22px] font-bold font-mono text-text leading-none tracking-tight">{k.value}</div>
                <div className="text-[10.5px] text-text-muted mt-1 leading-snug">{k.sub}</div>
                <div className={`flex items-center gap-0.5 text-[10px] font-semibold mt-1.5 ${k.tc}`}>
                  {k.up ? <TrendingUp size={10} /> : <TrendingDown size={10} />} {k.trend}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ─── Attention Items — seamless, no heavy border ─── */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-5">
          <button onClick={() => setAttentionExpanded(p => !p)} className="w-full flex items-center gap-2 mb-2.5 cursor-pointer group">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[13px] font-semibold text-text">Needs Attention</span>
            <span className="text-[9px] bg-red-500/10 text-red-600 px-2 py-0.5 rounded-full font-bold">5</span>
            <ChevronDown size={12} className={`text-text-muted transition-transform ml-auto ${attentionExpanded ? '' : '-rotate-90'}`} />
          </button>
          <AnimatePresence>
            {attentionExpanded && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                <div className="grid grid-cols-1 gap-1.5">
                  {[
                    { icon: ShieldAlert, text: 'Material weakness DEF-002 due in 6 days', detail: 'Journal entry override — 7 instances', action: 'Review', view: 'audit-execution' as View, accent: 'border-l-red-500 bg-red-50/40' },
                    { icon: Ban, text: '2 critical risks — zero controls mapped', detail: 'RSK-004 (Fictitious vendors), RSK-007 (Malware)', action: 'Assign', view: 'audit-risk-register' as View, accent: 'border-l-red-500 bg-red-50/40' },
                    { icon: Clock, text: '3 exceptions unassigned 48+ hrs ($235K)', detail: 'EXC-001, EXC-006, EXC-007', action: 'Assign', view: 'reports' as View, accent: 'border-l-orange-400 bg-orange-50/30' },
                    { icon: AlertTriangle, text: '4 contracts expiring — 2 high-value (>$500K)', detail: 'Vendor renegotiation needed', action: 'View', view: 'dashboards' as View, accent: 'border-l-orange-400 bg-orange-50/30' },
                    { icon: Users, text: 'Resource conflict — Tushar Goel at 120%', detail: 'P2P SOX + IFC overlap', action: 'Rebalance', view: 'audit-planning' as View, accent: 'border-l-amber-400 bg-amber-50/20' },
                  ].map((item, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 + i * 0.03 }}
                      onClick={() => setView(item.view)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border-l-[3px] ${item.accent} cursor-pointer group hover:shadow-sm transition-all`}>
                      <item.icon size={14} className="text-text-muted shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-[12px] font-medium text-text">{item.text}</span>
                        <span className="text-[10.5px] text-text-muted ml-2">{item.detail}</span>
                      </div>
                      <span className="text-[10px] font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                        {item.action} <ArrowRight size={9} />
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ─── Main content: Progress + Risk — wider, less boxy ─── */}
        <div className="grid grid-cols-3 gap-4 mb-5">
          {/* Audit Progress — spans 2 cols, open layout */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
            className="col-span-2 rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(24px) saturate(200%)', border: '1px solid rgba(232,226,245,0.4)', boxShadow: '0 2px 16px rgba(106,18,205,0.03), 0 8px 32px rgba(0,0,0,0.02), inset 0 1px 0 rgba(255,255,255,0.7)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[13px] font-semibold text-text flex items-center gap-2">
                <Target size={13} className="text-primary" /> Audit Progress
              </h3>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-[10.5px] font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                  <TrendingUp size={10} /> On track
                </div>
                <button onClick={() => setView('audit-planning')} className="text-[10.5px] text-primary font-medium hover:underline cursor-pointer flex items-center gap-0.5">
                  Full plan <ExternalLink size={8} />
                </button>
              </div>
            </div>
            <div className="space-y-3.5">
              {processes.map((p, i) => (
                <motion.div key={p.abbr} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 + i * 0.04 }}
                  className="cursor-pointer group" onClick={() => setView('business-processes')}>
                  <div className="flex items-center gap-3 mb-1.5">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-extrabold text-white shadow-sm" style={{ background: `linear-gradient(135deg, ${p.color}, ${p.color}bb)` }}>{p.abbr}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[12.5px] font-medium text-text group-hover:text-primary transition-colors">{p.name}</span>
                          {p.def > 0 && <span className="text-[8px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full">{p.def} DEF</span>}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-text-muted">{p.tested}/{p.total}</span>
                          <span className="text-[10px] text-text-muted">Due {p.due}</span>
                          <span className="text-[13px] font-bold font-mono" style={{ color: p.color }}>{p.pct}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="ml-11 h-[6px] bg-surface-3/80 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${p.pct}%` }} transition={{ duration: 0.8, delay: 0.55 + i * 0.08 }}
                      className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${p.color}, ${p.color}aa)` }} />
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-border-light/50 flex items-center justify-between">
              <span className="text-[12px] text-text-muted"><span className="font-bold text-text">54</span> of 87 controls · Overall <span className="font-bold text-primary font-mono">58%</span></span>
              <span className="text-[10px] text-text-muted">2 deficiencies open · 48 effective</span>
            </div>
          </motion.div>

          {/* Risk column */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="rounded-2xl p-5 flex flex-col" style={{ background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(24px) saturate(200%)', border: '1px solid rgba(232,226,245,0.4)', boxShadow: '0 2px 16px rgba(106,18,205,0.03), 0 8px 32px rgba(0,0,0,0.02), inset 0 1px 0 rgba(255,255,255,0.7)' }}>
            <h3 className="text-[13px] font-semibold text-text mb-3 flex items-center gap-2">
              <AlertTriangle size={13} className="text-orange-500" /> Risk Exposure
            </h3>
            <div className="flex items-center gap-3 mb-3">
              <Donut data={[2, 5, 3, 2]} colors={['#dc2626', '#ea580c', '#d97706', '#16a34a']} />
              <div className="space-y-1 flex-1">
                {[
                  { l: 'Critical', v: 2, c: '#dc2626', d: '0 mitigated' },
                  { l: 'High', v: 5, c: '#ea580c', d: '3 partial' },
                  { l: 'Medium', v: 3, c: '#d97706', d: 'All mitigated' },
                  { l: 'Low', v: 2, c: '#16a34a', d: 'All mitigated' },
                ].map(r => (
                  <div key={r.l} className="flex items-center justify-between text-[10.5px]">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ background: r.c }} />
                      <span className="text-text-secondary">{r.l}</span>
                    </div>
                    <span className="text-text-muted">{r.d}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Uncontrolled callout */}
            <div className="flex-1" />
            <div className="p-3 rounded-xl bg-red-50/60 border border-red-200/40 mt-2">
              <div className="flex items-center gap-1 mb-1"><ShieldAlert size={11} className="text-red-500" /><span className="text-[9px] font-bold text-red-700 uppercase tracking-wider">Uncontrolled</span></div>
              <p className="text-[10.5px] text-red-800 leading-relaxed"><b>RSK-004</b> & <b>RSK-007</b> — zero controls. Exposure: <b>₹18L</b></p>
              <button onClick={() => setView('audit-risk-register')} className="mt-1.5 text-[9.5px] font-semibold text-red-600 hover:underline cursor-pointer flex items-center gap-0.5">Assign controls <ArrowRight size={8} /></button>
            </div>
          </motion.div>
        </div>

        {/* ─── AI Insights + Deadlines — seamless ─── */}
        <div className="grid grid-cols-5 gap-4 mb-5">
          {/* AI Insights — 3 cols */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
            className="col-span-3 rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(24px) saturate(200%)', border: '1px solid rgba(232,226,245,0.35)', boxShadow: '0 2px 16px rgba(106,18,205,0.02), inset 0 1px 0 rgba(255,255,255,0.6)' }}>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={13} className="text-primary" />
              <span className="text-[13px] font-semibold text-text">AI Insights</span>
              <span className="text-[8px] bg-primary/8 text-primary/70 px-1.5 py-0.5 rounded-full font-semibold">2h ago</span>
            </div>
            <div className="space-y-1.5">
              {[
                { icon: DollarSign, text: 'Duplicate detection saved ₹2.4L this month — 3 Acme Corp invoices blocked before payment.', ic: 'text-green-600 bg-green-50/80', view: 'workflow-templates' as View },
                { icon: Eye, text: 'Vendor Master Monitor caught 2 unauthorized bank account changes. Both blocked pre-release.', ic: 'text-blue-600 bg-blue-50/80', view: 'dashboards' as View },
                { icon: Activity, text: 'R2R at 85% — ahead of schedule. Recommend shifting Karan Mehta to S2C (21%, lagging).', ic: 'text-purple-600 bg-purple-50/80', view: 'audit-planning' as View },
                { icon: TrendingDown, text: 'Fraud false-positive rate: 6.5% → 4.2%. Auditor review time down 35% after retrain.', ic: 'text-emerald-600 bg-emerald-50/80', view: 'workflow-templates' as View },
              ].map((ins, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.65 + i * 0.03 }}
                  onClick={() => setView(ins.view)}
                  className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl hover:bg-white/60 transition-colors cursor-pointer group">
                  <div className={`p-1.5 rounded-lg shrink-0 ${ins.ic}`}><ins.icon size={11} /></div>
                  <div className="text-[11.5px] text-text leading-relaxed flex-1">{ins.text}
                    <span className="text-[10px] text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity ml-1">→</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Deadlines — 2 cols */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}
            className="col-span-2 rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(24px) saturate(200%)', border: '1px solid rgba(232,226,245,0.35)', boxShadow: '0 2px 16px rgba(106,18,205,0.02), inset 0 1px 0 rgba(255,255,255,0.6)' }}>
            <div className="flex items-center gap-2 mb-3">
              <Calendar size={13} className="text-orange-500" />
              <span className="text-[13px] font-semibold text-text">Upcoming</span>
            </div>
            <div className="space-y-1">
              {[
                { l: 'DEF-002 Remediation', d: 6, owner: 'Rohan P.' },
                { l: 'SOX Audit Completion', d: 6, owner: 'Karan M.' },
                { l: 'IFC Assessment Start', d: 7, owner: 'Sneha D.' },
                { l: 'Q1 Audit Committee', d: 16, owner: 'Abhinav S.' },
                { l: 'S2C Review Kickoff', d: 21, owner: 'Rohan P.' },
              ].map((item, i) => {
                const uc = item.d <= 7 ? 'text-red-600 bg-red-50' : item.d <= 14 ? 'text-orange-600 bg-orange-50' : 'text-text-muted bg-surface-2';
                return (
                  <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 + i * 0.03 }}
                    className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-white/50 transition-colors">
                    <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md font-mono w-7 text-center ${uc}`}>{item.d}d</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11.5px] font-medium text-text truncate">{item.l}</div>
                      <div className="text-[9.5px] text-text-muted">{item.owner}</div>
                    </div>
                    {item.d <= 7 && <Clock size={11} className="text-red-400 animate-pulse shrink-0" />}
                  </motion.div>
                );
              })}
            </div>
            <button onClick={() => setView('audit-planning')} className="mt-2 w-full text-center text-[10px] text-primary font-medium hover:underline cursor-pointer">View calendar →</button>
          </motion.div>
        </div>

        {/* ─── Stats ribbon — flush, no card frame ─── */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.75 }}
          className="flex items-center justify-between py-3 px-1 mb-4 border-y border-border-light/40">
          {[
            { icon: CheckCircle2, label: 'Effective', value: '48/54', sub: '89%', c: 'text-green-600' },
            { icon: Shield, label: 'Deficiencies', value: '2 open', sub: '', c: 'text-red-500' },
            { icon: Zap, label: 'Workflows', value: '8 active', sub: '115 runs', c: 'text-violet-600' },
            { icon: Activity, label: 'Exceptions', value: '5/8 resolved', sub: '63%', c: 'text-blue-600' },
            { icon: Users, label: 'Team', value: '74% utilized', sub: '5 of 7', c: 'text-orange-600' },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-2">
              <s.icon size={13} className={s.c} />
              <div>
                <div className="text-[11.5px] font-semibold text-text">{s.value} <span className="text-[9.5px] font-normal text-text-muted">{s.sub}</span></div>
                <div className="text-[9px] text-text-muted uppercase tracking-wider">{s.label}</div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* ─── Pending Workflow Runs ─── */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.78 }} className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12.5px] font-semibold text-text flex items-center gap-2"><Clock size={12} className="text-orange-500" /> Pending Workflow Runs</span>
            <button onClick={() => setView('workflow-templates')} className="text-[10px] text-primary font-medium hover:underline cursor-pointer">View all →</button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { name: 'SOD Violation Detector', time: 'Scheduled — Today 6 PM', type: 'Compliance', status: 'queued' as const, color: '#7c3aed' },
              { name: 'Three-Way PO Match', time: 'Scheduled — Tomorrow 6 AM', type: 'Reconciliation', status: 'queued' as const, color: '#0284c7' },
              { name: 'Contract Expiry Alert', time: 'Scheduled — Mar 28', type: 'Monitoring', status: 'pending-data' as const, color: '#059669' },
            ].map((w, i) => (
              <motion.div key={w.name} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 + i * 0.04 }}
                onClick={() => setView('workflow-templates')}
                className="p-3.5 rounded-xl cursor-pointer group hover:shadow-md transition-all"
                style={{ background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(16px)', border: '1px solid rgba(232,226,245,0.35)', boxShadow: '0 1px 8px rgba(106,18,205,0.02)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: w.color }} />
                  <span className="text-[12px] font-semibold text-text group-hover:text-primary transition-colors truncate">{w.name}</span>
                </div>
                <div className="text-[10px] text-text-muted mb-1.5">{w.time}</div>
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

        {/* ─── Activity — lightweight ─── */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12.5px] font-semibold text-text">Recent Activity</span>
            <button onClick={() => setView('dashboards')} className="text-[10px] text-primary font-medium hover:underline cursor-pointer flex items-center gap-0.5">View all <ArrowRight size={9} /></button>
          </div>
          <div className="space-y-1">
            {[
              { icon: CheckCircle2, text: 'Duplicate Detector blocked ₹45K to Acme Corp', time: '2h', c: 'text-green-500' },
              { icon: AlertTriangle, text: 'DEF-002: Rohan submitted remediation evidence', time: '4h', c: 'text-orange-500' },
              { icon: Zap, text: 'Vendor Monitor: 2 unauthorized bank changes blocked', time: '6h', c: 'text-blue-500' },
              { icon: Shield, text: 'R2R — 3 controls tested (CTR-007/008 effective)', time: '1d', c: 'text-purple-500' },
              { icon: Users, text: 'Sneha signed off Risk Assessment Review', time: '1d', c: 'text-emerald-500' },
            ].map((a, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.85 + i * 0.03 }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/50 transition-colors cursor-pointer">
                <a.icon size={13} className={a.c} />
                <span className="text-[11.5px] text-text flex-1">{a.text}</span>
                <span className="text-[9.5px] text-text-muted shrink-0">{a.time}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
