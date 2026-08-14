# vappfe/Dockerfile
#
# Multi-stage: build the Angular app, then serve the static output
# with a minimal nginx. This container's nginx only serves static
# files — it does NOT terminate TLS or handle routing to vappbe;
# that's the separate edge nginx in vapp-deploy.

# ---- builder ----
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# defaultConfiguration is "production" in angular.json, so plain
# `ng build` already produces the optimized build.
RUN npm run build

# ---- runtime ----
FROM nginx:alpine AS runtime

# Output path confirmed from angular.json: application builder +
# project name "vappfe", no custom outputPath override.
COPY --from=builder /app/dist/vappfe/browser /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:80/ || exit 1