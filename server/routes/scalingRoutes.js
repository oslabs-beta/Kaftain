import express from 'express';
import {
  scale,
  calculateOptimalReplicas,
  config,
} from '../controllers/scalingController.js';

const router = express.Router();

router.post('/scale', async (req, res) => {
  const { lag } = req.body;

  //handle undefined lag
  if (lag === undefined) {
    return res.status(400).json({ error: 'Lag parameter required' });
  }

  // scale, passing in lag
  try {
    const result = await scale(Number(lag));
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// router to get current scaling configuration
router.get('/config', (req, res) => {
  res.json(config);
});

// Update scaling configuration
router.put('/config', (req, res) => {
  const {
    minReplicas,
    maxReplicas,
    lagThreshold,
    scaleUpFactor,
    cooldownPeriod,
  } = req.body;

  if (minReplicas) config.minReplicas = Number(minReplicas);
  if (maxReplicas) config.maxReplicas = Number(maxReplicas);
  if (lagThreshold) config.lagThreshold = Number(lagThreshold);
  if (scaleUpFactor) config.scaleUpFactor = Number(scaleUpFactor);
  if (cooldownPeriod) config.cooldownPeriod = Number(cooldownPeriod);

  res.json({ success: true, config });
});

// ; FOR TESTING: calculate optimal replicas without actually scaling
router.post('/calculate', (req, res) => {
  const { lag } = req.body;

  if (lag === undefined) {
    return res.status(400).json({ error: 'Lag parameter required' });
  }

  const optimalReplicas = calculateOptimalReplicas(Number(lag));
  res.json({ optimalReplicas, lag });
});

export default router;
