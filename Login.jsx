import { useState, useEffect } from 'react'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts'
import { supabase } from '../lib/supabase'

const fmt = (v) => 'R$ ' + (v||0).toLocaleString('pt-BR', { minimumFractionDigits:0, maximumFractionDigits:0 })
const fmtK = (v) => 'R$ ' + ((v||0)/1000).toFixed(0) + 'k'

function KPI({ label, value, sub, color='var(--teal)', fmt_fn=fmt }) {
  return (
    <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'14px', padding:'20px', borderTop:`3px solid ${color}` }}>
      <div style={{ fontSize:'11px', color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'8px' }}>{label}</div>
      <div style={{ fontSize:'26px', fontWeight:'700', fontFamily:'var(--mono)', letterSpacing:'-0.02em', color }}>{fmt_fn(value)}</div>
      {sub && <div style={{ fontSize:'12px', color:'var(--muted)', marginTop:'6px' }}>{sub}</div>}
    </div>
  )
}

const CUSTOM_TOOLTIP = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'8px', padding:'10px 14px' }}>
      <div style={{ fontSize:'12px', color:'var(--muted)', marginBottom:'4px' }}>{label}</div>
      {payload.map((p,i) => (
        <div key={i} style={{ fontFamily:'var(--mono)', fontSize:'13px', color:p.color||'var(--text)' }}>
          {fmt(p.value)}
        </div>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const [data, setData] = useState({ kpis:{}, products:[], motoristas:[], status:[], despesas:[], monthly:[] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      // Fetch from Supabase
      const [prodRes, servRes, despRes] = await Promise.all([
        supabase.from('operacoes_produto').select('*'),
        supabase.from('operacoes_servico').select('*'),
        supabase.from('despesas').select('*'),
      ])

      const prod = prodRes.data || []
      const serv = servRes.data || []
      const desp = despRes.data || []

      // KPIs
      const prodRec  = prod.filter(r=>r.movimentacao==='Receita').reduce((s,r)=>s+(r.valor_total||0),0)
      const prodCust = prod.filter(r=>r.movimentacao==='Custos').reduce((s,r)=>s+(r.valor_total||0),0)
      const servRec  = serv.filter(r=>r.movimentacao==='Receita').reduce((s,r)=>s+(r.valor_total||0),0)
      const servCust = serv.filter(r=>r.movimentacao==='Custos').reduce((s,r)=>s+(r.valor_total||0),0)
      const despTot  = Math.abs(desp.reduce((s,r)=>s+(r.valor||0),0))
      const totalRec = prodRec+servRec
      const totalCust= prodCust+servCust
      const lucro    = totalRec-totalCust-despTot

      // By product
      const byProd = {}
      prod.filter(r=>r.movimentacao==='Receita').forEach(r=>{ byProd[r.produto]=(byProd[r.produto]||0)+(r.valor_total||0) })
      const products = Object.entries(byProd).sort((a,b)=>b[1]-a[1]).map(([name,value])=>({ name, value }))

      // By driver
      const byMot = {}
      prod.filter(r=>r.movimentacao==='Receita').forEach(r=>{ if(r.motorista) byMot[r.motorista]=(byMot[r.motorista]||0)+(r.valor_total||0) })
      const motoristas = Object.entries(byMot).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([name,value])=>({ name:name.split(' ')[0]+' '+name.split(' ').slice(-1)[0], value }))

      // Status A/R
      const byStat = {}
      prod.filter(r=>r.movimentacao==='Receita').forEach(r=>{ if(r.status) byStat[r.status]=(byStat[r.status]||0)+(r.valor_total||0) })
      const status = Object.entries(byStat).map(([name,value])=>({ name, value }))

      // Despesas by type
      const byDesp = {}
      desp.forEach(r=>{ if(r.tipo) byDesp[r.tipo]=(byDesp[r.tipo]||0)+Math.abs(r.valor||0) })
      const despesas = Object.entries(byDesp).sort((a,b)=>b[1]-a[1]).map(([name,value])=>({ name:name.trim(), value }))

      // Monthly (by mes field)
      const byMes = {}
      prod.filter(r=>r.movimentacao==='Receita').forEach(r=>{ if(r.mes) byMes[r.mes]=(byMes[r.mes]||0)+(r.valor_total||0) })
      const monthly = Object.entries(byMes).map(([mes,rec])=>({ mes, Receita:rec }))

      setData({ kpis:{ totalRec,totalCust,despTot,lucro,margem:(lucro/totalRec*100)||0 }, products, motoristas, status, despesas, monthly })
    } catch(e) {
      console.error(e)
    }
    setLoading(false)
  }

  if (loading) return <div style={{ padding:'40px', color:'var(--muted)' }}>Carregando dados...</div>

  const { kpis, products, motoristas, status, despesas } = data
  const PIE_COLORS = ['var(--teal)','var(--gold)','var(--red)','var(--green)']
  const STAT_COLORS = { 'Baixada':'var(--green)', 'A Vencer':'var(--gold)', 'Vencido':'var(--red)' }

  return (
    <div style={{ padding:'32px', maxWidth:'1400px' }}>
      {/* Header */}
      <div style={{ marginBottom:'32px', display:'flex', alignItems:'flex-end', justifyContent:'space-between' }}>
        <div>
          <h1 style={{ fontSize:'24px', fontWeight:'700', letterSpacing:'-0.02em', marginBottom:'4px' }}>Dashboard Financeiro</h1>
          <p style={{ color:'var(--muted)', fontSize:'14px' }}>Painel executivo — dados atualizados em tempo real</p>
        </div>
        <button onClick={loadData} className="btn-ghost" style={{ fontSize:'13px' }}>↻ Atualizar</button>
      </div>

      {/* KPI Cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:'16px', marginBottom:'32px' }}>
        <KPI label="Receita Total"      value={kpis.totalRec}  color="var(--teal)"   sub="Produto + Serviço" />
        <KPI label="Custos Operacionais" value={kpis.totalCust} color="var(--orange)"  sub="CPV + Frete + Comissão" />
        <KPI label="Despesas Gerais"    value={kpis.despTot}   color="var(--red)"    sub="Impostos + Seguros + Admin" />
        <KPI label="Lucro Líquido"      value={kpis.lucro}     color="var(--green)"  sub={`Margem ${(kpis.margem||0).toFixed(1)}%`} />
        <KPI label="Margem Líquida"     value={kpis.margem}    color="var(--gold)"   fmt_fn={v=>(v||0).toFixed(1)+'%'} sub="Sobre receita total" />
      </div>

      {/* Charts Row 1 */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'16px' }}>
        {/* Bar chart by product */}
        <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'14px', padding:'20px' }}>
          <div style={{ fontSize:'13px', fontWeight:'600', color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'20px' }}>
            Receita por Produto
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={products} layout="vertical" margin={{ left:10, right:30 }}>
              <XAxis type="number" tickFormatter={fmtK} tick={{ fontSize:11, fill:'var(--muted)', fontFamily:'var(--mono)' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize:12, fill:'var(--text)' }} axisLine={false} tickLine={false} width={80} />
              <Tooltip content={<CUSTOM_TOOLTIP/>} cursor={{ fill:'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="value" radius={[0,6,6,0]} fill="var(--teal)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart DRE */}
        <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'14px', padding:'20px' }}>
          <div style={{ fontSize:'13px', fontWeight:'600', color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'16px' }}>
            Distribuição do Resultado
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'24px' }}>
            <ResponsiveContainer width={180} height={180}>
              <PieChart>
                <Pie data={[
                  { name:'Custos', value:kpis.totalCust },
                  { name:'Despesas', value:kpis.despTot },
                  { name:'Lucro', value:Math.max(kpis.lucro,0) },
                ]} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                  {[PIE_COLORS[1],PIE_COLORS[2],PIE_COLORS[3]].map((c,i)=><Cell key={i} fill={c}/>)}
                </Pie>
                <Tooltip content={<CUSTOM_TOOLTIP/>} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex:1 }}>
              {[
                { label:'Custos Op.', val:kpis.totalCust, color:'var(--gold)' },
                { label:'Despesas',   val:kpis.despTot,   color:'var(--red)' },
                { label:'Lucro Líq.', val:kpis.lucro,     color:'var(--green)' },
              ].map(item=>(
                <div key={item.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:'1px solid var(--border)' }}>
                  <span style={{ display:'flex', alignItems:'center', gap:'8px', fontSize:'12px' }}>
                    <span style={{ width:'8px', height:'8px', borderRadius:'50%', background:item.color, flexShrink:0 }}/>
                    {item.label}
                  </span>
                  <span style={{ fontFamily:'var(--mono)', fontSize:'12px', color:item.color }}>{fmt(item.val)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'16px' }}>
        {/* Top Motoristas */}
        <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'14px', padding:'20px' }}>
          <div style={{ fontSize:'13px', fontWeight:'600', color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'16px' }}>
            Top Motoristas — Receita
          </div>
          <table>
            <thead><tr><th>#</th><th>Motorista</th><th style={{textAlign:'right'}}>Receita</th><th style={{textAlign:'right'}}>%</th></tr></thead>
            <tbody>
              {motoristas.slice(0,6).map((m,i)=>(
                <tr key={m.name}>
                  <td style={{ color:'var(--gold)', fontFamily:'var(--mono)', fontSize:'11px' }}>#{i+1}</td>
                  <td style={{ fontWeight:'500' }}>{m.name}</td>
                  <td style={{ textAlign:'right', fontFamily:'var(--mono)', color:'var(--teal)' }}>{fmt(m.value)}</td>
                  <td style={{ textAlign:'right', fontFamily:'var(--mono)', color:'var(--muted)', fontSize:'12px' }}>
                    {kpis.totalRec ? ((m.value/kpis.totalRec)*100).toFixed(1)+'%' : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Status A/R + Despesas */}
        <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
          <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'14px', padding:'20px' }}>
            <div style={{ fontSize:'13px', fontWeight:'600', color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'12px' }}>
              Contas a Receber — Status
            </div>
            <div style={{ display:'flex', gap:'12px' }}>
              {status.map(s=>(
                <div key={s.name} style={{ flex:1, padding:'12px', borderRadius:'10px', background:'var(--bg3)', borderLeft:`3px solid ${STAT_COLORS[s.name]||'var(--muted)'}` }}>
                  <div style={{ fontSize:'11px', color:'var(--muted)', marginBottom:'4px' }}>{s.name}</div>
                  <div style={{ fontFamily:'var(--mono)', fontSize:'14px', fontWeight:'600', color:STAT_COLORS[s.name]||'var(--text)' }}>{fmt(s.value)}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'14px', padding:'20px' }}>
            <div style={{ fontSize:'13px', fontWeight:'600', color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'12px' }}>
              Maiores Despesas
            </div>
            {despesas.slice(0,4).map((d,i)=>(
              <div key={d.name} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom: i<3?'1px solid var(--border)':'none' }}>
                <span style={{ fontSize:'13px' }}>{d.name}</span>
                <span style={{ fontFamily:'var(--mono)', fontSize:'13px', color:'var(--red)' }}>{fmt(d.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
