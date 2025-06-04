// Handles HTTP requests to start and stop the monitoring service.
import { startMonitor, stopMonitor } from '../services/monitorService.js';

export function startMonitorHttp(req, res) {
  const { groupName, topicName, interval, config } = req.body;
  startMonitor({ groupName, topicName, interval, config, clusterId });
  res.status(200).json({ message: 'Monitor started' });
}

export function stopMonitorHttp(req, res) {
  stopMonitor();
  res.status(200).json({ message: 'Monitor stopped' });
}
