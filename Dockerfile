# ---------- Build stage: compile frontend ----------
FROM node:18-slim AS builder

WORKDIR /app

# Install dependencies (incl. dev deps needed for Vite build)
COPY package*.json ./
RUN npm ci

# Copy source and build frontend
COPY . .
RUN npm run build


# ---------- Production stage: runtime image ----------
FROM node:18-slim

WORKDIR /app

# Runtime configuration
ENV NODE_ENV=production

# Install only production dependencies for the backend
COPY package*.json ./
RUN npm ci --omit=dev

# Copy backend source and pre-built frontend assets
COPY server ./server
COPY --from=builder /app/dist ./dist

# Tiny static file server for the built frontend assets
RUN npm install -g serve

# Ports: 3001 = API, 80 = static frontend
EXPOSE 3001 80

# Launch Express API and static frontend concurrently
CMD sh -c "node server/server.js & serve -s dist -l 80"