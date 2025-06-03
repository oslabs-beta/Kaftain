// Orchestrates background monitoring and scaling logic for consumer groups.

import { fetchLagData } from './lagService.js';
import { scaleDeployment } from './scalingService.js';
import MonitorRecord from '../models/monitorRecord.js';
import sequelize from '../config/db.js';
import LagRecord from '../models/lagRecord.js';

let monitorInterval = null; // Holds the current interval ID for the monitoring loop
const monitorMap = {}; // Maps intervalId to monitorRecordId for tracking

// Starts the background monitor for a specific consumer group
export async function startMonitor({
  groupName,
  topicName,
  interval = 20000,
  config,
}) {
  // Clear any existing monitor interval before starting a new one
  if (monitorInterval) clearInterval(monitorInterval);

  // 1. Create a MonitorRecord in the database (transactional)
  let monitorRecord;
  const transaction = await sequelize.transaction();
  try {
    monitorRecord = await MonitorRecord.create(
      {
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
    // Fetch lag data from Kafka exporter (TODO: make URL and group dynamic)
    const url = 'http://52.52.97.230:9308/metrics'; // TODO: Replace with dynamic value
    const consumerGroupName = 'test-consumer-static-value'; // TODO: Replace with dynamic value

    // Fetch current lag data
    const lagData = await fetchLagData(url, consumerGroupName);

    // Filter lag data for the specified consumer group (and topic, if provided)
    const relevantLag = lagData.filter(
      (lag) =>
        lag.group === groupName && (!topicName || lag.topic === topicName)
    );

    // Store only relevant lag data in DB
    if (relevantLag.length) {
      const lagRecords = relevantLag.map((lag) => ({
        group: lag.group,
        topic: lag.topic,
        lag: lag.lag,
        timestamp: new Date(),
      }));
      await LagRecord.bulkCreate(lagRecords);

      // If there is lag for this group/topic, determine the max lag and trigger scaling
      const maxLag = Math.max(...relevantLag.map((lag) => lag.lag));
      await scaleDeployment(maxLag, config);
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
