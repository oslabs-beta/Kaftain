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
  async updateReplicaCount() {
    try {
      // create a patch object which tells Kubernetes what you want to change
      const patch = [
        { op: 'replace', path: '/spec/replicas', value: replicas },
      ];

      const options = {
        headers: { 'Content-Type': k8s.PatchUtils.PATCH_FORMAT_JSON_PATCH },
      };

      // send a patch request
      const response = await this.k8sApi.patchNamespacedDeployment(
        this.deploymentName,
        this.namespace,
        patch,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        options
      );
    } catch (error) {}
  }
}
