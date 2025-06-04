import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import LagTimeline from '../components/LagTimeline';
import MonitorControl from '../components/MonitorControl';
import ActiveMonitors, { Monitor } from '../components/ActiveMonitors';
import ConfirmDialog from '../components/ConfirmDialog';
import ErrorModal from '../components/ErrorModal';
import axios from 'axios';
import ClusterSidebar from '../components/ClusterSidebar';
import type { Cluster } from '../components/ClusterSidebar';

// Utility to generate mock timeline points
const generateMockTimelineData = (hours: number, peakPercentage: number = 0.7) => {
  const now = Date.now();
  const points = [];
  const totalPoints = hours * 12; // 12 points per hour (5-minute intervals)
  const peakPoint = Math.floor(totalPoints * peakPercentage); // Peak at specified percentage
  const maxLag = 1000 + Math.random() * 500; // Random max between 1000-1500
  
  for (let i = 0; i < totalPoints; i++) {
    let lag: number;
    
    if (i <= peakPoint) {
      // Continuous upward trend with slight variations
      const progress = i / peakPoint;
      lag = Math.floor(maxLag * progress + (Math.random() - 0.5) * 50);
    } else {
      // Faster drop-off after peak
      const dropProgress = (i - peakPoint) / (totalPoints - peakPoint);
      const dropFactor = Math.pow(1 - dropProgress, 0.5); // Faster drop using square root
      lag = Math.floor(maxLag * dropFactor + (Math.random() - 0.5) * 30);
    }
    
    // Ensure lag is never negative
    lag = Math.max(0, lag);
    
    points.push({
      timestamp: now - (hours * 3600000) + (i * 300000),
      lag
    });
  }
  return points;
};

// Cluster-specific mock datasets
interface ClusterDashboardData {
  consumerGroups: any[];
  timelineSeries: any[];
}

const buildConsumerGroups = () => ([
  {
    id: 1,
    name: 'payment-processor',
    topic: 'transactions',
    partition: 0,
    currentOffset: 1250345 + Math.floor(Math.random() * 1000),
    logEndOffset: 1250367 + Math.floor(Math.random() * 1000),
    lag: Math.floor(Math.random() * 500),
    status: ['healthy', 'warning', 'critical'][Math.floor(Math.random() * 3)] as 'healthy' | 'warning' | 'critical'
  },
  {
    id: 2,
    name: 'notification-service',
    topic: 'user-events',
    partition: 1,
    currentOffset: 890123 + Math.floor(Math.random() * 1000),
    logEndOffset: 890123 + Math.floor(Math.random() * 1000),
    lag: Math.floor(Math.random() * 200),
    status: ['healthy', 'warning', 'critical'][Math.floor(Math.random() * 3)] as 'healthy' | 'warning' | 'critical'
  },
  {
    id: 3,
    name: 'analytics-pipeline',
    topic: 'user-activity',
    partition: 2,
    currentOffset: 2345678 + Math.floor(Math.random() * 1000),
    logEndOffset: 2345978 + Math.floor(Math.random() * 1000),
    lag: Math.floor(Math.random() * 800),
    status: ['healthy', 'warning', 'critical'][Math.floor(Math.random() * 3)] as 'healthy' | 'warning' | 'critical'
  }
]);

const buildTimelineSeries = () => [
  {
    groupName: 'payment-processor',
    topic: 'transactions',
    data: generateMockTimelineData(24, 0.5),
    peakPercentage: 0.5
  },
  {
    groupName: 'notification-service',
    topic: 'user-events',
    data: generateMockTimelineData(24, 0.7),
    peakPercentage: 0.7
  },
  {
    groupName: 'analytics-pipeline',
    topic: 'user-activity',
    data: generateMockTimelineData(24, 0.85),
    peakPercentage: 0.85
  }
];

const clusterData: Record<string, ClusterDashboardData> = {
  prod: {
    consumerGroups: buildConsumerGroups(),
    timelineSeries: buildTimelineSeries(),
  },
  stage: {
    consumerGroups: buildConsumerGroups(),
    timelineSeries: buildTimelineSeries(),
  },
  dev: {
    consumerGroups: buildConsumerGroups(),
    timelineSeries: buildTimelineSeries(),
  },
};

const clusters: Cluster[] = [
  { id: 'prod', name: 'Prod Cluster', status: 'healthy' },
  { id: 'stage', name: 'Stage Cluster', status: 'warning' },
  { id: 'dev', name: 'Dev Cluster', status: 'critical' },
];

export default function Dashboard() {
  const { selectedGroup, setSelectedGroup } = useApp();
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h'>('6h');
  const [monitorsByCluster, setMonitorsByCluster] = useState<Record<string, Monitor[]>>({});
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; groupName: string }>({ isOpen: false, groupName: '' });
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean; title: string; message: string }>({ isOpen: false, title: '', message: '' });
  const [selectedClusterId, setSelectedClusterId] = useState<string | null>(clusters[0].id);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [monitorModalOpen, setMonitorModalOpen] = useState(false);

  const monitors = monitorsByCluster[selectedClusterId as string] || [];

  const handleStartMonitor = async (groupName: string, lagThreshold: number) => {
    try {
      const response = await axios.post('http://localhost:3001/api/service/start', {
        groupName,
        lagThreshold,
        topicName: 'fake-topic-placeholder' // Static fake value as requested
      });

      if (response.status === 200) {
        // Add new monitor to the list
        const newMonitor: Monitor = {
          id: Date.now().toString(),
          groupName,
          lagThreshold,
          startTime: new Date(),
          status: 'running',
          currentReplicaCount: 1 // Default starting replica count
        };
        setMonitorsByCluster(prev => ({
          ...prev,
          [selectedClusterId as string]: [...(prev[selectedClusterId as string] || []), newMonitor]
        }));
        setMonitorModalOpen(false);
      }
    } catch (error) {
      const errorMessage = axios.isAxiosError(error) 
        ? error.response?.data?.message || 'An error occurred while starting the monitor. Please try again.'
        : 'An unexpected error occurred. Please try again.';
      
      setMonitorModalOpen(false);
      setErrorModal({
        isOpen: true,
        title: 'Failed to Start Monitor',
        message: errorMessage
      });
    }
  };

  const handleStopMonitor = (groupName: string) => {
    setConfirmDialog({ isOpen: true, groupName });
  };

  const confirmStopMonitor = async () => {
    const groupName = confirmDialog.groupName;
    setConfirmDialog({ isOpen: false, groupName: '' });

    try {
      const response = await axios.post('http://localhost:3001/api/service/stop', {
        groupName,
        topicName: 'fake-topic-placeholder' // Static fake value as requested
      });

      if (response.status === 200) {
        // Remove monitor from the list
        setMonitorsByCluster(prev => ({
          ...prev,
          [selectedClusterId as string]: (prev[selectedClusterId as string] || []).filter(m => m.groupName !== groupName)
        }));
      }
    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || 'An error occurred while stopping the monitor. Please try again.'
        : 'An unexpected error occurred. Please try again.';

      setErrorModal({
        isOpen: true,
        title: 'Failed to Stop Monitor',
        message: errorMessage
      });
    }
  };

  return (
    <div className="flex gap-6">
      <ClusterSidebar
        clusters={clusters}
        selectedClusterId={selectedClusterId}
        onSelect={setSelectedClusterId}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />
      <div className="flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Stats Cards removed */}

          {/* Monitor Control removed (moved to modal) */}

          {/* Active Monitors */}
          <div className="col-span-1 lg:col-span-4">
            <ActiveMonitors
              monitors={monitors}
              onStopMonitor={handleStopMonitor}
              onAddMonitor={() => setMonitorModalOpen(true)}
            />
          </div>

          {/* Lag Timeline */}
          <div className="col-span-1 lg:col-span-4">
            <LagTimeline
              series={clusterData[selectedClusterId as string].timelineSeries}
              timeRange={timeRange}
              onTimeRangeChange={setTimeRange}
            />
          </div>

          {/* Consumer Groups Table */}
          <div className="col-span-1 lg:col-span-4">
            <div className="backdrop-blur-xl bg-white/10 rounded-xl p-6 border border-white/20 shadow-lg">
              <h2 className="text-xl font-semibold text-white mb-6">Consumer Groups</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-white/70 text-sm">
                      <th className="text-left pb-4">Status</th>
                      <th className="text-left pb-4">Group Name</th>
                      <th className="text-left pb-4">Topic</th>
                      <th className="text-left pb-4">Partition</th>
                      <th className="text-right pb-4">Current Offset</th>
                      <th className="text-right pb-4">Log End Offset</th>
                      <th className="text-right pb-4">Lag</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clusterData[selectedClusterId as string].consumerGroups.map((group) => (
                      <tr 
                        key={group.id}
                        className="border-t border-white/10 hover:bg-white/5 cursor-pointer transition-colors"
                        onClick={() => setSelectedGroup(group)}
                      >
                        <td className="py-4">
                          {group.status === 'healthy' && (
                            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                          )}
                          {group.status === 'warning' && (
                            <AlertCircle className="h-5 w-5 text-amber-400" />
                          )}
                          {group.status === 'critical' && (
                            <AlertCircle className="h-5 w-5 text-rose-400" />
                          )}
                        </td>
                        <td className="py-4 text-white">{group.name}</td>
                        <td className="py-4 text-white/80">{group.topic}</td>
                        <td className="py-4 text-white/80">{group.partition}</td>
                        <td className="py-4 text-right text-white/80">
                          {group.currentOffset.toLocaleString()}
                        </td>
                        <td className="py-4 text-right text-white/80">
                          {group.logEndOffset.toLocaleString()}
                        </td>
                        <td className={`py-4 text-right font-semibold ${
                          group.lag === 0 
                            ? 'text-emerald-400' 
                            : group.lag > 100 
                              ? 'text-rose-400' 
                              : 'text-amber-400'
                        }`}>
                          {group.lag.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Confirmation Dialog */}
          <ConfirmDialog
            isOpen={confirmDialog.isOpen}
            title="Stop Monitor"
            message={`Are you sure you want to stop monitoring ${confirmDialog.groupName}?`}
            confirmText="Stop Monitor"
            onConfirm={confirmStopMonitor}
            onCancel={() => setConfirmDialog({ isOpen: false, groupName: '' })}
          />

          {/* Error Modal */}
          <ErrorModal
            isOpen={errorModal.isOpen}
            title={errorModal.title}
            message={errorModal.message}
            onClose={() => setErrorModal({ isOpen: false, title: '', message: '' })}
          />
        </div>
      </div>

      {monitorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-3xl">
            <MonitorControl
              consumerGroups={clusterData[selectedClusterId as string].consumerGroups}
              onStartMonitor={handleStartMonitor}
            />
            <button
              onClick={() => setMonitorModalOpen(false)}
              className="mt-4 w-full py-2 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}