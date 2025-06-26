# Kaftain - Kafka Consumer Lag Monitor & Auto-Scaler

Kaftain is a real-time Kafka consumer lag monitoring and auto-scaling solution designed for Kubernetes environments. It provides visibility into consumer group performance and automatically scales Kubernetes deployments based on lag thresholds.

## 🚀 Features

- **Real-time Lag Monitoring**: Track consumer group lag across multiple Kafka clusters
- **Auto-scaling**: Automatically scale Kubernetes deployments based on configurable lag thresholds
- **Multi-cluster Support**: Monitor and manage multiple Kafka clusters from a single interface
- **Historical Data**: Store and visualize lag trends over time (1h, 6h, 24h views)
- **Beautiful UI**: Modern React-based dashboard with real-time updates
- **Flexible Configuration**: Per-consumer group scaling policies with min/max replicas
- **Kubernetes Native**: Seamless integration with Kubernetes API for deployment management

## 🏗️ Architecture

Kaftain consists of three main components:

1. **Frontend**: React + TypeScript dashboard for visualization and configuration
2. **Backend**: Node.js + Express API server that orchestrates monitoring and scaling
3. **Data Layer**: MongoDB for storing configuration, lag history, and scaling events

The system integrates with:
- **Kafka Exporter**: Prometheus-compatible metrics endpoint for Kafka consumer lag
- **Kubernetes API**: For scaling deployments based on lag

## 📋 Prerequisites

- Node.js 18+
- MongoDB 5.0+
- Kubernetes cluster with:
  - Kafka consumer deployments
  - [Kafka Exporter](https://github.com/danielqsj/kafka_exporter) deployed
  - RBAC permissions for deployment scaling
- Access to Kafka cluster metrics

## 🔧 Installation

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/yourusername/kaftain.git
cd kaftain
```

2. Install dependencies:
```bash
npm install
cd server && npm install && cd ..
```

3. Set up environment variables:
```bash
# Create .env file in server directory
cat > server/.env << EOF
MONGODB_URI=mongodb://localhost:27017/kaftain
PORT=3001
NAMESPACE=default
DEPLOYMENT_NAME=kafka-consumer
EOF
```

4. Start MongoDB locally:
```bash
docker run -d -p 27017:27017 --name kaftain-mongo mongo:5
```

5. Run the application:
```bash
npm run dev-all  # Starts both frontend and backend
```

### Production Deployment (Kubernetes)

1. Build the Docker image:
```bash
docker build -t your-registry/kaftain:latest .
docker push your-registry/kaftain:latest
```

2. Create Kubernetes resources:

```yaml
# kaftain-deployment.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: kaftain-config
data:
  MONGODB_URI: "mongodb://mongodb:27017/kaftain"
  NAMESPACE: "default"
  DEPLOYMENT_NAME: "kafka-consumer"
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: kaftain
spec:
  replicas: 1
  selector:
    matchLabels:
      app: kaftain
  template:
    metadata:
      labels:
        app: kaftain
    spec:
      serviceAccountName: kaftain
      containers:
      - name: kaftain
        image: your-registry/kaftain:latest
        ports:
        - containerPort: 3001
        - containerPort: 5173
        envFrom:
        - configMapRef:
            name: kaftain-config
---
apiVersion: v1
kind: Service
metadata:
  name: kaftain
spec:
  selector:
    app: kaftain
  ports:
  - name: api
    port: 3001
    targetPort: 3001
  - name: ui
    port: 5173
    targetPort: 5173
  type: LoadBalancer
```

3. Create RBAC permissions:

```yaml
# kaftain-rbac.yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: kaftain
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: kaftain
rules:
- apiGroups: ["apps"]
  resources: ["deployments", "deployments/scale"]
  verbs: ["get", "list", "watch", "update", "patch"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: kaftain
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: kaftain
subjects:
- kind: ServiceAccount
  name: kaftain
  namespace: default
```

4. Apply the manifests:
```bash
kubectl apply -f kaftain-rbac.yaml
kubectl apply -f kaftain-deployment.yaml
```

## 🔌 Integration with Your Kafka Environment


### 1. Configure Your Consumer Deployments

Ensure your Kafka consumer deployments have appropriate labels and are in the namespace configured in Kaftain.


### 2. Add Kafka Cluster to Kaftain

1. Access the Kaftain UI (http://your-kaftain-url:5173)
2. Click "Add Cluster" in the sidebar
3. Enter:
   - **Cluster Name**: A friendly name for your Kafka cluster
   - **URL**: The Kafka Exporter metrics endpoint (e.g., `http://kafka-exporter:9308/metrics`)

### 3. Configure Monitoring & Auto-scaling

1. Select your cluster from the sidebar
2. Click "Add Monitor"
3. Choose a consumer group to monitor
4. Configure scaling parameters:
   - **Min Replicas**: Minimum number of consumer pods
   - **Max Replicas**: Maximum number of consumer pods
   - **Scaling Factor**: Lag per replica (e.g., 1000 = scale up by 1 replica per 1000 lag)

## 📊 Usage

### Dashboard Features

- **Cluster Sidebar**: Switch between multiple Kafka clusters
- **Active Monitors**: View and manage running monitors
- **Lag Timeline**: Visualize consumer lag trends over time
- **Consumer Groups Table**: See current lag for all consumer groups

### Scaling Logic

The auto-scaler calculates optimal replicas using:

```
replicas = ceil(current_lag / scaling_factor)
```

Bounded by `min_replicas` and `max_replicas`.

Example:
- Current lag: 5000
- Scaling factor: 1000
- Min replicas: 1
- Max replicas: 10
- Result: 5 replicas

## 🔌 API Endpoints

### Cluster Configuration
- `GET /api/cluster-config` - List all clusters
- `POST /api/cluster-config` - Add a new cluster
- `DELETE /api/cluster-config/:id` - Remove a cluster

### Monitoring
- `POST /api/service/start` - Start monitoring a consumer group
- `POST /api/service/stop` - Stop monitoring
- `GET /api/service/monitors` - List active monitors
- `DELETE /api/service/monitors/:id` - Delete a monitor

### Lag Data
- `GET /api/lag/records` - Get historical lag data
- `GET /api/consumer-groups` - List consumer groups for a cluster

## 🔧 Configuration

### Scaling Configuration

Each monitor can be configured with:
- **minReplicas**: Minimum pod count (default: 1)
- **maxReplicas**: Maximum pod count (default: 10)
- **scalingFactor**: Lag messages per replica (default: 1000)

## 🐛 Troubleshooting

### Common Issues

1. **"Failed to fetch consumer groups"**
   - Verify Kafka Exporter is running and accessible
   - Check the cluster URL is correct
   - Ensure network policies allow communication

2. **"Failed to scale deployment"**
   - Check RBAC permissions for the service account
   - Verify deployment exists in the configured namespace
   - Check Kubernetes API server logs

3. **"No lag data available"**
   - Ensure consumer groups are actively consuming
   - Verify Kafka Exporter is scraping the correct Kafka cluster
   - Check if consumer group names match exactly

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🙏 Acknowledgments

- [Kafka Exporter](https://github.com/danielqsj/kafka_exporter) for metrics
- [Recharts](https://recharts.org/) for beautiful charts
- [Kubernetes Client](https://github.com/kubernetes-client/javascript) for K8s integration 