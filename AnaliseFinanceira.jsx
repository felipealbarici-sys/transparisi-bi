import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const fmt = v => 'R$ ' + (v||0).toLocaleString('pt-BR',{minimumFractionDigits:0,maximumFractionDigits:0})

const PLACAS = ['AIK2I98','ATB0D60','DVS0I20','ELQ1F80','EDT1F16','ELQ2A32','ELW2H60','GRW4H72','GSV0J49','GZG2C02','HMW4F97','ISZ1E42','PXS2A31','GRW4H71','GVK1J15','LLJ3E62','LLJ3E65','OMS5H75','PXS2A31']
const STATUS_COLORS = { 'Baixada':'var(--green)', 'A Vencer':'var(--gold)', 'Vencido':'var(--red)' }

function Section({ title, color='var(--teal)', children }) {
  return (
    <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'14px', overflow:'hidden', marginBottom:'20px' }}>
      <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:'10px' }}>
        <div style={{ width:'3px', height:'18px', borderRadius:'2px', background:color }} />
        <span style={{ fontWeight:'600', fontSize:'14px' }}>{title}</span>
      </div>
      <div>{children}</div>
    </div>
  )
}

export default function AnaliseOperacional() {
  const [d, setD] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const [pRes, sRes] = await Promise.all([
      supabase.from('operacoes_produto').select('*'),
      supabase.from('operacoes_servico').select('*'),
    ])
    const prod = pRes.data||[]; const serv = sRes.data||[]

    const sum = (arr,filter,key='valor_total') => arr.filter(filter).reduce((a,r)=>a+(r[key]||0),0)

    // By Placa
    const allPlacas = [...new Set([...prod.map(r=>r.placa), ...serv.map(r=>r.placa)].filter(Boolean))]
    const byPlaca = allPlacas.map(placa => {
      const rec  = sum(prod, r=>r.movimentacao==='Receita' && r.placa===placa)
      const cust = sum(prod, r=>r.movimentacao==='Custos'  && r.placa===placa)
      const comb = sum(prod, r=>r.movimentacao==='Custos'  && r.placa===placa && r.tipo_custo==='COMBUSTÍVEL S10')
      const comm = sum(prod, r=>r.movimentacao==='Custos'  && r.placa===placa && r.tipo_custo==='COMISSÃO')
      const mots = prod.filter(r=>r.movimentacao==='Receita'&&r.placa===placa).map(r=>r.motorista).filter(Boolean)
      const motorista = mots.length ? (mots.sort((a,b)=>mots.filter(x=>x===b).length-mots.filter(x=>x===a).length)[0]||'').split(' ')[0] : '-'
      return { placa, rec, cust, comb, comm, saldo:rec-cust, motorista }
    }).filter(p=>p.rec>0).sort((a,b)=>b.rec-a.rec)

    // By Tipo Custo
    const byCusto = {}
    prod.filter(r=>r.movimentacao==='Custos').forEach(r=>{ const k=r.tipo_custo||'Outros'; byCusto[k]=(byCusto[k]||0)+(r.valor_total||0) })

    // Status A/R
    const byStat = {}
    prod.filter(r=>r.movimentacao==='Receita').forEach(r=>{ if(r.status){byStat[r.status]=(byStat[r.status]||0)+(r.valor_total||0)} })
    const totAR = Object.values(byStat).reduce((a,v)=>a+v,0)

    // Contas vencidas
    const vencidas = prod.filter(r=>r.movimentacao==='Receita'&&r.status==='Vencido').sort((a,b)=>new Date(a.data_vencimento||0)-new Date(b.data_vencimento||0))

    setD({ byPlaca, byCusto, byStat, totAR, vencidas })
    setLoading(false)
  }

  if (loading) return <div style={{ padding:'40px', color:'var(--muted)' }}>Calculando...</div>
  if (!d) return null

  const { byPlaca, byCusto, byStat, totAR, vencidas } = d

  return (
    <div style={{ padding:'32px', maxWidth:'1200px' }}>
      <div style={{ marginBottom:'32px' }}>
        <h1 style={{ fontSize:'24px', fontWeight:'700', letterSpacing:'-0.02em', marginBottom:'4px' }}>Análise Operacional</h1>
        <p style={{ color:'var(--muted)', fontSize:'14px' }}>Performance por placa, custos e contas a receber</p>
      </div>

      {/* By Placa */}
      <Section title="Desempenho por Placa" color="var(--orange)">
        <div style={{ overflowX:'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Placa</th><th>Motorista</th>
                <th style={{textAlign:'right'}}>Receita</th>
                <th style={{textAlign:'right'}}>Custo Total</th>
                <th style={{textAlign:'right'}}>Combustível</th>
                <th style={{textAlign:'right'}}>Comissão</th>
                <th style={{textAlign:'right'}}>Saldo</th>
                <th style={{textAlign:'right'}}>Marg.</th>
              </tr>
            </thead>
            <tbody>
              {byPlaca.map(p=>{
                const marg = p.rec>0?p.saldo/p.rec:0
                return (
                  <tr key={p.placa}>
                    <td style={{ fontFamily:'var(--mono)', fontWeight:'600', color:'var(--teal)' }}>{p.placa}</td>
                    <td>{p.motorista}</td>
                    <td style={{ textAlign:'right', fontFamily:'var(--mono)', color:'var(--teal)' }}>{fmt(p.rec)}</td>
                    <td style={{ textAlign:'right', fontFamily:'var(--mono)' }}>{fmt(p.cust)}</td>
                    <td style={{ textAlign:'right', fontFamily:'var(--mono)', color:'var(--muted)' }}>{fmt(p.comb)}</td>
                    <td style={{ textAlign:'right', fontFamily:'var(--mono)', color:'var(--muted)' }}>{fmt(p.comm)}</td>
                    <td style={{ textAlign:'right', fontFamily:'var(--mono)', color:p.saldo>=0?'var(--green)':'var(--red)', fontWeight:'600' }}>{fmt(p.saldo)}</td>
                    <td style={{ textAlign:'right', fontFamily:'var(--mono)', color:marg>=0.3?'var(--green)':marg>=0.15?'var(--gold)':'var(--red)' }}>
                      {(marg*100).toFixed(1)}%
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr style={{ borderTop:'2px solid var(--border)', background:'var(--bg3)' }}>
                <td colSpan={2} style={{ fontWeight:'600', padding:'12px' }}>TOTAL FROTA</td>
                <td style={{ textAlign:'right', fontFamily:'var(--mono)', fontWeight:'600', padding:'12px', color:'var(--teal)' }}>{fmt(byPlaca.reduce((a,p)=>a+p.rec,0))}</td>
                <td style={{ textAlign:'right', fontFamily:'var(--mono)', fontWeight:'600', padding:'12px' }}>{fmt(byPlaca.reduce((a,p)=>a+p.cust,0))}</td>
                <td colSpan={2} />
                <td style={{ textAlign:'right', fontFamily:'var(--mono)', fontWeight:'600', padding:'12px', color:'var(--green)' }}>{fmt(byPlaca.reduce((a,p)=>a+p.saldo,0))}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </Section>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
        {/* Custos por tipo */}
        <Section title="Custos por Tipo" color="var(--orange)">
          {Object.entries(byCusto).sort((a,b)=>b[1]-a[1]).map(([tipo,val])=>(
            <div key={tipo} style={{ display:'flex', justifyContent:'space-between', padding:'10px 20px', borderBottom:'1px solid var(--border)' }}>
              <span style={{ fontSize:'13px' }}>{tipo}</span>
              <span style={{ fontFamily:'var(--mono)', fontSize:'13px', color:'var(--orange)' }}>{fmt(val)}</span>
            </div>
          ))}
        </Section>

        {/* Status A/R */}
        <Section title="Contas a Receber — Status" color="var(--teal)">
          {Object.entries(byStat).map(([stat,val])=>(
            <div key={stat} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 20px', borderBottom:'1px solid var(--border)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:STATUS_COLORS[stat]||'var(--muted)' }} />
                <span style={{ fontSize:'13px', fontWeight:'600', color:STATUS_COLORS[stat]||'var(--muted)' }}>{stat}</span>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontFamily:'var(--mono)', fontSize:'14px', color:STATUS_COLORS[stat]||'var(--text)' }}>{fmt(val)}</div>
                <div style={{ fontSize:'11px', color:'var(--muted)' }}>{totAR>0?((val/totAR)*100).toFixed(1)+'%':'-'}</div>
              </div>
            </div>
          ))}
          <div style={{ padding:'14px 20px', display:'flex', justifyContent:'space-between', background:'var(--bg3)' }}>
            <span style={{ fontWeight:'600', fontSize:'13px' }}>TOTAL</span>
            <span style={{ fontFamily:'var(--mono)', fontWeight:'600' }}>{fmt(totAR)}</span>
          </div>
        </Section>
      </div>

      {/* Contas vencidas */}
      {vencidas.length > 0 && (
        <Section title={`⚠ Contas Vencidas (${vencidas.length})`} color="var(--red)">
          <div style={{ overflowX:'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Vencimento</th><th>Cliente</th><th>Produto</th>
                  <th style={{textAlign:'right'}}>Valor</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {vencidas.slice(0,10).map((r,i)=>(
                  <tr key={i}>
                    <td style={{ fontFamily:'var(--mono)', color:'var(--red)', fontSize:'12px' }}>
                      {r.data_vencimento ? new Date(r.data_vencimento).toLocaleDateString('pt-BR') : '-'}
                    </td>
                    <td>{r.cliente||'-'}</td>
                    <td style={{ color:'var(--muted)' }}>{r.produto||'-'}</td>
                    <td style={{ textAlign:'right', fontFamily:'var(--mono)', color:'var(--red)', fontWeight:'600' }}>{fmt(r.valor_total)}</td>
                    <td><span style={{ background:'rgba(239,68,68,0.15)', color:'var(--red)', padding:'2px 8px', borderRadius:'4px', fontSize:'11px', fontWeight:'600' }}>VENCIDO</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}
    </div>
  )
}
