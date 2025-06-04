import React from 'react';
import { ChevronLeft, ChevronRight, Plus, CheckCircle2, AlertCircle } from 'lucide-react';

export interface Cluster {
  id: string;
  name: string;
  status: 'healthy' | 'warning' | 'critical';
}

interface ClusterSidebarProps {
  clusters: Cluster[];
  selectedClusterId: string | null;
  onSelect: (id: string) => void;
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
}

export default function ClusterSidebar({ clusters, selectedClusterId, onSelect, collapsed, setCollapsed }: ClusterSidebarProps) {
  return (
    <div
      className={`relative h-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl flex flex-col transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}
    >
      {/* Collapse toggle */}
      <button
        className="absolute -right-3 top-4 p-1 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full shadow-lg border border-white/20"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>

      {/* Header */}
      <div className={`px-4 py-4 flex items-center gap-2 ${collapsed ? 'justify-center' : ''}`}>
        <DatabaseIcon collapsed={collapsed} />
        {!collapsed && <span className="text-white/90 font-semibold">Clusters</span>}
      </div>

      {/* Cluster list */}
      <nav className="flex-1 overflow-y-auto mt-2">
        {clusters.map((c) => (
          <SidebarItem
            key={c.id}
            cluster={c}
            collapsed={collapsed}
            isActive={selectedClusterId === c.id}
            onSelect={() => onSelect(c.id)}
          />
        ))}
      </nav>

      {/* Add Cluster */}
      <button
        className={`m-3 flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-white/30 hover:bg-white/5 text-white/70 transition-all ${collapsed ? 'justify-center' : ''}`}
        onClick={() => alert('Add Cluster: not implemented')}
      >
        <Plus className="h-4 w-4" />
        {!collapsed && <span>Add Cluster</span>}
      </button>
    </div>
  );
}

function SidebarItem({ cluster, collapsed, isActive, onSelect }: { cluster: Cluster; collapsed: boolean; isActive: boolean; onSelect: () => void }) {
  const statusIcon = () => {
    switch (cluster.status) {
      case 'healthy':
        return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-amber-400" />;
      case 'critical':
        return <AlertCircle className="h-4 w-4 text-rose-400" />;
    }
  };

  return (
    <div
      onClick={onSelect}
      className={`cursor-pointer select-none mx-2 my-1 flex items-center gap-2 rounded-lg px-2 py-2 transition-colors ${isActive ? 'bg-indigo-600/60' : 'hover:bg-white/5'}`}
    >
      {statusIcon()}
      {!collapsed && <span className="text-white/80 truncate">{cluster.name}</span>}
    </div>
  );
}

function DatabaseIcon({ collapsed }: { collapsed: boolean }) {
  return <div className="relative">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="w-5 h-5 stroke-white/90">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3c4.418 0 8 1.343 8 3s-3.582 3-8 3-8-1.343-8-3 3.582-3 8-3z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6v6c0 1.657 3.582 3 8 3s8-1.343 8-3V6" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 12v6c0 1.657 3.582 3 8 3s8-1.343 8-3v-6" />
    </svg>
  </div>;
} 