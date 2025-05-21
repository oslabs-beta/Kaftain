import k8s from '@kubernetes/client-node';

class KubernetesDeploymentManager {
  constructor(namespace, deploymentName) {
    //> Initialize the Kubernetes client
    // create a new instance of a Kubernetes Configuration
    this.kc = new k8s.KubeConfig();
    // loads ~/.kube/config from current environment
    this.kc.loadFromDefault();
    // use method on config to create a new API client using AppsV1Api which contains deployments
    this.k8sApi = this.kc.makeApiClient(k8s.AppsV1Api); // now we have an api object to interact with Kube Deployment

    // in our test environment, namespace = default & deploymentName = deployment-editor
    this.namespace = namespace;
    this.deploymentName = deploymentName;
  }

  // (SCALER) a method to programatically change the number of pods/replicas for a specific Kubernetes Deployment
  async updateReplicaCount(replicas) {
    try {
      // create a patch object which tells Kubernetes what you want to change
      const patch = [
        { op: 'replace', path: '/spec/replicas', value: replicas },
      ];

      // using PATCH_FORMAT_JSON_PATCH tells the API we are using JSON Patch standard
      const options = {
        headers: { 'Content-Type': k8s.PatchUtils.PATCH_FORMAT_JSON_PATCH },
      };

      // send a patch request
      const response = await this.k8sApi.patchNamespacedDeployment(
        this.deploymentName, // 1. name: name of deployment
        this.namespace, // 2. namespace: namespace of deployment
        patch, // 3 body: the patch object -- array of patch operations
        undefined, // 4. pretty: if true, the output is pretty printed
        undefined, // 5. dryRun: When present, makes sure this request isn't persited
        undefined, // 6. fieldManager: Name associated with the person making changes
        undefined, // 7. fieldValidation: How the server should respond to unknown fields
        undefined, // 8. force: Force Apply requests
        options // 9. options: Additional HTTP request options like headers
      );

      console.log('Successfully updated deployment:');
      console.log('----------------------------');
      console.log(`Name: ${response.body.metadata.name}`);
      console.log(`Namespace: ${response.body.metadata.namespace}`);
      console.log(`New Replica Count: ${response.body.spec.replicas}`);
      console.log('----------------------------\n');

      return response.body;
    } catch (error) {
      console.error('Error updating deployment:', error.message);
      if (error.response && error.response.body) {
        console.error('Error details:', error.response.body);
      }
    }
  }
  // function to check deployment status
  async watchDeploymentStatus() {
    try {
      // make API call to k8s cluster to fetch current state of the specified deployment
      const response = await this.k8sApi.readNamespacedDeployment(
        this.deploymentName,
        this.namespace
      );

      console.log('Current deployment status:');
      console.log('----------------------------');
      console.log(`Name: ${response.body.metadata.name}`);
      console.log(`Namespace: ${response.body.metadata.namespace}`);
      console.log(`Desired Replicas: ${response.body.spec.replicas}`);
      console.log(
        `Available Replicas: ${response.body.status.availableReplicas}`
      );
      console.log(`Ready Replicas: ${response.body.status.readyReplicas}`);
      console.log('----------------------------\n');
    } catch (error) {
      console.error('Error reading deployment:', error.message);
    }
  }

  // function to invoke updateReplicaCount and then monitor using watchDeploymentStatus every 5 secs
  run() {
    console.log(
      `Starting deployment manager for ${this.deploymentName} in namespace ${this.namespace}`
    );

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
