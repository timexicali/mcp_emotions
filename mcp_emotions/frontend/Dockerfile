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

# Create a simple server script
RUN echo 'const http = require("http"); \
    const fs = require("fs"); \
    const path = require("path"); \
    const port = 3000; \
    const mimeTypes = { \
      ".html": "text/html", \
      ".js": "text/javascript", \
      ".css": "text/css", \
      ".json": "application/json", \
      ".png": "image/png", \
      ".jpg": "image/jpg", \
      ".gif": "image/gif", \
      ".svg": "image/svg+xml", \
      ".ico": "image/x-icon" \
    }; \
    const server = http.createServer((req, res) => { \
      console.log(`Request: ${req.url}`); \
      let filePath = "./dist" + req.url; \
      if (filePath === "./dist/") filePath = "./dist/index.html"; \
      const extname = path.extname(filePath); \
      let contentType = mimeTypes[extname] || "application/octet-stream"; \
      fs.readFile(filePath, (err, content) => { \
        if (err) { \
          if (err.code === "ENOENT") { \
            fs.readFile("./dist/index.html", (err, content) => { \
              if (err) { \
                res.writeHead(500); \
                res.end(`Error: ${err.code}`); \
              } else { \
                res.writeHead(200, { "Content-Type": "text/html" }); \
                res.end(content, "utf-8"); \
              } \
            }); \
          } else { \
            res.writeHead(500); \
            res.end(`Error: ${err.code}`); \
          } \
        } else { \
          res.writeHead(200, { "Content-Type": contentType }); \
          res.end(content, "utf-8"); \
        } \
      }); \
    }); \
    server.listen(port, () => { \
      console.log(`Server running at http://0.0.0.0:${port}/`); \
    });' > server.js

# Expose port
EXPOSE 3000

# Start the application using the simple server
CMD ["node", "server.js"] 