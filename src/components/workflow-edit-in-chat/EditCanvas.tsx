import { Database, Pencil, Sparkles, X } from 'lucide-react';

interface SourceRow {
  name: string;
  badge: string;
  status: 'linked' | 'pending';
}

interface MappingCard {
  name: string;
  from: string;
  cols: string[];
  ofTotal: number;
}

const SOURCES: SourceRow[] = [
  { name: 'Vendor Master Data', badge: 'CONTRACTS REGIS…', status: 'linked' },
];

const MAPPINGS: MappingCard[] = [
  {
    name: 'Invoices',
    from: 'SAP ERP — AP Module',
    cols: ['Invoice No', 'Vendor', 'PO Ref', 'Amount', 'Line Item', 'Invoice Date'],
    ofTotal: 6,
  },
  {
    name: 'Purchase Orders',
    from: 'GL Transaction History',
    cols: ['PO No', 'Vendor', 'Contract Ref', 'Amount', 'Line Item', 'Status'],
    ofTotal: 6,
  },
  {
    name: 'Contracts Register',
    from: 'Vendor Master Data',
    cols: ['Contract Ref', 'Vendor', 'Scope', 'Cap', 'End Date'],
    ofTotal: 5,
  },
];

export default function EditCanvas() {
  return (
    <main className="min-h-0 overflow-y-auto bg-canvas p-5">
      <div className="max-w-[780px] mx-auto space-y-4">
        {/* Linked source pill */}
        <div className="rounded-2xl border border-canvas-border bg-canvas-elevated p-4">
          <div className="text-[10px] font-bold uppercase tracking-wider text-ink-400 mb-2">
            Linked from data source
          </div>
          <div className="grid grid-cols-2 gap-2">
            {SOURCES.map((s) => (
              <div
                key={s.name}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-canvas-border bg-white"
              >
                <Database size={13} className="text-brand-500 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[12.5px] font-semibold text-ink-800 truncate">
                    {s.name}
                  </div>
                  <div className="text-[10.5px] text-ink-400">Linked from data…</div>
                </div>
                <span className="ml-auto inline-flex items-center text-[10px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded bg-brand-50 text-brand-700">
                  {s.badge}
                </span>
                <button
                  type="button"
                  className="text-ink-400 hover:text-ink-700 cursor-pointer"
                  aria-label="Unlink"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* IRA — verifying */}
        <IraBlock>
          <p className="text-[13px] text-ink-800 leading-relaxed">
            Got it — locked those in. Drop the required data files into the upload window so I
            can map them.
          </p>
        </IraBlock>

        {/* IRA — files verified */}
        <IraBlock>
          <p className="text-[13px] text-ink-800 leading-relaxed mb-1">
            Files verified — moving to data mapping.
          </p>
        </IraBlock>

        {/* IRA — mapping cards */}
        <IraBlock>
          <div className="space-y-2">
            {MAPPINGS.map((m) => {
              const ratio = `${m.cols.length} of ${m.ofTotal} cols`;
              return (
                <div
                  key={m.name}
                  className="rounded-2xl border border-canvas-border bg-white p-3.5"
                >
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="min-w-0 flex items-center gap-1.5">
                      <span className="text-[13px] font-semibold text-ink-900 truncate">
                        {m.name}
                      </span>
                      <span className="text-ink-300">←</span>
                      <span className="text-[12px] text-ink-500 truncate">{m.from}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10.5px] font-semibold text-ink-400 tabular-nums">
                        {ratio}
                      </span>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-brand-700 hover:text-brand-600 transition-colors cursor-pointer"
                      >
                        <Pencil size={11} />
                        Edit
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {m.cols.map((c) => (
                      <span
                        key={c}
                        className="text-[11px] font-medium px-1.5 py-0.5 rounded-md bg-brand-50/70 text-brand-700"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </IraBlock>
      </div>
    </main>
  );
}

function IraBlock({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1.5 text-[10.5px] font-bold uppercase tracking-wider text-ink-400">
        <Sparkles size={11} className="text-brand-600" />
        IRA
      </div>
      {children}
    </div>
  );
}
