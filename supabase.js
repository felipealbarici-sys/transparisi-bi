import { useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import * as XLSX from 'xlsx'

const TIPOS = ['Operações Produto', 'Operações Serviço', 'Despesas']
const PRODUTOS = ['Braspolpa', 'Molpec', 'Polpinha', 'Resíduo']
const MOTORISTAS = ['ALEXSANDER SANNER','ANDRÉ CARLOS','CARLOS DAMACENA','CICERO RAFAEL',
  'DANIEL RAMOS','FRANCISCO GENEROSO','JOSE CARLOS','JOSE LAILSON','JOSE SEBASTIÃO',
  'KAUAN ALEIXO','MARCOS COSTA','MARCOS LIMA','MAURICIO GASOTO','VALTER DIAS PAIÃO JUNIOR']
const PLACAS = ['AIK2I98','ATB0D60','DVS0I20','ELQ1F80','EDT1F16','ELQ2A32',
  'ELW2H60','GRW4H72','GSV0J49','GZG2C02','HMW4F97','ISZ1E42','PXS2A31']
const TIPOS_CUSTO = ['Valor Produto','Frete','COMISSÃO','COMBUSTÍVEL S10','CARREGAMENTO','SILO']
const TIPOS_DESP = ['DESPESA COM CAMINHÃO','ESCRITÓRIO','ESTOQUE','FUNCIONÁRIOS','IMPOSTO',
  'OFICINA','PÁ CARREGADEIRA','SEGURO','SINDICATO','SÍTIO','EMPILHADEIRA']
const STATUS = ['Baixada','A Vencer','Vencido']
const MOVIMENTACAO = ['Receita','Custos']

function Field({ label, children }) {
  return (
    <div>
      <label style={{ display:'block', fontSize:'11px', color:'var(--muted)', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.06em' }}>
        {label}
      </label>
      {children}
    </div>
  )
}

function SelectField({ label, value, onChange, options }) {
  return (
    <Field label={label}>
      <select value={value} onChange={e=>onChange(e.target.value)}>
        <option value="">— selecione —</option>
        {options.map(o=><option key={o} value={o}>{o}</option>)}
      </select>
    </Field>
  )
}

export default function Lancamentos() {
  const [tipo, setTipo] = useState('Operações Produto')
  const [mode, setMode] = useState('choice') // 'choice' | 'form' | 'upload'
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(null)
  const fileRef = useRef()

  // Form state - Produto
  const [formProd, setFormProd] = useState({
    data:'', movimentacao:'Receita', placa:'', motorista:'', produto:'', tipo_custo:'',
    quantidade:'', valor_unitario:'', valor_total:'', cliente:'', cidade:'', status:'A Vencer',
    data_vencimento:'', condicao:'', forma_recebimento:'', nota:'', obs:''
  })

  // Form state - Despesa
  const [formDesp, setFormDesp] = useState({
    data:'', tipo:'', placa:'', fornecedor:'', valor:'', empresa:'Transparisi', forma_pagamento:''
  })

  const fpProd = (k) => (v) => {
    const updated = { ...formProd, [k]: v }
    // Auto-calc valor_total
    if (k==='quantidade' || k==='valor_unitario') {
      const q = parseFloat(k==='quantidade'?v:updated.quantidade)||0
      const u = parseFloat(k==='valor_unitario'?v:updated.valor_unitario)||0
      updated.valor_total = (q*u).toFixed(2)
    }
    setFormProd(updated)
  }

  const saveProd = async (e) => {
    e.preventDefault(); setSaving(true); setMsg(null)
    try {
      const d = { ...formProd,
        quantidade: parseFloat(formProd.quantidade)||null,
        valor_unitario: parseFloat(formProd.valor_unitario)||null,
        valor_total: parseFloat(formProd.valor_total)||null,
        mes: formProd.data ? new Date(formProd.data).toLocaleString('pt-BR',{month:'short'}).toLowerCase() : null,
      }
      const { error } = await supabase.from('operacoes_produto').insert([d])
      if (error) throw error
      setMsg({ type:'ok', text:'Operação lançada com sucesso!' })
      setFormProd({ data:'',movimentacao:'Receita',placa:'',motorista:'',produto:'',tipo_custo:'', quantidade:'',valor_unitario:'',valor_total:'',cliente:'',cidade:'',status:'A Vencer', data_vencimento:'',condicao:'',forma_recebimento:'',nota:'',obs:'' })
    } catch(e) {
      setMsg({ type:'err', text: e.message })
    }
    setSaving(false)
  }

  const saveDesp = async (e) => {
    e.preventDefault(); setSaving(true); setMsg(null)
    try {
      const d = { ...formDesp,
        valor: parseFloat(formDesp.valor.replace(',','.'))||null,
        mes: formDesp.data ? new Date(formDesp.data).toLocaleString('pt-BR',{month:'short'}).toLowerCase() : null,
      }
      const { error } = await supabase.from('despesas').insert([d])
      if (error) throw error
      setMsg({ type:'ok', text:'Despesa lançada com sucesso!' })
      setFormDesp({ data:'',tipo:'',placa:'',fornecedor:'',valor:'',empresa:'Transparisi',forma_pagamento:'' })
    } catch(e) {
      setMsg({ type:'err', text: e.message })
    }
    setSaving(false)
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return
    setSaving(true); setMsg(null); setUploadProgress('Lendo arquivo...')
    try {
      const buf = await file.arrayBuffer()
      const wb  = XLSX.read(buf, { type:'array', cellDates:true })

      let inserted = 0
      const sheetMap = {
        '1. Operações de Produto ': { table:'operacoes_produto', mapFn: mapProd },
        '2. Operações Serviço':     { table:'operacoes_servico', mapFn: mapServ },
        '3. DataBaseDespesas ':     { table:'despesas',           mapFn: mapDesp },
      }

      for (const [sheetName, cfg] of Object.entries(sheetMap)) {
        if (!wb.SheetNames.includes(sheetName)) continue
        const ws = wb.Sheets[sheetName]
        const rows = XLSX.utils.sheet_to_json(ws, { header:1, defval:null })
        const headerRow = rows.findIndex(r => r.some(c => c && String(c).includes('DATA')))
        if (headerRow < 0) continue
        const headers = rows[headerRow].map(h=>String(h||'').trim())
        const data = rows.slice(headerRow+1)
          .filter(r => r.some(c=>c!==null && c!==''))
          .map(r => {
            const obj = {}
            headers.forEach((h,i) => { obj[h] = r[i] })
            return cfg.mapFn(obj)
          }).filter(Boolean)

        if (data.length === 0) continue
        setUploadProgress(`Inserindo ${data.length} registros em ${cfg.table}...`)

        const BATCH = 100
        for (let i=0; i<data.length; i+=BATCH) {
          const { error } = await supabase.from(cfg.table).insert(data.slice(i,i+BATCH))
          if (error) throw new Error(`${cfg.table}: ${error.message}`)
          inserted += Math.min(BATCH, data.length-i)
        }
      }
      setMsg({ type:'ok', text:`Upload concluído! ${inserted} registros importados.` })
    } catch(err) {
      setMsg({ type:'err', text: err.message })
    }
    setUploadProgress(null); setSaving(false)
    e.target.value = ''
  }

  function mapProd(r) {
    const vtKey = Object.keys(r).find(k=>k.includes('Valor total'))
    const vt = parseFloat(r[vtKey])||null
    if (!r['DATA'] && !r['Mês']) return null
    return {
      data: r['DATA'] ? new Date(r['DATA']).toISOString().split('T')[0] : null,
      mes: r['Mês']||null,
      movimentacao: (r['Movimentação financeira ']||'').trim(),
      placa: (r['Placa ']||r['Placa']||'').trim(),
      motorista: (r['Motorista']||'').trim(),
      produto: (r['Produto ']||r['Produto']||'').trim(),
      fornecedor: (r['Fornecedor']||'').trim(),
      tipo_custo: (r['Tipo Custo']||'').trim(),
      quantidade: parseFloat(r['Quantidade '])||null,
      valor_unitario: parseFloat(r['Valor Unitário '])||null,
      valor_total: vt,
      cliente: (r['Cliente ']||'').trim(),
      cidade: (r['Cidade']||'').trim(),
      status: (r['Status ']||'').trim(),
      nota: String(r['Nota']||'').trim(),
      condicao: (r['Condição ']||'').trim(),
      forma_recebimento: (r['Forma de Recebimento']||'').trim(),
      obs: (r['Obs.']||'').trim(),
    }
  }

  function mapServ(r) {
    const vtKey = Object.keys(r).find(k=>k.toLowerCase().includes('valor total'))
    const vt = parseFloat(r[vtKey])||null
    if (!r['DATA']) return null
    return {
      data: new Date(r['DATA']).toISOString().split('T')[0],
      mes: r['Mês']||null,
      movimentacao: (r['Movimentação financeira ']||'').trim(),
      placa: (r['Placa']||'').trim(),
      placa_carreta: (r['Placa Carreta']||'').trim(),
      km_rodado: parseFloat(r['Km rodado'])||null,
      motorista: (r['Motorista']||'').trim(),
      produto: (r['Produto ']||'').trim(),
      remetente: (r['Remetente']||'').trim(),
      destinatario: (r['Destinatário']||'').trim(),
      valor_total: vt,
      status: (r['Status ']||'').trim(),
    }
  }

  function mapDesp(r) {
    if (!r['DATA'] && !r['Movimentação']) return null
    const val = parseFloat(r['Valor'])||null
    if (!val) return null
    return {
      data: r['DATA'] ? new Date(r['DATA']).toISOString().split('T')[0] : null,
      movimentacao: (r['Movimentação']||r['Mov']||'').trim(),
      tipo: (r['Tipo de Despesa']||r['Tipo']||'').trim(),
      placa: (r['Placa']||'').trim(),
      fornecedor: (r['Fornecedor']||'').trim(),
      valor: val,
      empresa: (r['Empresa']||'').trim(),
      forma_pagamento: (r['Forma de Pagamento']||'').trim(),
    }
  }

  const msgStyle = (t) => ({
    padding:'12px 16px', borderRadius:'10px', marginBottom:'20px', fontSize:'13px',
    background: t==='ok'?'rgba(16,185,129,0.1)':'rgba(239,68,68,0.1)',
    border:`1px solid ${t==='ok'?'rgba(16,185,129,0.3)':'rgba(239,68,68,0.3)'}`,
    color: t==='ok'?'var(--green)':'var(--red)',
  })

  return (
    <div style={{ padding:'32px', maxWidth:'900px' }}>
      <h1 style={{ fontSize:'24px', fontWeight:'700', letterSpacing:'-0.02em', marginBottom:'4px' }}>Lançar Dados</h1>
      <p style={{ color:'var(--muted)', fontSize:'14px', marginBottom:'28px' }}>Insira dados manualmente ou importe uma planilha Excel</p>

      {/* Tipo selector */}
      <div style={{ display:'flex', gap:'8px', marginBottom:'24px' }}>
        {TIPOS.map(t=>(
          <button key={t} onClick={()=>{ setTipo(t); setMode('choice'); setMsg(null) }}
            style={{ padding:'8px 16px', borderRadius:'8px', border:'1px solid var(--border)',
              background: tipo===t?'rgba(14,165,233,0.12)':'transparent',
              color: tipo===t?'var(--teal)':'var(--muted)', fontSize:'13px', fontWeight:tipo===t?'600':'400',
              cursor:'pointer', transition:'all 0.15s' }}>
            {t}
          </button>
        ))}
      </div>

      {/* Mode choice */}
      {mode === 'choice' && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', maxWidth:'600px' }}>
          <button onClick={()=>setMode('form')} style={{
            background:'var(--card)', border:'1px solid var(--border)', borderRadius:'14px',
            padding:'28px', textAlign:'left', cursor:'pointer', transition:'border-color 0.15s',
          }}
            onMouseEnter={e=>e.currentTarget.style.borderColor='var(--teal)'}
            onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}>
            <div style={{ fontSize:'28px', marginBottom:'12px' }}>✏️</div>
            <div style={{ fontWeight:'600', fontSize:'15px', marginBottom:'6px' }}>Preencher formulário</div>
            <div style={{ color:'var(--muted)', fontSize:'13px' }}>Lançar um registro por vez com validação automática dos campos</div>
          </button>
          <button onClick={()=>setMode('upload')} style={{
            background:'var(--card)', border:'1px solid var(--border)', borderRadius:'14px',
            padding:'28px', textAlign:'left', cursor:'pointer', transition:'border-color 0.15s',
          }}
            onMouseEnter={e=>e.currentTarget.style.borderColor='var(--teal)'}
            onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}>
            <div style={{ fontSize:'28px', marginBottom:'12px' }}>📁</div>
            <div style={{ fontWeight:'600', fontSize:'15px', marginBottom:'6px' }}>Importar planilha Excel</div>
            <div style={{ color:'var(--muted)', fontSize:'13px' }}>Envie o arquivo .xlsx com múltiplos registros de uma vez</div>
          </button>
        </div>
      )}

      {msg && <div style={msgStyle(msg.type)}>{msg.text}</div>}

      {/* FORM MODE */}
      {mode === 'form' && tipo !== 'Despesas' && (
        <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'14px', padding:'28px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'24px' }}>
            <h2 style={{ fontSize:'16px', fontWeight:'600' }}>Novo registro — {tipo}</h2>
            <button onClick={()=>setMode('choice')} style={{ background:'none', border:'none', color:'var(--muted)', cursor:'pointer', fontSize:'13px' }}>← Voltar</button>
          </div>
          <form onSubmit={saveProd}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'16px', marginBottom:'16px' }}>
              <Field label="Data *"><input type="date" value={formProd.data} onChange={e=>fpProd('data')(e.target.value)} required /></Field>
              <SelectField label="Movimentação *" value={formProd.movimentacao} onChange={fpProd('movimentacao')} options={MOVIMENTACAO} />
              <SelectField label="Status" value={formProd.status} onChange={fpProd('status')} options={STATUS} />
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'16px', marginBottom:'16px' }}>
              <SelectField label="Placa" value={formProd.placa} onChange={fpProd('placa')} options={PLACAS} />
              <SelectField label="Motorista" value={formProd.motorista} onChange={fpProd('motorista')} options={MOTORISTAS} />
              <SelectField label="Produto" value={formProd.produto} onChange={fpProd('produto')} options={PRODUTOS} />
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'16px', marginBottom:'16px' }}>
              <SelectField label="Tipo de Custo" value={formProd.tipo_custo} onChange={fpProd('tipo_custo')} options={TIPOS_CUSTO} />
              <Field label="Quantidade"><input type="number" step="0.01" value={formProd.quantidade} onChange={e=>fpProd('quantidade')(e.target.value)} /></Field>
              <Field label="Valor Unitário (R$)"><input type="number" step="0.01" value={formProd.valor_unitario} onChange={e=>fpProd('valor_unitario')(e.target.value)} /></Field>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'16px', marginBottom:'16px' }}>
              <Field label="Valor Total (R$) — auto">
                <input type="number" step="0.01" value={formProd.valor_total} onChange={e=>fpProd('valor_total')(e.target.value)} style={{ borderColor:'var(--teal)', opacity:0.8 }} />
              </Field>
              <Field label="Cliente"><input value={formProd.cliente} onChange={e=>fpProd('cliente')(e.target.value)} /></Field>
              <Field label="Cidade"><input value={formProd.cidade} onChange={e=>fpProd('cidade')(e.target.value)} /></Field>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'16px', marginBottom:'24px' }}>
              <Field label="Vencimento"><input type="date" value={formProd.data_vencimento} onChange={e=>fpProd('data_vencimento')(e.target.value)} /></Field>
              <Field label="Condição"><input value={formProd.condicao} onChange={e=>fpProd('condicao')(e.target.value)} /></Field>
              <Field label="Forma de Recebimento"><input value={formProd.forma_recebimento} onChange={e=>fpProd('forma_recebimento')(e.target.value)} /></Field>
            </div>
            <div style={{ display:'flex', gap:'12px' }}>
              <button type="submit" className="btn-primary" disabled={saving}>{saving?'Salvando...':'Salvar Registro'}</button>
              <button type="button" className="btn-ghost" onClick={()=>setMode('choice')}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {mode === 'form' && tipo === 'Despesas' && (
        <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'14px', padding:'28px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'24px' }}>
            <h2 style={{ fontSize:'16px', fontWeight:'600' }}>Nova Despesa</h2>
            <button onClick={()=>setMode('choice')} style={{ background:'none', border:'none', color:'var(--muted)', cursor:'pointer', fontSize:'13px' }}>← Voltar</button>
          </div>
          <form onSubmit={saveDesp}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'16px' }}>
              <Field label="Data *"><input type="date" value={formDesp.data} onChange={e=>setFormDesp({...formDesp,data:e.target.value})} required /></Field>
              <SelectField label="Tipo de Despesa *" value={formDesp.tipo} onChange={v=>setFormDesp({...formDesp,tipo:v})} options={TIPOS_DESP} />
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'16px' }}>
              <Field label="Valor (R$) *">
                <input placeholder="ex: -276.50" value={formDesp.valor} onChange={e=>setFormDesp({...formDesp,valor:e.target.value})} required />
              </Field>
              <SelectField label="Placa" value={formDesp.placa} onChange={v=>setFormDesp({...formDesp,placa:v})} options={PLACAS} />
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'24px' }}>
              <Field label="Fornecedor"><input value={formDesp.fornecedor} onChange={e=>setFormDesp({...formDesp,fornecedor:e.target.value})} /></Field>
              <Field label="Forma de Pagamento"><input value={formDesp.forma_pagamento} onChange={e=>setFormDesp({...formDesp,forma_pagamento:e.target.value})} /></Field>
            </div>
            <div style={{ display:'flex', gap:'12px' }}>
              <button type="submit" className="btn-primary" disabled={saving}>{saving?'Salvando...':'Salvar Despesa'}</button>
              <button type="button" className="btn-ghost" onClick={()=>setMode('choice')}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {/* UPLOAD MODE */}
      {mode === 'upload' && (
        <div>
          <button onClick={()=>setMode('choice')} style={{ background:'none', border:'none', color:'var(--muted)', cursor:'pointer', fontSize:'13px', marginBottom:'20px' }}>← Voltar</button>
          <div style={{ background:'var(--card)', border:'2px dashed var(--border)', borderRadius:'14px', padding:'48px', textAlign:'center' }}
            onDragOver={e=>{ e.preventDefault(); e.currentTarget.style.borderColor='var(--teal)' }}
            onDragLeave={e=>{ e.currentTarget.style.borderColor='var(--border)' }}
            onDrop={e=>{ e.preventDefault(); e.currentTarget.style.borderColor='var(--border)'; if(e.dataTransfer.files[0]) { const fakeE={target:{files:e.dataTransfer.files,value:''}}; handleFileUpload(fakeE) } }}>
            <input ref={fileRef} type="file" accept=".xlsx,.xlsm,.xls" onChange={handleFileUpload} style={{ display:'none' }} />
            <div style={{ fontSize:'48px', marginBottom:'16px' }}>📊</div>
            <div style={{ fontWeight:'600', fontSize:'16px', marginBottom:'8px' }}>Arraste seu arquivo aqui</div>
            <div style={{ color:'var(--muted)', fontSize:'13px', marginBottom:'20px' }}>Suporta .xlsx, .xlsm e .xls — inclui Operações Produto, Serviço e Despesas</div>
            <button className="btn-primary" onClick={()=>fileRef.current.click()} disabled={saving}>
              {uploadProgress || 'Selecionar arquivo'}
            </button>
          </div>
          <div style={{ background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:'10px', padding:'16px', marginTop:'16px' }}>
            <div style={{ fontSize:'12px', fontWeight:'600', color:'var(--muted)', marginBottom:'8px', textTransform:'uppercase', letterSpacing:'0.06em' }}>Estrutura esperada</div>
            <div style={{ fontSize:'12px', color:'var(--muted)', lineHeight:'1.8' }}>
              O sistema detecta automaticamente as abas: <span style={{ color:'var(--teal)', fontFamily:'var(--mono)' }}>1. Operações de Produto</span>, <span style={{ color:'var(--teal)', fontFamily:'var(--mono)' }}>2. Operações Serviço</span> e <span style={{ color:'var(--teal)', fontFamily:'var(--mono)' }}>3. DataBaseDespesas</span>. 
              Cabeçalhos a partir da linha 3. Todas as datas no formato DD/MM/AAAA.
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
