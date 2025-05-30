// Exposes HTTP endpoints for triggering and configuring autoscaling.

import express from 'express';
import { scale } from '../controllers/scalingController.js';

const router = express.Router();

// POST /scaling - trigger scaling manually (for testing/admin)
router.post('/', scale);

export default router;
