import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import LagTimeline from '../components/LagTimeline';
import MonitorControl from '../components/MonitorControl';
import ActiveMonitors, { Monitor } from '../components/ActiveMonitors';
import ConfirmDialog from '../components/ConfirmDialog';
import ErrorModal from '../components/ErrorModal';
import axios from 'axios';
import ClusterSidebar from '../components/ClusterSidebar';
import type { Cluster } from '../components/ClusterSidebar';
import AddClusterModal from '../components/AddClusterModal.tsx';

// -----------------------------
// State that will hold live data fetched from the backend
// -----------------------------
interface ConsumerGroupRow {
  id: string;
  name: string;
  topic: string;
  partition: number; // unknown for now
  currentOffset?: number; // not available yet
  logEndOffset?: number;
  lag: number;
  status: 'healthy' | 'warning' | 'critical';
}

interface TimelineSeriesItem {
  groupName: string;
  topic: string;
  data: { timestamp: number; lag: number }[];
}

// Fetch clusters from backend on initial load
const fetchInitialClusters = async (setClusters: React.Dispatch<React.SetStateAction<Cluster[]>>, setSelectedClusterId: React.Dispatch<React.SetStateAction<string | null>>) => {
  try {
    const { data } = await axios.get('/api/cluster-config');
    const mapped: Cluster[] = data.map((c: any) => ({
      id: c.id.toString(),
      name: c.clusterName ?? `Cluster ${c.id}`,
      // TODO: derive real health status once backend provides it
      status: 'healthy',
    }));
    setClusters(mapped);
    if (mapped.length) setSelectedClusterId(mapped[0].id);
  } catch (err) {
    console.error('Error fetching clusters', err);
  }
};

export default function Dashboard() {
  const { selectedGroup, setSelectedGroup } = useApp();
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h'>('6h');
  const [monitorsByCluster, setMonitorsByCluster] = useState<Record<string, Monitor[]>>({});
  const [consumerGroups, setConsumerGroups] = useState<ConsumerGroupRow[]>([]);
  const [timelineSeries, setTimelineSeries] = useState<TimelineSeriesItem[]>([]);
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean; title: string; message: string }>({ isOpen: false, title: '', message: '' });
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [addClusterModalOpen, setAddClusterModalOpen] = useState(false);
  const [selectedClusterId, setSelectedClusterId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [monitorModalOpen, setMonitorModalOpen] = useState(false);
  const [deleteClusterDialog, setDeleteClusterDialog] = useState<{ isOpen: boolean; clusterId: string; clusterName: string }>({ isOpen: false, clusterId: '', clusterName: '' });
  const [modalConsumerGroups, setModalConsumerGroups] = useState<Array<{ name: string; topic: string }>>([]);
  const [deleteMonitorDialog, setDeleteMonitorDialog] = useState<{ isOpen: boolean; monitor: Monitor | null }>({
    isOpen: false,
    monitor: null,
  });

  const monitors = selectedClusterId ? (monitorsByCluster[selectedClusterId] || []) : [];

  const handleStartMonitor = async (groupName: string, config: { minReplicas: number; maxReplicas: number; scalingFactor: number; }) => {
    try {
      if (!selectedClusterId) return;
      const response = await axios.post('/api/service/start', {
        groupName,
        clusterId: parseInt(selectedClusterId!, 10),
        config
      });

      if (response.status === 200) {
        // Refresh monitors list from backend
        fetchMonitors();
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

  // Pause monitor
  const handlePauseMonitor = async (monitor: Monitor) => {
    if (!selectedClusterId) return;

    // Optimistically update UI
    setMonitorsByCluster(prev => {
      const list: Monitor[] = prev[selectedClusterId] || [];
      const updated: Monitor[] = list.map((m): Monitor => (
        m.id === monitor.id ? { ...m, status: 'inactive' } as Monitor : m
      ));
      return { ...prev, [selectedClusterId]: updated } as Record<string, Monitor[]>;
    });

    try {
      await axios.post('/api/service/stop', {
        groupName: monitor.groupName,
        clusterId: parseInt(selectedClusterId, 10),
      });
      fetchMonitors();
    } catch (err) {
      console.error('Failed to pause monitor', err);
    }
  };

  // Resume monitor
  const handleResumeMonitor = async (monitor: Monitor) => {
    if (!selectedClusterId) return;

    // Optimistic UI update
    setMonitorsByCluster(prev => {
      const list: Monitor[] = prev[selectedClusterId] || [];
      const updated: Monitor[] = list.map((m): Monitor => (
        m.id === monitor.id ? { ...m, status: 'running' } as Monitor : m
      ));
      return { ...prev, [selectedClusterId]: updated } as Record<string, Monitor[]>;
    });

    try {
      await axios.post('/api/service/start', {
        groupName: monitor.groupName,
        clusterId: parseInt(selectedClusterId, 10),
        config: {},
      });
      fetchMonitors();
    } catch (err) {
      console.error('Failed to resume monitor', err);
    }
  };

  // Request delete monitor (opens confirm dialog)
  const handleRequestDeleteMonitor = (monitor: Monitor) => {
    setDeleteMonitorDialog({ isOpen: true, monitor });
  };

  // Confirm deletion after user approval
  const confirmDeleteMonitor = async () => {
    const { monitor } = deleteMonitorDialog;
    if (!monitor) return;

    // Close dialog first to give instant feedback
    setDeleteMonitorDialog({ isOpen: false, monitor: null });

    try {
      await axios.delete(`/api/service/monitors/${monitor.id}`);
      fetchMonitors();
    } catch (err) {
      console.error('Failed to delete monitor', err);
      setErrorModal({
        isOpen: true,
        title: 'Failed to Delete Monitor',
        message: 'There was an error deleting the monitor. Please try again.',
      });
    }
  };

  // Fetch monitors from backend
  const fetchMonitors = async () => {
    try {
      if (!selectedClusterId) return;
      const { data } = await axios.get('/api/service/monitors', {
        params: { clusterId: parseInt(selectedClusterId!, 10) }
      });
      // Map to UI Monitor type
      const mapped: Monitor[] = data.map((m: any) => ({
        id: m.id.toString(),
        groupName: m.group,
        startTime: new Date(m.startedAt),
        status: m.status === 'active' ? 'running' : 'inactive',
        currentReplicaCount: m.currentReplicaCount || 1,
      }));
      setMonitorsByCluster(prev => ({ ...prev, [selectedClusterId]: mapped }));
    } catch (err) {
      console.error('Error fetching monitors', err);
    }
  };

  // Fetch lag records
  const fetchLagRecords = async () => {
    try {
      if (!selectedClusterId) return;
      const { data } = await axios.get('/api/lag/records', {
        params: { clusterId: parseInt(selectedClusterId!, 10), range: timeRange }
      });

      // 1. Build consumerGroups table (latest lag per group/topic)
      const latestPerGroup: Record<string, any> = {};
      data.forEach((rec: any) => {
        const key = `${rec.group}:${rec.topic}`;
        if (!latestPerGroup[key] || new Date(rec.timestamp).getTime() > new Date(latestPerGroup[key].timestamp).getTime()) {
          latestPerGroup[key] = rec;
        }
      });

      const groups: ConsumerGroupRow[] = Object.values(latestPerGroup).map((rec: any, idx: number) => {
        const lag = rec.lag;
        let status: 'healthy' | 'warning' | 'critical' = 'healthy';
        if (lag === 0) status = 'healthy';
        else if (lag > 100) status = 'critical';
        else status = 'warning';

        return {
          id: idx.toString(),
          name: rec.group,
          topic: rec.topic,
          partition: 0,
          lag,
          status,
        };
      });
      setConsumerGroups(groups);

      // 2. Build timelineSeries for chart
      const seriesMap: Record<string, TimelineSeriesItem> = {};
      data.forEach((rec: any) => {
        const key = `${rec.group}:${rec.topic}`;
        if (!seriesMap[key]) {
          seriesMap[key] = { groupName: rec.group, topic: rec.topic, data: [] } as TimelineSeriesItem;
        }
        seriesMap[key].data.push({ timestamp: new Date(rec.timestamp).getTime(), lag: rec.lag });
      });

      // sort data chronologically
      const seriesArr = Object.values(seriesMap).map(s => {
        s.data.sort((a, b) => a.timestamp - b.timestamp);
        return s;
      });

      setTimelineSeries(seriesArr);
    } catch (err) {
      console.error('Error fetching lag records', err);
    }
  };

  // Poll every 30s
  useEffect(() => {
    if (!selectedClusterId) return;
    fetchMonitors();
    fetchLagRecords();
    const id = setInterval(() => {
      fetchMonitors();
      fetchLagRecords();
    }, 1000);
    return () => clearInterval(id);
  }, [selectedClusterId, timeRange]);

  // Initial clusters load
  useEffect(() => {
    fetchInitialClusters(setClusters, setSelectedClusterId);
  }, []);

  // Handle add cluster
  const handleAddCluster = async (name: string, url: string) => {
    try {
      // Send the same POST request as before
      await axios.post('/api/cluster-config', { clusterName: name, url });

      // NEW: Immediately fetch the updated cluster list so the sidebar re-renders with fresh data
      const { data } = await axios.get('/api/cluster-config');
      const refreshed: Cluster[] = data.map((c: any) => ({
        id: c.id.toString(),
        name: c.clusterName ?? `Cluster ${c.id}`,
        status: 'healthy', // TODO: replace once backend exposes real status
      }));
      setClusters(refreshed);

      // Automatically select the newly added cluster (last in refreshed list)
      if (refreshed.length) {
        setSelectedClusterId(refreshed[refreshed.length - 1].id);
      }

      // Close the modal
      setAddClusterModalOpen(false);
    } catch (err) {
      console.error('Failed to add cluster', err);
      alert('Failed to add cluster');
    }
  };

  const handleRequestDeleteCluster = (id: string, name: string) => {
    setDeleteClusterDialog({ isOpen: true, clusterId: id, clusterName: name });
  };

  const confirmDeleteCluster = async () => {
    const { clusterId } = deleteClusterDialog;
    setDeleteClusterDialog({ ...deleteClusterDialog, isOpen: false });

    try {
      await axios.delete(`/api/cluster-config/${clusterId}`);

      // If the deleted cluster was currently selected, clear the selection so we don't hold a stale ID
      setSelectedClusterId((prev) => (prev === clusterId ? null : prev));

      // Refresh clusters list
      await fetchInitialClusters(setClusters, setSelectedClusterId);
    } catch (err) {
      console.error('Failed to delete cluster', err);
      alert('Failed to delete cluster');
    }
  };

  // Open monitor modal and fetch consumer groups for the selected cluster
  const openMonitorModal = async () => {
    if (!selectedClusterId) {
      setErrorModal({
        isOpen: true,
        title: 'No Cluster Selected',
        message: 'Please select a cluster before adding a monitor.',
      });
      return;
    }
    try {
      const { data } = await axios.get('/api/consumer-groups', {
        params: { clusterId: parseInt(selectedClusterId, 10) },
      });
      const groups: string[] = data.consumerGroups || [];
      setModalConsumerGroups(groups.map((g) => ({ name: g, topic: '' })));
      setMonitorModalOpen(true);
    } catch (err) {
      console.error('Failed to fetch consumer groups', err);
      setErrorModal({ isOpen: true, title: 'Error', message: 'Failed to load consumer groups for monitor.' });
    }
  };

  return (
    <div className="flex gap-6">
      <ClusterSidebar
        clusters={clusters}
        selectedClusterId={selectedClusterId}
        onSelect={(id) => setSelectedClusterId(id)}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        onAddCluster={() => setAddClusterModalOpen(true)}
        onDeleteCluster={handleRequestDeleteCluster}
      />
      <div className="flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Stats Cards removed */}

          {/* Monitor Control removed (moved to modal) */}

          {/* Active Monitors */}
          <div className="col-span-1 lg:col-span-4">
            <ActiveMonitors
              monitors={monitors}
              onPauseMonitor={handlePauseMonitor}
              onResumeMonitor={handleResumeMonitor}
              onDeleteMonitor={handleRequestDeleteMonitor}
              onAddMonitor={openMonitorModal}
            />
          </div>

          {/* Lag Timeline */}
          <div className="col-span-1 lg:col-span-4">
            <LagTimeline
              series={timelineSeries}
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
                      <th className="text-left pb-4">Group Name</th>
                      <th className="text-right pb-4">Lag</th>
                    </tr>
                  </thead>
                  <tbody>
                    {consumerGroups.map((group) => (
                      <tr 
                        key={group.id}
                        className="border-t border-white/10 hover:bg-white/5 cursor-pointer transition-colors"
                        onClick={() => setSelectedGroup(group)}
                      >
                        <td className="py-4 text-white">{group.name}</td>
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

          {/* Error Modal */}
          <ErrorModal
            isOpen={errorModal.isOpen}
            title={errorModal.title}
            message={errorModal.message}
            onClose={() => setErrorModal({ isOpen: false, title: '', message: '' })}
          />

          {/* Delete Cluster Confirm Dialog */}
          <ConfirmDialog
            isOpen={deleteClusterDialog.isOpen}
            title="Delete Cluster"
            message={`Are you sure you want to delete ${deleteClusterDialog.clusterName}? This will also remove all monitors, lag, and scaling records for this cluster.`}
            confirmText="Delete Cluster"
            onConfirm={confirmDeleteCluster}
            onCancel={() => setDeleteClusterDialog({ ...deleteClusterDialog, isOpen: false })}
          />

          {/* Delete Monitor Confirm Dialog */}
          <ConfirmDialog
            isOpen={deleteMonitorDialog.isOpen}
            title="Delete Monitor"
            message={`Are you sure you want to delete the monitor for ${deleteMonitorDialog.monitor?.groupName ?? ''}? This action cannot be undone.`}
            confirmText="Delete Monitor"
            onConfirm={confirmDeleteMonitor}
            onCancel={() => setDeleteMonitorDialog({ isOpen: false, monitor: null })}
          />
        </div>
      </div>

      {monitorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-3xl">
            <MonitorControl
              consumerGroups={modalConsumerGroups}
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

      {/* Add Cluster Modal */}
      {addClusterModalOpen && (
        <AddClusterModal
          isOpen={addClusterModalOpen}
          onClose={() => setAddClusterModalOpen(false)}
          onAdd={handleAddCluster}
        />
      )}
    </div>
  );
}