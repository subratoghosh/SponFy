# ==============================================================================
# SponFy Production Dockerfile (Optional Portability / Self-Hosting)
# NOTE: Vercel uses native zero-config deployment and does NOT require Docker.
# ==============================================================================

FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# ------------------------------------------------------------------------------
# Stage 1: Install dependencies
# ------------------------------------------------------------------------------
FROM base AS deps
COPY package.json package-lock.json ./
COPY prisma ./prisma/
RUN npm ci

# ------------------------------------------------------------------------------
# Stage 2: Build the Next.js production application
# ------------------------------------------------------------------------------
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set build-time dummy variables for static collection without leaking real secrets
ENV NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production \
    DOCKER_BUILD=true \
    NEXT_PUBLIC_DEMO_MODE=true \
    AUTH_SECRET=docker-build-time-auth-secret-32-chars-long \
    TOKEN_ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef \
    CRON_SECRET=docker-build-time-cron-secret

RUN npx prisma generate
RUN npm run build

# ------------------------------------------------------------------------------
# Stage 3: Minimal production runtime
# ------------------------------------------------------------------------------
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME="0.0.0.0"

# Create unprivileged system user for secure container execution
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy static assets and standalone server output
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
