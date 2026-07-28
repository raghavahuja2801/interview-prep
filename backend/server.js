import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import problemRoutes from './routes/problems.js'
import chatRoutes from './routes/chat.js'
import conversationRoutes from './routes/conversations.js'
import evaluateRoutes from './routes/evaluate.js'

const PORT = process.env.PORT || 4000
const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://admin:Raghav3214!@mongodb.mongodb.svc.cluster.local:27017/interview-prep?authSource=admin'

const app = express()

app.use(cors())
app.use(express.json())

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))

// Routes
app.use('/api/problems', problemRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/conversations', conversationRoutes)
app.use('/api/evaluate', evaluateRoutes)

// Connect and start
async function start() {
  try {
    await mongoose.connect(MONGO_URI)
    console.log('Connected to MongoDB')
  } catch (err) {
    console.error('MongoDB connection error:', err)
    process.exit(1)
  }

  app.listen(PORT, () => {
    console.log(`API server listening on port ${PORT}`)
  })
}

start()
