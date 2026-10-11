# syntax=docker/dockerfile:1
# Production image for the Agentic AI Workshop 2026 website.
#   docker compose up -d --build        (see docker-compose.yml and README.md)

ARG NODE_VERSION=22

# ---- 1. Install dependencies ------------------------------------------------
FROM node:${NODE_VERSION}-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# ---- 2. Build ---------------------------------------------------------------
# Also used by the `tools` service in docker-compose.yml to run the seed and
# create-admin scripts, since it contains the full source and dev tools.
FROM node:${NODE_VERSION}-bookworm-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# NEXT_PUBLIC_* values are compiled into the site, so they are build arguments.
ARG NEXT_PUBLIC_SITE_URL=http://localhost:3000
ARG NEXT_PUBLIC_BASE_PATH=
ARG NEXT_PUBLIC_GA_ID=
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL} \
    NEXT_PUBLIC_BASE_PATH=${NEXT_PUBLIC_BASE_PATH} \
    NEXT_PUBLIC_GA_ID=${NEXT_PUBLIC_GA_ID} \
    NEXT_OUTPUT=standalone \
    NEXT_TELEMETRY_DISABLED=1
# No database is needed to build: pages are pre-rendered with the default
# content and refreshed from MongoDB at runtime.
RUN npm run build

# ---- 3. Run -----------------------------------------------------------------
FROM node:${NODE_VERSION}-bookworm-slim AS run
WORKDIR /app
ARG NEXT_PUBLIC_BASE_PATH=
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    NEXT_PUBLIC_BASE_PATH=${NEXT_PUBLIC_BASE_PATH}
RUN groupadd --system --gid 1001 nodejs && useradd --system --uid 1001 --gid nodejs nextjs
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=build --chown=nextjs:nodejs /app/public ./public
USER nextjs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000'+(process.env.NEXT_PUBLIC_BASE_PATH||'')+'/api/health').then(r=>process.exit(r.ok?0:1),()=>process.exit(1))"
CMD ["node", "server.js"]
