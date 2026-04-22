import { useState } from 'react';
import { motion } from 'motion/react';
import {
  FileSearch, Table2, Workflow,
  Search, Bot,
} from 'lucide-react';
import type { View } from '../../hooks/useAppState';

interface Props {
  setView: (v: View) => void;
}

interface Tool {
  id: string;
  icon: typeof FileSearch;
  title: string;
  description: string;
  tags: string[];
  beta?: boolean;
  view?: string;
}

const tools: Tool[] = [
  {
    id: 'forensics',
    icon: FileSearch,
    title: 'Document Forensics',
    description: 'Detect forgery, tampering, and AI-generated content in documents.',
    tags: ['Compliance', 'Detection'],
    view: 'ai-concierge-forensics',
  },
  {
    id: 'table',
    icon: Table2,
    title: 'Table Extractor',
    description: 'Extract structured tables from PDFs and images with AI.',
    tags: ['Data', 'Extraction'],
    view: 'ai-concierge-table-extractor',
  },
  {
    id: 'workflow-builder',
    icon: Workflow,
    title: 'Workflow Builder',
    description: 'Design a custom audit workflow from a prompt — upload data, map columns, run.',
    tags: ['Workflow', 'Audit', 'Builder'],
    beta: true,
    view: 'ai-concierge-workflow-builder',
  },
];

export default function AIConciergeView({ setView }: Props) {
  const [search, setSearch] = useState('');

  const filtered = tools.filter(
    (t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="h-full overflow-y-auto bg-canvas">
      {/* Page header */}
      <div className="border-b border-canvas-border bg-canvas-elevated">
        <div className="max-w-6xl mx-auto px-8 pt-8 pb-6">
          <div className="font-mono text-[11px] text-ink-500 mb-2 tracking-tight">Intelligence · AI Concierge</div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-brand-50 flex items-center justify-center shrink-0">
              <Bot size={20} className="text-brand-700" />
            </div>
            <div>
              <h1 className="font-display text-[34px] font-[420] tracking-tight text-ink-900 leading-[1.1]">AI Concierge</h1>
              <p className="text-[14px] text-ink-500 mt-0.5">Specialised AI tools for document analysis and data extraction.</p>
            </div>
          </div>

          {/* Search */}
          <div className="mt-6 max-w-md">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
              <input
                type="text"
                placeholder="Search tools…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 h-10 rounded-md border border-canvas-border bg-canvas-elevated text-[13px] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-brand-600 transition-colors"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-ink-500 hover:text-brand-700 transition-colors cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-6xl mx-auto px-8 py-8 space-y-6">
        {/* Info note */}
        <div className="flex items-start gap-3 px-4 py-3 rounded-md bg-brand-50 border border-brand-200">
          <Bot size={16} className="text-brand-700 mt-0.5 shrink-0" />
          <p className="text-[13px] text-ink-800 leading-relaxed">
            Looking for <span className="font-semibold">RACM Generation</span>? It is now embedded in{' '}
            <span className="font-semibold">Governance → RACM</span>. Data profiling and anomaly detection
            is available directly in <span className="font-semibold">IRA AI chat</span>.
          </p>
        </div>

        {/* Tool grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((tool, i) => {
            const Icon = tool.icon;
            return (
              <motion.button
                type="button"
                key={tool.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: i * 0.04, ease: [0.2, 0, 0, 1] }}
                onClick={() => { if (tool.view) setView(tool.view as View); }}
                className="text-left p-6 rounded-xl border border-canvas-border bg-canvas-elevated hover:border-brand-200 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-md bg-brand-50 flex items-center justify-center">
                    <Icon size={20} className="text-brand-700" />
                  </div>
                  {tool.beta && (
                    <span className="inline-flex items-center px-2 h-5 rounded-full bg-mitigated-50 text-mitigated-700 text-[11px] font-medium">
                      Beta
                    </span>
                  )}
                </div>

                <h3 className="font-display text-[18px] font-[420] text-ink-900 mb-1">
                  {tool.title}
                </h3>
                <p className="text-[13px] text-ink-500 leading-relaxed mb-4">
                  {tool.description}
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {tool.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 h-5 rounded-full bg-brand-50 text-brand-700 text-[11px] font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.button>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Search size={28} className="mx-auto text-ink-400 mb-3" />
            <p className="text-[14px] text-ink-500">No tools match "{search}".</p>
            <button
              onClick={() => setSearch('')}
              className="mt-2 text-[12px] text-brand-700 hover:underline cursor-pointer"
            >
              Clear search
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
