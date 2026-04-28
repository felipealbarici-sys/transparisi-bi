import { useState, useRef } from 'react'
import { api } from '../lib/api'
import * as XLSX from 'xlsx'

const AUX_PROD = {
  movimentacao: ['Receita', 'Custos'],
  placas: ['AIK2I98','ATB0D60','DVS0I20','ELQ1F80','EDT1F16','ELQ2A32','ELW2H60','GRW4H72','GSV0J49','GZG2C02','HMW4F97','ISZ1E42','LLJ3E62','LLJ3E65','OMS5H75','PXS2A31','FTV0A06'],
  motoristas: ['ALEXSANDER SANNER','ANDRÉ CARLOS','CARLOS DAMACENA','CICERO RAFAEL','DANIEL RAMOS','FRANCISCO GENEROSO','JOSE CARLOS','JOSE LAILSON','JOSE SEBASTIÃO','KAUAN ALEIXO','MARCOS COSTA','MARCOS LIMA','MAURICIO GASOTO','VALTER DIAS PAIÃO JUNIOR'],
  produtos: ['Braspolpa','Molpec','Polpinha','Resíduo'],
  fornecedor: ['Tate & Lile'],
  tipoEntrega: ['Entrega','Retirada'],
  tipoCusto: ['Frete','Produto','CARREGAMENTO','COMBUSTÍVEL S10','COMBUSTÍVEL S500','COMISSÃO','DESPESAS','GASTOS COM MOTORISTA','IPVA','MANUTENÇÃO','PEDÁGIO','PNEUS','SEGURO','SEM PARAR','SERVIÇO MÁQUINA','SILO','Valor Produto'],
  nota: ['Sim','Não'],
  clientes: ['ADEMIR BATISTELA','ADRIANO CESAR CUSTODIO','AFFONSO AUREO JUNQUEIRA','ALEX BATISTA PEDRO','ALEXANDER DE OLIVEIRA','ALEXANDRE','ALEXANDRE CARROCERIAS','ALMIRO MOLICA','ANTONIO BERTAGNA','ANTONIO NASTARO','ARISTIDES FAZENDA SURPRESA','BRITO IPÊ','CARLOS THOMAZELLA','CIDINEI','CLAUDENILSON BUENO','CLAUDINEI ROQUE','CLAUDIO THOMAZELA','CLEITON THOMAZELLA','CRIGEO','DANIEL','DANILO MANFRIN','DOMINGOS PRIOR','DONIZETE','ECOMARK','EDENILSON THOMAZELLA','EDILSON LEMOS','EDSON AMAURI','EDUARDO','ERALDO ANDRE GUARINO','EVANDRO','EVERARDES DECA DOS SANTOS','FANTUCCI BARREIRENSE','FAZENDA JM','FAZENDA QUILOMBO','FELIPE BANHA','FELIPE CHRISTOFOLETTI','FELIPE THOMAZELLA','FRANCISCO CONSORTI','FRANZIN','FRED JORGE GERMANO','GEOVANA','HILTON VALERIO','JACON','JAIR ZAMBIANCO','JOAO MADUREIRA NETO','JOEL PETRIN','JOSE AUGUSTO MARCON','JOSE IVAIR PACHECO','JOSE LUIZ MORELLI','JOSE ROBERTO PICCININ','JUDSON','JUNINHO','JUNIOR ZANFORLIN','LIG ENTULHO','LUIZ HELIO RENOSTO JUNIOR','MANOEL','MARCELO AÇOUGUE','MARCOS KRUGNER','MAX FORT CABINES','NALIN','NAWFAL','NEI ROMANELLO','NEODIVAL JOAO BETINI','NILSON BENEDITO PIVETA','ODAIR NOVELLO','ORIZON','OSMAR ADALBERTO FONTES','OSVALDO ISMAEL FAULIN','PAULO BORTOLOTTI','PAULO JOSE MAROTTI JOIA','PAULO ROBERTO VIADANNA','PEDRO DA SILVA OLIVEIRA','PEDRO DUCKER','PEDRO ZAURI SILVESTRIN','RAFAEL SCAGLIA','REIS DAS CASAS','RICARDO SEVIJA','RICHARD THOMAZELA','ROBERTO TADEU RUBINI','SEBASTIAO RAIMUNDO BARBOZA','SERGIO PETRIN','SIDMAR VASCONCELOS','THIAGO','THIAGO 2','TONINHO MEIA','VAGNER PICELLI','VAIL ALTARURGIO','VALDISIR RODRIGUES','VANDERLEI JORGE OLEGARIO','VILSON CARVALHO','VINICIUS MONTOYA','VITOR COLETE','ZANARDO ROCNHI'],
  cidades: ['AJAPÍ','AMPARO','ANHEMBI','ANHUMAS','ARTHUR NOGUEIRA','BOFETE','BOITUVA','BROTAS','CAMANDUCAIA','CAPIVARI','CONCHAS','CORDEIROPOLIS','CORUMBATAI','COSMÓPOLIS','DESCALVADO','ELIAS FAUSTO','FERRAZ','HORTOLANDIA','IPEUNA','JUMIRIM','LARANJAL PAULISTA','LIMEIRA','MARISTELA','MOGI MIRIM','PAULINIA','PEREIRAS','PIRACICABA','POÇO DE CALDAS','RIO CLARO','SALTO','SALTINHO','SANTA BARBARA D\'OESTE','SANTA GERTRUDES','SÃO JOÃO DA BOA VISTA','TIETE','TORRE DE PEDRA'],
  condicao: ['A PRAZO','A VISTA','BOLETO','MANIFESTO','PLANILHA MENSAL'],
  formaRecebimento: ['CHEQUE','DINHEIRO','PIX','BOLETO'],
  status: ['Baixada','A Vencer','Vencido'],
}

const AUX_SERV = {
  movimentacao: ['Receita','Custos'],
  placas: ['DDV3C94','DVS0I20','ENV1J15','FQF7D20','FTV0A06','GVK1J15','OMS5H75','CDF8F52'],
  placasCarretas: ['ATI7H19','IWC9H07','FFN8F42','MRR9J21','KRL3E80'],
  motoristas: ['AVARO GACHET','DANIEL RAMOS','JOÃO PEDRO FERNANDES','TERCEIRO','VALDINEI FERNANDES','JEFERSON RODRIGO JUSTINO'],
  tipoMotorista: ['Frota Propria','Terceiros','Agregados'],
  produtos: ['Diversos','MÁQUINA','PEDRA','SUCATA'],
  nota: ['Sim','Não'],
  remetentes: ['NEWTON INDUSTRIAS','ALICANTE','TORNEARIA PUNTEL','VM STONE'],
  cidadesOrigem: ['LIMEIRA','RIQUEZA','SÃO PAULO','ORLÂNDIA'],
  destinatarios: ['ALICANTE','ENGEFER IND','LLK FABRICAÇÃO','NEWTON','RV CONSTRUÇÃO','TORNEARIA PUNTEL','LUIS HENRIQUE GALLOTTI','PEDRO DOS MARES GUIA BRAGA','JF MONTAGENS IND.E ESTRUTURAS'],
  cidadesDestino: ['BRASILIA','JARAGUA','LIMEIRA','PORTO FERREIRA','RIQUEZA','SANTA BARBARA','LEME','BELO HORIZONTE','PATOS DE MINAS'],
  pagadores: ['ALICANTE','LLK FABRICAÇÃO','NEWTON IND.','RV CONSTRUÇÃO','TORNEARIA PUNTEL','PEDRO DOS MARES GUIA'],
  custoViagem: ['COMBUSTÍVEL','DESPESAS','DIÁRIA','GNRE','ICMS','RECEBIMENTO FRETE','PAGAMENTO TERCEIRO','PEDÁGIO','SEGURO','Serviço'],
  condicao: ['A PRAZO','A VISTA','BOLETO','MANIFESTO'],
  formaRecebimento: ['CHEQUE','DINHEIRO','PIX','TRANSFERENCIA'],
  status: ['Baixada','A Vencer','Vencido'],
}

const AUX_DESP = {
  movimentacao: ['Despesa','Custo'],
  tipoDespesa: ['ABASTECIMENTO','EMPILHADEIRA','ESCRITÓRIO','ESTOQUE','FUNCIONÁRIOS','IMPOSTO','OFICINA','PÁ CARREGADEIRA','SEGURO','SIMPLES NACIONAL','SINDICATO','SÍTIO','DESPESA COM CAMINHÃO'],
  placas: ['ABQ8A02','AIK2I98','BQN0G71','BSG8H07','DDV3C94','DVS0I20','EDT1F16','ELQ2A32','ELW2H60','EOF8C77','ESTOQUE','FFN8F42','FQF7D20','FTV0A06','FZQ8J59','GAT4F55','GCU1208','GFQ6C60','GRW4H71','GRW4H72','GSV0J49','GZG2C02','HIA8D04','HMW4F9','ISZ1442','IWC9H07','JQX6A72','KMX6H39','LLJ3E62','LLJ3E65','MRR9J21','NLG0C85','NLG0D25','NYA1A27','OBR8656','OMS5H75','OMZ9H50','PXS2A31','QIM7H18','QQA1D03'],
  fornecedores: ['ABASTECIMENTO','ACG ELETRÔNICA','APCA','APOLO','AUTO POSTO LAVAGEM','BANDEIRANTE','BIG MALTE','BORRACHARIA','BRADESCO','BRASVEDA','BRK','BUONNY','CARTÓRIO','CASA DA HIDRAULICA','CASA LIMPA','CHRISTIANO GONZALES','DANIEL G LOPES','DARF','DIBBERN','DRUGOVICH','ELETRO SOLDA','ESACTOR','FAP EMBREAGENS','FGTS','FRETEBRAS','GBR','GUARDIA DECISÃO SEGURA','HDI SEGUROS','ISSQN','JOÃO ANTONIO','JOÃO ANTONIO CRUZ','JOSÉ MARIO BOZZA','K.A.S','KBR','LIMERMEDIC','LL TRATORES','M.M LASINHO','MAC EMPILHADEIRAS','MAGGI','MALAMAN','MARTINS E MARTINS','MEDLIFE','MF PNEUS','MORAIS E LIMA','MPPV','MULTA','NAVEX','NEOENERGIA','NSTECH','PEDÁGIO','PMSJ','PODIUM SOLUÇÕES','PORTO SEGURO','POSTO DE MOLAS SÃO JORGE','QUALP','R TECDIESEL','RECAP','REMAVE','ROBERTO BOLOGNESI','ROCHA GÁS','RR PARAFUSOS','S23','SASCAR','SERVIÇOS GERAIS','SIMPLES NACIONAL','SIND EMP','SINDCAPRI','SP CARDANS','STAR LONAS','T.I','TOKIO MARINE SEG','TRATORMEC','VIVO','WEST','SEM PARAR'],
  empresa: ['Transparisi','Christiane Transportes','Nova Caminhoneiro','Pessoa Física'],
  formaPagamento: ['Boleto','Transferência','Pix','Cheque','Dinheiro'],
  nota: ['Sim','Não'],
}

function Field({ label, children }) {
  return (
    <div>
      <label style={{ display:'block', fontSize:'11px', color:'var(--muted)', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.06em' }}>{label}</label>
      {children}
    </div>
  )
}

function Sel({ value, onChange, options }) {
  return (
    <select value={value} onChange={e=>onChange(e.target.value)}>
      <option value="">— selecione —</option>
      {options.map(o=><option key={o} value={o}>{o}</option>)}
    </select>
  )
}

function Grid({ cols=3, children, gap='14px' }) {
  return <div style={{ display:'grid', gridTemplateColumns:`repeat(${cols},1fr)`, gap, marginBottom:'14px' }}>{children}</div>
}

function SecLabel({ label }) {
  return <div style={{ fontSize:'11px', color:'var(--teal)', textTransform:'uppercase', letterSpacing:'0.08em', fontWeight:'600', marginBottom:'10px', marginTop:'18px', paddingBottom:'6px', borderBottom:'1px solid var(--border)' }}>{label}</div>
}

function MsgBox({ msg }) {
  if (!msg) return null
  const ok = msg.type==='ok'
  return <div style={{ padding:'12px 16px', borderRadius:'10px', marginBottom:'20px', fontSize:'13px', background:ok?'rgba(16,185,129,0.1)':'rgba(239,68,68,0.1)', border:`1px solid ${ok?'rgba(16,185,129,0.3)':'rgba(239,68,68,0.3)'}`, color:ok?'var(--green)':'var(--red)' }}>{msg.text}</div>
}

export default function Lancamentos() {
  const [tipo, setTipo] = useState('produto')
  const [mode, setMode] = useState('choice')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState(null)
  const [upProg, setUpProg] = useState(null)
  const fileRef = useRef()

  // Produto state
  const emptyP = { data:'', movimentacao:'Receita', placa:'', motorista:'', produto:'', fornecedor:'', tipo_venda:'', nota:'', cliente:'', cidade:'', tipo_custo:'', quantidade:'', valor_unitario:'', valor_total:'', condicao:'', forma_recebimento:'', data_vencimento:'', data_baixa:'', status:'A Vencer', obs:'' }
  const [fP, setFP] = useState(emptyP)
  const updP = k => v => {
    const u={...fP,[k]:v}
    if(k==='quantidade'||k==='valor_unitario'){
      const q=parseFloat(k==='quantidade'?v:u.quantidade)||0
      const vu=parseFloat(k==='valor_unitario'?v:u.valor_unitario)||0
      if(q>0&&vu>0) u.valor_total=(q*vu).toFixed(2)
    }
    setFP(u)
  }

  // Serviço state
  const emptyS = { data:'', movimentacao:'Receita', placa:'', placa_carreta:'', km_rodado:'', motorista:'', tipo_motorista:'', produto:'', nota:'', remetente:'', cidade_origem:'', destinatario:'', cidade_destino:'', pagador:'', custo_viagem:'', quantidade:'', valor:'', valor_total:'', condicao:'', forma_recebimento:'', data_vencimento:'', data_baixa:'', status:'A Vencer' }
  const [fS, setFS] = useState(emptyS)
  const updS = k => v => {
    const u={...fS,[k]:v}
    if(k==='quantidade'||k==='valor'){
      const q=parseFloat(k==='quantidade'?v:u.quantidade)||0
      const vv=parseFloat(k==='valor'?v:u.valor)||0
      if(q>0&&vv>0) u.valor_total=(q*vv).toFixed(2)
    }
    setFS(u)
  }

  // Despesa state
  const emptyD = { data:'', movimentacao:'Despesa', tipo:'', placa:'', fornecedor:'', valor:'', empresa:'Transparisi', forma_pagamento:'', nota:'' }
  const [fD, setFD] = useState(emptyD)
  const updD = k => v => setFD({...fD,[k]:v})

  const CARD = { background:'var(--card)', border:'1px solid var(--border)', borderRadius:'14px', padding:'28px' }

  const formHeader = (icon, title, sub) => (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px', paddingBottom:'14px', borderBottom:'1px solid var(--border)' }}>
      <div>
        <h2 style={{ fontSize:'16px', fontWeight:'600' }}>{icon} {title}</h2>
        <p style={{ fontSize:'12px', color:'var(--muted)', marginTop:'2px' }}>{sub}</p>
      </div>
      <button onClick={()=>setMode('choice')} style={{ background:'none', border:'none', color:'var(--muted)', cursor:'pointer', fontSize:'13px' }}>← Voltar</button>
    </div>
  )

  const saveProd = async e => {
    e.preventDefault(); setSaving(true); setMsg(null)
    try {
      await api.insert('operacoes_produto', [{ ...fP,
        quantidade:parseFloat(fP.quantidade)||null, valor_unitario:parseFloat(fP.valor_unitario)||null,
        valor_total:parseFloat(fP.valor_total)||null,
        mes:fP.data?new Date(fP.data).toLocaleString('pt-BR',{month:'short'}).toLowerCase():null }])
      setMsg({type:'ok',text:'✓ Operação de Produto lançada com sucesso!'})
      setFP(emptyP)
    } catch(err){ setMsg({type:'err',text:err.message}) }
    setSaving(false)
  }

  const saveServ = async e => {
    e.preventDefault(); setSaving(true); setMsg(null)
    try {
      await api.insert('operacoes_servico', [{ ...fS,
        km_rodado:parseFloat(fS.km_rodado)||null, quantidade:parseFloat(fS.quantidade)||null,
        valor:parseFloat(fS.valor)||null, valor_total:parseFloat(fS.valor_total)||null,
        mes:fS.data?new Date(fS.data).toLocaleString('pt-BR',{month:'short'}).toLowerCase():null }])
      setMsg({type:'ok',text:'✓ Operação de Serviço lançada com sucesso!'})
      setFS(emptyS)
    } catch(err){ setMsg({type:'err',text:err.message}) }
    setSaving(false)
  }

  const saveDesp = async e => {
    e.preventDefault(); setSaving(true); setMsg(null)
    try {
      await api.insert('despesas', [{ ...fD,
        valor:parseFloat(String(fD.valor).replace(',','.'))||null,
        mes:fD.data?new Date(fD.data).toLocaleString('pt-BR',{month:'short'}).toLowerCase():null }])
      setMsg({type:'ok',text:'✓ Despesa lançada com sucesso!'})
      setFD(emptyD)
    } catch(err){ setMsg({type:'err',text:err.message}) }
    setSaving(false)
  }

  const fmtDate = v => { try { return v?new Date(v).toISOString().split('T')[0]:null } catch { return null } }

  const handleUpload = async e => {
    const file=e.target.files[0]; if(!file) return
    setSaving(true); setMsg(null); setUpProg('Lendo arquivo...')
    try {
      const buf=await file.arrayBuffer()
      const wb=XLSX.read(buf,{type:'array',cellDates:true})
      let inserted=0
      const cfgs = {
        '1. Operações de Produto ': { table:'operacoes_produto', map: r => {
          const vtk=Object.keys(r).find(k=>k.includes('Valor total')||k.includes('Valor Total'))
          const data=fmtDate(r['DATA']); if(!data) return null
          return { data, mes:r['Mês']||new Date(r['DATA']).toLocaleString('pt-BR',{month:'short'}).toLowerCase(),
            movimentacao:String(r['Movimentação financeira ']||'').trim(), placa:String(r['Placa ']||r['Placa']||'').trim(),
            motorista:String(r['Motorista']||'').trim(), produto:String(r['Produto ']||r['Produto']||'').trim(),
            fornecedor:String(r['Fornecedor']||'').trim(), tipo_venda:String(r['Tipo de Venda']||'').trim(),
            nota:String(r['Nota']||'').trim(), cliente:String(r['Cliente ']||r['Cliente']||'').trim(),
            cidade:String(r['Cidade']||'').trim(), tipo_custo:String(r['Tipo Custo']||'').trim(),
            quantidade:parseFloat(r['Quantidade ']||r['Quantidade'])||null,
            valor_unitario:parseFloat(r['Valor Unitário ']||r['Valor Unitário'])||null,
            valor_total:parseFloat(r[vtk])||null, condicao:String(r['Condição ']||'').trim(),
            forma_recebimento:String(r['Forma de Recebimento']||'').trim(),
            data_vencimento:fmtDate(r['Data de vencimento']), data_baixa:fmtDate(r['Data de Baixa ']||r['Data de Baixa']),
            status:String(r['Status ']||r['Status']||'').trim(), obs:String(r['Obs.']||'').trim() }
        }},
        '2. Operações Serviço': { table:'operacoes_servico', map: r => {
          const vtk=Object.keys(r).find(k=>k.toLowerCase().includes('valor total'))
          const data=fmtDate(r['DATA']); if(!data) return null
          return { data, mes:new Date(r['DATA']).toLocaleString('pt-BR',{month:'short'}).toLowerCase(),
            movimentacao:String(r['Movimentação financeira ']||'').trim(), placa:String(r['Placa']||'').trim(),
            placa_carreta:String(r['Placa Carreta']||'').trim(), km_rodado:parseFloat(r['Km rodado'])||null,
            motorista:String(r['Motorista']||'').trim(), tipo_motorista:String(r['Tipo de Motorista ']||'').trim(),
            produto:String(r['Produto ']||'').trim(), nota:String(r['Nota ']||'').trim(),
            remetente:String(r['Remetente']||'').trim(), cidade_origem:String(r['Cidade Origem']||'').trim(),
            destinatario:String(r['Destinatário']||'').trim(), cidade_destino:String(r['Cidade Destino']||'').trim(),
            pagador:String(r['Pagador']||'').trim(), custo_viagem:String(r['Custo da Viagem ']||'').trim(),
            quantidade:parseFloat(r['Quantidade'])||null, valor:parseFloat(r['Valor'])||null,
            valor_total:parseFloat(r[vtk])||null, condicao:String(r['Condição ']||'').trim(),
            forma_recebimento:String(r['Forma de Recebimento']||'').trim(),
            data_vencimento:fmtDate(r['Data de vencimento']), data_baixa:fmtDate(r['Data de Baixa ']),
            status:String(r['Status ']||'').trim() }
        }},
        '3. DataBaseDespesas ': { table:'despesas', map: r => {
          const val=parseFloat(r['Valor']||r['VALOR'])||null; if(!val) return null
          const data=fmtDate(r['DATA']||r['Data']); if(!data) return null
          return { data, mes:new Date(data).toLocaleString('pt-BR',{month:'short'}).toLowerCase(),
            movimentacao:String(r['Movimentação Financeira']||r['Movimentação']||r['MOV']||'').trim(),
            tipo:String(r['Tipo de Despesa ']||r['Tipo de Despesa']||r['TIPO']||'').trim(),
            placa:String(r['Placa ']||r['Placa']||r['PLACA']||'').trim(),
            fornecedor:String(r['Fornecedor ']||r['Fornecedor']||r['FORNEC']||'').trim(),
            valor:val, empresa:String(r['Empresa']||r['EMPRESA']||'').trim(),
            forma_pagamento:String(r['Forma de Pagamento']||r['FPAG']||'').trim(),
            nota:String(r['Nota']||r['NOTA']||'').trim() }
        }},
      }
      for(const [sName,cfg] of Object.entries(cfgs)){
        const ws=wb.Sheets[sName]; if(!ws) continue
        const rows=XLSX.utils.sheet_to_json(ws,{header:1,defval:null})
        const hIdx=rows.findIndex(r=>r.some(c=>c&&String(c).toUpperCase().includes('DATA')))
        if(hIdx<0) continue
        const headers=rows[hIdx].map(h=>String(h||'').trim())
        const data=rows.slice(hIdx+1).filter(r=>r.some(c=>c!==null&&c!=='')).map(r=>{
          const obj={}; headers.forEach((h,i)=>{obj[h]=r[i]}); return cfg.map(obj)
        }).filter(Boolean)
        if(!data.length) continue
        setUpProg(`Inserindo ${data.length} registros em ${cfg.table}...`)
        for(let i=0;i<data.length;i+=100){
          await api.insert(cfg.table, data.slice(i,i+100))
          inserted+=Math.min(100,data.length-i)
        }
      }
      setMsg({type:'ok',text:`✓ Upload concluído! ${inserted} registros importados.`})
    } catch(err){ setMsg({type:'err',text:err.message}) }
    setUpProg(null); setSaving(false); e.target.value=''
  }

  const tabBtn = (k,l) => (
    <button key={k} onClick={()=>{setTipo(k);setMode('choice');setMsg(null)}} style={{
      padding:'8px 16px', borderRadius:'8px',
      border:`1px solid ${tipo===k?'var(--teal)':'var(--border)'}`,
      background:tipo===k?'rgba(14,165,233,0.12)':'transparent',
      color:tipo===k?'var(--teal)':'var(--muted)',
      fontWeight:tipo===k?'600':'400', fontSize:'13px', cursor:'pointer', fontFamily:'var(--sans)'
    }}>{l}</button>
  )

  const inp = (val, onChange, opts={}) => (
    <input type={opts.type||'text'} value={val}
      onChange={e=>onChange(e.target.value)}
      placeholder={opts.placeholder||''}
      required={opts.required||false}
      readOnly={opts.readOnly||false}
      style={opts.highlight?{borderColor:'var(--teal)',color:'var(--teal)',fontFamily:'var(--mono)'}:{}} />
  )

  const sel = (val, onChange, opts) => (
    <select value={val} onChange={e=>onChange(e.target.value)}>
      <option value="">— selecione —</option>
      {opts.map(o=><option key={o} value={o}>{o}</option>)}
    </select>
  )

  return (
    <div style={{ padding:'32px', maxWidth:'1020px' }}>
      <h1 style={{ fontSize:'24px', fontWeight:'700', letterSpacing:'-0.02em', marginBottom:'4px' }}>Lançar Dados</h1>
      <p style={{ color:'var(--muted)', fontSize:'14px', marginBottom:'28px' }}>Formulário com listas exatas das abas auxiliares ou importação de Excel</p>

      <div style={{ display:'flex', gap:'8px', marginBottom:'24px' }}>
        {tabBtn('produto','📦 Operações Produto')}
        {tabBtn('servico','🚚 Operações Serviço')}
        {tabBtn('despesas','💸 Despesas')}
      </div>

      {mode==='choice' && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', maxWidth:'640px' }}>
          {[['form','✏️','Preencher formulário','Lance um registro com as mesmas listas suspensas da planilha Excel'],
            ['upload','📁','Importar planilha Excel','Envie o .xlsx completo — abas detectadas automaticamente']
          ].map(([m,ic,tt,dd])=>(
            <button key={m} onClick={()=>setMode(m)} style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'14px', padding:'28px', textAlign:'left', cursor:'pointer', transition:'border-color .15s' }}
              onMouseEnter={e=>e.currentTarget.style.borderColor='var(--teal)'}
              onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}>
              <div style={{ fontSize:'32px', marginBottom:'12px' }}>{ic}</div>
              <div style={{ fontWeight:'600', fontSize:'15px', marginBottom:'6px' }}>{tt}</div>
              <div style={{ color:'var(--muted)', fontSize:'13px', lineHeight:'1.5' }}>{dd}</div>
            </button>
          ))}
        </div>
      )}

      <MsgBox msg={msg} />

      {/* ═══ PRODUTO FORM ═══ */}
      {mode==='form' && tipo==='produto' && (
        <div style={CARD}>
          {formHeader('📦','Nova Operação de Produto','Campos com * obrigatórios · Valor Total calculado automaticamente')}
          <form onSubmit={saveProd}>
            <SecLabel label="Identificação e Status" />
            <Grid cols={3}>
              <Field label="Data *">{inp(fP.data,updP('data'),{type:'date',required:true})}</Field>
              <Field label="Movimentação *">{sel(fP.movimentacao,updP('movimentacao'),AUX_PROD.movimentacao)}</Field>
              <Field label="Status">{sel(fP.status,updP('status'),AUX_PROD.status)}</Field>
            </Grid>

            <SecLabel label="Veículo e Carga" />
            <Grid cols={3}>
              <Field label="Placa">{sel(fP.placa,updP('placa'),AUX_PROD.placas)}</Field>
              <Field label="Motorista">{sel(fP.motorista,updP('motorista'),AUX_PROD.motoristas)}</Field>
              <Field label="Produto">{sel(fP.produto,updP('produto'),AUX_PROD.produtos)}</Field>
            </Grid>
            <Grid cols={3}>
              <Field label="Fornecedor">{sel(fP.fornecedor,updP('fornecedor'),AUX_PROD.fornecedor)}</Field>
              <Field label="Tipo Custo / Venda">{sel(fP.tipo_custo,updP('tipo_custo'),AUX_PROD.tipoCusto)}</Field>
              <Field label="Tipo de Entrega">{sel(fP.tipo_venda,updP('tipo_venda'),AUX_PROD.tipoEntrega)}</Field>
            </Grid>

            <SecLabel label="Cliente e Destino" />
            <Grid cols={3}>
              <Field label="Cliente">{sel(fP.cliente,updP('cliente'),AUX_PROD.clientes)}</Field>
              <Field label="Cidade">{sel(fP.cidade,updP('cidade'),AUX_PROD.cidades)}</Field>
              <Field label="Nota Fiscal">{sel(fP.nota,updP('nota'),AUX_PROD.nota)}</Field>
            </Grid>

            <SecLabel label="Valores" />
            <Grid cols={3}>
              <Field label="Quantidade">{inp(fP.quantidade,updP('quantidade'),{type:'number',placeholder:'ex: 19.47'})}</Field>
              <Field label="Valor Unitário (R$)">{inp(fP.valor_unitario,updP('valor_unitario'),{type:'number',placeholder:'ex: 109.00'})}</Field>
              <Field label="Valor Total — automático">{inp(fP.valor_total,updP('valor_total'),{highlight:true})}</Field>
            </Grid>

            <SecLabel label="Pagamento e Vencimento" />
            <Grid cols={3}>
              <Field label="Condição">{sel(fP.condicao,updP('condicao'),AUX_PROD.condicao)}</Field>
              <Field label="Forma de Recebimento">{sel(fP.forma_recebimento,updP('forma_recebimento'),AUX_PROD.formaRecebimento)}</Field>
              <Field label="Data de Vencimento">{inp(fP.data_vencimento,updP('data_vencimento'),{type:'date'})}</Field>
            </Grid>
            <Grid cols={3}>
              <Field label="Data de Baixa">{inp(fP.data_baixa,updP('data_baixa'),{type:'date'})}</Field>
              <Field label="Observação">{inp(fP.obs,updP('obs'),{placeholder:'Observações'})}</Field>
            </Grid>

            <div style={{ display:'flex', gap:'12px', marginTop:'8px' }}>
              <button type="submit" className="btn-primary" disabled={saving}>{saving?'Salvando...':'Salvar Operação de Produto'}</button>
              <button type="button" className="btn-ghost" onClick={()=>setMode('choice')}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {/* ═══ SERVIÇO FORM ═══ */}
      {mode==='form' && tipo==='servico' && (
        <div style={CARD}>
          {formHeader('🚚','Nova Operação de Serviço','Fretes especiais, máquinas, pedra e sucata')}
          <form onSubmit={saveServ}>
            <SecLabel label="Identificação" />
            <Grid cols={3}>
              <Field label="Data *">{inp(fS.data,updS('data'),{type:'date',required:true})}</Field>
              <Field label="Movimentação *">{sel(fS.movimentacao,updS('movimentacao'),AUX_SERV.movimentacao)}</Field>
              <Field label="Status">{sel(fS.status,updS('status'),AUX_SERV.status)}</Field>
            </Grid>

            <SecLabel label="Veículo e Motorista" />
            <Grid cols={3}>
              <Field label="Placa (Cavalo)">{sel(fS.placa,updS('placa'),AUX_SERV.placas)}</Field>
              <Field label="Placa Carreta">{sel(fS.placa_carreta,updS('placa_carreta'),AUX_SERV.placasCarretas)}</Field>
              <Field label="Km Rodado">{inp(fS.km_rodado,updS('km_rodado'),{type:'number',placeholder:'ex: 850'})}</Field>
            </Grid>
            <Grid cols={3}>
              <Field label="Motorista">{sel(fS.motorista,updS('motorista'),AUX_SERV.motoristas)}</Field>
              <Field label="Tipo de Motorista">{sel(fS.tipo_motorista,updS('tipo_motorista'),AUX_SERV.tipoMotorista)}</Field>
              <Field label="Produto / Carga">{sel(fS.produto,updS('produto'),AUX_SERV.produtos)}</Field>
            </Grid>

            <SecLabel label="Rota (Origem → Destino)" />
            <Grid cols={3}>
              <Field label="Remetente">{sel(fS.remetente,updS('remetente'),AUX_SERV.remetentes)}</Field>
              <Field label="Cidade Origem">{sel(fS.cidade_origem,updS('cidade_origem'),AUX_SERV.cidadesOrigem)}</Field>
              <Field label="Nota Fiscal">{sel(fS.nota,updS('nota'),AUX_SERV.nota)}</Field>
            </Grid>
            <Grid cols={3}>
              <Field label="Destinatário">{sel(fS.destinatario,updS('destinatario'),AUX_SERV.destinatarios)}</Field>
              <Field label="Cidade Destino">{sel(fS.cidade_destino,updS('cidade_destino'),AUX_SERV.cidadesDestino)}</Field>
              <Field label="Pagador">{sel(fS.pagador,updS('pagador'),AUX_SERV.pagadores)}</Field>
            </Grid>

            <SecLabel label="Custo e Valores" />
            <Grid cols={3}>
              <Field label="Tipo de Custo da Viagem">{sel(fS.custo_viagem,updS('custo_viagem'),AUX_SERV.custoViagem)}</Field>
              <Field label="Quantidade">{inp(fS.quantidade,updS('quantidade'),{type:'number',placeholder:'ex: 1'})}</Field>
              <Field label="Valor Unitário (R$)">{inp(fS.valor,updS('valor'),{type:'number',placeholder:'ex: 2500.00'})}</Field>
            </Grid>
            <Grid cols={3}>
              <Field label="Valor Total — automático">{inp(fS.valor_total,updS('valor_total'),{highlight:true})}</Field>
              <Field label="Condição">{sel(fS.condicao,updS('condicao'),AUX_SERV.condicao)}</Field>
              <Field label="Forma de Recebimento">{sel(fS.forma_recebimento,updS('forma_recebimento'),AUX_SERV.formaRecebimento)}</Field>
            </Grid>
            <Grid cols={3}>
              <Field label="Data de Vencimento">{inp(fS.data_vencimento,updS('data_vencimento'),{type:'date'})}</Field>
              <Field label="Data de Baixa">{inp(fS.data_baixa,updS('data_baixa'),{type:'date'})}</Field>
            </Grid>

            <div style={{ display:'flex', gap:'12px', marginTop:'8px' }}>
              <button type="submit" className="btn-primary" disabled={saving}>{saving?'Salvando...':'Salvar Operação de Serviço'}</button>
              <button type="button" className="btn-ghost" onClick={()=>setMode('choice')}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {/* ═══ DESPESAS FORM ═══ */}
      {mode==='form' && tipo==='despesas' && (
        <div style={CARD}>
          {formHeader('💸','Nova Despesa','Impostos, seguros, manutenção e operações diversas')}
          <form onSubmit={saveDesp}>
            <SecLabel label="Classificação" />
            <Grid cols={3}>
              <Field label="Data *">{inp(fD.data,updD('data'),{type:'date',required:true})}</Field>
              <Field label="Movimentação *">{sel(fD.movimentacao,updD('movimentacao'),AUX_DESP.movimentacao)}</Field>
              <Field label="Tipo de Despesa *">{sel(fD.tipo,updD('tipo'),AUX_DESP.tipoDespesa)}</Field>
            </Grid>

            <SecLabel label="Detalhes" />
            <Grid cols={3}>
              <Field label="Placa (se aplicável)">{sel(fD.placa,updD('placa'),AUX_DESP.placas)}</Field>
              <Field label="Fornecedor">{sel(fD.fornecedor,updD('fornecedor'),AUX_DESP.fornecedores)}</Field>
              <Field label="Valor (R$) *">{inp(fD.valor,updD('valor'),{placeholder:'ex: -276.50',required:true})}</Field>
            </Grid>
            <Grid cols={3}>
              <Field label="Empresa">{sel(fD.empresa,updD('empresa'),AUX_DESP.empresa)}</Field>
              <Field label="Forma de Pagamento">{sel(fD.forma_pagamento,updD('forma_pagamento'),AUX_DESP.formaPagamento)}</Field>
              <Field label="Nota Fiscal">{sel(fD.nota,updD('nota'),AUX_DESP.nota)}</Field>
            </Grid>

            <div style={{ display:'flex', gap:'12px', marginTop:'8px' }}>
              <button type="submit" className="btn-primary" disabled={saving}>{saving?'Salvando...':'Salvar Despesa'}</button>
              <button type="button" className="btn-ghost" onClick={()=>setMode('choice')}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {/* ═══ UPLOAD ═══ */}
      {mode==='upload' && (
        <div>
          <button onClick={()=>setMode('choice')} style={{ background:'none', border:'none', color:'var(--muted)', cursor:'pointer', fontSize:'13px', marginBottom:'20px' }}>← Voltar</button>
          <div style={{ background:'var(--card)', border:'2px dashed var(--border)', borderRadius:'14px', padding:'56px', textAlign:'center', cursor:'pointer', transition:'border-color .2s' }}
            onDragOver={e=>{e.preventDefault();e.currentTarget.style.borderColor='var(--teal)'}}
            onDragLeave={e=>{e.currentTarget.style.borderColor='var(--border)'}}
            onDrop={e=>{e.preventDefault();e.currentTarget.style.borderColor='var(--border)';if(e.dataTransfer.files[0])handleUpload({target:{files:e.dataTransfer.files,value:''}})}}
            onClick={()=>fileRef.current.click()}>
            <input ref={fileRef} type="file" accept=".xlsx,.xlsm,.xls" onChange={handleUpload} style={{display:'none'}} />
            <div style={{ fontSize:'52px', marginBottom:'16px' }}>📊</div>
            <div style={{ fontWeight:'600', fontSize:'16px', marginBottom:'8px' }}>Arraste o arquivo aqui ou clique para selecionar</div>
            <div style={{ color:'var(--muted)', fontSize:'13px', marginBottom:'24px' }}>Suporta .xlsx e .xlsm — detecta automaticamente as 3 abas</div>
            <div style={{ display:'inline-block', background:'var(--teal)', color:'#000', padding:'10px 28px', borderRadius:'8px', fontWeight:'700', fontSize:'13px' }}>
              {upProg || 'Selecionar arquivo'}
            </div>
          </div>
          <div style={{ background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:'10px', padding:'16px', marginTop:'16px' }}>
            <div style={{ fontSize:'12px', fontWeight:'600', color:'var(--muted)', marginBottom:'8px', textTransform:'uppercase', letterSpacing:'0.06em' }}>Mapeamento de abas</div>
            {[['1. Operações de Produto ','operacoes_produto','var(--teal)'],
              ['2. Operações Serviço','operacoes_servico','var(--gold)'],
              ['3. DataBaseDespesas ','despesas','var(--red)']
            ].map(([aba,tab,cor])=>(
              <div key={aba} style={{ display:'flex', justifyContent:'space-between', padding:'7px 0', borderBottom:'1px solid var(--border)', fontSize:'12px' }}>
                <span style={{ fontFamily:'var(--mono)', color:cor }}>{aba}</span>
                <span style={{ color:'var(--muted)' }}>→ {tab}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
