// Exposes HTTP endpoints for fetching Kafka consumer lag metrics.
import express from 'express';
import { getConsumerLag } from '../controllers/lagController.js';

const router = express.Router();

// Get consumer lag
router.get('/', lagController.getConsumerLag);

export default router;
