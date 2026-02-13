import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI
const options = {}

if (!uri) {
  throw new Error('MONGODB_URI environment variable is not defined')
}

let clientPromise

if (process.env.NODE_ENV === 'development') {
  // In development, use global variable to preserve connection across hot-reloads
  if (!global._mongoClientPromise) {
    const client = new MongoClient(uri, options)
    global._mongoClientPromise = client.connect()
  }
  clientPromise = global._mongoClientPromise
} else {
  const client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export default clientPromise
