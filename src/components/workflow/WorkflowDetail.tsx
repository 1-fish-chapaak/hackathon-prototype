import { useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft, Play, Settings, Activity,
  CheckCircle2, Sparkles, TrendingUp,
  Download, AlertTriangle, Calendar,
  SlidersHorizontal, Database, Bell
} from 'lucide-react';
import { WORKFLOWS } from '../../data/mockData';
import Orb from '../shared/Orb';
import { useToast } from '../shared/Toast';
import WorkflowOutputPreview from './WorkflowOutputPreview';

interface Props {
  workflowId: string;
  onBack: () => void;
  onViewDashboard?: () => void;
  onGenerateReport?: () => void;
}

const RUN_HISTORY = [
  { id: '#12', date: 'Mar 20, 2026', trigger: 'Scheduled', duration: '1.8s', flags: 3, score: 95, status: 'ok' },
  { id: '#11', date: 'Mar 19, 2026', trigger: 'Scheduled', duration: '2.1s', flags: 1, score: 92, status: 'ok' },
  { id: '#10', date: 'Mar 18, 2026', trigger: 'Manual', duration: '1.6s', flags: 5, score: 88, status: 'ok' },
  { id: '#9', date: 'Mar 17, 2026', trigger: 'Scheduled', duration: '2.4s', flags: 0, score: 90, status: 'ok' },
  { id: '#8', date: 'Mar 16, 2026', trigger: 'Scheduled', duration: '3.2s', flags: 8, score: 72, status: 'warn' },
  { id: '#7', date: 'Mar 15, 2026', trigger: 'Manual', duration: '1.9s', flags: 2, score: 85, status: 'ok' },
  { id: '#6', date: 'Mar 14, 2026', trigger: 'Scheduled', duration: '2.0s', flags: 4, score: 80, status: 'ok' },
];

const VARIABLES = [
  { name: 'Match Threshold', value: '85%', unit: '', threshold: '> 80%', pct: 85, status: 'ok', delta: '+2%', trend: [78, 80, 82, 83, 85] },
  { name: 'Avg Processing Time', value: '1.8', unit: 's', threshold: '< 3s', pct: 60, status: 'ok', delta: '-0.3s', trend: [2.4, 2.1, 1.9, 1.8, 1.8] },
  { name: 'False Positive Rate', value: '4.2', unit: '%', threshold: '< 5%', pct: 84, status: 'ok', delta: '-0.8%', trend: [6.5, 5.8, 5.0, 4.5, 4.2] },
  { name: 'Records Scanned', value: '12.4K', unit: '', threshold: '> 10K', pct: 100, status: 'ok', delta: '+1.2K', trend: [8, 9.5, 10.2, 11.1, 12.4] },
  { name: 'Flags Raised', value: '23', unit: '', threshold: 'Monitor', pct: 50, status: 'warn', delta: '+8', trend: [12, 14, 15, 18, 23] },
  { name: 'Coverage', value: '98.5', unit: '%', threshold: '> 95%', pct: 98, status: 'ok', delta: '+0.5%', trend: [96, 97, 97.5, 98, 98.5] },
];

function ScoreChip({ score }: { score: number }) {
  const bg = score >= 85 ? 'bg-primary/10 text-primary' : score >= 70 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700';
  return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold font-mono ${bg}`}>{score}</span>;
}

function MiniTrend({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const h = 24;
  const w = 48;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / (max - min || 1)) * h}`).join(' ');
  return (
    <svg width={w} height={h}>
      <polyline fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" points={points} />
    </svg>
  );
}

type TabId = 'overview' | 'variables' | 'runs' | 'config' | 'output';

export default function WorkflowDetail({ workflowId, onBack, onViewDashboard, onGenerateReport }: Props) {
  const wf = WORKFLOWS.find(w => w.id === workflowId);
  const [tab, setTab] = useState<TabId>('overview');
  const { addToast } = useToast();
  const [running, setRunning] = useState(false);
  const [version, setVersion] = useState('v3');
  if (!wf) return null;

  const versionData: Record<string, { runs: number; flags: string; score: string; scoreNote: string }> = {
    'v1': { runs: 4, flags: '12', score: '78', scoreNote: '-2 vs prior' },
    'v2': { runs: 8, flags: '18', score: '87', scoreNote: '+9 vs v1' },
    'v3': { runs: wf.runs, flags: '23', score: '95', scoreNote: '+5 vs last period' },
  };
  const vData = versionData[version] || versionData['v3'];

  return (
    <div className="h-full overflow-y-auto bg-white bg-mesh-gradient relative">
      <Orb hoverIntensity={0.09} rotateOnHover hue={275} opacity={0.08} />
      <div className="max-w-6xl mx-auto px-8 py-8 relative">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-primary mb-4 transition-colors cursor-pointer">
          <ArrowLeft size={14} />
          Workflows
        </button>

        {/* Hero Card */}
        <div className="glass-card rounded-2xl p-6 mb-6 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-gradient-to-br from-primary/5 to-transparent rounded-full pointer-events-none" />

          <div className="flex items-start justify-between mb-5">
            <div>
              <div className="flex items-center gap-2 text-[11px] text-text-muted mb-2">
                <div className="flex items-center gap-1 text-success font-semibold uppercase tracking-wider">
                  <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                  Active
                </div>
                <span className="font-mono">{wf.id.toUpperCase()}</span>
              </div>
              <div className="flex items-center gap-3 mb-1.5">
                <h1 className="text-xl font-bold text-text tracking-tight">{wf.name}</h1>
                <div className="flex items-center gap-1 bg-surface-2 rounded-lg p-0.5">
                  {['v1', 'v2', 'v3'].map(v => (
                    <button
                      key={v}
                      onClick={() => setVersion(v)}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all cursor-pointer ${
                        version === v ? 'bg-white text-primary shadow-sm' : 'text-text-muted hover:text-text-secondary'
                      }`}
                    >
                      {v === 'v3' ? `${v} ★` : v}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-[13px] text-text-secondary leading-relaxed max-w-xl">{wf.desc}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-6">
              {onViewDashboard && (
                <button onClick={onViewDashboard} className="flex items-center gap-1.5 px-3 py-2 border border-border rounded-lg text-[12px] font-medium text-text-secondary hover:bg-gray-50 hover:border-primary/30 transition-colors cursor-pointer">
                  <Activity size={13} />
                  Dashboard
                </button>
              )}
              {onGenerateReport && (
                <button onClick={onGenerateReport} className="flex items-center gap-1.5 px-3 py-2 border border-border rounded-lg text-[12px] font-medium text-text-secondary hover:bg-gray-50 hover:border-primary/30 transition-colors cursor-pointer">
                  <Download size={13} />
                  Report
                </button>
              )}
              <button onClick={() => addToast({ message: 'Workflow configuration panel opening...', type: 'info' })} className="flex items-center gap-1.5 px-3 py-2 border border-border rounded-lg text-[12px] font-medium text-text-secondary hover:bg-gray-50 transition-colors cursor-pointer">
                <Settings size={13} />
                Configure
              </button>
              <button
                onClick={() => {
                  setRunning(true);
                  addToast({ message: 'Workflow execution started...', type: 'success' });
                  setTimeout(() => {
                    setRunning(false);
                    addToast({ message: 'Workflow completed — 2 new flags raised', type: 'success' });
                  }, 2500);
                }}
                disabled={running}
                className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-hover disabled:opacity-70 text-white rounded-lg text-[12px] font-semibold transition-colors cursor-pointer"
              >
                {running ? (
                  <>
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                      <Sparkles size={13} />
                    </motion.div>
                    Running...
                  </>
                ) : (
                  <>
                    <Play size={13} />
                    Run Now
                  </>
                )}
              </button>
            </div>
          </div>

          {/* KPI strip */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { l: 'Total Runs', v: vData.runs.toString(), icon: Activity, color: 'bg-primary/10 text-primary', note: '+3 this week' },
              { l: 'Flags Raised', v: vData.flags, icon: AlertTriangle, color: 'bg-amber-50 text-amber-600', note: '8 critical' },
              { l: 'Impact Score', v: vData.score, icon: TrendingUp, color: 'bg-green-50 text-green-600', note: vData.scoreNote },
            ].map(k => (
              <div key={k.l} className="bg-surface-2 border border-border-light rounded-xl p-4 hover:shadow-md hover:border-primary/20 transition-all duration-300 group cursor-default">
                <div className={`w-7 h-7 rounded-lg ${k.color} flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform duration-300`}>
                  <k.icon size={14} />
                </div>
                <div className="text-[9px] text-text-muted uppercase tracking-wider mb-1">{k.l}</div>
                <div className="text-2xl font-bold font-mono text-text leading-none mb-1">{k.v}</div>
                <div className="text-[11px] text-text-secondary">{k.note}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-border mb-6">
          {([
            { id: 'overview' as TabId, label: 'Execution Plan' },
            { id: 'variables' as TabId, label: 'Variables', count: VARIABLES.length },
            { id: 'runs' as TabId, label: 'Run History', count: RUN_HISTORY.length },
            { id: 'config' as TabId, label: 'Configuration' },
            { id: 'output' as TabId, label: 'Output Preview' },
          ]).map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors cursor-pointer ${
                tab === t.id ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text-secondary'
              }`}
            >
              <span className="flex items-center gap-2">
                {t.label}
                {t.count != null && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${tab === t.id ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-500'}`}>{t.count}</span>
                )}
              </span>
            </button>
          ))}
        </div>

        {/* Execution Plan Tab - professional list */}
        {tab === 'overview' && (
          <div className="space-y-5">
            {/* AI derivation note */}
            <div className="bg-surface-2 border border-border-light rounded-xl p-4 flex items-start gap-3">
              <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles size={12} className="text-primary" />
              </div>
              <div className="text-[12px] text-text-secondary leading-relaxed">
                Execution plan derived from workflow configuration. Each step processes data sequentially with built-in error handling and retry logic. Average end-to-end latency: <strong>1.8s</strong>.
              </div>
            </div>

            {/* Steps as professional table-like list */}
            <div className="bg-white rounded-xl border border-border-light overflow-hidden">
              <div className="grid grid-cols-[40px_1fr_120px_100px_80px] gap-3 px-5 py-3 bg-surface-2 border-b border-border-light">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">#</span>
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Step</span>
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Type</span>
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Avg Time</span>
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Status</span>
              </div>
              {wf.steps.map((step, i) => {
                const types = ['Ingestion', 'Transform', 'Analysis', 'Scoring', 'Action'];
                const times = ['0.3s', '0.2s', '0.8s', '0.3s', '0.2s'];
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="grid grid-cols-[40px_1fr_120px_100px_80px] gap-3 px-5 py-3.5 border-b border-border-light last:border-0 hover:bg-primary-xlight/30 transition-colors items-center"
                  >
                    <span className="text-[12px] font-mono font-bold text-text-muted">{i + 1}</span>
                    <div>
                      <span className="text-[13px] font-medium text-text">{step}</span>
                    </div>
                    <span className="text-[11px] font-mono text-text-muted">{types[i] || 'Process'}</span>
                    <span className="text-[11px] font-mono text-text-muted">{times[i] || '0.2s'}</span>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 size={13} className="text-success" />
                      <span className="text-[11px] text-success font-medium">OK</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Variables Tab */}
        {tab === 'variables' && (
          <div>
            {/* Historical Performance */}
            <div className="rounded-2xl border border-border-light p-5 mb-5" style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(20px)', boxShadow: '0 2px 12px rgba(106,18,205,0.02), inset 0 1px 0 rgba(255,255,255,0.6)' }}>
              <h4 className="text-[12px] font-bold text-text-muted uppercase tracking-wider mb-3 flex items-center gap-2"><TrendingUp size={13} className="text-primary" /> Impact Score Trend — Last 30 Days</h4>
              <svg width="100%" height="120" viewBox="0 0 400 120" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="trend-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6a12cd" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#6a12cd" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <polygon fill="url(#trend-fill)" points="0,120 0,90 20,85 40,88 60,80 80,75 100,78 120,70 140,72 160,65 180,60 200,58 220,55 240,50 260,48 280,45 300,40 320,38 340,35 360,30 380,25 400,20 400,120" />
                <polyline fill="none" stroke="#6a12cd" strokeWidth="2" strokeLinecap="round" points="0,90 20,85 40,88 60,80 80,75 100,78 120,70 140,72 160,65 180,60 200,58 220,55 240,50 260,48 280,45 300,40 320,38 340,35 360,30 380,25 400,20" />
              </svg>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[10px] text-text-muted">Feb 20</span>
                <span className="text-[11px] font-bold text-primary">Score: 95 ↑</span>
                <span className="text-[10px] text-text-muted">Mar 20</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {VARIABLES.map((v, i) => {
                const statusColor = v.status === 'ok' ? '#16a34a' : v.status === 'warn' ? '#d97706' : '#dc2626';
                return (
                  <motion.div
                    key={v.name}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white rounded-xl border border-border-light p-5 hover:shadow-md hover:border-primary/20 cursor-default transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{v.name}</span>
                      <div className="w-2 h-2 rounded-full mt-1" style={{ background: statusColor, boxShadow: `0 0 6px ${statusColor}40` }} />
                    </div>
                    <div className="flex items-baseline gap-1 mb-1.5">
                      <span className="text-2xl font-bold font-mono text-text">{v.value}</span>
                      {v.unit && <span className="text-sm font-mono text-text-muted">{v.unit}</span>}
                      <span className={`ml-2 text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded ${
                        v.delta.startsWith('+') && v.status === 'ok' ? 'bg-green-50 text-green-600' :
                        v.delta.startsWith('-') && v.name.includes('Time') ? 'bg-green-50 text-green-600' :
                        v.delta.startsWith('-') && v.name.includes('False') ? 'bg-green-50 text-green-600' :
                        v.status === 'warn' ? 'bg-amber-50 text-amber-600' :
                        'bg-green-50 text-green-600'
                      }`}>{v.delta}</span>
                    </div>
                    <div className="text-[10px] text-text-muted mb-2">Threshold: <span className="font-semibold">{v.threshold}</span></div>
                    <div className="h-1 bg-surface-3 rounded-full overflow-hidden mb-3">
                      <div className="h-full rounded-full" style={{ width: `${Math.min(v.pct, 100)}%`, background: statusColor }} />
                    </div>
                    <MiniTrend data={v.trend} color={statusColor} />
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Run History Tab */}
        {tab === 'runs' && (
          <div className="bg-white rounded-xl border border-border-light overflow-hidden">
            <div className="grid grid-cols-[80px_1fr_80px_100px_80px_80px_70px] gap-3 px-5 py-3 bg-surface-2 border-b border-border-light">
              {['Run', 'Date', 'Trigger', 'Duration', 'Flags', 'Score', 'Status'].map(h => (
                <span key={h} className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{h}</span>
              ))}
            </div>
            {RUN_HISTORY.map((run, i) => (
              <motion.div
                key={run.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.04 }}
                className="grid grid-cols-[80px_1fr_80px_100px_80px_80px_70px] gap-3 px-5 py-3.5 border-b border-border-light last:border-0 hover:bg-primary-xlight/30 active:bg-primary-xlight/50 transition-colors items-center cursor-pointer"
              >
                <span className="text-[12px] font-mono text-primary font-medium">{run.id}</span>
                <span className="text-[12px] font-mono text-text-secondary">{run.date}</span>
                <span className="text-[11px] text-text-muted">{run.trigger}</span>
                <span className="text-[12px] font-mono text-text font-medium">{run.duration}</span>
                <span className="text-[12px] font-mono text-text font-medium">{run.flags}</span>
                <ScoreChip score={run.score} />
                <span className="text-[10px] font-bold uppercase tracking-wider text-success bg-green-50 px-2 py-0.5 rounded text-center">
                  {run.status === 'ok' ? 'PASS' : 'WARN'}
                </span>
              </motion.div>
            ))}
          </div>
        )}

        {/* Configuration Tab */}
        {tab === 'config' && (
          <div className="space-y-5">
            {/* Schedule */}
            <div className="rounded-2xl border border-border-light p-5" style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(20px)', boxShadow: '0 2px 12px rgba(106,18,205,0.02), inset 0 1px 0 rgba(255,255,255,0.6)' }}>
              <h4 className="text-[12px] font-bold text-text-muted uppercase tracking-wider mb-3 flex items-center gap-2"><Calendar size={13} className="text-primary" /> Schedule & Triggers</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-semibold text-text block mb-1">Frequency</label>
                  <div className="flex gap-1.5">
                    {['Hourly', 'Daily', 'Weekly', 'Monthly'].map(f => (
                      <button key={f} className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${f === 'Daily' ? 'bg-primary text-white shadow-sm' : 'bg-surface-2 text-text-muted hover:bg-surface-3'}`}>{f}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-text block mb-1">Run Time</label>
                  <input value="06:00 AM" readOnly className="w-full px-3 py-2 rounded-lg border border-border-light text-[12px] bg-white text-text" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-text block mb-1">Trigger On</label>
                  <div className="flex gap-1.5">
                    {['Schedule', 'Data Change', 'Manual'].map(t => (
                      <button key={t} className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${t === 'Schedule' ? 'bg-primary text-white shadow-sm' : 'bg-surface-2 text-text-muted hover:bg-surface-3'}`}>{t}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-text block mb-1">Retry on Failure</label>
                  <div className="flex gap-1.5">
                    {['Off', '1x', '3x', '5x'].map(r => (
                      <button key={r} className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${r === '3x' ? 'bg-primary text-white shadow-sm' : 'bg-surface-2 text-text-muted hover:bg-surface-3'}`}>{r}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Thresholds & Rules */}
            <div className="rounded-2xl border border-border-light p-5" style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(20px)', boxShadow: '0 2px 12px rgba(106,18,205,0.02), inset 0 1px 0 rgba(255,255,255,0.6)' }}>
              <h4 className="text-[12px] font-bold text-text-muted uppercase tracking-wider mb-3 flex items-center gap-2"><SlidersHorizontal size={13} className="text-primary" /> Thresholds & Rules</h4>
              <div className="space-y-3">
                {[
                  { label: 'Match Tolerance', value: '5%', desc: 'Fuzzy match threshold for duplicate detection' },
                  { label: 'Amount Threshold', value: '₹10,000', desc: 'Minimum transaction value to scan' },
                  { label: 'Lookback Period', value: '12 months', desc: 'Historical window for comparison' },
                  { label: 'Max Results', value: '100', desc: 'Maximum flags per run' },
                ].map(rule => (
                  <div key={rule.label} className="flex items-center justify-between p-3 rounded-xl bg-surface-2/50 border border-border-light/50">
                    <div>
                      <div className="text-[12px] font-medium text-text">{rule.label}</div>
                      <div className="text-[10px] text-text-muted">{rule.desc}</div>
                    </div>
                    <input value={rule.value} readOnly className="w-24 text-right px-2 py-1.5 rounded-lg border border-border-light text-[12px] font-mono text-primary bg-white" />
                  </div>
                ))}
              </div>
            </div>

            {/* Data Sources */}
            <div className="rounded-2xl border border-border-light p-5" style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(20px)', boxShadow: '0 2px 12px rgba(106,18,205,0.02), inset 0 1px 0 rgba(255,255,255,0.6)' }}>
              <h4 className="text-[12px] font-bold text-text-muted uppercase tracking-wider mb-3 flex items-center gap-2"><Database size={13} className="text-primary" /> Connected Sources</h4>
              <div className="space-y-2">
                {[
                  { name: 'SAP ERP — AP Module', type: 'SQL', status: 'connected', records: '1.2M' },
                  { name: 'Vendor Master Data', type: 'CSV', status: 'connected', records: '892' },
                  { name: 'Invoice Archive 2026', type: 'PDF', status: 'connected', records: '4,521' },
                ].map(ds => (
                  <div key={ds.name} className="flex items-center justify-between p-3 rounded-xl bg-surface-2/50 border border-border-light/50">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <div>
                        <div className="text-[12px] font-medium text-text">{ds.name}</div>
                        <div className="text-[10px] text-text-muted">{ds.type} · {ds.records} records</div>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">{ds.status}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Notification settings */}
            <div className="rounded-2xl border border-border-light p-5" style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(20px)', boxShadow: '0 2px 12px rgba(106,18,205,0.02), inset 0 1px 0 rgba(255,255,255,0.6)' }}>
              <h4 className="text-[12px] font-bold text-text-muted uppercase tracking-wider mb-3 flex items-center gap-2"><Bell size={13} className="text-primary" /> Notifications</h4>
              <div className="space-y-2.5">
                {[
                  { label: 'Email on completion', enabled: true },
                  { label: 'Slack alert on critical flags', enabled: true },
                  { label: 'Dashboard auto-refresh', enabled: false },
                  { label: 'Weekly summary digest', enabled: true },
                ].map(n => (
                  <div key={n.label} className="flex items-center justify-between py-2">
                    <span className="text-[12px] text-text">{n.label}</span>
                    <div className={`w-9 h-5 rounded-full cursor-pointer transition-colors ${n.enabled ? 'bg-primary' : 'bg-surface-3'}`}>
                      <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform mt-0.5 ${n.enabled ? 'translate-x-4.5 ml-0.5' : 'translate-x-0.5'}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Output Preview Tab */}
        {tab === 'output' && (
          <WorkflowOutputPreview workflowId={workflowId} workflowType={wf.type} workflowName={wf.name} />
        )}
      </div>
    </div>
  );
}
