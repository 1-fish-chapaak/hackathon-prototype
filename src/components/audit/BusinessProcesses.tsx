import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, Plus, Upload, Link2,
  Clock, Play, ArrowUpRight,
  ChevronRight, Sparkles, FileSpreadsheet, X, Check,
  ArrowLeft, AlertTriangle, Shield
} from 'lucide-react';
import { BUSINESS_PROCESSES, SOPS, RACMS, RISKS, CONTROLS, WORKFLOWS } from '../../data/mockData';
import { StatusBadge, SeverityBadge, FrameworkBadge, TypeBadge, Avatar } from '../shared/StatusBadge';
import { CardContainer, CardBody, CardItem } from '../shared/3DCard';
import Orb from '../shared/Orb';

interface Props {
  selectedBPId: string | null;
  onSelectBP: (id: string | null) => void;
}

/* ─── Link Controls Modal ─── */
function LinkControlsModal({ risk, onClose }: { risk: typeof RISKS[0]; onClose: () => void }) {
  const [selected, setSelected] = useState<Set<string>>(
    new Set(CONTROLS.filter(c => c.riskId === risk.id).map(c => c.id))
  );

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-end">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ x: 400, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 400, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-[480px] h-full bg-white shadow-2xl overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b border-border-light px-6 py-4 z-10">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-bold text-text">Link Controls</h2>
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
              <X size={16} className="text-text-muted" />
            </button>
          </div>
          <p className="text-[12px] text-text-muted">Select controls to mitigate this risk</p>
          <div className="mt-3 p-3 rounded-xl bg-primary-xlight border border-primary/10">
            <div className="text-[11px] text-primary font-bold uppercase tracking-wider mb-1">Risk</div>
            <div className="text-[13px] font-medium text-text">{risk.name}</div>
            <div className="text-[11px] text-text-muted mt-1">{risk.id} · <SeverityBadge severity={risk.severity} /></div>
          </div>
        </div>

        <div className="px-6 py-4 space-y-2">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={13} className="text-primary" />
            <span className="text-[12px] font-semibold text-primary">AI Suggested Controls</span>
          </div>

          {CONTROLS.map(ctl => {
            const isSelected = selected.has(ctl.id);
            return (
              <motion.div
                key={ctl.id}
                layout
                onClick={() => toggle(ctl.id)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ai-card ${
                  isSelected
                    ? 'border-primary bg-primary-xlight shadow-sm'
                    : 'border-border-light bg-white hover:border-primary/20'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                    isSelected ? 'border-primary bg-primary' : 'border-gray-300'
                  }`}>
                    {isSelected && <Check size={12} className="text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[13px] font-semibold text-text">{ctl.name}</span>
                      {ctl.isKey && (
                        <span className="text-[9px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded uppercase">Key</span>
                      )}
                    </div>
                    <p className="text-[11.5px] text-text-muted leading-relaxed">{ctl.desc}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] font-mono text-text-muted/60">{ctl.id}</span>
                      <StatusBadge status={ctl.status} />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="sticky bottom-0 bg-white border-t border-border-light px-6 py-4 flex items-center justify-between">
          <span className="text-[12px] text-text-muted">{selected.size} controls selected</span>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="px-4 py-2 border border-border rounded-lg text-[13px] font-medium text-text-secondary hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button onClick={onClose} className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-[13px] font-semibold transition-colors flex items-center gap-1.5">
              <Check size={14} />
              Save Links
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Upload SOP Modal ─── */
function UploadSOPModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative bg-white rounded-2xl shadow-2xl w-[520px] overflow-hidden"
      >
        <div className="px-6 py-5 border-b border-border-light">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-text">Upload SOP</h2>
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={16} className="text-text-muted" /></button>
          </div>
          <p className="text-[12px] text-text-muted mt-1">AI will automatically scaffold a RACM from the uploaded document</p>
        </div>

        <div className="p-6">
          <div className="border-2 border-dashed border-primary/30 rounded-2xl p-10 text-center bg-primary-xlight/30 hover:bg-primary-xlight/50 transition-colors cursor-pointer">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Upload size={22} className="text-primary" />
            </div>
            <div className="text-[14px] font-semibold text-text mb-1">Drop your SOP file here</div>
            <div className="text-[12px] text-text-muted">PDF, DOCX up to 50MB</div>
            <div className="mt-4 flex items-center justify-center gap-2">
              <Sparkles size={13} className="text-primary" />
              <span className="text-[11px] text-primary font-semibold">AI will extract risks and controls automatically</span>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border-light flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 border border-border rounded-lg text-[13px] text-text-secondary hover:bg-gray-50">Cancel</button>
          <button onClick={onClose} className="px-4 py-2 bg-primary text-white rounded-lg text-[13px] font-semibold hover:bg-primary-hover flex items-center gap-1.5">
            <Upload size={14} />
            Upload & Process
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── BP Detail View ─── */
function BPDetailView({ bp, onBack }: {
  bp: typeof BUSINESS_PROCESSES[0]; onBack: () => void;
}) {
  const [tab, setTab] = useState<'overview' | 'sops' | 'racm' | 'workflows'>('overview');
  const [linkModal, setLinkModal] = useState<typeof RISKS[0] | null>(null);
  const [uploadModal, setUploadModal] = useState(false);

  const bpRacms = RACMS.filter(r => r.bpId === bp.id);
  const bpSops = SOPS.filter(s => s.bpId === bp.id);
  const bpWfs = WORKFLOWS.filter(w => w.bpId === bp.id);
  const bpRisks = RISKS.filter(r => r.bpId === bp.id);

  const tabs = [
    { id: 'overview' as const, label: 'Overview' },
    { id: 'sops' as const, label: 'SOPs', count: bpSops.length },
    { id: 'racm' as const, label: 'RACM', count: bpRacms.length },
    { id: 'workflows' as const, label: 'Workflows', count: bpWfs.length },
  ];

  return (
    <div className="h-full overflow-y-auto bg-surface-2">
      <AnimatePresence>
        {linkModal && <LinkControlsModal risk={linkModal} onClose={() => setLinkModal(null)} />}
        {uploadModal && <UploadSOPModal onClose={() => setUploadModal(false)} />}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto px-8 py-6">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-primary mb-4 transition-colors">
          <ArrowLeft size={14} />
          Business Processes
        </button>

        {/* BP Header */}
        <div className="bg-white rounded-2xl border border-border-light p-6 mb-6 ai-card">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: bp.color + '1a' }}>
              <span className="text-sm font-bold" style={{ color: bp.color }}>{bp.abbr}</span>
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-text">{bp.name}</h1>
              <p className="text-[12px] text-text-muted">Business Process · FY 2025–26</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setUploadModal(true)} className="flex items-center gap-1.5 px-3 py-2 border border-border rounded-lg text-[12px] font-medium text-text-secondary hover:bg-gray-50 transition-colors">
                <Upload size={13} />
                Upload SOP
              </button>
              <button className="flex items-center gap-1.5 px-3 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-[12px] font-semibold transition-colors">
                <Plus size={13} />
                Create RACM
              </button>
            </div>
          </div>

          <div className="grid grid-cols-6 gap-5">
            {[
              { l: 'Risks', v: bp.risks },
              { l: 'Controls', v: bp.controls },
              { l: 'Coverage', v: `${bp.coverage}%` },
              { l: 'SOPs', v: bp.sops },
              { l: 'Workflows', v: bp.workflows },
              { l: 'RACMs', v: bpRacms.length },
            ].map(s => (
              <div key={s.l}>
                <div className="text-xl font-bold text-text" style={s.l === 'Coverage' ? { color: bp.color } : {}}>{s.v}</div>
                <div className="text-[10px] text-text-muted uppercase tracking-wider mt-0.5">{s.l}</div>
              </div>
            ))}
          </div>

          {/* Coverage bar */}
          <div className="mt-4 h-2 bg-border-light rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${bp.coverage}%` }}
              transition={{ duration: 0.8 }}
              className="h-full rounded-full"
              style={{ background: bp.color }}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-border mb-6">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors ${
                tab === t.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-muted hover:text-text-secondary'
              }`}
            >
              <span className="flex items-center gap-2">
                {t.label}
                {t.count != null && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    tab === t.id ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-500'
                  }`}>{t.count}</span>
                )}
              </span>
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {tab === 'overview' && (
          <div className="grid grid-cols-5 gap-5">
            <div className="col-span-3 space-y-5">
              {/* Control Coverage */}
              <div className="bg-white rounded-xl border border-border-light p-5 ai-card">
                <h3 className="text-sm font-semibold text-text mb-4 flex items-center gap-2">
                  <Shield size={14} className="text-primary" />
                  Control Coverage
                </h3>
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <svg width="100" height="100" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#f1edf9" strokeWidth="10" />
                      <circle cx="50" cy="50" r="40" fill="none" stroke={bp.color} strokeWidth="10"
                        strokeDasharray={`${bp.coverage * 2.51} ${251 - bp.coverage * 2.51}`}
                        strokeLinecap="round" transform="rotate(-90 50 50)" />
                      <text x="50" y="48" textAnchor="middle" fontSize="18" fontWeight="700" fill="#0e0b1e">{bp.coverage}%</text>
                      <text x="50" y="62" textAnchor="middle" fontSize="9" fill="#9e96b8">covered</text>
                    </svg>
                  </div>
                  <div className="flex-1 space-y-3">
                    {[{ l: 'Mapped', v: bp.controls, pct: 100, c: bp.color }, { l: 'Tested', v: Math.round(bp.controls * 0.6), pct: 60, c: '#16a34a' }, { l: 'Gaps', v: Math.round(bp.risks * 0.3), pct: 30, c: '#dc2626' }].map(r => (
                      <div key={r.l}>
                        <div className="flex justify-between mb-1">
                          <span className="text-[12px] text-text-secondary">{r.l}</span>
                          <span className="text-[12px] font-bold text-text">{r.v}</span>
                        </div>
                        <div className="h-1.5 bg-border-light rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${r.pct}%`, background: r.c }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* RACMs */}
              <div className="bg-white rounded-xl border border-border-light p-5 ai-card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-text">RACMs ({bpRacms.length})</h3>
                  <button onClick={() => setTab('racm')} className="text-[11px] text-primary font-medium hover:underline flex items-center gap-1">
                    View All <ChevronRight size={11} />
                  </button>
                </div>
                {bpRacms.map(r => (
                  <div key={r.id} className="flex items-center gap-3 py-3 border-b border-border-light last:border-0">
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium text-text truncate">{r.name}</div>
                      <div className="text-[11px] text-text-muted mt-0.5">{r.id} · <FrameworkBadge fw={r.fw} /></div>
                    </div>
                    <StatusBadge status={r.status} />
                  </div>
                ))}
              </div>
            </div>

            <div className="col-span-2 space-y-5">
              {/* AI Insight Card */}
              <div className="bg-gradient-to-br from-primary-xlight to-white rounded-xl border border-primary/10 p-5 ai-shimmer">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={14} className="text-primary" />
                  <span className="text-[12px] font-bold text-primary">AI Insight</span>
                </div>
                <p className="text-[12.5px] text-text leading-relaxed">
                  <strong>{bp.abbr}</strong> has <strong>{bpRisks.filter(r => r.ctls === 0).length} risks</strong> with no controls mapped.
                  Coverage is at <strong>{bp.coverage}%</strong> — below the 80% benchmark. Consider prioritizing {bp.abbr} risk mitigation.
                </p>
                <button className="mt-3 text-[11px] text-primary font-semibold flex items-center gap-1 hover:underline">
                  View recommendations <ChevronRight size={10} />
                </button>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-xl border border-border-light p-5 ai-card">
                <h3 className="text-sm font-semibold text-text mb-3">Recent Activity</h3>
                {[
                  { t: 'RACM validated', d: 'Vendor Payment — Draft → Active', time: '2h ago' },
                  { t: 'SOP uploaded', d: 'Purchase Order SOP v1.3', time: '1d ago' },
                  { t: 'Workflow run', d: 'Duplicate Invoice Detector', time: '2d ago' },
                ].map((a, i) => (
                  <div key={i} className="flex items-start gap-2.5 py-2.5 border-b border-border-light last:border-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    <div className="flex-1">
                      <div className="text-[12px] font-medium text-text">{a.t}</div>
                      <div className="text-[11px] text-text-muted">{a.d}</div>
                    </div>
                    <span className="text-[10px] text-text-muted shrink-0">{a.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SOPs Tab */}
        {tab === 'sops' && (
          <div>
            <div onClick={() => setUploadModal(true)} className="border-2 border-dashed border-primary/20 rounded-2xl p-6 text-center cursor-pointer mb-6 bg-primary-xlight/20 hover:bg-primary-xlight/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Upload size={18} className="text-primary" />
              </div>
              <div className="text-[14px] font-bold text-text mb-1">Upload a new SOP</div>
              <div className="text-[12px] text-text-muted flex items-center justify-center gap-1.5">
                <Sparkles size={11} className="text-primary" />
                AI will automatically scaffold a RACM from the uploaded document
              </div>
            </div>

            <div className="space-y-3">
              {bpSops.map((sop, i) => {
                const linked = bpRacms.find(r => r.id === sop.racmId);
                return (
                  <motion.div
                    key={sop.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white rounded-xl border border-border-light p-5 flex items-center gap-4 ai-card"
                  >
                    <div className="w-10 h-10 rounded-xl bg-success-bg flex items-center justify-center shrink-0">
                      <FileSpreadsheet size={18} className="text-success" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[13px] font-semibold text-text">{sop.name}</span>
                        <span className="text-[10px] font-bold bg-gray-100 text-text-muted px-1.5 py-0.5 rounded">{sop.version}</span>
                        <StatusBadge status={sop.status} />
                      </div>
                      <div className="text-[11px] text-text-muted">
                        Uploaded by {sop.by} · {sop.at} · {sop.risks} risks · {sop.controls} controls extracted
                      </div>
                    </div>
                    {linked ? (
                      <button className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-light text-primary rounded-lg text-[12px] font-semibold hover:bg-primary/15 transition-colors">
                        <Link2 size={12} />
                        View RACM
                      </button>
                    ) : (
                      <button className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg text-[12px] font-medium text-text-secondary hover:bg-gray-50 transition-colors">
                        <Plus size={12} />
                        Generate RACM
                      </button>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* RACM Tab */}
        {tab === 'racm' && (
          <div>
            <div className="flex gap-3 mb-4">
              <div className="flex-1 relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input placeholder="Search RACMs..." className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-white text-[13px] outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10" />
              </div>
              <button className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-[13px] font-semibold hover:bg-primary-hover transition-colors">
                <Plus size={14} />
                Create RACM
              </button>
            </div>

            <div className="bg-white rounded-xl border border-border-light overflow-hidden">
              <table className="w-full text-[12.5px]">
                <thead>
                  <tr className="bg-surface-2 border-b border-border-light">
                    <th className="text-left px-4 py-3 font-semibold text-text-secondary">RACM</th>
                    <th className="text-left px-3 py-3 font-semibold text-text-secondary">Framework</th>
                    <th className="text-left px-3 py-3 font-semibold text-text-secondary">Status</th>
                    <th className="text-left px-3 py-3 font-semibold text-text-secondary">Owner</th>
                    <th className="text-left px-3 py-3 font-semibold text-text-secondary">Last Run</th>
                  </tr>
                </thead>
                <tbody>
                  {bpRacms.map((r, i) => (
                    <motion.tr
                      key={r.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.04 }}
                      className="border-b border-border-light last:border-0 hover:bg-primary-xlight/50 transition-colors cursor-pointer group"
                    >
                      <td className="px-4 py-3">
                        <div className="text-[13px] font-medium text-text group-hover:text-primary transition-colors">{r.name}</div>
                        <div className="text-[11px] text-text-muted">{r.id}{r.sopId && <span className="text-primary"> · SOP linked</span>}</div>
                      </td>
                      <td className="px-3 py-3"><FrameworkBadge fw={r.fw} /></td>
                      <td className="px-3 py-3"><StatusBadge status={r.status} /></td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1.5">
                          <Avatar name={r.owner} size={20} />
                          <span className="text-text-secondary text-[11px]">{r.owner.split(' ')[0]}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-text-muted text-[11px] flex items-center gap-1">
                        <Clock size={11} />
                        {r.lastRun}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Risks under this RACM - with Link Controls */}
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-text mb-3 flex items-center gap-2">
                <AlertTriangle size={14} className="text-orange-500" />
                Risks in {bp.abbr} ({bpRisks.length})
              </h3>
              <div className="bg-white rounded-xl border border-border-light overflow-hidden">
                <table className="w-full text-[12.5px]">
                  <thead>
                    <tr className="bg-surface-2 border-b border-border-light">
                      <th className="text-left px-4 py-3 font-semibold text-text-secondary">Risk</th>
                      <th className="text-left px-3 py-3 font-semibold text-text-secondary">Manage Controls</th>
                      <th className="text-left px-3 py-3 font-semibold text-text-secondary">Severity</th>
                      <th className="text-left px-3 py-3 font-semibold text-text-secondary">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bpRisks.map((r, i) => (
                      <motion.tr
                        key={r.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                        className="border-b border-border-light last:border-0 hover:bg-primary-xlight/50 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="text-[13px] font-medium text-text">{r.name}</div>
                          <div className="text-[10px] text-text-muted font-mono">{r.id}</div>
                        </td>
                        <td className="px-3 py-3">
                          <button
                            onClick={() => setLinkModal(r)}
                            className="flex items-center gap-1.5 text-[12px] font-bold text-primary bg-primary-light px-3 py-1.5 rounded-lg hover:bg-primary/15 transition-colors"
                          >
                            <Link2 size={11} />
                            {r.ctls > 0 ? `${r.keyCtls} Key / ${r.ctls} Total` : 'Link Controls'}
                          </button>
                        </td>
                        <td className="px-3 py-3"><SeverityBadge severity={r.severity} /></td>
                        <td className="px-3 py-3"><StatusBadge status={r.status} /></td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Workflows Tab */}
        {tab === 'workflows' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-[13px] text-text-secondary">Independent workflows for {bp.name}</p>
              <button className="flex items-center gap-1.5 px-3 py-2 bg-primary text-white rounded-lg text-[12px] font-semibold hover:bg-primary-hover">
                <Plus size={13} />
                Create Workflow
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {bpWfs.map((wf, i) => (
                <motion.div
                  key={wf.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-xl border border-border-light p-5 ai-card"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="text-[14px] font-semibold text-text mb-1.5">{wf.name}</div>
                      <div className="flex items-center gap-2">
                        <TypeBadge type={wf.type} />
                        <StatusBadge status={wf.status} />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-text-muted mb-3">
                    <div className="flex items-center gap-1"><Clock size={10} />{wf.lastRun}</div>
                    <div className="flex items-center gap-1">{wf.runs} runs</div>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex items-center gap-1 px-3 py-1.5 bg-primary-light text-primary rounded-lg text-[11px] font-semibold hover:bg-primary/15">
                      <Play size={10} />
                      Run Now
                    </button>
                    <button className="flex items-center gap-1 px-3 py-1.5 border border-border rounded-lg text-[11px] font-medium text-text-secondary hover:bg-gray-50">
                      <ArrowUpRight size={10} />
                      Promote to Control
                    </button>
                  </div>
                </motion.div>
              ))}

              {/* Add new card */}
              <div className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-primary/30 hover:bg-primary-xlight/20 transition-all min-h-[180px]">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                  <Plus size={16} className="text-primary" />
                </div>
                <div className="text-[13px] font-semibold text-text">New Workflow</div>
                <div className="text-[11px] text-text-muted">Or import from library</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Business Processes List ─── */
export default function BusinessProcesses({ selectedBPId, onSelectBP }: Props) {
  if (selectedBPId) {
    const bp = BUSINESS_PROCESSES.find(b => b.id === selectedBPId);
    if (bp) return <BPDetailView bp={bp} onBack={() => onSelectBP(null)} />;
  }

  return (
    <div className="h-full overflow-y-auto bg-white bg-mesh-gradient relative">
      <Orb hoverIntensity={0.09} rotateOnHover hue={275} opacity={0.08} />
      <div className="max-w-5xl mx-auto px-8 py-8 relative">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-text tracking-tight">Business Processes</h1>
            <p className="text-sm text-text-secondary mt-1">Manage processes, SOPs, RACMs, and control mappings</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-[13px] font-semibold transition-colors">
            <Plus size={14} />
            Add Process
          </button>
        </div>

        {/* AI Insight Banner */}
        <div className="bg-gradient-to-r from-primary-xlight via-white to-primary-xlight rounded-2xl border border-primary/10 p-5 mb-6 flex items-center gap-4 ai-shimmer">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-medium flex items-center justify-center shrink-0">
            <Sparkles size={18} className="text-white" />
          </div>
          <div className="flex-1">
            <div className="text-[13px] font-semibold text-text">AI Coverage Analysis</div>
            <div className="text-[12px] text-text-secondary mt-0.5">
              2 processes are below 60% control coverage. <span className="text-primary font-semibold cursor-pointer hover:underline">View recommendations</span>
            </div>
          </div>
          <div className="flex gap-4 shrink-0">
            <div className="text-center">
              <div className="text-lg font-bold font-mono text-text">{BUSINESS_PROCESSES.length}</div>
              <div className="text-[10px] text-text-muted uppercase tracking-wider">Processes</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold font-mono text-primary">{Math.round(BUSINESS_PROCESSES.reduce((s, b) => s + b.coverage, 0) / BUSINESS_PROCESSES.length)}%</div>
              <div className="text-[10px] text-text-muted uppercase tracking-wider">Avg Coverage</div>
            </div>
          </div>
        </div>

        {/* BP Cards — 3D Hover */}
        <div className="grid grid-cols-2 gap-5">
          {BUSINESS_PROCESSES.map((bp, i) => (
            <motion.div
              key={bp.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <CardContainer containerClassName="w-full">
                <CardBody
                  className="bg-white rounded-2xl border border-border-light p-6 cursor-pointer hover:border-primary/30 hover:shadow-lg transition-all group relative overflow-hidden"
                >
                  {/* Accent gradient orb */}
                  <div
                    className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-[0.07] blur-2xl pointer-events-none"
                    style={{ background: bp.color }}
                  />
                  <div
                    className="absolute bottom-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: `linear-gradient(90deg, ${bp.color}, ${bp.color}80, transparent)` }}
                  />

                  <div onClick={() => onSelectBP(bp.id)} className="relative">
                    <CardItem translateZ={40}>
                      <div className="flex items-center gap-3 mb-5">
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-sm" style={{ background: bp.color + '1a' }}>
                          <span className="text-sm font-bold" style={{ color: bp.color }}>{bp.abbr}</span>
                        </div>
                        <div className="flex-1">
                          <div className="text-[15px] font-semibold text-text group-hover:text-primary transition-colors">{bp.name}</div>
                          <div className="text-[11px] text-text-muted">FY 2025–26</div>
                        </div>
                        <ChevronRight size={15} className="text-text-muted opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </CardItem>

                    <CardItem translateZ={25}>
                      <div className="grid grid-cols-4 gap-3 mb-5">
                        {[
                          { l: 'Risks', v: bp.risks, c: '#dc2626' },
                          { l: 'Controls', v: bp.controls, c: '#0284c7' },
                          { l: 'SOPs', v: bp.sops, c: '#16a34a' },
                          { l: 'Workflows', v: bp.workflows, c: '#d97706' },
                        ].map(s => (
                          <div key={s.l} className="text-center p-2 rounded-lg bg-surface-2/80 border border-border-light/50">
                            <div className="text-lg font-bold text-text leading-none mb-0.5">{s.v}</div>
                            <div className="text-[9px] text-text-muted uppercase tracking-wider font-medium">{s.l}</div>
                          </div>
                        ))}
                      </div>
                    </CardItem>

                    <CardItem translateZ={15}>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2.5 bg-border-light rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${bp.coverage}%` }}
                            transition={{ duration: 0.8, delay: 0.2 + i * 0.1 }}
                            className="h-full rounded-full"
                            style={{ background: `linear-gradient(90deg, ${bp.color}, ${bp.color}cc)` }}
                          />
                        </div>
                        <span className="text-[13px] font-bold font-mono" style={{ color: bp.color }}>{bp.coverage}%</span>
                      </div>
                    </CardItem>
                  </div>
                </CardBody>
              </CardContainer>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
