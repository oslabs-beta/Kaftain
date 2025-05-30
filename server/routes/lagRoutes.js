import express from 'express';
import lagController from '../controllers/lagController.js';

const router = express.Router();

// Get consumer lag
router.get('/', lagController.getConsumerLag);



export default router;
