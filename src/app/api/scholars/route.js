import { NextResponse } from 'next/server'
import clientPromise from '@/lib/db'

// Card-level projection — only fields needed for the grid view
const CARD_PROJECTION = {
  _id: 0,
  id: 1,
  name: 1,
  title: 1,
  department: 1,
  position: 1,
  relevance_score: 1,
  should_email: 1,
  active_grants_count: 1,
  requirements: 1,
}

/** Safely parse an integer from a string, returning null if invalid */
function safeInt(value) {
  if (!value) return null
  const parsed = parseInt(value, 10)
  return Number.isNaN(parsed) ? null : parsed
}

export async function GET(request) {
  try {
    const client = await clientPromise
    const db = client.db('ufl_scholars_db')
    const collection = db.collection('scholars')

    const { searchParams } = request.nextUrl
    const page = safeInt(searchParams.get('page')) || 1
    const search = searchParams.get('search')
    const minScore = safeInt(searchParams.get('minScore'))
    const maxScore = safeInt(searchParams.get('maxScore'))
    const minGrants = safeInt(searchParams.get('minGrants'))
    const maxGrants = safeInt(searchParams.get('maxGrants'))
    const reqSearch = searchParams.get('reqSearch')
    const emailOnly = searchParams.get('emailOnly')
    const depts = searchParams.get('depts')
    const deptMode = searchParams.get('deptMode')
    const subDepts = searchParams.get('subDepts')
    const subDeptMode = searchParams.get('subDeptMode')
    const positions = searchParams.get('positions')
    const posMode = searchParams.get('posMode')

    const query = {}

    // Text search (name or title)
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
      ]
    }

    // Relevance score range
    if (minScore !== null || maxScore !== null) {
      query.relevance_score = {}
      if (minScore !== null) query.relevance_score.$gte = minScore
      if (maxScore !== null) query.relevance_score.$lte = maxScore
    }

    // Active grants range
    if (minGrants !== null || maxGrants !== null) {
      query.active_grants_count = {}
      if (minGrants !== null) query.active_grants_count.$gte = minGrants
      if (maxGrants !== null) query.active_grants_count.$lte = maxGrants
    }

    // CS requirements keyword search
    if (reqSearch) {
      query.requirements = { $elemMatch: { $regex: reqSearch, $options: 'i' } }
    }

    // Good match only (Score >= 50)
    if (emailOnly === 'true') {
      query.relevance_score = { $gte: 50 }
    }

    // Department filter (by prefix code)
    if (depts) {
      const deptList = depts.split(',')
      const deptRegexes = deptList.map(d => new RegExp(`^${d}-`, 'i'))
      if (deptMode === 'exclude') {
        query.department = { $not: { $in: deptRegexes } }
      } else {
        query.department = { $in: deptRegexes }
      }
    }

    // Sub-department filter (exact match)
    if (subDepts) {
      const subDeptList = subDepts.split(',')
      if (subDeptMode === 'exclude') {
        if (query.department) {
          if (!query.$and) query.$and = []
          query.$and.push({ department: { $nin: subDeptList } })
        } else {
          query.department = { $nin: subDeptList }
        }
      } else {
        if (query.department) {
          if (!query.$and) query.$and = []
          query.$and.push({ department: { $in: subDeptList } })
        } else {
          query.department = { $in: subDeptList }
        }
      }
    }

    // Position filter
    if (positions) {
      const posList = positions.split(',')
      if (posMode === 'exclude') {
        query.position = { $nin: posList }
      } else {
        query.position = { $in: posList }
      }
    }

    const limit = 25
    const skip = (page - 1) * limit

    // Aggregation to add publications_count without returning the full array
    const pipeline = [
      { $match: query },
      { $sort: { relevance_score: -1 } },
      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: limit },
            {
              $addFields: {
                publications_count: { $size: { $ifNull: ['$publications', []] } },
              },
            },
            { $project: { ...CARD_PROJECTION, publications_count: 1 } },
          ],
          total: [{ $count: 'count' }],
        },
      },
    ]

    const [result] = await collection.aggregate(pipeline).toArray()
    const data = result.data
    const total = result.total[0]?.count || 0

    return NextResponse.json({
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (err) {
    console.error('Error fetching scholars:', err)
    return NextResponse.json({ error: 'Failed to fetch scholars' }, { status: 500 })
  }
}
