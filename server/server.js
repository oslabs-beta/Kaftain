import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes/index.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import sequelize from './config/db.js';
import './models/ClusterConfig.js';
import './models/LagRecord.js';
import './models/ScalingRecord.js';
import './models/MonitorRecord.js';
import './models/ConsumerGroupRecord.js'

// Load environment variables
dotenv.config();

console.info('[Boot] Environment variables loaded');
console.info(`[Boot] NODE_ENV=${process.env.NODE_ENV}`);

// Initialize Express app
console.info('[Boot] Initializing Express app');
const app = express();
const PORT = process.env.PORT || 3001;

// Log environment variables
console.table({
  DB_HOST: process.env.DB_HOST,
  DB_USER: process.env.DB_USER,
  DB_NAME: process.env.DB_NAME
});

// Middleware
app.use((req, _res, next) => {
  console.info(`[Request] ${req.method} ${req.originalUrl}`);
  next();
});

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

// Connect & sync database then start server
(async () => {
  try {
    console.info('[Boot] Authenticating database connection...');
    for (let i = 1; i <= 30; i++) {
      try {
        await sequelize.authenticate();
        console.log(`[Boot] DB connected on try #${i}`);
        break;
      } catch (err) {
        console.error(`[Boot] Try #${i} failed: ${err.code}`);
        await new Promise(r => setTimeout(r, 2000));
      }
    }

    console.info('[Boot] Database connection established');

    console.info('[Boot] Syncing database models (alter=true)...');
    await sequelize.sync({ alter: true });
    console.info('[Boot] Database synced');

    app.listen(PORT, () =>
      console.info(`[Boot] Server running on port ${PORT}`)
    );
  } catch (err) {
    console.error('[Boot] Startup failed:', err);
    process.exit(1);
  }
})();

// Log initial message
console.log('Hello world');
