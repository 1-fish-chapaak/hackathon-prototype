import { useState } from 'react';
import { motion } from 'motion/react';
import {
  FileSearch, Table2, Workflow,
  Search, Sparkles, Bot, Info,
} from 'lucide-react';
import type { View } from '../../hooks/useAppState';
import GlowCard from '../shared/GlowCard';
import FloatingLines from '../shared/FloatingLines';

interface Props {
  setView: (v: View) => void;
}

interface Tool {
  id: string;
  icon: typeof FileSearch;
  title: string;
  description: string;
  tags: { label: string; color: string }[];
  beta?: boolean;
  view?: string;
}

const tools: Tool[] = [
  {
    id: 'forensics',
    icon: FileSearch,
    title: 'Document Forensics',
    description: 'Detect forgery, tampering, and AI-generated content in documents',
    tags: [
      { label: 'Compliance', color: 'bg-rose-100 text-rose-700' },
      { label: 'Detection', color: 'bg-amber-100 text-amber-700' },
    ],
    view: 'ai-concierge-forensics',
  },
  {
    id: 'table',
    icon: Table2,
    title: 'Table Extractor',
    description: 'Extract structured tables from PDFs and images with AI',
    tags: [
      { label: 'Data', color: 'bg-sky-100 text-sky-700' },
      { label: 'Extraction', color: 'bg-teal-100 text-teal-700' },
    ],
    view: 'ai-concierge-table-extractor',
  },
  {
    id: 'workflow-builder',
    icon: Workflow,
    title: 'Workflow Builder',
    description: 'Design a custom audit workflow from a prompt — upload data, map columns, run.',
    tags: [
      { label: 'Workflow', color: 'bg-violet-100 text-violet-700' },
      { label: 'Audit', color: 'bg-indigo-100 text-indigo-700' },
      { label: 'Builder', color: 'bg-fuchsia-100 text-fuchsia-700' },
    ],
    beta: true,
    view: 'ai-concierge-workflow-builder',
  },
];

const iconGradients = [
  'from-rose-500 to-pink-600',
  'from-sky-500 to-indigo-600',
  'from-violet-500 to-fuchsia-600',
];

export default function AIConciergeView({ setView }: Props) {
  const [search, setSearch] = useState('');

  const filtered = tools.filter(
    (t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.tags.some((tag) => tag.label.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="h-full overflow-y-auto relative" style={{ background: 'linear-gradient(180deg, #f8f5ff 0%, #fafafa 300px)' }}>
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#f3ecff] via-[#faf8ff] to-[#eee8f9]" />
        <FloatingLines enabledWaves={['top', 'middle']} lineCount={4} lineDistance={6} bendRadius={4} bendStrength={-0.3} interactive={true} parallax={true} color="#6a12cd" opacity={0.04} />

        <div className="relative px-6 pt-10 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <Bot size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-[28px] font-extrabold">
                  <span className="ai-gradient-text">AI Concierge</span>
                </h1>
                <p className="text-[14px] text-text-secondary leading-relaxed">
                  Specialized AI tools for document analysis and data extraction
                </p>
              </div>
            </div>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 max-w-md"
          >
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="Search tools..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border/60 bg-white/80 backdrop-blur-sm text-[13px] text-text placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
                >
                  <span className="text-xs">Clear</span>
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Info Note */}
      <div className="px-10 pb-4 -mt-1">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-start gap-3 px-5 py-4 rounded-xl bg-violet-50/80 border border-violet-200/60 backdrop-blur-sm"
        >
          <Info size={18} className="text-violet-500 mt-0.5 shrink-0" />
          <p className="text-[13px] text-violet-700 leading-relaxed">
            Looking for <span className="font-semibold">RACM Generation</span>? It's now embedded in{' '}
            <span className="font-semibold">Governance &gt; RACM</span>. Data profiling &amp; anomaly detection
            is available directly in <span className="font-semibold">IRA AI chat</span>.
          </p>
        </motion.div>
      </div>

      {/* Tool Grid */}
      <div className="px-10 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((tool, i) => {
            const Icon = tool.icon;
            const gradient = iconGradients[i % iconGradients.length];

            return (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.45,
                  delay: 0.1 + i * 0.06,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <GlowCard
                  onClick={() => {
                    if (tool.view) setView(tool.view as View);
                  }}
                  className="bg-white/70 backdrop-blur-xl border border-white/60"
                >
                  <div className="p-6">
                    {/* Header row */}
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}
                        style={{ boxShadow: `0 4px 14px rgba(106, 18, 205, 0.15)` }}
                      >
                        <Icon size={20} className="text-white" />
                      </div>
                      {tool.beta && (
                        <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 text-white text-[12px] font-bold uppercaser shadow-sm">
                          Beta
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-[15px] font-bold text-text mb-1.5 flex items-center gap-2">
                      {tool.title}
                      {tool.view && (
                        <Sparkles size={12} className="text-primary/40" />
                      )}
                    </h3>

                    {/* Description */}
                    <p className="text-[12.5px] text-text-secondary leading-relaxed mb-4">
                      {tool.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {tool.tags.map((tag) => (
                        <span
                          key={tag.label}
                          className={`px-2.5 py-0.5 rounded-full text-[12px] font-semibold ${tag.color}`}
                        >
                          {tag.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </GlowCard>
              </motion.div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Search size={32} className="mx-auto text-text-muted/40 mb-3" />
            <p className="text-[14px] text-text-muted">No tools match "{search}"</p>
            <button
              onClick={() => setSearch('')}
              className="mt-2 text-[12px] text-primary hover:underline cursor-pointer"
            >
              Clear search
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
