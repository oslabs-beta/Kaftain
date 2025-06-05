// Orchestrates background monitoring and scaling logic for consumer groups.

import { fetchLagData } from './lagService.js';
import { scaleDeployment } from './scalingService.js';
import MonitorRecord from '../models/MonitorRecord.js';
import sequelize from '../config/db.js';
import LagRecord from '../models/LagRecord.js';
import ClusterConfig from '../models/ClusterConfig.js';

let monitorInterval = null; // Holds the current interval ID for the monitoring loop
// Maps intervalId -> monitorRecordId, and groupClusterKey -> intervalId
const monitorMap = {};
const groupToInterval = {};

// Helper to build a unique key for a consumer group in a cluster
function buildKey(groupName, clusterId) {
  return `${clusterId}:${groupName}`;
}

// Starts the background monitor for a specific consumer group
export async function startMonitor({
  groupName,
  topicName,
  interval = 20000,
  config,
  clusterId,
}) {
  // Clear any existing monitor interval before starting a new one
  if (monitorInterval) clearInterval(monitorInterval);

  // 1. Create a MonitorRecord in the database (transactional)
  let monitorRecord;
  const transaction = await sequelize.transaction();
  try {
    monitorRecord = await MonitorRecord.create(
      {
        clusterId: clusterId,
        group: groupName,
        topic: topicName,
        status: 'active',
        startedAt: new Date(),
        configSnapshot: config,
      },
      { transaction }
    );
    await transaction.commit();
  } catch (err) {
    await transaction.rollback();
    throw err;
  }

  // 2. Define the monitoring function to run on each interval
  const monitor = async () => {
    // Query the ClusterConfig to get the URL using clusterId
    const clusterConfig = await ClusterConfig.findByPk(clusterId);
    if (!clusterConfig) {
      console.error(`Cluster config not found for clusterId: ${clusterId}`);
      return;
    }
    const url = clusterConfig.url || 'http://52.52.97.230:9308/metrics'; // Get URL from cluster configuration

    // Fetch lag data from Kafka exporter using the URL from ClusterConfig
    const consumerGroupName = 'test-consumer-static-value'; // TODO: Replace with dynamic value if needed
    const lagData = await fetchLagData(url, consumerGroupName);

    // Filter lag data for the specified consumer group (and topic, if provided)
    const relevantLag = lagData.filter(
      (lag) =>
        lag.group === groupName && (!topicName || lag.topic === topicName)
    );

    if (relevantLag.length) {
      // Compute the lag object with the maximum lag value
      const maxLagObj = relevantLag.reduce((maxObj, curr) => {
        return (!maxObj || curr.lag > maxObj.lag) ? curr : maxObj;
      }, null);
      
      console.debug('[MonitorService] Max lag object computed', { maxLagObj });
    
      // Store a LagRecord using the entire maxLagObj details

      console.log('maxLagObj', maxLagObj);
      await LagRecord.create({
        group: groupName,
        topic: maxLagObj.topic, // now using topic from maxLagObj directly
        lag: maxLagObj.lag,
        timestamp: new Date(),
        clusterId: clusterId,
      });
      console.debug('[MonitorService] Max lag record saved');

      // Invoke scaleDeployment, passing in maxLag, config, and the MonitorRecord id
      console.debug('[MonitorService] Invoking scaleDeployment');
      await scaleDeployment(maxLagObj.lag, config, monitorRecord.id, groupName, maxLagObj.topic);
      console.debug('[MonitorService] scaleDeployment complete');
    }
  };

  // 3. Run the monitor function immediately on start
  monitor();

  // 4. Set up the interval to run the monitor function repeatedly
  const intervalId = setInterval(monitor, interval);

  // 5. Track the mappings for later reference
  monitorMap[intervalId] = monitorRecord.id;
  groupToInterval[buildKey(groupName, clusterId)] = intervalId;
  monitorInterval = intervalId;
}

// Stops the background monitor if running
export async function stopMonitor(intervalId) {
  // 1. Clear the interval to stop monitoring
  clearInterval(intervalId);

  // 2. Get the associated monitorRecordId from the map
  const monitorRecordId = monitorMap[intervalId];
  if (monitorRecordId) {
    // 3. Update the MonitorRecord in the database to mark as stopped (transactional)
    const transaction = await sequelize.transaction();
    try {
      await MonitorRecord.update(
        { status: 'stopped', stoppedAt: new Date() },
        { where: { id: monitorRecordId }, transaction }
      );
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
    // 4. Remove the mapping for this interval
    delete monitorMap[intervalId];
  }
  // 5. Reset the monitorInterval variable
  monitorInterval = null;
}

// Stop monitor by group & cluster
export function stopMonitorByGroup(groupName, clusterId) {
  const key = buildKey(groupName, clusterId);
  const intervalId = groupToInterval[key];
  if (intervalId) {
    stopMonitor(intervalId);
    delete groupToInterval[key];
  }
}

// List active monitor records helper (may be used by controller)
export async function listActiveMonitors(clusterId) {
  const where = { status: 'active' };
  if (clusterId) where.clusterId = clusterId;
  return MonitorRecord.findAll({ where });
}

// Helper to stop all monitors for a given clusterId (used when deleting a cluster)
export function stopMonitorsByCluster(clusterId) {
  // Iterate over all keys in groupToInterval and stop those that match the clusterId
  Object.entries(groupToInterval).forEach(([key, intervalId]) => {
    if (key.startsWith(`${clusterId}:`)) {
      stopMonitor(intervalId);
      delete groupToInterval[key];
    }
  });
}
