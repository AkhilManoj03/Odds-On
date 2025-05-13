# Dockerfile for Odds-On App
# 
# To build the Docker image:
# docker build -t odds-on .
#
# To run the Docker container with environment variables from .env.local:
# docker run -it --rm -p 19000:19000 -p 19001:19001 -p 19002:19002 \
#   -e REACT_NATIVE_PACKAGER_HOSTNAME=<<HOST LOCAL IP>> \
#   -e EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0 \
#   --env-file .env.local \
#   --name=odds-on odds-on


# Use a specific Node.js LTS version for stability
FROM --platform=linux/amd64 node:22-alpine

# Set working directory
WORKDIR /usr/src/app

# Create non-root user with explicit UID/GID
RUN addgroup -S -g 1001 appuser && \
    adduser -S -G appuser -u 1001 -h /home/appuser appuser

# Set environment variables
ENV NODE_ENV=development \
    NPM_CONFIG_PREFIX=/home/appuser/.npm-global \
    PATH=/home/appuser/.npm-global/bin:${PATH} \
    NPM_CONFIG_UPDATE_NOTIFIER=false

# Install system dependencies and clean up in one layer
RUN apk add --no-cache && \
    mkdir -p /home/appuser/.npm-global && \
    chown -R appuser:appuser /home/appuser /usr/src/app && \
    rm -rf /var/cache/apk/*

# Switch to non-root user
USER appuser

# Install global npm packages
RUN npm install -g npm@11.3.0 expo-cli@6.3.10

# Copy dependency files first for better build caching
COPY --chown=appuser:appuser package.json package-lock.json app.json tsconfig.json .npmrc ./

# Install dependencies
RUN npm ci --no-audit --no-fund --prefer-offline && \
    npm cache clean --force

# Copy application code
COPY --chown=appuser:appuser app ./app
COPY --chown=appuser:appuser assets ./assets
COPY --chown=appuser:appuser hooks ./hooks
COPY --chown=appuser:appuser lib ./lib

# Expose necessary ports
EXPOSE 19000-19002 8081

# Start the application
CMD ["npm", "run", "dev"]
