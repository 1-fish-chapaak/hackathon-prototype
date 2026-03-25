const STATUS_MAP: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  active: { bg: 'bg-success-bg', text: 'text-green-800', dot: 'bg-success', label: 'Active' },
  draft: { bg: 'bg-warning-bg', text: 'text-amber-800', dot: 'bg-warning', label: 'Draft' },
  complete: { bg: 'bg-info-bg', text: 'text-blue-800', dot: 'bg-info', label: 'Complete' },
  processed: { bg: 'bg-success-bg', text: 'text-green-800', dot: 'bg-success', label: 'Processed' },
  open: { bg: 'bg-danger-bg', text: 'text-red-800', dot: 'bg-danger', label: 'Open' },
  'in-progress': { bg: 'bg-info-bg', text: 'text-blue-800', dot: 'bg-info', label: 'In Progress' },
  resolved: { bg: 'bg-success-bg', text: 'text-green-800', dot: 'bg-success', label: 'Resolved' },
  mitigated: { bg: 'bg-success-bg', text: 'text-green-800', dot: 'bg-success', label: 'Mitigated' },
  connected: { bg: 'bg-success-bg', text: 'text-green-800', dot: 'bg-success', label: 'Connected' },
  disconnected: { bg: 'bg-danger-bg', text: 'text-red-800', dot: 'bg-danger', label: 'Disconnected' },
  effective: { bg: 'bg-success-bg', text: 'text-green-800', dot: 'bg-success', label: 'Effective' },
  ineffective: { bg: 'bg-danger-bg', text: 'text-red-800', dot: 'bg-danger', label: 'Ineffective' },
  'not-tested': { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400', label: 'Not Tested' },
  'not-started': { bg: 'bg-gray-100', text: 'text-gray-500', dot: 'bg-gray-400', label: 'Not Started' },
  final: { bg: 'bg-success-bg', text: 'text-green-800', dot: 'bg-success', label: 'Final' },
};

const SEVERITY_MAP: Record<string, { bg: string; text: string; label: string }> = {
  critical: { bg: 'bg-red-100', text: 'text-red-800', label: 'Critical' },
  high: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'High' },
  medium: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Medium' },
  low: { bg: 'bg-green-100', text: 'text-green-800', label: 'Low' },
  MW: { bg: 'bg-red-100', text: 'text-red-800', label: 'Material Weakness' },
  SD: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Significant Deficiency' },
  CD: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Control Deficiency' },
};

const FW_MAP: Record<string, { bg: string; text: string }> = {
  SOX: { bg: 'bg-blue-100', text: 'text-blue-700' },
  ITGC: { bg: 'bg-green-100', text: 'text-green-700' },
  Internal: { bg: 'bg-purple-100', text: 'text-purple-700' },
  'Key Control': { bg: 'bg-orange-100', text: 'text-orange-700' },
  IFC: { bg: 'bg-purple-100', text: 'text-purple-700' },
};

const TYPE_MAP: Record<string, { bg: string; text: string }> = {
  Detection: { bg: 'bg-red-50', text: 'text-red-700' },
  Monitoring: { bg: 'bg-blue-50', text: 'text-blue-700' },
  Compliance: { bg: 'bg-purple-50', text: 'text-purple-700' },
  Reconciliation: { bg: 'bg-green-50', text: 'text-green-700' },
};

export function StatusBadge({ status }: { status: string }) {
  const s = STATUS_MAP[status] || STATUS_MAP.draft;
  return (
    <span className={`inline-flex items-center gap-1.5 ${s.bg} ${s.text} px-2.5 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

export function SeverityBadge({ severity }: { severity: string }) {
  const s = SEVERITY_MAP[severity] || SEVERITY_MAP.low;
  return (
    <span className={`inline-flex items-center ${s.bg} ${s.text} px-2.5 py-0.5 rounded text-[11px] font-bold whitespace-nowrap`}>
      {s.label}
    </span>
  );
}

export function FrameworkBadge({ fw }: { fw: string }) {
  const f = FW_MAP[fw] || { bg: 'bg-gray-100', text: 'text-gray-600' };
  return (
    <span className={`inline-flex items-center ${f.bg} ${f.text} px-2 py-0.5 rounded text-[11px] font-bold`}>
      {fw}
    </span>
  );
}

export function TypeBadge({ type }: { type: string }) {
  const t = TYPE_MAP[type] || { bg: 'bg-gray-50', text: 'text-gray-600' };
  return (
    <span className={`inline-flex items-center ${t.bg} ${t.text} px-2 py-0.5 rounded text-[11px] font-bold`}>
      {type}
    </span>
  );
}

export function Avatar({ name, size = 28 }: { name: string; size?: number }) {
  const initials = name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
  const colors = ['#6a12cd', '#0284c7', '#16a34a', '#d97706', '#e11d48', '#7c3aed', '#0891b2'];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-bold shrink-0"
      style={{ width: size, height: size, background: color, fontSize: size * 0.34 }}
    >
      {initials}
    </div>
  );
}
