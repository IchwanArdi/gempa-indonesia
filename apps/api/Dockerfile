### STAGE 1: deps ###
FROM node:22-alpine AS deps
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@11.25.0 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/package.json
COPY packages/types ./packages/types

# Install dari root workspace agar pnpm memuat dependency yang dibutuhkan
RUN pnpm install --frozen-lockfile

### STAGE 2: builder ###
FROM node:22-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@11.25.0 --activate

# Salin node_modules dan file yang telah terinstall dari stage deps
COPY --from=deps /app /app

# Salin source code HANYA untuk api dan types (JANGAN COPY . . agar apps/web tidak masuk dan memicu install ulang)
COPY apps/api ./apps/api
COPY packages/types ./packages/types

# Nilai default untuk DATABASE_URL saat build (prisma generate tidak memerlukan koneksi DB aktif)
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL:-"postgresql://placeholder:placeholder@localhost:5432/placeholder"}

# Generate Prisma client lalu build NestJS
RUN pnpm --filter api exec prisma generate
RUN pnpm --filter api build

### STAGE 3: runner ###
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Copy runtime artifact untuk NestJS dan Prisma dengan ownership user non-root
COPY --from=builder --chown=nextjs:nodejs /app/apps/api/dist ./apps/api/dist
COPY --from=builder --chown=nextjs:nodejs /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder --chown=nextjs:nodejs /app/packages/types ./packages/types
COPY --from=builder --chown=nextjs:nodejs /app/apps/api/prisma ./apps/api/prisma
# prisma.config.ts dibutuhkan oleh Prisma v7 CLI saat menjalankan
# migrate deploy. Tanpa file ini, CLI tidak tahu URL database-nya.
COPY --from=builder --chown=nextjs:nodejs /app/apps/api/prisma.config.ts ./apps/api/prisma.config.ts

USER nextjs

ENV PORT=3002
EXPOSE 3002

CMD ["node", "apps/api/dist/main.js"]