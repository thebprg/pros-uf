import { NextResponse } from 'next/server'
import clientPromise from '@/lib/db'

// Cache filter options in memory — departments and positions rarely change
let cachedFilters = null
let cacheTimestamp = 0
const CACHE_TTL = 60 * 60 * 1000 // 1 hour in ms

export async function GET() {
  try {
    const now = Date.now()

    // Return cached result if still valid
    if (cachedFilters && (now - cacheTimestamp) < CACHE_TTL) {
      return NextResponse.json(cachedFilters)
    }

    const client = await clientPromise
    const db = client.db('ufl_scholars_db')
    const collection = db.collection('scholars')

    const [departments, positions] = await Promise.all([
      collection.distinct('department'),
      collection.distinct('position'),
    ])

    cachedFilters = {
      departments: departments.sort(),
      positions: positions.sort(),
    }
    cacheTimestamp = now

    return NextResponse.json(cachedFilters)
  } catch (err) {
    console.error('Error fetching filters:', err)
    return NextResponse.json({ error: 'Failed to fetch filter options' }, { status: 500 })
  }
}
