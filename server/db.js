import pg from 'pg'

const { Pool } = pg

let pool

export function getPool() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) throw new Error('DATABASE_URL not set')
    const useSSL = /^true$/i.test(process.env.DB_SSL || '')
    pool = new Pool({ connectionString, ssl: useSSL ? { rejectUnauthorized: false } : false })
  }
  return pool
}

export async function query(text, params) {
  const p = getPool()
  const res = await p.query(text, params)
  return res
}

export async function health() {
  try {
    await query('SELECT 1 AS ok')
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e.message }
  }
}
