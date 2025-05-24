import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes/index.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import connectDB from './config/db.js';
import kubernetesController from './controllers/k8sController.js';
import lagController from './controllers/lagController.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('Kaftain API is running');
});

app.use('/api', routes);

// Error Middleware
app.use(notFound);
app.use(errorHandler);

// Connect to MongoDB - Uncomment when ready to use MongoDB
// connectDB();

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Log initial message
console.log("Hello world");