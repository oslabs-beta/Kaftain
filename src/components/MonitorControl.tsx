import React, { useState } from 'react';
import { Play } from 'lucide-react';
import CustomDropdown from './CustomDropdown';

interface ScalingConfig {
  minReplicas: number;
  maxReplicas: number;
  scalingFactor: number;
}

interface MonitorControlProps {
  consumerGroups: Array<{ name: string; topic: string }>;
  onStartMonitor: (groupName: string, config: ScalingConfig) => void;
}

export default function MonitorControl({ consumerGroups, onStartMonitor }: MonitorControlProps) {
  const [selectedGroup, setSelectedGroup] = useState('');
  const [minReplicas, setMinReplicas] = useState('1');
  const [maxReplicas, setMaxReplicas] = useState('10');
  const [scalingFactor, setScalingFactor] = useState('1000');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup) return;

    setIsLoading(true);
    await onStartMonitor(selectedGroup, {
      minReplicas: parseInt(minReplicas),
      maxReplicas: parseInt(maxReplicas),
      scalingFactor: parseInt(scalingFactor),
    });
    setIsLoading(false);
    
    // Reset form
    setSelectedGroup('');
    setMinReplicas('1');
    setMaxReplicas('10');
    setScalingFactor('1000');
  };

  const dropdownOptions = consumerGroups.map(group => ({
    value: group.name,
    label: group.name
  }));

  return (
    <div className="backdrop-blur-xl bg-white/10 rounded-xl p-6 border border-white/20 shadow-lg relative z-50 overflow-visible">
      <h2 className="text-xl font-semibold text-white mb-6">Monitor Control</h2>
      
      <form onSubmit={handleSubmit} className="flex items-end gap-4 overflow-visible">
        <div className="flex-1 relative z-50 overflow-visible">
          <label className="block text-sm text-white/70 mb-2">Consumer Group</label>
          <CustomDropdown
            value={selectedGroup}
            onChange={setSelectedGroup}
            options={dropdownOptions}
            placeholder="Select a consumer group"
          />
        </div>

        <div className="flex-1">
          <label className="block text-sm text-white/70 mb-2">Min Replicas</label>
          <input
            type="number"
            value={minReplicas}
            onChange={(e) => setMinReplicas(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-white/40 transition-colors"
            required
          />
        </div>

        <div className="flex-1">
          <label className="block text-sm text-white/70 mb-2">Max Replicas</label>
          <input
            type="number"
            value={maxReplicas}
            onChange={(e) => setMaxReplicas(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-white/40 transition-colors"
            required
          />
        </div>

        <div className="flex-1">
          <label className="block text-sm text-white/70 mb-2">Scaling Factor</label>
          <input
            type="number"
            value={scalingFactor}
            onChange={(e) => setScalingFactor(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-white/40 transition-colors"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !selectedGroup}
          className="px-6 py-2 rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 hover:bg-emerald-500/30 hover:border-emerald-400/60 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-emerald-400/40 border-t-emerald-400 rounded-full animate-spin" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          Start Monitor
        </button>
      </form>
    </div>
  );
} 