# TypeScript Backend Dockerfile
FROM node:18-alpine

WORKDIR /app

# Install pnpm
RUN corepack enable pnpm

# Copy package files
COPY package*.json pnpm-lock.yaml* ./

# Install ALL dependencies (including dev dependencies for TypeScript)
RUN \
  if [ -f pnpm-lock.yaml ]; then pnpm i --no-frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  else npm install; \
  fi

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

# Change ownership
RUN chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3107

ENV PORT=3107
ENV NODE_ENV=production

# Use compiled JavaScript
CMD ["npm", "start"]
