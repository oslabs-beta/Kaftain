import express from 'express';
import {
  scale,
  calculateOptimalReplicas,
  config,
} from '../controllers/scalingController.js';

const router = express.Router();

router.post('/start-service', async (req, res) => {
    // might remove topicName later
    const { groupName, topicName } = req.body;

    //handle undefined serviceName
    if (groupName === undefined || topicName === undefined) {
      return res.status(400).json({ error: 'Group name and topic name parameters required' });
    }

    // scale, passing in lag
    try {
      const result = await iterationController(groupName, topicName);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
});

export default router;