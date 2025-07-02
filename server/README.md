# Kaftain Server

Backend server for the Kaftain application.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file based on `.env.example` with your configuration.

3. Start the development server:
   ```bash
   npm run dev
   ```

4. For production:
   ```bash
   npm start
   ```

## API Routes

- `GET /` - Server status check

## Environment Variables

- `PORT` - Server port (default: 5000)
- `DATABASE_URL` - PostgreSQL connection string
- `NODE_ENV` - Environment (development/production) 