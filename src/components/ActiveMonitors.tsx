import React from 'react';
import { Square, Activity, Users, Clock, AlertTriangle, Plus } from 'lucide-react';

export interface Monitor {
  id: string;
  groupName: string;
  lagThreshold: number;
  startTime: Date;
  status: 'running' | 'scaling' | 'error';
  currentReplicaCount: number;
}

interface ActiveMonitorsProps {
  monitors: Monitor[];
  onStopMonitor: (groupName: string) => void;
  onAddMonitor: () => void;
}

export default function ActiveMonitors({ monitors, onStopMonitor, onAddMonitor }: ActiveMonitorsProps) {
  const formatStartTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const getStatusColor = (status: Monitor['status']) => {
    switch (status) {
      case 'running':
        return 'text-emerald-400';
      case 'scaling':
        return 'text-amber-400';
      case 'error':
        return 'text-rose-400';
      default:
        return 'text-white/70';
    }
  };

  const getStatusIcon = (status: Monitor['status']) => {
    switch (status) {
      case 'running':
        return <Activity className="h-4 w-4" />;
      case 'scaling':
        return <Users className="h-4 w-4" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="backdrop-blur-xl bg-white/10 rounded-xl p-6 border border-white/20 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Monitors</h2>
        <button
          onClick={onAddMonitor}
          className="p-2 rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 hover:bg-emerald-500/30 hover:border-emerald-400/60 transition-all"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      
      {monitors.length === 0 ? (
        <p className="text-white/50 text-center py-8">No active monitors</p>
      ) : (
        <div className="space-y-3">
          {monitors.map((monitor) => (
            <div
              key={monitor.id}
              className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-6 flex-1">
                <div>
                  <h3 className="font-medium text-white">{monitor.groupName}</h3>
                  <div className="flex items-center gap-4 mt-1 text-sm text-white/70">
                    <span className="flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Threshold: {monitor.lagThreshold} msgs
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Started: {formatStartTime(monitor.startTime)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className={`flex items-center gap-2 ${getStatusColor(monitor.status)}`}>
                    {getStatusIcon(monitor.status)}
                    <span className="capitalize">{monitor.status}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-white/70">
                    <Users className="h-4 w-4" />
                    <span>{monitor.currentReplicaCount} replicas</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onStopMonitor(monitor.groupName)}
                className="ml-4 p-2 rounded-lg bg-rose-500/20 border border-rose-400/40 text-rose-400 hover:bg-rose-500/30 hover:border-rose-400/60 transition-all"
              >
                <Square className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 