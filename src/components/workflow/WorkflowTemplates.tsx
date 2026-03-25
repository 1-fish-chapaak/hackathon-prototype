import { motion } from 'motion/react';
import {
  Search, Plus, Activity, Eye,
  Zap, Shield, RefreshCw, Sparkles, TrendingUp, TrendingDown,
  Clock, Lightbulb, ArrowRight
} from 'lucide-react';
import { WORKFLOWS } from '../../data/mockData';
import { StatusBadge, TypeBadge } from '../shared/StatusBadge';
import BorderGlow from '../shared/BorderGlow';
import Orb from '../shared/Orb';

interface Props {
  onSelectWorkflow: (id: string) => void;
  onBuildNew: () => void;
}

const TYPE_ICONS: Record<string, React.ElementType> = {
  Detection: Zap,
  Monitoring: Eye,
  Compliance: Shield,
  Reconciliation: RefreshCw,
};

// Mock sparkline data for each workflow
const SPARKLINES: Record<string, number[]> = {
  'wf-001': [65, 72, 68, 85, 90, 88, 92, 95],
  'wf-002': [40, 55, 52, 60, 58, 65, 70, 68],
  'wf-003': [80, 75, 82, 78, 85, 90, 88, 92],
  'wf-004': [50, 60, 55, 70, 72, 68, 75, 80],
  'wf-005': [30, 45, 50, 65, 70, 75, 80, 85],
  'wf-006': [90, 88, 85, 82, 80, 78, 82, 85],
  'wf-007': [70, 72, 75, 78, 80, 82, 85, 88],
  'wf-008': [55, 60, 58, 65, 70, 68, 72, 78],
};

function MiniSparkline({ data, color = '#6a12cd' }: { data: number[]; color?: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const h = 28;
  const w = 64;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * h;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={w} height={h} className="shrink-0">
      <polyline fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" points={points} />
    </svg>
  );
}

export default function WorkflowTemplates({ onSelectWorkflow, onBuildNew }: Props) {
  const totalRuns = WORKFLOWS.reduce((a, w) => a + w.runs, 0);
  const avgScore = 82;

  return (
    <div className="h-full overflow-y-auto bg-white bg-mesh-gradient relative">
      <Orb hoverIntensity={0.09} rotateOnHover hue={275} opacity={0.08} />
      <div className="max-w-6xl mx-auto px-8 py-8 relative">
        {/* Header */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-text tracking-tight">Workflow Intelligence</h1>
            <p className="text-sm text-text-secondary mt-1">Monitor, analyze, and optimize audit workflows</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                placeholder="Search workflows..."
                className="pl-9 pr-4 py-2 rounded-lg border border-border bg-white text-[13px] outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 w-56 transition-all"
              />
            </div>
            <button
              onClick={onBuildNew}
              className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-[13px] font-semibold transition-colors cursor-pointer"
            >
              <Plus size={14} />
              Build New
            </button>
          </div>
        </div>

        {/* AI Insight Banner */}
        <div className="bg-gradient-to-r from-primary-xlight via-white to-primary-xlight rounded-xl border border-primary/10 p-4 mb-6 flex items-center gap-4 ai-shimmer">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-medium flex items-center justify-center shrink-0">
            <Sparkles size={16} className="text-white" />
          </div>
          <div className="flex-1">
            <div className="text-[12.5px] font-semibold text-text">Impact Intelligence</div>
            <div className="text-[11.5px] text-text-secondary">
              Duplicate Invoice Detector saved <strong>$2.4M</strong> in potential overpayments this quarter. 3 workflows need attention.
            </div>
          </div>
          <div className="flex gap-6 shrink-0">
            <div className="text-center">
              <div className="text-lg font-bold font-mono text-text">{WORKFLOWS.length}</div>
              <div className="text-[9px] text-text-muted uppercase tracking-wider">Workflows</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold font-mono text-primary">{totalRuns}</div>
              <div className="text-[9px] text-text-muted uppercase tracking-wider">Total Runs</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold font-mono text-success">{avgScore}</div>
              <div className="text-[9px] text-text-muted uppercase tracking-wider">Avg Score</div>
            </div>
          </div>
        </div>

        {/* AI Recommended Workflows */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb size={13} className="text-primary/60" />
            <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">AI Recommended for Your Audit</span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { name: 'Vendor Bank Account Validator', desc: 'Cross-reference vendor bank details against known fraud databases before payment release', type: 'Detection', score: 96 },
              { name: 'Purchase Order Split Detector', desc: 'Identify PO splitting patterns that bypass approval thresholds', type: 'Compliance', score: 89 },
              { name: 'Intercompany Balance Reconciler', desc: 'Auto-reconcile intercompany balances across subsidiaries for R2R close', type: 'Reconciliation', score: 92 },
            ].map((rw, i) => {
              const TypeIcon = TYPE_ICONS[rw.type] || Activity;
              return (
                <motion.div
                  key={rw.name}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.08 }}
                >
                  <BorderGlow
                    borderRadius={16}
                    glowRadius={35}
                    glowIntensity={1}
                    coneSpread={30}
                    edgeSensitivity={40}
                    backgroundColor="#ffffff"
                    colors={['#6a12cd', '#9b59d6', '#c084fc']}
                  >
                    <div
                      className="p-5 relative cursor-pointer group rounded-2xl hover:shadow-sm transition-shadow"
                      onClick={onBuildNew}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                          <TypeIcon size={14} />
                        </div>
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/5">
                          <Sparkles size={9} className="text-primary" />
                          <span className="text-[9px] font-bold text-primary uppercase tracking-wider">{rw.score}% match</span>
                        </div>
                      </div>
                      <h4 className="text-[13px] font-semibold text-text group-hover:text-primary transition-colors mb-1.5">{rw.name}</h4>
                      <p className="text-[11px] text-text-muted leading-relaxed">{rw.desc}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <TypeBadge type={rw.type} />
                        <span className="text-[10px] text-primary font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                          Build <ArrowRight size={9} />
                        </span>
                      </div>
                    </div>
                  </BorderGlow>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Workflow Cards - list style */}
        <div className="space-y-3">
          {WORKFLOWS.map((wf, i) => {
            const Icon = TYPE_ICONS[wf.type] || Activity;
            const sparkData = SPARKLINES[wf.id] || [50, 60, 55, 70, 65, 72, 68, 75];
            const score = sparkData[sparkData.length - 1];
            const prevScore = sparkData[sparkData.length - 2];
            const delta = score - prevScore;
            const isUp = delta >= 0;

            return (
              <motion.div
                key={wf.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => onSelectWorkflow(wf.id)}
                className="glass-card rounded-2xl p-5 cursor-pointer group relative overflow-hidden"
              >
                {/* Top color strip on hover */}
                <div className={`absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity ${
                  score >= 80 ? 'bg-gradient-to-r from-green-400 to-emerald-400' :
                  score >= 60 ? 'bg-gradient-to-r from-amber-400 to-yellow-400' :
                  'bg-gradient-to-r from-red-400 to-orange-400'
                }`} />

                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="p-2 rounded-lg bg-primary-xlight text-primary shrink-0 mt-0.5">
                      <Icon size={16} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-[15px] font-semibold text-text group-hover:text-primary transition-colors">{wf.name}</h3>
                      <p className="text-[12px] text-text-muted leading-relaxed mt-1 max-w-xl">{wf.desc}</p>
                    </div>
                  </div>

                  {/* Impact score ring */}
                  <div className="text-center shrink-0 ml-4">
                    <svg width="52" height="52" viewBox="0 0 52 52">
                      <circle cx="26" cy="26" r="22" fill="none" stroke="#f1edf9" strokeWidth="4" />
                      <circle cx="26" cy="26" r="22" fill="none"
                        stroke={score >= 80 ? '#16a34a' : score >= 60 ? '#d97706' : '#dc2626'}
                        strokeWidth="4"
                        strokeDasharray={`${score * 1.382} ${138.2 - score * 1.382}`}
                        strokeLinecap="round" transform="rotate(-90 26 26)" />
                      <text x="26" y="24" textAnchor="middle" fontSize="12" fontWeight="700" fill="#0e0b1e">{score}</text>
                      <text x="26" y="34" textAnchor="middle" fontSize="7" fill="#9e96b8">SCORE</text>
                    </svg>
                  </div>
                </div>

                {/* Metrics strip */}
                <div className="grid grid-cols-4 gap-3 mb-4">
                  {[
                    { l: 'Total Runs', v: wf.runs, delta: '+3', up: true },
                    { l: 'Flags Raised', v: Math.round(wf.runs * 0.3), delta: '-2', up: false },
                    { l: 'Avg Duration', v: '1.8s', delta: '-0.2s', up: false },
                    { l: 'Success Rate', v: '98.5%', delta: '+0.5%', up: true },
                  ].map(m => (
                    <div key={m.l} className="bg-surface-2 rounded-lg p-3 border border-border-light">
                      <div className="text-[9px] text-text-muted uppercase tracking-wider mb-1">{m.l}</div>
                      <div className="text-base font-bold font-mono text-text leading-none mb-1">{m.v}</div>
                      <div className={`text-[10px] font-mono font-medium ${m.up ? 'text-success' : 'text-danger'}`}>
                        {m.delta}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom row: tags + sparkline + meta */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TypeBadge type={wf.type} />
                    <StatusBadge status={wf.status} />
                    <span className="text-[10px] text-text-muted flex items-center gap-1">
                      <Clock size={10} />
                      {wf.lastRun}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-[9px] text-text-muted uppercase tracking-wider">7-day trend</div>
                    </div>
                    <MiniSparkline data={sparkData} color={isUp ? '#16a34a' : '#dc2626'} />
                    <div className={`flex items-center gap-0.5 text-[11px] font-semibold font-mono ${isUp ? 'text-success' : 'text-danger'}`}>
                      {isUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                      {isUp ? '+' : ''}{delta}
                    </div>
                  </div>
                </div>

                {/* AI insight - show on first two */}
                {i < 2 && (
                  <div className={`mt-3 flex items-start gap-2 rounded-lg p-2.5 text-[11px] leading-relaxed ${
                    i === 0 ? 'bg-green-50 border border-green-100 text-green-700' : 'bg-amber-50 border border-amber-100 text-amber-700'
                  }`}>
                    <Sparkles size={12} className="shrink-0 mt-0.5" />
                    {i === 0 ? 'Detected 23% more duplicates after threshold adjustment. Recommend lowering fuzzy match tolerance from 85% to 80%.' :
                     'Vendor master change rate increased 40% — consider increasing monitoring frequency from daily to every 6 hours.'}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
