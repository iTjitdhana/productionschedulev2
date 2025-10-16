# JavaScript Backend Dockerfile (no TypeScript compilation)
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

# Change ownership
RUN chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3105

ENV PORT=3105
ENV NODE_ENV=production

# Use node directly with JavaScript files
CMD ["node", "src/index.js"]
