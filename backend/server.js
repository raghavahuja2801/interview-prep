import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import problemRoutes from './routes/problems.js'
import authRoutes from './routes/auth.js'
import chatRoutes from './routes/chat.js'
import conversationRoutes from './routes/conversations.js'
import evaluateRoutes from './routes/evaluate.js'
import diagramRoutes from './routes/diagram.js'
import discussionRoutes from './routes/discussion.js'
import { ensureBucket } from './services/minio.js'
import { ensureAuthSchema, ensureDiscussionSchema } from './services/postgres.js'
import { initDiscussionHub } from './services/discussion.js'

const PORT = process.env.PORT || 4000
const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://admin:Raghav3214!@mongodb.mongodb.svc.cluster.local:27017/interview-prep?authSource=admin'
const CORS_ORIGIN = (process.env.CORS_ORIGIN || '').split(',').map((origin) => origin.trim()).filter(Boolean)

const app = express()

app.set('trust proxy', 1)
app.use(
  cors({
    origin: CORS_ORIGIN.length > 0 ? CORS_ORIGIN : true,
    credentials: true,
  })
)
app.use(express.json({ limit: '5mb' }))

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))

// Routes
app.use('/api/problems', problemRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/conversations', conversationRoutes)
app.use('/api/evaluate', evaluateRoutes)
app.use('/api/diagram', diagramRoutes)
app.use('/api/discussion', discussionRoutes)

// Connect and start
async function start() {
  try {
    await mongoose.connect(MONGO_URI)
    console.log('Connected to MongoDB')
  } catch (err) {
    console.error('MongoDB connection error:', err)
    process.exit(1)
  }

  try {
    await ensureAuthSchema()
    console.log('Auth schema ready')
  } catch (err) {
    console.error('Postgres auth setup error:', err)
    process.exit(1)
  }

  try {
    await ensureDiscussionSchema()
    console.log('Discussion schema ready')
  } catch (err) {
    console.error('Postgres discussion setup error:', err)
    process.exit(1)
  }

  // Ensure MinIO bucket exists (non-fatal if unavailable)
  try {
    await ensureBucket()
    console.log('MinIO bucket ready')
  } catch (err) {
    console.warn('MinIO bucket setup skipped:', err.message)
  }

  const server = app.listen(PORT, () => {
    console.log(`API server listening on port ${PORT}`)
  })

  // Per-problem discussion chat over WebSockets + Redis pub/sub.
  try {
    initDiscussionHub(server)
    console.log('Discussion hub ready')
  } catch (err) {
    console.warn('Discussion hub init failed:', err.message)
  }
}

start()
