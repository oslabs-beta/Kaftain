import express from 'express';
import { getConsumerGroupsByCluster } from '../controllers/consumerGroupController.js';

const router = express.Router();

// GET /consumer-groups?clusterId=123
router.get('/', (req, res, next) => {
  console.info('[Route] GET /consumer-groups', req.query);
  next();
}, getConsumerGroupsByCluster);

export default router; 