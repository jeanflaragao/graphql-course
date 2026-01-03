import dotenv from 'dotenv'
import dotenvExpand from 'dotenv-expand'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const NODE_ENV = process.env.NODE_ENV || 'development'

const envPath = path.resolve(__dirname, `../.env.${NODE_ENV}`)

const env = dotenv.config({ path: envPath })

if (env.error) {
  throw new Error('❌ Failed to load .env file')
}

dotenvExpand.expand(env)

/**
 * Centralized, typed access to env vars
 */
export const ENV = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  APP_PORT: Number(process.env.APP_PORT ?? 3000),

  POSTGRES: {
    HOST: process.env.POSTGRES_HOST,
    PORT: Number(process.env.POSTGRES_PORT ?? 5432),
    DB: process.env.POSTGRES_DB,
    USER: process.env.POSTGRES_USER,
    PASSWORD: process.env.POSTGRES_PASSWORD,
    URL: process.env.DATABASE_URL,
  },
}

// ---- Validation (fail fast)
const required = [
  ENV.POSTGRES.HOST,
  ENV.POSTGRES.DB,
  ENV.POSTGRES.USER,
  ENV.POSTGRES.PASSWORD,
]

required.forEach((value, index) => {
  if (!value) {
    throw new Error(`❌ Missing required environment variable at index ${index}`)
  }
})
