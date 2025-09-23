// Lightweight localStorage-based auth for dev/demo when backend is removed
const KEY = 'ah_users_v1'

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function save(list) {
  try { localStorage.setItem(KEY, JSON.stringify(list)) } catch {
    // ignore write failures (private mode or quota exceeded)
  }
}

export function registerLocal({ full_name, role, password, username, email, phone, extra_data }) {
  const users = load()
  if (username && users.some((u) => u.username === username)) {
    const err = new Error('User already exists (username)')
    err.code = 409
    throw err
  }
  if (email && users.some((u) => u.email === email)) {
    const err = new Error('User already exists (email)')
    err.code = 409
    throw err
  }
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2)
  const created_at = new Date().toISOString()
  const record = { id, full_name, role, username: username || null, email: email || null, phone: phone || null, password, extra_data, created_at }
  users.push(record)
  save(users)
  const { password: _omit, ...safe } = record
  return { user: safe, token: 'local-' + id }
}

export function loginLocal({ role, username, email, phone, password }) {
  const users = load()
  const match = users.find((u) => {
    if (u.role !== role) return false
    if (username) return u.username === username
    if (email) return u.email === email
    if (phone) return u.phone === phone
    return false
  })
  if (!match) throw new Error('Invalid credentials')
  if ((match.password || '') !== (password || '')) throw new Error('Invalid credentials')
  const { password: _omit, ...safe } = match
  return { user: safe, token: 'local-' + match.id }
}
