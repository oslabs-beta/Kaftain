// Contains pure functions to calculate optimal replicas and trigger scaling.
import k8sManager from '../controllers/k8sController.js';

export function calculateOptimalReplicas(lag, config) {
  // Example logic: 1 replica per 1000 lag, min/max bounds
  const min = config?.minReplicas || 1;
  const max = config?.maxReplicas || 10;
  const factor = config?.scaleUpFactor || 1000;
  const replicas = Math.min(max, Math.max(min, Math.ceil(lag / factor)));
  return replicas;
}

// ; record when scaling with the topic name to db

export async function scaleDeployment(lag, config) {
  const replicas = calculateOptimalReplicas(lag, config);
  return await k8sManager.updateReplicaCount(replicas);
}
