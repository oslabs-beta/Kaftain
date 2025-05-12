import k8s from '@kubernetes/client-node';



class KubernetesDeploymentManager {
    constructor(namespace, deploymentName) {
        // Initialize the Kubernetes client
        this.kc = new k8s.KubeConfig();
        this.kc.loadFromDefault();
        this.k8sApi = this.kc.makeApiClient(k8s.AppsV1Api);
        
        this.namespace = namespace;
        this.deploymentName = deploymentName;
    }

    async updateReplicaCount() {
        try {
            console.log(`Attempting to update replica count for deployment ${this.deploymentName}`);
            
            // First, get the current deployment
            const currentDeployment = await this.k8sApi.readNamespacedDeployment(
                this.deploymentName,
                this.namespace
            );

            console.log('Current deployment state:');
            console.log(`Current replicas: ${currentDeployment.body.spec.replicas}`);

            // Create the patch object
            const patchBody = [
                {
                    "op": "replace",
                    "path": "/spec/replicas",
                    "value": 2
                }
            ];

            const options = { headers: { 'Content-Type': k8s.PatchUtils.PATCH_FORMAT_JSON_PATCH } };

            // Apply the patch to update replica count
            const response = await this.k8sApi.patchNamespacedDeployment(
                this.deploymentName,
                this.namespace,
                patchBody,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                options
            );

            console.log('Successfully updated deployment:');
            console.log('----------------------------');
            console.log(`Name: ${response.body.metadata.name}`);
            console.log(`Namespace: ${response.body.metadata.namespace}`);
            console.log(`New Replica Count: ${response.body.spec.replicas}`);
            console.log('----------------------------\n');

        } catch (error) {
            console.error('Error updating deployment:', error.message);
            if (error.response && error.response.body) {
                console.error('Error details:', error.response.body);
            }
        }
    }

    async watchDeploymentStatus() {
        try {
            const response = await this.k8sApi.readNamespacedDeployment(
                this.deploymentName,
                this.namespace
            );

            console.log('Current deployment status:');
            console.log('----------------------------');
            console.log(`Name: ${response.body.metadata.name}`);
            console.log(`Namespace: ${response.body.metadata.namespace}`);
            console.log(`Desired Replicas: ${response.body.spec.replicas}`);
            console.log(`Available Replicas: ${response.body.status.availableReplicas}`);
            console.log(`Ready Replicas: ${response.body.status.readyReplicas}`);
            console.log('----------------------------\n');

        } catch (error) {
            console.error('Error reading deployment:', error.message);
        }
    }

    run() {
        console.log(`Starting deployment manager for ${this.deploymentName} in namespace ${this.namespace}`);
        
        // First update the replica count
        this.updateReplicaCount()
            .then(() => {
                // Then start watching the deployment status every 5 seconds
                setInterval(() => this.watchDeploymentStatus(), 5000);
            })
            .catch(console.error);
    }
}

// Get namespace and deployment name from environment variables
const namespace = process.env.NAMESPACE || 'default';
const deploymentName = process.env.DEPLOYMENT_NAME || 'kafka-consumer';

// Create and start the deployment manager
const manager = new KubernetesDeploymentManager(namespace, deploymentName);

export default manager;
