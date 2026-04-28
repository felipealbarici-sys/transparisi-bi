const NAV = [
  { id:'dashboard',   label:'Dashboard',          icon:'📊' },
  { id:'lancamentos', label:'Lançar Dados',        icon:'➕' },
  { id:'financeira',  label:'Análise Financeira',  icon:'📈' },
  { id:'operacional', label:'Análise Operacional', icon:'🔧' },
]

export default function Layout({ children, tab, setTab, user, onLogout }) {
  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'var(--bg)' }}>
      <aside style={{ width:'220px', flexShrink:0, background:'var(--bg2)', borderRight:'1px solid var(--border)', display:'flex', flexDirection:'column', position:'sticky', top:0, height:'100vh' }}>
        <div style={{ padding:'24px 20px 20px', borderBottom:'1px solid var(--border)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            <div style={{ width:'36px', height:'36px', background:'var(--teal)', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', flexShrink:0 }}>🚚</div>
            <div>
              <div style={{ fontWeight:'700', fontSize:'15px', letterSpacing:'-0.02em' }}>Transparisi</div>
              <div style={{ fontSize:'10px', color:'var(--muted)', fontFamily:'var(--mono)' }}>BI Portal</div>
            </div>
          </div>
        </div>

        <nav style={{ flex:1, padding:'16px 12px' }}>
          {NAV.map(item => (
            <button key={item.id} onClick={() => setTab(item.id)} style={{
              display:'flex', alignItems:'center', gap:'10px', width:'100%',
              padding:'10px 12px', borderRadius:'10px', border:'none',
              background: tab===item.id ? 'rgba(14,165,233,0.12)' : 'transparent',
              color: tab===item.id ? 'var(--teal)' : 'var(--muted)',
              fontWeight: tab===item.id ? '600' : '400',
              fontSize:'14px', textAlign:'left', marginBottom:'2px',
              transition:'all 0.15s', cursor:'pointer',
            }}>
              <span style={{ fontSize:'16px' }}>{item.icon}</span>
              {item.label}
              {tab===item.id && <div style={{ marginLeft:'auto', width:'4px', height:'4px', borderRadius:'50%', background:'var(--teal)' }}/>}
            </button>
          ))}
        </nav>

        <div style={{ padding:'16px 12px', borderTop:'1px solid var(--border)' }}>
          <div style={{ padding:'10px 12px', borderRadius:'10px', background:'var(--bg3)', marginBottom:'8px' }}>
            <div style={{ fontSize:'11px', color:'var(--muted)', marginBottom:'2px' }}>Conectado como</div>
            <div style={{ fontSize:'12px', fontFamily:'var(--mono)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {user?.email}
            </div>
          </div>
          <button onClick={onLogout} className="btn-ghost" style={{ width:'100%', fontSize:'13px' }}>Sair</button>
        </div>
      </aside>

      <main style={{ flex:1, overflow:'auto' }}>
        {children}
      </main>
    </div>
  )
}
