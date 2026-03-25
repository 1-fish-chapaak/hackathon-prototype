import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText, Shield, AlertTriangle, CheckCircle2, BarChart3,
  TrendingUp, Download, Share2, ArrowRight, ArrowLeft, ChevronDown,
  Sparkles, Eye, Settings, Palette, Type,
  Image, Layout, X, Edit3, BookOpen, Upload, Lightbulb, Loader2
} from 'lucide-react';
import { REPORT_TEMPLATES, GENERATED_REPORTS } from '../../data/mockData';
import { StatusBadge } from '../shared/StatusBadge';
import SmartTable from '../shared/SmartTable';
import Orb from '../shared/Orb';
import { useToast } from '../shared/Toast';

const ICON_MAP: Record<string, React.ElementType> = {
  shield: Shield,
  'alert-triangle': AlertTriangle,
  'check-circle': CheckCircle2,
  'bar-chart': BarChart3,
  'file-text': FileText,
  'trending-up': TrendingUp,
  'clipboard-check': CheckCircle2,
  'lightbulb': Lightbulb,
  'book-open': BookOpen,
};

const CATEGORY_COLORS: Record<string, string> = {
  Compliance: 'text-blue-600 bg-blue-50',
  Risk: 'text-orange-600 bg-orange-50',
  Controls: 'text-green-600 bg-green-50',
  Analytics: 'text-purple-600 bg-purple-50',
  Audit: 'text-red-600 bg-red-50',
  Executive: 'text-indigo-600 bg-indigo-50',
};

const CATEGORY_GRADIENTS: Record<string, string> = {
  Compliance: 'from-[#1a0a2e] to-[#1a2744]',
  Risk: 'from-[#2e1a0a] to-[#1a0a2e]',
  Controls: 'from-[#0a2e1a] to-[#1a2744]',
  Analytics: 'from-[#1a0a2e] to-[#2d1550]',
  Audit: 'from-[#2e0a0a] to-[#1a0a2e]',
  Executive: 'from-[#0a0a2e] to-[#2d1550]',
};

const SECTION_ICONS: Record<string, React.ElementType> = {
  'file-text': FileText,
  'alert-triangle': AlertTriangle,
  'shield': Shield,
  'check-circle': CheckCircle2,
  'bar-chart': BarChart3,
  'trending-up': TrendingUp,
  'clipboard-check': CheckCircle2,
  'lightbulb': Lightbulb,
  'book-open': BookOpen,
};

interface ReportsViewProps {
  onOpenBuilder?: () => void;
  onShare?: (id: string) => void;
}

// ─── Upload Template Modal ───
function UploadTemplateModal({ onClose }: { onClose: () => void }) {
  const { addToast } = useToast();
  const [step, setStep] = useState<'upload' | 'selected' | 'converting' | 'converted'>('upload');
  const [templateName, setTemplateName] = useState('SOX Report Template');

  const DETECTED_SECTIONS = [
    'Executive Summary', 'Findings', 'Risk Assessment',
    'Control Testing Results', 'Recommendations', 'Appendix'
  ];

  useEffect(() => {
    if (step === 'converting') {
      const timer = setTimeout(() => setStep('converted'), 2000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        role="dialog" aria-modal="true" aria-label="Upload Template"
        className="relative bg-white rounded-2xl shadow-2xl w-[520px] max-h-[80vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-border-light flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-primary/10 text-primary rounded-xl"><Upload size={16} /></div>
            <div>
              <h3 className="text-[15px] font-semibold text-text">Upload Template</h3>
              <p className="text-[11px] text-text-muted">Convert a document into a report template</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"><X size={16} className="text-text-muted" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Drop Zone */}
          {step === 'upload' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <button
                onClick={() => setStep('selected')}
                className="w-full border-2 border-dashed border-border-light hover:border-primary/40 rounded-2xl p-10 flex flex-col items-center justify-center gap-3 transition-all duration-300 hover:bg-primary/[0.02] cursor-pointer group"
              >
                <div className="p-3 bg-primary/5 rounded-2xl group-hover:bg-primary/10 transition-colors">
                  <Upload size={28} className="text-primary/50 group-hover:text-primary transition-colors" />
                </div>
                <div className="text-center">
                  <p className="text-[13px] font-medium text-text">Drop your template file here or click to browse</p>
                  <p className="text-[11px] text-text-muted mt-1">Supports .docx, .pdf, .xlsx</p>
                </div>
              </button>
            </motion.div>
          )}

          {/* File Selected */}
          {step === 'selected' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-primary/[0.03] border border-primary/10 rounded-xl">
                <div className="p-2 bg-primary/10 rounded-lg"><FileText size={18} className="text-primary" /></div>
                <div className="flex-1">
                  <p className="text-[13px] font-semibold text-text">SOX_Report_Template.docx</p>
                  <p className="text-[11px] text-text-muted">2.4 MB</p>
                </div>
                <CheckCircle2 size={18} className="text-green-500" />
              </div>
              <button
                onClick={() => setStep('converting')}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-primary to-primary-medium text-white rounded-xl text-[13px] font-semibold hover:from-primary-hover hover:to-primary transition-all cursor-pointer"
              >
                <Sparkles size={14} /> Convert to Template
              </button>
            </motion.div>
          )}

          {/* Converting Animation */}
          {step === 'converting' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-8 gap-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              >
                <Sparkles size={32} className="text-primary" />
              </motion.div>
              <div className="text-center">
                <p className="text-[14px] font-semibold text-text">Analyzing document structure...</p>
                <p className="text-[11px] text-text-muted mt-1">Detecting sections, headers, and formatting</p>
              </div>
              <div className="w-48 h-1.5 bg-surface-2 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-primary-medium rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2, ease: 'easeInOut' }}
                />
              </div>
            </motion.div>
          )}

          {/* Conversion Complete */}
          {step === 'converted' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-100 rounded-xl">
                <CheckCircle2 size={20} className="text-green-500" />
                <div>
                  <p className="text-[13px] font-semibold text-green-800">Template converted!</p>
                  <p className="text-[11px] text-green-600">6 sections detected</p>
                </div>
              </div>

              <div>
                <label className="text-[12px] font-semibold text-text mb-2 block">Detected Sections</label>
                <div className="space-y-1.5">
                  {DETECTED_SECTIONS.map((section, i) => (
                    <motion.div
                      key={section}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="flex items-center gap-2.5 px-3 py-2 bg-surface-2 rounded-lg"
                    >
                      <div className="w-5 h-5 rounded-md bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">{i + 1}</div>
                      <span className="text-[12px] text-text font-medium">{section}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[12px] font-semibold text-text mb-2 block">Template Name</label>
                <input
                  value={templateName}
                  onChange={e => setTemplateName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-border-light text-[13px] focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
                />
              </div>
            </motion.div>
          )}
        </div>

        {step === 'converted' && (
          <div className="px-6 py-4 border-t border-border-light flex justify-end gap-2 shrink-0">
            <button onClick={onClose} className="px-4 py-2 text-[12px] font-medium text-text-secondary hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">Cancel</button>
            <button
              onClick={() => { addToast({ type: 'success', message: `"${templateName}" saved to template library!` }); onClose(); }}
              className="px-5 py-2 bg-primary text-white rounded-xl text-[12px] font-semibold hover:bg-primary-hover transition-colors cursor-pointer"
            >
              Save to Library
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ─── Template Preview Modal ───
function TemplatePreviewModal({ template, onClose, onEdit }: { template: typeof REPORT_TEMPLATES[0]; onClose: () => void; onEdit: () => void }) {
  const { addToast } = useToast();
  const Icon = ICON_MAP[template.icon] || FileText;
  const color = CATEGORY_COLORS[template.category] || 'text-gray-600 bg-gray-50';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        role="dialog" aria-modal="true" aria-label="Template Preview"
        className="relative bg-white rounded-2xl shadow-2xl w-[520px] max-h-[80vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-border-light flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${color}`}><Icon size={16} /></div>
            <div>
              <h3 className="text-[15px] font-semibold text-text">{template.name}</h3>
              <p className="text-[11px] text-text-muted">{template.category} template</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"><X size={16} className="text-text-muted" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <p className="text-[12.5px] text-text-secondary leading-relaxed">{template.desc}</p>

          <div>
            <label className="text-[12px] font-semibold text-text mb-3 block">Template Structure</label>
            <div className="space-y-2">
              {(template.sections || []).map((section, i) => {
                const SectionIcon = SECTION_ICONS[section.icon] || FileText;
                return (
                  <motion.div
                    key={section.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-center gap-3 px-4 py-3 bg-surface-2 rounded-xl hover:bg-primary/[0.03] transition-colors"
                  >
                    <div className="p-1.5 rounded-lg bg-white border border-border-light shadow-sm">
                      <SectionIcon size={14} className="text-primary" />
                    </div>
                    <span className="text-[13px] text-text font-medium">{section.name}</span>
                    <span className="ml-auto text-[10px] text-text-muted font-medium">Section {i + 1}</span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border-light flex justify-between shrink-0">
          <button
            onClick={() => { onClose(); onEdit(); }}
            className="flex items-center gap-1.5 px-4 py-2 text-[12px] font-medium text-text-secondary border border-border-light hover:border-primary/30 hover:bg-primary-xlight rounded-lg transition-colors cursor-pointer"
          >
            <Edit3 size={12} /> Edit Template
          </button>
          <button
            onClick={() => { addToast({ type: 'success', message: 'Template applied to new report' }); onClose(); }}
            className="flex items-center gap-1.5 px-5 py-2 bg-primary text-white rounded-xl text-[12px] font-semibold hover:bg-primary-hover transition-colors cursor-pointer"
          >
            <Sparkles size={12} /> Use This Template
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Apply Template Dropdown ───
function ApplyTemplateDropdown({ onSelect, onClose }: { onSelect: (template: typeof REPORT_TEMPLATES[0]) => void; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -5, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -5, scale: 0.97 }}
      className="absolute right-0 top-full mt-1 w-[280px] bg-white rounded-xl shadow-xl border border-border-light z-50 overflow-hidden"
    >
      <div className="px-3 py-2 border-b border-border-light">
        <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Select Template</span>
      </div>
      <div className="max-h-[260px] overflow-y-auto p-1.5">
        {REPORT_TEMPLATES.map(rt => {
          const Icon = ICON_MAP[rt.icon] || FileText;
          return (
            <button
              key={rt.id}
              onClick={() => { onSelect(rt); onClose(); }}
              className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-primary-xlight transition-colors cursor-pointer flex items-center gap-2.5"
            >
              <div className={`p-1.5 rounded-md ${CATEGORY_COLORS[rt.category] || 'text-gray-600 bg-gray-50'}`}>
                <Icon size={12} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-medium text-text truncate">{rt.name}</div>
                <div className="text-[10px] text-text-muted">{rt.category}</div>
              </div>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}

// ─── Template Editor Modal ───
function TemplateEditor({ template, onClose }: { template: typeof REPORT_TEMPLATES[0]; onClose: () => void }) {
  const { addToast } = useToast();
  const [brand, setBrand] = useState('Auditify');
  const [theme, setTheme] = useState('Purple & White');
  const [headerText, setHeaderText] = useState('Confidential — For Internal Use Only');
  const [footerText, setFooterText] = useState('Generated by Auditify Copilot');

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        role="dialog" aria-modal="true" aria-label="Edit Template"
        className="relative bg-white rounded-2xl shadow-2xl w-[600px] max-h-[80vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-border-light flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-primary/10 text-primary rounded-xl"><Settings size={16} /></div>
            <div>
              <h3 className="text-[15px] font-semibold text-text">Edit Template</h3>
              <p className="text-[11px] text-text-muted">{template.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"><X size={16} className="text-text-muted" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Brand */}
          <div>
            <label className="flex items-center gap-2 text-[12px] font-semibold text-text mb-2"><Image size={13} /> Brand Name</label>
            <input value={brand} onChange={e => setBrand(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-border-light text-[13px] focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10" />
          </div>

          {/* Theme */}
          <div>
            <label className="flex items-center gap-2 text-[12px] font-semibold text-text mb-2"><Palette size={13} /> Color Theme</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { name: 'Purple & White', colors: ['#6a12cd', '#f8f9fc'] },
                { name: 'Navy & Gold', colors: ['#1a2744', '#c5a55a'] },
                { name: 'Teal & Light', colors: ['#0d9488', '#f0fdfa'] },
                { name: 'Slate & Blue', colors: ['#334155', '#3b82f6'] },
              ].map(t => (
                <button key={t.name} onClick={() => setTheme(t.name)} className={`p-2.5 rounded-lg border-2 text-center transition-all cursor-pointer ${theme === t.name ? 'border-primary bg-primary/5' : 'border-border-light hover:border-primary/30'}`}>
                  <div className="flex gap-1 justify-center mb-1.5">
                    {t.colors.map((c, i) => <div key={i} className="w-5 h-5 rounded-full border border-white shadow-sm" style={{ background: c }} />)}
                  </div>
                  <span className="text-[9px] font-medium text-text">{t.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Header */}
          <div>
            <label className="flex items-center gap-2 text-[12px] font-semibold text-text mb-2"><Type size={13} /> Header Text</label>
            <input value={headerText} onChange={e => setHeaderText(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-border-light text-[13px] focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10" />
          </div>

          {/* Footer */}
          <div>
            <label className="flex items-center gap-2 text-[12px] font-semibold text-text mb-2"><Layout size={13} /> Footer Text</label>
            <input value={footerText} onChange={e => setFooterText(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-border-light text-[13px] focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10" />
          </div>

          {/* Page Layout Preview */}
          <div>
            <label className="flex items-center gap-2 text-[12px] font-semibold text-text mb-2"><FileText size={13} /> Page Layout Preview</label>
            <div className="border border-border-light rounded-xl p-4 bg-surface-2">
              <div className="bg-white rounded-lg shadow-sm border border-border-light overflow-hidden" style={{ aspectRatio: '8.5/5' }}>
                {/* Mini page preview */}
                <div className="h-6 bg-primary/5 flex items-center justify-between px-3">
                  <span className="text-[7px] font-bold text-primary">{brand}</span>
                  <span className="text-[6px] text-text-muted">{headerText}</span>
                </div>
                <div className="p-3 flex-1">
                  <div className="h-2 w-20 bg-text-muted/15 rounded mb-1" />
                  <div className="h-1.5 w-full bg-text-muted/10 rounded mb-0.5" />
                  <div className="h-1.5 w-3/4 bg-text-muted/10 rounded mb-2" />
                  <div className="grid grid-cols-4 gap-1">
                    {[1,2,3,4].map(i => <div key={i} className="h-4 bg-primary/5 rounded" />)}
                  </div>
                </div>
                <div className="h-4 bg-surface-2 flex items-center justify-center">
                  <span className="text-[5px] text-text-muted">{footerText}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border-light flex justify-end gap-2 shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-[12px] font-medium text-text-secondary hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">Cancel</button>
          <button onClick={() => { addToast({ type: 'success', message: 'Template saved!' }); onClose(); }} className="px-5 py-2 bg-primary text-white rounded-xl text-[12px] font-semibold hover:bg-primary-hover transition-colors cursor-pointer">Save Template</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Query Card Component ───
function QueryCard({ query, index }: { query: { id: string; status: string; risk: string; severity: string; title: string; addedBy: string; kpis: { label: string; value: string; color: string }[]; summary: string; findings: string[]; observations: string[]; chartData: number[] }; index: number }) {
  const [expanded, setExpanded] = useState(index === 0);
  const accentColor = query.severity === 'Critical' ? '#dc2626' : '#ea580c';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="rounded-2xl border border-border-light shadow-sm overflow-hidden mb-4 bg-white"
    >
      {/* Accent top bar */}
      <div className="h-1" style={{ background: `linear-gradient(90deg, ${accentColor}, ${accentColor}40)` }} />

      {/* Header — always visible */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold text-white px-2.5 py-1 rounded-md" style={{ background: accentColor }}>{query.id}</span>
            <span className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${query.status === 'Completed' ? 'text-green-700 bg-green-50' : 'text-amber-700 bg-amber-50'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${query.status === 'Completed' ? 'bg-green-500' : 'bg-amber-500'}`} /> {query.status}
            </span>
            <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full flex items-center gap-1"><TrendingUp size={9} /> {query.risk}</span>
            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${query.severity === 'Critical' ? 'text-red-700 bg-red-50' : 'text-orange-700 bg-orange-50'}`}>{query.severity}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-text-muted shrink-0">
            <div className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[8px] font-bold flex items-center justify-center">{query.addedBy.split(' ').map(n => n[0]).join('')}</div>
            {query.addedBy}
          </div>
        </div>

        <h3 className="text-[14px] font-semibold text-text leading-snug mb-4">{query.title}</h3>

        {/* KPIs + Mini Chart Row */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1 grid grid-cols-4 gap-2">
            {query.kpis.map(kpi => (
              <div key={kpi.label} className="glass-card rounded-xl p-3">
                <div className={`text-xl font-bold ${kpi.color}`}>{kpi.value}</div>
                <div className="text-[9px] text-text-muted uppercase tracking-wider mt-0.5 leading-tight">{kpi.label}</div>
              </div>
            ))}
          </div>
          {/* Mini sparkline chart */}
          <div className="w-28 glass-card rounded-xl p-3 flex flex-col items-center justify-center">
            <svg width="80" height="32" viewBox="0 0 80 32">
              <polyline
                points={query.chartData.map((v, i) => `${i * (80 / (query.chartData.length - 1))},${32 - v * 0.3}`).join(' ')}
                fill="none" stroke={accentColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              />
              <polyline
                points={`0,32 ${query.chartData.map((v, i) => `${i * (80 / (query.chartData.length - 1))},${32 - v * 0.3}`).join(' ')} 80,32`}
                fill={`${accentColor}15`} stroke="none"
              />
            </svg>
            <span className="text-[8px] text-text-muted mt-1">Trend</span>
          </div>
        </div>

        {/* Summary */}
        <p className="text-[12.5px] text-text-secondary leading-relaxed">{query.summary}</p>

        {/* Expand toggle */}
        <button onClick={() => setExpanded(p => !p)} className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-primary hover:text-primary-hover cursor-pointer transition-colors">
          <ChevronDown size={13} className={`transition-transform ${expanded ? '' : '-rotate-90'}`} />
          {expanded ? 'Hide details' : 'Show findings & observations'}
        </button>
      </div>

      {/* Expandable details */}
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="px-5 pb-5 border-t border-border-light pt-4">
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <h4 className="text-[13px] font-bold text-text mb-2.5 flex items-center gap-1.5">
                    <AlertTriangle size={12} style={{ color: accentColor }} /> Findings
                  </h4>
                  <ul className="space-y-2">
                    {query.findings.map((f, i) => (
                      <li key={i} className="flex gap-2 text-[12px] text-text leading-relaxed">
                        <span className="text-text-muted shrink-0 font-mono text-[10px] mt-0.5">{String(i + 1).padStart(2, '0')}</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-[13px] font-bold text-text mb-2.5 flex items-center gap-1.5">
                    <Eye size={12} className="text-blue-500" /> Observations
                  </h4>
                  <ul className="space-y-2">
                    {query.observations.map((o, i) => (
                      <li key={i} className="flex gap-2 text-[12px] text-text leading-relaxed">
                        <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: accentColor + '60' }} />
                        {o}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Report View (with multiple queries) ───
function ReportView({ report, onBack, onShare }: {
  report: typeof GENERATED_REPORTS[0];
  onBack: () => void;
  onShare?: () => void;
}) {
  const { addToast } = useToast();
  const [showApplyTemplate, setShowApplyTemplate] = useState(false);
  const [appliedTemplate, setAppliedTemplate] = useState<typeof REPORT_TEMPLATES[0] | null>(null);
  const [applyingTemplate, setApplyingTemplate] = useState(false);

  const handleApplyTemplate = (template: typeof REPORT_TEMPLATES[0]) => {
    setApplyingTemplate(true);
    setTimeout(() => {
      setAppliedTemplate(template);
      setApplyingTemplate(false);
      addToast({ type: 'success', message: `Template "${template.name}" applied!` });
    }, 800);
  };

  const coverGradient = appliedTemplate
    ? CATEGORY_GRADIENTS[appliedTemplate.category] || 'from-[#1a0a2e] to-[#2d1550]'
    : 'from-[#1a0a2e] to-[#2d1550]';

  const QUERIES = [
    {
      id: 'Q01', status: 'In Review', risk: 'Financial Risk', severity: 'High',
      title: 'Detects duplicate invoice entries by vendor, date, and amount to streamline audit review and assign case identifiers.',
      addedBy: report.generatedBy,
      kpis: [
        { label: 'Flagged By AI', value: '140', color: 'text-primary' },
        { label: 'Manually Flagged', value: '1', color: 'text-orange-600' },
        { label: 'Resolved', value: '3', color: 'text-green-600' },
        { label: 'Pending', value: '136', color: 'text-red-600' },
      ],
      summary: 'The workflow identified 140 duplicate invoice entries across vendors, each grouped into case IDs. Duplicates represent ~95.6M in invoice value, with some cases exceeding 24.2M for a single vendor-date-amount combination.',
      findings: [
        '140 rows across 6 columns — 70 distinct duplicate cases (each with duplicate_count = 2).',
        'Total duplicated INVOICE_VALUE: 95,631,064.00 (mean: 683,079.00 per invoice).',
        'VENDOR_002: highest total at 32,676,258.0. VENDOR_006: most frequent with 16 records.',
        'Largest single case: CASE_000007 at 24,231,986.0 in duplicated value.',
        'Invoice values range from 62.79 to 12,115,993.00 — both small and very high-value invoices affected.',
      ],
      observations: [
        'Widespread duplicates across vendors — some with particularly high exposure in both frequency and value.',
        'Each case has exactly two matching invoices — auditors can quickly validate which to keep or reverse.',
        'Multi-million cases represent significant financial risk — should be prioritized in review workflows.',
      ],
      chartData: [40, 55, 80, 65, 90, 75, 95, 70, 85, 100],
    },
    {
      id: 'Q02', status: 'Completed', risk: 'Compliance Risk', severity: 'Critical',
      title: 'Identifies unauthorized vendor master changes without proper approval workflow in the last 90 days.',
      addedBy: 'AI Copilot',
      kpis: [
        { label: 'Changes Found', value: '47', color: 'text-primary' },
        { label: 'Unauthorized', value: '12', color: 'text-red-600' },
        { label: 'Verified', value: '35', color: 'text-green-600' },
        { label: 'Pending', value: '8', color: 'text-orange-600' },
      ],
      summary: 'Vendor master data analysis revealed 47 changes in 90 days. 12 lacked dual-approval — 8 involved bank account modifications (highest fraud risk category).',
      findings: [
        '12 changes made without approval records in the workflow system.',
        '8 changes involved bank account modifications — highest payment fraud risk.',
        'VENDOR_015: 4 unauthorized changes within a single week (potential control bypass).',
      ],
      observations: [
        'Bank account field changes represent critical payment fraud risk — requires immediate remediation.',
        'Control gaps may exist during off-hours processing windows.',
      ],
      chartData: [20, 35, 25, 50, 40, 30, 45, 60, 55, 47],
    },
  ];

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="h-full overflow-y-auto bg-surface-2">
      <div className="max-w-4xl mx-auto px-8 py-6">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={onBack} className="flex items-center gap-1.5 text-[13px] text-text-secondary hover:text-primary transition-colors cursor-pointer">
            <ArrowLeft size={14} /> Back to Reports
          </button>
          <div className="flex items-center gap-2 relative">
            <div className="relative">
              <button
                onClick={() => setShowApplyTemplate(p => !p)}
                className="flex items-center gap-1.5 px-3 py-2 border border-border rounded-lg text-[12px] font-medium text-text-secondary hover:bg-white hover:border-primary/30 transition-colors cursor-pointer bg-white"
              >
                <Layout size={13} /> Apply Template
              </button>
              <AnimatePresence>
                {showApplyTemplate && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowApplyTemplate(false)} />
                    <ApplyTemplateDropdown
                      onSelect={handleApplyTemplate}
                      onClose={() => setShowApplyTemplate(false)}
                    />
                  </>
                )}
              </AnimatePresence>
            </div>
            {onShare && (
              <button onClick={onShare} className="flex items-center gap-1.5 px-3 py-2 border border-border rounded-lg text-[12px] font-medium text-text-secondary hover:bg-white hover:border-primary/30 transition-colors cursor-pointer bg-white">
                <Share2 size={13} /> Share
              </button>
            )}
            <button onClick={() => addToast({ type: 'success', message: `Downloading ${report.name}.pdf...` })} className="flex items-center gap-1.5 px-3 py-2 border border-border rounded-lg text-[12px] font-medium text-text-secondary hover:bg-white hover:border-primary/30 transition-colors cursor-pointer bg-white">
              <Download size={13} /> Download PDF
            </button>
          </div>
        </div>

        {/* Applying Template Overlay */}
        <AnimatePresence>
          {applyingTemplate && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 flex items-center justify-center bg-white/60 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-3 px-6 py-4 glass-card-strong rounded-2xl shadow-lg"
              >
                <Loader2 size={20} className="text-primary animate-spin" />
                <span className="text-[14px] font-semibold text-text">Applying template...</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Report Cover — compact */}
        <div className={`relative rounded-2xl overflow-hidden mb-5 bg-gradient-to-br ${coverGradient} text-white shadow-lg`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/30 to-transparent" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-primary/20 to-transparent" />
          <div className="relative px-8 py-8 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                  <Shield size={18} className="text-white" />
                </div>
                <span className="text-[11px] font-bold bg-white/10 px-3 py-1 rounded-full uppercase tracking-wider">SOX Audit Report</span>
                {appliedTemplate && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-[10px] font-bold bg-white/20 px-2.5 py-1 rounded-full flex items-center gap-1"
                  >
                    <Layout size={9} /> Template: {appliedTemplate.name}
                  </motion.span>
                )}
              </div>
              <h1 className="text-2xl font-bold tracking-tight mb-1">P2P Review</h1>
              <p className="text-white/60 text-[13px]">{report.generatedBy} · {report.generatedAt} · {QUERIES.length} queries</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{QUERIES.length}</div>
              <div className="text-[10px] text-white/50 uppercase tracking-wider">Queries</div>
            </div>
          </div>
        </div>

        {/* Summary Stats Bar */}
        <div className="grid grid-cols-4 gap-3 mb-5">
          {[
            { label: 'Total Exceptions', value: '187', icon: AlertTriangle, color: 'text-orange-600 bg-orange-50' },
            { label: 'Resolved', value: '38', icon: CheckCircle2, color: 'text-green-600 bg-green-50' },
            { label: 'Critical Items', value: '12', icon: Shield, color: 'text-red-600 bg-red-50' },
            { label: 'Compliance Score', value: '78%', icon: TrendingUp, color: 'text-blue-600 bg-blue-50' },
          ].map(stat => (
            <div key={stat.label} className="glass-card rounded-xl p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.color}`}><stat.icon size={16} /></div>
              <div>
                <div className="text-xl font-bold text-text">{stat.value}</div>
                <div className="text-[10px] text-text-muted uppercase tracking-wider">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Query Cards */}
        {QUERIES.map((query, qi) => (
          <QueryCard key={query.id} query={query} index={qi} />
        ))}
      </div>
    </motion.div>
  );
}

// ─── Main Reports View ───
export default function ReportsView({ onOpenBuilder, onShare }: ReportsViewProps = {}) {
  const [activeTab, setActiveTab] = useState<'templates' | 'my-reports'>('my-reports');
  const [viewingReport, setViewingReport] = useState<typeof GENERATED_REPORTS[0] | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<typeof REPORT_TEMPLATES[0] | null>(null);
  const [previewingTemplate, setPreviewingTemplate] = useState<typeof REPORT_TEMPLATES[0] | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [reportAppliedTemplates, setReportAppliedTemplates] = useState<Record<string, typeof REPORT_TEMPLATES[0]>>({});
  const [applyingForReport, setApplyingForReport] = useState<string | null>(null);
  const [showApplyDropdown, setShowApplyDropdown] = useState<string | null>(null);
  const { addToast } = useToast();

  const handleApplyTemplateToReport = (reportId: string, template: typeof REPORT_TEMPLATES[0]) => {
    setApplyingForReport(reportId);
    setShowApplyDropdown(null);
    setTimeout(() => {
      setReportAppliedTemplates(prev => ({ ...prev, [reportId]: template }));
      setApplyingForReport(null);
      addToast({ type: 'success', message: `Template "${template.name}" applied!` });
    }, 800);
  };

  if (viewingReport) {
    return (
      <ReportView
        report={viewingReport}
        onBack={() => setViewingReport(null)}
        onShare={onShare ? () => onShare(viewingReport.id) : undefined}
      />
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-white bg-mesh-gradient relative">
      <Orb hoverIntensity={0.09} rotateOnHover hue={275} opacity={0.08} />
      <div className="max-w-5xl mx-auto px-8 py-8 relative">
        {/* Header */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-text tracking-tight">Reports</h1>
            <p className="text-sm text-text-secondary mt-1">Generate, manage, and export compliance reports</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 px-4 py-2 border border-border-light hover:border-primary/30 text-text-secondary hover:text-primary bg-white rounded-lg text-[13px] font-medium transition-colors cursor-pointer"
            >
              <Upload size={14} /> Upload Template
            </button>
            <button onClick={onOpenBuilder} className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-[13px] font-semibold transition-colors cursor-pointer">
              <Sparkles size={14} /> Generate with AI
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-border mb-6">
          <button
            onClick={() => setActiveTab('my-reports')}
            className={`px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors cursor-pointer ${activeTab === 'my-reports' ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text-secondary'}`}
          >
            <span className="flex items-center gap-2">
              <BookOpen size={14} />
              My Reports
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === 'my-reports' ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-500'}`}>{GENERATED_REPORTS.length}</span>
            </span>
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors cursor-pointer ${activeTab === 'templates' ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text-secondary'}`}
          >
            <span className="flex items-center gap-2">
              <FileText size={14} />
              Templates
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === 'templates' ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-500'}`}>{REPORT_TEMPLATES.length}</span>
            </span>
          </button>
        </div>

        {/* My Reports */}
        {activeTab === 'my-reports' && (
          <SmartTable
            data={GENERATED_REPORTS as unknown as Record<string, unknown>[]}
            keyField="id"
            searchPlaceholder="Search reports..."
            searchKeys={['name', 'generatedBy']}
            paginated={false}
            columns={[
              { key: 'name', label: 'Report', render: (item) => (
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => {
                  const report = GENERATED_REPORTS.find(r => r.id === item.id);
                  if (report) setViewingReport(report);
                }}>
                  <FileText size={14} className="text-primary" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-text font-medium hover:text-primary transition-colors">{String(item.name)}</span>
                      {reportAppliedTemplates[String(item.id)] && (
                        <span className="text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                          <Layout size={8} /> {reportAppliedTemplates[String(item.id)].name}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-text-muted">2 queries · {String(item.pages)} pages</div>
                  </div>
                </div>
              )},
              { key: 'generatedBy', label: 'Author', width: '130px', render: (item) => (
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[8px] font-bold flex items-center justify-center">
                    {String(item.generatedBy).split(' ').map(n => n[0]).join('')}
                  </div>
                  <span className="text-text-secondary text-[12px]">{String(item.generatedBy)}</span>
                </div>
              )},
              { key: 'generatedAt', label: 'Date', width: '120px', render: (item) => (
                <span className="text-text-muted text-[12px]">{String(item.generatedAt)}</span>
              )},
              { key: 'status', label: 'Status', width: '100px', render: (item) => <StatusBadge status={String(item.status)} /> },
              { key: 'actions', label: '', width: '160px', sortable: false, align: 'right', render: (item) => (
                <div className="flex items-center justify-end gap-1 relative">
                  <div className="relative">
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowApplyDropdown(showApplyDropdown === String(item.id) ? null : String(item.id)); }}
                      className={`p-1.5 text-text-muted hover:text-primary hover:bg-primary-xlight rounded-md transition-colors cursor-pointer ${applyingForReport === String(item.id) ? 'pointer-events-none' : ''}`}
                      title="Apply Template"
                    >
                      {applyingForReport === String(item.id) ? (
                        <Loader2 size={14} className="animate-spin text-primary" />
                      ) : (
                        <Layout size={14} />
                      )}
                    </button>
                    <AnimatePresence>
                      {showApplyDropdown === String(item.id) && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setShowApplyDropdown(null)} />
                          <ApplyTemplateDropdown
                            onSelect={(template) => handleApplyTemplateToReport(String(item.id), template)}
                            onClose={() => setShowApplyDropdown(null)}
                          />
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                  <button onClick={() => { const r = GENERATED_REPORTS.find(rr => rr.id === item.id); if (r) setViewingReport(r); }} className="p-1.5 text-text-muted hover:text-primary hover:bg-primary-xlight rounded-md transition-colors cursor-pointer" title="View"><Eye size={14} /></button>
                  <button onClick={() => addToast({ type: 'success', message: `Downloading ${item.name}...` })} className="p-1.5 text-text-muted hover:text-primary hover:bg-primary-xlight rounded-md transition-colors cursor-pointer" title="Download"><Download size={14} /></button>
                  {onShare && <button onClick={() => onShare(String(item.id))} className="p-1.5 text-text-muted hover:text-primary hover:bg-primary-xlight rounded-md transition-colors cursor-pointer" title="Share"><Share2 size={14} /></button>}
                </div>
              )},
            ]}
          />
        )}

        {/* Templates Grid */}
        {activeTab === 'templates' && (
          <div className="grid grid-cols-3 gap-4">
            {REPORT_TEMPLATES.map((rt, i) => {
              const Icon = ICON_MAP[rt.icon] || FileText;
              const color = CATEGORY_COLORS[rt.category] || 'text-gray-600 bg-gray-50';
              return (
                <motion.div
                  key={rt.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card rounded-2xl p-5 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20 active:scale-[0.98] transition-all duration-300 group cursor-pointer"
                  onClick={() => setPreviewingTemplate(rt)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2.5 rounded-xl ${color} group-hover:scale-110 transition-transform duration-300`}><Icon size={18} /></div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditingTemplate(rt); }}
                      className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-text-muted hover:text-primary hover:bg-primary-xlight rounded-lg transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                    >
                      <Edit3 size={10} /> Edit
                    </button>
                  </div>
                  <h3 className="text-[14px] font-semibold text-text mb-1 group-hover:text-primary transition-colors">{rt.name}</h3>
                  <p className="text-[12px] text-text-secondary leading-relaxed mb-3">{rt.desc}</p>
                  <div className="flex items-center justify-between pt-3 border-t border-border-light">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${color.split(' ')[0]}`}>{rt.category}</span>
                    <div className="flex gap-1">
                      <button onClick={(e) => { e.stopPropagation(); setEditingTemplate(rt); }} className="text-[10px] text-text-muted hover:text-primary font-medium flex items-center gap-0.5 cursor-pointer">
                        <Settings size={9} /> Customize
                      </button>
                      <span className="text-border-light mx-1">|</span>
                      <button onClick={(e) => { e.stopPropagation(); addToast({ type: 'success', message: 'Generating PDF download...' }); }} className="text-[10px] text-primary font-semibold flex items-center gap-0.5 cursor-pointer">
                        Generate <ArrowRight size={9} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Template Editor Modal */}
      <AnimatePresence>
        {editingTemplate && (
          <TemplateEditor template={editingTemplate} onClose={() => setEditingTemplate(null)} />
        )}
      </AnimatePresence>

      {/* Template Preview Modal */}
      <AnimatePresence>
        {previewingTemplate && (
          <TemplatePreviewModal
            template={previewingTemplate}
            onClose={() => setPreviewingTemplate(null)}
            onEdit={() => { setEditingTemplate(previewingTemplate); setPreviewingTemplate(null); }}
          />
        )}
      </AnimatePresence>

      {/* Upload Template Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <UploadTemplateModal onClose={() => setShowUploadModal(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
