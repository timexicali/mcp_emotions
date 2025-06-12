# Build stage
FROM node:18 AS builder

# Set the working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy source files
COPY . .

# Build the application
RUN npm run build

# Debug: List contents after build
RUN ls -la /app && \
    echo "Checking dist directory:" && \
    ls -la /app/dist || echo "dist directory not found"

# Production stage
FROM node:18-slim

WORKDIR /app

# Copy built assets from builder
COPY --from=builder /app/dist ./dist

# Install serve
RUN npm install -g serve

# Expose port
EXPOSE 3000

# Start the application
CMD ["serve", "-s", "dist", "-l", "3000"] 