import k8sManager from '../controllers/k8sController.js';
import ScalingEvent from '../models/ScalingRecord.js';

export function calculateOptimalReplicas(lag, config) {
  const min = config?.minReplicas || 1;
  const max = config?.maxReplicas || 10;
  const factor = config?.scalingFactor || 1000;
  const replicas = Math.min(max, Math.max(min, Math.ceil(lag / factor)));
  return replicas;
}

// Helper to log high-level scaling SQL events
function logScaling(msg, obj = {}) {
  console.info(`[ScalingService] ${msg}`, obj);
}

export async function scaleDeployment(lag, config, monitorRecordId, groupName, topicName) {
  logScaling('Scale deployment requested', { lag, monitorRecordId });
  const replicas = calculateOptimalReplicas(lag, config);

  // Get current deployment status to compare replicas
  const status = await k8sManager.watchDeploymentStatus();
  const currentReplicas = status?.body?.spec?.replicas || 1;

  // Only scale if needed
  if (replicas !== currentReplicas) {
    logScaling('Replica count change detected', { currentReplicas, replicas });
    // Actually scale
    await k8sManager.updateReplicaCount(replicas);
    logScaling('Replica count updated in Kubernetes');

    // Store scaling event in DB
    logScaling('Persisting ScalingEvent to DB');
    await ScalingEvent.create({
      group: groupName,
      topic: topicName,
      oldReplicas: currentReplicas,
      newReplicas: replicas,
      lag,
      timestamp: new Date(),
      monitorRecordId,
    });
    logScaling('ScalingEvent persisted');
  }

  return {
    scaled: replicas !== currentReplicas,
    oldReplicas: currentReplicas,
    newReplicas: replicas,
    lag,
  };
}
