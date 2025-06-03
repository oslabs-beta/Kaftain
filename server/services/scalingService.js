import k8sManager from '../controllers/k8sController.js';
import ScalingEvent from '../models/scalingRecord.js';

export function calculateOptimalReplicas(lag, config) {
  const min = config?.minReplicas || 1;
  const max = config?.maxReplicas || 10;
  const factor = config?.scaleUpFactor || 1000;
  const replicas = Math.min(max, Math.max(min, Math.ceil(lag / factor)));
  return replicas;
}

export async function scaleDeployment(lag, config) {
  const replicas = calculateOptimalReplicas(lag, config);

  // Get current deployment status to compare replicas
  const status = await k8sManager.watchDeploymentStatus();
  const currentReplicas = status?.body?.spec?.replicas || 1;

  // Only scale if needed
  if (replicas !== currentReplicas) {
    // Actually scale
    await k8sManager.updateReplicaCount(replicas);

    // Store scaling event in DB
    await ScalingEvent.create({
      group: config.groupName,
      topic: config.topicName || '',
      oldReplicas: currentReplicas,
      newReplicas: replicas,
      lag,
      timestamp: new Date(),
    });
  }

  return {
    scaled: replicas !== currentReplicas,
    oldReplicas: currentReplicas,
    newReplicas: replicas,
    lag,
  };
}
