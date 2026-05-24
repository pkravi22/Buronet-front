FROM node:20-alpine AS base

# ── 1. Install dependencies ──────────────────────────────────────────────────
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# ── 2. Build the Next.js app ─────────────────────────────────────────────────
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* vars are embedded into the JS bundle at build time.
# They are read from Docker build-args so we can pass them in at build time.
ARG NEXT_PUBLIC_DOTNET_BACKEND_BASE
ARG NEXT_PUBLIC_MESSAGING_BACKEND_BASE
ARG NEXT_PUBLIC_MESSAGE_SERVICE_BASE_URL
ARG NEXT_PUBLIC_JOBS_BACKEND_BASE
ARG NEXT_PUBLIC_BYTES_BACKEND_BASE
ARG NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
ARG NEXT_PUBLIC_CURRENT_AFFAIRS_API_KEY
ARG MONGO_URI

ENV NEXT_PUBLIC_DOTNET_BACKEND_BASE=$NEXT_PUBLIC_DOTNET_BACKEND_BASE
ENV NEXT_PUBLIC_MESSAGING_BACKEND_BASE=$NEXT_PUBLIC_MESSAGING_BACKEND_BASE
ENV NEXT_PUBLIC_MESSAGE_SERVICE_BASE_URL=$NEXT_PUBLIC_MESSAGE_SERVICE_BASE_URL
ENV NEXT_PUBLIC_JOBS_BACKEND_BASE=$NEXT_PUBLIC_JOBS_BACKEND_BASE
ENV NEXT_PUBLIC_BYTES_BACKEND_BASE=$NEXT_PUBLIC_BYTES_BACKEND_BASE
ENV NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=$NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
ENV NEXT_PUBLIC_CURRENT_AFFAIRS_API_KEY=$NEXT_PUBLIC_CURRENT_AFFAIRS_API_KEY
ENV MONGO_URI=$MONGO_URI

RUN npm run build

# ── 3. Production runner ─────────────────────────────────────────────────────
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
