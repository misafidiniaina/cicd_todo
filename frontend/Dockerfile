# -----------------------------------------------------
# 1. Build Stage
# -----------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .
RUN npm run build

# -----------------------------------------------------
# 2. Production Stage (Nginx)
# -----------------------------------------------------
FROM nginx:stable-alpine

# Copy build output to nginx serving directory
COPY --from=builder /app/dist /usr/share/nginx/html
# If using CRA, replace "dist" with "build"

# Copy custom nginx config (optional but recommended)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# -----------------------------------------------------
# HEALTHCHECK
# -----------------------------------------------------
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget --quiet --spider http://localhost || exit 1

CMD ["nginx", "-g", "daemon off;"]
