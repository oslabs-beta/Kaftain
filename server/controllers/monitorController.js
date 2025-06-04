// Handles HTTP requests to start and stop the monitoring service.
import { startMonitor, stopMonitor } from '../services/monitorService.js';
const testClusterId = 1; // take out later
export function startMonitorHttp(req, res) {
  const { groupName, topicName, interval, config } = req.body;
  const clusterId = req.body.clusterId || testClusterId; // combine with line above after testing
  startMonitor({ groupName, topicName, interval, config, clusterId });
  res.status(200).json({ message: 'Monitor started' });
}

export function stopMonitorHttp(req, res) {
  stopMonitor();
  res.status(200).json({ message: 'Monitor stopped' });
}
