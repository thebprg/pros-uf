import { NextResponse } from 'next/server'
import clientPromise from '@/lib/db'

export async function GET(request, { params }) {
  try {
    const client = await clientPromise
    const db = client.db('ufl_scholars_db')
    const collection = db.collection('scholars')

    const { id } = await params

    const scholar = await collection.findOne(
      { id },
      { projection: { _id: 0 } }
    )

    if (!scholar) {
      return NextResponse.json({ error: 'Scholar not found' }, { status: 404 })
    }

    return NextResponse.json(scholar)
  } catch (err) {
    console.error('Error fetching scholar:', err)
    return NextResponse.json({ error: 'Failed to fetch scholar' }, { status: 500 })
  }
}
