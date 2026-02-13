/**
 * Run once to create MongoDB indexes for the scholars collection.
 * Usage: node scripts/create-indexes.js
 *
 * Requires MONGODB_URI environment variable (reads from .env.local)
 */

import { MongoClient } from 'mongodb'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Read .env.local manually (no dotenv dependency)
const envPath = resolve(__dirname, '..', '.env.local')
const envContent = readFileSync(envPath, 'utf-8')
const match = envContent.match(/MONGODB_URI=(.+)/)
if (!match) {
  console.error('MONGODB_URI not found in .env.local')
  process.exit(1)
}
const uri = match[1].trim()

async function createIndexes() {
  const client = new MongoClient(uri)

  try {
    await client.connect()
    console.log('Connected to MongoDB')

    const db = client.db('ufl_scholars_db')
    const collection = db.collection('scholars')

    // List existing indexes
    const existing = await collection.indexes()
    console.log(`\nExisting indexes (${existing.length}):`)
    existing.forEach(idx => console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)}`))

    // Create indexes
    const indexes = [
      { key: { relevance_score: -1 }, name: 'relevance_score_desc' },
      { key: { department: 1 }, name: 'department_asc' },
      { key: { position: 1 }, name: 'position_asc' },
      { key: { id: 1 }, name: 'id_asc', unique: true },
      { key: { should_email: 1 }, name: 'should_email_asc' },
      { key: { active_grants_count: 1 }, name: 'active_grants_count_asc' },
    ]

    console.log('\nCreating indexes...')
    for (const idx of indexes) {
      try {
        await collection.createIndex(idx.key, { name: idx.name, unique: idx.unique || false })
        console.log(`  ✓ ${idx.name}`)
      } catch (err) {
        if (err.code === 85 || err.code === 86) {
          console.log(`  ⏩ ${idx.name} (already exists)`)
        } else {
          console.error(`  ✗ ${idx.name}: ${err.message}`)
        }
      }
    }

    // Verify
    const updated = await collection.indexes()
    console.log(`\nFinal indexes (${updated.length}):`)
    updated.forEach(idx => console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)}`))

    console.log('\nDone!')
  } finally {
    await client.close()
  }
}

createIndexes().catch(console.error)
