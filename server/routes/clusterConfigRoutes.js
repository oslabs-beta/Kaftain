import express from 'express';
//import controller for cluster
import { getClusters, saveCluster, getConsumerGroup, deleteCluster } from '../controllers/clusterController.js';


const router = express.Router();

router.get('/', (req, res, next) => {
  console.info('[Route] GET /cluster-config');
  next();
}, getClusters)
// Get consumer lag
router.post('/', (req, res, next) => {
  console.info('[Route] POST /cluster-config body:', req.body);
  next();
}, saveCluster, getConsumerGroup, (req, res) => {
  res.status(200).json({ message: 'Cluster saved and consumer groups fetched successfully' });
});

// Delete cluster
router.delete('/:id', (req, res, next) => {
  console.info(`[Route] DELETE /cluster-config/${req.params.id}`);
  next();
}, deleteCluster);

export default router;