import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(url, key)

/* ─── SQL para rodar no Supabase SQL Editor ────────────────────────────
   Cole isso em: supabase.com > seu projeto > SQL Editor > New Query

CREATE TABLE operacoes_produto (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  nova TEXT, id_viagem TEXT, data DATE, mes TEXT,
  movimentacao TEXT, placa TEXT, motorista TEXT, produto TEXT,
  fornecedor TEXT, tipo_venda TEXT, nota TEXT, cliente TEXT,
  cidade TEXT, tipo_custo TEXT, quantidade NUMERIC,
  valor_unitario NUMERIC, valor_total NUMERIC,
  condicao TEXT, forma_recebimento TEXT,
  data_vencimento DATE, data_baixa DATE, status TEXT, obs TEXT
);

CREATE TABLE operacoes_servico (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  nova TEXT, id_viagem TEXT, data DATE, mes TEXT,
  movimentacao TEXT, placa TEXT, placa_carreta TEXT,
  km_rodado NUMERIC, motorista TEXT, tipo_motorista TEXT,
  produto TEXT, nota TEXT, remetente TEXT, cidade_origem TEXT,
  destinatario TEXT, cidade_destino TEXT, pagador TEXT,
  custo_viagem TEXT, quantidade NUMERIC, valor NUMERIC,
  valor_total NUMERIC, condicao TEXT, forma_recebimento TEXT,
  data_vencimento DATE, data_baixa DATE, status TEXT
);

CREATE TABLE despesas (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  data DATE, movimentacao TEXT, tipo TEXT, placa TEXT,
  fornecedor TEXT, valor NUMERIC, empresa TEXT,
  forma_pagamento TEXT, nota TEXT
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE operacoes_produto ENABLE ROW LEVEL SECURITY;
ALTER TABLE operacoes_servico ENABLE ROW LEVEL SECURITY;
ALTER TABLE despesas ENABLE ROW LEVEL SECURITY;

-- Política: somente usuários autenticados podem ler/escrever
CREATE POLICY "auth_only" ON operacoes_produto FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_only" ON operacoes_servico FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_only" ON despesas FOR ALL USING (auth.role() = 'authenticated');
─────────────────────────────────────────────────────────────────────── */
