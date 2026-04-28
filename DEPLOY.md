# 🚀 Transparisi BI — Guia de Deploy Gratuito

## Stack utilizada
- **Frontend**: React + Vite → hospedado no **Vercel** (grátis)
- **Banco de dados + Auth**: **Supabase** (grátis, PostgreSQL)
- **Processamento de Excel**: SheetJS (client-side, sem servidor)

---

## PASSO 1 — Criar o banco de dados no Supabase (5 min)

1. Acesse **https://supabase.com** e crie uma conta
2. Clique em **"New Project"** → dê um nome (ex: `transparisi`) → escolha região `South America (São Paulo)`
3. Aguarde o projeto criar (~2 min)
4. Vá em **SQL Editor** → **New Query** → cole e execute o SQL abaixo:

```sql
-- Tabela de Operações de Produto
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

-- Tabela de Operações de Serviço
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

-- Tabela de Despesas
CREATE TABLE despesas (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  data DATE, movimentacao TEXT, tipo TEXT, placa TEXT,
  fornecedor TEXT, valor NUMERIC, empresa TEXT,
  forma_pagamento TEXT, nota TEXT
);

-- Ativar segurança por linha (RLS)
ALTER TABLE operacoes_produto ENABLE ROW LEVEL SECURITY;
ALTER TABLE operacoes_servico ENABLE ROW LEVEL SECURITY;
ALTER TABLE despesas ENABLE ROW LEVEL SECURITY;

-- Política: apenas usuários autenticados podem acessar
CREATE POLICY "auth_only" ON operacoes_produto FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_only" ON operacoes_servico FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_only" ON despesas FOR ALL USING (auth.role() = 'authenticated');
```

5. No painel esquerdo, vá em **Authentication → Users** → clique **"Add user"**
   → Cadastre o email e senha de cada sócio

6. Pegue suas credenciais em **Settings → API**:
   - Copie o **Project URL** (ex: https://abcdef.supabase.co)
   - Copie o **anon public** key

---

## PASSO 2 — Configurar o projeto (2 min)

1. Copie o arquivo `.env.example` para `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edite o `.env` com suas credenciais do Supabase:
   ```
   VITE_SUPABASE_URL=https://SEU_PROJETO.supabase.co
   VITE_SUPABASE_ANON_KEY=sua_chave_anon_aqui
   ```

3. Instale as dependências:
   ```bash
   npm install
   ```

4. Teste localmente:
   ```bash
   npm run dev
   ```
   → Acesse http://localhost:5173 e faça login com o usuário criado no Supabase

---

## PASSO 3 — Deploy no Vercel (3 min, grátis para sempre)

### Opção A — Via GitHub (recomendado)
1. Crie uma conta em **https://github.com** e faça upload desta pasta
2. Acesse **https://vercel.com** → **"New Project"** → conecte seu GitHub
3. Selecione o repositório `transparisi-bi`
4. Em **Environment Variables**, adicione:
   - `VITE_SUPABASE_URL` = sua URL
   - `VITE_SUPABASE_ANON_KEY` = sua chave
5. Clique **Deploy** → em ~2 minutos o site estará online!

### Opção B — Via Vercel CLI (sem GitHub)
```bash
npm install -g vercel
vercel login
vercel --prod
```
→ Siga as instruções e adicione as variáveis de ambiente quando solicitado

---

## RESULTADO FINAL

- **URL do site**: `https://transparisi-bi.vercel.app` (ou similar)
- **Login**: com os emails/senhas criados no Supabase
- **Custo**: R$ 0,00 (Vercel Free + Supabase Free)

### Limites do plano gratuito
| Serviço | Limite Gratuito |
|---------|----------------|
| Vercel  | 100GB bandwidth/mês, projetos ilimitados |
| Supabase | 500MB banco, 1GB storage, 50k requisições/dia |

Para a Transparisi, esses limites são mais que suficientes.

---

## IMPORTAR DADOS HISTÓRICOS

1. Faça login no site
2. Vá em **Lançar Dados**
3. Clique em **"Importar planilha Excel"**
4. Selecione o arquivo `Transparisi_BI_v2.xlsm`
5. O sistema importa automaticamente todas as abas

---

## COMO ADICIONAR UM NOVO SÓCIO

1. Acesse https://supabase.com → seu projeto
2. Authentication → Users → Add user
3. Informe email e senha ao novo sócio
4. Pronto — ele já consegue acessar o site

---

## SUPORTE

- Documentação Supabase: https://supabase.com/docs
- Documentação Vercel: https://vercel.com/docs
- Dúvidas sobre este projeto: consulte seu suporte técnico
