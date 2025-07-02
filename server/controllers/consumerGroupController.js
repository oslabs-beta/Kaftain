import ConsumerGroupRecord from '../models/ConsumerGroupRecord.js';

export async function getConsumerGroupsByCluster(req, res) {
  try {
    const { clusterId } = req.query;
    const id = parseInt(clusterId, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid clusterId' });
    }

    // Fetch the most recent consumer group snapshot for this cluster
    const record = await ConsumerGroupRecord.findOne({
      where: { clusterId: id },
      order: [['createdAt', 'DESC']],
      raw: true,
    });

    if (!record || !record.groups) {
      return res.status(404).json({ message: 'No consumer groups found for cluster' });
    }

    return res.status(200).json({ consumerGroups: record.groups });
  } catch (err) {
    console.error('Error fetching consumer groups:', err);
    return res.status(500).json({ message: 'Failed to fetch consumer groups' });
  }
} 