FROM node:18-slim

# Create app directory
WORKDIR /app

# Install app dependencies
# Using package.json in repo root so backend gets all required libs (e.g. @kubernetes/client-node)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy only the server source (we are only running the backend)
COPY server ./server

# Runtime configuration
ENV NODE_ENV=production
EXPOSE 3001

# Default command – launches Express API
CMD ["npm", "start"]