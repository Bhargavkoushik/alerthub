const BASE = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'http://127.0.0.1:5000'

async function request(path, { method = 'GET', body, token } = {}) {
  let res
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch (e) {
    const err = new Error(`Cannot reach backend at ${BASE}. Is the server running?`)
    err.cause = e
    throw err
  }
  let data
  try { data = await res.json() } catch { data = null }
  if (!res.ok) {
    const msg = data?.error || data?.message || `HTTP ${res.status}`
    const err = new Error(msg)
    err.status = res.status
    throw err
  }
  return data
}

export async function registerUser(payload) {
  return request('/api/register', { method: 'POST', body: payload })
}

export async function loginUser(payload) {
  return request('/api/login', { method: 'POST', body: payload })
}
