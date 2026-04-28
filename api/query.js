import { createPool } from '@vercel/postgres'
import jwt from 'jsonwebtoken'

// Tabelas permitidas (segurança)
const ALLOWED_TABLES = ['operacoes_produto', 'operacoes_servico', 'despesas']

// Colunas permitidas por tabela
const TABLE_COLS = {
  operacoes_produto: ['nova','id_viagem','data','mes','movimentacao','placa','motorista','produto','fornecedor','tipo_venda','nota','cliente','cidade','tipo_custo','quantidade','valor_unitario','valor_total','condicao','forma_recebimento','data_vencimento','data_baixa','status','obs'],
  operacoes_servico: ['nova','id_viagem','data','mes','movimentacao','placa','placa_carreta','km_rodado','motorista','tipo_motorista','produto','nota','remetente','cidade_origem','destinatario','cidade_destino','pagador','custo_viagem','quantidade','valor','valor_total','condicao','forma_recebimento','data_vencimento','data_baixa','status'],
  despesas: ['data','mes','movimentacao','tipo','placa','fornecedor','valor','empresa','forma_pagamento','nota'],
}

function verifyToken(req) {
  const auth = req.headers.authorization || ''
  const token = auth.replace('Bearer ', '').trim()
  if (!token) throw new Error('Não autenticado')
  const secret = process.env.JWT_SECRET || 'transparisi_secret_2025'
  return jwt.verify(token, secret)
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.status(200).end()

  try {
    verifyToken(req)
  } catch {
    return res.status(401).json({ error: 'Token inválido ou expirado. Faça login novamente.' })
  }

  const table = req.query.table
  if (!ALLOWED_TABLES.includes(table)) {
    return res.status(400).json({ error: 'Tabela inválida' })
  }

  const pool = createPool({ connectionString: process.env.POSTGRES_URL })

  try {
    // ── GET: buscar todos os registros ─────────────────────────
    if (req.method === 'GET') {
      const { rows } = await pool.query(
        `SELECT * FROM ${table} ORDER BY created_at DESC LIMIT 5000`
      )
      return res.status(200).json({ data: rows })
    }

    // ── POST: inserir um ou vários registros ───────────────────
    if (req.method === 'POST') {
      const body = req.body
      const rows = Array.isArray(body) ? body : [body]
      const allowedCols = TABLE_COLS[table]
      let inserted = 0

      for (const row of rows) {
        // Filtra apenas colunas permitidas e não-nulas
        const keys = Object.keys(row).filter(k =>
          allowedCols.includes(k) &&
          row[k] !== null &&
          row[k] !== undefined &&
          row[k] !== ''
        )
        if (keys.length === 0) continue

        const values = keys.map(k => row[k])
        const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ')
        const colNames = keys.join(', ')

        await pool.query(
          `INSERT INTO ${table} (${colNames}) VALUES (${placeholders})`,
          values
        )
        inserted++
      }

      return res.status(200).json({ inserted })
    }

    return res.status(405).json({ error: 'Método não permitido' })

  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err.message })
  } finally {
    await pool.end()
  }
}
