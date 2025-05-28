import express from 'express';
import userRoutes from './userRoutes.js';
import scalingRoutes from './scalingRoutes.js';
import lagRoutes from './lagRoutes.js';
import serverRoutes from './serverRoutes.js';

const router = express.Router();

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Mount routes
router.use('/users', userRoutes);
router.use('/scaling', scalingRoutes);
router.use('/getlag', lagRoutes);

export default router;
