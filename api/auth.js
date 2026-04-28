import jwt from 'jsonwebtoken'

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' })

  const { email, password } = req.body

  // Usuários definidos nas variáveis de ambiente do Vercel
  // Formato da env var USERS: "email:senha,email2:senha2"
  const rawUsers = process.env.USERS || ''
  const users = {}
  rawUsers.split(',').forEach(pair => {
    const idx = pair.indexOf(':')
    if (idx > 0) {
      const e = pair.slice(0, idx).trim()
      const p = pair.slice(idx + 1).trim()
      if (e && p) users[e] = p
    }
  })

  if (!email || !password || !users[email] || users[email] !== password) {
    return res.status(401).json({ error: 'Email ou senha incorretos' })
  }

  const secret = process.env.JWT_SECRET || 'transparisi_secret_2025'
  const token = jwt.sign({ email }, secret, { expiresIn: '30d' })

  return res.status(200).json({ token, email })
}
