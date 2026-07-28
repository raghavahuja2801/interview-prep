import mongoose from 'mongoose'

const problemSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    category: { type: String, required: true, enum: ['HLD', 'LLD'], index: true },
    icon: { type: String, required: true },
    difficulty: { type: String, required: true, enum: ['Easy', 'Medium', 'Hard'] },
    estimatedTime: { type: String, required: true },
    tags: { type: [String], default: [] },
    summary: { type: String, required: true },
    statement: { type: String, required: true },
    functionalRequirements: { type: [String], default: [] },
    nonFunctionalRequirements: { type: [String], default: [] },
    constraints: { type: [String], default: [] },
  },
  { timestamps: true }
)

export default mongoose.model('Problem', problemSchema)
