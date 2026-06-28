# Use Node.js 22 alpine image for small footprint
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies cleanly
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the Vite frontend and bundle the server
RUN npm run build

# Expose the port the app runs on (Cloud Run provides PORT env var, typically 8080)
EXPOSE 8080

# Set Node environment to production
ENV NODE_ENV=production

# Start the server
CMD ["npm", "start"]
