# ── Build stage ──
FROM node:22-alpine AS build

WORKDIR /app

# node_modules is built on the host (fast, reliable) and copied in,
# avoiding the flaky/slow npm registry fetch inside the Docker build
# (npm ci on Alpine keeps failing with "Exit handler never called!").
COPY package.json package-lock.json ./
COPY node_modules ./node_modules

COPY . .
RUN npm run build

# ── Serve stage ──
FROM nginx:1.27-alpine

COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
