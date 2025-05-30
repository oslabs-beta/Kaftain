// Handles HTTP requests for scaling actions by invoking scaling service functions.
import { scaleDeployment } from '../services/scalingService.js';

export async function scale(req, res) {
  try {
    const { lag } = req.body;
    const result = await scaleDeployment(lag);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).send('Error scaling deployment');
  }
}

// import k8sController from './k8sController.js';

// // Configuration for scaling (Lets make this dynamic later when connected to the frontend)
// const config = {
//   minReplicas: 1,
//   maxReplicas: 10,
//   lagThreshold: 100, // Messages of lag that trigger scaling
//   scaleUpFactor: 1000, // One replica per 1000 lagged messages
//   cooldownPeriod: 30000, // 30 seconds between scaling operations
// };

// let lastScaleTime = 0;

// // function to determine optimal replica count
// function calculateOptimalReplicas(lag) {
//   // If lag is below threshold, use minimum replicas
//   if (lag <= config.lagThreshold) {
//     return config.minReplicas;
//   }

//   // Calculate replicas based on lag
//   // Formula: min_replicas + ((lag - threshold) / scale_factor)
//   const calculatedReplicas =
//     config.minReplicas +
//     Math.floor((lag - config.lagThreshold) / config.scaleUpFactor);

//   // Cap at maximum replicas
//   return Math.min(calculatedReplicas, config.maxReplicas);
// }

// //function to scale based on retrieved lag
// async function scale(lag) {
//   const now = Date.now();

//   // Check cooldown period (set to 30 seconds by default)
//   if (now - lastScaleTime < config.cooldownPeriod) {
//     return {
//       scaled: false,
//       message: 'Cooldown period active',
//       cooldownRemaining: config.cooldownPeriod - (now - lastScaleTime),
//     };
//   }

//   try {
//     // Get current deployment status
//     const status = await k8sController.watchDeploymentStatus();
//     const currentReplicas = status?.body?.spec?.replicas || 1;

//     // Calculate optimal replicas
//     const optimalReplicas = calculateOptimalReplicas(lag);

//     // Only scale if needed
//     if (optimalReplicas === currentReplicas) {
//       return {
//         scaled: false,
//         message: 'No scaling needed',
//         currentReplicas,
//         calculatedReplicas: optimalReplicas,
//         lag,
//       };
//     }

//     // Scale the deployment
//     const result = await k8sController.updateReplicaCount(optimalReplicas);
//     lastScaleTime = Date.now();

//     return {
//       scaled: true,
//       previousReplicas: currentReplicas,
//       newReplicas: optimalReplicas,
//       lag,
//       deployment: result?.metadata?.name,
//     };
//   } catch (error) {
//     console.error('Error scaling deployment:', error);
//     return { scaled: false, error: error.message };
//   }
// }

// export { scale, calculateOptimalReplicas, config };
