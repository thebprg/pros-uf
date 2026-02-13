import { NextResponse } from 'next/server'
import clientPromise from '@/lib/db'

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db('ufl_scholars_db')
    const collection = db.collection('scholars')

    const [departments, positions] = await Promise.all([
      collection.distinct('department'),
      collection.distinct('position'),
    ])

    return NextResponse.json({
      departments: departments.sort(),
      positions: positions.sort(),
    })
  } catch (err) {
    console.error('Error fetching filters:', err)
    return NextResponse.json({ error: 'Failed to fetch filter options' }, { status: 500 })
  }
}
