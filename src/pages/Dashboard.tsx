import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  LineChart, 
  ArrowDownToLine, 
  AlertCircle, 
  CheckCircle2,
  Activity,
  Database,
  Server,
  Cloud
} from 'lucide-react';
import LagTimeline from '../components/LagTimeline';

// Mock data for demonstration
const consumerGroups = [
  {
    id: 1,
    name: 'payment-processor',
    topic: 'transactions',
    partition: 0,
    currentOffset: 1250345,
    logEndOffset: 1250367,
    lag: 22,
    status: 'warning'
  },
  {
    id: 2,
    name: 'notification-service',
    topic: 'user-events',
    partition: 1,
    currentOffset: 890123,
    logEndOffset: 890123,
    lag: 0,
    status: 'healthy'
  },
  {
    id: 3,
    name: 'analytics-pipeline',
    topic: 'user-activity',
    partition: 2,
    currentOffset: 2345678,
    logEndOffset: 2345978,
    lag: 300,
    status: 'critical'
  }
];

// Mock lag timeline data
const generateMockTimelineData = (hours: number) => {
  const now = Date.now();
  const points = [];
  for (let i = 0; i < hours * 12; i++) {
    points.push({
      timestamp: now - (hours * 3600000) + (i * 300000),
      lag: Math.floor(Math.random() * 1000)
    });
  }
  return points;
};

const mockTimelineSeries = [
  {
    groupName: 'payment-processor',
    topic: 'transactions',
    data: generateMockTimelineData(24)
  },
  {
    groupName: 'notification-service',
    topic: 'user-events',
    data: generateMockTimelineData(24)
  },
  {
    groupName: 'analytics-pipeline',
    topic: 'user-activity',
    data: generateMockTimelineData(24)
  }
];

// Mock cluster information
const kafkaClusterInfo = {
  clusterName: 'prod-kafka-cluster',
  brokerAddresses: ['10.0.1.100:9092', '10.0.1.101:9092', '10.0.1.102:9092'],
  zookeeperAddress: '10.0.1.50:2181',
  version: '3.5.1',
  totalTopics: 24,
  totalPartitions: 96,
  replicationFactor: 3
};

const kubernetesClusterInfo = {
  clusterName: 'prod-k8s-east',
  masterNode: '10.0.2.10',
  workerNodes: ['10.0.2.11', '10.0.2.12', '10.0.2.13'],
  version: '1.28.3',
  namespace: 'kafka-consumers',
  totalPods: 12,
  totalNodes: 4,
  region: 'us-east-1'
};

export default function Dashboard() {
  const { selectedGroup, setSelectedGroup } = useApp();
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h'>('6h');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Stats Cards */}
      <div className="col-span-1 lg:col-span-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="backdrop-blur-xl bg-white/10 rounded-xl p-6 border border-white/20 text-white/90 hover:text-gray-900 shadow-lg hover:bg-white/85 transition-all">
          <div className="flex items-center gap-3 mb-2">
            <Database className="h-5 w-5" />
            <h3 className="">Total Topics</h3>
          </div>
          <p className="text-3xl font-bold">3</p>
        </div>
        <div className="backdrop-blur-xl bg-white/10 rounded-xl p-6 border border-white/20 text-white/90 hover:text-gray-900 shadow-lg hover:bg-white/85 transition-all">
          <div className="flex items-center gap-3 mb-2">
            <ArrowDownToLine className="h-5 w-5" />
            <h3 className="">Messages/sec</h3>
          </div>
          <p className="text-3xl font-bold">1.2k</p>
        </div>
        <div className="backdrop-blur-xl bg-white/10 rounded-xl p-6 border border-white/20 text-white/90 hover:text-gray-900 shadow-lg hover:bg-white/85 transition-all">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="h-5 w-5" />
            <h3 className="">Active Consumers</h3>
          </div>
          <p className="text-3xl font-bold ">8</p>
        </div>
        <div className="backdrop-blur-xl bg-white/10 rounded-xl p-6 border border-white/20 text-white/90 hover:text-gray-900 shadow-lg hover:bg-white/85 transition-all">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="h-5 w-5" />
            <h3 className="">Alert Count</h3>
          </div>
          <p className="text-3xl font-bold">2</p>
        </div>
      </div>

      {/* Lag Timeline */}
      <div className="col-span-1 lg:col-span-4">
        <LagTimeline
          series={mockTimelineSeries}
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
                {consumerGroups.map((group) => (
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

      {/* Kafka Cluster Information */}
      <div className="col-span-1 lg:col-span-2">
        <div className="backdrop-blur-xl bg-white/10 rounded-xl p-6 border border-white/20 shadow-lg h-full">
          <div className="flex items-center gap-3 mb-6">
            <Server className="h-5 w-5 text-white" />
            <h2 className="text-xl font-semibold text-white">Kafka Cluster Info</h2>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-white/5 backdrop-blur-md border border-white/10">
                <h3 className="text-white/70 mb-2">Cluster Name</h3>
                <p className="text-white font-semibold">{kafkaClusterInfo.clusterName}</p>
              </div>
              <div className="p-4 rounded-lg bg-white/5 backdrop-blur-md border border-white/10">
                <h3 className="text-white/70 mb-2">Version</h3>
                <p className="text-white font-semibold">{kafkaClusterInfo.version}</p>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-white/5 backdrop-blur-md border border-white/10">
              <h3 className="text-white/70 mb-2">Broker Addresses</h3>
              <div className="space-y-1">
                {kafkaClusterInfo.brokerAddresses.map((address, index) => (
                  <p key={index} className="text-white font-mono text-sm">{address}</p>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-white/5 backdrop-blur-md border border-white/10">
                <h3 className="text-white/70 mb-2">Topics</h3>
                <p className="text-white font-semibold">{kafkaClusterInfo.totalTopics}</p>
              </div>
              <div className="p-4 rounded-lg bg-white/5 backdrop-blur-md border border-white/10">
                <h3 className="text-white/70 mb-2">Partitions</h3>
                <p className="text-white font-semibold">{kafkaClusterInfo.totalPartitions}</p>
              </div>
              <div className="p-4 rounded-lg bg-white/5 backdrop-blur-md border border-white/10">
                <h3 className="text-white/70 mb-2">Replication</h3>
                <p className="text-white font-semibold">{kafkaClusterInfo.replicationFactor}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Kubernetes Cluster Information */}
      <div className="col-span-1 lg:col-span-2">
        <div className="backdrop-blur-xl bg-white/10 rounded-xl p-6 border border-white/20 shadow-lg h-full">
          <div className="flex items-center gap-3 mb-6">
            <Cloud className="h-5 w-5 text-white" />
            <h2 className="text-xl font-semibold text-white">Kubernetes Cluster Info</h2>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-white/5 backdrop-blur-md border border-white/10">
                <h3 className="text-white/70 mb-2">Cluster Name</h3>
                <p className="text-white font-semibold">{kubernetesClusterInfo.clusterName}</p>
              </div>
              <div className="p-4 rounded-lg bg-white/5 backdrop-blur-md border border-white/10">
                <h3 className="text-white/70 mb-2">Version</h3>
                <p className="text-white font-semibold">{kubernetesClusterInfo.version}</p>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-white/5 backdrop-blur-md border border-white/10">
              <h3 className="text-white/70 mb-2">Master Node</h3>
              <p className="text-white font-mono text-sm">{kubernetesClusterInfo.masterNode}</p>
            </div>
            <div className="p-4 rounded-lg bg-white/5 backdrop-blur-md border border-white/10">
              <h3 className="text-white/70 mb-2">Worker Nodes</h3>
              <div className="space-y-1">
                {kubernetesClusterInfo.workerNodes.map((node, index) => (
                  <p key={index} className="text-white font-mono text-sm">{node}</p>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-white/5 backdrop-blur-md border border-white/10">
                <h3 className="text-white/70 mb-2">Total Pods</h3>
                <p className="text-white font-semibold">{kubernetesClusterInfo.totalPods}</p>
              </div>
              <div className="p-4 rounded-lg bg-white/5 backdrop-blur-md border border-white/10">
                <h3 className="text-white/70 mb-2">Total Nodes</h3>
                <p className="text-white font-semibold">{kubernetesClusterInfo.totalNodes}</p>
              </div>
              <div className="p-4 rounded-lg bg-white/5 backdrop-blur-md border border-white/10">
                <h3 className="text-white/70 mb-2">Region</h3>
                <p className="text-white font-semibold">{kubernetesClusterInfo.region}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}