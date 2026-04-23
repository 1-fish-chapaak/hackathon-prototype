import { useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft, Activity,
  CheckCircle2, Sparkles, TrendingUp,
  Download, AlertTriangle, Calendar,
  SlidersHorizontal, Database, Bell,
  ExternalLink, MessageSquare, Clock
} from 'lucide-react';
import { WORKFLOWS } from '../../data/mockData';
import Orb from '../shared/Orb';
import { useToast } from '../shared/Toast';

interface Props {
  workflowId: string;
  onBack: () => void;
  onViewDashboard?: () => void;
  onGenerateReport?: () => void;
  onOpenExecutor?: () => void;
  onEditInChat?: () => void;
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

function ScoreChip({ score }: { score: number }) {
  const bg = score >= 85 ? 'bg-primary/10 text-primary' : score >= 70 ? 'bg-mitigated-50 text-mitigated-700' : 'bg-risk-50 text-risk-700';
  return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold font-mono ${bg}`}>{score}</span>;
}

type TabId = 'overview' | 'runs' | 'config';

export default function WorkflowDetail({ workflowId, onBack, onViewDashboard, onGenerateReport, onOpenExecutor, onEditInChat }: Props) {
  const wf = WORKFLOWS.find(w => w.id === workflowId);
  const [tab, setTab] = useState<TabId>('overview');
  const { addToast } = useToast();
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
      <div className="px-6 py-8 relative">
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
                <button onClick={onViewDashboard} className="flex items-center gap-1.5 px-3 py-2 border border-border rounded-lg text-[12px] font-medium text-text-secondary hover:bg-paper-50 hover:border-primary/30 transition-colors cursor-pointer">
                  <Activity size={13} />
                  Dashboard
                </button>
              )}
              {onGenerateReport && (
                <button onClick={onGenerateReport} className="flex items-center gap-1.5 px-3 py-2 border border-border rounded-lg text-[12px] font-medium text-text-secondary hover:bg-paper-50 hover:border-primary/30 transition-colors cursor-pointer">
                  <Download size={13} />
                  Report
                </button>
              )}
              <button onClick={() => onEditInChat ? onEditInChat() : addToast({ message: 'Opening workflow in chat...', type: 'info' })} className="flex items-center gap-1.5 px-3 py-2 border border-border rounded-lg text-[12px] font-medium text-text-secondary hover:bg-paper-50 hover:border-primary/30 transition-colors cursor-pointer">
                <MessageSquare size={13} />
                Edit in Chat
              </button>
              <button
                onClick={() => onOpenExecutor ? onOpenExecutor() : addToast({ message: 'Opening executor...', type: 'info' })}
                className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-[12px] font-semibold transition-colors cursor-pointer"
              >
                <ExternalLink size={13} />
                Open Executor
              </button>
            </div>
          </div>

          {/* KPI strip */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { l: 'Total Runs', v: vData.runs.toString(), icon: Activity, color: 'bg-primary/10 text-primary', note: '+3 this week' },
              { l: 'Flags Raised', v: vData.flags, icon: AlertTriangle, color: 'bg-mitigated-50 text-mitigated-700', note: '8 critical' },
              { l: 'Impact Score', v: vData.score, icon: TrendingUp, color: 'bg-compliant-50 text-compliant-700', note: vData.scoreNote },
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
            { id: 'overview' as TabId, label: 'Overview' },
            { id: 'runs' as TabId, label: 'Runs', count: RUN_HISTORY.length },
            { id: 'config' as TabId, label: 'Configuration' },
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
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${tab === t.id ? 'bg-primary/10 text-primary' : 'bg-paper-50 text-ink-500'}`}>{t.count}</span>
                )}
              </span>
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {tab === 'overview' && (
          <div className="space-y-5">
            {/* Schedule Info */}
            <div className="rounded-2xl border border-border-light p-5" style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(20px)', boxShadow: '0 2px 12px rgba(106,18,205,0.02), inset 0 1px 0 rgba(255,255,255,0.6)' }}>
              <h4 className="text-[12px] font-bold text-text-muted uppercase tracking-wider mb-3 flex items-center gap-2"><Calendar size={13} className="text-primary" /> Schedule</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-surface-2 border border-border-light rounded-xl p-3">
                  <div className="text-[9px] text-text-muted uppercase tracking-wider mb-1">Type</div>
                  <div className="text-[14px] font-bold text-text">Daily</div>
                </div>
                <div className="bg-surface-2 border border-border-light rounded-xl p-3">
                  <div className="text-[9px] text-text-muted uppercase tracking-wider mb-1">Run Time</div>
                  <div className="text-[14px] font-bold text-text">06:00 AM</div>
                </div>
                <div className="bg-surface-2 border border-border-light rounded-xl p-3">
                  <div className="text-[9px] text-text-muted uppercase tracking-wider mb-1">Next Run</div>
                  <div className="text-[14px] font-bold text-primary flex items-center gap-1.5">
                    <Clock size={13} />
                    Tomorrow, 06:00 AM
                  </div>
                </div>
              </div>
            </div>

            {/* Execution Plan */}
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
                <span className="text-[10px] font-bold uppercase tracking-wider text-success bg-compliant-50 px-2 py-0.5 rounded text-center">
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
                      <div className="w-2 h-2 rounded-full bg-compliant-500" />
                      <div>
                        <div className="text-[12px] font-medium text-text">{ds.name}</div>
                        <div className="text-[10px] text-text-muted">{ds.type} · {ds.records} records</div>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold text-compliant-700 bg-compliant-50 px-1.5 py-0.5 rounded-full">{ds.status}</span>
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

      </div>
    </div>
  );
}
