import express from 'express';
import lagRoutes from './lagRoutes.js';
import serviceRoutes from './serviceRoutes.js';
import clusterConfigRoutes from './clusterConfigRoutes.js';
import monitorEditorRoutes from './monitorEditorRoutes.js';
import consumerGroupRoutes from './consumerGroupRoutes.js';

const router = express.Router();

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Mount routes
router.use('/lag', lagRoutes);
router.use('/service', serviceRoutes);
router.use('/cluster-config', clusterConfigRoutes)
router.use('/monitor-editor', monitorEditorRoutes);
router.use('/consumer-groups', consumerGroupRoutes);
export default router;
