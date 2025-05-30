// Orchestrates background monitoring and scaling logic for consumer groups.

import { fetchLagData } from './lagService.js';
import { scaleDeployment } from './scalingService.js';

let monitorInterval = null; // Holds the interval ID for the monitoring loop

// Starts the background monitor for a specific consumer group
export function startMonitor({
  groupName,
  topicName,
  interval = 20000,
  config,
}) {
  // Clear any existing monitor interval before starting a new one
  if (monitorInterval) clearInterval(monitorInterval);

  // Define the monitoring function to run on each interval
  const monitor = async () => {
    // 1. Fetch current lag data from Kafka exporter
    const lagData = await fetchLagData();

    // 2. Filter lag data for the specified consumer group (and topic, if provided)
    const relevantLag = lagData.filter(
      (lag) =>
        lag.group === groupName && (!topicName || lag.topic === topicName)
    );

    // 3. If there is lag for this group/topic, determine the max lag
    if (relevantLag.length) {
      const maxLag = Math.max(...relevantLag.map((lag) => lag.lag));

      // 4. Trigger scaling logic with the max lag value
      await scaleDeployment(maxLag, config);
    }
  };

  monitor(); // Run the monitor function immediately on start

  // 5. Set up the interval to run the monitor function repeatedly
  monitorInterval = setInterval(monitor, interval);
}

// Stops the background monitor if running
export function stopMonitor() {
  if (monitorInterval) clearInterval(monitorInterval);
  monitorInterval = null;
}
