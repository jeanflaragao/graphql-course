import { Pool } from 'pg'
import { ENV } from './env.js'

// Create connection pool
const pool = new Pool({
  user: ENV.POSTGRES.USER,
  host: ENV.POSTGRES.HOST,
  database: ENV.POSTGRES.DB,
  password: ENV.POSTGRES.PASSWORD,
  port: ENV.POSTGRES.PORT,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

// Test connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database')
})

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err)
  process.exit(1)
})

// Helper function to run queries
const query = (text, params = []) => {
  console.log('🔍 QUERY:', text)
  console.log('📊 PARAMS:', params)
  return pool.query(text, params)
}

// ✅ Proper ESM export
export default {
  pool,
  query,
}
