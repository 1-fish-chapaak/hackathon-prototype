// Shared chart primitives — used in ChatView, AddToDashboardModal, AddToReportModal

export type ChartDatum = { bucket: string; count: number; tone: string };

export function VerticalBars({ data, maxBarHeight = 140 }: { data: ChartDatum[]; maxBarHeight?: number }) {
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div className="flex items-end justify-around gap-3 px-2" style={{ height: maxBarHeight + 32 }}>
      {data.map(d => {
        const h = (d.count / max) * maxBarHeight;
        return (
          <div key={d.bucket} className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
            <div className="text-[12px] font-semibold text-ink-700 tabular-nums">{d.count}</div>
            <div className={`w-full rounded-t-md ${d.tone}`} style={{ height: Math.max(h, 2) }} />
            <div className="text-[11px] text-ink-500 truncate w-full text-center">{d.bucket}</div>
          </div>
        );
      })}
    </div>
  );
}

export function HorizontalBars({ data }: { data: ChartDatum[] }) {
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div className="flex flex-col gap-2 px-2 py-3">
      {data.map(d => {
        const w = (d.count / max) * 100;
        return (
          <div key={d.bucket} className="flex items-center gap-3">
            <div className="w-32 text-[12px] text-ink-700 truncate shrink-0">{d.bucket}</div>
            <div className="flex-1 h-5 bg-paper-100 rounded-md overflow-hidden">
              <div className={`h-full rounded-md ${d.tone}`} style={{ width: `${w}%` }} />
            </div>
            <div className="w-6 text-right text-[12px] font-semibold text-ink-700 tabular-nums">{d.count}</div>
          </div>
        );
      })}
    </div>
  );
}
