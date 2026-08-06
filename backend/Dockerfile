FROM node:22-slim

WORKDIR /app

# node_modules is built on the host (fast, reliable) and copied in,
# avoiding the flaky/slow npm registry fetch inside the Docker build.
COPY package.json package-lock.json ./
COPY node_modules ./node_modules

COPY . .

EXPOSE 4000

CMD ["node", "server.js"]