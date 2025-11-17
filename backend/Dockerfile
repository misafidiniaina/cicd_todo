
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies only from package.json
COPY package*.json ./

RUN npm install --production

# Copy source code
COPY . .

# Set environment variables (optional)
ENV NODE_ENV=production

# Expose app port (same as in config)
EXPOSE 5000

# Start the server
CMD ["node", "server.js"]
