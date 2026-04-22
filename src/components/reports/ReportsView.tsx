import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText, Shield, AlertTriangle, CheckCircle2, BarChart3,
  TrendingUp, Download, Share2, ArrowRight, ArrowLeft, ChevronDown,
  Sparkles, Eye, Settings, Palette, Type,
  Image, Layout, X, Edit3, BookOpen, Upload, Lightbulb, Loader2, Trash2
} from 'lucide-react';
import { REPORT_TEMPLATES, GENERATED_REPORTS, SHARED_REPORTS } from '../../data/mockData';
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
  Controls: 'text-purple-600 bg-purple-50',
  Analytics: 'text-violet-600 bg-violet-50',
  Audit: 'text-red-600 bg-red-50',
  Executive: 'text-indigo-600 bg-indigo-50',
};

const CATEGORY_GRADIENTS: Record<string, string> = {
  Compliance: 'from-[#e8daf5] to-[#d4c4eb]',
  Risk: 'from-[#fce7d6] to-[#e8daf5]',
  Controls: 'from-[#e8daf5] to-[#ddd0f0]',
  Analytics: 'from-[#ede4f7] to-[#e0d0f0]',
  Audit: 'from-[#fce4e4] to-[#e8daf5]',
  Executive: 'from-[#ddd0f0] to-[#e0d8f5]',
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
                  <p className="text-[13px] font-semibold text-primary">Template converted!</p>
                  <p className="text-[11px] text-primary/70">6 sections detected</p>
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

// ─── Template Layout Component — renders actual report layouts per template ───
function TemplateLayout({ templateId, template, report }: { templateId: string; template: typeof REPORT_TEMPLATES[0]; report: typeof GENERATED_REPORTS[0] }) {
  const sections = template.sections || [];

  // SOX Compliance — Excel-style control testing table
  if (templateId === 'rt-001') {
    const controls = [
      { id: 'CTR-001', name: 'Invoice Approval Workflow', process: 'P2P', type: 'Preventive', freq: 'Per Transaction', owner: 'Tushar Goel', result: 'Effective', exceptions: 0 },
      { id: 'CTR-002', name: 'Three-Way PO Match', process: 'P2P', type: 'Detective', freq: 'Daily', owner: 'AP Module', result: 'Effective', exceptions: 2 },
      { id: 'CTR-003', name: 'Vendor Master Change Approval', process: 'P2P', type: 'Preventive', freq: 'Per Change', owner: 'Deepak Bansal', result: 'Deficient', exceptions: 7 },
      { id: 'CTR-004', name: 'Duplicate Invoice Detection', process: 'P2P', type: 'Detective', freq: 'Real-time', owner: 'AI Workflow', result: 'Effective', exceptions: 0 },
      { id: 'CTR-005', name: 'Payment Batch Authorization', process: 'P2P', type: 'Preventive', freq: 'Per Batch', owner: 'Tushar Goel', result: 'Effective', exceptions: 1 },
      { id: 'CTR-006', name: 'Revenue Recognition Cutoff', process: 'O2C', type: 'Detective', freq: 'Monthly', owner: 'Neha Joshi', result: 'Pending', exceptions: 0 },
      { id: 'CTR-007', name: 'GL Reconciliation Review', process: 'R2R', type: 'Detective', freq: 'Monthly', owner: 'Karan Mehta', result: 'Effective', exceptions: 3 },
      { id: 'CTR-008', name: 'Journal Entry Approval', process: 'R2R', type: 'Preventive', freq: 'Per Entry', owner: 'Sneha Desai', result: 'Deficient', exceptions: 7 },
      { id: 'CTR-009', name: 'SOD Rule Enforcement', process: 'ALL', type: 'Preventive', freq: 'Continuous', owner: 'GRC Module', result: 'Effective', exceptions: 4 },
      { id: 'CTR-010', name: 'Intercompany Elimination', process: 'R2R', type: 'Detective', freq: 'Quarterly', owner: 'Karan Mehta', result: 'Effective', exceptions: 0 },
    ];
    const resultColor = (r: string) => r === 'Effective' ? 'text-emerald-700 bg-emerald-50' : r === 'Deficient' ? 'text-red-700 bg-red-50' : 'text-amber-700 bg-amber-50';
    return (
      <div className="space-y-5">
        {/* Section nav */}
        <div className="flex gap-2 flex-wrap">
          {sections.map((s, i) => (
            <div key={s.name} className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg border border-border-light text-[11px] font-medium text-text-secondary shadow-sm">
              <span className="text-[9px] font-bold text-primary/50">{i + 1}</span> {s.name}
            </div>
          ))}
        </div>
        {/* Executive Summary */}
        <div className="bg-white rounded-xl border border-border-light p-5">
          <h3 className="text-[13px] font-bold text-text mb-2 flex items-center gap-2"><FileText size={14} className="text-primary" /> Executive Summary</h3>
          <p className="text-[12px] text-text-secondary leading-relaxed">FY26 Q1 SOX compliance audit covered 87 controls across 4 business processes (P2P, O2C, R2R, S2C). 54 controls tested to date with 89% effectiveness rate. 2 material weaknesses identified requiring remediation before March 31 deadline. Overall compliance score: 94.2% — improved from 91.8% prior quarter.</p>
        </div>
        {/* Control Testing Results — Excel-style */}
        <div className="bg-white rounded-xl border border-border-light overflow-hidden">
          <div className="px-5 py-3 border-b border-border-light flex items-center justify-between">
            <h3 className="text-[13px] font-bold text-text flex items-center gap-2"><CheckCircle2 size={14} className="text-primary" /> Control Testing Results</h3>
            <span className="text-[10px] text-text-muted">{controls.length} controls · {report.generatedAt}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="bg-gray-50 border-b border-border-light">
                  {['Control ID', 'Control Name', 'Process', 'Type', 'Frequency', 'Owner', 'Result', 'Exceptions'].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left font-semibold text-text-muted uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {controls.map((c, i) => (
                  <tr key={c.id} className={`border-b border-border-light/60 hover:bg-primary/[0.015] transition-colors ${i % 2 === 0 ? '' : 'bg-gray-50/40'}`}>
                    <td className="px-4 py-2.5 font-mono font-semibold text-primary">{c.id}</td>
                    <td className="px-4 py-2.5 font-medium text-text">{c.name}</td>
                    <td className="px-4 py-2.5 text-text-secondary">{c.process}</td>
                    <td className="px-4 py-2.5"><span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${c.type === 'Preventive' ? 'text-blue-700 bg-blue-50' : 'text-violet-700 bg-violet-50'}`}>{c.type}</span></td>
                    <td className="px-4 py-2.5 text-text-secondary">{c.freq}</td>
                    <td className="px-4 py-2.5 text-text-secondary">{c.owner}</td>
                    <td className="px-4 py-2.5"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${resultColor(c.result)}`}>{c.result}</span></td>
                    <td className="px-4 py-2.5 text-center font-semibold">{c.exceptions > 0 ? <span className="text-red-600">{c.exceptions}</span> : <span className="text-text-muted">—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-border-light bg-gray-50/50 flex items-center justify-between text-[10px] text-text-muted">
            <span>Showing {controls.length} of 54 tested controls</span>
            <span>8 Effective · 2 Deficient · 0 Pending</span>
          </div>
        </div>
        {/* Deficiency Detail */}
        <div className="bg-white rounded-xl border border-border-light p-5">
          <h3 className="text-[13px] font-bold text-text mb-3 flex items-center gap-2"><AlertTriangle size={14} className="text-red-500" /> Deficiency Analysis</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { id: 'DEF-001', control: 'CTR-003', title: 'Vendor Master Change — Missing Dual Approval', severity: 'Significant', status: 'In Remediation', due: 'Mar 31, 2026', owner: 'Deepak Bansal', desc: '7 vendor master changes processed without dual-approval. Includes 3 bank account modifications.' },
              { id: 'DEF-002', control: 'CTR-008', title: 'Journal Entry Override — Approval Bypass', severity: 'Material Weakness', status: 'Evidence Submitted', due: 'Mar 31, 2026', owner: 'Rohan Patel', desc: '7 journal entries posted bypassing approval workflow. Total value: 12.4L. Root cause: system configuration gap.' },
            ].map(d => (
              <div key={d.id} className="rounded-xl border border-border-light p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold text-white px-2 py-0.5 rounded-md bg-red-500">{d.id}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${d.severity === 'Material Weakness' ? 'text-red-700 bg-red-50' : 'text-orange-700 bg-orange-50'}`}>{d.severity}</span>
                  <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">{d.status}</span>
                </div>
                <h4 className="text-[12px] font-semibold text-text mb-1">{d.title}</h4>
                <p className="text-[11px] text-text-secondary leading-relaxed mb-2">{d.desc}</p>
                <div className="flex items-center gap-3 text-[10px] text-text-muted">
                  <span>Control: <span className="font-mono font-semibold text-primary">{d.control}</span></span>
                  <span>Due: <span className="font-semibold">{d.due}</span></span>
                  <span>Owner: {d.owner}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Risk Assessment — Risk matrix + risk register
  if (templateId === 'rt-002') {
    const risks = [
      { id: 'RSK-001', name: 'Unauthorized vendor payments', process: 'P2P', likelihood: 3, impact: 4, controls: 3, status: 'Mitigated' },
      { id: 'RSK-002', name: 'Revenue recognition errors', process: 'O2C', likelihood: 2, impact: 4, controls: 2, status: 'Mitigated' },
      { id: 'RSK-003', name: 'Duplicate payments', process: 'P2P', likelihood: 4, impact: 3, controls: 3, status: 'Partial' },
      { id: 'RSK-004', name: 'Fictitious vendor registration', process: 'P2P', likelihood: 3, impact: 5, controls: 0, status: 'Uncontrolled' },
      { id: 'RSK-005', name: 'GL misstatement', process: 'R2R', likelihood: 2, impact: 5, controls: 4, status: 'Mitigated' },
      { id: 'RSK-006', name: 'Inventory discrepancy', process: 'O2C', likelihood: 3, impact: 2, controls: 2, status: 'Mitigated' },
      { id: 'RSK-007', name: 'Malware via vendor portals', process: 'P2P', likelihood: 2, impact: 5, controls: 0, status: 'Uncontrolled' },
    ];
    const riskColor = (l: number, i: number) => {
      const score = l * i;
      if (score >= 12) return 'bg-red-500';
      if (score >= 8) return 'bg-orange-400';
      if (score >= 4) return 'bg-amber-300';
      return 'bg-emerald-300';
    };
    return (
      <div className="space-y-5">
        <div className="flex gap-2 flex-wrap">
          {sections.map((s, i) => (
            <div key={s.name} className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg border border-border-light text-[11px] font-medium text-text-secondary shadow-sm">
              <span className="text-[9px] font-bold text-primary/50">{i + 1}</span> {s.name}
            </div>
          ))}
        </div>
        {/* Risk Heatmap */}
        <div className="bg-white rounded-xl border border-border-light p-5">
          <h3 className="text-[13px] font-bold text-text mb-4 flex items-center gap-2"><Shield size={14} className="text-primary" /> Risk Matrix</h3>
          <div className="flex gap-6">
            <div className="flex-1">
              <div className="text-[9px] font-semibold text-text-muted uppercase tracking-wider mb-2 text-center">Impact →</div>
              <div className="grid grid-cols-5 gap-1">
                {[5,4,3,2,1].map(likelihood => (
                  [1,2,3,4,5].map(impact => {
                    const risksInCell = risks.filter(r => r.likelihood === likelihood && r.impact === impact);
                    return (
                      <div key={`${likelihood}-${impact}`} className={`aspect-square rounded-lg flex items-center justify-center text-[9px] font-bold text-white ${riskColor(likelihood, impact)} ${risksInCell.length > 0 ? 'ring-2 ring-white shadow-md' : 'opacity-30'}`}>
                        {risksInCell.length > 0 ? risksInCell.map(r => r.id.split('-')[1]).join(',') : ''}
                      </div>
                    );
                  })
                ))}
              </div>
              <div className="text-[9px] font-semibold text-text-muted uppercase tracking-wider mt-1 -rotate-0">↑ Likelihood</div>
            </div>
            <div className="w-48">
              <div className="text-[10px] font-semibold text-text mb-2">Legend</div>
              <div className="space-y-1.5">
                {[{ c: 'bg-red-500', l: 'Critical (12-25)' }, { c: 'bg-orange-400', l: 'High (8-11)' }, { c: 'bg-amber-300', l: 'Medium (4-7)' }, { c: 'bg-emerald-300', l: 'Low (1-3)' }].map(item => (
                  <div key={item.l} className="flex items-center gap-2 text-[10px] text-text-secondary"><div className={`w-3 h-3 rounded ${item.c}`} /> {item.l}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
        {/* Risk Register */}
        <div className="bg-white rounded-xl border border-border-light overflow-hidden">
          <div className="px-5 py-3 border-b border-border-light">
            <h3 className="text-[13px] font-bold text-text flex items-center gap-2"><AlertTriangle size={14} className="text-orange-500" /> Risk Register</h3>
          </div>
          <table className="w-full text-[11px]">
            <thead>
              <tr className="bg-gray-50 border-b border-border-light">
                {['Risk ID', 'Description', 'Process', 'L', 'I', 'Score', 'Controls', 'Status'].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left font-semibold text-text-muted uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {risks.map((r, i) => (
                <tr key={r.id} className={`border-b border-border-light/60 hover:bg-primary/[0.015] transition-colors ${i % 2 === 0 ? '' : 'bg-gray-50/40'}`}>
                  <td className="px-4 py-2.5 font-mono font-semibold text-primary">{r.id}</td>
                  <td className="px-4 py-2.5 font-medium text-text">{r.name}</td>
                  <td className="px-4 py-2.5 text-text-secondary">{r.process}</td>
                  <td className="px-4 py-2.5 text-center">{r.likelihood}</td>
                  <td className="px-4 py-2.5 text-center">{r.impact}</td>
                  <td className="px-4 py-2.5 text-center"><span className={`inline-flex w-6 h-6 items-center justify-center rounded-md text-[10px] font-bold text-white ${riskColor(r.likelihood, r.impact)}`}>{r.likelihood * r.impact}</span></td>
                  <td className="px-4 py-2.5 text-center font-semibold">{r.controls}</td>
                  <td className="px-4 py-2.5"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${r.status === 'Mitigated' ? 'text-emerald-700 bg-emerald-50' : r.status === 'Partial' ? 'text-amber-700 bg-amber-50' : 'text-red-700 bg-red-50'}`}>{r.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Control Effectiveness — Scorecard layout
  if (templateId === 'rt-003') {
    const processes = [
      { name: 'P2P', total: 24, tested: 17, effective: 15, deficient: 2, rate: 88 },
      { name: 'O2C', total: 18, tested: 8, effective: 7, deficient: 1, rate: 88 },
      { name: 'R2R', total: 31, tested: 26, effective: 23, deficient: 3, rate: 88 },
      { name: 'S2C', total: 14, tested: 3, effective: 3, deficient: 0, rate: 100 },
    ];
    return (
      <div className="space-y-5">
        <div className="flex gap-2 flex-wrap">
          {sections.map((s, i) => (
            <div key={s.name} className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg border border-border-light text-[11px] font-medium text-text-secondary shadow-sm">
              <span className="text-[9px] font-bold text-primary/50">{i + 1}</span> {s.name}
            </div>
          ))}
        </div>
        {/* Effectiveness Scorecards */}
        <div className="grid grid-cols-4 gap-3">
          {processes.map(p => (
            <div key={p.name} className="bg-white rounded-xl border border-border-light p-4 hover:shadow-md hover:shadow-primary/5 transition-all">
              <div className="text-[11px] font-semibold text-text-muted mb-2">{p.name}</div>
              <div className="text-[28px] font-bold text-text leading-none">{p.rate}%</div>
              <div className="text-[10px] text-text-muted mt-1 mb-3">Effectiveness Rate</div>
              {/* Progress bar */}
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
                <motion.div initial={{ width: 0 }} animate={{ width: `${(p.tested / p.total) * 100}%` }} transition={{ delay: 0.3, duration: 0.6 }} className="h-full rounded-full bg-primary" />
              </div>
              <div className="flex justify-between text-[9px] text-text-muted">
                <span>{p.tested}/{p.total} tested</span>
                <span>{p.deficient} deficient</span>
              </div>
            </div>
          ))}
        </div>
        {/* Gap Analysis Table */}
        <div className="bg-white rounded-xl border border-border-light overflow-hidden">
          <div className="px-5 py-3 border-b border-border-light">
            <h3 className="text-[13px] font-bold text-text flex items-center gap-2"><AlertTriangle size={14} className="text-orange-500" /> Gap Analysis — Untested Controls</h3>
          </div>
          <table className="w-full text-[11px]">
            <thead>
              <tr className="bg-gray-50 border-b border-border-light">
                {['Process', 'Untested', 'Deadline', 'Priority', 'Assigned To'].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left font-semibold text-text-muted uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { process: 'P2P', untested: 7, deadline: 'Mar 31', priority: 'High', assignee: 'Tushar Goel' },
                { process: 'O2C', untested: 10, deadline: 'Mar 31', priority: 'High', assignee: 'Neha Joshi' },
                { process: 'R2R', untested: 5, deadline: 'Mar 31', priority: 'Medium', assignee: 'Karan Mehta' },
                { process: 'S2C', untested: 11, deadline: 'Jun 30', priority: 'Medium', assignee: 'Rohan Patel' },
              ].map((g, i) => (
                <tr key={g.process} className={`border-b border-border-light/60 hover:bg-primary/[0.015] transition-colors ${i % 2 === 0 ? '' : 'bg-gray-50/40'}`}>
                  <td className="px-4 py-2.5 font-semibold text-text">{g.process}</td>
                  <td className="px-4 py-2.5 font-bold text-red-600">{g.untested}</td>
                  <td className="px-4 py-2.5 text-text-secondary">{g.deadline}</td>
                  <td className="px-4 py-2.5"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${g.priority === 'High' ? 'text-red-700 bg-red-50' : 'text-amber-700 bg-amber-50'}`}>{g.priority}</span></td>
                  <td className="px-4 py-2.5 text-text-secondary">{g.assignee}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Improvement Plan */}
        <div className="bg-white rounded-xl border border-border-light p-5">
          <h3 className="text-[13px] font-bold text-text mb-3 flex items-center gap-2"><TrendingUp size={14} className="text-primary" /> Improvement Plan</h3>
          <div className="space-y-2">
            {['Automate 5 manual detective controls in P2P — target: 98% effectiveness', 'Accelerate S2C control testing — hire 1 contractor for April-June sprint', 'Deploy AI anomaly detection on R2R reconciliation — reduce deficiency rate by 50%', 'Implement continuous monitoring for all preventive controls by Q2'].map((item, i) => (
              <div key={i} className="flex items-start gap-2.5 px-3 py-2 bg-primary/[0.02] rounded-lg">
                <span className="text-[9px] font-bold text-primary bg-primary/10 w-5 h-5 rounded-md flex items-center justify-center shrink-0">{i + 1}</span>
                <span className="text-[11px] text-text-secondary leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Workflow Analytics — Dashboard-style with charts
  if (templateId === 'rt-004') {
    const workflows = [
      { name: 'Duplicate Invoice Detector', runs: 45, accuracy: 96, savings: '2.4L', trend: [82, 88, 91, 94, 96] },
      { name: 'Three-Way PO Match', runs: 28, accuracy: 87, savings: '1.1L', trend: [78, 80, 83, 85, 87] },
      { name: 'Vendor Master Monitor', runs: 24, accuracy: 98, savings: '0.8L', trend: [92, 94, 95, 97, 98] },
      { name: 'SOD Violation Detector', runs: 18, accuracy: 94, savings: '0.5L', trend: [88, 90, 91, 93, 94] },
    ];
    return (
      <div className="space-y-5">
        <div className="flex gap-2 flex-wrap">
          {sections.map((s, i) => (
            <div key={s.name} className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg border border-border-light text-[11px] font-medium text-text-secondary shadow-sm">
              <span className="text-[9px] font-bold text-primary/50">{i + 1}</span> {s.name}
            </div>
          ))}
        </div>
        {/* Workflow Performance Cards */}
        <div className="grid grid-cols-2 gap-3">
          {workflows.map(w => (
            <div key={w.name} className="bg-white rounded-xl border border-border-light p-4 hover:shadow-md hover:shadow-primary/5 transition-all">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-[12px] font-semibold text-text">{w.name}</h4>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">{w.accuracy}% accuracy</span>
              </div>
              <div className="flex items-end gap-4 mb-3">
                <div>
                  <div className="text-[20px] font-bold text-text">{w.runs}</div>
                  <div className="text-[9px] text-text-muted uppercase">Runs</div>
                </div>
                <div>
                  <div className="text-[20px] font-bold text-emerald-600">{w.savings}</div>
                  <div className="text-[9px] text-text-muted uppercase">Saved</div>
                </div>
                <div className="flex-1">
                  <svg width="100%" height="28" viewBox="0 0 100 28" preserveAspectRatio="none">
                    <polyline points={w.trend.map((v, i) => `${i * 25},${28 - ((v - 75) / 25) * 28}`).join(' ')} fill="none" stroke="#6a12cd" strokeWidth="1.5" strokeLinecap="round" />
                    <polyline points={`0,28 ${w.trend.map((v, i) => `${i * 25},${28 - ((v - 75) / 25) * 28}`).join(' ')} 100,28`} fill="rgba(106,18,205,0.06)" stroke="none" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Exception Breakdown */}
        <div className="bg-white rounded-xl border border-border-light overflow-hidden">
          <div className="px-5 py-3 border-b border-border-light">
            <h3 className="text-[13px] font-bold text-text flex items-center gap-2"><AlertTriangle size={14} className="text-orange-500" /> Exception Breakdown</h3>
          </div>
          <table className="w-full text-[11px]">
            <thead>
              <tr className="bg-gray-50 border-b border-border-light">
                {['Exception', 'Workflow', 'Type', 'Resolution', 'Time', 'Status'].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left font-semibold text-text-muted uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { id: 'EXC-001', workflow: 'Duplicate Detector', type: 'High-value match', resolution: 'Auto-resolved', time: '0.5h', status: 'Closed' },
                { id: 'EXC-002', workflow: 'PO Match', type: 'Variance > 5%', resolution: 'Manual review', time: '4.2h', status: 'Closed' },
                { id: 'EXC-003', workflow: 'Vendor Monitor', type: 'Bank account change', resolution: 'Escalated', time: '12h', status: 'Open' },
                { id: 'EXC-004', workflow: 'SOD Detector', type: 'Critical SOD', resolution: 'Under review', time: '—', status: 'Open' },
                { id: 'EXC-005', workflow: 'Duplicate Detector', type: 'Cross-vendor match', resolution: 'Auto-resolved', time: '0.3h', status: 'Closed' },
              ].map((e, i) => (
                <tr key={e.id} className={`border-b border-border-light/60 hover:bg-primary/[0.015] transition-colors ${i % 2 === 0 ? '' : 'bg-gray-50/40'}`}>
                  <td className="px-4 py-2.5 font-mono font-semibold text-primary">{e.id}</td>
                  <td className="px-4 py-2.5 text-text">{e.workflow}</td>
                  <td className="px-4 py-2.5 text-text-secondary">{e.type}</td>
                  <td className="px-4 py-2.5 text-text-secondary">{e.resolution}</td>
                  <td className="px-4 py-2.5 text-text-secondary">{e.time}</td>
                  <td className="px-4 py-2.5"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${e.status === 'Closed' ? 'text-emerald-700 bg-emerald-50' : 'text-amber-700 bg-amber-50'}`}>{e.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Executive Dashboard — Board-ready KPI summary
  if (templateId === 'rt-006') {
    return (
      <div className="space-y-5">
        <div className="flex gap-2 flex-wrap">
          {sections.map((s, i) => (
            <div key={s.name} className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg border border-border-light text-[11px] font-medium text-text-secondary shadow-sm">
              <span className="text-[9px] font-bold text-primary/50">{i + 1}</span> {s.name}
            </div>
          ))}
        </div>
        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Compliance Score', value: '94.2%', delta: '+2.4%', sub: 'vs prior quarter', color: 'text-primary' },
            { label: 'Controls Effective', value: '48/54', delta: '89%', sub: 'effectiveness rate', color: 'text-emerald-600' },
            { label: 'Audit Progress', value: '58%', delta: 'On track', sub: '54 of 87 controls tested', color: 'text-blue-600' },
          ].map(m => (
            <div key={m.label} className="bg-white rounded-xl border border-border-light p-5 text-center">
              <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-2">{m.label}</div>
              <div className={`text-[32px] font-bold leading-none ${m.color}`}>{m.value}</div>
              <div className="text-[11px] font-semibold text-emerald-600 mt-1">{m.delta}</div>
              <div className="text-[10px] text-text-muted">{m.sub}</div>
            </div>
          ))}
        </div>
        {/* Process Breakdown */}
        <div className="bg-white rounded-xl border border-border-light p-5">
          <h3 className="text-[13px] font-bold text-text mb-4 flex items-center gap-2"><BarChart3 size={14} className="text-primary" /> Process Performance</h3>
          <div className="space-y-3">
            {[
              { name: 'P2P — Procure to Pay', progress: 72, controls: '17/24', risk: 'High' },
              { name: 'O2C — Order to Cash', progress: 44, controls: '8/18', risk: 'Medium' },
              { name: 'R2R — Record to Report', progress: 85, controls: '26/31', risk: 'Low' },
              { name: 'S2C — Source to Contract', progress: 21, controls: '3/14', risk: 'Medium' },
            ].map(p => (
              <div key={p.name} className="flex items-center gap-4">
                <div className="w-48 text-[11px] font-medium text-text">{p.name}</div>
                <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${p.progress}%` }} transition={{ delay: 0.2, duration: 0.6 }} className="h-full rounded-full bg-primary" />
                </div>
                <span className="text-[11px] font-bold text-text w-10 text-right">{p.progress}%</span>
                <span className="text-[10px] text-text-muted w-12">{p.controls}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.risk === 'High' ? 'text-red-700 bg-red-50' : p.risk === 'Medium' ? 'text-amber-700 bg-amber-50' : 'text-emerald-700 bg-emerald-50'}`}>{p.risk}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Strategic Recommendations */}
        <div className="bg-white rounded-xl border border-border-light p-5">
          <h3 className="text-[13px] font-bold text-text mb-3 flex items-center gap-2"><Sparkles size={14} className="text-primary" /> Strategic Recommendations</h3>
          <div className="space-y-2">
            {['Approve additional AI workflow investment for S2C process — projected 3x ROI based on P2P results', 'Remediate DEF-002 (journal entry override) before March 31 — material weakness impacting filing', 'Reallocate Tushar Goel from P2P to S2C support in April — P2P is 72% complete, S2C needs acceleration', 'Expand vendor master monitoring to O2C process — similar risk profile to P2P where it saved 2.4L'].map((rec, i) => (
              <div key={i} className="flex items-start gap-2.5 px-3 py-2.5 bg-primary/[0.02] rounded-lg border border-primary/5">
                <span className="text-[9px] font-bold text-white bg-primary w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                <span className="text-[11px] text-text leading-relaxed">{rec}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Default/fallback — just show sections with placeholder
  return (
    <div className="space-y-5">
      <div className="flex gap-2 flex-wrap">
        {sections.map((s, i) => (
          <div key={s.name} className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg border border-border-light text-[11px] font-medium text-text-secondary shadow-sm">
            <span className="text-[9px] font-bold text-primary/50">{i + 1}</span> {s.name}
          </div>
        ))}
      </div>
      {sections.map((s) => {
        const SIcon = SECTION_ICONS[s.icon] || FileText;
        return (
          <div key={s.name} className="bg-white rounded-xl border border-border-light p-5">
            <h3 className="text-[13px] font-bold text-text mb-2 flex items-center gap-2"><SIcon size={14} className="text-primary" /> {s.name}</h3>
            <div className="h-16 bg-gray-50 rounded-lg flex items-center justify-center text-[11px] text-text-muted border border-dashed border-border-light">
              Section content generated from {report.name} data
            </div>
          </div>
        );
      })}
    </div>
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
            <span className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${query.status === 'Completed' ? 'text-emerald-700 bg-emerald-50' : 'text-amber-700 bg-amber-50'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${query.status === 'Completed' ? 'bg-emerald-500' : 'bg-amber-500'}`} /> {query.status}
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
    ? CATEGORY_GRADIENTS[appliedTemplate.category] || 'from-[#ede4f7] to-[#e0d0f0]'
    : 'from-[#ede4f7] to-[#e0d0f0]';

  const DEFAULT_QUERIES = [
    {
      id: 'Q01', status: 'In Review', risk: 'Financial Risk', severity: 'High',
      title: 'Detects duplicate invoice entries by vendor, date, and amount to streamline audit review and assign case identifiers.',
      addedBy: report.generatedBy,
      kpis: [
        { label: 'Flagged By AI', value: '140', color: 'text-primary' },
        { label: 'Manually Flagged', value: '1', color: 'text-orange-600' },
        { label: 'Resolved', value: '3', color: 'text-emerald-600' },
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
        { label: 'Verified', value: '35', color: 'text-emerald-600' },
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

  // Template-specific report structures — each template reshapes the report content
  const TEMPLATE_QUERIES: Record<string, typeof DEFAULT_QUERIES> = {
    'rt-002': [ // Risk Assessment Summary
      {
        id: 'RA01', status: 'Completed', risk: 'Aggregate Risk', severity: 'High',
        title: 'Risk identification across P2P, O2C, R2R, and S2C business processes — 12 critical risks mapped to 87 controls.',
        addedBy: report.generatedBy,
        kpis: [
          { label: 'Total Risks', value: '12', color: 'text-primary' },
          { label: 'Critical', value: '2', color: 'text-red-600' },
          { label: 'High', value: '5', color: 'text-orange-600' },
          { label: 'Mitigated', value: '5', color: 'text-emerald-600' },
        ],
        summary: 'Enterprise risk assessment identified 12 risks across 4 business processes. 2 critical risks (RSK-004 Fictitious vendors, RSK-007 Malware via portals) remain uncontrolled with zero mapped controls. Estimated uncontrolled exposure: 18L.',
        findings: [
          'RSK-004 (Fictitious vendor registration) and RSK-007 (Malware via vendor portals) have zero controls mapped.',
          'P2P process carries 75% of total risk exposure — highest concentration in any single process.',
          'Risk RSK-003 (Duplicate payments) has 3 controls but effectiveness rating below 60%.',
          'S2C risks are under-assessed — only 3 of 14 controls tested to date.',
        ],
        observations: [
          'Uncontrolled critical risks represent highest-priority remediation items for Q1.',
          'P2P concentration risk suggests need for diversified control strategies.',
          'AI-powered detection workflows reduced false positive rate from 6.5% to 4.2% — recommend expansion.',
        ],
        chartData: [12, 10, 11, 9, 12, 10, 8, 12, 11, 12],
      },
      {
        id: 'RA02', status: 'In Review', risk: 'Mitigation Gap', severity: 'Critical',
        title: 'Mitigation strategy effectiveness analysis — 3 partially mitigated high risks require additional compensating controls.',
        addedBy: 'AI Copilot',
        kpis: [
          { label: 'Strategies Reviewed', value: '18', color: 'text-primary' },
          { label: 'Effective', value: '10', color: 'text-emerald-600' },
          { label: 'Partial', value: '5', color: 'text-amber-600' },
          { label: 'Ineffective', value: '3', color: 'text-red-600' },
        ],
        summary: '18 mitigation strategies reviewed. 3 classified as ineffective — all relate to manual detective controls in P2P that fail under high-volume processing (>500 transactions/day).',
        findings: [
          'Manual three-way match process fails at scale — 8% error rate above 500 daily transactions.',
          'Vendor onboarding KYC control relies on single-person verification — no dual-approval in place.',
          'Compensating control for SOD violations (monthly review) has 45-day average lag.',
        ],
        observations: [
          'Automation of manual detective controls could reduce error rates to below 1%.',
          'Real-time monitoring workflows would replace delayed monthly reviews.',
        ],
        chartData: [18, 16, 17, 15, 18, 14, 16, 18, 17, 18],
      },
    ],
    'rt-003': [ // Control Effectiveness Report
      {
        id: 'CE01', status: 'Completed', risk: 'Control Gap', severity: 'High',
        title: 'Control testing results across 87 controls — 48/54 tested controls rated effective, 6 require remediation.',
        addedBy: report.generatedBy,
        kpis: [
          { label: 'Controls Tested', value: '54', color: 'text-primary' },
          { label: 'Effective', value: '48', color: 'text-emerald-600' },
          { label: 'Deficient', value: '4', color: 'text-red-600' },
          { label: 'Pending Test', value: '33', color: 'text-amber-600' },
        ],
        summary: 'Control effectiveness assessment across all business processes. 89% of tested controls rated effective. 2 material weaknesses identified in P2P journal entry approval and R2R reconciliation process.',
        findings: [
          'CTR-012 (Journal entry approval): Override detected in 7 instances — material weakness.',
          'CTR-031 (GL reconciliation): 3 accounts with unreconciled differences >30 days.',
          'P2P automated controls (CTR-001 to CTR-005) all rated highly effective — AI detection at 95.8% accuracy.',
          '33 controls still untested — S2C process has lowest coverage at 21%.',
        ],
        observations: [
          'Automated controls significantly outperform manual ones — 98% vs 82% effectiveness rate.',
          'S2C control testing must be prioritized before June 30 deadline.',
          'Recommend converting 5 manual detective controls to automated preventive controls.',
        ],
        chartData: [48, 46, 47, 48, 45, 48, 47, 48, 46, 48],
      },
    ],
    'rt-004': [ // Workflow Analytics Report
      {
        id: 'WA01', status: 'Completed', risk: 'Operational Risk', severity: 'High',
        title: 'Workflow execution performance metrics — 115 runs across 8 active workflows with 94.2% accuracy rate.',
        addedBy: 'AI Copilot',
        kpis: [
          { label: 'Total Runs', value: '115', color: 'text-primary' },
          { label: 'Accuracy', value: '94.2%', color: 'text-emerald-600' },
          { label: 'Exceptions', value: '23', color: 'text-orange-600' },
          { label: 'Avg Runtime', value: '1.8d', color: 'text-blue-600' },
        ],
        summary: '8 active AI workflows processed 115 runs this quarter. Duplicate Invoice Detector leads with 45 runs and 96% precision. Processing time improved 14% after model retrain. Vendor Master Monitor caught 2 critical unauthorized changes.',
        findings: [
          'Duplicate Invoice Detector: 45 runs, 96% precision, saved 2.4L this month.',
          'Three-Way PO Match: 87% auto-match rate, 5% unmatched requiring manual review.',
          'Vendor Master Monitor: 2 unauthorized bank changes blocked before payment.',
          'SOD Violation Detector: 12 violations found across 2,341 users — 4 critical.',
        ],
        observations: [
          'Model retrain reduced false positive rate from 6.5% to 4.2% — 35% reduction in auditor review time.',
          'Workflow scheduling optimization could reduce processing queue by 2 hours.',
          'Recommend adding anomaly detection layer to Three-Way PO Match for variance prediction.',
        ],
        chartData: [85, 88, 90, 87, 92, 94, 91, 93, 95, 94],
      },
      {
        id: 'WA02', status: 'In Review', risk: 'Processing Risk', severity: 'High',
        title: 'Exception trend analysis — 23 exceptions flagged across workflows, 8 resolved automatically by AI.',
        addedBy: report.generatedBy,
        kpis: [
          { label: 'Exceptions', value: '23', color: 'text-primary' },
          { label: 'Auto-Resolved', value: '8', color: 'text-emerald-600' },
          { label: 'Manual Review', value: '12', color: 'text-amber-600' },
          { label: 'Escalated', value: '3', color: 'text-red-600' },
        ],
        summary: '23 exceptions flagged this quarter. AI auto-resolved 35% without human intervention. 3 escalated to senior audit — all related to vendor bank account modifications exceeding risk threshold.',
        findings: [
          '8 exceptions auto-resolved via AI confidence scoring (>95% match confidence).',
          '3 escalated cases all involved bank account field changes — pattern suggests targeted testing needed.',
          'Average exception resolution time: 4.2 hours (down from 8.1 hours last quarter).',
        ],
        observations: [
          'Auto-resolution rate trending upward — target 50% by Q2.',
          'Bank account modification exceptions should trigger enhanced verification workflow.',
        ],
        chartData: [5, 3, 6, 4, 2, 3, 5, 7, 4, 3],
      },
    ],
    'rt-006': [ // Executive Dashboard Export
      {
        id: 'EX01', status: 'Completed', risk: 'Strategic Risk', severity: 'High',
        title: 'Board-level GRC posture summary — compliance at 94.2%, 2 material weaknesses, 18L uncontrolled exposure.',
        addedBy: report.generatedBy,
        kpis: [
          { label: 'Compliance', value: '94.2%', color: 'text-primary' },
          { label: 'Material Weakness', value: '2', color: 'text-red-600' },
          { label: 'Cost Saved', value: '24L', color: 'text-emerald-600' },
          { label: 'Exposure', value: '18L', color: 'text-orange-600' },
        ],
        summary: 'Enterprise GRC posture is strong at 94.2% compliance with improving trajectory. Two material weaknesses require board attention. AI-powered workflows saved 24L YTD through automated detection and prevention.',
        findings: [
          'Compliance score improved from 91.8% to 94.2% quarter-over-quarter.',
          'DEF-002 (Journal entry approval override) — remediation due in 6 days.',
          'AI workflows saved 24L in cost avoidance — 2.4L from duplicate invoice blocking alone.',
          'Team utilization at 74% — Tushar Goel over-allocated at 120% in April.',
        ],
        observations: [
          'On track for Q1 SOX filing deadline March 31.',
          'Budget utilization at 67% — within planned range.',
          'Recommend board approval for additional AI workflow investment in S2C process.',
        ],
        chartData: [91, 91.5, 92, 92.3, 93, 93.2, 93.5, 93.8, 94, 94.2],
      },
    ],
  };

  const TEMPLATE_STATS: Record<string, { label: string; value: string; icon: React.ElementType; color: string }[]> = {
    'rt-002': [
      { label: 'Total Risks', value: '12', icon: AlertTriangle, color: 'text-orange-600 bg-orange-50' },
      { label: 'Uncontrolled', value: '2', icon: Shield, color: 'text-red-600 bg-red-50' },
      { label: 'Mitigated', value: '5', icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
      { label: 'Exposure', value: '18L', icon: TrendingUp, color: 'text-blue-600 bg-blue-50' },
    ],
    'rt-003': [
      { label: 'Controls Tested', value: '54', icon: Shield, color: 'text-blue-600 bg-blue-50' },
      { label: 'Effective', value: '48', icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
      { label: 'Deficient', value: '4', icon: AlertTriangle, color: 'text-red-600 bg-red-50' },
      { label: 'Effectiveness Rate', value: '89%', icon: TrendingUp, color: 'text-purple-600 bg-purple-50' },
    ],
    'rt-004': [
      { label: 'Workflow Runs', value: '115', icon: TrendingUp, color: 'text-blue-600 bg-blue-50' },
      { label: 'Accuracy', value: '94.2%', icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
      { label: 'Exceptions', value: '23', icon: AlertTriangle, color: 'text-orange-600 bg-orange-50' },
      { label: 'Cost Saved', value: '24L', icon: Shield, color: 'text-purple-600 bg-purple-50' },
    ],
    'rt-006': [
      { label: 'Compliance Score', value: '94.2%', icon: Shield, color: 'text-purple-600 bg-purple-50' },
      { label: 'Material Weakness', value: '2', icon: AlertTriangle, color: 'text-red-600 bg-red-50' },
      { label: 'Cost Saved', value: '24L', icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50' },
      { label: 'Risk Exposure', value: '18L', icon: FileText, color: 'text-orange-600 bg-orange-50' },
    ],
  };

  const activeQueries = appliedTemplate && TEMPLATE_QUERIES[appliedTemplate.id]
    ? TEMPLATE_QUERIES[appliedTemplate.id]
    : DEFAULT_QUERIES;

  const activeStats = appliedTemplate && TEMPLATE_STATS[appliedTemplate.id]
    ? TEMPLATE_STATS[appliedTemplate.id]
    : [
        { label: 'Total Exceptions', value: '187', icon: AlertTriangle, color: 'text-orange-600 bg-orange-50' },
        { label: 'Resolved', value: '38', icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
        { label: 'Critical Items', value: '12', icon: Shield, color: 'text-red-600 bg-red-50' },
        { label: 'Compliance Score', value: '78%', icon: TrendingUp, color: 'text-blue-600 bg-blue-50' },
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
        <div className={`relative rounded-2xl overflow-hidden mb-5 bg-gradient-to-br ${coverGradient} shadow-md`} style={{ border: '1px solid rgba(106,18,205,0.12)' }}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/10 to-transparent" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-primary/8 to-transparent" />
          <div className="relative px-8 py-8 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Shield size={18} className="text-primary" />
                </div>
                <span className="text-[11px] font-bold bg-primary/10 text-primary px-3 py-1 rounded-full uppercase tracking-wider">SOX Audit Report</span>
                {appliedTemplate && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-[10px] font-bold bg-primary/15 text-primary px-2.5 py-1 rounded-full flex items-center gap-1"
                  >
                    <Layout size={9} /> Template: {appliedTemplate.name}
                  </motion.span>
                )}
              </div>
              <h1 className="text-2xl font-bold tracking-tight mb-1 text-text">{report.name}</h1>
              <p className="text-text-muted text-[13px]">{report.generatedBy} · {report.generatedAt} · {activeQueries.length} queries</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">{activeQueries.length}</div>
              <div className="text-[10px] text-text-muted uppercase tracking-wider">Queries</div>
            </div>
          </div>
        </div>

        {/* Summary Stats Bar */}
        <div className="grid grid-cols-4 gap-3 mb-5">
          {activeStats.map(stat => (
            <div key={stat.label} className="glass-card rounded-xl p-4 flex items-center gap-3 hover:shadow-md hover:shadow-primary/5 transition-all">
              <div className={`p-2 rounded-lg ${stat.color}`}><stat.icon size={16} /></div>
              <div>
                <div className="text-xl font-bold text-text">{stat.value}</div>
                <div className="text-[10px] text-text-muted uppercase tracking-wider">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Template-specific layout OR default query cards */}
        <AnimatePresence mode="wait">
          <motion.div key={appliedTemplate?.id || 'default'} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            {appliedTemplate ? (
              <TemplateLayout templateId={appliedTemplate.id} template={appliedTemplate} report={report} />
            ) : (
              <>
                {activeQueries.map((query, qi) => (
                  <QueryCard key={query.id} query={query} index={qi} />
                ))}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── Main Reports View ───
export default function ReportsView({ onOpenBuilder, onShare }: ReportsViewProps = {}) {
  const [activeTab, setActiveTab] = useState<'templates' | 'my-reports' | 'shared-reports'>('my-reports');
  const [viewingReport, setViewingReport] = useState<typeof GENERATED_REPORTS[0] | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<typeof REPORT_TEMPLATES[0] | null>(null);
  const [previewingTemplate, setPreviewingTemplate] = useState<typeof REPORT_TEMPLATES[0] | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [reportAppliedTemplates] = useState<Record<string, typeof REPORT_TEMPLATES[0]>>({});
  const [showNewReportTemplateSelector, setShowNewReportTemplateSelector] = useState(false);
  const { addToast } = useToast();

  // Approval statuses for reports
  const REPORT_APPROVAL: Record<string, string> = {
    'gr-001': 'Approved',
    'gr-002': 'Pending Approval',
    'gr-003': 'Draft',
  };

  const approvalColor = (status: string) => {
    if (status === 'Approved') return 'text-emerald-700 bg-emerald-50';
    if (status === 'Pending Approval') return 'text-amber-700 bg-amber-50';
    return 'text-gray-600 bg-gray-100';
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
            <button onClick={() => setShowNewReportTemplateSelector(true)} className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-[13px] font-semibold transition-colors cursor-pointer">
              <FileText size={14} /> New Report
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
            onClick={() => setActiveTab('shared-reports')}
            className={`px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors cursor-pointer ${activeTab === 'shared-reports' ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text-secondary'}`}
          >
            <span className="flex items-center gap-2">
              <Share2 size={14} />
              Shared Reports
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === 'shared-reports' ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-500'}`}>{SHARED_REPORTS.length}</span>
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
              { key: 'approval', label: 'Approval', width: '130px', render: (item) => {
                const approval = REPORT_APPROVAL[String(item.id)] || 'Draft';
                return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${approvalColor(approval)}`}>{approval}</span>;
              }},
              { key: 'actions', label: '', width: '110px', sortable: false, align: 'right', render: (item) => (
                <div className="flex items-center justify-end gap-1">
                  <button onClick={() => addToast({ type: 'success', message: `Downloading ${item.name}...` })} className="p-1.5 text-text-muted hover:text-primary hover:bg-primary-xlight rounded-md transition-colors cursor-pointer" title="Download"><Download size={14} /></button>
                  <button onClick={() => onShare ? onShare(String(item.id)) : addToast({ type: 'info', message: `Sharing ${item.name}...` })} className="p-1.5 text-text-muted hover:text-primary hover:bg-primary-xlight rounded-md transition-colors cursor-pointer" title="Share"><Share2 size={14} /></button>
                  <button onClick={() => addToast({ type: 'success', message: `${item.name} deleted.` })} className="p-1.5 text-text-muted hover:text-red-500 hover:bg-red-50 rounded-md transition-colors cursor-pointer" title="Delete"><Trash2 size={14} /></button>
                </div>
              )},
            ]}
          />
        )}

        {/* Shared Reports */}
        {activeTab === 'shared-reports' && (
          <SmartTable
            data={SHARED_REPORTS as unknown as Record<string, unknown>[]}
            keyField="id"
            searchPlaceholder="Search shared reports..."
            searchKeys={['name', 'sharedBy', 'sharedWith']}
            paginated={false}
            columns={[
              { key: 'name', label: 'Report', render: (item) => (
                <div className="flex items-center gap-2">
                  <FileText size={14} className="text-primary" />
                  <div>
                    <div className="text-text font-medium">{String(item.name)}</div>
                    <div className="text-[10px] text-text-muted">{String(item.pages)} pages · shared with {String(item.sharedWith)}</div>
                  </div>
                </div>
              )},
              { key: 'sharedBy', label: 'Shared By', width: '140px', render: (item) => (
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[8px] font-bold flex items-center justify-center">
                    {String(item.sharedBy).split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <span className="text-text-secondary text-[12px]">{String(item.sharedBy)}</span>
                </div>
              )},
              { key: 'sharedAt', label: 'Date', width: '120px', render: (item) => (
                <span className="text-text-muted text-[12px]">{String(item.sharedAt)}</span>
              )},
              { key: 'status', label: 'Status', width: '100px', render: (item) => <StatusBadge status={String(item.status)} /> },
              { key: 'actions', label: '', width: '110px', sortable: false, align: 'right', render: (item) => (
                <div className="flex items-center justify-end gap-1">
                  <button onClick={() => addToast({ type: 'success', message: `Downloading ${item.name}...` })} className="p-1.5 text-text-muted hover:text-primary hover:bg-primary-xlight rounded-md transition-colors cursor-pointer" title="Download"><Download size={14} /></button>
                  <button onClick={() => addToast({ type: 'info', message: `Sharing ${item.name}...` })} className="p-1.5 text-text-muted hover:text-primary hover:bg-primary-xlight rounded-md transition-colors cursor-pointer" title="Share"><Share2 size={14} /></button>
                  <button onClick={() => addToast({ type: 'success', message: `${item.name} deleted.` })} className="p-1.5 text-text-muted hover:text-red-500 hover:bg-red-50 rounded-md transition-colors cursor-pointer" title="Delete"><Trash2 size={14} /></button>
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

      {/* New Report — Template Selector Modal */}
      <AnimatePresence>
        {showNewReportTemplateSelector && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setShowNewReportTemplateSelector(false)}>
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              role="dialog" aria-modal="true" aria-label="Select Report Template"
              className="relative bg-white rounded-2xl shadow-2xl w-[560px] max-h-[80vh] overflow-hidden flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-border-light flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-primary/10 text-primary rounded-xl"><FileText size={16} /></div>
                  <div>
                    <h3 className="text-[15px] font-semibold text-text">New Report</h3>
                    <p className="text-[11px] text-text-muted">Select a template to get started</p>
                  </div>
                </div>
                <button onClick={() => setShowNewReportTemplateSelector(false)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"><X size={16} className="text-text-muted" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {REPORT_TEMPLATES.map((rt, i) => {
                  const Icon = ICON_MAP[rt.icon] || FileText;
                  const color = CATEGORY_COLORS[rt.category] || 'text-gray-600 bg-gray-50';
                  return (
                    <motion.button
                      key={rt.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      onClick={() => {
                        setShowNewReportTemplateSelector(false);
                        addToast({ type: 'success', message: `Creating report from "${rt.name}" template...` });
                        if (onOpenBuilder) onOpenBuilder();
                      }}
                      className="w-full text-left p-4 rounded-xl border border-border-light hover:border-primary/30 hover:bg-primary-xlight/50 hover:shadow-sm transition-all duration-300 cursor-pointer group flex items-start gap-3"
                    >
                      <div className={`p-2 rounded-xl ${color} shrink-0 group-hover:scale-110 transition-transform duration-300`}><Icon size={16} /></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[13px] font-semibold text-text group-hover:text-primary transition-colors">{rt.name}</span>
                          <span className={`text-[9px] font-bold uppercase tracking-wider ${color.split(' ')[0]}`}>{rt.category}</span>
                        </div>
                        <p className="text-[11px] text-text-muted leading-relaxed">{rt.desc}</p>
                        {rt.sections && (
                          <div className="flex gap-1 mt-2 flex-wrap">
                            {rt.sections.slice(0, 4).map(s => (
                              <span key={s.name} className="text-[9px] text-text-muted bg-surface-2 px-1.5 py-0.5 rounded">{s.name}</span>
                            ))}
                            {rt.sections.length > 4 && <span className="text-[9px] text-text-muted bg-surface-2 px-1.5 py-0.5 rounded">+{rt.sections.length - 4} more</span>}
                          </div>
                        )}
                      </div>
                      <ArrowRight size={14} className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
