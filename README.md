# prep. — system design interview practice

A clean, Notion-style interview prep tool with an AI interviewer. Pick a system
design problem (HLD or LLD), get interviewed by DeepSeek, and receive scored
evaluations. Conversations are persisted in MongoDB.

## Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────┐
│  nginx FE    │────►│  Express BE  │────►│ MongoDB  │
│  (React SPA) │     │  /api/*      │     │ (k3s)    │
│              │     │  DeepSeek AI │     │          │
│  interview.lab│     │              │     │ 80 probs │
└──────────────┘     └──────────────┘     └──────────┘
     ▲                      ▲
     │                      │
  Traefik Ingress       ClusterIP
  (port 80/443)         (internal only)
```

## Quick start (local dev)

### 1. Prerequisites

- MongoDB running locally or port-forwarded: `kubectl port-forward -n mongodb svc/mongodb 27017:27017`
- Node.js 22+
- A [DeepSeek API key](https://platform.deepseek.com/api_keys)

### 2. Seed the database

```bash
cd backend
cp .env.example .env      # edit MONGO_URI if needed
npm install
npm run seed              # loads 16 problems into MongoDB
```

### 3. Start both servers

```bash
# Terminal 1 — backend API
cd backend && npm start           # → localhost:4000

# Terminal 2 — frontend dev server
npm install
npm run dev                       # → localhost:5173 (proxies /api → 4000)
```

Open `http://localhost:5173` in your browser.

## Deploying to k3s

### 1. Build & load images

```bash
# Frontend (multi-stage: Vite build + nginx)
docker build -t interview-prep-frontend:latest .
sudo docker save interview-prep-frontend:latest | sudo k3s ctr images import -

# Backend (Express API)
cd backend && docker build -t interview-prep-api:latest .
sudo docker save interview-prep-api:latest | sudo k3s ctr images import -
cd ..
```

### 2. Deploy

```bash
# Create namespace + secrets
kubectl create ns interview-prep
kubectl create secret generic deepseek-key \
  --namespace=interview-prep \
  --from-literal=api-key="sk-your-deepseek-api-key"

# Apply all k8s manifests
kubectl apply -f k8s/
```

### 3. Seed the database (first time only)

```bash
kubectl port-forward -n mongodb svc/mongodb 27017:27017
cd backend && MONGO_URI='mongodb://localhost:27017/interview-prep?authSource=admin' npm run seed
```

### 4. Add DNS record

Add a DNS rewrite in AdGuard (or your DNS server):
- Domain: `interview.lab`
- IP: your k3s node's IP (where Traefik is running)

### 5. Verify

```bash
kubectl get pods -n interview-prep
# → both pods should be Running

curl -H "Host: interview.lab" http://<k3s-node-ip>/api/health
# → {"status":"ok"}
```

Open `http://interview.lab` in your browser.

## Re-deploying after changes

### Frontend changes only

```bash
docker build -t interview-prep-frontend:latest .
sudo docker save interview-prep-frontend:latest | sudo k3s ctr images import -
kubectl rollout restart -n interview-prep deploy/interview-prep-frontend
```

### Backend changes only

```bash
cd backend && docker build -t interview-prep-api:latest .
sudo docker save interview-prep-api:latest | sudo k3s ctr images import -
kubectl rollout restart -n interview-prep deploy/interview-prep-api
cd ..
```

### Both

```bash
docker build -t interview-prep-frontend:latest .
sudo docker save interview-prep-frontend:latest | sudo k3s ctr images import -
kubectl rollout restart -n interview-prep deploy/interview-prep-frontend

cd backend && docker build -t interview-prep-api:latest .
sudo docker save interview-prep-api:latest | sudo k3s ctr images import -
kubectl rollout restart -n interview-prep deploy/interview-prep-api
cd ..
```

### Database changes (new/edited problems)

```bash
# Edit src/data/problems.js, then re-seed
kubectl port-forward -n mongodb svc/mongodb 27017:27017
cd backend && MONGO_URI='mongodb://localhost:27017/interview-prep?authSource=admin' npm run seed
```

## Editing the problem set

All problems live in `src/data/problems.js` — each entry has `id`, `title`,
`category` (HLD or LLD), `difficulty`, `statement`, requirements, constraints
and tags. Add, remove, or edit entries there. After editing, re-seed MongoDB.

## Project structure

```
interview_prep/
├── Dockerfile           # Frontend multi-stage build (Vite → nginx)
├── nginx/
│   └── default.conf     # Nginx config with SPA fallback + /api proxy
├── k8s/
│   ├── namespace.yaml
│   ├── frontend-deployment.yaml
│   ├── frontend-service.yaml
│   ├── ingress.yaml
│   ├── backend-deployment.yaml
│   └── backend-service.yaml
├── src/                 # React frontend
│   ├── api/             # API clients (problems, chat, conversations)
│   ├── components/      # ChatPanel, ChatMessage, DifficultyTag, etc.
│   ├── pages/           # Home, Problem
│   └── data/            # Static problem definitions (seed source)
├── backend/
│   ├── server.js        # Express entry point
│   ├── models/          # Mongoose schemas (Problem, Conversation)
│   ├── routes/          # problems, chat, conversations, evaluate
│   ├── services/        # interviewer.js, evaluator.js (DeepSeek calls)
│   ├── seed/            # Database seed script
│   └── Dockerfile
└── README.md
```

## Stack

- **Frontend:** Vite + React 18, react-router-dom, lucide-react, marked
- **Backend:** Express + Mongoose + OpenAI SDK
- **AI:** DeepSeek API (OpenAI-compatible)
- **Database:** MongoDB 8 on k3s
- **Infrastructure:** k3s + Traefik ingress
