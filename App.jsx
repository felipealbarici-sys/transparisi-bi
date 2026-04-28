import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const fmt  = v => 'R$ ' + (v||0).toLocaleString('pt-BR',{minimumFractionDigits:0,maximumFractionDigits:0})
const fmtP = v => ((v||0)*100).toFixed(1) + '%'

function Table({ headers, rows, footer }) {
  return (
    <div style={{ overflowX:'auto' }}>
      <table>
        <thead><tr>{headers.map((h,i)=><th key={i} style={{textAlign:i>0?'right':'left'}}>{h}</th>)}</tr></thead>
        <tbody>
          {rows.map((row,i)=>(
            <tr key={i}>
              {row.map((cell,j)=>(
                <td key={j} style={{ textAlign:j>0?'right':'left', fontFamily:j>0?'var(--mono)':undefined,
                  color: j>0&&typeof cell==='number'&&cell<0?'var(--red)':undefined,
                  fontWeight: row._bold?'600':undefined }}>
                  {j>0 && typeof cell==='number' ? fmt(cell) : cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        {footer && (
          <tfoot>
            <tr style={{ borderTop:'2px solid var(--border)', background:'var(--bg3)' }}>
              {footer.map((cell,j)=>(
                <td key={j} style={{ textAlign:j>0?'right':'left', fontWeight:'600',
                  fontFamily:j>0?'var(--mono)':undefined, padding:'12px' }}>
                  {j>0 && typeof cell==='number' ? fmt(cell) : cell}
                </td>
              ))}
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  )
}

function Section({ title, color='var(--teal)', children }) {
  return (
    <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'14px', overflow:'hidden', marginBottom:'20px' }}>
      <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:'10px' }}>
        <div style={{ width:'3px', height:'18px', borderRadius:'2px', background:color }} />
        <span style={{ fontWeight:'600', fontSize:'14px' }}>{title}</span>
      </div>
      <div style={{ padding:'0 4px' }}>{children}</div>
    </div>
  )
}

export default function AnaliseFinanceira() {
  const [d, setD] = useState(null)
  const [loading, setLoading] = useState(true)

  const PRODUTOS   = ['Braspolpa','Molpec','Polpinha','Resíduo']
  const MOTORISTAS = ['ALEXSANDER SANNER','ANDRÉ CARLOS','CARLOS DAMACENA','CICERO RAFAEL','DANIEL RAMOS','FRANCISCO GENEROSO','JOSE CARLOS','JOSE LAILSON','JOSE SEBASTIÃO','KAUAN ALEIXO','MARCOS COSTA','MARCOS LIMA','MAURICIO GASOTO','VALTER DIAS PAIÃO JUNIOR']

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const [p,s,de] = await Promise.all([
      supabase.from('operacoes_produto').select('*'),
      supabase.from('operacoes_servico').select('*'),
      supabase.from('despesas').select('*'),
    ])
    const prod=p.data||[]; const serv=s.data||[]; const desp=de.data||[]

    const sum = (arr,filter,key='valor_total') => arr.filter(filter).reduce((a,r)=>a+(r[key]||0),0)

    const pRec  = sum(prod,r=>r.movimentacao==='Receita')
    const pCust = sum(prod,r=>r.movimentacao==='Custos')
    const sRec  = sum(serv,r=>r.movimentacao==='Receita')
    const sCust = sum(serv,r=>r.movimentacao==='Custos')
    const dTot  = Math.abs(sum(desp,()=>true,'valor'))
    const tRec=pRec+sRec; const tCust=pCust+sCust
    const mBruta=tRec-tCust; const lucro=mBruta-dTot

    // By produto
    const byProd = PRODUTOS.map(prod_name => {
      const rec  = sum(prod_arr=>prod_arr,r=>r.movimentacao==='Receita'&&r.produto===prod_name)
      const cust = sum(prod,r=>r.movimentacao==='Custos'&&r.produto===prod_name)
      const comm = sum(prod,r=>r.movimentacao==='Custos'&&r.produto===prod_name&&r.tipo_custo==='COMISSÃO')
      const comb = sum(prod,r=>r.movimentacao==='Custos'&&r.produto===prod_name&&r.tipo_custo==='COMBUSTÍVEL S10')
      const prodRec2 = sum(prod,r=>r.movimentacao==='Receita'&&r.produto===prod_name)
      return { prod_name, rec:prodRec2, cust, comm, comb, saldo:prodRec2-cust }
    })

    // By motorista
    const byMot = MOTORISTAS.map(mot_name => {
      const rec  = sum(prod,r=>r.movimentacao==='Receita'&&r.motorista===mot_name)
      const cust = sum(prod,r=>r.movimentacao==='Custos'&&r.motorista===mot_name)
      const comm = sum(prod,r=>r.movimentacao==='Custos'&&r.motorista===mot_name&&r.tipo_custo==='COMISSÃO')
      return { mot_name, rec, cust, comm, saldo:rec-cust, marg:rec>0?(rec-cust)/rec:0 }
    }).filter(m=>m.rec>0).sort((a,b)=>b.rec-a.rec)

    // Despesas by type
    const byDesp = {}
    desp.forEach(r=>{ const k=r.tipo?.trim()||'Outros'; byDesp[k]=(byDesp[k]||0)+Math.abs(r.valor||0) })

    setD({ pRec,pCust,sRec,sCust,dTot,tRec,tCust,mBruta,lucro,byProd,byMot,byDesp })
    setLoading(false)
  }

  if (loading) return <div style={{ padding:'40px', color:'var(--muted)' }}>Calculando análise...</div>
  if (!d) return null

  const { pRec,pCust,sRec,sCust,dTot,tRec,tCust,mBruta,lucro,byProd,byMot,byDesp } = d

  return (
    <div style={{ padding:'32px', maxWidth:'1100px' }}>
      <div style={{ marginBottom:'32px' }}>
        <h1 style={{ fontSize:'24px', fontWeight:'700', letterSpacing:'-0.02em', marginBottom:'4px' }}>Análise Financeira</h1>
        <p style={{ color:'var(--muted)', fontSize:'14px' }}>DRE, análise por produto e motorista</p>
      </div>

      {/* DRE */}
      <Section title="Demonstrativo de Resultado (DRE)" color="var(--teal)">
        {[
          { lbl:'(+) Receita — Operações Produto', val:pRec, color:'var(--teal)' },
          { lbl:'(+) Receita — Operações Serviço', val:sRec, color:'var(--teal)' },
          { lbl:'(=) RECEITA TOTAL', val:tRec, bold:true, color:'var(--teal)' },
          { lbl:'' },
          { lbl:'(-) Custos — Operações Produto', val:pCust, color:'var(--orange)' },
          { lbl:'(-) Custos — Operações Serviço', val:sCust, color:'var(--orange)' },
          { lbl:'(=) TOTAL CUSTOS', val:tCust, bold:true, color:'var(--orange)' },
          { lbl:'' },
          { lbl:'(=) MARGEM BRUTA', val:mBruta, bold:true, color:'var(--green)' },
          { lbl:'    Margem Bruta %', val:null, pct:tRec>0?mBruta/tRec:0, color:'var(--muted)' },
          { lbl:'' },
          { lbl:'(-) Despesas Gerais', val:dTot, color:'var(--red)' },
          { lbl:'' },
          { lbl:'(=) LUCRO LÍQUIDO', val:lucro, bold:true, color:lucro>=0?'var(--green)':'var(--red)' },
          { lbl:'    Margem Líquida %', val:null, pct:tRec>0?lucro/tRec:0, color:'var(--muted)' },
        ].map((row,i)=>(
          row.lbl==='' ? <div key={i} style={{height:'8px'}}/> :
          <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:`${row.bold?'14px':'10px'} 20px`,
            background:row.bold?'rgba(255,255,255,0.03)':'transparent',
            borderTop:row.bold?'1px solid var(--border)':'none' }}>
            <span style={{ fontSize:'13px', fontWeight:row.bold?'600':'400', color:row.bold?'var(--text)':'var(--muted)' }}>{row.lbl}</span>
            <span style={{ fontFamily:'var(--mono)', fontSize:'13px', fontWeight:row.bold?'600':'400', color:row.color||'var(--text)' }}>
              {row.pct!==undefined ? fmtP(row.pct) : fmt(row.val)}
            </span>
          </div>
        ))}
      </Section>

      {/* Por Produto */}
      <Section title="Análise por Produto" color="var(--teal)">
        <Table
          headers={['Produto','Receita','Custo Total','Comissão','Combustível','Resultado','Margem']}
          rows={byProd.map(p=>[
            p.prod_name, p.rec, p.cust, p.comm, p.comb, p.saldo,
            p.rec>0 ? (p.saldo/p.rec*100).toFixed(1)+'%' : '-'
          ])}
          footer={['TOTAL',
            byProd.reduce((s,p)=>s+p.rec,0),
            byProd.reduce((s,p)=>s+p.cust,0),
            byProd.reduce((s,p)=>s+p.comm,0),
            byProd.reduce((s,p)=>s+p.comb,0),
            byProd.reduce((s,p)=>s+p.saldo,0),
            (byProd.reduce((s,p)=>s+p.saldo,0)/byProd.reduce((s,p)=>s+p.rec,0)*100||0).toFixed(1)+'%'
          ]}
        />
      </Section>

      {/* Por Motorista */}
      <Section title="Análise por Motorista" color="var(--gold)">
        <Table
          headers={['#','Motorista','Receita','Custo Total','Comissão','Saldo','Margem']}
          rows={byMot.map((m,i)=>[
            `#${i+1}`,
            m.mot_name.split(' ')[0]+' '+m.mot_name.split(' ').slice(-1)[0],
            m.rec, m.cust, m.comm, m.saldo,
            (m.marg*100).toFixed(1)+'%'
          ])}
        />
      </Section>

      {/* Despesas por Tipo */}
      <Section title="Despesas por Categoria" color="var(--red)">
        <Table
          headers={['Categoria','Valor','% do Total']}
          rows={Object.entries(byDesp).sort((a,b)=>b[1]-a[1]).map(([tipo,val])=>[
            tipo, val, (val/dTot*100||0).toFixed(1)+'%'
          ])}
          footer={['TOTAL DESPESAS', dTot, '100%']}
        />
      </Section>
    </div>
  )
}
