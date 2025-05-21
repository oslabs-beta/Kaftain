import express from 'express';
import userRoutes from './userRoutes.js';
import scalingRoutes from './scalingRoutes.js';

const router = express.Router();

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Mount routes
router.use('/users', userRoutes);
outer.use('/scaling', scalingRoutes);

export default router;
