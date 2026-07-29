import 'dotenv/config'
import mongoose from 'mongoose'
import Problem from '../models/Problem.js'
import { problems } from '../../src/data/problems.js'

const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://admin:Raghav3214!@localhost:27017/interview-prep?authSource=admin'

async function seed() {
  await mongoose.connect(MONGO_URI)
  console.log('Connected to MongoDB')

  // Upsert each problem by its string `id` so existing problems are updated
  // and new ones are inserted, but nothing is deleted.
  let inserted = 0
  let updated = 0

  for (const problem of problems) {
    const result = await Problem.updateOne(
      { id: problem.id },
      { $set: problem },
      { upsert: true }
    )
    if (result.upsertedCount > 0) inserted++
    else if (result.modifiedCount > 0) updated++
  }

  const total = await Problem.countDocuments()
  console.log(`Done — ${inserted} new, ${updated} updated, ${total} total in DB`)

  await mongoose.disconnect()
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
