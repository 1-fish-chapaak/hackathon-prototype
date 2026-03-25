import { motion } from 'motion/react';
import {
  Database, FileText, Plus, RefreshCw,
  Settings, Link2, Unlink, Upload,
  HardDrive, FileSpreadsheet
} from 'lucide-react';
import { DATA_SOURCES } from '../../data/mockData';
import { StatusBadge } from '../shared/StatusBadge';
import Orb from '../shared/Orb';
import { useToast } from '../shared/Toast';

const TYPE_ICONS: Record<string, React.ElementType> = {
  sql: Database,
  csv: FileSpreadsheet,
  pdf: FileText,
};

const TYPE_COLORS: Record<string, string> = {
  sql: 'text-blue-600 bg-blue-50',
  csv: 'text-green-600 bg-green-50',
  pdf: 'text-orange-600 bg-orange-50',
};

export default function DataSourcesView() {
  const { addToast } = useToast();
  return (
    <div className="h-full overflow-y-auto bg-white bg-mesh-gradient relative">
      <Orb hoverIntensity={0.09} rotateOnHover hue={275} opacity={0.08} />
      <div className="max-w-5xl mx-auto px-8 py-8 relative">
        {/* Header */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-text tracking-tight">Data Sources</h1>
            <p className="text-sm text-text-secondary mt-1">Manage connected databases, files, and integrations</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => addToast('File upload dialog opened', 'info')} className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg text-[13px] text-text-secondary hover:bg-white transition-colors cursor-pointer">
              <Upload size={14} />
              Upload File
            </button>
            <button onClick={() => addToast('New data source wizard starting...', 'info')} className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-[13px] font-semibold transition-colors cursor-pointer">
              <Plus size={14} />
              Connect Source
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Sources', value: DATA_SOURCES.length, icon: HardDrive, color: 'text-primary bg-primary-xlight' },
            { label: 'Connected', value: DATA_SOURCES.filter(d => d.status === 'connected').length, icon: Link2, color: 'text-green-600 bg-green-50' },
            { label: 'Disconnected', value: DATA_SOURCES.filter(d => d.status === 'disconnected').length, icon: Unlink, color: 'text-red-600 bg-red-50' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card rounded-2xl p-4"
            >
              <div className={`p-2 rounded-lg ${stat.color} w-fit mb-2`}>
                <stat.icon size={16} />
              </div>
              <div className="text-2xl font-bold text-text">{stat.value}</div>
              <div className="text-[11px] text-text-muted uppercase tracking-wider mt-0.5">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Sources list */}
        <div className="space-y-3">
          {DATA_SOURCES.map((ds, i) => {
            const Icon = TYPE_ICONS[ds.type] || Database;
            const color = TYPE_COLORS[ds.type] || 'text-gray-600 bg-gray-50';
            const isConnected = ds.status === 'connected';

            return (
              <motion.div
                key={ds.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`glass-card rounded-2xl p-5 hover:shadow-lg hover:shadow-primary/5 active:scale-[0.998] transition-all duration-300 group ${
                  !isConnected ? '!border-red-200 !bg-red-50/30' : 'hover:border-primary/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-xl ${color} group-hover:scale-110 transition-transform duration-300`}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-[14px] font-semibold text-text">{ds.name}</h3>
                        <StatusBadge status={ds.status} />
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-[12px] text-text-muted">
                        <span className="uppercase font-bold text-[10px]">{ds.type}</span>
                        <span>{ds.records} records</span>
                        <span>Last sync: {ds.lastSync}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isConnected && (
                      <button onClick={() => addToast('Syncing data source...', 'success')} className="p-2 text-text-muted hover:text-primary hover:bg-primary-xlight rounded-lg transition-colors cursor-pointer" title="Refresh">
                        <RefreshCw size={14} />
                      </button>
                    )}
                    <button onClick={() => addToast('Data source settings opened', 'info')} className="p-2 text-text-muted hover:text-text-secondary hover:bg-gray-50 rounded-lg transition-colors cursor-pointer" title="Settings">
                      <Settings size={14} />
                    </button>
                    {!isConnected && (
                      <button onClick={() => addToast('Attempting to reconnect...', 'info')} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-[12px] font-semibold transition-colors cursor-pointer">
                        <Link2 size={12} />
                        Reconnect
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
