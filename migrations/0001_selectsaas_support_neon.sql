CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$ BEGIN CREATE TYPE app_user_role AS ENUM ('admin', 'user'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE support_ticket_status AS ENUM ('open', 'in_progress', 'answered', 'resolved', 'closed'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE support_ticket_priority AS ENUM ('low', 'medium', 'high', 'urgent'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE support_message_author_type AS ENUM ('user', 'admin', 'ai'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE contact_message_status AS ENUM ('new', 'read', 'in_progress', 'resolved'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE knowledge_status AS ENUM ('draft', 'active', 'archived'); EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TABLE IF NOT EXISTS app_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  role app_user_role NOT NULL DEFAULT 'user',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS app_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL DEFAULT 'Geral',
  priority support_ticket_priority NOT NULL DEFAULT 'medium',
  status support_ticket_status NOT NULL DEFAULT 'open',
  closed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT support_tickets_closed_at_check CHECK (
    (status IN ('resolved', 'closed') AND closed_at IS NOT NULL) OR
    (status NOT IN ('resolved', 'closed')) OR
    closed_at IS NULL
  )
);

CREATE TABLE IF NOT EXISTS support_ticket_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  user_id uuid REFERENCES app_users(id) ON DELETE SET NULL,
  author_type support_message_author_type NOT NULL DEFAULT 'user',
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS support_knowledge_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  category text NOT NULL DEFAULT 'Geral',
  status knowledge_status NOT NULL DEFAULT 'active',
  created_by uuid REFERENCES app_users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS support_ai_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  question text NOT NULL,
  answer text NOT NULL,
  safe_metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  company text,
  product_slug text,
  subject text,
  message text NOT NULL DEFAULT '',
  status contact_message_status NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS support_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS app_sessions_user_id_idx ON app_sessions(user_id);
CREATE INDEX IF NOT EXISTS app_sessions_expires_at_idx ON app_sessions(expires_at);
CREATE INDEX IF NOT EXISTS support_tickets_user_id_idx ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS support_tickets_status_idx ON support_tickets(status);
CREATE INDEX IF NOT EXISTS support_tickets_created_at_idx ON support_tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS support_ticket_messages_ticket_id_idx ON support_ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS support_ai_conversations_user_id_idx ON support_ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS contact_messages_status_idx ON contact_messages(status);
CREATE INDEX IF NOT EXISTS contact_messages_created_at_idx ON contact_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS support_knowledge_articles_status_idx ON support_knowledge_articles(status);

DROP TRIGGER IF EXISTS set_app_users_updated_at ON app_users;
CREATE TRIGGER set_app_users_updated_at BEFORE UPDATE ON app_users FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS set_support_tickets_updated_at ON support_tickets;
CREATE TRIGGER set_support_tickets_updated_at BEFORE UPDATE ON support_tickets FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS set_contact_messages_updated_at ON contact_messages;
CREATE TRIGGER set_contact_messages_updated_at BEFORE UPDATE ON contact_messages FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS set_support_knowledge_articles_updated_at ON support_knowledge_articles;
CREATE TRIGGER set_support_knowledge_articles_updated_at BEFORE UPDATE ON support_knowledge_articles FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS set_support_settings_updated_at ON support_settings;
CREATE TRIGGER set_support_settings_updated_at BEFORE UPDATE ON support_settings FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Remova sessões expiradas periodicamente se desejar:
-- DELETE FROM app_sessions WHERE expires_at < now();

-- Para tornar um usuário administrador manualmente, após cadastro:
-- UPDATE app_users SET role = 'admin' WHERE email = 'admin@seudominio.com';
