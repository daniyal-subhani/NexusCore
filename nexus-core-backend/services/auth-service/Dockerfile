# BASE

FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /app

# Dependencies
FROM base AS deps 
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY nexus-core-backend/packages/common/package.json ./nexus-core-backend/packages/common/package.json
COPY nexus-core-backend/services/auth-service/package.json ./nexus-core-backend/services/auth-service/package.json
RUN pnpm install --frozen-lockfile

# Build
FROM deps AS build 
COPY nexus-core-backend/packages/common ./nexus-core-backend/packages/common
COPY nexus-core-backend/services/auth-service ./nexus-core-backend/services/auth-service ./nexus-core-backend/services/auth-service 
RUN pnpm --filter @nexus-core/common build
RUN pnpm --filter auth-service exec prisma generate
RUN pnpm --filter auth-service build


# Production
FROM base AS production
ENV NODE_ENV=production 
COPY --from=build /app/nexus-core-backend/packages/common/dist ./nexus-core-backend/packages/common/dist
COPY --from=build /app/nexus-core-backend/packages/common/package.json ./nexus-core-backend/packages/common/package.json
COPY --from=build /app/nexus-core-backend/services/auth-service/dist ./nexus-core-backend/services/auth-service/dist
COPY --from=build /app/nexus-core-backend/services/auth-service/generated ./nexus-core-backend/services/auth-service/generated
COPY --from=build /app/nexus-core-backend/services/auth-service/package.json ./nexus-core-backend/services/auth-service/package.json
COPY --from=deps /app/node_modules ./node_modules

EXPOSE 4003
WORKDIR /app/nexus-core-backend/services/auth-service

CMD ["node", "dist/index.js"]
