// Handles HTTP requests to start and stop the monitoring service.
import { startMonitor, stopMonitor } from '../services/monitorService.js';

export function startMonitorHttp(req, res) {
  const { groupName, topicName } = req.body;
  startMonitor({ groupName, topicName }); // maybe we can also add interval/config from req/body
  res.status(200).json({ message: 'Monitor started' });
}

export function stopMonitorHttp(req, res) {
  stopMonitor();
  res.status(200).json({ message: 'Monitor stopped' });
}
