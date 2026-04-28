import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mode, setMode] = useState('login') // 'login' | 'reset'

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    setLoading(false)
  }

  const handleReset = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin
    })
    if (error) setError(error.message)
    else setError('✓ Link de recuperação enviado para seu email.')
    setLoading(false)
  }

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px' }}>
      <div style={{ width:'100%', maxWidth:'420px' }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:'40px' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:'12px', marginBottom:'12px' }}>
            <div style={{ width:'44px', height:'44px', background:'var(--teal)', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px' }}>🚚</div>
            <div style={{ textAlign:'left' }}>
              <div style={{ fontSize:'20px', fontWeight:'700', letterSpacing:'-0.02em' }}>Transparisi</div>
              <div style={{ fontSize:'12px', color:'var(--muted)', fontFamily:'var(--mono)' }}>Business Intelligence</div>
            </div>
          </div>
          <p style={{ color:'var(--muted)', fontSize:'14px' }}>
            {mode === 'login' ? 'Acesso restrito aos sócios' : 'Recuperar senha'}
          </p>
        </div>

        {/* Card */}
        <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'16px', padding:'32px' }}>
          <form onSubmit={mode === 'login' ? handleLogin : handleReset}>
            <div style={{ marginBottom:'16px' }}>
              <label style={{ display:'block', fontSize:'12px', color:'var(--muted)', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.05em' }}>
                Email
              </label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
                placeholder="socio@transparisi.com.br" required />
            </div>

            {mode === 'login' && (
              <div style={{ marginBottom:'24px' }}>
                <label style={{ display:'block', fontSize:'12px', color:'var(--muted)', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.05em' }}>
                  Senha
                </label>
                <input type="password" value={password} onChange={e=>setPassword(e.target.value)}
                  placeholder="••••••••" required />
              </div>
            )}

            {error && (
              <div style={{ padding:'12px', borderRadius:'8px', marginBottom:'16px',
                background: error.startsWith('✓') ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                border: `1px solid ${error.startsWith('✓') ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                color: error.startsWith('✓') ? 'var(--green)' : 'var(--red)',
                fontSize:'13px'
              }}>
                {error}
              </div>
            )}

            <button type="submit" className="btn-primary" style={{ width:'100%', marginBottom:'16px' }} disabled={loading}>
              {loading ? 'Aguarde...' : (mode === 'login' ? 'Entrar no Painel' : 'Enviar Link')}
            </button>

            <div style={{ textAlign:'center' }}>
              <button type="button" onClick={() => { setMode(mode==='login'?'reset':'login'); setError('') }}
                style={{ background:'none', border:'none', color:'var(--teal)', fontSize:'13px' }}>
                {mode === 'login' ? 'Esqueci minha senha' : '← Voltar para o login'}
              </button>
            </div>
          </form>
        </div>

        <p style={{ textAlign:'center', color:'var(--muted)', fontSize:'12px', marginTop:'24px' }}>
          Transparisi Transportes © 2025 — Acesso monitorado
        </p>
      </div>
    </div>
  )
}
