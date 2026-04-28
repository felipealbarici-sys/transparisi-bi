import { useState, useEffect } from 'react'
import { api } from './lib/api'
import Login from './pages/Login'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Lancamentos from './pages/Lancamentos'
import AnaliseFinanceira from './pages/AnaliseFinanceira'
import AnaliseOperacional from './pages/AnaliseOperacional'

export default function App() {
  const [session, setSession] = useState(undefined) // undefined = loading
  const [tab, setTab] = useState('dashboard')

  useEffect(() => {
    const s = api.getSession()
    setSession(s)
  }, [])

  if (session === undefined) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'var(--bg)' }}>
      <div style={{ color:'var(--muted)', fontFamily:'var(--mono)', fontSize:'13px' }}>carregando...</div>
    </div>
  )

  if (!session) return <Login onLogin={() => setSession(api.getSession())} />

  const pages = {
    dashboard: <Dashboard />,
    lancamentos: <Lancamentos />,
    financeira: <AnaliseFinanceira />,
    operacional: <AnaliseOperacional />,
  }

  return (
    <Layout tab={tab} setTab={setTab} user={session.user}
      onLogout={() => { api.logout(); setSession(null) }}>
      {pages[tab]}
    </Layout>
  )
}
