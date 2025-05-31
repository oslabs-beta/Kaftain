import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes/index.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import sequelize from './config/db.js';
import './models/UserConfig.js';
import './models/LagRecord.js';
import './models/ScalingRecord.js';
import './models/MonitorRecord.js';

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

// Sync database models
sequelize
  .sync()
  .then(() => {
    console.log('Database synced');
    // Start your server after syncing
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('Failed to sync database:', err);
  });

// Log initial message
console.log('Hello world');
