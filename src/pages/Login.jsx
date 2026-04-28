import { useState } from 'react'
import { api } from '../lib/api'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      await api.login(email, password)
      onLogin()
    } catch (err) {
      setError(err.message || 'Email ou senha incorretos')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px' }}>
      <div style={{ width:'100%', maxWidth:'420px' }}>
        <div style={{ textAlign:'center', marginBottom:'40px' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:'12px', marginBottom:'12px' }}>
            <div style={{ width:'44px', height:'44px', background:'var(--teal)', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px' }}>🚚</div>
            <div style={{ textAlign:'left' }}>
              <div style={{ fontSize:'20px', fontWeight:'700', letterSpacing:'-0.02em' }}>Transparisi</div>
              <div style={{ fontSize:'12px', color:'var(--muted)', fontFamily:'var(--mono)' }}>Business Intelligence</div>
            </div>
          </div>
          <p style={{ color:'var(--muted)', fontSize:'14px' }}>Acesso restrito aos sócios</p>
        </div>

        <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'16px', padding:'32px' }}>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom:'16px' }}>
              <label style={{ display:'block', fontSize:'12px', color:'var(--muted)', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.05em' }}>Email</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="socio@transparisi.com.br" required />
            </div>
            <div style={{ marginBottom:'24px' }}>
              <label style={{ display:'block', fontSize:'12px', color:'var(--muted)', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.05em' }}>Senha</label>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" required />
            </div>

            {error && (
              <div style={{ padding:'12px', borderRadius:'8px', marginBottom:'16px', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', color:'var(--red)', fontSize:'13px' }}>
                {error}
              </div>
            )}

            <button type="submit" className="btn-primary" style={{ width:'100%' }} disabled={loading}>
              {loading ? 'Verificando...' : 'Entrar no Painel'}
            </button>
          </form>
        </div>

        <p style={{ textAlign:'center', color:'var(--muted)', fontSize:'12px', marginTop:'24px' }}>
          Transparisi Transportes © 2025 — Acesso monitorado
        </p>
      </div>
    </div>
  )
}
