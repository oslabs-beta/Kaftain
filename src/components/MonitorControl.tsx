import React, { useState } from 'react';
import { Play } from 'lucide-react';
import CustomDropdown from './CustomDropdown';

interface MonitorControlProps {
  consumerGroups: Array<{ name: string; topic: string }>;
  onStartMonitor: (groupName: string, lagThreshold: number) => void;
}

export default function MonitorControl({ consumerGroups, onStartMonitor }: MonitorControlProps) {
  const [selectedGroup, setSelectedGroup] = useState('');
  const [lagThreshold, setLagThreshold] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup || !lagThreshold) return;

    setIsLoading(true);
    await onStartMonitor(selectedGroup, parseInt(lagThreshold));
    setIsLoading(false);
    
    // Reset form
    setSelectedGroup('');
    setLagThreshold('');
  };

  const handleLagThresholdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numeric input
    if (value === '' || /^\d+$/.test(value)) {
      setLagThreshold(value);
    }
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
          <label className="block text-sm text-white/70 mb-2">Lag Threshold (messages)</label>
          <input
            type="text"
            value={lagThreshold}
            onChange={handleLagThresholdChange}
            placeholder="e.g. 1000"
            className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-white/40 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !selectedGroup || !lagThreshold}
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