import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Link2, Mail, Copy, Send, Check, Eye, Edit, MessageSquare } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'share' | 'link'>('share');
  const [email, setEmail] = useState('');
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

  const handleSendInvite = () => {
    if (!email.trim()) return;
    addToast({ type: 'success', message: `Invitation sent to ${email}` });
    setEmail('');
  };

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
        className="relative glass-card-strong rounded-2xl shadow-2xl w-[480px] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-border-light flex items-center justify-between">
          <h3 className="text-[15px] font-semibold text-text">Share</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
            <X size={16} className="text-text-muted" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-5 pt-3 flex gap-1">
          {(['share', 'link'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12px] font-medium transition-colors cursor-pointer capitalize ${
                activeTab === tab ? 'bg-primary/10 text-primary' : 'text-text-muted hover:bg-gray-50'
              }`}
            >
              {tab === 'share' ? <Mail size={13} /> : <Link2 size={13} />}
              {tab}
            </button>
          ))}
        </div>

        <div className="px-5 py-4">
          {activeTab === 'share' ? (
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter email address..."
                  className="flex-1 px-3 py-2.5 rounded-xl border border-border-light text-[13px] text-text focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
                />
                <select
                  value={permission}
                  onChange={e => setPermission(e.target.value)}
                  className="px-3 py-2.5 rounded-xl border border-border-light text-[12px] text-text-secondary bg-white focus:outline-none cursor-pointer"
                >
                  {PERMISSIONS.map(p => (
                    <option key={p.id} value={p.id}>{p.label}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleSendInvite}
                disabled={!email.trim()}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary to-primary-medium text-white rounded-xl text-[13px] font-semibold hover:from-primary-hover hover:to-primary disabled:opacity-40 transition-all cursor-pointer"
              >
                <Send size={13} />
                Send Invitation
              </button>

              {RECENT_SHARES.length > 0 && (
                <div>
                  <div className="text-[12px] font-semibold text-text-muted uppercaser mb-2">Shared with</div>
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
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 rounded-xl bg-surface-2 border border-border-light">
                <Link2 size={14} className="text-text-muted shrink-0" />
                <span className="flex-1 text-[12px] text-text-secondary font-mono truncate">
                  https://auditify.ai/shared/rpt-fx26q1...
                </span>
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg text-[12px] font-semibold hover:bg-primary-hover transition-colors cursor-pointer whitespace-nowrap"
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>
              </div>
              <div className="text-[12px] text-text-muted">
                Anyone with the link can view this resource. You can change permissions anytime.
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
