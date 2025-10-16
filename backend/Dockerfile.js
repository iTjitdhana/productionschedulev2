# JavaScript Backend Dockerfile (no TypeScript compilation)
FROM node:18-alpine

WORKDIR /app

# Install pnpm
RUN corepack enable pnpm

# Copy package files
COPY package*.json pnpm-lock.yaml* ./

# Install dependencies
RUN \
  if [ -f pnpm-lock.yaml ]; then pnpm i --prod --no-frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci --omit=dev; \
  else npm install --omit=dev; \
  fi

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
