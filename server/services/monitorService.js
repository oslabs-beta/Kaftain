// Orchestrates background monitoring and scaling logic for consumer groups.

import { fetchLagData } from './lagService.js';
import { scaleDeployment } from './scalingService.js';
import MonitorRecord from '../models/MonitorRecord.js';
import sequelize from '../config/db.js';
import LagRecord from '../models/LagRecord.js';
import ClusterConfig from '../models/ClusterConfig.js';

let monitorInterval = null; // Holds the current interval ID for the monitoring loop
const monitorMap = {}; // Maps intervalId to monitorRecordId for tracking

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
      // Compute maximum lag from the relevantLag array
      const maxLag = Math.max(...relevantLag.map((lag) => lag.lag));
      console.debug('[MonitorService] Max lag computed', { maxLag });

      // Store a single LagRecord containing the maximum lag value
      await LagRecord.create({
        group: groupName,
        topic: topicName,
        lag: maxLag,
        timestamp: new Date(),
      });
      console.debug('[MonitorService] Max lag record saved');

      // Invoke scaleDeployment, passing in maxLag, config, and the MonitorRecord id
      console.debug('[MonitorService] Invoking scaleDeployment');
      await scaleDeployment(maxLag, config, monitorRecord.id);
      console.debug('[MonitorService] scaleDeployment complete');
    }
  };

  // 3. Run the monitor function immediately on start
  monitor();

  // 4. Set up the interval to run the monitor function repeatedly
  const intervalId = setInterval(monitor, interval);

  // 5. Track the mapping from intervalId to monitorRecordId for later reference
  monitorMap[intervalId] = monitorRecord.id;
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
