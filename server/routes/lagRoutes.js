// Exposes HTTP endpoints for fetching Kafka consumer lag metrics.
import express from 'express';
import { getConsumerLag, getLagRecords } from '../controllers/lagController.js';

const router = express.Router();

// Get consumer lag
router.get('/', getConsumerLag);

// Historical lag records
router.get('/records', getLagRecords);

export default router;
