import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning';
  action?: { label: string; onClick: () => void };
}

interface ToastContextType {
  addToast: (toast: Omit<Toast, 'id'>) => void;
}

const ToastContext = createContext<ToastContextType>({ addToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map(toast => (
            <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), 3500);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const icons = {
    success: <CheckCircle size={16} className="text-green-500" />,
    info: <Info size={16} className="text-blue-500" />,
    warning: <AlertTriangle size={16} className="text-orange-500" />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="glass-card-strong rounded-xl px-4 py-3 flex items-center gap-3 min-w-[280px] max-w-[380px] shadow-lg"
    >
      {icons[toast.type]}
      <span className="text-[13px] text-text flex-1">{toast.message}</span>
      {toast.action && (
        <button
          onClick={toast.action.onClick}
          className="text-[12px] font-semibold text-primary hover:text-primary-hover transition-colors cursor-pointer whitespace-nowrap"
        >
          {toast.action.label}
        </button>
      )}
      <button onClick={() => onRemove(toast.id)} className="text-text-muted hover:text-text-secondary p-0.5 cursor-pointer">
        <X size={14} />
      </button>
    </motion.div>
  );
}
