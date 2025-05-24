import express from 'express';
import getConsumerLag  from '../controllers/lagController.js';

const router = express.Router();

// Get consumer lag
router.get('/', getConsumerLag);



export default router;
