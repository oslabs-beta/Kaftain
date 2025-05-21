import express from 'express';
import {
  scaleBasedOnLag,
  calculateOptimalReplicas,
  config,
} from '../controllers/scalingController.js';

const router = express.Router();

export default router;
