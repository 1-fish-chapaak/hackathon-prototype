import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, ChevronRight } from 'lucide-react';
import {
  computeRacmState,
  RACM_STATUS_STYLES, RACM_READINESS_STYLES, RACM_ACTION_STYLES,
  type ComputedRacmState,
} from './racmStateEngine';
import RacmMappingWorkspace from './RacmMappingWorkspace';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface RacmEntry {
  id: string; name: string; version: string; process: string; framework: string;
  risks: number; controls: number; mappedRisks: number; unmappedRisks: number;
  keyControls: number; workflowCoverage: number; attributesCoverage: number;
  isValidated: boolean; linkedToEngagement: boolean;
}

function getRacmComputed(racm: RacmEntry): ComputedRacmState {
  return computeRacmState({
    risks: racm.risks,
    controls: racm.controls,
    mappedRisks: racm.mappedRisks,
    unmappedRisks: racm.unmappedRisks,
    keyControls: racm.keyControls,
    workflowCoverage: racm.workflowCoverage,
    attributesCoverage: racm.attributesCoverage,
    isValidated: racm.isValidated,
    linkedToEngagement: racm.linkedToEngagement,
  });
}

// ─── Seed Data ──────────────────────────────────────────────────────────────

export const RACM_SEED_DATA: RacmEntry[] = [
  { id: 'racm-001', name: 'FY26 P2P — Vendor Payment', version: 'v2.1', process: 'P2P', framework: 'SOX ICFR', risks: 9, controls: 24, mappedRisks: 9, unmappedRisks: 0, keyControls: 6, workflowCoverage: 92, attributesCoverage: 88, isValidated: true, linkedToEngagement: true },
  { id: 'racm-002', name: 'FY26 O2C — Revenue & AR', version: 'v2.1', process: 'O2C', framework: 'SOX ICFR', risks: 7, controls: 18, mappedRisks: 6, unmappedRisks: 1, keyControls: 4, workflowCoverage: 78, attributesCoverage: 65, isValidated: false, linkedToEngagement: false },
  { id: 'racm-003', name: 'FY26 R2R — Financial Close', version: 'v2.1', process: 'R2R', framework: 'SOX ICFR', risks: 11, controls: 31, mappedRisks: 10, unmappedRisks: 1, keyControls: 8, workflowCoverage: 85, attributesCoverage: 80, isValidated: true, linkedToEngagement: true },
  { id: 'racm-004', name: 'FY26 S2C — Contract Review', version: 'v1.8', process: 'S2C', framework: 'Internal Policy', risks: 5, controls: 14, mappedRisks: 3, unmappedRisks: 2, keyControls: 2, workflowCoverage: 60, attributesCoverage: 45, isValidated: false, linkedToEngagement: false },
  { id: 'racm-005', name: 'FY26 ITGC — Access & Change', version: 'v2.1', process: 'ITGC', framework: 'ISO 27001', risks: 6, controls: 15, mappedRisks: 6, unmappedRisks: 0, keyControls: 5, workflowCoverage: 100, attributesCoverage: 100, isValidated: true, linkedToEngagement: true },
];

// ─── Component ──────────────────────────────────────────────────────────────

interface Props {
  processFilter?: string;
}

export default function RacmListTable({ processFilter }: Props) {
  const [racmList] = useState<RacmEntry[]>(RACM_SEED_DATA);
  const [showMappingWorkspace, setShowMappingWorkspace] = useState(false);
  const [mappingRacm, setMappingRacm] = useState<RacmEntry | null>(null);

  const filtered = processFilter
    ? racmList.filter(r => r.process === processFilter)
    : racmList;

  // If mapping workspace is open, render it
  if (showMappingWorkspace && mappingRacm) {
    const mappingState = getRacmComputed(mappingRacm);
    return (
      <RacmMappingWorkspace
        racmId={mappingRacm.id}
        racmName={mappingRacm.name}
        racmProcess={mappingRacm.process}
        isEmpty={mappingRacm.risks === 0 && mappingState.status === 'Draft'}
        onBack={() => { setShowMappingWorkspace(false); setMappingRacm(null); }}
      />
    );
  }

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b border-border bg-surface-2/50">
              {['RACM', 'Framework', 'Risks', 'Controls', 'Key', 'Unmapped', 'Workflow %', 'Status', 'Readiness', 'Action'].map(h => (
                <th key={h} className="px-3 py-2.5 text-left text-[10px] font-semibold text-text-muted uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={10} className="px-4 py-10 text-center text-[12px] text-text-muted">No RACMs found for this process</td></tr>
            ) : filtered.map((racm, i) => {
              const computed = getRacmComputed(racm);
              return (
                <motion.tr key={racm.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  className="border-b border-border/50 hover:bg-gray-50/60 transition-colors">
                  <td className="px-3 py-3">
                    <div className="text-[12px] font-medium text-text">{racm.name}</div>
                    <div className="text-[10px] text-text-muted font-mono">{racm.version}</div>
                  </td>
                  <td className="px-3 py-3"><span className="text-[11px] text-text-secondary">{racm.framework}</span></td>
                  <td className="px-3 py-3"><span className="text-[12px] font-semibold text-text tabular-nums">{racm.risks}</span></td>
                  <td className="px-3 py-3"><span className="text-[12px] font-semibold text-text tabular-nums">{racm.controls}</span></td>
                  <td className="px-3 py-3"><span className="text-[12px] font-medium text-gray-600 tabular-nums">{racm.keyControls}</span></td>
                  <td className="px-3 py-3">
                    {racm.unmappedRisks > 0
                      ? <span className="text-[12px] font-bold text-red-600 tabular-nums">{racm.unmappedRisks}</span>
                      : <span className="text-[11px] text-gray-400 font-medium">0</span>}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2 min-w-[60px]">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-gray-400 transition-all" style={{ width: `${racm.workflowCoverage}%` }} />
                      </div>
                      <span className="text-[10px] text-gray-400 tabular-nums w-7 text-right">{racm.workflowCoverage}%</span>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <span className={`px-2 h-5 rounded-full text-[9px] font-semibold inline-flex items-center ${RACM_STATUS_STYLES[computed.status]}`}>{computed.status}</span>
                  </td>
                  <td className="px-3 py-3">
                    {computed.readiness !== 'Ready' ? (
                      <span className={`inline-flex items-center px-2 h-5 rounded-full text-[9px] font-semibold ${RACM_READINESS_STYLES[computed.readiness]}`}>
                        {computed.readiness}
                      </span>
                    ) : (
                      <span className={`inline-flex items-center gap-1 px-2 h-5 rounded-full text-[9px] font-semibold ${RACM_READINESS_STYLES.Ready}`}>
                        <CheckCircle2 size={9} />Ready
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <button onClick={() => { setMappingRacm(racm); setShowMappingWorkspace(true); }}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors inline-flex items-center gap-1 ${RACM_ACTION_STYLES[computed.action]}`}>
                      {computed.action}<ChevronRight size={8} />
                    </button>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between px-4 py-2.5 border-t border-border bg-surface-2/30">
        <span className="text-[11px] text-text-muted">{filtered.length} RACM{filtered.length !== 1 ? 's' : ''}</span>
      </div>
    </div>
  );
}
