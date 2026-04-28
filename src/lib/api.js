// ══════════════════════════════════════════════════════════════════
// Cliente da API — substitui o Supabase
// Toda comunicação vai para as Vercel Functions em /api/
// ══════════════════════════════════════════════════════════════════

const BASE = '/api'

function getToken() {
  return localStorage.getItem('transparisi_token')
}

function getUser() {
  try {
    const u = localStorage.getItem('transparisi_user')
    return u ? JSON.parse(u) : null
  } catch { return null }
}

function authHeader() {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...authHeader(), ...(options.headers || {}) },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || `Erro ${res.status}`)
  return data
}

export const api = {
  // ── Autenticação ───────────────────────────────────────────────
  async login(email, password) {
    const data = await request('/auth', {
      method: 'POST',
      body: { email, password },
    })
    localStorage.setItem('transparisi_token', data.token)
    localStorage.setItem('transparisi_user', JSON.stringify({ email: data.email }))
    return data
  },

  logout() {
    localStorage.removeItem('transparisi_token')
    localStorage.removeItem('transparisi_user')
  },

  getSession() {
    const token = getToken()
    const user = getUser()
    if (!token || !user) return null
    return { user }
  },

  // ── Dados ──────────────────────────────────────────────────────
  async getAll(table) {
    return request(`/query?table=${table}`)
  },

  async insert(table, rows) {
    const body = Array.isArray(rows) ? rows : [rows]
    return request(`/query?table=${table}`, { method: 'POST', body })
  },
}
