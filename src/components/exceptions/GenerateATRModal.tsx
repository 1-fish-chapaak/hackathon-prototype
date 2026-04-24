import { motion } from 'motion/react';
import { X, Download, FileText } from 'lucide-react';

const PDF_URL = '/action-taken-report.pdf';
const PDF_FILENAME = 'Action Taken Report.pdf';

export default function GenerateATRModal({
  onClose,
  fileUrl = PDF_URL,
  fileName = PDF_FILENAME,
}: {
  onClose: () => void;
  fileUrl?: string;
  fileName?: string;
}) {
  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = fileUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 bg-ink-900/50 backdrop-blur-[2px] z-50"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 8 }}
        transition={{ duration: 0.18, ease: [0.2, 0, 0, 1] }}
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[960px] max-w-[94vw] h-[88vh] bg-canvas-elevated rounded-[16px] shadow-xl border border-canvas-border z-[60] flex flex-col"
        role="dialog"
        aria-label="Action Taken Report preview"
      >
        {/* Header */}
        <header className="shrink-0 px-6 py-4 flex items-center justify-between gap-4 border-b border-canvas-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[10px] bg-brand-50 text-brand-700 flex items-center justify-center shrink-0">
              <FileText size={16} />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-ink-900 leading-tight">Action Taken Report</h2>
              <p className="text-[12px] text-ink-500 leading-snug">
                Preview · <span className="font-mono">{fileName}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full text-ink-500 hover:text-ink-800 hover:bg-[#F4F2F7] flex items-center justify-center cursor-pointer shrink-0"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </header>

        {/* PDF preview */}
        <div className="flex-1 min-h-0 bg-[#F4F2F7] p-3">
          <object
            data={`${fileUrl}#toolbar=1&navpanes=0`}
            type="application/pdf"
            className="w-full h-full rounded-[10px] bg-canvas-elevated border border-canvas-border"
            aria-label="Action Taken Report PDF preview"
          >
            <div className="w-full h-full flex flex-col items-center justify-center text-center p-8">
              <FileText size={32} className="text-ink-400 mb-3" />
              <p className="text-[13px] text-ink-700 mb-1">PDF preview is not supported in this browser.</p>
              <p className="text-[12px] text-ink-500 mb-4">Download the report to view it on your device.</p>
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 h-9 px-4 text-[12.5px] font-semibold text-white bg-brand-600 rounded-[8px] hover:bg-brand-500 cursor-pointer"
              >
                <Download size={13} />
                Download PDF
              </button>
            </div>
          </object>
        </div>

        {/* Footer */}
        <footer className="shrink-0 px-6 py-3.5 border-t border-canvas-border flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="h-10 px-5 text-[13px] font-medium text-ink-700 bg-canvas-elevated border border-canvas-border rounded-[8px] hover:border-brand-200 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleDownload}
            className="h-10 px-5 inline-flex items-center gap-2 text-[13px] font-semibold text-white bg-brand-600 hover:bg-brand-500 rounded-[8px] cursor-pointer transition-colors"
          >
            <Download size={14} />
            Download PDF
          </button>
        </footer>
      </motion.div>
    </>
  );
}
