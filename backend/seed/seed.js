import 'dotenv/config'
import mongoose from 'mongoose'
import Problem from '../models/Problem.js'
import { cacheDel } from '../services/redis.js'
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

  // Flush the cached problem lists so re-seeded data is visible immediately
  // instead of waiting out the 2-day TTL.
  await Promise.allSettled([
    cacheDel('problems:list:all'),
    cacheDel('problems:list:HLD'),
    cacheDel('problems:list:LLD'),
  ])
  console.log('Problem cache flushed')

  await mongoose.disconnect()
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
