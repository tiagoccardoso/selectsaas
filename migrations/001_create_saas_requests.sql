-- ============================================================
-- Migration 001 — Tabela de solicitações de SaaS personalizado
-- Execute no painel do Neon ou via psql com DATABASE_URL
-- ============================================================

-- Habilita extensão para UUID (disponível por padrão no Neon)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Função utilitária para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Tabela principal
CREATE TABLE IF NOT EXISTS saas_requests (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Dados de contato
  nome_completo    TEXT        NOT NULL,
  nome_empresa     TEXT        NOT NULL,
  email            TEXT        NOT NULL,
  telefone         TEXT        NOT NULL,
  cidade_estado    TEXT,

  -- Sobre o negócio
  segmento         TEXT        NOT NULL,
  tamanho_empresa  TEXT,
  qtd_usuarios     TEXT,
  problemas_resolver TEXT      NOT NULL,

  -- Sobre o SaaS desejado
  descricao_ideia  TEXT        NOT NULL,
  funcionalidades  TEXT,
  processos_automatizar TEXT,
  perfis_usuarios  TEXT,
  precisa_area_admin   TEXT,
  precisa_login        TEXT,
  precisa_pagamentos   TEXT,
  precisa_relatorios   TEXT,
  precisa_upload       TEXT,
  precisa_integracoes  TEXT,
  precisa_mobile       TEXT,

  -- Prazo e orçamento
  prazo_desejado   TEXT,
  faixa_orcamento  TEXT,
  observacoes      TEXT,

  -- Campos administrativos
  status           TEXT        NOT NULL DEFAULT 'novo'
                     CHECK (status IN (
                       'novo','em_analise','em_contato',
                       'proposta_enviada','em_desenvolvimento',
                       'concluido','cancelado'
                     )),
  prioridade       TEXT        NOT NULL DEFAULT 'normal'
                     CHECK (prioridade IN ('baixa','normal','alta','urgente')),
  observacoes_internas TEXT,
  responsavel      TEXT,

  -- Timestamps
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para consultas administrativas
CREATE INDEX IF NOT EXISTS idx_saas_requests_status
  ON saas_requests(status);

CREATE INDEX IF NOT EXISTS idx_saas_requests_prioridade
  ON saas_requests(prioridade);

CREATE INDEX IF NOT EXISTS idx_saas_requests_created_at
  ON saas_requests(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_saas_requests_email
  ON saas_requests(email);

-- Trigger para updated_at automático
DROP TRIGGER IF EXISTS trg_saas_requests_updated_at ON saas_requests;
CREATE TRIGGER trg_saas_requests_updated_at
  BEFORE UPDATE ON saas_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comentários das colunas para documentação
COMMENT ON TABLE saas_requests IS
  'Solicitações de desenvolvimento de SaaS personalizado enviadas pelo formulário público.';
COMMENT ON COLUMN saas_requests.status IS
  'novo | em_analise | em_contato | proposta_enviada | em_desenvolvimento | concluido | cancelado';
COMMENT ON COLUMN saas_requests.prioridade IS
  'baixa | normal | alta | urgente';
