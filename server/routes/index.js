import express from 'express';
import lagRoutes from './lagRoutes.js';
import scalingRoutes from './scalingRoutes.js';
import serviceRoutes from './serviceRoutes.js';

const router = express.Router();

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Mount routes
router.use('/lag', lagRoutes);
router.use('/scaling', scalingRoutes);
router.use('/service', serviceRoutes);

export default router;
