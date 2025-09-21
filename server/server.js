import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { query, health } from './db.js'

const app = express()
const PORT = process.env.PORT || 5000
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me'

app.use(cors())
app.use(express.json())

// Health endpoint
app.get('/api/health', async (req, res) => {
  const db = await health()
  res.json({ ok: true, db })
})

// Normalize identifier input
function parseIdentifier(body) {
  const { username, email, phone, email_or_phone } = body || {}
  if (username) return { field: 'username', value: String(username).trim() }
  if (email) return { field: 'email', value: String(email).trim().toLowerCase() }
  if (phone) return { field: 'phone', value: String(phone).trim() }
  if (email_or_phone) {
    const v = String(email_or_phone).trim()
    if (v.includes('@')) return { field: 'email', value: v.toLowerCase() }
    return { field: 'phone', value: v }
  }
  return null
}

// Register
app.post('/api/register', async (req, res) => {
  try {
    const { full_name, role, password, extra_data } = req.body || {}
    const ident = parseIdentifier(req.body)
    if (!full_name || !role || !password || !ident) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const salt = await bcrypt.genSalt(10)
    const password_hash = await bcrypt.hash(password, salt)

    const fields = ['full_name', 'role', ident.field, 'password_hash', 'extra_data']
    const values = [full_name, role, ident.value, password_hash, extra_data ?? null]
    const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ')

    const sql = `INSERT INTO users(${fields.join(',')}) VALUES (${placeholders}) RETURNING id, full_name, role, username, email, phone, extra_data, created_at`

    const { rows } = await query(sql, values)
    const user = rows[0]
    return res.status(201).json({ user })
  } catch (e) {
    if (e?.code === '23505') {
      // unique violation
      return res.status(409).json({ error: 'User already exists' })
    }
    console.error('Register error:', e)
    res.status(500).json({ error: 'Registration failed' })
  }
})

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { role, password } = req.body || {}
    const ident = parseIdentifier(req.body)
    if (!role || !password || !ident) {
      return res.status(400).json({ error: 'Missing credentials' })
    }

    const sql = `SELECT id, full_name, role, username, email, phone, password_hash, extra_data, created_at FROM users WHERE ${ident.field} = $1 AND role = $2`
    const { rows } = await query(sql, [ident.value, role])
    const user = rows[0]
    if (!user) return res.status(401).json({ error: 'Invalid credentials' })

    const ok = await bcrypt.compare(password, user.password_hash || '')
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' })

    const { password_hash, ...safe } = user
    const token = jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' })
    res.json({ user: safe, token })
  } catch (e) {
    console.error('Login error:', e)
    res.status(500).json({ error: 'Login failed' })
  }
})

app.listen(PORT, () => {
  console.log(`AlertHub server listening on http://localhost:${PORT}`)
})
