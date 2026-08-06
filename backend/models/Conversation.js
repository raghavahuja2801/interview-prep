import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema(
  {
    role: { type: String, required: true, enum: ['user', 'assistant'] },
    content: { type: String, required: true },
    diagram: {
      type: {
        imageKey: { type: String, default: null },
        inlineDataUrl: { type: String, default: null },
        format: { type: String, enum: ['svg', 'png'], default: 'svg' },
      },
      required: false,
      default: undefined,
    },
  },
  { timestamps: true }
)

const diagramSchema = new mongoose.Schema(
  {
    source: { type: String, required: true },
    imageKey: { type: String, required: true },
    format: { type: String, enum: ['svg', 'png'], default: 'svg' },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
)

const conversationSchema = new mongoose.Schema(
  {
    ownerUserId: { type: String, index: true, default: null },
    problemId: { type: String, required: true, index: true },
    messages: [messageSchema],
    diagrams: [diagramSchema],
    completed: { type: Boolean, default: false },
    startedAt: { type: Date, default: Date.now },
    lastActivityAt: { type: Date, default: Date.now },
    durationSeconds: { type: Number, default: 0 },
    totalPausedSeconds: { type: Number, default: 0 },
    score: { type: Number, default: null },
    evaluation: { type: String, default: null },
  },
  { timestamps: true }
)

// Virtual for quick listing without loading all messages
conversationSchema.virtual('messageCount').get(function () {
  return this.messages.length
})

conversationSchema.set('toJSON', { virtuals: true })
conversationSchema.set('toObject', { virtuals: true })

export default mongoose.model('Conversation', conversationSchema)
