// Exposes HTTP endpoints to start and stop the background monitoring service.
import express from 'express';
import {
  startMonitorHttp,
  stopMonitorHttp,
} from '../controllers/monitorController.js';
const router = express.Router();
router.post('/start', startMonitorHttp);
router.post('/stop', stopMonitorHttp);
export default router;
