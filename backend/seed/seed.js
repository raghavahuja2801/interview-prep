import 'dotenv/config'
import mongoose from 'mongoose'
import Problem from '../models/Problem.js'
import { problems } from '../../src/data/problems.js'

const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://admin:Raghav3214!@localhost:27017/interview-prep?authSource=admin'

async function seed() {
  await mongoose.connect(MONGO_URI)
  console.log('Connected to MongoDB')

  await Problem.deleteMany({})
  console.log('Cleared existing problems')

  const docs = await Problem.insertMany(problems)
  console.log(`Seeded ${docs.length} problems`)

  await mongoose.disconnect()
  console.log('Done')
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
