// Handles HTTP requests to start and stop the monitoring service.
import { startMonitor, stopMonitor, stopMonitorByGroup } from '../services/monitorService.js';
import MonitorRecord from '../models/MonitorRecord.js';
import LagRecord from '../models/LagRecord.js';
import ScalingEvent from '../models/ScalingRecord.js';
import sequelize from '../config/db.js';
const testClusterId = 1; // take out later
export function startMonitorHttp(req, res) {
  const { groupName, topicName, interval, config } = req.body;
  const clusterId = req.body.clusterId || testClusterId; // combine with line above after testing
  startMonitor({ groupName, topicName, interval, config, clusterId });
  res.status(200).json({ message: 'Monitor started' });
}

export function stopMonitorHttp(req, res) {
  const { groupName, clusterId } = req.body;
  try {
    stopMonitorByGroup(groupName, clusterId);
    res.status(200).json({ message: `Monitor for ${groupName} stopped` });
  } catch (err) {
    console.error('Error stopping monitor', err);
    res.status(500).json({ message: 'Error stopping monitor' });
  }
}

// List active monitors
export async function listActiveMonitorsHttp(req, res) {
  try {
    const { clusterId } = req.query;
    const where = {};
    if (clusterId) where.clusterId = clusterId;
    const monitors = await MonitorRecord.findAll({ where });
    res.status(200).json(monitors);
  } catch (err) {
    console.error('Error listing monitors', err);
    res.status(500).json({ message: 'Error fetching monitors' });
  }
}

// Delete (stop & remove) monitor by id
export async function deleteMonitorHttp(req, res) {
  const { id } = req.params;

  const transaction = await sequelize.transaction();
  try {
    const monitor = await MonitorRecord.findByPk(id, { transaction });
    if (!monitor) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Monitor not found' });
    }

    // Stop the running interval if active
    try {
      stopMonitorByGroup(monitor.group, monitor.clusterId);
    } catch (err) {
      console.warn('Failed to stop monitor before delete', err);
    }

    // Delete associated lag records
    await LagRecord.destroy({
      where: { group: monitor.group, clusterId: monitor.clusterId },
      transaction,
    });

    // Delete associated scaling events
    await ScalingEvent.destroy({
      where: { monitorRecordId: monitor.id },
      transaction,
    });

    // Delete the monitor record itself
    await MonitorRecord.destroy({ where: { id }, transaction });

    await transaction.commit();
    return res.status(200).json({ message: 'Monitor deleted' });
  } catch (err) {
    await transaction.rollback();
    console.error('Error deleting monitor', err);
    return res.status(500).json({ message: 'Error deleting monitor' });
  }
}
