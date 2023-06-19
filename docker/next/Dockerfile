# ---- Build Stage ----
FROM node:18.16.0-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY .env.local ./
COPY prisma ./prisma
RUN npm install
RUN npx prisma generate
COPY . .
RUN npm run build

# ---- Release Stage ----
FROM node:18.16.0-alpine AS release
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.env.local ./
COPY --from=builder /app/prisma ./prisma
RUN npm install --only=production
RUN npx prisma generate
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["npm", "start"]
