import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema(
  {
    role: { type: String, required: true, enum: ['user', 'assistant'] },
    content: { type: String, required: true },
  },
  { timestamps: true }
)

const conversationSchema = new mongoose.Schema(
  {
    problemId: { type: String, required: true, index: true },
    messages: [messageSchema],
    completed: { type: Boolean, default: false },
    startedAt: { type: Date, default: Date.now },
    lastActivityAt: { type: Date, default: Date.now },
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
