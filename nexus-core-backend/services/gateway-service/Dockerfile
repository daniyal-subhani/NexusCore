# ----- Base -----
#  syntax=docker/dockerfile:1
# Stage: 1
# Setup Base Environment
FROM node:22-alpine AS base
# Corepack enable karo taake pnpm direct mil jaey
RUN corepack enable && corepack prepare pnpm@11.13.0 --activate 
WORKDIR /app

# ---Stage:2--- Install Dependencies (Caching Layer) ------

FROM base AS deps 
# Root level configurations copy karo
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
# Shared  tsconfig.base.json copy karo
COPY nexus-core-backend/tsconfig.base.json ./nexus-core-backend/
# Base tsconfig.json copy karo
COPY nexus-core-backend/tsconfig.json ./nexus-core-backend/
# Lint files Copy
COPY nexus-core-backend/eslint.config.mjs ./nexus-core-backend/
COPY nexus-core-backend/prettier.config.mjs ./nexus-core-backend/
# Package Manifests(Dependencies Resolution)
COPY nexus-core-backend/packages/common/package.json ./nexus-core-backend/packages/common/
COPY nexus-core-backend/services/gateway-service/package.json ./nexus-core-backend/services/gateway-service/
# Sirf production and workspace dependencies install kro
RUN pnpm install --frozen-lockfile
# ---------------------------
# ---Stage: 3--- Build MonoRepo Packages ------
# ---------------------------
FROM deps AS build
# Copy Source Code of shared packages & gateway services
COPY nexus-core-backend/packages/common ./nexus-core-backend/packages/common
COPY nexus-core-backend/services/gateway-service ./nexus-core-backend/services/gateway-service
# Build shared packages first, then Gateway Service
RUN pnpm --filter @nexus-core/common build || pnpm --filter common build
RUN pnpm --filter gateway-service build || pnpm --filter @nexus-core/gateway-service build 
# Prune DevDependencies for production output
RUN pnpm --filter gateway-service deploy --prod /prod/gateway-service
# ------------------------------
# ---Stage:4---Final Production Image (Minimal)
# ------------------------------
FROM node:22-alpine AS production
WORKDIR /app/services/gateway-service

ENV NODE_ENV=production 

# Copy standalone deployed package from build stage
COPY --from=build /prod/gateway-service ./

EXPOSE 4000

CMD ["node", "dist/index.js"]