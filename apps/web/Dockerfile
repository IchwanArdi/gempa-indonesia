### STAGE 1: deps ###
FROM node:22-alpine AS deps
WORKDIR /app

# Gunakan Corepack dengan versi pnpm yang konsisten
RUN corepack enable && corepack prepare pnpm@11.25.0 --activate

# Salin file konfigurasi utama workspace terlebih dahulu
COPY pnpm-lock.yaml package.json pnpm-workspace.yaml ./

# Salin package.json web dan dependency internal
COPY apps/web/package.json ./apps/web/package.json
COPY packages/types/ ./packages/types/

# Jalankan install dependencies
RUN pnpm install --frozen-lockfile

### STAGE 2: builder ###
FROM node:22-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@11.25.0 --activate

# Salin seluruh hasil install dari STAGE 1
COPY --from=deps /app /app

# Salin source code HANYA untuk web dan types (JANGAN COPY . . agar apps/api tidak masuk dan memicu install ulang)
COPY apps/web ./apps/web
COPY packages/types ./packages/types

ARG NEXT_PUBLIC_API_URL=http://localhost:3001
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Jalankan build Next.js (standalone)
RUN pnpm --filter web build

### STAGE 3: runner ###
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Menyalin output standalone Next.js dengan permissions user non-root
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

USER nextjs

ENV PORT=3000
EXPOSE 3000

CMD ["node", "apps/web/server.js"]
