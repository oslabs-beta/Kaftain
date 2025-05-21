import k8sManager from './k8sController.js';

// Configuration for scaling
const config = {
  minReplicas: 1,
  maxReplicas: 10,
  lagThreshold: 100, // Messages of lag that trigger scaling
  scaleUpFactor: 1000, // One replica per 1000 lagged messages
  cooldownPeriod: 60000, // 60 seconds between scaling operations
};

let lastScaleTime = 0;

/**
 * Calculate the optimal number of replicas based on consumer lag
 * @param {number} lag - Current consumer lag (in messages)
 * @returns {number} - Optimal number of replicas
 */
function calculateOptimalReplicas(lag) {
  // If lag is below threshold, use minimum replicas
  if (lag <= config.lagThreshold) {
    return config.minReplicas;
  }

  // Calculate replicas based on lag
  // Formula: min_replicas + floor((lag - threshold) / scale_factor)
  const calculatedReplicas =
    config.minReplicas +
    Math.floor((lag - config.lagThreshold) / config.scaleUpFactor);

  // Cap at maximum replicas
  return Math.min(calculatedReplicas, config.maxReplicas);
}

/**
 * Scale the deployment based on consumer lag
 * @param {number} lag - Current consumer lag (in messages)
 * @returns {object} - Scaling result
 */
async function scaleBasedOnLag(lag) {
  const now = Date.now();

  // Check cooldown period
  if (now - lastScaleTime < config.cooldownPeriod) {
    return {
      scaled: false,
      message: 'Cooldown period active',
      cooldownRemaining: config.cooldownPeriod - (now - lastScaleTime),
    };
  }

  try {
    // Get current deployment status
    const status = await k8sManager.watchDeploymentStatus();
    const currentReplicas = status?.body?.spec?.replicas || 1;

    // Calculate optimal replicas
    const optimalReplicas = calculateOptimalReplicas(lag);

    // Only scale if needed
    if (optimalReplicas === currentReplicas) {
      return {
        scaled: false,
        message: 'No scaling needed',
        currentReplicas,
        calculatedReplicas: optimalReplicas,
        lag,
      };
    }

    // Scale the deployment
    const result = await k8sManager.updateReplicaCount(optimalReplicas);
    lastScaleTime = Date.now();

    return {
      scaled: true,
      previousReplicas: currentReplicas,
      newReplicas: optimalReplicas,
      lag,
      deployment: result?.metadata?.name,
    };
  } catch (error) {
    console.error('Error scaling deployment:', error);
    return { scaled: false, error: error.message };
  }
}

export { scaleBasedOnLag, calculateOptimalReplicas, config };
