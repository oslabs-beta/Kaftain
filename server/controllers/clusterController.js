import ClusterConfig from '../models/ClusterConfig.js';
import { fetchConsumerGroups } from '../services/consumerGroupFinderService.js';
import ConsumerGroupRecord from '../models/ConsumerGroupRecord.js';
import LagRecord from '../models/LagRecord.js';
import MonitorRecord from '../models/MonitorRecord.js';
import ScalingEvent from '../models/ScalingRecord.js';
import sequelize from '../config/db.js';
import { stopMonitorsByCluster } from '../services/monitorService.js';

export async function getClusters(req, res) {
  try {
    const clusters = await ClusterConfig.findAll();
    res.status(200).json(clusters);
  } catch (err) {
    console.error('Error fetching clusters:', err);
    res.status(500).json({ message: 'Failed to fetch clusters' });
  }
}

export async function saveCluster(req, res, next) {
  try {
    const { clusterName, url } = req.body;
    if (!clusterName || !url) {
      return res.status(400).json({ message: 'clusterName and url are required' });
    }

    const cluster = await ClusterConfig.create({ clusterName, url });
    res.locals.clusterId = cluster.id;
    res.locals.clusterURL = cluster.url;
    next();
  } catch (err) {
    console.error('Error saving cluster:', err);
    res.status(500).json({ message: 'Failed to save cluster' });
  }
}

export async function getConsumerGroup(req, res, next) {
    const { clusterURL, clusterId } = res.locals;
    try{
        const consumerGroups = await fetchConsumerGroups(clusterURL);
        // set consumer group to cluster config
        await ConsumerGroupRecord.create({ clusterId: clusterId, groups: consumerGroups.consumerGroups });
        next()
    } catch (err) {
        console.error('Error fetching consumer groups:', err);
        res.status(500).json({ message: 'Failed to fetch consumer groups' });
    }
}

export async function deleteCluster(req, res) {
  const { id } = req.params;
  const clusterId = parseInt(id, 10);
  if (isNaN(clusterId)) {
    return res.status(400).json({ message: 'Invalid cluster id' });
  }

  try {
    // 1. Stop any in-memory monitors tied to this cluster
    stopMonitorsByCluster(clusterId);

    // 2. Gather monitor ids for cascade deletes
    const monitors = await MonitorRecord.findAll({ where: { clusterId }, attributes: ['id'], raw: true });
    const monitorIds = monitors.map((m) => m.id);

    // 3. Transactionally delete dependent rows then cluster
    await sequelize.transaction(async (t) => {
      await LagRecord.destroy({ where: { clusterId }, transaction: t });
      await ConsumerGroupRecord.destroy({ where: { clusterId }, transaction: t });

      if (monitorIds.length) {
        await ScalingEvent.destroy({ where: { monitorRecordId: monitorIds }, transaction: t });
      }

      await MonitorRecord.destroy({ where: { clusterId }, transaction: t });
      await ClusterConfig.destroy({ where: { id: clusterId }, transaction: t });
    });

    return res.status(200).json({ message: 'Cluster deleted successfully' });
  } catch (err) {
    console.error('Error deleting cluster:', err);
    return res.status(500).json({ message: 'Failed to delete cluster' });
  }
}

