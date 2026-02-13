import { NextResponse } from 'next/server'
import clientPromise from '@/lib/db'

export async function POST(request) {
  try {
    const client = await clientPromise
    const db = client.db('ufl_scholars_db')
    const collection = db.collection('scholars')

    const { ids } = await request.json()
    if (!ids || !Array.isArray(ids)) {
      return NextResponse.json({ error: 'ids array required' }, { status: 400 })
    }

    const scholars = await collection
      .find({ id: { $in: ids } }, { projection: { _id: 0 } })
      .toArray()

    return NextResponse.json(scholars)
  } catch (err) {
    console.error('Error fetching batch:', err)
    return NextResponse.json({ error: 'Failed to fetch scholars batch' }, { status: 500 })
  }
}
