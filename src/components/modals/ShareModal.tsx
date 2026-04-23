import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Link2, Check, Eye, Edit, MessageSquare } from 'lucide-react';
import { useToast } from '../shared/Toast';

interface Props {
  onClose: () => void;
}

const PERMISSIONS = [
  { id: 'view', label: 'Can view', icon: Eye },
  { id: 'edit', label: 'Can edit', icon: Edit },
  { id: 'comment', label: 'Can comment', icon: MessageSquare },
];

const RECENT_SHARES = [
  { name: 'Tushar Goel', email: 'tushar.goel@company.com', initials: 'TG', permission: 'edit' },
  { name: 'Karan Mehta', email: 'karan.mehta@company.com', initials: 'KM', permission: 'view' },
];

export default function ShareModal({ onClose }: Props) {
  const { addToast } = useToast();
  const [recipients, setRecipients] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [permission, setPermission] = useState('view');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleCopyLink = () => {
    setCopied(true);
    addToast({ type: 'success', message: 'Link copied to clipboard!' });
    setTimeout(() => setCopied(false), 2000);
  };

  const addRecipient = (raw: string) => {
    const email = raw.trim().replace(/[,;]$/, '');
    if (!email) return;
    setRecipients(prev => (prev.includes(email) ? prev : [...prev, email]));
    setInput('');
  };

  const removeRecipient = (email: string) => {
    setRecipients(prev => prev.filter(e => e !== email));
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === ';' || e.key === 'Tab') {
      if (input.trim()) {
        e.preventDefault();
        addRecipient(input);
      }
    } else if (e.key === 'Backspace' && !input && recipients.length > 0) {
      setRecipients(prev => prev.slice(0, -1));
    }
  };

  const handleInvite = () => {
    const pending = input.trim();
    const all = pending ? [...recipients, pending] : recipients;
    if (all.length === 0) return;
    addToast({ type: 'success', message: `Invitation sent to ${all.join(', ')}` });
    setRecipients([]);
    setInput('');
  };

  const canInvite = recipients.length > 0 || input.trim().length > 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        role="dialog"
        aria-modal="true"
        aria-label="Share"
        className="relative glass-card-strong rounded-2xl shadow-2xl w-[500px] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-border-light flex items-center justify-between gap-3">
          <h3 className="text-[15px] font-semibold text-text">Share</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium text-primary hover:bg-[#6a12cd0a] transition-colors cursor-pointer"
            >
              {copied ? <Check size={13} /> : <Link2 size={13} />}
              {copied ? 'Copied!' : 'Copy link'}
            </button>
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
              <X size={16} className="text-text-muted" />
            </button>
          </div>
        </div>

        <div className="px-5 py-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div
                className="flex-1 flex items-center gap-2 min-h-[40px] pl-2 pr-1 py-1 bg-white border border-border-light focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/10 transition-all"
                style={{ borderRadius: '8px' }}
              >
                <div className="flex-1 flex flex-wrap items-center gap-1.5">
                  {recipients.map(email => (
                    <span
                      key={email}
                      className="flex items-center gap-1 pl-2 pr-1 h-7 bg-white border border-border-light text-[12px] text-text"
                      style={{ borderRadius: '8px' }}
                    >
                      {email}
                      <button
                        onClick={() => removeRecipient(email)}
                        className="p-0.5 text-text-muted hover:text-text rounded cursor-pointer"
                        aria-label={`Remove ${email}`}
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                  <input
                    type="email"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleInputKeyDown}
                    onBlur={() => input.trim() && addRecipient(input)}
                    placeholder={recipients.length === 0 ? 'Enter email address…' : ''}
                    className="flex-1 min-w-[120px] h-7 px-1 bg-transparent text-[13px] text-text placeholder:text-text-muted/60 focus:outline-none"
                  />
                </div>
                <select
                  value={permission}
                  onChange={e => setPermission(e.target.value)}
                  className="h-8 pl-2 pr-6 bg-transparent text-[12px] text-text-secondary focus:outline-none cursor-pointer shrink-0 appearance-none hover:bg-paper-50 transition-colors"
                  style={{
                    borderRadius: '8px',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' fill='none'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%236b7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 8px center',
                  }}
                >
                  {PERMISSIONS.map(p => (
                    <option key={p.id} value={p.id}>{p.label}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleInvite}
                disabled={!canInvite}
                className="h-10 px-5 bg-[#6a12cd] hover:bg-[#5a0fb0] text-white text-[14px] font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shrink-0"
                style={{ borderRadius: '8px' }}
              >
                Invite
              </button>
            </div>

            {RECENT_SHARES.length > 0 && (
              <div>
                <div className="text-[12px] font-semibold text-text-muted mb-2">Shared with</div>
                <div className="space-y-2">
                  {RECENT_SHARES.map(share => (
                    <div key={share.email} className="flex items-center gap-3 p-2.5 rounded-lg bg-surface-2">
                      <div className="w-7 h-7 rounded-full bg-primary/10 text-primary text-[12px] font-bold flex items-center justify-center">
                        {share.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] font-medium text-text">{share.name}</div>
                        <div className="text-[12px] text-text-muted truncate">{share.email}</div>
                      </div>
                      <span className="text-[12px] text-text-muted capitalize bg-white px-2 py-0.5 rounded border border-border-light">
                        {share.permission}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
